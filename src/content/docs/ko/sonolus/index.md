---
title: Sonolus API
description: Sonolus에서 Haneoka를 열고 채보, 플레이리스트, 표시용 리소스를 가져옵니다.
---

Sonolus의 서버 주소에 **`https://haneoka.org`**를 추가하거나 [앱에서 Haneoka를 여세요](https://open.sonolus.com/haneoka.org). 앱은 프로토콜 엔드포인트를 요청할 때 `/sonolus`를 붙입니다. 각 항목의 `source`는 이 같은 서버 주소를 가리킵니다.

공개 서비스는 Our Notes 채보, 가루파 채보, 곡 플레이리스트, 노트 스킨, 배경, 사운드 팩, 네이티브 파티클 이펙트, 플레이 엔진을 제공합니다. 요청은 `GET` 또는 `HEAD`이며 JSON 응답에는 `Sonolus-Version`이 붙습니다.

## 서버 정보

```http
GET /sonolus/info
```

응답에는 서버 제목, 첫 화면 섹션, 설정, 배너가 들어 있습니다. 리소스 바이트는 반환된 URL에서 가져오세요.

## 채보

```http
GET /sonolus/levels/info
GET /sonolus/levels/list?page=0
GET /sonolus/levels/{levelName}
GET /sonolus/levels/{levelName}/data/{sha1}
```

목록은 페이지당 20개이며 0페이지부터 시작합니다. 레벨 이름은 서비스, 게임 서버, 곡, 난이도를 나타냅니다.

```text
haneoka-jp-100109-expert
haneoka-intl-100109-expert
haneoka-gbp-1234-expert
```

목록이 반환한 이름을 그대로 쓰세요. 원본 게임 데이터가 갱신되어도 이름은 바뀌지 않습니다. 앱은 식별자를 표시할 때 `#`를 자동으로 붙이지만 API 이름 자체에는 해시 기호가 없습니다. 반환된 이름을 URL 경로 세그먼트로 인코딩하세요.

```http
GET /sonolus/levels/haneoka-jp-100109-expert
```

레벨에는 엔진, 표시 선택, 재킷, 오디오, 채보 데이터가 들어 있습니다. `data` 객체는 압축된 채보 바이트의 URL과 40자 SHA-1 해시를 제공합니다. 그 URL을 직접 가져오세요. 해시는 불변 콘텐츠를 식별합니다.

`/sonolus/levels/info`나 `/sonolus/levels/list`에 `?type=random`을 붙이면 무작위 채보를 반환합니다.

## 곡 플레이리스트

```http
GET /sonolus/playlists/info
GET /sonolus/playlists/list?page=0
GET /sonolus/playlists/{playlistName}
```

플레이리스트는 한 곡의 난이도를 묶은 것으로 완전한 레벨 항목을 포함합니다. `haneoka-jp-100109`, `haneoka-gbp-1234` 같은 이름은 출처를 유지합니다. 플레이리스트 이름도 레벨 이름과 같은 방식으로 인코딩하세요.

## 표시용 리소스

```http
GET /sonolus/skins/list
GET /sonolus/backgrounds/list
GET /sonolus/effects/list
GET /sonolus/particles/list
GET /sonolus/engines/list
```

각 목록은 사용 가능한 항목과 리소스 기술자를 제공합니다. 스킨과 파티클 섬네일은 실제 표시 에셋의 미리보기입니다. 텍스처, 오디오, 엔진 데이터는 반환된 SRL URL에서 내려받으세요.

## 클라이언트 언어

표시 항목에는 Sonolus 1.1.3 이상의 `##LOCALIZE` 텍스트 함수가 들어 있을 수 있습니다.

```text
##LOCALIZE:{"en":"Song","ja":"曲","zhs":"歌曲","zht":"歌曲","ko":"노래"}
```

Sonolus 앱은 저장한 컬렉션 항목을 포함해 현재 언어를 골라 표시합니다. 번역이 없으면 객체의 첫 번째 언어를 씁니다. 이 항목을 표시하는 도구는 `##LOCALIZE:` 뒤의 JSON을 파싱하고, 맞는 언어를 고르고, 같은 대체 규칙을 적용하세요. Sonolus는 간체 중국어에 `zhs`, 번체 중국어에 `zht`를 씁니다.

`localization`으로 서버 라벨에 쓸 우선 대체 언어를 지정할 수 있습니다. 항목 이름, `source`, 리소스 URL, 해시는 원래 값을 유지합니다.

## 가루파 카탈로그

```http
GET /sonolus/levels/list?source=bestdori&page=0
GET /sonolus/playlists/list?source=bestdori&page=0
```

provider 쿼리로 가루파 카탈로그를 고르며, 반환되는 이름은 `haneoka-gbp-`로 시작합니다. 별도 화면에서 곡과 캐릭터 레코드가 필요하면 [GBP 데이터 API](../providers/bestdori/)를 쓰세요.

## 응답 상태

알 수 없는 이름은 `{ "message": "Not found" }`와 함께 `404`를 반환합니다. 일시적인 카탈로그 오류는 `{ "message": "Service unavailable" }`와 함께 `503`을 반환합니다. 이 공개 읽기에는 계정 세션이 필요 없으며, `Sonolus-Session`은 프로토콜 헤더로 받습니다.
