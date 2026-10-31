---
title: 身份驗證
description: 使用帳號註冊和 Better Auth 會話介面，同時避免暴露機密資訊。
---

身份驗證託管在 `https://haneoka.org/api/auth`。Worker 會代理下列受支援的 Better Auth 路由，並在 `/api/v1/account/register` 增加 Haneoka 的郵箱註冊流程。

## 檢查可用性

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

`providers` 列出已配置的社交提供商 ID。此回應絕不會包含 secrets、client secrets、auth keys 或 Turnstile secret keys。

## 使用郵箱註冊

```http
POST /api/v1/account/register
Content-Type: application/json
X-Captcha-Response: <turnstile-token-when-enabled>

{ "email": "person@example.test" }
```

該路由要求同源請求，並且只接受 email 欄位。請求成功時返回 `202`：

```json
{ "accepted": true }
```

對於已有地址和新地址，回應格式保持一致。如果啟用了 Turnstile，請在 `X-Captcha-Response` 中傳送瀏覽器挑戰令牌；站點金鑰來自配置介面。

## 會話及郵箱/密碼路由

以下路由在 `/api/auth` 下受支援：

| Method        | Path                                | Auth      | Purpose                                             |
| ------------- | ----------------------------------- | --------- | --------------------------------------------------- |
| `GET`, `HEAD` | `/api/auth/get-session`             | Anonymous | 讀取當前會話；沒有 cookie 也是有效的匿名結果。      |
| `POST`        | `/api/auth/sign-in/email`           | Anonymous | 使用郵箱/密碼登入。                                 |
| `POST`        | `/api/auth/sign-in/social`          | Anonymous | 開始已配置的社交登入。                              |
| `POST`        | `/api/auth/sign-out`                | Cookie    | 結束當前會話。                                      |
| `POST`        | `/api/auth/send-verification-email` | Cookie    | 在啟用郵箱投遞時請求驗證郵件。                      |
| `GET`         | `/api/auth/verify-email`            | Token     | 使用郵箱驗證連結。                                  |
| `POST`        | `/api/auth/request-password-reset`  | Anonymous | 請求密碼重置郵件。                                  |
| `POST`        | `/api/auth/reset-password`          | Token     | 使用請求體或查詢引數中的重置令牌設定新密碼。        |
| `GET`         | `/api/auth/reset-password/{token}`  | Token     | 開啟密碼重置繼續連結；不需要會話 cookie。           |
| `POST`        | `/api/auth/change-email`            | Cookie    | 請求修改郵箱。                                      |
| `POST`        | `/api/auth/change-password`         | Cookie    | 修改當前密碼。                                      |
| `GET`         | `/api/auth/list-accounts`           | Cookie    | 列出關聯帳號。                                      |
| `POST`        | `/api/auth/link-social`             | Cookie    | 關聯已配置的社交帳號。                              |
| `POST`        | `/api/auth/unlink-account`          | Cookie    | 取消關聯帳號，需遵守帳號策略。                      |
| `GET`         | `/api/auth/list-sessions`           | Cookie    | 列出活動會話。                                      |
| `POST`        | `/api/auth/revoke-session`          | Cookie    | 撤銷一個會話。                                      |
| `POST`        | `/api/auth/revoke-sessions`         | Cookie    | 根據 Better Auth payload 撤銷選定的會話或全部會話。 |
| `POST`        | `/api/auth/revoke-other-sessions`   | Cookie    | 撤銷當前會話之外的會話。                            |
| `GET`, `POST` | `/api/auth/callback/{provider}`     | OAuth     | 完成已配置的提供商回撥。                            |
| `GET`         | `/api/auth/error`                   | Anonymous | 返回身份驗證錯誤回應。                              |
| `GET`         | `/api/auth/ok`                      | Anonymous | Better Auth 的健康檢查/OK 回應。                    |

提供商回撥只有在對應提供商已配置時才接受 `discord`、`github`、`google` 或 `twitter`。`providers` 中缺少的提供商不是當前部署支援的路由。

## 瀏覽器使用

帳號變更請求應使用 `credentials: "include"`，並保持同源：

```ts
const response = await fetch("/api/auth/get-session", {
  credentials: "include",
  headers: { Accept: "application/json" },
});
```

身份驗證回應的 `Cache-Control` 為 `no-store`。不要快取會話 JSON，不要把 cookie 複製到日誌中，也不要把 client secrets 放入前端程式碼。

## 錯誤及不可用功能

如果 Worker 缺少資料庫或 32 字元的 auth secret，身份驗證路由會返回 `503 auth_not_configured`。未配置郵箱投遞時，純郵箱路由會返回 `503`。註冊可能返回：無效郵箱/請求體為 `400`，跨源或驗證失敗為 `403`，請求體過大為 `413`，非 JSON 請求體為 `415`，觸發限流並帶有 `Retry-After: 60` 時為 `429`。

Better Auth 可能會演進特定提供商的請求和回應欄位。請使用所選操作的 Better Auth 路由檔案中規定的 payload，並將額外回應欄位視為可選；Haneoka Worker 合約保證上面的路由可用性以及 cookie/同源行為。
