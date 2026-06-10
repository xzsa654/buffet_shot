export type TargetType = "blood_tofu" | "rice" | "icewater" | "youtiao";

export interface TargetDef {
  type: TargetType;
  label: string;
  emoji: string;
  points: number;
  weight: number;
}

export const TARGETS: Record<TargetType, TargetDef> = {
  blood_tofu: {
    type: "blood_tofu",
    label: "鴨血豆腐",
    emoji: "🟥",
    points: 20,
    weight: 35,
  },
  rice: {
    type: "rice",
    label: "白飯",
    emoji: "🍚",
    points: 15,
    weight: 30,
  },
  icewater: {
    type: "icewater",
    label: "冰水",
    emoji: "🧊",
    points: 25,
    weight: 20,
  },
  youtiao: {
    type: "youtiao",
    label: "油條",
    emoji: "🥖",
    points: 50,
    weight: 15,
  },
};

// 特殊加成目標：擊殺數達門檻後開始出現，機率隨擊殺數上升
export interface SpecialDef {
  key: string;
  type: TargetType;
  label: string;
  count: number;
  points: number;
  weight: number;
}

export const SPECIALS: SpecialDef[] = [
  {
    key: "blood_tofu_x2",
    type: "blood_tofu",
    label: "鴨血豆腐加倍",
    count: 2,
    points: 60,
    weight: 60,
  },
  {
    key: "rice_x2",
    type: "rice",
    label: "白飯加倍",
    count: 2,
    points: 100,
    weight: 40,
  },
];

export function randomTargetType(): TargetType {
  const defs = Object.values(TARGETS);
  const total = defs.reduce((s, d) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const d of defs) {
    r -= d.weight;
    if (r <= 0) return d.type;
  }
  return "blood_tofu";
}

export function randomSpecial(): SpecialDef {
  const total = SPECIALS.reduce((s, d) => s + d.weight, 0);
  let r = Math.random() * total;
  for (const d of SPECIALS) {
    r -= d.weight;
    if (r <= 0) return d;
  }
  return SPECIALS[0];
}
