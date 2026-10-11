---
title: Cassiopeia
description: haneoka.org 谱面播放器背后的音乐游戏引擎——内核、插件、Vue 组件与 Sonolus 转换。
---

Cassiopeia 是 haneoka.org 谱面播放器和谱面总览背后的音乐游戏引擎。它的内核读取谱面，以整数毫秒计时，判断每次触摸属于哪个音符，进行判定和计分，并以事件形式报告 Fever 段、技能和连击。它本身不绘制任何内容，也不播放声音——这些由插件完成——因此同一个内核既能驱动网页播放器、谱面总览，也能驱动 Sonolus 关卡或原生应用。

内核同时有 TypeScript 和 Rust 两种实现（后者用于 WebAssembly 以及 Android、iOS 原生宿主），相同输入下两者给出相同结果。

## 组成

| 软件包 | 作用 |
| --- | --- |
| [`@haneoka/cassiopeia`](https://github.com/haneoka-gakuen/cassiopeia) | 内核、插件运行时、WebAssembly 和原生绑定 |
| [Our Notes 插件](https://github.com/haneoka-gakuen/cassiopeia-plugin-our-notes) | Our Notes 谱面、时间规则、皮肤和特效 |
| [Sekai 插件](https://github.com/haneoka-gakuen/cassiopeia-plugin-sekai) | Project Sekai SUS 谱面的展示 |
| [Three.js 渲染器](https://github.com/haneoka-gakuen/cassiopeia-renderer-three) | 3D 舞台、音符、特效和 HUD |
| [Web 宿主](https://github.com/haneoka-gakuen/cassiopeia-host-web) | 浏览器中的音频时钟、按键音和指针输入 |
| [Vue 界面](https://github.com/haneoka-gakuen/cassiopeia-ui-vue) | `ChartPlayer` 和 `ChartOverview` 组件 |
| [Sonolus 转换](https://github.com/haneoka-gakuen/cassiopeia-plugin-sonolus) | 谱面转为 Sonolus 关卡数据和 USC |

## 用 Vue 做一个谱面播放器

```sh
pnpm add vue @haneoka/cassiopeia @haneoka/cassiopeia-plugin-our-notes \
  @haneoka/cassiopeia-renderer-three @haneoka/cassiopeia-host-web @haneoka/cassiopeia-ui-vue
```

```vue
<ChartPlayer :chart="chart" :assets="assets" audio-url="/songs/101.mp3" mode="watch" @ready="player.play()" ref="player" />
```

`mode="watch"` 自动演奏；`mode="play"` 让读者用触摸或鼠标游玩。播放器会发出判定、连击和 Fever 事件，也可以改为跟随你自己的时钟而不是自身的音频——编辑器或视频导出就是这样保持同步的。`ChartOverview` 在一张长画布上绘制整首谱面，并标出连击数、BPM 变化、Fever 段和技能窗口。

如果只想展示 haneoka.org 的谱面而不安装任何东西，请使用 [Cassiopeia 嵌入](/zh-cn/embed/cassiopeia/)。

## 直接使用内核

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

会话接受 `tap`、`release`、`flick` 和 `trace` 输入（可附带指针 ID），`update` 返回包含分数、连击、血量和全连状态的快照。这足以搭建你自己的游戏、分数模拟器或谱面分析工具。

## Sonolus

Our Notes 谱面可以在 [Sonolus](https://sonolus.com) 应用中游玩。转换插件把谱面变成 Sonolus 关卡数据，[Sonolus 引擎](https://github.com/haneoka-gakuen/sonolus-our-notes)以 Our Notes 的判定和特效来播放。haneoka.org 运行着收录全部谱面的 [Sonolus 服务器](/zh-cn/sonolus/)。

## 参考

[Cassiopeia 仓库](https://github.com/haneoka-gakuen/cassiopeia)的 README 介绍内核 API、插件和原生绑定；各软件包的 README 介绍各自的选项。
