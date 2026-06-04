import { GoogleGenAI } from "@google/genai";
import type { ScenePreset } from "@/lib/supabase/types";

const MODEL = "gemini-2.5-flash";

export interface QualityCheckResult {
  passed: boolean;
  violations: string[];
}

const CHECK_PROMPT = `You are a strict quality reviewer for AI-generated cycling photos. Check the image against EACH rule below. If ANY rule is violated, the image FAILS.

CHECKLIST — answer YES or NO for each:
1. SOLO RIDER: Is there exactly ONE person in the image? (no bystanders, no other cyclists)
2. HELMET: Is the rider wearing a cycling helmet?
3. WHITE SHOES: Is the rider wearing plain WHITE cycling shoes? (black shoes = FAIL, colored shoes = FAIL)
4. WHITE SOCKS: Is the rider wearing plain WHITE socks? (black socks = FAIL, colored socks = FAIL)
5. ROAD SURFACE: Is the ground smooth asphalt? (gravel, dirt, cobblestones = FAIL)
6. JERSEY CLOSED: Is the cycling jersey fully zipped/closed? (open or unzipped = FAIL)
7. ROAD ALIGNMENT: Is the bike oriented along the road's direction? (bike pointing off-road or perpendicular to the road = FAIL)
8. NO SMILE: Is the rider NOT smiling or grinning? (focused/neutral expression required)
9. NOT STARING AT CAMERA: Is the rider looking ahead, NOT directly into the camera lens?
10. RIDER PROMINENT: Is the rider large enough in the frame that the jersey design is clearly visible? (tiny distant rider = FAIL)

Respond ONLY with a JSON object. Example:
{"passed": false, "violations": ["black shoes instead of white", "rider too small in frame"]}

If all rules pass:
{"passed": true, "violations": []}

Be STRICT. If a rule is clearly violated, fail the image.`;

export async function checkImageQuality(
  imageBase64: string,
  _scenePreset: ScenePreset = "alpine"
): Promise<QualityCheckResult> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return { passed: true, violations: [] };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    const response = await ai.models.generateContent({
      model: MODEL,
      contents: [
        {
          role: "user",
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: imageBase64,
              },
            },
            { text: CHECK_PROMPT },
          ],
        },
      ],
    });

    const text = response.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      console.log("Quality check: no response text, allowing image");
      return { passed: true, violations: [] };
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.log("Quality check: no JSON in response, allowing image. Raw:", text.slice(0, 200));
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
