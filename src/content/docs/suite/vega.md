---
title: Vega
description: Play visual novels on the web and in native apps — the engine, its plugins and how to put a player on a page.
---

Vega is the visual novel engine behind haneoka.org's story player. It reads a
story — a list of commands for dialogue, characters, backgrounds, camera,
sound, choices and chat — and turns it into state: what is said, who is on
stage, what plays. Everything you see and hear comes from plugins, so the same
engine runs with a full 3D stage and Live2D characters, a light 2D stage on a
phone, or a plain DOM fallback that needs no WebGL at all.

## What a player is made of

| Part | Official plugins | Without it |
| --- | --- | --- |
| Renderer | [Three.js](https://github.com/haneoka-gakuen/vega-renderer-three), [Pixi](https://github.com/haneoka-gakuen/vega-renderer-pixi) | A DOM scene that shows backgrounds, stills and portraits. |
| Story UI | [Portable UI](https://github.com/haneoka-gakuen/vega-ui-portable) | Your own `dialogue` UI slot. |
| Shell | [Default shell](https://github.com/haneoka-gakuen/vega-shell-default): title, saves, settings, backlog, gallery, flowchart | The story plays straight away. |
| Theme | [Haneoka](https://github.com/haneoka-gakuen/vega-theme-haneoka), Portable, WebGAL | Unstyled UI. |
| Characters | [Cubism (Live2D)](https://github.com/haneoka-gakuen/vega-plugin-cubism), [Spine](https://github.com/haneoka-gakuen/vega-plugin-spine), [Composed models](https://github.com/haneoka-gakuen/vega-plugin-composite) | Static images only. |
| Text | [Rich text](https://github.com/haneoka-gakuen/vega-plugin-richtext) plus Markdown, BBCode, HTML, LaTeX, Typst | Plain text. |
| Extras | [Ending screen](https://github.com/haneoka-gakuen/vega-plugin-ending), [WebGAL compatibility](https://github.com/haneoka-gakuen/vega-plugin-webgal), [Haneoka host](https://github.com/haneoka-gakuen/vega-plugin-haneoka) | |

[Vega Full Preset](https://github.com/haneoka-gakuen/vega-preset-full) assembles
a sensible set in one call.

## Put a player on a page

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

`createPlayer` starts the engine if needed, mounts a player under the element,
loads every resource the story uses, and returns a handle. Through
`player.player` you can `play()`, `pause()`, `resume()`, `requestNext()`,
`choose(key)` and `seekTo(index)`, and read the reactive `state` — the current
line, the backlog, whether the story has finished. Dispose the handle before
the engine; disposing the engine also disposes its players.

To embed a haneoka.org story without installing anything, use the
[Vega embed](/embed/vega/) instead.

## Stories

A story is JSON with a `commands` array. Each command has a numeric `command`
code and its fields:

```json
{
  "commands": [
    { "command": 25, "background": { "url": "/bg/rooftop.png" }, "duration": 0.5 },
    { "command": 0, "targetName": "anon", "characterModel": { "runtime": { "imageUrl": "/figure/anon.png" } } },
    { "command": 2, "targetName": "anon", "text": "Let's go!" }
  ]
}
```

Here `25` is Stage (set the background), `0` brings a character in and `2` is
a line of dialogue.

The command set mirrors the game's: dialogue and speakers, characters in and
out with motions and expressions, backgrounds and stills, camera pan, tilt,
zoom and shake, depth of field, BGM, sound effects and voice, fades, flashes
and transitions, chat-phone scenes, movies with subtitles, choices, jumps and
command groups. The codes are in `@haneoka/vega-protocol`
(`VEGA_ADV_OPCODE`). In practice you rarely write them by hand: Altair edits
them with forms, and its importers produce them from WebGAL, Bestdori or
prose.

Text supports the game's markup — ruby, colours, sizes — and, with format
plugins, Markdown and the rest. Every text field can hold several languages;
the player shows the reader's.

## Resources

Resources are URLs in the story. HTTP(S), `data:` and `blob:` URLs load
directly. For archives, app protocols or a CDN mapping, add a resource plugin
with a scheme and a `load` function. URLs that try to leave the allowed scope
(`..`, empty or unsafe paths) are rejected before loading.

Before a story starts, Vega lists every resource it will need and loads them,
including the motions each Live2D model actually uses — so playback does not
pause halfway through for a download.

## Plugins

```ts
const engine = new VegaEngine({
  officialPlugins: [threeRenderer, portableUi],
  plugins: [myAnalyticsPlugin],
});
```

`officialPlugins` are trusted as part of your distribution; `plugins` are
third-party and get third-party permissions. A plugin contributes renderers,
UI slots, themes, character providers, commands, resources, storage or input,
and every registration is undone when the plugin is removed or the engine is
disposed. A plugin whose setup fails is rolled back completely.

Projects record the plugins they need, and
[the marketplace catalog](https://github.com/haneoka-gakuen/vega-marketplace)
lists the official ones with their permissions and dependencies.

## Saves, settings and input

The default shell provides saves, settings and the backlog through Vega's
storage port, which uses the browser by default. A host plugin can store them
elsewhere — the [Haneoka host plugin](https://github.com/haneoka-gakuen/vega-plugin-haneoka)
routes storage and input through a small bridge your app implements.

## Shipping

To turn a project into a site, a PWA, a desktop app or a mobile project, use
[Deneb](/suite/deneb/).

## Reference

The [Vega repository](https://github.com/haneoka-gakuen/vega) README covers the
engine API, and each plugin's README covers its options in full.
