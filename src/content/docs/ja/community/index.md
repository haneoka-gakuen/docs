---
title: コミュニティ API
description: 投稿、コメント、リアクション、フォロー、タグ、通知、設定を読み書きします。
---

コミュニティの JSON は `/api/v1/community` の下にあります。公開コンテンツの読み取りにセッションは不要です。変更には Better Auth のセッション、確認済みのメールアドレス、有効なコミュニティプロフィール、同一オリジンのリクエストが必要です。

## ブラウザーのリクエスト元

公開の GET レスポンスは、サーバーからでも Haneoka 上のページからでも読めます。現在のコミュニティのレスポンスはほかのサイトのブラウザーに CORS の許可を出さないため、クロスオリジンでの直接の fetch はブロックされます。セッション、非公開データ、変更は下記の同一オリジンの要件に従います。

## ルート一覧

| メソッド | パス | 認証 | 用途 |
| --- | --- | --- | --- |
| `GET` | `/api/v1/community/posts` | 任意 | フィード、検索、タグ、カーソルによるページ分割。 |
| `POST` | `/api/v1/community/posts` | 必須 | 投稿を作成する。 |
| `GET` | `/api/v1/community/posts/{postId}` | 任意 | 投稿とコメントを読む。 |
| `PATCH` / `DELETE` | `/api/v1/community/posts/{postId}` | 投稿者 | 投稿を編集・削除する。 |
| `POST` | `/api/v1/community/posts/{postId}/comments` | 必須 | コメントや返信を作成する。 |
| `PUT` | `/api/v1/community/posts/{postId}/reaction` | 必須 | いいねを切り替える。 |
| `PUT` | `/api/v1/community/posts/{postId}/bookmark` | 必須 | ブックマークを切り替える。 |
| `PUT` | `/api/v1/community/posts/{postId}/pin` | 投稿者 | 固定・固定解除する。 |
| `POST` | `/api/v1/community/posts/{postId}/archive` | 投稿者 | アーカイブする。 |
| `POST` | `/api/v1/community/posts/{postId}/restore` | 投稿者 | 復元する。 |
| `GET` | `/api/v1/community/notifications` | 必須 | 通知を一覧・件数取得する。 |
| `PUT` | `/api/v1/community/notifications/{notificationId}/read` | 必須 | 通知を 1 件既読にする。 |
| `PUT` | `/api/v1/community/notifications/read-all` | 必須 | 表示中の通知をすべて既読にする。 |
| `GET` | `/api/v1/community/tags` | 任意 | 表示可能な投稿数付きでタグを一覧する。 |
| `GET` | `/api/v1/community/tags/preferences` | 必須 | タグの設定を一覧する。 |
| `PUT` | `/api/v1/community/tags/{tag}/preference` | 必須 | `follow`、`mute`、`null` を設定する。 |
| `PUT` | `/api/v1/community/users/{uid}/{follow\|block\|mute}` | 必須 | ユーザーとの関係を設定する。 |
| `PUT` | `/api/v1/community/posts/{postId}/feedback` | 必須 | おすすめへのフィードバックを設定する。 |
| `DELETE` | `/api/v1/community/me/post-feedback` | 必須 | おすすめへのフィードバックを消去する。 |
| `POST` | `/api/v1/community/reports` | 必須 | 投稿、コメント、ユーザーを通報する。 |
| `PATCH` / `DELETE` | `/api/v1/community/comments/{commentId}` | 投稿者 | コメントを編集・削除する。 |
| `PUT` | `/api/v1/community/comments/{commentId}/reaction` | 必須 | コメントのいいねを切り替える。 |
| `GET` | `/api/v1/community/me/comments` | 必須 | ログイン中のユーザーのコメントを一覧する。 |

リクエストとレスポンスの各フィールドは[投稿](./posts/)、[プロフィール](./profiles/)、[アップロード](./uploads/)を参照してください。

## 投稿の形

投稿のレスポンスには、正規のコミュニティ DTO のフィールドが含まれます。

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

この例の ID とアバターのシードはレスポンスのフィールドを示すラベルで、クライアントが組み立てる値ではありません。
投稿詳細のエンベロープは閲覧者ごとのフラグを `viewer` に分けて持ち、一覧の項目は一覧レスポンスの中にそれぞれの閲覧者フラグを持ちます。

## モデレーションの状態

利用者が書いた文章は公開前に確認されます。レスポンスは `201` か、`moderationQueued` 付きの `202` です。投稿やコメントはモデレーションが終わるまで `pending` のままのことがあります。書き込みが成功しても、すぐに検索に出るとは限りません。返されたオブジェクトとその状態を表示してください。
