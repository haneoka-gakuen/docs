---
title: 数据源与资源加载
description: 从本站、内存、HTTP JSON 和本地文件加载独立宿主需要的数据。
---

`@haneoka/embed-core` 为剧情、谱面和场景宿主提供数据源、URL 解析、资源字节、进度与取消。它保留调用方的数据结构，渲染和播放由具体宿主负责。主入口没有运行时依赖，适合浏览器、Worker 和 Node.js；导入时不访问 DOM 或网络。

候选包安装与自行托管 ESM 的方法见 [JavaScript 嵌入](../)。本站适配器需要可选 peer `@haneoka/api-client`。

## 读取本站当前资料

```js
import { createEmbedLoader } from "@haneoka/embed-core";
import { haneokaDataSource } from "@haneoka/embed-core/haneoka";
const loader = createEmbedLoader({
  source: haneokaDataSource({ resource: "songs", id: "100070" }),
  server: "intl",
  locale: "en",
});
try {
  const song = await loader.load();
  const jacket = await loader.resourceUrl(song.jacketUrl);
  console.log(song.musicTitle, jacket);
} finally {
  await loader.dispose();
}
```

适配器请求 `/api/v1/{resource}/{id}?server={server}`；省略 `id` 读取索引，提供 `view` 读取相应投影。默认 server 为 `intl`，语言默认 `en` 并经 `Accept-Language` 协商，返回目录保留完整多语值。无需登录或 release ID。重复 `load()` 会重新请求当前数据。

`apiBase` 可以设置为另一个兼容服务的绝对 API 根地址，例如 `https://archive.example/api/v1/`。相对资源默认使用该服务 origin；loader 的 `assetsBase` 可以指定另一个资源目录。沿用响应中的素材路径，它们遵循服务当前快照语义。

## 自带内存、HTTP 或文件

```js
import { createEmbedLoader, memoryDataSource, httpDataSource } from "@haneoka/embed-core";
const authored = { language: "fr", title: "Une promenade", background: "背景/夕暮れ.png" };
const loader = createEmbedLoader({
  source: memoryDataSource(authored),
  locale: "fr",
  assetsBase: "https://cdn.example/projects/promenade/",
});
const data = await loader.load(); // 原对象，保留 identity 和字段。
console.log(await loader.resourceUrl(data.background));
await loader.dispose();

const remote = createEmbedLoader({
  source: httpDataSource({
    url: "https://author.example/projects/promenade/story.json",
    decode(value) {
      if (!value || typeof value !== "object" || !Array.isArray(value.lines)) {
        throw new TypeError("Expected lines");
      }
      return value;
    },
  }),
  locale: "fr",
});
try { console.log(await remote.load()); }
finally { await remote.dispose(); }
```

HTTP 相对资源基于配置的 JSON URL 目录，重定向不会改变这个基准。`assetsBase` 显式覆盖它。`decode` 负责运行时校验或转换；TypeScript 泛型只声明期望类型，不替代校验。最终数据必须符合所选宿主的文档格式。

```js
import { createEmbedLoader, fileDataSource, fileResourceResolver } from "@haneoka/embed-core";
const createLocalLoader = (jsonFile, backgroundFile) => createEmbedLoader({
  source: fileDataSource(jsonFile),
  resolveResource: fileResourceResolver(new Map([["背景/夕暮れ.png", backgroundFile]])),
  locale: "fr",
});
```

文件来自宿主文件选择器或桌面应用，类型为 `File`/`Blob`。本地 JSON 没有隐含网络目录，Map 按完整 Unicode key 匹配；缺失 key 会拒绝操作。loader 为同一 Blob 复用 URL，销毁时撤销自己创建的 URL。先销毁使用这些资源的播放器，再销毁 loader；调用方创建的 URL 由调用方回收。

## URL、传输与预算

`resourceUrl(key)` 解析 URL，不下载素材；`resourceBytes(key)` 解析并读取字节。`resolveResource(key, context)` 可异步返回 string、URL 或 Blob，context 含 server、locale、signal、fetcher 和 maxBytes。resolver 完全负责 key 映射。

相对路径使用 `assetsBase`，`/` 开头从其 origin 根解析，绝对地址保持自身 origin。base 应为绝对 HTTP(S) 目录，具体 query/fragment 放资源 URL。支持 HTTP、HTTPS、Blob 和 data URL；SSR 不会猜测当前页面地址。

```js
const loader = createEmbedLoader({
  source: memoryDataSource(authored),
  assetsBase: "https://cdn.example/project/",
  credentials: "omit",
  maxBytes: 64 * 1024 * 1024,
  fetcher: (request) => fetch(request),
});
```

fetcher 接收携带 signal、headers、credentials 和 CORS mode 的 `Request`。默认原生 fetch、omit；有 cookie 的服务可配置 same-origin/include，但跨域服务需显式允许宿主 origin 和凭据。把 URL 交给 image/audio/video 元素后，由该元素的加载器处理，未经过 loader fetcher。

预算默认每个 JSON 或字节请求 64 MiB。进度计算实际解码字节；未知或压缩响应长度不会虚报 total。内存加载和仅 URL 解析没有字节进度。

## 事件、取消、错误与销毁

```js
const controller = new AbortController();
const unsubscribe = loader.subscribe(event => {
  if (event.type === "progress") console.log(event.operation, event.key, event.loaded, event.total);
});
try { await loader.load({ signal: controller.signal }); }
finally { unsubscribe(); await loader.dispose(); }
```

每个操作依次产生 start、读取时的 progress，以及 ready/error/cancelled。`operation` 区分并发，`key` 为 `$data` 或资源键。HTTP 非成功状态使用 `EmbedHttpError` 并保留 status/url；本站错误保留 `ApiClientError`。JSON、decode、缺文件、超预算和传输失败均拒绝对应 Promise。观察者异常交给可选 `onListenerError`。

单次 signal 取消该操作；`cancel()` 取消当前全部操作，之后可以重试。`dispose()` 禁止新操作，取消在途请求，撤销 Blob URL，移除监听并只调用一次 source cleanup，其 Promise 等待 cleanup。并发请求各自独立，自动重试和数据缓存由调用方策略决定。

自定义 `DataSource<T>` 实现 `load(context)`，可提供 `assetsBase` 和 `dispose()`。使用 `context.signal` 停止自己的工作；loader 会抑制已取消操作的迟到结果。带 cleanup 的 source 按单一 loader 所有权使用。
