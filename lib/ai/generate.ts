import type { ScenePreset } from "@/lib/supabase/types";
import { generateWithGemini } from "./providers/gemini";
import { generateWithNanoBanana } from "./providers/nanobanana";
import { generateWithReplicateFlux } from "./providers/replicate-flux";

export type AIProvider = "gemini" | "nanobanana" | "replicate_flux" | "fashn_replicate";

/**
 * Main entry point for virtual try-on image generation.
 *
 * @param personImageBase64 - Base64-encoded photo of the person
 * @param bikeImageBase64 - Base64-encoded photo of the bike (null if not provided)
 * @param garmentImageBase64 - Base64-encoded product/jersey image
 * @param scenePreset - Scene environment preset
 * @param complementImageBase64 - Base64-encoded complementary garment (null if not provided)
 * @returns Base64-encoded result image
 */
export async function generateTryOn(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const provider = (process.env.AI_PROVIDER || "gemini") as AIProvider;

  switch (provider) {
    case "gemini":
      return generateWithGemini(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );

    case "nanobanana":
      return generateWithNanoBanana(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );

    case "replicate_flux":
      return generateWithReplicateFlux(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset,
        complementImageBase64
      );

    case "fashn_replicate":
      throw new Error(
        "fashn_replicate provider is not implemented yet"
      );

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
