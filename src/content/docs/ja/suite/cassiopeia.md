---
title: Cassiopeia
description: haneoka.org の譜面プレーヤーを支えるリズムゲームエンジン。カーネル、プラグイン、Vue コンポーネント、Sonolus への変換。
---

Cassiopeia は haneoka.org の譜面プレーヤーと譜面ビューアーを支えるリズムゲームエンジンです。カーネルは譜面を読み、時間を整数ミリ秒で管理し、各タッチがどのノーツに対応するかを決め、判定とスコア計算を行い、フィーバー区間、スキル、コンボをイベントとして通知します。描画も音の再生もせず、それはプラグインが担うため、同じカーネルで Web プレーヤー、譜面の全体表示、Sonolus のレベル、ネイティブアプリを動かせます。

カーネルは TypeScript 版と Rust 版（WebAssembly とネイティブの Android・iOS ホスト向け）があり、同じ入力に対して同じ結果を返します。

## 構成

| パッケージ | 役割 |
| --- | --- |
| [`@haneoka/cassiopeia`](https://github.com/haneoka-gakuen/cassiopeia) | カーネル、プラグインランタイム、WebAssembly とネイティブのバインディング |
| [Our Notes プラグイン](https://github.com/haneoka-gakuen/cassiopeia-plugin-our-notes) | Our Notes の譜面、判定タイミング、スキン、エフェクト |
| [Sekai プラグイン](https://github.com/haneoka-gakuen/cassiopeia-plugin-sekai) | 表示用のプロジェクトセカイ SUS 譜面 |
| [Three.js レンダラー](https://github.com/haneoka-gakuen/cassiopeia-renderer-three) | 3D のステージ、ノーツ、エフェクト、HUD |
| [Web ホスト](https://github.com/haneoka-gakuen/cassiopeia-host-web) | ブラウザーでのオーディオクロック、ノーツ音、ポインター入力 |
| [Vue UI](https://github.com/haneoka-gakuen/cassiopeia-ui-vue) | `ChartPlayer` と `ChartOverview` コンポーネント |
| [Sonolus 変換](https://github.com/haneoka-gakuen/cassiopeia-plugin-sonolus) | 譜面を Sonolus のレベルデータと USC に変換 |

## Vue の譜面プレーヤー

```sh
pnpm add vue @haneoka/cassiopeia @haneoka/cassiopeia-plugin-our-notes \
  @haneoka/cassiopeia-renderer-three @haneoka/cassiopeia-host-web @haneoka/cassiopeia-ui-vue
```

```vue
<ChartPlayer :chart="chart" :assets="assets" audio-url="/songs/101.mp3" mode="watch" @ready="player.play()" ref="player" />
```

`mode="watch"` は自動再生、`mode="play"` はタッチやマウスで実際に遊べます。プレーヤーは判定、コンボ、フィーバーのイベントを発行し、音声ではなく自前のクロックに従わせることもできます。エディターや動画書き出しはこの方法で同期を取ります。`ChartOverview` は譜面全体を縦長の 1 枚のキャンバスに描き、コンボ数、BPM の変化、フィーバー区間、スキルの時間帯を表示します。

何もインストールせずに haneoka.org の譜面を表示するには、[Cassiopeia の埋め込み](/ja/embed/cassiopeia/)を使います。

## カーネルを直接使う

```ts
import { CassiopeiaRuntime, createKernelPlugin, CASSIOPEIA_SESSION } from "@haneoka/cassiopeia/plugin";
import { createOurNotesPlugin, OUR_NOTES_RULES } from "@haneoka/cassiopeia-plugin-our-notes";

const runtime = new CassiopeiaRuntime([createKernelPlugin(), createOurNotesPlugin()]);
const chart = runtime.require(OUR_NOTES_RULES).parse(source);
const session = runtime.require(CASSIOPEIA_SESSION).create(chart, { mode: "play" });

session.on("judgement", (event) => console.log(event));
session.tap(lane, audioTimeMs);
const { score, combo } = session.update(audioTimeMs);
```

セッションは `tap`、`release`、`flick`、`trace` の入力を受け取り、ポインター ID は任意です。`update` はスコア、コンボ、ライフ、フルコンボ状態のスナップショットを返します。独自のゲーム、スコアシミュレーター、譜面分析ツールを作るにはこれで十分です。

## Sonolus

Our Notes の譜面は [Sonolus](https://sonolus.com) アプリで遊べます。変換プラグインが譜面を Sonolus のレベルデータに変換し、[Sonolus エンジン](https://github.com/haneoka-gakuen/sonolus-our-notes)が Our Notes の判定とエフェクトで再生します。haneoka.org は全譜面を載せた [Sonolus サーバー](/ja/sonolus/)を運営しています。

## リファレンス

[Cassiopeia リポジトリ](https://github.com/haneoka-gakuen/cassiopeia)の README がカーネル API、プラグイン、ネイティブバインディングを、各パッケージの README がそれぞれのオプションを説明しています。
