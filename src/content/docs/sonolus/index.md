---
title: Sonolus API
description: Open Haneoka in Sonolus and retrieve its charts, playlists, and presentation resources.
---

Add **`https://haneoka.org`** as the server address in Sonolus, or [open Haneoka in the app](https://open.sonolus.com/haneoka.org). The app adds `/sonolus` when requesting protocol endpoints. Each item's `source` identifies this same server address.

The public service supplies Our Notes charts, GBP charts, song playlists, note skins, backgrounds, sound packs, native particle effects, and the play engine. Requests use `GET` or `HEAD`; JSON responses carry `Sonolus-Version`.

## Server information

```http
GET /sonolus/info
```

The response contains the server title, opening sections, configuration, and banner. Follow a resource's returned URL to retrieve its bytes.

## Charts

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

Lists contain 20 entries per page and start at page zero. A level name identifies the service, game server, song, and difficulty:

```text
#haneoka-jp-100109-expert
#haneoka-intl-100109-expert
#haneoka-gbp-1234-expert
```

Use the exact name returned by the list. Names stay stable as the underlying game data updates. Encode the name as a URL path segment: `#` becomes `%23`.

```http
GET /sonolus/levels/%23haneoka-jp-100109-expert
```

A level contains its engine, presentation choices, jacket, audio, and chart data. Its `data` object supplies the URL and 40-character SHA-1 hash of the compressed chart bytes. Retrieve that URL directly; the hash identifies immutable content.

Add `?type=random` to `/sonolus/levels/info` or `/sonolus/levels/list` for a random chart.

## Song playlists

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

A playlist groups a song's difficulties and contains complete level items. Names such as `#haneoka-jp-100109` and `#haneoka-gbp-1234` retain their source identity. Encode playlist names in the same way as level names.

## Presentation resources

```http
GET /sonolus/skins/list
GET /sonolus/backgrounds/list
GET /sonolus/effects/list
GET /sonolus/particles/list
GET /sonolus/engines/list
```

Each list supplies the available items and their resource descriptors. Skin and particle thumbnails preview the actual presentation assets. Download the returned SRL URLs for textures, audio, and engine data.

## Client language

Display fields may contain the Sonolus 1.1.3+ `##LOCALIZE` text function:

```text
##LOCALIZE:{"en":"Song","ja":"曲","zhs":"歌曲","zht":"歌曲","ko":"노래"}
```

The Sonolus app chooses its current language, including for saved collection items. When a translation is absent, it uses the first language in the object. Tools displaying these fields should parse the JSON after `##LOCALIZE:`, choose a matching language, and apply that fallback. Sonolus uses `zhs` for simplified Chinese and `zht` for traditional Chinese.

`localization` can specify the preferred fallback for server labels. Item names, `source`, resource URLs, and hashes retain their original values.

## GBP catalog

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

The provider query selects the GBP catalog; returned names use `#haneoka-gbp-`. Use the [GBP data API](../providers/bestdori/) to retrieve song and character records for a separate interface.

## Response status

Unknown names return `404` with `{ "message": "Not found" }`. Temporary catalog failures return `503` with `{ "message": "Service unavailable" }`. These public reads require no account session; `Sonolus-Session` is accepted as a protocol header.
