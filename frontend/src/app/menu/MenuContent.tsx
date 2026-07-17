"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { useSearchParams } from "next/navigation";
import type { DbProduct } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";
import CakeCustomizerModal from "@/components/CakeCustomizerModal";

interface Category {
  id: string;
  name: string;
  parent: string | null;
  sort_order: number;
  badge_bg: string;
  badge_text: string;
  filter_mode: "direct" | "as_subcategory";
}

function isProductCustomizable(p: DbProduct, cats: Category[]): boolean {
  const cat = cats.find(c => c.name === p.category);
  if (!cat) return false;
  return cat.name === "Customized" || cat.parent === "Customized";
}

export default function MenuContent() {
  const { t, lang }  = useLanguage();
  const searchParams = useSearchParams();

  const [products,     setProducts]     = useState<DbProduct[]>([]);
  const [categories,   setCategories]   = useState<Category[]>([]);
  const [loadingProds, setLoadingProds] = useState(true);
  const [loadingCats,  setLoadingCats]  = useState(true);
  const [activeCat,    setActiveCat]    = useState<Category | null>(null);
  const [activeSub,    setActiveSub]    = useState<Category | null>(null);
  const [query,        setQuery]        = useState("");
  const [custProduct,  setCustProduct]  = useState<DbProduct | null>(null);
  const appliedParam = useRef(false);

  useEffect(() => {
    fetch("/api/products", { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setProducts(data); })
      .finally(() => setLoadingProds(false));

    fetch("/api/categories", { cache: "no-store" })
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setCategories(data); })
      .finally(() => setLoadingCats(false));
  }, []);

  // Apply ?category= search param once categories are loaded
  useEffect(() => {
    if (appliedParam.current || categories.length === 0) return;
    const param = searchParams.get("category");
    if (param) {
      const found = categories.find(c => c.name === param);
      if (found) setActiveCat(found);
    }
    appliedParam.current = true;
  }, [categories, searchParams]);

  const topLevel   = useMemo(() => categories.filter(c => !c.parent), [categories]);
  const childrenOf = useMemo(() => (name: string) => categories.filter(c => c.parent === name), [categories]);

  const filtered = useMemo(() => {
    let result = products;
    if (query) {
      const q = query.toLowerCase();
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.description ?? "").toLowerCase().includes(q)
      );
    }
    if (!activeCat) return result;

    const children = childrenOf(activeCat.name);

    return result.filter(p => {
      if (activeSub) {
        if (activeSub.filter_mode === "as_subcategory") {
          return p.category === activeCat.name && p.subcategory === activeSub.name;
        }
        return p.category === activeSub.name;
      }
      if (children.length === 0) return p.category === activeCat.name;

      const directKids = children.filter(c => c.filter_mode === "direct");
      const hasAsSub   = children.some(c => c.filter_mode === "as_subcategory");

      if (hasAsSub && directKids.length === 0) {
        // Pure as_subcategory parent (e.g. Accessories): show all category=parent products
        return p.category === activeCat.name;
      }
      if (directKids.length > 0 && !hasAsSub) {
        // Pure direct parent (e.g. Customized): show direct children's products
        return (p.category === activeCat.name && !p.subcategory) ||
               directKids.some(child => p.category === child.name);
      }
      // Mixed parent (e.g. Dounts): show category=parent + all direct children products
      return p.category === activeCat.name ||
             directKids.some(child => p.category === child.name);
    });
  }, [activeCat, activeSub, products, query, childrenOf]);

  const loading = loadingProds || loadingCats;

  function selectCat(cat: Category | null) { setActiveCat(cat); setActiveSub(null); }

  const displayName = (p: DbProduct) => lang === "ar" ? (p.name_ar ?? p.name) : p.name;

  // ─── Card ──────────────────────────────────────────────────────────────────
  const CardInterior = ({ product, priority = false }: { product: DbProduct; priority?: boolean }) => {
    const badgeKey = product.subcategory ?? product.category;
    const badgeCat = categories.find(c => c.name === badgeKey);
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
          <span
            className="absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full"
            style={badgeCat
              ? { background: badgeCat.badge_bg, color: badgeCat.badge_text }
              : { background: "#F5D0D8", color: "#800020" }}
          >
            {badgeKey}
          </span>
        </div>
        <div className="p-3">
          <h3 className="font-playfair font-bold text-[#2D000A] text-sm md:text-base leading-tight mb-0.5 line-clamp-1">
            {displayName(product)}
          </h3>
          <div className="w-full bg-[#FF6B9D] group-hover:bg-[#2D000A] text-white text-xs font-bold py-2.5 rounded-xl text-center tracking-wide transition-colors duration-200">
            {isProductCustomizable(product, categories) ? t("menu_customise") : t("menu_add_to_cart")}
          </div>
        </div>
      </>
    );
  };

  // ─── Grid ──────────────────────────────────────────────────────────────────
  const renderGrid = (cols: string) => {
    if (loading) return (
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
        {filtered.map((product, i) =>
          isProductCustomizable(product, categories) ? (
            <div key={product.id} className={cn(cardClass, "cursor-pointer")} onClick={() => setCustProduct(product)}>
              <CardInterior product={product} priority={i === 0} />
            </div>
          ) : (
            <Link key={product.id} href={`/product/${product.id}`} className={cardClass}>
              <CardInterior product={product} priority={i === 0} />
            </Link>
          )
        )}
      </div>
    );
  };

  // ─── Desktop sidebar ───────────────────────────────────────────────────────
  const renderSidebar = () => (
    <div className="space-y-0.5">
      <button
        onClick={() => selectCat(null)}
        className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
          !activeCat ? "bg-[#800020] text-white" : "text-[#800020] hover:bg-[#800020]/10")}
      >
        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", !activeCat ? "bg-white" : "bg-[#800020]/35")} />
        {t("cat_all") || "All"}
      </button>

      {topLevel.map(cat => {
        const directKids  = childrenOf(cat.name).filter(c => c.filter_mode === "direct");
        const subKids     = childrenOf(cat.name).filter(c => c.filter_mode === "as_subcategory");
        const parentActive = activeCat?.name === cat.name || directKids.some(k => activeCat?.name === k.name);

        const subActive = subKids.some(k => k.id === activeSub?.id) && activeCat?.name === cat.name;

        return (
          <div key={cat.id}>
            <button
              onClick={() => selectCat(cat)}
              className={cn("w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-left",
                activeCat?.name === cat.name && !subActive ? "bg-[#800020] text-white"
                : activeCat?.name === cat.name && subActive  ? "bg-[#800020]/10 text-[#800020]"
                : "text-[#800020] hover:bg-[#800020]/10")}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                activeCat?.name === cat.name && !subActive ? "bg-white" : "bg-[#800020]/35")} />
              {cat.name}
            </button>

            {/* Direct children — always visible, indented */}
            {directKids.map(sub => (
              <button key={sub.id} onClick={() => selectCat(sub)}
                className={cn("w-full flex items-center gap-2.5 pl-5 pr-3 py-2 rounded-xl text-[13px] font-semibold transition-all text-left",
                  activeCat?.name === sub.name ? "bg-[#800020] text-white" : "text-[#800020] hover:bg-[#800020]/10")}
              >
                <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", activeCat?.name === sub.name ? "bg-white" : "bg-[#800020]/20")} />
                {sub.name}
              </button>
            ))}

            {/* as_subcategory children — visible only when parent is active */}
            {subKids.length > 0 && parentActive && (
              <div className="ml-5 mt-1 space-y-0.5">
                {subKids.map(sub => (
                  <button key={sub.id}
                    onClick={() => { setActiveCat(cat); setActiveSub(activeSub?.id === sub.id ? null : sub); }}
                    className={cn("w-full text-left px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      activeSub?.id === sub.id
                        ? "bg-[#800020] text-white"
                        : "text-[#800020]/65 hover:text-[#800020] hover:bg-[#800020]/10")}
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // Mobile chips: top-level + direct children as peers
  const mobileChips = useMemo(() => {
    const chips: Category[] = [];
    topLevel.forEach(cat => {
      chips.push(cat);
      childrenOf(cat.name).filter(c => c.filter_mode === "direct").forEach(sub => chips.push(sub));
    });
    return chips;
  }, [topLevel, childrenOf]);

  const activeCatSubKids = activeCat
    ? childrenOf(activeCat.name).filter(c => c.filter_mode === "as_subcategory")
    : [];

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#FFFFFF" }}>

      {/* ══ MOBILE ══════════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <section className="px-6 pt-7 pb-4">
          <h1 className="font-playfair text-3xl font-bold text-[#2D000A] leading-tight">{t("menu_heading")}</h1>
          <p className="text-[#800020]/65 text-sm mt-1 font-medium">{t("menu_subtitle")}</p>
        </section>

        <div className="sticky top-16 z-30 bg-[#F5D0D8]/96 backdrop-blur-md border-b border-[rgba(128,0,32,0.12)] px-6 pt-3 pb-3 space-y-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A05068]" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)}
              placeholder={t("menu_search_placeholder")}
              className="w-full pl-9 pr-10 py-2 bg-white/85 border border-white/50 rounded-full text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none focus:bg-white focus:border-[#800020] transition-all duration-200"
            />
            {query && <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A05068] hover:text-[#800020]"><X size={13} strokeWidth={2.5} /></button>}
          </div>

          <div className="flex gap-2 pb-0.5 overflow-x-auto scrollbar-hide">
            <button onClick={() => selectCat(null)}
              className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-[0.97]",
                !activeCat ? "bg-[#800020] text-white shadow-warm-sm" : "bg-white/70 text-[#800020] hover:bg-white border border-white/40")}>
              {t("cat_all") || "All"}
            </button>
            {mobileChips.map(cat => (
              <button key={cat.id} onClick={() => selectCat(cat)}
                className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all active:scale-[0.97]",
                  activeCat?.name === cat.name ? "bg-[#800020] text-white shadow-warm-sm" : "bg-white/70 text-[#800020] hover:bg-white border border-white/40")}>
                {cat.name}
              </button>
            ))}
          </div>

          {activeCatSubKids.length > 0 && (
            <div className="flex gap-2 pb-0.5">
              {activeCatSubKids.map(sub => (
                <button key={sub.id}
                  onClick={() => setActiveSub(activeSub?.id === sub.id ? null : sub)}
                  className={cn("shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all active:scale-[0.97]",
                    activeSub?.id === sub.id
                      ? "bg-[#800020] text-white shadow-warm-sm"
                      : "bg-white/70 text-[#800020] hover:bg-white border border-white/40")}>
                  {sub.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <section className="px-4 py-6">
          {!loading && filtered.length > 0 && (
            <p className="text-[#800020]/55 text-[11px] font-bold mb-4 uppercase tracking-widest">
              {filtered.length} {filtered.length !== 1 ? "items" : "item"}
            </p>
          )}
          {renderGrid("grid-cols-2")}
        </section>
      </div>

      {/* ══ DESKTOP ════════════════════════════════════════════════════════════ */}
      <div className="hidden md:flex max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">
        <aside className="w-60 lg:w-68 shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto border-r border-[rgba(128,0,32,0.10)] flex flex-col px-6 lg:px-8 py-8">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-[#2D000A] leading-tight mb-1">
            {t("menu_heading")}
          </h1>
          <p className="text-[#800020]/60 text-sm font-medium mb-6">{t("menu_subtitle")}</p>

          <div className="relative mb-6">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A05068]" />
            <input type="text" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search…"
              className="w-full pl-8 pr-7 py-2 bg-white/75 border border-white/50 rounded-full text-xs text-[#2D000A] placeholder:text-[#A05068] outline-none focus:bg-white focus:border-[#800020] transition-all"
            />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A05068] hover:text-[#800020]"><X size={13} strokeWidth={2.5} /></button>}
          </div>

          <p className="text-[9px] font-bold text-[#800020]/45 uppercase tracking-widest mb-3">Categories</p>
          {renderSidebar()}

          <div className="mt-auto pt-6 border-t border-[rgba(128,0,32,0.08)]">
            {!loading && (
              <p className="text-[10px] font-bold text-[#800020]/40 uppercase tracking-widest">
                {filtered.length} {filtered.length !== 1 ? "items" : "item"}
              </p>
            )}
          </div>
        </aside>

        <div className="flex-1 overflow-y-auto px-8 lg:px-10 py-8">
          {renderGrid("grid-cols-3 xl:grid-cols-4")}
        </div>
      </div>

      <CakeCustomizerModal product={custProduct} onClose={() => setCustProduct(null)} />
    </main>
  );
}
