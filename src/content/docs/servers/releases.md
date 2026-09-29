---
title: Servers and releases
description: Discover active resource servers and pin immutable releases.
---

## List active servers

```http
GET /api/v1/releases
HEAD /api/v1/releases
```

No authentication is required. The response is ordered by region, display name, and slug:

```json
{
  "releases": [
    { "id": "intl", "displayName": "Global", "region": "global" },
    { "id": "jp", "displayName": "Japan", "region": "jp" }
  ]
}
```

The supported `region` values are `global`, `jp`, `kr`, `tw`, `cn`, and `en`. `id` is a server slug and is the `{server}` path parameter for all server-scoped APIs. The registry includes active servers only.

## Inspect the current release

```http
GET /api/v1/servers/{server}/release
HEAD /api/v1/servers/{server}/release
GET /api/v1/servers/{server}/release?projection=identity
```

The default response is the published release manifest. Its shape is release-specific and is the source of truth for the catalog manifest, source index, game-client manifest, and content inventory. Use the identity projection when a small, stable descriptor is enough:

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "intl",
  "releaseId": "r-679793a903cd5cd2838a",
  "sourceId": "v25-c0b6a1541e45-9e9e2f64c6da-medea1e907f55-ncd8654cc"
}
```

`releaseId` matches `r-` followed by 20 lowercase hexadecimal characters. Use the value returned by the response or release pointer for subsequent pinned requests; do not construct or guess release IDs.

## Pin a request

Every server-scoped catalog path accepts:

```text
?release=r-0123456789abcdef0123
```

The release descriptor is immutable. A missing identity descriptor returns `404 release_identity_missing`; an invalid descriptor returns `502 release_identity_invalid`. Unpinned requests use the current release pointer and return `503 release_unavailable` when no release is published.

## Release headers

Successful server-scoped responses include `X-Haneoka-Release-Id` and `X-Haneoka-Source-Id`. Keep these headers with cached or indexed data.
