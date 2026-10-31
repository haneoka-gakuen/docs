---
title: コミュニティのアップロード
description: コミュニティのメディアを予約、アップロード、完了、確認し、投稿に添付します。
---

アップロードには認証と同一オリジンが必要で、モデレーションの対象になります。新しい投稿のアップロードは JPEG、PNG、WebP、GIF、HEIC、HEIF、MP4、MOV、WebM に対応します。以前のテキスト添付は引き続き読めますが、新しいテキストの予約は受け付けません。

## 制限を確認する

```http
GET /api/v1/community/uploads/policy
```

レスポンスには現在の `limits` オブジェクトが含まれ、マルチパートのパートサイズ、ファイルサイズ、投稿あたりの添付数の上限が入っています。現在のデプロイではこれを正としてください。

現在の公開ポリシーは `partBytes: 8388608`、`fileBytes: 134217728`、`attachmentsPerPost: 16`、`videoSeconds: 600` です。デプロイで値が変わった場合はポリシーのレスポンスに従ってください。

## アップロードの予約を作る

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

`Idempotency-Key` は 16〜128 文字の安全な文字列です。同じメタデータで再利用すると既存の添付が返り、メタデータを変えると `409 idempotency_conflict` が返ります。レスポンスは `201` で、添付の記述子を返します。

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

上の URL のプレースホルダーは、返された添付 ID で置き換えるためのものです。そのまま送らないでください。

## バイト列をアップロードする

1 パートの予約の場合:

```http
PUT /api/v1/community/uploads/{attachmentId}/content
Content-Type: application/octet-stream
Content-Length: 123456

<exact bytes>
```

マルチパートの場合:

```http
PUT /api/v1/community/uploads/{attachmentId}/parts/{partNumber}
Content-Type: application/octet-stream
Content-Length: <planned-part-size>

<exact part bytes>
```

サーバーは予定された正確なコンテンツ長を検証します。パートのレスポンスには `{ "part": { "partNumber", "byteSize", "etag" }, "attachment": ... }` が含まれます。

マルチパートのアップロードを完了します:

```http
POST /api/v1/community/uploads/{attachmentId}/complete
Content-Type: application/json

{
  "parts": [
    { "partNumber": 1, "etag": "etag-returned-by-the-part-upload" }
  ]
}
```

`parts` フィールドを省略できるのは、サービスがすでに順序どおりの完全なパート一覧を持っている場合だけです。完了処理はオブジェクトのサイズとファイルコンテナを検証し、`status: scanning` 付きの `202` を返します。メディア処理はモデレーションのあとにバリアントを公開します。

完了していないマルチパートのアップロードを取り消します:

```http
DELETE /api/v1/community/uploads/{attachmentId}/multipart
```

## 確認と添付

```http
GET /api/v1/community/attachments/{attachmentId}
DELETE /api/v1/community/attachments/{attachmentId}
POST /api/v1/community/posts/{postId}/attachments
{ "attachmentIds": ["attachment-id-from-the-service"] }
DELETE /api/v1/community/posts/{postId}/attachments/{attachmentId}
```

投稿の添付を確認、削除、リンクできるのは所有者だけです。リンクには `status=ready` と `moderationStatus=allow` が必要で、1 つの投稿にはポリシーの上限（現在は 16）まで添付できます。準備ができたコンテンツは、示された `downloadUrl` か添付のコンテンツルートからダウンロードします。

## 処理の状態

`reserved` はバイト列のアップロード中、`scanning` は検証・モデレーション中です。`ready` と `allow` でコンテンツが利用可能になり、`review`、`rejected`、`deleted` は添付できません。レスポンスが `202` の間は、間隔を空けながらメタデータのエンドポイントを確認し続けてください。
