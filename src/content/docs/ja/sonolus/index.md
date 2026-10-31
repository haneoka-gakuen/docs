---
title: Sonolus API
description: Sonolus で Haneoka を開き、譜面、プレイリスト、表示用リソースを取得します。
---

Sonolus のサーバーアドレスに **`https://haneoka.org`** を追加するか、[アプリで Haneoka を開きます](https://open.sonolus.com/haneoka.org)。アプリはプロトコルのエンドポイントを要求するときに `/sonolus` を付けます。各項目の `source` はこの同じサーバーアドレスを示します。

公開サービスは Our Notes の譜面、ガルパの譜面、楽曲プレイリスト、ノーツスキン、背景、サウンドパック、ネイティブのパーティクルエフェクト、プレイエンジンを提供します。リクエストは `GET` か `HEAD` で、JSON のレスポンスには `Sonolus-Version` が付きます。

## サーバー情報

```http
GET /sonolus/info
```

レスポンスにはサーバーのタイトル、トップのセクション、設定、バナーが含まれます。リソースのバイト列は、返された URL から取得してください。

## 譜面

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

一覧は 1 ページ 20 件で、ページ 0 から始まります。レベル名はサービス、ゲームサーバー、楽曲、難易度を表します。

```text
haneoka-jp-100109-expert
haneoka-intl-100109-expert
haneoka-gbp-1234-expert
```

一覧が返した名前をそのまま使ってください。元のゲームデータが更新されても名前は変わりません。アプリは識別子を表示するときに自動で `#` を付けますが、API の名前自体にハッシュ記号は付きません。返された名前を URL のパスセグメントとしてエンコードしてください。

```http
GET /sonolus/levels/haneoka-jp-100109-expert
```

レベルにはエンジン、表示の選択、ジャケット、音声、譜面データが含まれます。`data` オブジェクトは、圧縮済み譜面バイト列の URL と 40 文字の SHA-1 ハッシュを示します。その URL を直接取得してください。ハッシュは不変のコンテンツを識別します。

`/sonolus/levels/info` か `/sonolus/levels/list` に `?type=random` を付けると、ランダムな譜面を返します。

## 楽曲プレイリスト

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

プレイリストは 1 曲の難易度をまとめたもので、完全なレベル項目を含みます。`haneoka-jp-100109` や `haneoka-gbp-1234` のような名前は出典を保持します。プレイリスト名もレベル名と同じようにエンコードしてください。

## 表示用リソース

```http
GET /sonolus/skins/list
GET /sonolus/backgrounds/list
GET /sonolus/effects/list
GET /sonolus/particles/list
GET /sonolus/engines/list
```

各一覧は利用可能な項目とそのリソース記述子を返します。スキンとパーティクルのサムネイルは、実際の表示アセットのプレビューです。テクスチャ、音声、エンジンデータは返された SRL の URL からダウンロードしてください。

## クライアントの言語

表示項目には Sonolus 1.1.3 以降の `##LOCALIZE` テキスト関数が含まれることがあります。

```text
##LOCALIZE:{"en":"Song","ja":"曲","zhs":"歌曲","zht":"歌曲","ko":"노래"}
```

Sonolus アプリは、保存したコレクション項目も含め、現在の言語を選んで表示します。翻訳がない場合はオブジェクトの最初の言語を使います。これらの項目を表示するツールは、`##LOCALIZE:` の後ろの JSON を解析し、一致する言語を選び、同じフォールバックを適用してください。Sonolus は簡体字中国語に `zhs`、繁体字中国語に `zht` を使います。

`localization` でサーバーのラベルに使う優先フォールバックを指定できます。項目名、`source`、リソースの URL、ハッシュは元の値のままです。

## ガルパのカタログ

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

provider クエリでガルパのカタログを選びます。返される名前は `haneoka-gbp-` で始まります。別の画面で楽曲やキャラクターのレコードが必要な場合は [GBP データ API](../providers/bestdori/) を使ってください。

## レスポンスの状態

未知の名前は `{ "message": "Not found" }` 付きの `404` を返します。カタログの一時的な失敗は `{ "message": "Service unavailable" }` 付きの `503` を返します。これらの公開読み取りにアカウントのセッションは不要ですが、`Sonolus-Session` はプロトコルヘッダーとして受け付けます。
