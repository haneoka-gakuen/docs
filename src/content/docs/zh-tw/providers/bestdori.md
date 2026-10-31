---
title: Bestdori provider API
description: 使用 Haneoka 轉換後的 Garupa 資料和 media proxy。
---

Bestdori 路由是隻讀的公開 projection。`{region}` 片段表示 Bestdori provider region，不是 Our Notes release server。支援的 region 是 `jp`、`en`、`tw`、`cn` 和 `kr`。

## Catalog collections

```http
GET /api/v1/garupa/bestdori/{region}/bands
GET /api/v1/garupa/bestdori/{region}/songs
GET /api/v1/garupa/bestdori/{region}/song-meta
GET /api/v1/garupa/bestdori/{region}/characters
GET /api/v1/garupa/bestdori/{region}/cards
```

Collection 回應是以 provider 數字字串 ID 為鍵的 JSON 物件。Haneoka 會將名稱、圖片/音訊路徑、區域 release metadata 和選定欄位轉換為瀏覽器無關的 DTO。隨著 upstream 資料可用，轉換可能增加可選欄位；請保留未知鍵。

## Individual records

```http
GET /api/v1/garupa/bestdori/{region}/songs/{musicId}
GET /api/v1/garupa/bestdori/{region}/song-meta/{musicId}
GET /api/v1/garupa/bestdori/{region}/cards/{cardId}
```

`musicId` 和 `cardId` 是從 collection 回應獲取的十進位制 provider ID。不要在這些路由中使用 Our Notes catalog entity key。

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

Collection 路由返回 JSON projection。`editor-assets` 根路由返回合併後的 resource tree；bundle path 返回 provider 的檔案列表。`storyId` 是 collection 返回的規範 story filename/id，並作為一個片段進行 URL 編碼。

## Charts and media

```http
GET /api/v1/garupa/bestdori/{region}/charts/{musicId}/{difficulty}
GET /api/v1/garupa/bestdori/{region}/media/jacket/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/jacket-thumb/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/sound/{soundId}
GET /api/v1/garupa/bestdori/{region}/media/mv/{filename}
GET /api/v1/garupa/bestdori/{region}/media/stage-challenge/{assetId}
```

Chart difficulty 是 `easy`、`normal`、`hard`、`expert` 或 `special`。譜面回應的 Content-Type 為 `text/plain`，內容是 SS 格式的 JSON 文字，頂層包含 `meta` 與 `score`；`score` 包含事件和音符。它與播放器要求的 `ChartEmbedDocument` 是兩個不同階段的資料。先讀取 SS 文字，再透過相應的 SS 轉換器生成播放器譜面；不要把該回應直接傳給 mountChart。Media 路由在上游支援時傳遞 range 和 validator headers。

```js
const response = await fetch("https://haneoka.org/api/v1/garupa/bestdori/jp/charts/1/expert");
if (!response.ok) throw new Error(`譜面 HTTP ${response.status}`);
const scoreText = await response.text();
const ssDocument = JSON.parse(scoreText);
console.log(ssDocument.meta.version, ssDocument.score.events);
```

## Raw provider assets

```http
GET /api/v1/garupa/bestdori/{region}/raw/{providerPath}
```

只接受安全的 provider path。該路由會拒絕 traversal、編碼後的 NUL，以及與 `{region}` 不匹配的 asset region。若存在轉換路由，請優先使用；raw path 用於沒有規範化 DTO 的 provider 檔案。

## Live2D lookup

```http
GET /api/v1/garupa/bestdori/{region}/live2d?id={id}&id={id}&server={region}
```

ID 會去重，最多 64 個。空請求返回 `{ "items": {}, "missing": [] }`；非空請求返回已解析條目和 missing 列表。`server` 可選，用於選擇 source lookup 使用的 provider region。

Provider 失敗時返回 `{ "error": { "code": "bestdori_upstream", "message": "..." } }` 和 `502`；未知 provider region 返回 `404 region_not_found`。
