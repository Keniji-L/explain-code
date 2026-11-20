/**
 * Shared Gemini API helper with automatic model fallback on quota/rate-limit errors.
 * Runs exclusively on the server using GEMINI_API_KEY.
 */

export const GEMINI_MODEL_FALLBACK_CHAIN = [
  "gemini-3.5-flash-lite",
  "gemini-3.6-flash",
  "gemini-3.8-flash",
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

type GeminiContentPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

interface GeminiRawCallResult {
  ok: boolean;
  model?: string;
  rawText?: string;
  lastStatus?: number;
  error?: string;
}

async function requestGeminiWithFallback({
  apiKey,
  parts,
  responseMimeType,
  temperature,
  timeoutMs = 15000,
  models = GEMINI_MODEL_FALLBACK_CHAIN,
}: {
  apiKey: string;
  parts: GeminiContentPart[];
  responseMimeType?: string;
  temperature?: number;
  timeoutMs?: number;
  models?: readonly string[];
}): Promise<GeminiRawCallResult> {
  let lastStatus: number | undefined;
  let lastError: string | undefined;
  const overallDeadline = Date.now() + Math.min(25000, Math.max(timeoutMs, 22000));

  for (const model of models) {
    const remainingMs = overallDeadline - Date.now();
    if (remainingMs < 1500) {
      lastError = lastError || "Gemini fallback overall deadline reached";
      break;
    }
    const attemptTimeoutMs = Math.min(timeoutMs, remainingMs);
    try {
      const generationConfig: Record<string, unknown> = {};
      if (responseMimeType) {
        generationConfig.responseMimeType = responseMimeType;
      }
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
            contents: [{ parts }],
            generationConfig,
          }),
          signal: AbortSignal.timeout(attemptTimeoutMs),
        }
      );

      if (!response.ok) {
        lastStatus = response.status;
        const errBody = await response.text().catch(() => "");
        lastError = errBody || `HTTP ${response.status}`;

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

      return { ok: true, model, rawText };
    } catch (err) {
      lastError = err instanceof Error ? err.message : String(err);
      console.warn(`[Gemini] ${model} error: ${lastError}, trying next model...`);
    }
  }

  return { ok: false, lastStatus, error: lastError };
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
  const res = await requestGeminiWithFallback({
    apiKey,
    parts: [{ text: prompt }],
    responseMimeType: "application/json",
    temperature,
    timeoutMs,
    models,
  });
  if (!res.ok || !res.rawText) {
    return { ok: false, lastStatus: res.lastStatus, error: res.error };
  }
  const parsed = JSON.parse(stripJsonCodeFences(res.rawText)) as T;
  return { ok: true, model: res.model, data: parsed };
}

/**
 * Extracts code/text and problem context from an uploaded image or PDF using
 * Gemini multimodal Vision/OCR with the shared fallback chain.
 */
export async function callGeminiExtractFromMedia({
  apiKey,
  mimeType,
  base64Data,
  prompt,
  timeoutMs = 18000,
}: {
  apiKey: string;
  mimeType: string;
  base64Data: string;
  prompt: string;
  timeoutMs?: number;
}): Promise<{ ok: boolean; model?: string; text?: string; error?: string }> {
  const res = await requestGeminiWithFallback({
    apiKey,
    parts: [
      { text: prompt },
      { inlineData: { mimeType, data: base64Data } },
    ],
    temperature: 0.1,
    timeoutMs,
  });
  return {
    ok: res.ok,
    model: res.model,
    text: res.rawText?.trim(),
    error: res.error,
  };
}
