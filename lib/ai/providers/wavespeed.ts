import { createServiceClient } from "@/lib/supabase/client";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const API_BASE = "https://api.wavespeed.ai/api/v3/google/nano-banana-2/edit-fast";
const POLL_INTERVAL_MS = 2_000;
const MAX_POLL_ATTEMPTS = 150;

export async function generateWithWaveSpeed(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const apiKey = process.env.WAVESPEED_API_KEY;
  if (!apiKey) {
    throw new Error("WAVESPEED_API_KEY environment variable is not set");
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

    const { prompt, negativePrompt } = buildPrompt(scenePreset);

    const images = [personUrl, garmentUrl];
    if (complementUrl) images.push(complementUrl);
    if (bikeUrl) images.push(bikeUrl);

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

    const submitResp = await fetch(API_BASE, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        prompt: fullPrompt,
        images,
        aspect_ratio: "3:4",
        resolution: "2k",
        output_format: "jpeg",
        enable_sync_mode: false,
      }),
    });

    if (!submitResp.ok) {
      const err = await submitResp.text();
      throw new Error(`WaveSpeed submit failed (${submitResp.status}): ${err}`);
    }

    const submitData = await submitResp.json();
    console.log("WaveSpeed response:", JSON.stringify(submitData, null, 2));

    const taskId = submitData.id || submitData.data?.id;
    const pollUrl = submitData.urls?.get || submitData.data?.urls?.get;

    if (!taskId && !pollUrl) {
      if (submitData.outputs && submitData.outputs.length > 0) {
        const imageResp = await fetch(submitData.outputs[0]);
        if (!imageResp.ok) throw new Error(`Failed to fetch result: ${imageResp.status}`);
        const imageBuffer = Buffer.from(await imageResp.arrayBuffer());
        return imageBuffer.toString("base64");
      }
      throw new Error("WaveSpeed did not return a task ID, poll URL, or outputs");
    }

    const finalPollUrl = pollUrl || `https://api.wavespeed.ai/api/v3/predictions/${taskId}/result`;
    const resultImageUrl = await pollForResult(apiKey, finalPollUrl);

    const imageResp = await fetch(resultImageUrl);
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

async function pollForResult(
  apiKey: string,
  pollUrl: string
): Promise<string> {
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(POLL_INTERVAL_MS);

    const resp = await fetch(pollUrl, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (!resp.ok) {
      throw new Error(`WaveSpeed poll failed (${resp.status})`);
    }

    const data = await resp.json();

    switch (data.status) {
      case "completed": {
        const outputs = data.outputs;
        if (!outputs || outputs.length === 0) {
          throw new Error("WaveSpeed completed but returned no outputs");
        }
        return outputs[0];
      }
      case "failed":
        throw new Error("WaveSpeed generation failed");
      case "created":
      case "processing":
        break;
      default:
        break;
    }
  }

  throw new Error("WaveSpeed generation timed out after 5 minutes");
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
