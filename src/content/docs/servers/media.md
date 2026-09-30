---
title: Media and files
description: Turn catalog media paths into images, audio, video, and chart requests.
---

Most applications reach media through URLs returned by a current catalog DTO. Resolve a path such as `/assets/intl/...png` or `/runtime/intl/...mp3` against `https://haneoka.org` and request it directly:

```bash
curl --fail-with-body \
  https://haneoka.org/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png \
  -o jacket.png
```

The server chooses the current release for the selected server. Keep the returned `ETag` and `Content-Type` when caching or displaying the file. Release manifests, source trees, and content-addressed bundles are advanced inputs for crawlers and client-build tooling.

## Release media trees

```http
GET /assets/{server}/{path}
HEAD /assets/{server}/{path}
GET /runtime/{server}/{path}
HEAD /runtime/{server}/{path}
GET /objects/{server}/{path}
HEAD /objects/{server}/{path}
```

The active release index resolves these paths to content-addressed objects. `assets` and `runtime` accept paths from the published release. `assets` paths must begin with `Assets/` or `Packages/`; `objects` paths must begin with `unity/`. The exact path comes from a release manifest or catalog DTO.

Responses include `ETag`, `Content-Length`, `Accept-Ranges: bytes`, and `Content-Security-Policy: default-src 'none'; sandbox`. Unknown paths return `404` with a plain `not found` response.

## Byte ranges

```http
GET /assets/{server}/{path}
Range: bytes=0-1048575
If-Range: "etag-from-a-previous-response"
```

Valid ranges return `206` and `Content-Range: bytes <start>-<end>/<size>`. Invalid ranges return `416` and `Content-Range: bytes */<size>`. If `If-Range` does not match, the server returns the full object.

## Content-addressed artifacts

```http
GET /artifacts/{server}/{sourceId}/android/bundles/{filename}
HEAD /artifacts/{server}/{sourceId}/android/bundles/{filename}
```

This route serves a Unity bundle whose original filename is listed in the source descriptor for `sourceId`. The route only accepts a single filename segment and returns `application/octet-stream`. The `{sourceId}` and filename must come from the source metadata; they are not arbitrary object-storage paths.

Artifact responses support the same single-range request pattern as release objects, including `206`, `416`, `ETag`, and `Content-Range`.

## Localized media fallback

Release paths containing `(en)`, `(ko)`, `(zh-Hans)`, or `(zh-Hant)` may fall back to the matching alternate or an unlocalized file. Consumers should use the returned response and avoid baking fallback order into their own URL generation.

## Community attachment content

Community uploads use a separate authenticated lifecycle. Ready public attachment content is available through:

```http
GET /api/v1/community/attachments/{attachmentId}/content
HEAD /api/v1/community/attachments/{attachmentId}/content
```

The endpoint may require the viewer to be able to read the post that owns the attachment. Media processor variants can be requested with `?variant=media`, `poster`, or `thumb` when the attachment response advertises the corresponding URL.
