---
title: Source metadata
description: 为 archive 和 build tooling 检查已发布的 source metadata。
---

Source record 是高级的 release-scoped 数据。普通应用可以继续使用当前 resource alias 和 DTO 返回的 media path。

## Source tree

```http
GET /api/v1/servers/{server}/sources/tree
```

以 JSON 返回 release 的 source index tree。请将返回的路径用于 source-record route。

## Source record

```http
GET /api/v1/servers/{server}/sources/Assets/{path}
GET /api/v1/servers/{server}/sources/Packages/{path}
```

Source path 以 `Assets/` 或 `Packages/` 开头，并通过 release index 解析。Source record 是当前 release 发布的 JSON DTO，可能包含 importer metadata、asset relationships 或 source-specific fields。

Release identity 和响应 headers 中的 `sourceId` 标识 source snapshot。Source tree 和 source DTO 是只读公开数据，不会暴露经过身份验证的账户数据。
