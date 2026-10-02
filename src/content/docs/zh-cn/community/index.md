---
title: 社区 API
description: 读取和写入帖子、评论、反应、关注、标签、通知和偏好设置。
---

社区 JSON 位于 `/api/v1/community` 下。请求的内容为公开内容时，公开读取不需要会话。变更操作要求 Better Auth 会话、已验证邮箱、活动社区资料，以及同源请求。

## 浏览器请求来源

这些公开 GET 可以由服务端读取，也可以在 Haneoka 本站网页中读取。当前社区响应没有提供外站浏览器需要的 CORS 许可；从另一个网站直接 fetch 这些接口会被浏览器阻止。登录、私人数据与变更操作按下文同源会话要求处理。

## 路由概览

| Method             | Path                                                    | Auth     | Purpose                           |
| ------------------ | ------------------------------------------------------- | -------- | --------------------------------- |
| `GET`              | `/api/v1/community/posts`                               | Optional | 动态、搜索、标签和游标分页。      |
| `POST`             | `/api/v1/community/posts`                               | Required | 创建帖子。                        |
| `GET`              | `/api/v1/community/posts/{postId}`                      | Optional | 读取帖子和评论。                  |
| `PATCH` / `DELETE` | `/api/v1/community/posts/{postId}`                      | Author   | 编辑或删除帖子。                  |
| `POST`             | `/api/v1/community/posts/{postId}/comments`             | Required | 创建评论或回复。                  |
| `PUT`              | `/api/v1/community/posts/{postId}/reaction`             | Required | 切换点赞。                        |
| `PUT`              | `/api/v1/community/posts/{postId}/bookmark`             | Required | 切换书签。                        |
| `PUT`              | `/api/v1/community/posts/{postId}/pin`                  | Author   | 置顶或取消置顶。                  |
| `POST`             | `/api/v1/community/posts/{postId}/archive`              | Author   | 归档。                            |
| `POST`             | `/api/v1/community/posts/{postId}/restore`              | Author   | 恢复。                            |
| `GET`              | `/api/v1/community/notifications`                       | Required | 列出或统计通知。                  |
| `PUT`              | `/api/v1/community/notifications/{notificationId}/read` | Required | 将一条通知标为已读。              |
| `PUT`              | `/api/v1/community/notifications/read-all`              | Required | 将所有可见通知标为已读。          |
| `GET`              | `/api/v1/community/tags`                                | Optional | 列出带有可见帖子计数的标签。      |
| `GET`              | `/api/v1/community/tags/preferences`                    | Required | 列出标签偏好设置。                |
| `PUT`              | `/api/v1/community/tags/{tag}/preference`               | Required | 设置 `follow`、`mute` 或 `null`。 |
| `PUT`              | `/api/v1/community/users/{uid}/{follow\|block\|mute}`   | Required | 设置用户关系。                    |
| `PUT`              | `/api/v1/community/posts/{postId}/feedback`             | Required | 设置发现反馈。                    |
| `DELETE`           | `/api/v1/community/me/post-feedback`                    | Required | 清除发现反馈。                    |
| `POST`             | `/api/v1/community/reports`                             | Required | 举报帖子、评论或用户。            |
| `PATCH` / `DELETE` | `/api/v1/community/comments/{commentId}`                | Author   | 编辑或删除评论。                  |
| `PUT`              | `/api/v1/community/comments/{commentId}/reaction`       | Required | 切换评论点赞。                    |
| `GET`              | `/api/v1/community/me/comments`                         | Required | 列出已登录用户的评论。            |

请求和响应字段详情请参阅[帖子](./posts/)、[资料](./profiles/)和[上传](./uploads/)。

## 帖子结构

帖子响应包含规范的社区 DTO 字段：

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

示例中的 ID 和 avatar seed 是响应字段的说明，不是客户端应自行构造的值。
帖子详情 envelope 会在 `viewer` 下单独携带与查看者相关的标记；列表项会在列表响应中携带各自的 viewer 标记。

## 审核状态

用户创建的文本会在发布前接受检查。响应可能是 `201` 或带有 `moderationQueued` 的 `202`，帖子或评论在审核完成前可能保持 `pending`。客户端应显示返回的对象及其状态，不要假定每次成功写入都会立即可搜索。
