import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  const { data: shapes, error } = await supabase
    .from("shape_configs")
    .select("shape, label, max_chars, view_count, allowed_colors, bucket_name, active")
    .eq("active", true)
    .order("shape");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // For each shape, get the first available image as a thumbnail
  const result = await Promise.all(
    (shapes ?? []).map(async s => {
      let thumbnail: string | null = null;
      if (s.bucket_name) {
        const { data: imgs } = await supabase
          .from("shape_color_images")
          .select("filename")
          .eq("shape", s.shape)
          .limit(1)
          .single();
        if (imgs?.filename) {
          const { data: urlData } = supabase.storage.from(s.bucket_name).getPublicUrl(imgs.filename);
          thumbnail = urlData.publicUrl;
        }
      }
      return { ...s, thumbnail };
    })
  );

  return NextResponse.json(result);
}
