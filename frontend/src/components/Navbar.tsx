"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Globe, ChevronRight } from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const navKeys = [
  { href: "/",        key: "nav_home"    },
  { href: "/menu",    key: "nav_menu"    },
  { href: "/about",   key: "nav_about"   },
  { href: "/contact", key: "nav_contact" },
];

export default function Navbar() {
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [mounted,     setMounted]     = useState(false);
  const [logoUrl,     setLogoUrl]     = useState("/logo.png");
  const { lang, toggle, t } = useLanguage();

  const count = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    fetch("/api/site-settings", { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (data?.logo_url) setLogoUrl(data.logo_url); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white border-b border-[rgba(128,0,32,0.07)] shadow-[0_2px_28px_rgba(0,0,0,0.07)]"
          : "bg-gradient-to-b from-black/40 via-black/10 to-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 lg:px-12">
        <div className="relative flex items-center justify-between h-16 md:h-20">

          {/* ── Left: desktop nav ── */}
          <nav className="hidden md:flex items-center gap-8">
            {navKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-i18n={link.key}
                className={cn(
                  "relative text-[11px] font-bold tracking-[0.22em] uppercase transition-colors duration-200 group pb-0.5",
                  scrolled
                    ? "text-[#2D000A]/60 hover:text-[#800020]"
                    : "text-white/70 hover:text-white"
                )}
              >
                {t(link.key)}
                <span className={cn(
                  "absolute bottom-0 left-0 h-px rounded-full transition-all duration-300 w-0 group-hover:w-full",
                  scrolled ? "bg-[#800020]/70" : "bg-white/55"
                )} />
              </Link>
            ))}
          </nav>

          {/* ── Centre: logo ── */}
          <Link
            href="/"
            className="absolute left-1/2 -translate-x-1/2 flex items-center focus:outline-none"
          >
            <Image
              src={logoUrl}
              alt="Biteez"
              width={120}
              height={48}
              className={cn(
                "object-contain h-9 md:h-10 w-auto transition-all duration-500",
                !scrolled && "brightness-0 invert"
              )}
              priority
            />
          </Link>

          {/* ── Right: lang + cart + hamburger ── */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Language toggle */}
            <button
              onClick={toggle}
              data-i18n="nav_lang_button"
              aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
              className={cn(
                "hidden md:flex items-center gap-1.5 text-[10px] font-bold tracking-[0.18em] uppercase border rounded-full px-3 py-1.5 transition-all duration-200",
                scrolled
                  ? "border-[rgba(128,0,32,0.18)] text-[#800020]/65 hover:border-[#800020] hover:text-[#800020] hover:bg-[#800020]/5"
                  : "border-white/22 text-white/65 hover:border-white/55 hover:text-white hover:bg-white/8"
              )}
            >
              <Globe size={11} />
              {t("nav_lang_button")}
            </button>

            {/* Cart */}
            <Link
              href="/cart"
              aria-label="Cart"
              className={cn(
                "relative p-2 rounded-full transition-all duration-200",
                scrolled
                  ? "text-[#2D000A]/65 hover:text-[#800020] hover:bg-[#800020]/6"
                  : "text-white/75 hover:text-white hover:bg-white/10"
              )}
            >
              <ShoppingBag size={20} />
              {mounted && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] bg-[#FF6B9D] text-white text-[9px] font-bold rounded-full flex items-center justify-center px-0.5 shadow-sm ring-1 ring-white/60">
                  {count}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
              className={cn(
                "md:hidden relative w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200",
                scrolled
                  ? "text-[#2D000A]/65 hover:text-[#800020] hover:bg-[#800020]/6"
                  : "text-white/75 hover:text-white hover:bg-white/10",
                mobileOpen && (scrolled ? "bg-[#800020]/8 text-[#800020]" : "bg-white/12 text-white")
              )}
            >
              <span className={cn(
                "absolute transition-all duration-300",
                mobileOpen ? "opacity-100 rotate-0 scale-100" : "opacity-0 rotate-90 scale-75"
              )}>
                <X size={19} />
              </span>
              <span className={cn(
                "absolute transition-all duration-300",
                mobileOpen ? "opacity-0 -rotate-90 scale-75" : "opacity-100 rotate-0 scale-100"
              )}>
                <Menu size={19} />
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile menu ── */}
      <div className={cn(
        "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
        mobileOpen ? "max-h-[400px] opacity-100" : "max-h-0 opacity-0"
      )}>
        <div className="bg-white/98 backdrop-blur-2xl border-t border-[rgba(128,0,32,0.06)] px-6 pt-1 pb-6 shadow-[0_12px_40px_rgba(0,0,0,0.10)]">

          {/* Nav links */}
          <div className="divide-y divide-[rgba(128,0,32,0.05)]">
            {navKeys.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                data-i18n={link.key}
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-between py-3.5 group"
              >
                <span className="text-[11px] font-bold tracking-[0.22em] uppercase text-[#2D000A]/65 group-hover:text-[#800020] transition-colors duration-150">
                  {t(link.key)}
                </span>
                <ChevronRight
                  size={14}
                  className="text-[#800020]/25 group-hover:text-[#800020]/60 group-hover:translate-x-0.5 transition-all duration-150"
                />
              </Link>
            ))}
          </div>

          {/* Footer row */}
          <div className="mt-4 pt-4 border-t border-[rgba(128,0,32,0.06)] flex items-center justify-between">
            <button
              onClick={() => { toggle(); setMobileOpen(false); }}
              data-i18n="nav_switch_label"
              className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] uppercase text-[#800020]/50 hover:text-[#800020] transition-colors"
            >
              <Globe size={13} />
              {t("nav_switch_label")}
            </button>

            <Link
              href="/cart"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 text-[10px] font-bold tracking-[0.18em] uppercase text-[#800020]/50 hover:text-[#800020] transition-colors"
            >
              <ShoppingBag size={13} />
              Cart
              {mounted && count > 0 && (
                <span className="bg-[#FF6B9D] text-white text-[9px] font-bold rounded-full px-1.5 py-px leading-none">
                  {count}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
