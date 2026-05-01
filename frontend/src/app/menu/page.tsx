"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search } from "lucide-react";
import { menuProducts, type Category } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const categories: Category[] = [
  "All",
  "Customized",
  "Birthday",
  "Congrats",
  "Graduation",
  "Get Well Soon",
  "Bride to Be",
  "Gender Reveal",
];

// Maps product Category value → translation key
const catKeyMap: Record<Category, string> = {
  All: "cat_all",
  Customized: "cat_customized",
  Birthday: "cat_birthday",
  Congrats: "cat_congrats",
  Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon",
  "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal",
};

const categoryBadge: Record<Exclude<Category, "All">, string> = {
  Customized:      "bg-gold-light text-gold-dark",
  Birthday:        "bg-burgundy-light text-burgundy-dark",
  Congrats:        "bg-[#D6F0E8] text-[#2D7A5C]",
  Graduation:      "bg-[#DAE4F5] text-[#2D4A7A]",
  "Get Well Soon": "bg-[#D6F0EC] text-[#2D7A6A]",
  "Bride to Be":   "bg-[#F5E4F0] text-[#7A2D6A]",
  "Gender Reveal": "bg-[#EDE4F5] text-[#6B3FA0]",
};

// Maps product.id → translation key prefix for name/desc
function productNameKey(id: string) {
  return `product_name_${id.replace(/-/g, "_")}`;
}

export default function MenuPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    return menuProducts.filter((p) => {
      const matchCat = activeCategory === "All" || p.category === activeCategory;
      const translatedName = t(productNameKey(p.id));
      const matchSearch =
        query === "" ||
        translatedName.toLowerCase().includes(query.toLowerCase()) ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, query, t]);

  return (
    <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#C896A0" }}>

      {/* ─── Page header ─────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-7 pb-4">
        <div className="max-w-5xl mx-auto">
          <h1 data-i18n="menu_heading" className="font-playfair text-3xl md:text-4xl font-bold text-[#1A0A0A] leading-tight">
            {t("menu_heading")}
          </h1>
          <p data-i18n="menu_subtitle" className="text-[#3D0A14]/65 text-sm mt-1 font-medium">
            {t("menu_subtitle")}
          </p>
        </div>
      </section>

      {/* ─── Sticky filters ──────────────────────────────── */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#C896A0]/96 backdrop-blur-md border-b border-[rgba(26,10,10,0.12)] px-6 md:px-12 pt-3 pb-3">
        <div className="max-w-5xl mx-auto space-y-2.5">

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5060]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-i18n="menu_search_placeholder"
              placeholder={t("menu_search_placeholder")}
              className="w-full pl-9 pr-10 py-2 bg-white/85 border border-white/50 rounded-full text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none focus:bg-white focus:border-[#3D0A14] transition-all duration-200"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E7B7B] hover:text-[#3D0A14] text-xs font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                data-i18n={catKeyMap[cat]}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
                  activeCategory === cat
                    ? "bg-[#3D0A14] text-white shadow-warm-sm"
                    : "bg-white/70 text-[#3D0A14] hover:bg-white border border-white/40"
                )}
              >
                {t(catKeyMap[cat])}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* ─── Grid ────────────────────────────────────────── */}
      <section className="px-4 md:px-12 py-6 md:py-8">
        <div className="max-w-5xl mx-auto">

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p data-i18n="menu_no_results" className="font-playfair text-2xl font-semibold text-[#3D0A14]/50 mb-2">
                {t("menu_no_results")}
              </p>
              <p data-i18n="menu_no_results_hint" className="text-[#3D0A14]/40 text-sm">
                {t("menu_no_results_hint")}
              </p>
            </div>
          ) : (
            <>
              <p className="text-[#3D0A14]/55 text-[11px] font-bold mb-4 uppercase tracking-widest">
                {filtered.length} {filtered.length !== 1 ? "items" : "item"}
              </p>

              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
                {filtered.map((product) => (
                  <Link
                    key={product.id}
                    href={
                      product.category === "Customized"
                        ? `/customize/${product.id}`
                        : `/product/${product.id}`
                    }
                    className="group block bg-white rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300"
                  >
                    {/* Image */}
                    <div className="relative aspect-square overflow-hidden bg-[#F5E4E6]">
                      <Image
                        src={product.image}
                        alt={t(productNameKey(product.id))}
                        fill
                        sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                      />

                      {product.tag && (
                        <span className="absolute top-2.5 left-2.5 bg-[#3D0A14] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">
                          {product.tag}
                        </span>
                      )}

                      <span
                        className={cn(
                          "absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full",
                          categoryBadge[product.category]
                        )}
                        data-i18n={catKeyMap[product.category]}
                      >
                        {t(catKeyMap[product.category])}
                      </span>
                    </div>

                    {/* Body */}
                    <div className="p-3">
                      <h3
                        data-i18n={productNameKey(product.id)}
                        className="font-playfair font-bold text-[#1A0A0A] text-sm md:text-base leading-tight mb-0.5 line-clamp-1"
                      >
                        {t(productNameKey(product.id))}
                      </h3>
                      <p className="font-bold text-[#3D0A14] text-sm mb-3">
                        QAR {product.price}
                      </p>
                      <div
                        data-i18n={product.category === "Customized" ? "menu_customise" : "menu_add_to_cart"}
                        className="w-full bg-[#3D0A14] group-hover:bg-[#2D0810] text-white text-xs font-bold py-2.5 rounded-xl text-center tracking-wide transition-colors duration-200"
                      >
                        {product.category === "Customized"
                          ? t("menu_customise")
                          : t("menu_add_to_cart")}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

        </div>
      </section>
    </main>
  );
}
