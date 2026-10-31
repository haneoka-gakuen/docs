---
title: OpenAPI 참조
description: 기계가 읽을 수 있는 공개 API 계약을 내려받아 살펴봅니다.
---

생성된 OpenAPI 문서는 [`/openapi.json`](/openapi.json)에 있습니다. 운영 빌드마다 [`scripts/build-openapi.mjs`](https://github.com/haneoka-gakuen/docs/blob/main/scripts/build-openapi.mjs)로 만들어집니다.

```bash
curl --fail-with-body https://docs.haneoka.org/openapi.json -o openapi.json
```

문서에는 현재 데이터용 직접 별칭이 들어 있습니다.

```text
GET /api/v1/{resource}
GET /api/v1/{resource}/{id}
GET /api/v1/{resource}/views/{view}
GET /api/v1/{resource}/views/{view}/{id}
GET /api/v1/{resource}/relations/{relation}/{key}
```

직접 라우트마다 선택적 `server` 쿼리가 있으며, 생략하면 `intl`을 고릅니다. 문서에는 서버 단위 명시적 형태, 릴리스 고정, 미디어와 게임 클라이언트 파일, Sonolus, 커뮤니티·프로필·업로드 API, 계정 설정, Better Auth 라우트, Bestdori 프로젝션도 설명되어 있습니다.

운영 공지는 별도의 `/api/v1/announcements` 라우트를 씁니다. 현재 서버 스냅숏을 읽으며 `release` 매개변수를 받지 않습니다. 목록, 상세, 미디어, 언어, HTML 렌더링은 [운영 공지](/ko/servers/announcements/)를 참고하세요.

프로바이더 형태 DTO와 카탈로그 DTO는 선택한 리소스가 필드를 정하는 곳에 `additionalProperties`를 씁니다. 안정된 엔벌로프와 필드 의미는 [카탈로그 데이터](/ko/servers/catalog/)를, 오류, 배치, 타임스탬프, 미디어 값은 [공통 스키마](/ko/reference/schemas/)를 참고하세요.
