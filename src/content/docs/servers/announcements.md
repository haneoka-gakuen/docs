---
title: Operational announcements
description: Read the current in-game announcement feed and its canonical media.
---

The announcement API returns the selected server’s currently published news, article bodies, and images. Announcements refresh independently; clients can read them directly without selecting a resource version.

## List the latest announcements

```http
GET /api/v1/announcements?server=intl&limit=2
```

`server` is optional and defaults to `intl`. `limit` is optional, accepts 1–100, and returns up to that many records from the current list. List records omit the detail body's `html` field.

This JSON illustrates a historical response shape. Use IDs, titles and image URLs returned by the current list.

```json
{
  "server": "intl",
  "available": true,
  "fetchedAt": "2026-09-30T04:14:16.536328Z",
  "announcements": [
    {
      "id": 23,
      "category": 6,
      "title": "緊急維護公告",
      "startAt": 1790730300,
      "endAt": 1790751600,
      "updatedAt": 1790695244,
      "bodyImage": "https://haneoka.org/api/v1/announcements/media/intl/1aaf53f946ee62d677d1d8cb3b0e54ef6e7556ebe48af07bfeb76bd6f13851e3.jpg",
      "bodyImageWidth": 420,
      "bodyImageHeight": 180,
      "sourceLanguage": "zh-Hant"
    },
    {
      "id": 24,
      "category": 3,
      "title": "「由我主演的賽博之夜」轉蛋舉辦預告！",
      "startAt": 1790730000,
      "endAt": 1790751600,
      "updatedAt": 1790695246,
      "sourceLanguage": "zh-Hant"
    }
  ]
}
```

`startAt`, `endAt`, and `updatedAt` are Unix seconds. `fetchedAt` is the UTC ISO-8601 time of the current published snapshot. When a feed is unavailable, the response has `available: false`, `fetchedAt: null`, and an empty `announcements` array. Snapshot values change as the operational feed refreshes.

## Read one announcement

Announcements change. Get an actual `id` from the current list before reading a detail; the historical example ID 23 may no longer be listed. This complete JavaScript performs that read:

```js
const origin = "https://haneoka.org";
const response = await fetch(`${origin}/api/v1/announcements?server=intl&limit=1`);
if (!response.ok) throw new Error(`Announcement list HTTP ${response.status}`);
const feed = await response.json();
const first = feed.announcements[0];
if (first) {
  const detailResponse = await fetch(`${origin}/api/v1/announcements/${encodeURIComponent(first.id)}?server=intl`);
  if (!detailResponse.ok) throw new Error(`Announcement detail HTTP ${detailResponse.status}`);
  const detail = await detailResponse.json();
  console.log(detail.title, detail.bodyImage);
} else {
  console.log("No current announcements.");
}
```

The detail response keeps the snapshot metadata beside the full record:

```json
{
  "server": "intl",
  "available": true,
  "fetchedAt": "2026-09-30T04:14:16.536328Z",
  "id": 23,
  "category": 6,
  "title": "緊急維護公告",
  "startAt": 1790730300,
  "endAt": 1790751600,
  "updatedAt": 1790695244,
  "sourceLanguage": "zh-Hant",
  "html": "<p>…</p>"
}
```

`html` is optional raw HTML from the announcement source. Treat it as untrusted input: sanitize it with a mature HTML sanitizer such as DOMPurify and an explicit allowlist of tags, attributes, URL protocols, and image paths before rendering. Drop scripts, event-handler attributes, unsafe URLs, and unsupported elements. Never pass the source string directly to `innerHTML`, `dangerouslySetInnerHTML`, or an equivalent HTML sink. If a sanitizer is unavailable, escape the value and render it as text.

### Language and rendering

`sourceLanguage` is an optional BCP 47 language tag inferred from the returned title and body, such as `ja`, `zh-Hant`, `zh-Hans`, `ko`, or `en`. Use it for the rendered article's `lang` value. The original server text is retained; the application chooses its own UI language. When `sourceLanguage` is absent or invalid, use `und` for content language and keep the application UI locale separately.

### Images and dimensions

`bodyImage` and `banner` are optional absolute HTTPS URLs. Their matching `bodyImageWidth`, `bodyImageHeight`, `bannerWidth`, and `bannerHeight` values are optional intrinsic pixel dimensions. Use them to reserve layout space and preserve the source aspect ratio; CSS may scale the image for the viewport.

Inline `<img src>` values inside `html` are canonicalized to the same public media route. Use the returned URL and any supplied dimensions; do not rebuild an origin URL from source data.

## Download announcement media

```http
GET /api/v1/announcements/media/{server}/{fullhash}.{ext}
HEAD /api/v1/announcements/media/{server}/{fullhash}.{ext}
```

`fullhash` is the lowercase 64-character SHA-256 digest of the downloaded bytes. Supported extensions are `avif`, `gif`, `jpg`, `jpeg`, `png`, and `webp`; the response uses the corresponding actual media type. Media responses are immutable and carry long-lived cache headers. A missing ID or media object returns `404`.

Songs, characters, and related game records remain available through the [catalog API](../catalog/), including direct endpoints such as `/api/v1/songs`.
