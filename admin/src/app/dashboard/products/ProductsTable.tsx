"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import type { Product } from "@/lib/types";

// ─── Constants ────────────────────────────────────────────────────────────────

type Category = Product["category"];
const CATEGORIES: (Category | "all")[] = ["all", "Customized", "Accessories", "Boxes"];

const TAG_META: Record<NonNullable<Product["tag"]>, { label: string; cls: string }> = {
  Bestseller: { label: "★ Bestseller", cls: "bg-amber-400 text-white"    },
  Signature:  { label: "✦ Signature",  cls: "bg-violet-500 text-white"   },
  New:        { label: "✦ New",        cls: "bg-emerald-500 text-white"  },
  Custom:     { label: "✦ Custom",     cls: "bg-pink-500 text-white"     },
};

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      title={active ? "Active — click to hide" : "Hidden — click to activate"}
      className={`w-11 h-6 rounded-full transition-colors duration-200 relative shrink-0 ${
        active ? "bg-emerald-400" : "bg-gray-200"
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${
          active ? "translate-x-5" : "translate-x-0"
        }`}
      />
    </button>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────

function ProductCard({ product: p, onToggle, onDelete }: {
  product: Product;
  onToggle: () => void;
  onDelete: () => void;
}) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 flex flex-col ${
      p.is_active ? "border-gray-100" : "border-gray-100 opacity-75"
    }`}>
      {/* Image area */}
      <div className="relative aspect-square overflow-hidden bg-gray-50 shrink-0">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        )}

        {/* Tag overlay — top left */}
        {p.tag && (
          <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg text-[10px] font-bold tracking-wide shadow-sm ${TAG_META[p.tag].cls}`}>
            {TAG_META[p.tag].label}
          </span>
        )}

        {/* Status overlay — top right */}
        <span className={`absolute top-2.5 right-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold shadow-sm ${
          p.is_active ? "bg-emerald-500/90 text-white" : "bg-gray-800/60 text-white"
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? "bg-white animate-pulse" : "bg-gray-400"}`} />
          {p.is_active ? "Live" : "Hidden"}
        </span>
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col flex-1">
        {/* Name */}
        <div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">{p.name}</h3>
          {p.name_ar && (
            <p className="text-gray-400 text-xs mt-0.5 truncate" dir="rtl">{p.name_ar}</p>
          )}
        </div>

        {/* Category chips */}
        <div className="flex flex-wrap gap-1.5 mt-2.5">
          <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
            {p.category}
          </span>
          {p.subcategory && (
            <span className="text-[11px] text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full font-medium">
              {p.subcategory}
            </span>
          )}
          {p.is_customizable && (
            <span className="text-[11px] text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full font-medium">
              Customizable
            </span>
          )}
        </div>

        {/* Price + toggle */}
        <div className="flex items-center justify-between mt-auto pt-3">
          <p className="font-bold text-gray-900 text-base">
            {p.price}{" "}
            <span className="text-xs font-medium text-gray-400">QAR</span>
          </p>
          <Toggle active={p.is_active} onToggle={onToggle} />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-3 pt-3 border-t border-gray-50">
          <Link
            href={`/dashboard/products/${p.id}`}
            className="flex-1 text-center text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-2 rounded-xl transition-colors"
          >
            Edit
          </Link>
          <button
            onClick={onDelete}
            className="flex-1 text-center text-xs font-semibold text-red-500 bg-red-50 hover:bg-red-100 px-3 py-2 rounded-xl transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function ProductsTable({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  const [search,          setSearch]          = useState("");
  const [activeCategory,  setActiveCategory]  = useState<Category | "all">("all");

  async function toggleActive(id: string, current: boolean) {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    onRefresh();
  }

  async function deleteProduct(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    await fetch("/api/products", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    onRefresh();
  }

  const categoryCounts = useMemo(() => {
    const counts: Partial<Record<Category | "all", number>> = { all: products.length };
    for (const c of CATEGORIES.slice(1) as Category[]) {
      counts[c] = products.filter(p => p.category === c).length;
    }
    return counts;
  }, [products]);

  const filtered = useMemo(() => {
    let res = products;
    if (activeCategory !== "all") res = res.filter(p => p.category === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      res = res.filter(p =>
        p.name.toLowerCase().includes(q) ||
        (p.name_ar ?? "").toLowerCase().includes(q) ||
        (p.subcategory ?? "").toLowerCase().includes(q)
      );
    }
    return res;
  }, [products, activeCategory, search]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 flex-wrap">
        {CATEGORIES.map(cat => {
          const count  = categoryCounts[cat] ?? 0;
          const active = activeCategory === cat;
          return (
            <button key={cat} onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all capitalize ${
                active
                  ? "bg-brand-700 text-white shadow-sm"
                  : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-700"
              }`}
            >
              {cat === "all" ? "All" : cat}
              <span className="ml-1 opacity-60">{count}</span>
            </button>
          );
        })}

        {/* Active / hidden summary */}
        <div className="ml-auto flex items-center gap-3 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
            {products.filter(p => p.is_active).length} live
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-gray-300 inline-block" />
            {products.filter(p => !p.is_active).length} hidden
          </span>
        </div>
      </div>

      {/* Result hint */}
      {(search || activeCategory !== "all") && filtered.length > 0 && (
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-gray-600">{filtered.length}</span> of {products.length} products
        </p>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7H4a2 2 0 00-2 2v6a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
          </div>
          <p className="text-gray-500 font-medium text-sm">No products found</p>
          <p className="text-gray-400 text-xs mt-1">Try adjusting your search or filter</p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filtered.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            onToggle={() => toggleActive(p.id, p.is_active)}
            onDelete={() => deleteProduct(p.id, p.name)}
          />
        ))}
      </div>
    </div>
  );
}
