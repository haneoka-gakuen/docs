---
title: Altair
description: 编写、翻译和演出视觉小说，配有实时 Vega 预览、流程图，以及 WebGAL、Bestdori 和纯文本导入。
---

Altair 是套件中的编辑器。一个项目——场景、语言、素材、角色和插件——在同一个工作区中打开：脚本视图和每条命令的表单、素材浏览器、整个故事的流程图，以及跟随光标的实时 [Vega](/zh-cn/suite/vega/) 预览。你编辑的正是 Vega 播放、[Deneb](/zh-cn/suite/deneb/) 发布的同一份数据。

## 开始一个项目

有三种方式：

- **打开文件夹。** 在 Chromium 内核的浏览器中，Altair 可以直接处理磁盘上的文件夹：从中读取场景和素材，并把修改写回原文件。其他浏览器以只读方式打开文件，修改需要导出。
- **导入。** WebGAL 项目文件夹和 WebGAL Craft 项目、Bestdori 剧本、ADV JSON 以及纯文本都能变成 Altair 项目。未修改的 WebGAL 场景会逐字节原样写回。
- **从示例开始。** [First Light](https://github.com/haneoka-gakuen/vega-example-first-light) 是一个专门用来打开和修改的短篇故事。

## 编写

每条命令都有带类型字段的表单——说话人、各语言的台词、角色的动作和表情、从素材浏览器选择的背景、带缓动的镜头运动。脚本视图为每条命令显示一行摘要，随时可以切换到源码。

项目可以有任意多种语言，每种语言有自己的字体。文本字段同时保存所有语言，预览播放你选择的那一种。

[Altair Prose](https://github.com/haneoka-gakuen/altair-plugin-prose) 能把粘贴进来的章节变成场景草稿：带说话人的行和引号中的对话成为台词，其余成为旁白，并全部标记为待审阅。

## 查看故事

- **预览。** Vega 预览随输入实时更新，跳到光标所在的命令，可以从任意位置播放、设置断点逐步执行，或者不保存直接试运行几条命令。在舞台上拖动角色，位置会写回命令。
- **流程图。** 以图的形式展示场景、选项、跳转、调用和结局，并报告没有任何路径能到达的场景、跳到不存在标签的跳转、重复的标签以及没有出口的循环。
- **角色。** [Altair Models](https://github.com/haneoka-gakuen/altair-plugin-models) 可以用 Live2D、图片、GIF 和视频组合出分层角色，并一键加入场景。

## 安全保障

撤销和重做覆盖项目和每个打开的文档。未保存的修改会作为草稿保存在浏览器中，刷新或崩溃后都能恢复；如果项目在此期间被修改，Altair 会指出哪些草稿已不再适用，而不会覆盖任何内容。

## 来自游戏数据源的素材

配置网络适配器后，素材浏览器可以显示：

- [haneoka.org 资料库](https://github.com/haneoka-gakuen/altair-plugin-haneoka)中 Our Notes 的背景、静帧、特效、Live2D、BGM 和语音，还能把官方剧情整篇作为可编辑项目打开；
- [Bestdori](https://github.com/haneoka-gakuen/altair-plugin-bestdori) 中 Girls Band Party 的素材树。

## 插件

以上一切都是插件。[Altair Full Preset](https://github.com/haneoka-gakuen/altair-preset-full) 会安装全部官方插件。项目会记录自己使用的插件，[插件市场插件](https://github.com/haneoka-gakuen/altair-plugin-marketplace)在构建前检查它们的版本、依赖和权限并写出锁文件。第三方插件可以借助[沙箱](https://github.com/haneoka-gakuen/altair-plugin-sandbox)在独立的 Worker 中运行。

## 运行 Altair

```sh
git clone https://github.com/haneoka-gakuen/altair.git
cd altair
pnpm install --frozen-lockfile
pnpm dev
```

要用同样的组件搭建自己的编辑器，安装 `@haneoka/altair` 和需要的插件，创建 `AltairPluginHost` 并安装它们即可。各插件的 README 说明了具体做法。
