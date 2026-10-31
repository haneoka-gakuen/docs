---
title: JavaScript 임베드
description: Vega 스토리, Cassiopeia 채보, Home Spot 장면을 내 웹사이트에 넣습니다.
---

Haneoka 임베드는 페이지의 요소 안에 마운트됩니다. Vega는 스토리를, Cassiopeia는 채보를 재생하고, Home Spot은 상호작용하는 Three/Spine 장면을 그립니다. 셋은 `@haneoka/embed-core`로 이식 가능한 데이터 소스와 리소스 불러오기를 공유합니다. 주변 레이아웃, 버튼, 오류 메시지는 애플리케이션이 맡습니다.

## 호스트 고르기

| 콘텐츠 | 진입점 | 입력 | 조작 |
| --- | --- | --- | --- |
| 데이터와 리소스 불러오기 | `@haneoka/embed-core` | 메모리, HTTP JSON, 로컬 파일, 사용자 정의 소스 | 불러오기, 취소, 해제 |
| 스토리 | `@haneoka/embed-vega` | Vega `AdvStory` 또는 데이터 소스 | 재생, 일시 정지, 다음, 스토리 비율로 탐색 |
| 채보 | `@haneoka/embed-cassiopeia` | `ChartEmbedDocument` 또는 데이터 소스 | 재생, 일시 정지, 초 단위 탐색, 옵션과 스킨 |
| 장면 | `@haneoka/embed-home-spot` | `HomeSpotDocument` 또는 데이터 소스 | 선택, 다시 재생, 장면 교체, PNG 내보내기 |

표시를 맡는 각 호스트에는 현재 공개 콘텐츠용 `/haneoka` 어댑터도 있습니다. 어댑터는 카탈로그 객체를 고르고 반환된 에셋 경로를 씁니다. 직접 만든 콘텐츠는 단일 언어, 임의의 로캘 문자열, 유니코드 리소스 키를 쓸 수 있습니다. `server`와 `locale`은 따로 고르세요.

## 재생할 수 있는 스토리로 시작하기

[8단계 Vega 튜토리얼](./vega/)을 따라 대사 두 줄을 쓰고, JSON을 저장하고, 완전한 HTML 페이지를 연 뒤 배경, 사운드, 모델을 더합니다. [완전한 시작 HTML](/examples/first-story.html)과 [완전한 대사 JSON](/examples/dialogue.json)이 준비되어 있습니다. 시작 파일은 호스팅된 모듈을 쓰므로 npm 설치가 필요 없습니다. 튜토리얼에서는 실제 게임 스토리 Treasure도 불러옵니다.

## 배포 현황과 개발자 설치

공식 브라우저 모듈은 `https://haneoka.org/embed/{core,vega,cassiopeia,home-spot,vega-theme}.js`에 있습니다. 이미 공개된 r22 모듈을 `/embed/r-22bfe102f7deb73f/` 아래로 고정하거나, 매니페스트에서 검증된 이후 릴리스를 찾으세요. [저장소](https://github.com/haneoka-gakuen/haneoka/tree/main/packages)에 패키지 소스가 있으며, 생성되는 SDK 청크와 에셋은 배포 빌드 산출물입니다. npm 공개는 별도 단계입니다. 아래의 직접 호스팅 경로는 애플리케이션이 정하는 예시입니다.

아래 직접 호스팅 단계는 소스에서 빌드하는 개발자용입니다. 채보·스토리 툴체인 전체에는 Node.js 24 이상을 쓰세요. 임베드, core, 필요한 피어 의존성을 같은 소스 작업 공간 리비전에서 빌드·패킹한 뒤, 생성된 파일을 호스트 애플리케이션에 설치합니다. 아래 vendor 경로는 로컬 출력 자리표시자이며 공개 다운로드가 아닙니다.

```sh
# Replace these paths with the actual release artifacts and include the
# rendering peers listed in the selected host's guide.
npm install ./vendor/haneoka-embed-core-0.1.0.tgz \
  ./vendor/haneoka-embed-vega-0.1.0.tgz
```

스토리 호스트에는 Vega, Three 렌더러, Portable UI, 리치 텍스트 플러그인, Three, Howler가 필요합니다. 기본 채보 호스트에는 Cassiopeia 커널, 웹 호스트, Our Notes 플러그인, Three 렌더러, Vue UI, Vue, Three가 필요합니다. Home Spot에는 Haneoka 장면 제공자, Three `0.184.x`, Spine `4.2.119`가 필요합니다. 선택적 공개 카탈로그 어댑터에는 `@haneoka/api-client`도 필요합니다. 호환 버전은 패키지 매니페스트를 따르세요. 임베드 tarball만 설치해서는 공개되지 않은 피어가 들어오지 않습니다.

주요 진입점은 네이티브 ESM과 TypeScript 선언을 내보냅니다. 가져오기만으로는 DOM과 네트워크를 건드리지 않습니다. 표시 마운트는 브라우저 컨테이너가 생긴 뒤에 호출하세요. 프레임워크에서는 서버에서 모듈을 가져온 뒤 클라이언트 컴포넌트 수명 주기에서 핸들을 만들고 해제할 수 있습니다.

## 내 CDN용 스크립트 모듈 만들기

브라우저 번들러가 패키지 가져오기를 해석하고 지연 로딩되는 렌더러 청크를 함께 유지합니다. 예를 들어 Vite와 필요한 로컬 패키지를 설치한 애플리케이션에서 다음 진입 파일을 만듭니다.

```js
// sdk/core.js
export * from "@haneoka/embed-core";
export { haneokaDataSource } from "@haneoka/embed-core/haneoka";

// sdk/vega.js
export { mountStory } from "@haneoka/embed-vega";
export { haneokaStorySource, cubismStoryPlugin } from "@haneoka/embed-vega/haneoka";
export { haneokaStoryPlugins } from "@haneoka/embed-vega/theme";
export { ADV_COMMAND } from "@haneoka/vega/renderer-kit";

// sdk/chart.js
export { mountChart } from "@haneoka/embed-cassiopeia";
export { haneokaChartSource, haneokaChartTheme } from "@haneoka/embed-cassiopeia/haneoka";
import "@haneoka/embed-cassiopeia/style.css";

// sdk/home-spot.js
export { mountHomeSpot } from "@haneoka/embed-home-spot";
export { mountHaneokaHomeSpot } from "@haneoka/embed-home-spot/haneoka";
```

이들은 각각 별도의 파일입니다. 애플리케이션에 필요한 호스트 진입점만 빌드하세요. 선택적 스토리 테마·제공자 어댑터를 내보내는 진입점에는 그 선택적 피어 패키지도 필요합니다.

```js
// vite.config.mjs — this example builds the portable story entry only.
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  build: {
    target: "es2022",
    outDir: "sdk-dist",
    lib: { entry: "sdk/vega.js", formats: ["es"], fileName: () => "vega.js" },
  },
});
```

Portable 전용 빌드에서는 `sdk/vega.js`의 내보내기를 `mountStory`와 `ADV_COMMAND`로 한정합니다. 호스트의 Vite 빌드를 실행하고, `sdk-dist` 디렉터리 전체를 정적 호스트나 CDN의 버전 디렉터리에 올리고, 생성된 청크를 모두 남겨 두세요. 채보 진입점을 빌드할 때는 출력된 CSS도 연결합니다. 테마 스프라이트, 글꼴, 라이선스가 필요한 모델 런타임은 선택한 제공자의 에셋 복사·배치 단계가 필요하며, JavaScript를 번들링하는 것만으로는 배치되지 않습니다.

이제 일반 페이지에서 직접 호스팅한 모듈을 씁니다.

```html
<div id="story" style="height:60vh;min-height:320px"></div>
<button id="play" disabled>Play</button>
<script type="module">
  import { mountStory, ADV_COMMAND } from "/sdk/0.1.0/vega.js";

  const handle = mountStory(document.querySelector("#story"), {
    document: {
      localization: { locales: ["en"], defaultLocale: "en" },
      commands: [
        { command: ADV_COMMAND.Talk, targetName: "Mira", text: "Welcome." },
      ],
    },
    locale: "en",
  });
  const play = document.querySelector("#play");
  try {
    await handle.ready;
    play.disabled = false;
    play.onclick = () => handle.play();
  } catch (error) {
    console.error(error);
    await handle.dispose();
  }
  // On component/page teardown: await handle.dispose().
</script>
```

교차 출처 CDN에서는 가져오기를 절대 URL로 바꾸고, JavaScript MIME 타입과 CORS 허가를 붙여 ESM을 제공하세요. 버전이 붙은 모듈 URL, 의존성, 런타임 에셋은 함께 유지합니다. 브라우저 네이티브 bare 패키지 가져오기에는 사용하는 모든 의존성과 내보낸 하위 경로를 덮는 import map이 필요하며, 번들된 배포물이면 임베드하는 페이지에서 이 해석 작업이 필요 없습니다.

## 불러오기, 레이아웃, 수명

마운트하기 전에 무대의 너비와 높이를 확보하세요. 불러오기·오류 표시와 접근성 있는 조작은 페이지의 컴포넌트 체계에 둡니다. MD3 페이지라면 기존 Material 컨트롤, 디자인 토큰, Fontsource 글꼴을 쓸 수 있습니다. 터치하기 좋은 크기의 버튼과 좁은 화면에서 줄바꿈되는 레이아웃을 쓰세요. 브라우저 오디오 권한을 충족하도록 재생은 클릭이나 탭으로 시작합니다.

반환된 핸들은 바로 보관하고, `ready`에 오류 처리기를 붙이고, 불러오는 중을 포함해 컴포넌트가 언마운트될 때 해제하세요. 같은 요소를 다시 쓰기 전에 해제가 끝나기를 기다립니다. 취소 동작은 호스트마다 다르며 [각 호스트 가이드](./vega/)에서 설명합니다. `cancel()`은 모든 호스트에 공통인 재시도 방법이 아닙니다.

| 호스트 | `cancel()`의 의미 | 재시도 |
| --- | --- | --- |
| Core 로더 | 진행 중인 데이터·리소스 호출 취소 | 같은 로더에서 `load()`를 다시 호출 |
| Vega | 불러오는 중인 구성을 중단 | 해제 후 새 핸들을 마운트 |
| Cassiopeia | 마운트와 재생 중지, 핸들은 종료 상태 | 해제 후 새 핸들을 마운트 |
| Home Spot | 현재 불러오기 세대 취소 | 새 소스나 문서로 `load()` 호출 |

## 출처와 표기

HTTP 데이터와 리소스는 CORS를 쓰며 기본으로 자격 증명을 보내지 않습니다. 그 출처가 임베드하는 페이지를 허용해야 합니다. HTTP JSON 소스는 상대 경로를 문서 디렉터리 기준으로 해석합니다. 메모리·로컬 데이터에는 `assetsBase`나 리소스 해석기가 필요합니다. 네이티브 이미지·오디오·모델 로더에는 별도의 전송 요건이 있을 수 있으며 호스트 가이드에서 설명합니다.

Vega, Cassiopeia, Home Spot은 [haneoka.org](https://haneoka.org/)로 연결되는 원래 Haneoka 아이콘을 표시합니다. 현재 호스트는 별도 줄을 두거나 장면을 줄이지 않고 반투명 모서리 오버레이를 씁니다. 표기는 호스트 계층에 속해 엔진을 나타내며, 작성자는 자기 문서와 에셋의 소유권과 라이선스를 유지합니다. Home Spot의 링크는 게임 캔버스와 PNG 내보내기 밖에 있습니다. 데이터 전용 core는 UI를 만들지 않으며, 선택적 `/branding` 진입점은 사용자 정의 표시 호스트가 관리하고 지울 수 있는 앵커를 반환합니다.

이어서 [데이터 소스](./core/), [Vega](./vega/), [Cassiopeia](./cassiopeia/), [Home Spot](./home-spot/)을 보세요.
