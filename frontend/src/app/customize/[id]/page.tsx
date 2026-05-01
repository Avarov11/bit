"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Layers,
  ChefHat,
  Palette,
  Sparkles,
  PenLine,
  CheckCircle2,
  Search,
  Check,
} from "lucide-react";
import { menuProducts } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const shapes = [
  {
    id: "mini",
    name: "Mini Box",
    serving: "Good for 2–4 people",
    weight: "6 pcs",
    dimensions: "4×4 box",
    price: 55,
    image:
      "https://images.unsplash.com/photo-1589375462213-0f5a6a76c2c8?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "small-standard",
    name: "Small Box",
    serving: "Good for 5–8 people",
    weight: "9 pcs",
    dimensions: "6×4 box",
    price: 75,
    image:
      "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "small-heart",
    name: "Heart Box",
    serving: "Good for 5–8 people",
    weight: "9 pcs",
    dimensions: "Heart-shaped",
    price: 85,
    image:
      "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "standard",
    name: "Standard Box",
    serving: "Good for 12–16 people",
    weight: "16 pcs",
    dimensions: "8×6 box",
    price: 110,
    image:
      "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "large-box",
    name: "Large Box",
    serving: "Good for 20–25 people",
    weight: "24 pcs",
    dimensions: "10×8 box",
    price: 150,
    image:
      "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "party-tray",
    name: "Party Tray",
    serving: "Good for 30+ people",
    weight: "36 pcs",
    dimensions: "Full tray",
    price: 210,
    image:
      "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80",
  },
];

const flavors = [
  { id: "vanilla", name: "Vanilla Blondie", emoji: "🤍", description: "Chewy blondie base with Madagascar vanilla bean", addOn: 0 },
  { id: "red-velvet", name: "Red Velvet", emoji: "❤️", description: "Velvety cocoa brownie swirled with cream cheese", addOn: 15 },
  { id: "chocolate", name: "Chocolate Fudge", emoji: "🍫", description: "Double-chocolate brownie with Belgian dark chips", addOn: 10 },
  { id: "pistachio", name: "Pistachio Rose", emoji: "💚", description: "Blondie with Iranian pistachio cream & rose water", addOn: 20 },
  { id: "lemon", name: "Lemon Blondie", emoji: "🍋", description: "Zesty blondie with Sicilian lemon curd swirl", addOn: 10 },
  { id: "caramel", name: "Salted Caramel", emoji: "🧡", description: "Gooey caramel brownie topped with fleur de sel", addOn: 15 },
  { id: "strawberry", name: "Strawberry Swirl", emoji: "🍓", description: "White chocolate brownie with fresh strawberry jam", addOn: 12 },
  { id: "matcha", name: "Matcha Blondie", emoji: "🍵", description: "Earthy blondie base with ceremonial matcha swirl", addOn: 18 },
];

const colors = [
  { id: "white", name: "White", hex: "#FFFFFF" },
  { id: "ivory", name: "Ivory", hex: "#FFF8E7" },
  { id: "cream", name: "Cream", hex: "#FDF0D5" },
  { id: "blush", name: "Blush Pink", hex: "#FFB5C8" },
  { id: "rose-gold", name: "Rose Gold", hex: "#E8A598" },
  { id: "peach", name: "Peach", hex: "#FFCBA4" },
  { id: "lavender", name: "Lavender", hex: "#C8B2D8" },
  { id: "sage", name: "Sage Green", hex: "#B2D8C3" },
  { id: "mint", name: "Mint", hex: "#B2D8D0" },
  { id: "dusty-blue", name: "Dusty Blue", hex: "#B2C8D8" },
  { id: "burgundy", name: "Burgundy", hex: "#800020" },
  { id: "charcoal", name: "Charcoal", hex: "#4A4A4A" },
];

type ToppingCategory = "All" | "Fruits" | "Flowers" | "Chocolate" | "Sprinkles" | "Nuts";

const toppings: {
  id: string;
  name: string;
  category: Exclude<ToppingCategory, "All">;
  price: number;
  emoji: string;
}[] = [
  { id: "strawberry", name: "Strawberries", category: "Fruits", price: 8, emoji: "🍓" },
  { id: "blueberry", name: "Blueberries", category: "Fruits", price: 6, emoji: "🫐" },
  { id: "raspberry", name: "Raspberries", category: "Fruits", price: 10, emoji: "🍒" },
  { id: "fig", name: "Fresh Figs", category: "Fruits", price: 12, emoji: "🍈" },
  { id: "edible-roses", name: "Edible Roses", category: "Flowers", price: 12, emoji: "🌹" },
  { id: "lavender", name: "Lavender Sprigs", category: "Flowers", price: 8, emoji: "💜" },
  { id: "babys-breath", name: "Baby's Breath", category: "Flowers", price: 6, emoji: "🌸" },
  { id: "jasmine", name: "Jasmine Buds", category: "Flowers", price: 10, emoji: "🌼" },
  { id: "choc-drizzle", name: "Chocolate Drizzle", category: "Chocolate", price: 5, emoji: "🍫" },
  { id: "choc-shards", name: "Chocolate Shards", category: "Chocolate", price: 8, emoji: "🔪" },
  { id: "cocoa-dust", name: "Cocoa Dusting", category: "Chocolate", price: 3, emoji: "✨" },
  { id: "gold-leaf", name: "Gold Leaf", category: "Chocolate", price: 15, emoji: "🥇" },
  { id: "rainbow-sprinkles", name: "Rainbow Sprinkles", category: "Sprinkles", price: 4, emoji: "🌈" },
  { id: "gold-sprinkles", name: "Gold Sprinkles", category: "Sprinkles", price: 6, emoji: "⭐" },
  { id: "pearl-sprinkles", name: "Pearl Balls", category: "Sprinkles", price: 5, emoji: "⚪" },
  { id: "pistachio", name: "Pistachio Crumble", category: "Nuts", price: 7, emoji: "💚" },
  { id: "almond", name: "Almond Flakes", category: "Nuts", price: 6, emoji: "🌰" },
  { id: "walnut", name: "Walnut Pieces", category: "Nuts", price: 5, emoji: "🟤" },
];

const fontStyles = [
  { id: "serif", name: "Classic Serif", preview: "Happy Birthday", family: "Georgia, serif" },
  { id: "script", name: "Modern Script", preview: "Happy Birthday", family: "Brush Script MT, cursive" },
  { id: "bold", name: "Bold Block", preview: "Happy Birthday", family: "Impact, sans-serif" },
  { id: "handwritten", name: "Handwritten", preview: "Happy Birthday", family: "Segoe Script, cursive" },
];

const placements = ["Center Top", "Center Middle", "Center Bottom", "Border Frame"];

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  { id: "shape", label: "Shape", Icon: Layers },
  { id: "flavor", label: "Flavor", Icon: ChefHat },
  { id: "color", label: "Color", Icon: Palette },
  { id: "toppings", label: "Toppings", Icon: Sparkles },
  { id: "write", label: "Write & Print", Icon: PenLine },
];

interface Selections {
  shapeId: string;
  flavorId: string;
  colorId: string;
  toppingIds: string[];
  message: string;
  fontStyleId: string;
  placement: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const product = menuProducts.find((p) => p.id === params.id) ?? menuProducts[0];
  const addToCart = useCartStore((s) => s.addItem);

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selections>({
    shapeId: "",
    flavorId: "",
    colorId: "",
    toppingIds: [],
    message: "",
    fontStyleId: "serif",
    placement: "Center Middle",
  });

  const [toppingSearch, setToppingSearch] = useState("");
  const [toppingCat, setToppingCat] = useState<ToppingCategory>("All");

  const totalPrice = useMemo(() => {
    const base = shapes.find((s) => s.id === sel.shapeId)?.price ?? product.price;
    const flavor = flavors.find((f) => f.id === sel.flavorId)?.addOn ?? 0;
    const tops = toppings
      .filter((t) => sel.toppingIds.includes(t.id))
      .reduce((sum, t) => sum + t.price, 0);
    const write = sel.message.trim() ? 10 : 0;
    return base + flavor + tops + write;
  }, [sel, product.price]);

  const previewImage =
    shapes.find((s) => s.id === sel.shapeId)?.image ?? product.image;

  const isStepCompleted = (i: number) => {
    if (i === 0) return !!sel.shapeId;
    if (i === 1) return !!sel.flavorId;
    if (i === 2) return !!sel.colorId;
    if (i === 3) return sel.toppingIds.length > 0;
    if (i === 4) return !!sel.message.trim();
    return false;
  };

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      addToCart({
        productId: params.id,
        productName: product.name,
        productImage: previewImage,
        quantity: 1,
        unitPrice: totalPrice,
        customization: {
          shape: shapes.find((s) => s.id === sel.shapeId)?.name,
          flavor: flavors.find((f) => f.id === sel.flavorId)?.name,
          color: colors.find((c) => c.id === sel.colorId)?.name,
          toppings: toppings
            .filter((t) => sel.toppingIds.includes(t.id))
            .map((t) => t.name),
          message: sel.message || undefined,
          fontStyle: fontStyles.find((f) => f.id === sel.fontStyleId)?.name,
          placement: sel.placement || undefined,
        },
      });
      router.push("/cart");
    }
  };

  const toggleTopping = (id: string) => {
    setSel((prev) => ({
      ...prev,
      toppingIds: prev.toppingIds.includes(id)
        ? prev.toppingIds.filter((t) => t !== id)
        : [...prev.toppingIds, id],
    }));
  };

  const filteredToppings = toppings.filter((t) => {
    const matchCat = toppingCat === "All" || t.category === toppingCat;
    const matchSearch = t.name.toLowerCase().includes(toppingSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  // ─── Step content renderers ─────────────────────────────────────────────────

  const ShapeStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Choose Size & Style</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">Select the perfect box size for your occasion</p>
      <div className="grid grid-cols-2 gap-3">
        {shapes.map((shape) => {
          const selected = sel.shapeId === shape.id;
          return (
            <button
              key={shape.id}
              onClick={() => setSel((p) => ({ ...p, shapeId: shape.id }))}
              className={cn(
                "relative rounded-2xl border-2 p-3 text-left transition-all duration-300 bg-white active:scale-[0.97]",
                selected
                  ? "border-[#3D0A14] shadow-warm-md"
                  : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40 hover:shadow-warm-sm"
              )}
            >
              {selected && (
                <CheckCircle2
                  size={18}
                  className="absolute top-2.5 right-2.5 text-[#3D0A14] fill-[#F5E4E6]"
                />
              )}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5E4E6] mb-3">
                <Image src={shape.image} alt={shape.name} fill sizes="(max-width: 768px) 45vw, 200px" className="object-cover" />
              </div>
              <h3 className="font-semibold text-[#1A0A0A] text-sm mb-0.5">{shape.name}</h3>
              <p className="text-[#9E7B7B] text-[11px] mb-0.5">{shape.serving}</p>
              <p className="text-[#9E7B7B] text-[11px]">
                {shape.weight} &nbsp;|&nbsp; {shape.dimensions}
              </p>
              <p className={cn("font-bold text-sm mt-2", selected ? "text-[#3D0A14]" : "text-[#4A3728]")}>
                {shape.price} QAR
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const FlavorStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Choose Flavor</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">Pick the taste that makes every bite count</p>
      <div className="grid grid-cols-2 gap-3">
        {flavors.map((flavor) => {
          const selected = sel.flavorId === flavor.id;
          return (
            <button
              key={flavor.id}
              onClick={() => setSel((p) => ({ ...p, flavorId: flavor.id }))}
              className={cn(
                "relative rounded-2xl border-2 p-4 text-left transition-all duration-300 bg-white active:scale-[0.97]",
                selected
                  ? "border-[#3D0A14] shadow-warm-md"
                  : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40 hover:shadow-warm-sm"
              )}
            >
              {selected && (
                <CheckCircle2
                  size={16}
                  className="absolute top-3 right-3 text-[#3D0A14] fill-[#F5E4E6]"
                />
              )}
              <span className="text-2xl mb-2 block">{flavor.emoji}</span>
              <h3 className="font-semibold text-[#1A0A0A] text-sm mb-1">{flavor.name}</h3>
              <p className="text-[#9E7B7B] text-[11px] mb-2 leading-snug">{flavor.description}</p>
              <span
                className={cn(
                  "text-xs font-bold",
                  flavor.addOn > 0 ? "text-[#3D0A14]" : "text-[#9E7B7B]"
                )}
              >
                {flavor.addOn > 0 ? `+${flavor.addOn} QAR` : "Included"}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ColorStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Choose Color</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">Select the frosting color for your brownies</p>
      <div className="grid grid-cols-4 gap-2">
        {colors.map((color) => {
          const selected = sel.colorId === color.id;
          return (
            <button
              key={color.id}
              onClick={() => setSel((p) => ({ ...p, colorId: color.id }))}
              className={cn(
                "flex flex-col items-center gap-2 p-2.5 rounded-xl transition-all duration-200 active:scale-[0.97]",
                selected ? "bg-[#F5E4E6]" : "hover:bg-[#F5E4E6]"
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "w-12 h-12 rounded-full border-4 transition-all duration-200",
                    selected
                      ? "border-[#3D0A14] scale-110 shadow-warm-md"
                      : "border-[rgba(26,10,10,0.12)]",
                    color.id === "white" && !selected && "border-[rgba(26,10,10,0.15)]"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      size={14}
                      className={color.id === "white" || color.id === "ivory" || color.id === "cream" ? "text-[#4A3728]" : "text-white"}
                      strokeWidth={3}
                    />
                  </span>
                )}
              </div>
              <span className="text-[10px] text-[#4A3728] font-medium text-center leading-tight">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const toppingCategories: ToppingCategory[] = [
    "All", "Fruits", "Flowers", "Chocolate", "Sprinkles", "Nuts",
  ];

  const ToppingsStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Choose Toppings</h2>
      <p className="text-[#9E7B7B] text-sm mb-4">
        Select as many as you like — each adds to your total
      </p>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E7B7B]" />
        <input
          type="text"
          value={toppingSearch}
          onChange={(e) => setToppingSearch(e.target.value)}
          placeholder="Search toppings…"
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[rgba(26,10,10,0.08)] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none focus:border-[#3D0A14] transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {toppingCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setToppingCat(cat)}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
              toppingCat === cat
                ? "bg-[#3D0A14] text-white shadow-warm-sm"
                : "bg-white text-[#4A3728] hover:bg-[#F5E4E6] border border-[rgba(26,10,10,0.07)]"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {sel.toppingIds.length > 0 && (
        <div className="mb-4 p-3 bg-[#F5E4E6] border border-[#3D0A14]/20 rounded-xl">
          <p className="text-xs font-semibold text-[#3D0A14]">
            {sel.toppingIds.length} topping{sel.toppingIds.length > 1 ? "s" : ""} selected
            {" "}·{" "}
            +{toppings
              .filter((t) => sel.toppingIds.includes(t.id))
              .reduce((s, t) => s + t.price, 0)}{" "}
            QAR
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-2">
        {filteredToppings.map((topping) => {
          const selected = sel.toppingIds.includes(topping.id);
          return (
            <button
              key={topping.id}
              onClick={() => toggleTopping(topping.id)}
              className={cn(
                "relative rounded-xl border-2 p-3 text-center transition-all duration-200 bg-white active:scale-[0.97]",
                selected
                  ? "border-[#3D0A14] bg-[#F5E4E6] shadow-warm-sm"
                  : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40"
              )}
            >
              {selected && (
                <span className="absolute top-1.5 right-1.5">
                  <Check size={10} className="text-[#3D0A14]" strokeWidth={3} />
                </span>
              )}
              <span className="text-xl block mb-1">{topping.emoji}</span>
              <p className="text-[10px] font-semibold text-[#1A0A0A] leading-tight mb-0.5">
                {topping.name}
              </p>
              <p className={cn("text-[10px] font-bold", selected ? "text-[#3D0A14]" : "text-[#9E7B7B]")}>
                +{topping.price} QAR
              </p>
            </button>
          );
        })}

        {filteredToppings.length === 0 && (
          <div className="col-span-3 text-center py-8 text-[#9E7B7B] text-sm">
            No toppings match your search
          </div>
        )}
      </div>
    </div>
  );

  const WriteStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Write & Print</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">
        Add a personalised message · +10 QAR
      </p>

      <div className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-2">
            Your Message
          </label>
          <textarea
            value={sel.message}
            onChange={(e) =>
              setSel((p) => ({ ...p, message: e.target.value.slice(0, 50) }))
            }
            placeholder="e.g. Happy Birthday Sarah! 🎂"
            rows={3}
            className="w-full px-4 py-3 bg-white border border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors resize-none"
          />
          <p className="text-right text-xs text-[#9E7B7B] mt-1">
            {sel.message.length}/50
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-3">
            Font Style
          </label>
          <div className="grid grid-cols-2 gap-3">
            {fontStyles.map((font) => {
              const selected = sel.fontStyleId === font.id;
              return (
                <button
                  key={font.id}
                  onClick={() => setSel((p) => ({ ...p, fontStyleId: font.id }))}
                  className={cn(
                    "relative rounded-xl border-2 p-3 text-center transition-all duration-300 bg-white active:scale-[0.97]",
                    selected
                      ? "border-[#3D0A14] shadow-warm-md"
                      : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40 hover:shadow-warm-sm"
                  )}
                >
                  {selected && (
                    <span className="absolute top-2 right-2">
                      <Check size={12} className="text-[#3D0A14]" strokeWidth={3} />
                    </span>
                  )}
                  <p
                    className="text-[#4A3728] text-sm mb-1"
                    style={{ fontFamily: font.family }}
                  >
                    {sel.message.trim() || font.preview}
                  </p>
                  <p className="text-[10px] text-[#9E7B7B] font-semibold">{font.name}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-3">
            Message Placement
          </label>
          <div className="grid grid-cols-2 gap-2">
            {placements.map((p) => {
              const selected = sel.placement === p;
              return (
                <button
                  key={p}
                  onClick={() => setSel((prev) => ({ ...prev, placement: p }))}
                  className={cn(
                    "rounded-xl border-2 py-3 text-center text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
                    selected
                      ? "border-[#3D0A14] bg-[#3D0A14] text-white shadow-warm-sm"
                      : "border-[rgba(26,10,10,0.10)] text-[#4A3728] hover:border-[#3D0A14]/40 bg-white"
                  )}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  const stepContent = [
    <ShapeStep key="shape" />,
    <FlavorStep key="flavor" />,
    <ColorStep key="color" />,
    <ToppingsStep key="toppings" />,
    <WriteStep key="write" />,
  ];

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#C896A0" }}>
      {/* ── Fixed header ── */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#C896A0]/97 backdrop-blur-md border-b border-[rgba(26,10,10,0.10)] shadow-warm-xs h-14 flex items-center px-4 md:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#9E7B7B] hover:text-[#3D0A14] transition-colors mr-3"
          aria-label="Go back"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-playfair font-semibold text-[#1A0A0A] text-lg flex-1">
          {product.name}
        </h1>
        <div className="text-right">
          <p className="text-[10px] text-[#9E7B7B] uppercase tracking-wider leading-none mb-0.5">
            Total
          </p>
          <p className="font-playfair text-lg font-bold text-[#3D0A14] leading-none">
            QAR {totalPrice}
          </p>
        </div>
      </header>

      {/* ── Main layout ── */}
      <div className="flex flex-1 pt-14 pb-20">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-20 shrink-0 fixed left-0 top-14 bottom-20 bg-white border-r border-[rgba(26,10,10,0.06)] shadow-warm-xs py-4 overflow-y-auto">
          {steps.map((s, i) => {
            const active = i === step;
            const completed = isStepCompleted(i) && i !== step;
            return (
              <button
                key={s.id}
                onClick={() => setStep(i)}
                className={cn(
                  "flex flex-col items-center gap-1.5 py-4 px-2 transition-all duration-300 relative",
                  active ? "text-white" : completed ? "text-[#3D0A14]" : "text-[#9E7B7B]"
                )}
              >
                {active && (
                  <span className="absolute inset-x-2 inset-y-1 bg-[#3D0A14] rounded-xl shadow-warm-sm" />
                )}
                <span className="relative z-10">
                  {completed ? (
                    <CheckCircle2 size={20} className="fill-[#F5E4E6]" />
                  ) : (
                    <s.Icon size={20} />
                  )}
                </span>
                <span
                  className={cn(
                    "relative z-10 text-[10px] font-bold leading-tight text-center",
                    active ? "text-white" : completed ? "text-[#3D0A14]" : "text-[#9E7B7B]"
                  )}
                >
                  {s.label.split(" ").map((w, wi) => (
                    <span key={wi} className="block">{w}</span>
                  ))}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Scrollable content */}
        <main className="flex-1 md:ml-20 flex flex-col">
          {/* Mobile step tabs */}
          <div className="md:hidden flex border-b border-[rgba(26,10,10,0.06)] bg-white overflow-x-auto">
            {steps.map((s, i) => {
              const active = i === step;
              const completed = isStepCompleted(i) && i !== step;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={cn(
                    "shrink-0 flex flex-col items-center gap-1 py-3 px-4 border-b-2 transition-all duration-200",
                    active
                      ? "border-[#3D0A14] text-[#3D0A14]"
                      : completed
                      ? "border-transparent text-[#3D0A14]/60"
                      : "border-transparent text-[#9E7B7B]"
                  )}
                >
                  {completed ? <CheckCircle2 size={16} /> : <s.Icon size={16} />}
                  <span className="text-[10px] font-bold">{s.label.split(" ")[0]}</span>
                </button>
              );
            })}
          </div>

          {/* Brownie preview image */}
          <div className="relative h-56 md:h-72 bg-[#1A0A0A] overflow-hidden">
            <Image
              src={previewImage}
              alt="Brownie preview"
              fill
              sizes="100vw"
              className="object-cover opacity-80 transition-opacity duration-500"
            />
            {sel.colorId && (
              <div
                className="absolute inset-0 opacity-15 mix-blend-overlay transition-colors duration-500"
                style={{
                  backgroundColor:
                    colors.find((c) => c.id === sel.colorId)?.hex ?? "transparent",
                }}
              />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/70 via-[#1A0A0A]/10 to-transparent" />

            <div className="absolute bottom-4 left-4">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                Step {step + 1} of {steps.length}
              </span>
              <h2 className="font-playfair text-white text-2xl font-bold leading-tight">
                {steps[step].label}
              </h2>
            </div>

            {sel.colorId && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#1A0A0A]/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/50"
                  style={{ backgroundColor: colors.find((c) => c.id === sel.colorId)?.hex }}
                />
                <span className="text-white text-xs font-medium">
                  {colors.find((c) => c.id === sel.colorId)?.name}
                </span>
              </div>
            )}
          </div>

          {/* Step content */}
          <div className="flex-1 p-4 md:p-6">{stepContent[step]}</div>
        </main>
      </div>

      {/* ── Fixed Next button ── */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-[#C896A0]/97 backdrop-blur-md border-t border-[rgba(26,10,10,0.10)] shadow-warm-sm p-4 md:pl-24">
        <button
          onClick={handleNext}
          className="w-full bg-[#3D0A14] hover:bg-[#2D0810] text-white font-bold py-4 rounded-2xl transition-all duration-300 hover:shadow-warm-lg shadow-warm-sm active:scale-[0.97] font-playfair text-base tracking-wide"
        >
          {step === steps.length - 1 ? "Confirm Order" : `Next  →`}
        </button>
      </footer>
    </div>
  );
}
