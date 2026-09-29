---
title: 社区上传
description: 预留、上传、完成、检查并关联社区媒体。
---

上传需要身份验证、同源请求，并受审核流程控制。新帖子上传支持 JPEG、PNG、WebP、GIF、HEIC、HEIF、MP4、MOV 和 WebM。历史文本附件仍可读取，但不再接受新的文本 intent。

## 查看限制

```http
GET /api/v1/community/uploads/policy
```

响应包含当前 `limits` 对象，其中包括 multipart 分片大小、文件大小以及每篇帖子可关联的附件上限。请将其视为当前部署的权威值。

当前公开策略报告 `partBytes: 8388608`、`fileBytes: 134217728`、`attachmentsPerPost: 16` 和 `videoSeconds: 600`。如果部署改变这些值，请使用策略响应中的值。

## 创建上传 intent

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

`Idempotency-Key` 是 16–128 个安全字符。使用相同 metadata 重用该键时返回已有附件；修改 metadata 时返回 `409 idempotency_conflict`。响应为 `201` 并包含附件描述符：

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

上面 URL 中的占位符需要替换为返回的附件 ID；不要原样发送。

## 上传字节

对于单分片 intent：

```http
PUT /api/v1/community/uploads/{attachmentId}/content
Content-Type: application/octet-stream
Content-Length: 123456

<exact bytes>
```

对于 multipart：

```http
PUT /api/v1/community/uploads/{attachmentId}/parts/{partNumber}
Content-Type: application/octet-stream
Content-Length: <planned-part-size>

<exact part bytes>
```

服务器会校验计划中的准确 content length。分片响应包含 `{ "part": { "partNumber", "byteSize", "etag" }, "attachment": ... }`。

完成 multipart 上传：

```http
POST /api/v1/community/uploads/{attachmentId}/complete
Content-Type: application/json

{
  "parts": [
    { "partNumber": 1, "etag": "etag-returned-by-the-part-upload" }
  ]
}
```

只有当服务已经拥有完整且有序的分片列表时，`parts` 字段才可以省略。完成操作会校验对象大小和文件容器，然后返回带有 `status: scanning` 的 `202`。媒体处理会在审核后发布变体。

取消未完成的 multipart 上传：

```http
DELETE /api/v1/community/uploads/{attachmentId}/multipart
```

## 检查并关联

```http
GET /api/v1/community/attachments/{attachmentId}
DELETE /api/v1/community/attachments/{attachmentId}
POST /api/v1/community/posts/{postId}/attachments
{ "attachmentIds": ["attachment-id-from-the-service"] }
DELETE /api/v1/community/posts/{postId}/attachments/{attachmentId}
```

只有所有者可以检查、删除或关联帖子附件。关联要求 `status=ready` 且 `moderationStatus=allow`；一篇帖子最多包含策略规定的数量（当前为 16 个）。就绪内容通过公开的 `downloadUrl` 或附件内容路由下载。

## 处理状态

`reserved` 表示字节仍在上传；`scanning` 表示验证/审核正在运行；`ready` 和 `allow` 使内容可用；`review`、`rejected` 和 `deleted` 的内容不能关联。当响应为 `202` 时，请使用退避策略继续轮询 metadata 接口。
