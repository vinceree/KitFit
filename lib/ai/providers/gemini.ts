import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const MODEL = "gemini-3.1-flash-image";

/**
 * Gemini-based virtual try-on generation.
 * Sends person, bike, and garment images to Gemini's image generation model
 * along with the scene-specific prompt.
 */
export async function generateWithGemini(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImageBase64: string,
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { prompt, negativePrompt } = buildPrompt(scenePreset);

  // Two prompt structures to compare:
  // - "interleaved" (default): label, image, label, image — each label next to its image
  // - "block": NanoBanana-style — one combined text block first, then all images in order
  const structure = process.env.GEMINI_PROMPT_STRUCTURE || "interleaved";

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > =
    structure === "block"
      ? buildBlockParts(
          prompt,
          negativePrompt,
          personImageBase64,
          garmentImageBase64,
          bikeImageBase64,
          complementImageBase64
        )
      : buildInterleavedParts(
          prompt,
          negativePrompt,
          personImageBase64,
          garmentImageBase64,
          bikeImageBase64,
          complementImageBase64
        );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: ["image", "text"],
      responseFormat: {
        image: {
          aspectRatio: "3:4",
          imageSize: "1K",
        },
      },
    },
  });

  // Extract the generated image from the response
  const candidates = response.candidates;
  if (!candidates || candidates.length === 0) {
    throw new Error("Gemini returned no candidates");
  }

  const content = candidates[0].content;
  if (!content || !content.parts) {
    throw new Error("Gemini returned no content parts");
  }

  for (const part of content.parts) {
    if (part.inlineData && part.inlineData.data) {
      // Return the base64 image data
      return part.inlineData.data;
    }
  }

  throw new Error(
    "Gemini response did not contain a generated image"
  );
}

type Part =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

function img(data: string): Part {
  return { inlineData: { mimeType: "image/jpeg", data } };
}

/**
 * Default structure: text label immediately before each image.
 */
function buildInterleavedParts(
  prompt: string,
  negativePrompt: string,
  person: string,
  garment: string,
  bike: string | null,
  complement: string | null
): Part[] {
  const fullPrompt = `${prompt}\n\nAvoid the following: ${negativePrompt}`;

  const parts: Part[] = [
    { text: fullPrompt },
    {
      text: "IMAGE 1 — THE PERSON (use THIS face, body, skin tone, and hair in the output. This is the ONLY face that should appear):",
    },
    img(person),
    {
      text: "IMAGE 2 — THE GARMENT ONLY (extract ONLY the clothing design, colors, patterns, and logos from this image. COMPLETELY IGNORE the person/model wearing it — do NOT use their face, body, or pose):",
    },
    img(garment),
  ];

  if (complement) {
    parts.push(
      { text: "Complementary garment — dress the person in BOTH garments together:" },
      img(complement)
    );
  }

  if (bike) {
    parts.push({ text: "The person's bike:" }, img(bike));
  } else {
    parts.push({
      text: "No bike photo provided — place the person on a generic high-end road bike.",
    });
  }

  return parts;
}

/**
 * NanoBanana-style structure: one combined text block describing all images,
 * then all images appended in order.
 */
function buildBlockParts(
  prompt: string,
  negativePrompt: string,
  person: string,
  garment: string,
  bike: string | null,
  complement: string | null
): Part[] {
  const imageDesc: string[] = [
    "\nThe first reference image is the person.",
    "The second is the primary cycling garment to wear.",
  ];
  if (complement && bike) {
    imageDesc.push(
      "The third is a complementary garment (e.g. matching jersey or bib shorts) — dress the person in BOTH garments together.",
      "The fourth is the person's bike."
    );
  } else if (complement) {
    imageDesc.push(
      "The third is a complementary garment (e.g. matching jersey or bib shorts) — dress the person in BOTH garments together.",
      "No bike photo provided — place the person on a generic high-end road bike."
    );
  } else if (bike) {
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

  const parts: Part[] = [{ text: fullPrompt }, img(person), img(garment)];
  if (complement) parts.push(img(complement));
  if (bike) parts.push(img(bike));

  return parts;
}
