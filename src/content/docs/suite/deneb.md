---
title: Deneb
description: Build a Vega project into a website, offline PWA, Electron or Tauri app, or Android and iOS project.
---

Deneb is the last step: it turns a finished [Vega](/suite/vega/) project into
something people can install. It checks that every scene, asset and plugin the
project needs is present, pins exact versions so the build can be repeated,
and writes the target you ask for. All targets contain the same project and the
same player, so a story behaves the same everywhere.

## Install

```sh
git clone https://github.com/haneoka-gakuen/deneb.git
cd deneb
cargo install --locked --path crates/deneb-cli
```

## From project to build

```sh
deneb doctor --target android                 # what does this machine still need?
deneb validate my-story/project.vega.json     # is the project complete?
deneb plugins validate my-story/project.vega.json
deneb build my-story/project.vega.json --target pwa --output dist --runtime-bundle ./vega-runtime
```

`--runtime-bundle` points at the Vega runtime to package: a folder with a
`deneb-runtime.json` describing it.

## Targets

| Target | You get |
| --- | --- |
| `web` | A static site with relative links; upload it anywhere, at any path. |
| `pwa` | The site plus a manifest and service worker, playable offline and installable. |
| `electron` | A desktop app with Chromium sandboxing. |
| `tauri` | A desktop app with a much smaller download. |
| `android`, `ios` | Native projects to open in Android Studio or Xcode. |

Desktop and mobile builds use `--bundle-identifier` (default
`app.vega.<project-id>`).

## Release and preview builds

`--mode release`, the default, refuses to build unless the project is complete
offline and the runtime is pinned — the result does not depend on any network
at play time. `--mode preview` relaxes this for quick tests.

Plugin versions come from lock files next to the project (`deneb.lock.json`,
`vega.plugins.lock.json`), so building the same project with the same locks
gives the same output. The [Altair marketplace plugin](https://github.com/haneoka-gakuen/altair-plugin-marketplace) can write the Vega plugin lock for you.

## Licensed runtimes

Some characters need a third-party runtime you must license yourself, such as
the Live2D Cubism Core. Deneb never bundles one on its own; with
`--allow-private-external-runtimes`, it includes the runtime your project
supplies, for builds you distribute under that licence.

## Automation

Every command takes `--json` and reports errors with stable codes, so Deneb
fits into CI. `deneb doctor --json` is a quick way to fail early when a build
machine is missing a toolchain.

## Reference

The [Deneb repository](https://github.com/haneoka-gakuen/deneb) has the full
option list and documents the project format, targets, runtime contract and
plugin system.
