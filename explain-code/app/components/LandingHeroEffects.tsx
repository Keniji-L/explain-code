"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "./Icons";
import { useUiLanguage } from "./LanguageProvider";

const PREVIEW_LINES = [
  {
    line: 1,
    code: "let total = 0;",
    th: "สร้างตัวแปร total เพื่อสะสมผลรวมเริ่มต้นที่ 0",
    en: "Initialize total accumulator at 0",
  },
  {
    line: 2,
    code: "for (const n of scores) {",
    th: "วนลูปหยิบค่าคะแนนทีละตัวจาก scores",
    en: "Loop through each score in scores",
  },
  {
    line: 3,
    code: "  if (n >= 50) total += n;",
    th: "เช็กเงื่อนไข >= 50 แล้วบวกเข้า total",
    en: "Check n >= 50, then add to total",
  },
];

export function LandingHeroPreview() {
  const { t } = useUiLanguage();
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % PREVIEW_LINES.length);
    }, 2600);
    return () => window.clearInterval(timer);
  }, []);

  const current = PREVIEW_LINES[activeIdx];

  return (
    <div className="mt-8 mx-auto max-w-xl rounded-2xl border border-[#3d395a] bg-[#141220]/90 p-3.5 text-left shadow-xl backdrop-blur-xs hero-fade-in">
      <div className="flex items-center justify-between gap-2 pb-2 mb-2 border-b border-[#2f2d45]">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#ff4d6d]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#f6c945]/80" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#2fbf71]/80" />
          <span className="ml-2 text-[11px] font-bold text-[#9a93ad]">
            {t("ตัวอย่างการแกะโค้ดทีละบรรทัด", "Live Line-by-Line Preview")}
          </span>
        </div>
        <Link
          href="/explain"
          className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#f6c945] hover:underline"
        >
          <Icon name="sparkles" size={12} />
          <span>{t("ลองวางโค้ดของคุณ →", "Try Your Code →")}</span>
        </Link>
      </div>

      <div className="space-y-1 font-mono text-xs">
        {PREVIEW_LINES.map((item, idx) => {
          const isActive = idx === activeIdx;
          return (
            <button
              key={item.line}
              type="button"
              onClick={() => setActiveIdx(idx)}
              className={`w-full text-left flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 transition-all cursor-pointer ${
                isActive
                  ? "bg-[#5a2d91]/35 border border-[#9b5de5]/60 text-[#ffe27a]"
                  : "text-[#9a93ad] hover:bg-[#1c1b2b]"
              }`}
            >
              <span className="w-4 text-right text-[10px] opacity-70">{item.line}</span>
              <span className="truncate">{item.code}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-2.5 rounded-xl border border-[#2fbf71]/40 bg-[#102a1e]/80 px-3 py-2 text-xs text-[#86efac] flex items-center gap-2 transition-all">
        <Icon name="bulb" size={14} className="shrink-0 text-[#f6c945]" />
        <span>
          <strong className="text-[#ffe27a]">L{current.line}:</strong>{" "}
          {t(current.th, current.en)}
        </span>
      </div>
    </div>
  );
}
