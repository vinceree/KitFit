import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const MODEL = "gemini-2.5-flash-image";

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

  const fullPrompt = `${prompt}\n\nAvoid the following: ${negativePrompt}`;

  const parts: Array<
    | { text: string }
    | { inlineData: { mimeType: string; data: string } }
  > = [
    { text: fullPrompt },
    {
      text: "Reference photo of the person:",
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: personImageBase64,
      },
    },
    {
      text: "Cycling jersey/kit to wear:",
    },
    {
      inlineData: {
        mimeType: "image/jpeg",
        data: garmentImageBase64,
      },
    },
  ];

  if (complementImageBase64) {
    parts.push(
      { text: "Complementary garment — dress the person in BOTH garments together:" },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: complementImageBase64,
        },
      }
    );
  }

  if (bikeImageBase64) {
    parts.push(
      { text: "The person's bike:" },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: bikeImageBase64,
        },
      }
    );
  } else {
    parts.push({
      text: "No bike photo provided — place the person on a generic high-end road bike.",
    });
  }

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: ["image", "text"],
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
