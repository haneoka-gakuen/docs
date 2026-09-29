---
title: Haneoka API
description: 将乐曲、剧情、角色、活动、游戏资源与社区连接到你的应用。
template: splash
hero:
  title: 连接 Our Notes 的每一面
  tagline: 从乐曲与剧情，到角色、活动和社区。用统一的 HTTP 接口，让资料成为工具、创作和体验的起点。
  actions:
    - text: 开始接入
      link: /zh-cn/quickstart/
      icon: right-arrow
    - text: OpenAPI
      link: /zh-cn/reference/openapi/
      variant: minimal
---

Haneoka 提供资源目录、关联查询、媒体文件、Sonolus 与社区接口。资源请求支持固定版本：一次选定服务器与资源快照，随后读取的剧情、谱面和关联资料始终属于同一份数据。

## 选择你的入口

| 目标 | 文档 |
| --- | --- |
| 获取可用服务器与资源版本 | [服务器与版本](/zh-cn/servers/releases/) |
| 浏览乐曲、角色、卡牌、剧情与活动 | [资料目录](/zh-cn/servers/catalog/) |
| 查询关联数据与批量获取对象 | [目录视图与关联](/zh-cn/servers/catalog/) |
| 使用图片、音频、视频等资源 | [媒体与文件](/zh-cn/servers/media/) |
| 接入 Sonolus 关卡与歌单 | [Sonolus](/zh-cn/sonolus/) |
| 读取帖子、评论与用户资料 | [社区](/zh-cn/community/) |
| 上传媒体并发布内容 | [上传](/zh-cn/community/uploads/) |
| 使用 GBP 数据 | [Bestdori 接口](/zh-cn/providers/bestdori/) |

[下载 OpenAPI 描述](/openapi.json)，为你的语言生成客户端，或在接口工具中导入完整的路由、参数和响应定义。

## 从一份目录开始

先获取服务器列表，再读取该服务器的目录清单。清单会告诉你有哪些资源、可用视图和关联关系；按清单中的对象标识获取详情，继续沿关联读取相关内容。

公开资源接口支持跨域读取。社区写操作通过 Haneoka 的登录会话进行。每个接口页面分别说明版本、分页、认证和文件传输方式。
