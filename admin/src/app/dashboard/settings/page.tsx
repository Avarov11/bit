"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, Trash2, CheckCircle2, AlertCircle, ImageIcon } from "lucide-react";

interface ShapeConfig { shape: string; label: string; max_chars: number; }
interface ShapeImage  { name: string; url: string; }

const SHAPES: ShapeConfig[] = [
  { shape: "cake",   label: "Full Cake", max_chars: 5 },
  { shape: "heart",  label: "Heart",     max_chars: 3 },
  { shape: "square", label: "Square",    max_chars: 3 },
];
const SHAPE_ICONS: Record<string, string> = { cake: "🎂", heart: "❤️", square: "🟫" };
const ACCENT = "#800020";

export default function SettingsPage() {
  const [activeShape, setActiveShape] = useState("cake");
  const [configs,  setConfigs]  = useState<ShapeConfig[]>(SHAPES);
  const [images,   setImages]   = useState<ShapeImage[]>([]);
  const [loadingImgs, setLoadingImgs] = useState(false);
  const [uploading,   setUploading]   = useState(false);
  const [deleting,    setDeleting]    = useState<string | null>(null);
  const [savingLimit, setSavingLimit] = useState(false);
  const [draft,    setDraft]    = useState<Record<string, number>>({});
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3200);
  }

  // Load writing limits
  useEffect(() => {
    fetch("/api/shape-configs", { cache: "no-store" })
      .then(r => r.json())
      .then((data: ShapeConfig[]) => {
        if (Array.isArray(data) && data.length) {
          setConfigs(data);
          const d: Record<string, number> = {};
          data.forEach(c => { d[c.shape] = c.max_chars; });
          setDraft(d);
        } else {
          const d: Record<string, number> = {};
          SHAPES.forEach(s => { d[s.shape] = s.max_chars; });
          setDraft(d);
        }
      })
      .catch(() => {
        const d: Record<string, number> = {};
        SHAPES.forEach(s => { d[s.shape] = s.max_chars; });
        setDraft(d);
      });
  }, []);

  // Load images for active shape
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
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ shape: activeShape, name }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (data.success) {
      setImages(prev => prev.filter(i => i.name !== name));
      showToast("Image deleted.", true);
    } else {
      showToast(data.error ?? "Delete failed.", false);
    }
    setDeleting(null);
  }

  async function saveLimit() {
    const max_chars = draft[activeShape];
    if (!max_chars || max_chars < 1) return;
    setSavingLimit(true);
    const res  = await fetch("/api/shape-configs", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ shape: activeShape, max_chars }),
    });
    const data = await res.json();
    setSavingLimit(false);
    if (res.ok) {
      setConfigs(prev => prev.map(c => c.shape === activeShape ? { ...c, max_chars } : c));
      showToast("Writing limit saved.", true);
    } else {
      showToast(data.error ?? "Save failed.", false);
    }
  }

  const cfg     = configs.find(c => c.shape === activeShape) ?? SHAPES.find(s => s.shape === activeShape)!;
  const changed = draft[activeShape] !== undefined && draft[activeShape] !== cfg.max_chars;

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Shape Settings</h1>
        <p className="text-sm mt-1" style={{ color: ACCENT }}>Manage images and writing limits for each cake shape</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {SHAPES.map(s => (
          <button key={s.shape} onClick={() => setActiveShape(s.shape)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all"
            style={{
              background: activeShape === s.shape ? ACCENT : "white",
              color:      activeShape === s.shape ? "white"  : ACCENT,
              border:     `2px solid ${activeShape === s.shape ? ACCENT : "#F5D0D8"}`,
              boxShadow:  activeShape === s.shape ? `0 2px 12px ${ACCENT}40` : "none",
            }}>
            <span>{SHAPE_ICONS[s.shape]}</span>
            {s.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Images panel ── */}
        <div className="lg:col-span-2 rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>

          {/* Panel header */}
          <div className="px-6 py-4 flex items-center justify-between"
            style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
            <div>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>
                {SHAPE_ICONS[activeShape]} {cfg.label} Images
              </p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>
                {images.length} image{images.length !== 1 ? "s" : ""} in storage
              </p>
            </div>
            <button onClick={() => fileRef.current?.click()} disabled={uploading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
              style={{ background: ACCENT, color: "white", opacity: uploading ? 0.6 : 1 }}>
              <Upload size={14} />
              {uploading ? "Uploading…" : "Upload"}
            </button>
            <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
              onChange={e => e.target.files && uploadFiles(e.target.files)} />
          </div>

          {/* Drop zone */}
          <div className="px-6 pt-5">
            <div
              className="border-2 border-dashed rounded-xl p-6 mb-5 text-center cursor-pointer transition-all"
              style={{ borderColor: "#F5D0D8", background: "#FDF0F3" }}
              onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); (e.currentTarget as HTMLElement).style.borderColor = ACCENT; }}
              onDragLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = "#F5D0D8"; }}
              onDrop={e => {
                e.preventDefault();
                (e.currentTarget as HTMLElement).style.borderColor = "#F5D0D8";
                if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
              }}>
              <Upload size={24} className="mx-auto mb-2" style={{ color: ACCENT }} />
              <p className="text-sm font-medium" style={{ color: "#2D000A" }}>Drop images here or click to browse</p>
              <p className="text-xs mt-1" style={{ color: ACCENT }}>PNG, JPG, WEBP</p>
            </div>
          </div>

          {/* Image grid */}
          <div className="px-6 pb-6">
            {loadingImgs ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="aspect-square rounded-xl animate-pulse" style={{ background: "#F5D0D8" }} />
                ))}
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
                    <div className="relative w-full h-full rounded-xl overflow-hidden"
                      style={{ border: "1px solid #F5D0D8", background: "#FDF0F3" }}>
                      <Image src={img.url} alt={img.name} fill className="object-contain p-1" sizes="150px" unoptimized />
                    </div>
                    <button
                      onClick={() => deleteImage(img.name)}
                      disabled={deleting === img.name}
                      className="absolute top-1 right-1 w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ background: "#ef4444", color: "white" }}>
                      {deleting === img.name ? <span className="text-[9px] font-bold">…</span> : <Trash2 size={11} />}
                    </button>
                    <p className="text-[9px] truncate mt-1 text-center" style={{ color: ACCENT }} title={img.name}>
                      {img.name.replace(/^\d+-/, "")}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Writing limit panel ── */}
        <div className="rounded-2xl overflow-hidden self-start"
          style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}>
          <div className="px-6 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
            <p className="font-bold text-base" style={{ color: "#2D000A" }}>Writing Limit</p>
            <p className="text-xs mt-0.5" style={{ color: ACCENT }}>Max characters for {cfg.label}</p>
          </div>
          <div className="p-6 space-y-4">
            <div className="text-center">
              <span className="text-6xl">{SHAPE_ICONS[activeShape]}</span>
              <p className="text-sm font-semibold mt-2" style={{ color: "#2D000A" }}>{cfg.label}</p>
              <p className="text-xs mt-0.5" style={{ color: ACCENT }}>
                Current limit: <strong>{cfg.max_chars}</strong> letter{cfg.max_chars !== 1 ? "s" : ""}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold mb-1.5 uppercase tracking-widest" style={{ color: ACCENT }}>
                Max Letters
              </label>
              <input
                type="number" min={1} max={100}
                value={draft[activeShape] ?? cfg.max_chars}
                onChange={e => setDraft(d => ({ ...d, [activeShape]: parseInt(e.target.value) || 1 }))}
                className="w-full text-center text-2xl font-bold border-2 rounded-xl px-4 py-3 outline-none transition-all"
                style={{
                  borderColor: changed ? ACCENT : "#F5D0D8",
                  color: "#2D000A",
                  background: "#FDF0F3",
                }}
              />
            </div>

            <button
              onClick={saveLimit}
              disabled={!changed || savingLimit}
              className="w-full py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: changed && !savingLimit ? ACCENT : "#F5D0D8",
                color:      changed && !savingLimit ? "white"  : "#A05068",
                cursor:     changed && !savingLimit ? "pointer" : "not-allowed",
              }}>
              {savingLimit ? "Saving…" : "Save Limit"}
            </button>

            <p className="text-[11px] text-center" style={{ color: "#A05068" }}>
              Customers writing on a {cfg.label} will be limited to {draft[activeShape] ?? cfg.max_chars} character{(draft[activeShape] ?? cfg.max_chars) !== 1 ? "s" : ""}.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
