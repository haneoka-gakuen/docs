---
title: Haneoka Docs
description: Read current songs, events, stories, characters, media, and community data from haneoka.org.
template: splash
hero:
  title: Haneoka Docs
  tagline: Current game data and standalone story, chart and scene hosts.
  actions:
    - text: Make a request
      link: /quickstart/
      icon: right-arrow
    - text: Visit Haneoka
      link: https://haneoka.org/
      icon: external
      variant: minimal
    - text: OpenAPI
      link: /reference/openapi/
      icon: external
      variant: minimal
---

Haneoka serves the published game catalog and community services at [haneoka.org](https://haneoka.org/). Start with a resource name such as `songs`, `events`, `characters`, or `stories`:

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
curl --fail-with-body 'https://haneoka.org/api/v1/events?server=jp'
```

The direct resource API uses the current catalog for the `intl` server by default. Add `?server=jp` (or another active server slug) when you need a regional catalog. These aliases and the explicit `/api/v1/servers/{server}/{resource}` routes use the same catalog handler, so a client can begin with a short URL and move to the advanced form when it needs release pinning or storage-level traversal.

## Pick a starting point

| What you are building | Read this |
| --- | --- |
| Make a stamp with independent text layers and PNG export | [Stamp maker](./creation/stamp-maker/) |
| Embed a story, chart or Home Spot scene | [JavaScript embeds](./embed/) |
| Use pagination, typed clients, chart images and rankings | [Catalog data](./servers/catalog/) |
| Browse songs, bands, cards, stories, or events | [Catalog data](./servers/catalog/) |
| Read current in-game operational announcements | [Operational announcements](./servers/announcements/) |
| Download an image, audio file, video, or chart referenced by a DTO | [Media and files](./servers/media/) |
| Build a Sonolus server or playlist | [Sonolus](./sonolus/) |
| Use Bestdori-shaped Garupa data | [Bestdori provider](./providers/bestdori/) |
| Read or publish posts and comments | [Community](./community/) |
| Sign in and manage a profile | [Authentication](./auth/) |
| Reproduce a historical catalog or inspect storage | [Advanced server contracts](./servers/releases/) |

## What responses look like

Catalog indexes are JSON objects keyed by entity ID. The value keeps the source DTO fields; there is no universal `title` or `id` field. A song index entry currently includes fields such as `musicId`, localized `musicTitle`, `bandId`, `difficulty`, and media paths:

```json
{
  "100001": {
    "musicId": 100001,
    "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
    "bandId": 1,
    "bandName": ["MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!"],
    "jacketUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png",
    "musicUrl": "/runtime/intl/cri/sound/musicscore/M_Mayoiuta/1_M_Mayoiuta.mp3"
  }
}
```

The complete field set belongs to the resource DTO and can grow with the source data. Preserve fields you do not use so clients continue to work as the catalog gains information. Media paths are origin-relative; resolve them against [haneoka.org](https://haneoka.org/).

## Public and signed-in surfaces

Catalog, media, Sonolus, and Bestdori reads are public. Community writes, account profile changes, preferences, uploads, and Better Auth operations use a browser session and same-origin requests. [Conventions](./conventions/) describes caching, headers, URL encoding, and current-data behavior; [Errors and retries](./errors/) explains status handling.

The [OpenAPI document](/openapi.json) contains the machine-readable route and schema contract.
