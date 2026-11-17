"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUiLanguage } from "./LanguageProvider";

export default function SiteFooter() {
  const pathname = usePathname() || "";
  const { uiLang } = useUiLanguage();
  const isTh = uiLang === "th";

  // ซ่อน footer ในหน้าดันเจี้ยนเต็มจอ เพื่อไม่ให้บังพื้นที่ Canvas การเล่นเกม
  if (pathname.startsWith("/dungeon/")) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-[#2d2846] bg-[#0d0b14]/95 text-[#c4bdd6] py-5 px-4">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs leading-relaxed">
        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
          <span className="font-bold text-[#ffe27a]">CODE COOL</span>
          <span className="text-[#6f688a]">•</span>
          <span>
            {isTh
              ? "พัฒนาโดย Khantikun / Patcharaphol"
              : "Created by Khantikun / Patcharaphol"}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[#9a93ad]">
          <span>
            {isTh
              ? "วิทยาลัยเทคโนโลยีภาคตะวันออก (อี.เทค)"
              : "Eastern Technological College (E.Tech)"}
          </span>
          <span className="text-[#6f688a]">•</span>
          <Link
            href="/ai-log"
            className="text-[#c4bdd6] hover:text-[#ffe27a] underline underline-offset-2 transition-colors"
          >
            {isTh ? "บันทึกการใช้ AI" : "AI Usage Log"}
          </Link>
        </div>
      </div>
    </footer>
  );
}
