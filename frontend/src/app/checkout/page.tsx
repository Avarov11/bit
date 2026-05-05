"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Clock, CreditCard, Banknote, Truck } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const timeSlotKeys = ["timeslot_0", "timeslot_1", "timeslot_2", "timeslot_3"];

function Field({
  label, error, ...props
}: { label: string; error?: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-1.5">
        {label}
      </label>
      <input
        {...props}
        className={cn(
          "w-full px-4 py-3 bg-white border rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors",
          error ? "border-red-400 focus:border-red-500" : "border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14]"
        )}
      />
      {error && <p className="text-red-500 text-[11px] mt-1">{error}</p>}
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl shadow-warm-xs p-5 md:p-6 space-y-4">
      <h3 className="font-playfair text-lg font-bold text-[#1A0A0A]">{title}</h3>
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
    payment: "cash", notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [placing, setPlacing] = useState(false);

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

  const sendOrderToWhatsApp = (orderNumber: string) => {
    const phone = "201019383610";
    const paymentLabel = form.payment === "cash" ? t("checkout_cash_pickup") : t("checkout_card_pickup");

    const isDelivery = form.deliveryMethod === "delivery";

    const message = lang === "ar"
      ? `🛒 *طلب جديد — #${orderNumber}*
━━━━━━━━━━━━━━
👤 *بيانات العميل*
• الاسم: ${form.name}
• الهاتف: ${form.phone}
• البريد: ${form.email}

📦 *المنتجات*
${items.map((i) => `• ${i.productName} × ${i.quantity} — QAR ${i.unitPrice * i.quantity}`).join("\n")}

${isDelivery
  ? `🚚 *التوصيل*\n• العنوان: ${form.address}\n• التاريخ: ${form.pickupDate}\n• الوقت: ${form.pickupTime}`
  : `📍 *موعد الاستلام*\n• التاريخ: ${form.pickupDate}\n• الوقت: ${form.pickupTime}`}

💳 *طريقة الدفع:* ${paymentLabel}
${form.notes ? `\n📝 *ملاحظات:* ${form.notes}` : ""}
💰 *الإجمالي: QAR ${subtotal}*

🕐 *وقت الطلب:* ${new Date().toLocaleString("ar-EG")}
━━━━━━━━━━━━━━`.trim()
      : `🛒 *NEW ORDER — #${orderNumber}*
━━━━━━━━━━━━━━━━━━━━
👤 *Customer Info*
• Name: ${form.name}
• Phone: ${form.phone}
• Email: ${form.email}

📦 *Order Items*
${items.map((i) => `• ${i.productName} × ${i.quantity} — QAR ${i.unitPrice * i.quantity}`).join("\n")}

${isDelivery
  ? `🚚 *Delivery*\n• Address: ${form.address}\n• Date: ${form.pickupDate}\n• Time: ${form.pickupTime}`
  : `📍 *Pickup Details*\n• Date: ${form.pickupDate}\n• Time: ${form.pickupTime}`}

💳 *Payment:* ${paymentLabel}
${form.notes ? `\n📝 *Notes:* ${form.notes}` : ""}
💰 *TOTAL: QAR ${subtotal}*

🕐 *Order Time:* ${new Date().toLocaleString("en-EG")}
━━━━━━━━━━━━━━━━━━━━`.trim();

    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, "_blank");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
    sendOrderToWhatsApp(orderNumber);
    setPlacing(true);
    setTimeout(() => {
      clearCart();
      router.push(
        `/checkout/success?order=${orderNumber}&date=${form.pickupDate}&time=${encodeURIComponent(form.pickupTime)}&name=${encodeURIComponent(form.name)}`
      );
    }, 900);
  };

  if (!mounted) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center" style={{ backgroundColor: "#C896A0" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#3D0A14] border-t-transparent animate-spin" />
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#C896A0" }}>
        <p data-i18n="checkout_empty" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-3">
          {t("checkout_empty")}
        </p>
        <Link href="/menu" data-i18n="checkout_browse_menu" className="text-[#3D0A14] font-semibold hover:underline">
          {t("checkout_browse_menu")}
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-10" style={{ backgroundColor: "#C896A0" }}>
      {/* Header */}
      <div className="border-b border-[rgba(26,10,10,0.10)] px-6 md:px-12 py-5">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <Link href="/cart" className="text-[#9E7B7B] hover:text-[#3D0A14] transition-colors">
            <ChevronLeft size={22} />
          </Link>
          <div>
            <h1 data-i18n="checkout_title" className="font-playfair text-2xl md:text-3xl font-bold text-[#1A0A0A]">
              {t("checkout_title")}
            </h1>
            <p data-i18n="checkout_subtitle" className="text-[#3D0A14]/60 text-sm">
              {t("checkout_subtitle")}
            </p>
          </div>
        </div>
      </div>

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
                          ? "border-[#3D0A14] bg-[#F5E4E6] shadow-warm-xs"
                          : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/30 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        form.deliveryMethod === id ? "bg-[#3D0A14] text-white" : "bg-[#F5E4E6] text-[#9E7B7B]"
                      )}>
                        <Icon size={16} />
                      </div>
                      <span className={cn(
                        "text-sm font-semibold",
                        form.deliveryMethod === id ? "text-[#3D0A14]" : "text-[#4A3728]"
                      )}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Store card — pickup only */}
                {form.deliveryMethod === "pickup" && (
                  <div className="flex items-start gap-3 p-4 bg-[#F5E4E6] border border-[rgba(26,10,10,0.10)] rounded-xl">
                    <MapPin size={16} className="text-[#3D0A14] shrink-0 mt-0.5" />
                    <div>
                      <p data-i18n="checkout_boutique_name" className="font-semibold text-[#1A0A0A] text-sm">
                        {t("checkout_boutique_name")}
                      </p>
                      <p data-i18n="checkout_address" className="text-[#4A3728] text-xs mt-0.5">
                        {t("checkout_address")}
                      </p>
                      <p data-i18n="checkout_hours" className="text-[#9E7B7B] text-xs flex items-center gap-1 mt-1">
                        <Clock size={10} /> {t("checkout_hours")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Address field — delivery only */}
                {form.deliveryMethod === "delivery" && (
                  <div>
                    <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-1.5">
                      Delivery Address
                    </label>
                    <textarea
                      value={form.address}
                      onChange={(e) => set("address", e.target.value)}
                      placeholder="Enter your full delivery address..."
                      rows={3}
                      className={cn(
                        "w-full px-4 py-3 bg-white border rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors resize-none",
                        errors.address ? "border-red-400 focus:border-red-500" : "border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14]"
                      )}
                    />
                    {errors.address && <p className="text-red-500 text-[11px] mt-1">{errors.address}</p>}
                  </div>
                )}

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-1.5">
                    {form.deliveryMethod === "delivery" ? "Delivery Date" : t("checkout_pickup_date")}
                  </label>
                  <input
                    type="date" min={today} max={maxDate}
                    value={form.pickupDate} onChange={(e) => set("pickupDate", e.target.value)}
                    className={cn(
                      "w-full px-4 py-3 bg-white border rounded-xl text-sm text-[#1A0A0A] outline-none transition-colors",
                      errors.pickupDate ? "border-red-400" : "border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14]"
                    )}
                  />
                  {errors.pickupDate && <p className="text-red-500 text-[11px] mt-1">{errors.pickupDate}</p>}
                </div>

                {/* Time slots */}
                <div>
                  <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-2">
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
                              ? "border-[#3D0A14] bg-[#3D0A14] text-white shadow-warm-sm"
                              : "border-[rgba(26,10,10,0.10)] text-[#4A3728] hover:border-[#3D0A14]/40 bg-white"
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
                <p data-i18n="checkout_payment_note" className="text-[#9E7B7B] text-xs -mt-1">
                  {t("checkout_payment_note")}
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {([
                    { id: "cash", labelKey: "checkout_cash_pickup", Icon: Banknote },
                    { id: "card", labelKey: "checkout_card_pickup", Icon: CreditCard },
                  ] as const).map(({ id, labelKey, Icon }) => (
                    <button
                      key={id} type="button" onClick={() => set("payment", id)}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all duration-200",
                        form.payment === id
                          ? "border-[#3D0A14] bg-[#F5E4E6] shadow-warm-xs"
                          : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/30 bg-white"
                      )}
                    >
                      <div className={cn(
                        "w-9 h-9 rounded-full flex items-center justify-center shrink-0",
                        form.payment === id ? "bg-[#3D0A14] text-white" : "bg-[#F5E4E6] text-[#9E7B7B]"
                      )}>
                        <Icon size={16} />
                      </div>
                      <span
                        data-i18n={labelKey}
                        className={cn(
                          "text-sm font-semibold",
                          form.payment === id ? "text-[#3D0A14]" : "text-[#4A3728]"
                        )}
                      >
                        {t(labelKey)}
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title={t("checkout_notes_section")}>
                <label data-i18n="checkout_special_requests" className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider -mt-2 mb-1.5">
                  {t("checkout_special_requests")}
                </label>
                <textarea
                  value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  data-i18n="checkout_notes_placeholder"
                  placeholder={t("checkout_notes_placeholder")}
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors resize-none"
                />
              </Section>
            </div>

            {/* ── Order summary ──────────────────────── */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="bg-white rounded-2xl shadow-warm-sm p-6 sticky top-24">
                <h2 data-i18n="checkout_order_summary" className="font-playfair text-xl font-bold text-[#1A0A0A] mb-5">
                  {t("checkout_order_summary")}
                </h2>

                <div className="space-y-2 mb-4 max-h-52 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div key={item.cartId} className="flex justify-between text-sm gap-2">
                      <span className="text-[#4A3728] truncate">
                        {item.productName}
                        {item.quantity > 1 && <span className="text-[#9E7B7B] ml-1">×{item.quantity}</span>}
                      </span>
                      <span className="font-semibold text-[#1A0A0A] shrink-0">
                        QAR {item.unitPrice * item.quantity}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-[rgba(26,10,10,0.08)] pt-4 space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span data-i18n="checkout_subtotal" className="text-[#9E7B7B]">{t("checkout_subtotal")}</span>
                    <span className="font-semibold text-[#1A0A0A]">QAR {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span data-i18n="cart_delivery" className="text-[#9E7B7B]">{t("cart_delivery")}</span>
                    <span data-i18n="checkout_delivery_free" className="text-emerald-600 font-semibold">{t("checkout_delivery_free")}</span>
                  </div>
                  <div className="border-t border-[rgba(26,10,10,0.08)] pt-3 flex justify-between">
                    <span data-i18n="checkout_total" className="font-bold text-[#1A0A0A]">{t("checkout_total")}</span>
                    <span className="font-playfair font-bold text-[#3D0A14] text-xl">QAR {subtotal}</span>
                  </div>
                </div>

                <button
                  type="submit" disabled={placing}
                  className={cn(
                    "w-full font-bold py-4 rounded-2xl transition-all duration-300 font-playfair tracking-wide text-white",
                    placing
                      ? "bg-[#9E7B7B] cursor-not-allowed"
                      : "bg-[#3D0A14] hover:bg-[#2D0810] shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
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

                <p data-i18n="checkout_terms" className="text-center text-[#9E7B7B] text-xs mt-3">
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
