"use client";

export default function SettingsModal({
  bgmMuted,
  sfxMuted,
  bgmVol,
  sfxVol,
  onToggleBgm,
  onToggleSfx,
  onBgmVol,
  onSfxVol,
  onClose,
}: {
  bgmMuted: boolean;
  sfxMuted: boolean;
  bgmVol: number;
  sfxVol: number;
  onToggleBgm: () => void;
  onToggleSfx: () => void;
  onBgmVol: (v: number) => void;
  onSfxVol: (v: number) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="neon-box w-full max-w-sm rounded-2xl border-4 border-yellow-400 bg-stone-900 p-6 text-amber-50">
        <h2 className="neon-text mb-5 text-center text-2xl font-black text-yellow-300">
          ⚙️ 設定
        </h2>

        <div className="space-y-4">
          <div className="rounded-xl border border-stone-700 bg-stone-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-black">🎵 背景音樂</span>
              <button
                onClick={onToggleBgm}
                className={`rounded-full border-2 px-4 py-1 text-sm font-black active:scale-95 ${
                  bgmMuted
                    ? "border-stone-600 text-stone-500"
                    : "border-yellow-400 text-yellow-300"
                }`}
              >
                {bgmMuted ? "已關閉" : "開啟中"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={bgmVol}
              disabled={bgmMuted}
              onChange={(e) => onBgmVol(Number(e.target.value))}
              className="h-2 w-full accent-yellow-400 disabled:opacity-30"
            />
          </div>

          <div className="rounded-xl border border-stone-700 bg-stone-800 p-4">
            <div className="mb-2 flex items-center justify-between">
              <span className="font-black">🔊 遊戲音效</span>
              <button
                onClick={onToggleSfx}
                className={`rounded-full border-2 px-4 py-1 text-sm font-black active:scale-95 ${
                  sfxMuted
                    ? "border-stone-600 text-stone-500"
                    : "border-yellow-400 text-yellow-300"
                }`}
              >
                {sfxMuted ? "已關閉" : "開啟中"}
              </button>
            </div>
            <input
              type="range"
              min={0}
              max={1}
              step={0.05}
              value={sfxVol}
              disabled={sfxMuted}
              onChange={(e) => onSfxVol(Number(e.target.value))}
              className="h-2 w-full accent-yellow-400 disabled:opacity-30"
            />
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-xl border-2 border-yellow-600 bg-stone-800 py-3 font-black text-yellow-400 active:scale-95"
        >
          關閉
        </button>
      </div>
    </div>
  );
}
