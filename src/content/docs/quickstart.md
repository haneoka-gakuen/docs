---
title: Quickstart
description: Read current songs and regional data with curl or fetch.
---

## See a result in your browser

[Open the complete song reader](/examples/api-start.html), click **Read song list**, then choose a song. Its title, ID, band and cover appear; expand **Complete response** to inspect the JSON. The example reads public data with the hosted client and needs no npm installation.

To keep your own page, copy the complete code below into a plain-text editor and save it as UTF-8 **index.html** inside a folder named `my-api`. You can also save [the complete HTML](/examples/api-start.html) as that file. With Python 3 installed, open a terminal in this folder and run `python3 -m http.server 8000` (`py -m http.server 8000` on Windows), then open [http://localhost:8000/](http://localhost:8000/). If Python is missing, use the installation instructions on [Python.org](https://www.python.org/downloads/), or an existing editor's HTTP preview.

```text
my-api/
  index.html
```

Failures appear on the page. **Read song list** retries; **Cancel** stops the current read; **Clear** removes the list and image so you can start again.

<details>
<summary>Complete index.html — copy everything</summary>

```html
<!doctype html>
<html lang="en">
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Read songs with Haneoka</title>
<style>
body { max-width: 60rem; margin: auto; padding: 1rem; font: 1rem/1.5 sans-serif; color: CanvasText; background: Canvas; }
button { font: inherit; min-height: 48px; padding: .5rem 1rem; margin: .25rem; }
#songs { display: flex; flex-wrap: wrap; gap: .5rem; }
img { width: 240px; aspect-ratio: 1; object-fit: contain; } [hidden] { display: none !important; }
pre { overflow: auto; max-height: 25rem; }
</style>
<h1>Read songs with Haneoka</h1>
<p>The example shows the first eight list entries. Choose a song to see its title and cover.</p>
<button id="load">Read song list</button><button id="cancel" disabled>Cancel</button><button id="clear">Clear</button>
<p id="status" role="status" aria-live="polite">Press Read song list.</p>
<div id="songs" aria-label="Songs"></div>
<section id="detail" hidden><h2 id="title"></h2><img id="jacket" alt="Song cover" referrerpolicy="no-referrer"><p id="info"></p><a id="json" target="_blank" rel="noopener">Open complete song JSON</a><details><summary>Complete response</summary><pre id="output"></pre></details></section>
<script type="module">
const by = id => document.getElementById(id);
const origin = "https://haneoka.org";
const locale = "en", index = 1;
let api, controller, generation = 0;
const localize = value => Array.isArray(value) ? (value[index] || value.find(x => typeof x === "string" && x.trim()) || "Untitled") : String(value ?? "Untitled");
function clearDetail() { by("detail").hidden = true; by("jacket").removeAttribute("src"); by("json").removeAttribute("href"); by("output").textContent = ""; }
async function readSong(id) {
  const current = ++generation; controller?.abort(); controller = new AbortController(); clearDetail();
  by("load").disabled = true; by("cancel").disabled = false; by("status").textContent = "Reading song…";
  try {
    const song = await api.entity("songs", id, { server: "intl", locale, signal: controller.signal });
    if (current !== generation) return;
    by("title").textContent = localize(song.musicTitle);
    by("info").textContent = `ID ${song.musicId} · ${localize(song.bandName)}`;
    by("json").href = `${origin}/api/v1/songs/${encodeURIComponent(id)}?server=intl`;
    by("output").textContent = JSON.stringify(song, null, 2); by("detail").hidden = false;
    if (song.jacketUrl) { by("jacket").hidden = false; by("jacket").src = new URL(song.jacketUrl, origin).href; await by("jacket").decode(); }
    else by("jacket").hidden = true;
    if (current === generation) by("status").textContent = "Title and cover loaded.";
  } catch (error) { if (current === generation) by("status").textContent = `Read failed: ${error.message}`; }
  finally { if (current === generation) { by("load").disabled = false; by("cancel").disabled = true; } }
}
by("load").onclick = async () => {
  const current = ++generation; controller?.abort(); controller = new AbortController(); clearDetail(); by("songs").replaceChildren();
  by("load").disabled = true; by("cancel").disabled = false; by("status").textContent = "Reading list…";
  try {
    const { createHaneokaClient } = await import("https://haneoka.org/embed/api-client.js");
    if (current !== generation) return;
    api = createHaneokaClient({ transport: request => fetch(new Request(request, { referrerPolicy: "no-referrer" })) });
    const songs = await api.index("songs", { server: "intl", locale, signal: controller.signal });
    if (current !== generation) return;
    for (const [id, song] of Object.entries(songs).slice(0, 8)) {
      const button = document.createElement("button"); button.type = "button"; button.textContent = localize(song.musicTitle); button.dataset.songId = id;
      button.onclick = () => { void readSong(id); }; by("songs").append(button);
    }
    by("status").textContent = by("songs").childElementCount ? "Choose a song below." : "No songs returned.";
  } catch (error) { if (current === generation) by("status").textContent = `Read failed: ${error.message}`; }
  finally { if (current === generation) { by("load").disabled = false; by("cancel").disabled = true; } }
};
by("cancel").onclick = () => { generation++; controller?.abort(); by("load").disabled = false; by("cancel").disabled = true; by("status").textContent = "Cancelled. You can retry."; };
by("clear").onclick = () => { generation++; controller?.abort(); clearDetail(); by("songs").replaceChildren(); by("load").disabled = false; by("cancel").disabled = true; by("status").textContent = "Cleared. You can read the list again."; };
window.addEventListener("pagehide", () => { generation++; controller?.abort(); }, { once: true });
</script>
</html>
```

</details>

The steps below explain the URLs this page reads. Run shell examples in a terminal, or open the complete address in a browser to inspect JSON.

## 1. Read the current song index

The direct resource API selects the current `intl` catalog when `server` is omitted:

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
```

The response is an object whose keys are song IDs. Each value is the published song DTO. A current response has fields like these:

```json
{
  "100001": {
    "musicId": 100001,
    "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
    "bandId": 1,
    "bandIds": [1],
    "bandName": ["MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!"],
    "jacketThumbUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/small/jkt_001_100001.png",
    "jacketUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png",
    "musicUrl": "/runtime/intl/cri/sound/musicscore/M_Mayoiuta/1_M_Mayoiuta.mp3",
    "vocalCharacterIds": [1]
  }
}
```

Use a key returned by the index for the next request. Resource names and IDs come from the current catalog, so a client should discover them from responses or from the catalog manifest.

## 2. Read one song

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
```

The entity response contains the full resource DTO. For a song, that includes localized credits, publication dates, media URLs, and difficulty records. A difficulty record contains fields such as `difficultyName`, `displayLevel`, `noteCount`, `playLevel`, `sortLevel`, and the chart `file` path:

```json
{
  "musicId": 100001,
  "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
  "difficulty": [
    {
      "difficulty": 0,
      "difficultyName": "easy",
      "displayLevel": 9,
      "noteCount": 342,
      "playLevel": 9,
      "sortLevel": 9,
      "file": "/assets/intl/Assets/AddressableResources/Live/MusicScore/0001/0001_00.bytes"
    }
  ]
}
```

Keep localized arrays in their returned order. The order is ja, en, zh-TW, zh-CN, ko. Choose the matching position and fall back to an available string when that entry is null or empty.

## 3. Select another server

Add `server` to the same URL when you need another active server:

```bash
curl --fail-with-body 'https://haneoka.org/api/v1/events?server=jp'
curl --fail-with-body 'https://haneoka.org/api/v1/songs/100001?server=jp'
```

An events response can be empty while remaining successful:

```json
{
  "entries": {},
  "hasGameEvents": false
}
```

Get the available `server` slugs from the [current server list](https://haneoka.org/api/v1/releases); availability can change with a release. Read [`GET /api/v1/releases`](/servers/releases/) when a user needs the active slug list or its display names. Most applications can keep using the default `intl` server and omit this parameter.

## 4. Batch IDs

Repeat `id` to fetch several entities in one request:

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs?id=100001&id=100002'
```

The batch response has an `items` map and a `missing` array:

```json
{
  "items": {
    "100001": { "musicId": 100001, "musicTitle": ["迷星叫", "Mayoiuta"] }
  },
  "missing": ["100002"]
}
```

Treat `missing` as per-ID information. The request itself succeeded; retrying the same missing ID will not create it.

## 5. Use fetch in an application

```js
const api = new URL("https://haneoka.org/api/v1/songs");
api.searchParams.set("server", "jp");

const response = await fetch(api);
if (!response.ok) {
  const detail = await response.json().catch(() => ({}));
  throw new Error(`${response.status}: ${detail.error?.code ?? "request_failed"}`);
}

const songs = await response.json();
console.log(songs["100001"]?.musicTitle[1] ?? "Untitled");
```

Resolve relative media paths against `https://haneoka.org` and preserve `ETag` when you cache responses. The API returns JSON for catalog data and the media type declared by a file route for binary content.
