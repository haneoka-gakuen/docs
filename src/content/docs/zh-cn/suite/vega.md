---
title: Vega
description: 在网页和原生应用中播放视觉小说——引擎、插件，以及如何把播放器放到页面上。
---

Vega 是 haneoka.org 剧情播放器背后的视觉小说引擎。它读取一个故事——由对话、角色、背景、镜头、声音、选项和聊天等命令组成的列表——并把它变成状态：说了什么、谁在舞台上、正在播放什么。你看到和听到的一切都来自插件，因此同一个引擎既能运行带 Live2D 角色的完整 3D 舞台，也能在手机上运行轻量的 2D 舞台，或者完全不需要 WebGL 的 DOM 回退方案。

## 播放器由什么组成

| 部分 | 官方插件 | 不安装时 |
| --- | --- | --- |
| 渲染器 | [Three.js](https://github.com/haneoka-gakuen/vega-renderer-three)、[Pixi](https://github.com/haneoka-gakuen/vega-renderer-pixi) | 用 DOM 显示背景、静帧和立绘。 |
| 剧情界面 | [Portable UI](https://github.com/haneoka-gakuen/vega-ui-portable) | 使用你自己的 `dialogue` 界面插槽。 |
| 外壳 | [默认外壳](https://github.com/haneoka-gakuen/vega-shell-default)：标题、存档、设置、回想、画廊、流程图 | 故事直接开始播放。 |
| 主题 | [Haneoka](https://github.com/haneoka-gakuen/vega-theme-haneoka)、Portable、WebGAL | 无样式界面。 |
| 角色 | [Cubism（Live2D）](https://github.com/haneoka-gakuen/vega-plugin-cubism)、[Spine](https://github.com/haneoka-gakuen/vega-plugin-spine)、[组合模型](https://github.com/haneoka-gakuen/vega-plugin-composite) | 只能显示静态图片。 |
| 文字 | [富文本](https://github.com/haneoka-gakuen/vega-plugin-richtext)，以及 Markdown、BBCode、HTML、LaTeX、Typst | 纯文本。 |
| 其他 | [结局画面](https://github.com/haneoka-gakuen/vega-plugin-ending)、[WebGAL 兼容](https://github.com/haneoka-gakuen/vega-plugin-webgal)、[Haneoka 宿主](https://github.com/haneoka-gakuen/vega-plugin-haneoka) | |

[Vega Full Preset](https://github.com/haneoka-gakuen/vega-preset-full) 一次调用就能组装好一套合适的组合。

## 把播放器放到页面上

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

`createPlayer` 会在需要时启动引擎，在元素下挂载播放器，加载故事用到的全部资源，并返回一个句柄。通过 `player.player` 可以调用 `play()`、`pause()`、`resume()`、`requestNext()`、`choose(key)` 和 `seekTo(index)`，也可以读取响应式的 `state`——当前台词、回想记录、故事是否已结束。先释放句柄再释放引擎；释放引擎时也会释放它的所有播放器。

如果只想嵌入 haneoka.org 的剧情而不安装任何东西，请使用 [Vega 嵌入](/zh-cn/embed/vega/)。

## 故事

故事是带有 `commands` 数组的 JSON。每条命令有一个数字 `command` 代码和对应字段：

```json
{
  "commands": [
    { "command": 25, "background": { "url": "/bg/rooftop.png" }, "duration": 0.5 },
    { "command": 0, "targetName": "anon", "characterModel": { "runtime": { "imageUrl": "/figure/anon.png" } } },
    { "command": 2, "targetName": "anon", "text": "走吧！" }
  ]
}
```

这里 `25` 是 Stage（设置背景），`0` 让角色登场，`2` 是一句台词。

命令集与游戏一致：对话与说话人、角色登场与退场及其动作和表情、背景与静帧、镜头的平移、俯仰、缩放和震动、景深、BGM、音效与语音、淡入淡出、闪光与转场、聊天手机场景、带字幕的影片、选项、跳转和命令组。代码定义在 `@haneoka/vega-protocol`（`VEGA_ADV_OPCODE`）中。实际很少需要手写：Altair 用表单编辑它们，它的导入器还能从 WebGAL、Bestdori 或纯文本生成。

文字支持游戏的标记——注音、颜色、字号——安装格式插件后还支持 Markdown 等格式。每个文本字段都可以包含多种语言，播放器显示读者的语言。

## 资源

资源是故事中的 URL。HTTP(S)、`data:` 和 `blob:` URL 直接加载。对于压缩包、应用协议或 CDN 映射，添加一个带有 scheme 和 `load` 函数的资源插件即可。试图越出允许范围的 URL（`..`、空路径或不安全路径）会在加载前被拒绝。

故事开始之前，Vega 会列出它需要的全部资源并预先加载，包括每个 Live2D 模型实际会用到的动作——播放不会中途停下来等待下载。

## 插件

```ts
const engine = new VegaEngine({
  officialPlugins: [threeRenderer, portableUi],
  plugins: [myAnalyticsPlugin],
});
```

`officialPlugins` 被视为你发行内容的一部分而受信任；`plugins` 属于第三方，只获得第三方权限。插件可以提供渲染器、界面插槽、主题、角色提供者、命令、资源、存储或输入，插件被移除或引擎被释放时，它的所有注册都会撤销。初始化失败的插件会被完整回滚。

项目会记录自己需要的插件，[插件目录](https://github.com/haneoka-gakuen/vega-marketplace)列出了全部官方插件及其权限和依赖。

## 存档、设置与输入

默认外壳通过 Vega 的存储端口提供存档、设置和回想，默认存放在浏览器中。宿主插件可以把它们存到别处——[Haneoka 宿主插件](https://github.com/haneoka-gakuen/vega-plugin-haneoka)通过一个由你的应用实现的小桥接层转发存储和输入。

## 发布

要把项目做成网站、PWA、桌面应用或移动端工程，请使用 [Deneb](/zh-cn/suite/deneb/)。

## 参考

[Vega 仓库](https://github.com/haneoka-gakuen/vega)的 README 介绍引擎 API，各插件的 README 完整列出了它们的选项。
