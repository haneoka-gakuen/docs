---
title: Vega
description: 在網頁和原生應用中播放視覺小說——引擎、外掛，以及如何把播放器放到頁面上。
---

Vega 是 haneoka.org 劇情播放器背後的視覺小說引擎。它讀取一個故事——由對話、角色、背景、鏡頭、聲音、選項和聊天等命令組成的列表——並把它變成狀態：說了什麼、誰在舞臺上、正在播放什麼。你看到和聽到的一切都來自外掛，因此同一個引擎既能執行帶 Live2D 角色的完整 3D 舞臺，也能在手機上執行輕量的 2D 舞臺，或者完全不需要 WebGL 的 DOM 回退方案。

## 播放器由什麼組成

| 部分 | 官方外掛 | 不安裝時 |
| --- | --- | --- |
| 渲染器 | [Three.js](https://github.com/haneoka-gakuen/vega-renderer-three)、[Pixi](https://github.com/haneoka-gakuen/vega-renderer-pixi) | 用 DOM 顯示背景、靜幀和立繪。 |
| 劇情介面 | [Portable UI](https://github.com/haneoka-gakuen/vega-ui-portable) | 使用你自己的 `dialogue` 介面插槽。 |
| 外殼 | [預設外殼](https://github.com/haneoka-gakuen/vega-shell-default)：標題、存檔、設定、回想、畫廊、流程圖 | 故事直接開始播放。 |
| 主題 | [Haneoka](https://github.com/haneoka-gakuen/vega-theme-haneoka)、Portable、WebGAL | 無樣式介面。 |
| 角色 | [Cubism（Live2D）](https://github.com/haneoka-gakuen/vega-plugin-cubism)、[Spine](https://github.com/haneoka-gakuen/vega-plugin-spine)、[組合模型](https://github.com/haneoka-gakuen/vega-plugin-composite) | 只能顯示靜態圖片。 |
| 文字 | [富文字](https://github.com/haneoka-gakuen/vega-plugin-richtext)，以及 Markdown、BBCode、HTML、LaTeX、Typst | 純文字。 |
| 其他 | [結局畫面](https://github.com/haneoka-gakuen/vega-plugin-ending)、[WebGAL 相容](https://github.com/haneoka-gakuen/vega-plugin-webgal)、[Haneoka 宿主](https://github.com/haneoka-gakuen/vega-plugin-haneoka) | |

[Vega Full Preset](https://github.com/haneoka-gakuen/vega-preset-full) 一次呼叫就能組裝好一套合適的組合。

## 把播放器放到頁面上

```sh
pnpm add @haneoka/vega @haneoka/vega-preset-full three@0.184
```

```ts
import { VegaEngine } from "@haneoka/vega/engine";
import createVegaFullPreset from "@haneoka/vega-preset-full";

const engine = new VegaEngine({ officialPlugins: createVegaFullPreset() });

const player = await engine.createPlayer({
  mount: document.querySelector("#story")!,
  story: await (await fetch("/stories/episode-1.json")).json(),
});

await player.player.play();
```

`createPlayer` 會在需要時啟動引擎，在元素下掛載播放器，載入故事用到的全部資源，並返回一個控制程式碼。透過 `player.player` 可以呼叫 `play()`、`pause()`、`resume()`、`requestNext()`、`choose(key)` 和 `seekTo(index)`，也可以讀取回應式的 `state`——當前臺詞、回想記錄、故事是否已結束。先釋放控制程式碼再釋放引擎；釋放引擎時也會釋放它的所有播放器。

如果只想嵌入 haneoka.org 的劇情而不安裝任何東西，請使用 [Vega 嵌入](/zh-tw/embed/vega/)。

## 故事

故事是帶有 `commands` 陣列的 JSON。每條命令有一個數字 `command` 程式碼和對應欄位：

```json
{
  "commands": [
    { "command": 25, "background": { "url": "/bg/rooftop.png" }, "duration": 0.5 },
    { "command": 0, "targetName": "anon", "characterModel": { "runtime": { "imageUrl": "/figure/anon.png" } } },
    { "command": 2, "targetName": "anon", "text": "走吧！" }
  ]
}
```

這裡 `25` 是 Stage（設定背景），`0` 讓角色登場，`2` 是一句臺詞。

命令集與遊戲一致：對話與說話人、角色登場與退場及其動作和表情、背景與靜幀、鏡頭的平移、俯仰、縮放和震動、景深、BGM、音效與語音、淡入淡出、閃光與轉場、聊天手機場景、帶字幕的影片、選項、跳轉和命令組。程式碼定義在 `@haneoka/vega-protocol`（`VEGA_ADV_OPCODE`）中。實際很少需要手寫：Altair 用表單編輯它們，它的匯入器還能從 WebGAL、Bestdori 或純文字生成。

文字支援遊戲的標記——注音、顏色、字號——安裝格式外掛後還支援 Markdown 等格式。每個文字欄位都可以包含多種語言，播放器顯示讀者的語言。

## 資源

資源是故事中的 URL。HTTP(S)、`data:` 和 `blob:` URL 直接載入。對於壓縮包、應用協議或 CDN 對映，新增一個帶有 scheme 和 `load` 函式的資源外掛即可。試圖越出允許範圍的 URL（`..`、空路徑或不安全路徑）會在載入前被拒絕。

故事開始之前，Vega 會列出它需要的全部資源並預先載入，包括每個 Live2D 模型實際會用到的動作——播放不會中途停下來等待下載。

## 外掛

```ts
const engine = new VegaEngine({
  officialPlugins: [threeRenderer, portableUi],
  plugins: [myAnalyticsPlugin],
});
```

`officialPlugins` 被視為你發行內容的一部分而受信任；`plugins` 屬於第三方，只獲得第三方許可權。外掛可以提供渲染器、介面插槽、主題、角色提供者、命令、資源、儲存或輸入，外掛被移除或引擎被釋放時，它的所有註冊都會撤銷。初始化失敗的外掛會被完整回滾。

專案會記錄自己需要的外掛，[外掛目錄](https://github.com/haneoka-gakuen/vega-marketplace)列出了全部官方外掛及其許可權和依賴。

## 存檔、設定與輸入

預設外殼透過 Vega 的儲存埠提供存檔、設定和回想，預設存放在瀏覽器中。宿主外掛可以把它們存到別處——[Haneoka 宿主外掛](https://github.com/haneoka-gakuen/vega-plugin-haneoka)透過一個由你的應用實現的小橋接層轉發儲存和輸入。

## 釋出

要把專案做成網站、PWA、桌面應用或移動端工程，請使用 [Deneb](/zh-tw/suite/deneb/)。

## 參考

[Vega 倉庫](https://github.com/haneoka-gakuen/vega)的 README 介紹引擎 API，各外掛的 README 完整列出了它們的選項。
