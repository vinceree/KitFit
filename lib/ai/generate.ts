import type { ScenePreset } from "@/lib/supabase/types";
import { generateWithGemini } from "./providers/gemini";
import { generateWithNanoBanana } from "./providers/nanobanana";
import { generateWithReplicateFlux } from "./providers/replicate-flux";
import { generateWithWaveSpeed } from "./providers/wavespeed";
import sharp from "sharp";

export type AIProvider = "gemini" | "nanobanana" | "wavespeed" | "replicate_flux" | "fashn_replicate";

const TARGET_RATIO = 4 / 5; // width / height
const RATIO_TOLERANCE = 0.03;

async function enforceAspectRatio(imageBase64: string): Promise<string> {
  const buffer = Buffer.from(imageBase64, "base64");
  const metadata = await sharp(buffer).metadata();

  if (!metadata.width || !metadata.height) return imageBase64;

  const currentRatio = metadata.width / metadata.height;
  if (Math.abs(currentRatio - TARGET_RATIO) <= RATIO_TOLERANCE) {
    return imageBase64;
  }

  const targetHeight = Math.round(metadata.width / TARGET_RATIO);
  const targetWidth = Math.round(metadata.height * TARGET_RATIO);

  let result: Buffer;
  if (currentRatio > TARGET_RATIO) {
    // Too wide — crop sides, keep full height
    result = await sharp(buffer)
      .resize(targetWidth, metadata.height, { fit: "cover", position: "centre" })
      .jpeg({ quality: 92 })
      .toBuffer();
  } else {
    // Too tall — crop top/bottom, keep full width
    result = await sharp(buffer)
      .resize(metadata.width, targetHeight, { fit: "cover", position: "attention" })
      .jpeg({ quality: 92 })
      .toBuffer();
  }

  console.log(
    `Aspect ratio corrected: ${metadata.width}x${metadata.height} (${currentRatio.toFixed(3)}) → ${currentRatio > TARGET_RATIO ? targetWidth : metadata.width}x${currentRatio > TARGET_RATIO ? metadata.height : targetHeight} (${TARGET_RATIO.toFixed(3)})`
  );

  return result.toString("base64");
}

/**
 * Main entry point for virtual try-on image generation.
 */
export async function generateTryOn(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const provider = (process.env.AI_PROVIDER || "gemini") as AIProvider;

  let resultBase64: string;

  switch (provider) {
    case "gemini":
      resultBase64 = await generateWithGemini(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );
      break;

    case "nanobanana":
      resultBase64 = await generateWithNanoBanana(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );
      break;

    case "wavespeed":
      resultBase64 = await generateWithWaveSpeed(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );
      break;

    case "replicate_flux":
      resultBase64 = await generateWithReplicateFlux(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );
      break;

    case "fashn_replicate":
      throw new Error("fashn_replicate provider is not implemented yet");

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }

  return enforceAspectRatio(resultBase64);
}
