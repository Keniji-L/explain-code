import { callGeminiGenerateJson, GEMINI_MODEL_FALLBACK_CHAIN } from "./gemini-client";
import { hashString } from "./dungeon/seed";

export interface ChoiceBalanceMetrics {
  balanced: boolean;
  correctLength: number;
  maxDistractorLength: number;
  minDistractorLength: number;
  avgDistractorLength: number;
  isCorrectStrictlyLongest: boolean;
  lengthDeltaFromMax: number;
  ratioToAvg: number;
}

/**
 * Evaluates whether the correct choice is noticeably longer than distractors,
 * which makes multiple-choice questions easy to guess by picking the longest option.
 */
export function measureChoiceLengthBalance(
  choices: string[],
  correctIndex: number
): ChoiceBalanceMetrics {
  const trimmed = choices.map((c) => String(c ?? "").trim());
  const safeIdx =
    correctIndex >= 0 && correctIndex < trimmed.length ? correctIndex : 0;
  const correctLength = trimmed[safeIdx]?.length ?? 0;
  const distractorLengths = trimmed
    .filter((_, idx) => idx !== safeIdx)
    .map((c) => c.length);

  const maxDistractorLength =
    distractorLengths.length > 0 ? Math.max(...distractorLengths) : 0;
  const minDistractorLength =
    distractorLengths.length > 0 ? Math.min(...distractorLengths) : 0;
  const avgDistractorLength =
    distractorLengths.length > 0
      ? distractorLengths.reduce((sum, len) => sum + len, 0) /
        distractorLengths.length
      : 0;

  const isCorrectStrictlyLongest = correctLength > maxDistractorLength;
  const lengthDeltaFromMax = correctLength - maxDistractorLength;
  const ratioToAvg =
    avgDistractorLength > 0 ? correctLength / avgDistractorLength : 1;

  // Short token answers (e.g., numbers, booleans, identifiers like "10", "true", "undefined")
  // naturally vary by a few characters, but a large gap (e.g., "10 (ค่าเริ่มต้น)" vs "10")
  // is still an obvious length giveaway.
  if (
    correctLength <= 16 &&
    maxDistractorLength <= 20 &&
    lengthDeltaFromMax < 8
  ) {
    return {
      balanced: true,
      correctLength,
      maxDistractorLength,
      minDistractorLength,
      avgDistractorLength,
      isCorrectStrictlyLongest,
      lengthDeltaFromMax,
      ratioToAvg,
    };
  }

  const noticeablyLonger =
    isCorrectStrictlyLongest &&
    (lengthDeltaFromMax >= 10 || ratioToAvg >= 1.25);

  return {
    balanced: !noticeablyLonger,
    correctLength,
    maxDistractorLength,
    minDistractorLength,
    avgDistractorLength,
    isCorrectStrictlyLongest,
    lengthDeltaFromMax,
    ratioToAvg,
  };
}

/**
 * Removes trailing parenthetical or dash-separated elaborations that AI models
 * frequently append only to the correct answer (e.g. "คำตอบหลัก (คำอธิบายเสริม)").
 * Preserves function-call syntax like "sum(a, b)".
 */
export function trimTrailingElaboration(choice: string): string {
  const trimmed = choice.trim();
  if (trimmed.length < 10) return trimmed;

  // Strip trailing parenthetical preceded by whitespace: "text (extra detail)"
  const parenStripped = trimmed.replace(/\s+[（(][^()（）]{5,}[)）]$/, "").trim();
  if (parenStripped.length >= 1 && parenStripped.length < trimmed.length) {
    return parenStripped;
  }

  // Strip trailing em-dash / en-dash / spaced-hyphen elaboration: "text — extra detail"
  const dashStripped = trimmed.replace(/\s+[—–-]\s+[^—–-]{8,}$/, "").trim();
  if (dashStripped.length >= 4 && dashStripped.length < trimmed.length) {
    return dashStripped;
  }

  return trimmed;
}

const thaiWordSegmenter =
  typeof Intl !== "undefined" && typeof Intl.Segmenter === "function"
    ? new Intl.Segmenter("th", { granularity: "word" })
    : null;

/**
 * Condenses a long prose explanation into a concise choice string at a natural
 * sentence or word boundary (using Intl.Segmenter for Thai) so deterministic
 * fallback choices stay comparable in length without chopping words in half.
 */
export function condenseProseForChoice(text: string, maxChars = 72): string {
  const cleaned = text.replace(/\s+/g, " ").trim();
  if (cleaned.length <= maxChars) return cleaned;

  const minAcceptable = Math.max(12, Math.floor(maxChars * 0.45));

  // Prefer stopping at first sentence boundary if it's long enough
  const sentenceMatch = cleaned.match(/^(.+?[.!?。])\s+/);
  if (
    sentenceMatch &&
    sentenceMatch[1].length >= minAcceptable &&
    sentenceMatch[1].length <= maxChars
  ) {
    return sentenceMatch[1].trim();
  }

  // Use Intl.Segmenter when available to respect Thai & English word boundaries
  if (thaiWordSegmenter) {
    let acc = "";
    for (const { segment } of thaiWordSegmenter.segment(cleaned)) {
      if (acc.length + segment.length > maxChars) break;
      acc += segment;
    }
    const segTrimmed = acc.trim();
    if (segTrimmed.length >= minAcceptable) {
      return segTrimmed;
    }
  }

  // Fallback: cut at a natural space boundary within maxChars
  const slice = cleaned.slice(0, maxChars);
  const lastSpace = slice.lastIndexOf(" ");
  if (lastSpace >= minAcceptable) {
    return slice.slice(0, lastSpace).trim();
  }

  return slice.trim();
}

/**
 * Shuffles choices while keeping track of the correctIndex.
 * Uses a deterministic permutation when `seed` is provided, or random otherwise.
 */
export function shuffleChoicesPreservingCorrect(
  choices: string[],
  correctIndex: number,
  seed?: string
): { choices: string[]; correctIndex: number } {
  const n = choices.length;
  if (n <= 1) {
    return { choices: [...choices], correctIndex: 0 };
  }

  const safeCorrect =
    correctIndex >= 0 && correctIndex < n ? correctIndex : 0;
  const indices = Array.from({ length: n }, (_, i) => i);

  if (seed !== undefined) {
    let state = hashString(seed) || 1;
    for (let i = n - 1; i > 0; i--) {
      state = (state * 1664525 + 1013904223) >>> 0;
      const j = state % (i + 1);
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  } else {
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [indices[i], indices[j]] = [indices[j], indices[i]];
    }
  }

  const shuffled = indices.map((idx) => choices[idx]);
  const newCorrectIndex = indices.indexOf(safeCorrect);
  return {
    choices: shuffled,
    correctIndex: newCorrectIndex >= 0 ? newCorrectIndex : 0,
  };
}

export interface RebalanceWithGeminiOptions {
  apiKey: string;
  question: string;
  choices: string[];
  correctIndex: number;
  uiLang?: "th" | "en";
  avoidCommas?: boolean;
  preserveCorrectText?: boolean;
  timeoutMs?: number;
}

/**
 * Attempts a fast local trim first; if the correct choice is still noticeably
 * longer than distractors, asks Gemini to rewrite the choices to have
 * uniform length and detail while preserving meaning and correctness.
 */
export async function rebalanceChoicesIfNeeded({
  apiKey,
  question,
  choices,
  correctIndex,
  uiLang = "th",
  avoidCommas = false,
  preserveCorrectText = false,
  timeoutMs = 5500,
}: RebalanceWithGeminiOptions): Promise<{
  choices: string[];
  correctIndex: number;
  rebalanced: boolean;
}> {
  const working = choices.map((c) => String(c ?? "").trim());
  const safeIdx =
    correctIndex >= 0 && correctIndex < working.length ? correctIndex : 0;

  const initialMetrics = measureChoiceLengthBalance(working, safeIdx);
  if (initialMetrics.balanced) {
    return { choices: working, correctIndex: safeIdx, rebalanced: false };
  }

  // Step 1: Try trimming trailing parenthetical/dash elaboration on the correct choice
  if (!preserveCorrectText) {
    const trimmedCorrect = trimTrailingElaboration(working[safeIdx]);
    if (
      trimmedCorrect !== working[safeIdx] &&
      !working.some((c, i) => i !== safeIdx && c === trimmedCorrect)
    ) {
      const afterTrim = [...working];
      afterTrim[safeIdx] = trimmedCorrect;
      const afterMetrics = measureChoiceLengthBalance(afterTrim, safeIdx);
      if (afterMetrics.balanced) {
        return { choices: afterTrim, correctIndex: safeIdx, rebalanced: true };
      }
      working[safeIdx] = trimmedCorrect;
    }
  }

  if (!apiKey || !apiKey.trim()) {
    return { choices: working, correctIndex: safeIdx, rebalanced: false };
  }

  // Step 2: Fast targeted Gemini rewrite of only the 4 choices
  const currentMetrics = measureChoiceLengthBalance(working, safeIdx);
  const targetLen = preserveCorrectText
    ? Math.max(16, currentMetrics.correctLength)
    : Math.min(
        75,
        Math.max(
          24,
          Math.round(
            (currentMetrics.correctLength + currentMetrics.avgDistractorLength) / 2
          )
        )
      );

  const isEn = uiLang === "en";
  const prompt = isEn
    ? `Rewrite these 4 multiple-choice options so all 4 options have very similar character length (around ${targetLen} characters each) and equal level of detail.
CRITICAL RULES:
${preserveCorrectText ? `- Keep the correct option at index ${safeIdx} (${JSON.stringify(working[safeIdx])}) EXACTLY unchanged, and rewrite ONLY the 3 distractor options to match its length and format.` : `- The correct option (currently index ${safeIdx}) MUST NOT be the longest option. Make distractors equally specific and detailed, and make the correct option concise.`}
- Preserve the exact meaning of each option and keep all 4 options distinct.
${avoidCommas ? "- Avoid commas (,) inside each option text." : ""}
- Return ONLY valid JSON: { "choices": ["...", "...", "...", "..."], "correctIndex": ${safeIdx} }

Question: ${question}
Current choices: ${JSON.stringify(working)}
Current correctIndex: ${safeIdx}`
    : `ปรับเขียนตัวเลือก 4 ข้อต่อไปนี้ใหม่ ให้ทั้ง 4 ตัวเลือกมีความยาวตัวอักษรและระดับความละเอียดใกล้เคียงกันมาก (ประมาณข้อละ ${targetLen} ตัวอักษร)
กติกาบังคับ:
${preserveCorrectText ? `- ห้ามแก้ไขข้อความของข้อที่ถูกต้อง (index ${safeIdx}: ${JSON.stringify(working[safeIdx])}) เด็ดขาด ให้ปรับเฉพาะตัวลวงอีก 3 ข้อให้มีรูปแบบและความยาวใกล้เคียงกับข้อที่ถูก` : `- ห้ามให้ข้อที่ถูกต้อง (index ${safeIdx}) ยาวที่สุดเด็ดขาด ให้กระชับข้อที่ถูกต้อง และเพิ่มรายละเอียดข้อลวงให้สมจริงและยาวพอๆ กัน`}
- คงความหมายเดิมที่ถูกต้องของคำตอบและตัวลวงไว้ครบถ้วน และห้ามซ้ำกัน
${avoidCommas ? "- หลีกเลี่ยงการใช้เครื่องหมายจุลภาค (,) ภายในข้อความตัวเลือก" : ""}
- ตอบกลับเป็น JSON เท่านั้น: { "choices": ["...", "...", "...", "..."], "correctIndex": ${safeIdx} }

คำถาม: ${question}
ตัวเลือกเดิม: ${JSON.stringify(working)}
correctIndex เดิม: ${safeIdx}`;

  try {
    const res = await callGeminiGenerateJson<{
      choices?: unknown;
      correctIndex?: unknown;
    }>({
      apiKey,
      prompt,
      temperature: 0.2,
      timeoutMs,
      models: GEMINI_MODEL_FALLBACK_CHAIN,
    });

    if (res.ok && res.data && Array.isArray(res.data.choices)) {
      const candidateChoices = res.data.choices
        .map((c) => String(c ?? "").trim())
        .filter(Boolean)
        .slice(0, 4);

      if (
        candidateChoices.length === 4 &&
        new Set(candidateChoices).size === 4
      ) {
        const candidateIdx =
          typeof res.data.correctIndex === "number" &&
          Number.isInteger(res.data.correctIndex) &&
          res.data.correctIndex >= 0 &&
          res.data.correctIndex < 4
            ? res.data.correctIndex
            : safeIdx;

        if (
          preserveCorrectText &&
          candidateChoices[candidateIdx] !== working[safeIdx]
        ) {
          return { choices: working, correctIndex: safeIdx, rebalanced: false };
        }

        const newMetrics = measureChoiceLengthBalance(
          candidateChoices,
          candidateIdx
        );

        // Accept if balanced or strictly improved (smaller delta/ratio)
        if (
          newMetrics.balanced ||
          newMetrics.lengthDeltaFromMax < currentMetrics.lengthDeltaFromMax
        ) {
          return {
            choices: candidateChoices,
            correctIndex: candidateIdx,
            rebalanced: true,
          };
        }
      }
    }
  } catch {
    // Fall through to returning best local version
  }

  return { choices: working, correctIndex: safeIdx, rebalanced: false };
}
