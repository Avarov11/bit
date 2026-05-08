"use client";

import { useEffect, useState, useCallback } from "react";
import OrdersTable from "./OrdersTable";
import type { Order } from "@/lib/types";

export default function OrdersPage() {
  const [orders, setOrders]   = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/orders")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setOrders(data);
      })
      .catch(() => setError("Failed to load orders"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <button
          onClick={load}
          className="text-sm text-brand-700 hover:underline font-medium"
        >
          Refresh
        </button>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading orders…</p>}
      {error   && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && <OrdersTable orders={orders} onRefresh={load} />}
    </div>
  );
}
