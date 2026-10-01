---
title: Chart images
description: Request a current chart overview as SVG or PNG and read its actual dimensions.
---

The chart image handler renders a published score through Cassiopeia's static overview renderer. SVG and the registered PNG rasterizer are prepared for Worker rollout. PNG deployment includes the matching Fontsource font manifest and files; publishing this guide alone does not enable an older Worker to render PNG.

## Request an image

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs/100070/charts/expert/image.svg?server=intl&locale=en&height=720&download=1' \
  -o chart.svg
```

Use `.png` for PNG. The explicit equivalent is `/api/v1/servers/{server}/songs/{songId}/charts/{difficulty}/image.{format}`. Both select current data; neither accepts `release`. Choose the difficulty that the song DTO actually advertises.

| Parameter | Values | Meaning |
| --- | --- | --- |
| `server` | Active resource-server slug; default `intl` on the alias | Source catalog |
| `difficulty` | easy, normal, hard, expert, special, master | Path segment; must exist for the song |
| `locale` | ja, en, zh-TW, zh-CN, ko | Caption language; otherwise negotiated from Accept-Language |
| `height` | Integer 360–1440; default 720 | Height of a chart panel, excluding the header |
| `download` | 1 or 0; default 1 | Attachment or inline Content-Disposition |
| `format` | svg or png | File extension and response MIME |

Repeated or empty query values reject with 400. Chart data and output have renderer budgets; oversized inputs/output reject with 413 rather than producing an unbounded image.

## Dimensions and conditional requests

The resulting canvas includes a header and enough panels for the chart. Increasing panel height changes the number of panels and the final width. Read `X-Haneoka-Image-Width` and `X-Haneoka-Image-Height`; use those dimensions for a stable image placeholder. They match SVG width/height or PNG IHDR, rather than the requested panel height.

Responses include `Content-Type`, `Content-Length`, `Content-Disposition`, `Content-Language`, `ETag`, `X-Haneoka-Server`, `X-Haneoka-Release-Id` and `X-Haneoka-Chart-Renderer`. GET returns the image, HEAD returns the headers without a body, and `If-None-Match` can return 304 without Content-Length. The public endpoint allows anonymous CORS. OPTIONS returns 204; unsupported methods return 405 with Allow.

```js
const url = "https://haneoka.org/api/v1/songs/100070/charts/expert/image.png?locale=en&download=0";
const response = await fetch(url, { credentials: "omit" });
if (!response.ok) {
  const failure = await response.json();
  throw new Error(`${response.status}: ${failure.error.code}`);
}
const width = Number(response.headers.get("X-Haneoka-Image-Width"));
const height = Number(response.headers.get("X-Haneoka-Image-Height"));
const imageUrl = URL.createObjectURL(await response.blob());
// Set your image element's dimensions and src; revoke imageUrl on teardown.
console.log(width, height, imageUrl);
```

## Failure handling

Errors use `{error:{code,message,requestId}}`, `X-Request-Id` and `Cache-Control: no-store`. Typical codes include invalid_height/invalid_locale/invalid_download/release_not_supported (400), song_not_found/difficulty_not_found/chart_not_found (404), format_not_supported (406), chart_too_large/chart_render_budget (413), chart_image_failed (502), and release_unavailable (503). Missing or invalid deployed PNG fonts produce chart_image_failed; a font budget failure produces chart_render_budget. A deployment without a registered rasterizer can report 501 png_renderer_unavailable. Retain the request ID and fix the parameter or deployment cause before retrying.
