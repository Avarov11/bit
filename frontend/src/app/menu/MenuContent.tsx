"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Check, ChefHat, Sparkles, PenLine, Box, ChevronLeft, ChevronRight } from "lucide-react";
import type { DbProduct } from "@/lib/types";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

// ─── Filter category type (UI only) ────────────────────────────────────────────
type FilterCat = "All" | "Customized" | "Accessories" | "Boxes";
type SubCat = "Birthday" | "Congrats" | "Graduation" | "Get Well Soon" | "Bride to Be" | "Gender Reveal" | "Candles" | "Balloons";

const customizedSubs: SubCat[] = ["Birthday", "Congrats", "Graduation", "Get Well Soon", "Bride to Be", "Gender Reveal"];
const accessoriesSubs: SubCat[] = ["Candles", "Balloons"];

const catKeyMap: Record<string, string> = {
  All: "cat_all", Accessories: "cat_accessories", Candles: "cat_candles",
  Balloons: "cat_balloons", Boxes: "cat_boxes", Customized: "cat_customized",
  Birthday: "cat_birthday", Congrats: "cat_congrats", Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon", "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal",
};

const categoryBadge: Record<string, string> = {
  Customized: "bg-gold-light text-chocolate-dark",
  Accessories: "bg-[#E4EDF5] text-[#2D4A7A]",
  Boxes: "bg-[#F5EDE4] text-[#7A4A2D]",
  Birthday: "bg-chocolate-light text-chocolate-dark",
  Congrats: "bg-[#D6F0E8] text-[#2D7A5C]",
  Graduation: "bg-[#DAE4F5] text-[#2D4A7A]",
  "Get Well Soon": "bg-[#D6F0EC] text-[#2D7A6A]",
  "Bride to Be": "bg-[#F5E4F0] text-[#7A2D6A]",
  "Gender Reveal": "bg-[#EDE4F5] text-[#6B3FA0]",
  Candles: "bg-[#FFF3E0] text-[#7A5200]",
  Balloons: "bg-[#FCE4EC] text-[#880E4F]",
};

// ─── Customization panel constants ─────────────────────────────────────────────

const SHAPES = [
  {
    id: "cake", label: "Full Cake",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
        <defs>
          <linearGradient id="sh-ck-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#4A0F1C" />
            <stop offset="45%" stopColor="#7A1F35" />
            <stop offset="100%" stopColor="#4A0F1C" />
          </linearGradient>
          <radialGradient id="sh-ck-top" cx="35%" cy="35%" r="65%">
            <stop offset="0%"  stopColor="#C04060" />
            <stop offset="100%" stopColor="#9B2845" />
          </radialGradient>
        </defs>
        {/* Shadow */}
        <ellipse cx="40" cy="71" rx="25" ry="4" fill="#800020" opacity="0.18" />
        {/* Body */}
        <rect x="14" y="38" width="52" height="24" fill="url(#sh-ck-body)" />
        {/* Bottom rim */}
        <ellipse cx="40" cy="62" rx="26" ry="8" fill="#800020" />
        {/* White frosting collar */}
        <ellipse cx="40" cy="38" rx="28" ry="10" fill="white" />
        {/* Drip drops */}
        {[20,28,40,52,60].map((x,i) => (
          <ellipse key={x} cx={x} cy={44+(i%2)*3} rx={3.5} ry={4+(i%2)*3} fill="white" />
        ))}
        {/* Pearls on body */}
        {[22,31,40,49,58].map(x => <circle key={x} cx={x} cy={52} r={1.8} fill="white" opacity="0.65" />)}
        {/* Top face — drawn last so it sits on top */}
        <ellipse cx="40" cy="38" rx="24" ry="8.5" fill="url(#sh-ck-top)" />
        <ellipse cx="34" cy="33" rx="7" ry="2.5" fill="white" opacity="0.22" />
      </svg>
    ),
  },
  {
    id: "heart", label: "Heart",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
        {/* Depth layers */}
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="#800020" transform="translate(0,7)" opacity="0.35" />
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="white" transform="translate(0,3)" />
        {/* Main heart */}
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="#7A1F35" />
        {/* Inset lighter face */}
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="#9B2845" transform="translate(40,39) scale(0.84) translate(-40,-39)" />
        {/* Shimmer */}
        <path d="M21,19 C16,25 13,33 14,39" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.28" />
        {/* Pearls */}
        {[31,40,49].map(x => <circle key={x} cx={x} cy={53} r={1.8} fill="white" opacity="0.75" />)}
      </svg>
    ),
  },
  {
    id: "square", label: "Square",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
        <defs>
          <linearGradient id="sh-sq-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#4A0F1C" />
            <stop offset="45%" stopColor="#7A1F35" />
            <stop offset="100%" stopColor="#4A0F1C" />
          </linearGradient>
        </defs>
        {/* Front face */}
        <rect x="11" y="37" width="45" height="28" fill="url(#sh-sq-body)" />
        {/* Right face */}
        <polygon points="56,37 70,26 70,55 56,65" fill="#800020" />
        {/* Top face */}
        <polygon points="11,37 56,37 70,26 25,26" fill="#9B2845" />
        {/* Frosting edges */}
        <rect x="11" y="32" width="45" height="9" fill="white" opacity="0.95" />
        <polygon points="56,32 70,21 70,30 56,41" fill="white" opacity="0.75" />
        <polygon points="11,32 56,32 70,21 25,21" fill="white" opacity="0.88" />
        {/* Inset top face */}
        <polygon points="17,33 56,33 68,23 29,23" fill="#9B2845" opacity="0.7" />
        {/* Left edge highlight */}
        <line x1="11" y1="37" x2="11" y2="65" stroke="white" strokeWidth="2" opacity="0.2" />
        {/* Pearls on front */}
        {[22,35,48].map(x => <circle key={x} cx={x} cy={52} r={2} fill="white" opacity="0.6" />)}
      </svg>
    ),
  },
];

const FLAVORS = [
  { id: "chocolate", label: "Chocolate",       emoji: "🍫", sub: "Milk · Hazelnut · Oreo" },
  { id: "white",     label: "White Chocolate", emoji: "🤍", sub: "White · Pink · Blue"    },
];

const CHOC_FLAVORS = [
  { id: "milk",     label: "Milk",     emoji: "🍫" },
  { id: "hazelnut", label: "Hazelnut", emoji: "🌰" },
  { id: "oreo",     label: "Oreo",     emoji: "⚫" },
];

const COLOURS = [
  { id: "white", label: "White", hex: "#FFFFFF" },
  { id: "pink",  label: "Pink",  hex: "#FF6B9D" },
  { id: "blue",  label: "Blue",  hex: "#B2C8D8" },
];

const CAKE_COLORS = [
  { id: "brown", label: "Brown", hex: "#8B5E3C", sub: "Rich chocolate base"   },
  { id: "white", label: "White", hex: "#FFFFFF", sub: "Classic vanilla cream" },
  { id: "pink",  label: "Pink",  hex: "#FF6B9D", sub: "Strawberry & rose"     },
  { id: "blue",  label: "Blue",  hex: "#B2C8D8", sub: "Blueberry & vanilla"   },
];

const STICKERS = ["🎂","🎉","🎀","🌸","💝","⭐","🎁","🎈","🌟","🦋","💐","🍰","🎊","🌺","💫","🧁"];

const STEP_LABELS = ["Shape", "Flavour", "Sprinkles", "Topping"];

const STEPS = [
  { label: "Shape",     Icon: Box      },
  { label: "Flavour",   Icon: ChefHat  },
  { label: "Sprinkles", Icon: Sparkles },
  { label: "Topping",   Icon: PenLine  },
];

interface CustSel {
  shape: string;
  flavorType: string;
  flavor: string;
  colour: string;
  cakeColor: string;
  sprinkles: string;
  topping: string;
  toppingText: string;
  stickerId: string;
  imageFile: File | null;
}

const EMPTY_SEL: CustSel = {
  shape: "", flavorType: "", flavor: "", colour: "", cakeColor: "",
  sprinkles: "", topping: "", toppingText: "",
  stickerId: "", imageFile: null,
};

// ─── 3-D Cake preview ──────────────────────────────────────────────────────────
function CakePreview({ shape, colorId, text = "" }: { shape: string; colorId: string; text?: string }) {
  const [view, setView] = useState<"side"|"top">("side");

  const pal: Record<string, { top: string; mid: string; dark: string; shadow: string }> = {
    "":    { top: "#FFFCF8", mid: "#EDE0D4", dark: "#C0B0A2", shadow: "#9C9088" },
    brown: { top: "#D4A272", mid: "#A06840", dark: "#6C4018", shadow: "#4A2C0A" },
    white: { top: "#FFFCF8", mid: "#EDE0D4", dark: "#C0B0A2", shadow: "#9C9088" },
    pink:  { top: "#FAD8DF", mid: "#D49AA8", dark: "#A06878", shadow: "#784858" },
    blue:  { top: "#D8EEF8", mid: "#A8C8DC", dark: "#7898B0", shadow: "#567090" },
  };
  const c = pal[colorId] ?? pal[""];
  const plate = "#800020";
  const plateLip = "#5C1422";

  let sideContent: JSX.Element;
  let topContent: JSX.Element;

  if (!shape || shape === "cake") {
    sideContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cp-sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.shadow} />
            <stop offset="14%"  stopColor={c.dark}   />
            <stop offset="50%"  stopColor={c.mid}    />
            <stop offset="86%"  stopColor={c.dark}   />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <radialGradient id="cp-tg" cx="35%" cy="32%" r="64%">
            <stop offset="0%"   stopColor={c.top} />
            <stop offset="100%" stopColor={c.mid} />
          </radialGradient>
        </defs>
        <ellipse cx="130" cy="192" rx="92" ry="6" fill="rgba(128,0,32,0.13)" />
        <ellipse cx="130" cy="183" rx="92" ry="11" fill={plate} />
        <ellipse cx="130" cy="180" rx="92" ry="11" fill={plateLip} />
        <rect x="38" y="104" width="184" height="70" fill="url(#cp-sg)" />
        <ellipse cx="130" cy="174" rx="92" ry="13" fill={c.shadow} />
        <ellipse cx="130" cy="104" rx="94" ry="20" fill="white" />
        {([54,74,94,113,130,147,166,186,206] as const).map((x, i) => (
          <ellipse key={x} cx={x} cy={118+(i%3)*3} rx={5} ry={6+(i%3)*4} fill="white" />
        ))}
        {[56,86,116,144,174,204].map(x => (
          <circle key={x} cx={x} cy={152} r={3.5} fill="white" opacity="0.62" />
        ))}
        <ellipse cx="130" cy="104" rx="86" ry="22" fill="url(#cp-tg)" />
        <ellipse cx="106" cy="92" rx="38" ry="10" fill="white" opacity="0.17" />
        {text && <>
          <text x="131" y="105" textAnchor="middle" dominantBaseline="middle" fill="rgba(45,0,10,0.40)" fontWeight="bold" fontSize="13" fontFamily="Georgia, serif">{text}</text>
          <text x="130" y="104" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontWeight="bold" fontSize="13" fontFamily="Georgia, serif">{text}</text>
        </>}
      </svg>
    );
    topContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ct-cg" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={c.top} />
            <stop offset="100%" stopColor={c.mid} />
          </radialGradient>
        </defs>
        <circle cx="130" cy="100" r="93" fill={plate} />
        <circle cx="130" cy="100" r="88" fill="white" />
        <circle cx="130" cy="100" r="78" fill="url(#ct-cg)" />
        {[0,40,80,120,160,200,240,280,320].map((deg, i) => {
          const rad = deg * Math.PI / 180;
          return <ellipse key={deg} cx={130 + 83*Math.cos(rad)} cy={100 + 83*Math.sin(rad)} rx={5} ry={4+(i%3)*2} fill="white" opacity="0.9" />;
        })}
        {[0,45,90,135,180,225,270,315].map(deg => {
          const rad = deg * Math.PI / 180;
          return <circle key={deg} cx={130 + 62*Math.cos(rad)} cy={100 + 62*Math.sin(rad)} r={3} fill="white" opacity="0.62" />;
        })}
        <ellipse cx="108" cy="78" rx="28" ry="14" fill="white" opacity="0.17" transform="rotate(-25,108,78)" />
        {text && <>
          <text x="131" y="101" textAnchor="middle" dominantBaseline="middle" fill="rgba(45,0,10,0.40)" fontWeight="bold" fontSize="13" fontFamily="Georgia, serif">{text}</text>
          <text x="130" y="100" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontWeight="bold" fontSize="13" fontFamily="Georgia, serif">{text}</text>
        </>}
      </svg>
    );
  } else if (shape === "heart") {
    const HP  = "M130,176 C104,158 58,128 58,95 C58,68 76,54 100,54 C114,54 124,63 130,75 C136,63 146,54 160,54 C184,54 202,68 202,95 C202,128 156,158 130,176Z";
    const HTP = "M130,161 C104,143 58,113 58,80 C58,53 76,39 100,39 C114,39 124,48 130,60 C136,48 146,39 160,39 C184,39 202,53 202,80 C202,113 156,143 130,161Z";
    sideContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="cp-hg" cx="34%" cy="28%" r="66%">
            <stop offset="0%"   stopColor={c.top} />
            <stop offset="100%" stopColor={c.mid} />
          </radialGradient>
        </defs>
        <ellipse cx="130" cy="192" rx="74" ry="6" fill="rgba(128,0,32,0.12)" />
        <path d={HP} fill={c.shadow} transform="translate(0,22)" />
        <path d={HP} fill={c.dark}   transform="translate(0,14)" />
        <path d={HP} fill="white"         transform="translate(0,8)" />
        <path d={HP} fill="url(#cp-hg)"   transform="translate(0,6)" />
        <path d={HP} fill="white"         transform="translate(0,2)" />
        <path d={HP} fill="url(#cp-hg)" transform="translate(130,115) scale(0.88) translate(-130,-115)" />
        <ellipse cx="96" cy="75" rx="22" ry="10" fill="white" opacity="0.18" transform="rotate(-30,96,75)" />
        {[106,118,130,142,154].map(x => (
          <circle key={x} cx={x} cy={144} r={3} fill="white" opacity="0.75" />
        ))}
        <circle cx="130" cy="156" r={3} fill="white" opacity="0.75" />
        {text && <>
          <text x="131" y="121" textAnchor="middle" dominantBaseline="middle" fill="rgba(45,0,10,0.40)" fontWeight="bold" fontSize="18" fontFamily="Georgia, serif">{text}</text>
          <text x="130" y="120" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontWeight="bold" fontSize="18" fontFamily="Georgia, serif">{text}</text>
        </>}
      </svg>
    );
    topContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <radialGradient id="ct-hg" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor={c.top} />
            <stop offset="100%" stopColor={c.mid} />
          </radialGradient>
        </defs>
        <path d={HTP} fill="rgba(128,0,32,0.12)" transform="translate(4,5)" />
        <path d={HTP} fill="none" stroke="white" strokeWidth="14" />
        <path d={HTP} fill="url(#ct-hg)" />
        <ellipse cx="96" cy="68" rx="22" ry="10" fill="white" opacity="0.18" transform="rotate(-30,96,68)" />
        {[106,118,130,142,154].map(x => (
          <circle key={x} cx={x} cy={132} r={3} fill="white" opacity="0.75" />
        ))}
        <circle cx="130" cy="148" r={3} fill="white" opacity="0.75" />
        {text && <>
          <text x="131" y="101" textAnchor="middle" dominantBaseline="middle" fill="rgba(45,0,10,0.40)" fontWeight="bold" fontSize="18" fontFamily="Georgia, serif">{text}</text>
          <text x="130" y="100" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontWeight="bold" fontSize="18" fontFamily="Georgia, serif">{text}</text>
        </>}
      </svg>
    );
  } else {
    sideContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cp-sqf" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.dark}   />
            <stop offset="45%"  stopColor={c.mid}    />
            <stop offset="100%" stopColor={c.dark}   />
          </linearGradient>
          <linearGradient id="cp-sqr" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.dark}   />
            <stop offset="100%" stopColor={c.shadow} />
          </linearGradient>
          <linearGradient id="cp-sqt" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={c.mid}  />
            <stop offset="100%" stopColor={c.top}  />
          </linearGradient>
        </defs>
        <ellipse cx="128" cy="193" rx="86" ry="6" fill="rgba(128,0,32,0.13)" />
        <polygon points="36,183 204,183 228,163 60,163" fill={plate} />
        <polygon points="36,179 204,179 228,159 60,159" fill={plateLip} />
        <rect x="36" y="114" width="168" height="62" fill="url(#cp-sqf)" />
        <polygon points="204,114 228,92 228,158 204,176" fill="url(#cp-sqr)" />
        <polygon points="36,114 204,114 228,92 60,92" fill="url(#cp-sqt)" />
        <rect x="36" y="106" width="168" height="14" fill="white" />
        <rect x="36" y="110" width="168" height="10" fill="white" opacity="0.95" />
        <polygon points="204,106 228,84 228,98 204,120" fill="white" />
        <polygon points="36,106 204,106 228,84 60,84" fill="white" opacity="0.88" />
        <polygon points="46,108 204,108 226,87 68,87" fill="url(#cp-sqt)" />
        {([52,74,96,118,140,162,186] as const).map((x, i) => (
          <rect key={x} x={x-4} y={118} width={8} height={7+(i%3)*5} rx={4} fill="white" opacity="0.92" />
        ))}
        {[58,90,122,154,186].map(x => (
          <circle key={x} cx={x} cy={150} r={3.5} fill="white" opacity="0.62" />
        ))}
        <line x1="36" y1="114" x2="36" y2="176" stroke="white" strokeWidth="2.5" opacity="0.25" />
        {text && <>
          <text x="137" y="98" textAnchor="middle" dominantBaseline="middle" fill="rgba(45,0,10,0.40)" fontWeight="bold" fontSize="11" fontFamily="Georgia, serif">{text}</text>
          <text x="136" y="97" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontWeight="bold" fontSize="11" fontFamily="Georgia, serif">{text}</text>
        </>}
      </svg>
    );
    topContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="ct-sqg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={c.top} />
            <stop offset="100%" stopColor={c.mid} />
          </linearGradient>
        </defs>
        <rect x="50" y="52" width="168" height="108" rx="4" fill="rgba(128,0,32,0.12)" />
        <rect x="44" y="46" width="172" height="110" rx="4" fill="white" />
        <rect x="56" y="58" width="148" height="88" rx="2" fill="url(#ct-sqg)" />
        <ellipse cx="95" cy="78" rx="28" ry="12" fill="white" opacity="0.17" transform="rotate(-20,95,78)" />
        {[60,82,104,126,148,170,192].map((x, i) => (
          <rect key={x} x={x-3} y={58} width={6} height={6+(i%3)*3} rx={3} fill="white" opacity="0.85" />
        ))}
        {[80,108,130,152,180].map(x => (
          <circle key={x} cx={x} cy={136} r={3.5} fill="white" opacity="0.62" />
        ))}
        {text && <>
          <text x="131" y="103" textAnchor="middle" dominantBaseline="middle" fill="rgba(45,0,10,0.40)" fontWeight="bold" fontSize="16" fontFamily="Georgia, serif">{text}</text>
          <text x="130" y="102" textAnchor="middle" dominantBaseline="middle" fill="#FFFFFF" fontWeight="bold" fontSize="16" fontFamily="Georgia, serif">{text}</text>
        </>}
      </svg>
    );
  }

  return (
    <div className="relative w-full h-full">
      {view === "side" ? sideContent : topContent}
      <button
        onClick={() => setView(v => v === "side" ? "top" : "side")}
        aria-label={view === "side" ? "View from top" : "View from side"}
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-1 shadow-sm text-[#800020] transition-colors"
      >
        {view === "side" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
      </button>
      <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1.5">
        <button onClick={() => setView("side")} className={`w-1.5 h-1.5 rounded-full transition-colors ${view === "side" ? "bg-[#800020]" : "bg-[#800020]/30"}`} />
        <button onClick={() => setView("top")} className={`w-1.5 h-1.5 rounded-full transition-colors ${view === "top" ? "bg-[#800020]" : "bg-[#800020]/30"}`} />
      </div>
    </div>
  );
}

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

// ─── Page component ────────────────────────────────────────────────────────────

export default function MenuContent() {
  const { t, lang } = useLanguage();
  const addToCart = useCartStore((s) => s.addItem);

  const [products, setProducts]                   = useState<DbProduct[]>([]);
  const [loadingProducts, setLoadingProducts]     = useState(true);
  const [activeCategory, setActiveCategory]       = useState<FilterCat>("All");
  const [activeSubCategory, setActiveSubCategory] = useState<SubCat | null>(null);
  const [query, setQuery]                         = useState("");

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => { if (Array.isArray(data)) setProducts(data); })
      .finally(() => setLoadingProducts(false));
  }, []);

  const [custProduct, setCustProduct] = useState<DbProduct | null>(null);
  const [custStep, setCustStep]       = useState(0);
  const [custSel, setCustSel]         = useState<CustSel>(EMPTY_SEL);
  const imageInputRef                 = useRef<HTMLInputElement>(null);

  // Helper: display name respecting language
  const displayName = (p: DbProduct) => lang === "ar" ? (p.name_ar ?? p.name) : p.name;

  // Helper: badge label (subcategory if exists, else category)
  const displayCatKey = (p: DbProduct) => p.subcategory ?? p.category;

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return products.filter((p) => {
      let matchCat: boolean;
      if (activeCategory === "All") {
        matchCat = true;
      } else if (activeCategory === "Customized") {
        matchCat = p.category === "Customized" &&
          (activeSubCategory ? p.subcategory === activeSubCategory : true);
      } else if (activeCategory === "Accessories") {
        matchCat = p.category === "Accessories" &&
          (activeSubCategory ? p.subcategory === activeSubCategory : true);
      } else {
        matchCat = p.category === activeCategory;
      }

      const matchSearch =
        query === "" ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        (p.description ?? "").toLowerCase().includes(query.toLowerCase());

      return matchCat && matchSearch;
    });
  }, [activeCategory, activeSubCategory, query, products]);

  // ── Customizer helpers ──────────────────────────────────────────────────────
  const isCustomizable = (p: DbProduct) => p.category === "Customized";

  const openCustomizer = (product: DbProduct) => {
    setCustProduct(product);
    setCustStep(0);
    setCustSel(EMPTY_SEL);
  };

  const closeCustomizer = () => setCustProduct(null);

  const canProceed = (): boolean => {
    if (custStep === 0) return !!custSel.shape;
    if (custStep === 1) {
      if (custSel.flavorType === "chocolate") return !!custSel.flavor;
      if (custSel.flavorType === "white") return !!custSel.colour;
      return false;
    }
    if (custStep === 2) return !!custSel.sprinkles;
    if (custStep === 3) {
      const s = custSel.shape;
      if (s === "heart")  return custSel.topping === "write";
      if (s === "square") return custSel.topping === "write" || (custSel.topping === "sticker" && !!custSel.stickerId);
      if (s === "cake")   return custSel.topping === "write" || custSel.topping === "upload" || (custSel.topping === "sticker" && !!custSel.stickerId);
    }
    return true;
  };

  const handleNext = () => { if (custStep < 4) setCustStep((s) => s + 1); };
  const handleBack = () => {
    if (custStep > 0) setCustStep((s) => s - 1);
    else closeCustomizer();
  };

  const handleAddToCart = () => {
    if (!custProduct) return;
    const flavorLabel = custSel.flavorType === "chocolate"
      ? CHOC_FLAVORS.find((f) => f.id === custSel.flavor)?.label ?? "Chocolate"
      : `White Chocolate – ${COLOURS.find((c) => c.id === custSel.colour)?.label ?? ""}`;
    const cakeColorLabel = CAKE_COLORS.find((c) => c.id === custSel.cakeColor)?.label;
    const toppingsList: string[] = [];
    if (custSel.sprinkles === "yes") toppingsList.push("Sprinkles");
    addToCart({
      productId:    custProduct.id,
      productName:  custProduct.name,
      productImage: custProduct.image_url ?? "",
      quantity:     1,
      unitPrice:    custProduct.price,
      customization: {
        shape:          SHAPES.find((s) => s.id === custSel.shape)?.label,
        flavor:         flavorLabel,
        color:          cakeColorLabel || undefined,
        toppings:       toppingsList.length ? toppingsList : undefined,
        message:        custSel.topping === "write"   ? custSel.toppingText || undefined : undefined,
        stickerEmoji:   custSel.topping === "sticker" ? custSel.stickerId  || undefined : undefined,
        hasCustomImage: custSel.topping === "upload"  ? true : undefined,
      },
    });
    closeCustomizer();
  };

  // ── Step content ────────────────────────────────────────────────────────────
  const renderStep = () => {
    if (custStep === 4) {
      const shapeName  = SHAPES.find((s) => s.id === custSel.shape)?.label ?? "—";
      const flavorName = custSel.flavorType === "chocolate"
        ? CHOC_FLAVORS.find((f) => f.id === custSel.flavor)?.label ?? "—"
        : "White Chocolate";
      const colourData = COLOURS.find((c) => c.id === custSel.colour);
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-1">Your Order Summary</h2>
          <p className="text-[#800020]/60 text-sm mb-5">Review your choices before adding to cart</p>
          <div className="bg-white rounded-2xl px-5 py-2 shadow-warm-sm mb-6">
            <SummaryRow label="Product"    value={custProduct?.name ?? ""} />
            <SummaryRow label="Shape"      value={shapeName} />
            <SummaryRow label="Flavour"    value={flavorName} />
            {custSel.flavorType === "white" && colourData && (
              <SummaryRow label="Colour" value={colourData.label} dot={colourData.hex} />
            )}
            <SummaryRow label="Sprinkles"  value={custSel.sprinkles === "yes" ? "Yes ✨" : "None"} />
            <SummaryRow
              label="Topping"
              value={
                custSel.topping === "write"   ? `Writing: "${custSel.toppingText || "—"}"`
                : custSel.topping === "sticker" && custSel.stickerId ? `Sticker: ${custSel.stickerId}`
                : custSel.topping === "upload" && custSel.imageFile  ? `📷 ${custSel.imageFile.name}`
                : "—"
              }
            />
          </div>
        </div>
      );
    }

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

    if (custStep === 0) return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">Choose Your Shape</h2>
        <p className="text-[#A05068] text-sm mb-6">Pick a shape for your brownie</p>
        <div className="grid grid-cols-3 gap-3">
          {SHAPES.map((shape) => {
            const sel = custSel.shape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => setCustSel((p) => ({ ...p, shape: shape.id, topping: "", toppingText: "", stickerId: "", imageFile: null }))}
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
                <div className="bg-[#F5D0D8] flex items-center justify-center py-5">{shape.svg}</div>
                <div className="p-2.5">
                  <p className="font-playfair font-bold text-[#2D000A] text-xs">{shape.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );

    if (custStep === 1) {
      const isChocType  = custSel.flavorType === "chocolate";
      const isWhiteType = custSel.flavorType === "white";
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">Choose Your Flavour</h2>
          <p className="text-[#A05068] text-sm mb-5">Pick your chocolate type</p>
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FLAVORS.map((f) => (
              <OptionCard
                key={f.id} id={f.id} emoji={f.emoji} label={f.label} sub={f.sub}
                selected={custSel.flavorType === f.id}
                onClick={() => setCustSel((p) => ({ ...p, flavorType: f.id, flavor: "", colour: "", cakeColor: f.id === "chocolate" ? "brown" : "" }))}
              />
            ))}
          </div>
          {isChocType && (
            <div>
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-3">Choose Flavour</p>
              <div className="grid grid-cols-3 gap-3">
                {CHOC_FLAVORS.map((choc) => {
                  const sel = custSel.flavor === choc.id;
                  return (
                    <button
                      key={choc.id}
                      onClick={() => setCustSel((p) => ({ ...p, flavor: choc.id }))}
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
                        <p className="font-playfair font-bold text-[#2D000A] text-xs">{choc.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          {isWhiteType && (
            <div>
              <p className="text-xs font-bold text-[#A05068] uppercase tracking-wider mb-4">Choose Colour</p>
              <div className="flex justify-around">
                {COLOURS.map((col) => {
                  const sel = custSel.colour === col.id;
                  return (
                    <button key={col.id} onClick={() => setCustSel((p) => ({ ...p, colour: col.id, cakeColor: col.id }))} className="flex flex-col items-center gap-3">
                      <div
                        className={cn(
                          "w-20 h-20 rounded-full border-[5px] transition-all duration-200 flex items-center justify-center shadow-warm-sm",
                          sel ? "border-[#800020] scale-110 shadow-warm-md" : "border-[rgba(128,0,32,0.12)]"
                        )}
                        style={{ backgroundColor: col.hex }}
                      >
                        {sel && <Check size={22} className="text-[#800020]" strokeWidth={3} />}
                      </div>
                      <span className={cn("text-sm font-bold", sel ? "text-[#800020]" : "text-[#800020]")}>{col.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    if (custStep === 2) return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">Sprinkles?</h2>
        <p className="text-[#A05068] text-sm mb-5">Would you like sprinkles on top?</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { id: "yes", label: "Sprinkles", emoji: "🌈", sub: "Rainbow sprinkles on top" },
            { id: "no",  label: "None",      emoji: "✖️", sub: "Keep it plain"            },
          ].map((opt) => (
            <OptionCard
              key={opt.id} id={opt.id} emoji={opt.emoji} label={opt.label} sub={opt.sub}
              selected={custSel.sprinkles === opt.id}
              onClick={() => setCustSel((p) => ({ ...p, sprinkles: opt.id }))}
            />
          ))}
        </div>
      </div>
    );

    if (custStep === 3) {
      const shape         = custSel.shape;
      const showSticker   = shape === "square" || shape === "cake";
      const showUpload    = shape === "cake";
      const isLetterLimit = shape === "heart" || shape === "square";
      const limit  = isLetterLimit ? 3 : 5;
      const unit   = isLetterLimit ? "letters" : "words";
      const count  = isLetterLimit
        ? custSel.toppingText.length
        : (custSel.toppingText.trim() === "" ? 0 : custSel.toppingText.trim().split(/\s+/).length);
      const visibleCards = 1 + (showSticker ? 1 : 0) + (showUpload ? 1 : 0);

      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#2D000A] mb-0.5">Topping</h2>
          <p className="text-[#A05068] text-sm mb-5">Personalise your brownie</p>
          <div className={cn("grid gap-3 mb-5", visibleCards === 3 ? "grid-cols-3" : visibleCards === 2 ? "grid-cols-2" : "grid-cols-1 max-w-[50%]")}>
            <OptionCard id="write" emoji="✍️" label="Write" sub={isLetterLimit ? "Max 3 letters" : "Max 5 words"} selected={custSel.topping === "write"} onClick={() => setCustSel((p) => ({ ...p, topping: "write", stickerId: "" }))} />
            {showSticker && <OptionCard id="sticker" emoji="🎀" label="Sticker" sub="Choose from grid" selected={custSel.topping === "sticker"} onClick={() => setCustSel((p) => ({ ...p, topping: "sticker", toppingText: "" }))} />}
            {showUpload  && <OptionCard id="upload"  emoji="📷" label="Upload"  sub="Add your own photo" selected={custSel.topping === "upload"} onClick={() => { setCustSel((p) => ({ ...p, topping: "upload", toppingText: "", stickerId: "" })); imageInputRef.current?.click(); }} />}
          </div>
          {custSel.topping === "write" && (
            <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#A05068] uppercase tracking-wider">Your Message</label>
                <span className={cn("text-xs font-bold tabular-nums", count >= limit ? "text-[#800020]" : "text-[#A05068]")}>{count} / {limit} {unit}</span>
              </div>
              <textarea
                value={custSel.toppingText}
                onChange={(e) => {
                  const val = e.target.value;
                  if (isLetterLimit) {
                    if (val.length <= limit) setCustSel((p) => ({ ...p, toppingText: val }));
                  } else {
                    const words = val.trim() === "" ? [] : val.trim().split(/\s+/);
                    if (words.length <= limit) setCustSel((p) => ({ ...p, toppingText: val }));
                  }
                }}
                placeholder={isLetterLimit ? "e.g. Hi!" : "e.g. Happy Birthday Sarah!"}
                rows={2}
                className="w-full px-4 py-3 bg-[#FFFFFF] border border-[rgba(128,0,32,0.08)] focus:border-[#800020] rounded-xl text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none transition-colors resize-none"
              />
            </div>
          )}
          {custSel.topping === "sticker" && (
            <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="grid grid-cols-8 gap-2">
                {STICKERS.map((s) => (
                  <button key={s} onClick={() => setCustSel((p) => ({ ...p, stickerId: s }))}
                    className={cn("text-2xl p-1.5 rounded-xl border-2 transition-all duration-150 active:scale-90", custSel.stickerId === s ? "border-[#800020] bg-[#F5D0D8]" : "border-transparent hover:border-[#800020]/30 bg-[#FFFFFF]")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}
          <input ref={imageInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const file = e.target.files?.[0] ?? null; setCustSel((p) => ({ ...p, imageFile: file, topping: "upload" })); }} />
          {custSel.topping === "upload" && custSel.imageFile && (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-warm-sm">
              <p className="text-sm text-[#800020] font-semibold">📷 {custSel.imageFile.name}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ─── Card interior ─────────────────────────────────────────────────────────
  const CardInterior = ({ product, priority = false }: { product: DbProduct; priority?: boolean }) => {
    const badgeKey = displayCatKey(product);
    return (
      <>
        <div className="relative aspect-square overflow-hidden bg-[#F5D0D8]">
          <Image
            src={product.image_url || "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=600&h=700&fit=crop&q=80"}
            alt={displayName(product)}
            fill
            sizes="(max-width: 768px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {product.tag && (
            <span className="absolute top-2.5 left-2.5 bg-[#800020] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">
              {product.tag}
            </span>
          )}
          <span className={cn("absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full", categoryBadge[badgeKey] ?? "bg-[#F5D0D8] text-[#800020]")}>
            {t(catKeyMap[badgeKey]) || badgeKey}
          </span>
        </div>
        <div className="p-3">
          <h3 className="font-playfair font-bold text-[#2D000A] text-sm md:text-base leading-tight mb-0.5 line-clamp-1">
            {displayName(product)}
          </h3>
          <p className="font-bold text-[#800020] text-sm mb-3">QAR {product.price}</p>
          <div className="w-full bg-[#FF6B9D] group-hover:bg-[#2D000A] text-white text-xs font-bold py-2.5 rounded-xl text-center tracking-wide transition-colors duration-200">
            {isCustomizable(product) ? t("menu_customise") : t("menu_add_to_cart")}
          </div>
        </div>
      </>
    );
  };

  // ─── Shared product grid renderer ─────────────────────────────────────────
  const renderGrid = (cols: string) => {
    if (loadingProducts) return (
      <div className="text-center py-24">
        <div className="inline-block w-8 h-8 border-4 border-[#800020]/20 border-t-[#800020] rounded-full animate-spin mb-4" />
        <p className="text-[#800020]/50 text-sm font-medium">Loading menu…</p>
      </div>
    );
    if (filtered.length === 0) return (
      <div className="text-center py-24">
        <p className="font-playfair text-2xl font-semibold text-[#800020]/50 mb-2">{t("menu_no_results")}</p>
        <p className="text-[#800020]/40 text-sm">{t("menu_no_results_hint")}</p>
      </div>
    );
    const cardClass = "group bg-white rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300";
    return (
      <div className={cn("grid gap-3 md:gap-4", cols)}>
        {filtered.map((product, i) => isCustomizable(product) ? (
          <div key={product.id} className={cn(cardClass, "cursor-pointer")} onClick={() => openCustomizer(product)}>
            <CardInterior product={product} priority={i === 0} />
          </div>
        ) : (
          <Link key={product.id} href={`/product/${product.id}`} className={cardClass}>
            <CardInterior product={product} priority={i === 0} />
          </Link>
        ))}
      </div>
    );
  };

  // ─── Shared category sidebar content ───────────────────────────────────────
  const renderSidebarCategories = () => (
    <div className="space-y-0.5">
      {(["All", "Customized", "Accessories", "Boxes"] as FilterCat[]).map((cat) => {
        const active = activeCategory === cat;
        return (
          <div key={cat}>
            <button
              onClick={() => { setActiveCategory(cat); setActiveSubCategory(null); }}
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 text-left",
                active ? "bg-[#800020] text-white" : "text-[#800020] hover:bg-[#800020]/10"
              )}
            >
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0 transition-colors", active ? "bg-white" : "bg-[#800020]/35")} />
              {cat}
            </button>
            {cat === "Customized" && active && (
              <div className="ml-5 mt-1 space-y-0.5">
                {customizedSubs.map(sub => (
                  <button key={sub} onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                    className={cn("w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeSubCategory === sub ? "bg-[#800020]/12 text-[#800020] font-bold" : "text-[#800020]/65 hover:text-[#800020] hover:bg-[#800020]/8"
                    )}>{sub}</button>
                ))}
              </div>
            )}
            {cat === "Accessories" && active && (
              <div className="ml-5 mt-1 space-y-0.5">
                {accessoriesSubs.map(sub => (
                  <button key={sub} onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                    className={cn("w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium transition-all",
                      activeSubCategory === sub ? "bg-[#800020]/12 text-[#800020] font-bold" : "text-[#800020]/65 hover:text-[#800020] hover:bg-[#800020]/8"
                    )}>{sub}</button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#FFFFFF" }}>

      {/* ══ MOBILE layout ══════════════════════════════════════════════════════ */}
      <div className="md:hidden">
        <section className="px-6 pt-7 pb-4">
          <h1 className="font-playfair text-3xl font-bold text-[#2D000A] leading-tight">{t("menu_heading")}</h1>
          <p className="text-[#800020]/65 text-sm mt-1 font-medium">{t("menu_subtitle")}</p>
        </section>

        <div className="sticky top-16 z-30 bg-[#F5D0D8]/96 backdrop-blur-md border-b border-[rgba(128,0,32,0.12)] px-6 pt-3 pb-3 space-y-2.5">
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A05068]" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t("menu_search_placeholder")}
              className="w-full pl-9 pr-10 py-2 bg-white/85 border border-white/50 rounded-full text-sm text-[#2D000A] placeholder:text-[#A05068] outline-none focus:bg-white focus:border-[#800020] transition-all duration-200"
            />
            {query && <button onClick={() => setQuery("")} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#A05068] hover:text-[#800020] text-xs font-bold">✕</button>}
          </div>
          <div className="flex gap-2 pb-0.5 overflow-x-auto scrollbar-hide">
            {(["All", "Customized", "Accessories", "Boxes"] as FilterCat[]).map((cat) => (
              <button key={cat} onClick={() => { setActiveCategory(cat); setActiveSubCategory(null); }}
                className={cn("shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
                  activeCategory === cat ? "bg-[#800020] text-white shadow-warm-sm" : "bg-white/70 text-[#800020] hover:bg-white border border-white/40"
                )}>{cat}</button>
            ))}
          </div>
          {activeCategory === "Customized" && (
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {customizedSubs.map((sub) => (
                <button key={sub} onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                  className={cn("shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all active:scale-[0.97]",
                    activeSubCategory === sub ? "bg-[#800020] text-white" : "bg-white/50 text-[#800020] hover:bg-white border border-white/40"
                  )}>{sub}</button>
              ))}
            </div>
          )}
          {activeCategory === "Accessories" && (
            <div className="flex gap-2 pb-0.5">
              {accessoriesSubs.map((sub) => (
                <button key={sub} onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                  className={cn("shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all active:scale-[0.97]",
                    activeSubCategory === sub ? "bg-[#800020] text-white" : "bg-white/50 text-[#800020] hover:bg-white border border-white/40"
                  )}>{sub}</button>
              ))}
            </div>
          )}
        </div>

        <section className="px-4 py-6">
          {!loadingProducts && filtered.length > 0 && (
            <p className="text-[#800020]/55 text-[11px] font-bold mb-4 uppercase tracking-widest">
              {filtered.length} {filtered.length !== 1 ? "items" : "item"}
            </p>
          )}
          {renderGrid("grid-cols-2")}
        </section>
      </div>

      {/* ══ DESKTOP layout ═════════════════════════════════════════════════════ */}
      <div className="hidden md:flex max-w-[1440px] mx-auto min-h-[calc(100vh-80px)]">

        {/* ── Sidebar ── */}
        <aside className="w-60 lg:w-68 shrink-0 sticky top-20 h-[calc(100vh-80px)] overflow-y-auto border-r border-[rgba(128,0,32,0.10)] flex flex-col px-6 lg:px-8 py-8">
          <h1 className="font-playfair text-3xl lg:text-4xl font-bold text-[#2D000A] leading-tight mb-1">
            {t("menu_heading")}
          </h1>
          <p className="text-[#800020]/60 text-sm font-medium mb-6">{t("menu_subtitle")}</p>

          <div className="relative mb-6">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A05068]" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search…"
              className="w-full pl-8 pr-7 py-2 bg-white/75 border border-white/50 rounded-full text-xs text-[#2D000A] placeholder:text-[#A05068] outline-none focus:bg-white focus:border-[#800020] transition-all"
            />
            {query && <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A05068] hover:text-[#800020] text-xs">✕</button>}
          </div>

          <p className="text-[9px] font-bold text-[#800020]/45 uppercase tracking-widest mb-3">Categories</p>
          {renderSidebarCategories()}

          <div className="mt-auto pt-6 border-t border-[rgba(128,0,32,0.08)]">
            {!loadingProducts && (
              <p className="text-[10px] font-bold text-[#800020]/40 uppercase tracking-widest">
                {filtered.length} {filtered.length !== 1 ? "items" : "item"}
              </p>
            )}
          </div>
        </aside>

        {/* ── Main grid ── */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-10 py-8">
          {renderGrid("grid-cols-3 xl:grid-cols-4")}
        </div>
      </div>

      {/* ══ MOBILE customization panel ═════════════════════════════════════════ */}
      {custProduct && (
        <div className="md:hidden fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: "#F5D0D8" }}>
          <div className="h-16 shrink-0" />
          <div className="shrink-0 bg-[#F5D0D8]/97 backdrop-blur-md border-b border-[rgba(128,0,32,0.12)] overflow-x-auto scrollbar-hide">
            <div className="flex">
              {STEPS.map((step, i) => {
                const active = i === custStep;
                const done   = i < custStep;
                return (
                  <button key={step.label} onClick={() => { if (done) setCustStep(i); }}
                    className={cn("flex flex-col items-center gap-1 px-5 pt-3 pb-2.5 shrink-0 border-b-2 transition-all duration-200",
                      active ? "border-[#800020] text-[#800020]" : done ? "border-transparent text-[#2D000A]/60 cursor-pointer" : "border-transparent text-[#2D000A]/30 cursor-default")}>
                    <step.Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{step.label}</span>
                  </button>
                );
              })}
              <button className={cn("flex flex-col items-center gap-1 px-5 pt-3 pb-2.5 shrink-0 border-b-2 transition-all duration-200",
                custStep === 5 ? "border-[#800020] text-[#800020]" : "border-transparent text-[#2D000A]/30 cursor-default")}>
                <Check size={16} strokeWidth={custStep === 5 ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">Summary</span>
              </button>
            </div>
          </div>

          {custStep < 5 && (
            <div className="w-full shrink-0 bg-[#F5D0D8] overflow-hidden">
              <div className="relative max-w-lg mx-auto flex items-center gap-4 px-5 py-5">
                <div className="flex-1 min-w-0">
                  <div className="inline-flex items-center bg-[#800020]/10 rounded-full px-2.5 py-1 mb-2.5">
                    <span className="text-[#800020] text-[10px] font-bold uppercase tracking-widest">Step {custStep + 1} of {STEPS.length}</span>
                  </div>
                  <p className="font-playfair text-2xl font-bold text-[#2D000A] leading-tight">{STEPS[custStep].label}</p>
                  <p className="text-[#A05068] text-xs mt-1 font-medium">
                    {["Pick your shape","Pick your flavour","Add sprinkles?","Personalise it"][custStep]}
                  </p>
                </div>
                <div className="w-40 h-28 shrink-0 flex items-center justify-center">
                  <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} text={custSel.topping === "write" ? custSel.toppingText : ""} />
                </div>
                <button onClick={closeCustomizer} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/10 flex items-center justify-center text-[#2D000A]/50 hover:bg-black/20 transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>
          )}

          <div className="flex-1 overflow-y-auto">
            {custStep === 5 && (
              <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(128,0,32,0.12)]">
                <div>
                  <p className="text-[10px] font-bold text-[#2D000A]/60 uppercase tracking-widest mb-0.5">Review your order</p>
                  <h2 className="font-playfair text-lg font-bold text-[#2D000A] leading-tight">{custProduct.name}</h2>
                </div>
                <button onClick={closeCustomizer} className="p-1.5 rounded-full text-[#2D000A]/60 hover:text-[#2D000A] transition-colors"><X size={20} /></button>
              </div>
            )}
            <div className="max-w-lg mx-auto px-4 py-5 pb-32">{renderStep()}</div>
          </div>

          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5D0D8]/97 backdrop-blur-md border-t border-[rgba(128,0,32,0.12)] px-4 py-4">
            {custStep < 5 ? (
              <div className="max-w-lg mx-auto flex gap-3">
                <button onClick={handleBack} className="flex-1 bg-white/70 hover:bg-white text-[#800020] font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.97]">
                  {custStep === 0 ? "Cancel" : "← Back"}
                </button>
                <button onClick={handleNext} disabled={!canProceed()}
                  className={cn("flex-[2] font-bold py-4 rounded-2xl text-sm font-playfair tracking-wide transition-all",
                    canProceed() ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm active:scale-[0.97]" : "bg-[#FF6B9D]/40 text-white/50 cursor-not-allowed")}>
                  {custStep === STEP_LABELS.length - 1 ? "Review Order →" : "Next →"}
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <button onClick={handleAddToCart} className="w-full bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-bold py-4 rounded-2xl font-playfair text-base tracking-wide transition-all shadow-warm-sm active:scale-[0.97]">
                  Add to Cart
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ DESKTOP customization dialog ═══════════════════════════════════════ */}
      {custProduct && (
        <div
          className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-8 bg-black/45 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) closeCustomizer(); }}
        >
          <div className="bg-white rounded-3xl w-full max-w-[820px] max-h-[90vh] overflow-hidden flex shadow-2xl">

            {/* Left panel — preview + step nav */}
            <div className="w-64 shrink-0 bg-[#F5D0D8] flex flex-col p-6">
              <p className="text-[9px] font-bold text-[#A05068] uppercase tracking-widest mb-1">Customising</p>
              <h3 className="font-playfair font-bold text-[#2D000A] text-lg leading-tight mb-4 line-clamp-2">{custProduct.name}</h3>

              <div className="w-full aspect-square bg-white/60 rounded-2xl flex items-center justify-center p-3 mb-5 shrink-0">
                <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} text={custSel.topping === "write" ? custSel.toppingText : ""} />
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
                      <span className="flex-1">{step.label}</span>
                      {done && <Check size={11} strokeWidth={2.5} />}
                    </button>
                  );
                })}
                <button className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all text-left",
                  custStep === 5 ? "bg-[#800020] text-white" : "text-[#800020]/30 cursor-default")}>
                  <Check size={13} strokeWidth={custStep === 5 ? 2.5 : 2} />
                  <span className="flex-1">Summary</span>
                </button>
              </div>

              <button onClick={closeCustomizer}
                className="mt-4 w-full py-2.5 rounded-xl bg-[#800020]/10 text-[#800020] text-xs font-bold hover:bg-[#800020]/18 transition-colors shrink-0">
                Cancel
              </button>
            </div>

            {/* Right panel — step content + navigation */}
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-y-auto px-8 py-7">
                {renderStep()}
              </div>
              <div className="shrink-0 px-8 py-5 border-t border-[rgba(128,0,32,0.08)] bg-[#FDFAF8]">
                {custStep < 5 ? (
                  <div className="flex gap-3">
                    <button onClick={handleBack}
                      className="flex-1 bg-white border border-[rgba(128,0,32,0.12)] text-[#800020] font-bold py-3 rounded-2xl text-sm hover:border-[#800020] transition-all active:scale-[0.97]">
                      {custStep === 0 ? "Cancel" : "← Back"}
                    </button>
                    <button onClick={handleNext} disabled={!canProceed()}
                      className={cn("flex-[2] font-bold py-3 rounded-2xl text-sm font-playfair tracking-wide transition-all",
                        canProceed() ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm active:scale-[0.97]" : "bg-[#FF6B9D]/35 text-white/50 cursor-not-allowed")}>
                      {custStep === STEP_LABELS.length - 1 ? "Review Order →" : "Next →"}
                    </button>
                  </div>
                ) : (
                  <button onClick={handleAddToCart}
                    className="w-full bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-bold py-3.5 rounded-2xl font-playfair text-base tracking-wide transition-all shadow-warm-sm active:scale-[0.97]">
                    Add to Cart
                  </button>
                )}
              </div>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
