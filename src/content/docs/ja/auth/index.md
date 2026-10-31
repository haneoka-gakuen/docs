---
title: 認証
description: 秘密情報を漏らさずに、アカウント登録と Better Auth のセッションのエンドポイントを使います。
---

認証は `https://haneoka.org/api/auth` にあります。Worker は下記の対応する Better Auth のルートに処理を渡し、`/api/v1/account/register` に Haneoka 独自のメール登録の流れを加えています。

## 利用可否を確認する

```http
GET /api/v1/account/config
```

例:

```json
{
  "available": true,
  "emailDeliveryEnabled": true,
  "emailSignUpEnabled": true,
  "providers": ["github", "google"],
  "turnstileSiteKey": "public-site-key-or-null"
}
```

`providers` は設定済みのソーシャルプロバイダー ID の一覧です。シークレット、クライアントシークレット、認証キー、Turnstile のシークレットキーがこのレスポンスに含まれることはありません。

## メールで登録する

```http
POST /api/v1/account/register
Content-Type: application/json
X-Captcha-Response: <turnstile-token-when-enabled>

{ "email": "person@example.test" }
```

このルートは同一オリジン専用で、メールアドレスのフィールドだけを受け付けます。成功すると `202` を返します。

```json
{ "accepted": true }
```

既存のアドレスでも新しいアドレスでも同じレスポンスです。Turnstile が有効な場合は、ブラウザーのチャレンジトークンを `X-Captcha-Response` で送ってください。サイトキーは設定のエンドポイントから得られます。

## セッションとメール・パスワードのルート

`/api/auth` の下で次のルートに対応しています。

| メソッド | パス | 認証 | 用途 |
| --- | --- | --- | --- |
| `GET`, `HEAD` | `/api/auth/get-session` | 匿名 | 現在のセッションを読む。Cookie がなければ匿名の正常な結果。 |
| `POST` | `/api/auth/sign-in/email` | 匿名 | メールアドレスとパスワードでログインする。 |
| `POST` | `/api/auth/sign-in/social` | 匿名 | 設定済みのソーシャルログインを始める。 |
| `POST` | `/api/auth/sign-out` | Cookie | 現在のセッションを終える。 |
| `POST` | `/api/auth/send-verification-email` | Cookie | メール配信が有効なとき、確認メールを要求する。 |
| `GET` | `/api/auth/verify-email` | トークン | メール確認のリンクを使う。 |
| `POST` | `/api/auth/request-password-reset` | 匿名 | 再設定メールを要求する。 |
| `POST` | `/api/auth/reset-password` | トークン | 本文またはクエリの再設定トークンで新しいパスワードを設定する。 |
| `GET` | `/api/auth/reset-password/{token}` | トークン | パスワード再設定の続きのリンクを開く。セッションの Cookie は不要。 |
| `POST` | `/api/auth/change-email` | Cookie | メールアドレスの変更を要求する。 |
| `POST` | `/api/auth/change-password` | Cookie | 現在のパスワードを変更する。 |
| `GET` | `/api/auth/list-accounts` | Cookie | 連携済みのアカウントを一覧する。 |
| `POST` | `/api/auth/link-social` | Cookie | 設定済みのソーシャルアカウントを連携する。 |
| `POST` | `/api/auth/unlink-account` | Cookie | アカウントのポリシーに従って連携を解除する。 |
| `GET` | `/api/auth/list-sessions` | Cookie | 有効なセッションを一覧する。 |
| `POST` | `/api/auth/revoke-session` | Cookie | セッションを 1 つ無効にする。 |
| `POST` | `/api/auth/revoke-sessions` | Cookie | Better Auth のペイロードに従い、選んだ、またはすべてのセッションを無効にする。 |
| `POST` | `/api/auth/revoke-other-sessions` | Cookie | 現在以外のセッションを無効にする。 |
| `GET`, `POST` | `/api/auth/callback/{provider}` | OAuth | 設定済みプロバイダーのコールバックを完了する。 |
| `GET` | `/api/auth/error` | 匿名 | 認証エラーのレスポンスを表示する。 |
| `GET` | `/api/auth/ok` | 匿名 | Better Auth の稼働確認レスポンス。 |

プロバイダーのコールバックは、`discord`、`github`、`google`、`twitter` のうち設定済みのものだけを受け付けます。`providers` にないプロバイダーは、現在のデプロイでは対応するルートではありません。

## ブラウザーでの使い方

アカウントを変更するときは `credentials: "include"` を使い、同一オリジンで送ってください。

```ts
const response = await fetch("/api/auth/get-session", {
  credentials: "include",
  headers: { Accept: "application/json" },
});
```

認証のレスポンスは `Cache-Control: no-store` です。セッションの JSON をキャッシュしたり、Cookie をログにコピーしたり、クライアントシークレットをフロントエンドのコードに置いたりしないでください。

## エラーと利用できない機能

Worker にデータベースや 32 文字の認証シークレットがない場合、認証のルートは `503 auth_not_configured` を返します。メールだけを使うルートは、配信が設定されていなければ `503` を返します。登録は、不正なメールアドレスや本文に `400`、クロスオリジンや検証の失敗に `403`、大きすぎる本文に `413`、JSON でない本文に `415`、レート制限時には `Retry-After: 60` 付きの `429` を返すことがあります。

Better Auth では、プロバイダー固有のリクエスト・レスポンスのフィールドが変わることがあります。選んだ操作には Better Auth のルートで文書化されたペイロードを使い、追加のレスポンスフィールドは任意として扱ってください。Haneoka の Worker の契約が保証するのは、上記のルートが利用できることと、Cookie と同一オリジンの挙動です。
