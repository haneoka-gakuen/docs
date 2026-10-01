---
title: JavaScript embeds
description: Put a Vega story, Cassiopeia chart, or Home Spot scene inside your own website.
---

Haneoka's embeds mount into an element on your page. Vega plays stories, Cassiopeia plays charts, and Home Spot renders interactive Three/Spine scenes. They share portable data sources and resource loading through `@haneoka/embed-core`. Your application owns the surrounding layout, buttons and error messages.

## Choose a host

| Content | Entry | Input | Controls |
| --- | --- | --- | --- |
| Data and resource loading | `@haneoka/embed-core` | Memory, HTTP JSON, local files, or a custom source | Load, cancel, dispose |
| Story | `@haneoka/embed-vega` | Vega `AdvStory` or a data source | Play, pause, next, seek by story ratio |
| Chart | `@haneoka/embed-cassiopeia` | `ChartEmbedDocument` or a data source | Play, pause, seek in seconds, options and skin |
| Scene | `@haneoka/embed-home-spot` | `HomeSpotDocument` or a data source | Select, replay, replace scene, export PNG |

Each visual host also has a `/haneoka` adapter for current public content. The adapter selects a catalog object and uses its returned asset paths. Authored content can use a single language, arbitrary locale strings and Unicode resource keys. Select `server` independently from `locale`.

## Distribution status and local installation

Official browser modules are hosted at `https://haneoka.org/embed/{core,vega,cassiopeia,home-spot,vega-theme}.js`. Pin the already-published r22 modules beneath `/embed/r-22bfe102f7deb73f/`, or resolve a later verified release from the manifest. The [repository](https://github.com/haneoka-gakuen/haneoka/tree/main/packages) contains package source; generated SDK chunks/assets are deployment build outputs. npm publication remains a separate step. The self-hosted paths below are examples chosen by your application.

Use Node.js 24 or later for the complete chart/story toolchain. Obtain the embed, core and required peer tarballs from the same prepared revision. Install those files into your host application:

```sh
# Replace these paths with the actual release artifacts and include the
# rendering peers listed in the selected host's guide.
npm install ./vendor/haneoka-embed-core-0.1.0.tgz \
  ./vendor/haneoka-embed-vega-0.1.0.tgz
```

The story host needs Vega, its Three renderer, portable UI, rich-text plugin, Three and Howler. The default chart host needs the Cassiopeia kernel, Web host, Our Notes plugin, Three renderer, Vue UI, Vue and Three. Home Spot needs the Haneoka scene provider, Three `0.184.x` and Spine `4.2.119`. Optional public catalog adapters also need `@haneoka/api-client`. Follow the package manifests for compatible versions; installing an embed tarball alone does not provide unpublished peers.

The main entries export native ESM and TypeScript declarations. Imports leave the DOM and network untouched. Call a visual mount only after its browser container exists. A framework can import the module on the server, then create and dispose the handle in its client component lifecycle.

## Produce script modules for your own CDN

A browser bundler resolves package imports and keeps lazy renderer chunks together. For example, in an application with Vite and the required local packages installed, create these entry files:

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

These are separate files. Build only the host entries your application needs. An entry exporting the optional story theme/provider adapters also needs their optional peer packages.

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

For a portable-only build, keep `sdk/vega.js` to the `mountStory` and `ADV_COMMAND` exports. Run your host's Vite build, upload the entire `sdk-dist` directory to a versioned directory on your static host/CDN, and retain every generated chunk. Link the emitted CSS when building the chart entry. Theme sprites, fonts and licensed model runtimes require the selected provider's asset-copy/provisioning steps; bundling JavaScript alone does not provision them.

An ordinary page then uses its own hosted module:

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

For a cross-origin CDN, replace the import with your absolute URL and serve ESM with a JavaScript MIME type and CORS permission. Keep versioned module URLs, dependencies and runtime assets together. Browser-native bare package imports require an import map covering every used dependency and exported subpath; a bundled distribution removes that resolution work from the embedding page.

## Loading, layout and lifetime

Reserve the stage's width and height before mounting. Keep loading/error indicators and accessible controls in your page's component system; an MD3 page can use its existing Material controls, design tokens and Fontsource fonts. Use touch-sized buttons and layouts that wrap on narrow screens. Playback begins from a click or tap to satisfy browser audio permissions.

Keep the returned handle immediately, attach an error handler to `ready`, and dispose it when the component unmounts, including while loading. Await disposal before reusing the same element. The [individual host guides](./vega/) describe their different cancellation behavior; `cancel()` is not a common retry method across every host.

| Host | Meaning of `cancel()` | Retry |
| --- | --- | --- |
| Core loader | Cancel in-flight data/resource calls | Call `load()` again on the same loader |
| Vega | Retire loading construction | Dispose, then mount a new handle |
| Cassiopeia | Stop the mount and playback; terminal handle | Dispose, then mount a new handle |
| Home Spot | Cancel the current loading generation | Call `load()` with a fresh source/document |

## Origins and attribution

HTTP data and resources use CORS with credentials omitted by default. Their origins must permit your embedding page. An HTTP JSON source resolves relative paths against the document directory; memory/local data needs `assetsBase` or a resource resolver. Native image/audio/model loaders may have separate transport requirements, described in the host guide.

Vega and Home Spot display the original Haneoka icon linking to [haneoka.org](https://haneoka.org/). The prepared Cassiopeia host still needs its built-in branding wiring; until that integration lands, append the shared branding helper as shown in its guide. Attribution belongs to the host layer and identifies the engine; authors keep ownership and licenses for their documents and assets. Home Spot's link sits outside its game canvas and PNG export. The data-only core creates no UI; its optional `/branding` entry returns an anchor for custom visual hosts to own and remove.

Continue with [data sources](./core/), [Vega](./vega/), [Cassiopeia](./cassiopeia/) or [Home Spot](./home-spot/).
