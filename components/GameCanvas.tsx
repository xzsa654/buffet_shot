"use client";

import { useEffect, useRef, useState } from "react";
import { GameEngine, LANES, VISIBLE_SLOTS, Item } from "@/lib/game/engine";
import { TARGETS } from "@/lib/game/targets";
import { audioManager } from "@/lib/game/audio";
import { STUN_QUOTES, STREAK_QUOTES, pick } from "@/lib/game/quotes";

interface Popup {
  lane: number;
  slot: number;
  text: string;
  bornAt: number;
}

// 油條圖之後放 /foods/normal_stick.png 即自動套用（缺檔時用 emoji）
const IMAGE_SOURCES: Record<string, string> = {
  blood_tofu: "/foods/normal_blood_tofu.png",
  rice: "/foods/normal_rice.png",
  icewater: "/foods/normal_water.png",
  youtiao: "/foods/normal_stick.png",
  blood_tofu_x2: "/foods/bouns_blood_tofu.png",
  rice_x2: "/foods/bouns_rice.png",
};

function itemKey(item: Item): string {
  return item.count > 1 ? `${item.type}_x${item.count}` : item.type;
}

export default function GameCanvas({
  onGameOver,
}: {
  onGameOver: (score: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine>(new GameEngine());
  const popupsRef = useRef<Popup[]>([]);
  const imagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
  // 每個食材目前的顯示格位（浮點），往實際隊列位置滑動 → 遞補動畫
  const renderSlotRef = useRef<Map<number, number>>(new Map());
  const stunQuoteRef = useRef(STUN_QUOTES[0]);
  const streakRef = useRef<{ text: string; bornAt: number } | null>(null);
  const countdownRef = useRef(3000);
  const [hud, setHud] = useState({
    score: 0,
    timeLeft: 40,
    stunned: false,
    counting: true,
  });

  useEffect(() => {
    for (const [key, src] of Object.entries(IMAGE_SOURCES)) {
      const img = new Image();
      img.onload = () => imagesRef.current.set(key, img);
      img.src = src;
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const engine = engineRef.current;
    let raf = 0;
    let last = performance.now();
    let done = false;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = (dt: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const laneW = w / LANES;
      ctx.clearRect(0, 0, w, h);

      // 跑道背景（深色火鍋店風）
      for (let l = 0; l < LANES; l++) {
        ctx.fillStyle = l % 2 === 0 ? "#1c1917" : "#292524";
        ctx.fillRect(l * laneW, 0, laneW, h);
        ctx.strokeStyle = "#b45309";
        ctx.strokeRect(l * laneW + 0.5, 0, laneW, h);
      }

      const slotH = (h - 30) / VISIBLE_SLOTS;
      const slotToPx = (slot: number) => h - 20 - slot * slotH - slotH / 2;

      // 遞補動畫：顯示格位以指數趨近實際格位（~100ms 滑完）
      const ease = 1 - Math.exp(-dt / 35);
      const slots = renderSlotRef.current;
      const liveIds = new Set<number>();
      engine.queue.forEach((item, idx) => {
        liveIds.add(item.id);
        const cur = slots.get(item.id);
        if (cur === undefined) {
          slots.set(item.id, idx);
        } else {
          slots.set(item.id, cur + (idx - cur) * ease);
        }
      });
      for (const id of slots.keys()) if (!liveIds.has(id)) slots.delete(id);

      // 食材：由遠到近畫
      for (let i = engine.queue.length - 1; i >= 0; i--) {
        const item = engine.queue[i];
        const slot = slots.get(item.id) ?? i;
        if (slot > VISIBLE_SLOTS + 0.5) continue;
        const cx = item.lane * laneW + laneW / 2;
        const cy = slotToPx(slot);
        // 越近越大，模擬原作近大遠小；特殊加成目標再放大
        const size =
          laneW * (0.62 - slot * 0.035) * (item.count > 1 ? 1.25 : 1);
        const isFront = i === 0;

        if (isFront) {
          ctx.fillStyle = "rgba(250, 204, 21, 0.5)";
          ctx.beginPath();
          ctx.arc(cx, cy, size * 0.72, 0, Math.PI * 2);
          ctx.fill();
        }

        // 特殊圖缺檔時退回一般圖 + ×N 標記，再缺才用 emoji
        const img =
          imagesRef.current.get(itemKey(item)) ??
          imagesRef.current.get(item.type);
        const needBadge =
          item.count > 1 && !imagesRef.current.has(itemKey(item));
        if (img) {
          const ar = img.width / img.height;
          const dw = ar >= 1 ? size : size * ar;
          const dh = ar >= 1 ? size / ar : size;
          ctx.drawImage(img, cx - dw / 2, cy - dh / 2, dw, dh);
        } else {
          ctx.font = `${size * (item.count > 1 ? 0.78 : 0.95)}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(TARGETS[item.type].emoji, cx, cy);
        }
        if (needBadge) {
          ctx.fillStyle = "#dc2626";
          ctx.font = `bold ${size * 0.4}px sans-serif`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(`×${item.count}`, cx + size * 0.45, cy - size * 0.42);
        }

        if (item.count > 1) {
          ctx.fillStyle = "#facc15";
          ctx.font = `bold ${laneW * 0.13}px sans-serif`;
          ctx.textAlign = "center";
          ctx.fillText(`+${item.points}`, cx, cy + size * 0.7);
        }
      }

      // 得分浮字
      popupsRef.current = popupsRef.current.filter(
        (p) => engine.elapsed - p.bornAt < 550
      );
      for (const p of popupsRef.current) {
        const age = (engine.elapsed - p.bornAt) / 550;
        ctx.save();
        ctx.globalAlpha = 1 - age;
        ctx.fillStyle = "#facc15";
        ctx.font = "bold 26px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(
          p.text,
          p.lane * laneW + laneW / 2,
          slotToPx(p.slot) - age * 45
        );
        ctx.restore();
      }

      // 連殺台詞橫幅
      const streak = streakRef.current;
      if (streak) {
        const age = (engine.elapsed - streak.bornAt) / 1400;
        if (age >= 1) {
          streakRef.current = null;
        } else {
          ctx.save();
          ctx.globalAlpha = age < 0.15 ? age / 0.15 : 1 - (age - 0.15) / 0.85;
          ctx.translate(w / 2, h * 0.22);
          ctx.rotate(-0.04);
          ctx.fillStyle = "#fde047";
          ctx.strokeStyle = "#b91c1c";
          ctx.lineWidth = 5;
          ctx.font = "900 26px sans-serif";
          ctx.textAlign = "center";
          ctx.strokeText(streak.text, 0, 0);
          ctx.fillText(streak.text, 0, 0);
          ctx.restore();
        }
      }

      // 僵直效果
      if (engine.stunned) {
        ctx.fillStyle = "rgba(220, 38, 38, 0.25)";
        ctx.fillRect(0, 0, w, h);
        ctx.save();
        ctx.translate(w / 2, h / 2);
        ctx.rotate(-0.06);
        ctx.fillStyle = "#fde047";
        ctx.strokeStyle = "#dc2626";
        ctx.lineWidth = 6;
        ctx.font = "900 40px sans-serif";
        ctx.textAlign = "center";
        ctx.strokeText(stunQuoteRef.current, 0, 0);
        ctx.fillText(stunQuoteRef.current, 0, 0);
        ctx.restore();
      }
    };

    const loop = (now: number) => {
      const dt = Math.min(100, now - last);
      last = now;

      // 開場倒數：隊伍靜止，數完才開始
      if (countdownRef.current > 0) {
        countdownRef.current -= dt;
        draw(dt);
        if (countdownRef.current > 0) {
          const n = Math.ceil(countdownRef.current / 1000);
          const w = canvas.clientWidth;
          const h = canvas.clientHeight;
          ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
          ctx.fillRect(0, 0, w, h);
          ctx.save();
          ctx.fillStyle = "#fde047";
          ctx.strokeStyle = "#dc2626";
          ctx.lineWidth = 8;
          ctx.font = "900 120px sans-serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.strokeText(String(n), w / 2, h / 2);
          ctx.fillText(String(n), w / 2, h / 2);
          ctx.restore();
        } else {
          streakRef.current = { text: "開吃啦！！", bornAt: 0 };
        }
        setHud({ score: 0, timeLeft: 40, stunned: false, counting: true });
        raf = requestAnimationFrame(loop);
        return;
      }

      engine.update(dt);
      draw(dt);
      setHud({
        score: engine.score,
        timeLeft: Math.ceil(engine.timeLeft / 1000),
        stunned: engine.stunned,
        counting: false,
      });
      if (engine.over && !done) {
        done = true;
        audioManager.play("end");
        onGameOver(engine.score);
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [onGameOver]);

  const shoot = (lane: number) => {
    if (countdownRef.current > 0) return;
    const engine = engineRef.current;
    const result = engine.shoot(lane);
    if (!result) return;
    if (result.hit) {
      audioManager.play(result.item.type);
      popupsRef.current.push({
        lane: result.item.lane,
        slot: 0,
        text: `+${result.item.points}`,
        bornAt: engine.elapsed,
      });
      if (engine.kills % 20 === 0) {
        streakRef.current = {
          text: pick(STREAK_QUOTES),
          bornAt: engine.elapsed,
        };
      }
    } else {
      stunQuoteRef.current = pick(STUN_QUOTES);
      if (navigator.vibrate) navigator.vibrate(80);
    }
  };

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center justify-between border-b-2 border-red-800 bg-black px-4 py-2 text-lg font-black">
        <span className="text-yellow-400">💰 {hud.score}</span>
        <span
          className={
            hud.timeLeft <= 10 ? "neon-text text-red-500" : "text-amber-100"
          }
        >
          ⏱ {hud.timeLeft}s
        </span>
      </div>
      <div className="relative flex-1 touch-none select-none">
        <canvas ref={canvasRef} className="absolute inset-0" />
      </div>
      <div className="grid grid-cols-4 gap-1 bg-black p-1 pb-3">
        {[0, 1, 2, 3].map((lane) => (
          <button
            key={lane}
            onPointerDown={(e) => {
              e.preventDefault();
              shoot(lane);
            }}
            className={`overflow-hidden rounded-xl border-2 transition-all ${
              hud.stunned || hud.counting
                ? "border-stone-600 opacity-40 grayscale"
                : "border-yellow-400 active:scale-95 active:border-red-500"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/foods/pot.png"
              alt="射擊"
              className="h-16 w-full object-cover"
              draggable={false}
            />
          </button>
        ))}
      </div>
    </div>
  );
}
