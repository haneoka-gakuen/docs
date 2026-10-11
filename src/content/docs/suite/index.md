---
title: The suite
description: Vega, Altair, Deneb, Cassiopeia and the Sonolus engine — the open-source tools behind haneoka.org, and how they fit together.
---

Everything haneoka.org plays — stories, charts, the Home Spot lobby — runs on a
set of open-source tools you can use for your own projects. They come in two
families: one for visual novels and one for rhythm games. Each tool stands on
its own, is built from plugins, and works with or without the others.

## Visual novels

| Tool | What it is | Use it to |
| --- | --- | --- |
| [Vega](/suite/vega/) | The player. A visual novel engine for the web and native apps. | Play a story on a page, in an app or in a game. |
| [Altair](/suite/altair/) | The editor. Scenes, languages, assets, preview and flowcharts in one workspace. | Write, translate and stage a story. |
| [Deneb](/suite/deneb/) | The builder. A command-line tool. | Ship a finished story as a website, PWA, desktop app or mobile project. |

A typical project moves through all three: write and localize it in Altair,
watch it in Vega while you work, and build it with Deneb when it is done. They
share one story format, so nothing is converted along the way.

Altair also opens projects from other tools — WebGAL folders, Bestdori
scenarios, plain prose — and Vega can play WebGAL projects with its
compatibility plugin, so an existing project can move in without being
rewritten.

## Rhythm games

| Tool | What it is | Use it to |
| --- | --- | --- |
| [Cassiopeia](/suite/cassiopeia/) | A rhythm-game engine with a deterministic kernel in TypeScript and Rust. | Show, play or analyse charts on the web or in a native app. |
| [Sonolus engine](/sonolus/) | The Our Notes engine for [Sonolus](https://sonolus.com). | Play Our Notes charts in the Sonolus app. |

Cassiopeia reads Our Notes and Project Sekai charts, and converts them to
Sonolus levels. The chart player and chart viewer on haneoka.org are its Vue
components.

## Embedding instead of building

If you only want to put a story, a chart or the Home Spot scene on a page, the
[JavaScript embeds](/embed/) load everything from haneoka.org with one script
tag. Use the tools directly when you need your own data, your own look, or an
app of your own.

## Repositories

Every tool lives in its own repository under
[github.com/haneoka-gakuen](https://github.com/haneoka-gakuen), with its plugins
as separate packages. Each repository's README is the complete reference for
that package; these pages explain how the pieces are used together.

All of them are MPL-2.0: you can use them in closed-source projects, and
changes to the files themselves are shared back.
