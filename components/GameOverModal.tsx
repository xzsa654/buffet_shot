"use client";

import { useState } from "react";
import { supabase, submitScore } from "@/lib/supabase";
import { gameOverQuote } from "@/lib/game/quotes";

export default function GameOverModal({
  score,
  bestScore,
  isNewBest,
  onRestart,
  onHome,
  onShowLeaderboard,
}: {
  score: number;
  bestScore: number;
  isNewBest: boolean;
  onRestart: () => void;
  onHome: () => void;
  onShowLeaderboard: () => void;
}) {
  const [nickname, setNickname] = useState(
    () =>
      (typeof window !== "undefined" &&
        localStorage.getItem("hotpot-nickname")) ||
      ""
  );
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );
  const [copied, setCopied] = useState(false);

  const share = async () => {
    const text = `我在《鼎王吃到飽》40 秒內爽吃了 ${score} 分🔥 進來看就你最猛？來嗆我啊`;
    const url = window.location.href;
    if (navigator.share) {
      await navigator.share({ text, url }).catch(() => {});
    } else {
      await navigator.clipboard.writeText(`${text} ${url}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const submit = async () => {
    const name = nickname.trim();
    if (!name || status === "sending" || status === "sent") return;
    setStatus("sending");
    try {
      localStorage.setItem("hotpot-nickname", name);
      await submitScore(name.slice(0, 12), score);
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="neon-box w-full max-w-sm -rotate-1 rounded-2xl border-4 border-yellow-400 bg-stone-900 p-6 text-center text-amber-50">
        <h2 className="text-2xl font-black text-yellow-300">收攤了不好意思！貴賓</h2>
        {isNewBest && (
          <p className="neon-text mt-2 animate-bounce text-xl font-black text-red-400">
            👑 太神啦！！
          </p>
        )}
        <p className="neon-text my-4 text-6xl font-black text-yellow-300">
          {score}
        </p>
        <p className="text-sm font-bold text-amber-200/70">
          個人最高：{bestScore}
        </p>
        <p className="mb-4 mt-2 -rotate-1 text-lg font-black text-red-400">
          「{gameOverQuote(score)}」
        </p>

        {supabase && (
          <div className="mb-4">
            {status === "sent" ? (
              <p className="font-black text-yellow-400">✅ 成績已上榜！</p>
            ) : (
              <div className="flex gap-2">
                <input
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  maxLength={12}
                  placeholder="輸入暱稱"
                  className="min-w-0 flex-1 rounded-xl border-2 border-stone-600 bg-stone-800 px-3 py-2 text-amber-50 placeholder-stone-500"
                />
                <button
                  onClick={submit}
                  disabled={!nickname.trim() || status === "sending"}
                  className="rounded-xl border-2 border-yellow-400 bg-red-700 px-4 py-2 font-black text-yellow-300 disabled:opacity-40 active:scale-95"
                >
                  {status === "sending" ? "送出中…" : "上榜"}
                </button>
              </div>
            )}
            {status === "error" && (
              <p className="mt-2 text-sm text-red-500">送出失敗，請再試一次</p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <button
            onClick={onRestart}
            className="w-full rounded-xl border-2 border-yellow-400 bg-gradient-to-b from-red-500 to-red-700 py-3 text-lg font-black text-yellow-300 active:scale-95"
          >
            🔥 再來一把
          </button>
          <button
            onClick={share}
            className="w-full rounded-xl border-2 border-yellow-600 bg-stone-800 py-3 font-black text-yellow-400 active:scale-95"
          >
            {copied ? "✅ 已複製" : "📣 分享戰績"}
          </button>
          {supabase && (
            <button
              onClick={onShowLeaderboard}
              className="w-full rounded-xl border-2 border-yellow-600 bg-stone-800 py-3 font-black text-yellow-400 active:scale-95"
            >
              🏆 看排行榜
            </button>
          )}
          <button
            onClick={onHome}
            className="w-full rounded-xl border border-stone-600 bg-stone-800 py-3 font-bold text-stone-300 active:scale-95"
          >
            回首頁
          </button>
        </div>
      </div>
    </div>
  );
}
