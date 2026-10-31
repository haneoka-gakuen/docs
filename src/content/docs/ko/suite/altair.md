---
title: Altair
description: Vega 실시간 미리보기, 플로차트, WebGAL·Bestdori·일반 문장 가져오기로 비주얼 노벨을 쓰고, 번역하고, 연출합니다.
---

Altair는 스위트의 에디터입니다. 프로젝트의 장면, 언어, 에셋, 캐릭터, 플러그인을 한 작업 공간에서 엽니다. 스크립트 보기와 명령별 양식, 에셋 브라우저, 스토리 전체 플로차트, 커서를 따라가는 [Vega](/ko/suite/vega/) 실시간 미리보기가 있습니다. 편집하는 것은 Vega가 재생하고 [Deneb](/ko/suite/deneb/)가 내보내는 것과 같은 데이터입니다.

## 프로젝트 시작

시작하는 방법은 세 가지입니다.

- **폴더 열기.** Chromium 계열 브라우저에서 Altair는 디스크의 폴더를 직접 다룹니다. 장면과 에셋을 읽고 편집 내용을 같은 파일에 저장합니다. 다른 브라우저는 파일을 읽기 전용으로 열고 변경 내용을 내보냅니다.
- **가져오기.** WebGAL 프로젝트 폴더와 WebGAL Craft 프로젝트, Bestdori 시나리오, ADV JSON, 일반 문장을 모두 Altair 프로젝트로 만들 수 있습니다. 바꾸지 않은 WebGAL 장면은 바이트 하나 바꾸지 않고 다시 씁니다.
- **예제에서 시작.** [First Light](https://github.com/haneoka-gakuen/vega-example-first-light)는 열어서 고쳐 보도록 만든 짧은 스토리입니다.

## 쓰기

모든 명령에는 형식이 정해진 필드를 가진 양식이 있습니다. 화자, 언어별 본문, 캐릭터의 모션과 표정, 에셋 브라우저에서 고른 배경, 이징이 있는 카메라 이동 등입니다. 스크립트 보기는 명령마다 한 줄 요약을 보여 주며, 언제든 원본 텍스트로 바꿀 수 있습니다.

프로젝트에는 언어를 얼마든지 둘 수 있고, 각각 글꼴을 지정할 수 있습니다. 텍스트 필드는 모든 언어를 담고, 미리보기는 고른 언어로 재생합니다.

[Altair Prose](https://github.com/haneoka-gakuen/altair-plugin-prose)는 붙여 넣은 장을 초안 장면으로 바꿉니다. 화자 줄과 따옴표 대사는 대사가 되고 나머지는 서술이 되며, 모두 검토 표시가 붙습니다.

## 스토리 확인

- **미리보기.** Vega 미리보기는 입력에 맞춰 갱신되고, 커서 위치의 명령으로 이동하며, 어디서든 재생하고, 중단점으로 한 단계씩 나아가거나 저장하지 않고 몇 가지 명령을 시험할 수 있습니다. 무대에서 캐릭터를 끌면 그 위치가 명령에 다시 기록됩니다.
- **플로차트.** 장면, 선택지, 점프, 호출, 엔딩을 그래프로 보여 줍니다. 어떤 경로로도 닿지 않는 장면, 없는 라벨로의 점프, 중복 라벨, 출구 없는 반복도 알려 줍니다.
- **캐릭터.** [Altair Models](https://github.com/haneoka-gakuen/altair-plugin-models)는 Live2D, 이미지, GIF, 동영상을 겹친 캐릭터를 만들고 한 번의 클릭으로 장면에 추가합니다.

## 안전장치

실행 취소와 다시 실행은 프로젝트와 열려 있는 모든 문서에 적용됩니다. 저장하지 않은 편집은 브라우저에 초안으로 남아 새로 고침이나 충돌 뒤에 돌아옵니다. 그사이 프로젝트가 바뀌었다면 Altair는 아무것도 덮어쓰지 않고 더는 적용할 수 없는 초안을 보여 줍니다.

## 게임 에셋 사용

네트워크 어댑터를 설정하면 에셋 브라우저에 다음을 표시할 수 있습니다.

- Our Notes 배경, 스틸, 이펙트, Live2D, BGM, 보이스와 공식 스토리 전체를 편집 가능한 프로젝트로 담은 [haneoka.org 카탈로그](https://github.com/haneoka-gakuen/altair-plugin-haneoka)
- 가루파용 [Bestdori](https://github.com/haneoka-gakuen/altair-plugin-bestdori) 에셋 트리

## 플러그인

위의 모든 기능이 플러그인입니다. [Altair Full Preset](https://github.com/haneoka-gakuen/altair-preset-full)으로 공식 세트를 설치합니다. 프로젝트는 쓰는 플러그인을 기록하고, [마켓플레이스 플러그인](https://github.com/haneoka-gakuen/altair-plugin-marketplace)이 빌드 전에 버전, 의존성, 권한을 확인해 잠금 파일을 씁니다. 서드파티 플러그인은 [샌드박스](https://github.com/haneoka-gakuen/altair-plugin-sandbox)로 워커 안에 격리해 실행할 수 있습니다.

## Altair 실행

```sh
git clone https://github.com/haneoka-gakuen/altair.git
cd altair
pnpm install --frozen-lockfile
pnpm dev
```

같은 부품으로 직접 에디터를 만들려면 `@haneoka/altair`와 원하는 플러그인을 설치하고, `AltairPluginHost`를 만든 뒤 플러그인을 등록하세요. 방법은 각 플러그인의 README에 있습니다.
