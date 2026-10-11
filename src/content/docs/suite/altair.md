---
title: Altair
description: Write, translate and stage visual novels with a live Vega preview, flowcharts and importers for WebGAL, Bestdori and prose.
---

Altair is the editor of the suite. A project — its scenes, languages, assets,
characters and plugins — opens in one workspace: a script view and a form for
every command, an asset browser, a flowchart of the whole story, and a live
[Vega](/suite/vega/) preview that follows the cursor. What you edit is the same
data Vega plays and [Deneb](/suite/deneb/) ships.

## Starting a project

There are three ways in:

- **Open a folder.** In a Chromium-based browser Altair works directly on a
  folder on your disk: it reads scenes and assets from it and saves edits back
  to the same files. Other browsers open files read-only and export changes.
- **Import.** WebGAL project folders and WebGAL Craft projects, Bestdori
  scenarios, ADV JSON, and plain prose all become Altair projects.
  WebGAL scenes that you do not change are written back byte for byte.
- **Start from an example.** [First Light](https://github.com/haneoka-gakuen/vega-example-first-light)
  is a short story designed to be opened and changed.

## Writing

Every command has a form with typed fields — speaker, text in each language,
the character's motion and expression, a background from the asset browser,
camera moves with their easing. The script view shows a one-line summary of
each command, and you can switch to the source text at any time.

A project can have any number of languages, each with its own fonts. Text
fields hold all of them, and the preview plays the one you choose.

[Altair Prose](https://github.com/haneoka-gakuen/altair-plugin-prose) turns a
pasted chapter into draft scenes: speaker lines and quoted dialogue become
dialogue, everything else narration, all marked for review.

## Seeing the story

- **Preview.** The Vega preview updates as you type, jumps to the command
  under the cursor, can play from any point, step with breakpoints, or try a
  few commands without saving them. Drag a character on the stage and its
  position is written back into the command.
- **Flowchart.** Scenes, choices, jumps, calls and endings as a graph. It also
  reports scenes no path reaches, jumps to missing labels, duplicate labels
  and loops with no exit.
- **Characters.** [Altair Models](https://github.com/haneoka-gakuen/altair-plugin-models)
  builds layered characters — Live2D, images, GIFs, video — and adds them to a
  scene in one click.

## Safety nets

Undo and redo cover the project and every open document. Unsaved edits are
kept as drafts in the browser and come back after a reload or a crash; if the
project changed in the meantime, Altair shows which drafts no longer apply
instead of overwriting anything.

## Assets from game sources

With a network adapter configured, the asset browser can show:

- the [haneoka.org catalogue](https://github.com/haneoka-gakuen/altair-plugin-haneoka)
  of Our Notes backgrounds, stills, effects, Live2D, BGM and voices, and whole
  official stories as editable projects;
- [Bestdori](https://github.com/haneoka-gakuen/altair-plugin-bestdori)'s asset
  tree for Girls Band Party.

## Plugins

Everything above is a plugin. [Altair Full Preset](https://github.com/haneoka-gakuen/altair-preset-full)
installs the official set. A project records which plugins it uses, and the
[marketplace plugin](https://github.com/haneoka-gakuen/altair-plugin-marketplace)
checks their versions, dependencies and permissions and writes a lock file
before you build. Third-party plugins can run isolated in a worker with
[the sandbox](https://github.com/haneoka-gakuen/altair-plugin-sandbox).

## Running Altair

```sh
git clone https://github.com/haneoka-gakuen/altair.git
cd altair
pnpm install --frozen-lockfile
pnpm dev
```

To build your own editor on the same pieces, install `@haneoka/altair` and the
plugins you want, create an `AltairPluginHost`, and install them. Each plugin's
README shows how.
