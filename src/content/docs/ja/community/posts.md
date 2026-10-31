---
title: 投稿、コメント、フィード
description: コミュニティのコンテンツとやり取りのエンドポイントを使います。
---

## 投稿を一覧する

```http
GET /api/v1/community/posts?limit=20&scope=latest
```

対応するクエリパラメーター:

| パラメーター | 値 | 備考 |
| --- | --- | --- |
| `limit` | `1`〜`50` | 既定は `20`。 |
| `cursor` | 不透明な値 | 返されたものをそのまま送り返す。 |
| `scope` | `all`、`latest`、`recommended`、`following`、`mine`、`bookmarked` | 最後の 3 つはセッションが必要。 |
| `state` | `active`、`archived`、`all` | アーカイブは `scope=mine` のときだけ使える。 |
| `q` | 1〜100 文字 | タイトルと本文を検索する。 |
| `tag` | 正規化したタグ | 表示可能な投稿をタグで絞り込む。 |
| `seed` | `0`〜`2147483647` | おすすめのシード。おすすめのカーソルを続けるときは必須。 |
| `refresh` | `1` | 新しいおすすめフィードを始める。`cursor` とは併用できない。 |

レスポンス:

```json
{ "posts": [], "nextCursor": null }
```

`scope=recommended` では `seed` も返ることがあります。返されたカーソルと一緒にそのシードを保持してください。カーソルは不透明で、リリース間で形式が変わることがあります。

## 投稿を読む

```http
GET /api/v1/community/posts/{postId}
GET /api/v1/community/posts/{postId}?commentsOnly=true
GET /api/v1/community/posts/{postId}?includeComments=false
```

既定では、レスポンスに `post`、`comments`、`commentsNextCursor`、`commentsSort`、`viewer` が含まれます。コメントは既定で `hot`、`commentsSort=latest` のときは `latest` の順です。続きは `commentsCursor` で取得します。`commentId` を指定すると、表示可能なコメントをレスポンスに含めて強調できます。

## 作成と編集

投稿を作成します:

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

`title` を省略すると先頭行から作られます。`body` は必須で 20,000 文字までです。`visibility` は `public`、`protected`、`private` のいずれかです。タグは正規化され 10 個までです。1 つの投稿に含められる添付 ID は重複なしで 16 個までで、各添付は準備済みかつ許可済みである必要があります。新しい投稿は投稿者ごとに 1 時間 30 件、1 日 200 件までです。

楽観的な同時実行制御で投稿を編集します:

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

投稿を編集するたびに `body` と現在の `version` を送ってください。`title`、`visibility`、`tags`、任意の `editReason` も送れます。投稿の編集では添付は変わりません。添付には添付のリンク用ルートを使います。古い version は `409 version_conflict` を返します。

削除:

```http
DELETE /api/v1/community/posts/{postId}
Content-Type: application/json

{ "version": 2 }
```

削除に成功すると `204` です。

## コメントとリアクション

```http
POST /api/v1/community/posts/{postId}/comments
Content-Type: application/json

{ "body": "A reply", "parentId": "parent-comment-id-from-the-post" }
```

`parentId` は任意で、同じ投稿のコメントを指す必要があります。コメントの本文は 5,000 文字までで、投稿者ごとに 1 時間 300 件、1 日 2,000 件までです。

投稿やコメントのリアクションを切り替えます:

```http
PUT /api/v1/community/posts/{postId}/reaction
{ "active": true }

PUT /api/v1/community/comments/{commentId}/reaction
{ "active": false }
```

投稿のリアクションのレスポンスは `{ "active": true, "likeCount": 3 }`、ブックマークは `{ "active": true }`、コメントのリアクションは更新後の `likeCount` を含みます。

固定、アーカイブ、復元には現在の投稿の version が必要です:

```http
PUT /api/v1/community/posts/{postId}/pin
{ "active": true, "version": 2 }

POST /api/v1/community/posts/{postId}/archive
{ "version": 3 }
```

いずれも更新後の投稿を `{ "post": ... }` で返します。

## フィードへのフィードバックと通報

```http
PUT /api/v1/community/posts/{postId}/feedback
{ "feedback": "not_interested", "reasonCode": "too_repetitive" }

DELETE /api/v1/community/me/post-feedback
```

フィードバックは `not_interested`、`hide`、`null` のいずれかです。値を設定するとき `reasonCode` は任意で、消去するときは省略か null にする必要があります。

通報を作成します:

```http
POST /api/v1/community/reports
{
  "targetKind": "post",
  "targetId": "post-id-from-the-service",
  "reasonCode": "spam",
  "details": "Optional detail"
}
```

`targetKind` は `post`、`comment`、`user` のいずれかです。通報理由は `spam`、`harassment`、`hate`、`sexual`、`violence`、`privacy`、`copyright`、`misinformation`、`other` で、`other` には `details` が必須です。
