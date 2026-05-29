import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash";

export interface QualityCheckResult {
  passed: boolean;
  violations: string[];
}

const QUALITY_CHECKLIST = `Analyze this AI-generated cycling photo and check for these violations. For each item, answer YES (violation present) or NO (looks good).

1. SMILING: Is the person smiling, grinning, or showing teeth?
2. EYE_CONTACT: Is the person looking directly at the camera / viewer?
3. OPEN_JERSEY: Is the cycling jersey unzipped, unbuttoned, or hanging open?
4. WRONG_ANGLE: Is the shot taken from a strange or unflattering angle (e.g. extreme low angle, directly from above, fisheye distortion)?
5. MULTIPLE_PEOPLE: Are there multiple people or bystanders visible in the image?
6. OFF_BIKE: Is the person standing next to the bike instead of riding it?
7. DISTORTED_FACE: Is the person's face visibly distorted, warped, or unnatural?
8. WRONG_FOOTWEAR: Is the person wearing sneakers, sandals, or non-cycling shoes?

Respond ONLY with a JSON object in this exact format, no other text:
{"smiling": false, "eye_contact": false, "open_jersey": false, "wrong_angle": false, "multiple_people": false, "off_bike": false, "distorted_face": false, "wrong_footwear": false}`;

const VIOLATION_LABELS: Record<string, string> = {
  smiling: "Person is smiling",
  eye_contact: "Person looking at camera",
  open_jersey: "Jersey is open/unzipped",
  wrong_angle: "Strange camera angle",
  multiple_people: "Multiple people visible",
  off_bike: "Person not riding bike",
  distorted_face: "Face distortion",
  wrong_footwear: "Non-cycling footwear",
};

export async function checkImageQuality(
  imageBase64: string
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
            { text: QUALITY_CHECKLIST },
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

    const jsonMatch = text.match(/\{[^}]+\}/);
    if (!jsonMatch) {
      return { passed: true, violations: [] };
    }

    const checks = JSON.parse(jsonMatch[0]) as Record<string, boolean>;
    const violations: string[] = [];

    for (const [key, failed] of Object.entries(checks)) {
      if (failed && VIOLATION_LABELS[key]) {
        violations.push(VIOLATION_LABELS[key]);
      }
    }

    return { passed: violations.length === 0, violations };
  } catch (err) {
    console.error("Quality check error (allowing image through):", err);
    return { passed: true, violations: [] };
  }
}
