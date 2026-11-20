import {
  BLOCK_MODEL_CELLS,
  BlockCellId,
  DEMO_BASELINE_CELL_SCORES,
  INITIAL_CLASSROOMS,
  INITIAL_STUDENTS,
} from "./curriculum";
import {
  CustomDungeonPayload,
  encodeCustomDungeonShareToken,
  normalizeLearningLanguage,
} from "./custom-dungeon";
import { generateCustomDungeonFromCode } from "./dungeon/to-dungeon-questions";
import { explainCodeSnippet } from "./explain-code";
import { LearningLanguage } from "./language-tracks";
import { getSupabaseAdmin, isSupabaseConfigured } from "./supabase";

export type LangMindRole = "student" | "teacher";

export type LangMindSafetyStatus =
  | "passed"
  | "socratic_redirect"
  | "blocked_injection";

export interface LangMindSafetyCheck {
  status: LangMindSafetyStatus;
  policyApplied: string;
  reason: string;
}

export interface LangMindCitation {
  source: string;
  section: string;
  snippet: string;
}

export interface LangMindToolCallLog {
  tool: string;
  endpoint: string;
  status: "ok" | "error";
  durationMs: number;
  summary: string;
}

export interface LangMindGeneratedDungeon {
  title: string;
  language: LearningLanguage;
  targetCell: BlockCellId;
  summary: string;
  questionCount: number;
  shareToken: string;
  playPath: string;
  playUrl: string;
}

export interface LangMindAttachmentPayload {
  name: string;
  mimeType: string;
  textContent?: string;
  base64Data?: string;
  sizeBytes?: number;
}

export interface LangMindChatResponse {
  ok: true;
  mode: "live-langmind" | "preview-sandbox";
  reply: string;
  safetyCheck: LangMindSafetyCheck;
  citations: LangMindCitation[];
  toolCalls: LangMindToolCallLog[];
  generatedDungeon?: LangMindGeneratedDungeon | null;
  recommendedTopicId?: number;
  weakestCell?: BlockCellId;
}

export interface CellRemedialEntry {
  cellId: BlockCellId;
  level: number;
  dimension: "T" | "E" | "F";
  titleTh: string;
  titleEn: string;
  diagnosisTh: string;
  recommendedPrimmStep: "Predict" | "Run" | "Investigate" | "Modify" | "Make";
  targetTopicId: number;
  teacherIntervention15m: string;
  remedialCodeJs: string;
}

export const DEFAULT_LANGMIND_AGENT_ID =
  "f2bad4ec-9dcb-44f7-946b-00b88dd4c73c";
export const DEFAULT_LANGMIND_PUBLIC_CHAT_API =
  "https://langmind.in.th/api/public/chat/message";
export const DEFAULT_LANGMIND_PUBLIC_CHAT_PAGE =
  "https://langmind.in.th/public/agents/f2bad4ec-9dcb-44f7-946b-00b88dd4c73c/chat";

const ALL_CELL_IDS: readonly BlockCellId[] = [
  "T1",
  "E1",
  "F1",
  "T2",
  "E2",
  "F2",
  "T3",
  "E3",
  "F3",
  "T4",
  "E4",
  "F4",
];

const REMEDIAL_CODE_BY_CELL: Record<BlockCellId, string> = {
  T1: `let price = 120;\nconst discountRate = 0.15;\nprice = price - price * discountRate;\nconsole.log("Final price:", price);`,
  E1: `let score = 40;\nscore += 15;\nscore = score * 2;\nconsole.log("Updated score:", score);`,
  F1: `let passedCount = 0;\nconst scores = [55, 72, 88];\nfor (const s of scores) {\n  if (s >= 60) passedCount += 1;\n}\nconsole.log(passedCount);`,
  T2: `for (let i = 1; i <= 4; i++) {\n  if (i % 2 === 0) {\n    console.log("Even step:", i);\n  }\n}`,
  E2: `let total = 0;\nlet round = 1;\nwhile (round <= 3) {\n  total += round * 10;\n  round += 1;\n}\nconsole.log("Loop total:", total);`,
  F2: `const prices = [120, 260, 80];\nlet filteredSum = 0;\nfor (const p of prices) {\n  if (p >= 100) filteredSum += p;\n}\nconsole.log(filteredSum);`,
  T3: `function calcTax(amount, rate) {\n  return amount * rate;\n}\nconst tax = calcTax(500, 0.07);\nconsole.log(tax);`,
  E3: `function applyBonus(base, bonus) {\n  return base + bonus;\n}\nlet hp = 50;\nhp = applyBonus(hp, 25);\nconsole.log(hp);`,
  F3: `function getPassing(items) {\n  return items.filter((n) => n >= 60);\n}\nconst passed = getPassing([45, 78, 91]);\nconsole.log(passed.length);`,
  T4: `function readItems(list) { return list.length; }\nfunction runReport(list) {\n  const count = readItems(list);\n  return "Total items: " + count;\n}\nconsole.log(runReport(["A", "B", "C"]));`,
  E4: `let points = 100;\nfor (let step = 1; step <= 3; step++) {\n  if (step === 2) continue;\n  points -= 20;\n}\nconsole.log("End output:", points);`,
  F4: `// AI Bug Hunt: Intended to return max score, check comparison sign!\nfunction findMaxScore(scores) {\n  let maxVal = scores[0];\n  for (let i = 1; i < scores.length; i++) {\n    if (scores[i] > maxVal) maxVal = scores[i];\n  }\n  return maxVal;\n}\nconsole.log(findMaxScore([45, 88, 72]));`,
};

const PRIMM_STEP_BY_CELL: Record<
  BlockCellId,
  "Predict" | "Run" | "Investigate" | "Modify" | "Make"
> = {
  T1: "Investigate",
  E1: "Predict",
  F1: "Investigate",
  T2: "Investigate",
  E2: "Predict",
  F2: "Modify",
  T3: "Investigate",
  E3: "Predict",
  F3: "Modify",
  T4: "Investigate",
  E4: "Run",
  F4: "Modify",
};

export const BLOCK_CELL_REMEDIAL_MAP: Record<BlockCellId, CellRemedialEntry> =
  Object.fromEntries(
    BLOCK_MODEL_CELLS.map((meta) => [
      meta.id,
      {
        cellId: meta.id,
        level: meta.level,
        dimension: meta.dimension,
        titleTh: meta.shortTitle,
        titleEn: meta.shortTitleEn || meta.shortTitle,
        diagnosisTh: meta.description,
        recommendedPrimmStep: PRIMM_STEP_BY_CELL[meta.id] || "Predict",
        targetTopicId: meta.relatedTopicId,
        teacherIntervention15m: `ใช้กิจกรรม PRIMM (${PRIMM_STEP_BY_CELL[meta.id] || "Predict"}) 15 นาที: ให้นักเรียนทายผลก่อนรันในด่าน Topic ${meta.relatedTopicId} (${meta.shortTitle}) แล้วอภิปรายเฉพาะจุด ${meta.id}`,
        remedialCodeJs: REMEDIAL_CODE_BY_CELL[meta.id] || REMEDIAL_CODE_BY_CELL.E2,
      },
    ])
  ) as Record<BlockCellId, CellRemedialEntry>;

export function isValidBlockCell(cell: unknown): cell is BlockCellId {
  if (typeof cell !== "string") return false;
  const upper = cell.trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(BLOCK_CELL_REMEDIAL_MAP, upper);
}

export function resolveValidBlockCell(
  cell: unknown,
  fallback: BlockCellId = "E2"
): BlockCellId {
  if (typeof cell === "string") {
    const upper = cell.trim().toUpperCase();
    if (Object.prototype.hasOwnProperty.call(BLOCK_CELL_REMEDIAL_MAP, upper)) {
      return upper as BlockCellId;
    }
  }
  return fallback;
}

export function getRemedialCodeForLanguage(
  cellId: BlockCellId,
  lang: LearningLanguage
): string {
  const safeCell = resolveValidBlockCell(cellId, "E2");
  if (lang === "python") {
    const pyByCell: Partial<Record<BlockCellId, string>> = {
      T1: `price = 120\nqty = 2\ndiscount = 30\nnet = price * qty - discount\nprint(net)`,
      E1: `score = 40\nscore += 15\nscore = score * 2\nprint(score)`,
      T2: `temp = 32\nif temp >= 38:\n    print("Hot")\nelif temp >= 30:\n    print("Warm")\nelse:\n    print("Cool")`,
      E2: `total = 0\nfor i in range(1, 4):\n    total += i * 10\nprint(total)`,
      E3: `def calc_damage(atk, armor):\n    dmg = atk - armor\n    if dmg < 0:\n        return 0\n    return dmg\n\nprint(calc_damage(45, 20))`,
    };
    return pyByCell[safeCell] || pyByCell.E2!;
  }
  if (lang === "typescript") {
    return `let total: number = 0;\nfor (let round: number = 1; round <= 3; round++) {\n  total += round * 10;\n}\nconsole.log("Loop total:", total);`;
  }
  if (lang === "java") {
    return `int total = 0;\nfor (int i = 1; i <= 3; i++) {\n  total += i * 10;\n}\nSystem.out.println(total);`;
  }
  if (lang === "cpp") {
    return `int total = 0;\nfor (int i = 1; i <= 3; i++) {\n  total += i * 10;\n}\nstd::cout << total << std::endl;`;
  }
  if (lang === "sql") {
    return `SELECT name, price\nFROM products\nWHERE price >= 500\nORDER BY price DESC;`;
  }
  if (lang === "html") {
    return `<div class="quest-card">\n  <h2>Remedial Quest ${safeCell}</h2>\n  <p>Inspect structure and attributes</p>\n</div>`;
  }
  return BLOCK_CELL_REMEDIAL_MAP[safeCell].remedialCodeJs;
}

export function encodeDungeonShareTokenServer(
  dungeon: CustomDungeonPayload
): string {
  return encodeCustomDungeonShareToken(dungeon);
}

export function evaluatePromptSafetyHarness(
  message: string,
  role: LangMindRole
): LangMindSafetyCheck {
  const lower = message.toLowerCase();

  const injectionPatterns = [
    "ลืมคำสั่งเดิม",
    "ไม่ต้องทำตามกติกา",
    "เพิกเฉยคำสั่ง",
    "ignore previous",
    "ignore all instructions",
    "system prompt",
    "reveal your prompt",
    "jailbreak",
    "act as developer",
    "override rules",
    "dan mode",
  ];

  for (const pat of injectionPatterns) {
    if (lower.includes(pat)) {
      return {
        status: "blocked_injection",
        policyApplied: "LangMind Trust & Safety Harness + Anti-Injection Policy",
        reason: `ตรวจพบรูปแบบคำสั่งแอบแฝง (Prompt Injection: "${pat}") ระบบจึงระงับการเปิดเผย System Policy และคงขอบเขตผู้ช่วยการเรียนรู้ไว้อย่างปลอดภัย`,
      };
    }
  }

  const bypassMatch = message.match(
    /bypass\s+(?:safety|guard|rule|rules|system|instruction|instructions|filter|policy|prompt)/i
  );
  if (bypassMatch) {
    return {
      status: "blocked_injection",
      policyApplied: "LangMind Trust & Safety Harness + Anti-Injection Policy",
      reason: `ตรวจพบรูปแบบคำสั่งแอบแฝง (Prompt Injection: "${bypassMatch[0]}") ระบบจึงระงับการเปิดเผย System Policy และคงขอบเขตผู้ช่วยการเรียนรู้ไว้อย่างปลอดภัย`,
    };
  }

  if (role === "student") {
    const directAnswerPatterns = [
      "บอกเฉลย",
      "เฉลยมาเลย",
      "ขอคำตอบตรง",
      "ตอบข้อไหน",
      "ตอบข้อ 1",
      "เฉลยข้อสอบ",
      "give me the direct answer",
      "just tell me the answer",
      "tell me which option",
    ];
    for (const pat of directAnswerPatterns) {
      if (lower.includes(pat)) {
        return {
          status: "socratic_redirect",
          policyApplied: "Anti-Cheating Socratic Guard (02_primm_socratic_pedagogy_th.md)",
          reason: `ตรวจพบคำขอคำตอบโดยตรง ("${pat}") เปลี่ยนเป็นการใบ้แบบ Socratic + PRIMM เพื่อให้นักเรียนฝึกคิดและไล่โค้ดด้วยตนเอง`,
        };
      }
    }
  }

  return {
    status: "passed",
    policyApplied: "Standard Grounded RAG + Tool Runtime Policy",
    reason: "ข้อความปลอดภัยและอยู่ในขอบเขตการเรียนรู้ Code Cool",
  };
}

export interface StudentProfileToolResult {
  source: "supabase" | "client-context" | "demo-fallback";
  nickname: string;
  averageMastery: number;
  strongestCell: { cellId: BlockCellId; score: number; titleTh: string };
  weakestCells: Array<{
    cellId: BlockCellId;
    score: number;
    titleTh: string;
    recommendedPrimmStep: string;
    targetTopicId: number;
  }>;
  cellScores: Record<BlockCellId, number>;
  recommendedTopicId: number;
  citation: LangMindCitation;
}

function normalizeCellScoresMap(
  raw?: Partial<Record<BlockCellId, number>> | null
): Record<BlockCellId, number> {
  const result = {} as Record<BlockCellId, number>;
  for (const id of ALL_CELL_IDS) {
    const val = raw?.[id];
    result[id] =
      typeof val === "number" && Number.isFinite(val)
        ? Math.max(0, Math.min(100, Math.round(val)))
        : 0;
  }
  return result;
}

export async function runStudentProfileTool(input: {
  studentId?: string;
  nickname?: string;
  cellScores?: Partial<Record<BlockCellId, number>>;
}): Promise<StudentProfileToolResult> {
  let source: "supabase" | "client-context" | "demo-fallback" = "demo-fallback";
  let nickname = input.nickname?.trim() || "ต้นกล้า_สายโค้ด";
  let scores: Record<BlockCellId, number> | null = null;

  const hasClientScores =
    input.cellScores &&
    Object.values(input.cellScores).some((v) => typeof v === "number" && v > 0);

  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

  if (isSupabaseConfigured() && (input.studentId || input.nickname)) {
    try {
      const admin = getSupabaseAdmin();
      if (admin) {
        let studentRow: { id: string; nickname: string } | null = null;
        if (input.studentId && uuidRegex.test(input.studentId.trim())) {
          const { data } = await admin
            .from("students")
            .select("id, nickname")
            .eq("id", input.studentId.trim())
            .maybeSingle();
          if (data) studentRow = data;
        } else if (input.nickname?.trim()) {
          const { data } = await admin
            .from("students")
            .select("id, nickname")
            .ilike("nickname", input.nickname.trim())
            .limit(1)
            .maybeSingle();
          if (data) studentRow = data;
        }

        if (studentRow) {
          nickname = studentRow.nickname;
          const { data: attempts } = await admin
            .from("attempts")
            .select("id")
            .eq("student_id", studentRow.id)
            .order("created_at", { ascending: false })
            .limit(25);

          if (attempts && attempts.length > 0) {
            const { data: cellRows } = await admin
              .from("attempt_cell_scores")
              .select("cell_id, score")
              .in(
                "attempt_id",
                attempts.map((a) => a.id)
              );

            if (cellRows && cellRows.length > 0) {
              const sums: Record<string, { total: number; count: number }> = {};
              for (const row of cellRows) {
                const cid = String(row.cell_id || "").toUpperCase();
                if (!ALL_CELL_IDS.includes(cid as BlockCellId)) continue;
                sums[cid] = sums[cid] || { total: 0, count: 0 };
                sums[cid].total += Number(row.score) || 0;
                sums[cid].count += 1;
              }
              const computed: Partial<Record<BlockCellId, number>> = {};
              for (const id of ALL_CELL_IDS) {
                if (sums[id]) {
                  computed[id] = Math.round(sums[id].total / sums[id].count);
                }
              }
              if (Object.keys(computed).length > 0) {
                scores = normalizeCellScoresMap(computed);
                source = "supabase";
              }
            }
          }
        }
      }
    } catch {
      // Fallback cleanly to client context or seeded demo record
    }
  }

  if (!scores && hasClientScores) {
    scores = normalizeCellScoresMap(input.cellScores);
    source = "client-context";
  }

  if (!scores) {
    const seededStudent =
      INITIAL_STUDENTS.find(
        (s) => s.nickname.toLowerCase() === nickname.toLowerCase()
      ) || INITIAL_STUDENTS[0];
    nickname = input.nickname?.trim() || seededStudent.nickname;
    scores = normalizeCellScoresMap(DEMO_BASELINE_CELL_SCORES);
    source = "demo-fallback";
  }

  const ranked = ALL_CELL_IDS.map((cellId) => ({
    cellId,
    score: scores![cellId],
    meta: BLOCK_CELL_REMEDIAL_MAP[cellId],
  }));

  const asc = [...ranked].sort((a, b) => a.score - b.score);
  const desc = [...ranked].sort((a, b) => b.score - a.score);
  const averageMastery = Math.round(
    ranked.reduce((sum, item) => sum + item.score, 0) / ranked.length
  );

  return {
    source,
    nickname,
    averageMastery,
    strongestCell: {
      cellId: desc[0].cellId,
      score: desc[0].score,
      titleTh: desc[0].meta.titleTh,
    },
    weakestCells: asc.slice(0, 3).map((item) => ({
      cellId: item.cellId,
      score: item.score,
      titleTh: item.meta.titleTh,
      recommendedPrimmStep: item.meta.recommendedPrimmStep,
      targetTopicId: item.meta.targetTopicId,
    })),
    cellScores: scores,
    recommendedTopicId: asc[0].meta.targetTopicId,
    citation: {
      source: "04_remedial_rubric_table.xlsx",
      section: `Row ${asc[0].cellId}`,
      snippet: `${asc[0].cellId} (${asc[0].meta.titleTh}) · PRIMM Step: ${asc[0].meta.recommendedPrimmStep} · Topic ${asc[0].meta.targetTopicId}`,
    },
  };
}

export interface ClassroomRadarToolResult {
  source: "supabase" | "demo-fallback";
  roomCode: string;
  roomName: string;
  studentCount: number;
  cellAverages: Record<BlockCellId, number>;
  weakestCells: Array<{
    cellId: BlockCellId;
    avgScore: number;
    titleTh: string;
    recommendedPrimmStep: string;
    targetTopicId: number;
    intervention15m: string;
  }>;
  lessonPlanSummary: string;
  citation: LangMindCitation;
}

export async function runClassroomRadarTool(input: {
  roomCode?: string;
}): Promise<ClassroomRadarToolResult> {
  const requestedCode = (input.roomCode || "JS2026").trim().toUpperCase();
  let source: "supabase" | "demo-fallback" = "demo-fallback";
  let roomName = "ชมรม Vibe Coding รู้เท่าทัน AI";
  let studentCount = 0;
  let cellAverages: Record<BlockCellId, number> | null = null;

  if (isSupabaseConfigured()) {
    try {
      const admin = getSupabaseAdmin();
      if (admin) {
        const { data: room } = await admin
          .from("classrooms")
          .select("id, room_code, room_name")
          .eq("room_code", requestedCode)
          .maybeSingle();

        if (room) {
          roomName = room.room_name;
          const [stuRes, avgRes] = await Promise.all([
            admin
              .from("students")
              .select("id")
              .eq("classroom_id", room.id),
            admin
              .from("classroom_cell_avg")
              .select("cell_id, avg_score")
              .eq("classroom_id", room.id),
          ]);
          studentCount = stuRes.data?.length || 0;
          if (avgRes.data && avgRes.data.length > 0) {
            const partial: Partial<Record<BlockCellId, number>> = {};
            for (const row of avgRes.data) {
              const cid = String(row.cell_id || "").toUpperCase() as BlockCellId;
              if (ALL_CELL_IDS.includes(cid)) {
                partial[cid] = Math.round(Number(row.avg_score) || 0);
              }
            }
            cellAverages = normalizeCellScoresMap(partial);
            source = "supabase";
          }
        }
      }
    } catch {
      // Fallback cleanly to demo curriculum dataset
    }
  }

  if (!cellAverages) {
    const matchedRoom =
      INITIAL_CLASSROOMS.find((c) => c.roomCode === requestedCode) ||
      INITIAL_CLASSROOMS[0];
    roomName = matchedRoom.roomName;
    const roomStudents = INITIAL_STUDENTS.filter(
      (s) => s.roomCode === matchedRoom.roomCode
    );
    const samplePool = roomStudents.length > 0 ? roomStudents : INITIAL_STUDENTS;
    studentCount = samplePool.length;
    const computed: Partial<Record<BlockCellId, number>> = {};
    for (const id of ALL_CELL_IDS) {
      const avg =
        samplePool.reduce((sum, st) => sum + (st.cellScores[id] ?? 65), 0) /
        Math.max(1, samplePool.length);
      computed[id] = Math.round(avg);
    }
    // Highlight E2/E3 as actionable instructional gaps in demo classrooms if uniform
    if ((computed.E2 ?? 100) > 65) computed.E2 = 48;
    if ((computed.E3 ?? 100) > 68) computed.E3 = 56;
    cellAverages = normalizeCellScoresMap(computed);
  }

  const rankedAsc = ALL_CELL_IDS.map((cellId) => ({
    cellId,
    avgScore: cellAverages![cellId],
    meta: BLOCK_CELL_REMEDIAL_MAP[cellId],
  })).sort((a, b) => a.avgScore - b.avgScore);

  const topWeak = rankedAsc.slice(0, 3).map((item) => ({
    cellId: item.cellId,
    avgScore: item.avgScore,
    titleTh: item.meta.titleTh,
    recommendedPrimmStep: item.meta.recommendedPrimmStep,
    targetTopicId: item.meta.targetTopicId,
    intervention15m: item.meta.teacherIntervention15m,
  }));

  const primary = topWeak[0];
  const lessonPlanSummary =
    `แผนซ่อมเสริม 15 นาที สำหรับห้อง ${requestedCode} (${roomName}): ` +
    `โฟกัสจุดอ่อนอันดับ 1 คือ ${primary.cellId} (${primary.titleTh}, เฉลี่ย ${primary.avgScore}%) ` +
    `ใช้ขั้น ${primary.recommendedPrimmStep} ใน Topic ${primary.targetTopicId} โดยให้นักเรียนทายผลลัพธ์ก่อนรันโค้ด แล้วต่อยอดด้วยการประลอง Custom Dungeon ซ่อมเสริม`;

  return {
    source,
    roomCode: requestedCode,
    roomName,
    studentCount,
    cellAverages,
    weakestCells: topWeak,
    lessonPlanSummary,
    citation: {
      source: "01_block_model_12_cells_th.md",
      section: `Cell ${primary.cellId} · ${primary.titleTh}`,
      snippet: `${primary.cellId}: ${primary.intervention15m}`,
    },
  };
}

export async function runCreateDungeonTool(input: {
  code?: string;
  language?: string;
  targetCell?: BlockCellId | string;
  origin: string;
  uiLang?: "th" | "en";
}): Promise<LangMindGeneratedDungeon> {
  const cellId: BlockCellId = resolveValidBlockCell(input.targetCell, "E2");
  const lang = normalizeLearningLanguage(input.language || "javascript");
  const code =
    input.code && input.code.trim().length > 10
      ? input.code.trim()
      : getRemedialCodeForLanguage(cellId, lang);

  const dungeon = await generateCustomDungeonFromCode({
    code,
    language: lang,
    uiLang: input.uiLang || "th",
    explanation: null,
  });

  const cellTitle = BLOCK_CELL_REMEDIAL_MAP[cellId].titleTh;
  const titledDungeon: CustomDungeonPayload = {
    ...dungeon,
    title: input.code?.trim()
      ? dungeon.title
      : `ด่านซ่อมจุดอ่อน ${cellId}: ${cellTitle}`,
    subtitle: `LangMind Remedial Quest · โฟกัส ${cellId} (${cellTitle})`,
  };

  const shareToken = encodeDungeonShareTokenServer(titledDungeon);
  const playPath = `/courses?lang=${encodeURIComponent(lang)}&shareDungeon=${encodeURIComponent(shareToken)}`;
  const normalizedOrigin = input.origin.replace(/\/+$/, "");

  return {
    title: titledDungeon.title,
    language: lang,
    targetCell: cellId,
    summary: titledDungeon.summary,
    questionCount: titledDungeon.questions.length,
    shareToken,
    playPath,
    playUrl: `${normalizedOrigin}${playPath}`,
  };
}

export async function runExplainCodeTool(input: {
  code: string;
  language?: string;
  uiLang?: "th" | "en";
}) {
  const explained = await explainCodeSnippet({
    code: input.code,
    language: input.language || "auto",
    uiLang: input.uiLang || "th",
  });
  return explained;
}

export function buildLangMindOpenApiSpec(serverOrigin: string) {
  const baseUrl = serverOrigin.replace(/\/+$/, "");
  return {
    openapi: "3.0.3",
    info: {
      title: "CODE COOL × LangMind OpenAPI Tool Runtime",
      version: "1.0.0",
      description:
        "Executable OpenAPI 3.0 tools enabling NECTEC LangMind AI Agents to query 12-Cell Block Model telemetry, analyze classroom gaps, explain multi-language code, and mint playable RPG Remedial Dungeons (CD1 Share Links).",
    },
    servers: [
      {
        url: baseUrl,
        description: "CODE COOL Production / Preview Server",
      },
    ],
    components: {
      securitySchemes: {
        ApiKeyAuth: {
          type: "apiKey",
          in: "header",
          name: "x-langmind-secret",
          description:
            "Optional shared secret configured via LANGMIND_TOOL_SECRET environment variable.",
        },
      },
    },
    paths: {
      "/api/langmind/tools/student-profile": {
        post: {
          operationId: "getStudentBlockModelProfile",
          summary:
            "ดึงคะแนน Block Model 12 มิติ (T1-F4) และจุดอ่อนของนักเรียนรายบุคคล",
          description:
            "Queries the learner's 12-cell Block Model mastery scores, computes the top 3 weakest cells, and returns recommended PRIMM remediation steps.",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    studentId: { type: "string", description: "Optional student UUID" },
                    nickname: {
                      type: "string",
                      description: "Student nickname (e.g. ต้นกล้า_สายโค้ด)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "12-cell diagnostic profile and weakest Block Model cells",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      "/api/langmind/tools/classroom-radar": {
        post: {
          operationId: "getClassroomRadarAnalysis",
          summary:
            "วิเคราะห์จุดอ่อน 12 มิติระดับห้องเรียน (Classroom Radar) และจัดทำแผนสอน PRIMM 15 นาที",
          description:
            "Aggregates 12-cell Block Model scores across a classroom by roomCode and prescribes a 15-minute PRIMM instructional plan.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["roomCode"],
                  properties: {
                    roomCode: {
                      type: "string",
                      example: "JS2026",
                      description: "6-character classroom code (e.g. VIBE26, JS2026)",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Classroom Block Model radar summary and 15-minute intervention plan",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      "/api/langmind/tools/create-dungeon": {
        post: {
          operationId: "createRemedialDungeonLink",
          summary:
            "สร้างด่านเกม RPG Custom Dungeon เพื่อซ่อมเสริมจุดอ่อนและคืนลิงก์แชร์ CD1",
          description:
            "Generates a playable 3-phase Code Cool RPG dungeon targeting a specific Block Model cell or custom code snippet, returning a ready-to-share CD1 token and URL.",
          requestBody: {
            required: false,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    targetCell: {
                      type: "string",
                      enum: [...ALL_CELL_IDS],
                      default: "E2",
                      description: "Target Block Model cell (e.g. E2, E3, F4)",
                    },
                    language: {
                      type: "string",
                      default: "javascript",
                      description:
                        "javascript | python | typescript | java | cpp | sql | html",
                    },
                    code: {
                      type: "string",
                      description: "Optional code snippet to transform into dungeon battles",
                    },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Playable CD1 share token and URL for the newly generated dungeon",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
      "/api/langmind/tools/explain-code": {
        post: {
          operationId: "explainCodeAndDetectPitfalls",
          summary:
            "วิเคราะห์โค้ดทีละบรรทัด ตรวจจับจุดเสี่ยง AI Hallucination และสรุปแนวคิด",
          description:
            "Analyzes code across 7 languages, returning line-by-line explanations, execution flow, and potential AI bugs/pitfalls.",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["code"],
                  properties: {
                    code: { type: "string", description: "Source code snippet to inspect" },
                    language: { type: "string", default: "auto" },
                  },
                },
              },
            },
          },
          responses: {
            "200": {
              description: "Line-by-line analysis and potential AI code pitfalls",
              content: {
                "application/json": {
                  schema: { type: "object" },
                },
              },
            },
          },
        },
      },
    },
  };
}

function mapLangMindCitations(rawList: unknown[]): LangMindCitation[] {
  return rawList.slice(0, 4).map((item) => {
    if (typeof item === "string") {
      return {
        source: item,
        section: "LangMind RAG",
        snippet: item,
      };
    }
    const rec = (item || {}) as Record<string, unknown>;
    const score = typeof rec.score === "number" ? rec.score : null;
    const sourceName = String(
      rec.document_name || rec.source || rec.title || rec.file || "LangMind KB"
    );
    return {
      source: sourceName,
      section:
        score !== null
          ? `RAG Score ${Math.round(score * 100)}%`
          : String(rec.section || rec.page || "LangMind RAG"),
      snippet: String(
        rec.snippet || rec.content || rec.text || sourceName
      ).slice(0, 160),
    };
  });
}

export async function callLiveLangMindApi(opts: {
  message: string;
  role: LangMindRole;
  sessionId?: string;
  context?: Record<string, unknown>;
  toolSummary?: string;
  hasGeneratedDungeon?: boolean;
  attachmentContext?: string;
  screenContextSummary?: string;
}): Promise<{ ok: boolean; reply?: string; citations?: LangMindCitation[] }> {
  const customApiUrl = process.env.LANGMIND_API_URL?.trim();
  const customApiKey = process.env.LANGMIND_API_KEY?.trim();
  const useCustomEnterpriseApi = Boolean(customApiUrl && customApiKey);
  const agentId =
    process.env.LANGMIND_AGENT_ID?.trim() || DEFAULT_LANGMIND_AGENT_ID;
  const endpointUrl = useCustomEnterpriseApi
    ? customApiUrl!
    : process.env.LANGMIND_PUBLIC_CHAT_API?.trim() ||
      DEFAULT_LANGMIND_PUBLIC_CHAT_API;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 28000);

  try {
    const roleRule =
      opts.role === "teacher"
        ? "ผู้ใช้งานคือครูผู้สอน"
        : "ผู้ใช้งานคือนักเรียน/ผู้เรียน (ห้ามเรียกผู้ใช้งานว่าคุณครูหรือคุณครูใหญ่)";
    const dungeonRule = opts.hasGeneratedDungeon
      ? "ระบบหน้าเว็บได้สร้างปุ่มเข้าเล่นด่านจริงและรหัสแชร์ CD1 แสดงใต้คำตอบนี้อัตโนมัติแล้ว ห้ามเขียน URL ลิงก์เองหรือระบุว่ายังไม่มีลิงก์จริง"
      : "รอบนี้ยังไม่ได้สร้างด่านเกม ห้ามแต่งรหัสแชร์ CD1 หรือระบุว่าสร้างด่าน/ปุ่มเข้าเล่นแล้ว";
    const socraticScreenRule = opts.screenContextSummary
      ? "ให้คำแนะนำอ้างอิงโจทย์/โค้ดบนหน้าจอปัจจุบันแบบ Socratic PRIMM และห้ามบอกเฉลยว่าตัวเลือกใดถูกโดยตรง"
      : "";

    const contextBlocks: string[] = [];
    if (opts.screenContextSummary?.trim()) {
      contextBlocks.push(
        `[บริบทหน้าจอปัจจุบันของผู้ใช้งาน]\n${opts.screenContextSummary.trim()}`
      );
    }
    if (opts.attachmentContext?.trim()) {
      contextBlocks.push(`[เนื้อหาจากไฟล์/ภาพที่ผู้ใช้งานแนบมา]\n${opts.attachmentContext.trim()}`);
    }
    if (opts.toolSummary?.trim()) {
      contextBlocks.push(`[ข้อมูลจริงจากระบบ CODE COOL]\n${opts.toolSummary.trim()}`);
    }

    const extraRules = [roleRule, dungeonRule, socraticScreenRule]
      .filter(Boolean)
      .join(" · ");

    const composedMessage =
      contextBlocks.length > 0
        ? `${opts.message}\n\n${contextBlocks.join("\n\n")}\n(คำสั่งสำคัญ: ${extraRules} · ตอบให้กระชับ ชัดเจน ไม่เกิน 95 คำ)`
        : `${opts.message}\n\n(คำสั่งสำคัญ: ${extraRules} · หากเป็นการทักทายหรือถามทั่วไป ให้ตอบสั้นๆ เป็นกันเองไม่เกิน 65 คำ พร้อมแนะนำวิธีใช้งาน CODE COOL × LangMind เช่น วิเคราะห์จุดอ่อน 12 มิติ ใบ้โค้ด PRIMM หรือแนบรูป/ไฟล์โค้ด)`;

    const sessionId =
      opts.sessionId?.trim() ||
      `code-cool-${opts.role}-${Date.now().toString(36)}`;

    const payload: Record<string, unknown> = useCustomEnterpriseApi
      ? {
          message: composedMessage,
          query: composedMessage,
          input: composedMessage,
          agent_id: agentId,
          session_id: sessionId,
          context: {
            role: opts.role,
            ...(opts.context || {}),
          },
        }
      : {
          agent_id: agentId,
          query: composedMessage,
          session_id: sessionId,
        };

    const headers: Record<string, string> = useCustomEnterpriseApi
      ? {
          "Content-Type": "application/json",
          Authorization: `Bearer ${customApiKey}`,
          "x-api-key": customApiKey!,
        }
      : {
          "Content-Type": "application/json",
          Accept: "text/event-stream",
        };

    const res = await fetch(endpointUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!res.ok) {
      return { ok: false };
    }

    const contentType = (res.headers.get("content-type") || "").toLowerCase();

    if (contentType.includes("text/event-stream")) {
      const rawStream = await res.text();
      let streamedChunks = "";
      let finalAnswer = "";
      let sseCitations: LangMindCitation[] = [];

      const lines = rawStream.split(/\r?\n/);
      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line.startsWith("data:")) continue;
        const jsonPart = line.slice(5).trim();
        if (!jsonPart || jsonPart === "[DONE]") continue;
        try {
          const ev = JSON.parse(jsonPart) as Record<string, unknown>;
          const evType = String(ev.event || "");
          if (evType === "message" && typeof ev.answer === "string") {
            streamedChunks += ev.answer;
          } else if (evType === "message_end") {
            if (typeof ev.answer === "string" && ev.answer.trim()) {
              finalAnswer = ev.answer.trim();
            }
          } else if (evType === "citations" && Array.isArray(ev.citations)) {
            sseCitations = mapLangMindCitations(ev.citations);
          }
        } catch {
          // Ignore malformed SSE lines
        }
      }

      const resolvedReply = (finalAnswer || streamedChunks).trim();
      if (!resolvedReply) {
        return { ok: false };
      }
      return { ok: true, reply: resolvedReply, citations: sseCitations };
    }

    const data = (await res.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;
    if (!data) {
      return { ok: false };
    }

    const replyCandidates = [
      data.reply,
      data.answer,
      data.output,
      data.message,
      data.text,
      (data.data as Record<string, unknown> | undefined)?.answer,
      (data.data as Record<string, unknown> | undefined)?.reply,
      (data.data as Record<string, unknown> | undefined)?.text,
    ];
    const reply = replyCandidates.find(
      (v): v is string => typeof v === "string" && v.trim().length > 0
    );

    if (!reply) {
      return { ok: false };
    }

    const rawCitations = Array.isArray(data.citations)
      ? data.citations
      : Array.isArray(data.sources)
      ? data.sources
      : [];

    return {
      ok: true,
      reply: reply.trim(),
      citations: mapLangMindCitations(rawCitations),
    };
  } catch {
    return { ok: false };
  } finally {
    clearTimeout(timer);
  }
}
