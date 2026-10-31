---
title: Bestdori プロバイダー API
description: Haneoka が変換したガルパのデータとメディアプロキシを利用します。
---

Bestdori のルートは読み取り専用の公開プロジェクションです。`{region}` セグメントは Bestdori プロバイダーのリージョンで、Our Notes のリリースサーバーではありません。対応リージョンは `jp`、`en`、`tw`、`cn`、`kr` です。

## カタログコレクション

```http
GET /api/v1/garupa/bestdori/{region}/bands
GET /api/v1/garupa/bestdori/{region}/songs
GET /api/v1/garupa/bestdori/{region}/song-meta
GET /api/v1/garupa/bestdori/{region}/characters
GET /api/v1/garupa/bestdori/{region}/cards
```

コレクションのレスポンスは、プロバイダーの数値文字列 ID をキーにした JSON オブジェクトです。Haneoka は名前、画像・音声のパス、地域ごとの配信メタデータ、一部のフィールドを、ブラウザーに依存しない DTO に変換します。上流のデータが増えると任意のフィールドが追加されることがあるため、未知のキーは保持してください。

## 個別レコード

```http
GET /api/v1/garupa/bestdori/{region}/songs/{musicId}
GET /api/v1/garupa/bestdori/{region}/song-meta/{musicId}
GET /api/v1/garupa/bestdori/{region}/cards/{cardId}
```

`musicId` と `cardId` は、コレクションのレスポンスから得た 10 進のプロバイダー ID です。これらのルートに Our Notes カタログのエンティティキーを使わないでください。

## ストーリーとエディター用アセット

```http
GET /api/v1/garupa/bestdori/{region}/stories/event
GET /api/v1/garupa/bestdori/{region}/stories/band
GET /api/v1/garupa/bestdori/{region}/stories/main
GET /api/v1/garupa/bestdori/{region}/stories/afterlive
GET /api/v1/garupa/bestdori/{region}/stories/{storyId}
GET /api/v1/garupa/bestdori/{region}/editor-assets
GET /api/v1/garupa/bestdori/{region}/editor-assets/{bundlePath}
```

コレクションのルートは JSON プロジェクションを返します。`editor-assets` のルートは統合したリソースツリーを、バンドルのパスはプロバイダーのファイル一覧を返します。`storyId` はコレクションが返す正規のストーリーファイル名（ID）で、1 つのセグメントとして URL エンコードします。

## 譜面とメディア

```http
GET /api/v1/garupa/bestdori/{region}/charts/{musicId}/{difficulty}
GET /api/v1/garupa/bestdori/{region}/media/jacket/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/jacket-thumb/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/sound/{soundId}
GET /api/v1/garupa/bestdori/{region}/media/mv/{filename}
GET /api/v1/garupa/bestdori/{region}/media/stage-challenge/{assetId}
```

譜面の難易度は `easy`、`normal`、`hard`、`expert`、`special` のいずれかです。譜面のレスポンスは `text/plain` で、`meta` と `score` を持つ JSON として直列化された SS ドキュメントを含みます。`score` にはイベントとノーツが入ります。これは SS コンバーターへの入力で、`mountChart` は変換後の `ChartEmbedDocument` を受け取ります。再生前にテキストを読んで変換してください。メディアのルートは、上流が返す場合は範囲ヘッダーと検証ヘッダーをそのまま渡します。

```js
const response = await fetch("https://haneoka.org/api/v1/garupa/bestdori/jp/charts/1/expert");
if (!response.ok) throw new Error(`Chart HTTP ${response.status}`);
const scoreText = await response.text();
const ssDocument = JSON.parse(scoreText);
console.log(ssDocument.meta.version, ssDocument.score.events);
```

## プロバイダーの生アセット

```http
GET /api/v1/garupa/bestdori/{region}/raw/{providerPath}
```

安全なプロバイダーパスだけを受け付けます。パスの遡り、エンコードされた NUL、`{region}` と一致しないアセットリージョンは拒否されます。変換済みのルートがあればそちらを使い、生のパスは正規化 DTO のないプロバイダーファイルに使ってください。

## Live2D の検索

```http
GET /api/v1/garupa/bestdori/{region}/live2d?id={id}&id={id}&server={region}
```

ID は重複が除かれ、最大 64 件までです。空のリクエストは `{ "items": {}, "missing": [] }` を返し、空でないリクエストは解決したエントリーと見つからなかった一覧を返します。`server` を指定すると、ソース検索に使うプロバイダーリージョンを選べます。

プロバイダーの失敗は `502` と `{ "error": { "code": "bestdori_upstream", "message": "..." } }` で返ります。未知のプロバイダーリージョンは `404 region_not_found` を返します。
