---
title: Haneoka API
description: 读取 haneoka.org 上的当前乐曲、活动、剧情、角色、媒体和社区数据。
template: splash
hero:
  title: Haneoka API
  tagline: 用直接、清晰的 HTTP 请求读取当前游戏资料。
  actions:
    - text: 发出第一个请求
      link: /zh-cn/quickstart/
      icon: right-arrow
    - text: OpenAPI
      link: /zh-cn/reference/openapi/
      variant: minimal
---

Haneoka 在 `https://haneoka.org` 提供已发布的游戏资料目录和社区服务。使用 `songs`、`events`、`characters` 或 `stories` 等资源名称发出请求：

```bash
curl --fail-with-body https://haneoka.org/api/v1/songs
curl --fail-with-body https://haneoka.org/api/v1/songs/100001
curl --fail-with-body 'https://haneoka.org/api/v1/events?server=jp'
```

接口默认返回国际服当前资料。添加 `?server=jp` 即可读取日服的数据。

## 选择入口

| 目标 | 文档 |
| --- | --- |
| 浏览歌曲、乐队、卡牌、剧情或活动 | [资料目录](./servers/catalog/) |
| 下载 DTO 返回的图片、音频、视频或谱面 | [媒体与文件](./servers/media/) |
| 构建 Sonolus server 或 playlist | [Sonolus](./sonolus/) |
| 使用 Bestdori 格式的 Garupa 数据 | [Bestdori provider](./providers/bestdori/) |
| 读取或发布帖子与评论 | [社区](./community/) |
| 登录并管理资料 | [身份验证](./auth/) |
| 重现历史 catalog 或检查 storage | [高级服务器接口](./servers/releases/) |

## 响应的样子

资料索引以条目 ID 为键，每种资源提供对应的字段。歌曲包含 `musicId`、本地化标题 `musicTitle`、乐队 `bandId`、难度 `difficulty` 和媒体路径：

```json
{
  "100001": {
    "musicId": 100001,
    "musicTitle": ["迷星叫", "Mayoiuta", "迷星叫", "迷星叫", "헤매는 노래"],
    "bandId": 1,
    "bandName": ["MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!", "MyGO!!!!!"],
    "jacketUrl": "/assets/intl/Assets/AddressableResources/Image/Jacket/jkt_001_100001.png",
    "musicUrl": "/runtime/intl/cri/sound/musicscore/M_Mayoiuta/1_M_Mayoiuta.mp3"
  }
}
```

各资源的字段及数据结构见接口参考。媒体路径以 `https://haneoka.org` 为基准解析。

## 公开接口和登录接口

Catalog、media、Sonolus 和 Bestdori 的读取接口公开可用。社区写入、资料修改、偏好设置、上传和 Better Auth 操作使用浏览器 session 与同源请求。[约定](./conventions/) 说明缓存、headers、URL 编码和当前数据行为；[错误和重试](./errors/) 说明 status 处理。

[OpenAPI 文件](/openapi.json) 提供机器可读的路由和 schema contract。
