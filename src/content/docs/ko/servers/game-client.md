---
title: 게임 클라이언트 API
description: 클라이언트 연동을 만들 때 게임 클라이언트 매니페스트와 공개 파일을 읽습니다.
---

클라이언트 빌드 도구를 위한 고급 계약입니다. 카탈로그만 쓴다면 리소스 DTO가 반환하는 `file`, `jacketUrl`, `musicUrl` 같은 경로로 충분하며, 그 경로는 [미디어와 파일](/ko/servers/media/)로 요청할 수 있습니다.

게임 클라이언트 API는 활성 서버 릴리스의 파일을 공개합니다. 먼저 매니페스트를 읽은 뒤, 매니페스트나 Addressables 색인에 있는 파일 이름을 요청합니다.

## 매니페스트

```http
GET /game-client/{server}/manifest.json
HEAD /game-client/{server}/manifest.json
```

안정된 엔벌로프에는 다음이 포함됩니다.

```json
{
  "schema": "haneoka-game-client-v1",
  "server": "jp-cbt",
  "sourceId": "garupa-jp-2026-09",
  "master": { "systemVersion": "example-system-version" },
  "addressables": {
    "platform": "Android",
    "catalogFile": "catalog.json",
    "catalogHashFile": "catalog.hash",
    "embeddedCatalogFile": "catalog.embedded.json",
    "index": {
      "algorithm": "fnv1a32-mod-256",
      "shards": 256,
      "prefix": "addressables/index/"
    }
  }
}
```

서버는 `X-Haneoka-Release-Id`와 `X-Haneoka-Source-Id`를 반환합니다. 매니페스트는 현재 포인터를 따르며 유효 기간이 짧습니다.

## 마스터 파일

```http
GET /game-client/{server}/master/MasterDataSystemVersion.txt
GET /game-client/{server}/master/{filename}
HEAD /game-client/{server}/master/{filename}
```

버전 파일은 텍스트입니다. 그 밖의 지원되는 마스터 파일은 `Master*.bin` 파일 이름 규칙을 따르며 바이너리로 반환됩니다. 파일 이름은 릴리스 매니페스트나 문서화된 클라이언트 계약에서 얻어야 합니다.

## Addressables

```http
GET /game-client/{server}/asset/{platform}/{filename}
HEAD /game-client/{server}/asset/{platform}/{filename}
```

플랫폼은 매니페스트의 `addressables.platform`과 같아야 합니다. 서버는 256개로 나뉜 릴리스 색인 샤드를 해석해 내용 주소 방식의 객체를 반환합니다. 카탈로그 파일은 현재 릴리스의 객체이며, Unity 번들과 카탈로그 페이로드는 색인상의 역할이 허용하면 불변 콘텐츠로 캐시됩니다.

Addressables 응답은 바이너리이며 릴리스 헤더를 포함합니다. 플랫폼, 파일 이름, 색인 항목 중 하나가 없으면 `404`, 색인과 객체의 무결성 검사에 실패하면 `502`를 반환합니다.
게임 클라이언트 파일 응답은 `ETag`를 제공하고 단일 바이트 범위를 받습니다. 충족 가능한 범위에는 `206`, 잘못된 범위에는 `Content-Range: bytes */<size>`와 함께 `416`을 반환합니다.

## 실제 순서

1. `manifest.json`을 가져옵니다.
2. `platform`과 카탈로그 파일 이름을 확인합니다.
3. `/asset/{platform}/{filename}`으로 카탈로그 파일과 해시 파일을 가져옵니다.
4. 클라이언트 카탈로그나 공개 색인에서 추가 파일 이름을 해석합니다.
5. 응답 헤더에 따라 캐시하고 로컬 색인과 함께 릴리스 ID를 보관합니다.
