"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useCartStore } from "@/store/cartStore";

function SuccessContent() {
  const { clearCart } = useCartStore();
  const p = useSearchParams();

  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const order = p.get("order") ?? p.get("orderId") ?? "—";
  const name  = p.get("name")  ?? "";
  const date  = p.get("date")  ?? "";
  const time  = p.get("time")  ?? "";

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

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

        <div className="bg-white rounded-2xl shadow-warm-sm p-6 text-left mb-6 space-y-3">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(128,0,32,0.06)]">
            <span className="text-[#A05068] text-sm">Order number</span>
            <span className="font-playfair font-bold text-[#800020] text-lg">#{order}</span>
          </div>
          {(formattedDate || time) && (
            <div>
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-1">
                Pickup / Delivery
              </p>
              {formattedDate && <p className="text-[#2D000A] text-sm font-semibold">{formattedDate}</p>}
              {time && <p className="text-[#A05068] text-xs">{decodeURIComponent(time)}</p>}
            </div>
          )}
        </div>

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
