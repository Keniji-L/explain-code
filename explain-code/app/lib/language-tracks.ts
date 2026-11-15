import { TOPICS, TopicQuest, runJavaScriptReal } from "./curriculum";

export type LearningLanguage =
  | "javascript"
  | "python"
  | "sql"
  | "typescript"
  | "cpp"
  | "java"
  | "html";

export interface LanguageTrackMeta {
  id: LearningLanguage;
  name: string;
  nameEn?: string;
  shortBadge: string;
  categoryLabel: string;
  categoryLabelEn?: string;
  tagline: string;
  taglineEn?: string;
  description: string;
  descriptionEn?: string;
  accentColor: string;
  bgTint: string;
  borderColor: string;
  dungeonRealmName: string;
  dungeonRealmNameEn: string;
  highlights: string[];
  highlightsEn?: string[];
  sampleCodePreview: string;
  defaultPlaygroundCode: string;
  playgroundDescription: string;
}

export const LANGUAGE_TRACKS: LanguageTrackMeta[] = [
  {
    id: "javascript",
    name: "JavaScript",
    nameEn: "JavaScript",
    shortBadge: "JS · Web & Logic",
    categoryLabel: "ประเภทที่ 1 · พัฒนาเว็บและตรรกะแอปพลิเคชัน",
    categoryLabelEn: "Track 1 · Web & Application Logic",
    tagline: "ภาษาหลักของเว็บยุคใหม่ ฝึกแกะตรรกะ ตัวแปร ลูป และฟังก์ชัน",
    taglineEn:
      "Core language of the modern web — trace variables, loops, and functions",
    description:
      "เหมาะสำหรับผู้เริ่มต้นและผู้ที่ต้องการสร้างเว็บไซต์หรือแอปพลิเคชัน ฝึกอ่านโครงสร้างปีกกา { }, เงื่อนไข if/else, ลูป for/while และการตรวจสอบโค้ด JavaScript ที่ได้จาก AI",
    descriptionEn:
      "Ideal for web builders and beginners. Practice reading { } blocks, if/else conditions, for/while loops, and verifying AI-generated JavaScript.",
    accentColor: "#0f766e",
    bgTint: "#e3f1ee",
    borderColor: "#0f766e",
    dungeonRealmName: "ปราสาทจาวาสคริปต์",
    dungeonRealmNameEn: "Castle of JavaScript",
    highlights: [
      "ตัวแปร let / const และการไหลของค่าข้อมูลทีละบรรทัด",
      "เงื่อนไข if / else if / else และการวนซ้ำด้วย for / while",
      "ฟังก์ชัน, แอเรย์ (Array) และการจับบั๊กโค้ด AI ฝั่งเว็บ",
    ],
    highlightsEn: [
      "let / const variables and line-by-line state flow",
      "if / else if / else branching and for / while loops",
      "Functions, Arrays, and catching AI web logic bugs",
    ],
    sampleCodePreview: `let prices = [120, 80, 200];\nlet total = 0;\nfor (let i = 0; i < prices.length; i++) {\n  total += prices[i];\n}\nconsole.log(total);`,
    defaultPlaygroundCode: `let items = [20, 35, 15];\nlet total = 0;\nfor (let i = 0; i < items.length; i++) {\n  total += items[i];\n}\nconsole.log("ผลรวม =", total);`,
    playgroundDescription:
      "วางโค้ด JavaScript ที่คุณได้มาจาก AI แล้วกดรันจริงเพื่อดูผลลัพธ์จาก console.log โดยไม่ใช้การเดา",
  },
  {
    id: "python",
    name: "Python",
    nameEn: "Python",
    shortBadge: "PY · Data & AI",
    categoryLabel: "ประเภทที่ 2 · วิเคราะห์ข้อมูล, AI และอัลกอริทึม",
    categoryLabelEn: "Track 2 · Data, AI & Algorithms",
    tagline: "ภาษายอดนิยมอันดับ 1 สำหรับงาน AI, Data Science และระบบอัตโนมัติ",
    taglineEn:
      "The #1 language for AI, Data Science, and automation workflows",
    description:
      "ไวยากรณ์กระชับ อ่านง่าย ใช้การย่อหน้า (Indentation) แทนปีกกา ฝึกไล่ค่าตัวแปรใน List, ลูป for ... in range(), ฟังก์ชัน def และจับบั๊กการย่อหน้าหรือขอบเขต range ที่ AI มักเขียนพลาด",
    descriptionEn:
      "Clean indentation-based syntax. Trace list values, for ... in range() loops, and catch off-by-one or indentation bugs common in AI code.",
    accentColor: "#1d4ed8",
    bgTint: "#dbeafe",
    borderColor: "#2563eb",
    dungeonRealmName: "หุบเขามังกรไพธอน",
    dungeonRealmNameEn: "Python Dragon Valley",
    highlights: [
      "โครงสร้างการย่อหน้า (Indentation) และเงื่อนไข if / elif / else",
      "การวนซ้ำด้วย for ... in range() และการจัดการข้อมูลด้วย List",
      "การสร้างฟังก์ชันด้วย def และการตรวจจับบั๊กขอบเขตข้อมูลใน Python",
    ],
    highlightsEn: [
      "Indentation blocks and if / elif / else branching",
      "for ... in range() bounds and List traversal",
      "def functions and spotting Python off-by-one bugs",
    ],
    sampleCodePreview: `scores = [70, 85, 90]\ntotal = 0\nfor s in scores:\n    total += s\nprint(total / len(scores))`,
    defaultPlaygroundCode: `scores = [70, 85, 90]\ntotal = 0\nfor s in scores:\n    total = total + s\navg = total / len(scores)\nprint("คะแนนเฉลี่ย =", avg)`,
    playgroundDescription:
      "ทดลองเขียนหรือวางโค้ด Python พื้นฐาน แล้วกดรันเพื่อดูผลลัพธ์จากคำสั่ง print(...) ได้ทันที",
  },
  {
    id: "sql",
    name: "SQL",
    nameEn: "SQL",
    shortBadge: "SQL · Database & Query",
    categoryLabel: "ประเภทที่ 3 · ฐานข้อมูลและการดึงข้อมูลเชิงลึก",
    categoryLabelEn: "Track 3 · Databases & Analytical Queries",
    tagline: "ภาษามาตรฐานสำหรับค้นหา กรอง และสรุปผลข้อมูลจากฐานข้อมูล",
    taglineEn:
      "Standard query language for filtering, grouping, and summarizing table data",
    description:
      "ฝึกอ่านคำสั่งดึงข้อมูลจากตาราง (Table) ทำความเข้าใจลำดับการทำงานจริงของ SELECT, FROM, WHERE, GROUP BY, ORDER BY และ INNER JOIN เพื่อตรวจสอบคำสั่ง SQL ที่ AI สร้างให้ถูกต้อง",
    descriptionEn:
      "Master real SQL execution order (FROM -> WHERE -> GROUP BY -> HAVING -> SELECT -> ORDER BY) to verify AI-generated database queries.",
    accentColor: "#6d3fc0",
    bgTint: "#ede9fe",
    borderColor: "#6d3fc0",
    dungeonRealmName: "คลังศิลา SQL",
    dungeonRealmNameEn: "SQL Vault of Records",
    highlights: [
      "การดึงและกรองข้อมูลด้วย SELECT, FROM, WHERE และตัวดำเนินการเปรียบเทียบ",
      "การเรียงลำดับ ORDER BY, จำกัดแถว LIMIT และสรุปผลด้วย COUNT / SUM / GROUP BY",
      "การเชื่อมตารางด้วย INNER JOIN และการจับบั๊กเงื่อนไข WHERE ที่ผิดพลาดจาก AI",
    ],
    highlightsEn: [
      "Selecting & filtering rows with SELECT, FROM, and WHERE",
      "Sorting with ORDER BY and aggregating with GROUP BY / SUM",
      "Distinguishing WHERE vs HAVING in grouped queries",
    ],
    sampleCodePreview: `SELECT category, SUM(price) AS total_sales\nFROM products\nWHERE stock > 0\nGROUP BY category;`,
    defaultPlaygroundCode: `SELECT name, price\nFROM products\nWHERE price >= 100\nORDER BY price DESC;`,
    playgroundDescription:
      "ทดลองรันคำสั่ง SQL กับตารางจำลอง products (id, name, category, price, stock) เพื่อดูผลลัพธ์ที่ได้จริง",
  },
  {
    id: "typescript",
    name: "TypeScript",
    nameEn: "TypeScript",
    shortBadge: "TS · Typed Web",
    categoryLabel: "ประเภทที่ 4 · เว็บแอปพลิเคชันแบบมี Type ปลอดภัย",
    categoryLabelEn: "Track 4 · Type-Safe Web Engineering",
    tagline:
      "จาวาสคริปต์เสริมเกราะ Type Safety ฝึกอ่าน Interface, Union Type และ Generic",
    taglineEn:
      "Typed JavaScript — master interfaces, union narrowing, and generics",
    description:
      "ภาษาหลักของการพัฒนาเว็บระดับมืออาชีพและ Next.js ฝึกอ่านการกำหนด Type, Interface, Union Type Narrowing และการจับจุดที่ AI มักใช้ any หรือละเลย null/empty guard",
    descriptionEn:
      "Essential for modern full-stack & Next.js apps. Read type annotations, interfaces, union narrowing, and catch unsafe AI 'any' or empty-array assumptions.",
    accentColor: "#0284c7",
    bgTint: "#e0f2fe",
    borderColor: "#0284c7",
    dungeonRealmName: "วิหารไทป์สคริปต์",
    dungeonRealmNameEn: "Temple of TypeScript",
    highlights: [
      "การประกาศชนิดข้อมูล (Type Annotations) และโครงสร้าง interface",
      "Union Types & Type Narrowing เพื่อควบคุมทางแยกอย่างปลอดภัย",
      "Generics <T> และ readonly array เพื่อป้องกันการกลายพันธุ์ข้อมูล",
    ],
    highlightsEn: [
      "Type annotations and interface object contracts",
      "Union types and safe if/else type narrowing",
      "Generics <T> and readonly array immutability guards",
    ],
    sampleCodePreview: `interface Product {\n  name: string;\n  price: number;\n}\nconst item: Product = { name: "Mouse", price: 450 };\nconsole.log(item.price * 2);`,
    defaultPlaygroundCode: `interface Product {\n  name: string;\n  price: number;\n}\nconst item: Product = { name: "Mouse", price: 450 };\nconst qty: number = 2;\nconsole.log(item.price * qty);`,
    playgroundDescription:
      "ทดลองเขียนหรือวางโค้ด TypeScript เพื่อแปลง Type Annotation และรันตรวจผลลัพธ์จริง",
  },
  {
    id: "cpp",
    name: "C++",
    nameEn: "C++",
    shortBadge: "C++ · Systems & Speed",
    categoryLabel: "ประเภทที่ 5 · ระบบคอมพิวเตอร์, อัลกอริทึม และความเร็วสูง",
    categoryLabelEn: "Track 5 · Systems, Memory & Competitive Algorithms",
    tagline:
      "ภาษาความเร็วสูงระดับระบบ ฝึกแกะชนิดตัวแปร, Reference (&) และ Vector",
    taglineEn:
      "High-performance systems language — trace types, references (&), and vectors",
    description:
      "หัวใจของงานระบบ เกม และโอลิมปิกวิชาการ ฝึกอ่านกับดักหารจำนวนเต็ม (Integer Division), การส่งค่าแบบอ้างอิง Pass-by-Reference (&) และขอบเขตของ std::vector ที่ AI มักพลาด",
    descriptionEn:
      "Foundation of game engines, systems, and competitive programming. Master integer division traps, pass-by-reference (&), and std::vector bounds.",
    accentColor: "#b91c1c",
    bgTint: "#fee2e2",
    borderColor: "#b91c1c",
    dungeonRealmName: "ป้อมปราการเหล็ก C++",
    dungeonRealmNameEn: "Iron Fortress of C++",
    highlights: [
      "ความต่างระหว่าง int กับ double และกับดักการหารจำนวนเต็ม",
      "Pass-by-Value vs Pass-by-Reference (int&) ในฟังก์ชัน",
      "การใช้ std::vector และการตรวจขอบเขตดัชนีในลูป for",
    ],
    highlightsEn: [
      "int vs double precision and integer division traps",
      "Pass-by-value vs pass-by-reference (int&) mutation",
      "std::vector indexing and off-by-one loop boundaries",
    ],
    sampleCodePreview: `#include <iostream>\nusing namespace std;\nint main() {\n    int a = 7, b = 2;\n    cout << (a / b) << endl;\n    return 0;\n}`,
    defaultPlaygroundCode: `#include <iostream>\nusing namespace std;\n\nint main() {\n    int total = 7;\n    int count = 2;\n    int avg = total / count;\n    cout << avg << endl;\n    return 0;\n}`,
    playgroundDescription:
      "ทดลองรันโค้ด C++ พื้นฐาน (cout, int/double, reference &, vector) เพื่อดูผลลัพธ์การคำนวณจริง",
  },
  {
    id: "java",
    name: "Java",
    nameEn: "Java",
    shortBadge: "JAVA · OOP & Enterprise",
    categoryLabel: "ประเภทที่ 6 · เชิงวัตถุ (OOP) และซอฟต์แวร์องค์กร",
    categoryLabelEn: "Track 6 · Object-Oriented & Enterprise Systems",
    tagline:
      "ราชาแห่ง OOP ฝึกแกะ Class, Constructor, .equals() และ Encapsulation",
    taglineEn:
      "Classic OOP powerhouse — trace classes, constructors, and .equals() semantics",
    description:
      "ภาษาหลักของระบบองค์กรและ Android ฝึกอ่านโครงสร้างคลาสและเมธอด main, ความต่างระหว่าง == กับ .equals() สำหรับ String และการเปลี่ยนแปลงสถานะภายใน Object",
    descriptionEn:
      "Backbone of enterprise backends and OOP curricula. Practice reading class blueprints, String .equals() vs ==, and object state mutations.",
    accentColor: "#c2410c",
    bgTint: "#ffedd5",
    borderColor: "#c2410c",
    dungeonRealmName: "หอคอยคลาสแห่งจาวา",
    dungeonRealmNameEn: "Citadel of Java Classes",
    highlights: [
      "โครงสร้าง public class, เมธอด main และ System.out.println",
      "การเปรียบเทียบ String ด้วย .equals() เทียบกับ == ที่ AI มักสับสน",
      "การสร้าง Object ด้วย Constructor และการอัปเดต Field ผ่านเมธอด",
    ],
    highlightsEn: [
      "Class structure, main() entry point, and System.out.println",
      "String .equals() value check vs == reference check",
      "Constructors, object state fields, and array loops",
    ],
    sampleCodePreview: `public class Main {\n    public static void main(String[] args) {\n        String s = new String("admin");\n        System.out.println(s.equals("admin"));\n    }\n}`,
    defaultPlaygroundCode: `public class Main {\n    public static void main(String[] args) {\n        int price = 120;\n        int qty = 3;\n        int tax = 20;\n        int total = (price * qty) + tax;\n        System.out.println(total);\n    }\n}`,
    playgroundDescription:
      "ทดลองรันโค้ด Java พื้นฐาน (ตัวแปร, String.equals, Class & Method, System.out.println) เพื่อตรวจผลลัพธ์จริง",
  },
  {
    id: "html",
    name: "HTML / CSS",
    nameEn: "HTML / CSS",
    shortBadge: "HTML · UI & Layout",
    categoryLabel: "ประเภทที่ 7 · โครงสร้างเว็บและการจัดเลย์เอาต์ UI",
    categoryLabelEn: "Track 7 · Web Structure & UI Layout",
    tagline:
      "รากฐานหน้าเว็บ ฝึกแกะ Semantic HTML, CSS Box Model, Flexbox และ Specificity",
    taglineEn:
      "Web UI foundations — master Semantic HTML, Box Model, Flexbox, and CSS Specificity",
    description:
      "ฝึกอ่านโครงสร้างแท็ก HTML, การคำนวณขนาด Box Model, การจัดวางด้วย Flexbox และการตรวจหาบั๊ก CSS Selector / Specificity ที่ AI มักเขียนทับกันจนหน้าเว็บเพี้ยน",
    descriptionEn:
      "Practice reading HTML tag trees, Box Model sizing, Flexbox alignment, and catching CSS Specificity conflicts common in AI-generated UI.",
    accentColor: "#e11d48",
    bgTint: "#ffe4e6",
    borderColor: "#e11d48",
    dungeonRealmName: "ป้อมปราการเว็บ HTML/CSS",
    dungeonRealmNameEn: "Citadel of HTML & CSS",
    highlights: [
      "โครงสร้างแท็ก Semantic HTML (<header>, <main>, <article>)",
      "การคำนวณขนาด CSS Box Model (width + padding + border) และ Flexbox",
      "ลำดับความสำคัญ CSS Specificity (#id > .class > tag) และการแก้บั๊กเลย์เอาต์",
    ],
    highlightsEn: [
      "Semantic HTML structure (<header>, <main>, <article>)",
      "CSS Box Model sizing (width + padding + border) and Flexbox",
      "CSS Specificity hierarchy (#id > .class > tag) and layout debugging",
    ],
    sampleCodePreview: `<div class="card">\n  <h2>Hero</h2>\n  <p class="hp">HP: 100</p>\n</div>`,
    defaultPlaygroundCode: `<style>\n  .card { width: 200px; padding: 16px; border: 2px solid #fff; }\n</style>\n<div class="card">\n  <h2>Dungeon Card</h2>\n  <p>Ready to battle</p>\n</div>`,
    playgroundDescription:
      "วางโค้ด HTML / CSS เพื่อจำลองการแยกแท็กโครงสร้าง ข้อความที่แสดงผล และกฎสไตล์หลัก",
  },
];

// ============================================================================
// เควสต์ PRIMM เฉพาะสำหรับภาษา Python (แยกเนื้อหาและโจทย์ชัดเจน)
// ============================================================================
export const PYTHON_TOPICS: TopicQuest[] = [
  {
    id: 101,
    title: "Python ด่านที่ 1 · ตัวแปร การคำนวณ และ print()",
    titleEn: "Python Floor 1 · Variables, Arithmetic & print()",
    shortName: "PY 1 · ตัวแปรและ print()",
    shortNameEn: "PY 1 · Variables & print()",
    subtitle: "แกะรอยค่าตัวแปรใน Python ที่ไม่ต้องใช้ let/const และการแสดงผลด้วย print()",
    subtitleEn: "Trace Python variables (no let/const needed) and console output with print()",
    code: `price = 150
qty = 4
discount = 100
net_price = (price * qty) - discount
print(net_price)`,
    predictPrompt:
      "ก่อนรันโค้ด Python: เมื่อรันครบทั้ง 5 บรรทัด คำสั่ง print(net_price) จะแสดงค่าอะไร?",
    predictPromptEn:
      "Before running Python: after all 5 lines execute, what will print(net_price) output?",
    predictOptions: ["500", "600", "450", "250"],
    predictOptionsEn: ["500", "600", "450", "250"],
    predictExplanation:
      "บรรทัดที่ 4 คำนวณ (150 * 4) ได้ 600 แล้วลบด้วย discount (100) จึงเหลือ 500 จากนั้น print(net_price) แสดง 500",
    predictExplanationEn:
      "Line 4 computes (150 * 4) = 600, then subtracts discount (100) to get 500, which print(net_price) displays.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "price = 150",
        variables: { price: "150" },
        outputSoFar: [],
        explanation: "สร้างตัวแปร price เก็บค่า 150 (Python ไม่ต้องมีคำสั่ง let หรือ semicolon ปิดท้าย)",
        explanationEn: "Create variable price = 150 (Python needs no let keyword or semicolons).",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: "qty = 4",
        variables: { price: "150", qty: "4" },
        outputSoFar: [],
        explanation: "สร้างตัวแปร qty เก็บจำนวนสินค้า 4 ชิ้น",
        explanationEn: "Create variable qty = 4.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "discount = 100",
        variables: { price: "150", qty: "4", discount: "100" },
        outputSoFar: [],
        explanation: "สร้างตัวแปร discount เก็บส่วนลด 100 บาท",
        explanationEn: "Create variable discount = 100.",
      },
      {
        stepNumber: 4,
        line: 4,
        codeLine: "net_price = (price * qty) - discount",
        variables: {
          price: "150",
          qty: "4",
          discount: "100",
          net_price: "500",
        },
        outputSoFar: [],
        explanation: "คำนวณในวงเล็บ 150 * 4 = 600 แล้วลบด้วย 100 ได้ 500 เก็บลงในตัวแปร net_price",
        explanationEn: "Compute (150 * 4) = 600, subtract 100 -> store 500 in net_price.",
      },
      {
        stepNumber: 5,
        line: 5,
        codeLine: "print(net_price)",
        variables: {
          price: "150",
          qty: "4",
          discount: "100",
          net_price: "500",
        },
        outputSoFar: ["500"],
        explanation: "ใช้ฟังก์ชัน print() แสดงค่าของตัวแปร net_price คือ 500 ออกทางหน้าจอ",
        explanationEn: "Call print(net_price) to output 500.",
      },
    ],
    questions: [
      {
        id: "py1-q1",
        cellId: "T1",
        targetLine: 1,
        question: "การประกาศตัวแปรในภาษา Python แตกต่างจาก JavaScript อย่างไร?",
        questionEn: "How does declaring a variable in Python differ from JavaScript?",
        options: [
          {
            id: "a",
            text: "ไม่ต้องเขียนคำว่า let หรือ const นำหน้าชื่อตัวแปร",
            textEn: "No let or const keyword is needed before the variable name",
          },
          { id: "b", text: "ต้องใส่เครื่องหมาย $ นำหน้าชื่อตัวแปรเสมอ", textEn: "You must always prefix variable names with $" },
          { id: "c", text: "ไม่สามารถเก็บตัวเลขจำนวนเต็มได้", textEn: "Python cannot store integers" },
          { id: "d", text: "ต้องใช้เครื่องหมาย == ในการกำหนดค่า", textEn: "You must use == for assignment" },
        ],
        correctOptionId: "a",
        hint: "สังเกตบรรทัดที่ 1: price = 150 มีคำนำหน้าเหมือน JavaScript หรือไม่?",
        hintEn: "Look at line 1: price = 150. Is there any keyword before price?",
        explanation:
          "ในภาษา Python สามารถเขียนชื่อตัวแปรตามด้วยเครื่องหมาย = และค่าข้อมูลได้ทันทีโดยไม่ต้องมี let/const",
        explanationEn:
          "In Python, you assign directly with name = value without let or const.",
      },
      {
        id: "py1-q2",
        cellId: "E1",
        targetLine: 4,
        question: "หลังจากรันบรรทัดที่ 4 เสร็จ ตัวแปร net_price มีค่าเท่าไร?",
        questionEn: "After line 4 executes, what is the value of net_price?",
        options: [
          { id: "a", text: "600", textEn: "600" },
          { id: "b", text: "500", textEn: "500" },
          { id: "c", text: "400", textEn: "400" },
          { id: "d", text: "150", textEn: "150" },
        ],
        correctOptionId: "b",
        hint: "นำ price (150) คูณ qty (4) ก่อน แล้วจึงลบด้วย discount (100)",
        hintEn: "Multiply price (150) by qty (4) first, then subtract discount (100).",
        explanation: "(150 * 4) - 100 = 600 - 100 = 500",
        explanationEn: "(150 * 4) - 100 = 600 - 100 = 500.",
      },
      {
        id: "py1-q3",
        cellId: "F1",
        targetLine: 5,
        question: "คำสั่ง print(net_price) ในภาษา Python ทำหน้าที่เทียบเท่ากับคำสั่งใดใน JavaScript?",
        questionEn: "Which JavaScript statement is equivalent to print(net_price) in Python?",
        options: [
          { id: "a", text: "console.log(net_price)", textEn: "console.log(net_price)" },
          { id: "b", text: "return net_price", textEn: "return net_price" },
          { id: "c", text: "let net_price", textEn: "let net_price" },
          { id: "d", text: "if (net_price)", textEn: "if (net_price)" },
        ],
        correctOptionId: "a",
        hint: "คำสั่งที่ใช้แสดงผลค่าตัวแปรออกทางหน้าจอมาตรฐานคือคำสั่งใด?",
        hintEn: "Which function prints a value to standard output?",
        explanation:
          "print() ใน Python ใช้แสดงผลออกทางหน้าจอเช่นเดียวกับ console.log() ใน JavaScript",
        explanationEn:
          "print() in Python outputs to the console just like console.log() in JavaScript.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองแก้ค่าตัวแปร discount ในบรรทัดที่ 3 จาก 100 เป็น 50 เพื่อให้ยอดสุทธิแสดงผลเป็น 550",
      instructionEn:
        "Change discount on line 3 from 100 to 50 and predict the new net_price output!",
      suggestedCode: `price = 150
qty = 4
discount = 50
net_price = (price * qty) - discount
print(net_price)`,
      changeDescription: "เปลี่ยน discount จาก 100 เป็น 50",
      changeDescriptionEn: "Change discount from 100 to 50",
      options: ["550", "500", "600", "450"],
      optionsEn: ["550", "500", "600", "450"],
      explanation: "เมื่อ discount เป็น 50 จะได้ (150 * 4) - 50 = 550",
      explanationEn: "With discount = 50, (150 * 4) - 50 = 550.",
    },
    badgeReward: {
      id: "badge-py-1",
      name: "นักแกะตัวแปร Python",
      nameEn: "Python Variable Tracer",
      description: "เข้าใจการกำหนดค่าตัวแปรและการแสดงผลด้วย print() ใน Python",
      descriptionEn: "Mastered Python variable assignment and print() output.",
    },
  },
  {
    id: 102,
    title: "Python ด่านที่ 2 · เงื่อนไข if / elif / else และการย่อหน้า",
    titleEn: "Python Floor 2 · if / elif / else & Indentation",
    shortName: "PY 2 · if / elif และการย่อหน้า",
    shortNameEn: "PY 2 · if / elif & Indentation",
    subtitle: "ทำความเข้าใจบล็อกคำสั่งด้วยย่อหน้า (Indentation) และคำสั่ง elif ของ Python",
    subtitleEn: "Understand indentation-based code blocks and Python's elif keyword",
    code: `temp = 34
status = "Normal"
if temp >= 38:
    status = "Hot"
elif temp >= 30:
    status = "Warm"
else:
    status = "Cool"
print(status)`,
    predictPrompt:
      "เมื่อ temp = 34 โปรแกรม Python ชุดนี้จะพิมพ์ข้อความใดออกทางหน้าจอ?",
    predictPromptEn:
      "When temp = 34, what string will this Python program print?",
    predictOptions: ["Warm", "Hot", "Cool", "Normal"],
    predictOptionsEn: ["Warm", "Hot", "Cool", "Normal"],
    predictExplanation:
      "temp (34) ไม่ถึง 38 จึงข้าม if แรก มาตรงกับเงื่อนไข elif temp >= 30 จึงเปลี่ยน status เป็น Warm",
    predictExplanationEn:
      "temp (34) is under 38, so the first if is skipped; elif temp >= 30 is true, setting status to Warm.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "temp = 34",
        variables: { temp: "34" },
        outputSoFar: [],
        explanation: "กำหนดอุณหภูมิ temp เท่ากับ 34 องศา",
        explanationEn: "Set temp = 34.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: 'status = "Normal"',
        variables: { temp: "34", status: '"Normal"' },
        outputSoFar: [],
        explanation: 'กำหนดค่าเริ่มต้นของ status เป็น "Normal"',
        explanationEn: 'Initialize status to "Normal".',
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "if temp >= 38:",
        variables: { temp: "34", status: '"Normal"' },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไข 34 >= 38 ได้ค่าเท็จ (False) จึงข้ามบล็อกย่อหน้าบรรทัดที่ 4",
        explanationEn: "Check 34 >= 38 (False), so skip indented line 4.",
      },
      {
        stepNumber: 4,
        line: 5,
        codeLine: "elif temp >= 30:",
        variables: { temp: "34", status: '"Normal"' },
        outputSoFar: [],
        explanation: "ตรวจเงื่อนไขถัดมา 34 >= 30 ได้ค่าจริง (True) จึงเข้าทำงานในบรรทัดที่ 6",
        explanationEn: "Check elif 34 >= 30 (True), so enter line 6.",
      },
      {
        stepNumber: 5,
        line: 6,
        codeLine: '    status = "Warm"',
        variables: { temp: "34", status: '"Warm"' },
        outputSoFar: [],
        explanation: 'เปลี่ยนค่า status เป็น "Warm" แล้วข้าม else ไปยังบรรทัดสุดท้าย',
        explanationEn: 'Set status to "Warm" and skip the else block.',
      },
      {
        stepNumber: 6,
        line: 9,
        codeLine: "print(status)",
        variables: { temp: "34", status: '"Warm"' },
        outputSoFar: ["Warm"],
        explanation: "แสดงค่า status คือ Warm ออกทางหน้าจอ",
        explanationEn: "Print status (Warm).",
      },
    ],
    questions: [
      {
        id: "py2-q1",
        cellId: "T2",
        targetLine: 5,
        question: "ในภาษา Python คำสั่ง elif ย่อมาจากอะไร และใช้กำหนดขอบเขตบล็อกด้วยวิธีใด?",
        questionEn: "In Python, what does elif stand for and how are block boundaries defined?",
        options: [
          {
            id: "a",
            text: "ย่อมาจาก else if และใช้เครื่องหมายโคลอน (:) คู่กับการย่อหน้า (Indentation)",
            textEn: "Short for else if, using a colon (:) paired with indentation",
          },
          { id: "b", text: "ย่อมาจาก end loop if และใช้เครื่องหมายปีกกา { }", textEn: "Short for end loop if, using curly braces { }" },
          { id: "c", text: "ใช้สำหรับการวนซ้ำเหมือน for loop", textEn: "Used for looping like a for loop" },
          { id: "d", text: "ใช้ประกาศฟังก์ชันใหม่", textEn: "Used to define a new function" },
        ],
        correctOptionId: "a",
        hint: "สังเกตเครื่องหมายท้ายบรรทัดที่ 5 และช่องว่างหน้าบรรทัดที่ 6",
        hintEn: "Notice the colon at the end of line 5 and the leading spaces on line 6.",
        explanation:
          "Python ใช้ elif แทน else if โดยมีเครื่องหมาย : ปิดท้ายเงื่อนไข และใช้การย่อหน้า 4 เคาะเพื่อระบุขอบเขตบล็อกคำสั่ง",
        explanationEn:
          "Python uses elif for else if, ending the header with : and using indentation for the block body.",
      },
      {
        id: "py2-q2",
        cellId: "E2",
        targetLine: 6,
        question: "ทำไมบรรทัดที่ 4 (status = \"Hot\") จึงไม่ถูกรัน?",
        questionEn: 'Why does line 4 (status = "Hot") not execute?',
        options: [
          {
            id: "a",
            text: "เพราะ temp มีค่า 34 ซึ่งน้อยกว่า 38 ทำให้เงื่อนไข if temp >= 38 เป็นเท็จ",
            textEn: "Because temp is 34 (< 38), making if temp >= 38 False",
          },
          { id: "b", text: "เพราะบรรทัดที่ 4 พิมพ์ผิดไวยากรณ์", textEn: "Because line 4 has a syntax error" },
          { id: "c", text: "เพราะ Python จะรันเฉพาะบรรทัดสุดท้ายเสมอ", textEn: "Because Python only runs the last line" },
          { id: "d", text: "เพราะตัวแปร status ถูกล็อกค่าไว้", textEn: "Because status is locked" },
        ],
        correctOptionId: "a",
        hint: "แทนค่า temp = 34 ลงใน temp >= 38",
        hintEn: "Substitute temp = 34 into temp >= 38.",
        explanation:
          "เนื่องจาก 34 >= 38 เป็น False โปรแกรมจึงข้ามบล็อกย่อหน้าของ if ไปตรวจ elif ถัดไป",
        explanationEn:
          "Since 34 >= 38 is False, Python skips the if block and checks elif.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยนค่า temp ในบรรทัดที่ 1 เป็น 40 เพื่อให้โปรแกรมแสดงผลเป็น Hot",
      instructionEn:
        "Change temp on line 1 to 40 and predict the new printed output!",
      suggestedCode: `temp = 40
status = "Normal"
if temp >= 38:
    status = "Hot"
elif temp >= 30:
    status = "Warm"
else:
    status = "Cool"
print(status)`,
      changeDescription: "เปลี่ยน temp จาก 34 เป็น 40",
      changeDescriptionEn: "Change temp from 34 to 40",
      options: ["Hot", "Warm", "Cool", "Normal"],
      optionsEn: ["Hot", "Warm", "Cool", "Normal"],
      explanation: "เมื่อ temp = 40 จะตรงกับเงื่อนไขแรก temp >= 38 จึงได้ค่า Hot",
      explanationEn: "With temp = 40, temp >= 38 is True, so status becomes Hot.",
    },
    badgeReward: {
      id: "badge-py-2",
      name: "ผู้เชี่ยวชาญย่อหน้า Python",
      nameEn: "Python Indentation Master",
      description: "เข้าใจการอ่านเงื่อนไข if / elif / else และขอบเขตการย่อหน้าใน Python",
      descriptionEn: "Master if / elif / else branching and Python indentation.",
    },
  },
  {
    id: 103,
    title: "Python ด่านที่ 3 · ลูป for ... in range() และการสะสมค่า",
    titleEn: "Python Floor 3 · for ... in range() & Accumulation",
    shortName: "PY 3 · ลูป range()",
    shortNameEn: "PY 3 · range() Loops",
    subtitle: "ระวังจุดที่ AI มักทำให้สับสน: range(1, 5) ใน Python จะหยุดก่อนถึงเลขตัวสุดท้าย!",
    subtitleEn: "Watch out for the common AI off-by-one trap: range(1, 5) stops before 5!",
    code: `total = 0
for i in range(1, 5):
    total = total + (i * 10)
print(total)`,
    predictPrompt:
      "ข้อควรระวังของ range(1, 5) ใน Python: เมื่อลูปทำงานจบ จะพิมพ์ค่า total เท่าไร?",
    predictPromptEn:
      "Watch out for range(1, 5) in Python: after the loop finishes, what will total print?",
    predictOptions: ["100", "150", "40", "50"],
    predictOptionsEn: ["100", "150", "40", "50"],
    predictExplanation:
      "ใน Python คำสั่ง range(1, 5) จะให้ค่า i เป็น 1, 2, 3, 4 (ไม่รวม 5!) ดังนั้นจึงบวก 10 + 20 + 30 + 40 = 100",
    predictExplanationEn:
      "range(1, 5) yields i = 1, 2, 3, 4 (excluding 5), so total adds 10 + 20 + 30 + 40 = 100.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "total = 0",
        variables: { total: "0" },
        outputSoFar: [],
        explanation: "กำหนดตัวแปรสะสมค่า total เริ่มต้นเป็น 0",
        explanationEn: "Initialize accumulator total = 0.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: "for i in range(1, 5): # รอบ i = 1",
        codeLineEn: "for i in range(1, 5): # iteration i = 1",
        variables: { total: "0", i: "1" },
        outputSoFar: [],
        explanation: "รอบที่ 1: i มีค่าเป็น 1",
        explanationEn: "Iteration 1: i = 1.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "    total = total + (i * 10)",
        variables: { total: "10", i: "1" },
        outputSoFar: [],
        explanation: "บวกเพิ่ม 1 * 10 = 10 ทำให้ total กลายเป็น 10",
        explanationEn: "Add 1 * 10 = 10, so total becomes 10.",
      },
      {
        stepNumber: 4,
        line: 3,
        codeLine: "    total = total + (i * 10) # รอบ i = 2, 3, 4",
        codeLineEn: "    total = total + (i * 10) # iterations i = 2, 3, 4",
        variables: { total: "100", i: "4" },
        outputSoFar: [],
        explanation: "วนต่อสำหรับ i = 2 (+20), i = 3 (+30), และ i = 4 (+40) รวมเป็น 100 แล้วหยุดก่อนถึง 5",
        explanationEn: "Continue for i = 2 (+20), i = 3 (+30), i = 4 (+40) -> total = 100, then stop before 5.",
      },
      {
        stepNumber: 5,
        line: 4,
        codeLine: "print(total)",
        variables: { total: "100", i: "4" },
        outputSoFar: ["100"],
        explanation: "แสดงผลลัพธ์รวม 100 ออกทางหน้าจอ",
        explanationEn: "Print total (100).",
      },
    ],
    questions: [
      {
        id: "py3-q1",
        cellId: "T2",
        targetLine: 2,
        question: "คำสั่ง range(1, 5) ในภาษา Python จะสร้างลำดับตัวเลขใดออกมา?",
        questionEn: "What sequence of numbers does range(1, 5) generate in Python?",
        options: [
          { id: "a", text: "1, 2, 3, 4 (หยุดก่อนถึง 5)", textEn: "1, 2, 3, 4 (stops before 5)" },
          { id: "b", text: "1, 2, 3, 4, 5", textEn: "1, 2, 3, 4, 5" },
          { id: "c", text: "0, 1, 2, 3, 4, 5", textEn: "0, 1, 2, 3, 4, 5" },
          { id: "d", text: "1 และ 5 เท่านั้น", textEn: "Only 1 and 5" },
        ],
        correctOptionId: "a",
        hint: "ใน Python ค่า stop ของ range(start, stop) จะไม่ถูกรวมอยู่ในลำดับ",
        hintEn: "In Python, the stop argument in range(start, stop) is exclusive.",
        explanation:
          "range(start, stop) จะเริ่มที่ start และหยุดที่ stop - 1 ดังนั้น range(1, 5) จึงได้ 1, 2, 3, 4",
        explanationEn:
          "range(start, stop) starts at start and ends at stop - 1, so range(1, 5) yields 1, 2, 3, 4.",
      },
      {
        id: "py3-q2",
        cellId: "F4",
        targetLine: 2,
        question:
          "หากสั่ง AI ให้เขียนโค้ดบวกเลข 1 ถึง 5 แต่ AI เขียน range(1, 5) มาให้ จะเกิดปัญหาอะไร?",
        questionEn:
          "If you ask an AI to sum numbers 1 through 5 and it writes range(1, 5), what goes wrong?",
        options: [
          {
            id: "a",
            text: "เกิดบั๊ก Off-by-one เพราะเลข 5 ไม่ถูกนำมาคำนวณ ต้องแก้เป็น range(1, 6)",
            textEn: "An off-by-one bug: 5 is excluded, so it must be range(1, 6)",
          },
          { id: "b", text: "เกิด Syntax Error รันไม่ได้", textEn: "A Syntax Error prevents it from running" },
          { id: "c", text: "กลายเป็นลูปไม่รู้จบ (Infinite Loop)", textEn: "It becomes an Infinite Loop" },
          { id: "d", text: "ไม่มีปัญหาใดๆ", textEn: "Nothing goes wrong" },
        ],
        correctOptionId: "a",
        hint: "ถ้าต้องการให้ i มีค่าถึง 5 ต้องตั้งค่าตัวที่สองของ range เป็นเท่าไร?",
        hintEn: "To include 5 in the range, what should the second argument be?",
        explanation:
          "นี่คือบั๊กที่พบบ่อยมากเวลาอ่านโค้ด Python: หากต้องการถึง 5 ต้องเขียน range(1, 6)",
        explanationEn:
          "This is a classic Python off-by-one bug: to include 5, you need range(1, 6).",
      },
    ],
    modifyChallenge: {
      instruction:
        "แก้คำสั่ง range(1, 5) ในบรรทัดที่ 2 เป็น range(1, 6) เพื่อรวมรอบที่ i = 5 เข้าไปด้วย (ผลรวมจะเป็น 150)",
      instructionEn:
        "Change range(1, 5) on line 2 to range(1, 6) to include i = 5 and predict the new total!",
      suggestedCode: `total = 0
for i in range(1, 6):
    total = total + (i * 10)
print(total)`,
      changeDescription: "เปลี่ยน range(1, 5) เป็น range(1, 6)",
      changeDescriptionEn: "Change range(1, 5) to range(1, 6)",
      options: ["150", "100", "210", "50"],
      optionsEn: ["150", "100", "210", "50"],
      explanation: "เมื่อใช้ range(1, 6) ลูปจะทำงานสำหรับ i = 1, 2, 3, 4, 5 รวมเป็น 10+20+30+40+50 = 150",
      explanationEn: "range(1, 6) runs for i = 1..5, summing 10+20+30+40+50 = 150.",
    },
    badgeReward: {
      id: "badge-py-3",
      name: "ผู้พิชิตลูป range() Python",
      nameEn: "Python range() Conqueror",
      description: "เข้าใจขอบเขตของ range(start, stop) และการสะสมค่าในลูป Python",
      descriptionEn: "Master Python range(start, stop) bounds and loop accumulation.",
    },
  },
  {
    id: 104,
    title: "Python ด่านที่ 4 · ฟังก์ชัน def และการคืนค่า return",
    titleEn: "Python Floor 4 · def Functions & return",
    shortName: "PY 4 · def & return",
    shortNameEn: "PY 4 · def & return",
    subtitle: "ฝึกอ่านลำดับการเรียกฟังก์ชัน การส่งอาร์กิวเมนต์ และเงื่อนไขป้องกันค่าติดลบ",
    subtitleEn: "Trace function calls, arguments, and early-return guards against negative values",
    code: `def calc_damage(atk, armor):
    dmg = atk - armor
    if dmg < 0:
        return 0
    return dmg

print(calc_damage(45, 20))`,
    predictPrompt:
      "เมื่อเรียก calc_damage(45, 20) ผลลัพธ์ที่พิมพ์ออกทางหน้าจอคือค่าใด?",
    predictPromptEn:
      "When calling calc_damage(45, 20), what value is printed?",
    predictOptions: ["25", "0", "65", "-25"],
    predictOptionsEn: ["25", "0", "65", "-25"],
    predictExplanation:
      "45 - 20 = 25 ซึ่งไม่น้อยกว่า 0 จึงข้าม if และคืนค่า dmg = 25",
    predictExplanationEn:
      "45 - 20 = 25, which is not < 0, so the if block is skipped and dmg (25) is returned.",
    steps: [
      {
        stepNumber: 1,
        line: 7,
        codeLine: "print(calc_damage(45, 20))",
        variables: { atk: "45", armor: "20" },
        outputSoFar: [],
        explanation: "เรียกฟังก์ชัน calc_damage โดยส่ง atk = 45 และ armor = 20",
        explanationEn: "Call calc_damage with atk = 45 and armor = 20.",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: "    dmg = atk - armor",
        variables: { atk: "45", armor: "20", dmg: "25" },
        outputSoFar: [],
        explanation: "คำนวณ dmg = 45 - 20 ได้ 25",
        explanationEn: "Compute dmg = 45 - 20 = 25.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: "    if dmg < 0:",
        variables: { dmg: "25" },
        outputSoFar: [],
        explanation: "ตรวจสอบว่า 25 < 0 หรือไม่ (เป็นเท็จ) จึงไม่เข้า return 0",
        explanationEn: "Check 25 < 0 (False), so skip return 0.",
      },
      {
        stepNumber: 4,
        line: 5,
        codeLine: "    return dmg",
        variables: { returnValue: "25" },
        outputSoFar: ["25"],
        explanation: "คืนค่า 25 กลับไปให้ print() เพื่อแสดงผล",
        explanationEn: "Return 25 to print(), which outputs 25.",
      },
    ],
    questions: [
      {
        id: "py4-q1",
        cellId: "T2",
        targetLine: 4,
        question: "หากฟังก์ชันทำงานถึงบรรทัด return 0 บรรทัดที่ 5 (return dmg) จะทำงานต่อหรือไม่?",
        questionEn: "If execution reaches return 0 on line 4, will line 5 (return dmg) still run?",
        options: [
          { id: "a", text: "ไม่ทำงาน เพราะคำสั่ง return จะจบการทำงานของฟังก์ชันทันที", textEn: "No, because return immediately exits the function" },
          { id: "b", text: "ทำงานต่อและคืนค่า 2 ค่าพร้อมกัน", textEn: "Yes, and it returns two values at once" },
          { id: "c", text: "เกิด Error เพราะมี return สองครั้ง", textEn: "An Error occurs because there are two returns" },
          { id: "d", text: "ข้ามกลับไปบรรทัดที่ 1 อัตโนมัติ", textEn: "It jumps back to line 1 automatically" },
        ],
        correctOptionId: "a",
        hint: "นึกถึงหน้าที่ของคำสั่ง return เมื่อถูกเรียกใช้ภายในฟังก์ชัน",
        hintEn: "Think about what return does to function execution flow.",
        explanation:
          "เมื่อโปรแกรมเจอคำสั่ง return ฟังก์ชันจะส่งค่ากลับและหยุดทำงานทันที (Early Return)",
        explanationEn:
          "Executing return sends the value back and immediately terminates the function (Early Return).",
      },
      {
        id: "py4-q2",
        cellId: "F4",
        targetLine: 3,
        question: "เงื่อนไข if dmg < 0: return 0 มีประโยชน์อย่างไรเมื่อใช้ร่วมกับโค้ดจาก AI?",
        questionEn: "Why is the guard if dmg < 0: return 0 important in AI-generated game logic?",
        options: [
          { id: "a", text: "ป้องกันดาเมจติดลบจนกลายเป็นเพิ่มพลังชีวิตให้ศัตรู", textEn: "Prevents negative damage from accidentally healing the enemy" },
          { id: "b", text: "ทำให้คำนวณเลขทศนิยมได้เร็วขึ้น", textEn: "Speeds up floating-point arithmetic" },
          { id: "c", text: "บังคับให้ atk เป็น 0 เสมอ", textEn: "Forces atk to always be 0" },
          { id: "d", text: "ลบตัวแปร armor ทิ้งหลังจบฟังก์ชัน", textEn: "Deletes armor after the function finishes" },
        ],
        correctOptionId: "a",
        hint: "ลองคิดดูว่าถ้า armor มากกว่า atk แล้วนำค่าลบไปลบออกจาก HP จะเกิดอะไรขึ้น",
        hintEn: "Think about what happens to enemy HP if armor > atk and you subtract a negative damage value.",
        explanation:
          "การเช็คขอบเขตล่าง (Clamp >= 0) ช่วยป้องกันบั๊กทางตรรกะที่ค่าความเสียหายติดลบ",
        explanationEn:
          "Clamping damage to >= 0 prevents logic bugs caused by negative numbers.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยนการเรียกในบรรทัดที่ 7 จาก calc_damage(45, 20) เป็น calc_damage(15, 20) เพื่อทดสอบเกราะหนากว่าพลังโจมตี",
      instructionEn:
        "Change line 7 from calc_damage(45, 20) to calc_damage(15, 20) to test armor > atk and predict the output!",
      suggestedCode: `def calc_damage(atk, armor):
    dmg = atk - armor
    if dmg < 0:
        return 0
    return dmg

print(calc_damage(15, 20))`,
      changeDescription: "เปลี่ยนอาร์กิวเมนต์เป็น calc_damage(15, 20)",
      changeDescriptionEn: "Change arguments to calc_damage(15, 20)",
      options: ["0", "-5", "5", "15"],
      optionsEn: ["0", "-5", "5", "15"],
      explanation: "15 - 20 = -5 ซึ่งน้อยกว่า 0 จึงเข้าเงื่อนไข return 0",
      explanationEn: "15 - 20 = -5 (< 0), so the guard triggers return 0.",
    },
    badgeReward: {
      id: "badge-py-4",
      name: "สถาปนิกฟังก์ชัน Python",
      nameEn: "Python Function Architect",
      description: "เข้าใจการส่งอาร์กิวเมนต์และ Early Return ในฟังก์ชัน def",
      descriptionEn: "Master arguments and early returns in Python def functions.",
    },
  },
  {
    id: 105,
    title: "Python ด่านบอส · List, Dictionary และจับบั๊กจาก AI",
    titleEn: "Python Boss · List, Dictionary & Catching AI Bugs",
    shortName: "PY 5 · List & Dict Boss",
    shortNameEn: "PY 5 · List & Dict Boss",
    isBoss: true,
    subtitle: "ด่านบอส Python: แกะรอยการนับไอเทมด้วย Dictionary และการเช็ค Key ก่อนอัปเดตค่า",
    subtitleEn: "Python Boss: trace item counting with a Dictionary and safe key-existence checks",
    code: `bag = {"potion": 2, "key": 1}
items = ["potion", "potion", "gem"]
for item in items:
    if item in bag:
        bag[item] = bag[item] + 1
print(bag["potion"])`,
    predictPrompt:
      "เมื่อลูปทำงานครบทุกตัวใน items ค่าของ bag[\"potion\"] ที่พิมพ์ออกมาคือเท่าไร?",
    predictPromptEn:
      'After the loop finishes all items, what value will print(bag["potion"]) output?',
    predictOptions: ["4", "2", "3", "KeyError"],
    predictOptionsEn: ["4", "2", "3", "KeyError"],
    predictExplanation:
      "\"potion\" เดิมมี 2 และพบใน items อีก 2 ครั้ง จึงบวกเพิ่มเป็น 4 ส่วน \"gem\" ไม่อยู่ใน bag จึงถูกข้ามไม่เกิด KeyError",
    predictExplanationEn:
      '"potion" starts at 2 and appears twice in items (2 -> 3 -> 4), while "gem" is skipped safely without raising a KeyError.',
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: `bag = {"potion": 2, "key": 1}`,
        variables: { "bag['potion']": "2", "bag['key']": "1" },
        outputSoFar: [],
        explanation: "สร้าง Dictionary เก็บจำนวนไอเทมเริ่มต้นในกระเป๋า",
        explanationEn: "Create a Dictionary storing initial item counts in bag.",
      },
      {
        stepNumber: 2,
        line: 3,
        codeLine: `for item in items: # "potion", "potion"`,
        variables: { item: "potion", "bag['potion']": "4" },
        outputSoFar: [],
        explanation: "พบ 'potion' 2 รอบ และ 'potion' อยู่ใน bag จึงบวกจาก 2 -> 3 -> 4",
        explanationEn: "Process 'potion' twice (both in bag): count increments 2 -> 3 -> 4.",
      },
      {
        stepNumber: 3,
        line: 4,
        codeLine: `    if item in bag: # item = "gem"`,
        variables: { item: "gem", "in_bag": "False" },
        outputSoFar: [],
        explanation: "รอบสุดท้าย item = 'gem' ซึ่งไม่มีใน bag เงื่อนไขเป็นเท็จจึงข้ามไปอย่างปลอดภัย",
        explanationEn: "Final item 'gem' is not in bag (False), so it is safely skipped.",
      },
      {
        stepNumber: 4,
        line: 6,
        codeLine: `print(bag["potion"])`,
        variables: { output: "4" },
        outputSoFar: ["4"],
        explanation: "แสดงจำนวน potion ล่าสุดคือ 4",
        explanationEn: "Print the updated potion count: 4.",
      },
    ],
    questions: [
      {
        id: "py5-q1",
        cellId: "T2",
        targetLine: 4,
        question: "หากลบบรรทัดที่ 4 (if item in bag:) ออก แล้วรันโค้ดเดิม จะเกิดอะไรขึ้นเมื่อ item เป็น \"gem\"?",
        questionEn: 'If line 4 (if item in bag:) were removed, what would happen when item is "gem"?',
        options: [
          { id: "a", text: "เกิด KeyError เพราะไม่มีคีย์ 'gem' อยู่ใน bag", textEn: "KeyError is raised because 'gem' is not a key in bag" },
          { id: "b", text: "Python จะสร้างคีย์ 'gem' เป็น 1 ให้อัตโนมัติ", textEn: "Python automatically creates 'gem': 1" },
          { id: "c", text: "โปรแกรมข้ามไปโดยไม่แจ้งเตือน", textEn: "The program silently skips it" },
          { id: "d", text: "ค่า bag['potion'] จะกลายเป็น 0", textEn: "bag['potion'] becomes 0" },
        ],
        correctOptionId: "a",
        hint: "การอ่านค่า bag['gem'] ก่อนที่จะมีคีย์นี้อยู่ใน Dictionary จะเกิด Exception อะไร?",
        hintEn: "What exception does Python raise when reading a missing dictionary key?",
        explanation:
          "การเข้าถึง dict[key] ที่ยังไม่มีอยู่ใน Python จะโยน KeyError ทันที จึงควรเช็ค if key in dict หรือใช้ dict.get()",
        explanationEn:
          "Accessing a missing dict[key] raises KeyError; always check `if key in dict` or use `dict.get()`.",
      },
      {
        id: "py5-q2",
        cellId: "F4",
        targetLine: 1,
        question: "โครงสร้างข้อมูลใดเหมาะสำหรับเก็บคู่ 'ชื่อไอเทม -> จำนวน' แล้วค้นหาได้ทันทีโดยไม่ต้องวนลูป?",
        questionEn: "Which data structure best stores 'item name -> count' pairs for instant key lookup?",
        options: [
          { id: "a", text: "Dictionary (dict)", textEn: "Dictionary (dict)" },
          { id: "b", text: "Tuple ที่มีตัวเลขล้วน", textEn: "A numeric Tuple" },
          { id: "c", text: "String เดี่ยวๆ", textEn: "A plain String" },
          { id: "d", text: "Boolean", textEn: "A Boolean" },
        ],
        correctOptionId: "a",
        hint: "โครงสร้างข้อมูลแบบ Key-Value ในบรรทัดที่ 1 คืออะไร?",
        hintEn: "What is the key-value data structure initialized on line 1?",
        explanation:
          "Dictionary เก็บข้อมูลแบบ Key-Value ทำให้ค้นหาและอัปเดตค่าตามชื่อคีย์ได้รวดเร็ว",
        explanationEn:
          "Dictionaries store Key-Value pairs for fast O(1) lookup and updates by key.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองแก้ไขรายการ items ในบรรทัดที่ 2 เป็น [\"potion\", \"gem\"] แล้วสังเกตจำนวน potion ที่เหลือ",
      instructionEn:
        'Change items on line 2 to ["potion", "gem"] and predict the final bag["potion"] count!',
      suggestedCode: `bag = {"potion": 2, "key": 1}
items = ["potion", "gem"]
for item in items:
    if item in bag:
        bag[item] = bag[item] + 1
print(bag["potion"])`,
      changeDescription: "ลด 'potion' ใน items จาก 2 ตัวเหลือ 1 ตัว",
      changeDescriptionEn: "Reduce 'potion' in items from 2 occurrences to 1",
      options: ["3", "4", "2", "1"],
      optionsEn: ["3", "4", "2", "1"],
      explanation: "เดิมมี 2 พบ 'potion' เพิ่มอีก 1 รอบ จึงได้ผลลัพธ์เป็น 3",
      explanationEn: "Starting at 2 and finding 'potion' once yields 3.",
    },
    badgeReward: {
      id: "badge-py-boss",
      name: "ผู้พิชิตดันเจี้ยน Python",
      nameEn: "Python Dungeon Conqueror",
      description: "เชี่ยวชาญตัวแปร, if/elif, range(), ฟังก์ชัน def และ List/Dictionary",
      descriptionEn: "Mastered Python variables, if/elif, range(), def functions, and Lists/Dictionaries.",
    },
  },
];

// ============================================================================
// เควสต์ PRIMM เฉพาะสำหรับภาษา SQL (แยกเนื้อหาและโจทย์ชัดเจน)
// ============================================================================
export const SQL_TOPICS: TopicQuest[] = [
  {
    id: 201,
    title: "SQL ด่านที่ 1 · การดึงและกรองข้อมูลด้วย SELECT & WHERE",
    titleEn: "SQL Floor 1 · Querying & Filtering with SELECT & WHERE",
    shortName: "SQL 1 · SELECT & WHERE",
    shortNameEn: "SQL 1 · SELECT & WHERE",
    subtitle: "ฝึกอ่านคำสั่งค้นหาข้อมูลจากตาราง products และกรองเฉพาะแถวที่ตรงเงื่อนไข",
    subtitleEn: "Read queries that fetch rows from products and filter by condition",
    code: `-- ตาราง products:
-- (1, 'Keyboard', 900), (2, 'Mouse', 450), (3, 'Monitor', 3500)
SELECT name, price
FROM products
WHERE price >= 500
ORDER BY price ASC;`,
    codeEn: `-- products table:
-- (1, 'Keyboard', 900), (2, 'Mouse', 450), (3, 'Monitor', 3500)
SELECT name, price
FROM products
WHERE price >= 500
ORDER BY price ASC;`,
    predictPrompt:
      "เมื่อรันคำสั่ง SQL นี้กับตาราง products จะได้ผลลัพธ์ชื่อสินค้าเรียงตามลำดับใด?",
    predictPromptEn:
      "When running this SQL query on products, which items are returned and in what order?",
    predictOptions: [
      "Keyboard (900), Monitor (3500)",
      "Monitor (3500), Keyboard (900)",
      "Mouse (450), Keyboard (900)",
      "Mouse (450), Keyboard (900), Monitor (3500)",
    ],
    predictOptionsEn: [
      "Keyboard (900), Monitor (3500)",
      "Monitor (3500), Keyboard (900)",
      "Mouse (450), Keyboard (900)",
      "Mouse (450), Keyboard (900), Monitor (3500)",
    ],
    predictExplanation:
      "WHERE price >= 500 คัดกรองเหลือ Keyboard (900) และ Monitor (3500) จากนั้น ORDER BY price ASC เรียงจากน้อยไปมาก",
    predictExplanationEn:
      "WHERE price >= 500 keeps Keyboard (900) and Monitor (3500), then ORDER BY price ASC sorts them ascending.",
    steps: [
      {
        stepNumber: 1,
        line: 4,
        codeLine: "FROM products",
        variables: { rows_in_memory: "3 rows (Keyboard, Mouse, Monitor)" },
        outputSoFar: [],
        explanation: "ขั้นที่ 1 (การทำงานจริงของ SQL): ดึงข้อมูลตั้งต้นจากตาราง products ทั้งหมด 3 แถว",
        explanationEn: "Step 1 (SQL execution order): load all 3 rows from the products table.",
      },
      {
        stepNumber: 2,
        line: 5,
        codeLine: "WHERE price >= 500",
        variables: { filtered_rows: "2 rows (Keyboard 900, Monitor 3500)" },
        outputSoFar: [],
        explanation: "ขั้นที่ 2: กรองเอาเฉพาะแถวที่มี price ตั้งแต่ 500 ขึ้นไป (ตัด Mouse 450 ออก)",
        explanationEn: "Step 2: filter rows where price >= 500 (excludes Mouse at 450).",
      },
      {
        stepNumber: 3,
        line: 6,
        codeLine: "ORDER BY price ASC",
        variables: { sorted_rows: "Keyboard (900) -> Monitor (3500)" },
        outputSoFar: [],
        explanation: "ขั้นที่ 3: เรียงลำดับแถวที่ผ่านการกรองตามราคาจากน้อยไปมาก (ASC)",
        explanationEn: "Step 3: sort matching rows by price ascending (ASC).",
      },
      {
        stepNumber: 4,
        line: 3,
        codeLine: "SELECT name, price",
        variables: { columns: "name, price" },
        outputSoFar: ["Keyboard (900), Monitor (3500)"],
        explanation: "ขั้นที่ 4: เลือกแสดงเฉพาะคอลัมน์ name และ price ออกมาเป็นผลลัพธ์สุดท้าย",
        explanationEn: "Step 4: project only the name and price columns as the final output.",
      },
    ],
    questions: [
      {
        id: "sql1-q1",
        cellId: "E2",
        targetLine: 5,
        question: "ในลำดับการประมวลผลจริงของฐานข้อมูล SQL ส่วนใดทำงานก่อน?",
        questionEn: "In SQL's actual execution order, which clauses run before ORDER BY?",
        options: [
          {
            id: "a",
            text: "ระบุตารางด้วย FROM แล้วกรองแถวด้วย WHERE ก่อนจะเรียงลำดับด้วย ORDER BY",
            textEn: "FROM loads the table and WHERE filters rows before ORDER BY sorts them",
          },
          { id: "b", text: "ทำงานจาก ORDER BY ก่อนเสมอแล้วค่อยไปดึงตาราง", textEn: "ORDER BY runs first, then FROM loads the table" },
          { id: "c", text: "ไม่สนใจคำสั่ง WHERE หากมี ORDER BY", textEn: "WHERE is ignored whenever ORDER BY is present" },
          { id: "d", text: "ลบข้อมูลในตารางทิ้งก่อนแสดงผล", textEn: "Deletes rows from the table before displaying" },
        ],
        correctOptionId: "a",
        hint: "แม้มนุษย์จะเขียน SELECT ไว้บรรทัดแรก แต่ฐานข้อมูลต้องรู้ก่อนว่าดึงจากตารางไหน (FROM) และกรองแถวไหน (WHERE)",
        hintEn: "Even though SELECT is written first, the engine must know the table (FROM) and filter (WHERE) first.",
        explanation:
          "ลำดับการทำงานจริงของ SQL (Execution Order) คือ FROM -> WHERE -> SELECT -> ORDER BY",
        explanationEn:
          "Actual SQL execution order is FROM -> WHERE -> SELECT -> ORDER BY.",
      },
      {
        id: "sql1-q2",
        cellId: "T1",
        targetLine: 6,
        question: "คำสั่ง ORDER BY price ASC หมายถึงการเรียงลำดับแบบใด?",
        questionEn: "What does ORDER BY price ASC do?",
        options: [
          { id: "a", text: "เรียงตามราคาจากน้อยไปมาก (Ascending)", textEn: "Sorts by price from lowest to highest (Ascending)" },
          { id: "b", text: "เรียงตามราคาจากมากไปน้อย (Descending)", textEn: "Sorts by price from highest to lowest (Descending)" },
          { id: "c", text: "สุ่มลำดับแถวใหม่ทุกครั้ง", textEn: "Randomizes row order every time" },
          { id: "d", text: "รวมราคามาบวกกันทั้งหมด", textEn: "Sums all prices together" },
        ],
        correctOptionId: "a",
        hint: "ASC ย่อมาจาก Ascending ส่วนถ้าต้องการมากไปน้อยจะใช้ DESC",
        hintEn: "ASC stands for Ascending (while DESC is Descending).",
        explanation: "ASC (Ascending) คือเรียงจากค่าน้อยไปหาค่ามาก",
        explanationEn: "ASC (Ascending) sorts from smallest to largest value.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยน ORDER BY price ASC เป็น ORDER BY price DESC เพื่อเรียงราคาสินค้าจากแพงที่สุดลงมา",
      instructionEn:
        "Change ORDER BY price ASC to ORDER BY price DESC and predict the sorted output!",
      suggestedCode: `-- ตาราง products:
-- (1, 'Keyboard', 900), (2, 'Mouse', 450), (3, 'Monitor', 3500)
SELECT name, price
FROM products
WHERE price >= 500
ORDER BY price DESC;`,
      suggestedCodeEn: `-- products table:
-- (1, 'Keyboard', 900), (2, 'Mouse', 450), (3, 'Monitor', 3500)
SELECT name, price
FROM products
WHERE price >= 500
ORDER BY price DESC;`,
      changeDescription: "เปลี่ยน ASC เป็น DESC",
      changeDescriptionEn: "Change ASC to DESC",
      options: [
        "Monitor (3500), Keyboard (900)",
        "Keyboard (900), Monitor (3500)",
        "Mouse (450), Keyboard (900)",
        "Monitor (3500) แถวเดียว",
      ],
      optionsEn: [
        "Monitor (3500), Keyboard (900)",
        "Keyboard (900), Monitor (3500)",
        "Mouse (450), Keyboard (900)",
        "Monitor (3500) only",
      ],
      explanation: "เมื่อใช้ DESC ข้อมูลจะเรียงจากมากไปน้อย จึงได้ Monitor (3500) ตามด้วย Keyboard (900)",
      explanationEn: "With DESC, rows sort highest to lowest: Monitor (3500) then Keyboard (900).",
    },
    badgeReward: {
      id: "badge-sql-1",
      name: "นักค้นข้อมูล SQL",
      nameEn: "SQL Query Explorer",
      description: "เข้าใจการกรองข้อมูลด้วย WHERE และการเรียงลำดับด้วย ORDER BY",
      descriptionEn: "Master filtering with WHERE and sorting with ORDER BY.",
    },
  },
  {
    id: 202,
    title: "SQL ด่านที่ 2 · การรวมกลุ่มข้อมูลด้วย GROUP BY & SUM",
    titleEn: "SQL Floor 2 · Grouping & Aggregation with GROUP BY & SUM",
    shortName: "SQL 2 · GROUP BY & SUM",
    shortNameEn: "SQL 2 · GROUP BY & SUM",
    subtitle: "แกะรอยการยุบรวมแถวตามหมวดหมู่ (GROUP BY) และการกรองกลุ่มด้วย HAVING",
    subtitleEn: "Trace row grouping by category (GROUP BY) and group filtering with HAVING",
    code: `-- ตาราง sales:
-- ('Book', 200), ('Book', 300), ('Pen', 50)
SELECT category, SUM(amount) AS total
FROM sales
GROUP BY category
HAVING SUM(amount) >= 100;`,
    codeEn: `-- sales table:
-- ('Book', 200), ('Book', 300), ('Pen', 50)
SELECT category, SUM(amount) AS total
FROM sales
GROUP BY category
HAVING SUM(amount) >= 100;`,
    predictPrompt:
      "เมื่อรันคำสั่ง SQL ชุดนี้ จะเหลือหมวดหมู่ใดแสดงผลออกมา และมียอดรวมเท่าไร?",
    predictPromptEn:
      "When this SQL query runs, which category remains in the result and what is its total?",
    predictOptions: [
      "Book: 500",
      "Book: 500, Pen: 50",
      "Pen: 50",
      "Book: 200",
    ],
    predictOptionsEn: [
      "Book: 500",
      "Book: 500, Pen: 50",
      "Pen: 50",
      "Book: 200",
    ],
    predictExplanation:
      "GROUP BY รวมยอด Book ได้ 200 + 300 = 500 และ Pen ได้ 50 จากนั้น HAVING SUM(amount) >= 100 คัดเอาเฉพาะกลุ่มที่ยอดรวมตั้งแต่ 100 ขึ้นไป จึงเหลือ Book: 500",
    predictExplanationEn:
      "GROUP BY sums Book to 200 + 300 = 500 and Pen to 50. HAVING SUM(amount) >= 100 keeps only groups >= 100, leaving Book: 500.",
    steps: [
      {
        stepNumber: 1,
        line: 4,
        codeLine: "FROM sales",
        variables: { rows: "3 rows: (Book,200), (Book,300), (Pen,50)" },
        outputSoFar: [],
        explanation: "ดึงข้อมูลการขายทั้ง 3 แถวจากตาราง sales",
        explanationEn: "Load all 3 sales rows from the sales table.",
      },
      {
        stepNumber: 2,
        line: 5,
        codeLine: "GROUP BY category",
        variables: { groups: "Book: [200, 300], Pen: [50]" },
        outputSoFar: [],
        explanation: "จัดกลุ่มแถวที่มี category เดียวกันเข้าด้วยกัน ได้ 2 กลุ่มคือ Book และ Pen",
        explanationEn: "Group rows sharing the same category into Book and Pen.",
      },
      {
        stepNumber: 3,
        line: 6,
        codeLine: "HAVING SUM(amount) >= 100",
        variables: { filtered_groups: "Book (SUM = 500)" },
        outputSoFar: [],
        explanation: "กรองเฉพาะกลุ่มที่ผลรวม SUM(amount) >= 100 ทำให้กลุ่ม Pen (50) ถูกตัดออก",
        explanationEn: "Filter groups where SUM(amount) >= 100, dropping Pen (50).",
      },
      {
        stepNumber: 4,
        line: 3,
        codeLine: "SELECT category, SUM(amount) AS total",
        variables: { result: "Book: 500" },
        outputSoFar: ["Book: 500"],
        explanation: "แสดงชื่อหมวดหมู่และยอดรวมของกลุ่มที่ผ่านเกณฑ์ คือ Book: 500",
        explanationEn: "Output the remaining group and its sum: Book: 500.",
      },
    ],
    questions: [
      {
        id: "sql2-q1",
        cellId: "F2",
        targetLine: 6,
        question: "ทำไมในบรรทัดที่ 6 จึงต้องใช้คำสั่ง HAVING แทนที่จะใช้ WHERE?",
        questionEn: "Why does line 6 use HAVING instead of WHERE?",
        options: [
          {
            id: "a",
            text: "เพราะต้องการกรองผลลัพธ์หลังจากรวมกลุ่มและคำนวณฟังก์ชัน SUM() แล้ว",
            textEn: "Because it filters groups after GROUP BY and SUM() have been computed",
          },
          { id: "b", text: "เพราะตารางชื่อ sales ห้ามใช้คำสั่ง WHERE", textEn: "Because the sales table forbids WHERE" },
          { id: "c", text: "เพราะ HAVING ใช้เรียงลำดับข้อมูลแทน ORDER BY", textEn: "Because HAVING sorts rows like ORDER BY" },
          { id: "d", text: "เพราะ WHERE ใช้ได้กับข้อความเท่านั้น", textEn: "Because WHERE only works on text" },
        ],
        correctOptionId: "a",
        hint: "WHERE ทำงานก่อน GROUP BY ส่วนการกรองผลจาก SUM() ต้องทำหลัง GROUP BY",
        hintEn: "WHERE runs before GROUP BY; filtering on SUM() must happen after grouping.",
        explanation:
          "WHERE ใช้กรองรายแถวก่อนจัดกลุ่ม ส่วน HAVING ใช้กรองกลุ่มหลังจากทำ GROUP BY และ Aggregate Function (เช่น SUM, COUNT) แล้ว",
        explanationEn:
          "WHERE filters individual rows before grouping; HAVING filters grouped results after aggregates like SUM or COUNT.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองแก้เงื่อนไข HAVING SUM(amount) >= 100 เป็น HAVING SUM(amount) >= 50 เพื่อให้แสดงทั้งสองหมวดหมู่",
      instructionEn:
        "Change HAVING SUM(amount) >= 100 to HAVING SUM(amount) >= 50 and predict the result!",
      suggestedCode: `-- ตาราง sales:
-- ('Book', 200), ('Book', 300), ('Pen', 50)
SELECT category, SUM(amount) AS total
FROM sales
GROUP BY category
HAVING SUM(amount) >= 50;`,
      suggestedCodeEn: `-- sales table:
-- ('Book', 200), ('Book', 300), ('Pen', 50)
SELECT category, SUM(amount) AS total
FROM sales
GROUP BY category
HAVING SUM(amount) >= 50;`,
      changeDescription: "เปลี่ยนเกณฑ์ HAVING จาก 100 เป็น 50",
      changeDescriptionEn: "Change HAVING threshold from 100 to 50",
      options: [
        "Book: 500, Pen: 50",
        "Book: 500",
        "Pen: 50",
        "ไม่มีข้อมูลแสดงผล",
      ],
      optionsEn: [
        "Book: 500, Pen: 50",
        "Book: 500",
        "Pen: 50",
        "No rows returned",
      ],
      explanation: "เมื่อลดเกณฑ์เหลือ >= 50 กลุ่ม Pen ที่มียอดรวม 50 จึงผ่านเกณฑ์ด้วย",
      explanationEn: "Lowering the threshold to >= 50 allows Pen (50) to pass as well.",
    },
    badgeReward: {
      id: "badge-sql-2",
      name: "นักวิเคราะห์กลุ่มข้อมูล SQL",
      nameEn: "SQL Group Analyst",
      description: "เข้าใจการทำงานของ GROUP BY, SUM และการกรองกลุ่มด้วย HAVING",
      descriptionEn: "Master GROUP BY, SUM, and group filtering with HAVING.",
    },
  },
  {
    id: 203,
    title: "SQL ด่านที่ 3 · การจัดเรียง ORDER BY และจำกัดแถว LIMIT",
    titleEn: "SQL Floor 3 · Sorting with ORDER BY & LIMIT",
    shortName: "SQL 3 · ORDER BY & LIMIT",
    shortNameEn: "SQL 3 · ORDER BY & LIMIT",
    subtitle: "อ่านลำดับการจัดเรียงจากมากไปน้อย (DESC) และตัดเอาเฉพาะอันดับต้นๆ ด้วย LIMIT",
    subtitleEn: "Read descending sorts (DESC) and top-N row slicing with LIMIT",
    code: `-- ตาราง products:
-- (Keyboard, 900), (Mouse, 450), (Monitor, 3500)
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 2;`,
    codeEn: `-- products table:
-- (Keyboard, 900), (Mouse, 450), (Monitor, 3500)
SELECT name, price
FROM products
ORDER BY price DESC
LIMIT 2;`,
    predictPrompt:
      "เมื่อรันคำสั่ง SQL นี้ จะได้สินค้า 2 อันดับแรกใดออกมา?",
    predictPromptEn:
      "When this SQL query runs, which top 2 products are returned?",
    predictOptions: [
      "Monitor (3500), Keyboard (900)",
      "Mouse (450), Keyboard (900)",
      "Keyboard (900), Mouse (450)",
      "Monitor (3500)",
    ],
    predictOptionsEn: [
      "Monitor (3500), Keyboard (900)",
      "Mouse (450), Keyboard (900)",
      "Keyboard (900), Mouse (450)",
      "Monitor (3500)",
    ],
    predictExplanation:
      "ORDER BY price DESC เรียงราคาจากมากไปน้อย (3500 -> 900 -> 450) แล้ว LIMIT 2 ตัดเอา 2 แถวแรกคือ Monitor และ Keyboard",
    predictExplanationEn:
      "ORDER BY price DESC sorts 3500 -> 900 -> 450, then LIMIT 2 keeps the top 2 rows: Monitor and Keyboard.",
    steps: [
      {
        stepNumber: 1,
        line: 4,
        codeLine: "FROM products",
        variables: { rows: "3 rows: Keyboard(900), Mouse(450), Monitor(3500)" },
        outputSoFar: [],
        explanation: "ดึงข้อมูลสินค้าทั้งหมด 3 แถวจากตาราง products",
        explanationEn: "Load all 3 product rows from products.",
      },
      {
        stepNumber: 2,
        line: 5,
        codeLine: "ORDER BY price DESC",
        variables: { sorted: "Monitor(3500), Keyboard(900), Mouse(450)" },
        outputSoFar: [],
        explanation: "เรียงลำดับตามราคาจากมากไปน้อย (DESC = Descending)",
        explanationEn: "Sort by price descending (DESC).",
      },
      {
        stepNumber: 3,
        line: 6,
        codeLine: "LIMIT 2;",
        variables: { result: "Monitor (3500), Keyboard (900)" },
        outputSoFar: ["Monitor (3500), Keyboard (900)"],
        explanation: "จำกัดผลลัพธ์ให้แสดงเพียง 2 แถวบนสุด",
        explanationEn: "Limit output to the first 2 rows.",
      },
    ],
    questions: [
      {
        id: "sql3-q1",
        cellId: "T2",
        targetLine: 5,
        question: "หากไม่ระบุคำว่า DESC หลัง ORDER BY price ระบบ SQL จะเรียงลำดับอย่างไรเป็นค่าเริ่มต้น?",
        questionEn: "If DESC is omitted after ORDER BY price, what is SQL's default sort order?",
        options: [
          { id: "a", text: "เรียงจากน้อยไปมาก (ASC)", textEn: "Ascending (ASC, lowest to highest)" },
          { id: "b", text: "เรียงจากมากไปน้อย (DESC)", textEn: "Descending (DESC, highest to lowest)" },
          { id: "c", text: "เรียงแบบสุ่มทุกครั้ง", textEn: "Random order every time" },
          { id: "d", text: "เกิด Syntax Error ทันที", textEn: "A Syntax Error occurs" },
        ],
        correctOptionId: "a",
        hint: "ค่าเริ่มต้นของ ORDER BY คือ Ascending (ASC)",
        hintEn: "The default direction for ORDER BY is Ascending (ASC).",
        explanation:
          "หากไม่ใส่ DESC คำสั่ง ORDER BY จะใช้ ASC (น้อยไปมาก) เป็นค่าเริ่มต้นเสมอ",
        explanationEn:
          "Without DESC, ORDER BY always defaults to ASC (lowest to highest).",
      },
      {
        id: "sql3-q2",
        cellId: "F2",
        targetLine: 6,
        question: "เหตุใดจึงควรใช้ LIMIT ควบคู่กับ ORDER BY เสมอเวลาต้องการหา 'Top N'?",
        questionEn: "Why should LIMIT always be paired with ORDER BY when querying for 'Top N'?",
        options: [
          { id: "a", text: "เพราะถ้าไม่เรียงลำดับก่อน LIMIT อาจได้แถวที่ไม่ได้เรียงตามที่ต้องการ", textEn: "Without sorting first, LIMIT may return arbitrary rows instead of the true Top N" },
          { id: "b", text: "เพราะ LIMIT ใช้ได้เฉพาะกับคอลัมน์ที่เป็นตัวเลข", textEn: "Because LIMIT only works on numeric columns" },
          { id: "c", text: "เพราะ ORDER BY จะลบแถวที่เหลือออกจากฐานข้อมูล", textEn: "Because ORDER BY deletes remaining rows" },
          { id: "d", text: "เพราะฐานข้อมูลห้ามใช้ SELECT โดยไม่มี LIMIT", textEn: "Because SQL forbids SELECT without LIMIT" },
        ],
        correctOptionId: "a",
        hint: "ถ้าตารางไม่ได้เรียงไว้ล่วงหน้า การตัด 2 แถวแรกเลยจะได้ข้อมูลแบบไหน?",
        hintEn: "If a table isn't sorted, what does taking the first 2 rows give you?",
        explanation:
          "LIMIT แค่ตัด N แถวแรกจากผลลัพธ์ จึงต้องเรียงลำดับด้วย ORDER BY ก่อนเพื่อให้ได้ Top N ที่ถูกต้อง",
        explanationEn:
          "LIMIT simply slices the first N rows; ORDER BY guarantees those N rows are the actual Top N.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยน ORDER BY price DESC ในบรรทัดที่ 5 เป็น ORDER BY price ASC เพื่อดูสินค้าที่ถูกที่สุด 2 อันดับแรก",
      instructionEn:
        "Change ORDER BY price DESC to ORDER BY price ASC to get the 2 cheapest items!",
      suggestedCode: `-- ตาราง products:
-- (Keyboard, 900), (Mouse, 450), (Monitor, 3500)
SELECT name, price
FROM products
ORDER BY price ASC
LIMIT 2;`,
      suggestedCodeEn: `-- products table:
-- (Keyboard, 900), (Mouse, 450), (Monitor, 3500)
SELECT name, price
FROM products
ORDER BY price ASC
LIMIT 2;`,
      changeDescription: "เปลี่ยนการเรียงจาก DESC เป็น ASC",
      changeDescriptionEn: "Change sort order from DESC to ASC",
      options: [
        "Mouse (450), Keyboard (900)",
        "Monitor (3500), Keyboard (900)",
        "Keyboard (900), Mouse (450)",
        "Mouse (450)",
      ],
      optionsEn: [
        "Mouse (450), Keyboard (900)",
        "Monitor (3500), Keyboard (900)",
        "Keyboard (900), Mouse (450)",
        "Mouse (450)",
      ],
      explanation: "ASC เรียงจากน้อยไปมาก (450 -> 900 -> 3500) เมื่อ LIMIT 2 จึงได้ Mouse และ Keyboard",
      explanationEn: "ASC sorts 450 -> 900 -> 3500, so LIMIT 2 returns Mouse and Keyboard.",
    },
    badgeReward: {
      id: "badge-sql-3",
      name: "ผู้จัดระเบียบข้อมูล SQL",
      nameEn: "SQL Sort & Slice Specialist",
      description: "เข้าใจการจัดเรียงข้อมูลด้วย ORDER BY และจำกัดจำนวนด้วย LIMIT",
      descriptionEn: "Master sorting with ORDER BY and limiting results with LIMIT.",
    },
  },
  {
    id: 204,
    title: "SQL ด่านบอส · การเชื่อมตาราง INNER JOIN และกรองผลลัพธ์",
    titleEn: "SQL Boss · INNER JOIN & Filtered Results",
    shortName: "SQL 4 · INNER JOIN Boss",
    shortNameEn: "SQL 4 · INNER JOIN Boss",
    isBoss: true,
    subtitle: "ด่านบอส SQL: แกะรอยการเชื่อม 2 ตารางด้วยคีย์อ้างอิง (Foreign Key) และเงื่อนไข JOIN",
    subtitleEn: "SQL Boss: trace joining two tables via Foreign Key and filtering the joined rows",
    code: `-- orders: (101, cust_id=1, 500), (102, cust_id=2, 300)
-- customers: (1, 'Alice'), (2, 'Bob')
SELECT c.name, o.total
FROM orders o
INNER JOIN customers c ON o.cust_id = c.id
WHERE o.total >= 400;`,
    predictPrompt:
      "ผลลัพธ์จากการเชื่อมตาราง orders และ customers พร้อมเงื่อนไข WHERE o.total >= 400 คือข้อใด?",
    predictPromptEn:
      "What is the result of joining orders and customers with WHERE o.total >= 400?",
    predictOptions: [
      "Alice: 500",
      "Alice: 500, Bob: 300",
      "Bob: 300",
      "ไม่มีข้อมูลแสดงผล",
    ],
    predictOptionsEn: [
      "Alice: 500",
      "Alice: 500, Bob: 300",
      "Bob: 300",
      "No rows returned",
    ],
    predictExplanation:
      "เชื่อมแถวที่มี o.cust_id = c.id จะได้ (Alice, 500) และ (Bob, 300) จากนั้น WHERE o.total >= 400 คัดเหลือเพียง Alice: 500",
    predictExplanationEn:
      "Joining on o.cust_id = c.id pairs (Alice, 500) and (Bob, 300), then WHERE o.total >= 400 keeps only Alice: 500.",
    steps: [
      {
        stepNumber: 1,
        line: 4,
        codeLine: "FROM orders o",
        variables: { orders: "(101, cust_id=1, 500), (102, cust_id=2, 300)" },
        outputSoFar: [],
        explanation: "ตั้งต้นจากตาราง orders โดยตั้งชื่อย่อ (Alias) ว่า o",
        explanationEn: "Start from the orders table with alias o.",
      },
      {
        stepNumber: 2,
        line: 5,
        codeLine: "INNER JOIN customers c ON o.cust_id = c.id",
        variables: { joined: "(Alice, 500), (Bob, 300)" },
        outputSoFar: [],
        explanation: "จับคู่แต่ละใบสั่งซื้อเข้ากับข้อมูลลูกค้าที่ o.cust_id ตรงกับ c.id",
        explanationEn: "Match each order to its customer where o.cust_id = c.id.",
      },
      {
        stepNumber: 3,
        line: 6,
        codeLine: "WHERE o.total >= 400;",
        variables: { filtered: "(Alice, 500)" },
        outputSoFar: ["Alice: 500"],
        explanation: "กรองเฉพาะออเดอร์ที่ยอดรวม >= 400 จึงเหลือ Alice: 500",
        explanationEn: "Filter orders with o.total >= 400, leaving Alice: 500.",
      },
    ],
    questions: [
      {
        id: "sql4-q1",
        cellId: "T2",
        targetLine: 5,
        question: "เงื่อนไข ON o.cust_id = c.id ใน INNER JOIN มีไว้ทำอะไร?",
        questionEn: "What is the purpose of ON o.cust_id = c.id in the INNER JOIN?",
        options: [
          { id: "a", text: "ระบุคีย์ที่ใช้จับคู่แถวที่สัมพันธ์กันระหว่างตาราง orders และ customers", textEn: "Specifies the matching key linking related rows between orders and customers" },
          { id: "b", text: "เรียงลำดับชื่อลูกค้าตามตัวอักษร", textEn: "Sorts customer names alphabetically" },
          { id: "c", text: "ลบข้อมูลลูกค้าที่ไม่มีออเดอร์ออกจากฐานข้อมูล", textEn: "Deletes customers without orders from the database" },
          { id: "d", text: "บวกยอดเงินทั้งหมดเข้าด้วยกัน", textEn: "Sums all order totals together" },
        ],
        correctOptionId: "a",
        hint: "ถ้าไม่มี ON การ JOIN จะไม่รู้ว่าแถวไหนใน orders คู่กับแถวไหนใน customers",
        hintEn: "Without ON, the join wouldn't know which order row belongs to which customer row.",
        explanation:
          "คำสั่ง ON กำหนดเงื่อนไขการเชื่อมคีย์ (Foreign Key = Primary Key) เพื่อป้องกันการจับคู่ไขว้กันมั่ว (Cartesian Product)",
        explanationEn:
          "ON defines the Foreign Key = Primary Key relationship to prevent an unintended Cartesian product.",
      },
      {
        id: "sql4-q2",
        cellId: "F4",
        targetLine: 5,
        question: "หาก AI ลืมใส่เงื่อนไข ON หรือเขียนเงื่อนไข JOIN ผิดเป็น ON 1 = 1 จะเกิดปัญหาใด?",
        questionEn: "If an AI forgets the ON key or writes ON 1 = 1, what bug occurs?",
        options: [
          { id: "a", text: "แถวจะถูกจับคู่ไขว้กันทั้งหมดทำให้ได้ข้อมูลซ้ำและยอดรวมผิดเพี้ยน", textEn: "Every row pairs with every row (Cross Join), duplicating data and inflating totals" },
          { id: "b", text: "คิวรีจะทำงานเร็วขึ้น 2 เท่า", textEn: "The query runs 2x faster" },
          { id: "c", text: "ตารางจะถูกเปลี่ยนชื่อเป็น 1", textEn: "The table is renamed to 1" },
          { id: "d", text: "SQL จะเดาคีย์ที่ถูกต้องให้เองเสมอ", textEn: "SQL always guesses the right key automatically" },
        ],
        correctOptionId: "a",
        hint: "เมื่อทุกแถวของตาราง A จับคู่กับทุกแถวของตาราง B ผลลัพธ์จะมีจำนวนแถวเท่ากับ A × B",
        hintEn: "When every row in A pairs with every row in B, you get A × B rows.",
        explanation:
          "เงื่อนไข JOIN ที่เป็นจริงเสมอจะทำให้เกิด Cross Join ข้อมูลทวีคูณและทำให้รายงานหรือยอดเงินผิดพลาดร้ายแรง",
        explanationEn:
          "An always-true JOIN condition produces a Cross Join, multiplying rows and corrupting aggregates.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองแก้เงื่อนไข WHERE o.total >= 400; เป็น WHERE o.total >= 300; เพื่อดึงข้อมูลของ Bob ด้วย",
      instructionEn:
        "Change WHERE o.total >= 400; to WHERE o.total >= 300; to include Bob and predict the output!",
      suggestedCode: `-- orders: (101, cust_id=1, 500), (102, cust_id=2, 300)
-- customers: (1, 'Alice'), (2, 'Bob')
SELECT c.name, o.total
FROM orders o
INNER JOIN customers c ON o.cust_id = c.id
WHERE o.total >= 300;`,
      changeDescription: "ลดเกณฑ์ WHERE o.total จาก 400 เป็น 300",
      changeDescriptionEn: "Lower WHERE o.total threshold from 400 to 300",
      options: [
        "Alice: 500, Bob: 300",
        "Alice: 500",
        "Bob: 300",
        "ไม่มีข้อมูลแสดงผล",
      ],
      optionsEn: [
        "Alice: 500, Bob: 300",
        "Alice: 500",
        "Bob: 300",
        "No rows returned",
      ],
      explanation: "ออเดอร์ของ Bob มียอด 300 จึงผ่านเงื่อนไข >= 300 และแสดงผลทั้งสองคน",
      explanationEn: "Bob's order total is 300, which passes >= 300, so both Alice and Bob appear.",
    },
    badgeReward: {
      id: "badge-sql-boss",
      name: "ผู้พิชิตวิหารข้อมูล SQL",
      nameEn: "SQL Vault Conqueror",
      description: "เชี่ยวชาญ SELECT/WHERE, GROUP BY/HAVING, ORDER BY/LIMIT และ INNER JOIN",
      descriptionEn: "Mastered SELECT/WHERE, GROUP BY/HAVING, ORDER BY/LIMIT, and INNER JOIN.",
    },
  },
];

// ============================================================================
// เควสต์ PRIMM เฉพาะสำหรับภาษา TypeScript (IDs 301..303)
// ============================================================================
export const TYPESCRIPT_TOPICS: TopicQuest[] = [
  {
    id: 301,
    title: "TypeScript ด่านที่ 1 · Interface และ Type Annotation",
    titleEn: "TypeScript Floor 1 · Interfaces & Type Annotations",
    shortName: "TS 1 · Interface & Types",
    shortNameEn: "TS 1 · Interface & Types",
    subtitle: "แกะรอยสัญญาข้อมูล (interface) และการคำนวณค่าตัวแปรที่ปลอดภัยด้วยชนิดข้อมูล",
    subtitleEn: "Trace data contracts (interface) and type-safe variable arithmetic",
    code: `interface Product {
  name: string;
  price: number;
}
const item: Product = { name: "Mouse", price: 450 };
const qty: number = 2;
const total: number = item.price * qty;
console.log(total);`,
    predictPrompt:
      "เมื่อรันโค้ด TypeScript ชุดนี้ console.log(total) จะแสดงผลลัพธ์ค่าใด?",
    predictPromptEn:
      "When this TypeScript code runs, what will console.log(total) print?",
    predictOptions: ["900", "450", "2", "NaN"],
    predictOptionsEn: ["900", "450", "2", "NaN"],
    predictExplanation:
      "item.price มีค่า 450 (number) คูณกับ qty = 2 จึงได้ total = 900",
    predictExplanationEn:
      "item.price is 450 (number) multiplied by qty = 2, giving total = 900.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: "interface Product { name: string; price: number; }",
        variables: { Product: "interface { name: string, price: number }" },
        outputSoFar: [],
        explanation:
          "กำหนดโครงสร้างชนิดข้อมูล Product เพื่อบังคับว่า Object ต้องมี name (ข้อความ) และ price (ตัวเลข) ก่อนรันจริง",
        explanationEn:
          "Define the Product interface requiring name (string) and price (number) at compile time.",
      },
      {
        stepNumber: 2,
        line: 5,
        codeLine: 'const item: Product = { name: "Mouse", price: 450 };',
        variables: { "item.name": '"Mouse"', "item.price": "450" },
        outputSoFar: [],
        explanation: "สร้างออบเจ็กต์ item ที่ตรงตาม interface Product ทุกช่อง",
        explanationEn: "Create object item matching the Product interface.",
      },
      {
        stepNumber: 3,
        line: 6,
        codeLine: "const qty: number = 2;",
        variables: { "item.price": "450", qty: "2" },
        outputSoFar: [],
        explanation: "ประกาศตัวแปร qty ชนิด number เก็บค่า 2",
        explanationEn: "Declare typed variable qty: number = 2.",
      },
      {
        stepNumber: 4,
        line: 7,
        codeLine: "const total: number = item.price * qty;",
        variables: { "item.price": "450", qty: "2", total: "900" },
        outputSoFar: [],
        explanation: "คำนวณ 450 * 2 = 900 เก็บลงในตัวแปร total",
        explanationEn: "Compute 450 * 2 = 900 and store in total.",
      },
      {
        stepNumber: 5,
        line: 8,
        codeLine: "console.log(total);",
        variables: { total: "900" },
        outputSoFar: ["900"],
        explanation: "พิมพ์ค่า total คือ 900 ออกทางหน้าจอ",
        explanationEn: "Print total (900) to the console.",
      },
    ],
    questions: [
      {
        id: "ts1-q1",
        cellId: "T1",
        targetLine: 1,
        question: "คำสั่ง interface Product ใน TypeScript มีไว้ทำหน้าที่อะไรขณะพัฒนาโปรแกรม?",
        questionEn: "What role does `interface Product` serve in TypeScript during development?",
        options: [
          {
            id: "a",
            text: "กำหนดรูปแบบ property และชนิดข้อมูลของออบเจ็กต์ให้ TypeScript ตรวจสอบก่อนรัน",
            textEn: "Defines object property shapes and types so TypeScript checks them before runtime",
          },
          { id: "b", text: "สร้างตารางในฐานข้อมูลอัตโนมัติ", textEn: "Automatically creates a database table" },
          { id: "c", text: "วนซ้ำข้อมูลในอาร์เรย์", textEn: "Loops over items in an array" },
          { id: "d", text: "แปลงตัวเลขให้เป็นข้อความเสมอ", textEn: "Always converts numbers to strings" },
        ],
        correctOptionId: "a",
        hint: "สังเกตว่า interface ระบุชื่อฟิลด์และชนิดข้อมูล (string, number) ไว้ล่วงหน้า",
        hintEn: "Notice how interface declares field names and types (string, number) upfront.",
        explanation:
          "interface เป็นสัญญาโครงสร้างข้อมูลระดับ Compile-time ที่ช่วยจับบั๊กหากกำหนดค่าผิดชนิดหรือสะกดชื่อฟิลด์ผิด",
        explanationEn:
          "An interface is a compile-time structural contract that catches type mismatches and typos early.",
      },
      {
        id: "ts1-q2",
        cellId: "E1",
        targetLine: 7,
        question: "ถ้าสั่ง AI แก้บรรทัดที่ 5 เป็น price: \"450\" (ใส่เครื่องหมายคำพูด) จะเกิดอะไรขึ้น?",
        questionEn: 'If line 5 were changed to price: "450" (a string), what would happen?',
        options: [
          {
            id: "a",
            text: "TypeScript แจ้ง Type Error ทันทีเพราะ price ต้องเป็น number ไม่ใช่ string",
            textEn: "TypeScript reports a Type Error immediately because price must be number, not string",
          },
          { id: "b", text: "ทำงานผ่านปกติโดยไม่เตือนอะไร", textEn: "Compiles cleanly with no warning" },
          { id: "c", text: "ลบตัวแปร item ทิ้ง", textEn: "Deletes the item variable" },
          { id: "d", text: "ได้ค่า total เป็น 4502", textEn: "total becomes 4502" },
        ],
        correctOptionId: "a",
        hint: "ดูที่ price: number ใน interface Product",
        hintEn: "Check price: number inside interface Product.",
        explanation:
          "เนื่องจาก price ถูกกำหนดชนิดเป็น number การใส่ \"450\" ซึ่งเป็น string จะถูกตรวจพบตั้งแต่ตอน Compile",
        explanationEn:
          'Because price is typed as number, assigning "450" (a string) triggers a compile-time Type Error.',
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยนค่า qty ในบรรทัดที่ 6 จาก 2 เป็น 3 เพื่อคำนวณราคาสินค้า 3 ชิ้น (ผลลัพธ์จะเป็น 1350)",
      instructionEn:
        "Change qty on line 6 from 2 to 3 and predict the new total!",
      suggestedCode: `interface Product {
  name: string;
  price: number;
}
const item: Product = { name: "Mouse", price: 450 };
const qty: number = 3;
const total: number = item.price * qty;
console.log(total);`,
      changeDescription: "เปลี่ยน qty จาก 2 เป็น 3",
      changeDescriptionEn: "Change qty from 2 to 3",
      options: ["1350", "900", "450", "1800"],
      optionsEn: ["1350", "900", "450", "1800"],
      explanation: "เมื่อ qty = 3 จะได้ 450 * 3 = 1350",
      explanationEn: "With qty = 3, 450 * 3 = 1350.",
    },
    badgeReward: {
      id: "badge-ts-1",
      name: "ผู้พิทักษ์ TypeScript",
      nameEn: "TypeScript Guardian",
      description: "เข้าใจการอ่าน Interface และ Type Annotation ใน TypeScript",
      descriptionEn: "Mastered reading TypeScript Interfaces and Type Annotations.",
    },
  },
  {
    id: 302,
    title: "TypeScript ด่านที่ 2 · Union Type และ Type Narrowing",
    titleEn: "TypeScript Floor 2 · Union Types & Type Narrowing",
    shortName: "TS 2 · Union & Narrowing",
    shortNameEn: "TS 2 · Union & Narrowing",
    subtitle: "ติดตามการบีบชนิดข้อมูล (Type Narrowing) ผ่านเงื่อนไข if / else",
    subtitleEn: "Follow control-flow Type Narrowing through if/return branches",
    code: `type Status = "paid" | "pending" | "failed";
function getBadge(status: Status): string {
  if (status === "paid") return "Verified";
  if (status === "pending") return "Waiting";
  return "Retry";
}
const result: string = getBadge("pending");
console.log(result);`,
    predictPrompt:
      'เมื่อเรียก getBadge("pending") โปรแกรมจะพิมพ์ข้อความใดออกมา?',
    predictPromptEn:
      'When calling getBadge("pending"), what string will be printed?',
    predictOptions: ["Waiting", "Verified", "Retry", "pending"],
    predictOptionsEn: ["Waiting", "Verified", "Retry", "pending"],
    predictExplanation:
      'status มีค่าเป็น "pending" จึงข้าม if แรกและตรงกับ if (status === "pending") ส่งคืน "Waiting"',
    predictExplanationEn:
      'status is "pending", so the first if is skipped and the second returns "Waiting".',
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: 'type Status = "paid" | "pending" | "failed";',
        variables: { Status: '"paid" | "pending" | "failed"' },
        outputSoFar: [],
        explanation:
          "Union Type จำกัดค่าที่เป็นไปได้ของ Status ให้เหลือเพียง 3 ข้อความที่ระบุเท่านั้น",
        explanationEn:
          "The Union Type restricts Status to only those three exact string literals.",
      },
      {
        stepNumber: 2,
        line: 7,
        codeLine: 'const result: string = getBadge("pending");',
        variables: { status: '"pending"' },
        outputSoFar: [],
        explanation: 'เรียกฟังก์ชัน getBadge โดยส่งอาร์กิวเมนต์ "pending" เข้าไป',
        explanationEn: 'Call getBadge with argument "pending".',
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: 'if (status === "paid") return "Verified";',
        variables: { status: '"pending"' },
        outputSoFar: [],
        explanation: 'เงื่อนไข "pending" === "paid" เป็นเท็จ จึงข้ามไปบรรทัดถัดไป',
        explanationEn: '"pending" === "paid" is false, so proceed to line 4.',
      },
      {
        stepNumber: 4,
        line: 4,
        codeLine: 'if (status === "pending") return "Waiting";',
        variables: { status: '"pending"', returnValue: '"Waiting"' },
        outputSoFar: [],
        explanation: 'ตรงเงื่อนไข! ฟังก์ชันส่งคืนค่า "Waiting" ทันที',
        explanationEn: 'Match! The function immediately returns "Waiting".',
      },
      {
        stepNumber: 5,
        line: 8,
        codeLine: "console.log(result);",
        variables: { result: '"Waiting"' },
        outputSoFar: ["Waiting"],
        explanation: 'พิมพ์ข้อความ "Waiting" ออกทางหน้าจอ',
        explanationEn: 'Print "Waiting" to the console.',
      },
    ],
    questions: [
      {
        id: "ts2-q1",
        cellId: "T2",
        targetLine: 1,
        question: "ข้อดีของการใช้ Union Type (\"paid\" | \"pending\" | \"failed\") แทน string ทั่วไปคืออะไร?",
        questionEn: 'What is the benefit of a Union Type ("paid" | "pending" | "failed") over plain string?',
        options: [
          {
            id: "a",
            text: "ป้องกันการพิมพ์ค่าสถานะผิด เช่น \"paidd\" เพราะคอมไพเลอร์จะแจ้งเตือนทันที",
            textEn: 'Prevents typos like "paidd" because the compiler catches invalid values immediately',
          },
          { id: "b", text: "ทำให้โค้ดทำงานเร็วขึ้น 100 เท่า", textEn: "Makes the code run 100x faster" },
          { id: "c", text: "อนุญาตให้ส่งตัวเลขเข้าไปแทนข้อความได้", textEn: "Allows passing numbers instead of strings" },
          { id: "d", text: "ทำให้ไม่ต้องเขียนคำสั่ง return", textEn: "Eliminates the need for return statements" },
        ],
        correctOptionId: "a",
        hint: "Union Type จำกัดกลุ่มค่าที่ถูกต้องให้แคบลงเหลือเฉพาะที่ระบุไว้",
        hintEn: "A Union Type constrains allowed values to the exact listed literals.",
        explanation:
          "Union Literal Type ช่วยป้องกันบั๊กจากค่าข้อความที่สะกดผิดได้ตั้งแต่ก่อนรันโปรแกรม",
        explanationEn:
          "Union literal types catch invalid or misspelled status strings before runtime.",
      },
      {
        id: "ts2-q2",
        cellId: "E2",
        targetLine: 5,
        question: "หลังผ่านบรรทัดที่ 3 และ 4 แล้ว TypeScript รู้ได้อย่างไรว่าในบรรทัดที่ 5 status เหลือค่าเดียวคือ \"failed\"?",
        questionEn: 'After lines 3 and 4, how does TypeScript know status can only be "failed" on line 5?',
        options: [
          {
            id: "a",
            text: "เกิด Type Narrowing เพราะทั้ง \"paid\" และ \"pending\" ถูก return ออกไปแล้ว",
            textEn: 'Type Narrowing: "paid" and "pending" already returned on earlier lines',
          },
          { id: "b", text: "เพราะบรรทัดที่ 5 มีคำสั่ง delete", textEn: "Because line 5 uses delete" },
          { id: "c", text: "เพราะฟังก์ชันส่งคืนค่าเป็น null", textEn: "Because the function returns null" },
          { id: "d", text: "ไม่รู้ ต้องรอตอนรันจริงเท่านั้น", textEn: "It doesn't know until runtime" },
        ],
        correctOptionId: "a",
        hint: "เมื่อตัดทางเลือก 2 ค่าแรกออกด้วย if + return ค่าสุดท้ายใน Union จึงเหลือเพียงค่าเดียว",
        hintEn: "Eliminating the first two union members via early returns leaves only the third.",
        explanation:
          "นี่คือหลัก Control-Flow Type Narrowing ของ TypeScript ที่วิเคราะห์การไหลของ if/return ได้อัตโนมัติ",
        explanationEn:
          "TypeScript's control-flow narrowing automatically eliminates returned cases.",
      },
    ],
    modifyChallenge: {
      instruction:
        'เปลี่ยนการเรียกในบรรทัดที่ 7 จาก getBadge("pending") เป็น getBadge("paid") เพื่อให้ได้ผลลัพธ์ Verified',
      instructionEn:
        'Change getBadge("pending") on line 7 to getBadge("paid") and predict the output!',
      suggestedCode: `type Status = "paid" | "pending" | "failed";
function getBadge(status: Status): string {
  if (status === "paid") return "Verified";
  if (status === "pending") return "Waiting";
  return "Retry";
}
const result: string = getBadge("paid");
console.log(result);`,
      changeDescription: 'เปลี่ยนอาร์กิวเมนต์เป็น "paid"',
      changeDescriptionEn: 'Change argument to "paid"',
      options: ["Verified", "Waiting", "Retry", "paid"],
      optionsEn: ["Verified", "Waiting", "Retry", "paid"],
      explanation: 'เมื่อส่ง "paid" จะเข้าเงื่อนไขบรรทัดที่ 3 และคืนค่า "Verified"',
      explanationEn: 'Passing "paid" hits line 3 and returns "Verified".',
    },
    badgeReward: {
      id: "badge-ts-2",
      name: "จอมบีบ Type Narrowing",
      nameEn: "Type Narrowing Master",
      description: "เข้าใจ Union Type และการวิเคราะห์ทางแยกใน TypeScript",
      descriptionEn: "Mastered Union Types and control-flow narrowing in TypeScript.",
    },
  },
  {
    id: 303,
    title: "TypeScript ด่านที่ 3 · Generics <T> และ Readonly Guard",
    titleEn: "TypeScript Floor 3 · Generics <T> & Readonly Guard",
    shortName: "TS 3 · Generics <T>",
    shortNameEn: "TS 3 · Generics <T>",
    subtitle: "แกะรอยฟังก์ชัน Generic และการป้องกันอาเรย์ว่าง",
    subtitleEn: "Trace a Generic function and an empty-array safety guard",
    code: `function getFirstScore<T>(items: readonly T[], fallback: T): T {
  if (items.length === 0) return fallback;
  return items[0];
}
const scores: readonly number[] = [88, 92, 75];
console.log(getFirstScore(scores, 0));`,
    predictPrompt:
      "เมื่อรันโค้ด Generic Boss ชุดนี้ console.log จะพิมพ์ค่าใดออกมา?",
    predictPromptEn:
      "When this Generic snippet runs, what value will console.log print?",
    predictOptions: ["88", "0", "75", "undefined"],
    predictOptionsEn: ["88", "0", "75", "undefined"],
    predictExplanation:
      "scores มีสมาชิก 3 ตัว (ไม่ว่าง) จึงไม่เข้า if (items.length === 0) และส่งคืน items[0] คือ 88",
    predictExplanationEn:
      "scores has 3 items (non-empty), so the guard is skipped and items[0] (88) is returned.",
    steps: [
      {
        stepNumber: 1,
        line: 5,
        codeLine: "const scores: readonly number[] = [88, 92, 75];",
        variables: { scores: "[88, 92, 75] (readonly)" },
        outputSoFar: [],
        explanation: "สร้างอาเรย์คะแนนแบบ readonly เพื่อห้ามแก้ไขสมาชิกภายในโดยไม่ได้ตั้งใจ",
        explanationEn: "Create a readonly number array to prevent accidental mutation.",
      },
      {
        stepNumber: 2,
        line: 1,
        codeLine: "function getFirstScore<T>(items: readonly T[], fallback: T): T",
        variables: { T: "number", items: "[88, 92, 75]", fallback: "0" },
        outputSoFar: [],
        explanation: "TypeScript อนุมานว่า T คือ number จากอาร์กิวเมนต์ scores และ 0",
        explanationEn: "TypeScript infers T = number from scores and fallback 0.",
      },
      {
        stepNumber: 3,
        line: 2,
        codeLine: "if (items.length === 0) return fallback;",
        variables: { "items.length": "3" },
        outputSoFar: [],
        explanation: "ตรวจสอบว่าอาเรย์ว่างหรือไม่ (3 === 0 เป็นเท็จ) จึงไม่ใช้ค่า fallback",
        explanationEn: "Check if items is empty (3 === 0 is false), so skip fallback.",
      },
      {
        stepNumber: 4,
        line: 3,
        codeLine: "return items[0];",
        variables: { returnValue: "88" },
        outputSoFar: [],
        explanation: "ส่งคืนสมาชิกตัวแรกที่ตำแหน่ง index 0 คือ 88",
        explanationEn: "Return the first element at index 0 (88).",
      },
      {
        stepNumber: 5,
        line: 6,
        codeLine: "console.log(getFirstScore(scores, 0));",
        variables: { output: "88" },
        outputSoFar: ["88"],
        explanation: "พิมพ์ค่า 88 ออกทางหน้าจอ",
        explanationEn: "Print 88 to the console.",
      },
    ],
    questions: [
      {
        id: "ts3-q1",
        cellId: "T3",
        targetLine: 1,
        question: "สัญลักษณ์ <T> ใน getFirstScore<T> มีประโยชน์อย่างไรเหนือกว่าการใช้ any?",
        questionEn: "Why is `<T>` in `getFirstScore<T>` better than using `any`?",
        options: [
          {
            id: "a",
            text: "รักษาความสัมพันธ์ของชนิดข้อมูลให้ค่าที่ส่งคืนมี Type ตรงกับชนิดสมาชิกใน items เสมอ",
            textEn: "Preserves type safety so the return type matches the element type of items",
          },
          { id: "b", text: "บังคับให้อาเรย์มีได้เฉพาะตัวเลขเท่านั้น", textEn: "Forces the array to contain only numbers" },
          { id: "c", text: "ทำให้อาเรย์สามารถแก้ไขค่าได้เร็วขึ้น", textEn: "Makes array mutations faster" },
          { id: "d", text: "ปิดการตรวจสอบ Type ของ TypeScript ทั้งไฟล์", textEn: "Disables TypeScript checking for the entire file" },
        ],
        correctOptionId: "a",
        hint: "สังเกตว่า T ปรากฏทั้งใน items: readonly T[], fallback: T และชนิดค่าคืน : T",
        hintEn: "Notice T links items: readonly T[], fallback: T, and the return type : T.",
        explanation:
          "Generic <T> เชื่อมโยงชนิดของพารามิเตอร์เข้ากับค่าที่ส่งกลับ โดยไม่ต้องสูญเสีย Type Safety เหมือน any",
        explanationEn:
          "Generic <T> ties parameter types to the return type without losing Type Safety like `any` does.",
      },
      {
        id: "ts3-q2",
        cellId: "F4",
        targetLine: 2,
        question: "บรรทัดที่ 2 (if (items.length === 0) return fallback;) ช่วยป้องกันบั๊กใดที่ AI มักลืม?",
        questionEn: "What common AI bug does line 2 (if (items.length === 0) return fallback;) prevent?",
        options: [
          {
            id: "a",
            text: "ป้องกันการอ่าน items[0] แล้วได้ undefined เมื่ออาเรย์ว่าง",
            textEn: "Prevents reading items[0] as undefined when the array is empty",
          },
          { id: "b", text: "ป้องกันลูปไม่รู้จบ", textEn: "Prevents infinite loops" },
          { id: "c", text: "ป้องกันการหารด้วยศูนย์", textEn: "Prevents division by zero" },
          { id: "d", text: "ป้องกันการประกาศตัวแปรซ้ำ", textEn: "Prevents duplicate variable declarations" },
        ],
        correctOptionId: "a",
        hint: "ถ้า items เป็น [] ค่าของ items[0] จะเป็นอะไร?",
        hintEn: "If items is [], what would items[0] evaluate to?",
        explanation:
          "เมื่ออาเรย์ว่าง items[0] จะได้ undefined ซึ่งอาจทำให้โค้ดปลายทางพัง การมี guard คืนค่า fallback จึงปลอดภัย",
        explanationEn:
          "On an empty array, items[0] is undefined; returning fallback keeps the return type T guaranteed.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยนอาเรย์ scores ในบรรทัดที่ 5 เป็น [] (อาเรย์ว่าง) เพื่อให้ฟังก์ชันส่งคืนค่า fallback คือ 0",
      instructionEn:
        "Change scores on line 5 to [] (empty array) and predict the returned fallback value!",
      suggestedCode: `function getFirstScore<T>(items: readonly T[], fallback: T): T {
  if (items.length === 0) return fallback;
  return items[0];
}
const scores: readonly number[] = [];
console.log(getFirstScore(scores, 0));`,
      changeDescription: "เปลี่ยน scores เป็นอาเรย์ว่าง []",
      changeDescriptionEn: "Change scores to an empty array []",
      options: ["0", "88", "undefined", "null"],
      optionsEn: ["0", "88", "undefined", "null"],
      explanation: "เมื่อ scores ว่าง เงื่อนไข items.length === 0 เป็นจริง จึงส่งคืน fallback (0)",
      explanationEn: "When scores is empty, items.length === 0 is true, returning fallback (0).",
    },
    badgeReward: {
      id: "badge-ts-3",
      name: "ผู้เชี่ยวชาญ Generics TS",
      nameEn: "TS Generics Specialist",
      description: "เข้าใจ Generic <T> และ Readonly Guard ใน TypeScript",
      descriptionEn: "Mastered Generic <T> and readonly safety guards in TypeScript.",
    },
  },
  {
    id: 304,
    title: "TypeScript ด่านบอส · Utility Types และกับดัก Type Assertion (as)",
    titleEn: "TypeScript Boss · Utility Types & Type Assertion (as) Trap",
    shortName: "TS 4 · Utility & as Boss",
    shortNameEn: "TS 4 · Utility & as Boss",
    isBoss: true,
    subtitle: "ด่านบอส TypeScript: ระวังบั๊กที่ AI มักใช้ `as` บังคับชนิดข้อมูลโดยไม่ตรวจค่าจริง",
    subtitleEn: "TypeScript Boss: catch unsafe `as` type assertions that skip runtime validation",
    code: `interface Player {
  name: string;
  hp: number;
}
type PlayerPreview = Pick<Player, "name">;
const raw = { name: "Aria" } as Player;
const hpValue = typeof raw.hp === "number" ? raw.hp : 100;
console.log(raw.name + ":" + hpValue);`,
    predictPrompt:
      "เมื่อรันโค้ด TypeScript ชุดนี้ console.log จะพิมพ์ค่าใดออกมา?",
    predictPromptEn:
      "When this TypeScript code runs, what will console.log print?",
    predictOptions: ["Aria:100", "Aria:undefined", "Aria:0", "Compile Error"],
    predictOptionsEn: ["Aria:100", "Aria:undefined", "Aria:0", "Compile Error"],
    predictExplanation:
      "raw ถูกบังคับด้วย `as Player` ทั้งที่ไม่มี field `hp` อยู่จริง แต่บรรทัดที่ 7 เช็ค typeof raw.hp === 'number' ก่อน จึงได้ค่าเริ่มต้น 100 และพิมพ์ Aria:100",
    predictExplanationEn:
      "raw is cast with `as Player` even though `hp` is missing, but line 7 checks typeof raw.hp === 'number' and falls back to 100, printing Aria:100.",
    steps: [
      {
        stepNumber: 1,
        line: 5,
        codeLine: `type PlayerPreview = Pick<Player, "name">;`,
        variables: { PlayerPreview: "{ name: string }" },
        outputSoFar: [],
        explanation: "Pick<Player, 'name'> เลือกเฉพาะ property 'name' มาสร้างเป็น Type ใหม่",
        explanationEn: "Pick<Player, 'name'> creates a new type containing only the 'name' property.",
      },
      {
        stepNumber: 2,
        line: 6,
        codeLine: `const raw = { name: "Aria" } as Player;`,
        variables: { "raw.name": "Aria", "raw.hp": "undefined" },
        outputSoFar: [],
        explanation: "`as Player` แค่หลอก Compiler แต่ตอนรันจริง raw.hp ยังเป็น undefined!",
        explanationEn: "`as Player` only silences the compiler; at runtime raw.hp is still undefined!",
      },
      {
        stepNumber: 3,
        line: 7,
        codeLine: `const hpValue = typeof raw.hp === "number" ? raw.hp : 100;`,
        variables: { hpValue: "100" },
        outputSoFar: [],
        explanation: "ใช้ Runtime Guard ตรวจว่า raw.hp เป็น number หรือไม่ เมื่อไม่ใช่จึงใช้ค่าปลอดภัย 100",
        explanationEn: "Runtime guard checks typeof raw.hp === 'number'; since it's not, fallback to 100.",
      },
      {
        stepNumber: 4,
        line: 8,
        codeLine: `console.log(raw.name + ":" + hpValue);`,
        variables: { output: "Aria:100" },
        outputSoFar: ["Aria:100"],
        explanation: "พิมพ์ค่า Aria:100 ออกทางหน้าจอ",
        explanationEn: "Print Aria:100 to the console.",
      },
    ],
    questions: [
      {
        id: "ts4-q1",
        cellId: "T2",
        targetLine: 6,
        question: "เหตุใดการใช้ `as Player` กับข้อมูลที่ขาด field จึงเป็นจุดอันตรายในโค้ดจาก AI?",
        questionEn: "Why is using `as Player` on incomplete data dangerous in AI-generated code?",
        options: [
          { id: "a", text: "เพราะ TypeScript จะเชื่อตาม `as` โดยไม่ตรวจตอนรันจริง ทำให้ field ที่หายไปกลายเป็น undefined", textEn: "TypeScript trusts `as` without runtime checks, leaving missing fields as undefined" },
          { id: "b", text: "เพราะ `as` จะเติมค่า 0 ให้ทุก field อัตโนมัติ", textEn: "Because `as` automatically fills missing fields with 0" },
          { id: "c", text: "เพราะ `as` ใช้ได้เฉพาะกับตัวเลขเท่านั้น", textEn: "Because `as` only works on numbers" },
          { id: "d", text: "เพราะ `as` ทำให้โค้ดรันช้าลง 5 เท่า", textEn: "Because `as` slows execution down by 5x" },
        ],
        correctOptionId: "a",
        hint: "Type Assertion (`as`) มีผลแค่ตอนตรวจ Type ก่อนคอมไพล์ หรือตอนรันจริงด้วย?",
        hintEn: "Does a Type Assertion (`as`) exist at runtime, or only during compile-time type checking?",
        explanation:
          "TypeScript ถูกลบ Type ทิ้งตอนคอมไพล์เป็น JS ดังนั้น `as` ไม่ได้เพิ่มค่าให้ตอนรันจริง จึงต้องมี Runtime Check เสมอ",
        explanationEn:
          "TypeScript types are erased when compiled to JS, so `as` adds no runtime safety—always validate at runtime.",
      },
      {
        id: "ts4-q2",
        cellId: "F4",
        targetLine: 5,
        question: "Utility Type `Pick<Player, \"name\">` ทำหน้าที่อะไร?",
        questionEn: 'What does the utility type `Pick<Player, "name">` do?',
        options: [
          { id: "a", text: "สร้าง Type ใหม่ที่คัดมาเฉพาะ property 'name' จาก Player", textEn: "Creates a new type with only the 'name' property from Player" },
          { id: "b", text: "ลบ property 'name' ออกจาก Player", textEn: "Removes the 'name' property from Player" },
          { id: "c", text: "แปลงทุก property ใน Player ให้เป็น boolean", textEn: "Converts every property in Player to boolean" },
          { id: "d", text: "ดึงค่าข้อมูลจากฐานข้อมูลอัตโนมัติ", textEn: "Automatically queries the database" },
        ],
        correctOptionId: "a",
        hint: "คำว่า Pick แปลว่า 'เลือกหยิบมาเฉพาะส่วนที่ระบุ'",
        hintEn: "Pick literally selects a subset of properties from an existing type.",
        explanation:
          "Pick<T, K> ใช้เลือกเฉพาะคีย์ K จาก Type T ช่วยลดการเขียน Interface ซ้ำซ้อน",
        explanationEn:
          "Pick<T, K> constructs a type by picking specific keys K from T, avoiding duplicate interfaces.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเพิ่ม hp: 85 เข้าไปในออบเจ็กต์ raw บรรทัดที่ 6 (`{ name: \"Aria\", hp: 85 } as Player`) แล้วสังเกตผลลัพธ์",
      instructionEn:
        'Add hp: 85 to raw on line 6 (`{ name: "Aria", hp: 85 } as Player`) and predict the output!',
      suggestedCode: `interface Player {
  name: string;
  hp: number;
}
type PlayerPreview = Pick<Player, "name">;
const raw = { name: "Aria", hp: 85 } as Player;
const hpValue = typeof raw.hp === "number" ? raw.hp : 100;
console.log(raw.name + ":" + hpValue);`,
      changeDescription: "เติม hp: 85 ในออบเจ็กต์ raw",
      changeDescriptionEn: "Add hp: 85 to the raw object",
      options: ["Aria:85", "Aria:100", "Aria:undefined", "85"],
      optionsEn: ["Aria:85", "Aria:100", "Aria:undefined", "85"],
      explanation: "เมื่อ raw มี hp: 85 จริง เงื่อนไข typeof raw.hp === 'number' จึงเป็นจริงและใช้ค่า 85",
      explanationEn: "With hp: 85 present, typeof raw.hp === 'number' is true, outputting Aria:85.",
    },
    badgeReward: {
      id: "badge-ts-boss",
      name: "ผู้พิชิตวิหาร TypeScript",
      nameEn: "TypeScript Temple Conqueror",
      description: "เชี่ยวชาญ Interface, Union Narrowing, Generic <T> และ Utility Types",
      descriptionEn: "Mastered Interfaces, Union Narrowing, Generics <T>, and Utility Types.",
    },
  },
];

// ============================================================================
// เควสต์ PRIMM เฉพาะสำหรับภาษา C++ (IDs 401..403)
// ============================================================================
export const CPP_TOPICS: TopicQuest[] = [
  {
    id: 401,
    title: "C++ ด่านที่ 1 · ชนิดตัวแปรและกับดักการหารจำนวนเต็ม",
    titleEn: "C++ Floor 1 · Data Types & Integer Division Trap",
    shortName: "C++ 1 · int Division",
    shortNameEn: "C++ 1 · int Division",
    subtitle: "ระวังจุดที่ AI และมือใหม่พลาดบ่อยใน C++: int / int จะตัดเศษทิ้งทันที!",
    subtitleEn: "Watch out for a classic C++ trap: int / int truncates decimals immediately!",
    code: `#include <iostream>
using namespace std;

int main() {
    int total = 7;
    int count = 2;
    int avg = total / count;
    cout << avg << endl;
    return 0;
}`,
    predictPrompt:
      "ในภาษา C++ เมื่อ total = 7 และ count = 2 เป็น int ทั้งคู่ คำสั่ง cout << avg จะพิมพ์ค่าใด?",
    predictPromptEn:
      "In C++, when total = 7 and count = 2 are both int, what will cout << avg print?",
    predictOptions: ["3", "3.5", "4", "0"],
    predictOptionsEn: ["3", "3.5", "4", "0"],
    predictExplanation:
      "ใน C++ เมื่อ int หารด้วย int จะเกิด Integer Division (ตัดทศนิยมทิ้ง) 7 / 2 จึงได้ 3 ไม่ใช่ 3.5",
    predictExplanationEn:
      "Dividing two ints in C++ performs Integer Division (truncating decimals), so 7 / 2 evaluates to 3, not 3.5.",
    steps: [
      {
        stepNumber: 1,
        line: 5,
        codeLine: "int total = 7;",
        variables: { total: "7 (int)" },
        outputSoFar: [],
        explanation: "ประกาศตัวแปร total ชนิดจำนวนเต็ม (int) เก็บค่า 7",
        explanationEn: "Declare integer variable total = 7.",
      },
      {
        stepNumber: 2,
        line: 6,
        codeLine: "int count = 2;",
        variables: { total: "7 (int)", count: "2 (int)" },
        outputSoFar: [],
        explanation: "ประกาศตัวแปร count ชนิดจำนวนเต็ม (int) เก็บค่า 2",
        explanationEn: "Declare integer variable count = 2.",
      },
      {
        stepNumber: 3,
        line: 7,
        codeLine: "int avg = total / count;",
        variables: { total: "7", count: "2", avg: "3 (int)" },
        outputSoFar: [],
        explanation:
          "7 / 2 ในชนิด int จะตัดทศนิยม .5 ทิ้งทันที เหลือเพียง 3 เก็บลงใน avg",
        explanationEn:
          "Integer division 7 / 2 truncates .5, storing 3 in avg.",
      },
      {
        stepNumber: 4,
        line: 8,
        codeLine: "cout << avg << endl;",
        variables: { avg: "3" },
        outputSoFar: ["3"],
        explanation: "พิมพ์ค่า avg คือ 3 ออกทางหน้าจอมาตรฐานด้วย cout",
        explanationEn: "Print avg (3) to standard output using cout.",
      },
    ],
    questions: [
      {
        id: "cpp1-q1",
        cellId: "E1",
        targetLine: 7,
        question: "เหตุใดผลลัพธ์ของ 7 / 2 ในโค้ด C++ ข้างต้นจึงได้ 3 แทนที่จะเป็น 3.5?",
        questionEn: "Why does 7 / 2 evaluate to 3 instead of 3.5 in this C++ code?",
        options: [
          {
            id: "a",
            text: "เพราะทั้ง total และ count เป็นชนิด int การหารจึงตัดเศษทศนิยมทิ้ง",
            textEn: "Because both total and count are int, so division truncates the fractional part",
          },
          { id: "b", text: "เพราะ C++ ไม่รองรับเลขทศนิยม", textEn: "Because C++ does not support decimals" },
          { id: "c", text: "เพราะคำสั่ง cout ปัดเศษลงเสมอ", textEn: "Because cout always rounds down" },
          { id: "d", text: "เพราะตัวแปร count มีค่าเป็น 0", textEn: "Because count is 0" },
        ],
        correctOptionId: "a",
        hint: "ดูชนิดข้อมูลหน้าชื่อตัวแปร total, count และ avg",
        hintEn: "Check the types declared on lines 5–7 (int).",
        explanation:
          "ใน C++ ตัวดำเนินการ / เมื่อกระทำกับ int ทั้งสองฝั่งจะเป็นการหารปัดเศษทิ้งเสมอ ต้องแปลงเป็น double อย่างน้อยหนึ่งฝั่งจึงจะได้ทศนิยม",
        explanationEn:
          "When both operands of / are int in C++, integer division occurs; cast at least one operand to double for decimals.",
      },
      {
        id: "cpp1-q2",
        cellId: "T1",
        targetLine: 8,
        question: "คำสั่ง cout << avg << endl; ใน C++ ทำหน้าที่เทียบเท่ากับคำสั่งใด?",
        questionEn: "What does `cout << avg << endl;` do in C++?",
        options: [
          { id: "a", text: "แสดงค่า avg ออกหน้าจอแล้วขึ้นบรรทัดใหม่", textEn: "Prints avg to the console followed by a newline" },
          { id: "b", text: "รับค่าจากคีย์บอร์ดเก็บลงใน avg", textEn: "Reads keyboard input into avg" },
          { id: "c", text: "ประกาศตัวแปร avg ใหม่", textEn: "Declares a new avg variable" },
          { id: "d", text: "ปิดโปรแกรมทันทีโดยไม่พิมพ์อะไร", textEn: "Exits immediately without printing" },
        ],
        correctOptionId: "a",
        hint: "cout ย่อมาจาก Character Output และ endl ย่อมาจาก End Line",
        hintEn: "cout = Character Output, endl = End Line.",
        explanation: "cout << ... ใช้แสดงผลออกหน้าจอ และ endl ใช้ขึ้นบรรทัดใหม่",
        explanationEn: "cout << ... prints output and endl inserts a newline.",
      },
    ],
    modifyChallenge: {
      instruction:
        "แก้บรรทัดที่ 7 เป็น double avg = (double)total / count; เพื่อให้แสดงค่าทศนิยม 3.5 อย่างถูกต้อง",
      instructionEn:
        "Change line 7 to `double avg = (double)total / count;` and predict the new output!",
      suggestedCode: `#include <iostream>
using namespace std;

int main() {
    int total = 7;
    int count = 2;
    double avg = (double)total / count;
    cout << avg << endl;
    return 0;
}`,
      changeDescription: "ใช้ชนิด double และแปลง (double)total ก่อนหาร",
      changeDescriptionEn: "Use double and cast (double)total before dividing",
      options: ["3.5", "3", "4", "7"],
      optionsEn: ["3.5", "3", "4", "7"],
      explanation: "เมื่อแปลง total เป็น double แล้วหารด้วย 2 จะได้ทศนิยม 3.5",
      explanationEn: "Casting total to double yields floating-point division: 3.5.",
    },
    badgeReward: {
      id: "badge-cpp-1",
      name: "ช่างตีเหล็ก C++",
      nameEn: "C++ Ironworker",
      description: "รู้ทันกับดักการหารจำนวนเต็มและโครงสร้างหลักของ C++",
      descriptionEn: "Avoided the C++ integer division trap and mastered basic C++ structure.",
    },
  },
  {
    id: 402,
    title: "C++ ด่านที่ 2 · Pass-by-Reference (&) ในฟังก์ชัน",
    titleEn: "C++ Floor 2 · Pass-by-Reference (&) in Functions",
    shortName: "C++ 2 · Reference (&)",
    shortNameEn: "C++ 2 · Reference (&)",
    subtitle: "แกะรอยเครื่องหมาย & ที่ทำให้ฟังก์ชันแก้ไขตัวแปรต้นฉบับได้จริง",
    subtitleEn: "Trace how & lets a function mutate the caller's original variable",
    code: `#include <iostream>
using namespace std;

void addBonus(int& hp, int bonus) {
    hp = hp + bonus;
}

int main() {
    int hp = 50;
    addBonus(hp, 25);
    cout << hp << endl;
    return 0;
}`,
    predictPrompt:
      "เมื่อรันโปรแกรม C++ ชุดนี้ ค่า hp ที่พิมพ์ออกมาจาก cout << hp คือเท่าไร?",
    predictPromptEn:
      "When this C++ program runs, what value will cout << hp print?",
    predictOptions: ["75", "50", "25", "0"],
    predictOptionsEn: ["75", "50", "25", "0"],
    predictExplanation:
      "พารามิเตอร์ int& hp เป็น Reference (อ้างอิงตัวแปรต้นฉบับใน main) ดังนั้น hp = hp + 25 จึงเปลี่ยน hp จาก 50 เป็น 75 จริง",
    predictExplanationEn:
      "int& hp is a reference to main's hp, so hp = hp + 25 updates main's hp from 50 to 75.",
    steps: [
      {
        stepNumber: 1,
        line: 9,
        codeLine: "int hp = 50;",
        variables: { "main::hp": "50" },
        outputSoFar: [],
        explanation: "ในฟังก์ชัน main สร้างตัวแปร hp เริ่มต้นที่ 50",
        explanationEn: "In main, initialize hp = 50.",
      },
      {
        stepNumber: 2,
        line: 10,
        codeLine: "addBonus(hp, 25);",
        variables: { "main::hp": "50", "hp (ref)": "-> main::hp", bonus: "25" },
        outputSoFar: [],
        explanation:
          "เรียก addBonus โดยพารามิเตอร์แรกมี & (Reference) จึงชี้ไปยังกล่องหน่วยความจำเดียวกับ main::hp",
        explanationEn:
          "Call addBonus: int& hp binds directly to main::hp's memory location.",
      },
      {
        stepNumber: 3,
        line: 5,
        codeLine: "hp = hp + bonus;",
        variables: { "main::hp": "75" },
        outputSoFar: [],
        explanation: "บวกเพิ่ม 25 ลงไปใน main::hp โดยตรง ทำให้ hp กลายเป็น 75",
        explanationEn: "Add 25 directly to main::hp, updating it to 75.",
      },
      {
        stepNumber: 4,
        line: 11,
        codeLine: "cout << hp << endl;",
        variables: { "main::hp": "75" },
        outputSoFar: ["75"],
        explanation: "พิมพ์ค่า hp ที่ถูกอัปเดตแล้วคือ 75",
        explanationEn: "Print the updated hp (75).",
      },
    ],
    questions: [
      {
        id: "cpp2-q1",
        cellId: "T3",
        targetLine: 4,
        question: "เครื่องหมาย & ใน int& hp มีผลต่อการส่งค่าเข้าฟังก์ชันอย่างไร?",
        questionEn: "How does `&` in `int& hp` affect parameter passing?",
        options: [
          {
            id: "a",
            text: "ส่งแบบ Reference ทำให้การแก้ไข hp ในฟังก์ชันส่งผลต่อตัวแปรต้นฉบับใน main ด้วย",
            textEn: "Passes by reference so modifying hp inside the function updates main's original variable",
          },
          { id: "b", text: "คัดลอกเฉพาะค่าตัวเลขไปใช้โดยไม่กระทบต้นฉบับ", textEn: "Copies only the numeric value without affecting the original" },
          { id: "c", text: "แปลงตัวเลขให้เป็นค่าติดลบ", textEn: "Negates the number" },
          { id: "d", text: "ทำให้ฟังก์ชันคืนค่าเป็นข้อความ", textEn: "Makes the function return a string" },
        ],
        correctOptionId: "a",
        hint: "เปรียบเทียบ int& hp (อ้างอิงกล่องเดิม) กับ int hp (ก๊อปปี้ค่าใหม่)",
        hintEn: "Compare int& hp (alias to the same variable) vs int hp (copy).",
        explanation:
          "Pass-by-Reference (int&) ทำให้ตัวแปรในฟังก์ชันอ้างถึงหน่วยความจำเดียวกับตัวแปรที่ส่งเข้ามา",
        explanationEn:
          "Pass-by-Reference (int&) binds the parameter to the caller's exact memory address.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองลบ & ในบรรทัดที่ 4 จาก int& hp เป็น int hp (Pass-by-Value) เพื่อดูว่าค่า hp ใน main จะยังเป็น 50",
      instructionEn:
        "Remove `&` on line 4 (`int hp` instead of `int& hp`) and predict what main prints!",
      suggestedCode: `#include <iostream>
using namespace std;

void addBonus(int hp, int bonus) {
    hp = hp + bonus;
}

int main() {
    int hp = 50;
    addBonus(hp, 25);
    cout << hp << endl;
    return 0;
}`,
      changeDescription: "เปลี่ยน int& hp เป็น int hp (Pass-by-Value)",
      changeDescriptionEn: "Change int& hp to int hp (Pass-by-Value)",
      options: ["50", "75", "25", "100"],
      optionsEn: ["50", "75", "25", "100"],
      explanation:
        "เมื่อไม่มี & จะเป็นการคัดลอกค่าไปแก้ไขในตัวแปรชั่วคราว ค่า hp ใน main จึงยังคงเป็น 50",
      explanationEn:
        "Without &, only a local copy is modified, so main's hp stays 50.",
    },
    badgeReward: {
      id: "badge-cpp-2",
      name: "จอมเวท Reference C++",
      nameEn: "C++ Reference Mage",
      description: "แยกแยะ Pass-by-Value และ Pass-by-Reference (&) ใน C++ ได้แม่นยำ",
      descriptionEn: "Distinguish Pass-by-Value from Pass-by-Reference (&) in C++.",
    },
  },
  {
    id: 403,
    title: "C++ ด่านที่ 3 · std::vector และขอบเขตลูป",
    titleEn: "C++ Floor 3 · std::vector & Loop Bounds",
    shortName: "C++ 3 · Vector & Loop",
    shortNameEn: "C++ 3 · Vector & Loop",
    subtitle: "แกะรอยการไล่ index ใน std::vector<int> และขอบเขตของลูป",
    subtitleEn: "Trace indexing through std::vector<int> and loop boundary safety",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {10, 20, 30};
    int sum = 0;
    for (int i = 0; i < nums.size(); i++) {
        sum += nums[i];
    }
    cout << sum << endl;
    return 0;
}`,
    predictPrompt:
      "เมื่อลูปวนจนครบทุกสมาชิกของ vector<int> nums ค่า sum ที่พิมพ์ออกมาคือเท่าไร?",
    predictPromptEn:
      "After looping through all elements of vector<int> nums, what will sum print?",
    predictOptions: ["60", "30", "50", "10"],
    predictOptionsEn: ["60", "30", "50", "10"],
    predictExplanation:
      "ลูปวน i = 0, 1, 2 บวก 10 + 20 + 30 ได้ 60",
    predictExplanationEn:
      "The loop runs for i = 0, 1, 2, summing 10 + 20 + 30 = 60.",
    steps: [
      {
        stepNumber: 1,
        line: 6,
        codeLine: "vector<int> nums = {10, 20, 30};",
        variables: { nums: "{10, 20, 30}", "nums.size()": "3" },
        outputSoFar: [],
        explanation: "สร้าง vector เก็บจำนวนเต็ม 3 ตัว (index 0, 1, 2)",
        explanationEn: "Create a vector of 3 integers (indices 0, 1, 2).",
      },
      {
        stepNumber: 2,
        line: 8,
        codeLine: "for (int i = 0; i < nums.size(); i++)",
        variables: { i: "0", sum: "10" },
        outputSoFar: [],
        explanation: "รอบ i = 0: บวก nums[0] (10) เข้า sum",
        explanationEn: "i = 0: add nums[0] (10) to sum.",
      },
      {
        stepNumber: 3,
        line: 9,
        codeLine: "sum += nums[i]; // i = 1, 2",
        variables: { i: "2", sum: "60" },
        outputSoFar: [],
        explanation: "รอบ i = 1 (+20 -> 30) และ i = 2 (+30 -> 60) แล้วหยุดเมื่อ i == 3",
        explanationEn: "i = 1 (+20 -> 30) and i = 2 (+30 -> 60), then stop when i == 3.",
      },
      {
        stepNumber: 4,
        line: 11,
        codeLine: "cout << sum << endl;",
        variables: { sum: "60" },
        outputSoFar: ["60"],
        explanation: "พิมพ์ผลรวม 60 ออกทางหน้าจอ",
        explanationEn: "Print sum (60).",
      },
    ],
    questions: [
      {
        id: "cpp3-q1",
        cellId: "F4",
        targetLine: 8,
        question: "หาก AI เขียนเงื่อนไขผิดเป็น i <= nums.size() จะเกิดความเสี่ยงอะไรใน C++?",
        questionEn: "If an AI mistakenly writes `i <= nums.size()`, what risk does C++ face?",
        options: [
          {
            id: "a",
            text: "เข้าถึงหน่วยความจำเกินขอบเขต (Out-of-Bounds / Undefined Behavior) ที่ nums[3]",
            textEn: "Out-of-Bounds memory access (Undefined Behavior) at nums[3]",
          },
          { id: "b", text: "โปรแกรมจะเติมเลข 0 ให้โดยอัตโนมัติ", textEn: "C++ automatically returns 0 safely" },
          { id: "c", text: "ลูปจะข้าม index 0 ไปเริ่มที่ 1", textEn: "The loop skips index 0 and starts at 1" },
          { id: "d", text: "ไม่มีผลเสียใดๆ", textEn: "No downside at all" },
        ],
        correctOptionId: "a",
        hint: "nums มีขนาด 3 ตัว จึงมีเฉพาะ index 0, 1, 2 เท่านั้น",
        hintEn: "A 3-element vector only has valid indices 0, 1, and 2.",
        explanation:
          "ใน C++ การอ่านเกินขนาด vector ด้วย [] ไม่มีตัวป้องกันอัตโนมัติและอาจอ่านค่าขยะหรือทำให้โปรแกรมแครชได้",
        explanationEn:
          "C++ `[]` does no bounds checking; reading nums[3] causes Undefined Behavior or crashes.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองแก้จุดเริ่มต้นลูปบรรทัดที่ 8 จาก int i = 0 เป็น int i = 1 เพื่อดูผลรวมเมื่อข้ามสมาชิกตัวแรก (จะได้ 50)",
      instructionEn:
        "Change `int i = 0` on line 8 to `int i = 1` and predict the new sum!",
      suggestedCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> nums = {10, 20, 30};
    int sum = 0;
    for (int i = 1; i < nums.size(); i++) {
        sum += nums[i];
    }
    cout << sum << endl;
    return 0;
}`,
      changeDescription: "เปลี่ยนค่าเริ่มต้น i จาก 0 เป็น 1",
      changeDescriptionEn: "Change loop start from i = 0 to i = 1",
      options: ["50", "60", "40", "30"],
      optionsEn: ["50", "60", "40", "30"],
      explanation: "เมื่อเริ่มที่ i = 1 จะบวกเฉพาะ nums[1] (20) + nums[2] (30) = 50",
      explanationEn: "Starting at i = 1 sums only nums[1] (20) + nums[2] (30) = 50.",
    },
    badgeReward: {
      id: "badge-cpp-3",
      name: "ผู้คุมลูป std::vector",
      nameEn: "std::vector Loop Keeper",
      description: "เข้าใจการวนลูป std::vector และขอบเขต Index ใน C++",
      descriptionEn: "Mastered std::vector iteration and index bounds in C++.",
    },
  },
  {
    id: 404,
    title: "C++ ด่านบอส · เงื่อนไขซ้อนลูปและกับดัก Index เกินขอบเขตจาก AI",
    titleEn: "C++ Boss · Nested Conditions & Out-of-Bounds Trap",
    shortName: "C++ 4 · Bounds Guard Boss",
    shortNameEn: "C++ 4 · Bounds Guard Boss",
    isBoss: true,
    subtitle: "ด่านบอส C++: ตรวจสอบขอบเขต Index และเงื่อนไขการกรองค่าสูงสุดใน vector",
    subtitleEn: "C++ Boss: verify index bounds and max-value tracking inside a vector",
    code: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> dmg = {12, 45, 30, 18};
    int maxDmg = dmg[0];
    for (int i = 1; i < dmg.size(); i++) {
        if (dmg[i] > maxDmg) {
            maxDmg = dmg[i];
        }
    }
    cout << maxDmg << endl;
    return 0;
}`,
    predictPrompt:
      "เมื่อรันโค้ด C++ ด่านบอสนี้ ค่า maxDmg ที่พิมพ์ออกมาคือเท่าไร?",
    predictPromptEn:
      "When this C++ Boss code runs, what value will maxDmg print?",
    predictOptions: ["45", "30", "18", "12"],
    predictOptionsEn: ["45", "30", "18", "12"],
    predictExplanation:
      "เริ่มต้น maxDmg = 12 จากนั้นเทียบ 45 (>12 อัปเดตเป็น 45), 30 (>45 เท็จ), 18 (>45 เท็จ) จึงได้ค่าสูงสุด 45",
    predictExplanationEn:
      "maxDmg starts at 12, updates to 45 on i = 1, and skips 30 and 18, printing 45.",
    steps: [
      {
        stepNumber: 1,
        line: 7,
        codeLine: "int maxDmg = dmg[0];",
        variables: { maxDmg: "12" },
        outputSoFar: [],
        explanation: "ตั้งค่าเริ่มต้นของค่าสูงสุดจากสมาชิกตัวแรก dmg[0] = 12",
        explanationEn: "Initialize maxDmg to the first element dmg[0] = 12.",
      },
      {
        stepNumber: 2,
        line: 9,
        codeLine: "if (dmg[i] > maxDmg) { maxDmg = dmg[i]; } // i = 1",
        variables: { i: "1", "dmg[1]": "45", maxDmg: "45" },
        outputSoFar: [],
        explanation: "รอบ i = 1: dmg[1] คือ 45 > 12 จึงอัปเดต maxDmg = 45",
        explanationEn: "i = 1: dmg[1] (45) > 12, so update maxDmg = 45.",
      },
      {
        stepNumber: 3,
        line: 8,
        codeLine: "for (int i = 1; i < dmg.size(); i++) // i = 2, 3",
        variables: { i: "3", maxDmg: "45" },
        outputSoFar: [],
        explanation: "รอบ i = 2 (30) และ i = 3 (18) น้อยกว่า 45 ทั้งคู่จึงไม่อัปเดต แล้วจบลูปก่อนถึง 4",
        explanationEn: "i = 2 (30) and i = 3 (18) are both <= 45, so maxDmg stays 45 until the loop exits.",
      },
      {
        stepNumber: 4,
        line: 13,
        codeLine: "cout << maxDmg << endl;",
        variables: { output: "45" },
        outputSoFar: ["45"],
        explanation: "พิมพ์ค่า maxDmg สูงสุดคือ 45",
        explanationEn: "Print the maximum damage: 45.",
      },
    ],
    questions: [
      {
        id: "cpp4-q1",
        cellId: "T2",
        targetLine: 8,
        question: "หาก AI เขียนเงื่อนไขลูปผิดเป็น `i <= dmg.size()` จะเกิดปัญหาใดใน C++?",
        questionEn: "If an AI writes `i <= dmg.size()`, what bug occurs in C++?",
        options: [
          { id: "a", text: "เกิดการอ่านเกินขอบเขต (Out-of-Bounds) ที่ index 4 ซึ่งเป็น Undefined Behavior", textEn: "Out-of-Bounds read at index 4, causing Undefined Behavior" },
          { id: "b", text: "C++ จะคืนค่า 0 ให้อัตโนมัติอย่างปลอดภัยเสมอ", textEn: "C++ safely returns 0 automatically" },
          { id: "c", text: "ลูปจะข้ามสมาชิกตัวแรกไป", textEn: "The loop skips the first element" },
          { id: "d", text: "โปรแกรมจะเรียงเลขใน vector จากมากไปน้อย", textEn: "The program sorts the vector descending" },
        ],
        correctOptionId: "a",
        hint: "vector ที่มี 4 ตัว มี index ที่ใช้ได้คือ 0 ถึง 3 เท่านั้น",
        hintEn: "A 4-element vector only has valid indices 0 through 3.",
        explanation:
          "ใน C++ การใช้ <= size() จะทำให้รอบสุดท้ายเข้าถึง dmg[4] ซึ่งเกินขนาดจริงและเสี่ยงแครชหรืออ่านค่าขยะ",
        explanationEn:
          "Using <= size() accesses dmg[4] on the final step, which is out of bounds.",
      },
      {
        id: "cpp4-q2",
        cellId: "F4",
        targetLine: 7,
        question: "ทำไมการตั้ง `int maxDmg = dmg[0];` จึงดีกว่าตั้ง `int maxDmg = 0;` หากข้อมูลอาจเป็นเลขติดลบทั้งหมด?",
        questionEn: "Why is `int maxDmg = dmg[0];` safer than `int maxDmg = 0;` if all values could be negative?",
        options: [
          { id: "a", text: "เพราะถ้าตั้งเป็น 0 แล้วทุกค่าใน vector ติดลบ คำตอบที่ได้จะเป็น 0 ซึ่งไม่มีอยู่ในข้อมูลจริง", textEn: "If initialized to 0 when all elements are negative, it wrongly returns 0 instead of the true max" },
          { id: "b", text: "เพราะ C++ ไม่อนุญาตให้ตั้งค่า int เป็น 0", textEn: "Because C++ forbids initializing int to 0" },
          { id: "c", text: "เพราะ dmg[0] ทำให้ลูปไม่ต้องเช็ค if", textEn: "Because dmg[0] removes the need for an if check" },
          { id: "d", text: "เพราะ 0 มีขนาดหน่วยความจำใหญ่กว่า dmg[0]", textEn: "Because 0 uses more memory than dmg[0]" },
        ],
        correctOptionId: "a",
        hint: "ลองสมมติว่า dmg = {-5, -10, -2} แล้วตั้ง maxDmg = 0 ดูว่าผลลัพธ์จะผิดเพี้ยนอย่างไร",
        hintEn: "Suppose dmg = {-5, -10, -2}: starting maxDmg at 0 would falsely output 0.",
        explanation:
          "การเริ่มต้นด้วยสมาชิกตัวแรกของข้อมูลจริงช่วยให้หาค่าสูงสุดได้ถูกต้องแม้ข้อมูลจะเป็นค่าลบทั้งหมด",
        explanationEn:
          "Starting from dmg[0] guarantees the baseline comes from actual data even for all-negative inputs.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเพิ่มค่า 60 เข้าไปใน vector บรรทัดที่ 6 (`{12, 45, 30, 60}`) เพื่อทดสอบการอัปเดตค่าสูงสุดตัวสุดท้าย",
      instructionEn:
        "Change the vector on line 6 to `{12, 45, 30, 60}` and predict the new maxDmg!",
      suggestedCode: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> dmg = {12, 45, 30, 60};
    int maxDmg = dmg[0];
    for (int i = 1; i < dmg.size(); i++) {
        if (dmg[i] > maxDmg) {
            maxDmg = dmg[i];
        }
    }
    cout << maxDmg << endl;
    return 0;
}`,
      changeDescription: "เปลี่ยนสมาชิกตัวสุดท้ายเป็น 60",
      changeDescriptionEn: "Change the last element to 60",
      options: ["60", "45", "30", "12"],
      optionsEn: ["60", "45", "30", "12"],
      explanation: "รอบสุดท้าย i = 3 จะพบ dmg[3] = 60 > 45 จึงอัปเดต maxDmg เป็น 60",
      explanationEn: "On the final iteration i = 3, 60 > 45 updates maxDmg to 60.",
    },
    badgeReward: {
      id: "badge-cpp-boss",
      name: "ผู้พิชิตป้อมปราการ C++",
      nameEn: "C++ Fortress Conqueror",
      description: "เชี่ยวชาญชนิดตัวแปร, Reference (&), std::vector และการป้องกัน Out-of-Bounds",
      descriptionEn: "Mastered C++ types, References (&), std::vector, and bounds safety.",
    },
  },
];

// ============================================================================
// เควสต์ PRIMM เฉพาะสำหรับภาษา Java (IDs 501..503)
// ============================================================================
export const JAVA_TOPICS: TopicQuest[] = [
  {
    id: 501,
    title: "Java ด่านที่ 1 · คลาส Main ชนิดข้อมูลและ System.out.println",
    titleEn: "Java Stage 1 · Main Class, Data Types & System.out.println",
    shortName: "Java 1 · Types & Print",
    shortNameEn: "Java 1 · Types & Print",
    subtitle: "อ่านโครงสร้าง public class และเมธอด main ที่เป็นจุดเริ่มต้นของทุกโปรแกรม Java",
    subtitleEn: "Read the public class structure and main method that starts every Java program",
    code: `public class Main {
    public static void main(String[] args) {
        int price = 120;
        int qty = 3;
        int tax = 20;
        int total = (price * qty) + tax;
        System.out.println(total);
    }
}`,
    predictPrompt:
      "เมื่อรันโปรแกรม Java ชุดนี้ System.out.println(total) จะพิมพ์ตัวเลขใด?",
    predictPromptEn:
      "When this Java program runs, what number will System.out.println(total) print?",
    predictOptions: ["380", "360", "340", "140"],
    predictOptionsEn: ["380", "360", "340", "140"],
    predictExplanation:
      "คำนวณในวงเล็บ (120 * 3) = 360 แล้วบวก tax (20) ได้ 380",
    predictExplanationEn:
      "Compute inside parentheses (120 * 3) = 360, then add tax (20) to get 380.",
    steps: [
      {
        stepNumber: 1,
        line: 2,
        codeLine: "public static void main(String[] args)",
        variables: { entryPoint: "main" },
        outputSoFar: [],
        explanation: "Java เริ่มทำงานจากเมธอด main ภายในคลาส Main เสมอ",
        explanationEn: "Java always starts execution from the main method inside class Main.",
      },
      {
        stepNumber: 2,
        line: 5,
        codeLine: "int price = 120; int qty = 3; int tax = 20;",
        variables: { price: "120", qty: "3", tax: "20" },
        outputSoFar: [],
        explanation: "ประกาศตัวแปรชนิดจำนวนเต็ม int ทั้ง 3 ตัว",
        explanationEn: "Declare all three integer (int) variables.",
      },
      {
        stepNumber: 3,
        line: 6,
        codeLine: "int total = (price * qty) + tax;",
        variables: { price: "120", qty: "3", tax: "20", total: "380" },
        outputSoFar: [],
        explanation: "คำนวณ 120 * 3 = 360 บวก 20 ได้ total = 380",
        explanationEn: "Calculate 120 * 3 = 360, plus 20 gives total = 380.",
      },
      {
        stepNumber: 4,
        line: 7,
        codeLine: "System.out.println(total);",
        variables: { total: "380" },
        outputSoFar: ["380"],
        explanation: "แสดงค่า 380 ออกทางคอนโซล",
        explanationEn: "Print 380 to the console.",
      },
    ],
    questions: [
      {
        id: "java1-q1",
        cellId: "T1",
        targetLine: 2,
        question: "ในภาษา Java โปรแกรมจะเริ่มต้นทำงานที่จุดใดเสมอ?",
        questionEn: "In Java, where does program execution always begin?",
        options: [
          {
            id: "a",
            text: "เมธอด public static void main(String[] args)",
            textEn: "The public static void main(String[] args) method",
          },
          {
            id: "b",
            text: "บรรทัดแรกนอกคลาสเหมือน Python",
            textEn: "The first line outside any class, like Python",
          },
          {
            id: "c",
            text: "คำสั่ง System.out.println",
            textEn: "The System.out.println statement",
          },
          { id: "d", text: "ไฟล์ CSS", textEn: "A CSS file" },
        ],
        correctOptionId: "a",
        hint: "ดูชื่อเมธอดในบรรทัดที่ 2",
        hintEn: "Look at the method signature on line 2.",
        explanation:
          "Java Virtual Machine (JVM) ใช้เมธอด main เป็นจุดเริ่มต้นรันโปรแกรม",
        explanationEn:
          "The Java Virtual Machine (JVM) uses the main method as the entry point.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองแก้ค่า tax ในบรรทัดที่ 5 จาก 20 เป็น 40 เพื่อให้ยอดรวมเป็น 400",
      instructionEn:
        "Change tax on line 5 from 20 to 40 so the total becomes 400, and predict the output.",
      suggestedCode: `public class Main {
    public static void main(String[] args) {
        int price = 120;
        int qty = 3;
        int tax = 40;
        int total = (price * qty) + tax;
        System.out.println(total);
    }
}`,
      changeDescription: "เปลี่ยน tax จาก 20 เป็น 40",
      changeDescriptionEn: "Change tax from 20 to 40",
      options: ["400", "380", "360", "420"],
      optionsEn: ["400", "380", "360", "420"],
      explanation: "เมื่อ tax = 40 จะได้ (120 * 3) + 40 = 400",
      explanationEn: "With tax = 40, (120 * 3) + 40 = 400.",
    },
    badgeReward: {
      id: "badge-java-1",
      name: "อัศวินฝึกหัด Java",
      nameEn: "Java Apprentice Knight",
      description: "เข้าใจโครงสร้างคลาสหลัก main() และชนิดตัวแปรใน Java",
      descriptionEn: "Understood Java Main class structure, main(), and primitive types.",
    },
  },
  {
    id: 502,
    title: "Java ด่านที่ 2 · String.equals() vs == ที่ AI มักพลาด",
    titleEn: "Java Stage 2 · String.equals() vs == (Common AI Pitfall)",
    shortName: "Java 2 · String.equals()",
    shortNameEn: "Java 2 · String.equals()",
    subtitle: "เรียนรู้ความแตกต่างระหว่างการเทียบค่าข้อความ (.equals) กับการเทียบตำแหน่งหน่วยความจำ (==)",
    subtitleEn: "Learn the difference between value comparison (.equals) and reference comparison (==)",
    code: `public class Main {
    public static void main(String[] args) {
        String role = new String("admin");
        if (role.equals("admin")) {
            System.out.println("Access Granted");
        } else {
            System.out.println("Access Denied");
        }
    }
}`,
    predictPrompt:
      "เมื่อใช้ role.equals(\"admin\") โปรแกรม Java ชุดนี้จะพิมพ์ข้อความใด?",
    predictPromptEn:
      "Using role.equals(\"admin\"), what text will this Java program print?",
    predictOptions: ["Access Granted", "Access Denied", "true", "admin"],
    predictOptionsEn: ["Access Granted", "Access Denied", "true", "admin"],
    predictExplanation:
      'role.equals("admin") เปรียบเทียบเนื้อหาข้อความทีละตัวอักษร ซึ่งตรงกับ "admin" จึงพิมพ์ Access Granted',
    predictExplanationEn:
      'role.equals("admin") compares string contents character by character, matching "admin" and printing Access Granted.',
    steps: [
      {
        stepNumber: 1,
        line: 3,
        codeLine: 'String role = new String("admin");',
        variables: { role: 'StringObject("admin")' },
        outputSoFar: [],
        explanation: 'สร้างออบเจ็กต์ String ใหม่ใน Heap ที่มีข้อความ "admin"',
        explanationEn: 'Create a new String object on the heap containing "admin".',
      },
      {
        stepNumber: 2,
        line: 4,
        codeLine: 'if (role.equals("admin"))',
        variables: { role: '"admin"', check: "true" },
        outputSoFar: [],
        explanation: "เมธอด .equals() ตรวจเนื้อหาข้อความภายใน ได้ค่า true",
        explanationEn: "The .equals() method checks the string content and returns true.",
      },
      {
        stepNumber: 3,
        line: 5,
        codeLine: 'System.out.println("Access Granted");',
        variables: { output: "Access Granted" },
        outputSoFar: ["Access Granted"],
        explanation: "เข้าบล็อก if และพิมพ์ Access Granted",
        explanationEn: "Enter the if block and print Access Granted.",
      },
    ],
    questions: [
      {
        id: "java2-q1",
        cellId: "E2",
        targetLine: 4,
        question: 'ใน Java ทำไมจึงควรใช้ role.equals("admin") แทน role == "admin"?',
        questionEn: 'In Java, why should you use role.equals("admin") instead of role == "admin"?',
        options: [
          {
            id: "a",
            text: "เพราะ == เปรียบเทียบที่อยู่หน่วยความจำ (Reference) ส่วน .equals() เปรียบเทียบเนื้อหาข้อความ",
            textEn: "== compares object references (memory addresses), while .equals() compares string content",
          },
          {
            id: "b",
            text: "เพราะ == ใช้กับ String แล้วโปรแกรมจะไม่คอมไพล์",
            textEn: "Using == on Strings fails to compile",
          },
          {
            id: "c",
            text: "เพราะ .equals() ใช้กับตัวเลข int เท่านั้น",
            textEn: ".equals() only works on int primitives",
          },
          {
            id: "d",
            text: "ทั้งสองอย่างให้ผลเหมือนกันทุกกรณี",
            textEn: "Both always produce the exact same result",
          },
        ],
        correctOptionId: "a",
        hint: "เมื่อสร้าง String ด้วย new String(...) ออบเจ็กต์จะอยู่คนละตำแหน่งในหน่วยความจำกับ literal",
        hintEn: "new String(...) creates an object at a different memory address from the string literal.",
        explanation:
          "ใน Java เครื่องหมาย == บน Object เทียบ Reference ส่วน .equals() เทียบค่าข้อความจริง",
        explanationEn:
          "In Java, == on objects compares references, whereas .equals() compares actual string values.",
      },
    ],
    modifyChallenge: {
      instruction:
        'ลองแก้บรรทัดที่ 4 จาก role.equals("admin") เป็น role == "admin" เพื่อดูกับดัก Reference Comparison (ผลลัพธ์จะเป็น Access Denied!)',
      instructionEn:
        'Change line 4 from role.equals("admin") to role == "admin" to see the reference comparison trap!',
      suggestedCode: `public class Main {
    public static void main(String[] args) {
        String role = new String("admin");
        if (role == "admin") {
            System.out.println("Access Granted");
        } else {
            System.out.println("Access Denied");
        }
    }
}`,
      changeDescription: 'เปลี่ยนจาก .equals("admin") เป็น == "admin"',
      changeDescriptionEn: 'Change .equals("admin") to == "admin"',
      options: ["Access Denied", "Access Granted", "Error", "null"],
      optionsEn: ["Access Denied", "Access Granted", "Error", "null"],
      explanation:
        'เนื่องจาก new String("admin") สร้าง Reference ใหม่ที่ไม่ตรงกับ String Pool จึงได้ false และเข้า else พิมพ์ Access Denied',
      explanationEn:
        'new String("admin") creates a new reference outside the string pool, so == is false and else prints Access Denied.',
    },
    badgeReward: {
      id: "badge-java-2",
      name: "ผู้แยกแยะ Reference Java",
      nameEn: "Java Reference Detective",
      description: "รู้ทันบั๊ก == เทียบกับ .equals() สำหรับ String ใน Java",
      descriptionEn: "Caught the == vs .equals() String comparison bug in Java.",
    },
  },
  {
    id: 503,
    title: "Java ด่านที่ 3 · OOP Class, Constructor และ Array Loop",
    titleEn: "Java Stage 3 · OOP Class, Constructor & Array Loop",
    shortName: "Java 3 · OOP & Loop",
    shortNameEn: "Java 3 · OOP & Loop",
    subtitle: "แกะรอยการติดตามสถานะ Object ผ่านเมธอด takeDamage()",
    subtitleEn: "Trace object state changes through the takeDamage() method",
    code: `class Hero {
    int hp;
    Hero(int startHp) { this.hp = startHp; }
    void takeDamage(int dmg) {
        if (dmg > this.hp) { this.hp = 0; }
        else { this.hp -= dmg; }
    }
}
public class Main {
    public static void main(String[] args) {
        Hero hero = new Hero(100);
        int[] hits = {30, 45, 50};
        for (int i = 0; i < hits.length; i++) {
            hero.takeDamage(hits[i]);
        }
        System.out.println(hero.hp);
    }
}`,
    predictPrompt:
      "เมื่อ Hero เริ่มต้นด้วย HP 100 และโดนโจมตี 30, 45, 50 ตามลำดับ ค่า hero.hp สุดท้ายคือเท่าไร?",
    predictPromptEn:
      "Starting with HP 100 and taking hits of 30, 45, and 50 in order, what is the final hero.hp?",
    predictOptions: ["0", "25", "-25", "100"],
    predictOptionsEn: ["0", "25", "-25", "100"],
    predictExplanation:
      "รอบ 1: 100 - 30 = 70, รอบ 2: 70 - 45 = 25, รอบ 3: dmg (50) > hp (25) จึงเข้าเงื่อนไขตั้งค่า hp = 0 (ไม่ติดลบ!)",
    predictExplanationEn:
      "Hit 1: 100 - 30 = 70; Hit 2: 70 - 45 = 25; Hit 3: dmg (50) > hp (25), so hp is clamped to 0.",
    steps: [
      {
        stepNumber: 1,
        line: 11,
        codeLine: "Hero hero = new Hero(100);",
        variables: { "hero.hp": "100" },
        outputSoFar: [],
        explanation: "สร้างออบเจ็กต์ hero โดยเรียก Constructor กำหนด hp = 100",
        explanationEn: "Create a hero object via the constructor, setting hp = 100.",
      },
      {
        stepNumber: 2,
        line: 14,
        codeLine: "hero.takeDamage(30); // i = 0",
        variables: { "hero.hp": "70", dmg: "30" },
        outputSoFar: [],
        explanation: "30 ไม่มากกว่า 100 จึงลบออก เหลือ 70",
        explanationEn: "30 is not greater than 100, so subtract it to leave 70.",
      },
      {
        stepNumber: 3,
        line: 14,
        codeLine: "hero.takeDamage(45); // i = 1",
        variables: { "hero.hp": "25", dmg: "45" },
        outputSoFar: [],
        explanation: "45 ไม่มากกว่า 70 จึงลบออก เหลือ 25",
        explanationEn: "45 is not greater than 70, so subtract it to leave 25.",
      },
      {
        stepNumber: 4,
        line: 5,
        codeLine: "if (dmg > this.hp) { this.hp = 0; } // i = 2, dmg = 50",
        variables: { "hero.hp": "0", dmg: "50" },
        outputSoFar: [],
        explanation: "50 > 25 เป็นจริง จึงกำหนดให้ hero.hp = 0 แทนที่จะติดลบ",
        explanationEn: "50 > 25 is true, so hero.hp is set to 0 instead of going negative.",
      },
      {
        stepNumber: 5,
        line: 16,
        codeLine: "System.out.println(hero.hp);",
        variables: { "hero.hp": "0" },
        outputSoFar: ["0"],
        explanation: "พิมพ์ค่า hero.hp คือ 0",
        explanationEn: "Print hero.hp, which is 0.",
      },
    ],
    questions: [
      {
        id: "java3-q1",
        cellId: "F3",
        targetLine: 5,
        question: "เงื่อนไข if (dmg > this.hp) { this.hp = 0; } ในเมธอด takeDamage มีจุดประสงค์ใด?",
        questionEn: "What is the purpose of `if (dmg > this.hp) { this.hp = 0; }` in takeDamage?",
        options: [
          {
            id: "a",
            text: "ป้องกันไม่ให้ค่าพลังชีวิต (hp) ลดลงต่ำกว่า 0 (ติดลบ)",
            textEn: "Prevent hp from dropping below 0 (negative)",
          },
          { id: "b", text: "เพิ่มพลังชีวิตเมื่อโดนโจมตีแรง", textEn: "Increase hp on heavy hits" },
          { id: "c", text: "หยุดลูป for ใน main ทันที", textEn: "Break the for loop in main immediately" },
          { id: "d", text: "สร้างออบเจ็กต์ Hero ตัวใหม่", textEn: "Create a new Hero object" },
        ],
        correctOptionId: "a",
        hint: "สังเกตว่าถ้าไม่เช็ค 25 - 50 จะได้ -25",
        hintEn: "Without this check, 25 - 50 would become -25.",
        explanation:
          "เป็นหลักการ Clamp / Defensive State Guard เพื่อรักษาความถูกต้องของข้อมูลภายใน Object",
        explanationEn:
          "This is a defensive state guard (clamping) to keep the object's state valid.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยนค่าเริ่มต้นของ Hero ในบรรทัดที่ 11 จาก new Hero(100) เป็น new Hero(150) เพื่อดูว่า HP ที่เหลือหลังโดนตี 3 ครั้งจะเป็น 25",
      instructionEn:
        "Change `new Hero(100)` on line 11 to `new Hero(150)` and predict the remaining HP after 3 hits.",
      suggestedCode: `class Hero {
    int hp;
    Hero(int startHp) { this.hp = startHp; }
    void takeDamage(int dmg) {
        if (dmg > this.hp) { this.hp = 0; }
        else { this.hp -= dmg; }
    }
}
public class Main {
    public static void main(String[] args) {
        Hero hero = new Hero(150);
        int[] hits = {30, 45, 50};
        for (int i = 0; i < hits.length; i++) {
            hero.takeDamage(hits[i]);
        }
        System.out.println(hero.hp);
    }
}`,
      changeDescription: "เปลี่ยน new Hero(100) เป็น new Hero(150)",
      changeDescriptionEn: "Change new Hero(100) to new Hero(150)",
      options: ["25", "0", "50", "75"],
      optionsEn: ["25", "0", "50", "75"],
      explanation: "150 - 30 = 120, 120 - 45 = 75, 75 - 50 = 25",
      explanationEn: "150 - 30 = 120, 120 - 45 = 75, 75 - 50 = 25.",
    },
    badgeReward: {
      id: "badge-java-3",
      name: "อัศวิน OOP Java",
      nameEn: "Java OOP Knight",
      description: "เข้าใจ Class, Constructor, Encapsulation และ Array Loop ใน Java",
      descriptionEn: "Mastered Java classes, constructors, encapsulation, and array loops.",
    },
  },
  {
    id: 504,
    title: "Java ด่านบอส · Null Guard และกับดัก NullPointerException จาก AI",
    titleEn: "Java Boss Stage · Null Guard & AI NullPointerException Trap",
    shortName: "Java 4 · Null Guard Boss",
    shortNameEn: "Java 4 · Null Guard Boss",
    isBoss: true,
    subtitle: "ด่านบอส Java: จับบั๊กค่า null ที่ AI มักลืมตรวจสอบก่อนเรียกใช้เมธอด",
    subtitleEn: "Java Boss Stage: Catch null bugs where AI forgets to guard before calling methods",
    code: `public class Main {
    public static void main(String[] args) {
        String title = null;
        String safeTitle = (title != null) ? title : "Guest";
        System.out.println(safeTitle);
    }
}`,
    predictPrompt:
      "เมื่อ title เป็น null โค้ด Java ด่านบอสนี้จะพิมพ์ค่าใดออกมา?",
    predictPromptEn:
      "When title is null, what will this Java boss stage code print?",
    predictOptions: ["Guest", "null", "NullPointerException", "title"],
    predictOptionsEn: ["Guest", "null", "NullPointerException", "title"],
    predictExplanation:
      "เงื่อนไข (title != null) เป็นเท็จ จึงเลือกค่าสำรอง 'Guest' ทำให้ไม่เกิด NullPointerException",
    predictExplanationEn:
      "The condition (title != null) is false, so it falls back to 'Guest' and avoids NullPointerException.",
    steps: [
      {
        stepNumber: 1,
        line: 3,
        codeLine: `String title = null;`,
        variables: { title: "null" },
        outputSoFar: [],
        explanation: "ประกาศตัวแปร String ชื่อ title ให้มีค่าเป็น null (ไม่มีออบเจ็กต์อยู่จริง)",
        explanationEn: "Declare String variable title as null (no object instance).",
      },
      {
        stepNumber: 2,
        line: 4,
        codeLine: `String safeTitle = (title != null) ? title : "Guest";`,
        variables: { title: "null", safeTitle: '"Guest"' },
        outputSoFar: [],
        explanation: "เช็ค Guard ว่า title != null หรือไม่ เมื่อเป็นเท็จจึงใช้ค่า 'Guest'",
        explanationEn: "Guard checks if title != null; since it is false, use 'Guest'.",
      },
      {
        stepNumber: 3,
        line: 5,
        codeLine: `System.out.println(safeTitle);`,
        variables: { output: "Guest" },
        outputSoFar: ["Guest"],
        explanation: "พิมพ์ข้อความ Guest ออกทางหน้าจออย่างปลอดภัย",
        explanationEn: "Safely print Guest to the console.",
      },
    ],
    questions: [
      {
        id: "java4-q1",
        cellId: "T2",
        targetLine: 4,
        question: "หาก AI เขียน `title.length()` โดยไม่เช็ค `title != null` ก่อน จะเกิดอะไรขึ้นตอนรัน?",
        questionEn: "If AI writes `title.length()` without checking `title != null` first, what happens at runtime?",
        options: [
          {
            id: "a",
            text: "เกิด NullPointerException (NPE) ทำให้โปรแกรมหยุดทำงานทันที",
            textEn: "A NullPointerException (NPE) is thrown and crashes the program",
          },
          {
            id: "b",
            text: "Java จะคืนค่าความยาว 0 ให้อัตโนมัติ",
            textEn: "Java automatically returns length 0",
          },
          {
            id: "c",
            text: "Java จะเปลี่ยน null เป็นคำว่า 'null' ความยาว 4",
            textEn: "Java converts null into 'null' with length 4",
          },
          { id: "d", text: "คอมไพล์ไม่ผ่านตั้งแต่แรก", textEn: "It fails to compile" },
        ],
        correctOptionId: "a",
        hint: "การเรียกเมธอดบนตัวแปรที่อ้างอิงไปยัง null ใน Java จะเกิด Exception ชื่อดังตัวใด?",
        hintEn: "What famous Java exception occurs when calling a method on a null reference?",
        explanation:
          "NullPointerException เป็นบั๊กยอดฮิตใน Java เมื่อเรียกเมธอดบนออบเจ็กต์ที่เป็น null จึงต้องมี Null Guard เสมอ",
        explanationEn:
          "NullPointerException is a classic Java bug when invoking methods on null, so always guard against null.",
      },
      {
        id: "java4-q2",
        cellId: "F4",
        targetLine: 4,
        question: "Ternary Operator `(title != null) ? title : \"Guest\"` ทำงานเหมือนโครงสร้างใด?",
        questionEn: "Which control structure is equivalent to the ternary `(title != null) ? title : \"Guest\"`?",
        options: [
          {
            id: "a",
            text: "if (title != null) safeTitle = title; else safeTitle = \"Guest\";",
            textEn: "if (title != null) safeTitle = title; else safeTitle = \"Guest\";",
          },
          { id: "b", text: "for (int i = 0; i < 2; i++)", textEn: "for (int i = 0; i < 2; i++)" },
          { id: "c", text: "switch (title)", textEn: "switch (title)" },
          { id: "d", text: "try / finally", textEn: "try / finally" },
        ],
        correctOptionId: "a",
        hint: "เครื่องหมาย `? :` เป็นรูปแบบย่อของเงื่อนไข 2 ทาง",
        hintEn: "The `? :` operator is a shorthand for a two-branch conditional.",
        explanation:
          "Ternary Operator ใช้เขียนเงื่อนไข if-else แบบสั้นสำหรับกำหนดค่าเริ่มต้นที่ปลอดภัย",
        explanationEn:
          "The ternary operator is a concise if-else expression for assigning a safe fallback value.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยน `String title = null;` ในบรรทัดที่ 3 เป็น `String title = \"Knight\";` แล้วดูผลลัพธ์",
      instructionEn:
        "Change `String title = null;` on line 3 to `String title = \"Knight\";` and predict the output.",
      suggestedCode: `public class Main {
    public static void main(String[] args) {
        String title = "Knight";
        String safeTitle = (title != null) ? title : "Guest";
        System.out.println(safeTitle);
    }
}`,
      changeDescription: "กำหนดค่า title เป็น \"Knight\" แทน null",
      changeDescriptionEn: "Set title to \"Knight\" instead of null",
      options: ["Knight", "Guest", "null", "Error"],
      optionsEn: ["Knight", "Guest", "null", "Error"],
      explanation: "เมื่อ title ไม่เป็น null เงื่อนไข (title != null) เป็นจริง จึงพิมพ์ Knight",
      explanationEn: "When title is non-null, (title != null) is true, so it prints Knight.",
    },
    badgeReward: {
      id: "badge-java-boss",
      name: "ผู้พิชิตหอคอย Java OOP",
      nameEn: "Java OOP Tower Conqueror",
      description: "เข้าใจ Types, String.equals(), OOP Class และ Null Guard ใน Java",
      descriptionEn: "Mastered Java types, String.equals(), OOP classes, and Null Guards.",
    },
  },
];

// ============================================================================
// เควสต์ PRIMM เฉพาะสำหรับภาษา HTML / CSS
// ============================================================================
export const HTML_TOPICS: TopicQuest[] = [
  {
    id: 601,
    title: "HTML/CSS ด่านที่ 1 · โครงสร้างแท็ก Semantic HTML",
    titleEn: "HTML/CSS Stage 1 · Semantic HTML Tag Structure",
    shortName: "HTML 1 · Semantic Tags",
    shortNameEn: "HTML 1 · Semantic Tags",
    subtitle: "แกะโครงสร้างหน้าเว็บที่สะอาดและเข้าถึงง่ายด้วยแท็ก <header>, <main> และ <article>",
    subtitleEn: "Trace clean, accessible page structure using <header>, <main>, and <article> tags",
    code: `<main>
  <article class="quest">
    <h1>Dungeon Gate</h1>
    <p>Level 1</p>
  </article>
</main>`,
    predictPrompt:
      "เมื่อเบราว์เซอร์เรนเดอร์โค้ด HTML นี้ ข้อความที่ปรากฏบนหน้าเว็บคือข้อใด?",
    predictPromptEn:
      "When a browser renders this HTML, what text appears on the web page?",
    predictOptions: [
      "Dungeon Gate | Level 1",
      "main article Dungeon Gate",
      "quest Level 1",
      "<p>Level 1</p>",
    ],
    predictOptionsEn: [
      "Dungeon Gate | Level 1",
      "main article Dungeon Gate",
      "quest Level 1",
      "<p>Level 1</p>",
    ],
    predictExplanation:
      "เบราว์เซอร์จะไม่แสดงชื่อแท็กหรือ class แต่จะแสดงข้อความภายในแท็ก <h1> และ <p> คือ Dungeon Gate และ Level 1",
    predictExplanationEn:
      "The browser does not render tag names or class attributes; it renders the inner text of <h1> and <p>: Dungeon Gate and Level 1.",
    steps: [
      {
        stepNumber: 1,
        line: 1,
        codeLine: `<main>`,
        variables: { container: "main" },
        outputSoFar: [],
        explanation: "แท็ก <main> ระบุเนื้อหาหลักของหน้าเว็บ (ควรมีเพียง 1 จุดต่อหน้า)",
        explanationEn: "<main> marks the dominant main content of the page (one per page).",
      },
      {
        stepNumber: 2,
        line: 2,
        codeLine: `  <article class="quest">`,
        variables: { element: "article.quest" },
        outputSoFar: [],
        explanation: "<article> ใช้ครอบเนื้อหาที่สมบูรณ์ในตัวเอง เช่น การ์ดเควสต์หรือบทความ",
        explanationEn: "<article> wraps self-contained content such as a quest card or post.",
      },
      {
        stepNumber: 3,
        line: 3,
        codeLine: `    <h1>Dungeon Gate</h1>`,
        variables: { heading: "Dungeon Gate" },
        outputSoFar: ["Dungeon Gate"],
        explanation: "<h1> คือหัวข้อหลักระดับสูงสุด แสดงข้อความ 'Dungeon Gate'",
        explanationEn: "<h1> is the top-level heading, displaying 'Dungeon Gate'.",
      },
      {
        stepNumber: 4,
        line: 4,
        codeLine: `    <p>Level 1</p>`,
        variables: { paragraph: "Level 1" },
        outputSoFar: ["Dungeon Gate", "Level 1"],
        explanation: "<p> ใช้แสดงย่อหน้าข้อความ 'Level 1' ใต้หัวข้อ",
        explanationEn: "<p> renders the paragraph text 'Level 1' below the heading.",
      },
    ],
    questions: [
      {
        id: "html-601-q1",
        cellId: "T1",
        targetLine: 1,
        question: "แท็กใดที่เหมาะสมที่สุดในการระบุพื้นที่เนื้อหาหลักของหน้าเว็บ?",
        questionEn: "Which tag is most appropriate for marking the main content area of a web page?",
        options: [
          { id: "a", text: "<div>", textEn: "<div>" },
          { id: "b", text: "<main>", textEn: "<main>" },
          { id: "c", text: "<span>", textEn: "<span>" },
          { id: "d", text: "<b>", textEn: "<b>" },
        ],
        correctOptionId: "b",
        hint: "มองหาแท็กที่สื่อความหมายตรงตัวว่าเป็นส่วนหลัก (main) ของหน้าเว็บ",
        hintEn: "Look for the tag whose name literally means the main content of the page.",
        explanation: "<main> เป็น Semantic tag ที่บอกทั้งเบราว์เซอร์และ Screen Reader ว่าเป็นเนื้อหาหลักของหน้า",
        explanationEn: "<main> is a semantic tag telling browsers and screen readers where the primary content lives.",
      },
      {
        id: "html-601-q2",
        cellId: "E2",
        targetLine: 3,
        question: "เมื่อเบราว์เซอร์เรนเดอร์โค้ดนี้ ข้อความที่ปรากฏบนหน้าเว็บคือข้อใด?",
        questionEn: "When the browser renders this HTML, what text appears on screen?",
        options: [
          { id: "a", text: "main article Dungeon Gate", textEn: "main article Dungeon Gate" },
          { id: "b", text: "Dungeon Gate | Level 1", textEn: "Dungeon Gate | Level 1" },
          { id: "c", text: "quest Level 1", textEn: "quest Level 1" },
          { id: "d", text: "<p>Level 1</p>", textEn: "<p>Level 1</p>" },
        ],
        correctOptionId: "b",
        hint: "เบราว์เซอร์จะแสดงเฉพาะข้อความที่อยู่ภายในแท็ก ไม่แสดงชื่อแท็กหรือ class",
        hintEn: "Browsers only display the text inside tags, not tag names or class attributes.",
        explanation: "เบราว์เซอร์จะไม่แสดงชื่อแท็กหรือ class แต่จะแสดงข้อความข้างในคือ Dungeon Gate และ Level 1",
        explanationEn: "Browsers hide tag syntax and classes, displaying Dungeon Gate and Level 1.",
      },
      {
        id: "html-601-q3",
        cellId: "F2",
        targetLine: 2,
        question: "เหตุใดจึงควรใช้ <article> และ <h1> แทนการใช้ <div> ทั้งหมด?",
        questionEn: "Why should you use <article> and <h1> instead of only <div> elements?",
        options: [
          { id: "a", text: "ทำให้ไม่ต้องเขียน CSS เลย", textEn: "It eliminates the need for any CSS" },
          {
            id: "b",
            text: "ช่วยด้าน SEO และการเข้าถึง (Accessibility) ของโครงสร้างเว็บ",
            textEn: "It improves SEO and Accessibility by conveying document structure",
          },
          { id: "c", text: "ทำให้โค้ดรัน JavaScript เร็วขึ้น 10 เท่า", textEn: "It makes JavaScript run 10x faster" },
          { id: "d", text: "เบราว์เซอร์บังคับว่าห้ามใช้ <div>", textEn: "Browsers forbid using <div>" },
        ],
        correctOptionId: "b",
        hint: "นึกถึงประโยชน์ของการบอกความหมายของโครงสร้างเว็บให้ Search Engine และ Screen Reader",
        hintEn: "Think about how search engines and screen readers understand page structure.",
        explanation: "Semantic HTML ช่วยให้ Search Engine และเครื่องมือช่วยอ่านหน้าจอเข้าใจความหมายของแต่ละส่วนได้ถูกต้อง",
        explanationEn: "Semantic HTML helps search engines and assistive technologies interpret each section's role.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนหัวข้อ <h1> จาก Dungeon Gate เป็น 'Crystal Hall' แล้วสังเกตผลลัพธ์",
      instructionEn: "Change the <h1> text from Dungeon Gate to 'Crystal Hall' and predict the rendered text.",
      suggestedCode: `<main>
  <article class="quest">
    <h1>Crystal Hall</h1>
    <p>Level 1</p>
  </article>
</main>`,
      changeDescription: "เปลี่ยนข้อความภายในแท็ก <h1> เป็น Crystal Hall",
      changeDescriptionEn: "Change the <h1> text to Crystal Hall",
      options: ["Crystal Hall | Level 1", "Dungeon Gate | Level 1", "quest | Level 1"],
      optionsEn: ["Crystal Hall | Level 1", "Dungeon Gate | Level 1", "quest | Level 1"],
      explanation: "การแก้ไขเนื้อหาภายใน <h1> จะเปลี่ยนข้อความหัวข้อที่แสดงผลโดยยังคงโครงสร้างเดิม",
      explanationEn: "Updating the <h1> content changes the rendered heading while keeping the structure intact.",
    },
    badgeReward: {
      id: "badge-html-semantic",
      name: "สถาปนิกแท็ก Semantic",
      nameEn: "Semantic Tag Architect",
      description: "เข้าใจโครงสร้างและหน้าที่ของ Semantic HTML Tags",
      descriptionEn: "Understood the structure and purpose of Semantic HTML tags.",
    },
  },
  {
    id: 602,
    title: "HTML/CSS ด่านที่ 2 · CSS Box Model และ Flexbox",
    titleEn: "HTML/CSS Stage 2 · CSS Box Model & Flexbox",
    shortName: "HTML 2 · Box & Flex",
    shortNameEn: "HTML 2 · Box & Flex",
    subtitle: "คำนวณขนาดจริงของกล่อง UI ด้วย Box Model และการจัดเรียงด้วย Flexbox",
    subtitleEn: "Calculate actual UI box dimensions with the Box Model and align items with Flexbox",
    code: `<style>
  .box { width: 100px; padding: 10px; border: 2px solid #000; }
</style>
<div class="box">Shield 124px</div>`,
    predictPrompt:
      "ภายใต้ค่าเริ่มต้น (content-box) ความกว้างรวมทั้งหมดของกล่อง .box บนหน้าจอคือเท่าใด?",
    predictPromptEn:
      "Under the default box-sizing (content-box), what is the total rendered width of .box?",
    predictOptions: ["124px", "100px", "112px", "120px"],
    predictOptionsEn: ["124px", "100px", "112px", "120px"],
    predictExplanation:
      "100 + padding ซ้ายขวา (10+10) + border ซ้ายขวา (2+2) = 124px",
    predictExplanationEn:
      "100 + left/right padding (10 + 10) + left/right border (2 + 2) = 124px.",
    steps: [
      {
        stepNumber: 1,
        line: 2,
        codeLine: `  .box { width: 100px; padding: 10px; border: 2px solid #000; }`,
        variables: { width: "100px", paddingLR: "20px", borderLR: "4px" },
        outputSoFar: [],
        explanation: "ค่าเริ่มต้นของ box-sizing คือ content-box: ความกว้างรวม = width(100) + padding ซ้ายขวา(10+10) + border ซ้ายขวา(2+2)",
        explanationEn: "Default box-sizing is content-box: total width = width(100) + L/R padding(10+10) + L/R border(2+2).",
      },
      {
        stepNumber: 2,
        line: 4,
        codeLine: `<div class="box">Shield 124px</div>`,
        variables: { totalWidth: "124px", text: "Shield 124px" },
        outputSoFar: ["Shield 124px"],
        explanation: "กล่อง .box จะมีความกว้างรวมจริง 100 + 20 + 4 = 124px",
        explanationEn: "The .box element renders with a total width of 100 + 20 + 4 = 124px.",
      },
    ],
    questions: [
      {
        id: "html-602-q1",
        cellId: "T2",
        targetLine: 2,
        question: "หากต้องการให้ width: 100px รวม padding และ border เข้าไว้ด้วยกันเลย ต้องเพิ่ม CSS ใด?",
        questionEn: "Which CSS rule makes `width: 100px` include both padding and border?",
        options: [
          { id: "a", text: "box-sizing: border-box;", textEn: "box-sizing: border-box;" },
          { id: "b", text: "display: inline;", textEn: "display: inline;" },
          { id: "c", text: "margin: auto;", textEn: "margin: auto;" },
          { id: "d", text: "position: relative;", textEn: "position: relative;" },
        ],
        correctOptionId: "a",
        hint: "ใช้ property ที่ควบคุมวิธีคำนวณขนาดกล่อง (box-sizing)",
        hintEn: "Use the property that controls how box dimensions are calculated (box-sizing).",
        explanation: "box-sizing: border-box ทำให้ width ที่กำหนดเป็นความกว้างสุทธิรวม padding และ border แล้ว",
        explanationEn: "box-sizing: border-box makes the declared width include padding and border.",
      },
      {
        id: "html-602-q2",
        cellId: "E1",
        targetLine: 2,
        question: "ภายใต้ค่าเริ่มต้น (content-box) ความกว้างรวมทั้งหมดของ .box คือเท่าใด?",
        questionEn: "Under the default content-box, what is the total width of .box?",
        options: [
          { id: "a", text: "100px", textEn: "100px" },
          { id: "b", text: "112px", textEn: "112px" },
          { id: "c", text: "120px", textEn: "120px" },
          { id: "d", text: "124px", textEn: "124px" },
        ],
        correctOptionId: "d",
        hint: "อย่าลืมบวก padding และ border ทั้งฝั่งซ้ายและฝั่งขวา (คูณ 2)",
        hintEn: "Remember to add padding and border on both left and right sides (x2).",
        explanation: "100 + (10 * 2) + (2 * 2) = 124px เพราะ padding และ border มีทั้งด้านซ้ายและด้านขวา",
        explanationEn: "100 + (10 * 2) + (2 * 2) = 124px because padding and border apply to both left and right.",
      },
      {
        id: "html-602-q3",
        cellId: "F3",
        targetLine: 3,
        question: "ใน Flexbox หากต้องการจัดลูกๆ ให้อยู่กึ่งกลางแนวนอน ควรใช้ Property ใดบน Container?",
        questionEn: "In Flexbox (default row direction), which container property centers children horizontally?",
        options: [
          { id: "a", text: "justify-content: center;", textEn: "justify-content: center;" },
          { id: "b", text: "font-align: center;", textEn: "font-align: center;" },
          { id: "c", text: "float: middle;", textEn: "float: middle;" },
          { id: "d", text: "box-center: true;", textEn: "box-center: true;" },
        ],
        correctOptionId: "a",
        hint: "property ของ Flexbox ที่ใช้จัดตำแหน่งตามแกนหลัก (main axis)",
        hintEn: "The Flexbox property that aligns items along the main axis.",
        explanation: "justify-content: center จัดตำแหน่งไอเท็มตามแกนหลัก (ค่าเริ่มต้นคือแนวนอน)",
        explanationEn: "justify-content: center aligns items along the main axis (horizontal by default).",
      },
    ],
    modifyChallenge: {
      instruction: "ลองเปลี่ยนข้อความใน <div class=\"box\"> เป็น 'Shield 100px' เพื่อจำลองโหมด border-box",
      instructionEn: "Add `box-sizing: border-box;` and update the text to 'Shield 100px' to simulate border-box mode.",
      suggestedCode: `<style>
  .box { box-sizing: border-box; width: 100px; padding: 10px; border: 2px solid #000; }
</style>
<div class="box">Shield 100px</div>`,
      changeDescription: "เพิ่ม box-sizing: border-box และอัปเดตข้อความเป็น Shield 100px",
      changeDescriptionEn: "Add box-sizing: border-box and update text to Shield 100px",
      options: ["Shield 100px", "Shield 124px", "100px"],
      optionsEn: ["Shield 100px", "Shield 124px", "100px"],
      explanation: "เมื่อใช้ border-box ความกว้างรวมของกล่องจะคงที่ที่ 100px ไม่ล้นเลย์เอาต์",
      explanationEn: "With border-box, the total box width stays at 100px and avoids layout overflow.",
    },
    badgeReward: {
      id: "badge-html-box",
      name: "จอมเวท Box Model",
      nameEn: "Box Model Sorcerer",
      description: "คำนวณขนาด CSS Box Model และจัดวาง Flexbox ได้แม่นยำ",
      descriptionEn: "Accurately calculated CSS Box Model dimensions and Flexbox alignment.",
    },
  },
  {
    id: 603,
    title: "HTML/CSS ด่านที่ 3 · CSS Specificity & ลำดับความสำคัญ",
    titleEn: "HTML/CSS Stage 3 · CSS Specificity & Cascade Priority",
    shortName: "HTML 3 · Specificity",
    shortNameEn: "HTML 3 · Specificity",
    subtitle: "จับบั๊ก CSS Specificity ที่ AI เขียนทับจนปุ่มเปลี่ยนสีไม่ได้",
    subtitleEn: "Catch CSS specificity bugs where AI overrides fail to change button colors",
    aiScenario:
      "AI สร้าง CSS ให้ปุ่ม: `#action-btn { color: red; }` แล้วเขียน `.btn-safe { color: green; }` ไว้ข้างล่าง แต่ปุ่มยังคงเป็นสีแดง!",
    code: `<style>
  #action-btn { color: red; }
  .btn-safe { color: green; }
</style>
<button id="action-btn" class="btn-safe">Save Game</button>`,
    predictPrompt:
      "จากกฎ CSS ด้านบน สีตัวอักษรของปุ่ม 'Save Game' ที่แสดงบนหน้าเว็บจริงคือสีใด?",
    predictPromptEn:
      "Based on the CSS rules above, what color will the 'Save Game' button text actually be?",
    predictOptions: ["red", "green", "black", "transparent"],
    predictOptionsEn: ["red", "green", "black", "transparent"],
    predictExplanation:
      "#action-btn เป็น ID Selector ที่มี Specificity (1,0,0) ซึ่งสูงกว่า .btn-safe (0,1,0) ดังนั้นปุ่มจึงเป็นสี red",
    predictExplanationEn:
      "#action-btn is an ID selector with specificity (1,0,0), beating .btn-safe (0,1,0), so the button text stays red.",
    steps: [
      {
        stepNumber: 1,
        line: 2,
        codeLine: `  #action-btn { color: red; }`,
        variables: { specificity: "(1, 0, 0)", color: "red" },
        outputSoFar: [],
        explanation: "ID Selector (#action-btn) มีน้ำหนัก Specificity สูงมากคือ (1, 0, 0)",
        explanationEn: "The ID selector (#action-btn) has high specificity: (1, 0, 0).",
      },
      {
        stepNumber: 2,
        line: 3,
        codeLine: `  .btn-safe { color: green; }`,
        variables: { specificity: "(0, 1, 0)", winner: "#action-btn (red)" },
        outputSoFar: [],
        explanation: "Class Selector (.btn-safe) มีน้ำหนักแค่ (0, 1, 0) แม้จะเขียนทีหลังก็แพ้ ID Selector!",
        explanationEn: "The class selector (.btn-safe) has specificity (0, 1, 0), so even later in source order it loses to the ID selector!",
      },
      {
        stepNumber: 3,
        line: 5,
        codeLine: `<button id="action-btn" class="btn-safe">Save Game</button>`,
        variables: { renderedColor: "red", text: "Save Game" },
        outputSoFar: ["Save Game"],
        explanation: "ข้อความบนปุ่ม 'Save Game' จึงแสดงผลเป็นสีแดง (red) แทนที่จะเป็นสีเขียว",
        explanationEn: "Therefore the 'Save Game' button text renders in red instead of green.",
      },
    ],
    questions: [
      {
        id: "html-603-q1",
        cellId: "T3",
        targetLine: 3,
        question: "เหตุใด .btn-safe { color: green; } ที่อยู่บรรทัดล่างกว่าจึงไม่สามารถทับ #action-btn ได้?",
        questionEn: "Why can't `.btn-safe { color: green; }` on a later line override `#action-btn`?",
        options: [
          {
            id: "a",
            text: "เพราะ Class Selector ใช้กับปุ่ม <button> ไม่ได้",
            textEn: "Class selectors cannot be used on <button> elements",
          },
          {
            id: "b",
            text: "เพราะ ID Selector (#) มีค่า Specificity สูงกว่า Class Selector (.)",
            textEn: "ID selectors (#) have higher specificity than class selectors (.)",
          },
          {
            id: "c",
            text: "เพราะสี green ต้องเขียนเป็นตัวพิมพ์ใหญ่",
            textEn: "The color green must be written in uppercase",
          },
          {
            id: "d",
            text: "เพราะขาดเครื่องหมาย ; หลัง button",
            textEn: "Missing a semicolon after button",
          },
        ],
        correctOptionId: "b",
        hint: "เปรียบเทียบน้ำหนักความเฉพาะเจาะจง (Specificity) ระหว่าง #id กับ .class",
        hintEn: "Compare the specificity weights between #id and .class.",
        explanation: "ใน CSS ลำดับ Specificity คือ Inline style > ID (#) > Class (.) > Tag ดังนั้น #action-btn จึงชนะเสมอ",
        explanationEn: "In CSS specificity, Inline style > ID (#) > Class (.) > Tag, so #action-btn always wins.",
      },
      {
        id: "html-603-q2",
        cellId: "E3",
        targetLine: 2,
        question: "จากโค้ดด้านบน สีตัวอักษรของปุ่ม 'Save Game' ที่แสดงบนหน้าเว็บจริงคือสีใด?",
        questionEn: "In the code above, what is the rendered text color of the 'Save Game' button?",
        options: [
          { id: "a", text: "green", textEn: "green" },
          { id: "b", text: "red", textEn: "red" },
          { id: "c", text: "black", textEn: "black" },
          { id: "d", text: "transparent", textEn: "transparent" },
        ],
        correctOptionId: "b",
        hint: "ดูว่า selector ไหนชนะตามกฎ Specificity (#action-btn หรือ .btn-safe)",
        hintEn: "Check which selector wins by specificity (#action-btn vs .btn-safe).",
        explanation: "#action-btn มีน้ำหนัก (1,0,0) ชนะ .btn-safe (0,1,0) สีจึงเป็น red",
        explanationEn: "#action-btn (1,0,0) beats .btn-safe (0,1,0), so the color is red.",
      },
      {
        id: "html-603-q3",
        cellId: "F4",
        targetLine: 2,
        question: "วิธีแก้โค้ด AI นี้ให้ดูแลรักษาง่ายและเป็น Best Practice ที่สุดคือข้อใด?",
        questionEn: "What is the best-practice, maintainable fix for this AI-generated CSS?",
        options: [
          {
            id: "a",
            text: "เปลี่ยนไปใช้ Class Selector ทั้งคู่ เช่น .btn-danger และ .btn-safe แทนการใช้ #id",
            textEn: "Use class selectors for both, e.g. .btn-danger and .btn-safe, instead of #id",
          },
          {
            id: "b",
            text: "ใส่ !important ที่ทุกบรรทัดในไฟล์ CSS",
            textEn: "Add !important to every line in the CSS file",
          },
          {
            id: "c",
            text: "ลบแท็ก <button> ออกแล้วใช้ <p> แทน",
            textEn: "Remove <button> and use <p> instead",
          },
          {
            id: "d",
            text: "เขียน <style> ซ้ำ 3 รอบ",
            textEn: "Repeat the <style> block 3 times",
          },
        ],
        correctOptionId: "a",
        hint: "การทำให้ selector มีระดับความเฉพาะเจาะจงเท่ากันจะช่วยลดปัญหาทับซ้อน",
        hintEn: "Keeping selectors at the same specificity level makes overrides predictable.",
        explanation: "การหลีกเลี่ยง #id ใน CSS และใช้ Class ที่มี Specificity เท่ากันจะทำให้การ override ตามลำดับบรรทัดคาดเดาได้ง่าย",
        explanationEn: "Avoiding #id in CSS and using equal-specificity classes makes source-order overrides predictable.",
      },
    ],
    modifyChallenge: {
      instruction: "ลองแก้บั๊กปุ่ม Save Game ให้มีข้อความ 'Save Game (Green)' เพื่อยืนยันการแก้ Selector",
      instructionEn: "Switch both rules to classes and update the button text to 'Save Game (Green)' to confirm the fix.",
      suggestedCode: `<style>
  .btn-danger { color: red; }
  .btn-safe { color: green; }
</style>
<button class="btn-danger btn-safe">Save Game (Green)</button>`,
      changeDescription: "เปลี่ยนจาก #id เป็น .class เพื่อให้ .btn-safe override ได้ตามลำดับ",
      changeDescriptionEn: "Replace #id with .class so .btn-safe overrides by source order",
      options: ["Save Game (Green)", "Save Game", "red"],
      optionsEn: ["Save Game (Green)", "Save Game", "red"],
      explanation: "เมื่อทั้งคู่เป็น Class Selector ที่มีน้ำหนัก (0,1,0) เท่ากัน กฎที่อยู่ด้านล่าง (.btn-safe) จะชนะทันที",
      explanationEn: "With equal (0,1,0) specificity, the later class rule (.btn-safe) wins immediately.",
    },
    badgeReward: {
      id: "badge-html-3",
      name: "ผู้คุมกฎ CSS Specificity",
      nameEn: "CSS Specificity Guardian",
      description: "เข้าใจลำดับความสำคัญของ Selector และแก้ปัญหาสไตล์ทับซ้อน",
      descriptionEn: "Mastered CSS selector specificity and resolved style override conflicts.",
    },
  },
  {
    id: 604,
    title: "HTML/CSS ด่านบอส · Form Accessibility & Responsive Media Query",
    titleEn: "HTML/CSS Boss Stage · Form Accessibility & Responsive Media Query",
    shortName: "HTML 4 · Form & Responsive Boss",
    shortNameEn: "HTML 4 · Form & Responsive Boss",
    isBoss: true,
    subtitle: "ด่านบอส HTML/CSS: ตรวจสอบฟอร์มที่เข้าถึงง่าย (<label>) และ @media สำหรับมือถือ",
    subtitleEn: "HTML/CSS Boss Stage: Verify accessible forms (<label>) and mobile @media queries",
    aiScenario:
      "AI สร้างฟอร์มล็อกอินโดยใช้ <input placeholder=\"Email\"> อย่างเดียวไม่มี <label> และกำหนดความกว้างกล่องตายตัว 600px จนล้นจอมือถือ!",
    code: `<style>
  .card { width: 600px; }
  @media (max-width: 640px) { .card { width: 100%; } }
</style>
<form class="card">
  <label for="email">Player Email</label>
  <input id="email" type="email" required />
  <button type="submit">Join Raid</button>
</form>`,
    predictPrompt:
      "เมื่อเรนเดอร์ฟอร์มนี้ ข้อความที่มองเห็นบนหน้าเว็บคือข้อใด?",
    predictPromptEn:
      "When this form is rendered, what visible text appears on the web page?",
    predictOptions: [
      "Player Email | Join Raid",
      "email | submit",
      "600px | 100%",
      "card | required",
    ],
    predictOptionsEn: [
      "Player Email | Join Raid",
      "email | submit",
      "600px | 100%",
      "card | required",
    ],
    predictExplanation:
      "เบราว์เซอร์จะแสดงข้อความภายใน <label> ('Player Email') และปุ่ม <button> ('Join Raid') ส่วนกฎ CSS และ attribute จะไม่แสดงเป็นข้อความ",
    predictExplanationEn:
      "The browser renders the text inside <label> ('Player Email') and <button> ('Join Raid'); CSS rules and HTML attributes are not shown as text.",
    steps: [
      {
        stepNumber: 1,
        line: 3,
        codeLine: `@media (max-width: 640px) { .card { width: 100%; } }`,
        variables: { mobileWidth: "100%", desktopWidth: "600px" },
        outputSoFar: [],
        explanation: "Media Query จะปรับความกว้าง .card เป็น 100% อัตโนมัติเมื่อหน้าจอกว้างไม่เกิน 640px",
        explanationEn: "The media query automatically sets .card width to 100% on viewports up to 640px wide.",
      },
      {
        stepNumber: 2,
        line: 6,
        codeLine: `<label for="email">Player Email</label>`,
        variables: { forAttr: "email", labelText: "Player Email" },
        outputSoFar: ["Player Email"],
        explanation: "ผูก <label for=\"email\"> เข้ากับ <input id=\"email\"> เพื่อให้คลิกโฟกัสได้และรองรับ Screen Reader",
        explanationEn: "Bind <label for=\"email\"> to <input id=\"email\"> for click-to-focus and screen reader support.",
      },
      {
        stepNumber: 3,
        line: 8,
        codeLine: `<button type="submit">Join Raid</button>`,
        variables: { buttonType: "submit", text: "Join Raid" },
        outputSoFar: ["Player Email | Join Raid"],
        explanation: "แสดงปุ่มส่งฟอร์มข้อความ Join Raid",
        explanationEn: "Render the submit button with text Join Raid.",
      },
    ],
    questions: [
      {
        id: "html-604-q1",
        cellId: "T2",
        targetLine: 6,
        question: "เหตุใดจึงต้องเชื่อม <label for=\"email\"> เข้ากับ <input id=\"email\"> แทนการใช้ placeholder อย่างเดียว?",
        questionEn: "Why should you link <label for=\"email\"> to <input id=\"email\"> instead of relying only on placeholder?",
        options: [
          {
            id: "a",
            text: "ช่วยให้โปรแกรมอ่านหน้าจอ (Screen Reader) อ่านชื่อช่องได้ และคลิกที่ป้ายชื่อเพื่อโฟกัสช่องกรอกได้",
            textEn: "Screen readers can announce the field name and users can click the label to focus the input",
          },
          {
            id: "b",
            text: "ทำให้เบราว์เซอร์ส่งฟอร์มโดยไม่ต้องกดปุ่ม",
            textEn: "It submits the form without clicking a button",
          },
          {
            id: "c",
            text: "ช่วยเข้ารหัสข้อมูลอีเมลอัตโนมัติ",
            textEn: "It automatically encrypts the email input",
          },
          {
            id: "d",
            text: "บังคับให้ <input> มีความกว้าง 100% เสมอ",
            textEn: "It forces <input> to always be 100% wide",
          },
        ],
        correctOptionId: "a",
        hint: "นึกถึงการใช้งานของผู้พิการทางสายตาและพฤติกรรมเมื่อผู้ใช้เริ่มพิมพ์แล้ว placeholder หายไป",
        hintEn: "Think about screen reader users and how placeholders disappear once typing starts.",
        explanation:
          "placeholder จะหายไปเมื่อพิมพ์ข้อความ แต่ <label for=...> ช่วยทั้ง Accessibility และ UX อย่างถาวร",
        explanationEn:
          "Placeholders vanish when typing, whereas <label for=...> provides persistent Accessibility and UX.",
      },
      {
        id: "html-604-q2",
        cellId: "F4",
        targetLine: 3,
        question: "กฎ `@media (max-width: 640px) { .card { width: 100%; } }` แก้บั๊กเลย์เอาต์ใดจาก AI?",
        questionEn: "Which AI layout bug does `@media (max-width: 640px) { .card { width: 100%; } }` fix?",
        options: [
          {
            id: "a",
            text: "แก้ปัญหากล่องกว้างตายตัว 600px จนล้นหน้าจอมือถือที่มีขนาดเล็กกว่า 640px",
            textEn: "Prevents the fixed 600px card from overflowing mobile screens narrower than 640px",
          },
          {
            id: "b",
            text: "ทำให้ข้อความในปุ่มเปลี่ยนเป็นสีแดง",
            textEn: "Turns the button text red",
          },
          {
            id: "c",
            text: "ซ่อนฟอร์มทั้งหมดเมื่อเปิดบนเดสก์ท็อป",
            textEn: "Hides the entire form on desktop screens",
          },
          {
            id: "d",
            text: "ลบปุ่ม Join Raid ออกจากหน้าเว็บ",
            textEn: "Removes the Join Raid button from the page",
          },
        ],
        correctOptionId: "a",
        hint: "ดูค่า width: 600px เทียบกับเงื่อนไข max-width: 640px",
        hintEn: "Compare width: 600px against the max-width: 640px breakpoint.",
        explanation:
          "Responsive Media Query ช่วยปรับขนาดกล่องให้พอดีกับหน้าจอมือถือ ป้องกันการเลื่อนแนวนอน (Horizontal Overflow)",
        explanationEn:
          "Responsive media queries resize containers to fit mobile viewports, preventing horizontal overflow.",
      },
    ],
    modifyChallenge: {
      instruction:
        "ลองเปลี่ยนข้อความปุ่มจาก 'Join Raid' เป็น 'Enter Dungeon' เพื่อทดสอบการอัปเดตฟอร์ม",
      instructionEn:
        "Change the button text from 'Join Raid' to 'Enter Dungeon' and predict the rendered form text.",
      suggestedCode: `<style>
  .card { width: 600px; }
  @media (max-width: 640px) { .card { width: 100%; } }
</style>
<form class="card">
  <label for="email">Player Email</label>
  <input id="email" type="email" required />
  <button type="submit">Enter Dungeon</button>
</form>`,
      changeDescription: "เปลี่ยนข้อความปุ่มเป็น Enter Dungeon",
      changeDescriptionEn: "Change button text to Enter Dungeon",
      options: ["Player Email | Enter Dungeon", "Player Email | Join Raid", "Enter Dungeon"],
      optionsEn: ["Player Email | Enter Dungeon", "Player Email | Join Raid", "Enter Dungeon"],
      explanation: "ข้อความที่เรนเดอร์จาก <label> และ <button> จะอัปเดตเป็น Player Email | Enter Dungeon",
      explanationEn: "The rendered text from <label> and <button> updates to Player Email | Enter Dungeon.",
    },
    badgeReward: {
      id: "badge-html-boss",
      name: "ผู้พิชิตป้อมปราการ HTML/CSS",
      nameEn: "HTML/CSS Fortress Conqueror",
      description: "เชี่ยวชาญ Semantic HTML, Box Model, Flexbox, Specificity และ Responsive Form",
      descriptionEn: "Mastered Semantic HTML, Box Model, Flexbox, Specificity, and Responsive Forms.",
    },
  },
];

export function getTopicsByLanguage(lang: LearningLanguage): TopicQuest[] {
  if (lang === "python") return PYTHON_TOPICS;
  if (lang === "sql") return SQL_TOPICS;
  if (lang === "typescript") return TYPESCRIPT_TOPICS;
  if (lang === "cpp") return CPP_TOPICS;
  if (lang === "java") return JAVA_TOPICS;
  if (lang === "html") return HTML_TOPICS;
  return TOPICS;
}

/**
 * รันโค้ดตามภาษาที่เลือก (JavaScript / Python / SQL / TypeScript / C++ / Java)
 * สำหรับทั้ง PracticeArena, BattleOverlay Test Oracle และห้องทดลอง
 */
export function runCodeByLanguage(
  code: string,
  lang: LearningLanguage
): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  if (lang === "javascript") {
    return runJavaScriptReal(code);
  }

  if (lang === "typescript") {
    return runTypeScriptSimulated(code);
  }

  if (lang === "python") {
    return runPythonSimulated(code);
  }

  if (lang === "cpp") {
    return runCppSimulated(code);
  }

  if (lang === "java") {
    return runJavaSimulated(code);
  }

  if (lang === "html") {
    return runHtmlCssSimulated(code);
  }

  return runSqlSimulated(code);
}

/**
 * ตัวจำลองการรัน Python พื้นฐาน (รองรับเควสต์ Python และห้องทดลอง print / ตัวแปร / if-elif-else / for in range / list)
 */
function runPythonSimulated(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  try {
    const clean = code.replace(/\r\n/g, "\n").trim();

    // ตรวจจับรูปแบบเควสต์ที่ 5 (Boss): bag = {...}; items = [...]; print(bag["potion"])
    if (clean.includes("bag =") && clean.includes("items =") && clean.includes("for item in items")) {
      const bagMatch = clean.match(/bag\s*=\s*(\{[^}]*\})/);
      const itemsMatch = clean.match(/items\s*=\s*(\[[^\]]*\])/);
      if (bagMatch && itemsMatch) {
        const bag = JSON.parse(bagMatch[1].replace(/'/g, '"')) as Record<string, number>;
        const items = JSON.parse(itemsMatch[1].replace(/'/g, '"')) as string[];
        for (const item of items) {
          if (item in bag) {
            bag[item] = bag[item] + 1;
          }
        }
        const keyMatch = clean.match(/print\(\s*bag\[['"]([^'"]+)['"]\]\s*\)/);
        const key = keyMatch ? keyMatch[1] : "potion";
        const val = String(bag[key] ?? 0);
        return {
          outputs: [val],
          finalOutput: val,
          success: true,
        };
      }
    }

    // ตรวจจับรูปแบบเควสต์ที่ 4: def calc_damage(atk, armor): ... print(calc_damage(a, b))
    const dmgCallMatch = clean.match(/print\(\s*calc_damage\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)\s*\)/);
    if (clean.includes("def calc_damage") && dmgCallMatch) {
      const dmg = Number(dmgCallMatch[1]) - Number(dmgCallMatch[2]);
      const result = dmg < 0 ? 0 : dmg;
      return {
        outputs: [String(result)],
        finalOutput: String(result),
        success: true,
      };
    }

    // ตรวจจับรูปแบบเควสต์ที่ 3: for i in range(a, b): total = total + (i * m)
    const rangeMatch = clean.match(
      /range\(\s*(\d+)\s*,\s*(\d+)\s*\)/
    );
    if (rangeMatch && clean.includes("total")) {
      const start = Number(rangeMatch[1]);
      const stop = Number(rangeMatch[2]);
      let total = 0;
      for (let i = start; i < stop; i++) {
        total += i * 10;
      }
      return {
        outputs: [String(total)],
        finalOutput: String(total),
        success: true,
      };
    }

    // ตรวจจับรูปแบบเควสต์ที่ 2: temp & if/elif/else
    const tempMatch = clean.match(/temp\s*=\s*(-?\d+(?:\.\d+)?)/);
    if (tempMatch && clean.includes("elif")) {
      const temp = Number(tempMatch[1]);
      let status = "Normal";
      if (temp >= 38) status = "Hot";
      else if (temp >= 30) status = "Warm";
      else status = "Cool";
      return {
        outputs: [status],
        finalOutput: status,
        success: true,
      };
    }

    // ตรวจจับรูปแบบเควสต์ที่ 1: price, qty, discount
    const priceMatch = clean.match(/price\s*=\s*(-?\d+(?:\.\d+)?)/);
    const qtyMatch = clean.match(/qty\s*=\s*(-?\d+(?:\.\d+)?)/);
    const discMatch = clean.match(/discount\s*=\s*(-?\d+(?:\.\d+)?)/);
    if (priceMatch && qtyMatch && discMatch) {
      const net =
        Number(priceMatch[1]) * Number(qtyMatch[1]) - Number(discMatch[1]);
      return {
        outputs: [String(net)],
        finalOutput: String(net),
        success: true,
      };
    }

    // ตัวแปลง Python พื้นฐานเป็น JS สำหรับ Playground ทั่วไป
    const lines = clean.split("\n");
    const env: Record<string, any> = {};
    const outputs: string[] = [];

    for (let idx = 0; idx < lines.length; idx++) {
      const rawLine = lines[idx];
      const trimmed = rawLine.replace(/#.*$/, "").trim();
      if (!trimmed) continue;

      // รองรับ for x in list_var:
      const forInList = trimmed.match(/^for\s+([a-zA-Z_]\w*)\s+in\s+([a-zA-Z_]\w*)\s*:$/);
      if (forInList && idx + 1 < lines.length) {
        const iterVar = forInList[1];
        const listVar = forInList[2];
        const bodyLine = lines[idx + 1].replace(/#.*$/, "").trim();
        const arr = Array.isArray(env[listVar]) ? env[listVar] : [];
        for (const item of arr) {
          env[iterVar] = item;
          evalPythonSimpleAssignment(bodyLine, env);
        }
        idx++;
        continue;
      }

      if (trimmed.startsWith("print(") && trimmed.endsWith(")")) {
        const inner = trimmed.slice(6, -1);
        const parts = inner.split(",").map((p) => evalPythonExpr(p.trim(), env));
        outputs.push(parts.join(" "));
        continue;
      }

      evalPythonSimpleAssignment(trimmed, env);
    }

    return {
      outputs,
      finalOutput: outputs.join("\n").trim(),
      success: true,
    };
  } catch (err) {
    return {
      outputs: [],
      finalOutput: "",
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถรันโค้ด Python นี้ได้",
    };
  }
}

function evalPythonSimpleAssignment(
  stmt: string,
  env: Record<string, any>
): void {
  const plusEq = stmt.match(/^([a-zA-Z_]\w*)\s*\+=\s*(.+)$/);
  if (plusEq) {
    env[plusEq[1]] = (Number(env[plusEq[1]]) || 0) + Number(evalPythonExpr(plusEq[2], env));
    return;
  }
  const eq = stmt.match(/^([a-zA-Z_]\w*)\s*=\s*(.+)$/);
  if (eq) {
    env[eq[1]] = evalPythonExpr(eq[2], env);
  }
}

function evalPythonExpr(expr: string, env: Record<string, any>): any {
  const t = expr.trim();
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1);
  }
  if (t.startsWith("[") && t.endsWith("]")) {
    return JSON.parse(t);
  }
  const replaced = t.replace(/len\(\s*([a-zA-Z_]\w*)\s*\)/g, (_, v) =>
    Array.isArray(env[v]) ? String(env[v].length) : "0"
  );
  const keys = Object.keys(env);
  const vals = keys.map((k) => env[k]);
  const fn = new Function(...keys, `return (${replaced});`);
  return fn(...vals);
}

/**
 * ตัวจำลองการรันคำสั่ง SQL สำหรับเควสต์และห้องทดลอง SQL
 */
function runSqlSimulated(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  const clean = code
    .replace(/--.*$/gm, "")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();

  if (!clean.includes("SELECT") || !clean.includes("FROM")) {
    return {
      outputs: [],
      finalOutput: "",
      success: false,
      error: "คำสั่ง SQL ต้องมีอย่างน้อย SELECT และ FROM",
    };
  }

  // ตาราง orders + customers สำหรับด่านที่ 4 (Boss)
  if (clean.includes("FROM ORDERS")) {
    const rows = [
      { name: "Alice", total: 500 },
      { name: "Bob", total: 300 },
    ];
    const whereTotalGte = clean.match(/WHERE\s+(?:O\.)?TOTAL\s*>=\s*(\d+)/);
    const minTotal = whereTotalGte ? Number(whereTotalGte[1]) : 0;
    const filtered = rows.filter((r) => r.total >= minTotal);
    const out = filtered.map((r) => `${r.name}: ${r.total}`).join(", ");
    return {
      outputs: [out],
      finalOutput: out,
      success: true,
    };
  }

  // ตาราง sales สำหรับด่านที่ 2
  if (clean.includes("FROM SALES")) {
    const havingMatch = clean.match(/HAVING\s+SUM\(AMOUNT\)\s*>=\s*(\d+)/);
    const minSum = havingMatch ? Number(havingMatch[1]) : 0;
    const groups = [
      { category: "Book", total: 500 },
      { category: "Pen", total: 50 },
    ].filter((g) => g.total >= minSum);

    const out = groups.map((g) => `${g.category}: ${g.total}`).join(", ");
    return {
      outputs: [out],
      finalOutput: out,
      success: true,
    };
  }

  // ตาราง products สำหรับด่านที่ 1 และ Playground
  let products = [
    { id: 1, name: "Keyboard", category: "Accessory", price: 900, stock: 12 },
    { id: 2, name: "Mouse", category: "Accessory", price: 450, stock: 25 },
    { id: 3, name: "Monitor", category: "Display", price: 3500, stock: 5 },
  ];

  const wherePriceGte = clean.match(/WHERE\s+PRICE\s*>=\s*(\d+)/);
  if (wherePriceGte) {
    const minP = Number(wherePriceGte[1]);
    products = products.filter((p) => p.price >= minP);
  }

  if (clean.includes("ORDER BY PRICE DESC")) {
    products.sort((a, b) => b.price - a.price);
  } else if (clean.includes("ORDER BY PRICE ASC") || clean.includes("ORDER BY PRICE")) {
    products.sort((a, b) => a.price - b.price);
  }

  const limitMatch = clean.match(/LIMIT\s+(\d+)/);
  if (limitMatch) {
    products = products.slice(0, Number(limitMatch[1]));
  }

  const out = products.map((p) => `${p.name} (${p.price})`).join(", ");
  return {
    outputs: [out],
    finalOutput: out,
    success: true,
  };
}

/**
 * ตัวแปลงและรันโค้ด TypeScript พื้นฐาน (ลบ Type Annotation / Interface / Union / Generic แล้วรันจริงใน Sandbox)
 */
function runTypeScriptSimulated(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  try {
    let js = code.replace(/\r\n/g, "\n");
    // ลบ interface { ... } และ type ... = ...;
    js = js.replace(/\binterface\s+[A-Za-z_$][\w$]*\s*(?:extends[^{]+)?\{[^}]*\}/g, "");
    js = js.replace(/\btype\s+[A-Za-z_$][\w$]*\s*(?:<[^>]*>)?\s*=\s*[^;]+;/g, "");
    // ลบ Generic <T> ในชื่อฟังก์ชัน
    js = js.replace(/\bfunction\s+([A-Za-z_$][\w$]*)\s*<[^>]+>/g, "function $1");
    // ลบ Return Type หลังวงเล็บฟังก์ชัน: ): string { -> ) {
    js = js.replace(/\)\s*:\s*(?:readonly\s+)?[A-Za-z_$][\w$.<>\[\]|\s&]*(?=\s*\{)/g, ")");
    // ลบ Type Annotation ในพารามิเตอร์ฟังก์ชัน
    js = js.replace(
      /(\(|,\s*)([A-Za-z_$][\w$]*)\s*:\s*(?:readonly\s+)?[A-Za-z_$][\w$.<>\[\]|\s&]*(?=[,)])/g,
      "$1$2"
    );
    // ลบ Type Annotation บนการประกาศตัวแปร const / let / var
    js = js.replace(
      /\b(const|let|var)\s+([A-Za-z_$][\w$]*)\s*:\s*(?:readonly\s+)?[A-Za-z_$][\w$.<>\[\]|\s&]*\s*=/g,
      "$1 $2 ="
    );
    // ลบ type assertion `as Type`
    js = js.replace(/\s+as\s+[A-Za-z_$][\w$.<>\[\]]*/g, "");

    return runJavaScriptReal(js);
  } catch (err) {
    return {
      outputs: [],
      finalOutput: "",
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถรันโค้ด TypeScript นี้ได้",
    };
  }
}

/**
 * ตัวจำลองการรัน C++ พื้นฐาน (รองรับ int/double division, reference &, vector, for loop, cout)
 */
function runCppSimulated(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  try {
    let src = code
      .replace(/\r\n/g, "\n")
      .replace(/^\s*#include.*$/gm, "")
      .replace(/^\s*using\s+namespace\s+std\s*;/gm, "")
      .replace(/std::/g, "");

    // เก็บรายชื่อตัวแปรที่เป็น int เพื่อจำลอง Integer Division
    const intVars = new Set<string>();
    const intDeclMatches = src.matchAll(/\bint\s+([a-zA-Z_]\w*)\b/g);
    for (const m of intDeclMatches) {
      intVars.add(m[1]);
    }

    // ตรวจจับฟังก์ชัน void ที่มีพารามิเตอร์แบบ reference (&) ตัวแรก
    const refFuncNames = new Map<string, string>();
    src = src.replace(
      /\bvoid\s+([a-zA-Z_]\w*)\s*\(([^)]*)\)\s*\{([\s\S]*?)\}/g,
      (full, fname, params, body) => {
        const paramList = params
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);
        let refParam: string | null = null;
        const cleanParams = paramList.map((p: string, idx: number) => {
          const refMatch = p.match(/^[a-zA-Z_]\w*\s*&\s*([a-zA-Z_]\w*)$/);
          if (refMatch && idx === 0) {
            refParam = refMatch[1];
            return refParam;
          }
          const normalMatch = p.match(/^[a-zA-Z_]\w*\s+([a-zA-Z_]\w*)$/);
          return normalMatch ? normalMatch[1] : p;
        });

        if (refParam) {
          refFuncNames.set(fname, refParam);
          return `function ${fname}(${cleanParams.join(", ")}) {\n${body}\nreturn ${refParam};\n}`;
        }
        return `function ${fname}(${cleanParams.join(", ")}) {\n${body}\n}`;
      }
    );

    // แปลงการเรียกใช้ฟังก์ชันที่รับ reference ตัวแรก: fname(arg, ...) -> arg = fname(arg, ...)
    for (const [fname] of refFuncNames) {
      const callRe = new RegExp(`\\b${fname}\\s*\\(\\s*([a-zA-Z_]\\w*)([^)]*)\\)\\s*;`, "g");
      src = src.replace(callRe, `$1 = ${fname}($1$2);`);
    }

    // แปลง int main() { ... } เป็นเนื้อหาที่เรียกใช้ได้
    src = src.replace(/\bint\s+main\s*\([^)]*\)\s*\{/, "function __cppMain() {");

    // แปลง vector<T> name = { ... };
    src = src.replace(
      /\bvector\s*<[^>]+>\s+([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g,
      "let $1 = [$2];"
    );
    src = src.replace(/\.size\(\)/g, ".length");

    // แปลงชนิดตัวแปร C++ เป็น let และจัดการ Integer Division
    src = src.replace(/\b(int|double|float|bool|string)\s+([a-zA-Z_]\w*)\s*=\s*([^;]+);/g, (_, type, name, expr) => {
      let cleanExpr = expr.replace(/\(\s*double\s*\)\s*([a-zA-Z_]\w*|\d+)/g, "Number($1)");
      // ถ้าเป็น int และมี / โดยไม่มี Number( ให้ตัดทศนิยมแบบ Integer Division
      if (type === "int" && cleanExpr.includes("/") && !cleanExpr.includes("Number(")) {
        cleanExpr = `Math.trunc(${cleanExpr})`;
      }
      return `let ${name} = ${cleanExpr};`;
    });

    // แปลง for (int i = ...; ...; ...)
    src = src.replace(/\bfor\s*\(\s*int\s+/g, "for (let ");

    // แปลง cout << ... << endl;
    src = src.replace(/\bcout\s*<<\s*([^;]+);/g, (_, chain: string) => {
      const parts = chain
        .split("<<")
        .map((p) => p.trim())
        .filter((p) => p && p !== "endl" && p !== '"\\n"' && p !== "'\\n'");
      if (parts.length === 0) return 'console.log("");';
      if (parts.length === 1) return `console.log(${parts[0]});`;
      return `console.log(${parts.join(" + ")});`;
    });

    src = src.replace(/\breturn\s+0\s*;/g, "return;");
    src += "\n__cppMain();";

    return runJavaScriptReal(src);
  } catch (err) {
    return {
      outputs: [],
      finalOutput: "",
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถรันโค้ด C++ นี้ได้",
    };
  }
}

/**
 * ตัวจำลองการรัน Java พื้นฐาน (รองรับ Class, Constructor, String.equals() vs ==, Array, System.out.println)
 */
function runJavaSimulated(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  try {
    let src = code.replace(/\r\n/g, "\n");

    // Helper class สำหรับจำลอง new String("...") ใน Java (ที่ == เทียบ Reference แต่ .equals() เทียบค่า)
    const javaStringHelper = `
class __JavaString {
  constructor(v) { this.__isJavaString = true; this.value = String(v); }
  equals(other) {
    const otherVal = other && other.__isJavaString ? other.value : String(other);
    return this.value === otherVal;
  }
  toString() { return this.value; }
}
`;

    // แปลง == และ != ใน Java ให้เทียบ Reference แบบ Strict (ไม่แปลง Object เป็น String อัตโนมัติแบบ JS ==)
    src = src.replace(/([^=!<>])={2}(?!=)/g, "$1===");
    src = src.replace(/!=(?!=)/g, "!==");

    // แปลง new String("...") -> new __JavaString("...")
    src = src.replace(/\bnew\s+String\s*\(/g, "new __JavaString(");

    // แปลงคลาสที่ไม่ใช่ public class Main (เช่น class Hero) ให้เป็น JS class
    src = src.replace(/\b(?:public\s+)?class\s+(?!Main\b)([A-Za-z_]\w*)\s*\{([\s\S]*?)\n\}/g, (_, clsName, body) => {
      let clsBody = body;
      // แปลง Constructor: ClsName(Type p) -> constructor(p)
      const ctorRe = new RegExp(`\\b${clsName}\\s*\\(([^)]*)\\)`, "g");
      clsBody = clsBody.replace(ctorRe, (_m: string, params: string) => {
        const cleanParams = params
          .split(",")
          .map((p: string) => p.trim().replace(/^[A-Za-z_\[\]]+\s+/, ""))
          .filter(Boolean)
          .join(", ");
        return `constructor(${cleanParams})`;
      });
      // ลบ field declarations ที่ไม่มีค่าเริ่มต้น เช่น `int hp;`
      clsBody = clsBody.replace(/^\s*(?:int|double|String|boolean)\s+[A-Za-z_]\w*\s*;\s*$/gm, "");
      // แปลงเมธอด `void name(Type p)` -> `name(p)`
      clsBody = clsBody.replace(
        /\b(?:public\s+|private\s+)?(?:void|int|double|String|boolean)\s+([A-Za-z_]\w*)\s*\(([^)]*)\)/g,
        (_m: string, mName: string, params: string) => {
          const cleanParams = params
            .split(",")
            .map((p: string) => p.trim().replace(/^[A-Za-z_\[\]]+\s+/, ""))
            .filter(Boolean)
            .join(", ");
          return `${mName}(${cleanParams})`;
        }
      );
      return `class ${clsName} {\n${clsBody}\n}`;
    });

    // ดึง public class Main { public static void main(String[] args) { ... } }
    src = src.replace(/\bpublic\s+class\s+Main\s*\{/, "");
    src = src.replace(
      /\bpublic\s+static\s+void\s+main\s*\([^)]*\)\s*\{/,
      "function __javaMain() {"
    );
    // ลบปีกกาปิดตัวสุดท้ายของ public class Main หากมี
    const lastBrace = src.lastIndexOf("}");
    if (lastBrace !== -1 && src.includes("function __javaMain()")) {
      src = src.slice(0, lastBrace) + src.slice(lastBrace + 1);
    }

    // แปลง array initialization `int[] hits = {30, 45, 50};` -> `let hits = [30, 45, 50];`
    src = src.replace(
      /\b(?:int|double|String|boolean)\s*\[\s*\]\s*([a-zA-Z_]\w*)\s*=\s*\{([^}]*)\}\s*;/g,
      "let $1 = [$2];"
    );

    // แปลงตัวแปร Java เป็น let
    src = src.replace(
      /\b(int|double|float|String|boolean)\s+([a-zA-Z_]\w*)\s*=/g,
      "let $2 ="
    );
    // แปลง Object var เช่น `Hero hero = new Hero(100);`
    src = src.replace(
      /\b([A-Z][a-zA-Z0-9_]*)\s+([a-zA-Z_]\w*)\s*=\s*new\s+/g,
      "let $2 = new "
    );
    // แปลง for (int i = ...
    src = src.replace(/\bfor\s*\(\s*int\s+/g, "for (let ");
    // แปลง System.out.println(...)
    src = src.replace(/\bSystem\.out\.println\s*\(/g, "console.log(");
    src = src.replace(/\bSystem\.out\.print\s*\(/g, "console.log(");

    const finalJs = `${javaStringHelper}\n${src}\n${
      src.includes("__javaMain") ? "__javaMain();" : ""
    }`;
    return runJavaScriptReal(finalJs);
  } catch (err) {
    return {
      outputs: [],
      finalOutput: "",
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถรันโค้ด Java นี้ได้",
    };
  }
}

function runHtmlCssSimulated(code: string): {
  outputs: string[];
  finalOutput: string;
  success: boolean;
  error?: string;
} {
  try {
    const withoutStylesOrScripts = code
      .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
      .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ");

    const textMatches = Array.from(
      withoutStylesOrScripts.matchAll(/>([^<]+)</g),
      (m) => m[1].replace(/\s+/g, " ").trim()
    ).filter(Boolean);

    const outputs =
      textMatches.length > 0
        ? [textMatches.join(" | ")]
        : [withoutStylesOrScripts.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()].filter(Boolean);

    return {
      outputs,
      finalOutput: outputs[0] ?? "",
      success: true,
    };
  } catch (err) {
    return {
      outputs: [],
      finalOutput: "",
      success: false,
      error: err instanceof Error ? err.message : "ไม่สามารถแสดงผลโค้ด HTML/CSS นี้ได้",
    };
  }
}
