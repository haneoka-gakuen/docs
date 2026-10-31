---
title: Cassiopeia
description: haneoka.org 채보 플레이어를 이루는 리듬 게임 엔진. 커널, 플러그인, Vue 컴포넌트, Sonolus 변환.
---

Cassiopeia는 haneoka.org의 채보 플레이어와 채보 뷰어를 이루는 리듬 게임 엔진입니다. 커널은 채보를 읽고, 시간을 정수 밀리초로 관리하며, 각 터치가 어느 노트에 해당하는지 정하고, 판정과 점수 계산을 한 뒤, 피버 구간, 스킬, 콤보를 이벤트로 알립니다. 그리기와 소리 재생은 하지 않고 플러그인이 맡으므로, 같은 커널로 웹 플레이어, 채보 개요, Sonolus 레벨, 네이티브 앱을 돌릴 수 있습니다.

커널은 TypeScript 버전과 Rust 버전(WebAssembly와 네이티브 Android·iOS 호스트용)이 있으며, 같은 입력에 같은 결과를 냅니다.

## 구성

| 패키지 | 역할 |
| --- | --- |
| [`@haneoka/cassiopeia`](https://github.com/haneoka-gakuen/cassiopeia) | 커널, 플러그인 런타임, WebAssembly와 네이티브 바인딩 |
| [Our Notes 플러그인](https://github.com/haneoka-gakuen/cassiopeia-plugin-our-notes) | Our Notes 채보, 판정 타이밍, 스킨, 이펙트 |
| [Sekai 플러그인](https://github.com/haneoka-gakuen/cassiopeia-plugin-sekai) | 표시용 프로젝트 세카이 SUS 채보 |
| [Three.js 렌더러](https://github.com/haneoka-gakuen/cassiopeia-renderer-three) | 3D 무대, 노트, 이펙트, HUD |
| [웹 호스트](https://github.com/haneoka-gakuen/cassiopeia-host-web) | 브라우저의 오디오 시계, 노트 효과음, 포인터 입력 |
| [Vue UI](https://github.com/haneoka-gakuen/cassiopeia-ui-vue) | `ChartPlayer`와 `ChartOverview` 컴포넌트 |
| [Sonolus 변환](https://github.com/haneoka-gakuen/cassiopeia-plugin-sonolus) | 채보를 Sonolus 레벨 데이터와 USC로 변환 |

## Vue 채보 플레이어

```sh
pnpm add vue @haneoka/cassiopeia @haneoka/cassiopeia-plugin-our-notes \
  @haneoka/cassiopeia-renderer-three @haneoka/cassiopeia-host-web @haneoka/cassiopeia-ui-vue
```

```vue
<ChartPlayer :chart="chart" :assets="assets" audio-url="/songs/101.mp3" mode="watch" @ready="player.play()" ref="player" />
```

`mode="watch"`는 자동 재생, `mode="play"`는 터치나 마우스로 직접 플레이합니다. 플레이어는 판정, 콤보, 피버 이벤트를 내보내며, 오디오 대신 직접 정한 시계를 따르게 할 수도 있습니다. 에디터나 동영상 내보내기는 이 방식으로 동기를 맞춥니다. `ChartOverview`는 채보 전체를 세로로 긴 캔버스 하나에 그리고 콤보 수, BPM 변화, 피버 구간, 스킬 구간을 표시합니다.

아무것도 설치하지 않고 haneoka.org 채보를 보여 주려면 [Cassiopeia 임베드](/ko/embed/cassiopeia/)를 쓰세요.

## 커널 직접 사용

```ts
import { CassiopeiaRuntime, createKernelPlugin, CASSIOPEIA_SESSION } from "@haneoka/cassiopeia/plugin";
import { createOurNotesPlugin, OUR_NOTES_RULES } from "@haneoka/cassiopeia-plugin-our-notes";

const runtime = new CassiopeiaRuntime([createKernelPlugin(), createOurNotesPlugin()]);
const chart = runtime.require(OUR_NOTES_RULES).parse(source);
const session = runtime.require(CASSIOPEIA_SESSION).create(chart, { mode: "play" });

session.on("judgement", (event) => console.log(event));
session.tap(lane, audioTimeMs);
const { score, combo } = session.update(audioTimeMs);
```

세션은 `tap`, `release`, `flick`, `trace` 입력을 받으며 포인터 ID는 선택입니다. `update`는 점수, 콤보, 라이프, 풀 콤보 상태 스냅숏을 반환합니다. 자체 게임, 점수 시뮬레이터, 채보 분석기를 만들기에 충분합니다.

## Sonolus

Our Notes 채보는 [Sonolus](https://sonolus.com) 앱에서 플레이할 수 있습니다. 변환 플러그인이 채보를 Sonolus 레벨 데이터로 바꾸고, [Sonolus 엔진](https://github.com/haneoka-gakuen/sonolus-our-notes)이 Our Notes의 판정과 이펙트로 재생합니다. haneoka.org는 모든 채보가 있는 [Sonolus 서버](/ko/sonolus/)를 운영합니다.

## 참조

[Cassiopeia 저장소](https://github.com/haneoka-gakuen/cassiopeia) README가 커널 API, 플러그인, 네이티브 바인딩을 다루고, 각 패키지 README가 그 옵션을 다룹니다.
