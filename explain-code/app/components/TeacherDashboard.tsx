"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  ClassroomRecord,
  StudentRecord,
  BLOCK_MODEL_CELLS,
  BlockCellId,
  TOPICS,
  getMasteryStatus,
} from "../lib/curriculum";
import { copyTextToClipboard } from "../lib/clipboard";
import { Icon } from "./Icons";
import { BlockModelGrid } from "./BlockModelGrid";
import { useUiLanguage } from "./LanguageProvider";

export interface TeacherDashboardProps {
  teacherUsername: string;
  classrooms: ClassroomRecord[];
  students: StudentRecord[];
  onCreateClassroom: (
    roomName: string
  ) => ClassroomRecord | Promise<ClassroomRecord>;
  onUpdatePinnedReview: (
    roomCode: string,
    topicId: number | null,
    note: string
  ) => void | Promise<void>;
  onLogout: () => void;
  onSwitchToStudentView: () => void;
  cellAverages?: {
    classroom_id?: string;
    classroomId?: string;
    roomCode?: string;
    cell_id: string;
    avg_score: number;
    students_count: number;
  }[];
  questionStats?: {
    classroom_id?: string;
    classroomId?: string;
    roomCode?: string;
    question_id: string;
    cell_id: string;
    answers: number;
    wrong_percent: number;
  }[];
  isLoading?: boolean;
  onRefresh?: () => Promise<void> | void;
  embedded?: boolean;
}

export function TeacherDashboard({
  teacherUsername,
  classrooms,
  students,
  onCreateClassroom,
  onUpdatePinnedReview,
  onLogout,
  onSwitchToStudentView,
  cellAverages,
  questionStats,
  isLoading,
  onRefresh,
  embedded = false,
}: TeacherDashboardProps) {
  const { uiLang, t } = useUiLanguage();
  const [selectedRoomCode, setSelectedRoomCode] = useState<string>(
    classrooms[0]?.roomCode || "ABC123"
  );
  const [newRoomName, setNewRoomName] = useState<string>("");
  const [copiedCodeStatus, setCopiedCodeStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const [copiedSummaryStatus, setCopiedSummaryStatus] = useState<
    "idle" | "copied" | "failed"
  >("idle");
  const copyCodeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const copySummaryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyCodeTimerRef.current) clearTimeout(copyCodeTimerRef.current);
      if (copySummaryTimerRef.current) clearTimeout(copySummaryTimerRef.current);
    };
  }, []);
  const [inspectingStudent, setInspectingStudent] = useState<StudentRecord | null>(
    null
  );

  const currentRoom =
    classrooms.find((r) => r.roomCode === selectedRoomCode) || classrooms[0];
  const roomStudents = students.filter(
    (s) => s.roomCode === currentRoom?.roomCode
  );

  // สถานะสำหรับการปรับการสอน (ขั้นตอนที่ 7)
  const [reviewTopicId, setReviewTopicId] = useState<number>(
    currentRoom?.pinnedReviewTopicId || 4
  );
  const [reviewNote, setReviewNote] = useState<string>(
    currentRoom?.pinnedReviewNote ||
      t(
        "ให้ทบทวนช่อง Block Model ที่ค่าเฉลี่ยของห้องต่ำกว่า 50%",
        "Review Block Model cells where the class average is below 50%"
      )
  );
  const [savedReviewBanner, setSavedReviewBanner] = useState<boolean>(false);
  const [isCreatingRoom, setIsCreatingRoom] = useState<boolean>(false);
  const [isSavingReview, setIsSavingReview] = useState<boolean>(false);
  const [showFlowGuide, setShowFlowGuide] = useState<boolean>(!embedded);

  // ปิดหน้าต่างโปรไฟล์รายคนเมื่อกดปุ่ม Escape
  useEffect(() => {
    if (!inspectingStudent) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setInspectingStudent(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [inspectingStudent]);

  // ซิงค์เรื่องทบทวนและโน้ตเมื่อสลับห้องเรียน
  useEffect(() => {
    if (currentRoom) {
      setReviewTopicId(currentRoom.pinnedReviewTopicId || 4);
      setReviewNote(
        currentRoom.pinnedReviewNote ||
          t(
            "ให้ทบทวนช่อง Block Model ที่ค่าเฉลี่ยของห้องต่ำกว่า 50%",
            "Review Block Model cells where the class average is below 50%"
          )
      );
    }
  }, [
    currentRoom?.roomCode,
    currentRoom?.pinnedReviewTopicId,
    currentRoom?.pinnedReviewNote,
  ]);

  // คำนวณค่าเฉลี่ย 12 ช่องของทั้งห้อง (หากมี cellAverages จาก Supabase ให้ใช้ค่าเฉลี่ยจริงจากฐานข้อมูล)
  const avgCellScores: Record<BlockCellId, number> = {
    T1: 0,
    E1: 0,
    F1: 0,
    T2: 0,
    E2: 0,
    F2: 0,
    T3: 0,
    E3: 0,
    F3: 0,
    T4: 0,
    E4: 0,
    F4: 0,
  };

  const currentRoomCellAverages = (cellAverages || []).filter(
    (c) =>
      c.classroom_id === currentRoom?.roomCode ||
      c.classroomId === (currentRoom as any)?.id ||
      c.roomCode === currentRoom?.roomCode
  );

  BLOCK_MODEL_CELLS.forEach((cell) => {
    const viewStat = currentRoomCellAverages.find(
      (a) => a.cell_id === cell.id || (a as any).cellId === cell.id
    );
    if (viewStat) {
      avgCellScores[cell.id] = Math.round(Number(viewStat.avg_score));
    } else if (roomStudents.length === 0) {
      avgCellScores[cell.id] = 0;
    } else {
      const sum = roomStudents.reduce(
        (acc, st) => acc + (st.cellScores?.[cell.id] ?? 50),
        0
      );
      avgCellScores[cell.id] = Math.round(sum / roomStudents.length);
    }
  });

  const overallRoomAvg =
    roomStudents.length === 0
      ? 0
      : Math.round(
          Object.values(avgCellScores).reduce((a, b) => a + b, 0) / 12
        );

  const weakCells = BLOCK_MODEL_CELLS.filter(
    (c) => avgCellScores[c.id] < 55
  ).sort((a, b) => avgCellScores[a.id] - avgCellScores[b.id]);

  const strongCells = BLOCK_MODEL_CELLS.filter(
    (c) => avgCellScores[c.id] >= 80
  ).sort((a, b) => avgCellScores[b.id] - avgCellScores[a.id]);

  const handleCreateNewRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim() || isCreatingRoom) return;
    try {
      setIsCreatingRoom(true);
      const created = await onCreateClassroom(newRoomName.trim());
      if (created?.roomCode) {
        setSelectedRoomCode(created.roomCode);
      }
      setNewRoomName("");
    } catch (err) {
      console.error("Failed to create classroom:", err);
    } finally {
      setIsCreatingRoom(false);
    }
  };

  const handleCopyRoomCode = async () => {
    if (!currentRoom) return;
    const ok = await copyTextToClipboard(currentRoom.roomCode);
    if (copyCodeTimerRef.current) clearTimeout(copyCodeTimerRef.current);
    setCopiedCodeStatus(ok ? "copied" : "failed");
    copyCodeTimerRef.current = setTimeout(() => {
      setCopiedCodeStatus("idle");
    }, 2000);
  };

  const buildRoomSummaryText = () => {
    if (!currentRoom) return "";
    const weakList =
      weakCells.length > 0
        ? weakCells
            .map((c) => `${c.id} (${c.shortTitle}: ${avgCellScores[c.id]}%)`)
            .join(", ")
        : t("ไม่มีช่องที่ต่ำกว่าเกณฑ์", "No cells below threshold");
    const strongList =
      strongCells.length > 0
        ? strongCells
            .map((c) => `${c.id} (${c.shortTitle}: ${avgCellScores[c.id]}%)`)
            .join(", ")
        : "-";

    const studentLines = roomStudents
      .map((st) => {
        const stuAvg = Math.round(
          Object.values(st.cellScores).reduce((a, b) => a + b, 0) / 12
        );
        return t(
          `- ${st.nickname}: ผ่านแล้ว ${st.completedTopics.length}/7 เรื่อง | ความเข้าใจเฉลี่ย ${stuAvg}% | ${st.xp} XP`,
          `- ${st.nickname}: Completed ${st.completedTopics.length}/7 topics | Avg mastery ${stuAvg}% | ${st.xp} XP`
        );
      })
      .join("\n");

    return [
      t(
        `สรุปผลความเข้าใจการอ่านโค้ด (CODE COOL)`,
        `Code Comprehension Summary (CODE COOL)`
      ),
      t(
        `ห้องเรียน: ${currentRoom.roomName} (รหัสห้อง: ${currentRoom.roomCode})`,
        `Classroom: ${currentRoom.roomName} (Room Code: ${currentRoom.roomCode})`
      ),
      t(
        `จำนวนนักเรียน: ${roomStudents.length} คน | คะแนนความเข้าใจเฉลี่ยทั้งห้อง: ${overallRoomAvg}%`,
        `Students: ${roomStudents.length} | Class Average Mastery: ${overallRoomAvg}%`
      ),
      t(
        `ช่อง Block Model ที่ห้องเก่ง (80%+): ${strongList}`,
        `Strong Block Model Cells (80%+): ${strongList}`
      ),
      t(
        `ช่อง Block Model ที่ห้องควรทบทวน: ${weakList}`,
        `Block Model Cells to Review: ${weakList}`
      ),
      `${t("เรื่องที่ครูปักหมุดให้ทบทวน:", "Pinned Review Topic:")} ${
        TOPICS.find((topic) => topic.id === currentRoom.pinnedReviewTopicId)?.title ||
        t("ยังไม่ระบุ", "Not specified")
      }`,
      t(
        `รายชื่อนักเรียน (ชื่อเล่นสมมติ PDPA):`,
        `Student Roster (PDPA Pseudonyms):`
      ),
      studentLines,
    ].join("\n");
  };

  const handleCopySummary = async () => {
    const text = buildRoomSummaryText();
    const ok = await copyTextToClipboard(text);
    if (copySummaryTimerRef.current) clearTimeout(copySummaryTimerRef.current);
    setCopiedSummaryStatus(ok ? "copied" : "failed");
    copySummaryTimerRef.current = setTimeout(() => {
      setCopiedSummaryStatus("idle");
    }, 2500);
  };

  const handleSaveTeachingAdjustment = async () => {
    if (!currentRoom || isSavingReview) return;
    try {
      setIsSavingReview(true);
      await onUpdatePinnedReview(currentRoom.roomCode, reviewTopicId, reviewNote);
      setSavedReviewBanner(true);
      setTimeout(() => setSavedReviewBanner(false), 2500);
    } catch (err) {
      console.error("Failed to update pinned review:", err);
    } finally {
      setIsSavingReview(false);
    }
  };

  return (
    <div
      className={
        embedded
          ? "rounded-2xl border border-[#2f2d45] bg-[#141220]/90 text-[#f4efe6] flex flex-col overflow-hidden shadow-xl"
          : "min-h-screen bg-[#eef3f1] text-[#1b2a2f] flex flex-col"
      }
    >
      {/* แถบบนฝั่งครู */}
      {embedded ? (
        <div className="bg-[#1c1b2b] border-b border-[#2f2d45] px-4 sm:px-5 py-2.5 flex flex-wrap items-center justify-between gap-2 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs sm:text-sm font-extrabold text-[#f6c945]">
              {t("ห้องเรียน & Block Model 12 ช่อง", "Classrooms & 12-Cell Block Model")}
            </span>
            {isLoading && (
              <span className="px-2 py-0.5 rounded-full bg-[#281d08] border border-[#f6c945]/40 text-[#ffe27a] text-[11px] font-bold animate-pulse">
                {t("กำลังโหลด...", "Loading...")}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowFlowGuide((prev) => !prev)}
              className="rounded-xl border border-[#3d395a] bg-[#252238] hover:border-[#f6c945]/60 px-2.5 py-1.5 text-[11px] font-bold text-[#c4bdd6] cursor-pointer transition-colors"
            >
              {showFlowGuide ? t("ซ่อนคู่มือ", "Hide Guide") : t("? คู่มือ 7 ขั้นตอน", "? 7-Step Guide")}
            </button>
            {onRefresh && (
              <button
                type="button"
                onClick={() => void onRefresh()}
                disabled={isLoading}
                className="rounded-xl border border-[#3d395a] bg-[#252238] hover:border-[#f6c945]/60 px-3 py-1.5 text-[11px] font-extrabold text-[#f4efe6] flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition-colors"
              >
                <Icon name="chart" size={14} />
                <span>{t("รีเฟรช", "Refresh")}</span>
              </button>
            )}
          </div>
        </div>
      ) : (
        <header className="bg-white border-b-2 border-[#cfe0dc] sticky top-0 z-30 no-print">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="CODE COOL"
                width={32}
                height={32}
                className="h-8 w-8 rounded-lg object-contain border border-[#0f766e]/40 bg-[#0d0b14] shrink-0"
              />
              <span className="text-[20px] font-extrabold text-[#0b4f49]">
                {t("CODE COOL · ครู", "CODE COOL · Teacher")}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#e3f1ee] text-[#0b4f49] text-[13px] font-bold">
                {t("ผู้สอน:", "Teacher:")} {teacherUsername}
              </span>
            </div>

            <div className="flex items-center gap-2.5">
              {isLoading && (
                <span className="px-2.5 py-1 rounded-full bg-[#fbeacb] text-[#5c3704] text-[12px] font-bold animate-pulse">
                  {t("กำลังโหลดข้อมูล...", "Loading data...")}
                </span>
              )}
              {onRefresh && (
                <button
                  type="button"
                  onClick={() => void onRefresh()}
                  disabled={isLoading}
                  className="press-secondary px-3 py-1.5 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title={t("รีเฟรชข้อมูลจากฐานข้อมูล", "Refresh data from database")}
                >
                  <Icon name="chart" size={16} />
                  <span>{t("รีเฟรช", "Refresh")}</span>
                </button>
              )}
              <button
                type="button"
                onClick={onSwitchToStudentView}
                className="press-secondary px-3.5 py-2 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="user" size={18} />
                <span>{t("สลับไปดูหน้าฝั่งนักเรียน", "Switch to Student View")}</span>
              </button>
              <button
                type="button"
                onClick={onLogout}
                className="press-secondary px-3.5 py-2 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer"
              >
                <Icon name="logout" size={18} />
                <span>{t("ออกจากระบบ", "Logout")}</span>
              </button>
            </div>
          </div>
        </header>
      )}

      <main className={embedded ? "w-full px-3 sm:px-5 py-4 sm:py-5 flex flex-col gap-5" : "max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col gap-6"}>
        {/* แถบแสดงโฟลฝั่งครู 7 ขั้นตอน */}
        {showFlowGuide && (
        <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-4 no-print">
          <div className="text-[13px] font-extrabold text-[#0b4f49] mb-2">
            {t(
              "โฟลฝั่งครู · จากสร้างห้องจนนำข้อมูลไปปรับการสอน (แสดงเฉพาะชื่อเล่นสมมติและคะแนนตาม PDPA 2562)",
              "Teacher Workflow · From creating a room to adjusting instruction (only pseudonyms and scores shown per PDPA 2562)"
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-[12px]">
            {[
              { step: t("1 · เข้าสู่ระบบ", "1 · Sign In"), sub: t("บัญชีครู", "Teacher account"), active: false },
              { step: t("2 · สร้างห้อง", "2 · Create Room"), sub: t("ตั้งชื่อ ได้รหัสห้อง", "Name & get code"), active: false },
              { step: t("3 · แจกรหัสห้อง", "3 · Share Code"), sub: t("นักเรียนใช้ตอนสมัคร", "For student signup"), active: false },
              { step: t("4 · ภาพรวมห้อง", "4 · Class Overview"), sub: t("ใครทำถึงไหน คะแนนเฉลี่ย", "Progress & avg"), active: true },
              { step: t("5 · แผนที่ของห้อง", "5 · Class Grid"), sub: t("ช่อง Block Model ที่อ่อน", "Weak Block cells"), active: true },
              { step: t("6 · ดูรายคน", "6 · Student Detail"), sub: t("โปรไฟล์ ประวัติ ด้านเก่ง", "Profile & strengths"), active: true },
              { step: t("7 · ปรับการสอน", "7 · Adjust Teaching"), sub: t("เลือกเรื่องให้ทบทวน", "Pin review topic"), active: false },
            ].map((item) => (
              <div
                key={item.step}
                className={`p-2.5 rounded-xl border ${
                  item.active
                    ? "bg-[#d8efdc] border-[#86efac] text-[#14532d]"
                    : "bg-[#eef3f1] border-[#cfe0dc] text-[#1b2a2f]"
                }`}
              >
                <div className="font-extrabold">{item.step}</div>
                <div className="opacity-85 mt-0.5">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* ขั้นตอนที่ 2 & 3: เลือกห้อง / สร้างห้องใหม่ และแจกรหัสห้อง */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          <div className="lg:col-span-7 bg-white border-2 border-[#cfe0dc] rounded-2xl p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <span className="text-[12px] font-extrabold text-[#0f766e]">
                  {t("ห้องเรียนปัจจุบัน", "Current Classroom")}
                </span>
                <h2 className="text-[18px] sm:text-[20px] font-extrabold text-[#1b2a2f] mt-0.5">
                  {currentRoom?.roomName}
                </h2>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <label className="text-[13px] font-bold text-[#475b60]">
                  {t("เปลี่ยนห้อง:", "Switch Room:")}
                </label>
                <select
                  value={currentRoom?.roomCode || selectedRoomCode}
                  onChange={(e) => {
                    setSelectedRoomCode(e.target.value);
                    setInspectingStudent(null);
                  }}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl bg-[#eef3f1] border-2 border-[#b6c9c5] text-[14px] font-extrabold text-[#0b4f49]"
                >
                  {classrooms.map((c) => (
                    <option key={c.roomCode} value={c.roomCode}>
                      {c.roomName} ({c.roomCode})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#e3f1ee] border-2 border-[#0f766e] flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-[12px] font-bold text-[#0b4f49]">
                  {t("รหัสเข้าห้องเรียน", "Classroom Join Code")}
                </div>
                <div className="font-code text-[24px] sm:text-[26px] font-extrabold text-[#0b4f49] tracking-wider">
                  {currentRoom?.roomCode}
                </div>
              </div>
              <button
                type="button"
                onClick={() => void handleCopyRoomCode()}
                className="press-teal px-4 py-2.5 rounded-xl text-[13px] font-extrabold flex items-center gap-2 cursor-pointer no-print"
              >
                <Icon name="clipboard" size={16} />
                <span aria-live="polite">
                  {copiedCodeStatus === "copied"
                    ? t("คัดลอกแล้ว!", "Copied!")
                    : copiedCodeStatus === "failed"
                    ? t("คัดลอกไม่สำเร็จ", "Copy failed")
                    : t("คัดลอกรหัส", "Copy Code")}
                </span>
              </button>
            </div>
          </div>

          <form
            onSubmit={handleCreateNewRoom}
            className="lg:col-span-5 bg-white border-2 border-[#cfe0dc] rounded-2xl p-5 flex flex-col justify-between gap-3 no-print"
          >
            <div>
              <span className="text-[12px] font-extrabold text-[#0f766e]">
                {t("สร้างห้องเรียนใหม่", "Create New Classroom")}
              </span>
              <h3 className="text-[15px] font-extrabold text-[#1b2a2f] mt-0.5">
                {t("รับรหัสห้อง 6 หลักอัตโนมัติ", "Auto-generate a 6-character room code")}
              </h3>
            </div>

            <input
              type="text"
              value={newRoomName}
              onChange={(e) => setNewRoomName(e.target.value)}
              placeholder={t("เช่น ม.5/2 วิทยาการคำนวณ", "e.g., Grade 11/2 Computing Science")}
              className="w-full px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#b6c9c5] text-[15px] text-[#1b2a2f]"
            />

            <button
              type="submit"
              disabled={!newRoomName.trim() || isCreatingRoom}
              className="press-teal w-full py-2.5 rounded-xl text-[15px] font-extrabold disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
            >
              {isCreatingRoom ? (
                <span>{t("กำลังสร้างห้องเรียน...", "Creating classroom...")}</span>
              ) : (
                <span>{t("+ สร้างห้องเรียนและรับรหัสห้อง", "+ Create Classroom & Get Code")}</span>
              )}
            </button>
          </form>
        </div>

        {/* ขั้นตอนที่ 4: ภาพรวมห้อง (การ์ดตัวเลขสรุป) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#e3f1ee] text-[#0f766e] flex items-center justify-center">
              <Icon name="users" size={24} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#475b60]">
                {t("นักเรียนในห้องนี้", "Students in Room")}
              </div>
              <div className="text-[24px] font-extrabold text-[#1b2a2f]">
                {roomStudents.length} {t("คน", "students")}
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#d8efdc] text-[#14532d] flex items-center justify-center">
              <Icon name="chart" size={24} />
            </div>
            <div>
              <div className="text-[13px] font-bold text-[#475b60]">
                {t("คะแนนความเข้าใจเฉลี่ยทั้งห้อง", "Class Average Mastery")}
              </div>
              <div className="text-[24px] font-extrabold text-[#14532d]">
                {overallRoomAvg}% ({getMasteryStatus(overallRoomAvg, uiLang).shortLabel})
              </div>
            </div>
          </div>

          <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-4 flex items-center gap-3.5">
            <div className="w-12 h-12 shrink-0 rounded-2xl bg-[#f8d9d4] text-[#7d1d10] flex items-center justify-center">
              <Icon name="bulb" size={24} />
            </div>
            <div className="min-w-0">
              <div className="text-[13px] font-bold text-[#475b60]">
                {t("ช่อง Block Model ที่ห้องควรทบทวน", "Block Model Cells to Review")}
              </div>
              <div className="text-[15px] font-extrabold text-[#7d1d10] leading-snug mt-0.5">
                {weakCells.length > 0 ? (
                  <>
                    {weakCells
                      .slice(0, 3)
                      .map((c) => `${t("ช่อง", "Cell")} ${c.id} (${avgCellScores[c.id]}%)`)
                      .join(", ")}
                    {weakCells.length > 3
                      ? t(` และอีก ${weakCells.length - 3} ช่อง`, ` and ${weakCells.length - 3} more`)
                      : ""}
                  </>
                ) : (
                  <span className="text-[#14532d]">
                    {t("ผ่านเกณฑ์ทุกช่อง", "All cells on track")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ขั้นตอนที่ 5: แผนที่ Block Model เฉลี่ยทั้งห้อง + ส่งออกสรุป */}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-[20px] font-extrabold text-[#1b2a2f]">
              {t(
                `แผนที่ความเข้าใจ 12 ช่อง เฉลี่ยทั้งห้อง (${currentRoom?.roomName})`,
                `12-Cell Class Average Mastery Map (${currentRoom?.roomName})`
              )}
            </h2>
            <div className="flex items-center gap-2 no-print">
              <button
                type="button"
                onClick={() => void handleCopySummary()}
                className="press-teal px-4 py-2 rounded-xl text-[14px] font-extrabold flex items-center gap-2 cursor-pointer"
              >
                <Icon name="clipboard" size={18} />
                <span aria-live="polite">
                  {copiedSummaryStatus === "copied"
                    ? t("คัดลอกสรุปห้องเรียบร้อย!", "Class summary copied!")
                    : copiedSummaryStatus === "failed"
                    ? t("ไม่สามารถคัดลอกอัตโนมัติได้", "Could not copy automatically")
                    : t("คัดลอกสรุปห้องไปปรับการสอน", "Copy Class Summary")}
                </span>
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="press-secondary px-4 py-2 rounded-xl text-[14px] font-extrabold cursor-pointer"
              >
                {t("พิมพ์สรุปห้อง", "Print Summary")}
              </button>
            </div>
          </div>

          <BlockModelGrid
            cellScores={avgCellScores}
            title={t(
              `แผนที่ Block Model เฉลี่ยทั้งห้อง (${roomStudents.length} คน)`,
              `Class Average Block Model Grid (${roomStudents.length} students)`
            )}
            subtitle={t(
              "ช่วยให้ครูเห็นทันทีว่าทั้งห้องเข้าใจช่องไหนดีแล้ว และช่องไหนที่ห้องยังอ่อนเพื่อนำไปปรับการสอน",
              "Helps teachers quickly spot which cells the class has mastered and which need further instruction"
            )}
          />

          {/* สถิติข้อที่นักเรียนในห้องตอบผิดบ่อย (จาก classroom_question_stats view) */}
          {(() => {
            const currentRoomQuestionStats = (questionStats || []).filter(
              (q) =>
                q.classroom_id === currentRoom?.roomCode ||
                q.classroomId === (currentRoom as any)?.id ||
                q.roomCode === currentRoom?.roomCode
            );
            if (currentRoomQuestionStats.length === 0) return null;

            return (
              <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#f8d9d4] text-[#7d1d10] flex items-center justify-center font-bold">
                    <Icon name="bulb" size={20} />
                  </div>
                  <div>
                    <h4 className="text-[16px] font-extrabold text-[#1b2a2f]">
                      {t(
                        "สถิติข้อที่นักเรียนในห้องตอบผิดบ่อย (จาก classroom_question_stats)",
                        "Frequently Missed Questions (from classroom_question_stats)"
                      )}
                    </h4>
                    <p className="text-[13px] text-[#475b60]">
                      {t(
                        "วิเคราะห์จากประวัติการตอบคำถามจริงในห้องเพื่อนำไปเน้นย้ำในชั่วโมงสอน",
                        "Analyzed from actual class answer history to highlight during instruction"
                      )}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-1">
                  {currentRoomQuestionStats
                    .sort((a, b) => b.wrong_percent - a.wrong_percent)
                    .slice(0, 6)
                    .map((stat, idx) => (
                      <div
                        key={stat.question_id + idx}
                        className="p-3.5 rounded-xl bg-[#fef8f8] border border-[#fca5a5] flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded-md bg-[#7d1d10] text-white text-[11px] font-extrabold">
                              {t("ช่อง", "Cell")} {stat.cell_id}
                            </span>
                            <span className="font-code text-[12px] font-bold text-[#1b2a2f] truncate">
                              {t("ข้อ:", "Q:")} {stat.question_id}
                            </span>
                          </div>
                          <div className="text-[12px] text-[#475b60] mt-1">
                            {t(`ตอบทั้งหมด ${stat.answers} ครั้ง`, `${stat.answers} total answers`)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-[17px] font-extrabold text-[#7d1d10]">
                            {t("ผิด", "Wrong")} {Math.round(stat.wrong_percent)}%
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            );
          })()}
        </div>

        {/* ขั้นตอนที่ 6 & 4: ตารางภาพรวมว่าใครทำถึงไหน + ดูรายคน */}
        <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-5 flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-[18px] font-extrabold text-[#1b2a2f] flex items-center gap-2">
                <Icon name="users" size={20} className="text-[#0f766e]" />
                <span>{t("รายชื่อนักเรียนในห้อง & โปรไฟล์รายบุคคล", "Class Roster & Individual Profiles")}</span>
              </h3>
              <p className="text-[13px] font-semibold text-[#475b60]">
                {t(
                  "คลิกปุ่ม “ดูรายคน” เพื่อดูแผนที่ 12 ช่อง ประวัติการเล่น และด้านที่เก่งของนักเรียนแต่ละคน",
                  'Click "View Profile" to inspect each student\'s 12-cell map, activity history, and strengths'
                )}
              </p>
            </div>
          </div>

          {/* มือถือ: การ์ดรายคนอ่านง่าย ไม่บีบคอลัมน์ */}
          <div className="md:hidden flex flex-col gap-3">
            {roomStudents.map((stu) => {
              const stuAvg = Math.round(
                Object.values(stu.cellScores).reduce((a, b) => a + b, 0) / 12
              );
              const status = getMasteryStatus(stuAvg, uiLang);
              const sortedCells = [...BLOCK_MODEL_CELLS].sort(
                (a, b) => stu.cellScores[b.id] - stu.cellScores[a.id]
              );
              const topCell = sortedCells[0];
              const bottomCell = sortedCells[sortedCells.length - 1];

              return (
                <div
                  key={stu.id}
                  className="rounded-xl border border-[#2f2d45] bg-[#1c1b2b] p-3.5 flex flex-col gap-2.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-extrabold text-[#f4efe6] truncate">
                        {stu.nickname}
                      </span>
                      <span className="shrink-0 px-2 py-0.5 rounded-full bg-[#fff4d6] text-[#3d2603] text-[11px] font-bold whitespace-nowrap">
                        {stu.xp} XP
                      </span>
                    </div>
                    <span
                      className={`shrink-0 px-2.5 py-0.5 rounded-lg text-[12px] font-extrabold border whitespace-nowrap ${status.className}`}
                    >
                      {stuAvg}% · {status.shortLabel}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap">
                    {TOPICS.map((topic) => {
                      const done = stu.completedTopics.includes(topic.id);
                      return (
                        <span
                          key={topic.id}
                          className={`w-6 h-6 rounded-full text-[11px] font-extrabold flex items-center justify-center ${
                            done
                              ? topic.isBoss
                                ? "bg-[#6d3fc0] text-white"
                                : "bg-[#0f766e] text-white"
                              : "bg-[#252238] text-[#9a93ad]"
                          }`}
                        >
                          {topic.id}
                        </span>
                      );
                    })}
                    <span className="text-[11px] font-bold text-[#9a93ad] ml-1">
                      ({stu.completedTopics.length}/7 {t("เรื่อง", "topics")})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-1 text-[12px] font-bold">
                    <div className="text-[#86efac]">
                      {t("เก่ง:", "Strong:")} {t("ช่อง", "Cell")} {topCell.id} ({topCell.shortTitle} {stu.cellScores[topCell.id]}%)
                    </div>
                    <div className="text-[#fca5a5]">
                      {t("ทบทวน:", "Review:")} {t("ช่อง", "Cell")} {bottomCell.id} ({bottomCell.shortTitle} {stu.cellScores[bottomCell.id]}%)
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectingStudent(stu)}
                    className="w-full press-secondary px-3 py-2 rounded-xl text-[13px] font-extrabold inline-flex items-center justify-center gap-1.5 cursor-pointer no-print"
                  >
                    <Icon name="eye" size={16} />
                    <span>{t("ดูรายคน", "View Profile")}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {/* คอม/แท็บเล็ต: ตารางเต็มไม่บีบตัวอักษร */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full min-w-[780px] text-left border-collapse">
              <thead>
                <tr className="border-b-2 border-[#cfe0dc] text-[13px] font-extrabold text-[#0b4f49] bg-[#eef3f1]">
                  <th className="p-3 rounded-tl-xl whitespace-nowrap">{t("ชื่อเล่นสมมติ", "Pseudonym")}</th>
                  <th className="p-3 whitespace-nowrap">{t("ความคืบหน้า (7 เรื่อง)", "Progress (7 Topics)")}</th>
                  <th className="p-3 whitespace-nowrap">{t("คะแนนเฉลี่ย", "Avg Score")}</th>
                  <th className="p-3">{t("ด้านที่เก่ง", "Strength")}</th>
                  <th className="p-3">{t("ด้านที่ควรทบทวน", "Needs Review")}</th>
                  <th className="p-3 rounded-tr-xl text-right no-print whitespace-nowrap">{t("ดูรายคน", "Profile")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#cfe0dc] text-[14px]">
                {roomStudents.map((stu) => {
                  const stuAvg = Math.round(
                    Object.values(stu.cellScores).reduce((a, b) => a + b, 0) / 12
                  );
                  const status = getMasteryStatus(stuAvg, uiLang);
                  const sortedCells = [...BLOCK_MODEL_CELLS].sort(
                    (a, b) => stu.cellScores[b.id] - stu.cellScores[a.id]
                  );
                  const topCell = sortedCells[0];
                  const bottomCell = sortedCells[sortedCells.length - 1];

                  return (
                    <tr key={stu.id} className="hover:bg-[#eef3f1]/50">
                      <td className="p-3 font-extrabold text-[#1b2a2f] whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <span>{stu.nickname}</span>
                          <span className="px-2 py-0.5 rounded-full bg-[#fff4d6] text-[#3d2603] text-[12px] font-bold whitespace-nowrap">
                            {stu.xp} XP
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          {TOPICS.map((topic) => {
                            const done = stu.completedTopics.includes(topic.id);
                            return (
                              <span
                                key={topic.id}
                                title={topic.title}
                                className={`w-6 h-6 rounded-full text-[12px] font-extrabold flex items-center justify-center shrink-0 ${
                                  done
                                    ? topic.isBoss
                                      ? "bg-[#6d3fc0] text-white"
                                      : "bg-[#0f766e] text-white"
                                    : "bg-[#d8e3e0] text-[#475b60]"
                                }`}
                              >
                                {topic.id}
                              </span>
                            );
                          })}
                          <span className="text-[12px] font-bold text-[#475b60] ml-1">
                            ({stu.completedTopics.length}/7)
                          </span>
                        </div>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[13px] font-extrabold border whitespace-nowrap ${status.className}`}
                        >
                          {stuAvg}% · {status.shortLabel}
                        </span>
                      </td>
                      <td className="p-3 text-[13px] font-bold text-[#14532d]">
                        {t("ช่อง", "Cell")} {topCell.id} ({topCell.shortTitle} {stu.cellScores[topCell.id]}%)
                      </td>
                      <td className="p-3 text-[13px] font-bold text-[#7d1d10]">
                        {t("ช่อง", "Cell")} {bottomCell.id} ({bottomCell.shortTitle}{" "}
                        {stu.cellScores[bottomCell.id]}%)
                      </td>
                      <td className="p-3 text-right no-print whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setInspectingStudent(stu)}
                          className="press-secondary px-3 py-1.5 rounded-xl text-[13px] font-extrabold inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Icon name="eye" size={16} />
                          <span>{t("ดูรายคน", "View Profile")}</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Modal โปรไฟล์รายคนเมื่อคลิกดูรายคน */}
          {inspectingStudent && (() => {
            const stuSorted = [...BLOCK_MODEL_CELLS].sort(
              (a, b) =>
                (inspectingStudent.cellScores[b.id] ?? 0) -
                (inspectingStudent.cellScores[a.id] ?? 0)
            );
            const stuTop = stuSorted[0];
            const stuWeak = stuSorted[stuSorted.length - 1];
            const stuAvg = Math.round(
              Object.values(inspectingStudent.cellScores).reduce(
                (a, b) => a + b,
                0
              ) / 12
            );

            return (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-3 sm:p-6 no-print"
                onClick={() => setInspectingStudent(null)}
                role="dialog"
                aria-modal="true"
                aria-label={t(
                  `โปรไฟล์รายบุคคลของ ${inspectingStudent.nickname}`,
                  `Individual Profile of ${inspectingStudent.nickname}`
                )}
              >
                <div
                  className="w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-2xl bg-[#eef3f1] border-2 border-[#0f766e] p-4 sm:p-6 flex flex-col gap-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-[#cfe0dc] pb-3">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0b4f49] text-white text-[11px] font-extrabold">
                        {t("โปรไฟล์รายคน", "Individual Profile")}
                      </span>
                      <h4 className="text-[18px] sm:text-[20px] font-extrabold text-[#1b2a2f] mt-1.5">
                        {t("นักเรียน:", "Student:")} {inspectingStudent.nickname}
                      </h4>
                      <p className="text-[12px] sm:text-[13px] font-semibold text-[#475b60] mt-0.5">
                        {t(
                          `สะสม ${inspectingStudent.xp} XP · ผ่านแล้ว ${inspectingStudent.completedTopics.length}/7 เรื่อง · เฉลี่ย ${stuAvg}%`,
                          `Earned ${inspectingStudent.xp} XP · Completed ${inspectingStudent.completedTopics.length}/7 topics · Avg ${stuAvg}%`
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setInspectingStudent(null)}
                      className="press-secondary px-3 py-1.5 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer shrink-0"
                    >
                      <Icon name="close" size={16} />
                      <span>{t("ปิด", "Close")}</span>
                    </button>
                  </div>

                  {/* สรุปจุดแข็งและจุดที่ควรทบทวน */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[13px]">
                    <div className="rounded-xl bg-[#d8efdc] border border-[#0f766e]/30 px-3.5 py-2.5 font-bold text-[#14532d]">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="star" size={12} filled className="text-[#ffe27a]" />
                        <span>{t("ด้านที่เก่ง:", "Strength:")}</span>
                      </span>{" "}
                      {t("ช่อง", "Cell")} {stuTop.id} ({stuTop.shortTitle}{" "}
                      {inspectingStudent.cellScores[stuTop.id]}%)
                    </div>
                    <div className="rounded-xl bg-[#f8d9d4] border border-[#7d1d10]/30 px-3.5 py-2.5 font-bold text-[#7d1d10]">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="bulb" size={12} className="text-[#f6c945]" />
                        <span>{t("ควรทบทวน:", "Needs Review:")}</span>
                      </span>{" "}
                      {t("ช่อง", "Cell")} {stuWeak.id} ({stuWeak.shortTitle}{" "}
                      {inspectingStudent.cellScores[stuWeak.id]}%)
                    </div>
                  </div>

                  <BlockModelGrid
                    cellScores={inspectingStudent.cellScores}
                    title={t(
                      `แผนที่ Block Model 12 ช่องของ "${inspectingStudent.nickname}"`,
                      `12-Cell Block Model Map for "${inspectingStudent.nickname}"`
                    )}
                    subtitle={t(
                      "คะแนนความเข้าใจรายช่องจากประวัติการตอบคำถาม",
                      "Per-cell mastery scores from question attempt history"
                    )}
                    showLegend={false}
                  />
                </div>
              </div>
            );
          })()}
        </div>

        {/* ขั้นตอนที่ 7: ปรับการสอน (เลือกเรื่องให้ทบทวน) */}
        <div className="bg-white border-2 border-[#cfe0dc] rounded-2xl p-5 flex flex-col gap-4 no-print">
          <div>
            <span className="text-[13px] font-extrabold text-[#0f766e]">
              {t("ปักหมุดบทเรียนให้ทบทวนประจำห้อง", "Pin Classroom Review Lesson")}
            </span>
            <h3 className="text-[18px] font-extrabold text-[#1b2a2f] mt-0.5">
              {t(
                "เลือกเรื่องให้ทบทวนประจำห้อง (จะไปแสดงที่หน้าเส้นทางเควสต์ของนักเรียนในห้องทันที)",
                "Select a topic for class review (immediately shown on students' quest path)"
              )}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#0b4f49]">
                {t("เลือกเรื่องที่ต้องการให้นักเรียนทบทวน:", "Select topic for students to review:")}
              </label>
              <select
                value={reviewTopicId}
                onChange={(e) => setReviewTopicId(Number(e.target.value))}
                className="px-3.5 py-2.5 rounded-xl bg-[#eef3f1] border-2 border-[#b6c9c5] text-[14px] font-extrabold text-[#1b2a2f]"
              >
                {TOPICS.map((topic) => (
                  <option key={topic.id} value={topic.id}>
                    {topic.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-5 flex flex-col gap-1.5">
              <label className="text-[13px] font-bold text-[#0b4f49]">
                {t("ข้อความคำแนะนำจากครูถึงนักเรียนในห้อง:", "Teacher note to students:")}
              </label>
              <input
                type="text"
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                placeholder={t(
                  "เช่น ทบทวนเรื่องการส่งค่า return และเงื่อนไขลูป...",
                  "e.g., Review return values and loop conditions..."
                )}
                className="px-3.5 py-2.5 rounded-xl bg-white border-2 border-[#b6c9c5] text-[14px] text-[#1b2a2f]"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="button"
                onClick={handleSaveTeachingAdjustment}
                disabled={isSavingReview}
                className="press-teal w-full py-2.5 rounded-xl text-[14px] font-extrabold cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSavingReview ? t("กำลังบันทึก...", "Saving...") : t("บันทึกการสอน", "Save Review")}
              </button>
            </div>
          </div>

          {savedReviewBanner && (
            <div className="p-3 rounded-xl bg-[#d8efdc] border border-[#86efac] text-[#14532d] text-[14px] font-extrabold flex items-center gap-2">
              <Icon name="check" size={18} />
              <span>
                {t(
                  `อัปเดตเรื่องให้ทบทวนไปยังห้อง ${currentRoom?.roomName} เรียบร้อยแล้ว!`,
                  `Updated review topic for ${currentRoom?.roomName}!`
                )}
              </span>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
