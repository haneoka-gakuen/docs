---
title: 身份验证
description: 使用账户注册和 Better Auth 会话接口，同时避免暴露机密信息。
---

身份验证托管在 `https://haneoka.org/api/auth`。Worker 会代理下列受支持的 Better Auth 路由，并在 `/api/v1/account/register` 增加 Haneoka 的邮箱注册流程。

## 检查可用性

```http
GET /api/v1/account/config
```

示例：

```json
{
  "available": true,
  "emailDeliveryEnabled": true,
  "emailSignUpEnabled": true,
  "providers": ["github", "google"],
  "turnstileSiteKey": "public-site-key-or-null"
}
```

`providers` 列出已配置的社交提供商 ID。此响应绝不会包含 secrets、client secrets、auth keys 或 Turnstile secret keys。

## 使用邮箱注册

```http
POST /api/v1/account/register
Content-Type: application/json
X-Captcha-Response: <turnstile-token-when-enabled>

{ "email": "person@example.test" }
```

该路由要求同源请求，并且只接受 email 字段。请求成功时返回 `202`：

```json
{ "accepted": true }
```

对于已有地址和新地址，响应格式保持一致。如果启用了 Turnstile，请在 `X-Captcha-Response` 中发送浏览器挑战令牌；站点密钥来自配置接口。

## 会话及邮箱/密码路由

以下路由在 `/api/auth` 下受支持：

| Method        | Path                                | Auth      | Purpose                                             |
| ------------- | ----------------------------------- | --------- | --------------------------------------------------- |
| `GET`, `HEAD` | `/api/auth/get-session`             | Anonymous | 读取当前会话；没有 cookie 也是有效的匿名结果。      |
| `POST`        | `/api/auth/sign-in/email`           | Anonymous | 使用邮箱/密码登录。                                 |
| `POST`        | `/api/auth/sign-in/social`          | Anonymous | 开始已配置的社交登录。                              |
| `POST`        | `/api/auth/sign-out`                | Cookie    | 结束当前会话。                                      |
| `POST`        | `/api/auth/send-verification-email` | Cookie    | 在启用邮箱投递时请求验证邮件。                      |
| `GET`         | `/api/auth/verify-email`            | Token     | 使用邮箱验证链接。                                  |
| `POST`        | `/api/auth/request-password-reset`  | Anonymous | 请求密码重置邮件。                                  |
| `POST`        | `/api/auth/reset-password`          | Token     | 使用请求体或查询参数中的重置令牌设置新密码。        |
| `GET`         | `/api/auth/reset-password/{token}`  | Token     | 打开密码重置继续链接；不需要会话 cookie。           |
| `POST`        | `/api/auth/change-email`            | Cookie    | 请求修改邮箱。                                      |
| `POST`        | `/api/auth/change-password`         | Cookie    | 修改当前密码。                                      |
| `GET`         | `/api/auth/list-accounts`           | Cookie    | 列出关联账户。                                      |
| `POST`        | `/api/auth/link-social`             | Cookie    | 关联已配置的社交账户。                              |
| `POST`        | `/api/auth/unlink-account`          | Cookie    | 取消关联账户，需遵守账户策略。                      |
| `GET`         | `/api/auth/list-sessions`           | Cookie    | 列出活动会话。                                      |
| `POST`        | `/api/auth/revoke-session`          | Cookie    | 撤销一个会话。                                      |
| `POST`        | `/api/auth/revoke-sessions`         | Cookie    | 根据 Better Auth payload 撤销选定的会话或全部会话。 |
| `POST`        | `/api/auth/revoke-other-sessions`   | Cookie    | 撤销当前会话之外的会话。                            |
| `GET`, `POST` | `/api/auth/callback/{provider}`     | OAuth     | 完成已配置的提供商回调。                            |
| `GET`         | `/api/auth/error`                   | Anonymous | 返回身份验证错误响应。                              |
| `GET`         | `/api/auth/ok`                      | Anonymous | Better Auth 的健康检查/OK 响应。                    |

提供商回调只有在对应提供商已配置时才接受 `discord`、`github`、`google` 或 `twitter`。`providers` 中缺少的提供商不是当前部署支持的路由。

## 浏览器使用

账户变更请求应使用 `credentials: "include"`，并保持同源：

```ts
const response = await fetch("/api/auth/get-session", {
  credentials: "include",
  headers: { Accept: "application/json" },
});
```

身份验证响应的 `Cache-Control` 为 `no-store`。不要缓存会话 JSON，不要把 cookie 复制到日志中，也不要把 client secrets 放入前端代码。

## 错误及不可用功能

如果 Worker 缺少数据库或 32 字符的 auth secret，身份验证路由会返回 `503 auth_not_configured`。未配置邮箱投递时，纯邮箱路由会返回 `503`。注册可能返回：无效邮箱/请求体为 `400`，跨源或验证失败为 `403`，请求体过大为 `413`，非 JSON 请求体为 `415`，触发限流并带有 `Retry-After: 60` 时为 `429`。

Better Auth 可能会演进特定提供商的请求和响应字段。请使用所选操作的 Better Auth 路由文档中规定的 payload，并将额外响应字段视为可选；Haneoka Worker 合约保证上面的路由可用性以及 cookie/同源行为。
