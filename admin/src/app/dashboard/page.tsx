"use client";
import { useEffect, useState, useCallback } from "react";
import { TrendingUp, ShoppingBag, Calendar, Clock, BarChart2, PieChart, RefreshCw, ArrowRight } from "lucide-react";
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
  pending:   "#F59E0B",
  confirmed: "#3B82F6",
  preparing: "#F97316",
  ready:     "#10B981",
  delivered: "#94A3B8",
  cancelled: "#EF4444",
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  ready:     "Ready",
  delivered: "Delivered",
  cancelled: "Cancelled",
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

// ─── Dashboard Page ───────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [stats,   setStats]   = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState<Date>(new Date());

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/stats")
      .then(r => r.json())
      .then(data => { setStats(data); setUpdated(new Date()); })
      .finally(() => setLoading(false));
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
          label: "Pending",
          value: fmt(stats.pendingOrders),
          sub:   "Need attention",
          Icon:  Clock,
          color: stats.pendingOrders > 0 ? "#F59E0B" : "#94A3B8",
          bg:    stats.pendingOrders > 0 ? "#F59E0B1a" : "#94A3B81a",
        },
      ]
    : [];

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

    </div>
  );
}
