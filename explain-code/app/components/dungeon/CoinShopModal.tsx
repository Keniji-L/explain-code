"use client";

import React, { useEffect } from "react";
import { PixelSpriteView } from "./PixelSpriteView";
import { COIN_SPRITE } from "../../lib/dungeon/sprites";
import { useUiLanguage } from "../LanguageProvider";

export type ShopItemId = "heal-hp" | "restore-mp" | "shield-scroll" | "double-reward";

interface CoinShopModalProps {
  isOpen: boolean;
  coins: number;
  hearts: number;
  maxHearts: number;
  focus: number;
  maxFocus: number;
  floorShieldBonus: number;
  floorRewardMultiplier: number;
  onBuyItem: (itemId: ShopItemId, cost: number) => void;
  onClose: () => void;
}

export function CoinShopModal({
  isOpen,
  coins,
  hearts,
  maxHearts,
  focus,
  maxFocus,
  floorShieldBonus,
  floorRewardMultiplier,
  onBuyItem,
  onClose,
}: CoinShopModalProps) {
  const { t } = useUiLanguage();

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const items: {
    id: ShopItemId;
    icon: string;
    name: string;
    desc: string;
    cost: number;
    disabled: boolean;
    disabledReason?: string;
  }[] = [
    {
      id: "heal-hp",
      icon: "❤️",
      name: t("ยาฟื้นหัวใจ (+1 HP)", "Healing Potion (+1 HP)"),
      desc: t("ฟื้นพลังชีวิต 1 ดวงทันที", "Instantly restores 1 Heart."),
      cost: 15,
      disabled: hearts >= maxHearts || coins < 15,
      disabledReason:
        hearts >= maxHearts
          ? t("HP เต็มแล้ว", "Full HP")
          : coins < 15
          ? t("เหรียญไม่พอ", "Not enough coins")
          : undefined,
    },
    {
      id: "restore-mp",
      icon: "✨",
      name: t("น้ำยามานา (+2 MP)", "Focus Elixir (+2 MP)"),
      desc: t("เติม Focus MP สำหรับใช้สกิลตอนสู้", "Restores 2 Focus MP for battle skills."),
      cost: 12,
      disabled: focus >= maxFocus || coins < 12,
      disabledReason:
        focus >= maxFocus
          ? t("MP เต็มแล้ว", "Full MP")
          : coins < 12
          ? t("เหรียญไม่พอ", "Not enough coins")
          : undefined,
    },
    {
      id: "shield-scroll",
      icon: "🛡️",
      name: t("คัมภีร์โล่ (+1 Shield)", "Aegis Scroll (+1 Shield)"),
      desc: t("กันดาเมจจากการตอบผิดได้ 1 ครั้งในชั้นนี้", "Blocks 1 wrong-answer hit on this floor."),
      cost: 20,
      disabled: coins < 20,
      disabledReason: coins < 20 ? t("เหรียญไม่พอ", "Not enough coins") : undefined,
    },
    {
      id: "double-reward",
      icon: "🪙",
      name: t("เครื่องรางโชคลาภ (2x รางวัล)", "Fortune Charm (2x Rewards)"),
      desc: t("คูณ 2 XP และ Coins จากการสู้ในชั้นนี้", "Doubles XP & Coins earned on this floor."),
      cost: 25,
      disabled: floorRewardMultiplier >= 2 || coins < 25,
      disabledReason:
        floorRewardMultiplier >= 2
          ? t("เปิดใช้งานอยู่แล้ว", "Already Active")
          : coins < 25
          ? t("เหรียญไม่พอ", "Not enough coins")
          : undefined,
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs select-none"
    >
      <div className="retro-panel rounded-2xl max-w-md w-full p-5 sm:p-6 space-y-4 text-[#f4efe6] border border-[#f6c945]/40 bg-[#141220]">
        <div className="flex items-center justify-between gap-3 border-b border-[#2f2d45] pb-3">
          <div>
            <span className="pixel-font text-[10px] text-[#ffe27a]">
              DUNGEON MERCHANT
            </span>
            <h2 className="text-lg font-black text-[#f4efe6]">
              {t("🛒 ร้านค้าพ่อค้าระหว่างชั้น", "🛒 Floor Merchant Shop")}
            </h2>
          </div>
          <div className="flex items-center gap-1.5 rounded-xl border border-[#f6c945]/50 bg-[#281d08] px-3 py-1.5 text-xs font-extrabold text-[#ffe27a] pixel-font">
            <PixelSpriteView sprite={COIN_SPRITE} size={14} />
            <span>{coins}</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold text-[#c4bdd6]">
          <span>❤️ {hearts}/{maxHearts}</span>
          <span>•</span>
          <span>✨ {focus}/{maxFocus} MP</span>
          {floorShieldBonus > 0 && (
            <>
              <span>•</span>
              <span className="text-[#7dd3fc]">🛡️ +{floorShieldBonus}</span>
            </>
          )}
          {floorRewardMultiplier > 1 && (
            <>
              <span>•</span>
              <span className="text-[#ffe27a]">🔥 {floorRewardMultiplier}x</span>
            </>
          )}
        </div>

        <div className="space-y-2.5">
          {items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-xl border border-[#2f2d45] bg-[#1c1b2b] p-3"
            >
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-[#f4efe6] flex items-center gap-1.5">
                  <span>{item.icon}</span>
                  <span className="truncate">{item.name}</span>
                </p>
                <p className="text-[11px] text-[#9a93ad] mt-0.5">{item.desc}</p>
              </div>
              <button
                type="button"
                disabled={item.disabled}
                onClick={() => onBuyItem(item.id, item.cost)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-extrabold transition-colors cursor-pointer disabled:cursor-not-allowed ${
                  item.disabled
                    ? "border border-[#2f2d45] bg-[#141220] text-[#7c7491]"
                    : "bg-[#f6c945] text-[#120f1c] hover:bg-[#ffe27a]"
                }`}
              >
                {item.disabledReason
                  ? item.disabledReason
                  : t(`ซื้อ ${item.cost} 🪙`, `Buy ${item.cost} 🪙`)}
              </button>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] py-2.5 text-xs font-bold text-[#f4efe6] hover:bg-[#252238] cursor-pointer"
        >
          {t("ปิดร้านค้าและลุยต่อ (Esc)", "Close & Continue (Esc)")}
        </button>
      </div>
    </div>
  );
}
