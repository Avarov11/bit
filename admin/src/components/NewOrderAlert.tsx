"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";

interface OrderPayload {
  id: string;
  order_number: string;
  customer_name: string;
  total: number | string;
  delivery_method: string;
}

interface Toast {
  id: number;
  order: OrderPayload;
}

function playDing() {
  try {
    const ctx = new AudioContext();
    const times = [0, 0.55, 1.1];
    const freqs = [880, 1108, 1320];
    times.forEach((t, i) => {
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freqs[i];
      gain.gain.setValueAtTime(0.28, ctx.currentTime + t);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + t + 0.9);
      osc.start(ctx.currentTime + t);
      osc.stop(ctx.currentTime + t + 1.0);
    });
    setTimeout(() => ctx.close(), 3000);
  } catch {}
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // mount → animate in
    const show = setTimeout(() => setVisible(true), 10);
    // auto-dismiss after 8s
    const hide = setTimeout(() => {
      setVisible(false);
      setTimeout(onDismiss, 400);
    }, 8000);
    return () => { clearTimeout(show); clearTimeout(hide); };
  }, [onDismiss]);

  const o = toast.order;
  const isDelivery = o.delivery_method === "delivery";

  return (
    <div
      style={{
        transform: visible ? "translateX(0)" : "translateX(calc(100% + 24px))",
        opacity: visible ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(.22,.68,0,1.2), opacity 0.3s ease",
      }}
      className="w-80 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden"
    >
      {/* top accent stripe */}
      <div className="h-1 w-full bg-gradient-to-r from-[#800020] to-[#c0416a]" />

      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* bell icon */}
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "linear-gradient(135deg,#800020,#c0416a)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#800020] uppercase tracking-wider mb-0.5">New Order!</p>
            <p className="font-bold text-gray-900 text-sm leading-tight truncate">{o.customer_name}</p>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className="font-mono text-xs text-gray-500 font-semibold">#{o.order_number}</span>
              <span className="text-xs font-bold text-gray-900">{o.total} QAR</span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                isDelivery ? "bg-blue-50 text-blue-700" : "bg-gray-100 text-gray-600"
              }`}>
                {isDelivery ? "🚚 Delivery" : "🏪 Pickup"}
              </span>
            </div>
          </div>

          <button
            onClick={() => { setVisible(false); setTimeout(onDismiss, 400); }}
            className="shrink-0 p-1 rounded-lg text-gray-300 hover:text-gray-500 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <a
          href="/dashboard/orders"
          className="mt-3 flex items-center justify-center gap-1.5 w-full py-2 rounded-xl text-xs font-bold text-white transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(90deg,#800020,#c0416a)" }}
        >
          View Orders
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </a>
      </div>
    </div>
  );
}

export default function NewOrderAlert() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const counter = useRef(0);
  const seenIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    const channel = supabase
      .channel("orders-realtime")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const order = payload.new as OrderPayload;
          if (seenIds.current.has(order.id)) return;
          seenIds.current.add(order.id);
          playDing();
          // Browser notification if permission granted
          if (typeof Notification !== "undefined" && Notification.permission === "granted") {
            new Notification("New order! 🎂", {
              body: `${order.customer_name} · #${order.order_number} · ${order.total} QAR`,
              icon: "/favicon.ico",
            });
          }
          setToasts(prev => [...prev, { id: ++counter.current, order }]);
        }
      )
      .subscribe();

    // Request browser notification permission silently
    if (typeof Notification !== "undefined" && Notification.permission === "default") {
      Notification.requestPermission().catch(() => {});
    }

    return () => { supabase.removeChannel(channel); };
  }, []);

  function fireTest() {
    playDing();
    const mock: Toast = {
      id: ++counter.current,
      order: {
        id: "test-" + Date.now(),
        order_number: "TEST-001",
        customer_name: "Test Customer",
        total: 160,
        delivery_method: "pickup",
      },
    };
    setToasts(prev => [...prev, mock]);
  }

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 items-end pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard
            toast={t}
            onDismiss={() => setToasts(prev => prev.filter(x => x.id !== t.id))}
          />
        </div>
      ))}
      {/* Test button */}
      <button
        onClick={fireTest}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-gray-200 shadow-sm text-gray-500 hover:text-[#800020] hover:border-[#800020]/30 transition-all"
        title="Test order notification"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        Test alert
      </button>
    </div>
  );
}
