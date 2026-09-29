---
title: 约定
description: 共享的 URL、响应、缓存、身份验证和分页规则。
---

## 基础 URL 和路径

生产环境 origin 使用 `https://haneoka.org`。本网站中的路径都是相对于 origin 的。请保留资源键、文件名和 Sonolus 名称的 URL 编码；不要在未编码的情况下拼接不可信的路径片段。

## JSON 和 headers

JSON 响应使用 `application/json; charset=utf-8`。成功的文件响应会保留自身 media type，并在适用时暴露 `ETag`、`Content-Length` 和 range headers。公开 API 响应可能包含：

| Header                         | Meaning                                                                                                                                           |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `X-Request-Id`                 | 将错误与服务日志关联。由通用 Worker 错误路径返回。                                                                                                |
| `X-Haneoka-Release-Id`         | 提供服务器范围 catalog、source 或 game-client 响应的 release。release media 和 artifacts 会暴露自身 validator，但不会添加这些服务器范围 headers。 |
| `X-Haneoka-Source-Id`          | 与该 release 关联的 source snapshot。                                                                                                             |
| `X-Haneoka-Garupa-Snapshot-Id` | playlist projection 使用的不可变 Garupa Master snapshot。                                                                                         |
| `Sonolus-Version`              | 服务声明的 Sonolus app 版本。                                                                                                                     |
| `ETag`                         | 与 `If-None-Match` 一起使用；匹配时响应为 `304`。                                                                                                 |
| `Accept-Ranges: bytes`         | release media、game-client files、artifacts、Bestdori media 和就绪社区附件内容在路由页面声明支持时接受单一 byte range。                           |

服务器在公开文件和 JSON surface 上发送 `Access-Control-Allow-Origin: *`。身份验证和社区变更响应是同源浏览器流程，不能当作匿名跨源写入 API。

## 当前数据与不可变数据

不带 `release` 的 catalog 和 source 路径遵循活动指针。为 JSON 请求添加 `?release=r-<20 lowercase hex characters>`，即可将其固定到不可变 release。release media 和 game-client 路径遵循活动 release 指针。

响应 headers 会标识解析出的 release。请求的 release 无法解析时返回 `404 release_not_found`；没有发布当前 release 时，未固定的路径返回 `503 release_unavailable`。

## 分页

使用游标的 API 会返回不透明的 `nextCursor`。请按收到的值原样发送：

```text
GET /api/v1/community/posts?limit=20&cursor=<nextCursor>
```

不要解码或修改游标，也不要对游标内部结构做持久化假设。Sonolus 列表使用从零开始的 `page` 索引而不是游标。Catalog 批次受 URL 和 manifest 限制，并返回明确的 `missing` ID。

## 缓存

公开 registry 和 provider 数据可以缓存。当前指针 JSON 使用较短的浏览器生命周期，以便快速看到提升的 release。不可变 release 对象和 content-addressed game bundle 可以缓存一年。社区和账户 JSON 响应使用 `Cache-Control: no-store`。

请遵守 `ETag`、`Cache-Control` 和 `Content-Range`。`206` 响应只对请求的 range 有效；`416` 响应包含 `Content-Range: bytes */<size>`。

## 身份验证和同源写入

Better Auth 使用 HTTP-only cookies。浏览器请求请发送 `credentials: "include"`。社区、资料、头像、上传和偏好设置写入会拒绝跨源请求并返回 `403`。直接集成应使用已授权的浏览器会话或特定于应用的流程；不要把会话 cookie 复制到日志或公开示例中。
