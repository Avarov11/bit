"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Mail, Phone } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const footerNavKeys = ["nav_home", "nav_menu", "nav_about", "nav_contact"];
const footerNavHrefs = ["/", "/menu", "/about", "/contact"];

export default function HomePage() {
  const { t } = useLanguage();

  return (
    <main>

      {/* ─── Hero ───────────────────────────────────────────── */}
      <section
        className="flex flex-col items-center pt-24 md:pt-28 pb-14 px-6"
        style={{ backgroundColor: "#C896A0" }}
      >
        <h1 className="font-playfair text-[2.75rem] md:text-[4.5rem] font-bold text-[#1A0A0A] text-center leading-[1.08] mb-8">
          <span data-i18n="hero_title_line1">{t("hero_title_line1")}</span>
          <br />
          <span data-i18n="hero_title_line2">{t("hero_title_line2")}</span>
        </h1>

        <div className="relative w-full max-w-[300px] md:max-w-[420px] aspect-square mb-8">
          <Image
            src="https://images.unsplash.com/photo-1607920592519-bab2a80efd81?w=800&q=80"
            alt={t("hero_img_alt")}
            fill
            className="object-cover rounded-[28px] shadow-warm-xl"
            priority
          />
        </div>

        <div className="grid grid-cols-2 gap-3 w-full max-w-[360px] mb-5">
          <Link
            href="/menu"
            className="bg-white rounded-2xl px-4 py-4 shadow-warm-sm hover:shadow-warm-md transition-shadow"
          >
            <p data-i18n="hero_card1_title" className="font-semibold text-[#1A0A0A] text-sm leading-tight">
              {t("hero_card1_title")}
            </p>
            <p data-i18n="hero_card1_subtitle" className="text-[#9E7B7B] text-xs mt-1.5">
              {t("hero_card1_subtitle")}
            </p>
          </Link>
          <Link
            href="/menu"
            className="bg-white rounded-2xl px-4 py-4 shadow-warm-sm hover:shadow-warm-md transition-shadow"
          >
            <p data-i18n="hero_card2_title" className="font-semibold text-[#1A0A0A] text-sm leading-tight">
              {t("hero_card2_title")}
            </p>
            <p data-i18n="hero_card2_subtitle" className="text-[#9E7B7B] text-xs mt-1.5">
              {t("hero_card2_subtitle")}
            </p>
          </Link>
        </div>

        <Link
          href="/menu"
          className="w-full max-w-[360px] bg-[#3D0A14] hover:bg-[#2D0810] text-white font-semibold text-sm text-center py-4 rounded-full transition-colors duration-200 active:scale-[0.97]"
        >
          <span data-i18n="hero_cta">{t("hero_cta")}</span>
        </Link>
      </section>


      {/* ─── Footer ─────────────────────────────────────────── */}
      <footer className="bg-[#1A0A0A] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-5">
              <div className="flex items-center gap-1 mb-5">
                <span className="font-playfair text-3xl font-bold text-white">Biteez</span>
                <span className="w-2 h-2 rounded-full bg-gold mt-1.5" />
              </div>
              <p data-i18n="footer_tagline" className="text-white/45 leading-relaxed text-sm max-w-xs">
                {t("footer_tagline")}
              </p>
              <div className="flex gap-4 mt-6">
                {(
                  [
                    { key: "footer_instagram", href: "https://www.instagram.com/biteezqa?igsh=NWVuc2Eya2xqMm1y" },
                    { key: "footer_facebook",  href: "#" },
                    { key: "footer_tiktok",    href: "#" },
                  ] as const
                ).map(({ key, href }) => (
                  <a
                    key={key}
                    href={href}
                    data-i18n={key}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                    className="text-[11px] font-semibold tracking-widest text-white/30 uppercase hover:text-gold transition-colors"
                  >
                    {t(key)}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 data-i18n="footer_navigate" className="text-xs font-bold tracking-[0.25em] uppercase text-white/35 mb-5">
                {t("footer_navigate")}
              </h4>
              <ul className="space-y-3">
                {footerNavKeys.map((key, i) => (
                  <li key={key}>
                    <Link
                      href={footerNavHrefs[i]}
                      data-i18n={key}
                      className="text-white/45 hover:text-gold transition-colors text-sm"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 data-i18n="footer_visit" className="text-xs font-bold tracking-[0.25em] uppercase text-white/35 mb-5">
                {t("footer_visit")}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-white/45 text-sm">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-gold/70" />
                  <span data-i18n="footer_address">{t("footer_address")}</span>
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Mail size={14} className="shrink-0 text-gold/70" />
                  hello@biteez.com
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Phone size={14} className="shrink-0 text-gold/70" />
                  +961 1 234 567
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p data-i18n="footer_copyright" className="text-white/25 text-xs">{t("footer_copyright")}</p>
            <p data-i18n="footer_crafted" className="text-white/25 text-xs">{t("footer_crafted")}</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
