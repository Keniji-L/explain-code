"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { BlockCellId } from "../lib/curriculum";
import type { LangMindRole } from "../lib/langmind";

export type LangMindContextScope = "page" | "arena" | "battle";

export interface LangMindScreenContext {
  pageKind?:
    | "home"
    | "courses"
    | "lesson"
    | "dungeon"
    | "explain"
    | "my-learning"
    | "teacher"
    | "other";
  pageTitle?: string;
  roleOverride?: LangMindRole;
  studentId?: string;
  displayName?: string;
  roomCode?: string;
  language?: string;
  code?: string;
  courseId?: string;
  lessonId?: string;
  lessonTitle?: string;
  dungeonTitle?: string;
  floorLabel?: string;
  monsterName?: string;
  targetCell?: BlockCellId;
  activeQuestionText?: string;
  activeQuestionPhase?: string;
  activeQuestionChoices?: string[];
  cellScores?: Partial<Record<BlockCellId, number>>;
  weakestCell?: BlockCellId;
}

type ScopeMap = Partial<Record<LangMindContextScope, LangMindScreenContext>>;

interface LangMindContextValue {
  activeContext: LangMindScreenContext;
  setScopeContext: (
    scope: LangMindContextScope,
    ctx: LangMindScreenContext | null
  ) => void;
}

const LangMindScreenReactContext = createContext<LangMindContextValue>({
  activeContext: {},
  setScopeContext: () => {},
});

export function LangMindContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scopes, setScopes] = useState<ScopeMap>({});

  const setScopeContext = useCallback(
    (scope: LangMindContextScope, ctx: LangMindScreenContext | null) => {
      setScopes((prev) => {
        if (!ctx) {
          if (!prev[scope]) return prev;
          const next = { ...prev };
          delete next[scope];
          return next;
        }
        return { ...prev, [scope]: ctx };
      });
    },
    []
  );

  const activeContext = useMemo<LangMindScreenContext>(() => {
    const merged: LangMindScreenContext = {
      ...(scopes.page || {}),
      ...(scopes.arena || {}),
      ...(scopes.battle || {}),
    };
    return merged;
  }, [scopes]);

  const value = useMemo(
    () => ({ activeContext, setScopeContext }),
    [activeContext, setScopeContext]
  );

  return (
    <LangMindScreenReactContext.Provider value={value}>
      {children}
    </LangMindScreenReactContext.Provider>
  );
}

export function useActiveLangMindContext(): LangMindScreenContext {
  return useContext(LangMindScreenReactContext).activeContext;
}

/**
 * Registers screen context (page / dungeon arena / active battle question) for the
 * floating always-on LangMind Mentor. Automatically clears its scope on unmount.
 */
export function useRegisterLangMindContext(
  scope: LangMindContextScope,
  ctx: LangMindScreenContext | null
) {
  const { setScopeContext } = useContext(LangMindScreenReactContext);
  const serialized = ctx ? JSON.stringify(ctx) : "";

  useEffect(() => {
    if (!serialized) {
      setScopeContext(scope, null);
      return;
    }
    try {
      const parsed = JSON.parse(serialized) as LangMindScreenContext;
      setScopeContext(scope, parsed);
    } catch {
      setScopeContext(scope, null);
    }
    return () => {
      setScopeContext(scope, null);
    };
  }, [scope, serialized, setScopeContext]);
}
