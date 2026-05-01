"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import { menuProducts } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

const categoryBadge: Record<string, string> = {
  Customized:      "bg-gold-light text-gold-dark",
  Birthday:        "bg-burgundy-light text-burgundy-dark",
  Congrats:        "bg-[#D6F0E8] text-[#2D7A5C]",
  Graduation:      "bg-[#DAE4F5] text-[#2D4A7A]",
  "Get Well Soon": "bg-[#D6F0EC] text-[#2D7A6A]",
  "Bride to Be":   "bg-[#F5E4F0] text-[#7A2D6A]",
  "Gender Reveal": "bg-[#EDE4F5] text-[#6B3FA0]",
};

const catKeyMap: Record<string, string> = {
  Customized: "cat_customized",
  Birthday: "cat_birthday",
  Congrats: "cat_congrats",
  Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon",
  "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal",
};

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLanguage();
  const product = menuProducts.find((p) => p.id === params.id);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  const nameKey = `product_name_${params.id.replace(/-/g, "_")}`;
  const descKey = `product_desc_${params.id.replace(/-/g, "_")}`;

  if (!product) {
    return (
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#C896A0" }}>
        <p data-i18n="product_not_found" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-3">
          {t("product_not_found")}
        </p>
        <Link href="/menu" data-i18n="product_back_to_menu" className="text-[#3D0A14] font-semibold hover:underline">
          {t("product_back_to_menu")}
        </Link>
      </main>
    );
  }

  const handleAddToCart = () => {
    setAdding(true);
    addItem({
      productId: product.id,
      productName: product.name,
      productImage: product.image,
      quantity,
      unitPrice: product.price,
      customization: {},
    });
    setTimeout(() => router.push("/cart"), 700);
  };

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-12" style={{ backgroundColor: "#C896A0" }}>
      {/* Header */}
      <div className="border-b border-[rgba(26,10,10,0.10)] px-6 md:px-12 py-5">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="text-[#9E7B7B] hover:text-[#3D0A14] transition-colors"
          >
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 data-i18n={nameKey} className="font-playfair text-xl md:text-2xl font-bold text-[#1A0A0A]">
              {t(nameKey)}
            </h1>
            <p data-i18n={catKeyMap[product.category] ?? ""} className="text-[#3D0A14]/60 text-sm">
              {t(catKeyMap[product.category] ?? product.category)}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Image */}
          <div className="relative w-full md:w-[420px] shrink-0 aspect-square rounded-2xl overflow-hidden bg-[#F5E4E6] shadow-warm-md">
            <Image
              src={product.image}
              alt={t(nameKey)}
              fill
              sizes="(max-width: 768px) 100vw, 420px"
              className="object-cover"
              priority
            />
            {product.tag && (
              <span className="absolute top-3 left-3 bg-[#3D0A14] text-white text-[10px] font-bold px-3 py-1 rounded-full tracking-wide uppercase">
                {product.tag}
              </span>
            )}
          </div>

          {/* Details */}
          <div className="flex-1 w-full">
            <span
              data-i18n={catKeyMap[product.category] ?? ""}
              className={cn(
                "inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-4",
                categoryBadge[product.category] ?? "bg-[#F5E4E6] text-[#4A3728]"
              )}
            >
              {t(catKeyMap[product.category] ?? product.category)}
            </span>

            <h2 data-i18n={nameKey} className="font-playfair text-3xl md:text-4xl font-bold text-[#1A0A0A] mb-3">
              {t(nameKey)}
            </h2>

            <p data-i18n={descKey} className="text-[#4A3728] text-base leading-relaxed mb-6">
              {t(descKey)}
            </p>

            <div className="bg-white rounded-2xl shadow-warm-xs p-5 space-y-5">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span data-i18n="product_price_per_box" className="text-[#9E7B7B] text-sm font-medium">
                  {t("product_price_per_box")}
                </span>
                <span className="font-playfair font-bold text-[#3D0A14] text-2xl">
                  QAR {product.price}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span data-i18n="product_quantity" className="text-[#9E7B7B] text-sm font-medium">
                  {t("product_quantity")}
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-9 h-9 rounded-full border border-[rgba(26,10,10,0.12)] flex items-center justify-center text-[#4A3728] hover:border-[#3D0A14] hover:text-[#3D0A14] transition-colors active:scale-[0.97]"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-8 text-center font-bold text-[#1A0A0A] text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-9 h-9 rounded-full border border-[rgba(26,10,10,0.12)] flex items-center justify-center text-[#4A3728] hover:border-[#3D0A14] hover:text-[#3D0A14] transition-colors active:scale-[0.97]"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-[rgba(26,10,10,0.08)] pt-4">
                <span data-i18n="product_total" className="font-bold text-[#1A0A0A]">
                  {t("product_total")}
                </span>
                <span className="font-playfair font-bold text-[#3D0A14] text-xl">
                  QAR {product.price * quantity}
                </span>
              </div>
            </div>

            <button
              onClick={handleAddToCart}
              disabled={adding}
              className={cn(
                "w-full mt-4 font-bold py-4 rounded-2xl transition-all duration-300 font-playfair tracking-wide text-white flex items-center justify-center gap-2",
                adding
                  ? "bg-[#9E7B7B] cursor-not-allowed"
                  : "bg-[#3D0A14] hover:bg-[#2D0810] shadow-warm-sm hover:shadow-warm-lg active:scale-[0.97]"
              )}
            >
              {adding ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span data-i18n="product_adding">{t("product_adding")}</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  <span data-i18n="product_add_to_cart">{t("product_add_to_cart")}</span>
                </>
              )}
            </button>

            <p data-i18n="product_freshness_note" className="text-center text-[#3D0A14]/50 text-xs mt-3">
              {t("product_freshness_note")}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
