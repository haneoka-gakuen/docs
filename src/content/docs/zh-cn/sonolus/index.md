---
title: Sonolus API
description: 在 Sonolus 中打开 Haneoka，获取谱面、歌单与演出资源。
---

在 Sonolus 中添加服务器 **`https://haneoka.org`**，也可以[直接在客户端打开](https://open.sonolus.com/haneoka.org)。客户端请求接口时会自行追加 `/sonolus`。条目中的 `source` 同样使用这一服务器地址。

服务提供 Our Notes 与 GBP 谱面、按歌曲整理的歌单、音符皮肤、背景、音效、原生粒子特效及演奏引擎。公开接口支持 `GET` 和 `HEAD`，JSON 响应带有 `Sonolus-Version` 标头。

## 服务器信息

```http
GET /sonolus/info
```

响应提供标题、入口分区、设置与横幅。资源描述中会给出下载地址，直接使用返回的地址读取文件即可。

## 谱面

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

列表每页 20 个条目，页码从零开始。关卡名称标明本站、游戏服务器、歌曲与难度：

```text
haneoka-jp-100109-expert
haneoka-intl-100109-expert
haneoka-gbp-1234-expert
```

请求时使用列表返回的完整名称。游戏数据更新后，名称保持稳定。客户端显示编号时会自动添加 `#`，因此 API 的 `name` 不带井号。构造请求地址时，对完整名称使用 URL 路径编码即可。

```http
GET /sonolus/levels/haneoka-jp-100109-expert
```

每个关卡提供引擎、演出资源、封面、音频与谱面数据。`data` 对象包含压缩谱面的地址和 40 位 SHA-1 摘要；直接读取这个地址即可。摘要用于标识内容，文件可长期缓存。

在 `/sonolus/levels/info` 或 `/sonolus/levels/list` 后添加 `?type=random`，可以获取随机谱面。

## 歌曲歌单

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

歌单按歌曲整理各个难度，并提供完整关卡条目。`haneoka-jp-100109`、`haneoka-gbp-1234` 等名称保留来源信息。歌单名称的 URL 编码方式与关卡相同。

## 演出资源

```http
GET /sonolus/skins/list
GET /sonolus/backgrounds/list
GET /sonolus/effects/list
GET /sonolus/particles/list
GET /sonolus/engines/list
```

这些列表提供可选条目和文件地址。音符皮肤与粒子特效的缩略图展示实际资源；纹理、音频和引擎数据均通过返回的资源地址下载。

## 客户端语言

显示文本可以使用 Sonolus 1.1.3 及以上版本支持的 `##LOCALIZE`：

```text
##LOCALIZE:{"en":"Song","ja":"曲","zhs":"歌曲","zht":"歌曲","ko":"노래"}
```

客户端按当前语言选择文本，收藏中的条目也可随语言切换。缺少对应翻译时，采用对象中的第一个语言。其他工具展示这些字段时，可解析 `##LOCALIZE:` 后面的 JSON，选择所需语言并使用同样的回退顺序。简体中文键为 `zhs`，繁体中文键为 `zht`。

`localization` 参数可指定服务器标签优先采用的回退语言。条目名称、`source`、资源地址与摘要保持原值。

## GBP 曲库

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

这个来源参数选择 GBP 曲库，返回的关卡和歌单名称使用 `haneoka-gbp-` 前缀。需要歌曲、角色等资料来制作其他界面时，可读取[GBP 资料接口](../providers/bestdori/)。

## 响应状态

不存在的名称返回 `404`，正文为 `{ "message": "Not found" }`。暂时无法读取曲库时返回 `503`，正文为 `{ "message": "Service unavailable" }`。这些公开读取接口无需账号会话；`Sonolus-Session` 可作为协议标头发送。
