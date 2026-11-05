import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";
import type { DbProduct } from "@/lib/types";

export const dynamic = "force-dynamic";

function makeSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getSlides() {
  try {
    const { data } = await makeSupabase()
      .from("slideshow")
      .select("id, desktop_url, mobile_url, label, headline_1, headline_2, subtitle, btn_text, btn_href")
      .eq("hidden", false)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

async function getProducts() {
  try {
    const { data } = await makeSupabase()
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true })
      .limit(8);
    return (data ?? []) as DbProduct[];
  } catch {
    return [];
  }
}

export default async function Page() {
  const [initialSlides, initialProducts] = await Promise.all([getSlides(), getProducts()]);
  return <HomeClient initialSlides={initialSlides} initialProducts={initialProducts} />;
}
