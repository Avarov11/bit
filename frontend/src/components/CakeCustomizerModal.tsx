"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChefHat, Sparkles, PenLine, Box, ChevronRight, X, Loader2, Gift } from "lucide-react";
import type { DbProduct } from "@/lib/types";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/context/LanguageContext";

async function uploadToOrders(file: File, folder: string): Promise<string | null> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  const res = await fetch("/api/upload-order-file", { method: "POST", body: fd });
  if (!res.ok) { console.error("Upload error:", await res.text()); return null; }
  const { url } = await res.json();
  return url ?? null;
}

// ─── Data ────────────────────────────────────────────────────────────────────

const SHAPES = [
  {
    id: "cake", label: "Full Cake",
    photo: "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes/brown1.png?v=2",
    svg: null,
  },
  {
    id: "heart", label: "Heart",
    photo: "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes%20heart/1br.png?v=2",
    svg: null,
  },
  {
    id: "square", label: "Square",
    photo: "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shape%20square/1br.png?v=2",
    svg: null,
  },
];

const FLAVORS = [
  { id: "chocolate", label: "Chocolate",       emoji: "🍫", tKey: "cust_modal_flavor_chocolate", subKey: "cust_modal_flavor_choc_sub" },
  { id: "white",     label: "White Chocolate", emoji: "🤍", tKey: "cust_modal_flavor_white",      subKey: "cust_modal_flavor_white_sub" },
];

const CHOC_FLAVORS = [
  { id: "milk",     label: "Milk",     emoji: "🍫", tKey: "cust_modal_choc_milk"     },
  { id: "hazelnut", label: "Hazelnut", emoji: "🌰", tKey: "cust_modal_choc_hazelnut" },
  { id: "oreo",     label: "Oreo",     emoji: "⚫", tKey: "cust_modal_choc_oreo"     },
];

const COLOURS = [
  { id: "white", label: "White", hex: "#FFFFFF", tKey: "cust_modal_colour_white" },
  { id: "pink",  label: "Pink",  hex: "#FF6B9D", tKey: "cust_modal_colour_pink"  },
  { id: "blue",  label: "Blue",  hex: "#B2C8D8", tKey: "cust_modal_colour_blue"  },
];

const CAKE_COLORS = [
  { id: "brown", label: "Brown", hex: "#8B5E3C" },
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "pink",  label: "Pink",  hex: "#FF6B9D" },
  { id: "blue",  label: "Blue",  hex: "#B2C8D8" },
];

const STEP_LABELS = ["Shape", "Flavour", "Sprinkles", "Topping", "Extras"];

const STEPS = [
  { label: "Shape",     Icon: Box      },
  { label: "Flavour",   Icon: ChefHat  },
  { label: "Sprinkles", Icon: Sparkles },
  { label: "Topping",   Icon: PenLine  },
  { label: "Extras",    Icon: Gift     },
];

const DEFAULT_BASE_PRICES: Record<string, number> = { cake: 160, heart: 85, square: 85 };
const DEFAULT_ADDON_PRICES = { sprinkles: 5, writing: 10, sticker: 30, image: 30, candles: 25, balloons: 25 };

interface CustSel {
  shape: string;
  flavorType: string;
  flavor: string;
  colour: string;
  cakeColor: string;
  sprinkles: string;
  topping: string;
  toppingText: string;
  stickerUrl: string | null;
  imageFile: File | null;
  candles: boolean;
  balloons: boolean;
}

const EMPTY_SEL: CustSel = {
  shape: "", flavorType: "", flavor: "", colour: "", cakeColor: "",
  sprinkles: "", topping: "", toppingText: "", stickerUrl: null, imageFile: null,
  candles: false, balloons: false,
};

// ─── Sprinkle overlay ────────────────────────────────────────────────────────

function mkRand(seed: number) {
  let s = seed >>> 0;
  return () => { s = (Math.imul(1664525, s) + 1013904223) >>> 0; return s / 0x100000000; };
}
const SP_COLORS = ["#FF6B9D","#FFD166","#74C2E1","#C77DFF","#FF9443","#06D6A0"];
interface SP { id:number; x:number; startY:number; rise:number; drift:number; rot:number; color:string; w:number; h:number; delay:number }
const SPRINKLES: SP[] = (() => {
  const r = mkRand(7331);
  return Array.from({length:26},(_,id)=>({
    id,
    x:      5  + r() * 90,
    startY: 88 + r() * 14,
    rise:   -(200 + r() * 130),
    drift:  (r() - 0.5) * 70,
    rot:    (r() - 0.5) * 400,
    color:  SP_COLORS[Math.floor(r() * SP_COLORS.length)],
    w:      7  + r() * 5,
    h:      3  + r() * 2,
    delay:  r() * 0.6,
  }));
})();
function SprinkleOverlay({ active }: { active: boolean }) {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!active || !visible) return null;
  return (
    <div style={{position:"absolute",inset:0,overflow:"hidden",pointerEvents:"none"}}>
      {SPRINKLES.map(s=>(
        <span key={s.id} className="sp-pt" style={{
          position:"absolute",
          left:`${s.x}%`,
          top:`${s.startY}%`,
          width:s.w, height:s.h,
          backgroundColor:s.color, borderRadius:2,
          pointerEvents:"none",
          "--rise":`${s.rise}px`,
          "--drift":`${s.drift}px`,
          "--rot":`${s.rot}deg`,
          animation:`sp-rise 3.2s ease-in-out ${s.delay.toFixed(3)}s forwards`,
          opacity:0,
        } as React.CSSProperties}/>
      ))}
    </div>
  );
}

// ─── CakePreview ─────────────────────────────────────────────────────────────

function CakePreview({ shape, colorId, sprinkles = "", text = "", stickerUrl = "", imageUrl = "" }: { shape: string; colorId: string; sprinkles?: string; text?: string; stickerUrl?: string; imageUrl?: string }) {
  const [viewIdx, setViewIdx] = useState(0);
  const [animKey, setAnimKey] = useState(0);
  const prevSpr = useRef("");

  useEffect(() => { setViewIdx(0); }, [shape]);
  useEffect(() => {
    if (text || stickerUrl || imageUrl) setViewIdx(1);
  }, [shape, !!text, !!stickerUrl, !!imageUrl]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (sprinkles === "yes" && prevSpr.current !== "yes") setAnimKey(k => k + 1);
    prevSpr.current = sprinkles;
  }, [sprinkles]);

  let views: JSX.Element[] = [];

  if (!shape || shape === "cake") {
    const BASE = "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes";
    const colorToFile: Record<string, { s: string; t: string }> = {
      brown:  { s: "brown1.png",  t: "brown2.png"  },
      beige:  { s: "beige1.png",  t: "beige2.png"  },
      black:  { s: "black1.png",  t: "black2.png"  },
      pink:   { s: "red1.png",    t: "red2.png"    },
      blue:   { s: "blue1.png",   t: "blue2.png"   },
      white:  { s: "white1.png",  t: "white2.png"  },
    };
    const files = colorToFile[colorId] ?? colorToFile["brown"];
    const sideImg = `${BASE}/${files.s}?v=2`;
    const topImg  = `${BASE}/${files.t}?v=2`;
    if (typeof window !== "undefined") {
      [sideImg, topImg].forEach(src => { const i = new window.Image(); i.src = src; });
    }
    const photoOverlay = (text || stickerUrl || imageUrl) ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="max-w-[38%] max-h-[30%] object-contain drop-shadow-lg rounded-md" />
        )}
        {stickerUrl && !imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stickerUrl} alt="" className="max-w-[44%] max-h-[36%] object-contain drop-shadow-lg" />
        )}
        {text && (
          <p className="text-white font-bold text-sm md:text-base text-center px-4 leading-tight"
            style={{fontFamily:"Georgia,serif", textShadow:"0 1px 4px rgba(0,0,0,0.7),0 0 1px rgba(0,0,0,0.4)"}}>
            {text}
          </p>
        )}
      </div>
    ) : null;
    views = [
      <div key="s" className="relative w-full h-full flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={sideImg} alt="Full Cake" className="w-full h-full object-contain" />
      </div>,
      <div key="t" className="relative w-full h-full flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={topImg} alt="Full Cake top view" className="w-full h-full object-contain" />
        {photoOverlay}
      </div>,
    ];
  } else if (shape === "heart") {
    const BASE_H = "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes%20heart";
    const heartColorToFile: Record<string, [string, string, string]> = {
      brown: ["1br.png",    "2br.png", "3br.png"],
      beige: ["1be.png",    "2be.png", "3be.png"],
      black: ["1bl.png",    "2bl.png", "3bl.png"],
      pink:  ["1pi.png",    "2pi.png", "3pi.png"],
      blue:  ["1%20bb.png", "2bb.png", "3bb.png"],
      white: ["1wh.png",    "2wh.png", "3wh.png"],
    };
    const hFiles = heartColorToFile[colorId] ?? heartColorToFile["brown"];
    const hImgs = hFiles.map(f => `${BASE_H}/${f}?v=2`);
    if (typeof window !== "undefined") {
      hImgs.forEach(src => { const i = new window.Image(); i.src = src; });
    }
    const photoOverlay = (text || stickerUrl || imageUrl) ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="max-w-[38%] max-h-[30%] object-contain drop-shadow-lg rounded-md" />
        )}
        {stickerUrl && !imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stickerUrl} alt="" className="max-w-[44%] max-h-[36%] object-contain drop-shadow-lg" />
        )}
        {text && (
          <p className="text-white font-bold text-sm md:text-base text-center px-4 leading-tight"
            style={{fontFamily:"Georgia,serif", textShadow:"0 1px 4px rgba(0,0,0,0.7),0 0 1px rgba(0,0,0,0.4)"}}>
            {text}
          </p>
        )}
      </div>
    ) : null;
    views = hImgs.map((src, i) => (
      <div key={i} className="relative w-full h-full flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`Heart brownie view ${i + 1}`} className="w-full h-full object-contain" />
        {i === 1 ? photoOverlay : null}
      </div>
    ));
  } else {
    // Square — photos from shape square bucket
    const BASE_S = "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shape%20square";
    const squareColorToFile: Record<string, [string, string, string]> = {
      brown: ["1br.png", "2br.png", "3br.png"],
      beige: ["1be.png", "2be.png", "3be.png"],
      black: ["1bl.png", "2bl.png", "3bl.png"],
      pink:  ["1pi.png", "2pi.png", "3pi.png"],
      blue:  ["1bb.png", "2bb.png", "3bb.png"],
      white: ["1wh.png", "2wh.png", "3wh.png"],
    };
    const sFiles = squareColorToFile[colorId] ?? squareColorToFile["brown"];
    const sImgs = sFiles.map(f => `${BASE_S}/${f}?v=2`);
    if (typeof window !== "undefined") {
      sImgs.forEach(src => { const i = new window.Image(); i.src = src; });
    }
    const photoOverlay = (text || stickerUrl || imageUrl) ? (
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pointer-events-none">
        {imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="" className="max-w-[38%] max-h-[30%] object-contain drop-shadow-lg rounded-md" />
        )}
        {stickerUrl && !imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={stickerUrl} alt="" className="max-w-[44%] max-h-[36%] object-contain drop-shadow-lg" />
        )}
        {text && (
          <p className="text-white font-bold text-sm md:text-base text-center px-4 leading-tight"
            style={{fontFamily:"Georgia,serif", textShadow:"0 1px 4px rgba(0,0,0,0.7),0 0 1px rgba(0,0,0,0.4)"}}>
            {text}
          </p>
        )}
      </div>
    ) : null;
    views = sImgs.map((src, i) => (
      <div key={i} className="relative w-full h-full flex items-center justify-center p-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={`Square brownie view ${i + 1}`} className="w-full h-full object-contain" />
        {i === 1 ? photoOverlay : null}
      </div>
    ));
  }

  const viewCount = views.length;
  const idx = Math.min(viewIdx, viewCount - 1);

  return (
    <div className="relative w-full h-full">
      {/* Views + sprinkle overlay isolated so they can never reach the nav buttons */}
      <div className="absolute inset-0 overflow-hidden">
        {views[idx]}
        <SprinkleOverlay key={"sp-" + animKey} active={sprinkles === "yes"} />
      </div>
      {/* Nav buttons are siblings of the inner container — no stacking conflict */}
      <button
        onClick={() => setViewIdx(i => (i + 1) % viewCount)}
        aria-label="Next view"
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm text-[#800020] transition-colors"
      >
        <ChevronRight size={16} />
      </button>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        {Array.from({ length: viewCount }, (_, i) => (
          <button key={i} onClick={() => setViewIdx(i)}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${i === idx ? "bg-[#800020]" : "bg-[#800020]/30"}`} />
        ))}
      </div>
    </div>
  );
}

// ─── SummaryRow ───────────────────────────────────────────────────────────────

function SummaryRow({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[rgba(128,0,32,0.06)] last:border-0">
      <span className="text-xs font-bold text-[#A05068] uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        {dot && <div className="w-3.5 h-3.5 rounded-full border border-[rgba(128,0,32,0.20)]" style={{ backgroundColor: dot }} />}
        <span className="text-sm font-semibold text-[#2D000A] text-right max-w-[200px]">{value}</span>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function CakeCustomizerModal({
  product,
  onClose,
}: {
  product: DbProduct | null;
  onClose: () => void;
}) {
  const { t } = useLanguage();
  const addToCart = useCartStore((s) => s.addItem);
  const router    = useRouter();
  const [custStep,   setCustStep]   = useState(0);
  const [custSel,    setCustSel]    = useState<CustSel>(EMPTY_SEL);

  const availableShapes  = product?.allowed_shapes?.length
    ? SHAPES.filter(s => product.allowed_shapes.includes(s.id))
    : SHAPES;
  const availableFlavors = product?.allowed_flavors?.length
    ? FLAVORS.filter(f => product.allowed_flavors.includes(f.id))
    : FLAVORS;
  const allowedToppings  = product?.allowed_toppings ?? ["write", "sticker", "image"];
  const [uploading,  setUploading]  = useState(false);
  const [stickers,          setStickers]          = useState<{ name: string; url: string }[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [rawPricing,        setRawPricing]        = useState<Record<string, number>>({});
  const imageInputRef                             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  useEffect(() => {
    const category = product?.category ?? "Birthday";
    fetch(`/api/stickers?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setStickers(data); })
      .catch(() => {});
  }, [product?.category]);

  useEffect(() => {
    fetch("/api/customizer-pricing")
      .then((r) => r.json())
      .then((data) => { if (data && typeof data === "object") setRawPricing(data); })
      .catch(() => {});
  }, []);

  const BASE_PRICES = {
    cake:   rawPricing["shape_cake"]   ?? DEFAULT_BASE_PRICES.cake,
    heart:  rawPricing["shape_heart"]  ?? DEFAULT_BASE_PRICES.heart,
    square: rawPricing["shape_square"] ?? DEFAULT_BASE_PRICES.square,
  };
  const ADDON_PRICES = {
    sprinkles: rawPricing["addon_sprinkles"] ?? DEFAULT_ADDON_PRICES.sprinkles,
    writing:   rawPricing["addon_writing"]   ?? DEFAULT_ADDON_PRICES.writing,
    sticker:   rawPricing["addon_sticker"]   ?? DEFAULT_ADDON_PRICES.sticker,
    image:     rawPricing["addon_image"]     ?? DEFAULT_ADDON_PRICES.image,
    candles:   rawPricing["addon_candles"]   ?? DEFAULT_ADDON_PRICES.candles,
    balloons:  rawPricing["addon_balloons"]  ?? DEFAULT_ADDON_PRICES.balloons,
  };
  const calcPrice = (): number => {
    const base    = BASE_PRICES[custSel.shape as keyof typeof BASE_PRICES] ?? 0;
    const spr     = custSel.sprinkles === "yes" ? ADDON_PRICES.sprinkles : 0;
    const topping = custSel.topping === "write"   ? ADDON_PRICES.writing
                  : custSel.topping === "sticker" ? ADDON_PRICES.sticker
                  : custSel.topping === "image"   ? ADDON_PRICES.image : 0;
    const extras  = (custSel.candles ? ADDON_PRICES.candles : 0)
                  + (custSel.balloons ? ADDON_PRICES.balloons : 0);
    return base + spr + topping + extras;
  };

  // Reset state whenever product changes
  const [lastProduct, setLastProduct] = useState<DbProduct | null>(null);
  if (product !== lastProduct) {
    setLastProduct(product);
    if (product) {
      setCustStep(0);
      setCustSel(EMPTY_SEL);
      setShowStickerPicker(false);
    }
  }

  const [previewImageUrl, setPreviewImageUrl] = useState("");
  useEffect(() => {
    if (custSel.topping === "image" && custSel.imageFile) {
      const url = URL.createObjectURL(custSel.imageFile);
      setPreviewImageUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewImageUrl("");
  }, [custSel.imageFile, custSel.topping]);

  if (!product) return null;

  const canProceed = (): boolean => {
    if (custStep === 0) return !!custSel.shape;
    if (custStep === 1) {
      if (custSel.flavorType === "chocolate") return !!custSel.flavor;
      if (custSel.flavorType === "white") return !!custSel.colour;
      return false;
    }
    if (custStep === 2) return !!custSel.sprinkles;
    if (custStep === 3) {
      if (custSel.topping === "write")   return true;
      if (custSel.topping === "sticker") return custSel.stickerUrl !== null;
      if (custSel.topping === "image")   return custSel.imageFile !== null;
      return false;
    }
    if (custStep === 4) return true; // Extras is optional
    return true;
  };

  const handleNext = () => { if (custStep < 5) setCustStep((s) => s + 1); };
  const handleBack = () => {
    if (custStep > 0) setCustStep((s) => s - 1);
    else onClose();
  };

  const commitToCart = async () => {
    const flavorLabel = custSel.flavorType === "chocolate"
      ? CHOC_FLAVORS.find((f) => f.id === custSel.flavor)?.label ?? "Chocolate"
      : `White Chocolate – ${COLOURS.find((c) => c.id === custSel.colour)?.label ?? ""}`;
    const cakeColorLabel = CAKE_COLORS.find((c) => c.id === custSel.cakeColor)?.label;
    const toppingsList: string[] = [];
    if (custSel.sprinkles === "yes") toppingsList.push("Sprinkles");
    if (custSel.candles)  toppingsList.push("Candles");
    if (custSel.balloons) toppingsList.push("Balloons");

    const stickerUrl = custSel.topping === "sticker" ? custSel.stickerUrl ?? undefined : undefined;
    let imageUrl:   string | undefined;
    if (custSel.topping === "image" && custSel.imageFile) {
      imageUrl = (await uploadToOrders(custSel.imageFile, "images")) ?? undefined;
    }

    addToCart({
      productId:    product.id,
      productName:  product.name,
      productImage: product.image_url ?? "",
      quantity:     1,
      unitPrice:    calcPrice(),
      customization: {
        shape:    SHAPES.find((s) => s.id === custSel.shape)?.label,
        flavor:   flavorLabel,
        color:    cakeColorLabel || undefined,
        toppings: toppingsList.length ? toppingsList : undefined,
        message:  custSel.topping === "write" ? custSel.toppingText || undefined : undefined,
        stickerUrl,
        imageUrl,
      },
    });
  };

  const handleCheckout = async () => {
    setUploading(true);
    try { await commitToCart(); onClose(); router.push("/checkout"); }
    finally { setUploading(false); }
  };
  const handleContinue = async () => {
    setUploading(true);
    try { await commitToCart(); onClose(); router.push("/menu"); }
    finally { setUploading(false); }
  };

  const OptionCard = ({
    id, emoji, label, sub, selected, onClick,
  }: { id: string; emoji: string; label: string; sub?: string; selected: boolean; onClick: () => void }) => (
    <button
      key={id} onClick={onClick}
      className={cn(
        "relative rounded-2xl overflow-hidden bg-white text-left transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
        selected ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
      )}
    >
      {selected && (
        <span className="absolute top-2.5 right-2.5 z-10 bg-[#800020] rounded-full p-0.5">
          <Check size={11} className="text-white" strokeWidth={3} />
        </span>
      )}
      <div className="bg-[#F5D0D8] flex items-center justify-center py-7">
        <span className="text-5xl">{emoji}</span>
      </div>
      <div className="p-3">
        <p className="font-playfair font-bold text-[#2D000A] text-sm">{label}</p>
        {sub && <p className="text-[#A05068] text-[11px] mt-0.5">{sub}</p>}
      </div>
    </button>
  );

  const renderStep = () => {
    if (custStep === 4) {
      const toggle = (key: "candles" | "balloons") =>
        setCustSel((p) => ({ ...p, [key]: !p[key] }));
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">Extras</h2>
          <p className="text-[#A05068] text-sm mb-6">Add a little something extra — totally optional 🎉</p>
          <div className="grid grid-cols-2 gap-4">
            {/* Candles */}
            <button
              onClick={() => toggle("candles")}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                custSel.candles ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
              )}
            >
              {custSel.candles && (
                <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              <div className="bg-[#F5D0D8] flex items-center justify-center py-8">
                <span className="text-5xl">🕯️</span>
              </div>
              <div className="p-3">
                <p className="font-playfair font-bold text-[#2D000A] text-sm">Candles</p>
                <p className="text-[#A05068] text-[11px] mt-0.5">Add birthday candles</p>
              </div>
            </button>

            {/* Balloons */}
            <button
              onClick={() => toggle("balloons")}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                custSel.balloons ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
              )}
            >
              {custSel.balloons && (
                <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              <div className="bg-[#F5D0D8] flex items-center justify-center py-8">
                <span className="text-5xl">🎈</span>
              </div>
              <div className="p-3">
                <p className="font-playfair font-bold text-[#2D000A] text-sm">Balloons</p>
                <p className="text-[#A05068] text-[11px] mt-0.5">Add decorative balloons</p>
              </div>
            </button>
          </div>

          {!custSel.candles && !custSel.balloons && (
            <p className="text-center text-[#A05068]/60 text-xs mt-5">Tap to select, or skip to continue</p>
          )}
        </div>
      );
    }

    if (custStep === 5) {
      const shapeName  = t("cust_modal_shape_" + custSel.shape) || "—";
      const flavorName = custSel.flavorType === "chocolate"
        ? t("cust_modal_choc_" + custSel.flavor) || "—"
        : t("cust_modal_flavor_white");
      const colourData = COLOURS.find((c) => c.id === custSel.colour);
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">{t("cust_modal_summary_title")}</h2>
          <p className="text-[#800020]/60 text-sm mb-5">{t("cust_modal_summary_subtitle")}</p>
          <div className="bg-white rounded-2xl px-5 py-2 shadow-warm-sm mb-6">
            <SummaryRow label={t("cust_modal_summary_product")}   value={product.name} />
            <SummaryRow label={t("cust_modal_summary_shape")}     value={shapeName} />
            <SummaryRow label={t("cust_modal_summary_flavour")}   value={flavorName} />
            {custSel.flavorType === "white" && colourData && (
              <SummaryRow label={t("cust_modal_summary_colour")} value={t(colourData.tKey)} dot={colourData.hex} />
            )}
            <SummaryRow label={t("cust_modal_summary_sprinkles")} value={custSel.sprinkles === "yes" ? t("cust_modal_summary_yes") : t("cust_modal_summary_none")} />
            <SummaryRow
              label={t("cust_modal_summary_topping")}
              value={
                custSel.topping === "write"   ? `${t("cust_modal_writing")} "${custSel.toppingText || "—"}"`
                : custSel.topping === "sticker" && custSel.stickerUrl ? `🎨 Sticker selected`
                : custSel.topping === "image"   && custSel.imageFile   ? `📷 ${custSel.imageFile.name}`
                : "—"
              }
            />
            <SummaryRow label="Candles"  value={custSel.candles  ? `🕯️ Yes (+QAR ${ADDON_PRICES.candles})` : "None"} />
            <SummaryRow label="Balloons" value={custSel.balloons ? `🎈 Yes (+QAR ${ADDON_PRICES.balloons})` : "None"} />
          </div>
        </div>
      );
    }

    if (custStep === 0) {
      return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">{t("cust_modal_shape_title")}</h2>
        <p className="text-[#A05068] text-sm mb-6">{t("cust_modal_shape_subtitle")}</p>
        <div className={cn("grid gap-4", availableShapes.length === 2 ? "grid-cols-2" : "grid-cols-3")}>
          {availableShapes.map((shape) => {
            const sel = custSel.shape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => setCustSel((p) => ({ ...p, shape: shape.id, topping: "", toppingText: "", stickerUrl: null, imageFile: null }))}
                className={cn(
                  "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                  sel ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
                )}
              >
                {sel && (
                  <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                )}
                {shape.photo ? (
                  <div className="w-full h-36 md:h-40 bg-[#F5D0D8] flex items-center justify-center p-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={shape.photo} alt={shape.label} className="w-full h-full object-contain" />
                  </div>
                ) : (
                  <div className="bg-[#F5D0D8] flex items-center justify-center py-7 md:py-9">{shape.svg}</div>
                )}
                <div className="p-3 md:p-4">
                  <p className="font-playfair font-bold text-[#2D000A] text-sm md:text-base">{t("cust_modal_shape_" + shape.id)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
    }

    if (custStep === 1) {
      const isChocType  = custSel.flavorType === "chocolate";
      const isWhiteType = custSel.flavorType === "white";
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">{t("cust_modal_flavor_title")}</h2>
          <p className="text-[#A05068] text-sm mb-5">{t("cust_modal_flavor_subtitle")}</p>
          <div className={cn("grid gap-3 mb-5", availableFlavors.length === 1 ? "grid-cols-1 max-w-[50%]" : "grid-cols-2")}>
            {availableFlavors.map((f) => (
              <OptionCard
                key={f.id} id={f.id} emoji={f.emoji} label={t(f.tKey)} sub={t(f.subKey)}
                selected={custSel.flavorType === f.id}
                onClick={() => setCustSel((p) => ({ ...p, flavorType: f.id, flavor: "", colour: "", cakeColor: f.id === "chocolate" ? "brown" : "" }))}
              />
            ))}
          </div>
          {isChocType && (
            <div>
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-3">{t("cust_modal_choose_flavor")}</p>
              <div className="grid grid-cols-3 gap-3">
                {CHOC_FLAVORS.map((choc) => {
                  const sel = custSel.flavor === choc.id;
                  return (
                    <button
                      key={choc.id}
                      onClick={() => setCustSel((p) => ({
                        ...p,
                        flavor: choc.id,
                        cakeColor: choc.id === "milk" ? "brown" : choc.id === "hazelnut" ? "beige" : "black",
                      }))}
                      className={cn(
                        "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                        sel ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
                      )}
                    >
                      {sel && (
                        <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                      <div className="bg-[#F5D0D8] flex items-center justify-center py-5">
                        <span className="text-4xl">{choc.emoji}</span>
                      </div>
                      <div className="p-2.5">
                        <p className="font-playfair font-bold text-[#2D000A] text-xs">{t(choc.tKey)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {isWhiteType && (() => {
            const colGradients: Record<string, string> = {
              white: "linear-gradient(145deg, #FFFEF9 0%, #F5ECE4 52%, #EDE0D4 100%)",
              pink:  "linear-gradient(145deg, #FFB8CC 0%, #FF6B9D 52%, #E84C88 100%)",
              blue:  "linear-gradient(145deg, #D6EDFA 0%, #B2C8D8 52%, #8AAFC8 100%)",
            };
            const colSub: Record<string, string> = {
              white: "Classic Pearl",
              pink:  "Rose Blush",
              blue:  "Sky Dream",
            };
            return (
              <div>
                <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-5">{t("cust_modal_choose_colour")}</p>
                <div className="grid grid-cols-3 gap-3">
                  {COLOURS.map((col) => {
                    const sel = custSel.colour === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => setCustSel((p) => ({ ...p, colour: col.id, cakeColor: col.id }))}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={cn(
                          "relative w-[78px] h-[78px] rounded-full transition-all duration-300",
                          sel
                            ? "scale-110 shadow-[0_0_0_3px_#800020,0_6px_20px_rgba(128,0,32,0.22)]"
                            : "shadow-[0_2px_10px_rgba(0,0,0,0.12)] group-hover:scale-105 group-hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)]"
                        )}>
                          <div
                            className="w-full h-full rounded-full overflow-hidden relative"
                            style={{ background: colGradients[col.id] ?? col.hex }}
                          >
                            {/* Shimmer highlight */}
                            <div className="absolute top-2 left-3 w-8 h-4 rounded-full bg-white/45 blur-sm pointer-events-none" />
                            <div className="absolute top-3.5 left-4.5 w-4 h-2 rounded-full bg-white/65 blur-[1.5px] pointer-events-none" />
                            {/* Selection check */}
                            {sel && (
                              <div className="absolute inset-0 flex items-center justify-center bg-[#800020]/10 rounded-full">
                                <div className="w-7 h-7 rounded-full bg-white/90 shadow-md flex items-center justify-center">
                                  <Check size={13} className="text-[#800020]" strokeWidth={3.5} />
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-center">
                          <p className={cn("text-sm font-bold transition-colors leading-tight", sel ? "text-[#800020]" : "text-[#2D000A]/80 group-hover:text-[#800020]")}>
                            {t(col.tKey)}
                          </p>
                          <p className="text-[10px] text-[#A05068]/65 mt-0.5 font-medium">{colSub[col.id]}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })()}
        </div>
      );
    }

    if (custStep === 2) return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">{t("cust_modal_sprinkles_title")}</h2>
        <p className="text-[#A05068] text-sm mb-5">{t("cust_modal_sprinkles_subtitle")}</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "yes", labelKey: "cust_modal_sprinkles_yes", emoji: "🌈", subKey: "cust_modal_sprinkles_yes_sub" },
            { id: "no",  labelKey: "cust_modal_sprinkles_no",  emoji: "✖️", subKey: "cust_modal_sprinkles_no_sub"  },
          ].map((opt) => (
            <OptionCard
              key={opt.id} id={opt.id} emoji={opt.emoji} label={t(opt.labelKey)} sub={t(opt.subKey)}
              selected={custSel.sprinkles === opt.id}
              onClick={() => setCustSel((p) => ({ ...p, sprinkles: opt.id }))}
            />
          ))}
        </div>
      </div>
    );

    if (custStep === 3) {
      const shape        = custSel.shape;
      const showSticker  = allowedToppings.includes("sticker") && (shape === "square" || shape === "cake");
      const showImage    = allowedToppings.includes("image")   && shape === "cake";
      const showWrite    = allowedToppings.includes("write");
      const charLimit = shape === "cake" ? 5 : 3;
      const count = custSel.toppingText.length;
      const cardCols = showWrite && showImage ? "grid-cols-2" : "grid-cols-1 max-w-[50%]";

      return (
        <div className="space-y-5">
          <div>
            <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">{t("cust_modal_topping_title")}</h2>
            <p className="text-[#A05068] text-sm">{t("cust_modal_topping_subtitle")}</p>
          </div>

          {/* Write + Image option cards */}
          {(showWrite || showImage) && (
            <div className={cn("grid gap-3", cardCols)}>
              {showWrite && (
                <OptionCard
                  id="write" emoji="✍️" label={t("cust_modal_write")}
                  sub={shape === "cake" ? "Max 5 letters" : "Max 3 letters"}
                  selected={custSel.topping === "write"}
                  onClick={() => setCustSel((p) => ({ ...p, topping: "write", stickerUrl: null, imageFile: null }))}
                />
              )}
              {showImage && (
                <OptionCard
                  id="image" emoji="📷" label={t("cust_modal_image")}
                  sub={t("cust_modal_image_sub")}
                  selected={custSel.topping === "image"}
                  onClick={() => setCustSel((p) => ({ ...p, topping: "image", toppingText: "", stickerUrl: null }))}
                />
              )}
            </div>
          )}

          {/* Write textarea */}
          {custSel.topping === "write" && (
            <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#A05068] uppercase tracking-wider">{t("cust_modal_your_message")}</label>
                <span className={cn("text-xs font-bold tabular-nums", count >= charLimit ? "text-[#800020]" : "text-[#A05068]")}>
                  {count} / {charLimit} letters
                </span>
              </div>
              <textarea
                value={custSel.toppingText}
                onChange={(e) => {
                  const val = e.target.value;
                  if (val.length <= charLimit) setCustSel((p) => ({ ...p, toppingText: val }));
                }}
                placeholder={t("cust_modal_msg_placeholder")}
                rows={2}
                className="w-full px-4 py-3 bg-[#FFFFFF] border border-[rgba(128,0,32,0.08)] focus:border-[#800020] rounded-xl text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none transition-colors resize-none"
              />
            </div>
          )}

          {/* Image upload */}
          {custSel.topping === "image" && (
            <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-3">{t("cust_modal_upload_image_label")}</p>
              <button
                onClick={() => imageInputRef.current?.click()}
                className={cn(
                  "w-full rounded-xl border-2 border-dashed py-8 text-center transition-all duration-200",
                  custSel.imageFile ? "border-[#800020] bg-[#F5D0D8]/30" : "border-[rgba(128,0,32,0.20)] hover:border-[#800020] hover:bg-[#F5D0D8]/20"
                )}
              >
                {custSel.imageFile ? (
                  <div>
                    <p className="text-3xl mb-2">📷</p>
                    <p className="text-sm text-[#800020] font-semibold truncate px-6">{custSel.imageFile.name}</p>
                    <p className="text-[11px] text-[#A05068] mt-1">{t("cust_modal_tap_change")}</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-3xl mb-2">📤</p>
                    <p className="text-sm font-semibold text-[#800020]">{t("cust_modal_tap_upload")}</p>
                    <p className="text-[11px] text-[#A05068] mt-1">{t("cust_modal_formats")}</p>
                  </div>
                )}
              </button>
              {custSel.imageFile && (
                <button onClick={() => setCustSel((p) => ({ ...p, imageFile: null }))} className="text-[11px] text-[#800020]/60 hover:text-[#800020] mt-2 transition-colors">
                  {t("cust_modal_remove")}
                </button>
              )}
            </div>
          )}

          {/* Sticker — button triggers overlay picker */}
          {showSticker && (
            <>
              {custSel.topping === "sticker" && custSel.stickerUrl ? (
                /* Selected sticker preview */
                <div className="bg-white rounded-2xl p-4 shadow-warm-sm flex items-center gap-4">
                  <div className="relative w-16 h-16 shrink-0 rounded-xl overflow-hidden border-2 border-[#800020]/20">
                    <Image src={custSel.stickerUrl} alt="Selected sticker" fill sizes="64px" className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-[#800020] uppercase tracking-wider mb-0.5">Sticker selected</p>
                    <p className="text-sm font-semibold text-[#2D000A] truncate">
                      {stickers.find((s) => s.url === custSel.stickerUrl)?.name.replace(/\.[^.]+$/, "") ?? "Sticker"}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={() => setShowStickerPicker(true)}
                      className="text-xs font-bold text-[#800020] bg-[#F5D0D8] hover:bg-[#F5D0D8]/80 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Change
                    </button>
                    <button
                      onClick={() => setCustSel((p) => ({ ...p, topping: "", stickerUrl: null }))}
                      className="text-[11px] text-[#800020]/50 hover:text-[#800020] text-center transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                /* Select sticker button */
                <button
                  onClick={() => setShowStickerPicker(true)}
                  className="w-full bg-white rounded-2xl p-4 shadow-warm-sm border-2 border-dashed border-[rgba(128,0,32,0.18)] hover:border-[#800020]/40 hover:bg-[#F5D0D8]/20 transition-all duration-200 flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <span className="text-2xl">🎨</span>
                  <span className="font-bold text-[#800020] text-sm">Select your sticker</span>
                </button>
              )}

              {/* Inline sticker grid */}
              {showStickerPicker && (
                <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider">
                      {stickers.length} Stickers
                    </p>
                    <button
                      onClick={() => setShowStickerPicker(false)}
                      className="text-[11px] font-bold text-[#800020]/50 hover:text-[#800020] transition-colors"
                    >
                      Close
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {stickers.map((s) => {
                      const sel = custSel.stickerUrl === s.url;
                      return (
                        <button
                          key={s.url}
                          onClick={() => {
                            setCustSel((p) => ({
                              ...p,
                              topping: "sticker",
                              stickerUrl: s.url,
                              toppingText: "",
                              imageFile: null,
                            }));
                            setShowStickerPicker(false);
                          }}
                          className={cn(
                            "relative rounded-2xl overflow-hidden border-2 transition-all duration-200 aspect-square active:scale-95",
                            sel
                              ? "border-[#800020] ring-2 ring-[#800020]/20"
                              : "border-[rgba(128,0,32,0.08)] hover:border-[#800020]/40 hover:scale-[1.03]"
                          )}
                        >
                          <Image src={s.url} alt={s.name} fill sizes="100px" className="object-cover" />
                          {sel && (
                            <>
                              <span className="absolute inset-0 bg-[#800020]/10" />
                              <span className="absolute top-1.5 right-1.5 bg-[#800020] rounded-full p-0.5 shadow">
                                <Check size={10} className="text-white" strokeWidth={3} />
                              </span>
                            </>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0] ?? null; setCustSel((p) => ({ ...p, imageFile: f })); e.target.value = ""; }} />
        </div>
      );
    }

    return null;
  };

  const previewText    = custSel.topping === "write"   ? custSel.toppingText       : "";
  const previewSticker = custSel.topping === "sticker" ? custSel.stickerUrl ?? "" : "";

  return (
    <>
      {/* ══ MOBILE panel ═══════════════════════════════════════════════════════ */}
      <div className="md:hidden fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: "#F5D0D8" }}>
        {/* Navbar spacer */}
        <div className="h-14 shrink-0" />

        {/* Step tabs */}
        <div className="shrink-0 bg-[#F5D0D8]/97 backdrop-blur-md border-b border-[rgba(128,0,32,0.12)] overflow-x-auto scrollbar-hide">
          <div className="flex">
            {STEPS.map((step, i) => {
              const active = i === custStep;
              const done   = i < custStep;
              return (
                <button key={step.label} onClick={() => { if (done) setCustStep(i); }}
                  className={cn("flex flex-col items-center gap-1 px-5 pt-2.5 pb-2 shrink-0 border-b-2 transition-all duration-200",
                    active ? "border-[#800020] text-[#800020]" : done ? "border-transparent text-[#2D000A]/60 cursor-pointer" : "border-transparent text-[#2D000A]/30 cursor-default")}>
                  <step.Icon size={15} strokeWidth={active ? 2.5 : 2} />
                  <span className="text-[10px] font-bold tracking-wide">{t("cust_modal_step_" + step.label.toLowerCase())}</span>
                </button>
              );
            })}
            <button className={cn("flex flex-col items-center gap-1 px-5 pt-2.5 pb-2 shrink-0 border-b-2 transition-all duration-200",
              custStep === 5 ? "border-[#800020] text-[#800020]" : "border-transparent text-[#2D000A]/30 cursor-default")}>
              <Check size={15} strokeWidth={custStep === 5 ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">{t("cust_modal_step_summary")}</span>
            </button>
          </div>
        </div>

        {/* Main area — flex so preview + options fill the remaining screen */}
        <div className="flex-1 flex flex-col min-h-0">

          {custStep < 5 && (
            <div className="shrink-0 px-4 pt-2 pb-1">
              {/* Compact step header */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="min-w-0">
                  <div className="inline-flex items-center bg-[#800020]/10 rounded-full px-2 py-0.5 mb-1">
                    <span className="text-[#800020] text-[9px] font-bold uppercase tracking-widest">{t("cust_modal_step")} {custStep + 1} {t("cust_modal_of")} {STEPS.length}</span>
                  </div>
                  <p className="font-playfair text-lg font-bold text-[#2D000A] leading-tight">{t("cust_modal_step_" + STEPS[custStep].label.toLowerCase())}</p>
                  <p className="text-[#A05068] text-[11px] font-medium">{t("cust_modal_step_desc_" + custStep)}</p>
                </div>
                <button onClick={onClose} className="w-9 h-9 rounded-full bg-black/10 flex items-center justify-center text-[#2D000A]/50 shrink-0">
                  <X size={15} />
                </button>
              </div>

              {/* Preview card — scales with viewport height */}
              <div className="w-full relative rounded-2xl overflow-hidden shadow-[0_6px_30px_rgba(0,0,0,0.12)]" style={{ height: "34dvh" }}>
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 70% 55% at 50% 52%, rgba(255,230,238,0.55) 0%, transparent 100%)"}} />
                <div className="absolute bottom-0 inset-x-0 h-8 bg-gradient-to-t from-[#F8ECF0] to-transparent" />
                <div className="absolute top-2 right-3 bg-[#800020]/8 rounded-full px-2 py-0.5">
                  <span className="text-[8px] font-bold text-[#800020]/45 uppercase tracking-[0.18em]">Preview</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center pb-8">
                  <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} sprinkles={custSel.sprinkles} text={previewText} stickerUrl={previewSticker} imageUrl={previewImageUrl} />
                </div>
                {custSel.shape && (
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-3 py-2 bg-white/80 backdrop-blur-sm border-t border-[rgba(128,0,32,0.06)]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-[#800020]/50 uppercase tracking-wide">Base</span>
                      <span className="text-[10px] text-[#800020]/40">QAR {BASE_PRICES[custSel.shape as keyof typeof BASE_PRICES]}</span>
                      {custSel.sprinkles === "yes" && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.sprinkles}</span>}
                      {custSel.topping === "write"   && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.writing}</span>}
                      {custSel.topping === "sticker" && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.sticker}</span>}
                      {custSel.topping === "image"   && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.image}</span>}
                      {custSel.candles   && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.candles} 🕯️</span>}
                      {custSel.balloons  && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.balloons} 🎈</span>}
                    </div>
                    <span className="font-playfair font-bold text-[#800020] text-sm shrink-0">QAR {calcPrice()}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Scrollable step content */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {custStep === 5 && (
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(128,0,32,0.12)]">
                <div>
                  <p className="text-[10px] font-bold text-[#2D000A]/60 uppercase tracking-widest mb-0.5">{t("cust_modal_review_header")}</p>
                  <h2 className="font-playfair text-lg font-bold text-[#2D000A] leading-tight">{product.name}</h2>
                </div>
                <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-[#2D000A]/60 hover:text-[#2D000A] transition-colors"><X size={20} /></button>
              </div>
            )}
            <div className="max-w-lg mx-auto px-4 py-4 pb-28">{renderStep()}</div>
          </div>

        </div>

        {/* Bottom buttons */}
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5D0D8]/97 backdrop-blur-md border-t border-[rgba(128,0,32,0.12)] px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          {custStep < 5 ? (
            <div className="max-w-lg mx-auto flex gap-3">
              <button onClick={handleBack} className="flex-1 bg-white/70 hover:bg-white text-[#800020] font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.97]">
                {custStep === 0 ? t("cust_modal_cancel") : t("cust_modal_back")}
              </button>
              <button onClick={handleNext} disabled={!canProceed()}
                className={cn("flex-[2] font-bold py-3.5 rounded-2xl text-sm font-playfair tracking-wide transition-all",
                  canProceed() ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm active:scale-[0.97]" : "bg-[#FF6B9D]/40 text-white/50 cursor-not-allowed")}>
                {custStep === STEP_LABELS.length - 1 ? t("cust_modal_review_btn") : t("cust_modal_next")}
              </button>
            </div>
          ) : (
            <div className="max-w-lg mx-auto flex gap-3">
              <button onClick={handleContinue} disabled={uploading}
                className="flex-1 bg-white/70 hover:bg-white text-[#800020] font-bold py-3.5 rounded-2xl text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? t("cust_modal_uploading") : t("cust_modal_continue")}
              </button>
              <button onClick={handleCheckout} disabled={uploading}
                className="flex-[2] bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-bold py-3.5 rounded-2xl font-playfair text-base tracking-wide transition-all shadow-warm-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                {uploading ? <><Loader2 size={16} className="animate-spin" /> {t("cust_modal_uploading")}</> : t("cust_modal_checkout")}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ══ DESKTOP modal ══════════════════════════════════════════════════════ */}
      <div
        className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-8 bg-black/45 backdrop-blur-sm"
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="bg-white rounded-3xl w-full max-w-[820px] max-h-[90vh] overflow-hidden flex shadow-2xl">

          {/* Left panel */}
          <div className="w-64 shrink-0 bg-[#F5D0D8] flex flex-col p-6">
            <p className="text-[9px] font-bold text-[#A05068] uppercase tracking-widest mb-1">{t("cust_modal_customising")}</p>
            <h3 className="font-playfair font-bold text-[#2D000A] text-lg leading-tight mb-4 line-clamp-2">{product.name}</h3>

            <div className="w-full aspect-square relative rounded-2xl overflow-hidden mb-5 shrink-0 shadow-[0_4px_20px_rgba(0,0,0,0.10)]">
              <div className="absolute inset-0 bg-white/60" />
              <div className="absolute inset-0 flex items-center justify-center p-3 pb-8">
                <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} sprinkles={custSel.sprinkles} text={previewText} stickerUrl={previewSticker} imageUrl={previewImageUrl} />
              </div>
              {custSel.shape && (
                <div className="absolute bottom-0 inset-x-0 px-3 py-2 bg-white/80 backdrop-blur-sm border-t border-[rgba(128,0,32,0.06)] flex items-center justify-between gap-2">
                  <div className="flex flex-col min-w-0">
                    <span className="text-[8px] font-bold text-[#800020]/40 uppercase tracking-wide leading-none mb-0.5">Total</span>
                    <div className="flex flex-wrap gap-x-1.5 gap-y-0">
                      {custSel.sprinkles === "yes" && <span className="text-[9px] text-[#800020]/40">+{ADDON_PRICES.sprinkles}</span>}
                      {custSel.topping === "write"   && <span className="text-[9px] text-[#800020]/40">+{ADDON_PRICES.writing}</span>}
                      {custSel.topping === "sticker" && <span className="text-[9px] text-[#800020]/40">+{ADDON_PRICES.sticker}</span>}
                      {custSel.topping === "image"   && <span className="text-[9px] text-[#800020]/40">+{ADDON_PRICES.image}</span>}
                      {custSel.candles   && <span className="text-[9px] text-[#800020]/40">+{ADDON_PRICES.candles} 🕯️</span>}
                      {custSel.balloons  && <span className="text-[9px] text-[#800020]/40">+{ADDON_PRICES.balloons} 🎈</span>}
                    </div>
                  </div>
                  <span className="font-playfair font-bold text-[#800020] text-sm shrink-0">QAR {calcPrice()}</span>
                </div>
              )}
            </div>

            <div className="flex-1 space-y-0.5 overflow-y-auto">
              {STEPS.map((step, i) => {
                const active = i === custStep;
                const done   = i < custStep;
                return (
                  <button key={step.label} onClick={() => { if (done) setCustStep(i); }}
                    className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left",
                      active ? "bg-[#800020] text-white" : done ? "text-[#800020]/70 hover:bg-[#800020]/10 cursor-pointer" : "text-[#800020]/30 cursor-default"
                    )}>
                    <step.Icon size={13} strokeWidth={active ? 2.5 : 2} />
                    <span className="flex-1">{t("cust_modal_step_" + step.label.toLowerCase())}</span>
                    {done && <Check size={11} strokeWidth={2.5} />}
                  </button>
                );
              })}
              <button className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left",
                custStep === 5 ? "bg-[#800020] text-white" : "text-[#800020]/30 cursor-default")}>
                <Check size={13} strokeWidth={custStep === 5 ? 2.5 : 2} />
                <span className="flex-1">{t("cust_modal_step_summary")}</span>
              </button>
            </div>

            <button onClick={onClose}
              className="mt-4 w-full py-2.5 rounded-xl bg-[#800020]/10 text-[#800020] text-xs font-bold hover:bg-[#800020]/18 transition-colors shrink-0">
              {t("cust_modal_cancel")}
            </button>
          </div>

          {/* Right panel */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-8 py-7">
              {renderStep()}
            </div>
            <div className="shrink-0 px-8 py-5 border-t border-[rgba(128,0,32,0.08)] bg-[#FDFAF8]">
              {custStep < 5 ? (
                <div className="flex gap-3">
                  <button onClick={handleBack}
                    className="flex-1 bg-white border border-[rgba(128,0,32,0.12)] text-[#800020] font-bold py-3 rounded-2xl text-sm hover:border-[#800020] transition-all active:scale-[0.97]">
                    {custStep === 0 ? t("cust_modal_cancel") : t("cust_modal_back")}
                  </button>
                  <button onClick={handleNext} disabled={!canProceed()}
                    className={cn("flex-[2] font-bold py-3 rounded-2xl text-sm font-playfair tracking-wide transition-all",
                      canProceed() ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm active:scale-[0.97]" : "bg-[#FF6B9D]/35 text-white/50 cursor-not-allowed")}>
                    {custStep === STEP_LABELS.length - 1 ? t("cust_modal_review_btn") : t("cust_modal_next")}
                  </button>
                </div>
              ) : (
                <div className="flex gap-3">
                  <button onClick={handleContinue} disabled={uploading}
                    className="flex-1 bg-white border border-[rgba(128,0,32,0.12)] text-[#800020] font-bold py-3 rounded-2xl text-sm hover:border-[#800020] transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                    {uploading ? t("cust_modal_uploading") : t("cust_modal_continue")}
                  </button>
                  <button onClick={handleCheckout} disabled={uploading}
                    className="flex-[2] bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-bold py-3.5 rounded-2xl font-playfair text-base tracking-wide transition-all shadow-warm-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    {uploading ? <><Loader2 size={15} className="animate-spin" /> {t("cust_modal_uploading")}</> : t("cust_modal_checkout")}
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
