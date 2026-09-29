---
title: Community uploads
description: Reserve, upload, complete, inspect, and attach community media.
---

Uploads are authenticated, same-origin, and moderation-aware. New post uploads support JPEG, PNG, WebP, GIF, HEIC, HEIF, MP4, MOV, and WebM. Historical text attachments remain readable but new text intents are not accepted.

## Discover limits

```http
GET /api/v1/community/uploads/policy
```

The response contains the current `limits` object, including the multipart part size, file size, and attachment-per-post cap. Treat it as authoritative for the current deployment.

The current public policy reports `partBytes: 8388608`, `fileBytes: 134217728`, `attachmentsPerPost: 16`, and `videoSeconds: 600`. Use the policy response if a deployment changes these values.

## Create an upload intent

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

`Idempotency-Key` is 16–128 safe characters. Reusing it with the same metadata returns the existing attachment; changing metadata returns `409 idempotency_conflict`. The response has `201` and an attachment descriptor:

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

The placeholders in URLs above are substitutions using the returned attachment ID; do not send them literally.

## Upload bytes

For a one-part intent:

```http
PUT /api/v1/community/uploads/{attachmentId}/content
Content-Type: application/octet-stream
Content-Length: 123456

<exact bytes>
```

For multipart:

```http
PUT /api/v1/community/uploads/{attachmentId}/parts/{partNumber}
Content-Type: application/octet-stream
Content-Length: <planned-part-size>

<exact part bytes>
```

The server validates the exact planned content length. A part response includes `{ "part": { "partNumber", "byteSize", "etag" }, "attachment": ... }`.

Complete a multipart upload:

```http
POST /api/v1/community/uploads/{attachmentId}/complete
Content-Type: application/json

{
  "parts": [
    { "partNumber": 1, "etag": "etag-returned-by-the-part-upload" }
  ]
}
```

The `parts` field is optional only when the service already has the complete ordered part list. Completion validates the object size and file container, then returns `202` with `status: scanning`. Media processing publishes variants after moderation.

Cancel an unfinished multipart upload:

```http
DELETE /api/v1/community/uploads/{attachmentId}/multipart
```

## Inspect and attach

```http
GET /api/v1/community/attachments/{attachmentId}
DELETE /api/v1/community/attachments/{attachmentId}
POST /api/v1/community/posts/{postId}/attachments
{ "attachmentIds": ["attachment-id-from-the-service"] }
DELETE /api/v1/community/posts/{postId}/attachments/{attachmentId}
```

Only the owner can inspect, delete, or link a post attachment. A link requires `status=ready` and `moderationStatus=allow`; a post can contain at most the policy limit (currently 16). Ready content is downloaded through the advertised `downloadUrl` or the attachment content route.

## Processing states

`reserved` means bytes are still being uploaded; `scanning` means validation/moderation is running; `ready` and `allow` make content available; `review`, `rejected`, and `deleted` are not attachable. Keep polling the metadata endpoint with backoff when the response is `202`.
