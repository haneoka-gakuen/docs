---
title: 社群 API
description: 讀取和寫入帖子、評論、反應、關注、標籤、通知和偏好設定。
---

社群 JSON 位於 `/api/v1/community` 下。請求的內容為公開內容時，公開讀取不需要會話。變更操作要求 Better Auth 會話、已驗證郵箱、活動社群資料，以及同源請求。

## 瀏覽器請求來源

這些公開 GET 可以由服務端讀取，也可以在 Haneoka 本站網頁中讀取。當前社群回應沒有提供外站瀏覽器需要的 CORS 許可；從另一個網站直接 fetch 這些介面會被瀏覽器阻止。登入、私人資料與變更操作按下文同源會話要求處理。

## 路由概覽

| Method             | Path                                                    | Auth     | Purpose                           |
| ------------------ | ------------------------------------------------------- | -------- | --------------------------------- |
| `GET`              | `/api/v1/community/posts`                               | Optional | 動態、搜尋、標籤和遊標分頁。      |
| `POST`             | `/api/v1/community/posts`                               | Required | 建立帖子。                        |
| `GET`              | `/api/v1/community/posts/{postId}`                      | Optional | 讀取帖子和評論。                  |
| `PATCH` / `DELETE` | `/api/v1/community/posts/{postId}`                      | Author   | 編輯或刪除帖子。                  |
| `POST`             | `/api/v1/community/posts/{postId}/comments`             | Required | 建立評論或回覆。                  |
| `PUT`              | `/api/v1/community/posts/{postId}/reaction`             | Required | 切換點贊。                        |
| `PUT`              | `/api/v1/community/posts/{postId}/bookmark`             | Required | 切換書籤。                        |
| `PUT`              | `/api/v1/community/posts/{postId}/pin`                  | Author   | 置頂或取消置頂。                  |
| `POST`             | `/api/v1/community/posts/{postId}/archive`              | Author   | 歸檔。                            |
| `POST`             | `/api/v1/community/posts/{postId}/restore`              | Author   | 恢復。                            |
| `GET`              | `/api/v1/community/notifications`                       | Required | 列出或統計通知。                  |
| `PUT`              | `/api/v1/community/notifications/{notificationId}/read` | Required | 將一條通知標為已讀。              |
| `PUT`              | `/api/v1/community/notifications/read-all`              | Required | 將所有可見通知標為已讀。          |
| `GET`              | `/api/v1/community/tags`                                | Optional | 列出帶有可見帖子計數的標籤。      |
| `GET`              | `/api/v1/community/tags/preferences`                    | Required | 列出標籤偏好設定。                |
| `PUT`              | `/api/v1/community/tags/{tag}/preference`               | Required | 設定 `follow`、`mute` 或 `null`。 |
| `PUT`              | `/api/v1/community/users/{uid}/{follow\|block\|mute}`   | Required | 設定使用者關係。                    |
| `PUT`              | `/api/v1/community/posts/{postId}/feedback`             | Required | 設定發現反饋。                    |
| `DELETE`           | `/api/v1/community/me/post-feedback`                    | Required | 清除發現反饋。                    |
| `POST`             | `/api/v1/community/reports`                             | Required | 舉報帖子、評論或使用者。            |
| `PATCH` / `DELETE` | `/api/v1/community/comments/{commentId}`                | Author   | 編輯或刪除評論。                  |
| `PUT`              | `/api/v1/community/comments/{commentId}/reaction`       | Required | 切換評論點贊。                    |
| `GET`              | `/api/v1/community/me/comments`                         | Required | 列出已登入使用者的評論。            |

請求和回應欄位詳情請參閱[帖子](./posts/)、[資料](./profiles/)和[上傳](./uploads/)。

## 帖子結構

帖子回應包含規範的社群 DTO 欄位：

```json
{
  "id": "post-uuid-from-the-service",
  "title": "A post title",
  "body": "Post body",
  "visibility": "public",
  "moderationStatus": "allow",
  "state": "active",
  "version": 1,
  "createdAt": 1730000000000,
  "updatedAt": 1730000000000,
  "lastEditedAt": 1730000000000,
  "commentCount": 0,
  "likeCount": 0,
  "pinnedAt": null,
  "archivedAt": null,
  "commentsLockedAt": null,
  "authorUid": 1001,
  "authorName": "Example user",
  "authorImage": null,
  "avatarSeed": "opaque-avatar-seed",
  "device": null,
  "ipLocation": null,
  "tags": [],
  "attachments": []
}
```

示例中的 ID 和 avatar seed 是回應欄位的說明，不是客戶端應自行構造的值。
帖子詳情 envelope 會在 `viewer` 下單獨攜帶與檢視者相關的標記；列表項會在列表回應中攜帶各自的 viewer 標記。

## 稽核狀態

使用者建立的文字會在釋出前接受檢查。回應可能是 `201` 或帶有 `moderationQueued` 的 `202`，帖子或評論在稽核完成前可能保持 `pending`。客戶端應顯示返回的物件及其狀態，不要假定每次成功寫入都會立即可搜尋。
