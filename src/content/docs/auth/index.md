---
title: Authentication
description: Use account registration and Better Auth session endpoints without exposing secrets.
---

Authentication is hosted at `https://haneoka.org/api/auth`. The worker delegates the supported Better Auth routes below and adds Haneoka's email-registration flow at `/api/v1/account/register`.

## Check availability

```http
GET /api/v1/account/config
```

Example:

```json
{
  "available": true,
  "emailDeliveryEnabled": true,
  "emailSignUpEnabled": true,
  "providers": ["github", "google"],
  "turnstileSiteKey": "public-site-key-or-null"
}
```

`providers` lists configured social provider IDs. Secrets, client secrets, auth keys, and Turnstile secret keys are never part of this response.

## Register with email

```http
POST /api/v1/account/register
Content-Type: application/json
X-Captcha-Response: <turnstile-token-when-enabled>

{ "email": "person@example.test" }
```

The route is same-origin and accepts only an email field. A successful request returns `202`:

```json
{ "accepted": true }
```

The response is uniform for existing and new addresses. If Turnstile is enabled, send the browser challenge token in `X-Captcha-Response`; the site key comes from the config endpoint.

## Session and email/password routes

The following routes are supported under `/api/auth`:

| Method        | Path                                | Auth      | Purpose                                                                 |
| ------------- | ----------------------------------- | --------- | ----------------------------------------------------------------------- |
| `GET`, `HEAD` | `/api/auth/get-session`             | Anonymous | Read the current session; an absent cookie is a valid anonymous result. |
| `POST`        | `/api/auth/sign-in/email`           | Anonymous | Sign in with email/password.                                            |
| `POST`        | `/api/auth/sign-in/social`          | Anonymous | Start a configured social sign-in.                                      |
| `POST`        | `/api/auth/sign-out`                | Cookie    | End the current session.                                                |
| `POST`        | `/api/auth/send-verification-email` | Cookie    | Request a verification email when email delivery is enabled.            |
| `GET`         | `/api/auth/verify-email`            | Token     | Consume an email verification link.                                     |
| `POST`        | `/api/auth/request-password-reset`  | Anonymous | Request a reset email.                                                  |
| `POST`        | `/api/auth/reset-password`          | Token     | Set a new password with the reset token in the body or query.           |
| `GET`         | `/api/auth/reset-password/{token}`  | Token     | Open a password reset continuation link; no session cookie is required. |
| `POST`        | `/api/auth/change-email`            | Cookie    | Request an email change.                                                |
| `POST`        | `/api/auth/change-password`         | Cookie    | Change the current password.                                            |
| `GET`         | `/api/auth/list-accounts`           | Cookie    | List linked accounts.                                                   |
| `POST`        | `/api/auth/link-social`             | Cookie    | Link a configured social account.                                       |
| `POST`        | `/api/auth/unlink-account`          | Cookie    | Unlink an account, subject to account policy.                           |
| `GET`         | `/api/auth/list-sessions`           | Cookie    | List active sessions.                                                   |
| `POST`        | `/api/auth/revoke-session`          | Cookie    | Revoke one session.                                                     |
| `POST`        | `/api/auth/revoke-sessions`         | Cookie    | Revoke selected/all sessions per Better Auth payload.                   |
| `POST`        | `/api/auth/revoke-other-sessions`   | Cookie    | Revoke sessions other than the current one.                             |
| `GET`, `POST` | `/api/auth/callback/{provider}`     | OAuth     | Complete a configured provider callback.                                |
| `GET`         | `/api/auth/error`                   | Anonymous | Render an auth error response.                                          |
| `GET`         | `/api/auth/ok`                      | Anonymous | Health/OK response from Better Auth.                                    |

The provider callback only accepts `discord`, `github`, `google`, or `twitter` when that provider is configured. A provider missing from `providers` is not a supported route for the current deployment.

## Browser usage

Use `credentials: "include"` and keep the origin same-origin for account mutations:

```ts
const response = await fetch("/api/auth/get-session", {
  credentials: "include",
  headers: { Accept: "application/json" },
});
```

Authentication responses are `Cache-Control: no-store`. Do not cache session JSON, copy cookies into logs, or place client secrets in frontend code.

## Errors and unavailable features

If the worker lacks a database or a 32-character auth secret, auth routes return `503 auth_not_configured`. Email-only routes return `503` when delivery is not configured. Registration can return `400` for invalid email/body, `403` for cross-origin or failed verification, `413` for an oversized body, `415` for a non-JSON body, or `429` with `Retry-After: 60` when rate-limited.

Better Auth may evolve provider-specific request and response fields. Use the Better Auth route's documented payload for the selected operation and treat additional response fields as optional; the Haneoka worker contract guarantees the route availability and cookie/same-origin behavior above.
