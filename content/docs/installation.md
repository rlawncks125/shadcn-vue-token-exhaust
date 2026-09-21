---
title: Installation
description: Nuxt 프로젝트를 준비하고 레지스트리 컴포넌트를 설치합니다.
eyebrow: Getting started
order: 2
---

# Installation

컴포넌트는 shadcn-vue CLI를 통해 현재 프로젝트에 직접 설치됩니다. 패키지를 import하는 대신 Vue 소스와 필요한 의존성을 함께 받습니다.

## Prerequisites

- Nuxt 3 또는 Vue 3
- Tailwind CSS v4
- TypeScript 권장
- shadcn-vue 설정 파일 `components.json`

## Initialize shadcn-vue

아직 설정하지 않았다면 프로젝트 루트에서 초기화를 실행합니다.

```bash
bunx shadcn-vue@latest init
```

CLI 안내에 따라 Tailwind CSS 파일과 컴포넌트 alias를 지정합니다. 이 레지스트리는 일반적으로 `@/components`, `@/components/ui`, `@/lib` alias를 사용합니다.

## Install a component

각 컴포넌트 문서에 표시된 URL을 `add` 명령에 전달합니다.

<RegistryInstallCommand slug="mask-reveal" />

레지스트리 항목에 `registryDependencies`가 있으면 Button, Input, Label 같은 공용 unit과 npm 의존성도 자동으로 설치됩니다.

## Verify the result

설치 후 프로젝트의 타입 검사와 빌드를 실행합니다.

```bash
bun run typecheck
bun run build
```

## Update a component

동일한 명령을 다시 실행하고 CLI의 overwrite 안내를 따릅니다. 컴포넌트 소스가 프로젝트에 존재하므로 업데이트 전에 로컬 수정 내용을 확인해야 합니다.

## Next steps

[전체 컴포넌트](/components)를 탐색하거나 [Registry guide](/docs/registry)에서 자체 항목을 배포하는 방법을 확인하세요.
