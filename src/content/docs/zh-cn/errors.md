---
title: 错误和重试
description: 读取结构化失败并选择安全的重试策略。
---

## 错误 body

Worker JSON API 使用以下 envelope 表示失败：

```json
{
  "error": {
    "code": "entity_not_found",
    "message": "Catalog entity not found",
    "requestId": "request-id-when-available"
  }
}
```

通用 release/catalog Worker 错误路径会返回 `requestId`。账户、社区和上传 handler 可能返回同样的 `{ error: { code, message } }` 结构而没有该字段。请始终先根据 HTTP status 分支，并将未知字段视为可选。

## 常见状态类别

| Status        | Meaning                                                           | Client action                                 |
| ------------- | ----------------------------------------------------------------- | --------------------------------------------- |
| `400`         | 查询、游标、路由或 JSON 格式错误                                  | 修正请求；不要原样重试。                      |
| `401`         | 需要会话                                                          | 登录，然后携带凭据重试。                      |
| `403`         | 同源、验证、账户或权限检查失败                                    | 修正浏览器/请求上下文，或向用户显示所需步骤。 |
| `404`         | server、release、resource、entity、view、relation 或 media 不存在 | 从当前视图移除项目，或刷新 registry。         |
| `409`         | 版本、幂等性或状态冲突                                            | 重新读取 resource，并对新版本应用操作。       |
| `413` / `415` | body 或 media type 超出合约                                       | 缩小或转换请求。                              |
| `422`         | body 字段或语义验证失败                                           | 修正被指出的字段。                            |
| `429`         | 达到速率限制或配额                                                | 在存在时遵守 `Retry-After`，并使用退避。      |
| `500`         | 意外的 Worker 失败                                                | 操作安全时使用退避重试。                      |
| `502`         | upstream、release object 或 provider projection 失败              | 使用退避重试；保留 request ID。               |
| `503`         | database、release、身份验证、storage 或 provider 不可用           | 操作安全时使用退避重试。                      |

对于幂等的公开 GET，`408`、`429` 和 `5xx` 适合使用指数退避。对于变更操作，只有在接口定义了幂等性或操作明确安全可重复时才重试。上传 intent 需要 `Idempotency-Key`；使用不同文件 metadata 重用同一键会返回 `409 idempotency_conflict`。

## 稳定的 endpoint 错误

路由页面列出了对调用方有用的验证代码。错误代码是稳定标识符，message 用于显示和诊断。未知错误代码必须作为不透明失败处理。
