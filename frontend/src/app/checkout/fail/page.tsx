"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { AlertCircle, RotateCcw, Home } from "lucide-react";

function FailContent() {
  const p = useSearchParams();
  const order  = p.get("order") ?? p.get("orderId");
  const reason = p.get("reason");

  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-4 py-12"
      style={{ backgroundColor: "#F5D0D8" }}
    >
      <div className="w-full max-w-md text-center">
        <div className="w-20 h-20 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-6">
          <AlertCircle size={40} className="text-red-500" />
        </div>

        <p className="text-[#800020]/70 font-semibold tracking-[0.3em] uppercase text-xs mb-2">
          Payment Failed
        </p>
        <h1 className="font-playfair text-3xl font-bold text-[#2D000A] mb-3">
          Something went wrong
        </h1>
        <p className="text-[#800020]/55 text-sm leading-relaxed mb-8">
          {reason
            ? reason
            : "Your payment could not be processed. No charge has been made. Please try again or choose Cash on Pickup."}
        </p>

        {order && (
          <p className="text-[#A05068] text-xs mb-6">
            Order reference: <span className="font-mono font-semibold">#{order}</span>
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-[rgba(128,0,32,0.15)] text-[#800020] hover:border-[#800020] font-semibold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97] bg-white/60"
          >
            <Home size={16} />
            Home
          </Link>
          <Link
            href="/cart"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#800020] hover:bg-[#2D000A] text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
          >
            <RotateCcw size={16} />
            Back to Cart
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function FailPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#F5D0D8" }}>
          <div className="w-8 h-8 rounded-full border-2 border-[#800020] border-t-transparent animate-spin" />
        </main>
      }
    >
      <FailContent />
    </Suspense>
  );
}
