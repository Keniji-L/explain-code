"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "./Icons";
import { useUiLanguage } from "./LanguageProvider";
import { ClientAuthSession, getClientSession } from "./SiteHeader";
import {
  CLOSE_JUDGE_DOCK_EVENT,
  CLOSE_LANGMIND_DOCK_EVENT,
  JUDGE_DEMO_ACCOUNTS,
  JudgeDemoRole,
  LANGMIND_PUBLIC_AGENT_URL,
  OPEN_LANGMIND_DOCK_EVENT,
  applyJudgeSessionAndNavigate,
  openGlobalLangMindDock,
  signInAsJudgeDemo,
  signOutJudgeSession,
} from "../lib/judge-demo";

export function JudgeQuickTestDock() {
  const pathname = usePathname() || "/";
  const router = useRouter();
  const { t } = useUiLanguage();

  const [openPathname, setOpenPathname] = useState<string | null>(null);
  const [session, setSession] = useState<ClientAuthSession | null>(null);
  const [loadingRole, setLoadingRole] = useState<JudgeDemoRole | "logout" | null>(
    null
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const isOpen = openPathname === pathname;
  const setIsOpen = (open: boolean) => {
    setOpenPathname(open ? pathname : null);
    if (open) {
      setErrorMsg(null);
      window.dispatchEvent(new CustomEvent(CLOSE_LANGMIND_DOCK_EVENT));
    }
  };

  useEffect(() => {
    const syncAuth = () => setSession(getClientSession());
    syncAuth();
    window.addEventListener("explain-code-auth-change", syncAuth);
    window.addEventListener("storage", syncAuth);
    return () => {
      window.removeEventListener("explain-code-auth-change", syncAuth);
      window.removeEventListener("storage", syncAuth);
    };
  }, [pathname]);

  // Close Judge popover automatically if the LangMind side drawer is opened
  useEffect(() => {
    const handleLangMindOpen = () => setOpenPathname(null);
    window.addEventListener(OPEN_LANGMIND_DOCK_EVENT, handleLangMindOpen);
    window.addEventListener(CLOSE_JUDGE_DOCK_EVENT, handleLangMindOpen);
    return () => {
      window.removeEventListener(OPEN_LANGMIND_DOCK_EVENT, handleLangMindOpen);
      window.removeEventListener(CLOSE_JUDGE_DOCK_EVENT, handleLangMindOpen);
    };
  }, []);

  // Escape & outside-click dismissal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setOpenPathname(null);
      }
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpenPathname(null);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    document.addEventListener("mousedown", handleMouseDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, [isOpen]);

  const handleQuickRoleSwitch = async (role: JudgeDemoRole) => {
    if (loadingRole) return;
    setErrorMsg(null);
    setLoadingRole(role);
    try {
      const result = await signInAsJudgeDemo(role);
      if (!result.ok || !result.session || !result.targetPath) {
        setErrorMsg(
          result.error ||
            t(
              "ไม่สามารถสลับบัญชีทดสอบได้ กรุณาลองใหม่อีกครั้ง",
              "Could not switch to the demo account. Please try again."
            )
        );
        return;
      }
      const outcome = applyJudgeSessionAndNavigate(
        result.session,
        result.targetPath
      );
      if (outcome === "in-place") {
        setSession(result.session);
        setIsOpen(false);
      }
    } finally {
      setLoadingRole(null);
    }
  };

  const handleLogout = async () => {
    if (loadingRole) return;
    setErrorMsg(null);
    setLoadingRole("logout");
    try {
      await signOutJudgeSession();
      setSession(null);
      setIsOpen(false);
      if (
        pathname.startsWith("/teacher") ||
        pathname.startsWith("/my-learning") ||
        pathname.startsWith("/my-history")
      ) {
        window.location.assign("/");
      } else {
        router.refresh();
      }
    } finally {
      setLoadingRole(null);
    }
  };

  const handleOpenLangMind = () => {
    setIsOpen(false);
    openGlobalLangMindDock();
  };

  const activeRoleBadge = session
    ? session.role === "teacher" || session.role === "admin"
      ? t("ครู", "Teacher")
      : t("นักเรียน", "Student")
    : t("ผู้เยี่ยมชม", "Guest");

  const isDungeonRoute = pathname.startsWith("/dungeon");

  return (
    <div ref={panelRef} data-judge-dock="true" className="no-print">
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-expanded={false}
          aria-haspopup="dialog"
          aria-label={t(
            "เปิดเมนูทางลัดสำหรับกรรมการทดสอบ",
            "Open Judge Quick-Test Menu"
          )}
          className={`fixed ${
            isDungeonRoute ? "bottom-3" : "bottom-20"
          } left-3 md:bottom-5 md:left-5 z-[55] inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[#f6c945]/75 bg-[#1b150c]/95 px-3 sm:px-3.5 py-2 sm:py-2.5 text-[11px] sm:text-xs font-extrabold text-[#ffe27a] shadow-[0_8px_24px_rgba(246,201,69,0.28)] backdrop-blur-md hover:border-[#ffe27a] hover:bg-[#2a2010] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]`}
        >
          <Icon name="trophy" size={14} className="text-[#f6c945] shrink-0" />
          <span className="sm:hidden whitespace-nowrap">
            {t("กรรมการ", "Judge")}
          </span>
          <span className="hidden sm:inline whitespace-nowrap">
            {t("โหมดกรรมการ", "Judge Test")}
          </span>
          <span className="hidden lg:inline-flex rounded-full border border-[#f6c945]/40 bg-[#0d0b14] px-2 py-0.5 text-[10px] font-bold text-[#f4efe6]">
            {activeRoleBadge}
          </span>
        </button>
      )}

      {isOpen && (
        <section
          role="dialog"
          data-floating-dock-open="true"
          aria-label={t(
            "เมนูลัดสำหรับกรรมการทดสอบระบบ",
            "Judge Quick-Test Switcher"
          )}
          className={`fixed ${
            isDungeonRoute ? "bottom-3" : "bottom-20"
          } left-3 md:bottom-5 md:left-5 z-[70] w-[340px] max-w-[calc(100vw-24px)] max-h-[calc(100vh-110px)] overflow-y-auto rounded-2xl border border-[#f6c945]/70 bg-[#141220]/98 p-3.5 text-[#f4efe6] shadow-[0_18px_48px_rgba(0,0,0,0.78)] backdrop-blur-md space-y-3`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-[#2f2d45]">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <Icon name="trophy" size={14} className="text-[#f6c945] shrink-0" />
                <h2 className="text-xs font-extrabold text-[#ffe27a] truncate">
                  {t("เมนูลัดสำหรับกรรมการทดสอบ", "Judge Quick-Test Menu")}
                </h2>
              </div>
              <p className="mt-0.5 text-[11px] text-[#9a93ad]">
                {t(
                  "สลับบทบาทหรือข้ามไปทดสอบทุกฟีเจอร์ได้ใน 1 คลิก",
                  "Switch demo roles or jump to any feature in 1 click"
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              aria-label={t("ปิดเมนูลัดกรรมการ", "Close judge menu")}
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[#3d395a] bg-[#1c1b2b] text-[#c4bdd6] hover:text-white cursor-pointer"
            >
              <Icon name="close" size={13} />
            </button>
          </div>

          {/* Active session strip */}
          <div className="flex items-center justify-between gap-2 rounded-xl border border-[#2f2d45] bg-[#0d0b14] px-3 py-2 text-[11px]">
            <div className="flex items-center gap-2 min-w-0">
              <span
                className={`h-2 w-2 shrink-0 rounded-full ${
                  session ? "bg-[#2fbf71]" : "bg-[#9a93ad]"
                }`}
              />
              <span className="truncate text-[#c4bdd6]">
                {session ? (
                  <>
                    <strong className="text-[#f4efe6]">
                      {session.displayName || session.username}
                    </strong>{" "}
                    <span className="text-[#ffe27a]">({activeRoleBadge})</span>
                  </>
                ) : (
                  t("สถานะ: ผู้เยี่ยมชม (ยังไม่ล็อกอิน)", "Status: Guest (Signed Out)")
                )}
              </span>
            </div>
            {session && (
              <button
                type="button"
                disabled={loadingRole !== null}
                onClick={() => void handleLogout()}
                className="inline-flex items-center gap-1 rounded-md border border-[#ff4d6d]/40 bg-[#24131c] px-2 py-0.5 text-[10px] font-bold text-[#fda4af] hover:border-[#ff4d6d] cursor-pointer shrink-0 disabled:opacity-50"
              >
                <Icon name="logout" size={10} />
                <span>{t("ออก", "Reset")}</span>
              </button>
            )}
          </div>

          {errorMsg && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-[#c0283a] bg-[#2d141c] px-3 py-2 text-[11px] font-bold text-[#fca5a5]"
            >
              <Icon name="alert" size={13} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* 1-Click Role Logins */}
          <div className="space-y-1.5">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a93ad]">
              {t("สลับบทบาทด้วยบัญชีสาธิต (/api/auth)", "1-Click Demo Role Switch (/api/auth)")}
            </div>
            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => void handleQuickRoleSwitch("student")}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer disabled:opacity-60 ${
                pathname.startsWith("/my-learning") && session?.role === "student"
                  ? "border-[#2fbf71] bg-[#133022]"
                  : "border-[#2fbf71]/45 bg-[#10241b] hover:border-[#2fbf71] hover:bg-[#143024]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon name="user" size={16} className="text-[#86efac] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#f4efe6] truncate">
                    {loadingRole === "student"
                      ? t("กำลังเข้าสู่ระบบนักเรียน...", "Signing in Student...")
                      : t("ฝั่งนักเรียน · 12-Cell + LangMind", "Student · 12-Cell + LangMind")}
                  </div>
                  <div className="text-[10px] text-[#86efac] truncate">
                    {JUDGE_DEMO_ACCOUNTS.student.credentialDisplay}
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#86efac] shrink-0">→</span>
            </button>

            <button
              type="button"
              disabled={loadingRole !== null}
              onClick={() => void handleQuickRoleSwitch("teacher")}
              className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition-colors cursor-pointer disabled:opacity-60 ${
                pathname.startsWith("/teacher") &&
                (session?.role === "teacher" || session?.role === "admin")
                  ? "border-[#f6c945] bg-[#332710]"
                  : "border-[#f6c945]/45 bg-[#231b0c] hover:border-[#f6c945] hover:bg-[#2f2410]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon name="users" size={16} className="text-[#ffe27a] shrink-0" />
                <div className="min-w-0">
                  <div className="text-xs font-extrabold text-[#f4efe6] truncate">
                    {loadingRole === "teacher"
                      ? t("กำลังเข้าสู่ระบบครู...", "Signing in Teacher...")
                      : t("ฝั่งครู · Classroom Radar + Copilot", "Teacher · Radar + Copilot")}
                  </div>
                  <div className="text-[10px] text-[#ffe27a] truncate">
                    {JUDGE_DEMO_ACCOUNTS.teacher.credentialDisplay}
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-[#ffe27a] shrink-0">→</span>
            </button>
          </div>

          {/* Instant Feature Shortcuts */}
          <div className="space-y-1.5 pt-1 border-t border-[#2f2d45]">
            <div className="text-[10px] font-extrabold uppercase tracking-wider text-[#9a93ad]">
              {t("ทดสอบฟีเจอร์หลัก & LangMind สด", "Key Feature & Live LangMind Tests")}
            </div>

            <div className="grid grid-cols-1 gap-1.5">
              <Link
                href="/dungeon/trial?openLangMind=1"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                  pathname.startsWith("/dungeon/trial")
                    ? "border-[#9b5de5] bg-[#25193b] text-[#e9d5ff]"
                    : "border-[#3d395a] bg-[#1c1b2b] text-[#f4efe6] hover:border-[#9b5de5] hover:bg-[#251f3d]"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon name="gamepad" size={15} className="text-[#f6c945] shrink-0" />
                  <span className="truncate">
                    {t("ดันเจี้ยน RPG + ผู้ช่วย LangMind สด", "RPG Dungeon + Live Dock")}
                  </span>
                </span>
                <span className="text-[#c084fc] shrink-0">→</span>
              </Link>

              <Link
                href="/explain"
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition-colors ${
                  pathname.startsWith("/explain")
                    ? "border-[#9b5de5] bg-[#25193b] text-[#e9d5ff]"
                    : "border-[#3d395a] bg-[#1c1b2b] text-[#f4efe6] hover:border-[#9b5de5] hover:bg-[#251f3d]"
                }`}
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon name="code" size={15} className="text-[#c084fc] shrink-0" />
                  <span className="truncate">
                    {t("อธิบายโค้ด 7 ภาษา + LangMind", "Code Explainer + LangMind")}
                  </span>
                </span>
                <span className="text-[#c084fc] shrink-0">→</span>
              </Link>

              <button
                type="button"
                onClick={handleOpenLangMind}
                className="flex items-center justify-between gap-2 rounded-xl border border-[#9b5de5]/55 bg-[#201633] px-3 py-2 text-xs font-bold text-[#e9d5ff] hover:border-[#c084fc] hover:bg-[#2b1d45] transition-colors cursor-pointer"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon name="sparkles" size={15} className="text-[#f6c945] shrink-0" />
                  <span className="truncate">
                    {t("เปิดลิ้นชัก LangMind สดบนหน้านี้", "Open Floating LangMind Here")}
                  </span>
                </span>
                <span className="text-[#ffe27a] shrink-0">⚡</span>
              </button>

              <a
                href={LANGMIND_PUBLIC_AGENT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-2 rounded-xl border border-[#2fbf71]/55 bg-[#0e2019] px-3 py-2 text-xs font-bold text-[#86efac] hover:border-[#34d37d] hover:bg-[#142e23] transition-colors"
              >
                <span className="flex items-center gap-2 min-w-0">
                  <Icon name="globe" size={15} className="shrink-0" />
                  <span className="truncate">
                    {t("เปิด LangMind Agent จริง (langmind.in.th)", "Open Public LangMind Agent")}
                  </span>
                </span>
                <span className="shrink-0">↗</span>
              </a>
            </div>
          </div>

          {/* Footer link to Home / Login */}
          <div className="pt-2 border-t border-[#2f2d45] flex items-center justify-between gap-2 text-[11px] text-[#9a93ad]">
            <Link
              href="/#judge-test-hub"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#ffe27a] underline underline-offset-2"
            >
              {t("ศูนย์ทดสอบหน้าแรก", "Home Judge Hub")}
            </Link>
            <Link
              href="/login"
              onClick={() => setIsOpen(false)}
              className="hover:text-[#ffe27a] underline underline-offset-2"
            >
              {t("หน้าเข้าสู่ระบบ (/login)", "Sign-In Page (/login)")}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
