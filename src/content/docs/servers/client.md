---
title: Typed JavaScript API client
description: Read latest entities, pages, batches and relations with the Haneoka-specific ESM client.
---

`@haneoka/api-client/haneoka` provides `createHaneokaClient` for the resource API. The root `createApiClient` stays a general HTTP client for your own services. The new Haneoka entry is prepared with the API update; use its matching local artifact until that entry is published. It works with browser/Node Fetch or a supplied `transport(Request)`.

## Read and cancel

```ts
import { createHaneokaClient } from "@haneoka/api-client/haneoka";
import { ApiClientError } from "@haneoka/api-client";

const api = createHaneokaClient({ baseUrl: "https://haneoka.org/api/v1/" });
const controller = new AbortController();
try {
  const servers = await api.servers({ signal: controller.signal });
  const song = await api.entity("songs", "100070", {
    server: "intl", locale: "en", signal: controller.signal,
  });
  console.log(servers, song);
} catch (error) {
  if (error instanceof ApiClientError) {
    console.error(error.code, error.status, error.requestId, error.retryable);
  } else throw error;
}
// Cancel a pending call: controller.abort().
```

`baseUrl` is the `/api/v1/` root. `server` defaults to `intl` and comes from `servers()`; `locale` accepts `ja`, `en`, `zh-TW`, `zh-CN`, or `ko`. Catalog values keep all supplied languages. Authored embed documents can use other locales through [embed-core](../../embed/core/).

## Pages and batches

```ts
let cursor: string | undefined;
do {
  const page = await api.page("songs", { server: "intl", limit: 20, ...(cursor ? { cursor } : {}) });
  for (const entry of page.items) console.log(entry.id, entry.value);
  cursor = page.nextCursor ?? undefined;
} while (cursor !== undefined);

const batch = await api.batch("songs", ["100001", "100070"], { server: "intl" });
console.log(batch.items, batch.missing);
```

`page` defaults to limit 50 and validates item IDs, limit, cursor and snapshot identity. Short or empty pages can still continue. Batch accepts 1–100 submitted IDs and validates its envelope. Both can select `view` using a name declared in the manifest.

`index(resource, scope)` reads the complete provider index; `entity(resource,id,scope)` reads one entry; `relation(resource,relation,key,scope)` reads the manifest-defined relation. Relations do not accept a view. Each supports `signal` and a `decode(value: unknown)` callback. The default result is a JSON value; a decoder performs runtime validation and gives your business DTO type.

```ts
const song = await api.entity("songs", "100070", {
  decode(value) {
    if (!value || typeof value !== "object" || !("musicId" in value)) {
      throw new TypeError("Expected a song");
    }
    return value;
  },
});
```

Pass `release` only for a recorded immutable catalog ID. The client switches to `/servers/{server}/...` automatically. Ordinary direct aliases reject a release query. `chartImageUrl()` constructs a current-data image address; it does not fetch or decode binary content:

```ts
const url = api.chartImageUrl("100070", "expert", {
  server: "intl", locale: "en", format: "svg", height: 720, download: false,
});
```

## Errors and transport

`ApiClientError` preserves method, URL, status, code, optional requestId, details and retryability. Aborted requests use `request_aborted` and are not retryable. HTTP gateway failures retain their status even with an HTML or malformed error body. Successful invalid JSON/schema responses report `invalid_content_type`, `invalid_json` or `invalid_payload`. The client does not retry automatically.

Supply `headers` at construction or a custom `transport(request)` for your host. Ensure any authentication headers reach only their intended origin. Public catalog reads need no session. Use raw `response()` on the general client when you need image bytes or endpoint-specific error shapes such as [game records](../records/).
