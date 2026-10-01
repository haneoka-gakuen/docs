---
title: Media 和文件
description: 将 catalog media path 转为图片、音频、视频和谱面请求。
---

大多数应用从当前 catalog DTO 返回的 URL 读取媒体。将 `/assets/intl/...png` 或 `/runtime/intl/...mp3` 这样的路径解析到 `https://haneoka.org` 后直接请求：

```bash
curl --fail-with-body \
  https://haneoka.org/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png \
  -o jacket.png
```

服务器会为所选 server 使用当前 release。缓存或显示文件时保留返回的 `ETag` 和 `Content-Type`。Release manifest、source tree 和 content-addressed bundle 属于 crawler 与 client-build tooling 使用的高级输入。

## Release media trees

```http
GET /assets/{server}/{path}
HEAD /assets/{server}/{path}
GET /runtime/{server}/{path}
HEAD /runtime/{server}/{path}
GET /objects/{server}/{path}
HEAD /objects/{server}/{path}
```

活动 release index 会将这些路径解析为 content-addressed objects。`assets` 和 `runtime` 接受已发布 release 中的路径。`assets` 路径必须以 `Assets/` 或 `Packages/` 开头；`objects` 路径必须以 `unity/` 开头。具体路径来自 release manifest 或 catalog DTO。

响应包含 `ETag`、`Content-Length`、`Accept-Ranges: bytes` 和 `Content-Security-Policy: default-src 'none'; sandbox`。未知路径返回带有纯文本 `not found` 响应的 `404`。

## Byte ranges

```http
GET /assets/{server}/{path}
Range: bytes=0-1048575
If-Range: "etag-from-a-previous-response"
```

有效 range 返回 `206` 和 `Content-Range: bytes <start>-<end>/<size>`。无效 range 返回 `416` 和 `Content-Range: bytes */<size>`。如果 `If-Range` 不匹配，服务器返回完整对象。

## Content-addressed artifacts

```http
GET /artifacts/{server}/{sourceId}/android/bundles/{filename}
HEAD /artifacts/{server}/{sourceId}/android/bundles/{filename}
```

该路由提供 source descriptor 中列出的原始文件名对应的 Unity bundle。路由只接受一个 filename 片段，并返回 `application/octet-stream`。`{sourceId}` 和 filename 必须来自 source metadata；它们不是任意的 object-storage path。

Artifact 响应支持与 release objects 相同的单 range 请求模式，包括 `206`、`416`、`ETag` 和 `Content-Range`。

## 本地化 media fallback

包含 `(en)`、`(ko)`、`(zh-Hans)` 或 `(zh-Hant)` 的 release path 可能回退到匹配的 alternate 或无本地化版本。使用者应使用返回的响应，不要在自己的 URL 生成逻辑中固化 fallback 顺序。

## 社区附件内容

社区上传使用单独的已验证生命周期。就绪的公开附件内容可通过以下接口获取：

```http
GET /api/v1/community/attachments/{attachmentId}/content
HEAD /api/v1/community/attachments/{attachmentId}/content
```

该 endpoint 可能要求查看者有权读取拥有附件的帖子。当附件响应公布对应 URL 时，可以使用 `?variant=media`、`poster` 或 `thumb` 请求媒体处理变体。

## 谱面图片与播放器

准备发布的 [谱面图片接口](../chart-images/) 可将谱面呈现为 SVG/PNG。选择歌曲实际提供的难度，区分段高与最终画布尺寸，并保留 ETag。网页内播放使用 [Cassiopeia 嵌入](../../embed/cassiopeia/)。
