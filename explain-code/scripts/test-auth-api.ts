import { NextRequest } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

function loadEnvLocal() {
  const envPath = join(__dirname, "../.env.local");
  if (!existsSync(envPath)) return;
  const envContent = readFileSync(envPath, "utf-8");
  for (const rawLine of envContent.split(/\r?\n/)) {
    const trimmed = rawLine.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const idx = trimmed.indexOf("=");
    const key = trimmed.slice(0, idx).trim();
    let val = trimmed.slice(idx + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (key && process.env[key] === undefined) {
      process.env[key] = val;
    }
  }
}

async function runTests() {
  loadEnvLocal();

  // Dynamic import AFTER .env.local is parsed so module-level env reads see populated values
  const { POST } = await import("../app/api/auth/route");
  const { isSupabaseConfigured } = await import("../app/lib/supabase");

  let failures = 0;
  const record = (name: string, passed: boolean, detail?: string) => {
    if (!passed) failures += 1;
    console.log(
      `${name}: ${passed ? "PASS" : "FAIL"}${detail ? ` ${detail}` : ""}`
    );
  };

  console.log("=== STARTING AUTH API INTEGRATION TESTS WITH ENV ===");
  console.log("isSupabaseConfigured():", isSupabaseConfigured());
  console.log("Supabase URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);

  // Test 1: Basic PIN hashing (!action && pin)
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({ pin: "1234" }),
    });
    const res = await POST(req);
    const data = await res.json();
    const passed =
      res.status === 200 &&
      data.pinHash ===
        "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";
    record("Test 1 (!action && pin)", passed);
  }

  // Test 2: PDPA check on student login (no @ allowed)
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "login-student",
        nickname: "user@test.com",
        pin: "1234",
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    const passed =
      res.status === 400 && Boolean(data.error && data.error.includes("PDPA"));
    record("Test 2 (PDPA login @ forbidden)", passed);
  }

  // Test 3: Invalid PIN length (< 4 digits)
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "login-student",
        nickname: "แมวส้ม",
        pin: "12",
      }),
    });
    const res = await POST(req);
    record("Test 3 (Invalid PIN length)", res.status === 400);
  }

  // Test 4: PDPA check on register-student
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "register-student",
        nickname: "bad@email.com",
        pin: "1234",
        roomCode: "ABC123",
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    const passed =
      res.status === 400 && Boolean(data.error && data.error.includes("PDPA"));
    record("Test 4 (PDPA register @ forbidden)", passed);
  }

  // Test 5: Register student with non-existent classroom returns 404
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "register-student",
        nickname: "นักเรียนทดสอบ_" + Date.now(),
        pin: "9999",
        roomCode: "NONEXISTENT999",
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    const passed = res.status === 404 && Boolean(data.error);
    record(
      "Test 5 (Register student non-existent room 404)",
      passed,
      `(status=${res.status})`
    );
  }

  // Test 6: Teacher register with short password
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "register-teacher",
        username: "teacher1",
        password: "123",
      }),
    });
    const res = await POST(req);
    record("Test 6 (Teacher register short pwd 400)", res.status === 400);
  }

  // Test 7: Student login with valid credentials (and no leaked pinHash)
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "login-student",
        nickname: "แมวส้ม",
        pin: "1234",
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    const noLeakedHash =
      !data.pinHash && (!data.student?.pinHash || data.student.pinHash === "");
    const expectedSource = isSupabaseConfigured() ? data.source === "supabase" : true;
    const passed =
      res.status === 200 &&
      data.authenticated === true &&
      expectedSource &&
      noLeakedHash;
    record("Test 7 (Student login)", passed, `(source=${data.source})`);
  }

  // Test 8: Teacher login with valid credentials
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "login-teacher",
        username: "ครูตัวอย่าง",
        password: "12345678",
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    const expectedSource = isSupabaseConfigured() ? data.source === "supabase" : true;
    const noLeakedPasswordHash = !data.passwordHash;
    const passed =
      res.status === 200 &&
      data.authenticated === true &&
      expectedSource &&
      noLeakedPasswordHash;
    record("Test 8 (Teacher login)", passed, `(source=${data.source})`);
  }

  // Test 9: unified-login rejects client-supplied localTeachers/localStudents forgery
  {
    const req = new NextRequest("http://localhost:3000/api/auth", {
      method: "POST",
      body: JSON.stringify({
        action: "unified-login",
        identifier: "forged_teacher_account",
        secret: "anything",
        localTeachers: [
          {
            id: "00000000-0000-4000-8000-000000000001",
            username: "forged_teacher_account",
            displayName: "Attacker",
            passwordHash: "",
          },
        ],
      }),
    });
    const res = await POST(req);
    const data = await res.json();
    const setCookieHeader = res.headers.get("set-cookie");
    const passed =
      (res.status === 401 || res.status === 404) &&
      !data.authenticated &&
      !setCookieHeader;
    record(
      "Test 9 (Reject unified-login localTeachers forgery)",
      passed,
      `(status=${res.status})`
    );
  }

  if (failures > 0) {
    console.error(`=== ${failures} TEST(S) FAILED ===`);
    process.exit(1);
  }

  console.log("=== ALL INTEGRATION TESTS PASSED SUCCESSFULLY! ===");
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
