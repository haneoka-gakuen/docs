---
title: Game-client API
description: 读取 release-backed game-client manifest、Master files 和 Addressables。
---

Game-client API 暴露活动 server release 中的文件。请先读取 manifest，然后请求 manifest 或 Addressables index 列出的文件名。

## Manifest

```http
GET /game-client/{server}/manifest.json
HEAD /game-client/{server}/manifest.json
```

稳定 envelope 包含：

```json
{
  "schema": "haneoka-game-client-v1",
  "server": "jp-cbt",
  "sourceId": "garupa-jp-2026-09",
  "master": { "systemVersion": "example-system-version" },
  "addressables": {
    "platform": "Android",
    "catalogFile": "catalog.json",
    "catalogHashFile": "catalog.hash",
    "embeddedCatalogFile": "catalog.embedded.json",
    "index": {
      "algorithm": "fnv1a32-mod-256",
      "shards": 256,
      "prefix": "addressables/index/"
    }
  }
}
```

服务器返回 `X-Haneoka-Release-Id` 和 `X-Haneoka-Source-Id`。Manifest 遵循当前指针，生命周期较短。

## Master files

```http
GET /game-client/{server}/master/MasterDataSystemVersion.txt
GET /game-client/{server}/master/{filename}
HEAD /game-client/{server}/master/{filename}
```

版本文件是文本。其他受支持的 master 文件遵循 `Master*.bin` 文件名语法，并以二进制数据返回。文件名必须来自 release manifest 或已记录的客户端合约。

## Addressables

```http
GET /game-client/{server}/asset/{platform}/{filename}
HEAD /game-client/{server}/asset/{platform}/{filename}
```

Platform 必须等于 manifest 中的 `addressables.platform`。服务器解析 256 路 release index shard，并提供 content-addressed object。Catalog files 是当前 release 对象；当 index role 允许时，Unity bundles 和 catalog payloads 可以作为不可变内容缓存。

Addressables 响应是二进制，并包含 release headers。缺少 platform、filename 或 index entry 时返回 `404`；index/object 完整性失败时返回 `502`。
Game-client file 响应暴露 `ETag`，并接受单一 byte range；可满足的 range 返回 `206`，无效 range 返回带有 `Content-Range: bytes */<size>` 的 `416`。

## 实际步骤

1. 获取 `manifest.json`。
2. 确认 `platform` 和 catalog filenames。
3. 通过 `/asset/{platform}/{filename}` 获取 catalog file 和 hash file。
4. 从 client catalog 或 published index 中解析其他 filenames。
5. 根据响应 headers 缓存，并将 release ID 与本地 index 一起保存。
