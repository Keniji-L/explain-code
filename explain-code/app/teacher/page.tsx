"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  SiteHeader,
  getClientSession,
  setClientSession,
  ClientAuthSession,
} from "../components/SiteHeader";
import { Icon } from "../components/Icons";
import {
  Course,
  Enrollment,
  Lesson,
  LessonProgress,
  QuizQuestionItem,
} from "../lib/supabase";
import {
  isCoursePublic,
  loadLocalCourses,
  loadLocalEnrollments,
  loadLocalLessonProgress,
  loadLocalLessons,
  saveLocalCourses,
  saveLocalLessons,
} from "../lib/lms-data";
import { PixelSpriteView } from "../components/dungeon/PixelSpriteView";
import { getMonsterDef, MonsterType } from "../lib/dungeon/monsters";
import { hashString, dungeonNameForCourse } from "../lib/dungeon/seed";
import { SAMPLE_DUNGEON_QUESTIONS } from "../lib/dungeon/questions";
import {
  DungeonSaveRecord,
  calculateDungeonSaveProgressPercent,
  loadUserDungeonSaves,
} from "../lib/dungeon-save";
import { LANGUAGE_TRACKS } from "../lib/language-tracks";
import { TeacherDashboard } from "../components/TeacherDashboard";
import { useUiLanguage } from "../components/LanguageProvider";
import {
  BLOCK_MODEL_CELLS,
  BlockCellId,
  ClassroomRecord,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
  StudentRecord,
} from "../lib/curriculum";

export default function TeacherLMSDashboardPage() {
  const router = useRouter();
  const { uiLang, t } = useUiLanguage();
  const [session, setSession] = useState<ClientAuthSession | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [progress, setProgress] = useState<LessonProgress[]>([]);
  const [dungeonSaves, setDungeonSaves] = useState<DungeonSaveRecord[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [showAllCoursesMobile, setShowAllCoursesMobile] = useState(false);
  const courseDetailRef = useRef<HTMLDivElement | null>(null);
  const [workspaceMode, setWorkspaceMode] = useState<"courses" | "classrooms">(
    "courses"
  );
  const [activeTab, setActiveTab] = useState<
    "lessons" | "students" | "dungeon"
  >("lessons");

  // Classroom & Block Model 12-Cell Analytics State
  const [classrooms, setClassrooms] =
    useState<ClassroomRecord[]>(INITIAL_CLASSROOMS);
  const [classroomStudents, setClassroomStudents] =
    useState<StudentRecord[]>(INITIAL_STUDENTS);
  const [classroomCellAverages, setClassroomCellAverages] = useState<
    {
      classroom_id?: string;
      classroomId?: string;
      roomCode?: string;
      cell_id: string;
      avg_score: number;
      students_count: number;
    }[]
  >([]);
  const [classroomQuestionStats, setClassroomQuestionStats] = useState<
    {
      classroom_id?: string;
      classroomId?: string;
      roomCode?: string;
      question_id: string;
      cell_id: string;
      answers: number;
      wrong_percent: number;
    }[]
  >([]);
  const [classroomLoading, setClassroomLoading] = useState(false);

  // Dungeon Questions & Analytics State
  const [dungeonQuestions, setDungeonQuestions] = useState<any[]>([]);
  const [dungeonStats, setDungeonStats] = useState<
    Record<
      string,
      { totalAttempts: number; wrongCount: number; wrongPercent: number }
    >
  >({});
  const [editingDungeonQuestion, setEditingDungeonQuestion] = useState<
    any | null
  >(null);
  const [dqFormLessonId, setDqFormLessonId] = useState("");
  const [dqFormQuestion, setDqFormQuestion] = useState("");
  const [dqFormCode, setDqFormCode] = useState("");
  const [dqFormChoices, setDqFormChoices] = useState<string[]>([
    "",
    "",
    "",
    "",
  ]);
  const [dqFormCorrectIndex, setDqFormCorrectIndex] = useState(0);
  const [dqFormExplanation, setDqFormExplanation] = useState("");
  const [dqFormDifficulty, setDqFormDifficulty] = useState<
    "easy" | "medium" | "hard"
  >("easy");
  const [dqFormMonster, setDqFormMonster] = useState<MonsterType>("slime");
  const [dqFormIsBoss, setDqFormIsBoss] = useState(false);

  // Teacher Approval State
  const [inviteCodeInput, setInviteCodeInput] = useState("");
  const [approvalMsg, setApprovalMsg] = useState<string>("");

  // Course Modal / Form State
  const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(
    null
  );

  // Lesson Modal / Form State
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(
    null
  );
  const [quizQuestionText, setQuizQuestionText] = useState("");
  const [quizOptionsText, setQuizOptionsText] = useState("");
  const [quizCorrectIdx, setQuizCorrectIdx] = useState(0);
  const [quizExplanation, setQuizExplanation] = useState("");

  // AI Question Generator State (Lesson Quiz & Dungeon)
  const [aiGenLoading, setAiGenLoading] = useState(false);
  const [aiGenError, setAiGenError] = useState<string | null>(null);
  const [aiTargetCellId, setAiTargetCellId] = useState<BlockCellId | "auto">("auto");
  const [aiGenMeta, setAiGenMeta] = useState<{
    model?: string;
    targetCellLabel?: string;
    misconceptionReason?: string;
    targetedFromClassroomWeakness?: boolean;
    weaknessAvgScore?: number | null;
  } | null>(null);

  useEffect(() => {
    const syncTeacherState = () => {
      const current = getClientSession();
      if (!current) {
        router.replace("/login?role=teacher&redirect=/teacher");
        return;
      }
      if (current.role !== "teacher" && current.role !== "admin") {
        router.replace("/");
        return;
      }
      setSession(current);

      const localCourses = loadLocalCourses();
      const localLessons = loadLocalLessons();
      setCourses(localCourses);
      setLessons(localLessons);
      setEnrollments(loadLocalEnrollments());
      setProgress(loadLocalLessonProgress());
      setDungeonSaves(loadUserDungeonSaves(current.userId));

      const owned = localCourses.filter((c) => isOwnerOfCourse(c, current));
      setSelectedCourseId((prev) =>
        prev && owned.some((c) => c.id === prev)
          ? prev
          : owned[0]?.id || ""
      );
    };

    syncTeacherState();
    window.addEventListener("explain-code-auth-change", syncTeacherState);
    window.addEventListener("storage", syncTeacherState);
    return () => {
      window.removeEventListener("explain-code-auth-change", syncTeacherState);
      window.removeEventListener("storage", syncTeacherState);
    };
  }, [router]);

  // Load dungeon questions for current course
  useEffect(() => {
    async function fetchDungeonData() {
      if (!selectedCourseId) return;
      try {
        const res = await fetch(
          `/api/teacher/dungeon?courseId=${encodeURIComponent(selectedCourseId)}`
        );
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.questions) && data.questions.length > 0) {
            setDungeonQuestions(data.questions);
            setDungeonStats(data.stats || {});
            return;
          }
        }
      } catch {
        // ignore
      }
      // Fallback sample questions
      setDungeonQuestions(
        SAMPLE_DUNGEON_QUESTIONS.map((q, idx) => ({
          id: q.id,
          course_id: selectedCourseId,
          lesson_id: null,
          question: q.question,
          code_snippet: q.codeSnippet,
          choices: q.choices,
          correct_index: q.correctIndex,
          explanation: q.explanation,
          difficulty: q.difficulty,
          monster_type: idx === SAMPLE_DUNGEON_QUESTIONS.length - 1 ? "boss" : "slime",
          is_boss: idx === SAMPLE_DUNGEON_QUESTIONS.length - 1,
        }))
      );
    }
    void fetchDungeonData();
  }, [selectedCourseId]);

  const handleOpenDungeonModal = (
    q?: any,
    defaultLessonId?: string,
    isBossDefault?: boolean
  ) => {
    if (q) {
      setEditingDungeonQuestion(q);
      setDqFormLessonId(q.lesson_id || defaultLessonId || "");
      setDqFormQuestion(q.question || "");
      setDqFormCode(q.code_snippet || "");
      setDqFormChoices(
        Array.isArray(q.choices) && q.choices.length === 4
          ? q.choices
          : ["", "", "", ""]
      );
      setDqFormCorrectIndex(q.correct_index ?? 0);
      setDqFormExplanation(q.explanation || "");
      setDqFormDifficulty(q.difficulty || "easy");
      setDqFormMonster(q.monster_type || (q.is_boss ? "boss" : "slime"));
      setDqFormIsBoss(Boolean(q.is_boss));
    } else {
      setEditingDungeonQuestion({ course_id: selectedCourseId });
      setDqFormLessonId(defaultLessonId || "");
      setDqFormQuestion("");
      setDqFormCode("");
      setDqFormChoices(["", "", "", ""]);
      setDqFormCorrectIndex(0);
      setDqFormExplanation("");
      setDqFormDifficulty("easy");
      setDqFormMonster(isBossDefault ? "boss" : "slime");
      setDqFormIsBoss(Boolean(isBossDefault));
    }
  };

  const handleSaveDungeonQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId || !dqFormQuestion.trim()) return;

    const payload = {
      id: editingDungeonQuestion?.id,
      courseId: selectedCourseId,
      lessonId: dqFormLessonId || null,
      question: dqFormQuestion.trim(),
      codeSnippet: dqFormCode.trim() || null,
      choices: dqFormChoices.map((c) => c.trim()),
      correctIndex: dqFormCorrectIndex,
      explanation: dqFormExplanation.trim(),
      difficulty: dqFormDifficulty,
      monsterType: dqFormIsBoss ? "boss" : dqFormMonster,
      isBoss: dqFormIsBoss,
    };

    try {
      const res = await fetch("/api/teacher/dungeon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.question) {
          setDungeonQuestions((prev) => {
            const exists = prev.some((item) => item.id === data.question.id);
            if (exists) {
              return prev.map((item) =>
                item.id === data.question.id ? data.question : item
              );
            }
            return [...prev, data.question];
          });
        }
      }
    } catch {
      // local update fallback
      setDungeonQuestions((prev) => {
        const newQ = {
          ...payload,
          id: payload.id || `dq-${Date.now()}`,
          created_at: new Date().toISOString(),
        };
        const exists = prev.some((item) => item.id === newQ.id);
        if (exists) {
          return prev.map((item) => (item.id === newQ.id ? newQ : item));
        }
        return [...prev, newQ];
      });
    }

    setEditingDungeonQuestion(null);
  };

  const handleDeleteDungeonQuestion = async (questionId: string) => {
    if (
      !confirm(
        t(
          "คุณแน่ใจหรือไม่ว่าต้องการลบคำถามดันเจี้ยนข้อนี้?",
          "Are you sure you want to delete this dungeon question?"
        )
      )
    )
      return;
    try {
      await fetch(
        `/api/teacher/dungeon?questionId=${encodeURIComponent(questionId)}`,
        { method: "DELETE" }
      );
    } catch {
      // ignore
    }
    setDungeonQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const fetchClassroomAnalytics = useCallback(async () => {
    if (!session) return;
    try {
      setClassroomLoading(true);
      const res = await fetch(
        `/api/teacher/classrooms?teacherUsername=${encodeURIComponent(
          session.username || session.displayName || "ครูตัวอย่าง"
        )}&teacherId=${encodeURIComponent(session.userId || "")}`
      );
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data.classrooms) && data.classrooms.length > 0) {
        setClassrooms(data.classrooms);
      }
      if (Array.isArray(data.students) && data.students.length > 0) {
        setClassroomStudents(data.students);
      }
      if (Array.isArray(data.cellAverages)) {
        setClassroomCellAverages(data.cellAverages);
      }
      if (Array.isArray(data.questionStats)) {
        setClassroomQuestionStats(data.questionStats);
      }
    } catch (err) {
      console.warn("Failed to fetch teacher classrooms:", err);
    } finally {
      setClassroomLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (session && (workspaceMode === "classrooms" || classroomCellAverages.length === 0)) {
      void fetchClassroomAnalytics();
    }
  }, [session, workspaceMode, classroomCellAverages.length, fetchClassroomAnalytics]);

  const handleCreateClassroom = async (
    roomName: string
  ): Promise<ClassroomRecord> => {
    const fallbackCode = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const teacherName = session?.displayName || session?.username || "ครูตัวอย่าง";
    const localRoom: ClassroomRecord = {
      roomCode: fallbackCode,
      roomName,
      teacherUsername: teacherName,
      pinnedReviewTopicId: 1,
      pinnedReviewNote: t(
        "เริ่มต้นฝึกอ่านโค้ดเรื่องที่ 1 ตัวแปรและการคำนวณ",
        "Start practicing code reading: Topic 1 Variables & Calculations"
      ),
      createdAt: t("วันนี้", "Today"),
    };

    try {
      const res = await fetch("/api/teacher/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName,
          teacherUsername: teacherName,
          teacherId: session?.userId,
          pinnedTopicId: 1,
          pinnedNote: "เริ่มต้นฝึกอ่านโค้ดเรื่องที่ 1 ตัวแปรและการคำนวณ",
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.classroom) {
          const created: ClassroomRecord = {
            roomCode: data.classroom.roomCode,
            roomName: data.classroom.roomName,
            teacherUsername: data.classroom.teacherUsername || teacherName,
            pinnedReviewTopicId: data.classroom.pinnedReviewTopicId ?? 1,
            pinnedReviewNote:
              data.classroom.pinnedReviewNote ??
              "เริ่มต้นฝึกอ่านโค้ดเรื่องที่ 1 ตัวแปรและการคำนวณ",
            createdAt: data.classroom.createdAt || "วันนี้",
          };
          setClassrooms((prev) => [
            created,
            ...prev.filter((c) => c.roomCode !== created.roomCode),
          ]);
          return created;
        }
      }
    } catch (err) {
      console.warn("Failed to create classroom via API:", err);
    }

    setClassrooms((prev) => [localRoom, ...prev]);
    return localRoom;
  };

  const handleUpdatePinnedReview = async (
    roomCode: string,
    topicId: number | null,
    note: string
  ) => {
    setClassrooms((prev) =>
      prev.map((r) =>
        r.roomCode === roomCode
          ? { ...r, pinnedReviewTopicId: topicId, pinnedReviewNote: note }
          : r
      )
    );
    try {
      await fetch("/api/teacher/classrooms", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomCode,
          pinnedTopicId: topicId,
          pinnedNote: note,
        }),
      });
    } catch (err) {
      console.warn("Failed to update pinned review via API:", err);
    }
  };

  function isOwnerOfCourse(course: Course, user: ClientAuthSession | null) {
    if (!user) return false;
    if (user.role === "admin") return true;
    if (course.teacher_id === user.userId) return true;
    // รองรับบัญชีครูตัวอย่าง / ครูสมชายตัวอย่าง กับคอร์สเริ่มต้น
    if (
      course.teacher_id === "tch-1" &&
      (user.username.includes("สมชาย") ||
        user.username.includes("ครูตัวอย่าง") ||
        Boolean(user.displayName && user.displayName.includes("ครูตัวอย่าง")) ||
        user.userId === "tch-1")
    ) {
      return true;
    }
    return false;
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-[#0d0b14] p-8 text-center text-sm text-[#9a93ad]">
        {t("กำลังโหลดแดชบอร์ดครู...", "Loading teacher dashboard...")}
      </div>
    );
  }

  const isApproved =
    session.role === "admin" || session.teacherStatus !== "pending";

  const myCourses = courses.filter((c) => isOwnerOfCourse(c, session));
  const selectedCourse =
    myCourses.find((c) => c.id === selectedCourseId) || myCourses[0] || null;

  const selectedCourseLessons = selectedCourse
    ? lessons
        .filter((l) => l.course_id === selectedCourse.id)
        .sort((a, b) => a.order_index - b.order_index)
    : [];

  const handleVerifyInviteCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setApprovalMsg("");
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve-teacher",
          inviteCode: inviteCodeInput.trim(),
          teacherId: session.userId,
          username: session.username,
          displayName: session.displayName,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setApprovalMsg(data.error || t("รหัสเชิญไม่ถูกต้อง", "Invalid invite code"));
        return;
      }
      const updatedSession: ClientAuthSession = {
        ...session,
        teacherStatus: "approved",
      };
      setClientSession(updatedSession);
      setSession(updatedSession);
      setApprovalMsg(
        t(
          "อนุมัติบัญชีครูสำเร็จ! คุณสามารถสร้างและจัดการคอร์สได้ทันที",
          "Teacher account approved! You can now create and manage courses."
        )
      );
    } catch {
      setApprovalMsg(t("เกิดข้อผิดพลาดในการเชื่อมต่อ", "Connection error"));
    }
  };

  // ==================== Course CRUD ====================
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse || !editingCourse.title?.trim() || !isApproved) return;

    const nowIso = new Date().toISOString();
    const isNew = !editingCourse.id;
    const joinCode =
      editingCourse.join_code?.trim().toUpperCase() ||
      Math.random().toString(36).substring(2, 8).toUpperCase();

    const isPublicMode =
      editingCourse.visibility !== undefined
        ? editingCourse.visibility === "public"
        : editingCourse.is_published !== undefined
        ? Boolean(editingCourse.is_published)
        : true;

    const generatedCourseId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `course-${Date.now()}`;
    const courseObj: Course = {
      id: editingCourse.id || generatedCourseId,
      teacher_id: session.userId,
      teacher_name: session.displayName || session.username,
      title: editingCourse.title.trim(),
      description: (editingCourse.description || "").trim(),
      join_code: joinCode,
      level: editingCourse.level || "beginner",
      visibility: isPublicMode ? "public" : "private",
      is_published: isPublicMode,
      created_at: editingCourse.created_at || nowIso,
      updated_at: nowIso,
    };

    const updated = isNew
      ? [courseObj, ...courses]
      : courses.map((c) => (c.id === courseObj.id ? courseObj : c));

    setCourses(updated);
    saveLocalCourses(updated);
    setSelectedCourseId(courseObj.id);
    setEditingCourse(null);

    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-course",
          course: courseObj,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.course?.id) {
          const syncedCourse: Course = {
            ...courseObj,
            ...data.course,
            visibility: data.course.is_published ? "public" : "private",
          };
          const synced = updated.map((c) =>
            c.id === courseObj.id ? syncedCourse : c
          );
          setCourses(synced);
          saveLocalCourses(synced);
          setSelectedCourseId(syncedCourse.id);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleSetCourseVisibility = async (
    course: Course,
    targetVisibility: "public" | "private"
  ) => {
    if (!isApproved) return;
    const isPublicMode = targetVisibility === "public";
    const updatedCourse: Course = {
      ...course,
      visibility: targetVisibility,
      is_published: isPublicMode,
      updated_at: new Date().toISOString(),
    };
    const updated = courses.map((c) =>
      c.id === course.id ? updatedCourse : c
    );
    setCourses(updated);
    saveLocalCourses(updated);

    try {
      await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-course",
          course: updatedCourse,
          role: session.role,
          teacherStatus: session.teacherStatus,
        }),
      });
    } catch {
      // ignore
    }
  };

  const handleTogglePublishCourse = async (course: Course) => {
    const currentlyPublic = isCoursePublic(course);
    await handleSetCourseVisibility(
      course,
      currentlyPublic ? "private" : "public"
    );
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!isApproved) return;
    const remaining = courses.filter((c) => c.id !== courseId);
    const remainingLessons = lessons.filter((l) => l.course_id !== courseId);
    setCourses(remaining);
    setLessons(remainingLessons);
    saveLocalCourses(remaining);
    saveLocalLessons(remainingLessons);

    if (selectedCourseId === courseId) {
      const nextOwned = remaining.filter((c) => isOwnerOfCourse(c, session));
      setSelectedCourseId(nextOwned[0]?.id || "");
    }

    try {
      await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-course",
          courseId,
          teacherId: session.userId,
        }),
      });
    } catch {
      // ignore
    }
  };

  // ==================== Lesson CRUD & Reorder ====================
  const openNewLessonModal = () => {
    if (!selectedCourse) return;
    setEditingLesson({
      course_id: selectedCourse.id,
      title: "",
      content_md: "",
      code_example: "",
      programming_language: "javascript",
      external_url: "",
      video_url: "",
      quiz_questions: [],
      order_index: selectedCourseLessons.length + 1,
      is_published: true,
    });
    setQuizQuestionText("");
    setQuizOptionsText("");
    setQuizCorrectIdx(0);
    setQuizExplanation("");
    setAiGenError(null);
    setAiGenMeta(null);
  };

  const handleAddQuizItem = () => {
    if (!editingLesson || !quizQuestionText.trim()) return;
    const opts = quizOptionsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (opts.length < 2) return;

    const newItem: QuizQuestionItem = {
      id: `q-${Date.now()}`,
      question: quizQuestionText.trim(),
      options: opts,
      correctIndex: Math.min(opts.length - 1, Math.max(0, quizCorrectIdx)),
      explanation: quizExplanation.trim() || undefined,
    };

    setEditingLesson({
      ...editingLesson,
      quiz_questions: [...(editingLesson.quiz_questions || []), newItem],
    });
    setQuizQuestionText("");
    setQuizOptionsText("");
    setQuizCorrectIdx(0);
    setQuizExplanation("");
  };

  const handleGenerateAiQuestion = async (mode: "lesson" | "dungeon") => {
    setAiGenLoading(true);
    setAiGenError(null);
    setAiGenMeta(null);

    const weakestCells = [...classroomCellAverages]
      .sort((a, b) => a.avg_score - b.avg_score)
      .slice(0, 4)
      .map((c) => ({ cellId: c.cell_id, avgScore: c.avg_score }));

    const linkedLesson =
      mode === "lesson"
        ? editingLesson
        : selectedCourseLessons.find((l) => l.id === dqFormLessonId) ||
          selectedCourseLessons[0];

    const codeSnippet =
      mode === "lesson"
        ? editingLesson?.code_example || ""
        : dqFormCode.trim() || linkedLesson?.code_example || "";

    const payload = {
      mode,
      courseTitle: selectedCourse?.title || "",
      programmingLanguage: linkedLesson?.programming_language || "javascript",
      lessonTitle: linkedLesson?.title || "",
      lessonContent: linkedLesson?.content_md || "",
      codeSnippet,
      targetCellId: aiTargetCellId,
      weakestCells,
      difficulty: mode === "dungeon" ? dqFormDifficulty : "medium",
      existingQuestions:
        mode === "lesson"
          ? (editingLesson?.quiz_questions || []).map((q) => q.question)
          : dungeonQuestions.map((q) => q.question_text),
    };

    try {
      const res = await fetch("/api/teacher/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok || !data?.generated) {
        setAiGenError(
          data?.error ||
            t(
              "ไม่สามารถสร้างคำถามด้วย AI ได้ในขณะนี้",
              "Unable to generate AI question right now"
            )
        );
        return;
      }

      const g = data.generated;
      if (mode === "lesson") {
        setQuizQuestionText(g.question || "");
        setQuizOptionsText(
          Array.isArray(g.choices)
            ? g.choices
                .map((c: string) => c.replace(/,/g, " /").trim())
                .join(", ")
            : ""
        );
        setQuizCorrectIdx(
          typeof g.correctIndex === "number" ? g.correctIndex : 0
        );
        setQuizExplanation(g.explanation || "");
      } else {
        setDqFormQuestion(g.question || "");
        if (!dqFormCode.trim() && g.codeSnippet) {
          setDqFormCode(g.codeSnippet);
        }
        if (Array.isArray(g.choices) && g.choices.length >= 4) {
          setDqFormChoices(g.choices.slice(0, 4));
        }
        setDqFormCorrectIndex(
          typeof g.correctIndex === "number" ? g.correctIndex : 0
        );
        setDqFormExplanation(g.explanation || "");
        if (
          g.difficulty === "easy" ||
          g.difficulty === "medium" ||
          g.difficulty === "hard"
        ) {
          setDqFormDifficulty(g.difficulty);
        }
        if (
          !dqFormIsBoss &&
          (g.recommendedMonster === "slime" ||
            g.recommendedMonster === "skeleton" ||
            g.recommendedMonster === "goblin" ||
            g.recommendedMonster === "boss")
        ) {
          setDqFormMonster(g.recommendedMonster);
        }
      }

      setAiGenMeta({
        model: data.model,
        targetCellLabel: g.targetCellLabel,
        misconceptionReason: g.misconceptionReason,
        targetedFromClassroomWeakness: Boolean(
          data.targetedFromClassroomWeakness
        ),
        weaknessAvgScore: data.weaknessAvgScore ?? null,
      });
    } catch {
      setAiGenError(
        t(
          "เกิดข้อผิดพลาดในการเชื่อมต่อ AI กรุณาลองใหม่อีกครั้ง",
          "Failed to connect to AI. Please try again."
        )
      );
    } finally {
      setAiGenLoading(false);
    }
  };

  const handleSaveLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLesson || !editingLesson.title?.trim() || !selectedCourse) {
      return;
    }

    const nowIso = new Date().toISOString();
    const isNew = !editingLesson.id;
    const generatedLessonId =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `lesson-${Date.now()}`;
    const lessonObj: Lesson = {
      id: editingLesson.id || generatedLessonId,
      course_id: selectedCourse.id,
      title: editingLesson.title.trim(),
      content_md: editingLesson.content_md || "",
      code_example: editingLesson.code_example || "",
      programming_language: editingLesson.programming_language || "javascript",
      external_url: editingLesson.external_url?.trim() || null,
      video_url: editingLesson.video_url?.trim() || null,
      quiz_questions: editingLesson.quiz_questions || [],
      order_index: Number(
        editingLesson.order_index || selectedCourseLessons.length + 1
      ),
      is_published:
        editingLesson.is_published !== undefined
          ? Boolean(editingLesson.is_published)
          : true,
      created_at: editingLesson.created_at || nowIso,
      updated_at: nowIso,
    };

    const updated = isNew
      ? [...lessons, lessonObj]
      : lessons.map((l) => (l.id === lessonObj.id ? lessonObj : l));

    setLessons(updated);
    saveLocalLessons(updated);
    setEditingLesson(null);

    try {
      const res = await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "upsert-lesson",
          lesson: lessonObj,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data?.lesson?.id) {
          const synced = updated.map((l) =>
            l.id === lessonObj.id ? { ...lessonObj, ...data.lesson } : l
          );
          setLessons(synced);
          saveLocalLessons(synced);
        }
      }
    } catch {
      // ignore
    }
  };

  const handleMoveLesson = (lessonId: string, direction: "up" | "down") => {
    const idx = selectedCourseLessons.findIndex((l) => l.id === lessonId);
    if (idx < 0) return;
    const targetIdx = direction === "up" ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= selectedCourseLessons.length) return;

    const reordered = [...selectedCourseLessons];
    const temp = reordered[idx];
    reordered[idx] = reordered[targetIdx];
    reordered[targetIdx] = temp;

    const reindexedMap = new Map<string, number>();
    reordered.forEach((item, i) => reindexedMap.set(item.id, i + 1));

    const updatedAll = lessons.map((l) =>
      reindexedMap.has(l.id) ? { ...l, order_index: reindexedMap.get(l.id)! } : l
    );
    setLessons(updatedAll);
    saveLocalLessons(updatedAll);
  };

  const handleDeleteLesson = async (lessonId: string) => {
    const updated = lessons.filter((l) => l.id !== lessonId);
    setLessons(updated);
    saveLocalLessons(updated);

    try {
      await fetch("/api/lms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-lesson", lessonId }),
      });
    } catch {
      // ignore
    }
  };

  // นักเรียนที่ลงทะเบียนหรือมี progress ในคอร์สที่เลือก
  const courseStudentIds = Array.from(
    new Set([
      ...enrollments
        .filter((e) => e.course_id === selectedCourse?.id)
        .map((e) => e.student_id),
      ...progress
        .filter((p) => p.course_id === selectedCourse?.id)
        .map((p) => p.student_id),
    ])
  );

  const courseStudentRows = courseStudentIds.map((stuId) => {
    const profile = classroomStudents.find(
      (s) => s.id === stuId || s.nickname === stuId
    );
    const stuProg = progress.filter(
      (p) => p.course_id === selectedCourse?.id && p.student_id === stuId
    );
    const doneCount = stuProg.filter((p) => p.is_completed).length;
    const pct =
      selectedCourseLessons.length > 0
        ? Math.round((doneCount / selectedCourseLessons.length) * 100)
        : 0;

    const cellValues = profile?.cellScores
      ? (Object.entries(profile.cellScores) as [BlockCellId, number][])
      : [];
    const avgBlockScore =
      cellValues.length > 0
        ? Math.round(
            cellValues.reduce((sum, [, val]) => sum + val, 0) / cellValues.length
          )
        : null;
    const weakestEntry =
      cellValues.length > 0
        ? [...cellValues].sort((a, b) => a[1] - b[1])[0]
        : null;
    const weakestCellMeta = weakestEntry
      ? BLOCK_MODEL_CELLS.find((c) => c.id === weakestEntry[0])
      : null;

    return {
      stuId,
      displayName: profile?.nickname || stuId,
      hasProfileName: Boolean(profile?.nickname),
      roomCode: profile?.roomCode || "",
      xp: profile?.xp ?? 0,
      doneCount,
      pct,
      avgBlockScore,
      weakestCellId: weakestEntry ? weakestEntry[0] : null,
      weakestCellLabel: weakestCellMeta
        ? `${weakestCellMeta.id} · ${weakestCellMeta.shortTitle}`
        : null,
      weakestCellScore: weakestEntry ? Math.round(weakestEntry[1]) : null,
      explainCount: profile?.explainCount ?? 0,
      recentExplanations: profile?.recentExplanations ?? [],
    };
  });

  const handleExportStudentsCsv = () => {
    if (!selectedCourse || courseStudentRows.length === 0) return;
    const escapeCsv = (val: string | number | null | undefined) => {
      const str = String(val ?? "");
      return `"${str.replace(/"/g, '""')}"`;
    };
    const headers = [
      t("รหัส/ID", "Student ID"),
      t("ชื่อนักเรียน", "Student Name"),
      t("ห้องเรียน", "Classroom"),
      t("บทเรียนที่เรียนจบ", "Completed Lessons"),
      t("บทเรียนทั้งหมด", "Total Lessons"),
      t("ความคืบหน้า (%)", "Progress (%)"),
      t("คะแนน Block Model เฉลี่ย (%)", "Avg Block Model Score (%)"),
      t("ช่องที่ควรทบทวน", "Cell to Review"),
      t("จำนวนครั้งที่อธิบายโค้ด", "Code Explanations"),
      "XP",
    ];
    const rows = courseStudentRows.map((r) => [
      r.stuId,
      r.displayName,
      r.roomCode || "-",
      r.doneCount,
      selectedCourseLessons.length,
      r.pct,
      r.avgBlockScore !== null ? r.avgBlockScore : "-",
      r.weakestCellLabel
        ? `${r.weakestCellLabel} (${r.weakestCellScore}%)`
        : "-",
      r.explainCount,
      r.xp,
    ]);
    const csvContent =
      "\uFEFF" +
      [headers, ...rows]
        .map((row) => row.map((cell) => escapeCsv(cell)).join(","))
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `students-${selectedCourse.join_code || selectedCourse.id}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] text-[#f4efe6]">
      <SiteHeader />

      <main className="mx-auto max-w-6xl px-4 pt-6 pb-24 sm:px-6 sm:py-8">
        {/* Top Header */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-[#3d395a] bg-[#1c1b2b] px-3 py-1 text-xs font-bold text-[#f6c945]">
              <Icon name="users" className="h-3.5 w-3.5" />
              {t(
                "ระบบจัดการคอร์สและบทเรียนสำหรับครูผู้สอน",
                "Teacher Course & Lesson Management"
              )}
            </span>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold text-[#f4efe6]">
              {t("แดชบอร์ดครูผู้สอน", "Teacher Dashboard")} ({session.displayName || session.username})
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-[#9a93ad]">
              {t(
                "จัดการคอร์ส บทเรียน ดันเจี้ยน และวิเคราะห์ผลนักเรียนรายห้อง",
                "Manage courses, lessons, dungeons, and analyze classroom performance"
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/my-learning"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2.5 text-xs font-bold text-[#f4efe6] hover:border-[#f6c945] hover:bg-[#252238] transition-colors whitespace-nowrap"
            >
              <Icon name="award" className="h-4 w-4 text-[#f6c945]" />
              <span>{t("การเรียนของฉัน", "My Learning")}</span>
            </Link>
            <Link
              href="/my-history"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2.5 text-xs font-bold text-[#f4efe6] hover:border-[#f6c945] hover:bg-[#252238] transition-colors whitespace-nowrap"
            >
              <Icon name="clock" className="h-4 w-4 text-[#f6c945]" />
              <span>{t("ประวัติของฉัน", "My History")}</span>
            </Link>
            {isApproved && workspaceMode === "courses" && (
              <button
                type="button"
                onClick={() =>
                  setEditingCourse({
                    title: "",
                    description: "",
                    level: "beginner",
                    is_published: true,
                  })
                }
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#2fbf71] px-4 py-2.5 text-xs font-extrabold text-[#0b0b14] shadow-md hover:bg-[#34d37d] transition-colors cursor-pointer whitespace-nowrap"
              >
                <span>{t("+ สร้างคอร์สเรียนใหม่", "+ Create New Course")}</span>
              </button>
            )}
          </div>
        </div>

        {/* ==================== ความคืบหน้าดันเจี้ยนของครู (เซฟเกมล่าสุด) ==================== */}
        {dungeonSaves.length > 0 && (
          <section className="mb-8 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-extrabold text-[#ffe27a] flex items-center gap-2">
                <Icon name="gamepad" className="h-5 w-5 text-[#9b5de5]" />
                <span>{t("ความคืบหน้าดันเจี้ยนของคุณ (เซฟเกมล่าสุด)", "Your Dungeon Progress (Latest Save)")}</span>
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
                        <span className="text-[11px] font-semibold text-[#9a93ad]">
                          💾 {t("เซฟล่าสุด:", "Last saved:")} {savedTimeText}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold text-[#f4efe6]">
                        {t(
                          `ถึงด่านที่ ${save.currentFloorNumber}/${save.totalFloors}`,
                          `Stage ${save.currentFloorNumber}/${save.totalFloors}`
                        )}{" "}
                        · {save.currentTopicTitle}
                      </h3>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-[#c4bdd6]">
                        <span className="rounded-md border border-[#9b5de5]/60 bg-[#25193b] px-2 py-0.5 text-[11px] font-bold text-[#ffe27a]">
                          ⚔️ {t("เฟสคำถามที่", "Question Phase")}{" "}
                          {save.currentPhaseNumber ||
                            (save.arenaSnapshot?.battlePhaseIndex ?? 0) + 1}
                          /
                          {save.totalPhases ||
                            save.arenaSnapshot?.battleTotalPhases ||
                            3}
                        </span>
                        <span>
                          {t(
                            `พิชิตแล้ว ${save.completedTopicIds.length} จาก ${save.totalFloors} ด่าน · สะสม ${save.xp} XP`,
                            `Cleared ${save.completedTopicIds.length} of ${save.totalFloors} stages · ${save.xp} XP`
                          )}
                        </span>
                      </div>

                      <div className="mt-3">
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className="text-[#c4bdd6]">{t("ความคืบหน้า", "Progress")}</span>
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
                            {t("ประวัติการเล่นล่าสุด:", "Recent Play History:")}
                          </p>
                          {save.history.slice(0, 3).map((h, i) => (
                            <div
                              key={`${h.topicId}-${i}`}
                              className="flex items-center justify-between text-[11px] text-[#e8e1cf]"
                            >
                              <span className="truncate pr-2">{h.topicTitle}</span>
                              {h.topicTitle.includes("(จุดเซฟเกม") ? (
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
                      <span>{t("เล่นต่อจากที่เซฟไว้ →", "Resume from Save →")}</span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ==================== ความคืบหน้าคอร์สและดันเจี้ยนคอร์สที่ครูเข้าเล่น ==================== */}
        {(() => {
          const mySelfEnrollments = enrollments.filter(
            (e) => e.student_id === session.userId
          );
          const mySelfProgress = progress.filter(
            (p) => p.student_id === session.userId
          );
          const playedCourseIds = new Set([
            ...mySelfEnrollments.map((e) => e.course_id),
            ...mySelfProgress.map((p) => p.course_id),
          ]);
          const playedCourses = courses.filter((c) =>
            playedCourseIds.has(c.id)
          );
          if (playedCourses.length === 0) return null;

          return (
            <section className="mb-8 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-lg font-extrabold text-[#ffe27a] flex items-center gap-2">
                  <Icon name="award" className="h-5 w-5 text-[#2fbf71]" />
                  <span>
                    {t(
                      "คอร์สและด่านดันเจี้ยนที่คุณเล่นล่าสุด (ความคืบหน้าส่วนตัว)",
                      "Recently Played Courses & Dungeons (Personal Progress)"
                    )}
                  </span>
                </h2>
                <Link
                  href="/my-learning"
                  className="text-xs font-bold text-[#9a93ad] hover:text-[#ffe27a] transition-colors"
                >
                  {t("ดูทั้งหมดในการเรียนของฉัน →", "View All in My Learning →")}
                </Link>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {playedCourses.map((course) => {
                  const cLessons = lessons
                    .filter((l) => l.course_id === course.id && l.is_published)
                    .sort((a, b) => a.order_index - b.order_index);
                  const cProg = mySelfProgress.filter(
                    (p) => p.course_id === course.id
                  );
                  const completedSet = new Set(
                    cProg.filter((p) => p.is_completed).map((p) => p.lesson_id)
                  );
                  const enroll = mySelfEnrollments.find(
                    (e) => e.course_id === course.id
                  );
                  const resumeLessonIdx = Math.max(
                    0,
                    cLessons.findIndex(
                      (l) => l.id === enroll?.last_accessed_lesson_id
                    )
                  );
                  const resumeLesson =
                    cLessons[resumeLessonIdx] ||
                    cLessons.find((l) => !completedSet.has(l.id)) ||
                    cLessons[0];
                  const currentFloorNum = Math.min(
                    Math.max(1, cLessons.length),
                    resumeLessonIdx + 1
                  );
                  const totalCourseFloors = Math.max(1, cLessons.length);
                  const pct =
                    cLessons.length > 0
                      ? completedSet.size >= cLessons.length
                        ? 100
                        : Math.max(
                            Math.round(
                              (completedSet.size / cLessons.length) * 100
                            ),
                            Math.round(
                              ((Math.max(completedSet.size, currentFloorNum - 1) +
                                0.5) /
                                totalCourseFloors) *
                                100
                            )
                          )
                      : 0;

                  return (
                    <div
                      key={course.id}
                      className="rounded-2xl border border-[#2f2d45] bg-[#141220] p-5 shadow-lg flex flex-col justify-between gap-4"
                    >
                      <div>
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <span className="rounded-md border border-[#3d395a] bg-[#1c1b2b] px-2.5 py-0.5 text-[11px] font-bold text-[#f6c945]">
                            {t("รหัส:", "Code:")} {course.join_code}
                          </span>
                          <span className="text-[11px] font-bold text-[#ffe27a]">
                            💾 {t("ด่านล่าสุด:", "Latest Stage:")}{" "}
                            {t(`ด่านที่ ${currentFloorNum}/${totalCourseFloors}`, `Stage ${currentFloorNum}/${totalCourseFloors}`)}
                          </span>
                        </div>
                        <h3 className="text-base font-extrabold text-[#f4efe6]">
                          {course.title}
                        </h3>
                        {resumeLesson && (
                          <p className="mt-1 text-xs text-[#c4bdd6]">
                            {t("ด่าน/บทเรียนที่ค้างไว้:", "Paused Stage/Lesson:")}{" "}
                            <span className="font-bold text-[#ffe27a]">
                              {resumeLesson.title}
                            </span>
                          </p>
                        )}
                        <div className="mt-3">
                          <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                            <span className="text-[#c4bdd6]">
                              {t("ความคืบหน้า", "Progress")} ({completedSet.size}/{cLessons.length}{" "}
                              {t("ด่าน", "stages")})
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
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dungeon/${course.id}?floor=${Math.max(
                            0,
                            currentFloorNum - 1
                          )}`}
                          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#9b5de5] bg-[#5a2d91] px-3.5 py-2.5 text-xs font-extrabold text-[#ffe27a] hover:bg-[#6d3fc0] transition-colors whitespace-nowrap"
                        >
                          <Icon name="gamepad" className="h-4 w-4 shrink-0" />
                          <span>
                            {t(
                              `เล่นต่อด่านที่ ${currentFloorNum}/${totalCourseFloors} →`,
                              `Resume Stage ${currentFloorNum}/${totalCourseFloors} →`
                            )}
                          </span>
                        </Link>
                        {resumeLesson && (
                          <Link
                            href={`/courses/${course.id}/lessons/${resumeLesson.id}`}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#2fbf71] px-3.5 py-2.5 text-xs font-extrabold text-[#0b0b14] hover:bg-[#34d37d] transition-colors whitespace-nowrap"
                          >
                            <Icon name="play" className="h-3.5 w-3.5 shrink-0" />
                            <span className="truncate">{t("เรียนบทนี้ต่อ", "Continue Lesson")}</span>
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })()}

        {/* Teacher Approval Banner if Pending */}
        {!isApproved && (
          <div className="mb-6 rounded-2xl border border-[#f6c945]/40 bg-[#281d08] p-6 shadow-lg">
            <h2 className="text-base font-bold text-[#f6c945]">
              ⏳ {t("บัญชีครูของคุณอยู่ในสถานะรออนุมัติ (teacher_status: pending)", "Your teacher account is pending approval (teacher_status: pending)")}
            </h2>
            <p className="mt-1 text-xs text-[#ffe27a]">
              {t(
                "เพื่อป้องกันการสร้างเนื้อหาโดยไม่ได้รับอนุญาต กรุณากรอกรหัสเชิญครูจากโรงเรียนเพื่ออนุมัติบัญชีทันที (รหัสทดสอบคือ",
                "To prevent unauthorized content creation, enter your school's teacher invite code to approve your account immediately (test code:"
              )}{" "}
              <code className="font-mono font-bold text-[#f6c945]">TEACHER2026</code>)
            </p>
            <form
              onSubmit={handleVerifyInviteCode}
              className="mt-3 flex flex-wrap max-w-md gap-2"
            >
              <input
                type="text"
                value={inviteCodeInput}
                onChange={(e) => setInviteCodeInput(e.target.value)}
                placeholder={t("กรอกรหัสเชิญครู เช่น TEACHER2026", "Enter teacher invite code e.g. TEACHER2026")}
                className="flex-1 min-w-[200px] rounded-xl border border-[#3d395a] bg-[#141220] px-3.5 py-2 text-xs font-mono text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
              />
              <button
                type="submit"
                className="rounded-xl bg-[#f6c945] px-4 py-2 text-xs font-extrabold text-[#0b0b14] hover:bg-[#ffe27a] transition-colors cursor-pointer whitespace-nowrap"
              >
                {t("ยืนยันรหัสเชิญ", "Verify Invite Code")}
              </button>
            </form>
            {approvalMsg && (
              <p className="mt-2 text-xs font-bold text-[#ffe27a]">
                {approvalMsg}
              </p>
            )}
          </div>
        )}

        {/* Mode Switcher: คอร์ส/บทเรียน vs ห้องเรียน & Block Model 12 ช่อง */}
        <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setWorkspaceMode("courses")}
            className={`min-h-[52px] rounded-2xl border px-4 py-3 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              workspaceMode === "courses"
                ? "border-[#f6c945] bg-[#1c1b2b] text-[#f4efe6] shadow-lg"
                : "border-[#2f2d45] bg-[#141220] text-[#9a93ad] hover:border-[#3d395a] hover:text-[#f4efe6]"
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm font-extrabold">
                📚 {t("จัดการคอร์ส & ดันเจี้ยน", "Manage Courses & Dungeons")}
              </div>
              <div className="hidden sm:block text-[11px] opacity-80 mt-0.5">
                {t("สร้างคอร์ส เพิ่มบทเรียน และโจทย์ดันเจี้ยน", "Create courses, add lessons, and dungeon questions")}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#252238] px-2.5 py-0.5 text-[11px] font-bold text-[#f6c945]">
              {myCourses.length} {t("คอร์ส", "courses")}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setWorkspaceMode("classrooms")}
            className={`min-h-[52px] rounded-2xl border px-4 py-3 text-left transition-all cursor-pointer flex items-center justify-between gap-3 ${
              workspaceMode === "classrooms"
                ? "border-[#2fbf71] bg-[#102a1e] text-[#f4efe6] shadow-lg"
                : "border-[#2f2d45] bg-[#141220] text-[#9a93ad] hover:border-[#3d395a] hover:text-[#f4efe6]"
            }`}
          >
            <div>
              <div className="text-xs sm:text-sm font-extrabold">
                🏫 {t("ห้องเรียน & Block Model 12 ช่อง", "Classrooms & 12-Cell Block Model")}
              </div>
              <div className="hidden sm:block text-[11px] opacity-80 mt-0.5">
                {t("สร้างห้อง แจกรหัสห้อง และดู Heatmap จุดอ่อนของห้อง", "Create rooms, share codes, and inspect class weakness heatmaps")}
              </div>
            </div>
            <span className="shrink-0 rounded-full bg-[#193b2c] px-2.5 py-0.5 text-[11px] font-bold text-[#86efac]">
              {classrooms.length} {t("ห้อง", "rooms")}
            </span>
          </button>
        </div>

        {workspaceMode === "classrooms" ? (
          <TeacherDashboard
            embedded
            teacherUsername={session.displayName || session.username}
            classrooms={classrooms}
            students={classroomStudents}
            onCreateClassroom={handleCreateClassroom}
            onUpdatePinnedReview={handleUpdatePinnedReview}
            onLogout={() => {
              setClientSession(null);
              router.replace("/login");
            }}
            onSwitchToStudentView={() => router.push("/courses")}
            cellAverages={classroomCellAverages}
            questionStats={classroomQuestionStats}
            isLoading={classroomLoading}
            onRefresh={fetchClassroomAnalytics}
          />
        ) : (
        /* Main Teacher Workspace */
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left Column: Teacher's Courses */}
          <div className="lg:col-span-4 space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-xs font-bold uppercase tracking-wider text-[#9a93ad]">
                {t(`คอร์สของฉัน (${myCourses.length})`, `My Courses (${myCourses.length})`)}
              </h2>
              {myCourses.length > 1 && (
                <button
                  type="button"
                  onClick={() => setShowAllCoursesMobile((prev) => !prev)}
                  className="lg:hidden rounded-lg border border-[#3d395a] bg-[#1c1b2b] px-2.5 py-1 text-[11px] font-bold text-[#f6c945] cursor-pointer"
                >
                  {showAllCoursesMobile
                    ? t("ย่อรายการ", "Collapse")
                    : t(`ดูทั้งหมด (${myCourses.length})`, `View All (${myCourses.length})`)}
                </button>
              )}
            </div>

            {/* Mobile Quick Course Selector */}
            {myCourses.length > 0 && (
              <div className="lg:hidden rounded-2xl border border-[#2f2d45] bg-[#141220] p-3 space-y-2">
                <label className="block text-[11px] font-bold text-[#9a93ad]">
                  {t("สลับคอร์สที่กำลังจัดการ:", "Switch Active Course:")}
                </label>
                <select
                  value={selectedCourse?.id || ""}
                  onChange={(e) => {
                    setSelectedCourseId(e.target.value);
                    setTimeout(() => {
                      courseDetailRef.current?.scrollIntoView({
                        behavior: "smooth",
                        block: "start",
                      });
                    }, 50);
                  }}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs font-bold text-[#f4efe6] focus:border-[#f6c945] focus:outline-hidden"
                >
                  {myCourses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title} ({c.join_code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {myCourses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-[#3d395a] bg-[#141220] p-6 text-center text-xs text-[#9a93ad]">
                {t(
                  "คุณยังไม่มีคอร์สเรียน กดปุ่ม “+ สร้างคอร์สเรียนใหม่” ด้านบนเพื่อเริ่มต้น",
                  'You have no courses yet. Click "+ Create New Course" above to get started.'
                )}
              </div>
            ) : (
              <div
                className={`${
                  showAllCoursesMobile ? "space-y-3" : "hidden lg:block space-y-3"
                }`}
              >
                {myCourses.map((course) => {
                  const isSelected = selectedCourse?.id === course.id;
                  const lessonCount = lessons.filter(
                    (l) => l.course_id === course.id
                  ).length;

                  return (
                    <div
                      key={course.id}
                      onClick={() => {
                        setSelectedCourseId(course.id);
                        if (
                          typeof window !== "undefined" &&
                          window.innerWidth < 1024
                        ) {
                          setShowAllCoursesMobile(false);
                          setTimeout(() => {
                            courseDetailRef.current?.scrollIntoView({
                              behavior: "smooth",
                              block: "start",
                            });
                          }, 50);
                        }
                      }}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-[#f6c945] bg-[#1c1b2b] shadow-lg"
                          : "border-[#2f2d45] bg-[#141220] hover:border-[#3d395a] hover:bg-[#1c1b2b]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span
                          className={`rounded-md border px-2 py-0.5 text-[10px] font-bold ${
                            isCoursePublic(course)
                              ? "border-[#2fbf71]/40 bg-[#102a1e] text-[#86efac]"
                              : "border-[#9b5de5]/50 bg-[#25193b] text-[#e9d5ff]"
                          }`}
                        >
                          {isCoursePublic(course)
                            ? t("🌐 สาธารณะ (ขึ้นในดันเจี้ยน)", "🌐 Public (Listed in Dungeon)")
                            : t("🔒 ส่วนตัว (ใช้รหัสเข้าเรียน)", "🔒 Private (Join Code Required)")}
                        </span>
                        <span className="font-mono text-[11px] font-bold text-[#f6c945]">
                          {t("รหัส:", "Code:")} {course.join_code}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-[#f4efe6]">
                        {course.title}
                      </h3>
                      <p className="mt-1 line-clamp-2 text-xs text-[#9a93ad]">
                        {course.description}
                      </p>

                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#2f2d45] pt-2.5 text-[11px]">
                        <span className="font-semibold text-[#c4bdd6]">
                          {lessonCount} {t("บทเรียน", "lessons")}
                        </span>
                        <div
                          className="flex flex-wrap items-center gap-1.5"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => handleTogglePublishCourse(course)}
                            className="rounded-lg border border-[#3d395a] bg-[#141220] px-2 py-1 font-semibold text-[#f4efe6] hover:border-[#f6c945] hover:bg-[#252238] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {isCoursePublic(course)
                              ? t("สลับเป็นส่วนตัว 🔒", "Switch to Private 🔒")
                              : t("สลับเป็นสาธารณะ 🌐", "Switch to Public 🌐")}
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingCourse(course)}
                            className="rounded-lg border border-[#2fbf71]/40 bg-[#102a1e] px-2 py-1 font-semibold text-[#86efac] hover:bg-[#1a3d2d] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {t("แก้ไข", "Edit")}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCourse(course.id)}
                            className="rounded-lg border border-[#c0283a]/50 bg-[#2d141c] px-2 py-1 font-semibold text-[#fca5a5] hover:bg-[#3d1a24] transition-colors cursor-pointer whitespace-nowrap"
                          >
                            {t("ลบ", "Delete")}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Column: Selected Course Lessons & Enrolled Students */}
          <div ref={courseDetailRef} className="lg:col-span-8 min-w-0 scroll-mt-24">
            {selectedCourse ? (
              <div className="rounded-2xl border border-[#2f2d45] bg-[#141220] p-6 shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#2f2d45] pb-4">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-md border border-[#3d395a] bg-[#1c1b2b] px-2.5 py-0.5 font-mono text-xs font-bold text-[#f6c945]">
                        {t("รหัสเข้าคอร์ส:", "Course Join Code:")} {selectedCourse.join_code}
                      </span>
                      <span
                        className={`rounded-md border px-2.5 py-0.5 text-xs font-bold ${
                          isCoursePublic(selectedCourse)
                            ? "border-[#2fbf71]/50 bg-[#102a1e] text-[#86efac]"
                            : "border-[#9b5de5]/60 bg-[#25193b] text-[#e9d5ff]"
                        }`}
                      >
                        {isCoursePublic(selectedCourse)
                          ? t("🌐 โหมดสาธารณะ: แสดงในดันเจี้ยนการเรียนรู้ทันที", "🌐 Public Mode: Listed in Learning Dungeon immediately")
                          : t(`🔒 โหมดส่วนตัว: นักเรียนต้องใส่รหัส ${selectedCourse.join_code} เพื่อเข้าเรียน`, `🔒 Private Mode: Students need code ${selectedCourse.join_code} to join`)}
                      </span>
                      <Link
                        href={`/courses/${selectedCourse.id}`}
                        className="text-xs font-bold text-[#2fbf71] underline hover:text-[#34d37d]"
                      >
                        {t("ดูหน้าคอร์สฝั่งนักเรียน ↗", "View Student Course Page ↗")}
                      </Link>
                    </div>
                    <h2 className="text-xl font-bold text-[#f4efe6]">
                      {selectedCourse.title}
                    </h2>
                    {isApproved && (
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-bold text-[#9a93ad]">
                          {t("ตั้งค่าการเข้าถึงคอร์ส:", "Course Visibility:")}
                        </span>
                        <div className="inline-flex rounded-xl border border-[#2f2d45] bg-[#0d0b14] p-1 gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              handleSetCourseVisibility(selectedCourse, "public")
                            }
                            className={`rounded-lg px-3 py-1 text-[11px] font-extrabold transition-colors cursor-pointer ${
                              isCoursePublic(selectedCourse)
                                ? "bg-[#2fbf71] text-[#0b0b14]"
                                : "text-[#9a93ad] hover:text-[#f4efe6]"
                            }`}
                          >
                            {t("🌐 สาธารณะ (ขึ้นในดันเจี้ยนเลย)", "🌐 Public (Listed in Dungeon)")}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              handleSetCourseVisibility(selectedCourse, "private")
                            }
                            className={`rounded-lg px-3 py-1 text-[11px] font-extrabold transition-colors cursor-pointer ${
                              !isCoursePublic(selectedCourse)
                                ? "bg-[#9b5de5] text-white"
                                : "text-[#9a93ad] hover:text-[#f4efe6]"
                            }`}
                          >
                            {t(`🔒 ส่วนตัว (ใส่โค้ด ${selectedCourse.join_code} เพื่อเรียน)`, `🔒 Private (Code ${selectedCourse.join_code} required)`)}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {isApproved && (
                    <button
                      type="button"
                      onClick={openNewLessonModal}
                      className="rounded-xl bg-[#2fbf71] px-4 py-2 text-xs font-extrabold text-[#0b0b14] hover:bg-[#34d37d] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {t("+ เพิ่มบทเรียนใหม่", "+ Add New Lesson")}
                    </button>
                  )}
                </div>

                {/* Sub-tabs: บทเรียนในคอร์ส | นักเรียนและความคืบหน้า */}
                <div className="mt-4 mb-5 flex flex-wrap gap-2 border-b border-[#2f2d45]">
                  <button
                    type="button"
                    onClick={() => setActiveTab("lessons")}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === "lessons"
                        ? "border-[#2fbf71] text-[#2fbf71]"
                        : "border-transparent text-[#9a93ad] hover:text-[#f4efe6]"
                    }`}
                  >
                    {t(`จัดการบทเรียน (${selectedCourseLessons.length})`, `Manage Lessons (${selectedCourseLessons.length})`)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("students")}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
                      activeTab === "students"
                        ? "border-[#2fbf71] text-[#2fbf71]"
                        : "border-transparent text-[#9a93ad] hover:text-[#f4efe6]"
                    }`}
                  >
                    {t(`นักเรียนในคอร์ส (${courseStudentIds.length})`, `Students (${courseStudentIds.length})`)}
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("dungeon")}
                    className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                      activeTab === "dungeon"
                        ? "border-[#9b5de5] text-[#ffe27a]"
                        : "border-transparent text-[#9a93ad] hover:text-[#f4efe6]"
                    }`}
                  >
                    <span>{t("ดันเจี้ยน & มอนสเตอร์", "Dungeon & Monsters")}</span>
                  </button>
                </div>

                {activeTab === "lessons" ? (
                  <div className="space-y-3">
                    {selectedCourseLessons.length === 0 ? (
                      <p className="py-8 text-center text-xs text-[#9a93ad]">
                        {t(
                          "ยังไม่มีบทเรียนในคอร์สนี้ กดปุ่ม “+ เพิ่มบทเรียนใหม่” เพื่อเพิ่มเนื้อหา",
                          'No lessons in this course yet. Click "+ Add New Lesson" to add content.'
                        )}
                      </p>
                    ) : (
                      selectedCourseLessons.map((lesson, idx) => (
                        <div
                          key={lesson.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#2f2d45] bg-[#1c1b2b] p-4"
                        >
                          <div>
                            <span className="text-[11px] font-bold text-[#f6c945]">
                              {t("ลำดับที่", "Order")} {idx + 1} • {t("ภาษา", "Language")}{" "}
                              {lesson.programming_language.toUpperCase()}
                            </span>
                            <h3 className="text-sm font-bold text-[#f4efe6]">
                              {lesson.title}
                            </h3>
                            <p className="text-[11px] text-[#9a93ad]">
                              {t("แบบทดสอบท้ายบท:", "End-of-lesson Quiz:")}{" "}
                              {lesson.quiz_questions?.length || 0} {t("ข้อ", "questions")}
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleMoveLesson(lesson.id, "up")}
                              disabled={idx === 0}
                              className="rounded-lg border border-[#3d395a] bg-[#141220] px-2.5 py-1 text-xs font-bold text-[#f4efe6] hover:border-[#f6c945] disabled:opacity-40 cursor-pointer"
                              title={t("เลื่อนขึ้น", "Move Up")}
                            >
                              ↑
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                handleMoveLesson(lesson.id, "down")
                              }
                              disabled={
                                idx === selectedCourseLessons.length - 1
                              }
                              className="rounded-lg border border-[#3d395a] bg-[#141220] px-2.5 py-1 text-xs font-bold text-[#f4efe6] hover:border-[#f6c945] disabled:opacity-40 cursor-pointer"
                              title={t("เลื่อนลง", "Move Down")}
                            >
                              ↓
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingLesson(lesson)}
                              className="rounded-lg border border-[#2fbf71]/40 bg-[#102a1e] px-3 py-1 text-xs font-bold text-[#86efac] hover:bg-[#1a3d2d] cursor-pointer whitespace-nowrap"
                            >
                              {t("แก้ไข", "Edit")}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteLesson(lesson.id)}
                              className="rounded-lg border border-[#c0283a]/50 bg-[#2d141c] px-3 py-1 text-xs font-bold text-[#fca5a5] hover:bg-[#3d1a24] cursor-pointer whitespace-nowrap"
                            >
                              {t("ลบ", "Delete")}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : activeTab === "students" ? (
                  /* รายชื่อนักเรียนและความคืบหน้าในคอร์ส */
                  <div className="space-y-3">
                    {courseStudentRows.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-[#3d395a] bg-[#1c1b2b] p-8 text-center text-xs text-[#9a93ad]">
                        {t("ยังไม่มีนักเรียนลงทะเบียนในคอร์สนี้ (แจกรหัสคอร์ส", "No students enrolled in this course yet (share course code")}{" "}
                        <strong className="font-mono text-[#f6c945]">
                          {selectedCourse.join_code}
                        </strong>{" "}
                        {t("ให้นักเรียนกรอกในหน้าคอร์สเรียนได้เลย)", "for students to join on the courses page)")}
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-[#2f2d45] bg-[#1c1b2b] px-4 py-2.5">
                          <span className="text-xs font-bold text-[#c4bdd6]">
                            {t(`นักเรียนในคอร์สทั้งหมด ${courseStudentRows.length} คน`, `Total ${courseStudentRows.length} enrolled students`)}
                          </span>
                          <button
                            type="button"
                            onClick={handleExportStudentsCsv}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-[#2fbf71]/50 bg-[#102a1e] px-3 py-1.5 text-xs font-bold text-[#86efac] hover:bg-[#1a3d2d] cursor-pointer"
                          >
                            <span>📥 Export CSV</span>
                          </button>
                        </div>

                        {courseStudentRows.map((row) => (
                          <div
                            key={row.stuId}
                            className="rounded-xl border border-[#2f2d45] bg-[#1c1b2b] p-4 space-y-3"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#5a2d91] text-[#ffe27a] font-extrabold">
                                  {row.displayName.slice(0, 1).toUpperCase()}
                                </span>
                                <span className="text-sm font-bold text-[#f4efe6]">
                                  {row.displayName}
                                </span>
                                {row.hasProfileName && (
                                  <span className="rounded-md border border-[#3d395a] bg-[#141220] px-2 py-0.5 font-mono text-[10px] text-[#9a93ad]">
                                    {row.stuId}
                                  </span>
                                )}
                                {row.roomCode && (
                                  <span className="rounded-md border border-[#9b5de5]/40 bg-[#5a2d91]/30 px-2 py-0.5 text-[10px] text-[#d8b4fe]">
                                    {t("ห้อง", "Room")} {row.roomCode}
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {row.xp > 0 && (
                                  <span className="rounded-md border border-[#f6c945]/40 bg-[#281d08] px-2 py-0.5 text-[11px] text-[#f6c945]">
                                    {row.xp} XP
                                  </span>
                                )}
                                <span className="text-[#2fbf71]">
                                  {t("เรียนจบ", "Completed")} {row.doneCount}/
                                  {selectedCourseLessons.length} {t("บทเรียน", "lessons")} ({row.pct}%)
                                </span>
                              </div>
                            </div>

                            <div className="h-2 w-full overflow-hidden rounded-full border border-[#2f2d45] bg-[#141220]">
                              <div
                                className="h-full rounded-full bg-[#2fbf71]"
                                style={{ width: `${row.pct}%` }}
                              />
                            </div>

                            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 pt-1">
                              {/* คะแนน Block Model */}
                              <div className="rounded-lg border border-[#2f2d45] bg-[#141220] p-2.5 text-[11px] space-y-1">
                                <div className="flex items-center justify-between font-bold text-[#c4bdd6]">
                                  <span>{t("คะแนน Block Model เฉลี่ย", "Avg Block Model Score")}</span>
                                  <span className="text-[#f6c945]">
                                    {row.avgBlockScore !== null
                                      ? `${row.avgBlockScore}%`
                                      : t("ยังไม่มีคะแนน", "No score yet")}
                                  </span>
                                </div>
                                {row.weakestCellLabel ? (
                                  <div className="text-[#9a93ad]">
                                    {t("จุดควรทบทวน:", "Needs review:")}{" "}
                                    <span className="text-[#fca5a5] font-semibold">
                                      {row.weakestCellLabel} ({row.weakestCellScore}%)
                                    </span>
                                  </div>
                                ) : (
                                  <div className="text-[#9a93ad]">
                                    {t("รอผลการประเมินจากด่าน/แบบฝึกหัด", "Waiting for stage/exercise results")}
                                  </div>
                                )}
                              </div>

                              {/* ประวัติการอธิบายโค้ด */}
                              <div className="rounded-lg border border-[#2f2d45] bg-[#141220] p-2.5 text-[11px] space-y-1">
                                <div className="flex items-center justify-between font-bold text-[#c4bdd6]">
                                  <span>{t("ประวัติการอธิบายโค้ด", "Code Explanation History")}</span>
                                  <span className="text-[#86efac]">
                                    {row.explainCount} {t("ครั้ง", "times")}
                                  </span>
                                </div>
                                {row.recentExplanations.length > 0 ? (
                                  <div className="truncate text-[#9a93ad]">
                                    {t("ล่าสุด", "Latest")} ({row.recentExplanations[0].language}):{" "}
                                    {row.recentExplanations[0].summary}
                                  </div>
                                ) : (
                                  <div className="text-[#9a93ad]">
                                    {t("ยังไม่มีประวัติการอธิบายโค้ด", "No code explanation history yet")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                ) : null}

                {/* Sub-tab 3: ดันเจี้ยน & มอนสเตอร์ */}
                {activeTab === "dungeon" && (
                  <div className="space-y-6">
                    {/* Dungeon Summary Banner */}
                    <div className="rounded-2xl border-2 border-[#5c5470] bg-[#1c1b2b] p-5 text-[#f4efe6] space-y-3">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="pixel-font text-[10px] bg-[#5a2d91] text-[#ffe27a] px-2 py-0.5 rounded font-bold">
                              DUNGEON CONFIG
                            </span>
                            <span className="pixel-font text-[10px] text-[#ffe27a] bg-[#120f1c] px-2 py-0.5 rounded border border-[#4a4766]">
                              SEED #{(hashString(selectedCourse.id) >>> 0).toString(16).toUpperCase()}
                            </span>
                          </div>
                          <h3 className="text-lg font-black text-[#f6c945] mt-1">
                            {dungeonNameForCourse(selectedCourse.id)}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenDungeonModal(undefined, undefined, false)}
                            className="rounded-xl bg-[#2fbf71] px-3.5 py-2 text-xs font-black text-[#0b0b14] hover:bg-[#34d37d] cursor-pointer whitespace-nowrap"
                          >
                            {t("+ เพิ่มคำถามดันเจี้ยน", "+ Add Dungeon Question")}
                          </button>
                          <Link
                            href={`/dungeon/${selectedCourse.id}`}
                            target="_blank"
                            className="rounded-xl border border-[#9b5de5] bg-[#252238] px-3.5 py-2 text-xs font-bold text-[#ffe27a] hover:bg-[#322c4a] whitespace-nowrap"
                          >
                            {t("ทดลองเล่นดันเจี้ยน ↗", "Playtest Dungeon ↗")}
                          </Link>
                        </div>
                      </div>

                      <p className="text-xs text-[#9a93ad] leading-relaxed">
                        {t(
                          "แต่ละบทเรียนของคอร์สนี้จะสร้างเป็น 1 ห้องในดันเจี้ยน คุณสามารถเลือกมอนสเตอร์ประจำห้องและกำหนดคำถาม Block Model เพื่อให้ผู้เรียนได้ฝึกฝนทักษะการอ่านโค้ดในระหว่างการเดินสำรวจ",
                          "Each lesson in this course generates 1 dungeon room. Choose room monsters and configure Block Model questions for learners to practice code reading while exploring."
                        )}
                      </p>
                    </div>

                    {/* Floor by Floor Configuration */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-[#c4bdd6] uppercase tracking-wider">
                        {t(
                          `โครงสร้างชั้นดันเจี้ยนและมอนสเตอร์ประจำบทเรียน (${selectedCourseLessons.length} ชั้น)`,
                          `Dungeon Floors & Lesson Monsters (${selectedCourseLessons.length} floors)`
                        )}
                      </h4>

                      {selectedCourseLessons.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-[#3d395a] bg-[#1c1b2b] p-8 text-center text-xs text-[#9a93ad]">
                          {t(
                            "ยังไม่มีบทเรียนในคอร์สนี้ กรุณาเพิ่มบทเรียนในแท็บ “จัดการบทเรียน” ก่อนกำหนดคำถามดันเจี้ยน",
                            'No lessons in this course yet. Add lessons in the "Manage Lessons" tab before configuring dungeon questions.'
                          )}
                        </div>
                      ) : (
                        selectedCourseLessons.map((lesson, idx) => {
                          const isBossFloor = idx === selectedCourseLessons.length - 1;
                          const attachedQ =
                            dungeonQuestions.find((q) => q.lesson_id === lesson.id) ||
                            dungeonQuestions[idx] ||
                            null;

                          const monsterType: MonsterType =
                            attachedQ?.monster_type || (isBossFloor ? "boss" : "slime");
                          const monsterDef = getMonsterDef(monsterType);
                          const stat = attachedQ ? dungeonStats[attachedQ.id] : null;

                          return (
                            <div
                              key={lesson.id}
                              className={`rounded-2xl border p-4 sm:p-5 transition-all ${
                                isBossFloor
                                  ? "border-[#9b5de5] bg-[#252238]"
                                  : "border-[#2f2d45] bg-[#1c1b2b]"
                              }`}
                            >
                              <div className="flex flex-wrap items-start justify-between gap-4">
                                <div className="flex items-start gap-3.5 min-w-0 flex-1">
                                  {/* Monster Sprite Box */}
                                  <div className="p-2 rounded-xl bg-[#120f1c] border-2 border-[#4a4766] flex items-center justify-center shrink-0">
                                    <PixelSpriteView sprite={monsterDef.sprite} size={40} />
                                  </div>

                                  <div className="space-y-1 min-w-0 flex-1">
                                    <div className="flex flex-wrap items-center gap-2">
                                      <span
                                        className={`rounded-md px-2 py-0.5 text-[10px] font-black uppercase ${
                                          isBossFloor
                                            ? "bg-[#5a2d91] text-[#ffe27a]"
                                            : "bg-[#2fbf71] text-[#0b0b14]"
                                        }`}
                                      >
                                        {isBossFloor ? t("บอสใหญ่ชั้นสุดท้าย", "Final Floor Boss") : t(`ชั้นที่ ${idx + 1}`, `Floor ${idx + 1}`)}
                                      </span>
                                      <span className="text-xs font-bold text-[#f4efe6]">
                                        {lesson.title}
                                      </span>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-[#9a93ad]">
                                      <span>{t("มอนสเตอร์:", "Monster:")} <strong className="text-[#f6c945]">{monsterDef.name}</strong></span>
                                      <span>·</span>
                                      <span className="text-[#ff6b81] font-bold whitespace-nowrap shrink-0">HP {monsterDef.maxHp}</span>
                                    </div>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleOpenDungeonModal(attachedQ, lesson.id, isBossFloor)}
                                    className="rounded-xl border border-[#2fbf71]/50 bg-[#102a1e] px-3.5 py-1.5 text-xs font-bold text-[#86efac] hover:bg-[#1a3d2d] cursor-pointer whitespace-nowrap"
                                  >
                                    {attachedQ ? t("แก้ไขคำถาม", "Edit Question") : t("+ กำหนดคำถาม", "+ Set Question")}
                                  </button>
                                  {attachedQ && (
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteDungeonQuestion(attachedQ.id)}
                                      className="rounded-xl border border-[#c0283a]/50 bg-[#2d141c] px-3 py-1.5 text-xs font-bold text-[#fca5a5] hover:bg-[#3d1a24] cursor-pointer whitespace-nowrap"
                                    >
                                      {t("ลบ", "Delete")}
                                    </button>
                                  )}
                                </div>
                              </div>

                              {/* Question preview & Error Analytics */}
                              {attachedQ ? (
                                <div className="mt-4 pt-3.5 border-t border-[#2f2d45] space-y-2">
                                  <div className="text-xs text-[#f4efe6]">
                                    <strong className="text-[#f6c945]">{t("คำถาม:", "Question:")}</strong> {attachedQ.question}
                                  </div>

                                  {attachedQ.code_snippet && (
                                    <pre className="w-full max-w-full p-2.5 rounded-lg border border-[#2f2d45] bg-[#120f1c] text-[#ffe27a] font-mono text-[11px] overflow-x-auto">
                                      <code>{attachedQ.code_snippet}</code>
                                    </pre>
                                  )}

                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px]">
                                    {Array.isArray(attachedQ.choices) &&
                                      attachedQ.choices.map((c: string, cIdx: number) => (
                                        <div
                                          key={cIdx}
                                          className={`px-2.5 py-1 rounded-md border ${
                                            cIdx === attachedQ.correct_index
                                              ? "bg-[#102a1e] border-[#2fbf71]/60 text-[#86efac] font-bold"
                                              : "bg-[#141220] border-[#2f2d45] text-[#c4bdd6]"
                                          }`}
                                        >
                                          {cIdx + 1}. {c} {cIdx === attachedQ.correct_index && t("✓ (เฉลย)", "✓ (Answer)")}
                                        </div>
                                      ))}
                                  </div>

                                  {/* Error Analytics Display */}
                                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px]">
                                    <span className="text-[#9a93ad]">
                                      {t("คำอธิบาย:", "Explanation:")} {attachedQ.explanation}
                                    </span>

                                    {stat ? (
                                      <div
                                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1.5 ${
                                          stat.wrongPercent >= 50
                                            ? "bg-[#2d141c] text-[#fca5a5] border border-[#c0283a]/50"
                                            : "bg-[#102a1e] text-[#86efac] border border-[#2fbf71]/40"
                                        }`}
                                      >
                                        <span>{t(`สถิติ: ตอบแล้ว ${stat.totalAttempts} ครั้ง`, `Stats: ${stat.totalAttempts} attempts`)}</span>
                                        <span>({t(`ตอบผิด ${stat.wrongPercent}%`, `${stat.wrongPercent}% wrong`)})</span>
                                        {stat.wrongPercent >= 50 && (
                                          <span className="font-bold underline">{t("ตอบผิดบ่อย", "High Miss Rate")}</span>
                                        )}
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-[#9a93ad]">
                                        {t("ยังไม่มีประวัตินักเรียนตอบข้อนี้", "No student attempts yet")}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <p className="mt-3 pt-3 border-t border-[#2f2d45] text-xs text-[#9a93ad] italic">
                                  {t(
                                    "ยังไม่ได้กำหนดคำถามเฉพาะสำหรับชั้นนี้ (ระบบจะใช้คำถามมาตรฐานของคอร์ส)",
                                    "No custom question set for this floor (default course questions will be used)"
                                  )}
                                </p>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#3d395a] bg-[#141220] p-10 text-center text-xs text-[#9a93ad]">
                {t(
                  "เลือกคอร์สทางด้านซ้าย หรือสร้างคอร์สใหม่เพื่อเริ่มจัดการเนื้อหาบทเรียน",
                  "Select a course on the left or create a new course to manage lessons"
                )}
              </div>
            )}
          </div>
        </div>
        )}

        {/* Modal สร้าง/แก้ไขคอร์ส */}
        {editingCourse && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-xs">
            <form
              onSubmit={handleSaveCourse}
              className="my-auto w-full max-w-lg rounded-2xl border border-[#3d395a] bg-[#141220] p-6 text-[#f4efe6] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-[#f4efe6]">
                {editingCourse.id ? t("แก้ไขคอร์สเรียน", "Edit Course") : t("สร้างคอร์สเรียนใหม่", "Create New Course")}
              </h3>

              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("ชื่อคอร์สเรียน", "Course Title")}
                </label>
                <input
                  type="text"
                  required
                  value={editingCourse.title || ""}
                  onChange={(e) =>
                    setEditingCourse({ ...editingCourse, title: e.target.value })
                  }
                  placeholder={t("เช่น พื้นฐาน Python สำหรับการวิเคราะห์ข้อมูล", "e.g., Python Basics for Data Analysis")}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("คำอธิบายคอร์ส", "Course Description")}
                </label>
                <textarea
                  rows={3}
                  value={editingCourse.description || ""}
                  onChange={(e) =>
                    setEditingCourse({
                      ...editingCourse,
                      description: e.target.value,
                    })
                  }
                  placeholder={t("อธิบายสิ่งที่นักเรียนจะได้เรียนรู้ในคอร์สนี้...", "Describe what students will learn in this course...")}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("ระดับความยาก", "Difficulty Level")}
                  </label>
                  <select
                    value={editingCourse.level || "beginner"}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        level: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] focus:border-[#f6c945] focus:outline-hidden"
                  >
                    <option value="beginner">{t("เริ่มต้น (Beginner)", "Beginner")}</option>
                    <option value="intermediate">{t("กลาง (Intermediate)", "Intermediate")}</option>
                    <option value="advanced">{t("สูง (Advanced)", "Advanced")}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("รหัสเข้าร่วมคอร์ส (Join Code)", "Course Join Code")}
                  </label>
                  <input
                    type="text"
                    value={editingCourse.join_code || ""}
                    onChange={(e) =>
                      setEditingCourse({
                        ...editingCourse,
                        join_code: e.target.value.toUpperCase(),
                      })
                    }
                    placeholder={t("สุ่มอัตโนมัติหากเว้นว่าง", "Auto-generated if left blank")}
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 font-mono text-xs uppercase text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#c4bdd6]">
                  {t("รูปแบบการเข้าถึงคอร์สและบทเรียน", "Course & Lesson Access Mode")}
                </label>
                <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() =>
                      setEditingCourse({
                        ...editingCourse,
                        visibility: "public",
                        is_published: true,
                      })
                    }
                    className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      (
                        editingCourse.visibility !== undefined
                          ? editingCourse.visibility === "public"
                          : Boolean(editingCourse.is_published)
                      )
                        ? "border-[#2fbf71] bg-[#102a1e] ring-1 ring-[#2fbf71]"
                        : "border-[#3d395a] bg-[#1c1b2b] hover:border-[#4a4766]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#86efac]">
                        {t("🌐 แบบสาธารณะ (Public)", "🌐 Public")}
                      </span>
                      {(editingCourse.visibility !== undefined
                        ? editingCourse.visibility === "public"
                        : Boolean(editingCourse.is_published)) && (
                        <span className="text-[10px] font-black text-[#2fbf71]">
                          {t("✓ เลือกอยู่", "✓ Selected")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#c4bdd6] leading-relaxed">
                      {t(
                        "แสดงขึ้นในส่วนของดันเจี้ยนการเรียนรู้ทันที นักเรียนทุกคนเข้าเรียนและเล่นดันเจี้ยนได้เลย",
                        "Listed in Learning Dungeon immediately. Any student can enroll and play."
                      )}
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setEditingCourse({
                        ...editingCourse,
                        visibility: "private",
                        is_published: false,
                      })
                    }
                    className={`rounded-xl border p-3 text-left transition-all cursor-pointer ${
                      !(
                        editingCourse.visibility !== undefined
                          ? editingCourse.visibility === "public"
                          : Boolean(editingCourse.is_published)
                      )
                        ? "border-[#9b5de5] bg-[#25193b] ring-1 ring-[#9b5de5]"
                        : "border-[#3d395a] bg-[#1c1b2b] hover:border-[#4a4766]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-extrabold text-[#e9d5ff]">
                        {t("🔒 แบบส่วนตัว (Private)", "🔒 Private")}
                      </span>
                      {!(editingCourse.visibility !== undefined
                        ? editingCourse.visibility === "public"
                        : Boolean(editingCourse.is_published)) && (
                        <span className="text-[10px] font-black text-[#ffe27a]">
                          {t("✓ เลือกอยู่", "✓ Selected")}
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[11px] text-[#c4bdd6] leading-relaxed">
                      {t(
                        "ซ่อนจากหน้าดันเจี้ยนสาธารณะ นักเรียนต้องกรอกรหัสคอร์ส (Join Code) เพื่อเข้าเรียน",
                        "Hidden from public dungeon list. Students must enter the Join Code to enroll."
                      )}
                    </p>
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2f2d45]">
                <button
                  type="button"
                  onClick={() => setEditingCourse(null)}
                  className="rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2 text-xs font-bold text-[#f4efe6] hover:bg-[#252238] cursor-pointer"
                >
                  {t("ยกเลิก", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2fbf71] px-5 py-2 text-xs font-extrabold text-[#0b0b14] hover:bg-[#34d37d] cursor-pointer"
                >
                  {t("บันทึกคอร์ส", "Save Course")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal สร้าง/แก้ไขบทเรียน */}
        {editingLesson && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-xs">
            <form
              onSubmit={handleSaveLesson}
              className="my-auto w-full max-w-2xl rounded-2xl border border-[#3d395a] bg-[#141220] p-6 text-[#f4efe6] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <h3 className="text-lg font-bold text-[#f4efe6]">
                {editingLesson.id ? t("แก้ไขบทเรียน", "Edit Lesson") : t("เพิ่มบทเรียนใหม่", "Add New Lesson")}
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("ชื่อบทเรียน", "Lesson Title")}
                  </label>
                  <input
                    type="text"
                    required
                    value={editingLesson.title || ""}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        title: e.target.value,
                      })
                    }
                    placeholder={t("เช่น บทที่ 1: การทำงานของฟังก์ชัน", "e.g., Lesson 1: How Functions Work")}
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("ภาษาโปรแกรม", "Programming Language")}
                  </label>
                  <select
                    value={editingLesson.programming_language || "javascript"}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        programming_language: e.target.value,
                      })
                    }
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] focus:border-[#f6c945] focus:outline-hidden"
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="sql">SQL</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("เนื้อหาบทเรียน (Markdown)", "Lesson Content (Markdown)")}
                </label>
                <textarea
                  rows={4}
                  value={editingLesson.content_md || ""}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      content_md: e.target.value,
                    })
                  }
                  placeholder={t("เขียนเนื้อหาอธิบายบทเรียนที่นี่...", "Write lesson explanation here...")}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("ตัวอย่างโค้ดประกอบบทเรียน", "Lesson Code Example")}
                </label>
                <textarea
                  rows={4}
                  value={editingLesson.code_example || ""}
                  onChange={(e) =>
                    setEditingLesson({
                      ...editingLesson,
                      code_example: e.target.value,
                    })
                  }
                  placeholder={t("วางตัวอย่างโค้ดให้นักเรียนทดลองรัน...", "Paste example code for students to run...")}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#120f1c] p-3 font-mono text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("ลิงก์ภายนอก (External URL - ถ้ามี)", "External URL (optional)")}
                  </label>
                  <input
                    type="url"
                    value={editingLesson.external_url || ""}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        external_url: e.target.value,
                      })
                    }
                    placeholder="https://..."
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("ลิงก์วิดีโอ (Video URL - ถ้ามี)", "Video URL (optional)")}
                  </label>
                  <input
                    type="url"
                    value={editingLesson.video_url || ""}
                    onChange={(e) =>
                      setEditingLesson({
                        ...editingLesson,
                        video_url: e.target.value,
                      })
                    }
                    placeholder="https://youtube.com/..."
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Quiz Builder */}
              <div className="rounded-xl border border-[#2f2d45] bg-[#1c1b2b] p-4 space-y-3">
                <h4 className="text-xs font-bold text-[#f6c945]">
                  {t("คำถามแบบทดสอบท้ายบทเรียน", "End-of-Lesson Quiz Questions")} (
                  {editingLesson.quiz_questions?.length || 0} {t("ข้อ", "questions")})
                </h4>

                {(editingLesson.quiz_questions || []).map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="flex items-center justify-between rounded-lg border border-[#2f2d45] bg-[#141220] px-3 py-2 text-xs text-[#f4efe6]"
                  >
                    <span>
                      {idx + 1}. {q.question} ({t("ตัวเลือก:", "Choices:")} {q.options.join(" / ")})
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingLesson({
                          ...editingLesson,
                          quiz_questions: (
                            editingLesson.quiz_questions || []
                          ).filter((_, i) => i !== idx),
                        })
                      }
                      className="text-[#fca5a5] hover:text-[#ff6b81] font-bold ml-2 cursor-pointer shrink-0"
                    >
                      {t("ลบ", "Delete")}
                    </button>
                  </div>
                ))}

                <div className="space-y-2 pt-2 border-t border-[#2f2d45]">
                  {/* AI Question Generator Bar (Block Model + Misconception-Driven) */}
                  <div className="rounded-xl border border-[#9b5de5]/40 bg-[#141220] p-3 space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="text-[11px] font-bold text-[#c4b5fd]">
                        {t(
                          "✨ ให้ AI ช่วยสร้างคำถาม Quiz จากโค้ดบทเรียน (เจาะจุดอ่อน Block Model)",
                          "✨ AI Quiz Generator from Lesson Code (Targets Block Model Weaknesses)"
                        )}
                      </span>
                      <div className="flex flex-wrap items-center gap-2">
                        <select
                          value={aiTargetCellId}
                          onChange={(e) =>
                            setAiTargetCellId(e.target.value as BlockCellId | "auto")
                          }
                          aria-label={t("เลือกช่อง Block Model เป้าหมาย", "Select target Block Model cell")}
                          className="rounded-lg border border-[#3d395a] bg-[#1c1b2b] px-2.5 py-1 text-[11px] text-[#f4efe6] focus:border-[#9b5de5] focus:outline-hidden"
                        >
                          <option value="auto">
                            {t("อัตโนมัติ (อิงจุดอ่อนห้องเรียน)", "Auto (Based on class weakness)")}
                          </option>
                          {BLOCK_MODEL_CELLS.map((cell) => (
                            <option key={cell.id} value={cell.id}>
                              {cell.id} · {cell.shortTitle}
                            </option>
                          ))}
                        </select>
                        <button
                          type="button"
                          disabled={aiGenLoading}
                          onClick={() => void handleGenerateAiQuestion("lesson")}
                          className="rounded-lg bg-[#9b5de5] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#8b4cd6] disabled:opacity-60 cursor-pointer"
                        >
                          {aiGenLoading ? t("กำลังสร้างโจทย์...", "Generating...") : t("✨ สร้างคำถามด้วย AI", "✨ Generate with AI")}
                        </button>
                      </div>
                    </div>
                    {aiGenError && (
                      <p className="text-[11px] text-[#fca5a5]">{aiGenError}</p>
                    )}
                    {aiGenMeta && (
                      <div className="rounded-lg border border-[#2fbf71]/30 bg-[#102a1e]/60 px-2.5 py-1.5 text-[11px] text-[#cbd5e1] space-y-0.5">
                        <div className="font-bold text-[#86efac]">
                          {t("เป้าหมาย:", "Target:")} {aiGenMeta.targetCellLabel}
                          {aiGenMeta.targetedFromClassroomWeakness &&
                          aiGenMeta.weaknessAvgScore !== null
                            ? t(
                                ` (เลือกอัตโนมัติจากจุดอ่อนห้องเรียนเฉลี่ย ${aiGenMeta.weaknessAvgScore}%)`,
                                ` (Auto-selected from class weakness avg ${aiGenMeta.weaknessAvgScore}%)`
                              )
                            : ""}
                          {aiGenMeta.model ? ` · ${t("โมเดล", "Model")} ${aiGenMeta.model}` : ""}
                        </div>
                        {aiGenMeta.misconceptionReason && (
                          <div className="text-[#c4bdd6]">
                            {t("ตัวลวงดักความเข้าใจผิด:", "Misconception distractor:")} {aiGenMeta.misconceptionReason}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <input
                    type="text"
                    value={quizQuestionText}
                    onChange={(e) => setQuizQuestionText(e.target.value)}
                    placeholder={t("ตั้งโจทย์คำถามท้ายบท...", "Enter quiz question...")}
                    className="w-full rounded-lg border border-[#3d395a] bg-[#141220] px-3 py-1.5 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <input
                      type="text"
                      value={quizOptionsText}
                      onChange={(e) => setQuizOptionsText(e.target.value)}
                      placeholder={t("ตัวเลือกคั่นด้วยลูกน้ำ เช่น 10, 20, 30", "Comma-separated choices, e.g. 10, 20, 30")}
                      className="sm:col-span-2 rounded-lg border border-[#3d395a] bg-[#141220] px-3 py-1.5 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                    />
                    <input
                      type="number"
                      min={0}
                      max={5}
                      value={quizCorrectIdx}
                      onChange={(e) =>
                        setQuizCorrectIdx(Number(e.target.value))
                      }
                      placeholder={t("ลำดับข้อถูก (เริ่มที่ 0)", "Correct index (0-based)")}
                      className="rounded-lg border border-[#3d395a] bg-[#141220] px-3 py-1.5 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                    />
                  </div>
                  <input
                    type="text"
                    value={quizExplanation}
                    onChange={(e) => setQuizExplanation(e.target.value)}
                    placeholder={t("คำอธิบายเฉลยสั้นๆ (ไม่บังคับ)", "Short answer explanation (optional)")}
                    className="w-full rounded-lg border border-[#3d395a] bg-[#141220] px-3 py-1.5 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={handleAddQuizItem}
                    className="rounded-lg border border-[#2fbf71]/50 bg-[#102a1e] px-3 py-1.5 text-xs font-bold text-[#86efac] hover:bg-[#1a3d2d] cursor-pointer"
                  >
                    {t("+ เพิ่มคำถามเข้าบทเรียนนี้", "+ Add Question to Lesson")}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#2f2d45]">
                <button
                  type="button"
                  onClick={() => setEditingLesson(null)}
                  className="rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2 text-xs font-bold text-[#f4efe6] hover:bg-[#252238] cursor-pointer"
                >
                  {t("ยกเลิก", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2fbf71] px-5 py-2 text-xs font-extrabold text-[#0b0b14] hover:bg-[#34d37d] cursor-pointer"
                >
                  {t("บันทึกบทเรียน", "Save Lesson")}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modal เพิ่ม/แก้ไขคำถามดันเจี้ยนและมอนสเตอร์ */}
        {editingDungeonQuestion && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 overflow-y-auto backdrop-blur-xs">
            <form
              onSubmit={handleSaveDungeonQuestion}
              className="my-auto w-full max-w-xl rounded-2xl border border-[#3d395a] bg-[#141220] p-6 text-[#f4efe6] shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-[#2f2d45] pb-3">
                <h3 className="text-base sm:text-lg font-bold text-[#f6c945] flex items-center gap-2">
                  <span>{t("กำหนดคำถามและมอนสเตอร์ดันเจี้ยน", "Configure Dungeon Question & Monster")}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingDungeonQuestion(null)}
                  className="text-xs text-[#9a93ad] hover:text-[#f4efe6] font-bold cursor-pointer"
                >
                  {t("✕ ปิด", "✕ Close")}
                </button>
              </div>

              {/* Target Lesson & Monster Selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("บทเรียน / ชั้นที่ต้องการผูก", "Linked Lesson / Floor")}
                  </label>
                  <select
                    value={dqFormLessonId}
                    onChange={(e) => setDqFormLessonId(e.target.value)}
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] focus:border-[#f6c945] focus:outline-hidden"
                  >
                    <option value="">{t("คำถามทั่วไปประจำคอร์ส", "General Course Question")}</option>
                    {selectedCourseLessons.map((l, i) => (
                      <option key={l.id} value={l.id}>
                        {t("ชั้นที่", "Floor")} {i + 1}: {l.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("มอนสเตอร์ประจำห้อง", "Room Monster")}
                  </label>
                  <select
                    value={dqFormMonster}
                    onChange={(e) =>
                      setDqFormMonster(e.target.value as MonsterType)
                    }
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] focus:border-[#f6c945] focus:outline-hidden"
                  >
                    <option value="slime">{t("สไลม์โค้ด (HP 1 - พื้นฐาน)", "Code Slime (HP 1 - Basic)")}</option>
                    <option value="skeleton">
                      {t("โครงกระดูกโค้ดตกค้าง (HP 2 - ปานกลาง)", "Legacy Skeleton (HP 2 - Medium)")}
                    </option>
                    <option value="goblin">
                      {t("ก็อบลินลักบั๊ก (HP 2 - จับบั๊ก)", "Bug Goblin (HP 2 - Debugging)")}
                    </option>
                    <option value="boss">
                      {t("จอมมารลูปไม่สิ้นสุด (HP 3 - บอสใหญ่)", "Infinite Loop Demon Lord (HP 3 - Boss)")}
                    </option>
                  </select>
                </div>
              </div>

              {/* AI Question Generator Bar for Dungeon */}
              <div className="rounded-xl border border-[#9b5de5]/40 bg-[#1c1b2b] p-3 space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-[11px] font-bold text-[#c4b5fd]">
                    {t("✨ ให้ AI ช่วยสร้างคำถาม Dungeon จากโค้ดบทเรียน", "✨ AI Dungeon Question Generator from Lesson Code")}
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      value={aiTargetCellId}
                      onChange={(e) =>
                        setAiTargetCellId(e.target.value as BlockCellId | "auto")
                      }
                      aria-label={t("เลือกช่อง Block Model เป้าหมายสำหรับดันเจี้ยน", "Select target Block Model cell for dungeon")}
                      className="rounded-lg border border-[#3d395a] bg-[#141220] px-2.5 py-1 text-[11px] text-[#f4efe6] focus:border-[#9b5de5] focus:outline-hidden"
                    >
                      <option value="auto">
                        {t("อัตโนมัติ (อิงจุดอ่อนห้องเรียน)", "Auto (Based on class weakness)")}
                      </option>
                      {BLOCK_MODEL_CELLS.map((cell) => (
                        <option key={cell.id} value={cell.id}>
                          {cell.id} · {cell.shortTitle}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      disabled={aiGenLoading}
                      onClick={() => void handleGenerateAiQuestion("dungeon")}
                      className="rounded-lg bg-[#9b5de5] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#8b4cd6] disabled:opacity-60 cursor-pointer"
                    >
                      {aiGenLoading ? t("กำลังสร้างโจทย์...", "Generating...") : t("✨ สร้างโจทย์ดันเจี้ยนด้วย AI", "✨ Generate Dungeon Question")}
                    </button>
                  </div>
                </div>
                {aiGenError && (
                  <p className="text-[11px] text-[#fca5a5]">{aiGenError}</p>
                )}
                {aiGenMeta && (
                  <div className="rounded-lg border border-[#2fbf71]/30 bg-[#102a1e]/60 px-2.5 py-1.5 text-[11px] text-[#cbd5e1] space-y-0.5">
                    <div className="font-bold text-[#86efac]">
                      {t("เป้าหมาย:", "Target:")} {aiGenMeta.targetCellLabel}
                      {aiGenMeta.targetedFromClassroomWeakness &&
                      aiGenMeta.weaknessAvgScore !== null
                        ? t(
                            ` (เลือกอัตโนมัติจากจุดอ่อนห้องเรียนเฉลี่ย ${aiGenMeta.weaknessAvgScore}%)`,
                            ` (Auto-selected from class weakness avg ${aiGenMeta.weaknessAvgScore}%)`
                          )
                        : ""}
                      {aiGenMeta.model ? ` · ${t("โมเดล", "Model")} ${aiGenMeta.model}` : ""}
                    </div>
                    {aiGenMeta.misconceptionReason && (
                      <div className="text-[#c4bdd6]">
                        {t("ตัวลวงดักความเข้าใจผิด:", "Misconception distractor:")} {aiGenMeta.misconceptionReason}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("ข้อความคำถาม *", "Question Text *")}
                </label>
                <textarea
                  rows={2}
                  required
                  value={dqFormQuestion}
                  onChange={(e) => setDqFormQuestion(e.target.value)}
                  placeholder={t(
                    "เช่น โค้ดด้านล่างนี้ ค่าของตัวแปร x หลังจบลูปจะมีค่าเท่าใด?",
                    "e.g., What is the value of variable x after the loop finishes?"
                  )}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              {/* Code Snippet */}
              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("โค้ดโปรแกรมประกอบคำถาม (ถ้ามี)", "Code Snippet (optional)")}
                </label>
                <textarea
                  rows={3}
                  value={dqFormCode}
                  onChange={(e) => setDqFormCode(e.target.value)}
                  placeholder={"let x = 0;\nfor (let i = 1; i <= 3; i++) {\n  x += i;\n}"}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#120f1c] font-mono px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              {/* 4 Choices */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-[#c4bdd6]">
                  {t("ตัวเลือก 4 ตัวเลือก (ติ๊กวงกลมเพื่อระบุข้อที่ถูกต้อง) *", "4 Choices (select the radio button for the correct answer) *")}
                </label>
                {dqFormChoices.map((choice, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="correct_choice"
                      checked={dqFormCorrectIndex === idx}
                      onChange={() => setDqFormCorrectIndex(idx)}
                      className="accent-[#2fbf71] h-4 w-4"
                      id={`choice-${idx}`}
                    />
                    <label
                      htmlFor={`choice-${idx}`}
                      className="text-xs font-bold w-6 text-[#9a93ad]"
                    >
                      #{idx + 1}
                    </label>
                    <input
                      type="text"
                      required
                      value={choice}
                      onChange={(e) => {
                        const next = [...dqFormChoices];
                        next[idx] = e.target.value;
                        setDqFormChoices(next);
                      }}
                      placeholder={t(`ตัวเลือกที่ ${idx + 1}`, `Choice ${idx + 1}`)}
                      className="flex-1 rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-1.5 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                    />
                  </div>
                ))}
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                  {t("คำอธิบายเฉลยตาม Block Model / PRIMM", "Explanation (Block Model / PRIMM)")}
                </label>
                <textarea
                  rows={2}
                  value={dqFormExplanation}
                  onChange={(e) => setDqFormExplanation(e.target.value)}
                  placeholder={t(
                    "อธิบายเหตุผลว่าทำไมคำตอบนี้จึงถูกต้อง เพื่อให้นักเรียนเข้าใจเมื่อตอบคำถาม...",
                    "Explain why this answer is correct so students learn from their attempt..."
                  )}
                  className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3.5 py-2 text-xs text-[#f4efe6] placeholder:text-[#9a93ad]/60 focus:border-[#f6c945] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#c4bdd6] mb-1">
                    {t("ระดับความยาก", "Difficulty")}
                  </label>
                  <select
                    value={dqFormDifficulty}
                    onChange={(e) =>
                      setDqFormDifficulty(e.target.value as any)
                    }
                    className="w-full rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-3 py-2 text-xs text-[#f4efe6] focus:border-[#f6c945] focus:outline-hidden"
                  >
                    <option value="easy">{t("ง่าย (Easy) - 25 XP", "Easy - 25 XP")}</option>
                    <option value="medium">{t("ปานกลาง (Medium) - 40 XP", "Medium - 40 XP")}</option>
                    <option value="hard">{t("ยาก (Hard) - 60 XP", "Hard - 60 XP")}</option>
                  </select>
                </div>

                <div className="flex items-center sm:pt-5">
                  <label className="flex items-center gap-2 text-xs font-bold text-[#f4efe6] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dqFormIsBoss}
                      onChange={(e) => setDqFormIsBoss(e.target.checked)}
                      className="accent-[#9b5de5] h-4 w-4"
                    />
                    <span>{t("กำหนดให้เป็นห้องบอสท้ายคอร์ส", "Set as final boss room")}</span>
                  </label>
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex justify-end gap-2 pt-3 border-t border-[#2f2d45]">
                <button
                  type="button"
                  onClick={() => setEditingDungeonQuestion(null)}
                  className="rounded-xl border border-[#3d395a] bg-[#1c1b2b] px-4 py-2 text-xs font-bold text-[#f4efe6] hover:bg-[#252238] cursor-pointer"
                >
                  {t("ยกเลิก", "Cancel")}
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-[#2fbf71] px-5 py-2 text-xs font-extrabold text-[#0b0b14] hover:bg-[#34d37d] cursor-pointer"
                >
                  {t("บันทึกคำถามดันเจี้ยน", "Save Dungeon Question")}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
