---
title: Deneb
description: 把 Vega 项目构建为网站、离线 PWA、Electron 或 Tauri 应用，以及 Android 和 iOS 工程。
---

Deneb 是最后一步：它把完成的 [Vega](/zh-cn/suite/vega/) 项目变成可以安装的作品。它确认项目需要的每个场景、素材和插件都在，锁定精确版本以便重复构建，然后输出你需要的目标。所有目标都包含同一份项目和同一个播放器，所以故事在任何地方表现都一致。

## 安装

```sh
git clone https://github.com/haneoka-gakuen/deneb.git
cd deneb
cargo install --locked --path crates/deneb-cli
```

## 从项目到构建

```sh
deneb doctor --target android                 # 这台机器还缺什么？
deneb validate my-story/project.vega.json     # 项目是否完整？
deneb plugins validate my-story/project.vega.json
deneb build my-story/project.vega.json --target pwa --output dist --runtime-bundle ./vega-runtime
```

`--runtime-bundle` 指向要打包的 Vega 运行时：一个带有说明文件 `deneb-runtime.json` 的文件夹。

## 目标平台

| 目标 | 得到 |
| --- | --- |
| `web` | 使用相对链接的静态网站，可上传到任何地方、任何路径。 |
| `pwa` | 网站加上清单和 Service Worker，可离线游玩、可安装。 |
| `electron` | 启用 Chromium 沙箱的桌面应用。 |
| `tauri` | 下载体积小得多的桌面应用。 |
| `android`、`ios` | 可用 Android Studio 或 Xcode 打开的原生工程。 |

桌面和移动端构建使用 `--bundle-identifier`（默认 `app.vega.<project-id>`）。

## 发布构建与预览构建

默认的 `--mode release` 要求项目离线完整、运行时已锁定，否则拒绝构建——成品在游玩时不依赖任何网络。`--mode preview` 放宽这些要求，便于快速测试。

插件版本来自项目旁的锁文件（`deneb.lock.json`、`vega.plugins.lock.json`），因此同样的项目和锁文件总会得到同样的输出。[Altair 插件市场插件](https://github.com/haneoka-gakuen/altair-plugin-marketplace)可以替你写出 Vega 插件锁文件。

## 需要授权的运行时

有些角色需要你自行取得授权的第三方运行时，例如 Live2D Cubism Core。Deneb 从不擅自打包这类运行时；使用 `--allow-private-external-runtimes` 时，它会打包由项目提供的运行时，供你在该授权下分发。

## 自动化

每个命令都支持 `--json`，错误带有稳定的代码，因此 Deneb 很适合放进 CI。`deneb doctor --json` 可以让缺少工具链的构建机尽早失败。

## 参考

[Deneb 仓库](https://github.com/haneoka-gakuen/deneb)列出了完整的选项，并说明了项目格式、目标平台、运行时契约和插件系统。
