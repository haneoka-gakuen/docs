---
title: Shared schemas
description: Stable response envelopes and identifier rules used across the API.
---

## Error

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Human-readable diagnostic",
    "requestId": "optional-request-correlation-id"
  }
}
```

`code` is the value to branch on. `message` can change for clarity. `requestId` is optional and should be included in support reports when present.

## Release identity

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "server-slug-from-registry",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

The displayed values explain the field roles. Use the IDs returned by the service in subsequent requests.

## Catalog manifest

```json
{
  "schema": "haneoka-catalog-storage-v2",
  "server": "server-slug",
  "sourceId": "source-snapshot-id",
  "summary": "api/v1/catalog/summary.json",
  "partition": { "algorithm": "fnv1a32-mod-256", "shards": 256 },
  "resources": {
    "songs": {
      "count": 85,
      "dependencies": ["bands", "items", "song-meta", "videos"],
      "entities": {
        "algorithm": "fnv1a32-mod-256",
        "count": 85,
        "prefix": "api/v1/catalog/songs/entities/",
        "shards": ["01", "06", "09"]
      },
      "index": "api/v1/catalog/songs/index.json",
      "kind": "collection",
      "relations": {},
      "views": {}
    }
  }
}
```

Each resource metadata object declares `kind`, `count`, `dependencies`, `index`, optional `entities`, `relations`, and `views`. Entity and relation storage descriptors include the FNV-1a shard algorithm, shard count, prefix, and shard names. Relation metadata declares `entityCount` and `valueMode` (`ids` or `records`); view metadata declares its own entity store, `path`, and `shape` (`array` or `object`). The manifest is the central DTO for deciding which catalog route exists. The example abbreviates the shard list; use the complete list returned by the service.

## Catalog batch

```json
{
  "items": { "entity-key-from-index": {} },
  "missing": ["entity-key-not-present"]
}
```

The `items` values retain the resource-defined entity shape; the API does not impose a universal `id` or `title` field. Both maps use IDs supplied by the service. Missing keys appear in `missing`.

## Community pagination

Community list responses use `nextCursor: string | null`. When `nextCursor` is `null`, the page is complete. Send each cursor back unchanged.

## Timestamps and media

Community timestamps are Unix epoch milliseconds. Catalog/provider timestamps follow their source DTO contract and may be numbers or localized provider values. Media fields include `mediaType`, `size`, `width`, `height`, and URLs where a ready/allowed object exists. Preserve `null` values; they mean the source does not currently provide that property.
