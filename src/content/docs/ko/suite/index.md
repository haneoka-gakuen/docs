---
title: 스위트
description: Vega, Altair, Deneb, Cassiopeia, Sonolus 엔진. haneoka.org를 이루는 오픈 소스 도구와 그 조합 방법.
---

haneoka.org에서 재생되는 모든 것(스토리, 채보, Home Spot 로비)은 여러분의 프로젝트에도 쓸 수 있는 오픈 소스 도구로 동작합니다. 도구는 비주얼 노벨용과 리듬 게임용 두 계열로 나뉩니다. 각 도구는 단독으로 쓸 수 있고, 플러그인으로 이루어지며, 다른 도구와 함께든 따로든 동작합니다.

## 비주얼 노벨

| 도구 | 설명 | 용도 |
| --- | --- | --- |
| [Vega](/ko/suite/vega/) | 플레이어. 웹과 네이티브 앱용 비주얼 노벨 엔진. | 페이지, 앱, 게임 안에서 스토리를 재생한다. |
| [Altair](/ko/suite/altair/) | 에디터. 장면, 언어, 에셋, 미리보기, 플로차트를 한 작업 공간에서 다룬다. | 스토리를 쓰고 번역하고 연출한다. |
| [Deneb](/ko/suite/deneb/) | 빌더. 명령줄 도구. | 완성된 스토리를 웹사이트, PWA, 데스크톱 앱, 모바일 프로젝트로 낸다. |

일반적인 프로젝트는 세 도구를 모두 거칩니다. Altair에서 쓰고 현지화하며, 작업 중에는 Vega로 확인하고, 다 되면 Deneb로 빌드합니다. 셋은 같은 스토리 형식을 쓰므로 중간에 변환이 없습니다.

Altair는 다른 도구의 프로젝트(WebGAL 폴더, Bestdori 시나리오, 일반 문장)도 열 수 있고, Vega는 호환 플러그인으로 WebGAL 프로젝트를 재생할 수 있어서 기존 프로젝트를 다시 쓰지 않고 옮길 수 있습니다.

## 리듬 게임

| 도구 | 설명 | 용도 |
| --- | --- | --- |
| [Cassiopeia](/ko/suite/cassiopeia/) | TypeScript와 Rust의 결정적 커널을 가진 리듬 게임 엔진. | 웹이나 네이티브 앱에서 채보를 표시, 플레이, 분석한다. |
| [Sonolus 엔진](/ko/sonolus/) | [Sonolus](https://sonolus.com)용 Our Notes 엔진. | Sonolus 앱에서 Our Notes 채보를 플레이한다. |

Cassiopeia는 Our Notes와 프로젝트 세카이 채보를 읽고 Sonolus 레벨로 변환합니다. haneoka.org의 채보 플레이어와 채보 뷰어는 Cassiopeia의 Vue 컴포넌트입니다.

## 직접 만들지 않고 임베드하기

스토리, 채보, Home Spot 장면을 페이지에 넣기만 하면 된다면 [JavaScript 임베드](/ko/embed/)가 script 태그 하나로 haneoka.org에서 모든 것을 불러옵니다. 자체 데이터, 자체 디자인, 자체 앱이 필요할 때 도구를 직접 쓰세요.

## 저장소

모든 도구는 [github.com/haneoka-gakuen](https://github.com/haneoka-gakuen) 아래 각자의 저장소에 있으며, 플러그인은 별도 패키지입니다. 각 저장소의 README가 그 패키지의 완전한 참조이고, 이 페이지들은 조합해 쓰는 방법을 설명합니다.

모두 MPL-2.0입니다. 클로즈드 소스 프로젝트에서도 쓸 수 있으며, 파일 자체를 바꾼 내용은 공유됩니다.
