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
import { useLanguage } from "@/context/LanguageContext";
import { cn } from "@/lib/utils";

// ─── Data ─────────────────────────────────────────────────────────────────────

const shapes = [
  {
    id: "mini",
    nameKey: "shape_name_mini",
    servingKey: "shape_serving_mini",
    weight: "6 pcs",
    dimensions: "4×4 box",
    price: 55,
    image: "https://images.unsplash.com/photo-1589375462213-0f5a6a76c2c8?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "small-standard",
    nameKey: "shape_name_small_standard",
    servingKey: "shape_serving_small_standard",
    weight: "9 pcs",
    dimensions: "6×4 box",
    price: 75,
    image: "https://images.unsplash.com/photo-1515037893149-de7f840978e2?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "small-heart",
    nameKey: "shape_name_small_heart",
    servingKey: "shape_serving_small_heart",
    weight: "9 pcs",
    dimensions: "Heart-shaped",
    price: 85,
    image: "https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "standard",
    nameKey: "shape_name_standard",
    servingKey: "shape_serving_standard",
    weight: "16 pcs",
    dimensions: "8×6 box",
    price: 110,
    image: "https://images.unsplash.com/photo-1564355808539-22fda35bed7e?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "large-box",
    nameKey: "shape_name_large_box",
    servingKey: "shape_serving_large_box",
    weight: "24 pcs",
    dimensions: "10×8 box",
    price: 150,
    image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=400&fit=crop&q=80",
  },
  {
    id: "party-tray",
    nameKey: "shape_name_party_tray",
    servingKey: "shape_serving_party_tray",
    weight: "36 pcs",
    dimensions: "Full tray",
    price: 210,
    image: "https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&h=400&fit=crop&q=80",
  },
];

const flavors = [
  { id: "vanilla",    nameKey: "flavor_name_vanilla",    descKey: "flavor_desc_vanilla",    emoji: "🤍", addOn: 0  },
  { id: "red-velvet", nameKey: "flavor_name_red_velvet", descKey: "flavor_desc_red_velvet", emoji: "❤️", addOn: 15 },
  { id: "chocolate",  nameKey: "flavor_name_chocolate",  descKey: "flavor_desc_chocolate",  emoji: "🍫", addOn: 10 },
  { id: "pistachio",  nameKey: "flavor_name_pistachio",  descKey: "flavor_desc_pistachio",  emoji: "💚", addOn: 20 },
  { id: "lemon",      nameKey: "flavor_name_lemon",      descKey: "flavor_desc_lemon",      emoji: "🍋", addOn: 10 },
  { id: "caramel",    nameKey: "flavor_name_caramel",    descKey: "flavor_desc_caramel",    emoji: "🧡", addOn: 15 },
  { id: "strawberry", nameKey: "flavor_name_strawberry", descKey: "flavor_desc_strawberry", emoji: "🍓", addOn: 12 },
  { id: "matcha",     nameKey: "flavor_name_matcha",     descKey: "flavor_desc_matcha",     emoji: "🍵", addOn: 18 },
];

const colors = [
  { id: "white",      nameKey: "color_name_white",      hex: "#FFFFFF" },
  { id: "ivory",      nameKey: "color_name_ivory",      hex: "#FFF8E7" },
  { id: "cream",      nameKey: "color_name_cream",      hex: "#FDF0D5" },
  { id: "blush",      nameKey: "color_name_blush",      hex: "#FFB5C8" },
  { id: "rose-gold",  nameKey: "color_name_rose_gold",  hex: "#E8A598" },
  { id: "peach",      nameKey: "color_name_peach",      hex: "#FFCBA4" },
  { id: "lavender",   nameKey: "color_name_lavender",   hex: "#C8B2D8" },
  { id: "sage",       nameKey: "color_name_sage",       hex: "#B2D8C3" },
  { id: "mint",       nameKey: "color_name_mint",       hex: "#B2D8D0" },
  { id: "dusty-blue", nameKey: "color_name_dusty_blue", hex: "#B2C8D8" },
  { id: "burgundy",   nameKey: "color_name_burgundy",   hex: "#800020" },
  { id: "charcoal",   nameKey: "color_name_charcoal",   hex: "#4A4A4A" },
];

type ToppingCategory = "All" | "Fruits" | "Flowers" | "Chocolate" | "Sprinkles" | "Nuts";

const toppingCatKeyMap: Record<ToppingCategory, string> = {
  All: "topping_cat_all",
  Fruits: "topping_cat_fruits",
  Flowers: "topping_cat_flowers",
  Chocolate: "topping_cat_chocolate",
  Sprinkles: "topping_cat_sprinkles",
  Nuts: "topping_cat_nuts",
};

const toppings: {
  id: string;
  nameKey: string;
  category: Exclude<ToppingCategory, "All">;
  price: number;
  emoji: string;
}[] = [
  { id: "strawberry",        nameKey: "topping_name_strawberry",        category: "Fruits",     price: 8,  emoji: "🍓" },
  { id: "blueberry",         nameKey: "topping_name_blueberry",         category: "Fruits",     price: 6,  emoji: "🫐" },
  { id: "raspberry",         nameKey: "topping_name_raspberry",         category: "Fruits",     price: 10, emoji: "🍒" },
  { id: "fig",               nameKey: "topping_name_fig",               category: "Fruits",     price: 12, emoji: "🍈" },
  { id: "edible-roses",      nameKey: "topping_name_edible_roses",      category: "Flowers",    price: 12, emoji: "🌹" },
  { id: "lavender",          nameKey: "topping_name_lavender",          category: "Flowers",    price: 8,  emoji: "💜" },
  { id: "babys-breath",      nameKey: "topping_name_babys_breath",      category: "Flowers",    price: 6,  emoji: "🌸" },
  { id: "jasmine",           nameKey: "topping_name_jasmine",           category: "Flowers",    price: 10, emoji: "🌼" },
  { id: "choc-drizzle",      nameKey: "topping_name_choc_drizzle",      category: "Chocolate",  price: 5,  emoji: "🍫" },
  { id: "choc-shards",       nameKey: "topping_name_choc_shards",       category: "Chocolate",  price: 8,  emoji: "🔪" },
  { id: "cocoa-dust",        nameKey: "topping_name_cocoa_dust",        category: "Chocolate",  price: 3,  emoji: "✨" },
  { id: "gold-leaf",         nameKey: "topping_name_gold_leaf",         category: "Chocolate",  price: 15, emoji: "🥇" },
  { id: "rainbow-sprinkles", nameKey: "topping_name_rainbow_sprinkles", category: "Sprinkles",  price: 4,  emoji: "🌈" },
  { id: "gold-sprinkles",    nameKey: "topping_name_gold_sprinkles",    category: "Sprinkles",  price: 6,  emoji: "⭐" },
  { id: "pearl-sprinkles",   nameKey: "topping_name_pearl_sprinkles",   category: "Sprinkles",  price: 5,  emoji: "⚪" },
  { id: "pistachio",         nameKey: "topping_name_pistachio",         category: "Nuts",       price: 7,  emoji: "💚" },
  { id: "almond",            nameKey: "topping_name_almond",            category: "Nuts",       price: 6,  emoji: "🌰" },
  { id: "walnut",            nameKey: "topping_name_walnut",            category: "Nuts",       price: 5,  emoji: "🟤" },
];

const fontStyles = [
  { id: "serif",       nameKey: "font_name_serif",       preview: "Happy Birthday", family: "Georgia, serif" },
  { id: "script",      nameKey: "font_name_script",      preview: "Happy Birthday", family: "Brush Script MT, cursive" },
  { id: "bold",        nameKey: "font_name_bold",        preview: "Happy Birthday", family: "Impact, sans-serif" },
  { id: "handwritten", nameKey: "font_name_handwritten", preview: "Happy Birthday", family: "Segoe Script, cursive" },
];

const placementKeys = [
  "placement_center_top",
  "placement_center_middle",
  "placement_center_bottom",
  "placement_border_frame",
];

// ─── Steps ────────────────────────────────────────────────────────────────────

const steps = [
  { id: "shape",    labelKey: "customize_step_shape",    Icon: Layers      },
  { id: "flavor",   labelKey: "customize_step_flavor",   Icon: ChefHat     },
  { id: "color",    labelKey: "customize_step_color",    Icon: Palette     },
  { id: "toppings", labelKey: "customize_step_toppings", Icon: Sparkles    },
  { id: "write",    labelKey: "customize_step_write",    Icon: PenLine     },
];

interface Selections {
  shapeId: string;
  flavorId: string;
  colorId: string;
  toppingIds: string[];
  message: string;
  fontStyleId: string;
  placementKey: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomizePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { t } = useLanguage();
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
    placementKey: "placement_center_middle",
  });

  const [toppingSearch, setToppingSearch] = useState("");
  const [toppingCat, setToppingCat] = useState<ToppingCategory>("All");

  const totalPrice = useMemo(() => {
    const base = shapes.find((s) => s.id === sel.shapeId)?.price ?? product.price;
    const flavor = flavors.find((f) => f.id === sel.flavorId)?.addOn ?? 0;
    const tops = toppings
      .filter((tp) => sel.toppingIds.includes(tp.id))
      .reduce((sum, tp) => sum + tp.price, 0);
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
          shape: shapes.find((s) => s.id === sel.shapeId)?.nameKey
            ? t(shapes.find((s) => s.id === sel.shapeId)!.nameKey)
            : undefined,
          flavor: flavors.find((f) => f.id === sel.flavorId)?.nameKey
            ? t(flavors.find((f) => f.id === sel.flavorId)!.nameKey)
            : undefined,
          color: colors.find((c) => c.id === sel.colorId)?.nameKey
            ? t(colors.find((c) => c.id === sel.colorId)!.nameKey)
            : undefined,
          toppings: toppings
            .filter((tp) => sel.toppingIds.includes(tp.id))
            .map((tp) => t(tp.nameKey)),
          message: sel.message || undefined,
          fontStyle: fontStyles.find((f) => f.id === sel.fontStyleId)?.nameKey
            ? t(fontStyles.find((f) => f.id === sel.fontStyleId)!.nameKey)
            : undefined,
          placement: sel.placementKey ? t(sel.placementKey) : undefined,
        },
      });
      router.push("/cart");
    }
  };

  const toggleTopping = (id: string) => {
    setSel((prev) => ({
      ...prev,
      toppingIds: prev.toppingIds.includes(id)
        ? prev.toppingIds.filter((tp) => tp !== id)
        : [...prev.toppingIds, id],
    }));
  };

  const filteredToppings = toppings.filter((tp) => {
    const matchCat = toppingCat === "All" || tp.category === toppingCat;
    const toppingName = t(tp.nameKey).toLowerCase();
    const matchSearch = toppingName.includes(toppingSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const toppingCategories: ToppingCategory[] = [
    "All", "Fruits", "Flowers", "Chocolate", "Sprinkles", "Nuts",
  ];

  // ─── Step content renderers ─────────────────────────────────────────────────

  const ShapeStep = () => (
    <div>
      <h2 data-i18n="customize_shape_title" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">
        {t("customize_shape_title")}
      </h2>
      <p data-i18n="customize_shape_subtitle" className="text-[#9E7B7B] text-sm mb-5">
        {t("customize_shape_subtitle")}
      </p>
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
                <CheckCircle2 size={18} className="absolute top-2.5 right-2.5 text-[#3D0A14] fill-[#F5E4E6]" />
              )}
              <div className="relative aspect-square rounded-xl overflow-hidden bg-[#F5E4E6] mb-3">
                <Image src={shape.image} alt={t(shape.nameKey)} fill sizes="(max-width: 768px) 45vw, 200px" className="object-cover" />
              </div>
              <h3 data-i18n={shape.nameKey} className="font-semibold text-[#1A0A0A] text-sm mb-0.5">
                {t(shape.nameKey)}
              </h3>
              <p data-i18n={shape.servingKey} className="text-[#9E7B7B] text-[11px] mb-0.5">
                {t(shape.servingKey)}
              </p>
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
      <h2 data-i18n="customize_flavor_title" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">
        {t("customize_flavor_title")}
      </h2>
      <p data-i18n="customize_flavor_subtitle" className="text-[#9E7B7B] text-sm mb-5">
        {t("customize_flavor_subtitle")}
      </p>
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
                <CheckCircle2 size={16} className="absolute top-3 right-3 text-[#3D0A14] fill-[#F5E4E6]" />
              )}
              <span className="text-2xl mb-2 block">{flavor.emoji}</span>
              <h3 data-i18n={flavor.nameKey} className="font-semibold text-[#1A0A0A] text-sm mb-1">
                {t(flavor.nameKey)}
              </h3>
              <p data-i18n={flavor.descKey} className="text-[#9E7B7B] text-[11px] mb-2 leading-snug">
                {t(flavor.descKey)}
              </p>
              <span className={cn("text-xs font-bold", flavor.addOn > 0 ? "text-[#3D0A14]" : "text-[#9E7B7B]")}>
                {flavor.addOn > 0 ? `+${flavor.addOn} QAR` : t("customize_flavor_included")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ColorStep = () => (
    <div>
      <h2 data-i18n="customize_color_title" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">
        {t("customize_color_title")}
      </h2>
      <p data-i18n="customize_color_subtitle" className="text-[#9E7B7B] text-sm mb-5">
        {t("customize_color_subtitle")}
      </p>
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
              <span data-i18n={color.nameKey} className="text-[10px] text-[#4A3728] font-medium text-center leading-tight">
                {t(color.nameKey)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );

  const ToppingsStep = () => (
    <div>
      <h2 data-i18n="customize_toppings_title" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">
        {t("customize_toppings_title")}
      </h2>
      <p data-i18n="customize_toppings_subtitle" className="text-[#9E7B7B] text-sm mb-4">
        {t("customize_toppings_subtitle")}
      </p>

      <div className="relative mb-3">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9E7B7B]" />
        <input
          type="text"
          value={toppingSearch}
          onChange={(e) => setToppingSearch(e.target.value)}
          data-i18n="customize_toppings_search_placeholder"
          placeholder={t("customize_toppings_search_placeholder")}
          className="w-full pl-9 pr-4 py-2.5 bg-white border border-[rgba(26,10,10,0.08)] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none focus:border-[#3D0A14] transition-colors"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {toppingCategories.map((cat) => (
          <button
            key={cat}
            onClick={() => setToppingCat(cat)}
            data-i18n={toppingCatKeyMap[cat]}
            className={cn(
              "shrink-0 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide transition-all duration-200 active:scale-[0.97]",
              toppingCat === cat
                ? "bg-[#3D0A14] text-white shadow-warm-sm"
                : "bg-white text-[#4A3728] hover:bg-[#F5E4E6] border border-[rgba(26,10,10,0.07)]"
            )}
          >
            {t(toppingCatKeyMap[cat])}
          </button>
        ))}
      </div>

      {sel.toppingIds.length > 0 && (
        <div className="mb-4 p-3 bg-[#F5E4E6] border border-[#3D0A14]/20 rounded-xl">
          <p className="text-xs font-semibold text-[#3D0A14]">
            {sel.toppingIds.length} {sel.toppingIds.length > 1 ? "toppings" : "topping"} selected
            {" "}·{" "}
            +{toppings
              .filter((tp) => sel.toppingIds.includes(tp.id))
              .reduce((s, tp) => s + tp.price, 0)}{" "}
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
              <p data-i18n={topping.nameKey} className="text-[10px] font-semibold text-[#1A0A0A] leading-tight mb-0.5">
                {t(topping.nameKey)}
              </p>
              <p className={cn("text-[10px] font-bold", selected ? "text-[#3D0A14]" : "text-[#9E7B7B]")}>
                +{topping.price} QAR
              </p>
            </button>
          );
        })}

        {filteredToppings.length === 0 && (
          <div data-i18n="customize_toppings_no_results" className="col-span-3 text-center py-8 text-[#9E7B7B] text-sm">
            {t("customize_toppings_no_results")}
          </div>
        )}
      </div>
    </div>
  );

  const WriteStep = () => (
    <div>
      <h2 data-i18n="customize_write_title" className="font-playfair text-2xl font-bold text-[#1A0A0A] mb-1">
        {t("customize_write_title")}
      </h2>
      <p data-i18n="customize_write_subtitle" className="text-[#9E7B7B] text-sm mb-5">
        {t("customize_write_subtitle")}
      </p>

      <div className="space-y-6">
        <div>
          <label data-i18n="customize_message_label" className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-2">
            {t("customize_message_label")}
          </label>
          <textarea
            value={sel.message}
            onChange={(e) => setSel((p) => ({ ...p, message: e.target.value.slice(0, 50) }))}
            data-i18n="customize_message_placeholder"
            placeholder={t("customize_message_placeholder")}
            rows={3}
            className="w-full px-4 py-3 bg-white border border-[rgba(26,10,10,0.10)] focus:border-[#3D0A14] rounded-xl text-sm text-[#1A0A0A] placeholder:text-[#9E7B7B] outline-none transition-colors resize-none"
          />
          <p className="text-right text-xs text-[#9E7B7B] mt-1">{sel.message.length}/50</p>
        </div>

        <div>
          <label data-i18n="customize_font_style_label" className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-3">
            {t("customize_font_style_label")}
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
                  <p className="text-[#4A3728] text-sm mb-1" style={{ fontFamily: font.family }}>
                    {sel.message.trim() || font.preview}
                  </p>
                  <p data-i18n={font.nameKey} className="text-[10px] text-[#9E7B7B] font-semibold">
                    {t(font.nameKey)}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label data-i18n="customize_placement_label" className="block text-xs font-bold text-[#9E7B7B] uppercase tracking-wider mb-3">
            {t("customize_placement_label")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            {placementKeys.map((key) => {
              const selected = sel.placementKey === key;
              return (
                <button
                  key={key}
                  onClick={() => setSel((prev) => ({ ...prev, placementKey: key }))}
                  data-i18n={key}
                  className={cn(
                    "rounded-xl border-2 py-3 text-center text-xs font-semibold transition-all duration-200 active:scale-[0.97]",
                    selected
                      ? "border-[#3D0A14] bg-[#3D0A14] text-white shadow-warm-sm"
                      : "border-[rgba(26,10,10,0.10)] text-[#4A3728] hover:border-[#3D0A14]/40 bg-white"
                  )}
                >
                  {t(key)}
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
          <p data-i18n="customize_total_label" className="text-[10px] text-[#9E7B7B] uppercase tracking-wider leading-none mb-0.5">
            {t("customize_total_label")}
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
                  data-i18n={s.labelKey}
                  className={cn(
                    "relative z-10 text-[10px] font-bold leading-tight text-center",
                    active ? "text-white" : completed ? "text-[#3D0A14]" : "text-[#9E7B7B]"
                  )}
                >
                  {t(s.labelKey).split(" ").map((w, wi) => (
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
                  <span data-i18n={s.labelKey} className="text-[10px] font-bold">
                    {t(s.labelKey).split(" ")[0]}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Brownie preview image */}
          <div className="relative h-56 md:h-72 bg-[#1A0A0A] overflow-hidden">
            <Image
              src={previewImage}
              data-i18n="customize_preview_alt"
              alt={t("customize_preview_alt")}
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
                {t("customize_step_shape") !== "customize_step_shape"
                  ? `${step + 1} / ${steps.length}`
                  : `Step ${step + 1} of ${steps.length}`}
              </span>
              <h2 data-i18n={steps[step].labelKey} className="font-playfair text-white text-2xl font-bold leading-tight">
                {t(steps[step].labelKey)}
              </h2>
            </div>

            {sel.colorId && (
              <div className="absolute bottom-4 right-4 flex items-center gap-2 bg-[#1A0A0A]/40 backdrop-blur-sm rounded-full px-3 py-1.5">
                <div
                  className="w-3.5 h-3.5 rounded-full border border-white/50"
                  style={{ backgroundColor: colors.find((c) => c.id === sel.colorId)?.hex }}
                />
                <span className="text-white text-xs font-medium">
                  {t(colors.find((c) => c.id === sel.colorId)?.nameKey ?? "")}
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
          <span data-i18n={step === steps.length - 1 ? "customize_confirm" : "customize_next"}>
            {step === steps.length - 1 ? t("customize_confirm") : t("customize_next")}
          </span>
        </button>
      </footer>
    </div>
  );
}
