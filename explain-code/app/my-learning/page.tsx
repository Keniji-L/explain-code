"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  SiteHeader,
  getClientSession,
  ClientAuthSession,
} from "../components/SiteHeader";
import { Icon } from "../components/Icons";
import { useUiLanguage } from "../components/LanguageProvider";
import { Course, Enrollment, Lesson, LessonProgress } from "../lib/supabase";
import {
  getLocalizedCourse,
  getLocalizedLesson,
  loadLocalCourses,
  loadLocalEnrollments,
  loadLocalLessonProgress,
  loadLocalLessons,
} from "../lib/lms-data";
import {
  DungeonSaveRecord,
  calculateDungeonSaveProgressPercent,
  loadUserDungeonSaves,
  mergeRemoteDungeonSaves,
} from "../lib/dungeon-save";
import { LANGUAGE_TRACKS } from "../lib/language-tracks";
import { BlockModelGrid } from "../components/BlockModelGrid";
import { BLOCK_MODEL_CELLS, BlockCellId } from "../lib/curriculum";
import {
  DailyQuestState,
  DAILY_QUEST_BONUS_XP,
  DAILY_QUEST_TARGET_FLOORS,
  claimDailyQuestBonus,
  loadDailyQuestState,
} from "../lib/daily-quest";

const EMPTY_CELL_SCORES: Record<BlockCellId, number> = {
  T1: 0,
  T2: 0,
  T3: 0,
  T4: 0,
  E1: 0,
  E2: 0,
  E3: 0,
  E4: 0,
  F1: 0,
  F2: 0,
  F3: 0,
  F4: 0,
};

export default function MyLearningPage() {
  const router = useRouter();
  const { uiLang, t } = useUiLanguage();
  const [session, setSession] = useState<ClientAuthSession | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [dungeonSaves, setDungeonSaves] = useState<DungeonSaveRecord[]>([]);
  const [cellScores, setCellScores] = useState<Record<BlockCellId, number>>({
    ...EMPTY_CELL_SCORES,
  });
  const [dailyQuest, setDailyQuest] = useState<DailyQuestState>({
    lastActiveDate: "",
    streakDays: 0,
    dailyFloorsCleared: 0,
    dailyBonusClaimed: false,
  });
  const [dailyClaimNotice, setDailyClaimNotice] = useState<string | null>(null);

  useEffect(() => {
    const syncState = () => {
      const current = getClientSession();
      if (!current) {
        router.replace("/login?redirect=/my-learning");
        return;
      }
      setSession(current);
      setCourses(loadLocalCourses());
      setLessons(loadLocalLessons());
      setEnrollments(loadLocalEnrollments());
      setProgress(loadLocalLessonProgress());
      setDungeonSaves(loadUserDungeonSaves(current.userId));
      setDailyQuest(loadDailyQuestState(current.userId));
      try {
        const rawStudents = localStorage.getItem("explain_code_students_v2");
        if (rawStudents) {
          const parsedStudents = JSON.parse(rawStudents) as Array<{
            id?: string;
            cellScores?: Partial<Record<BlockCellId, number>>;
          }>;
          const matched = Array.isArray(parsedStudents)
            ? parsedStudents.find((s) => s.id === current.userId)
            : null;
          if (matched?.cellScores) {
            setCellScores({ ...EMPTY_CELL_SCORES, ...matched.cellScores });
          }
        }
      } catch {
        // ignore storage errors
      }
    };

    syncState();

    const current = getClientSession();
    if (current) {
      fetch(`/api/lms?studentId=${encodeURIComponent(current.userId)}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!data) return;
          if (Array.isArray(data.courses) && data.courses.length > 0) {
            setCourses(data.courses);
          }
          if (Array.isArray(data.lessons) && data.lessons.length > 0) {
            setLessons(data.lessons);
          }
          if (Array.isArray(data.enrollments) && data.enrollments.length > 0) {
            setEnrollments((prev) => {
              const merged = [...data.enrollments];
              for (const le of prev) {
                if (
                  !merged.some(
                    (de) =>
                      de.course_id === le.course_id &&
                      de.student_id === le.student_id
                  )
                ) {
                  merged.push(le);
                }
              }
              return merged;
            });
          }
          if (Array.isArray(data.progress) && data.progress.length > 0) {
            setProgress((prev) => {
              const merged = [...data.progress];
              for (const lp of prev) {
                if (
                  !merged.some(
                    (dp) =>
                      dp.lesson_id === lp.lesson_id &&
                      dp.student_id === lp.student_id
                  )
                ) {
                  merged.push(lp);
                }
              }
              return merged;
            });
          }
          if (Array.isArray(data.dungeonSaves)) {
            setDungeonSaves(
              mergeRemoteDungeonSaves(current.userId, data.dungeonSaves)
            );
          }
        })
        .catch(() => {});

      fetch(`/api/attempts?studentId=${encodeURIComponent(current.userId)}&limit=30`)
        .then((res) => (res.ok ? res.json() : null))
        .then((attData) => {
          if (!attData || !Array.isArray(attData.attempts)) return;
          const remoteLatest: Partial<Record<BlockCellId, number>> = {};
          for (const att of attData.attempts) {
            if (!Array.isArray(att.attempt_cell_scores)) continue;
            for (const row of att.attempt_cell_scores) {
              const cid = row?.cell_id as BlockCellId | undefined;
              const sc = typeof row?.score === "number" ? row.score : null;
              if (cid && cid in EMPTY_CELL_SCORES && sc !== null && remoteLatest[cid] === undefined) {
                remoteLatest[cid] = sc;
              }
            }
          }
          if (Object.keys(remoteLatest).length > 0) {
            setCellScores((prev) => {
              const next = { ...prev };
              (Object.keys(remoteLatest) as BlockCellId[]).forEach((cid) => {
                next[cid] = Math.max(next[cid] ?? 0, remoteLatest[cid] ?? 0);
              });
              return next;
            });
          }
        })
        .catch(() => {});
    }

    window.addEventListener("explain-code-auth-change", syncState);
    window.addEventListener("storage", syncState);
    return () => {
      window.removeEventListener("explain-code-auth-change", syncState);
      window.removeEventListener("storage", syncState);
    };
  }, [router]);

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0b14] p-8 text-center text-sm text-[#9a93ad]">
        {t("กำลังตรวจสอบสิทธิ์การใช้งาน...", "Checking authorization...")}
      </div>
    );
  }

  const avgBlockMastery = Math.round(
    Object.values(cellScores).reduce((sum, val) => sum + val, 0) /
      Math.max(1, BLOCK_MODEL_CELLS.length)
  );
  const cellsByScoreAsc = [...BLOCK_MODEL_CELLS].sort(
    (a, b) => (cellScores[a.id] ?? 0) - (cellScores[b.id] ?? 0)
  );
  const weakestCell = cellsByScoreAsc[0] || BLOCK_MODEL_CELLS[0];
  const strongestCell = [...BLOCK_MODEL_CELLS].sort(
    (a, b) => (cellScores[b.id] ?? 0) - (cellScores[a.id] ?? 0)
  )[0];
  const preferredLang = dungeonSaves[0]?.language || "javascript";
  const hasAnyCellProgress = Object.values(cellScores).some((v) => v > 0);

  const myEnrollments = enrollments.filter(
    (e) => e.student_id === session.userId
  );
  const myProgress = progress.filter((p) => p.student_id === session.userId);

  // รวมคอร์สที่ลงทะเบียนแล้ว หรือมีประวัติการเปิดดูบทเรียน
  const activeCourseIds = new Set([
    ...myEnrollments.map((e) => e.course_id),
    ...myProgress.map((p) => p.course_id),
  ]);

  const myCourses = courses.filter((c) => activeCourseIds.has(c.id));

  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#f4efe6]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3d395a] bg-[#1c1b2b] px-3 py-1 text-xs font-bold text-[#f6c945]">
              <Icon name="award" className="h-3.5 w-3.5" />
              {t(
                `แดชบอร์ดการเรียนรู้ของ ${session.displayName || session.username}`,
                `${session.displayName || session.username}'s Learning Dashboard`
              )}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f4efe6]">
              {t("การเรียนของฉัน (My Learning)", "My Learning")}
            </h1>
            <p className="mt-1 text-sm text-[#9a93ad]">
              {t(
                "ติดตามความคืบหน้าของแต่ละคอร์ส ประวัติบทเรียนที่เรียนจบ และกดเรียนต่อจากจุดที่ค้างไว้ได้ทันที",
                "Track your progress across courses, completed lessons, and resume right where you left off."
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/courses"
              className="rounded-xl bg-[#2fbf71] px-4 py-2.5 text-xs font-extrabold text-[#0b0b14] shadow-md hover:bg-[#34d37d] transition-colors whitespace-nowrap"
            >
              {t("+ สำรวจคอร์สเรียนเพิ่ม", "+ Explore More Courses")}
            </Link>
            <Link
              href="/my-history"
              className="rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2.5 text-xs font-bold text-[#f4efe6] hover:border-[#f6c945] hover:bg-[#252238] transition-colors whitespace-nowrap"
            >
              {t("ประวัติการอธิบายโค้ด", "Explanation History")}
            </Link>
          </div>
        </div>

        {/* ==================== Daily Quest & Streak ==================== */}
        <section className="mb-6">
          <div className="rounded-2xl border border-[#f6c945]/40 bg-gradient-to-r from-[#22190c] via-[#171324] to-[#141220] p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-md">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#f6c945]/60 bg-[#281d08] px-2.5 py-0.5 text-[11px] font-black text-[#ffe27a] inline-flex items-center gap-1">
                  <Icon name="flame" size={12} filled />
                  <span>{t(`สตรีคต่อเนื่อง ${dailyQuest.streakDays} วัน`, `${dailyQuest.streakDays}-Day Streak`)}</span>
                </span>
                <span className="text-xs font-extrabold text-[#f4efe6]">
                  {t(
                    `ภารกิจรายวัน: ผ่าน ${Math.min(dailyQuest.dailyFloorsCleared, DAILY_QUEST_TARGET_FLOORS)}/${DAILY_QUEST_TARGET_FLOORS} ด่านวันนี้`,
                    `Daily Quest: Clear ${Math.min(dailyQuest.dailyFloorsCleared, DAILY_QUEST_TARGET_FLOORS)}/${DAILY_QUEST_TARGET_FLOORS} floor today`
                  )}
                </span>
              </div>
              <p className="text-xs text-[#c4bdd6]">
                {dailyQuest.dailyBonusClaimed
                  ? t(
                      `✓ รับโบนัส +${DAILY_QUEST_BONUS_XP} XP ประจำวันนี้แล้ว! กลับมาลุยต่อพรุ่งนี้เพื่อรักษาสตรีค`,
                      `✓ Claimed today's +${DAILY_QUEST_BONUS_XP} XP bonus! Come back tomorrow to keep your streak.`
                    )
                  : dailyQuest.dailyFloorsCleared >= DAILY_QUEST_TARGET_FLOORS
                  ? t(
                      `ทำภารกิจวันนี้สำเร็จแล้ว! กดรับโบนัส +${DAILY_QUEST_BONUS_XP} XP ได้เลย`,
                      `Daily quest complete! Claim your +${DAILY_QUEST_BONUS_XP} XP bonus now.`
                    )
                  : t(
                      `พิชิต 1 ด่านดันเจี้ยนวันนี้เพื่อรับโบนัส +${DAILY_QUEST_BONUS_XP} XP และต่อสตรีค`,
                      `Clear 1 dungeon floor today for +${DAILY_QUEST_BONUS_XP} XP and extend your streak.`
                    )}
              </p>
              {dailyClaimNotice && (
                <p className="text-xs font-bold text-[#86efac]">{dailyClaimNotice}</p>
              )}
            </div>
            <div className="shrink-0">
              {dailyQuest.dailyBonusClaimed ? (
                <span className="inline-flex items-center gap-1.5 rounded-xl border border-[#2fbf71]/50 bg-[#102a1e] px-4 py-2 text-xs font-extrabold text-[#86efac]">
                  ✓ {t("รับโบนัสวันนี้แล้ว", "Claimed Today")}
                </span>
              ) : dailyQuest.dailyFloorsCleared >= DAILY_QUEST_TARGET_FLOORS ? (
                <button
                  type="button"
                  onClick={() => {
                    const res = claimDailyQuestBonus(session.userId);
                    setDailyQuest(res.state);
                    if (res.claimed) {
                      try {
                        const rawStudents = localStorage.getItem("explain_code_students_v2");
                        if (rawStudents) {
                          const parsed = JSON.parse(rawStudents) as Array<{ id?: string; xp?: number }>;
                          if (Array.isArray(parsed)) {
                            const updated = parsed.map((s) =>
                              s.id === session.userId
                                ? { ...s, xp: (s.xp || 0) + res.bonusXp }
                                : s
                            );
                            localStorage.setItem("explain_code_students_v2", JSON.stringify(updated));
                          }
                        }
                      } catch {
                        // ignore
                      }
                      setDailyClaimNotice(
                        t(
                          `รับโบนัส +${res.bonusXp} XP เข้าโปรไฟล์เรียบร้อยแล้ว!`,
                          `Added +${res.bonusXp} XP bonus to your profile!`
                        )
                      );
                    }
                  }}
                  className="rounded-xl bg-[#f6c945] px-4 py-2.5 text-xs font-black text-[#120f1c] hover:bg-[#ffe27a] transition-colors cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Icon name="gift" size={13} />
                  <span>{t(`รับโบนัส +${DAILY_QUEST_BONUS_XP} XP`, `Claim +${DAILY_QUEST_BONUS_XP} XP`)}</span>
                </button>
              ) : (
                <Link
                  href={`/courses?lang=${encodeURIComponent(preferredLang)}`}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-[#2fbf71] px-4 py-2.5 text-xs font-black text-[#0b0b14] hover:bg-[#34d37d] transition-colors"
                >
                  <Icon name="play" size={13} filled />
                  <span>{t("ไปลุย 1 ด่านวันนี้ →", "Play 1 Floor Today →")}</span>
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* ==================== สเตตัส Block Model 12 มิติ & แนะนำด่านแก้จุดอ่อน ==================== */}
        <section className="mb-8 space-y-4">
          <div className="rounded-2xl border border-[#3d395a] bg-gradient-to-br from-[#171426] to-[#12101d] p-5 shadow-lg space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-extrabold text-[#ffe27a] flex items-center gap-2">
                  <Icon name="chart" size={18} className="text-[#ffe27a]" />
                  <span>
                    {t(
                      "สเตตัสความเข้าใจโค้ด 12 มิติ (Block Model Stats)",
                      "12-Cell Code Comprehension Stats (Block Model)"
                    )}
                  </span>
                </h2>
                <p className="text-xs text-[#9a93ad] mt-0.5">
                  {t(
                    "คลิกที่ช่องใดก็ได้ในตารางเพื่อวาร์ปไปฝึกด่านที่เน้นทักษะด้านนั้นโดยตรง",
                    "Click any cell in the grid to jump straight to a dungeon floor targeting that skill."
                  )}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-[#2fbf71]/50 bg-[#102a1e] px-3 py-1.5 text-xs font-extrabold text-[#86efac]">
                  {t("ค่าเฉลี่ยรวม", "Avg Mastery")}: {avgBlockMastery}%
                </span>
                {hasAnyCellProgress && strongestCell && (
                  <span className="rounded-xl border border-[#f6c945]/50 bg-[#281d08] px-3 py-1.5 text-xs font-extrabold text-[#ffe27a]">
                    {t("จุดแข็ง", "Top")}: {strongestCell.id} ({cellScores[strongestCell.id] ?? 0}%)
                  </span>
                )}
              </div>
            </div>

            {/* การ์ดแนะนำด่านแก้จุดอ่อนอัตโนมัติ */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-[#9b5de5]/50 bg-[#211638]/70 p-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#9b5de5] px-2 py-0.5 text-[10px] font-black text-[#f4efe6]">
                    {t("แนะนำสำหรับคุณ", "RECOMMENDED DRILL")}
                  </span>
                  <span className="text-xs font-extrabold text-[#ffe27a]">
                    {weakestCell.id} ·{" "}
                    {uiLang === "en"
                      ? weakestCell.shortTitleEn || weakestCell.shortTitle
                      : weakestCell.shortTitle}{" "}
                    ({cellScores[weakestCell.id] ?? 0}%)
                  </span>
                </div>
                <p className="text-xs text-[#c4bdd6]">
                  {uiLang === "en"
                    ? weakestCell.descriptionEn || weakestCell.description
                    : weakestCell.description}
                </p>
              </div>
              <Link
                href={`/courses?lang=${encodeURIComponent(preferredLang)}&topicId=${weakestCell.relatedTopicId}`}
                className="shrink-0 rounded-xl bg-[#f6c945] px-4 py-2.5 text-xs font-black text-[#120f1c] hover:bg-[#ffe27a] transition-colors text-center whitespace-nowrap inline-flex items-center justify-center gap-1.5"
              >
                <Icon name="target" size={13} />
                <span>
                  {t(
                    `ฝึกด่านแก้จุดอ่อน ${weakestCell.id} ทันที →`,
                    `Drill ${weakestCell.id} Now →`
                  )}
                </span>
              </Link>
            </div>

            <BlockModelGrid
              cellScores={cellScores}
              title={t("ตารางทักษะ Block Model (4 ระดับ × 3 มิติ)", "Block Model Skill Grid (4 Levels × 3 Dimensions)")}
              subtitle={t(
                "กดที่ช่องเพื่อเข้าฝึกด่านที่ตรงกับทักษะนั้น",
                "Click a cell to train the matching dungeon floor"
              )}
              onSelectTopic={(topicId) =>
                router.push(
                  `/courses?lang=${encodeURIComponent(preferredLang)}&topicId=${topicId}`
                )
              }
            />
          </div>
        </section>

        {/* ==================== ความคืบหน้าดันเจี้ยนการเรียนรู้ ==================== */}
        {dungeonSaves.length > 0 && (
          <section className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-[#ffe27a] flex items-center gap-2">
                <Icon name="gamepad" className="h-5 w-5 text-[#9b5de5]" />
                <span>
                  {t(
                    "ความคืบหน้าดันเจี้ยนการเรียนรู้ (เซฟเกมล่าสุด)",
                    "Learning Dungeon Progress (Latest Saves)"
                  )}
                </span>
              </h2>
              <Link
                href="/courses"
                className="text-xs font-bold text-[#9a93ad] hover:text-[#ffe27a] transition-colors"
              >
                {t("ไปหน้าดันเจี้ยนทั้งหมด →", "All Dungeons →")}
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {dungeonSaves.map((save) => {
                const trackMeta =
                  LANGUAGE_TRACKS.find((tr) => tr.id === save.language) ||
                  LANGUAGE_TRACKS[0];
                const pct = calculateDungeonSaveProgressPercent(save);
                const savedTimeText = (() => {
                  try {
                    return new Date(save.savedAt).toLocaleString(
                      uiLang === "en" ? "en-US" : "th-TH",
                      {
                        dateStyle: "short",
                        timeStyle: "short",
                      }
                    );
                  } catch {
                    return t("เมื่อสักครู่", "Just now");
                  }
                })();

                return (
                  <div
                    key={save.language}
                    className="rounded-2xl border border-[#5a2d91] bg-gradient-to-br from-[#1c152e] to-[#141220] p-5 shadow-lg flex flex-col justify-between gap-4"
                  >
                    <div>
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="rounded-full border border-[#9b5de5]/60 bg-[#25193b] px-3 py-0.5 text-[11px] font-extrabold text-[#e9d5ff]">
                          {trackMeta.name}
                        </span>
                        <span className="text-[11px] font-semibold text-[#9a93ad] inline-flex items-center gap-1">
                          <Icon name="save" size={11} />
                          <span>{t("เซฟล่าสุด:", "Last saved:")} {savedTimeText}</span>
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#f4efe6]">
                        {t(
                          `ถึงด่านที่ ${save.currentFloorNumber}/${save.totalFloors}`,
                          `Floor ${save.currentFloorNumber}/${save.totalFloors}`
                        )}{" "}
                        · {save.currentTopicTitle}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#c4bdd6]">
                        <span className="rounded-md border border-[#9b5de5]/60 bg-[#25193b] px-2 py-0.5 text-[11px] font-bold text-[#ffe27a] inline-flex items-center gap-1">
                          <Icon name="sword" size={11} />
                          <span>
                            {t("เฟสคำถามที่", "Phase")}{" "}
                          {save.currentPhaseNumber ||
                            (save.arenaSnapshot?.battlePhaseIndex ?? 0) + 1}
                          /
                          {save.totalPhases ||
                            save.arenaSnapshot?.battleTotalPhases ||
                            3}
                          </span>
                        </span>
                        <span>
                          {t(
                            `พิชิตแล้ว ${save.completedTopicIds.length} จาก ${save.totalFloors} ด่าน · สะสม ${save.xp} XP`,
                            `Cleared ${save.completedTopicIds.length} of ${save.totalFloors} floors · ${save.xp} XP`
                          )}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className="text-[#c4bdd6]">
                            {t("ความคืบหน้า", "Progress")}
                          </span>
                          <span className="text-[#2fbf71]">{pct}%</span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full border border-[#2f2d45] bg-[#0d0b14]">
                          <div
                            className="h-full rounded-full bg-[#2fbf71] transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>

                      {save.history && save.history.length > 0 && (
                        <div className="mt-3 border-t border-[#2f2d45] pt-2.5 space-y-1">
                          <p className="text-[11px] font-bold text-[#9a93ad]">
                            {t("ประวัติการเล่นล่าสุด:", "Recent runs:")}
                          </p>
                          {save.history.slice(0, 3).map((h, i) => (
                            <div
                              key={`${h.topicId}-${i}`}
                              className="flex items-center justify-between text-[11px] text-[#e8e1cf]"
                            >
                              <span className="truncate pr-2">{h.topicTitle}</span>
                              {h.topicTitle.includes("(จุดเซฟเกม") ||
                              h.topicTitle.includes("(Game Save") ? (
                                <span className="shrink-0 font-bold text-[#ffe27a]">
                                  {h.timestamp}
                                </span>
                              ) : (
                                <span className="shrink-0 font-bold text-[#86efac]">
                                  {h.scorePercent}% (+{h.xpEarned} XP)
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <Link
                      href={`/courses?lang=${save.language}&topicId=${save.currentTopicId}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#f6c945] px-4 py-2.5 text-xs font-extrabold text-[#120f1c] shadow-md hover:bg-[#ffe27a] transition-colors"
                    >
                      <Icon name="play" className="h-4 w-4" filled />
                      <span>
                        {t("เล่นต่อจากที่เซฟไว้ →", "Resume Saved Run →")}
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {myCourses.length === 0 && dungeonSaves.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[#3d395a] bg-[#141220] p-12 text-center shadow-lg">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#3d395a] bg-[#1c1b2b] text-[#f6c945]">
              <Icon name="book" className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-base font-bold text-[#f4efe6]">
              {t(
                "คุณยังไม่ได้เข้าร่วมคอร์สเรียนใดๆ",
                "You haven't joined any courses yet"
              )}
            </h2>
            <p className="mt-1 text-xs text-[#9a93ad]">
              {t(
                "เลือกคอร์สที่สนใจจากคลังคอร์สเปิด หรือกรอกรหัสห้องเรียนจากครูผู้สอนเพื่อเริ่มต้น",
                "Browse open courses or enter a classroom code from your teacher to get started."
              )}
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#2fbf71] px-5 py-2.5 text-xs font-extrabold text-[#0b0b14] hover:bg-[#34d37d] whitespace-nowrap"
            >
              {t("ดูคอร์สเรียนที่เปิดสอน →", "Browse Open Courses →")}
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {myCourses.map((course) => {
              const cLessons = lessons
                .filter((l) => l.course_id === course.id && l.is_published)
                .sort((a, b) => a.order_index - b.order_index);

              const cProgress = myProgress.filter(
                (p) => p.course_id === course.id
              );
              const completedSet = new Set(
                cProgress.filter((p) => p.is_completed).map((p) => p.lesson_id)
              );

              const pct =
                cLessons.length > 0
                  ? Math.round((completedSet.size / cLessons.length) * 100)
                  : 0;

              const enroll = myEnrollments.find(
                (e) => e.course_id === course.id
              );
              const resumeLesson =
                cLessons.find(
                  (l) => l.id === enroll?.last_accessed_lesson_id
                ) ||
                cLessons.find((l) => !completedSet.has(l.id)) ||
                cLessons[0];

              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-[#2f2d45] bg-[#141220] p-6 shadow-lg"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="max-w-2xl">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="rounded-md border border-[#3d395a] bg-[#1c1b2b] px-2.5 py-0.5 text-[11px] font-bold text-[#f6c945]">
                          {t("รหัส:", "Code:")} {course.join_code}
                        </span>
                        <span className="text-xs text-[#9a93ad]">
                          {t("ผู้สอน:", "Instructor:")} {getLocalizedCourse(course, uiLang).teacher_name}
                        </span>
                      </div>
                      <h2 className="text-lg font-bold text-[#f4efe6]">
                        {getLocalizedCourse(course, uiLang).title}
                      </h2>
                      <p className="mt-1 text-xs text-[#c4bdd6]">
                        {getLocalizedCourse(course, uiLang).description}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/dungeon/${course.id}`}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-[#9b5de5] bg-[#5a2d91] px-4 py-3 text-xs font-bold text-[#ffe27a] hover:bg-[#6d3fc0] transition-colors whitespace-nowrap"
                      >
                        <Icon name="gamepad" className="h-4 w-4 shrink-0" />
                        <span>{t("เล่นโหมดดันเจี้ยน", "Play Dungeon Mode")}</span>
                      </Link>

                      {resumeLesson && (
                        <Link
                          href={`/courses/${course.id}/lessons/${resumeLesson.id}`}
                          className="inline-flex max-w-full items-center gap-2 rounded-xl bg-[#2fbf71] px-5 py-3 text-xs font-extrabold text-[#0b0b14] shadow-md hover:bg-[#34d37d] transition-colors"
                        >
                          <Icon name="play" className="h-4 w-4 shrink-0" />
                          <span className="truncate">
                            {t("เรียนต่อจากที่ค้างไว้:", "Resume:")}{" "}
                            {getLocalizedLesson(resumeLesson, uiLang).title}
                          </span>
                        </Link>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-5">
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span className="text-[#e8e1cf]">
                        {t(
                          `ความคืบหน้า: เรียนจบแล้ว ${completedSet.size} จาก ${cLessons.length} บทเรียน`,
                          `Progress: ${completedSet.size} of ${cLessons.length} lessons completed`
                        )}
                      </span>
                      <span className="text-[#2fbf71]">{pct}%</span>
                    </div>
                    <div className="h-2.5 w-full overflow-hidden rounded-full border border-[#2f2d45] bg-[#1c1b2b]">
                      <div
                        className="h-full rounded-full bg-[#2fbf71] transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  {/* Lesson History Table */}
                  <div className="mt-5 border-t border-[#2f2d45] pt-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#9a93ad] mb-2.5">
                      {t("ประวัติการเข้าเรียนรายบท", "Lesson History")}
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                      {cLessons.map((lesson) => {
                        const prog = cProgress.find(
                          (p) => p.lesson_id === lesson.id
                        );
                        return (
                          <Link
                            key={lesson.id}
                            href={`/courses/${course.id}/lessons/${lesson.id}`}
                            className="flex items-center justify-between rounded-xl border border-[#2f2d45] bg-[#1c1b2b] px-3.5 py-2.5 text-xs hover:border-[#9b5de5] transition-colors"
                          >
                            <div className="truncate pr-2">
                              <p className="font-bold text-[#f4efe6] truncate">
                                {getLocalizedLesson(lesson, uiLang).title}
                              </p>
                              <p className="text-[10px] text-[#9a93ad]">
                                {prog?.completed_at
                                  ? `${t("จบเมื่อ", "Completed")} ${new Date(
                                      prog.completed_at
                                    ).toLocaleDateString(
                                      uiLang === "en" ? "en-US" : "th-TH"
                                    )}`
                                  : prog?.opened_at
                                  ? `${t("เปิดดูล่าสุด", "Last opened")} ${new Date(
                                      prog.opened_at
                                    ).toLocaleDateString(
                                      uiLang === "en" ? "en-US" : "th-TH"
                                    )}`
                                  : t("ยังไม่ได้เปิดเรียน", "Not started")}
                              </p>
                            </div>
                            <span
                              className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                                prog?.is_completed
                                  ? "border-[#2fbf71]/40 bg-[#102a1e] text-[#86efac]"
                                  : prog
                                  ? "border-[#f6c945]/40 bg-[#281d08] text-[#ffe27a]"
                                  : "border-[#3d395a] bg-[#252238] text-[#9a93ad]"
                              }`}
                            >
                              {prog?.is_completed
                                ? t("เรียนจบ", "Completed")
                                : prog
                                ? t("กำลังเรียน", "In Progress")
                                : t("รอเรียน", "Pending")}
                            </span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
