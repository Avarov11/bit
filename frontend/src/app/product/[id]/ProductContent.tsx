"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus, ShoppingBag, Check } from "lucide-react";
import type { DbProduct } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const categoryBadge: Record<string, string> = {
  Customized:      "bg-gold-light text-chocolate-dark",
  Accessories:     "bg-[#E4EDF5] text-[#2D4A7A]",
  Boxes:           "bg-[#F5EDE4] text-[#7A4A2D]",
  Birthday:        "bg-chocolate-light text-chocolate-dark",
  Congrats:        "bg-[#D6F0E8] text-[#2D7A5C]",
  Graduation:      "bg-[#DAE4F5] text-[#2D4A7A]",
  "Get Well Soon": "bg-[#D6F0EC] text-[#2D7A6A]",
  "Bride to Be":   "bg-[#F5E4F0] text-[#7A2D6A]",
  "Gender Reveal": "bg-[#EDE4F5] text-[#6B3FA0]",
  Candles:         "bg-[#FFF3E0] text-[#7A5200]",
  Balloons:        "bg-[#FCE4EC] text-[#880E4F]",
  Cards:           "bg-[#E8F5E9] text-[#2E7D32]",
};

const catKeyMap: Record<string, string> = {
  Customized: "cat_customized", Accessories: "cat_accessories", Boxes: "cat_boxes",
  Birthday: "cat_birthday", Congrats: "cat_congrats", Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon", "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal", Candles: "cat_candles", Balloons: "cat_balloons",
  Cards: "cat_cards",
};

// Maps category → { api route, customization key }
const PICKER_CONFIG: Record<string, { api: string; key: "candleUrl" | "balloonUrl" | "cardUrl"; label: string }> = {
  Candles:  { api: "/api/candles",  key: "candleUrl",  label: "candle design"  },
  Balloons: { api: "/api/balloons", key: "balloonUrl", label: "balloon design" },
  Cards:    { api: "/api/cards",    key: "cardUrl",    label: "card design"    },
};

export default function ProductContent({ product }: { product: DbProduct }) {
  const router        = useRouter();
  const { t, lang }   = useLanguage();
  const addItem       = useCartStore((s) => s.addItem);
  const [quantity,    setQuantity]    = useState(1);
  const [adding,      setAdding]      = useState(false);
  const [designs,     setDesigns]     = useState<{ name: string; url: string }[]>([]);
  const [selectedUrl, setSelectedUrl] = useState<string | null>(null);

  const badgeKey  = product.subcategory ?? product.category;
  const picker    = PICKER_CONFIG[badgeKey] ?? null;

  const displayName = lang === "ar" ? (product.name_ar ?? product.name) : product.name;
  const displayDesc = lang === "ar" ? (product.description_ar ?? product.description ?? "") : (product.description ?? "");

  useEffect(() => {
    if (!picker) return;
    fetch(picker.api)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setDesigns(data); })
      .catch(() => {});
  }, [picker?.api]); // eslint-disable-line react-hooks/exhaustive-deps

  const mainImage = selectedUrl ?? product.image_url ?? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

  const handleAddToCart = () => {
    setAdding(true);
    addItem({
      productId:    product.id,
      productName:  product.name,
      productImage: product.image_url || "",
      quantity,
      unitPrice:    product.price,
      customization: picker && selectedUrl ? { [picker.key]: selectedUrl } : {},
    });
    setTimeout(() => router.push("/cart"), 700);
  };

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-12" style={{ backgroundColor: "#F5D0D8" }}>
      <div className="border-b border-[rgba(128,0,32,0.10)] px-6 md:px-12 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#A05068] hover:text-[#800020] transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="font-playfair text-xl md:text-2xl font-bold text-[#2D000A]">{displayName}</h1>
            <p className="text-[#800020]/60 text-sm">{t(catKeyMap[badgeKey]) || badgeKey}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Main image — updates to selected design */}
          <div className="relative w-full md:w-[420px] shrink-0 aspect-square rounded-2xl overflow-hidden bg-[#F5D0D8] shadow-warm-md">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainImage}
              alt={displayName}
              className="w-full h-full object-cover transition-all duration-300"
            />
            {product.tag && (
              <span className="absolute top-3 left-3 bg-[#800020] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                {product.tag}
              </span>
            )}
          </div>

          <div className="flex-1 w-full">
            <span className={cn("inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-4", categoryBadge[badgeKey] ?? "bg-[#F5D0D8] text-[#800020]")}>
              {t(catKeyMap[badgeKey]) || badgeKey}
            </span>

            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#2D000A] mb-3">{displayName}</h2>
            <p className="text-[#800020] text-base leading-relaxed mb-6">{displayDesc}</p>

            {/* Design picker — shown for Candles, Balloons, Cards */}
            {picker && designs.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#2D000A]">Choose your design</p>
                  {selectedUrl && (
                    <button
                      onClick={() => setSelectedUrl(null)}
                      className="text-[11px] text-[#800020]/50 hover:text-[#800020] transition-colors"
                    >
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-3 gap-2.5">
                  {designs.map((d) => {
                    const sel = selectedUrl === d.url;
                    return (
                      <button
                        key={d.url}
                        onClick={() => setSelectedUrl(sel ? null : d.url)}
                        className={cn(
                          "relative rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95 aspect-square",
                          sel
                            ? "border-[#800020] ring-2 ring-[#800020]/20"
                            : "border-[rgba(128,0,32,0.12)] hover:border-[#800020]/50 hover:scale-[1.03]"
                        )}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={d.url} alt={d.name} className="w-full h-full object-cover" />
                        {sel && (
                          <>
                            <span className="absolute inset-0 bg-[#800020]/10" />
                            <span className="absolute top-1.5 right-1.5 bg-[#800020] rounded-full p-0.5 shadow">
                              <Check size={10} className="text-white" strokeWidth={3} />
                            </span>
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>
                {!selectedUrl && (
                  <p className="text-[11px] text-[#A05068]/60 mt-2">Tap a design to preview it — optional</p>
                )}
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-warm-xs p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[#A05068] text-sm font-medium">{t("product_price_per_box")}</span>
                <span className="font-playfair font-bold text-[#800020] text-2xl">QAR {product.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A05068] text-sm font-medium">{t("product_quantity")}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border border-[rgba(128,0,32,0.12)] flex items-center justify-center text-[#800020] hover:border-[#800020] transition-colors active:scale-[0.97]">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-[#2D000A] text-lg">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-full border border-[rgba(128,0,32,0.12)] flex items-center justify-center text-[#800020] hover:border-[#800020] transition-colors active:scale-[0.97]">
                    <Plus size={14} />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between border-t border-[rgba(128,0,32,0.08)] pt-4">
                <span className="font-bold text-[#2D000A]">{t("product_total")}</span>
                <span className="font-playfair font-bold text-[#800020] text-xl">QAR {product.price * quantity}</span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={cn(
                "w-full mt-4 font-bold py-4 rounded-2xl transition-all duration-300 font-playfair tracking-wide flex items-center justify-center gap-2",
                adding ? "bg-[#FF6B9D]/50 text-white/50 cursor-not-allowed" : "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
              )}
            >
              {adding ? (
                <>
                  <span className="w-4 h-4 border-2 border-[#800020]/40 border-t-[#800020] rounded-full animate-spin" />
                  <span>{t("product_adding")}</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span>{t("product_add_to_cart")}</span>
                </>
              )}
            </button>

            <p className="text-center text-[#800020]/50 text-xs mt-3">{t("product_freshness_note")}</p>
          </div>
        </div>
      </div>
    </main>
  );
}
