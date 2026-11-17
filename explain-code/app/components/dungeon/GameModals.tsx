"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { PixelSpriteView } from "./PixelSpriteView";
import { HEART_SPRITE, COIN_SPRITE } from "../../lib/dungeon/sprites";
import { Icon } from "../Icons";
import { useUiLanguage } from "../LanguageProvider";

interface PauseModalProps {
  isOpen: boolean;
  onResume: () => void;
  onExit: () => void;
}

export function PauseModal({ isOpen, onResume, onExit }: PauseModalProps) {
  const { t } = useUiLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onResume();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onResume]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs select-none"
    >
      <div className="retro-panel rounded-2xl max-w-sm w-full p-6 text-center space-y-5 text-[#f4efe6]">
        <div className="space-y-1">
          <span className="pixel-font text-xs text-[#ffe27a]">GAME PAUSED</span>
          <h2 className="text-xl font-black">
            {t("หยุดเกมชั่วคราว", "Game Paused")}
          </h2>
          <p className="text-xs text-[#9a93ad]">
            {t(
              "เกมหยุดอัตโนมัติเมื่อคุณสลับแท็บหรือกดปุ่มหยุด",
              "The game pauses automatically when you switch tabs or press pause."
            )}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onResume}
            className="retro-button w-full py-3 rounded-xl bg-[#2fbf71] hover:bg-[#34d37d] text-[#120f1c] font-black pixel-font text-xs cursor-pointer"
          >
            {t("RESUME (เล่นต่อ) ▶", "RESUME ▶")}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="retro-button w-full py-2.5 rounded-xl bg-[#252238] hover:bg-[#c0283a] text-[#f4efe6] font-bold text-xs cursor-pointer"
          >
            {t("ออกจากดันเจี้ยน", "Exit Dungeon")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface GameOverModalProps {
  isOpen: boolean;
  onRetry: () => void;
  onExit: () => void;
}

export function GameOverModal({ isOpen, onRetry, onExit }: GameOverModalProps) {
  const { t } = useUiLanguage();
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none"
    >
      <div className="retro-panel rounded-2xl max-w-md w-full p-6 text-center space-y-5 text-[#f4efe6] border-2 border-[#c0283a]">
        <div className="space-y-2">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#c0283a]/20 border border-[#c0283a] flex items-center justify-center text-[#ff4d6d]">
            <Icon name="heart" size={28} />
          </div>
          <span className="pixel-font text-xs text-[#ff4d6d] font-bold">GAME OVER</span>
          <h2 className="text-xl sm:text-2xl font-black text-[#f4efe6]">
            {t("หัวใจหมดแล้ว!", "Out of Hearts!")}
          </h2>
          <p className="text-xs text-[#9a93ad] leading-relaxed">
            {t(
              "คุณหมดพลังในดันเจี้ยนและถูกพากลับมาพักผ่อน แต่ไม่ต้องเป็นห่วง!",
              "You ran out of hearts in the dungeon and returned to rest, but don't worry!"
            )}
            <strong>
              {" "}
              {t(
                "ข้อมูลบทเรียนและความคืบหน้าในการเรียนรู้ของคุณไม่สูญหาย",
                "Your lesson data and learning progress are safe."
              )}
            </strong>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={onRetry}
            className="retro-button flex-1 py-3 rounded-xl bg-[#f6c945] hover:bg-[#ffe27a] text-[#120f1c] font-black pixel-font text-xs cursor-pointer"
          >
            {t("RETRY (ลองใหม่)", "RETRY")}
          </button>
          <button
            type="button"
            onClick={onExit}
            className="retro-button flex-1 py-3 rounded-xl bg-[#252238] hover:bg-[#322c4a] text-[#f4efe6] font-bold text-xs cursor-pointer"
          >
            {t("← กลับหน้าฮับ", "← Back to Hub")}
          </button>
        </div>
      </div>
    </div>
  );
}

interface VictoryModalProps {
  isOpen: boolean;
  dungeonTitle: string;
  courseTitle: string;
  totalCoins: number;
  totalXp: number;
  onExit: () => void;
}

export function VictoryModal({
  isOpen,
  dungeonTitle,
  courseTitle,
  totalCoins,
  totalXp,
  onExit,
}: VictoryModalProps) {
  const { t } = useUiLanguage();
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xs select-none"
    >
      <div className="retro-panel rounded-2xl max-w-md w-full p-6 text-center space-y-6 text-[#f4efe6] border-2 border-[#f6c945] animate-in zoom-in-95 duration-200">
        <div className="space-y-2">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#f6c945]/20 border-2 border-[#f6c945] flex items-center justify-center text-[#ffe27a] animate-bounce">
            <Icon name="trophy" size={32} />
          </div>
          <span className="pixel-font text-xs text-[#f6c945] font-black uppercase">
            DUNGEON CONQUERED!
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-[#ffe27a]">
            {t("พิชิตดันเจี้ยนสำเร็จ!", "Dungeon Conquered!")}
          </h2>
          <p className="text-xs text-[#9a93ad]">
            {t(
              `ยินดีด้วย! คุณผ่านบทเรียนทั้งหมดและปราบบอสแห่ง ${dungeonTitle} เรียบร้อยแล้ว`,
              `Congratulations! You completed all lessons and defeated the boss of ${dungeonTitle}.`
            )}
          </p>
        </div>

        {/* Reward Box */}
        <div className="bg-[#120f1c] border border-[#4a4766] rounded-xl p-4 flex items-center justify-around text-xs">
          <div className="flex flex-col items-center gap-1">
            <span className="text-[#9a93ad] text-[11px]">
              {t("เหรียญทองที่ได้รับ", "Coins Earned")}
            </span>
            <div className="flex items-center gap-1 text-[#f6c945] pixel-font font-bold text-sm">
              <PixelSpriteView sprite={COIN_SPRITE} size={16} />
              <span>+{totalCoins} G</span>
            </div>
          </div>

          <div className="h-8 w-px bg-[#4a4766]" />

          <div className="flex flex-col items-center gap-1">
            <span className="text-[#9a93ad] text-[11px]">
              {t("ค่าประสบการณ์รวม", "Total XP")}
            </span>
            <div className="text-[#2fbf71] pixel-font font-bold text-sm">
              +{totalXp} XP
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onExit}
          className="retro-button w-full py-3.5 rounded-xl bg-[#2fbf71] hover:bg-[#34d37d] text-[#120f1c] font-black pixel-font text-xs cursor-pointer shadow-lg transition-transform hover:scale-102"
        >
          {t("CLAIM REWARD & RETURN (รับรางวัล) →", "CLAIM REWARD & RETURN →")}
        </button>
      </div>
    </div>
  );
}
