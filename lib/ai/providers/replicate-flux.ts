import { createServiceClient } from "@/lib/supabase/client";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const REPLICATE_API_BASE = "https://api.replicate.com/v1";
const MODEL_ID = "black-forest-labs/flux-kontext-dev";
const POLL_INTERVAL_MS = 3_000;
const MAX_POLL_ATTEMPTS = 120;

export async function generateWithReplicateFlux(
  personImageBase64: string,
  _bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  _complementImageBase64: string | null = null
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

    const { prompt: scenePrompt } = buildPrompt(scenePreset);

    const fluxPrompt = [
      "Edit this photo: dress the person in the cycling jersey/kit visible at this URL: " + garmentUrl + ".",
      " Preserve the person's face, body type, hair, and skin tone exactly as they are.",
      " The jersey must show the exact colors, patterns, and logos from the garment image — do not invent or alter the design.",
      " Place the person in a natural cycling riding position on a high-end road bike.",
      " The jersey should fit naturally with proper fabric draping and realistic shadows.",
      " " + scenePrompt,
    ].join("");

    const input: Record<string, unknown> = {
      prompt: fluxPrompt,
      input_image: personUrl,
      aspect_ratio: "match_input_image",
      output_format: "jpg",
      output_quality: 90,
      guidance: 3.5,
      num_inference_steps: 30,
      go_fast: true,
      disable_safety_checker: true,
    };

    const prediction = await createPrediction(apiToken, input);
    const resultUrl = await getResult(apiToken, prediction);

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

interface PredictionResult {
  id: string;
  status: string;
  output?: string | string[];
  error?: string;
}

async function createPrediction(
  apiToken: string,
  input: Record<string, unknown>
): Promise<PredictionResult> {
  const resp = await fetch(`${REPLICATE_API_BASE}/models/${MODEL_ID}/predictions`, {
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

  return resp.json();
}

async function getResult(
  apiToken: string,
  prediction: PredictionResult
): Promise<string> {
  if (prediction.status === "succeeded") {
    return extractOutputUrl(prediction);
  }
  if (prediction.status === "failed") {
    throw new Error(`Replicate generation failed: ${prediction.error || "unknown error"}`);
  }

  return pollPrediction(apiToken, prediction.id);
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

    const data: PredictionResult = await resp.json();

    switch (data.status) {
      case "succeeded":
        return extractOutputUrl(data);
      case "failed":
        throw new Error(`Replicate generation failed: ${data.error || "unknown error"}`);
      case "canceled":
        throw new Error("Replicate prediction was canceled");
      case "starting":
      case "processing":
        break;
    }
  }

  throw new Error("Replicate generation timed out after 6 minutes");
}

function extractOutputUrl(prediction: PredictionResult): string {
  const output = prediction.output;
  if (Array.isArray(output) && output.length > 0) return output[0];
  if (typeof output === "string") return output;
  throw new Error("Replicate succeeded but returned no output");
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
