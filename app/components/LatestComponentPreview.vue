<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue'
import type {
  AnimatedEditableTableColumn,
  AnimatedEditableTableRow,
} from '#registry/default/animated-editable-table/AnimatedEditableTable.vue'
import type {
  KanbanCard,
  KanbanColumn,
} from '#registry/default/animated-kanban-board/AnimatedKanbanBoard.vue'
import type {
  AnimatedMultiSelectOption,
} from '#registry/default/animated-multi-select/AnimatedMultiSelect.vue'
import type { AnimatedFabMenuAction } from '#registry/default/animated-fab-menu/AnimatedFabMenu.vue'
import type { AnimatedMobileHeaderState } from '#registry/default/animated-mobile-header/AnimatedMobileHeader.vue'
import type { AnimatedLightboxImage } from '#registry/default/animated-lightbox-gallery/AnimatedLightboxGallery.vue'
import type { AnimatedNavigationItem } from '#registry/default/animated-navigation-menu/AnimatedNavigationMenu.vue'
import type { AnimatedActionSheetAction } from '#registry/default/animated-action-sheet/AnimatedActionSheet.vue'
import type { AnimatedSegmentedControlItem } from '#registry/default/animated-segmented-control/AnimatedSegmentedControl.vue'
import type { AnimatedSelectionToolbarAction } from '#registry/default/animated-selection-toolbar/AnimatedSelectionToolbar.vue'
import type { AnimatedMobileMiniPlayerTrack } from '#registry/default/animated-mobile-mini-player/AnimatedMobileMiniPlayer.vue'
import type { AnimatedMobileFilterItem } from '#registry/default/animated-mobile-filter-bar/AnimatedMobileFilterBar.vue'
import type { AnimatedMobileOnboardingStep } from '#registry/default/animated-mobile-onboarding-pager/AnimatedMobileOnboardingPager.vue'

const AnimatedEditableTable = defineAsyncComponent(() => import('#registry/default/animated-editable-table/AnimatedEditableTable.vue'))
const AnimatedKanbanBoard = defineAsyncComponent(() => import('#registry/default/animated-kanban-board/AnimatedKanbanBoard.vue'))
const AnimatedMultiSelect = defineAsyncComponent(() => import('#registry/default/animated-multi-select/AnimatedMultiSelect.vue'))
const AnimatedTimePicker = defineAsyncComponent(() => import('#registry/default/animated-time-picker/AnimatedTimePicker.vue'))
const AnimatedFabMenu = defineAsyncComponent(() => import('#registry/default/animated-fab-menu/AnimatedFabMenu.vue'))
const AnimatedMobileHeader = defineAsyncComponent(() => import('#registry/default/animated-mobile-header/AnimatedMobileHeader.vue'))
const AnimatedLightboxGallery = defineAsyncComponent(() => import('#registry/default/animated-lightbox-gallery/AnimatedLightboxGallery.vue'))
const AnimatedAlertBanner = defineAsyncComponent(() => import('#registry/default/animated-alert-banner/AnimatedAlertBanner.vue'))
const AnimatedNavigationMenu = defineAsyncComponent(() => import('#registry/default/animated-navigation-menu/AnimatedNavigationMenu.vue'))
const AnimatedActionSheet = defineAsyncComponent(() => import('#registry/default/animated-action-sheet/AnimatedActionSheet.vue'))
const AnimatedSegmentedControl = defineAsyncComponent(() => import('#registry/default/animated-segmented-control/AnimatedSegmentedControl.vue'))
const AnimatedSwipeSnackbar = defineAsyncComponent(() => import('#registry/default/animated-swipe-snackbar/AnimatedSwipeSnackbar.vue'))
const AnimatedMobileComposer = defineAsyncComponent(() => import('#registry/default/animated-mobile-composer/AnimatedMobileComposer.vue'))
const AnimatedSelectionToolbar = defineAsyncComponent(() => import('#registry/default/animated-selection-toolbar/AnimatedSelectionToolbar.vue'))
const AnimatedMobileMiniPlayer = defineAsyncComponent(() => import('#registry/default/animated-mobile-mini-player/AnimatedMobileMiniPlayer.vue'))
const AnimatedMobileFilterBar = defineAsyncComponent(() => import('#registry/default/animated-mobile-filter-bar/AnimatedMobileFilterBar.vue'))
const AnimatedMobileOnboardingPager = defineAsyncComponent(() => import('#registry/default/animated-mobile-onboarding-pager/AnimatedMobileOnboardingPager.vue'))
const AnimatedMobileNumericKeypad = defineAsyncComponent(() => import('#registry/default/animated-mobile-numeric-keypad/AnimatedMobileNumericKeypad.vue'))
const AnimatedSlideToConfirm = defineAsyncComponent(() => import('#registry/default/animated-slide-to-confirm/AnimatedSlideToConfirm.vue'))
const AnimatedMobileActionBar = defineAsyncComponent(() => import('#registry/default/animated-mobile-action-bar/AnimatedMobileActionBar.vue'))
const AnimatedMobileVoiceRecorder = defineAsyncComponent(() => import('#registry/default/animated-mobile-voice-recorder/AnimatedMobileVoiceRecorder.vue'))
const AnimatedMobileConnectivityBar = defineAsyncComponent(() => import('#registry/default/animated-mobile-connectivity-bar/AnimatedMobileConnectivityBar.vue'))
const AnimatedMobileCompass = defineAsyncComponent(() => import('#registry/default/animated-mobile-compass/AnimatedMobileCompass.vue'))
const AnimatedMobileScanner = defineAsyncComponent(() => import('#registry/default/animated-mobile-scanner/AnimatedMobileScanner.vue'))

defineProps<{ slug: string }>()

const tableColumns: AnimatedEditableTableColumn[] = [
  { key: 'item', label: 'Line item', width: '60%' },
  { key: 'status', label: 'Status', type: 'select', width: '40%', options: [{ value: 'review', label: 'In review' }, { value: 'approved', label: 'Approved' }] },
]
const tableRows = ref<AnimatedEditableTableRow[]>([
  { id: 'paper', item: 'Recycled paper', status: 'approved', budget: 4200 },
  { id: 'binding', item: 'Thread binding', status: 'review', budget: 3600 },
])

const multiSelectOptions: AnimatedMultiSelectOption[] = [
  { value: 'editorial', label: 'Editorial systems', group: 'Practice' },
  { value: 'identity', label: 'Visual identity', group: 'Practice' },
  { value: 'motion', label: 'Motion studies', group: 'Practice' },
  { value: 'research', label: 'Field research', group: 'Method' },
]
const selectedDisciplines = ref(['editorial', 'research'])
const selectedTime = ref('18:30')

const kanbanColumns: KanbanColumn[] = [
  { id: 'queue', title: 'Queue', color: '#ef8354' },
  { id: 'progress', title: 'In progress', color: '#d9ff57' },
]
const kanbanCards = ref<KanbanCard[]>([
  { id: 'brief', columnId: 'queue', title: 'Shape the campaign brief', tag: 'Strategy' },
  { id: 'prototype', columnId: 'progress', title: 'Prototype the core flow', tag: 'Product' },
])

const fabActions: AnimatedFabMenuAction[] = [
  { id: 'note', label: 'New note', icon: 'N' },
  { id: 'photo', label: 'Add photo', icon: 'P' },
  { id: 'audio', label: 'Record audio', icon: 'A' },
]
const fabExpanded = ref(false)
const mobileHeaderState = ref<AnimatedMobileHeaderState>('expanded')
const mobileHeaderEntries = ['Clay studies', 'Tidal systems', 'Night index', 'Type specimens', 'Transit sketches']
const lightboxSelected = ref(0)
const lightboxOpen = ref(false)
const alertBannerVisible = ref(true)
const navigationOpen = ref<string | null>(null)
const navigationActive = ref<string | null>('journal')
const navigationItems: AnimatedNavigationItem[] = [
  { id: 'places', label: 'Places', children: [{ id: 'coast', label: 'Coast', href: '#coast' }, { id: 'hills', label: 'Hills', href: '#hills' }] },
  { id: 'journal', label: 'Journal', href: '#journal' },
  { id: 'studio', label: 'Studio', children: [{ id: 'guides', label: 'Guides', href: '#guides' }, { id: 'trips', label: 'Trips', href: '#trips' }] },
]
const actionSheetOpen = ref(false)
const actionSheetActions: AnimatedActionSheetAction[] = [
  { id: 'share', label: 'Share collection', icon: 'SH' },
  { id: 'offline', label: 'Save offline', icon: 'DL' },
  { id: 'archive', label: 'Archive', icon: 'AR', destructive: true },
]
const segmentedValue = ref('nearby')
const segmentedItems: AnimatedSegmentedControlItem[] = [
  { id: 'nearby', label: 'Nearby', badge: 8 },
  { id: 'saved', label: 'Saved', badge: 3 },
  { id: 'visited', label: 'Visited' },
]
const snackbarOpen = ref(false)
const composerMessage = ref('Meet by the north marker')
const selectionCount = ref(0)
const selectionActions: AnimatedSelectionToolbarAction[] = [{ id: 'share', label: 'Share' }, { id: 'archive', label: 'Archive' }]
const miniPlayerOpen = ref(false)
const miniPlayerPlaying = ref(false)
const miniPlayerProgress = ref(0.28)
const miniPlayerTrack: AnimatedMobileMiniPlayerTrack = { id: 'coast', title: 'Atlantic weather', artist: 'Field Recordings', duration: 248 }
const mobileFilters: AnimatedMobileFilterItem[] = [{ id: 'coast', label: 'Coast', count: 8 }, { id: 'forest', label: 'Forest', count: 12 }, { id: 'city', label: 'City', count: 5 }, { id: 'night', label: 'Night', count: 3 }]
const selectedMobileFilters = ref<string[]>(['coast'])
const onboardingStep = ref('collect')
const onboardingSteps: AnimatedMobileOnboardingStep[] = [{ id: 'collect', title: 'Collect what catches your eye.', description: 'Save details before they disappear.', icon: '01', accent: '#d9ff57' }, { id: 'connect', title: 'Find the thread.', description: 'Connect scattered observations.', icon: '02', accent: '#e4633f' }, { id: 'carry', title: 'Take it outside.', description: 'Keep the archive ready offline.', icon: '03', accent: '#83b9ac' }]
const keypadValue = ref('')
const slideConfirmed = ref(false)
const actionBarOpen = ref(true)
const voiceRecording = ref(false)
const voicePaused = ref(false)
const connectivityOpen = ref(true)
const scannerTorch = ref(false)

function latestArtwork(label: string, background: string, accent: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600"><rect width="800" height="600" fill="${background}"/><circle cx="620" cy="130" r="180" fill="${accent}"/><path d="M0 470 180 280l140 130 130-210 210 260 140-125v265H0Z" fill="#f5efdc" fill-opacity=".75"/><text x="42" y="62" fill="#fff" font-family="sans-serif" font-size="22" font-weight="700" letter-spacing="5">${label}</text></svg>`
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

const lightboxImages: AnimatedLightboxImage[] = [
  { id: 'coast', src: latestArtwork('COAST / 01', '#456b75', '#e68251'), alt: 'Abstract coast study', caption: 'Coast study' },
  { id: 'canopy', src: latestArtwork('CANOPY / 02', '#354b3d', '#e7be58'), alt: 'Abstract forest study', caption: 'Canopy study' },
  { id: 'desert', src: latestArtwork('DESERT / 03', '#b8704f', '#f0c876'), alt: 'Abstract desert study', caption: 'Desert study' },
  { id: 'water', src: latestArtwork('WATER / 04', '#527287', '#a7d6cd'), alt: 'Abstract water study', caption: 'Water study' },
]
</script>

<template>
  <div class="latest-component-preview w-full min-w-0">
    <div v-if="slug === 'animated-mobile-scanner'" class="mx-auto w-full max-w-[300px]"><AnimatedMobileScanner v-model:torch="scannerTorch" class="min-h-[430px]" :duration="180" /></div>
    <div v-else-if="slug === 'animated-mobile-compass'" class="mx-auto w-full max-w-[340px] rounded-[22px] bg-[#b7c6bb] p-3"><AnimatedMobileCompass :heading="32" :target-bearing="118" target-label="North marker" distance="240 m" :accuracy="6" :duration="180" /></div>
    <div v-else-if="slug === 'animated-mobile-connectivity-bar'" class="mx-auto min-h-[300px] w-full max-w-[460px] rounded-[22px] bg-[#dad4c7] p-4">
      <AnimatedMobileConnectivityBar v-model:open="connectivityOpen" state="offline" :fixed="false" :safe-area="false" :duration="180" />
      <div class="mt-8 rounded-[18px] bg-white/50 p-4"><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Offline notes</p><p class="mt-3 text-2xl font-semibold tracking-[-.05em]">North trail index.</p></div>
    </div>
    <div v-else-if="slug === 'animated-mobile-voice-recorder'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] flex-col justify-end rounded-[22px] bg-[#c8d2ca] p-4">
      <div class="mb-8 max-w-[80%] rounded-[18px_18px_18px_5px] bg-white/75 px-4 py-3 text-xs">Capture the sound near the north marker.</div>
      <AnimatedMobileVoiceRecorder v-model:recording="voiceRecording" v-model:paused="voicePaused" :max-duration="90" :duration="180" />
    </div>
    <div v-else-if="slug === 'animated-mobile-action-bar'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] flex-col justify-between rounded-[22px] bg-[#ddd7c9] p-4">
      <div><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Field workshop</p><p class="mt-3 text-2xl font-semibold tracking-[-.05em]">Coastal archive walk.</p></div>
      <AnimatedMobileActionBar v-model:open="actionBarOpen" title="$48 · 1 place" description="Free cancellation" primary-label="Reserve" :fixed="false" :safe-area="false" :duration="180" />
    </div>

    <div v-else-if="slug === 'animated-slide-to-confirm'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] flex-col justify-between rounded-[22px] bg-[#ddd7c9] p-5">
      <div><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Publish field log</p><p class="mt-3 text-2xl font-semibold tracking-[-.05em]">North coast,<br>low tide.</p></div>
      <AnimatedSlideToConfirm v-model="slideConfirmed" label="Slide to publish" confirmed-label="Published" :duration="180" tone="success" />
    </div>

    <div v-else-if="slug === 'animated-mobile-numeric-keypad'" class="mx-auto flex h-[300px] w-full max-w-[460px] justify-center overflow-hidden rounded-[22px] bg-[#d8d3c5] p-2">
      <AnimatedMobileNumericKeypad v-model="keypadValue" mode="decimal" label="Transfer amount" placeholder="0.00" :max-length="6" submit-label="Continue" :duration="100" class="w-[360px] shrink-0 origin-top scale-[.69]" />
    </div>

    <div v-else-if="slug === 'animated-mobile-onboarding-pager'" class="mx-auto flex h-[300px] w-full max-w-[460px] justify-center overflow-hidden rounded-[22px] bg-[#d8d3c5] p-1">
      <AnimatedMobileOnboardingPager v-model="onboardingStep" :steps="onboardingSteps" :duration="180" :safe-area="false" :show-skip="false" class="w-[390px] shrink-0 origin-top scale-[.54]" />
    </div>

    <div v-else-if="slug === 'animated-mobile-filter-bar'" class="mx-auto min-h-[300px] w-full max-w-[460px] overflow-hidden rounded-[22px] bg-[#e7e2d4] p-4" style="--filter-edge: #e7e2d4">
      <p class="mb-5 mt-3 text-2xl font-semibold tracking-[-.05em]">Sort the landscape.</p>
      <AnimatedMobileFilterBar v-model="selectedMobileFilters" :items="mobileFilters" :duration="180" label="Filter field notes" />
      <div class="mt-5 grid grid-cols-3 gap-2"><span v-for="index in 3" :key="index" class="h-28 rounded-[16px]" :class="index === 1 ? 'bg-[#de7450]' : index === 2 ? 'bg-[#648675]' : 'bg-[#e4bd54]'" /></div>
    </div>

    <div v-else-if="slug === 'animated-mobile-mini-player'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] items-center justify-center rounded-[22px] bg-[#e7e2d4] p-4">
      <button type="button" class="rounded-[18px] bg-[#1c1e1a] px-5 py-4 text-xs font-semibold text-white" @click="miniPlayerOpen = true">Play Atlantic weather</button>
      <AnimatedMobileMiniPlayer v-model="miniPlayerPlaying" v-model:open="miniPlayerOpen" v-model:progress="miniPlayerProgress" :track="miniPlayerTrack" :duration="180" :safe-area="false" />
    </div>

    <div v-else-if="slug === 'animated-selection-toolbar'" class="mx-auto grid min-h-[300px] w-full max-w-[460px] grid-cols-2 gap-2 rounded-[22px] bg-[#e7e2d4] p-4">
      <button v-for="index in 4" :key="index" type="button" class="rounded-[16px] border border-black/[0.07] bg-white/70 p-3 text-left text-[10px] font-semibold" @click="selectionCount = selectionCount === index ? 0 : index">Field note 0{{ index }}</button>
      <AnimatedSelectionToolbar :selected-count="selectionCount" :actions="selectionActions" :duration="180" :safe-area="false" @clear="selectionCount = 0" />
    </div>

    <div v-else-if="slug === 'animated-mobile-composer'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] flex-col justify-end rounded-[22px] bg-[#e7e2d4] p-4">
      <p class="mb-3 max-w-[75%] rounded-[16px] rounded-bl-sm bg-white/75 px-3 py-2 text-[10px]">The tide is low enough for the north path.</p>
      <AnimatedMobileComposer v-model="composerMessage" :max-length="120" :max-rows="3" :duration="180" :safe-area="false" label="Quick message" />
    </div>

    <div v-else-if="slug === 'animated-swipe-snackbar'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] items-center justify-center rounded-[22px] bg-[#e7e2d4] p-5">
      <button type="button" class="min-h-11 rounded-2xl bg-[#1d1f1b] px-5 text-xs font-semibold text-white" @click="snackbarOpen = true">Save field notes</button>
      <AnimatedSwipeSnackbar v-model="snackbarOpen" title="Changes saved" message="Field notes are available offline." action-label="Undo" tone="success" :timeout="0" :duration="180" />
    </div>

    <div v-else-if="slug === 'animated-segmented-control'" class="mx-auto min-h-[300px] w-full max-w-[480px] rounded-[22px] bg-[#e7e2d4] p-5">
      <p class="mb-8 text-2xl font-semibold tracking-[-.05em]">Places worth a pause.</p>
      <AnimatedSegmentedControl v-model="segmentedValue" :items="segmentedItems" :duration="180" label="Filter places" />
      <div class="mt-5 grid grid-cols-3 gap-2"><span v-for="index in 3" :key="index" class="h-24 rounded-[16px]" :class="index === 1 ? 'bg-[#1c1d1a]' : 'bg-white/70'" /></div>
    </div>

    <div v-else-if="slug === 'animated-action-sheet'" class="mx-auto flex min-h-[300px] w-full max-w-[460px] items-center justify-center rounded-[22px] bg-[#e7e2d4] p-5">
      <div class="w-full max-w-xs rounded-[22px] bg-white/80 p-5 shadow-xl">
        <p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Saved collection</p>
        <p class="mt-2 text-2xl font-semibold leading-none tracking-[-.05em]">Weathered coastlines</p>
        <button type="button" class="mt-8 min-h-11 w-full rounded-2xl bg-[#e4633f] text-xs font-semibold text-white" @click="actionSheetOpen = true">Collection actions</button>
      </div>
      <AnimatedActionSheet v-model="actionSheetOpen" :actions="actionSheetActions" title="Weathered coastlines" :duration="180" />
    </div>

    <div v-else-if="slug === 'animated-navigation-menu'" class="mx-auto min-h-[300px] w-full max-w-[500px] rounded-[22px] bg-[#e7e2d4] p-4 sm:p-5">
      <div class="mb-16 flex items-center justify-between px-1">
        <span class="grid size-9 place-items-center rounded-full bg-[#18201b] text-[9px] font-black text-[#f0c84b]">NW</span>
        <span class="font-mono text-[8px] uppercase tracking-[.16em] text-black/35">Field journal</span>
      </div>
      <AnimatedNavigationMenu v-model="navigationOpen" v-model:active-value="navigationActive" :items="navigationItems" :duration="180" label="Field journal navigation" />
      <p class="mt-16 max-w-xs text-2xl font-medium leading-none tracking-[-.055em] text-[#18201b]">Routes for going slowly.</p>
    </div>

    <div v-else-if="slug === 'animated-alert-banner'" class="mx-auto grid min-h-[300px] w-full max-w-[460px] place-items-center rounded-[22px] bg-[#eef0e8] p-4">
      <AnimatedAlertBanner
        v-model="alertBannerVisible"
        title="Workspace update complete"
        description="Search is faster and access controls are ready to review."
        tone="success"
        :duration="180"
        expandable
      >
        <template #details>Three improvements are ready for your team.</template>
      </AnimatedAlertBanner>
      <button v-if="!alertBannerVisible" type="button" class="rounded-full bg-[#171814] px-4 py-2 text-[10px] font-semibold text-white" @click="alertBannerVisible = true">Restore alert</button>
    </div>

    <div v-else-if="slug === 'animated-lightbox-gallery'" class="mx-auto w-full max-w-[420px] rounded-[22px] bg-[#e9e5dc] p-3">
      <div class="mb-3 flex items-end justify-between px-1">
        <div>
          <p class="text-[8px] font-black uppercase tracking-[.18em] text-black/35">Field journal</p>
          <p class="mt-1 text-sm font-semibold tracking-[-.03em]">Quiet places</p>
        </div>
        <span class="text-[9px] tabular-nums text-black/40">0{{ lightboxSelected + 1 }} / 04</span>
      </div>
      <AnimatedLightboxGallery
        v-model="lightboxSelected"
        v-model:open="lightboxOpen"
        :images="lightboxImages"
        :duration="180"
        :safe-area="false"
        label="Quiet places"
      />
    </div>

    <AnimatedMobileHeader
      v-else-if="slug === 'animated-mobile-header'"
      v-model="mobileHeaderState"
      title="Field Library"
      subtitle="Studio archive"
      mode="compact"
      :safe-area="false"
      :duration="180"
      :collapse-at="20"
      height="300px"
    >
      <div class="grid gap-2 p-3">
        <div class="rounded-[16px] bg-[#d9ff57] p-3 text-[11px] font-semibold">Objects that change after weather</div>
        <div v-for="(entry, index) in mobileHeaderEntries" :key="entry" class="flex items-center gap-2 rounded-[14px] border border-black/[.06] bg-white/75 p-2.5">
          <span class="grid size-8 place-items-center rounded-[10px] bg-[#171814] text-[9px] font-black text-white">0{{ index + 1 }}</span>
          <span class="text-[10px] font-semibold">{{ entry }}</span>
        </div>
      </div>
    </AnimatedMobileHeader>

    <div v-else-if="slug === 'animated-bottom-sheet'" class="relative mx-auto flex h-[300px] w-full max-w-[340px] flex-col overflow-hidden rounded-[24px] border border-black/10 bg-[#e8e4d4]">
      <div class="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,#17181422_1px,transparent_1px),linear-gradient(to_bottom,#17181422_1px,transparent_1px)] [background-size:30px_30px]" aria-hidden="true" />
      <div class="absolute inset-x-0 bottom-0 z-10 flex flex-col rounded-t-[20px] border-t border-black/10 bg-[#f7f5ee] px-4 pt-2.5 pb-4 shadow-[0_-18px_50px_-26px_rgba(13,18,12,0.55)]">
        <span class="mx-auto mb-2 h-1.5 w-10 rounded-full bg-[#171814]/25" aria-hidden="true" />
        <strong class="text-[13px] font-semibold tracking-[-0.02em]">Route options</strong>
        <span class="mt-2 flex items-center gap-2 rounded-xl border border-black/[.07] bg-white/75 px-2.5 py-2 text-[10px] font-medium">
          <span class="grid size-7 place-items-center rounded-lg bg-[#171814] text-[9px] font-black text-brand">TR</span>
          Transit · 26 min
        </span>
        <span class="mt-1.5 flex items-center gap-2 rounded-xl border border-black/[.07] bg-white/75 px-2.5 py-2 text-[10px] font-medium">
          <span class="grid size-7 place-items-center rounded-lg bg-[#ef8354] text-[9px] font-black text-white">RH</span>
          Ride hail · 11 min
        </span>
      </div>
    </div>

    <div v-else-if="slug === 'animated-fab-menu'" class="relative h-[300px] w-full overflow-hidden rounded-[24px] border border-black/10 bg-[#e3ecdd]">
      <div class="absolute left-5 top-5">
        <p class="text-[9px] font-black uppercase tracking-[.18em] text-[#171814]/45">Quick actions</p>
        <p class="mt-1 text-[13px] font-semibold tracking-[-0.02em]">Collect from the floor</p>
      </div>
      <AnimatedFabMenu
        v-model="fabExpanded"
        class="bottom-5 right-5"
        :actions="fabActions"
        :duration="180"
        label="Capture"
      />
    </div>

    <AnimatedEditableTable
      v-else-if="slug === 'animated-editable-table'"
      v-model="tableRows"
      :columns="tableColumns"
      :duration="180"
      :removable="false"
      label="Compact production budget"
    />

    <div v-else-if="slug === 'animated-multi-select'" class="mx-auto w-full max-w-xl">
      <AnimatedMultiSelect
        v-model="selectedDisciplines"
        :options="multiSelectOptions"
        :max-selected="3"
        :duration="180"
        label="Creative disciplines"
      />
    </div>

    <div v-else-if="slug === 'animated-time-picker'" class="mx-auto w-full max-w-[430px]">
      <AnimatedTimePicker
        v-model="selectedTime"
        :step-minutes="15"
        :format="12"
        :duration="180"
        label="Meeting time"
      />
    </div>

    <div v-else-if="slug === 'animated-kanban-board'" class="max-w-full overflow-x-auto overscroll-x-contain pb-2">
      <AnimatedKanbanBoard
        v-model="kanbanCards"
        :columns="kanbanColumns"
        :duration="180"
        label="Compact project board"
      />
    </div>

    <p v-else class="text-sm text-black/40">Preview available on the component page.</p>
  </div>
</template>

<style scoped>
.latest-component-preview :deep(.animated-editable-table table) {
  min-width: 100%;
}

.latest-component-preview :deep([data-kanban-column-id]) {
  min-height: 280px;
}
</style>
