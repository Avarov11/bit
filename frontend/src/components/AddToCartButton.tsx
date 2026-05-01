"use client";

import { useState } from "react";
import { ShoppingBag, Check } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

interface Props {
  overlay?: boolean;
  productId?: string;
  productName?: string;
  productImage?: string;
  unitPrice?: number;
}

export default function AddToCartButton({
  overlay = false,
  productId = "item",
  productName = "Item",
  productImage = "",
  unitPrice = 0,
}: Props) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem({
      productId,
      productName,
      productImage,
      quantity: 1,
      unitPrice,
      customization: {},
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  if (overlay) {
    return (
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 border rounded-full px-4 py-1.5 text-xs font-semibold tracking-wide transition-all duration-300",
          added
            ? "bg-emerald-500 border-emerald-500 text-white"
            : "border-white text-white hover:bg-white hover:text-stone-900"
        )}
      >
        {added ? <Check size={12} /> : <ShoppingBag size={12} />}
        {added ? "Added!" : "Add to Cart"}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300",
        added
          ? "bg-emerald-600 text-white scale-95"
          : "bg-burgundy hover:bg-burgundy-dark text-white hover:shadow-md hover:shadow-burgundy/20"
      )}
    >
      {added ? <Check size={14} /> : <ShoppingBag size={14} />}
      {added ? "Added!" : "Add to Cart"}
    </button>
  );
}
