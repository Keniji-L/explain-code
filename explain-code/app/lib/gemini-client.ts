/**
 * Shared Gemini API helper with automatic model fallback on quota/rate-limit errors.
 * Runs exclusively on the server using GEMINI_API_KEY.
 */

export const GEMINI_MODEL_FALLBACK_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.7-flash",
  "gemini-2.0-flash-lite",
] as const;

export type GeminiModelName = (typeof GEMINI_MODEL_FALLBACK_CHAIN)[number];

export interface GeminiJsonCallOptions {
  apiKey: string;
  prompt: string;
  temperature?: number;
  timeoutMs?: number;
  models?: readonly string[];
}

export interface GeminiJsonCallResult<T = unknown> {
  ok: boolean;
  model?: string;
  data?: T;
  lastStatus?: number;
  error?: string;
}

function stripJsonCodeFences(rawText: string): string {
  return rawText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function isQuotaOrModelFallbackStatus(status: number, bodyText: string): boolean {
  if (status === 429 || status === 503 || status === 404) {
    return true;
  }
  const lower = bodyText.toLowerCase();
  return (
    lower.includes("resource_exhausted") ||
    lower.includes("quota") ||
    lower.includes("rate limit") ||
    lower.includes("overloaded") ||
    lower.includes("not found")
  );
}

/**
 * Calls Gemini generateContent (JSON mode), automatically switching to the next
 * fallback model when quota is exhausted (429 / RESOURCE_EXHAUSTED) or a model
 * is temporarily unavailable (503 / 404).
 */
export async function callGeminiGenerateJson<T = unknown>({
  apiKey,
  prompt,
  temperature,
  timeoutMs = 15000,
  models = GEMINI_MODEL_FALLBACK_CHAIN,
}: GeminiJsonCallOptions): Promise<GeminiJsonCallResult<T>> {
  let lastStatus: number | undefined;
  let lastError: string | undefined;

  for (const model of models) {
    try {
      const generationConfig: Record<string, unknown> = {
        responseMimeType: "application/json",
      };
      if (typeof temperature === "number") {
        generationConfig.temperature = temperature;
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-goog-api-key": apiKey,
          },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig,
          }),
          signal: AbortSignal.timeout(timeoutMs),
        }
      );

      if (!response.ok) {
        lastStatus = response.status;
        const errBody = await response.text().catch(() => "");
        lastError = errBody || `HTTP ${response.status}`;

        // Invalid/unauthorized API key will fail for every model; abort early.
        if (response.status === 401 || response.status === 403) {
          console.warn(`[Gemini] ${model} rejected credentials (${response.status}).`);
          break;
        }

        if (isQuotaOrModelFallbackStatus(response.status, errBody)) {
          console.warn(
            `[Gemini] ${model} unavailable/quota (${response.status}), trying next model...`
          );
          continue;
        }

        console.warn(`[Gemini] ${model} non-OK status (${response.status}), trying next model...`);
        continue;
      }

      const payload = await response.json();
      const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText || typeof rawText !== "string") {
        lastError = "Empty Gemini response text";
        continue;
      }

      const parsed = JSON.parse(stripJsonCodeFences(rawText)) as T;
      return { ok: true, model, data: parsed };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini] ${model} error: ${lastError}, trying next model...`);
    }
  }

  return { ok: false, lastStatus, error: lastError };
}
