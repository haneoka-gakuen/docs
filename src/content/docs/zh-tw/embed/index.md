---
title: JavaScript 嵌入
description: 在自己的網站中掛載 Vega 劇情、Cassiopeia 譜面與 Home Spot 場景。
---

Haneoka 的嵌入元件直接掛載到你提供的 DOM 容器。Vega 播放劇情，Cassiopeia 播放譜面，Home Spot 呈現 Three/Spine 互動場景。它們透過 `@haneoka/embed-core` 共用資料來源和資源載入埠；頁面佈局、操作按鈕和錯誤提示由宿主應用組織。

## 選擇元件

| 內容 | 包入口 | 資料 | 操作 |
| --- | --- | --- | --- |
| 資料與資源 | `@haneoka/embed-core` | 記憶體、HTTP JSON、本地檔案、自定義源 | 載入、取消、銷燬 |
| 劇情 | `@haneoka/embed-vega` | Vega `AdvStory` 或資料來源 | 播放、暫停、下一句、按劇情比例跳轉 |
| 譜面 | `@haneoka/embed-cassiopeia` | `ChartEmbedDocument` 或資料來源 | 播放、暫停、按秒跳轉、設定與皮膚 |
| 場景 | `@haneoka/embed-home-spot` | `HomeSpotDocument` 或資料來源 | 選擇角色、重播、替換場景、匯出 PNG |

可視元件的 `/haneoka` 子入口讀取本站當前公開物件和返回的資源地址。自帶內容可以只有一種語言，使用作者自己的 locale 字串和 Unicode 檔名。`server` 選擇資料伺服器，`locale` 選擇語言，兩者獨立。

## 先建立一段能播放的劇情

跟著 [Vega 八步教程](./vega/)建立兩句對白、儲存 JSON、開啟完整 HTML，再加背景、聲音和模型。[完整入門 HTML](/examples/first-story-zh.html)和[完整對白 JSON](/examples/dialogue-zh.json)已經提供；入門使用託管模組，無需安裝 npm。需要讀取遊戲劇情時，教程也提供真實「寶物」來源。

## 分發狀態與開發者安裝

無需本地構建的官方瀏覽器模組已託管在 `https://haneoka.org/embed/{core,vega,cassiopeia,home-spot,vega-theme}.js`。可固定已釋出 `/embed/r-22bfe102f7deb73f/`，或按實際 manifest 選擇後續已驗證版本。[倉庫](https://github.com/haneoka-gakuen/haneoka/tree/main/packages) 提供原始碼，SDK chunks/assets 在部署時正常生成；npm 是獨立釋出步驟。下文自託管 CDN 路徑由宿主選擇。

下面的自託管步驟面向自行構建原始碼的開發者。完整工具鏈使用 Node.js 24 或更新版本。先從原始碼 workspace 構建、打包所需元件，再將自己生成的 embed、core 與渲染 peer 本地包安裝到應用。下列 vendor 檔案是待替換的本地產物路徑，不是已提供的公眾下載：

```sh
# 用實際候選產物替換這些檔案路徑，同時安裝所選宿主的渲染依賴。
npm install ./vendor/haneoka-embed-core-0.1.0.tgz \
  ./vendor/haneoka-embed-vega-0.1.0.tgz
```

Vega 需要 engine、Three renderer、portable UI、richtext、Three 和 Howler；預設譜面播放器需要 Cassiopeia kernel、Web host、Our Notes plugin、Three renderer、Vue UI、Vue 和 Three；Home Spot 需要 Haneoka scene provider、Three `0.184.x` 和 Spine `4.2.119`。本站資料介面卡另需 `@haneoka/api-client`。以 package manifest 的版本範圍為準，同步準備尚未釋出的 peer。

所有主入口提供 ESM 與 TypeScript 宣告，匯入時不建立 DOM 或發請求。在瀏覽器容器建立後掛載；框架元件解除安裝時呼叫 `dispose()`。

## 生成自己的 CDN 模組

在裝好候選包和 Vite 的宿主工程中，為需要的元件建立入口檔案：

```js
// sdk/core.js
export * from "@haneoka/embed-core";
export { haneokaDataSource } from "@haneoka/embed-core/haneoka";

// sdk/vega.js — portable 劇情最小入口
export { mountStory } from "@haneoka/embed-vega";
export { ADV_COMMAND } from "@haneoka/vega/renderer-kit";

// sdk/chart.js
export { mountChart } from "@haneoka/embed-cassiopeia";
export { haneokaChartSource, haneokaChartTheme } from "@haneoka/embed-cassiopeia/haneoka";
import "@haneoka/embed-cassiopeia/style.css";

// sdk/home-spot.js
export { mountHomeSpot } from "@haneoka/embed-home-spot";
export { mountHaneokaHomeSpot } from "@haneoka/embed-home-spot/haneoka";
```

這些註釋分別代表獨立檔案。只構建需要的入口。以下配置生成 portable 劇情模組：

```js
// vite.config.mjs
import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    outDir: "sdk-dist",
    lib: { entry: "sdk/vega.js", formats: ["es"], fileName: () => "vega.js" },
  },
});
```

執行宿主工程的 Vite build，將 `sdk-dist` 整個目錄上傳到自己的版本目錄，保留所有延遲載入 chunk。譜面入口還需連結生成的 CSS；選擇原有主題和模型 provider 時，按其包說明覆制字型、sprite 和供應模型執行時。

普通網頁透過自己的模組地址使用元件：

```html
<div id="story" style="height:60vh;min-height:320px"></div>
<button id="play" disabled>播放</button>
<script type="module">
  import { mountStory, ADV_COMMAND } from "/sdk/0.1.0/vega.js";
  const handle = mountStory(document.querySelector("#story"), {
    document: {
      localization: { locales: ["zh-CN"], defaultLocale: "zh-CN" },
      commands: [{ command: ADV_COMMAND.Talk, targetName: "小遙", text: "歡迎。" }],
    },
    locale: "zh-CN",
  });
  try {
    await handle.ready;
    const play = document.querySelector("#play");
    play.disabled = false;
    play.onclick = () => handle.play();
  } catch (error) {
    console.error(error);
    await handle.dispose();
  }
  // 頁面或元件離開時：await handle.dispose()。
</script>
```

跨域 CDN 地址需返回 JavaScript MIME 和允許模組載入的 CORS 頭。固定版本目錄中的模組、chunk 和資源應一起保留。直接在瀏覽器寫裸包名需要 import map 覆蓋依賴及其子入口；打包後的模組可以直接用於 `<script type="module">`。

## 載入與生命週期

掛載前預留容器尺寸，使用宿主已有的 Material 控制元件、設計 token 和 Fontsource 字型呈現載入、錯誤和播放操作。按鈕應適合觸控並能在窄屏換行。等待 `ready` 後，透過點選或觸控呼叫播放以獲得瀏覽器音訊許可。

掛載函式立即返回 handle。保留它並處理 `ready` 拒絕；載入途中也能銷燬。複用容器前等待銷燬完成。

| 元件 | `cancel()` 行為 | 重試 |
| --- | --- | --- |
| Core loader | 取消當前操作，loader 可繼續使用 | 再呼叫 `load()` |
| Vega | 終止載入中的播放器 | 銷燬後建立新 handle |
| Cassiopeia | 終止掛載與播放 | 銷燬後建立新 handle |
| Home Spot | 取消當前載入代次 | 用新 source/document 呼叫 `load()` |

## 跨域與署名

HTTP 檔案和資源預設 `mode: cors`、`credentials: omit`。資料與素材伺服器應允許宿主來源。HTTP JSON 的相對路徑基於檔案目錄；記憶體、本地檔案需要 `assetsBase` 或 resolver。圖片、音訊和模型 provider 的原生載入器有各自的傳輸要求，見對應元件頁。

Vega、Cassiopeia 與 Home Spot 預設顯示 Haneoka 原圖示與 [haneoka.org](https://haneoka.org/) 連結。當前宿主使用半透明角落懸浮，不佔單獨一行或縮小畫面。署名位於宿主層，作者保留自己的劇情和素材權利；Home Spot 署名在 canvas 與 PNG 內容之外。資料 core 本身沒有 UI，自定義可視宿主可以透過 `/branding` 子入口建立並管理署名 anchor。

接著閱讀 [資料來源](./core/)、[Vega](./vega/)、[Cassiopeia](./cassiopeia/) 和 [Home Spot](./home-spot/)。
