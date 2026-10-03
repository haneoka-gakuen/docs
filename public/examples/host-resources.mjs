import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import assert from "node:assert/strict";

const entry = process.argv[2] ?? "@haneoka/vega/host-resources";
const specifier = entry.startsWith("@") ? entry : pathToFileURL(resolve(entry)).href;
const { HostStoryResourceResolver } = await import(specifier);
const file = resolve(process.argv[3] ?? "garden.svg");
const source = "asset://my-story/background";
const resident = new Map();
let hostClosed = false, acquired = 0, released = 0;

function check(key, signal) {
  signal?.throwIfAborted();
  if (hostClosed) throw new Error("The file host is closed");
  if (key !== source) throw new TypeError(`Unknown resource: ${key}`);
}
async function shared(key, signal) {
  check(key, signal);
  if (!resident.has(key)) {
    const bytes = new Uint8Array(await readFile(file, { signal }));
    check(key, signal);
    resident.set(key, bytes);
  }
  return resident.get(key);
}
function acquire() {
  acquired++;
  let live = true;
  return { release() { if (live) { live = false; released++; } } };
}
const host = {
  canLoad: key => !hostClosed && key === source,
  async load(key, signal) { return Uint8Array.from(await shared(key, signal)); },
  loadSharedBytes: shared,
  async retain(key, signal) { await shared(key, signal); return acquire(); },
  async resolveRenderable(key, signal) {
    await shared(key, signal);
    // A native renderer registered for this application's asset scheme uses this key.
    const lease = acquire();
    return { url: key, release: () => lease.release() };
  },
  dispose() { hostClosed = true; resident.clear(); },
};

const resources = new HostStoryResourceResolver(host);
try {
  const owned = await resources.load(source);
  const view = await resources.loadSharedBytes(source);
  assert.notEqual(owned, view);
  const original = view[0];
  owned[0] ^= 255;
  assert.equal(view[0], original);

  const encodedLease = await resources.retain(source);
  const renderable = await resources.resolveRenderable(source);
  encodedLease.release();
  encodedLease.release();
  assert.equal(released, 1);

  const cancel = new AbortController();
  cancel.abort(new Error("Cancelled before file read"));
  await assert.rejects(resources.load(source, cancel.signal), /Cancelled before file read/);

  console.log(JSON.stringify({ source, bytes: view.byteLength, uri: renderable.url, hostResidentFiles: resident.size }));
  // End the renderer's use before releasing its URI lease.
  renderable.release();
  resources.dispose();
  assert.equal(acquired, released);
  assert.equal(hostClosed, false);
  console.log(JSON.stringify({ acquired, released, resourceScopeClosed: true, hostStillOwnedByCaller: true }));
} finally {
  // In an Engine integration, await player/engine disposal before closing this scope.
  try { resources.dispose(); } finally { host.dispose(); }
}
assert.equal(resident.size, 0);
console.log(JSON.stringify({ hostClosed, hostResidentFiles: resident.size }));
