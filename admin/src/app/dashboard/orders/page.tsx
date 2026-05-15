"use client";
import { useEffect, useState, useCallback } from "react";
import OrdersTable from "./OrdersTable";
import type { Order } from "@/lib/types";

function Skeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map(i => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="h-1 bg-gray-200 w-full" />
          <div className="p-5 space-y-3">
            <div className="flex items-start justify-between">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-gray-100 rounded-full" />
                <div className="h-6 w-16 bg-gray-100 rounded-lg" />
                <div className="h-6 w-12 bg-gray-100 rounded-lg" />
              </div>
              <div className="h-7 w-16 bg-gray-100 rounded-lg" />
            </div>
            <div className="h-px bg-gray-50" />
            <div className="flex justify-between gap-4">
              <div className="space-y-2 flex-1">
                <div className="h-4 w-36 bg-gray-100 rounded" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
              <div className="space-y-2 items-end flex flex-col">
                <div className="h-5 w-20 bg-gray-100 rounded-full" />
                <div className="h-3 w-28 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="h-px bg-gray-50" />
            <div className="h-3 w-48 bg-gray-100 rounded" />
            <div className="h-px bg-gray-50" />
            <div className="flex justify-between">
              <div className="h-8 w-32 bg-gray-100 rounded-xl" />
              <div className="h-8 w-28 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function OrdersPage() {
  const [orders,      setOrders]      = useState<Order[]>([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [error,       setError]       = useState("");
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback((silent = false) => {
    if (silent) setRefreshing(true);
    else        setLoading(true);

    fetch("/api/orders")
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else { setOrders(data); setLastUpdated(new Date()); setError(""); }
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => { setLoading(false); setRefreshing(false); });
  }, []);

  useEffect(() => { load(); }, [load]);

  // auto-refresh every 30 s (silent)
  useEffect(() => {
    const id = setInterval(() => load(true), 30_000);
    return () => clearInterval(id);
  }, [load]);

  return (
    <div>
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          {lastUpdated && (
            <p className="text-xs text-gray-400 mt-0.5">
              Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              <span className="ml-2 text-gray-300">· auto-refreshes every 30s</span>
            </p>
          )}
        </div>
        <button
          onClick={() => load(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
        >
          <svg className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
            fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading && orders.length === 0
        ? <Skeleton />
        : <OrdersTable orders={orders} onRefresh={() => load(true)} />
      }
    </div>
  );
}
