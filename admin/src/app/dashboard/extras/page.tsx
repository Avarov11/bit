"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, Trash2, ImageIcon, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import Image from "next/image";

interface MediaItem {
  name: string;
  url: string;
}

const TABS = [
  { key: "candles",  label: "🕯️ Candles",  api: "/api/candles",  color: "#F59E0B", desc: "Candle designs" },
  { key: "balloons", label: "🎈 Balloons", api: "/api/balloons", color: "#8B5CF6", desc: "Balloon designs" },
  { key: "cards",    label: "🎴 Cards",    api: "/api/cards",    color: "#10B981", desc: "Greeting cards"  },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function ExtrasPage() {
  const [activeTab,  setActiveTab]  = useState<TabKey>("candles");
  const [items,      setItems]      = useState<MediaItem[]>([]);
  const [hidden,     setHidden]     = useState<Set<string>>(new Set());
  const [loading,    setLoading]    = useState(false);
  const [uploading,  setUploading]  = useState(false);
  const [deleting,   setDeleting]   = useState<string | null>(null);
  const [toggling,   setToggling]   = useState<string | null>(null);
  const [dragging,   setDragging]   = useState(false);
  const [toast,      setToast]      = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const tab = TABS.find((t) => t.key === activeTab)!;

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  const loadItems = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch(tab.api).then((r) => r.json()),
      fetch(`/api/extras-visibility?type=${activeTab}`).then((r) => r.json()),
    ])
      .then(([data, vis]: [MediaItem[], { hidden: string[] }]) => {
        setItems(Array.isArray(data) ? data : []);
        setHidden(new Set(vis.hidden ?? []));
      })
      .finally(() => setLoading(false));
  }, [tab.api, activeTab]);

  useEffect(() => { loadItems(); }, [loadItems]);

  async function uploadFiles(files: FileList | File[]) {
    const fileArr = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!fileArr.length) { showToast("Please select image files only.", false); return; }

    setUploading(true);
    const fd = new FormData();
    fileArr.forEach((f) => fd.append("files", f));

    const res  = await fetch(tab.api, { method: "POST", body: fd });
    const data = await res.json() as { uploaded: string[]; errors: string[] };

    if (data.errors?.length) showToast(`${data.uploaded.length} uploaded, ${data.errors.length} failed.`, false);
    else showToast(`${data.uploaded.length} image${data.uploaded.length !== 1 ? "s" : ""} uploaded.`, true);

    setUploading(false);
    loadItems();
  }

  async function deleteItem(name: string) {
    setDeleting(name);
    const res  = await fetch(tab.api, {
      method:  "DELETE",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name }),
    });
    const data = await res.json() as { success?: boolean; error?: string };
    if (data.success) {
      setItems((prev) => prev.filter((s) => s.name !== name));
      setHidden((prev) => { const n = new Set(prev); n.delete(name); return n; });
      showToast("Deleted.", true);
    } else {
      showToast(data.error ?? "Delete failed.", false);
    }
    setDeleting(null);
  }

  async function toggleVisibility(name: string) {
    setToggling(name);
    const res  = await fetch("/api/extras-visibility", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ type: activeTab, name }),
    });
    const data = await res.json() as { hidden?: boolean; error?: string };
    if (typeof data.hidden === "boolean") {
      setHidden((prev) => {
        const n = new Set(prev);
        data.hidden ? n.add(name) : n.delete(name);
        return n;
      });
      showToast(data.hidden ? "Hidden from customers." : "Now visible to customers.", true);
    } else {
      showToast(data.error ?? "Failed.", false);
    }
    setToggling(null);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files.length) uploadFiles(e.dataTransfer.files);
  }

  const visibleCount = items.filter((i) => !hidden.has(i.name)).length;
  const hiddenCount  = items.filter((i) =>  hidden.has(i.name)).length;

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#FDF0F3" }}>
      {/* Toast */}
      {toast && (
        <div
          className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{
            background: toast.ok ? "#dcfce7" : "#fee2e2",
            color:      toast.ok ? "#166534" : "#991b1b",
            border:     `1px solid ${toast.ok ? "#86efac" : "#fca5a5"}`,
          }}
        >
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Extras Library</h1>
        <p className="text-sm mt-1" style={{ color: "#800020" }}>Upload and manage candles, balloons, and card designs</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-5 py-2.5 rounded-full text-sm font-semibold transition-all"
            style={{
              background: activeTab === t.key ? t.color : "white",
              color:      activeTab === t.key ? "white" : "#2D000A",
              border:     `2px solid ${activeTab === t.key ? t.color : "#F5D0D8"}`,
              boxShadow:  activeTab === t.key ? `0 2px 12px ${t.color}40` : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}
      >
        {/* Panel header */}
        <div
          className="px-6 py-4 flex items-center justify-between flex-wrap gap-3"
          style={{ borderBottom: "1px solid #F5D0D8", background: `${tab.color}08` }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ background: `${tab.color}18` }}
            >
              <ImageIcon size={18} style={{ color: tab.color }} />
            </div>
            <div>
              <p className="font-bold text-base" style={{ color: "#2D000A" }}>{tab.label}</p>
              <p className="text-xs" style={{ color: "#800020" }}>
                {visibleCount} active
                {hiddenCount > 0 && <span className="ml-1 opacity-60">· {hiddenCount} hidden</span>}
              </p>
            </div>
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all"
            style={{ background: tab.color, color: "white", opacity: uploading ? 0.6 : 1 }}
          >
            <Upload size={14} />
            {uploading ? "Uploading…" : "Upload"}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && uploadFiles(e.target.files)}
          />
        </div>

        {/* Drop zone + grid */}
        <div className="p-6">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className="border-2 border-dashed rounded-xl p-8 mb-6 text-center cursor-pointer transition-all"
            style={{
              borderColor: dragging ? tab.color : "#F5D0D8",
              background:  dragging ? `${tab.color}08` : "#FDF0F3",
            }}
          >
            <Upload size={28} className="mx-auto mb-2" style={{ color: dragging ? tab.color : "#800020" }} />
            <p className="text-sm font-medium" style={{ color: "#2D000A" }}>Drop images here or click to browse</p>
            <p className="text-xs mt-1" style={{ color: "#800020" }}>PNG, JPG, WEBP — multiple files OK</p>
          </div>

          {/* Grid */}
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
              <p className="text-xs mt-1" style={{ color: "#800020", opacity: 0.6 }}>
                Upload the first one above — the bucket will be created automatically.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {items.map((item) => {
                const isHidden  = hidden.has(item.name);
                const isToggling = toggling === item.name;
                return (
                  <div key={item.name} className="group relative">
                    <div
                      className="relative w-full rounded-xl overflow-hidden aspect-square transition-opacity"
                      style={{
                        border:   "1px solid #F5D0D8",
                        background: "#FDF0F3",
                        opacity:  isHidden ? 0.45 : 1,
                      }}
                    >
                      <Image
                        src={item.url}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="120px"
                        unoptimized
                      />

                      {/* Hidden badge */}
                      {isHidden && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-[9px] font-bold bg-gray-800 text-white px-1.5 py-0.5 rounded-full">
                            HIDDEN
                          </span>
                        </div>
                      )}

                      {/* Action buttons — visible on hover */}
                      <div className="absolute inset-0 flex items-end justify-between p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {/* Toggle visibility */}
                        <button
                          onClick={() => toggleVisibility(item.name)}
                          disabled={isToggling}
                          title={isHidden ? "Show to customers" : "Hide from customers"}
                          className="w-6 h-6 rounded-lg flex items-center justify-center transition-colors"
                          style={{
                            background: isHidden ? "#3B82F6" : "#6B7280",
                            color: "white",
                          }}
                        >
                          {isToggling
                            ? <span className="text-[9px] font-bold">…</span>
                            : isHidden
                              ? <Eye size={11} />
                              : <EyeOff size={11} />
                          }
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => deleteItem(item.name)}
                          disabled={deleting === item.name}
                          title="Delete"
                          className="w-6 h-6 rounded-lg flex items-center justify-center"
                          style={{ background: "#ef4444", color: "white" }}
                        >
                          {deleting === item.name
                            ? <span className="text-[9px] font-bold">…</span>
                            : <Trash2 size={11} />
                          }
                        </button>
                      </div>
                    </div>

                    <p
                      className="text-[9px] truncate mt-1 text-center"
                      style={{ color: isHidden ? "#aaa" : "#800020" }}
                      title={item.name}
                    >
                      {item.name.replace(/^\d+-/, "")}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
