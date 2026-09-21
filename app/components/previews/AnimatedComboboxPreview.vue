<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedCombobox, {
  type AnimatedComboboxExpose,
  type AnimatedComboboxOption,
} from '#registry/default/animated-combobox/AnimatedCombobox.vue'

const props = withDefaults(defineProps<{
  placeholder?: string
  clearable?: boolean
  allowCustom?: boolean
  duration?: number
  disabled?: boolean
}>(), {
  placeholder: 'Search a city or region',
  clearable: true,
  allowCustom: true,
  duration: 220,
  disabled: false,
})

const combobox = ref<AnimatedComboboxExpose | null>(null)
const destination = ref<string | null>('lisbon')
const query = ref('Lisbon, Portugal')
const status = ref('Lisbon is set as the next field trip.')
const openState = ref(false)

const destinations: AnimatedComboboxOption[] = [
  { value: 'lisbon', label: 'Lisbon, Portugal', description: 'Tiled streets and Atlantic light', group: 'Europe' },
  { value: 'copenhagen', label: 'Copenhagen, Denmark', description: 'Harbor walks and modern craft', group: 'Europe' },
  { value: 'matera', label: 'Matera, Italy', description: 'Stone dwellings and slow evenings', group: 'Europe' },
  { value: 'kyoto', label: 'Kyoto, Japan', description: 'Gardens, joinery, and quiet lanes', group: 'Asia' },
  { value: 'seoul', label: 'Seoul, South Korea', description: 'Print culture and late-night studios', group: 'Asia' },
  { value: 'chiang-mai', label: 'Chiang Mai, Thailand', description: 'Unavailable during monsoon research', group: 'Asia', disabled: true },
  { value: 'oaxaca', label: 'Oaxaca, Mexico', description: 'Natural pigments and market kitchens', group: 'Americas' },
  { value: 'montreal', label: 'Montreal, Canada', description: 'Editorial design and neighborhood cafes', group: 'Americas' },
]

const selectedOption = computed(() => destinations.find(option => option.value === destination.value) ?? null)
const selectionTitle = computed(() => selectedOption.value?.label ?? destination.value ?? 'No destination selected')
const selectionDetail = computed(() => selectedOption.value?.description ?? (destination.value ? 'A custom destination for this journey' : 'Choose a place to begin planning'))
const selectionCode = computed(() => selectionTitle.value.split(/[ ,]/).filter(Boolean).slice(0, 2).map(part => part[0]).join('').toLocaleUpperCase())

function onChange(value: string | null, option: AnimatedComboboxOption | null) {
  status.value = value
    ? `${option?.label ?? value} added to the trip brief.`
    : 'Destination cleared from the trip brief.'
}

function onCustom(value: string) {
  status.value = `Custom destination “${value}” added to the trip brief.`
}

function onOpenChange(open: boolean) {
  openState.value = open
  status.value = open ? 'Destination suggestions opened.' : 'Destination suggestions closed.'
}
</script>

<template>
  <section
    data-testid="animated-combobox-preview"
    class="w-full max-w-[960px] overflow-hidden rounded-[30px] border border-[#17312b]/10 bg-[#e9eee7] text-[#17231f] shadow-[0_36px_100px_-58px_rgba(24,49,42,.64)]"
  >
    <header class="flex flex-col gap-4 border-b border-[#17312b]/10 bg-[#f6f3e9] px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-10 place-items-center rounded-[13px] bg-[#17312b] text-[#e7ff78]" aria-hidden="true">
          <svg class="size-[18px] fill-none stroke-current stroke-[1.7] [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 24 24"><path d="M4 19.5 9 4l4 11 2-7 5 11.5H4Z" /><path d="m7 13 3-2 3 2 3-2" /></svg>
        </span>
        <div>
          <p class="text-sm font-semibold tracking-[-.025em]">Elsewhere Journal</p>
          <p class="mt-0.5 text-[9px] font-bold uppercase tracking-[.18em] text-[#17312b]/40">Research desk / Route 08</p>
        </div>
      </div>
      <div class="flex items-center gap-2 text-[9px] font-bold uppercase tracking-[.12em] text-[#17312b]/45">
        <span class="size-1.5 rounded-full" :class="openState ? 'bg-[#df744a]' : 'bg-[#4d906f]'" aria-hidden="true" />
        <span data-testid="animated-combobox-open-state">{{ openState ? 'Suggestions open' : 'Brief autosaved' }}</span>
      </div>
    </header>

    <div class="grid lg:grid-cols-[minmax(0,1.08fr)_minmax(300px,.92fr)]">
      <div class="relative min-w-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
        <div class="pointer-events-none absolute right-5 top-4 font-serif text-[90px] leading-none text-[#17312b]/[.035] sm:text-[130px]" aria-hidden="true">08</div>
        <div class="relative max-w-[520px]">
          <p class="text-[9px] font-bold uppercase tracking-[.2em] text-[#c65d38]">Next dispatch</p>
          <h2 class="mt-3 max-w-md text-[30px] font-semibold leading-[1.04] tracking-[-.052em] sm:text-[40px]">Where should the story begin?</h2>
          <p class="mt-4 max-w-md text-[12px] leading-5 text-[#17312b]/52">Search our fieldwork index or enter somewhere new. The chosen place will shape the next visual research brief.</p>

          <AnimatedCombobox
            ref="combobox"
            v-model="destination"
            v-model:query="query"
            data-testid="animated-combobox"
            class="mt-8"
            :options="destinations"
            :placeholder="placeholder"
            :clearable="clearable"
            :allow-custom="allowCustom"
            :duration="duration"
            :disabled="disabled"
            label="Field destination"
            @change="onChange"
            @custom="onCustom"
            @open-change="onOpenChange"
          />

          <div class="mt-5 flex flex-col gap-3 border-t border-[#17312b]/10 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p data-testid="animated-combobox-status" class="min-h-5 text-[10px] leading-5 text-[#17312b]/48" role="status" aria-live="polite" aria-atomic="true">{{ status }}</p>
            <div class="flex shrink-0 gap-2">
              <button type="button" class="rounded-full border border-[#17312b]/12 bg-white/45 px-3 py-2 text-[9px] font-bold text-[#17312b]/65 outline-none transition-colors hover:not-disabled:bg-white focus-visible:ring-2 focus-visible:ring-[#17312b] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="combobox?.focus()">Focus search</button>
              <button type="button" class="rounded-full bg-[#17312b] px-3 py-2 text-[9px] font-bold text-white outline-none transition-transform hover:not-disabled:-translate-y-px focus-visible:ring-3 focus-visible:ring-[#e7ff78] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="combobox?.open()">Browse index</button>
            </div>
          </div>
        </div>
      </div>

      <aside class="relative overflow-hidden bg-[#17312b] p-6 text-white sm:p-8 lg:min-h-[500px] lg:p-10">
        <div class="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full border-[46px] border-[#e7ff78]/[.06]" aria-hidden="true" />
        <div class="pointer-events-none absolute bottom-12 right-10 size-28 rounded-full border border-white/10" aria-hidden="true" />
        <div class="relative flex h-full flex-col">
          <div class="flex items-center justify-between gap-4">
            <p class="text-[9px] font-bold uppercase tracking-[.2em] text-[#e7ff78]">Working brief</p>
            <span class="rounded-full border border-white/10 px-2.5 py-1 text-[8px] font-semibold text-white/45">Issue 08 / 2026</span>
          </div>

          <div class="mt-12 sm:mt-16">
            <span class="grid size-16 place-items-center rounded-[21px] bg-[#f6f3e9] text-xl font-semibold tracking-[-.06em] text-[#17312b] shadow-[0_20px_40px_-25px_#000]" aria-hidden="true">{{ selectionCode || '—' }}</span>
            <p class="mt-7 text-[9px] font-bold uppercase tracking-[.16em] text-white/35">Selected location</p>
            <h3 data-testid="animated-combobox-value" class="mt-2 text-2xl font-semibold tracking-[-.045em]">{{ selectionTitle }}</h3>
            <p class="mt-2 max-w-xs text-[11px] leading-5 text-white/45">{{ selectionDetail }}</p>
          </div>

          <div class="mt-auto pt-12">
            <div class="h-px bg-white/10" />
            <div class="mt-5 flex items-end justify-between gap-5">
              <div>
                <p class="text-[8px] font-bold uppercase tracking-[.15em] text-white/30">Current query</p>
                <p data-testid="animated-combobox-query" class="mt-1 max-w-[190px] truncate text-[10px] text-white/60">{{ query || 'Waiting for a search' }}</p>
              </div>
              <span class="grid size-8 place-items-center rounded-full bg-[#e7ff78] text-[#17312b]" aria-hidden="true">
                <svg class="size-3.5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]" viewBox="0 0 18 18"><path d="M4 9h10m-4-4 4 4-4 4" /></svg>
              </span>
            </div>
          </div>
        </div>
      </aside>
    </div>
  </section>
</template>
