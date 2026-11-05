"use client";
import React, { useState, useMemo } from "react";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_META: Record<OrderStatus, {
  label: string; color: string; bg: string; stripe: string; dot: string;
}> = {
  pending_payment: { label: "Awaiting Payment", color: "text-orange-700",  bg: "bg-orange-50",  stripe: "#F97316", dot: "bg-orange-400"  },
  paid:            { label: "Paid",             color: "text-teal-700",    bg: "bg-teal-50",    stripe: "#14B8A6", dot: "bg-teal-500"    },
  payment_failed:  { label: "Failed",           color: "text-rose-700",    bg: "bg-rose-50",    stripe: "#F43F5E", dot: "bg-rose-500"    },
  pending:         { label: "Pending",          color: "text-amber-700",   bg: "bg-amber-50",   stripe: "#F59E0B", dot: "bg-amber-400"   },
  confirmed:       { label: "Confirmed",        color: "text-blue-700",    bg: "bg-blue-50",    stripe: "#3B82F6", dot: "bg-blue-500"    },
  preparing:       { label: "Preparing",        color: "text-violet-700",  bg: "bg-violet-50",  stripe: "#8B5CF6", dot: "bg-violet-500"  },
  ready:           { label: "Ready",            color: "text-emerald-700", bg: "bg-emerald-50", stripe: "#10B981", dot: "bg-emerald-500" },
  delivered:       { label: "Delivered",        color: "text-gray-500",    bg: "bg-gray-100",   stripe: "#9CA3AF", dot: "bg-gray-400"    },
  cancelled:       { label: "Cancelled",        color: "text-red-600",     bg: "bg-red-50",     stripe: "#EF4444", dot: "bg-red-400"     },
};

// Timeline reflects the SADAD payment flow: paid → confirmed → preparing → ready → delivered
const TIMELINE_STEPS: OrderStatus[] = ["paid", "confirmed", "preparing", "ready", "delivered"];
// All statuses shown in filter pills
const ALL_STATUSES: OrderStatus[] = [
  "paid", "pending_payment", "payment_failed",
  "confirmed", "preparing", "ready", "delivered", "cancelled",
];
// Statuses an admin can manually set (excludes payment-system-managed states)
const ADMIN_STATUSES: OrderStatus[] = ["paid", "confirmed", "preparing", "ready", "delivered", "cancelled"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const m = STATUS_META[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wide ${m.color} ${m.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${m.dot}`} />
      {m.label}
    </span>
  );
}

// ─── Order Timeline ───────────────────────────────────────────────────────────

function OrderTimeline({ status }: { status: OrderStatus }) {
  const activeIdx   = TIMELINE_STEPS.indexOf(status);
  const isCancelled = status === "cancelled" || status === "payment_failed";

  return (
    <div className="flex items-start w-full">
      {TIMELINE_STEPS.map((step, i) => {
        const m      = STATUS_META[step];
        const isPast = !isCancelled && i < activeIdx;
        const isCurr = !isCancelled && i === activeIdx;
        const isLast = i === TIMELINE_STEPS.length - 1;

        const node = (
          <div className="flex flex-col items-center shrink-0">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-all ${
                isCurr ? `${m.bg} ${m.color}` :
                isPast ? "bg-emerald-500 border-emerald-500 text-white" :
                         "bg-white border-gray-200 text-gray-400"
              }`}
              style={isCurr ? { borderColor: m.stripe, boxShadow: `0 0 0 3px ${m.stripe}33` } : {}}
            >
              {isPast ? (
                <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3}>
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (i + 1)}
            </div>
            <span className={`mt-1.5 text-[8px] font-bold uppercase tracking-wide text-center leading-tight ${
              isCurr ? m.color : isPast ? "text-emerald-600" : "text-gray-300"
            }`}>
              {m.label}
            </span>
          </div>
        );

        if (isLast) return <div key={step}>{node}</div>;

        return (
          <div key={step} className="flex-1 flex items-start">
            {node}
            <div className={`flex-1 h-0.5 mt-[13px] mx-1.5 rounded-full transition-all ${
              isPast ? "bg-emerald-400" : "bg-gray-200"
            }`} />
          </div>
        );
      })}
    </div>
  );
}

// ─── Item Detail ──────────────────────────────────────────────────────────────

function ItemDetail({ item, orderId, itemIndex, onExtrasUpdated }: {
  item: OrderItem;
  orderId: string;
  itemIndex: number;
  onExtrasUpdated: (items: OrderItem[]) => void;
}) {
  const c = item.customization;

  // Extras get their own visual blocks — exclude them from the generic pills
  const EXTRAS = new Set(["Candles", "Balloons", "Card"]);
  const baseToppings = (c?.toppings ?? []).filter((t) => !EXTRAS.has(t));
  const hasCandles   = c?.toppings?.includes("Candles") ?? false;

  // ── Edit Extras state ──────────────────────────────────────────
  const [editing,        setEditing]        = React.useState(false);
  const [saving,         setSaving]         = React.useState(false);
  const [editCandleUrl,  setEditCandleUrl]  = React.useState<string | null>(c?.candleUrl ?? null);
  const [editBalloonUrl, setEditBalloonUrl] = React.useState<string | null>(c?.balloonUrl ?? null);
  const [editCardUrl,    setEditCardUrl]    = React.useState<string | null>(c?.cardUrl ?? null);
  const [candleImages,   setCandleImages]   = React.useState<{ name: string; url: string }[]>([]);
  const [balloonImages,  setBalloonImages]  = React.useState<{ name: string; url: string }[]>([]);
  const [cardImages,     setCardImages]     = React.useState<{ name: string; url: string }[]>([]);
  const [imagesLoaded,   setImagesLoaded]   = React.useState(false);

  const openEditor = async () => {
    setEditCandleUrl(c?.candleUrl ?? null);
    setEditBalloonUrl(c?.balloonUrl ?? null);
    setEditCardUrl(c?.cardUrl ?? null);
    setEditing(true);
    if (!imagesLoaded) {
      const [cn, b, ca] = await Promise.all([
        fetch("/api/candles").then((r) => r.json()).catch(() => []),
        fetch("/api/balloons").then((r) => r.json()).catch(() => []),
        fetch("/api/cards").then((r) => r.json()).catch(() => []),
      ]);
      if (Array.isArray(cn)) setCandleImages(cn);
      if (Array.isArray(b))  setBalloonImages(b);
      if (Array.isArray(ca)) setCardImages(ca);
      setImagesLoaded(true);
    }
  };

  const saveExtras = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/orders/extras", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, itemIndex, candleUrl: editCandleUrl, balloonUrl: editBalloonUrl, cardUrl: editCardUrl }),
      });
      if (res.ok) {
        const { items } = await res.json();
        onExtrasUpdated(items);
        setEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  const details = [
    c?.shape  && c.shape,
    c?.flavor && c.flavor,
    c?.color  && c.color,
    baseToppings.length && baseToppings.join(", "),
  ].filter(Boolean) as string[];

  return (
    <div className="p-3 bg-gray-50 rounded-xl border border-gray-100">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <span className="font-semibold text-gray-900 text-sm">{item.productName}</span>
          <span className="ml-2 text-xs text-brand-700 font-bold">×{item.quantity}</span>
        </div>
        <span className="text-xs font-semibold text-gray-500 shrink-0">{item.subtotal} QAR</span>
      </div>
      {details.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {details.map((d, i) => (
            <span key={i} className="px-2 py-0.5 bg-white border border-gray-200 rounded-full text-[11px] text-gray-500 font-medium">
              {d}
            </span>
          ))}
        </div>
      )}
      {c?.message && (
        <div className="mt-2 flex items-start gap-1.5">
          <span className="text-sm leading-none mt-0.5">✍️</span>
          <p className="text-xs text-gray-600 italic bg-white rounded-lg px-2.5 py-1.5 border border-gray-200 flex-1">
            &ldquo;{c.message}&rdquo;
          </p>
        </div>
      )}

      {/* ── Candles: multi-design (product page picker) ──────────── */}
      {c?.candles && c.candles.length > 0 && (
        <div className="mt-2 rounded-xl overflow-hidden border border-amber-100 bg-amber-50">
          <div className="px-3 py-1.5 bg-amber-100/60 flex items-center gap-2">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">🕯️ Candles</span>
            <span className="text-[10px] text-amber-600">× {c.candles.reduce((s, i) => s + i.qty, 0)} total</span>
          </div>
          <div className="p-2 bg-white grid grid-cols-5 gap-1.5">
            {c.candles.map((d, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-amber-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.url} alt="" className="w-full aspect-square object-cover" />
                <span className="absolute bottom-0 right-0 bg-amber-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md leading-none">×{d.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Candles: single design (cake customizer) ─────────────── */}
      {(hasCandles || c?.candleUrl) && !(c?.candles?.length) && (
        <div className="mt-2 rounded-xl overflow-hidden border border-amber-100 bg-amber-50">
          <div className="flex items-center justify-between px-3 py-1.5 bg-amber-100/60">
            <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">🕯️ Candles</span>
            {c?.candleUrl && (
              <a href={c.candleUrl} download target="_blank" rel="noopener noreferrer"
                className="text-[10px] font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 transition-colors">
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
            )}
          </div>
          {c?.candleUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={c.candleUrl} alt="Selected candle design" className="w-full object-contain max-h-48 bg-white" />
          )}
        </div>
      )}

      {/* ── Balloons: multi-design (product page picker) ─────────── */}
      {c?.balloons && c.balloons.length > 0 && (
        <div className="mt-2 rounded-xl overflow-hidden border border-purple-100 bg-purple-50">
          <div className="px-3 py-1.5 bg-purple-100/60 flex items-center gap-2">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">🎈 Balloons</span>
            <span className="text-[10px] text-purple-600">× {c.balloons.reduce((s, i) => s + i.qty, 0)} total</span>
          </div>
          <div className="p-2 bg-white grid grid-cols-5 gap-1.5">
            {c.balloons.map((d, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-purple-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.url} alt="" className="w-full aspect-square object-cover" />
                <span className="absolute bottom-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md leading-none">×{d.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Balloons: single design (cake customizer) ────────────── */}
      {c?.balloonUrl && !(c?.balloons?.length) && (
        <div className="mt-2 rounded-xl overflow-hidden border border-purple-100 bg-purple-50">
          <div className="flex items-center justify-between px-3 py-1.5 bg-purple-100/60">
            <span className="text-[10px] font-bold text-purple-700 uppercase tracking-wider">🎈 Balloon design</span>
            <a href={c.balloonUrl} download target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-bold text-purple-700 hover:text-purple-900 flex items-center gap-1 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.balloonUrl} alt="Selected balloon design" className="w-full object-contain max-h-48 bg-white" />
        </div>
      )}

      {/* ── Cards: multi-design (product page picker) ────────────── */}
      {c?.cards && c.cards.length > 0 && (
        <div className="mt-2 rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50">
          <div className="px-3 py-1.5 bg-emerald-100/60 flex items-center gap-2">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">🎴 Cards</span>
            <span className="text-[10px] text-emerald-600">× {c.cards.reduce((s, i) => s + i.qty, 0)} total</span>
          </div>
          <div className="p-2 bg-white grid grid-cols-5 gap-1.5">
            {c.cards.map((d, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border border-emerald-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={d.url} alt="" className="w-full aspect-[3/4] object-cover" />
                <span className="absolute bottom-0 right-0 bg-emerald-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-tl-md leading-none">×{d.qty}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Card: single design (cake customizer) ────────────────── */}
      {c?.cardUrl && !(c?.cards?.length) && (
        <div className="mt-2 rounded-xl overflow-hidden border border-emerald-100 bg-emerald-50">
          <div className="flex items-center justify-between px-3 py-1.5 bg-emerald-100/60">
            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">🎴 Greeting card</span>
            <a href={c.cardUrl} download target="_blank" rel="noopener noreferrer"
              className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1 transition-colors">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download
            </a>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={c.cardUrl} alt="Selected greeting card" className="w-full object-contain max-h-48 bg-white" />
        </div>
      )}

      {/* ── Edit Extras button ───────────────────────────────────── */}
      {!editing && (
        <button
          onClick={openEditor}
          className="mt-3 w-full text-[11px] font-bold text-brand-700 border border-brand-200 hover:border-brand-500 hover:bg-brand-50 rounded-lg py-1.5 transition-colors"
        >
          ✏️ Edit Extras (Candles / Balloons / Card)
        </button>
      )}

      {/* ── Extras editor panel ──────────────────────────────────── */}
      {editing && (
        <div className="mt-3 bg-white border border-gray-200 rounded-xl p-4 space-y-4">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Edit Extras</p>

          {/* Candle picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">🕯️ Candle design</p>
              {editCandleUrl && (
                <button onClick={() => setEditCandleUrl(null)} className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-colors">Remove</button>
              )}
            </div>
            {!imagesLoaded ? (
              <p className="text-[11px] text-gray-400">Loading…</p>
            ) : candleImages.length === 0 ? (
              <p className="text-[11px] text-gray-400">No candle designs in bucket</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {candleImages.map((cn) => {
                  const sel = editCandleUrl === cn.url;
                  return (
                    <button
                      key={cn.url}
                      onClick={() => setEditCandleUrl(sel ? null : cn.url)}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${sel ? "border-amber-500 ring-1 ring-amber-300" : "border-gray-100 hover:border-amber-300"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={cn.url} alt={cn.name} className="w-full h-full object-cover" />
                      {sel && <span className="absolute inset-0 bg-amber-500/10" />}
                      {sel && <span className="absolute top-0.5 right-0.5 bg-amber-600 rounded-full p-0.5"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Balloon picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">🎈 Balloon design</p>
              {editBalloonUrl && (
                <button onClick={() => setEditBalloonUrl(null)} className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-colors">Remove</button>
              )}
            </div>
            {balloonImages.length === 0 ? (
              <p className="text-[11px] text-gray-400">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {balloonImages.map((b) => {
                  const sel = editBalloonUrl === b.url;
                  return (
                    <button
                      key={b.url}
                      onClick={() => setEditBalloonUrl(sel ? null : b.url)}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-square transition-all ${sel ? "border-purple-500 ring-1 ring-purple-300" : "border-gray-100 hover:border-purple-300"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.url} alt={b.name} className="w-full h-full object-cover" />
                      {sel && <span className="absolute inset-0 bg-purple-500/10" />}
                      {sel && <span className="absolute top-0.5 right-0.5 bg-purple-600 rounded-full p-0.5"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Card picker */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold text-gray-700">🎴 Greeting card</p>
              {editCardUrl && (
                <button onClick={() => setEditCardUrl(null)} className="text-[10px] text-rose-500 hover:text-rose-700 font-bold transition-colors">Remove</button>
              )}
            </div>
            {cardImages.length === 0 ? (
              <p className="text-[11px] text-gray-400">Loading…</p>
            ) : (
              <div className="grid grid-cols-4 gap-1.5">
                {cardImages.map((ca) => {
                  const sel = editCardUrl === ca.url;
                  return (
                    <button
                      key={ca.url}
                      onClick={() => setEditCardUrl(sel ? null : ca.url)}
                      className={`relative rounded-lg overflow-hidden border-2 aspect-[3/4] transition-all ${sel ? "border-emerald-500 ring-1 ring-emerald-300" : "border-gray-100 hover:border-emerald-300"}`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={ca.url} alt={ca.name} className="w-full h-full object-cover" />
                      {sel && <span className="absolute inset-0 bg-emerald-500/10" />}
                      {sel && <span className="absolute top-0.5 right-0.5 bg-emerald-600 rounded-full p-0.5"><svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg></span>}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <button
              onClick={saveExtras}
              disabled={saving}
              className="flex-1 bg-brand-700 hover:bg-brand-900 text-white text-xs font-bold py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setEditing(false)}
              className="flex-1 border border-gray-200 hover:border-gray-400 text-gray-600 text-xs font-bold py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Uploaded Media ───────────────────────────────────────────────────────────

function printImage(url: string) {
  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Customer Photo</title>
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  body{display:flex;align-items:center;justify-content:center;min-height:100vh;background:#fff}
  img{max-width:100%;max-height:100vh;object-fit:contain;display:block}
  @media print{body{min-height:unset}img{max-height:100%}}
</style></head>
<body><img src="${url}" /></body></html>`;
  const w = window.open("", "_blank", "width=900,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 600);
}

function UploadedMedia({ stickerUrl, imageUrl }: { stickerUrl: string | null; imageUrl: string | null }) {
  if (!stickerUrl && !imageUrl) return null;
  return (
    <div className="space-y-3">
      {imageUrl && (
        <div className="rounded-xl overflow-hidden border border-blue-100 bg-blue-50">
          <div className="flex items-center justify-between px-3 py-1.5 bg-blue-100/60">
            <span className="text-[10px] font-bold text-blue-700 uppercase tracking-wider">Customer photo — print this</span>
            <div className="flex items-center gap-3">
              <button
                onClick={() => printImage(imageUrl)}
                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
                </svg>
                Print image
              </button>
              <a
                href={imageUrl}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 transition-colors"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download
              </a>
              <a
                href={imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-semibold text-blue-500 hover:text-blue-700 transition-colors"
              >
                Open full size ↗
              </a>
            </div>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt="Customer upload"
            className="w-full object-contain max-h-72 bg-white"
          />
        </div>
      )}
      {stickerUrl && (
        <a href={stickerUrl} target="_blank" rel="noopener noreferrer" className="inline-block">
          <div className="p-2 bg-white border border-gray-200 rounded-xl hover:border-brand-500 transition-colors text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={stickerUrl} alt="Sticker" className="w-14 h-14 object-contain rounded-lg" />
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wide mt-1">Sticker</p>
          </div>
        </a>
      )}
    </div>
  );
}

// ─── Order Card ───────────────────────────────────────────────────────────────

function printOrder(order: Order) {
  const items: OrderItem[] = Array.isArray(order.items) ? order.items : [];
  const statusLabel = STATUS_META[order.status]?.label ?? order.status;

  const itemRows = items.map(item => {
    const c = item.customization;
    const details = [c?.shape, c?.flavor, c?.color, ...(c?.toppings ?? [])].filter(Boolean).join(", ");
    return `
      <tr>
        <td style="padding:6px 8px;border-bottom:1px solid #eee">${item.productName}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td>
        <td style="padding:6px 8px;border-bottom:1px solid #eee;color:#555;font-size:11px">${details || "—"}</td>
        ${c?.message ? `<td style="padding:6px 8px;border-bottom:1px solid #eee;font-style:italic;color:#555;font-size:11px">"${c.message}"</td>` : `<td style="padding:6px 8px;border-bottom:1px solid #eee">—</td>`}
        <td style="padding:6px 8px;border-bottom:1px solid #eee;text-align:right;font-weight:600">${item.subtotal} QAR</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8">
<title>Order #${order.order_number}</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:Arial,sans-serif;font-size:13px;color:#111;padding:32px;max-width:720px;margin:0 auto}
  h1{font-size:20px;margin-bottom:4px}
  .sub{color:#666;font-size:12px;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px}
  .box{background:#f9f9f9;border:1px solid #e5e5e5;border-radius:8px;padding:14px}
  .box h3{font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#888;margin-bottom:8px}
  .box p{margin-bottom:3px;font-size:13px}
  table{width:100%;border-collapse:collapse;margin-bottom:16px}
  th{background:#f3f3f3;padding:7px 8px;text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.05em;color:#666}
  .total-row{font-weight:700;font-size:14px}
  .status{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;background:#f0fdf4;color:#15803d}
  .footer{margin-top:24px;padding-top:16px;border-top:1px solid #eee;color:#888;font-size:11px;text-align:center}
  @media print{body{padding:16px}}
</style>
</head><body>
<h1>Order #${order.order_number}</h1>
<p class="sub">${new Date(order.created_at).toLocaleString()} &nbsp;·&nbsp; <span class="status">${statusLabel}</span></p>

<div class="grid">
  <div class="box">
    <h3>Customer</h3>
    <p><strong>${order.customer_name}</strong></p>
    <p>${order.customer_phone}</p>
    ${order.customer_email ? `<p>${order.customer_email}</p>` : ""}
  </div>
  <div class="box">
    <h3>${order.delivery_method === "delivery" ? "Delivery" : "Pickup"}</h3>
    <p>${order.pickup_date} · ${order.pickup_time}</p>
    ${order.delivery_method === "delivery" && order.delivery_address ? `<p>${order.delivery_address}</p>` : ""}
    ${order.delivery_fee > 0 ? `<p>Delivery fee: <strong>${order.delivery_fee} QAR</strong></p>` : ""}
  </div>
</div>

<table>
  <thead><tr>
    <th>Item</th><th>Qty</th><th>Details</th><th>Message</th><th style="text-align:right">Subtotal</th>
  </tr></thead>
  <tbody>${itemRows}</tbody>
  <tfoot>
    ${order.delivery_fee > 0 ? `<tr><td colspan="4" style="padding:6px 8px;text-align:right;color:#555">Delivery fee</td><td style="padding:6px 8px;text-align:right">${order.delivery_fee} QAR</td></tr>` : ""}
    <tr class="total-row"><td colspan="4" style="padding:8px 8px;text-align:right">Total</td><td style="padding:8px 8px;text-align:right">${order.total} QAR</td></tr>
  </tfoot>
</table>

<div class="grid">
  <div class="box">
    <h3>Payment</h3>
    <p>${order.payment_method === "sadad_online" ? "SADAD Online" : order.payment_method === "card" ? "Card" : "Cash"}</p>
  </div>
  ${order.notes ? `<div class="box"><h3>Notes</h3><p>${order.notes}</p></div>` : ""}
</div>

<div class="footer">Biteez · Printed ${new Date().toLocaleString()}</div>
</body></html>`;

  const w = window.open("", "_blank", "width=800,height=900");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}

function OrderCard({ order, updating, onChangeStatus, onDelete }: {
  order: Order;
  updating: boolean;
  onChangeStatus: (id: string, s: OrderStatus) => void;
  onDelete: (id: string) => void;
}) {
  const [expanded,    setExpanded]    = useState(false);
  const [confirmDel,  setConfirmDel]  = useState(false);
  const [items, setItems] = useState<OrderItem[]>(Array.isArray(order.items) ? order.items : []);
  const m         = STATUS_META[order.status];
  const itemCount = items.length;
  const preview   = itemCount > 0
    ? `${items[0].productName}${itemCount > 1 ? ` +${itemCount - 1} more` : ""}`
    : "No items";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Status stripe */}
      <div className="h-1 w-full" style={{ background: m.stripe }} />

      <div className="p-4 sm:p-5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <StatusBadge status={order.status} />
            <span className="font-mono font-bold text-gray-900 text-sm">#{order.order_number}</span>
            <span className="text-gray-400 text-xs">{timeAgo(order.created_at)}</span>
          </div>
          <div className="text-right shrink-0">
            <p className="font-bold text-gray-900 text-xl leading-none">{order.total}</p>
            <p className="text-[10px] text-gray-400 font-medium mt-0.5 uppercase tracking-wide">QAR</p>
          </div>
        </div>

        <div className="h-px bg-gray-50 my-3" />

        {/* Customer + logistics */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-2 sm:gap-4">
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900 text-sm leading-snug">{order.customer_name}</p>
            <p className="text-gray-400 text-xs mt-0.5">{order.customer_phone}</p>
            {order.customer_email && <p className="text-gray-400 text-xs truncate">{order.customer_email}</p>}
          </div>
          <div className="flex flex-col gap-1 sm:items-end shrink-0">
            <div className="flex items-center gap-1.5">
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                order.delivery_method === "delivery" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>
                {order.delivery_method === "delivery" ? "🚚 Delivery" : "🏪 Pickup"}
              </span>
            </div>
            <p className="text-xs text-gray-500">{order.pickup_date} · {order.pickup_time}</p>
            {order.delivery_fee > 0 && (
              <p className="text-[11px] text-blue-600 font-semibold">+QAR {order.delivery_fee} delivery</p>
            )}
            {order.delivery_address && (() => {
              // Format: "Area Name — Building/street details"
              const sep   = order.delivery_address.indexOf(" — ");
              const area  = sep !== -1 ? order.delivery_address.slice(0, sep) : null;
              const detail = sep !== -1 ? order.delivery_address.slice(sep + 3) : order.delivery_address;
              return (
                <div className="sm:text-right max-w-[200px]">
                  {area && <p className="text-[11px] font-semibold text-gray-700">{area}</p>}
                  <p className="text-[11px] text-gray-400">{detail}</p>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Items preview */}
        {itemCount > 0 && (
          <>
            <div className="h-px bg-gray-50 my-3" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-500 truncate">{preview}</p>
              <span className="shrink-0 text-[11px] font-semibold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                {itemCount} item{itemCount !== 1 ? "s" : ""}
              </span>
            </div>
          </>
        )}

        {/* Footer: status select + expand */}
        <div className="h-px bg-gray-50 my-3" />
        <div className="flex items-center justify-between gap-3">
          <select
            disabled={updating}
            value={order.status}
            onChange={e => onChangeStatus(order.id, e.target.value as OrderStatus)}
            className="text-xs font-semibold border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 disabled:opacity-50 bg-white text-gray-700 cursor-pointer"
          >
            {/* If the current status isn't in ADMIN_STATUSES (e.g. pending_payment,
                payment_failed), show it as a disabled sentinel so the dropdown
                displays the correct label instead of falling through to the first
                admin option and falsely showing "Paid". */}
            {!ADMIN_STATUSES.includes(order.status) && (
              <option value={order.status} disabled>
                {STATUS_META[order.status]?.label ?? order.status}
              </option>
            )}
            {ADMIN_STATUSES.map(s => (
              <option key={s} value={s}>{STATUS_META[s].label}</option>
            ))}
          </select>
          {updating && (
            <svg className="w-4 h-4 text-brand-700 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
            </svg>
          )}
          <button
            onClick={() => setExpanded(v => !v)}
            className="ml-auto flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 transition-colors px-3 py-2 rounded-xl hover:bg-gray-50"
          >
            {expanded ? "Hide details" : "View details"}
            <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Print */}
          <button
            onClick={() => printOrder({ ...order, items })}
            className="p-2 rounded-xl text-gray-300 hover:text-blue-500 hover:bg-blue-50 transition-colors"
            title="Print order"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
            </svg>
          </button>

          {/* Delete */}
          {confirmDel ? (
            <div className="flex items-center gap-1.5 ml-2">
              <span className="text-[11px] text-red-600 font-semibold">Delete?</span>
              <button
                onClick={() => onDelete(order.id)}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
              >Yes</button>
              <button
                onClick={() => setConfirmDel(false)}
                className="text-[11px] font-bold px-2 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDel(true)}
              className="ml-2 p-2 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors"
              title="Delete order"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Expanded detail */}
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-50 space-y-5">
            {/* Timeline */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-3">Order Progress</p>
              <OrderTimeline status={order.status} />
              {order.status === "cancelled" && (
                <p className="mt-3 text-xs text-red-500 font-medium text-center">This order was cancelled</p>
              )}
              {order.status === "payment_failed" && (
                <p className="mt-3 text-xs text-rose-600 font-medium text-center">Payment failed — order not processed</p>
              )}
            </div>

            {/* Items */}
            {items.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Items Ordered</p>
                <div className="space-y-2">
                  {items.map((item, i) => (
                    <ItemDetail
                      key={i}
                      item={item}
                      orderId={order.id}
                      itemIndex={i}
                      onExtrasUpdated={setItems}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Uploads */}
            {(order.sticker_url || order.image_url) && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">Uploads</p>
                <UploadedMedia stickerUrl={order.sticker_url} imageUrl={order.image_url} />
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5">
                <span className="text-base leading-none mt-0.5">📝</span>
                <p className="text-xs text-amber-800 leading-relaxed">{order.notes}</p>
              </div>
            )}

            {/* Delivery fee */}
            {order.delivery_fee > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400 font-medium">Delivery fee</span>
                <span className="text-xs font-bold text-gray-700">QAR {order.delivery_fee}</span>
              </div>
            )}

            {/* Payment */}
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-400 font-medium">Payment method</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                order.payment_method === "sadad_online" ? "bg-teal-50 text-teal-700"
                : order.payment_method === "card"       ? "bg-purple-50 text-purple-700"
                :                                         "bg-green-50 text-green-700"
              }`}>
                {order.payment_method === "sadad_online" ? "💳 SADAD Online"
                : order.payment_method === "card"        ? "💳 Card"
                :                                          "💵 Cash"}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function OrdersTable({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const [updating,     setUpdating]     = useState<string | null>(null);
  const [search,       setSearch]       = useState("");
  const [activeStatus, setActiveStatus] = useState<OrderStatus | "all">("all");

  async function changeStatus(orderId: string, status: OrderStatus) {
    setUpdating(orderId);
    await fetch("/api/orders/status", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId, status }),
    });
    setUpdating(null);
    onRefresh();
  }

  async function deleteOrder(orderId: string) {
    await fetch("/api/orders", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: orderId }),
    });
    onRefresh();
  }

  const statusCounts = useMemo(() => {
    const counts: Partial<Record<OrderStatus | "all", number>> = { all: orders.length };
    for (const s of ALL_STATUSES) counts[s] = orders.filter(o => o.status === s).length;
    return counts;
  }, [orders]);

  const filtered = useMemo(() => {
    let res = orders;
    if (activeStatus !== "all") res = res.filter(o => o.status === activeStatus);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(o =>
        o.order_number.toLowerCase().includes(q) ||
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_phone.includes(q)
      );
    }
    return res;
  }, [orders, activeStatus, search]);

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search by order #, name or phone…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Status filter pills */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setActiveStatus("all")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
            activeStatus === "all"
              ? "bg-gray-900 text-white shadow-sm"
              : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
          }`}
        >
          All <span className="ml-1 opacity-60">{statusCounts.all}</span>
        </button>
        {ALL_STATUSES.map(s => {
          const m      = STATUS_META[s];
          const count  = statusCounts[s] ?? 0;
          const active = activeStatus === s;
          return (
            <button key={s} onClick={() => setActiveStatus(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                active
                  ? `${m.bg} ${m.color} shadow-sm`
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {m.label} <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}
      </div>

      {/* Result count hint */}
      {(search || activeStatus !== "all") && filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {orders.length} orders
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-sm">No orders found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {filtered.map(order => (
          <OrderCard
            key={order.id}
            order={order}
            updating={updating === order.id}
            onChangeStatus={changeStatus}
            onDelete={deleteOrder}
          />
        ))}
      </div>
    </div>
  );
}
