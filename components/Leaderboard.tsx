"use client";

import { useEffect, useState } from "react";
import { supabase, fetchTopScores, LeaderboardEntry } from "@/lib/supabase";

export default function Leaderboard({ onClose }: { onClose: () => void }) {
  const [entries, setEntries] = useState<LeaderboardEntry[] | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    fetchTopScores()
      .then(setEntries)
      .catch(() => setError(true));
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="neon-box w-full max-w-sm rotate-1 rounded-2xl border-4 border-yellow-400 bg-stone-900 p-6 text-amber-50">
        <h2 className="neon-text mb-4 text-center text-2xl font-black text-yellow-300">
          🏆 不受鳥氣排行榜
        </h2>
        {!supabase ? (
          <p className="py-8 text-center text-stone-400">
            排行榜尚未設定
            <br />
            <span className="text-sm">（需設定 Supabase 環境變數）</span>
          </p>
        ) : error ? (
          <p className="py-8 text-center text-red-400">載入失敗，請稍後再試</p>
        ) : entries === null ? (
          <p className="py-8 text-center text-stone-500">載入中…</p>
        ) : entries.length === 0 ? (
          <p className="py-8 text-center text-stone-400">
            還沒有人上榜，快來搶頭香！
          </p>
        ) : (
          <ol className="max-h-80 space-y-1 overflow-y-auto">
            {entries.map((e, i) => (
              <li
                key={e.id}
                className="flex items-center justify-between rounded-lg border border-stone-700 px-3 py-2 odd:bg-stone-800"
              >
                <span className="flex items-center gap-2">
                  <span className="w-7 text-center font-black text-yellow-400">
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : i + 1}
                  </span>
                  <span className="truncate">{e.nickname}</span>
                </span>
                <span className="font-mono font-black text-yellow-300">
                  {e.score}
                </span>
              </li>
            ))}
          </ol>
        )}
        <button
          onClick={onClose}
          className="mt-4 w-full rounded-xl border-2 border-yellow-600 bg-stone-800 py-3 font-black text-yellow-400 active:scale-95"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
