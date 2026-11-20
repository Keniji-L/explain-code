import {
  ClientAuthSession,
  STORAGE_SESSION_KEY,
  setClientSession,
} from "../components/SiteHeader";

export const LANGMIND_PUBLIC_AGENT_URL =
  "https://langmind.in.th/public/agents/f2bad4ec-9dcb-44f7-946b-00b88dd4c73c/chat";

export const OPEN_LANGMIND_DOCK_EVENT = "code-cool-open-langmind-dock";
export const CLOSE_LANGMIND_DOCK_EVENT = "code-cool-close-langmind-dock";
export const CLOSE_JUDGE_DOCK_EVENT = "code-cool-close-judge-dock";

export type JudgeDemoRole = "student" | "teacher";

export interface JudgeDemoCredential {
  identifier: string;
  secret: string;
  roomCode?: string;
}

export const JUDGE_DEMO_ACCOUNTS: Record<
  JudgeDemoRole,
  {
    primaryLabelTh: string;
    primaryLabelEn: string;
    credentialDisplay: string;
    defaultPath: string;
    credentials: readonly JudgeDemoCredential[];
  }
> = {
  student: {
    primaryLabelTh: "ต้นกล้า_สายโค้ด",
    primaryLabelEn: "Tonkla_Coder (Demo Student)",
    credentialDisplay: "ต้นกล้า_สายโค้ด · PIN 1234",
    defaultPath: "/my-learning",
    credentials: [
      { identifier: "ต้นกล้า_สายโค้ด", secret: "1234", roomCode: "VIBE26" },
      { identifier: "แมวส้ม", secret: "1234", roomCode: "ABC123" },
    ],
  },
  teacher: {
    primaryLabelTh: "ครูตัวอย่าง",
    primaryLabelEn: "Demo Teacher",
    credentialDisplay: "ครูตัวอย่าง · 12345678",
    defaultPath: "/teacher",
    credentials: [
      { identifier: "ครูตัวอย่าง", secret: "12345678" },
      { identifier: "ครูสมชาย", secret: "12345678" },
    ],
  },
};

/**
 * Resolves a safe post-login redirect path for judge demo logins.
 * Prevents open redirects and role mismatches (e.g. demo student redirected to /teacher).
 */
export function resolveJudgeRedirectPath(
  role: JudgeDemoRole,
  redirectPath?: string | null
): string {
  const defaultPath = JUDGE_DEMO_ACCOUNTS[role].defaultPath;
  const raw = (redirectPath || "").trim();
  if (!raw || !raw.startsWith("/") || raw.startsWith("//") || raw.includes("\\")) {
    return defaultPath;
  }

  const pathnameOnly = raw.split("?")[0].split("#")[0];
  if (
    pathnameOnly === "/login" ||
    pathnameOnly.startsWith("/login/") ||
    pathnameOnly === "/register" ||
    pathnameOnly.startsWith("/register/")
  ) {
    return defaultPath;
  }

  if (role === "student") {
    if (pathnameOnly === "/teacher" || pathnameOnly.startsWith("/teacher/")) {
      return defaultPath;
    }
    return raw;
  }

  // Teacher demo button: avoid redirecting into student-only learning pages if coming from a stale student redirect
  if (
    pathnameOnly === "/my-learning" ||
    pathnameOnly.startsWith("/my-learning/") ||
    pathnameOnly === "/my-history" ||
    pathnameOnly.startsWith("/my-history/")
  ) {
    return defaultPath;
  }
  return raw;
}

export function openGlobalLangMindDock(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_LANGMIND_DOCK_EVENT));
}

export interface JudgeSignInResult {
  ok: boolean;
  session?: ClientAuthSession;
  targetPath?: string;
  source?: string;
  error?: string;
}

/**
 * Signs in as a sanctioned competition demo account via POST /api/auth.
 * Strictly relies on existing /api/auth credentials and server-issued HttpOnly session cookies.
 */
export async function signInAsJudgeDemo(
  role: JudgeDemoRole,
  options?: {
    redirectPath?: string | null;
    fetchImpl?: typeof fetch;
  }
): Promise<JudgeSignInResult> {
  const fetcher = options?.fetchImpl || fetch;
  const targetPath = resolveJudgeRedirectPath(role, options?.redirectPath);
  const candidates = JUDGE_DEMO_ACCOUNTS[role].credentials;
  let lastError = "";

  for (const cred of candidates) {
    try {
      const res = await fetcher("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "unified-login",
          identifier: cred.identifier,
          secret: cred.secret,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok || !data?.authenticated) {
        lastError = data?.error || `HTTP ${res.status}`;
        continue;
      }

      if (role === "teacher") {
        if (data.role !== "teacher" && data.role !== "admin") {
          lastError = "Demo teacher account did not resolve to teacher role.";
          continue;
        }
        const status = data.teacher?.teacherStatus || data.teacherStatus || "approved";
        if (data.role === "teacher" && status !== "approved") {
          lastError = "Demo teacher account is not approved.";
          continue;
        }
        const teacherObj = data.teacher || {};
        const session: ClientAuthSession = {
          role: data.role,
          userId: teacherObj.id || `tch-${cred.identifier}`,
          username: teacherObj.username || cred.identifier,
          displayName: teacherObj.displayName || teacherObj.username || cred.identifier,
          teacherStatus: status,
        };
        return {
          ok: true,
          session,
          targetPath,
          source: data.source || "unknown",
        };
      }

      if (data.role !== "student") {
        lastError = "Demo student account did not resolve to student role.";
        continue;
      }

      const studentObj = data.student || {};
      const session: ClientAuthSession = {
        role: "student",
        userId: studentObj.id || `stu-${cred.identifier}`,
        username: studentObj.nickname || cred.identifier,
        displayName: studentObj.nickname || cred.identifier,
        roomCode: studentObj.roomCode || cred.roomCode || "VIBE26",
      };
      return {
        ok: true,
        session,
        targetPath,
        source: data.source || "unknown",
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error";
    }
  }

  // Fallback for student role: register a fresh PDPA-compliant demo account via /api/auth
  if (role === "student") {
    try {
      const suffix = Math.floor(1000 + Math.random() * 9000);
      const fallbackNick = `ผู้ทดสอบ_${suffix}`;
      const res = await fetcher("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "register-student",
          nickname: fallbackNick,
          pin: "1234",
          roomCode: "VIBE26",
        }),
      });
      const data = await res.json().catch(() => null);
      if (res.ok && data?.authenticated) {
        const studentObj = data.student || {};
        const session: ClientAuthSession = {
          role: "student",
          userId: studentObj.id || `stu-${fallbackNick}`,
          username: studentObj.nickname || fallbackNick,
          displayName: studentObj.nickname || fallbackNick,
          roomCode: studentObj.roomCode || "VIBE26",
        };
        return {
          ok: true,
          session,
          targetPath,
          source: data.source || "register-fallback",
        };
      }
      if (data?.error) lastError = data.error;
    } catch (err) {
      lastError = err instanceof Error ? err.message : lastError;
    }
  }

  return {
    ok: false,
    error: lastError || "ไม่สามารถเข้าสู่ระบบบัญชีทดสอบได้ กรุณาลองใหม่อีกครั้ง",
  };
}

/**
 * Persists the authenticated ClientAuthSession and navigates cleanly without
 * triggering cross-role redirect races on role-guarded pages (e.g. /teacher -> /my-learning).
 */
export function applyJudgeSessionAndNavigate(
  session: ClientAuthSession,
  targetPath: string
): "in-place" | "navigated" {
  if (typeof window === "undefined") return "in-place";

  const currentPathWithSearch = `${window.location.pathname}${window.location.search}`;
  const isSameDestination =
    window.location.pathname === targetPath || currentPathWithSearch === targetPath;

  if (isSameDestination) {
    setClientSession(session);
    return "in-place";
  }

  try {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(session));
  } catch {
    // ignore storage errors
  }
  window.location.assign(targetPath);
  return "navigated";
}

export async function signOutJudgeSession(
  fetchImpl: typeof fetch = fetch
): Promise<void> {
  try {
    await fetchImpl("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
  } catch {
    // ignore network error
  }
  setClientSession(null);
}
