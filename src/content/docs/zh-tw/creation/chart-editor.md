---
title: 用本地音訊建立譜面
description: 匯入音訊、放置音符、預覽並儲存可移植譜面工程。
---

[開啟創作器](https://haneoka.org/zh-CN/chart-editor/create/) · [Haneoka 主站](https://haneoka.org/)

首版提供本地音訊、單物件譜面編輯、時序、呈現預覽、瀏覽器本地版本和可移植匯出。先執行完整小樣例，再換成自己的音訊或譜面檔案。

## 1. 開啟完整入門樣例

1. 下載 [local-demo.zip](/examples/creator/local-demo.zip)。
2. 開啟[創作器](https://haneoka.org/zh-CN/chart-editor/create/)。
3. 點選**開啟備份**，直接選擇這個 ZIP。它是創作器備份格式，不是需要解壓的素材目錄包。
4. 等待 **Local audio starter** 載入：八秒原創 120 BPM 節拍音和三個可編輯音符。
5. 在預覽區點選**播放**，再次點選暫停。真實音訊時鐘驅動作者畫布；預覽展示音符，不進行判定或計分。

備份匯入建立新的本地工程，保留之前儲存的工程。

## 2. 分別選擇 JSON 和音訊

把 [Haneoka-120bpm.wav](/examples/creator/Haneoka-120bpm.wav) 和 [local-demo.project.json](/examples/creator/local-demo.project.json)儲存到資料夾：

```text
my-chart/
  Haneoka-120bpm.wav
  local-demo.project.json
```

1. 點選**從本地載入音樂**，選擇 WAV，等待名稱和時長顯示。
2. 點選**從本地匯入譜面**，選擇 Project JSON。
3. 點選**播放**檢查三個音符。JSON 是可編輯 Project 資料，音訊單獨選擇。
4. 關閉頁面或換來源前，點選**儲存版本**。

音訊應為瀏覽器可解碼格式，上限 **32 MiB、600 秒、8 聲道**。儲存原始編碼檔案，解碼 PCM 為臨時資料。波形和最多三個 BPM 候選在本地計算，點選候選才應用，也可自行輸入 BPM；同一節奏可能出現半倍速或雙倍速候選。

譜面匯入支援 **Project JSON、Our Notes/SS JSON、USC v2、SUS 文字**，上限 **2 MiB**。Sonolus LevelData 是部署格式，不作為可編輯 Project 匯入。[Cassiopeia 教程](../../embed/cassiopeia/)的播放 ChartDocument 是另一種格式，創作器使用本頁提供的 Project JSON。

## 3. 放置和檢查音符

選擇 Tap、Flick 或 Trace，點選編輯網格放置。預設座標寬度為 24，顯示六組軌道，每組寬 4。Hold、Guide 先點起點，再點時間更晚的終點；Escape 清除待放終點。

選擇工具選中音符或連線點，屬性區編輯拍、軌道、寬度、型別、Critical 和顯示狀態。Flick 有左/上/右方向，連線點有左右緩動。擦除會刪除命中的單音或整條連線；複製連線點會複製整條連線，貼上到當前音訊位置並生成新 ID。

| 控制元件 | 預設 / 可用值 | 作用 |
| --- | --- | --- |
| 工具 | Tap / 選擇、Tap、Flick、Trace、Hold、Guide、擦除、平移 | 選擇、放置、刪除或平移檢視。 |
| 吸附 | 1/4 / 1/1、1/2、1/3、1/4、1/6、1/8、1/12、1/16 | 放置、貼上的音樂細分。 |
| 可見範圍 | 4 秒 / .5、1、2、4、8、16 秒及滾輪值 | 檢視縮放，保留創作時序。 |
| 播放速度 | 1× / .25、.5、.75、1、1.25、1.5、2× | 音訊預覽速度。 |
| 新 Critical | false | 新音符預設標記。 |
| 新 Flick 方向 | 上 / 左、上、右 | 新 Flick 預設方向。 |
| 插入軌道 | 0，按可見跨度夾取 | 在當前配樂位置用按鈕新增音符。 |
| 初始 BPM | 120，有限正數 | 初始工程速度，候選只改此事件。 |
| 音樂偏移 | 0，有限秒數 | 加到音樂時間零點。 |

工程區編輯標題、藝術家、譜師、初始 BPM 和音樂偏移。新增 BPM 在當前吸附位置插入，拒絕相同 tick；時間倍率加入正數滾動倍率。JSON 保留拍號事件和來源擴充套件。

滾輪平移時間，Ctrl/Command+滾輪圍繞指標時間縮放，平移工具拖動檢視。移至播放位置跟隨配樂，拍欄位用於預覽跳轉。這些操作保留創作時序。

## 4. 儲存、恢復與匯出

儲存版本儲存修改；已儲存譜面重開本地工程，版本恢復快照。舊快照修改後儲存，會在遞增歷史上建立新版本。切換已儲存工程或匯出前，工作區儲存當前已修改譜面。

音訊和版本位於當前瀏覽器 IndexedDB；清除站點儲存會刪除本地庫，因此保留匯出備份。另一標籤頁搶先儲存時會報告衝突，重新開啟已儲存工程，或用儲存副本單獨保留當前草稿。

| 下載 | 內容 |
| --- | --- |
| 備份 ZIP | 原稿、當前快照、可選原始來源文字和按 SHA-256 標識的原始/當前編碼音訊；用開啟備份讀取。全部本地歷史仍在瀏覽器。 |
| Haneoka 工程 JSON | 完整可編輯譜面，包括擴充套件和標記；音訊獨立儲存。 |
| Our Notes/SS、USC v2 | 轉換譜面 JSON，格式提示列出省略或正規化欄位。繼續創作時保留 Project 或備份。 |

首版將 SUS 用於匯入。備份含 `project.yaml` 中的 JSON（合法 YAML 1.2）及最多兩個 `audio/<sha256>` 條目。匯入校驗譜面、envelope 和音訊雜湊，最多三個條目，預算為 4 MiB manifest 加兩個 32 MiB 音訊。用創作器匯出按鈕建立備份。

## Project JSON 全部欄位

樣例含全部必填欄位：version 1、resolution 480、laneBasis 24。一拍為 480 tick，120 BPM 時 tick480 的首音符在 .5 秒。

| 欄位 | 型別 / 限制 |
| --- | --- |
| version / resolution | 固定值 1 / 480。 |
| laneBasis | 有限正數，預設 24，來源格式可保留其他寬度。 |
| meta | title/artist/charter/difficulty/level 必填 string；可選 source:string、tags:string[]、extra:JSON object。 |
| audioOffset | 有限秒數。 |
| tempos | 非空 `{id,tick,bpm}[]`，tick 非負 safe integer、唯一，必須有 tick0，BPM 有限正數。 |
| meters | 非空 `{id,tick,numerator,denominator}[]`，分子正 safe integer，分母為正二次冪，tick 非負且唯一。 |
| timeScales | `{id,tick,scale}[]`，tick 非負 safe integer、唯一，scale 有限正數。 |
| singles | 下述單音陣列。 |
| lines | `{id,kind:"long"|"guide",critical?:boolean,points:LinePoint[]}[]`，至少兩個點，tick 不遞減。 |
| markers | `{skill:number[],fever:[number,number][],call:{tick:number,timing:number[]}[]}`，tick 非負 safe integer，call timing 為有限數。 |
| extensions | 必填 JSON object，保留來源資料。 |
| sourceOrder | 可選 string[]，保留來源順序。 |

音符包含唯一非空 id、非負 safe integer tick、有限 lane、非負有限 size、type:"tap"|"flick"|"trace"、boolean critical/visible 和 direction:none/left/up/right。Tap 使用 none。音符、連線和時間事件的 ID 都唯一；超出舞臺的跨度顯示 warning 並保留原值。

連線點增加 `ease:{left:"linear"|"in"|"out",right:"linear"|"in"|"out"}`；lane 可為 `"auto"`，可選 resolvedLane/resolvedSize/autoSize 保留插值資料。從完整樣例開始，校驗會指出無效欄位。

## 快捷鍵和恢復

畫布獲得焦點時：Ctrl/Command+S 儲存，Ctrl/Command+Z 撤銷，Ctrl/Command+Shift+Z 或 Ctrl/Command+Y 重做，Ctrl/Command+C/V 複製貼上。Delete/Backspace 刪除，空格播放暫停，Escape 清選擇或待放終點，1–7 切選擇/Tap/Flick/Trace/Hold/Guide/擦除，上下鍵移動視窗。文字和 Material 輸入保留正常鍵盤行為。

音訊錯誤先試小 WAV，檢查限制與 codec。缺音訊或雜湊錯誤需要完整匯出備份；儲存衝突或資料庫被阻擋時關閉其他標籤頁。釋放空間前先匯出備份。首版覆蓋本地單物件創作和呈現預覽，高階編輯與來源平臺/發表整合有各自上線範圍。
