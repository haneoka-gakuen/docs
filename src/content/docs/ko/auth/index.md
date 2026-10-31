---
title: 인증
description: 비밀 정보를 노출하지 않고 계정 가입과 Better Auth 세션 엔드포인트를 사용합니다.
---

인증은 `https://haneoka.org/api/auth`에 있습니다. 워커는 아래의 지원되는 Better Auth 라우트에 처리를 넘기고, `/api/v1/account/register`에 Haneoka 자체 이메일 가입 흐름을 더합니다.

## 사용 가능 여부 확인

```http
GET /api/v1/account/config
```

예:

```json
{
  "available": true,
  "emailDeliveryEnabled": true,
  "emailSignUpEnabled": true,
  "providers": ["github", "google"],
  "turnstileSiteKey": "public-site-key-or-null"
}
```

`providers`는 설정된 소셜 프로바이더 ID 목록입니다. 시크릿, 클라이언트 시크릿, 인증 키, Turnstile 시크릿 키는 이 응답에 절대 들어가지 않습니다.

## 이메일로 가입

```http
POST /api/v1/account/register
Content-Type: application/json
X-Captcha-Response: <turnstile-token-when-enabled>

{ "email": "person@example.test" }
```

이 라우트는 같은 출처 전용이며 이메일 필드만 받습니다. 성공하면 `202`를 반환합니다.

```json
{ "accepted": true }
```

기존 주소든 새 주소든 응답은 같습니다. Turnstile이 켜져 있으면 브라우저 챌린지 토큰을 `X-Captcha-Response`로 보내세요. 사이트 키는 설정 엔드포인트에서 얻습니다.

## 세션과 이메일·비밀번호 라우트

`/api/auth` 아래에서 다음 라우트를 지원합니다.

| 메서드 | 경로 | 인증 | 용도 |
| --- | --- | --- | --- |
| `GET`, `HEAD` | `/api/auth/get-session` | 익명 | 현재 세션을 읽는다. 쿠키가 없으면 익명의 정상 결과. |
| `POST` | `/api/auth/sign-in/email` | 익명 | 이메일과 비밀번호로 로그인한다. |
| `POST` | `/api/auth/sign-in/social` | 익명 | 설정된 소셜 로그인을 시작한다. |
| `POST` | `/api/auth/sign-out` | 쿠키 | 현재 세션을 끝낸다. |
| `POST` | `/api/auth/send-verification-email` | 쿠키 | 이메일 발송이 켜져 있으면 인증 메일을 요청한다. |
| `GET` | `/api/auth/verify-email` | 토큰 | 이메일 인증 링크를 사용한다. |
| `POST` | `/api/auth/request-password-reset` | 익명 | 재설정 메일을 요청한다. |
| `POST` | `/api/auth/reset-password` | 토큰 | 본문이나 쿼리의 재설정 토큰으로 새 비밀번호를 정한다. |
| `GET` | `/api/auth/reset-password/{token}` | 토큰 | 비밀번호 재설정 이어하기 링크를 연다. 세션 쿠키는 필요 없다. |
| `POST` | `/api/auth/change-email` | 쿠키 | 이메일 변경을 요청한다. |
| `POST` | `/api/auth/change-password` | 쿠키 | 현재 비밀번호를 바꾼다. |
| `GET` | `/api/auth/list-accounts` | 쿠키 | 연결된 계정을 나열한다. |
| `POST` | `/api/auth/link-social` | 쿠키 | 설정된 소셜 계정을 연결한다. |
| `POST` | `/api/auth/unlink-account` | 쿠키 | 계정 정책에 따라 연결을 해제한다. |
| `GET` | `/api/auth/list-sessions` | 쿠키 | 활성 세션을 나열한다. |
| `POST` | `/api/auth/revoke-session` | 쿠키 | 세션 하나를 무효화한다. |
| `POST` | `/api/auth/revoke-sessions` | 쿠키 | Better Auth 페이로드에 따라 선택한 세션이나 모든 세션을 무효화한다. |
| `POST` | `/api/auth/revoke-other-sessions` | 쿠키 | 현재 세션 외의 세션을 무효화한다. |
| `GET`, `POST` | `/api/auth/callback/{provider}` | OAuth | 설정된 프로바이더 콜백을 완료한다. |
| `GET` | `/api/auth/error` | 익명 | 인증 오류 응답을 표시한다. |
| `GET` | `/api/auth/ok` | 익명 | Better Auth의 상태 확인 응답. |

프로바이더 콜백은 `discord`, `github`, `google`, `twitter` 중 설정된 것만 받습니다. `providers`에 없는 프로바이더는 현재 배포에서 지원하는 라우트가 아닙니다.

## 브라우저 사용

계정을 바꿀 때는 `credentials: "include"`를 쓰고 같은 출처로 보내세요.

```ts
const response = await fetch("/api/auth/get-session", {
  credentials: "include",
  headers: { Accept: "application/json" },
});
```

인증 응답은 `Cache-Control: no-store`입니다. 세션 JSON을 캐시하거나, 쿠키를 로그에 복사하거나, 클라이언트 시크릿을 프런트엔드 코드에 두지 마세요.

## 오류와 쓸 수 없는 기능

워커에 데이터베이스나 32자 인증 시크릿이 없으면 인증 라우트는 `503 auth_not_configured`를 반환합니다. 이메일 전용 라우트는 발송이 설정되지 않았으면 `503`을 반환합니다. 가입은 잘못된 이메일이나 본문에 `400`, 교차 출처나 검증 실패에 `403`, 너무 큰 본문에 `413`, JSON이 아닌 본문에 `415`, 속도 제한 시 `Retry-After: 60`과 함께 `429`를 반환할 수 있습니다.

Better Auth는 프로바이더별 요청·응답 필드가 바뀔 수 있습니다. 고른 작업에는 Better Auth 라우트에서 문서화한 페이로드를 쓰고, 추가 응답 필드는 선택 항목으로 다루세요. Haneoka 워커 계약이 보장하는 것은 위 라우트의 제공과 쿠키·같은 출처 동작입니다.
