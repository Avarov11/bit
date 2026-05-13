"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeft, Layers, ChefHat, Sparkles, CheckCircle2, Check } from "lucide-react";
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
  { id: "writing",   name: "Writing",   emoji: "✍️" },
  { id: "sticker",   name: "Sticker",   emoji: "🎀" },
  { id: "sprinkles", name: "Sprinkles", emoji: "🌈" },
];

const steps = [
  { id: "shape",     label: "Shape",     Icon: Layers   },
  { id: "chocolate", label: "Chocolate", Icon: ChefHat  },
  { id: "toppings",  label: "Toppings",  Icon: Sparkles },
];

interface Selections {
  shapeId: string;
  chocolateId: string;
  cakeColor: string;
  toppingIds: string[];
  writingText: string;
}

// ─── Color palette ─────────────────────────────────────────────────────────────
type CP = { main: string; dark: string; top: string };
const PALETTE: Record<string, CP> = {
  brown: { main: "#8B5E3C", dark: "#5C3C22", top: "#B07850" },
  white: { main: "#FFFFFF", dark: "#C8BEB8", top: "#FFFFFF" },
  pink:  { main: "#FF6B9D", dark: "#C04070", top: "#FFB0C8" },
  blue:  { main: "#B2C8D8", dark: "#7898AE", top: "#CCDCE8" },
};
const getC = (id: string): CP => PALETTE[id] ?? PALETTE.brown;

// ─── Text helpers ──────────────────────────────────────────────────────────────
function computeLines(text: string, shapeId: string): string[] {
  const t = text.trim();
  if (!t) return [];
  if (shapeId === "full-cake") {
    const words = t.split(/\s+/);
    const lines: string[] = [];
    let cur = "";
    for (const w of words) {
      const cand = cur ? `${cur} ${w}` : w;
      if (cand.length > 13 && cur) { lines.push(cur); cur = w; }
      else cur = cand;
    }
    if (cur) lines.push(cur);
    return lines;
  }
  const words = t.split(/\s+/).filter(Boolean).slice(0, 3);
  if (words.length <= 2) return words.length ? [words.join(" ")] : [];
  return [words[0] + " " + words[1], words[2]];
}

function cakeFontSize(lines: string[]): number {
  if (!lines.length) return 10;
  const mx = Math.max(...lines.map(l => l.length));
  if (lines.length >= 5 || mx > 13) return 6;
  if (lines.length >= 4 || mx > 11) return 7;
  if (lines.length >= 3 || mx > 9)  return 8;
  if (lines.length >= 2 || mx > 7)  return 9;
  return 11;
}

// ─── SVG text renderer ─────────────────────────────────────────────────────────
function SvgText({ lines, cx, cy, fontSize = 10 }: {
  lines: string[]; cx: number; cy: number; fontSize?: number;
}) {
  if (!lines.length) return null;
  const lh = fontSize + 3;
  const startY = cy - ((lines.length - 1) * lh) / 2;
  return (
    <>
      <text x={cx+1} y={startY+1} textAnchor="middle" fill="rgba(45,0,10,0.40)"
        fontWeight="bold" fontSize={fontSize} fontFamily="Georgia, serif">
        {lines.map((l, i) => <tspan key={i} x={cx+1} dy={i === 0 ? 0 : lh}>{l}</tspan>)}
      </text>
      <text x={cx} y={startY} textAnchor="middle" fill="#FFFFFF"
        fontWeight="bold" fontSize={fontSize} fontFamily="Georgia, serif">
        {lines.map((l, i) => <tspan key={i} x={cx} dy={i === 0 ? 0 : lh}>{l}</tspan>)}
      </text>
    </>
  );
}

// ─── LEFT PANEL: existing side-view SVG ───────────────────────────────────────
// Uses unique gradient IDs prefixed with "sv-" to avoid clashing with top-view SVGs.

function FullCakeSide({ colorId, textLines }: { colorId: string; textLines: string[] }) {
  const c = getC(colorId);
  const fs = cakeFontSize(textLines);
  const showCandles = textLines.length === 0;
  return (
    <svg viewBox="0 0 200 210" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sv-cg" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c.dark} />
          <stop offset="18%"  stopColor={c.main} />
          <stop offset="82%"  stopColor={c.main} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="200" rx="76" ry="8" fill="#2D000A" opacity="0.08" />
      <rect x="20" y="128" width="160" height="62" fill="url(#sv-cg)" />
      <ellipse cx="100" cy="190" rx="80" ry="12" fill={c.dark} />
      <ellipse cx="100" cy="128" rx="80" ry="12" fill={c.top} />
      <ellipse cx="100" cy="122" rx="80" ry="12" fill="#FFFFFF" />
      <rect x="20" y="122" width="160" height="9" fill="#FFFFFF" />
      <ellipse cx="100" cy="131" rx="80" ry="12" fill="#FFFFFF" />
      <rect x="48" y="74" width="104" height="52" fill="url(#sv-cg)" />
      <ellipse cx="100" cy="126" rx="52" ry="9" fill={c.dark} opacity="0.25" />
      <ellipse cx="100" cy="74" rx="52" ry="9" fill={c.top} />
      <ellipse cx="100" cy="68" rx="52" ry="9" fill="#FFFFFF" />
      <rect x="48" y="68" width="104" height="8" fill="#FFFFFF" />
      <ellipse cx="100" cy="76" rx="52" ry="9" fill="#FFFFFF" />
      {showCandles && ([75,100,125] as const).map((x, i) => {
        const body = ["#FFB3BA","#B3D4FF","#FFE4B3"][i];
        const cap  = ["#FF8095","#80B0E8","#FFD070"][i];
        return (
          <g key={x}>
            <rect x={x-3.5} y={44} width={7} height={24} rx={2.5} fill={body} />
            <ellipse cx={x} cy={44} rx={3.5} ry={2} fill={cap} />
            <ellipse cx={x} cy={38} rx={4}   ry={7} fill="#FFA040" opacity="0.9" />
            <ellipse cx={x} cy={39} rx={2.2} ry={4.5} fill="#FFE050" />
          </g>
        );
      })}
      {[45,78,100,122,155].map(x => <circle key={x} cx={x} cy={158} r={2.5} fill="#FFFFFF" opacity="0.75" />)}
      {[65,100,135].map(x => <circle key={x} cx={x} cy={101} r={2} fill="#FFFFFF" opacity="0.7" />)}
      {textLines.length > 0 && <SvgText lines={textLines} cx={100} cy={100} fontSize={fs} />}
    </svg>
  );
}

function HeartSide({ colorId, textLines }: { colorId: string; textLines: string[] }) {
  const c = getC(colorId);
  const P = "M100,162 C50,136 20,104 20,76 C20,50 38,35 62,35 C76,35 90,44 100,58 C110,44 124,35 138,35 C162,35 180,50 180,76 C180,104 150,136 100,162Z";
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="188" rx="62" ry="8" fill="#2D000A" opacity="0.08" />
      <path d={P} fill="#2D000A" transform="translate(0,10)" opacity="0.20" />
      <path d={P} fill="white"   transform="translate(0,5)" />
      <path d={P} fill={c.dark}  transform="translate(0,3)" />
      <path d={P} fill={c.main} />
      <path d={P} fill={c.top}  transform="translate(100,99) scale(0.82) translate(-100,-99)" />
      <path d="M38,54 C33,65 31,78 33,88" stroke="white" strokeWidth="3" strokeLinecap="round" opacity="0.35" />
      {[78,100,122].map(x => <circle key={x} cx={x} cy={130} r={2.5} fill="white" opacity="0.75" />)}
      {textLines.length > 0 && <SvgText lines={textLines} cx={100} cy={103} fontSize={10} />}
    </svg>
  );
}

function SquareSide({ colorId, textLines }: { colorId: string; textLines: string[] }) {
  const c = getC(colorId);
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="sv-sq" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor={c.dark} />
          <stop offset="20%"  stopColor={c.main} />
          <stop offset="80%"  stopColor={c.main} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <ellipse cx="98" cy="188" rx="68" ry="8" fill="#2D000A" opacity="0.08" />
      <polygon points="155,72 180,52 180,162 155,175" fill={c.dark} />
      <rect x="22" y="75" width="133" height="100" fill="url(#sv-sq)" />
      <rect x="22" y="173" width="133" height="4" fill={c.dark} opacity="0.6" />
      <rect x="22" y="70" width="133" height="9" fill="white" />
      <polygon points="22,70 155,70 180,50 47,50" fill={c.top} />
      <polygon points="22,70 155,70 180,50 47,50" fill="white" opacity="0.40" />
      <polygon points="155,70 180,50 180,60 155,79" fill="white" opacity="0.50" />
      <line x1="22" y1="75" x2="22" y2="179" stroke="white" strokeWidth="2.5" opacity="0.25" />
      {[50,88,126].map(x => <circle key={x} cx={x} cy={140} r={2.5} fill="white" opacity="0.65" />)}
      {textLines.length > 0 && <SvgText lines={textLines} cx={101} cy={62} fontSize={9} />}
    </svg>
  );
}

function SideView({ shapeId, colorId, textLines }: { shapeId: string; colorId: string; textLines: string[] }) {
  if (shapeId === "heart")  return <HeartSide  colorId={colorId} textLines={textLines} />;
  if (shapeId === "square") return <SquareSide colorId={colorId} textLines={textLines} />;
  return <FullCakeSide colorId={colorId} textLines={textLines} />;
}

// ─── RIGHT PANEL: top-view SVG (shows written text from above) ────────────────
// Uses unique gradient IDs prefixed with "tv-" to avoid clashing with side-view SVGs.

function FullCakeTop({ colorId, textLines }: { colorId: string; textLines: string[] }) {
  const c = getC(colorId);
  const fs = cakeFontSize(textLines);
  const bumpAngles = [0,30,60,90,120,150,180];
  return (
    <svg viewBox="0 0 200 175" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="tv-cg" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%"   stopColor={c.main} />
          <stop offset="100%" stopColor={c.dark} />
        </linearGradient>
      </defs>
      <ellipse cx="100" cy="128" rx="75" ry="20" fill={c.dark} />
      <rect x="25" y="90" width="150" height="38" fill="url(#tv-cg)" />
      <ellipse cx="100" cy="90" rx="75" ry="20" fill={c.top} />
      <ellipse cx="100" cy="86" rx="75" ry="20" fill="none" stroke="white" strokeWidth="7" opacity="0.9" />
      {bumpAngles.map(a => {
        const rad = (a * Math.PI) / 180;
        return <ellipse key={a} cx={100 + 75*Math.cos(rad)} cy={90 + 20*Math.sin(rad) + 4} rx={5} ry={3} fill="white" opacity="0.85" />;
      })}
      <ellipse cx="100" cy="90" rx="68" ry="16" fill={c.top} opacity="0.7" />
      {textLines.length === 0 && [
        { cx:78,  cy:84, body:"#FFB3BA" },
        { cx:100, cy:82, body:"#B3D4FF" },
        { cx:122, cy:84, body:"#FFE4B3" },
      ].map(cd => (
        <g key={cd.cx}>
          <circle cx={cd.cx} cy={cd.cy} r={5} fill={cd.body} />
          <ellipse cx={cd.cx} cy={cd.cy-4} rx={4} ry={6} fill="#FFA040" opacity="0.85" />
          <ellipse cx={cd.cx} cy={cd.cy-5} rx={2} ry={4} fill="#FFE050" />
        </g>
      ))}
      <ellipse cx="100" cy="163" rx="68" ry="8" fill="#2D000A" opacity="0.08" />
      {textLines.length > 0 && <SvgText lines={textLines} cx={100} cy={90} fontSize={fs} />}
    </svg>
  );
}

function HeartTop({ colorId, textLines }: { colorId: string; textLines: string[] }) {
  const c = getC(colorId);
  const P = "M100,135 C60,118 35,96 35,76 C35,58 48,46 65,46 C76,46 88,54 100,65 C112,54 124,46 135,46 C152,46 165,58 165,76 C165,96 140,118 100,135Z";
  return (
    <svg viewBox="0 0 200 190" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="100" cy="178" rx="58" ry="8" fill="#2D000A" opacity="0.08" />
      <path d={P} fill="#2D000A" transform="translate(0,12)" opacity="0.18" />
      <path d={P} fill={c.dark}  transform="translate(0,8)" />
      <path d={P} fill={c.top} />
      <path d={P} fill="none" stroke="white" strokeWidth="5" opacity="0.75" />
      <path d="M68,58 C58,66 52,76 53,85" stroke="white" strokeWidth="3.5" strokeLinecap="round" opacity="0.40" />
      {[82,100,118].map(x => <circle key={x} cx={x} cy={112} r={2.5} fill="white" opacity="0.70" />)}
      {textLines.length > 0 && <SvgText lines={textLines} cx={100} cy={92} fontSize={10} />}
    </svg>
  );
}

function SquareTop({ colorId, textLines }: { colorId: string; textLines: string[] }) {
  const c = getC(colorId);
  return (
    <svg viewBox="0 0 200 200" className="w-full h-full drop-shadow-md" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="105" cy="190" rx="72" ry="8" fill="#2D000A" opacity="0.08" />
      <polygon points="45,87 185,87 185,168 45,168" fill={c.main} />
      <polygon points="25,64 45,87 45,168 25,145" fill={c.dark} />
      <polygon points="25,64 165,64 185,87 45,87" fill={c.top} />
      <polygon points="25,64 165,64 185,87 45,87" fill="white" opacity="0.38" />
      <line x1="25"  y1="64" x2="45"  y2="87" stroke="white" strokeWidth="2.5" opacity="0.6" />
      <line x1="25"  y1="64" x2="165" y2="64" stroke="white" strokeWidth="2.5" opacity="0.6" />
      <line x1="165" y1="64" x2="185" y2="87" stroke="white" strokeWidth="2.5" opacity="0.6" />
      <rect x="45" y="83" width="140" height="8" fill="white" opacity="0.55" />
      <line x1="25" y1="64" x2="25" y2="145" stroke="white" strokeWidth="2" opacity="0.28" />
      {[70,115,160].map(x => <circle key={x} cx={x} cy={135} r={2.5} fill="white" opacity="0.65" />)}
      {textLines.length > 0 && <SvgText lines={textLines} cx={115} cy={128} fontSize={10} />}
    </svg>
  );
}

function TopView({ shapeId, colorId, textLines }: { shapeId: string; colorId: string; textLines: string[] }) {
  if (shapeId === "heart")  return <HeartTop  colorId={colorId} textLines={textLines} />;
  if (shapeId === "square") return <SquareTop colorId={colorId} textLines={textLines} />;
  return <FullCakeTop colorId={colorId} textLines={textLines} />;
}

// ─── Main component ────────────────────────────────────────────────────────────
export default function CustomizeContent({ product }: { product: DbProduct }) {
  const router    = useRouter();
  const addToCart = useCartStore((s) => s.addItem);

  const [step, setStep]               = useState(0);
  const [wordWarning, setWordWarning] = useState(false);
  const [sel, setSel] = useState<Selections>({
    shapeId: "", chocolateId: "", cakeColor: "", toppingIds: [], writingText: "",
  });

  const maxWords  = sel.shapeId === "full-cake" ? Infinity : 3;
  const wordCount = sel.writingText.trim().split(/\s+/).filter(Boolean).length;
  const textLines = useMemo(
    () => sel.toppingIds.includes("writing") ? computeLines(sel.writingText, sel.shapeId) : [],
    [sel.writingText, sel.shapeId, sel.toppingIds]
  );

  const handleShapeChange = (shapeId: string) => {
    setSel(p => {
      let writingText = p.writingText;
      if (shapeId !== "full-cake") {
        const words = writingText.trim().split(/\s+/).filter(Boolean);
        if (words.length > 3) writingText = words.slice(0, 3).join(" ");
      }
      return { ...p, shapeId, writingText };
    });
    setWordWarning(false);
  };

  const handleWritingChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    if (sel.shapeId !== "full-cake") {
      const words = val.trim().split(/\s+/).filter(Boolean);
      if (words.length > 3) { setWordWarning(true); return; }
    }
    setWordWarning(false);
    setSel(p => ({ ...p, writingText: val }));
  };

  const totalPrice   = useMemo(() => shapes.find(s => s.id === sel.shapeId)?.price ?? product.price, [sel.shapeId, product.price]);
  const selectedChoc = chocolates.find(c => c.id === sel.chocolateId);

  const isStepCompleted = (i: number) => {
    if (i === 0) return !!sel.shapeId;
    if (i === 1) return !!sel.chocolateId && (sel.chocolateId !== "white" || !!sel.cakeColor);
    return false;
  };

  const canProceed =
    step === 0 ? !!sel.shapeId :
    step === 1 ? (!!sel.chocolateId && (sel.chocolateId !== "white" || !!sel.cakeColor)) : true;

  const toggleTopping = (id: string) =>
    setSel(prev => ({
      ...prev,
      toppingIds: prev.toppingIds.includes(id)
        ? prev.toppingIds.filter(t => t !== id)
        : [...prev.toppingIds, id],
    }));

  const handleNext = () => {
    if (step < steps.length - 1) {
      setStep(s => s + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const chosenColor    = CAKE_COLORS.find(c => c.id === sel.cakeColor);
    const chosenToppings = toppingOptions.filter(t => sel.toppingIds.includes(t.id) && t.id !== "writing").map(t => t.name);
    const previewImage   = shapes.find(s => s.id === sel.shapeId)?.image ?? product.image_url ?? "";
    addToCart({
      productId:    product.id,
      productName:  product.name,
      productImage: previewImage,
      quantity:     1,
      unitPrice:    totalPrice,
      customization: {
        shape:    shapes.find(s => s.id === sel.shapeId)?.name,
        flavor:   selectedChoc?.name,
        color:    chosenColor?.name,
        toppings: chosenToppings.length ? chosenToppings : undefined,
        message:  sel.toppingIds.includes("writing") && sel.writingText ? sel.writingText : undefined,
      },
    });
    router.push("/cart");
  };

  // ── Step panels ───────────────────────────────────────────────────────────────
  const ShapeStep = () => (
    <div>
      <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Choose Size & Style</h2>
      <p className="text-[#A05068] text-sm mb-5">Select the perfect box size for your occasion</p>
      <div className="grid grid-cols-2 gap-3">
        {shapes.map(shape => {
          const selected = sel.shapeId === shape.id;
          return (
            <button key={shape.id} onClick={() => handleShapeChange(shape.id)}
              className={cn("relative rounded-2xl border-2 p-3 text-left transition-all duration-300 bg-white active:scale-[0.97] shadow-warm-sm",
                selected ? "border-[#800020] shadow-warm-md" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40 hover:shadow-warm-sm")}>
              {selected && <CheckCircle2 size={18} className="absolute top-3 right-3 text-[#800020] fill-[#F5D0D8]" />}
              <div className="relative w-full h-32 rounded-xl overflow-hidden bg-[#F5D0D8] shrink-0 mb-3">
                <Image src={shape.image} alt={shape.name} fill sizes="(max-width: 768px) 50vw, 200px" className="object-cover" />
              </div>
              <div className="pb-1">
                <h3 className="font-semibold text-[#2D000A] text-base">{shape.name}</h3>
                <p className="text-[#A05068] text-xs mt-0.5 mb-1.5">
                  {shape.id === "full-cake" ? "Unlimited text on cake" : "Max 3 words on cake"}
                </p>
                <p className="font-bold text-xl leading-none text-[#800020]">{shape.price} QAR</p>
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
      <div className="grid grid-cols-2 gap-3 mb-4">
        {chocolates.map(choc => {
          const selected = sel.chocolateId === choc.id;
          return (
            <button key={choc.id}
              onClick={() => setSel(p => ({ ...p, chocolateId: choc.id, cakeColor: choc.id !== "white" ? "brown" : "" }))}
              className={cn("relative rounded-2xl border-2 p-4 text-center transition-all duration-300 bg-white active:scale-[0.97]",
                selected ? "border-[#800020] shadow-warm-md" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40 hover:shadow-warm-sm")}>
              {selected && <CheckCircle2 size={16} className="absolute top-2.5 right-2.5 text-[#800020] fill-[#F5D0D8]" />}
              <span className="text-3xl block mb-2">{choc.emoji}</span>
              <h3 className="font-semibold text-[#2D000A] text-sm">{choc.name}</h3>
            </button>
          );
        })}
      </div>
      {sel.chocolateId === "white" && (
        <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
          <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-3">Choose Cake Color</p>
          <div className="grid grid-cols-3 gap-3">
            {CAKE_COLORS.filter(c => c.id !== "brown").map(color => {
              const selected = sel.cakeColor === color.id;
              return (
                <button key={color.id} onClick={() => setSel(p => ({ ...p, cakeColor: color.id }))}
                  className={cn("relative rounded-2xl border-2 p-3 text-center transition-all duration-300 bg-white active:scale-[0.97]",
                    selected ? "border-[#800020] shadow-warm-md" : "border-[rgba(128,0,32,0.10)] hover:border-[#800020]/40")}>
                  {selected && <CheckCircle2 size={14} className="absolute top-2 right-2 text-[#800020] fill-[#F5D0D8]" />}
                  <div className="w-10 h-10 rounded-full mx-auto mb-2 border border-[rgba(128,0,32,0.12)]"
                    style={{ background: `radial-gradient(circle at 35% 35%, ${color.top}, ${color.main} 55%, ${color.dark})` }} />
                  <p className="font-semibold text-[#2D000A] text-xs">{color.name}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  const ToppingsStep = () => {
    const hasWriting = sel.toppingIds.includes("writing");
    const shapeName  = shapes.find(s => s.id === sel.shapeId)?.name ?? "this shape";
    return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Toppings</h2>
        <p className="text-[#A05068] text-sm mb-5">Add the finishing touches — all optional</p>
        <div className="grid grid-cols-3 gap-3 mb-5">
          {toppingOptions.map(topping => {
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

        {hasWriting && (
          <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-[#2D000A]">Text on cake</label>
              {sel.shapeId !== "full-cake" && (
                <span className={cn("text-xs font-bold tabular-nums",
                  wordCount >= maxWords ? "text-[#800020]" : "text-[#A05068]")}>
                  {wordCount} / 3 words
                </span>
              )}
            </div>
            <textarea
              value={sel.writingText}
              onChange={handleWritingChange}
              placeholder={
                sel.shapeId === "full-cake"
                  ? "Type anything — wraps automatically on the top view…"
                  : `Max 3 words (e.g. "Happy Birthday Sara")`
              }
              rows={sel.shapeId === "full-cake" ? 3 : 2}
              className="w-full px-4 py-3 bg-[#FFFFFF] border border-[rgba(128,0,32,0.08)] focus:border-[#800020] rounded-xl text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none transition-colors resize-none"
            />
            {wordWarning && (
              <p className="text-[#800020] text-xs mt-2 font-semibold">
                Max 3 words for {shapeName}
              </p>
            )}
            {!wordWarning && (
              <p className="text-[#A05068] text-xs mt-2">
                {sel.shapeId === "full-cake"
                  ? "No word limit — text wraps across the cake surface"
                  : `Max 3 words for ${shapeName} shape`}
              </p>
            )}
          </div>
        )}
      </div>
    );
  };

  const stepContent = [
    <ShapeStep    key="shape" />,
    <FlavorStep   key="flavor" />,
    <ToppingsStep key="toppings" />,
  ];

  // ── Render ────────────────────────────────────────────────────────────────────
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
        {/* Desktop sidebar */}
        <aside className="hidden md:flex flex-col w-20 shrink-0 fixed left-0 top-14 bottom-20 bg-white border-r border-[rgba(128,0,32,0.06)] shadow-warm-xs py-4 overflow-y-auto">
          {steps.map((s, i) => {
            const active    = i === step;
            const completed = isStepCompleted(i) && i !== step;
            return (
              <button key={s.id} onClick={() => setStep(i)}
                className={cn("flex flex-col items-center gap-1.5 py-4 px-2 transition-all duration-300 relative",
                  active ? "text-white" : completed ? "text-[#800020]" : "text-[#A05068]")}>
                {active && <span className="absolute inset-x-2 inset-y-1 bg-[#800020] rounded-xl shadow-warm-sm" />}
                <span className="relative z-10">{completed ? <CheckCircle2 size={20} className="fill-[#F5D0D8]" /> : <s.Icon size={20} />}</span>
                <span className="relative z-10 text-[10px] font-bold leading-tight text-center">{s.label}</span>
              </button>
            );
          })}
        </aside>

        <main className="flex-1 md:ml-20 flex flex-col">
          {/* Mobile step tabs */}
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

          {/* ── Dual preview panel ─────────────────────────────────────────── */}
          <div className="flex h-56 md:h-72 bg-[#FFF0F3] border-b border-[rgba(128,0,32,0.06)] overflow-hidden">

            {/* Left — side view (existing look) */}
            <div className="flex-1 flex flex-col border-r border-[rgba(128,0,32,0.08)]">
              <div className="flex items-center justify-center px-2 py-1 border-b border-[rgba(128,0,32,0.06)]">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#A05068]">Side View</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-3 md:p-5">
                <div className="w-full h-full" style={{ maxWidth: 160, maxHeight: 200 }}>
                  <SideView shapeId={sel.shapeId} colorId={sel.cakeColor} textLines={textLines} />
                </div>
              </div>
            </div>

            {/* Right — top view (shows written text) */}
            <div className="flex-1 flex flex-col">
              <div className="flex items-center justify-center px-2 py-1 border-b border-[rgba(128,0,32,0.06)]">
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#800020]">Top View · Text</span>
              </div>
              <div className="flex-1 flex items-center justify-center p-3 md:p-5">
                <div className="w-full h-full" style={{ maxWidth: 160, maxHeight: 200 }}>
                  <TopView shapeId={sel.shapeId} colorId={sel.cakeColor} textLines={textLines} />
                </div>
              </div>
            </div>

          </div>

          {/* Step label below preview */}
          <div className="px-4 pt-3 pb-1 flex items-center gap-2">
            <span className="text-[#A05068] text-xs font-semibold uppercase tracking-widest">
              Step {step + 1} of {steps.length} —
            </span>
            <span className="font-playfair text-[#2D000A] text-base font-bold">{steps[step].label}</span>
          </div>

          <div className="flex-1 p-4 md:p-6">{stepContent[step]}</div>
        </main>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white/97 backdrop-blur-md border-t border-[rgba(128,0,32,0.10)] shadow-warm-sm p-4 md:pl-24">
        <button onClick={handleNext} disabled={!canProceed}
          className={cn("w-full font-bold py-4 rounded-2xl transition-all duration-300 font-playfair text-base tracking-wide",
            canProceed
              ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white hover:shadow-warm-lg shadow-warm-sm active:scale-[0.97]"
              : "bg-[#FF6B9D]/40 text-white/50 cursor-not-allowed")}>
          {step === steps.length - 1 ? "Add to Cart" : "Next →"}
        </button>
      </footer>
    </div>
  );
}
