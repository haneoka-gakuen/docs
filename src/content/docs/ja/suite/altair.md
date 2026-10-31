---
title: Altair
description: Vega のライブプレビュー、フローチャート、WebGAL・Bestdori・文章の取り込みを備え、ビジュアルノベルを書き、翻訳し、演出します。
---

Altair はスイートのエディターです。プロジェクトのシーン、言語、アセット、キャラクター、プラグインを 1 つのワークスペースで開きます。スクリプト表示とコマンドごとのフォーム、アセットブラウザー、ストーリー全体のフローチャート、そしてカーソルに追従する [Vega](/ja/suite/vega/) のライブプレビューがあります。編集しているのは、Vega が再生し [Deneb](/ja/suite/deneb/) が出力するのと同じデータです。

## プロジェクトを始める

始め方は 3 つあります。

- **フォルダーを開く。** Chromium 系のブラウザーでは、Altair はディスク上のフォルダーを直接扱い、シーンとアセットを読み込み、編集を同じファイルに保存します。ほかのブラウザーではファイルを読み取り専用で開き、変更は書き出します。
- **取り込む。** WebGAL のプロジェクトフォルダーと WebGAL Craft のプロジェクト、Bestdori のシナリオ、ADV JSON、普通の文章を Altair のプロジェクトにできます。変更していない WebGAL のシーンは 1 バイトも変えずに書き戻します。
- **サンプルから始める。** [First Light](https://github.com/haneoka-gakuen/vega-example-first-light) は、開いて書き換えるために作った短いストーリーです。

## 書く

どのコマンドにも型付きのフィールドを持つフォームがあります。話者、各言語の本文、キャラクターのモーションと表情、アセットブラウザーから選ぶ背景、イージング付きのカメラ移動などです。スクリプト表示は各コマンドを 1 行に要約し、いつでもソースのテキストに切り替えられます。

プロジェクトには言語をいくつでも設定でき、それぞれにフォントを指定できます。テキストのフィールドはすべての言語を保持し、プレビューは選んだ言語で再生します。

[Altair Prose](https://github.com/haneoka-gakuen/altair-plugin-prose) は、貼り付けた章を下書きのシーンに変えます。話者の行やかぎ括弧の台詞は台詞に、それ以外は地の文になり、すべて要確認の印が付きます。

## ストーリーを確かめる

- **プレビュー。** Vega のプレビューは入力に合わせて更新され、カーソル位置のコマンドへ移動し、どこからでも再生でき、ブレークポイントで 1 つずつ進めたり、保存せずにいくつかのコマンドを試したりできます。ステージ上のキャラクターをドラッグすると、その位置がコマンドに書き戻されます。
- **フローチャート。** シーン、選択肢、ジャンプ、呼び出し、エンディングをグラフで表示します。どの経路からも到達しないシーン、存在しないラベルへのジャンプ、重複したラベル、出口のないループも報告します。
- **キャラクター。** [Altair Models](https://github.com/haneoka-gakuen/altair-plugin-models) は Live2D、画像、GIF、動画を重ねたキャラクターを組み立て、ワンクリックでシーンに加えます。

## 安全網

取り消しとやり直しは、プロジェクトと開いているすべてのドキュメントに効きます。保存していない編集はブラウザーに下書きとして残り、再読み込みやクラッシュのあとに戻ります。その間にプロジェクトが変わっていた場合、Altair は何も上書きせず、適用できなくなった下書きを示します。

## ゲームのアセットを使う

ネットワークアダプターを設定すると、アセットブラウザーに次を表示できます。

- Our Notes の背景、スチル、エフェクト、Live2D、BGM、ボイスと、公式ストーリー全体を編集可能なプロジェクトとして収めた [haneoka.org のカタログ](https://github.com/haneoka-gakuen/altair-plugin-haneoka)
- ガルパの [Bestdori](https://github.com/haneoka-gakuen/altair-plugin-bestdori) のアセットツリー

## プラグイン

ここまでの機能はすべてプラグインです。[Altair Full Preset](https://github.com/haneoka-gakuen/altair-preset-full) で公式のセットを入れられます。プロジェクトは使うプラグインを記録し、[マーケットプレイスプラグイン](https://github.com/haneoka-gakuen/altair-plugin-marketplace)がビルド前にバージョン、依存関係、権限を確認してロックファイルを書き出します。サードパーティーのプラグインは [サンドボックス](https://github.com/haneoka-gakuen/altair-plugin-sandbox)で Worker の中に隔離して動かせます。

## Altair を動かす

```sh
git clone https://github.com/haneoka-gakuen/altair.git
cd altair
pnpm install --frozen-lockfile
pnpm dev
```

同じ部品で独自のエディターを作るには、`@haneoka/altair` と使いたいプラグインをインストールし、`AltairPluginHost` を作ってプラグインを登録します。方法は各プラグインの README にあります。
