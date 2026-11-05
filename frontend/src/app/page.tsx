import { createClient } from "@supabase/supabase-js";
import HomeClient from "./HomeClient";

export const dynamic = "force-dynamic";

async function getSlides() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    const { data } = await supabase
      .from("slideshow")
      .select("id, desktop_url, mobile_url, label, headline_1, headline_2, subtitle, btn_text, btn_href")
      .eq("hidden", false)
      .order("sort_order", { ascending: true });
    return data ?? [];
  } catch {
    return [];
  }
}

export default async function Page() {
  const initialSlides = await getSlides();
  return <HomeClient initialSlides={initialSlides} />;
}
