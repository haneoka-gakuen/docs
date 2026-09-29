---
title: Conventions
description: Shared URL, response, caching, authentication, and pagination rules.
---

## Base URL and paths

Use `https://haneoka.org` as the production origin. Paths in this site are origin-relative. Preserve URL encoding for resource keys, file names, and Sonolus names; never concatenate an untrusted path segment without encoding it.

## JSON and headers

JSON responses use `application/json; charset=utf-8`. Successful file responses preserve their media type and expose `ETag`, `Content-Length`, and range headers where applicable. Public API responses may include:

| Header                         | Meaning                                                                                                                                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `X-Request-Id`                 | Correlates an error with service logs. Returned by the generic worker error path.                                                                                                     |
| `X-Haneoka-Release-Id`         | The release that served a server-scoped catalog, source, or game-client response. Release media and artifacts expose their own validators but do not add these server-scoped headers. |
| `X-Haneoka-Source-Id`          | The source snapshot associated with that release.                                                                                                                                     |
| `X-Haneoka-Garupa-Snapshot-Id` | The immutable Garupa Master snapshot used for the playlist projection.                                                                                                                |
| `Sonolus-Version`              | The Sonolus app version advertised by the service.                                                                                                                                    |
| `ETag`                         | Use with `If-None-Match`; matching responses are `304`.                                                                                                                               |
| `Accept-Ranges: bytes`         | Release media, game-client files, artifacts, Bestdori media, and ready community attachment content accept single byte ranges where the route page lists range support.               |

The server sends `Access-Control-Allow-Origin: *` on public file and JSON surfaces. Authentication and community mutation responses are same-origin browser flows and must not be treated as anonymous cross-origin write APIs.

## Current versus immutable data

Catalog and source paths without `release` follow the active pointer. Add `?release=r-<20 lowercase hex characters>` to pin those JSON requests to an immutable release. Release media and game-client paths follow the active release pointer.

Response headers identify the resolved release. A requested release that cannot be resolved returns `404 release_not_found`; if no current release is published, the unpinned path returns `503 release_unavailable`.

## Pagination

Cursor APIs use an opaque `nextCursor`. Send it back as received:

```text
GET /api/v1/community/posts?limit=20&cursor=<nextCursor>
```

Do not decode, edit, or persist assumptions about cursor internals. Sonolus lists use zero-based `page` indexes instead of cursors. Catalog batches are bounded by the URL and manifest, and return explicit `missing` IDs.

## Caching

Public registry and provider data are cacheable. Current-pointer JSON uses a short browser lifetime so a promoted release becomes visible quickly. Immutable release objects and content-addressed game bundles can be cached for a year. Community and account JSON responses use `Cache-Control: no-store`.

Honor `ETag`, `Cache-Control`, and `Content-Range`. A `206` response is valid only for the requested range; a `416` response includes `Content-Range: bytes */<size>`.

## Authentication and same-origin writes

Better Auth uses HTTP-only cookies. Send `credentials: "include"` from a browser. Community, profile, avatar, upload, and preference writes reject cross-origin requests with `403`. For direct integrations, use an authorized browser session or an application-specific flow; do not copy session cookies into logs or public examples.
