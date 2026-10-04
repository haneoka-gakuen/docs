---
title: 用本地音频创建谱面
description: 导入音频、放置音符、预览并保存可移植谱面工程。
---

[打开创作器](https://haneoka.org/zh-CN/chart-editor/create/) · [Haneoka 主站](https://haneoka.org/)

首版提供本地音频、单对象谱面编辑、时序、呈现预览、浏览器本地版本和可移植导出。先运行完整小样例，再换成自己的音频或谱面文件。

## 1. 打开完整入门样例

1. 下载 [local-demo.zip](/examples/creator/local-demo.zip)。
2. 打开[创作器](https://haneoka.org/zh-CN/chart-editor/create/)。
3. 点击**打开备份**，直接选择这个 ZIP。它是创作器备份格式，不是需要解压的素材目录包。
4. 等待 **Local audio starter** 载入：八秒原创 120 BPM 节拍音和三个可编辑音符。
5. 在预览区点击**播放**，再次点击暂停。真实音频时钟驱动作者画布；预览展示音符，不进行判定或计分。

备份导入建立新的本地工程，保留之前保存的工程。

## 2. 分别选择 JSON 和音频

把 [Haneoka-120bpm.wav](/examples/creator/Haneoka-120bpm.wav) 和 [local-demo.project.json](/examples/creator/local-demo.project.json)保存到文件夹：

```text
my-chart/
  Haneoka-120bpm.wav
  local-demo.project.json
```

1. 点击**从本地载入音乐**，选择 WAV，等待名称和时长显示。
2. 点击**从本地导入谱面**，选择 Project JSON。
3. 点击**播放**检查三个音符。JSON 是可编辑 Project 数据，音频单独选择。
4. 关闭页面或换来源前，点击**保存版本**。

音频应为浏览器可解码格式，上限 **32 MiB、600 秒、8 声道**。保存原始编码文件，解码 PCM 为临时数据。波形和最多三个 BPM 候选在本地计算，点击候选才应用，也可自行输入 BPM；同一节奏可能出现半倍速或双倍速候选。

谱面导入支持 **Project JSON、Our Notes/SS JSON、USC v2、SUS 文本**，上限 **2 MiB**。Sonolus LevelData 是部署格式，不作为可编辑 Project 导入。[Cassiopeia 教程](../../embed/cassiopeia/)的播放 ChartDocument 是另一种格式，创作器使用本页提供的 Project JSON。

## 3. 放置和检查音符

选择 Tap、Flick 或 Trace，点击编辑网格放置。默认坐标宽度为 24，显示六组轨道，每组宽 4。Hold、Guide 先点起点，再点时间更晚的终点；Escape 清除待放终点。

选择工具选中音符或连线点，属性区编辑拍、轨道、宽度、类型、Critical 和显示状态。Flick 有左/上/右方向，连线点有左右缓动。擦除会删除命中的单音或整条连线；复制连线点会复制整条连线，粘贴到当前音频位置并生成新 ID。

| 控件 | 默认 / 可用值 | 作用 |
| --- | --- | --- |
| 工具 | Tap / 选择、Tap、Flick、Trace、Hold、Guide、擦除、平移 | 选择、放置、删除或平移视图。 |
| 吸附 | 1/4 / 1/1、1/2、1/3、1/4、1/6、1/8、1/12、1/16 | 放置、粘贴的音乐细分。 |
| 可见范围 | 4 秒 / .5、1、2、4、8、16 秒及滚轮值 | 视图缩放，保留创作时序。 |
| 播放速度 | 1× / .25、.5、.75、1、1.25、1.5、2× | 音频预览速度。 |
| 新 Critical | false | 新音符默认标记。 |
| 新 Flick 方向 | 上 / 左、上、右 | 新 Flick 默认方向。 |
| 插入轨道 | 0，按可见跨度夹取 | 在当前配乐位置用按钮新增音符。 |
| 初始 BPM | 120，有限正数 | 初始工程速度，候选只改此事件。 |
| 音乐偏移 | 0，有限秒数 | 加到音乐时间零点。 |

工程区编辑标题、艺术家、谱师、初始 BPM 和音乐偏移。新增 BPM 在当前吸附位置插入，拒绝相同 tick；时间倍率加入正数滚动倍率。JSON 保留拍号事件和来源扩展。

滚轮平移时间，Ctrl/Command+滚轮围绕指针时间缩放，平移工具拖动视图。移至播放位置跟随配乐，拍字段用于预览跳转。这些操作保留创作时序。

## 4. 保存、恢复与导出

保存版本储存修改；已保存谱面重开本地工程，版本恢复快照。旧快照修改后保存，会在递增历史上创建新版本。切换已保存工程或导出前，工作区保存当前已修改谱面。

音频和版本位于当前浏览器 IndexedDB；清除站点储存会删除本地库，因此保留导出备份。另一标签页抢先保存时会报告冲突，重新打开已保存工程，或用保存副本单独保留当前草稿。

| 下载 | 内容 |
| --- | --- |
| 备份 ZIP | 原稿、当前快照、可选原始来源文本和按 SHA-256 标识的原始/当前编码音频；用打开备份读取。全部本地历史仍在浏览器。 |
| Haneoka 工程 JSON | 完整可编辑谱面，包括扩展和标记；音频独立保存。 |
| Our Notes/SS、USC v2 | 转换谱面 JSON，格式提示列出省略或正规化字段。继续创作时保留 Project 或备份。 |

首版将 SUS 用于导入。备份含 `project.yaml` 中的 JSON（合法 YAML 1.2）及最多两个 `audio/<sha256>` 条目。导入校验谱面、envelope 和音频哈希，最多三个条目，预算为 4 MiB manifest 加两个 32 MiB 音频。用创作器导出按钮创建备份。

## Project JSON 全部字段

样例含全部必填字段：version 1、resolution 480、laneBasis 24。一拍为 480 tick，120 BPM 时 tick480 的首音符在 .5 秒。

| 字段 | 类型 / 限制 |
| --- | --- |
| version / resolution | 固定值 1 / 480。 |
| laneBasis | 有限正数，默认 24，来源格式可保留其他宽度。 |
| meta | title/artist/charter/difficulty/level 必填 string；可选 source:string、tags:string[]、extra:JSON object。 |
| audioOffset | 有限秒数。 |
| tempos | 非空 `{id,tick,bpm}[]`，tick 非负 safe integer、唯一，必须有 tick0，BPM 有限正数。 |
| meters | 非空 `{id,tick,numerator,denominator}[]`，分子正 safe integer，分母为正二次幂，tick 非负且唯一。 |
| timeScales | `{id,tick,scale}[]`，tick 非负 safe integer、唯一，scale 有限正数。 |
| singles | 下述单音数组。 |
| lines | `{id,kind:"long"|"guide",critical?:boolean,points:LinePoint[]}[]`，至少两个点，tick 不递减。 |
| markers | `{skill:number[],fever:[number,number][],call:{tick:number,timing:number[]}[]}`，tick 非负 safe integer，call timing 为有限数。 |
| extensions | 必填 JSON object，保留来源数据。 |
| sourceOrder | 可选 string[]，保留来源顺序。 |

音符包含唯一非空 id、非负 safe integer tick、有限 lane、非负有限 size、type:"tap"|"flick"|"trace"、boolean critical/visible 和 direction:none/left/up/right。Tap 使用 none。音符、连线和时间事件的 ID 都唯一；超出舞台的跨度显示 warning 并保留原值。

连线点增加 `ease:{left:"linear"|"in"|"out",right:"linear"|"in"|"out"}`；lane 可为 `"auto"`，可选 resolvedLane/resolvedSize/autoSize 保留插值数据。从完整样例开始，校验会指出无效字段。

## 快捷键和恢复

画布获得焦点时：Ctrl/Command+S 保存，Ctrl/Command+Z 撤销，Ctrl/Command+Shift+Z 或 Ctrl/Command+Y 重做，Ctrl/Command+C/V 复制粘贴。Delete/Backspace 删除，空格播放暂停，Escape 清选择或待放终点，1–7 切选择/Tap/Flick/Trace/Hold/Guide/擦除，上下键移动窗口。文本和 Material 输入保留正常键盘行为。

音频错误先试小 WAV，检查限制与 codec。缺音频或哈希错误需要完整导出备份；储存冲突或数据库被阻挡时关闭其他标签页。释放空间前先导出备份。首版覆盖本地单对象创作和呈现预览，高级编辑与来源平台/发表集成有各自上线范围。
