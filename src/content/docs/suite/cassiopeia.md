---
title: Cassiopeia
description: The rhythm-game engine behind haneoka.org's chart player — kernel, plugins, Vue components, and Sonolus conversion.
---

Cassiopeia is the rhythm-game engine behind the chart player and chart viewer
on haneoka.org. Its kernel reads a chart, keeps time in integer milliseconds,
decides which note each touch belongs to, judges and scores it, and reports
fever sections, skills and combo as events. It draws nothing and plays no
sound — plugins do — so the same kernel runs the web player, the chart
overview, a Sonolus level or a native app.

The kernel exists in TypeScript and in Rust (for WebAssembly and native
Android and iOS hosts), and both give the same results for the same input.

## Pieces

| Package | Role |
| --- | --- |
| [`@haneoka/cassiopeia`](https://github.com/haneoka-gakuen/cassiopeia) | Kernel, plugin runtime, WebAssembly and native bindings |
| [Our Notes plugin](https://github.com/haneoka-gakuen/cassiopeia-plugin-our-notes) | Our Notes charts, timing rules, skins and effects |
| [Sekai plugin](https://github.com/haneoka-gakuen/cassiopeia-plugin-sekai) | Project Sekai SUS charts, for display |
| [Three.js renderer](https://github.com/haneoka-gakuen/cassiopeia-renderer-three) | The 3D stage, notes, effects and HUD |
| [Web host](https://github.com/haneoka-gakuen/cassiopeia-host-web) | Audio clock, note sounds and pointer input in the browser |
| [Vue UI](https://github.com/haneoka-gakuen/cassiopeia-ui-vue) | `ChartPlayer` and `ChartOverview` components |
| [Sonolus conversion](https://github.com/haneoka-gakuen/cassiopeia-plugin-sonolus) | Charts to Sonolus level data and USC |

## A chart player in Vue

```sh
pnpm add vue @haneoka/cassiopeia @haneoka/cassiopeia-plugin-our-notes \
  @haneoka/cassiopeia-renderer-three @haneoka/cassiopeia-host-web @haneoka/cassiopeia-ui-vue
```

```vue
<ChartPlayer :chart="chart" :assets="assets" audio-url="/songs/101.mp3" mode="watch" @ready="player.play()" ref="player" />
```

`mode="watch"` auto-plays; `mode="play"` lets the reader play with touch or
mouse. The player emits judgement, combo and fever events and can follow your
own clock instead of its audio — that is how an editor or a video exporter
keeps it in step. `ChartOverview` draws the whole chart on one tall canvas with
combo counts, BPM changes, fever sections and skill windows.

To show a haneoka.org chart without installing anything, use the
[Cassiopeia embed](/embed/cassiopeia/).

## Using the kernel directly

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

Sessions take `tap`, `release`, `flick` and `trace` input with an optional
pointer id, and `update` returns a snapshot with score, combo, life and
full-combo state. This is enough to build a game of your own, a score
simulator, or a chart analyser.

## Sonolus

Our Notes charts can be played in the [Sonolus](https://sonolus.com) app. The
conversion plugin turns a chart into Sonolus level data, and the
[Sonolus engine](https://github.com/haneoka-gakuen/sonolus-our-notes) plays it
with Our Notes' judgement and effects. haneoka.org runs a
[Sonolus server](/sonolus/) with every chart.

## Reference

The [Cassiopeia repository](https://github.com/haneoka-gakuen/cassiopeia) README
covers the kernel API, plugins and native bindings; each package's README
covers its options.
