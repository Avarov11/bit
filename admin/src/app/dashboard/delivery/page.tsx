"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Plus, Trash2, ChevronUp, ChevronDown, CheckCircle2, AlertCircle,
  Eye, EyeOff, Save, Calendar, Clock, Users, TrendingUp,
} from "lucide-react";

interface TimeSlot {
  id:         string;
  label:      string;
  label_ar:   string | null;
  sort_order: number;
  max_orders: number;
  active:     boolean;
}

interface SlotCount {
  label:  string;
  booked: number;
  max:    number;
}

export default function DeliveryPage() {
  const [slots,        setSlots]        = useState<TimeSlot[]>([]);
  const [maxPerDay,    setMaxPerDay]    = useState(50);
  const [maxPerDayDraft, setMaxPerDayDraft] = useState(50);
  const [loading,      setLoading]      = useState(true);
  const [adding,       setAdding]       = useState(false);
  const [toast,        setToast]        = useState<{ msg: string; ok: boolean } | null>(null);

  // Calendar
  const today = new Date().toISOString().split("T")[0];
  const [calDate,     setCalDate]      = useState(today);
  const [slotCounts,  setSlotCounts]   = useState<SlotCount[]>([]);
  const [totalBooked, setTotalBooked]  = useState(0);
  const [calLoading,  setCalLoading]   = useState(false);

  const textTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  function showToast(msg: string, ok: boolean) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
  }

  const loadData = useCallback(async () => {
    const res  = await fetch("/api/delivery");
    const data = await res.json();
    if (Array.isArray(data.slots)) setSlots(data.slots);
    if (data.settings?.max_orders_per_day) {
      const v = parseInt(data.settings.max_orders_per_day);
      setMaxPerDay(v);
      setMaxPerDayDraft(v);
    }
    setLoading(false);
  }, []);

  const loadCalendar = useCallback(async (date: string) => {
    setCalLoading(true);
    const [ordersRes, slotsNow] = await Promise.all([
      fetch(`/api/orders?date=${date}`).then(r => r.json()),
      Promise.resolve(slots),
    ]);

    const orders: { pickup_time: string }[] = Array.isArray(ordersRes) ? ordersRes : [];
    const countMap: Record<string, number> = {};
    for (const o of orders) {
      countMap[o.pickup_time] = (countMap[o.pickup_time] ?? 0) + 1;
    }
    const total = Object.values(countMap).reduce((s, n) => s + n, 0);
    setTotalBooked(total);
    setSlotCounts(slotsNow.map(s => ({
      label:  s.label,
      booked: countMap[s.label] ?? 0,
      max:    s.max_orders,
    })));
    setCalLoading(false);
  }, [slots]);

  useEffect(() => { loadData(); }, [loadData]);
  useEffect(() => { if (!loading) loadCalendar(calDate); }, [loading, calDate, loadCalendar]);

  async function saveMaxPerDay() {
    const res = await fetch("/api/delivery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setting_key: "max_orders_per_day", setting_value: maxPerDayDraft }),
    });
    if (res.ok) { setMaxPerDay(maxPerDayDraft); showToast("Saved.", true); }
    else showToast("Failed to save.", false);
  }

  async function addSlot() {
    setAdding(true);
    const res  = await fetch("/api/delivery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
    const data = await res.json();
    if (res.ok) { setSlots(prev => [...prev, data].sort((a, b) => a.sort_order - b.sort_order)); showToast("Slot added.", true); }
    else showToast(data.error ?? "Failed.", false);
    setAdding(false);
  }

  async function deleteSlot(id: string) {
    if (!confirm("Delete this time slot?")) return;
    const res = await fetch("/api/delivery", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    if (res.ok) { setSlots(prev => prev.filter(s => s.id !== id)); showToast("Deleted.", true); }
    else showToast("Failed.", false);
  }

  async function toggleActive(slot: TimeSlot) {
    const res = await fetch("/api/delivery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: slot.id, active: !slot.active }) });
    if (res.ok) setSlots(prev => prev.map(s => s.id === slot.id ? { ...s, active: !s.active } : s));
  }

  async function moveSlot(id: string, dir: -1 | 1) {
    const sorted = [...slots].sort((a, b) => a.sort_order - b.sort_order);
    const idx   = sorted.findIndex(s => s.id === id);
    const other = sorted[idx + dir];
    if (!other) return;
    const [aO, bO] = [sorted[idx].sort_order, other.sort_order];
    await Promise.all([
      fetch("/api/delivery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: sorted[idx].id, sort_order: bO }) }),
      fetch("/api/delivery", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: other.id,       sort_order: aO }) }),
    ]);
    setSlots(prev => prev.map(s => {
      if (s.id === sorted[idx].id) return { ...s, sort_order: bO };
      if (s.id === other.id)       return { ...s, sort_order: aO };
      return s;
    }).sort((a, b) => a.sort_order - b.sort_order));
  }

  function handleField(id: string, field: keyof TimeSlot, value: string | number) {
    setSlots(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
    const key = `${id}-${field}`;
    clearTimeout(textTimers.current[key]);
    textTimers.current[key] = setTimeout(async () => {
      await fetch("/api/delivery", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, [field]: value }),
      });
    }, 600);
  }

  const sorted = [...slots].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-5 right-5 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.ok ? "bg-green-50 text-green-800 border border-green-200" : "bg-red-50 text-red-800 border border-red-200"}`}>
          {toast.ok ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />} {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Delivery Settings</h1>
          <p className="text-sm text-gray-400 mt-0.5">Manage time slots and order capacity</p>
        </div>
      </div>

      {/* ── Global limits ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-gray-400" />
          <h2 className="text-sm font-bold text-gray-800">Daily Order Limit</h2>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Max orders per day (all slots combined)</label>
            <input
              type="number" min={1} max={9999}
              value={maxPerDayDraft}
              onChange={e => setMaxPerDayDraft(parseInt(e.target.value) || 1)}
              className="w-36 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#800020]"
            />
          </div>
          <button
            onClick={saveMaxPerDay}
            disabled={maxPerDayDraft === maxPerDay}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-40 transition-all"
            style={{ background: "#800020" }}
          >
            <Save size={13} /> Save
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Current: <span className="font-semibold text-gray-600">{maxPerDay} orders/day</span></p>
      </div>

      {/* ── Time slots ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-800">Time Slots</h2>
            <span className="text-xs text-gray-400">{sorted.filter(s => s.active).length} active · {sorted.filter(s => !s.active).length} hidden</span>
          </div>
          <button
            onClick={addSlot} disabled={adding}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-white disabled:opacity-50 transition-all"
            style={{ background: "#800020" }}
          >
            <Plus size={13} /> {adding ? "Adding…" : "Add slot"}
          </button>
        </div>

        {loading ? (
          <div className="p-8 text-center text-sm text-gray-400">Loading…</div>
        ) : sorted.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-400">No time slots yet. Add one above.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {sorted.map((slot, idx) => (
              <div key={slot.id} className="p-5" style={{ opacity: slot.active ? 1 : 0.55 }}>
                <div className="flex items-start gap-3">
                  {/* Reorder + delete */}
                  <div className="flex flex-col gap-1 pt-1 shrink-0">
                    <button onClick={() => moveSlot(slot.id, -1)} disabled={idx === 0} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-20"><ChevronUp size={13} className="text-gray-500" /></button>
                    <button onClick={() => moveSlot(slot.id, 1)} disabled={idx === sorted.length - 1} className="w-6 h-6 rounded flex items-center justify-center hover:bg-gray-100 disabled:opacity-20"><ChevronDown size={13} className="text-gray-500" /></button>
                  </div>

                  {/* Fields */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Label (English)</label>
                      <input
                        type="text"
                        value={slot.label}
                        onChange={e => handleField(slot.id, "label", e.target.value)}
                        placeholder="e.g. 10:00 AM – 12:00 PM"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Label (Arabic)</label>
                      <input
                        type="text" dir="rtl"
                        value={slot.label_ar ?? ""}
                        onChange={e => handleField(slot.id, "label_ar", e.target.value)}
                        placeholder="e.g. ١٠:٠٠ ص – ١٢:٠٠ م"
                        className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wide mb-1">Max orders per slot</label>
                      <input
                        type="number" min={1} max={999}
                        value={slot.max_orders}
                        onChange={e => handleField(slot.id, "max_orders", parseInt(e.target.value) || 1)}
                        className="w-32 text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:border-[#800020]"
                      />
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2 pt-1 shrink-0">
                    <button onClick={() => toggleActive(slot)} title={slot.active ? "Hide slot" : "Show slot"} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
                      {slot.active ? <Eye size={14} style={{ color: "#800020" }} /> : <EyeOff size={14} className="text-gray-400" />}
                    </button>
                    <button onClick={() => deleteSlot(slot.id)} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-red-50 transition-colors">
                      <Trash2 size={13} className="text-red-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Calendar / schedule view ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div className="flex items-center gap-2">
            <Calendar size={15} className="text-gray-400" />
            <h2 className="text-sm font-bold text-gray-800">Schedule</h2>
          </div>
          <input
            type="date"
            value={calDate}
            onChange={e => setCalDate(e.target.value)}
            className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:border-[#800020]"
          />
        </div>

        <div className="p-5">
          {/* Day summary */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users size={14} className="text-gray-400" />
              <span className="text-sm text-gray-600">
                <span className="font-bold text-gray-900">{totalBooked}</span> / {maxPerDay} orders today
              </span>
            </div>
            {totalBooked >= maxPerDay && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-red-100 text-red-600">Day full</span>
            )}
            {totalBooked > 0 && totalBooked < maxPerDay && (
              <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600">
                {maxPerDay - totalBooked} slots left
              </span>
            )}
          </div>

          {/* Day progress bar */}
          <div className="w-full h-2 rounded-full bg-gray-100 mb-6 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalBooked / maxPerDay) * 100)}%`,
                background: totalBooked >= maxPerDay ? "#ef4444" : totalBooked / maxPerDay > 0.8 ? "#f59e0b" : "#800020",
              }}
            />
          </div>

          {calLoading ? (
            <div className="text-center text-sm text-gray-400 py-4">Loading…</div>
          ) : slotCounts.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No active time slots to show.</p>
          ) : (
            <div className="space-y-3">
              {slotCounts.map(sc => {
                const pct  = Math.min(100, (sc.booked / sc.max) * 100);
                const full = sc.booked >= sc.max;
                return (
                  <div key={sc.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-700">{sc.label}</span>
                      <div className="flex items-center gap-2">
                        {full && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 uppercase">Full</span>}
                        <span className="text-xs font-semibold text-gray-500">{sc.booked} / {sc.max}</span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${pct}%`,
                          background: full ? "#ef4444" : pct > 80 ? "#f59e0b" : "#800020",
                        }}
                      />
                    </div>
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
