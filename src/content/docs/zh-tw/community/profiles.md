---
title: 資料、關係和偏好設定
description: 讀取公開資料並管理已登入帳號的資料。
---

## 公開資料

```http
GET /api/v1/community/users/{uid}?limit=24
```

`uid` 是其他資料或已釋出內容回應中返回的公開數字 UID。回應包含：

```json
{
  "profile": {
    "uid": 1001,
    "displayName": "Example user",
    "handle": "example-user",
    "bio": null,
    "avatarSeed": "opaque-avatar-seed",
    "avatarUrl": null,
    "joinedAt": 1730000000000,
    "owner": false,
    "role": "member",
    "stats": { "followers": 0, "following": 0, "gameAccounts": 0, "posts": 0, "works": 0 }
  },
  "viewer": { "blocked": false, "followedBy": false, "following": false, "muted": false, "canInteract": false },
  "posts": [],
  "postsNextCursor": null,
  "works": [],
  "gameAccounts": []
}
```

公開帖子使用遊標分頁（`limit` 預設值為 24，最大為 50）。如果檢視者遮蔽了任一方，會收到空的帖子/作品/帳號投影。遊戲帳號欄位是帳號所有者選擇公開的快照。

## 已登入資料

```http
GET /api/v1/account/profile
PATCH /api/v1/account/profile
DELETE /api/v1/account/profile
```

GET 回應是 `{ "profile": ... }`，其中包含帳號名稱、公開 UID、handle、bio、顯示名稱稽核狀態、頭像欄位、角色、資料狀態以及單調遞增的 `version`。

只提交需要修改的欄位：

```json
{
  "displayName": "New display name",
  "handle": "new-handle",
  "bio": "Short biography",
  "version": 4
}
```

`displayName` 為 1–80 個可見字元；`handle` 為 3–32 個小寫字母/數字/下劃線/連字元，不能只包含數字；`bio` 最多 500 個字元。`null` 會清除 `handle` 或 `bio`。顯示名稱需要稽核，可能返回帶 pending 狀態的 `202`。版本過舊時返回 `409 profile_conflict`；handle 已被佔用時返回 `409 handle_unavailable`。

刪除需要已驗證郵箱的會話，併傳送：

```json
{ "confirmation": "the-current-account-email" }
```

刪除成功時返回 `204` 並清除 cookie。最後一個活動管理員在轉移管理員許可權前不能刪除帳號。

## 關係

```http
PUT /api/v1/community/users/{uid}/follow
PUT /api/v1/community/users/{uid}/block
PUT /api/v1/community/users/{uid}/mute
```

每個介面接受 `{ "active": true }` 或 `{ "active": false }`，並返回關係狀態。`uid` 是公開 UID，不是私有 user ID。遮蔽會影響可見性和互動；修改後客戶端應重新讀取公開資料。

## 偏好設定

```http
GET /api/v1/me/preferences
PUT /api/v1/me/preferences
```

新帳號的回應為 `{ "preferences": null }`，否則為：

```json
{
  "preferences": {
    "locale": "zh-CN",
    "releaseServer": "jp-cbt",
    "settings": { "density": "comfortable" },
    "version": 2,
    "updatedAt": 1730000000000
  }
}
```

PUT 會將省略的鍵與已儲存值合併；顯式的 `null` 會清除欄位。支援的 locale 是 `ja`、`en`、`zh-TW`、`zh-CN` 和 `ko`；settings 最大為 16 KiB。

## 頭像

設定或清除已登入使用者的頭像：

```http
PUT /api/v1/account/avatar
Content-Type: image/webp

<binary image>

DELETE /api/v1/account/avatar
```

接受最大 2 MiB 的 JPEG、PNG 和 WebP 圖片，最大尺寸為 4096，最多 16 million 畫素。PUT 成功時，在稽核執行期間返回 `202 { "avatar": { "status": "pending" } }`。

讀取已就緒的頭像：

```http
GET /api/v1/account/avatar/{userId}
```

`userId` 路徑片段是資料頭像 URL 使用的不透明帳號識別符號。缺失或未批准的頭像返回 `404 avatar_not_found`。
