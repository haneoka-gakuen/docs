---
title: Cassiopeia
description: haneoka.org 譜面播放器背後的音樂遊戲引擎——核心、外掛、Vue 元件與 Sonolus 轉換。
---

Cassiopeia 是 haneoka.org 譜面播放器和譜面總覽背後的音樂遊戲引擎。它的核心讀取譜面，以整數毫秒計時，判斷每次觸控屬於哪個音符，進行判定和計分，並以事件形式報告 Fever 段、技能和連擊。它本身不繪製任何內容，也不播放聲音——這些由外掛完成——因此同一個核心既能驅動網頁播放器、譜面總覽，也能驅動 Sonolus 關卡或原生應用。

核心同時有 TypeScript 和 Rust 兩種實現（後者用於 WebAssembly 以及 Android、iOS 原生宿主），相同輸入下兩者給出相同結果。

## 組成

| 軟體包 | 作用 |
| --- | --- |
| [`@haneoka/cassiopeia`](https://github.com/haneoka-gakuen/cassiopeia) | 核心、外掛執行時、WebAssembly 和原生繫結 |
| [Our Notes 外掛](https://github.com/haneoka-gakuen/cassiopeia-plugin-our-notes) | Our Notes 譜面、時間規則、皮膚和特效 |
| [Sekai 外掛](https://github.com/haneoka-gakuen/cassiopeia-plugin-sekai) | Project Sekai SUS 譜面的展示 |
| [Three.js 渲染器](https://github.com/haneoka-gakuen/cassiopeia-renderer-three) | 3D 舞臺、音符、特效和 HUD |
| [Web 宿主](https://github.com/haneoka-gakuen/cassiopeia-host-web) | 瀏覽器中的音訊時鐘、按鍵音和指標輸入 |
| [Vue 介面](https://github.com/haneoka-gakuen/cassiopeia-ui-vue) | `ChartPlayer` 和 `ChartOverview` 元件 |
| [Sonolus 轉換](https://github.com/haneoka-gakuen/cassiopeia-plugin-sonolus) | 譜面轉為 Sonolus 關卡資料和 USC |

## 用 Vue 做一個譜面播放器

```sh
pnpm add vue @haneoka/cassiopeia @haneoka/cassiopeia-plugin-our-notes \
  @haneoka/cassiopeia-renderer-three @haneoka/cassiopeia-host-web @haneoka/cassiopeia-ui-vue
```

```vue
<ChartPlayer :chart="chart" :assets="assets" audio-url="/songs/101.mp3" mode="watch" @ready="player.play()" ref="player" />
```

`mode="watch"` 自動演奏；`mode="play"` 讓讀者用觸控或滑鼠遊玩。播放器會發出判定、連擊和 Fever 事件，也可以改為跟隨你自己的時鐘而不是自身的音訊——編輯器或影片匯出就是這樣保持同步的。`ChartOverview` 在一張長畫布上繪製整首譜面，並標出連擊數、BPM 變化、Fever 段和技能視窗。

如果只想展示 haneoka.org 的譜面而不安裝任何東西，請使用 [Cassiopeia 嵌入](/zh-tw/embed/cassiopeia/)。

## 直接使用核心

```ts
import { CassiopeiaRuntime, createKernelPlugin, CASSIOPEIA_SESSION } from "@haneoka/cassiopeia/plugin";
import { createOurNotesPlugin, OUR_NOTES_RULES } from "@haneoka/cassiopeia-plugin-our-notes";

const runtime = new CassiopeiaRuntime([createKernelPlugin(), createOurNotesPlugin()]);
const chart = runtime.require(OUR_NOTES_RULES).parse(source);
const session = runtime.require(CASSIOPEIA_SESSION).create(chart, { mode: "play" });

session.on("judgement", (event) => console.log(event));
session.tap(lane, audioTimeMs);
const { score, combo } = session.update(audioTimeMs);
```

會話接受 `tap`、`release`、`flick` 和 `trace` 輸入（可附帶指標 ID），`update` 返回包含分數、連擊、血量和全連狀態的快照。這足以搭建你自己的遊戲、分數模擬器或譜面分析工具。

## Sonolus

Our Notes 譜面可以在 [Sonolus](https://sonolus.com) 應用中游玩。轉換外掛把譜面變成 Sonolus 關卡資料，[Sonolus 引擎](https://github.com/haneoka-gakuen/sonolus-our-notes)以 Our Notes 的判定和特效來播放。haneoka.org 執行著收錄全部譜面的 [Sonolus 伺服器](/zh-tw/sonolus/)。

## 參考

[Cassiopeia 倉庫](https://github.com/haneoka-gakuen/cassiopeia)的 README 介紹核心 API、外掛和原生繫結；各軟體包的 README 介紹各自的選項。
