---
title: JavaScript 埋め込み
description: Vega のストーリー、Cassiopeia の譜面、Home Spot のシーンを自分の Web サイトに置きます。
---

Haneoka の埋め込みは、ページ上の要素の中にマウントされます。Vega はストーリーを、Cassiopeia は譜面を再生し、Home Spot は操作できる Three/Spine のシーンを描画します。これらは `@haneoka/embed-core` を通じて、持ち運べるデータソースとリソースの読み込みを共有します。周りのレイアウト、ボタン、エラーメッセージはアプリケーション側が受け持ちます。

## ホストを選ぶ

| 内容 | エントリー | 入力 | 操作 |
| --- | --- | --- | --- |
| データとリソースの読み込み | `@haneoka/embed-core` | メモリ、HTTP の JSON、ローカルファイル、独自のソース | 読み込み、取り消し、破棄 |
| ストーリー | `@haneoka/embed-vega` | Vega の `AdvStory` またはデータソース | 再生、一時停止、次へ、ストーリー全体に対する割合でシーク |
| 譜面 | `@haneoka/embed-cassiopeia` | `ChartEmbedDocument` またはデータソース | 再生、一時停止、秒単位のシーク、オプションとスキン |
| シーン | `@haneoka/embed-home-spot` | `HomeSpotDocument` またはデータソース | 選択、再生し直し、シーンの差し替え、PNG 書き出し |

表示を担う各ホストには、現在の公開コンテンツ向けの `/haneoka` アダプターもあります。アダプターはカタログのオブジェクトを選び、返されたアセットのパスを使います。自作のコンテンツは、単一の言語、任意のロケール文字列、Unicode のリソースキーを使えます。`server` と `locale` はそれぞれ独立して選んでください。

## 遊べるストーリーから始める

[8 ステップの Vega チュートリアル](./vega/)に沿って、台詞を 2 行書き、JSON を保存し、完全な HTML ページを開き、背景、サウンド、モデルを加えます。[完全なスターター HTML](/examples/first-story.html) と[完全な台詞 JSON](/examples/dialogue.json) を用意しています。スターターはホスト済みのモジュールを使うため、npm のインストールは不要です。チュートリアルでは実際のゲームのストーリー「Treasure」も読み込みます。

## 配布の状況と開発者向けのインストール

公式のブラウザー用モジュールは `https://haneoka.org/embed/{core,vega,cassiopeia,home-spot,vega-theme}.js` にあります。公開済みの r22 モジュールを `/embed/r-22bfe102f7deb73f/` の下で固定するか、マニフェストから検証済みの新しいリリースを解決してください。[リポジトリ](https://github.com/haneoka-gakuen/haneoka/tree/main/packages)にパッケージのソースがあり、生成される SDK のチャンクやアセットはデプロイ時のビルド成果物です。npm への公開は別の手順です。下記のセルフホストのパスは、アプリケーションが決める例です。

以下のセルフホストの手順は、ソースからビルドする開発者向けです。譜面とストーリーのツールチェーン全体には Node.js 24 以降を使ってください。埋め込み、core、必要なピア依存を同じソースのワークスペースのリビジョンからビルド・パックし、生成したファイルをホストのアプリケーションにインストールします。下記の vendor のパスはローカルの出力先の仮置きで、公開ダウンロードではありません。

```sh
# Replace these paths with the actual release artifacts and include the
# rendering peers listed in the selected host's guide.
npm install ./vendor/haneoka-embed-core-0.1.0.tgz \
  ./vendor/haneoka-embed-vega-0.1.0.tgz
```

ストーリーのホストには、Vega、その Three レンダラー、Portable UI、リッチテキストのプラグイン、Three、Howler が必要です。標準の譜面ホストには、Cassiopeia のカーネル、Web ホスト、Our Notes プラグイン、Three レンダラー、Vue UI、Vue、Three が必要です。Home Spot には Haneoka のシーンプロバイダー、Three `0.184.x`、Spine `4.2.119` が必要です。任意の公開カタログアダプターには `@haneoka/api-client` も必要です。互換バージョンはパッケージマニフェストに従ってください。埋め込みの tarball だけをインストールしても、未公開のピア依存は入りません。

メインのエントリーはネイティブの ESM と TypeScript の型宣言をエクスポートします。インポートしただけでは DOM にもネットワークにも触れません。表示のマウントは、ブラウザーのコンテナーが存在してから呼んでください。フレームワークではサーバー側でモジュールをインポートし、クライアントのコンポーネントのライフサイクルでハンドルを作成・破棄できます。

## 自分の CDN 用にスクリプトモジュールを作る

ブラウザー向けのバンドラーがパッケージのインポートを解決し、遅延読み込みされるレンダラーのチャンクをまとめて保ちます。たとえば Vite と必要なローカルパッケージを入れたアプリケーションで、次のエントリーファイルを作ります。

```js
// sdk/core.js
export * from "@haneoka/embed-core";
export { haneokaDataSource } from "@haneoka/embed-core/haneoka";

// sdk/vega.js
export { mountStory } from "@haneoka/embed-vega";
export { haneokaStorySource, cubismStoryPlugin } from "@haneoka/embed-vega/haneoka";
export { haneokaStoryPlugins } from "@haneoka/embed-vega/theme";
export { ADV_COMMAND } from "@haneoka/vega/renderer-kit";

// sdk/chart.js
export { mountChart } from "@haneoka/embed-cassiopeia";
export { haneokaChartSource, haneokaChartTheme } from "@haneoka/embed-cassiopeia/haneoka";
import "@haneoka/embed-cassiopeia/style.css";

// sdk/home-spot.js
export { mountHomeSpot } from "@haneoka/embed-home-spot";
export { mountHaneokaHomeSpot } from "@haneoka/embed-home-spot/haneoka";
```

これらは別々のファイルです。アプリケーションに必要なホストのエントリーだけをビルドしてください。任意のストーリーテーマやプロバイダーのアダプターをエクスポートするエントリーには、その任意のピアパッケージも必要です。

```js
// vite.config.mjs — this example builds the portable story entry only.
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    outDir: "sdk-dist",
    lib: { entry: "sdk/vega.js", formats: ["es"], fileName: () => "vega.js" },
  },
});
```

Portable だけのビルドでは、`sdk/vega.js` のエクスポートを `mountStory` と `ADV_COMMAND` に留めます。ホストの Vite ビルドを実行し、`sdk-dist` ディレクトリ全体を静的ホストや CDN のバージョン付きディレクトリにアップロードし、生成されたチャンクをすべて残してください。譜面のエントリーをビルドするときは出力された CSS もリンクします。テーマのスプライト、フォント、ライセンスが必要なモデルのランタイムは、選んだプロバイダーのアセットのコピー・配置の手順が必要です。JavaScript をバンドルするだけでは配置されません。

これで普通のページから自分でホストしたモジュールを使えます。

```html
<div id="story" style="height:60vh;min-height:320px"></div>
<button id="play" disabled>Play</button>
<script type="module">
  import { mountStory, ADV_COMMAND } from "/sdk/0.1.0/vega.js";

  const handle = mountStory(document.querySelector("#story"), {
    document: {
      localization: { locales: ["en"], defaultLocale: "en" },
      commands: [
        { command: ADV_COMMAND.Talk, targetName: "Mira", text: "Welcome." },
      ],
    },
    locale: "en",
  });
  const play = document.querySelector("#play");
  try {
    await handle.ready;
    play.disabled = false;
    play.onclick = () => handle.play();
  } catch (error) {
    console.error(error);
    await handle.dispose();
  }
  // On component/page teardown: await handle.dispose().
</script>
```

クロスオリジンの CDN では、インポートを絶対 URL に置き換え、JavaScript の MIME タイプと CORS の許可を付けて ESM を配信してください。バージョン付きのモジュール URL、依存関係、ランタイムのアセットは一緒に保ちます。ブラウザーのネイティブなベアパッケージのインポートには、使うすべての依存関係とエクスポートのサブパスを網羅するインポートマップが必要です。バンドルした配布物なら、埋め込むページ側でこの解決作業は不要です。

## 読み込み、レイアウト、寿命

マウントの前にステージの幅と高さを確保してください。読み込み中・エラーの表示と、アクセシブルな操作は、ページ側のコンポーネント体系に置きます。MD3 のページなら既存の Material のコントロール、デザイントークン、Fontsource のフォントを使えます。タッチに適した大きさのボタンと、狭い画面で折り返すレイアウトを使ってください。ブラウザーの音声の許可を満たすため、再生はクリックかタップから始めます。

返されたハンドルはすぐに保持し、`ready` にエラーハンドラーを付け、読み込み中も含めてコンポーネントのアンマウント時に破棄してください。同じ要素を再利用する前に破棄の完了を待ちます。取り消しの挙動はホストごとに異なり、[各ホストのガイド](./vega/)で説明しています。`cancel()` はすべてのホストで共通の再試行の手段ではありません。

| ホスト | `cancel()` の意味 | 再試行 |
| --- | --- | --- |
| Core のローダー | 進行中のデータ・リソースの呼び出しを取り消す | 同じローダーで `load()` を再度呼ぶ |
| Vega | 読み込み中の構築をやめる | 破棄してから新しいハンドルをマウントする |
| Cassiopeia | マウントと再生を止める。ハンドルは終端状態になる | 破棄してから新しいハンドルをマウントする |
| Home Spot | 現在の読み込みの世代を取り消す | 新しいソースやドキュメントで `load()` を呼ぶ |

## オリジンとクレジット表示

HTTP のデータとリソースは CORS を使い、既定では資格情報を送りません。それらのオリジンが埋め込むページを許可している必要があります。HTTP の JSON ソースは相対パスをドキュメントのディレクトリに対して解決します。メモリやローカルのデータには `assetsBase` かリソースのリゾルバーが必要です。ネイティブの画像・音声・モデルのローダーには別の転送の要件がある場合があり、ホストのガイドで説明しています。

Vega、Cassiopeia、Home Spot は、[haneoka.org](https://haneoka.org/) へリンクする元の Haneoka アイコンを表示します。現在のホストは、別の行を設けたりシーンを縮めたりせず、半透明の角のオーバーレイを使います。クレジット表示はホストの層に属してエンジンを示すもので、作者は自分のドキュメントとアセットの所有権とライセンスを保持します。Home Spot のリンクはゲームのキャンバスと PNG 書き出しの外にあります。データ専用の core は UI を作りません。任意の `/branding` エントリーは、独自の表示ホストが管理・削除できるアンカーを返します。

続きは[データソース](./core/)、[Vega](./vega/)、[Cassiopeia](./cassiopeia/)、[Home Spot](./home-spot/)へ。
