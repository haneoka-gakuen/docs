---
title: 커뮤니티 API
description: 게시물, 댓글, 반응, 팔로우, 태그, 알림, 환경설정을 읽고 씁니다.
---

커뮤니티 JSON은 `/api/v1/community` 아래에 있습니다. 공개 콘텐츠를 읽을 때는 세션이 필요 없습니다. 변경에는 Better Auth 세션, 인증된 이메일, 활성 커뮤니티 프로필, 같은 출처의 요청이 필요합니다.

## 브라우저 요청 출처

공개 GET 응답은 서버에서도, Haneoka의 페이지에서도 읽을 수 있습니다. 현재 커뮤니티 응답은 다른 사이트의 브라우저에 CORS 허가를 주지 않으므로 교차 출처에서 직접 fetch하면 차단됩니다. 세션, 비공개 데이터, 변경은 아래의 같은 출처 요건을 따릅니다.

## 라우트 목록

| 메서드 | 경로 | 인증 | 용도 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/community/posts` | 선택 | 피드, 검색, 태그, 커서 페이지 나누기. |
| `POST` | `/api/v1/community/posts` | 필수 | 게시물을 작성한다. |
| `GET` | `/api/v1/community/posts/{postId}` | 선택 | 게시물과 댓글을 읽는다. |
| `PATCH` / `DELETE` | `/api/v1/community/posts/{postId}` | 작성자 | 게시물을 수정하거나 삭제한다. |
| `POST` | `/api/v1/community/posts/{postId}/comments` | 필수 | 댓글이나 답글을 작성한다. |
| `PUT` | `/api/v1/community/posts/{postId}/reaction` | 필수 | 좋아요를 전환한다. |
| `PUT` | `/api/v1/community/posts/{postId}/bookmark` | 필수 | 북마크를 전환한다. |
| `PUT` | `/api/v1/community/posts/{postId}/pin` | 작성자 | 고정하거나 고정 해제한다. |
| `POST` | `/api/v1/community/posts/{postId}/archive` | 작성자 | 보관한다. |
| `POST` | `/api/v1/community/posts/{postId}/restore` | 작성자 | 복원한다. |
| `GET` | `/api/v1/community/notifications` | 필수 | 알림을 나열하거나 개수를 센다. |
| `PUT` | `/api/v1/community/notifications/{notificationId}/read` | 필수 | 알림 하나를 읽음으로 표시한다. |
| `PUT` | `/api/v1/community/notifications/read-all` | 필수 | 보이는 알림을 모두 읽음으로 표시한다. |
| `GET` | `/api/v1/community/tags` | 선택 | 보이는 게시물 수와 함께 태그를 나열한다. |
| `GET` | `/api/v1/community/tags/preferences` | 필수 | 태그 설정을 나열한다. |
| `PUT` | `/api/v1/community/tags/{tag}/preference` | 필수 | `follow`, `mute`, `null`을 설정한다. |
| `PUT` | `/api/v1/community/users/{uid}/{follow\|block\|mute}` | 필수 | 사용자 관계를 설정한다. |
| `PUT` | `/api/v1/community/posts/{postId}/feedback` | 필수 | 추천 피드백을 설정한다. |
| `DELETE` | `/api/v1/community/me/post-feedback` | 필수 | 추천 피드백을 지운다. |
| `POST` | `/api/v1/community/reports` | 필수 | 게시물, 댓글, 사용자를 신고한다. |
| `PATCH` / `DELETE` | `/api/v1/community/comments/{commentId}` | 작성자 | 댓글을 수정하거나 삭제한다. |
| `PUT` | `/api/v1/community/comments/{commentId}/reaction` | 필수 | 댓글 좋아요를 전환한다. |
| `GET` | `/api/v1/community/me/comments` | 필수 | 로그인한 사용자의 댓글을 나열한다. |

요청과 응답 필드의 자세한 내용은 [게시물](./posts/), [프로필](./profiles/), [업로드](./uploads/)를 참고하세요.

## 게시물 형태

게시물 응답에는 정식 커뮤니티 DTO 필드가 들어 있습니다.

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

이 예의 ID와 아바타 시드는 응답 필드를 가리키는 라벨이며 클라이언트가 만들어 내는 값이 아닙니다.
게시물 상세 엔벌로프는 보는 사람별 플래그를 `viewer`에 따로 담고, 목록 항목은 목록 응답 안에 각자의 플래그를 담습니다.

## 모더레이션 상태

사용자가 쓴 글은 공개 전에 검사됩니다. 응답은 `201`이거나 `moderationQueued`가 붙은 `202`입니다. 게시물이나 댓글은 모더레이션이 끝날 때까지 `pending`일 수 있습니다. 쓰기에 성공했다고 바로 검색되는 것은 아니니, 반환된 객체와 그 상태를 표시하세요.
