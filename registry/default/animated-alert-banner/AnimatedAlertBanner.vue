<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export type AnimatedAlertBannerTone = 'info' | 'success' | 'warning' | 'error'

const props = withDefaults(defineProps<{
  modelValue?: boolean
  title: string
  description?: string
  tone?: AnimatedAlertBannerTone
  duration?: number
  dismissible?: boolean
  expandable?: boolean
  disabled?: boolean
  label?: string
}>(), {
  modelValue: true,
  description: undefined,
  tone: 'info',
  duration: 320,
  dismissible: true,
  expandable: false,
  disabled: false,
  label: '',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  dismiss: []
  show: []
  toggle: [expanded: boolean]
}>()

const tones = {
  info: {
    shell: 'border-[#9cc7f5] bg-[#eef6ff] text-[#17324f]',
    icon: 'bg-[#d8eaff] text-[#1f6fba]',
    accent: 'bg-[#4c9ce5]',
    button: 'border-[#1f6fba]/20 hover:not-disabled:bg-[#1f6fba]/10 focus-visible:ring-[#1f6fba]/30',
  },
  success: {
    shell: 'border-[#9ed7b0] bg-[#edf9f0] text-[#173c25]',
    icon: 'bg-[#d5f0dd] text-[#267a42]',
    accent: 'bg-[#3da861]',
    button: 'border-[#267a42]/20 hover:not-disabled:bg-[#267a42]/10 focus-visible:ring-[#267a42]/30',
  },
  warning: {
    shell: 'border-[#ebc879] bg-[#fff8e5] text-[#4b3513]',
    icon: 'bg-[#f9e8b8] text-[#9a6414]',
    accent: 'bg-[#e0a12d]',
    button: 'border-[#9a6414]/20 hover:not-disabled:bg-[#9a6414]/10 focus-visible:ring-[#9a6414]/30',
  },
  error: {
    shell: 'border-[#eca59f] bg-[#fff0ee] text-[#50201c]',
    icon: 'bg-[#f8d7d3] text-[#bd3c32]',
    accent: 'bg-[#df554a]',
    button: 'border-[#bd3c32]/20 hover:not-disabled:bg-[#bd3c32]/10 focus-visible:ring-[#bd3c32]/30',
  },
} as const

const banner = ref<HTMLElement | null>(null)
const expanded = ref(false)
const uid = useId()
const titleId = `alert-banner-title-${uid}`
const descriptionId = `alert-banner-description-${uid}`
const detailsId = `alert-banner-details-${uid}`
let lastFocusedOutside: HTMLElement | null = null
let focusRestoreTarget: HTMLElement | null = null
let pendingFocusRestore = false
let focusRestoreTimer: ReturnType<typeof setTimeout> | undefined
const focusableSelector = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

const safeDuration = computed(() => {
  if (!Number.isFinite(props.duration)) return 320
  return Math.min(2000, Math.max(0, Math.round(props.duration)))
})
const rootStyle = computed(() => ({ '--alert-banner-duration': `${safeDuration.value}ms` }))
const role = computed(() => props.tone === 'warning' || props.tone === 'error' ? 'alert' : 'status')
const accessibleLabel = computed(() => props.label.trim() || undefined)
const describedBy = computed(() => {
  const ids = []
  if (props.description) ids.push(descriptionId)
  if (expanded.value) ids.push(detailsId)
  return ids.join(' ') || undefined
})

function getFocusFallback() {
  if (typeof document === 'undefined') return null
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(focusableSelector))
    .filter(element => !banner.value?.contains(element) && element.getAttribute('aria-hidden') !== 'true')

  const currentBanner = banner.value
  if (currentBanner) {
    const following = candidates.find(element => Boolean(currentBanner.compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING))
    if (following) return following
  }
  if (lastFocusedOutside?.isConnected && lastFocusedOutside.matches(focusableSelector) && !banner.value?.contains(lastFocusedOutside)) return lastFocusedOutside
  return candidates[0]
    ?? null
}

function restoreFocusIfNeeded() {
  if (!banner.value?.contains(document.activeElement)) return
  focusRestoreTarget = getFocusFallback()
  pendingFocusRestore = true
  if (focusRestoreTimer) clearTimeout(focusRestoreTimer)
  focusRestoreTimer = setTimeout(completeFocusRestore, safeDuration.value + 60)
  nextTick(() => {
    if (pendingFocusRestore && focusRestoreTarget?.isConnected && focusRestoreTarget.matches(focusableSelector)) {
      focusRestoreTarget.focus({ preventScroll: true })
    }
  })
}

function completeFocusRestore() {
  if (!pendingFocusRestore) return
  pendingFocusRestore = false
  if (focusRestoreTimer) clearTimeout(focusRestoreTimer)
  focusRestoreTimer = undefined
  const target = focusRestoreTarget?.isConnected && focusRestoreTarget.matches(focusableSelector)
    ? focusRestoreTarget
    : getFocusFallback()
  focusRestoreTarget = null
  target?.focus({ preventScroll: true })
}

function setExpanded(value: boolean) {
  if (expanded.value === value) return
  expanded.value = value
  emit('toggle', value)
}

function show() {
  if (props.disabled || props.modelValue) return
  emit('update:modelValue', true)
  emit('show')
}

function dismiss() {
  if (props.disabled || !props.modelValue) return
  restoreFocusIfNeeded()
  setExpanded(false)
  emit('update:modelValue', false)
  emit('dismiss')
}

function toggle() {
  if (props.disabled || !props.expandable || !props.modelValue) return
  setExpanded(!expanded.value)
}

async function focus(options?: FocusOptions) {
  await nextTick()
  banner.value?.focus(options)
}

function rememberExternalFocus(event: FocusEvent) {
  const target = event.target
  if (target instanceof HTMLElement && !banner.value?.contains(target)) lastFocusedOutside = target
}

watch(() => props.modelValue, (visible) => {
  if (visible) {
    pendingFocusRestore = false
    return
  }
  restoreFocusIfNeeded()
  setExpanded(false)
})

watch(() => props.expandable, (expandable) => {
  if (!expandable) setExpanded(false)
})

onMounted(() => document.addEventListener('focusin', rememberExternalFocus))
onBeforeUnmount(() => {
  document.removeEventListener('focusin', rememberExternalFocus)
  if (focusRestoreTimer) clearTimeout(focusRestoreTimer)
})

defineExpose({ show, dismiss, toggle, focus })
</script>

<template>
  <Transition name="alert-banner" @after-leave="completeFocusRestore">
    <section
      v-if="modelValue"
      ref="banner"
      data-testid="animated-alert-banner"
      class="animated-alert-banner relative w-full overflow-hidden rounded-[20px] border p-4 shadow-[0_18px_45px_-32px_currentColor] outline-none sm:p-5"
      :class="[tones[tone].shell, { 'opacity-55': disabled }]"
      :style="rootStyle"
      :role="role"
      :aria-live="role === 'alert' ? 'assertive' : 'polite'"
      aria-atomic="true"
      :aria-label="accessibleLabel"
      :aria-labelledby="accessibleLabel ? undefined : titleId"
      :aria-describedby="describedBy"
      :aria-disabled="disabled || undefined"
      tabindex="-1"
    >
      <span class="absolute inset-y-3 left-0 w-1 rounded-r-full" :class="tones[tone].accent" aria-hidden="true" />

      <div class="flex items-start gap-3.5 sm:gap-4">
        <span class="grid size-9 shrink-0 place-items-center rounded-xl sm:size-10" :class="tones[tone].icon" aria-hidden="true">
          <svg v-if="tone === 'success'" class="size-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="m5 12 4.2 4L19 6.5" stroke-linecap="round" stroke-linejoin="round" /></svg>
          <svg v-else-if="tone === 'warning'" class="size-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><path d="M12 4 3.5 19h17L12 4Z" stroke-linejoin="round" /><path d="M12 9v4m0 3h.01" stroke-linecap="round" /></svg>
          <svg v-else-if="tone === 'error'" class="size-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="m9 9 6 6m0-6-6 6" stroke-linecap="round" /></svg>
          <svg v-else class="size-[18px] fill-none stroke-current stroke-2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5m0-8h.01" stroke-linecap="round" /></svg>
        </span>

        <div class="min-w-0 flex-1 pt-0.5">
          <h2 :id="titleId" data-testid="alert-banner-title" class="text-sm font-semibold leading-5 tracking-[-0.015em] sm:text-[15px]">{{ title }}</h2>
          <p v-if="description" :id="descriptionId" data-testid="alert-banner-description" class="mt-1 text-xs leading-5 opacity-70 sm:text-[13px]">{{ description }}</p>

          <Transition name="alert-details">
            <div v-if="expandable && expanded" :id="detailsId" data-testid="alert-banner-details" class="alert-banner-details mt-3 border-t border-current/10 pt-3 text-xs leading-5 opacity-75 sm:text-[13px]">
              <slot name="details" :expanded="expanded" :dismiss="dismiss">
                This notice includes additional context. Review it before continuing.
              </slot>
            </div>
          </Transition>

          <div v-if="$slots.action || expandable" data-testid="alert-banner-actions" class="mt-3 flex flex-wrap items-center gap-2">
            <slot name="action" :dismiss="dismiss" :show="show" :toggle="toggle" :expanded="expanded" :disabled="disabled" />
            <button
              v-if="expandable"
              type="button"
              data-testid="alert-banner-toggle"
              class="inline-flex min-h-9 items-center gap-1.5 rounded-full border px-3 text-[11px] font-semibold outline-none transition-[background-color,box-shadow] focus-visible:ring-4 disabled:cursor-not-allowed motion-reduce:transition-none"
              :class="tones[tone].button"
              :disabled="disabled"
              :aria-expanded="expanded"
              :aria-controls="detailsId"
              @click="toggle"
            >
              {{ expanded ? 'Show less' : 'Learn more' }}
              <svg class="size-3.5 fill-none stroke-current stroke-2 transition-transform motion-reduce:transition-none" :class="expanded ? 'rotate-180' : ''" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7.5 5 5 5-5" stroke-linecap="round" stroke-linejoin="round" /></svg>
            </button>
          </div>
        </div>

        <button
          v-if="dismissible"
          type="button"
          data-testid="alert-banner-dismiss"
          class="grid size-9 shrink-0 place-items-center rounded-full border border-transparent text-current opacity-55 outline-none transition-[opacity,background-color,box-shadow] hover:not-disabled:bg-current/10 hover:not-disabled:opacity-100 focus-visible:opacity-100 focus-visible:ring-4 focus-visible:ring-current/20 disabled:cursor-not-allowed motion-reduce:transition-none"
          :disabled="disabled"
          :aria-label="`Dismiss ${label || title}`"
          @click="dismiss"
        >
          <svg class="size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true"><path d="m5 5 10 10m0-10L5 15" stroke-linecap="round" /></svg>
        </button>
      </div>
    </section>
  </Transition>
</template>

<style scoped>
.alert-banner-enter-active,
.alert-banner-leave-active {
  transition: opacity var(--alert-banner-duration) ease, transform var(--alert-banner-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.alert-banner-enter-from,
.alert-banner-leave-to {
  opacity: 0;
  transform: translateY(-10px) scale(0.985);
}

.alert-details-enter-active,
.alert-details-leave-active {
  transition: opacity calc(var(--alert-banner-duration) * 0.75) ease, transform calc(var(--alert-banner-duration) * 0.75) cubic-bezier(0.22, 1, 0.36, 1);
}

.alert-details-enter-from,
.alert-details-leave-to {
  opacity: 0;
  transform: translateY(-5px);
}

@media (prefers-reduced-motion: reduce) {
  .alert-banner-enter-active,
  .alert-banner-leave-active,
  .alert-details-enter-active,
  .alert-details-leave-active {
    transition: none;
  }
}
</style>
