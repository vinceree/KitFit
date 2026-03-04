import type { ScenePreset } from "@/lib/supabase/types";
import { generateWithGemini } from "./providers/gemini";

export type AIProvider = "gemini" | "fashn_replicate";

/**
 * Main entry point for virtual try-on image generation.
 *
 * All other parts of the app call ONLY this function.
 * AI provider-specific code lives exclusively in /lib/ai/providers/.
 *
 * @param personImageBase64 - Base64-encoded photo of the person
 * @param bikeImageBase64 - Base64-encoded photo of the bike (null if not provided)
 * @param garmentImageBase64 - Base64-encoded product/jersey image
 * @param scenePreset - Scene environment preset
 * @returns Base64-encoded result image
 */
export async function generateTryOn(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset
): Promise<string> {
  const provider = (process.env.AI_PROVIDER || "gemini") as AIProvider;

  switch (provider) {
    case "gemini":
      return generateWithGemini(
        personImageBase64,
        bikeImageBase64,
        garmentImageBase64,
        scenePreset
      );

    case "fashn_replicate":
      // Future: two-stage pipeline using FASHN for garment transfer
      // then Replicate Flux LoRA for scene composition.
      // Implement by modifying only this file and the provider files.
      throw new Error(
        "fashn_replicate provider is not implemented yet"
      );

    default:
      throw new Error(`Unknown AI provider: ${provider}`);
  }
}
