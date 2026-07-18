"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import { TrendingUp, ShoppingBag, Calendar, Clock, BarChart2, PieChart, RefreshCw, ArrowRight, Users, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

type RecentOrder = {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
};

type Customer = {
  name: string;
  phone: string;
  orders: number;
  total: number;
};

type Stats = {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  avgOrderValue: number;
  monthRevenue: number;
  revenueByDay: { date: string; revenue: number }[];
  ordersByStatus: { status: string; count: number }[];
  recentOrders: RecentOrder[];
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLOR: Record<string, string> = {
  pending_payment: "#F97316",
  paid:            "#14B8A6",
  payment_failed:  "#F43F5E",
  pending:         "#F59E0B",
  confirmed:       "#3B82F6",
  preparing:       "#8B5CF6",
  ready:           "#10B981",
  delivered:       "#94A3B8",
  cancelled:       "#EF4444",
};

const STATUS_LABEL: Record<string, string> = {
  pending_payment: "Awaiting Payment",
  paid:            "Paid",
  payment_failed:  "Failed",
  pending:         "Pending",
  confirmed:       "Confirmed",
  preparing:       "Preparing",
  ready:           "Ready",
  delivered:       "Delivered",
  cancelled:       "Cancelled",
};

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(n: number) {
  return Math.round(n).toLocaleString("en-US");
}

function timeAgo(iso: string) {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

// ─── Revenue Bar Chart (pure SVG) ─────────────────────────────────────────────

function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  const todayStr = new Date().toISOString().split("T")[0];
  const maxRev   = Math.max(...data.map(d => d.revenue), 1);

  const W = 560, H = 170;
  const pL = 10, pR = 10, pT = 24, pB = 36;
  const chartW = W - pL - pR;
  const chartH = H - pT - pB;
  const slotW  = chartW / data.length;
  const barW   = Math.floor(slotW * 0.55);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full overflow-visible">
      <defs>
        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#3d0a14" stopOpacity="0.7" />
        </linearGradient>
        <linearGradient id="barGradToday" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF6B9D" />
          <stop offset="100%" stopColor="#3d0a14" />
        </linearGradient>
      </defs>

      {/* Horizontal grid lines */}
      {[0.25, 0.5, 0.75, 1].map(f => {
        const y = pT + chartH * (1 - f);
        return (
          <g key={f}>
            <line x1={pL} x2={W - pR} y1={y} y2={y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={pL - 2} y={y + 3} textAnchor="end" fontSize="8" fill="#cbd5e1">
              {fmt(maxRev * f)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map((d, i) => {
        const isToday = d.date === todayStr;
        const barH    = Math.max((d.revenue / maxRev) * chartH, d.revenue > 0 ? 3 : 0);
        const x       = pL + i * slotW + (slotW - barW) / 2;
        const y       = pT + chartH - barH;
        const dayIdx  = new Date(d.date + "T12:00:00").getDay();

        return (
          <g key={d.date}>
            {/* Bar shadow */}
            {d.revenue > 0 && (
              <rect x={x + 1} y={y + 2} width={barW} height={barH}
                rx="4" fill="rgba(0,0,0,0.06)" />
            )}
            {/* Bar */}
            <rect x={x} y={y} width={barW} height={barH}
              rx="4"
              fill={isToday ? "url(#barGradToday)" : d.revenue > 0 ? "url(#barGrad)" : "#f1f5f9"}
              opacity={isToday ? 1 : 0.65}
            />
            {/* Value label */}
            {d.revenue > 0 && (
              <text x={x + barW / 2} y={y - 5}
                textAnchor="middle" fontSize="8.5" fill={isToday ? "#3d0a14" : "#94a3b8"}
                fontWeight={isToday ? "700" : "400"}>
                {fmt(d.revenue)}
              </text>
            )}
            {/* Day label */}
            <text x={x + barW / 2} y={H - 6}
              textAnchor="middle" fontSize="10"
              fill={isToday ? "#3d0a14" : "#94a3b8"}
              fontWeight={isToday ? "700" : "400"}>
              {DAY_NAMES[dayIdx]}
              {isToday ? " ●" : ""}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ─── Status Donut Chart (pure SVG) ────────────────────────────────────────────

function StatusDonut({ data }: { data: { status: string; count: number }[] }) {
  const total = data.reduce((s, d) => s + d.count, 0);
  const r     = 50;
  const circ  = 2 * Math.PI * r;
  const cx = 70, cy = 70;

  let cumulative = 0;
  const segments = data
    .filter(d => d.count > 0)
    .map(d => {
      const len    = (d.count / Math.max(total, 1)) * circ;
      // dashoffset starts at 12-o'clock (circ/4 shifts from 3-o'clock to 12-o'clock)
      const offset = circ / 4 - cumulative;
      cumulative  += len;
      return { ...d, len, offset };
    });

  return (
    <div className="flex items-center gap-5">
      <svg width="140" height="140" className="shrink-0">
        {/* Track */}
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f1f5f9" strokeWidth="18" />
        {/* Segments */}
        {total === 0 ? null : segments.map(seg => (
          <circle
            key={seg.status}
            cx={cx} cy={cy} r={r}
            fill="none"
            stroke={STATUS_COLOR[seg.status] ?? "#ccc"}
            strokeWidth="18"
            strokeDasharray={`${seg.len} ${circ - seg.len}`}
            strokeDashoffset={seg.offset}
          />
        ))}
        {/* Center */}
        <text x={cx} y={cy - 7} textAnchor="middle" fontSize="20" fontWeight="800" fill="#1e293b">
          {total}
        </text>
        <text x={cx} y={cy + 11} textAnchor="middle" fontSize="10" fill="#94a3b8">
          orders
        </text>
      </svg>

      <div className="flex flex-col gap-2 flex-1">
        {data.map(d => (
          <div key={d.status} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: STATUS_COLOR[d.status] ?? "#ccc" }} />
            <span className="text-xs text-gray-500 flex-1">{STATUS_LABEL[d.status] ?? d.status}</span>
            <span className="text-xs font-bold text-gray-700 tabular-nums">{d.count}</span>
            {total > 0 && (
              <span className="text-[10px] text-gray-400 w-8 text-right tabular-nums">
                {Math.round((d.count / total) * 100)}%
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLOR[status] ?? "#94a3b8";
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap"
      style={{ background: `${color}1a`, color }}
    >
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
      {STATUS_LABEL[status] ?? status}
    </span>
  );
}

// ─── Skeleton card ────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse bg-gray-100 rounded-xl ${className ?? ""}`} />;
}

// ─── Month Calendar ───────────────────────────────────────────────────────────

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEK_DAYS   = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

interface MonthData {
  days:      Record<string, { total: number; slots: Record<string, number> }>;
  maxPerDay: number;
  slots:     { label: string; max_orders: number }[];
}

function MonthCalendar() {
  const now = new Date();
  const [year,    setYear]    = useState(now.getFullYear());
  const [month,   setMonth]   = useState(now.getMonth() + 1);
  const [data,    setData]    = useState<MonthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  const todayStr = now.toISOString().split("T")[0];

  const loadMonth = useCallback(async (y: number, m: number) => {
    setLoading(true);
    const res = await fetch(`/api/delivery/month?year=${y}&month=${m}`);
    const d   = await res.json();
    setData(d);
    setLoading(false);
  }, []);

  useEffect(() => { loadMonth(year, month); }, [year, month, loadMonth]);

  function prev() {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(null);
  }
  function next() {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(null);
  }

  // Build calendar grid
  const firstDay  = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];
  // Pad to complete last row
  while (cells.length % 7 !== 0) cells.push(null);

  function dateStr(day: number) {
    return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  }

  function dotColor(total: number, max: number) {
    if (total === 0) return null;
    const pct = total / max;
    if (pct >= 1)    return "#ef4444";
    if (pct >= 0.75) return "#f59e0b";
    return "#800020";
  }

  const selectedInfo = selected && data?.days[selected];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-[#800020]/10">
            <Calendar size={15} style={{ color: "#800020" }} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-gray-900">Delivery Calendar</h2>
            <p className="text-xs text-gray-400 mt-0.5">Orders per day · click a day to see time slots</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={prev} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <ChevronLeft size={14} className="text-gray-500" />
          </button>
          <span className="text-sm font-bold text-gray-800 w-32 text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={next} className="w-7 h-7 rounded-lg flex items-center justify-center hover:bg-gray-100 transition-colors">
            <ChevronRight size={14} className="text-gray-500" />
          </button>
        </div>
      </div>

      <div className="p-4">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-1">
          {WEEK_DAYS.map(d => (
            <div key={d} className="text-center text-[10px] font-bold text-gray-400 uppercase tracking-wider py-1">
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        {loading ? (
          <div className="h-48 flex items-center justify-center text-sm text-gray-400">Loading…</div>
        ) : (
          <div className="grid grid-cols-7 gap-1">
            {cells.map((day, idx) => {
              if (!day) return <div key={`empty-${idx}`} />;
              const ds      = dateStr(day);
              const info    = data?.days[ds];
              const total   = info?.total ?? 0;
              const max     = data?.maxPerDay ?? 50;
              const color   = dotColor(total, max);
              const isToday = ds === todayStr;
              const isSel   = ds === selected;

              return (
                <button
                  key={ds}
                  onClick={() => setSelected(isSel ? null : ds)}
                  className={`relative flex flex-col items-center justify-start pt-1.5 pb-2 rounded-xl transition-all text-center min-h-[52px] border ${
                    isSel
                      ? "border-[#800020] bg-[#800020]/5"
                      : isToday
                        ? "border-[#FF6B9D]/40 bg-[#FF6B9D]/5"
                        : "border-transparent hover:bg-gray-50"
                  }`}
                >
                  <span className={`text-xs font-bold leading-none ${isToday ? "text-[#800020]" : "text-gray-700"}`}>
                    {day}
                  </span>
                  {total > 0 && (
                    <span
                      className="mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none"
                      style={{ background: color ?? "#800020" }}
                    >
                      {total}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
          {[
            { color: "#800020", label: "Orders booked" },
            { color: "#f59e0b", label: "75%+ full" },
            { color: "#ef4444", label: "Full" },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: color }} />
              <span className="text-[10px] text-gray-400">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Selected day panel */}
      {selected && (
        <div className="border-t border-gray-100 px-5 py-4 bg-gray-50/60">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-800">
              {new Date(selected + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}
            </p>
            <span className="text-xs font-semibold text-gray-500">
              {selectedInfo?.total ?? 0} / {data?.maxPerDay ?? 50} orders
            </span>
          </div>

          {!selectedInfo || selectedInfo.total === 0 ? (
            <p className="text-xs text-gray-400">No orders on this day.</p>
          ) : (
            <div className="space-y-2">
              {(data?.slots ?? []).map(slot => {
                const booked = selectedInfo?.slots?.[slot.label] ?? 0;
                const pct    = Math.min(100, (booked / slot.max_orders) * 100);
                const full   = booked >= slot.max_orders;
                return (
                  <div key={slot.label}>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-xs font-medium text-gray-700">{slot.label}</span>
                      <span className="text-xs font-semibold text-gray-500 tabular-nums">
                        {booked} / {slot.max_orders}
                        {full && <span className="ml-1.5 text-[9px] font-bold text-red-500 uppercase">Full</span>}
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${pct}%`,
                          background: full ? "#ef4444" : pct > 75 ? "#f59e0b" : "#800020",
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats,       setStats]       = useState<Stats | null>(null);
  const [customers,   setCustomers]   = useState<Customer[]>([]);
  const [phoneSearch, setPhoneSearch] = useState("");
  const [loading,     setLoading]     = useState(true);
  const [updated,     setUpdated]     = useState<Date>(new Date());

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/stats").then(r => r.json()),
      fetch("/api/customers").then(r => r.json()),
    ]).then(([statsData, custData]) => {
      setStats(statsData);
      if (Array.isArray(custData)) setCustomers(custData);
      setUpdated(new Date());
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const dateStr = new Date().toLocaleDateString("en-US", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });

  const statCards = stats
    ? [
        {
          label: "Total Revenue",
          value: `${fmt(stats.totalRevenue)} QAR`,
          sub:   `This month: ${fmt(stats.monthRevenue)} QAR`,
          Icon:  TrendingUp,
          color: "#FF6B9D",
          bg:    "#FF6B9D1a",
        },
        {
          label: "Total Orders",
          value: fmt(stats.totalOrders),
          sub:   `Avg ${stats.avgOrderValue.toFixed(0)} QAR / order`,
          Icon:  ShoppingBag,
          color: "#3B82F6",
          bg:    "#3B82F61a",
        },
        {
          label: "Today's Pickups",
          value: fmt(stats.todayOrders),
          sub:   new Date().toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          Icon:  Calendar,
          color: "#10B981",
          bg:    "#10B9811a",
        },
        {
          label: "Need Action",
          value: fmt(stats.pendingOrders),
          sub:   "Paid, awaiting confirmation",
          Icon:  Clock,
          color: stats.pendingOrders > 0 ? "#14B8A6" : "#94A3B8",
          bg:    stats.pendingOrders > 0 ? "#14B8A61a" : "#94A3B81a",
        },
      ]
    : [];

  const filteredCustomers = useMemo(() => {
    const q = phoneSearch.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter(c =>
      c.phone.includes(q) || c.name.toLowerCase().includes(q)
    );
  }, [customers, phoneSearch]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <p className="text-xs text-gray-400 font-medium tracking-wide">{dateStr}</p>
          <h1 className="text-2xl font-bold text-gray-900 mt-0.5">{greeting()}, Admin 👋</h1>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-brand-700 transition-colors px-3 py-2 rounded-lg hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-sm"
        >
          <RefreshCw size={12} className={loading ? "animate-spin" : ""} />
          {loading ? "Loading…" : `Updated ${timeAgo(updated.toISOString())}`}
        </button>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {loading && !stats
          ? [...Array(4)].map((_, i) => <Skeleton key={i} className="h-28" />)
          : statCards.map(({ label, value, sub, Icon, color, bg }) => (
              <div key={label}
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest leading-tight">
                    {label}
                  </p>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ background: bg }}>
                    <Icon size={15} style={{ color }} />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900 leading-none mb-1.5 tabular-nums">
                  {value}
                </p>
                <p className="text-xs text-gray-400">{sub}</p>
              </div>
            ))}
      </div>

      {/* ── Charts Row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">

        {/* Revenue bar chart — 3/5 width */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Revenue</h2>
              <p className="text-xs text-gray-400 mt-0.5">Last 7 days · QAR</p>
            </div>
            <BarChart2 size={16} className="text-gray-200 mt-0.5" />
          </div>
          {stats
            ? <RevenueChart data={stats.revenueByDay} />
            : <Skeleton className="h-40" />}
        </div>

        {/* Status donut — 2/5 width */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Orders by Status</h2>
              <p className="text-xs text-gray-400 mt-0.5">All time breakdown</p>
            </div>
            <PieChart size={16} className="text-gray-200 mt-0.5" />
          </div>
          {stats
            ? <StatusDonut data={stats.ordersByStatus} />
            : <Skeleton className="h-36" />}
        </div>
      </div>

      {/* ── Delivery Calendar ── */}
      <MonthCalendar />

      {/* ── Recent Orders ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
          <div>
            <h2 className="text-sm font-bold text-gray-900">Recent Orders</h2>
            <p className="text-xs text-gray-400 mt-0.5">Latest 5 placed</p>
          </div>
          <Link href="/dashboard/orders"
            className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline">
            View all <ArrowRight size={11} />
          </Link>
        </div>

        {!stats ? (
          <div className="p-5 space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14" />)}
          </div>
        ) : stats.recentOrders.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10">No orders yet.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {stats.recentOrders.map(o => (
              <div key={o.id}
                className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                {/* Left: number + name */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold text-gray-900 tabular-nums">
                      #{o.order_number}
                    </span>
                    <StatusBadge status={o.status} />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{o.customer_name}</p>
                </div>
                {/* Right: amount + time */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-bold text-gray-900 tabular-nums">{fmt(o.total)} QAR</p>
                  <p className="text-xs text-gray-400 mt-0.5">{timeAgo(o.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Top Customers ── */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-violet-50">
              <Users size={15} className="text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-gray-900">Top Customers</h2>
              <p className="text-xs text-gray-400 mt-0.5">Ranked by total spend</p>
            </div>
          </div>
          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
            <input
              type="text"
              value={phoneSearch}
              onChange={e => setPhoneSearch(e.target.value)}
              placeholder="Search by phone or name…"
              className="pl-8 pr-3 py-1.5 text-xs border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-200 w-52 bg-gray-50"
            />
          </div>
        </div>

        {loading && customers.length === 0 ? (
          <div className="p-5 space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-12" />)}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <p className="text-xs text-gray-400 text-center py-10">
            {phoneSearch ? "No customers match that search." : "No customer data yet."}
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            <div className="grid grid-cols-[32px_1fr_auto_auto] gap-4 px-5 py-2.5 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span>#</span>
              <span>Customer</span>
              <span className="text-center w-16">Orders</span>
              <span className="text-right w-24">Total Paid</span>
            </div>
            {filteredCustomers.slice(0, 20).map((c, idx) => {
              const rank = phoneSearch ? customers.indexOf(c) + 1 : idx + 1;
              const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;
              return (
                <div key={c.phone}
                  className="grid grid-cols-[32px_1fr_auto_auto] gap-4 items-center px-5 py-3.5 hover:bg-gray-50 transition-colors">
                  <span className="text-sm font-bold text-center">
                    {medal ?? <span className="text-xs text-gray-300">#{rank}</span>}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5 tabular-nums">{c.phone}</p>
                  </div>
                  <div className="text-center w-16">
                    <span className="inline-flex items-center justify-center bg-violet-50 text-violet-700 text-xs font-bold rounded-full px-2.5 py-0.5 tabular-nums">
                      {c.orders}
                    </span>
                  </div>
                  <div className="text-right w-24">
                    <p className="text-sm font-bold text-gray-900 tabular-nums">{fmt(c.total)} QAR</p>
                  </div>
                </div>
              );
            })}
            {filteredCustomers.length > 20 && !phoneSearch && (
              <p className="text-center text-xs text-gray-400 py-3">
                Showing top 20 · search by phone to find more
              </p>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
