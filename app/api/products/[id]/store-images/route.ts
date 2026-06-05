import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/client";

async function getAuthUser() {
  const cookieStore = cookies();
  const token = cookieStore.get("sb-access-token")?.value;
  if (!token) return null;
  const supabase = createServiceClient();
  const { data } = await supabase.auth.getUser(token);
  return data.user;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = createServiceClient();
  const { data: product } = await supabase
    .from("products")
    .select("product_url, brand_id")
    .eq("id", params.id)
    .single();

  if (!product || product.brand_id !== user.id) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  if (!product.product_url) {
    return NextResponse.json({ images: [] });
  }

  try {
    const jsonUrl = product.product_url.replace(/\/?$/, ".json");
    const res = await fetch(jsonUrl, {
      headers: { Accept: "application/json" },
    });

    if (!res.ok) {
      return NextResponse.json({ images: [] });
    }

    const data = await res.json();
    const images = (data.product?.images || []).map(
      (img: { src: string; alt?: string | null }) => ({
        src: img.src,
        alt: img.alt || null,
      })
    );

    return NextResponse.json({ images });
  } catch {
    return NextResponse.json({ images: [] });
  }
}
