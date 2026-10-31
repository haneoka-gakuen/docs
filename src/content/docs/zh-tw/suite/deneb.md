---
title: Deneb
description: 把 Vega 專案構建為網站、離線 PWA、Electron 或 Tauri 應用，以及 Android 和 iOS 工程。
---

Deneb 是最後一步：它把完成的 [Vega](/zh-tw/suite/vega/) 專案變成可以安裝的作品。它確認專案需要的每個場景、素材和外掛都在，鎖定精確版本以便重複構建，然後輸出你需要的目標。所有目標都包含同一份專案和同一個播放器，所以故事在任何地方表現都一致。

## 安裝

```sh
git clone https://github.com/haneoka-gakuen/deneb.git
cd deneb
cargo install --locked --path crates/deneb-cli
```

## 從專案到構建

```sh
deneb doctor --target android                 # 這臺機器還缺什麼？
deneb validate my-story/project.vega.json     # 專案是否完整？
deneb plugins validate my-story/project.vega.json
deneb build my-story/project.vega.json --target pwa --output dist --runtime-bundle ./vega-runtime
```

`--runtime-bundle` 指向要打包的 Vega 執行時：一個帶有說明檔案 `deneb-runtime.json` 的資料夾。

## 目標平臺

| 目標 | 得到 |
| --- | --- |
| `web` | 使用相對連結的靜態網站，可上傳到任何地方、任何路徑。 |
| `pwa` | 網站加上清單和 Service Worker，可離線遊玩、可安裝。 |
| `electron` | 啟用 Chromium 沙箱的桌面應用。 |
| `tauri` | 下載體積小得多的桌面應用。 |
| `android`、`ios` | 可用 Android Studio 或 Xcode 開啟的原生工程。 |

桌面和移動端構建使用 `--bundle-identifier`（預設 `app.vega.<project-id>`）。

## 釋出構建與預覽構建

預設的 `--mode release` 要求專案離線完整、執行時已鎖定，否則拒絕構建——成品在遊玩時不依賴任何網路。`--mode preview` 放寬這些要求，便於快速測試。

外掛版本來自專案旁的鎖檔案（`deneb.lock.json`、`vega.plugins.lock.json`），因此同樣的專案和鎖檔案總會得到同樣的輸出。[Altair 外掛市場外掛](https://github.com/haneoka-gakuen/altair-plugin-marketplace)可以替你寫出 Vega 外掛鎖檔案。

## 需要授權的執行時

有些角色需要你自行取得授權的第三方執行時，例如 Live2D Cubism Core。Deneb 從不擅自打包這類執行時；使用 `--allow-private-external-runtimes` 時，它會打包由專案提供的執行時，供你在該授權下分發。

## 自動化

每個命令都支援 `--json`，錯誤帶有穩定的程式碼，因此 Deneb 很適合放進 CI。`deneb doctor --json` 可以讓缺少工具鏈的構建機儘早失敗。

## 參考

[Deneb 倉庫](https://github.com/haneoka-gakuen/deneb)列出了完整的選項，並說明瞭專案格式、目標平臺、執行時契約和外掛系統。
