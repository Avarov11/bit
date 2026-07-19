"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus, ShoppingBag } from "lucide-react";
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

const PICKER_CONFIG: Record<string, { api: string; key: "candleUrl" | "balloonUrl" | "cardUrl"; label: string }> = {
  Candles:  { api: "/api/candles",  key: "candleUrl",  label: "candle design"  },
  Balloons: { api: "/api/balloons", key: "balloonUrl", label: "balloon design" },
  Cards:    { api: "/api/cards",    key: "cardUrl",    label: "card design"    },
};

const EXTRA_ARRAY_KEY: Record<string, "candles" | "balloons" | "cards"> = {
  candleUrl:  "candles",
  balloonUrl: "balloons",
  cardUrl:    "cards",
};

export default function ProductContent({ product }: { product: DbProduct }) {
  const router        = useRouter();
  const { t, lang }   = useLanguage();
  const addItem       = useCartStore((s) => s.addItem);
  const [quantity,    setQuantity]   = useState(1);
  const [adding,      setAdding]     = useState(false);
  const [designs,     setDesigns]    = useState<{ name: string; url: string }[]>([]);
  // Per-design quantities for picker products (balloons / candles / cards)
  const [designQtys,  setDesignQtys] = useState<Record<string, number>>({});
  // Which design image is shown in the main preview
  const [previewUrl,  setPreviewUrl] = useState<string | null>(null);

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

  const mainImage = previewUrl ?? product.image_url ?? "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80";

  // Total balloon/candle/card count across all designs
  const totalPickerQty = Object.values(designQtys).reduce((a, b) => a + b, 0);

  const changeDesignQty = (url: string, delta: number) =>
    setDesignQtys((prev) => {
      const next = Math.max(0, (prev[url] ?? 0) + delta);
      return { ...prev, [url]: next };
    });

  const handleAddToCart = () => {
    setAdding(true);

    if (picker) {
      const selected = designs
        .filter((d) => (designQtys[d.url] ?? 0) > 0)
        .map((d) => ({ url: d.url, qty: designQtys[d.url] }));

      addItem({
        productId:    product.id,
        productName:  product.name,
        productImage: product.image_url || "",
        quantity:     totalPickerQty,
        unitPrice:    product.price,
        customization: { [EXTRA_ARRAY_KEY[picker.key]]: selected },
      });
    } else {
      addItem({
        productId:    product.id,
        productName:  product.name,
        productImage: product.image_url || "",
        quantity,
        unitPrice:    product.price,
        customization: {},
      });
    }

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
          {/* Main image — updates to tapped design */}
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

            {/* Per-design quantity picker — Balloons / Candles / Cards */}
            {picker && designs.length > 0 && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-bold text-[#2D000A]">Choose your designs</p>
                  {totalPickerQty > 0 && (
                    <button
                      onClick={() => setDesignQtys({})}
                      className="text-[11px] text-[#800020]/50 hover:text-[#800020] transition-colors"
                    >
                      Clear all
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {designs.map((d) => {
                    const qty = designQtys[d.url] ?? 0;
                    return (
                      <div key={d.url} className="flex flex-col items-center gap-1.5">
                        {/* Tap image to preview in main viewer */}
                        <button
                          onClick={() => setPreviewUrl(previewUrl === d.url ? null : d.url)}
                          className={cn(
                            "relative rounded-xl overflow-hidden border-2 w-full aspect-square transition-all duration-200 active:scale-95",
                            qty > 0
                              ? "border-[#800020] shadow-[0_0_0_3px_rgba(128,0,32,0.12)]"
                              : "border-[rgba(128,0,32,0.12)] hover:border-[#800020]/40",
                            previewUrl === d.url && "ring-2 ring-[#FF6B9D]/50"
                          )}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={d.url} alt={d.name} className="w-full h-full object-cover" />
                          {/* Qty badge in corner */}
                          {qty > 0 && (
                            <span className="absolute top-1.5 right-1.5 bg-[#800020] text-white text-[10px] font-bold min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center leading-none">
                              {qty}
                            </span>
                          )}
                        </button>

                        {/* +/- stepper below each card */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => changeDesignQty(d.url, -1)}
                            disabled={qty === 0}
                            className="w-7 h-7 rounded-full border border-[rgba(128,0,32,0.15)] flex items-center justify-center text-[#800020] disabled:opacity-25 hover:border-[#800020] transition-colors active:scale-[0.93]"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="w-5 text-center text-sm font-bold text-[#2D000A]">{qty}</span>
                          <button
                            onClick={() => changeDesignQty(d.url, +1)}
                            className="w-7 h-7 rounded-full border border-[rgba(128,0,32,0.15)] flex items-center justify-center text-[#800020] hover:border-[#800020] transition-colors active:scale-[0.93]"
                          >
                            <Plus size={11} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {totalPickerQty === 0 && (
                  <p className="text-[11px] text-[#A05068]/60 mt-3">
                    Use + to add quantity per design — tap an image to preview it
                  </p>
                )}
              </div>
            )}

            {/* Price / quantity / total box */}
            <div className="bg-white rounded-2xl shadow-warm-xs p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[#A05068] text-sm font-medium">
                  {picker ? `Price per ${picker.label.split(" ")[0]}` : t("product_price_per_box")}
                </span>
                <span className="font-playfair font-bold text-[#800020] text-2xl">QAR {product.price}</span>
              </div>

              {picker ? (
                /* Picker products: show total selected count */
                <div className="flex items-center justify-between">
                  <span className="text-[#A05068] text-sm font-medium">Selected</span>
                  <span className="font-bold text-[#2D000A] text-base">
                    {totalPickerQty > 0 ? `${totalPickerQty} ${totalPickerQty === 1 ? picker.label.split(" ")[0] : picker.label.split(" ")[0] + "s"}` : "—"}
                  </span>
                </div>
              ) : (
                /* Regular products: single quantity stepper */
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
              )}

              <div className="flex items-center justify-between border-t border-[rgba(128,0,32,0.08)] pt-4">
                <span className="font-bold text-[#2D000A]">{t("product_total")}</span>
                <span className="font-playfair font-bold text-[#800020] text-xl">
                  QAR {picker ? product.price * totalPickerQty : product.price * quantity}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding || (picker != null && totalPickerQty === 0)}
              className={cn(
                "w-full mt-4 font-bold py-4 rounded-2xl transition-all duration-300 font-playfair tracking-wide flex items-center justify-center gap-2",
                adding
                  ? "bg-[#FF6B9D]/50 text-white/50 cursor-not-allowed"
                  : picker != null && totalPickerQty === 0
                    ? "bg-[#FF6B9D]/30 text-white/40 cursor-not-allowed"
                    : "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
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
