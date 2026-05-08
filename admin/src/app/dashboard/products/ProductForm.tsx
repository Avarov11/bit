"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Product } from "@/lib/types";

type FormData = Omit<Product, "id" | "created_at" | "updated_at">;

const CATEGORIES = ["Customized", "Accessories", "Boxes"] as const;
const SUBCATEGORIES: Record<string, string[]> = {
  Customized:  ["Birthday", "Congrats", "Graduation", "Get Well Soon", "Bride to Be", "Gender Reveal"],
  Accessories: ["Candles", "Balloons"],
  Boxes:       [],
};
const TAGS = ["Bestseller", "Signature", "New", "Custom"] as const;

const EMPTY: FormData = {
  name: "", name_ar: "", description: "", description_ar: "",
  category: "Customized", subcategory: null,
  price: 0, image_url: "", tag: null,
  is_customizable: false, is_active: true, sort_order: 0,
};

export default function ProductForm({ product }: { product?: Product }) {
  const router  = useRouter();
  const isEdit  = !!product;
  const [form, setForm]     = useState<FormData>(product ? { ...product } : EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError]   = useState("");

  function set(field: keyof FormData, value: unknown) {
    setForm(f => ({ ...f, [field]: value }));
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

  const subs = SUBCATEGORIES[form.category] ?? [];

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
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Subcategory">
          <select value={form.subcategory ?? ""}
            onChange={e => set("subcategory", e.target.value || null)}
            className="input" disabled={subs.length === 0}>
            <option value="">— None —</option>
            {subs.map(s => <option key={s}>{s}</option>)}
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

      <Field label="Image URL">
        <input type="url" value={form.image_url ?? ""}
          onChange={e => set("image_url", e.target.value)} className="input" />
      </Field>

      <div className="flex gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.is_active}
            onChange={e => set("is_active", e.target.checked)} />
          Active (visible on site)
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
          <input type="checkbox" checked={form.is_customizable}
            onChange={e => set("is_customizable", e.target.checked)} />
          Customizable
        </label>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <div className="flex gap-3 pt-2">
        <button type="submit" disabled={saving}
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
