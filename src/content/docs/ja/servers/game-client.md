---
title: ゲームクライアント API
description: クライアント連携を作るときに、ゲームクライアントのマニフェストと公開ファイルを読みます。
---

これはクライアントのビルドツール向けの上級者向け契約です。カタログを使うだけなら、リソース DTO が返す `file`、`jacketUrl`、`musicUrl` などのパスがあれば十分で、そのパスは[メディアとファイル](/ja/servers/media/)から取得できます。

ゲームクライアント API は、有効なサーバーリリースのファイルを公開します。まずマニフェストを読み、次にマニフェストまたは Addressables 索引に載っているファイル名を要求します。

## マニフェスト

```http
GET /game-client/{server}/manifest.json
HEAD /game-client/{server}/manifest.json
```

安定したエンベロープには次が含まれます。

```json
{
  "schema": "haneoka-game-client-v1",
  "server": "jp-cbt",
  "sourceId": "garupa-jp-2026-09",
  "master": { "systemVersion": "example-system-version" },
  "addressables": {
    "platform": "Android",
    "catalogFile": "catalog.json",
    "catalogHashFile": "catalog.hash",
    "embeddedCatalogFile": "catalog.embedded.json",
    "index": {
      "algorithm": "fnv1a32-mod-256",
      "shards": 256,
      "prefix": "addressables/index/"
    }
  }
}
```

サーバーは `X-Haneoka-Release-Id` と `X-Haneoka-Source-Id` を返します。マニフェストは現在のポインターに従い、有効期間は短めです。

## マスターファイル

```http
GET /game-client/{server}/master/MasterDataSystemVersion.txt
GET /game-client/{server}/master/{filename}
HEAD /game-client/{server}/master/{filename}
```

バージョンファイルはテキストです。そのほかの対応するマスターファイルは `Master*.bin` というファイル名の規則に従い、バイナリで返されます。ファイル名はリリースマニフェストか、文書化されたクライアント契約から取得してください。

## Addressables

```http
GET /game-client/{server}/asset/{platform}/{filename}
HEAD /game-client/{server}/asset/{platform}/{filename}
```

プラットフォームはマニフェストの `addressables.platform` と一致する必要があります。サーバーは 256 分割のリリース索引シャードを解決し、内容アドレス方式のオブジェクトを返します。カタログファイルは現在のリリースのオブジェクトです。Unity バンドルとカタログのペイロードは、索引上の役割が許す場合は不変のコンテンツとしてキャッシュされます。

Addressables のレスポンスはバイナリで、リリースヘッダーを含みます。プラットフォーム、ファイル名、索引エントリーのいずれかが見つからない場合は `404`、索引とオブジェクトの整合性に失敗した場合は `502` を返します。
ゲームクライアントのファイルレスポンスは `ETag` を返し、単一のバイト範囲を受け付けます。満たせる範囲には `206`、無効な範囲には `Content-Range: bytes */<size>` 付きの `416` を返します。

## 実際の手順

1. `manifest.json` を取得します。
2. `platform` とカタログのファイル名を確認します。
3. `/asset/{platform}/{filename}` でカタログファイルとハッシュファイルを取得します。
4. クライアントカタログまたは公開索引から追加のファイル名を解決します。
5. レスポンスヘッダーに従ってキャッシュし、ローカル索引と一緒にリリース ID を保持します。
