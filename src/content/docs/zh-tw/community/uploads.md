---
title: 社群上傳
description: 預留、上傳、完成、檢查並關聯社群媒體。
---

上傳需要身份驗證、同源請求，並受稽核流程控制。新帖子上傳支援 JPEG、PNG、WebP、GIF、HEIC、HEIF、MP4、MOV 和 WebM。歷史文字附件仍可讀取，但不再接受新的文字 intent。

## 檢視限制

```http
GET /api/v1/community/uploads/policy
```

回應包含當前 `limits` 物件，其中包括 multipart 分片大小、檔案大小以及每篇帖子可關聯的附件上限。請將其視為當前部署的權威值。

當前公開策略報告 `partBytes: 8388608`、`fileBytes: 134217728`、`attachmentsPerPost: 16` 和 `videoSeconds: 600`。如果部署改變這些值，請使用策略回應中的值。

## 建立上傳 intent

```http
POST /api/v1/community/uploads/intents
Idempotency-Key: upload-intent-20260930-unique
Content-Type: application/json

{
  "fileName": "cover.webp",
  "mediaType": "image/webp",
  "size": 123456
}
```

`Idempotency-Key` 是 16–128 個安全字元。使用相同 metadata 重用該鍵時返回已有附件；修改 metadata 時返回 `409 idempotency_conflict`。回應為 `201` 幷包含附件描述符：

```json
{
  "attachment": {
    "id": "attachment-id-from-the-service",
    "fileName": "cover.webp",
    "mediaType": "image/webp",
    "size": 123456,
    "status": "reserved",
    "moderationStatus": "pending",
    "uploadUrl": "/api/v1/community/uploads/{attachmentId}/content",
    "multipart": {
      "partSize": 8388608,
      "partCount": 1,
      "partUploadUrl": "/api/v1/community/uploads/{attachmentId}/parts/{partNumber}",
      "completeUrl": "/api/v1/community/uploads/{attachmentId}/complete",
      "cancelUrl": "/api/v1/community/uploads/{attachmentId}/multipart"
    },
    "downloadUrl": null,
    "failureCode": null,
    "expiresAt": 1730000000000
  }
}
```

上面 URL 中的佔位符需要替換為返回的附件 ID；不要原樣傳送。

## 上傳位元組

對於單分片 intent：

```http
PUT /api/v1/community/uploads/{attachmentId}/content
Content-Type: application/octet-stream
Content-Length: 123456

<exact bytes>
```

對於 multipart：

```http
PUT /api/v1/community/uploads/{attachmentId}/parts/{partNumber}
Content-Type: application/octet-stream
Content-Length: <planned-part-size>

<exact part bytes>
```

伺服器會校驗計劃中的準確 content length。分片回應包含 `{ "part": { "partNumber", "byteSize", "etag" }, "attachment": ... }`。

完成 multipart 上傳：

```http
POST /api/v1/community/uploads/{attachmentId}/complete
Content-Type: application/json

{
  "parts": [
    { "partNumber": 1, "etag": "etag-returned-by-the-part-upload" }
  ]
}
```

只有當服務已經擁有完整且有序的分片列表時，`parts` 欄位才可以省略。完成操作會校驗物件大小和檔案容器，然後返回帶有 `status: scanning` 的 `202`。媒體處理會在稽核後釋出變體。

取消未完成的 multipart 上傳：

```http
DELETE /api/v1/community/uploads/{attachmentId}/multipart
```

## 檢查並關聯

```http
GET /api/v1/community/attachments/{attachmentId}
DELETE /api/v1/community/attachments/{attachmentId}
POST /api/v1/community/posts/{postId}/attachments
{ "attachmentIds": ["attachment-id-from-the-service"] }
DELETE /api/v1/community/posts/{postId}/attachments/{attachmentId}
```

只有所有者可以檢查、刪除或關聯帖子附件。關聯要求 `status=ready` 且 `moderationStatus=allow`；一篇帖子最多包含策略規定的數量（當前為 16 個）。就緒內容透過公開的 `downloadUrl` 或附件內容路由下載。

## 處理狀態

`reserved` 表示位元組仍在上傳；`scanning` 表示驗證/稽核正在執行；`ready` 和 `allow` 使內容可用；`review`、`rejected` 和 `deleted` 的內容不能關聯。當回應為 `202` 時，請使用退避策略繼續輪詢 metadata 介面。
