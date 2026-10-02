# Haneoka docs

Independent Astro + Starlight documentation for the public `haneoka.org` API and standalone JavaScript embeds.

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

The build generates [`public/openapi.json`](./public/openapi.json) from the route and schema definitions in [`scripts/build-openapi.mjs`](./scripts/build-openapi.mjs), then emits a static site for `https://docs.haneoka.org`.

The consumer path starts with the current-data aliases: `GET /api/v1/songs`, `GET /api/v1/songs/100001`, and `GET /api/v1/events?server=jp`. The aliases use the current catalog for the default `intl` server; add `server=<slug>` for another active server. The same catalog handler is also available under `/api/v1/servers/{server}/{resource}` for applications that need explicit server and historical-release control.

The guides explain request shapes, response fields, media URLs, caching, errors, retries, authentication, and complete community workflows. Advanced pages cover release pinning, catalog storage, source trees, game-client delivery, Sonolus, and provider projections. Release-specific entity DTOs follow the current catalog manifest and the response returned for each resource.

The [embedding guides](https://docs.haneoka.org/embed/) cover portable data sources, Vega stories, Cassiopeia charts and Home Spot scenes, including local release artifacts, self-hosted ESM/CDN bundles, authored data and teardown. Official browser ESM modules are available under `https://haneoka.org/embed/`; npm registry publication remains pending. The Vega guide includes complete JSON and HTML starter files with no npm prerequisite.

## Published interfaces

- [Documentation](https://docs.haneoka.org/), including complete English and Simplified Chinese guides.
- [OpenAPI](https://docs.haneoka.org/openapi.json) for API client generators and HTTP tooling.
- [llms.txt](https://docs.haneoka.org/llms.txt) and [complete text](https://docs.haneoka.org/llms-full.txt) for automated consumers.

## First request

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
curl --fail-with-body 'https://haneoka.org/api/v1/events?server=jp'
```

The first request returns a resource index keyed by entity ID. The second returns the full song DTO. The third reads the same resource from the Japan server; an empty events document is a valid response when that server has no published game events.

Use the JSON keys and URLs returned by the service as inputs to later requests. Resource names, entity IDs, views, relations, and media paths are data-defined and can vary by server and current catalog.

## Publish

```sh
pnpm install --frozen-lockfile
pnpm deploy
```

The static output is served by the `haneoka-docs` Cloudflare Worker at `docs.haneoka.org`. The checked-in Wrangler configuration names the destination. GitHub Actions validates and builds each change; local publication uses the account authenticated in Wrangler.
