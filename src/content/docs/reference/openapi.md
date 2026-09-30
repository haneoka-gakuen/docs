---
title: OpenAPI reference
description: Download and inspect the machine-readable public API contract.
---

The generated OpenAPI document is available as [`/openapi.json`](/openapi.json). It is built from [`scripts/build-openapi.mjs`](https://github.com/haneoka-gakuen/haneoka/blob/main/docs/scripts/build-openapi.mjs) before each production build.

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

The document includes the direct current-data aliases:

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

Each direct route has an optional `server` query; omitting it selects `intl`. The document also describes the explicit server-scoped form, release pinning, media and game-client files, Sonolus, community/profile/upload APIs, account configuration, Better Auth routes, and Bestdori projections.

Operational announcements use the separate `/api/v1/announcements` routes. They read the current server snapshot and do not accept a `release` parameter; see [Operational announcements](../servers/announcements/) for list, detail, media, language, and HTML-rendering guidance.

Provider-shaped and catalog DTOs use `additionalProperties` where the selected resource defines the fields. Use [Catalog data](../servers/catalog/) for stable envelopes and field semantics, and [Shared schemas](../reference/schemas/) for errors, batches, timestamps, and media values.
