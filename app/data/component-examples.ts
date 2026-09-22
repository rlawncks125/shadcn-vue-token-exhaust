export const componentExamples: Record<string, string> = {
  'animated-mobile-scanner': `<script setup lang="ts">
const torch = ref(false)
</script>

<template>
  <AnimatedMobileScanner
    v-model:torch="torch"
    @detected="(value, format) => handleCode(value, format)"
    @camera-error="message => showCameraHelp(message)"
  />
</template>`,
  'animated-mobile-compass': `<script setup lang="ts">
const heading = ref(0)
const targetBearing = ref(118)
</script>

<template>
  <AnimatedMobileCompass
    v-model:heading="heading"
    :target-bearing="targetBearing"
    target-label="North marker"
    distance="240 m"
    :accuracy="6"
    @sensor-error="message => showSensorHelp(message)"
  />
</template>`,
  'animated-mobile-connectivity-bar': `<script setup lang="ts">
const visible = ref(true)
const network = ref<'online' | 'connecting' | 'offline'>('offline')
</script>

<template>
  <AnimatedMobileConnectivityBar
    v-model:open="visible"
    :state="network"
    @retry="reconnect()"
  />
</template>`,
  'animated-mobile-voice-recorder': `<script setup lang="ts">
const recording = ref(false)
const paused = ref(false)
</script>

<template>
  <AnimatedMobileVoiceRecorder
    v-model:recording="recording"
    v-model:paused="paused"
    :max-duration="90"
    @start="mediaRecorder.start()"
    @pause="mediaRecorder.pause()"
    @resume="mediaRecorder.resume()"
    @cancel="discardVoiceNote()"
    @send="seconds => sendVoiceNote(seconds)"
  />
</template>`,
  'animated-mobile-action-bar': `<script setup lang="ts">
const open = ref(true)
</script>

<template>
  <AnimatedMobileActionBar v-model:open="open" title="$48 · 1 place" description="Free cancellation until Friday" primary-label="Reserve" secondary-label="Details" @primary="reserve()" />
</template>`,
  'animated-slide-to-confirm': `<script setup lang="ts">
const confirmed = ref(false)
</script>

<template>
  <AnimatedSlideToConfirm
    v-model="confirmed"
    label="Slide to publish"
    confirmed-label="Field log published"
    tone="success"
    :reset-after="2400"
    @confirm="publishFieldLog()"
  />
</template>`,
  'animated-mobile-numeric-keypad': `<script setup lang="ts">
const amount = ref('')
</script>

<template>
  <AnimatedMobileNumericKeypad
    v-model="amount"
    mode="decimal"
    label="Transfer amount"
    placeholder="0.00"
    :max-length="8"
    submit-label="Continue"
    @submit="value => createTransfer(value)"
  />
</template>`,
  'animated-mobile-onboarding-pager': `<script setup lang="ts">
import type { AnimatedMobileOnboardingStep } from '@/components/animated-mobile-onboarding-pager/AnimatedMobileOnboardingPager.vue'

const active = ref('collect')
const steps: AnimatedMobileOnboardingStep[] = [
  { id: 'collect', title: 'Collect field notes', description: 'Save details before they disappear.', icon: '01', accent: '#d9ff57' },
  { id: 'connect', title: 'Connect the archive', description: 'Find useful threads between observations.', icon: '02', accent: '#e4633f' },
  { id: 'carry', title: 'Take it offline', description: 'Keep the essentials close without a signal.', icon: '03', accent: '#83b9ac' },
]
</script>

<template>
  <AnimatedMobileOnboardingPager
    v-model="active"
    :steps="steps"
    @skip="closeOnboarding()"
    @complete="finishOnboarding()"
  />
</template>`,
  'animated-mobile-filter-bar': `<script setup lang="ts">
import type { AnimatedMobileFilterItem } from '@/components/animated-mobile-filter-bar/AnimatedMobileFilterBar.vue'

const selected = ref<string[]>(['coast'])
const filters: AnimatedMobileFilterItem[] = [
  { id: 'coast', label: 'Coast', count: 8 },
  { id: 'forest', label: 'Forest', count: 12 },
  { id: 'city', label: 'City', count: 5 },
  { id: 'private', label: 'Private', disabled: true },
]
</script>

<template>
  <AnimatedMobileFilterBar
    v-model="selected"
    :items="filters"
    label="Filter field notes"
    @change="value => loadNotes(value)"
  />
</template>`,
  'animated-mobile-mini-player': `<script setup lang="ts">
import type { AnimatedMobileMiniPlayerTrack } from '@/components/animated-mobile-mini-player/AnimatedMobileMiniPlayer.vue'
const open = ref(true)
const playing = ref(false)
const progress = ref(0.28)
const track: AnimatedMobileMiniPlayerTrack = { id: 'coast', title: 'Atlantic weather', artist: 'Field Recordings', duration: 248 }
</script>

<template>
  <AnimatedMobileMiniPlayer v-model="playing" v-model:open="open" v-model:progress="progress" :track="track" @next="playNext()" />
</template>`,
  'animated-selection-toolbar': `<script setup lang="ts">
import type { AnimatedSelectionToolbarAction } from '@/components/animated-selection-toolbar/AnimatedSelectionToolbar.vue'

const selected = ref<string[]>([])
const actions: AnimatedSelectionToolbarAction[] = [
  { id: 'share', label: 'Share', icon: 'SH' },
  { id: 'archive', label: 'Archive', icon: 'AR' },
  { id: 'delete', label: 'Delete', destructive: true },
]
</script>

<template>
  <AnimatedSelectionToolbar :selected-count="selected.length" :actions="actions" @action="runBulkAction" @clear="selected = []" />
</template>`,
  'animated-mobile-composer': `<script setup lang="ts">
const message = ref('')
function send(value: string) {
  console.log('send', value)
  message.value = ''
}
</script>

<template>
  <AnimatedMobileComposer
    v-model="message"
    placeholder="Message the group..."
    label="Group message"
    :max-length="280"
    @submit="send"
    @attach="openAttachmentPicker()"
  />
</template>`,
  'animated-swipe-snackbar': `<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <button type="button" @click="open = true">Save changes</button>
  <AnimatedSwipeSnackbar
    v-model="open"
    title="Changes saved"
    message="Your field notes are available offline."
    action-label="Undo"
    tone="success"
    @action="undoSave()"
  />
</template>`,
  'animated-segmented-control': `<script setup lang="ts">
import type { AnimatedSegmentedControlItem } from '@/components/animated-segmented-control/AnimatedSegmentedControl.vue'

const selected = ref('nearby')
const items: AnimatedSegmentedControlItem[] = [
  { id: 'nearby', label: 'Nearby', badge: 8 },
  { id: 'saved', label: 'Saved', badge: 3 },
  { id: 'visited', label: 'Visited' },
]
</script>

<template>
  <AnimatedSegmentedControl v-model="selected" :items="items" label="Filter places" />
</template>`,
  'animated-action-sheet': `<script setup lang="ts">
import type { AnimatedActionSheetAction } from '@/components/animated-action-sheet/AnimatedActionSheet.vue'

const open = ref(false)
const actions: AnimatedActionSheetAction[] = [
  { id: 'share', label: 'Share collection', description: 'Send a private link', icon: 'SH' },
  { id: 'offline', label: 'Save for offline', icon: 'DL' },
  { id: 'archive', label: 'Archive collection', destructive: true },
]
</script>

<template>
  <button type="button" @click="open = true">Collection actions</button>
  <AnimatedActionSheet
    v-model="open"
    :actions="actions"
    title="Weathered coastlines"
    description="Choose an action for this collection."
    @select="action => console.log(action.id)"
  />
</template>`,
  'animated-navigation-menu': `<script setup lang="ts">
import type { AnimatedNavigationItem } from '@/components/animated-navigation-menu/AnimatedNavigationMenu.vue'

const open = ref<string | null>(null)
const active = ref<string | null>('journal')
const items: AnimatedNavigationItem[] = [
  {
    id: 'explore',
    label: 'Explore',
    description: 'Routes, places, and field guides.',
    children: [
      { id: 'coast', label: 'Coastal routes', description: 'Follow the Atlantic edge', href: '/coast' },
      { id: 'highlands', label: 'Highlands', description: 'Cabins and long light', href: '/highlands' },
    ],
  },
  { id: 'journal', label: 'Journal', href: '/journal' },
  { id: 'about', label: 'About', href: '/about' },
]
</script>

<template>
  <AnimatedNavigationMenu
    v-model="open"
    v-model:active-value="active"
    :items="items"
    label="Travel journal navigation"
    @navigate="item => console.log(item.label)"
  />
</template>`,
  'animated-alert-banner': `<script setup lang="ts">
const visible = ref(true)
</script>

<template>
  <AnimatedAlertBanner
    v-model="visible"
    title="Your workspace is ready"
    description="Three updates were applied successfully."
    tone="success"
    expandable
  >
    <template #details>
      Review the release notes before inviting your team.
    </template>
    <template #action>
      <button type="button">Review notes</button>
    </template>
  </AnimatedAlertBanner>
</template>`,
  'animated-lightbox-gallery': `<script setup lang="ts">
import type { AnimatedLightboxImage } from '@/components/animated-lightbox-gallery/AnimatedLightboxGallery.vue'

const selected = ref(0)
const open = ref(false)
const images: AnimatedLightboxImage[] = [
  { id: 'coast', src: '/images/coast.jpg', alt: 'Rocky coast at dusk', caption: 'North coast' },
  { id: 'forest', src: '/images/forest.jpg', alt: 'Morning light in a forest', caption: 'Under canopy' },
  { id: 'desert', src: '/images/desert.jpg', alt: 'Wind-shaped desert ridge', caption: 'Weather forms' },
]
</script>

<template>
  <AnimatedLightboxGallery
    v-model="selected"
    v-model:open="open"
    :images="images"
    :loop="true"
    :zoomable="true"
    :safe-area="true"
    label="Field study gallery"
  />
</template>`,
  'animated-mobile-header': `<script setup lang="ts">
import type { AnimatedMobileHeaderState } from '@/components/default/animated-mobile-header/AnimatedMobileHeader.vue'

const headerState = ref<AnimatedMobileHeaderState>('expanded')
</script>

<template>
  <AnimatedMobileHeader
    v-model="headerState"
    title="Field Library"
    subtitle="North studio / Archive"
    mode="hide"
    :collapse-at="32"
    :show-progress="true"
  >
    <article class="space-y-6 p-5">
      <section v-for="index in 8" :key="index" class="min-h-40 rounded-2xl bg-muted p-5">
        Collection {{ index }}
      </section>
    </article>
  </AnimatedMobileHeader>
</template>`,
  'animated-bottom-sheet': `<script setup lang="ts">
const open = ref(false)
const snapHeights = [0.42, 0.72, 0.94]

function onSnapChange(index: number, source: 'drag' | 'keyboard' | 'programmatic' | 'open' | 'close') {
  console.log('snapped to', snapHeights[index], source)
}
</script>

<template>
  <button type="button" @click="open = true">Show routes</button>
  <AnimatedBottomSheet
    v-model="open"
    title="Route options"
    description="Drag the handle to change height."
    :snap-points="snapHeights"
    initial-snap="1"
    @snap-change="onSnapChange"
  >
    <p>Sheet content scrolls independently at every snap height.</p>
  </AnimatedBottomSheet>
</template>`,
  'animated-fab-menu': `<script setup lang="ts">
const expanded = ref(false)
const actions = [
  { id: 'note', label: 'New note', icon: 'N' },
  { id: 'photo', label: 'Add photo', icon: 'P' },
  { id: 'audio', label: 'Record audio', icon: 'A' },
]

function onSelect(action: { id: string; label: string }) {
  console.log(action.label)
}
</script>

<template>
  <div class="relative min-h-64">
    <AnimatedFabMenu
      v-model="expanded"
      :actions="actions"
      class="bottom-6 right-6"
      label="Capture"
      direction="up"
      @select="onSelect"
    />
  </div>
</template>`,
  'animated-editable-table': `<script setup lang="ts">
const columns = [
  { key: 'item', label: 'Line item' },
  { key: 'status', label: 'Status', type: 'select', options: [
    { value: 'draft', label: 'Draft' },
    { value: 'approved', label: 'Approved' },
  ] },
  { key: 'budget', label: 'Budget', type: 'number' },
]
const rows = ref([
  { id: 'paper', item: 'Recycled paper', status: 'approved', budget: 4200 },
  { id: 'ink', item: 'Soy ink batch', status: 'draft', budget: 2800 },
])
</script>

<template>
  <AnimatedEditableTable v-model="rows" :columns="columns" label="Production budget" />
</template>`,
  'animated-multi-select': `<script setup lang="ts">
const disciplines = [
  { value: 'editorial', label: 'Editorial systems', group: 'Practice' },
  { value: 'motion', label: 'Motion studies', group: 'Practice' },
  { value: 'research', label: 'Field research', group: 'Method' },
]
const selected = ref(['editorial'])
</script>

<template>
  <AnimatedMultiSelect
    v-model="selected"
    :options="disciplines"
    :max-selected="3"
    label="Creative disciplines"
  />
</template>`,
  'animated-time-picker': `<script setup lang="ts">
type TimeChangeSource = 'hour' | 'minute' | 'period' | 'increment' | 'decrement' | 'reset'

const arrival = ref<string>('18:30')

function handleChange(value: string, previous: string, source: TimeChangeSource) {
  console.log({ value, previous, source })
}
</script>

<template>
  <AnimatedTimePicker
    v-model="arrival"
    min="16:00"
    max="22:30"
    :step-minutes="15"
    :format="12"
    name="arrival_time"
    label="Arrival time"
    @change="handleChange"
  />
</template>`,
  'animated-kanban-board': `<script setup lang="ts">
interface KanbanColumn { id: string; title: string; description?: string; color?: string }
interface KanbanCard { id: string; columnId: string; title: string; description?: string; tag?: string; disabled?: boolean }
interface CardPosition { columnId: string; index: number }

const columns: KanbanColumn[] = [
  { id: 'todo', title: 'To do', color: '#ef8354' },
  { id: 'doing', title: 'In progress', color: '#d9ff57' },
  { id: 'done', title: 'Done', color: '#74a4bc' },
]
const cards = ref<KanbanCard[]>([
  { id: 'brief', columnId: 'todo', title: 'Approve launch brief', tag: 'Strategy' },
  { id: 'prototype', columnId: 'doing', title: 'Test checkout flow', tag: 'Product' },
])

function handleMove(card: KanbanCard, previous: CardPosition, next: CardPosition) {
  console.log(card.id, previous, next)
}
</script>

<template>
  <AnimatedKanbanBoard
    v-model="cards"
    :columns="columns"
    label="Launch workflow"
    @move="handleMove"
  />
</template>`,
  'animated-combobox': `<script setup lang="ts">
interface DestinationOption {
  value: string
  label: string
  description?: string
  group?: string
  disabled?: boolean
}

const destinations: DestinationOption[] = [
  { value: 'lisbon', label: 'Lisbon, Portugal', group: 'Europe' },
  { value: 'kyoto', label: 'Kyoto, Japan', group: 'Asia' },
  { value: 'oaxaca', label: 'Oaxaca, Mexico', group: 'Americas' },
]
const destination = ref<string | null>('lisbon')
const query = ref<string>('Lisbon, Portugal')
</script>

<template>
  <AnimatedCombobox
    v-model="destination"
    v-model:query="query"
    :options="destinations"
    label="Field destination"
    placeholder="Search a city or region"
    allow-custom
    @custom="value => console.log('Custom destination', value)"
  />
</template>`,
  'animated-tree-view': `<script setup lang="ts">
interface TreeNode {
  id: string
  label: string
  description?: string
  disabled?: boolean
  children?: TreeNode[]
}

const nodes: TreeNode[] = [
  { id: 'brief', label: 'Brief', children: [
    { id: 'goals', label: 'Goals' },
    { id: 'audience', label: 'Audience research' },
  ] },
  { id: 'delivery', label: 'Delivery', children: [
    { id: 'release', label: 'Release checklist' },
  ] },
]
const selected = ref<string | null>('goals')
const expanded = ref<string[]>(['brief'])
</script>

<template>
  <AnimatedTreeView
    v-model:selected="selected"
    v-model:expanded="expanded"
    :nodes="nodes"
    label="Project documents"
    @select="node => console.log('Open', node.id)"
  />
</template>`,
  'animated-date-picker': `<script setup lang="ts">
type DateChangeSource = 'pointer' | 'keyboard' | 'today'

const date = ref<string>('2026-10-16')
const visibleMonth = ref<string>('2026-10')

function handleChange(value: string, previous: string, source: DateChangeSource) {
  console.log({ value, previous, source })
}
</script>

<template>
  <AnimatedDatePicker
    v-model="date"
    v-model:visible-month="visibleMonth"
    min="2026-10-01"
    max="2026-12-20"
    :disabled-dates="['2026-10-19', '2026-10-26']"
    label="Visit date"
    @change="handleChange"
  />
</template>`,
  'animated-resizable-panels': `<script setup lang="ts">
const primarySize = ref<number>(42)
const panels = ref<{ reset: () => void; collapse: () => void } | null>(null)
</script>

<template>
  <div class="h-[28rem]">
    <AnimatedResizablePanels
      ref="panels"
      v-model="primarySize"
      :min="24"
      :max="76"
      :snap-points="[32, 50, 68]"
      collapsible
    >
      <template #primary="{ collapsed }"><aside v-if="!collapsed">Navigation</aside></template>
      <template #secondary><main>Document workspace</main></template>
    </AnimatedResizablePanels>
  </div>
  <button type="button" @click="panels?.reset()">Reset layout</button>
</template>`,
  'animated-transfer-list': `<script setup lang="ts">
interface TransferItem {
  id: string
  label: string
  description?: string
  meta?: string
  disabled?: boolean
}

const people: TransferItem[] = [
  { id: 'ari', label: 'Ari Reed', description: 'Product design' },
  { id: 'morgan', label: 'Morgan Liu', description: 'Research lead' },
  { id: 'samira', label: 'Samira Holt', description: 'Engineering' },
]
const assigned = ref<string[]>(['morgan'])
const active = ref<string[]>([])
</script>

<template>
  <AnimatedTransferList
    v-model="assigned"
    v-model:active-ids="active"
    :items="people"
    source-label="Team directory"
    destination-label="Review room"
    @transfer="(items, direction) => console.log(direction, items.map(item => item.id))"
  />
</template>`,
  'animated-color-picker': `<script setup lang="ts">
type ColorSource = 'hue' | 'saturation' | 'value' | 'alpha' | 'spectrum' | 'text' | 'swatch' | 'reset'

const color = ref<string>('#7C5CFCE8')

function saveColor(value: string, source: ColorSource) {
  console.log('Saved color', value, source)
}
</script>

<template>
  <AnimatedColorPicker
    v-model="color"
    alpha
    :swatches="['#FF6B6BE8', '#42D392E8', '#7C5CFCE8']"
    label="Interface accent"
    @commit="saveColor"
  />
</template>`,
  'animated-image-cropper': `<script setup lang="ts">
interface CropGeometry { x: number; y: number; width: number; height: number }

const crop = ref<CropGeometry>({ x: 20, y: 15, width: 60, height: 60 })
const zoom = ref<number>(1.1)
const rotation = ref<number>(0)
</script>

<template>
  <AnimatedImageCropper
    v-model="crop"
    v-model:zoom="zoom"
    v-model:rotation="rotation"
    src="/images/profile-cover.jpg"
    alt="Mountain landscape"
    :aspect-ratio="1"
    shape="circle"
    @crop-end="value => console.log('Crop ready', value)"
  />
</template>`,
  'animated-checkbox-group': `<script setup lang="ts">
const selected = ref(['design'])
const options = [
  { value: 'design', label: 'Design systems', description: 'Tokens, patterns, and documentation.' },
  { value: 'engineering', label: 'Engineering', description: 'Architecture and implementation.' },
  { value: 'research', label: 'Research', description: 'Signals and customer insight.', badge: 'New' },
]
</script>

<template>
  <AnimatedCheckboxGroup
    v-model="selected"
    :options="options"
    label="Choose your interests"
    orientation="horizontal"
    :columns="3"
    :max-selected="2"
    required
    @limit="option => console.log('Limit reached for', option.label)"
  />
</template>`,
  'animated-progress-bar': `<script setup lang="ts">
const progress = ref(68)
const progressBar = ref<{ replay: () => void; reset: () => void } | null>(null)
</script>

<template>
  <AnimatedProgressBar
    ref="progressBar"
    :value="progress"
    label="Release progress"
    color="#b9e63b"
    striped
    @complete="console.log('Release complete')"
  />
  <button type="button" @click="progressBar?.replay()">Replay</button>
</template>`,
  'animated-bottom-navigation': `<script setup lang="ts">
const current = ref('home')
const items = [
  { value: 'home', label: 'Home' },
  { value: 'trips', label: 'Trips' },
  { value: 'alerts', label: 'Alerts', badge: 3 },
  { value: 'profile', label: 'Profile' },
]
</script>

<template>
  <AnimatedBottomNavigation
    v-model="current"
    :items="items"
    label="Travel app navigation"
    @change="(next, previous) => console.log(previous, next)"
  />
</template>`,
  'animated-bar-chart': `<script setup lang="ts">
const selected = ref<string | null>('q3')
const quarters = [
  { id: 'q1', label: 'Q1', value: 128, color: '#9db69f' },
  { id: 'q2', label: 'Q2', value: 176, color: '#d4a96a' },
  { id: 'q3', label: 'Q3', value: 224, color: '#e96b4a' },
]
</script>

<template>
  <AnimatedBarChart v-model="selected" :items="quarters" :max-value="260" aria-label="Quarterly reach" />
</template>`,
  'auto-resize-textarea': `<script setup lang="ts">
const comment = ref('')
</script>

<template>
  <AutoResizeTextarea
    v-model="comment"
    label="Editorial comment"
    :min-rows="3"
    :max-rows="8"
    :max-length="420"
    show-count
    clearable
  />
</template>`,
  'flip-card': `<script setup lang="ts">
const flipped = ref(false)
</script>

<template>
  <FlipCard v-model="flipped" axis="y" :duration="600">
    <template #front><article>Member pass</article></template>
    <template #back><article>Travel details</article></template>
  </FlipCard>
</template>`,
  'animated-avatar-group': `<script setup lang="ts">
const selected = ref<string | null>('maya')
const members = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', status: 'online' },
  { id: 'theo', name: 'Theo Martin', initials: 'TM', status: 'away' },
  { id: 'imani', name: 'Imani Brooks', initials: 'IB', status: 'busy' },
]
</script>

<template>
  <AnimatedAvatarGroup v-model="selected" :items="members" :max-visible="3" expandable />
</template>`,
  'expandable-search': `<script setup lang="ts">
const query = ref('')
const open = ref(false)
</script>

<template>
  <ExpandableSearch v-model="query" v-model:open="open" label="Search projects" @search="console.log" />
</template>`,
  'animated-notification-badge': `<template>
  <AnimatedNotificationBadge
    :count="7"
    :max="99"
    color="#ef4444"
    aria-label="Open notifications"
    @animate="detail => console.log(detail.direction)"
  />
</template>`,
  'animated-tag-input': `<script setup lang="ts">
const tags = ref(['Vue 3', 'TypeScript'])
</script>

<template>
  <AnimatedTagInput v-model="tags" label="Project skills" :max-tags="8" @add="tag => console.log(tag)" />
</template>`,
  'ripple-button': `<template>
  <RippleButton color="rgba(217,255,87,.45)" @ripple="detail => console.log(detail.source)">
    Reserve launch bundle
  </RippleButton>
</template>`,
  'animated-radio-group': `<script setup lang="ts">
const plan = ref('studio')
const options = [
  { value: 'solo', label: 'Solo', description: 'One seat and three projects.' },
  { value: 'studio', label: 'Studio', description: 'Eight seats and unlimited projects.', badge: 'Popular' },
  { value: 'company', label: 'Company', description: 'Unlimited seats and support.' },
]
</script>

<template>
  <AnimatedRadioGroup v-model="plan" :options="options" label="Select a plan" orientation="horizontal" :columns="3" />
</template>`,
  'scratch-card': `<script setup lang="ts">
const revealed = ref(false)
</script>

<template>
  <ScratchCard v-model="revealed" cover-text="Scratch to reveal" :reveal-threshold="0.5">
    <article class="min-h-80 p-8">Your reward is 30% off.</article>
  </ScratchCard>
</template>`,
  'animated-text-highlight': `<template>
  <AnimatedTextHighlight
    text="Attention makes ideas unforgettable."
    as="strong"
    color="#dfff4f"
    trigger="view"
    :duration="850"
    :thickness="0.58"
  />
</template>`,
  'meteor-shower': `<template>
  <MeteorShower :count="24" color="#d9f3ff" :speed="4.8" :angle="18">
    <section class="min-h-96 p-8 text-white">Observe the night sky.</section>
  </MeteorShower>
</template>`,
  'animated-pagination': `<script setup lang="ts">
const page = ref(4)
</script>

<template>
  <AnimatedPagination
    v-model="page"
    :page-count="18"
    :sibling-count="1"
    @change="(next, previous) => console.log(previous, next)"
  />
</template>`,
  'range-slider': `<script setup lang="ts">
const budget = ref<[number, number]>([250000, 700000])
</script>

<template>
  <RangeSlider
    v-model="budget"
    :min="100000"
    :max="1000000"
    :step="25000"
    :min-gap="100000"
    label="Purchase budget"
    :format-value="value => '$' + value.toLocaleString()"
  />
</template>`,
  'copy-button': `<template>
  <CopyButton
    text="npm install motion-kit"
    label="Copy command"
    copied-label="Command copied"
    @copied="text => console.log(text)"
  />
</template>`,
  'animated-donut-chart': `<script setup lang="ts">
const selected = ref<string | null>('organic')
const segments = [
  { id: 'organic', label: 'Organic', value: 48, color: '#d9ff57' },
  { id: 'direct', label: 'Direct', value: 31, color: '#8b82ff' },
  { id: 'social', label: 'Social', value: 21, color: '#47c8ff' },
]
</script>

<template>
  <AnimatedDonutChart v-model="selected" :segments="segments">
    <template #default="{ total }">{{ total }} visits</template>
  </AnimatedDonutChart>
</template>`,
  'animated-stepper': `<script setup lang="ts">
const current = ref(1)
const steps = [
  { id: 'details', label: 'Details', description: 'Add release context.' },
  { id: 'review', label: 'Review', description: 'Confirm every change.' },
  { id: 'publish', label: 'Publish', description: 'Ship the release.' },
]
</script>

<template>
  <AnimatedStepper v-model="current" :steps="steps" linear @change="(next, previous) => console.log(previous, next)" />
</template>`,
  'floating-label-input': `<script setup lang="ts">
const email = ref('')
</script>

<template>
  <FloatingLabelInput
    v-model="email"
    label="Work email"
    type="email"
    autocomplete="email"
    description="Used only for release notes."
    clearable
    required
  />
</template>`,
  'animated-radar-chart': `<script setup lang="ts">
const selected = ref<string | null>('current')
const axes = [
  { id: 'speed', label: 'Speed', max: 100 },
  { id: 'quality', label: 'Quality', max: 100 },
  { id: 'reach', label: 'Reach', max: 100 },
]
const series = [
  { id: 'current', label: 'Current', values: [88, 94, 76], color: '#d9ff57' },
  { id: 'baseline', label: 'Baseline', values: [72, 81, 84], color: '#8b82ff' },
]
</script>

<template>
  <AnimatedRadarChart v-model="selected" :axes="axes" :series="series" />
</template>`,
  'cursor-trail': `<template>
  <CursorTrail color="#d9ff57" :count="24" :duration="700">
    <section class="min-h-96 p-8">
      Move across this surface to follow the signal.
    </section>
  </CursorTrail>
</template>`,
  'liquid-toggle': `<script setup lang="ts">
const motionEnabled = ref(true)
</script>

<template>
  <LiquidToggle
    v-model="motionEnabled"
    label="Enable ambient motion"
    :duration="420"
    @change="value => console.log(value)"
  />
</template>`,
  'direction-aware-card': `<template>
  <DirectionAwareCard label="Open project" @activate="console.log('Open')">
    <article class="p-8">
      <h2>Studio North</h2>
      <p>Move through any edge to reveal the overlay.</p>
    </article>
    <template #overlay="{ direction }">Entered from {{ direction }}</template>
  </DirectionAwareCard>
</template>`,
  'connection-beam': `<script setup lang="ts">
const selected = ref('router')
const nodes = [
  { id: 'input', x: 14, y: 28, label: 'Input' },
  { id: 'router', x: 48, y: 52, label: 'Router' },
  { id: 'edge', x: 82, y: 76, label: 'Edge' },
]
const connections = [
  { from: 'input', to: 'router' },
  { from: 'router', to: 'edge' },
]
</script>

<template>
  <ConnectionBeam v-model="selected" :nodes="nodes" :connections="connections" />
</template>`,
  'split-text-reveal': `<template>
  <SplitTextReveal
    text="Motion, with meaning."
    as="h2"
    direction="up"
    trigger="click"
    :duration="560"
    :stagger="34"
  />
</template>`,
  'animated-filter-grid': `<script setup lang="ts">
const selected = ref<string | null>('atlas')
const category = ref('all')
const items = [
  { id: 'atlas', title: 'Atlas chair', category: 'Seating', meta: '$480' },
  { id: 'relay', title: 'Relay desk', category: 'Tables', meta: '$920' },
  { id: 'halo', title: 'Halo pendant', category: 'Lighting', meta: '$195' },
]
</script>

<template>
  <AnimatedFilterGrid
    v-model="selected"
    :items="items"
    :filter="category"
    sort="title-asc"
    @select="item => console.log(item)"
  />
</template>`,
  'swipe-drawer': `<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <SwipeDrawer
    v-model="open"
    placement="bottom"
    title="Account settings"
    description="Manage your profile and notifications."
  >
    <template #trigger>Open settings</template>
    <template #default="{ close }">
      <form class="p-6" @submit.prevent="close">
        <input aria-label="Display name">
        <button type="submit">Save</button>
      </form>
    </template>
  </SwipeDrawer>
</template>`,
  'animated-rating': `<script setup lang="ts">
const rating = ref(4)
</script>

<template>
  <AnimatedRating
    v-model="rating"
    label="Overall experience"
    clearable
    @change="(value, previous) => console.log(previous, value)"
  />
</template>`,
  'interactive-dot-field': `<template>
  <InteractiveDotField
    color="#a3e635"
    :intensity="0.8"
    @pulse="detail => console.log(detail.count)"
  >
    <template #default="{ pulseCount }">
      <div class="grid min-h-80 place-items-center">
        <p>Signals sent: {{ pulseCount }}</p>
      </div>
    </template>
  </InteractiveDotField>
</template>`,
  'animated-breadcrumb': `<script setup lang="ts">
const items = ref([
  { id: 'home', label: 'Home', href: '/' },
  { id: 'projects', label: 'Projects', href: '/projects' },
  { id: 'northstar', label: 'Northstar' },
])
</script>

<template>
  <AnimatedBreadcrumb
    :items="items"
    :max-items="4"
    @select="item => console.log(item)"
  />
</template>`,
  'pull-to-refresh': `<script setup lang="ts">
const refreshing = ref(false)
const messages = ref(['Ready'])

async function refresh() {
  await new Promise(resolve => setTimeout(resolve, 800))
  messages.value.unshift('New message')
}
</script>

<template>
  <PullToRefresh
    v-model:refreshing="refreshing"
    class="h-96"
    :on-refresh="refresh"
    @complete="console.log('Updated')"
  >
    <article v-for="message in messages" :key="message">{{ message }}</article>
  </PullToRefresh>
</template>`,
  'animated-calendar-heatmap': `<script setup lang="ts">
const selected = ref<string | null>(null)
const days = [
  { date: '2026-09-17', value: 4, label: 'Release day' },
  { date: '2026-09-18', value: 7 },
  { date: '2026-09-19', value: 2 },
]
</script>

<template>
  <AnimatedCalendarHeatmap
    v-model="selected"
    :days="days"
    :weeks="8"
    @select="day => console.log(day)"
  />
</template>`,
  'scroll-progress-nav': `<script setup lang="ts">
const active = ref('overview')
const items = [
  { id: 'overview', label: 'Overview' },
  { id: 'details', label: 'Details' },
  { id: 'notes', label: 'Notes' },
]
</script>

<template>
  <ScrollProgressNav v-model="active" :items="items" :height="420">
    <section id="overview" data-scroll-section>Overview</section>
    <section id="details" data-scroll-section>Details</section>
    <section id="notes" data-scroll-section>Notes</section>
  </ScrollProgressNav>
</template>`,
  'guided-tour': `<script setup lang="ts">
const open = ref(false)
const steps = [
  { id: 'search', title: 'Search', description: 'Find anything.', target: '#tour-search' },
  { id: 'filters', title: 'Filters', description: 'Narrow results.', target: '#tour-filters' },
]
</script>

<template>
  <div data-guided-tour-root>
    <input id="tour-search" aria-label="Search">
    <button id="tour-filters">Filters</button>
    <GuidedTour v-model="open" :steps="steps">
      <template #trigger>Take a tour</template>
    </GuidedTour>
  </div>
</template>`,
  'validated-form': `<script setup lang="ts">
import { toTypedSchema } from '@vee-validate/zod'
import { useForm } from 'vee-validate'
import { z } from 'zod'

const schema = toTypedSchema(z.object({
  email: z.string().email('Enter a valid email.'),
}))
const { handleSubmit } = useForm({ validationSchema: schema })
const submit = handleSubmit(values => console.log(values))
</script>

<template>
  <form @submit="submit">
    <FormField v-slot="{ componentField, id, invalid }" name="email" label="Email" required>
      <Input v-bind="componentField" :id="id" type="email" :aria-invalid="invalid" />
    </FormField>
    <Button type="submit">Subscribe</Button>
  </form>
</template>`,
  'data-table': `<script setup lang="ts">
import type { ColumnDef } from '@tanstack/vue-table'

interface Person { name: string; role: string }
const data: Person[] = [
  { name: 'Ada Lovelace', role: 'Engineer' },
  { name: 'Grace Hopper', role: 'Admiral' },
]
const columns: ColumnDef<Person>[] = [
  { accessorKey: 'name', header: 'Name' },
  { accessorKey: 'role', header: 'Role' },
]
</script>

<template>
  <DataTable :columns="columns" :data="data" searchable-key="name" :page-size="5" />
</template>`,
  'mask-reveal': `<template>
  <MaskReveal direction="left" :duration="700" @complete="console.log('Revealed')">
    <article>Viewport-revealed content</article>
  </MaskReveal>
</template>`,
  'flip-countdown': `<template>
  <FlipCountdown
    :duration="60"
    auto-start
    :show-hours="false"
    label="Launch countdown"
    @tick="seconds => console.log(seconds)"
    @complete="console.log('Finished')"
  />
</template>`,
  'typewriter-text': `<template>
  <TypewriterText
    :words="['Design clearly.', 'Build deliberately.']"
    :pause-duration="1000"
    @word-change="(_index, word) => console.log(word)"
  />
</template>`,
  'animated-sparkline': `<template>
  <AnimatedSparkline
    :values="[12, 18, 15, 27, 34]"
    :labels="['Mon', 'Tue', 'Wed', 'Thu', 'Fri']"
    label="Weekly revenue"
    :format-value="value => '$' + value + 'k'"
    @point-change="(index, value) => console.log(index, value)"
  />
</template>`,
  'gradient-text': `<template>
  <GradientText
    :colors="['#8b5cf6', '#38bdf8', '#d9ff57']"
    direction="diagonal"
    :duration="4000"
  >
    Color in motion
  </GradientText>
</template>`,
  'waveform-player': `<template>
  <WaveformPlayer
    :duration="42"
    :bar-count="32"
    label="Episode preview"
    @play="console.log('Playing')"
    @timeupdate="time => console.log(time)"
    @ended="console.log('Ended')"
  />
</template>`,
  'elastic-slider': `<script setup lang="ts">
const volume = ref(40)
</script>

<template>
  <ElasticSlider
    v-model="volume"
    label="Volume"
    :min="0"
    :max="100"
    :format-value="value => value + '%'"
    @change="value => console.log(value)"
  />
</template>`,
  'floating-tooltip': `<template>
  <FloatingTooltip placement="top" @open="console.log('Opened')">
    <button type="button">Focus or hover me</button>
    <template #content>Keyboard shortcut: Ctrl + K</template>
  </FloatingTooltip>
</template>`,
  'spring-checkbox': `<script setup lang="ts">
const accepted = ref(false)
</script>

<template>
  <SpringCheckbox v-model="accepted" name="terms" @change="value => console.log(value)">
    Accept the terms
  </SpringCheckbox>
</template>`,
  'morphing-dialog': `<template>
  <MorphingDialog label="Open profile" initial-focus="#profile-name">
    <template #trigger>Edit profile</template>
    <template #default="{ close }">
      <h2>Edit profile</h2>
      <input id="profile-name" aria-label="Name">
      <button type="button" @click="close">Close</button>
    </template>
  </MorphingDialog>
</template>`,
  'burst-button': `<template>
  <BurstButton
    :particle-count="16"
    :distance="80"
    @burst="console.log('Burst')"
    @complete="console.log('Complete')"
  >
    Celebrate
  </BurstButton>
</template>`,
  'animated-timeline': `<script setup lang="ts">
const active = ref<string | null>('brief')
const items = [
  { id: 'brief', title: 'Brief', description: 'Define the scope.' },
  { id: 'design', title: 'Design', description: 'Explore solutions.' },
  { id: 'ship', title: 'Ship', description: 'Release the work.' },
]
</script>

<template>
  <AnimatedTimeline v-model="active" :items="items" :interval="3000" />
</template>`,
  'shimmer-skeleton': `<script setup lang="ts">
const loading = ref(true)
</script>

<template>
  <ShimmerSkeleton :loading="loading" :lines="3" avatar>
    <article>Profile content</article>
  </ShimmerSkeleton>
  <button type="button" @click="loading = !loading">Toggle loading</button>
</template>`,
  'radial-progress': `<script setup lang="ts">
const progress = ref(68)
</script>

<template>
  <RadialProgress v-model="progress" label="Upload progress">
    <template #default="{ percent }">{{ Math.round(percent) }}% uploaded</template>
  </RadialProgress>
</template>`,
  'text-loop': `<script setup lang="ts">
const index = ref(0)
</script>

<template>
  <TextLoop
    v-model="index"
    :items="['clear', 'focused', 'human']"
    direction="up"
    @change="(value, nextIndex, source) => console.log(value, nextIndex, source)"
  />
</template>`,
  'border-beam': `<template>
  <BorderBeam as="section" :beam-count="3" :radius="20" aria-label="Featured plan">
    <template #default="{ paused }">
      <h2>Pro plan</h2>
      <p>{{ paused ? 'Animation paused' : 'Animated border' }}</p>
    </template>
  </BorderBeam>
</template>`,
  'animated-disclosure': `<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <AnimatedDisclosure v-model="open" title="Shipping details" lazy>
    <p>Orders ship within two business days.</p>
  </AnimatedDisclosure>
</template>`,
  'scroll-reveal': `<template>
  <ScrollReveal as="section" variant="fade-up" :delay="150" @reveal="console.log('Visible')">
    <template #default="{ revealed }">
      <p>Revealed: {{ revealed }}</p>
    </template>
  </ScrollReveal>
</template>`,
  'stacked-carousel': `<script setup lang="ts">
const active = ref(0)
const items = [
  { id: 'one', eyebrow: '01', title: 'Discover', description: 'Find a direction.' },
  { id: 'two', eyebrow: '02', title: 'Refine', description: 'Shape the details.' },
]
</script>

<template>
  <StackedCarousel v-model="active" :items="items" :autoplay-delay="4000">
    <template #item="{ item }">
      <article><h2>{{ item.title }}</h2><p>{{ item.description }}</p></article>
    </template>
  </StackedCarousel>
</template>`,
  'orbiting-actions': `<script setup lang="ts">
const selected = ref<string | null>(null)
const items = [
  { id: 'share', label: 'Share', symbol: 'S' },
  { id: 'save', label: 'Save', symbol: '+' },
  { id: 'delete', label: 'Delete', symbol: 'X' },
]
</script>

<template>
  <OrbitingActions v-model="selected" :items="items" @select="item => console.log(item)">
    <strong>{{ selected || 'Choose' }}</strong>
  </OrbitingActions>
</template>`,
  'context-menu': `<script setup lang="ts">
const open = ref(false)
const items = [
  { id: 'open', label: 'Open', shortcut: 'Enter' },
  { id: 'duplicate', label: 'Duplicate' },
  { id: 'delete', label: 'Delete', destructive: true, separator: true },
]
</script>

<template>
  <ContextMenu v-model="open" :items="items" @select="item => console.log(item)">
    <article>Right-click, long press, or press Shift+F10</article>
  </ContextMenu>
</template>`,
  'reaction-picker': `<script setup lang="ts">
const reaction = ref('')
const open = ref(false)
const items = [
  { value: 'like', label: 'Like', symbol: 'Like' },
  { value: 'love', label: 'Love', symbol: 'Love' },
]
</script>

<template>
  <ReactionPicker v-model="reaction" v-model:open="open" :items="items" @select="item => console.log(item)" />
</template>`,
  'number-stepper': `<script setup lang="ts">
const seats = ref(2)
</script>

<template>
  <NumberStepper v-model="seats" label="Seats" :min="1" :max="8" suffix=" seats" />
</template>`,
  'reorder-list': `<script setup lang="ts">
const tasks = ref([
  { id: 'research', label: 'Research' },
  { id: 'design', label: 'Design' },
  { id: 'build', label: 'Build' },
])
</script>

<template>
  <ReorderList v-model="tasks" label="Project tasks">
    <template #item="{ item, index }">{{ index + 1 }}. {{ item.label }}</template>
  </ReorderList>
</template>`,
  'action-menu': `<script setup lang="ts">
const open = ref(false)
const items = [
  { id: 'edit', label: 'Edit', shortcut: 'E' },
  { id: 'archive', label: 'Archive', disabled: true },
  { id: 'delete', label: 'Delete', destructive: true },
]
</script>

<template>
  <ActionMenu v-model="open" :items="items" align="end" @select="item => console.log(item)">
    <template #trigger>Project actions</template>
  </ActionMenu>
</template>`,
  'inline-edit': `<script setup lang="ts">
const title = ref('Quarterly report')
const validate = (value: string) => value.length >= 3 || 'Use at least three characters.'
</script>

<template>
  <InlineEdit v-model="title" label="Report title" :validate="validate" @save="console.log" />
</template>`,
  'hold-to-confirm': `<template>
  <HoldToConfirm
    tone="danger"
    :duration="1200"
    label="Hold to delete"
    holding-label="Keep holding"
    complete-label="Deleted"
    @complete="console.log('Confirmed')"
  />
</template>`,
  'swipe-actions': `<script setup lang="ts">
const open = ref(false)
</script>

<template>
  <SwipeActions v-model="open" label="Message actions">
    <article>Swipe this message left</article>
    <template #actions>
      <button type="button">Archive</button>
      <button type="button">Delete</button>
    </template>
  </SwipeActions>
</template>`,
  'password-strength': `<script setup lang="ts">
const password = ref('')
</script>

<template>
  <PasswordStrength
    v-model="password"
    name="accountPassword"
    label="Password"
    required
    validate-on="input"
    @validated="(valid, error) => console.log(valid, error)"
  />
</template>`,
  'otp-input': `<script setup lang="ts">
const code = ref('')
</script>

<template>
  <OtpInput v-model="code" :length="6" mode="numeric" label="Verification code" @complete="console.log" />
</template>`,
  'file-dropzone': `<script setup lang="ts">
const files = ref<File[]>([])
</script>

<template>
  <FileDropzone
    v-model="files"
    accept="image/*,.pdf"
    :max-files="3"
    :max-size="5242880"
    @reject="rejections => console.log(rejections)"
  />
</template>`,
  'infinite-marquee': `<template>
  <InfiniteMarquee direction="left" :duration="18" :gap="32" label="Partners">
    <span>Acme</span>
    <span>Northstar</span>
    <span>Orbit</span>
  </InfiniteMarquee>
</template>`,
  'command-menu': `<script setup lang="ts">
const open = ref(false)
const items = [
  { id: 'new', label: 'New document', group: 'File', shortcut: 'N' },
  { id: 'search', label: 'Search workspace', keywords: ['find'] },
]
</script>

<template>
  <button type="button" @click="open = true">Open commands</button>
  <CommandMenu v-model="open" :items="items" @select="item => console.log(item)" />
</template>`,
  'loading-morph': `<script setup lang="ts">
const state = ref<'idle' | 'loading' | 'success' | 'error'>('idle')
function run() {
  state.value = 'loading'
  setTimeout(() => { state.value = 'success' }, 800)
}
</script>

<template>
  <LoadingMorph v-model="state" :reset-after="1500" @press="run" />
</template>`,
  'toast-stack': `<script setup lang="ts">
const toasts = ref([
  { id: 'saved', title: 'Changes saved', description: 'Your draft is up to date.', tone: 'success' as const, duration: 0 },
])
</script>

<template>
  <ToastStack v-model="toasts" position="bottom-right" @dismiss="item => console.log(item)" />
</template>`,
  'comparison-slider': `<script setup lang="ts">
const position = ref(50)
</script>

<template>
  <ComparisonSlider v-model="position" before-label="Original" after-label="Edited">
    <template #before><div class="h-full bg-slate-700 text-white">Original</div></template>
    <template #after><div class="h-full bg-violet-600 text-white">Edited</div></template>
  </ComparisonSlider>
</template>`,
  'animated-list': `<script setup lang="ts">
const activities = [
  { id: 'one', title: 'Deployment finished', meta: 'Now', symbol: '1' },
  { id: 'two', title: 'Review approved', meta: '2m', symbol: '2' },
  { id: 'three', title: 'Build started', meta: '5m', symbol: '3' },
]
</script>

<template>
  <AnimatedList :items="activities" :interval="1200" @select="item => console.log(item)" />
</template>`,
  'number-ticker': `<template>
  <NumberTicker :value="12840" :from="12000" :duration="1400" prefix="$" suffix=" revenue" />
</template>`,
  'aurora-background': `<template>
  <AuroraBackground :colors="['#34d399', '#818cf8', '#e879f9']" :intensity="0.7">
    <section><h1>Build in the light</h1><p>Atmospheric hero content.</p></section>
  </AuroraBackground>
</template>`,
  'floating-dock': `<script setup lang="ts">
const selected = ref('home')
const items = [
  { value: 'home', label: 'Home', symbol: 'H' },
  { value: 'search', label: 'Search', symbol: 'S' },
  { value: 'settings', label: 'Settings', symbol: 'G' },
]
</script>

<template>
  <FloatingDock v-model="selected" :items="items" @select="item => console.log(item)">
    <template #icon="{ item }">{{ item.symbol }}</template>
  </FloatingDock>
</template>`,
  'tilt-card': `<template>
  <TiltCard :max-tilt="12" :perspective="1000" :glare-opacity="0.2">
    <article><h2>Interactive card</h2><p>Move the pointer across the surface.</p></article>
  </TiltCard>
</template>`,
  'animated-tabs': `<script setup lang="ts">
const selected = ref('overview')
const items = [
  { value: 'overview', label: 'Overview', content: 'Project summary.' },
  { value: 'details', label: 'Details' },
]
</script>

<template>
  <AnimatedTabs v-model="selected" :items="items" label="Project sections">
    <template #details="{ item }"><strong>{{ item.label }}</strong>: custom content.</template>
  </AnimatedTabs>
</template>`,
  'magnetic-button': `<template>
  <MagneticButton label="Get in touch" :strength="28" type="button" @click="console.log('Clicked')">
    Contact us
  </MagneticButton>
</template>`,
  'interactive-hover-button': `<template>
  <InteractiveHoverButton label="Explore components" accent="#d9ff57" @click="console.log('Clicked')" />
</template>`,
  'spotlight-card': `<template>
  <SpotlightCard
    eyebrow="New release"
    title="Built for deliberate interfaces."
    description="A soft spotlight follows the pointer."
    glow="#d9ff57"
  />
</template>`,
  'status-pulse': `<template>
  <StatusPulse label="All systems operational" tone="lime" compact />
</template>`,
  'text-scramble': `<template>
  <TextScramble
    text="Build remarkable interfaces."
    characters="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    trigger="click"
    :duration="800"
  />
</template>`,
}

export function getComponentExample(slug: string) {
  return componentExamples[slug] ?? ''
}
