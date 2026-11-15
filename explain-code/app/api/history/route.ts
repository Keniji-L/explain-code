import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/app/lib/supabase";
import { getServerUserSession } from "@/app/lib/supabase/server";

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * GET /api/history
 * ดึงประวัติการอธิบายโค้ดของผู้ใช้ที่ล็อกอินอยู่
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerUserSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบเพื่อดูประวัติการอธิบายโค้ด" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const requestedUserId = (searchParams.get("userId") || "").trim();
    let targetUserId = session.userId;

    if (requestedUserId && requestedUserId !== session.userId) {
      if (session.role === "admin") {
        targetUserId = requestedUserId;
      } else if (session.role === "teacher") {
        let ownsStudent = false;
        if (
          isSupabaseConfigured() &&
          UUID_REGEX.test(requestedUserId) &&
          UUID_REGEX.test(session.userId)
        ) {
          const supabase = getSupabaseAdmin();
          if (supabase) {
            const { data: stu } = await supabase
              .from("students")
              .select("classroom_id")
              .eq("id", requestedUserId)
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
        }
        if (!ownsStudent) {
          return NextResponse.json(
            { error: "ไม่มีสิทธิ์เข้าถึงประวัติของผู้ใช้อื่น" },
            { status: 403 }
          );
        }
        targetUserId = requestedUserId;
      } else {
        return NextResponse.json(
          { error: "ไม่มีสิทธิ์เข้าถึงประวัติของผู้ใช้อื่น" },
          { status: 403 }
        );
      }
    }

    if (isSupabaseConfigured() && UUID_REGEX.test(targetUserId)) {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          const { data, error } = await supabase
            .from("code_explanations")
            .select("*")
            .eq("user_id", targetUserId)
            .order("created_at", { ascending: false })
            .limit(50);

          if (!error && data) {
            return NextResponse.json({
              success: true,
              source: "supabase",
              items: data,
            });
          }
        }
      } catch (e) {
        console.warn("GET /api/history supabase notice:", e);
      }
    }

    return NextResponse.json({
      success: true,
      source: "local",
      items: [],
    });
  } catch (err) {
    console.error("GET /api/history error:", err);
    return NextResponse.json(
      { error: "ไม่สามารถโหลดประวัติได้" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/history?id=...
 * ลบรายการประวัติการอธิบายโค้ดของผู้ใช้
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerUserSession();
    if (!session?.userId) {
      return NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนลบประวัติ" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = (searchParams.get("id") || "").trim();
    const requestedUserId = (searchParams.get("userId") || "").trim();

    if (
      requestedUserId &&
      requestedUserId !== session.userId &&
      session.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "ไม่มีสิทธิ์ลบประวัติของผู้ใช้อื่น" },
        { status: 403 }
      );
    }

    const targetUserId =
      session.role === "admin" && requestedUserId
        ? requestedUserId
        : session.userId;

    if (!id) {
      return NextResponse.json(
        { error: "ข้อมูลไม่ครบถ้วน: ต้องระบุ id รายการที่ต้องการลบ" },
        { status: 400 }
      );
    }

    if (
      isSupabaseConfigured() &&
      UUID_REGEX.test(targetUserId) &&
      UUID_REGEX.test(id)
    ) {
      try {
        const supabase = getSupabaseAdmin();
        if (supabase) {
          await supabase
            .from("code_explanations")
            .delete()
            .eq("id", id)
            .eq("user_id", targetUserId);
        }
      } catch (e) {
        console.warn("DELETE /api/history supabase notice:", e);
      }
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (err) {
    console.error("DELETE /api/history error:", err);
    return NextResponse.json(
      { error: "ไม่สามารถลบประวัติได้" },
      { status: 500 }
    );
  }
}
