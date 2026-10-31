---
title: Vega 호스트 리소스
description: 로컬 바이트와 렌더러 URI를 제공하고, 읽기를 취소하며, 명시적인 리소스 임대를 관리합니다.
---

[Haneoka](https://haneoka.org/) · [브라우저 스토리 튜토리얼](../vega/)

`@haneoka/vega/host-resources`는 `HostStoryResourceResolver`, `StoryResourceResolver`, `StoryResourceLease`를 내보냅니다. 이 작은 진입점은 브라우저 I/O 없이 Node나 네이티브 호스트에서 동작합니다. 제공한 호스트를 감싸는 것이며, 저장소, 캐싱, 지원 리소스 이름, 렌더러 호환 URI는 호스트가 정합니다.

엔진과는 **`engine.createPlayer({ resources })`**(`VegaPlayerOptions` 필드)로 연동합니다. 같은 완전한 포트가 렌더러, ADV 로더, UI에 전달됩니다. 제공한 포트는 애플리케이션이 계속 소유하며, 플레이어와 엔진 정리는 각자의 임대만 해제합니다. 엔진의 기존 플레이어 표시와 기본 렌더러에는 브라우저 DOM이 필요합니다. 이 리소스 진입점은 I/O 경계를 정하는 것이며, 완전한 네이티브 엔진 배포물이 아닙니다.

## 1. 소스에서 진입점 빌드

공개 패키지 내보내기는 Vega 리비전 `dfb720d13cada667bd07072cb163942b6c70d0b3`에 커밋되어 있습니다. npm 공개는 아직입니다. 소스 빌드나 맞는 로컬 패키지를 쓰세요. 기존에 호스팅된 `embed/vega.js`는 브라우저 임베드 창구이며 자체 옵션을 가집니다.

소스를 새로 체크아웃했다면 Node.js 22.13 이상을 설치하고 Corepack 명령을 쓸 수 있게 한 뒤 아래 명령을 실행하세요. 이 소스 빌드 툴체인은 pnpm 11.14.0을 씁니다. 이미 빌드된 리소스 예제를 실행하려면 2단계에 적힌 대로 Node 20 이상이 필요합니다.

```sh
git clone https://github.com/haneoka-gakuen/vega.git
cd vega
git checkout dfb720d13cada667bd07072cb163942b6c70d0b3
corepack enable
corepack prepare pnpm@11.14.0 --activate
pnpm install --frozen-lockfile
pnpm --filter @haneoka/vega-protocol build
pnpm build:core
```

대상 진입점은 `dist/host-resources.js`, 선언 진입점은 `dist/host-resources-entry.d.ts`입니다. 이 소스 패키지를 연결한 작업 공간에서는 `@haneoka/vega/host-resources`를 평소처럼 가져올 수 있습니다. 출력된 상대 경로 리소스 모듈은 진입점과 함께 두세요.

## 2. 완전한 로컬 파일 예제 실행

[host-resources.mjs](/examples/host-resources.mjs)와 [garden.svg](/examples/garden.svg)를 같은 곳에 저장합니다. 그 디렉터리에서 Node 20 이상을 실행하고 실제로 빌드한 진입점 경로를 넘깁니다.

```sh
node host-resources.mjs ../vega/dist/host-resources.js ./garden.svg
```

체크아웃이 다른 곳에 있다면 경로를 바꾸세요. 스크립트에서 연결된 패키지를 쓸 수 있으면 패키지 가져오기가 기본입니다.

```sh
node host-resources.mjs
```

이 완전한 스크립트는 `asset://my-story/background`를 로컬 SVG에 대응시킵니다. 인코딩된 바이트를 읽고, 독립적인 변경 가능 사본과 공유 읽기 전용 뷰를 보여 주고, 임대를 두 개 얻고, 시작 전 읽기를 취소하고, 리소스 범위를 닫습니다. 마지막으로 바탕 파일 호스트를 닫고 그 호스트가 보관하던 바이트를 지웁니다. 콘솔에는 바이트 수, URI, 일치하는 획득·해제 횟수가 기록됩니다.

반환되는 `asset://` URI는 애플리케이션 에셋 스킴에 등록한 네이티브 렌더러용입니다. 이 예제는 출력만 하며, 그 URI의 표시상 의미는 렌더러 어댑터가 부여합니다. 브라우저 호스트라면 `resolveRenderable`에서 Blob URL을 만들고 해당 해제 훅에서 폐기할 수도 있습니다. URI 선택은 호스트의 몫입니다.

## 3. 호스트 포트 완전 구현

```ts
import {
  HostStoryResourceResolver,
  type StoryResourceResolver,
  type StoryResourceLease,
} from "@haneoka/vega/host-resources";

const resources = new HostStoryResourceResolver(host);
```

여기서 `host`는 다음 완전한 계약을 구현합니다. 내려받을 수 있는 스크립트는 필수 메서드를 모두 제공합니다. `load()`만 있는 어댑터는 예전 기본 해석기의 어댑터 API에 속합니다.

| 메서드 | 시그니처 | 필수 여부와 효과 |
| --- | --- | --- |
| canLoad | `(source: string) => boolean` | 필수. 동기 수락 검사. 받을 스킴과 키는 호스트가 정한다. |
| load | `(source: string, signal?: AbortSignal) => Promise<Uint8Array>` | 필수. 인코딩된 바이트를 읽고, 받은 취소 신호를 따른다. |
| loadSharedBytes | `(source: string, signal?: AbortSignal) => Promise<Readonly<Uint8Array>>` | 선택. 신뢰할 수 있는 불변 상주 바이트를 위한 빠른 경로. 사용하는 쪽은 이 뷰를 바꾸지 않는다. |
| retain | `(source: string, signal?: AbortSignal) => Promise<StoryResourceLease>` | 필수. 인코딩된 리소스 임대를 얻는다. 임대에는 `release(): void`가 있다. |
| resolveRenderable | `(source: string, signal?: AbortSignal) => Promise<{ readonly url: string; readonly release: () => void }>` | 필수. 선택한 렌더러가 이해하는 URI를 해제 훅과 함께 얻는다. |

호스트는 자신이 할당한 바이트, 파일 핸들, 캐시, 프로토콜 등록, 디코딩된 객체를 소유합니다. 임대를 반환하기 전에 읽기가 실패하면 부분 할당도 정리합니다. 예제의 `host.dispose()`는 보관 중인 바이트를 지우는 애플리케이션 정의 메서드로, `StoryResourceResolver`에 덧붙인 것입니다.

## 범위 인수, 결과, 오류 전체

생성자는 **`new HostStoryResourceResolver(host)`**입니다. 필수 인수는 완전한 `StoryResourceResolver` 하나뿐입니다. 기본 호스트, URL 기준, 캐시, 바이트 상한, 기한을 들여오지 않으니 이런 정책은 호스트에서 설정하세요.

| 범위 메서드 | 인수와 결과 | 동작 |
| --- | --- | --- |
| canLoad | `source: string` → `boolean` | 살아 있는 동안 호스트에 맡기고, 범위가 해제된 뒤에는 false를 반환한다. |
| load | `source: string, signal?: AbortSignal` → `Promise<Uint8Array>` | 호스트 바이트의 새 전용 사본을 반환한다. 사본을 바꿔도 호스트의 상주 뷰는 그대로다. |
| loadSharedBytes | 같은 인수 → `Promise<Readonly<Uint8Array>>` | 호스트의 신뢰할 수 있는 뷰를 반환하며, 빠른 경로가 없으면 `host.load`로 대체한다. 래퍼는 사본을 만들지 않는다. readonly 타입은 호출자 약속이며 런타임 버퍼 동결이 아니다. |
| retain | 같은 인수 → `Promise<StoryResourceLease>` | 멱등한 `release()`를 가진 임대를 반환한다. 인코딩된 리소스를 다 쓴 뒤 해제한다. |
| resolveRenderable | 같은 인수 → `Promise<{ readonly url: string; readonly release: () => void }>` | 호스트의 URI를 그대로, 멱등한 해제 훅과 함께 반환한다. 해제하기 전에 렌더러 사용을 멈춘다. |
| dispose | 인수 없음 → `void` | 범위를 닫힌 상태로 만들고, 대기 중인 획득을 중단하며, 살아 있는 임대를 해제한다. 반복 호출해도 추가 효과가 없다. |

`source`는 그대로 전달됩니다. 범위는 경로 정규화, 코덱 선택, HTTP 요청, Blob 변환, 리소스 파싱을 하지 않습니다. 지원하지 않는 소스는 비동기 작업이 `TypeError`로 거부됩니다. 호스트 I/O 실패는 원래 오류를 유지합니다.

선택 항목 `signal`이 취소하는 것은 **획득**입니다. 이미 중단된 신호는 I/O 전에 그 이유로 거부되고, 진행 중 중단은 호스트에 전달되어 작업을 바로 거부합니다. 성공한 임대는 나중에 획득 신호가 중단되어도 명시적 `release()`나 범위 해제까지 유지됩니다.

호스트는 전달된 신호를 따라야 합니다. 취소 뒤에 호스트가 임대를 반환하면 래퍼가 그 늦은 핸들을 해제합니다. 늦은 해제 실패는 진단 콘솔로 가고, 작업 결과는 원래 취소로 남습니다. `dispose()` 뒤의 비동기 호출은 `AbortError`로 거부됩니다. 해제는 현재 모든 해제를 시도하고, 하나라도 실패하면 `AggregateError`를 던집니다. 해제 훅은 예외를 던지는 경우를 포함해 최대 한 번만 호출됩니다.

## 4. 엔진에 리소스를 넘기고 소유 순서대로 닫기

엔진 진입점을 쓰는 애플리케이션에서는 이 도우미가 호출자가 소유한 완전한 포트를 플레이어에 넘깁니다. 인수는 실제 마운트 요소, `AdvStory`, 리소스 범위입니다.

```ts
import { createVega, type AdvStory } from "@haneoka/vega/engine";
import type { StoryResourceResolver } from "@haneoka/vega/host-resources";

export async function mountWithResources(
  mount: HTMLElement,
  story: AdvStory,
  resources: StoryResourceResolver,
) {
  const engine = createVega();
  try {
    const player = await engine.createPlayer({ mount, story, resources, shell: false });
    return { player, close: () => engine.dispose() };
  } catch (error) {
    try { await engine.dispose(); }
    catch (cleanupError) {
      throw new AggregateError([error, cleanupError], "Player setup and Engine cleanup failed");
    }
    throw error;
  }
}
```

`resources?: StoryResourceResolver`는 **플레이어 옵션**이며 `VegaEngineOptions` 생성자 필드나 임베드 `mountStory` 옵션이 아닙니다. 생략하면 기존 `DefaultStoryResourceResolver`와 리소스 플러그인 경로를 그대로 씁니다. `HostStoryResourceResolver`는 쓸 수 있는 범위 구현 중 하나이며, 다른 완전한 포트를 제공해도 됩니다.

`AdvStory`의 출발점으로 [완전한 스토리 JSON](https://docs.haneoka.org/examples/dialogue.json)을 쓰세요. 형식과 브라우저 불러오기 단계는 [스토리 튜토리얼](../vega/)에 있습니다. 호스트 전용 렌더러는 포트가 반환하는 URI를 받아야 합니다. 기본 DOM 렌더러는 브라우저에서 그릴 수 있는 URL을 씁니다.

| 소유자 | 정리 책임 |
| --- | --- |
| 플레이어/엔진 | 자신의 로더, 장면, UI 임대. `await player.dispose()`는 그 플레이어를 없애고, `await engine.dispose()`는 모든 플레이어와 엔진 소유 기여를 닫는다. |
| 애플리케이션 | 주입한 리소스 범위. 모든 사용자가 멈춘 뒤에 닫는다. 여러 플레이어가 공유해도 된다. |
| 파일/네이티브 호스트 | 자신의 저장소, 상주 캐시, 워커 연결, 부분 할당. 그것을 쓰는 범위 뒤에 닫는다. |

종료 순서는 **플레이어/엔진 정리를 기다림 → `resources.dispose()` → 내 `host.dispose()`**입니다. 범위와 호스트 정리는 중첩된 `finally` 블록에 넣어 해제 오류가 나도 뒤의 소유자가 닫을 수 있게 하세요. 플레이어 생성에 실패하면 그 플레이어의 획득분이 정리되고 호출자의 리소스 범위는 쓸 수 있게 남습니다. 플레이어 하나를 닫아도 다른 플레이어와 공유하는 범위는 유지됩니다.
