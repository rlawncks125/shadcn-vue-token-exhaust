<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedNavigationMenu, { type AnimatedNavigationChild, type AnimatedNavigationItem } from '#registry/default/animated-navigation-menu/AnimatedNavigationMenu.vue'

const props = withDefaults(defineProps<{
  duration?: number
  disabled?: boolean
}>(), {
  duration: 280,
  disabled: false,
})

const items: AnimatedNavigationItem[] = [
  {
    id: 'destinations',
    label: 'Destinations',
    description: 'Routes shaped by landscape, local tables, and unhurried days.',
    href: '#destinations',
    children: [
      { id: 'atlas', label: 'The Atlantic edge', description: 'Portugal, Galicia, and the western isles', href: '#atlas' },
      { id: 'highlands', label: 'Northern highlands', description: 'Cabins, long light, and quiet roads', href: '#highlands' },
      { id: 'islands', label: 'Small islands', description: 'Four new salt-air itineraries', href: '#islands' },
    ],
  },
  { id: 'field-notes', label: 'Field notes', description: 'Dispatches from the road', href: '#field-notes' },
  {
    id: 'stays',
    label: 'Stays',
    description: 'Independent places with a strong sense of where they are.',
    children: [
      { id: 'guesthouses', label: 'Guesthouses', description: 'Small rooms, generous hosts', href: '#guesthouses' },
      { id: 'cabins', label: 'Cabins', description: 'Remote shelters worth the walk', href: '#cabins' },
      { id: 'farm-stays', label: 'Farm stays', description: 'Season-led tables and open country', href: '#farm-stays' },
      { id: 'city-rooms', label: 'City rooms', description: 'Good design in walkable quarters', href: '#city-rooms' },
    ],
  },
  {
    id: 'studio',
    label: 'Travel studio',
    description: 'Planning tools for a slower, more personal way to travel.',
    children: [
      { id: 'trip-planning', label: 'Trip planning', description: 'Build a thoughtful route', href: '#trip-planning' },
      { id: 'private-guides', label: 'Private guides', description: 'Local knowledge, one conversation away', href: '#private-guides' },
      { id: 'group-editions', label: 'Group editions', description: 'Small departures, coming this winter', disabled: true },
    ],
  },
  { id: 'about', label: 'About', href: '#about' },
]

const openValue = ref<string | null>(null)
const activeValue = ref<string | null>('field-notes')
const status = ref('Field notes is the current destination.')
const currentLabel = computed(() => {
  for (const item of items) {
    if (item.id === activeValue.value) return item.label
    const child = item.children?.find(candidate => candidate.id === activeValue.value)
    if (child) return child.label
  }
  return 'No destination'
})

function handleOpenChange(value: string | null) {
  const item = items.find(candidate => candidate.id === value)
  status.value = item ? `${item.label} navigation opened.` : 'Navigation closed.'
}

function handleNavigate(item: AnimatedNavigationItem | AnimatedNavigationChild) {
  status.value = `Navigating to ${item.label}.`
}
</script>

<template>
  <section
    class="relative w-full max-w-[980px] overflow-hidden rounded-[26px] border border-[#18201b]/10 bg-[#ede9dd] text-[#18201b] shadow-[0_45px_110px_-70px_rgba(24,32,27,.9)] sm:rounded-[38px]"
    data-testid="animated-navigation-menu-preview"
  >
    <div class="absolute -right-20 top-32 size-64 rounded-full border-[42px] border-[#e4633f]/10" aria-hidden="true" />
    <header class="relative z-20 px-3 pt-3 sm:px-6 sm:pt-6">
      <div class="mb-4 flex items-center justify-between px-2 sm:px-1">
        <a href="#northward" class="flex items-center gap-3 text-[#18201b] no-underline outline-none focus-visible:ring-2 focus-visible:ring-[#e4633f] focus-visible:ring-offset-2">
          <span class="grid size-9 place-items-center rounded-full bg-[#18201b] text-[10px] font-black tracking-[.16em] text-[#f0c84b]">NW</span>
          <span>
            <strong class="block text-[11px] font-bold uppercase tracking-[.2em]">Northward</strong>
            <small class="block text-[9px] tracking-[.08em] text-[#18201b]/45">Independent travel journal</small>
          </span>
        </a>
        <p class="hidden font-mono text-[9px] uppercase tracking-[.12em] text-[#18201b]/45 sm:block">Vol. 08 / Autumn 2026</p>
      </div>

      <AnimatedNavigationMenu
        v-model="openValue"
        v-model:active-value="activeValue"
        :items="items"
        :duration="props.duration"
        :disabled="props.disabled"
        label="Northward journal navigation"
        @open-change="handleOpenChange"
        @navigate="handleNavigate"
      />
    </header>

    <div class="relative z-10 grid min-h-[490px] gap-4 p-3 pt-5 sm:min-h-[540px] sm:grid-cols-[1.42fr_.58fr] sm:p-6 sm:pt-7">
      <article class="relative flex min-h-[390px] overflow-hidden rounded-[24px] bg-[#18201b] p-6 text-white sm:min-h-0 sm:rounded-[30px] sm:p-9">
        <svg class="absolute inset-0 size-full opacity-25" viewBox="0 0 650 520" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <path d="M-30 410C80 360 108 192 222 188c105-4 86 110 176 101 93-9 111-156 282-201" fill="none" stroke="#f0c84b" stroke-width="2" />
          <path d="M-20 458C112 391 129 258 242 252c94-5 116 91 202 59 96-35 104-151 229-188" fill="none" stroke="#f0c84b" stroke-width="1" />
          <circle cx="221" cy="188" r="9" fill="#e4633f" />
          <circle cx="444" cy="311" r="5" fill="#f0c84b" />
        </svg>
        <div class="relative flex w-full flex-col justify-between">
          <div class="flex items-start justify-between gap-4">
            <p class="text-[9px] font-bold uppercase tracking-[.25em] text-[#f0c84b]">The Atlantic issue</p>
            <span class="rounded-full border border-white/15 px-3 py-1.5 font-mono text-[8px] uppercase tracking-[.12em] text-white/55">43.142 N / 9.184 W</span>
          </div>
          <div class="max-w-xl">
            <p class="mb-4 flex items-center gap-2 text-[10px] uppercase tracking-[.18em] text-white/45"><span class="h-px w-8 bg-[#e4633f]" /> A route for the shoulder season</p>
            <h2 class="max-w-lg text-[42px] font-medium leading-[.92] tracking-[-.07em] sm:text-[62px]">Go west,<br><em class="font-serif font-normal text-[#f0c84b]">then linger.</em></h2>
            <p class="mt-5 max-w-md text-xs leading-6 text-white/52 sm:text-sm">Seven days tracing Galicia's wild edge, from granite fishing villages to the last lighthouse before open ocean.</p>
            <a href="#story" class="mt-6 inline-flex items-center gap-3 rounded-full bg-[#e4633f] px-5 py-3 text-[10px] font-bold uppercase tracking-[.15em] text-white no-underline outline-none transition-transform hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-[#f0c84b] focus-visible:ring-offset-2 focus-visible:ring-offset-[#18201b] motion-reduce:transition-none">
              Read the story <span aria-hidden="true">&#8599;</span>
            </a>
          </div>
        </div>
      </article>

      <aside class="grid gap-3 sm:grid-rows-[1fr_auto]">
        <article class="flex min-h-48 flex-col justify-between rounded-[24px] bg-[#f0c84b] p-5 sm:rounded-[30px] sm:p-6">
          <div class="flex items-center justify-between">
            <p class="text-[9px] font-bold uppercase tracking-[.2em] text-[#18201b]/55">Postcard / 024</p>
            <span class="grid size-8 place-items-center rounded-full border border-[#18201b]/15 text-sm" aria-hidden="true">&#8599;</span>
          </div>
          <div>
            <p class="font-serif text-2xl italic leading-tight tracking-[-.03em] sm:text-3xl">"The road ends.<br>The path begins."</p>
            <p class="mt-4 text-[10px] font-semibold uppercase tracking-[.14em] text-[#18201b]/48">Costa da Morte, ES</p>
          </div>
        </article>

        <div class="rounded-[22px] border border-[#18201b]/10 bg-[#fbfaf5]/75 p-4 sm:p-5">
          <div class="flex items-center justify-between gap-3">
            <div>
              <p class="text-[8px] font-bold uppercase tracking-[.18em] text-[#18201b]/42">Current destination</p>
              <p class="mt-1 text-sm font-semibold tracking-[-.025em]">{{ currentLabel }}</p>
            </div>
            <span class="relative flex size-3" aria-hidden="true"><span class="absolute inline-flex size-full animate-ping rounded-full bg-[#e4633f] opacity-30 motion-reduce:animate-none" /><span class="relative inline-flex size-3 rounded-full bg-[#e4633f]" /></span>
          </div>
          <p class="mt-3 min-h-4 border-t border-[#18201b]/10 pt-3 text-[9px] leading-4 text-[#18201b]/48" role="status" aria-live="polite" aria-atomic="true" data-testid="animated-navigation-menu-status">{{ status }}</p>
        </div>
      </aside>
    </div>
  </section>
</template>
