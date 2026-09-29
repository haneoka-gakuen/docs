---
title: Game-client API
description: Read the release-backed game-client manifest, Master files, and Addressables.
---

The game-client API exposes files from the active server release. Read the manifest first, then request filenames listed by the manifest or Addressables index.

## Manifest

```http
GET /game-client/{server}/manifest.json
HEAD /game-client/{server}/manifest.json
```

The stable envelope includes:

```json
{
  "schema": "haneoka-game-client-v1",
  "server": "jp-cbt",
  "sourceId": "garupa-jp-2026-09",
  "master": { "systemVersion": "example-system-version" },
  "addressables": {
    "platform": "Android",
    "catalogFile": "catalog.json",
    "catalogHashFile": "catalog.hash",
    "embeddedCatalogFile": "catalog.embedded.json",
    "index": {
      "algorithm": "fnv1a32-mod-256",
      "shards": 256,
      "prefix": "addressables/index/"
    }
  }
}
```

The server returns `X-Haneoka-Release-Id` and `X-Haneoka-Source-Id`. The manifest follows the current pointer and is short-lived.

## Master files

```http
GET /game-client/{server}/master/MasterDataSystemVersion.txt
GET /game-client/{server}/master/{filename}
HEAD /game-client/{server}/master/{filename}
```

The version file is text. Other supported master files follow the `Master*.bin` filename grammar and are returned as binary data. The filename must be obtained from the release manifest or a documented client contract.

## Addressables

```http
GET /game-client/{server}/asset/{platform}/{filename}
HEAD /game-client/{server}/asset/{platform}/{filename}
```

The platform must equal `addressables.platform` from the manifest. The server resolves a 256-way release index shard and serves the content-addressed object. Catalog files are current-release objects; Unity bundles and catalog payloads may be cached as immutable content when their index role permits it.

Addressables responses are binary and include release headers. A missing platform, filename, or index entry returns `404`; an index/object integrity failure returns `502`.
Game-client file responses expose `ETag` and accept single byte ranges, returning `206` for a satisfiable range and `416` with `Content-Range: bytes */<size>` for an invalid range.

## Practical sequence

1. Fetch `manifest.json`.
2. Confirm the `platform` and catalog filenames.
3. Fetch the catalog file and hash file through `/asset/{platform}/{filename}`.
4. Resolve additional filenames from the client catalog or published index.
5. Cache according to the response headers and retain the release ID with your local index.
