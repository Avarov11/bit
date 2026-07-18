"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, Eye, EyeOff, ChevronUp, ChevronDown,
  Upload, X, Monitor, Smartphone, CheckCircle2, AlertCircle, Images,
} from "lucide-react";
import Image from "next/image";

interface Slide {
  id:          string;
  desktop_url: string | null;
  mobile_url:  string | null;
  hidden:      boolean;
  sort_order:  number;
}

interface HeroImage {
  name: string;
  url:  string;
}

interface SiteSettings {
  logo_url?: string;
}

// which slot the picker is assigning to
type PickerTarget = { slideId: string; type: "desktop" | "mobile" } | null;

const SLIDE_HINTS = [
  "Qatar's Premier Brownie Brand",
  "Custom brownie step-by-step",
  "Accessories collection",
  "Bride to Be collection",
  "Gender Reveal",
];

export default function SlideshowPage() {
  const [slides,        setSlides]        = useState<Slide[]>([]);
  const [heroImages,    setHeroImages]    = useState<HeroImage[]>([]);
  const [logoUrl,       setLogoUrl]       = useState<string | null>(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState<{ msg: string; ok: boolean } | null>(null);
  const [adding,        setAdding]        = useState(false);
  const [deleting,      setDeleting]      = useState<string | null>(null);
  const [uploading,     setUploading]     = useState<string | null>(null);
  const [picker,        setPicker]        = useState<PickerTarget>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);

  const desktopRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const mobileRefs  = useRef<Record<string, HTMLInputElement | null>>({});

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const loadSlides = useCallback(async () => {
    const res  = await fetch("/api/slideshow");
    const data = await res.json();
    if (Array.isArray(data)) setSlides(data.sort((a: Slide, b: Slide) => a.sort_order - b.sort_order));
    setLoading(false);
  }, []);

  const loadHeroImages = useCallback(async () => {
    const res  = await fetch("/api/hero-images");
    const data = await res.json();
    if (Array.isArray(data)) setHeroImages(data);
  }, []);

  const loadLogo = useCallback(async () => {
    const res  = await fetch("/api/logo");
    const data = await res.json();
    if (data?.url) setLogoUrl(data.url);
  }, []);

  useEffect(() => { loadSlides(); loadHeroImages(); loadLogo(); }, [loadSlides, loadHeroImages, loadLogo]);

  async function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingLogo(true);
    const form = new FormData();
    form.append("file", file);
    const res  = await fetch("/api/logo", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) { setLogoUrl(data.url); showToast("Logo updated.", true); loadHeroImages(); }
    else showToast(data.error ?? "Upload failed.", false);
    e.target.value = "";
    setUploadingLogo(false);
  }

  // ── Mutations ──────────────────────────────────────────────────────────────

  async function addSlide() {
    setAdding(true);
    const res  = await fetch("/api/slideshow", { method: "POST" });
    const data = await res.json();
    if (res.ok) { setSlides(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order)); showToast("Slide added.", true); }
    else showToast(data.error ?? "Failed.", false);
    setAdding(false);
  }

  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    setDeleting(id);
    const res = await fetch("/api/slideshow", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setSlides(prev => prev.filter(s => s.id !== id)); showToast("Deleted.", true); }
    else showToast("Failed to delete.", false);
    setDeleting(null);
  }

  async function toggleHide(slide: Slide) {
    const res = await fetch("/api/slideshow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slide.id, hidden: !slide.hidden }) });
    if (res.ok) setSlides(prev => prev.map(s => s.id === slide.id ? { ...s, hidden: !s.hidden } : s));
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
    }).sort((a, b) => a.sort_order - b.sort_order));
  }

  // Pick an existing hero image and assign it to a slide slot
  async function pickImage(url: string) {
    if (!picker) return;
    const { slideId, type } = picker;
    const column = type === "desktop" ? "desktop_url" : "mobile_url";
    const res = await fetch("/api/slideshow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slideId, [column]: url }) });
    if (res.ok) {
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [column]: url } : s));
      showToast("Image assigned.", true);
    }
    setPicker(null);
  }

  // Upload a brand-new file to the hero bucket
  async function handleImageFile(e: React.ChangeEvent<HTMLInputElement>, slideId: string, type: "desktop" | "mobile") {
    const file = e.target.files?.[0];
    if (!file) return;
    const key = `${slideId}-${type}`;
    setUploading(key);
    const form = new FormData();
    form.append("file", file);
    form.append("slideId", slideId);
    form.append("type", type);
    const res  = await fetch("/api/slideshow-image", { method: "POST", body: form });
    const data = await res.json();
    if (res.ok) {
      const column = type === "desktop" ? "desktop_url" : "mobile_url";
      setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [column]: data.url } : s));
      showToast("Uploaded.", true);
      loadHeroImages(); // refresh bucket list
    } else {
      showToast(data.error ?? "Upload failed.", false);
    }
    e.target.value = "";
    setUploading(null);
  }

  // Remove image from slide (just clears the DB field, keeps file in bucket)
  async function removeImage(slideId: string, type: "desktop" | "mobile") {
    const column = type === "desktop" ? "desktop_url" : "mobile_url";
    const res = await fetch("/api/slideshow", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slideId, [column]: null }) });
    if (res.ok) { setSlides(prev => prev.map(s => s.id === slideId ? { ...s, [column]: null } : s)); showToast("Removed.", true); }
  }

  const sorted = [...slides].sort((a, b) => a.sort_order - b.sort_order);
  const active  = sorted.filter(s => !s.hidden).length;
  const hidden  = sorted.filter(s =>  s.hidden).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {toast.msg}
        </div>
      )}

      {/* Image picker modal */}
      {picker && (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4" onClick={() => setPicker(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          <div className="relative z-10 bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()}>
            {/* Picker header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <p className="font-bold text-gray-900">Pick from Hero Bucket</p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Selecting {picker.type} image · {heroImages.length} images available
                </p>
              </div>
              <button onClick={() => setPicker(null)} className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                <X size={16} className="text-gray-500" />
              </button>
            </div>

            {/* Upload new to bucket */}
            <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
              <label className="flex items-center gap-2 cursor-pointer w-fit">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-dashed border-gray-300 text-xs font-semibold text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors">
                  <Upload size={13} /> Upload new image to bucket
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={async e => {
                  const file = e.target.files?.[0];
                  if (!file || !picker) return;
                  await handleImageFile(e, picker.slideId, picker.type);
                  setPicker(null);
                }} />
              </label>
            </div>

            {/* Image grid */}
            <div className="flex-1 overflow-y-auto p-4">
              {heroImages.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-8">No images in hero bucket yet.</p>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {heroImages.map(img => (
                    <button
                      key={img.name}
                      onClick={() => pickImage(img.url)}
                      className="group relative aspect-video rounded-xl overflow-hidden border-2 border-gray-100 hover:border-[#800020] transition-all"
                      title={img.name}
                    >
                      <Image src={img.url} alt={img.name} fill className="object-cover" sizes="160px" />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-end p-1.5">
                        <span className="text-[9px] text-white/0 group-hover:text-white/90 font-medium truncate w-full transition-all">
                          {img.name}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hero Slideshow</h1>
          <p className="text-sm text-gray-400 mt-0.5">
            {active} active · {hidden} hidden · {heroImages.length} images in bucket
          </p>
        </div>
        <button onClick={addSlide} disabled={adding}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
          style={{ background: "#800020" }}>
          <Plus size={15} /> {adding ? "Adding…" : "Add slide"}
        </button>
      </div>

      {/* ── Logo ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
          <div>
            <p className="text-sm font-bold text-gray-800">Site Logo</p>
            <p className="text-xs text-gray-400 mt-0.5">Shown in the navbar across all pages</p>
          </div>
          <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
          <button
            onClick={() => logoInputRef.current?.click()}
            disabled={uploadingLogo}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all disabled:opacity-60"
            style={{ background: "#800020" }}
          >
            {uploadingLogo
              ? <><span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" /> Uploading…</>
              : <><Upload size={14} /> Replace logo</>
            }
          </button>
        </div>
        <div className="p-5 flex items-center gap-6">
          {/* Preview */}
          <div className="w-40 h-16 rounded-xl border border-gray-100 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <Image src={logoUrl} alt="Logo" width={140} height={56} className="object-contain max-h-14 w-auto" />
            ) : (
              <span className="text-xs text-gray-400">No logo</span>
            )}
          </div>
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-1">Current logo</p>
            <p className="text-[11px] text-gray-400 break-all">{logoUrl ?? "Not set"}</p>
          </div>
        </div>
      </div>

      {/* ── Hero bucket image strip ── */}
      {heroImages.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-gray-50">
            <Images size={15} className="text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">Hero Bucket</p>
            <span className="text-xs text-gray-400">{heroImages.length} images</span>
          </div>
          <div className="flex gap-3 p-4 overflow-x-auto">
            {heroImages.map(img => (
              <div key={img.name} className="relative shrink-0 w-28 aspect-video rounded-xl overflow-hidden border border-gray-100 group">
                <Image src={img.url} alt={img.name} fill className="object-cover" sizes="112px" />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4">
                  <p className="text-[8px] text-white/80 truncate font-medium">{img.name}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!loading && sorted.length === 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "#FFF0F5" }}>
            <Monitor size={24} style={{ color: "#800020" }} />
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">No slides yet</p>
          <p className="text-xs text-gray-400">Click "Add slide" to create the first one.</p>
        </div>
      )}

      {/* ── Slide cards ── */}
      <div className="space-y-4">
        {sorted.map((slide, idx) => {
          const isUp   = (t: "desktop" | "mobile") => uploading === `${slide.id}-${t}`;
          return (
            <div key={slide.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              style={{ opacity: slide.hidden ? 0.55 : 1 }}>

              {/* Card header */}
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-50">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-gray-800">Slide {idx + 1}</span>
                  {SLIDE_HINTS[idx] && <span className="text-xs text-gray-400 truncate max-w-[180px]">{SLIDE_HINTS[idx]}</span>}
                  {slide.hidden && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-gray-100 text-gray-400 uppercase tracking-wide">Hidden</span>}
                </div>
                <div className="flex items-center gap-1.5">
                  <button onClick={() => moveSlide(slide.id, -1)} disabled={idx === 0} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-25 transition-colors"><ChevronUp size={14} className="text-gray-500" /></button>
                  <button onClick={() => moveSlide(slide.id, 1)} disabled={idx === sorted.length - 1} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 disabled:opacity-25 transition-colors"><ChevronDown size={14} className="text-gray-500" /></button>
                  <div className="w-px h-4 bg-gray-200 mx-0.5" />
                  <button onClick={() => toggleHide(slide)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors" title={slide.hidden ? "Show" : "Hide"}>
                    {slide.hidden ? <Eye size={14} className="text-gray-400" /> : <EyeOff size={14} style={{ color: "#800020" }} />}
                  </button>
                  <button onClick={() => deleteSlide(slide.id)} disabled={deleting === slide.id} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                    {deleting === slide.id ? <span className="text-[9px] text-red-400">…</span> : <Trash2 size={13} className="text-red-400" />}
                  </button>
                </div>
              </div>

              {/* Desktop + Mobile panels */}
              <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5">
                {(["desktop", "mobile"] as const).map(type => {
                  const url        = type === "desktop" ? slide.desktop_url : slide.mobile_url;
                  const isUploading = isUp(type);
                  const Icon       = type === "desktop" ? Monitor : Smartphone;
                  const aspect     = type === "desktop" ? "aspect-video" : "aspect-[9/16] max-h-48";

                  return (
                    <div key={type}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Icon size={13} className="text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500 capitalize">{type}</span>
                      </div>

                      <div className={`relative ${aspect} rounded-xl overflow-hidden border-2 ${url ? "border-gray-200" : "border-dashed border-gray-200"} bg-gray-50`}>
                        {url ? (
                          <>
                            <Image src={url} alt={type} fill className="object-cover" sizes="400px" />
                            {/* Hover overlay */}
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/50 transition-all flex items-center justify-center gap-2 opacity-0 hover:opacity-100">
                              <button onClick={() => setPicker({ slideId: slide.id, type })}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold shadow hover:scale-105 transition-all">
                                <Images size={11} /> Pick
                              </button>
                              <label className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white text-gray-800 text-xs font-semibold shadow hover:scale-105 transition-all cursor-pointer">
                                <Upload size={11} /> Upload
                                <input type="file" accept="image/*" className="hidden"
                                  onChange={e => handleImageFile(e, slide.id, type)}
                                  ref={el => { if (type === "desktop") desktopRefs.current[slide.id] = el; else mobileRefs.current[slide.id] = el; }} />
                              </label>
                              <button onClick={() => removeImage(slide.id, type)}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500 text-white text-xs font-semibold shadow hover:scale-105 transition-all">
                                <X size={11} /> Clear
                              </button>
                            </div>
                            {isUploading && (
                              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                <span className="w-6 h-6 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                            {isUploading ? (
                              <span className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
                            ) : (
                              <>
                                <button onClick={() => setPicker({ slideId: slide.id, type })}
                                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-gray-200 hover:border-gray-400 text-gray-600 hover:text-gray-800">
                                  <Images size={13} /> Pick from bucket
                                </button>
                                <label className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-colors border border-dashed border-gray-200 hover:border-gray-400 text-gray-400 hover:text-gray-600 cursor-pointer">
                                  <Upload size={13} /> Upload new
                                  <input type="file" accept="image/*" className="hidden"
                                    onChange={e => handleImageFile(e, slide.id, type)}
                                    ref={el => { if (type === "desktop") desktopRefs.current[slide.id] = el; else mobileRefs.current[slide.id] = el; }} />
                                </label>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
