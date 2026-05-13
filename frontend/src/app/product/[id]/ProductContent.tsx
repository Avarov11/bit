"use client";

import { useState } from "react";
import Image from "next/image";
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
};

const catKeyMap: Record<string, string> = {
  Customized: "cat_customized", Accessories: "cat_accessories", Boxes: "cat_boxes",
  Birthday: "cat_birthday", Congrats: "cat_congrats", Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon", "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal", Candles: "cat_candles", Balloons: "cat_balloons",
};

export default function ProductContent({ product }: { product: DbProduct }) {
  const router  = useRouter();
  const { t, lang }    = useLanguage();
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding]     = useState(false);

  const displayName = lang === "ar" ? (product.name_ar ?? product.name) : product.name;
  const displayDesc = lang === "ar" ? (product.description_ar ?? product.description ?? "") : (product.description ?? "");
  const badgeKey    = product.subcategory ?? product.category;

  const handleAddToCart = () => {
    setAdding(true);
    addItem({
      productId:    product.id,
      productName:  product.name,
      productImage: product.image_url || "",
      quantity,
      unitPrice:    product.price,
      customization: {},
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
          <div className="relative w-full md:w-[420px] shrink-0 aspect-square rounded-2xl overflow-hidden bg-[#F5D0D8] shadow-warm-md">
            <Image
              src={product.image_url || "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80"}
              alt={displayName}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
              priority
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

            <div className="bg-white rounded-2xl shadow-warm-xs p-5 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-[#A05068] text-sm font-medium">{t("product_price_per_box")}</span>
                <span className="font-playfair font-bold text-[#800020] text-2xl">QAR {product.price}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#A05068] text-sm font-medium">{t("product_quantity")}</span>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border border-[rgba(128,0,32,0.12)] flex items-center justify-center text-[#800020] hover:border-[#800020] hover:text-[#800020] transition-colors active:scale-[0.97]">
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-[#2D000A] text-lg">{quantity}</span>
                  <button onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-full border border-[rgba(128,0,32,0.12)] flex items-center justify-center text-[#800020] hover:border-[#800020] hover:text-[#800020] transition-colors active:scale-[0.97]">
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
