export type RegistryTheme = 'lime' | 'violet' | 'ocean' | 'coral'

export const registryThemes: Array<{
  id: RegistryTheme
  label: string
  color: string
}> = [
  { id: 'lime', label: 'Lime', color: '#d9ff57' },
  { id: 'violet', label: 'Violet', color: '#c4b5fd' },
  { id: 'ocean', label: 'Ocean', color: '#7dd3fc' },
  { id: 'coral', label: 'Coral', color: '#fda4af' },
]

export function useRegistryTheme() {
  const theme = useCookie<RegistryTheme>('registry-theme', {
    default: () => 'lime',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  function setTheme(value: RegistryTheme) {
    theme.value = value
  }

  watch(theme, (value) => {
    if (import.meta.client) document.documentElement.dataset.theme = value
  }, { immediate: true })

  useHead(() => ({
    htmlAttrs: {
      'data-theme': theme.value,
    },
  }))

  return {
    theme,
    themes: registryThemes,
    setTheme,
  }
}
import { watch } from 'vue'
