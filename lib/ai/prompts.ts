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
  "smiling, grinning, looking at camera, posing, eye contact with viewer, " +
  "open jersey, unzipped jersey, unbuttoned jersey, jersey hanging open, " +
  "flat dead-on head-on view, rider facing straight into the camera lens, perfectly symmetrical front shot, " +
  "rider sideways across the road, rider perpendicular to road, bike pointing across the street, rider not traveling along the road direction, " +
  "tiny distant subject, rider too small in frame, garment not clearly visible, " +
  "accessories from garment model, chains, necklaces, bracelets, jewelry, piercings not in person photo, " +
  "tattoos from garment model, tattoos not present in person reference photo, " +
  "gravel surface, cobblestones, dirt road, unpaved road, grass path — road surface must be smooth asphalt only";

export const SCENE_PRESETS: Record<ScenePreset, ScenePresetConfig> = {
  alpine: {
    name: "Alpine",
    description: "Mountain road, misty golden hour",
    positivePrompt:
      "lone cyclist riding along a mountain road, the rider prominent and clearly visible in the frame, " +
      "dramatic misty mountain peaks softly blurred in the background, " +
      "golden hour soft warm low sun, muted earthy tones, pine forests, alpine meadows in sage and moss green, " +
      "shallow depth of field with soft bokeh background, " +
      "Leica M11 photography style, 35mm film grain, f/2.8 aperture, desaturated color grading, " +
      "Nordic minimalist aesthetic, high-end editorial cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  coastal: {
    name: "Coastal",
    description: "Coastal cliffs, soft overcast light",
    positivePrompt:
      "lone cyclist riding along a coastal cliff road, the rider prominent and clearly visible in the frame, " +
      "vast ocean softly blurred in the background, " +
      "soft overcast natural light with even illumination, muted dusted blue and stone grey tones, " +
      "calm and serene atmosphere, shallow depth of field with soft bokeh background, " +
      "Leica M11 photography style, 35mm film grain, f/2.8 aperture, desaturated earthy color palette, " +
      "Nordic minimalist aesthetic, high-end editorial cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  forest: {
    name: "Forest",
    description: "Tree-lined road, soft dappled light",
    positivePrompt:
      "lone cyclist riding along a quiet tree-lined road through forest, the rider prominent and clearly visible in the frame, " +
      "soft dappled natural light filtering through canopy, muted moss green and espresso brown tones, " +
      "peaceful atmosphere of silence and focus, shallow depth of field with soft bokeh background, " +
      "Leica M11 photography style, 35mm film grain, f/2.8 aperture, desaturated earthy color grading, " +
      "Nordic minimalist aesthetic, high-end editorial cycling photography",
    negativePrompt: SHARED_NEGATIVE_PROMPT,
  },
  urban: {
    name: "Urban",
    description: "Modern city, cool morning light",
    positivePrompt:
      "lone cyclist riding through a modern urban setting with clean architecture, the rider prominent and clearly visible in the frame, " +
      "cool tones, soft overcast morning light, quiet empty streets softly blurred behind, " +
      "stone grey and pale neutral palette, calm professional atmosphere, shallow depth of field, " +
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
- Composition: clean, uncluttered background, with the rider as the clear focal point
- Camera: shot on 35mm film, Leica M11 style, f/2.8 aperture for soft backgrounds, subtle film grain

FRAMING (MANDATORY):
- The rider must be PROMINENT in the frame — large enough that the jersey's colors, patterns, and logos are clearly visible
- Use a medium shot / portrait crop focused on the rider, NOT a distant wide landscape with a tiny subject
- The background should be present but softly blurred (shallow depth of field), keeping attention on the rider and garment

CAMERA ANGLE (MANDATORY):
- The shot must be a three-quarter FRONT angle or a side angle — these show the garment well
- NEVER use a flat, dead-on, perfectly symmetrical head-on view with the rider staring into the lens
- The composition should look like a candid shot taken as the rider passes by, not a stiff posed portrait

RIDER DIRECTION (MANDATORY):
- The rider and bike must be traveling ALONG the road, following the road's direction
- The road should lead diagonally through the frame in the SAME direction the bike points
- NEVER position the rider sideways or perpendicular to a road that recedes straight away from the camera
- Think of it as a real cyclist riding down the road: the bike and the road run in the same direction

GARMENT MODEL ISOLATION (MANDATORY):
- ONLY extract the clothing design from the garment image — colors, patterns, logos, fabric texture
- Do NOT transfer any other features from the garment model: no tattoos, no accessories (chains, necklaces, bracelets, jewelry), no piercings, no hairstyle
- Only include tattoos if they are visible in the PERSON reference photo
- Only include accessories if they are visible in the PERSON reference photo

ROAD SURFACE (MANDATORY):
- The ground must ALWAYS be smooth asphalt road surface
- NEVER generate gravel, cobblestones, dirt, unpaved roads, or grass paths

JERSEY FIT (MANDATORY):
- The cycling jersey must be fully closed and zipped up at all times
- NEVER generate an open, unzipped, or unbuttoned jersey

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
