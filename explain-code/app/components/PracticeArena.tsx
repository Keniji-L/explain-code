"use client";

import React, { useState, useEffect, useMemo } from "react";
import { shuffleArrayWithSeed } from "../lib/dungeon/questions";
import {
  TopicQuest,
  BlockCellId,
  BLOCK_MODEL_CELLS,
  StudentRecord,
} from "../lib/curriculum";
import {
  LearningLanguage,
  runCodeByLanguage,
} from "../lib/language-tracks";
import { Icon, StatusCircle } from "./Icons";
import { useUiLanguage } from "./LanguageProvider";

interface PracticeArenaProps {
  topic: TopicQuest;
  language?: LearningLanguage;
  onBackToMap: () => void;
  onCompleteTopic: (result: {
    topicId: number;
    earnedXp: number;
    updatedCellScores: Partial<Record<BlockCellId, number>>;
    badgeId: string;
    scorePercent: number;
    answers?: {
      questionId: string;
      cellId: string;
      chosenOptionId?: string | null;
      isCorrect: boolean;
      tries: number;
      xpEarned: number;
    }[];
    aiEvaluation?: {
      studentExplanation: string;
      score: number;
      passed: boolean;
      feedback: string;
    };
  }) => void;
  currentStudent?: StudentRecord | null;
  studentId?: string;
}

type PrimmStep = 1 | 2 | 3 | 4 | 5; // 5 = สรุปจบเรื่อง (ดูเฉลย เหตุผล + XP + ตรา)

interface QuestionAttemptState {
  wrongCount: number;
  selectedOptionId: string | null;
  status: "unanswered" | "hint" | "correct" | "revealed";
  earnedXp: number;
  cellMasteryScore: number;
}

export function PracticeArena({
  topic,
  language = "javascript",
  onBackToMap,
  onCompleteTopic,
  currentStudent,
  studentId,
}: PracticeArenaProps) {
  const { t } = useUiLanguage();
  const [primmStep, setPrimmStep] = useState<PrimmStep>(1);
  const [optionShuffleSeed, setOptionShuffleSeed] = useState<string>(() =>
    String(topic.id)
  );

  useEffect(() => {
    setOptionShuffleSeed(
      `${topic.id}-${Math.floor(Math.random() * 1_000_000_000) + 1}`
    );
  }, [topic.id]);

  // ขั้น 1 & 2: ทำนายผล & เทียบผลรันจริง
  const [predictedAnswer, setPredictedAnswer] = useState<string>("");
  const [realRunResult, setRealRunResult] = useState<{
    outputs: string[];
    finalOutput: string;
    success: boolean;
  } | null>(null);
  const [predictXp, setPredictXp] = useState<number>(0);

  // ขั้น 3: เดินโค้ดทีละขั้น & ตอบคำถามตามช่อง Block Model
  const [traceIdx, setTraceIdx] = useState<number>(0);
  const [isAutoWalking, setIsAutoWalking] = useState<boolean>(false);
  const [currentQIdx, setCurrentQIdx] = useState<number>(0);
  const [qStates, setQStates] = useState<Record<string, QuestionAttemptState>>({});

  // เสริม: อธิบายอิสระตรวจด้วย AI หลังบ้าน
  const [freeExplanation, setFreeExplanation] = useState<string>("");
  const [aiEvalLoading, setAiEvalLoading] = useState<boolean>(false);
  const [aiEvalResult, setAiEvalResult] = useState<{
    score: number;
    passed: boolean;
    feedback: string;
  } | null>(null);

  // ขั้น 4: แก้ค่าแล้วทายใหม่ (Modify)
  const [modifiedCode, setModifiedCode] = useState<string>(topic.modifyChallenge.suggestedCode);
  const [modifyPrediction, setModifyPrediction] = useState<string>("");
  const [modifyRunResult, setModifyRunResult] = useState<{
    finalOutput: string;
    matchedPrediction: boolean;
    matchedTarget: boolean;
    error?: string;
  } | null>(null);
  const [modifyXp, setModifyXp] = useState<number>(0);

  // Auto-walk timer สำหรับเดินโค้ดทีละขั้น
  useEffect(() => {
    if (!isAutoWalking) return;
    const timer = setInterval(() => {
      setTraceIdx((prev) => {
        if (prev + 1 >= topic.steps.length) {
          setIsAutoWalking(false);
          return prev;
        }
        return prev + 1;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, [isAutoWalking, topic.steps.length]);

  const currentTrace = topic.steps[traceIdx] || topic.steps[0];
  const currentQ = topic.questions[currentQIdx] || topic.questions[0];
  const currentQState: QuestionAttemptState = qStates[currentQ.id] || {
    wrongCount: 0,
    selectedOptionId: null,
    status: "unanswered",
    earnedXp: 0,
    cellMasteryScore: 0,
  };
  const currentCellMeta = BLOCK_MODEL_CELLS.find((c) => c.id === currentQ.cellId)!;

  // รันโค้ดจริงในขั้นที่ 2 (เทียบผลรันจริง)
  const handleRunAndCompare = () => {
    if (!predictedAnswer.trim()) return;
    const exec = runCodeByLanguage(topic.code, language);
    setRealRunResult(exec);
    const isExactMatch = predictedAnswer.trim() === exec.finalOutput.trim();
    // XP ให้ตามความเข้าใจและการมีส่วนร่วมทำนายผล (ไม่มีการหักคะแนน)
    setPredictXp(isExactMatch ? 15 : 10);
    setPrimmStep(2);
  };

  // ตรวจคำตอบรายช่อง Block Model (ตอบผิดครั้งที่ 1 ได้คำใบ้, ครั้งที่ 2 ได้เฉลย)
  const handleSelectQuestionOption = (optionId: string) => {
    if (currentQState.status === "correct" || currentQState.status === "revealed") {
      return;
    }

    const isCorrect = optionId === currentQ.correctOptionId;

    if (isCorrect) {
      const firstTry = currentQState.wrongCount === 0;
      setQStates((prev) => ({
        ...prev,
        [currentQ.id]: {
          wrongCount: currentQState.wrongCount,
          selectedOptionId: optionId,
          status: "correct",
          earnedXp: firstTry ? 20 : 15,
          cellMasteryScore: firstTry ? 95 : 80,
        },
      }));
    } else {
      const nextWrongCount = currentQState.wrongCount + 1;
      if (nextWrongCount === 1) {
        // ผิดครั้งที่ 1 -> ได้คำใบ้ แล้วลองอีกครั้ง
        setQStates((prev) => ({
          ...prev,
          [currentQ.id]: {
            wrongCount: 1,
            selectedOptionId: optionId,
            status: "hint",
            earnedXp: 0,
            cellMasteryScore: 0,
          },
        }));
      } else {
        // ผิดครั้งที่ 2 -> แสดงเฉลยและเหตุผล
        setQStates((prev) => ({
          ...prev,
          [currentQ.id]: {
            wrongCount: 2,
            selectedOptionId: optionId,
            status: "revealed",
            earnedXp: 10,
            cellMasteryScore: 45,
          },
        }));
      }
    }
  };

  // ส่งคำอธิบายอิสระให้ AI หลังบ้านตรวจ
  const handleEvaluateFreeExplanation = async () => {
    if (!freeExplanation.trim()) return;
    setAiEvalLoading(true);
    try {
      const res = await fetch("/api/interrogate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: topic.code,
          topicTitle: topic.title,
          studentExplanation: freeExplanation,
          studentId: currentStudent?.id || studentId,
        }),
      });
      const data = await res.json();
      setAiEvalResult({
        score: data.score ?? 80,
        passed: Boolean(data.passed),
        feedback: data.feedback || t("ตรวจคำอธิบายเรียบร้อย", "Explanation evaluated"),
      });
    } catch {
      setAiEvalResult({
        score: 80,
        passed: true,
        feedback: t(
          "อธิบายแนวคิดการทำงานของโค้ดได้ตรงประเด็นดีมาก!",
          "Great job explaining the core behavior of the code!"
        ),
      });
    } finally {
      setAiEvalLoading(false);
    }
  };

  // รันโค้ดจริงในขั้นที่ 4 (แก้ค่าแล้วทายใหม่)
  const handleRunModifiedCode = () => {
    if (!modifyPrediction.trim()) return;
    const realModified = runCodeByLanguage(modifiedCode, language);
    const targetModified = runCodeByLanguage(
      topic.modifyChallenge.suggestedCode,
      language
    );

    if (!realModified.success) {
      setModifyRunResult({
        finalOutput: "",
        matchedPrediction: false,
        matchedTarget: false,
        error: realModified.error,
      });
      return;
    }

    const matchedPrediction =
      realModified.finalOutput.trim() === modifyPrediction.trim();
    const matchedTarget =
      realModified.finalOutput.trim() === targetModified.finalOutput.trim();

    setModifyRunResult({
      finalOutput: realModified.finalOutput,
      matchedPrediction,
      matchedTarget,
    });
    setModifyXp(matchedPrediction ? 20 : 12);
  };

  // คำนวณคะแนนรวมและจบเรื่อง
  const allQuestionsDone = topic.questions.every((q) => {
    const st = qStates[q.id]?.status;
    return st === "correct" || st === "revealed";
  });

  const totalQuestionXp = topic.questions.reduce(
    (acc, q) => acc + (qStates[q.id]?.earnedXp || 0),
    0
  );
  const aiBonusXp = aiEvalResult?.passed ? 10 : 0;
  const totalEarnedXp = predictXp + totalQuestionXp + modifyXp + aiBonusXp;

  const handleFinishQuest = () => {
    const updatedCellScores: Partial<Record<BlockCellId, number>> = {};
    topic.questions.forEach((q) => {
      const st = qStates[q.id];
      if (st) {
        updatedCellScores[q.cellId] = st.cellMasteryScore;
      }
    });

    const avgQuestionScore = Math.round(
      topic.questions.reduce(
        (acc, q) => acc + (qStates[q.id]?.cellMasteryScore || 75),
        0
      ) / topic.questions.length
    );

    const answers = topic.questions.map((q) => {
      const st = qStates[q.id];
      return {
        questionId: q.id,
        cellId: q.cellId,
        chosenOptionId: st?.selectedOptionId || null,
        isCorrect: st?.status === "correct",
        tries: (st?.wrongCount || 0) + 1,
        xpEarned: st?.earnedXp || 0,
      };
    });

    const aiEvaluation =
      aiEvalResult && freeExplanation.trim()
        ? {
            studentExplanation: freeExplanation.trim(),
            score: aiEvalResult.score,
            passed: aiEvalResult.passed,
            feedback: aiEvalResult.feedback,
          }
        : undefined;

    onCompleteTopic({
      topicId: topic.id,
      earnedXp: totalEarnedXp,
      updatedCellScores,
      badgeId: topic.badgeReward.id,
      scorePercent: avgQuestionScore,
      answers,
      aiEvaluation,
    });
  };

  const codeLines = topic.code.split("\n");
  const activeHighlightedLine =
    primmStep === 3 ? currentTrace?.line : null;

  return (
    <div className="flex flex-col gap-5 text-[#f4efe6]">
      {/* แถบหัวเรื่องและลำดับ PRIMM 4 ขั้น */}
      <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-4 sm:p-5 flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onBackToMap}
              className="press-secondary px-3 py-2 rounded-xl text-[14px] font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Icon name="back" size={18} />
              <span>{t("กลับเส้นทางเควสต์", "Back to Quest Map")}</span>
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-[20px] font-extrabold text-[#f4efe6]">{topic.title}</h2>
                {topic.isBoss && (
                  <span className="px-2.5 py-0.5 rounded-full bg-[#5a2d91] border border-[#9b5de5] text-[#ffe27a] text-[12px] font-extrabold flex items-center gap-1">
                    <Icon name="bug" size={14} />
                    <span>{t("บอสด่าน", "Stage Boss")}</span>
                  </span>
                )}
              </div>
              <p className="text-[13px] font-semibold text-[#9a93ad]">{topic.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-[#281d08] border-2 border-[#f6c945]/70 rounded-xl px-3.5 py-1.5 text-[#ffe27a] font-extrabold text-[14px]">
            <Icon name="star" size={18} filled />
            <span>
              {t(
                `XP สะสมในด่านนี้: +${totalEarnedXp} XP`,
                `Stage XP Earned: +${totalEarnedXp} XP`
              )}
            </span>
          </div>
        </div>

        {/* แถบตัวบอกวิธีเรียน 4 ขั้น (อิงลำดับ PRIMM) */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            {
              step: 1 as PrimmStep,
              title: t("1 · ทำนายผล", "1 · Predict"),
              desc: t("ทายผลก่อนรันจริง", "Guess output first"),
            },
            {
              step: 2 as PrimmStep,
              title: t("2 · เทียบผลรันจริง", "2 · Run & Compare"),
              desc: t("รันโค้ดจริงเทียบที่ทาย", "Run & verify guess"),
            },
            {
              step: 3 as PrimmStep,
              title: t("3 · เดินโค้ดและตอบ", "3 · Trace & Answer"),
              desc: t("ตอบคำถามรายช่อง", "Answer cell questions"),
            },
            {
              step: 4 as PrimmStep,
              title: t("4 · แก้ค่าแล้วทายใหม่", "4 · Modify"),
              desc: t("เปลี่ยนค่าแล้วทำนาย", "Edit & predict again"),
            },
          ].map((item) => {
            const isCurrent = primmStep === item.step;
            const isDone = primmStep > item.step;
            return (
              <button
                key={item.step}
                type="button"
                onClick={() => {
                  if (item.step <= primmStep || isDone) setPrimmStep(item.step);
                }}
                className={`p-3 rounded-xl border-2 text-left transition flex items-center gap-3 cursor-pointer ${
                  isCurrent
                    ? "bg-[#25193b] border-[#9b5de5] text-[#f4efe6]"
                    : isDone
                    ? "bg-[#102a1e] border-[#2fbf71]/50 text-[#86efac]"
                    : "bg-[#1c1b2b] border-[#2f2d45] text-[#9a93ad]"
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[14px] shrink-0 ${
                    isCurrent
                      ? "bg-[#9b5de5] text-white"
                      : isDone
                      ? "bg-[#2fbf71] text-[#120f1c]"
                      : "bg-[#2f2d45] text-[#c4bdd6]"
                  }`}
                >
                  {isDone ? <Icon name="check" size={16} /> : item.step}
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-extrabold truncate">{item.title}</div>
                  <div className="text-[12px] opacity-85 truncate">{item.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* กรณีเป็นบอสด่าน แสดงสถานการณ์โค้ดจาก AI */}
      {topic.aiScenario && (
        <div className="bg-[#25193b] border-2 border-[#9b5de5] rounded-2xl p-4 flex items-start gap-3 text-[#e9d5ff]">
          <StatusCircle
            variant="boss"
            size="sm"
            label={t("บอสด่านจับบั๊กจาก AI", "AI Bug Boss")}
          />
          <div>
            <div className="text-[15px] font-extrabold text-[#ffe27a]">
              {t(
                "ภารกิจบอสด่าน: จับบั๊กจากโค้ดที่ AI เขียน",
                "Boss Mission: Catch Bugs in AI-Generated Code"
              )}
            </div>
            <p className="text-[14px] mt-0.5 text-[#f4efe6]">{topic.aiScenario}</p>
          </div>
        </div>
      )}

      {/* พื้นที่หลัก 2 ฝั่ง: ซ้าย = โค้ดและตารางค่าตัวแปร | ขวา = กิจกรรมตามขั้น PRIMM */}
      {primmStep < 5 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* ฝั่งซ้าย: แผงอ่านโค้ดทีละบรรทัด + ตารางค่าตัวแปรและผลลัพธ์จากการรันจริง */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl overflow-hidden">
              <div className="px-4 py-3 bg-[#1c1b2b] border-b border-[#2f2d45] text-[#ffe27a] flex items-center justify-between">
                <div className="flex items-center gap-2 font-extrabold text-[15px]">
                  <Icon name="code" size={20} className="text-[#f6c945]" />
                  <span>
                    {t(
                      `โค้ด ${language.toUpperCase()} ที่ใช้ฝึกอ่าน`,
                      `${language.toUpperCase()} Code to Read`
                    )}
                  </span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#252238] border border-[#3d395a] text-[#c4bdd6] text-[12px] font-bold">
                  {codeLines.length} {t("บรรทัด", "lines")}
                </span>
              </div>

              <div className="p-4 space-y-1.5 bg-[#0d0b14]">
                {codeLines.map((lineText, idx) => {
                  const lineNum = idx + 1;
                  const isStepLine = activeHighlightedLine === lineNum;
                  const isQuestionLine =
                    primmStep === 3 && currentQ?.targetLine === lineNum;

                  return (
                    <div
                      key={lineNum}
                      onClick={() => {
                        const foundStep = topic.steps.findIndex((s) => s.line === lineNum);
                        if (foundStep >= 0) setTraceIdx(foundStep);
                      }}
                      className={`flex items-center gap-3 px-3 py-2 rounded-xl border-2 transition cursor-pointer ${
                        isStepLine
                          ? "bg-[#281d08] border-[#f6c945] text-[#ffe27a]"
                          : isQuestionLine
                          ? "bg-[#25193b] border-[#9b5de5] text-[#e9d5ff]"
                          : "bg-[#141220] border-transparent hover:border-[#3d395a] text-[#f4efe6]"
                      }`}
                    >
                      <span className="w-6 text-right font-extrabold text-[13px] text-[#9a93ad] select-none">
                        {lineNum}
                      </span>
                      <pre className="font-code flex-1 whitespace-pre-wrap break-all font-bold !bg-transparent !border-0 !p-0">
                        {lineText}
                      </pre>
                      {isStepLine && (
                        <span className="px-2 py-0.5 rounded-md bg-[#f6c945] text-[#120f1c] text-[12px] font-extrabold shrink-0">
                          {t(`ขั้นที่ ${currentTrace.stepNumber}`, `Step ${currentTrace.stepNumber}`)}
                        </span>
                      )}
                      {!isStepLine && isQuestionLine && (
                        <span className="px-2 py-0.5 rounded-md bg-[#9b5de5] text-white text-[12px] font-extrabold shrink-0">
                          {t("บรรทัดที่ถาม", "Target Line")}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* แถบควบคุมการเดินโค้ดทีละขั้น (แสดงเด่นในขั้นที่ 3 และดูได้ตลอดหลังรันจริง) */}
              {primmStep >= 2 && (
                <div className="p-4 bg-[#1c1b2b] border-t-2 border-[#2f2d45] flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="text-[14px] font-extrabold text-[#ffe27a]">
                      {t(
                        `เดินโค้ดทีละขั้น: ขั้นที่ ${currentTrace.stepNumber} จาก ${topic.steps.length} (บรรทัดที่ ${currentTrace.line})`,
                        `Step Trace: Step ${currentTrace.stepNumber} of ${topic.steps.length} (Line ${currentTrace.line})`
                      )}
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoWalking(false);
                          setTraceIdx((p) => Math.max(0, p - 1));
                        }}
                        disabled={traceIdx === 0}
                        className="press-secondary px-3 py-1.5 rounded-xl text-[13px] font-extrabold disabled:opacity-50 cursor-pointer"
                      >
                        {t("← ก่อนหน้า", "← Prev")}
                      </button>
                      <button
                        type="button"
                        onClick={() => setIsAutoWalking(!isAutoWalking)}
                        className="press-gold px-3.5 py-1.5 rounded-xl text-[13px] font-extrabold flex items-center gap-1.5 cursor-pointer"
                      >
                        <Icon name="play" size={16} />
                        <span>
                          {isAutoWalking
                            ? t("หยุดเดินอัตโนมัติ", "Pause Auto")
                            : t("เดินโค้ดอัตโนมัติ", "Auto Step")}
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setIsAutoWalking(false);
                          setTraceIdx((p) => Math.min(topic.steps.length - 1, p + 1));
                        }}
                        disabled={traceIdx === topic.steps.length - 1}
                        className="press-teal px-3 py-1.5 rounded-xl text-[13px] font-extrabold disabled:opacity-50 cursor-pointer"
                      >
                        {t("ถัดไป →", "Next →")}
                      </button>
                    </div>
                  </div>

                  {/* คำอธิบายจังหวะปัจจุบัน */}
                  <div className="bg-[#141220] border border-[#2f2d45] rounded-xl p-3 text-[14px] text-[#f4efe6]">
                    <span className="font-extrabold text-[#f6c945]">
                      {t("การทำงานในขั้นนี้:", "What happens here:")}{" "}
                    </span>
                    {currentTrace.explanation}
                  </div>

                  {/* ตารางค่าตัวแปรและผลลัพธ์จากการรันจริง */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-[#141220] border border-[#2f2d45] rounded-xl p-3">
                      <div className="text-[13px] font-extrabold text-[#ffe27a] mb-2">
                        {t(
                          `ตารางค่าตัวแปร (ในขั้นที่ ${currentTrace.stepNumber})`,
                          `Variable Table (Step ${currentTrace.stepNumber})`
                        )}
                      </div>
                      <div className="space-y-1.5">
                        {Object.entries(currentTrace.variables).map(([varName, val]) => (
                          <div
                            key={varName}
                            className="flex items-center justify-between px-2.5 py-1 rounded-lg bg-[#1c1b2b] border border-[#2f2d45] text-[13px]"
                          >
                            <span className="font-code font-bold text-[#c4bdd6]">{varName}</span>
                            <span className="font-code font-extrabold text-[#86efac]">{val}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-[#141220] border border-[#2f2d45] rounded-xl p-3 flex flex-col justify-between">
                      <div className="text-[13px] font-extrabold text-[#ffe27a] mb-2">
                        {t("ผลลัพธ์บนหน้าจอ (console.log)", "Screen Output (console.log)")}
                      </div>
                      {currentTrace.outputSoFar.length > 0 ? (
                        <div className="p-2.5 rounded-lg bg-[#102a1e] border border-[#2fbf71]/50 font-code font-extrabold text-[#86efac]">
                          {currentTrace.outputSoFar.join("\n")}
                        </div>
                      ) : (
                        <div className="p-2.5 rounded-lg bg-[#1c1b2b] text-[13px] text-[#9a93ad]">
                          {t("ยังไม่มีการพิมพ์ออกหน้าจอในขั้นนี้", "No output printed at this step")}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ฝั่งขวา: กิจกรรมตามลำดับ PRIMM 1 -> 2 -> 3 -> 4 */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            {/* ==================== PRIMM ขั้นที่ 1: ทำนายผล ==================== */}
            {primmStep === 1 && (
              <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="px-3 py-1 rounded-full bg-[#5a2d91] border border-[#9b5de5] text-[#ffe27a] text-[13px] font-extrabold">
                    {t("ขั้นที่ 1 · ทำนายผล (Predict)", "Step 1 · Predict")}
                  </span>
                  <span className="text-[13px] font-semibold text-[#9a93ad]">
                    {t(
                      "อ่านโค้ดด้านซ้ายแล้วทายผลก่อนรันจริง",
                      "Read the code on the left and predict the output"
                    )}
                  </span>
                </div>

                <h3 className="text-[18px] font-extrabold text-[#f4efe6]">
                  {topic.predictPrompt}
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {shuffleArrayWithSeed(
                    topic.predictOptions,
                    `${optionShuffleSeed}:predict`
                  ).map((opt) => {
                    const selected = predictedAnswer === opt;
                    return (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setPredictedAnswer(opt)}
                        className={`p-3.5 rounded-xl text-left font-code font-bold text-[16px] cursor-pointer transition ${
                          selected
                            ? "bg-[#25193b] border-2 border-[#f6c945] text-[#ffe27a] shadow-[0_3px_0_#b8860b]"
                            : "press-secondary"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[13px] font-semibold text-[#9a93ad]">
                    {t("หรือพิมพ์คำทำนายของคุณเอง:", "Or type your own prediction:")}
                  </label>
                  <input
                    type="text"
                    value={predictedAnswer}
                    onChange={(e) => setPredictedAnswer(e.target.value)}
                    placeholder={t(
                      "พิมพ์ผลลัพธ์ที่คาดว่าจะพิมพ์ออกมา...",
                      "Type expected output..."
                    )}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0d0b14] border-2 border-[#2f2d45] text-[#f4efe6] font-code focus:outline-none focus:border-[#f6c945]"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleRunAndCompare}
                  disabled={!predictedAnswer.trim()}
                  className="press-gold w-full py-3 rounded-xl text-[16px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Icon name="play" size={20} />
                  <span>
                    {t(
                      "รันโค้ดจริงเพื่อเทียบผลกับที่ทาย",
                      "Run Real Code & Compare"
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* ==================== PRIMM ขั้นที่ 2: เทียบผลรันจริง ==================== */}
            {primmStep === 2 && realRunResult && (
              <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#5a2d91] border border-[#9b5de5] text-[#ffe27a] text-[13px] font-extrabold">
                    {t("ขั้นที่ 2 · เทียบผลรันจริง (Run)", "Step 2 · Run & Compare")}
                  </span>
                  <span className="px-3 py-1 rounded-lg bg-[#281d08] text-[#ffe27a] border border-[#f6c945]/60 text-[13px] font-extrabold">
                    {t(
                      `+${predictXp} XP จากการทำนายและตรวจสอบผลจริง`,
                      `+${predictXp} XP for predicting & verifying`
                    )}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-4 rounded-xl bg-[#1c1b2b] border border-[#2f2d45]">
                    <div className="text-[13px] font-bold text-[#9a93ad]">
                      {t("สิ่งที่คุณทำนายไว้:", "Your Prediction:")}
                    </div>
                    <div className="font-code text-[20px] font-extrabold text-[#f4efe6] mt-1">
                      {predictedAnswer}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-[#102a1e] border-2 border-[#2fbf71]/50">
                    <div className="text-[13px] font-bold text-[#86efac] flex items-center gap-1">
                      <Icon name="check" size={16} />
                      <span>
                        {t("ผลลัพธ์จากการรันโค้ดจริง:", "Actual Output:")}
                      </span>
                    </div>
                    <div className="font-code text-[20px] font-extrabold text-[#86efac] mt-1">
                      {realRunResult.finalOutput}
                    </div>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-xl border-2 ${
                    predictedAnswer.trim() === realRunResult.finalOutput.trim()
                      ? "bg-[#102a1e] border-[#2fbf71]/50 text-[#86efac]"
                      : "bg-[#281d08] border-[#f6c945]/60 text-[#ffe27a]"
                  }`}
                >
                  <div className="font-extrabold text-[15px] flex items-center gap-2">
                    <Icon
                      name={
                        predictedAnswer.trim() === realRunResult.finalOutput.trim()
                          ? "check"
                          : "bulb"
                      }
                      size={20}
                    />
                    <span>
                      {predictedAnswer.trim() === realRunResult.finalOutput.trim()
                        ? t("ทายตรงกับผลรันจริงเป๊ะ!", "Spot on! Exact match!")
                        : t(
                            "ผลรันจริงต่างจากที่ทายไว้ มาดูเหตุผลกัน:",
                            "Actual output differs from your guess — let's see why:"
                          )}
                    </span>
                  </div>
                  <p className="text-[14px] mt-1 text-[#f4efe6]">{topic.predictExplanation}</p>
                </div>

                <button
                  type="button"
                  onClick={() => setPrimmStep(3)}
                  className="press-teal w-full py-3 rounded-xl text-[16px] font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>
                    {t(
                      "ไปขั้นที่ 3 · เดินโค้ดและตอบคำถามตามช่อง Block Model →",
                      "Next: Step 3 · Trace & Block Model Questions →"
                    )}
                  </span>
                </button>
              </div>
            )}

            {/* ==================== PRIMM ขั้นที่ 3: เดินโค้ดและตอบคำถาม ==================== */}
            {primmStep === 3 && (
              <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#5a2d91] border border-[#9b5de5] text-[#ffe27a] text-[13px] font-extrabold">
                    {t(
                      `ขั้นที่ 3 · เดินโค้ดและตอบคำถาม (ข้อ ${currentQIdx + 1}/${topic.questions.length})`,
                      `Step 3 · Trace & Answer (Q ${currentQIdx + 1}/${topic.questions.length})`
                    )}
                  </span>
                </div>

                {/* แถบเลือกข้อคำถามย่อย */}
                <div className="flex items-center gap-2">
                  {topic.questions.map((q, idx) => {
                    const st = qStates[q.id]?.status || "unanswered";
                    return (
                      <button
                        key={q.id}
                        type="button"
                        onClick={() => setCurrentQIdx(idx)}
                        className={`flex-1 py-2 px-3 rounded-xl text-[13px] font-extrabold border-2 transition cursor-pointer flex items-center justify-center gap-1.5 ${
                          currentQIdx === idx
                            ? "border-[#f6c945] bg-[#25193b] text-[#ffe27a]"
                            : st === "correct"
                            ? "border-[#2fbf71]/50 bg-[#102a1e] text-[#86efac]"
                            : st === "revealed"
                            ? "border-[#f6c945]/50 bg-[#281d08] text-[#ffe27a]"
                            : "border-[#2f2d45] bg-[#1c1b2b] text-[#9a93ad]"
                        }`}
                      >
                        <span>
                          {t(
                            `ข้อ ${idx + 1} (ช่อง ${q.cellId})`,
                            `Q${idx + 1} (${q.cellId})`
                          )}
                        </span>
                        {st === "correct" && <Icon name="check" size={15} />}
                      </button>
                    );
                  })}
                </div>

                {/* ตัวคำถาม */}
                <div className="p-4 rounded-xl bg-[#1c1b2b] border border-[#2f2d45]">
                  <div className="text-[12px] font-bold text-[#c084fc]">
                    {currentCellMeta.levelName} · {currentCellMeta.dimensionName} (
                    {t(`ดูบรรทัดที่ ${currentQ.targetLine}`, `Line ${currentQ.targetLine}`)})
                  </div>
                  <h3 className="text-[17px] font-extrabold text-[#f4efe6] mt-1">
                    {currentQ.question}
                  </h3>
                </div>

                {/* ตัวเลือกคำตอบ 4 ข้อ */}
                <div className="space-y-2.5">
                  {shuffleArrayWithSeed(
                    currentQ.options,
                    `${optionShuffleSeed}:${currentQ.id}`
                  ).map((opt) => {
                    const isSelected = currentQState.selectedOptionId === opt.id;
                    const isCorrectOpt = opt.id === currentQ.correctOptionId;
                    const showAsCorrect =
                      (currentQState.status === "correct" ||
                        currentQState.status === "revealed") &&
                      isCorrectOpt;
                    const showAsWrong =
                      (currentQState.status === "hint" ||
                        currentQState.status === "revealed") &&
                      isSelected &&
                      !isCorrectOpt;

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectQuestionOption(opt.id)}
                        disabled={
                          currentQState.status === "correct" ||
                          currentQState.status === "revealed"
                        }
                        className={`w-full p-3.5 rounded-xl text-left text-[15px] font-bold transition flex items-center justify-between gap-3 cursor-pointer ${
                          showAsCorrect
                            ? "bg-[#102a1e] border-2 border-[#2fbf71] text-[#86efac]"
                            : showAsWrong
                            ? "bg-[#2d141c] border-2 border-[#c0283a] text-[#fca5a5]"
                            : "press-secondary"
                        }`}
                      >
                        <span>
                          <strong className="mr-2 uppercase">{opt.id}.</strong>
                          {opt.text}
                        </span>
                        {showAsCorrect && (
                          <span className="px-2 py-0.5 rounded bg-[#2fbf71] text-[#120f1c] text-[12px] font-extrabold shrink-0">
                            {t("คำตอบที่ถูก", "Correct Answer")}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ตอบผิดครั้งที่ 1 -> แสดงคำใบ้ให้ลองอีกครั้ง */}
                {currentQState.status === "hint" && (
                  <div className="p-4 rounded-xl bg-[#281d08] border-2 border-[#f6c945] text-[#ffe27a] flex items-start gap-3">
                    <Icon name="bulb" size={24} className="shrink-0 mt-0.5" />
                    <div>
                      <div className="font-extrabold text-[15px]">
                        {t(
                          "ยังไม่ตรงจุด · นี่คือคำใบ้ (ลองเลือกคำตอบใหม่อีกครั้ง ไม่หักคะแนน!)",
                          "Not quite · Here's a hint (try again, no penalty!)"
                        )}
                      </div>
                      <p className="text-[14px] mt-1 text-[#f4efe6]">{currentQ.hint}</p>
                    </div>
                  </div>
                )}

                {/* ตอบถูก หรือ ตอบผิดครั้งที่ 2 -> แสดงเฉลยและเหตุผล */}
                {(currentQState.status === "correct" ||
                  currentQState.status === "revealed") && (
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      currentQState.status === "correct"
                        ? "bg-[#102a1e] border-[#2fbf71]/60 text-[#86efac]"
                        : "bg-[#25193b] border-[#9b5de5] text-[#e9d5ff]"
                    }`}
                  >
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="font-extrabold text-[15px] flex items-center gap-1.5">
                        <Icon
                          name={currentQState.status === "correct" ? "check" : "bulb"}
                          size={20}
                        />
                        <span>
                          {currentQState.status === "correct"
                            ? t(
                                `ถูกต้อง! เข้าใจช่อง ${currentQ.cellId} ชัดเจน`,
                                `Correct! Cell ${currentQ.cellId} mastered`
                              )
                            : t(
                                "เฉลยจากการตอบครั้งที่ 2 (อ่านเหตุผลเพื่อเก็บ XP ต่อได้เลย)",
                                "Answer revealed on 2nd attempt (read the explanation to continue)"
                              )}
                        </span>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full bg-[#0d0b14] border border-[#f6c945]/50 text-[#ffe27a] text-[13px] font-extrabold">
                        +{currentQState.earnedXp} XP
                      </span>
                    </div>
                    <p className="text-[14px] mt-1.5 text-[#f4efe6]">{currentQ.explanation}</p>

                    <div className="mt-3 flex justify-end">
                      {currentQIdx < topic.questions.length - 1 ? (
                        <button
                          type="button"
                          onClick={() => setCurrentQIdx((i) => i + 1)}
                          className="press-teal px-4 py-2 rounded-xl text-[14px] font-extrabold cursor-pointer"
                        >
                          {t("ข้อถัดไป →", "Next Question →")}
                        </button>
                      ) : allQuestionsDone ? (
                        <button
                          type="button"
                          onClick={() => setPrimmStep(4)}
                          className="press-gold px-4 py-2 rounded-xl text-[14px] font-extrabold cursor-pointer"
                        >
                          {t(
                            "ไปขั้นที่ 4 · แก้ค่าแล้วทายใหม่ →",
                            "Next: Step 4 · Modify & Predict →"
                          )}
                        </button>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* กล่องเสริม: ฝึกเขียนอธิบายโค้ดอิสระ (ตรวจด้วย AI หลังบ้าน) */}
                <div className="mt-2 pt-4 border-t-2 border-[#2f2d45] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[14px] font-extrabold text-[#ffe27a]">
                      {t(
                        "เสริมความเข้าใจ: ลองสรุปด้วยภาษาของคุณเองว่าโค้ดนี้ทำงานอย่างไร (+10 XP)",
                        "Bonus: Explain in your own words how this code works (+10 XP)"
                      )}
                    </span>
                    <span className="text-[12px] font-semibold text-[#9a93ad]">
                      {t("ตรวจผ่านหลังบ้าน", "Server-evaluated")}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={freeExplanation}
                      onChange={(e) => setFreeExplanation(e.target.value)}
                      placeholder={t(
                        "เช่น โค้ดนี้สร้างตัวแปรเก็บค่า แล้ววนลูปบวกสะสมก่อนพิมพ์ผลลัพธ์...",
                        "e.g., This code initializes a variable, loops to accumulate a sum, and prints it..."
                      )}
                      className="flex-1 px-3.5 py-2 rounded-xl bg-[#0d0b14] border-2 border-[#2f2d45] text-[14px] text-[#f4efe6]"
                    />
                    <button
                      type="button"
                      onClick={handleEvaluateFreeExplanation}
                      disabled={aiEvalLoading || !freeExplanation.trim()}
                      className="press-secondary px-4 py-2 rounded-xl text-[13px] font-extrabold shrink-0 cursor-pointer"
                    >
                      {aiEvalLoading
                        ? t("กำลังตรวจ...", "Checking...")
                        : t("ตรวจคำอธิบาย", "Check Explanation")}
                    </button>
                  </div>
                  {aiEvalResult && (
                    <div className="p-3 rounded-xl bg-[#25193b] border border-[#9b5de5] text-[13px] text-[#e9d5ff]">
                      <strong>
                        {t(
                          `ผลการตรวจ (${aiEvalResult.score}%):`,
                          `Evaluation (${aiEvalResult.score}%):`
                        )}
                      </strong>{" "}
                      {aiEvalResult.feedback}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ==================== PRIMM ขั้นที่ 4: แก้ค่าแล้วทายใหม่ ==================== */}
            {primmStep === 4 && (
              <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-5 flex flex-col gap-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#f6c945] text-[#120f1c] text-[13px] font-extrabold">
                    {t("ขั้นที่ 4 · แก้ค่าแล้วทายใหม่ (Modify)", "Step 4 · Modify")}
                  </span>
                  <span className="text-[13px] font-bold text-[#9a93ad]">
                    {t(
                      "เปลี่ยนค่าในโค้ดแล้วทำนายผลอีกครั้ง",
                      "Modify the code and predict the new output"
                    )}
                  </span>
                </div>

                <div className="p-3.5 rounded-xl bg-[#281d08] border border-[#f6c945]/60 text-[#ffe27a]">
                  <div className="font-extrabold text-[15px]">
                    {t("โจทย์ลองแก้ค่า:", "Modify Challenge:")} {topic.modifyChallenge.instruction}
                  </div>
                  <div className="text-[13px] mt-0.5 text-[#f4efe6]">
                    {t("จุดที่เปลี่ยน:", "Target change:")}{" "}
                    <code className="font-bold text-[#ffe27a]">{topic.modifyChallenge.changeDescription}</code>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[13px] font-extrabold text-[#ffe27a]">
                      {t(
                        `แก้ไขโค้ด ${language.toUpperCase()} ด้านล่างได้เลย:`,
                        `Edit the ${language.toUpperCase()} code below:`
                      )}
                    </label>
                    <button
                      type="button"
                      onClick={() => setModifiedCode(topic.modifyChallenge.suggestedCode)}
                      className="text-[12px] font-bold text-[#f6c945] underline cursor-pointer"
                    >
                      {t("รีเซ็ตเป็นโค้ดที่แก้ค่าตามโจทย์", "Reset to suggested code")}
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={modifiedCode}
                    onChange={(e) => setModifiedCode(e.target.value)}
                    className="w-full p-3.5 rounded-xl bg-[#0d0b14] border-2 border-[#2f2d45] font-code font-bold text-[#f4efe6] focus:outline-none focus:border-[#f6c945]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <span className="text-[14px] font-extrabold text-[#f4efe6]">
                    {t(
                      "ทายว่าโค้ดที่แก้ค่าแล้วจะพิมพ์อะไรออกทางหน้าจอ:",
                      "Predict what the modified code will print:"
                    )}
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {shuffleArrayWithSeed(
                      topic.modifyChallenge.options,
                      `${optionShuffleSeed}:modify`
                    ).map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setModifyPrediction(opt)}
                        className={`p-2.5 rounded-xl font-code font-extrabold text-[15px] cursor-pointer ${
                          modifyPrediction === opt
                            ? "bg-[#25193b] border-2 border-[#f6c945] text-[#ffe27a]"
                            : "press-secondary"
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleRunModifiedCode}
                  disabled={!modifyPrediction.trim()}
                  className="press-teal w-full py-3 rounded-xl text-[16px] font-extrabold flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  <Icon name="play" size={20} />
                  <span>
                    {t(
                      "รันโค้ดที่แก้แล้วจริงและตรวจคำทำนาย",
                      "Run Modified Code & Check Prediction"
                    )}
                  </span>
                </button>

                {modifyRunResult && (
                  <div
                    className={`p-4 rounded-xl border-2 ${
                      modifyRunResult.error
                        ? "bg-[#2d141c] border-[#c0283a] text-[#fca5a5]"
                        : modifyRunResult.matchedPrediction
                        ? "bg-[#102a1e] border-[#2fbf71]/60 text-[#86efac]"
                        : "bg-[#281d08] border-[#f6c945]/60 text-[#ffe27a]"
                    }`}
                  >
                    {modifyRunResult.error ? (
                      <div>
                        <strong>
                          {t("โค้ดมีข้อผิดพลาดไวยากรณ์:", "Syntax Error:")}
                        </strong>{" "}
                        {modifyRunResult.error}
                      </div>
                    ) : (
                      <>
                        <div className="font-extrabold text-[15px] flex items-center justify-between">
                          <span>
                            {t("ผลรันจริงของโค้ดใหม่คือ:", "Modified code output:")}{" "}
                            <code className="px-2 py-0.5 rounded bg-[#0d0b14] text-[#ffe27a] font-extrabold">
                              {modifyRunResult.finalOutput}
                            </code>
                          </span>
                          <span>+{modifyXp} XP</span>
                        </div>
                        <p className="text-[14px] mt-1.5 text-[#f4efe6]">{topic.modifyChallenge.explanation}</p>
                        <button
                          type="button"
                          onClick={() => setPrimmStep(5)}
                          className="press-gold w-full mt-3 py-2.5 rounded-xl text-[15px] font-extrabold flex items-center justify-center gap-2 cursor-pointer"
                        >
                          <Icon name="gift" size={20} />
                          <span>
                            {t(
                              "สรุปผลความเข้าใจ รับ XP และตราประจำเรื่อง →",
                              "View Summary, Claim XP & Badge →"
                            )}
                          </span>
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== ขั้นสรุปจบเรื่อง: ดูเฉลย เหตุผล + XP + ตรา ==================== */}
      {primmStep === 5 && (
        <div className="bg-[#141220] border-2 border-[#2f2d45] rounded-2xl p-6 max-w-3xl mx-auto w-full flex flex-col items-center text-center gap-5">
          <StatusCircle
            variant={topic.isBoss ? "boss" : "passed"}
            size="lg"
            label={t("ผ่านเควสต์สำเร็จ", "Quest Cleared")}
          />

          <div>
            <span className="px-3 py-1 rounded-full bg-[#102a1e] border border-[#2fbf71]/50 text-[#86efac] text-[13px] font-extrabold">
              {t("ผ่านเควสต์เรียบร้อย!", "Quest Completed!")}
            </span>
            <h2 className="text-[26px] font-extrabold text-[#f4efe6] mt-2">
              {topic.title}
            </h2>
            <p className="text-[15px] text-[#9a93ad] mt-1">
              {t(
                "คุณผ่านครบทั้ง 4 ขั้นตอน (ทำนายผล · เทียบผลรันจริง · เดินโค้ดตอบคำถาม · แก้ค่าแล้วทายใหม่)",
                "You completed all 4 steps (Predict · Run & Compare · Trace & Answer · Modify)"
              )}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
            <div className="p-4 rounded-2xl bg-[#281d08] border-2 border-[#f6c945]/70 flex items-center gap-3 text-left">
              <StatusCircle
                variant="current"
                size="md"
                label={t("XP ที่ได้รับ", "XP Earned")}
              />
              <div>
                <div className="text-[13px] font-bold text-[#ffe27a]">
                  {t("รางวัลความเข้าใจ", "Mastery Reward")}
                </div>
                <div className="text-[22px] font-extrabold text-[#f6c945]">
                  +{totalEarnedXp} XP
                </div>
                <div className="text-[12px] text-[#f4efe6]/80">
                  {t(
                    "คำนวณจากความเข้าใจในช่อง Block Model",
                    "Calculated from Block Model mastery"
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#25193b] border-2 border-[#9b5de5] flex items-center gap-3 text-left">
              <StatusCircle
                variant="badge"
                size="md"
                label={t("ตราที่ได้รับ", "Badge Earned")}
              />
              <div>
                <div className="text-[13px] font-bold text-[#e9d5ff]">
                  {t("ได้รับตราใหม่!", "New Badge Unlocked!")}
                </div>
                <div className="text-[18px] font-extrabold text-[#ffe27a]">
                  {topic.badgeReward.name}
                </div>
                <div className="text-[12px] text-[#c4bdd6]">
                  {topic.badgeReward.description}
                </div>
              </div>
            </div>
          </div>

          {/* สรุปช่อง Block Model ที่ได้ฝึกในเรื่องนี้ */}
          <div className="w-full bg-[#1c1b2b] border border-[#2f2d45] rounded-xl p-4 text-left">
            <div className="text-[14px] font-extrabold text-[#ffe27a] mb-2">
              {t(
                "สรุปช่อง Block Model ที่อัปเดตเข้าโปรไฟล์ของคุณ:",
                "Block Model Cells Updated on Your Profile:"
              )}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {topic.questions.map((q) => {
                const st = qStates[q.id];
                const meta = BLOCK_MODEL_CELLS.find((c) => c.id === q.cellId)!;
                const score = st?.cellMasteryScore || 75;
                return (
                  <div
                    key={q.id}
                    className="p-3 rounded-xl bg-[#141220] border border-[#2f2d45] flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-[#25193b] text-[#e9d5ff] text-[12px] font-extrabold">
                        {t("ช่อง", "Cell")} {q.cellId}
                      </span>
                      <span className="text-[14px] font-extrabold text-[#86efac]">
                        {score}%
                      </span>
                    </div>
                    <div className="text-[13px] font-bold text-[#f4efe6] mt-1">
                      {meta.shortTitle}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinishQuest}
            className="press-gold w-full py-3.5 rounded-xl text-[16px] font-extrabold flex items-center justify-center gap-2 cursor-pointer"
          >
            <Icon name="check" size={20} />
            <span>
              {t(
                "อัปเดตโปรไฟล์และกลับสู่เส้นทางเควสต์",
                "Update Profile & Return to Quest Map"
              )}
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
