"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameCanvas from "@/components/GameCanvas";
import GameOverModal from "@/components/GameOverModal";
import Leaderboard from "@/components/Leaderboard";
import { TARGETS, SPECIALS } from "@/lib/game/targets";
import { audioManager } from "@/lib/game/audio";
import { MARQUEE_TEXT } from "@/lib/game/quotes";

const FOOD_IMAGES: Record<string, string | undefined> = {
  blood_tofu: "/foods/normal_blood_tofu.png",
  rice: "/foods/normal_rice.png",
  icewater: "/foods/normal_water.png",
  youtiao: "/foods/normal_stick.png",
  blood_tofu_x2: "/foods/bouns_blood_tofu.png",
  rice_x2: "/foods/bouns_rice.png",
};

type Screen = "menu" | "playing" | "gameover";

export default function Home() {
  const [screen, setScreen] = useState<Screen>("menu");
  const [gameKey, setGameKey] = useState(0);
  const [finalScore, setFinalScore] = useState(0);
  const [showBoard, setShowBoard] = useState(false);
  const [bgmMuted, setBgmMuted] = useState(false);
  const [sfxMuted, setSfxMuted] = useState(false);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const bgm = localStorage.getItem("hotpot-muted-bgm") === "1";
    const sfx = localStorage.getItem("hotpot-muted-sfx") === "1";
    setBgmMuted(bgm);
    setSfxMuted(sfx);
    audioManager.muted = sfx;
  }, []);

  const toggleBgm = () => {
    setBgmMuted((m) => {
      const next = !m;
      if (bgmRef.current) bgmRef.current.muted = next;
      localStorage.setItem("hotpot-muted-bgm", next ? "1" : "0");
      return next;
    });
  };

  const toggleSfx = () => {
    setSfxMuted((m) => {
      const next = !m;
      audioManager.muted = next;
      localStorage.setItem("hotpot-muted-sfx", next ? "1" : "0");
      return next;
    });
  };

  // 主頁背景音樂：嘗試 autoplay，被瀏覽器擋下就等首次互動再播
  useEffect(() => {
    const bgm = new Audio("/sounds/background.mp3");
    bgm.loop = true;
    bgm.volume = 0.6;
    bgm.muted = localStorage.getItem("hotpot-muted-bgm") === "1";
    bgmRef.current = bgm;
    const tryPlay = () => bgm.play().catch(() => {});
    tryPlay();
    const onFirstTouch = () => {
      if (bgm.paused && bgmRef.current === bgm) tryPlay();
    };
    window.addEventListener("pointerdown", onFirstTouch, { once: true });
    return () => {
      window.removeEventListener("pointerdown", onFirstTouch);
      bgm.pause();
      bgmRef.current = null;
    };
  }, []);

  // 進遊戲暫停 BGM，回主頁/結算繼續
  useEffect(() => {
    const bgm = bgmRef.current;
    if (!bgm) return;
    if (screen === "playing") bgm.pause();
    else bgm.play().catch(() => {});
  }, [screen]);

  const startGame = async () => {
    await audioManager.init();
    await audioManager.resume();
    setGameKey((k) => k + 1);
    setScreen("playing");
  };

  const handleGameOver = useCallback((score: number) => {
    setFinalScore(score);
    setScreen("gameover");
  }, []);

  return (
    <main className="relative mx-auto flex h-full w-full max-w-md flex-col">
      {screen === "menu" && (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 p-5">
          <div className="w-full overflow-hidden rounded border-2 border-red-600 bg-black py-1 text-sm font-bold text-yellow-300">
            <span className="marquee">{MARQUEE_TEXT}</span>
          </div>

          <div className="text-center">
            <div className="relative mx-auto w-56">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/foods/main.png"
                alt="鼎王全餐"
                className="neon-box w-full rounded-2xl border-2 border-red-700"
              />
              <div className="absolute -right-13 top-1/2 flex -translate-y-1/2 flex-col gap-2">
                <button
                  onClick={toggleBgm}
                  aria-label={bgmMuted ? "開啟音樂" : "關閉音樂"}
                  className={`flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 bg-black/70 leading-none active:scale-90 ${
                    bgmMuted
                      ? "border-stone-600 opacity-50 grayscale"
                      : "border-yellow-600"
                  }`}
                >
                  <span className="text-base">{bgmMuted ? "🔇" : "🎵"}</span>
                  <span className="text-[9px] font-bold text-amber-200">
                    音樂
                  </span>
                </button>
                <button
                  onClick={toggleSfx}
                  aria-label={sfxMuted ? "開啟音效" : "關閉音效"}
                  className={`flex h-11 w-11 flex-col items-center justify-center rounded-full border-2 bg-black/70 leading-none active:scale-90 ${
                    sfxMuted
                      ? "border-stone-600 opacity-50 grayscale"
                      : "border-yellow-600"
                  }`}
                >
                  <span className="text-base">{sfxMuted ? "🔇" : "🔊"}</span>
                  <span className="text-[9px] font-bold text-amber-200">
                    音效
                  </span>
                </button>
              </div>
            </div>
            <h1 className="neon-text flicker mt-3 -rotate-2 text-5xl font-black tracking-widest text-yellow-300">
              鼎王吃到飽
            </h1>
            <p className="mt-1 rotate-1 text-lg font-black text-red-500">
              ～ 你說的對，但這就是 ～
            </p>
            <p className="mt-2 text-sm text-amber-200/80">
              40 秒內任你吃啊
            </p>
          </div>

          <div className="neon-box w-full space-y-2 rounded-xl border-2 border-yellow-500 bg-stone-900 p-3 text-sm">
            <p className="text-center text-xs font-bold tracking-widest text-yellow-400">
              ✦ 本店菜單 ✦
            </p>
            <div className="grid grid-cols-2 gap-2">
              {Object.values(TARGETS).map((t) => (
                <div
                  key={t.type}
                  className="flex items-center justify-between rounded-lg border border-stone-700 bg-stone-800 px-3 py-2"
                >
                  <span className="flex items-center gap-1.5">
                    {FOOD_IMAGES[t.type] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={FOOD_IMAGES[t.type]}
                        alt={t.label}
                        className="h-7 w-7 object-contain"
                      />
                    ) : (
                      <span className="text-xl">{t.emoji}</span>
                    )}
                    {t.label}
                  </span>
                  <span className="font-black text-yellow-400">
                    +{t.points}
                  </span>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {SPECIALS.map((s) => (
                <div
                  key={s.key}
                  className="flex items-center justify-between rounded-lg border border-red-500 bg-red-950 px-3 py-2"
                >
                  <span className="flex items-center gap-1.5">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={FOOD_IMAGES[s.key]}
                      alt={s.label}
                      className="h-7 w-7 object-contain"
                    />
                    {s.label}
                  </span>
                  <span className="font-black text-red-400">+{s.points}</span>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-amber-200/60">
              白飯無限盛啊🍚 鼎王的水都不用錢的🫪
            </p>
          </div>

          <div className="flex w-full flex-col gap-3">
            <button
              onClick={startGame}
              className="neon-box w-full -rotate-1 rounded-2xl border-4 border-yellow-400 bg-gradient-to-b from-red-500 to-red-700 py-4 text-2xl font-black tracking-widest text-yellow-300 active:scale-95"
            >
              🔥 點個50塊油條開吃 🔥
            </button>
            <button
              onClick={() => setShowBoard(true)}
              className="w-full rounded-2xl border-2 border-yellow-600 bg-stone-900 py-3 font-black text-yellow-400 active:scale-95"
            >
              🏆 全球不受鳥氣排行榜
            </button>
          </div>
        </div>
      )}

      {(screen === "playing" || screen === "gameover") && (
        <GameCanvas key={gameKey} onGameOver={handleGameOver} />
      )}

      {screen === "gameover" && (
        <GameOverModal
          score={finalScore}
          onRestart={startGame}
          onHome={() => setScreen("menu")}
          onShowLeaderboard={() => setShowBoard(true)}
        />
      )}

      {showBoard && <Leaderboard onClose={() => setShowBoard(false)} />}
    </main>
  );
}
