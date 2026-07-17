"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Trash2, CheckCircle2, AlertCircle, ImageIcon } from "lucide-react";

interface ShapeConfig { shape: string; label: string; max_chars: number; allowed_colors: string[]; }
interface ShapeImage  { name: string; url: string; }

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
const ACCENT = "#800020";

export default function SettingsPage() {
  const [activeShape, setActiveShape]   = useState("cake");
  const [configs,     setConfigs]       = useState<ShapeConfig[]>(DEFAULT_SHAPES);
  const [images,      setImages]        = useState<ShapeImage[]>([]);
  const [loadingImgs, setLoadingImgs]   = useState(false);
  const [uploading,   setUploading]     = useState(false);
  const [deleting,    setDeleting]      = useState<string | null>(null);
  const [savingLimit, setSavingLimit]   = useState(false);
  const [savingColors,setSavingColors]  = useState(false);
  const [draftChars,  setDraftChars]    = useState<Record<string, number>>({});
  const [draftColors, setDraftColors]   = useState<Record<string, string[]>>({});
  const [toast,       setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

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
          const dc: Record<string, number> = {};
          const dcolor: Record<string, string[]> = {};
          merged.forEach(c => {
            dc[c.shape]     = c.max_chars;
            dcolor[c.shape] = c.allowed_colors ?? ALL_COLORS.map(x => x.id);
          });
          setDraftChars(dc);
          setDraftColors(dcolor);
        } else {
          const dc: Record<string, number> = {};
          const dcolor: Record<string, string[]> = {};
          DEFAULT_SHAPES.forEach(s => { dc[s.shape] = s.max_chars; dcolor[s.shape] = s.allowed_colors; });
          setDraftChars(dc);
          setDraftColors(dcolor);
        }
      })
      .catch(() => {
        const dc: Record<string, number> = {};
        const dcolor: Record<string, string[]> = {};
        DEFAULT_SHAPES.forEach(s => { dc[s.shape] = s.max_chars; dcolor[s.shape] = s.allowed_colors; });
        setDraftChars(dc);
        setDraftColors(dcolor);
      });
  }, []);

  // Load images
  const loadImages = useCallback(() => {
    setLoadingImgs(true);
    fetch(`/api/shape-images?shape=${activeShape}`, { cache: "no-store" })
      .then(r => r.json())
      .then((data: ShapeImage[]) => setImages(Array.isArray(data) ? data : []))
      .finally(() => setLoadingImgs(false));
  }, [activeShape]);

  useEffect(() => { loadImages(); }, [loadImages]);

  async function uploadFiles(files: FileList | File[]) {
    const arr = Array.from(files).filter(f => f.type.startsWith("image/"));
    if (!arr.length) { showToast("Select image files only.", false); return; }
    setUploading(true);
    const fd = new FormData();
    fd.append("shape", activeShape);
    arr.forEach(f => fd.append("files", f));
    const res  = await fetch("/api/shape-images", { method: "POST", body: fd });
    const data = await res.json() as { uploaded: string[]; errors: string[] };
    setUploading(false);
    if (data.errors?.length) showToast(`${data.uploaded.length} uploaded, ${data.errors.length} failed.`, false);
    else showToast(`${data.uploaded.length} image${data.uploaded.length !== 1 ? "s" : ""} uploaded.`, true);
    loadImages();
  }

  async function deleteImage(name: string) {
    setDeleting(name);
    const res  = await fetch("/api/shape-images", {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body:   JSON.stringify({ shape: activeShape, name }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (data.success) { setImages(prev => prev.filter(i => i.name !== name)); showToast("Image deleted.", true); }
    else showToast(data.error ?? "Delete failed.", false);
    setDeleting(null);
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
    if (res.ok) {
      setConfigs(prev => prev.map(c => c.shape === activeShape ? { ...c, max_chars } : c));
      showToast("Writing limit saved.", true);
    } else showToast(data.error ?? "Save failed.", false);
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
    if (res.ok) {
      setConfigs(prev => prev.map(c => c.shape === activeShape ? { ...c, allowed_colors } : c));
      showToast("Sauces updated.", true);
    } else showToast(data.error ?? "Save failed.", false);
  }

  function toggleColor(colorId: string) {
    setDraftColors(prev => {
      const current = prev[activeShape] ?? ALL_COLORS.map(c => c.id);
      const next = current.includes(colorId)
        ? current.filter(c => c !== colorId)
        : [...current, colorId];
      return { ...prev, [activeShape]: next };
    });
  }

  const cfg          = configs.find(c => c.shape === activeShape) ?? DEFAULT_SHAPES.find(s => s.shape === activeShape)!;
  const charChanged  = draftChars[activeShape] !== undefined && draftChars[activeShape] !== cfg.max_chars;
  const curColors    = draftColors[activeShape] ?? ALL_COLORS.map(c => c.id);
  const savedColors  = cfg.allowed_colors ?? ALL_COLORS.map(c => c.id);
  const colorChanged = JSON.stringify([...curColors].sort()) !== JSON.stringify([...savedColors].sort());

  const chocColors = ALL_COLORS.filter(c => c.group === "Chocolate");
  const whiteColors = ALL_COLORS.filter(c => c.group === "White Choc");

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Images ── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
            <div>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>{SHAPE_ICONS[activeShape]} {cfg.label} Images</p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>{images.length} image{images.length !== 1 ? "s" : ""} in storage</p>
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ background: ACCENT, color: "white", opacity: uploading ? 0.6 : 1 }}>
              <Upload size={14} />{uploading ? "Uploading…" : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => e.target.files && uploadFiles(e.target.files)} />
          </div>
          <div className="px-6 pt-5">
            <div className="border-2 border-dashed rounded-xl p-6 mb-5 text-center cursor-pointer"
              style={{ borderColor: "#F5D0D8", background: "#FDF0F3" }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = ACCENT; }}
              onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F5D0D8"; }}
              onDrop={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = "#F5D0D8"; if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files); }}>
              <Upload size={24} className="mx-auto mb-2" style={{ color: ACCENT }} />
              <p className="text-sm font-medium" style={{ color: "#2D000A" }}>Drop images here or click to browse</p>
              <p className="text-xs mt-1" style={{ color: ACCENT }}>PNG, JPG, WEBP</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            {loadingImgs ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 6 }).map((_, i) => <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: "#F5D0D8" }} />)}
              </div>
            ) : images.length === 0 ? (
              <div className="text-center py-10">
                <ImageIcon size={36} className="mx-auto mb-3" style={{ color: "#F5D0D8" }} />
                <p className="text-sm" style={{ color: ACCENT }}>No images yet for {cfg.label}</p>
              </div>
            ) : (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {images.map(img => (
                  <div key={img.name} className="group relative aspect-square">
                    <div className="relative w-full h-full rounded-xl overflow-hidden" style={{ border: "1px solid #F5D0D8", background: "#FDF0F3" }}>
                      <Image src={img.url} alt={img.name} fill className="object-contain p-1" sizes="150px" unoptimized />
                    </div>
                    <button onClick={() => deleteImage(img.name)} disabled={deleting === img.name}
                      className="absolute top-1 right-1 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "#ef4444", color: "white" }}>
                      {deleting === img.name ? <span className="text-[9px] font-bold">…</span> : <Trash2 size={11} />}
                    </button>
                    <p className="text-[9px] truncate mt-1 text-center" style={{ color: ACCENT }}>{img.name.replace(/^\d+-/, "")}</p>
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
              {/* Chocolate group */}
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

              {/* White Choc group */}
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
