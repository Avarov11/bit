import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic   = "force-dynamic";
export const revalidate = 0;

const BUCKET_BASES: Record<string, string> = {
  cake:   "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes",
  heart:  "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shapes%20heart",
  square: "https://cmueehgxpbbnrqgjcquv.supabase.co/storage/v1/object/public/shape%20square",
};

export async function GET(req: NextRequest) {
  const shape = req.nextUrl.searchParams.get("shape") ?? "cake";
  const base  = BUCKET_BASES[shape];
  if (!base) return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { global: { fetch: (url, options) => fetch(url, { ...options, cache: "no-store" }) } }
  );

  const { data, error } = await supabase
    .from("shape_color_images")
    .select("color, view_index, filename")
    .eq("shape", shape)
    .not("filename", "is", null)
    .order("color").order("view_index");

  if (error) console.error("[shape-color-images]", error.message);

  const result = (data ?? []).map(row => ({
    color:      row.color as string,
    view_index: row.view_index as number,
    url:        `${base}/${encodeURIComponent(row.filename as string)}`,
  }));

  return NextResponse.json(result, {
    headers: { "Cache-Control": "no-store, no-cache, must-revalidate" },
  });
}
