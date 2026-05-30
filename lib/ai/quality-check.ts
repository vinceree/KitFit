import { GoogleGenAI } from "@google/genai";
import { buildPrompt } from "./prompts";
import type { ScenePreset } from "@/lib/supabase/types";

const MODEL = "gemini-2.5-flash";

export interface QualityCheckResult {
  passed: boolean;
  violations: string[];
}

function buildCheckPrompt(scenePreset: ScenePreset): string {
  const { prompt, negativePrompt } = buildPrompt(scenePreset);

  return `You are a quality control reviewer for AI-generated cycling photos.

Analyze the attached image and check whether it violates ANY of the rules below. These are the exact rules the image was supposed to follow.

GENERATION PROMPT (what the image SHOULD look like):
${prompt}

NEGATIVE PROMPT (things that must NOT appear):
${negativePrompt}

Check the image carefully against ALL of these rules. Then respond ONLY with a JSON object in this exact format, no other text:
{"passed": true, "violations": []}

If the image violates any rules, set passed to false and list each violation as a short string in the violations array. For example:
{"passed": false, "violations": ["person is smiling", "front-facing camera angle", "gravel road surface"]}

Be strict but fair — only flag clear, obvious violations, not borderline cases.`;
}

export async function checkImageQuality(
  imageBase64: string,
  scenePreset: ScenePreset = "alpine"
): Promise<QualityCheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { passed: true, violations: [] };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const checkPrompt = buildCheckPrompt(scenePreset);

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            { text: checkPrompt },
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
          ],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return { passed: true, violations: [] };
    }

    const jsonMatch = text.match(/\{[^}]*\}/s);
    if (!jsonMatch) {
      return { passed: true, violations: [] };
    }

    const result = JSON.parse(jsonMatch[0]) as {
      passed: boolean;
      violations: string[];
    };

    if (!result.passed && result.violations?.length > 0) {
      console.log("Quality check FAILED:", result.violations.join(", "));
    } else {
      console.log("Quality check PASSED");
    }

    return {
      passed: result.passed !== false,
      violations: result.violations || [],
    };
  } catch (err) {
    console.error("Quality check error (allowing image through):", err);
    return { passed: true, violations: [] };
  }
}
