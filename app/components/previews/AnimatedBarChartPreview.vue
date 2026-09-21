<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedBarChart, {
  type AnimatedBarChartExpose,
  type AnimatedBarChartItem,
} from '#registry/default/animated-bar-chart/AnimatedBarChart.vue'

const props = withDefaults(defineProps<{
  duration?: number
  height?: number
  showValues?: boolean
  interactive?: boolean
  paused?: boolean
}>(), {
  duration: 800,
  height: 330,
  showValues: true,
  interactive: true,
  paused: false,
})

const campaigns: AnimatedBarChartItem[] = [
  { id: 'q1', label: 'Q1', value: 128, color: '#9db69f', description: 'Field Notes / 128 thousand readers' },
  { id: 'q2', label: 'Q2', value: 176, color: '#d4a96a', description: 'City Issue / 176 thousand readers' },
  { id: 'q3', label: 'Q3', value: 224, color: '#e96b4a', description: 'New Modern / 224 thousand readers' },
  { id: 'q4', label: 'Q4', value: 268, color: '#294b45', description: 'Future Forms / 268 thousand readers' },
]

const chart = ref<AnimatedBarChartExpose | null>(null)
const selected = ref<string | null>('q4')
const status = ref('Future Forms selected with 268 thousand readers.')
const selectedCampaign = computed(() => campaigns.find(item => item.id === selected.value) ?? null)
const totalReach = campaigns.reduce((sum, item) => sum + item.value, 0)
const quarterlyGrowth = computed(() => {
  const item = selectedCampaign.value
  if (!item) return null
  const index = campaigns.findIndex(candidate => candidate.id === item.id)
  const previous = campaigns[index - 1]
  if (!previous) return 18.5
  return (item.value - previous.value) / previous.value * 100
})

function handleSelect(item: AnimatedBarChartItem | null) {
  status.value = item
    ? `${item.description ?? item.label} selected.`
    : 'Campaign selection cleared.'
}

async function replay() {
  status.value = props.paused ? 'Animation is paused.' : 'Replaying quarterly reach growth.'
  await chart.value?.replay()
  if (!props.paused) status.value = 'Quarterly reach animation complete.'
}

function resetSelection() {
  chart.value?.resetSelection()
}

async function focusSelection() {
  if (!selected.value) {
    status.value = 'Select a quarter before moving focus.'
    return
  }
  await chart.value?.focusSelected()
  status.value = `Keyboard focus moved to ${selectedCampaign.value?.label}.`
}
</script>

<template>
  <div data-testid="animated-bar-chart-preview" class="flex min-h-[620px] w-full items-center justify-center overflow-hidden rounded-2xl border border-border bg-[#dfe4dc] p-3 text-[#17201d] sm:p-7 lg:p-10">
    <section class="relative w-full max-w-5xl overflow-hidden rounded-[30px] border border-[#18352e]/10 bg-[#f7f4ec] shadow-[0_34px_100px_-54px_rgba(24,53,46,0.48)]">
      <div class="pointer-events-none absolute -right-24 -top-28 size-72 rounded-full bg-[#ef7655]/10 blur-3xl" aria-hidden="true" />

      <header class="relative flex flex-col gap-5 border-b border-[#18352e]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-full bg-[#173d35] font-serif text-lg italic text-[#f6efdf]" aria-hidden="true">N</span>
          <div>
            <p class="text-[9px] font-bold uppercase tracking-[0.22em] text-[#68756e]">Northstar Journal / 2026</p>
            <h2 class="mt-0.5 text-lg font-semibold tracking-[-0.035em]">Campaign intelligence</h2>
          </div>
        </div>
        <div class="flex items-center gap-2 rounded-full border border-[#18352e]/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-[#53665e]">
          <span class="size-1.5 rounded-full bg-[#e96b4a] shadow-[0_0_0_3px_rgba(233,107,74,0.12)]" aria-hidden="true" />
          Quarterly editorial desk
        </div>
      </header>

      <div class="relative grid lg:grid-cols-[minmax(0,1fr)_280px]">
        <main class="min-w-0 p-5 sm:p-8 lg:p-10">
          <div class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p class="text-[10px] font-bold uppercase tracking-[0.19em] text-[#e15e3e]">Audience reach</p>
              <h3 class="mt-2 text-3xl font-semibold leading-none tracking-[-0.055em] sm:text-[38px]">Stories that travel.</h3>
              <p class="mt-3 max-w-md text-xs leading-5 text-[#68756e]">Unique readers, in thousands, reached by each quarterly editorial campaign.</p>
            </div>
            <div class="flex shrink-0 gap-2">
              <button type="button" class="rounded-full border border-[#18352e]/12 bg-white/60 px-3.5 py-2 text-[10px] font-semibold outline-none transition hover:bg-white focus-visible:ring-2 focus-visible:ring-[#173d35] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="paused" @click="replay">Replay</button>
              <button type="button" class="rounded-full bg-[#173d35] px-3.5 py-2 text-[10px] font-semibold text-white outline-none transition hover:bg-[#234e45] focus-visible:ring-2 focus-visible:ring-[#e96b4a] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="!interactive || !selected" @click="focusSelection">Focus selected</button>
            </div>
          </div>

          <div class="rounded-[22px] border border-[#18352e]/10 bg-white/55 p-3 sm:p-5">
            <AnimatedBarChart
              ref="chart"
              v-model="selected"
              class="[--border:rgba(24,53,46,0.12)] [--foreground:#17201d] [--muted-foreground:#68756e]"
              :items="campaigns"
              :max-value="300"
              :height="props.height"
              :bar-width="54"
              :gap="28"
              :duration="props.duration"
              :show-values="props.showValues"
              :interactive="props.interactive"
              :paused="props.paused"
              aria-label="Northstar Journal quarterly campaign reach in thousands"
              @select="handleSelect"
            />
          </div>
        </main>

        <aside class="relative flex flex-col bg-[#173d35] p-6 text-[#f8f3e8] sm:p-8 lg:min-h-[500px]">
          <div class="pointer-events-none absolute -right-16 -top-16 size-44 rounded-full border-[26px] border-[#e96b4a] opacity-10" aria-hidden="true" />
          <div class="relative">
            <p class="text-[9px] font-bold uppercase tracking-[0.2em] text-[#f0a38d]">Selected campaign</p>
            <div data-testid="animated-bar-chart-selection" class="mt-7 min-h-[150px]" aria-live="polite" aria-atomic="true">
              <template v-if="selectedCampaign">
                <p class="font-serif text-[52px] leading-none tracking-[-0.06em]">{{ selectedCampaign.value }}<span class="ml-1 text-lg text-white/40">k</span></p>
                <p class="mt-4 text-lg font-semibold tracking-[-0.03em]">{{ selectedCampaign.description?.split(' / ')[0] }}</p>
                <p class="mt-1 text-xs text-white/45">{{ selectedCampaign.label }} editorial campaign</p>
              </template>
              <div v-else>
                <p class="text-2xl font-semibold tracking-[-0.04em]">All quarters</p>
                <p class="mt-2 text-xs leading-5 text-white/45">Choose a bar to inspect campaign performance.</p>
              </div>
            </div>
          </div>

          <dl class="relative mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10">
            <div class="bg-[#1b443b] p-4">
              <dt class="text-[8px] font-bold uppercase tracking-[0.17em] text-white/35">Total reach</dt>
              <dd class="mt-2 font-mono text-lg">{{ totalReach }}k</dd>
            </div>
            <div class="bg-[#1b443b] p-4">
              <dt class="text-[8px] font-bold uppercase tracking-[0.17em] text-white/35">Q/Q lift</dt>
              <dd class="mt-2 font-mono text-lg text-[#f0a38d]">{{ quarterlyGrowth === null ? '--' : `+${quarterlyGrowth.toFixed(1)}%` }}</dd>
            </div>
          </dl>

          <div class="relative mt-8 border-t border-white/10 pt-5 lg:mt-auto">
            <div class="flex items-center justify-between gap-3">
              <p class="text-[9px] font-bold uppercase tracking-[0.17em] text-white/35">Interaction</p>
              <button type="button" class="text-[10px] font-semibold text-[#f0a38d] underline decoration-white/20 underline-offset-4 outline-none focus-visible:ring-2 focus-visible:ring-[#f0a38d] disabled:cursor-not-allowed disabled:opacity-35" :disabled="!interactive || !selected" @click="resetSelection">Clear selection</button>
            </div>
            <p data-testid="animated-bar-chart-status" class="mt-3 min-h-10 text-[10px] leading-5 text-white/45" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
