---
title: Game-client API
description: 在構建 client integration 時讀取 game-client manifest 和釋出檔案。
---

這是 client-build tooling 使用的高階 contract。普通 catalog consumer 通常只需要 resource DTO 返回的 `file`、`jacketUrl` 或 `musicUrl`，並可透過[媒體與檔案](/zh-tw/servers/media/)請求這些路徑。

Game-client API 暴露活動 server release 中的檔案。請先讀取 manifest，然後請求 manifest 或 Addressables index 列出的檔名。

## Manifest

```http
GET /game-client/{server}/manifest.json
HEAD /game-client/{server}/manifest.json
```

穩定 envelope 包含：

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

伺服器返回 `X-Haneoka-Release-Id` 和 `X-Haneoka-Source-Id`。Manifest 遵循當前指標，生命週期較短。

## Master files

```http
GET /game-client/{server}/master/MasterDataSystemVersion.txt
GET /game-client/{server}/master/{filename}
HEAD /game-client/{server}/master/{filename}
```

版本檔案是文字。其他受支援的 master 檔案遵循 `Master*.bin` 檔名語法，並以二進位制資料返回。檔名必須來自 release manifest 或已記錄的客戶端合約。

## Addressables

```http
GET /game-client/{server}/asset/{platform}/{filename}
HEAD /game-client/{server}/asset/{platform}/{filename}
```

Platform 必須等於 manifest 中的 `addressables.platform`。伺服器解析 256 路 release index shard，並提供 content-addressed object。Catalog files 是當前 release 物件；當 index role 允許時，Unity bundles 和 catalog payloads 可以作為不可變內容快取。

Addressables 回應是二進位制，幷包含 release headers。缺少 platform、filename 或 index entry 時返回 `404`；index/object 完整性失敗時返回 `502`。
Game-client file 回應暴露 `ETag`，並接受單一 byte range；可滿足的 range 返回 `206`，無效 range 返回帶有 `Content-Range: bytes */<size>` 的 `416`。

## 實際步驟

1. 獲取 `manifest.json`。
2. 確認 `platform` 和 catalog filenames。
3. 透過 `/asset/{platform}/{filename}` 獲取 catalog file 和 hash file。
4. 從 client catalog 或 published index 中解析其他 filenames。
5. 根據回應 headers 快取，並將 release ID 與本地 index 一起儲存。
