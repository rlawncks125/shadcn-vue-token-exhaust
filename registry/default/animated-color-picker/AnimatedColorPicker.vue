<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, useId, watch } from 'vue'

export type AnimatedColorPickerSource = 'hue' | 'saturation' | 'value' | 'alpha' | 'spectrum' | 'text' | 'swatch' | 'reset'

export interface AnimatedColorPickerProps {
  modelValue: string
  alpha?: boolean
  swatches?: string[]
  label?: string
  disabled?: boolean
  duration?: number
}

export interface AnimatedColorPickerEvents {
  'update:modelValue': [value: string]
  change: [value: string, source: AnimatedColorPickerSource]
  commit: [value: string, source: AnimatedColorPickerSource]
  invalid: [value: string, reason: string]
}

export interface AnimatedColorPickerExpose {
  reset: () => boolean
  focus: () => Promise<boolean>
}

interface RgbaColor {
  red: number
  green: number
  blue: number
  alpha: number
}

interface HsvColor {
  hue: number
  saturation: number
  value: number
}

const props = withDefaults(defineProps<AnimatedColorPickerProps>(), {
  alpha: false,
  swatches: () => ['#FF6B6B', '#FFB84D', '#F4E76E', '#42D392', '#38BDF8', '#7C5CFC', '#EC4899', '#20242C'],
  label: 'Color',
  disabled: false,
  duration: 220,
})

const emit = defineEmits<AnimatedColorPickerEvents>()

const textInput = ref<HTMLInputElement | null>(null)
const spectrum = ref<HTMLElement | null>(null)
const textFocused = ref(false)
const draft = ref('')
const error = ref('')
const spectrumActive = ref(false)
const reducedMotion = ref(false)
const instanceId = `animated-color-picker-${useId()}`

let spectrumColor = ''
let motionQuery: MediaQueryList | undefined

function updateMotionPreference() {
  reducedMotion.value = Boolean(motionQuery?.matches)
}

function parseHex(value: unknown): RgbaColor | null {
  if (typeof value !== 'string') return null
  const match = /^#?([\da-f]{3}|[\da-f]{4}|[\da-f]{6}|[\da-f]{8})$/i.exec(value.trim())
  if (!match) return null
  let hex = match[1]!
  if (hex.length === 3 || hex.length === 4) hex = [...hex].map(character => character + character).join('')
  const hasAlpha = hex.length === 8
  return {
    red: Number.parseInt(hex.slice(0, 2), 16),
    green: Number.parseInt(hex.slice(2, 4), 16),
    blue: Number.parseInt(hex.slice(4, 6), 16),
    alpha: hasAlpha ? Number.parseInt(hex.slice(6, 8), 16) / 255 : 1,
  }
}

function channelHex(value: number) {
  return Math.round(Math.min(255, Math.max(0, value))).toString(16).padStart(2, '0').toUpperCase()
}

function toHex(color: RgbaColor, includeAlpha = props.alpha) {
  const base = `#${channelHex(color.red)}${channelHex(color.green)}${channelHex(color.blue)}`
  return includeAlpha ? `${base}${channelHex(color.alpha * 255)}` : base
}

function rgbToHsv(color: RgbaColor): HsvColor {
  const red = color.red / 255
  const green = color.green / 255
  const blue = color.blue / 255
  const maximum = Math.max(red, green, blue)
  const minimum = Math.min(red, green, blue)
  const delta = maximum - minimum
  let hue = 0
  if (delta) {
    if (maximum === red) hue = 60 * (((green - blue) / delta) % 6)
    else if (maximum === green) hue = 60 * ((blue - red) / delta + 2)
    else hue = 60 * ((red - green) / delta + 4)
  }
  if (hue < 0) hue += 360
  return {
    hue: Math.round(hue),
    saturation: maximum === 0 ? 0 : Math.round(delta / maximum * 100),
    value: Math.round(maximum * 100),
  }
}

function hsvToRgb(color: HsvColor, alpha: number): RgbaColor {
  const hue = ((color.hue % 360) + 360) % 360
  const saturation = Math.min(100, Math.max(0, color.saturation)) / 100
  const value = Math.min(100, Math.max(0, color.value)) / 100
  const chroma = value * saturation
  const section = hue / 60
  const x = chroma * (1 - Math.abs(section % 2 - 1))
  let red = 0
  let green = 0
  let blue = 0
  if (section < 1) [red, green] = [chroma, x]
  else if (section < 2) [red, green] = [x, chroma]
  else if (section < 3) [green, blue] = [chroma, x]
  else if (section < 4) [green, blue] = [x, chroma]
  else if (section < 5) [red, blue] = [x, chroma]
  else [red, blue] = [chroma, x]
  const match = value - chroma
  return { red: (red + match) * 255, green: (green + match) * 255, blue: (blue + match) * 255, alpha }
}

const fallbackColor: RgbaColor = { red: 0, green: 0, blue: 0, alpha: 1 }
const color = computed(() => parseHex(props.modelValue) ?? fallbackColor)
const hsv = computed(() => rgbToHsv(color.value))
const normalizedHex = computed(() => toHex(color.value))
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 220)
const alphaPercent = computed(() => Math.round(color.value.alpha * 100))
const spectrumStyle = computed(() => ({
  backgroundColor: `hsl(${hsv.value.hue} 100% 50%)`,
  backgroundImage: 'linear-gradient(to top, #000, transparent), linear-gradient(to right, #fff, transparent)',
}))
const previewStyle = computed(() => ({ backgroundColor: normalizedHex.value }))
const alphaStyle = computed(() => ({
  '--alpha-color': toHex({ ...color.value, alpha: 1 }, false),
  '--range-progress': `${alphaPercent.value}%`,
}))
const hueStyle = computed(() => ({ '--range-progress': `${hsv.value.hue / 360 * 100}%` }))
const saturationStyle = computed(() => ({
  '--range-progress': `${hsv.value.saturation}%`,
  '--range-start': toHex(hsvToRgb({ ...hsv.value, saturation: 0 }, 1), false),
  '--range-end': toHex(hsvToRgb({ ...hsv.value, saturation: 100 }, 1), false),
}))
const valueStyle = computed(() => ({
  '--range-progress': `${hsv.value.value}%`,
  '--range-start': '#000000',
  '--range-end': toHex(hsvToRgb({ ...hsv.value, value: 100 }, 1), false),
}))

const validSwatches = computed(() => {
  const unique = new Set<string>()
  const result: string[] = []
  for (const candidate of Array.isArray(props.swatches) ? props.swatches : []) {
    const parsed = parseHex(candidate)
    if (!parsed) continue
    const normalized = toHex(parsed)
    if (unique.has(normalized)) continue
    unique.add(normalized)
    result.push(normalized)
  }
  return result
})

const initialColor = normalizedHex.value
draft.value = normalizedHex.value

function colorFor(source: AnimatedColorPickerSource, value: number) {
  const next = { ...hsv.value }
  let alpha = color.value.alpha
  if (source === 'hue') next.hue = value
  else if (source === 'saturation') next.saturation = value
  else if (source === 'value') next.value = value
  else if (source === 'alpha') alpha = value / 100
  return toHex(hsvToRgb(next, alpha))
}

function changeColor(nextValue: string, source: AnimatedColorPickerSource, committed = false) {
  if (props.disabled) return false
  const parsed = parseHex(nextValue)
  if (!parsed) return false
  const normalized = toHex(parsed)
  draft.value = normalized
  error.value = ''
  if (normalized !== normalizedHex.value) {
    emit('update:modelValue', normalized)
    emit('change', normalized, source)
  }
  if (committed) emit('commit', normalized, source)
  return true
}

function onRangeInput(event: Event, source: AnimatedColorPickerSource) {
  const value = Number((event.currentTarget as HTMLInputElement).value)
  if (Number.isFinite(value)) changeColor(colorFor(source, value), source)
}

function onRangeCommit(event: Event, source: AnimatedColorPickerSource) {
  const value = Number((event.currentTarget as HTMLInputElement).value)
  const next = Number.isFinite(value) ? colorFor(source, value) : normalizedHex.value
  changeColor(next, source, true)
}

function updateSpectrum(event: PointerEvent) {
  const element = spectrum.value
  if (!element) return
  const bounds = element.getBoundingClientRect()
  if (!bounds.width || !bounds.height) return
  const saturation = Math.round(Math.min(1, Math.max(0, (event.clientX - bounds.left) / bounds.width)) * 100)
  const value = Math.round((1 - Math.min(1, Math.max(0, (event.clientY - bounds.top) / bounds.height))) * 100)
  spectrumColor = toHex(hsvToRgb({ hue: hsv.value.hue, saturation, value }, color.value.alpha))
  changeColor(spectrumColor, 'spectrum')
}

function onSpectrumDown(event: PointerEvent) {
  if (props.disabled || event.button !== 0) return
  spectrumActive.value = true
  spectrumColor = normalizedHex.value
  spectrum.value?.setPointerCapture(event.pointerId)
  updateSpectrum(event)
}

function onSpectrumMove(event: PointerEvent) {
  if (spectrumActive.value) updateSpectrum(event)
}

function onSpectrumEnd(event: PointerEvent) {
  if (!spectrumActive.value) return
  updateSpectrum(event)
  spectrumActive.value = false
  if (spectrum.value?.hasPointerCapture(event.pointerId)) spectrum.value.releasePointerCapture(event.pointerId)
  emit('commit', spectrumColor || normalizedHex.value, 'spectrum')
}

function onTextInput(event: Event) {
  draft.value = (event.currentTarget as HTMLInputElement).value
  error.value = !draft.value.trim() || parseHex(draft.value) ? '' : 'Enter a 3, 4, 6, or 8 digit hex color.'
}

function commitText() {
  if (props.disabled) return false
  const parsed = parseHex(draft.value)
  if (!parsed) {
    error.value = 'Enter a valid hex color, such as #7C5CFC.'
    emit('invalid', draft.value, error.value)
    return false
  }
  return changeColor(toHex(parsed), 'text', true)
}

function onTextKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    event.preventDefault()
    if (commitText()) textInput.value?.select()
  }
  else if (event.key === 'Escape') {
    event.preventDefault()
    draft.value = normalizedHex.value
    error.value = ''
    textInput.value?.select()
  }
}

function selectSwatch(value: string) {
  changeColor(value, 'swatch', true)
}

function reset() {
  return changeColor(initialColor, 'reset', true)
}

async function focus() {
  if (props.disabled) return false
  await nextTick()
  textInput.value?.focus()
  return document.activeElement === textInput.value
}

watch(normalizedHex, (value) => {
  if (!textFocused.value) {
    draft.value = value
    error.value = ''
  }
})

watch(() => props.alpha, () => {
  draft.value = normalizedHex.value
  error.value = ''
})

onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
  updateMotionPreference()
  motionQuery.addEventListener('change', updateMotionPreference)
})

onBeforeUnmount(() => {
  motionQuery?.removeEventListener('change', updateMotionPreference)
  motionQuery = undefined
})

defineExpose<AnimatedColorPickerExpose>({ reset, focus })
</script>

<template>
  <fieldset
    data-testid="animated-color-picker"
    class="animated-color-picker m-0 min-w-0 rounded-[26px] border border-white/10 bg-[#11141b] p-4 text-white shadow-[0_30px_80px_-48px_rgba(0,0,0,0.9)] sm:p-5"
    :class="{ 'opacity-50': disabled }"
    :disabled="disabled"
    :style="{ '--color-picker-duration': reducedMotion ? '0ms' : `${safeDuration}ms` }"
  >
    <legend class="sr-only">{{ label }}</legend>

    <div class="mb-4 flex items-center justify-between gap-4">
      <div>
        <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-white/38">{{ label }}</p>
        <p class="mt-1 text-sm font-semibold tracking-[-0.02em]">Build a precise color</p>
      </div>
      <div class="color-preview checkerboard size-12 shrink-0 overflow-hidden rounded-2xl border border-white/15 shadow-[0_8px_20px_-10px_rgba(0,0,0,0.8)]" aria-hidden="true">
        <span class="block size-full" :style="previewStyle" />
      </div>
    </div>

    <div
      ref="spectrum"
      data-testid="color-picker-spectrum"
      class="color-spectrum relative h-44 touch-none overflow-hidden rounded-[20px] border border-white/10 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:h-48"
      :class="disabled ? 'cursor-not-allowed' : 'cursor-crosshair'"
      :style="spectrumStyle"
      aria-hidden="true"
      @pointerdown="onSpectrumDown"
      @pointermove="onSpectrumMove"
      @pointerup="onSpectrumEnd"
      @pointercancel="onSpectrumEnd"
    >
      <span
        class="spectrum-cursor pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-white shadow-[0_2px_9px_rgba(0,0,0,0.7)]"
        :class="{ 'is-active': spectrumActive }"
        :style="{ left: `${hsv.saturation}%`, top: `${100 - hsv.value}%`, backgroundColor: normalizedHex }"
      />
    </div>

    <div class="mt-5 space-y-4">
      <div>
        <div class="mb-2 flex items-center justify-between gap-4">
          <label :for="`${instanceId}-hue`" class="text-[10px] font-semibold text-white/62">Hue</label>
          <output :for="`${instanceId}-hue`" class="min-w-10 text-right text-[10px] font-bold tabular-nums text-white/40">{{ hsv.hue }}&deg;</output>
        </div>
        <input :id="`${instanceId}-hue`" data-testid="color-picker-hue" type="range" min="0" max="360" step="1" :value="hsv.hue" :disabled="disabled" class="color-range hue-range w-full" :style="hueStyle" :aria-valuetext="`${hsv.hue} degrees`" @input="onRangeInput($event, 'hue')" @change="onRangeCommit($event, 'hue')">
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <div class="mb-2 flex items-center justify-between gap-2">
            <label :for="`${instanceId}-saturation`" class="text-[10px] font-semibold text-white/62">Saturation</label>
            <output :for="`${instanceId}-saturation`" class="text-[10px] font-bold tabular-nums text-white/40">{{ hsv.saturation }}%</output>
          </div>
          <input :id="`${instanceId}-saturation`" data-testid="color-picker-saturation" type="range" min="0" max="100" step="1" :value="hsv.saturation" :disabled="disabled" class="color-range channel-range w-full" :style="saturationStyle" :aria-valuetext="`${hsv.saturation} percent`" @input="onRangeInput($event, 'saturation')" @change="onRangeCommit($event, 'saturation')">
        </div>
        <div>
          <div class="mb-2 flex items-center justify-between gap-2">
            <label :for="`${instanceId}-value`" class="text-[10px] font-semibold text-white/62">Brightness</label>
            <output :for="`${instanceId}-value`" class="text-[10px] font-bold tabular-nums text-white/40">{{ hsv.value }}%</output>
          </div>
          <input :id="`${instanceId}-value`" data-testid="color-picker-value" type="range" min="0" max="100" step="1" :value="hsv.value" :disabled="disabled" class="color-range channel-range w-full" :style="valueStyle" :aria-valuetext="`${hsv.value} percent`" @input="onRangeInput($event, 'value')" @change="onRangeCommit($event, 'value')">
        </div>
      </div>

      <div v-if="alpha">
        <div class="mb-2 flex items-center justify-between gap-4">
          <label :for="`${instanceId}-alpha`" class="text-[10px] font-semibold text-white/62">Opacity</label>
          <output :for="`${instanceId}-alpha`" class="text-[10px] font-bold tabular-nums text-white/40">{{ alphaPercent }}%</output>
        </div>
        <div class="checkerboard rounded-full">
          <input :id="`${instanceId}-alpha`" data-testid="color-picker-alpha" type="range" min="0" max="100" step="1" :value="alphaPercent" :disabled="disabled" class="color-range alpha-range block w-full" :style="alphaStyle" :aria-valuetext="`${alphaPercent} percent opacity`" @input="onRangeInput($event, 'alpha')" @change="onRangeCommit($event, 'alpha')">
        </div>
      </div>
    </div>

    <div v-if="validSwatches.length" class="mt-5 border-t border-white/[0.08] pt-4">
      <p class="mb-2.5 text-[9px] font-bold uppercase tracking-[0.16em] text-white/32">Saved swatches</p>
      <div class="grid grid-cols-8 gap-2" role="group" aria-label="Color swatches">
        <button
          v-for="swatch in validSwatches"
          :key="swatch"
          type="button"
          :data-testid="`color-picker-swatch-${swatch.slice(1)}`"
          class="checkerboard aspect-square min-w-0 cursor-pointer overflow-hidden rounded-lg border border-white/15 p-0 outline-none transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:scale-105 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#11141b] disabled:cursor-not-allowed motion-reduce:transition-none"
          :class="normalizedHex === swatch ? 'ring-2 ring-white ring-offset-2 ring-offset-[#11141b]' : ''"
          :disabled="disabled"
          :aria-label="`Select ${swatch}`"
          :aria-pressed="normalizedHex === swatch"
          @click="selectSwatch(swatch)"
        ><span class="block size-full" :style="{ backgroundColor: swatch }" /></button>
      </div>
    </div>

    <div class="mt-5">
      <label :for="`${instanceId}-hex`" class="mb-2 block text-[9px] font-bold uppercase tracking-[0.16em] text-white/32">Hex value</label>
      <div class="flex items-center gap-2">
        <div class="flex min-w-0 flex-1 items-center rounded-xl border bg-white/[0.06] px-3 focus-within:ring-2 focus-within:ring-white/70" :class="error ? 'border-[#ff7b72]' : 'border-white/10'">
          <span class="mr-2 size-2.5 shrink-0 rounded-full border border-white/20" :style="previewStyle" aria-hidden="true" />
          <input
            :id="`${instanceId}-hex`"
            ref="textInput"
            data-testid="color-picker-input"
            :value="draft"
            type="text"
            spellcheck="false"
            autocomplete="off"
            class="h-10 min-w-0 flex-1 border-0 bg-transparent p-0 font-mono text-xs font-semibold uppercase tracking-[0.08em] text-white outline-none placeholder:text-white/20 disabled:cursor-not-allowed"
            :maxlength="alpha ? 9 : 7"
            :disabled="disabled"
            :aria-invalid="Boolean(error)"
            :aria-describedby="`${instanceId}-error`"
            :placeholder="alpha ? '#7C5CFCFF' : '#7C5CFC'"
            @input="onTextInput"
            @focus="textFocused = true; ($event.currentTarget as HTMLInputElement).select()"
            @blur="textFocused = false; commitText()"
            @keydown="onTextKeydown"
          >
        </div>
        <button type="button" class="h-10 shrink-0 cursor-pointer rounded-xl bg-white px-3.5 text-[10px] font-bold text-[#11141b] outline-none transition hover:not-disabled:bg-white/85 active:not-disabled:scale-95 focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#11141b] disabled:cursor-not-allowed disabled:opacity-30 motion-reduce:transition-none" :disabled="disabled" @click="commitText">Apply</button>
      </div>
      <p :id="`${instanceId}-error`" data-testid="color-picker-error" class="mt-2 min-h-4 text-[10px] text-[#ff9b94]" :aria-live="error ? 'polite' : 'off'">{{ error }}</p>
    </div>
  </fieldset>
</template>

<style scoped>
.checkerboard {
  background-color: #fff;
  background-image:
    linear-gradient(45deg, #c8ccd4 25%, transparent 25%),
    linear-gradient(-45deg, #c8ccd4 25%, transparent 25%),
    linear-gradient(45deg, transparent 75%, #c8ccd4 75%),
    linear-gradient(-45deg, transparent 75%, #c8ccd4 75%);
  background-position: 0 0, 0 5px, 5px -5px, -5px 0;
  background-size: 10px 10px;
}

.color-preview,
.spectrum-cursor {
  transition-duration: var(--color-picker-duration);
  transition-property: background-color, transform, box-shadow;
  transition-timing-function: cubic-bezier(0.22, 1, 0.36, 1);
}

.color-preview {
  animation: color-preview-in var(--color-picker-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.spectrum-cursor.is-active {
  transform: translate(-50%, -50%) scale(1.22);
  box-shadow: 0 3px 14px rgb(0 0 0 / 0.8);
}

.color-range {
  --range-progress: 0%;
  height: 14px;
  margin: 0;
  appearance: none;
  border: 0;
  border-radius: 999px;
  cursor: pointer;
  outline: none;
}

.hue-range {
  background: linear-gradient(to right, #f33, #ff3, #3f3, #3ff, #33f, #f3f, #f33);
}

.channel-range {
  background: linear-gradient(to right, var(--range-start), var(--range-end));
}

.alpha-range {
  background: linear-gradient(to right, transparent, var(--alpha-color));
}

.color-range::-webkit-slider-thumb {
  width: 20px;
  height: 20px;
  appearance: none;
  border: 3px solid white;
  border-radius: 50%;
  background: #161922;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.55);
  transition: transform var(--color-picker-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.color-range::-moz-range-thumb {
  width: 14px;
  height: 14px;
  border: 3px solid white;
  border-radius: 50%;
  background: #161922;
  box-shadow: 0 2px 8px rgb(0 0 0 / 0.55);
  transition: transform var(--color-picker-duration) cubic-bezier(0.22, 1, 0.36, 1);
}

.color-range:focus-visible::-webkit-slider-thumb,
.color-range:active::-webkit-slider-thumb {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgb(255 255 255 / 0.25), 0 2px 8px rgb(0 0 0 / 0.55);
}

.color-range:focus-visible::-moz-range-thumb,
.color-range:active::-moz-range-thumb {
  transform: scale(1.2);
  box-shadow: 0 0 0 3px rgb(255 255 255 / 0.25), 0 2px 8px rgb(0 0 0 / 0.55);
}

.color-range:disabled {
  cursor: not-allowed;
}

@keyframes color-preview-in {
  50% { transform: scale(0.92); }
}

@media (prefers-reduced-motion: reduce) {
  .color-preview,
  .spectrum-cursor,
  .color-range::-webkit-slider-thumb,
  .color-range::-moz-range-thumb {
    animation: none !important;
    transition: none !important;
  }
}
</style>
