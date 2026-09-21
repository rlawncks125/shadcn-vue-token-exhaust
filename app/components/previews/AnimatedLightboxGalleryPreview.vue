<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedLightboxGallery, { type AnimatedLightboxImage } from '#registry/default/animated-lightbox-gallery/AnimatedLightboxGallery.vue'

const props = withDefaults(defineProps<{
  duration?: number
  loop?: boolean
  zoomable?: boolean
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  safeArea?: boolean
  disabled?: boolean
}>(), {
  duration: 320,
  loop: true,
  zoomable: true,
  closeOnBackdrop: true,
  lockScroll: true,
  safeArea: true,
  disabled: false,
})

function artwork(label: string, background: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="${background}"/><circle cx="940" cy="190" r="260" fill="${accent}" fill-opacity=".78"/><path d="M0 700 260 430l190 175 180-280 270 330 160-160 140 205v200H0Z" fill="#f7f1df" fill-opacity=".7"/><path d="M0 775c260-120 490 90 720-25s330-70 480-5v155H0Z" fill="#18201b" fill-opacity=".8"/><text x="68" y="92" fill="#fff" font-family="sans-serif" font-size="30" font-weight="700" letter-spacing="7">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const images: AnimatedLightboxImage[] = [
  {
    id: 'basalt-shore',
    src: artwork('BASALT / 01', '#456b75', '#e68251'),
    alt: 'Rocky shoreline meeting a quiet blue sea',
    caption: 'Where the coast keeps its own time',
    credit: 'Field notes / North Atlantic',
  },
  {
    id: 'alpine-road',
    src: artwork('ALPINE / 02', '#798a83', '#d4e56e'),
    alt: 'A narrow road crossing a dramatic mountain landscape',
    caption: 'The long way through',
    credit: 'Route journal / Mile 218',
  },
  {
    id: 'forest-light',
    src: artwork('CANOPY / 03', '#354b3d', '#e7be58'),
    alt: 'Soft morning light passing through a dense forest',
    caption: 'First light, under canopy',
    credit: 'Study no. 07 / Temperate forest',
  },
  {
    id: 'desert-form',
    src: artwork('DESERT / 04', '#b8704f', '#f0c876'),
    alt: 'Wind-shaped desert forms beneath an open sky',
    caption: 'A landscape drawn by weather',
    credit: 'Latitude 31 / Late afternoon',
  },
  {
    id: 'still-water',
    src: artwork('WATER / 05', '#527287', '#a7d6cd'),
    alt: 'A calm lake reflecting the surrounding hills',
    caption: 'After the wind falls away',
    credit: 'Lake district / 06:42',
  },
  {
    id: 'concrete-study',
    src: artwork('MASS / 06', '#5e5b59', '#e26045'),
    alt: 'Geometric architecture casting deep angular shadows',
    caption: 'Light, mass, interval',
    credit: 'City study / Frame 12',
  },
]

const selected = ref(0)
const isOpen = ref(false)
const status = ref('Select a frame to open the field notes.')
const activeImage = computed(() => images[selected.value])

function handleChange(image: AnimatedLightboxImage, index: number, source: string): void {
  status.value = `${image.caption ?? image.alt}. Image ${index + 1} selected via ${source}.`
}

function handleOpenChange(open: boolean): void {
  status.value = open
    ? `Lightbox opened on image ${selected.value + 1}.`
    : 'Lightbox closed. Focus returned to the gallery.'
}
</script>

<template>
  <div data-testid="animated-lightbox-gallery-preview" class="w-full overflow-hidden rounded-2xl border border-border bg-[#e9e5dc] text-[#171814]">
    <div class="border-b border-black/10 px-5 py-5 sm:px-8 sm:py-7">
      <div class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="text-[9px] font-bold uppercase tracking-[0.24em] text-[#687064]">Field journal / Vol. 04</p>
          <h3 class="mt-3 max-w-lg text-3xl font-semibold leading-[0.92] tracking-[-0.055em] sm:text-5xl">On the edge<br>of quiet places.</h3>
        </div>
        <div class="max-w-[240px] border-l border-black/15 pl-4">
          <p class="text-[10px] leading-5 text-black/55">Six observations on distance, weather, and the patient shape of the land.</p>
          <p class="mt-2 text-[8px] font-bold uppercase tracking-[0.16em] text-black/35">Use arrows to move / +/- to inspect</p>
        </div>
      </div>
    </div>

    <div class="p-3 sm:p-5">
      <AnimatedLightboxGallery
        v-model="selected"
        v-model:open="isOpen"
        :images="images"
        :duration="props.duration"
        :loop="props.loop"
        :zoomable="props.zoomable"
        :close-on-backdrop="props.closeOnBackdrop"
        :lock-scroll="props.lockScroll"
        :safe-area="props.safeArea"
        :disabled="props.disabled"
        label="Quiet places photo essay"
        @change="handleChange"
        @open-change="handleOpenChange"
      />
    </div>

    <footer class="flex flex-col gap-3 border-t border-black/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
      <div class="flex items-center gap-3">
        <span class="grid size-8 place-items-center rounded-full bg-[#c9f05b] text-[9px] font-bold tabular-nums">{{ String(selected + 1).padStart(2, '0') }}</span>
        <div>
          <p class="text-[10px] font-semibold">{{ activeImage?.caption }}</p>
          <p data-testid="animated-lightbox-preview-status" class="mt-0.5 text-[9px] text-black/45" aria-live="polite">{{ status }}</p>
        </div>
      </div>
      <p class="text-[8px] font-bold uppercase tracking-[0.18em] text-black/35">Archive 2026 / Open edition</p>
    </footer>
  </div>
</template>
