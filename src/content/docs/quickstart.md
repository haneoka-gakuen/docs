---
title: Quickstart
description: Read current songs and regional data with curl or fetch.
---

## 1. Read the current song index

The direct resource API selects the current `intl` catalog when `server` is omitted:

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
```

The response is an object whose keys are song IDs. Each value is the published song DTO. A current response has fields like these:

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

Use a key returned by the index for the next request. Resource names and IDs come from the current catalog, so a client should discover them from responses or from the catalog manifest.

## 2. Read one song

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
```

The entity response contains the full resource DTO. For a song, that includes localized credits, publication dates, media URLs, and difficulty records. A difficulty record contains fields such as `difficultyName`, `displayLevel`, `noteCount`, `playLevel`, `sortLevel`, and the chart `file` path:

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

Keep localized arrays in their returned order. Their positions follow the source DTO; choose a locale deliberately and provide a fallback when an entry is `null` or empty.

## 3. Select another server

Add `server` to the same URL when you need another active server:

```bash
curl --fail-with-body 'https://haneoka.org/api/v1/events?server=jp'
curl --fail-with-body 'https://haneoka.org/api/v1/songs/100001?server=jp'
```

An events response can be empty while remaining successful:

```json
{
  "entries": {},
  "hasGameEvents": false
}
```

The `server` value is a server slug such as `intl`, `intl-cbt`, `jp`, or `jp-cbt`. Read [`GET /api/v1/releases`](./servers/releases/) when a user needs the active slug list or its display names. Most applications can keep using the default `intl` server and omit this parameter.

## 4. Batch IDs

Repeat `id` to fetch several entities in one request:

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs?id=100001&id=100002'
```

The batch response has an `items` map and a `missing` array:

```json
{
  "items": {
    "100001": { "musicId": 100001, "musicTitle": ["迷星叫", "Mayoiuta"] }
  },
  "missing": ["100002"]
}
```

Treat `missing` as per-ID information. The request itself succeeded; retrying the same missing ID will not create it.

## 5. Use fetch in an application

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

Resolve relative media paths against `https://haneoka.org` and preserve `ETag` when you cache responses. The API returns JSON for catalog data and the media type declared by a file route for binary content.
