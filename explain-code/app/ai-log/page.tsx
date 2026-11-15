"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SiteHeader } from "../components/SiteHeader";
import { Icon } from "../components/Icons";
import { useUiLanguage } from "../components/LanguageProvider";
import { AI_USAGE_LOGS, AiUsageLogItem } from "../lib/curriculum";
import { copyTextToClipboard } from "../lib/clipboard";

type FilterCategory = "all" | AiUsageLogItem["category"];

export default function AiUsageLogPage() {
  const { t } = useUiLanguage();
  const [selectedCategory, setSelectedCategory] = useState<FilterCategory>("all");
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">("idle");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) {
        clearTimeout(copyTimerRef.current);
      }
    };
  }, []);

  const filteredLogs =
    selectedCategory === "all"
      ? AI_USAGE_LOGS
      : AI_USAGE_LOGS.filter((item) => item.category === selectedCategory);

  const handleCopyFullReport = async () => {
    const lines: string[] = [
      "บันทึกการใช้ AI (AI Usage Log) — โครงการ CODE COOL (ExplainCode)",
      "การแข่งขัน Vibe Coding 2026: Innovating Classrooms for a Sustainable Future",
      "==================================================================",
      "",
    ];

    AI_USAGE_LOGS.forEach((log) => {
      lines.push(`${log.promptTitle}`);
      lines.push(`- หมวดหมู่: ${log.categoryLabel}`);
      lines.push(`- เครื่องมือ AI ที่ใช้: ${log.aiTool}`);
      lines.push(`- คำสั่ง (Prompt) ที่ใช้จริง: ${log.promptText}`);
      lines.push(`- ปัญหาที่พบจากผลลัพธ์ของ AI: ${log.problemFound}`);
      lines.push(`- วิธีการปรับปรุงแก้ไขของทีม: ${log.solutionApplied}`);
      lines.push(`- คำอธิบายโครงสร้างและการทำงานของโค้ด: ${log.codeExplanation}`);
      lines.push(`- ไฟล์ที่เกี่ยวข้อง: ${log.relatedFiles.join(", ")}`);
      lines.push("");
    });

    const reportText = lines.join("\n");
    const copied = await copyTextToClipboard(reportText);

    if (copyTimerRef.current) {
      clearTimeout(copyTimerRef.current);
    }
    setCopyStatus(copied ? "copied" : "failed");
    copyTimerRef.current = setTimeout(() => {
      setCopyStatus("idle");
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#f4efe6] flex flex-col">
      <div className="no-print">
        <SiteHeader />
      </div>

      <main className="mx-auto flex-1 max-w-5xl w-full min-w-0 px-4 py-8 sm:px-6 sm:py-12 flex flex-col gap-6">
        {/* Header Banner */}
        <section className="rounded-2xl border-2 border-[#2f2d45] bg-[#141220] p-6 sm:p-8 shadow-lg">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2 max-w-3xl min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-[#25193b] border border-[#9b5de5]/60 px-3.5 py-1 text-xs font-extrabold text-[#ffe27a]">
                <Icon name="clipboard" className="h-3.5 w-3.5 text-[#f6c945]" />
                <span>
                  {t(
                    "เอกสารส่งมอบรายการที่ 4 · บันทึกการใช้ AI (AI Usage Log)",
                    "Deliverable 4 · AI Usage Log"
                  )}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-[#f4efe6]">
                {t(
                  "บันทึกการใช้ AI พัฒนาโปรเจกต์ “CODE COOL”",
                  'AI Usage Log for "CODE COOL"'
                )}
              </h1>
              <p className="text-sm text-[#9a93ad] leading-relaxed">
                {t(
                  "รวบรวมคำสั่ง (Prompt) ที่ใช้จริงในการพัฒนาระบบและสร้างภาพประกอบ/ไอคอน พร้อมระบุเครื่องมือ AI ที่ใช้ ปัญหาที่พบจากผลลัพธ์ของ AI วิธีการปรับปรุงแก้ไขของทีม และคำอธิบายโครงสร้างการทำงานของโค้ดตามกติกาการแข่งขัน Vibe Coding 2026 (หน้า 4–5)",
                  "Documents actual prompts used to build the system and generate visual assets/icons, along with AI tools used, issues encountered, team refinements, and code structure explanations per Vibe Coding 2026 competition rules (pages 4–5)."
                )}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 no-print">
              <button
                type="button"
                onClick={() => void handleCopyFullReport()}
                className="retro-button inline-flex items-center gap-2 rounded-xl bg-[#f6c945] px-4 py-2.5 text-xs sm:text-sm font-extrabold text-[#120f1c] hover:bg-[#ffe27a] transition-colors cursor-pointer"
              >
                <Icon name="clipboard" className="h-4 w-4 shrink-0" />
                <span aria-live="polite">
                  {copyStatus === "copied"
                    ? t(
                        "คัดลอกบันทึก AI ทั้งหมดแล้ว!",
                        "Copied full AI Log!"
                      )
                    : copyStatus === "failed"
                    ? t(
                        "ไม่สามารถคัดลอกอัตโนมัติได้",
                        "Unable to copy automatically"
                      )
                    : t("คัดลอกรายงาน AI Log", "Copy AI Log Report")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2.5 text-xs sm:text-sm font-bold text-[#f4efe6] hover:border-[#f6c945]/70 hover:bg-[#252238] transition-colors cursor-pointer"
              >
                <span>{t("พิมพ์ / บันทึก PDF", "Print / Save PDF")}</span>
              </button>
            </div>
          </div>

          {/* Compliance Summary Strip */}
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-5 border-t border-[#2f2d45]">
            <div className="rounded-xl bg-[#1c1b2b] border border-[#2f2d45] p-3.5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#281d08] border border-[#f6c945]/50 text-[#f6c945]">
                <Icon name="sparkles" className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#9a93ad]">
                  {t("จำนวน Prompt ที่บันทึก", "Logged Prompts")}
                </div>
                <div className="text-base font-extrabold text-[#ffe27a]">
                  {t(
                    `${AI_USAGE_LOGS.length} รายการ (เกณฑ์ขั้นต่ำ ≥ 5)`,
                    `${AI_USAGE_LOGS.length} entries (min ≥ 5)`
                  )}
                </div>
                <div className="text-[11px] text-[#c4bdd6] mt-0.5">
                  {t(
                    "ระบุเครื่องมือ AI ปัญหา และวิธีแก้ครบทุกข้อ",
                    "Includes AI tool, issues found, and fixes for every entry"
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#1c1b2b] border border-[#2f2d45] p-3.5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#102a1e] border border-[#2fbf71]/50 text-[#86efac]">
                <Icon name="shield" className="h-4 w-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-[#9a93ad]">
                  {t("ความปลอดภัย & PDPA", "Security & PDPA")}
                </div>
                <div className="text-base font-extrabold text-[#86efac]">
                  {t(
                    "ซ่อน API Key & ใช้ชื่อสมมติ",
                    "Hidden API Keys & Pseudonyms"
                  )}
                </div>
                <div className="text-[11px] text-[#c4bdd6] mt-0.5">
                  {t(
                    "เรียก AI เฉพาะฝั่ง Server + แฮช PIN SHA-256",
                    "Server-only AI calls + SHA-256 PIN hashing"
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-[#1c1b2b] border border-[#2f2d45] p-3.5 flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg overflow-hidden bg-[#0d0b14] border border-[#f6c945]/60">
                <Image
                  src="/logo.png"
                  alt={t("โลโก้ CODE COOL", "CODE COOL Logo")}
                  width={36}
                  height={36}
                  className="h-full w-full object-contain"
                />
              </div>
              <div>
                <div className="text-xs font-bold text-[#9a93ad]">
                  {t("ทรัพย์สินภาพและไอคอน AI", "AI Visual Assets & Icons")}
                </div>
                <div className="text-base font-extrabold text-[#f4efe6]">
                  {t("บันทึก logo.png & Favicon", "Logged logo.png & Favicon")}
                </div>
                <div className="text-[11px] text-[#c4bdd6] mt-0.5">
                  {t(
                    "ตามกติกาข้อ 2.2 หน้า 4 + สไปรต์โค้ด CC0",
                    "Per Rule 2.2 (p.4) + CC0 code-drawn sprites"
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Category Filter Tabs */}
        <section className="flex flex-wrap items-center justify-between gap-3 no-print">
          <div className="flex flex-wrap items-center gap-2">
            {[
              {
                id: "all" as const,
                label: t(
                  `ทั้งหมด (${AI_USAGE_LOGS.length})`,
                  `All (${AI_USAGE_LOGS.length})`
                ),
              },
              {
                id: "architecture" as const,
                label: t("สถาปัตยกรรมการเรียนรู้", "Learning Architecture"),
              },
              {
                id: "code" as const,
                label: t("เอนจินรันโค้ด & เกม RPG", "Code Engine & RPG Game"),
              },
              {
                id: "security" as const,
                label: t("API หลังบ้าน & PDPA", "Backend API & PDPA"),
              },
              {
                id: "ui" as const,
                label: t("แดชบอร์ดครู & UI", "Teacher Dashboard & UI"),
              },
              {
                id: "asset" as const,
                label: t(
                  "โลโก้ & ไอคอน AI (logo.png)",
                  "AI Logo & Icons (logo.png)"
                ),
              },
            ].map((tab) => {
              const active = selectedCategory === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold transition cursor-pointer ${
                    active
                      ? "bg-[#5a2d91] text-[#ffe27a] border border-[#f6c945]/80"
                      : "bg-[#141220] hover:bg-[#1c1b2b] text-[#c4bdd6] border border-[#2f2d45]"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <Link
            href="/dungeon/credits"
            className="text-xs font-bold text-[#ffe27a] hover:underline flex items-center gap-1"
          >
            <span>
              {t(
                "ดูรายละเอียดลิขสิทธิ์ทรัพย์สิน (Credits & CC0) →",
                "View Asset Licenses (Credits & CC0) →"
              )}
            </span>
          </Link>
        </section>

        {/* AI Usage Log Cards */}
        <section className="space-y-5">
          {filteredLogs.map((log) => (
            <article
              key={log.id}
              className="rounded-2xl border-2 border-[#2f2d45] bg-[#141220] p-5 sm:p-6 flex flex-col gap-4 shadow-md"
            >
              {/* Top Row: Title + Category + AI Tool Badge */}
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#2f2d45] pb-3.5">
                <div className="min-w-0 flex-1">
                  <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#c084fc]">
                    {log.categoryLabel}
                  </span>
                  <h2 className="text-lg sm:text-xl font-extrabold text-[#ffe27a] mt-0.5 break-words">
                    {log.promptTitle}
                  </h2>
                </div>

                <div className="inline-flex max-w-full items-center gap-2 rounded-xl bg-[#1c1b2b] border border-[#3d395a] px-3 py-1.5 text-xs font-bold text-[#f4efe6] break-words">
                  <Icon name="sparkles" className="h-3.5 w-3.5 text-[#f6c945] shrink-0" />
                  <span>
                    {t("เครื่องมือ AI:", "AI Tool:")} {log.aiTool}
                  </span>
                </div>
              </div>

              {/* Special Visual Preview for Prompt 7 (logo.png & Favicon) */}
              {log.category === "asset" && (
                <div className="rounded-xl bg-[#1c1b2b] border border-[#f6c945]/40 p-4 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="h-16 w-16 rounded-2xl bg-[#0d0b14] border-2 border-[#f6c945] p-1.5 flex items-center justify-center shadow-md">
                      <Image
                        src="/logo.png"
                        alt={t("ตัวอย่างโลโก้ logo.png", "logo.png preview")}
                        width={64}
                        height={64}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="h-10 w-10 rounded-xl bg-[#0d0b14] border border-[#3d395a] p-1 flex items-center justify-center">
                      <Image
                        src="/logo.png"
                        alt={t("ตัวอย่าง Favicon 32x32", "Favicon 32x32 preview")}
                        width={32}
                        height={32}
                        className="h-full w-full object-contain"
                      />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 text-xs text-[#c4bdd6] space-y-1">
                    <div className="font-extrabold text-[#ffe27a]">
                      {t(
                        "บันทึกการใช้ Generative AI สร้างภาพประกอบและไอคอนตามกติกาข้อ 2.2 (หน้า 4)",
                        "Generative AI visual assets & icon log per competition rule 2.2 (p. 4)"
                      )}
                    </div>
                    <p className="break-words">
                      {t("ไฟล์ต้นฉบับ", "Source file")}{" "}
                      <code className="text-xs break-all text-[#f4efe6]">public/logo.png</code>{" "}
                      {t(
                        "ถูกนำไปแปลงด้วยสคริปต์รักษาสัดส่วนภาพ (Square Padding + LANCZOS Resampling) เพื่อสร้าง",
                        "was processed with aspect-preserving Square Padding + LANCZOS resampling to generate"
                      )}{" "}
                      <code className="text-xs break-all text-[#f4efe6]">app/favicon.ico</code>{" "}
                      (16×16, 32×32, 48×48, 64×64),{" "}
                      <code className="text-xs break-all text-[#f4efe6]">app/icon.png</code>{" "}
                      (192×192){" "}
                      {t("และ", "and")}{" "}
                      <code className="text-xs break-all text-[#f4efe6]">app/apple-icon.png</code>{" "}
                      (180×180)
                    </p>
                  </div>
                </div>
              )}

              {/* Prompt Text */}
              <div className="rounded-xl bg-[#0d0b14] border border-[#2f2d45] p-4 text-sm text-[#f4efe6] leading-relaxed">
                <div className="text-xs font-extrabold text-[#c084fc] mb-1">
                  {t(
                    "คำสั่ง (Prompt) ที่ใช้สั่งงาน AI จริง:",
                    "Actual Prompt Used:"
                  )}
                </div>
                <p className="font-medium break-words">&ldquo;{log.promptText}&rdquo;</p>
              </div>

              {/* Problem Found & Solution Applied */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs sm:text-sm">
                <div className="rounded-xl bg-[#2d141c] border border-[#c0283a]/50 p-4 text-[#fca5a5]">
                  <div className="font-extrabold flex items-center gap-1.5 mb-1">
                    <span>
                      {t(
                        "⚠️ ปัญหา/ข้อจำกัดที่พบจากผลลัพธ์ของ AI:",
                        "⚠️ Issues / Limitations Found in AI Output:"
                      )}
                    </span>
                  </div>
                  <p className="text-[#f4efe6]/90 leading-relaxed break-words">{log.problemFound}</p>
                </div>

                <div className="rounded-xl bg-[#102a1e] border border-[#2fbf71]/50 p-4 text-[#86efac]">
                  <div className="font-extrabold flex items-center gap-1.5 mb-1">
                    <span>
                      {t(
                        "🛠️ วิธีการที่ทีมปรับปรุงแก้ไขและพัฒนาต่อ:",
                        "🛠️ Team Refinements & Fixes Applied:"
                      )}
                    </span>
                  </div>
                  <p className="text-[#f4efe6]/90 leading-relaxed break-words">{log.solutionApplied}</p>
                </div>
              </div>

              {/* Code Structure & Explanation (Rubric Part 4: 10 points) */}
              <div className="rounded-xl bg-[#1c1b2b] border border-[#3d395a] p-4 text-xs sm:text-sm">
                <div className="font-extrabold text-[#ffe27a] mb-1">
                  {t(
                    "🔍 คำอธิบายโครงสร้างและการทำงานของโค้ด (Code Structure & Execution Flow):",
                    "🔍 Code Structure & Execution Flow:"
                  )}
                </div>
                <p className="text-[#c4bdd6] leading-relaxed break-words">{log.codeExplanation}</p>
                <div className="mt-2.5 flex min-w-0 flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-[#9a93ad]">
                    {t("ไฟล์ที่เกี่ยวข้อง:", "Related Files:")}
                  </span>
                  {log.relatedFiles.map((file) => (
                    <code
                      key={file}
                      className="max-w-full break-all rounded-md bg-[#0d0b14] border border-[#2f2d45] px-2 py-0.5 text-[11px] font-bold text-[#ffe27a]"
                    >
                      {file}
                    </code>
                  ))}
                </div>
              </div>
            </article>
          ))}
        </section>
      </main>
    </div>
  );
}
