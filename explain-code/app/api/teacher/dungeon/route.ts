import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/app/lib/supabase";
import { getServerUserSession } from "@/app/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isValidUuid(id: unknown): id is string {
  return typeof id === "string" && UUID_REGEX.test(id.trim());
}

async function requireTeacherOrAdmin() {
  const session = await getServerUserSession();
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" },
        { status: 401 }
      ),
    };
  }
  if (session.role !== "teacher" && session.role !== "admin") {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "ไม่มีสิทธิ์เข้าถึง: เฉพาะครูผู้สอนหรือแอดมินเท่านั้น" },
        { status: 403 }
      ),
    };
  }
  if (session.role === "teacher" && session.teacherStatus !== "approved") {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: "บัญชีครูผู้สอนของคุณอยู่ระหว่างรอการอนุมัติ" },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function GET(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireTeacherOrAdmin();
    if (errorResponse || !session) return errorResponse!;

    const { searchParams } = new URL(req.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "ต้องระบุ courseId ในคำขอ" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const db = admin as any;

    if (isSupabaseConfigured() && db && isValidUuid(courseId)) {
      if (session.role === "teacher") {
        const { data: course } = await db
          .from("courses")
          .select("id, teacher_id")
          .eq("id", courseId)
          .maybeSingle();
        if (course && course.teacher_id !== session.userId) {
          return NextResponse.json(
            { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลดันเจี้ยนในคอร์สของผู้สอนคนอื่น" },
            { status: 403 }
          );
        }
      }

      // 1. Fetch questions for this course
      const { data: questions, error: qErr } = await db
        .from("dungeon_questions")
        .select("*")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });

      if (qErr) {
        return NextResponse.json({ error: qErr.message }, { status: 500 });
      }

      // 2. Fetch error analytics from room_attempts scoped to this course's questions
      const questionIds = Array.isArray(questions)
        ? questions.map((q: { id?: string }) => q.id).filter(Boolean)
        : [];
      let attempts: Array<{ question_id: string; is_correct: boolean }> | null = [];
      if (questionIds.length > 0) {
        const { data: attemptRows } = await db
          .from("room_attempts")
          .select("question_id, is_correct")
          .in("question_id", questionIds);
        attempts = attemptRows;
      }

      const statsMap: Record<
        string,
        { totalAttempts: number; wrongCount: number; wrongPercent: number }
      > = {};

      if (Array.isArray(attempts)) {
        attempts.forEach((att: any) => {
          const qid = att.question_id;
          if (!statsMap[qid]) {
            statsMap[qid] = { totalAttempts: 0, wrongCount: 0, wrongPercent: 0 };
          }
          statsMap[qid].totalAttempts += 1;
          if (!att.is_correct) {
            statsMap[qid].wrongCount += 1;
          }
        });

        Object.keys(statsMap).forEach((qid) => {
          const st = statsMap[qid];
          st.wrongPercent =
            st.totalAttempts > 0
              ? Math.round((st.wrongCount / st.totalAttempts) * 100)
              : 0;
        });
      }

      return NextResponse.json({
        success: true,
        questions: questions || [],
        stats: statsMap,
      });
    }

    // Fallback if Supabase is offline
    return NextResponse.json({
      success: true,
      questions: [],
      stats: {},
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการดึงข้อมูลคำถาม";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireTeacherOrAdmin();
    if (errorResponse || !session) return errorResponse!;

    const body = await req.json();
    const {
      id,
      courseId,
      lessonId,
      question,
      codeSnippet,
      choices,
      correctIndex,
      explanation,
      difficulty = "easy",
      blockModelCell = "Execution-Flow",
      monsterType = "slime",
      isBoss = false,
    } = body;

    if (!courseId || !question || !Array.isArray(choices) || correctIndex === undefined) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน: ต้องระบุ courseId, question, choices (4 ตัวเลือก) และ correctIndex" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const db = admin as any;

    if (isSupabaseConfigured() && db && isValidUuid(courseId)) {
      if (session.role === "teacher") {
        const { data: course } = await db
          .from("courses")
          .select("id, teacher_id")
          .eq("id", courseId)
          .maybeSingle();
        if (course && course.teacher_id !== session.userId) {
          return NextResponse.json(
            { error: "ไม่มีสิทธิ์เพิ่มหรือแก้ไขคำถามในคอร์สของผู้สอนคนอื่น" },
            { status: 403 }
          );
        }
        if (id && isValidUuid(id)) {
          const { data: existingQ } = await db
            .from("dungeon_questions")
            .select("id, course_id, created_by")
            .eq("id", id)
            .maybeSingle();
          if (existingQ) {
            let ownsExisting = existingQ.created_by === session.userId;
            if (!ownsExisting && existingQ.course_id) {
              const { data: qCourse } = await db
                .from("courses")
                .select("teacher_id")
                .eq("id", existingQ.course_id)
                .maybeSingle();
              ownsExisting = Boolean(qCourse && qCourse.teacher_id === session.userId);
            }
            if (!ownsExisting) {
              return NextResponse.json(
                { error: "ไม่มีสิทธิ์แก้ไขคำถามของผู้สอนคนอื่น" },
                { status: 403 }
              );
            }
          }
        }
      }
      const payload: any = {
        course_id: courseId,
        lesson_id: lessonId || null,
        question,
        code_snippet: codeSnippet || null,
        choices,
        correct_index: correctIndex,
        explanation: explanation || "คำตอบถูกต้องตามหลักการทำงานของ Block Model",
        difficulty,
        block_model_cell: blockModelCell,
        monster_type: monsterType,
        is_boss: isBoss,
        created_by: session.userId,
        updated_at: new Date().toISOString(),
      };

      if (id) {
        payload.id = id;
      }

      const { data, error } = await db
        .from("dungeon_questions")
        .upsert(payload)
        .select()
        .single();

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, question: data });
    }

    return NextResponse.json({
      success: true,
      question: {
        id: id || `dq-${Date.now()}`,
        course_id: courseId,
        lesson_id: lessonId,
        question,
        code_snippet: codeSnippet,
        choices,
        correct_index: correctIndex,
        explanation,
        difficulty,
        monster_type: monsterType,
        is_boss: isBoss,
      },
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการบันทึกคำถาม";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { session, errorResponse } = await requireTeacherOrAdmin();
    if (errorResponse || !session) return errorResponse!;

    const { searchParams } = new URL(req.url);
    const questionId = searchParams.get("questionId");

    if (!questionId) {
      return NextResponse.json(
        { error: "ต้องระบุ questionId ในคำขอ" },
        { status: 400 }
      );
    }

    const admin = getSupabaseAdmin();
    const db = admin as any;

    if (isSupabaseConfigured() && db && isValidUuid(questionId)) {
      if (session.role === "teacher") {
        const { data: existingQ } = await db
          .from("dungeon_questions")
          .select("id, course_id, created_by")
          .eq("id", questionId)
          .maybeSingle();
        if (existingQ) {
          let ownsExisting = existingQ.created_by === session.userId;
          if (!ownsExisting && existingQ.course_id) {
            const { data: qCourse } = await db
              .from("courses")
              .select("teacher_id")
              .eq("id", existingQ.course_id)
              .maybeSingle();
            ownsExisting = Boolean(qCourse && qCourse.teacher_id === session.userId);
          }
          if (!ownsExisting) {
            return NextResponse.json(
              { error: "ไม่มีสิทธิ์ลบคำถามของผู้สอนคนอื่น" },
              { status: 403 }
            );
          }
        }
      }

      const { error } = await db
        .from("dungeon_questions")
        .delete()
        .eq("id", questionId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, deleted: questionId });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการลบคำถาม";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
