---
title: JavaScript 嵌入
description: 在自己的网站中挂载 Vega 剧情、Cassiopeia 谱面与 Home Spot 场景。
---

Haneoka 的嵌入组件直接挂载到你提供的 DOM 容器。Vega 播放剧情，Cassiopeia 播放谱面，Home Spot 呈现 Three/Spine 互动场景。它们通过 `@haneoka/embed-core` 共用数据源和资源加载端口；页面布局、操作按钮和错误提示由宿主应用组织。

## 选择组件

| 内容 | 包入口 | 数据 | 操作 |
| --- | --- | --- | --- |
| 数据与资源 | `@haneoka/embed-core` | 内存、HTTP JSON、本地文件、自定义源 | 加载、取消、销毁 |
| 剧情 | `@haneoka/embed-vega` | Vega `AdvStory` 或数据源 | 播放、暂停、下一句、按剧情比例跳转 |
| 谱面 | `@haneoka/embed-cassiopeia` | `ChartEmbedDocument` 或数据源 | 播放、暂停、按秒跳转、设置与皮肤 |
| 场景 | `@haneoka/embed-home-spot` | `HomeSpotDocument` 或数据源 | 选择角色、重播、替换场景、导出 PNG |

可视组件的 `/haneoka` 子入口读取本站当前公开对象和返回的资源地址。自带内容可以只有一种语言，使用作者自己的 locale 字符串和 Unicode 文件名。`server` 选择资料服务器，`locale` 选择语言，两者独立。

## 分发状态与安装

官方浏览器模块已托管在 `https://haneoka.org/embed/{core,vega,cassiopeia,home-spot,vega-theme}.js`。可固定已发布 `/embed/r-22bfe102f7deb73f/`，或按实际 manifest 选择后续已验证版本。[仓库](https://github.com/haneoka-gakuen/haneoka/tree/main/packages) 提供源码，SDK chunks/assets 在部署时正常生成；npm 是独立发布步骤。下文自托管 CDN 路径由宿主选择。

完整工具链使用 Node.js 24 或更新版本。将 embed、core 与实际渲染 peer 的本地包安装到你的应用中：

```sh
# 用实际候选产物替换这些文件路径，同时安装所选宿主的渲染依赖。
npm install ./vendor/haneoka-embed-core-0.1.0.tgz \
  ./vendor/haneoka-embed-vega-0.1.0.tgz
```

Vega 需要 engine、Three renderer、portable UI、richtext、Three 和 Howler；默认谱面播放器需要 Cassiopeia kernel、Web host、Our Notes plugin、Three renderer、Vue UI、Vue 和 Three；Home Spot 需要 Haneoka scene provider、Three `0.184.x` 和 Spine `4.2.119`。本站数据适配器另需 `@haneoka/api-client`。以 package manifest 的版本范围为准，同步准备尚未发布的 peer。

所有主入口提供 ESM 与 TypeScript 声明，导入时不创建 DOM 或发请求。在浏览器容器创建后挂载；框架组件卸载时调用 `dispose()`。

## 生成自己的 CDN 模块

在装好候选包和 Vite 的宿主工程中，为需要的组件建立入口文件：

```js
// sdk/core.js
export * from "@haneoka/embed-core";
export { haneokaDataSource } from "@haneoka/embed-core/haneoka";

// sdk/vega.js — portable 剧情最小入口
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

这些注释分别代表独立文件。只构建需要的入口。以下配置生成 portable 剧情模块：

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

执行宿主工程的 Vite build，将 `sdk-dist` 整个目录上传到自己的版本目录，保留所有延迟加载 chunk。谱面入口还需链接生成的 CSS；选择原有主题和模型 provider 时，按其包说明复制字体、sprite 和供应模型运行时。

普通网页通过自己的模块地址使用组件：

```html
<div id="story" style="height:60vh;min-height:320px"></div>
<button id="play" disabled>播放</button>
<script type="module">
  import { mountStory, ADV_COMMAND } from "/sdk/0.1.0/vega.js";
  const handle = mountStory(document.querySelector("#story"), {
    document: {
      localization: { locales: ["zh-CN"], defaultLocale: "zh-CN" },
      commands: [{ command: ADV_COMMAND.Talk, targetName: "小遥", text: "欢迎。" }],
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
  // 页面或组件离开时：await handle.dispose()。
</script>
```

跨域 CDN 地址需返回 JavaScript MIME 和允许模块加载的 CORS 头。固定版本目录中的模块、chunk 和资源应一起保留。直接在浏览器写裸包名需要 import map 覆盖依赖及其子入口；打包后的模块可以直接用于 `<script type="module">`。

## 加载与生命周期

挂载前预留容器尺寸，使用宿主已有的 Material 控件、设计 token 和 Fontsource 字体呈现加载、错误和播放操作。按钮应适合触控并能在窄屏换行。等待 `ready` 后，通过点击或触摸调用播放以获得浏览器音频许可。

挂载函数立即返回 handle。保留它并处理 `ready` 拒绝；加载途中也能销毁。复用容器前等待销毁完成。

| 组件 | `cancel()` 行为 | 重试 |
| --- | --- | --- |
| Core loader | 取消当前操作，loader 可继续使用 | 再调用 `load()` |
| Vega | 终止加载中的播放器 | 销毁后创建新 handle |
| Cassiopeia | 终止挂载与播放 | 销毁后创建新 handle |
| Home Spot | 取消当前加载代次 | 用新 source/document 调用 `load()` |

## 跨域与署名

HTTP 文档和资源默认 `mode: cors`、`credentials: omit`。数据与素材服务器应允许宿主来源。HTTP JSON 的相对路径基于文档目录；内存、本地文档需要 `assetsBase` 或 resolver。图片、音频和模型 provider 的原生加载器有各自的传输要求，见对应组件页。

Vega、Cassiopeia 与 Home Spot 默认显示 Haneoka 原图标与 [haneoka.org](https://haneoka.org/) 链接。当前宿主使用半透明角落悬浮，不占单独一行或缩小画面。署名位于宿主层，作者保留自己的剧情和素材权利；Home Spot 署名在 canvas 与 PNG 内容之外。数据 core 本身没有 UI，自定义可视宿主可以通过 `/branding` 子入口创建并管理署名 anchor。

接着阅读 [数据源](./core/)、[Vega](./vega/)、[Cassiopeia](./cassiopeia/) 和 [Home Spot](./home-spot/)。
