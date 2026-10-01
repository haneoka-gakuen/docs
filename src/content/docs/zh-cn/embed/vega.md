---
title: Vega 剧情嵌入
description: 挂载单语或本站剧情，控制播放、跳转并正确释放资源。
---

`mountStory` 在你的容器内创建 Vega 播放器，复用 Three renderer、资源 resolver、portable 对白与 richtext。支持内存 `AdvStory`、HTTP、本地文件及本站剧情。候选包与 CDN 构建方法见 [嵌入入口](../)。

## 从单语剧情开始

```html
<div id="story" style="height:60vh;min-height:320px"></div>
<button id="play" disabled>播放</button>
<button id="pause">暂停</button>
<button id="next">下一句</button>
```

```js
import { mountStory } from "@haneoka/embed-vega";
import { ADV_COMMAND } from "@haneoka/vega/renderer-kit";
const story = mountStory(document.querySelector("#story"), {
  document: {
    localization: { locales: ["fr"], defaultLocale: "fr" },
    commands: [
      { command: ADV_COMMAND.Stage, background: { url: "背景/庭園.png" } },
      { command: ADV_COMMAND.Talk, targetName: "Mira", text: "Bienvenue." },
      { command: ADV_COMMAND.Talk, targetName: "Mira", text: "Prenez votre temps." },
    ],
  },
  locale: "fr",
  assetsBase: "https://your.example/stories/garden/",
  onEvent(event) { if (event.type === "error") console.error(event.error); },
});
try {
  await story.ready;
  const play = document.querySelector("#play");
  play.disabled = false;
  play.onclick = () => story.play();
  document.querySelector("#pause").onclick = () => story.pause();
  document.querySelector("#next").onclick = () => story.next();
} catch (error) {
  await story.dispose();
  throw error;
}
// 组件离开时 await story.dispose()。
```

播放器在第一个命令处暂停。`AdvStory` 使用 Vega 公共指令和资源字段，作者语言集合可以只有一种语言；`runtime.fonts` 在 ready 前准备。按钮和播放进度由宿主组织，portable 对白保留既有鼠标、触摸和键盘交互。

## HTTP 与本地素材

```js
import { httpDataSource, fileDataSource, fileResourceResolver } from "@haneoka/embed-core";
const remote = mountStory(element, {
  source: httpDataSource({ url: "https://your.example/stories/episode.json" }),
  locale: "fr",
});
await remote.ready;

const local = mountStory(otherElement, {
  source: fileDataSource(jsonFile),
  resolveResource: fileResourceResolver(new Map([
    ["背景/庭園.png", backgroundFile],
    ["fonts/author.woff2", fontFile],
  ])),
  locale: "fr",
});
await local.ready;
```

提供 `document` 或 `source` 其中一个。HTTP 相对素材以文档目录为基准，显式 `assetsBase` 可覆盖；本地 key 按字面匹配。宿主绝对化声明的媒体、模型、纹理、动画和字体 URL，保留对白和标签。模型 manifest 的 sidecar 仍由 provider 解析，本地 resolver 也需覆盖最终 sidecar key，或提供完整模型 descriptor。

## 播放与跳转

```js
story.play();
story.pause();
const commandIndex = await story.seek(0.75);
await story.seek(0.25);
await story.seek(0);
story.play();
console.log(commandIndex, story.snapshot);
```

`seek(ratio)` 的范围是 0–1，映射到当前可达剧情路径的命令边界，包含选项路径。它保持播放/暂停意图，并返回实际恢复的 command index；比例表示剧情进度。高级控制可在 ready 阶段读取 `story.player`。

`subscribe` 返回取消监听函数。load 事件包裹 core start/progress/ready/error/cancelled/disposed，state 含 phase、播放/暂停/完成/跳转、命令位置与 progress，seek 返回落点。状态约每 100 ms 合并发布，操作会立即更新。`onListenerError` 接收观察者错误。

## 取消与释放

挂载立即返回 handle。`ready` 等待 renderer、资源、字体和 seek index；随时保留 handle 以便清理。`cancel()` 终止加载中的构造，重试应先 `await story.dispose()` 再挂载。外部 signal 在 ready 后 abort 会销毁实例。销毁幂等，先关闭 player，再释放 loader 的 Blob URL 和 source cleanup；同一容器再次挂载前等待完成。

## 原有主题与本站剧情

默认 portable 界面包含对白和选项。需要完整 Haneoka theme/shell 时安装相应候选 peer 并接入插件：

```js
import { haneokaStoryPlugins } from "@haneoka/embed-vega/theme";
const themed = mountStory(element, {
  document: myStory,
  assetsBase: "https://your.example/story/",
  locale: "fr",
  theme: "haneoka",
  plugins: haneokaStoryPlugins,
  shell: { initialScreen: "game", projectId: "my-story", settingsId: "my-settings" },
});
await themed.ready;
```

保留主题 `assets/` 的字体与 sprite 相对路径。模型和扩展命令通过 Vega 公共 plugin 契约添加。`renderer` 接收现有 Three renderer 参数。

本站适配器读取一个 story、runtime 和声明的 Live2D metadata，接受 `apiBase` 覆盖。模型剧情需要单独供应有许可的 Cubism adapter/Core：

```js
import { haneokaStorySource, cubismStoryPlugin } from "@haneoka/embed-vega/haneoka";
const publicStory = mountStory(element, {
  source: haneokaStorySource({ id: "afterlive_10109" }),
  server: "intl",
  locale: "en",
  plugins: [cubismStoryPlugin({
    moduleUrl: "https://your.example/cubism-runtime/vega-cubism-web-runtime.mjs",
    runtime: {
      cubismCoreUrl: "https://your.example/Core/live2dcubismcore.js",
      cubism2CoreUrl: "https://your.example/Core/live2d.min.js",
      motionSyncCoreUrl: "https://your.example/Core/CRI/live2dcubismmotionsynccore.min.js",
    },
  })],
});
await publicStory.ready;
```

这些 runtime URL 由你的合法供应流程提供，adapter 与 Core 版本应匹配。根据故事实际内容追加 Haneoka 的模型/命令 provider。

## 传输与署名

文档和资源 bytes 使用 core fetcher：cors、omit、默认每项 64 MiB。`headers`、`credentials`、`resolveResource`、`maxBytes` 可配置，`resourceTimeoutMs` 默认每项 30 秒。模型动态模块/Core 使用自己的 script/module 加载路径；core headers 不配置那些请求。各素材 origin 应允许宿主 CORS。

播放器保留 Haneoka 原图标与 https://haneoka.org/ 链接，默认在顶部预留 48px 和安全区。可用 `brandingCorner: "top-right"` 改到右侧；署名保持可见，作者素材权利归作者。给容器足够高度并使用宿主 Material 加载控件、可触摸的播放按钮与可读对白区域。
