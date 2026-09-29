---
title: Posts, comments, and feed
description: Use the community content and interaction endpoints.
---

## List posts

```http
GET /api/v1/community/posts?limit=20&scope=latest
```

Supported query parameters:

| Parameter | Values                                                            | Notes                                                               |
| --------- | ----------------------------------------------------------------- | ------------------------------------------------------------------- |
| `limit`   | `1`–`50`                                                          | Defaults to `20`.                                                   |
| `cursor`  | opaque                                                            | Send back exactly as returned.                                      |
| `scope`   | `all`, `latest`, `recommended`, `following`, `mine`, `bookmarked` | The last three require a session.                                   |
| `state`   | `active`, `archived`, `all`                                       | Archived state is only available with `scope=mine`.                 |
| `q`       | 1–100 characters                                                  | Searches title and body.                                            |
| `tag`     | normalized tag                                                    | Filters visible posts by tag.                                       |
| `seed`    | `0`–`2147483647`                                                  | Recommendation seed; required when continuing a recommended cursor. |
| `refresh` | `1`                                                               | Starts a fresh recommended feed; cannot be combined with `cursor`.  |

Response:

```json
{ "posts": [], "nextCursor": null }
```

`scope=recommended` can also return `seed`. Keep that seed with the returned cursor. A cursor is opaque and may change format between releases.

## Read a post

```http
GET /api/v1/community/posts/{postId}
GET /api/v1/community/posts/{postId}?commentsOnly=true
GET /api/v1/community/posts/{postId}?includeComments=false
```

By default, the response contains `post`, `comments`, `commentsNextCursor`, `commentsSort`, and `viewer`. Comments are sorted by `hot` by default or `latest` when `commentsSort=latest`; use `commentsCursor` to continue. `commentId` can focus a visible comment into the response.

## Create and edit

Create a post:

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

`title` defaults to a derived first line. `body` is required and is limited to 20,000 characters. `visibility` is `public`, `protected`, or `private`; tags are normalized and capped at 10; a post can include at most 16 unique attachment IDs, and each attachment must already be ready and allowed. New posts are rate-limited to 30 per hour and 200 per day per author.

Edit a post with optimistic concurrency:

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

Send `body` and the current `version` on every post edit. You can also send `title`, `visibility`, `tags`, and optional `editReason`. Post edits do not change attachments; use the attachment link route for that. A stale version returns `409 version_conflict`.

Delete:

```http
DELETE /api/v1/community/posts/{postId}
Content-Type: application/json

{ "version": 2 }
```

Successful deletion is `204`.

## Comments and reactions

```http
POST /api/v1/community/posts/{postId}/comments
Content-Type: application/json

{ "body": "A reply", "parentId": "parent-comment-id-from-the-post" }
```

`parentId` is optional and must identify a comment on the same post. Comment bodies are limited to 5,000 characters; comment quotas are 300 per hour and 2,000 per day per author.

Toggle post or comment reactions:

```http
PUT /api/v1/community/posts/{postId}/reaction
{ "active": true }

PUT /api/v1/community/comments/{commentId}/reaction
{ "active": false }
```

Post reaction responses include `{ "active": true, "likeCount": 3 }`; bookmark responses include `{ "active": true }`; comment reaction responses include the updated `likeCount`.

Pin, archive, and restore require the current post version:

```http
PUT /api/v1/community/posts/{postId}/pin
{ "active": true, "version": 2 }

POST /api/v1/community/posts/{postId}/archive
{ "version": 3 }
```

These return `{ "post": ... }` with the updated post.

## Feed feedback and reports

```http
PUT /api/v1/community/posts/{postId}/feedback
{ "feedback": "not_interested", "reasonCode": "too_repetitive" }

DELETE /api/v1/community/me/post-feedback
```

Feedback is `not_interested`, `hide`, or `null`; `reasonCode` is optional when setting a value and must be absent/null when clearing it.

Create a report:

```http
POST /api/v1/community/reports
{
  "targetKind": "post",
  "targetId": "post-id-from-the-service",
  "reasonCode": "spam",
  "details": "Optional detail"
}
```

`targetKind` is `post`, `comment`, or `user`. Report reasons are `spam`, `harassment`, `hate`, `sexual`, `violence`, `privacy`, `copyright`, `misinformation`, or `other`; `details` is required for `other`.
