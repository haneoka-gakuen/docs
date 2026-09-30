---
title: 运营公告
description: 获取当前游戏公告、正文与图片。
---

公告接口直接读取所选服务器当前发布的游戏资讯。列表提供标题与发布时间，详情提供正文和图片；公告会独立刷新，调用方无需指定资源版本。

## 列出最新公告

```http
GET /api/v1/announcements?server=intl&limit=2
```

`server` 默认使用国际服 `intl`，日服填写 `jp`。`limit` 控制返回条数，范围为 1–100，默认 100。列表提供公告摘要，正文通过详情接口读取。

```json
{
  "server": "intl",
  "available": true,
  "fetchedAt": "2026-09-30T04:14:16.536328Z",
  "announcements": [
    {
      "id": 23,
      "category": 6,
      "title": "緊急維護公告",
      "startAt": 1790730300,
      "endAt": 1790751600,
      "updatedAt": 1790695244,
      "bodyImage": "https://haneoka.org/api/v1/announcements/media/intl/1aaf53f946ee62d677d1d8cb3b0e54ef6e7556ebe48af07bfeb76bd6f13851e3.jpg",
      "bodyImageWidth": 420,
      "bodyImageHeight": 180,
      "sourceLanguage": "zh-Hant"
    },
    {
      "id": 24,
      "category": 3,
      "title": "「由我主演的賽博之夜」轉蛋舉辦預告！",
      "startAt": 1790730000,
      "endAt": 1790751600,
      "updatedAt": 1790695246,
      "sourceLanguage": "zh-Hant"
    }
  ]
}
```

`startAt`、`endAt` 和 `updatedAt` 使用 Unix 秒时间戳。`fetchedAt` 以 UTC ISO-8601 格式记录这一批公告的获取时间。尚无公告数据的服务器返回 `available: false`、`fetchedAt: null` 和空数组。

## 读取一条公告

```http
GET /api/v1/announcements/23?server=intl
```

详情响应在同一对象中提供服务器、获取时间和完整公告：

```json
{
  "server": "intl",
  "available": true,
  "fetchedAt": "2026-09-30T04:14:16.536328Z",
  "id": 23,
  "category": 6,
  "title": "緊急維護公告",
  "startAt": 1790730300,
  "endAt": 1790751600,
  "updatedAt": 1790695244,
  "sourceLanguage": "zh-Hant",
  "html": "<p>…</p>"
}
```

`html` 保留公告正文的原始 HTML。网页展示时，先使用 DOMPurify 等成熟工具清理，再渲染正文；允许的标签、属性、链接协议与图片路径应明确配置。脚本、事件处理属性和危险链接需要移除。纯文本工具可以提取正文文字。

### 语言与渲染

`sourceLanguage` 根据公告标题和正文推断内容语言，使用 BCP 47 标签，如 `ja`、`zh-Hant`、`zh-Hans`、`ko` 或 `en`。将它设置为文章的 `lang`，可帮助字体选择合适的字形。公告保留服务器提供的文本，界面语言由调用方自行选择。缺少语言信息时，可用 `und` 标记。

### 图片与尺寸

`bodyImage` 是正文图片，`banner` 是公告横幅；二者均为可选的 HTTPS 地址。对应的宽、高字段记录原始像素尺寸。网页可据此预留空间，按原始比例缩放图片，避免加载后版式跳动。

正文内的 `<img src>` 同样使用本站图片接口。直接使用返回的地址与尺寸即可。

## 下载公告图片

```http
GET /api/v1/announcements/media/{server}/{fullhash}.{ext}
HEAD /api/v1/announcements/media/{server}/{fullhash}.{ext}
```

`fullhash` 是图片内容的 64 位小写 SHA-256 摘要。扩展名支持 `avif`、`gif`、`jpg`、`jpeg`、`png` 和 `webp`，响应会提供对应的图片类型。内容地址保持稳定并支持长期缓存；不存在的公告或图片返回 `404`。

乐曲、角色等资料仍可通过 `/api/v1/songs` 等[资料接口](../catalog/)读取。公告接口用于获取运营资讯。
