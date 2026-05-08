"use client";
import Link from "next/link";
import type { Product } from "@/lib/types";

export default function ProductsTable({ products, onRefresh }: { products: Product[]; onRefresh: () => void }) {
  async function toggleActive(id: string, current: boolean) {
    await fetch("/api/products", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, is_active: !current }),
    });
    onRefresh();
  }

  if (products.length === 0) {
    return <p className="text-gray-400 text-sm">No products yet. Add your first one.</p>;
  }

  return (
    <>
      {/* Desktop table */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {["Image","Name","Category","Price","Tag","Active",""].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  {p.image_url
                    ? <img src={p.image_url} alt={p.name} className="w-10 h-10 object-cover rounded-lg" />
                    : <div className="w-10 h-10 bg-gray-100 rounded-lg" />}
                </td>
                <td className="px-4 py-3">
                  <p className="font-medium text-gray-900">{p.name}</p>
                  {p.name_ar && <p className="text-gray-400 text-xs" dir="rtl">{p.name_ar}</p>}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}
                </td>
                <td className="px-4 py-3 font-medium text-gray-900">{p.price} QAR</td>
                <td className="px-4 py-3">
                  {p.tag && (
                    <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      {p.tag}
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <Toggle active={p.is_active} onToggle={() => toggleActive(p.id, p.is_active)} />
                </td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/products/${p.id}`} className="text-xs text-brand-700 hover:underline font-medium">
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {products.map(p => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex gap-3">
            {p.image_url
              ? <img src={p.image_url} alt={p.name} className="w-16 h-16 object-cover rounded-lg shrink-0" />
              : <div className="w-16 h-16 bg-gray-100 rounded-lg shrink-0" />}

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {p.category}{p.subcategory ? ` / ${p.subcategory}` : ""}
                  </p>
                </div>
                <Toggle active={p.is_active} onToggle={() => toggleActive(p.id, p.is_active)} />
              </div>

              <div className="flex items-center gap-2 mt-2">
                <span className="font-semibold text-gray-900 text-sm">{p.price} QAR</span>
                {p.tag && (
                  <span className="bg-brand-100 text-brand-700 text-xs px-2 py-0.5 rounded-full font-medium">
                    {p.tag}
                  </span>
                )}
                <Link href={`/dashboard/products/${p.id}`} className="ml-auto text-xs text-brand-700 hover:underline font-medium">
                  Edit
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

function Toggle({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      className={`w-9 h-5 rounded-full transition-colors shrink-0 ${active ? "bg-green-400" : "bg-gray-200"}`}
    >
      <span className={`block w-4 h-4 bg-white rounded-full shadow transition-transform mx-0.5 ${active ? "translate-x-4" : ""}`} />
    </button>
  );
}
