"use client";

import { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { DbProduct } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import CakeCustomizerModal from "@/components/CakeCustomizerModal";

// ─── Filter category type (UI only) ────────────────────────────────────────────
type FilterCat = "All" | "Customized" | "Birthday" | "Congrats" | "Graduation" | "Get Well Soon" | "Bride to Be" | "Gender Reveal" | "Accessories" | "Boxes";
type SubCat = "Candles" | "Balloons";

const accessoriesSubs: SubCat[] = ["Candles", "Balloons"];
const customizedSubCats = ["Birthday", "Congrats", "Graduation", "Get Well Soon", "Bride to Be", "Gender Reveal"] as const;

const catKeyMap: Record<string, string> = {
  All: "cat_all", Accessories: "cat_accessories", Candles: "cat_candles",
  Balloons: "cat_balloons", Boxes: "cat_boxes", Customized: "cat_customized",
  Birthday: "cat_birthday", Congrats: "cat_congrats", Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon", "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal",
};

const categoryBadge: Record<string, string> = {
  Customized: "bg-gold-light text-chocolate-dark",
  Accessories: "bg-[#E4EDF5] text-[#2D4A7A]",
  Boxes: "bg-[#F5EDE4] text-[#7A4A2D]",
  Birthday: "bg-chocolate-light text-chocolate-dark",
  Congrats: "bg-[#D6F0E8] text-[#2D7A5C]",
  Graduation: "bg-[#DAE4F5] text-[#2D4A7A]",
  "Get Well Soon": "bg-[#D6F0EC] text-[#2D7A6A]",
  "Bride to Be": "bg-[#F5E4F0] text-[#7A2D6A]",
  "Gender Reveal": "bg-[#EDE4F5] text-[#6B3FA0]",
  Candles: "bg-[#FFF3E0] text-[#7A5200]",
  Balloons: "bg-[#FCE4EC] text-[#880E4F]",
};

// ─── Page component ────────────────────────────────────────────────────────────

export default function MenuContent() {
  const { t, lang } = useLanguage();
  const searchParams = useSearchParams();

  const [products, setProducts]                   = useState<DbProduct[]>([]);
  const [loadingProducts, setLoadingProducts]     = useState(true);
  const [activeCategory, setActiveCategory]       = useState<FilterCat>(() => {
    const cat = searchParams.get("category");
    const valid: FilterCat[] = ["Customized", "Birthday", "Congrats", "Graduation", "Get Well Soon", "Bride to Be", "Gender Reveal", "Accessories", "Boxes"];
    if (valid.includes(cat as FilterCat)) return cat as FilterCat;
    return "All";
  });
  const [activeSubCategory, setActiveSubCategory] = useState<SubCat | null>(null);
  const [query, setQuery]                         = useState("");
  const [custProduct, setCustProduct]             = useState<DbProduct | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProducts(data); })
      .finally(() => setLoadingProducts(false));
  }, []);

  const displayName    = (p: DbProduct) => lang === "ar" ? (p.name_ar ?? p.name) : p.name;
  const displayCatKey  = (p: DbProduct) => p.subcategory ?? p.category;
  const isCustomizable = (p: DbProduct) => p.category !== "Accessories" && p.category !== "Boxes";

  const openCustomizer  = (product: DbProduct) => setCustProduct(product);
  const closeCustomizer = () => setCustProduct(null);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      let matchCat: boolean;
      if (activeCategory === "All") {
        matchCat = true;
      } else if (activeCategory === "Customized") {
        matchCat = p.category === "Customized" && !p.subcategory;
      } else if ((customizedSubCats as readonly string[]).includes(activeCategory)) {
        matchCat = p.category === activeCategory;
      } else if (activeCategory === "Accessories") {
        matchCat = p.category === "Accessories" &&
          (activeSubCategory ? p.subcategory === activeSubCategory : true);
      } else {
        matchCat = p.category === activeCategory;
      }
      const matchSearch =
        query === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(query.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, activeSubCategory, query, products]);

  // ─── Card interior ─────────────────────────────────────────────────────────
  const CardInterior = ({ product, priority = false }: { product: DbProduct; priority?: boolean }) => {
    const badgeKey = displayCatKey(product);
    return (
      <>
        <div className="relative aspect-square overflow-hidden bg-[#F5D0D8]">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600&h=700&fit=crop&q=80"}
            alt={displayName(product)}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.tag && (
            <span className="absolute top-2.5 left-2.5 bg-[#800020] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">
              {product.tag}
            </span>
          )}
          <span className={cn("absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full", categoryBadge[badgeKey] ?? "bg-[#F5D0D8] text-[#800020]")}>
            {t(catKeyMap[badgeKey]) || badgeKey}
          </span>
        </div>
        <div className="p-3">
          <h3 className="font-playfair font-bold text-[#2D000A] text-sm md:text-base leading-tight mb-0.5 line-clamp-1">
            {displayName(product)}
          </h3>
          <div className="w-full bg-[#FF6B9D] group-hover:bg-[#2D000A] text-white text-xs font-bold py-2.5 rounded-xl text-center tracking-wide transition-colors duration-200">
            {isCustomizable(product) ? t("menu_customise") : t("menu_add_to_cart")}
          </div>
        </div>
      </>
    );
  };

  // ─── Shared product grid renderer ─────────────────────────────────────────
  const renderGrid = (cols: string) => {
    if (loadingProducts) return (
      <div className="text-center py-24">
        <div className="inline-block w-8 h-8 border-4 border-[#800020]/20 border-t-[#800020] rounded-full animate-spin mb-4" />
        <p className="text-[#800020]/50 text-sm font-medium">Loading menu…</p>
      </div>
    );
    if (filtered.length === 0) return (
      <div className="text-center py-24">
        <p className="font-playfair text-2xl font-semibold text-[#800020]/50 mb-2">{t("menu_no_results")}</p>
        <p className="text-[#800020]/40 text-sm">{t("menu_no_results_hint")}</p>
      </div>
    );
    const cardClass = "group bg-white rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300";
    return (
      <div className={cn("grid gap-3 md:gap-4", cols)}>
        {filtered.map((product, i) => isCustomizable(product) ? (
          <div key={product.id} className={cn(cardClass, "cursor-pointer")} onClick={() => openCustomizer(product)}>
            <CardInterior product={product} priority={i === 0} />
          </div>
        ) : (
          <Link key={product.id} href={`/product/${product.id}`} className={cardClass}>
            <CardInterior product={product} priority={i === 0} />
          </Link>
        ))}
      </div>
    );
  };

  // ─── Shared category sidebar content ───────────────────────────────────────
  const renderSidebarCategories = () => (
    <div className="space-y-0.5">
      {(["All", "Customized", ...customizedSubCats, "Accessories", "Boxes"] as FilterCat[]).map((cat) => {
        const active = activeCategory === cat;
        const isCustomizedSub = (customizedSubCats as readonly string[]).includes(cat);
        return (
          <div key={cat}>
            <button
              onClick={() => { setActiveCategory(cat); setActiveSubCategory(null); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left",
                isCustomizedSub ? "pl-5 text-[13px]" : "",
                active ? "bg-[#800020] text-white" : "text-[#800020] hover:bg-[#800020]/10"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-colors", active ? "bg-white" : isCustomizedSub ? "bg-[#800020]/20" : "bg-[#800020]/35")} />
              {cat}
            </button>
            {cat === "Accessories" && active && (
              <div className="ml-5 mt-1 space-y-0.5">
                {accessoriesSubs.map(sub => (
                  <button key={sub} onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                    className={cn("w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeSubCategory === sub ? "bg-[#800020]/12 text-[#800020] font-bold" : "text-[#800020]/65 hover:text-[#800020] hover:bg-[#800020]/8"
                    )}>{sub}</button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#FFFFFF" }}>

      {/* ══ MOBILE layout ══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <section className="px-6 pt-7 pb-4">
          <h1 className="font-playfair text-3xl font-bold text-[#2D000A] leading-tight">{t("menu_heading")}</h1>
          <p className="text-[#800020]/65 text-sm mt-1 font-medium">{t("menu_subtitle")}</p>
        </section>

        <div className="sticky top-16 z-30 bg-[#F5D0D8]/96 backdrop-blur-md border-b border-[rgba(128,0,32,0.12)] px-6 pt-3 pb-3 space-y-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A05068]" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("menu_search_placeholder")}
              className="w-full pl-9 pr-10 py-2 bg-white/85 border border-white/50 rounded-full text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none focus:bg-white focus:border-[#800020] transition-all duration-200"
            />
            {query && <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A05068] hover:text-[#800020] text-xs font-bold">✕</button>}
          </div>
          <div className="flex gap-2 pb-0.5 overflow-x-auto scrollbar-hide">
            {(["All", "Customized", ...customizedSubCats, "Accessories", "Boxes"] as FilterCat[]).map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setActiveSubCategory(null); }}
                className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
                  activeCategory === cat ? "bg-[#800020] text-white shadow-warm-sm" : "bg-white/70 text-[#800020] hover:bg-white border border-white/40"
                )}>{cat}</button>
            ))}
          </div>
          {activeCategory === "Accessories" && (
            <div className="flex gap-2 pb-0.5">
              {accessoriesSubs.map((sub) => (
                <button key={sub} onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                  className={cn("shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all active:scale-[0.97]",
                    activeSubCategory === sub ? "bg-[#800020] text-white" : "bg-white/50 text-[#800020] hover:bg-white border border-white/40"
                  )}>{sub}</button>
              ))}
            </div>
          )}
        </div>

        <section className="px-4 py-6">
          {!loadingProducts && filtered.length > 0 && (
            <p className="text-[#800020]/55 text-[11px] font-bold mb-4 uppercase tracking-widest">
              {filtered.length} {filtered.length !== 1 ? "items" : "item"}
            </p>
          )}
          {renderGrid("grid-cols-2")}
        </section>
      </div>

      {/* ══ DESKTOP layout ═════════════════════════════════════════════════════ */}
      <div className="hidden md:flex max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">

        {/* ── Sidebar ── */}
        <aside className="w-60 lg:w-68 shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto border-r border-[rgba(128,0,32,0.10)] flex flex-col px-6 lg:px-8 py-8">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-[#2D000A] leading-tight mb-1">
            {t("menu_heading")}
          </h1>
          <p className="text-[#800020]/60 text-sm font-medium mb-6">{t("menu_subtitle")}</p>

          <div className="relative mb-6">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A05068]" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-7 py-2 bg-white/75 border border-white/50 rounded-full text-xs text-[#2D000A] placeholder:text-[#A05068] outline-none focus:bg-white focus:border-[#800020] transition-all"
            />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A05068] hover:text-[#800020] text-xs">✕</button>}
          </div>

          <p className="text-[9px] font-bold text-[#800020]/45 uppercase tracking-widest mb-3">Categories</p>
          {renderSidebarCategories()}

          <div className="mt-auto pt-6 border-t border-[rgba(128,0,32,0.08)]">
            {!loadingProducts && (
              <p className="text-[10px] font-bold text-[#800020]/40 uppercase tracking-widest">
                {filtered.length} {filtered.length !== 1 ? "items" : "item"}
              </p>
            )}
          </div>
        </aside>

        {/* ── Main grid ── */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-10 py-8">
          {renderGrid("grid-cols-3 xl:grid-cols-4")}
        </div>
      </div>

      <CakeCustomizerModal product={custProduct} onClose={closeCustomizer} />

    </main>
  );
}
