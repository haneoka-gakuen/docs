---
title: 프로필, 관계, 환경설정
description: 공개 프로필을 읽고 로그인한 계정의 프로필을 관리합니다.
---

## 공개 프로필

```http
GET /api/v1/community/users/{uid}?limit=24
```

`uid`는 다른 프로필이나 작성자 정보 응답에서 반환되는 공개 숫자 UID입니다. 응답에는 다음이 포함됩니다.

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

공개 게시물은 커서로 페이지가 나뉩니다(`limit` 기본값 24, 상한 50). 어느 한쪽이 차단한 경우 보는 사람에게는 빈 게시물·작품·계정 프로젝션이 반환됩니다. 게임 계정 항목은 계정 소유자가 고른 공개 스냅숏입니다.

## 로그인한 프로필

```http
GET /api/v1/account/profile
PATCH /api/v1/account/profile
DELETE /api/v1/account/profile
```

GET 응답은 `{ "profile": ... }`이며 계정 이름, 공개 UID, 핸들, 소개, 표시 이름 모더레이션 상태, 아바타 항목, 역할, 프로필 상태, 단조 증가하는 `version`을 포함합니다.

바꿀 항목만 보냅니다:

```json
{
  "displayName": "New display name",
  "handle": "new-handle",
  "bio": "Short biography",
  "version": 4
}
```

`displayName`은 보이는 글자로 1~80자, `handle`은 소문자, 숫자, 밑줄, 하이픈으로 3~32자(숫자만은 불가), `bio`는 최대 500자입니다. `null`을 보내면 `handle`이나 `bio`를 지웁니다. 표시 이름은 모더레이션되며 보류 상태와 함께 `202`가 반환될 수 있습니다. 오래된 version은 `409 profile_conflict`, 사용 중인 핸들은 `409 handle_unavailable`을 반환합니다.

삭제에는 이메일 인증된 세션과 다음이 필요합니다:

```json
{ "confirmation": "the-current-account-email" }
```

삭제에 성공하면 `204`를 반환하고 쿠키를 지웁니다. 마지막 활성 관리자는 관리자 권한을 넘기기 전까지 계정을 삭제할 수 없습니다.

## 관계

```http
PUT /api/v1/community/users/{uid}/follow
PUT /api/v1/community/users/{uid}/block
PUT /api/v1/community/users/{uid}/mute
```

모두 `{ "active": true }` 또는 `{ "active": false }`를 받고 관계 상태를 반환합니다. `uid`는 공개 UID이며 비공개 사용자 ID가 아닙니다. 차단은 표시와 상호작용에 영향을 주므로 바꾼 뒤에는 공개 프로필을 다시 읽으세요.

## 환경설정

```http
GET /api/v1/me/preferences
PUT /api/v1/me/preferences
```

새 계정에서는 `{ "preferences": null }`을, 그 밖에는 다음을 반환합니다:

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

PUT은 생략한 키를 저장된 값과 병합하고, 명시적인 `null`은 항목을 지웁니다. 지원 로캘은 `ja`, `en`, `zh-TW`, `zh-CN`, `ko`이며 설정은 16 KiB까지입니다.

## 아바타

로그인한 계정의 아바타 설정·삭제:

```http
PUT /api/v1/account/avatar
Content-Type: image/webp

<binary image>

DELETE /api/v1/account/avatar
```

2 MiB 이하의 JPEG, PNG, WebP 이미지를 받으며, 최대 변 길이는 4096, 화소 수는 1,600만까지입니다. PUT에 성공하면 모더레이션 중에는 `202 { "avatar": { "status": "pending" } }`를 반환합니다.

준비된 아바타 읽기:

```http
GET /api/v1/account/avatar/{userId}
```

`userId` 경로 세그먼트는 프로필 아바타 URL이 쓰는 불투명한 계정 식별자입니다. 없거나 승인되지 않은 아바타는 `404 avatar_not_found`를 반환합니다.
