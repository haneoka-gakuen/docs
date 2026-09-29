---
title: Quickstart
description: Make your first release and catalog requests.
---

## 1. Discover a server

Start with the public registry. It only returns active resource servers, so clients do not need to hard-code a region list.

```bash
curl --fail-with-body https://haneoka.org/api/v1/releases
```

Example shape:

```json
{
  "releases": [
    { "id": "intl", "displayName": "Global", "region": "global" },
    { "id": "jp", "displayName": "Japan", "region": "jp" }
  ]
}
```

`id` is the server slug used by the catalog and file routes. Use the value returned by the registry; the active list can change.

## 2. Read the current catalog

Catalog URLs resolve the current release for a server:

```bash
curl --fail-with-body \
  https://haneoka.org/api/v1/servers/intl/catalog
```

Pin the same request to a release returned in the `X-Haneoka-Release-Id` response header or from the release identity document:

```bash
release_id=r-679793a903cd5cd2838a  # copy the X-Haneoka-Release-Id value from the preceding response

curl --fail-with-body \
  "https://haneoka.org/api/v1/servers/intl/songs?release=${release_id}"
```

Release IDs are opaque immutable identifiers. Store and reuse the exact value received from the service.

## 3. Fetch one entity or a batch

The current catalog manifest tells you which resources and views exist. For an entity key returned by the catalog index:

```bash
song_id=$(curl --fail-with-body \
  https://haneoka.org/api/v1/servers/intl/songs \
  | jq -r 'keys[0]')

curl --fail-with-body \
  "https://haneoka.org/api/v1/servers/intl/songs/${song_id}"
```

Batch requests use repeated `id` parameters and return an `items` map plus an explicit `missing` list:

```bash
curl --fail-with-body \
  "https://haneoka.org/api/v1/servers/intl/songs?id=${song_id}&id=${song_id}"
```

The server sorts and de-duplicates IDs when creating its cache key. A missing key is reported in `missing`; it is not a partial HTTP failure.

## 4. Use the API client package

The repository includes a host-neutral fetch client in `@haneoka/api-client`:

```ts
import { createApiClient } from "@haneoka/api-client";

const api = createApiClient({ baseUrl: "https://haneoka.org/api/v1" });
const registry = await api.get<{
  releases: Array<{ id: string; displayName: string; region: string }>;
}>("releases");
const server = registry.releases[0]?.id;
if (!server) throw new Error("No active resource server");
const catalog = await api.get(`servers/${server}/catalog`);
```

`ApiClientError` preserves the HTTP status, stable error code, request ID, and whether retrying is reasonable. See [Errors and retries](/errors/).

## 5. Send credentials only where required

Public release, catalog, media, game-client, Sonolus, and Bestdori reads do not require a session. Community mutations, profile changes, avatar writes, uploads, preferences, and Better Auth operations do. Browser mutations also require same-origin requests, as described on each page.
