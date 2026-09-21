export default defineNuxtPlugin((nuxtApp) => {
  const pagePending = useState('page-pending', () => false)
  let mounted = false

  nuxtApp.hook('app:mounted', () => {
    mounted = true
  })
  nuxtApp.hook('page:start', () => {
    if (mounted) pagePending.value = true
  })
  nuxtApp.hook('page:finish', () => {
    pagePending.value = false
  })
  nuxtApp.hook('app:error', () => {
    pagePending.value = false
  })
})
