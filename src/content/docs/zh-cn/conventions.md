---
title: 约定
description: API 共用的 URL、响应、缓存、身份验证和分页规则。
---

## 基础 URL 和当前数据 alias

生产环境使用 `https://haneoka.org`。直接 catalog 路由为：

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

这些路径默认使用当前 `intl` server。添加 `?server=jp` 或 `GET /api/v1/releases` 返回的其他 slug 选择活动 server。显式的 `/api/v1/servers/{server}/...` 使用同一个 catalog handler，并增加供可重现 build 使用的 `release` 参数。

`resource`、`id`、`view`、`relation` 和 `key` 都由数据定义。构造路径前先读取 catalog manifest 或 index。`releases`、`servers`、`account`、`me`、`community` 和 `garupa` 等顶层分组保留自己的 API 路由，不是 catalog resource name。对动态片段进行 URL 编码；只有路由明确接受 path 时才保留 `/`。

## JSON 和字段

JSON 响应使用 `application/json; charset=utf-8`。Catalog index 通常是以 entity ID 为键的 object，entity value 保留 source DTO shape。例如 song 使用 `musicId`、`musicTitle` 等本地化数组、difficulty records 和 media path；events resource 可以返回 `{ "entries": {}, "hasGameEvents": false }`。按照请求 resource 的字段编写代码，并保留额外字段。

API 不会为 provider DTO 加入统一的 `id`、`title` 或 `data` wrapper。Index key 是 lookup ID，即使 value 使用 resource 专属的 ID 字段。`null` 表示 source 当前没有该属性的值。

## 常用响应 headers

| Header | 含义 |
| --- | --- |
| `X-Request-Id` | 错误或诊断报告的关联 ID。 |
| `X-Haneoka-Release-Id` | server-scoped 响应使用的当前 release。 |
| `X-Haneoka-Source-Id` | 与该 release 关联的 source snapshot。 |
| `ETag` | 条件请求使用的 representation validator。 |
| `Cache-Control` | 服务指定的新鲜度和重新验证策略。 |
| `Content-Range` | 返回的 byte range，或无效 range 时的 `bytes */size`。 |

直接 alias 会在服务提升新 catalog 时变化。需要解释用户看到哪个数据版本时，可将 release headers 与缓存一起保存。需要稳定重放的应用可以改用显式 `release` 请求；高级 release 页面介绍该流程。

## Batch、view 和 relation

重复 `id` 批量读取：

```text
GET /api/v1/songs?id=100001&id=100002
```

Catalog batch 返回 `{ "items": { ... }, "missing": [ ... ] }`。服务会排序并去重 ID 以稳定缓存 key。缺失 ID 是该 ID 的结果，不表示请求失败。

Catalog manifest 会声明每个 resource 的 view 和 relation。View 有自己的 index 和 entity shape。Relation 会返回以 ID 为键的 canonical entity（`valueMode: "ids"`），或 relation document 中的 provider record（`valueMode: "records"`）。按 manifest 提供的名称和 shape 读取，不能假设所有 resource 相同。

## 缓存和媒体

请遵守 `ETag` 和 `Cache-Control`。发送 `If-None-Match`，representation 未变化时会收到 `304`。将 `/assets/intl/...` 和 `/runtime/intl/...` 这样的相对 media path 解析到 `https://haneoka.org`。

二进制路由会声明 media type，并可能支持单一 byte range。有效的部分响应是 `206`；无效 range 返回 `416` 和 `Content-Range: bytes */<size>`。不要原样重试 `416`。

## 身份验证和同源写入

公开 catalog、media、Sonolus 和 Bestdori 读取不需要 session。社区写入、资料修改、偏好设置、上传和 Better Auth 操作使用 HTTP-only cookie 与同源浏览器请求：

```ts
await fetch("/api/v1/account/profile", {
  credentials: "include",
  method: "PATCH",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ bio: "Hello", version: 4 }),
});
```

不要将 session cookie 写入日志或前端 bundle。每个身份验证页面会说明 request body、conflict 字段和 moderation 状态。
