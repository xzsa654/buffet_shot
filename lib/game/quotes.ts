// 統神經典台詞 — 想加新梗直接改這裡
export const MARQUEE_TEXT =
  "🍲 薡王一桌低消650 任你吃啊🥴 ★ 一個人他媽的麻辣鍋150塊啊🍲 ★ 薡王的水都不用錢的🫪 ★ 我都 欸冰水一壺💧 ★ 喝完一壺 冰水一壺🧊 ★ 白飯無限盛啊🍚 ★ 進來看就你最猛 🔥";

export const STUN_QUOTES = [
  "不要那麼火爆！",
  "管好你自己！",
  "又舔！又舔！",
  "那我也要睡啦！",
];

// 每連殺 20 隻噴一句
export const STREAK_QUOTES = [
  "豆腐鴨血豆腐鴨血豆腐鴨血",
  "冰水冰水冰水冰水🧊💧",
  "白飯無限盛啊🍚🍚",
  "喝完一壺 冰水一壺🧊",
  "薡王的水都不用錢的🫪",
  "點個50塊油條任你吃啊🥖",
];

export function gameOverQuote(score: number): string {
  if (score < 500) return "就吃飽了啊🫃🏻";
  if (score < 1500) return "一個人他媽的麻辣鍋150塊啊🍲";
  if (score < 3000) return "白飯無限盛啊🍚🍚";
  return "薡王一桌低消650 任你吃啊🥴";
}

export function pick(arr: string[]): string {
  return arr[Math.floor(Math.random() * arr.length)];
}
