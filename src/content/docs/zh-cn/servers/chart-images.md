---
title: 谱面图片
description: 获取当前谱面的 SVG 或 PNG 概览并读取最终图片尺寸。
---

接口通过 Cassiopeia 静态概览 renderer 呈现已发布谱面。SVG 和已注册 PNG rasterizer 随 Worker 更新准备上线；PNG 部署同时包含匹配的 Fontsource 字体 manifest/文件。文档更新本身不会开启旧 Worker 的 PNG 能力。

```bash
curl --fail-with-body \
  'https://haneoka.org/api/v1/songs/100070/charts/expert/image.svg?server=intl&locale=en&height=720&download=1' \
  -o chart.svg
```

把后缀换成 png 得到 PNG。显式形式为 `/api/v1/servers/{server}/songs/{songId}/charts/{difficulty}/image.{format}`。两者固定读取当前资料，不接受 release。难度应来自歌曲 DTO 已公布的 difficulty。

| 参数 | 值 | 含义 |
| --- | --- | --- |
| server | 活动 slug，alias 默认 intl | 资料服务器 |
| difficulty | easy/normal/hard/expert/special/master | 路径参数，歌曲必须提供该难度 |
| locale | ja/en/zh-TW/zh-CN/ko | 图中文字，省略时协商 Accept-Language |
| height | 360–1440 整数，默认720 | 单个谱面段高度，不含页眉 |
| download | 1/0，默认1 | attachment 或 inline |
| format | svg/png | 文件后缀与 MIME |

重复或空参数返回400。输入和输出受渲染预算约束，超预算返回413。

## 尺寸与缓存

最终图片包含页眉和整曲所需段数；提高段高会影响段数及最终宽度。以 X-Haneoka-Image-Width/Height 为图片占位尺寸，与 SVG width/height 或 PNG IHDR 一致。height query 不是最终画布高度。

响应还包含 Content-Type、Content-Length、Content-Disposition、Content-Language、ETag、X-Haneoka-Server/Release-Id/Chart-Renderer。GET 返回图片，HEAD 只返回头，If-None-Match 可得到304且不带 Content-Length。公开端点支持匿名 CORS、OPTIONS204 和不支持方法的405/Allow。

```js
const url = "https://haneoka.org/api/v1/songs/100070/charts/expert/image.png?locale=en&download=0";
const response = await fetch(url, { credentials: "omit" });
if (!response.ok) {
  const failure = await response.json();
  throw new Error(`${response.status}: ${failure.error.code}`);
}
const width = Number(response.headers.get("X-Haneoka-Image-Width"));
const height = Number(response.headers.get("X-Haneoka-Image-Height"));
const imageUrl = URL.createObjectURL(await response.blob());
console.log(width, height, imageUrl);
// 给 img 设置宽高与 src，卸载时 URL.revokeObjectURL(imageUrl)。
```

## 错误恢复

错误为 error.code/message/requestId，带 X-Request-Id 和 no-store。参数错误400，歌曲/难度/谱面缺失404，格式406，输入/渲染预算413，光栅失败502，当前发布不可用503。具体 code 见 OpenAPI。PNG 字体缺失或无效为 chart_image_failed，字体预算超限为 chart_render_budget；未接 rasterizer 的部署可返回501 png_renderer_unavailable。保留 requestId，根据参数或部署原因修复后重试。
