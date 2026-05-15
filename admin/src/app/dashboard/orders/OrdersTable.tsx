"use client";
import { useState } from "react";
import type { Order, OrderItem, OrderStatus } from "@/lib/types";

const STATUS_COLORS: Record<OrderStatus, string> = {
  pending:   "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  ready:     "bg-green-100 text-green-800",
  delivered: "bg-gray-100 text-gray-600",
  cancelled: "bg-red-100 text-red-700",
};

const STATUSES: OrderStatus[] = ["pending","confirmed","preparing","ready","delivered","cancelled"];

function ItemsList({ items }: { items: OrderItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        const c = item.customization;
        const details = [
          c?.shape  && `Shape: ${c.shape}`,
          c?.flavor && `Flavor: ${c.flavor}`,
          c?.color  && `Color: ${c.color}`,
          c?.toppings?.length && `Toppings: ${c.toppings.join(", ")}`,
        ].filter(Boolean) as string[];

        return (
          <li key={i} className="text-sm">
            <div>
              <span className="font-medium text-gray-900">{item.productName}</span>
              <span className="text-brand-700 font-bold ml-1">× {item.quantity}</span>
              <span className="text-gray-400 text-xs ml-1">({item.subtotal} QAR)</span>
            </div>
            {details.length > 0 && (
              <p className="text-gray-400 text-xs mt-0.5 ml-2">{details.join(" · ")}</p>
            )}
            {c?.message && (
              <p className="text-xs mt-1 ml-2 flex items-start gap-1">
                <span>✍️</span>
                <span className="text-gray-700 italic bg-gray-50 rounded px-1.5 py-0.5">"{c.message}"</span>
              </p>
            )}
          </li>
        );
      })}
    </ul>
  );
}

function UploadedMedia({ stickerUrl, imageUrl }: { stickerUrl: string | null; imageUrl: string | null }) {
  if (!stickerUrl && !imageUrl) return null;
  return (
    <div className="flex gap-3 flex-wrap">
      {stickerUrl && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Sticker</p>
          <a href={stickerUrl} target="_blank" rel="noopener noreferrer">
            <img src={stickerUrl} alt="Sticker" className="w-16 h-16 object-contain rounded-lg border border-gray-200 bg-gray-50 hover:opacity-75 transition-opacity" />
          </a>
        </div>
      )}
      {imageUrl && (
        <div>
          <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mb-1">Image</p>
          <a href={imageUrl} target="_blank" rel="noopener noreferrer">
            <img src={imageUrl} alt="Custom image" className="w-16 h-16 object-cover rounded-lg border border-gray-200 hover:opacity-75 transition-opacity" />
          </a>
        </div>
      )}
    </div>
  );
}

function StatusSelect({ orderId, status, updating, onChange }: {
  orderId: string; status: OrderStatus; updating: boolean;
  onChange: (s: OrderStatus) => void;
}) {
  return (
    <select
      disabled={updating}
      value={status}
      onChange={e => onChange(e.target.value as OrderStatus)}
      className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:opacity-50 w-full"
    >
      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

export default function OrdersTable({ orders, onRefresh }: { orders: Order[]; onRefresh: () => void }) {
  const [updating, setUpdating] = useState<string | null>(null);

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

  if (orders.length === 0) {
    return <p className="text-gray-400 text-sm">No orders found.</p>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden lg:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Order #","Customer","Items Ordered","Date / Time","Total","Payment","Status",""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 transition-colors align-top">
                <td className="px-4 py-3 font-mono font-medium text-brand-700 whitespace-nowrap">#{order.order_number}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900 whitespace-nowrap">{order.customer_name}</p>
                  <p className="text-gray-400 text-xs">{order.customer_phone}</p>
                  {order.customer_email && <p className="text-gray-400 text-xs">{order.customer_email}</p>}
                  <span className={`inline-block mt-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${order.delivery_method === "delivery" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                    {order.delivery_method}
                  </span>
                  {order.delivery_address && <p className="text-gray-400 text-xs mt-0.5 max-w-[140px]">{order.delivery_address}</p>}
                </td>
                <td className="px-4 py-3 min-w-[220px]">
                  {Array.isArray(order.items) && order.items.length > 0
                    ? <ItemsList items={order.items} />
                    : <span className="text-gray-400 text-xs">No items</span>}
                  {order.notes && (
                    <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1 mt-2">📝 {order.notes}</p>
                  )}
                  {(order.sticker_url || order.image_url) && (
                    <div className="mt-3">
                      <UploadedMedia stickerUrl={order.sticker_url} imageUrl={order.image_url} />
                    </div>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <p className="text-gray-700">{order.pickup_date}</p>
                  <p className="text-gray-400 text-xs">{order.pickup_time}</p>
                </td>
                <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{order.total} QAR</td>
                <td className="px-4 py-3 text-gray-600 capitalize whitespace-nowrap">{order.payment_method}</td>
                <td className="px-4 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 min-w-[120px]">
                  <StatusSelect orderId={order.id} status={order.status} updating={updating === order.id} onChange={s => changeStatus(order.id, s)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile / tablet cards */}
      <div className="lg:hidden space-y-4">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
            {/* Header row */}
            <div className="flex items-start justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-brand-700">#{order.order_number}</span>
                <span className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_COLORS[order.status]}`}>
                  {order.status}
                </span>
              </div>
              <span className="font-semibold text-gray-900 text-sm shrink-0">{order.total} QAR</span>
            </div>

            {/* Customer */}
            <div className="text-sm">
              <p className="font-medium text-gray-900">{order.customer_name}</p>
              <p className="text-gray-400 text-xs">{order.customer_phone}</p>
              {order.customer_email && <p className="text-gray-400 text-xs">{order.customer_email}</p>}
            </div>

            {/* Date + method */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>📅 {order.pickup_date}</span>
              <span>🕐 {order.pickup_time}</span>
              <span className={`px-1.5 py-0.5 rounded font-medium ${order.delivery_method === "delivery" ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"}`}>
                {order.delivery_method}
              </span>
            </div>
            {order.delivery_address && (
              <p className="text-xs text-gray-400">📍 {order.delivery_address}</p>
            )}

            {/* Items */}
            <div className="border-t border-gray-50 pt-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Items</p>
              {Array.isArray(order.items) && order.items.length > 0
                ? <ItemsList items={order.items} />
                : <p className="text-gray-400 text-xs">No items</p>}
            </div>

            {/* Notes */}
            {order.notes && (
              <p className="text-xs text-amber-700 bg-amber-50 rounded px-2 py-1.5">📝 {order.notes}</p>
            )}

            {/* Uploaded sticker / image */}
            {(order.sticker_url || order.image_url) && (
              <UploadedMedia stickerUrl={order.sticker_url} imageUrl={order.image_url} />
            )}

            {/* Payment + status change */}
            <div className="flex items-center gap-3 pt-1 border-t border-gray-50">
              <span className="text-xs text-gray-500 capitalize">{order.payment_method} payment</span>
              <div className="ml-auto w-36">
                <StatusSelect orderId={order.id} status={order.status} updating={updating === order.id} onChange={s => changeStatus(order.id, s)} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
