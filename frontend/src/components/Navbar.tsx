"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X, Globe } from "lucide-react";

import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const navKeys = [
  { href: "/", key: "nav_home" },
  { href: "/menu", key: "nav_menu" },
  { href: "/about", key: "nav_about" },
  { href: "/contact", key: "nav_contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { lang, toggle, t } = useLanguage();

  const count = useCartStore((s) =>
    s.items.reduce((sum, i) => sum + i.quantity, 0)
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled
          ? "bg-[#FFFDF6]/97 backdrop-blur-md shadow-warm-sm"
          : "bg-transparent"
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative flex items-center justify-end h-16 md:h-20">
          {/* Logo – centered */}
          <Link href="/" className="absolute left-1/2 -translate-x-1/2 flex items-center">
            <Image
              src="/logo.png"
              alt="Biteez"
              width={110}
              height={44}
              className="object-contain transition-all duration-300 h-10 w-auto"
              priority
            />
          </Link>

          {/* Desktop nav + right actions */}
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex items-center gap-8">
              {navKeys.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  data-i18n={link.key}
                  className={cn(
                    "relative text-xs font-semibold tracking-widest uppercase transition-colors",
                    "after:absolute after:-bottom-1 after:left-0 after:w-0 after:h-px after:bg-gold after:transition-all after:duration-300 hover:after:w-full",
                    scrolled
                      ? "text-stone-700 hover:text-burgundy"
                      : "text-[#1E2235]/80 hover:text-[#1E2235]"
                  )}
                >
                  {t(link.key)}
                </Link>
              ))}
            </nav>

            {/* Right actions */}
            <div className="flex items-center gap-3">
              {/* Language toggle */}
              <button
                onClick={toggle}
                data-i18n="nav_lang_button"
                aria-label={lang === "en" ? "Switch to Arabic" : "Switch to English"}
                className={cn(
                  "hidden md:flex items-center gap-1.5 text-[11px] font-bold tracking-widest border rounded-full px-3 py-1.5 transition-all duration-200",
                  scrolled
                    ? "border-stone-300 text-stone-600 hover:border-burgundy hover:text-burgundy"
                    : "border-[#1E2235]/30 text-[#1E2235]/70 hover:border-[#1E2235] hover:text-[#1E2235]"
                )}
              >
                <Globe size={12} />
                {t("nav_lang_button")}
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className={cn(
                  "relative p-1.5 transition-colors rounded-full",
                  scrolled
                    ? "text-stone-700 hover:text-burgundy"
                    : "text-[#1E2235]/80 hover:text-burgundy"
                )}
                aria-label="Cart"
              >
                <ShoppingBag size={22} />
                {mounted && count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-gold text-white text-[10px] font-bold rounded-full flex items-center justify-center px-0.5">
                    {count}
                  </span>
                )}
              </Link>

              {/* Mobile menu toggle */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className={cn(
                  "md:hidden p-1.5 transition-colors rounded-full",
                  scrolled ? "text-stone-700" : "text-[#1E2235]/80"
                )}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden overflow-hidden transition-all duration-300 ease-in-out",
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <div className="bg-white border-t border-stone-100 px-6 py-6 space-y-1">
          {navKeys.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              data-i18n={link.key}
              onClick={() => setMobileOpen(false)}
              className="block py-3 text-stone-700 font-semibold tracking-widest uppercase text-xs hover:text-burgundy transition-colors border-b border-stone-50 last:border-0"
            >
              {t(link.key)}
            </Link>
          ))}
          <div className="pt-4">
            <button
              onClick={() => { toggle(); setMobileOpen(false); }}
              data-i18n="nav_switch_label"
              className="flex items-center gap-2 text-xs font-bold tracking-widest text-stone-500 hover:text-burgundy transition-colors uppercase"
            >
              <Globe size={14} />
              {t("nav_switch_label")}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
