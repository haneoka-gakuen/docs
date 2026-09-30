---
title: 快速开始
description: 使用 curl 或 fetch 读取当前歌曲和区域资料。
---

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

服务器标识包括 `intl`（国际服）、`jp`（日服）、`intl-cbt` 和 `jp-cbt`（测试服归档）。省略 `server` 时使用国际服。

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

```ts
const api = new URL("https://haneoka.org/api/v1/songs");
api.searchParams.set("server", "jp");

const response = await fetch(api);
if (!response.ok) {
  const detail = await response.json().catch(() => ({}));
  throw new Error(`${response.status}: ${detail.error?.code ?? "request_failed"}`);
}

const songs = await response.json() as Record<string, {
  musicId: number;
  musicTitle: Array<string | null>;
  musicUrl?: string | null;
}>;
console.log(songs["100001"]?.musicTitle[1] ?? "Untitled");
```

将相对 media path 解析到 `https://haneoka.org`，缓存时保留 `ETag`。Catalog 数据返回 JSON；二进制路由返回自身声明的 media type。
