---
title: Sonolus API
description: 将 Sonolus 客户端连接到公开的 Haneoka level 和 playlist 服务。
---

该服务实现由当前 Our Notes release set 支持的 Sonolus server document 以及 level/playlist 路由。所有路由都是公开读取。请发送 `Accept: application/json`，并保留 `Sonolus-Version` 响应 header。

## Server info

```http
GET /sonolus/info
```

返回标准 Sonolus server info document。`GET /sonolus` 会以 `308` 重定向到 `/sonolus/`；在 Sonolus 注册中应使用带结尾斜杠的 server URL。

## Level routes

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

List page 从零开始，页面大小为 20。`levelName` 是 list 或 info document 返回的准确名称。Data hash 是来自 level `data` 对象的 40 个字符小写 SHA-1 值。Data 响应是二进制（通常为 `application/gzip`），可以作为不可变内容缓存。

`/sonolus/levels/info?type=random` 和 `/sonolus/levels/list?type=random` 返回随机 level projection。随机响应为 `no-store`；不要将它们作为稳定 catalog index。

## Playlist routes

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

Our Notes playlist 使用从 source song identity 生成的名称。请将名称视为服务返回的不透明值。Playlist item 包含自身的 level item，包括每个 level 的 `data` descriptor。

## 本地化

静态 Sonolus JSON document 接受：

```text
?localization=ja
?localization=en
?localization=zh-TW
?localization=zh-CN
?localization=ko
```

服务器会本地化已知 Sonolus labels，并使响应 validator 与本地化 body 保持一致。如果没有提供 localization，服务返回默认 document language。Repository 和 binary data 路由会忽略 localization。

## Session header

为了兼容客户端，`Sonolus-Session` 可作为 CORS request header 接受。公开 Haneoka 服务不会在这些读取路由上使用它进行账户身份验证。不要向 Sonolus endpoint 发送账户 cookies 或私有凭据。

## Bestdori projection

Sonolus catalog 可以切换到转换后的 Bestdori source：

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

Bestdori level data ID 由 provider 作用域决定，应从返回的 item 中读取。需要 source catalog JSON 而不是 Sonolus document 时，可以使用单独的 [Bestdori API](../providers/bestdori/)。

## 失败行为

未知 Sonolus document 返回带有 `{ "message": "Not found" }` 的 `404`。Catalog projection 失败返回带有 `{ "message": "Service unavailable" }` 的 `503`。Sonolus 路由使用此 message envelope。

Sonolus surface 提供 level 和 playlist data。
