import type { TargetType } from "./targets";

export type SoundKey = TargetType | "end";

// 同一食材有多個音檔時隨機播一個
const SOUND_SOURCES: Record<SoundKey, string[]> = {
  blood_tofu: ["/sounds/blood_tofu_1.mp3", "/sounds/blood_tofu_2.mp3"],
  rice: ["/sounds/rice_1.mp3", "/sounds/rice_2.mp3"],
  icewater: ["/sounds/water_1.mp3", "/sounds/water_2.mp3"],
  youtiao: ["/sounds/stick_1.mp3"],
  end: ["/sounds/end_1.mp3", "/sounds/end_2.mp3"],
};

export class AudioManager {
  muted = false;
  private ctx: AudioContext | null = null;
  private buffers = new Map<SoundKey, AudioBuffer[]>();
  private loading = false;

  async init() {
    if (this.ctx || this.loading || typeof window === "undefined") return;
    this.loading = true;
    this.ctx = new AudioContext();
    await Promise.all(
      (Object.entries(SOUND_SOURCES) as [SoundKey, string[]][]).map(
        async ([key, urls]) => {
          const bufs: AudioBuffer[] = [];
          for (const url of urls) {
            try {
              const res = await fetch(url);
              if (!res.ok) continue;
              const data = await res.arrayBuffer();
              bufs.push(await this.ctx!.decodeAudioData(data));
            } catch {
              continue;
            }
          }
          if (bufs.length > 0) this.buffers.set(key, bufs);
        }
      )
    );
  }

  async resume() {
    if (this.ctx && this.ctx.state === "suspended") await this.ctx.resume();
  }

  play(key: SoundKey) {
    if (this.muted) return;
    const bufs = this.buffers.get(key);
    if (!this.ctx || !bufs || bufs.length === 0) return;
    const src = this.ctx.createBufferSource();
    src.buffer = bufs[Math.floor(Math.random() * bufs.length)];
    src.connect(this.ctx.destination);
    src.start();
  }
}

export const audioManager = new AudioManager();
