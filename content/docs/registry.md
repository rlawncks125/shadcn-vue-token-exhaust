---
title: Registry guide
description: 컴포넌트 소스와 메타데이터를 정적 shadcn-vue 레지스트리로 배포합니다.
eyebrow: Authoring
order: 3
---

# Design here. Install anywhere.

컴포넌트 소스와 메타데이터를 등록하면 shadcn-vue CLI가 읽을 수 있는 정적 JSON이 생성됩니다. 배포 후에는 URL 하나로 다른 프로젝트에 설치할 수 있습니다.

## 1. Create the component

레지스트리 소스는 variant와 컴포넌트 이름으로 구분합니다. Vue 파일은 미리보기와 배포 JSON이 공유하는 원본입니다.

```text
registry/
└── default/
    └── component-name/
        └── ComponentName.vue
```

스타일은 Tailwind utility를 사용합니다. 런타임 좌표, 진행률, 사용자 색상처럼 정적으로 표현할 수 없는 값만 inline style을 사용합니다.

## 2. Register metadata

`registry.json`의 `items`에 이름, 설명, 카테고리, npm 의존성, 레지스트리 의존성과 파일 경로를 추가합니다.

```json
{
  "name": "component-name",
  "type": "registry:component",
  "dependencies": [],
  "registryDependencies": [],
  "files": [
    {
      "path": "registry/default/component-name/ComponentName.vue",
      "type": "registry:component"
    }
  ]
}
```

## 3. Build the registry

```bash
bun run registry:build
```

빌드 결과는 `public/r/*.json`에 생성됩니다. 이 디렉터리는 Nuxt 정적 자산으로 배포되며 `/r/<name>.json` URL로 접근할 수 있습니다.

## 4. Test external installation

실제 소비자 프로젝트에서 배포 URL을 설치해 파일 경로와 의존성을 확인합니다.

<RegistryInstallCommand slug="component-name" />

타입 검사뿐 아니라 키보드, reduced motion, 모바일 레이아웃과 브라우저 오류도 검증해야 합니다.

## Route map

| Route | Purpose |
| --- | --- |
| `/components` | 전체 컴포넌트 탐색과 검색 |
| `/categories/[category]` | 카테고리별 컴포넌트 목록 |
| `/components/[slug]` | 미리보기, 디자인 설정, 설치와 API |
| `/r/[name].json` | shadcn-vue CLI가 읽는 배포 파일 |
