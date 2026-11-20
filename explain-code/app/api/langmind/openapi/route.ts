import { NextRequest, NextResponse } from "next/server";
import { buildLangMindOpenApiSpec } from "@/app/lib/langmind";

const CORS_HEADERS: Record<string, string> = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, x-langmind-secret",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

export async function GET(req: NextRequest) {
  const configuredOrigin = process.env.NEXT_PUBLIC_APP_URL?.trim();
  const origin = configuredOrigin || req.nextUrl.origin;
  const spec = buildLangMindOpenApiSpec(origin);

  return NextResponse.json(spec, {
    status: 200,
    headers: {
      ...CORS_HEADERS,
      "Cache-Control": "public, max-age=60",
    },
  });
}
