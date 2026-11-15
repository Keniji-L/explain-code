import { PixelSpriteDef, SLIME_SPRITE, SKELETON_SPRITE, GOBLIN_SPRITE, BOSS_SPRITE } from "./sprites";

export type MonsterType = "slime" | "skeleton" | "goblin" | "boss";

export interface MonsterDef {
  type: MonsterType;
  name: string;
  nameEn?: string;
  title: string;
  titleEn?: string;
  maxHp: number;
  xpReward: number;
  coinReward: number;
  sprite: PixelSpriteDef;
  description: string;
  descriptionEn?: string;
}

export const MONSTERS: Record<MonsterType, MonsterDef> = {
  slime: {
    type: "slime",
    name: "สไลม์โค้ด (Code Slime)",
    nameEn: "Code Slime",
    title: "มอนสเตอร์ระดับพื้นฐาน",
    titleEn: "Basic Monster",
    maxHp: 1,
    xpReward: 25,
    coinReward: 10,
    sprite: SLIME_SPRITE,
    description: "มอนสเตอร์ตัวหยุ่นๆ ชอบกินค่า null และตัวแปรที่ไม่ได้ประกาศ",
    descriptionEn: "A squishy slime that loves devouring null values and undeclared variables.",
  },
  skeleton: {
    type: "skeleton",
    name: "โครงกระดูกโค้ดตกค้าง (Dead Code Skeleton)",
    nameEn: "Dead Code Skeleton",
    title: "นักรบโบราณ",
    titleEn: "Ancient Warrior",
    maxHp: 2,
    xpReward: 40,
    coinReward: 20,
    sprite: SKELETON_SPRITE,
    description: "ฟื้นคืนชีพจากโค้ดเก่าที่ไม่เคยถูกเรียกใช้งาน (Dead Code)",
    descriptionEn: "Reanimated from old, unreachable code (Dead Code) that is never called.",
  },
  goblin: {
    type: "goblin",
    name: "ก็อบลินลักบั๊ก (Bug Thief Goblin)",
    nameEn: "Bug Thief Goblin",
    title: "จอมป่วนแห่งเขาวงกต",
    titleEn: "Labyrinth Trickster",
    maxHp: 2,
    xpReward: 50,
    coinReward: 25,
    sprite: GOBLIN_SPRITE,
    description: "ว่องไวและเจ้าเล่ห์ ชอบแอบสลับเครื่องหมาย = กับ == ในเงื่อนไข if",
    descriptionEn: "Quick and cunning, it loves swapping = with == inside if conditions.",
  },
  boss: {
    type: "boss",
    name: "จอมมารลูปไม่สิ้นสุด (Infinite Loop Overlord)",
    nameEn: "Infinite Loop Overlord",
    title: "บอสใหญ่ประจำดันเจี้ยน",
    titleEn: "Dungeon Final Boss",
    maxHp: 3,
    xpReward: 150,
    coinReward: 100,
    sprite: BOSS_SPRITE,
    description: "จอมมารผู้ทรงพลังที่ดูดกลืนหน่วยความจำของระบบด้วย while (true) ไม่มีที่สิ้นสุด",
    descriptionEn: "A mighty overlord that drains system memory with an endless while (true) loop.",
  },
};

export function getMonsterDef(type: MonsterType): MonsterDef {
  return MONSTERS[type] || MONSTERS.slime;
}

export function getLocalizedMonster(
  monster: MonsterDef,
  uiLang: "th" | "en"
): { name: string; title: string; description: string } {
  return {
    name: uiLang === "en" ? monster.nameEn || monster.name : monster.name,
    title: uiLang === "en" ? monster.titleEn || monster.title : monster.title,
    description:
      uiLang === "en" ? monster.descriptionEn || monster.description : monster.description,
  };
}
