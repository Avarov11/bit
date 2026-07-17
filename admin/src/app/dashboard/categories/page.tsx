"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Check, AlertCircle, CheckCircle2, FolderTree, ChevronRight } from "lucide-react";

interface Category {
  id: string;
  name: string;
  parent: string | null;
  sort_order: number;
  is_active: boolean;
  badge_bg: string;
  badge_text: string;
  filter_mode: "direct" | "as_subcategory";
}

type Toast = { msg: string; ok: boolean } | null;

const EMPTY_FORM = {
  name: "",
  parent: "",
  badge_bg: "#F5D0D8",
  badge_text: "#800020",
  filter_mode: "direct" as "direct" | "as_subcategory",
};

export default function CategoriesPage() {
  const [categories, setCategories]   = useState<Category[]>([]);
  const [loading,    setLoading]      = useState(true);
  const [toast,      setToast]        = useState<Toast>(null);
  const [modal,      setModal]        = useState<"add" | "edit" | null>(null);
  const [editTarget, setEditTarget]   = useState<Category | null>(null);
  const [form,       setForm]         = useState(EMPTY_FORM);
  const [saving,     setSaving]       = useState(false);
  const [deleting,   setDeleting]     = useState<string | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  async function load() {
    setLoading(true);
    const res  = await fetch("/api/categories");
    const data = await res.json() as Category[];
    setCategories(Array.isArray(data) ? data : []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openAdd(parentName?: string) {
    setForm({ ...EMPTY_FORM, parent: parentName ?? "" });
    setEditTarget(null);
    setModal("add");
  }

  function openEdit(cat: Category) {
    setForm({
      name:        cat.name,
      parent:      cat.parent ?? "",
      badge_bg:    cat.badge_bg,
      badge_text:  cat.badge_text,
      filter_mode: cat.filter_mode,
    });
    setEditTarget(cat);
    setModal("edit");
  }

  async function save() {
    if (!form.name.trim()) { showToast("Name is required.", false); return; }
    setSaving(true);

    if (modal === "add") {
      const res  = await fetch("/api/categories", {
        method:  "POST",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          name:        form.name.trim(),
          parent:      form.parent || null,
          badge_bg:    form.badge_bg,
          badge_text:  form.badge_text,
          filter_mode: form.filter_mode,
        }),
      });
      const data = await res.json() as { error?: string };
      if (data.error) showToast(data.error, false);
      else { showToast("Category added.", true); setModal(null); load(); }
    } else if (modal === "edit" && editTarget) {
      const res  = await fetch("/api/categories", {
        method:  "PATCH",
        headers: { "Content-Type": "application/json" },
        body:    JSON.stringify({
          id:          editTarget.id,
          name:        form.name.trim(),
          parent:      form.parent || null,
          badge_bg:    form.badge_bg,
          badge_text:  form.badge_text,
          filter_mode: form.filter_mode,
        }),
      });
      const data = await res.json() as { error?: string };
      if (data.error) showToast(data.error, false);
      else { showToast("Category updated.", true); setModal(null); load(); }
    }
    setSaving(false);
  }

  async function toggleActive(cat: Category) {
    await fetch("/api/categories", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: cat.id, is_active: !cat.is_active }),
    });
    setCategories(prev => prev.map(c => c.id === cat.id ? { ...c, is_active: !c.is_active } : c));
    showToast(cat.is_active ? "Hidden from customers." : "Published to customers.", true);
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Delete "${cat.name}"? This cannot be undone.`)) return;
    setDeleting(cat.id);
    const res  = await fetch("/api/categories", {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ id: cat.id }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (data.success) { setCategories(prev => prev.filter(c => c.id !== cat.id)); showToast("Deleted.", true); }
    else showToast(data.error ?? "Delete failed.", false);
    setDeleting(null);
  }

  const topLevel  = categories.filter(c => !c.parent);
  const childrenOf = (name: string) => categories.filter(c => c.parent === name);

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

      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Categories</h1>
          <p className="text-sm mt-1" style={{ color: "#800020" }}>
            Manage menu categories and subcategories — active ones appear on the customer site immediately
          </p>
        </div>
        <button
          onClick={() => openAdd()}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
          style={{ background: "#800020" }}
        >
          <Plus size={15} />
          Add Category
        </button>
      </div>

      {/* Category tree */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl animate-pulse" style={{ background: "#F5D0D8" }} />
          ))}
        </div>
      ) : topLevel.length === 0 ? (
        <div className="text-center py-20">
          <FolderTree size={40} className="mx-auto mb-3" style={{ color: "#F5D0D8" }} />
          <p className="text-sm" style={{ color: "#800020" }}>No categories yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {topLevel.map(cat => {
            const subs = childrenOf(cat.name);
            return (
              <div key={cat.id} className="rounded-2xl overflow-hidden"
                style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 12px rgba(45,0,10,0.05)" }}>

                {/* Parent row */}
                <div className="flex items-center gap-3 px-5 py-4" style={{ borderBottom: subs.length > 0 ? "1px solid #F5D0D8" : "none" }}>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold shrink-0"
                    style={{ background: cat.badge_bg, color: cat.badge_text }}>
                    {cat.name}
                  </span>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ background: cat.is_active ? "#dcfce7" : "#fee2e2", color: cat.is_active ? "#166534" : "#991b1b" }}>
                    {cat.is_active ? "Published" : "Hidden"}
                  </span>
                  <span className="text-xs" style={{ color: "#800020", opacity: 0.5 }}>
                    {subs.length} sub{subs.length !== 1 ? "s" : ""}
                  </span>

                  <div className="ml-auto flex items-center gap-1.5">
                    <button onClick={() => openAdd(cat.name)} title="Add subcategory"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FDF0F3]"
                      style={{ color: "#800020" }}>
                      <Plus size={14} />
                    </button>
                    <button onClick={() => openEdit(cat)} title="Edit"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FDF0F3]"
                      style={{ color: "#800020" }}>
                      <Edit2 size={14} />
                    </button>
                    <button onClick={() => toggleActive(cat)} title={cat.is_active ? "Hide" : "Publish"}
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FDF0F3]"
                      style={{ color: "#800020" }}>
                      {cat.is_active ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button onClick={() => deleteCategory(cat)} disabled={deleting === cat.id} title="Delete"
                      className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                      style={{ color: deleting === cat.id ? "#ccc" : "#ef4444" }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Subcategory rows */}
                {subs.map((sub, idx) => (
                  <div key={sub.id} className="flex items-center gap-3 px-5 py-3 pl-10"
                    style={{ borderBottom: idx < subs.length - 1 ? "1px solid #FDF0F3" : "none", background: "#FDFAFA" }}>
                    <ChevronRight size={12} style={{ color: "#ccc", shrink: 0 }} />
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold shrink-0"
                      style={{ background: sub.badge_bg, color: sub.badge_text }}>
                      {sub.name}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full"
                      style={{ background: sub.is_active ? "#dcfce7" : "#fee2e2", color: sub.is_active ? "#166534" : "#991b1b" }}>
                      {sub.is_active ? "Published" : "Hidden"}
                    </span>
                    <span className="text-[10px]" style={{ color: "#800020", opacity: 0.45 }}>
                      {sub.filter_mode === "as_subcategory" ? "subcategory field" : "category field"}
                    </span>

                    <div className="ml-auto flex items-center gap-1">
                      <button onClick={() => openEdit(sub)} title="Edit"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FDF0F3]"
                        style={{ color: "#800020" }}>
                        <Edit2 size={12} />
                      </button>
                      <button onClick={() => toggleActive(sub)} title={sub.is_active ? "Hide" : "Publish"}
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-[#FDF0F3]"
                        style={{ color: "#800020" }}>
                        {sub.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                      </button>
                      <button onClick={() => deleteCategory(sub)} disabled={deleting === sub.id} title="Delete"
                        className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                        style={{ color: deleting === sub.id ? "#ccc" : "#ef4444" }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.45)" }}>
          <div className="w-full max-w-md rounded-2xl p-6" style={{ background: "white", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-lg" style={{ color: "#2D000A" }}>
                {modal === "add" ? (form.parent ? `Add subcategory under ${form.parent}` : "Add category") : `Edit "${editTarget?.name}"`}
              </h2>
              <button onClick={() => setModal(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-[#FDF0F3]"
                style={{ color: "#800020" }}>
                <X size={16} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Name *</label>
                <input
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. Valentine's Day"
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none focus:ring-2"
                  style={{ border: "1px solid #F5D0D8", background: "#FDF0F3", color: "#2D000A" }}
                />
              </div>

              {/* Parent */}
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Parent category (optional)</label>
                <select
                  value={form.parent}
                  onChange={e => setForm(p => ({ ...p, parent: e.target.value }))}
                  className="w-full px-3.5 py-2.5 rounded-xl border text-sm outline-none"
                  style={{ border: "1px solid #F5D0D8", background: "#FDF0F3", color: "#2D000A" }}
                >
                  <option value="">None (top-level category)</option>
                  {topLevel.map(c => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>

              {/* Filter mode — only shown for subcategories */}
              {form.parent && (
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>How are products stored?</label>
                  <div className="space-y-2">
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="radio" name="filter_mode" value="direct"
                        checked={form.filter_mode === "direct"}
                        onChange={() => setForm(p => ({ ...p, filter_mode: "direct" }))}
                        className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#2D000A" }}>Category field</p>
                        <p className="text-xs" style={{ color: "#800020", opacity: 0.65 }}>
                          Products have <code>category = "{form.name || "this name"}"</code> — like Birthday under Customized
                        </p>
                      </div>
                    </label>
                    <label className="flex items-start gap-2.5 cursor-pointer">
                      <input type="radio" name="filter_mode" value="as_subcategory"
                        checked={form.filter_mode === "as_subcategory"}
                        onChange={() => setForm(p => ({ ...p, filter_mode: "as_subcategory" }))}
                        className="mt-0.5" />
                      <div>
                        <p className="text-sm font-medium" style={{ color: "#2D000A" }}>Subcategory field</p>
                        <p className="text-xs" style={{ color: "#800020", opacity: 0.65 }}>
                          Products have <code>category = "{form.parent}"</code> and <code>subcategory = "{form.name || "this name"}"</code> — like Candles under Accessories
                        </p>
                      </div>
                    </label>
                  </div>
                </div>
              )}

              {/* Badge colors */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Badge background</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.badge_bg} onChange={e => setForm(p => ({ ...p, badge_bg: e.target.value }))}
                      className="w-10 h-9 rounded-lg border cursor-pointer" style={{ border: "1px solid #F5D0D8" }} />
                    <span className="text-xs font-mono" style={{ color: "#800020" }}>{form.badge_bg}</span>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold mb-1.5" style={{ color: "#800020" }}>Badge text</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.badge_text} onChange={e => setForm(p => ({ ...p, badge_text: e.target.value }))}
                      className="w-10 h-9 rounded-lg border cursor-pointer" style={{ border: "1px solid #F5D0D8" }} />
                    <span className="text-xs font-mono" style={{ color: "#800020" }}>{form.badge_text}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold" style={{ color: "#800020" }}>Preview:</span>
                <span className="px-3 py-1 rounded-full text-xs font-bold"
                  style={{ background: form.badge_bg, color: form.badge_text }}>
                  {form.name || "Category name"}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setModal(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold border transition-colors"
                style={{ border: "1px solid #F5D0D8", color: "#800020" }}>
                Cancel
              </button>
              <button onClick={save} disabled={saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-opacity"
                style={{ background: "#800020", opacity: saving ? 0.6 : 1 }}>
                {saving ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                {modal === "add" ? "Add" : "Save"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
