"use client";
import { useEffect, useState } from "react";

type Stats = {
  totalOrders: number;
  todayOrders: number;
  pendingOrders: number;
  totalRevenue: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then(setStats);
  }, []);

  const items = [
    { label: "Total Orders",    value: stats ? String(stats.totalOrders)                    : "…" },
    { label: "Today's Pickups", value: stats ? String(stats.todayOrders)                    : "…" },
    { label: "Pending",         value: stats ? String(stats.pendingOrders)                  : "…" },
    { label: "Revenue (QAR)",   value: stats ? `${Number(stats.totalRevenue).toFixed(0)} QAR` : "…" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-8">
        {items.map(({ label, value }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className="text-2xl font-bold text-brand-700">{value}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
        <p className="text-sm text-gray-400">
          Use the sidebar to manage <strong>Orders</strong> and <strong>Products</strong>.
        </p>
      </div>
    </div>
  );
}
