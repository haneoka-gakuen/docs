---
title: Catalog API
description: 读取 release-backed resources、entities、views、relations 和 batches。
---

Catalog storage 是与 resource 无关的 API。当前 release 的 `catalog` manifest 列出 resource names、entity indexes、view indexes、relations、count fields 和 storage shape。

## Manifest 和 summary

```http
GET /api/v1/servers/{server}/catalog
GET /api/v1/servers/{server}/catalog/summary
```

Manifest 具有以下稳定 envelope：

```json
{
  "schema": "haneoka-catalog-storage-v2",
  "server": "intl",
  "sourceId": "source-id-from-the-release",
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
      "relations": {
        "band": {
          "algorithm": "fnv1a32-mod-256",
          "count": 6,
          "entityCount": 85,
          "prefix": "api/v1/catalog/songs/relations/band/",
          "shards": ["1c", "42", "63"],
          "valueMode": "records"
        }
      }
    }
  }
}
```

嵌套的 entity、relation 和 view metadata 具有权威性。请使用 manifest 返回的 resource names、relation names、view names 和 entity IDs。Count 和 shard lists 是 release data；上面的缩短列表只用于说明结构，并不完整。

## Resource index

```http
GET /api/v1/servers/{server}/{resource}
```

返回 manifest 中列出的 resource 的 release index document。Index 是用于发现的 provider-shaped JSON document；读取单条记录请使用 entity route。它的键和值由 resource 定义。

## Entity

```http
GET /api/v1/servers/{server}/{resource}/{id}
```

`id` 必须符合路由键语法（`A-Z`、`a-z`、`0-9`、`.`、`_`、`:`、`~` 和 `-`，最多 256 个字符）。已知 resource 缺少 ID 时返回：

```json
{
  "error": { "code": "entity_not_found", "message": "Catalog entity not found" }
}
```

Entity body 是该 resource 的规范 DTO。它可能包含本地化值、数字 ID、时间戳、嵌套记录、media path 和 provider 字段。使用者应保留未知字段，并使用 resource 的 manifest metadata 和返回的 DTO，不要把每个 resource 强制转换为共享的游戏 entity 类型。

## Batch entities

```http
GET /api/v1/servers/{server}/{resource}?id={id}&id={id}
```

Resource 和 view 都支持批量请求。ID 会去重并排序，以便缓存。响应为：

```json
{
  "items": {
    "song-key": { "id": "song-key", "title": "Example" }
  },
  "missing": ["missing-song-key"]
}
```

请使用 resource index 返回的 ID。ID 格式错误时返回 `400 invalid_batch`。Batch envelope 是稳定的；`items` 下的值保留 resource 定义的 entity shape。

## Views

Manifest 可能提供带有明确 shape 和 path 的 view：

```http
GET /api/v1/servers/{server}/{resource}/views/{view}
GET /api/v1/servers/{server}/{resource}/views/{view}/{id}
GET /api/v1/servers/{server}/{resource}/views/{view}?id={id}&id={id}
```

View index 会在 manifest 列出的 path 返回其声明的 collection shape（`array` 或 `object`）。Entity route 读取 view 的 entity index。缺少 view 时返回 `404 view_not_found`。View entities 是该 view 的 DTO，不要求与父 resource entity shape 一致。

## Relations

```http
GET /api/v1/servers/{server}/{resource}/relations/{relation}/{key}
```

Manifest 声明 relation 使用 `valueMode: "ids"` 还是 `valueMode: "records"`：

- `ids` relations 会展开为对象，键是 entity ID，值是来自 resource entity store 的规范 entity。
- `records` relations 直接返回 relation 的 provider record object。

不存在的 relation key 返回 `{}`。未知 relation name 和无效 key 返回 `404 relation_not_found`。

## UI marks

```http
GET /api/v1/servers/{server}/ui-marks
```

返回将 UI mark name 映射到 release asset path 的 JSON 对象。该集合可能为空：

```json
{
  "RarityIconCenter_R.png": "Assets/.../RarityIconCenter_R.png"
}
```

## 查询和缓存规则

Catalog JSON 由 release 提供并可缓存。在提供 `ETag` 时请使用，并保留 release headers。`catalog` 和 `catalog/summary` 是不同的文档；summary 是面向消费者的 projection，而 manifest 解释所有 storage routes。
