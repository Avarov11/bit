"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Trash2, CheckCircle2, AlertCircle } from "lucide-react";

interface ShapeConfig { shape: string; label: string; max_chars: number; allowed_colors: string[]; }
interface ColorImageRow { color: string; view_index: number; filename: string | null; url: string | null; }

const ALL_COLORS = [
  { id: "brown", label: "Milk Choc",  hex: "#8B5E3C", group: "Chocolate" },
  { id: "beige", label: "Hazelnut",   hex: "#C9A86C", group: "Chocolate" },
  { id: "black", label: "Dark Choc",  hex: "#2E0D05", group: "Chocolate" },
  { id: "white", label: "White",      hex: "#FFFFF0", group: "White Choc" },
  { id: "pink",  label: "Rose",       hex: "#FF6B9D", group: "White Choc" },
  { id: "blue",  label: "Sky",        hex: "#B2C8D8", group: "White Choc" },
];

const DEFAULT_SHAPES: ShapeConfig[] = [
  { shape: "cake",   label: "Full Cake", max_chars: 5, allowed_colors: ALL_COLORS.map(c => c.id) },
  { shape: "heart",  label: "Heart",     max_chars: 3, allowed_colors: ALL_COLORS.map(c => c.id) },
  { shape: "square", label: "Square",    max_chars: 3, allowed_colors: ALL_COLORS.map(c => c.id) },
];

const SHAPE_ICONS: Record<string, string> = { cake: "🎂", heart: "❤️", square: "🟫" };
const VIEW_LABELS: Record<string, string[]> = {
  cake:   ["Side View", "Top View"],
  heart:  ["View 1", "View 2", "View 3"],
  square: ["View 1", "View 2", "View 3"],
};
const ACCENT = "#800020";

export default function SettingsPage() {
  const [activeShape,   setActiveShape]   = useState("cake");
  const [configs,       setConfigs]       = useState<ShapeConfig[]>(DEFAULT_SHAPES);
  const [colorImages,   setColorImages]   = useState<ColorImageRow[]>([]);
  const [loadingImgs,   setLoadingImgs]   = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<{ color: string; view: number } | null>(null);
  const [deletingSlot,  setDeletingSlot]  = useState<{ color: string; view: number } | null>(null);
  const [savingLimit,   setSavingLimit]   = useState(false);
  const [savingColors,  setSavingColors]  = useState(false);
  const [draftChars,    setDraftChars]    = useState<Record<string, number>>({});
  const [draftColors,   setDraftColors]   = useState<Record<string, string[]>>({});
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef        = useRef<HTMLInputElement>(null);
  const pendingSlotRef = useRef<{ color: string; view: number } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }

  // Load configs
  useEffect(() => {
    fetch("/api/shape-configs", { cache: "no-store" })
      .then(r => r.json())
      .then((data: ShapeConfig[]) => {
        if (Array.isArray(data) && data.length) {
          const merged = DEFAULT_SHAPES.map(def => {
            const db = data.find(d => d.shape === def.shape);
            return db ? { ...def, ...db } : def;
          });
          setConfigs(merged);
          const dc: Record<string, number>    = {};
          const dcolor: Record<string, string[]> = {};
          merged.forEach(c => { dc[c.shape] = c.max_chars; dcolor[c.shape] = c.allowed_colors ?? ALL_COLORS.map(x => x.id); });
          setDraftChars(dc);
          setDraftColors(dcolor);
        } else {
          const dc: Record<string, number>    = {};
          const dcolor: Record<string, string[]> = {};
          DEFAULT_SHAPES.forEach(s => { dc[s.shape] = s.max_chars; dcolor[s.shape] = s.allowed_colors; });
          setDraftChars(dc);
          setDraftColors(dcolor);
        }
      })
      .catch(() => {
        const dc: Record<string, number>    = {};
        const dcolor: Record<string, string[]> = {};
        DEFAULT_SHAPES.forEach(s => { dc[s.shape] = s.max_chars; dcolor[s.shape] = s.allowed_colors; });
        setDraftChars(dc);
        setDraftColors(dcolor);
      });
  }, []);

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

  const cfg          = configs.find(c => c.shape === activeShape) ?? DEFAULT_SHAPES.find(s => s.shape === activeShape)!;
  const charChanged  = draftChars[activeShape] !== undefined && draftChars[activeShape] !== cfg.max_chars;
  const curColors    = draftColors[activeShape] ?? ALL_COLORS.map(c => c.id);
  const savedColors  = cfg.allowed_colors ?? ALL_COLORS.map(c => c.id);
  const colorChanged = JSON.stringify([...curColors].sort()) !== JSON.stringify([...savedColors].sort());
  const viewLabels   = VIEW_LABELS[activeShape];
  const viewCount    = viewLabels.length;
  const chocColors   = ALL_COLORS.filter(c => c.group === "Chocolate");
  const whiteColors  = ALL_COLORS.filter(c => c.group === "White Choc");

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#FDF0F3" }}>
      {toast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: toast.ok ? "#dcfce7" : "#fee2e2", color: toast.ok ? "#166534" : "#991b1b", border: `1px solid ${toast.ok ? "#86efac" : "#fca5a5"}` }}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Shape Settings</h1>
        <p className="text-sm mt-1" style={{ color: ACCENT }}>Manage images, sauces, and writing limits per cake shape</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {DEFAULT_SHAPES.map(s => (
          <button key={s.shape} onClick={() => setActiveShape(s.shape)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: activeShape === s.shape ? ACCENT : "white",
              color:      activeShape === s.shape ? "white"  : ACCENT,
              border:     `2px solid ${activeShape === s.shape ? ACCENT : "#F5D0D8"}`,
              boxShadow:  activeShape === s.shape ? `0 2px 12px ${ACCENT}40` : "none",
            }}>
            <span>{SHAPE_ICONS[s.shape]}</span> {s.label}
          </button>
        ))}
      </div>

      {/* Hidden file input */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileChange} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Color Image Grid ── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
            <p className="font-bold text-base" style={{ color: "#2D000A" }}>{SHAPE_ICONS[activeShape]} {cfg.label} Images</p>
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

          {/* Writing limit */}
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
            <div className="px-5 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>Writing Limit</p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>Max letters for {cfg.label}</p>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-center">
                <span className="text-5xl">{SHAPE_ICONS[activeShape]}</span>
                <p className="text-xs mt-1" style={{ color: ACCENT }}>Currently: <strong>{cfg.max_chars}</strong> letters</p>
              </div>
              <input type="number" min={1} max={100}
                value={draftChars[activeShape] ?? cfg.max_chars}
                onChange={e => setDraftChars(d => ({ ...d, [activeShape]: parseInt(e.target.value) || 1 }))}
                className="w-full text-center text-2xl font-bold border-2 rounded-xl px-4 py-3 outline-none"
                style={{ borderColor: charChanged ? ACCENT : "#F5D0D8", color: "#2D000A", background: "#FDF0F3" }} />
              <button onClick={saveLimit} disabled={!charChanged || savingLimit}
                className="w-full py-2.5 rounded-xl text-sm font-bold transition-all"
                style={{ background: charChanged && !savingLimit ? ACCENT : "#F5D0D8", color: charChanged && !savingLimit ? "white" : "#A05068", cursor: charChanged && !savingLimit ? "pointer" : "not-allowed" }}>
                {savingLimit ? "Saving…" : "Save Limit"}
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
