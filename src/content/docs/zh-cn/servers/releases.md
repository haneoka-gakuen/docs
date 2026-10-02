---
title: 服务器与版本
description: 选择活动 server，并为可重现 build 固定不可变 release。
---

本页介绍高级 server-scoped contract。普通消费者直接使用 `/api/v1/songs` 等 alias；省略 `server` 时，它们读取 `intl` 的当前数据。

## 列出活动 server slug

```http
GET /api/v1/releases
HEAD /api/v1/releases
```

历史 route name 保留用于兼容。响应列出活动 server slug 和显示信息：

```json
{
  "releases": [
    { "id": "intl", "displayName": "Global", "region": "global" },
    { "id": "intl-cbt", "displayName": "Global CBT", "region": "global" },
    { "id": "jp", "displayName": "Japan", "region": "jp" },
    { "id": "jp-cbt", "displayName": "Japan CBT", "region": "jp" }
  ]
}
```

此响应中的 `id` 是 server slug，用于 `?server=` 和显式 server-scoped 路由的 `{server}`。当部署新增或停用 server 时，列表会变化。

## 读取当前 release manifest

```http
GET /api/v1/servers/{server}/release
GET /api/v1/servers/{server}/release?projection=identity
```

完整 manifest 描述 release 的 catalog、source tree、game-client inventory 和文件。工具只需要记录所选 release 时，可使用 `projection=identity` 返回的 compact descriptor：

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "intl",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

`releaseId` 是服务返回的不透明值。上面的 JSON 使用结构示意值；实际请求先读取当前 identity。

## 固定显式请求

每个 server-scoped catalog、source 和 release route 都接受 release query：

```js
const base = "https://haneoka.org/api/v1/servers/intl/";
const identityResponse = await fetch(`${base}release?projection=identity`);
if (!identityResponse.ok) throw new Error(`Identity HTTP ${identityResponse.status}`);
const identity = await identityResponse.json();
const query = new URLSearchParams({ release: identity.releaseId });
const response = await fetch(`${base}songs/100001?${query}`);
if (!response.ok) throw new Error(`Song HTTP ${response.status}`);
console.log(await response.json(), response.headers.get("X-Haneoka-Release-Id"));
```

响应包含 `X-Haneoka-Release-Id` 和 `X-Haneoka-Source-Id`。需要审计的 archive 应将这些 headers 与下载数据一起保存。无效 release 返回 `404 release_not_found`；未固定请求使用 server 的当前 pointer。

Release media 和 game-client 文件也由活动 server pointer 选择。Content-addressed artifact route 显式使用 source ID。请参阅[媒体与文件](/zh-cn/servers/media/)、[Game-client](/zh-cn/servers/game-client/)和[Source tree](/zh-cn/servers/sources/)。

## 什么时候使用本页

当 build 必须重现过去的产物、crawler 保存完整 snapshot，或工具需要 release 的 storage descriptor 时固定 release。显示当前歌曲、活动或剧情的 web app 可以继续使用直接 alias，让每次请求读取当前 catalog。
