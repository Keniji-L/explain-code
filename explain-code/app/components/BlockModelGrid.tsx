"use client";

import React, { useState } from "react";
import {
  BLOCK_MODEL_CELLS,
  BlockCellId,
  BlockCellMeta,
  getMasteryStatus,
  TOPICS,
} from "../lib/curriculum";
import { Icon } from "./Icons";
import { useUiLanguage } from "./LanguageProvider";

interface BlockModelGridProps {
  cellScores: Record<BlockCellId, number>;
  title?: string;
  subtitle?: string;
  onSelectTopic?: (topicId: number) => void;
  showLegend?: boolean;
}

const LEVELS: {
  level: 1 | 2 | 3 | 4;
  labelTh: string;
  labelEn: string;
  descTh: string;
  descEn: string;
}[] = [
  {
    level: 1,
    labelTh: "ระดับ 1 · คำสั่งเดี่ยว (Atom)",
    labelEn: "Level 1 · Atom",
    descTh: "บรรทัดเดียว ตัวแปร เครื่องหมาย",
    descEn: "Single line, variables, operators",
  },
  {
    level: 2,
    labelTh: "ระดับ 2 · บล็อกคำสั่ง (Block)",
    labelEn: "Level 2 · Block",
    descTh: "กลุ่มคำสั่ง if/else, ลูป for/while",
    descEn: "Control blocks: if/else, for/while loops",
  },
  {
    level: 3,
    labelTh: "ระดับ 3 · ความสัมพันธ์ (Relation)",
    labelEn: "Level 3 · Relation",
    descTh: "การเชื่อมตัวแปร พารามิเตอร์ return",
    descEn: "Variable flow, parameters, return values",
  },
  {
    level: 4,
    labelTh: "ระดับ 4 · ภาพรวมโปรแกรม (Macro)",
    labelEn: "Level 4 · Macro",
    descTh: "โครงสร้างรวมและเป้าหมายทั้งโปรแกรม",
    descEn: "Overall structure and program purpose",
  },
];

const DIMENSIONS: {
  dim: "T" | "E" | "F";
  labelTh: string;
  labelEn: string;
  subTh: string;
  subEn: string;
}[] = [
  {
    dim: "T",
    labelTh: "โครงสร้างโค้ด (Text Surface)",
    labelEn: "Text Surface (T)",
    subTh: "เขียนอย่างไรตามไวยากรณ์",
    subEn: "Syntax & code structure",
  },
  {
    dim: "E",
    labelTh: "การทำงานจริง (Execution)",
    labelEn: "Execution (E)",
    subTh: "ลำดับรันและค่าตัวแปร",
    subEn: "Runtime order & variable values",
  },
  {
    dim: "F",
    labelTh: "หน้าที่และเป้าหมาย (Function)",
    labelEn: "Function (F)",
    subTh: "มีไว้ทำไม แก้ปัญหาอะไร",
    subEn: "Purpose & problem solved",
  },
];

const MASTERY_DUNGEON_STYLES: Record<
  "good" | "mid" | "low",
  {
    cardClass: string;
    selectedClass: string;
  }
> = {
  good: {
    cardClass:
      "bg-[#102a1e] text-[#86efac] border-[#2fbf71]/50 hover:border-[#2fbf71]",
    selectedClass: "border-[#2fbf71] ring-2 ring-[#2fbf71]/40",
  },
  mid: {
    cardClass:
      "bg-[#281d08] text-[#ffe27a] border-[#f6c945]/50 hover:border-[#f6c945]",
    selectedClass: "border-[#f6c945] ring-2 ring-[#f6c945]/40",
  },
  low: {
    cardClass:
      "bg-[#2d141c] text-[#fca5a5] border-[#c0283a]/60 hover:border-[#ff6b81]",
    selectedClass: "border-[#ff6b81] ring-2 ring-[#ff6b81]/40",
  },
};

export function BlockModelGrid({
  cellScores,
  title,
  subtitle,
  onSelectTopic,
  showLegend = true,
}: BlockModelGridProps) {
  const { uiLang, t } = useUiLanguage();
  const [selectedCell, setSelectedCell] = useState<BlockCellMeta | null>(null);
  const resolvedTitle =
    title ?? t("แผนที่ความเข้าใจ 12 ช่อง (Block Model)", "12-Cell Block Model Map");
  const resolvedSubtitle =
    subtitle ??
    t(
      "แสดงความเข้าใจแยกตามระดับของโค้ด 4 ระดับ × มิติความเข้าใจ 3 ด้าน (มีข้อความกำกับสถานะทุกช่อง)",
      "Shows code comprehension across 4 levels × 3 dimensions (with mastery status labels)"
    );

  return (
    <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-5 flex flex-col gap-4 text-[#f4efe6]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-[16px] font-extrabold text-[#f4efe6] flex items-center gap-2">
            <Icon name="grid" size={20} className="text-[#f6c945]" />
            <span>{resolvedTitle}</span>
          </h3>
          <p className="text-[13px] font-semibold text-[#9a93ad] mt-0.5">{resolvedSubtitle}</p>
        </div>

        {showLegend && (
          <div className="flex flex-wrap items-center gap-2 text-[13px] font-semibold">
            <span className="px-2.5 py-1 rounded-lg bg-[#102a1e] text-[#86efac] border border-[#2fbf71]/50 flex items-center gap-1">
              <Icon name="check" size={16} />
              <span>{t("เก่ง 80% ขึ้นไป", "Mastered 80%+")}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#281d08] text-[#ffe27a] border border-[#f6c945]/50 flex items-center gap-1">
              <Icon name="star" size={16} />
              <span>{t("กลาง 50–79%", "Developing 50–79%")}</span>
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-[#2d141c] text-[#fca5a5] border border-[#c0283a]/60 flex items-center gap-1">
              <Icon name="bulb" size={16} />
              <span>{t("ควรทบทวน ต่ำกว่า 50%", "Review < 50%")}</span>
            </span>
          </div>
        )}
      </div>

      {/* มือถือ: การ์ดเรียงตามระดับ 4 ระดับ (ไม่ตัดขอบขวา) */}
      <div className="md:hidden flex flex-col gap-3">
        {LEVELS.map((lv) => (
          <div
            key={lv.level}
            className="bg-[#1c1b2b] border border-[#2f2d45] rounded-xl p-3 flex flex-col gap-2"
          >
            <div>
              <div className="text-[13px] font-extrabold text-[#f4efe6]">
                {t(lv.labelTh, lv.labelEn)}
              </div>
              <div className="text-[11px] text-[#9a93ad]">
                {t(lv.descTh, lv.descEn)}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {DIMENSIONS.map((d) => {
                const cellId = `${d.dim}${lv.level}` as BlockCellId;
                const meta = BLOCK_MODEL_CELLS.find((c) => c.id === cellId)!;
                const score = cellScores[cellId] ?? 50;
                const status = getMasteryStatus(score, uiLang);
                const dungeonStyle = MASTERY_DUNGEON_STYLES[status.level];
                const isSelected = selectedCell?.id === cellId;

                return (
                  <button
                    key={cellId}
                    type="button"
                    onClick={() => setSelectedCell(meta)}
                    className={`w-full rounded-xl px-3 py-2.5 text-left border transition cursor-pointer flex items-center justify-between gap-2 ${
                      dungeonStyle.cardClass
                    } ${isSelected ? dungeonStyle.selectedClass : ""}`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="shrink-0 px-2 py-0.5 rounded-md bg-[#0d0b14]/80 border border-white/15 text-[#f4efe6] text-[11px] font-extrabold">
                        {cellId}
                      </span>
                      <span className="text-[12px] font-bold text-[#f4efe6] truncate">
                        {t(meta.shortTitle, meta.shortTitleEn || meta.shortTitle)}
                      </span>
                    </div>
                    <span className="shrink-0 text-[13px] font-extrabold whitespace-nowrap">
                      {score}% · {status.shortLabel}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* คอม/แท็บเล็ต: ตาราง 4 ระดับ x 3 มิติ = 12 ช่อง */}
      <div className="hidden md:block overflow-x-auto">
        <div className="min-w-[680px] flex flex-col gap-2.5">
          {/* Header มิติทั้ง 3 */}
          <div className="grid grid-cols-12 gap-2.5">
            <div className="col-span-3 bg-[#1c1b2b] border border-[#2f2d45] rounded-xl p-2.5 flex flex-col justify-center">
              <span className="text-[13px] font-extrabold text-[#ffe27a]">
                {t("ระดับโค้ด \\ มิติความเข้าใจ", "Level \\ Dimension")}
              </span>
              <span className="text-[12px] text-[#9a93ad]">
                {t("คลิกที่ช่องเพื่อดูคำอธิบาย", "Click a cell for details")}
              </span>
            </div>
            {DIMENSIONS.map((d) => (
              <div
                key={d.dim}
                className="col-span-3 bg-[#1c1b2b] border border-[#3d395a] rounded-xl p-2.5"
              >
                <div className="text-[13px] font-extrabold text-[#f4efe6]">
                  {t(d.labelTh, d.labelEn)}
                </div>
                <div className="text-[12px] text-[#9a93ad]">
                  {t(d.subTh, d.subEn)}
                </div>
              </div>
            ))}
          </div>

          {/* แถวทั้ง 4 ระดับ */}
          {LEVELS.map((lv) => (
            <div key={lv.level} className="grid grid-cols-12 gap-2.5 items-stretch">
              <div className="col-span-3 bg-[#1c1b2b] border border-[#2f2d45] rounded-xl p-3 flex flex-col justify-center">
                <span className="text-[13px] font-extrabold text-[#f4efe6]">
                  {t(lv.labelTh, lv.labelEn)}
                </span>
                <span className="text-[12px] text-[#9a93ad] mt-0.5">
                  {t(lv.descTh, lv.descEn)}
                </span>
              </div>

              {DIMENSIONS.map((d) => {
                const cellId = `${d.dim}${lv.level}` as BlockCellId;
                const meta = BLOCK_MODEL_CELLS.find((c) => c.id === cellId)!;
                const score = cellScores[cellId] ?? 50;
                const status = getMasteryStatus(score, uiLang);
                const dungeonStyle = MASTERY_DUNGEON_STYLES[status.level];
                const isSelected = selectedCell?.id === cellId;

                return (
                  <button
                    key={cellId}
                    type="button"
                    onClick={() => setSelectedCell(meta)}
                    className={`col-span-3 rounded-xl p-3 text-left border-2 transition cursor-pointer flex flex-col justify-between ${
                      dungeonStyle.cardClass
                    } ${isSelected ? dungeonStyle.selectedClass : ""}`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-[#0d0b14]/80 border border-white/15 text-[#f4efe6] text-[12px] font-extrabold">
                        {t("ช่อง", "Cell")} {cellId}
                      </span>
                      <span className="text-[15px] font-extrabold">{score}%</span>
                    </div>

                    <div className="text-[14px] font-extrabold mt-1.5 leading-snug text-[#f4efe6]">
                      {t(meta.shortTitle, meta.shortTitleEn || meta.shortTitle)}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-white/10 flex items-center justify-between text-[12px] font-bold">
                      <span className="flex items-center gap-1">
                        <Icon
                          name={
                            status.level === "good"
                              ? "check"
                              : status.level === "mid"
                              ? "star"
                              : "bulb"
                          }
                          size={14}
                        />
                        <span>{status.label}</span>
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* กล่องแสดงรายละเอียดเมื่อคลิกช่องใดช่องหนึ่ง */}
      {selectedCell && (
        <div className="bg-[#1c1b2b] border-2 border-[#f6c945]/75 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex-1 min-w-[240px]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#5a2d91] border border-[#9b5de5] text-[#ffe27a] text-[13px] font-extrabold">
                {t("ช่อง", "Cell")} {selectedCell.id}
              </span>
              <span className="text-[15px] font-extrabold text-[#ffe27a]">
                {t(selectedCell.shortTitle, selectedCell.shortTitleEn || selectedCell.shortTitle)} (
                {t(selectedCell.levelName, selectedCell.levelNameEn || selectedCell.levelName)} ·{" "}
                {t(selectedCell.dimensionName, selectedCell.dimensionNameEn || selectedCell.dimensionName)})
              </span>
            </div>
            <p className="text-[14px] text-[#f4efe6] mt-1">
              {t(selectedCell.description, selectedCell.descriptionEn || selectedCell.description)}
            </p>
            <p className="text-[13px] font-semibold text-[#9a93ad] mt-1">
              {t("ตัวอย่างคำถาม:", "Sample question:")} &ldquo;
              {t(selectedCell.exampleQuestion, selectedCell.exampleQuestionEn || selectedCell.exampleQuestion)}
              &rdquo;
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onSelectTopic && (
              <button
                type="button"
                onClick={() => onSelectTopic(selectedCell.relatedTopicId)}
                className="press-gold px-4 py-2 rounded-xl text-[14px] font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <Icon name="play" size={18} />
                <span>
                  {t("ฝึกช่องนี้ใน", "Practice in")}{" "}
                  {(() => {
                    const tp = TOPICS.find((item) => item.id === selectedCell.relatedTopicId);
                    return tp ? t(tp.shortName, tp.shortNameEn || tp.shortName) : "";
                  })()}
                </span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setSelectedCell(null)}
              aria-label={t("ปิดรายละเอียดช่อง Block Model", "Close Block Model cell details")}
              className="press-secondary p-2 rounded-xl cursor-pointer"
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
