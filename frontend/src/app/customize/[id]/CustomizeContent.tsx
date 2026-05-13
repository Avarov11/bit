"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Layers, ChefHat, Sparkles, Palette, CheckCircle2, Check } from "lucide-react";
import type { DbProduct } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

const shapes = [
  { id: "square",    name: "Square",    price: 85,  image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop&q=80" },
  { id: "heart",     name: "Heart",     price: 95,  image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=400&fit=crop&q=80" },
  { id: "full-cake", name: "Full Cake", price: 150, image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80" },
];

const chocolates = [
  { id: "milk",     name: "Milk Chocolate", emoji: "🍫" },
  { id: "hazelnut", name: "Hazelnut",        emoji: "🌰" },
  { id: "oreo",     name: "Oreo",            emoji: "⚫" },
  { id: "white",    name: "White Chocolate", emoji: "🤍" },
];

const CAKE_COLORS = [
  { id: "brown", name: "Brown", main: "#8B5E3C", dark: "#5C3C22", top: "#B07850" },
  { id: "white", name: "White", main: "#FFFFFF", dark: "#C8BEB8", top: "#FFFFFF" },
  { id: "pink",  name: "Pink",  main: "#FF6B9D", dark: "#C04070", top: "#FFB0C8" },
  { id: "blue",  name: "Blue",  main: "#B2C8D8", dark: "#7898AE", top: "#CCDCE8" },
];

const toppingOptions = [
  { id: "writing",   name: "Writing",   emoji: "✍️", hasText: true  },
  { id: "sticker",   name: "Sticker",   emoji: "🎀", hasText: false },
  { id: "sprinkles", name: "Sprinkles", emoji: "🌈", hasText: false },
];

const steps = [
  { id: "shape",     label: "Shape",     Icon: Layers   },
  { id: "chocolate", label: "Chocolate", Icon: ChefHat  },
  { id: "color",     label: "Cake Color", Icon: Palette  },
  { id: "toppings",  label: "Toppings",  Icon: Sparkles },
];

interface Selections {
  shapeId: string;
  chocolateId: string;
  cakeColor: string;
  toppingIds: string[];
  writingText: string;
}

function CakeSVGPreview({ colorId }: { colorId: string }) {
  const palette: Record<string, { main: string; dark: string; top: string }> = {
    brown: { main: "#8B5E3C", dark: "#5C3C22", top: "#B07850" },
    white: { main: "#FFFFFF", dark: "#C8BEB8", top: "#FFFFFF" },
    pink:  { main: "#FF6B9D", dark: "#C04070", top: "#FFB0C8" },
    blue:  { main: "#B2C8D8", dark: "#7898AE", top: "#CCDCE8" },
  };

  const c = palette[colorId] ?? palette.white;

  return (
    <svg viewBox="0 0 200 210" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="cg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c.dark} />
          <stop offset="18%"  stopColor={c.main} />
          <stop offset="82%"  stopColor={c.main} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="100" cy="200" rx="76" ry="8" fill="#2D000A" opacity="0.08" />

      {/* ── BOTTOM TIER ── */}
      <rect x="20" y="128" width="160" height="62" fill="url(#cg)" />
      <ellipse cx="100" cy="190" rx="80" ry="12" fill={c.dark} />
      <ellipse cx="100" cy="128" rx="80" ry="12" fill={c.top} />

      {/* Frosting ring between tiers */}
      <ellipse cx="100" cy="122" rx="80" ry="12" fill="#FFFFFF" />
      <rect x="20" y="122" width="160" height="9" fill="#FFFFFF" />
      <ellipse cx="100" cy="131" rx="80" ry="12" fill="#FFFFFF" />

      {/* ── TOP TIER ── */}
      <rect x="48" y="74" width="104" height="52" fill="url(#cg)" />
      <ellipse cx="100" cy="126" rx="52" ry="9" fill={c.dark} opacity="0.25" />
      <ellipse cx="100" cy="74" rx="52" ry="9" fill={c.top} />

      {/* Frosting ring on top tier */}
      <ellipse cx="100" cy="68" rx="52" ry="9" fill="#FFFFFF" />
      <rect x="48" y="68" width="104" height="8" fill="#FFFFFF" />
      <ellipse cx="100" cy="76" rx="52" ry="9" fill="#FFFFFF" />

      {/* ── CANDLES ── */}
      {([75, 100, 125] as const).map((x, i) => {
        const body = ["#FFB3BA", "#B3D4FF", "#FFE4B3"][i];
        const cap  = ["#FF8095", "#80B0E8", "#FFD070"][i];
        return (
          <g key={x}>
            <rect x={x - 3.5} y={44} width={7} height={24} rx={2.5} fill={body} />
            <ellipse cx={x} cy={44} rx={3.5} ry={2} fill={cap} />
            <ellipse cx={x} cy={38} rx={4}   ry={7} fill="#FFA040" opacity="0.9" />
            <ellipse cx={x} cy={39} rx={2.2} ry={4.5} fill="#FFE050" />
          </g>
        );
      })}

      {/* Pearl dots on bottom tier */}
      {[45, 78, 100, 122, 155].map((x) => (
        <circle key={x} cx={x} cy={158} r={2.5} fill="#FFFFFF" opacity="0.75" />
      ))}
      {/* Pearl dots on top tier */}
      {[65, 100, 135].map((x) => (
        <circle key={x} cx={x} cy={101} r={2} fill="#FFFFFF" opacity="0.7" />
      ))}
    </svg>
  );
}

export default function CustomizeContent({ product }: { product: DbProduct }) {
  const router    = useRouter();
  const addToCart = useCartStore((s) => s.addItem);

  const [step, setStep] = useState(0);
  const [sel, setSel]   = useState<Selections>({
    shapeId: "", chocolateId: "", cakeColor: "", toppingIds: [], writingText: "",
  });

  const totalPrice   = useMemo(() => shapes.find((s) => s.id === sel.shapeId)?.price ?? product.price, [sel.shapeId, product.price]);
  const selectedChoc = chocolates.find((c) => c.id === sel.chocolateId);

  const isStepCompleted = (i: number) => {
    if (i === 0) return !!sel.shapeId;
    if (i === 1) return !!sel.chocolateId;
    if (i === 2) return !!sel.cakeColor;
    return false;
  };

  const canProceed =
    step === 0 ? !!sel.shapeId
    : step === 1 ? !!sel.chocolateId
    : step === 2 ? !!sel.cakeColor
    : true;

  const toggleTopping = (id: string) =>
    setSel((prev) => ({
      ...prev,
      toppingIds: prev.toppingIds.includes(id)
        ? prev.toppingIds.filter((t) => t !== id)
        : [...prev.toppingIds, id],
    }));

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep((s) => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const chosenColor    = CAKE_COLORS.find((c) => c.id === sel.cakeColor);
    const chosenToppings = toppingOptions.filter((t) => sel.toppingIds.includes(t.id) && t.id !== "writing").map((t) => t.name);
    const previewImage   = shapes.find((s) => s.id === sel.shapeId)?.image ?? product.image_url ?? "";
    addToCart({
      productId:    product.id,
      productName:  product.name,
      productImage: previewImage,
      quantity:     1,
      unitPrice:    totalPrice,
      customization: {
        shape:    shapes.find((s) => s.id === sel.shapeId)?.name,
        flavor:   selectedChoc?.name,
        color:    chosenColor?.name,
        toppings: chosenToppings.length ? chosenToppings : undefined,
        message:  sel.toppingIds.includes("writing") && sel.writingText ? sel.writingText : undefined,
      },
    });
    router.push("/cart");
  };

  const ShapeStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Choose Size & Style</h2>
      <p className="text-[#A05068] text-sm mb-5">Select the perfect box size for your occasion</p>
      <div className="grid grid-cols-2 gap-3">
        {shapes.map((shape) => {
          const selected = sel.shapeId === shape.id;
          return (
            <button key={shape.id} onClick={() => setSel((p) => ({ ...p, shapeId: shape.id }))}
              className={cn("relative rounded-2xl border-2 p-3 text-left transition-all duration-300 bg-white active:scale-[0.97] shadow-warm-sm",
                selected ? "border-[#800020] shadow-warm-md" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40 hover:shadow-warm-sm")}>
              {selected && <CheckCircle2 size={18} className="absolute top-3 right-3 text-[#800020] fill-[#F5D0D8]" />}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#F5D0D8] shrink-0 mb-3">
                <Image src={shape.image} alt={shape.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
              </div>
              <div className="pb-1">
                <h3 className="font-semibold text-[#2D000A] text-base">{shape.name}</h3>
                <p className="text-[#A05068] text-xs mt-0.5 mb-1.5">Good for any celebration</p>
                <p className={cn("font-bold text-xl leading-none", selected ? "text-[#800020]" : "text-[#800020]")}>{shape.price} QAR</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const FlavorStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Choose Flavor</h2>
      <p className="text-[#A05068] text-sm mb-5">Select your chocolate base</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {chocolates.map((choc) => {
          const selected = sel.chocolateId === choc.id;
          return (
            <button key={choc.id} onClick={() => setSel((p) => ({ ...p, chocolateId: choc.id }))}
              className={cn("relative rounded-2xl border-2 p-4 text-center transition-all duration-300 bg-white active:scale-[0.97]",
                selected ? "border-[#800020] shadow-warm-md" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40 hover:shadow-warm-sm")}>
              {selected && <CheckCircle2 size={16} className="absolute top-2.5 right-2.5 text-[#800020] fill-[#F5D0D8]" />}
              <span className="text-3xl block mb-2">{choc.emoji}</span>
              <h3 className="font-semibold text-[#2D000A] text-sm">{choc.name}</h3>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ColorStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Choose Cake Color</h2>
      <p className="text-[#A05068] text-sm mb-5">Pick your cake color — see the preview above update live</p>
      <div className="grid grid-cols-2 gap-3">
        {CAKE_COLORS.map((color) => {
          const selected = sel.cakeColor === color.id;
          return (
            <button key={color.id} onClick={() => setSel((p) => ({ ...p, cakeColor: color.id }))}
              className={cn("relative rounded-2xl border-2 p-4 text-center transition-all duration-300 bg-white active:scale-[0.97]",
                selected ? "border-[#800020] shadow-warm-md" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40 hover:shadow-warm-sm")}>
              {selected && <CheckCircle2 size={16} className="absolute top-2.5 right-2.5 text-[#800020] fill-[#F5D0D8]" />}
              <div
                className="w-12 h-12 rounded-full mx-auto mb-3 border border-[rgba(128,0,32,0.12)]"
                style={{ background: `radial-gradient(circle at 35% 35%, ${color.top}, ${color.main} 55%, ${color.dark})` }}
              />
              <h3 className="font-semibold text-[#2D000A] text-sm">{color.name}</h3>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ToppingsStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Toppings</h2>
      <p className="text-[#A05068] text-sm mb-5">Add the finishing touches — all optional</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {toppingOptions.filter((t) => t.id !== "writing").map((topping) => {
          const selected = sel.toppingIds.includes(topping.id);
          return (
            <button key={topping.id} onClick={() => toggleTopping(topping.id)}
              className={cn("relative rounded-2xl border-2 p-4 text-center transition-all duration-200 bg-white active:scale-[0.97]",
                selected ? "border-[#800020] bg-[#F5D0D8] shadow-warm-sm" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40")}>
              {selected && <span className="absolute top-2 right-2"><Check size={12} className="text-[#800020]" strokeWidth={3} /></span>}
              <span className="text-2xl block mb-2">{topping.emoji}</span>
              <p className="text-xs font-semibold text-[#2D000A]">{topping.name}</p>
            </button>
          );
        })}
      </div>
    </div>
  );

  const stepContent = [<ShapeStep key="shape" />, <FlavorStep key="flavor" />, <ColorStep key="color" />, <ToppingsStep key="toppings" />];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#F5D0D8" }}>
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F5D0D8]/97 backdrop-blur-md border-b border-[rgba(128,0,32,0.10)] shadow-warm-xs h-14 flex items-center px-4 md:px-6">
        <button onClick={() => router.back()} className="flex items-center gap-1 text-[#A05068] hover:text-[#800020] transition-colors mr-3">
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-playfair font-semibold text-[#2D000A] text-lg flex-1 truncate">{product.name}</h1>
        <div className="text-right">
          <p className="text-[10px] text-[#A05068] uppercase tracking-wider leading-none mb-0.5">Total</p>
          <p className="font-playfair text-lg font-bold text-[#800020] leading-none">QAR {totalPrice}</p>
        </div>
      </header>

      <div className="flex flex-1 pt-14 pb-20 bg-[#FFFFFF]">
        <aside className="hidden md:flex flex-col w-20 shrink-0 fixed left-0 top-14 bottom-20 bg-white border-r border-[rgba(128,0,32,0.06)] shadow-warm-xs py-4 overflow-y-auto">
          {steps.map((s, i) => {
            const active    = i === step;
            const completed = isStepCompleted(i) && i !== step;
            return (
              <button key={s.id} onClick={() => setStep(i)}
                className={cn("flex flex-col items-center gap-1.5 py-4 px-2 transition-all duration-300 relative", active ? "text-white" : completed ? "text-[#800020]" : "text-[#A05068]")}>
                {active && <span className="absolute inset-x-2 inset-y-1 bg-[#800020] rounded-xl shadow-warm-sm" />}
                <span className="relative z-10">{completed ? <CheckCircle2 size={20} className="fill-[#F5D0D8]" /> : <s.Icon size={20} />}</span>
                <span className="relative z-10 text-[10px] font-bold leading-tight text-center">{s.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="flex-1 md:ml-20 flex flex-col">
          <div className="md:hidden flex border-b border-[rgba(128,0,32,0.06)] bg-white">
            {steps.map((s, i) => {
              const active    = i === step;
              const completed = isStepCompleted(i) && i !== step;
              return (
                <button key={s.id} onClick={() => setStep(i)}
                  className={cn("flex-1 flex flex-col items-center gap-1 py-3 px-2 border-b-2 transition-all duration-200",
                    active ? "border-[#800020] text-[#800020]" : completed ? "border-transparent text-[#800020]/60" : "border-transparent text-[#A05068]")}>
                  {completed ? <CheckCircle2 size={16} /> : <s.Icon size={16} />}
                  <span className="text-[10px] font-bold">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Cake SVG preview */}
          <div className="relative h-56 md:h-72 bg-[#EDE8F5] flex items-center justify-center overflow-hidden border-b border-[rgba(128,0,32,0.06)]">
            <div className="h-full flex items-center justify-center p-4 md:p-6" style={{ width: "min(100%, 260px)" }}>
              <CakeSVGPreview colorId={sel.cakeColor} />
            </div>
            <div className="absolute bottom-4 left-4">
              <span className="text-[#A05068] text-xs font-semibold uppercase tracking-widest">Step {step + 1} of {steps.length}</span>
              <h2 className="font-playfair text-[#2D000A] text-2xl font-bold leading-tight">{steps[step].label}</h2>
            </div>
          </div>

          <div className="flex-1 p-4 md:p-6">{stepContent[step]}</div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-t border-[rgba(128,0,32,0.10)] shadow-warm-sm p-4 md:pl-24">
        <button onClick={handleNext} disabled={!canProceed}
          className={cn("w-full font-bold py-4 rounded-2xl transition-all duration-300 font-playfair text-base tracking-wide",
            canProceed ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white hover:shadow-warm-lg shadow-warm-sm active:scale-[0.97]" : "bg-[#FF6B9D]/40 text-white/50 cursor-not-allowed")}>
          {step === steps.length - 1 ? "Add to Cart" : "Next →"}
        </button>
      </footer>
    </div>
  );
}
