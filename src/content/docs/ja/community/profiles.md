---
title: プロフィール、関係、設定
description: 公開プロフィールを読み、ログイン中のアカウントのプロフィールを管理します。
---

## 公開プロフィール

```http
GET /api/v1/community/users/{uid}?limit=24
```

`uid` は、ほかのプロフィールや投稿者情報のレスポンスで返される公開の数値 UID です。レスポンスには次が含まれます。

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

公開投稿はカーソルでページ分割されます（`limit` の既定は 24、上限は 50）。どちらかがブロックしている場合、閲覧者には空の投稿・作品・アカウントのプロジェクションが返ります。ゲームアカウントの項目は、アカウントの所有者が選んだ公開スナップショットです。

## ログイン中のプロフィール

```http
GET /api/v1/account/profile
PATCH /api/v1/account/profile
DELETE /api/v1/account/profile
```

GET のレスポンスは `{ "profile": ... }` で、アカウント名、公開 UID、ハンドル、自己紹介、表示名のモデレーション状態、アバターの項目、ロール、プロフィールの状態、単調増加する `version` を含みます。

変更する項目だけを送ります:

```json
{
  "displayName": "New display name",
  "handle": "new-handle",
  "bio": "Short biography",
  "version": 4
}
```

`displayName` は表示される文字で 1〜80 文字、`handle` は小文字、数字、アンダースコア、ハイフンで 3〜32 文字（数字のみは不可）、`bio` は 500 文字までです。`null` を送ると `handle` や `bio` を消去します。表示名はモデレーションされ、保留状態の `202` が返ることがあります。古い version を送ると `409 profile_conflict`、使用中のハンドルは `409 handle_unavailable` を返します。

削除にはメール確認済みのセッションと次が必要です:

```json
{ "confirmation": "the-current-account-email" }
```

削除に成功すると `204` を返し、Cookie を消去します。最後の有効な管理者は、管理者権限を移すまでアカウントを削除できません。

## 関係

```http
PUT /api/v1/community/users/{uid}/follow
PUT /api/v1/community/users/{uid}/block
PUT /api/v1/community/users/{uid}/mute
```

いずれも `{ "active": true }` か `{ "active": false }` を受け取り、関係の状態を返します。`uid` は公開 UID で、非公開のユーザー ID ではありません。ブロックは表示と操作に影響するため、変更後は公開プロフィールを読み直してください。

## 設定

```http
GET /api/v1/me/preferences
PUT /api/v1/me/preferences
```

新しいアカウントでは `{ "preferences": null }` を、そうでなければ次を返します:

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

PUT は省略したキーを保存済みの値とマージし、明示的な `null` は項目を消去します。対応ロケールは `ja`、`en`、`zh-TW`、`zh-CN`、`ko` で、設定は 16 KiB までです。

## アバター

ログイン中のアバターを設定・消去します:

```http
PUT /api/v1/account/avatar
Content-Type: image/webp

<binary image>

DELETE /api/v1/account/avatar
```

2 MiB までの JPEG、PNG、WebP 画像を受け付けます。最大辺は 4096、画素数は 1600 万までです。PUT に成功すると、モデレーション中は `202 { "avatar": { "status": "pending" } }` を返します。

準備ができたアバターを読みます:

```http
GET /api/v1/account/avatar/{userId}
```

`userId` のパスセグメントは、プロフィールのアバター URL が使う不透明なアカウント識別子です。存在しない、または承認されていないアバターは `404 avatar_not_found` を返します。
