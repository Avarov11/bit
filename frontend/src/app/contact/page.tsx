"use client";

import { useState, useRef } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

function Reveal({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: inView ? 1 : 0,
        transform: inView ? "translateY(0)" : "translateY(18px)",
        transition: `opacity 0.65s ease-out ${delay}ms, transform 0.65s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

type FormState = { name: string; email: string; subject: string; message: string };
type ErrorState = Partial<FormState>;

export default function ContactPage() {
  const { t } = useLanguage();

  const [form, setForm] = useState<FormState>({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<ErrorState>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLFormElement>(null);

  function validate(): ErrorState {
    const e: ErrorState = {};
    if (!form.name.trim()) e.name = t("contact_error_name");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = t("contact_error_email");
    if (!form.subject.trim()) e.subject = t("contact_error_subject");
    if (!form.message.trim()) e.message = t("contact_error_message");
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1400));
    setSubmitting(false);
    setSubmitted(true);
  }

  function handleChange(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  }

  const inputBase = cn(
    "w-full bg-white border border-[#F5D0D8] rounded-xl px-4 py-3",
    "text-[#2D000A] text-sm placeholder:text-[#4A3728]/30 outline-none",
    "focus:border-[#800020]/50 focus:ring-2 focus:ring-[#800020]/10",
    "transition-all duration-200"
  );
  const inputError = "border-red-400/60 bg-red-50/60";

  const contactItems = [
    { Icon: MapPin, label: t("contact_address_label"), value: t("contact_address_val") },
    { Icon: Phone,  label: t("contact_phone_label"),   value: t("contact_phone_val")   },
    { Icon: Mail,   label: t("contact_email_label"),   value: t("contact_email_val")   },
    { Icon: Clock,  label: t("contact_hours_title"),   value: t("contact_hours_val")   },
  ];

  return (
    <main className="overflow-x-hidden bg-white">

      {/* ── HERO ── */}
      <section className="pt-28 md:pt-36 pb-14 md:pb-20 px-6 bg-[#FDF0F3]">
        <div className="max-w-2xl mx-auto text-center">

          <Reveal>
            <p className="text-[9px] font-bold tracking-[0.36em] uppercase text-[#800020]/60 mb-5">
              {t("contact_hero_tag")}
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1
              className="font-playfair font-bold text-[#2D000A] leading-tight mb-5"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.6rem)" }}
            >
              {t("contact_hero_title")}
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <div aria-hidden="true" className="w-10 h-0.5 bg-[#FF6B9D] rounded-full mx-auto mb-6" />
          </Reveal>

          <Reveal delay={160}>
            <p className="text-[#4A3728]/60 text-[15px] leading-[1.9]">
              {t("contact_hero_subtitle")}
            </p>
          </Reveal>

        </div>
      </section>

      {/* ── TWO-COLUMN ── */}
      <section className="py-16 md:py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr_1.45fr] gap-10 items-start">

          {/* ── LEFT: Info ── */}
          <div className="space-y-6">

            {/* Contact details card */}
            <Reveal>
              <div
                className="rounded-3xl border border-[#F5D0D8]/50 p-7 space-y-6"
                style={{ boxShadow: "0 8px 32px rgba(128,0,32,0.08), 0 2px 8px rgba(128,0,32,0.04)" }}
              >
                {contactItems.map(({ Icon, label, value }) => (
                  <div key={label} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-[#F5D0D8]/70 border border-[#F5D0D8] flex items-center justify-center shrink-0 mt-0.5">
                      <Icon size={17} className="text-[#800020]" strokeWidth={1.6} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold tracking-widest uppercase text-[#2D000A]/40 mb-0.5">
                        {label}
                      </p>
                      <p className="text-[#2D000A]/75 text-sm leading-snug">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Reveal>

            {/* Social links card */}
            <Reveal delay={80}>
              <div
                className="rounded-3xl border border-[#F5D0D8]/50 p-7"
                style={{ boxShadow: "0 8px 32px rgba(128,0,32,0.08), 0 2px 8px rgba(128,0,32,0.04)" }}
              >
                <p className="text-[10px] font-bold tracking-widest uppercase text-[#2D000A]/40 mb-4">
                  {t("contact_social_title")}
                </p>
                <div className="flex items-center gap-3">
                  {/* Instagram */}
                  <a
                    href="https://www.instagram.com/biteezqa?igsh=NWVuc2Eya2xqMm1y"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                    className="w-11 h-11 rounded-xl bg-[#FDF0F3] border border-[#F5D0D8]/60 flex items-center justify-center hover:bg-[#F5D0D8]/60 hover:border-[#F5D0D8] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-[#800020]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                      <circle cx="12" cy="12" r="4.5"/>
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                    </svg>
                  </a>
                  {/* WhatsApp */}
                  <a
                    href="https://wa.me/97450000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="WhatsApp"
                    className="w-11 h-11 rounded-xl bg-[#FDF0F3] border border-[#F5D0D8]/60 flex items-center justify-center hover:bg-[#F5D0D8]/60 hover:border-[#F5D0D8] transition-all duration-200 hover:-translate-y-0.5"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-[#800020]" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </Reveal>

            {/* Google Maps — Doha, Qatar */}
            <Reveal delay={140}>
              <div
                className="rounded-3xl overflow-hidden border border-[#F5D0D8]/50"
                style={{ boxShadow: "0 8px 32px rgba(128,0,32,0.08), 0 2px 8px rgba(128,0,32,0.04)" }}
              >
                <iframe
                  src="https://maps.google.com/maps?q=Doha,Qatar&t=&z=13&ie=UTF8&iwloc=&output=embed"
                  width="100%"
                  height="220"
                  style={{ border: 0, display: "block" }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Biteez — Doha, Qatar"
                />
                <div className="bg-white px-5 py-3.5 flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D] shrink-0" aria-hidden="true" />
                  <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2D000A]/50">
                    {t("contact_location_title")} · Doha, Qatar
                  </p>
                </div>
              </div>
            </Reveal>
          </div>

          {/* ── RIGHT: Form ── */}
          <Reveal delay={60} className="lg:sticky lg:top-28">
            <div
              className="rounded-3xl border border-[#F5D0D8]/50 p-8 md:p-10 bg-white"
              style={{ boxShadow: "0 20px 60px rgba(128,0,32,0.10), 0 4px 16px rgba(128,0,32,0.06)" }}
            >
              {submitted ? (
                <div className="flex flex-col items-center text-center py-12 gap-5">
                  <div className="w-16 h-16 rounded-full bg-[#F5D0D8]/60 border border-[#F5D0D8] flex items-center justify-center">
                    <CheckCircle2 size={30} className="text-[#800020]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="font-playfair text-2xl font-bold text-[#2D000A] mb-2">
                      {t("contact_success_title")}
                    </h3>
                    <p className="text-[#4A3728]/55 text-sm leading-relaxed max-w-xs">
                      {t("contact_success_body")}
                    </p>
                  </div>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="mt-2 text-[#800020] text-sm font-semibold hover:underline"
                  >
                    {t("contact_submit_btn")} →
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-7">
                    <p className="text-[9px] font-bold tracking-[0.36em] uppercase text-[#800020]/60 mb-3">
                      {t("contact_info_title")}
                    </p>
                    <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-3">
                      {t("contact_form_title")}
                    </h2>
                    <div className="w-8 h-0.5 bg-[#FF6B9D] rounded-full" />
                  </div>

                  <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">

                    {/* Name */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#2D000A]/55 tracking-wide">
                        {t("contact_name_label")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("contact_name_placeholder")}
                        value={form.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className={cn(inputBase, errors.name && inputError)}
                        autoComplete="name"
                      />
                      {errors.name && (
                        <p className="text-[11px] text-red-500 font-medium leading-none">{errors.name}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#2D000A]/55 tracking-wide">
                        {t("contact_contact_email_label")}
                      </label>
                      <input
                        type="email"
                        placeholder={t("contact_contact_email_placeholder")}
                        value={form.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className={cn(inputBase, errors.email && inputError)}
                        autoComplete="email"
                      />
                      {errors.email && (
                        <p className="text-[11px] text-red-500 font-medium leading-none">{errors.email}</p>
                      )}
                    </div>

                    {/* Subject */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#2D000A]/55 tracking-wide">
                        {t("contact_subject_label")}
                      </label>
                      <input
                        type="text"
                        placeholder={t("contact_subject_placeholder")}
                        value={form.subject}
                        onChange={(e) => handleChange("subject", e.target.value)}
                        className={cn(inputBase, errors.subject && inputError)}
                      />
                      {errors.subject && (
                        <p className="text-[11px] text-red-500 font-medium leading-none">{errors.subject}</p>
                      )}
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-[#2D000A]/55 tracking-wide">
                        {t("contact_message_label")}
                      </label>
                      <textarea
                        rows={5}
                        placeholder={t("contact_message_placeholder")}
                        value={form.message}
                        onChange={(e) => handleChange("message", e.target.value)}
                        className={cn(inputBase, "resize-none", errors.message && inputError)}
                      />
                      {errors.message && (
                        <p className="text-[11px] text-red-500 font-medium leading-none">{errors.message}</p>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className={cn(
                        "w-full flex items-center justify-center gap-2.5 rounded-xl py-4",
                        "bg-[#800020] hover:bg-[#2D000A] text-white font-semibold text-sm tracking-wide",
                        "transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
                        "disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0",
                        "shadow-[0_4px_16px_rgba(128,0,32,0.28)]"
                      )}
                    >
                      {submitting ? (
                        <>
                          <svg className="animate-spin w-4 h-4 text-white/70" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                          </svg>
                          <span>{t("contact_submitting")}</span>
                        </>
                      ) : (
                        <>
                          <Send size={15} strokeWidth={1.8} />
                          <span>{t("contact_submit_btn")}</span>
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </Reveal>

        </div>
      </section>

    </main>
  );
}
