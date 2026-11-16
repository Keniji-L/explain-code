export type BlockCellId =
  | "T1"
  | "E1"
  | "F1"
  | "T2"
  | "E2"
  | "F2"
  | "T3"
  | "E3"
  | "F3"
  | "T4"
  | "E4"
  | "F4";

export interface BlockCellMeta {
  id: BlockCellId;
  level: 1 | 2 | 3 | 4;
  levelName: string;
  levelNameEn?: string;
  dimension: "T" | "E" | "F";
  dimensionName: string;
  dimensionNameEn?: string;
  shortTitle: string;
  shortTitleEn?: string;
  description: string;
  descriptionEn?: string;
  exampleQuestion: string;
  exampleQuestionEn?: string;
  relatedTopicId: number;
}

export const BLOCK_MODEL_CELLS: BlockCellMeta[] = [
  // ระดับ 1: คำสั่งเดี่ยว (Atoms)
  {
    id: "T1",
    level: 1,
    levelName: "ระดับ 1 · คำสั่งเดี่ยว (Atom)",
    levelNameEn: "Level 1 · Atoms",
    dimension: "T",
    dimensionName: "โครงสร้างโค้ด (Text Surface)",
    dimensionNameEn: "Text Surface",
    shortTitle: "ไวยากรณ์คำสั่งเดี่ยว",
    shortTitleEn: "Single-Statement Syntax",
    description: "อ่านคำสั่ง ตัวแปร หรือเครื่องหมายในบรรทัดเดียวออกว่าเขียนอย่างไร",
    descriptionEn: "Read individual statements, variables, or operators on a single line.",
    exampleQuestion: "เครื่องหมาย += หรือ % ในบรรทัดนี้คือตัวดำเนินการอะไร?",
    exampleQuestionEn: "What does the += or % operator do on this line?",
    relatedTopicId: 1,
  },
  {
    id: "E1",
    level: 1,
    levelName: "ระดับ 1 · คำสั่งเดี่ยว (Atom)",
    levelNameEn: "Level 1 · Atoms",
    dimension: "E",
    dimensionName: "การทำงานจริง (Execution)",
    dimensionNameEn: "Execution",
    shortTitle: "ค่าตัวแปรรายบรรทัด",
    shortTitleEn: "Line-by-Line Variable Values",
    description: "บอกได้ว่าเมื่อรันบรรทัดนี้เสร็จ ค่าในตัวแปรเปลี่ยนเป็นเท่าไหร่",
    descriptionEn: "Determine the updated value of a variable after executing a single line.",
    exampleQuestion: "เมื่อรันบรรทัดที่ 3 เสร็จ ตัวแปร total มีค่าเท่ากับเท่าไหร่?",
    exampleQuestionEn: "After line 3 runs, what is the value of total?",
    relatedTopicId: 1,
  },
  {
    id: "F1",
    level: 1,
    levelName: "ระดับ 1 · คำสั่งเดี่ยว (Atom)",
    levelNameEn: "Level 1 · Atoms",
    dimension: "F",
    dimensionName: "หน้าที่และเป้าหมาย (Function)",
    dimensionNameEn: "Function & Purpose",
    shortTitle: "หน้าที่ของคำสั่งเดี่ยว",
    shortTitleEn: "Single-Statement Purpose",
    description: "เข้าใจว่าบรรทัดนี้หรือตัวแปรนี้มีไว้ทำไมในโปรแกรม",
    descriptionEn: "Understand why a specific line or variable exists in the program.",
    exampleQuestion: "ทำไมต้องกำหนด let count = 0 ไว้ที่บรรทัดแรก?",
    exampleQuestionEn: "Why do we initialize let count = 0 on the first line?",
    relatedTopicId: 1,
  },
  // ระดับ 2: บล็อกคำสั่ง (Blocks)
  {
    id: "T2",
    level: 2,
    levelName: "ระดับ 2 · บล็อกคำสั่ง (Block)",
    levelNameEn: "Level 2 · Blocks",
    dimension: "T",
    dimensionName: "โครงสร้างโค้ด (Text Surface)",
    dimensionNameEn: "Text Surface",
    shortTitle: "ขอบเขตบล็อก if / ลูป",
    shortTitleEn: "if / Loop Block Scope",
    description: "มองเห็นขอบเขตปีกกา เงื่อนไข และส่วนประกอบของ if/else, for, while",
    descriptionEn: "Identify braces, conditions, and parts of if/else, for, and while blocks.",
    exampleQuestion: "เงื่อนไขหยุดลูปของ for (let i = 0; i < 4; i++) คือส่วนใด?",
    exampleQuestionEn: "Which part is the loop condition in for (let i = 0; i < 4; i++)?",
    relatedTopicId: 3,
  },
  {
    id: "E2",
    level: 2,
    levelName: "ระดับ 2 · บล็อกคำสั่ง (Block)",
    levelNameEn: "Level 2 · Blocks",
    dimension: "E",
    dimensionName: "การทำงานจริง (Execution)",
    dimensionNameEn: "Execution",
    shortTitle: "ลำดับการวนซ้ำและทางแยก",
    shortTitleEn: "Branching & Loop Execution",
    description: "ไล่ลำดับได้ว่าโค้ดจะเข้าบล็อกไหน หรือวนซ้ำกี่รอบ",
    descriptionEn: "Trace which branch executes or how many iterations a loop runs.",
    exampleQuestion: "เมื่อ score = 75 โค้ดจะเข้าไปทำงานในบรรทัดใดของ if/else?",
    exampleQuestionEn: "When score = 75, which branch of the if/else block executes?",
    relatedTopicId: 2,
  },
  {
    id: "F2",
    level: 2,
    levelName: "ระดับ 2 · บล็อกคำสั่ง (Block)",
    levelNameEn: "Level 2 · Blocks",
    dimension: "F",
    dimensionName: "หน้าที่และเป้าหมาย (Function)",
    dimensionNameEn: "Function & Purpose",
    shortTitle: "หน้าที่ของบล็อกคำสั่ง",
    shortTitleEn: "Block Purpose",
    description: "สรุปได้ว่าบล็อก if หรือลูปก้อนนี้ทำหน้าที่อะไร",
    descriptionEn: "Summarize the overall role of an if block or loop.",
    exampleQuestion: "ลูป while ก้อนนี้มีหน้าที่หลักในการทำอะไร?",
    exampleQuestionEn: "What is the main job of this while loop?",
    relatedTopicId: 4,
  },
  // ระดับ 3: ความสัมพันธ์ (Relations)
  {
    id: "T3",
    level: 3,
    levelName: "ระดับ 3 · ความสัมพันธ์ (Relation)",
    levelNameEn: "Level 3 · Relations",
    dimension: "T",
    dimensionName: "โครงสร้างโค้ด (Text Surface)",
    dimensionNameEn: "Text Surface",
    shortTitle: "การเชื่อมตัวแปรและพารามิเตอร์",
    shortTitleEn: "Variables & Parameter Binding",
    description: "เห็นว่าตัวแปรหรือพารามิเตอร์ตัวไหนเชื่อมโยงกับบรรทัดอื่นอย่างไร",
    descriptionEn: "See how variables, arguments, and parameters connect across lines.",
    exampleQuestion: "อาร์กิวเมนต์ที่ส่งเข้า calcPrice(200, 3) จับคู่กับพารามิเตอร์ตัวใด?",
    exampleQuestionEn: "Which parameters receive the arguments in calcPrice(200, 3)?",
    relatedTopicId: 5,
  },
  {
    id: "E3",
    level: 3,
    levelName: "ระดับ 3 · ความสัมพันธ์ (Relation)",
    levelNameEn: "Level 3 · Relations",
    dimension: "E",
    dimensionName: "การทำงานจริง (Execution)",
    dimensionNameEn: "Execution",
    shortTitle: "การส่งต่อข้อมูลข้ามบล็อก",
    shortTitleEn: "Cross-Block Data Flow",
    description: "ติดตามค่าที่ส่งออกจากฟังก์ชันหรือจากลูปหนึ่งไปยังอีกส่วนหนึ่งได้",
    descriptionEn: "Track return values and data passed from one function or loop to another.",
    exampleQuestion: "ค่าที่ return จากฟังก์ชันถูกนำไปคำนวณต่อในบรรทัดที่ 8 อย่างไร?",
    exampleQuestionEn: "How is the returned value from the function used on line 8?",
    relatedTopicId: 5,
  },
  {
    id: "F3",
    level: 3,
    levelName: "ระดับ 3 · ความสัมพันธ์ (Relation)",
    levelNameEn: "Level 3 · Relations",
    dimension: "F",
    dimensionName: "หน้าที่และเป้าหมาย (Function)",
    dimensionNameEn: "Function & Purpose",
    shortTitle: "บทบาทความสัมพันธ์ระหว่างส่วนย่อย",
    shortTitleEn: "Component Interaction Role",
    description: "เข้าใจว่าทำไมต้องแยกฟังก์ชันหรือใช้แอเรย์ร่วมกับลูป",
    descriptionEn: "Understand why functions are separated or why arrays are paired with loops.",
    exampleQuestion: "การใช้ scores.length คู่กับตัวแปร sum มีจุดประสงค์เพื่ออะไร?",
    exampleQuestionEn: "What is the purpose of pairing scores.length with the sum variable?",
    relatedTopicId: 6,
  },
  // ระดับ 4: ภาพรวมโปรแกรม (Macro Structure)
  {
    id: "T4",
    level: 4,
    levelName: "ระดับ 4 · ภาพรวมโปรแกรม (Macro)",
    levelNameEn: "Level 4 · Macro",
    dimension: "T",
    dimensionName: "โครงสร้างโค้ด (Text Surface)",
    dimensionNameEn: "Text Surface",
    shortTitle: "โครงสร้างรวมทั้งโปรแกรม",
    shortTitleEn: "Whole-Program Structure",
    description: "มองเห็นโครงสร้างตั้งแต่ต้นจนจบว่าแบ่งเป็นกี่ส่วนหลัก",
    descriptionEn: "See how the entire program is organized from start to finish.",
    exampleQuestion: "โครงสร้างหลักของโปรแกรมนี้แบ่งออกเป็นขั้นตอนอะไรบ้าง?",
    exampleQuestionEn: "What are the main structural phases of this program?",
    relatedTopicId: 6,
  },
  {
    id: "E4",
    level: 4,
    levelName: "ระดับ 4 · ภาพรวมโปรแกรม (Macro)",
    levelNameEn: "Level 4 · Macro",
    dimension: "E",
    dimensionName: "การทำงานจริง (Execution)",
    dimensionNameEn: "Execution",
    shortTitle: "ผลลัพธ์รวมจากการรันจริง",
    shortTitleEn: "End-to-End Program Output",
    description: "ทำนายผลลัพธ์สุดท้ายของโปรแกรมทั้งหมดได้อย่างแม่นยำ",
    descriptionEn: "Accurately predict the final output of the entire program.",
    exampleQuestion: "เมื่อรันโปรแกรมตั้งแต่ต้นจนจบ หน้าจอจะพิมพ์อะไรออกมา?",
    exampleQuestionEn: "When the whole program runs from start to finish, what is printed?",
    relatedTopicId: 4,
  },
  {
    id: "F4",
    level: 4,
    levelName: "ระดับ 4 · ภาพรวมโปรแกรม (Macro)",
    levelNameEn: "Level 4 · Macro",
    dimension: "F",
    dimensionName: "หน้าที่และเป้าหมาย (Function)",
    dimensionNameEn: "Function & Purpose",
    shortTitle: "จุดประสงค์หลักของโปรแกรม",
    shortTitleEn: "Overall Program Goal",
    description: "อธิบายได้ว่าโค้ดชุดนี้แก้ปัญหาอะไร และถ้ามีบั๊กจาก AI มันผิดวัตถุประสงค์ตรงไหน",
    descriptionEn: "Explain what problem the code solves and where an AI bug breaks the goal.",
    exampleQuestion: "โค้ดที่ AI เขียนให้ชุดนี้ตั้งใจแก้ปัญหาอะไร และทำไมผลลัพธ์จึงผิดจากเป้าหมาย?",
    exampleQuestionEn: "What problem is this AI-generated code trying to solve, and why does its output miss the goal?",
    relatedTopicId: 7,
  },
];

export interface TraceStep {
  stepNumber: number;
  line: number;
  codeLine: string;
  codeLineEn?: string;
  variables: Record<string, string>;
  variablesEn?: Record<string, string>;
  outputSoFar: string[];
  explanation: string;
  explanationEn?: string;
}

export interface BlockQuestion {
  id: string;
  cellId: BlockCellId;
  targetLine: number;
  question: string;
  questionEn?: string;
  options: { id: string; text: string; textEn?: string }[];
  correctOptionId: string;
  hint: string;
  hintEn?: string;
  explanation: string;
  explanationEn?: string;
}

export interface ModifyChallenge {
  instruction: string;
  instructionEn?: string;
  suggestedCode: string;
  suggestedCodeEn?: string;
  changeDescription: string;
  changeDescriptionEn?: string;
  options: string[];
  optionsEn?: string[];
  explanation: string;
  explanationEn?: string;
}

export interface TopicQuest {
  id: number;
  title: string;
  titleEn?: string;
  shortName: string;
  shortNameEn?: string;
  isBoss?: boolean;
  subtitle: string;
  subtitleEn?: string;
  aiScenario?: string;
  aiScenarioEn?: string;
  code: string;
  codeEn?: string;
  predictPrompt: string;
  predictPromptEn?: string;
  predictOptions: string[];
  predictOptionsEn?: string[];
  predictExplanation: string;
  predictExplanationEn?: string;
  steps: TraceStep[];
  questions: BlockQuestion[];
  modifyChallenge: ModifyChallenge;
  badgeReward: {
    id: string;
    name: string;
    nameEn?: string;
    description: string;
    descriptionEn?: string;
  };
}

/**
 * รันโค้ด JavaScript จริงใน Sandbox เพื่อดึงผลลัพธ์ console.log จริง
 * ตามหลักที่ต้องรักษา: "เฉลยต้องมาจากการรันโค้ดจริง ไม่ให้เดาเฉลยข้อทำนายผล"
 */
export function runJavaScriptReal(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  const logs: string[] = [];
  const customConsole = {
    log: (...args: unknown[]) => {
      logs.push(
        args
          .map((a) =>
            typeof a === "object" && a !== null ? JSON.stringify(a) : String(a)
          )
          .join(" ")
      );
    },
  };

  try {
    const fn = new Function("console", `"use strict";\n${code}`);
    fn(customConsole);
    return {
      outputs: logs,
      finalOutput: logs.join("\n").trim(),
      success: true,
    };
  } catch (err) {
    return {
      outputs: logs,
      finalOutput: "",
      success: false,
      error: err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการรันโค้ด",
    };
  }
}

export const TOPICS: TopicQuest[] = [
  {
    id: 1,
    title: "เรื่องที่ 1 · ตัวแปรและการคำนวณ",
    titleEn: "Topic 1 · Variables & Arithmetic",
    shortName: "1 · ตัวแปรและการคำนวณ",
    shortNameEn: "1 · Variables & Arithmetic",
    subtitle: "แกะรอยค่าตัวแปรที่เปลี่ยนไปทีละบรรทัดและลำดับการคำนวณ",
    subtitleEn: "Trace variable state changes line by line and follow order of operations",
    code: `let price = 120;
let qty = 3;
let total = price * qty;
total = total - 40;
console.log(total);`,
    predictPrompt: "ก่อนรันโค้ด: เมื่อโค้ดทำงานครบทั้ง 5 บรรทัด จะพิมพ์ค่าอะไรออกทางหน้าจอ?",
    predictPromptEn: "Before running: after all 5 lines execute, what value will be printed to the console?",
    predictOptions: ["320", "360", "80", "240"],
    predictOptionsEn: ["320", "360", "80", "240"],
    predictExplanation:
      "บรรทัดที่ 3 คำนวณ 120 * 3 ได้ 360 เก็บใน total จากนั้นบรรทัดที่ 4 นำ 360 ลบออก 40 เหลือ 320 แล้วจึงพิมพ์ 320 ออกมา",
    predictExplanationEn:
      "Line 3 computes 120 * 3 = 360 and stores it in total. Line 4 subtracts 40 from 360 to get 320, which is then printed.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "let price = 120;",
        variables: { price: "120" },
        outputSoFar: [],
        explanation: "สร้างตัวแปร price เก็บราคาสินค้าชิ้นละ 120 บาท",
        explanationEn: "Declare variable price and initialize it to 120.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: "let qty = 3;",
        variables: { price: "120", qty: "3" },
        outputSoFar: [],
        explanation: "สร้างตัวแปร qty เก็บจำนวนสินค้า 3 ชิ้น",
        explanationEn: "Declare variable qty and initialize it to 3.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "let total = price * qty;",
        variables: { price: "120", qty: "3", total: "360" },
        outputSoFar: [],
        explanation: "นำค่าของ price (120) คูณกับ qty (3) ได้ผลลัพธ์ 360 เก็บไว้ในตัวแปร total",
        explanationEn: "Multiply price (120) by qty (3) to get 360 and store it in total.",
      },
      {
        stepNumber: 4,
        line: 4,
        codeLine: "total = total - 40;",
        variables: { price: "120", qty: "3", total: "320" },
        outputSoFar: [],
        explanation: "นำค่าเดิมของ total (360) ลบออก 40 (ส่วนลด) แล้วบันทึกค่าใหม่ 320 ทับลงใน total",
        explanationEn: "Subtract 40 (discount) from total (360) and reassign 320 back to total.",
      },
      {
        stepNumber: 5,
        line: 5,
        codeLine: "console.log(total);",
        variables: { price: "120", qty: "3", total: "320" },
        outputSoFar: ["320"],
        explanation: "แสดงค่าปัจจุบันของตัวแปร total คือ 320 ออกทางหน้าจอ",
        explanationEn: "Print the current value of total (320) to the console.",
      },
    ],
    questions: [
      {
        id: "t1-q1",
        cellId: "T1",
        targetLine: 3,
        question: "ในบรรทัดที่ 3 เครื่องหมาย * ในคำสั่ง price * qty ทำหน้าที่อะไร?",
        questionEn: "On line 3, what does the * operator do in price * qty?",
        options: [
          { id: "a", text: "คูณค่าของตัวแปร price กับ qty", textEn: "Multiplies price by qty" },
          { id: "b", text: "ยกกำลังค่าของ price ด้วย qty", textEn: "Raises price to the power of qty" },
          { id: "c", text: "นำข้อความมาต่อกัน", textEn: "Concatenates two strings" },
          { id: "d", text: "หารเอาเฉพาะเศษ", textEn: "Finds the remainder of division" },
        ],
        correctOptionId: "a",
        hint: "ในภาษา JavaScript เครื่องหมายดอกจันดวงเดียว (*) แทนการคำนวณทางคณิตศาสตร์พื้นฐานข้อใด?",
        hintEn: "In JavaScript, which basic arithmetic operation does a single asterisk (*) represent?",
        explanation: "เครื่องหมาย * คือตัวดำเนินการการคูณ (Multiplication) นำ 120 × 3 ได้ 360",
        explanationEn: "The * operator performs multiplication: 120 × 3 = 360.",
      },
      {
        id: "t1-q2",
        cellId: "E1",
        targetLine: 4,
        question: "เมื่อรันบรรทัดที่ 4 (total = total - 40;) เสร็จ ค่าของตัวแปร total เปลี่ยนจากอะไรเป็นอะไร?",
        questionEn: "After line 4 (total = total - 40;) runs, how does total change?",
        options: [
          { id: "a", text: "เปลี่ยนจาก 120 เป็น 80", textEn: "Changes from 120 to 80" },
          { id: "b", text: "เปลี่ยนจาก 360 เป็น 320", textEn: "Changes from 360 to 320" },
          { id: "c", text: "เปลี่ยนจาก 360 เป็น 40", textEn: "Changes from 360 to 40" },
          { id: "d", text: "ยังคงเป็น 360 เท่าเดิม", textEn: "Remains 360" },
        ],
        correctOptionId: "b",
        hint: "ดูตารางค่าตัวแปรในขั้นที่ 3 ว่าก่อนเข้าบรรทัดที่ 4 ตัวแปร total มีค่าเท่าไหร่ แล้วลบออก 40",
        hintEn: "Check the value of total in step 3 before line 4 executes, then subtract 40.",
        explanation: "ก่อนบรรทัดที่ 4 ค่า total คือ 360 เมื่อนำ 360 - 40 แล้วกำหนดค่ากลับเข้า total จึงเปลี่ยนเป็น 320",
        explanationEn: "Before line 4, total is 360. Computing 360 - 40 and reassigning updates total to 320.",
      },
      {
        id: "t1-q3",
        cellId: "F1",
        targetLine: 4,
        question: "ในเชิงความหมายของโปรแกรม บรรทัดที่ 4 (total = total - 40;) ทำหน้าที่อะไร?",
        questionEn: "In terms of program purpose, what does line 4 (total = total - 40;) represent?",
        options: [
          { id: "a", text: "เพิ่มจำนวนสินค้าอีก 40 ชิ้น", textEn: "Adds 40 more items to qty" },
          { id: "b", text: "หักส่วนลด 40 บาทออกจากราคารวม", textEn: "Subtracts a 40-unit discount from the total price" },
          { id: "c", text: "ตั้งราคาสินค้าใหม่เป็น 40 บาท", textEn: "Resets item price to 40" },
          { id: "d", text: "ล้างค่าตัวแปร total ให้เป็นศูนย์", textEn: "Clears total back to zero" },
        ],
        correctOptionId: "b",
        hint: "total คือราคารวมทั้งหมด การลบออก 40 จากราคารวมเปรียบเสมือนรายการใดเวลาซื้อของ?",
        hintEn: "total is the overall price. Subtracting 40 from a checkout total represents what?",
        explanation: "บรรทัดที่ 4 ทำหน้าที่ปรับลดยอดรวมลง 40 บาท (เปรียบเสมือนการหักคูปองส่วนลดท้ายบิล)",
        explanationEn: "Line 4 deducts 40 from the running total, just like applying a discount coupon.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนจำนวนสินค้า qty ในบรรทัดที่ 2 จาก 3 เป็น 4 แล้วทายว่าโค้ดจะพิมพ์อะไร!",
      instructionEn: "Change qty on line 2 from 3 to 4 and predict the new printed output!",
      suggestedCode: `let price = 120;
let qty = 4;
let total = price * qty;
total = total - 40;
console.log(total);`,
      changeDescription: "เปลี่ยน let qty = 3; เป็น let qty = 4;",
      changeDescriptionEn: "Change let qty = 3; to let qty = 4;",
      options: ["440", "480", "320", "400"],
      optionsEn: ["440", "480", "320", "400"],
      explanation: "เมื่อ qty = 4 จะได้ total = 120 * 4 = 480 จากนั้นหักออก 40 จึงเหลือ 440 จากการรันโค้ดจริง!",
      explanationEn: "With qty = 4, total = 120 * 4 = 480, then subtracting 40 yields 440.",
    },
    badgeReward: {
      id: "badge-var",
      name: "นักแกะรอยตัวแปร",
      nameEn: "Variable Tracer",
      description: "เข้าใจการเปลี่ยนค่าของตัวแปรและการคำนวณทีละบรรทัด",
      descriptionEn: "Mastered tracking variable state changes and line-by-line arithmetic.",
    },
  },
  {
    id: 2,
    title: "เรื่องที่ 2 · เงื่อนไข if/else",
    titleEn: "Topic 2 · if / else Conditions",
    shortName: "2 · เงื่อนไข if/else",
    shortNameEn: "2 · if / else Conditions",
    subtitle: "ติดตามทางแยกของโปรแกรมว่าเข้าเงื่อนไขใดและข้ามบรรทัดใด",
    subtitleEn: "Follow program branches to see which condition runs and which lines are skipped",
    code: `let score = 72;
let status = "รอตรวจ";
if (score >= 80) {
  status = "ดีเยี่ยม";
} else if (score >= 50) {
  status = "ผ่านเกณฑ์";
} else {
  status = "ควรทบทวน";
}
console.log(status);`,
    predictPrompt: "ก่อนรันโค้ด: เมื่อ score = 72 โปรแกรมจะพิมพ์ข้อความใดออกมา?",
    predictPromptEn: "Before running: when score = 72, which status string will be printed?",
    predictOptions: ["ผ่านเกณฑ์", "ดีเยี่ยม", "ควรทบทวน", "รอตรวจ"],
    predictOptionsEn: ["ผ่านเกณฑ์", "ดีเยี่ยม", "ควรทบทวน", "รอตรวจ"],
    predictExplanation:
      "72 ไม่ถึง 80 จึงข้ามบล็อกแรก มาตรวจเงื่อนไขที่สอง (72 >= 50) ซึ่งเป็นจริง จึงตั้งค่า status = 'ผ่านเกณฑ์' และข้าม else สุดท้าย",
    predictExplanationEn:
      "72 is less than 80, so the first block is skipped. The second condition (72 >= 50) is true, so status becomes 'ผ่านเกณฑ์' and the final else is skipped.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "let score = 72;",
        variables: { score: "72" },
        outputSoFar: [],
        explanation: "กำหนดคะแนนตั้งต้น score เท่ากับ 72",
        explanationEn: "Initialize score to 72.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: 'let status = "รอตรวจ";',
        variables: { score: "72", status: '"รอตรวจ"' },
        outputSoFar: [],
        explanation: "กำหนดค่าเริ่มต้นของตัวแปร status เป็น 'รอตรวจ'",
        explanationEn: "Initialize status to 'รอตรวจ' (pending).",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "if (score >= 80) {",
        variables: { score: "72", status: '"รอตรวจ"', "score >= 80": "false" },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไขแรก: 72 >= 80 เป็นเท็จ (false) จึงข้ามบรรทัดที่ 4 ไป",
        explanationEn: "Check first condition: 72 >= 80 is false, so line 4 is skipped.",
      },
      {
        stepNumber: 4,
        line: 5,
        codeLine: "} else if (score >= 50) {",
        variables: { score: "72", status: '"รอตรวจ"', "score >= 50": "true" },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไขถัดมา: 72 >= 50 เป็นจริง (true) จึงเข้าทำงานในบล็อกนี้",
        explanationEn: "Check next condition: 72 >= 50 is true, so enter this block.",
      },
      {
        stepNumber: 5,
        line: 6,
        codeLine: '  status = "ผ่านเกณฑ์";',
        variables: { score: "72", status: '"ผ่านเกณฑ์"' },
        outputSoFar: [],
        explanation: "เปลี่ยนค่าของตัวแปร status เป็น 'ผ่านเกณฑ์' แล้วข้ามบล็อก else ที่เหลือ",
        explanationEn: "Update status to 'ผ่านเกณฑ์' and skip the remaining else block.",
      },
      {
        stepNumber: 6,
        line: 10,
        codeLine: "console.log(status);",
        variables: { score: "72", status: '"ผ่านเกณฑ์"' },
        outputSoFar: ["ผ่านเกณฑ์"],
        explanation: "แสดงค่าของ status คือ 'ผ่านเกณฑ์' ออกทางหน้าจอ",
        explanationEn: "Print the value of status ('ผ่านเกณฑ์') to the console.",
      },
    ],
    questions: [
      {
        id: "t2-q1",
        cellId: "T2",
        targetLine: 5,
        question: "คำสั่ง else if (score >= 50) ในบรรทัดที่ 5 จะถูกตรวจสอบเมื่อใด?",
        questionEn: "When is else if (score >= 50) on line 5 evaluated?",
        options: [
          { id: "a", text: "ตรวจสอบทุกครั้งเสมอไม่ว่า if แรกจะจริงหรือเท็จ", textEn: "Always, regardless of whether the first if is true or false" },
          { id: "b", text: "ตรวจสอบเฉพาะเมื่อเงื่อนไข if (score >= 80) ด้านบนเป็นเท็จเท่านั้น", textEn: "Only when the preceding if (score >= 80) condition is false" },
          { id: "c", text: "ตรวจสอบหลังจากบล็อก else ทำงานเสร็จแล้ว", textEn: "After the else block finishes" },
          { id: "d", text: "ตรวจสอบเฉพาะเมื่อ score เป็นเลขคี่", textEn: "Only when score is odd" },
        ],
        correctOptionId: "b",
        hint: "คำว่า else if แปลว่า 'แต่ถ้าไม่ใช่ข้างบน แล้วถ้า...' ดังนั้นถ้าข้างบนจริงไปแล้วจะลงมาเช็คอีกไหม?",
        hintEn: "else if means 'otherwise, if...'. If the earlier if was true, does it still check this?",
        explanation: "โครงสร้าง if / else if จะตรวจไล่จากบนลงล่าง และจะตรวจ else if ก็ต่อเมื่อเงื่อนไข if ก่อนหน้าเป็นเท็จเท่านั้น",
        explanationEn: "if / else if chains evaluate top-down and only test else if when all previous conditions were false.",
      },
      {
        id: "t2-q2",
        cellId: "E2",
        targetLine: 6,
        question: "เมื่อรันด้วย score = 72 บรรทัดที่ 4 (status = 'ดีเยี่ยม') และบรรทัดที่ 8 (status = 'ควรทบทวน') ทำงานหรือไม่?",
        questionEn: "With score = 72, do line 4 and line 8 execute?",
        options: [
          { id: "a", text: "ไม่ทำงานทั้งสองบรรทัด เพราะเข้าเฉพาะบล็อกบรรทัดที่ 6 เท่านั้น", textEn: "Neither executes; only the line 6 block runs" },
          { id: "b", text: "ทำทุกบรรทัดตามลำดับแต่บรรทัดที่ 6 ทับค่าสุดท้าย", textEn: "All lines run in order, and line 6 overwrites the rest" },
          { id: "c", text: "ทำบรรทัดที่ 6 ก่อนแล้วค่อยลงไปทำบรรทัดที่ 8", textEn: "Line 6 runs first, then line 8 runs" },
          { id: "d", text: "ทำบรรทัดที่ 4 ก่อนแล้วเปลี่ยนใจมาทำบรรทัดที่ 6", textEn: "Line 4 runs first, then switches to line 6" },
        ],
        correctOptionId: "a",
        hint: "สังเกตการก้าวเดินของบรรทัดในตารางเดินโค้ดว่าข้ามบรรทัดที่ 4 และ 8 ไปเลยหรือไม่",
        hintEn: "Look at the execution trace to see if lines 4 and 8 are completely skipped.",
        explanation: "ในโครงสร้าง if / else if / else ระบบจะเลือกทำงานเพียงทางแยกเดียวที่เป็นจริงครั้งแรก แล้วข้ามทางแยกอื่นทั้งหมด",
        explanationEn: "An if / else if / else chain executes at most one branch—the first matching condition—and skips all others.",
      },
      {
        id: "t2-q3",
        cellId: "F2",
        targetLine: 3,
        question: "บล็อก if / else if / else ในบรรทัดที่ 3–9 ทั้งก้อนทำหน้าที่อะไร?",
        questionEn: "What is the overall purpose of the if / else if / else block on lines 3–9?",
        options: [
          { id: "a", text: "บวกคะแนนเพิ่มให้นักเรียนอัตโนมัติ", textEn: "Automatically adds bonus points to score" },
          { id: "b", text: "จำแนกระดับผลการประเมินตามช่วงคะแนนของ score", textEn: "Classifies the evaluation status based on score ranges" },
          { id: "c", text: "เรียงลำดับคะแนนจากน้อยไปมาก", textEn: "Sorts scores in ascending order" },
          { id: "d", text: "วนซ้ำพิมพ์คะแนนออกทางหน้าจอ 3 ครั้ง", textEn: "Prints score 3 times in a loop" },
        ],
        correctOptionId: "b",
        hint: "ดูค่าที่ถูกกำหนดให้ตัวแปร status ในแต่ละทางแยก",
        hintEn: "Look at the values assigned to status in each branch.",
        explanation: "บล็อกนี้ทำหน้าที่คัดกรองช่วงคะแนน (80+, 50–79, ต่ำกว่า 50) เพื่อแปลงตัวเลขคะแนนเป็นสถานะผลการเรียน",
        explanationEn: "This block categorizes score into ranges (80+, 50–79, below 50) to determine the status label.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนค่า score ในบรรทัดที่ 1 จาก 72 เป็น 85 แล้วทายผลลัพธ์ใหม่!",
      instructionEn: "Change score on line 1 from 72 to 85 and predict the new output!",
      suggestedCode: `let score = 85;
let status = "รอตรวจ";
if (score >= 80) {
  status = "ดีเยี่ยม";
} else if (score >= 50) {
  status = "ผ่านเกณฑ์";
} else {
  status = "ควรทบทวน";
}
console.log(status);`,
      changeDescription: "เปลี่ยน let score = 72; เป็น let score = 85;",
      changeDescriptionEn: "Change let score = 72; to let score = 85;",
      options: ["ดีเยี่ยม", "ผ่านเกณฑ์", "ควรทบทวน", "รอตรวจ"],
      optionsEn: ["ดีเยี่ยม", "ผ่านเกณฑ์", "ควรทบทวน", "รอตรวจ"],
      explanation: "เมื่อ score = 85 เงื่อนไขแรก (85 >= 80) เป็นจริงทันที จึงได้ status = 'ดีเยี่ยม'!",
      explanationEn: "When score = 85, the first condition (85 >= 80) is immediately true, setting status to 'ดีเยี่ยม'.",
    },
    badgeReward: {
      id: "badge-ifelse",
      name: "ผู้คุมทางแยกตรรกะ",
      nameEn: "Branching Tactician",
      description: "แยกแยะเงื่อนไขและเส้นทางการทำงานของ if/else ได้แม่นยำ",
      descriptionEn: "Accurately trace if/else conditions and execution paths.",
    },
  },
  {
    id: 3,
    title: "เรื่องที่ 3 · วนซ้ำ for",
    titleEn: "Topic 3 · for Loops",
    shortName: "3 · วนซ้ำ for",
    shortNameEn: "3 · for Loops",
    subtitle: "เข้าใจการนับรอบ ตัวแปรลูป i และการบวกสะสมค่าในแต่ละรอบ",
    subtitleEn: "Understand iteration counters, loop variable i, and accumulating values per round",
    code: `let sum = 0;
for (let i = 1; i <= 3; i++) {
  sum = sum + i;
}
console.log(sum);`,
    predictPrompt: "ก่อนรันโค้ด: เมื่อลูป for ทำงานครบทุกรอบ จะพิมพ์ค่า sum เท่ากับเท่าไหร่?",
    predictPromptEn: "Before running: after the for loop finishes all iterations, what will sum print?",
    predictOptions: ["6", "3", "4", "10"],
    predictOptionsEn: ["6", "3", "4", "10"],
    predictExplanation: "ลูปทำงาน 3 รอบโดย i เป็น 1, 2, 3 ตามลำดับ นำมาบวกสะสมเข้า sum: 0 + 1 + 2 + 3 = 6",
    predictExplanationEn: "The loop runs 3 times with i = 1, 2, 3, accumulating into sum: 0 + 1 + 2 + 3 = 6.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "let sum = 0;",
        variables: { sum: "0" },
        outputSoFar: [],
        explanation: "ตั้งค่าตัวแปรสะสมผลรวม sum เริ่มต้นที่ 0",
        explanationEn: "Initialize the accumulator variable sum to 0.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: "for (let i = 1; i <= 3; i++) // รอบที่ 1",
        codeLineEn: "for (let i = 1; i <= 3; i++) // iteration 1",
        variables: { sum: "0", i: "1", "i <= 3": "true" },
        outputSoFar: [],
        explanation: "เริ่มรอบที่ 1: กำหนด i = 1 ตรวจเงื่อนไข 1 <= 3 เป็นจริง จึงเข้าลูป",
        explanationEn: "Iteration 1: initialize i = 1; 1 <= 3 is true, so enter the loop.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "  sum = sum + i; // รอบที่ 1",
        codeLineEn: "  sum = sum + i; // iteration 1",
        variables: { sum: "1", i: "1" },
        outputSoFar: [],
        explanation: "นำ sum เดิม (0) บวก i (1) ได้ sum = 1",
        explanationEn: "Add i (1) to sum (0) -> sum becomes 1.",
      },
      {
        stepNumber: 4,
        line: 2,
        codeLine: "for (...; i <= 3; i++) // รอบที่ 2",
        codeLineEn: "for (...; i <= 3; i++) // iteration 2",
        variables: { sum: "1", i: "2", "i <= 3": "true" },
        outputSoFar: [],
        explanation: "เพิ่มค่า i++ เป็น 2 ตรวจเงื่อนไข 2 <= 3 เป็นจริง จึงเข้าลูปรอบที่ 2",
        explanationEn: "Increment i++ to 2; 2 <= 3 is true, so enter iteration 2.",
      },
      {
        stepNumber: 5,
        line: 3,
        codeLine: "  sum = sum + i; // รอบที่ 2",
        codeLineEn: "  sum = sum + i; // iteration 2",
        variables: { sum: "3", i: "2" },
        outputSoFar: [],
        explanation: "นำ sum เดิม (1) บวก i (2) ได้ sum = 3",
        explanationEn: "Add i (2) to sum (1) -> sum becomes 3.",
      },
      {
        stepNumber: 6,
        line: 2,
        codeLine: "for (...; i <= 3; i++) // รอบที่ 3",
        codeLineEn: "for (...; i <= 3; i++) // iteration 3",
        variables: { sum: "3", i: "3", "i <= 3": "true" },
        outputSoFar: [],
        explanation: "เพิ่มค่า i++ เป็น 3 ตรวจเงื่อนไข 3 <= 3 เป็นจริง จึงเข้าลูปรอบที่ 3",
        explanationEn: "Increment i++ to 3; 3 <= 3 is true, so enter iteration 3.",
      },
      {
        stepNumber: 7,
        line: 3,
        codeLine: "  sum = sum + i; // รอบที่ 3",
        codeLineEn: "  sum = sum + i; // iteration 3",
        variables: { sum: "6", i: "3" },
        outputSoFar: [],
        explanation: "นำ sum เดิม (3) บวก i (3) ได้ sum = 6",
        explanationEn: "Add i (3) to sum (3) -> sum becomes 6.",
      },
      {
        stepNumber: 8,
        line: 2,
        codeLine: "for (...; i <= 3; i++) // จบลูป",
        codeLineEn: "for (...; i <= 3; i++) // loop ends",
        variables: { sum: "6", i: "4", "i <= 3": "false" },
        outputSoFar: [],
        explanation: "เพิ่มค่า i++ เป็น 4 ตรวจเงื่อนไข 4 <= 3 เป็นเท็จ จึงหลุดออกจากลูป",
        explanationEn: "Increment i++ to 4; 4 <= 3 is false, so exit the loop.",
      },
      {
        stepNumber: 9,
        line: 5,
        codeLine: "console.log(sum);",
        variables: { sum: "6" },
        outputSoFar: ["6"],
        explanation: "พิมพ์ค่าผลรวมสะสม sum คือ 6 ออกทางหน้าจอ",
        explanationEn: "Print the accumulated total sum (6) to the console.",
      },
    ],
    questions: [
      {
        id: "t3-q1",
        cellId: "T2",
        targetLine: 2,
        question: "ในคำสั่ง for (let i = 1; i <= 3; i++) ส่วนใดคือ 'การปรับค่าตัวแปรนับรอบเมื่อจบแต่ละรอบ'?",
        questionEn: "In for (let i = 1; i <= 3; i++), which part updates the loop counter after each iteration?",
        options: [
          { id: "a", text: "let i = 1", textEn: "let i = 1" },
          { id: "b", text: "i <= 3", textEn: "i <= 3" },
          { id: "c", text: "i++", textEn: "i++" },
          { id: "d", text: "sum = sum + i", textEn: "sum = sum + i" },
        ],
        correctOptionId: "c",
        hint: "โครงสร้าง for มี 3 ส่วนคั่นด้วย ; คือ (ค่าเริ่มต้น; เงื่อนไขทำงานต่อ; การปรับค่าหลังจบรอบ)",
        hintEn: "A for loop header has 3 parts separated by semicolons: (init; condition; update).",
        explanation: "ส่วนที่ 3 คือ i++ จะทำงานทุกครั้งหลังจบคำสั่งในปีกกาของลูป เพื่อขยับค่า i เพิ่มขึ้นทีละ 1",
        explanationEn: "The third clause, i++, runs after every loop body iteration to increment i by 1.",
      },
      {
        id: "t3-q2",
        cellId: "E2",
        targetLine: 2,
        question: "ในจังหวะที่หลุดออกจากลูป for ค่าของ i มีค่าเท่ากับเท่าไหร่?",
        questionEn: "What is the value of i at the exact moment the for loop exits?",
        options: [
          { id: "a", text: "2", textEn: "2" },
          { id: "b", text: "3", textEn: "3" },
          { id: "c", text: "4", textEn: "4" },
          { id: "d", text: "6", textEn: "6" },
        ],
        correctOptionId: "c",
        hint: "ดูขั้นที่ 8 ในตารางเดินโค้ดว่า i ต้องเพิ่มเป็นเลขอะไร เงื่อนไข i <= 3 ถึงจะกลายเป็น false",
        hintEn: "Check step 8: what value must i reach for i <= 3 to become false?",
        explanation: "หลังจบรอบที่ 3 ค่า i จะถูก i++ เพิ่มเป็น 4 ทำให้เงื่อนไข 4 <= 3 เป็นเท็จ ลูปจึงหยุดทำงาน",
        explanationEn: "After round 3, i++ sets i to 4, making 4 <= 3 false and terminating the loop.",
      },
      {
        id: "t3-q3",
        cellId: "F1",
        targetLine: 1,
        question: "ทำไมต้องประกาศ let sum = 0; ไว้นอกลูป (บรรทัดที่ 1) แทนที่จะไว้ในลูป?",
        questionEn: "Why must let sum = 0; be declared outside the loop on line 1 instead of inside it?",
        options: [
          { id: "a", text: "เพื่อให้ sum เก็บสะสมค่าต่อเนื่องทุกรอบ ไม่ถูกรีเซ็ตเป็น 0 ทุกรอบ", textEn: "So sum accumulates across iterations without resetting to 0 every round" },
          { id: "b", text: "เพราะในลูป for ห้ามประกาศตัวแปรด้วย let", textEn: "Because let cannot be used inside a for loop" },
          { id: "c", text: "เพื่อให้ลูปทำงานเร็วขึ้น 3 เท่า", textEn: "To make the loop run 3x faster" },
          { id: "d", text: "เพื่อให้ค่า i เริ่มต้นที่ 0 ตามไปด้วย", textEn: "So that i also starts at 0" },
        ],
        correctOptionId: "a",
        hint: "ถ้าเอา let sum = 0; ไปไว้ในปีกกาของลูป พอขึ้นรอบที่ 2 ค่า sum ที่บวกไว้ในรอบแรกจะเป็นอย่างไร?",
        hintEn: "If let sum = 0; were inside the loop body, what would happen to sum at the start of round 2?",
        explanation: "ตัวแปรสะสมค่า (Accumulator) ต้องประกาศนอกลูป เพื่อรักษาผลรวมจากรอบก่อนหน้าไว้บวกทบในรอบถัดไป",
        explanationEn: "An accumulator variable must live outside the loop so its running total persists across iterations.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนเงื่อนไขในบรรทัดที่ 2 จาก i <= 3 เป็น i <= 4 แล้วทายว่าผลรวม sum จะเป็นเท่าไหร่!",
      instructionEn: "Change the loop condition on line 2 from i <= 3 to i <= 4 and predict the new sum!",
      suggestedCode: `let sum = 0;
for (let i = 1; i <= 4; i++) {
  sum = sum + i;
}
console.log(sum);`,
      changeDescription: "เปลี่ยน i <= 3 เป็น i <= 4",
      changeDescriptionEn: "Change i <= 3 to i <= 4",
      options: ["10", "6", "12", "4"],
      optionsEn: ["10", "6", "12", "4"],
      explanation: "เมื่อเปลี่ยนเป็น i <= 4 ลูปจะบวกเพิ่มรอบที่ 4 (6 + 4) ได้ผลลัพธ์เป็น 10!",
      explanationEn: "Changing to i <= 4 adds a 4th iteration (6 + 4), resulting in 10.",
    },
    badgeReward: {
      id: "badge-for",
      name: "จ้าวแห่งลูป for",
      nameEn: "Master of for Loops",
      description: "ไล่รอบการทำงานของลูป for และการสะสมค่าได้ครบทุกรอบ",
      descriptionEn: "Trace every for-loop iteration and accumulation accurately.",
    },
  },
  {
    id: 4,
    title: "เรื่องที่ 4 · วนซ้ำ while",
    titleEn: "Topic 4 · while Loops",
    shortName: "4 · วนซ้ำ while",
    shortNameEn: "4 · while Loops",
    subtitle: "ติดตามลูปที่ทำงานตามเงื่อนไขและระวังการเปลี่ยนแปลงค่าตัวแปรควบคุมลูป",
    subtitleEn: "Follow condition-driven loops and track how loop-control variables change",
    code: `let energy = 10;
let steps = 0;
while (energy >= 4) {
  energy = energy - 4;
  steps = steps + 1;
}
console.log(steps);`,
    predictPrompt: "ก่อนรันโค้ด: เมื่อ energy เริ่มที่ 10 และลดลงรอบละ 4 โค้ดจะพิมพ์ค่า steps เท่ากับเท่าไหร่?",
    predictPromptEn: "Before running: when energy starts at 10 and decreases by 4 each round, what will steps print?",
    predictOptions: ["2", "3", "4", "6"],
    predictOptionsEn: ["2", "3", "4", "6"],
    predictExplanation:
      "รอบที่ 1: energy เหลือ 6, steps = 1 | รอบที่ 2: energy เหลือ 2, steps = 2 | พอรอบถัดไป energy (2) < 4 จึงหลุดลูปและพิมพ์ 2",
    predictExplanationEn:
      "Round 1: energy = 6, steps = 1. Round 2: energy = 2, steps = 2. Next check: 2 < 4, so the loop stops and prints 2.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "let energy = 10; let steps = 0;",
        variables: { energy: "10", steps: "0" },
        outputSoFar: [],
        explanation: "ตั้งค่าพลังงานเริ่มต้น energy = 10 และจำนวนก้าวที่เดินได้ steps = 0",
        explanationEn: "Initialize energy = 10 and step counter steps = 0.",
      },
      {
        stepNumber: 2,
        line: 3,
        codeLine: "while (energy >= 4) // รอบที่ 1",
        codeLineEn: "while (energy >= 4) // round 1",
        variables: { energy: "10", steps: "0", "energy >= 4": "true" },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไข 10 >= 4 เป็นจริง เข้าทำงานในลูปรอบที่ 1",
        explanationEn: "Round 1: 10 >= 4 is true, enter the while loop.",
      },
      {
        stepNumber: 3,
        line: 4,
        codeLine: "  energy = energy - 4; steps = steps + 1;",
        variables: { energy: "6", steps: "1" },
        outputSoFar: [],
        explanation: "ใช้พลังงานไป 4 เหลือ energy = 6 และนับก้าวเพิ่มเป็น steps = 1",
        explanationEn: "Subtract 4 energy (energy = 6) and increment steps to 1.",
      },
      {
        stepNumber: 4,
        line: 3,
        codeLine: "while (energy >= 4) // รอบที่ 2",
        codeLineEn: "while (energy >= 4) // round 2",
        variables: { energy: "6", steps: "1", "energy >= 4": "true" },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไข 6 >= 4 เป็นจริง เข้าทำงานในลูปรอบที่ 2",
        explanationEn: "Round 2: 6 >= 4 is true, enter the while loop.",
      },
      {
        stepNumber: 5,
        line: 4,
        codeLine: "  energy = energy - 4; steps = steps + 1;",
        variables: { energy: "2", steps: "2" },
        outputSoFar: [],
        explanation: "ใช้พลังงานไปอีก 4 เหลือ energy = 2 และนับก้าวเพิ่มเป็น steps = 2",
        explanationEn: "Subtract 4 energy (energy = 2) and increment steps to 2.",
      },
      {
        stepNumber: 6,
        line: 3,
        codeLine: "while (energy >= 4) // ตรวจเงื่อนไขจบลูป",
        codeLineEn: "while (energy >= 4) // exit condition check",
        variables: { energy: "2", steps: "2", "energy >= 4": "false" },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไข 2 >= 4 เป็นเท็จ เพราะพลังงานไม่พอก้าวต่อไป จึงออกจากลูป while",
        explanationEn: "Check 2 >= 4: false! Not enough energy, so exit the while loop.",
      },
      {
        stepNumber: 7,
        line: 7,
        codeLine: "console.log(steps);",
        variables: { energy: "2", steps: "2" },
        outputSoFar: ["2"],
        explanation: "พิมพ์จำนวนก้าวทั้งหมดที่เดินได้คือ 2 ออกทางหน้าจอ",
        explanationEn: "Print the total number of steps taken (2).",
      },
    ],
    questions: [
      {
        id: "t4-q1",
        cellId: "F2",
        targetLine: 3,
        question: "ลูป while (energy >= 4) ในโค้ดนี้ทำหน้าที่จำลองสถานการณ์ใด?",
        questionEn: "What scenario does while (energy >= 4) model in this code?",
        options: [
          { id: "a", text: "เดินหน้าต่อไปเรื่อยๆ ตราบใดที่ยังมีพลังงานอย่างน้อย 4 หน่วย", textEn: "Keep stepping forward as long as at least 4 energy remains" },
          { id: "b", text: "เติมพลังงานให้ครบ 4 หน่วยก่อนเริ่มเดิน", textEn: "Recharge energy to 4 before walking" },
          { id: "c", text: "บังคับให้เดินครบ 4 ก้าวเสมอ", textEn: "Always force exactly 4 steps" },
          { id: "d", text: "หารค่าพลังงานออกเป็น 4 ส่วนเท่ากัน", textEn: "Split energy into 4 equal parts" },
        ],
        correctOptionId: "a",
        hint: "ดูความหมายของตัวแปร energy (พลังงาน) และ steps (ก้าวที่เดิน) ในแต่ละรอบ",
        hintEn: "Consider the meaning of energy and steps inside each iteration.",
        explanation: "ลูป while นี้ตรวจว่าพลังงานยังพอสำหรับการเดิน 1 ก้าว (ใช้ 4 หน่วย) หรือไม่ ถ้าพอจึงก้าวต่อและหักพลังงานออก",
        explanationEn: "The while loop checks if enough energy (>= 4) remains for another step, then deducts 4 and increments steps.",
      },
      {
        id: "t4-q2",
        cellId: "E2",
        targetLine: 4,
        question: "ถ้าลืมเขียนบรรทัดที่ 4 (energy = energy - 4;) จะเกิดอะไรขึ้นเมื่อรันโปรแกรม?",
        questionEn: "If line 4 (energy = energy - 4;) were omitted, what would happen?",
        options: [
          { id: "a", text: "ลูปจะทำงานแค่รอบเดียวแล้วหยุด", textEn: "The loop would run once and stop" },
          { id: "b", text: "เกิดลูปไม่รู้จบ (Infinite Loop) เพราะ energy ไม่ลด", textEn: "An Infinite Loop because energy never decreases" },
          { id: "c", text: "โปรแกรมจะพิมพ์ค่า 0 ทันที", textEn: "The program would immediately print 0" },
          { id: "d", text: "ค่า energy จะลดลงเองอัตโนมัติทีละ 1", textEn: "energy would automatically decrease by 1" },
        ],
        correctOptionId: "b",
        hint: "ถ้าไม่มีบรรทัดที่ลดค่า energy ค่า energy จะเปลี่ยนจาก 10 หรือไม่?",
        hintEn: "Without subtracting from energy, does energy ever change from 10?",
        explanation: "ถ้าไม่ปรับลดค่า energy ในลูป เงื่อนไข energy >= 4 จะเป็นจริงตลอดกาล ทำให้เกิด Infinite Loop",
        explanationEn: "Without updating energy inside the loop, energy >= 4 stays true forever, causing an Infinite Loop.",
      },
      {
        id: "t4-q3",
        cellId: "E4",
        targetLine: 7,
        question: "เมื่อจบการทำงานของโปรแกรมที่บรรทัดที่ 7 ค่าของ energy และ steps ที่เหลืออยู่คือเท่าไหร่?",
        questionEn: "When the program reaches line 7, what are the final values of energy and steps?",
        options: [
          { id: "a", text: "energy = 0, steps = 2", textEn: "energy = 0, steps = 2" },
          { id: "b", text: "energy = 2, steps = 2", textEn: "energy = 2, steps = 2" },
          { id: "c", text: "energy = 4, steps = 3", textEn: "energy = 4, steps = 3" },
          { id: "d", text: "energy = 2, steps = 3", textEn: "energy = 2, steps = 3" },
        ],
        correctOptionId: "b",
        hint: "10 ลบออก 4 สองครั้ง เหลือเศษเท่าไหร่?",
        hintEn: "What remains after subtracting 4 from 10 twice?",
        explanation: "เดินไป 2 ก้าว (steps = 2) ใช้พลังงานไป 8 หน่วย จึงเหลือ energy = 2 หน่วยเมื่อจบโปรแกรม",
        explanationEn: "2 steps consume 8 energy (10 - 8 = 2), leaving energy = 2 and steps = 2.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนพลังงานเริ่มต้น energy ในบรรทัดที่ 1 จาก 10 เป็น 14 แล้วทายว่าจะเดินได้กี่ก้าว (steps)!",
      instructionEn: "Change initial energy on line 1 from 10 to 14 and predict the final steps!",
      suggestedCode: `let energy = 14;
let steps = 0;
while (energy >= 4) {
  energy = energy - 4;
  steps = steps + 1;
}
console.log(steps);`,
      changeDescription: "เปลี่ยน let energy = 10; เป็น let energy = 14;",
      changeDescriptionEn: "Change let energy = 10; to let energy = 14;",
      options: ["3", "2", "4", "5"],
      optionsEn: ["3", "2", "4", "5"],
      explanation: "เมื่อ energy = 14 จะหักออกทีละ 4 ได้ 3 รอบ (14 -> 10 -> 6 -> 2) จึงได้ steps = 3!",
      explanationEn: "With energy = 14, subtracting 4 runs 3 times (14 -> 10 -> 6 -> 2), so steps = 3.",
    },
    badgeReward: {
      id: "badge-while",
      name: "นักควบคุมเงื่อนไขวนซ้ำ",
      nameEn: "Loop Condition Keeper",
      description: "เข้าใจเงื่อนไขการหยุดของลูป while และป้องกันลูปไม่รู้จบได้",
      descriptionEn: "Master while-loop termination conditions and prevent infinite loops.",
    },
  },
  {
    id: 5,
    title: "เรื่องที่ 5 · ฟังก์ชัน",
    titleEn: "Topic 5 · Functions & Return",
    shortName: "5 · ฟังก์ชัน",
    shortNameEn: "5 · Functions",
    subtitle: "แกะรอยการส่งค่าเข้าพารามิเตอร์และการส่งค่ากลับด้วย return",
    subtitleEn: "Trace parameter passing and return values across function calls",
    code: `function calcReward(points, bonus) {
  let result = points * 2 + bonus;
  return result;
}
let first = calcReward(10, 5);
let second = calcReward(20, 0);
console.log(first + second);`,
    predictPrompt: "ก่อนรันโค้ด: บรรทัดสุดท้าย console.log(first + second) จะพิมพ์ค่าเท่าไหร่?",
    predictPromptEn: "Before running: what will the final console.log(first + second) print?",
    predictOptions: ["65", "35", "40", "25"],
    predictOptionsEn: ["65", "35", "40", "25"],
    predictExplanation:
      "first = calcReward(10, 5) ได้ 10*2 + 5 = 25 | second = calcReward(20, 0) ได้ 20*2 + 0 = 40 | รวมกัน 25 + 40 = 65",
    predictExplanationEn:
      "first = calcReward(10, 5) = 10*2 + 5 = 25; second = calcReward(20, 0) = 20*2 + 0 = 40; total = 25 + 40 = 65.",
    steps: [
      {
        stepNumber: 1,
        line: 5,
        codeLine: "let first = calcReward(10, 5);",
        variables: { points: "10", bonus: "5" },
        outputSoFar: [],
        explanation: "เรียกฟังก์ชัน calcReward ครั้งที่ 1 โดยส่ง 10 เข้า points และ 5 เข้า bonus",
        explanationEn: "First call to calcReward: pass 10 to points and 5 to bonus.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: "  let result = points * 2 + bonus;",
        variables: { points: "10", bonus: "5", result: "25" },
        outputSoFar: [],
        explanation: "คำนวณในฟังก์ชัน: 10 * 2 + 5 ได้ result = 25",
        explanationEn: "Compute inside function: 10 * 2 + 5 = 25.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "  return result; // คืนค่าให้ first",
        codeLineEn: "  return result; // return to first",
        variables: { first: "25" },
        outputSoFar: [],
        explanation: "ส่งค่า 25 กลับออกมาเก็บไว้ในตัวแปร first",
        explanationEn: "Return 25 back to the caller and store it in first.",
      },
      {
        stepNumber: 4,
        line: 6,
        codeLine: "let second = calcReward(20, 0);",
        variables: { first: "25", points: "20", bonus: "0" },
        outputSoFar: [],
        explanation: "เรียกฟังก์ชัน calcReward ครั้งที่ 2 โดยส่ง 20 เข้า points และ 0 เข้า bonus",
        explanationEn: "Second call to calcReward: pass 20 to points and 0 to bonus.",
      },
      {
        stepNumber: 5,
        line: 2,
        codeLine: "  let result = points * 2 + bonus;",
        variables: { first: "25", points: "20", bonus: "0", result: "40" },
        outputSoFar: [],
        explanation: "คำนวณในฟังก์ชัน: 20 * 2 + 0 ได้ result = 40 และ return กลับไปเก็บใน second",
        explanationEn: "Compute 20 * 2 + 0 = 40 and return it to second.",
      },
      {
        stepNumber: 6,
        line: 7,
        codeLine: "console.log(first + second);",
        variables: { first: "25", second: "40", "first + second": "65" },
        outputSoFar: ["65"],
        explanation: "นำ first (25) บวกกับ second (40) ได้ 65 แล้วพิมพ์ออกทางหน้าจอ",
        explanationEn: "Add first (25) + second (40) = 65 and print it.",
      },
    ],
    questions: [
      {
        id: "t5-q1",
        cellId: "T3",
        targetLine: 5,
        question: "ในการเรียกใช้ calcReward(10, 5) เลข 10 และเลข 5 ถูกส่งไปเก็บที่ตัวแปรใดของฟังก์ชันตามลำดับ?",
        questionEn: "In calcReward(10, 5), which parameters receive 10 and 5 respectively?",
        options: [
          { id: "a", text: "points = 10 และ bonus = 5", textEn: "points = 10 and bonus = 5" },
          { id: "b", text: "bonus = 10 และ points = 5", textEn: "bonus = 10 and points = 5" },
          { id: "c", text: "result = 10 และ first = 5", textEn: "result = 10 and first = 5" },
          { id: "d", text: "first = 10 และ second = 5", textEn: "first = 10 and second = 5" },
        ],
        correctOptionId: "a",
        hint: "เทียบลำดับในวงเล็บตอนเรียก calcReward(10, 5) กับหัวฟังก์ชัน function calcReward(points, bonus)",
        hintEn: "Match the argument order in calcReward(10, 5) with function calcReward(points, bonus).",
        explanation: "อาร์กิวเมนต์ตัวแรก (10) จับคู่กับพารามิเตอร์ตัวแรก (points) และตัวที่สอง (5) จับคู่กับ bonus",
        explanationEn: "Positional arguments map in order: 10 -> points, 5 -> bonus.",
      },
      {
        id: "t5-q2",
        cellId: "E3",
        targetLine: 3,
        question: "คำสั่ง return result; ในบรรทัดที่ 3 ส่งผลต่อบรรทัดที่ 5 (let first = calcReward(10, 5);) อย่างไร?",
        questionEn: "How does return result; on line 3 affect line 5 (let first = calcReward(10, 5);)?",
        options: [
          { id: "a", text: "ส่งค่าที่คำนวณได้ (25) ออกมาแทนที่การเรียกฟังก์ชัน เพื่อเก็บลงตัวแปร first", textEn: "Sends the computed value (25) back to replace the call, storing 25 in first" },
          { id: "b", text: "พิมพ์เลข 25 ออกทางหน้าจอทันทีโดยไม่ต้องใช้ console.log", textEn: "Prints 25 directly to the console without console.log" },
          { id: "c", text: "รีเซ็ตค่า result ให้กลับเป็น 0", textEn: "Resets result back to 0" },
          { id: "d", text: "หยุดการทำงานของโปรแกรมทั้งหมดทันที", textEn: "Immediately terminates the entire program" },
        ],
        correctOptionId: "a",
        hint: "ถ้าไม่มี return ตัวแปร first ที่รอรับค่าอยู่จะได้ค่าอะไรกลับไป?",
        hintEn: "Without return, what value would first receive from the function call?",
        explanation: "คำสั่ง return ทำหน้าที่ส่งผลลัพธ์จากภายในฟังก์ชันกลับไปยังจุดที่เรียกใช้ ทำให้ first ได้รับค่า 25",
        explanationEn: "return passes the result back to the call site, so first receives 25.",
      },
      {
        id: "t5-q3",
        cellId: "F3",
        targetLine: 1,
        question: "ข้อดีของการแยกสูตรคำนวณไว้ในฟังก์ชัน calcReward แทนการเขียนสูตรซ้ำๆ ในบรรทัดที่ 5 และ 6 คืออะไร?",
        questionEn: "What is the benefit of encapsulating the formula in calcReward instead of repeating it on lines 5 and 6?",
        options: [
          { id: "a", text: "นำสูตรการคำนวณเดิมกลับมาใช้ซ้ำกับข้อมูลชุดใหม่ได้โดยไม่ต้องเขียนโค้ดซ้ำ", textEn: "Reuse the same calculation logic with different inputs without duplicating code" },
          { id: "b", text: "ทำให้ไม่ต้องประกาศตัวแปรใดๆ ในโปรแกรมอีกเลย", textEn: "Eliminates the need for any variables in the program" },
          { id: "c", text: "ทำให้โค้ดไม่ต้องมีการคูณหรือบวกเลข", textEn: "Removes multiplication and addition from the code" },
          { id: "d", text: "ทำให้ฟังก์ชันทำงานเองโดยไม่ต้องเรียกใช้", textEn: "Makes the function execute automatically without being called" },
        ],
        correctOptionId: "a",
        hint: "สังเกตว่าบรรทัดที่ 5 และ 6 ใช้สูตรเดียวกันแต่เปลี่ยนแค่ตัวเลขขาเข้า",
        hintEn: "Notice that lines 5 and 6 apply the same formula with different input numbers.",
        explanation: "ฟังก์ชันช่วยรวมตรรกะที่ใช้ซ้ำไว้ที่เดียว เมื่อต้องการคำนวณรอบใหม่เพียงส่งค่าอาร์กิวเมนต์ใหม่เข้าไป",
        explanationEn: "Functions centralize reusable logic so you can call them with new arguments anytime.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนบรรทัดที่ 6 จาก calcReward(20, 0) เป็น calcReward(20, 10) แล้วทายผลรวมใหม่!",
      instructionEn: "Change line 6 from calcReward(20, 0) to calcReward(20, 10) and predict the new total!",
      suggestedCode: `function calcReward(points, bonus) {
  let result = points * 2 + bonus;
  return result;
}
let first = calcReward(10, 5);
let second = calcReward(20, 10);
console.log(first + second);`,
      changeDescription: "เปลี่ยน calcReward(20, 0) เป็น calcReward(20, 10)",
      changeDescriptionEn: "Change calcReward(20, 0) to calcReward(20, 10)",
      options: ["75", "65", "85", "50"],
      optionsEn: ["75", "65", "85", "50"],
      explanation: "first ได้ 25 ส่วน second ได้ (20*2 + 10) = 50 เมื่อนำมารวมกัน 25 + 50 จึงได้ 75!",
      explanationEn: "first = 25, second = 20*2 + 10 = 50, so 25 + 50 = 75.",
    },
    badgeReward: {
      id: "badge-fn",
      name: "สถาปนิกฟังก์ชัน",
      nameEn: "Function Architect",
      description: "เข้าใจการรับพารามิเตอร์และการส่งคืนค่าด้วย return ข้ามส่วนของโค้ด",
      descriptionEn: "Understand parameters, arguments, and return data flow.",
    },
  },
  {
    id: 6,
    title: "เรื่องที่ 6 · แอเรย์",
    titleEn: "Topic 6 · Arrays",
    shortName: "6 · แอเรย์",
    shortNameEn: "6 · Arrays",
    subtitle: "เข้าถึงสมาชิกด้วย index ตั้งแต่ 0 และวนลูปกรองข้อมูลในแอเรย์",
    subtitleEn: "Access elements by 0-based index and loop through arrays to filter data",
    code: `let nums = [12, 5, 18, 7];
let count = 0;
for (let i = 0; i < nums.length; i++) {
  if (nums[i] >= 10) {
    count = count + 1;
  }
}
console.log(count);`,
    predictPrompt: "ก่อนรันโค้ด: โค้ดนี้จะพิมพ์ค่า count ออกมาเป็นเท่าไหร่?",
    predictPromptEn: "Before running: what value will count print?",
    predictOptions: ["2", "4", "3", "30"],
    predictOptionsEn: ["2", "4", "3", "30"],
    predictExplanation:
      "ในแอเรย์ [12, 5, 18, 7] มีตัวเลขที่ >= 10 อยู่ 2 ตัว คือ 12 และ 18 ดังนั้น count จึงถูกบวกเพิ่ม 2 ครั้ง ได้ผลลัพธ์เป็น 2",
    predictExplanationEn:
      "In [12, 5, 18, 7], two numbers are >= 10 (12 and 18), so count is incremented twice to 2.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "let nums = [12, 5, 18, 7]; let count = 0;",
        variables: { nums: "[12, 5, 18, 7]", "nums.length": "4", count: "0" },
        outputSoFar: [],
        explanation: "สร้างแอเรย์ nums ที่มีสมาชิก 4 ตัว (index 0 ถึง 3) และตั้งตัวนับ count = 0",
        explanationEn: "Create array nums with 4 elements (indices 0–3) and initialize count = 0.",
      },
      {
        stepNumber: 2,
        line: 4,
        codeLine: "if (nums[0] >= 10) // i = 0, nums[0] = 12",
        variables: { i: "0", "nums[0]": "12", "12 >= 10": "true", count: "1" },
        outputSoFar: [],
        explanation: "รอบ i = 0: ดึง nums[0] คือ 12 ซึ่ง >= 10 จึงเพิ่ม count เป็น 1",
        explanationEn: "i = 0: nums[0] is 12 (>= 10), so increment count to 1.",
      },
      {
        stepNumber: 3,
        line: 4,
        codeLine: "if (nums[1] >= 10) // i = 1, nums[1] = 5",
        variables: { i: "1", "nums[1]": "5", "5 >= 10": "false", count: "1" },
        outputSoFar: [],
        explanation: "รอบ i = 1: ดึง nums[1] คือ 5 ซึ่งน้อยกว่า 10 จึงไม่เพิ่มค่า count",
        explanationEn: "i = 1: nums[1] is 5 (< 10), so count stays 1.",
      },
      {
        stepNumber: 4,
        line: 4,
        codeLine: "if (nums[2] >= 10) // i = 2, nums[2] = 18",
        variables: { i: "2", "nums[2]": "18", "18 >= 10": "true", count: "2" },
        outputSoFar: [],
        explanation: "รอบ i = 2: ดึง nums[2] คือ 18 ซึ่ง >= 10 จึงเพิ่ม count เป็น 2",
        explanationEn: "i = 2: nums[2] is 18 (>= 10), so increment count to 2.",
      },
      {
        stepNumber: 5,
        line: 4,
        codeLine: "if (nums[3] >= 10) // i = 3, nums[3] = 7",
        variables: { i: "3", "nums[3]": "7", "7 >= 10": "false", count: "2" },
        outputSoFar: [],
        explanation: "รอบ i = 3: ดึง nums[3] คือ 7 ซึ่งน้อยกว่า 10 จึงไม่เพิ่มค่า count",
        explanationEn: "i = 3: nums[3] is 7 (< 10), so count stays 2.",
      },
      {
        stepNumber: 6,
        line: 8,
        codeLine: "console.log(count);",
        variables: { count: "2" },
        outputSoFar: ["2"],
        explanation: "จบลูป พิมพ์จำนวนตัวเลขที่ผ่านเกณฑ์คือ 2 ออกทางหน้าจอ",
        explanationEn: "Loop ends; print the matching count (2).",
      },
    ],
    questions: [
      {
        id: "t6-q1",
        cellId: "T1",
        targetLine: 1,
        question: "ในแอเรย์ let nums = [12, 5, 18, 7]; ค่าของ nums[2] คือเลขใด?",
        questionEn: "In let nums = [12, 5, 18, 7];, what is the value of nums[2]?",
        options: [
          { id: "a", text: "5", textEn: "5" },
          { id: "b", text: "18", textEn: "18" },
          { id: "c", text: "12", textEn: "12" },
          { id: "d", text: "7", textEn: "7" },
        ],
        correctOptionId: "b",
        hint: "จำไว้เสมอว่าลำดับ (index) ของแอเรย์ใน JavaScript เริ่มนับตัวแรกที่ 0 ไม่ใช่ 1!",
        hintEn: "Remember: JavaScript array indices start at 0, not 1!",
        explanation: "nums[0] = 12, nums[1] = 5, และ nums[2] = 18",
        explanationEn: "nums[0] = 12, nums[1] = 5, and nums[2] = 18.",
      },
      {
        id: "t6-q2",
        cellId: "F3",
        targetLine: 3,
        question: "ทำไมในลูปบรรทัดที่ 3 จึงเขียนเงื่อนไขว่า i < nums.length แทนที่จะเขียนตัวเลขตายตัว?",
        questionEn: "Why does line 3 use i < nums.length instead of a hardcoded number?",
        options: [
          { id: "a", text: "เพื่อให้ลูปปรับจำนวนรอบตามจำนวนสมาชิกจริงของแอเรย์อัตโนมัติ แม้จะเพิ่มหรือลดข้อมูล", textEn: "So the loop automatically adapts to the array's actual length even if items are added or removed" },
          { id: "b", text: "เพราะ JavaScript ห้ามเขียนตัวเลขในบรรทัด for", textEn: "Because JavaScript forbids numbers inside for loops" },
          { id: "c", text: "เพื่อให้ลูปข้ามสมาชิกตัวแรกไปเสมอ", textEn: "To always skip the first array element" },
          { id: "d", text: "เพื่อเรียงลำดับข้อมูลในแอเรย์จากมากไปน้อย", textEn: "To sort array elements in descending order" },
        ],
        correctOptionId: "a",
        hint: "ถ้าเราเพิ่มสมาชิกใน nums อีก 3 ตัว คำว่า nums.length จะเปลี่ยนตามเองหรือไม่?",
        hintEn: "If we add 3 more items to nums, does nums.length update automatically?",
        explanation: "nums.length คืนค่าจำนวนสมาชิกทั้งหมดของแอเรย์ ช่วยให้โค้ดยืดหยุ่นและไม่เกิดปัญหาอ่านเกินขอบเขตแอเรย์",
        explanationEn: "nums.length returns the current array size, keeping the loop flexible and safe from out-of-bounds reads.",
      },
      {
        id: "t6-q3",
        cellId: "T4",
        targetLine: 8,
        question: "หากมองโครงสร้างรวมทั้งโปรแกรม (บรรทัด 1–8) โค้ดชุดนี้แบ่งขั้นตอนการทำงานอย่างไร?",
        questionEn: "Looking at the overall program structure (lines 1–8), how are its steps organized?",
        options: [
          { id: "a", text: "เตรียมข้อมูลและตัวนับ -> วนลูปตรวจเงื่อนไขทีละตัวเพื่อเพิ่มตัวนับ -> แสดงผลลัพธ์รวม", textEn: "Initialize data & counter -> loop and test each item to increment counter -> print final result" },
          { id: "b", text: "แสดงผลลัพธ์ -> ลบข้อมูลในแอเรย์ -> สร้างแอเรย์ใหม่", textEn: "Print result -> delete array items -> create a new array" },
          { id: "c", text: "ประกาศฟังก์ชัน 2 ตัวแล้วนำมาบวกกัน", textEn: "Declare 2 functions and add them" },
          { id: "d", text: "สุ่มตัวเลขใหม่เข้าแอเรย์ไปเรื่อยๆ จนกว่าจะครบ 10", textEn: "Push random numbers into the array until it reaches 10" },
        ],
        correctOptionId: "a",
        hint: "ดูหน้าที่ของบรรทัด 1-2, บรรทัด 3-7, และบรรทัด 8 ตามลำดับ",
        hintEn: "Look at the roles of lines 1–2, lines 3–7, and line 8 in order.",
        explanation: "นี่คือรูปแบบมาตรฐานของการนับตามเงื่อนไข (Filter & Count Pattern): ตั้งค่าเริ่มต้น -> วนลูปคัดกรอง -> แสดงจำนวนที่พบ",
        explanationEn: "This is the standard Filter & Count pattern: initialize -> loop & filter -> print count.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเพิ่มเลข 25 เข้าไปท้ายแอเรย์เป็น [12, 5, 18, 7, 25] แล้วทายว่า count จะพิมพ์ค่าเท่าไหร่!",
      instructionEn: "Append 25 to nums so it becomes [12, 5, 18, 7, 25] and predict the new count!",
      suggestedCode: `let nums = [12, 5, 18, 7, 25];
let count = 0;
for (let i = 0; i < nums.length; i++) {
  if (nums[i] >= 10) {
    count = count + 1;
  }
}
console.log(count);`,
      changeDescription: "เพิ่ม 25 ต่อท้ายแอเรย์ nums",
      changeDescriptionEn: "Append 25 to the nums array",
      options: ["3", "2", "5", "4"],
      optionsEn: ["3", "2", "5", "4"],
      explanation: "มีตัวเลขที่ >= 10 อยู่ 3 ตัวคือ 12, 18 และ 25 ดังนั้นรันจริงจะได้ 3!",
      explanationEn: "There are 3 numbers >= 10 (12, 18, and 25), so count prints 3.",
    },
    badgeReward: {
      id: "badge-array",
      name: "นักสำรวจแอเรย์",
      nameEn: "Array Explorer",
      description: "เข้าใจ index ของแอเรย์และโครงสร้างการวนลูปคัดกรองข้อมูลครบถ้วน",
      descriptionEn: "Master 0-based array indexing and loop-based filtering.",
    },
  },
  {
    id: 7,
    title: "เรื่องที่ 7 · บอสด่าน: จับบั๊กจาก AI",
    titleEn: "Topic 7 · Boss Floor: Catch the AI Bug",
    shortName: "7 · บอสด่าน: จับบั๊กจาก AI",
    shortNameEn: "7 · Boss: Catch AI Bug",
    isBoss: true,
    subtitle: "นักเรียนสั่ง AI ให้เขียนโค้ดหาค่ามากสุด แต่ AI แอบเขียนบั๊กมา! เดินโค้ดจับบั๊กและซ่อมให้ถูกต้อง",
    subtitleEn: "AI wrote code to find the maximum score—but hid a logic bug! Trace it and fix it.",
    aiScenario:
      "คำสั่งที่สั่ง AI: 'เขียนโค้ดหาคะแนนสูงสุดในแอเรย์ scores = [45, 88, 72] แล้วพิมพ์ออกมา' — แต่โค้ดที่ AI เขียนให้กลับพิมพ์ผลลัพธ์ผิด!",
    aiScenarioEn:
      "Prompt given to AI: 'Write code to find the highest score in scores = [45, 88, 72] and print it' — but the AI's code prints the wrong result!",
    code: `let scores = [45, 88, 72];
let max = scores[0];
for (let i = 1; i < scores.length; i++) {
  if (scores[i] < max) {
    max = scores[i];
  }
}
console.log(max);`,
    predictPrompt: "ก่อนซ่อมบั๊ก: โค้ดที่ AI เขียนมาด้านบน เมื่อรันจริงตอนนี้จะพิมพ์เลขอะไรออกมา? (ลองดูเครื่องหมายในบรรทัดที่ 4 ดีๆ!)",
    predictPromptEn: "Before fixing the bug: what number will the AI's code print right now? (Check the operator on line 4!)",
    predictOptions: ["45", "88", "72", "0"],
    predictOptionsEn: ["45", "88", "72", "0"],
    predictExplanation:
      "AI เขียนบรรทัดที่ 4 ผิดเป็น if (scores[i] < max) ซึ่งแปลว่า 'ถ้าน้อยกว่าให้เก็บค่าใหม่' ทำให้แทนที่จะได้ค่าสูงสุด (88) กลับได้ค่าต่ำสุด (45)!",
    predictExplanationEn:
      "The AI mistakenly wrote < instead of > on line 4 (if (scores[i] < max)), so it finds the minimum (45) instead of the maximum (88)!",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "let scores = [45, 88, 72]; let max = scores[0];",
        variables: { scores: "[45, 88, 72]", max: "45" },
        outputSoFar: [],
        explanation: "ตั้งค่าเริ่มต้น max เท่ากับสมาชิกตัวแรกคือ 45",
        explanationEn: "Initialize max to the first element, 45.",
      },
      {
        stepNumber: 2,
        line: 4,
        codeLine: "if (scores[1] < max) // i = 1: เปรียบเทียบ 88 < 45",
        codeLineEn: "if (scores[1] < max) // i = 1: compare 88 < 45",
        variables: { i: "1", "scores[1]": "88", max: "45", "88 < 45": "false (บั๊ก!)" },
        variablesEn: { i: "1", "scores[1]": "88", max: "45", "88 < 45": "false (bug!)" },
        outputSoFar: [],
        explanation: "จุดเกิดบั๊ก! 88 มากกว่า 45 แต่เพราะ AI ใช้เครื่องหมาย < เงื่อนไข 88 < 45 จึงเป็นเท็จ ทำให้ข้าม 88 ไป!",
        explanationEn: "Bug spot! 88 is greater than 45, but because AI used <, 88 < 45 is false and 88 is skipped!",
      },
      {
        stepNumber: 3,
        line: 4,
        codeLine: "if (scores[2] < max) // i = 2: เปรียบเทียบ 72 < 45",
        codeLineEn: "if (scores[2] < max) // i = 2: compare 72 < 45",
        variables: { i: "2", "scores[2]": "72", max: "45", "72 < 45": "false" },
        outputSoFar: [],
        explanation: "รอบ i = 2: เปรียบเทียบ 72 < 45 เป็นเท็จ ค่า max จึงยังค้างอยู่ที่ 45",
        explanationEn: "i = 2: 72 < 45 is also false, so max remains stuck at 45.",
      },
      {
        stepNumber: 4,
        line: 8,
        codeLine: "console.log(max);",
        variables: { max: "45 (ผิดจากที่ต้องการ 88)" },
        variablesEn: { max: "45 (wrong; expected 88)" },
        outputSoFar: ["45"],
        explanation: "พิมพ์ 45 ออกมา ซึ่งกลายเป็นค่าต่ำสุดแทนที่จะเป็นค่าสูงสุด!",
        explanationEn: "Prints 45 (the minimum) instead of the expected maximum (88)!",
      },
    ],
    questions: [
      {
        id: "t7-q1",
        cellId: "F4",
        targetLine: 4,
        question: "ทำไมโค้ดที่ AI เขียนให้จึงทำงานผิดจากเป้าหมาย 'หาคะแนนสูงสุด'?",
        questionEn: "Why does the AI's code fail its goal of finding the highest score?",
        options: [
          { id: "a", text: "เพราะบรรทัดที่ 4 ใช้เครื่องหมาย < (น้อยกว่า) ทำให้โค้ดกลายเป็นหาค่าต่ำสุดแทนค่าสูงสุด", textEn: "Line 4 uses < (less than), turning it into a minimum finder instead of maximum" },
          { id: "b", text: "เพราะตั้งค่าเริ่มต้น let max = scores[0] ผิด ต้องตั้งเป็น 100 เสมอ", textEn: "Because let max = scores[0] is wrong; it must always start at 100" },
          { id: "c", text: "เพราะลูป for เริ่มที่ i = 1 แทนที่จะเริ่มที่ i = 5", textEn: "Because the for loop starts at i = 1 instead of i = 5" },
          { id: "d", text: "เพราะ console.log พิมพ์ตัวแปรผิดตัว", textEn: "Because console.log prints the wrong variable" },
        ],
        correctOptionId: "a",
        hint: "เราต้องการอัปเดตค่า max เมื่อเจอคะแนนที่ 'มากกว่า' หรือ 'น้อยกว่า' ค่า max เดิม?",
        hintEn: "Should max be updated when a score is greater than or less than the current max?",
        explanation: "เป้าหมายคือหาค่าสูงสุด จึงต้องอัปเดต max เมื่อ scores[i] > max แต่ AI เขียน < จึงได้ผลลัพธ์ตรงกันข้าม",
        explanationEn: "To find the maximum, we update max when scores[i] > max; using < reverses the logic.",
      },
      {
        id: "t7-q2",
        cellId: "E3",
        targetLine: 2,
        question: "การกำหนด let max = scores[0]; ในบรรทัดที่ 2 ส่งผลดีต่อการเปรียบเทียบในลูปอย่างไร?",
        questionEn: "Why is initializing let max = scores[0]; on line 2 helpful for the loop?",
        options: [
          { id: "a", text: "ใช้ตัวแรกเป็นค่าตั้งต้นเทียบตั้งแต่ i = 1", textEn: "Sets the first item as baseline to compare from i = 1" },
          { id: "b", text: "ทำให้ไม่ต้องเขียนคำสั่งวนลูปเลย", textEn: "Avoids needing a loop altogether" },
          { id: "c", text: "ช่วยลบสมาชิกตัวแรกออกจากแอเรย์", textEn: "Removes the first element from the array" },
          { id: "d", text: "ทำให้ค่า max กลายเป็นข้อความอัตโนมัติ", textEn: "Converts max into a string automatically" },
        ],
        correctOptionId: "a",
        hint: "ถ้าเราเริ่มที่ scores[0] แล้วในลูปเริ่มเทียบตั้งแต่ i = 1 จะครบทุกตัวในแอเรย์ไหม?",
        hintEn: "Starting max at scores[0] and looping from i = 1 covers every element in the array.",
        explanation: "การตั้งค่าเริ่มต้นด้วย scores[0] ช่วยให้ใช้ข้อมูลจริงตัวแรกเป็นเกณฑ์ตั้งต้น แล้ววนลูปเทียบตั้งแต่ตัวที่สอง (i = 1) เป็นต้นไป",
        explanationEn: "Initializing with scores[0] anchors max to real data before comparing elements from index 1 onward.",
      },
      {
        id: "t7-q3",
        cellId: "T4",
        targetLine: 4,
        question: "ต้องแก้โค้ดบรรทัดที่ 4 อย่างไร โค้ดนี้จึงจะหาค่าสูงสุด (88) ได้ถูกต้อง?",
        questionEn: "How should line 4 be fixed so the code correctly finds 88?",
        options: [
          { id: "a", text: "เปลี่ยน if (scores[i] < max) เป็น if (scores[i] > max)", textEn: "Change if (scores[i] < max) to if (scores[i] > max)" },
          { id: "b", text: "เปลี่ยน if (scores[i] < max) เป็น if (scores[i] === 0)", textEn: "Change if (scores[i] < max) to if (scores[i] === 0)" },
          { id: "c", text: "ลบบรรทัดที่ 5 (max = scores[i];) ทิ้ง", textEn: "Delete line 5 (max = scores[i];)" },
          { id: "d", text: "เปลี่ยน i++ เป็น i--", textEn: "Change i++ to i--" },
        ],
        correctOptionId: "a",
        hint: "เปลี่ยนเครื่องหมายเปรียบเทียบให้ตรงกับคำว่า 'ถ้าคะแนนรอบนี้ มากกว่า ค่าสูงสุดเดิม'",
        hintEn: "Flip the comparison operator to mean 'if current score is greater than max'.",
        explanation: "เมื่อแก้เป็น if (scores[i] > max) ในรอบ i = 1 (88 > 45) จะเป็นจริง และอัปเดต max = 88 ได้ถูกต้อง!",
        explanationEn: "With if (scores[i] > max), 88 > 45 is true on i = 1, updating max to 88.",
      },
    ],
    modifyChallenge: {
      instruction: "ขั้นปราบบอส! แก้บั๊กในบรรทัดที่ 4 จาก < เป็น > แล้วทายผลลัพธ์ที่ได้จากการรันจริง!",
      instructionEn: "Boss Phase! Fix line 4 from < to > and predict the real output!",
      suggestedCode: `let scores = [45, 88, 72];
let max = scores[0];
for (let i = 1; i < scores.length; i++) {
  if (scores[i] > max) {
    max = scores[i];
  }
}
console.log(max);`,
      changeDescription: "แก้บั๊ก AI: เปลี่ยน if (scores[i] < max) เป็น if (scores[i] > max)",
      changeDescriptionEn: "Fix AI bug: change if (scores[i] < max) to if (scores[i] > max)",
      options: ["88", "45", "72", "205"],
      optionsEn: ["88", "45", "72", "205"],
      explanation: "ยอดเยี่ยม! เมื่อแก้ < เป็น > แล้วรันโค้ดจริง โปรแกรมจะพิมพ์ค่าสูงสุด 88 ออกมาอย่างถูกต้อง!",
      explanationEn: "Awesome! Changing < to > makes the code print the true maximum: 88.",
    },
    badgeReward: {
      id: "badge-boss",
      name: "ผู้พิชิตบั๊ก AI",
      nameEn: "AI Bug Slayer",
      description: "อ่านโค้ดที่ AI เขียนออก จับบั๊กตรรกะได้ และแก้ไขจนทำงานถูกต้อง",
      descriptionEn: "Read AI-generated code, spot logic bugs, and fix them.",
    },
  },
];

export interface SecretBadgeDef {
  id: string;
  name: string;
  nameEn?: string;
  description: string;
  descriptionEn?: string;
}

export const SECRET_BADGES: SecretBadgeDef[] = [
  {
    id: "secret-no-hit",
    name: "นักรบไร้รอยขีดข่วน (No-Hit)",
    nameEn: "Untouchable Warrior (No-Hit)",
    description: "เอาชนะมอนสเตอร์โดยไม่เสีย HP และตอบถูกครั้งแรกทุกเฟส",
    descriptionEn: "Defeat the monster without losing HP and answer every phase on the first try.",
  },
  {
    id: "secret-no-skill",
    name: "จอมยุทธ์สายบริสุทธิ์ (No-Skill)",
    nameEn: "Pure Duelist (No-Skill)",
    description: "เอาชนะมอนสเตอร์ทั้งการต่อสู้โดยไม่ใช้สกิลเลย",
    descriptionEn: "Defeat the monster across the entire battle without using any skills.",
  },
  {
    id: "secret-bug-hunter",
    name: "นักล่าบั๊ก (Bug Hunter)",
    nameEn: "Bug Hunter",
    description: "พิชิตภารกิจโบนัสซ่อมโค้ด (Modify Challenge) สำเร็จ",
    descriptionEn: "Complete the bonus Modify Challenge successfully.",
  },
  {
    id: "secret-chest-raider",
    name: "นักล่าสมบัติโค้ด (Chest Raider)",
    nameEn: "Chest Raider",
    description: "ไขรหัสเปิดหีบปริศนาในดันเจี้ยนสำเร็จ",
    descriptionEn: "Unlock the mystery Code Chest inside the dungeon.",
  },
];

export function getLocalizedTopicMeta(topic: TopicQuest, uiLang: "th" | "en") {
  const isEn = uiLang === "en";
  return {
    title: isEn ? topic.titleEn || topic.title : topic.title,
    shortName: isEn ? topic.shortNameEn || topic.shortName : topic.shortName,
    subtitle: isEn ? topic.subtitleEn || topic.subtitle : topic.subtitle,
    aiScenario: isEn ? topic.aiScenarioEn || topic.aiScenario : topic.aiScenario,
    badgeName: isEn ? topic.badgeReward.nameEn || topic.badgeReward.name : topic.badgeReward.name,
    badgeDescription: isEn
      ? topic.badgeReward.descriptionEn || topic.badgeReward.description
      : topic.badgeReward.description,
    modifyInstruction: isEn
      ? topic.modifyChallenge.instructionEn || topic.modifyChallenge.instruction
      : topic.modifyChallenge.instruction,
  };
}

export function getLocalizedSecretBadge(badge: SecretBadgeDef, uiLang: "th" | "en") {
  const isEn = uiLang === "en";
  return {
    name: isEn ? badge.nameEn || badge.name : badge.name,
    description: isEn ? badge.descriptionEn || badge.description : badge.description,
  };
}

export interface TeacherRecord {
  id: string;
  username: string;
  passwordHash: string;
  displayName: string;
  role: "teacher";
}

export const INITIAL_TEACHERS: TeacherRecord[] = [
  {
    id: "tch-1",
    username: "ครูตัวอย่าง",
    passwordHash: "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f", // "12345678"
    displayName: "ครูตัวอย่าง (วิชาวิทยาการคำนวณ)",
    role: "teacher",
  },
  {
    id: "tch-2",
    username: "ครูสมชาย",
    passwordHash: "ef797c8118f02dfb649607dd5d3f8c7623048c9c063d532cc95c5ed7a898a64f", // "12345678"
    displayName: "ครูสมชาย ใจดี (วิทยาการคำนวณ)",
    role: "teacher",
  },
];

export interface StudentRecord {
  id: string;
  nickname: string;
  pinHash: string;
  role?: "student";
  roomCode: string;
  xp: number;
  streak: number;
  completedTopics: number[];
  cellScores: Record<BlockCellId, number>;
  badges: string[];
  explainCount?: number;
  recentExplanations?: {
    language: string;
    summary: string;
    createdAt: string;
  }[];
  history: {
    topicId: number;
    topicTitle: string;
    scorePercent: number;
    xpEarned: number;
    timestamp: string;
  }[];
}

export interface ClassroomRecord {
  roomCode: string;
  roomName: string;
  teacherUsername: string;
  pinnedReviewTopicId: number | null;
  pinnedReviewNote: string;
  createdAt: string;
}

export const INITIAL_CLASSROOMS: ClassroomRecord[] = [
  {
    roomCode: "VIBE26",
    roomName: "ห้องเรียนเปิด Vibe Coding 2026 (สาธิตการแข่งขัน)",
    teacherUsername: "ครูสมชาย",
    pinnedReviewTopicId: 7,
    pinnedReviewNote: "ยินดีต้อนรับสู่ห้องเรียนเปิด! เริ่มฝึกแกะรอยโค้ดและปราบบอสจับบั๊ก AI ได้ทันที",
    createdAt: "14 พ.ย. 2569",
  },
  {
    roomCode: "ABC123",
    roomName: "ม.4/1 วิทยาการคำนวณ (กลุ่ม A)",
    teacherUsername: "ครูตัวอย่าง",
    pinnedReviewTopicId: 4,
    pinnedReviewNote: "สัปดาห์นี้ให้ทบทวนเรื่องลูป while และการส่งค่าข้ามฟังก์ชัน (ช่อง E2, E3)",
    createdAt: "11 พ.ย. 2569",
  },
  {
    roomCode: "JS2026",
    roomName: "ชมรม Vibe Coding รู้เท่าทัน AI",
    teacherUsername: "ครูตัวอย่าง",
    pinnedReviewTopicId: 7,
    pinnedReviewNote: "ฝึกตรวจสอบโค้ดที่ AI เขียนในด่านบอสก่อนส่งโครงงาน",
    createdAt: "11 พ.ย. 2569",
  },
];

export const INITIAL_STUDENTS: StudentRecord[] = [
  {
    id: "stu-0",
    nickname: "ต้นกล้า_สายโค้ด",
    pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", // "1234"
    roomCode: "VIBE26",
    xp: 320,
    streak: 5,
    completedTopics: [1, 2, 3, 4, 5],
    cellScores: {
      T1: 94,
      E1: 90,
      F1: 88,
      T2: 86,
      E2: 82,
      F2: 84,
      T3: 78,
      E3: 72,
      F3: 75,
      T4: 80,
      E4: 88,
      F4: 70,
    },
    badges: ["badge-var", "badge-ifelse", "badge-for", "badge-while", "badge-fn"],
    history: [
      {
        topicId: 5,
        topicTitle: "เรื่องที่ 5 · ฟังก์ชัน",
        scorePercent: 90,
        xpEarned: 65,
        timestamp: "วันนี้ · 10:45",
      },
      {
        topicId: 4,
        topicTitle: "เรื่องที่ 4 · วนซ้ำ while",
        scorePercent: 85,
        xpEarned: 65,
        timestamp: "เมื่อวานนี้",
      },
    ],
  },
  {
    id: "stu-1",
    nickname: "แมวส้ม",
    pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4", // "1234"
    roomCode: "ABC123",
    xp: 260,
    streak: 4,
    completedTopics: [1, 2, 3, 4],
    cellScores: {
      T1: 92,
      E1: 88,
      F1: 85,
      T2: 82,
      E2: 76,
      F2: 80,
      T3: 65,
      E3: 45,
      F3: 58,
      T4: 70,
      E4: 84,
      F4: 42,
    },
    badges: ["badge-var", "badge-ifelse", "badge-for", "badge-while"],
    history: [
      {
        topicId: 1,
        topicTitle: "เรื่องที่ 1 · ตัวแปรและการคำนวณ",
        scorePercent: 95,
        xpEarned: 65,
        timestamp: "เมื่อวานนี้",
      },
      {
        topicId: 2,
        topicTitle: "เรื่องที่ 2 · เงื่อนไข if/else",
        scorePercent: 88,
        xpEarned: 65,
        timestamp: "เมื่อวานนี้",
      },
      {
        topicId: 3,
        topicTitle: "เรื่องที่ 3 · วนซ้ำ for",
        scorePercent: 84,
        xpEarned: 65,
        timestamp: "วันนี้ · 10:15",
      },
      {
        topicId: 4,
        topicTitle: "เรื่องที่ 4 · วนซ้ำ while",
        scorePercent: 78,
        xpEarned: 65,
        timestamp: "วันนี้ · 11:30",
      },
    ],
  },
  {
    id: "stu-2",
    nickname: "เพนกวินฟ้า",
    pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    roomCode: "ABC123",
    xp: 390,
    streak: 6,
    completedTopics: [1, 2, 3, 4, 5, 6],
    cellScores: {
      T1: 95,
      E1: 90,
      F1: 92,
      T2: 88,
      E2: 85,
      F2: 86,
      T3: 82,
      E3: 78,
      F3: 80,
      T4: 75,
      E4: 88,
      F4: 68,
    },
    badges: ["badge-var", "badge-ifelse", "badge-for", "badge-while", "badge-fn", "badge-array"],
    history: [
      {
        topicId: 6,
        topicTitle: "เรื่องที่ 6 · แอเรย์",
        scorePercent: 86,
        xpEarned: 65,
        timestamp: "วันนี้ · 09:40",
      },
      {
        topicId: 5,
        topicTitle: "เรื่องที่ 5 · ฟังก์ชัน",
        scorePercent: 82,
        xpEarned: 65,
        timestamp: "เมื่อวานนี้",
      },
    ],
  },
  {
    id: "stu-3",
    nickname: "กระต่ายขาว",
    pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    roomCode: "ABC123",
    xp: 140,
    streak: 2,
    completedTopics: [1, 2],
    cellScores: {
      T1: 80,
      E1: 72,
      F1: 75,
      T2: 64,
      E2: 48,
      F2: 55,
      T3: 40,
      E3: 35,
      F3: 42,
      T4: 45,
      E4: 52,
      F4: 38,
    },
    badges: ["badge-var", "badge-ifelse"],
    history: [
      {
        topicId: 2,
        topicTitle: "เรื่องที่ 2 · เงื่อนไข if/else",
        scorePercent: 70,
        xpEarned: 55,
        timestamp: "วันนี้ · 08:20",
      },
    ],
  },
  {
    id: "stu-4",
    nickname: "หมีพูห์",
    pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    roomCode: "ABC123",
    xp: 210,
    streak: 3,
    completedTopics: [1, 2, 3],
    cellScores: {
      T1: 85,
      E1: 82,
      F1: 78,
      T2: 74,
      E2: 62,
      F2: 68,
      T3: 52,
      E3: 44,
      F3: 48,
      T4: 55,
      E4: 66,
      F4: 45,
    },
    badges: ["badge-var", "badge-ifelse", "badge-for"],
    history: [
      {
        topicId: 3,
        topicTitle: "เรื่องที่ 3 · วนซ้ำ for",
        scorePercent: 76,
        xpEarned: 60,
        timestamp: "เมื่อวานนี้",
      },
    ],
  },
  {
    id: "stu-5",
    nickname: "ฉลามน้อย",
    pinHash: "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4",
    roomCode: "JS2026",
    xp: 460,
    streak: 7,
    completedTopics: [1, 2, 3, 4, 5, 6, 7],
    cellScores: {
      T1: 96,
      E1: 94,
      F1: 90,
      T2: 92,
      E2: 89,
      F2: 91,
      T3: 88,
      E3: 85,
      F3: 87,
      T4: 90,
      E4: 92,
      F4: 95,
    },
    badges: [
      "badge-var",
      "badge-ifelse",
      "badge-for",
      "badge-while",
      "badge-fn",
      "badge-array",
      "badge-boss",
    ],
    history: [
      {
        topicId: 7,
        topicTitle: "เรื่องที่ 7 · บอสด่าน: จับบั๊กจาก AI",
        scorePercent: 96,
        xpEarned: 80,
        timestamp: "วันนี้ · 11:00",
      },
    ],
  },
];

export interface AiUsageLogItem {
  id: number;
  category: "architecture" | "code" | "security" | "ui" | "asset";
  categoryLabel: string;
  aiTool: string;
  promptTitle: string;
  promptText: string;
  problemFound: string;
  solutionApplied: string;
  codeExplanation: string;
  relatedFiles: string[];
}

export const AI_USAGE_LOGS: AiUsageLogItem[] = [
  {
    id: 1,
    category: "architecture",
    categoryLabel: "สถาปัตยกรรมการเรียนรู้ (Pedagogy & Data Model)",
    aiTool: "Google Gemini 2.5 Pro (ผ่าน Antigravity IDE)",
    promptTitle: "Prompt 1 · ออกแบบชุดคำถามตามกรอบ Block Model 12 ช่อง",
    promptText:
      "ช่วยออกแบบโครงสร้างคำถามวัดความเข้าใจโค้ด JavaScript ระดับมัธยมตามกรอบ Block Model (Schulte, 2008) ทั้ง 12 ช่อง (ระดับ Atom, Block, Relation, Macro × มิติ Text Surface, Execution, Function) โดยให้มีคำใบ้เมื่อตอบผิดครั้งที่ 1 และเฉลยละเอียดเมื่อตอบผิดครั้งที่ 2",
    problemFound:
      "AI เจนคำถามที่เน้นแต่การถามผลลัพธ์สุดท้าย (ช่อง E4) ซ้ำกันหลายข้อ และขาดคำถามระดับความสัมพันธ์ระหว่างบล็อก (T3, E3, F3)",
    solutionApplied:
      "ทีมปรับตาราง Mapping คำถามใหม่ด้วยตัวเองให้ครบทั้ง 12 ช่องอย่างชัดเจน พร้อมติดป้ายรหัสช่อง (T1–F4) กำกับทุกข้อ และเชื่อมเข้ากับกระบวนการเรียน 4 ขั้น (PRIMM)",
    codeExplanation:
      "กำหนดโครงสร้างข้อมูล BLOCK_MODEL_CELLS (12 ช่อง: T1–T4, E1–E4, F1–F4) และ TOPICS ทั้ง 7 เรื่องในไฟล์ curriculum.ts โดยแต่ละคำถามระบุ cellId และ targetLine ชัดเจน เพื่อคำนวณคะแนนความเข้าใจรายช่องแบบถ่วงน้ำหนัก",
    relatedFiles: ["app/lib/curriculum.ts", "app/components/BlockModelGrid.tsx"],
  },
  {
    id: 2,
    category: "code",
    categoryLabel: "เอนจินรันโค้ดและตรวจคำตอบ (Execution Engine)",
    aiTool: "Google Gemini 2.5 Pro (ผ่าน Antigravity IDE)",
    promptTitle: "Prompt 2 · สร้างตัวรันโค้ดจริงสำหรับตรวจคำตอบข้อทำนายผล (PRIMM)",
    promptText:
      "เขียนฟังก์ชันรันโค้ด JavaScript ในฝั่งเว็บแอปที่ดักจับค่าจาก console.log เพื่อนำผลรันจริงมาตรวจคำตอบในขั้น Predict และ Modify ของกระบวนการ PRIMM พร้อมป้องกัน Infinite Loop",
    problemFound:
      "ตอนแรก AI แนะนำให้ส่งโค้ดไปถาม LLM ว่าโค้ดนี้พิมพ์อะไร ซึ่งเสี่ยงที่ AI จะเดาคำตอบผิด (Hallucination) และต้องพึ่งพาอินเทอร์เน็ตตลอดเวลา",
    solutionApplied:
      "เปลี่ยนมาใช้ Sandbox Function Runner รันโค้ด JavaScript จริงในระบบ พร้อมตัวตรวจจับรูปแบบโค้ดที่ไม่ปลอดภัยและจำกัดจำนวนบรรทัดแสดงผล เพื่อให้ผลลัพธ์แม่นยำ 100% จากการรันจริง",
    codeExplanation:
      "ฟังก์ชัน runJavaScriptReal ในไฟล์ codeAnalyzer.ts สร้าง customConsole ที่ดักจับอาร์กิวเมนต์จาก console.log เก็บลงแอเรย์ logs แล้วประมวลผลผ่าน new Function('console', code) ภายในบล็อก try/catch คืนค่าทั้งสถานะความสำเร็จและข้อความเอาต์พุตจริง",
    relatedFiles: ["app/lib/codeAnalyzer.ts", "app/components/PracticeArena.tsx"],
  },
  {
    id: 3,
    category: "security",
    categoryLabel: "ระบบ AI หลังบ้านและความปลอดภัยของ API Key (Backend & AI API)",
    aiTool: "Google Gemini (gemini-3.5-flash-lite + Auto-Fallback) + Antigravity IDE",
    promptTitle: "Prompt 3 · พัฒนา API หลังบ้านอธิบายโค้ด 6 ภาษาและแปลงโค้ดเป็นดันเจี้ยน 3 เฟส",
    promptText:
      "สร้าง Next.js Route Handlers (/api/explain, /api/explain/to-dungeon และ /api/interrogate) สำหรับส่งโค้ดไปวิเคราะห์ทีละบรรทัดและสร้างโจทย์ดันเจี้ยน 3 เฟส (Predict, Trace, Modify) ด้วย Gemini API โดยเก็บ GEMINI_API_KEY ไว้ที่ฝั่งเซิร์ฟเวอร์เท่านั้น พร้อมทำ Rate Limit ป้องกันการยิงสแปม",
    problemFound:
      "เมื่อไม่มีการตั้งค่า API Key ในเครื่องทดสอบ หรือเมื่ออินเทอร์เน็ตขัดข้อง/ติดโควตา หน้าเว็บเกิด Error และไม่สามารถใช้งานฟีเจอร์อธิบายโค้ดหรือสร้างดันเจี้ยนต่อได้",
    solutionApplied:
      "เพิ่มระบบ Hybrid Fallback Engine (Deterministic Code Analyzer & Heuristic Evaluator) ที่สลับมาวิเคราะห์โครงสร้างโค้ดและสร้างโจทย์ดันเจี้ยน 3 เฟสได้อัตโนมัติภายในเสี้ยววินาทีแม้ไม่มี API Key พร้อมระบบสลับโมเดล Gemini สำรองอัตโนมัติเมื่อโควตาเต็ม และจำกัดอัตราเรียกใช้ (Rate Limiting ต่อ IP และโควตา Guest)",
    codeExplanation:
      "Route Handlers ฝั่งเซิร์ฟเวอร์อ่านค่า process.env.GEMINI_API_KEY เฉพาะใน Node.js runtime (ไม่ส่งออกไปที่ฝั่ง Client เด็ดขาดตามกติกาหน้า 4) เรียก gemini-3.5-flash-lite แบบกำหนด JSON Schema ผ่าน gemini-client.ts ซึ่งจะสลับไปโมเดลสำรอง (gemini-3.6-flash / gemini-3.7-flash) อัตโนมัติเมื่อโควตาเต็ม และหากเกิดข้อผิดพลาดทั้งหมดจะสลับไปใช้ฟังก์ชันวิเคราะห์โครงสร้างโค้ดใน explain-code.ts ทันที",
    relatedFiles: [
      "app/api/explain/route.ts",
      "app/api/explain/to-dungeon/route.ts",
      "app/api/interrogate/route.ts",
      "app/lib/explain-code.ts",
    ],
  },
  {
    id: 4,
    category: "security",
    categoryLabel: "การคุ้มครองข้อมูลส่วนบุคคล (PDPA Compliance)",
    aiTool: "Google Gemini 2.5 Pro (ผ่าน Antigravity IDE)",
    promptTitle: "Prompt 4 · ออกแบบระบบล็อกอินด้วยชื่อเล่นสมมติและการแฮช PIN ตาม PDPA พ.ศ. 2562",
    promptText:
      "สร้างระบบเข้าสู่ระบบสำหรับนักเรียนด้วยชื่อเล่นสมมติและรหัส PIN 4 หลัก ผูกกับรหัสห้องของครู โดยแฮช PIN ด้วย SHA-256 ที่ฝั่งหลังบ้านตามหลัก พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562 (PDPA)",
    problemFound:
      "AI สร้างฟอร์มมาตรฐานที่มีช่องกรอกอีเมล ชื่อ-นามสกุลจริง และเบอร์โทรศัพท์มาให้ ซึ่งขัดต่อหลักการคุ้มครองข้อมูลส่วนบุคคลของนักเรียนในระดับโรงเรียน",
    solutionApplied:
      "ตัดช่องข้อมูลส่วนบุคคลที่ระบุตัวตนได้จริง (PII) ออกทั้งหมด เหลือเพียงชื่อเล่นสมมติ (Pseudonym) เช่น 'แมวส้ม' และ PIN 4 หลักที่ผ่านการแฮช SHA-256 พร้อมป้ายแจ้งเตือนห้ามใช้ชื่อจริงในทุกหน้าฟอร์ม",
    codeExplanation:
      "ระบบตรวจสอบสิทธิ์ใน /api/auth/route.ts ใช้ Web Crypto API / Node crypto คำนวณค่าแฮช SHA-256 ของรหัส PIN และรหัสผ่านครูก่อนเปรียบเทียบหรือบันทึกลงฐานข้อมูล Supabase และจัดการ Session ผ่าน HttpOnly Cookie ร่วมกับสถานะฝั่ง Client",
    relatedFiles: ["app/api/auth/route.ts", "app/login/page.tsx", "app/register/page.tsx"],
  },
  {
    id: 5,
    category: "ui",
    categoryLabel: "แดชบอร์ดครูและการเข้าถึงสำหรับทุกคน (Teacher Analytics & Accessibility)",
    aiTool: "Google Gemini 2.5 Pro (ผ่าน Antigravity IDE)",
    promptTitle: "Prompt 5 · สร้างหน้าแดชบอร์ดครูและแผนที่ Block Model เฉลี่ยทั้งห้อง",
    promptText:
      "สร้างหน้าวิเคราะห์ผลสำหรับครูที่คำนวณค่าเฉลี่ยความเข้าใจทั้ง 12 ช่องของนักเรียนทุกคนในห้อง แยกสีและข้อความกำกับเก่ง/กลาง/ควรทบทวน ปักหมุดเรื่องที่ต้องทบทวน และคัดลอกสรุปไปใช้ปรับการสอนได้",
    problemFound:
      "ต้นแบบแรกแสดงผลเฉพาะสีเขียว/เหลือง/แดงโดยไม่มีข้อความกำกับ ทำให้ผู้ที่มีภาวะตาบอดสีแยกสถานะได้ยาก และคอนทราสต์สีไม่ผ่านเกณฑ์มาตรฐาน",
    solutionApplied:
      "ปรับใช้ฟังก์ชัน getMasteryStatus ที่แสดงข้อความกำกับคู่กับสีเสมอ ('เก่ง 80% ขึ้นไป', 'กลาง 50–79%', 'ควรทบทวน ต่ำกว่า 50%') ด้วยคู่สีที่ผ่านเกณฑ์ความต่างสี WCAG AA (> 4.5:1) พร้อมฟีเจอร์ปักหมุดบทเรียนส่งตรงไปยังหน้าเควสต์ของนักเรียน",
    codeExplanation:
      "คอมโพเนนต์ TeacherDashboard.tsx และ /teacher/page.tsx ดึงข้อมูลคะแนนรายช่องของนักเรียนในห้องมาคำนวณค่าเฉลี่ยทั้ง 12 ช่อง จัดลำดับช่องที่ห้องอ่อนที่สุด และซิงค์รหัสเรื่องที่ครูปักหมุด (pinnedReviewTopicId) ผ่าน API ห้องเรียน",
    relatedFiles: [
      "app/components/TeacherDashboard.tsx",
      "app/teacher/page.tsx",
      "app/api/teacher/classrooms/route.ts",
    ],
  },
  {
    id: 6,
    category: "code",
    categoryLabel: "เกมดันเจี้ยน 2D Pixel RPG และสไปรต์โค้ด CC0 (Gamification Engine)",
    aiTool: "Google Gemini 2.5 Pro (ผ่าน Antigravity IDE)",
    promptTitle: "Prompt 6 · สร้างเอนจินเกม 2D Pixel RPG Dungeon และสไปรต์พิกเซลในโค้ด",
    promptText:
      "พัฒนาเอนจินเกม 2D Pixel RPG บน HTML5 Canvas สำหรับดันเจี้ยนฝึกอ่านโค้ด 6 ภาษา มีฮีโร่ 4 คลาส มอนสเตอร์ประจำบทเรียน ระบบต่อสู้ 3 เฟส (Predict, Trace, Modify) และวาดสไปรต์พิกเซลด้วยเมทริกซ์ในโค้ดเพื่อไม่ให้ติดลิขสิทธิ์ภาพภายนอก",
    problemFound:
      "การเรนเดอร์ Canvas ซ้ำทุกเฟรมเมื่อเปิดหน้าต่างคำถามทำให้กินทรัพยากรเครื่องบนมือถือ และสไปรต์ขนาดเล็กไม่คมชัดหากไม่ตั้งค่าการขยายพิกเซลให้ถูกต้อง",
    solutionApplied:
      "ปรับแต่ง GameCanvas ให้ใช้ imageSmoothingEnabled = false เพื่อความคมชัดระดับพิกเซลเรโทร แยกเลเยอร์ BattleOverlay ออกมาทำงานร่วมกับสถานะเกม และออกแบบเมทริกซ์สี 26 สีใน palette.ts และ sprites.ts แบบปลอดลิขสิทธิ์ 100% (CC0)",
    codeExplanation:
      "ใช้เมทริกซ์พิกเซล 2 มิติใน sprites.ts วาดลงบน HTML5 Canvas ผ่าน GameCanvas.tsx และควบคุมตรรกะการเดินสำรวจห้อง หีบสมบัติ และฉากต่อสู้มอนสเตอร์ด้วย State Machine ใน DungeonRunScreen.tsx และ TacticalDungeonScreen.tsx",
    relatedFiles: [
      "app/components/dungeon/GameCanvas.tsx",
      "app/lib/dungeon/sprites.ts",
      "app/lib/dungeon/mapgen.ts",
      "app/components/DungeonRunScreen.tsx",
    ],
  },
  {
    id: 7,
    category: "asset",
    categoryLabel: "การสร้างภาพประกอบ โลโก้ และไอคอนด้วย AI (Generative AI Visual Assets)",
    aiTool: "Generative AI Image Generator + Python Pillow Script (ผ่าน Antigravity IDE)",
    promptTitle: "Prompt 7 · ออกแบบโลโก้หลัก (logo.png) และสร้างชุด Favicon / App Icons",
    promptText:
      "ออกแบบโลโก้ 'CODE COOL (ExplainCode)' สไตล์ Pixel RPG ผสานสัญลักษณ์โค้ดโปรแกรมมิงโทนสีทอง-ม่วงเข้มสำหรับพื้นหลังโหมดมืด แล้วนำไฟล์ logo.png ไปสร้างชุดไอคอนมาตรฐาน favicon.ico (หลายขนาด 16x16 ถึง 64x64), icon.png และ apple-icon.png พร้อมเชื่อมต่อใน Navbar และทุกหน้าของระบบ",
    problemFound:
      "ภาพโลโก้ต้นฉบับมีความละเอียดสูง (1472×704 พิกเซล ทรงแนวนอน) หากรัดสัดส่วนลงในกรอบจัตุรัสหรือทำเป็น Favicon ขนาด 16×16 พิกเซลโดยตรงจะทำให้ภาพบิดเบี้ยว (Aspect Ratio เพี้ยน) และมองเห็นรายละเอียดไม่ชัดบนแท็บเบราว์เซอร์",
    solutionApplied:
      "ใช้สคริปต์จัดวางภาพโลโก้ให้อยู่กึ่งกลางจัตุรัสแบบรักษาสัดส่วนเดิม (Square Padding with Transparent/Dark Canvas) และใช้การย่อขนาดแบบ LANCZOS Resampling สร้างไฟล์ favicon.ico แบบ Multi-resolution (16, 32, 48, 64px) รวมถึงกำหนดคลาส object-contain ในคอมโพเนนต์ Image ทุกจุด",
    codeExplanation:
      "จัดเก็บไฟล์โลโก้หลักไว้ที่ public/logo.png และสร้างไฟล์ไอคอนมาตรฐานของ Next.js App Router ได้แก่ app/favicon.ico, app/icon.png (192×192) และ app/apple-icon.png (180×180) พร้อมตั้งค่า Metadata icons ใน app/layout.tsx และแสดงผลใน SiteHeader.tsx, TeacherDashboard.tsx และหน้าดันเจี้ยนทั้งหมด",
    relatedFiles: [
      "public/logo.png",
      "app/favicon.ico",
      "app/layout.tsx",
      "app/components/SiteHeader.tsx",
    ],
  },
];

/**
 * คำนวณสถานะความเข้าใจตามเกณฑ์ Design System หน้า 6:
 * - เก่ง 80% ขึ้นไป (#d8efdc / #14532d)
 * - กลาง 50–79% (#fbeacb / #5c3704)
 * - ควรทบทวน ต่ำกว่า 50% (#f8d9d4 / #7d1d10)
 */
export function getMasteryStatus(
  score: number,
  lang: "th" | "en" = "th"
): {
  level: "good" | "mid" | "low";
  label: string;
  shortLabel: string;
  bgHex: string;
  inkHex: string;
  className: string;
} {
  if (score >= 80) {
    return {
      level: "good",
      label: lang === "en" ? "Mastered 80%+" : "เก่ง 80% ขึ้นไป",
      shortLabel: lang === "en" ? "Mastered" : "เก่ง",
      bgHex: "#d8efdc",
      inkHex: "#14532d",
      className: "bg-[#d8efdc] text-[#14532d] border-[#86efac]",
    };
  }
  if (score >= 50) {
    return {
      level: "mid",
      label: lang === "en" ? "Developing 50–79%" : "กลาง 50–79%",
      shortLabel: lang === "en" ? "Developing" : "กลาง",
      bgHex: "#fbeacb",
      inkHex: "#5c3704",
      className: "bg-[#fbeacb] text-[#5c3704] border-[#fcd34d]",
    };
  }
  return {
    level: "low",
    label: lang === "en" ? "Needs Review < 50%" : "ควรทบทวน ต่ำกว่า 50%",
    shortLabel: lang === "en" ? "Review" : "ควรทบทวน",
    bgHex: "#f8d9d4",
    inkHex: "#7d1d10",
    className: "bg-[#f8d9d4] text-[#7d1d10] border-[#fca5a5]",
  };
}

// ============================================================================
// ระบบคุ้มครองข้อมูลส่วนบุคคล (Active PDPA Guard — พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562)
// ============================================================================

export interface PdpaValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * ตรวจสอบว่าชื่อเล่นสมมติหรือชื่อผู้ใช้มีข้อมูลส่วนบุคคลที่ระบุตัวตนได้จริง (PII) หรือไม่
 * ตามกติกาการแข่งขัน Vibe Coding 2026 หน้า 4 ข้อ 2.3 (PDPA พ.ศ. 2562)
 */
export function validatePdpaIdentifier(raw: string): PdpaValidationResult {
  const clean = (raw || "").trim();
  if (!clean) {
    return { valid: false, reason: "กรุณากรอกชื่อเล่นสมมติ" };
  }

  if (clean.length < 2 || clean.length > 32) {
    return {
      valid: false,
      reason: "ชื่อเล่นสมมติควรมีความยาว 2–32 ตัวอักษร",
    };
  }

  // 1. ห้ามใช้อีเมล
  if (/@/.test(clean) || /\.(com|net|ac\.th|co\.th|org)\b/i.test(clean)) {
    return {
      valid: false,
      reason:
        "ตามหลัก PDPA พ.ศ. 2562 ห้ามใช้อีเมลเป็นชื่อเล่น กรุณาใช้ฉายาหรือชื่อสมมติแทน",
    };
  }

  // 2. ห้ามใช้คำนำหน้าชื่อจริง (นาย, นาง, นางสาว, น.ส., ด.ช., ด.ญ., เด็กชาย, เด็กหญิง)
  if (
    /^(นาย|นางสาว|นาง|น\.ส\.|ด\.ช\.|ด\.ญ\.|เด็กชาย|เด็กหญิง|mr\.|mrs\.|ms\.|miss\s)/i.test(
      clean
    )
  ) {
    return {
      valid: false,
      reason:
        "ตรวจพบคำนำหน้าชื่อจริง! ตามหลัก PDPA พ.ศ. 2562 กรุณาใช้ชื่อเล่นสมมติแทนชื่อ-นามสกุลจริง",
    };
  }

  // 3. ห้ามใส่เบอร์โทรศัพท์ (ตัวเลขติดกัน 9-10 หลักที่ขึ้นต้นด้วย 0) หรือเลขบัตรประชาชน 13 หลัก
  const digitsOnly = clean.replace(/[\s-]/g, "");
  if (/^0\d{8,9}$/.test(digitsOnly) || /\b0[689]\d{8}\b/.test(digitsOnly)) {
    return {
      valid: false,
      reason:
        "ตรวจพบตัวเลขลักษณะเบอร์โทรศัพท์! ตามหลัก PDPA พ.ศ. 2562 ห้ามกรอกเบอร์โทรศัพท์",
    };
  }

  if (/\b\d{13}\b/.test(digitsOnly)) {
    return {
      valid: false,
      reason:
        "ตรวจพบตัวเลข 13 หลัก! ตามหลัก PDPA พ.ศ. 2562 ห้ามกรอกเลขประจำตัวประชาชนหรือรหัสนักเรียนยาว",
    };
  }

  return { valid: true };
}
