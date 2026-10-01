---
title: 类型化 JavaScript API 客户端
description: 用 Haneoka ESM 客户端读取当前实体、分页、批量与关联资料。
---

`@haneoka/api-client/haneoka` 提供 createHaneokaClient，主入口 createApiClient 保留通用 HTTP 能力。新增子入口随 API 更新准备发布，目前使用匹配的本地候选产物。支持浏览器/Node Fetch，也接受宿主 `transport(Request)`。

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
  if (error instanceof ApiClientError) console.error(error.code, error.status, error.requestId, error.retryable);
  else throw error;
}
// 请求期间取消：controller.abort()。
```

baseUrl 是 /api/v1/ 根。server 默认 intl，可从 servers() 的 id 读取；locale 为 ja/en/zh-TW/zh-CN/ko。返回 catalog 仍保留所有语言，自带文档的其他作者语言交给 [embed-core](../../embed/core/)。

## 分页、批量与 DTO

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

page 默认 limit50，验证 ID、页大小、cursor 与 snapshot identity；短页/空页仍可能继续。batch 接受 1–100 个输入 ID 并返回 items/missing。两者可用 manifest 声明的 view 参数。

index 读取完整索引，entity 读取一项，relation(resource,relation,key,scope) 读取关系；relation 不接受 view。都支持 signal 和 decode(value:unknown)，默认返回 JSON 类型，decode 校验并给出业务 DTO 类型。校验失败使用 invalid_payload。

release 只使用服务返回的 immutable ID；客户端自动切到 /servers/{server}/...，普通 alias 不支持 release。chartImageUrl 只构造当前图片 URL，不下载二进制：

```ts
const url = api.chartImageUrl("100070", "expert", {
  server: "intl", locale: "en", format: "svg", height: 720, download: false,
});
```

## 错误与传输

ApiClientError 保存 method/url/status/code/requestId/details/retryable。取消为 request_aborted 且不可重试，HTML/坏 JSON 错误页仍保留 HTTP status；成功响应的格式错误为 invalid_content_type、invalid_json 或 invalid_payload。客户端不自动重试。

构造时可提供 headers 或 transport，只向预期 origin 发送身份凭据。公开资料无需 session。图片 bytes 或 [排行接口](../records/) 的独立 error shape 可用通用客户端 response() 或原生 fetch。
