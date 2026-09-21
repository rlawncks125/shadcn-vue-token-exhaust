---
title: Documentation
description: 71159176 UI 컴포넌트를 탐색하고 설치하기 위한 시작점입니다.
eyebrow: Getting started
order: 1
---

# Build with small, sharp pieces.

71159176 UI는 Nuxt와 shadcn-vue를 위한 설치형 컴포넌트 컬렉션입니다. 각 컴포넌트는 프로젝트 안으로 직접 설치되므로 소유권을 유지하면서 자유롭게 수정할 수 있습니다.

## Explore the library

[전체 컴포넌트](/components)에서 이름, 카테고리, 태그로 컴포넌트를 찾을 수 있습니다. 상세 문서에는 실제 동작하는 미리보기, 디자인 컨트롤, 설치 명령과 API 레퍼런스가 함께 제공됩니다.

## Start in three steps

1. shadcn-vue가 설정된 Nuxt 프로젝트를 준비합니다.
2. 상세 문서의 설치 명령을 실행합니다.
3. 생성된 Vue 파일을 프로젝트에 맞게 수정합니다.

<RegistryInstallCommand slug="interactive-hover-button" />

## Documentation map

- [Installation](/docs/installation): 프로젝트 준비와 컴포넌트 설치
- [Registry guide](/docs/registry): 레지스트리 작성, 빌드, 배포
- [Components](/components): 전체 컴포넌트와 인터랙티브 API 문서

## Design principles

### Own the source

패키지 런타임에 의존하지 않습니다. 설치된 소스는 현재 프로젝트의 일부가 됩니다.

### Accessible by default

키보드 흐름, 포커스 복원, reduced motion, 적절한 ARIA 상태를 구현 단계에서 함께 다룹니다.

### Motion with intent

움직임은 상태와 공간 관계를 설명하는 데 사용합니다. 장식보다 입력 피드백과 맥락 보존을 우선합니다.
