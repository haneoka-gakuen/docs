---
title: OpenAPI reference
description: Download and validate the machine-readable public API contract.
---

The generated OpenAPI document is available as [`/openapi.json`](/openapi.json). It is built from the route and schema definitions in `scripts/build-openapi.mjs` before every production build.

The document uses OpenAPI 3.1 and covers the current public worker paths: release registry and immutable release pinning, catalog resources/views/relations/batches, media and game-client files, Sonolus, community/profile/upload APIs, account configuration/registration, Better Auth route availability, and the transformed Bestdori provider.

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

The OpenAPI file uses `additionalProperties` for provider-shaped and release-specific JSON. Consult [Catalog API](../servers/catalog/) and [Schemas](../reference/schemas/) for the stable envelopes and route-specific semantics.
