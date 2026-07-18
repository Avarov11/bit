"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Trash2, CheckCircle2, AlertCircle, Plus, X } from "lucide-react";

interface ShapeConfig { shape: string; label: string; max_chars: number; view_count: number; allowed_colors: string[]; bucket_name?: string; active?: boolean; }
interface ColorImageRow { color: string; view_index: number; filename: string | null; url: string | null; }

const ALL_COLORS = [
  { id: "brown", label: "Milk Choc",  hex: "#8B5E3C", group: "Chocolate" },
  { id: "beige", label: "Hazelnut",   hex: "#C9A86C", group: "Chocolate" },
  { id: "black", label: "Dark Choc",  hex: "#2E0D05", group: "Chocolate" },
  { id: "white", label: "White",      hex: "#FFFFF0", group: "White Choc" },
  { id: "pink",  label: "Rose",       hex: "#FF6B9D", group: "White Choc" },
  { id: "blue",  label: "Sky",        hex: "#B2C8D8", group: "White Choc" },
];

const BUILTIN_SHAPES = ["cake", "heart", "square"];

const DEFAULT_SHAPES: ShapeConfig[] = [
  { shape: "cake",   label: "Full Cake", max_chars: 5, view_count: 2, allowed_colors: ALL_COLORS.map(c => c.id) },
  { shape: "heart",  label: "Heart",     max_chars: 3, view_count: 3, allowed_colors: ALL_COLORS.map(c => c.id) },
  { shape: "square", label: "Square",    max_chars: 3, view_count: 3, allowed_colors: ALL_COLORS.map(c => c.id) },
];

const SHAPE_ICONS: Record<string, string> = { cake: "🎂", heart: "❤️", square: "🟫" };
const MAX_VIEWS = 5;
const ACCENT = "#800020";

export default function SettingsPage() {
  const [activeShape,   setActiveShape]   = useState("cake");
  const [configs,       setConfigs]       = useState<ShapeConfig[]>(DEFAULT_SHAPES);
  const [configsLoaded, setConfigsLoaded] = useState(false);
  const [colorImages,   setColorImages]   = useState<ColorImageRow[]>([]);
  const [loadingImgs,   setLoadingImgs]   = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<{ color: string; view: number } | null>(null);
  const [deletingSlot,  setDeletingSlot]  = useState<{ color: string; view: number } | null>(null);
  const [savingLimit,     setSavingLimit]     = useState(false);
  const [savingColors,    setSavingColors]    = useState(false);
  const [savingViewCount, setSavingViewCount] = useState(false);
  const [draftChars,      setDraftChars]      = useState<Record<string, number>>({});
  const [draftColors,     setDraftColors]     = useState<Record<string, string[]>>({});
  const [draftViewCount,  setDraftViewCount]  = useState<Record<string, number>>({});
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef        = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<{ color: string; view: number } | null>(null);

  // Add shape modal state
  const [showAddModal,  setShowAddModal]  = useState(false);
  const [newShapeLabel, setNewShapeLabel] = useState("");
  const [addingShape,   setAddingShape]   = useState(false);
  const [deletingShape, setDeletingShape] = useState<string | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }

  function initDrafts(shapes: ShapeConfig[]) {
    const dc: Record<string, number>     = {};
    const dvc: Record<string, number>    = {};
    const dcolor: Record<string, string[]> = {};
    shapes.forEach(c => {
      dc[c.shape]     = c.max_chars;
      dvc[c.shape]    = c.view_count ?? (c.shape === "cake" ? 2 : 3);
      dcolor[c.shape] = c.allowed_colors ?? ALL_COLORS.map(x => x.id);
    });
    setDraftChars(dc);
    setDraftViewCount(dvc);
    setDraftColors(dcolor);
  }

  // Load configs from DB
  const loadConfigs = useCallback(() => {
    fetch("/api/shape-configs", { cache: "no-store" })
      .then(r => r.json())
      .then((data: ShapeConfig[]) => {
        if (Array.isArray(data) && data.length) {
          // Merge DB data with defaults for built-ins, keep custom shapes as-is
          const merged: ShapeConfig[] = [];
          for (const dbShape of data) {
            const def = DEFAULT_SHAPES.find(d => d.shape === dbShape.shape);
            merged.push(def ? { ...def, ...dbShape } : {
              ...dbShape,
              max_chars:      dbShape.max_chars     ?? 3,
              view_count:     dbShape.view_count     ?? 2,
              allowed_colors: dbShape.allowed_colors ?? ALL_COLORS.map(c => c.id),
            });
          }
          setConfigs(merged);
          initDrafts(merged);
        } else {
          setConfigs(DEFAULT_SHAPES);
          initDrafts(DEFAULT_SHAPES);
        }
        setConfigsLoaded(true);
      })
      .catch(() => {
        setConfigs(DEFAULT_SHAPES);
        initDrafts(DEFAULT_SHAPES);
        setConfigsLoaded(true);
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { loadConfigs(); }, [loadConfigs]);

  // Load color images for active shape
  const loadColorImages = useCallback(() => {
    setLoadingImgs(true);
    fetch(`/api/shape-color-images?shape=${activeShape}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: ColorImageRow[]) => setColorImages(Array.isArray(data) ? data : []))
      .finally(() => setLoadingImgs(false));
  }, [activeShape]);

  useEffect(() => { loadColorImages(); }, [loadColorImages]);

  function getSlot(color: string, view: number): ColorImageRow | null {
    return colorImages.find(ci => ci.color === color && ci.view_index === view) ?? null;
  }

  function triggerUpload(color: string, view: number) {
    pendingSlotRef.current = { color, view };
    if (fileRef.current) { fileRef.current.value = ""; fileRef.current.click(); }
  }

  async function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    const slot = pendingSlotRef.current;
    if (!file || !slot) return;
    const { color, view } = slot;
    setUploadingSlot({ color, view });

    const fd = new FormData();
    fd.append("shape",      activeShape);
    fd.append("color",      color);
    fd.append("view_index", String(view));
    fd.append("file",       file);

    const res  = await fetch("/api/shape-color-images", { method: "POST", body: fd });
    const data = await res.json() as { url?: string; filename?: string; error?: string };
    setUploadingSlot(null);
    pendingSlotRef.current = null;

    if (data.url && data.filename) {
      setColorImages(prev => {
        const next = prev.filter(ci => !(ci.color === color && ci.view_index === view));
        return [...next, { color, view_index: view, filename: data.filename!, url: data.url! }];
      });
      showToast("Image saved.", true);
    } else {
      showToast(data.error ?? "Upload failed.", false);
    }
  }

  async function deleteSlot(color: string, view: number) {
    setDeletingSlot({ color, view });
    const res  = await fetch("/api/shape-color-images", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ shape: activeShape, color, view_index: view }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    setDeletingSlot(null);
    if (data.success) {
      setColorImages(prev => prev.filter(ci => !(ci.color === color && ci.view_index === view)));
      showToast("Image removed.", true);
    } else {
      showToast(data.error ?? "Delete failed.", false);
    }
  }

  async function saveViewCount() {
    const view_count = draftViewCount[activeShape];
    if (!view_count || view_count < 1) return;
    setSavingViewCount(true);
    const res  = await fetch("/api/shape-configs", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ shape: activeShape, view_count }),
    });
    const data = await res.json();
    setSavingViewCount(false);
    if (res.ok) { setConfigs(prev => prev.map(c => c.shape === activeShape ? { ...c, view_count } : c)); showToast("View count saved.", true); }
    else showToast(data.error ?? "Save failed.", false);
  }

  async function saveLimit() {
    const max_chars = draftChars[activeShape];
    if (!max_chars || max_chars < 1) return;
    setSavingLimit(true);
    const res  = await fetch("/api/shape-configs", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ shape: activeShape, max_chars }),
    });
    const data = await res.json();
    setSavingLimit(false);
    if (res.ok) { setConfigs(prev => prev.map(c => c.shape === activeShape ? { ...c, max_chars } : c)); showToast("Writing limit saved.", true); }
    else showToast(data.error ?? "Save failed.", false);
  }

  async function saveSauces() {
    const allowed_colors = draftColors[activeShape] ?? [];
    setSavingColors(true);
    const res  = await fetch("/api/shape-configs", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ shape: activeShape, allowed_colors }),
    });
    const data = await res.json();
    setSavingColors(false);
    if (res.ok) { setConfigs(prev => prev.map(c => c.shape === activeShape ? { ...c, allowed_colors } : c)); showToast("Sauces updated.", true); }
    else showToast(data.error ?? "Save failed.", false);
  }

  function toggleColor(colorId: string) {
    setDraftColors(prev => {
      const current = prev[activeShape] ?? ALL_COLORS.map(c => c.id);
      const next = current.includes(colorId) ? current.filter(c => c !== colorId) : [...current, colorId];
      return { ...prev, [activeShape]: next };
    });
  }

  async function addShape() {
    if (!newShapeLabel.trim()) return;
    setAddingShape(true);
    const res  = await fetch("/api/shapes", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ label: newShapeLabel.trim() }),
    });
    const data = await res.json();
    setAddingShape(false);
    if (res.ok) {
      setShowAddModal(false);
      setNewShapeLabel("");
      loadConfigs();
      setActiveShape(data.shape);
      showToast(`Shape "${data.label}" added!`, true);
    } else {
      showToast(data.error ?? "Failed to add shape.", false);
    }
  }

  async function deleteShape(shape: string) {
    if (!confirm(`Delete shape "${shape}"? This cannot be undone.`)) return;
    setDeletingShape(shape);
    const res  = await fetch("/api/shapes", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ shape }),
    });
    const data = await res.json();
    setDeletingShape(null);
    if (res.ok) {
      setConfigs(prev => prev.filter(c => c.shape !== shape));
      if (activeShape === shape) setActiveShape("cake");
      showToast("Shape deleted.", true);
    } else {
      showToast(data.error ?? "Delete failed.", false);
    }
  }

  const cfg            = configs.find(c => c.shape === activeShape) ?? DEFAULT_SHAPES.find(s => s.shape === activeShape)!;
  const charChanged    = cfg && draftChars[activeShape] !== undefined && draftChars[activeShape] !== cfg.max_chars;
  const curColors      = draftColors[activeShape] ?? ALL_COLORS.map(c => c.id);
  const savedColors    = cfg?.allowed_colors ?? ALL_COLORS.map(c => c.id);
  const colorChanged   = JSON.stringify([...curColors].sort()) !== JSON.stringify([...savedColors].sort());
  const viewCount      = draftViewCount[activeShape] ?? cfg?.view_count ?? (activeShape === "cake" ? 2 : 3);
  const savedViewCount = cfg?.view_count ?? (activeShape === "cake" ? 2 : 3);
  const viewChanged    = viewCount !== savedViewCount;
  const viewLabels     = Array.from({ length: viewCount }, (_, i) => `View ${i + 1}`);
  const chocColors   = ALL_COLORS.filter(c => c.group === "Chocolate");
  const whiteColors  = ALL_COLORS.filter(c => c.group === "White Choc");
  const isBuiltin    = BUILTIN_SHAPES.includes(activeShape);
  const shapeIcon    = SHAPE_ICONS[activeShape] ?? "✦";

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#FDF0F3" }}>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: toast.ok ? "#dcfce7" : "#fee2e2", color: toast.ok ? "#166534" : "#991b1b", border: `1px solid ${toast.ok ? "#86efac" : "#fca5a5"}` }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Add Shape Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(45,0,10,0.5)" }}
          onClick={e => { if (e.target === e.currentTarget) setShowAddModal(false); }}>
          <div className="w-full max-w-sm rounded-2xl overflow-hidden shadow-2xl"
            style={{ background: "white" }}>
            <div className="px-6 py-4 flex items-center justify-between"
              style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>Add New Shape</p>
              <button onClick={() => setShowAddModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: "#F5D0D8", color: ACCENT }}>
                <X size={16} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: ACCENT }}>
                  Shape Name
                </label>
                <input
                  autoFocus
                  value={newShapeLabel}
                  onChange={e => setNewShapeLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") addShape(); }}
                  placeholder="e.g. Star, Circle, Butterfly…"
                  className="w-full px-3 py-2.5 rounded-xl text-sm outline-none"
                  style={{ border: `1.5px solid #F5D0D8`, color: "#2D000A", background: "#FDF8F9" }}
                />
                <p className="text-[10px] mt-1.5" style={{ color: "#C0A0A8" }}>
                  A storage bucket will be created automatically.
                </p>
              </div>
              <button onClick={addShape} disabled={addingShape || !newShapeLabel.trim()}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2"
                style={{
                  background: newShapeLabel.trim() && !addingShape ? ACCENT : "#F5D0D8",
                  color:      newShapeLabel.trim() && !addingShape ? "white" : "#A05068",
                  cursor:     newShapeLabel.trim() && !addingShape ? "pointer" : "not-allowed",
                }}>
                {addingShape ? "Creating…" : <><Plus size={14} /> Add Shape</>}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Shape Settings</h1>
        <p className="text-sm mt-1" style={{ color: ACCENT }}>Manage images, sauces, and writing limits per cake shape</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6 items-center">
        {configs.map(s => {
          const icon    = SHAPE_ICONS[s.shape] ?? "✦";
          const custom  = !BUILTIN_SHAPES.includes(s.shape);
          const isActive = activeShape === s.shape;
          return (
            <div key={s.shape} className="relative group/tab">
              <button onClick={() => setActiveShape(s.shape)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{
                  background: isActive ? ACCENT : "white",
                  color:      isActive ? "white" : ACCENT,
                  border:     `2px solid ${isActive ? ACCENT : "#F5D0D8"}`,
                  boxShadow:  isActive ? `0 2px 12px ${ACCENT}40` : "none",
                  paddingRight: custom ? "2.5rem" : undefined,
                }}>
                <span>{icon}</span> {s.label}
              </button>
              {custom && (
                <button
                  onClick={() => deleteShape(s.shape)}
                  disabled={deletingShape === s.shape}
                  className="absolute top-1 right-1 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover/tab:opacity-100 transition-opacity"
                  style={{
                    background: isActive ? "rgba(255,255,255,0.25)" : "#fee2e2",
                    color:      isActive ? "white" : "#dc2626",
                  }}
                  title="Delete shape">
                  {deletingShape === s.shape ? <span className="text-[9px]">…</span> : <X size={11} />}
                </button>
              )}
            </div>
          );
        })}

        {/* Add Shape button */}
        <button onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
          style={{ background: "white", color: ACCENT, border: `2px dashed #F5D0D8` }}>
          <Plus size={15} /> Add Shape
        </button>
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      {!configsLoaded ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 rounded-full border-4 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
        </div>
      ) : !cfg ? (
        <div className="text-center py-20" style={{ color: ACCENT }}>Shape not found.</div>
      ) : (
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Color Image Grid ── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
            <p className="font-bold text-base" style={{ color: "#2D000A" }}>{shapeIcon} {cfg.label} Images</p>
            <p className="text-xs mt-0.5" style={{ color: ACCENT }}>Click any slot to upload or replace an image for that color</p>
          </div>

          <div className="p-6">
            {/* Column headers */}
            <div className="flex gap-3 mb-2 pl-[140px]">
              {viewLabels.map((label, vi) => (
                <div key={vi} className="flex-1 text-center text-[10px] font-bold uppercase tracking-wider" style={{ color: ACCENT }}>
                  {label}
                </div>
              ))}
            </div>

            {/* Color rows */}
            {loadingImgs ? (
              <div className="space-y-3">
                {ALL_COLORS.map(c => (
                  <div key={c.id} className="flex gap-3 items-center">
                    <div className="w-[140px] h-4 rounded animate-pulse" style={{ background: "#F5D0D8" }} />
                    {Array.from({ length: viewCount }).map((_, vi) => (
                      <div key={vi} className="flex-1 aspect-square rounded-xl animate-pulse" style={{ background: "#F5D0D8" }} />
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {ALL_COLORS.map(color => (
                  <div key={color.id} className="flex gap-3 items-center">
                    {/* Color label */}
                    <div className="w-[140px] shrink-0 flex items-center gap-2">
                      <div className="w-5 h-5 rounded-full border-2 shrink-0"
                        style={{ background: color.id === "white" ? "#f0ece4" : color.hex, borderColor: "#ddd" }} />
                      <span className="text-xs font-semibold" style={{ color: "#2D000A" }}>{color.label}</span>
                    </div>

                    {/* View slots */}
                    {Array.from({ length: viewCount }).map((_, vi) => {
                      const slot       = getSlot(color.id, vi);
                      const isUploading = uploadingSlot?.color === color.id && uploadingSlot?.view === vi;
                      const isDeleting  = deletingSlot?.color  === color.id && deletingSlot?.view  === vi;

                      return (
                        <div key={vi} className="flex-1 relative group"
                          style={{ aspectRatio: "1", cursor: "pointer" }}
                          onClick={() => !isDeleting && triggerUpload(color.id, vi)}>
                          <div className="absolute inset-0 rounded-xl overflow-hidden"
                            style={{ border: `1.5px ${slot?.url ? "solid" : "dashed"} ${slot?.url ? "#F5D0D8" : "#E8C4CC"}`, background: "#FDF0F3" }}>

                            {isUploading ? (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-5 h-5 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
                              </div>
                            ) : slot?.url ? (
                              <>
                                <Image src={slot.url} alt={`${color.label} view ${vi + 1}`} fill
                                  className="object-contain p-1" sizes="100px" unoptimized />
                                {/* Hover: replace overlay */}
                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-90 transition-opacity rounded-xl"
                                  style={{ background: "rgba(45,0,10,0.75)" }}>
                                  <Upload size={14} style={{ color: "white" }} />
                                </div>
                                {/* Delete button */}
                                <button
                                  className="absolute top-1 right-1 w-5 h-5 rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10"
                                  style={{ background: "#ef4444", color: "white" }}
                                  onClick={e => { e.stopPropagation(); deleteSlot(color.id, vi); }}>
                                  {isDeleting ? <span className="text-[9px]">…</span> : <Trash2 size={10} />}
                                </button>
                              </>
                            ) : (
                              <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                                <Upload size={14} style={{ color: "#D4A0AD" }} />
                                <span className="text-[8px] font-medium" style={{ color: "#D4A0AD" }}>Upload</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="space-y-5">

          {/* Sauce / Color selector */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>Available Sauces</p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>Which sauce options appear for {cfg.label}</p>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>🍫 Chocolate</p>
                <div className="space-y-2">
                  {chocColors.map(color => {
                    const on = curColors.includes(color.id);
                    return (
                      <button key={color.id} onClick={() => toggleColor(color.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                        style={{ background: on ? `${ACCENT}10` : "#FDF0F3", border: `1.5px solid ${on ? ACCENT : "#F5D0D8"}` }}>
                        <div className="w-6 h-6 rounded-full border-2 shrink-0" style={{ background: color.hex, borderColor: on ? ACCENT : "#F5D0D8" }} />
                        <span className="text-sm font-semibold flex-1" style={{ color: "#2D000A" }}>{color.label}</span>
                        <div className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: on ? ACCENT : "#F5D0D8", background: on ? ACCENT : "transparent" }}>
                          {on && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: ACCENT }}>🤍 White Chocolate</p>
                <div className="space-y-2">
                  {whiteColors.map(color => {
                    const on = curColors.includes(color.id);
                    return (
                      <button key={color.id} onClick={() => toggleColor(color.id)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left"
                        style={{ background: on ? `${ACCENT}10` : "#FDF0F3", border: `1.5px solid ${on ? ACCENT : "#F5D0D8"}` }}>
                        <div className="w-6 h-6 rounded-full border-2 shrink-0"
                          style={{ background: color.id === "white" ? "#f0ece4" : color.hex, borderColor: on ? ACCENT : "#ddd" }} />
                        <span className="text-sm font-semibold flex-1" style={{ color: "#2D000A" }}>{color.label}</span>
                        <div className="w-4 h-4 rounded border-2 flex items-center justify-center shrink-0"
                          style={{ borderColor: on ? ACCENT : "#F5D0D8", background: on ? ACCENT : "transparent" }}>
                          {on && <svg width="8" height="8" viewBox="0 0 10 10" fill="none"><path d="M2 5l2.5 2.5L8 2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
              <button onClick={saveSauces} disabled={!colorChanged || savingColors}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: colorChanged && !savingColors ? ACCENT : "#F5D0D8", color: colorChanged && !savingColors ? "white" : "#A05068", cursor: colorChanged && !savingColors ? "pointer" : "not-allowed" }}>
                {savingColors ? "Saving…" : "Save Sauces"}
              </button>
            </div>
          </div>

          {/* Number of views */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>Number of Views</p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>How many image slots per color for {cfg.label}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <button onClick={() => setDraftViewCount(d => ({ ...d, [activeShape]: Math.max(1, (d[activeShape] ?? savedViewCount) - 1) }))}
                  className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                  style={{ background: "#FDF0F3", color: ACCENT, border: `1.5px solid #F5D0D8` }}>−</button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-bold" style={{ color: "#2D000A" }}>{viewCount}</span>
                  <p className="text-xs mt-0.5" style={{ color: ACCENT }}>view{viewCount !== 1 ? "s" : ""} per color</p>
                </div>
                <button onClick={() => setDraftViewCount(d => ({ ...d, [activeShape]: Math.min(MAX_VIEWS, (d[activeShape] ?? savedViewCount) + 1) }))}
                  className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                  style={{ background: "#FDF0F3", color: ACCENT, border: `1.5px solid #F5D0D8` }}>+</button>
              </div>
              <p className="text-[10px] text-center" style={{ color: "#C0A0A8" }}>Max {MAX_VIEWS} views · Currently saved: {savedViewCount}</p>
              <button onClick={saveViewCount} disabled={!viewChanged || savingViewCount}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: viewChanged && !savingViewCount ? ACCENT : "#F5D0D8", color: viewChanged && !savingViewCount ? "white" : "#A05068", cursor: viewChanged && !savingViewCount ? "pointer" : "not-allowed" }}>
                {savingViewCount ? "Saving…" : "Save Views"}
              </button>
            </div>
          </div>

          {/* Word limit */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>Words Limit</p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>Max words customer can write for {cfg.label}</p>
            </div>
            <div className="p-5 space-y-4">
              {(() => {
                const limit = draftChars[activeShape] ?? cfg.max_chars;
                const SAMPLE = ["Happy","Birthday","Dear","My","Love","Sweet","Wishes","Always","Best","You"];
                const visible = Math.max(limit + 2, 4);
                return (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {SAMPLE.slice(0, visible).map((word, i) => {
                      const active = i < limit;
                      return (
                        <button
                          key={i}
                          onClick={() => setDraftChars(d => ({ ...d, [activeShape]: i + 1 }))}
                          title={`Set limit to ${i + 1} word${i + 1 !== 1 ? "s" : ""}`}
                          className="px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-150 hover:scale-105"
                          style={{
                            background: active ? "#2D000A" : "#F5E8EC",
                            color:      active ? "#FF6B9D" : "#C0A0A8",
                            border:     `1.5px solid ${active ? ACCENT : "#E8C4CC"}`,
                            boxShadow:  active ? "0 2px 6px rgba(45,0,10,0.20)" : "none",
                          }}
                        >
                          {word}
                        </button>
                      );
                    })}
                  </div>
                );
              })()}

              <div className="flex items-center justify-between gap-3">
                <button
                  onClick={() => setDraftChars(d => ({ ...d, [activeShape]: Math.max(1, (d[activeShape] ?? cfg.max_chars) - 1) }))}
                  className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                  style={{ background: "#FDF0F3", color: ACCENT, border: `1.5px solid #F5D0D8` }}
                >−</button>
                <div className="flex-1 text-center">
                  <span className="text-4xl font-bold" style={{ color: "#2D000A" }}>
                    {draftChars[activeShape] ?? cfg.max_chars}
                  </span>
                  <p className="text-xs mt-0.5" style={{ color: ACCENT }}>
                    word{(draftChars[activeShape] ?? cfg.max_chars) !== 1 ? "s" : ""}
                  </p>
                </div>
                <button
                  onClick={() => setDraftChars(d => ({ ...d, [activeShape]: Math.min(10, (d[activeShape] ?? cfg.max_chars) + 1) }))}
                  className="w-10 h-10 rounded-xl text-xl font-bold flex items-center justify-center transition-all"
                  style={{ background: "#FDF0F3", color: ACCENT, border: `1.5px solid #F5D0D8` }}
                >+</button>
              </div>
              <p className="text-[10px] text-center" style={{ color: "#C0A0A8" }}>
                Max 10 words · Currently saved: {cfg.max_chars}
              </p>
              <button onClick={saveLimit} disabled={!charChanged || savingLimit}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: charChanged && !savingLimit ? ACCENT : "#F5D0D8", color: charChanged && !savingLimit ? "white" : "#A05068", cursor: charChanged && !savingLimit ? "pointer" : "not-allowed" }}>
                {savingLimit ? "Saving…" : "Save Limit"}
              </button>
            </div>
          </div>

          {/* Delete shape (custom only) */}
          {!isBuiltin && (
            <div className="rounded-2xl overflow-hidden"
              style={{ background: "#fff5f5", border: "1px solid #fca5a5", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
              <div className="p-5 flex items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-sm" style={{ color: "#991b1b" }}>Delete Shape</p>
                  <p className="text-xs mt-0.5" style={{ color: "#dc2626" }}>Remove this shape and its settings</p>
                </div>
                <button onClick={() => deleteShape(activeShape)} disabled={deletingShape === activeShape}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all shrink-0"
                  style={{ background: "#dc2626", color: "white" }}>
                  <Trash2 size={14} />
                  {deletingShape === activeShape ? "Deleting…" : "Delete"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
      )}
    </div>
  );
}
