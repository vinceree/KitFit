import type { ScenePreset } from "@/lib/supabase/types";

/**
 * Scene preset configuration for virtual try-on generation.
 * Each preset defines a positive prompt (scene description) and negative prompt
 * (things to avoid). These are combined with the base prompt at generation time.
 */

export interface ScenePresetConfig {
  name: string;
  description: string;
  positivePrompt: string;
  negativePrompt: string;
}

const SHARED_NEGATIVE_PROMPT =
  "indoors, studio background, white background, standing off bike, abstract, cartoon, illustration, low quality, blurry, distorted";

export const SCENE_PRESETS: Record<ScenePreset, ScenePresetConfig> = {
  alpine: {
    name: "Alpine",
    description: "Mountain road, sunny, clear sky",
    positivePrompt:
      "scenic alpine mountain road, dramatic mountain peaks in background, bright sunny day with clear blue sky, smooth asphalt road with hairpin bends, lush green alpine meadows, professional cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  coastal: {
    name: "Coastal",
    description: "Coastal road, ocean in background, bright light",
    positivePrompt:
      "beautiful coastal road along the ocean, turquoise sea water in background, bright natural sunlight, Mediterranean or tropical coastline, palm trees or cliffs, professional cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  forest: {
    name: "Forest",
    description: "Tree-lined road, dappled light",
    positivePrompt:
      "tree-lined cycling road through dense forest, beautiful dappled sunlight filtering through leaves, lush green canopy overhead, peaceful woodland setting, professional cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  urban: {
    name: "Urban",
    description: "City streets, early morning",
    positivePrompt:
      "early morning city streets, golden hour light, modern urban architecture, clean roads, quiet city atmosphere at dawn, professional cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
};

/**
 * Base prompt template for virtual try-on generation.
 * Placeholders:
 * - {scenePositive}: filled from SCENE_PRESETS[preset].positivePrompt
 */
export const BASE_TRYON_PROMPT = `Generate a photorealistic image of the person shown in the reference photo, wearing the cycling jersey/kit shown in the garment image, riding their bike shown in the bike photo.

CRITICAL REQUIREMENTS:
- Preserve the person's face, body type, skin tone, and physical features exactly as in the reference photo
- Preserve the bike's exact model, color, and components as shown in the bike photo
- Render the cycling jersey/kit with exact colors, patterns, logos, and design details from the garment image
- The person should be in a natural cycling riding position on their bike
- The scene should be: {scenePositive}
- Photorealistic quality, professional cycling photography style, natural lighting
- The jersey must fit naturally on the person's body with proper fabric draping and shadows`;

/**
 * Builds the full generation prompt for a given scene preset.
 */
export function buildPrompt(preset: ScenePreset): {
  prompt: string;
  negativePrompt: string;
} {
  const config = SCENE_PRESETS[preset];
  return {
    prompt: BASE_TRYON_PROMPT.replace("{scenePositive}", config.positivePrompt),
    negativePrompt: config.negativePrompt,
  };
}
