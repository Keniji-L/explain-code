import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { BlockCellId } from "@/app/lib/curriculum";
import {
  resolveValidBlockCell,
  runClassroomRadarTool,
  runCreateDungeonTool,
  runExplainCodeTool,
  runStudentProfileTool,
} from "@/app/lib/langmind";

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 25;

interface RateBucket {
  count: number;
  resetAt: number;
}

const ipRateBuckets = new Map<string, RateBucket>();

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-langmind-secret",
};

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

function checkRateLimit(ip: string): { allowed: boolean; retryAfterSec: number } {
  const now = Date.now();
  const bucket = ipRateBuckets.get(ip);
  if (!bucket || now > bucket.resetAt) {
    ipRateBuckets.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true, retryAfterSec: 0 };
  }
  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    return {
      allowed: false,
      retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000),
    };
  }
  bucket.count += 1;
  return { allowed: true, retryAfterSec: 0 };
}

function constantTimeEquals(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf8");
  const bufB = Buffer.from(b, "utf8");
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

function verifyToolSecret(req: NextRequest): boolean {
  const expected = process.env.LANGMIND_TOOL_SECRET?.trim();
  if (!expected) return true;

  const headerSecret = req.headers.get("x-langmind-secret")?.trim() || "";
  if (headerSecret && constantTimeEquals(headerSecret, expected)) {
    return true;
  }

  const authHeader = req.headers.get("authorization")?.trim() || "";
  if (authHeader.toLowerCase().startsWith("bearer ")) {
    const token = authHeader.slice(7).trim();
    if (token && constantTimeEquals(token, expected)) {
      return true;
    }
  }
  return false;
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ tool: string }> }
) {
  try {
    if (!verifyToolSecret(req)) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized LangMind Tool caller." },
        { status: 401, headers: CORS_HEADERS }
      );
    }

    const rate = checkRateLimit(getClientIp(req));
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Rate limit exceeded. Retry in ${rate.retryAfterSec}s.`,
          rateLimited: true,
        },
        { status: 429, headers: CORS_HEADERS }
      );
    }

    const { tool } = await context.params;
    let body: Record<string, unknown> = {};
    const rawText = await req.text();
    if (rawText.trim().length > 0) {
      try {
        const parsed = JSON.parse(rawText);
        if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
          return NextResponse.json(
            { ok: false, error: "INVALID_JSON_BODY" },
            { status: 400, headers: CORS_HEADERS }
          );
        }
        body = parsed as Record<string, unknown>;
      } catch {
        return NextResponse.json(
          { ok: false, error: "INVALID_JSON_BODY" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
    }

    const origin =
      process.env.NEXT_PUBLIC_APP_URL?.trim() || req.nextUrl.origin;
    const uiLang: "th" | "en" = body.uiLang === "en" ? "en" : "th";

    if (tool === "student-profile") {
      const result = await runStudentProfileTool({
        studentId:
          typeof body.studentId === "string" ? body.studentId : undefined,
        nickname:
          typeof body.nickname === "string" ? body.nickname : undefined,
        cellScores:
          body.cellScores && typeof body.cellScores === "object"
            ? (body.cellScores as Partial<Record<BlockCellId, number>>)
            : undefined,
      });
      return NextResponse.json(
        { ok: true, tool, result },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    if (tool === "classroom-radar") {
      const result = await runClassroomRadarTool({
        roomCode:
          typeof body.roomCode === "string" ? body.roomCode : undefined,
      });
      return NextResponse.json(
        { ok: true, tool, result },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    if (tool === "create-dungeon") {
      if (typeof body.code === "string" && body.code.length > 12000) {
        return NextResponse.json(
          { ok: false, error: "CODE_TOO_LONG" },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      const result = await runCreateDungeonTool({
        code: typeof body.code === "string" ? body.code : undefined,
        language:
          typeof body.language === "string" ? body.language : "javascript",
        targetCell: resolveValidBlockCell(body.targetCell, "E2"),
        origin,
        uiLang,
      });
      return NextResponse.json(
        { ok: true, tool, result },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    if (tool === "explain-code") {
      const code = typeof body.code === "string" ? body.code : "";
      if (!code.trim()) {
        return NextResponse.json(
          { error: "Parameter 'code' is required." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      if (code.length > 12000) {
        return NextResponse.json(
          { error: "Parameter 'code' exceeds 12,000 characters." },
          { status: 400, headers: CORS_HEADERS }
        );
      }
      const result = await runExplainCodeTool({
        code,
        language: typeof body.language === "string" ? body.language : "auto",
        uiLang,
      });
      return NextResponse.json(
        { ok: true, tool, result },
        { status: 200, headers: CORS_HEADERS }
      );
    }

    return NextResponse.json(
      {
        error: `Unknown LangMind tool: ${tool}`,
        availableTools: [
          "student-profile",
          "classroom-radar",
          "create-dungeon",
          "explain-code",
        ],
      },
      { status: 404, headers: CORS_HEADERS }
    );
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "Failed to execute LangMind tool.";
    return NextResponse.json(
      { error: message },
      { status: 500, headers: CORS_HEADERS }
    );
  }
}
