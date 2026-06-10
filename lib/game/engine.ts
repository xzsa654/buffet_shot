import {
  TARGETS,
  TargetType,
  randomTargetType,
  randomSpecial,
} from "./targets";

export const LANES = 4;
export const GAME_DURATION = 40_000;
export const VISIBLE_SLOTS = 7; // 畫面同時可見的隊列格數

const QUEUE_AHEAD = 14;
const STUN_DURATION = 800;
const SPECIAL_KILL_THRESHOLD = 10;
const SPECIAL_BASE_CHANCE = 0.05;
const SPECIAL_CHANCE_PER_KILL = 0.003;
const SPECIAL_MAX_CHANCE = 0.22;

export interface Item {
  id: number;
  lane: number;
  type: TargetType;
  count: number; // 1 = 一般，2/3 = 特殊加成目標
  points: number;
}

export type ShootResult =
  | { hit: true; item: Item }
  | { hit: false }; // 按錯排 → 僵直

// 佇列制（忠於原作）：食材開局就排定位置，擊殺最前者整隊往前遞補，
// 節奏由玩家手速決定。
export class GameEngine {
  queue: Item[] = [];
  score = 0;
  kills = 0;
  elapsed = 0;
  over = false;
  stunnedUntil = 0;
  private nextId = 1;

  constructor() {
    while (this.queue.length < QUEUE_AHEAD) this.append();
  }

  get timeLeft(): number {
    return Math.max(0, GAME_DURATION - this.elapsed);
  }

  get stunned(): boolean {
    return this.elapsed < this.stunnedUntil;
  }

  get front(): Item | null {
    return this.queue[0] ?? null;
  }

  update(dt: number) {
    if (this.over) return;
    this.elapsed += dt;
    if (this.elapsed >= GAME_DURATION) {
      this.over = true;
      return;
    }
    while (this.queue.length < QUEUE_AHEAD) this.append();
  }

  private append() {
    const lane = Math.floor(Math.random() * LANES);
    const specialChance =
      this.kills >= SPECIAL_KILL_THRESHOLD
        ? Math.min(
            SPECIAL_MAX_CHANCE,
            SPECIAL_BASE_CHANCE + this.kills * SPECIAL_CHANCE_PER_KILL
          )
        : 0;

    if (Math.random() < specialChance) {
      const sp = randomSpecial();
      this.queue.push({
        id: this.nextId++,
        lane,
        type: sp.type,
        count: sp.count,
        points: sp.points,
      });
    } else {
      const type = randomTargetType();
      this.queue.push({
        id: this.nextId++,
        lane,
        type,
        count: 1,
        points: TARGETS[type].points,
      });
    }
  }

  shoot(lane: number): ShootResult | null {
    if (this.over || this.stunned) return null;
    const front = this.front;
    if (!front) return null;
    if (front.lane === lane) {
      this.queue.shift();
      this.score += front.points;
      this.kills += 1;
      return { hit: true, item: front };
    }
    this.stunnedUntil = this.elapsed + STUN_DURATION;
    return { hit: false };
  }
}
