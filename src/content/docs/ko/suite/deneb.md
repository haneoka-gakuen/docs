---
title: Deneb
description: Vega 프로젝트를 웹사이트, 오프라인 PWA, Electron·Tauri 앱, Android·iOS 프로젝트로 빌드합니다.
---

Deneb는 마지막 단계입니다. 완성된 [Vega](/ko/suite/vega/) 프로젝트를 설치해서 쓸 수 있는 형태로 바꿉니다. 프로젝트에 필요한 장면, 에셋, 플러그인이 모두 있는지 확인하고, 빌드를 반복할 수 있도록 정확한 버전을 고정한 뒤 요청한 대상을 만듭니다. 모든 대상에 같은 프로젝트와 같은 플레이어가 들어가므로 스토리는 어디서나 똑같이 동작합니다.

## 설치

```sh
git clone https://github.com/haneoka-gakuen/deneb.git
cd deneb
cargo install --locked --path crates/deneb-cli
```

## 프로젝트에서 빌드까지

```sh
deneb doctor --target android                 # what does this machine still need?
deneb validate my-story/project.vega.json     # is the project complete?
deneb plugins validate my-story/project.vega.json
deneb build my-story/project.vega.json --target pwa --output dist --runtime-bundle ./vega-runtime
```

`--runtime-bundle`에는 패키징할 Vega 런타임을 지정합니다. 런타임을 설명하는 `deneb-runtime.json`이 있는 폴더입니다.

## 대상

| 대상 | 결과물 |
| --- | --- |
| `web` | 상대 링크를 쓰는 정적 사이트. 어느 곳, 어느 경로에든 올릴 수 있습니다. |
| `pwa` | 사이트에 매니페스트와 서비스 워커를 더한 것. 오프라인 재생과 설치가 가능합니다. |
| `electron` | Chromium 샌드박스를 쓰는 데스크톱 앱. |
| `tauri` | 다운로드 크기가 훨씬 작은 데스크톱 앱. |
| `android`, `ios` | Android Studio나 Xcode에서 여는 네이티브 프로젝트. |

데스크톱과 모바일 빌드는 `--bundle-identifier`(기본값 `app.vega.<project-id>`)를 사용합니다.

## 릴리스 빌드와 미리보기 빌드

기본값인 `--mode release`는 프로젝트가 오프라인으로 완결되고 런타임이 고정되어 있지 않으면 빌드하지 않습니다. 재생할 때 네트워크에 의존하지 않는 결과가 나옵니다. `--mode preview`는 빠른 테스트를 위해 이 조건을 완화합니다.

플러그인 버전은 프로젝트 옆의 잠금 파일(`deneb.lock.json`, `vega.plugins.lock.json`)에서 정해지므로, 같은 프로젝트를 같은 잠금 파일로 빌드하면 같은 결과가 나옵니다. Vega 플러그인 잠금 파일은 [Altair 마켓플레이스 플러그인](https://github.com/haneoka-gakuen/altair-plugin-marketplace)이 대신 써 줄 수 있습니다.

## 라이선스가 필요한 런타임

Live2D Cubism Core처럼 직접 라이선스를 받아야 하는 서드파티 런타임이 필요한 캐릭터도 있습니다. Deneb는 이를 스스로 포함하지 않습니다. `--allow-private-external-runtimes`를 주면, 해당 라이선스로 배포하는 빌드에 프로젝트가 제공한 런타임을 포함합니다.

## 자동화

모든 명령이 `--json`을 받고 안정적인 코드로 오류를 보고하므로 Deneb는 CI에 넣기 좋습니다. `deneb doctor --json`을 쓰면 빌드 머신에 툴체인이 빠졌을 때 일찍 실패하게 할 수 있습니다.

## 참조

[Deneb 저장소](https://github.com/haneoka-gakuen/deneb)에 전체 옵션 목록과 프로젝트 형식, 대상, 런타임 계약, 플러그인 시스템 설명이 있습니다.
