"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";
import { MessageCircle } from "lucide-react";

interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: number;
  customization?: {
    shape?: string;
    flavor?: string;
    color?: string;
    toppings?: string[];
    message?: string;
  };
}

interface OrderSummary {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  items: OrderItem[];
  total: number;
}

function buildWhatsAppMessage(order: OrderSummary): string {
  const lines: string[] = [
    "🎂 New Order – Biteez",
    "━━━━━━━━━━━━━━━━━━━",
    `Order #: ${order.order_number}`,
    `Name: ${order.customer_name}`,
    `Phone: ${order.customer_phone}`,
    ...(order.delivery_address ? [`Address: ${order.delivery_address}`] : []),
    "",
    "🛒 Items:",
  ];

  order.items.forEach((item) => {
    const c = item.customization ?? {};
    lines.push(`• ${item.productName} x${item.quantity}`);
    if (c.shape)   lines.push(`  Shape: ${c.shape}`);
    if (c.flavor)  lines.push(`  Flavour: ${c.flavor}`);
    if (c.color)   lines.push(`  Colour: ${c.color}`);
    if (c.toppings?.length) lines.push(`  Toppings: ${c.toppings.join(", ")}`);
    if (c.message) lines.push(`  Message: "${c.message}"`);
  });

  lines.push("", `💰 Total: QAR ${order.total}`, "━━━━━━━━━━━━━━━━━━━");

  return lines.filter((l) => l !== null).join("\n");
}

function SuccessContent() {
  const { clearCart } = useCartStore();
  const p = useSearchParams();

  const order   = p.get("order")   ?? p.get("orderId") ?? "—";
  const name    = p.get("name")    ?? "";
  const date    = p.get("date")    ?? "";
  const time    = p.get("time")    ?? "";
  const phone   = p.get("phone")   ?? "";
  const address = p.get("address") ?? "";
  const token   = p.get("token")   ?? "";

  const [summary, setSummary] = useState<OrderSummary | null>(null);

  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!order || order === "—" || !token) return;
    fetch(`/api/order-summary?n=${encodeURIComponent(order)}&token=${encodeURIComponent(token)}`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => { if (data) setSummary(data); })
      .catch(() => {});
  }, [order, token]);

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  const waLink = summary
    ? `https://wa.me/2001019383610?text=${encodeURIComponent(buildWhatsAppMessage(summary))}`
    : null;

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#F5D0D8" }}
    >
      <div className="w-full max-w-md text-center">
        <div className="w-56 h-56 rounded-3xl overflow-hidden mx-auto mb-6 shadow-warm-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/products/confirm.jpeg"
            alt="Order confirmed"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-[#800020]/70 font-semibold tracking-[0.3em] uppercase text-xs mb-2">
          Payment Successful
        </p>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#2D000A] mb-3">
          {name ? `Thank you, ${name.split(" ")[0]}!` : "Order Confirmed!"}
        </h1>
        <p className="text-[#800020]/55 text-sm leading-relaxed mb-8">
          Your Biteez order is confirmed. We&apos;re preparing your treats with love!
        </p>

        {/* Order card */}
        <div className="bg-white rounded-2xl shadow-warm-sm p-6 text-left mb-4 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(128,0,32,0.06)]">
            <span className="text-[#A05068] text-sm">Order number</span>
            <span className="font-playfair font-bold text-[#800020] text-lg">#{order}</span>
          </div>
          {(formattedDate || time) && (
            <div>
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-1">
                Delivery
              </p>
              {formattedDate && <p className="text-[#2D000A] text-sm font-semibold">{formattedDate}</p>}
              {time && <p className="text-[#A05068] text-xs">{decodeURIComponent(time)}</p>}
            </div>
          )}
          {(phone || address) && (
            <div className="pt-1 border-t border-[rgba(128,0,32,0.06)] space-y-1">
              {phone   && <p className="text-[#A05068] text-xs"><span className="font-semibold text-[#2D000A]">Phone:</span> {phone}</p>}
              {address && <p className="text-[#A05068] text-xs"><span className="font-semibold text-[#2D000A]">Address:</span> {address}</p>}
            </div>
          )}
        </div>

        {/* WhatsApp button */}
        {waLink && (
          <div className="mb-6">
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2.5 bg-[#25D366] hover:bg-[#1DA851] text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-warm-sm hover:shadow-warm-md active:scale-[0.97]"
            >
              <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current shrink-0">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Confirm Order on WhatsApp
            </a>
            <p className="text-[#800020]/50 text-xs mt-2 flex items-center justify-center gap-1">
              <MessageCircle size={11} strokeWidth={2} />
              Tap to confirm your order details with us on WhatsApp
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-[rgba(128,0,32,0.15)] text-[#800020] hover:border-[#800020] font-semibold py-3.5 rounded-2xl transition-all duration-200 bg-white/60"
          >
            Home
          </Link>
          <Link
            href="/menu"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-warm-sm"
          >
            Order Again
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5D0D8" }}>
          <div className="w-8 h-8 rounded-full border-2 border-[#800020] border-t-transparent animate-spin" />
        </main>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
