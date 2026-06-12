"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, ChefHat, Sparkles, PenLine, Box, ChevronLeft, ChevronRight, X, Loader2 } from "lucide-react";
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
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
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
        <ellipse cx="40" cy="71" rx="25" ry="4" fill="#800020" opacity="0.18" />
        <rect x="14" y="38" width="52" height="24" fill="url(#sh-ck-body)" />
        <ellipse cx="40" cy="62" rx="26" ry="8" fill="#800020" />
        <ellipse cx="40" cy="38" rx="28" ry="10" fill="white" />
        {[20,28,40,52,60].map((x,i) => (
          <ellipse key={x} cx={x} cy={44+(i%2)*3} rx={3.5} ry={4+(i%2)*3} fill="white" />
        ))}
        {[22,31,40,49,58].map(x => <circle key={x} cx={x} cy={52} r={1.8} fill="white" opacity="0.65" />)}
        <ellipse cx="40" cy="38" rx="24" ry="8.5" fill="url(#sh-ck-top)" />
        <ellipse cx="34" cy="33" rx="7" ry="2.5" fill="white" opacity="0.22" />
      </svg>
    ),
  },
  {
    id: "heart", label: "Heart",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="#800020" transform="translate(0,7)" opacity="0.35" />
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="white" transform="translate(0,3)" />
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="#7A1F35" />
        <path d="M40,68 C24,58 8,44 8,30 C8,16 17,10 28,10 C34,10 38,15 40,20 C42,15 46,10 52,10 C63,10 72,16 72,30 C72,44 56,58 40,68Z"
          fill="#9B2845" transform="translate(40,39) scale(0.84) translate(-40,-39)" />
        <path d="M21,19 C16,25 13,33 14,39" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.28" />
        {[31,40,49].map(x => <circle key={x} cx={x} cy={53} r={1.8} fill="white" opacity="0.75" />)}
      </svg>
    ),
  },
  {
    id: "square", label: "Square",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-24 h-24">
        <defs>
          <linearGradient id="sh-sq-body" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%"  stopColor="#4A0F1C" />
            <stop offset="45%" stopColor="#7A1F35" />
            <stop offset="100%" stopColor="#4A0F1C" />
          </linearGradient>
        </defs>
        <rect x="11" y="37" width="45" height="28" fill="url(#sh-sq-body)" />
        <polygon points="56,37 70,26 70,55 56,65" fill="#800020" />
        <polygon points="11,37 56,37 70,26 25,26" fill="#9B2845" />
        <rect x="11" y="32" width="45" height="9" fill="white" opacity="0.95" />
        <polygon points="56,32 70,21 70,30 56,41" fill="white" opacity="0.75" />
        <polygon points="11,32 56,32 70,21 25,21" fill="white" opacity="0.88" />
        <polygon points="17,33 56,33 68,23 29,23" fill="#9B2845" opacity="0.7" />
        <line x1="11" y1="37" x2="11" y2="65" stroke="white" strokeWidth="2" opacity="0.2" />
        {[22,35,48].map(x => <circle key={x} cx={x} cy={52} r={2} fill="white" opacity="0.6" />)}
      </svg>
    ),
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

const STEP_LABELS = ["Shape", "Flavour", "Sprinkles", "Topping"];

const STEPS = [
  { label: "Shape",     Icon: Box      },
  { label: "Flavour",   Icon: ChefHat  },
  { label: "Sprinkles", Icon: Sparkles },
  { label: "Topping",   Icon: PenLine  },
];

const DEFAULT_BASE_PRICES: Record<string, number> = { cake: 160, heart: 85, square: 85 };
const DEFAULT_ADDON_PRICES = { sprinkles: 5, writing: 10, sticker: 30, image: 30 };

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
}

const EMPTY_SEL: CustSel = {
  shape: "", flavorType: "", flavor: "", colour: "", cakeColor: "",
  sprinkles: "", topping: "", toppingText: "", stickerUrl: null, imageFile: null,
};

// ─── CakePreview ─────────────────────────────────────────────────────────────

function CakePreview({ shape, colorId, text = "", stickerUrl = "" }: { shape: string; colorId: string; text?: string; stickerUrl?: string }) {
  const [view, setView] = useState<"side"|"top">("side");

  useEffect(() => {
    if (text || stickerUrl) setView("top");
  }, [!!text, !!stickerUrl]); // eslint-disable-line react-hooks/exhaustive-deps

  // Fixed brownie body — white/cream, never changes
  const bc = { top: "#FFFCF8", mid: "#EDE0D4", dark: "#C0B0A2", shadow: "#9C9088" };

  // Sauce/frosting on top — driven by colorId
  const saucePal: Record<string, { hi: string; lo: string }> = {
    "":     { hi: "#FFFCF8", lo: "#EDE0D4" },
    brown:  { hi: "#C07830", lo: "#9A5818" },
    white:  { hi: "#FFFCF8", lo: "#EDE0D4" },
    pink:   { hi: "#FAD8DF", lo: "#D49AA8" },
    blue:   { hi: "#D8EEF8", lo: "#A8C8DC" },
    beige:  { hi: "#F0DEC0", lo: "#C8A068" },
    black:  { hi: "#2A2A2A", lo: "#0D0D0D" },
  };
  const sc = saucePal[colorId] ?? saucePal[""];
  const plate = "#800020";
  const plateLip = "#5C1422";

  let sideContent: JSX.Element;
  let topContent: JSX.Element;

  if (!shape || shape === "cake") {
    sideContent = (
      <svg viewBox="0 0 260 200" className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="cp-sg" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={bc.shadow} />
            <stop offset="14%"  stopColor={bc.dark}   />
            <stop offset="50%"  stopColor={bc.mid}    />
            <stop offset="86%"  stopColor={bc.dark}   />
            <stop offset="100%" stopColor={bc.shadow} />
          </linearGradient>
          <radialGradient id="cp-tg" cx="35%" cy="32%" r="64%">
            <stop offset="0%"   stopColor={sc.hi} />
            <stop offset="100%" stopColor={sc.lo} />
          </radialGradient>
          <clipPath id="sc-cs"><ellipse cx="130" cy="104" rx="76" ry="18" /></clipPath>
        </defs>
        <ellipse cx="130" cy="192" rx="92" ry="6" fill="rgba(128,0,32,0.13)" />
        <ellipse cx="130" cy="183" rx="92" ry="11" fill={plate} />
        <ellipse cx="130" cy="180" rx="92" ry="11" fill={plateLip} />
        <rect x="38" y="104" width="184" height="70" fill="url(#cp-sg)" />
        <ellipse cx="130" cy="174" rx="92" ry="13" fill={bc.shadow} />
        <ellipse cx="130" cy="104" rx="94" ry="20" fill="white" />
        {([54,74,94,113,130,147,166,186,206] as const).map((x, i) => (
          <ellipse key={x} cx={x} cy={118+(i%3)*3} rx={5} ry={6+(i%3)*4} fill="white" />
        ))}
        {[56,86,116,144,174,204].map(x => (
          <circle key={x} cx={x} cy={152} r={3.5} fill="white" opacity="0.62" />
        ))}
        <ellipse cx="130" cy="104" rx="86" ry="22" fill="url(#cp-tg)" />
        {([{x:72,y:116,h:18},{x:91,y:119,h:24},{x:111,y:122,h:14},{x:130,y:124,h:28},{x:149,y:122,h:20},{x:169,y:119,h:16},{x:188,y:116,h:14}] as const).map(d=><rect key={d.x} x={d.x-3.5} y={d.y} width={7} height={d.h} rx={3.5} fill={sc.hi} opacity={0.88}/>)}
        <ellipse cx="106" cy="92" rx="38" ry="10" fill="white" opacity="0.17" />
        {stickerUrl && <image href={stickerUrl} x="98" y="86" width="64" height="36" clipPath="url(#sc-cs)" preserveAspectRatio="xMidYMid meet" opacity="0.95" />}
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
            <stop offset="0%" stopColor={sc.hi} />
            <stop offset="100%" stopColor={sc.lo} />
          </radialGradient>
          <clipPath id="sc-ct"><circle cx="130" cy="100" r="70" /></clipPath>
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
        {stickerUrl && <image href={stickerUrl} x="76" y="46" width="108" height="108" clipPath="url(#sc-ct)" preserveAspectRatio="xMidYMid meet" opacity="0.95" />}
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
            <stop offset="0%"   stopColor={sc.hi} />
            <stop offset="100%" stopColor={sc.lo} />
          </radialGradient>
          <clipPath id="sc-hs"><path d="M130,182 C104,164 58,134 58,101 C58,74 76,60 100,60 C114,60 124,69 130,81 C136,69 146,60 160,60 C184,60 202,74 202,101 C202,134 156,164 130,182Z" /></clipPath>
        </defs>
        <ellipse cx="130" cy="192" rx="74" ry="6" fill="rgba(128,0,32,0.12)" />
        <path d={HP} fill={bc.shadow} transform="translate(0,22)" />
        <path d={HP} fill={bc.dark}   transform="translate(0,14)" />
        <path d={HP} fill="white"         transform="translate(0,8)" />
        <path d={HP} fill="url(#cp-hg)"   transform="translate(0,6)" />
        <path d={HP} fill="white"         transform="translate(0,2)" />
        <path d={HP} fill="url(#cp-hg)" transform="translate(130,115) scale(0.88) translate(-130,-115)" />
        <ellipse cx="96" cy="75" rx="22" ry="10" fill="white" opacity="0.18" transform="rotate(-30,96,75)" />
        {stickerUrl && <image href={stickerUrl} x="90" y="75" width="80" height="80" clipPath="url(#sc-hs)" preserveAspectRatio="xMidYMid meet" opacity="0.95" />}
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
            <stop offset="0%" stopColor={sc.hi} />
            <stop offset="100%" stopColor={sc.lo} />
          </radialGradient>
          <clipPath id="sc-ht"><path d="M130,161 C104,143 58,113 58,80 C58,53 76,39 100,39 C114,39 124,48 130,60 C136,48 146,39 160,39 C184,39 202,53 202,80 C202,113 156,143 130,161Z" /></clipPath>
        </defs>
        <path d={HTP} fill="rgba(128,0,32,0.12)" transform="translate(4,5)" />
        <path d={HTP} fill="none" stroke="white" strokeWidth="14" />
        <path d={HTP} fill="url(#ct-hg)" />
        <ellipse cx="96" cy="68" rx="22" ry="10" fill="white" opacity="0.18" transform="rotate(-30,96,68)" />
        {stickerUrl && <image href={stickerUrl} x="80" y="50" width="100" height="100" clipPath="url(#sc-ht)" preserveAspectRatio="xMidYMid meet" opacity="0.95" />}
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
            <stop offset="0%"   stopColor={bc.dark}   />
            <stop offset="45%"  stopColor={bc.mid}    />
            <stop offset="100%" stopColor={bc.dark}   />
          </linearGradient>
          <linearGradient id="cp-sqr" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={bc.dark}   />
            <stop offset="100%" stopColor={bc.shadow} />
          </linearGradient>
          <linearGradient id="cp-sqt" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor={sc.lo} />
            <stop offset="100%" stopColor={sc.hi} />
          </linearGradient>
          <clipPath id="sc-ss"><polygon points="42,112 200,112 224,93 64,93" /></clipPath>
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
        {([{x:55,h:16},{x:76,h:24},{x:97,h:14},{x:119,h:28},{x:140,h:20},{x:161,h:22},{x:183,h:14}] as const).map(d=><rect key={d.x} x={d.x-3.5} y={113} width={7} height={d.h} rx={3.5} fill={sc.hi} opacity={0.88}/>)}
        {([52,74,96,118,140,162,186] as const).map((x, i) => (
          <rect key={x} x={x-4} y={118} width={8} height={7+(i%3)*5} rx={4} fill="white" opacity="0.92" />
        ))}
        {[58,90,122,154,186].map(x => (
          <circle key={x} cx={x} cy={150} r={3.5} fill="white" opacity="0.62" />
        ))}
        <line x1="36" y1="114" x2="36" y2="176" stroke="white" strokeWidth="2.5" opacity="0.25" />
        {stickerUrl && <image href={stickerUrl} x="95" y="84" width="76" height="30" clipPath="url(#sc-ss)" preserveAspectRatio="xMidYMid meet" opacity="0.95" />}
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
            <stop offset="0%" stopColor={sc.hi} />
            <stop offset="100%" stopColor={sc.lo} />
          </linearGradient>
          <clipPath id="sc-st"><rect x="58" y="60" width="144" height="84" rx="2" /></clipPath>
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
        {stickerUrl && <image href={stickerUrl} x="80" y="62" width="100" height="80" clipPath="url(#sc-st)" preserveAspectRatio="xMidYMid meet" opacity="0.95" />}
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
        className="absolute right-1 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white rounded-full p-2 shadow-sm text-[#800020] transition-colors"
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
  };
  const calcPrice = (): number => {
    const base    = BASE_PRICES[custSel.shape as keyof typeof BASE_PRICES] ?? 0;
    const spr     = custSel.sprinkles === "yes" ? ADDON_PRICES.sprinkles : 0;
    const topping = custSel.topping === "write"   ? ADDON_PRICES.writing
                  : custSel.topping === "sticker" ? ADDON_PRICES.sticker
                  : custSel.topping === "image"   ? ADDON_PRICES.image : 0;
    return base + spr + topping;
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
    return true;
  };

  const handleNext = () => { if (custStep < 4) setCustStep((s) => s + 1); };
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
                <div className="bg-[#F5D0D8] flex items-center justify-center py-7 md:py-9">{shape.svg}</div>
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
      const hasWordLimit = shape === "heart" || shape === "square";
      const limit = hasWordLimit ? 3 : Infinity;
      const count = custSel.toppingText.trim() === "" ? 0 : custSel.toppingText.trim().split(/\s+/).length;
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
                  sub={hasWordLimit ? t("cust_modal_write_max3") : t("cust_modal_write_no_limit")}
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
                {hasWordLimit && (
                  <span className={cn("text-xs font-bold tabular-nums", count >= limit ? "text-[#800020]" : "text-[#A05068]")}>
                    {count} / {limit} {t("cust_modal_words")}
                  </span>
                )}
              </div>
              <textarea
                value={custSel.toppingText}
                onChange={(e) => {
                  const val = e.target.value;
                  if (hasWordLimit) {
                    const words = val.trim() === "" ? [] : val.trim().split(/\s+/);
                    if (words.length <= limit) setCustSel((p) => ({ ...p, toppingText: val }));
                  } else {
                    setCustSel((p) => ({ ...p, toppingText: val }));
                  }
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
                  <span className="text-[10px] font-bold tracking-wide">{t("cust_modal_step_" + step.label.toLowerCase())}</span>
                </button>
              );
            })}
            <button className={cn("flex flex-col items-center gap-1 px-5 pt-3 pb-2.5 shrink-0 border-b-2 transition-all duration-200",
              custStep === 4 ? "border-[#800020] text-[#800020]" : "border-transparent text-[#2D000A]/30 cursor-default")}>
              <Check size={16} strokeWidth={custStep === 4 ? 2.5 : 2} />
              <span className="text-[10px] font-bold tracking-wide">{t("cust_modal_step_summary")}</span>
            </button>
          </div>
        </div>

        {custStep < 4 && (
          <div className="w-full shrink-0 bg-[#F5D0D8] overflow-hidden">
            <div className="relative max-w-lg mx-auto px-5 pt-3 pb-2">
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0 pt-0.5">
                  <div className="inline-flex items-center bg-[#800020]/10 rounded-full px-2.5 py-1 mb-2">
                    <span className="text-[#800020] text-[10px] font-bold uppercase tracking-widest">{t("cust_modal_step")} {custStep + 1} {t("cust_modal_of")} {STEPS.length}</span>
                  </div>
                  <p className="font-playfair text-xl font-bold text-[#2D000A] leading-tight">{t("cust_modal_step_" + STEPS[custStep].label.toLowerCase())}</p>
                  <p className="text-[#A05068] text-xs mt-1 font-medium">
                    {t("cust_modal_step_desc_" + custStep)}
                  </p>
                </div>
                <button onClick={onClose} className="w-10 h-10 rounded-full bg-black/10 flex items-center justify-center text-[#2D000A]/50 hover:bg-black/20 transition-colors shrink-0 mt-0.5">
                  <X size={16} />
                </button>
              </div>
              <div className="w-full h-56 relative rounded-3xl overflow-hidden shadow-[0_8px_40px_rgba(0,0,0,0.13),0_2px_8px_rgba(0,0,0,0.06)]">
                <div className="absolute inset-0 bg-white" />
                <div className="absolute inset-0" style={{background:"radial-gradient(ellipse 70% 55% at 50% 52%, rgba(255,230,238,0.55) 0%, transparent 100%)"}} />
                <div className="absolute bottom-0 inset-x-0 h-10 bg-gradient-to-t from-[#F8ECF0] to-transparent" />
                <div className="absolute top-0 inset-x-0 h-[3px] bg-gradient-to-r from-transparent via-[#800020] to-transparent opacity-25" />
                <div className="absolute top-3 right-3.5 bg-[#800020]/8 rounded-full px-2.5 py-0.5">
                  <span className="text-[8px] font-bold text-[#800020]/45 uppercase tracking-[0.18em]">Preview</span>
                </div>
                <div className="absolute inset-0 flex items-center justify-center p-2 pb-10">
                  <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} text={previewText} stickerUrl={previewSticker} />
                </div>
                {custSel.shape && (
                  <div className="absolute bottom-0 inset-x-0 flex items-center justify-between px-4 py-2.5 bg-white/80 backdrop-blur-sm border-t border-[rgba(128,0,32,0.06)]">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-[#800020]/50 uppercase tracking-wide">Base</span>
                      <span className="text-[10px] text-[#800020]/40">QAR {BASE_PRICES[custSel.shape as keyof typeof BASE_PRICES]}</span>
                      {custSel.sprinkles === "yes" && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.sprinkles} Sprinkles</span>}
                      {custSel.topping === "write"   && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.writing} Writing</span>}
                      {custSel.topping === "sticker" && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.sticker} Sticker</span>}
                      {custSel.topping === "image"   && <span className="text-[10px] text-[#800020]/40">· +{ADDON_PRICES.image} Image</span>}
                    </div>
                    <span className="font-playfair font-bold text-[#800020] text-base shrink-0">QAR {calcPrice()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          {custStep === 4 && (
            <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-[rgba(128,0,32,0.12)]">
              <div>
                <p className="text-[10px] font-bold text-[#2D000A]/60 uppercase tracking-widest mb-0.5">{t("cust_modal_review_header")}</p>
                <h2 className="font-playfair text-lg font-bold text-[#2D000A] leading-tight">{product.name}</h2>
              </div>
              <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full text-[#2D000A]/60 hover:text-[#2D000A] transition-colors"><X size={20} /></button>
            </div>
          )}
          <div className="max-w-lg mx-auto px-4 py-5 pb-32">{renderStep()}</div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#F5D0D8]/97 backdrop-blur-md border-t border-[rgba(128,0,32,0.12)] px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {custStep < 4 ? (
            <div className="max-w-lg mx-auto flex gap-3">
              <button onClick={handleBack} className="flex-1 bg-white/70 hover:bg-white text-[#800020] font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.97]">
                {custStep === 0 ? t("cust_modal_cancel") : t("cust_modal_back")}
              </button>
              <button onClick={handleNext} disabled={!canProceed()}
                className={cn("flex-[2] font-bold py-4 rounded-2xl text-sm font-playfair tracking-wide transition-all",
                  canProceed() ? "bg-[#FF6B9D] hover:bg-[#2D000A] text-white shadow-warm-sm active:scale-[0.97]" : "bg-[#FF6B9D]/40 text-white/50 cursor-not-allowed")}>
                {custStep === STEP_LABELS.length - 1 ? t("cust_modal_review_btn") : t("cust_modal_next")}
              </button>
            </div>
          ) : (
            <div className="max-w-lg mx-auto flex gap-3">
              <button onClick={handleContinue} disabled={uploading}
                className="flex-1 bg-white/70 hover:bg-white text-[#800020] font-bold py-4 rounded-2xl text-sm transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed">
                {uploading ? t("cust_modal_uploading") : t("cust_modal_continue")}
              </button>
              <button onClick={handleCheckout} disabled={uploading}
                className="flex-[2] bg-[#FF6B9D] hover:bg-[#2D000A] text-white font-bold py-4 rounded-2xl font-playfair text-base tracking-wide transition-all shadow-warm-sm active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
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
                <CakePreview shape={custSel.shape} colorId={custSel.cakeColor} text={previewText} stickerUrl={previewSticker} />
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
                custStep === 4 ? "bg-[#800020] text-white" : "text-[#800020]/30 cursor-default")}>
                <Check size={13} strokeWidth={custStep === 4 ? 2.5 : 2} />
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
              {custStep < 4 ? (
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
