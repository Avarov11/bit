"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Clock, CreditCard, Truck, Banknote } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const timeSlotKeys = ["timeslot_0", "timeslot_1", "timeslot_2", "timeslot_3"];

function Field({
  label, error, ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#A05068] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "w-full px-4 py-3 bg-white border rounded-xl text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none transition-colors",
          error ? "border-red-400 focus:border-red-500" : "border-[rgba(128,0,32,0.10)] focus:border-[#800020]"
        )}
      />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-warm-xs p-5 md:p-6 space-y-4">
      <h3 className="font-playfair text-lg font-bold text-[#2D000A]">{title}</h3>
      {children}
    </div>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCartStore();
  const { t, lang } = useLanguage();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const subtotal = useMemo(
    () => items.reduce((s, i) => s + i.unitPrice * i.quantity, 0),
    [items]
  );

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split("T")[0];
  }, []);

  const [form, setForm] = useState({
    name: "", phone: "", email: "",
    deliveryMethod: "pickup",
    address: "",
    pickupDate: "", pickupTime: "",
    payment: "online", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);
  const paymentFailed = typeof window !== "undefined" && new URLSearchParams(window.location.search).get("payment") === "failed";

  const set = (key: string, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = t("checkout_error_name");
    if (!form.phone.trim()) e.phone = t("checkout_error_phone");
    if (!form.email.trim() || !form.email.includes("@")) e.email = t("checkout_error_email");
    if (form.deliveryMethod === "delivery" && !form.address.trim()) e.address = "Please enter your delivery address";
    if (!form.pickupDate) e.pickupDate = t("checkout_error_pickup_date");
    if (!form.pickupTime) e.pickupTime = t("checkout_error_pickup_time");
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);

    const stickerUrl = items.map(i => i.customization?.stickerUrl).find(Boolean) ?? null;
    const imageUrl   = items.map(i => i.customization?.imageUrl).find(Boolean) ?? null;

    const orderBase = {
      customer_name:    form.name,
      customer_phone:   form.phone,
      customer_email:   form.email || null,
      delivery_method:  form.deliveryMethod,
      delivery_address: form.deliveryMethod === "delivery" ? form.address : null,
      pickup_date:      form.pickupDate,
      pickup_time:      form.pickupTime,
      sticker_url:      stickerUrl,
      image_url:        imageUrl,
      items: items.map((i) => ({
        productId:     i.productId,
        productName:   i.productName,
        productImage:  i.productImage,
        quantity:      i.quantity,
        unitPrice:     i.unitPrice,
        subtotal:      i.unitPrice * i.quantity,
        customization: i.customization,
      })),
      subtotal,
      delivery_fee: 0,
      total:        subtotal,
      notes:        form.notes || null,
      language:     lang,
    };

    // ── Online payment via Sadad Web Checkout 2.1 ──────────────────────────
    if (form.payment === "online") {
      try {
        const res = await fetch("/api/checkout", {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ order: orderBase, subtotal }),
        });
        if (!res.ok) {
          const { error: apiErr } = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(apiErr ?? "checkout failed");
        }
        const { form: sadadForm } = await res.json();
        // Inject the HTML form returned by Sadad and auto-submit it
        const container = document.createElement("div");
        container.innerHTML = sadadForm as string;
        document.body.appendChild(container);
        const formEl = container.querySelector("form") as HTMLFormElement | null;
        if (!formEl) throw new Error("No form in Sadad response");
        formEl.submit();
      } catch (err) {
        setPlacing(false);
        alert("Payment error: " + (err instanceof Error ? err.message : String(err)));
      }
      return;
    }

    // ── Cash on pickup ──────────────────────────────────────────────────────
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    await fetch("/api/orders", {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ ...orderBase, order_number: orderNumber, payment_method: "cash", status: "pending" }),
    });
    clearCart();
    router.push(
      `/checkout/success?order=${orderNumber}&date=${form.pickupDate}&time=${encodeURIComponent(form.pickupTime)}&name=${encodeURIComponent(form.name)}`
    );
  };

  if (!mounted) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center" style={{ backgroundColor: "#F5D0D8" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#800020] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#F5D0D8" }}>
        <p data-i18n="checkout_empty" className="font-playfair text-2xl font-bold text-[#2D000A] mb-3">
          {t("checkout_empty")}
        </p>
        <Link href="/menu" data-i18n="checkout_browse_menu" className="text-[#800020] font-semibold hover:underline">
          {t("checkout_browse_menu")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-10" style={{ backgroundColor: "#F5D0D8" }}>
      {/* Header */}
      <div className="border-b border-[rgba(128,0,32,0.10)] px-6 md:px-12 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/cart" className="text-[#A05068] hover:text-[#800020] transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 data-i18n="checkout_title" className="font-playfair text-2xl md:text-3xl font-bold text-[#2D000A]">
              {t("checkout_title")}
            </h1>
            <p data-i18n="checkout_subtitle" className="text-[#800020]/60 text-sm">
              {t("checkout_subtitle")}
            </p>
          </div>
        </div>
      </div>

      {paymentFailed && (
        <div className="max-w-6xl mx-auto px-6 md:px-12 pt-4">
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-700 font-medium">
            ⚠️ Payment was not completed. Please try again or choose Cash on Pickup.
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ── Form ──────────────────────────────── */}
            <div className="flex-1 w-full space-y-4">
              <Section title={t("checkout_contact_section")}>
                <Field
                  label={t("checkout_full_name")}
                  data-i18n="checkout_full_name"
                  type="text"
                  placeholder={t("checkout_name_placeholder")}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  error={errors.name}
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label={t("checkout_phone")}
                    data-i18n="checkout_phone"
                    type="tel"
                    placeholder={t("checkout_phone_placeholder")}
                    value={form.phone}
                    onChange={(e) => set("phone", e.target.value)}
                    error={errors.phone}
                  />
                  <Field
                    label={t("checkout_email")}
                    data-i18n="checkout_email"
                    type="email"
                    placeholder={t("checkout_email_placeholder")}
                    value={form.email}
                    onChange={(e) => set("email", e.target.value)}
                    error={errors.email}
                  />
                </div>
              </Section>

              <Section title={t("checkout_pickup_section")}>
                {/* Pickup / Delivery toggle */}
                <div className="grid grid-cols-2 gap-3">
                  {([
                    { id: "pickup",   label: "Pickup",   Icon: MapPin },
                    { id: "delivery", label: "Delivery", Icon: Truck  },
                  ] as const).map(({ id, label, Icon }) => (
                    <button
                      key={id} type="button" onClick={() => set("deliveryMethod", id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        form.deliveryMethod === id
                          ? "border-[#800020] bg-[#F5D0D8] shadow-warm-xs"
                          : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/30 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        form.deliveryMethod === id ? "bg-[#800020] text-white" : "bg-[#F5D0D8] text-[#A05068]"
                      )}>
                        <Icon size={16} />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        form.deliveryMethod === id ? "text-[#800020]" : "text-[#800020]"
                      )}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Store card — pickup only */}
                {form.deliveryMethod === "pickup" && (
                  <div className="flex items-start gap-3 p-4 bg-[#F5D0D8] border border-[rgba(128,0,32,0.10)] rounded-xl">
                    <MapPin size={16} className="text-[#800020] shrink-0 mt-0.5" />
                    <div>
                      <p data-i18n="checkout_boutique_name" className="font-semibold text-[#2D000A] text-sm">
                        {t("checkout_boutique_name")}
                      </p>
                      <p data-i18n="checkout_address" className="text-[#800020] text-xs mt-0.5">
                        {t("checkout_address")}
                      </p>
                      <p data-i18n="checkout_hours" className="text-[#A05068] text-xs flex items-center gap-1 mt-1">
                        <Clock size={10} /> {t("checkout_hours")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address field — delivery only */}
                {form.deliveryMethod === "delivery" && (
                  <div>
                    <label className="block text-xs font-bold text-[#A05068] uppercase tracking-wider mb-1.5">
                      Delivery Address
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="Enter your full delivery address..."
                      rows={3}
                      className={cn(
                        "w-full px-4 py-3 bg-white border rounded-xl text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none transition-colors resize-none",
                        errors.address ? "border-red-400 focus:border-red-500" : "border-[rgba(128,0,32,0.10)] focus:border-[#800020]"
                      )}
                    />
                    {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address}</p>}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-[#A05068] uppercase tracking-wider mb-1.5">
                    {form.deliveryMethod === "delivery" ? "Delivery Date" : t("checkout_pickup_date")}
                  </label>
                  <input
                    type="date" min={today} max={maxDate}
                    value={form.pickupDate} onChange={(e) => set("pickupDate", e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl text-sm text-[#2D000A] outline-none transition-colors",
                      errors.pickupDate ? "border-red-400" : "border-[rgba(128,0,32,0.10)] focus:border-[#800020]"
                    )}
                  />
                  {errors.pickupDate && <p className="text-red-500 text-[11px] mt-1">{errors.pickupDate}</p>}
                </div>

                {/* Time slots */}
                <div>
                  <label className="block text-xs font-bold text-[#A05068] uppercase tracking-wider mb-2">
                    {form.deliveryMethod === "delivery" ? "Delivery Time" : t("checkout_pickup_time")}
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlotKeys.map((slotKey) => {
                      const slotLabel = t(slotKey);
                      return (
                        <button
                          key={slotKey}
                          type="button"
                          onClick={() => set("pickupTime", slotLabel)}
                          data-i18n={slotKey}
                          className={cn(
                            "py-3 px-3 rounded-xl border-2 text-xs font-semibold text-center transition-all duration-200 active:scale-[0.97]",
                            form.pickupTime === slotLabel
                              ? "border-[#800020] bg-[#800020] text-white shadow-warm-sm"
                              : "border-[rgba(128,0,32,0.10)] text-[#800020] hover:border-[#800020]/40 bg-white"
                          )}
                        >
                          {slotLabel}
                        </button>
                      );
                    })}
                  </div>
                  {errors.pickupTime && <p className="text-red-500 text-[11px] mt-1">{errors.pickupTime}</p>}
                </div>
              </Section>

              <Section title={t("checkout_payment_section")}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { id: "online", label: "Pay Online",     sub: "Visa · Mastercard · AMEX", Icon: CreditCard },
                    { id: "cash",   label: "Cash on Pickup", sub: "Pay when you collect",      Icon: Banknote  },
                  ] as const).map(({ id, label, sub, Icon }) => (
                    <button
                      key={id} type="button" onClick={() => set("payment", id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        form.payment === id
                          ? "border-[#800020] bg-[#F5D0D8] shadow-warm-xs"
                          : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/30 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        form.payment === id ? "bg-[#800020] text-white" : "bg-[#F5D0D8] text-[#A05068]"
                      )}>
                        <Icon size={16} />
                      </div>
                      <div>
                        <p className={cn("text-sm font-semibold", form.payment === id ? "text-[#800020]" : "text-[#2D000A]")}>{label}</p>
                        <p className="text-xs text-[#A05068] mt-0.5">{sub}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={t("checkout_notes_section")}>
                <label data-i18n="checkout_special_requests" className="block text-xs font-bold text-[#A05068] uppercase tracking-wider -mt-2 mb-1.5">
                  {t("checkout_special_requests")}
                </label>
                <textarea
                  value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  data-i18n="checkout_notes_placeholder"
                  placeholder={t("checkout_notes_placeholder")}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[rgba(128,0,32,0.10)] focus:border-[#800020] rounded-xl text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none transition-colors resize-none"
                />
              </Section>
            </div>

            {/* ── Order summary ──────────────────────── */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="bg-white rounded-2xl shadow-warm-sm p-6 sticky top-24">
                <h2 data-i18n="checkout_order_summary" className="font-playfair text-xl font-bold text-[#2D000A] mb-5">
                  {t("checkout_order_summary")}
                </h2>

                <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-sm gap-2">
                      <span className="text-[#800020] truncate">
                        {item.productName}
                        {item.quantity > 1 && <span className="text-[#A05068] ml-1">×{item.quantity}</span>}
                      </span>
                      <span className="font-semibold text-[#2D000A] shrink-0">
                        QAR {item.unitPrice * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[rgba(128,0,32,0.08)] pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span data-i18n="checkout_subtotal" className="text-[#A05068]">{t("checkout_subtotal")}</span>
                    <span className="font-semibold text-[#2D000A]">QAR {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span data-i18n="cart_delivery" className="text-[#A05068]">{t("cart_delivery")}</span>
                    <span data-i18n="checkout_delivery_free" className="text-emerald-600 font-semibold">{t("checkout_delivery_free")}</span>
                  </div>
                  <div className="border-t border-[rgba(128,0,32,0.08)] pt-3 flex justify-between">
                    <span data-i18n="checkout_total" className="font-bold text-[#2D000A]">{t("checkout_total")}</span>
                    <span className="font-playfair font-bold text-[#800020] text-xl">QAR {subtotal}</span>
                  </div>
                </div>

                <button
                  type="submit" disabled={placing}
                  className={cn(
                    "w-full font-bold py-4 rounded-2xl transition-all duration-300 font-playfair tracking-wide",
                    placing
                      ? "bg-[#FF6B9D]/50 text-white/50 cursor-not-allowed"
                      : "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
                  )}
                >
                  {placing ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span data-i18n="checkout_placing">{t("checkout_placing")}</span>
                    </span>
                  ) : (
                    <span data-i18n="checkout_place_order">{t("checkout_place_order")}</span>
                  )}
                </button>

                <p data-i18n="checkout_terms" className="text-center text-[#A05068] text-xs mt-3">
                  {t("checkout_terms")}
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
