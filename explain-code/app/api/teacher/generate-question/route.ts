import { NextRequest, NextResponse } from "next/server";
import { getServerUserSession } from "@/app/lib/supabase/server";
import { callGeminiGenerateJson } from "@/app/lib/gemini-client";
import {
  rebalanceChoicesIfNeeded,
  shuffleChoicesPreservingCorrect,
} from "@/app/lib/question-choice-balance";
import {
  BLOCK_MODEL_CELLS,
  BlockCellId,
  BlockCellMeta,
} from "@/app/lib/curriculum";

type MonsterTier = "slime" | "skeleton" | "goblin" | "boss";
type DifficultyTier = "easy" | "medium" | "hard";

interface WeakCellInput {
  cellId: string;
  avgScore: number;
}

interface GenerateQuestionBody {
  mode?: "lesson" | "dungeon";
  courseTitle?: string;
  programmingLanguage?: string;
  lessonTitle?: string;
  lessonContent?: string;
  codeSnippet?: string;
  targetCellId?: BlockCellId | "auto" | string;
  weakestCells?: WeakCellInput[];
  difficulty?: DifficultyTier;
  existingQuestions?: string[];
}

interface GeminiQuestionOutput {
  targetCellId?: string;
  question?: string;
  codeSnippet?: string;
  choices?: string[];
  correctIndex?: number;
  explanation?: string;
  misconceptionReason?: string;
  difficulty?: DifficultyTier;
  recommendedMonster?: MonsterTier;
}

async function requireTeacherSession() {
  const session = await getServerUserSession();
  if (!session) {
    return {
      errorResponse: NextResponse.json(
        { error: "กรุณาเข้าสู่ระบบก่อนใช้งาน" },
        { status: 401 }
      ),
    };
  }

  if (session.role !== "teacher" && session.role !== "admin") {
    return {
      errorResponse: NextResponse.json(
        { error: "สิทธิ์ไม่เพียงพอ (เฉพาะครูผู้สอนเท่านั้น)" },
        { status: 403 }
      ),
    };
  }

  return { session };
}

function resolveTargetCell(
  requestedCellId: string | undefined,
  weakestCells: WeakCellInput[] | undefined,
  codeSnippet: string
): { cell: BlockCellMeta; fromClassroomWeakness: boolean; avgScore?: number } {
  if (requestedCellId && requestedCellId !== "auto") {
    const exact = BLOCK_MODEL_CELLS.find((c) => c.id === requestedCellId);
    if (exact) {
      return { cell: exact, fromClassroomWeakness: false };
    }
  }

  if (Array.isArray(weakestCells) && weakestCells.length > 0) {
    const sorted = [...weakestCells]
      .filter((w) => typeof w?.cellId === "string" && typeof w?.avgScore === "number")
      .sort((a, b) => a.avgScore - b.avgScore);

    for (const item of sorted) {
      const matched = BLOCK_MODEL_CELLS.find((c) => c.id === item.cellId);
      if (matched) {
        return {
          cell: matched,
          fromClassroomWeakness: true,
          avgScore: Math.round(item.avgScore),
        };
      }
    }
  }

  // Fallback heuristic based on code structure
  const hasLoopOrBranch = /\b(for|while|if|else|switch)\b/.test(codeSnippet);
  const hasFunction = /\b(function|def|=>|return)\b/.test(codeSnippet);
  const fallbackId: BlockCellId = hasFunction ? "E3" : hasLoopOrBranch ? "E2" : "E1";
  const fallback =
    BLOCK_MODEL_CELLS.find((c) => c.id === fallbackId) || BLOCK_MODEL_CELLS[1];
  return { cell: fallback, fromClassroomWeakness: false };
}

function normalizeMonster(raw: unknown, difficulty: DifficultyTier): MonsterTier {
  if (raw === "slime" || raw === "skeleton" || raw === "goblin" || raw === "boss") {
    return raw;
  }
  if (difficulty === "hard") return "goblin";
  if (difficulty === "medium") return "skeleton";
  return "slime";
}

function normalizeDifficulty(raw: unknown, fallback: DifficultyTier): DifficultyTier {
  if (raw === "easy" || raw === "medium" || raw === "hard") {
    return raw;
  }
  return fallback;
}

export async function POST(request: NextRequest) {
  const { errorResponse } = await requireTeacherSession();
  if (errorResponse) return errorResponse;

  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return NextResponse.json(
      { error: "ยังไม่ได้ตั้งค่า GEMINI_API_KEY บนเซิร์ฟเวอร์" },
      { status: 503 }
    );
  }

  let body: GenerateQuestionBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "รูปแบบข้อมูลไม่ถูกต้อง" }, { status: 400 });
  }

  const mode = body.mode === "dungeon" ? "dungeon" : "lesson";
  const courseTitle = (body.courseTitle || "").trim();
  const programmingLanguage = (body.programmingLanguage || "javascript").trim();
  const lessonTitle = (body.lessonTitle || "").trim();
  const lessonContent = (body.lessonContent || "").trim();
  const codeSnippet = (body.codeSnippet || "").trim();
  const requestedDifficulty = normalizeDifficulty(body.difficulty, "medium");

  if (!codeSnippet && !lessonContent && !lessonTitle) {
    return NextResponse.json(
      { error: "กรุณาระบุชื่อบทเรียน เนื้อหา หรือโค้ดตัวอย่างก่อนให้ AI สร้างคำถาม" },
      { status: 400 }
    );
  }

  const { cell: targetCell, fromClassroomWeakness, avgScore } = resolveTargetCell(
    body.targetCellId,
    body.weakestCells,
    codeSnippet
  );

  const existingQuestions = Array.isArray(body.existingQuestions)
    ? body.existingQuestions
        .map((q) => String(q).trim())
        .filter(Boolean)
        .slice(0, 6)
    : [];

  const weaknessContext =
    Array.isArray(body.weakestCells) && body.weakestCells.length > 0
      ? body.weakestCells
          .slice(0, 4)
          .map((w) => `${w.cellId} (${Math.round(w.avgScore)}%)`)
          .join(", ")
      : "ยังไม่มีข้อมูลคะแนนเฉลี่ยรายห้อง";

  const prompt = `คุณคือผู้เชี่ยวชาญด้านการออกแบบข้อสอบวิศวกรรมการเขียนโปรแกรม (Computer Science Education) ที่ใช้กรอบทฤษฎี Schulte's Block Model (12 ช่อง) และแนวคิด PRIMM

ภารกิจ:
สร้างคำถาม 1 ข้อสำหรับ "${mode === "dungeon" ? "ด่านต่อสู้มอนสเตอร์ใน Dungeon" : "แบบทดสอบท้ายบทเรียน (Quiz)"}" จากข้อมูลบทเรียนและโค้ดของครูผู้สอน

บริบทคอร์สและบทเรียน:
- คอร์ส: ${courseTitle || "ไม่ระบุ"}
- ภาษาโปรแกรม: ${programmingLanguage}
- บทเรียน: ${lessonTitle || "ไม่ระบุ"}
- เนื้อหาบทเรียน: ${lessonContent ? lessonContent.slice(0, 1200) : "ไม่ได้ระบุ"}
- โค้ดตัวอย่างจากครู:
\`\`\`${programmingLanguage}
${codeSnippet ? codeSnippet.slice(0, 1500) : "// ไม่มีโค้ดตัวอย่าง — หากโหมด dungeon ให้สร้างโค้ดตัวอย่างสั้นๆ ที่ตรงกับบทเรียนให้ด้วย"}
\`\`\`

เป้าหมายทางทฤษฎีการเรียนรู้ (Block Model Target):
- ช่องเป้าหมาย: ${targetCell.id} (${targetCell.shortTitle})
- ระดับความเข้าใจ: ${targetCell.levelName}
- มิติ: ${targetCell.dimensionName}
- นิยาม: ${targetCell.description}
- ตัวอย่างแนวคำถามของช่องนี้: ${targetCell.exampleQuestion}
- จุดอ่อนของห้องเรียนจากสถิติจริง: ${weaknessContext}
- ระดับความยากที่ต้องการ: ${requestedDifficulty}
${existingQuestions.length > 0 ? `- ห้ามตั้งคำถามซ้ำกับข้อเหล่านี้:\n${existingQuestions.map((q, i) => `  ${i + 1}. ${q}`).join("\n")}` : ""}

ข้อกำหนดสำคัญ (เพื่อให้ข้อสอบมีคุณภาพเหนือกว่าการถาม AI ทั่วไป):
1. คำถามต้องวัดทักษะในช่อง Block Model "${targetCell.id}" อย่างแท้จริง ไม่ถามท่องจำไวยากรณ์ลอยๆ
2. สร้างตัวเลือก 4 ข้อ (choices) โดย 1 ข้อถูกต้อง และ 3 ข้อที่ผิดต้องเป็น "ตัวลวงที่อิงจากความเข้าใจผิดที่พบบ่อยของมือใหม่ (Misconception-driven distractors)" เช่น นับรอบลูปขาด/เกิน 1 (off-by-one), ลืมอัปเดตตัวแปร, สลับเงื่อนไข if/else, หรือเข้าใจลำดับการ return ผิด
3. ${mode === "lesson" ? "ตัวเลือกแต่ละข้อต้องสั้น กระชับ อ่านง่าย และหลีกเลี่ยงการใช้เครื่องหมายจุลภาค (,) ภายในข้อความตัวเลือก" : "ตัวเลือกแต่ละข้อสั้น กระชับ ชัดเจน เหมาะกับการกดตอบระหว่างสู้มอนสเตอร์"}
4. **สำคัญมาก — ห้ามเดาคำตอบจากความยาวได้**: ตัวเลือกทั้ง 4 ข้อต้องมีความยาวตัวอักษร โครงสร้างประโยค และระดับความละเอียดใกล้เคียงกันมาก (ต่างกันไม่เกิน ~20%) ห้ามทำให้ข้อที่ถูกต้องยาวที่สุดหรือใส่คำอธิบายขยายความ/วงเล็บเพิ่มเฉพาะข้อที่ถูก ต้องเขียนตัวลวงให้มีรายละเอียดเฉพาะเจาะจงพอๆ กัน และสุ่มตำแหน่ง correctIndex กระจายระหว่าง 0–3 (อย่าไว้ที่ 0 ตลอด)
5. อธิบายเฉลย (explanation) เป็นภาษาไทยที่เชื่อมโยงกับลำดับการทำงานของโค้ดจริง
6. ระบุ misconceptionReason สั้นๆ 1 ประโยค ว่าตัวเลือกที่ผิดดักจับความเข้าใจผิดเรื่องใดของนักเรียน
7. แนะนำมอนสเตอร์ที่เหมาะสม (recommendedMonster):
   - "slime" (ระดับ Atom / ง่าย)
   - "skeleton" (ระดับ Block / ลูปหรือเงื่อนไขปานกลาง)
   - "goblin" (ระดับ Relation / จับบั๊กหรือ trace ค่าข้ามบล็อก)
   - "boss" (ระดับ Macro / ภาพรวมทั้งโปรแกรมหรือยาก)

ตอบกลับเป็น JSON object เท่านั้น (ห้ามมี markdown fence หรือข้อความอื่นนอก JSON):
{
  "targetCellId": "${targetCell.id}",
  "question": "ข้อความคำถามภาษาไทย",
  "codeSnippet": "โค้ดสั้นๆ ที่ใช้อ้างอิงในคำถาม (ใช้โค้ดครูหรือปรับให้กระชับขึ้นได้ ถ้าไม่มีโค้ดให้สร้างสั้นๆ ที่ตรงบทเรียน)",
  "choices": ["ตัวเลือก 1", "ตัวเลือก 2", "ตัวเลือก 3", "ตัวเลือก 4"],
  "correctIndex": 0,
  "explanation": "คำอธิบายเฉลยภาษาไทยตาม Block Model / PRIMM",
  "misconceptionReason": "อธิบายสั้นๆ ว่า 3 ตัวเลือกที่ผิดดักความเข้าใจผิดเรื่องใด",
  "difficulty": "${requestedDifficulty}",
  "recommendedMonster": "skeleton"
}`;

  const result = await callGeminiGenerateJson<GeminiQuestionOutput>({
    apiKey,
    prompt,
    temperature: 0.35,
    timeoutMs: 20000,
  });

  if (!result.ok || !result.data) {
    return NextResponse.json(
      {
        error:
          result.error ||
          "AI ไม่สามารถสร้างคำถามได้ในขณะนี้ กรุณาลองใหม่อีกครั้ง",
      },
      { status: 502 }
    );
  }

  const raw = result.data;
  const rawChoices = Array.isArray(raw.choices)
    ? raw.choices.map((c) => String(c || "").trim()).filter(Boolean)
    : [];

  if (!raw.question?.trim() || rawChoices.length < 2) {
    return NextResponse.json(
      { error: "รูปแบบคำถามที่ AI สร้างไม่สมบูรณ์ กรุณาลองกดสร้างใหม่อีกครั้ง" },
      { status: 502 }
    );
  }

  // Ensure exact 4 choices
  const initialChoices = rawChoices.slice(0, 4);
  while (initialChoices.length < 4) {
    initialChoices.push(`ตัวเลือกที่ ${initialChoices.length + 1}`);
  }

  const initialCorrectIndex =
    typeof raw.correctIndex === "number" && Number.isFinite(raw.correctIndex)
      ? Math.min(3, Math.max(0, Math.round(raw.correctIndex)))
      : 0;

  const questionText = raw.question.trim();
  const rebalanced = await rebalanceChoicesIfNeeded({
    apiKey,
    question: questionText,
    choices: initialChoices,
    correctIndex: initialCorrectIndex,
    uiLang: "th",
    avoidCommas: mode === "lesson",
    timeoutMs: 6000,
  });

  const { choices, correctIndex } = shuffleChoicesPreservingCorrect(
    rebalanced.choices,
    rebalanced.correctIndex
  );

  const finalDifficulty = normalizeDifficulty(raw.difficulty, requestedDifficulty);
  const finalMonster = normalizeMonster(raw.recommendedMonster, finalDifficulty);
  const validatedCellId =
    BLOCK_MODEL_CELLS.find((c) => c.id === raw.targetCellId)?.id || targetCell.id;

  return NextResponse.json({
    ok: true,
    model: result.model,
    targetedFromClassroomWeakness: fromClassroomWeakness,
    weaknessAvgScore: avgScore ?? null,
    generated: {
      targetCellId: validatedCellId,
      targetCellLabel: `${targetCell.id} · ${targetCell.shortTitle}`,
      question: questionText,
      codeSnippet: (raw.codeSnippet || codeSnippet || "").trim(),
      choices,
      correctIndex,
      explanation: (raw.explanation || "").trim(),
      misconceptionReason: (raw.misconceptionReason || "").trim(),
      difficulty: finalDifficulty,
      recommendedMonster: finalMonster,
    },
  });
}
