# คู่มือจุดเสี่ยงโค้ดที่ AI เขียนผิดบ่อย (AI Code Pitfalls & Hallucinations across 7 Languages)

เอกสารนี้ช่วยให้ LangMind AI Agent สามารถชี้จุดเสี่ยง (Pitfalls) และออกแบบข้อสอบจับบั๊ก AI (Topic 7 / Modify Challenge) ได้อย่างแม่นยำทั้ง 7 ภาษา

## 1. JavaScript (`javascript`)
- **Off-by-one Loop (`<=` vs `<`):** ลูป `for (let i = 0; i <= arr.length; i++)` ทำให้อ่านเกินขอบเขตได้ค่า `undefined` (`NaN` เมื่อบวกเลข) — โยงช่อง **E2, E4**
- **`=` vs `===` และ Coercion (`==`):** การเทียบ `"5" == 5` เป็น `true` หรือเผลอใช้ `=` ใน `if` — โยงช่อง **T1, T2**
- **Comparison Sign Flipped (`<` แทน `>`):** โค้ดหาค่าสูงสุด (`findMax`) แต่ AI เขียน `if (scores[i] < max)` ทำให้ได้ค่าต่ำสุดแทน — โยงช่อง **F4, E2**

## 2. TypeScript (`typescript`)
- **Union Type & Nullability Ignored:** เรียกใช้ `.length` หรือ `.toFixed()` บนค่าที่อาจเป็น `undefined | null` — โยงช่อง **T1, T3**
- **`async` Function Missing `await`:** คืนค่า `Promise<Data>` แทน `Data` จริง ทำให้ property กลายเป็น `undefined` — โยงช่อง **E3, F4**

## 3. Python (`python`)
- **Indentation Block Error:** บรรทัด `return` ถูกย่อหน้าเข้าไปอยู่ใน `for` ทำให้ฟังก์ชันหยุดทำงานตั้งแต่รอบแรก — โยงช่อง **T2, E2**
- **`range(start, stop)` Excludes `stop`:** นักเรียนและบาง prompt เข้าใจผิดว่า `range(1, 3)` รวม `3` ด้วย — โยงช่อง **E2**
- **Mutable Default Argument (`def add_item(items=[]):`):** แชร์ลิสต์เดิมข้ามการเรียกฟังก์ชัน — โยงช่อง **E3, F3**

## 4. Java (`java`)
- **String Equality with `==` instead of `.equals()`:** เทียบอ้างอิงหน่วยความจำแทนเนื้อหาข้อความ — โยงช่อง **T1, E1**
- **Integer Division Truncation:** `int avg = total / count;` ตัดเศษทศนิยมทิ้งก่อนแปลงเป็น `double` — โยงช่อง **E1, F4**

## 5. C / C++ (`cpp`)
- **Out-of-Bounds Vector/Array Access & Uninitialized Variable:** ไม่กำหนด `int total = 0;` ก่อนสะสมค่าในลูป ทำให้ได้ค่าขยะ — โยงช่อง **E1, E2**
- **Pass by Value vs Pass by Reference (`&`):** ฟังก์ชัน `swap(int a, int b)` ที่ลืมใส่ `&` จะไม่เปลี่ยนค่าตัวแปรต้นทาง — โยงช่อง **E3, T3**

## 6. SQL (`sql`)
- **`WHERE` vs `HAVING` with Aggregates:** ใส่เงื่อนไข `WHERE SUM(amount) >= 100` หลัง `GROUP BY` (ผิดไวยากรณ์ SQL) ต้องย้ายไปใช้ `HAVING` — โยงช่อง **T2, F2**
- **`INNER JOIN` Drops Unmatched Rows:** ลืมใช้ `LEFT JOIN` เมื่อต้องการแสดงนักเรียนที่ยังไม่เคยส่งงาน — โยงช่อง **F3, F4**

## 7. HTML / CSS (`html`)
- **Missing Form Semantics / Accessibility Labels:** ใช้ `<div>` แทน `<button type="button">` หรือขาด `for`/`id` บน `<label>` — โยงช่อง **T1, F1**
- **Horizontal Overflow on Mobile:** กำหนด `width` คงที่โดยไม่ใช้ `min-w-0` / `max-w-full` ทำให้หน้าจอมือถือเลื่อนซ้าย-ขวาได้ — โยงช่อง **T4, F4**
