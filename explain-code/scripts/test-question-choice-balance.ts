import assert from "node:assert/strict";
import {
  condenseProseForChoice,
  measureChoiceLengthBalance,
  rebalanceChoicesIfNeeded,
  shuffleChoicesPreservingCorrect,
  trimTrailingElaboration,
} from "../app/lib/question-choice-balance";
import { generateCustomDungeonFromCode } from "../app/lib/dungeon/to-dungeon-questions";

async function runTests() {
  console.log("=== Testing Question Choice Length Balancing ===");

  // 1. Short token choices should be considered balanced
  const shortNumeric = measureChoiceLengthBalance(["9", "10", "11", "20"], 1);
  assert.equal(shortNumeric.balanced, true, "Short numeric choices should be balanced");

  const shortKeywords = measureChoiceLengthBalance(
    ["true", "false", "null", "undefined"],
    3
  );
  assert.equal(shortKeywords.balanced, true, "Short keyword choices should be balanced");
  console.log("Passed: short token choices");

  // 2. Imbalanced prose choices (correct option is noticeably longest)
  const imbalancedTh = measureChoiceLengthBalance(
    [
      "วนลูปทั้งหมด 5 รอบและบวกสะสมเฉพาะเลขคู่ที่มากกว่าศูนย์เท่านั้น",
      "วนลูป 4 รอบ",
      "คืนค่า 0 ทันที",
      "เกิดข้อผิดพลาด",
    ],
    0
  );
  assert.equal(imbalancedTh.balanced, false, "Thai longest-correct should be flagged imbalanced");

  const imbalancedEn = measureChoiceLengthBalance(
    [
      "Skips negative numbers",
      "Iterates through every element in the array and accumulates only positive even numbers into total",
      "Returns zero immediately",
      "Throws a syntax error",
    ],
    1
  );
  assert.equal(imbalancedEn.balanced, false, "English longest-correct should be flagged imbalanced");
  console.log("Passed: imbalanced prose detection (TH & EN)");

  // 3. Balanced prose choices
  const balancedTh = measureChoiceLengthBalance(
    [
      "วนลูป 5 รอบเพื่อบวกสะสมเลขบวก",
      "วนลูป 4 รอบเพื่อหาค่าสูงสุด",
      "วนลูป 6 รอบเพื่อลบค่าติดลบ",
      "ข้ามลูปทั้งหมดแล้วคืนค่าศูนย์",
    ],
    0
  );
  assert.equal(balancedTh.balanced, true, "Comparable-length Thai choices should be balanced");

  // Distractor is longer than correct -> cannot guess correct by picking longest
  const distractorLonger = measureChoiceLengthBalance(
    [
      "บวกค่าในอาเรย์",
      "คำนวณผลรวมของตัวเลขทั้งหมดในอาเรย์รวมถึงค่าที่ติดลบด้วย",
      "คืนค่าตัวแรกเสมอ",
      "สลับลำดับสมาชิก",
    ],
    0
  );
  assert.equal(distractorLonger.balanced, true, "When distractor is longer, correct is not guessable as longest");
  console.log("Passed: balanced prose & distractor-longer cases");

  // 4. trimTrailingElaboration
  assert.equal(
    trimTrailingElaboration("วนลูป 5 รอบเพื่อรวมค่า (โดยข้ามเลขติดลบทั้งหมด)"),
    "วนลูป 5 รอบเพื่อรวมค่า"
  );
  assert.equal(
    trimTrailingElaboration("ประกาศตัวแปร count — เพื่อเก็บจำนวนรอบที่ทำงาน"),
    "ประกาศตัวแปร count"
  );
  assert.equal(
    trimTrailingElaboration("เรียกใช้ฟังก์ชัน calculateSum(a, b)"),
    "เรียกใช้ฟังก์ชัน calculateSum(a, b)"
  );
  console.log("Passed: trimTrailingElaboration");

  // 5. condenseProseForChoice
  const longProse =
    "ฟังก์ชันนี้ทำหน้าที่วนลูปตรวจสอบสมาชิกทุกตัวในอาเรย์เพื่อหาผลรวมของตัวเลขที่เป็นจำนวนบวกเท่านั้น และคืนค่าผลรวมกลับไปยังผู้เรียกใช้งาน";
  const condensed = condenseProseForChoice(longProse, 60);
  assert.ok(condensed.length <= 60, `Expected <= 60 chars, got ${condensed.length}`);
  assert.ok(condensed.length >= 24, `Expected >= 24 chars, got ${condensed.length}`);
  console.log("Passed: condenseProseForChoice");

  // 6. shuffleChoicesPreservingCorrect
  const original = ["Alpha", "Beta", "Gamma", "Delta"];
  const shuffledDet = shuffleChoicesPreservingCorrect(original, 2, "seed-123");
  assert.equal(shuffledDet.choices.length, 4);
  assert.equal(shuffledDet.choices[shuffledDet.correctIndex], "Gamma");

  const shuffledRand = shuffleChoicesPreservingCorrect(original, 1);
  assert.equal(shuffledRand.choices.length, 4);
  assert.equal(shuffledRand.choices[shuffledRand.correctIndex], "Beta");
  console.log("Passed: shuffleChoicesPreservingCorrect");

  // 7. rebalanceChoicesIfNeeded (local trim path without API call)
  const localTrimmed = await rebalanceChoicesIfNeeded({
    apiKey: "",
    question: "โค้ดนี้ทำอะไร?",
    choices: [
      "รวมค่าบวกในอาเรย์ (ซึ่งเป็นการข้ามค่าติดลบทั้งหมดในลูป)",
      "หาค่าสูงสุดในอาเรย์",
      "นับจำนวนสมาชิกทั้งหมด",
      "เรียงลำดับจากน้อยไปมาก",
    ],
    correctIndex: 0,
    uiLang: "th",
  });
  assert.equal(localTrimmed.rebalanced, true);
  assert.equal(localTrimmed.choices[localTrimmed.correctIndex], "รวมค่าบวกในอาเรย์");
  assert.equal(
    measureChoiceLengthBalance(localTrimmed.choices, localTrimmed.correctIndex).balanced,
    true
  );
  console.log("Passed: rebalanceChoicesIfNeeded local trim path");

  // 8. End-to-end deterministic fallback in generateCustomDungeonFromCode
  const prevKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;
  try {
    const longExplanation = {
      summary:
        "โค้ดนี้วนลูปอ่านค่าจากอาเรย์ตัวเลขทีละตัวเพื่อคัดกรองเฉพาะเลขบวกที่มากกว่าศูนย์แล้วนำไปบวกสะสมในตัวแปรผลรวมก่อนแสดงผลลัพธ์สุดท้าย",
      stepByStepFlow: [
        "กำหนดตัวแปร sum เท่ากับ 0 จากนั้นวนลูปตรวจสอบสมาชิกทุกตัวในอาเรย์ nums ทีละตัวเพื่อนำเลขบวกมาบวกสะสม",
      ],
      lineByLine: [
        {
          lineNumber: 1,
          code: "function sumPositive(nums) {",
          explanation:
            "ประกาศฟังก์ชันชื่อ sumPositive ที่รับพารามิเตอร์เป็นอาเรย์ nums เพื่อนำไปคำนวณผลรวมของตัวเลขที่เป็นบวกทั้งหมด",
        },
        {
          lineNumber: 2,
          code: "  let sum = 0;",
          explanation: "กำหนดค่าเริ่มต้นให้ตัวแปร sum เป็นศูนย์",
        },
      ],
      keyConcepts: ["Loop", "Condition", "Accumulator"],
      potentialPitfalls: [],
    };

    for (const uiLang of ["th", "en"] as const) {
      const dungeonWithOutput = await generateCustomDungeonFromCode({
        code: `function sumPositive(nums) {\n  let sum = 0;\n  for (const n of nums) {\n    if (n > 0) sum += n;\n  }\n  return sum;\n}\nconsole.log(sumPositive([3, -2, 5]));`,
        language: "javascript",
        uiLang,
        explanation: longExplanation,
      });

      assert.ok(dungeonWithOutput.questions.length >= 3);
      for (const q of dungeonWithOutput.questions) {
        assert.equal(q.choices.length, 4, `[${uiLang}] ${q.id} must have 4 choices`);
        const metrics = measureChoiceLengthBalance(q.choices, q.correctIndex);
        assert.equal(
          metrics.balanced,
          true,
          `[${uiLang}] ${q.id} choices imbalanced: correct=${metrics.correctLength}, maxD=${metrics.maxDistractorLength}, avgD=${metrics.avgDistractorLength.toFixed(1)}`
        );
      }

      const dungeonNoOutput = await generateCustomDungeonFromCode({
        code: `function sumPositive(nums) {\n  let sum = 0;\n  for (const n of nums) {\n    if (n > 0) sum += n;\n  }\n  return sum;\n}`,
        language: "javascript",
        uiLang,
        explanation: longExplanation,
      });

      assert.ok(dungeonNoOutput.questions.length >= 3);
      for (const q of dungeonNoOutput.questions) {
        assert.equal(q.choices.length, 4, `[${uiLang}-no-out] ${q.id} must have 4 choices`);
        const metrics = measureChoiceLengthBalance(q.choices, q.correctIndex);
        assert.equal(
          metrics.balanced,
          true,
          `[${uiLang}-no-out] ${q.id} choices imbalanced: correct=${metrics.correctLength}, maxD=${metrics.maxDistractorLength}, avgD=${metrics.avgDistractorLength.toFixed(1)}`
        );
      }
    }
    console.log("Passed: generateCustomDungeonFromCode deterministic fallback balance (TH & EN)");
  } finally {
    if (prevKey !== undefined) {
      process.env.GEMINI_API_KEY = prevKey;
    }
  }

  console.log("=== ALL CHOICE LENGTH BALANCE TESTS PASSED ===");
}

runTests().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
