"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  ChevronLeft,
  Layers,
  ChefHat,
  Sparkles,
  CheckCircle2,
  Check,
} from "lucide-react";
import { menuProducts } from "@/data/products";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const shapes = [
  {
    id: "square",
    name: "Square",
    price: 85,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "heart",
    name: "Heart",
    price: 95,
    image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "full-cake",
    name: "Full Cake",
    price: 150,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80",
  },
];

const chocolates = [
  { id: "milk",     name: "Milk Chocolate", emoji: "🍫", hasColor: false },
  { id: "hazelnut", name: "Hazelnut",        emoji: "🌰", hasColor: false },
  { id: "oreo",     name: "Oreo",            emoji: "⚫", hasColor: false },
  { id: "white",    name: "White Chocolate", emoji: "🤍", hasColor: true  },
];

const whiteChocolateColors = [
  { id: "white", name: "White", hex: "#FDF6F0" },
  { id: "blush", name: "Blush", hex: "#C896A0" },
  { id: "gold", name: "Gold", hex: "#E8D5A3" },
];

const toppingOptions = [
  { id: "writing",   name: "Writing",   emoji: "✍️", hasText: true  },
  { id: "sticker",   name: "Sticker",   emoji: "🎀", hasText: false },
  { id: "sprinkles", name: "Sprinkles", emoji: "🌈", hasText: false },
];

const steps = [
  { id: "shape",     label: "Shape",     Icon: Layers   },
  { id: "chocolate", label: "Chocolate", Icon: ChefHat  },
  { id: "toppings",  label: "Toppings",  Icon: Sparkles },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface Selections {
  shapeId: string;
  chocolateId: string;
  chocolateColorId: string;
  toppingIds: string[];
  writingText: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const product = menuProducts.find((p) => p.id === params.id) ?? menuProducts[0];
  const addToCart = useCartStore((s) => s.addItem);

  const [step, setStep] = useState(0);
  const [sel, setSel] = useState<Selections>({
    shapeId: "",
    chocolateId: "",
    chocolateColorId: "",
    toppingIds: [],
    writingText: "",
  });

  // ─── Derived ──────────────────────────────────────────────────────────────

  const totalPrice = useMemo(
    () => shapes.find((s) => s.id === sel.shapeId)?.price ?? product.price,
    [sel.shapeId, product.price]
  );

  const previewImage =
    shapes.find((s) => s.id === sel.shapeId)?.image ?? product.image;

  const selectedChoc = chocolates.find((c) => c.id === sel.chocolateId);

  const isStepCompleted = (i: number) => {
    if (i === 0) return !!sel.shapeId;
    if (i === 1) return !!sel.chocolateId;
    if (i === 2) return selectedChoc?.hasColor ? !!sel.chocolateColorId : !!sel.chocolateId;
    if (i === 3) return true;
    if (i === 4) return true;
    return false;
  };

  const canProceed =
    step === 0
      ? !!sel.shapeId
      : step === 1
      ? !!sel.chocolateId
      : step === 2
      ? selectedChoc?.hasColor
        ? !!sel.chocolateColorId
        : true
      : true;

  // ─── Handlers ─────────────────────────────────────────────────────────────

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

    const chosenColor = whiteChocolateColors.find((c) => c.id === sel.chocolateColorId);
    const chosenToppings = toppingOptions
      .filter((t) => sel.toppingIds.includes(t.id) && t.id !== "writing")
      .map((t) => t.name);

    addToCart({
      productId: params.id,
      productName: product.name,
      productImage: previewImage,
      quantity: 1,
      unitPrice: totalPrice,
      customization: {
        shape: shapes.find((s) => s.id === sel.shapeId)?.name,
        flavor: selectedChoc
          ? chosenColor
            ? `${selectedChoc.name} — ${chosenColor.name}`
            : selectedChoc.name
          : undefined,
        toppings: chosenToppings.length ? chosenToppings : undefined,
        message: sel.toppingIds.includes("writing") && sel.writingText
          ? sel.writingText
          : undefined,
      },
    });

    router.push("/cart");
  };

  // ─── Step renderers ───────────────────────────────────────────────────────

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
                "relative rounded-2xl border-2 p-3 text-left transition-all duration-300 bg-white active:scale-[0.97] shadow-warm-sm",
                selected
                  ? "border-[#3D0A14] shadow-warm-md"
                  : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40 hover:shadow-warm-sm"
              )}
            >
              {selected && (
                <CheckCircle2
                  size={18}
                  className="absolute top-3 right-3 text-[#3D0A14] fill-[#F5E4E6]"
                />
              )}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#F5E4E6] shrink-0 mb-3">
                <Image
                  src={shape.image}
                  alt={shape.name}
                  fill
                  sizes="(max-width: 768px) 50vw, 200px"
                  className="object-cover"
                />
              </div>
              <div className="pb-1">
                <h3 className="font-semibold text-[#1A0A0A] text-base">{shape.name}</h3>
                <p className="text-[#9E7B7B] text-xs mt-0.5 mb-1.5">Good for any celebration</p>
                <p className={cn("font-bold text-xl leading-none", selected ? "text-[#3D0A14]" : "text-[#4A3728]")}>
                  {shape.price} QAR
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );

  const FlavorStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Choose Flavor</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">Select your chocolate base</p>
      <div className="grid grid-cols-2 gap-3 mb-6">
        {chocolates.map((choc) => {
          const selected = sel.chocolateId === choc.id;
          return (
            <button
              key={choc.id}
              onClick={() =>
                setSel((p) => ({ ...p, chocolateId: choc.id, chocolateColorId: "" }))
              }
              className={cn(
                "relative rounded-2xl border-2 p-4 text-center transition-all duration-300 bg-white active:scale-[0.97]",
                selected
                  ? "border-[#3D0A14] shadow-warm-md"
                  : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40 hover:shadow-warm-sm"
              )}
            >
              {selected && (
                <CheckCircle2
                  size={16}
                  className="absolute top-2.5 right-2.5 text-[#3D0A14] fill-[#F5E4E6]"
                />
              )}
              <span className="text-3xl block mb-2">{choc.emoji}</span>
              <h3 className="font-semibold text-[#1A0A0A] text-sm">{choc.name}</h3>
            </button>
          );
        })}
      </div>

    </div>
  );

  const ColorStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Choose Color</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">
        {selectedChoc?.hasColor ? "Pick your white chocolate color" : "Color is only available for white chocolate"}
      </p>
      <div className="flex gap-6">
        {whiteChocolateColors.map((color) => {
          const selected = sel.chocolateColorId === color.id;
          return (
            <button
              key={color.id}
              onClick={() => setSel((p) => ({ ...p, chocolateColorId: color.id }))}
              disabled={!selectedChoc?.hasColor}
              className={cn(
                "flex flex-col items-center gap-2",
                !selectedChoc?.hasColor && "opacity-45 cursor-not-allowed"
              )}
            >
              <div className="relative">
                <div
                  className={cn(
                    "w-16 h-16 rounded-full border-4 transition-all duration-200",
                    selected
                      ? "border-[#3D0A14] scale-110 shadow-warm-md"
                      : "border-[rgba(26,10,10,0.12)]"
                  )}
                  style={{ backgroundColor: color.hex }}
                />
                {selected && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <Check
                      size={16}
                      className={color.id === "white" ? "text-[#4A3728]" : "text-white"}
                      strokeWidth={3}
                    />
                  </span>
                )}
              </div>
              <span className="text-xs text-[#4A3728] font-semibold">{color.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ToppingsStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Toppings</h2>
      <p className="text-[#9E7B7B] text-sm mb-5">Add the finishing touches — all optional</p>
      <div className="grid grid-cols-2 gap-3 mb-5">
        {toppingOptions.filter((t) => t.id !== "writing").map((topping) => {
          const selected = sel.toppingIds.includes(topping.id);
          return (
            <button
              key={topping.id}
              onClick={() => toggleTopping(topping.id)}
              className={cn(
                "relative rounded-2xl border-2 p-4 text-center transition-all duration-200 bg-white active:scale-[0.97]",
                selected
                  ? "border-[#3D0A14] bg-[#F5E4E6] shadow-warm-sm"
                  : "border-[rgba(26,10,10,0.10)] hover:border-[#3D0A14]/40"
              )}
            >
              {selected && (
                <span className="absolute top-2 right-2">
                  <Check size={12} className="text-[#3D0A14]" strokeWidth={3} />
                </span>
              )}
              <span className="text-2xl block mb-2">{topping.emoji}</span>
              <p className="text-xs font-semibold text-[#1A0A0A]">{topping.name}</p>
            </button>
          );
        })}
      </div>

    </div>
  );

  const stepContent = [
    <ShapeStep key="shape" />,
    <FlavorStep key="flavor" />,
    <ColorStep key="color" />,
    <ToppingsStep key="toppings" />,
  ];

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#C896A0" }}>

      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#C896A0]/97 backdrop-blur-md border-b border-[rgba(26,10,10,0.10)] shadow-warm-xs h-14 flex items-center px-4 md:px-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-[#9E7B7B] hover:text-[#3D0A14] transition-colors mr-3"
        >
          <ChevronLeft size={22} />
        </button>
        <h1 className="font-playfair font-semibold text-[#1A0A0A] text-lg flex-1 truncate">
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

      {/* Main layout */}
      <div className="flex flex-1 pt-14 pb-20 bg-[#FDF6F0]">

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
                <span className="relative z-10 text-[10px] font-bold leading-tight text-center">
                  {s.label}
                </span>
              </button>
            );
          })}
        </aside>

        {/* Scrollable content */}
        <main className="flex-1 md:ml-20 flex flex-col">

          {/* Mobile step tabs */}
          <div className="md:hidden flex border-b border-[rgba(26,10,10,0.06)] bg-white">
            {steps.map((s, i) => {
              const active = i === step;
              const completed = isStepCompleted(i) && i !== step;
              return (
                <button
                  key={s.id}
                  onClick={() => setStep(i)}
                  className={cn(
                    "flex-1 flex flex-col items-center gap-1 py-3 px-2 border-b-2 transition-all duration-200",
                    active
                      ? "border-[#3D0A14] text-[#3D0A14]"
                      : completed
                      ? "border-transparent text-[#3D0A14]/60"
                      : "border-transparent text-[#9E7B7B]"
                  )}
                >
                  {completed ? <CheckCircle2 size={16} /> : <s.Icon size={16} />}
                  <span className="text-[10px] font-bold">{s.label}</span>
                </button>
              );
            })}
          </div>

          {/* Preview image */}
          <div className="relative h-56 md:h-72 bg-[#1A0A0A] overflow-hidden">
            <Image
              src={previewImage}
              alt={product.name}
              fill
              sizes="100vw"
              className="object-cover opacity-80 transition-opacity duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1A0A0A]/70 via-[#1A0A0A]/10 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <span className="text-white/60 text-xs font-semibold uppercase tracking-widest">
                Step {step + 1} of {steps.length}
              </span>
              <h2 className="font-playfair text-white text-2xl font-bold leading-tight">
                {steps[step].label}
              </h2>
            </div>
          </div>

          {/* Step content */}
          <div className="flex-1 p-4 md:p-6">{stepContent[step]}</div>
        </main>
      </div>

      {/* Fixed Next / Add to Cart button */}
      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-t border-[rgba(26,10,10,0.10)] shadow-warm-sm p-4 md:pl-24">
        <button
          onClick={handleNext}
          disabled={!canProceed}
          className={cn(
            "w-full font-bold py-4 rounded-2xl transition-all duration-300 font-playfair text-base tracking-wide",
            canProceed
              ? "bg-[#3D0A14] hover:bg-[#2D0810] text-white hover:shadow-warm-lg shadow-warm-sm active:scale-[0.97]"
              : "bg-[#3D0A14]/30 text-white/60 cursor-not-allowed"
          )}
        >
          {step === steps.length - 1 ? "Add to Cart" : "Next →"}
        </button>
      </footer>
    </div>
  );
}
