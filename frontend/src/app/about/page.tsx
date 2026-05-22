"use client";

import Link from "next/link";
import { Sparkles, Heart, ShieldCheck, ArrowRight } from "lucide-react";
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

export default function AboutPage() {
  const { t } = useLanguage();

  const values = [
    { Icon: Sparkles,    titleKey: "about_value1_title", descKey: "about_value1_desc" },
    { Icon: Heart,       titleKey: "about_value2_title", descKey: "about_value2_desc" },
    { Icon: ShieldCheck, titleKey: "about_value3_title", descKey: "about_value3_desc" },
  ];

  return (
    <main className="overflow-x-hidden bg-white">

      {/* ── INTRO ── */}
      <section className="pt-24 md:pt-32 pb-14 md:pb-20 px-6">
        <div className="max-w-2xl mx-auto text-center">

          <Reveal>
            <p className="text-[9px] font-bold tracking-[0.36em] uppercase text-[#800020]/60 mb-5">
              {t("about_hero_tag")}
            </p>
          </Reveal>

          <Reveal delay={70}>
            <h1
              className="font-playfair font-bold text-[#2D000A] leading-tight mb-6"
              style={{ fontSize: "clamp(2rem, 4.5vw, 3.8rem)" }}
            >
              {t("about_story_title")}
            </h1>
          </Reveal>

          <Reveal delay={120}>
            <div aria-hidden="true" className="w-10 h-0.5 bg-[#FF6B9D] rounded-full mx-auto mb-7" />
          </Reveal>

          <Reveal delay={170}>
            <p className="text-[#4A3728]/60 text-[15px] leading-[1.9] mb-4">
              {t("about_story_body1")}
            </p>
          </Reveal>

          <Reveal delay={210}>
            <p className="text-[#4A3728]/60 text-[15px] leading-[1.9] mb-10">
              {t("about_story_body2")}
            </p>
          </Reveal>

          {/* Stats row */}
          <Reveal delay={260}>
            <div className="flex flex-wrap items-center justify-center gap-8">
              {[
                { v: t("about_stats_years_num"),     l: t("about_stats_years_label")     },
                { v: t("about_stats_boxes_num"),     l: t("about_stats_boxes_label")     },
                { v: t("about_stats_customers_num"), l: t("about_stats_customers_label") },
              ].map(({ v, l }) => (
                <div key={l} className="flex flex-col items-center gap-1">
                  <span
                    className="font-playfair font-bold text-[#800020] leading-none"
                    style={{ fontSize: "clamp(1.8rem, 3vw, 2.6rem)" }}
                  >
                    {v}
                  </span>
                  <span className="text-[9px] font-bold uppercase tracking-[0.24em] text-[#2D000A]/40">
                    {l}
                  </span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── IMAGES ── */}
      <section className="px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-10">

          {/* Image 1 */}
          <Reveal>
            <div
              className="rounded-3xl overflow-hidden border border-[#F5D0D8]/50"
              style={{
                boxShadow: "0 20px 60px rgba(128,0,32,0.14), 0 4px 16px rgba(128,0,32,0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/aboutus.jpeg"
                alt="Handcrafted Biteez brownies from our Doha kitchen"
                className="w-full h-auto block"
                width={800}
                height={600}
              />
              <div className="bg-white px-6 py-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D] shrink-0" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2D000A]/50">
                  Fresh from our kitchen
                </p>
              </div>
            </div>
          </Reveal>

          {/* Image 2 */}
          <Reveal delay={100}>
            <div
              className="rounded-3xl overflow-hidden border border-[#F5D0D8]/50"
              style={{
                boxShadow: "0 20px 60px rgba(128,0,32,0.14), 0 4px 16px rgba(128,0,32,0.08)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/aboutus1.jpeg"
                alt="The heart and culture behind Biteez"
                className="w-full h-auto block"
                width={800}
                height={800}
              />
              <div className="bg-white px-6 py-4 flex items-center gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D] shrink-0" aria-hidden="true" />
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[#2D000A]/50">
                  Made with love in Qatar
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── VALUES ── */}
      <section className="pb-16 md:pb-24 px-6">
        <div className="max-w-3xl mx-auto">

          <Reveal>
            <p className="text-[9px] font-bold tracking-[0.36em] uppercase text-[#800020]/60 mb-6 text-center">
              {t("about_values_tag")}
            </p>
          </Reveal>

          <Reveal delay={60}>
            <h2
              className="font-playfair font-bold text-[#2D000A] leading-tight text-center mb-12"
              style={{ fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)" }}
            >
              {t("about_values_title")}
            </h2>
          </Reveal>

          <div className="space-y-6">
            {values.map(({ Icon, titleKey, descKey }, i) => (
              <Reveal key={titleKey} delay={i * 80}>
                <div
                  className="flex items-start gap-5 rounded-2xl p-6 border border-[#F5D0D8]/50 bg-[#FDF0F3]/40"
                  style={{ boxShadow: "0 4px 20px rgba(128,0,32,0.06)" }}
                >
                  <div
                    aria-hidden="true"
                    className="shrink-0 w-11 h-11 rounded-xl bg-[#F5D0D8]/80 flex items-center justify-center mt-0.5"
                  >
                    <Icon size={18} className="text-[#800020]" strokeWidth={1.7} />
                  </div>
                  <div>
                    <p className="font-playfair font-bold text-[#2D000A] text-[15px] mb-1 leading-snug">
                      {t(titleKey)}
                    </p>
                    <p className="text-[#4A3728]/55 text-[13px] leading-[1.8]">
                      {t(descKey)}
                    </p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-[#800020] py-14 md:py-20 px-6">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
          <Reveal>
            <p
              className="font-playfair font-bold text-white text-center sm:text-left leading-snug"
              style={{ fontSize: "clamp(1.4rem, 2.5vw, 2rem)" }}
            >
              Ready to taste the difference?
            </p>
          </Reveal>
          <Reveal delay={80}>
            <Link
              href="/menu"
              className={cn(
                "inline-flex items-center gap-2.5 shrink-0",
                "bg-white text-[#800020] hover:bg-[#FDF0F3]",
                "font-bold text-[13px] tracking-wide px-9 rounded-full",
                "transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#800020]"
              )}
              style={{ minHeight: 48, paddingTop: 14, paddingBottom: 14 }}
            >
              {t("about_hero_cta")}
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          </Reveal>
        </div>
      </section>

    </main>
  );
}
