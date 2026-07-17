"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ShapeConfig {
  shape: string;
  label: string;
  max_chars: number;
}

const SHAPE_ICONS: Record<string, string> = {
  cake:   "🎂",
  heart:  "❤️",
  square: "🟫",
};

export default function SettingsPage() {
  const [configs, setConfigs]   = useState<ShapeConfig[]>([]);
  const [loading, setLoading]   = useState(true);
  const [saving,  setSaving]    = useState<string | null>(null);
  const [draft,   setDraft]     = useState<Record<string, number>>({});
  const [toast,   setToast]     = useState<{ msg: string; ok: boolean } | null>(null);

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  useEffect(() => {
    fetch("/api/shape-configs", { cache: "no-store" })
      .then(r => r.json())
      .then((data: ShapeConfig[]) => {
        if (Array.isArray(data)) {
          setConfigs(data);
          const d: Record<string, number> = {};
          data.forEach(c => { d[c.shape] = c.max_chars; });
          setDraft(d);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function save(shape: string) {
    setSaving(shape);
    const res  = await fetch("/api/shape-configs", {
      method:  "PATCH",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ shape, max_chars: draft[shape] }),
    });
    const data = await res.json();
    setSaving(null);
    if (res.ok) {
      setConfigs(prev => prev.map(c => c.shape === shape ? { ...c, max_chars: draft[shape] } : c));
      showToast(`${shape} limit saved.`, true);
    } else {
      showToast(data.error ?? "Save failed.", false);
    }
  }

  return (
    <div className="min-h-screen p-6 md:p-8" style={{ background: "#FDF0F3" }}>
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

      <div className="mb-8">
        <h1 className="text-2xl font-bold" style={{ color: "#2D000A" }}>Settings</h1>
        <p className="text-sm mt-1" style={{ color: "#800020" }}>
          Configure the maximum number of letters allowed per cake shape
        </p>
      </div>

      <div
        className="rounded-2xl overflow-hidden max-w-lg"
        style={{ background: "white", border: "1px solid #F5D0D8", boxShadow: "0 2px 20px rgba(45,0,10,0.06)" }}
      >
        <div className="px-6 py-4" style={{ borderBottom: "1px solid #F5D0D8", background: "#FDF8F9" }}>
          <p className="font-bold text-base" style={{ color: "#2D000A" }}>Writing Limits</p>
          <p className="text-xs mt-0.5" style={{ color: "#800020" }}>
            Max characters a customer can write on each shape
          </p>
        </div>

        <div className="divide-y" style={{ borderColor: "#F5D0D8" }}>
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="px-6 py-5 flex items-center justify-between gap-4">
                  <div className="h-5 w-32 rounded-lg animate-pulse" style={{ background: "#F5D0D8" }} />
                  <div className="h-10 w-24 rounded-xl animate-pulse" style={{ background: "#F5D0D8" }} />
                </div>
              ))
            : configs.map(cfg => {
                const changed = draft[cfg.shape] !== cfg.max_chars;
                return (
                  <div key={cfg.shape} className="px-6 py-5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{SHAPE_ICONS[cfg.shape] ?? "🎂"}</span>
                      <div>
                        <p className="font-semibold text-sm" style={{ color: "#2D000A" }}>{cfg.label}</p>
                        <p className="text-xs" style={{ color: "#800020" }}>
                          Currently: {cfg.max_chars} letter{cfg.max_chars !== 1 ? "s" : ""}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={draft[cfg.shape] ?? cfg.max_chars}
                        onChange={e => setDraft(d => ({ ...d, [cfg.shape]: parseInt(e.target.value) || 1 }))}
                        className="w-20 text-center border rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2"
                        style={{
                          borderColor: "#F5D0D8",
                          color: "#2D000A",
                          background: "#FDF0F3",
                          focusRingColor: "#800020",
                        }}
                      />
                      <button
                        onClick={() => save(cfg.shape)}
                        disabled={!changed || saving === cfg.shape}
                        className="px-4 py-2 rounded-xl text-xs font-bold transition-all"
                        style={{
                          background: changed && saving !== cfg.shape ? "#800020" : "#F5D0D8",
                          color:      changed && saving !== cfg.shape ? "white"    : "#A05068",
                          cursor:     changed && saving !== cfg.shape ? "pointer"  : "not-allowed",
                        }}
                      >
                        {saving === cfg.shape ? "Saving…" : "Save"}
                      </button>
                    </div>
                  </div>
                );
              })}
        </div>
      </div>
    </div>
  );
}
