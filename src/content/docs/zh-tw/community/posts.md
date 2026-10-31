---
title: 帖子、評論和動態
description: 使用社群內容和互動介面。
---

## 列出帖子

```http
GET /api/v1/community/posts?limit=20&scope=latest
```

支援的查詢引數：

| Parameter | Values                                                            | Notes                                        |
| --------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `limit`   | `1`–`50`                                                          | 預設值為 `20`。                              |
| `cursor`  | opaque                                                            | 原樣傳送返回的值。                           |
| `scope`   | `all`, `latest`, `recommended`, `following`, `mine`, `bookmarked` | 最後三項需要會話。                           |
| `state`   | `active`, `archived`, `all`                                       | 只有 `scope=mine` 才能使用 archived 狀態。   |
| `q`       | 1–100 characters                                                  | 搜尋標題和正文。                             |
| `tag`     | normalized tag                                                    | 按標籤篩選可見帖子。                         |
| `seed`    | `0`–`2147483647`                                                  | 推薦種子；繼續推薦遊標時必需。               |
| `refresh` | `1`                                                               | 開始新的推薦動態；不能與 `cursor` 一起使用。 |

回應：

```json
{ "posts": [], "nextCursor": null }
```

`scope=recommended` 也可能返回 `seed`。請將該 seed 與返回的遊標一起儲存。遊標是不透明的，其格式可能在不同版本間變化。

## 讀取帖子

```http
GET /api/v1/community/posts/{postId}
GET /api/v1/community/posts/{postId}?commentsOnly=true
GET /api/v1/community/posts/{postId}?includeComments=false
```

預設情況下，回應包含 `post`、`comments`、`commentsNextCursor`、`commentsSort` 和 `viewer`。評論預設按 `hot` 排序；當 `commentsSort=latest` 時按最新排序；使用 `commentsCursor` 繼續讀取。`commentId` 可以將可見評論聚焦到回應中。

## 建立和編輯

建立帖子：

```http
POST /api/v1/community/posts
Content-Type: application/json

{
  "title": "Optional title",
  "body": "Post text",
  "visibility": "public",
  "tags": ["release-notes"],
  "attachmentIds": ["attachment-id-returned-by-upload"]
}
```

`title` 預設取派生的首行。`body` 必填，最多 20,000 個字元。`visibility` 可以是 `public`、`protected` 或 `private`；標籤會被規範化，最多 10 個；一篇帖子最多包含 16 個不重複的附件 ID，每個附件都必須已就緒並獲準。每位作者新建帖子每小時最多 30 篇、每天最多 200 篇。

使用樂觀併發編輯帖子：

```http
PATCH /api/v1/community/posts/{postId}
Content-Type: application/json

{
  "title": "Updated title",
  "body": "Updated body",
  "visibility": "protected",
  "tags": [],
  "version": 1,
  "editReason": "Clarify the release reference"
}
```

每次編輯帖子都傳送 `body` 和當前 `version`。也可以傳送 `title`、`visibility`、`tags` 以及可選的 `editReason`。編輯帖子不會改變附件；請使用附件關聯路由完成此操作。版本過舊時返回 `409 version_conflict`。

刪除：

```http
DELETE /api/v1/community/posts/{postId}
Content-Type: application/json

{ "version": 2 }
```

刪除成功時返回 `204`。

## 評論和反應

```http
POST /api/v1/community/posts/{postId}/comments
Content-Type: application/json

{ "body": "A reply", "parentId": "parent-comment-id-from-the-post" }
```

`parentId` 可選，必須標識同一帖子中的評論。評論正文最多 5,000 個字元；每位作者每小時最多 300 條評論、每天最多 2,000 條。

切換帖子或評論反應：

```http
PUT /api/v1/community/posts/{postId}/reaction
{ "active": true }

PUT /api/v1/community/comments/{commentId}/reaction
{ "active": false }
```

帖子反應回應包含 `{ "active": true, "likeCount": 3 }`；書籤回應包含 `{ "active": true }`；評論反應回應包含更新後的 `likeCount`。

置頂、歸檔和恢復要求當前帖子版本：

```http
PUT /api/v1/community/posts/{postId}/pin
{ "active": true, "version": 2 }

POST /api/v1/community/posts/{postId}/archive
{ "version": 3 }
```

這些操作返回帶有更新後帖子 `{ "post": ... }` 的回應。

## 動態反饋和舉報

```http
PUT /api/v1/community/posts/{postId}/feedback
{ "feedback": "not_interested", "reasonCode": "too_repetitive" }

DELETE /api/v1/community/me/post-feedback
```

反饋可以是 `not_interested`、`hide` 或 `null`；設定值時 `reasonCode` 可選，清除反饋時必須省略或設為 null。

建立舉報：

```http
POST /api/v1/community/reports
{
  "targetKind": "post",
  "targetId": "post-id-from-the-service",
  "reasonCode": "spam",
  "details": "Optional detail"
}
```

`targetKind` 可以是 `post`、`comment` 或 `user`。舉報原因可以是 `spam`、`harassment`、`hate`、`sexual`、`violence`、`privacy`、`copyright`、`misinformation` 或 `other`；使用 `other` 時必須提供 `details`。
