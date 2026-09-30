---
title: Source metadata
description: Inspect published source metadata for archives and build tooling.
---

Source records are an advanced, release-scoped view of the published game data. Ordinary applications can stay on the current resource aliases and the media paths returned by their DTOs.

## Source tree

```http
GET /api/v1/servers/{server}/sources/tree
```

Returns the release's source index tree as JSON. Use the returned paths with the source-record route.

## Source record

```http
GET /api/v1/servers/{server}/sources/Assets/{path}
GET /api/v1/servers/{server}/sources/Packages/{path}
```

The source path begins with `Assets/` or `Packages/` and is resolved through the release index. A source record is a JSON DTO published by the current release and may contain importer metadata, asset relationships, or source-specific fields.

The `sourceId` in release identity and response headers identifies the source snapshot. The source tree and source DTOs are read-only and public; they do not expose authenticated account data.
