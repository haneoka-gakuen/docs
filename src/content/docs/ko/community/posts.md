---
title: 게시물, 댓글, 피드
description: 커뮤니티 콘텐츠와 상호작용 엔드포인트를 사용합니다.
---

## 게시물 목록

```http
GET /api/v1/community/posts?limit=20&scope=latest
```

지원하는 쿼리 매개변수:

| 매개변수 | 값 | 비고 |
| --- | --- | --- |
| `limit` | `1`~`50` | 기본값 `20`. |
| `cursor` | 불투명한 값 | 반환된 그대로 다시 보낸다. |
| `scope` | `all`, `latest`, `recommended`, `following`, `mine`, `bookmarked` | 마지막 세 개는 세션이 필요하다. |
| `state` | `active`, `archived`, `all` | 보관 상태는 `scope=mine`에서만 쓸 수 있다. |
| `q` | 1~100자 | 제목과 본문을 검색한다. |
| `tag` | 정규화된 태그 | 보이는 게시물을 태그로 거른다. |
| `seed` | `0`~`2147483647` | 추천 시드. 추천 커서를 이어 갈 때 필수. |
| `refresh` | `1` | 새 추천 피드를 시작한다. `cursor`와 함께 쓸 수 없다. |

응답:

```json
{ "posts": [], "nextCursor": null }
```

`scope=recommended`는 `seed`도 반환할 수 있습니다. 반환된 커서와 함께 그 시드를 보관하세요. 커서는 불투명하며 릴리스마다 형식이 바뀔 수 있습니다.

## 게시물 읽기

```http
GET /api/v1/community/posts/{postId}
GET /api/v1/community/posts/{postId}?commentsOnly=true
GET /api/v1/community/posts/{postId}?includeComments=false
```

기본적으로 응답에는 `post`, `comments`, `commentsNextCursor`, `commentsSort`, `viewer`가 들어 있습니다. 댓글은 기본으로 `hot` 순이고 `commentsSort=latest`이면 `latest` 순입니다. 이어서 보려면 `commentsCursor`를 쓰세요. `commentId`를 주면 보이는 댓글 하나를 응답에 담아 강조합니다.

## 작성과 수정

게시물 작성:

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

`title`을 생략하면 첫 줄에서 만들어집니다. `body`는 필수이며 20,000자까지입니다. `visibility`는 `public`, `protected`, `private` 중 하나입니다. 태그는 정규화되며 최대 10개입니다. 게시물 하나에 중복 없는 첨부 ID를 16개까지 넣을 수 있으며, 각 첨부는 준비되고 허용된 상태여야 합니다. 새 게시물은 작성자당 시간당 30개, 하루 200개까지입니다.

낙관적 동시성 제어로 게시물 수정:

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

게시물을 수정할 때마다 `body`와 현재 `version`을 보내세요. `title`, `visibility`, `tags`, 선택 항목 `editReason`도 보낼 수 있습니다. 게시물 수정으로는 첨부가 바뀌지 않으니 첨부 연결 라우트를 쓰세요. 오래된 version은 `409 version_conflict`를 반환합니다.

삭제:

```http
DELETE /api/v1/community/posts/{postId}
Content-Type: application/json

{ "version": 2 }
```

삭제에 성공하면 `204`입니다.

## 댓글과 반응

```http
POST /api/v1/community/posts/{postId}/comments
Content-Type: application/json

{ "body": "A reply", "parentId": "parent-comment-id-from-the-post" }
```

`parentId`는 선택이며 같은 게시물의 댓글을 가리켜야 합니다. 댓글 본문은 5,000자까지이며, 작성자당 시간당 300개, 하루 2,000개까지입니다.

게시물이나 댓글 반응 전환:

```http
PUT /api/v1/community/posts/{postId}/reaction
{ "active": true }

PUT /api/v1/community/comments/{commentId}/reaction
{ "active": false }
```

게시물 반응 응답은 `{ "active": true, "likeCount": 3 }`, 북마크 응답은 `{ "active": true }`, 댓글 반응 응답은 갱신된 `likeCount`를 포함합니다.

고정, 보관, 복원에는 현재 게시물 version이 필요합니다:

```http
PUT /api/v1/community/posts/{postId}/pin
{ "active": true, "version": 2 }

POST /api/v1/community/posts/{postId}/archive
{ "version": 3 }
```

모두 갱신된 게시물을 `{ "post": ... }`로 반환합니다.

## 피드 피드백과 신고

```http
PUT /api/v1/community/posts/{postId}/feedback
{ "feedback": "not_interested", "reasonCode": "too_repetitive" }

DELETE /api/v1/community/me/post-feedback
```

피드백은 `not_interested`, `hide`, `null` 중 하나입니다. 값을 설정할 때 `reasonCode`는 선택이고, 지울 때는 생략하거나 null이어야 합니다.

신고 작성:

```http
POST /api/v1/community/reports
{
  "targetKind": "post",
  "targetId": "post-id-from-the-service",
  "reasonCode": "spam",
  "details": "Optional detail"
}
```

`targetKind`는 `post`, `comment`, `user` 중 하나입니다. 신고 사유는 `spam`, `harassment`, `hate`, `sexual`, `violence`, `privacy`, `copyright`, `misinformation`, `other`이며, `other`에는 `details`가 필요합니다.
