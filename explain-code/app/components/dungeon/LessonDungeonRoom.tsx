"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AVATARS, getAvatar, DEFAULT_AVATAR, AvatarKey } from "../../lib/dungeon/sprites";
import { hashString, dungeonNameForCourse } from "../../lib/dungeon/seed";
import { generateDungeonRoom, DungeonRoom } from "../../lib/dungeon/mapgen";
import { getLocalizedMonster, getMonsterDef, MonsterDef } from "../../lib/dungeon/monsters";
import {
  getQuestionForFloor,
  getChestQuestion,
  getMimicChestQuestion,
  SAMPLE_DUNGEON_QUESTIONS,
  DungeonQuestion,
  shuffleDungeonQuestionChoices,
} from "../../lib/dungeon/questions";
import {
  LearningLanguage,
  LANGUAGE_TRACKS,
  runCodeByLanguage,
} from "../../lib/language-tracks";
import { useUiLanguage } from "../LanguageProvider";
import { GameCanvas } from "./GameCanvas";
import { DungeonHud } from "./DungeonHud";
import { BattleOverlay } from "./BattleOverlay";
import { CodeChestModal, InRunRewardType } from "./CodeChestModal";
import { PauseModal } from "./GameModals";
import { MobileDpad } from "./MobileDpad";
import { PixelSpriteView } from "./PixelSpriteView";
import { Icon } from "../Icons";
import { dungeonSound } from "../../lib/dungeon/sound";
import { Course, Lesson, LessonProgress } from "../../lib/supabase";
import {
  getLocalizedLesson,
  loadLocalLessonProgress,
  saveLocalLessonProgress,
  loadLocalEnrollments,
  saveLocalEnrollments,
} from "../../lib/lms-data";
import { getClientSession } from "../SiteHeader";

interface LessonDungeonRoomProps {
  course: Course;
  lesson: Lesson;
  lessonIndex: number;
  totalLessons: number;
  isCompleted: boolean;
  onLessonCompleted: () => void;
  onSwitchToContent?: () => void;
  nextLessonUrl?: string;
}

function normalizeLearningLanguage(raw?: string): LearningLanguage {
  const lower = (raw || "javascript").toLowerCase().trim();
  if (lower === "c++" || lower === "cpp") return "cpp";
  if (lower === "ts" || lower === "typescript") return "typescript";
  if (lower === "py" || lower === "python") return "python";
  if (lower === "sql") return "sql";
  if (lower === "java") return "java";
  return "javascript";
}

export function LessonDungeonRoom({
  course,
  lesson,
  lessonIndex,
  totalLessons,
  isCompleted,
  onLessonCompleted,
  onSwitchToContent,
  nextLessonUrl,
}: LessonDungeonRoomProps) {
  const router = useRouter();
  const { uiLang, t } = useUiLanguage();
  const isEn = uiLang === "en";

  // Avatar and sound
  const [avatarKey, setAvatarKey] = useState<AvatarKey>(DEFAULT_AVATAR);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(false);

  // Game state for this room
  const [hearts, setHearts] = useState<number>(3);
  const [coinsEarned, setCoinsEarned] = useState<number>(0);
  const [xpEarned, setXpEarned] = useState<number>(0);
  const [focus, setFocus] = useState<number | null>(null);
  const [floorShieldBonus, setFloorShieldBonus] = useState<number>(0);
  const [floorRewardMultiplier, setFloorRewardMultiplier] = useState<number>(1);
  const [screenShake, setScreenShake] = useState<number>(0);
  const [hasSession, setHasSession] = useState<boolean>(false);
  const [isRoomConquered, setIsRoomConquered] = useState<boolean>(false);

  // Overlays
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isInBattle, setIsInBattle] = useState<boolean>(false);
  const [chestModalMode, setChestModalMode] = useState<"side-chest" | null>(null);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [quizShuffleSeed, setQuizShuffleSeed] = useState<number>(0);

  const courseSeed = useMemo(() => hashString(course.id || "default"), [course.id]);
  const isBossFloor = lessonIndex >= totalLessons - 1;

  // Generate deterministic room for this lesson (sync completion after mount to avoid hydration mismatch)
  const [room, setRoom] = useState<DungeonRoom>(() =>
    generateDungeonRoom(courseSeed, lessonIndex, totalLessons)
  );

  // Load avatar/sound and sync completion or guest state after mount
  useEffect(() => {
    setQuizShuffleSeed(Math.floor(Math.random() * 1_000_000_000) + 1);
    const sessionExists = Boolean(getClientSession());
    setHasSession(sessionExists);
    if (!sessionExists) {
      setIsRoomConquered(false);
      setHearts(3);
      setCoinsEarned(0);
      setXpEarned(0);
      setIsInBattle(false);
      setIsGameOver(false);
      setRoom(generateDungeonRoom(courseSeed, lessonIndex, totalLessons));
    } else if (isCompleted) {
      setIsRoomConquered(true);
      setRoom((prev) =>
        prev.entity
          ? {
              ...prev,
              entity: { ...prev.entity, hp: 0, isCompleted: true },
              isDoorUnlocked: true,
            }
          : prev
      );
    }

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
      if (hasSession) {
        const currentSess = getClientSession();
        const runKey = `explain_code_lesson_run_${course.id}_${currentSess?.userId || "guest"}`;
        const rawRun = localStorage.getItem(runKey);
        if (rawRun) {
          const parsed = JSON.parse(rawRun) as {
            coins?: number;
            xp?: number;
            hearts?: number;
            focus?: number;
          };
          if (typeof parsed.coins === "number") setCoinsEarned(parsed.coins);
          if (typeof parsed.xp === "number") setXpEarned(parsed.xp);
          if (typeof parsed.hearts === "number" && parsed.hearts > 0) setHearts(parsed.hearts);
          if (typeof parsed.focus === "number") setFocus(parsed.focus);
        }
      }
    } catch {
      // ignore
    }
  }, [courseSeed, lessonIndex, totalLessons, course.id]);

  const avatar = useMemo(() => getAvatar(avatarKey), [avatarKey]);

  useEffect(() => {
    const currentSess = getClientSession();
    if (!currentSess) return;
    try {
      const runKey = `explain_code_lesson_run_${course.id}_${currentSess.userId}`;
      localStorage.setItem(
        runKey,
        JSON.stringify({
          coins: coinsEarned,
          xp: xpEarned,
          hearts,
          focus: focus ?? avatar.stats.initialMp,
        })
      );
    } catch {
      // ignore
    }
  }, [course.id, coinsEarned, xpEarned, hearts, focus, avatar.stats.initialMp]);

  const lessonLang = useMemo(
    () => normalizeLearningLanguage(lesson.programming_language),
    [lesson.programming_language]
  );

  const trackMeta = useMemo(
    () => LANGUAGE_TRACKS.find((tr) => tr.id === lessonLang) || LANGUAGE_TRACKS[0],
    [lessonLang]
  );

  const currentMonster: MonsterDef = useMemo(() => {
    if (room.entity?.monsterType) {
      return getMonsterDef(room.entity.monsterType);
    }
    return getMonsterDef(isBossFloor ? "boss" : "slime");
  }, [room.entity?.monsterType, isBossFloor]);

  const lessonQuestions: DungeonQuestion[] = useMemo(() => {
    const quizList = Array.isArray(lesson.quiz_questions)
      ? lesson.quiz_questions
      : [];

    if (quizList.length > 0) {
      let simulatedOut = "";
      if (lesson.code_example) {
        const sim = runCodeByLanguage(lesson.code_example, lessonLang);
        if (sim.success && sim.finalOutput.trim()) {
          simulatedOut = sim.finalOutput.trim();
        }
      }

      return quizList.map((q, idx) => {
        const qRecord = q as unknown as {
          questionEn?: string;
          optionsEn?: string[];
          explanationEn?: string;
        };
        const localizedTitle = getLocalizedLesson(lesson, uiLang).title;
        const baseQuestion: DungeonQuestion = {
          id: q.id || `lesson-${lesson.id}-q-${idx}`,
          language: lessonLang,
          question: q.question,
          questionEn: qRecord.questionEn,
          codeSnippet: lesson.code_example || undefined,
          choices: q.options,
          choicesEn: qRecord.optionsEn,
          correctIndex: q.correctIndex,
          explanation:
            q.explanation ||
            t("คำตอบถูกต้องตามเนื้อหาบทเรียน", "Correct according to the lesson!"),
          explanationEn: qRecord.explanationEn,
          difficulty: isBossFloor ? "hard" : lessonIndex > 0 ? "medium" : "easy",
          blockModelCell: "E2",
          hint: t(
            "ลองอ่านโค้ดตัวอย่างในบทเรียนและไล่ค่าทีละบรรทัด",
            "Inspect the lesson code example line by line."
          ),
          hintEn: "Inspect the lesson code example line by line.",
          expectedOutput: simulatedOut || undefined,
          phaseLabel: `${localizedTitle} (${idx + 1}/${quizList.length})`,
        };
        return shuffleDungeonQuestionChoices(
          baseQuestion,
          `${quizShuffleSeed || lesson.id}:${baseQuestion.id}`
        );
      });
    }

    return [getQuestionForFloor(lessonIndex, isBossFloor, lessonLang, course.id)];
  }, [
    lesson.quiz_questions,
    lesson.id,
    lesson.code_example,
    lesson.title,
    lessonLang,
    isBossFloor,
    lessonIndex,
    course.id,
    uiLang,
    quizShuffleSeed,
    t,
  ]);

  const shouldUseLocalValidation = useMemo(() => {
    // Questions from lesson.quiz_questions are shuffled with shuffleDungeonQuestionChoices,
    // so always validate against the shuffled question's correctIndex locally.
    if (Array.isArray(lesson.quiz_questions) && lesson.quiz_questions.length > 0) {
      return true;
    }
    if (lessonQuestions.length > 1) return true;
    const first = lessonQuestions[0];
    if (!first) return true;
    return !SAMPLE_DUNGEON_QUESTIONS.some((sq) => sq.id === first.id);
  }, [lesson.quiz_questions, lessonQuestions]);

  const isMimicChest =
    chestModalMode === "side-chest" && Boolean(room.chest?.isMimic);

  const chestQuestion: DungeonQuestion = useMemo(
    () =>
      isMimicChest
        ? getMimicChestQuestion(lessonIndex + courseSeed, lessonLang)
        : getChestQuestion(lessonIndex + courseSeed, lessonLang, lessonQuestions[0]?.id),
    [isMimicChest, lessonIndex, courseSeed, lessonLang, lessonQuestions]
  );

  const dungeonTitle = useMemo(
    () => dungeonNameForCourse(course.id || "default", uiLang),
    [course.id, uiLang]
  );

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

  const handleEncounterChest = useCallback(() => {
    if (room.chest && !room.chest.isOpened) {
      setChestModalMode("side-chest");
    }
  }, [room.chest]);

  const handleChestSolved = useCallback(
    (reward: { xpAwarded: number; coinsAwarded: number }) => {
      setXpEarned((prev) => prev + reward.xpAwarded);
      setCoinsEarned((prev) => prev + reward.coinsAwarded);
      setRoom((prev) => ({
        ...prev,
        chest: prev.chest ? { ...prev.chest, isOpened: true } : null,
      }));
    },
    []
  );

  const handleSelectInRunReward = useCallback((rewardType: InRunRewardType) => {
    if (rewardType === "heal_hp") {
      setHearts((prev) => Math.min(3, prev + 1));
    } else if (rewardType === "add_shield") {
      setFloorShieldBonus((prev) => prev + 1);
    } else if (rewardType === "double_rewards") {
      setFloorRewardMultiplier(2);
    }
  }, []);

  const handleCorrectAnswer = useCallback(
    (xpAwarded?: number, coinsAwarded?: number) => {
      const gainedCoins = coinsAwarded !== undefined ? coinsAwarded : currentMonster.coinReward;
      const gainedXp = xpAwarded !== undefined ? xpAwarded : currentMonster.xpReward;
      setCoinsEarned((prev) => prev + gainedCoins);
      setXpEarned((prev) => prev + gainedXp);
      setIsRoomConquered(true);

      // Unlock door in room
      setRoom((prev) => ({
        ...prev,
        entity: prev.entity ? { ...prev.entity, hp: 0, isCompleted: true } : null,
        isDoorUnlocked: true,
      }));

      // Update LMS Progress locally
      const session = getClientSession();
      if (session) {
        const nowIso = new Date().toISOString();
        const progs = loadLocalLessonProgress();
        const existingIdx = progs.findIndex(
          (p) => p.lesson_id === lesson.id && p.student_id === session.userId
        );
        let updatedProgs: LessonProgress[];
        if (existingIdx >= 0) {
          updatedProgs = [...progs];
          updatedProgs[existingIdx] = {
            ...updatedProgs[existingIdx],
            is_completed: true,
            quiz_score: 100,
            completed_at: nowIso,
            updated_at: nowIso,
          };
        } else {
          updatedProgs = [
            {
              id: `prog-${Date.now()}`,
              student_id: session.userId,
              course_id: course.id,
              lesson_id: lesson.id,
              is_completed: true,
              quiz_score: 100,
              opened_at: nowIso,
              completed_at: nowIso,
              updated_at: nowIso,
            },
            ...progs,
          ];
        }
        saveLocalLessonProgress(updatedProgs);

        // Update enrollments
        const enrolls = loadLocalEnrollments();
        const existingEnrollIdx = enrolls.findIndex(
          (e) => e.course_id === course.id && e.student_id === session.userId
        );
        if (existingEnrollIdx >= 0) {
          const updatedEnrolls = [...enrolls];
          updatedEnrolls[existingEnrollIdx] = {
            ...updatedEnrolls[existingEnrollIdx],
            last_accessed_lesson_id: lesson.id,
            last_accessed_at: nowIso,
          };
          saveLocalEnrollments(updatedEnrolls);
        }

        onLessonCompleted();
      }
    },
    [currentMonster, course.id, lesson.id, onLessonCompleted]
  );

  const handleWrongAnswer = useCallback(() => {
    setScreenShake(1);
    setTimeout(() => setScreenShake(0), 300);

    setHearts((prev) => {
      const next = prev - 1;
      if (next <= 0) {
        setTimeout(() => {
          setIsInBattle(false);
          setIsGameOver(true);
        }, 400);
      }
      return Math.max(0, next);
    });
  }, []);

  const handleRetryRoom = useCallback(() => {
    setHearts(3);
    setCoinsEarned(0);
    setXpEarned(0);
    setFloorShieldBonus(0);
    setFloorRewardMultiplier(1);
    setQuizShuffleSeed(Math.floor(Math.random() * 1_000_000_000) + 1);
    setIsRoomConquered(false);
    setIsPaused(false);
    setChestModalMode(null);
    setIsGameOver(false);
    setIsInBattle(false);
    setRoom(generateDungeonRoom(courseSeed, lessonIndex, totalLessons));
  }, [courseSeed, lessonIndex, totalLessons]);

  const handleEnterDoor = useCallback(() => {
    dungeonSound.playDoorOpen();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 select-none">
      {/* Main Dungeon HUD Bar (matches main dungeon) */}
      <DungeonHud
        avatar={avatar}
        floorIndex={lessonIndex}
        totalFloors={totalLessons}
        dungeonTitle={isEn ? trackMeta.dungeonRealmNameEn : `${trackMeta.dungeonRealmName} · ${dungeonTitle}`}
        roomTitle={getLocalizedLesson(lesson, uiLang).title}
        hearts={hearts}
        maxHearts={3}
        coins={coinsEarned}
        xp={xpEarned}
        soundEnabled={soundEnabled}
        languageName={trackMeta.name}
        languageBadge={trackMeta.name}
        onToggleSound={handleToggleSound}
        onTogglePause={() => setIsPaused(true)}
        onExit={() => router.push(`/courses/${course.id}`)}
      />

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

      {/* Main Canvas Area */}
      <div className="w-full flex flex-col items-center gap-3">
        <div className="relative w-full max-w-[640px] flex justify-center">
          <GameCanvas
            room={room}
            avatar={avatar}
            isPaused={isPaused || isGameOver}
            isInBattle={isInBattle || chestModalMode !== null}
            onEncounterEntity={handleEncounterEntity}
            onEncounterChest={handleEncounterChest}
            onEnterNextFloor={handleEnterDoor}
            onAutoPause={() => setIsPaused(true)}
            screenShake={screenShake}
          />

          {/* Game Over Screen inside room */}
          {isGameOver && (
            <div className="absolute inset-0 rounded-2xl bg-black/85 flex flex-col items-center justify-center p-4 text-center gap-3 z-20">
              <span className="pixel-font text-xs text-[#ff4d6d] font-bold">GAME OVER</span>
              <h4 className="text-sm sm:text-base font-bold text-[#f4efe6]">
                {t("หัวใจหมดในการต่อสู้บทเรียนนี้", "Out of hearts in this lesson room")}
              </h4>
              <button
                type="button"
                onClick={handleRetryRoom}
                className="retro-button px-4 py-2 rounded-xl bg-[#f6c945] text-[#120f1c] font-black pixel-font text-xs cursor-pointer"
              >
                {t("RETRY (ลองใหม่)", "RETRY")}
              </button>
            </div>
          )}
        </div>

        {/* Compact status & quick battle action */}
        <div className="w-full max-w-[640px] flex flex-wrap items-center justify-between gap-2 text-xs text-[#9a93ad]">
          <span className="text-[#ffe27a] font-bold">
            {room.isDoorUnlocked
              ? t("🚪 พิชิตห้องนี้สำเร็จแล้ว!", "🚪 Room cleared!")
              : t(
                  `⚔️ ${getLocalizedMonster(currentMonster, uiLang).name} (${lessonQuestions.length} ข้อ)`,
                  `⚔️ ${getLocalizedMonster(currentMonster, uiLang).name} (${lessonQuestions.length} phase${lessonQuestions.length > 1 ? "s" : ""})`
                )}
          </span>
          <div className="flex items-center gap-2">
            {onSwitchToContent && (
              <button
                type="button"
                onClick={onSwitchToContent}
                className="px-3 py-1 rounded-lg border border-[#4a4766] bg-[#252238] text-xs font-bold text-[#ffe27a] hover:bg-[#322c4a] cursor-pointer"
              >
                {t("อ่านบทเรียน & โค้ด", "Read Lesson & Code")}
              </button>
            )}
            {!room.entity?.isCompleted && (
              <button
                type="button"
                onClick={handleEncounterEntity}
                className="px-3 py-1 rounded-lg bg-[#9b5de5] hover:bg-[#b07af0] text-white font-bold text-xs cursor-pointer transition-colors"
              >
                {t("⚔️ สู้เลย", "⚔️ Battle")}
              </button>
            )}
          </div>
        </div>

        {/* Room Cleared Celebration Card */}
        {isRoomConquered && (
          <div className="w-full max-w-[640px] p-3.5 rounded-xl border border-[#2fbf71]/50 bg-[#1a7a4a]/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-[#2fbf71] font-bold">
              <Icon name="check" size={16} />
              <span>
                {hasSession
                  ? t(
                      "พิชิตห้องดันเจี้ยนบทนี้สำเร็จ! บันทึกผลเรียนจบเรียบร้อย",
                      "Lesson Dungeon Room Cleared! Progress saved."
                    )
                  : t(
                      "พิชิตห้องดันเจี้ยนสำเร็จ! (เข้าสู่ระบบเพื่อบันทึกความคืบหน้า)",
                      "Cleared! Log in to save your progress."
                    )}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleRetryRoom}
                className="px-3 py-1.5 rounded-lg border border-[#4a4766] bg-[#252238] hover:bg-[#322c4a] text-[#ffe27a] font-bold text-xs cursor-pointer transition-colors"
              >
                {t("เล่นซ้ำ", "Replay")}
              </button>
              {nextLessonUrl ? (
                <Link
                  href={nextLessonUrl}
                  className="px-3 py-1.5 rounded-lg bg-[#2fbf71] text-[#120f1c] font-black text-xs hover:bg-[#34d37d] transition-colors"
                >
                  {t("บทเรียนถัดไป →", "Next Lesson →")}
                </Link>
              ) : (
                <Link
                  href={`/courses/${course.id}`}
                  className="px-3 py-1.5 rounded-lg bg-[#2fbf71] text-[#120f1c] font-black text-xs hover:bg-[#34d37d] transition-colors"
                >
                  {t("กลับสู่หน้าคอร์ส", "Back to Course")}
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Mobile On-Screen D-Pad */}
        <div className="w-full sm:hidden pt-2">
          <MobileDpad
            disabled={isPaused || isInBattle || chestModalMode !== null || isGameOver}
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

      {/* Battle Overlay for this room */}
      {isInBattle && (
        <BattleOverlay
          runId={`lesson-${lesson.id}`}
          monster={currentMonster}
          question={lessonQuestions[0]}
          questions={lessonQuestions}
          monsterHp={room.entity?.isCompleted ? 0 : Math.max(currentMonster.maxHp, lessonQuestions.length)}
          maxMonsterHp={Math.max(currentMonster.maxHp, lessonQuestions.length)}
          playerHearts={hearts}
          avatarKey={avatarKey}
          initialFocus={focus ?? avatar.stats.initialMp}
          maxFocus={avatar.stats.maxMp}
          extraShield={floorShieldBonus}
          rewardMultiplier={floorRewardMultiplier}
          courseId={course.id}
          lessonId={lesson.id}
          localValidation={shouldUseLocalValidation}
          onCorrectAnswer={handleCorrectAnswer}
          onWrongAnswer={handleWrongAnswer}
          onHealPlayer={() => setHearts((h) => Math.min(3, h + 1))}
          onProgressChange={(progress) => {
            if (typeof progress.focus === "number") {
              setFocus(progress.focus);
            }
          }}
          onClose={() => setIsInBattle(false)}
        />
      )}

      {/* Pause Modal */}
      <PauseModal
        isOpen={isPaused}
        onResume={() => setIsPaused(false)}
        onExit={() => router.push(`/courses/${course.id}`)}
      />
    </div>
  );
}
