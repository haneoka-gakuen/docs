---
title: Sonolus API
description: Connect a Sonolus client to the public Haneoka level and playlist service.
---

The service implements the Sonolus server document and level/playlist routes backed by the active Our Notes release set. All routes are public reads. Send `Accept: application/json` and preserve the `Sonolus-Version` response header.

## Server info

```http
GET /sonolus/info
```

Returns the standard Sonolus server info document. `GET /sonolus` redirects to `/sonolus/` with `308`; clients should use the trailing-slash server URL in a Sonolus registration.

## Level routes

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

The list page is zero-based and uses a page size of 20. `levelName` is the exact name returned by the list or info document. The data hash is a 40-character lowercase SHA-1 value from the level's `data` object. Data responses are binary (usually `application/gzip`) and can be cached as immutable content.

`/sonolus/levels/info?type=random` and `/sonolus/levels/list?type=random` return a random level projection. Random responses are `no-store`; do not use them as a stable catalog index.

## Playlist routes

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

Our Notes playlists use names generated from the source song identity. Treat names as opaque values returned by the service. Playlist items contain their level items, including each level's `data` descriptor.

## Localization

Static Sonolus JSON documents accept:

```text
?localization=ja
?localization=en
?localization=zh-TW
?localization=zh-CN
?localization=ko
```

The server localizes known Sonolus labels and keeps response validators consistent with the localized body. If no localization is supplied, the service returns the default document language. Repository and binary data routes ignore localization.

## Session header

`Sonolus-Session` is accepted as a CORS request header for client compatibility. The public Haneoka service does not use it for account authentication on these read routes. Do not send account cookies or private credentials to the Sonolus endpoint.

## Bestdori projection

The Sonolus catalog can be switched to the transformed Bestdori source:

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

Bestdori level data IDs are provider-scoped and should be consumed from the returned item. The separate [Bestdori API](../providers/bestdori/) is useful when you need source catalog JSON rather than Sonolus documents.

## Failure behavior

An unknown Sonolus document returns `404` with `{ "message": "Not found" }`. A catalog projection failure returns `503` with `{ "message": "Service unavailable" }`. Sonolus routes use this message envelope.

The Sonolus surface provides level and playlist data.
