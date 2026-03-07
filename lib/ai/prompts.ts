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
  "other people, bystanders, pedestrians, crowd, group of cyclists, multiple people, " +
  "bright colors, neon, high saturation, sporty graphics, cluttered background, aggressive poses, " +
  "high contrast, glossy, plastic-look, studio lighting, flash photography, harsh shadows, " +
  "indoors, studio background, white background, standing off bike, abstract, cartoon, illustration, " +
  "low quality, blurry, distorted, no helmet, bareheaded, sneakers, running shoes, casual shoes, " +
  "sandals, bare feet, non-cycling footwear, " +
  "smiling, grinning, looking at camera, posing, eye contact with viewer";

export const SCENE_PRESETS: Record<ScenePreset, ScenePresetConfig> = {
  alpine: {
    name: "Alpine",
    description: "Epic mountain serpentine, misty golden hour",
    positivePrompt:
      "cinematic wide shot, lone cyclist on a winding mountain serpentine road, dramatic misty mountain peaks in background, " +
      "golden hour soft warm low sun, muted earthy tones, pine forests, alpine meadows in sage and moss green, " +
      "minimalist composition, vast landscape with tiny subject, plenty of negative space, " +
      "Leica M11 photography style, 35mm film grain, f/2.8 aperture, desaturated color grading, " +
      "Nordic minimalist aesthetic, high-end editorial cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  coastal: {
    name: "Coastal",
    description: "Coastal cliffs, soft overcast light",
    positivePrompt:
      "cinematic wide shot, lone cyclist riding along a coastal cliff road, vast ocean in background, " +
      "soft overcast natural light with even illumination, muted dusted blue and stone grey tones, " +
      "minimalist composition, clean lines, negative space, calm and serene atmosphere, " +
      "Leica M11 photography style, 35mm film grain, f/2.8 aperture, desaturated earthy color palette, " +
      "Nordic minimalist aesthetic, high-end editorial cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  forest: {
    name: "Forest",
    description: "Tree-lined road, soft dappled light",
    positivePrompt:
      "cinematic shot, lone cyclist on a quiet tree-lined road through dense forest, " +
      "soft dappled natural light filtering through canopy, muted moss green and espresso brown tones, " +
      "peaceful atmosphere of silence and focus, minimalist composition, clean lines, " +
      "shallow depth of field with soft bokeh background, " +
      "Leica M11 photography style, 35mm film grain, f/2.8 aperture, desaturated earthy color grading, " +
      "Nordic minimalist aesthetic, high-end editorial cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  urban: {
    name: "Urban",
    description: "Modern city, cool morning light",
    positivePrompt:
      "candid documentary style, lone cyclist in an urban setting with modern clean architecture, " +
      "cool tones, soft overcast morning light, quiet empty streets, " +
      "urban minimalism, stone grey and pale neutral palette, calm professional atmosphere, " +
      "Fujifilm X100V aesthetic, subtle film grain, f/2.8 aperture, desaturated muted colors, " +
      "Nordic minimalist aesthetic, high-end fashion cycling editorial photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
};

/**
 * Base prompt template for virtual try-on generation.
 * Placeholders:
 * - {scenePositive}: filled from SCENE_PRESETS[preset].positivePrompt
 */
export const BASE_TRYON_PROMPT = `Generate a photorealistic image of the person shown in the reference photo, wearing the cycling jersey/kit shown in the garment image, riding their bike shown in the bike photo.

ABSOLUTE RULE — NO OTHER PEOPLE:
- The ONLY person in the image must be the person from the reference photo
- Do NOT generate any other people, bystanders, pedestrians, other cyclists, or any human figures besides the uploaded person
- The scene must show the person completely alone

EXPRESSION & GAZE (MANDATORY):
- The person must NOT smile or grin — expression should be calm, focused, and natural
- The person must NOT look directly into the camera — gaze should be forward on the road or naturally averted
- Think "in the zone" cycling focus, not posing for a photo

BRAND AESTHETIC (straede — Nordic minimalist cycling):
- Style: minimalist, Nordic, cinematic storytelling, editorial photography
- Color grading: muted, desaturated, earthy tones — espresso browns, moss/sage greens, stone greys, dusted blues, natural whites
- Mood: calm, professional, authentic — like a high-end indie film, not a sports commercial
- Lighting: natural light only — golden hour (soft warm low sun), blue hour (cool dim dawn/dusk), or overcast (soft even, no harsh shadows)
- Composition: clean lines, plenty of negative space, never cluttered — "less is more"
- Camera: shot on 35mm film, Leica M11 style, f/2.8 aperture for soft backgrounds, subtle film grain

CRITICAL REQUIREMENTS:
- Preserve the person's face, body type, skin tone, and physical features exactly as in the reference photo
- Preserve the bike's exact model, color, and components as shown in the bike photo
- Render the cycling jersey/kit with exact colors, patterns, logos, and design details from the garment image
- The person should be in a natural cycling riding position on their bike
- The scene should be: {scenePositive}
- The jersey must fit naturally on the person's body with proper fabric draping and shadows

HELMET RULES (MANDATORY):
- The person MUST always wear a cycling helmet in the generated image
- If the person is wearing a helmet in the reference photo, preserve that exact helmet (color, shape, brand)
- If the person is NOT wearing a helmet in the reference photo, add a plain white cycling helmet

FOOTWEAR RULES (MANDATORY):
- The person MUST always wear cycling shoes (clip-in road cycling shoes) in the generated image
- If the person is wearing cycling shoes in the reference photo, preserve those exact shoes (color, style, brand)
- If the person is NOT wearing cycling shoes in the reference photo, add plain white road cycling shoes
- NEVER generate any other type of footwear (no sneakers, no running shoes, no casual shoes, no sandals)`;

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
