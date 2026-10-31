---
title: 共通スキーマ
description: API 全体で使う安定したレスポンスのエンベロープと識別子の規則。
---

## 現在のリソースのレスポンス

直接のリソースルートは、`?server=<slug>` がなければ現在の `intl` カタログを使います。コレクションの索引は通常エンティティ ID をキーにしたオブジェクトで、値はリソースが定める DTO の形を保ちます。リソースは形の異なる索引、エンティティ、ビュー、リレーションを公開できます。カタログのページに実際の楽曲のレスポンスと、利用側が使うフィールドの意味があります。

## エラー

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Human-readable diagnostic",
    "requestId": "optional-request-correlation-id"
  }
}
```

分岐に使う値は `code` です。`message` はわかりやすさのために変わることがあります。`requestId` は任意で、あればサポートへの報告に含めてください。

## リリースの識別子（上級者向け）

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "server-slug-from-registry",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

表示している値はフィールドの役割を説明するものです。以降のリクエストにはサービスが返した ID を使ってください。

## カタログマニフェスト

```json
{
  "schema": "haneoka-catalog-storage-v2",
  "server": "server-slug",
  "sourceId": "source-snapshot-id",
  "summary": "api/v1/catalog/summary.json",
  "partition": { "algorithm": "fnv1a32-mod-256", "shards": 256 },
  "resources": {
    "songs": {
      "count": 85,
      "dependencies": ["bands", "items", "song-meta", "videos"],
      "entities": {
        "algorithm": "fnv1a32-mod-256",
        "count": 85,
        "prefix": "api/v1/catalog/songs/entities/",
        "shards": ["01", "06", "09"]
      },
      "index": "api/v1/catalog/songs/index.json",
      "kind": "collection",
      "relations": {},
      "views": {}
    }
  }
}
```

各リソースのメタデータオブジェクトは `kind`、`count`、`dependencies`、`index`、任意の `entities`、`relations`、`views` を宣言します。エンティティとリレーションのストレージ記述子には、FNV-1a のシャード方式、シャード数、プレフィックス、シャード名が含まれます。リレーションのメタデータは `entityCount` と `valueMode`（`ids` か `records`）を、ビューのメタデータは独自のエンティティストア、`path`、`shape`（`array` か `object`）を宣言します。マニフェストは、どのカタログルートが存在するかを決める中心的な DTO です。例ではシャードの一覧を省略しているので、サービスが返す完全な一覧を使ってください。

## カタログのバッチ

```json
{
  "items": { "entity-key-from-index": {} },
  "missing": ["entity-key-not-present"]
}
```

`items` の値はリソースが定めるエンティティの形を保ち、API は共通の `id` や `title` フィールドを加えません。どちらのマップもサービスが返す ID を使います。見つからないキーは `missing` に入ります。

## コミュニティのページ分割

コミュニティの一覧レスポンスは `nextCursor: string | null` を使います。`nextCursor` が `null` ならページは終わりです。各カーソルは変更せずに送り返してください。

## タイムスタンプとメディア

コミュニティのタイムスタンプは Unix エポックからのミリ秒です。カタログやプロバイダーのタイムスタンプは元の DTO の契約に従い、数値の場合もプロバイダーの地域別の値の場合もあります。メディアのフィールドには、準備済みかつ許可済みのオブジェクトがある場合に `mediaType`、`size`、`width`、`height`、URL が含まれます。`null` の値は保持してください。元データが現在その値を提供していないことを示します。
