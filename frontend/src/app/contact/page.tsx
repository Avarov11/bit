"use client";

import { useState, useRef } from "react";
import { MapPin, Phone, Mail, Clock, Send, CheckCircle2 } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useInView } from "@/hooks/useInView";
import { cn } from "@/lib/utils";

// ─── Animated wrapper ──────────────────────────────────────────────────────────

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
        transform: inView ? "translateY(0)" : "translateY(24px)",
        transition: `opacity 0.6s ease-out ${delay}ms, transform 0.6s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section tag pill ─────────────────────────────────────────────────────────

function SectionTag({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] uppercase px-3 py-1.5 rounded-full mb-5",
        light
          ? "bg-white/12 text-white/70 border border-white/15"
          : "bg-[#800020]/10 text-[#800020] border border-[#800020]/15"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", light ? "bg-[#FF6B9D]" : "bg-[#FF6B9D]")} />
      {children}
    </span>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({
  Icon,
  label,
  value,
}: {
  Icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded-xl bg-[#FF6B9D]/12 border border-[#FF6B9D]/20 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={17} className="text-[#FF6B9D]" strokeWidth={1.6} />
      </div>
      <div>
        <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-0.5">{label}</p>
        <p className="text-white/85 text-sm leading-snug">{value}</p>
      </div>
    </div>
  );
}

// ─── Decorative map visual ─────────────────────────────────────────────────────

function LocationCard({ title }: { title: string }) {
  return (
    <div className="rounded-2xl overflow-hidden border border-white/10 bg-[#120608] relative h-44">
      {/* Dot grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage: "radial-gradient(circle, #FF6B9D 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />
      {/* Street lines */}
      <div className="absolute inset-0 opacity-[0.06]">
        <div className="absolute top-1/3 left-0 right-0 h-px bg-[#FF6B9D]" />
        <div className="absolute top-2/3 left-0 right-0 h-px bg-[#FF6B9D]" />
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-[#FF6B9D]" />
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-[#FF6B9D]" />
      </div>
      {/* Radial glow at centre */}
      <div
        className="absolute inset-0"
        style={{ background: "radial-gradient(ellipse 55% 55% at 50% 50%, rgba(148,154,177,0.12) 0%, transparent 70%)" }}
      />
      {/* Pin */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
        <div className="w-10 h-10 rounded-full bg-[#800020] border-2 border-[#FF6B9D]/60 flex items-center justify-center shadow-lg">
          <MapPin size={18} className="text-[#FF6B9D]" strokeWidth={1.8} />
        </div>
        <span className="text-[11px] font-bold text-white/70 tracking-wide">{title}</span>
      </div>
    </div>
  );
}

// ─── Form field ───────────────────────────────────────────────────────────────

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-semibold text-white/60 tracking-wide">{label}</label>
      {children}
      {error && (
        <p className="text-[11px] text-red-400 font-medium leading-none">{error}</p>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type FormState = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

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
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
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
    "field-focus w-full bg-white/[0.06] border border-white/12 rounded-xl px-4 py-3",
    "text-white text-sm placeholder:text-white/25 outline-none",
    "transition-colors duration-200"
  );

  const inputError = "border-red-400/60 bg-red-500/[0.04]";

  return (
    <main>

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex flex-col items-center pt-32 md:pt-40 pb-16 md:pb-20 px-6 text-center"
        style={{ backgroundColor: "#F5D0D8" }}
      >
        {/* Grain */}
        <div
          className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />
        {/* Vignette */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(128,0,32,0.18) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-2xl mx-auto">
          <div className="animate-fade-up">
            <SectionTag>{t("contact_hero_tag")}</SectionTag>
          </div>
          <h1
            className="font-playfair text-[2.6rem] md:text-[4rem] font-bold text-[#2D000A] leading-[1.06] mb-5 animate-fade-up-d1"
            data-i18n="contact_hero_title"
          >
            {t("contact_hero_title")}
          </h1>
          <p
            className="text-[#2D000A]/65 text-base md:text-lg leading-relaxed max-w-lg mx-auto animate-fade-up-d2"
            data-i18n="contact_hero_subtitle"
          >
            {t("contact_hero_subtitle")}
          </p>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          TWO-COLUMN: INFO  +  FORM
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#2D000A] py-20 md:py-28 relative overflow-hidden">
        {/* Dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #FF6B9D 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Top glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[350px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, rgba(148,154,177,0.07) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

            {/* ── LEFT: Info column ── */}
            <div className="space-y-8">
              <Reveal>
                <SectionTag light>{t("contact_info_title")}</SectionTag>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight">
                  {t("contact_hero_title")}
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <div className="w-10 h-0.5 bg-[#FF6B9D] rounded-full" />
              </Reveal>

              {/* Contact details */}
              <Reveal delay={180}>
                <div className="space-y-5">
                  <InfoRow Icon={MapPin} label={t("contact_address_label")} value={t("contact_address_val")} />
                  <InfoRow Icon={Phone}  label={t("contact_phone_label")}   value={t("contact_phone_val")}   />
                  <InfoRow Icon={Mail}   label={t("contact_email_label")}   value={t("contact_email_val")}   />
                  <InfoRow Icon={Clock}  label={t("contact_hours_title")}   value={t("contact_hours_val")}   />
                </div>
              </Reveal>

              {/* Social links */}
              <Reveal delay={240}>
                <div>
                  <p className="text-[10px] font-bold tracking-widest uppercase text-white/40 mb-3">
                    {t("contact_social_title")}
                  </p>
                  <div className="flex items-center gap-3">
                    {/* Instagram */}
                    <a
                      href="https://www.instagram.com/biteezqa?igsh=NWVuc2Eya2xqMm1y"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Instagram"
                      className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-white/70" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                        <circle cx="12" cy="12" r="4.5"/>
                        <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>
                      </svg>
                    </a>
                    {/* Facebook */}
                    <a
                      href="#"
                      aria-label="Facebook"
                      className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-white/70" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                      </svg>
                    </a>
                    {/* TikTok SVG */}
                    <a
                      href="#"
                      aria-label="TikTok"
                      className="w-10 h-10 rounded-xl bg-white/[0.07] border border-white/10 flex items-center justify-center hover:bg-white/[0.12] hover:border-white/20 transition-all duration-200 hover:-translate-y-0.5"
                    >
                      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" className="text-white/70" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
                      </svg>
                    </a>
                  </div>
                </div>
              </Reveal>

              {/* Decorative map */}
              <Reveal delay={300}>
                <LocationCard title={t("contact_location_title")} />
              </Reveal>
            </div>

            {/* ── RIGHT: Form column ── */}
            <Reveal delay={60} className="lg:sticky lg:top-28">
              <div className="bg-white/[0.04] backdrop-blur-sm border border-white/10 rounded-3xl p-8 md:p-10">
                {submitted ? (
                  /* Success state */
                  <div className="flex flex-col items-center text-center py-10 gap-5">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-400/25 flex items-center justify-center">
                      <CheckCircle2 size={30} className="text-emerald-400" strokeWidth={1.5} />
                    </div>
                    <div>
                      <h3 className="font-playfair text-2xl font-bold text-white mb-2">
                        {t("contact_success_title")}
                      </h3>
                      <p className="text-white/55 text-sm leading-relaxed max-w-xs">
                        {t("contact_success_body")}
                      </p>
                    </div>
                    <button
                      onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                      className="mt-2 text-[#FF6B9D] text-sm font-semibold hover:underline"
                    >
                      {t("contact_submit_btn")} →
                    </button>
                  </div>
                ) : (
                  /* Form */
                  <>
                    <div className="mb-7">
                      <h2 className="font-playfair text-2xl font-bold text-white mb-1">
                        {t("contact_form_title")}
                      </h2>
                      <div className="w-8 h-0.5 bg-[#FF6B9D] rounded-full mt-3" />
                    </div>

                    <form ref={formRef} onSubmit={handleSubmit} noValidate className="space-y-5">
                      {/* Name */}
                      <Field label={t("contact_name_label")} error={errors.name}>
                        <input
                          type="text"
                          data-i18n-placeholder="contact_name_placeholder"
                          placeholder={t("contact_name_placeholder")}
                          value={form.name}
                          onChange={(e) => handleChange("name", e.target.value)}
                          className={cn(inputBase, errors.name && inputError)}
                          autoComplete="name"
                        />
                      </Field>

                      {/* Email */}
                      <Field label={t("contact_contact_email_label")} error={errors.email}>
                        <input
                          type="email"
                          data-i18n-placeholder="contact_contact_email_placeholder"
                          placeholder={t("contact_contact_email_placeholder")}
                          value={form.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          className={cn(inputBase, errors.email && inputError)}
                          autoComplete="email"
                        />
                      </Field>

                      {/* Subject */}
                      <Field label={t("contact_subject_label")} error={errors.subject}>
                        <input
                          type="text"
                          data-i18n-placeholder="contact_subject_placeholder"
                          placeholder={t("contact_subject_placeholder")}
                          value={form.subject}
                          onChange={(e) => handleChange("subject", e.target.value)}
                          className={cn(inputBase, errors.subject && inputError)}
                        />
                      </Field>

                      {/* Message */}
                      <Field label={t("contact_message_label")} error={errors.message}>
                        <textarea
                          rows={5}
                          data-i18n-placeholder="contact_message_placeholder"
                          placeholder={t("contact_message_placeholder")}
                          value={form.message}
                          onChange={(e) => handleChange("message", e.target.value)}
                          className={cn(inputBase, "resize-none", errors.message && inputError)}
                        />
                      </Field>

                      {/* Submit */}
                      <button
                        type="submit"
                        disabled={submitting}
                        className={cn(
                          "w-full flex items-center justify-center gap-2.5 rounded-xl py-4",
                          "bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-semibold text-sm",
                          "transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
                          "disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
                        )}
                      >
                        {submitting ? (
                          <>
                            {/* Spinner */}
                            <svg
                              className="animate-spin w-4 h-4 text-white/70"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                            <span data-i18n="contact_submitting">{t("contact_submitting")}</span>
                          </>
                        ) : (
                          <>
                            <Send size={15} strokeWidth={1.8} />
                            <span data-i18n="contact_submit_btn">{t("contact_submit_btn")}</span>
                          </>
                        )}
                      </button>
                    </form>
                  </>
                )}
              </div>
            </Reveal>

          </div>
        </div>
      </section>

    </main>
  );
}
