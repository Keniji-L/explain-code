"use client";

import React from "react";
import Link from "next/link";
import { useUiLanguage } from "../../components/LanguageProvider";

export default function DungeonCreditsPage() {
  const { t } = useUiLanguage();

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12 flex flex-col gap-6">
      <div className="flex items-center justify-between border-b border-[#2f2d45] pb-4">
        <Link
          href="/dungeon"
          className="retro-button px-3.5 py-1.5 rounded-lg bg-[#252238] hover:bg-[#322c4a] text-xs font-bold text-[#f4efe6] transition-colors"
        >
          {t("← กลับหน้าฮับดันเจี้ยน", "← Back to Dungeon Hub")}
        </Link>
        <span className="pixel-font text-xs text-[#f6c945]">CREDITS &amp; LICENSES</span>
      </div>

      <div className="retro-panel rounded-2xl p-6 sm:p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#f4efe6] flex items-center gap-3">
            <span>
              {t(
                "รายการทรัพย์สินและสิทธิ์การใช้งาน (Credits)",
                "Assets & Licenses (Credits)"
              )}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-[#9a93ad] mt-1">
            {t(
              "Dungeon Crawler โหมดการเรียนรู้ของ “CODE COOL” พัฒนาขึ้นโดยเคารพลิขสิทธิ์และสิทธิ์ทรัพย์สินทางปัญญา 100%",
              'The "CODE COOL" Dungeon Crawler learning mode is built with 100% respect for copyright and intellectual property.'
            )}
          </p>
        </div>

        <section className="space-y-2 border-t border-[#2f2d45] pt-4">
          <h2 className="text-sm font-bold text-[#ffe27a] pixel-font">
            1. PIXEL ART SPRITES &amp; TILES (CC0 1.0 UNIVERSAL)
          </h2>
          <p className="text-xs text-[#f4efe6] leading-relaxed">
            {t(
              "ภาพสไปรต์ตัวละคร (Knight, Mage, Rogue, Ranger), มอนสเตอร์, บอส, แผ่นกระเบื้องพื้น กำแพง ประตู คบเพลิง และไอคอน HUD วาดขึ้นด้วยโค้ดโดยตรง (Code-Drawn Vector Pixel Matrices) ในไฟล์",
              "Character sprites (Knight, Mage, Rogue, Ranger), monsters, bosses, floor/wall tiles, doors, torches, and HUD icons are code-drawn directly (Vector Pixel Matrices) in"
            )}{" "}
            <code className="text-[#ffe27a]">app/lib/dungeon/sprites.ts</code>{" "}
            {t(
              "และเผยแพร่แบบ Creative Commons Zero (CC0 1.0 Universal) ไม่มีการดึงภาพมีลิขสิทธิ์จากเกมอื่น",
              "and released under Creative Commons Zero (CC0 1.0 Universal), with zero copyrighted assets from external games."
            )}
          </p>
        </section>

        <section className="space-y-2 border-t border-[#2f2d45] pt-4">
          <h2 className="text-sm font-bold text-[#ffe27a] pixel-font">
            2. COLOR PALETTE (26-COLOR DUNGEON PALETTE)
          </h2>
          <p className="text-xs text-[#f4efe6] leading-relaxed">
            {t(
              "ชุดสี 26 สีอิงมาตรฐานการออกแบบพิกเซลความคมชัดสูง (ดัดแปลงจากหลักการของ EDG 32) ออกแบบให้มีคอนทราสต์ชัดเจน มองเห็นง่ายบนจอมือถือและจอเดสก์ท็อป กำหนดเป็น Design Token ตัวแปรเดียวใน",
              "A 26-color high-contrast pixel palette (adapted from EDG 32 principles) designed for clear visibility on mobile and desktop screens, defined as single-source design tokens in"
            )}{" "}
            <code className="text-[#ffe27a]">app/lib/dungeon/palette.ts</code>
          </p>
        </section>

        <section className="space-y-2 border-t border-[#2f2d45] pt-4">
          <h2 className="text-sm font-bold text-[#ffe27a] pixel-font">
            3. FONTS (SIL OPEN FONT LICENSE 1.1)
          </h2>
          <ul className="text-xs text-[#f4efe6] space-y-2 list-disc list-inside">
            <li>
              <strong>Noto Sans Thai</strong> (Google Fonts / OFL 1.1):{" "}
              {t(
                "ใช้แสดงข้อความคำถามภาษาไทย เนื้อหาบทเรียน และคำอธิบาย เพื่อให้อ่านง่ายถูกต้องตามหลักสรีรศาสตร์การอ่าน",
                "Used for Thai questions, lesson content, and explanations for optimal readability."
              )}
            </li>
            <li>
              <strong>Silkscreen</strong>{" "}
              {t("โดย Jason Kottke", "by Jason Kottke")} (Google Fonts / OFL 1.1):{" "}
              {t(
                "ใช้แสดงหัวข้อภาษาอังกฤษ ตัวเลข และสถิติ HUD สไตล์เรโทร",
                "Used for retro-style English headings, numbers, and HUD statistics."
              )}
            </li>
          </ul>
        </section>

        <section className="space-y-2 border-t border-[#2f2d45] pt-4">
          <h2 className="text-sm font-bold text-[#ffe27a] pixel-font">
            4. AUDIO SYNTHESIZER
          </h2>
          <p className="text-xs text-[#f4efe6] leading-relaxed">
            {t(
              "เสียงเอฟเฟกต์สร้างผ่าน HTML5 Web Audio API ด้วยคลื่นเสียงสังเคราะห์ (Square / Triangle wave chiptune) ในโค้ดโดยตรง ไม่ใช้ไฟล์เสียง MP3/WAV ภายนอก และเริ่มต้นปิดเสียง (Muted) ตามมาตรฐานความพึงพอใจของผู้ใช้",
              "Sound effects are synthesized directly via the HTML5 Web Audio API (Square / Triangle wave chiptune) with no external MP3/WAV files, and start muted by default."
            )}
          </p>
        </section>

        <section className="space-y-2 border-t border-[#2f2d45] pt-4">
          <h2 className="text-sm font-bold text-[#ffe27a] pixel-font">
            5. GENERATIVE AI VISUAL ASSETS &amp; AI USAGE LOG
          </h2>
          <p className="text-xs text-[#f4efe6] leading-relaxed">
            {t("โลโก้หลักของระบบ (", "The main system logo (")}
            <code className="text-[#ffe27a]">public/logo.png</code>
            {t(") และชุดไอคอนเว็บไซต์ (", ") and website icon set (")}
            <code className="text-[#ffe27a]">app/favicon.ico</code>,{" "}
            <code className="text-[#ffe27a]">app/icon.png</code>,{" "}
            <code className="text-[#ffe27a]">app/apple-icon.png</code>
            {t(
              ") สร้างและปรับแต่งด้วย Generative AI ร่วมกับสคริปต์จัดสัดส่วนภาพตามกติกาข้อ 2.2 (หน้า 4) โดยสามารถดูรายละเอียดคำสั่ง Prompt ปัญหาที่พบ และวิธีปรับปรุงแก้ไขทั้งหมดได้ที่หน้า ",
              ") were generated and refined using Generative AI with an aspect-preserving script per Rule 2.2 (p. 4). View all prompts, issues, and refinements on the "
            )}
            <Link href="/ai-log" className="text-[#ffe27a] font-bold underline">
              {t("บันทึกการใช้ AI (AI Usage Log)", "AI Usage Log")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
