import type { ScenePreset } from "@/lib/supabase/types";
import { generateWithGemini } from "./providers/gemini";
import { generateWithNanoBanana } from "./providers/nanobanana";
import { generateWithReplicateFlux } from "./providers/replicate-flux";
import { generateWithWaveSpeed } from "./providers/wavespeed";

export type AIProvider = "gemini" | "nanobanana" | "wavespeed" | "replicate_flux" | "fashn_replicate";

export async function generateTryOn(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImagesBase64: string[] | string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const garmentArray = Array.isArray(garmentImagesBase64)
    ? garmentImagesBase64
    : [garmentImagesBase64];
  const provider = (process.env.AI_PROVIDER || "gemini") as AIProvider;

  switch (provider) {
    case "gemini":
      return generateWithGemini(
        personImageBase64,
        bikeImageBase64,
        garmentArray,
        scenePreset,
        complementImageBase64
      );

    case "nanobanana":
      return generateWithNanoBanana(
        personImageBase64,
        bikeImageBase64,
        garmentArray[0],
        scenePreset,
        complementImageBase64
      );

    case "wavespeed":
      return generateWithWaveSpeed(
        personImageBase64,
        bikeImageBase64,
        garmentArray[0],
        scenePreset,
        complementImageBase64
      );

    case "replicate_flux":
      return generateWithReplicateFlux(
        personImageBase64,
        bikeImageBase64,
        garmentArray[0],
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
