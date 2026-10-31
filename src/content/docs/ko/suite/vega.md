---
title: Vega
description: 웹과 네이티브 앱에서 비주얼 노벨을 재생합니다. 엔진, 플러그인, 페이지에 플레이어를 넣는 방법.
---

Vega는 haneoka.org 스토리 플레이어를 이루는 비주얼 노벨 엔진입니다. 스토리(대사, 캐릭터, 배경, 카메라, 사운드, 선택지, 채팅 명령의 목록)를 읽어 무엇을 말하는지, 누가 무대에 있는지, 무엇이 재생되는지라는 상태로 바꿉니다. 보이고 들리는 모든 것은 플러그인이 맡으므로, 같은 엔진으로 3D 무대와 Live2D 캐릭터를 갖춘 전체 구성도, 휴대폰용 가벼운 2D 무대도, WebGL이 전혀 필요 없는 단순 DOM 표시도 돌릴 수 있습니다.

## 플레이어 구성

| 부분 | 공식 플러그인 | 없을 때 |
| --- | --- | --- |
| 렌더러 | [Three.js](https://github.com/haneoka-gakuen/vega-renderer-three), [Pixi](https://github.com/haneoka-gakuen/vega-renderer-pixi) | 배경, 스틸, 초상을 보여 주는 DOM 장면. |
| 스토리 UI | [Portable UI](https://github.com/haneoka-gakuen/vega-ui-portable) | 직접 만든 `dialogue` UI 슬롯. |
| 셸 | [기본 셸](https://github.com/haneoka-gakuen/vega-shell-default): 타이틀, 저장, 설정, 백로그, 갤러리, 플로차트 | 스토리가 바로 재생된다. |
| 테마 | [Haneoka](https://github.com/haneoka-gakuen/vega-theme-haneoka), Portable, WebGAL | 스타일 없는 UI. |
| 캐릭터 | [Cubism(Live2D)](https://github.com/haneoka-gakuen/vega-plugin-cubism), [Spine](https://github.com/haneoka-gakuen/vega-plugin-spine), [합성 모델](https://github.com/haneoka-gakuen/vega-plugin-composite) | 정지 이미지만. |
| 텍스트 | [리치 텍스트](https://github.com/haneoka-gakuen/vega-plugin-richtext)와 Markdown, BBCode, HTML, LaTeX, Typst | 일반 텍스트. |
| 기타 | [엔딩 화면](https://github.com/haneoka-gakuen/vega-plugin-ending), [WebGAL 호환](https://github.com/haneoka-gakuen/vega-plugin-webgal), [Haneoka 호스트](https://github.com/haneoka-gakuen/vega-plugin-haneoka) | |

[Vega Full Preset](https://github.com/haneoka-gakuen/vega-preset-full)은 적절한 구성을 한 번의 호출로 조립합니다.

## 페이지에 플레이어 넣기

```sh
pnpm add @haneoka/vega @haneoka/vega-preset-full three@0.184
```

```ts
import { VegaEngine } from "@haneoka/vega/engine";
import createVegaFullPreset from "@haneoka/vega-preset-full";

const engine = new VegaEngine({ officialPlugins: createVegaFullPreset() });

const player = await engine.createPlayer({
  mount: document.querySelector("#story")!,
  story: await (await fetch("/stories/episode-1.json")).json(),
});

await player.player.play();
```

`createPlayer`는 필요하면 엔진을 시작하고, 요소 아래에 플레이어를 붙이고, 스토리가 쓰는 리소스를 모두 불러온 뒤 핸들을 반환합니다. `player.player`로 `play()`, `pause()`, `resume()`, `requestNext()`, `choose(key)`, `seekTo(index)`를 호출하고 반응형 `state`(현재 줄, 백로그, 스토리가 끝났는지)를 읽을 수 있습니다. 핸들은 엔진보다 먼저 해제하세요. 엔진을 해제하면 그 플레이어도 해제됩니다.

아무것도 설치하지 않고 haneoka.org 스토리를 임베드하려면 [Vega 임베드](/ko/embed/vega/)를 쓰세요.

## 스토리

스토리는 `commands` 배열을 가진 JSON입니다. 각 명령은 숫자 `command` 코드와 필드를 가집니다.

```json
{
  "commands": [
    { "command": 25, "background": { "url": "/bg/rooftop.png" }, "duration": 0.5 },
    { "command": 0, "targetName": "anon", "characterModel": { "runtime": { "imageUrl": "/figure/anon.png" } } },
    { "command": 2, "targetName": "anon", "text": "Let's go!" }
  ]
}
```

여기서 `25`는 Stage(배경 설정), `0`은 캐릭터 등장, `2`는 대사 한 줄입니다.

명령 종류는 게임과 같습니다. 대사와 화자, 모션과 표정을 동반한 캐릭터 등장·퇴장, 배경과 스틸, 카메라 팬·틸트·줌·흔들림, 피사계 심도, BGM, 효과음과 보이스, 페이드, 플래시, 전환, 채팅 화면 장면, 자막이 있는 영상, 선택지, 점프, 명령 그룹이 있습니다. 코드는 `@haneoka/vega-protocol`(`VEGA_ADV_OPCODE`)에 있습니다. 실제로 손으로 쓸 일은 드물며, Altair가 양식으로 편집하고 가져오기 기능이 WebGAL, Bestdori, 일반 문장에서 만들어 냅니다.

텍스트는 게임의 마크업(루비, 색, 크기)을 지원하며, 형식 플러그인을 넣으면 Markdown 등도 쓸 수 있습니다. 텍스트 필드마다 여러 언어를 담을 수 있고, 플레이어는 읽는 사람의 언어를 보여 줍니다.

## 리소스

리소스는 스토리 안의 URL입니다. HTTP(S), `data:`, `blob:` URL은 바로 불러옵니다. 아카이브, 앱 전용 프로토콜, CDN 매핑에는 스킴과 `load` 함수를 가진 리소스 플러그인을 추가하세요. 허용 범위를 벗어나려는 URL(`..`, 빈 경로, 안전하지 않은 경로)은 불러오기 전에 거부됩니다.

스토리를 시작하기 전에 Vega는 필요한 리소스를 모두 나열해 불러옵니다. 각 Live2D 모델이 실제로 쓰는 모션까지 포함하므로 재생 도중 다운로드로 멈추지 않습니다.

## 플러그인

```ts
const engine = new VegaEngine({
  officialPlugins: [threeRenderer, portableUi],
  plugins: [myAnalyticsPlugin],
});
```

`officialPlugins`는 배포물의 일부로 신뢰되고, `plugins`는 서드파티로 취급되어 서드파티 권한을 받습니다. 플러그인은 렌더러, UI 슬롯, 테마, 캐릭터 제공자, 명령, 리소스, 스토리지, 입력을 제공하며, 플러그인을 빼거나 엔진을 해제하면 모든 등록이 취소됩니다. 초기화에 실패한 플러그인은 완전히 되돌려집니다.

프로젝트는 필요한 플러그인을 기록하며, [마켓플레이스 카탈로그](https://github.com/haneoka-gakuen/vega-marketplace)가 공식 플러그인과 권한, 의존성을 나열합니다.

## 저장, 설정, 입력

기본 셸은 Vega의 스토리지 포트로 저장, 설정, 백로그를 제공하며, 기본으로는 브라우저에 저장합니다. 호스트 플러그인으로 다른 곳에 저장할 수 있으며, [Haneoka 호스트 플러그인](https://github.com/haneoka-gakuen/vega-plugin-haneoka)은 스토리지와 입력을 앱이 구현하는 작은 브리지로 넘깁니다.

## 배포

프로젝트를 사이트, PWA, 데스크톱 앱, 모바일 프로젝트로 만들려면 [Deneb](/ko/suite/deneb/)를 쓰세요.

## 참조

[Vega 저장소](https://github.com/haneoka-gakuen/vega) README가 엔진 API를, 각 플러그인의 README가 그 옵션 전체를 다룹니다.
