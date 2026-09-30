---
title: Conventions
description: URL, response, caching, authentication, and pagination rules shared by the API.
---

## Base URL and current-data aliases

Use `https://haneoka.org` as the production origin. The direct catalog routes are:

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

These routes use the current `intl` server by default. Add `?server=jp` or another slug from `GET /api/v1/releases` to select a different active server. The explicit `/api/v1/servers/{server}/...` form reaches the same catalog handler and adds the `release` option used by reproducible builds.

`resource`, `id`, `view`, `relation`, and `key` are data-defined values. Read the catalog manifest or an index response before constructing a route. Top-level groups such as `releases`, `servers`, `account`, `me`, `community`, and `garupa` keep their own API routes and are not catalog resource names. URL-encode each dynamic segment; preserve `/` only where the documented route accepts a path.

## JSON and fields

JSON responses use `application/json; charset=utf-8`. Catalog index responses normally use an object keyed by entity ID. Entity values keep the source DTO shape. For example, a song uses `musicId`, localized arrays such as `musicTitle`, difficulty records, and media paths; an events resource can return `{ "entries": {}, "hasGameEvents": false }`. Code against the documented fields for the resource you requested and preserve additional fields.

The API does not add a universal `id`, `title`, or `data` wrapper to provider DTOs. An index key is the lookup ID even when the value uses a resource-specific ID field. A `null` field means the source currently has no value for that property.

## Useful response headers

| Header | Meaning |
| --- | --- |
| `X-Request-Id` | Correlation ID for an error or diagnostic report. |
| `X-Haneoka-Release-Id` | Current release that served a server-scoped response. |
| `X-Haneoka-Source-Id` | Source snapshot associated with that release. |
| `ETag` | Representation validator for conditional requests. |
| `Cache-Control` | Freshness and revalidation policy selected by the service. |
| `Content-Range` | Returned byte range or `bytes */size` for an unsatisfied range. |

Current aliases can change when the service promotes a new catalog. Store the release headers with a cache entry when you need to explain which data a user saw. Applications that need stable replay can switch to an explicit `release` request; the advanced release page documents that workflow.

## Batch, views, and relations

Repeat `id` for a batch request:

```text
GET /api/v1/songs?id=100001&id=100002
```

Catalog batches return `{ "items": { ... }, "missing": [ ... ] }`. The service sorts and de-duplicates IDs for its cache key. A missing ID is a result for that ID, not a failed request.

The catalog manifest declares views and relations for each resource. A view has its own index and entity shape. A relation returns either canonical entities keyed by ID (`valueMode: "ids"`) or provider records (`valueMode: "records"`). Follow the manifest's names and shapes; values can differ between resources.

## Caching and media

Honor `ETag` and `Cache-Control`. Send `If-None-Match` to receive `304` when a representation is unchanged. Resolve relative media paths such as `/assets/intl/...` and `/runtime/intl/...` against `https://haneoka.org`.

Binary routes declare their media type and may support a single byte range. A valid partial response is `206`; an unsatisfied range is `416` with `Content-Range: bytes */<size>`. Do not retry a `416` unchanged.

## Authentication and same-origin writes

Public catalog, media, Sonolus, and Bestdori reads do not require a session. Community writes, profile changes, preferences, uploads, and Better Auth operations use HTTP-only cookies and same-origin browser requests:

```ts
await fetch("/api/v1/account/profile", {
  credentials: "include",
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ bio: "Hello", version: 4 }),
});
```

Keep session cookies out of logs and client bundles. Each authenticated page documents the request body, conflict fields, and moderation state for that operation.
