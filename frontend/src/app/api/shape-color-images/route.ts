import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const HEADERS = { "Cache-Control": "no-store, no-cache, must-revalidate" };

export async function GET(req: NextRequest) {
  const shape = req.nextUrl.searchParams.get("shape") ?? "cake";

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  // Get bucket name from shape_configs
  const { data: cfg } = await supabase
    .from("shape_configs")
    .select("bucket_name")
    .eq("shape", shape)
    .single();

  if (!cfg?.bucket_name) return NextResponse.json([], { headers: HEADERS });

  const { data, error } = await supabase
    .from("shape_color_images")
    .select("color, view_index, filename")
    .eq("shape", shape)
    .not("filename", "is", null)
    .order("color").order("view_index");

  if (error) console.error("[shape-color-images]", error.message);

  const result = (data ?? []).map(row => {
    const { data: urlData } = supabase.storage
      .from(cfg.bucket_name)
      .getPublicUrl(row.filename as string);
    return {
      color:      row.color as string,
      view_index: row.view_index as number,
      url:        urlData.publicUrl,
    };
  });

  return NextResponse.json(result, { headers: HEADERS });
}
