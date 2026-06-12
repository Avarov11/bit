"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { MapPin, Mail, Phone, ArrowRight, ShoppingBag, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/store/cartStore";
import type { DbProduct } from "@/lib/types";
import { cn } from "@/lib/utils";
import CakeCustomizerModal from "@/components/CakeCustomizerModal";

const footerNavKeys = ["nav_home", "nav_menu", "nav_about", "nav_contact"];
const footerNavHrefs = ["/", "/menu", "/about", "/contact"];


function ProductCard({
  product,
  added,
  onAdd,
  onCustomize,
  custPriceRange,
}: {
  product: DbProduct;
  added: boolean;
  onAdd: () => void;
  onCustomize: () => void;
  custPriceRange: { min: number; max: number };
}) {
  const { t } = useLanguage();
  const isCustomizable = product.category !== "Accessories" && product.category !== "Boxes";
  const href = `/product/${product.id}`;

  return (
    <div className="shrink-0 w-56 group">
      <div
        className="rounded-3xl overflow-hidden transition-all duration-300 group-hover:-translate-y-2"
        style={{
          backgroundColor: "#F5D0D8",
          boxShadow: "0 4px 20px rgba(128,0,32,0.10)",
        }}
      >
        {isCustomizable ? (
          <div className="relative w-full aspect-square overflow-hidden cursor-pointer" onClick={onCustomize}>
            <Image
              src={
                product.image_url ||
                "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80"
              }
              alt={product.name}
              fill
              sizes="224px"
              priority
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
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
        )}
        <div className="p-4">
          <h3 className="font-playfair font-bold text-[#2D000A] text-sm leading-tight mb-1 line-clamp-1">
            {product.name}
          </h3>
          {isCustomizable ? (
            <p className="font-bold text-[#2D000A] text-sm mb-3">QAR {custPriceRange.min} – {custPriceRange.max}</p>
          ) : (
            <p className="font-bold text-[#2D000A] text-sm mb-3">QAR {product.price}</p>
          )}
          {isCustomizable ? (
            <button
              onClick={onCustomize}
              className="w-full block text-center bg-[#FF6B9D] hover:bg-[#2D000A] text-white text-xs font-bold py-2.5 rounded-full transition-all duration-200"
            >
              {t("home_customise")}
            </button>
          ) : (
            <button
              onClick={onAdd}
              className={cn(
                "w-full text-xs font-bold py-2.5 rounded-full transition-all duration-200 flex items-center justify-center gap-1.5",
                added
                  ? "bg-emerald-500 text-white"
                  : "bg-[#FF6B9D] hover:bg-[#2D000A] text-white"
              )}
            >
              {added ? (
                <>
                  <Check size={12} /> {t("home_added")}
                </>
              ) : (
                <>
                  <ShoppingBag size={12} /> {t("home_add_to_cart")}
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

  const HERO_SLIDES = [
    {
      image: "/slide1.jpeg",
      mobileImage: "/slide1phone.jpeg",
      label: t("home_slide1_label"),
      headline: [t("home_slide1_headline_1"), t("home_slide1_headline_2")],
      sub: t("home_slide1_sub"),
      tags: [t("home_slide1_tag_1"), t("home_slide1_tag_2"), t("home_slide1_tag_3"), t("home_slide1_tag_4")],
      stats: [
        { value: t("home_slide1_stat1_value"), label: t("home_slide1_stat1_label") },
        { value: t("home_slide1_stat2_value"), label: t("home_slide1_stat2_label") },
        { value: t("home_slide1_stat3_value"), label: t("home_slide1_stat3_label") },
      ],
      steps: null,
      btn: t("home_slide1_btn"),
      href: "/menu",
    },
    {
      image: "/slide2.jpeg",
      mobileImage: undefined,
      label: t("home_slide2_label"),
      headline: [t("home_slide2_headline_1"), t("home_slide2_headline_2")],
      sub: t("home_slide2_sub"),
      tags: null,
      stats: null,
      steps: [
        { n: "01", text: t("home_slide2_step_1") },
        { n: "02", text: t("home_slide2_step_2") },
        { n: "03", text: t("home_slide2_step_3") },
        { n: "04", text: t("home_slide2_step_4") },
      ],
      btn: t("home_slide2_btn"),
      href: "/menu?category=Customized",
    },
    {
      image: "/slide3.jpeg",
      mobileImage: undefined,
      label: t("home_slide3_label"),
      headline: [t("home_slide3_headline_1"), t("home_slide3_headline_2")],
      sub: t("home_slide3_sub"),
      tags: null,
      stats: null,
      steps: null,
      btn: t("home_slide3_btn"),
      href: "/menu?category=Accessories",
    },
    {
      image: "/slide4.jpeg",
      mobileImage: "/slide4phone.jpeg",
      label: t("home_slide4_label"),
      headline: [t("home_slide4_headline_1"), t("home_slide4_headline_2")],
      sub: t("home_slide4_sub"),
      tags: [t("home_slide4_tag_1"), t("home_slide4_tag_2"), t("home_slide4_tag_3"), t("home_slide4_tag_4")],
      stats: [
        { value: t("home_slide4_stat1_value"), label: t("home_slide4_stat1_label") },
        { value: t("home_slide4_stat2_value"), label: t("home_slide4_stat2_label") },
        { value: t("home_slide4_stat3_value"), label: t("home_slide4_stat3_label") },
      ],
      steps: null,
      btn: t("home_slide4_btn"),
      href: "/menu?category=Bride+to+Be",
    },
    {
      image: "/slide5.jpeg",
      mobileImage: undefined,
      label: t("home_slide5_label"),
      headline: [t("home_slide5_headline_1"), t("home_slide5_headline_2")],
      sub: t("home_slide5_sub"),
      tags: null,
      stats: null,
      steps: [
        { n: "🎂", text: t("home_slide5_step_1") },
        { n: "🎓", text: t("home_slide5_step_2") },
        { n: "💍", text: t("home_slide5_step_3") },
        { n: "🎉", text: t("home_slide5_step_4") },
      ],
      btn: t("home_slide5_btn"),
      href: "/menu?category=Gender+Reveal",
    },
  ];
  const [products, setProducts]       = useState<DbProduct[]>([]);
  const [addedIds, setAddedIds]       = useState<Set<string>>(new Set());
  const [heroSlide, setHeroSlide]     = useState(0);
  const [prevSlide,  setPrevSlide]    = useState<number | null>(null);
  const touchStartX = useRef(0);

  const goToSlide = (next: number | ((s: number) => number)) => {
    setHeroSlide((cur) => {
      const n = typeof next === "function" ? next(cur) : next;
      if (n === cur) return cur;
      setPrevSlide(cur);
      setTimeout(() => setPrevSlide(null), 1200);
      return n;
    });
  };
  const [custProduct, setCustProduct] = useState<DbProduct | null>(null);
  const [pricing,    setPricing]      = useState<Record<string, number>>({});

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProducts(data.slice(0, 8)); })
      .catch(() => {});
    fetch("/api/customizer-pricing")
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === "object") setPricing(data); })
      .catch(() => {});
  }, []);

  const custPriceRange = (() => {
    const bases    = [pricing["shape_cake"] ?? 160, pricing["shape_heart"] ?? 85, pricing["shape_square"] ?? 85];
    const maxAddon = (pricing["addon_sprinkles"] ?? 5)
                   + Math.max(pricing["addon_sticker"] ?? 30, pricing["addon_image"] ?? 30, pricing["addon_writing"] ?? 10);
    return { min: Math.min(...bases), max: Math.max(...bases) + maxAddon };
  })();

  const handleAdd = (p: DbProduct) => {
    addItem({
      productId: p.id,
      productName: p.name,
      productImage: p.image_url || "",
      quantity: 1,
      unitPrice: p.price,
      customization: {},
    });
    setAddedIds((prev) => new Set(Array.from(prev).concat(p.id)));
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
          HERO — cinematic full-screen slideshow
      ═══════════════════════════════════════════════════════════ */}
      <section
        className="relative w-full overflow-hidden bg-[#0a0005]"
        style={{ minHeight: "100dvh" }}
        onTouchStart={(e) => { touchStartX.current = e.changedTouches[0].clientX; }}
        onTouchEnd={(e) => {
          const diff = touchStartX.current - e.changedTouches[0].clientX;
          if (Math.abs(diff) > 50) {
            if (diff > 0) goToSlide(s => (s + 1) % HERO_SLIDES.length);
            else goToSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
          }
        }}
      >
        {/* Ken Burns slides */}
        {HERO_SLIDES.map((slide, i) => (
          <div
            key={i}
            className={cn(
              "absolute inset-0 transition-opacity duration-[1200ms]",
              i === heroSlide ? "opacity-100 z-20" : i === prevSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            )}
          >
            {/* Mobile image — only for slides that have one, hidden on md+ */}
            {slide.mobileImage && (
              <Image
                src={slide.mobileImage}
                alt={slide.label}
                fill
                sizes="(max-width: 767px) 100vw, 0px"
                className={cn("object-cover md:hidden", i === heroSlide && "animate-kenburns")}
                priority
              />
            )}
            {/* Desktop image — always shown, or full-time if no mobile variant */}
            <Image
              src={slide.image}
              alt={slide.label}
              fill
              sizes={slide.mobileImage ? "(min-width: 768px) 100vw, 0px" : "100vw"}
              className={cn(
                "object-cover",
                slide.mobileImage && "hidden md:block",
                i === heroSlide && "animate-kenburns"
              )}
              priority
            />
            {/* Vignette: strong left panel + bottom fade */}
            <div
              className="absolute inset-0"
              style={{
                background: [
                  "linear-gradient(to right, rgba(6,0,2,0.82) 0%, rgba(6,0,2,0.52) 38%, rgba(6,0,2,0.12) 62%, transparent 100%)",
                  "linear-gradient(to top,   rgba(6,0,2,0.55) 0%, transparent 40%)",
                ].join(", "),
              }}
            />
          </div>
        ))}

        {/* ── Text + CTA (left-aligned, vertically centered) ── */}
        <div
          className="relative z-20 flex items-center w-full"
          style={{ minHeight: "100dvh", paddingTop: "7rem", paddingBottom: "5rem" }}
        >
          <div className="px-6 sm:px-10 md:px-16 lg:px-24 w-full max-w-[92%] sm:max-w-xl lg:max-w-2xl">

            {/* Animated block — key remounts on slide change to replay animation */}
            <div key={heroSlide} className="animate-hero-text">

              {/* Eyebrow */}
              <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-1.5 mb-5 sm:mb-7 backdrop-blur-sm bg-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B9D] shrink-0" />
                <span className="text-[9px] sm:text-[10px] font-bold tracking-[0.26em] uppercase text-white/55">
                  {HERO_SLIDES[heroSlide].label}
                </span>
              </div>

              {/* Headline */}
              <h1
                className="font-playfair font-bold leading-[1.04] mb-4 sm:mb-5 text-white"
                style={{ fontSize: "clamp(2.2rem, 5.5vw, 5rem)" }}
              >
                {HERO_SLIDES[heroSlide].headline[0]}
                <br />
                <span
                  style={{
                    background: "linear-gradient(135deg, #FF6B9D 0%, #FFD0E0 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                  }}
                >
                  {HERO_SLIDES[heroSlide].headline[1]}
                </span>
              </h1>

              {/* Divider */}
              <div className="w-10 sm:w-14 h-px bg-[#FF6B9D]/50 mb-4 sm:mb-5 rounded-full" />

              {/* Subtext */}
              <p className="text-white/55 text-sm sm:text-base leading-relaxed max-w-[340px] sm:max-w-md mb-5 sm:mb-6">
                {HERO_SLIDES[heroSlide].sub}
              </p>

              {/* ── Slide 1: feature tags + stats row ── */}
              {HERO_SLIDES[heroSlide].tags && (
                <>
                  <div className="flex flex-wrap gap-2 mb-5 sm:mb-6">
                    {HERO_SLIDES[heroSlide].tags!.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1.5 bg-white/8 border border-white/15 backdrop-blur-sm text-white/70 text-[10px] sm:text-xs font-semibold px-3 py-1.5 rounded-full"
                      >
                        <span className="w-1 h-1 rounded-full bg-[#FF6B9D] shrink-0" />
                        {tag}
                      </span>
                    ))}
                  </div>

                  {HERO_SLIDES[heroSlide].stats && (
                    <div className="flex items-center gap-5 sm:gap-8 mb-6 sm:mb-8">
                      {HERO_SLIDES[heroSlide].stats!.map((s, i) => (
                        <div key={i} className="flex flex-col">
                          <span
                            className="font-playfair font-bold text-white leading-none"
                            style={{ fontSize: "clamp(1.4rem, 3vw, 2rem)" }}
                          >
                            {s.value}
                          </span>
                          <span className="text-white/35 text-[10px] font-semibold tracking-widest uppercase mt-0.5">
                            {s.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* ── Slide 2: customization steps ── */}
              {HERO_SLIDES[heroSlide].steps && (
                <div className="grid grid-cols-2 gap-2.5 sm:gap-3 mb-6 sm:mb-8">
                  {HERO_SLIDES[heroSlide].steps!.map((step) => (
                    <div
                      key={step.n}
                      className="flex items-center gap-2.5 bg-white/6 border border-white/12 backdrop-blur-sm rounded-xl px-3 py-2.5 sm:px-4 sm:py-3"
                    >
                      <span
                        className={cn(
                          "shrink-0 leading-none",
                          /^\d/.test(step.n)
                            ? "font-playfair font-bold text-[#FF6B9D]"
                            : "text-xl"
                        )}
                        style={/^\d/.test(step.n) ? { fontSize: "clamp(1rem, 2vw, 1.25rem)" } : undefined}
                      >
                        {step.n}
                      </span>
                      <span className="text-white/70 text-[11px] sm:text-xs font-semibold leading-tight">
                        {step.text}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* CTA button */}
              <Link
                href={HERO_SLIDES[heroSlide].href}
                className="inline-flex items-center gap-2.5 bg-[#FF6B9D] hover:bg-white hover:text-[#800020] text-white font-semibold px-7 py-3.5 sm:px-9 sm:py-4 rounded-full transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.97] text-sm sm:text-base whitespace-nowrap"
                style={{ boxShadow: "0 10px 32px rgba(255,107,157,0.40)" }}
              >
                {HERO_SLIDES[heroSlide].btn} <ArrowRight size={16} />
              </Link>

            </div>
          </div>
        </div>

        {/* ── Bottom bar: progress + label + arrows ── */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex items-center justify-between gap-3 px-4 sm:px-8 md:px-14 pb-4 sm:pb-6"
          style={{ paddingBottom: "max(1rem, env(safe-area-inset-bottom, 1rem))" }}
        >
          {/* Progress strips */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {HERO_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goToSlide(i)}
                aria-label={`Slide ${i + 1}`}
                className="relative rounded-full overflow-hidden transition-all duration-300"
                style={{
                  height: 3,
                  width: i === heroSlide ? 44 : 18,
                  background: "rgba(255,255,255,0.18)",
                }}
              >
                {i < heroSlide && (
                  <span className="absolute inset-0 bg-white/55 rounded-full" />
                )}
                {i === heroSlide && (
                  <span className="absolute inset-0 bg-[#FF6B9D]/80 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Label + arrows */}
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:block text-white/35 text-[9px] sm:text-[10px] font-bold tracking-[0.2em] uppercase whitespace-nowrap">
              {HERO_SLIDES[heroSlide].label}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => goToSlide(s => (s - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 touch-manipulation"
                aria-label="Previous"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => goToSlide(s => (s + 1) % HERO_SLIDES.length)}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-white/20 hover:border-white/50 hover:bg-white/10 flex items-center justify-center text-white/60 hover:text-white transition-all duration-200 touch-manipulation"
                aria-label="Next"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <style jsx global>{`
        @keyframes kenburns {
          from { transform: scale(1)    translateY(0px); }
          to   { transform: scale(1.10) translateY(-12px); }
        }
        .animate-kenburns {
          animation: kenburns 7s ease-out forwards;
        }
        @keyframes hero-text-in {
          0%   { opacity: 0; transform: translateY(28px); }
          100% { opacity: 1; transform: translateY(0);    }
        }
        .animate-hero-text {
          animation: hero-text-in 0.75s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      {/* ═══════════════════════════════════════════════════════════
          BESTSELLERS
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#FFFFFF" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="flex items-end justify-between mb-10">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-8 h-px bg-[#FF6B9D] inline-block" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#A05068]">
                  {t("home_collection_tag")}
                </span>
              </div>
              <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#2D000A]">
                {t("home_bestsellers")}
              </h2>
            </div>
            <Link
              href="/menu"
              className="hidden md:inline-flex items-center gap-1.5 text-sm font-semibold text-[#800020] hover:text-[#FF6B9D] transition-colors"
            >
              {t("home_view_all")} <ArrowRight size={14} />
            </Link>
          </div>

          <div className="flex gap-5 overflow-x-auto pb-4 scrollbar-hide -mx-2 px-2">
            {products.length === 0
              ? [...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="shrink-0 w-56 h-72 rounded-3xl animate-pulse"
                    style={{ backgroundColor: "#F5D0D8" }}
                  />
                ))
              : products.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    added={addedIds.has(p.id)}
                    onAdd={() => handleAdd(p)}
                    onCustomize={() => setCustProduct(p)}
                    custPriceRange={custPriceRange}
                  />
                ))}
          </div>

          <div className="mt-8 md:hidden text-center">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#800020] hover:text-[#FF6B9D] transition-colors"
            >
              {t("home_view_all")} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          ABOUT / STORY STRIP
      ═══════════════════════════════════════════════════════════ */}
      <section className="py-20 md:py-28" style={{ backgroundColor: "#F5D0D8" }}>
        <div className="max-w-7xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 items-center">

            {/* Image */}
            <div className="relative order-2 md:order-1">
              <div
                className="relative aspect-[4/3] rounded-3xl overflow-hidden"
                style={{ boxShadow: "0 24px 64px rgba(128,0,32,0.18)" }}
              >
                <Image
                  src="/ourstory.jpeg"
                  alt="Our story"
                  fill
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div
                className="absolute -bottom-5 -right-4 bg-white rounded-2xl px-5 py-4"
                style={{ boxShadow: "0 8px 32px rgba(128,0,32,0.12)" }}
              >
                <p className="font-playfair text-2xl font-bold text-[#800020] leading-none">
                  2021
                </p>
                <p className="text-[#A05068] text-xs font-semibold mt-0.5">
                  {t("home_story_est")}
                </p>
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2">
              <div className="flex items-center gap-2 mb-5">
                <span className="w-8 h-px bg-[#FF6B9D] inline-block" />
                <span className="text-[10px] font-bold tracking-[0.25em] uppercase text-[#A05068]">
                  {t("home_story_tag")}
                </span>
              </div>
              <blockquote className="font-playfair text-3xl md:text-[2.35rem] font-bold italic text-[#800020] leading-[1.22] mb-6">
                &ldquo;{t("home_story_quote")}&rdquo;
              </blockquote>
              <div className="w-12 h-0.5 bg-[#FF6B9D] rounded-full mb-6" />
              <p className="text-[#800020]/70 text-base leading-relaxed mb-8">
                {t("home_story_body")}
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2.5 border-2 border-[#800020] text-[#800020] hover:bg-[#800020] hover:text-white font-semibold px-7 py-3.5 rounded-full transition-all duration-200 active:scale-[0.97]"
              >
                {t("home_story_cta")} <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════
          FOOTER
      ═══════════════════════════════════════════════════════════ */}
      <footer className="bg-[#2D000A] text-white">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-16 md:py-20">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 mb-14">
            <div className="md:col-span-5">
              <div className="flex items-center gap-1.5 mb-5">
                <span className="font-playfair text-3xl font-bold text-white">
                  Biteez
                </span>
                <span className="w-2 h-2 rounded-full bg-[#FF6B9D] mt-1.5" />
              </div>
              <p className="text-white/45 leading-relaxed text-sm max-w-xs">
                {t("footer_tagline")}
              </p>
              <div className="flex gap-4 mt-6">
                <a
                  href="https://www.instagram.com/biteezqa?igsh=NWVuc2Eya2xqMm1y"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] font-semibold tracking-widest text-white/30 uppercase hover:text-[#FF6B9D] transition-colors"
                >
                  {t("footer_instagram")}
                </a>
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
                      className="text-white/45 hover:text-[#FF6B9D] transition-colors text-sm"
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
                  <MapPin size={14} className="mt-0.5 shrink-0 text-[#FF6B9D]/70" />
                  <span>{t("footer_address")}</span>
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Mail size={14} className="shrink-0 text-[#FF6B9D]/70" />
                  hello@biteez.com
                </li>
                <li className="flex items-center gap-2.5 text-white/45 text-sm">
                  <Phone size={14} className="shrink-0 text-[#FF6B9D]/70" />
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

      <CakeCustomizerModal product={custProduct} onClose={() => setCustProduct(null)} />

    </main>
  );
}
