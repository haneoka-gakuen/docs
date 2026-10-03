---
title: 快速开始
description: 使用 curl 或 fetch 读取当前歌曲和区域资料。
---

## 先在浏览器看到结果

[打开完整歌曲读取网页](/examples/api-start-zh.html)，点击「读取歌曲列表」，再选一首歌。你会看见它的标题、编号、乐队和封面；「完整响应」可以展开查看原始 JSON。例子只读取公开资料，使用已托管客户端，无需安装 npm。

要保存为自己的网页，将下面全部代码复制到纯文本编辑器，以 UTF-8 保存为 `index.html`，放进 `my-api` 文件夹。也可以把[完整 HTML](/examples/api-start-zh.html)直接另存为该文件。电脑有 Python 3 时，在这个文件夹打开终端，运行 `python3 -m http.server 8000`（Windows 使用 `py -m http.server 8000`），再打开 [http://localhost:8000/](http://localhost:8000/)。没有 Python 时可按 [Python 官网](https://www.python.org/downloads/)安装说明准备，或使用已有编辑器的 HTTP 预览。

```text
my-api/
  index.html
```

读取失败时页面会给出原因；点「读取歌曲列表」重试。「取消」停止本次读取，「清理」移除列表与图片后可以重新开始。

<details>
<summary>完整 index.html：全部复制</summary>

```html
<!doctype html>
<html lang="zh-CN">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>用 Haneoka 读取歌曲</title>
<style>
body { max-width: 60rem; margin: auto; padding: 1rem; font: 1rem/1.5 sans-serif; color: CanvasText; background: Canvas; }
button { font: inherit; min-height: 48px; padding: .5rem 1rem; margin: .25rem; }
#songs { display: flex; flex-wrap: wrap; gap: .5rem; }
img { width: 240px; aspect-ratio: 1; object-fit: contain; } [hidden] { display: none !important; }
pre { overflow: auto; max-height: 25rem; }
</style>
<h1>用 Haneoka 读取歌曲</h1>
<p>示例显示列表的前8首。选一首歌，查看标题与封面。</p>
<button id="load">读取歌曲列表</button><button id="cancel" disabled>取消</button><button id="clear">清理</button>
<p id="status" role="status" aria-live="polite">点击读取歌曲列表。</p>
<div id="songs" aria-label="歌曲"></div>
<section id="detail" hidden><h2 id="title"></h2><img id="jacket" alt="歌曲封面" referrerpolicy="no-referrer"><p id="info"></p><a id="json" target="_blank" rel="noopener">打开完整歌曲 JSON</a><details><summary>完整响应</summary><pre id="output"></pre></details></section>
<script type="module">
const by = id => document.getElementById(id);
const origin = "https://haneoka.org";
const locale = "zh-CN", index = 3;
let api, controller, generation = 0;
const localize = value => Array.isArray(value) ? (value[index] || value.find(x => typeof x === "string" && x.trim()) || "未命名") : String(value ?? "未命名");
function clearDetail() { by("detail").hidden = true; by("jacket").removeAttribute("src"); by("json").removeAttribute("href"); by("output").textContent = ""; }
async function readSong(id) {
  const current = ++generation; controller?.abort(); controller = new AbortController(); clearDetail();
  by("load").disabled = true; by("cancel").disabled = false; by("status").textContent = "正在读取歌曲…";
  try {
    const song = await api.entity("songs", id, { server: "intl", locale, signal: controller.signal });
    if (current !== generation) return;
    by("title").textContent = localize(song.musicTitle);
    by("info").textContent = `ID ${song.musicId} · ${localize(song.bandName)}`;
    by("json").href = `${origin}/api/v1/songs/${encodeURIComponent(id)}?server=intl`;
    by("output").textContent = JSON.stringify(song, null, 2); by("detail").hidden = false;
    if (song.jacketUrl) { by("jacket").hidden = false; by("jacket").src = new URL(song.jacketUrl, origin).href; await by("jacket").decode(); }
    else by("jacket").hidden = true;
    if (current === generation) by("status").textContent = "标题与封面已加载。";
  } catch (error) { if (current === generation) by("status").textContent = `读取失败： ${error.message}`; }
  finally { if (current === generation) { by("load").disabled = false; by("cancel").disabled = true; } }
}
by("load").onclick = async () => {
  const current = ++generation; controller?.abort(); controller = new AbortController(); clearDetail(); by("songs").replaceChildren();
  by("load").disabled = true; by("cancel").disabled = false; by("status").textContent = "正在读取列表…";
  try {
    const { createHaneokaClient } = await import("https://haneoka.org/embed/api-client.js");
    if (current !== generation) return;
    api = createHaneokaClient({ transport: request => fetch(new Request(request, { referrerPolicy: "no-referrer" })) });
    const songs = await api.index("songs", { server: "intl", locale, signal: controller.signal });
    if (current !== generation) return;
    for (const [id, song] of Object.entries(songs).slice(0, 8)) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = localize(song.musicTitle); button.dataset.songId = id;
      button.onclick = () => { void readSong(id); }; by("songs").append(button);
    }
    by("status").textContent = by("songs").childElementCount ? "从下面选择一首歌。" : "当前没有歌曲。";
  } catch (error) { if (current === generation) by("status").textContent = `读取失败： ${error.message}`; }
  finally { if (current === generation) { by("load").disabled = false; by("cancel").disabled = true; } }
};
by("cancel").onclick = () => { generation++; controller?.abort(); by("load").disabled = false; by("cancel").disabled = true; by("status").textContent = "已取消，可以重试。"; };
by("clear").onclick = () => { generation++; controller?.abort(); clearDetail(); by("songs").replaceChildren(); by("load").disabled = false; by("cancel").disabled = true; by("status").textContent = "已清理，可以再次读取列表。"; };
window.addEventListener("pagehide", () => { generation++; controller?.abort(); }, { once: true });
</script>
</html>
```

</details>

下面逐步解释这个网页读取的接口。命令行例子在终端运行；浏览器用户可以直接打开完整地址查看 JSON。

## 1. 读取当前歌曲索引

省略 `server` 时，直接 resource API 读取当前国际服资料：

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
```

响应是以歌曲 ID 为键的 JSON object。每个值都是已发布的 歌曲数据对象：

```json
{
  "100001": {
    "musicId": 100001,
    "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
    "bandId": 1,
    "bandIds": [1],
    "bandName": ["MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!"],
    "jacketThumbUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/small/jkt_001_100001.png",
    "jacketUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png",
    "musicUrl": "/runtime/intl/cri/sound/musicscore/M_Mayoiuta/1_M_Mayoiuta.mp3",
    "vocalCharacterIds": [1]
  }
}
```

使用索引返回的键 发出下一次请求。资源名称与条目 ID 对应当前资料，使用响应中的键读取详情。

## 2. 读取一首歌曲

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
```

详情响应包含完整字段，包括本地化创作者、发布日期、media URL 和 difficulty records。每个难度包含 `difficultyName`、`displayLevel`、`noteCount`、`playLevel`、`sortLevel` 与谱面 `file` 路径：

```json
{
  "musicId": 100001,
  "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
  "difficulty": [
    {
      "difficulty": 0,
      "difficultyName": "easy",
      "displayLevel": 9,
      "noteCount": 342,
      "playLevel": 9,
      "sortLevel": 9,
      "file": "/assets/intl/Assets/AddressableResources/Live/MusicScore/0001/0001_00.bytes"
    }
  ]
}
```

本地化数组的顺序为 `ja`、`en`、`zh-TW`、`zh-CN`、`ko`。按目标语言选取对应项；空项可依次回退到日文、英文。

## 3. 选择其他服务器

在同一路径添加 `server`：

```bash
curl --fail-with-body 'https://haneoka.org/api/v1/events?server=jp'
curl --fail-with-body 'https://haneoka.org/api/v1/songs/100001?server=jp'
```

没有活动时，接口返回空列表：

```json
{
  "entries": {},
  "hasGameEvents": false
}
```

省略 `server` 时使用国际服 `intl`。其他标识从[当前服务器列表](https://haneoka.org/api/v1/releases)取得，再填入 server；可用服务器随发布变化。

## 4. 批量读取 ID

重复 `id` 读取多个 entity：

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs?id=100001&id=100002'
```

批量响应包含 `items` map 和 `missing` array：

```json
{
  "items": {
    "100001": { "musicId": 100001, "musicTitle": ["迷星叫", "Mayoiuta"] }
  },
  "missing": ["100002"]
}
```

`missing` 提供每个 ID 的结果。请求本身成功；重复请求同一个缺失 ID 不会创建该对象。

## 5. 在应用中使用 fetch

```js
const api = new URL("https://haneoka.org/api/v1/songs");
api.searchParams.set("server", "jp");

const response = await fetch(api);
if (!response.ok) {
  const detail = await response.json().catch(() => ({}));
  throw new Error(`${response.status}: ${detail.error?.code ?? "request_failed"}`);
}

const songs = await response.json();
console.log(songs["100001"]?.musicTitle[1] ?? "Untitled");
```

将相对 media path 解析到 `https://haneoka.org`，缓存时保留 `ETag`。Catalog 数据返回 JSON；二进制路由返回自身声明的 media type。
