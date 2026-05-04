import { createServiceClient } from "@/lib/supabase/client";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const API_BASE = "https://api.nanobananaapi.ai/api/v1/nanobanana";
const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 200; // 10 minutes max — tolerates high-volume queueing

/**
 * NanoBanana-based virtual try-on generation.
 *
 * Flow:
 * 1. Upload person/garment/bike images to temporary Supabase storage so
 *    NanoBanana can fetch them via public URL.
 * 2. Submit a generate-2 task with those URLs + the scene prompt.
 * 3. Poll until the task completes.
 * 4. Fetch the result image and return it as base64.
 * 5. Clean up the temporary uploads.
 */
export async function generateWithNanoBanana(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const apiKey = process.env.NANOBANANA_API_KEY;
  if (!apiKey) {
    throw new Error("NANOBANANA_API_KEY environment variable is not set");
  }

  const supabase = createServiceClient();
  const tempPaths: string[] = [];

  try {
    // 1. Upload input images to temp storage so NanoBanana can access them
    const personUrl = await uploadTemp(supabase, personImageBase64, "person", tempPaths);
    const garmentUrl = await uploadTemp(supabase, garmentImageBase64, "garment", tempPaths);
    const bikeUrl = bikeImageBase64
      ? await uploadTemp(supabase, bikeImageBase64, "bike", tempPaths)
      : null;
    const complementUrl = complementImageBase64
      ? await uploadTemp(supabase, complementImageBase64, "complement", tempPaths)
      : null;

    // 2. Build prompt and image URL list
    const { prompt, negativePrompt } = buildPrompt(scenePreset);

    const imageUrls = [personUrl, garmentUrl];
    if (complementUrl) imageUrls.push(complementUrl);
    if (bikeUrl) imageUrls.push(bikeUrl);

    const imageDesc: string[] = [
      "\nThe first reference image is the person.",
      "The second is the primary cycling garment to wear.",
    ];
    if (complementUrl && bikeUrl) {
      imageDesc.push(
        "The third is a complementary garment (e.g. matching jersey or bib shorts) — dress the person in BOTH garments together.",
        "The fourth is the person's bike."
      );
    } else if (complementUrl) {
      imageDesc.push(
        "The third is a complementary garment (e.g. matching jersey or bib shorts) — dress the person in BOTH garments together.",
        "No bike photo provided — place the person on a generic high-end road bike."
      );
    } else if (bikeUrl) {
      imageDesc.push("The third image is the person's bike.");
    } else {
      imageDesc.push(
        "No bike photo provided — place the person on a generic high-end road bike."
      );
    }

    const fullPrompt = [
      prompt,
      `\nAvoid the following: ${negativePrompt}`,
      ...imageDesc,
    ].join("");

    // 3. Submit generation task
    const submitResp = await fetch(`${API_BASE}/generate-2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        imageUrls,
        aspectRatio: "3:4",
        resolution: "1K",
        outputFormat: "jpg",
      }),
    });

    if (!submitResp.ok) {
      const err = await submitResp.text();
      throw new Error(`NanoBanana submit failed (${submitResp.status}): ${err}`);
    }

    const submitData = await submitResp.json();
    const taskId: string = submitData?.data?.taskId;
    if (!taskId) {
      throw new Error("NanoBanana did not return a taskId");
    }

    // 4. Poll for completion
    const resultImageUrl = await pollForResult(apiKey, taskId);

    // 5. Fetch the result image and convert to base64
    const imageResp = await fetch(resultImageUrl);
    if (!imageResp.ok) {
      throw new Error(`Failed to fetch result image: ${imageResp.status}`);
    }
    const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
    return imageBuffer.toString("base64");
  } finally {
    // Clean up temporary uploads
    if (tempPaths.length > 0) {
      await supabase.storage.from("tryon-temp").remove(tempPaths);
    }
  }
}

async function uploadTemp(
  supabase: ReturnType<typeof createServiceClient>,
  base64Data: string,
  label: string,
  trackPaths: string[]
): Promise<string> {
  const buffer = Buffer.from(base64Data, "base64");
  const path = `tmp/${Date.now()}-${label}.jpg`;
  trackPaths.push(path);

  const { error } = await supabase.storage
    .from("tryon-temp")
    .upload(path, buffer, {
      contentType: "image/jpeg",
      cacheControl: "300", // 5 min — these are ephemeral
    });

  if (error) {
    throw new Error(`Failed to upload temp ${label} image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("tryon-temp").getPublicUrl(path);

  return publicUrl;
}

async function pollForResult(
  apiKey: string,
  taskId: string
): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const resp = await fetch(
      `${API_BASE}/record-info?taskId=${encodeURIComponent(taskId)}`,
      {
        headers: { Authorization: `Bearer ${apiKey}` },
      }
    );

    if (!resp.ok) {
      throw new Error(`NanoBanana poll failed (${resp.status})`);
    }

    const data = await resp.json();
    const flag = data?.data?.successFlag;

    switch (flag) {
      case 1: {
        // Success
        const url =
          data.data.response?.resultImageUrl ||
          data.data.response?.originImageUrl;
        if (!url) {
          throw new Error("NanoBanana task succeeded but returned no image URL");
        }
        return url;
      }
      case 2:
        throw new Error(
          `NanoBanana task creation failed: ${data.data.errorMessage || "unknown error"}`
        );
      case 3:
        throw new Error(
          `NanoBanana generation failed: ${data.data.errorMessage || "unknown error"}`
        );
      case 0:
        // Still generating — continue polling
        break;
      default:
        throw new Error(`NanoBanana unexpected status: ${flag}`);
    }
  }

  throw new Error("NanoBanana generation timed out after 10 minutes");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
