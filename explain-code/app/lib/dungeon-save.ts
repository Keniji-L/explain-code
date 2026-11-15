import { StudentRecord } from "./curriculum";
import { LearningLanguage } from "./language-tracks";
import type { DungeonRoom } from "./dungeon/mapgen";
import type { BattlePhaseResult } from "../components/dungeon/BattleOverlay";

export const STORAGE_DUNGEON_SAVES_KEY = "explain_code_dungeon_saves_v1";

export interface DungeonArenaSnapshot {
  topicId: number;
  language: LearningLanguage;
  room: DungeonRoom;
  hearts: number;
  coins: number;
  xp: number;
  chestBonusXp: number;
  chestBonusCoins: number;
  floorShieldBonus: number;
  floorRewardMultiplier: number;
  modifyBonusClaimed: boolean;
  isInBattle?: boolean;
  battlePhaseIndex: number;
  battleTotalPhases?: number;
  battlePhaseResults: BattlePhaseResult[];
  battleFocus?: number;
  battleShieldCharges?: number;
  battleAccumulatedXp: number;
  battleAccumulatedCoins: number;
}

export interface DungeonSaveRecord {
  userId: string;
  language: LearningLanguage;
  currentTopicId: number;
  currentTopicTitle: string;
  currentFloorNumber: number;
  totalFloors: number;
  currentPhaseNumber?: number;
  totalPhases?: number;
  completedTopicIds: number[];
  progressPercent?: number;
  xp: number;
  savedAt: string;
  history: StudentRecord["history"];
  arenaSnapshot?: DungeonArenaSnapshot | null;
}

export function calculateDungeonSaveProgressPercent(
  save: Pick<
    DungeonSaveRecord,
    | "totalFloors"
    | "completedTopicIds"
    | "currentFloorNumber"
    | "currentPhaseNumber"
    | "totalPhases"
    | "progressPercent"
    | "arenaSnapshot"
  >
): number {
  if (
    typeof save.progressPercent === "number" &&
    Number.isFinite(save.progressPercent) &&
    save.progressPercent > 0
  ) {
    return Math.max(1, Math.min(100, Math.round(save.progressPercent)));
  }

  const totalFloors = Math.max(1, save.totalFloors || 1);
  const completedCount = Array.isArray(save.completedTopicIds)
    ? save.completedTopicIds.length
    : 0;
  const priorFloors = Math.max(0, (save.currentFloorNumber || 1) - 1);
  const effectiveCompletedFloors = Math.min(
    totalFloors,
    Math.max(completedCount, priorFloors)
  );

  if (completedCount >= totalFloors) {
    return 100;
  }

  const totalPhases = Math.max(
    1,
    save.totalPhases || save.arenaSnapshot?.battleTotalPhases || 3
  );
  const currentPhase = Math.max(
    1,
    Math.min(
      totalPhases,
      save.currentPhaseNumber ||
        (save.arenaSnapshot?.battlePhaseIndex ?? 0) + 1
    )
  );

  const phaseFraction = Math.min(0.95, currentPhase / totalPhases);
  const rawPct =
    ((effectiveCompletedFloors + phaseFraction) / totalFloors) * 100;

  return Math.max(1, Math.min(100, Math.round(rawPct)));
}

function readAllDungeonSaves(): Record<string, DungeonSaveRecord[]> {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_DUNGEON_SAVES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export function loadUserDungeonSaves(userId: string): DungeonSaveRecord[] {
  if (!userId || typeof window === "undefined") return [];
  const all = readAllDungeonSaves();
  const list = all[userId];
  return Array.isArray(list) ? list : [];
}

export function loadUserDungeonSaveForLanguage(
  userId: string,
  language: LearningLanguage
): DungeonSaveRecord | null {
  const list = loadUserDungeonSaves(userId);
  return list.find((item) => item.language === language) || null;
}

export function saveUserDungeonProgress(
  userId: string,
  record: DungeonSaveRecord
): DungeonSaveRecord[] {
  if (!userId || typeof window === "undefined") return [];
  const all = readAllDungeonSaves();
  const existing = Array.isArray(all[userId]) ? all[userId] : [];
  const filtered = existing.filter((item) => item.language !== record.language);
  const nextList = [record, ...filtered];
  all[userId] = nextList;
  try {
    localStorage.setItem(STORAGE_DUNGEON_SAVES_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }

  // ซิงก์ขึ้น Supabase แบบ background (รองรับสลับเครื่องตอน Demo)
  try {
    void fetch("/api/lms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "save-dungeon-progress",
        record,
      }),
      keepalive: true,
    }).catch(() => {});
  } catch {
    // ignore network errors
  }

  return nextList;
}

export function mergeRemoteDungeonSaves(
  userId: string,
  remoteSaves: DungeonSaveRecord[]
): DungeonSaveRecord[] {
  if (!userId || typeof window === "undefined") return [];
  const localSaves = loadUserDungeonSaves(userId);
  if (!Array.isArray(remoteSaves) || remoteSaves.length === 0) {
    return localSaves;
  }

  const byLang = new Map<LearningLanguage, DungeonSaveRecord>();
  for (const item of localSaves) {
    if (item?.language) {
      byLang.set(item.language, item);
    }
  }
  for (const remote of remoteSaves) {
    if (!remote?.language) continue;
    const existing = byLang.get(remote.language);
    if (!existing) {
      byLang.set(remote.language, { ...remote, userId });
      continue;
    }
    const existingTime = Date.parse(existing.savedAt || "") || 0;
    const remoteTime = Date.parse(remote.savedAt || "") || 0;
    if (remoteTime >= existingTime) {
      byLang.set(remote.language, { ...remote, userId });
    }
  }

  const merged = Array.from(byLang.values()).sort(
    (a, b) => (Date.parse(b.savedAt || "") || 0) - (Date.parse(a.savedAt || "") || 0)
  );
  const all = readAllDungeonSaves();
  all[userId] = merged;
  try {
    localStorage.setItem(STORAGE_DUNGEON_SAVES_KEY, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
  return merged;
}
