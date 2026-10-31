---
title: Altair
description: 編寫、翻譯和演出視覺小說，配有實時 Vega 預覽、流程圖，以及 WebGAL、Bestdori 和純文字匯入。
---

Altair 是套件中的編輯器。一個專案——場景、語言、素材、角色和外掛——在同一個工作區中開啟：指令碼檢視和每條命令的表單、素材瀏覽器、整個故事的流程圖，以及跟隨遊標的實時 [Vega](/zh-tw/suite/vega/) 預覽。你編輯的正是 Vega 播放、[Deneb](/zh-tw/suite/deneb/) 釋出的同一份資料。

## 開始一個專案

有三種方式：

- **開啟資料夾。** 在 Chromium 核心的瀏覽器中，Altair 可以直接處理磁碟上的資料夾：從中讀取場景和素材，並把修改寫回原檔案。其他瀏覽器以只讀方式開啟檔案，修改需要匯出。
- **匯入。** WebGAL 專案資料夾和 WebGAL Craft 專案、Bestdori 劇本、ADV JSON 以及純文字都能變成 Altair 專案。未修改的 WebGAL 場景會逐位元組原樣寫回。
- **從示例開始。** [First Light](https://github.com/haneoka-gakuen/vega-example-first-light) 是一個專門用來開啟和修改的短篇故事。

## 編寫

每條命令都有帶型別欄位的表單——說話人、各語言的臺詞、角色的動作和表情、從素材瀏覽器選擇的背景、帶緩動的鏡頭運動。指令碼檢視為每條命令顯示一行摘要，隨時可以切換到原始碼。

專案可以有任意多種語言，每種語言有自己的字型。文字欄位同時儲存所有語言，預覽播放你選擇的那一種。

[Altair Prose](https://github.com/haneoka-gakuen/altair-plugin-prose) 能把貼上進來的章節變成場景草稿：帶說話人的行和引號中的對話成為臺詞，其餘成為旁白，並全部標記為待審閱。

## 檢視故事

- **預覽。** Vega 預覽隨輸入實時更新，跳到遊標所在的命令，可以從任意位置播放、設定斷點逐步執行，或者不儲存直接試執行幾條命令。在舞臺上拖動角色，位置會寫回命令。
- **流程圖。** 以圖的形式展示場景、選項、跳轉、呼叫和結局，並報告沒有任何路徑能到達的場景、跳到不存在標籤的跳轉、重複的標籤以及沒有出口的迴圈。
- **角色。** [Altair Models](https://github.com/haneoka-gakuen/altair-plugin-models) 可以用 Live2D、圖片、GIF 和影片組合出分層角色，並一鍵加入場景。

## 安全保障

撤銷和重做覆蓋專案和每個開啟的檔案。未儲存的修改會作為草稿儲存在瀏覽器中，重新整理或崩潰後都能恢復；如果專案在此期間被修改，Altair 會指出哪些草稿已不再適用，而不會覆蓋任何內容。

## 來自遊戲資料來源的素材

配置網路介面卡後，素材瀏覽器可以顯示：

- [haneoka.org 資料庫](https://github.com/haneoka-gakuen/altair-plugin-haneoka)中 Our Notes 的背景、靜幀、特效、Live2D、BGM 和語音，還能把官方劇情整篇作為可編輯專案開啟；
- [Bestdori](https://github.com/haneoka-gakuen/altair-plugin-bestdori) 中 Girls Band Party 的素材樹。

## 外掛

以上一切都是外掛。[Altair Full Preset](https://github.com/haneoka-gakuen/altair-preset-full) 會安裝全部官方外掛。專案會記錄自己使用的外掛，[外掛市場外掛](https://github.com/haneoka-gakuen/altair-plugin-marketplace)在構建前檢查它們的版本、依賴和許可權並寫出鎖檔案。第三方外掛可以藉助[沙箱](https://github.com/haneoka-gakuen/altair-plugin-sandbox)在獨立的 Worker 中執行。

## 執行 Altair

```sh
git clone https://github.com/haneoka-gakuen/altair.git
cd altair
pnpm install --frozen-lockfile
pnpm dev
```

要用同樣的元件搭建自己的編輯器，安裝 `@haneoka/altair` 和需要的外掛，建立 `AltairPluginHost` 並安裝它們即可。各外掛的 README 說明瞭具體做法。
