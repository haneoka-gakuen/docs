---
title: 帖子、评论和动态
description: 使用社区内容和互动接口。
---

## 列出帖子

```http
GET /api/v1/community/posts?limit=20&scope=latest
```

支持的查询参数：

| Parameter | Values                                                            | Notes                                        |
| --------- | ----------------------------------------------------------------- | -------------------------------------------- |
| `limit`   | `1`–`50`                                                          | 默认值为 `20`。                              |
| `cursor`  | opaque                                                            | 原样发送返回的值。                           |
| `scope`   | `all`, `latest`, `recommended`, `following`, `mine`, `bookmarked` | 最后三项需要会话。                           |
| `state`   | `active`, `archived`, `all`                                       | 只有 `scope=mine` 才能使用 archived 状态。   |
| `q`       | 1–100 characters                                                  | 搜索标题和正文。                             |
| `tag`     | normalized tag                                                    | 按标签筛选可见帖子。                         |
| `seed`    | `0`–`2147483647`                                                  | 推荐种子；继续推荐游标时必需。               |
| `refresh` | `1`                                                               | 开始新的推荐动态；不能与 `cursor` 一起使用。 |

响应：

```json
{ "posts": [], "nextCursor": null }
```

`scope=recommended` 也可能返回 `seed`。请将该 seed 与返回的游标一起保存。游标是不透明的，其格式可能在不同版本间变化。

## 读取帖子

```http
GET /api/v1/community/posts/{postId}
GET /api/v1/community/posts/{postId}?commentsOnly=true
GET /api/v1/community/posts/{postId}?includeComments=false
```

默认情况下，响应包含 `post`、`comments`、`commentsNextCursor`、`commentsSort` 和 `viewer`。评论默认按 `hot` 排序；当 `commentsSort=latest` 时按最新排序；使用 `commentsCursor` 继续读取。`commentId` 可以将可见评论聚焦到响应中。

## 创建和编辑

创建帖子：

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

`title` 默认取派生的首行。`body` 必填，最多 20,000 个字符。`visibility` 可以是 `public`、`protected` 或 `private`；标签会被规范化，最多 10 个；一篇帖子最多包含 16 个不重复的附件 ID，每个附件都必须已就绪并获准。每位作者新建帖子每小时最多 30 篇、每天最多 200 篇。

使用乐观并发编辑帖子：

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

每次编辑帖子都发送 `body` 和当前 `version`。也可以发送 `title`、`visibility`、`tags` 以及可选的 `editReason`。编辑帖子不会改变附件；请使用附件关联路由完成此操作。版本过旧时返回 `409 version_conflict`。

删除：

```http
DELETE /api/v1/community/posts/{postId}
Content-Type: application/json

{ "version": 2 }
```

删除成功时返回 `204`。

## 评论和反应

```http
POST /api/v1/community/posts/{postId}/comments
Content-Type: application/json

{ "body": "A reply", "parentId": "parent-comment-id-from-the-post" }
```

`parentId` 可选，必须标识同一帖子中的评论。评论正文最多 5,000 个字符；每位作者每小时最多 300 条评论、每天最多 2,000 条。

切换帖子或评论反应：

```http
PUT /api/v1/community/posts/{postId}/reaction
{ "active": true }

PUT /api/v1/community/comments/{commentId}/reaction
{ "active": false }
```

帖子反应响应包含 `{ "active": true, "likeCount": 3 }`；书签响应包含 `{ "active": true }`；评论反应响应包含更新后的 `likeCount`。

置顶、归档和恢复要求当前帖子版本：

```http
PUT /api/v1/community/posts/{postId}/pin
{ "active": true, "version": 2 }

POST /api/v1/community/posts/{postId}/archive
{ "version": 3 }
```

这些操作返回带有更新后帖子 `{ "post": ... }` 的响应。

## 动态反馈和举报

```http
PUT /api/v1/community/posts/{postId}/feedback
{ "feedback": "not_interested", "reasonCode": "too_repetitive" }

DELETE /api/v1/community/me/post-feedback
```

反馈可以是 `not_interested`、`hide` 或 `null`；设置值时 `reasonCode` 可选，清除反馈时必须省略或设为 null。

创建举报：

```http
POST /api/v1/community/reports
{
  "targetKind": "post",
  "targetId": "post-id-from-the-service",
  "reasonCode": "spam",
  "details": "Optional detail"
}
```

`targetKind` 可以是 `post`、`comment` 或 `user`。举报原因可以是 `spam`、`harassment`、`hate`、`sexual`、`violence`、`privacy`、`copyright`、`misinformation` 或 `other`；使用 `other` 时必须提供 `details`。
