"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icons";
import { useUiLanguage } from "./LanguageProvider";
import { ClientAuthSession, getClientSession } from "./SiteHeader";
import { copyTextToClipboard } from "../lib/clipboard";
import {
  JUDGE_DEMO_ACCOUNTS,
  JudgeDemoRole,
  LANGMIND_PUBLIC_AGENT_URL,
  applyJudgeSessionAndNavigate,
  openGlobalLangMindDock,
  signInAsJudgeDemo,
} from "../lib/judge-demo";

export interface JudgeTestPanelProps {
  variant: "home" | "login";
  redirectPath?: string;
}

export function JudgeTestPanel({
  variant,
  redirectPath,
}: JudgeTestPanelProps) {
  const { t } = useUiLanguage();
  const [loadingRole, setLoadingRole] = useState<JudgeDemoRole | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [session, setSession] = useState<ClientAuthSession | null>(null);

  useEffect(() => {
    const sync = () => setSession(getClientSession());
    sync();
    window.addEventListener("explain-code-auth-change", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("explain-code-auth-change", sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleDemoLogin = async (role: JudgeDemoRole) => {
    if (loadingRole) return;
    setErrorMsg(null);
    setStatusMsg(null);
    setLoadingRole(role);

    try {
      const result = await signInAsJudgeDemo(role, {
        redirectPath: variant === "login" ? redirectPath : undefined,
      });

      if (!result.ok || !result.session || !result.targetPath) {
        setErrorMsg(
          result.error ||
            t(
              "ไม่สามารถเข้าสู่ระบบบัญชีทดสอบได้ กรุณาลองใหม่อีกครั้ง",
              "Could not sign into the demo account. Please try again."
            )
        );
        return;
      }

      setStatusMsg(
        role === "teacher"
          ? t(
              "เข้าสู่ระบบครูทดสอบสำเร็จ กำลังพาไปหน้าแดชบอร์ดครู...",
              "Signed in as Demo Teacher. Opening Teacher Copilot..."
            )
          : t(
              "เข้าสู่ระบบนักเรียนทดสอบสำเร็จ กำลังพาไปหน้าการเรียน 12 มิติ...",
              "Signed in as Demo Student. Opening My Learning..."
            )
      );

      applyJudgeSessionAndNavigate(result.session, result.targetPath);
    } finally {
      setLoadingRole(null);
    }
  };

  const handleCopyCred = async (key: string, value: string) => {
    const ok = await copyTextToClipboard(value);
    if (ok) {
      setCopiedKey(key);
      setTimeout(() => {
        setCopiedKey((prev) => (prev === key ? null : prev));
      }, 1800);
    }
  };

  if (variant === "login") {
    return (
      <section
        aria-labelledby="judge-login-heading"
        className="mt-6 rounded-2xl border border-[#9b5de5]/50 bg-[#181428] p-4 sm:p-5 space-y-3.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#281d08] border border-[#f6c945]/60 text-[#f6c945]">
              <Icon name="trophy" size={15} />
            </span>
            <div className="min-w-0">
              <h2
                id="judge-login-heading"
                className="text-xs sm:text-sm font-extrabold text-[#ffe27a]"
              >
                {t(
                  "สำหรับกรรมการทดสอบ (เข้าสู่ระบบ 1 คลิก)",
                  "For Competition Judges (1-Click Demo Login)"
                )}
              </h2>
              <p className="text-[11px] text-[#b4adc8]">
                {t(
                  "ทดสอบครบทุกบทบาทผ่านบัญชีสาธิตจริงของระบบ (/api/auth)",
                  "Sign in immediately with real demo accounts via /api/auth"
                )}
              </p>
            </div>
          </div>
          <span className="rounded-full border border-[#9b5de5]/50 bg-[#25193b] px-2.5 py-0.5 text-[10px] font-bold text-[#e9d5ff]">
            LangMind 2026
          </span>
        </div>

        {errorMsg && (
          <div
            role="alert"
            className="flex items-start gap-2 rounded-xl border border-[#c0283a] bg-[#2d141c] px-3 py-2 text-xs font-bold text-[#fca5a5]"
          >
            <Icon name="alert" size={14} className="shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <p role="status" className="sr-only">
          {statusMsg || ""}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => void handleDemoLogin("student")}
            className="group flex items-start gap-2.5 rounded-xl border border-[#2fbf71]/55 bg-[#10261c] p-3 text-left transition-all hover:border-[#2fbf71] hover:bg-[#143325] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2fbf71]"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#2fbf71]/20 border border-[#2fbf71]/50 text-[#86efac]">
              <Icon name="user" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold text-[#f4efe6] group-hover:text-[#86efac]">
                {loadingRole === "student"
                  ? t("กำลังเข้าสู่ระบบนักเรียน...", "Signing in Student...")
                  : t("เข้าทดสอบ: นักเรียน (1 คลิก)", "Demo Student (1-Click)")}
              </div>
              <div className="mt-0.5 text-[11px] text-[#b4adc8] truncate">
                {JUDGE_DEMO_ACCOUNTS.student.credentialDisplay}
              </div>
              <div className="mt-1 text-[10px] font-bold text-[#86efac]">
                {t("→ 12-Cell Block Model + LangMind", "→ 12-Cell Model + LangMind")}
              </div>
            </div>
          </button>

          <button
            type="button"
            disabled={loadingRole !== null}
            onClick={() => void handleDemoLogin("teacher")}
            className="group flex items-start gap-2.5 rounded-xl border border-[#f6c945]/55 bg-[#251d0d] p-3 text-left transition-all hover:border-[#f6c945] hover:bg-[#332710] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#f6c945]/15 border border-[#f6c945]/50 text-[#ffe27a]">
              <Icon name="users" size={16} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-extrabold text-[#f4efe6] group-hover:text-[#ffe27a]">
                {loadingRole === "teacher"
                  ? t("กำลังเข้าสู่ระบบครู...", "Signing in Teacher...")
                  : t("เข้าทดสอบ: ครูผู้สอน (1 คลิก)", "Demo Teacher (1-Click)")}
              </div>
              <div className="mt-0.5 text-[11px] text-[#b4adc8] truncate">
                {JUDGE_DEMO_ACCOUNTS.teacher.credentialDisplay}
              </div>
              <div className="mt-1 text-[10px] font-bold text-[#ffe27a]">
                {t("→ Classroom Radar + Teacher Copilot", "→ Classroom Radar + Copilot")}
              </div>
            </div>
          </button>
        </div>

        {/* Direct no-login feature shortcuts */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2f2d45]">
          <Link
            href="/dungeon/trial?openLangMind=1"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3d395a] bg-[#141220] px-2.5 py-1.5 text-[11px] font-bold text-[#f4efe6] hover:border-[#f6c945] hover:text-[#ffe27a] transition-colors"
          >
            <Icon name="gamepad" size={13} className="text-[#f6c945]" />
            <span>{t("ดันเจี้ยน + LangMind", "Dungeon + LangMind")}</span>
          </Link>
          <Link
            href="/explain"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#3d395a] bg-[#141220] px-2.5 py-1.5 text-[11px] font-bold text-[#f4efe6] hover:border-[#9b5de5] hover:text-[#e9d5ff] transition-colors"
          >
            <Icon name="code" size={13} className="text-[#c084fc]" />
            <span>{t("อธิบายโค้ด", "Code Explainer")}</span>
          </Link>
          <a
            href={LANGMIND_PUBLIC_AGENT_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2fbf71]/50 bg-[#102a1e] px-2.5 py-1.5 text-[11px] font-bold text-[#86efac] hover:border-[#2fbf71] hover:bg-[#153828] transition-colors"
          >
            <Icon name="globe" size={13} />
            <span>{t("LangMind Agent จริง ↗", "Live LangMind Agent ↗")}</span>
          </a>
        </div>
      </section>
    );
  }

  // variant === "home"
  return (
    <section
      id="judge-test-hub"
      aria-labelledby="judge-hub-heading"
      className="scroll-mt-24 mb-12 rounded-2xl border border-[#9b5de5]/60 bg-gradient-to-br from-[#171228] via-[#141220] to-[#1a1529] p-5 sm:p-7 shadow-[0_14px_40px_rgba(0,0,0,0.45)]"
    >
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#f6c945]/60 bg-[#281d08] px-3 py-1 text-[11px] font-extrabold text-[#ffe27a]">
              <Icon name="trophy" size={13} />
              <span>LangMind Use Case Challenge 2026</span>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full border border-[#2fbf71]/50 bg-[#102a1e] px-2.5 py-1 text-[11px] font-bold text-[#86efac]">
              <Icon name="shield" size={12} />
              <span>{t("เข้าทดสอบได้ใน 1 คลิก", "1-Click Live Testing")}</span>
            </span>
          </div>
          <h2
            id="judge-hub-heading"
            className="text-lg sm:text-xl font-extrabold text-[#f4efe6] tracking-tight"
          >
            {t(
              "ศูนย์ทดสอบสำหรับคณะกรรมการ (Judge Quick-Test Hub)",
              "Judge Quick-Test Hub — CODE COOL × LangMind"
            )}
          </h2>
          <p className="text-xs sm:text-sm text-[#b4adc8] leading-relaxed">
            {t(
              "เลือกทดสอบบทบาทนักเรียน บทบาทครู ดันเจี้ยน RPG พร้อมผู้ช่วย LangMind สด ตัวอธิบายโค้ด หรือเปิด Agent จริงบน langmind.in.th ได้ทันทีโดยไม่ต้องสมัครสมาชิกเอง",
              "Jump straight into every role and feature — Student 12-Cell Dashboard, Teacher Copilot, RPG Dungeon with Live LangMind Dock, Code Explainer, or the public LangMind Agent."
            )}
          </p>
        </div>

        {session && (
          <div className="inline-flex items-center gap-2 rounded-xl border border-[#3d395a] bg-[#0d0b14]/90 px-3 py-2 text-xs shrink-0">
            <span className="h-2 w-2 rounded-full bg-[#2fbf71]" />
            <span className="text-[#9a93ad]">{t("กำลังใช้งาน:", "Active:")}</span>
            <strong className="text-[#ffe27a] max-w-[130px] truncate">
              {session.displayName || session.username}
            </strong>
          </div>
        )}
      </div>

      {errorMsg && (
        <div
          role="alert"
          className="mb-4 flex items-start gap-2.5 rounded-xl border border-[#c0283a] bg-[#2d141c] px-4 py-3 text-xs font-bold text-[#fca5a5]"
        >
          <Icon name="alert" size={16} className="shrink-0 mt-0.5" />
          <span className="flex-1">{errorMsg}</span>
          <button
            type="button"
            onClick={() => setErrorMsg(null)}
            aria-label={t("ปิดแจ้งเตือน", "Dismiss error")}
            className="rounded px-1.5 py-0.5 hover:bg-black/25 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      <p role="status" className="sr-only">
        {statusMsg || ""}
      </p>

      {/* 6 One-Click Judge Action Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* 1. Student Dashboard */}
        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => void handleDemoLogin("student")}
          className="group flex flex-col justify-between rounded-xl border border-[#2fbf71]/50 bg-[#10241b] p-4 text-left transition-all hover:border-[#2fbf71] hover:bg-[#143024] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2fbf71]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2fbf71]/20 border border-[#2fbf71]/50 text-[#86efac]">
              <Icon name="user" size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#f4efe6] group-hover:text-[#86efac]">
                {loadingRole === "student"
                  ? t("กำลังเข้าสู่ระบบนักเรียน...", "Signing in Student...")
                  : t("1. ทดสอบฝั่งนักเรียน", "1. Test Student Role")}
              </div>
              <p className="mt-1 text-xs text-[#b4adc8] leading-relaxed">
                {t(
                  "ดูตาราง Block Model 12 มิติ + พี่เลี้ยง Socratic LangMind และเสกด่านซ่อมจุดอ่อน",
                  "12-Cell Block Model heatmap + Socratic LangMind Mentor & remedial dungeon generator."
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#2fbf71]/25 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-mono text-[#86efac] truncate">
              {JUDGE_DEMO_ACCOUNTS.student.credentialDisplay}
            </span>
            <span className="font-extrabold text-[#86efac] shrink-0">
              {t("เข้าเลย →", "Launch →")}
            </span>
          </div>
        </button>

        {/* 2. Teacher Copilot */}
        <button
          type="button"
          disabled={loadingRole !== null}
          onClick={() => void handleDemoLogin("teacher")}
          className="group flex flex-col justify-between rounded-xl border border-[#f6c945]/50 bg-[#231b0c] p-4 text-left transition-all hover:border-[#f6c945] hover:bg-[#2f2410] disabled:opacity-60 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#f6c945]/15 border border-[#f6c945]/50 text-[#ffe27a]">
              <Icon name="users" size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#f4efe6] group-hover:text-[#ffe27a]">
                {loadingRole === "teacher"
                  ? t("กำลังเข้าสู่ระบบครู...", "Signing in Teacher...")
                  : t("2. ทดสอบฝั่งครูผู้สอน", "2. Test Teacher Copilot")}
              </div>
              <p className="mt-1 text-xs text-[#b4adc8] leading-relaxed">
                {t(
                  "ดู Classroom Radar 12 มิติทั้งห้อง + Teacher Copilot แผนสอน PRIMM 15 นาที",
                  "Classroom 12-Cell Radar + Teacher Copilot for 15-min PRIMM plans & LINE links."
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#f6c945]/25 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-mono text-[#ffe27a] truncate">
              {JUDGE_DEMO_ACCOUNTS.teacher.credentialDisplay}
            </span>
            <span className="font-extrabold text-[#ffe27a] shrink-0">
              {t("เข้าเลย →", "Launch →")}
            </span>
          </div>
        </button>

        {/* 3. RPG Dungeon + Live Floating LangMind Dock */}
        <Link
          href="/dungeon/trial?openLangMind=1"
          className="group flex flex-col justify-between rounded-xl border border-[#9b5de5]/55 bg-[#1e1530] p-4 text-left transition-all hover:border-[#c084fc] hover:bg-[#271b3d] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c084fc]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#9b5de5]/25 border border-[#9b5de5]/60 text-[#e9d5ff]">
              <Icon name="gamepad" size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#f4efe6] group-hover:text-[#e9d5ff]">
                {t("3. ดันเจี้ยน RPG + LangMind สด", "3. Dungeon + Live Dock")}
              </div>
              <p className="mt-1 text-xs text-[#b4adc8] leading-relaxed">
                {t(
                  "ลองเล่นด่านพิกเซล RPG พร้อมผู้ช่วย LangMind ข้างจอที่เห็นโจทย์และโค้ดสด",
                  "Playable 2D Pixel RPG trial paired with the screen-aware floating LangMind Copilot."
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#9b5de5]/30 flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#d8b4fe] truncate">
              {t("ไม่ต้องล็อกอิน · เล่นได้ทันที", "No login · Instant play")}
            </span>
            <span className="font-extrabold text-[#e9d5ff] shrink-0">
              {t("เข้าด่าน →", "Play →")}
            </span>
          </div>
        </Link>

        {/* 4. Code Explainer + LangMind Panel */}
        <Link
          href="/explain"
          className="group flex flex-col justify-between rounded-xl border border-[#3d395a] bg-[#1c1b2b] p-4 text-left transition-all hover:border-[#f6c945]/70 hover:bg-[#252238] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25193b] border border-[#9b5de5]/50 text-[#c084fc]">
              <Icon name="code" size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#f4efe6] group-hover:text-[#ffe27a]">
                {t("4. อธิบายโค้ด 7 ภาษา + AI", "4. Code Explainer + AI")}
              </div>
              <p className="mt-1 text-xs text-[#b4adc8] leading-relaxed">
                {t(
                  "วางโค้ดเพื่อวิเคราะห์ทีละบรรทัด ตรวจจับ AI Hallucination และเสกเป็นด่านเกม",
                  "Line-by-line analysis across 7 languages, AI pitfall alerts & Code-to-Dungeon."
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#2f2d45] flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#9a93ad] truncate">JS / Python / TS / Java / C++ / SQL / HTML</span>
            <span className="font-extrabold text-[#ffe27a] shrink-0">
              {t("ทดสอบ →", "Try →")}
            </span>
          </div>
        </Link>

        {/* 5. Open Floating LangMind Copilot Right Here */}
        <button
          type="button"
          onClick={openGlobalLangMindDock}
          className="group flex flex-col justify-between rounded-xl border border-[#3d395a] bg-[#1c1b2b] p-4 text-left transition-all hover:border-[#9b5de5] hover:bg-[#251f3d] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9b5de5]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#25193b] border border-[#f6c945]/45 text-[#f6c945]">
              <Icon name="sparkles" size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#f4efe6] group-hover:text-[#ffe27a]">
                {t("5. ทดสอบผู้ช่วย LangMind ข้างจอ", "5. Open Floating Copilot")}
              </div>
              <p className="mt-1 text-xs text-[#b4adc8] leading-relaxed">
                {t(
                  "เปิดลิ้นชัก LangMind สดทันที เพื่อทดสอบ Socratic Guard, ป้องกัน Injection และแนบภาพ/ไฟล์",
                  "Open the side drawer right now to test Socratic Guard, Anti-Injection & file/image OCR."
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#2f2d45] flex items-center justify-between gap-2 text-[11px]">
            <span className="text-[#c084fc] truncate">Gemma 3 27B + RAG + OpenAPI Tools</span>
            <span className="font-extrabold text-[#e9d5ff] shrink-0">
              {t("เปิดทันที →", "Open →")}
            </span>
          </div>
        </button>

        {/* 6. Live Public LangMind Agent */}
        <a
          href={LANGMIND_PUBLIC_AGENT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col justify-between rounded-xl border border-[#2fbf71]/55 bg-[#0e2019] p-4 text-left transition-all hover:border-[#34d37d] hover:bg-[#132b21] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2fbf71]"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#2fbf71]/20 border border-[#2fbf71]/55 text-[#86efac]">
              <Icon name="globe" size={19} />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-[#f4efe6] group-hover:text-[#86efac]">
                {t("6. เปิด LangMind Agent จริง ↗", "6. Live Public LangMind ↗")}
              </div>
              <p className="mt-1 text-xs text-[#b4adc8] leading-relaxed">
                {t(
                  "เปิดหน้าแชทสาธารณะของ CODE COOL AI Mentor บนเซิร์ฟเวอร์ langmind.in.th โดยตรง",
                  "Open the deployed CODE COOL AI Mentor directly on langmind.in.th public chat."
                )}
              </p>
            </div>
          </div>
          <div className="mt-3 pt-2.5 border-t border-[#2fbf71]/25 flex items-center justify-between gap-2 text-[11px]">
            <span className="font-mono text-[#86efac] truncate">langmind.in.th/public/agents/...</span>
            <span className="font-extrabold text-[#86efac] shrink-0">
              {t("เปิดเว็บจริง ↗", "Open Live ↗")}
            </span>
          </div>
        </a>
      </div>

      {/* Collapsible Demo Credentials Reference (content-first disclosure) */}
      <details className="mt-4 rounded-xl border border-[#2f2d45] bg-[#0d0b14]/80 px-4 py-2.5 text-xs text-[#c4bdd6]">
        <summary className="cursor-pointer select-none font-bold text-[#ffe27a] hover:text-white flex items-center justify-between gap-2">
          <span>
            {t(
              "ดูข้อมูลบัญชีสาธิตสำหรับกรอกทดสอบเองที่หน้า /login (คลิกเพื่อขยาย)",
              "View Demo Account Credentials for Manual /login Testing (Click to expand)"
            )}
          </span>
          <Icon name="chevron-down" size={14} className="shrink-0" />
        </summary>
        <div className="mt-3 pt-3 border-t border-[#2f2d45] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div className="flex items-center justify-between gap-2 rounded-lg border border-[#2f2d45] bg-[#141220] px-3 py-2">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#86efac]">
                {t("บัญชีนักเรียนทดสอบ", "Demo Student Account")}
              </div>
              <div className="font-mono text-xs text-[#f4efe6] truncate">
                ต้นกล้า_สายโค้ด / PIN: 1234
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyCred("student", "ต้นกล้า_สายโค้ด")}
              className="rounded-md border border-[#3d395a] bg-[#1c1b2b] px-2 py-1 text-[10px] font-bold text-[#ffe27a] hover:border-[#f6c945] cursor-pointer shrink-0"
            >
              {copiedKey === "student" ? t("คัดลอกแล้ว", "Copied") : t("คัดลอกชื่อ", "Copy ID")}
            </button>
          </div>
          <div className="flex items-center justify-between gap-2 rounded-lg border border-[#2f2d45] bg-[#141220] px-3 py-2">
            <div className="min-w-0">
              <div className="text-[11px] font-bold text-[#ffe27a]">
                {t("บัญชีครูผู้สอนทดสอบ", "Demo Teacher Account")}
              </div>
              <div className="font-mono text-xs text-[#f4efe6] truncate">
                ครูตัวอย่าง / 12345678
              </div>
            </div>
            <button
              type="button"
              onClick={() => void handleCopyCred("teacher", "ครูตัวอย่าง")}
              className="rounded-md border border-[#3d395a] bg-[#1c1b2b] px-2 py-1 text-[10px] font-bold text-[#ffe27a] hover:border-[#f6c945] cursor-pointer shrink-0"
            >
              {copiedKey === "teacher" ? t("คัดลอกแล้ว", "Copied") : t("คัดลอกชื่อ", "Copy ID")}
            </button>
          </div>
        </div>
      </details>
    </section>
  );
}
