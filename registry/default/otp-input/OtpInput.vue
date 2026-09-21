<script setup lang="ts">
import { nextTick, onMounted, ref, useId, watch } from 'vue'

const props = withDefaults(defineProps<{
  length?: number
  mode?: 'numeric' | 'alphanumeric'
  disabled?: boolean
  error?: string
  label?: string
  autofocus?: boolean
}>(), {
  length: 6,
  mode: 'numeric',
  disabled: false,
  error: '',
  label: 'One-time verification code',
  autofocus: false,
})
const model = defineModel<string>({ default: '' })
const emit = defineEmits<{ complete: [code: string] }>()
const values = ref<string[]>([])
const inputs: HTMLInputElement[] = []
const errorId = `otp-error-${useId()}`
const safeLength = () => Math.max(1, Math.min(10, Math.floor(props.length)))

function clean(value: string) {
  const pattern = props.mode === 'numeric' ? /[^0-9]/g : /[^a-z0-9]/gi
  return value.replace(pattern, '').toUpperCase()
}
function sync(value: string) {
  const characters = Array.from(clean(value)).slice(0, safeLength())
  values.value = Array.from({ length: safeLength() }, (_, index) => characters[index] ?? '')
}
function commit() {
  const code = values.value.join('')
  if (model.value !== code) model.value = code
  if (values.value.every(Boolean)) emit('complete', code)
}
function focus(index: number) {
  nextTick(() => inputs[Math.max(0, Math.min(safeLength() - 1, index))]?.focus())
}
function distribute(index: number, text: string) {
  const characters = Array.from(clean(text))
  if (!characters.length) return
  let cursor = index
  for (const character of characters) {
    if (cursor >= safeLength()) break
    values.value[cursor++] = character
  }
  commit()
  focus(Math.min(cursor, safeLength() - 1))
}
function onInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const characters = clean(target.value)
  if (characters.length > 1) distribute(index, characters)
  else {
    values.value[index] = characters
    commit()
    if (characters && index < safeLength() - 1) focus(index + 1)
  }
}
function onPaste(event: ClipboardEvent, index: number) {
  event.preventDefault()
  distribute(index, event.clipboardData?.getData('text') ?? '')
}
function onKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    event.preventDefault()
    if (values.value[index]) values.value[index] = ''
    else if (index > 0) { values.value[index - 1] = ''; focus(index - 1) }
    commit()
  } else if (event.key === 'Delete') {
    event.preventDefault(); values.value[index] = ''; commit()
  } else if (event.key === 'ArrowLeft') { event.preventDefault(); focus(index - 1) }
  else if (event.key === 'ArrowRight') { event.preventDefault(); focus(index + 1) }
  else if (event.key === 'Home') { event.preventDefault(); focus(0) }
  else if (event.key === 'End') { event.preventDefault(); focus(safeLength() - 1) }
}
function onFocus(index: number) {
  const firstEmpty = values.value.findIndex(value => !value)
  if (firstEmpty >= 0 && index > firstEmpty) focus(firstEmpty)
  else inputs[index]?.select()
}
function setInput(element: unknown, index: number) {
  if (element instanceof HTMLInputElement) inputs[index] = element
}

watch([model, () => props.length, () => props.mode], ([value]) => sync(String(value)), { immediate: true })
onMounted(() => { if (props.autofocus && !props.disabled) focus(0) })
</script>

<template>
  <div class="otp-wrapper w-full">
    <div class="otp-input mx-auto grid w-[min(100%,calc(var(--otp-length)*54px))] grid-cols-[repeat(var(--otp-length),minmax(0,1fr))] gap-[clamp(5px,1.5vw,9px)]" role="group" :aria-label="label" :aria-describedby="error ? errorId : undefined" :style="{ '--otp-length': safeLength() }">
      <input
        v-for="(_, index) in values" :key="index" :ref="element => setInput(element, index)" :value="values[index]"
        class="aspect-[1/1.08] min-w-0 rounded-[14px] border border-[#17181424] bg-[#ffffffb8] text-center [font:inherit] text-[clamp(16px,4vw,21px)] font-[650] text-[#171814] caret-[#171814] shadow-[0_8px_20px_-18px_#0008] outline-none transition-[border-color,box-shadow,transform] duration-160 placeholder:text-[#1718145c] hover:not-disabled:border-[#17181470] focus:z-1 focus:-translate-y-0.5 focus:border-[#171814] focus:shadow-[0_0_0_3px_var(--registry-accent,#d9ff57),0_10px_24px_-16px_#000a] aria-invalid:border-[#e24e43] aria-invalid:bg-[#fff4f2] disabled:cursor-not-allowed disabled:opacity-45 motion-reduce:transition-none"
        :type="mode === 'numeric' ? 'tel' : 'text'" :inputmode="mode === 'numeric' ? 'numeric' : 'text'"
        :pattern="mode === 'numeric' ? '[0-9]*' : undefined" maxlength="1" :disabled="disabled"
        :autocomplete="index === 0 ? 'one-time-code' : 'off'" :aria-label="`Digit ${index + 1} of ${safeLength()}`"
        :aria-invalid="error ? 'true' : undefined" @input="onInput($event, index)" @paste="onPaste($event, index)"
        @keydown="onKeydown($event, index)" @focus="onFocus(index)"
      >
    </div>
    <p v-if="error" :id="errorId" class="otp-error mt-2.5 text-center text-[11px] text-[#c8342b]" role="alert">{{ error }}</p>
  </div>
</template>
