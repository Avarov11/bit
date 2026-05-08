"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import ProductsTable from "./ProductsTable";
import type { Product } from "@/lib/types";

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");

  const load = useCallback(() => {
    setLoading(true);
    fetch("/api/products")
      .then((r) => r.json())
      .then((data) => {
        if (data.error) setError(data.error);
        else setProducts(data);
      })
      .catch(() => setError("Failed to load products"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/dashboard/products/new"
          className="bg-brand-700 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-brand-900 transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {loading && <p className="text-gray-400 text-sm">Loading products…</p>}
      {error   && <p className="text-red-500 text-sm">{error}</p>}
      {!loading && !error && <ProductsTable products={products} onRefresh={load} />}
    </div>
  );
}
