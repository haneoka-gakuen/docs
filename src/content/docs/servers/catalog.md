---
title: Catalog API
description: Read release-backed resources, entities, views, relations, and batches.
---

Catalog storage is a resource-neutral API. The current release's `catalog` manifest lists resource names, entity indexes, view indexes, relations, count fields, and storage shape.

## Manifest and summary

```http
GET /api/v1/servers/{server}/catalog
GET /api/v1/servers/{server}/catalog/summary
```

The manifest has this stable envelope:

```json
{
  "schema": "haneoka-catalog-storage-v2",
  "server": "intl",
  "sourceId": "source-id-from-the-release",
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
      "relations": {
        "band": {
          "algorithm": "fnv1a32-mod-256",
          "count": 6,
          "entityCount": 85,
          "prefix": "api/v1/catalog/songs/relations/band/",
          "shards": ["1c", "42", "63"],
          "valueMode": "records"
        }
      }
    }
  }
}
```

The nested entity, relation, and view metadata is authoritative. Use the resource names, relation names, view names, and entity IDs returned by the manifest. Counts and shard lists are release data; the abbreviated list above is illustrative of the shape, not a complete manifest.

## Resource index

```http
GET /api/v1/servers/{server}/{resource}
```

Returns the release's index document for a resource listed in the manifest. The index is a provider-shaped JSON document for discovery; use the entity route for one record. Its keys and values are resource-defined.

## Entity

```http
GET /api/v1/servers/{server}/{resource}/{id}
```

`id` must match the route key grammar (`A-Z`, `a-z`, `0-9`, `.`, `_`, `:`, `~`, and `-`, up to 256 characters). A known resource with a missing ID returns:

```json
{
  "error": { "code": "entity_not_found", "message": "Catalog entity not found" }
}
```

The entity body is the canonical DTO for that resource. It may include localized values, numeric IDs, timestamps, nested records, media paths, and provider fields. Consumers should preserve unknown fields and use the resource's manifest metadata and returned DTO instead of coercing every resource into a shared game entity type.

## Batch entities

```http
GET /api/v1/servers/{server}/{resource}?id={id}&id={id}
```

Batching is supported for a resource and for a view. IDs are de-duplicated and sorted for caching. The response is:

```json
{
  "items": {
    "song-key": { "id": "song-key", "title": "Example" }
  },
  "missing": ["missing-song-key"]
}
```

Use the IDs returned by the resource index. A malformed ID returns `400 invalid_batch`. The batch envelope is stable; the values under `items` retain the resource-defined entity shape.

## Views

The manifest may expose a view with an explicit shape and path:

```http
GET /api/v1/servers/{server}/{resource}/views/{view}
GET /api/v1/servers/{server}/{resource}/views/{view}/{id}
GET /api/v1/servers/{server}/{resource}/views/{view}?id={id}&id={id}
```

The view index returns its declared collection shape (`array` or `object`) at the path listed in the manifest. The entity route reads the view's entity index. A missing view returns `404 view_not_found`. View entities are DTOs for that view and are not required to match the parent resource entity shape.

## Relations

```http
GET /api/v1/servers/{server}/{resource}/relations/{relation}/{key}
```

The manifest declares whether a relation uses `valueMode: "ids"` or `valueMode: "records"`:

- `ids` relations are expanded into an object whose keys are entity IDs and whose values are the canonical entities from the resource entity store.
- `records` relations return the relation's provider record object directly.

An absent relation key returns `{}`. Unknown relation names and invalid keys return `404 relation_not_found`.

## UI marks

```http
GET /api/v1/servers/{server}/ui-marks
```

Returns a JSON object mapping UI mark names to release asset paths. The set may be empty:

```json
{
  "RarityIconCenter_R.png": "Assets/.../RarityIconCenter_R.png"
}
```

## Query and caching rules

Catalog JSON is release-backed and cacheable. Use `ETag` where supplied and retain the release headers. `catalog` and `catalog/summary` are different documents; the summary is a consumer-oriented projection while the manifest explains all storage routes.
