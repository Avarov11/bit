"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Save, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface PricingRow {
  key: string;
  label: string;
  price: number;
  sort: number;
  section: string;
}

const SECTION_META: Record<string, { label: string; color: string; bg: string; emoji: string }> = {
  shapes:  { label: "Shapes",  color: "#3B82F6", bg: "#EFF6FF", emoji: "🎂" },
  toppings:{ label: "Toppings",color: "#8B5CF6", bg: "#F5F3FF", emoji: "✨" },
  extras:  { label: "Extras",  color: "#10B981", bg: "#ECFDF5", emoji: "🎉" },
  custom:  { label: "Custom",  color: "#F59E0B", bg: "#FFFBEB", emoji: "⚙️" },
};

const SECTION_ORDER = ["shapes", "toppings", "extras", "custom"];

function getSection(s: string) {
  return SECTION_META[s] ?? SECTION_META.custom;
}

export default function PricingPage() {
  const [rows,    setRows]    = useState<PricingRow[]>([]);
  const [edits,   setEdits]   = useState<Record<string, { label: string; price: string }>>({});
  const [saving,  setSaving]  = useState<string | null>(null);
  const [deleting,setDeleting]= useState<string | null>(null);
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newItem, setNewItem] = useState({ label: "", price: "", section: "custom" });
  const [adding,  setAdding]  = useState(false);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(() => {
    fetch("/api/pricing")
      .then(r => r.json())
      .then((data: PricingRow[]) => {
        if (Array.isArray(data)) {
          setRows(data);
          const init: Record<string, { label: string; price: string }> = {};
          data.forEach(r => { init[r.key] = { label: r.label, price: String(r.price) }; });
          setEdits(init);
        }
      });
  }, []);

  useEffect(() => { load(); }, [load]);

  async function save(key: string) {
    const e = edits[key];
    if (!e) return;
    const price = parseFloat(e.price);
    if (isNaN(price) || price < 0) { showToast("Enter a valid price.", false); return; }
    setSaving(key);
    const res  = await fetch("/api/pricing", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, label: e.label, price }),
    });
    const data = await res.json();
    if (res.ok) {
      setRows(prev => prev.map(r => r.key === key ? { ...r, label: e.label, price } : r));
      showToast("Saved.", true);
    } else {
      showToast(data.error ?? "Failed to save.", false);
    }
    setSaving(null);
  }

  async function deleteRow(key: string) {
    if (!confirm("Delete this pricing item?")) return;
    setDeleting(key);
    const res  = await fetch("/api/pricing", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (res.ok) {
      setRows(prev => prev.filter(r => r.key !== key));
      showToast("Deleted.", true);
    } else {
      showToast(data.error ?? "Failed.", false);
    }
    setDeleting(null);
  }

  async function addItem() {
    const price = parseFloat(newItem.price);
    if (!newItem.label.trim()) { showToast("Enter a label.", false); return; }
    if (isNaN(price) || price < 0)  { showToast("Enter a valid price.", false); return; }
    setAdding(true);
    const res  = await fetch("/api/pricing", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newItem.label.trim(), price, section: newItem.section }),
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Added.", true);
      setNewItem({ label: "", price: "", section: "custom" });
      setShowAdd(false);
      load();
    } else {
      showToast(data.error ?? "Failed.", false);
    }
    setAdding(false);
  }

  const grouped = SECTION_ORDER.reduce<Record<string, PricingRow[]>>((acc, s) => {
    acc[s] = rows.filter(r => r.section === s);
    return acc;
  }, {});
  // also catch any section not in SECTION_ORDER
  rows.forEach(r => {
    if (!SECTION_ORDER.includes(r.section)) {
      grouped.custom = [...(grouped.custom ?? []), r];
    }
  });

  const isDirty = (key: string) => {
    const row = rows.find(r => r.key === key);
    const e   = edits[key];
    if (!row || !e) return false;
    return e.label !== row.label || parseFloat(e.price) !== row.price;
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pricing</h1>
          <p className="text-sm text-gray-400 mt-0.5">Set prices for shapes, toppings, and extras</p>
        </div>
        <button
          onClick={() => setShowAdd(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "#800020" }}
        >
          <Plus size={15} />
          Add item
        </button>
      </div>

      {/* Add new item form */}
      {showAdd && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-4">
          <h2 className="text-sm font-bold text-gray-700">New pricing item</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Label</label>
              <input
                type="text"
                value={newItem.label}
                onChange={e => setNewItem(p => ({ ...p, label: e.target.value }))}
                placeholder="e.g. Flowers"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Price (QAR)</label>
              <input
                type="number"
                min={0}
                step={0.5}
                value={newItem.price}
                onChange={e => setNewItem(p => ({ ...p, price: e.target.value }))}
                placeholder="0"
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 mb-1 block">Group</label>
              <select
                value={newItem.section}
                onChange={e => setNewItem(p => ({ ...p, section: e.target.value }))}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/20"
              >
                {SECTION_ORDER.map(s => (
                  <option key={s} value={s}>{getSection(s).emoji} {getSection(s).label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-2 pt-1">
            <button
              onClick={addItem}
              disabled={adding}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white disabled:opacity-50 transition-colors"
              style={{ background: "#800020" }}
            >
              {adding ? "Adding…" : "Add"}
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewItem({ label: "", price: "", section: "custom" }); }}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-500 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Sections */}
      {SECTION_ORDER.map(sectionKey => {
        const sectionRows = grouped[sectionKey] ?? [];
        if (sectionRows.length === 0) return null;
        const meta = getSection(sectionKey);
        return (
          <div key={sectionKey} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-50" style={{ background: meta.bg }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base" style={{ background: `${meta.color}18` }}>
                {meta.emoji}
              </div>
              <div>
                <h2 className="text-sm font-bold text-gray-900">{meta.label}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{sectionRows.length} item{sectionRows.length !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Rows */}
            <div className="divide-y divide-gray-50">
              {sectionRows.map(row => {
                const e = edits[row.key] ?? { label: row.label, price: String(row.price) };
                const dirty = isDirty(row.key);
                const isCustom = row.key.startsWith("custom_");
                return (
                  <div key={row.key} className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50/50 transition-colors">
                    {/* Label */}
                    <div className="flex-1 min-w-0">
                      <input
                        type="text"
                        value={e.label}
                        onChange={ev => setEdits(p => ({ ...p, [row.key]: { ...e, label: ev.target.value } }))}
                        className="w-full text-sm font-medium text-gray-800 bg-transparent focus:outline-none focus:bg-white focus:ring-1 focus:ring-gray-200 rounded px-1 py-0.5 -ml-1 transition-all"
                      />
                      <p className="text-[10px] text-gray-300 mt-0.5 pl-1 font-mono">{row.key}</p>
                    </div>

                    {/* Price input */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-xs text-gray-400 font-medium">QAR</span>
                      <input
                        type="number"
                        min={0}
                        step={0.5}
                        value={e.price}
                        onChange={ev => setEdits(p => ({ ...p, [row.key]: { ...e, price: ev.target.value } }))}
                        className="w-20 text-sm font-bold text-gray-900 text-right border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#800020]/20 tabular-nums"
                      />
                    </div>

                    {/* Save button */}
                    <button
                      onClick={() => save(row.key)}
                      disabled={!dirty || saving === row.key}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-30 shrink-0"
                      style={{
                        background: dirty ? "#800020" : "#f1f5f9",
                        color:      dirty ? "white"   : "#94a3b8",
                      }}
                    >
                      {saving === row.key
                        ? <span className="w-3 h-3 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        : <Save size={11} />
                      }
                      Save
                    </button>

                    {/* Delete (custom only) */}
                    {isCustom && (
                      <button
                        onClick={() => deleteRow(row.key)}
                        disabled={deleting === row.key}
                        className="w-7 h-7 flex items-center justify-center rounded-lg transition-colors hover:bg-red-50 shrink-0"
                      >
                        {deleting === row.key
                          ? <span className="text-[9px] text-red-400">…</span>
                          : <Trash2 size={13} className="text-red-400" />
                        }
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
