# 頂尖賽車 TOP RACE / トップレース

可愛日式卡通風的 2D 偽 3D 賽車遊戲(OutRun 玩法),9:16 直版,純 HTML/CSS/JS(Canvas),無需任何建構工具。

## 執行

- 直接雙擊 `index.html` 也能玩(部分瀏覽器對音效/字型較嚴格,建議用本機伺服器)
- 本機伺服器(免安裝 Node/Python):

```
powershell -ExecutionPolicy Bypass -File tools\serve.ps1
```

然後開啟 http://localhost:8000
- 網址加 `?fast` 可縮短賽道(每段約 5 秒),方便測試結算與排行榜流程。

## 資料夾結構

| 路徑 | 說明 |
| --- | --- |
| `index.html` | 進入頁面 |
| `css/style.css` | 版面與縮放樣式 |
| `js/config.js` | 全域參數(速度、時間、計分、賽段主題) — **調整難度改這裡** |
| `js/road.js` | 賽道生成(直道/彎道/髮夾彎/坡道)、物件與敵車佈置、偽 3D 繪製 |
| `js/game.js` | 遊戲核心(物理、甩尾、氮氣、碰撞、AI 敵車、檢查點、計分、HUD) |
| `js/sprites.js` | 所有程式繪製的美術(賽車、熊貓、樹木、道具、障礙、敵車) |
| `js/background.js` | 遠/中/近三層視差背景(3 個賽段各一種風格) |
| `js/audio.js` | 程式合成的音樂與音效(音量 0~5) |
| `js/input.js` | 鍵盤 / Xbox 手把 / 觸控與陀螺儀 |
| `js/screens.js`, `js/ui.js` | 開場過場、主選單、賽事選擇、操作說明、排行榜(各賽事獨立)、設定、CREDIT、結算 |
| `js/history-data.js` | 「了解歷史」內文(中/日/英,複製自 game_live 專案) |
| `js/i18n.js` | 中/日/英語言字典(以中文原文為鍵,新增文字時在此補翻譯) |
| `assets/` | 外部素材(選用) |
| `builds/` | 封裝發佈版本(zip),**不進 git** |
| `tools/` | `serve.ps1` 本機伺服器、`build.ps1` 封裝腳本 |

## 賽事

每組賽事有 3 個賽段(白天 / 黃昏 / 夜晚),每段有獨立場景與音樂。定義在 `js/config.js` 的 `COURSES`。

| 賽事 | 場景 | 專屬障礙 |
| --- | --- | --- |
| 櫻花之旅 | 春日櫻花道 → 夕陽海岸 → 星夜祭典 | 大便(打滑)、石頭(翻車) |
| 雪之國度 | 雪原晴空 → 極光黃昏 → 雪夜聖誕 | 雪堆(陷入減速)、冰塊(翻車) |
| 糖果樂園 | 棉花糖晴空 → 巧克力黃昏 → 霓虹樂園夜 | 果凍(彈飛)、口香糖(黏住) |

新增賽事:在 `THEMES` 加場景配色、`js/background.js` 加三層背景、`js/road.js` 的 `SC` 加路邊物件、`js/audio.js` 的 `TRACKS` 加音樂,再於 `COURSES` 登記。

## 更換熊貓 / 賽車圖

把圖檔放進 `assets/images/` 即自動取代程式繪製的賽車(含騎士):

- `player_rear.png` — 遊戲中玩家賽車(背面視角)
- `player_front.png` — 主選單賽車(正面視角)

建議透明背景 PNG,底部貼齊圖檔下緣、車身水平置中。

## 操作

| 操作 | 鍵盤 | Xbox 手把 | 手機 |
| --- | --- | --- | --- |
| 左移 | ← / A | 類比左、十字左 | 虛擬鍵左、陀螺儀 |
| 右移 | → / D | 類比右、十字右 | 虛擬鍵右、陀螺儀 |
| 油門 | W | RT、A | 油門按鈕 |
| 剎車 | ALT | LT、B | 剎車按鈕 |
| 氮氣 | SPACE | X、Y | 氮氣按鈕 |
| 暫停 | ESC / P | Start | 右上暫停鈕 |

甩尾:同時按住油門與剎車,再按左/右。

## 版本控制與封裝

```
powershell -ExecutionPolicy Bypass -File tools\build.ps1 -Version 0.1.0
```

會產生 `builds\TopRace_v0.1.0.zip`(可上傳 itch.io 等平台)。`builds/` 內容不會被 git 追蹤。

## 線上排行榜(Firebase Firestore)

1. Firebase 主控台建立 Firestore Database。
2. 「規則」貼上 `firebase/firestore.rules` 的內容並發布。
3. 專案設定 → 一般 → 您的應用程式 → 新增網頁應用程式,把 SDK 設定貼進 `js/firebase-config.js`。
4. 集合 `leaderboard_0 / _1 / _2`(對應三個賽事)會在第一筆成績送出時自動建立。

`apiKey` 為公開資訊,安全性由 Firestore 規則把關;`firebase-config.js` 留空時自動使用本機排行榜。
