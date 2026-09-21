<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useAttrs, useId, watch } from 'vue'

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<{
  modelValue: string
  label: string
  placeholder?: string
  minRows?: number
  maxRows?: number
  maxLength?: number
  duration?: number
  disabled?: boolean
  readonly?: boolean
  required?: boolean
  name?: string
  description?: string
  error?: string
  showCount?: boolean
  clearable?: boolean
  id?: string
}>(), {
  placeholder: undefined,
  minRows: 3,
  maxRows: 10,
  maxLength: undefined,
  duration: 180,
  disabled: false,
  readonly: false,
  required: false,
  name: undefined,
  description: undefined,
  error: undefined,
  showCount: false,
  clearable: false,
  id: undefined,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'input': [event: Event]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'resize': [height: number]
  'limit': [value: string, maxLength: number]
}>()

const attrs = useAttrs()
const textareaElement = ref<HTMLTextAreaElement>()
const focused = ref(false)
const generatedId = `auto-resize-textarea-${useId()}`
const textareaId = computed(() => props.id || generatedId)
const statusId = computed(() => `${textareaId.value}-status`)
const countId = computed(() => `${textareaId.value}-count`)
const safeMinRows = computed(() => Number.isFinite(props.minRows) ? Math.min(50, Math.max(1, Math.floor(props.minRows))) : 3)
const safeMaxRows = computed(() => Number.isFinite(props.maxRows) ? Math.min(100, Math.max(safeMinRows.value, Math.floor(props.maxRows))) : Math.max(10, safeMinRows.value))
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 180)
const safeMaxLength = computed(() => Number.isFinite(props.maxLength) ? Math.min(1_000_000, Math.max(0, Math.floor(props.maxLength!))) : undefined)
const textareaValue = computed(() => safeMaxLength.value == null ? props.modelValue : props.modelValue.slice(0, safeMaxLength.value))
const hasValue = computed(() => textareaValue.value.length > 0)
const status = computed(() => props.error || props.description || '')
const countText = computed(() => safeMaxLength.value == null ? String(textareaValue.value.length) : `${textareaValue.value.length} / ${safeMaxLength.value}`)
const controlTestId = computed(() => typeof attrs['data-testid'] === 'string' ? attrs['data-testid'] : 'auto-resize-textarea-control')
const ariaInvalid = computed<true | false | 'true' | 'false' | 'grammar' | 'spelling' | undefined>(() => {
  if (props.error) return 'true'
  const provided = attrs['aria-invalid']
  if (provided === true || provided === false || provided === 'true' || provided === 'false' || provided === 'grammar' || provided === 'spelling') return provided
  return undefined
})
const describedBy = computed(() => {
  const provided = attrs['aria-describedby']
  return [
    provided == null ? '' : String(provided),
    status.value ? statusId.value : '',
    props.showCount ? countId.value : '',
  ].filter(Boolean).join(' ') || undefined
})
const forwardedAttrs = computed(() => {
  const {
    'aria-describedby': _describedBy,
    'aria-invalid': _invalid,
    'data-testid': _testId,
    ...rest
  } = attrs
  return rest
})

let resizeFrame: number | undefined
let resizeObserver: ResizeObserver | undefined
let lastHeight = -1
let lastWidth = -1
let limitReached = false

function resize() {
  const element = textareaElement.value
  if (!element || typeof window === 'undefined') return

  const styles = window.getComputedStyle(element)
  const fontSize = Number.parseFloat(styles.fontSize) || 16
  const parsedLineHeight = Number.parseFloat(styles.lineHeight)
  const lineHeight = Number.isFinite(parsedLineHeight) ? parsedLineHeight : fontSize * 1.5
  const padding = (Number.parseFloat(styles.paddingTop) || 0) + (Number.parseFloat(styles.paddingBottom) || 0)
  const border = (Number.parseFloat(styles.borderTopWidth) || 0) + (Number.parseFloat(styles.borderBottomWidth) || 0)
  const minHeight = lineHeight * safeMinRows.value + padding + border
  const maxHeight = lineHeight * safeMaxRows.value + padding + border
  const previousHeight = element.getBoundingClientRect().height

  element.style.height = 'auto'
  const targetHeight = Math.min(maxHeight, Math.max(minHeight, element.scrollHeight + border))
  const toCssHeight = (outerHeight: number) => styles.boxSizing === 'border-box' ? outerHeight : Math.max(0, outerHeight - padding - border)

  element.style.overflowY = element.scrollHeight + border > maxHeight + 0.5 ? 'auto' : 'hidden'
  if (previousHeight > 0 && Math.abs(previousHeight - targetHeight) > 0.5) {
    element.style.height = `${toCssHeight(previousHeight)}px`
    void element.offsetHeight
  }
  element.style.height = `${toCssHeight(targetHeight)}px`

  if (Math.abs(lastHeight - targetHeight) > 0.5) {
    lastHeight = targetHeight
    emit('resize', targetHeight)
  }
}

function scheduleResize() {
  if (typeof window === 'undefined') return
  if (resizeFrame != null) window.cancelAnimationFrame(resizeFrame)
  resizeFrame = window.requestAnimationFrame(() => {
    resizeFrame = undefined
    resize()
  })
}

function onInput(event: Event) {
  const target = event.target as HTMLTextAreaElement
  const value = safeMaxLength.value == null ? target.value : target.value.slice(0, safeMaxLength.value)

  if (target.value !== value) target.value = value
  emit('update:modelValue', value)
  emit('input', event)

  const reachedLimit = safeMaxLength.value != null && value.length >= safeMaxLength.value
  if (reachedLimit && !limitReached) emit('limit', value, safeMaxLength.value!)
  limitReached = reachedLimit
  resize()
}

function onFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function focus(options?: FocusOptions) {
  textareaElement.value?.focus(options)
}

function blur() {
  textareaElement.value?.blur()
}

function select() {
  textareaElement.value?.select()
}

function clear() {
  if (props.disabled || props.readonly || !hasValue.value) return
  const element = textareaElement.value

  limitReached = false
  if (element) {
    element.value = ''
    element.dispatchEvent(new Event('input', { bubbles: true }))
    element.focus()
  }
  else {
    emit('update:modelValue', '')
  }
}

watch([() => props.modelValue, safeMinRows, safeMaxRows], () => {
  const maxLength = safeMaxLength.value
  if (maxLength != null && props.modelValue.length > maxLength) {
    emit('update:modelValue', props.modelValue.slice(0, maxLength))
    emit('limit', props.modelValue.slice(0, maxLength), maxLength)
  }
  nextTick(scheduleResize)
}, { flush: 'post' })

watch(safeMaxLength, () => {
  const maxLength = safeMaxLength.value
  if (maxLength != null && props.modelValue.length > maxLength) {
    emit('update:modelValue', props.modelValue.slice(0, maxLength))
    emit('limit', props.modelValue.slice(0, maxLength), maxLength)
  }
  limitReached = safeMaxLength.value != null && textareaValue.value.length >= safeMaxLength.value
  nextTick(scheduleResize)
})

onMounted(() => {
  const maxLength = safeMaxLength.value
  if (maxLength != null && props.modelValue.length > maxLength) {
    emit('update:modelValue', props.modelValue.slice(0, maxLength))
    emit('limit', props.modelValue.slice(0, maxLength), maxLength)
  }
  limitReached = maxLength != null && textareaValue.value.length >= maxLength
  scheduleResize()

  if (textareaElement.value && typeof ResizeObserver !== 'undefined') {
    lastWidth = textareaElement.value.getBoundingClientRect().width
    resizeObserver = new ResizeObserver(([entry]) => {
      const width = entry?.contentRect.width ?? 0
      if (Math.abs(width - lastWidth) <= 0.5) return
      lastWidth = width
      scheduleResize()
    })
    resizeObserver.observe(textareaElement.value)
  }
})

onBeforeUnmount(() => {
  if (resizeFrame != null && typeof window !== 'undefined') window.cancelAnimationFrame(resizeFrame)
  resizeObserver?.disconnect()
})

defineExpose({ focus, blur, select, resize, clear })
</script>

<template>
  <div
    class="auto-resize-textarea w-full text-[#191b18]"
    :class="{ 'opacity-55': disabled }"
    :data-state="error ? 'error' : focused ? 'focused' : 'idle'"
    data-testid="auto-resize-textarea"
    :style="{ '--auto-resize-duration': `${safeDuration}ms` }"
  >
    <div class="relative">
      <label :for="textareaId" class="mb-2 flex items-center justify-between gap-4 px-0.5 text-[11px] font-semibold tracking-[-0.01em]">
        <span>
          {{ label }}<span v-if="required" class="ml-0.5 text-[#c44a3d]" aria-hidden="true">*</span>
        </span>
        <span v-if="readonly" class="text-[9px] font-bold uppercase tracking-[0.14em] text-black/35">Read only</span>
      </label>

      <div class="relative">
        <textarea
          v-bind="forwardedAttrs"
          :id="textareaId"
          ref="textareaElement"
          :value="textareaValue"
          :rows="safeMinRows"
          :name="name"
          :placeholder="placeholder"
          :maxlength="safeMaxLength"
          :disabled="disabled"
          :readonly="readonly"
          :required="required"
          :aria-invalid="ariaInvalid"
          :aria-describedby="describedBy"
          :aria-errormessage="error ? statusId : undefined"
          class="auto-resize-textarea__control block w-full resize-none rounded-[18px] border border-black/[0.13] bg-[#fafaf6] px-4 py-3.5 text-[14px] leading-6 tracking-[-0.01em] text-[#191b18] caret-[#191b18] shadow-[0_14px_35px_-28px_rgba(20,24,18,0.8)] outline-none placeholder:text-black/30 hover:not-disabled:border-black/25 focus:border-black/35 focus:bg-white focus:shadow-[0_18px_42px_-29px_rgba(20,24,18,0.9)] read-only:cursor-default read-only:bg-black/[0.025] disabled:cursor-not-allowed motion-reduce:transition-none"
          :class="clearable && hasValue ? 'pr-12' : undefined"
          :data-testid="controlTestId"
          @input="onInput"
          @focus="onFocus"
          @blur="onBlur"
        />

        <button
          v-if="clearable && hasValue"
          type="button"
          class="auto-resize-textarea__clear absolute right-3 top-3 grid size-8 cursor-pointer place-items-center rounded-full border-0 bg-black/[0.045] text-black/45 outline-none hover:not-disabled:bg-black/[0.08] hover:not-disabled:text-black/75 focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none"
          :disabled="disabled || readonly"
          :aria-label="`Clear ${label}`"
          data-testid="auto-resize-textarea-clear"
          @mousedown.prevent
          @click="clear"
        >
          <svg class="size-3.5 fill-none stroke-current stroke-[1.8] [stroke-linecap:round]" viewBox="0 0 16 16" aria-hidden="true">
            <path d="m4 4 8 8m0-8-8 8" />
          </svg>
        </button>

        <span class="pointer-events-none absolute inset-x-3 bottom-0 h-[2px] overflow-hidden rounded-full" aria-hidden="true">
          <span
            class="auto-resize-textarea__underline block h-full origin-center rounded-full"
            :class="[
              error ? 'bg-[#d94b3d]' : 'bg-[var(--registry-accent,#d9ff57)]',
              focused || error ? 'scale-x-100' : 'scale-x-0',
            ]"
          />
        </span>
      </div>
    </div>

    <div class="mt-2 flex min-h-5 items-start justify-between gap-4 px-1">
      <Transition name="auto-resize-status" mode="out-in">
        <p
          v-if="status"
          :id="statusId"
          :key="`${error ? 'error' : 'description'}-${status}`"
          class="auto-resize-textarea__status text-[11px] leading-5"
          :class="error ? 'text-[#b93429]' : 'text-black/45'"
          :role="error ? 'alert' : 'status'"
          aria-live="polite"
          data-testid="auto-resize-textarea-status"
        >
          {{ status }}
        </p>
        <span v-else aria-hidden="true" />
      </Transition>

      <span
        v-if="showCount"
        :id="countId"
        class="shrink-0 text-[10px] font-semibold tabular-nums leading-5"
        :class="safeMaxLength != null && textareaValue.length >= safeMaxLength ? 'text-[#b93429]' : 'text-black/35'"
        role="status"
        aria-live="polite"
        data-testid="auto-resize-textarea-count"
      >
        {{ countText }}
      </span>
    </div>
  </div>
</template>

<style scoped>
.auto-resize-textarea__control,
.auto-resize-textarea__clear,
.auto-resize-textarea__underline {
  transition-duration: var(--auto-resize-duration);
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.auto-resize-textarea__control {
  transition-property: height, border-color, background-color, box-shadow;
}

.auto-resize-textarea__clear {
  transition-property: color, background-color, opacity, transform;
}

.auto-resize-textarea__underline {
  transition-property: background-color, transform;
}

.auto-resize-status-enter-active,
.auto-resize-status-leave-active {
  transition-duration: var(--auto-resize-duration);
  transition-property: opacity, transform;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.auto-resize-status-enter-from {
  opacity: 0;
  transform: translateY(-3px);
}

.auto-resize-status-leave-to {
  opacity: 0;
  transform: translateY(3px);
}

@media (prefers-reduced-motion: reduce) {
  .auto-resize-textarea__control,
  .auto-resize-textarea__clear,
  .auto-resize-textarea__underline,
  .auto-resize-status-enter-active,
  .auto-resize-status-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
