---
title: Bestdori provider API
description: 使用 Haneoka 转换后的 Garupa 数据和 media proxy。
---

Bestdori 路由是只读的公开 projection。`{region}` 片段表示 Bestdori provider region，不是 Our Notes release server。支持的 region 是 `jp`、`en`、`tw`、`cn` 和 `kr`。

## Catalog collections

```http
GET /api/v1/garupa/bestdori/{region}/bands
GET /api/v1/garupa/bestdori/{region}/songs
GET /api/v1/garupa/bestdori/{region}/song-meta
GET /api/v1/garupa/bestdori/{region}/characters
GET /api/v1/garupa/bestdori/{region}/cards
```

Collection 响应是以 provider 数字字符串 ID 为键的 JSON 对象。Haneoka 会将名称、图片/音频路径、区域 release metadata 和选定字段转换为浏览器无关的 DTO。随着 upstream 数据可用，转换可能增加可选字段；请保留未知键。

## Individual records

```http
GET /api/v1/garupa/bestdori/{region}/songs/{musicId}
GET /api/v1/garupa/bestdori/{region}/song-meta/{musicId}
GET /api/v1/garupa/bestdori/{region}/cards/{cardId}
```

`musicId` 和 `cardId` 是从 collection 响应获取的十进制 provider ID。不要在这些路由中使用 Our Notes catalog entity key。

## Stories and editor assets

```http
GET /api/v1/garupa/bestdori/{region}/stories/event
GET /api/v1/garupa/bestdori/{region}/stories/band
GET /api/v1/garupa/bestdori/{region}/stories/main
GET /api/v1/garupa/bestdori/{region}/stories/afterlive
GET /api/v1/garupa/bestdori/{region}/stories/{storyId}
GET /api/v1/garupa/bestdori/{region}/editor-assets
GET /api/v1/garupa/bestdori/{region}/editor-assets/{bundlePath}
```

Collection 路由返回 JSON projection。`editor-assets` 根路由返回合并后的 resource tree；bundle path 返回 provider 的文件列表。`storyId` 是 collection 返回的规范 story filename/id，并作为一个片段进行 URL 编码。

## Charts and media

```http
GET /api/v1/garupa/bestdori/{region}/charts/{musicId}/{difficulty}
GET /api/v1/garupa/bestdori/{region}/media/jacket/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/jacket-thumb/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/sound/{soundId}
GET /api/v1/garupa/bestdori/{region}/media/mv/{filename}
GET /api/v1/garupa/bestdori/{region}/media/stage-challenge/{assetId}
```

Chart difficulty 是 `easy`、`normal`、`hard`、`expert` 或 `special`。谱面响应的 Content-Type 为 `text/plain`，内容是 SS 格式的 JSON 文本，顶层包含 `meta` 与 `score`；`score` 包含事件和音符。它与播放器要求的 `ChartEmbedDocument` 是两个不同阶段的数据。先读取 SS 文本，再通过相应的 SS 转换器生成播放器谱面；不要把该响应直接传给 mountChart。Media 路由在上游支持时传递 range 和 validator headers。

```js
const response = await fetch("https://haneoka.org/api/v1/garupa/bestdori/jp/charts/1/expert");
if (!response.ok) throw new Error(`谱面 HTTP ${response.status}`);
const scoreText = await response.text();
const ssDocument = JSON.parse(scoreText);
console.log(ssDocument.meta.version, ssDocument.score.events);
```

## Raw provider assets

```http
GET /api/v1/garupa/bestdori/{region}/raw/{providerPath}
```

只接受安全的 provider path。该路由会拒绝 traversal、编码后的 NUL，以及与 `{region}` 不匹配的 asset region。若存在转换路由，请优先使用；raw path 用于没有规范化 DTO 的 provider 文件。

## Live2D lookup

```http
GET /api/v1/garupa/bestdori/{region}/live2d?id={id}&id={id}&server={region}
```

ID 会去重，最多 64 个。空请求返回 `{ "items": {}, "missing": [] }`；非空请求返回已解析条目和 missing 列表。`server` 可选，用于选择 source lookup 使用的 provider region。

Provider 失败时返回 `{ "error": { "code": "bestdori_upstream", "message": "..." } }` 和 `502`；未知 provider region 返回 `404 region_not_found`。
