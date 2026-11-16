"use client";

import React, { useState, useEffect, useCallback, useMemo, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AVATARS, getAvatar, DEFAULT_AVATAR, AvatarKey } from "../../lib/dungeon/sprites";
import { hashString, dungeonNameForCourse } from "../../lib/dungeon/seed";
import { generateDungeonRoom, DungeonRoom } from "../../lib/dungeon/mapgen";
import { getMonsterDef, MonsterDef } from "../../lib/dungeon/monsters";
import { getQuestionForFloor, getChestQuestion, getMimicChestQuestion, DungeonQuestion } from "../../lib/dungeon/questions";
import { LANGUAGE_TRACKS, LearningLanguage } from "../../lib/language-tracks";
import { GameCanvas } from "../../components/dungeon/GameCanvas";
import { DungeonHud } from "../../components/dungeon/DungeonHud";
import { BattleOverlay } from "../../components/dungeon/BattleOverlay";
import { CodeChestModal, InRunRewardType } from "../../components/dungeon/CodeChestModal";
import { MobileDpad } from "../../components/dungeon/MobileDpad";
import { PauseModal, GameOverModal, VictoryModal } from "../../components/dungeon/GameModals";
import { dungeonSound } from "../../lib/dungeon/sound";
import { Course, Lesson, LessonProgress } from "../../lib/supabase";
import {
  getLocalizedLesson,
  loadLocalCourses,
  loadLocalLessons,
  loadLocalLessonProgress,
  saveLocalLessonProgress,
  loadLocalEnrollments,
  saveLocalEnrollments,
} from "../../lib/lms-data";
import { getClientSession } from "../../components/SiteHeader";
import { useUiLanguage } from "../../components/LanguageProvider";

function detectCourseLanguage(course: Course | null, courseLessons: Lesson[]): LearningLanguage {
  const lessonLang = courseLessons
    .find((l) => l?.programming_language)
    ?.programming_language?.toLowerCase();

  if (lessonLang === "python") return "python";
  if (lessonLang === "sql") return "sql";
  if (lessonLang === "typescript" || lessonLang === "ts") return "typescript";
  if (lessonLang === "cpp" || lessonLang === "c++") return "cpp";
  if (lessonLang === "java") return "java";
  if (lessonLang === "javascript" || lessonLang === "js") return "javascript";

  if (!course) return "javascript";
  const haystack = `${course.id} ${course.join_code} ${course.title}`.toUpperCase();
  if (
    course.id.includes("-ts-") ||
    course.join_code.toUpperCase().startsWith("TS") ||
    haystack.includes("TYPESCRIPT")
  ) {
    return "typescript";
  }
  if (
    course.id.includes("-cpp-") ||
    course.join_code.toUpperCase().startsWith("CPP") ||
    haystack.includes("C++") ||
    haystack.includes("CPP")
  ) {
    return "cpp";
  }
  if (
    course.id.includes("python") ||
    course.join_code.toUpperCase().startsWith("PY") ||
    haystack.includes("PYTHON")
  ) {
    return "python";
  }
  if (
    course.id.includes("sql") ||
    course.join_code.toUpperCase().startsWith("SQL") ||
    haystack.includes("SQL")
  ) {
    return "sql";
  }
  if (
    course.id.includes("-java-") ||
    course.join_code.toUpperCase().startsWith("JAVA") ||
    /\bJAVA\b/.test(haystack)
  ) {
    return "java";
  }
  return "javascript";
}

function DungeonPlayContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { uiLang, t } = useUiLanguage();
  const isEn = uiLang === "en";

  const courseId = String(params?.courseId || "");
  const floorParam = searchParams.get("floor");
  const initialFloor = Math.max(0, parseInt(floorParam || "0", 10) || 0);

  // Avatar and sound
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(DEFAULT_AVATAR);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Course & floor data
  const [course, setCourse] = useState<Course | null>(null);
  const [courseLessons, setCourseLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saveNotice, setSaveNotice] = useState<string | null>(null);

  // Game state
  const [runId, setRunId] = useState<string>(() => `run-${courseId}-${Date.now()}`);
  const [floorIndex, setFloorIndex] = useState<number>(initialFloor);
  const [hearts, setHearts] = useState<number>(3);
  const [maxHearts] = useState<number>(3);
  const [coins, setCoins] = useState<number>(0);
  const [xp, setXp] = useState<number>(0);
  const [focus, setFocus] = useState<number | null>(null);
  const [floorShieldBonus, setFloorShieldBonus] = useState<number>(0);
  const [floorRewardMultiplier, setFloorRewardMultiplier] = useState<number>(1);
  const [screenShake, setScreenShake] = useState<number>(0);

  // Modals & Overlay state
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInBattle, setIsInBattle] = useState<boolean>(false);
  const [chestModalMode, setChestModalMode] = useState<"room-entity" | "side-chest" | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isVictory, setIsVictory] = useState<boolean>(false);

  // Load course and user preferences
  useEffect(() => {
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

    async function fetchCourseData() {
      const allCourses = loadLocalCourses();
      const allLessons = loadLocalLessons();
      const foundCourse = allCourses.find((c) => c.id === courseId) || allCourses[0];
      setCourse(foundCourse);

      const relevantLessons = allLessons
        .filter((l) => l.course_id === foundCourse?.id && l.is_published)
        .sort((a, b) => a.order_index - b.order_index);
      const effectiveLessons =
        relevantLessons.length > 0 ? relevantLessons : [allLessons[0]];
      setCourseLessons(effectiveLessons);

      // Resume from saved floor & resources (coins, xp, hearts, focus MP)
      const currentSess = getClientSession();
      const runKey = `explain_code_course_run_${foundCourse?.id || courseId}_${currentSess?.userId || "guest"}`;
      try {
        const rawRun = localStorage.getItem(runKey);
        if (rawRun) {
          const parsed = JSON.parse(rawRun) as {
            floorIndex?: number;
            coins?: number;
            xp?: number;
            hearts?: number;
            focus?: number;
          };
          if (typeof parsed.coins === "number") setCoins(parsed.coins);
          if (typeof parsed.xp === "number") setXp(parsed.xp);
          if (typeof parsed.hearts === "number" && parsed.hearts > 0) setHearts(parsed.hearts);
          if (typeof parsed.focus === "number") setFocus(parsed.focus);
          if (floorParam === null && typeof parsed.floorIndex === "number" && parsed.floorIndex >= 0 && parsed.floorIndex < effectiveLessons.length) {
            setFloorIndex(parsed.floorIndex);
          }
        }
      } catch {
        // ignore storage errors
      }
      if (currentSess && floorParam === null && effectiveLessons.length > 0) {
        const enrolls = loadLocalEnrollments();
        const myEnroll = enrolls.find(
          (e) =>
            e.course_id === (foundCourse?.id || courseId) &&
            e.student_id === currentSess.userId
        );
        if (myEnroll?.last_accessed_lesson_id) {
          const savedIdx = effectiveLessons.findIndex(
            (l) => l.id === myEnroll.last_accessed_lesson_id
          );
          if (savedIdx >= 0) {
            setFloorIndex(savedIdx);
          }
        }
      }
      setLoading(false);

      // Initialize authoritative run on server
      try {
        const res = await fetch("/api/dungeon/start-run", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            courseId,
            totalFloors: Math.max(1, relevantLessons.length),
          }),
        });
        if (res.ok) {
          const runData = await res.json();
          if (runData.runId) {
            setRunId(runData.runId);
          }
        }
      } catch {
        // fallback
      }
    }

    void fetchCourseData();
  }, [courseId]);

  const totalFloors = Math.max(1, courseLessons.length);
  const courseSeed = useMemo(() => hashString(courseId || "default"), [courseId]);
  const dungeonTitle = useMemo(() => dungeonNameForCourse(courseId || "default", uiLang), [courseId, uiLang]);

  const courseLang = useMemo(
    () => detectCourseLanguage(course, courseLessons),
    [course, courseLessons]
  );

  const trackMeta = useMemo(
    () => LANGUAGE_TRACKS.find((tr) => tr.id === courseLang) || LANGUAGE_TRACKS[0],
    [courseLang]
  );

  // Current floor dungeon room
  const [room, setRoom] = useState<DungeonRoom>(() =>
    generateDungeonRoom(courseSeed, 0, totalFloors)
  );

  const persistCourseDungeonProgress = useCallback(
    (targetFloorIdx: number, markCompleted: boolean, showBanner: boolean) => {
      const currentLesson = courseLessons[targetFloorIdx];
      const session = getClientSession();
      const targetCourseId = course?.id || courseId;
      if (!currentLesson || !session || !targetCourseId) return;

      const nowIso = new Date().toISOString();
      const progs = loadLocalLessonProgress();
      const existingIdx = progs.findIndex(
        (p) =>
          p.lesson_id === currentLesson.id && p.student_id === session.userId
      );
      let updatedProgs: LessonProgress[];
      if (existingIdx >= 0) {
        const prev = progs[existingIdx];
        const nextCompleted = markCompleted || prev.is_completed;
        updatedProgs = [...progs];
        updatedProgs[existingIdx] = {
          ...prev,
          is_completed: nextCompleted,
          quiz_score: nextCompleted ? Math.max(prev.quiz_score || 0, 100) : prev.quiz_score,
          completed_at: nextCompleted ? prev.completed_at || nowIso : prev.completed_at,
          updated_at: nowIso,
        };
      } else {
        updatedProgs = [
          {
            id: `prog-${Date.now()}`,
            student_id: session.userId,
            course_id: targetCourseId,
            lesson_id: currentLesson.id,
            is_completed: markCompleted,
            quiz_score: markCompleted ? 100 : null,
            opened_at: nowIso,
            completed_at: markCompleted ? nowIso : null,
            updated_at: nowIso,
          },
          ...progs,
        ];
      }
      saveLocalLessonProgress(updatedProgs);

      const enrolls = loadLocalEnrollments();
      const existingEnrollIdx = enrolls.findIndex(
        (e) =>
          e.course_id === targetCourseId && e.student_id === session.userId
      );
      if (existingEnrollIdx >= 0) {
        const updatedEnrolls = [...enrolls];
        updatedEnrolls[existingEnrollIdx] = {
          ...updatedEnrolls[existingEnrollIdx],
          last_accessed_lesson_id: currentLesson.id,
          last_accessed_at: nowIso,
        };
        saveLocalEnrollments(updatedEnrolls);
      } else {
        saveLocalEnrollments([
          {
            id: `enr-${Date.now()}`,
            course_id: targetCourseId,
            student_id: session.userId,
            enrolled_at: nowIso,
            last_accessed_lesson_id: currentLesson.id,
            last_accessed_at: nowIso,
          },
          ...enrolls,
        ]);
      }

      if (showBanner) {
        const completedCount = updatedProgs.filter(
          (p) =>
            p.course_id === targetCourseId &&
            p.student_id === session.userId &&
            p.is_completed
        ).length;
        const pct = Math.min(
          100,
          Math.max(
            Math.round((completedCount / Math.max(1, totalFloors)) * 100),
            Math.round(
              ((Math.max(completedCount, targetFloorIdx) + 0.5) /
                Math.max(1, totalFloors)) *
                100
            )
          )
        );
        setSaveNotice(
          t(
            `✓ เซฟเกม ด่านที่ ${targetFloorIdx + 1}/${totalFloors} (${currentLesson.title}) · ความคืบหน้า ${pct}% เรียบร้อยแล้ว!`,
            `✓ Saved Floor ${targetFloorIdx + 1}/${totalFloors} (${pct}% progress)!`
          )
        );
        window.setTimeout(() => setSaveNotice(null), 4000);
      }
    },
    [courseLessons, course?.id, courseId, totalFloors, t]
  );

  // Update room and reset floor-only buffs when floor changes
  useEffect(() => {
    setRoom(generateDungeonRoom(courseSeed, floorIndex, totalFloors));
    setFloorShieldBonus(0);
    setFloorRewardMultiplier(1);
    if (!loading && courseLessons.length > 0) {
      persistCourseDungeonProgress(floorIndex, false, false);
    }
  }, [
    courseSeed,
    floorIndex,
    totalFloors,
    loading,
    courseLessons.length,
    persistCourseDungeonProgress,
  ]);

  const avatar = useMemo(() => getAvatar(avatarKey), [avatarKey]);
  const isBossFloor = floorIndex >= totalFloors - 1;

  const currentMonster: MonsterDef = useMemo(() => {
    if (room.entity?.monsterType) {
      return getMonsterDef(room.entity.monsterType);
    }
    return getMonsterDef(isBossFloor ? "boss" : "slime");
  }, [room.entity?.monsterType, isBossFloor]);

  const currentQuestion: DungeonQuestion = useMemo(
    () => getQuestionForFloor(floorIndex, isBossFloor, courseLang, course?.id || courseId),
    [floorIndex, isBossFloor, courseLang, course?.id, courseId]
  );

  const isMimicChest =
    chestModalMode === "side-chest" && Boolean(room.chest?.isMimic);

  const chestQuestion: DungeonQuestion = useMemo(
    () =>
      isMimicChest
        ? getMimicChestQuestion(floorIndex + courseSeed, courseLang)
        : getChestQuestion(floorIndex + courseSeed, courseLang, currentQuestion.id),
    [isMimicChest, floorIndex, courseSeed, courseLang, currentQuestion.id]
  );

  useEffect(() => {
    if (loading || isVictory || isGameOver) return;
    try {
      const currentSess = getClientSession();
      const runKey = `explain_code_course_run_${course?.id || courseId}_${currentSess?.userId || "guest"}`;
      localStorage.setItem(
        runKey,
        JSON.stringify({
          floorIndex,
          coins,
          xp,
          hearts,
          focus: focus ?? avatar.stats.initialMp,
        })
      );
    } catch {
      // ignore storage errors
    }
  }, [loading, isVictory, isGameOver, course?.id, courseId, floorIndex, coins, xp, hearts, focus, avatar.stats.initialMp]);

  const currentLessonTitle = courseLessons[floorIndex]
    ? getLocalizedLesson(courseLessons[floorIndex], uiLang).title
    : t(`ชั้นที่ ${floorIndex + 1}`, `Floor ${floorIndex + 1}`);

  const handleToggleSound = useCallback(() => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    dungeonSound.setEnabled(next);
  }, [soundEnabled]);

  const handleEncounterEntity = useCallback(() => {
    if (!room.entity?.isCompleted) {
      if (room.roomType === "chest") {
        setChestModalMode("room-entity");
      } else {
        setIsInBattle(true);
      }
    }
  }, [room.entity, room.roomType]);

  const handleEncounterChest = useCallback(() => {
    if (room.chest && !room.chest.isOpened) {
      setChestModalMode("side-chest");
    }
  }, [room.chest]);

  const handleCorrectAnswer = useCallback(
    (xpAwarded?: number, coinsAwarded?: number) => {
      const gainedCoins = coinsAwarded !== undefined ? coinsAwarded : currentMonster.coinReward;
      const gainedXp = xpAwarded !== undefined ? xpAwarded : currentMonster.xpReward;
      setCoins((prev) => prev + gainedCoins);
      setXp((prev) => prev + gainedXp);

      // Two-Way Progress Sync: Mark current lesson completed in local storage
      persistCourseDungeonProgress(floorIndex, true, false);

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
    [currentMonster, courseLessons, floorIndex, courseId]
  );

  const handleWrongAnswer = useCallback(() => {
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
    if (floorIndex < totalFloors - 1) {
      dungeonSound.playDoorOpen();
      setFloorIndex((prev) => prev + 1);
    } else {
      dungeonSound.playVictory();
      setIsVictory(true);
      try {
        const currentSess = getClientSession();
        localStorage.removeItem(
          `explain_code_course_run_${course?.id || courseId}_${currentSess?.userId || "guest"}`
        );
      } catch {
        // ignore
      }
    }
  }, [floorIndex, totalFloors, course?.id, courseId]);

  const handleRetry = useCallback(() => {
    setHearts(3);
    setCoins(0);
    setXp(0);
    setFocus(avatar.stats.initialMp);
    setFloorIndex(0);
    setIsGameOver(false);
    setIsVictory(false);
    setIsInBattle(false);
    setChestModalMode(null);
    setFloorShieldBonus(0);
    setFloorRewardMultiplier(1);
    setIsPaused(false);
    setRoom(generateDungeonRoom(courseSeed, 0, totalFloors));
    try {
      const currentSess = getClientSession();
      localStorage.removeItem(
        `explain_code_course_run_${course?.id || courseId}_${currentSess?.userId || "guest"}`
      );
    } catch {
      // ignore
    }
  }, [courseSeed, totalFloors, avatar.stats.initialMp, course?.id, courseId]);

  const handleChestSolved = useCallback(
    (reward: { xpAwarded: number; coinsAwarded: number }) => {
      if (chestModalMode === "room-entity") {
        handleCorrectAnswer(reward.xpAwarded, reward.coinsAwarded);
      } else if (chestModalMode === "side-chest") {
        setXp((prev) => prev + reward.xpAwarded);
        setCoins((prev) => prev + reward.coinsAwarded);
        setRoom((prev) =>
          prev.chest ? { ...prev, chest: { ...prev.chest, isOpened: true } } : prev
        );
      }
    },
    [chestModalMode, handleCorrectAnswer]
  );

  const handleSelectInRunReward = useCallback(
    (rewardType: InRunRewardType) => {
      if (rewardType === "heal_hp") {
        setHearts((h) => Math.min(maxHearts, h + 1));
      } else if (rewardType === "add_shield") {
        setFloorShieldBonus((s) => s + 1);
      } else if (rewardType === "double_rewards") {
        setFloorRewardMultiplier(2);
      }
    },
    [maxHearts]
  );

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-12 text-[#ffe27a] pixel-font text-sm">
        GENERATING DUNGEON...
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 py-4 sm:py-6 flex flex-col items-center gap-4">
      {/* HUD Bar */}
      <DungeonHud
        avatar={avatar}
        floorIndex={floorIndex}
        totalFloors={totalFloors}
        dungeonTitle={isEn ? trackMeta.dungeonRealmNameEn : `${trackMeta.dungeonRealmName} · ${dungeonTitle}`}
        roomTitle={currentLessonTitle}
        hearts={hearts}
        maxHearts={maxHearts}
        coins={coins}
        xp={xp}
        soundEnabled={soundEnabled}
        languageName={trackMeta.name}
        languageBadge={trackMeta.name}
        onToggleSound={handleToggleSound}
        onTogglePause={() => setIsPaused(true)}
        onExit={() => router.push("/courses")}
      />

      {/* Save Game & Floor Progress Bar */}
      <div className="w-full max-w-[640px] flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2f2d45] bg-[#141220] px-3.5 py-2 text-xs">
        <span className="font-bold text-[#c4bdd6]">
          {t(
            `กำลังลุย: ด่านที่ ${floorIndex + 1}/${totalFloors} (${currentLessonTitle}) · ความคืบหน้า ${Math.min(100, Math.round(((floorIndex + (room.entity?.isCompleted ? 1 : 0.5)) / Math.max(1, totalFloors)) * 100))}%`,
            `Floor ${floorIndex + 1}/${totalFloors} (${currentLessonTitle}) · Progress ${Math.min(100, Math.round(((floorIndex + (room.entity?.isCompleted ? 1 : 0.5)) / Math.max(1, totalFloors)) * 100))}%`
          )}
        </span>
        {getClientSession() && (
          <button
            type="button"
            onClick={() => persistCourseDungeonProgress(floorIndex, false, true)}
            className="px-3 py-1 rounded-lg text-xs font-extrabold border border-[#2fbf71]/70 bg-[#102a1e] text-[#86efac] hover:bg-[#153827] transition cursor-pointer flex items-center gap-1"
          >
            <span>💾</span>
            <span>{t("เซฟเกมไว้", "Save Game")}</span>
          </button>
        )}
      </div>

      {saveNotice && (
        <div className="w-full max-w-[640px] rounded-xl border border-[#2fbf71]/70 bg-[#102a1e] px-4 py-2 text-xs font-bold text-[#86efac]">
          {saveNotice}
        </div>
      )}

      {/* Active Floor In-Run Buffs */}
      {(floorShieldBonus > 0 || floorRewardMultiplier > 1) && (
        <div className="w-full max-w-[640px] flex flex-wrap items-center justify-center gap-2 text-[11px]">
          {floorShieldBonus > 0 && (
            <span className="px-2.5 py-1 rounded-lg border border-[#38bdf8]/60 bg-[#38bdf8]/15 text-[#7dd3fc] font-bold">
              🛡️ +{floorShieldBonus} Shield ({t("เฉพาะชั้นนี้", "This Floor")})
            </span>
          )}
          {floorRewardMultiplier > 1 && (
            <span className="px-2.5 py-1 rounded-lg border border-[#f6c945]/60 bg-[#f6c945]/15 text-[#ffe27a] font-bold">
              ⚡ XP &amp; Coins ×{floorRewardMultiplier} ({t("เฉพาะชั้นนี้", "This Floor")})
            </span>
          )}
        </div>
      )}

      {/* Canvas Viewport */}
      <div className="w-full flex justify-center">
        <GameCanvas
          room={room}
          avatar={avatar}
          isPaused={isPaused}
          isInBattle={isInBattle || chestModalMode !== null}
          onEncounterEntity={handleEncounterEntity}
          onEncounterChest={handleEncounterChest}
          onEnterNextFloor={handleEnterNextFloor}
          onAutoPause={() => setIsPaused(true)}
          screenShake={screenShake}
        />
      </div>

      {/* Mobile On-Screen D-Pad */}
      <div className="w-full sm:hidden">
        <MobileDpad
          disabled={isPaused || isInBattle || chestModalMode !== null || isGameOver || isVictory}
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

      {/* Code Chest Event Modal */}
      {chestModalMode !== null && (
        <CodeChestModal
          question={chestQuestion}
          isMimic={isMimicChest}
          xpReward={isMimicChest ? 80 : 25}
          coinReward={isMimicChest ? 60 : 20}
          onSolved={handleChestSolved}
          onMimicFailed={() => {
            handleWrongAnswer();
            setRoom((prev) =>
              prev.chest ? { ...prev, chest: { ...prev.chest, isOpened: true } } : prev
            );
          }}
          onSelectInRunReward={handleSelectInRunReward}
          onClose={() => setChestModalMode(null)}
        />
      )}

      {/* Battle Overlay */}
      {isInBattle && (
        <BattleOverlay
          runId={runId}
          monster={currentMonster}
          question={currentQuestion}
          monsterHp={room.entity?.isCompleted ? 0 : currentMonster.maxHp}
          maxMonsterHp={currentMonster.maxHp}
          playerHearts={hearts}
          avatarKey={avatarKey}
          initialFocus={focus ?? avatar.stats.initialMp}
          maxFocus={avatar.stats.maxMp}
          extraShield={floorShieldBonus}
          rewardMultiplier={floorRewardMultiplier}
          courseId={courseId}
          lessonId={courseLessons[floorIndex]?.id}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
          onProgressChange={(progress) => {
            if (typeof progress.focus === "number") {
              setFocus(progress.focus);
            }
          }}
          onSaveGame={() => persistCourseDungeonProgress(floorIndex, false, true)}
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
        dungeonTitle={dungeonTitle}
        courseTitle={course?.title || t("คอร์สเรียน", "Course")}
        totalCoins={coins}
        totalXp={xp}
        onExit={() => router.push("/courses")}
      />
    </div>
  );
}

export default function DungeonPlayPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center p-12 text-[#ffe27a] pixel-font text-sm">
          LOADING DUNGEON...
        </div>
      }
    >
      <DungeonPlayContent />
    </Suspense>
  );
}
