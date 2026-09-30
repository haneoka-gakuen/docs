---
title: OpenAPI 参考
description: 下载并检查机器可读的公开 API contract。
---

生成的 OpenAPI 文件位于 [`/openapi.json`](/openapi.json)。每次 production build 前，构建脚本会根据路由和 schema 定义生成它。

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

文件包含当前数据 alias：

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

每个直接路由都有可选的 `server` query；省略时选择 `intl`。文件也描述显式 server-scoped 路由、release 固定、media 和 game-client 文件、Sonolus、community/profile/upload API、account configuration、Better Auth 路由以及 Bestdori projection。

当所选 resource 定义自己的字段时，Provider-shaped 和 catalog DTO 使用 `additionalProperties`。请阅读[Catalog 数据](../servers/catalog/)了解稳定 envelope 和字段语义，阅读[共享 schema](../reference/schemas/)了解错误、batch、时间戳和 media 值。
