import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createServiceClient } from "@/lib/supabase/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

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
  const productId = params.id;
  const supabase = createServiceClient();

  const { data, error } = await supabase
    .from("product_reference_images")
    .select("*")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (error) {
    return json({ error: "Failed to fetch reference images" }, 500);
  }

  return json({ referenceImages: data || [] });
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const productId = params.id;
  const supabase = createServiceClient();

  const { data: product } = await supabase
    .from("products")
    .select("brand_id")
    .eq("id", productId)
    .single();

  if (!product || product.brand_id !== user.id) {
    return json({ error: "Product not found" }, 404);
  }

  const { data: existing } = await supabase
    .from("product_reference_images")
    .select("id")
    .eq("product_id", productId);

  if ((existing?.length || 0) >= 3) {
    return json({ error: "Maximum 3 reference images per product" }, 400);
  }

  const body = await request.json();
  const imageUrl = body.imageUrl as string;
  if (!imageUrl) {
    return json({ error: "imageUrl is required" }, 400);
  }

  const position = existing?.length || 0;

  const { data: inserted, error } = await supabase
    .from("product_reference_images")
    .insert({
      product_id: productId,
      image_url: imageUrl,
      position,
    })
    .select()
    .single();

  if (error) {
    if (error.code === "23505") {
      return json({ error: "This image is already a reference image" }, 409);
    }
    return json({ error: "Failed to add reference image" }, 500);
  }

  return json(inserted, 201);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getAuthUser();
  if (!user) return json({ error: "Unauthorized" }, 401);

  const productId = params.id;
  const supabase = createServiceClient();

  const { data: product } = await supabase
    .from("products")
    .select("brand_id")
    .eq("id", productId)
    .single();

  if (!product || product.brand_id !== user.id) {
    return json({ error: "Product not found" }, 404);
  }

  const url = new URL(request.url);
  const refImageId = url.searchParams.get("refId");
  if (!refImageId) {
    return json({ error: "refId query parameter is required" }, 400);
  }

  await supabase
    .from("product_reference_images")
    .delete()
    .eq("id", refImageId)
    .eq("product_id", productId);

  const { data: remaining } = await supabase
    .from("product_reference_images")
    .select("id")
    .eq("product_id", productId)
    .order("position", { ascending: true });

  if (remaining) {
    for (let i = 0; i < remaining.length; i++) {
      await supabase
        .from("product_reference_images")
        .update({ position: i })
        .eq("id", remaining[i].id);
    }
  }

  return json({ success: true });
}
