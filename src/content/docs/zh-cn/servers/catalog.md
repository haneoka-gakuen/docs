---
title: Catalog 数据
description: 浏览当前 resource、entity、view、relation 和 batch。
---

## 先使用直接路由

普通应用使用读取当前数据的短 URL：

```http
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}?server=jp
GET /api/v1/{resource}/{id}?server=jp
```

默认 server 是 `intl`。`server` query 用于选择活动 server。这些路径与 `/api/v1/servers/{server}/{resource}` 使用同一个 catalog handler；显式形式用于同时需要 release 参数的 build 和 archive 工具。

常见 resource name 包括 `songs`、`bands`、`characters`、`cards`、`stories`、`events`、`audio`、`videos` 和 `voices`。选定 catalog 才是权威来源，请使用它提供的 resource name、ID、view 和 relation，不要维护硬编码列表。

## Resource index 和 entity

Index 请求返回 provider-shaped document。Collection resource 通常返回以 entity ID 为键的 object：

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
```

```json
{
  "100001": {
    "musicId": 100001,
    "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
    "bandId": 1,
    "difficulty": [
      { "difficulty": 0, "difficultyName": "easy", "displayLevel": 9, "noteCount": 342 }
    ],
    "jacketUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png",
    "musicUrl": "/runtime/intl/cri/sound/musicscore/M_Mayoiuta/1_M_Mayoiuta.mp3"
  }
}
```

使用 key 读取完整 entity：

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
```

Entity 可能比 index 项目包含更多字段，例如本地化创作者、发布日期、combo rewards、谱面路径和 video IDs。保留未知字段，并把 `null` 视为 source 当前没有值。其他 resource 有自己的 shape；events document 使用 `entries` 和 `hasGameEvents`，而不是歌曲字段。

## Batch 读取

重复 `id` 读取一组 entity：

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs?id=100001&id=100002&server=jp'
```

响应为：

```json
{
  "items": {
    "100001": { "musicId": 100001, "musicTitle": ["迷星叫", "Mayoiuta"] }
  },
  "missing": ["100002"]
}
```

`items` 使用请求的 ID 作为 key；没有 entity 的 ID 出现在 `missing`。API 会排序并去重 ID，以稳定缓存。

## View 和 relation

Catalog manifest 会为 resource 声明可选 view 和 relation。View 是有自己 index 和 entity shape 的命名 projection：

```http
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/views/{view}?id={id}&id={id}
```

Relation 使用 resource、relation name 和 key：

```http
GET /api/v1/{resource}/relations/{relation}/{key}
```

Manifest 中的 `valueMode` 说明结果。`ids` relation 会展开为以 ID 为键的 canonical entity；`records` relation 直接返回 provider record。已声明但没有值的 relation key 返回 `{}`。

需要这些名称时读取所选 server 的 manifest：

```bash
curl --fail-with-body https://haneoka.org/api/v1/servers/intl/catalog
```

Manifest 描述 resource `kind`、count、index path、entity store、view path 与 shape、relation name 和 dependencies。Storage 字段适合 crawler；普通应用可以继续使用直接路由。

## 对调用方有用的字段语义

| 字段模式 | 使用方式 |
| --- | --- |
| `musicTitle`、`bandName` 等本地化数组 | 选择文档规定的 locale 位置，值为空时提供 fallback；保留数组以支持之后切换 locale。 |
| `*Url` 和 `file` path | 以 `https://haneoka.org` 为基准解析，需要二进制时发送到对应 media 或 game-client 路由。 |
| Difficulty record | 分别读取 `difficultyName`、`displayLevel`、`playLevel`、`sortLevel` 和 `noteCount`，保留 chart `file` path。 |
| `musicId`、`bandId`、`videoIds` 等 ID | 保留 source 的数字或字符串类型；ID 规则由 resource 定义。 |
| `null` | Source 当前没有值，不要转换为空字符串。 |

## 高级显式形式

Server-scoped 请求使用：

```http
GET /api/v1/servers/{server}/{resource}
GET /api/v1/servers/{server}/{resource}/{id}
```

只有可重现 build 或 archive 需要固定 catalog 时，才添加 `release=r-<20 lowercase hex characters>`。[高级服务器接口](./releases/) 介绍 release、source、media 和 storage surface。
