import { BlockCellId, BlockQuestion, ModifyChallenge, TopicQuest, TraceStep } from "./curriculum";
import { DungeonQuestion, DungeonTraceStep } from "./dungeon/questions";
import { LearningLanguage } from "./language-tracks";

export interface CustomDungeonPayload {
  id: string;
  ownerUserId?: string;
  title: string;
  subtitle: string;
  language: LearningLanguage;
  code: string;
  summary: string;
  keyConcepts: string[];
  topic: TopicQuest;
  questions: DungeonQuestion[];
  provider: "ai-api" | "mock-generator";
  createdAt: string;
}

export const CUSTOM_DUNGEON_STORAGE_KEY = "explain_code_custom_dungeons_v1";
export const ACTIVE_CUSTOM_DUNGEON_KEY = "explain_code_active_custom_dungeon_v1";
const AUTH_SESSION_STORAGE_KEY = "explain_code_auth_session_v2";
const MAX_SAVED_CUSTOM_DUNGEONS = 20;

function resolveAccountUserId(explicitUserId?: string | null): string | null {
  if (typeof window === "undefined") return null;
  if (explicitUserId !== undefined) {
    const trimmed = explicitUserId?.trim();
    return trimmed ? trimmed : null;
  }
  try {
    const rawSession = window.localStorage.getItem(AUTH_SESSION_STORAGE_KEY);
    if (!rawSession) return null;
    const parsed = JSON.parse(rawSession) as { userId?: unknown } | null;
    if (parsed && typeof parsed.userId === "string" && parsed.userId.trim()) {
      return parsed.userId.trim();
    }
    return null;
  } catch {
    return null;
  }
}

function getUserCustomDungeonsKey(userId: string): string {
  return `${CUSTOM_DUNGEON_STORAGE_KEY}:${userId}`;
}

function getUserActiveCustomDungeonKey(userId: string): string {
  return `${ACTIVE_CUSTOM_DUNGEON_KEY}:${userId}`;
}

const SUPPORTED_LANGUAGES: ReadonlySet<LearningLanguage> = new Set([
  "javascript",
  "typescript",
  "python",
  "java",
  "cpp",
  "sql",
  "html",
]);

export function normalizeLearningLanguage(rawLang?: string | null): LearningLanguage {
  const lower = (rawLang || "").toLowerCase().trim();
  if (SUPPORTED_LANGUAGES.has(lower as LearningLanguage)) {
    return lower as LearningLanguage;
  }
  if (lower.includes("python") || lower === "py") return "python";
  if (lower.includes("typescript") || lower === "ts") return "typescript";
  if (lower.includes("java") && !lower.includes("javascript")) return "java";
  if (lower.includes("c++") || lower.includes("cpp") || lower === "c") return "cpp";
  if (lower.includes("sql")) return "sql";
  if (lower.includes("html") || lower.includes("css")) return "html";
  return "javascript";
}

export function loadCustomDungeons(userId?: string | null): CustomDungeonPayload[] {
  const uid = resolveAccountUserId(userId);
  if (!uid || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(getUserCustomDungeonsKey(uid));
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (item): item is CustomDungeonPayload =>
        Boolean(
          item &&
            typeof item === "object" &&
            typeof item.id === "string" &&
            typeof item.code === "string" &&
            item.topic &&
            Array.isArray(item.questions) &&
            (!item.ownerUserId || item.ownerUserId === uid)
        )
    );
  } catch {
    return [];
  }
}

export function saveCustomDungeon(
  dungeon: CustomDungeonPayload,
  userId?: string | null
): boolean {
  const uid = resolveAccountUserId(userId);
  if (!uid || typeof window === "undefined") return false;
  try {
    const ownedDungeon: CustomDungeonPayload = {
      ...dungeon,
      ownerUserId: uid,
    };
    const existing = loadCustomDungeons(uid).filter((d) => d.id !== ownedDungeon.id);
    const next = [ownedDungeon, ...existing].slice(0, MAX_SAVED_CUSTOM_DUNGEONS);
    window.localStorage.setItem(getUserCustomDungeonsKey(uid), JSON.stringify(next));
    window.localStorage.setItem(
      getUserActiveCustomDungeonKey(uid),
      JSON.stringify(ownedDungeon)
    );

    // ซิงก์ขึ้น Supabase แบบ background (รองรับสลับเครื่องตอน Demo)
    try {
      void fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save-custom-dungeon",
          dungeon: ownedDungeon,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore network errors
    }

    return true;
  } catch {
    // ignore storage quota errors
    return false;
  }
}

export function getCustomDungeonById(
  id: string,
  userId?: string | null
): CustomDungeonPayload | null {
  const uid = resolveAccountUserId(userId);
  if (!id || !uid) return null;
  const list = loadCustomDungeons(uid);
  const matched = list.find((d) => d.id === id);
  if (matched) return matched;

  const active = getActiveCustomDungeon(uid);
  if (active && active.id === id) return active;
  return null;
}

export function getActiveCustomDungeon(
  userId?: string | null
): CustomDungeonPayload | null {
  const uid = resolveAccountUserId(userId);
  if (!uid || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getUserActiveCustomDungeonKey(uid));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === "object" &&
      typeof parsed.id === "string" &&
      parsed.topic &&
      Array.isArray(parsed.questions) &&
      (!parsed.ownerUserId || parsed.ownerUserId === uid)
    ) {
      return parsed as CustomDungeonPayload;
    }
    return null;
  } catch {
    return null;
  }
}

export function setActiveCustomDungeon(
  dungeon: CustomDungeonPayload | null,
  userId?: string | null
): void {
  const uid = resolveAccountUserId(userId);
  if (!uid || typeof window === "undefined") return;
  try {
    if (!dungeon) {
      window.localStorage.removeItem(getUserActiveCustomDungeonKey(uid));
    } else {
      const ownedDungeon: CustomDungeonPayload = {
        ...dungeon,
        ownerUserId: uid,
      };
      window.localStorage.setItem(
        getUserActiveCustomDungeonKey(uid),
        JSON.stringify(ownedDungeon)
      );
    }
  } catch {
    // ignore
  }
}

export function deleteCustomDungeon(
  id: string,
  userId?: string | null
): CustomDungeonPayload[] {
  const uid = resolveAccountUserId(userId);
  if (!uid || typeof window === "undefined") return [];
  try {
    const next = loadCustomDungeons(uid).filter((d) => d.id !== id);
    window.localStorage.setItem(getUserCustomDungeonsKey(uid), JSON.stringify(next));
    const active = getActiveCustomDungeon(uid);
    if (active && active.id === id) {
      window.localStorage.removeItem(getUserActiveCustomDungeonKey(uid));
    }
    try {
      void fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-custom-dungeon",
          dungeonId: id,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // ignore network errors
    }
    return next;
  } catch {
    return [];
  }
}

export function mergeRemoteCustomDungeons(
  remoteDungeons: CustomDungeonPayload[],
  userId?: string | null
): CustomDungeonPayload[] {
  const uid = resolveAccountUserId(userId);
  if (!uid || typeof window === "undefined") return [];
  const local = loadCustomDungeons(uid);
  if (!Array.isArray(remoteDungeons) || remoteDungeons.length === 0) {
    return local;
  }

  const byId = new Map<string, CustomDungeonPayload>();
  for (const item of local) {
    if (item?.id) byId.set(item.id, item);
  }
  for (const remote of remoteDungeons) {
    if (remote?.id && !byId.has(remote.id)) {
      byId.set(remote.id, { ...remote, ownerUserId: uid });
    }
  }

  const merged = Array.from(byId.values())
    .sort(
      (a, b) =>
        (Date.parse(b.createdAt || "") || 0) - (Date.parse(a.createdAt || "") || 0)
    )
    .slice(0, MAX_SAVED_CUSTOM_DUNGEONS);

  try {
    window.localStorage.setItem(getUserCustomDungeonsKey(uid), JSON.stringify(merged));
  } catch {
    // ignore storage errors
  }
  return merged;
}

export function encodeCustomDungeonShareToken(
  dungeon: CustomDungeonPayload
): string {
  const code = (dungeon.code || "").slice(0, 900);
  const subtitle = (dungeon.subtitle || "").slice(0, 90);

  const compactQuestions = (dungeon.questions || []).slice(0, 3).map((q) => ({
    question: (q.question || "").slice(0, 130),
    ...(q.codeSnippet && q.codeSnippet !== dungeon.code
      ? { codeSnippet: q.codeSnippet.slice(0, 600) }
      : {}),
    choices: (q.choices || []).slice(0, 4).map((c) => String(c).slice(0, 75)),
    correctIndex: q.correctIndex,
    explanation: (q.explanation || "").slice(0, 90),
    ...(q.difficulty && q.difficulty !== "medium"
      ? { difficulty: q.difficulty }
      : {}),
    blockModelCell: q.blockModelCell,
    ...(q.hint ? { hint: q.hint.slice(0, 65) } : {}),
    ...(q.expectedOutput ? { expectedOutput: q.expectedOutput.slice(0, 60) } : {}),
  }));

  const payload = {
    title: (dungeon.title || "").slice(0, 75),
    subtitle,
    language: dungeon.language,
    code,
    keyConcepts: (dungeon.keyConcepts || []).slice(0, 3),
    topic: {
      id: typeof dungeon.topic?.id === "number" ? dungeon.topic.id : 9001,
      ...(dungeon.topic?.isBoss ? { isBoss: true } : {}),
    },
    questions: compactQuestions,
    ...(dungeon.provider === "ai-api" ? { provider: "ai-api" } : {}),
  };

  const json = JSON.stringify(payload);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64url = btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `CD1:${base64url}`;
}

export function decodeCustomDungeonShareToken(
  rawInput: string
): CustomDungeonPayload | null {
  try {
    let token = rawInput.trim();
    if (!token) return null;
    if (token.includes("shareDungeon=")) {
      const url = new URL(
        token.startsWith("http") ? token : `https://example.com/${token.replace(/^\/+/, "")}`
      );
      const param = url.searchParams.get("shareDungeon");
      if (param) token = param.trim();
    }
    if (/^CD1%3A/i.test(token)) {
      try {
        token = decodeURIComponent(token);
      } catch {
        // keep original token
      }
    }
    if (!token.startsWith("CD1:")) return null;

    const base64 = token
      .slice(4)
      .replace(/-/g, "+")
      .replace(/_/g, "/");
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
    const binary = atob(padded);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) {
      bytes[i] = binary.charCodeAt(i);
    }
    const parsed = JSON.parse(new TextDecoder().decode(bytes)) as Partial<CustomDungeonPayload>;
    if (
      !parsed ||
      typeof parsed.title !== "string" ||
      !Array.isArray(parsed.questions) ||
      parsed.questions.length === 0
    ) {
      return null;
    }
    const lang: LearningLanguage = SUPPORTED_LANGUAGES.has(
      parsed.language as LearningLanguage
    )
      ? (parsed.language as LearningLanguage)
      : "javascript";

    const code = typeof parsed.code === "string" ? parsed.code : "";
    const subtitle = typeof parsed.subtitle === "string" ? parsed.subtitle : "";
    const summary =
      typeof parsed.summary === "string" && parsed.summary
        ? parsed.summary
        : subtitle;
    const rawTopic = (parsed.topic || {}) as Partial<TopicQuest>;
    const rawSteps = Array.isArray(rawTopic.steps) ? rawTopic.steps : [];

    const hydratedSteps: TraceStep[] =
      rawSteps.length > 0
        ? rawSteps.map((s, idx) => ({
            stepNumber: typeof s.stepNumber === "number" ? s.stepNumber : idx + 1,
            line: typeof s.line === "number" ? s.line : idx + 1,
            codeLine: typeof s.codeLine === "string" ? s.codeLine : "",
            variables:
              s.variables && typeof s.variables === "object" ? s.variables : {},
            outputSoFar: Array.isArray(s.outputSoFar) ? s.outputSoFar : [],
            explanation: typeof s.explanation === "string" ? s.explanation : "",
          }))
        : (() => {
            const codeLines = code
              .split(/\r?\n/)
              .map((rawLine, idx) => ({ line: idx + 1, text: rawLine.trim() }))
              .filter((item) => item.text.length > 0)
              .slice(0, 6);
            if (codeLines.length === 0) {
              return [
                {
                  stepNumber: 1,
                  line: 1,
                  codeLine: "// code",
                  variables: {},
                  outputSoFar: [],
                  explanation: summary || parsed.title,
                },
              ];
            }
            return codeLines.map((item, idx) => ({
              stepNumber: idx + 1,
              line: item.line,
              codeLine: item.text,
              variables: {},
              outputSoFar: [],
              explanation: `ประมวลผลคำสั่งบรรทัดที่ ${item.line}: ${item.text}`,
            }));
          })();

    const dungeonTraceSteps: DungeonTraceStep[] = hydratedSteps.map((s) => ({
      line: s.line,
      codeLine: s.codeLine,
      variables: s.variables,
      explanation: s.explanation,
    }));

    const hydratedQuestions: DungeonQuestion[] = parsed.questions.map((q, idx) => {
      const cell: BlockCellId =
        typeof q.blockModelCell === "string" &&
        /^[TEF][1-4]$/.test(q.blockModelCell)
          ? (q.blockModelCell as BlockCellId)
          : idx === 0
          ? "E4"
          : idx === 1
          ? "T1"
          : "F2";
      const choices =
        Array.isArray(q.choices) && q.choices.length > 0
          ? q.choices.map((c) => String(c))
          : ["A", "B", "C", "D"];
      const correctIndex =
        typeof q.correctIndex === "number" &&
        q.correctIndex >= 0 &&
        q.correctIndex < choices.length
          ? q.correctIndex
          : 0;

      return {
        id: typeof q.id === "string" && q.id ? q.id : `custom-phase-${idx + 1}`,
        language: lang,
        question: typeof q.question === "string" ? q.question : `Phase ${idx + 1}`,
        questionEn:
          typeof q.questionEn === "string" ? q.questionEn : q.question,
        codeSnippet:
          typeof q.codeSnippet === "string" && q.codeSnippet.length > 0
            ? q.codeSnippet
            : code,
        choices,
        correctIndex,
        explanation: typeof q.explanation === "string" ? q.explanation : summary,
        difficulty:
          q.difficulty === "easy" ||
          q.difficulty === "medium" ||
          q.difficulty === "hard"
            ? q.difficulty
            : "medium",
        blockModelCell: cell,
        hint: typeof q.hint === "string" ? q.hint : undefined,
        traceSteps:
          Array.isArray(q.traceSteps) && q.traceSteps.length > 0
            ? q.traceSteps
            : dungeonTraceSteps,
        expectedOutput:
          typeof q.expectedOutput === "string" ? q.expectedOutput : undefined,
        phaseLabel:
          typeof q.phaseLabel === "string" ? q.phaseLabel : undefined,
      };
    });

    const topicId = typeof rawTopic.id === "number" ? rawTopic.id : 9001;
    const firstQ = hydratedQuestions[0];
    const hydratedBlockQuestions: BlockQuestion[] =
      Array.isArray(rawTopic.questions) && rawTopic.questions.length > 0
        ? rawTopic.questions
        : hydratedQuestions.map((q, idx) => ({
            id: q.id,
            cellId: (q.blockModelCell as BlockCellId) || "E4",
            targetLine: hydratedSteps[idx]?.line || 1,
            question: q.question,
            options: q.choices.map((text, cIdx) => ({
              id: `opt-${cIdx}`,
              text,
            })),
            correctOptionId: `opt-${q.correctIndex}`,
            hint: q.hint || "",
            explanation: q.explanation,
          }));

    const defaultModifyChallenge: ModifyChallenge = {
      instruction:
        "ลองแก้ไขค่าตัวแปรหรือเงื่อนไขในโค้ดนี้ แล้วกดรันทดสอบผลลัพธ์",
      suggestedCode: code,
      changeDescription:
        "แก้ไขค่าตั้งต้นหรือเงื่อนไข 1 จุด แล้วสังเกตผลลัพธ์ที่เปลี่ยนไป",
      options: [],
      explanation:
        "การลองแก้ค่าตั้งต้นช่วยให้เข้าใจความสัมพันธ์ของตัวแปรและผลลัพธ์มากขึ้น",
    };

    const hydratedTopic: TopicQuest = {
      id: topicId,
      title: typeof rawTopic.title === "string" ? rawTopic.title : parsed.title,
      shortName:
        typeof rawTopic.shortName === "string"
          ? rawTopic.shortName
          : parsed.title.slice(0, 28),
      isBoss: Boolean(rawTopic.isBoss),
      subtitle:
        typeof rawTopic.subtitle === "string" ? rawTopic.subtitle : subtitle,
      aiScenario:
        typeof rawTopic.aiScenario === "string" ? rawTopic.aiScenario : summary,
      code: typeof rawTopic.code === "string" ? rawTopic.code : code,
      predictPrompt:
        typeof rawTopic.predictPrompt === "string"
          ? rawTopic.predictPrompt
          : firstQ?.question || subtitle,
      predictOptions:
        Array.isArray(rawTopic.predictOptions) && rawTopic.predictOptions.length > 0
          ? rawTopic.predictOptions
          : firstQ?.choices || [],
      predictExplanation:
        typeof rawTopic.predictExplanation === "string"
          ? rawTopic.predictExplanation
          : firstQ?.explanation || summary,
      steps: hydratedSteps,
      questions: hydratedBlockQuestions,
      modifyChallenge: rawTopic.modifyChallenge || defaultModifyChallenge,
      badgeReward: rawTopic.badgeReward || {
        id: `custom-${topicId}`,
        name: "ผู้พิชิตดันเจี้ยนโค้ดส่วนตัว",
        description: "พิชิตดันเจี้ยนที่สร้างขึ้นจากโค้ดของคุณเองได้สำเร็จ",
      },
    };

    return {
      id: `shared-${Date.now().toString(36)}`,
      title: parsed.title,
      subtitle,
      language: lang,
      code,
      summary,
      keyConcepts: Array.isArray(parsed.keyConcepts) ? parsed.keyConcepts : [],
      topic: hydratedTopic,
      questions: hydratedQuestions,
      provider: parsed.provider === "ai-api" ? "ai-api" : "mock-generator",
      createdAt: new Date().toISOString(),
    };
  } catch {
    return null;
  }
}
