---
title: OpenAPI リファレンス
description: 機械可読な公開 API の契約をダウンロードして確認します。
---

生成された OpenAPI ドキュメントは [`/openapi.json`](/openapi.json) にあります。本番ビルドのたびに [`scripts/build-openapi.mjs`](https://github.com/haneoka-gakuen/docs/blob/main/scripts/build-openapi.mjs) から生成されます。

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

ドキュメントには現在データの直接エイリアスが含まれます。

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

直接ルートはそれぞれ任意の `server` クエリを持ち、省略すると `intl` を選びます。ドキュメントには、サーバー単位の明示的な形、リリースの固定、メディアとゲームクライアントのファイル、Sonolus、コミュニティ・プロフィール・アップロードの API、アカウント設定、Better Auth のルート、Bestdori のプロジェクションも記載されています。

運営のお知らせは別の `/api/v1/announcements` ルートを使います。現在のサーバーのスナップショットを読み、`release` パラメーターは受け付けません。一覧、詳細、メディア、言語、HTML の描画については[運営のお知らせ](/ja/servers/announcements/)を参照してください。

プロバイダーの形の DTO とカタログの DTO は、選んだリソースがフィールドを決める箇所で `additionalProperties` を使います。安定したエンベロープとフィールドの意味は[カタログデータ](/ja/servers/catalog/)を、エラー、バッチ、タイムスタンプ、メディアの値は[共通スキーマ](/ja/reference/schemas/)を参照してください。
