---
title: Haneoka API
description: Public HTTP APIs for haneoka.org resource servers, Sonolus, and community services.
template: splash
hero:
  title: Haneoka API
  tagline: Stable public contracts for resource archives and community integrations.
  actions:
    - text: Start with a request
      link: /quickstart/
      icon: right-arrow
    - text: OpenAPI
      link: /reference/openapi/
      icon: external
      variant: minimal
---

The public API is served from `https://haneoka.org`. Resource data is addressed by an active server slug and can be pinned to an immutable release. Catalog documents, media, game-client files, Sonolus projections, Bestdori projections, and community endpoints are separate surfaces with different caching and authentication rules.

## Choose an API surface

| You need | Start here |
| --- | --- |
| Discover active resource servers | [`GET /api/v1/releases`](./servers/releases/) |
| Read a release catalog | [Catalog API](./servers/catalog/) |
| Resolve catalog media | [Media and files](./servers/media/) |
| Download game-client manifests or bundles | [Game-client API](./servers/game-client/) |
| Integrate a Sonolus server | [Sonolus](./sonolus/) |
| Read or write community content | [Community API](./community/) |
| Sign in or manage an account | [Authentication](./auth/) |
| Use the transformed Garupa provider | [Bestdori](./providers/bestdori/) |

The complete machine-readable contract is [`openapi.json`](/openapi.json) in this repository. It covers the stable JSON and file endpoints documented here, including provider-shaped and binary responses with their route grammar and response media types.

## Current public surface

The public read surface includes release discovery, release-backed catalogs and files, Sonolus documents and data, Bestdori projections, and community reads. Account, profile, upload, and interaction routes are available where the request includes the required browser session.

## Language versions

English is the canonical documentation locale. The [简体中文版本](/zh-cn/) follows the same route and schema coverage.
