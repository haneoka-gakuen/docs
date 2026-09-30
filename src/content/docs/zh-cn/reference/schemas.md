---
title: 共享 schemas
description: API 使用的稳定响应 envelope 和标识符规则。
---

## 当前 resource 响应

直接 resource 路由默认使用当前 `intl` catalog；添加 `?server=<slug>` 后选择指定 server。Collection index 通常是以 entity ID 为键的 object，值保留 resource 自己的 DTO shape。同一 resource 的 index、entity、view 和 relation 可以有不同 shape。Catalog 页面提供真实的歌曲响应和调用方需要的字段语义。

## Error

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Human-readable diagnostic",
    "requestId": "optional-request-correlation-id"
  }
}
```

`code` 是用于分支处理的值。`message` 可能为了清晰度而改变。`requestId` 是可选的，存在时应包含在支持报告中。

## Release identity（高级）

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "server-slug-from-registry",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

显示的值用于说明字段职责。后续请求请使用服务返回的 ID。

## Catalog manifest

```json
{
  "schema": "haneoka-catalog-storage-v2",
  "server": "server-slug",
  "sourceId": "source-snapshot-id",
  "summary": "api/v1/catalog/summary.json",
  "partition": { "algorithm": "fnv1a32-mod-256", "shards": 256 },
  "resources": {
    "songs": {
      "count": 85,
      "dependencies": ["bands", "items", "song-meta", "videos"],
      "entities": {
        "algorithm": "fnv1a32-mod-256",
        "count": 85,
        "prefix": "api/v1/catalog/songs/entities/",
        "shards": ["01", "06", "09"]
      },
      "index": "api/v1/catalog/songs/index.json",
      "kind": "collection",
      "relations": {},
      "views": {}
    }
  }
}
```

每个 resource metadata 对象声明 `kind`、`count`、`dependencies`、`index`、可选的 `entities`、`relations` 和 `views`。Entity 和 relation storage descriptor 包含 FNV-1a shard algorithm、shard count、prefix 和 shard names。Relation metadata 声明 `entityCount` 和 `valueMode`（`ids` 或 `records`）；view metadata 声明自身的 entity store、`path` 以及 `shape`（`array` 或 `object`）。manifest 是决定可用 catalog 路由的核心 DTO。示例缩短了 shard 列表；请使用服务返回的完整列表。

## Catalog batch

```json
{
  "items": { "entity-key-from-index": {} },
  "missing": ["entity-key-not-present"]
}
```

`items` 的值保留 resource 定义的 entity shape；API 不会强制所有资源都有通用的 `id` 或 `title` 字段。两个 map 都使用服务提供的 ID。缺失的键会出现在 `missing` 中。

## Community pagination

社区列表响应使用 `nextCursor: string | null`。当 `nextCursor` 为 `null` 时，该页已完成。请将每个游标原样发送回去。

## Timestamps and media

社区时间戳是 Unix epoch milliseconds。Catalog/provider 时间戳遵循来源 DTO 合约，可能是数字或本地化 provider 值。Media 字段包括 `mediaType`、`size`、`width`、`height`，以及在对象就绪/获准时存在的 URL。请保留 `null` 值；它们表示来源当前没有提供该属性。
