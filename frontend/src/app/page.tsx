"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { MapPin, Mail, Phone, ArrowRight, ShoppingBag, Check } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/store/cartStore";
import type { DbProduct } from "@/lib/types";
import { cn } from "@/lib/utils";

const footerNavKeys = ["nav_home", "nav_menu", "nav_about", "nav_contact"];
const footerNavHrefs = ["/", "/menu", "/about", "/contact"];

const DOTS = [
  { x: "6%",  y: "18%", r: 8,  color: "#FB7185", opacity: 0.60 },
  { x: "11%", y: "70%", r: 5,  color: "#949AB1", opacity: 0.42 },
  { x: "47%", y: "7%",  r: 4,  color: "#FB7185", opacity: 0.38 },
  { x: "93%", y: "24%", r: 6,  color: "#949AB1", opacity: 0.50 },
  { x: "87%", y: "76%", r: 9,  color: "#FB7185", opacity: 0.30 },
  { x: "21%", y: "86%", r: 5,  color: "#949AB1", opacity: 0.38 },
  { x: "74%", y: "91%", r: 4,  color: "#FB7185", opacity: 0.45 },
];

function ProductCard({
  product,
  added,
  onAdd,
}: {
  product: DbProduct;
  added: boolean;
  onAdd: () => void;
}) {
  const isCustomizable = product.category === "Customized";
  const href = isCustomizable ? `/customize/${product.id}` : `/product/${product.id}`;

  return (
    <div className="shrink-0 w-56 group">
      <div
        className="rounded-3xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
        style={{
          backgroundColor: "#E2D4E0",
          boxShadow: "0 4px 20px rgba(76,83,114,0.10)",
        }}
      >
        <Link href={href}>
          <div className="relative w-full aspect-square overflow-hidden">
            <Image
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
              }
              alt={product.name}
              fill
              sizes="224px"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        </Link>
        <div className="p-4">
          <Link href={href}>
            <h3 className="font-playfair font-bold text-[#1E2235] text-sm leading-tight mb-1 line-clamp-1">
              {product.name}
            </h3>
          </Link>
          <p className="font-bold text-[#E11D48] text-sm mb-3">QAR {product.price}</p>
          {isCustomizable ? (
            <Link
              href={href}
              className="w-full block text-center bg-[#FB7185] hover:bg-[#E11D48] text-white text-xs font-bold py-2.5 rounded-full transition-all duration-200"
            >
              Customise
            </Link>
          ) : (
            <button
              onClick={onAdd}
              className={cn(
                "w-full text-xs font-bold py-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-1.5",
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-[#FB7185] hover:bg-[#E11D48] text-white"
              )}
            >
              {added ? (
                <>
                  <Check size={12} /> Added
                </>
              ) : (
                <>
                  <ShoppingBag size={12} /> Add to Cart
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { t } = useLanguage();
  const addItem = useCartStore((s) => s.addItem);
  const [products, setProducts] = useState<DbProduct[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data.slice(0, 8));
      })
      .catch(() => {});
  }, []);

  const handleAdd = (p: DbProduct) => {
    addItem({
      productId: p.id,
      productName: p.name,
      productImage: p.image_url || "",
      quantity: 1,
      unitPrice: p.price,
      customization: {},
    });
    setAddedIds((prev) => new Set([...prev, p.id]));
    setTimeout(() => {
      setAddedIds((prev) => {
        const n = new Set(prev);
        n.delete(p.id);
        return n;
      });
    }, 1500);
  };

  return (
    <main className="overflow-x-hidden">

      {/* ═══════════════════════════════════════════════════════════
          HERO
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative min-h-screen flex items-center overflow-hidden"
        style={{
          background:
            "radial-gradient(ellipse 130% 90% at 72% 55%, #E2D4E0 0%, #FFFDF6 52%)",
        }}
      >
        {/* Floating dots */}
        {DOTS.map((d, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              left: d.x,
              top: d.y,
              width: d.r,
              height: d.r,
              backgroundColor: d.color,
              opacity: d.opacity,
            }}
          />
        ))}

        {/* Ring accent — top left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: "13%",
            left: "4%",
            width: 70,
            height: 70,
            border: "2.5px solid #FB7185",
            borderRadius: "50%",
            opacity: 0.22,
          }}
        />

        {/* Plus accent */}
        <div
          className="absolute pointer-events-none"
          style={{ top: "36%", left: "7.5%" }}
        >
          <div
            style={{
              position: "absolute",
              width: 2,
              height: 18,
              backgroundColor: "#949AB1",
              left: 8,
              top: 0,
              opacity: 0.32,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 18,
              height: 2,
              backgroundColor: "#949AB1",
              left: 0,
              top: 8,
              opacity: 0.32,
            }}
          />
        </div>

        {/* Small ring — bottom right */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: "20%",
            right: "5%",
            width: 46,
            height: 46,
            border: "2px solid #949AB1",
            borderRadius: "50%",
            opacity: 0.18,
          }}
        />

        <div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20 w-full pt-28 md:pt-32 pb-20 md:pb-16 flex flex-col md:flex-row items-center gap-14 md:gap-8 lg:gap-12">

          {/* ── LEFT: Text ── */}
          <div className="flex-1 z-10 md:pr-6">
            <div className="animate-fade-up inline-flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-[#E2D4E0] rounded-full px-4 py-1.5 mb-7">
              <span className="w-2 h-2 rounded-full bg-[#FB7185]" />
              <span className="text-[10px] font-bold tracking-[0.24em] uppercase text-[#4C5372]">
                Handcrafted in Qatar
              </span>
            </div>

            <h1 className="font-playfair animate-fade-up-d1 text-[2.9rem] sm:text-[3.7rem] md:text-[4.4rem] lg:text-[5.1rem] font-bold text-[#1E2235] leading-[1.06] mb-7">
              Brownies
              <br />
              <em className="not-italic" style={{ color: "#4C5372" }}>
                worth every
              </em>
              <br />
              <span
                style={{
                  background:
                    "linear-gradient(135deg, #FB7185 0%, #E11D48 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                indulgence.
              </span>
            </h1>

            <p className="animate-fade-up-d2 text-[#949AB1] text-base md:text-lg leading-relaxed max-w-[420px] mb-10">
              Artisan brownies crafted with the finest ingredients — fully
              customizable for every occasion.
            </p>

            <div className="animate-fade-up-d3 flex flex-wrap items-center gap-4">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2.5 bg-[#FB7185] hover:bg-[#E11D48] text-white font-semibold px-8 py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97]"
                style={{ boxShadow: "0 8px 28px rgba(251,113,133,0.38)" }}
              >
                Order Now <ArrowRight size={16} />
              </Link>
              <Link
                href="/about"
                className="inline-flex items-center gap-1.5 text-[#4C5372] font-semibold text-sm hover:text-[#1E2235] transition-colors"
              >
                Our Story <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          {/* ── RIGHT: Image ── */}
          <div className="flex-1 relative flex items-center justify-center md:justify-end">
            {/* Lavender blob */}
            <div
              className="absolute rounded-full pointer-events-none"
              style={{
                width: "min(450px, 90vw)",
                height: "min(450px, 90vw)",
                background:
                  "radial-gradient(circle, #D8CCD8 0%, #E2D4E0 58%, transparent 100%)",
                opacity: 0.88,
              }}
            />

            {/* Image */}
            <div
              className="relative z-10"
              style={{
                width: "min(400px, 82vw)",
                height: "min(400px, 82vw)",
              }}
            >
              <div
                className="relative w-full h-full rounded-[2.5rem] overflow-hidden"
                style={{ boxShadow: "0 32px 80px rgba(76,83,114,0.24)" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1607920592519-bab2a80efd81?w=800&q=85"
                  alt="Biteez artisan brownies"
                  fill
                  className="object-cover"
                  priority
                />
              </div>

            </div>

            {/* Extra decorative dots near image */}
            <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-[#FB7185] opacity-55 z-20" />
            <div className="absolute bottom-14 right-1 w-2 h-2 rounded-full bg-[#949AB1] opacity-45 z-20" />
            <div className="absolute top-1/2 -left-2 w-4 h-4 rounded-full border-2 border-[#949AB1] opacity-45 z-20" />
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          BESTSELLERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FFFDF6" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-px bg-[#FB7185] inline-block" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#949AB1]">
                  Our Collection
                </span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1E2235]">
                Bestsellers
              </h2>
            </div>
            <Link
              href="/menu"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#4C5372] hover:text-[#FB7185] transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {products.length === 0
              ? [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-56 h-72 rounded-3xl animate-pulse"
                    style={{ backgroundColor: "#E2D4E0" }}
                  />
                ))
              : products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    added={addedIds.has(p.id)}
                    onAdd={() => handleAdd(p)}
                  />
                ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#4C5372] hover:text-[#FB7185] transition-colors"
            >
              View all <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ABOUT / STORY STRIP
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#E2D4E0" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Image */}
            <div className="relative order-2 md:order-1">
              <div
                className="relative aspect-[4/3] rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 24px 64px rgba(76,83,114,0.18)" }}
              >
                <Image
                  src="https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=700&q=85"
                  alt="Our story"
                  fill
                  className="object-cover"
                />
              </div>
              <div
                className="absolute -bottom-5 -right-4 bg-white rounded-2xl px-5 py-4"
                style={{ boxShadow: "0 8px 32px rgba(76,83,114,0.12)" }}
              >
                <p className="font-playfair text-2xl font-bold text-[#4C5372] leading-none">
                  2021
                </p>
                <p className="text-[#949AB1] text-xs font-semibold mt-0.5">
                  Est. in Qatar
                </p>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-px bg-[#FB7185] inline-block" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#949AB1]">
                  Our Story
                </span>
              </div>
              <blockquote className="font-playfair text-3xl md:text-[2.35rem] font-bold italic text-[#4C5372] leading-[1.22] mb-6">
                &ldquo;Every bite tells a story of passion, craft, and the finest
                chocolate.&rdquo;
              </blockquote>
              <div className="w-12 h-0.5 bg-[#FB7185] rounded-full mb-6" />
              <p className="text-[#4C5372]/70 text-base leading-relaxed mb-8">
                Born in the heart of Qatar, Biteez was founded on a simple
                belief: that brownies could be extraordinary. We hand-craft each
                box with love, using only premium ingredients sourced from around
                the world.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 border-2 border-[#4C5372] text-[#4C5372] hover:bg-[#4C5372] hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-200 active:scale-[0.97]"
              >
                Read Our Story <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#1E2235] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-5">
              <div className="flex items-center gap-1.5 mb-5">
                <span className="font-playfair text-3xl font-bold text-white">
                  Biteez
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FB7185] mt-1.5" />
              </div>
              <p className="text-white/45 leading-relaxed text-sm max-w-xs">
                {t("footer_tagline")}
              </p>
              <div className="flex gap-4 mt-6">
                {(
                  [
                    {
                      key: "footer_instagram",
                      href: "https://www.instagram.com/biteezqa?igsh=NWVuc2Eya2xqMm1y",
                    },
                    { key: "footer_facebook", href: "#" },
                    { key: "footer_tiktok", href: "#" },
                  ] as const
                ).map(({ key, href }) => (
                  <a
                    key={key}
                    href={href}
                    target={href !== "#" ? "_blank" : undefined}
                    rel={href !== "#" ? "noopener noreferrer" : undefined}
                    className="text-[11px] font-semibold tracking-widest text-white/30 uppercase hover:text-[#FB7185] transition-colors"
                  >
                    {t(key)}
                  </a>
                ))}
              </div>
            </div>

            <div className="md:col-span-3">
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white/35 mb-5">
                {t("footer_navigate")}
              </h4>
              <ul className="space-y-3">
                {footerNavKeys.map((key, i) => (
                  <li key={key}>
                    <Link
                      href={footerNavHrefs[i]}
                      className="text-white/45 hover:text-[#FB7185] transition-colors text-sm"
                    >
                      {t(key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="md:col-span-4">
              <h4 className="text-xs font-bold tracking-[0.25em] uppercase text-white/35 mb-5">
                {t("footer_visit")}
              </h4>
              <ul className="space-y-3">
                <li className="flex items-start gap-2.5 text-white/45 text-sm">
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#FB7185]/70" />
                  <span>{t("footer_address")}</span>
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Mail size={14} className="shrink-0 text-[#FB7185]/70" />
                  hello@biteez.com
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Phone size={14} className="shrink-0 text-[#FB7185]/70" />
                  +961 1 234 567
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-white/25 text-xs">{t("footer_copyright")}</p>
            <p className="text-white/25 text-xs">{t("footer_crafted")}</p>
          </div>
        </div>
      </footer>

    </main>
  );
}
