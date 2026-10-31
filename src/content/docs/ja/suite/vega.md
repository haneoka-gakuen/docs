---
title: Vega
description: Web とネイティブアプリでビジュアルノベルを再生します。エンジン、プラグイン、ページへのプレーヤーの置き方。
---

Vega は haneoka.org のストーリープレーヤーを支えるビジュアルノベルエンジンです。ストーリー（台詞、キャラクター、背景、カメラ、サウンド、選択肢、チャットのコマンドの並び）を読み、何が話され、誰がステージにいて、何が再生されるかという状態に変えます。見えるものと聞こえるものはすべてプラグインが担うため、同じエンジンで、3D のステージと Live2D キャラクターを備えたフル構成も、スマートフォン向けの軽い 2D ステージも、WebGL をまったく使わない素の DOM 表示も動かせます。

## プレーヤーの構成

| 部分 | 公式プラグイン | ない場合 |
| --- | --- | --- |
| レンダラー | [Three.js](https://github.com/haneoka-gakuen/vega-renderer-three)、[Pixi](https://github.com/haneoka-gakuen/vega-renderer-pixi) | 背景、スチル、立ち絵を表示する DOM のシーン。 |
| ストーリー UI | [Portable UI](https://github.com/haneoka-gakuen/vega-ui-portable) | 自分で用意する `dialogue` UI スロット。 |
| シェル | [標準シェル](https://github.com/haneoka-gakuen/vega-shell-default): タイトル、セーブ、設定、バックログ、ギャラリー、フローチャート | ストーリーがすぐに始まる。 |
| テーマ | [Haneoka](https://github.com/haneoka-gakuen/vega-theme-haneoka)、Portable、WebGAL | スタイルのない UI。 |
| キャラクター | [Cubism（Live2D）](https://github.com/haneoka-gakuen/vega-plugin-cubism)、[Spine](https://github.com/haneoka-gakuen/vega-plugin-spine)、[合成モデル](https://github.com/haneoka-gakuen/vega-plugin-composite) | 静止画のみ。 |
| テキスト | [リッチテキスト](https://github.com/haneoka-gakuen/vega-plugin-richtext)と Markdown、BBCode、HTML、LaTeX、Typst | プレーンテキスト。 |
| その他 | [エンディング画面](https://github.com/haneoka-gakuen/vega-plugin-ending)、[WebGAL 互換](https://github.com/haneoka-gakuen/vega-plugin-webgal)、[Haneoka ホスト](https://github.com/haneoka-gakuen/vega-plugin-haneoka) | |

[Vega Full Preset](https://github.com/haneoka-gakuen/vega-preset-full) を使うと、妥当な一式を 1 回の呼び出しで組み立てられます。

## ページにプレーヤーを置く

```sh
pnpm add @haneoka/vega @haneoka/vega-preset-full three@0.184
```

```ts
import { VegaEngine } from "@haneoka/vega/engine";
import createVegaFullPreset from "@haneoka/vega-preset-full";

const engine = new VegaEngine({ officialPlugins: createVegaFullPreset() });

const player = await engine.createPlayer({
  mount: document.querySelector("#story")!,
  story: await (await fetch("/stories/episode-1.json")).json(),
});

await player.player.play();
```

`createPlayer` は必要ならエンジンを起動し、要素の下にプレーヤーを置き、ストーリーが使うリソースをすべて読み込んでハンドルを返します。`player.player` から `play()`、`pause()`、`resume()`、`requestNext()`、`choose(key)`、`seekTo(index)` を呼び、リアクティブな `state`（現在の行、バックログ、ストーリーが終わったか）を読めます。ハンドルはエンジンより先に破棄してください。エンジンを破棄するとそのプレーヤーも破棄されます。

何もインストールせずに haneoka.org のストーリーを埋め込むには、代わりに [Vega の埋め込み](/ja/embed/vega/)を使います。

## ストーリー

ストーリーは `commands` 配列を持つ JSON です。各コマンドは数値の `command` コードとそのフィールドを持ちます。

```json
{
  "commands": [
    { "command": 25, "background": { "url": "/bg/rooftop.png" }, "duration": 0.5 },
    { "command": 0, "targetName": "anon", "characterModel": { "runtime": { "imageUrl": "/figure/anon.png" } } },
    { "command": 2, "targetName": "anon", "text": "Let's go!" }
  ]
}
```

ここで `25` は Stage（背景の設定）、`0` はキャラクターの登場、`2` は台詞 1 行です。

コマンドの種類はゲームと同じです。台詞と話者、モーションと表情を伴うキャラクターの登場・退場、背景とスチル、カメラのパン・チルト・ズーム・揺れ、被写界深度、BGM、効果音とボイス、フェード、フラッシュ、トランジション、チャット画面のシーン、字幕付きムービー、選択肢、ジャンプ、コマンドグループがあります。コードは `@haneoka/vega-protocol`（`VEGA_ADV_OPCODE`）にあります。実際に手で書くことはほとんどなく、Altair がフォームで編集し、その取り込み機能が WebGAL、Bestdori、文章から生成します。

テキストはゲームのマークアップ（ルビ、色、サイズ）に対応し、形式プラグインを入れれば Markdown なども使えます。テキストのフィールドには複数の言語を入れられ、プレーヤーは読み手の言語を表示します。

## リソース

リソースはストーリー内の URL です。HTTP(S)、`data:`、`blob:` の URL はそのまま読み込みます。アーカイブ、アプリ独自のプロトコル、CDN の対応付けには、スキームと `load` 関数を持つリソースプラグインを加えます。許可された範囲から出ようとする URL（`..`、空、または安全でないパス）は読み込み前に拒否されます。

ストーリーを始める前に、Vega は必要なリソースをすべて列挙して読み込みます。各 Live2D モデルが実際に使うモーションも含むため、再生の途中でダウンロード待ちが起きません。

## プラグイン

```ts
const engine = new VegaEngine({
  officialPlugins: [threeRenderer, portableUi],
  plugins: [myAnalyticsPlugin],
});
```

`officialPlugins` は配布物の一部として信頼され、`plugins` はサードパーティー扱いでサードパーティーの権限を受けます。プラグインはレンダラー、UI スロット、テーマ、キャラクターのプロバイダー、コマンド、リソース、ストレージ、入力を提供し、プラグインを外すかエンジンを破棄すると登録はすべて取り消されます。初期化に失敗したプラグインは完全に巻き戻されます。

プロジェクトは必要なプラグインを記録し、[マーケットプレイスのカタログ](https://github.com/haneoka-gakuen/vega-marketplace)が公式プラグインとその権限、依存関係を一覧します。

## セーブ、設定、入力

標準シェルは、Vega のストレージポートを通してセーブ、設定、バックログを提供します。既定ではブラウザーに保存します。ホストプラグインを使えば別の場所に保存でき、[Haneoka ホストプラグイン](https://github.com/haneoka-gakuen/vega-plugin-haneoka)はストレージと入力を、アプリ側で実装する小さなブリッジ経由で扱います。

## 配布

プロジェクトをサイト、PWA、デスクトップアプリ、モバイルプロジェクトにするには [Deneb](/ja/suite/deneb/) を使います。

## リファレンス

[Vega リポジトリ](https://github.com/haneoka-gakuen/vega)の README がエンジン API を、各プラグインの README がそのオプションのすべてを説明しています。
