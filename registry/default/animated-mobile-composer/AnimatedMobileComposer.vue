<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch, type CSSProperties } from 'vue'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  label?: string
  maxLength?: number
  minRows?: number
  maxRows?: number
  duration?: number
  submitOnEnter?: boolean
  allowAttachment?: boolean
  safeArea?: boolean
  disabled?: boolean
  loading?: boolean
}>(), {
  modelValue: '',
  placeholder: 'Write a message...',
  label: 'Message composer',
  maxLength: 500,
  minRows: 1,
  maxRows: 5,
  duration: 220,
  submitOnEnter: true,
  allowAttachment: true,
  safeArea: true,
  disabled: false,
  loading: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
  submit: [value: string]
  attach: []
  focus: [event: FocusEvent]
  blur: [event: FocusEvent]
}>()

const textarea = ref<HTMLTextAreaElement | null>(null)
const focused = ref(false)
const composing = ref(false)
let observer: ResizeObserver | undefined

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(2000, Math.max(0, props.duration)) : 220)
const safeMaxLength = computed(() => Number.isFinite(props.maxLength) ? Math.max(1, Math.round(props.maxLength)) : 500)
const safeMinRows = computed(() => Math.max(1, Math.min(10, Math.round(props.minRows))))
const safeMaxRows = computed(() => Math.max(safeMinRows.value, Math.min(16, Math.round(props.maxRows))))
const canSubmit = computed(() => !props.disabled && !props.loading && props.modelValue.trim().length > 0)
const expanded = computed(() => focused.value || props.modelValue.length > 0)
const remaining = computed(() => safeMaxLength.value - props.modelValue.length)
const rootStyle = computed<CSSProperties>(() => ({ '--composer-duration': `${safeDuration.value}ms` }))

function resize() {
  const element = textarea.value
  if (!element || typeof window === 'undefined') return
  element.style.height = 'auto'
  const styles = getComputedStyle(element)
  const lineHeight = Number.parseFloat(styles.lineHeight) || 20
  const verticalPadding = Number.parseFloat(styles.paddingTop) + Number.parseFloat(styles.paddingBottom)
  const minHeight = lineHeight * safeMinRows.value + verticalPadding
  const maxHeight = lineHeight * safeMaxRows.value + verticalPadding
  const height = Math.min(maxHeight, Math.max(minHeight, element.scrollHeight))
  element.style.height = `${height}px`
  element.style.overflowY = element.scrollHeight > maxHeight ? 'auto' : 'hidden'
}

function update(event: Event) {
  const target = event.target as HTMLTextAreaElement
  emit('update:modelValue', target.value.slice(0, safeMaxLength.value))
  nextTick(resize)
}

function submit() {
  const value = props.modelValue.trim()
  if (!canSubmit.value) return false
  emit('submit', value)
  return true
}

function onKeydown(event: KeyboardEvent) {
  if (!props.submitOnEnter || event.key !== 'Enter' || event.shiftKey || composing.value) return
  event.preventDefault()
  submit()
}

function onFocus(event: FocusEvent) {
  focused.value = true
  emit('focus', event)
}

function onBlur(event: FocusEvent) {
  focused.value = false
  emit('blur', event)
}

function clear() {
  emit('update:modelValue', '')
  nextTick(resize)
}

function focus(options?: FocusOptions) {
  textarea.value?.focus(options)
}

watch(() => [props.modelValue, props.minRows, props.maxRows, props.maxLength], () => nextTick(resize))
onMounted(() => {
  observer = new ResizeObserver(resize)
  if (textarea.value) observer.observe(textarea.value)
  resize()
})
onBeforeUnmount(() => observer?.disconnect())
defineExpose({ focus, clear, submit, resize })
</script>

<template>
  <div
    data-testid="animated-mobile-composer"
    class="animated-mobile-composer w-full rounded-[22px] border border-black/10 bg-[#fbfaf6]/95 p-2 shadow-[0_18px_50px_-30px_rgba(24,28,22,.6)] backdrop-blur-xl transition-[border-color,box-shadow] focus-within:border-black/20 focus-within:shadow-[0_22px_60px_-28px_rgba(24,28,22,.7)] motion-reduce:transition-none"
    :class="safeArea ? 'pb-[max(.5rem,env(safe-area-inset-bottom))]' : ''"
    :style="rootStyle"
  >
    <label class="sr-only" :for="`composer-${label.replaceAll(' ', '-').toLowerCase()}`">{{ label }}</label>
    <div class="flex items-end gap-1.5">
      <button
        v-if="allowAttachment"
        type="button"
        data-testid="mobile-composer-attach"
        class="grid size-11 shrink-0 place-items-center rounded-[15px] text-xl text-black/42 outline-none transition-colors hover:not-disabled:bg-black/[0.055] hover:not-disabled:text-black focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:opacity-30 motion-reduce:transition-none"
        :disabled="disabled || loading"
        aria-label="Add attachment"
        @click="emit('attach')"
      >+</button>
      <textarea
        :id="`composer-${label.replaceAll(' ', '-').toLowerCase()}`"
        ref="textarea"
        data-testid="mobile-composer-input"
        :value="modelValue"
        :placeholder="placeholder"
        :maxlength="safeMaxLength"
        :rows="safeMinRows"
        :disabled="disabled || loading"
        enterkeyhint="send"
        class="max-h-80 min-h-11 min-w-0 flex-1 resize-none bg-transparent px-2 py-3 text-sm leading-5 text-[#1c1d1a] outline-none placeholder:text-black/30 disabled:cursor-not-allowed disabled:opacity-40"
        @input="update"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
        @compositionstart="composing = true"
        @compositionend="composing = false"
      />
      <button
        type="button"
        data-testid="mobile-composer-submit"
        class="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#1c1d1a] text-white outline-none transition-[transform,background-color,opacity] hover:not-disabled:bg-black active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-[#e4633f] disabled:opacity-25 motion-reduce:transition-none"
        :disabled="!canSubmit"
        :aria-label="loading ? 'Sending message' : 'Send message'"
        @click="submit"
      ><span v-if="loading" class="size-4 animate-spin rounded-full border-2 border-white/30 border-t-white motion-reduce:animate-none" aria-hidden="true" /><span v-else aria-hidden="true">&#8593;</span></button>
    </div>
    <div class="grid transition-[grid-template-rows,opacity] motion-reduce:transition-none" :class="expanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'">
      <div class="overflow-hidden"><div class="flex items-center justify-between px-3 pb-1 pt-2 text-[9px] text-black/35"><span>Enter to send · Shift+Enter for a new line</span><span data-testid="mobile-composer-count" class="tabular-nums" :class="remaining < 30 ? 'text-[#c4493d]' : ''">{{ modelValue.length }} / {{ safeMaxLength }}</span></div></div>
    </div>
  </div>
</template>

<style scoped>
.animated-mobile-composer .grid { transition-duration: var(--composer-duration); }
</style>
