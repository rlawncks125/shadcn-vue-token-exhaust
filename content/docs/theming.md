---
title: Theming
description: 의미 기반 CSS 변수로 레지스트리와 사이트의 색상 체계를 프로젝트에 맞게 변경합니다.
eyebrow: Design tokens
order: 4
---

# Theme the registry without rewriting components.

레지스트리는 shadcn의 기본 semantic token과 작은 확장 토큰 집합을 사용합니다. 색상 값을 컴포넌트마다 수정하는 대신 루트 변수를 재정의하면 포커스, 선택 상태, 배경과 강조색이 함께 변경됩니다.

## Core tokens

| Token | Purpose |
| --- | --- |
| `--background`, `--foreground` | 기본 페이지와 텍스트 |
| `--card`, `--card-foreground` | 카드와 떠 있는 표면 |
| `--primary`, `--primary-foreground` | 주요 액션과 활성 상태 |
| `--accent`, `--accent-foreground` | hover와 낮은 강조 표면 |
| `--border`, `--ring` | 구분선과 키보드 포커스 |
| `--brand`, `--brand-strong`, `--brand-soft` | 사이트 브랜드의 세 단계 |
| `--shell`, `--canvas`, `--code` | 문서 셸, 미리보기 캔버스, 코드 표면 |

## Define a preset

Tailwind 설정을 다시 작성하지 않고 CSS 변수만 교체할 수 있습니다.

```css
:root[data-theme="ocean"] {
  --brand: #7dd3fc;
  --brand-strong: #0369a1;
  --brand-soft: #e0f2fe;
  --primary: var(--brand);
  --primary-foreground: #171814;
  --accent: var(--brand-soft);
  --ring: var(--brand-strong);
  --shell: #f1f6f7;
  --canvas: #e3ecee;
}
```

```ts
document.documentElement.dataset.theme = 'ocean'
```

## Portable component tokens

설치형 컴포넌트에서 브랜드 강조색을 직접 사용해야 할 때는 fallback을 포함한 변수를 권장합니다.

```vue
<button class="bg-[var(--registry-accent,#d9ff57)] text-[var(--registry-accent-foreground,#171814)]">
  Continue
</button>
```

소비자 프로젝트는 다음 값만 선택적으로 제공하면 됩니다.

```css
:root {
  --registry-accent: var(--primary);
  --registry-accent-foreground: var(--primary-foreground);
  --registry-surface: var(--card);
  --registry-foreground: var(--foreground);
}
```

값을 제공하지 않아도 각 컴포넌트의 fallback 색상으로 동작합니다. 상태를 전달하는 destructive, warning, success 색상은 브랜드 토큰과 분리해 의미가 바뀌지 않도록 유지하세요.

## Runtime switching

이 문서 사이트의 헤더에 있는 Theme 메뉴는 선택한 프리셋을 쿠키에 저장합니다. Nuxt SSR에서도 같은 `data-theme` 속성을 렌더링하므로 새로고침 후 색상이 튀는 현상을 줄입니다.
