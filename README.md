# 71159176 UI Registry

Nuxt 3, Tailwind CSS v4, shadcn-vue로 만든 Vue 컴포넌트 레지스트리입니다.

## 시작하기

```bash
bun install
bun run dev
```

주요 명령어:

```bash
bun run typecheck       # Vue/TypeScript 검사
bun run registry:build  # registry.json -> public/r/*.json
bun run build           # Nuxt 프로덕션 빌드
```

## 레지스트리 설치

배포 후 각 컴포넌트는 다음 형식으로 설치할 수 있습니다.

```bash
bunx shadcn-vue@latest add "https://otel.71159176.xyz/r/interactive-hover-button.json"
```

`components.json`에 네임스페이스를 등록하면 짧은 이름도 사용할 수 있습니다.

```json
{
  "registries": {
    "@71159176": "https://otel.71159176.xyz/r/{name}.json"
  }
}
```

```bash
bunx shadcn-vue@latest add @71159176/interactive-hover-button
```

## 새 컴포넌트 추가

1. `registry/default/<component-name>/ComponentName.vue`를 작성합니다.
2. 루트 `registry.json`의 `items`에 컴포넌트를 등록합니다.
3. `app/data/components.ts`에 사이트용 메타데이터와 props를 추가합니다.
4. `app/pages/components/[slug].vue`의 preview 분기에 컴포넌트를 연결합니다.
5. `bun run registry:build`를 실행해 배포 JSON을 갱신합니다.

생성된 파일은 `public/r/<component-name>.json`이며 Nuxt 배포 시 정적 URL로 함께 제공됩니다.

## 페이지 구조

```text
app/pages/
├── index.vue                   # 레지스트리 홈
├── components/
│   ├── index.vue              # 검색/필터 가능한 전체 목록
│   └── [slug].vue             # 미리보기, 설정, API, 설치 명령
├── categories/
│   └── [category].vue         # 카테고리별 컴포넌트
└── docs/
    └── registry.vue           # 제작 및 배포 가이드
```
