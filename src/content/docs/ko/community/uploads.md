---
title: 커뮤니티 업로드
description: 커뮤니티 미디어를 예약, 업로드, 완료, 확인하고 게시물에 첨부합니다.
---

업로드는 인증과 같은 출처가 필요하며 모더레이션 대상입니다. 새 게시물 업로드는 JPEG, PNG, WebP, GIF, HEIC, HEIF, MP4, MOV, WebM을 지원합니다. 예전 텍스트 첨부는 계속 읽을 수 있지만 새 텍스트 예약은 받지 않습니다.

## 제한 확인

```http
GET /api/v1/community/uploads/policy
```

응답에는 현재 `limits` 객체가 들어 있으며, 멀티파트 파트 크기, 파일 크기, 게시물당 첨부 수 상한이 포함됩니다. 현재 배포에서는 이 값을 기준으로 삼으세요.

현재 공개 정책은 `partBytes: 8388608`, `fileBytes: 134217728`, `attachmentsPerPost: 16`, `videoSeconds: 600`입니다. 배포에서 값이 바뀌면 정책 응답을 따르세요.

## 업로드 예약 만들기

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

`Idempotency-Key`는 16~128자의 안전한 문자열입니다. 같은 메타데이터로 재사용하면 기존 첨부가 반환되고, 메타데이터를 바꾸면 `409 idempotency_conflict`가 반환됩니다. 응답은 `201`이며 첨부 기술자를 반환합니다.

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

위 URL의 자리표시자는 반환된 첨부 ID로 바꿔 넣는 부분입니다. 그대로 보내지 마세요.

## 바이트 업로드

단일 파트 예약의 경우:

```http
PUT /api/v1/community/uploads/{attachmentId}/content
Content-Type: application/octet-stream
Content-Length: 123456

<exact bytes>
```

멀티파트의 경우:

```http
PUT /api/v1/community/uploads/{attachmentId}/parts/{partNumber}
Content-Type: application/octet-stream
Content-Length: <planned-part-size>

<exact part bytes>
```

서버는 계획된 정확한 콘텐츠 길이를 검증합니다. 파트 응답에는 `{ "part": { "partNumber", "byteSize", "etag" }, "attachment": ... }`가 포함됩니다.

멀티파트 업로드 완료:

```http
POST /api/v1/community/uploads/{attachmentId}/complete
Content-Type: application/json

{
  "parts": [
    { "partNumber": 1, "etag": "etag-returned-by-the-part-upload" }
  ]
}
```

`parts` 필드는 서비스가 이미 순서대로 된 전체 파트 목록을 가지고 있을 때만 생략할 수 있습니다. 완료 처리는 객체 크기와 파일 컨테이너를 검증한 뒤 `status: scanning`과 함께 `202`를 반환합니다. 미디어 처리는 모더레이션 후 변형본을 공개합니다.

끝나지 않은 멀티파트 업로드 취소:

```http
DELETE /api/v1/community/uploads/{attachmentId}/multipart
```

## 확인과 첨부

```http
GET /api/v1/community/attachments/{attachmentId}
DELETE /api/v1/community/attachments/{attachmentId}
POST /api/v1/community/posts/{postId}/attachments
{ "attachmentIds": ["attachment-id-from-the-service"] }
DELETE /api/v1/community/posts/{postId}/attachments/{attachmentId}
```

게시물 첨부를 확인, 삭제, 연결할 수 있는 사람은 소유자뿐입니다. 연결하려면 `status=ready`와 `moderationStatus=allow`가 필요하며, 게시물 하나에는 정책 상한(현재 16개)까지 첨부할 수 있습니다. 준비된 콘텐츠는 안내된 `downloadUrl`이나 첨부 콘텐츠 라우트로 내려받습니다.

## 처리 상태

`reserved`는 바이트를 아직 업로드하는 중, `scanning`은 검증·모더레이션 중이라는 뜻입니다. `ready`와 `allow`가 되면 콘텐츠를 쓸 수 있고, `review`, `rejected`, `deleted`는 첨부할 수 없습니다. 응답이 `202`인 동안에는 간격을 늘려 가며 메타데이터 엔드포인트를 계속 확인하세요.
