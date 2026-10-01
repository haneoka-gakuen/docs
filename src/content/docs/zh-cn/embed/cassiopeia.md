---
title: Cassiopeia 谱面嵌入
description: 使用本站或自带谱面、音频和素材创建独立播放器。
---

`mountChart` 默认组合 Cassiopeia kernel、Vue ChartPlayer、Our Notes plugin、Three renderer 和 Web 音频/输入宿主。它拥有挂载 DOM、媒体、input、renderer 与数据 loader。自定义 renderer 可沿用 kernel/Web host 并呈现作者自己的图形。候选产物安装与 CDN 方法见 [JavaScript 嵌入](../)。

## 本站谱面

```html
<div id="chart" style="height:min(70vh,640px);width:100%"></div>
<button id="play" disabled>播放</button>
```

```js
import { mountChart } from "@haneoka/embed-cassiopeia";
import { haneokaChartSource, haneokaChartTheme } from "@haneoka/embed-cassiopeia/haneoka";
import "@haneoka/embed-cassiopeia/style.css";
const chart = mountChart(document.querySelector("#chart"), {
  source: haneokaChartSource({ songId: "100070", difficulty: "expert" }),
  theme: haneokaChartTheme(),
  server: "intl",
  locale: "en",
  mode: "watch",
  skin: { noteSkin: "skin001", noteEffectSkin: "effect001", currentQuality: 2, noteSeGroup: 1 },
  noteSoundEnabled: true,
});
try {
  await chart.ready;
  const play = document.querySelector("#play");
  play.disabled = false;
  play.onclick = () => chart.play().catch(console.error);
} catch (error) {
  await chart.dispose();
  throw error;
}
// 卸载时 await chart.dispose()。
```

source 读取当前歌曲、选择响应的 difficulty file，并通过 Our Notes plugin 解析谱面，使用返回的 music URL。theme 读取当前源 descriptor 与运行素材。无需登录或 release ID，server 与语言独立。默认轻量 quality 为 2，保留宿主字体和 Material token。

## 自带谱面与音频

`ChartEmbedDocument` 包含 `chart`，可选 `audio`、`background`、`bgmOffsetMs` 和 `assets`。chart 使用公开 `ChartDocument` 字段：version、bpmChanges、signatureChanges、timeScaleChanges、notes、lines、timeline、durationMs。选择 document 或 source 其中一个。

```js
const handle = mountChart(element, {
  document: { chart: myChartDocument, audio: "musique/été.wav", bgmOffsetMs: 250 },
  assetsBase: "https://my.example/project/",
  theme: haneokaChartTheme(),
  locale: "fr-CA",
  labels: { player: "Partition", pause: "Pause", loading: "Chargement" },
});
await handle.ready;
```

`myChartDocument` 是调用方实际准备的标准谱面。音频为时钟：`seek(seconds)` 使用媒体/呈现秒数，谱面时间减去 bgmOffsetMs，正偏移产生前导。没有音频时为暂停视觉预览。

HTTP 通过 `httpDataSource({url,decode})`，本地通过 `fileDataSource(jsonFile)` 与 `fileResourceResolver(Map)`。作者可使用单语言和 Unicode 素材名。原生 theme 自己还请求公开 API/素材；严格本地 Map 应让合法的公开绝对路径通过，或提供完整自带 theme。自带素材可用 `document.assets: OurNotesAssetManifest` 或 `theme({loader,signal,skin})` factory。

## 自定义图形

```js
const handle = mountChart(element, {
  document: { chart: myChartDocument, audio: "audio.ogg" },
  assetsBase: "https://my.example/project/",
  rendererAdapter: {
    async create({ element, chart, loader, signal }) {
      const canvas = document.createElement("canvas");
      element.append(canvas);
      const context = canvas.getContext("2d");
      const artwork = await loader.resourceUrl("notes.svg", { signal });
      return {
        render(snapshot, options) { drawMyChart(context, chart, snapshot, options, artwork); },
        resize(width, height, ratio) { canvas.width = width * ratio; canvas.height = height * ratio; },
        dispose() { canvas.remove(); },
      };
    },
  },
});
```

`drawMyChart` 由作者实现。adapter 路径加载 kernel/Web host；自己的 render、resize、dispose 负责图形与 SE。可选 `laneAtClientPoint(x,y)` 返回 0–23 连续原生 lane，外部为 -1，以接收 play-mode input。`createSession` 为另一个源游戏提供自己的规则；默认使用当前 Cassiopeia session。

## 控制、事件和销毁

```js
await chart.setOptions({ rate: 0.8, volume: 0.6, noteSoundVolume: 0.4, settings: { noteSpeed: 9 } });
await chart.setSkin({ noteSkin: "skin003", noteEffectSkin: "effect001Simple", noteSeGroup: 4 });
chart.seek(12);
await chart.play();
chart.pause();
await chart.dispose();
```

`play`、`setOptions`、`setSkin`、`dispose` 返回 Promise，pause/seek 同步。ready 表示视觉初始化，不表示媒体完整下载；在用户点击后调用 play 以解锁音频。默认 theme 更换皮肤时在当前媒体位置重新构建并暂停。skin001/002/003 为 Our Notes/Garupa/Honeycomb，effect001/effect001Simple 为效果版本，SE 组 1–4 为 Our Notes/Solid/Wood/Typing。

`loadTimeoutMs` 默认 30000，只覆盖构造。cancel 和外部 signal 终止 handle；dispose 幂等，加载中也能调用，拆除 DOM、停音频并释放 loader URL。重试先销毁再挂载。snapshot 提供 phase、playing、time、duration。

onEvent/subscribe 提供 load、state、player、error，load 保留 core 每个资源的进度，player 将既有播放器事件及参数转交宿主。subscribe 返回取消监听函数，监听错误与操作结果隔离。

## 跨域与静态分发

`assetsBase` 解析作者数据资源；theme 的 `apiBase`/`publicBase` 独立指定公开 API/原素材根。core 默认 cors/omit，可配置 fetcher、headers、credentials 与每项默认 64 MiB 预算。默认播放器的媒体/贴图/SE 使用既有原生加载器及 anonymous CORS，未经过注入 fetcher/private headers；私人素材可由宿主供应可访问 URL 或 Blob。

把全部延迟 chunk 与模块一起发布，单独链接 style.css。本站图像消费在外站遇到 Referer 403 时，可让数据传输使用 `new Request(request,{referrerPolicy:"no-referrer"})`；原生贴图/音频请求仍由其加载器控制，需按部署的 origin/加载方式确认访问。CSP 应允许模块、素材、媒体以及使用的 blob URL。

宿主沿用已有 Material 控件和加载状态，保持舞台尺寸及触控按钮。Cassiopeia 的内置署名接线待合入；当前宿主可按下方方法使用 core 共用原图标，作者图形与素材保留自己的许可。

```js
import { createHaneokaBranding } from "@haneoka/embed-core/branding";
// 将它放在预留的角落，避免遮挡谱面控制。
const brand = createHaneokaBranding(element.ownerDocument, { corner: "top-left" });
element.append(brand);
// 清理：先 await chart.dispose()，再 brand.remove()。
```
