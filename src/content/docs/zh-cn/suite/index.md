---
title: 套件
description: Vega、Altair、Deneb、Cassiopeia 和 Sonolus 引擎——haneoka.org 背后的开源工具，以及它们如何协同工作。
---

haneoka.org 播放的一切——剧情、谱面、Home Spot 大厅——都运行在一组开源工具之上，你也可以把它们用在自己的项目里。它们分为两个系列：一个面向视觉小说，一个面向音乐游戏。每个工具都可以单独使用，由插件组成，与其他工具搭配或不搭配都能工作。

## 视觉小说

| 工具 | 是什么 | 用来 |
| --- | --- | --- |
| [Vega](/zh-cn/suite/vega/) | 播放器。面向网页和原生应用的视觉小说引擎。 | 在网页、应用或游戏中播放故事。 |
| [Altair](/zh-cn/suite/altair/) | 编辑器。场景、语言、素材、预览和流程图集中在一个工作区。 | 编写、翻译和演出故事。 |
| [Deneb](/zh-cn/suite/deneb/) | 构建工具。命令行程序。 | 把完成的故事发布为网站、PWA、桌面应用或移动端工程。 |

一个典型项目会依次经过这三者：在 Altair 中编写和本地化，边写边在 Vega 中预览，完成后用 Deneb 构建。它们共用同一种故事格式，中间不需要任何转换。

Altair 还能打开其他工具的项目——WebGAL 项目文件夹、Bestdori 剧本、纯文本小说——而 Vega 借助兼容插件可以直接播放 WebGAL 项目，因此已有项目无需重写就能迁移进来。

## 音乐游戏

| 工具 | 是什么 | 用来 |
| --- | --- | --- |
| [Cassiopeia](/zh-cn/suite/cassiopeia/) | 音乐游戏引擎，确定性内核同时有 TypeScript 和 Rust 实现。 | 在网页或原生应用中展示、游玩或分析谱面。 |
| [Sonolus 引擎](/zh-cn/sonolus/) | 面向 [Sonolus](https://sonolus.com) 的 Our Notes 引擎。 | 在 Sonolus 应用中游玩 Our Notes 谱面。 |

Cassiopeia 能读取 Our Notes 和 Project Sekai 谱面，并把它们转换为 Sonolus 关卡。haneoka.org 上的谱面播放器和谱面总览就是它的 Vue 组件。

## 只想嵌入，不想自己搭建

如果只想把故事、谱面或 Home Spot 场景放到网页上，[JavaScript 嵌入](/zh-cn/embed/)只需一个 script 标签就能从 haneoka.org 加载全部内容。需要自己的数据、自己的外观或自己的应用时，再直接使用这些工具。

## 仓库

每个工具都在 [github.com/haneoka-gakuen](https://github.com/haneoka-gakuen) 下有自己的仓库，插件则是独立的软件包。各仓库的 README 是该软件包的完整参考；这些页面讲的是如何把它们组合起来使用。

它们都采用 MPL-2.0 许可：可以用于闭源项目，对这些文件本身的修改需要回馈共享。
