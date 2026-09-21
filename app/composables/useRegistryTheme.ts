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
  const theme = useState<RegistryTheme>('registry-theme', () => 'lime')

  onMounted(() => {
    const stored = localStorage.getItem('registry-theme')
    if (registryThemes.some(option => option.id === stored)) theme.value = stored as RegistryTheme
    watch(theme, (value) => {
      localStorage.setItem('registry-theme', value)
      document.documentElement.dataset.theme = value
    }, { immediate: true })
  })

  function setTheme(value: RegistryTheme) {
    theme.value = value
  }

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
import { onMounted, watch } from 'vue'
