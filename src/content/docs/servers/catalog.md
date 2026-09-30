---
title: Catalog data
description: Browse current resources, entities, views, relations, and batches.
---

## Start with the direct routes

Use the short current-data URLs for ordinary application reads:

```http
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}?server=jp
GET /api/v1/{resource}/{id}?server=jp
```

The default server is `intl`. The `server` query selects another active server. These routes use the same catalog handler as `/api/v1/servers/{server}/{resource}`; the explicit form belongs in build and archival tooling that also needs a release parameter.

Common resource names include `songs`, `bands`, `characters`, `cards`, `stories`, `events`, `audio`, `videos`, and `voices`. The selected catalog is authoritative: use its resource names, IDs, views, and relations instead of maintaining a hard-coded list.

## Resource indexes and entities

An index request returns a provider-shaped document. Collection resources commonly return an object keyed by entity ID:

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
```

```json
{
  "100001": {
    "musicId": 100001,
    "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
    "bandId": 1,
    "difficulty": [
      { "difficulty": 0, "difficultyName": "easy", "displayLevel": 9, "noteCount": 342 }
    ],
    "jacketUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png",
    "musicUrl": "/runtime/intl/cri/sound/musicscore/M_Mayoiuta/1_M_Mayoiuta.mp3"
  }
}
```

Read the complete entity with its key:

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
```

The entity may contain more fields than the index entry, such as localized credits, publication dates, combo rewards, chart paths, and video IDs. Preserve unknown fields and treat `null` as an explicit missing source value. Other resources define their own shapes; an event document, for example, uses `entries` and `hasGameEvents` rather than song fields.

## Batch reads

Repeat `id` to fetch a small set of entities:

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs?id=100001&id=100002&server=jp'
```

The response is:

```json
{
  "items": {
    "100001": { "musicId": 100001, "musicTitle": ["迷星叫", "Mayoiuta"] }
  },
  "missing": ["100002"]
}
```

`items` is keyed by the requested ID. `missing` lists IDs with no entity. The API sorts and de-duplicates IDs for cache stability.

## Views and relations

The catalog manifest declares optional views and relations for each resource. A view is a named projection with its own index and entity shape:

```http
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/views/{view}?id={id}&id={id}
```

A relation is addressed by its resource, relation name, and key:

```http
GET /api/v1/{resource}/relations/{relation}/{key}
```

The manifest's `valueMode` explains the result. `ids` relations expand to canonical entities keyed by ID. `records` relations return provider records from the relation document. An empty relation key returns `{}` when the relation exists but has no value.

Use the selected server's manifest when you need these names:

```bash
curl --fail-with-body https://haneoka.org/api/v1/servers/intl/catalog
```

The manifest describes resource `kind`, count, index path, entity store, view paths and shapes, relation names, and dependencies. Its storage fields are useful for a crawler; application code can stay on the direct routes.

## Field semantics that matter in clients

| Field pattern | How to use it |
| --- | --- |
| Localized arrays such as `musicTitle` and `bandName` | Choose the documented locale position and fall back when the value is empty. Keep the array for later locale changes. |
| `*Url` and `file` paths | Resolve against `https://haneoka.org`; send the path back to the matching media or game-client route when a binary request is needed. |
| Difficulty records | Read `difficultyName`, `displayLevel`, `playLevel`, `sortLevel`, and `noteCount` as separate values. Preserve the chart `file` path. |
| IDs such as `musicId`, `bandId`, and `videoIds` | Keep the source numeric or string type. IDs are resource-specific. |
| `null` values | The source currently has no value. Do not convert `null` into an empty string. |

## Advanced explicit form

For a server-scoped request, use:

```http
GET /api/v1/servers/{server}/{resource}
GET /api/v1/servers/{server}/{resource}/{id}
```

Add `release=r-<20 lowercase hex characters>` only when a reproducible build or archive needs one immutable catalog. [Advanced server contracts](./releases/) explains the release, source, media, and storage surfaces.
