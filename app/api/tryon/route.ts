import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { generateTryOn } from "@/lib/ai/generate";
import { getMonthlyLimit } from "@/lib/rate-limit";
import type { ScenePreset, PlanTier } from "@/lib/supabase/types";

// Allow up to ~13 minutes for NanoBanana polling + image fetch during high-volume queues.
// (Vercel Pro hard cap is 800s; Enterprise can go higher.)
export const maxDuration = 800;

const VALID_PRESETS = new Set<ScenePreset>([
  "alpine",
  "coastal",
  "forest",
  "urban",
]);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return NextResponse.json(null, { headers: corsHeaders });
}

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const apiKey = formData.get("api_key") as string | null;
    const scenePreset = formData.get("scene_preset") as string | null;
    const productId = formData.get("product_id") as string | null;
    const personImage = formData.get("person_image") as File | null;
    const bikeImage = formData.get("bike_image") as File | null;
    const garmentImage = formData.get("garment_image") as File | null;

    if (!apiKey) {
      return json({ error: "api_key is required" }, 401);
    }
    if (!personImage) {
      return json({ error: "person_image is required" }, 400);
    }
    if (!garmentImage) {
      return json({ error: "garment_image is required" }, 400);
    }
    if (!scenePreset || !VALID_PRESETS.has(scenePreset as ScenePreset)) {
      return json(
        { error: "scene_preset must be one of: alpine, coastal, forest, urban" },
        400
      );
    }

    const supabase = createServiceClient();

    // Authenticate via API key
    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("brand_id, is_active")
      .eq("key", apiKey)
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return json({ error: "Invalid or inactive API key" }, 401);
    }

    const brandId = keyData.brand_id;

    // Get brand for rate limiting
    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("plan_tier")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return json({ error: "Brand not found" }, 404);
    }

    // Check monthly usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyUsage } = await supabase
      .from("try_ons")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .gte("created_at", startOfMonth.toISOString());

    const limit = getMonthlyLimit(brand.plan_tier as PlanTier);
    if ((monthlyUsage ?? 0) >= limit) {
      return json(
        {
          error: "Monthly try-on limit reached. Please upgrade your plan.",
          usage: monthlyUsage,
          limit,
        },
        429
      );
    }

    // Convert images to base64
    const personBase64 = Buffer.from(
      await personImage.arrayBuffer()
    ).toString("base64");

    const garmentBase64 = Buffer.from(
      await garmentImage.arrayBuffer()
    ).toString("base64");

    const bikeBase64 = bikeImage
      ? Buffer.from(await bikeImage.arrayBuffer()).toString("base64")
      : null;

    // Generate the try-on image
    const resultBase64 = await generateTryOn(
      personBase64,
      bikeBase64,
      garmentBase64,
      scenePreset as ScenePreset
    );

    // Record try-on for usage tracking (no images or PII stored)
    await supabase.from("try_ons").insert({
      brand_id: brandId,
      product_id: productId || null,
      scene_preset: scenePreset as ScenePreset,
      result_image_url: null,
    });

    // Return image as base64 data URL directly to the client.
    // Nothing is persisted server-side — the image only lives in the user's browser.
    return json({
      result_image: `data:image/jpeg;base64,${resultBase64}`,
      scene_preset: scenePreset,
    });
  } catch (error) {
    console.error("Try-on generation error:", error);
    return json({ error: "Internal server error during generation" }, 500);
  }
}
