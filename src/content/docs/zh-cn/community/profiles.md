---
title: 资料、关系和偏好设置
description: 读取公开资料并管理已登录账户的资料。
---

## 公开资料

```http
GET /api/v1/community/users/{uid}?limit=24
```

`uid` 是其他资料或已发布内容响应中返回的公开数字 UID。响应包含：

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

公开帖子使用游标分页（`limit` 默认值为 24，最大为 50）。如果查看者屏蔽了任一方，会收到空的帖子/作品/账户投影。游戏账户字段是账户所有者选择公开的快照。

## 已登录资料

```http
GET /api/v1/account/profile
PATCH /api/v1/account/profile
DELETE /api/v1/account/profile
```

GET 响应是 `{ "profile": ... }`，其中包含账户名称、公开 UID、handle、bio、显示名称审核状态、头像字段、角色、资料状态以及单调递增的 `version`。

只提交需要修改的字段：

```json
{
  "displayName": "New display name",
  "handle": "new-handle",
  "bio": "Short biography",
  "version": 4
}
```

`displayName` 为 1–80 个可见字符；`handle` 为 3–32 个小写字母/数字/下划线/连字符，不能只包含数字；`bio` 最多 500 个字符。`null` 会清除 `handle` 或 `bio`。显示名称需要审核，可能返回带 pending 状态的 `202`。版本过旧时返回 `409 profile_conflict`；handle 已被占用时返回 `409 handle_unavailable`。

删除需要已验证邮箱的会话，并发送：

```json
{ "confirmation": "the-current-account-email" }
```

删除成功时返回 `204` 并清除 cookie。最后一个活动管理员在转移管理员权限前不能删除账户。

## 关系

```http
PUT /api/v1/community/users/{uid}/follow
PUT /api/v1/community/users/{uid}/block
PUT /api/v1/community/users/{uid}/mute
```

每个接口接受 `{ "active": true }` 或 `{ "active": false }`，并返回关系状态。`uid` 是公开 UID，不是私有 user ID。屏蔽会影响可见性和互动；修改后客户端应重新读取公开资料。

## 偏好设置

```http
GET /api/v1/me/preferences
PUT /api/v1/me/preferences
```

新账户的响应为 `{ "preferences": null }`，否则为：

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

PUT 会将省略的键与已存储值合并；显式的 `null` 会清除字段。支持的 locale 是 `ja`、`en`、`zh-TW`、`zh-CN` 和 `ko`；settings 最大为 16 KiB。

## 头像

设置或清除已登录用户的头像：

```http
PUT /api/v1/account/avatar
Content-Type: image/webp

<binary image>

DELETE /api/v1/account/avatar
```

接受最大 2 MiB 的 JPEG、PNG 和 WebP 图片，最大尺寸为 4096，最多 16 million 像素。PUT 成功时，在审核运行期间返回 `202 { "avatar": { "status": "pending" } }`。

读取已就绪的头像：

```http
GET /api/v1/account/avatar/{userId}
```

`userId` 路径片段是资料头像 URL 使用的不透明账户标识符。缺失或未批准的头像返回 `404 avatar_not_found`。
