<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import RippleButton from '#registry/default/ripple-button/RippleButton.vue'

interface RippleDetail {
  x: number
  y: number
  id: number
  source: 'pointer' | 'keyboard'
}

interface RippleButtonExposed {
  ripple: (x?: number, y?: number) => void
  clear: () => void
}

const props = withDefaults(defineProps<{
  color?: string
  duration?: number
  scale?: number
  disabled?: boolean
  loading?: boolean
  maxRipples?: number
}>(), {
  color: 'rgba(255, 255, 255, 0.42)',
  duration: 620,
  scale: 1,
  disabled: false,
  loading: false,
  maxRipples: 6,
})

const rippleButton = ref<RippleButtonExposed | null>(null)
const totalRipples = ref(0)
const liveRippleIds = ref<number[]>([])
const lastSource = ref<'pointer' | 'keyboard' | 'none'>('none')
const status = ref('Ready for launch day checkout.')
const liveTimers = new Map<number, ReturnType<typeof setTimeout>>()

const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, props.duration) : 620)

function removeLiveRipple(id: number) {
  const timer = liveTimers.get(id)
  if (timer !== undefined) clearTimeout(timer)
  liveTimers.delete(id)
  liveRippleIds.value = liveRippleIds.value.filter(item => item !== id)
}

function handleRipple(detail: RippleDetail) {
  totalRipples.value++
  lastSource.value = detail.source
  status.value = detail.source === 'pointer'
    ? `Ripple ${detail.id} launched from the selected point.`
    : `Ripple ${detail.id} launched from the center.`

  const limit = Math.max(1, Math.floor(props.maxRipples))
  while (liveRippleIds.value.length >= limit) {
    const oldest = liveRippleIds.value[0]
    if (oldest === undefined) break
    removeLiveRipple(oldest)
  }
  liveRippleIds.value = [...liveRippleIds.value, detail.id]
  liveTimers.set(detail.id, setTimeout(() => removeLiveRipple(detail.id), safeDuration.value + 50))
}

function handlePurchase(event: MouseEvent) {
  status.value = `Launch bundle reserved with a native ${event.type} event.`
}

function handleClear() {
  liveTimers.forEach(timer => clearTimeout(timer))
  liveTimers.clear()
  liveRippleIds.value = []
  status.value = 'Ripple surface cleared. The offer is still available.'
}

function resetDemo() {
  rippleButton.value?.clear()
  totalRipples.value = 0
  lastSource.value = 'none'
}

watch(() => [props.disabled, props.loading], ([disabled, loading]) => {
  if (loading) status.value = 'Securing your launch bundle...'
  else if (disabled) status.value = 'The launch bundle is currently unavailable.'
  else status.value = 'Ready for launch day checkout.'
}, { immediate: true })

onBeforeUnmount(() => {
  liveTimers.forEach(timer => clearTimeout(timer))
})
</script>

<template>
  <section
    data-testid="ripple-button-preview"
    class="relative flex min-h-[560px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#281b41]/15 bg-[#f4edff] px-4 py-10 text-[#1c102e] sm:min-h-[620px] sm:px-8 lg:px-12"
  >
    <div class="pointer-events-none absolute inset-0" aria-hidden="true">
      <div class="absolute -left-24 -top-28 size-80 rounded-full bg-[#ff7a59]/20 blur-3xl" />
      <div class="absolute -bottom-40 -right-24 size-96 rounded-full bg-[#7456ff]/25 blur-3xl" />
      <div class="absolute inset-0 opacity-45 [background-image:radial-gradient(#5d467c_0.7px,transparent_0.7px)] [background-size:18px_18px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
    </div>

    <article data-testid="campaign-purchase-card" class="relative w-full max-w-[920px] overflow-hidden rounded-[28px] border border-white/70 bg-[#fffdf9]/90 shadow-[0_35px_100px_-55px_rgba(50,24,88,0.65)] backdrop-blur sm:rounded-[36px]">
      <div class="grid lg:grid-cols-[1.05fr_0.95fr]">
        <div class="relative flex min-h-[270px] flex-col justify-between overflow-hidden bg-[#211338] p-6 text-white sm:min-h-[320px] sm:p-9 lg:min-h-[470px] lg:p-10">
          <div class="absolute -right-12 top-20 size-52 rotate-12 rounded-[42px] border border-white/10 bg-[#7456ff] shadow-[inset_0_0_60px_rgba(255,255,255,0.16)] sm:size-64" aria-hidden="true">
            <div class="absolute left-8 top-8 size-16 rounded-full bg-[#ffde59] shadow-[0_0_50px_rgba(255,222,89,0.5)]" />
            <div class="absolute bottom-10 right-8 h-16 w-28 rounded-full border border-white/20 bg-white/10" />
          </div>
          <div class="relative flex items-center justify-between gap-4">
            <span class="rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em]">Studio drop 04</span>
            <span class="font-mono text-[10px] text-white/45">48H ONLY</span>
          </div>
          <div class="relative max-w-sm pt-24 sm:pt-28">
            <p class="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#ffde59]">Launch with signal</p>
            <h2 class="text-4xl font-black leading-[0.92] tracking-[-0.06em] sm:text-5xl">The campaign starter kit.</h2>
            <p class="mt-5 max-w-xs text-sm leading-6 text-white/55">Art direction, launch templates, and conversion-ready assets for one sharp release.</p>
          </div>
        </div>

        <div class="flex flex-col justify-between p-6 sm:p-9 lg:p-10">
          <div>
            <div class="flex items-start justify-between gap-5 border-b border-[#281b41]/10 pb-6">
              <div>
                <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7456ff]">Founder's price</p>
                <p class="mt-2 text-4xl font-black tracking-[-0.055em]">$129</p>
              </div>
              <span class="rounded-full bg-[#ffde59] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.14em]">Save 35%</span>
            </div>

            <ul class="my-7 grid gap-3 text-sm text-[#493b5c]" aria-label="Bundle contents">
              <li class="flex items-center gap-3"><span class="grid size-5 place-items-center rounded-full bg-[#7456ff]/10 text-[10px] font-bold text-[#7456ff]">01</span>12 campaign layouts</li>
              <li class="flex items-center gap-3"><span class="grid size-5 place-items-center rounded-full bg-[#7456ff]/10 text-[10px] font-bold text-[#7456ff]">02</span>Launch copy field guide</li>
              <li class="flex items-center gap-3"><span class="grid size-5 place-items-center rounded-full bg-[#7456ff]/10 text-[10px] font-bold text-[#7456ff]">03</span>Lifetime template updates</li>
            </ul>
          </div>

          <div>
            <RippleButton
              ref="rippleButton"
              data-testid="ripple-purchase-button"
              class="!min-h-14 !w-full !rounded-2xl !bg-[#7456ff] !px-6 !text-sm !font-bold !shadow-[0_16px_35px_-18px_#5030db]"
              :color="color"
              :duration="duration"
              :scale="scale"
              :disabled="disabled"
              :loading="loading"
              :max-ripples="maxRipples"
              aria-label="Reserve the campaign starter kit"
              @ripple="handleRipple"
              @click="handlePurchase"
              @clear="handleClear"
            >
              {{ loading ? 'Securing bundle' : 'Reserve launch bundle' }}
              <span v-if="!loading" class="text-lg leading-none" aria-hidden="true">-&gt;</span>
            </RippleButton>

            <div class="mt-4 grid grid-cols-3 gap-2" aria-label="Ripple telemetry">
              <div class="rounded-xl bg-[#281b41]/[0.045] p-2.5">
                <p class="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6e627d]">Total</p>
                <p data-testid="ripple-count" class="mt-1 font-mono text-sm font-bold">{{ totalRipples }}</p>
              </div>
              <div class="rounded-xl bg-[#281b41]/[0.045] p-2.5">
                <p class="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6e627d]">Live</p>
                <p data-testid="ripple-live-count" class="mt-1 font-mono text-sm font-bold">{{ liveRippleIds.length }}</p>
              </div>
              <div class="rounded-xl bg-[#281b41]/[0.045] p-2.5">
                <p class="text-[9px] font-bold uppercase tracking-[0.14em] text-[#6e627d]">Source</p>
                <p data-testid="ripple-source" class="mt-1 truncate font-mono text-sm font-bold">{{ lastSource }}</p>
              </div>
            </div>

            <div class="mt-4 flex items-start justify-between gap-4 border-t border-[#281b41]/10 pt-4">
              <p data-testid="ripple-status" class="min-h-8 text-[11px] leading-4 text-[#6e627d]" role="status" aria-live="polite">{{ status }}</p>
              <button data-testid="ripple-reset" type="button" class="shrink-0 text-[10px] font-bold uppercase tracking-[0.12em] text-[#7456ff] underline decoration-[#7456ff]/25 underline-offset-4" @click="resetDemo">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  </section>
</template>
