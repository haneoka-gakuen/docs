---
title: Bestdori provider API
description: Consume Haneoka's transformed Garupa data and media proxy.
---

Bestdori routes are read-only public projections. The `{region}` segment is a Bestdori provider region, not an Our Notes release server. Supported regions are `jp`, `en`, `tw`, `cn`, and `kr`.

## Catalog collections

```http
GET /api/v1/garupa/bestdori/{region}/bands
GET /api/v1/garupa/bestdori/{region}/songs
GET /api/v1/garupa/bestdori/{region}/song-meta
GET /api/v1/garupa/bestdori/{region}/characters
GET /api/v1/garupa/bestdori/{region}/cards
```

Collection responses are JSON objects keyed by the provider's numeric string IDs. Haneoka transforms names, image/audio paths, regional release metadata, and selected fields into browser-neutral DTOs. The transform can add optional fields as upstream data becomes available; preserve unknown keys.

## Individual records

```http
GET /api/v1/garupa/bestdori/{region}/songs/{musicId}
GET /api/v1/garupa/bestdori/{region}/song-meta/{musicId}
GET /api/v1/garupa/bestdori/{region}/cards/{cardId}
```

`musicId` and `cardId` are decimal provider IDs obtained from the collection response. Do not use an Our Notes catalog entity key in these routes.

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

Collection routes return JSON projections. The `editor-assets` root returns a merged resource tree; a bundle path returns the provider's file list. `storyId` is the canonical story filename/id returned by the collection and is URL-encoded as one segment.

## Charts and media

```http
GET /api/v1/garupa/bestdori/{region}/charts/{musicId}/{difficulty}
GET /api/v1/garupa/bestdori/{region}/media/jacket/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/jacket-thumb/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/sound/{soundId}
GET /api/v1/garupa/bestdori/{region}/media/mv/{filename}
GET /api/v1/garupa/bestdori/{region}/media/stage-challenge/{assetId}
```

Chart difficulties are `easy`, `normal`, `hard`, `expert`, or `special`. A chart response uses `text/plain` and contains an SS document serialized as JSON with `meta` and `score`; `score` contains events and notes. This is input to an SS converter, while `mountChart` expects the converted `ChartEmbedDocument`. Read the text and convert it before playback. Media routes pass through range and validator headers where the upstream supplies them.

```js
const response = await fetch("https://haneoka.org/api/v1/garupa/bestdori/jp/charts/1/expert");
if (!response.ok) throw new Error(`Chart HTTP ${response.status}`);
const scoreText = await response.text();
const ssDocument = JSON.parse(scoreText);
console.log(ssDocument.meta.version, ssDocument.score.events);
```

## Raw provider assets

```http
GET /api/v1/garupa/bestdori/{region}/raw/{providerPath}
```

Only safe provider paths are accepted. The route rejects traversal, encoded NULs, and an asset region that does not match `{region}`. Use transformed routes when available; raw paths are for provider files that have no normalized DTO.

## Live2D lookup

```http
GET /api/v1/garupa/bestdori/{region}/live2d?id={id}&id={id}&server={region}
```

IDs are de-duplicated and capped at 64. An empty request returns `{ "items": {}, "missing": [] }`; a non-empty request returns resolved entries and a missing list. `server` optionally chooses the provider region used for source lookup.

Provider failures use `{ "error": { "code": "bestdori_upstream", "message": "..." } }` with `502`; an unknown provider region returns `404 region_not_found`.
