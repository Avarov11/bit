"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown,
  Upload, X, Monitor, Smartphone, CheckCircle2, AlertCircle,
} from "lucide-react";
import Image from "next/image";

interface Slide {
  id: string;
  desktop_url: string | null;
  mobile_url:  string | null;
  hidden:      boolean;
  sort_order:  number;
}

function Toast({ msg, ok, onDone }: { msg: string; ok: boolean; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);
  return (
    <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
      {ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
      {msg}
    </div>
  );
}

export default function SlideshowPage() {
  const [slides,   setSlides]   = useState<Slide[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [toast,    setToast]    = useState<{ msg: string; ok: boolean } | null>(null);
  const [adding,   setAdding]   = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [uploading,setUploading]= useState<string | null>(null); // "{id}-desktop" | "{id}-mobile"

  const desktopRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mobileRefs  = useRef<Record<string, HTMLInputElement | null>>({});

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
  }

  const load = useCallback(async () => {
    const res = await fetch("/api/slideshow");
    const data = await res.json();
    if (Array.isArray(data)) {
      setSlides(data.sort((a: Slide, b: Slide) => a.sort_order - b.sort_order));
    }
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  async function addSlide() {
    setAdding(true);
    const res = await fetch("/api/slideshow", { method: "POST" });
    const data = await res.json();
    if (res.ok) {
      setSlides(prev => [...prev, data]);
      showToast("Slide added.", true);
    } else {
      showToast(data.error ?? "Failed.", false);
    }
    setAdding(false);
  }

  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide and its images?")) return;
    setDeleting(id);
    const res = await fetch("/api/slideshow", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    if (res.ok) {
      setSlides(prev => prev.filter(s => s.id !== id));
      showToast("Slide deleted.", true);
    } else {
      showToast("Failed to delete.", false);
    }
    setDeleting(null);
  }

  async function toggleHide(slide: Slide) {
    const res = await fetch("/api/slideshow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: slide.id, hidden: !slide.hidden }),
    });
    if (res.ok) {
      setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, hidden: !s.hidden } : s));
    }
  }

  async function moveSlide(id: string, direction: -1 | 1) {
    const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);
    const idx    = sorted.findIndex(s => s.id === id);
    const other  = sorted[idx + direction];
    if (!other) return;

    const aOrder = sorted[idx].sort_order;
    const bOrder = other.sort_order;

    await Promise.all([
      fetch("/api/slideshow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sorted[idx].id, sort_order: bOrder }) }),
      fetch("/api/slideshow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: other.id, sort_order: aOrder }) }),
    ]);

    setSlides(prev => prev.map(s => {
      if (s.id === sorted[idx].id) return { ...s, sort_order: bOrder };
      if (s.id === other.id)       return { ...s, sort_order: aOrder };
      return s;
    }));
  }

  async function handleImageFile(
    e: React.ChangeEvent<HTMLInputElement>,
    slideId: string,
    type: "desktop" | "mobile"
  ) {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = `${slideId}-${type}`;
    setUploading(key);

    const form = new FormData();
    form.append("file",    file);
    form.append("slideId", slideId);
    form.append("type",    type);

    const res  = await fetch("/api/slideshow-image", { method: "POST", body: form });
    const data = await res.json();

    if (res.ok) {
      const column = type === "desktop" ? "desktop_url" : "mobile_url";
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [column]: data.url } : s));
      showToast("Image uploaded.", true);
    } else {
      showToast(data.error ?? "Upload failed.", false);
    }

    // Reset input so same file can be re-uploaded
    e.target.value = "";
    setUploading(null);
  }

  async function removeImage(slideId: string, type: "desktop" | "mobile") {
    const res = await fetch("/api/slideshow-image", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slideId, type }),
    });
    if (res.ok) {
      const column = type === "desktop" ? "desktop_url" : "mobile_url";
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [column]: null } : s));
      showToast("Image removed.", true);
    }
  }

  const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);
  const active = sorted.filter(s => !s.hidden).length;
  const hidden = sorted.filter(s =>  s.hidden).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {toast && <Toast msg={toast.msg} ok={toast.ok} onDone={() => setToast(null)} />}

      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Slideshow</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {active} active · {hidden} hidden · desktop + mobile images per slide
          </p>
        </div>
        <button
          onClick={addSlide}
          disabled={adding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: "#800020" }}
        >
          <Plus size={15} />
          {adding ? "Adding…" : "Add slide"}
        </button>
      </div>

      {/* Empty state */}
      {!loading && sorted.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF0F5" }}>
            <Monitor size={24} style={{ color: "#800020" }} />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No slides yet</p>
          <p className="text-xs text-gray-400">Click "Add slide" to create the first one.</p>
        </div>
      )}

      {/* Slide cards */}
      <div className="space-y-4">
        {sorted.map((slide, idx) => {
          const isUploading = (t: "desktop" | "mobile") => uploading === `${slide.id}-${t}`;
          return (
            <div
              key={slide.id}
              className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden transition-all"
              style={{ opacity: slide.hidden ? 0.55 : 1 }}
            >
              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">Slide {idx + 1}</span>
                  {slide.hidden && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 uppercase tracking-wide">
                      Hidden
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {/* Move up */}
                  <button
                    onClick={() => moveSlide(slide.id, -1)}
                    disabled={idx === 0}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 disabled:opacity-25"
                    title="Move up"
                  >
                    <ChevronUp size={14} className="text-gray-500" />
                  </button>
                  {/* Move down */}
                  <button
                    onClick={() => moveSlide(slide.id, 1)}
                    disabled={idx === sorted.length - 1}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100 disabled:opacity-25"
                    title="Move down"
                  >
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  <div className="w-px h-4 bg-gray-200 mx-0.5" />

                  {/* Hide/show toggle */}
                  <button
                    onClick={() => toggleHide(slide)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-gray-100"
                    title={slide.hidden ? "Show slide" : "Hide slide"}
                  >
                    {slide.hidden
                      ? <Eye     size={14} className="text-gray-400" />
                      : <EyeOff  size={14} style={{ color: "#800020" }} />
                    }
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => deleteSlide(slide.id)}
                    disabled={deleting === slide.id}
                    className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors hover:bg-red-50"
                    title="Delete slide"
                  >
                    {deleting === slide.id
                      ? <span className="text-[9px] text-red-400">…</span>
                      : <Trash2 size={13} className="text-red-400" />
                    }
                  </button>
                </div>
              </div>

              {/* Image panels */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">

                {/* Desktop */}
                <ImagePanel
                  label="Desktop"
                  Icon={Monitor}
                  url={slide.desktop_url}
                  uploading={isUploading("desktop")}
                  aspectClass="aspect-video"
                  onUpload={() => desktopRefs.current[slide.id]?.click()}
                  onRemove={() => removeImage(slide.id, "desktop")}
                />
                <input
                  ref={el => { desktopRefs.current[slide.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageFile(e, slide.id, "desktop")}
                />

                {/* Mobile */}
                <ImagePanel
                  label="Mobile"
                  Icon={Smartphone}
                  url={slide.mobile_url}
                  uploading={isUploading("mobile")}
                  aspectClass="aspect-[9/16] max-h-60"
                  onUpload={() => mobileRefs.current[slide.id]?.click()}
                  onRemove={() => removeImage(slide.id, "mobile")}
                />
                <input
                  ref={el => { mobileRefs.current[slide.id] = el; }}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => handleImageFile(e, slide.id, "mobile")}
                />

              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ImagePanel({
  label, Icon, url, uploading, aspectClass, onUpload, onRemove,
}: {
  label:       string;
  Icon:        React.ElementType;
  url:         string | null;
  uploading:   boolean;
  aspectClass: string;
  onUpload:    () => void;
  onRemove:    () => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon size={13} className="text-gray-400" />
        <span className="text-xs font-semibold text-gray-500">{label}</span>
      </div>

      <div className={`relative ${aspectClass} rounded-xl overflow-hidden border-2 ${url ? "border-gray-200" : "border-dashed border-gray-200"} bg-gray-50`}>
        {url ? (
          <>
            <Image src={url} alt={label} fill className="object-cover" sizes="400px" />
            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-all duration-200 flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
              <button
                onClick={onUpload}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold shadow transition-all hover:scale-105"
              >
                <Upload size={12} /> Replace
              </button>
              <button
                onClick={onRemove}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold shadow transition-all hover:scale-105"
              >
                <X size={12} /> Remove
              </button>
            </div>
          </>
        ) : (
          <button
            onClick={onUpload}
            disabled={uploading}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            ) : (
              <Upload size={20} />
            )}
            <span className="text-xs font-medium">
              {uploading ? "Uploading…" : `Upload ${label.toLowerCase()} image`}
            </span>
          </button>
        )}

        {/* Uploading overlay when replacing */}
        {uploading && url && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
