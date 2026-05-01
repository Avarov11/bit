"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Plus, Minus, ShoppingBag } from "lucide-react";
import { menuProducts } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
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

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const product = menuProducts.find((p) => p.id === params.id);
  const addItem = useCartStore((s) => s.addItem);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);

  if (!product) {
    return (
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#C896A0" }}>
        <p className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-3">Product not found</p>
        <Link href="/menu" className="text-[#3D0A14] font-semibold hover:underline">
          Back to menu →
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
            <h1 className="font-playfair text-xl md:text-2xl font-bold text-[#1A0A0A]">
              {product.name}
            </h1>
            <p className="text-[#3D0A14]/60 text-sm">{product.category}</p>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col md:flex-row gap-8 items-start">
          {/* Image */}
          <div className="relative w-full md:w-[420px] shrink-0 aspect-square rounded-2xl overflow-hidden bg-[#F5E4E6] shadow-warm-md">
            <Image
              src={product.image}
              alt={product.name}
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
              className={cn(
                "inline-block text-[11px] font-bold px-3 py-1 rounded-full mb-4",
                categoryBadge[product.category] ?? "bg-[#F5E4E6] text-[#4A3728]"
              )}
            >
              {product.category}
            </span>

            <h2 className="font-playfair text-3xl md:text-4xl font-bold text-[#1A0A0A] mb-3">
              {product.name}
            </h2>

            <p className="text-[#4A3728] text-base leading-relaxed mb-6">
              {product.description}
            </p>

            <div className="bg-white rounded-2xl shadow-warm-xs p-5 space-y-5">
              {/* Price */}
              <div className="flex items-center justify-between">
                <span className="text-[#9E7B7B] text-sm font-medium">Price per box</span>
                <span className="font-playfair font-bold text-[#3D0A14] text-2xl">
                  QAR {product.price}
                </span>
              </div>

              {/* Quantity */}
              <div className="flex items-center justify-between">
                <span className="text-[#9E7B7B] text-sm font-medium">Quantity</span>
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
                <span className="font-bold text-[#1A0A0A]">Total</span>
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
                  Adding to Cart…
                </>
              ) : (
                <>
                  <ShoppingBag size={18} />
                  Add to Cart
                </>
              )}
            </button>

            <p className="text-center text-[#3D0A14]/50 text-xs mt-3">
              🍫 Baked fresh — ready for pickup in 24–48 hours
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
