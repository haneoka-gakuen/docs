---
title: Deneb
description: Vega プロジェクトを Web サイト、オフライン PWA、Electron・Tauri アプリ、Android・iOS プロジェクトとしてビルドします。
---

Deneb は最後の工程です。完成した [Vega](/ja/suite/vega/) プロジェクトを、インストールして使えるものに変えます。プロジェクトに必要なシーン、アセット、プラグインがすべて揃っているかを確認し、ビルドを再現できるよう正確なバージョンを固定して、指定した出力先を書き出します。どの出力先にも同じプロジェクトと同じプレーヤーが入るため、ストーリーはどこでも同じように動きます。

## インストール

```sh
git clone https://github.com/haneoka-gakuen/deneb.git
cd deneb
cargo install --locked --path crates/deneb-cli
```

## プロジェクトからビルドまで

```sh
deneb doctor --target android                 # what does this machine still need?
deneb validate my-story/project.vega.json     # is the project complete?
deneb plugins validate my-story/project.vega.json
deneb build my-story/project.vega.json --target pwa --output dist --runtime-bundle ./vega-runtime
```

`--runtime-bundle` には、パッケージする Vega ランタイムを指定します。ランタイムを記述した `deneb-runtime.json` を含むフォルダーです。

## 出力先

| 出力先 | 得られるもの |
| --- | --- |
| `web` | 相対リンクの静的サイト。どこにでも、どのパスにでも置けます。 |
| `pwa` | サイトにマニフェストと Service Worker を加えたもの。オフラインで再生でき、インストールできます。 |
| `electron` | Chromium のサンドボックスを使うデスクトップアプリ。 |
| `tauri` | ダウンロードサイズがずっと小さいデスクトップアプリ。 |
| `android`、`ios` | Android Studio や Xcode で開くネイティブプロジェクト。 |

デスクトップとモバイルのビルドは `--bundle-identifier`（既定は `app.vega.<project-id>`）を使います。

## リリースビルドとプレビュービルド

既定の `--mode release` は、プロジェクトがオフラインで完結し、ランタイムが固定されていない限りビルドしません。再生時にネットワークへ依存しない結果になります。`--mode preview` は素早い確認のためにこの条件を緩めます。

プラグインのバージョンは、プロジェクトの隣にあるロックファイル（`deneb.lock.json`、`vega.plugins.lock.json`）から決まります。同じプロジェクトを同じロックでビルドすれば同じ出力になります。Vega のプラグインロックは [Altair マーケットプレイスプラグイン](https://github.com/haneoka-gakuen/altair-plugin-marketplace)で書き出せます。

## ライセンスが必要なランタイム

Live2D Cubism Core のように、自分でライセンスを取得する必要があるサードパーティーのランタイムを使うキャラクターもあります。Deneb がそれを自ら同梱することはありません。`--allow-private-external-runtimes` を付けると、そのライセンスのもとで配布するビルドに、プロジェクトが用意したランタイムを含めます。

## 自動化

どのコマンドも `--json` を受け付け、安定したコードでエラーを報告するため、Deneb は CI に組み込めます。`deneb doctor --json` を使うと、ビルド環境にツールチェーンが欠けているときに早い段階で失敗させられます。

## リファレンス

[Deneb リポジトリ](https://github.com/haneoka-gakuen/deneb)に、全オプションの一覧と、プロジェクト形式、出力先、ランタイム契約、プラグインの仕組みの説明があります。
