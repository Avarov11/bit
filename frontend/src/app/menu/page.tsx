"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, Check, ChefHat, Sparkles, PenLine, Box } from "lucide-react";
import { menuProducts, type Category, type MenuProduct } from "@/data/products";
import { useLanguage } from "@/context/LanguageContext";
import { useCartStore } from "@/store/cartStore";
import { cn } from "@/lib/utils";

// ─── Nav constants ─────────────────────────────────────────────────────────────

const customizedSubCategories: Category[] = [
  "Birthday", "Congrats", "Graduation", "Get Well Soon", "Bride to Be", "Gender Reveal",
];
const accessoriesSubCategories: Category[] = ["Candles", "Balloons"];

const catKeyMap: Record<Category, string> = {
  All: "cat_all", Accessories: "cat_accessories", Candles: "cat_candles",
  Balloons: "cat_balloons", Boxes: "cat_boxes", Customized: "cat_customized",
  Birthday: "cat_birthday", Congrats: "cat_congrats", Graduation: "cat_graduation",
  "Get Well Soon": "cat_get_well_soon", "Bride to Be": "cat_bride_to_be",
  "Gender Reveal": "cat_gender_reveal",
};

const categoryBadge: Record<Exclude<Category, "All">, string> = {
  Accessories: "bg-[#E4EDF5] text-[#2D4A7A]", Candles: "bg-[#FFF3E0] text-[#7A5200]",
  Balloons: "bg-[#FCE4EC] text-[#880E4F]", Boxes: "bg-[#F5EDE4] text-[#7A4A2D]",
  Customized: "bg-gold-light text-gold-dark", Birthday: "bg-burgundy-light text-burgundy-dark",
  Congrats: "bg-[#D6F0E8] text-[#2D7A5C]", Graduation: "bg-[#DAE4F5] text-[#2D4A7A]",
  "Get Well Soon": "bg-[#D6F0EC] text-[#2D7A6A]", "Bride to Be": "bg-[#F5E4F0] text-[#7A2D6A]",
  "Gender Reveal": "bg-[#EDE4F5] text-[#6B3FA0]",
};

function productNameKey(id: string) {
  return `product_name_${id.replace(/-/g, "_")}`;
}

// ─── Customization panel constants ─────────────────────────────────────────────

const SHAPES = [
  {
    id: "cake", label: "Full Cake",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
        <rect x="8"  y="52" width="64" height="18" rx="5" fill="#3D0A14" opacity="0.85"/>
        <rect x="16" y="32" width="48" height="20" rx="5" fill="#3D0A14" opacity="0.70"/>
        <path d="M8 52 Q14 47 20 52 Q26 47 32 52 Q38 47 44 52 Q50 47 56 52 Q62 47 72 52" stroke="#FDF6F0" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <path d="M16 32 Q22 27 28 32 Q34 27 40 32 Q46 27 52 32 Q58 27 64 32" stroke="#FDF6F0" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
        <rect x="37" y="20" width="6" height="14" rx="2" fill="#C896A0"/>
        <path d="M40 18 C42 14 44 11 40 8 C36 11 38 14 40 18Z" fill="#FFB347"/>
      </svg>
    ),
  },
  {
    id: "heart", label: "Heart",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
        <path d="M40 68 C38 66 8 50 8 28 C8 17 16 10 26 10 C32 10 37 14 40 19 C43 14 48 10 54 10 C64 10 72 17 72 28 C72 50 42 66 40 68Z" fill="#3D0A14" opacity="0.80"/>
        <path d="M20 22 Q22 16 28 18" stroke="#FDF6F0" strokeWidth="2.5" strokeLinecap="round" opacity="0.5"/>
      </svg>
    ),
  },
  {
    id: "square", label: "Square",
    svg: (
      <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-14 h-14">
        <rect x="10" y="16" width="60" height="48" rx="8" fill="#3D0A14" opacity="0.80"/>
        <path d="M22 26 Q26 36 22 46" stroke="#FDF6F0" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M38 22 Q42 32 38 42" stroke="#FDF6F0" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55"/>
        <path d="M54 26 Q58 36 54 46" stroke="#FDF6F0" strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.55"/>
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
  { id: "white", label: "White", hex: "#FDF6F0" },
  { id: "pink",  label: "Pink",  hex: "#C896A0" },
  { id: "blue",  label: "Blue",  hex: "#B2C8D8" },
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
  sprinkles: string;
  topping: string;      // "write" | "sticker" | "upload" | ""
  toppingText: string;
  stickerId: string;
  imageFile: File | null;
}

const EMPTY_SEL: CustSel = {
  shape: "", flavorType: "", flavor: "", colour: "",
  sprinkles: "", topping: "", toppingText: "",
  stickerId: "", imageFile: null,
};

// ─── Summary row helper ────────────────────────────────────────────────────────

function SummaryRow({ label, value, dot }: { label: string; value: string; dot?: string }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-[rgba(26,10,10,0.06)] last:border-0">
      <span className="text-xs font-bold text-[#9E7B7B] uppercase tracking-wide">{label}</span>
      <div className="flex items-center gap-2">
        {dot && (
          <div className="w-3.5 h-3.5 rounded-full border border-[rgba(26,10,10,0.20)]"
            style={{ backgroundColor: dot }} />
        )}
        <span className="text-sm font-semibold text-[#1A0A0A] text-right max-w-[200px]">{value}</span>
      </div>
    </div>
  );
}

// ─── Page component ────────────────────────────────────────────────────────────

export default function MenuPage() {
  const { t } = useLanguage();
  const addToCart = useCartStore((s) => s.addItem);

  // Filter state
  const [activeCategory, setActiveCategory] = useState<Category>("All");
  const [activeSubCategory, setActiveSubCategory] = useState<Category | null>(null);
  const [query, setQuery] = useState("");

  // Customization panel state
  const [custProduct, setCustProduct] = useState<MenuProduct | null>(null);
  const [custStep, setCustStep] = useState(0); // 0–4 = steps, 5 = summary
  const [custSel, setCustSel] = useState<CustSel>(EMPTY_SEL);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // ── Filter logic ────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return menuProducts.filter((p) => {
      let matchCat: boolean;
      if (activeCategory === "All") {
        matchCat = true;
      } else if (activeCategory === "Customized") {
        matchCat = activeSubCategory
          ? p.category === activeSubCategory
          : customizedSubCategories.includes(p.category);
      } else if (activeCategory === "Accessories") {
        matchCat = activeSubCategory
          ? p.category === activeSubCategory
          : accessoriesSubCategories.includes(p.category);
      } else {
        matchCat = p.category === activeCategory;
      }
      const translatedName = t(productNameKey(p.id));
      const matchSearch =
        query === "" ||
        translatedName.toLowerCase().includes(query.toLowerCase()) ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.description.toLowerCase().includes(query.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [activeCategory, activeSubCategory, query, t]);

  // ── Customizer helpers ──────────────────────────────────────────────────────
  const isCustomizedProduct = (cat: Category) =>
    cat === "Customized" || customizedSubCategories.includes(cat);

  const openCustomizer = (product: MenuProduct) => {
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
      if (s === "square") return custSel.topping === "write" ||
        (custSel.topping === "sticker" && !!custSel.stickerId);
      if (s === "cake")   return custSel.topping === "write" ||
        custSel.topping === "upload" ||
        (custSel.topping === "sticker" && !!custSel.stickerId);
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
    const toppingsList: string[] = [];
    if (custSel.sprinkles === "yes") toppingsList.push("Sprinkles");
    if (custSel.topping === "sticker" && custSel.stickerId)
      toppingsList.push(`Sticker ${custSel.stickerId}`);
    addToCart({
      productId: custProduct.id,
      productName: custProduct.name,
      productImage: custProduct.image,
      quantity: 1,
      unitPrice: custProduct.price,
      customization: {
        shape:    SHAPES.find((s) => s.id === custSel.shape)?.label,
        flavor:   flavorLabel,
        color:    custSel.flavorType === "white" ? COLOURS.find((c) => c.id === custSel.colour)?.label : undefined,
        toppings: toppingsList.length ? toppingsList : undefined,
        message:  custSel.topping === "write" ? custSel.toppingText || undefined : undefined,
      },
    });
    closeCustomizer();
  };

  // ── Step content ────────────────────────────────────────────────────────────
  const renderStep = () => {

    // ── Summary (step 4) ────────────────────────────────────────────────────
    if (custStep === 4) {
      const shapeName  = SHAPES.find((s) => s.id === custSel.shape)?.label ?? "—";
      const flavorName = custSel.flavorType === "chocolate"
        ? CHOC_FLAVORS.find((f) => f.id === custSel.flavor)?.label ?? "—"
        : "White Chocolate";
      const colourData = COLOURS.find((c) => c.id === custSel.colour);
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">Your Order Summary</h2>
          <p className="text-[#3D0A14]/60 text-sm mb-5">Review your choices before adding to cart</p>
          <div className="bg-white rounded-2xl px-5 py-2 shadow-warm-sm mb-6">
            <SummaryRow label="Product"   value={custProduct?.name ?? ""} />
            <SummaryRow label="Shape"     value={shapeName} />
            <SummaryRow label="Flavour"   value={flavorName} />
            {custSel.flavorType === "white" && colourData && (
              <SummaryRow label="Colour" value={colourData.label} dot={colourData.hex} />
            )}
            <SummaryRow label="Sprinkles" value={custSel.sprinkles === "yes" ? "Yes ✨" : "None"} />
            <SummaryRow
              label="Topping"
              value={
                custSel.topping === "write"
                  ? `Writing: "${custSel.toppingText || "—"}"`
                  : custSel.topping === "sticker" && custSel.stickerId
                  ? `Sticker: ${custSel.stickerId}`
                  : custSel.topping === "upload" && custSel.imageFile
                  ? `📷 ${custSel.imageFile.name}`
                  : "—"
              }
            />
          </div>
        </div>
      );
    }

    // ── Shared card component ────────────────────────────────────────────────
    const OptionCard = ({
      id, emoji, label, sub, selected, onClick,
    }: { id: string; emoji: string; label: string; sub?: string; selected: boolean; onClick: () => void }) => (
      <button
        key={id}
        onClick={onClick}
        className={cn(
          "relative rounded-2xl overflow-hidden bg-white text-left transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
          selected ? "ring-2 ring-[#3D0A14] shadow-warm-md" : "hover:shadow-warm-md"
        )}
      >
        {selected && (
          <span className="absolute top-2.5 right-2.5 z-10 bg-[#3D0A14] rounded-full p-0.5">
            <Check size={11} className="text-white" strokeWidth={3} />
          </span>
        )}
        <div className="bg-[#F5E4E6] flex items-center justify-center py-7">
          <span className="text-5xl">{emoji}</span>
        </div>
        <div className="p-3">
          <p className="font-playfair font-bold text-[#1A0A0A] text-sm">{label}</p>
          {sub && <p className="text-[#9E7B7B] text-[11px] mt-0.5">{sub}</p>}
        </div>
      </button>
    );

    // ── Step 0: Shape ────────────────────────────────────────────────────────
    if (custStep === 0) return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-0.5">Choose Your Shape</h2>
        <p className="text-[#9E7B7B] text-sm mb-6">Pick a shape for your brownie</p>
        <div className="grid grid-cols-3 gap-3">
          {SHAPES.map((shape) => {
            const sel = custSel.shape === shape.id;
            return (
              <button
                key={shape.id}
                onClick={() => setCustSel((p) => ({
                  ...p, shape: shape.id,
                  topping: "", toppingText: "", stickerId: "", imageFile: null,
                }))}
                className={cn(
                  "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                  sel ? "ring-2 ring-[#3D0A14] shadow-warm-md" : "hover:shadow-warm-md"
                )}
              >
                {sel && (
                  <span className="absolute top-2 right-2 z-10 bg-[#3D0A14] rounded-full p-0.5">
                    <Check size={10} className="text-white" strokeWidth={3} />
                  </span>
                )}
                <div className="bg-[#F5E4E6] flex items-center justify-center py-5">
                  {shape.svg}
                </div>
                <div className="p-2.5">
                  <p className="font-playfair font-bold text-[#1A0A0A] text-xs">{shape.label}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );

    // ── Step 1: Flavour ──────────────────────────────────────────────────────
    if (custStep === 1) {
      const isChocType  = custSel.flavorType === "chocolate";
      const isWhiteType = custSel.flavorType === "white";
      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-0.5">Choose Your Flavour</h2>
          <p className="text-[#9E7B7B] text-sm mb-5">Pick your chocolate type</p>

          {/* Top-level flavor cards */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {FLAVORS.map((f) => (
              <OptionCard
                key={f.id} id={f.id} emoji={f.emoji} label={f.label} sub={f.sub}
                selected={custSel.flavorType === f.id}
                onClick={() => setCustSel((p) => ({ ...p, flavorType: f.id, flavor: "", colour: "" }))}
              />
            ))}
          </div>

          {/* Chocolate sub-flavors */}
          {isChocType && (
            <div>
              <p className="text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-3">Choose Flavour</p>
              <div className="grid grid-cols-3 gap-3">
                {CHOC_FLAVORS.map((choc) => {
                  const sel = custSel.flavor === choc.id;
                  return (
                    <button
                      key={choc.id}
                      onClick={() => setCustSel((p) => ({ ...p, flavor: choc.id }))}
                      className={cn(
                        "relative rounded-2xl overflow-hidden bg-white text-center transition-all duration-200 active:scale-[0.97] shadow-warm-sm",
                        sel ? "ring-2 ring-[#3D0A14] shadow-warm-md" : "hover:shadow-warm-md"
                      )}
                    >
                      {sel && (
                        <span className="absolute top-2 right-2 z-10 bg-[#3D0A14] rounded-full p-0.5">
                          <Check size={10} className="text-white" strokeWidth={3} />
                        </span>
                      )}
                      <div className="bg-[#F5E4E6] flex items-center justify-center py-5">
                        <span className="text-4xl">{choc.emoji}</span>
                      </div>
                      <div className="p-2.5">
                        <p className="font-playfair font-bold text-[#1A0A0A] text-xs">{choc.label}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* White chocolate colour swatches */}
          {isWhiteType && (
            <div>
              <p className="text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-4">Choose Colour</p>
              <div className="flex justify-around">
                {COLOURS.map((col) => {
                  const sel = custSel.colour === col.id;
                  return (
                    <button
                      key={col.id}
                      onClick={() => setCustSel((p) => ({ ...p, colour: col.id }))}
                      className="flex flex-col items-center gap-3"
                    >
                      <div
                        className={cn(
                          "w-20 h-20 rounded-full border-[5px] transition-all duration-200 flex items-center justify-center shadow-warm-sm",
                          sel ? "border-[#3D0A14] scale-110 shadow-warm-md" : "border-[rgba(26,10,10,0.12)]"
                        )}
                        style={{ backgroundColor: col.hex }}
                      >
                        {sel && <Check size={22} className="text-[#3D0A14]" strokeWidth={3} />}
                      </div>
                      <span className={cn("text-sm font-bold", sel ? "text-[#3D0A14]" : "text-[#4A3728]")}>
                        {col.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      );
    }

    // ── Step 2: Sprinkles ────────────────────────────────────────────────────
    if (custStep === 2) return (
      <div>
        <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-0.5">Sprinkles?</h2>
        <p className="text-[#9E7B7B] text-sm mb-5">Would you like sprinkles on top?</p>
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

    // ── Step 3: Topping (shape-aware) ────────────────────────────────────────
    // Heart:  Write only (max 3 letters)
    // Square: Write (max 3 letters) + Sticker — no upload
    // Cake:   Write (max 5 words) + Sticker + Upload
    if (custStep === 3) {
      const shape       = custSel.shape;
      const showSticker = shape === "square" || shape === "cake";
      const showUpload  = shape === "cake";
      const isLetterLimit = shape === "heart" || shape === "square";
      const limit  = isLetterLimit ? 3 : 5;
      const unit   = isLetterLimit ? "letters" : "words";
      const count  = isLetterLimit
        ? custSel.toppingText.length
        : (custSel.toppingText.trim() === "" ? 0 : custSel.toppingText.trim().split(/\s+/).length);
      const visibleCards = 1 + (showSticker ? 1 : 0) + (showUpload ? 1 : 0);

      return (
        <div>
          <h2 className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-0.5">Topping</h2>
          <p className="text-[#9E7B7B] text-sm mb-5">Personalise your brownie</p>

          {/* Option cards */}
          <div className={cn(
            "grid gap-3 mb-5",
            visibleCards === 3 ? "grid-cols-3"
              : visibleCards === 2 ? "grid-cols-2"
              : "grid-cols-1 max-w-[50%]"
          )}>
            {/* Write — all shapes */}
            <OptionCard
              id="write" emoji="✍️"
              label="Write"
              sub={isLetterLimit ? "Max 3 letters" : "Max 5 words"}
              selected={custSel.topping === "write"}
              onClick={() => setCustSel((p) => ({ ...p, topping: "write", stickerId: "" }))}
            />
            {/* Sticker — square + cake */}
            {showSticker && (
              <OptionCard
                id="sticker" emoji="🎀" label="Sticker" sub="Choose from grid"
                selected={custSel.topping === "sticker"}
                onClick={() => setCustSel((p) => ({ ...p, topping: "sticker", toppingText: "" }))}
              />
            )}
            {/* Upload — cake only */}
            {showUpload && (
              <OptionCard
                id="upload" emoji="📷" label="Upload" sub="Add your own photo"
                selected={custSel.topping === "upload"}
                onClick={() => {
                  setCustSel((p) => ({ ...p, topping: "upload", toppingText: "", stickerId: "" }));
                  imageInputRef.current?.click();
                }}
              />
            )}
          </div>

          {/* Write — text input */}
          {custSel.topping === "write" && (
            <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#9E7B7B] uppercase tracking-wider">Your Message</label>
                <span className={cn("text-xs font-bold tabular-nums", count >= limit ? "text-[#3D0A14]" : "text-[#9E7B7B]")}>
                  {count} / {limit} {unit}
                </span>
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
                className="w-full px-4 py-3 bg-[#FDF6F0] border border-[rgba(26,10,10,0.08)] focus:border-[#3D0A14] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors resize-none"
              />
            </div>
          )}

          {/* Sticker grid */}
          {custSel.topping === "sticker" && (
            <div className="bg-white rounded-2xl p-4 shadow-warm-sm">
              <div className="grid grid-cols-8 gap-2">
                {STICKERS.map((s) => (
                  <button
                    key={s}
                    onClick={() => setCustSel((p) => ({ ...p, stickerId: s }))}
                    className={cn(
                      "text-2xl p-1.5 rounded-xl border-2 transition-all duration-150 active:scale-90",
                      custSel.stickerId === s
                        ? "border-[#3D0A14] bg-[#F5E4E6]"
                        : "border-transparent hover:border-[#3D0A14]/30 bg-[#FDF6F0]"
                    )}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Upload */}
          <input
            ref={imageInputRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              setCustSel((p) => ({ ...p, imageFile: file, topping: "upload" }));
            }}
          />
          {custSel.topping === "upload" && custSel.imageFile && (
            <div className="bg-white rounded-2xl px-4 py-3 shadow-warm-sm">
              <p className="text-sm text-[#3D0A14] font-semibold">📷 {custSel.imageFile.name}</p>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ─── Shared card interior ──────────────────────────────────────────────────
  const CardInterior = ({ product }: { product: MenuProduct }) => (
    <>
      <div className="relative aspect-square overflow-hidden bg-[#F5E4E6]">
        <Image
          src={product.image}
          alt={t(productNameKey(product.id))}
          fill
          sizes="(max-width: 768px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {product.tag && (
          <span className="absolute top-2.5 left-2.5 bg-[#3D0A14] text-white text-[10px] font-bold px-2.5 py-1 rounded-full tracking-wide uppercase shadow-sm">
            {product.tag}
          </span>
        )}
        <span className={cn(
          "absolute bottom-2.5 left-2.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full",
          categoryBadge[product.category]
        )}>
          {t(catKeyMap[product.category])}
        </span>
      </div>
      <div className="p-3">
        <h3 className="font-playfair font-bold text-[#1A0A0A] text-sm md:text-base leading-tight mb-0.5 line-clamp-1">
          {t(productNameKey(product.id))}
        </h3>
        <p className="font-bold text-[#3D0A14] text-sm mb-3">QAR {product.price}</p>
        <div className="w-full bg-[#3D0A14] group-hover:bg-[#2D0810] text-white text-xs font-bold py-2.5 rounded-xl text-center tracking-wide transition-colors duration-200">
          {isCustomizedProduct(product.category) ? t("menu_customise") : t("menu_add_to_cart")}
        </div>
      </div>
    </>
  );

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen pt-16 md:pt-20" style={{ backgroundColor: "#C896A0" }}>

      {/* ─── Page header ───────────────────────────────────── */}
      <section className="px-6 md:px-12 pt-7 pb-4">
        <div className="max-w-[1200px] mx-auto">
          <h1 data-i18n="menu_heading" className="font-playfair text-3xl md:text-4xl font-bold text-[#1A0A0A] leading-tight">
            {t("menu_heading")}
          </h1>
          <p data-i18n="menu_subtitle" className="text-[#3D0A14]/65 text-sm mt-1 font-medium">
            {t("menu_subtitle")}
          </p>
        </div>
      </section>

      {/* ─── Sticky filters ─────────────────────────────────── */}
      <div className="sticky top-16 md:top-20 z-30 bg-[#C896A0]/96 backdrop-blur-md border-b border-[rgba(26,10,10,0.12)] px-6 md:px-12 pt-3 pb-3">
        <div className="max-w-[1200px] mx-auto space-y-2.5">

          {/* Search */}
          <div className="relative">
            <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#7A5060]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              data-i18n="menu_search_placeholder"
              placeholder={t("menu_search_placeholder")}
              className="w-full pl-9 pr-10 py-2 bg-white/85 border border-white/50 rounded-full text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none focus:bg-white focus:border-[#3D0A14] transition-all duration-200"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#9E7B7B] hover:text-[#3D0A14] text-xs font-bold transition-colors"
              >
                ✕
              </button>
            )}
          </div>

          {/* Category pills */}
          <div className="flex gap-2 pb-0.5">
            {(["All", "Customized", "Accessories", "Boxes"] as Category[]).map((cat) => (
              <button
                key={cat}
                onClick={() => { setActiveCategory(cat); setActiveSubCategory(null); }}
                className={cn(
                  "shrink-0 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
                  activeCategory === cat
                    ? "bg-[#3D0A14] text-white shadow-warm-sm"
                    : "bg-white/70 text-[#3D0A14] hover:bg-white border border-white/40"
                )}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sub-filter row — Customized */}
          {activeCategory === "Customized" && (
            <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
              {customizedSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                  className={cn(
                    "shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
                    activeSubCategory === sub
                      ? "bg-[#3D0A14] text-white shadow-warm-sm"
                      : "bg-white/50 text-[#3D0A14] hover:bg-white border border-white/40"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Sub-filter row — Accessories */}
          {activeCategory === "Accessories" && (
            <div className="flex gap-2 pb-0.5">
              {accessoriesSubCategories.map((sub) => (
                <button
                  key={sub}
                  onClick={() => setActiveSubCategory(activeSubCategory === sub ? null : sub)}
                  className={cn(
                    "shrink-0 px-3.5 py-1 rounded-full text-[11px] font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
                    activeSubCategory === sub
                      ? "bg-[#3D0A14] text-white shadow-warm-sm"
                      : "bg-white/50 text-[#3D0A14] hover:bg-white border border-white/40"
                  )}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

        </div>
      </div>

      {/* ─── Grid ──────────────────────────────────────────── */}
      {/* EDIT 1: max-w-[1200px] container, 3-col desktop grid capped at 900px */}
      <section className="px-4 md:px-12 py-6 md:py-8">
        <div className="max-w-[1200px] mx-auto">

          {filtered.length === 0 ? (
            <div className="text-center py-24">
              <p data-i18n="menu_no_results" className="font-playfair text-2xl font-semibold text-[#3D0A14]/50 mb-2">
                {t("menu_no_results")}
              </p>
              <p data-i18n="menu_no_results_hint" className="text-[#3D0A14]/40 text-sm">
                {t("menu_no_results_hint")}
              </p>
            </div>
          ) : (
            <>
              <p className="text-[#3D0A14]/55 text-[11px] font-bold mb-4 uppercase tracking-widest lg:max-w-[900px] lg:mx-auto">
                {filtered.length} {filtered.length !== 1 ? "items" : "item"}
              </p>

              {/* EDIT 1: 3 cols on desktop, 2 on tablet/mobile, centered at max 900px on desktop */}
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:max-w-[900px] lg:mx-auto">
                {filtered.map((product) => {
                  const isCust = isCustomizedProduct(product.category);
                  const cardClass = "group bg-white rounded-2xl overflow-hidden shadow-warm-sm hover:shadow-warm-lg hover:-translate-y-1 transition-all duration-300";

                  /* EDIT 2: customized products open the inline panel; others navigate */
                  return isCust ? (
                    <div
                      key={product.id}
                      className={cn(cardClass, "cursor-pointer")}
                      onClick={() => openCustomizer(product)}
                    >
                      <CardInterior product={product} />
                    </div>
                  ) : (
                    <Link
                      key={product.id}
                      href={`/product/${product.id}`}
                      className={cardClass}
                    >
                      <CardInterior product={product} />
                    </Link>
                  );
                })}
              </div>
            </>
          )}

        </div>
      </section>

      {/* ─── Inline customization panel ────────────── */}
      {custProduct && (
        <div className="fixed inset-0 z-40 flex flex-col" style={{ backgroundColor: "#C896A0" }}>

          {/* Spacer — clears the fixed navbar */}
          <div className="h-16 md:h-20 shrink-0" />

          {/* ── Step tab bar ── */}
          <div className="shrink-0 bg-[#C896A0]/97 backdrop-blur-md border-b border-[rgba(26,10,10,0.12)] overflow-x-auto scrollbar-hide">
            <div className="flex">
              {STEPS.map((step, i) => {
                const active = i === custStep;
                const done   = i < custStep;
                return (
                  <button
                    key={step.label}
                    onClick={() => { if (done) setCustStep(i); }}
                    className={cn(
                      "flex flex-col items-center gap-1 px-5 pt-3 pb-2.5 shrink-0 border-b-2 transition-all duration-200",
                      active ? "border-[#3D0A14] text-[#3D0A14]"
                             : done  ? "border-transparent text-[#1A0A0A]/60 cursor-pointer"
                                     : "border-transparent text-[#1A0A0A]/30 cursor-default"
                    )}
                  >
                    <step.Icon size={16} strokeWidth={active ? 2.5 : 2} />
                    <span className="text-[10px] font-bold tracking-wide">{step.label}</span>
                  </button>
                );
              })}
              {/* Summary tab */}
              <button
                className={cn(
                  "flex flex-col items-center gap-1 px-5 pt-3 pb-2.5 shrink-0 border-b-2 transition-all duration-200",
                  custStep === 4 ? "border-[#3D0A14] text-[#3D0A14]" : "border-transparent text-[#1A0A0A]/30 cursor-default"
                )}
              >
                <Check size={16} strokeWidth={custStep === 4 ? 2.5 : 2} />
                <span className="text-[10px] font-bold tracking-wide">Summary</span>
              </button>
            </div>
          </div>

          {/* ── Hero image (steps 0–3 only) ── */}
          {custStep < 4 && (
            <div className="relative w-full h-44 md:h-52 shrink-0">
              <Image
                src={custProduct.image}
                alt={custProduct.name}
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              {/* Step label overlay */}
              <div className="absolute bottom-4 left-5">
                <p className="text-white/65 text-[11px] font-bold uppercase tracking-widest mb-0.5">
                  {custStep + 1} / {STEPS.length}
                </p>
                <p className="text-white font-playfair text-2xl font-bold leading-tight">
                  {STEPS[custStep].label}
                </p>
              </div>
              {/* Close button */}
              <button
                onClick={closeCustomizer}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
          )}

          {/* ── Scrollable step content ── */}
          <div className="flex-1 overflow-y-auto">
            {/* Summary header row */}
            {custStep === 4 && (
              <div className="flex items-center justify-between px-5 pt-5 pb-3 bg-[#C896A0]/97 backdrop-blur-md border-b border-[rgba(26,10,10,0.12)]">
                <div>
                  <p className="text-[10px] font-bold text-[#1A0A0A]/60 uppercase tracking-widest mb-0.5">Review your order</p>
                  <h2 className="font-playfair text-lg font-bold text-[#1A0A0A] leading-tight">{custProduct.name}</h2>
                </div>
                <button
                  onClick={closeCustomizer}
                  className="p-1.5 rounded-full text-[#1A0A0A]/60 hover:text-[#1A0A0A] transition-colors"
                  aria-label="Close"
                >
                  <X size={20} />
                </button>
              </div>
            )}
            <div className="max-w-lg mx-auto px-4 py-5 pb-32">
              {renderStep()}
            </div>
          </div>

          {/* ── Fixed bottom button ── */}
          <div className="fixed bottom-0 left-0 right-0 z-50 bg-[#C896A0]/97 backdrop-blur-md border-t border-[rgba(26,10,10,0.12)] px-4 py-4">
            {custStep < 4 ? (
              <div className="max-w-lg mx-auto flex gap-3">
                <button
                  onClick={handleBack}
                  className="flex-1 bg-white/70 hover:bg-white text-[#3D0A14] font-bold py-4 rounded-2xl text-sm transition-all duration-200 active:scale-[0.97]"
                >
                  {custStep === 0 ? "Cancel" : "← Back"}
                </button>
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={cn(
                    "flex-[2] font-bold py-4 rounded-2xl text-sm font-playfair tracking-wide transition-all duration-200",
                    canProceed()
                      ? "bg-[#3D0A14] hover:bg-[#2D0810] text-white shadow-warm-sm active:scale-[0.97]"
                      : "bg-[#3D0A14]/30 text-white/50 cursor-not-allowed"
                  )}
                >
                  {custStep === STEP_LABELS.length - 1 ? "Review Order →" : "Next →"}
                </button>
              </div>
            ) : (
              <div className="max-w-lg mx-auto">
                <button
                  onClick={handleAddToCart}
                  className="w-full bg-[#3D0A14] hover:bg-[#2D0810] text-white font-bold py-4 rounded-2xl font-playfair text-base tracking-wide transition-all duration-300 shadow-warm-sm active:scale-[0.97]"
                >
                  Add to Cart
                </button>
              </div>
            )}
          </div>

        </div>
      )}

    </main>
  );
}
