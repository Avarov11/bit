"use client";

import { Suspense, useEffect } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { MapPin, Clock, ArrowRight, Home } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/store/cartStore";

function SuccessContent() {
  const { t } = useLanguage();
  const { clearCart } = useCartStore();
  const p = useSearchParams();

  useEffect(() => { clearCart(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const order = p.get("order") ?? "000000";
  const date  = p.get("date")  ?? "";
  const time  = p.get("time")  ?? "";
  const name  = p.get("name")  ?? "there";

  const formattedDate = date
    ? new Date(date + "T12:00:00").toLocaleDateString("en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      })
    : "";

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ backgroundColor: "#F5D0D8" }}>
      <div className="w-full max-w-md text-center">
        {/* Confirmation image */}
        <div className="w-56 h-56 rounded-3xl overflow-hidden mx-auto mb-6 shadow-warm-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/products/confirm.jpeg"
            alt="Order confirmed"
            className="w-full h-full object-cover"
          />
        </div>

        <p data-i18n="success_order_confirmed" className="text-[#800020]/70 font-semibold tracking-[0.3em] uppercase text-xs mb-2">
          {t("success_order_confirmed")}
        </p>
        <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#2D000A] mb-3">
          <span data-i18n="success_heading_prefix">{t("success_heading_prefix")}</span>{" "}
          {name.split(" ")[0]}!
        </h1>
        <p data-i18n="success_message" className="text-[#800020]/55 text-sm leading-relaxed mb-8">
          {t("success_message")}
        </p>

        {/* Order card */}
        <div className="bg-white rounded-2xl shadow-warm-sm p-6 text-left mb-6">
          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[rgba(128,0,32,0.06)]">
            <span data-i18n="success_order_number" className="text-[#A05068] text-sm">
              {t("success_order_number")}
            </span>
            <span className="font-playfair font-bold text-[#800020] text-lg">#{order}</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-[#F5D0D8] flex items-center justify-center shrink-0">
                <MapPin size={14} className="text-[#800020]" />
              </div>
              <div>
                <p data-i18n="success_pickup_location" className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-0.5">
                  {t("success_pickup_location")}
                </p>
                <p data-i18n="success_boutique_name" className="text-[#2D000A] text-sm font-semibold">
                  {t("success_boutique_name")}
                </p>
                <p data-i18n="success_address" className="text-[#A05068] text-xs">
                  {t("success_address")}
                </p>
              </div>
            </div>

            {(formattedDate || time) && (
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-[#F5D0D8] flex items-center justify-center shrink-0">
                  <Clock size={14} className="text-[#800020]" />
                </div>
                <div>
                  <p data-i18n="success_pickup_time" className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-0.5">
                    {t("success_pickup_time")}
                  </p>
                  {formattedDate && <p className="text-[#2D000A] text-sm font-semibold">{formattedDate}</p>}
                  {time && <p className="text-[#A05068] text-xs">{decodeURIComponent(time)}</p>}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white/50 border border-[rgba(128,0,32,0.10)] rounded-xl px-4 py-3 mb-8 text-xs text-[#800020]/70 leading-relaxed">
          ✉️ &nbsp;
          <span data-i18n="success_email_note">{t("success_email_note")}</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 border-2 border-[rgba(128,0,32,0.15)] text-[#800020] hover:border-[#800020] font-semibold py-3.5 rounded-2xl transition-all duration-200 active:scale-[0.97] bg-white/60"
          >
            <Home size={16} />
            <span data-i18n="success_back_home">{t("success_back_home")}</span>
          </Link>
          <Link
            href="/menu"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-semibold py-3.5 rounded-2xl transition-all duration-300 shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
          >
            <span data-i18n="success_order_again">{t("success_order_again")}</span>
            <ArrowRight size={16} />
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
