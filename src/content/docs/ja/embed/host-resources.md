---
title: Vega のホストリソース
description: ローカルのバイト列とレンダラー用の URI を渡し、読み取りを取り消し、明示的なリソースのリースを管理します。
---

[Haneoka](https://haneoka.org/) · [ブラウザーでのストーリーのチュートリアル](../vega/)

`@haneoka/vega/host-resources` は `HostStoryResourceResolver`、`StoryResourceResolver`、`StoryResourceLease` をエクスポートします。この小さなエントリーはブラウザーの I/O を使わず、Node やネイティブのホストで動きます。渡したホストを包むもので、ストレージ、キャッシュ、対応するリソース名、レンダラーが扱える URI はホストが決めます。

エンジンとは **`engine.createPlayer({ resources })`**（`VegaPlayerOptions` のフィールド）で連携します。同じ完全なポートがレンダラー、ADV ローダー、UI に届きます。渡したポートはアプリケーションが所有し続け、プレーヤーとエンジンの後始末は自分のリースだけを解放します。エンジンの既存のプレーヤー表示と標準のレンダラーにはブラウザーの DOM が必要です。このリソースのエントリーは I/O の境界を定めるもので、ネイティブ向けエンジンの完全な配布物ではありません。

## 1. ソースからエントリーをビルドする

公開パッケージのエクスポートは Vega のリビジョン `dfb720d13cada667bd07072cb163942b6c70d0b3` でコミットされています。npm への公開はまだです。ソースビルドか、対応するローカルパッケージを使ってください。既存のホスト済み `embed/vega.js` はブラウザー埋め込み用の窓口で、独自のオプションを持ちます。

ソースを新しくチェックアウトする場合は、Node.js 22.13 以降を入れ、Corepack のコマンドを使えるようにしてから下のコマンドを実行してください。このソースビルドのツールチェーンは pnpm 11.14.0 を使います。ビルド済みのリソースの例を動かすには、手順 2 のとおり Node 20 以降が必要です。

```sh
git clone https://github.com/haneoka-gakuen/vega.git
cd vega
git checkout dfb720d13cada667bd07072cb163942b6c70d0b3
corepack enable
corepack prepare pnpm@11.14.0 --activate
pnpm install --frozen-lockfile
pnpm --filter @haneoka/vega-protocol build
pnpm build:core
```

対象のエントリーは `dist/host-resources.js`、型宣言のエントリーは `dist/host-resources-entry.d.ts` です。このソースパッケージをリンクしたワークスペースでは、`@haneoka/vega/host-resources` を通常どおりインポートできます。出力された相対パスのリソースモジュールはエントリーと一緒に置いておいてください。

## 2. ローカルファイルの完全な例を動かす

[host-resources.mjs](/examples/host-resources.mjs) と [garden.svg](/examples/garden.svg) を同じ場所に保存します。そのディレクトリで Node 20 以降を実行し、実際にビルドしたエントリーのパスを渡します。

```sh
node host-resources.mjs ../vega/dist/host-resources.js ./garden.svg
```

チェックアウトが別の場所にあればパスを変えてください。スクリプトからリンク済みのパッケージを使える場合は、パッケージのインポートが既定です。

```sh
node host-resources.mjs
```

この完全なスクリプトは `asset://my-story/background` をローカルの SVG に対応付けます。エンコード済みのバイト列を読み、独立した変更可能なコピーと共有の読み取り専用ビューを示し、リースを 2 つ取得し、始まる前の読み取りを取り消し、リソースのスコープを閉じます。最後に元のファイルホストを閉じ、そのホストが保持していたバイト列を消去します。コンソールにはバイト数、URI、取得と解放の回数が一致することが記録されます。

返される `asset://` の URI は、アプリケーションのアセットスキーム用に登録したネイティブのレンダラー向けです。この例では出力するだけで、URI の表示上の意味はレンダラーのアダプターが与えます。ブラウザーのホストなら、`resolveRenderable` で Blob URL を作り、対応する解放のフックで破棄する方法もあります。URI を何にするかはホストが決めます。

## 3. ホストのポートを完全に実装する

```ts
import {
  HostStoryResourceResolver,
  type StoryResourceResolver,
  type StoryResourceLease,
} from "@haneoka/vega/host-resources";

const resources = new HostStoryResourceResolver(host);
```

ここでの `host` は次の完全な契約を実装します。ダウンロードできるスクリプトは必須のメソッドをすべて用意しています。`load()` だけのアダプターは、以前の標準リゾルバーのアダプター API のものです。

| メソッド | シグネチャ | 必須かどうかと効果 |
| --- | --- | --- |
| canLoad | `(source: string) => boolean` | 必須。同期的な受け入れ判定。受け付けるスキームとキーはホストが決める。 |
| load | `(source: string, signal?: AbortSignal) => Promise<Uint8Array>` | 必須。エンコード済みのバイト列を読み、渡された取り消しのシグナルに従う。 |
| loadSharedBytes | `(source: string, signal?: AbortSignal) => Promise<Readonly<Uint8Array>>` | 任意。信頼できる不変の常駐バイト列のための高速経路。利用側はこのビューを書き換えない。 |
| retain | `(source: string, signal?: AbortSignal) => Promise<StoryResourceLease>` | 必須。エンコード済みリソースのリースを取得する。リースは `release(): void` を持つ。 |
| resolveRenderable | `(source: string, signal?: AbortSignal) => Promise<{ readonly url: string; readonly release: () => void }>` | 必須。選んだレンダラーが理解できる URI を、解放のフック付きで取得する。 |

ホストは、自分が確保したバイト列、ファイルハンドル、キャッシュ、プロトコルの登録、デコード済みのオブジェクトを所有します。リースを返す前に読み取りが失敗した場合は、途中まで確保したものも後始末します。例の `host.dispose()` は保持しているバイト列を消すアプリケーション定義のメソッドで、`StoryResourceResolver` に追加したものです。

## スコープの引数、結果、エラーのすべて

コンストラクターは **`new HostStoryResourceResolver(host)`** です。必須の引数は完全な `StoryResourceResolver` 1 つだけです。既定のホスト、URL のベース、キャッシュ、バイト数の上限、期限は持ち込みません。これらの方針はホストで設定してください。

| スコープのメソッド | 引数と結果 | 挙動 |
| --- | --- | --- |
| canLoad | `source: string` → `boolean` | 有効な間はホストに委ね、スコープの破棄後は false を返す。 |
| load | `source: string, signal?: AbortSignal` → `Promise<Uint8Array>` | ホストのバイト列の新しい専有コピーを返す。コピーを変更してもホストの常駐ビューは変わらない。 |
| loadSharedBytes | 同じ引数 → `Promise<Readonly<Uint8Array>>` | ホストの信頼できるビューを返す。高速経路がなければ `host.load` にフォールバックする。ラッパーはコピーを作らない。readonly の型は呼び出し側の約束で、実行時にバッファーを凍結するものではない。 |
| retain | 同じ引数 → `Promise<StoryResourceLease>` | 冪等な `release()` を持つリースを返す。エンコード済みリソースを使い終えたら解放する。 |
| resolveRenderable | 同じ引数 → `Promise<{ readonly url: string; readonly release: () => void }>` | ホストの URI をそのまま、冪等な解放のフックと一緒に返す。解放する前にレンダラーの使用を止める。 |
| dispose | 引数なし → `void` | スコープを閉じた状態にし、保留中の取得を中断し、有効なリースを解放する。繰り返し呼んでも追加の効果はない。 |

`source` はそのまま渡されます。スコープはパスの正規化、コーデックの選択、HTTP リクエスト、Blob への変換、リソースの解析をしません。対応しないソースでは非同期の操作が `TypeError` で拒否されます。ホストの I/O の失敗は元のエラーのまま返ります。

任意の `signal` が取り消すのは **取得** です。すでに中断されたシグナルは I/O の前にその理由で拒否され、進行中の中断はホストに伝えられて操作がすぐに拒否されます。成功したリースは、あとで取得のシグナルが中断されても、明示的な `release()` かスコープの破棄まで有効です。

ホストは伝えられたシグナルに従ってください。取り消しのあとにホストがリースを返した場合、ラッパーはその遅れたハンドルを解放します。遅れた解放の失敗は診断用のコンソールに出て、操作の結果は元の取り消しのままです。`dispose()` のあとの非同期の呼び出しは `AbortError` で拒否されます。破棄は現在のすべての解放を試み、どれかが失敗すると `AggregateError` を投げます。解放のフックは、例外を投げた場合も含めて最大 1 回しか呼ばれません。

## 4. エンジンにリソースを渡し、所有の順に閉じる

エンジンのエントリーを使うアプリケーションでは、このヘルパーが呼び出し側の所有する完全なポートをプレーヤーに渡します。引数は実際のマウント先の要素、`AdvStory`、リソースのスコープです。

```ts
import { createVega, type AdvStory } from "@haneoka/vega/engine";
import type { StoryResourceResolver } from "@haneoka/vega/host-resources";

export async function mountWithResources(
  mount: HTMLElement,
  story: AdvStory,
  resources: StoryResourceResolver,
) {
  const engine = createVega();
  try {
    const player = await engine.createPlayer({ mount, story, resources, shell: false });
    return { player, close: () => engine.dispose() };
  } catch (error) {
    try { await engine.dispose(); }
    catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Player setup and Engine cleanup failed");
    }
    throw error;
  }
}
```

`resources?: StoryResourceResolver` は **プレーヤーのオプション** で、`VegaEngineOptions` のコンストラクターのフィールドでも、埋め込みの `mountStory` のオプションでもありません。省略すると、既存の `DefaultStoryResourceResolver` とリソースプラグインの経路のままです。`HostStoryResourceResolver` は使えるスコープの実装の 1 つで、ほかの完全なポートを渡すこともできます。

`AdvStory` の出発点には[完全なストーリー JSON](https://docs.haneoka.org/examples/dialogue.json) を使ってください。形式とブラウザーでの読み込み手順は[ストーリーのチュートリアル](../vega/)にあります。ホスト固有のレンダラーはポートが返す URI を受け付ける必要があります。標準の DOM レンダラーはブラウザーで描画できる URL を使います。

| 所有者 | 後始末の責任 |
| --- | --- |
| プレーヤー/エンジン | 自分のローダー、シーン、UI のリース。`await player.dispose()` でそのプレーヤーを外し、`await engine.dispose()` ですべてのプレーヤーとエンジンが所有する寄与を閉じる。 |
| アプリケーション | 注入したリソースのスコープ。すべての利用者が止まってから閉じる。複数のプレーヤーで共有してよい。 |
| ファイル/ネイティブのホスト | 自分のストレージ、常駐キャッシュ、Worker との接続、途中まで確保したもの。それを使うスコープのあとに閉じる。 |

終了の順序は **プレーヤー/エンジンの後始末を待つ → `resources.dispose()` → 自分の `host.dispose()`** です。スコープとホストの後始末は入れ子の `finally` に入れ、解放のエラーがあってもあとの所有者が閉じられるようにしてください。プレーヤーの構築に失敗した場合は、そのプレーヤーの取得分が後始末され、呼び出し側のリソースのスコープは使えるまま残ります。プレーヤーを 1 つ閉じても、ほかのプレーヤーと共有しているスコープは保たれます。
