import { createClient } from "@supabase/supabase-js";
import Link from "next/link";
import ProductContent from "./ProductContent";
import type { DbProduct } from "@/lib/types";

export const revalidate = 60;

async function getProduct(id: string): Promise<DbProduct | null> {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("id", id)
    .eq("is_active", true)
    .single();

  if (error || !data) return null;
  return data as DbProduct;
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getProduct(params.id);

  if (!product) {
    return (
      <main className="min-h-screen pt-20 flex flex-col items-center justify-center px-4 text-center" style={{ backgroundColor: "#E2D4E0" }}>
        <p className="font-playfair text-2xl font-bold text-[#1E2235] mb-3">Product not found</p>
        <Link href="/menu" className="text-[#4C5372] font-semibold hover:underline">Back to Menu</Link>
      </main>
    );
  }

  return <ProductContent product={product} />;
}
