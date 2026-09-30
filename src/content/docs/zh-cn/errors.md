---
title: 错误和重试
description: 读取结构化失败并选择安全的重试策略。
---

## 错误响应

JSON API 失败使用以下 envelope：

```json
{
  "error": {
    "code": "entity_not_found",
    "message": "Catalog entity not found",
    "requestId": "request-id-when-available"
  }
}
```

根据 HTTP status 和稳定的 `code` 分支。`message` 适合开发者和日志，可随服务改进而更具体；`requestId` 是可选字段，报告服务故障时请保留。

## Status 指南

| Status | 含义 | 调用方操作 |
| --- | --- | --- |
| `400` | query、路由值、JSON 或 batch ID 无效 | 修正请求后再发送。 |
| `401` | 需要 session | 登录并携带浏览器凭据。 |
| `403` | origin、验证、账户或权限检查失败 | 修正请求上下文，或向用户显示所需操作。 |
| `404` | server、resource、entity、view、relation 或文件不存在 | 刷新 catalog 或移除缺失项目。 |
| `409` | 版本、幂等性或状态冲突 | 重新读取 resource，再基于最新版本修改。 |
| `413` / `415` | body 过大或 media type 不支持 | 缩小 body 或使用声明的 content type。 |
| `422` | body 字段验证失败 | 修正响应指出的字段。 |
| `429` | 达到速率限制或配额 | 遵守 `Retry-After`，并使用退避。 |
| `500` | Worker 意外失败 | 对幂等读取使用退避重试。 |
| `502` | upstream 或 provider projection 失败 | 退避后重试，并保留 `X-Request-Id`。 |
| `503` | database、catalog、identity 或 storage 不可用 | 对安全读取使用退避重试。 |

未知 error code 按不透明失败处理；用 status 类别决定用户界面行为。

## 重试策略

网络失败、`408`、`429` 和临时 `5xx` 后，`GET` 与 `HEAD` 可以安全重试。使用带 jitter 的指数退避，遵守 `Retry-After`，并限制尝试次数。重试 current alias 时重新读取当前 catalog，因为重试成功时 catalog 可能已经更新。

Mutation 需要接口专属规则。只有接口定义了幂等性或操作明确可重复时才重试。Upload intent 要求 `Idempotency-Key`；使用同一个 key 发送不同 metadata 会返回 `409 idempotency_conflict`。

## 常见 catalog 失败

- `route_not_found`：顶层路径不是公开 API 路由。
- `server_not_found`：`server` query 值不是活动 server。
- `resource_not_found`：所选 catalog 没有该 resource。
- `entity_not_found`：resource 存在，但请求的 ID 不存在。
- `view_not_found` 或 `relation_not_found`：manifest 没有声明该 view 或 relation。
- `release_not_found`：高级显式请求使用了不可用的 release ID。

直接 alias 使用当前数据，不需要 release ID。需要固定历史 catalog 时，请阅读[高级服务器接口](./servers/releases/)。
