export interface DailyQuestState {
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: number;
  dailyFloorsCleared: number;
  dailyBonusClaimed: boolean;
}

const DAILY_QUEST_KEY_PREFIX = "explain_code_daily_quest_v1:";
export const DAILY_QUEST_TARGET_FLOORS = 1;
export const DAILY_QUEST_BONUS_XP = 50;

function getTodayDateString(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function getYesterdayDateString(date = new Date()): string {
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  return getTodayDateString(prev);
}

function getKey(userId?: string | null): string {
  return `${DAILY_QUEST_KEY_PREFIX}${userId?.trim() || "guest"}`;
}

export function loadDailyQuestState(userId?: string | null): DailyQuestState {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const fallback: DailyQuestState = {
    lastActiveDate: "",
    streakDays: 0,
    dailyFloorsCleared: 0,
    dailyBonusClaimed: false,
  };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(getKey(userId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<DailyQuestState>;
    const lastDate = typeof parsed.lastActiveDate === "string" ? parsed.lastActiveDate : "";
    const streak = typeof parsed.streakDays === "number" ? parsed.streakDays : 0;

    if (lastDate === today) {
      return {
        lastActiveDate: today,
        streakDays: Math.max(1, streak),
        dailyFloorsCleared:
          typeof parsed.dailyFloorsCleared === "number" ? parsed.dailyFloorsCleared : 0,
        dailyBonusClaimed: Boolean(parsed.dailyBonusClaimed),
      };
    }
    if (lastDate === yesterday) {
      return {
        lastActiveDate: yesterday,
        streakDays: streak,
        dailyFloorsCleared: 0,
        dailyBonusClaimed: false,
      };
    }
    return fallback;
  } catch {
    return fallback;
  }
}

export function recordDailyFloorClear(userId?: string | null): DailyQuestState {
  const today = getTodayDateString();
  const yesterday = getYesterdayDateString();
  const current = loadDailyQuestState(userId);
  const nextStreak =
    current.lastActiveDate === today
      ? Math.max(1, current.streakDays)
      : current.lastActiveDate === yesterday
      ? current.streakDays + 1
      : 1;

  const nextState: DailyQuestState = {
    lastActiveDate: today,
    streakDays: nextStreak,
    dailyFloorsCleared: current.dailyFloorsCleared + 1,
    dailyBonusClaimed: current.dailyBonusClaimed,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(getKey(userId), JSON.stringify(nextState));
    } catch {
      // ignore storage errors
    }
  }
  return nextState;
}

export function claimDailyQuestBonus(userId?: string | null): {
  claimed: boolean;
  bonusXp: number;
  state: DailyQuestState;
} {
  const current = loadDailyQuestState(userId);
  if (
    current.dailyFloorsCleared < DAILY_QUEST_TARGET_FLOORS ||
    current.dailyBonusClaimed
  ) {
    return { claimed: false, bonusXp: 0, state: current };
  }
  const nextState: DailyQuestState = {
    ...current,
    dailyBonusClaimed: true,
  };
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(getKey(userId), JSON.stringify(nextState));
    } catch {
      // ignore storage errors
    }
  }
  return { claimed: true, bonusXp: DAILY_QUEST_BONUS_XP, state: nextState };
}
