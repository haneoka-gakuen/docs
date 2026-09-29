---
title: 快速开始
description: 获取服务器、固定资源版本、查询对象与关联数据。
---

## 获取服务器

```sh
curl --fail-with-body https://haneoka.org/api/v1/releases
```

响应中的 `releases[].id` 是服务器标识，如 `intl`、`jp`。后续请求使用返回的标识。

## 固定资源版本

```sh
curl --fail-with-body \
  'https://haneoka.org/api/v1/servers/intl/release?projection=identity'
```

保存返回的 `releaseId`，并在相关目录请求中传入 `release`。这样即使服务器在请求期间更新，得到的资料仍属于同一份快照。

```ts
const base = "https://haneoka.org/api/v1/servers/intl";
const identity = await fetch(`${base}/release?projection=identity`).then(r => r.json());
const read = async (path: string) => {
  const url = new URL(`${base}/${path}`);
  url.searchParams.set("release", identity.releaseId);
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
};

const manifest = await read("catalog");
const songs = await read("songs");
const song = await read("songs/100001");
```

`manifest.resources` 声明目录中可用的资源、视图与关联关系。对象与媒体字段的实际内容由这份资源快照决定。

## 批量查询

为每个对象重复传入 `id`：

```http
GET /api/v1/servers/intl/songs?id=100001&id=100002&release=<releaseId>
```

响应包含 `items` 和 `missing`。`items` 使用对象标识作为键；不存在的对象列在 `missing` 中。

## 获取关联内容

目录清单中的 `relations` 声明可用关联。例如，查询一个乐队的歌曲：

```http
GET /api/v1/servers/intl/songs/relations/band/1?release=<releaseId>
```

关联的 `valueMode` 决定结果是对象标识列表还是记录列表。继续使用同一个 `releaseId` 获取这些对象，即可构建角色、卡牌、剧情与活动之间的浏览体验。

## 使用工具描述

[OpenAPI 文件](/openapi.json) 可导入接口工具，或用于生成 TypeScript、Python 等语言的客户端。详细的媒体请求、认证与错误处理分别见 [媒体](/zh-cn/servers/media/)、[认证](/zh-cn/auth/) 与 [错误处理](/zh-cn/errors/)。
