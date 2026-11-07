"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Tag } from "lucide-react";

interface DiscountCode {
  id:         string;
  code:       string;
  type:       "fixed" | "percentage";
  value:      number;
  active:     boolean;
  created_at: string;
}

export default function DiscountsPage() {
  const [codes,   setCodes]   = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);
  const [toast,   setToast]   = useState<{ msg: string; ok: boolean } | null>(null);
  const [form,    setForm]    = useState({ code: "", type: "fixed" as "fixed" | "percentage", value: "" });

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const load = useCallback(async () => {
    const res  = await fetch("/api/discounts");
    const data = await res.json();
    if (Array.isArray(data)) setCodes(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function create() {
    if (!form.code.trim() || !form.value) return showToast("Please fill all fields", false);
    const val = Number(form.value);
    if (isNaN(val) || val <= 0) return showToast("Value must be a positive number", false);
    if (form.type === "percentage" && val > 100) return showToast("Percentage can't exceed 100", false);

    setSaving(true);
    const res = await fetch("/api/discounts", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ code: form.code, type: form.type, value: val }),
    });
    const data = await res.json();
    setSaving(false);
    if (!res.ok) return showToast(data.error ?? "Failed to create", false);
    showToast("Code created!", true);
    setForm({ code: "", type: "fixed", value: "" });
    load();
  }

  async function toggle(id: string, active: boolean) {
    await fetch("/api/discounts", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id, active: !active }),
    });
    setCodes(prev => prev.map(c => c.id === id ? { ...c, active: !active } : c));
  }

  async function remove(id: string, code: string) {
    if (!confirm(`Delete code "${code}"?`)) return;
    await fetch("/api/discounts", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id }),
    });
    setCodes(prev => prev.filter(c => c.id !== id));
    showToast("Code deleted", true);
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">

      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg flex items-center gap-2 ${toast.ok ? "bg-emerald-500" : "bg-red-500"}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Discount Codes</h1>
        <p className="text-sm text-gray-500 mt-1">Create codes customers can apply at checkout</p>
      </div>

      {/* Create form */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={16} className="text-[#800020]" /> New Discount Code
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
          {/* Code */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Code</label>
            <input
              type="text"
              placeholder="e.g. SAVE20"
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] font-mono"
            />
          </div>

          {/* Type */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">Type</label>
            <select
              value={form.type}
              onChange={e => setForm(f => ({ ...f, type: e.target.value as "fixed" | "percentage" }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020] bg-white"
            >
              <option value="fixed">Fixed amount (QAR)</option>
              <option value="percentage">Percentage (%)</option>
            </select>
          </div>

          {/* Value */}
          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
              {form.type === "fixed" ? "Amount (QAR)" : "Percentage (%)"}
            </label>
            <input
              type="number"
              min="1"
              max={form.type === "percentage" ? "100" : undefined}
              placeholder={form.type === "fixed" ? "e.g. 50" : "e.g. 10"}
              value={form.value}
              onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#800020]"
            />
          </div>
        </div>

        <button
          onClick={create}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: saving ? "#ccc" : "linear-gradient(135deg,#800020,#c0416a)" }}
        >
          <Plus size={15} />
          {saving ? "Creating…" : "Create Code"}
        </button>
      </div>

      {/* Codes list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <Tag size={15} className="text-[#800020]" />
          <h2 className="font-semibold text-gray-800">All Codes</h2>
          <span className="ml-auto text-xs text-gray-400">{codes.length} total</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-[#800020]/30 border-t-[#800020] rounded-full animate-spin" />
          </div>
        ) : codes.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">No codes yet</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {codes.map(c => (
              <div key={c.id} className="px-6 py-4 flex items-center gap-4">
                {/* Code pill */}
                <span className="font-mono text-sm font-bold text-[#800020] bg-[#800020]/8 px-3 py-1 rounded-lg min-w-0 truncate">
                  {c.code}
                </span>

                {/* Discount value */}
                <span className="text-sm font-semibold text-gray-700 shrink-0">
                  {c.type === "fixed" ? `QAR ${c.value} off` : `${c.value}% off`}
                </span>

                {/* Status badge */}
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${c.active ? "bg-emerald-50 text-emerald-700" : "bg-gray-100 text-gray-400"}`}>
                  {c.active ? "Active" : "Inactive"}
                </span>

                <div className="ml-auto flex items-center gap-2">
                  {/* Toggle */}
                  <button
                    onClick={() => toggle(c.id, c.active)}
                    className="p-1.5 rounded-lg hover:bg-gray-50 transition-colors"
                    title={c.active ? "Deactivate" : "Activate"}
                  >
                    {c.active
                      ? <ToggleRight size={20} className="text-emerald-500" />
                      : <ToggleLeft  size={20} className="text-gray-300" />}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => remove(c.id, c.code)}
                    className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={15} className="text-gray-300 hover:text-red-500 transition-colors" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
