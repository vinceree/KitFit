import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveProductId(
  supabase: ReturnType<typeof import("@/lib/supabase/client").createServiceClient>,
  idOrSlug: string
): Promise<string | null> {
  if (UUID_RE.test(idOrSlug)) {
    return idOrSlug;
  }

  const { data } = await supabase
    .from("products")
    .select("id")
    .ilike("product_url", `%/products/${idOrSlug}%`)
    .limit(1)
    .single();

  if (data) return data.id;

  const { data: byName } = await supabase
    .from("products")
    .select("id")
    .ilike("name", `%${idOrSlug.replace(/-/g, " ")}%`)
    .limit(1)
    .single();

  return byName?.id || null;
}

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const rawId = params.id;
  if (!rawId) {
    return json({ error: "Product ID is required" }, 400);
  }

  const supabase = createServiceClient();

  const productId = await resolveProductId(supabase, rawId);
  if (!productId) {
    return json({ complements: [] });
  }

  const { data: pairings, error } = await supabase
    .from("product_pairings")
    .select("complement_id, is_default")
    .eq("product_id", productId);

  if (error) {
    console.error("Complements fetch error:", error);
    return json({ error: "Failed to fetch complements" }, 500);
  }

  if (!pairings || pairings.length === 0) {
    return json({ complements: [] });
  }

  const complementIds = pairings.map(
    (p: { complement_id: string }) => p.complement_id
  );
  const defaultId = pairings.find(
    (p: { is_default: boolean }) => p.is_default
  )?.complement_id;

  const { data: products, error: prodError } = await supabase
    .from("products")
    .select("id, name, image_url, category")
    .in("id", complementIds);

  if (prodError) {
    console.error("Products fetch error:", prodError);
    return json({ error: "Failed to fetch complement products" }, 500);
  }

  return json({
    complements: (products || []).map(
      (p: {
        id: string;
        name: string;
        image_url: string;
        category: string | null;
      }) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.image_url,
        category: p.category,
        isDefault: p.id === defaultId,
      })
    ),
  });
}
