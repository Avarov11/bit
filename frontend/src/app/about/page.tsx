"use client";

import Image from "next/image";
import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, ArrowRight } from "lucide-react";
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
        transform: inView ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease-out ${delay}ms, transform 0.65s ease-out ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionTag({ children, light = false }: { children: React.ReactNode; light?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] uppercase px-3 py-1.5 rounded-full mb-5",
        light
          ? "bg-white/12 text-white/70 border border-white/15"
          : "bg-[#4C5372]/10 text-[#4C5372] border border-[#4C5372]/15"
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", light ? "bg-gold" : "bg-[#FB7185]")} />
      {children}
    </span>
  );
}

// ─── Value card ───────────────────────────────────────────────────────────────

function ValueCard({
  Icon,
  title,
  desc,
  delay,
}: {
  Icon: React.ElementType;
  title: string;
  desc: string;
  delay: number;
}) {
  return (
    <Reveal delay={delay} className="h-full">
      <div
        className={cn(
          "h-full rounded-3xl border p-8 flex flex-col gap-5",
          "bg-white/[0.06] border-white/10 backdrop-blur-sm",
          "hover:bg-white/[0.10] hover:border-white/18 hover:-translate-y-1",
          "transition-all duration-300 cursor-default"
        )}
      >
        {/* Icon container */}
        <div className="w-14 h-14 rounded-2xl bg-[#FB7185]/15 border border-[#FB7185]/25 flex items-center justify-center shrink-0">
          <Icon size={24} className="text-[#FB7185]" strokeWidth={1.5} />
        </div>
        <div>
          <h3 className="font-playfair text-xl font-bold text-white mb-3 leading-snug">
            {title}
          </h3>
          <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
        </div>
      </div>
    </Reveal>
  );
}

// ─── Stat box ─────────────────────────────────────────────────────────────────

function StatBox({
  num,
  label,
  delay,
  bordered,
}: {
  num: string;
  label: string;
  delay: number;
  bordered?: boolean;
}) {
  return (
    <Reveal delay={delay} className="flex-1">
      <div
        className={cn(
          "flex flex-col items-center text-center py-10 px-6",
          bordered && "border-s border-[rgba(76,83,114,0.12)]"
        )}
      >
        <span className="font-playfair text-4xl md:text-5xl font-bold text-[#4C5372] mb-2 leading-none">
          {num}
        </span>
        <span className="text-xs font-semibold text-[#1E2235]/55 uppercase tracking-widest">
          {label}
        </span>
      </div>
    </Reveal>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AboutPage() {
  const { t } = useLanguage();

  const stats = [
    { num: t("about_stats_years_num"),     label: t("about_stats_years_label"),     delay: 0   },
    { num: t("about_stats_boxes_num"),     label: t("about_stats_boxes_label"),     delay: 80  },
    { num: t("about_stats_customers_num"), label: t("about_stats_customers_label"), delay: 160 },
    { num: t("about_stats_custom_num"),    label: t("about_stats_custom_label"),    delay: 240 },
  ];

  const values = [
    { Icon: Sparkles, titleKey: "about_value1_title", descKey: "about_value1_desc", delay: 0   },
    { Icon: Heart,    titleKey: "about_value2_title", descKey: "about_value2_desc", delay: 100 },
    { Icon: ShieldCheck, titleKey: "about_value3_title", descKey: "about_value3_desc", delay: 200 },
  ];

  return (
    <main>

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden flex flex-col items-center pt-32 md:pt-40 pb-20 md:pb-28 px-6 text-center"
        style={{ backgroundColor: "#E2D4E0" }}
      >
        {/* Grain overlay — inherits from body */}
        <div className="absolute inset-0 pointer-events-none opacity-40"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E\")",
            backgroundRepeat: "repeat",
          }}
        />

        {/* Soft radial vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse 80% 60% at 50% 100%, rgba(76,83,114,0.18) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-3xl mx-auto">
          <div className="animate-fade-up">
            <SectionTag>{t("about_hero_tag")}</SectionTag>
          </div>

          <h1
            className="font-playfair text-[2.6rem] md:text-[4rem] lg:text-[5rem] font-bold text-[#1E2235] leading-[1.06] mb-6 animate-fade-up-d1"
            data-i18n="about_hero_title"
          >
            {t("about_hero_title_line1")}
            <br />
            <em className="not-italic" style={{ color: "#4C5372" }}>
              {t("about_hero_title_line2")}
            </em>
          </h1>

          <p
            data-i18n="about_hero_subtitle"
            className="text-[#1E2235]/65 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-10 animate-fade-up-d2"
          >
            {t("about_hero_subtitle")}
          </p>

          <div className="animate-fade-up-d3 flex justify-center">
            <Link
              href="/menu"
              className={cn(
                "inline-flex items-center gap-2.5 bg-[#FB7185] hover:bg-[#E11D48]",
                "text-white font-semibold text-sm px-8 py-4 rounded-full",
                "transition-all duration-200 hover:-translate-y-0.5 shadow-warm-md hover:shadow-warm-lg",
                "active:scale-[0.97]"
              )}
            >
              <span data-i18n="about_hero_cta">{t("about_hero_cta")}</span>
              <ArrowRight size={15} />
            </Link>
          </div>
        </div>

        {/* Hero image */}
        <div className="relative mt-14 w-full max-w-sm md:max-w-md animate-fade-up-d3">
          <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-warm-xl">
            <Image
              src="https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=900&q=85"
              alt={t("about_hero_tag")}
              fill
              className="object-cover"
              priority
            />
            {/* Subtle gradient overlay at bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#4C5372]/20 via-transparent to-transparent" />
          </div>
          {/* Floating label */}
          <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl px-5 py-3 shadow-warm-lg flex items-center gap-3 whitespace-nowrap">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="text-xs font-bold text-[#1E2235] tracking-wide">
              Handcrafted in Beirut
            </span>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STORY
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#FFFDF6] py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
            {/* Image */}
            <Reveal className="order-2 md:order-1">
              <div className="relative">
                <div className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-warm-xl">
                  <Image
                    src="https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=700&q=85"
                    alt="Our story"
                    fill
                    className="object-cover"
                  />
                </div>
                {/* Decorative accent card */}
                <div className="absolute -end-4 -bottom-6 bg-[#1E2235] rounded-2xl px-5 py-4 shadow-warm-xl max-w-[180px]">
                  <p className="font-playfair text-gold text-lg font-bold leading-none mb-0.5">2021</p>
                  <p className="text-white/55 text-[11px] font-semibold tracking-wide">Est. in Beirut</p>
                </div>
              </div>
            </Reveal>

            {/* Text */}
            <div className="order-1 md:order-2 space-y-6">
              <Reveal>
                <SectionTag>{t("about_story_tag")}</SectionTag>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  data-i18n="about_story_title"
                  className="font-playfair text-3xl md:text-4xl font-bold text-[#1E2235] leading-tight"
                >
                  {t("about_story_title")}
                </h2>
              </Reveal>
              <Reveal delay={160}>
                <div className="w-12 h-0.5 bg-[#FB7185] rounded-full" />
              </Reveal>
              <Reveal delay={200}>
                <p data-i18n="about_story_body1" className="text-[#4A3728]/80 leading-relaxed text-sm md:text-base">
                  {t("about_story_body1")}
                </p>
              </Reveal>
              <Reveal delay={260}>
                <p data-i18n="about_story_body2" className="text-[#4A3728]/80 leading-relaxed text-sm md:text-base">
                  {t("about_story_body2")}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          VALUES  —  dark section with glassmorphism cards
      ═══════════════════════════════════════════════════════════ */}
      <section className="bg-[#1E2235] py-20 md:py-28 relative overflow-hidden">
        {/* Subtle dot grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #FB7185 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        {/* Radial glow */}
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center top, rgba(148,154,177,0.10) 0%, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-6 md:px-12">
          <div className="text-center mb-14">
            <Reveal>
              <SectionTag light>{t("about_values_tag")}</SectionTag>
            </Reveal>
            <Reveal delay={80}>
              <h2
                data-i18n="about_values_title"
                className="font-playfair text-3xl md:text-4xl font-bold text-white leading-tight max-w-2xl mx-auto"
              >
                {t("about_values_title")}
              </h2>
            </Reveal>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {values.map(({ Icon, titleKey, descKey, delay }) => (
              <ValueCard
                key={titleKey}
                Icon={Icon}
                title={t(titleKey)}
                desc={t(descKey)}
                delay={delay}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          STATS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-24" style={{ backgroundColor: "#E2D4E0" }}>
        <div className="max-w-5xl mx-auto px-6 md:px-12">
          <div className="text-center mb-10">
            <Reveal>
              <SectionTag>{t("about_stats_tag")}</SectionTag>
            </Reveal>
          </div>

          <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-3xl shadow-warm-lg overflow-hidden">
            <div className="grid grid-cols-2 md:grid-cols-4 divide-y md:divide-y-0 divide-x-0 md:divide-x divide-[rgba(76,83,114,0.08)]">
              {stats.map(({ num, label, delay }, i) => (
                <StatBox key={label} num={num} label={label} delay={delay} bordered={i > 0} />
              ))}
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
