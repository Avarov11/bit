"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Clock, CreditCard, Banknote } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

const timeSlots = [
  "10:00 AM – 12:00 PM",
  "12:00 PM – 2:00 PM",
  "2:00 PM – 5:00 PM",
  "5:00 PM – 8:00 PM",
];

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
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.phone.trim()) e.phone = "Phone number is required";
    if (!form.email.trim() || !form.email.includes("@")) e.email = "Valid email required";
    if (!form.pickupDate) e.pickupDate = "Please choose a pickup date";
    if (!form.pickupTime) e.pickupTime = "Please choose a pickup time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setPlacing(true);
    const orderNumber = Math.floor(100000 + Math.random() * 900000).toString();
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
        <p className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-3">Your cart is empty</p>
        <Link href="/menu" className="text-[#3D0A14] font-semibold hover:underline">Browse the menu →</Link>
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
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A0A0A]">
              Checkout
            </h1>
            <p className="text-[#3D0A14]/60 text-sm">Review and confirm your order</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} noValidate>
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            {/* ── Form ──────────────────────────────── */}
            <div className="flex-1 w-full space-y-4">
              <Section title="Contact Information">
                <Field label="Full Name" type="text" placeholder="Sarah Al-Khatib"
                  value={form.name} onChange={(e) => set("name", e.target.value)} error={errors.name} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Phone Number" type="tel" placeholder="+961 70 000 000"
                    value={form.phone} onChange={(e) => set("phone", e.target.value)} error={errors.phone} />
                  <Field label="Email Address" type="email" placeholder="sarah@email.com"
                    value={form.email} onChange={(e) => set("email", e.target.value)} error={errors.email} />
                </div>
              </Section>

              <Section title="Pickup Details">
                {/* Store card */}
                <div className="flex items-start gap-3 p-4 bg-[#F5E4E6] border border-[rgba(26,10,10,0.10)] rounded-xl">
                  <MapPin size={16} className="text-[#3D0A14] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-[#1A0A0A] text-sm">Biteez Boutique</p>
                    <p className="text-[#4A3728] text-xs mt-0.5">123 Dessert Lane, Beirut, Lebanon</p>
                    <p className="text-[#9E7B7B] text-xs flex items-center gap-1 mt-1">
                      <Clock size={10} /> Open daily · 9:00 AM – 9:00 PM
                    </p>
                  </div>
                </div>

                {/* Date */}
                <div>
                  <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-1.5">
                    Pickup Date
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
                    Pickup Time
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot} type="button" onClick={() => set("pickupTime", slot)}
                        className={cn(
                          "py-3 px-3 rounded-xl border-2 text-xs font-semibold text-center transition-all duration-200 active:scale-[0.97]",
                          form.pickupTime === slot
                            ? "border-[#3D0A14] bg-[#3D0A14] text-white shadow-warm-sm"
                            : "border-[rgba(26,10,10,0.10)] text-[#4A3728] hover:border-[#3D0A14]/40 bg-white"
                        )}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                  {errors.pickupTime && <p className="text-red-500 text-[11px] mt-1">{errors.pickupTime}</p>}
                </div>
              </Section>

              <Section title="Payment Method">
                <p className="text-[#9E7B7B] text-xs -mt-1">
                  Payment is collected at pickup — no online payment required.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: "cash", label: "Cash on Pickup", Icon: Banknote },
                    { id: "card", label: "Card on Pickup", Icon: CreditCard },
                  ].map(({ id, label, Icon }) => (
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
                      <span className={cn(
                        "text-sm font-semibold",
                        form.payment === id ? "text-[#3D0A14]" : "text-[#4A3728]"
                      )}>
                        {label}
                      </span>
                    </button>
                  ))}
                </div>
              </Section>

              <Section title="Order Notes">
                <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider -mt-2 mb-1.5">
                  Special Requests (optional)
                </label>
                <textarea
                  value={form.notes} onChange={(e) => set("notes", e.target.value)}
                  placeholder="Allergies, special packaging, decoration requests…"
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors resize-none"
                />
              </Section>
            </div>

            {/* ── Order summary ──────────────────────── */}
            <div className="w-full lg:w-80 xl:w-96 shrink-0">
              <div className="bg-white rounded-2xl shadow-warm-sm p-6 sticky top-24">
                <h2 className="font-playfair text-xl font-bold text-[#1A0A0A] mb-5">
                  Order Summary
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
                    <span className="text-[#9E7B7B]">Subtotal</span>
                    <span className="font-semibold text-[#1A0A0A]">QAR {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-[#9E7B7B]">Delivery</span>
                    <span className="text-emerald-600 font-semibold">Pickup · Free</span>
                  </div>
                  <div className="border-t border-[rgba(26,10,10,0.08)] pt-3 flex justify-between">
                    <span className="font-bold text-[#1A0A0A]">Total</span>
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
                      Placing Order…
                    </span>
                  ) : "Place Order"}
                </button>

                <p className="text-center text-[#9E7B7B] text-xs mt-3">
                  By placing your order you agree to our terms and conditions
                </p>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}
