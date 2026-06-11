# 🍲 薡王吃到飽

> 你說的對，但這就是——40 秒內任你吃啊 🥴

仿 ShotZombie 玩法的網頁手遊：四排食材佇列衝向你，瘋狂射擊最前面的那一個，手速越快分越高。統神火鍋店主題，附全球排行榜。

**線上玩：[https://dingwang650.vercel.app**](https://dingwang650.vercel.app/)（建議手機開啟）

## 玩法

- **40 秒**一局，開場倒數 3 秒
- 食材排成四排佇列，**永遠射「最靠近底線」的那一個**——按對排擊殺得分，整隊立刻往前遞補
- **按錯排僵直 0.8 秒**（並被統神嗆）
- 結算可送分上排行榜、分享戰績嗆朋友

### 菜單

| 目標 | 分數 | 說明 |
|------|------|------|
| 鴨血豆腐 | +20 | 出現率 35% |
| 白飯 | +15 | 30% |
| 冰水 | +25 | 20% |
| 油條 | +50 | 15%，最稀有 |
| 鴨血豆腐加倍 | +60 | 累積 10 殺後開始出現 |
| 白飯加倍 | +100 | 同上，頭獎 |

## 技術棧

- **Next.js 16**（App Router）+ TypeScript + Tailwind CSS
- **HTML5 Canvas** 遊戲渲染（requestAnimationFrame 迴圈）
- **Web Audio API** 音效（多變體隨機播放、GainNode 音量控制）
- **Supabase**（Postgres + RLS）排行榜
- **Vercel** 部署

## 本地開發

```bash
npm install
cp .env.local.example .env.local   # 填入 Supabase 設定（沒填遊戲照玩，排行榜停用）
npm run dev
```

### 環境變數

| 變數 | 說明 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案網址（`https://xxx.supabase.co`，不含路徑） |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | 新版金鑰（`sb_publishable_...`）；舊版 JWT 可改用 `NEXT_PUBLIC_SUPABASE_ANON_KEY` |

排行榜資料表：在 Supabase SQL Editor 執行 `supabase/schema.sql`。

## 專案結構

```
lib/game/
├── engine.ts     # 佇列制遊戲引擎（射擊判定、僵直、特殊目標機率）
├── targets.ts    # 食材定義（分數、權重）— 調平衡改這裡
├── quotes.ts     # 統神台詞（跑馬燈/僵直/連殺/結算）— 加梗改這裡
└── audio.ts      # AudioManager（預載、多變體隨機、音量）
components/
├── GameCanvas.tsx    # Canvas 渲染 + 暫停 + 倒數 + HUD
├── GameOverModal.tsx # 結算、送分、分享
├── Leaderboard.tsx   # 排行榜
└── SettingsModal.tsx # 音樂/音效設定
```

## 素材約定

換圖/換音檔不用改程式，照檔名放即可：

- **圖片** `public/foods/`：`normal_{blood_tofu|rice|water|stick}.png`、`bouns_{blood_tofu|rice}.png`、`main.png`（首頁主視覺）、`pot.png`（射擊鈕）
- **音效** `public/sounds/`：`{blood_tofu|rice|water}_{1|2}.mp3`、`stick_1.mp3`、`end_{1|2}.mp3`（結束）、`background.mp3`（BGM）

## 部署

```bash
npx vercel deploy --prod
```

環境變數需在 Vercel 後台（或 `vercel env add`）另外設定。
