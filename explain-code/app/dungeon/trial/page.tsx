"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { AVATARS, getAvatar, DEFAULT_AVATAR, AvatarKey } from "../../lib/dungeon/sprites";
import { generateDungeonRoom, DungeonRoom } from "../../lib/dungeon/mapgen";
import { getMonsterDef, MonsterDef } from "../../lib/dungeon/monsters";
import { SAMPLE_DUNGEON_QUESTIONS } from "../../lib/dungeon/questions";
import { GameCanvas } from "../../components/dungeon/GameCanvas";
import { DungeonHud } from "../../components/dungeon/DungeonHud";
import { BattleOverlay } from "../../components/dungeon/BattleOverlay";
import { MobileDpad } from "../../components/dungeon/MobileDpad";
import { PauseModal, GameOverModal, VictoryModal } from "../../components/dungeon/GameModals";
import { dungeonSound } from "../../lib/dungeon/sound";
import { Icon } from "../../components/Icons";
import { useUiLanguage } from "../../components/LanguageProvider";
import { useRegisterLangMindContext } from "../../components/LangMindContext";
import { openGlobalLangMindDock } from "../../lib/judge-demo";
import type { BlockCellId } from "../../lib/curriculum";

const TRIAL_SEED = 12345678;

export default function DungeonTrialPage() {
  const router = useRouter();
  const { uiLang, t } = useUiLanguage();

  // Avatar preference
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(DEFAULT_AVATAR);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Game state
  const [room, setRoom] = useState<DungeonRoom>(() =>
    generateDungeonRoom(TRIAL_SEED, 0, 1, "monster")
  );
  const [hearts, setHearts] = useState<number>(3);
  const [maxHearts] = useState<number>(3);
  const [coins, setCoins] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);

  // Modals & Overlay state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInBattle, setIsInBattle] = useState<boolean>(false);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<number>(0);

  useEffect(() => {
    const rafId = window.requestAnimationFrame(() => {
      try {
        const savedAvatar = localStorage.getItem("explain_code_dungeon_avatar") as AvatarKey;
        if (savedAvatar && AVATARS.some((a) => a.key === savedAvatar)) {
          setAvatarKey(savedAvatar);
        }
        const savedSound = localStorage.getItem("explain_code_dungeon_sound");
        if (savedSound !== null) {
          setSoundEnabled(savedSound === "true");
          dungeonSound.setEnabled(savedSound === "true");
        }
      } catch {
        // ignore
      }
    });
    return () => window.cancelAnimationFrame(rafId);
  }, []);

  const avatar = useMemo(() => getAvatar(avatarKey), [avatarKey]);
  const currentMonster: MonsterDef = useMemo(() => getMonsterDef("slime"), []);
  const trialQuestion = useMemo(() => SAMPLE_DUNGEON_QUESTIONS[0], []);

  const trialTargetCell: BlockCellId =
    trialQuestion?.blockModelCell &&
    /^[TEF][1-4]$/.test(trialQuestion.blockModelCell.toUpperCase())
      ? (trialQuestion.blockModelCell.toUpperCase() as BlockCellId)
      : "E2";

  useRegisterLangMindContext("arena", {
    pageKind: "dungeon",
    dungeonTitle: t(
      "ห้องฝึกซ้อมจำลอง (Guest Trial)",
      "Training Simulation Room (Guest Trial)"
    ),
    floorLabel:
      trialQuestion?.phaseLabel || t("โหมดทดลองเล่น", "Guest Trial Mode"),
    monsterName:
      uiLang === "en"
        ? currentMonster.nameEn || currentMonster.name
        : currentMonster.name,
    targetCell: trialTargetCell,
    code:
      uiLang === "en"
        ? trialQuestion.codeSnippetEn || trialQuestion.codeSnippet
        : trialQuestion.codeSnippet,
    language: trialQuestion.language || "javascript",
  });

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    dungeonSound.setEnabled(next);
  }, [soundEnabled]);

  const handleEncounterEntity = useCallback(() => {
    if (!room.entity?.isCompleted) {
      setIsInBattle(true);
    }
  }, [room.entity]);

  const handleCorrectAnswer = useCallback(
    (xpAwarded?: number, coinsAwarded?: number) => {
      // Slime defeated
      const gainedCoins = coinsAwarded !== undefined ? coinsAwarded : currentMonster.coinReward;
      const gainedXp = xpAwarded !== undefined ? xpAwarded : currentMonster.xpReward;
      setCoins((prev) => prev + gainedCoins);
      setXp((prev) => prev + gainedXp);

      setRoom((prev) => {
        const nextEntity = prev.entity
          ? { ...prev.entity, hp: 0, isCompleted: true }
          : null;
        return {
          ...prev,
          entity: nextEntity,
          isDoorUnlocked: true,
        };
      });
    },
    [currentMonster]
  );

  const handleWrongAnswer = useCallback(() => {
    // Player takes damage
    setScreenShake(1);
    setTimeout(() => setScreenShake(0), 300);

    setHearts((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(() => setIsGameOver(true), 400);
      }
      return Math.max(0, next);
    });
  }, []);

  const handleEnterNextFloor = useCallback(() => {
    dungeonSound.playVictory();
    setIsVictory(true);
  }, []);

  const handleRetry = useCallback(() => {
    setHearts(3);
    setCoins(0);
    setXp(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsInBattle(false);
    setIsPaused(false);
    setRoom(generateDungeonRoom(TRIAL_SEED, 0, 1, "monster"));
  }, []);

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 pt-2.5 pb-16 sm:py-6 flex flex-col items-center gap-2.5 sm:gap-4">
      {/* Heading & Control Hint */}
      <div className="w-full flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2f2d45] bg-[#141220]/90 px-3 sm:px-3.5 py-2 text-xs text-[#c4bdd6]">
        <h1 className="text-xs sm:text-sm font-extrabold text-[#ffe27a]">
          {t("โหมดทดลองเล่นดันเจี้ยน (Guest Trial)", "Dungeon Guest Trial Mode")}
        </h1>
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <span className="hidden sm:inline-flex items-center gap-1.5">
            <Icon name="keyboard" size={13} className="text-[#ffe27a] shrink-0" />
            <span>
              {t(
                "กด WASD หรือปุ่มลูกศรเพื่อเดินเข้าหามอนสเตอร์ · กด Space เพื่อโต้ตอบ",
                "Press WASD or Arrow keys to approach the monster · Space to interact"
              )}
            </span>
          </span>
          <button
            type="button"
            onClick={openGlobalLangMindDock}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#9b5de5]/70 bg-[#25193b] px-2.5 py-1 text-[11px] font-extrabold text-[#e9d5ff] hover:border-[#f6c945] hover:text-[#ffe27a] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#f6c945]"
          >
            <Icon name="sparkles" size={13} className="text-[#f6c945] shrink-0" />
            <span>{t("เปิด LangMind ข้างจอ", "Open LangMind Copilot")}</span>
          </button>
        </div>
      </div>

      {/* HUD Bar */}
      <DungeonHud
        avatar={avatar}
        floorIndex={0}
        totalFloors={1}
        dungeonTitle={t("ห้องฝึกซ้อมจำลอง", "Training Simulation Room")}
        roomTitle={t("โหมดทดลองเล่น (Guest Trial)", "Guest Trial Mode")}
        hearts={hearts}
        maxHearts={maxHearts}
        coins={coins}
        xp={xp}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onTogglePause={() => setIsPaused(true)}
        onExit={() => router.push("/courses")}
      />

      {/* Canvas Viewport */}
      <div className="w-full flex justify-center">
        <GameCanvas
          room={room}
          avatar={avatar}
          isPaused={isPaused}
          isInBattle={isInBattle}
          onEncounterEntity={handleEncounterEntity}
          onEnterNextFloor={handleEnterNextFloor}
          onAutoPause={() => setIsPaused(true)}
          screenShake={screenShake}
        />
      </div>

      {/* Mobile On-Screen D-Pad */}
      <div className="w-full sm:hidden">
        <MobileDpad
          disabled={isPaused || isInBattle || isGameOver || isVictory}
          onMove={(dx, dy) => {
            const dirKey =
              dx < 0
                ? "ArrowLeft"
                : dx > 0
                ? "ArrowRight"
                : dy < 0
                ? "ArrowUp"
                : "ArrowDown";
            const event = new KeyboardEvent("keydown", {
              key: dirKey,
              code: dirKey,
            });
            window.dispatchEvent(event);
          }}
          onAction={() => {
            const event = new KeyboardEvent("keydown", {
              key: " ",
              code: "Space",
            });
            window.dispatchEvent(event);
          }}
        />
      </div>

      {/* Battle Overlay */}
      {isInBattle && (
        <BattleOverlay
          runId="trial"
          monster={currentMonster}
          question={trialQuestion}
          monsterHp={room.entity?.isCompleted ? 0 : 1}
          maxMonsterHp={1}
          playerHearts={hearts}
          initialFocus={3}
          maxFocus={6}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
          onClose={() => setIsInBattle(false)}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onExit={() => router.push("/courses")}
      />

      {/* Game Over Modal */}
      <GameOverModal
        isOpen={isGameOver}
        onRetry={handleRetry}
        onExit={() => router.push("/courses")}
      />

      {/* Victory Modal */}
      <VictoryModal
        isOpen={isVictory}
        dungeonTitle={t("ห้องทดลองเล่น", "Trial Dungeon")}
        courseTitle={t("โหมดทดลองเล่นสำหรับผู้เยี่ยมชม", "Guest Trial Mode")}
        totalCoins={coins}
        totalXp={xp}
        onExit={() => router.push("/courses")}
      />
    </div>
  );
}
