"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { X, Plus, Minus, ShoppingBag, ArrowRight, Trash2, ChevronLeft } from "lucide-react";
import { useCartStore, type CartItem } from "@/store/cartStore";
import { cn } from "@/lib/utils";

function CartCard({ item, onRemove, onQty }: {
  item: CartItem;
  onRemove: () => void;
  onQty: (q: number) => void;
}) {
  const { customization: c } = item;
  const summaryParts = [
    c.shape && `Shape: ${c.shape}`,
    c.flavor && `Flavor: ${c.flavor}`,
    c.color && `Color: ${c.color}`,
  ].filter(Boolean) as string[];

  return (
    <div className="bg-white rounded-2xl shadow-warm-xs hover:shadow-warm p-4 flex gap-4 transition-shadow duration-300">
      {/* Thumbnail */}
      <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden bg-[#F5E4E6] shrink-0">
        {item.productImage ? (
          <Image src={item.productImage} alt={item.productName} fill sizes="96px" className="object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={22} className="text-[#9E7B7B]" />
          </div>
        )}
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-playfair font-bold text-[#1A0A0A] text-base leading-tight">
            {item.productName}
          </h3>
          <button
            onClick={onRemove}
            className="text-[#9E7B7B]/60 hover:text-red-400 transition-colors shrink-0 p-0.5"
          >
            <X size={15} />
          </button>
        </div>

        {summaryParts.length > 0 && (
          <p className="text-[#9E7B7B] text-xs mb-0.5 line-clamp-1">{summaryParts.join(" · ")}</p>
        )}
        {c.toppings && c.toppings.length > 0 && (
          <p className="text-[#9E7B7B] text-xs mb-0.5">
            + {c.toppings.slice(0, 3).join(", ")}
            {c.toppings.length > 3 && ` & ${c.toppings.length - 3} more`}
          </p>
        )}
        {c.message && (
          <p className="text-[#9E7B7B] text-xs italic mb-1">&ldquo;{c.message}&rdquo;</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onQty(item.quantity - 1)}
              className="w-7 h-7 rounded-full border border-[rgba(26,10,10,0.12)] flex items-center justify-center text-[#4A3728] hover:border-[#3D0A14] hover:text-[#3D0A14] transition-colors"
            >
              <Minus size={11} />
            </button>
            <span className="w-5 text-center text-sm font-bold text-[#1A0A0A]">
              {item.quantity}
            </span>
            <button
              onClick={() => onQty(item.quantity + 1)}
              className="w-7 h-7 rounded-full border border-[rgba(26,10,10,0.12)] flex items-center justify-center text-[#4A3728] hover:border-[#3D0A14] hover:text-[#3D0A14] transition-colors"
            >
              <Plus size={11} />
            </button>
          </div>
          <span className="font-playfair font-bold text-[#3D0A14] text-lg">
            QAR {item.unitPrice * item.quantity}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const router = useRouter();
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return (
      <main className="min-h-screen pt-20 flex items-center justify-center" style={{ backgroundColor: "#C896A0" }}>
        <div className="w-8 h-8 rounded-full border-2 border-[#3D0A14] border-t-transparent animate-spin" />
      </main>
    );
  }

  const subtotal = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
  const itemCount = items.reduce((s, i) => s + i.quantity, 0);

  if (items.length === 0) {
    return (
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4" style={{ backgroundColor: "#C896A0" }}>
        <div className="text-center max-w-sm">
          <div className="w-24 h-24 rounded-full bg-[#F5E4E6] flex items-center justify-center mx-auto mb-6">
            <ShoppingBag size={34} className="text-[#3D0A14]" />
          </div>
          <h1 className="font-playfair text-3xl font-bold text-[#1A0A0A] mb-3">
            Your cart is empty
          </h1>
          <p className="text-[#3D0A14]/60 text-sm mb-8">
            Looks like you haven&apos;t added anything yet. Explore our menu
            and build your perfect order.
          </p>
          <Link
            href="/menu"
            className="inline-flex items-center gap-2 bg-[#3D0A14] hover:bg-[#2D0810] text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:-translate-y-0.5 shadow-warm-sm hover:shadow-warm-md active:scale-[0.97]"
          >
            Browse Menu <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-16 md:pt-20 pb-10" style={{ backgroundColor: "#C896A0" }}>
      {/* Header */}
      <div className="border-b border-[rgba(26,10,10,0.10)] px-6 md:px-12 py-6">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="text-[#9E7B7B] hover:text-[#3D0A14] transition-colors">
            <ChevronLeft size={22} />
          </button>
          <div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold text-[#1A0A0A]">
              My Cart
            </h1>
            <p className="text-[#3D0A14]/60 text-sm">
              {itemCount} item{itemCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 md:px-12 py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Cart items */}
          <div className="flex-1 w-full space-y-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[#3D0A14]/60 font-medium uppercase tracking-wider">
                Your Items
              </p>
              <button
                onClick={clearCart}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#9E7B7B] hover:text-red-400 transition-colors"
              >
                <Trash2 size={12} /> Clear all
              </button>
            </div>

            {items.map((item) => (
              <CartCard
                key={item.cartId}
                item={item}
                onRemove={() => removeItem(item.cartId)}
                onQty={(q) => updateQuantity(item.cartId, q)}
              />
            ))}

            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#3D0A14] hover:text-[#2D0810] transition-colors mt-2"
            >
              <ChevronLeft size={14} /> Continue Shopping
            </Link>
          </div>

          {/* Order summary */}
          <div className="w-full lg:w-80 xl:w-96 shrink-0">
            <div className="bg-white rounded-2xl shadow-warm-sm p-6 sticky top-24">
              <h2 className="font-playfair text-xl font-bold text-[#1A0A0A] mb-5">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4">
                {items.map((item) => (
                  <div key={item.cartId} className="flex justify-between text-sm">
                    <span className="text-[#4A3728] truncate pr-2">
                      {item.productName}
                      {item.quantity > 1 && (
                        <span className="text-[#9E7B7B] ml-1">×{item.quantity}</span>
                      )}
                    </span>
                    <span className="font-semibold text-[#1A0A0A] shrink-0">
                      QAR {item.unitPrice * item.quantity}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-[rgba(26,10,10,0.08)] pt-4 space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-[#9E7B7B]">Subtotal</span>
                  <span className="font-semibold text-[#1A0A0A]">QAR {subtotal}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[#9E7B7B]">Delivery</span>
                  <span className="text-emerald-600 font-semibold">Pickup only</span>
                </div>
                <div className="border-t border-[rgba(26,10,10,0.08)] pt-3 flex justify-between">
                  <span className="font-bold text-[#1A0A0A]">Total</span>
                  <span className="font-playfair font-bold text-[#3D0A14] text-xl">
                    QAR {subtotal}
                  </span>
                </div>
              </div>

              <div className="bg-[#F5E4E6] rounded-xl px-4 py-3 mb-5 text-xs text-[#4A3728] leading-relaxed">
                🍫 &nbsp;All brownies are baked fresh and ready for pickup at our boutique within 24–48 hours.
              </div>

              <button
                onClick={() => router.push("/checkout")}
                className="w-full bg-[#3D0A14] hover:bg-[#2D0810] text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-warm-lg shadow-warm-sm font-playfair tracking-wide flex items-center justify-center gap-2 active:scale-[0.97]"
              >
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
