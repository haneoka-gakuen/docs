---
title: OpenAPI 参考
description: 下载并验证机器可读的公开 API 合约。
---

生成的 OpenAPI 文档可从 [`/openapi.json`](/openapi.json) 获取。每次生产构建前，它都会由 `scripts/build-openapi.mjs` 中的路由和 schema 定义生成。

该文档使用 OpenAPI 3.1，覆盖当前公开 Worker 路径：release registry 和不可变 release 固定、catalog resources/views/relations/batches、media 和 game-client files、Sonolus、community/profile/upload API、account configuration/registration、Better Auth 路由可用性，以及转换后的 Bestdori provider。

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

OpenAPI 文件对 provider-shaped 和 release-specific JSON 使用 `additionalProperties`。稳定的 envelope 和路由语义请参阅 [Catalog API](../servers/catalog/) 与 [Schemas](../reference/schemas/)。
