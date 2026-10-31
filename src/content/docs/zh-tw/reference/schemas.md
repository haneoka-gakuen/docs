---
title: 共用結構描述
description: 整個 API 共用的穩定回應封裝與識別碼規則。
---

## 目前資源的回應

直接資源路由在沒有 `?server=<slug>` 時使用目前的 `intl` 目錄。集合索引通常是以實體 ID 為鍵的物件，值保留資源定義的 DTO 形態。一個資源可以公開形態各異的索引、實體、檢視與關聯。目錄頁面有實際的歌曲回應，以及使用端會用到的欄位語意。

## 錯誤

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Human-readable diagnostic",
    "requestId": "optional-request-correlation-id"
  }
}
```

用來分支判斷的是 `code`。`message` 可能為了更清楚而改變。`requestId` 為選用，若有請附在支援回報中。

## 版本識別（進階）

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "server-slug-from-registry",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

顯示的值用來說明欄位的角色。後續請求請使用服務回傳的 ID。

## 目錄清單

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

每個資源的中繼資料物件宣告 `kind`、`count`、`dependencies`、`index`，以及選用的 `entities`、`relations` 與 `views`。實體與關聯的儲存描述含有 FNV-1a 分片演算法、分片數、前綴與分片名稱。關聯中繼資料宣告 `entityCount` 與 `valueMode`（`ids` 或 `records`）；檢視中繼資料宣告自己的實體儲存、`path` 與 `shape`（`array` 或 `object`）。清單是決定有哪些目錄路由的核心 DTO。範例省略了分片列表，請使用服務回傳的完整列表。

## 目錄批次

```json
{
  "items": { "entity-key-from-index": {} },
  "missing": ["entity-key-not-present"]
}
```

`items` 的值保留資源定義的實體形態，API 不會加上通用的 `id` 或 `title` 欄位。兩個對應表都使用服務提供的 ID。找不到的鍵會列在 `missing`。

## 社群分頁

社群列表回應使用 `nextCursor: string | null`。`nextCursor` 為 `null` 時代表分頁結束。每個游標都請原樣送回。

## 時間戳與媒體

社群時間戳是 Unix 紀元起算的毫秒。目錄與供應者的時間戳依循各自來源 DTO 的契約，可能是數字，也可能是供應者的地區化值。媒體欄位在物件已就緒且允許時含有 `mediaType`、`size`、`width`、`height` 與 URL。請保留 `null` 值，它表示來源目前沒有提供該屬性。
