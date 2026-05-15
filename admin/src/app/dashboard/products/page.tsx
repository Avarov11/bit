"use client";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProductsTable from "./ProductsTable";
import type { Product } from "@/lib/types";

function Skeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
          <div className="aspect-square bg-gray-100" />
          <div className="p-4 space-y-3">
            <div className="h-4 w-3/4 bg-gray-100 rounded" />
            <div className="h-3 w-1/2 bg-gray-100 rounded" />
            <div className="flex gap-1.5">
              <div className="h-5 w-20 bg-gray-100 rounded-full" />
              <div className="h-5 w-16 bg-gray-100 rounded-full" />
            </div>
            <div className="flex items-center justify-between pt-1">
              <div className="h-5 w-16 bg-gray-100 rounded" />
              <div className="h-6 w-11 bg-gray-100 rounded-full" />
            </div>
            <div className="h-px bg-gray-50 mt-1" />
            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-gray-100 rounded-xl" />
              <div className="h-8 flex-1 bg-gray-100 rounded-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [error,    setError]    = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/products")
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else { setProducts(data); setError(""); }
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          {!loading && !error && (
            <p className="text-xs text-gray-400 mt-0.5">{products.length} products in catalogue</p>
          )}
        </div>
        <Link
          href="/dashboard/products/new"
          className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #FF6B9D, #3d0a14)" }}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          Add Product
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4">
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {loading ? <Skeleton /> : <ProductsTable products={products} onRefresh={load} />}
    </div>
  );
}
