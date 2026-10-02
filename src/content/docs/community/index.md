---
title: Community API
description: Read and write posts, comments, reactions, follows, tags, notifications, and preferences.
---

Community JSON lives under `/api/v1/community`. Public reads do not require a session when the requested content is public. Mutations require a Better Auth session, a verified email, an active community profile, and a same-origin request.

## Browser request origin

Public GET responses can be read by a server or by a page on Haneoka. Current community responses do not provide CORS permission for browsers on another site, so a direct cross-origin fetch is blocked. Sessions, private data and mutations follow the same-origin requirements below.

## Route map

| Method             | Path                                                    | Auth     | Purpose                                    |
| ------------------ | ------------------------------------------------------- | -------- | ------------------------------------------ |
| `GET`              | `/api/v1/community/posts`                               | Optional | Feed, search, tags, and cursor pagination. |
| `POST`             | `/api/v1/community/posts`                               | Required | Create a post.                             |
| `GET`              | `/api/v1/community/posts/{postId}`                      | Optional | Read a post and comments.                  |
| `PATCH` / `DELETE` | `/api/v1/community/posts/{postId}`                      | Author   | Edit or delete a post.                     |
| `POST`             | `/api/v1/community/posts/{postId}/comments`             | Required | Create a comment or reply.                 |
| `PUT`              | `/api/v1/community/posts/{postId}/reaction`             | Required | Toggle a like.                             |
| `PUT`              | `/api/v1/community/posts/{postId}/bookmark`             | Required | Toggle a bookmark.                         |
| `PUT`              | `/api/v1/community/posts/{postId}/pin`                  | Author   | Pin or unpin.                              |
| `POST`             | `/api/v1/community/posts/{postId}/archive`              | Author   | Archive.                                   |
| `POST`             | `/api/v1/community/posts/{postId}/restore`              | Author   | Restore.                                   |
| `GET`              | `/api/v1/community/notifications`                       | Required | List or count notifications.               |
| `PUT`              | `/api/v1/community/notifications/{notificationId}/read` | Required | Mark one notification read.                |
| `PUT`              | `/api/v1/community/notifications/read-all`              | Required | Mark all visible notifications read.       |
| `GET`              | `/api/v1/community/tags`                                | Optional | List tags with visible post counts.        |
| `GET`              | `/api/v1/community/tags/preferences`                    | Required | List tag preferences.                      |
| `PUT`              | `/api/v1/community/tags/{tag}/preference`               | Required | Set `follow`, `mute`, or `null`.           |
| `PUT`              | `/api/v1/community/users/{uid}/{follow\|block\|mute}`   | Required | Set a user relationship.                   |
| `PUT`              | `/api/v1/community/posts/{postId}/feedback`             | Required | Set discovery feedback.                    |
| `DELETE`           | `/api/v1/community/me/post-feedback`                    | Required | Clear discovery feedback.                  |
| `POST`             | `/api/v1/community/reports`                             | Required | Report a post, comment, or user.           |
| `PATCH` / `DELETE` | `/api/v1/community/comments/{commentId}`                | Author   | Edit or delete a comment.                  |
| `PUT`              | `/api/v1/community/comments/{commentId}/reaction`       | Required | Toggle a comment like.                     |
| `GET`              | `/api/v1/community/me/comments`                         | Required | List the signed-in user's comments.        |

For request and response field details, see [Posts](./posts/), [Profiles](./profiles/), and [Uploads](./uploads/).

## Post shape

Post responses include the canonical community DTO fields:

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

IDs and avatar seeds in this example are labels for response fields, not values clients should construct.
The post detail envelope carries viewer-specific flags separately under `viewer`; list items carry their own viewer flags in the list response.

## Moderation states

User-authored text is inspected before publication. The response can be `201` or `202` with `moderationQueued`; a post or comment may remain `pending` until moderation completes. A client should display the returned object and its state instead of assuming every successful write is immediately searchable.
