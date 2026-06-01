import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/client";
import { generateTryOn } from "@/lib/ai/generate";
import { checkImageQuality } from "@/lib/ai/quality-check";
import { getMonthlyLimit } from "@/lib/rate-limit";
import type { ScenePreset, PlanTier } from "@/lib/supabase/types";

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
  const supabase = createServiceClient();
  let jobId: string | null = null;

  try {
    const formData = await request.formData();

    const apiKey = formData.get("api_key") as string | null;
    const scenePreset = formData.get("scene_preset") as string | null;
    const productId = formData.get("product_id") as string | null;
    const personImage = formData.get("person_image") as File | null;
    const bikeImage = formData.get("bike_image") as File | null;
    const garmentImage = formData.get("garment_image") as File | null;
    const complementImage = formData.get("complement_image") as File | null;
    jobId = formData.get("job_id") as string | null;

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

    const { data: keyData, error: keyError } = await supabase
      .from("api_keys")
      .select("brand_id, is_active")
      .eq("key", apiKey)
      .single();

    if (keyError || !keyData || !keyData.is_active) {
      return json({ error: "Invalid or inactive API key" }, 401);
    }

    const brandId = keyData.brand_id;

    const { data: brand, error: brandError } = await supabase
      .from("brands")
      .select("plan_tier")
      .eq("id", brandId)
      .single();

    if (brandError || !brand) {
      return json({ error: "Brand not found" }, 404);
    }

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: monthlyUsage } = await supabase
      .from("try_ons")
      .select("*", { count: "exact", head: true })
      .eq("brand_id", brandId)
      .eq("status", "completed")
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

    // If async mode, insert job row with processing status so the poll
    // endpoint and any other page can track this generation.
    if (jobId) {
      const { error: insertError } = await supabase.from("try_ons").insert({
        brand_id: brandId,
        product_id: productId || null,
        scene_preset: scenePreset as ScenePreset,
        result_image_url: null,
        job_id: jobId,
        status: "processing",
      });
      if (insertError) {
        // Most likely the 003_async_tryon migration hasn't been applied yet.
        // Don't fail the request — same-page generation still returns the image
        // directly. Cross-page notifications need the migration.
        console.error(
          "Async job tracking unavailable (run migration 003_async_tryon?):",
          insertError.message
        );
      }
    }

    const personBase64 = Buffer.from(
      await personImage.arrayBuffer()
    ).toString("base64");

    const garmentBase64 = Buffer.from(
      await garmentImage.arrayBuffer()
    ).toString("base64");

    const bikeBase64 = bikeImage
      ? Buffer.from(await bikeImage.arrayBuffer()).toString("base64")
      : null;

    const complementBase64 = complementImage
      ? Buffer.from(await complementImage.arrayBuffer()).toString("base64")
      : null;

    let resultBase64 = await generateTryOn(
      personBase64,
      bikeBase64,
      garmentBase64,
      scenePreset as ScenePreset,
      complementBase64
    );

    const qualityResult = await checkImageQuality(resultBase64, scenePreset as ScenePreset);
    if (!qualityResult.passed) {
      console.log("Quality check failed, retrying. Violations:", qualityResult.violations);
      resultBase64 = await generateTryOn(
        personBase64,
        bikeBase64,
        garmentBase64,
        scenePreset as ScenePreset,
        complementBase64
      );
    }

    if (jobId) {
      // Upload result to storage so another page (cross-page navigation) can
      // fetch it via the poll endpoint. upsert in case of a retry.
      const buffer = Buffer.from(resultBase64, "base64");
      const storagePath = `results/${jobId}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("tryon-temp")
        .upload(storagePath, buffer, {
          contentType: "image/jpeg",
          cacheControl: "1800",
          upsert: true,
        });
      if (uploadError) {
        console.error("Result upload failed:", uploadError.message);
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("tryon-temp").getPublicUrl(storagePath);

      const { error: updateError } = await supabase
        .from("try_ons")
        .update({ status: "completed", result_image_url: publicUrl })
        .eq("job_id", jobId);
      if (updateError) {
        console.error("Async job completion update failed:", updateError.message);
      }
    } else {
      await supabase.from("try_ons").insert({
        brand_id: brandId,
        product_id: productId || null,
        scene_preset: scenePreset as ScenePreset,
        result_image_url: null,
      });
    }

    return json({
      result_image: `data:image/jpeg;base64,${resultBase64}`,
      scene_preset: scenePreset,
      ...(jobId && { job_id: jobId }),
    });
  } catch (error) {
    if (jobId) {
      const message =
        error instanceof Error ? error.message : "Generation failed";
      await supabase
        .from("try_ons")
        .update({ status: "failed", error_message: message })
        .eq("job_id", jobId)
        .then(() => {});
    }
    console.error("Try-on generation error:", error);
    return json({ error: "Internal server error during generation" }, 500);
  }
}
