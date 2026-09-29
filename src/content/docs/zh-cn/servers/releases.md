---
title: Servers 和 releases
description: 发现活动 resource servers，并固定不可变 releases。
---

## 列出活动 servers

```http
GET /api/v1/releases
HEAD /api/v1/releases
```

不需要身份验证。响应按 region、display name 和 slug 排序：

```json
{
  "releases": [
    { "id": "intl", "displayName": "Global", "region": "global" },
    { "id": "jp", "displayName": "Japan", "region": "jp" }
  ]
}
```

支持的 `region` 值为 `global`、`jp`、`kr`、`tw`、`cn` 和 `en`。`id` 是 server slug，也是所有 server-scoped API 的 `{server}` 路径参数。registry 只包含活动 servers。

## 查看当前 release

```http
GET /api/v1/servers/{server}/release
HEAD /api/v1/servers/{server}/release
GET /api/v1/servers/{server}/release?projection=identity
```

默认响应是已发布的 release manifest。其结构由 release 决定，是 catalog manifest、source index、game-client manifest 和 content inventory 的事实来源。当小型稳定 descriptor 足够时，请使用 identity projection：

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "intl",
  "releaseId": "r-679793a903cd5cd2838a",
  "sourceId": "v25-c0b6a1541e45-9e9e2f64c6da-medea1e907f55-ncd8654cc"
}
```

`releaseId` 匹配 `r-` 后接 20 个小写十六进制字符。后续固定请求请使用响应或 release pointer 返回的值；不要构造或猜测 release ID。

## 固定请求

每个 server-scoped catalog 路径都接受：

```text
?release=r-0123456789abcdef0123
```

Release descriptor 是不可变的。缺少 identity descriptor 时返回 `404 release_identity_missing`；descriptor 无效时返回 `502 release_identity_invalid`。未固定请求使用当前 release pointer；没有发布 release 时返回 `503 release_unavailable`。

## Release headers

成功的 server-scoped 响应包含 `X-Haneoka-Release-Id` 和 `X-Haneoka-Source-Id`。请将这些 headers 与缓存或索引数据一起保留。
