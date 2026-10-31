---
title: Bestdori 프로바이더 API
description: Haneoka가 변환한 가루파 데이터와 미디어 프록시를 사용합니다.
---

Bestdori 라우트는 읽기 전용 공개 프로젝션입니다. `{region}` 세그먼트는 Bestdori 프로바이더 지역이며 Our Notes 릴리스 서버가 아닙니다. 지원 지역은 `jp`, `en`, `tw`, `cn`, `kr`입니다.

## 카탈로그 컬렉션

```http
GET /api/v1/garupa/bestdori/{region}/bands
GET /api/v1/garupa/bestdori/{region}/songs
GET /api/v1/garupa/bestdori/{region}/song-meta
GET /api/v1/garupa/bestdori/{region}/characters
GET /api/v1/garupa/bestdori/{region}/cards
```

컬렉션 응답은 프로바이더의 숫자 문자열 ID를 키로 하는 JSON 객체입니다. Haneoka는 이름, 이미지·오디오 경로, 지역별 출시 메타데이터, 일부 필드를 브라우저에 의존하지 않는 DTO로 변환합니다. 상위 데이터가 늘어나면 선택 필드가 추가될 수 있으니 알 수 없는 키는 보존하세요.

## 개별 레코드

```http
GET /api/v1/garupa/bestdori/{region}/songs/{musicId}
GET /api/v1/garupa/bestdori/{region}/song-meta/{musicId}
GET /api/v1/garupa/bestdori/{region}/cards/{cardId}
```

`musicId`와 `cardId`는 컬렉션 응답에서 얻은 10진 프로바이더 ID입니다. 이 라우트에 Our Notes 카탈로그 엔티티 키를 쓰지 마세요.

## 스토리와 에디터 에셋

```http
GET /api/v1/garupa/bestdori/{region}/stories/event
GET /api/v1/garupa/bestdori/{region}/stories/band
GET /api/v1/garupa/bestdori/{region}/stories/main
GET /api/v1/garupa/bestdori/{region}/stories/afterlive
GET /api/v1/garupa/bestdori/{region}/stories/{storyId}
GET /api/v1/garupa/bestdori/{region}/editor-assets
GET /api/v1/garupa/bestdori/{region}/editor-assets/{bundlePath}
```

컬렉션 라우트는 JSON 프로젝션을 반환합니다. `editor-assets` 루트는 병합된 리소스 트리를, 번들 경로는 프로바이더의 파일 목록을 반환합니다. `storyId`는 컬렉션이 반환하는 정식 스토리 파일 이름(ID)이며 하나의 세그먼트로 URL 인코딩합니다.

## 채보와 미디어

```http
GET /api/v1/garupa/bestdori/{region}/charts/{musicId}/{difficulty}
GET /api/v1/garupa/bestdori/{region}/media/jacket/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/jacket-thumb/{package}/{image}
GET /api/v1/garupa/bestdori/{region}/media/sound/{soundId}
GET /api/v1/garupa/bestdori/{region}/media/mv/{filename}
GET /api/v1/garupa/bestdori/{region}/media/stage-challenge/{assetId}
```

채보 난이도는 `easy`, `normal`, `hard`, `expert`, `special` 중 하나입니다. 채보 응답은 `text/plain`이며 `meta`와 `score`를 가진 JSON으로 직렬화된 SS 문서를 담습니다. `score`에는 이벤트와 노트가 들어 있습니다. 이는 SS 변환기의 입력이고, `mountChart`는 변환된 `ChartEmbedDocument`를 받습니다. 재생 전에 텍스트를 읽어 변환하세요. 미디어 라우트는 상위에서 제공하면 범위 헤더와 검증 헤더를 그대로 전달합니다.

```js
const response = await fetch("https://haneoka.org/api/v1/garupa/bestdori/jp/charts/1/expert");
if (!response.ok) throw new Error(`Chart HTTP ${response.status}`);
const scoreText = await response.text();
const ssDocument = JSON.parse(scoreText);
console.log(ssDocument.meta.version, ssDocument.score.events);
```

## 프로바이더 원본 에셋

```http
GET /api/v1/garupa/bestdori/{region}/raw/{providerPath}
```

안전한 프로바이더 경로만 받습니다. 경로 거슬러 오르기, 인코딩된 NUL, `{region}`과 맞지 않는 에셋 지역은 거부됩니다. 변환된 라우트가 있으면 그것을 쓰고, 원본 경로는 정규화된 DTO가 없는 프로바이더 파일에만 쓰세요.

## Live2D 조회

```http
GET /api/v1/garupa/bestdori/{region}/live2d?id={id}&id={id}&server={region}
```

ID는 중복이 제거되며 최대 64개입니다. 빈 요청은 `{ "items": {}, "missing": [] }`를 반환하고, 비어 있지 않은 요청은 찾은 항목과 찾지 못한 목록을 반환합니다. `server`를 지정하면 소스 조회에 쓸 프로바이더 지역을 고를 수 있습니다.

프로바이더 오류는 `502`와 `{ "error": { "code": "bestdori_upstream", "message": "..." } }`로 반환됩니다. 알 수 없는 프로바이더 지역은 `404 region_not_found`를 반환합니다.
