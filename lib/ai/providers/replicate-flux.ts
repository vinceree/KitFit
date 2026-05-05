import { createServiceClient } from "@/lib/supabase/client";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const MODEL_VERSION = "black-forest-labs/flux-kontext-dev";
const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 120; // 6 minutes max

export async function generateWithReplicateFlux(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const apiToken = process.env.REPLICATE_API_TOKEN;
  if (!apiToken) {
    throw new Error("REPLICATE_API_TOKEN environment variable is not set");
  }

  const supabase = createServiceClient();
  const tempPaths: string[] = [];

  try {
    const personUrl = await uploadTemp(supabase, personImageBase64, "person", tempPaths);
    const garmentUrl = await uploadTemp(supabase, garmentImageBase64, "garment", tempPaths);
    const bikeUrl = bikeImageBase64
      ? await uploadTemp(supabase, bikeImageBase64, "bike", tempPaths)
      : null;
    const complementUrl = complementImageBase64
      ? await uploadTemp(supabase, complementImageBase64, "complement", tempPaths)
      : null;

    const { prompt } = buildPrompt(scenePreset);

    const garmentDesc = complementUrl
      ? "Dress the person in BOTH the primary cycling garment AND the complementary garment shown in the reference images."
      : "Dress the person in the cycling garment shown in the reference image.";

    const bikeDesc = bikeUrl
      ? "Place the person riding the exact bike shown in the reference."
      : "Place the person riding a high-end road bike.";

    const fluxPrompt = [
      "Transform this image: ",
      garmentDesc,
      " " + bikeDesc,
      " Preserve the person's face, body type, and skin tone exactly.",
      " The jersey/kit must show exact colors, patterns, and logos from the garment reference.",
      " " + prompt,
    ].join("");

    const imageInputs: string[] = [personUrl, garmentUrl];
    if (complementUrl) imageInputs.push(complementUrl);
    if (bikeUrl) imageInputs.push(bikeUrl);

    const input: Record<string, unknown> = {
      prompt: fluxPrompt,
      image_url: personUrl,
      aspect_ratio: "3:4",
      output_format: "jpg",
      output_quality: 90,
      safety_tolerance: 5,
    };

    // FLUX Kontext supports multiple reference images via input_images
    if (imageInputs.length > 1) {
      input.input_images = imageInputs;
    }

    const prediction = await createPrediction(apiToken, input);
    const resultUrl = await pollPrediction(apiToken, prediction.id);

    const imageResp = await fetch(resultUrl);
    if (!imageResp.ok) {
      throw new Error(`Failed to fetch result image: ${imageResp.status}`);
    }
    const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
    return imageBuffer.toString("base64");
  } finally {
    if (tempPaths.length > 0) {
      await supabase.storage.from("tryon-temp").remove(tempPaths);
    }
  }
}

async function createPrediction(
  apiToken: string,
  input: Record<string, unknown>
): Promise<{ id: string }> {
  const resp = await fetch(`${REPLICATE_API_BASE}/models/${MODEL_VERSION}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiToken}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({ input }),
  });

  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Replicate prediction failed (${resp.status}): ${err}`);
  }

  const data = await resp.json();

  if (data.status === "succeeded" && data.output) {
    return { id: data.id, ...data };
  }

  return { id: data.id };
}

async function pollPrediction(
  apiToken: string,
  predictionId: string
): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const resp = await fetch(`${REPLICATE_API_BASE}/predictions/${predictionId}`, {
      headers: { Authorization: `Bearer ${apiToken}` },
    });

    if (!resp.ok) {
      throw new Error(`Replicate poll failed (${resp.status})`);
    }

    const data = await resp.json();

    switch (data.status) {
      case "succeeded": {
        const output = data.output;
        if (Array.isArray(output)) return output[0];
        if (typeof output === "string") return output;
        throw new Error("Replicate succeeded but returned unexpected output format");
      }
      case "failed":
        throw new Error(`Replicate generation failed: ${data.error || "unknown error"}`);
      case "canceled":
        throw new Error("Replicate prediction was canceled");
      case "starting":
      case "processing":
        break;
      default:
        break;
    }
  }

  throw new Error("Replicate generation timed out after 6 minutes");
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
      cacheControl: "300",
    });

  if (error) {
    throw new Error(`Failed to upload temp ${label} image: ${error.message}`);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("tryon-temp").getPublicUrl(path);

  return publicUrl;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
