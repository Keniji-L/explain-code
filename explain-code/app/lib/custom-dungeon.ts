import { TopicQuest } from "./curriculum";
import { DungeonQuestion } from "./dungeon/questions";
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
    return next;
  } catch {
    return [];
  }
}
