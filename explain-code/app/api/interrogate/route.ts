import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/app/lib/supabase";
import { AppUserSession, getServerUserSession } from "@/app/lib/supabase/server";
import { callGeminiGenerateJson } from "@/app/lib/gemini-client";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

/**
 * Helper to record AI evaluation into Supabase ai_evaluations table
 * Requires a verified user session and ownership of the target attempt.
 */
async function recordEvaluation(
  session: AppUserSession | null,
  attemptId: string | undefined,
  studentId: string | undefined,
  explanation: string,
  score: number,
  passed: boolean,
  feedback: string
): Promise<{ savedToDb: boolean; attemptId: string | null }> {
  if (!session?.userId || !isSupabaseConfigured()) {
    return { savedToDb: false, attemptId: null };
  }

  if (
    studentId &&
    studentId.trim() !== session.userId &&
    session.role !== "admin"
  ) {
    return { savedToDb: false, attemptId: null };
  }

  const effectiveStudentId =
    session.role === "admin" && studentId ? studentId.trim() : session.userId;

  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return { savedToDb: false, attemptId: null };
  }

  let targetAttemptId = attemptId;

  if (targetAttemptId && isValidUuid(targetAttemptId)) {
    const { data: existingAttempt } = await supabase
      .from("attempts")
      .select("id, student_id")
      .eq("id", targetAttemptId)
      .maybeSingle();
    if (
      !existingAttempt ||
      (existingAttempt.student_id !== effectiveStudentId &&
        session.role !== "admin")
    ) {
      return { savedToDb: false, attemptId: null };
    }
  }

  // If attemptId not provided but effectiveStudentId is a UUID, look up the latest attempt
  if (!targetAttemptId && effectiveStudentId && isValidUuid(effectiveStudentId)) {
    try {
      const { data: latest } = await supabase
        .from("attempts")
        .select("id")
        .eq("student_id", effectiveStudentId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (latest?.id) {
        targetAttemptId = latest.id;
      }
    } catch (e) {
      console.warn("Failed to find latest attempt for student:", e);
    }
  }

  if (!targetAttemptId || !isValidUuid(targetAttemptId)) {
    return { savedToDb: false, attemptId: targetAttemptId || null };
  }

  try {
    const { error } = await supabase.from("ai_evaluations").upsert(
      {
        attempt_id: targetAttemptId,
        student_explanation: explanation || "",
        score: Math.min(100, Math.max(0, Math.round(score))),
        passed: Boolean(passed),
        feedback: feedback || null,
        created_at: new Date().toISOString(),
      },
      { onConflict: "attempt_id" }
    );

    if (error) {
      console.warn("Failed to save ai_evaluation to Supabase:", error);
      return { savedToDb: false, attemptId: targetAttemptId };
    }

    return { savedToDb: true, attemptId: targetAttemptId };
  } catch (err) {
    console.warn("Exception saving ai_evaluation:", err);
    return { savedToDb: false, attemptId: targetAttemptId };
  }
}

function evaluateWithBlockModelHeuristic(clean: string): {
  score: number;
  passed: boolean;
  feedback: string;
} {
  const hasSurface =
    /ตัวแปร|let|const|var|if|else|for|while|function|def|return|print|console|บรรทัด|เครื่องหมาย|แอเรย์|ลิสต์|ค่า|variable|loop|array|condition/i.test(
      clean
    );
  const hasExecution =
    /รอบ|เปลี่ยน|บวก|ลบ|คูณ|หาร|ส่ง|พิมพ์|แสดงผล|กลายเป็น|เท่ากับ|มากกว่า|น้อยกว่า|จริง|เท็จ|เพิ่ม|ลด|วนซ้ำ|เก็บค่า|คำนวณ|run|output|step|value|change/i.test(
      clean
    );
  const hasFunction =
    /เพื่อ|ทำหน้าที่|หา|นับ|รวม|ตรวจ|ส่วนลด|คะแนน|สูงสุด|ต่ำสุด|ผลลัพธ์|สรุป|กรอง|เฉลี่ย|คำนวณหา|purpose|goal|calculate|total|check/i.test(
      clean
    );

  const dims = [hasSurface, hasExecution, hasFunction].filter(Boolean).length;
  const score = dims === 3 ? 95 : dims === 2 ? 82 : dims === 1 ? 68 : 45;
  const passed = score >= 65;

  const feedback =
    dims === 3
      ? "อธิบายได้ครบทั้งโครงสร้างโค้ด ลำดับการเปลี่ยนค่าตัวแปร และเป้าหมายของโปรแกรมตามกรอบ Block Model!"
      : dims === 2
      ? "อธิบายการทำงานได้ดีมาก! หากเพิ่มเหตุผลว่าโค้ดส่วนนี้มีเป้าหมายเพื่ออะไรในภาพรวมจะสมบูรณ์ครบ 3 มิติ"
      : dims === 1
      ? "จับประเด็นเริ่มต้นได้แล้ว ลองอธิบายเพิ่มว่าค่าตัวแปรเปลี่ยนเป็นเท่าไหร่เมื่อโค้ดรันแต่ละขั้น"
      : "คำอธิบายยังไม่ระบุการทำงานของตัวแปรหรือเป้าหมายของโค้ดชัดเจน ลองอธิบายว่าแต่ละบรรทัดเปลี่ยนค่าตัวแปรอย่างไรและทำไปเพื่ออะไรครับ";

  return { score, passed, feedback };
}

/**
 * ตรวจคำอธิบายอิสระของนักเรียนผ่านหลังบ้าน (ไม่ใส่ API Key ในไฟล์หน้าเว็บ)
 * AI ใช้ตรวจคำอธิบายอิสระเท่านั้น ส่วนเฉลยข้อทำนายผลมาจากการรันโค้ดจริง
 * บันทึกผลลงตาราง ai_evaluations เมื่อระบุ attemptId หรือ studentId และเปิดใช้งาน Supabase
 */
export async function POST(req: NextRequest) {
  let clean = "";
  let attemptId: string | undefined;
  let studentId: string | undefined;
  const serverSession = await getServerUserSession();

  try {
    const body = await req.json();
    const { code, topicTitle, studentExplanation } = body;
    const language =
      typeof body.language === "string" && body.language.trim()
        ? body.language.trim()
        : "javascript";
    attemptId = body.attemptId;
    studentId = body.studentId;

    const keyToUse = process.env.GEMINI_API_KEY;

    clean = (studentExplanation || "").trim();
    if (clean.length < 8) {
      const feedback =
        "คำอธิบายยังสั้นเกินไป ลองระบุว่าตัวแปรเปลี่ยนค่าอย่างไรและโค้ดส่วนนี้ทำหน้าที่อะไรเพิ่มอีกนิดนะครับ";
      const { savedToDb } = await recordEvaluation(
        serverSession,
        attemptId,
        studentId,
        clean,
        30,
        false,
        feedback
      );

      return NextResponse.json({
        mode: "heuristic",
        passed: false,
        score: 30,
        feedback,
        savedToDb,
      });
    }

    if (!keyToUse) {
      const { score, passed, feedback } = evaluateWithBlockModelHeuristic(clean);

      const { savedToDb } = await recordEvaluation(
        serverSession,
        attemptId,
        studentId,
        clean,
        score,
        passed,
        feedback
      );

      return NextResponse.json({
        mode: "heuristic",
        passed,
        score,
        feedback,
        savedToDb,
      });
    }

    const prompt = `คุณคือครูผู้ช่วยตรวจคำอธิบายโค้ดภาษา ${language} ตามกรอบ Block Model (Text Surface, Execution, Function)
หัวข้อ: "${topicTitle}"
โค้ด:
\`\`\`${language}
${code}
\`\`\`
คำอธิบายของนักเรียน: "${clean}"

จงประเมินความเข้าใจของนักเรียนและตอบกลับเป็น JSON เท่านั้น:
{
  "score": ตัวเลข 0-100,
  "passed": true หรือ false (ผ่านถ้า score >= 65),
  "feedback": "คำชมและคำแนะนำสั้นๆ เข้าใจง่าย 2 ประโยคภาษาไทย ไม่ลงโทษ"
}`;

    const geminiResult = await callGeminiGenerateJson<{
      score?: unknown;
      passed?: unknown;
      feedback?: unknown;
    }>({
      apiKey: keyToUse,
      prompt,
      timeoutMs: 15000,
    });

    if (!geminiResult.ok || !geminiResult.data) {
      const {
        score: fallbackScore,
        passed: fallbackPassed,
        feedback: fallbackFeedback,
      } = evaluateWithBlockModelHeuristic(clean);
      const { savedToDb } = await recordEvaluation(
        serverSession,
        attemptId,
        studentId,
        clean,
        fallbackScore,
        fallbackPassed,
        fallbackFeedback
      );

      return NextResponse.json({
        mode: "heuristic-fallback",
        passed: fallbackPassed,
        score: fallbackScore,
        feedback: fallbackFeedback,
        savedToDb,
      });
    }

    const parsed = geminiResult.data;
    const heuristicFallback = evaluateWithBlockModelHeuristic(clean);

    const finalScore =
      typeof parsed.score === "number" ? parsed.score : heuristicFallback.score;
    const finalPassed =
      typeof parsed.passed === "boolean" ? parsed.passed : finalScore >= 65;
    const finalFeedback =
      typeof parsed.feedback === "string" && parsed.feedback.trim().length > 0
        ? parsed.feedback
        : heuristicFallback.feedback;

    const { savedToDb } = await recordEvaluation(
      serverSession,
      attemptId,
      studentId,
      clean,
      finalScore,
      finalPassed,
      finalFeedback
    );

    return NextResponse.json({
      mode: "gemini-backend",
      modelUsed: geminiResult.model,
      score: finalScore,
      passed: finalPassed,
      feedback: finalFeedback,
      savedToDb,
    });
  } catch {
    const {
      score: catchScore,
      passed: catchPassed,
      feedback: catchFeedback,
    } = evaluateWithBlockModelHeuristic(clean);
    const { savedToDb } = await recordEvaluation(
      serverSession,
      attemptId,
      studentId,
      clean,
      catchScore,
      catchPassed,
      catchFeedback
    );

    return NextResponse.json({
      mode: "heuristic-fallback",
      passed: catchPassed,
      score: catchScore,
      feedback: catchFeedback,
      savedToDb,
    });
  }
}
