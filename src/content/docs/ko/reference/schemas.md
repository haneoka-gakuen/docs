---
title: 공통 스키마
description: API 전체에서 쓰는 안정된 응답 엔벌로프와 식별자 규칙.
---

## 현재 리소스 응답

직접 리소스 라우트는 `?server=<slug>`가 없으면 현재 `intl` 카탈로그를 씁니다. 컬렉션 색인은 보통 엔티티 ID를 키로 하는 객체이며, 값은 리소스가 정한 DTO 형태를 유지합니다. 리소스는 형태가 다른 색인, 엔티티, 뷰, 관계를 노출할 수 있습니다. 카탈로그 페이지에 실제 곡 응답과 사용하는 쪽이 쓰는 필드 의미가 있습니다.

## 오류

```json
{
  "error": {
    "code": "stable_machine_code",
    "message": "Human-readable diagnostic",
    "requestId": "optional-request-correlation-id"
  }
}
```

분기에 쓸 값은 `code`입니다. `message`는 명확성을 위해 바뀔 수 있습니다. `requestId`는 선택이며, 있으면 지원 요청에 포함하세요.

## 릴리스 식별자(고급)

```json
{
  "schema": "haneoka-resource-release-identity-v1",
  "server": "server-slug-from-registry",
  "releaseId": "r-0123456789abcdef0123",
  "sourceId": "source-snapshot-id"
}
```

표시된 값은 필드의 역할을 설명합니다. 이후 요청에는 서비스가 반환한 ID를 쓰세요.

## 카탈로그 매니페스트

```json
{
  "schema": "haneoka-catalog-storage-v2",
  "server": "server-slug",
  "sourceId": "source-snapshot-id",
  "summary": "api/v1/catalog/summary.json",
  "partition": { "algorithm": "fnv1a32-mod-256", "shards": 256 },
  "resources": {
    "songs": {
      "count": 85,
      "dependencies": ["bands", "items", "song-meta", "videos"],
      "entities": {
        "algorithm": "fnv1a32-mod-256",
        "count": 85,
        "prefix": "api/v1/catalog/songs/entities/",
        "shards": ["01", "06", "09"]
      },
      "index": "api/v1/catalog/songs/index.json",
      "kind": "collection",
      "relations": {},
      "views": {}
    }
  }
}
```

리소스 메타데이터 객체마다 `kind`, `count`, `dependencies`, `index`, 선택 항목 `entities`, `relations`, `views`를 선언합니다. 엔티티와 관계의 저장소 기술자에는 FNV-1a 샤드 방식, 샤드 수, 접두사, 샤드 이름이 들어 있습니다. 관계 메타데이터는 `entityCount`와 `valueMode`(`ids` 또는 `records`)를, 뷰 메타데이터는 자체 엔티티 저장소, `path`, `shape`(`array` 또는 `object`)를 선언합니다. 매니페스트는 어떤 카탈로그 라우트가 있는지 정하는 중심 DTO입니다. 예제는 샤드 목록을 줄였으니 서비스가 반환하는 전체 목록을 쓰세요.

## 카탈로그 배치

```json
{
  "items": { "entity-key-from-index": {} },
  "missing": ["entity-key-not-present"]
}
```

`items` 값은 리소스가 정한 엔티티 형태를 유지하며, API는 공통 `id`나 `title` 필드를 더하지 않습니다. 두 맵 모두 서비스가 제공한 ID를 씁니다. 없는 키는 `missing`에 나옵니다.

## 커뮤니티 페이지 나누기

커뮤니티 목록 응답은 `nextCursor: string | null`을 씁니다. `nextCursor`가 `null`이면 페이지가 끝난 것입니다. 각 커서는 그대로 다시 보내세요.

## 타임스탬프와 미디어

커뮤니티 타임스탬프는 Unix 기원 이후 밀리초입니다. 카탈로그·프로바이더 타임스탬프는 원래 DTO 계약을 따르며 숫자일 수도, 프로바이더의 지역별 값일 수도 있습니다. 미디어 필드에는 준비되고 허용된 객체가 있을 때 `mediaType`, `size`, `width`, `height`, URL이 들어 있습니다. `null` 값은 보존하세요. 원본이 현재 그 속성을 제공하지 않는다는 뜻입니다.
