---
title: Servers and releases
description: Select an active server and pin an immutable release for reproducible builds.
---

This page covers the advanced server-scoped contract. Everyday consumers can use `/api/v1/songs` and the other direct aliases, which read current data from `intl` by default.

## List active server slugs

```http
GET /api/v1/releases
HEAD /api/v1/releases
```

The historical route name is retained for compatibility. Its response lists active server slugs and display metadata:

```json
{
  "releases": [
    { "id": "intl", "displayName": "Global", "region": "global" },
    { "id": "intl-cbt", "displayName": "Global CBT", "region": "global" },
    { "id": "jp", "displayName": "Japan", "region": "jp" },
    { "id": "jp-cbt", "displayName": "Japan CBT", "region": "jp" }
  ]
}
```

In this response, `id` is a server slug. It is the value used by `?server=` and by the `{server}` path segment in explicit server-scoped routes. The list changes when deployments add or retire a server.

## Read the current release manifest

```http
GET /api/v1/servers/{server}/release
GET /api/v1/servers/{server}/release?projection=identity
```

The full manifest describes the release's catalog, source tree, game-client inventory, and files. `projection=identity` returns a compact descriptor for tooling that needs to record the selected release:

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "intl",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

`releaseId` is an opaque value returned by the service. The JSON above uses a placeholder; read the current identity to obtain a usable value.

## Pin an explicit request

Every server-scoped catalog, source, and release route accepts the release query:

```js
const base = "https://haneoka.org/api/v1/servers/intl/";
const identityResponse = await fetch(`${base}release?projection=identity`);
if (!identityResponse.ok) throw new Error(`Identity HTTP ${identityResponse.status}`);
const identity = await identityResponse.json();
const query = new URLSearchParams({ release: identity.releaseId });
const response = await fetch(`${base}songs/100001?${query}`);
if (!response.ok) throw new Error(`Song HTTP ${response.status}`);
console.log(await response.json(), response.headers.get("X-Haneoka-Release-Id"));
```

The response includes `X-Haneoka-Release-Id` and `X-Haneoka-Source-Id`. Store those headers with the downloaded data when an archive needs an audit trail. A bad release returns `404 release_not_found`; an unpinned request uses the server's current pointer.

Release media and game-client files are also selected by the active server pointer. Content-addressed artifact routes use the source ID explicitly. See [Media and files](/servers/media/), [Game-client delivery](/servers/game-client/), and [Source trees](/servers/sources/).

## When to use this page

Pin a release when a build must reproduce a previous output, when a crawler stores a complete snapshot, or when you need the release's storage descriptors. A web app showing current songs, events, or stories can stay on the direct aliases and let each request follow the current catalog.
