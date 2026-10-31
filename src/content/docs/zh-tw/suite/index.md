---
title: 套件
description: Vega、Altair、Deneb、Cassiopeia 和 Sonolus 引擎——haneoka.org 背後的開源工具，以及它們如何協同工作。
---

haneoka.org 播放的一切——劇情、譜面、Home Spot 大廳——都執行在一組開源工具之上，你也可以把它們用在自己的專案裡。它們分為兩個系列：一個面向視覺小說，一個面向音樂遊戲。每個工具都可以單獨使用，由外掛組成，與其他工具搭配或不搭配都能工作。

## 視覺小說

| 工具 | 是什麼 | 用來 |
| --- | --- | --- |
| [Vega](/zh-tw/suite/vega/) | 播放器。面向網頁和原生應用的視覺小說引擎。 | 在網頁、應用或遊戲中播放故事。 |
| [Altair](/zh-tw/suite/altair/) | 編輯器。場景、語言、素材、預覽和流程圖集中在一個工作區。 | 編寫、翻譯和演出故事。 |
| [Deneb](/zh-tw/suite/deneb/) | 構建工具。命令列程式。 | 把完成的故事發布為網站、PWA、桌面應用或移動端工程。 |

一個典型專案會依次經過這三者：在 Altair 中編寫和本地化，邊寫邊在 Vega 中預覽，完成後用 Deneb 構建。它們共用同一種故事格式，中間不需要任何轉換。

Altair 還能開啟其他工具的專案——WebGAL 專案資料夾、Bestdori 劇本、純文字小說——而 Vega 藉助相容外掛可以直接播放 WebGAL 專案，因此已有專案無需重寫就能遷移進來。

## 音樂遊戲

| 工具 | 是什麼 | 用來 |
| --- | --- | --- |
| [Cassiopeia](/zh-tw/suite/cassiopeia/) | 音樂遊戲引擎，確定性核心同時有 TypeScript 和 Rust 實現。 | 在網頁或原生應用中展示、遊玩或分析譜面。 |
| [Sonolus 引擎](/zh-tw/sonolus/) | 面向 [Sonolus](https://sonolus.com) 的 Our Notes 引擎。 | 在 Sonolus 應用中游玩 Our Notes 譜面。 |

Cassiopeia 能讀取 Our Notes 和 Project Sekai 譜面，並把它們轉換為 Sonolus 關卡。haneoka.org 上的譜面播放器和譜面總覽就是它的 Vue 元件。

## 只想嵌入，不想自己搭建

如果只想把故事、譜面或 Home Spot 場景放到網頁上，[JavaScript 嵌入](/zh-tw/embed/)只需一個 script 標籤就能從 haneoka.org 載入全部內容。需要自己的資料、自己的外觀或自己的應用時，再直接使用這些工具。

## 倉庫

每個工具都在 [github.com/haneoka-gakuen](https://github.com/haneoka-gakuen) 下有自己的倉庫，外掛則是獨立的軟體包。各倉庫的 README 是該軟體包的完整參考；這些頁面講的是如何把它們組合起來使用。

它們都採用 MPL-2.0 許可：可以用於閉源專案，對這些檔案本身的修改需要回饋共享。
