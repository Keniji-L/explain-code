"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Icon } from "./Icons";
import { useUiLanguage } from "./LanguageProvider";
import { LangMindAgentPanel } from "./LangMindAgentPanel";
import {
  LangMindScreenContext,
  useActiveLangMindContext,
} from "./LangMindContext";
import { ClientAuthSession, getClientSession } from "./SiteHeader";
import {
  CLOSE_JUDGE_DOCK_EVENT,
  CLOSE_LANGMIND_DOCK_EVENT,
  OPEN_LANGMIND_DOCK_EVENT,
} from "../lib/judge-demo";
import type { LangMindRole } from "../lib/langmind";

function inferPageLabel(pathname: string, uiLang: "th" | "en"): string {
  if (pathname === "/") return uiLang === "en" ? "Home" : "หน้าแรก";
  if (pathname.startsWith("/dungeon") || pathname.startsWith("/depths")) {
    return uiLang === "en" ? "Dungeon Arena" : "ด่านเกม RPG";
  }
  if (pathname.includes("/lessons/")) {
    return uiLang === "en" ? "Lesson" : "บทเรียน";
  }
  if (pathname.startsWith("/courses")) {
    return uiLang === "en" ? "Courses" : "คอร์สเรียน";
  }
  if (pathname.startsWith("/explain")) {
    return uiLang === "en" ? "Code Explainer" : "อธิบายโค้ด";
  }
  if (pathname.startsWith("/my-learning")) {
    return uiLang === "en" ? "My Learning" : "การเรียนของฉัน";
  }
  if (pathname.startsWith("/teacher")) {
    return uiLang === "en" ? "Teacher Hub" : "แดชบอร์ดครู";
  }
  return "CODE COOL";
}

export function GlobalLangMindDock() {
  const pathname = usePathname() || "/";
  const searchParams = useSearchParams();
  const { uiLang, t } = useUiLanguage();
  const screenCtx = useActiveLangMindContext();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [hasOpened, setHasOpened] = useState<boolean>(false);
  const [highlightTrigger, setHighlightTrigger] = useState<boolean>(false);
  const [session, setSession] = useState<ClientAuthSession | null>(null);
  const handledAutoOpenRef = useRef<string>("");

  useEffect(() => {
    const syncAuth = () => setSession(getClientSession());
    syncAuth();
    window.addEventListener("explain-code-auth-change", syncAuth);
    return () => {
      window.removeEventListener("explain-code-auth-change", syncAuth);
    };
  }, [pathname]);

  // Allow Judge Quick-Test controls or in-page triggers to open/close the live floating dock directly
  useEffect(() => {
    const handleOpenEvent = () => {
      setHasOpened(true);
      setIsOpen(true);
      setHighlightTrigger(false);
      window.dispatchEvent(new CustomEvent(CLOSE_JUDGE_DOCK_EVENT));
    };
    const handleCloseEvent = () => {
      setIsOpen(false);
    };
    window.addEventListener(OPEN_LANGMIND_DOCK_EVENT, handleOpenEvent);
    window.addEventListener(CLOSE_LANGMIND_DOCK_EVENT, handleCloseEvent);
    return () => {
      window.removeEventListener(OPEN_LANGMIND_DOCK_EVENT, handleOpenEvent);
      window.removeEventListener(CLOSE_LANGMIND_DOCK_EVENT, handleCloseEvent);
    };
  }, []);

  // Support ?openLangMind=1 deep-link (auto-opens side drawer on desktop >= 1024px, highlights button on mobile)
  const openParam = searchParams.get("openLangMind");
  useEffect(() => {
    if (openParam !== "1") {
      handledAutoOpenRef.current = "";
      return;
    }
    const visitKey = `${pathname}?openLangMind=1`;
    if (handledAutoOpenRef.current === visitKey) return;

    const rafId = window.requestAnimationFrame(() => {
      handledAutoOpenRef.current = visitKey;
      if (window.innerWidth >= 1024) {
        setHasOpened(true);
        setIsOpen(true);
        setHighlightTrigger(false);
        window.dispatchEvent(new CustomEvent(CLOSE_JUDGE_DOCK_EVENT));
      } else {
        setHighlightTrigger(true);
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, [openParam, pathname]);

  // Close drawer with Escape key for keyboard accessibility
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        e.stopImmediatePropagation();
        setIsOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  const role: LangMindRole =
    screenCtx.roleOverride ||
    (pathname.startsWith("/teacher") || session?.role === "teacher"
      ? "teacher"
      : "student");

  const mergedContext = useMemo<LangMindScreenContext>(() => {
    return {
      studentId: screenCtx.studentId || session?.userId,
      displayName:
        screenCtx.displayName || session?.displayName || session?.username,
      pageTitle: screenCtx.pageTitle || inferPageLabel(pathname, uiLang),
      ...screenCtx,
    };
  }, [screenCtx, session, pathname, uiLang]);

  const liveBadgeText = useMemo(() => {
    if (screenCtx.activeQuestionText && screenCtx.targetCell) {
      return uiLang === "en"
        ? `Battle · ${screenCtx.targetCell}`
        : `โจทย์ ${screenCtx.targetCell}`;
    }
    if (screenCtx.dungeonTitle) {
      return screenCtx.targetCell
        ? `${screenCtx.targetCell} · ${uiLang === "en" ? "Dungeon" : "ในด่าน"}`
        : uiLang === "en"
          ? "In Dungeon"
          : "ในด่าน";
    }
    if (screenCtx.lessonTitle) {
      return uiLang === "en" ? "Lesson" : "บทเรียน";
    }
    return inferPageLabel(pathname, uiLang);
  }, [screenCtx, pathname, uiLang]);

  const isDungeonRoute = pathname.startsWith("/dungeon");

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => {
            setHasOpened(true);
            setIsOpen(true);
            setHighlightTrigger(false);
            window.dispatchEvent(new CustomEvent(CLOSE_JUDGE_DOCK_EVENT));
          }}
          aria-label={t(
            "เปิดผู้ช่วย LangMind AI ข้างหน้าจอ",
            "Open Always-On LangMind AI Copilot"
          )}
          className={`fixed ${
            isDungeonRoute ? "bottom-3" : "bottom-20"
          } right-3 md:bottom-5 md:right-5 z-[55] inline-flex items-center gap-1.5 sm:gap-2 rounded-full border bg-[#18122b]/95 px-3.5 sm:px-4 py-2 sm:py-2.5 text-xs font-extrabold text-white shadow-[0_8px_28px_rgba(155,93,229,0.45)] backdrop-blur-md hover:border-[#f6c945] hover:bg-[#22193d] transition-all cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945] ${
            highlightTrigger
              ? "border-[#f6c945] ring-2 ring-[#f6c945]/70 ring-offset-2 ring-offset-[#0d0b14]"
              : "border-[#9b5de5]/80"
          }`}
        >
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2fbf71] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#2fbf71]" />
          </span>
          <Icon name="sparkles" size={15} className="text-[#f6c945] shrink-0" />
          <span className="whitespace-nowrap">{t("ถาม LangMind", "Ask LangMind")}</span>
          {liveBadgeText && (
            <span className="hidden sm:inline-flex rounded-full border border-[#3d395a] bg-[#0d0b14] px-2 py-0.5 text-[10px] font-bold text-[#ffe27a] whitespace-nowrap">
              {liveBadgeText}
            </span>
          )}
        </button>
      )}

      {(hasOpened || isOpen) && (
        <aside
          aria-label="Global LangMind Floating Side Drawer"
          aria-hidden={!isOpen}
          data-langmind-dock="true"
          data-floating-dock-open={isOpen ? "true" : undefined}
          className={
            isOpen
              ? "fixed inset-x-3 bottom-3 top-16 sm:inset-auto sm:top-4 sm:right-4 sm:bottom-4 sm:w-[420px] max-w-[calc(100vw-24px)] z-[70] flex flex-col drop-shadow-[0_18px_48px_rgba(0,0,0,0.75)]"
              : "hidden"
          }
        >
          <LangMindAgentPanel
            role={role}
            context={mergedContext}
            compact
            onCloseDrawer={() => setIsOpen(false)}
          />
        </aside>
      )}
    </>
  );
}
