import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "../prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const MODEL = "gemini-3.1-flash-image";

export async function generateWithGemini(
  personImageBase64: string,
  bikeImageBase64: string | null,
  garmentImagesBase64: string[],
  scenePreset: ScenePreset,
  complementImageBase64: string | null = null
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY environment variable is not set");
  }

  const ai = new GoogleGenAI({ apiKey });
  const { prompt, negativePrompt } = buildPrompt(scenePreset);

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
          garmentImagesBase64,
          bikeImageBase64,
          complementImageBase64
        )
      : buildInterleavedParts(
          prompt,
          negativePrompt,
          personImageBase64,
          garmentImagesBase64,
          bikeImageBase64,
          complementImageBase64
        );

  const response = await ai.models.generateContent({
    model: MODEL,
    contents: [{ role: "user", parts }],
    config: {
      responseModalities: ["image", "text"],
      imageConfig: {
        aspectRatio: "3:4",
        imageSize: "1K",
      },
    },
  });

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

function buildInterleavedParts(
  prompt: string,
  negativePrompt: string,
  person: string,
  garments: string[],
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
  ];

  if (garments.length === 1) {
    parts.push(
      {
        text: "IMAGE 2 — THE GARMENT ONLY (extract ONLY the clothing design, colors, patterns, and logos from this image. COMPLETELY IGNORE the person/model wearing it — do NOT use their face, body, or pose):",
      },
      img(garments[0])
    );
  } else {
    parts.push({
      text: `THE GARMENT — ${garments.length} reference views provided. Use ALL of them together to accurately reproduce the garment's design, colors, patterns, and logos from every angle. COMPLETELY IGNORE any person/model wearing the garment — do NOT use their face, body, or pose:`,
    });
    garments.forEach((g, i) => {
      parts.push(
        { text: `Garment view ${i + 1} of ${garments.length}:` },
        img(g)
      );
    });
  }

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

function buildBlockParts(
  prompt: string,
  negativePrompt: string,
  person: string,
  garments: string[],
  bike: string | null,
  complement: string | null
): Part[] {
  const imageDesc: string[] = [
    "\nThe first reference image is the person.",
  ];

  if (garments.length === 1) {
    imageDesc.push("The second is the primary cycling garment to wear.");
  } else {
    for (let i = 0; i < garments.length; i++) {
      imageDesc.push(
        i === 0
          ? "The second is the primary cycling garment (front view)."
          : `Image ${i + 2} is another view of the same garment — use all views to reproduce it accurately.`
      );
    }
  }

  const nextIdx = 1 + garments.length + 1;
  if (complement && bike) {
    imageDesc.push(
      `Image ${nextIdx} is a complementary garment (e.g. matching jersey or bib shorts) — dress the person in BOTH garments together.`,
      `Image ${nextIdx + 1} is the person's bike.`
    );
  } else if (complement) {
    imageDesc.push(
      `Image ${nextIdx} is a complementary garment (e.g. matching jersey or bib shorts) — dress the person in BOTH garments together.`,
      "No bike photo provided — place the person on a generic high-end road bike."
    );
  } else if (bike) {
    imageDesc.push(`Image ${nextIdx} is the person's bike.`);
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

  const parts: Part[] = [{ text: fullPrompt }, img(person)];
  garments.forEach((g) => parts.push(img(g)));
  if (complement) parts.push(img(complement));
  if (bike) parts.push(img(bike));

  return parts;
}
