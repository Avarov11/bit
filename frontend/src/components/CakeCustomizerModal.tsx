"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChefHat, Sparkles, PenLine, Box, ChevronRight, X, Loader2, Gift, Flame, Balloon, Camera, Upload, Sticker, Cookie, Milk, Coffee, Leaf, Layers, Mail } from "lucide-react";
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
  {
    id: "chocolate", tKey: "cust_modal_flavor_chocolate", subKey: "cust_modal_flavor_choc_sub",
    Icon: Cookie, iconColor: "text-white",
    iconBg: "linear-gradient(145deg, #6B3318 0%, #2E0D05 100%)",
  },
  {
    id: "white", tKey: "cust_modal_flavor_white", subKey: "cust_modal_flavor_white_sub",
    Icon: Milk, iconColor: "text-[#7A5C38]",
    iconBg: "linear-gradient(145deg, #FFF9EE 0%, #E8D5A8 100%)",
  },
];

const CHOC_FLAVORS = [
  { id: "milk",     label: "Milk",     tKey: "cust_modal_choc_milk",     Icon: Coffee, iconBg: "linear-gradient(145deg, #C49A6C, #7A4A24)" },
  { id: "hazelnut", label: "Hazelnut", tKey: "cust_modal_choc_hazelnut", Icon: Leaf,   iconBg: "linear-gradient(145deg, #D4A853, #9A6E1A)" },
  { id: "oreo",     label: "Oreo",     tKey: "cust_modal_choc_oreo",     Icon: Layers, iconBg: "linear-gradient(145deg, #4A3025, #0D0806)" },
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
const DEFAULT_ADDON_PRICES = { sprinkles: 5, writing: 10, sticker: 30, image: 30, candles: 25, balloons: 25, card: 25 };

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
  candleUrl: string | null;
  balloonUrl: string | null;
  cardUrl: string | null;
}

const EMPTY_SEL: CustSel = {
  shape: "", flavorType: "", flavor: "", colour: "", cakeColor: "",
  sprinkles: "", topping: "", toppingText: "", stickerUrl: null, imageFile: null,
  candleUrl: null, balloonUrl: null, cardUrl: null,
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

// ─── Preview image URL maps (module-level for bulk preloading) ───────────────

const BASE_CAKE   = "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes";
const BASE_HEART  = "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes%20heart";
const BASE_SQUARE = "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shape%20square";

const CAKE_COLOR_FILES: Record<string, [string, string]> = {
  brown: ["brown1.png", "brown%202.png"],
  beige: ["beige1.png", "beige%202.png"],
  black: ["black1.png", "black%202.png"],
  pink:  ["red1.png",   "red%202.png"  ],
  blue:  ["blue1.png",  "blue%202.png" ],
  white: ["white1.png", "white%202.png"],
};
const HEART_COLOR_FILES: Record<string, [string, string, string]> = {
  brown: ["1br.png",    "2br.png", "3br.png"],
  beige: ["1be.png",    "2be.png", "3be.png"],
  black: ["1bl.png",    "2bl.png", "3bl.png"],
  pink:  ["1pi.png",    "2pi.png", "3pi.png"],
  blue:  ["1%20bb.png", "2bb.png", "3bb.png"],
  white: ["1wh.png",    "2wh.png", "3wh.png"],
};
const SQUARE_COLOR_FILES: Record<string, [string, string, string]> = {
  brown: ["1br.png", "2br.png", "3br.png"],
  beige: ["1be.png", "2be.png", "3be.png"],
  black: ["1bl.png", "2bl.png", "3bl.png"],
  pink:  ["1pi.png", "2pi.png", "3pi.png"],
  blue:  ["1bb.png", "2bb.png", "3bb.png"],
  white: ["1wh.png", "2wh.png", "3wh.png"],
};

// Build default URL maps from the hardcoded filename tables (used as fallback)
function buildDefaultMaps(): Record<string, Record<string, string[]>> {
  const cake:   Record<string, string[]> = {};
  const heart:  Record<string, string[]> = {};
  const square: Record<string, string[]> = {};
  for (const [c, [f0, f1]] of Object.entries(CAKE_COLOR_FILES))
    cake[c] = [`${BASE_CAKE}/${f0}?v=2`, `${BASE_CAKE}/${f1}?v=2`];
  for (const [c, files] of Object.entries(HEART_COLOR_FILES))
    heart[c] = files.map(f => `${BASE_HEART}/${f}?v=2`);
  for (const [c, files] of Object.entries(SQUARE_COLOR_FILES))
    square[c] = files.map(f => `${BASE_SQUARE}/${f}?v=2`);
  return { cake, heart, square };
}

// ─── PreviewImg ───────────────────────────────────────────────────────────────
// Tracks its own loaded-src so it shows a pulse skeleton while the network
// request is in flight and fades in once the image is ready.

function PreviewImg({ src, alt }: { src: string; alt: string }) {
  const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
  const isLoaded = loadedSrc === src;
  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 bg-[#F5D0D8]/50 animate-pulse rounded-xl pointer-events-none" />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-contain transition-opacity duration-200",
          isLoaded ? "opacity-100" : "opacity-0"
        )}
        onLoad={() => setLoadedSrc(src)}
      />
    </div>
  );
}

// ─── CakePreview ─────────────────────────────────────────────────────────────

function CakePreview({ shape, colorId, sprinkles = "", text = "", stickerUrl = "", imageUrl = "", shapeImageMap = {} }: { shape: string; colorId: string; sprinkles?: string; text?: string; stickerUrl?: string; imageUrl?: string; shapeImageMap?: Record<string, string[]> }) {
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

  const getFallbackUrls = () => {
    if (!shape || shape === "cake") {
      const [f0,f1] = CAKE_COLOR_FILES[colorId] ?? CAKE_COLOR_FILES["brown"];
      return [`${BASE_CAKE}/${f0}?v=2`, `${BASE_CAKE}/${f1}?v=2`];
    } else if (shape === "heart") {
      return (HEART_COLOR_FILES[colorId] ?? HEART_COLOR_FILES["brown"]).map(f => `${BASE_HEART}/${f}?v=2`);
    } else {
      return (SQUARE_COLOR_FILES[colorId] ?? SQUARE_COLOR_FILES["brown"]).map(f => `${BASE_SQUARE}/${f}?v=2`);
    }
  };

  const urls = shapeImageMap[colorId] ?? shapeImageMap["brown"] ?? getFallbackUrls();
  const views: JSX.Element[] = urls.map((src, i) => (
    <div key={i} className="relative w-full h-full flex items-center justify-center p-6">
      <PreviewImg src={src} alt={`View ${i + 1}`} />
      {i === 1 ? photoOverlay : null}
    </div>
  ));

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
  const ALL_SAUCE_IDS = ["brown","beige","black","white","pink","blue"];
  interface ShapeCfg { max_chars: number; view_count: number; allowed_colors: string[]; }
  const DEFAULT_CFG: ShapeCfg = { max_chars: 5, view_count: 2, allowed_colors: ALL_SAUCE_IDS };
  const [shapeConfigs, setShapeConfigs] = useState<Record<string, ShapeCfg>>({
    cake:   { max_chars: 5, view_count: 2, allowed_colors: ALL_SAUCE_IDS },
    heart:  { max_chars: 3, view_count: 3, allowed_colors: ALL_SAUCE_IDS },
    square: { max_chars: 3, view_count: 3, allowed_colors: ALL_SAUCE_IDS },
  });
  const [shapeImageMaps, setShapeImageMaps] = useState<Record<string, Record<string, string[]>>>(buildDefaultMaps);
  const [uploading,  setUploading]  = useState(false);
  const [stickers,          setStickers]          = useState<{ name: string; url: string }[]>([]);
  const [showStickerPicker, setShowStickerPicker] = useState(false);
  const [candleImages,       setCandleImages]       = useState<{ name: string; url: string }[]>([]);
  const [showCandlePicker,   setShowCandlePicker]   = useState(false);
  const [balloonImages,      setBalloonImages]      = useState<{ name: string; url: string }[]>([]);
  const [showBalloonPicker,  setShowBalloonPicker]  = useState(false);
  const [cards,              setCards]              = useState<{ name: string; url: string }[]>([]);
  const [showCardPicker,     setShowCardPicker]     = useState(false);
  const [rawPricing,        setRawPricing]        = useState<Record<string, number>>({});
  const imageInputRef                             = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!product) return;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, [product]);

  useEffect(() => {
    fetch("/api/shape-configs", { cache: "no-store" })
      .then(r => r.json())
      .then((data: { shape: string; max_chars: number; allowed_colors: string[] }[]) => {
        if (Array.isArray(data)) {
          const m: Record<string, ShapeCfg> = {};
          data.forEach(c => { m[c.shape] = { max_chars: c.max_chars, view_count: c.view_count ?? (c.shape === "cake" ? 2 : 3), allowed_colors: c.allowed_colors ?? ALL_SAUCE_IDS }; });
          setShapeConfigs(prev => ({ ...prev, ...m }));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    for (const shape of ["cake", "heart", "square"]) {
      fetch(`/api/shape-color-images?shape=${shape}`, { cache: "no-store" })
        .then(r => r.json())
        .then((rows: { color: string; view_index: number; url: string }[]) => {
          if (!Array.isArray(rows) || !rows.length) return;
          const map: Record<string, string[]> = {};
          for (const row of rows) {
            if (!map[row.color]) map[row.color] = [];
            map[row.color][row.view_index] = row.url;
          }
          setShapeImageMaps(prev => ({ ...prev, [shape]: map }));
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    const category = product?.category ?? "Birthday";
    fetch(`/api/stickers?category=${encodeURIComponent(category)}`)
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setStickers(data); })
      .catch(() => {});
  }, [product?.category]);

  useEffect(() => {
    fetch("/api/candles")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCandleImages(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/balloons")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setBalloonImages(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch("/api/cards")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setCards(data); })
      .catch(() => {});
  }, []);

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
    card:      rawPricing["addon_card"]      ?? DEFAULT_ADDON_PRICES.card,
  };
  const calcPrice = (): number => {
    const base    = BASE_PRICES[custSel.shape as keyof typeof BASE_PRICES] ?? 0;
    const spr     = custSel.sprinkles === "yes" ? ADDON_PRICES.sprinkles : 0;
    const topping = custSel.topping === "write"   ? ADDON_PRICES.writing
                  : custSel.topping === "sticker" ? ADDON_PRICES.sticker
                  : custSel.topping === "image"   ? ADDON_PRICES.image : 0;
    const extras  = (custSel.candleUrl  ? ADDON_PRICES.candles  : 0)
                  + (custSel.balloonUrl ? ADDON_PRICES.balloons : 0)
                  + (custSel.cardUrl    ? ADDON_PRICES.card     : 0);
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
      setShowCandlePicker(false);
      setShowBalloonPicker(false);
      setShowCardPicker(false);
    }
  }

  // Preload preview images for the current shape maps once they're fetched.
  useEffect(() => {
    if (!product) return;
    const allUrls = Object.values(shapeImageMaps).flatMap(m => Object.values(m).flat());
    allUrls.forEach(src => {
      const img = new window.Image();
      img.src = src;
    });
  }, [product, shapeImageMaps]);

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
      if (!custSel.topping)              return true; // "Plain / No Topping" — nothing selected is valid
      if (custSel.topping === "write")   return custSel.toppingText.trim().length > 0;
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
    if (custSel.candleUrl)   toppingsList.push("Candles");
    if (custSel.balloonUrl)  toppingsList.push("Balloons");
    if (custSel.cardUrl)     toppingsList.push("Card");

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
        message:  custSel.topping === "write" ? custSel.toppingText.trim() || undefined : undefined,
        stickerUrl,
        imageUrl,
        candleUrl:  custSel.candleUrl  ?? undefined,
        balloonUrl: custSel.balloonUrl ?? undefined,
        cardUrl:    custSel.cardUrl    ?? undefined,
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
    id, icon, iconStyle, label, sub, selected, onClick,
  }: { id: string; icon: React.ReactNode; iconStyle?: React.CSSProperties; label: string; sub?: string; selected: boolean; onClick: () => void }) => (
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
      <div className="flex items-center justify-center py-7" style={iconStyle}>
        {icon}
      </div>
      <div className="p-3">
        <p className="font-playfair font-bold text-[#2D000A] text-sm">{label}</p>
        {sub && <p className="text-[#A05068] text-[11px] mt-0.5">{sub}</p>}
      </div>
    </button>
  );

  const renderStep = () => {
    if (custStep === 4) {
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">Extras</h2>
          <p className="text-[#A05068] text-sm mb-6">Add a little something extra — totally optional 🎉</p>
          <div className="grid grid-cols-3 gap-3">
            {/* Candles — image picker */}
            <button
              onClick={() => { setShowCandlePicker((p) => !p); setShowBalloonPicker(false); setShowCardPicker(false); }}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                (custSel.candleUrl || showCandlePicker) ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
              )}
            >
              {custSel.candleUrl && (
                <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              {custSel.candleUrl ? (
                <div className="w-full h-[72px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={custSel.candleUrl} alt="Selected candle" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-[#F5D0D8] flex items-center justify-center py-5">
                  <Flame size={36} strokeWidth={1.5} className="text-[#800020]" />
                </div>
              )}
              <div className="p-2.5">
                <p className="font-playfair font-bold text-[#2D000A] text-xs">Candles</p>
                <p className="text-[#A05068] text-[10px] mt-0.5">
                  {custSel.candleUrl ? "Change design" : "Choose design"}
                </p>
              </div>
            </button>

            {/* Balloons — image picker */}
            <button
              onClick={() => { setShowBalloonPicker((p) => !p); setShowCandlePicker(false); setShowCardPicker(false); }}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                (custSel.balloonUrl || showBalloonPicker) ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
              )}
            >
              {custSel.balloonUrl && (
                <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              {custSel.balloonUrl ? (
                <div className="w-full h-[72px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={custSel.balloonUrl} alt="Selected balloon" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-[#F5D0D8] flex items-center justify-center py-5">
                  <Balloon size={36} strokeWidth={1.5} className="text-[#800020]" />
                </div>
              )}
              <div className="p-2.5">
                <p className="font-playfair font-bold text-[#2D000A] text-xs">Balloons</p>
                <p className="text-[#A05068] text-[10px] mt-0.5">
                  {custSel.balloonUrl ? "Change design" : "Choose design"}
                </p>
              </div>
            </button>

            {/* Cards — image picker */}
            <button
              onClick={() => { setShowCardPicker((p) => !p); setShowCandlePicker(false); setShowBalloonPicker(false); }}
              className={cn(
                "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                (custSel.cardUrl || showCardPicker) ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-md"
              )}
            >
              {custSel.cardUrl && (
                <span className="absolute top-2 right-2 z-10 bg-[#800020] rounded-full p-0.5">
                  <Check size={10} className="text-white" strokeWidth={3} />
                </span>
              )}
              {custSel.cardUrl ? (
                <div className="w-full h-[72px]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={custSel.cardUrl} alt="Selected card" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="bg-[#F5D0D8] flex items-center justify-center py-5">
                  <Mail size={36} strokeWidth={1.5} className="text-[#800020]" />
                </div>
              )}
              <div className="p-2.5">
                <p className="font-playfair font-bold text-[#2D000A] text-xs">Cards</p>
                <p className="text-[#A05068] text-[10px] mt-0.5">
                  {custSel.cardUrl ? "Change design" : "Choose design"}
                </p>
              </div>
            </button>
          </div>

          {/* Candle picker panel */}
          {showCandlePicker && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider">
                  {candleImages.length} Designs
                </p>
                <button
                  onClick={() => setShowCandlePicker(false)}
                  className="text-[11px] font-bold text-[#800020]/50 hover:text-[#800020] transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {candleImages.map((c) => {
                  const sel = custSel.candleUrl === c.url;
                  return (
                    <button
                      key={c.url}
                      onClick={() => {
                        setCustSel((p) => ({ ...p, candleUrl: c.url }));
                        setShowCandlePicker(false);
                      }}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95",
                        sel
                          ? "border-[#800020] ring-2 ring-[#800020]/20"
                          : "border-[rgba(128,0,32,0.08)] hover:border-[#800020]/40 hover:scale-[1.03]"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.url} alt={c.name} className="w-full aspect-square object-cover" />
                      {sel && (
                        <>
                          <span className="absolute inset-0 bg-[#800020]/10" />
                          <span className="absolute top-1 right-1 bg-[#800020] rounded-full p-0.5 shadow">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              {custSel.candleUrl && (
                <button
                  onClick={() => { setCustSel((p) => ({ ...p, candleUrl: null })); setShowCandlePicker(false); }}
                  className="text-[11px] text-[#800020]/60 hover:text-[#800020] mt-3 transition-colors w-full text-center"
                >
                  Remove candles
                </button>
              )}
            </div>
          )}

          {/* Balloon picker panel */}
          {showBalloonPicker && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider">
                  {balloonImages.length} Designs
                </p>
                <button
                  onClick={() => setShowBalloonPicker(false)}
                  className="text-[11px] font-bold text-[#800020]/50 hover:text-[#800020] transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {balloonImages.map((b) => {
                  const sel = custSel.balloonUrl === b.url;
                  return (
                    <button
                      key={b.url}
                      onClick={() => {
                        setCustSel((p) => ({ ...p, balloonUrl: b.url }));
                        setShowBalloonPicker(false);
                      }}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95",
                        sel
                          ? "border-[#800020] ring-2 ring-[#800020]/20"
                          : "border-[rgba(128,0,32,0.08)] hover:border-[#800020]/40 hover:scale-[1.03]"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={b.url} alt={b.name} className="w-full aspect-square object-cover" />
                      {sel && (
                        <>
                          <span className="absolute inset-0 bg-[#800020]/10" />
                          <span className="absolute top-1 right-1 bg-[#800020] rounded-full p-0.5 shadow">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              {custSel.balloonUrl && (
                <button
                  onClick={() => { setCustSel((p) => ({ ...p, balloonUrl: null })); setShowBalloonPicker(false); }}
                  className="text-[11px] text-[#800020]/60 hover:text-[#800020] mt-3 transition-colors w-full text-center"
                >
                  Remove balloons
                </button>
              )}
            </div>
          )}

          {/* Card picker panel */}
          {showCardPicker && (
            <div className="mt-4 bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider">
                  {cards.length} Designs
                </p>
                <button
                  onClick={() => setShowCardPicker(false)}
                  className="text-[11px] font-bold text-[#800020]/50 hover:text-[#800020] transition-colors"
                >
                  Close
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {cards.map((c) => {
                  const sel = custSel.cardUrl === c.url;
                  return (
                    <button
                      key={c.url}
                      onClick={() => {
                        setCustSel((p) => ({ ...p, cardUrl: c.url }));
                        setShowCardPicker(false);
                      }}
                      className={cn(
                        "relative rounded-xl overflow-hidden border-2 transition-all duration-200 active:scale-95",
                        sel
                          ? "border-[#800020] ring-2 ring-[#800020]/20"
                          : "border-[rgba(128,0,32,0.08)] hover:border-[#800020]/40 hover:scale-[1.03]"
                      )}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={c.url} alt={c.name} className="w-full aspect-[3/4] object-cover" />
                      {sel && (
                        <>
                          <span className="absolute inset-0 bg-[#800020]/10" />
                          <span className="absolute top-1 right-1 bg-[#800020] rounded-full p-0.5 shadow">
                            <Check size={10} className="text-white" strokeWidth={3} />
                          </span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>
              {custSel.cardUrl && (
                <button
                  onClick={() => { setCustSel((p) => ({ ...p, cardUrl: null })); setShowCardPicker(false); }}
                  className="text-[11px] text-[#800020]/60 hover:text-[#800020] mt-3 transition-colors w-full text-center"
                >
                  Remove card
                </button>
              )}
            </div>
          )}

          {!custSel.candleUrl && !custSel.balloonUrl && !custSel.cardUrl && (
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
                : custSel.topping === "sticker" && custSel.stickerUrl ? `Sticker selected`
                : custSel.topping === "image"   && custSel.imageFile   ? custSel.imageFile.name
                : "—"
              }
            />
            <SummaryRow label="Candles"  value={custSel.candleUrl ? `Yes (+QAR ${ADDON_PRICES.candles})` : "None"} />
            <SummaryRow label="Balloons" value={custSel.balloonUrl ? `Yes (+QAR ${ADDON_PRICES.balloons})` : "None"} />
            <SummaryRow label="Card"     value={custSel.cardUrl  ? `Yes (+QAR ${ADDON_PRICES.card})`     : "None"} />
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
                  <div className="w-full h-36 md:h-40 bg-[#F5D0D8] p-3">
                    <div className="relative w-full h-full">
                      <Image
                        src={shape.photo}
                        alt={shape.label}
                        fill
                        sizes="(max-width: 768px) 33vw, 200px"
                        className="object-contain"
                        quality={90}
                        priority
                      />
                    </div>
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
      const allowedSauces  = (shapeConfigs[custSel.shape] ?? DEFAULT_CFG).allowed_colors;
      const chocColorMap: Record<string, string> = { milk: "brown", hazelnut: "beige", oreo: "black" };
      const visibleChocFlavors = CHOC_FLAVORS.filter(f => allowedSauces.includes(chocColorMap[f.id]));
      const visibleColours     = COLOURS.filter(c => allowedSauces.includes(c.id));
      const showChocType  = visibleChocFlavors.length > 0;
      const showWhiteType = visibleColours.length > 0;
      const isChocType  = custSel.flavorType === "chocolate";
      const isWhiteType = custSel.flavorType === "white";
      const visibleFlavors = availableFlavors.filter(f => f.id === "chocolate" ? showChocType : showWhiteType);
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">{t("cust_modal_flavor_title")}</h2>
          <p className="text-[#A05068] text-sm mb-5">{t("cust_modal_flavor_subtitle")}</p>
          <div className={cn("grid gap-3 mb-5", visibleFlavors.length === 1 ? "grid-cols-1 max-w-[50%]" : "grid-cols-2")}>
            {visibleFlavors.map((f) => (
              <OptionCard
                key={f.id} id={f.id}
                icon={<f.Icon size={40} strokeWidth={1.5} className={f.iconColor} />}
                iconStyle={{ background: f.iconBg }}
                label={t(f.tKey)} sub={t(f.subKey)}
                selected={custSel.flavorType === f.id}
                onClick={() => setCustSel((p) => ({ ...p, flavorType: f.id, flavor: "", colour: "", cakeColor: f.id === "chocolate" ? "brown" : "" }))}
              />
            ))}
          </div>
          {isChocType && (
            <div>
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-3">{t("cust_modal_choose_flavor")}</p>
              <div className="grid grid-cols-3 gap-3">
                {visibleChocFlavors.map((choc) => {
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
                      <div className="flex flex-col items-center gap-2 py-4 px-2">
                        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: choc.iconBg }}>
                          <choc.Icon size={18} strokeWidth={1.5} className="text-white" />
                        </div>
                        <p className="font-playfair font-bold text-[#2D000A] text-xs text-center leading-tight">{t(choc.tKey)}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {isWhiteType && (() => {
            const colFlat: Record<string, string> = {
              white: "linear-gradient(145deg, #FEFAF5, #E8DDD0)",
              pink:  "linear-gradient(145deg, #FFB8CC, #E84C88)",
              blue:  "linear-gradient(145deg, #C8DCEC, #8AAFC8)",
            };
            const colSub: Record<string, string> = {
              white: "Classic Pearl",
              pink:  "Rose Blush",
              blue:  "Sky Dream",
            };
            return (
              <div>
                <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-4">{t("cust_modal_choose_colour")}</p>
                <div className="grid grid-cols-3 gap-3">
                  {visibleColours.map((col) => {
                    const sel = custSel.colour === col.id;
                    return (
                      <button
                        key={col.id}
                        onClick={() => setCustSel((p) => ({ ...p, colour: col.id, cakeColor: col.id }))}
                        className={cn(
                          "relative rounded-2xl overflow-hidden transition-all duration-200 active:scale-[0.97] shadow-warm-xs",
                          sel ? "ring-2 ring-[#800020] shadow-warm-md" : "hover:shadow-warm-sm"
                        )}
                        style={{ background: colFlat[col.id] ?? col.hex }}
                      >
                        <div className="h-16" />
                        {sel && (
                          <span className="absolute top-2 right-2 bg-white/90 rounded-full p-0.5 shadow-sm">
                            <Check size={11} className="text-[#800020]" strokeWidth={3.5} />
                          </span>
                        )}
                        <div className="bg-white/80 backdrop-blur-sm px-2 py-2 text-center border-t border-white/40">
                          <p className={cn("text-xs font-bold leading-tight", sel ? "text-[#800020]" : "text-[#2D000A]")}>
                            {t(col.tKey)}
                          </p>
                          <p className="text-[10px] text-[#A05068]/70 mt-0.5">{colSub[col.id]}</p>
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
          {([
            { id: "yes", Icon: Sparkles, bg: "linear-gradient(145deg, #FF6B9D, #C04070)", labelKey: "cust_modal_sprinkles_yes", subKey: "cust_modal_sprinkles_yes_sub" },
            { id: "no",  Icon: X,        bg: "linear-gradient(145deg, #C8B4BC, #8A7080)", labelKey: "cust_modal_sprinkles_no",  subKey: "cust_modal_sprinkles_no_sub"  },
          ] as const).map((opt) => (
            <OptionCard
              key={opt.id} id={opt.id}
              icon={<opt.Icon size={40} strokeWidth={1.5} className="text-white" />}
              iconStyle={{ background: opt.bg }}
              label={t(opt.labelKey)} sub={t(opt.subKey)}
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
      const charLimit = (shapeConfigs[shape] ?? DEFAULT_CFG).max_chars;
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
                  id="write"
                  icon={<PenLine size={40} strokeWidth={1.5} className="text-white" />}
                  iconStyle={{ background: "linear-gradient(145deg, #800020, #3A0010)" }}
                  label={t("cust_modal_write")}
                  sub={`Max ${charLimit} letter${charLimit !== 1 ? "s" : ""}`}
                  selected={custSel.topping === "write"}
                  onClick={() => setCustSel((p) => ({ ...p, topping: p.topping === "write" ? "" : "write", stickerUrl: null, imageFile: null }))}
                />
              )}
              {showImage && (
                <OptionCard
                  id="image"
                  icon={<Camera size={40} strokeWidth={1.5} className="text-white" />}
                  iconStyle={{ background: "linear-gradient(145deg, #800020, #3A0010)" }}
                  label={t("cust_modal_image")}
                  sub={t("cust_modal_image_sub")}
                  selected={custSel.topping === "image"}
                  onClick={() => setCustSel((p) => ({ ...p, topping: p.topping === "image" ? "" : "image", toppingText: "", stickerUrl: null }))}
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
                    <Camera size={28} className="text-[#800020] mx-auto mb-2" strokeWidth={1.5} />
                    <p className="text-sm text-[#800020] font-semibold truncate px-6">{custSel.imageFile.name}</p>
                    <p className="text-[11px] text-[#A05068] mt-1">{t("cust_modal_tap_change")}</p>
                  </div>
                ) : (
                  <div>
                    <Upload size={28} className="text-[#800020] mx-auto mb-2" strokeWidth={1.5} />
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
                  <Sticker size={22} strokeWidth={1.5} className="text-[#800020]" />
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
                  <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} sprinkles={custSel.sprinkles} text={previewText} stickerUrl={previewSticker} imageUrl={previewImageUrl} shapeImageMap={shapeImageMaps[custSel.shape ?? "cake"] ?? {}} />
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
                      {custSel.candleUrl   && <span className="inline-flex items-center gap-0.5 text-[10px] text-[#800020]/40">· +{ADDON_PRICES.candles} <Flame size={9} strokeWidth={2} /></span>}
                      {custSel.balloonUrl && <span className="inline-flex items-center gap-0.5 text-[10px] text-[#800020]/40">· +{ADDON_PRICES.balloons} <Balloon size={9} strokeWidth={2} /></span>}
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
                      {custSel.candleUrl   && <span className="inline-flex items-center gap-0.5 text-[9px] text-[#800020]/40">+{ADDON_PRICES.candles} <Flame size={8} strokeWidth={2} /></span>}
                      {custSel.balloonUrl && <span className="inline-flex items-center gap-0.5 text-[9px] text-[#800020]/40">+{ADDON_PRICES.balloons} <Balloon size={8} strokeWidth={2} /></span>}
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
