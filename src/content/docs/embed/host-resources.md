---
title: Vega host resources
description: Supply local bytes and renderer URIs, cancel reads and manage explicit resource leases.
---

[Haneoka](https://haneoka.org/) · [Browser story tutorial](../vega/)

`@haneoka/vega/host-resources` exports `HostStoryResourceResolver`, `StoryResourceResolver` and `StoryResourceLease`. This small entry runs in a Node or native host without browser I/O. It wraps the host you provide: that host chooses storage, caching, supported resource names and renderer-compatible URIs.

Engine integration is through **`engine.createPlayer({ resources })`**, a `VegaPlayerOptions` field. The same complete port reaches the renderer, ADV loader and UI. The supplied port remains owned by your application; player and Engine cleanup release their own leases. Engine's existing player presentation and default renderer require a browser DOM. This resource entry establishes the I/O boundary, rather than a complete native Engine distribution.

## 1. Build the source entry

The public package export is committed at Vega revision `dfb720d13cada667bd07072cb163942b6c70d0b3`. npm publication is pending. Use a source build or a matching local package; the existing hosted `embed/vega.js` is the browser embed facade and has its own options.

For a new local source checkout, install Node.js 22.13 or newer and make the Corepack command available before running the commands below. This source-build toolchain uses pnpm 11.14.0. Running the already-built resource example requires Node 20 or newer, as described in step 2.

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

The selected entry is `dist/host-resources.js`; its declaration entry is `dist/host-resources-entry.d.ts`. A workspace that links this source package can import `@haneoka/vega/host-resources` normally. Keep the emitted relative resource modules with the entry.

## 2. Run the complete local-file example

Save [host-resources.mjs](/examples/host-resources.mjs) and [garden.svg](/examples/garden.svg) beside each other. From that directory, run Node 20 or newer and pass the actual built entry path:

```sh
node host-resources.mjs ../vega/dist/host-resources.js ./garden.svg
```

Change the path if your checkout is elsewhere. With a linked package available to the script, the package import is the default:

```sh
node host-resources.mjs
```

The complete script maps `asset://my-story/background` to your local SVG. It reads encoded bytes, demonstrates an independent mutable copy and a shared read-only view, acquires two leases, cancels a read before it starts and closes the resource scope. Finally, it closes the underlying file host and clears that host's resident bytes. Its console records include the byte count, URI and matching acquisition/release counts.

The returned `asset://` URI is for a native renderer registered for your application's asset scheme. This example prints it; a renderer adapter gives that URI its display meaning. A browser host can instead create a Blob URL in `resolveRenderable` and revoke it in the corresponding release hook. URI selection belongs to the host.

## 3. Implement the complete host port

```ts
import {
  HostStoryResourceResolver,
  type StoryResourceResolver,
  type StoryResourceLease,
} from "@haneoka/vega/host-resources";

const resources = new HostStoryResourceResolver(host);
```

Here `host` implements the following complete contract. The downloadable script supplies every required method; an adapter containing only `load()` belongs to the older default resolver's adapter API.

| Method | Signature | Required and effect |
| --- | --- | --- |
| canLoad | `(source: string) => boolean` | Required, synchronous admission check. The host decides accepted schemes and keys. |
| load | `(source: string, signal?: AbortSignal) => Promise<Uint8Array>` | Required. Read encoded bytes and observe the supplied cancellation signal. |
| loadSharedBytes | `(source: string, signal?: AbortSignal) => Promise<Readonly<Uint8Array>>` | Optional fast path for trusted, immutable resident bytes. The consumer preserves this view. |
| retain | `(source: string, signal?: AbortSignal) => Promise<StoryResourceLease>` | Required. Acquire an encoded resource lease. The lease has `release(): void`. |
| resolveRenderable | `(source: string, signal?: AbortSignal) => Promise<{ readonly url: string; readonly release: () => void }>` | Required. Acquire a URI the selected renderer understands, with its release hook. |

The host owns any bytes, file handles, caches, protocol registry or decoded objects it allocates. It also cleans partial allocations when a read fails before returning a lease. In the example, `host.dispose()` is an application-defined method that clears its resident bytes; it is additional to `StoryResourceResolver`.

## All scope arguments, results and errors

The constructor is **`new HostStoryResourceResolver(host)`**. Its one required argument is a complete `StoryResourceResolver`. It introduces no default host, URL base, cache, byte limit or deadline; configure those policies in your host.

| Scope method | Arguments and result | Behavior |
| --- | --- | --- |
| canLoad | `source: string` → `boolean` | Delegates to the host while live; returns false after scope disposal. |
| load | `source: string, signal?: AbortSignal` → `Promise<Uint8Array>` | Returns a fresh owned copy of the host's bytes. Mutating that copy leaves the host's resident view intact. |
| loadSharedBytes | Same arguments → `Promise<Readonly<Uint8Array>>` | Returns the host's trusted view; falls back to `host.load` if the fast path is absent. No wrapper copy is made. The readonly type is a caller contract, not a runtime buffer freeze. |
| retain | Same arguments → `Promise<StoryResourceLease>` | Returns a lease with an idempotent `release()`. Release after the consumer finishes with the encoded resource. |
| resolveRenderable | Same arguments → `Promise<{ readonly url: string; readonly release: () => void }>` | Returns the host's URI unchanged and an idempotent release hook. Stop the renderer's use before releasing it. |
| dispose | No arguments → `void` | Marks the scope closed, aborts pending acquisitions and releases live leases. Repeated calls have no further effect. |

`source` passes through unchanged. The scope performs no path normalization, codec selection, HTTP request, Blob conversion or resource parsing. Unsupported sources reject asynchronous operations with `TypeError`. Host I/O failures retain their original errors.

The optional `signal` cancels **acquisition**. An already-aborted signal rejects with its reason before I/O; an in-flight abort is forwarded to the host and promptly rejects the operation. A successful lease stays live until its explicit `release()` or scope disposal, even if the acquisition signal later aborts.

The host should observe the forwarded signal. When a host returns a lease after cancellation, the wrapper releases that late handle. A late release failure goes to the diagnostic console; the original cancellation remains the operation result. After `dispose()`, asynchronous calls reject with an `AbortError`. Disposal attempts every current release and throws `AggregateError` if any fail. A release hook is invoked at most once, including when it throws.

## 4. Pass resources to Engine and close in ownership order

For an application using the Engine entry, this helper supplies the complete caller-owned port to a player. Its arguments are your actual mount element, `AdvStory` and resource scope:

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

`resources?: StoryResourceResolver` is a **player option**, not a `VegaEngineOptions` constructor field or an embed `mountStory` option. Omit it to retain the existing `DefaultStoryResourceResolver` and resource-plugin path. `HostStoryResourceResolver` is an available scope implementation; you can also supply another complete port.

Use [the complete story JSON](https://docs.haneoka.org/examples/dialogue.json) as an `AdvStory` starting point. Its format and browser loading steps are in the [story tutorial](../vega/). A host-specific renderer must accept the URI returned by your port; the default DOM renderer uses browser-renderable URLs.

| Owner | Cleanup responsibility |
| --- | --- |
| Player/Engine | Its loader, scene and UI leases. `await player.dispose()` removes that player; `await engine.dispose()` closes all its players and Engine-owned contributions. |
| Application | The injected resource scope. Close it after all its consumers have stopped. It may be shared by multiple players. |
| File/native host | Its own storage, resident caches, worker connections and partial allocations. Close it after the scopes that use it. |

The shutdown order is **await player/Engine cleanup → `resources.dispose()` → your `host.dispose()`**. Put the scope and host cleanup in nested `finally` blocks so a release error still allows later owners to close. Player construction failure cleans that player's acquisitions and leaves the caller's resource scope available. Closing one player preserves a scope shared by other players.
