"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

type FormData = Omit<Product, "id" | "created_at" | "updated_at">;

interface CatData { name: string; parent: string | null; filter_mode: string; }
const TAGS = ["Bestseller", "Signature", "New", "Custom"] as const;

const ALL_SHAPES = [
  { id: "cake",   label: "Full Cake",       icon: "🎂" },
  { id: "heart",  label: "Heart",           icon: "❤️" },
  { id: "square", label: "Square",          icon: "🟫" },
];

const ALL_FLAVORS = [
  { id: "chocolate", label: "Chocolate",       icon: "🍫" },
  { id: "white",     label: "White Chocolate", icon: "🤍" },
];

const ALL_TOPPINGS = [
  { id: "write",   label: "Writing",      icon: "✍️" },
  { id: "sticker", label: "Sticker",      icon: "🎨" },
  { id: "image",   label: "Image Upload", icon: "📷" },
];

const EMPTY: FormData = {
  name: "", name_ar: "", description: "", description_ar: "",
  category: "Customized", subcategory: null,
  price: 0, image_url: "", tag: null,
  is_customizable: false, is_active: true, sort_order: 0,
  allowed_shapes:   ["cake", "heart", "square"],
  allowed_flavors:  ["chocolate", "white"],
  allowed_toppings: ["write", "sticker", "image"],
};

export default function ProductForm({ product }: { product?: Product }) {
  const router  = useRouter();
  const isEdit  = !!product;
  const [form, setForm]         = useState<FormData>(product ? {
    ...product,
    allowed_shapes:   product.allowed_shapes   ?? ["cake", "heart", "square"],
    allowed_flavors:  product.allowed_flavors  ?? ["chocolate", "white"],
    allowed_toppings: product.allowed_toppings ?? ["write", "sticker", "image"],
  } : EMPTY);
  const [saving, setSaving]     = useState(false);
  const [error, setError]       = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [allCats, setAllCats] = useState<CatData[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/categories", { cache: "no-store" })
      .then(r => r.json())
      .then((data: CatData[]) => { if (Array.isArray(data)) setAllCats(data); })
      .catch(() => {});
  }, []);

  // Categories that go into products.category (all except as_subcategory children)
  const categoryOptions = allCats
    .filter(c => c.filter_mode !== "as_subcategory")
    .map(c => c.name);

  // Subcategories for the selected category (children stored in products.subcategory)
  const subcategoryOptions = allCats
    .filter(c => c.parent === form.category && c.filter_mode === "as_subcategory")
    .map(c => c.name);

  function set(field: keyof FormData, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
  }

  async function handleImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadError("");
    setUploading(true);

    const body = new FormData();
    body.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body });
    const data = await res.json();

    setUploading(false);

    if (!res.ok) {
      setUploadError(data.error ?? "Upload failed");
    } else {
      set("image_url", data.url);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const res = await fetch("/api/products", {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isEdit ? { ...form, id: product!.id } : form),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Something went wrong");
      setSaving(false);
    } else {
      router.push("/dashboard/products");
      router.refresh();
    }
  }

  const preview = form.image_url;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 md:p-6 max-w-2xl space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Name (EN)">
          <input required value={form.name} onChange={e => set("name", e.target.value)}
            className="input" />
        </Field>
        <Field label="Name (AR)">
          <input value={form.name_ar ?? ""} onChange={e => set("name_ar", e.target.value)}
            dir="rtl" className="input" />
        </Field>
      </div>

      <Field label="Description (EN)">
        <textarea value={form.description ?? ""} onChange={e => set("description", e.target.value)}
          rows={2} className="input" />
      </Field>
      <Field label="Description (AR)">
        <textarea value={form.description_ar ?? ""} onChange={e => set("description_ar", e.target.value)}
          rows={2} dir="rtl" className="input" />
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Category">
          <select value={form.category}
            onChange={e => { set("category", e.target.value); set("subcategory", null); }}
            className="input">
            {categoryOptions.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategory">
          <select value={form.subcategory ?? ""}
            onChange={e => set("subcategory", e.target.value || null)}
            className="input" disabled={subcategoryOptions.length === 0}>
            <option value="">— None —</option>
            {subcategoryOptions.map(s => <option key={s}>{s}</option>)}
          </select>
        </Field>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <Field label="Price (QAR)">
          <input type="number" min={0} step={0.01} required
            value={form.price} onChange={e => set("price", parseFloat(e.target.value))}
            className="input" />
        </Field>
        <Field label="Tag">
          <select value={form.tag ?? ""} onChange={e => set("tag", e.target.value || null)} className="input">
            <option value="">— None —</option>
            {TAGS.map(t => <option key={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Sort Order">
          <input type="number" min={0} value={form.sort_order}
            onChange={e => set("sort_order", parseInt(e.target.value))} className="input" />
        </Field>
      </div>

      {/* Image upload */}
      <Field label="Product Image">
        <div className="space-y-3">

          {/* Preview */}
          {preview ? (
            <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 bg-gray-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={preview}
                alt="Product preview"
                className="w-full h-full object-contain"
              />
              <button
                type="button"
                onClick={() => { set("image_url", ""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                className="absolute top-2 right-2 bg-white border border-gray-200 text-gray-500 hover:text-red-500 rounded-full w-7 h-7 flex items-center justify-center text-sm shadow-sm transition-colors"
                title="Remove image"
              >
                ✕
              </button>
            </div>
          ) : (
            /* Upload zone */
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full h-40 border-2 border-dashed border-gray-200 rounded-lg flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed bg-gray-50"
            >
              {uploading ? (
                <>
                  <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm">Uploading…</span>
                </>
              ) : (
                <>
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M4 16l4-4m0 0l4 4m-4-4v9M20 16l-4-4m0 0l-4 4m4-4V3" />
                  </svg>
                  <span className="text-sm font-medium">Click to upload image</span>
                  <span className="text-xs">JPG, PNG, WEBP — max 10 MB</span>
                </>
              )}
            </button>
          )}

          {/* Change button when preview exists */}
          {preview && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="inline-flex items-center gap-2 text-sm text-brand-700 hover:text-brand-900 font-medium disabled:opacity-50 transition-colors"
            >
              {uploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                  Uploading…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Change image
                </>
              )}
            </button>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="hidden"
            onChange={handleImageChange}
          />

          {uploadError && <p className="text-red-500 text-xs">{uploadError}</p>}
        </div>
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.is_active}
            onChange={e => set("is_active", e.target.checked)} />
          Active (visible on site)
        </label>
      </div>

      {/* Shape selection */}
      <Field label="Available Shapes">
        <p className="text-xs text-gray-400 mb-3">Choose which shapes customers can pick for this product.</p>
        <div className="grid grid-cols-3 gap-3">
          {ALL_SHAPES.map(({ id, label, icon }) => {
            const checked = (form.allowed_shapes ?? []).includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const next = checked
                    ? (form.allowed_shapes ?? []).filter(s => s !== id)
                    : [...(form.allowed_shapes ?? []), id];
                  set("allowed_shapes", next);
                }}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-3 transition-all duration-150 cursor-pointer ${
                  checked
                    ? "border-[#800020] bg-[#800020]/5"
                    : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                {/* Checkmark */}
                {checked && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#800020] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className="text-2xl">{icon}</span>
                <span className={`text-xs font-semibold ${checked ? "text-[#800020]" : "text-gray-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
        {(form.allowed_shapes ?? []).length === 0 && (
          <p className="text-xs text-red-500 mt-2">Select at least one shape.</p>
        )}
      </Field>

      {/* Flavor selection */}
      <Field label="Available Flavors">
        <p className="text-xs text-gray-400 mb-3">Choose which flavors customers can pick.</p>
        <div className="grid grid-cols-2 gap-3">
          {ALL_FLAVORS.map(({ id, label, icon }) => {
            const checked = (form.allowed_flavors ?? []).includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const next = checked
                    ? (form.allowed_flavors ?? []).filter(f => f !== id)
                    : [...(form.allowed_flavors ?? []), id];
                  set("allowed_flavors", next);
                }}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-3 transition-all duration-150 cursor-pointer ${
                  checked ? "border-[#800020] bg-[#800020]/5" : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                {checked && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#800020] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className="text-2xl">{icon}</span>
                <span className={`text-xs font-semibold ${checked ? "text-[#800020]" : "text-gray-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
        {(form.allowed_flavors ?? []).length === 0 && (
          <p className="text-xs text-red-500 mt-2">Select at least one flavor.</p>
        )}
      </Field>

      {/* Topping selection */}
      <Field label="Available Toppings">
        <p className="text-xs text-gray-400 mb-3">Choose which topping options customers can add.</p>
        <div className="grid grid-cols-3 gap-3">
          {ALL_TOPPINGS.map(({ id, label, icon }) => {
            const checked = (form.allowed_toppings ?? []).includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  const next = checked
                    ? (form.allowed_toppings ?? []).filter(t => t !== id)
                    : [...(form.allowed_toppings ?? []), id];
                  set("allowed_toppings", next);
                }}
                className={`relative flex flex-col items-center gap-2 rounded-xl border-2 py-4 px-3 transition-all duration-150 cursor-pointer ${
                  checked ? "border-[#800020] bg-[#800020]/5" : "border-gray-200 bg-gray-50 opacity-50"
                }`}
              >
                {checked && (
                  <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-[#800020] flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                )}
                <span className="text-2xl">{icon}</span>
                <span className={`text-xs font-semibold ${checked ? "text-[#800020]" : "text-gray-400"}`}>{label}</span>
              </button>
            );
          })}
        </div>
      </Field>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving || uploading}
          className="bg-brand-700 text-white text-sm font-medium px-5 py-2 rounded-lg hover:bg-brand-900 disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
        </button>
        <button type="button" onClick={() => router.back()}
          className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2 rounded-lg border border-gray-200 transition-colors">
          Cancel
        </button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      {children}
    </div>
  );
}
