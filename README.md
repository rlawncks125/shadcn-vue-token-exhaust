# 71159176 UI Registry

Nuxt 3, Tailwind CSS v4, shadcn-vue로 만든 Vue 컴포넌트 레지스트리입니다.

라이브 사이트: <https://shadcn.71159176.xyz/>

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

## 렌더링과 Cloudflare 캐시

- `/`는 빌드 시 prerender되는 SSG 페이지입니다.
- `/components/**`는 요청 시 렌더링되는 SSR 페이지입니다.
- SSR HTML은 브라우저에 저장하지 않고 Cloudflare edge에서 5분간 캐시하며, 최대 1시간 stale 응답을 허용합니다.
- registry JSON은 edge에서 1시간, syntax highlight API는 edge에서 1일간 캐시합니다.
- 정적 홈페이지에 들어가는 registry 주소는 `NUXT_PUBLIC_SITE_URL`로 변경할 수 있으며 기본값은 `https://shadcn.71159176.xyz`입니다.

Cloudflare Tunnel은 origin 연결만 제공하고 HTML을 자동으로 캐시하지 않습니다. Cloudflare Dashboard의 **Caching > Cache Rules**에서 다음 경로를 `Eligible for cache`로 설정하고 Edge TTL은 `Use cache-control header if present`로 설정해야 응답의 `Cloudflare-CDN-Cache-Control` 정책이 적용됩니다.

```text
URI Path equals /
URI Path starts with /components/
URI Path starts with /r/
URI Path starts with /api/highlight/
```

배포 직후 즉시 새 HTML이 필요하면 Cloudflare에서 `/`와 `/components/*`를 purge합니다. 해시가 붙는 `/_nuxt/` asset은 Nuxt 기본 immutable 캐시 정책을 그대로 사용합니다.

## 레지스트리 설치

배포 후 각 컴포넌트는 다음 형식으로 설치할 수 있습니다.

```bash
bunx shadcn-vue@latest add "https://shadcn.71159176.xyz/r/interactive-hover-button.json"
```

`components.json`에 네임스페이스를 등록하면 짧은 이름도 사용할 수 있습니다.

```json
{
  "registries": {
    "@71159176": "https://shadcn.71159176.xyz/r/{name}.json"
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
