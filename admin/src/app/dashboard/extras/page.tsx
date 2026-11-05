"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Trash2, ImageIcon, AlertCircle, CheckCircle2, Eye, EyeOff, Plus, X } from "lucide-react";
import Image from "next/image";

interface MediaItem { name: string; url: string; }
interface ExtraType  { key: string; label: string; emoji: string; color: string; active: boolean; }

const PRESET_COLORS = ["#F59E0B","#8B5CF6","#10B981","#EC4899","#3B82F6","#EF4444","#F97316","#06B6D4","#84CC16","#6366F1"];
const PRESET_EMOJIS = ["🕯️","🎈","🎴","🎁","✨","🌸","🎀","🍬","🎊","🌟","🦋","💐","🎶","🎂","🧁"];

export default function ExtrasPage() {
  const [types,       setTypes]       = useState<ExtraType[]>([]);
  const [activeKey,   setActiveKey]   = useState<string>("");
  const [items,       setItems]       = useState<MediaItem[]>([]);
  const [hidden,      setHidden]      = useState<Set<string>>(new Set());
  const [loading,     setLoading]     = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [toggling,    setToggling]    = useState<string | null>(null);
  const [dragging,    setDragging]    = useState(false);
  const [toast,       setToast]       = useState<{ msg: string; ok: boolean } | null>(null);
  const [showAdd,     setShowAdd]     = useState(false);
  const [newLabel,    setNewLabel]    = useState("");
  const [newEmoji,    setNewEmoji]    = useState("🎁");
  const [newColor,    setNewColor]    = useState("#EC4899");
  const [addSaving,   setAddSaving]   = useState(false);
  const [confirmDel,  setConfirmDel]  = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tab = types.find(t => t.key === activeKey);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  // Load type list
  useEffect(() => {
    fetch("/api/extras-types")
      .then(r => r.json())
      .then((data: ExtraType[]) => {
        if (Array.isArray(data)) {
          setTypes(data);
          if (data.length && !activeKey) setActiveKey(data[0].key);
        }
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load images for active tab
  const loadItems = useCallback(() => {
    if (!activeKey) return;
    setLoading(true);
    Promise.all([
      fetch(`/api/extras/${activeKey}`).then(r => r.json()),
      fetch(`/api/extras-visibility?type=${activeKey}`).then(r => r.json()),
    ])
      .then(([data, vis]: [MediaItem[], { hidden: string[] }]) => {
        setItems(Array.isArray(data) ? data : []);
        setHidden(new Set(vis.hidden ?? []));
      })
      .finally(() => setLoading(false));
  }, [activeKey]);

  useEffect(() => { loadItems(); }, [loadItems]);

  async function uploadFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!fileArr.length) { showToast("Please select image files only.", false); return; }
    setUploading(true);
    const fd = new FormData();
    fileArr.forEach(f => fd.append("files", f));
    const res  = await fetch(`/api/extras/${activeKey}`, { method: "POST", body: fd });
    const data = await res.json() as { uploaded: string[]; errors: string[] };
    if (data.errors?.length) showToast(`${data.uploaded.length} uploaded, ${data.errors.length} failed.`, false);
    else showToast(`${data.uploaded.length} image${data.uploaded.length !== 1 ? "s" : ""} uploaded.`, true);
    setUploading(false);
    loadItems();
  }

  async function deleteItem(name: string) {
    setDeleting(name);
    const res  = await fetch(`/api/extras/${activeKey}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (data.success) {
      setItems(prev => prev.filter(s => s.name !== name));
      setHidden(prev => { const n = new Set(prev); n.delete(name); return n; });
      showToast("Deleted.", true);
    } else showToast(data.error ?? "Delete failed.", false);
    setDeleting(null);
  }

  async function toggleImageVisibility(name: string) {
    setToggling(name);
    const res  = await fetch("/api/extras-visibility", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type: activeKey, name }),
    });
    const data = await res.json() as { hidden?: boolean; error?: string };
    if (typeof data.hidden === "boolean") {
      setHidden(prev => { const n = new Set(prev); data.hidden ? n.add(name) : n.delete(name); return n; });
      showToast(data.hidden ? "Hidden from customers." : "Now visible to customers.", true);
    } else showToast(data.error ?? "Failed.", false);
    setToggling(null);
  }

  async function toggleTypeActive(key: string) {
    const type = types.find(t => t.key === key);
    if (!type) return;
    const res = await fetch("/api/extras-types", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key, active: !type.active }),
    });
    const data = await res.json() as ExtraType;
    if (data.key) {
      setTypes(prev => prev.map(t => t.key === key ? { ...t, active: !t.active } : t));
      showToast(!type.active ? "Now visible to customers." : "Hidden from customers.", true);
    }
  }

  async function deleteType(key: string) {
    const res = await fetch("/api/extras-types", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ key }),
    });
    const data = await res.json();
    if (data.success) {
      setTypes(prev => prev.filter(t => t.key !== key));
      setConfirmDel(null);
      if (activeKey === key) {
        const remaining = types.filter(t => t.key !== key);
        setActiveKey(remaining[0]?.key ?? "");
      }
      showToast("Category deleted.", true);
    }
  }

  async function addType() {
    if (!newLabel.trim()) return;
    setAddSaving(true);
    const res = await fetch("/api/extras-types", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ label: newLabel.trim(), emoji: newEmoji, color: newColor }),
    });
    const data = await res.json() as ExtraType & { error?: string };
    if (data.error) { showToast(data.error, false); }
    else {
      setTypes(prev => [...prev, data]);
      setActiveKey(data.key);
      setShowAdd(false);
      setNewLabel("");
      setNewEmoji("🎁");
      setNewColor("#EC4899");
      showToast(`"${data.label}" category created.`, true);
    }
    setAddSaving(false);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  const visibleCount = items.filter(i => !hidden.has(i.name)).length;
  const hiddenCount  = items.filter(i =>  hidden.has(i.name)).length;

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#FDF0F3" }}>

      {/* Toast */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: toast.ok ? "#dcfce7" : "#fee2e2", color: toast.ok ? "#166534" : "#991b1b", border: `1px solid ${toast.ok ? "#86efac" : "#fca5a5"}` }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Add type modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color: "#2D000A" }}>New Extra Category</h2>
              <button onClick={() => setShowAdd(false)} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
                <X size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Name</label>
                <input
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="e.g. Sparklers, Ribbon…"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#800020]/30"
                  onKeyDown={e => e.key === "Enter" && addType()}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_EMOJIS.map(em => (
                    <button key={em} onClick={() => setNewEmoji(em)}
                      className="w-9 h-9 rounded-xl text-lg flex items-center justify-center transition-all"
                      style={{ background: newEmoji === em ? "#F5D0D8" : "#fdf6f8", border: `2px solid ${newEmoji === em ? "#800020" : "transparent"}` }}>
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Color</label>
                <div className="flex flex-wrap gap-2">
                  {PRESET_COLORS.map(c => (
                    <button key={c} onClick={() => setNewColor(c)}
                      className="w-8 h-8 rounded-full transition-all"
                      style={{ background: c, outline: newColor === c ? `3px solid ${c}` : "none", outlineOffset: 2 }} />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <button onClick={addType} disabled={addSaving || !newLabel.trim()}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity disabled:opacity-50"
                style={{ background: newColor }}>
                {addSaving ? "Creating…" : `${newEmoji} Create Category`}
              </button>
              <button onClick={() => setShowAdd(false)}
                className="px-4 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete type confirmation */}
      {confirmDel && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xs p-6 text-center">
            <p className="font-bold text-gray-900 mb-1">Delete this category?</p>
            <p className="text-xs text-gray-500 mb-5">Images in this category won't be deleted from storage, but the category will be removed.</p>
            <div className="flex gap-2">
              <button onClick={() => deleteType(confirmDel)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold bg-red-500 text-white hover:bg-red-600 transition-colors">
                Delete
              </button>
              <button onClick={() => setConfirmDel(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Extras Library</h1>
          <p className="text-sm mt-1" style={{ color: "#800020" }}>Manage extra categories and designs shown to customers</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "#800020" }}>
          <Plus size={15} />
          New Category
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap items-center">
        {types.map(t => (
          <div key={t.key} className="relative group">
            <button
              onClick={() => setActiveKey(t.key)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{
                background: activeKey === t.key ? t.color : "white",
                color:      activeKey === t.key ? "white" : "#2D000A",
                border:     `2px solid ${activeKey === t.key ? t.color : "#F5D0D8"}`,
                boxShadow:  activeKey === t.key ? `0 2px 12px ${t.color}40` : "none",
                opacity:    t.active ? 1 : 0.5,
              }}
            >
              <span>{t.emoji}</span>
              <span>{t.label}</span>
              {!t.active && <span className="text-[9px] font-bold border border-current rounded-full px-1.5 py-px opacity-70">HIDDEN</span>}
            </button>
          </div>
        ))}
      </div>

      {/* Panel */}
      {tab && (
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>

          {/* Panel header */}
          <div className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
            style={{ borderBottom: "1px solid #F5D0D8", background: `${tab.color}08` }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xl"
                style={{ background: `${tab.color}18` }}>
                {tab.emoji}
              </div>
              <div>
                <p className="font-bold text-base" style={{ color: "#2D000A" }}>{tab.label}</p>
                <p className="text-xs" style={{ color: "#800020" }}>
                  {visibleCount} active
                  {hiddenCount > 0 && <span className="ml-1 opacity-60">· {hiddenCount} hidden</span>}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Show/hide entire category */}
              <button onClick={() => toggleTypeActive(tab.key)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all"
                style={{
                  borderColor: tab.active ? "#d1d5db" : tab.color,
                  color:       tab.active ? "#6b7280" : tab.color,
                  background:  tab.active ? "transparent" : `${tab.color}10`,
                }}>
                {tab.active ? <><EyeOff size={13} /> Hide from customers</> : <><Eye size={13} /> Show to customers</>}
              </button>

              {/* Delete category */}
              <button onClick={() => setConfirmDel(tab.key)}
                className="p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
                title="Delete category">
                <Trash2 size={15} />
              </button>

              {/* Upload */}
              <button onClick={() => fileRef.current?.click()} disabled={uploading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                style={{ background: tab.color, color: "white", opacity: uploading ? 0.6 : 1 }}>
                <Upload size={14} />
                {uploading ? "Uploading…" : "Upload"}
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
                onChange={e => e.target.files && uploadFiles(e.target.files)} />
            </div>
          </div>

          {/* Drop zone + grid */}
          <div className="p-6">
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-all"
              style={{ borderColor: dragging ? tab.color : "#F5D0D8", background: dragging ? `${tab.color}08` : "#FDF0F3" }}>
              <Upload size={28} className="mx-auto mb-2" style={{ color: dragging ? tab.color : "#800020" }} />
              <p className="text-sm font-medium" style={{ color: "#2D000A" }}>Drop images here or click to browse</p>
              <p className="text-xs mt-1" style={{ color: "#800020" }}>PNG, JPG, WEBP — multiple files OK</p>
            </div>

            {loading ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: "#F5D0D8" }} />
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="text-center py-10">
                <ImageIcon size={36} className="mx-auto mb-3" style={{ color: "#F5D0D8" }} />
                <p className="text-sm" style={{ color: "#800020" }}>No designs yet</p>
                <p className="text-xs mt-1" style={{ color: "#800020", opacity: 0.6 }}>Upload the first one above.</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
                {items.map(item => {
                  const isHidden   = hidden.has(item.name);
                  const isToggling = toggling === item.name;
                  return (
                    <div key={item.name} className="group relative">
                      <div className="relative w-full rounded-xl overflow-hidden aspect-square transition-opacity"
                        style={{ border: "1px solid #F5D0D8", background: "#FDF0F3", opacity: isHidden ? 0.45 : 1 }}>
                        <Image src={item.url} alt={item.name} fill className="object-contain p-1" sizes="120px" unoptimized />
                        {isHidden && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-[9px] font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded-full">HIDDEN</span>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-end justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => toggleImageVisibility(item.name)} disabled={isToggling}
                            title={isHidden ? "Show" : "Hide"}
                            className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                            style={{ background: isHidden ? "#3B82F6" : "#6B7280", color: "white" }}>
                            {isToggling ? <span className="text-[9px] font-bold">…</span> : isHidden ? <Eye size={11} /> : <EyeOff size={11} />}
                          </button>
                          <button onClick={() => deleteItem(item.name)} disabled={deleting === item.name}
                            title="Delete" className="w-6 h-6 rounded-lg flex items-center justify-center"
                            style={{ background: "#ef4444", color: "white" }}>
                            {deleting === item.name ? <span className="text-[9px] font-bold">…</span> : <Trash2 size={11} />}
                          </button>
                        </div>
                      </div>
                      <p className="text-[9px] truncate mt-1 text-center" style={{ color: isHidden ? "#aaa" : "#800020" }} title={item.name}>
                        {item.name.replace(/^\d+-/, "")}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {types.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-400 text-sm">No categories yet — click "New Category" to add one.</p>
        </div>
      )}
    </div>
  );
}
