import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/app/lib/supabase";
import { getServerUserSession } from "@/app/lib/supabase/server";
import { INITIAL_COURSES, INITIAL_LESSONS } from "@/app/lib/lms-data";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function isPublicCourseRecord(course: { visibility?: string; is_published?: boolean }): boolean {
  if (course.visibility === "private") return false;
  if (course.visibility === "public") return true;
  return Boolean(course.is_published);
}

function sanitizeLmsForClient(
  courses: any[],
  lessons: any[],
  session: { userId?: string; role?: string } | null,
  enrollments: any[] = []
) {
  const enrolledCourseIds = new Set(
    enrollments.map((e: any) => String(e?.course_id || ""))
  );
  const canAccessCourse = (c: any) => {
    if (isPublicCourseRecord(c)) return true;
    if (!session?.userId) return false;
    if (session.role === "admin") return true;
    if (c.teacher_id === session.userId) return true;
    return enrolledCourseIds.has(String(c.id));
  };

  const accessiblePrivateIds = new Set(
    courses.filter((c) => !isPublicCourseRecord(c) && canAccessCourse(c)).map((c) => c.id)
  );
  const publicCourseIds = new Set(
    courses.filter((c) => isPublicCourseRecord(c)).map((c) => c.id)
  );

  const sanitizedCourses = courses.map((c) => {
    if (canAccessCourse(c)) return c;
    return { ...c, join_code: "" };
  });

  const courseById = new Map<string, any>(
    courses.map((c) => [String(c.id), c])
  );

  const sanitizedLessons = lessons
    .filter((l) => {
      const cid = l?.course_id;
      return publicCourseIds.has(cid) || accessiblePrivateIds.has(cid);
    })
    .map((l) => {
      const parentCourse = courseById.get(String(l?.course_id || ""));
      const isTeacherOrAdmin = Boolean(
        session?.userId &&
          (session.role === "admin" ||
            (parentCourse && parentCourse.teacher_id === session.userId))
      );
      if (isTeacherOrAdmin || !Array.isArray(l?.quiz_questions)) {
        return l;
      }
      return {
        ...l,
        quiz_questions: l.quiz_questions.map((q: any) => ({
          ...q,
          correctIndex: -1,
          explanation: "",
        })),
      };
    });

  return { courses: sanitizedCourses, lessons: sanitizedLessons };
}

/**
 * GET /api/lms
 * ดึงข้อมูลคอร์ส บทเรียน การลงทะเบียน และความคืบหน้าจาก Supabase (พร้อม fallback ข้อมูลเริ่มต้น)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = (searchParams.get("studentId") || "").trim();
    const teacherId = (searchParams.get("teacherId") || "").trim();
    const session = await getServerUserSession();

    if (teacherId) {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนดึงข้อมูลผู้สอน" },
          { status: 401 }
        );
      }
      if (session.role !== "teacher" && session.role !== "admin") {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลผู้สอน" },
          { status: 403 }
        );
      }
      if (session.role === "teacher" && teacherId !== session.userId) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลของผู้สอนคนอื่น" },
          { status: 403 }
        );
      }
    }

    if (studentId) {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนดึงข้อมูลความคืบหน้า" },
          { status: 401 }
        );
      }
      if (
        session.role !== "student" &&
        session.role !== "teacher" &&
        session.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลความคืบหน้า" },
          { status: 403 }
        );
      }
      if (session.role === "student" && studentId !== session.userId) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลของนักเรียนคนอื่น" },
          { status: 403 }
        );
      }
    }

    if (!isSupabaseConfigured()) {
      const safe = sanitizeLmsForClient(INITIAL_COURSES, INITIAL_LESSONS, session);
      return NextResponse.json({
        success: true,
        source: "seed",
        courses: safe.courses,
        lessons: safe.lessons,
        enrollments: [],
        progress: [],
        dungeonSaves: [],
        customDungeons: [],
      });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      const safe = sanitizeLmsForClient(INITIAL_COURSES, INITIAL_LESSONS, session);
      return NextResponse.json({
        success: true,
        source: "seed",
        courses: safe.courses,
        lessons: safe.lessons,
        enrollments: [],
        progress: [],
        dungeonSaves: [],
        customDungeons: [],
      });
    }

    if (
      studentId &&
      session?.role === "teacher" &&
      studentId !== session.userId
    ) {
      let ownsStudent = false;
      if (UUID_REGEX.test(studentId) && UUID_REGEX.test(session.userId)) {
        const { data: stu } = await supabase
          .from("students")
          .select("classroom_id")
          .eq("id", studentId)
          .maybeSingle();
        if (stu?.classroom_id) {
          const { data: room } = await supabase
            .from("classrooms")
            .select("teacher_id")
            .eq("id", stu.classroom_id)
            .maybeSingle();
          ownsStudent = Boolean(room && room.teacher_id === session.userId);
        }
      }
      if (!ownsStudent) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงข้อมูลของนักเรียนในห้องเรียนอื่น" },
          { status: 403 }
        );
      }
    }

    let coursesData: any[] | null = null;
    let lessonsData: any[] | null = null;
    let enrollmentsData: any[] = [];
    let progressData: any[] = [];
    let dungeonSavesData: any[] = [];
    let customDungeonsData: any[] = [];

    try {
      const { data: cRows, error: cErr } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });
      if (!cErr && cRows) {
        coursesData = cRows;
      }

      const { data: lRows, error: lErr } = await supabase
        .from("lessons")
        .select("*")
        .order("order_index", { ascending: true });
      if (!lErr && lRows) {
        lessonsData = lRows;
      }

      if (studentId && UUID_REGEX.test(studentId) && session?.userId) {
        const teacherCourseIds =
          session.role === "teacher" && studentId !== session.userId
            ? (coursesData || [])
                .filter((c) => c.teacher_id === session.userId)
                .map((c) => c.id)
            : null;

        if (teacherCourseIds === null || teacherCourseIds.length > 0) {
          let eQuery = supabase
            .from("enrollments")
            .select("*")
            .eq("student_id", studentId);
          let pQuery = supabase
            .from("lesson_progress")
            .select("*")
            .eq("student_id", studentId);

          if (teacherCourseIds) {
            eQuery = eQuery.in("course_id", teacherCourseIds);
            pQuery = pQuery.in("course_id", teacherCourseIds);
          }

          const [{ data: eRows }, { data: pRows }] = await Promise.all([
            eQuery,
            pQuery,
          ]);
          if (eRows) enrollmentsData = eRows;
          if (pRows) progressData = pRows;
        }
      } else if (teacherId && session?.userId) {
        if (session.role === "admin") {
          const [{ data: eRows }, { data: pRows }] = await Promise.all([
            supabase.from("enrollments").select("*"),
            supabase.from("lesson_progress").select("*"),
          ]);
          if (eRows) enrollmentsData = eRows;
          if (pRows) progressData = pRows;
        } else {
          const teacherCourseIds = (coursesData || [])
            .filter((c) => c.teacher_id === session.userId)
            .map((c) => c.id);
          if (teacherCourseIds.length > 0) {
            const [{ data: eRows }, { data: pRows }] = await Promise.all([
              supabase
                .from("enrollments")
                .select("*")
                .in("course_id", teacherCourseIds),
              supabase
                .from("lesson_progress")
                .select("*")
                .in("course_id", teacherCourseIds),
            ]);
            if (eRows) enrollmentsData = eRows;
            if (pRows) progressData = pRows;
          }
        }
      }

      if (session?.userId) {
        const [{ data: saveRows }, { data: customRows }] = await Promise.all([
          supabase
            .from("user_dungeon_saves")
            .select("save_data")
            .eq("user_id", session.userId)
            .order("updated_at", { ascending: false }),
          supabase
            .from("user_custom_dungeons")
            .select("dungeon_data")
            .eq("user_id", session.userId)
            .order("updated_at", { ascending: false })
            .limit(20),
        ]);
        if (Array.isArray(saveRows)) {
          dungeonSavesData = saveRows.map((r) => r.save_data).filter(Boolean);
        }
        if (Array.isArray(customRows)) {
          customDungeonsData = customRows.map((r) => r.dungeon_data).filter(Boolean);
        }
      }
    } catch (e) {
      console.warn("GET /api/lms query notice:", e);
    }

    // รวมคอร์สเริ่มต้นเข้ากับคอร์สในฐานข้อมูลเพื่อให้ระบบมีเนื้อหาพร้อมเรียนเสมอ
    const mergedCourses =
      coursesData && coursesData.length > 0
        ? [
            ...coursesData,
            ...INITIAL_COURSES.filter(
              (ic) => !coursesData!.some((dc) => dc.id === ic.id)
            ),
          ]
        : INITIAL_COURSES;

    const mergedLessons =
      lessonsData && lessonsData.length > 0
        ? [
            ...lessonsData,
            ...INITIAL_LESSONS.filter(
              (il) => !lessonsData!.some((dl) => dl.id === il.id)
            ),
          ]
        : INITIAL_LESSONS;

    const safe = sanitizeLmsForClient(
      mergedCourses,
      mergedLessons,
      session,
      enrollmentsData
    );

    return NextResponse.json({
      success: true,
      source: coursesData !== null ? "supabase" : "seed",
      courses: safe.courses,
      lessons: safe.lessons,
      enrollments: enrollmentsData,
      progress: progressData,
      dungeonSaves: dungeonSavesData,
      customDungeons: customDungeonsData,
    });
  } catch (err) {
    console.error("GET /api/lms error:", err);
    const safe = sanitizeLmsForClient(INITIAL_COURSES, INITIAL_LESSONS, null);
    return NextResponse.json({
      success: true,
      source: "seed",
      courses: safe.courses,
      lessons: safe.lessons,
      enrollments: [],
      progress: [],
      dungeonSaves: [],
      customDungeons: [],
    });
  }
}

/**
 * POST /api/lms
 * จัดการการสร้าง/แก้ไข/ลบคอร์ส บทเรียน การลงทะเบียนเรียน และบันทึกความคืบหน้า
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;
    const session = await getServerUserSession();

    const supabase = isSupabaseConfigured() ? getSupabaseAdmin() : null;

    // 1. สร้างหรืออัปเดตคอร์ส (เฉพาะครูที่อนุมัติแล้ว)
    if (action === "upsert-course") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนจัดการคอร์สเรียน" },
          { status: 401 }
        );
      }

      if (session.role !== "teacher" && session.role !== "admin") {
        return NextResponse.json(
          { error: "เฉพาะบัญชีครูผู้สอนเท่านั้นที่สามารถจัดการคอร์สได้" },
          { status: 403 }
        );
      }

      if (
        session.role === "teacher" &&
        session.teacherStatus !== "approved"
      ) {
        return NextResponse.json(
          { error: "บัญชีครูของคุณยังอยู่ในสถานะรออนุมัติ (pending) กรุณายืนยันรหัสเชิญครูก่อนสร้างคอร์ส" },
          { status: 403 }
        );
      }

      const course = body.course;
      if (!course || typeof course !== "object") {
        return NextResponse.json(
          { error: "ข้อมูลคอร์สเรียนไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      if (supabase && course.id && UUID_REGEX.test(String(course.id))) {
        const { data: existingCourse } = await supabase
          .from("courses")
          .select("id, teacher_id")
          .eq("id", String(course.id))
          .maybeSingle();
        if (
          existingCourse &&
          session.role === "teacher" &&
          existingCourse.teacher_id !== session.userId
        ) {
          return NextResponse.json(
            { error: "ไม่มีสิทธิ์แก้ไขคอร์สของผู้สอนคนอื่น" },
            { status: 403 }
          );
        }
      }

      const nowIso = new Date().toISOString();
      const isPublicCourse =
        course.visibility !== undefined
          ? course.visibility === "public"
          : Boolean(course.is_published);
      const effectiveTeacherId =
        session.role === "admin" && course.teacher_id
          ? String(course.teacher_id)
          : session.userId;
      const rawCourseId = typeof course.id === "string" ? course.id.trim() : "";
      const resolvedCourseId =
        rawCourseId &&
        (UUID_REGEX.test(rawCourseId) ||
          !supabase ||
          !UUID_REGEX.test(effectiveTeacherId))
          ? rawCourseId
          : crypto.randomUUID();
      const newCourse = {
        id: resolvedCourseId,
        teacher_id: effectiveTeacherId,
        teacher_name:
          session.role === "admin" && course.teacher_name
            ? String(course.teacher_name).trim()
            : session.displayName || session.username || "ครูผู้สอน",
        title: String(course.title || "").trim(),
        description: String(course.description || "").trim(),
        join_code: String(course.join_code || generateJoinCode())
          .trim()
          .toUpperCase(),
        level: course.level || "beginner",
        is_published: isPublicCourse,
        created_at: course.created_at || nowIso,
        updated_at: nowIso,
      };

      if (supabase && UUID_REGEX.test(newCourse.teacher_id)) {
        try {
          const { data, error } = await supabase
            .from("courses")
            .upsert(newCourse)
            .select("*")
            .single();
          if (!error && data) {
            return NextResponse.json({ success: true, course: data, source: "supabase" });
          }
        } catch (e) {
          console.warn("Supabase upsert-course notice:", e);
        }
      }

      return NextResponse.json({ success: true, course: newCourse, source: "local" });
    }

    // 2. ลบคอร์สของครู
    if (action === "delete-course") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนลบคอร์สเรียน" },
          { status: 401 }
        );
      }

      if (session.role !== "teacher" && session.role !== "admin") {
        return NextResponse.json(
          { error: "เฉพาะบัญชีครูผู้สอนเท่านั้นที่สามารถลบคอร์สได้" },
          { status: 403 }
        );
      }

      if (
        session.role === "teacher" &&
        session.teacherStatus !== "approved"
      ) {
        return NextResponse.json(
          { error: "บัญชีครูของคุณยังอยู่ในสถานะรออนุมัติ (pending)" },
          { status: 403 }
        );
      }

      const courseId = String(body.courseId || "").trim();
      if (!courseId) {
        return NextResponse.json(
          { error: "ต้องระบุรหัสคอร์สที่ต้องการลบ" },
          { status: 400 }
        );
      }

      if (supabase && UUID_REGEX.test(courseId)) {
        if (session.role === "teacher") {
          const { data: existingCourse } = await supabase
            .from("courses")
            .select("id, teacher_id")
            .eq("id", courseId)
            .maybeSingle();
          if (existingCourse && existingCourse.teacher_id !== session.userId) {
            return NextResponse.json(
              { error: "ไม่มีสิทธิ์ลบคอร์สของผู้สอนคนอื่น" },
              { status: 403 }
            );
          }
        }

        try {
          let delQuery = supabase.from("courses").delete().eq("id", courseId);
          if (session.role === "teacher" && UUID_REGEX.test(session.userId)) {
            delQuery = delQuery.eq("teacher_id", session.userId);
          }
          await delQuery;
        } catch (e) {
          console.warn("Supabase delete-course notice:", e);
        }
      }
      return NextResponse.json({ success: true, deletedCourseId: courseId });
    }

    // 3. สร้างหรืออัปเดตบทเรียน
    if (action === "upsert-lesson") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนจัดการบทเรียน" },
          { status: 401 }
        );
      }

      if (session.role !== "teacher" && session.role !== "admin") {
        return NextResponse.json(
          { error: "เฉพาะบัญชีครูผู้สอนเท่านั้นที่สามารถจัดการบทเรียนได้" },
          { status: 403 }
        );
      }

      if (
        session.role === "teacher" &&
        session.teacherStatus !== "approved"
      ) {
        return NextResponse.json(
          { error: "บัญชีครูของคุณยังอยู่ในสถานะรออนุมัติ (pending)" },
          { status: 403 }
        );
      }

      const lesson = body.lesson;
      if (!lesson || typeof lesson !== "object" || !lesson.course_id) {
        return NextResponse.json(
          { error: "ข้อมูลบทเรียนไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      if (supabase && session.role === "teacher") {
        if (UUID_REGEX.test(String(lesson.course_id))) {
          const { data: targetCourse } = await supabase
            .from("courses")
            .select("id, teacher_id")
            .eq("id", String(lesson.course_id))
            .maybeSingle();
          if (!targetCourse) {
            return NextResponse.json(
              { error: "ไม่พบคอร์สเรียนเป้าหมาย" },
              { status: 404 }
            );
          }
          if (targetCourse.teacher_id !== session.userId) {
            return NextResponse.json(
              { error: "ไม่มีสิทธิ์เพิ่มหรือแก้ไขบทเรียนในคอร์สของผู้สอนคนอื่น" },
              { status: 403 }
            );
          }
        }
        if (lesson.id && UUID_REGEX.test(String(lesson.id))) {
          const { data: existingLesson } = await supabase
            .from("lessons")
            .select("id, course_id")
            .eq("id", String(lesson.id))
            .maybeSingle();
          if (existingLesson?.course_id && UUID_REGEX.test(existingLesson.course_id)) {
            const { data: existingCourse } = await supabase
              .from("courses")
              .select("id, teacher_id")
              .eq("id", existingLesson.course_id)
              .maybeSingle();
            if (existingCourse && existingCourse.teacher_id !== session.userId) {
              return NextResponse.json(
                { error: "ไม่มีสิทธิ์แก้ไขบทเรียนในคอร์สของผู้สอนคนอื่น" },
                { status: 403 }
              );
            }
          }
        }
      }

      const nowIso = new Date().toISOString();
      const rawLessonId = typeof lesson.id === "string" ? lesson.id.trim() : "";
      const resolvedLessonId =
        rawLessonId &&
        (UUID_REGEX.test(rawLessonId) ||
          !supabase ||
          !UUID_REGEX.test(String(lesson.course_id)))
          ? rawLessonId
          : crypto.randomUUID();
      const newLesson = {
        id: resolvedLessonId,
        course_id: lesson.course_id,
        title: String(lesson.title || "").trim(),
        content_md: String(lesson.content_md || ""),
        code_example: String(lesson.code_example || ""),
        programming_language: String(lesson.programming_language || "javascript"),
        external_url: lesson.external_url ? String(lesson.external_url).trim() : null,
        video_url: lesson.video_url ? String(lesson.video_url).trim() : null,
        quiz_questions: Array.isArray(lesson.quiz_questions)
          ? lesson.quiz_questions
          : [],
        order_index: Number(lesson.order_index || 1),
        is_published: lesson.is_published !== undefined ? Boolean(lesson.is_published) : true,
        created_at: lesson.created_at || nowIso,
        updated_at: nowIso,
      };

      if (supabase && UUID_REGEX.test(newLesson.course_id)) {
        try {
          const { data, error } = await supabase
            .from("lessons")
            .upsert(newLesson)
            .select("*")
            .single();
          if (!error && data) {
            return NextResponse.json({ success: true, lesson: data, source: "supabase" });
          }
        } catch (e) {
          console.warn("Supabase upsert-lesson notice:", e);
        }
      }

      return NextResponse.json({ success: true, lesson: newLesson, source: "local" });
    }

    // 4. ลบบทเรียน
    if (action === "delete-lesson") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนลบบทเรียน" },
          { status: 401 }
        );
      }

      if (session.role !== "teacher" && session.role !== "admin") {
        return NextResponse.json(
          { error: "เฉพาะบัญชีครูผู้สอนเท่านั้นที่สามารถลบบทเรียนได้" },
          { status: 403 }
        );
      }

      if (
        session.role === "teacher" &&
        session.teacherStatus !== "approved"
      ) {
        return NextResponse.json(
          { error: "บัญชีครูของคุณยังอยู่ในสถานะรออนุมัติ (pending)" },
          { status: 403 }
        );
      }

      const lessonId = String(body.lessonId || "").trim();
      if (!lessonId) {
        return NextResponse.json(
          { error: "ต้องระบุรหัสบทเรียนที่ต้องการลบ" },
          { status: 400 }
        );
      }

      if (supabase && UUID_REGEX.test(lessonId)) {
        if (session.role === "teacher") {
          const { data: existingLesson } = await supabase
            .from("lessons")
            .select("id, course_id")
            .eq("id", lessonId)
            .maybeSingle();
          if (existingLesson?.course_id && UUID_REGEX.test(existingLesson.course_id)) {
            const { data: existingCourse } = await supabase
              .from("courses")
              .select("id, teacher_id")
              .eq("id", existingLesson.course_id)
              .maybeSingle();
            if (existingCourse && existingCourse.teacher_id !== session.userId) {
              return NextResponse.json(
                { error: "ไม่มีสิทธิ์ลบบทเรียนในคอร์สของผู้สอนคนอื่น" },
                { status: 403 }
              );
            }
          }
        }

        try {
          await supabase.from("lessons").delete().eq("id", lessonId);
        } catch (e) {
          console.warn("Supabase delete-lesson notice:", e);
        }
      }
      return NextResponse.json({ success: true, deletedLessonId: lessonId });
    }

    // 5a. ตรวจสอบ Join Code ของคอร์สแบบส่วนตัวบนเซิร์ฟเวอร์
    if (action === "verify-join-code") {
      const cleanCode =
        typeof body.joinCode === "string" ? body.joinCode.trim().toUpperCase() : "";
      const targetCourseId =
        typeof body.courseId === "string" ? body.courseId.trim() : "";

      if (!cleanCode) {
        return NextResponse.json(
          { error: "กรุณากรอกรหัสเข้าร่วมคอร์ส" },
          { status: 400 }
        );
      }

      let matchedCourse: any = null;
      if (supabase) {
        try {
          let query = supabase
            .from("courses")
            .select("*")
            .ilike("join_code", cleanCode);
          if (targetCourseId && UUID_REGEX.test(targetCourseId)) {
            query = query.eq("id", targetCourseId);
          }
          const { data } = await query.limit(1).maybeSingle();
          if (data) matchedCourse = data;
        } catch (e) {
          console.warn("verify-join-code supabase notice:", e);
        }
      }

      if (!matchedCourse) {
        matchedCourse =
          INITIAL_COURSES.find(
            (c) =>
              c.join_code.toUpperCase() === cleanCode &&
              (!targetCourseId || c.id === targetCourseId)
          ) || null;
      }

      if (!matchedCourse) {
        return NextResponse.json(
          { error: "รหัสเข้าร่วมคอร์สไม่ถูกต้อง หรือไม่พบคอร์ส" },
          { status: 403 }
        );
      }

      return NextResponse.json({ success: true, course: matchedCourse });
    }

    // 5b. ตรวจคำตอบ Quiz ท้ายบทเรียนฝั่งเซิร์ฟเวอร์ (กันดูเฉลยจาก GET /api/lms)
    if (action === "grade-lesson-quiz") {
      const targetCourseId =
        typeof body.courseId === "string" ? body.courseId.trim() : "";
      const targetLessonId =
        typeof body.lessonId === "string" ? body.lessonId.trim() : "";
      const answers =
        body.answers && typeof body.answers === "object" && !Array.isArray(body.answers)
          ? (body.answers as Record<string, unknown>)
          : {};

      if (!targetLessonId) {
        return NextResponse.json(
          { error: "ต้องระบุ lessonId" },
          { status: 400 }
        );
      }

      let targetLesson: any =
        INITIAL_LESSONS.find(
          (l) =>
            l.id === targetLessonId &&
            (!targetCourseId || l.course_id === targetCourseId)
        ) || null;

      if (!targetLesson && supabase && UUID_REGEX.test(targetLessonId)) {
        const { data: lRow } = await supabase
          .from("lessons")
          .select("id, course_id, quiz_questions")
          .eq("id", targetLessonId)
          .maybeSingle();
        if (lRow) targetLesson = lRow;
      }

      if (!targetLesson) {
        return NextResponse.json(
          { error: "ไม่พบบทเรียนนี้ในระบบ" },
          { status: 404 }
        );
      }

      const rawQuestions = Array.isArray(targetLesson.quiz_questions)
        ? targetLesson.quiz_questions
        : [];
      let correctCount = 0;
      const results: Record<
        string,
        { correctIndex: number; explanation: string; isCorrect: boolean }
      > = {};

      for (const q of rawQuestions) {
        const qid = String(q?.id || "");
        const expectedIdx =
          typeof q?.correctIndex === "number" ? q.correctIndex : 0;
        const pickedRaw = answers[qid];
        const pickedIdx =
          typeof pickedRaw === "number" ? pickedRaw : Number(pickedRaw);
        const isCorrect = Number.isFinite(pickedIdx) && pickedIdx === expectedIdx;
        if (isCorrect) correctCount += 1;
        results[qid] = {
          correctIndex: expectedIdx,
          explanation: typeof q?.explanation === "string" ? q.explanation : "",
          isCorrect,
        };
      }

      const scorePct =
        rawQuestions.length > 0
          ? Math.round((correctCount / rawQuestions.length) * 100)
          : 100;

      return NextResponse.json({
        success: true,
        scorePct,
        correctCount,
        totalQuestions: rawQuestions.length,
        results,
      });
    }

    // 5. นักเรียนเข้าร่วมคอร์ส (Enroll)
    if (action === "enroll") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนลงทะเบียนเรียน" },
          { status: 401 }
        );
      }

      const { courseId, studentId, lastAccessedLessonId, joinCode } = body;
      if (typeof courseId !== "string" || !courseId.trim()) {
        return NextResponse.json(
          { error: "ต้องระบุรหัสคอร์สเรียน (courseId)" },
          { status: 400 }
        );
      }
      const requestedStudentId =
        typeof studentId === "string" ? studentId.trim() : "";
      if (
        requestedStudentId &&
        requestedStudentId !== session.userId &&
        session.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์ลงทะเบียนเรียนแทนผู้ใช้อื่น" },
          { status: 403 }
        );
      }

      const effectiveStudentId =
        session.role === "admin" && requestedStudentId
          ? requestedStudentId
          : session.userId;

      // ตรวจสอบสิทธิ์สำหรับคอร์สส่วนตัว (Private Course)
      let targetCourse: any = INITIAL_COURSES.find((c) => c.id === courseId) || null;
      if (!targetCourse && supabase && UUID_REGEX.test(courseId)) {
        const { data: cRow } = await supabase
          .from("courses")
          .select("id, teacher_id, is_published, join_code")
          .eq("id", courseId)
          .maybeSingle();
        if (cRow) targetCourse = cRow;
      }

      if (targetCourse && !isPublicCourseRecord(targetCourse)) {
        const isOwnerOrAdmin =
          session.role === "admin" || targetCourse.teacher_id === session.userId;
        let alreadyEnrolled = false;
        if (!isOwnerOrAdmin && supabase && UUID_REGEX.test(courseId) && UUID_REGEX.test(effectiveStudentId)) {
          const { data: existingEnr } = await supabase
            .from("enrollments")
            .select("id")
            .eq("course_id", courseId)
            .eq("student_id", effectiveStudentId)
            .maybeSingle();
          alreadyEnrolled = Boolean(existingEnr);
        }
        const providedCode =
          typeof joinCode === "string" ? joinCode.trim().toUpperCase() : "";
        const expectedCode = String(targetCourse.join_code || "").trim().toUpperCase();
        if (!isOwnerOrAdmin && !alreadyEnrolled && (!providedCode || providedCode !== expectedCode)) {
          return NextResponse.json(
            { error: "คอร์สนี้เป็นแบบส่วนตัว กรุณากรอกรหัสเข้าร่วมคอร์สให้ถูกต้อง" },
            { status: 403 }
          );
        }
      }
      const nowIso = new Date().toISOString();

      const enrollment = {
        id: crypto.randomUUID(),
        course_id: courseId,
        student_id: effectiveStudentId,
        enrolled_at: nowIso,
        last_accessed_lesson_id: lastAccessedLessonId || null,
        last_accessed_at: nowIso,
      };

      if (
        supabase &&
        UUID_REGEX.test(courseId) &&
        UUID_REGEX.test(effectiveStudentId)
      ) {
        try {
          const { data, error } = await supabase
            .from("enrollments")
            .upsert(
              {
                course_id: courseId,
                student_id: effectiveStudentId,
                last_accessed_lesson_id: lastAccessedLessonId || null,
                last_accessed_at: nowIso,
              },
              { onConflict: "course_id,student_id" }
            )
            .select("*")
            .single();
          if (!error && data) {
            return NextResponse.json({ success: true, enrollment: data, source: "supabase" });
          }
        } catch (e) {
          console.warn("Supabase enroll notice:", e);
        }
      }

      return NextResponse.json({ success: true, enrollment, source: "local" });
    }

    // 6. บันทึกความคืบหน้าบทเรียน (เปิดดูบทเรียน หรือ เรียนจบ)
    if (action === "update-progress") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนบันทึกความคืบหน้าบทเรียน" },
          { status: 401 }
        );
      }

      const {
        courseId,
        lessonId,
        studentId,
        isCompleted,
        quizScore,
      } = body;
      if (
        typeof courseId !== "string" ||
        !courseId.trim() ||
        typeof lessonId !== "string" ||
        !lessonId.trim()
      ) {
        return NextResponse.json(
          { error: "ต้องระบุ courseId และ lessonId ให้ครบถ้วน" },
          { status: 400 }
        );
      }
      const requestedStudentId =
        typeof studentId === "string" ? studentId.trim() : "";
      if (
        requestedStudentId &&
        requestedStudentId !== session.userId &&
        session.role !== "admin"
      ) {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์บันทึกความคืบหน้าแทนผู้ใช้อื่น" },
          { status: 403 }
        );
      }

      const effectiveStudentId =
        session.role === "admin" && requestedStudentId
          ? requestedStudentId
          : session.userId;
      const nowIso = new Date().toISOString();

      const progressRecord = {
        id: crypto.randomUUID(),
        student_id: effectiveStudentId,
        course_id: courseId,
        lesson_id: lessonId,
        is_completed: Boolean(isCompleted),
        quiz_score: typeof quizScore === "number" ? quizScore : null,
        opened_at: nowIso,
        completed_at: isCompleted ? nowIso : null,
        updated_at: nowIso,
      };

      if (
        supabase &&
        UUID_REGEX.test(courseId) &&
        UUID_REGEX.test(lessonId) &&
        UUID_REGEX.test(effectiveStudentId)
      ) {
        try {
          // อัปเดตบทเรียนล่าสุดใน enrollments ด้วย
          await supabase
            .from("enrollments")
            .upsert(
              {
                course_id: courseId,
                student_id: effectiveStudentId,
                last_accessed_lesson_id: lessonId,
                last_accessed_at: nowIso,
              },
              { onConflict: "course_id,student_id" }
            );

          const { data, error } = await supabase
            .from("lesson_progress")
            .upsert(
              {
                student_id: effectiveStudentId,
                course_id: courseId,
                lesson_id: lessonId,
                is_completed: Boolean(isCompleted),
                quiz_score: typeof quizScore === "number" ? quizScore : null,
                completed_at: isCompleted ? nowIso : null,
                updated_at: nowIso,
              },
              { onConflict: "student_id,lesson_id" }
            )
            .select("*")
            .single();

          if (!error && data) {
            return NextResponse.json({
              success: true,
              progress: data,
              source: "supabase",
            });
          }
        } catch (e) {
          console.warn("Supabase update-progress notice:", e);
        }
      }

      return NextResponse.json({
        success: true,
        progress: progressRecord,
        source: "local",
      });
    }

    // 7. บันทึกจุดเซฟดันเจี้ยนของผู้ใช้ (ซิงก์ข้ามเครื่อง)
    if (action === "save-dungeon-progress") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนบันทึกจุดเซฟดันเจี้ยน" },
          { status: 401 }
        );
      }
      const record = body.record;
      if (!record || typeof record !== "object" || !record.language) {
        return NextResponse.json(
          { error: "ข้อมูลจุดเซฟดันเจี้ยนไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      const nowIso = new Date().toISOString();
      const normalizedRecord = {
        ...record,
        userId: session.userId,
        savedAt: record.savedAt || nowIso,
      };

      if (supabase) {
        try {
          const { error } = await supabase.from("user_dungeon_saves").upsert(
            {
              user_id: session.userId,
              language: String(record.language),
              save_data: normalizedRecord,
              updated_at: nowIso,
            },
            { onConflict: "user_id,language" }
          );
          if (!error) {
            return NextResponse.json({
              success: true,
              record: normalizedRecord,
              source: "supabase",
            });
          }
        } catch (e) {
          console.warn("Supabase save-dungeon-progress notice:", e);
        }
      }

      return NextResponse.json({
        success: true,
        record: normalizedRecord,
        source: "local",
      });
    }

    // 8. บันทึก Custom Dungeon ที่สร้างจากโค้ดของผู้ใช้
    if (action === "save-custom-dungeon") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนบันทึกดันเจี้ยนส่วนตัว" },
          { status: 401 }
        );
      }
      const dungeon = body.dungeon;
      if (!dungeon || typeof dungeon !== "object" || !dungeon.id) {
        return NextResponse.json(
          { error: "ข้อมูลดันเจี้ยนส่วนตัวไม่ถูกต้อง" },
          { status: 400 }
        );
      }

      const nowIso = new Date().toISOString();
      const ownedDungeon = {
        ...dungeon,
        ownerUserId: session.userId,
      };

      if (supabase) {
        try {
          const { error } = await supabase.from("user_custom_dungeons").upsert(
            {
              id: String(dungeon.id),
              user_id: session.userId,
              language: String(dungeon.language || "javascript"),
              dungeon_data: ownedDungeon,
              created_at: dungeon.createdAt || nowIso,
              updated_at: nowIso,
            },
            { onConflict: "user_id,id" }
          );
          if (!error) {
            return NextResponse.json({
              success: true,
              dungeon: ownedDungeon,
              source: "supabase",
            });
          }
        } catch (e) {
          console.warn("Supabase save-custom-dungeon notice:", e);
        }
      }

      return NextResponse.json({
        success: true,
        dungeon: ownedDungeon,
        source: "local",
      });
    }

    // 9. ลบ Custom Dungeon ของผู้ใช้
    if (action === "delete-custom-dungeon") {
      if (!session?.userId) {
        return NextResponse.json(
          { error: "กรุณาเข้าสู่ระบบก่อนลบดันเจี้ยนส่วนตัว" },
          { status: 401 }
        );
      }
      const dungeonId = String(body.dungeonId || "").trim();
      if (!dungeonId) {
        return NextResponse.json(
          { error: "ไม่พบรหัสดันเจี้ยนที่ต้องการลบ" },
          { status: 400 }
        );
      }

      if (supabase) {
        try {
          const { error } = await supabase
            .from("user_custom_dungeons")
            .delete()
            .eq("user_id", session.userId)
            .eq("id", dungeonId);
          if (!error) {
            return NextResponse.json({ success: true, source: "supabase" });
          }
        } catch (e) {
          console.warn("Supabase delete-custom-dungeon notice:", e);
        }
      }

      return NextResponse.json({ success: true, source: "local" });
    }

    return NextResponse.json({ error: "ไม่รู้จักคำสั่ง" }, { status: 400 });
  } catch (err) {
    console.error("POST /api/lms error:", err);
    return NextResponse.json(
      { error: "เกิดข้อผิดพลาดในการบันทึกข้อมูลคอร์ส" },
      { status: 500 }
    );
  }
}
