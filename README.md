# Haneoka API docs

Independent Astro + Starlight documentation for the public `haneoka.org` API.

```bash
pnpm install
pnpm dev
pnpm check
pnpm build
```

The build generates [`public/openapi.json`](./public/openapi.json) from the route and schema definitions in [`scripts/build-openapi.mjs`](./scripts/build-openapi.mjs), then emits a static site for `https://docs.haneoka.org`.

The docs cover the release registry, immutable resource-server contracts, catalog manifest/entity/view/relation/batch traversal, media and game-client delivery, Sonolus, transformed Bestdori routes, community/profile/upload APIs, and Better Auth. Release-specific entity DTOs follow the current catalog manifest and the response returned for each resource.

## Published interfaces

- [Documentation](https://docs.haneoka.org/), including complete English and Simplified Chinese guides.
- [OpenAPI](https://docs.haneoka.org/openapi.json) for API client generators and HTTP tooling.
- [llms.txt](https://docs.haneoka.org/llms.txt) and [complete text](https://docs.haneoka.org/llms-full.txt) for automated consumers.

## Publish

```sh
pnpm install --frozen-lockfile
pnpm deploy
```

The static output is served by the `haneoka-docs` Cloudflare Worker at `docs.haneoka.org`. The checked-in Wrangler configuration names the destination. GitHub Actions validates and builds each change; local publication uses the account authenticated in Wrangler.
