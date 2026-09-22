<script setup lang="ts">
import { ArrowLeft, Check, Copy, ExternalLink, RotateCcw } from '@lucide/vue'
import MagneticButton from '#registry/default/magnetic-button/MagneticButton.vue'
import { getCategory, getInstallCommand, getRegistryComponent } from '@/data/components'
import { getComponentExample } from '@/data/component-examples'
import { copyText } from '@/utils/clipboard'

const route = useRoute()
const item = computed(() => getRegistryComponent(String(route.params.slug)))

if (!item.value) {
  throw createError({ statusCode: 404, statusMessage: 'Component not found' })
}

const category = computed(() => item.value ? getCategory(item.value.category) : undefined)
const requestOrigin = useRequestURL({ xForwardedHost: true }).origin
const publicSiteUrl = useRuntimeConfig().public.siteUrl.replace(/\/$/, '')
const installCommand = computed(() => getInstallCommand(String(route.params.slug), requestOrigin))
const componentExample = computed(() => getComponentExample(String(route.params.slug)))
const exampleHighlightUrl = computed(() => `/api/highlight/${route.params.slug}`)
const { data: highlightedExample } = await useFetch<{ html: string }>(exampleHighlightUrl)
const copied = ref(false)
const exampleCopied = ref(false)
const activeTab = ref<'preview' | 'anatomy'>('preview')

definePageMeta({ layout: 'docs' })

const editableTableDuration = ref(220)
const editableTableRemovable = ref(true)
const editableTableDisabled = ref(false)
const multiSelectMax = ref(4)
const multiSelectSearchable = ref(true)
const multiSelectClearable = ref(true)
const multiSelectDuration = ref(220)
const multiSelectDisabled = ref(false)
const timePickerMin = ref('16:00')
const timePickerMax = ref('22:30')
const timePickerStep = ref(15)
const timePickerFormat = ref<12 | 24>(12)
const timePickerDuration = ref(240)
const timePickerDisabled = ref(false)
const kanbanDuration = ref(260)
const kanbanDisabled = ref(false)
const comboboxPlaceholder = ref('Search a city or region')
const comboboxClearable = ref(true)
const comboboxAllowCustom = ref(true)
const comboboxDuration = ref(220)
const comboboxDisabled = ref(false)
const treeIndent = ref(22)
const treeDuration = ref(240)
const treeDisabled = ref(false)
const dateMin = ref('2026-09-01')
const dateMax = ref('2026-12-20')
const dateLocale = ref('en-US')
const dateFirstDay = ref(0)
const dateDuration = ref(280)
const dateDisabled = ref(false)
const panelsOrientation = ref<'horizontal' | 'vertical'>('horizontal')
const panelsMin = ref(28)
const panelsMax = ref(76)
const panelsSnapPoints = ref([36, 58, 72])
const panelsCollapsible = ref(true)
const panelsDuration = ref(280)
const panelsDisabled = ref(false)
const transferDuration = ref(280)
const transferDisabled = ref(false)
const colorPickerAlpha = ref(true)
const colorPickerDuration = ref(220)
const colorPickerDisabled = ref(false)
const cropperAspectRatio = ref(4 / 3)
const cropperShape = ref<'rectangle' | 'circle'>('rectangle')
const cropperDuration = ref(260)
const cropperDisabled = ref(false)
const checkboxGroupColumns = ref<1 | 2 | 3>(2)
const checkboxGroupOrientation = ref<'horizontal' | 'vertical'>('horizontal')
const checkboxGroupMaxSelected = ref(3)
const checkboxGroupDuration = ref(320)
const checkboxGroupRequired = ref(true)
const checkboxGroupDisabled = ref(false)
const progressBarDuration = ref(700)
const progressBarColor = ref('#b9e63b')
const progressBarIndeterminate = ref(false)
const progressBarStriped = ref(true)
const progressBarPaused = ref(false)
const progressBarShowValue = ref(true)
const progressBarSize = ref<'small' | 'medium' | 'large'>('medium')
const progressBarStatus = ref<'success' | 'error' | 'default'>('default')
const bottomNavigationDuration = ref(320)
const bottomNavigationHideLabels = ref(false)
const bottomNavigationSafeArea = ref(true)
const bottomNavigationDisabled = ref(false)
const barChartDuration = ref(800)
const barChartHeight = ref(330)
const barChartShowValues = ref(true)
const barChartInteractive = ref(true)
const barChartPaused = ref(false)
const textareaMinRows = ref(3)
const textareaMaxRows = ref(8)
const textareaMaxLength = ref(420)
const textareaDuration = ref(180)
const textareaShowCount = ref(true)
const textareaDisabled = ref(false)
const textareaReadonly = ref(false)
const flipAxis = ref<'x' | 'y'>('y')
const flipDuration = ref(650)
const flipPerspective = ref(1100)
const flipDisabled = ref(false)
const avatarMaxVisible = ref(4)
const avatarSize = ref(52)
const avatarOverlap = ref(14)
const avatarDuration = ref(320)
const avatarExpandable = ref(true)
const avatarDisabled = ref(false)
const searchExpandedWidth = ref(320)
const searchDuration = ref(240)
const searchClearable = ref(true)
const searchShortcut = ref(true)
const searchDisabled = ref(false)
const notificationMax = ref(99)
const notificationShowZero = ref(false)
const notificationPulse = ref(true)
const notificationDuration = ref(420)
const notificationColor = ref('#e84b3c')
const notificationDisabled = ref(false)
const tagMax = ref(8)
const tagDuplicates = ref(false)
const tagDuration = ref(180)
const tagDisabled = ref(false)
const tagReadonly = ref(false)
const rippleColor = ref('#ffffff')
const rippleDuration = ref(620)
const rippleScale = ref(1)
const rippleMax = ref(6)
const rippleDisabled = ref(false)
const rippleLoading = ref(false)
const radioOrientation = ref<'horizontal' | 'vertical'>('horizontal')
const radioColumns = ref<1 | 2 | 3>(3)
const radioDuration = ref(320)
const radioDisabled = ref(false)
const radioRequired = ref(false)
const scratchCoverColor = ref('#b7f34a')
const scratchBrushSize = ref(38)
const scratchThreshold = ref(0.48)
const scratchResettable = ref(true)
const scratchDuration = ref(420)
const scratchDisabled = ref(false)
const highlightColor = ref('#dfff4f')
const highlightDuration = ref(850)
const highlightDelay = ref(120)
const highlightTrigger = ref<'load' | 'hover' | 'click' | 'view'>('load')
const highlightThickness = ref(0.58)
const highlightDisabled = ref(false)
const meteorCount = ref(24)
const meteorColor = ref('#d9f3ff')
const meteorSpeed = ref(4.8)
const meteorAngle = ref(18)
const meteorTrailLength = ref(140)
const meteorPaused = ref(false)
const meteorDisabled = ref(false)
const paginationPageCount = ref(12)
const paginationSiblingCount = ref(1)
const paginationShowEdges = ref(true)
const paginationDuration = ref(280)
const paginationDisabled = ref(false)
const rangeMin = ref(200000)
const rangeMax = ref(1200000)
const rangeStep = ref(25000)
const rangeMinGap = ref(100000)
const rangeShowValues = ref(true)
const rangeDuration = ref(240)
const rangeDisabled = ref(false)
const copyDuration = ref(180)
const copyResetAfter = ref(1800)
const copyIconOnly = ref(false)
const copyDisabled = ref(false)
const donutDuration = ref(900)
const donutStrokeWidth = ref(30)
const donutGap = ref(4)
const donutShowLegend = ref(true)
const donutPaused = ref(false)
const stepperOrientation = ref<'horizontal' | 'vertical'>('horizontal')
const stepperDuration = ref(360)
const stepperLinear = ref(false)
const stepperDisabled = ref(false)
const floatingInputDuration = ref(220)
const floatingInputClearable = ref(true)
const floatingInputState = ref<'default' | 'success' | 'error'>('default')
const floatingInputDisabled = ref(false)
const radarDuration = ref(850)
const radarLevels = ref(5)
const radarShowLabels = ref(true)
const radarShowLegend = ref(true)
const radarPaused = ref(false)
const cursorTrailColor = ref('#d9ff57')
const cursorTrailCount = ref(24)
const cursorTrailSize = ref(10)
const cursorTrailDuration = ref(700)
const cursorTrailShape = ref<'circle' | 'square'>('circle')
const cursorTrailPaused = ref(false)
const cursorTrailDisabled = ref(false)
const liquidDuration = ref(420)
const liquidColor = ref('#d9ff57')
const liquidDisabled = ref(false)
const directionCardDuration = ref(420)
const directionCardColor = ref('#d9ff57')
const directionCardDisabled = ref(false)
const connectionDuration = ref(4)
const connectionBeamWidth = ref(1.8)
const connectionColor = ref('#d9ff57')
const connectionPaused = ref(false)
const connectionDisabled = ref(false)
const splitDirection = ref<'up' | 'down' | 'left' | 'right'>('up')
const splitDuration = ref(560)
const splitStagger = ref(34)
const splitDisabled = ref(false)
const buttonLabel = ref('Explore components')
const hoverButtonDuration = ref(300)
const hoverButtonDisabled = ref(false)
const hoverButtonLoading = ref(false)
const accent = ref('var(--registry-accent, #d9ff57)')
const cardTitle = ref('Built for deliberate interfaces.')
const spotlightRadius = ref(300)
const spotlightIntensity = ref(0.28)
const spotlightDuration = ref(420)
const spotlightInteractive = ref(true)
const spotlightDisabled = ref(false)
const statusLabel = ref('All systems operational')
const statusTone = ref<'lime' | 'blue' | 'orange'>('lime')
const compact = ref(false)
const statusPaused = ref(false)
const statusDuration = ref(1600)
const scrambleText = ref('Build remarkable interfaces.')
const scrambleTrigger = ref<'hover' | 'click' | 'load'>('hover')
const scrambleDuration = ref(800)
const scrambleDisabled = ref(false)
const magneticLabel = ref('Get in touch')
const magneticStrength = ref(24)
const magneticDisabled = ref(false)
const magneticClicks = ref(0)
const tabDisabled = ref(false)
const tiltAmount = ref(10)
const tiltGlare = ref(true)
const tiltDisabled = ref(false)
const dockMagnification = ref(1.35)
const dockDisabled = ref(false)
const auroraDuration = ref(16)
const auroraIntensity = ref(0.6)
const auroraPaused = ref(false)
const auroraColors = ref<[string, string, string]>(['#34d399', '#818cf8', '#e879f9'])
const tickerValue = ref(12840)
const tickerDuration = ref(1200)
const tickerDecimals = ref(0)
const listInterval = ref(1600)
const listMaxVisible = ref(3)
const listPaused = ref(false)
const comparisonPosition = ref(52)
const comparisonDisabled = ref(false)
const toastDuration = ref(4500)
const toastMaxVisible = ref(3)
const toastAutoDismiss = ref(false)
const toastPauseOnHover = ref(true)
const loadingResult = ref<'success' | 'error'>('success')
const loadingDelay = ref(1200)
const loadingResetAfter = ref(0)
const commandPlaceholder = ref('Search pages and actions...')
const commandShortcut = ref(true)
const marqueeDuration = ref(24)
const marqueeDirection = ref<'left' | 'right'>('left')
const marqueeGap = ref(18)
const marqueePauseOnHover = ref(true)
const marqueePaused = ref(false)
const marqueeFade = ref(true)
const dropzoneAccept = ref('*/*')
const dropzoneMaxFiles = ref(3)
const dropzoneMaxSize = ref(5)
const dropzoneDisabled = ref(false)
const otpLength = ref(6)
const otpMode = ref<'numeric' | 'alphanumeric'>('numeric')
const otpDisabled = ref(false)
const otpError = ref(false)
const passwordMinLength = ref(8)
const passwordMixedCase = ref(true)
const passwordNumber = ref(true)
const passwordSymbol = ref(true)
const passwordRequirements = ref(true)
const passwordDisabled = ref(false)
const swipeActionWidth = ref(184)
const swipeThreshold = ref(0.35)
const swipeDisabled = ref(false)
const swipeCloseOnAction = ref(true)
const holdDuration = ref(1200)
const holdResetAfter = ref(1400)
const holdTone = ref<'default' | 'danger'>('default')
const holdDisabled = ref(false)
const inlineEditLabel = ref('Project name')
const inlineEditRequired = ref(true)
const inlineEditSaveOnBlur = ref(true)
const inlineEditDisabled = ref(false)
const actionMenuAlign = ref<'start' | 'end'>('end')
const actionMenuCloseOnSelect = ref(true)
const actionMenuDisabled = ref(false)
const reorderListShowPositions = ref(true)
const reorderListDisabled = ref(false)
const numberStepperMax = ref(12)
const numberStepperAllowInput = ref(true)
const numberStepperDisabled = ref(false)
const reactionPickerColumns = ref(4)
const reactionPickerCloseOnSelect = ref(true)
const reactionPickerDisabled = ref(false)
const contextMenuLongPressDelay = ref(550)
const contextMenuCloseOnSelect = ref(true)
const contextMenuDisabled = ref(false)
const orbitRadius = ref(104)
const orbitDuration = ref(18)
const orbitDirection = ref<'clockwise' | 'counter-clockwise'>('clockwise')
const orbitPaused = ref(false)
const orbitPauseOnHover = ref(true)
const carouselAutoplayDelay = ref(3600)
const carouselLoop = ref(true)
const carouselPaused = ref(false)
const carouselPauseOnHover = ref(true)
const carouselDisabled = ref(false)
const revealVariant = ref<'fade-up' | 'fade-down' | 'fade-left' | 'fade-right' | 'scale' | 'blur'>('fade-up')
const revealDuration = ref(650)
const revealDistance = ref(28)
const revealOnce = ref(true)
const revealDisabled = ref(false)
const disclosureDuration = ref(320)
const disclosureEasing = ref('cubic-bezier(0.22, 1, 0.36, 1)')
const disclosureLazy = ref(false)
const disclosureUnmount = ref(false)
const disclosureDisabled = ref(false)
const beamDuration = ref(8)
const beamSize = ref(18)
const beamCount = ref(2)
const beamReverse = ref(false)
const beamPaused = ref(false)
const beamPauseOnHover = ref(true)
const beamColors = ref(['#d9ff57', '#8b5cf6', '#38bdf8'])
const textLoopInterval = ref(2400)
const textLoopDuration = ref(480)
const textLoopStagger = ref(32)
const textLoopDirection = ref<'up' | 'down'>('up')
const textLoopLoop = ref(true)
const textLoopPaused = ref(false)
const textLoopPauseOnHover = ref(true)
const radialValue = ref(62)
const radialSize = ref(210)
const radialStrokeWidth = ref(9)
const radialDuration = ref(900)
const radialIndeterminate = ref(false)
const radialPaused = ref(false)
const radialColor = ref('#d9ff57')
const shimmerLoading = ref(true)
const shimmerDuration = ref(1600)
const shimmerPaused = ref(false)
const shimmerPauseOnHover = ref(false)
const shimmerLines = ref(3)
const shimmerAvatar = ref(true)
const timelineDuration = ref(520)
const timelineAutoplay = ref(true)
const timelineInterval = ref(2400)
const timelineLoop = ref(true)
const timelinePaused = ref(false)
const timelinePauseOnHover = ref(true)
const burstParticleCount = ref(14)
const burstDistance = ref(72)
const burstDuration = ref(680)
const burstDisabled = ref(false)
const burstAllowOverlap = ref(false)
const burstColors = ref(['#d9ff57', '#8b5cf6', '#38bdf8', '#fb7185'])
const morphDuration = ref(480)
const morphCloseOnBackdrop = ref(true)
const morphLockScroll = ref(true)
const checkboxDuration = ref(420)
const checkboxDisabled = ref(false)
const checkboxIndeterminate = ref(false)
const tooltipPlacement = ref<'top' | 'right' | 'bottom' | 'left'>('top')
const tooltipDelay = ref(180)
const tooltipDuration = ref(220)
const tooltipDisabled = ref(false)
const sliderDuration = ref(360)
const sliderDisabled = ref(false)
const sliderShowValue = ref(true)
const waveformLoop = ref(false)
const waveformRate = ref(1)
const waveformBars = ref(36)
const waveformDisabled = ref(false)
const gradientDuration = ref(5000)
const gradientDirection = ref<'horizontal' | 'vertical' | 'diagonal'>('horizontal')
const gradientReverse = ref(false)
const gradientPaused = ref(false)
const gradientPauseOnHover = ref(true)
const gradientColors = ref(['#a78bfa', '#38bdf8', '#d9ff57', '#fb7185'])
const sparklineDuration = ref(900)
const sparklineShowArea = ref(true)
const sparklineShowPoints = ref(true)
const sparklinePaused = ref(false)
const sparklineColor = ref('#7c3aed')
const typewriterTypeDuration = ref(85)
const typewriterDeleteDuration = ref(45)
const typewriterPauseDuration = ref(1200)
const typewriterLoop = ref(true)
const typewriterPaused = ref(false)
const typewriterCursor = ref('|')
const countdownDuration = ref(12)
const countdownLoop = ref(false)
const countdownPaused = ref(false)
const countdownShowHours = ref(true)
const countdownFlipDuration = ref(520)
const maskDirection = ref<'left' | 'right' | 'up' | 'down' | 'center'>('left')
const maskDuration = ref(900)
const maskOnce = ref(true)
const maskPaused = ref(false)
const filterGridDuration = ref(360)
const filterGridStagger = ref(45)
const filterGridColumns = ref<1 | 2 | 3 | 4>(3)
const filterGridDisabled = ref(false)
const drawerPlacement = ref<'bottom' | 'right'>('bottom')
const drawerDuration = ref(320)
const drawerThreshold = ref(0.3)
const drawerCloseOnBackdrop = ref(true)
const drawerLockScroll = ref(true)
const drawerDisabled = ref(false)
const ratingMax = ref(5)
const ratingDuration = ref(320)
const ratingClearable = ref(true)
const ratingDisabled = ref(false)
const ratingShowValue = ref(true)
const dotRows = ref(13)
const dotColumns = ref(21)
const dotIntensity = ref(0.8)
const dotDuration = ref(1100)
const dotPaused = ref(false)
const dotColor = ref('#a3e635')
const breadcrumbMaxItems = ref(4)
const breadcrumbDuration = ref(260)
const breadcrumbDisabled = ref(false)
const pullThreshold = ref(64)
const pullMax = ref(112)
const pullResistance = ref(0.55)
const pullDuration = ref(280)
const pullDisabled = ref(false)
const heatmapWeeks = ref(20)
const heatmapDuration = ref(700)
const heatmapCellSize = ref(14)
const heatmapGap = ref(4)
const heatmapDisabled = ref(false)
const scrollNavHeight = ref(460)
const scrollNavSmooth = ref(true)
const scrollNavDuration = ref(420)
const scrollNavDisabled = ref(false)
const tourDuration = ref(280)
const tourCloseOnBackdrop = ref(true)
const tourLockScroll = ref(true)
const tourDisabled = ref(false)
const wakeLockAutoReacquire = ref(true)
const wakeLockDuration = ref(280)
const wakeLockDisabled = ref(false)
const scannerState = ref<'scanning' | 'paused' | 'success' | 'error'>('scanning')
const scannerDuration = ref(300)
const scannerAllowTorch = ref(true)
const scannerAllowFlip = ref(true)
const scannerAllowGallery = ref(true)
const scannerDisabled = ref(false)
const scannerManaged = ref(false)
const compassHeading = ref(32)
const compassTargetBearing = ref(118)
const compassAccuracy = ref(6)
const compassArrivalThreshold = ref(8)
const compassDuration = ref(420)
const compassActive = ref(true)
const compassDisabled = ref(false)
const compassSensor = ref(true)
const connectivityState = ref<'online' | 'connecting' | 'offline'>('offline')
const connectivityAutoHide = ref(2400)
const connectivityDuration = ref(240)
const connectivityDismissible = ref(true)
const connectivityDisabled = ref(false)
const voiceRecorderMaxDuration = ref(120)
const voiceRecorderDuration = ref(220)
const voiceRecorderHaptic = ref(false)
const voiceRecorderDisabled = ref(false)
const actionBarDuration = ref(260)
const actionBarSafeArea = ref(true)
const actionBarShowClose = ref(true)
const actionBarLoading = ref(false)
const actionBarDisabled = ref(false)
const slideConfirmThreshold = ref(0.82)
const slideConfirmDuration = ref(260)
const slideConfirmResetAfter = ref(0)
const slideConfirmTone = ref<'dark' | 'success' | 'danger'>('success')
const slideConfirmHaptic = ref(false)
const slideConfirmLoading = ref(false)
const slideConfirmDisabled = ref(false)
const keypadMode = ref<'numeric' | 'decimal' | 'pin'>('decimal')
const keypadMaxLength = ref(8)
const keypadMasked = ref(false)
const keypadShowSubmit = ref(true)
const keypadAutoSubmit = ref(false)
const keypadHaptic = ref(false)
const keypadDuration = ref(140)
const keypadDisabled = ref(false)
const onboardingDuration = ref(320)
const onboardingSwipeThreshold = ref(72)
const onboardingSwipe = ref(true)
const onboardingShowSkip = ref(true)
const onboardingShowBack = ref(true)
const onboardingShowProgress = ref(true)
const onboardingSafeArea = ref(true)
const onboardingDisabled = ref(false)
const mobileFilterDuration = ref(220)
const mobileFilterMultiple = ref(true)
const mobileFilterShowAll = ref(true)
const mobileFilterAllowEmpty = ref(true)
const mobileFilterDisabled = ref(false)
const miniPlayerDuration = ref(260)
const miniPlayerSafeArea = ref(true)
const miniPlayerShowClose = ref(true)
const miniPlayerDisabled = ref(false)
const selectionToolbarDuration = ref(260)
const selectionToolbarClearable = ref(true)
const selectionToolbarSafeArea = ref(true)
const selectionToolbarDisabled = ref(false)
const composerMaxLength = ref(280)
const composerMaxRows = ref(5)
const composerDuration = ref(220)
const composerSubmitOnEnter = ref(true)
const composerAllowAttachment = ref(true)
const composerSafeArea = ref(true)
const composerDisabled = ref(false)
const composerLoading = ref(false)
const snackbarTone = ref<'default' | 'success' | 'warning' | 'error'>('success')
const snackbarTimeout = ref(5000)
const snackbarDuration = ref(260)
const snackbarSwipeThreshold = ref(84)
const snackbarCloseOnAction = ref(true)
const snackbarSafeArea = ref(true)
const snackbarDisabled = ref(false)
const segmentedDuration = ref(260)
const segmentedFullWidth = ref(true)
const segmentedDisabled = ref(false)
const actionSheetDuration = ref(280)
const actionSheetCloseOnBackdrop = ref(true)
const actionSheetCloseOnSelect = ref(true)
const actionSheetLockScroll = ref(true)
const actionSheetSafeArea = ref(true)
const actionSheetDisabled = ref(false)
const navigationMenuDuration = ref(280)
const navigationMenuDisabled = ref(false)
const alertBannerTone = ref<'info' | 'success' | 'warning' | 'error'>('info')
const alertBannerDuration = ref(320)
const alertBannerDismissible = ref(true)
const alertBannerExpandable = ref(true)
const alertBannerDisabled = ref(false)
const lightboxDuration = ref(320)
const lightboxLoop = ref(true)
const lightboxZoomable = ref(true)
const lightboxCloseOnBackdrop = ref(true)
const lightboxLockScroll = ref(true)
const lightboxSafeArea = ref(true)
const lightboxDisabled = ref(false)
const mobileHeaderMode = ref<'hide' | 'compact'>('hide')
const mobileHeaderDuration = ref(260)
const mobileHeaderCollapseAt = ref(32)
const mobileHeaderShowProgress = ref(true)
const mobileHeaderSafeArea = ref(true)
const mobileHeaderDisabled = ref(false)
const bottomSheetSnapPoints = ref<number[]>([0.42, 0.72, 0.94])
const bottomSheetDuration = ref(300)
const bottomSheetCloseOnBackdrop = ref(true)
const bottomSheetLockScroll = ref(true)
const bottomSheetDisabled = ref(false)
const fabMenuDirection = ref<'up' | 'left'>('up')
const fabMenuDuration = ref(220)
const fabMenuCloseOnSelect = ref(true)
const fabMenuDisabled = ref(false)

async function copyCommand() {
  try {
    await copyText(installCommand.value)
    copied.value = true
    window.setTimeout(() => (copied.value = false), 1600)
  }
  catch {
    copied.value = false
  }
}

async function copyExample() {
  try {
    await copyText(componentExample.value)
    exampleCopied.value = true
    window.setTimeout(() => (exampleCopied.value = false), 1600)
  }
  catch {
    exampleCopied.value = false
  }
}

function resetControls() {
  wakeLockAutoReacquire.value = true
  wakeLockDuration.value = 280
  wakeLockDisabled.value = false
  scannerState.value = 'scanning'
  scannerDuration.value = 300
  scannerAllowTorch.value = true
  scannerAllowFlip.value = true
  scannerAllowGallery.value = true
  scannerDisabled.value = false
  scannerManaged.value = false
  compassHeading.value = 32
  compassTargetBearing.value = 118
  compassAccuracy.value = 6
  compassArrivalThreshold.value = 8
  compassDuration.value = 420
  compassActive.value = true
  compassDisabled.value = false
  compassSensor.value = true
  connectivityState.value = 'offline'
  connectivityAutoHide.value = 2400
  connectivityDuration.value = 240
  connectivityDismissible.value = true
  connectivityDisabled.value = false
  voiceRecorderMaxDuration.value = 120
  voiceRecorderDuration.value = 220
  voiceRecorderHaptic.value = false
  voiceRecorderDisabled.value = false
  actionBarDuration.value = 260
  actionBarSafeArea.value = true
  actionBarShowClose.value = true
  actionBarLoading.value = false
  actionBarDisabled.value = false
  slideConfirmThreshold.value = 0.82
  slideConfirmDuration.value = 260
  slideConfirmResetAfter.value = 0
  slideConfirmTone.value = 'success'
  slideConfirmHaptic.value = false
  slideConfirmLoading.value = false
  slideConfirmDisabled.value = false
  keypadMode.value = 'decimal'
  keypadMaxLength.value = 8
  keypadMasked.value = false
  keypadShowSubmit.value = true
  keypadAutoSubmit.value = false
  keypadHaptic.value = false
  keypadDuration.value = 140
  keypadDisabled.value = false
  onboardingDuration.value = 320
  onboardingSwipeThreshold.value = 72
  onboardingSwipe.value = true
  onboardingShowSkip.value = true
  onboardingShowBack.value = true
  onboardingShowProgress.value = true
  onboardingSafeArea.value = true
  onboardingDisabled.value = false
  mobileFilterDuration.value = 220
  mobileFilterMultiple.value = true
  mobileFilterShowAll.value = true
  mobileFilterAllowEmpty.value = true
  mobileFilterDisabled.value = false
  miniPlayerDuration.value = 260
  miniPlayerSafeArea.value = true
  miniPlayerShowClose.value = true
  miniPlayerDisabled.value = false
  selectionToolbarDuration.value = 260
  selectionToolbarClearable.value = true
  selectionToolbarSafeArea.value = true
  selectionToolbarDisabled.value = false
  composerMaxLength.value = 280
  composerMaxRows.value = 5
  composerDuration.value = 220
  composerSubmitOnEnter.value = true
  composerAllowAttachment.value = true
  composerSafeArea.value = true
  composerDisabled.value = false
  composerLoading.value = false
  snackbarTone.value = 'success'
  snackbarTimeout.value = 5000
  snackbarDuration.value = 260
  snackbarSwipeThreshold.value = 84
  snackbarCloseOnAction.value = true
  snackbarSafeArea.value = true
  snackbarDisabled.value = false
  segmentedDuration.value = 260
  segmentedFullWidth.value = true
  segmentedDisabled.value = false
  actionSheetDuration.value = 280
  actionSheetCloseOnBackdrop.value = true
  actionSheetCloseOnSelect.value = true
  actionSheetLockScroll.value = true
  actionSheetSafeArea.value = true
  actionSheetDisabled.value = false
  navigationMenuDuration.value = 280
  navigationMenuDisabled.value = false
  alertBannerTone.value = 'info'
  alertBannerDuration.value = 320
  alertBannerDismissible.value = true
  alertBannerExpandable.value = true
  alertBannerDisabled.value = false
  lightboxDuration.value = 320
  lightboxLoop.value = true
  lightboxZoomable.value = true
  lightboxCloseOnBackdrop.value = true
  lightboxLockScroll.value = true
  lightboxSafeArea.value = true
  lightboxDisabled.value = false
  mobileHeaderMode.value = 'hide'
  mobileHeaderDuration.value = 260
  mobileHeaderCollapseAt.value = 32
  mobileHeaderShowProgress.value = true
  mobileHeaderSafeArea.value = true
  mobileHeaderDisabled.value = false
  bottomSheetSnapPoints.value = [0.42, 0.72, 0.94]
  bottomSheetDuration.value = 300
  bottomSheetCloseOnBackdrop.value = true
  bottomSheetLockScroll.value = true
  bottomSheetDisabled.value = false
  fabMenuDirection.value = 'up'
  fabMenuDuration.value = 220
  fabMenuCloseOnSelect.value = true
  fabMenuDisabled.value = false
  editableTableDuration.value = 220
  editableTableRemovable.value = true
  editableTableDisabled.value = false
  multiSelectMax.value = 4
  multiSelectSearchable.value = true
  multiSelectClearable.value = true
  multiSelectDuration.value = 220
  multiSelectDisabled.value = false
  timePickerMin.value = '16:00'
  timePickerMax.value = '22:30'
  timePickerStep.value = 15
  timePickerFormat.value = 12
  timePickerDuration.value = 240
  timePickerDisabled.value = false
  kanbanDuration.value = 260
  kanbanDisabled.value = false
  comboboxPlaceholder.value = 'Search a city or region'
  comboboxClearable.value = true
  comboboxAllowCustom.value = true
  comboboxDuration.value = 220
  comboboxDisabled.value = false
  treeIndent.value = 22
  treeDuration.value = 240
  treeDisabled.value = false
  dateMin.value = '2026-09-01'
  dateMax.value = '2026-12-20'
  dateLocale.value = 'en-US'
  dateFirstDay.value = 0
  dateDuration.value = 280
  dateDisabled.value = false
  panelsOrientation.value = 'horizontal'
  panelsMin.value = 28
  panelsMax.value = 76
  panelsSnapPoints.value = [36, 58, 72]
  panelsCollapsible.value = true
  panelsDuration.value = 280
  panelsDisabled.value = false
  transferDuration.value = 280
  transferDisabled.value = false
  colorPickerAlpha.value = true
  colorPickerDuration.value = 220
  colorPickerDisabled.value = false
  cropperAspectRatio.value = 4 / 3
  cropperShape.value = 'rectangle'
  cropperDuration.value = 260
  cropperDisabled.value = false
  checkboxGroupColumns.value = 2
  checkboxGroupOrientation.value = 'horizontal'
  checkboxGroupMaxSelected.value = 3
  checkboxGroupDuration.value = 320
  checkboxGroupRequired.value = true
  checkboxGroupDisabled.value = false
  progressBarDuration.value = 700
  progressBarColor.value = '#b9e63b'
  progressBarIndeterminate.value = false
  progressBarStriped.value = true
  progressBarPaused.value = false
  progressBarShowValue.value = true
  progressBarSize.value = 'medium'
  progressBarStatus.value = 'default'
  bottomNavigationDuration.value = 320
  bottomNavigationHideLabels.value = false
  bottomNavigationSafeArea.value = true
  bottomNavigationDisabled.value = false
  barChartDuration.value = 800
  barChartHeight.value = 330
  barChartShowValues.value = true
  barChartInteractive.value = true
  barChartPaused.value = false
  textareaMinRows.value = 3
  textareaMaxRows.value = 8
  textareaMaxLength.value = 420
  textareaDuration.value = 180
  textareaShowCount.value = true
  textareaDisabled.value = false
  textareaReadonly.value = false
  flipAxis.value = 'y'
  flipDuration.value = 650
  flipPerspective.value = 1100
  flipDisabled.value = false
  avatarMaxVisible.value = 4
  avatarSize.value = 52
  avatarOverlap.value = 14
  avatarDuration.value = 320
  avatarExpandable.value = true
  avatarDisabled.value = false
  searchExpandedWidth.value = 320
  searchDuration.value = 240
  searchClearable.value = true
  searchShortcut.value = true
  searchDisabled.value = false
  notificationMax.value = 99
  notificationShowZero.value = false
  notificationPulse.value = true
  notificationDuration.value = 420
  notificationColor.value = '#e84b3c'
  notificationDisabled.value = false
  tagMax.value = 8
  tagDuplicates.value = false
  tagDuration.value = 180
  tagDisabled.value = false
  tagReadonly.value = false
  rippleColor.value = '#ffffff'
  rippleDuration.value = 620
  rippleScale.value = 1
  rippleMax.value = 6
  rippleDisabled.value = false
  rippleLoading.value = false
  radioOrientation.value = 'horizontal'
  radioColumns.value = 3
  radioDuration.value = 320
  radioDisabled.value = false
  radioRequired.value = false
  scratchCoverColor.value = '#b7f34a'
  scratchBrushSize.value = 38
  scratchThreshold.value = 0.48
  scratchResettable.value = true
  scratchDuration.value = 420
  scratchDisabled.value = false
  highlightColor.value = '#dfff4f'
  highlightDuration.value = 850
  highlightDelay.value = 120
  highlightTrigger.value = 'load'
  highlightThickness.value = 0.58
  highlightDisabled.value = false
  meteorCount.value = 24
  meteorColor.value = '#d9f3ff'
  meteorSpeed.value = 4.8
  meteorAngle.value = 18
  meteorTrailLength.value = 140
  meteorPaused.value = false
  meteorDisabled.value = false
  paginationPageCount.value = 12
  paginationSiblingCount.value = 1
  paginationShowEdges.value = true
  paginationDuration.value = 280
  paginationDisabled.value = false
  rangeMin.value = 200000
  rangeMax.value = 1200000
  rangeStep.value = 25000
  rangeMinGap.value = 100000
  rangeShowValues.value = true
  rangeDuration.value = 240
  rangeDisabled.value = false
  copyDuration.value = 180
  copyResetAfter.value = 1800
  copyIconOnly.value = false
  copyDisabled.value = false
  donutDuration.value = 900
  donutStrokeWidth.value = 30
  donutGap.value = 4
  donutShowLegend.value = true
  donutPaused.value = false
  stepperOrientation.value = 'horizontal'
  stepperDuration.value = 360
  stepperLinear.value = false
  stepperDisabled.value = false
  floatingInputDuration.value = 220
  floatingInputClearable.value = true
  floatingInputState.value = 'default'
  floatingInputDisabled.value = false
  radarDuration.value = 850
  radarLevels.value = 5
  radarShowLabels.value = true
  radarShowLegend.value = true
  radarPaused.value = false
  cursorTrailColor.value = '#d9ff57'
  cursorTrailCount.value = 24
  cursorTrailSize.value = 10
  cursorTrailDuration.value = 700
  cursorTrailShape.value = 'circle'
  cursorTrailPaused.value = false
  cursorTrailDisabled.value = false
  liquidDuration.value = 420
  liquidColor.value = '#d9ff57'
  liquidDisabled.value = false
  directionCardDuration.value = 420
  directionCardColor.value = '#d9ff57'
  directionCardDisabled.value = false
  connectionDuration.value = 4
  connectionBeamWidth.value = 1.8
  connectionColor.value = '#d9ff57'
  connectionPaused.value = false
  connectionDisabled.value = false
  splitDirection.value = 'up'
  splitDuration.value = 560
  splitStagger.value = 34
  splitDisabled.value = false
  filterGridDuration.value = 360
  filterGridStagger.value = 45
  filterGridColumns.value = 3
  filterGridDisabled.value = false
  drawerPlacement.value = 'bottom'
  drawerDuration.value = 320
  drawerThreshold.value = 0.3
  drawerCloseOnBackdrop.value = true
  drawerLockScroll.value = true
  drawerDisabled.value = false
  ratingMax.value = 5
  ratingDuration.value = 320
  ratingClearable.value = true
  ratingDisabled.value = false
  ratingShowValue.value = true
  dotRows.value = 13
  dotColumns.value = 21
  dotIntensity.value = 0.8
  dotDuration.value = 1100
  dotPaused.value = false
  dotColor.value = '#a3e635'
  breadcrumbMaxItems.value = 4
  breadcrumbDuration.value = 260
  breadcrumbDisabled.value = false
  pullThreshold.value = 64
  pullMax.value = 112
  pullResistance.value = 0.55
  pullDuration.value = 280
  pullDisabled.value = false
  heatmapWeeks.value = 20
  heatmapDuration.value = 700
  heatmapCellSize.value = 14
  heatmapGap.value = 4
  heatmapDisabled.value = false
  scrollNavHeight.value = 460
  scrollNavSmooth.value = true
  scrollNavDuration.value = 420
  scrollNavDisabled.value = false
  tourDuration.value = 280
  tourCloseOnBackdrop.value = true
  tourLockScroll.value = true
  tourDisabled.value = false
  maskDirection.value = 'left'
  maskDuration.value = 900
  maskOnce.value = true
  maskPaused.value = false
  countdownDuration.value = 12
  countdownLoop.value = false
  countdownPaused.value = false
  countdownShowHours.value = true
  countdownFlipDuration.value = 520
  typewriterTypeDuration.value = 85
  typewriterDeleteDuration.value = 45
  typewriterPauseDuration.value = 1200
  typewriterLoop.value = true
  typewriterPaused.value = false
  typewriterCursor.value = '|'
  sparklineDuration.value = 900
  sparklineShowArea.value = true
  sparklineShowPoints.value = true
  sparklinePaused.value = false
  sparklineColor.value = '#7c3aed'
  gradientDuration.value = 5000
  gradientDirection.value = 'horizontal'
  gradientReverse.value = false
  gradientPaused.value = false
  gradientPauseOnHover.value = true
  gradientColors.value = ['#a78bfa', '#38bdf8', '#d9ff57', '#fb7185']
  waveformLoop.value = false
  waveformRate.value = 1
  waveformBars.value = 36
  waveformDisabled.value = false
  sliderDuration.value = 360
  sliderDisabled.value = false
  sliderShowValue.value = true
  tooltipPlacement.value = 'top'
  tooltipDelay.value = 180
  tooltipDuration.value = 220
  tooltipDisabled.value = false
  checkboxDuration.value = 420
  checkboxDisabled.value = false
  checkboxIndeterminate.value = false
  morphDuration.value = 480
  morphCloseOnBackdrop.value = true
  morphLockScroll.value = true
  burstParticleCount.value = 14
  burstDistance.value = 72
  burstDuration.value = 680
  burstDisabled.value = false
  burstAllowOverlap.value = false
  burstColors.value = ['#d9ff57', '#8b5cf6', '#38bdf8', '#fb7185']
  timelineDuration.value = 520
  timelineAutoplay.value = true
  timelineInterval.value = 2400
  timelineLoop.value = true
  timelinePaused.value = false
  timelinePauseOnHover.value = true
  shimmerLoading.value = true
  shimmerDuration.value = 1600
  shimmerPaused.value = false
  shimmerPauseOnHover.value = false
  shimmerLines.value = 3
  shimmerAvatar.value = true
  radialValue.value = 62
  radialSize.value = 210
  radialStrokeWidth.value = 9
  radialDuration.value = 900
  radialIndeterminate.value = false
  radialPaused.value = false
  radialColor.value = '#d9ff57'
  textLoopInterval.value = 2400
  textLoopDuration.value = 480
  textLoopStagger.value = 32
  textLoopDirection.value = 'up'
  textLoopLoop.value = true
  textLoopPaused.value = false
  textLoopPauseOnHover.value = true
  beamDuration.value = 8
  beamSize.value = 18
  beamCount.value = 2
  beamReverse.value = false
  beamPaused.value = false
  beamPauseOnHover.value = true
  beamColors.value = ['#d9ff57', '#8b5cf6', '#38bdf8']
  disclosureDuration.value = 320
  disclosureEasing.value = 'cubic-bezier(0.22, 1, 0.36, 1)'
  disclosureLazy.value = false
  disclosureUnmount.value = false
  disclosureDisabled.value = false
  revealVariant.value = 'fade-up'
  revealDuration.value = 650
  revealDistance.value = 28
  revealOnce.value = true
  revealDisabled.value = false
  carouselAutoplayDelay.value = 3600
  carouselLoop.value = true
  carouselPaused.value = false
  carouselPauseOnHover.value = true
  carouselDisabled.value = false
  orbitRadius.value = 104
  orbitDuration.value = 18
  orbitDirection.value = 'clockwise'
  orbitPaused.value = false
  orbitPauseOnHover.value = true
  contextMenuLongPressDelay.value = 550
  contextMenuCloseOnSelect.value = true
  contextMenuDisabled.value = false
  reactionPickerColumns.value = 4
  reactionPickerCloseOnSelect.value = true
  reactionPickerDisabled.value = false
  numberStepperMax.value = 12
  numberStepperAllowInput.value = true
  numberStepperDisabled.value = false
  reorderListShowPositions.value = true
  reorderListDisabled.value = false
  actionMenuAlign.value = 'end'
  actionMenuCloseOnSelect.value = true
  actionMenuDisabled.value = false
  inlineEditLabel.value = 'Project name'
  inlineEditRequired.value = true
  inlineEditSaveOnBlur.value = true
  inlineEditDisabled.value = false
  holdDuration.value = 1200
  holdResetAfter.value = 1400
  holdTone.value = 'default'
  holdDisabled.value = false
  swipeActionWidth.value = 184
  swipeThreshold.value = 0.35
  swipeDisabled.value = false
  swipeCloseOnAction.value = true
  passwordMinLength.value = 8
  passwordMixedCase.value = true
  passwordNumber.value = true
  passwordSymbol.value = true
  passwordRequirements.value = true
  passwordDisabled.value = false
  otpLength.value = 6
  otpMode.value = 'numeric'
  otpDisabled.value = false
  otpError.value = false
  dropzoneAccept.value = '*/*'
  dropzoneMaxFiles.value = 3
  dropzoneMaxSize.value = 5
  dropzoneDisabled.value = false
  marqueeDuration.value = 24
  marqueeDirection.value = 'left'
  marqueeGap.value = 18
  marqueePauseOnHover.value = true
  marqueePaused.value = false
  marqueeFade.value = true
  commandPlaceholder.value = 'Search pages and actions...'
  commandShortcut.value = true
  loadingResult.value = 'success'
  loadingDelay.value = 1200
  loadingResetAfter.value = 0
  toastDuration.value = 4500
  toastMaxVisible.value = 3
  toastAutoDismiss.value = false
  toastPauseOnHover.value = true
  comparisonPosition.value = 52
  comparisonDisabled.value = false
  listInterval.value = 1600
  listMaxVisible.value = 3
  listPaused.value = false
  tickerValue.value = 12840
  tickerDuration.value = 1200
  tickerDecimals.value = 0
  auroraDuration.value = 16
  auroraIntensity.value = 0.6
  auroraPaused.value = false
  auroraColors.value = ['#34d399', '#818cf8', '#e879f9']
  dockMagnification.value = 1.35
  dockDisabled.value = false
  tiltAmount.value = 10
  tiltGlare.value = true
  tiltDisabled.value = false
  tabDisabled.value = false
  magneticLabel.value = 'Get in touch'
  magneticStrength.value = 24
  magneticDisabled.value = false
  magneticClicks.value = 0
  buttonLabel.value = 'Explore components'
  hoverButtonDuration.value = 300
  hoverButtonDisabled.value = false
  hoverButtonLoading.value = false
  accent.value = 'var(--registry-accent, #d9ff57)'
  cardTitle.value = 'Built for deliberate interfaces.'
  spotlightRadius.value = 300
  spotlightIntensity.value = 0.28
  spotlightDuration.value = 420
  spotlightInteractive.value = true
  spotlightDisabled.value = false
  statusLabel.value = 'All systems operational'
  statusTone.value = 'lime'
  compact.value = false
  statusPaused.value = false
  statusDuration.value = 1600
  scrambleText.value = 'Build remarkable interfaces.'
  scrambleTrigger.value = 'hover'
  scrambleDuration.value = 800
  scrambleDisabled.value = false
}

useSeoMeta({
  title: () => `${item.value?.name ?? 'Component'} · 71159176 UI`,
  description: () => item.value?.description,
  ogTitle: () => `${item.value?.name ?? 'Component'} · 71159176 UI`,
  ogDescription: () => item.value?.description,
  twitterTitle: () => `${item.value?.name ?? 'Component'} · 71159176 UI`,
  twitterDescription: () => item.value?.description,
})

useHead(() => ({
  script: item.value ? [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'TechArticle',
      headline: item.value.name,
      description: item.value.description,
      dateModified: item.value.updated.replaceAll('.', '-'),
      url: `${publicSiteUrl}/components/${item.value.slug}`,
      programmingLanguage: ['Vue', 'TypeScript'],
      isPartOf: {
        '@type': 'WebSite',
        name: '71159176 UI Registry',
        url: publicSiteUrl,
      },
    }),
  }] : [],
}))
</script>

<template>
  <div v-if="item" class="mx-auto max-w-[1280px] px-5 py-10 sm:px-8 lg:px-10 lg:py-14">
    <NuxtLink to="/components" class="mb-10 inline-flex items-center gap-2 text-xs font-medium text-black/45 transition-colors hover:text-black">
      <ArrowLeft class="size-3.5" />
      All components
    </NuxtLink>

    <div class="grid gap-12 border-b border-black/10 pb-12 lg:grid-cols-[1fr_0.75fr] lg:items-end">
      <div>
        <div class="mb-5 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40">
          <span>{{ category?.number }} / {{ category?.name }}</span>
          <span class="h-px w-8 bg-black/15" />
          <span class="text-brand-strong">{{ item.status }}</span>
        </div>
        <h1 class="max-w-4xl text-5xl font-semibold leading-[0.95] tracking-[-0.06em] sm:text-7xl">{{ item.name }}</h1>
      </div>
      <div class="lg:justify-self-end">
        <p class="max-w-lg text-sm leading-7 text-black/50">{{ item.description }}</p>
        <div class="mt-5 flex flex-wrap gap-2">
          <span v-for="tag in item.tags" :key="tag" class="rounded-full border border-black/10 bg-white/45 px-2.5 py-1 text-[10px] font-medium text-black/45">#{{ tag }}</span>
        </div>
      </div>
    </div>

    <div class="grid gap-5 py-8 xl:grid-cols-[1fr_300px]">
      <section class="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/50">
        <div class="flex h-13 items-center justify-between border-b border-black/10 px-4 sm:px-5">
          <div class="flex items-center gap-1 rounded-full bg-black/[0.045] p-1">
            <button class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors" :class="activeTab === 'preview' ? 'bg-white text-black shadow-sm' : 'text-black/40'" @click="activeTab = 'preview'">Preview</button>
            <button class="rounded-full px-3 py-1.5 text-xs font-medium transition-colors" :class="activeTab === 'anatomy' ? 'bg-white text-black shadow-sm' : 'text-black/40'" @click="activeTab = 'anatomy'">Anatomy</button>
          </div>
          <span class="font-mono text-[10px] uppercase tracking-[0.12em] text-black/30">Responsive canvas</span>
        </div>

        <div v-if="activeTab === 'preview'" class="grid min-h-[500px] place-items-center overflow-hidden bg-canvas p-7 transition-colors duration-300 sm:min-h-[600px] sm:p-12 motion-reduce:transition-none">
            <LazyPreviewsAnimatedMobileWakeLockPreview v-if="item.slug === 'animated-mobile-wake-lock'" :auto-reacquire="wakeLockAutoReacquire" :duration="wakeLockDuration" :disabled="wakeLockDisabled" />
            <LazyPreviewsAnimatedMobileScannerPreview v-else-if="item.slug === 'animated-mobile-scanner'" :state="scannerState" :duration="scannerDuration" :allow-torch="scannerAllowTorch" :allow-flip="scannerAllowFlip" :allow-gallery="scannerAllowGallery" :disabled="scannerDisabled" :managed="scannerManaged" />
            <LazyPreviewsAnimatedMobileCompassPreview v-else-if="item.slug === 'animated-mobile-compass'" :heading="compassHeading" :target-bearing="compassTargetBearing" :accuracy="compassAccuracy" :arrival-threshold="compassArrivalThreshold" :duration="compassDuration" :active="compassActive" :disabled="compassDisabled" :sensor="compassSensor" />
            <LazyPreviewsAnimatedMobileConnectivityBarPreview v-else-if="item.slug === 'animated-mobile-connectivity-bar'" :state="connectivityState" :auto-hide="connectivityAutoHide" :duration="connectivityDuration" :dismissible="connectivityDismissible" :disabled="connectivityDisabled" />
            <LazyPreviewsAnimatedMobileVoiceRecorderPreview v-else-if="item.slug === 'animated-mobile-voice-recorder'" :max-duration="voiceRecorderMaxDuration" :duration="voiceRecorderDuration" :haptic="voiceRecorderHaptic" :disabled="voiceRecorderDisabled" />
            <LazyPreviewsAnimatedMobileActionBarPreview v-else-if="item.slug === 'animated-mobile-action-bar'" :duration="actionBarDuration" :safe-area="actionBarSafeArea" :show-close="actionBarShowClose" :loading="actionBarLoading" :disabled="actionBarDisabled" />
            <LazyPreviewsAnimatedSlideToConfirmPreview v-else-if="item.slug === 'animated-slide-to-confirm'" :threshold="slideConfirmThreshold" :duration="slideConfirmDuration" :reset-after="slideConfirmResetAfter" :tone="slideConfirmTone" :haptic="slideConfirmHaptic" :loading="slideConfirmLoading" :disabled="slideConfirmDisabled" />
            <LazyPreviewsAnimatedMobileNumericKeypadPreview v-else-if="item.slug === 'animated-mobile-numeric-keypad'" :mode="keypadMode" :max-length="keypadMaxLength" :masked="keypadMasked" :show-submit="keypadShowSubmit" :auto-submit="keypadAutoSubmit" :haptic="keypadHaptic" :duration="keypadDuration" :disabled="keypadDisabled" />
            <LazyPreviewsAnimatedMobileOnboardingPagerPreview v-else-if="item.slug === 'animated-mobile-onboarding-pager'" :duration="onboardingDuration" :swipe-threshold="onboardingSwipeThreshold" :swipe="onboardingSwipe" :show-skip="onboardingShowSkip" :show-back="onboardingShowBack" :show-progress="onboardingShowProgress" :safe-area="onboardingSafeArea" :disabled="onboardingDisabled" />
            <LazyPreviewsAnimatedMobileFilterBarPreview v-else-if="item.slug === 'animated-mobile-filter-bar'" :duration="mobileFilterDuration" :multiple="mobileFilterMultiple" :show-all="mobileFilterShowAll" :allow-empty="mobileFilterAllowEmpty" :disabled="mobileFilterDisabled" />
            <LazyPreviewsAnimatedMobileMiniPlayerPreview v-else-if="item.slug === 'animated-mobile-mini-player'" :duration="miniPlayerDuration" :safe-area="miniPlayerSafeArea" :show-close="miniPlayerShowClose" :disabled="miniPlayerDisabled" />
            <LazyPreviewsAnimatedSelectionToolbarPreview v-else-if="item.slug === 'animated-selection-toolbar'" :duration="selectionToolbarDuration" :clearable="selectionToolbarClearable" :safe-area="selectionToolbarSafeArea" :disabled="selectionToolbarDisabled" />
            <LazyPreviewsAnimatedMobileComposerPreview v-else-if="item.slug === 'animated-mobile-composer'" :max-length="composerMaxLength" :max-rows="composerMaxRows" :duration="composerDuration" :submit-on-enter="composerSubmitOnEnter" :allow-attachment="composerAllowAttachment" :safe-area="composerSafeArea" :disabled="composerDisabled" :loading="composerLoading" />
            <LazyPreviewsAnimatedSwipeSnackbarPreview v-else-if="item.slug === 'animated-swipe-snackbar'" :tone="snackbarTone" :timeout="snackbarTimeout" :duration="snackbarDuration" :swipe-threshold="snackbarSwipeThreshold" :close-on-action="snackbarCloseOnAction" :safe-area="snackbarSafeArea" :disabled="snackbarDisabled" />
            <LazyPreviewsAnimatedSegmentedControlPreview v-else-if="item.slug === 'animated-segmented-control'" :duration="segmentedDuration" :full-width="segmentedFullWidth" :disabled="segmentedDisabled" />
            <LazyPreviewsAnimatedActionSheetPreview v-else-if="item.slug === 'animated-action-sheet'" :duration="actionSheetDuration" :close-on-backdrop="actionSheetCloseOnBackdrop" :close-on-select="actionSheetCloseOnSelect" :lock-scroll="actionSheetLockScroll" :safe-area="actionSheetSafeArea" :disabled="actionSheetDisabled" />
            <LazyPreviewsAnimatedNavigationMenuPreview v-else-if="item.slug === 'animated-navigation-menu'" :duration="navigationMenuDuration" :disabled="navigationMenuDisabled" />
            <LazyPreviewsAnimatedAlertBannerPreview v-else-if="item.slug === 'animated-alert-banner'" :tone="alertBannerTone" :duration="alertBannerDuration" :dismissible="alertBannerDismissible" :expandable="alertBannerExpandable" :disabled="alertBannerDisabled" />
            <LazyPreviewsAnimatedLightboxGalleryPreview v-else-if="item.slug === 'animated-lightbox-gallery'" :duration="lightboxDuration" :loop="lightboxLoop" :zoomable="lightboxZoomable" :close-on-backdrop="lightboxCloseOnBackdrop" :lock-scroll="lightboxLockScroll" :safe-area="lightboxSafeArea" :disabled="lightboxDisabled" />
            <LazyPreviewsAnimatedMobileHeaderPreview v-else-if="item.slug === 'animated-mobile-header'" :mode="mobileHeaderMode" :duration="mobileHeaderDuration" :collapse-at="mobileHeaderCollapseAt" :show-progress="mobileHeaderShowProgress" :safe-area="mobileHeaderSafeArea" :disabled="mobileHeaderDisabled" />
            <LazyPreviewsAnimatedBottomSheetPreview v-else-if="item.slug === 'animated-bottom-sheet'" :snap-points="bottomSheetSnapPoints" :duration="bottomSheetDuration" :close-on-backdrop="bottomSheetCloseOnBackdrop" :lock-scroll="bottomSheetLockScroll" :disabled="bottomSheetDisabled" />
            <LazyPreviewsAnimatedFabMenuPreview v-else-if="item.slug === 'animated-fab-menu'" :direction="fabMenuDirection" :duration="fabMenuDuration" :close-on-select="fabMenuCloseOnSelect" :disabled="fabMenuDisabled" />
            <LazyPreviewsAnimatedEditableTablePreview v-else-if="item.slug === 'animated-editable-table'" :duration="editableTableDuration" :removable="editableTableRemovable" :disabled="editableTableDisabled" />
            <LazyPreviewsAnimatedMultiSelectPreview v-else-if="item.slug === 'animated-multi-select'" :max-selected="multiSelectMax" :searchable="multiSelectSearchable" :clearable="multiSelectClearable" :duration="multiSelectDuration" :disabled="multiSelectDisabled" />
            <LazyPreviewsAnimatedTimePickerPreview v-else-if="item.slug === 'animated-time-picker'" :min="timePickerMin" :max="timePickerMax" :step-minutes="timePickerStep" :format="timePickerFormat" :duration="timePickerDuration" :disabled="timePickerDisabled" />
            <LazyPreviewsAnimatedKanbanBoardPreview v-else-if="item.slug === 'animated-kanban-board'" :duration="kanbanDuration" :disabled="kanbanDisabled" />
            <LazyPreviewsAnimatedComboboxPreview v-else-if="item.slug === 'animated-combobox'" :placeholder="comboboxPlaceholder" :clearable="comboboxClearable" :allow-custom="comboboxAllowCustom" :duration="comboboxDuration" :disabled="comboboxDisabled" />
            <LazyPreviewsAnimatedTreeViewPreview v-else-if="item.slug === 'animated-tree-view'" :indent="treeIndent" :duration="treeDuration" :disabled="treeDisabled" />
            <LazyPreviewsAnimatedDatePickerPreview v-else-if="item.slug === 'animated-date-picker'" :min="dateMin" :max="dateMax" :locale="dateLocale" :first-day-of-week="dateFirstDay" :duration="dateDuration" :disabled="dateDisabled" />
            <LazyPreviewsAnimatedResizablePanelsPreview v-else-if="item.slug === 'animated-resizable-panels'" :orientation="panelsOrientation" :min="panelsMin" :max="panelsMax" :snap-points="panelsSnapPoints" :collapsible="panelsCollapsible" :duration="panelsDuration" :disabled="panelsDisabled" />
            <LazyPreviewsAnimatedTransferListPreview v-else-if="item.slug === 'animated-transfer-list'" :duration="transferDuration" :disabled="transferDisabled" />
            <LazyPreviewsAnimatedColorPickerPreview v-else-if="item.slug === 'animated-color-picker'" :alpha="colorPickerAlpha" :duration="colorPickerDuration" :disabled="colorPickerDisabled" />
            <LazyPreviewsAnimatedImageCropperPreview v-else-if="item.slug === 'animated-image-cropper'" :aspect-ratio="cropperAspectRatio" :shape="cropperShape" :duration="cropperDuration" :disabled="cropperDisabled" />
            <LazyPreviewsAnimatedCheckboxGroupPreview v-else-if="item.slug === 'animated-checkbox-group'" :columns="checkboxGroupColumns" :orientation="checkboxGroupOrientation" :max-selected="checkboxGroupMaxSelected" :duration="checkboxGroupDuration" :required="checkboxGroupRequired" :disabled="checkboxGroupDisabled" />
            <LazyPreviewsAnimatedProgressBarPreview v-else-if="item.slug === 'animated-progress-bar'" :duration="progressBarDuration" :color="progressBarColor" :indeterminate="progressBarIndeterminate" :striped="progressBarStriped" :paused="progressBarPaused" :show-value="progressBarShowValue" :size="progressBarSize" :status="progressBarStatus" />
            <LazyPreviewsAnimatedBottomNavigationPreview v-else-if="item.slug === 'animated-bottom-navigation'" :duration="bottomNavigationDuration" :hide-labels="bottomNavigationHideLabels" :safe-area="bottomNavigationSafeArea" :disabled="bottomNavigationDisabled" />
            <LazyPreviewsAnimatedBarChartPreview v-else-if="item.slug === 'animated-bar-chart'" :duration="barChartDuration" :height="barChartHeight" :show-values="barChartShowValues" :interactive="barChartInteractive" :paused="barChartPaused" />
            <LazyPreviewsAutoResizeTextareaPreview v-else-if="item.slug === 'auto-resize-textarea'" :min-rows="textareaMinRows" :max-rows="textareaMaxRows" :max-length="textareaMaxLength" :duration="textareaDuration" :show-count="textareaShowCount" :disabled="textareaDisabled" :readonly="textareaReadonly" />
            <LazyPreviewsFlipCardPreview v-else-if="item.slug === 'flip-card'" :axis="flipAxis" :duration="flipDuration" :perspective="flipPerspective" :disabled="flipDisabled" />
            <LazyPreviewsAnimatedAvatarGroupPreview v-else-if="item.slug === 'animated-avatar-group'" :max-visible="avatarMaxVisible" :size="avatarSize" :overlap="avatarOverlap" :duration="avatarDuration" :expandable="avatarExpandable" :disabled="avatarDisabled" />
            <LazyPreviewsExpandableSearchPreview v-else-if="item.slug === 'expandable-search'" :expanded-width="searchExpandedWidth" :duration="searchDuration" :clearable="searchClearable" :shortcut="searchShortcut" :disabled="searchDisabled" />
            <LazyPreviewsAnimatedNotificationBadgePreview v-else-if="item.slug === 'animated-notification-badge'" :max="notificationMax" :show-zero="notificationShowZero" :pulse="notificationPulse" :duration="notificationDuration" :color="notificationColor" :disabled="notificationDisabled" />
            <LazyPreviewsAnimatedTagInputPreview v-else-if="item.slug === 'animated-tag-input'" :max-tags="tagMax" :allow-duplicates="tagDuplicates" :duration="tagDuration" :disabled="tagDisabled" :readonly="tagReadonly" />
            <LazyPreviewsRippleButtonPreview v-else-if="item.slug === 'ripple-button'" :color="rippleColor" :duration="rippleDuration" :scale="rippleScale" :max-ripples="rippleMax" :disabled="rippleDisabled" :loading="rippleLoading" />
            <LazyPreviewsAnimatedRadioGroupPreview v-else-if="item.slug === 'animated-radio-group'" :orientation="radioOrientation" :columns="radioColumns" :duration="radioDuration" :disabled="radioDisabled" :required="radioRequired" />
            <LazyPreviewsScratchCardPreview v-else-if="item.slug === 'scratch-card'" :cover-color="scratchCoverColor" :brush-size="scratchBrushSize" :reveal-threshold="scratchThreshold" :resettable="scratchResettable" :duration="scratchDuration" :disabled="scratchDisabled" />
            <LazyPreviewsAnimatedTextHighlightPreview v-else-if="item.slug === 'animated-text-highlight'" :color="highlightColor" :duration="highlightDuration" :delay="highlightDelay" :trigger="highlightTrigger" :thickness="highlightThickness" :disabled="highlightDisabled" />
            <LazyPreviewsMeteorShowerPreview v-else-if="item.slug === 'meteor-shower'" :count="meteorCount" :color="meteorColor" :speed="meteorSpeed" :angle="meteorAngle" :trail-length="meteorTrailLength" :paused="meteorPaused" :disabled="meteorDisabled" />
            <LazyPreviewsAnimatedPaginationPreview v-else-if="item.slug === 'animated-pagination'" :page-count="paginationPageCount" :sibling-count="paginationSiblingCount" :show-edges="paginationShowEdges" :duration="paginationDuration" :disabled="paginationDisabled" />
            <LazyPreviewsRangeSliderPreview v-else-if="item.slug === 'range-slider'" :min="rangeMin" :max="rangeMax" :step="rangeStep" :min-gap="rangeMinGap" :show-values="rangeShowValues" :duration="rangeDuration" :disabled="rangeDisabled" />
            <LazyPreviewsCopyButtonPreview v-else-if="item.slug === 'copy-button'" :duration="copyDuration" :reset-after="copyResetAfter" :icon-only="copyIconOnly" :disabled="copyDisabled" />
            <LazyPreviewsAnimatedDonutChartPreview v-else-if="item.slug === 'animated-donut-chart'" :duration="donutDuration" :stroke-width="donutStrokeWidth" :gap="donutGap" :show-legend="donutShowLegend" :paused="donutPaused" />
            <LazyPreviewsAnimatedStepperPreview v-else-if="item.slug === 'animated-stepper'" :orientation="stepperOrientation" :duration="stepperDuration" :linear="stepperLinear" :disabled="stepperDisabled" />
            <LazyPreviewsFloatingLabelInputPreview v-else-if="item.slug === 'floating-label-input'" :duration="floatingInputDuration" :clearable="floatingInputClearable" :state="floatingInputState" :disabled="floatingInputDisabled" />
            <LazyPreviewsAnimatedRadarChartPreview v-else-if="item.slug === 'animated-radar-chart'" :duration="radarDuration" :levels="radarLevels" :show-labels="radarShowLabels" :show-legend="radarShowLegend" :paused="radarPaused" />
            <LazyPreviewsCursorTrailPreview v-else-if="item.slug === 'cursor-trail'" :color="cursorTrailColor" :count="cursorTrailCount" :size="cursorTrailSize" :duration="cursorTrailDuration" :shape="cursorTrailShape" :paused="cursorTrailPaused" :disabled="cursorTrailDisabled" />
            <LazyPreviewsLiquidTogglePreview v-else-if="item.slug === 'liquid-toggle'" :duration="liquidDuration" :color="liquidColor" :disabled="liquidDisabled" />
           <LazyPreviewsDirectionAwareCardPreview v-else-if="item.slug === 'direction-aware-card'" :duration="directionCardDuration" :accent="directionCardColor" :disabled="directionCardDisabled" />
           <LazyPreviewsConnectionBeamPreview v-else-if="item.slug === 'connection-beam'" :duration="connectionDuration" :beam-width="connectionBeamWidth" :color="connectionColor" :paused="connectionPaused" :disabled="connectionDisabled" />
           <LazyPreviewsSplitTextRevealPreview v-else-if="item.slug === 'split-text-reveal'" :direction="splitDirection" :duration="splitDuration" :stagger="splitStagger" :disabled="splitDisabled" />
           <LazyPreviewsAnimatedFilterGridPreview v-else-if="item.slug === 'animated-filter-grid'" :duration="filterGridDuration" :stagger="filterGridStagger" :columns="filterGridColumns" :disabled="filterGridDisabled" />
           <LazyPreviewsSwipeDrawerPreview v-else-if="item.slug === 'swipe-drawer'" :placement="drawerPlacement" :duration="drawerDuration" :threshold="drawerThreshold" :close-on-backdrop="drawerCloseOnBackdrop" :lock-scroll="drawerLockScroll" :disabled="drawerDisabled" />
            <LazyPreviewsAnimatedRatingPreview v-else-if="item.slug === 'animated-rating'" :max="ratingMax" :duration="ratingDuration" :clearable="ratingClearable" :disabled="ratingDisabled" :show-value="ratingShowValue" />
            <LazyPreviewsInteractiveDotFieldPreview v-else-if="item.slug === 'interactive-dot-field'" :rows="dotRows" :columns="dotColumns" :intensity="dotIntensity" :duration="dotDuration" :paused="dotPaused" :color="dotColor" />
            <LazyPreviewsAnimatedBreadcrumbPreview v-else-if="item.slug === 'animated-breadcrumb'" :max-items="breadcrumbMaxItems" :duration="breadcrumbDuration" :disabled="breadcrumbDisabled" />
            <LazyPreviewsPullToRefreshPreview v-else-if="item.slug === 'pull-to-refresh'" :threshold="pullThreshold" :max-pull="pullMax" :resistance="pullResistance" :duration="pullDuration" :disabled="pullDisabled" />
            <LazyPreviewsAnimatedCalendarHeatmapPreview v-else-if="item.slug === 'animated-calendar-heatmap'" :weeks="heatmapWeeks" :duration="heatmapDuration" :cell-size="heatmapCellSize" :gap="heatmapGap" :disabled="heatmapDisabled" />
            <LazyPreviewsScrollProgressNavPreview v-else-if="item.slug === 'scroll-progress-nav'" :height="scrollNavHeight" :smooth="scrollNavSmooth" :duration="scrollNavDuration" :disabled="scrollNavDisabled" />
            <LazyPreviewsGuidedTourPreview v-else-if="item.slug === 'guided-tour'" :duration="tourDuration" :close-on-backdrop="tourCloseOnBackdrop" :lock-scroll="tourLockScroll" :disabled="tourDisabled" />
            <LazyPreviewsInteractiveHoverButtonPreview v-else-if="item.slug === 'interactive-hover-button'" :label="buttonLabel" :accent="accent" :duration="hoverButtonDuration" :disabled="hoverButtonDisabled" :loading="hoverButtonLoading" />
          <LazyPreviewsSpotlightCardPreview v-else-if="item.slug === 'spotlight-card'" :title="cardTitle" :glow="accent" :radius="spotlightRadius" :intensity="spotlightIntensity" :duration="spotlightDuration" :interactive="spotlightInteractive" :disabled="spotlightDisabled" />
          <LazyPreviewsStatusPulsePreview v-else-if="item.slug === 'status-pulse'" :label="statusLabel" :tone="statusTone" :compact="compact" :paused="statusPaused" :duration="statusDuration" />
          <PreviewsAnimatedTabsPreview v-else-if="item.slug === 'animated-tabs'" :accent="accent" :disabled="tabDisabled" />
          <PreviewsTiltCardPreview v-else-if="item.slug === 'tilt-card'" :max-tilt="tiltAmount" :glare="tiltGlare" :disabled="tiltDisabled" />
          <PreviewsFloatingDockPreview v-else-if="item.slug === 'floating-dock'" :magnification="dockMagnification" :accent="accent" :disabled="dockDisabled" />
          <PreviewsAuroraBackgroundPreview v-else-if="item.slug === 'aurora-background'" :duration="auroraDuration" :intensity="auroraIntensity" :paused="auroraPaused" :colors="auroraColors" />
          <PreviewsNumberTickerPreview v-else-if="item.slug === 'number-ticker'" :value="tickerValue" :duration="tickerDuration" :decimals="tickerDecimals" />
          <PreviewsAnimatedListPreview v-else-if="item.slug === 'animated-list'" :interval="listInterval" :max-visible="listMaxVisible" :paused="listPaused" />
          <PreviewsComparisonSliderPreview v-else-if="item.slug === 'comparison-slider'" v-model="comparisonPosition" :disabled="comparisonDisabled" />
          <PreviewsToastStackPreview v-else-if="item.slug === 'toast-stack'" :default-duration="toastDuration" :max-visible="toastMaxVisible" :auto-dismiss="toastAutoDismiss" :pause-on-hover="toastPauseOnHover" />
          <PreviewsLoadingMorphPreview v-else-if="item.slug === 'loading-morph'" :result="loadingResult" :delay="loadingDelay" :reset-after="loadingResetAfter" />
          <PreviewsCommandMenuPreview v-else-if="item.slug === 'command-menu'" :placeholder="commandPlaceholder" :open-on-shortcut="commandShortcut" />
          <PreviewsInfiniteMarqueePreview v-else-if="item.slug === 'infinite-marquee'" :duration="marqueeDuration" :direction="marqueeDirection" :gap="marqueeGap" :pause-on-hover="marqueePauseOnHover" :paused="marqueePaused" :fade="marqueeFade" />
          <PreviewsFileDropzonePreview v-else-if="item.slug === 'file-dropzone'" :accept="dropzoneAccept" :max-files="dropzoneMaxFiles" :max-size-mb="dropzoneMaxSize" :disabled="dropzoneDisabled" />
          <PreviewsOtpInputPreview v-else-if="item.slug === 'otp-input'" :length="otpLength" :mode="otpMode" :disabled="otpDisabled" :show-error="otpError" />
          <PreviewsPasswordStrengthPreview v-else-if="item.slug === 'password-strength'" :min-length="passwordMinLength" :require-mixed-case="passwordMixedCase" :require-number="passwordNumber" :require-symbol="passwordSymbol" :show-requirements="passwordRequirements" :disabled="passwordDisabled" />
          <PreviewsSwipeActionsPreview v-else-if="item.slug === 'swipe-actions'" :action-width="swipeActionWidth" :threshold="swipeThreshold" :disabled="swipeDisabled" :close-on-action="swipeCloseOnAction" />
          <PreviewsHoldToConfirmPreview v-else-if="item.slug === 'hold-to-confirm'" :duration="holdDuration" :reset-after="holdResetAfter" :tone="holdTone" :disabled="holdDisabled" />
          <PreviewsInlineEditPreview v-else-if="item.slug === 'inline-edit'" :label="inlineEditLabel" :required="inlineEditRequired" :save-on-blur="inlineEditSaveOnBlur" :disabled="inlineEditDisabled" />
          <PreviewsActionMenuPreview v-else-if="item.slug === 'action-menu'" :align="actionMenuAlign" :close-on-select="actionMenuCloseOnSelect" :disabled="actionMenuDisabled" />
          <PreviewsReorderListPreview v-else-if="item.slug === 'reorder-list'" :show-positions="reorderListShowPositions" :disabled="reorderListDisabled" />
          <PreviewsNumberStepperPreview v-else-if="item.slug === 'number-stepper'" :max="numberStepperMax" :allow-input="numberStepperAllowInput" :disabled="numberStepperDisabled" />
           <PreviewsReactionPickerPreview v-else-if="item.slug === 'reaction-picker'" :columns="reactionPickerColumns" :close-on-select="reactionPickerCloseOnSelect" :disabled="reactionPickerDisabled" />
           <PreviewsContextMenuPreview v-else-if="item.slug === 'context-menu'" :long-press-delay="contextMenuLongPressDelay" :close-on-select="contextMenuCloseOnSelect" :disabled="contextMenuDisabled" />
           <PreviewsOrbitingActionsPreview v-else-if="item.slug === 'orbiting-actions'" :radius="orbitRadius" :duration="orbitDuration" :direction="orbitDirection" :paused="orbitPaused" :pause-on-hover="orbitPauseOnHover" />
           <PreviewsStackedCarouselPreview v-else-if="item.slug === 'stacked-carousel'" :autoplay-delay="carouselAutoplayDelay" :loop="carouselLoop" :paused="carouselPaused" :pause-on-hover="carouselPauseOnHover" :disabled="carouselDisabled" />
           <PreviewsScrollRevealPreview v-else-if="item.slug === 'scroll-reveal'" :variant="revealVariant" :duration="revealDuration" :distance="revealDistance" :once="revealOnce" :disabled="revealDisabled" />
           <PreviewsAnimatedDisclosurePreview v-else-if="item.slug === 'animated-disclosure'" :duration="disclosureDuration" :easing="disclosureEasing" :lazy="disclosureLazy" :unmount-on-close="disclosureUnmount" :disabled="disclosureDisabled" />
           <PreviewsBorderBeamPreview v-else-if="item.slug === 'border-beam'" :duration="beamDuration" :beam-size="beamSize" :beam-count="beamCount" :reverse="beamReverse" :paused="beamPaused" :pause-on-hover="beamPauseOnHover" :colors="beamColors" />
           <PreviewsTextLoopPreview v-else-if="item.slug === 'text-loop'" :interval="textLoopInterval" :duration="textLoopDuration" :stagger="textLoopStagger" :direction="textLoopDirection" :loop="textLoopLoop" :paused="textLoopPaused" :pause-on-hover="textLoopPauseOnHover" />
           <PreviewsRadialProgressPreview v-else-if="item.slug === 'radial-progress'" :value="radialValue" :size="radialSize" :stroke-width="radialStrokeWidth" :duration="radialDuration" :indeterminate="radialIndeterminate" :paused="radialPaused" :color="radialColor" />
           <PreviewsShimmerSkeletonPreview v-else-if="item.slug === 'shimmer-skeleton'" :loading="shimmerLoading" :duration="shimmerDuration" :paused="shimmerPaused" :pause-on-hover="shimmerPauseOnHover" :lines="shimmerLines" :avatar="shimmerAvatar" />
           <PreviewsAnimatedTimelinePreview v-else-if="item.slug === 'animated-timeline'" :duration="timelineDuration" :autoplay="timelineAutoplay" :interval="timelineInterval" :loop="timelineLoop" :paused="timelinePaused" :pause-on-hover="timelinePauseOnHover" />
           <PreviewsBurstButtonPreview v-else-if="item.slug === 'burst-button'" :particle-count="burstParticleCount" :distance="burstDistance" :duration="burstDuration" :disabled="burstDisabled" :allow-overlap="burstAllowOverlap" :colors="burstColors" />
           <PreviewsMorphingDialogPreview v-else-if="item.slug === 'morphing-dialog'" :duration="morphDuration" :close-on-backdrop="morphCloseOnBackdrop" :lock-scroll="morphLockScroll" />
           <PreviewsSpringCheckboxPreview v-else-if="item.slug === 'spring-checkbox'" :duration="checkboxDuration" :disabled="checkboxDisabled" :indeterminate="checkboxIndeterminate" />
           <PreviewsFloatingTooltipPreview v-else-if="item.slug === 'floating-tooltip'" :placement="tooltipPlacement" :delay="tooltipDelay" :duration="tooltipDuration" :disabled="tooltipDisabled" />
           <PreviewsElasticSliderPreview v-else-if="item.slug === 'elastic-slider'" :duration="sliderDuration" :disabled="sliderDisabled" :show-value="sliderShowValue" />
           <PreviewsWaveformPlayerPreview v-else-if="item.slug === 'waveform-player'" :loop="waveformLoop" :playback-rate="waveformRate" :bar-count="waveformBars" :disabled="waveformDisabled" />
           <PreviewsGradientTextPreview v-else-if="item.slug === 'gradient-text'" :duration="gradientDuration" :direction="gradientDirection" :reverse="gradientReverse" :paused="gradientPaused" :pause-on-hover="gradientPauseOnHover" :colors="gradientColors" />
           <PreviewsAnimatedSparklinePreview v-else-if="item.slug === 'animated-sparkline'" :duration="sparklineDuration" :show-area="sparklineShowArea" :show-points="sparklineShowPoints" :paused="sparklinePaused" :color="sparklineColor" />
           <PreviewsTypewriterTextPreview v-else-if="item.slug === 'typewriter-text'" :type-duration="typewriterTypeDuration" :delete-duration="typewriterDeleteDuration" :pause-duration="typewriterPauseDuration" :loop="typewriterLoop" :paused="typewriterPaused" :cursor="typewriterCursor" />
           <PreviewsFlipCountdownPreview v-else-if="item.slug === 'flip-countdown'" :duration="countdownDuration" :loop="countdownLoop" :paused="countdownPaused" :show-hours="countdownShowHours" :flip-duration="countdownFlipDuration" />
           <PreviewsMaskRevealPreview v-else-if="item.slug === 'mask-reveal'" :direction="maskDirection" :duration="maskDuration" :once="maskOnce" :paused="maskPaused" />
           <PreviewsValidatedFormPreview v-else-if="item.slug === 'validated-form'" />
           <PreviewsDataTablePreview v-else-if="item.slug === 'data-table'" />
          <div v-else-if="item.slug === 'magnetic-button'" class="text-center">
            <MagneticButton :label="magneticLabel" :strength="magneticStrength" :accent="accent" :disabled="magneticDisabled" @click="magneticClicks++" />
            <p class="mt-5 text-xs text-black/45" role="status">{{ magneticClicks ? `Clicked ${magneticClicks} times` : 'Move your pointer around the button' }}</p>
          </div>
           <LazyPreviewsTextScramblePreview v-else-if="item.slug === 'text-scramble'" :text="scrambleText" :trigger="scrambleTrigger" :duration="scrambleDuration" :disabled="scrambleDisabled" />
           <div v-else />
        </div>
        <div v-else class="min-h-[500px] bg-code p-6 font-mono text-xs leading-7 text-code-foreground/55 sm:min-h-[600px] sm:p-10">
          <pre v-if="item.slug === 'animated-tabs'" class="overflow-x-auto whitespace-pre-wrap text-brand">&lt;AnimatedTabs
  v-model="selected"
  :items="[
    { value: 'overview', label: 'Overview' },
    { value: 'design', label: 'Design' }
  ]"
&gt;
  &lt;template #overview&gt;Overview content&lt;/template&gt;
  &lt;template #design&gt;Design content&lt;/template&gt;
&lt;/AnimatedTabs&gt;</pre>
          <pre v-if="item.slug === 'floating-dock'" class="overflow-x-auto whitespace-pre-wrap text-brand">&lt;FloatingDock
  v-model="selected"
  :items="[
    { value: 'home', label: 'Home', symbol: '⌂' },
    { value: 'search', label: 'Search', symbol: '⌕' }
  ]"
  @select="item => console.log(item.value)"
/&gt;</pre>
          <p v-if="!['animated-tabs', 'floating-dock'].includes(item.slug)" class="text-brand">&lt;{{ item.name.replaceAll(' ', '') }}</p>
          <p v-for="prop in (['animated-tabs', 'floating-dock'].includes(item.slug) ? [] : item.props)" :key="prop.name" class="pl-5">
            <span class="text-white/80">:{{ prop.name }}</span>=<span class="text-[#ffae82]">&quot;{{ prop.default }}&quot;</span>
          </p>
          <p v-if="!['animated-tabs', 'floating-dock'].includes(item.slug)" class="text-brand">/&gt;</p>
          <div class="mt-10 border-t border-white/10 pt-6 font-sans text-sm leading-6 text-white/35">
            Registry source: <code class="text-white/65">registry/default/{{ item.slug }}/</code>
          </div>
        </div>
      </section>

      <aside class="h-fit rounded-[1.75rem] border border-black/10 bg-white/55 p-5 xl:sticky xl:top-24">
        <div class="mb-6 flex items-center justify-between">
          <div>
            <p class="text-sm font-semibold">Design controls</p>
            <p class="mt-1 text-xs text-black/35">Preview props locally</p>
          </div>
          <button class="grid size-8 place-items-center rounded-full border border-black/10 text-black/40 transition-colors hover:bg-white hover:text-black" title="Reset controls" @click="resetControls">
            <RotateCcw class="size-3.5" />
          </button>
        </div>

          <div class="space-y-5">
            <div v-if="item.slug === 'animated-mobile-wake-lock'" class="space-y-5">
              <label class="flex items-center justify-between text-xs">Reacquire on return <input v-model="wakeLockAutoReacquire" type="checkbox" class="accent-black"></label>
              <label class="block text-xs">Motion duration · {{ wakeLockDuration }}ms<input v-model.number="wakeLockDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="wakeLockDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Tap Keep awake to call the real Screen Wake Lock API. Browsers require HTTPS and may release the lock when the tab is hidden or battery policy changes.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-scanner'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Scanner state</span><select v-model="scannerState" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="scanning">Scanning</option><option value="paused">Paused</option><option value="success">Success</option><option value="error">Error</option></select></label>
              <label class="block text-xs">Result motion · {{ scannerDuration }}ms<input v-model.number="scannerDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Torch control <input v-model="scannerAllowTorch" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Camera flip <input v-model="scannerAllowFlip" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Gallery input <input v-model="scannerAllowGallery" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="scannerDisabled" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Use real camera <input v-model="scannerManaged" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Managed mode requests camera permission, decodes with BarcodeDetector, flips cameras, and stops tracks on cleanup. Use the camera slot only for a custom pipeline.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-compass'" class="space-y-5">
              <label class="block text-xs">Device heading · {{ compassHeading }}°<input v-model.number="compassHeading" type="range" min="0" max="359" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Target bearing · {{ compassTargetBearing }}°<input v-model.number="compassTargetBearing" type="range" min="0" max="359" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Accuracy · ±{{ compassAccuracy }}m<input v-model.number="compassAccuracy" type="range" min="1" max="50" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Ahead threshold · {{ compassArrivalThreshold }}°<input v-model.number="compassArrivalThreshold" type="range" min="0" max="30" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Motion duration · {{ compassDuration }}ms<input v-model.number="compassDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Active signal <input v-model="compassActive" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="compassDisabled" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Use device sensor <input v-model="compassSensor" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Sensor mode requests iOS permission when needed, listens to DeviceOrientation, and cleans up automatically. Disable it to provide a controlled heading.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-connectivity-bar'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Network state</span><select v-model="connectivityState" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="offline">Offline</option><option value="connecting">Connecting</option><option value="online">Online</option></select></label>
              <label class="block text-xs">Auto-hide online · {{ connectivityAutoHide }}ms<input v-model.number="connectivityAutoHide" type="range" min="0" max="6000" step="200" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ connectivityDuration }}ms<input v-model.number="connectivityDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Dismissible <input v-model="connectivityDismissible" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="connectivityDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drive state from browser connectivity or your sync layer. Online confirmation can hide itself after a configurable delay.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-voice-recorder'" class="space-y-5">
              <label class="block text-xs">Maximum duration · {{ voiceRecorderMaxDuration }}s<input v-model.number="voiceRecorderMaxDuration" type="range" min="5" max="300" step="5" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ voiceRecorderDuration }}ms<input v-model.number="voiceRecorderDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Haptic feedback <input v-model="voiceRecorderHaptic" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="voiceRecorderDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Connect lifecycle events to MediaRecorder. The UI keeps timing and controls separate from browser permission handling.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-action-bar'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ actionBarDuration }}ms<input v-model.number="actionBarDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="actionBarSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close control <input v-model="actionBarShowClose" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Loading <input v-model="actionBarLoading" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="actionBarDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Use fixed placement for production mobile screens or inline placement inside contained previews. Actions stay at least 44px tall.</p>
            </div>
            <div v-if="item.slug === 'animated-slide-to-confirm'" class="space-y-5">
              <label class="block text-xs">Commit threshold · {{ Math.round(slideConfirmThreshold * 100) }}%<input v-model.number="slideConfirmThreshold" type="range" min="0.5" max="1" step="0.02" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Snap duration · {{ slideConfirmDuration }}ms<input v-model.number="slideConfirmDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block"><span class="mb-2 block text-xs">Automatic reset</span><select v-model.number="slideConfirmResetAfter" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="0">Keep confirmed</option><option :value="1200">After 1.2s</option><option :value="2400">After 2.4s</option></select></label>
              <label class="block"><span class="mb-2 block text-xs">Tone</span><select v-model="slideConfirmTone" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="dark">Dark</option><option value="success">Success</option><option value="danger">Danger</option></select></label>
              <label class="flex items-center justify-between text-xs">Haptic feedback <input v-model="slideConfirmHaptic" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Loading <input v-model="slideConfirmLoading" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="slideConfirmDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag the handle beyond the threshold, or focus it and use Arrow keys, Home, End, Enter, or Space. A cancelled drag snaps safely back.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-numeric-keypad'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Input mode</span><select v-model="keypadMode" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="numeric">Numeric</option><option value="decimal">Decimal</option><option value="pin">PIN</option></select></label>
              <label class="block text-xs">Maximum length · {{ keypadMaxLength }}<input v-model.number="keypadMaxLength" type="range" min="1" max="16" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Press duration · {{ keypadDuration }}ms<input v-model.number="keypadDuration" type="range" min="0" max="600" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Masked display <input v-model="keypadMasked" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Submit action <input v-model="keypadShowSubmit" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Auto-submit at limit <input v-model="keypadAutoSubmit" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Haptic feedback <input v-model="keypadHaptic" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="keypadDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Tap the large keys or focus the keypad and type digits. Backspace edits, Delete or Escape clears, and Enter submits.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-onboarding-pager'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ onboardingDuration }}ms<input v-model.number="onboardingDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Swipe threshold · {{ onboardingSwipeThreshold }}px<input v-model.number="onboardingSwipeThreshold" type="range" min="24" max="180" step="4" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Swipe gesture <input v-model="onboardingSwipe" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Skip action <input v-model="onboardingShowSkip" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Back action <input v-model="onboardingShowBack" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Progress dots <input v-model="onboardingShowProgress" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="onboardingSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="onboardingDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Swipe horizontally, use the action controls, select a progress dot, or press Arrow keys, Home, and End. Vertical page scrolling remains available.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-filter-bar'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ mobileFilterDuration }}ms<input v-model.number="mobileFilterDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Multiple selection <input v-model="mobileFilterMultiple" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">All filter <input v-model="mobileFilterShowAll" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Allow empty selection <input v-model="mobileFilterAllowEmpty" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="mobileFilterDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Swipe horizontally on touch, tap chips to filter, or use Arrow keys, Home, and End. Edge fades indicate more options without adding small arrow controls.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-mini-player'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ miniPlayerDuration }}ms<input v-model.number="miniPlayerDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="miniPlayerSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close control <input v-model="miniPlayerShowClose" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="miniPlayerDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Open a recording, toggle playback, seek with touch or keyboard, and request adjacent tracks. Playback remains fully controlled by the parent.</p>
            </div>
            <div v-if="item.slug === 'animated-selection-toolbar'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ selectionToolbarDuration }}ms<input v-model.number="selectionToolbarDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Clear action <input v-model="selectionToolbarClearable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="selectionToolbarSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="selectionToolbarDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select cards to reveal the toolbar. Use Left, Right, Home, and End between actions; Escape or the close control clears selection.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-composer'" class="space-y-5">
              <label class="block text-xs">Maximum length · {{ composerMaxLength }}<input v-model.number="composerMaxLength" type="range" min="40" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Maximum rows · {{ composerMaxRows }}<input v-model.number="composerMaxRows" type="range" min="2" max="10" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Detail duration · {{ composerDuration }}ms<input v-model.number="composerDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Enter submits <input v-model="composerSubmitOnEnter" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Attachment action <input v-model="composerAllowAttachment" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="composerSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Loading <input v-model="composerLoading" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="composerDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Type multiple lines to grow the composer. Enter submits, Shift+Enter adds a line, and IME composition is never interrupted.</p>
            </div>
            <div v-if="item.slug === 'animated-swipe-snackbar'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Tone</span><select v-model="snackbarTone" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="default">Default</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option></select></label>
              <label class="block text-xs">Auto dismiss · {{ snackbarTimeout }}ms<input v-model.number="snackbarTimeout" type="range" min="0" max="10000" step="500" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Swipe threshold · {{ snackbarSwipeThreshold }}px<input v-model.number="snackbarSwipeThreshold" type="range" min="32" max="180" step="4" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ snackbarDuration }}ms<input v-model.number="snackbarDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close after action <input v-model="snackbarCloseOnAction" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="snackbarSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="snackbarDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Swipe the snackbar left or right. Its timeout pauses while hovered, focused, or dragged and resumes with the remaining time.</p>
            </div>
            <div v-if="item.slug === 'animated-segmented-control'" class="space-y-5">
              <label class="block text-xs">Indicator duration · {{ segmentedDuration }}ms<input v-model.number="segmentedDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Equal-width segments <input v-model="segmentedFullWidth" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="segmentedDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Tap a segment or use Arrow keys, Home, and End. The active indicator remeasures after viewport and item changes.</p>
            </div>
            <div v-if="item.slug === 'animated-action-sheet'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ actionSheetDuration }}ms<input v-model.number="actionSheetDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close on backdrop <input v-model="actionSheetCloseOnBackdrop" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close after selection <input v-model="actionSheetCloseOnSelect" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Lock page scroll <input v-model="actionSheetLockScroll" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="actionSheetSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="actionSheetDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Open the sheet to test thumb-sized actions, Tab focus trapping, Escape and backdrop dismissal, destructive styling, and focus restoration.</p>
            </div>
            <div v-if="item.slug === 'animated-navigation-menu'" class="space-y-5">
              <label class="block text-xs">Panel duration · {{ navigationMenuDuration }}ms<input v-model.number="navigationMenuDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="navigationMenuDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Use Left, Right, Home, and End across the top row. Arrow Down opens a panel and moves focus inside; Escape closes it and restores the trigger.</p>
            </div>
            <div v-if="item.slug === 'animated-alert-banner'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Semantic tone</span><select v-model="alertBannerTone" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="info">Info</option><option value="success">Success</option><option value="warning">Warning</option><option value="error">Error</option></select></label>
              <label class="block text-xs">Transition duration · {{ alertBannerDuration }}ms<input v-model.number="alertBannerDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Dismissible <input v-model="alertBannerDismissible" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Expandable details <input v-model="alertBannerExpandable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="alertBannerDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Warning and error tones use assertive alert semantics. Dismissal restores focus outside the disappearing banner.</p>
            </div>
            <div v-if="item.slug === 'animated-lightbox-gallery'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ lightboxDuration }}ms<input v-model.number="lightboxDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Loop at edges <input v-model="lightboxLoop" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Zoom controls <input v-model="lightboxZoomable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close on backdrop <input v-model="lightboxCloseOnBackdrop" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Lock page scroll <input v-model="lightboxLockScroll" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area insets <input v-model="lightboxSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="lightboxDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Open a frame, swipe horizontally on the image, or use arrow keys. Zoom with the controls or +, -, and 0.</p>
            </div>
            <div v-if="item.slug === 'animated-mobile-header'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Down-scroll behavior</span><select v-model="mobileHeaderMode" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="hide">Hide header</option><option value="compact">Compact header</option></select></label>
              <label class="block text-xs">Top threshold · {{ mobileHeaderCollapseAt }}px<input v-model.number="mobileHeaderCollapseAt" type="range" min="0" max="96" step="4" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ mobileHeaderDuration }}ms<input v-model.number="mobileHeaderDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Reading progress <input v-model="mobileHeaderShowProgress" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Safe-area inset <input v-model="mobileHeaderSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="mobileHeaderDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Scroll down inside the phone to hide or compact the app bar. A short upward intent restores it; selecting the title scrolls back to the top.</p>
            </div>
            <div v-if="item.slug === 'animated-bottom-sheet'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Snap points</span><select v-model="bottomSheetSnapPoints" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="[0.42, 0.72, 0.94]">42 / 72 / 94 %</option><option :value="[0.3, 0.6, 0.9]">30 / 60 / 90 %</option><option :value="[0.5, 0.9]">50 / 90 %</option></select></label>
              <label class="block text-xs">Settle duration · {{ bottomSheetDuration }}ms<input v-model.number="bottomSheetDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close on backdrop <input v-model="bottomSheetCloseOnBackdrop" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Lock page scroll <input v-model="bottomSheetLockScroll" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="bottomSheetDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag the handle with a pointer or touch, flick down to dismiss, or use Arrow keys, Home, End, and Escape. Backdrop dimming follows the live sheet height.</p>
            </div>
            <div v-if="item.slug === 'animated-fab-menu'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Dial direction</span><select v-model="fabMenuDirection" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="up">Up</option><option value="left">Left</option></select></label>
              <label class="block text-xs">Stagger duration · {{ fabMenuDuration }}ms<input v-model.number="fabMenuDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close after select <input v-model="fabMenuCloseOnSelect" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="fabMenuDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Toggle the dial, navigate actions with Arrow keys, Home, and End, press Escape to collapse, or click outside. Focus returns to the trigger on close.</p>
            </div>
            <div v-if="item.slug === 'animated-editable-table'" class="space-y-5">
              <label class="block text-xs">Row duration · {{ editableTableDuration }}ms<input v-model.number="editableTableDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Allow row removal <input v-model="editableTableRemovable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="editableTableDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Use Arrow keys to traverse cells, Enter or F2 to edit, Enter to commit, and Escape to cancel. Rows and edits stay controlled.</p>
            </div>
            <div v-if="item.slug === 'animated-multi-select'" class="space-y-5">
              <label class="block text-xs">Selection limit · {{ multiSelectMax }}<input v-model.number="multiSelectMax" type="range" min="1" max="6" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Popup duration · {{ multiSelectDuration }}ms<input v-model.number="multiSelectDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Searchable <input v-model="multiSelectSearchable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Clear action <input v-model="multiSelectClearable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="multiSelectDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Filter options, select with Enter, remove the last chip with Backspace, or clear the controlled selection.</p>
            </div>
            <div v-if="item.slug === 'animated-time-picker'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Clock format</span><select v-model.number="timePickerFormat" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="12">12 hour</option><option :value="24">24 hour</option></select></label>
              <label class="block text-xs">Minimum time<input v-model="timePickerMin" type="time" class="mt-2 h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"></label>
              <label class="block text-xs">Maximum time<input v-model="timePickerMax" type="time" class="mt-2 h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"></label>
              <label class="block text-xs">Minute step · {{ timePickerStep }}<input v-model.number="timePickerStep" type="range" min="1" max="60" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Reel duration · {{ timePickerDuration }}ms<input v-model.number="timePickerDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="timePickerDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Adjust hours and minutes with the reel buttons, Arrow or Page keys, Home, End, and direct digit entry. The preview keeps its selected time controlled.</p>
            </div>
            <div v-if="item.slug === 'animated-kanban-board'" class="space-y-5">
              <label class="block text-xs">Card reflow duration · {{ kanbanDuration }}ms<input v-model.number="kanbanDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="kanbanDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag enabled cards between columns, or press Space or Enter to pick up, use Arrow keys to position, and press again to drop. Reset restores the controlled card order.</p>
            </div>
            <div v-if="item.slug === 'animated-combobox'" class="space-y-5">
              <label class="block text-xs">Search placeholder<input v-model="comboboxPlaceholder" class="mt-2 h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs outline-none focus:border-black/30"></label>
              <label class="block text-xs">Popup duration · {{ comboboxDuration }}ms<input v-model.number="comboboxDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Clear action <input v-model="comboboxClearable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Allow custom values <input v-model="comboboxAllowCustom" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="comboboxDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Type to filter grouped options, use Arrow keys, Home, End, Enter, and Escape, or commit a custom destination. Selection and query are both controlled in the preview.</p>
            </div>
            <div v-if="item.slug === 'animated-tree-view'" class="space-y-5">
              <label class="block text-xs">Nesting indent · {{ treeIndent }}px<input v-model.number="treeIndent" type="range" min="12" max="48" step="2" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Branch duration · {{ treeDuration }}ms<input v-model.number="treeDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="treeDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Expand folders, select documents, type to search, or use Arrow keys, Home, End, Enter, and Space through the controlled tree.</p>
            </div>
            <div v-if="item.slug === 'animated-date-picker'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Locale</span><select v-model="dateLocale" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="en-US">English (US)</option><option value="en-GB">English (UK)</option><option value="ko-KR">Korean</option><option value="fr-FR">French</option></select></label>
              <label class="block"><span class="mb-2 block text-xs">First day of week</span><select v-model.number="dateFirstDay" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="0">Sunday</option><option :value="1">Monday</option><option :value="6">Saturday</option></select></label>
              <label class="block text-xs">Minimum date<input v-model="dateMin" type="date" class="mt-2 h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"></label>
              <label class="block text-xs">Maximum date<input v-model="dateMax" type="date" class="mt-2 h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"></label>
              <label class="block text-xs">Month duration · {{ dateDuration }}ms<input v-model.number="dateDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="dateDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Choose an available ISO date or navigate by day, week, month, and row boundaries with the keyboard.</p>
            </div>
            <div v-if="item.slug === 'animated-resizable-panels'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Orientation</span><select v-model="panelsOrientation" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
              <label class="block text-xs">Minimum size · {{ panelsMin }}%<input v-model.number="panelsMin" type="range" min="10" :max="panelsMax - 5" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Maximum size · {{ panelsMax }}%<input v-model.number="panelsMax" type="range" :min="panelsMin + 5" max="90" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block"><span class="mb-2 block text-xs">Snap points</span><select v-model="panelsSnapPoints" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="[36, 58, 72]">36 / 58 / 72</option><option :value="[25, 50, 75]">25 / 50 / 75</option><option :value="[]">None</option></select></label>
              <label class="block text-xs">Transition duration · {{ panelsDuration }}ms<input v-model.number="panelsDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Allow collapse <input v-model="panelsCollapsible" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="panelsDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag the separator or use axis-aware Arrow keys, Home, End, Enter, and Space. Double-click restores the initial split.</p>
            </div>
            <div v-if="item.slug === 'animated-transfer-list'" class="space-y-5">
              <label class="block text-xs">Reflow duration · {{ transferDuration }}ms<input v-model.number="transferDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="transferDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select multiple records with pointer, Enter, or Space, extend ranges with Shift, use Ctrl or Command+A, then move selected or complete lists.</p>
            </div>
            <div v-if="item.slug === 'animated-color-picker'" class="space-y-5">
              <label class="block text-xs">Feedback duration · {{ colorPickerDuration }}ms<input v-model.number="colorPickerDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Alpha channel <input v-model="colorPickerAlpha" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="colorPickerDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag the spectrum, refine HSV and alpha with native range controls, choose a swatch, or commit a validated hex value.</p>
            </div>
            <div v-if="item.slug === 'animated-image-cropper'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Aspect ratio</span><select v-model.number="cropperAspectRatio" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="1">Square / 1:1</option><option :value="4 / 3">Editorial / 4:3</option><option :value="16 / 9">Landscape / 16:9</option></select></label>
              <label class="block"><span class="mb-2 block text-xs">Crop shape</span><select v-model="cropperShape" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="rectangle">Rectangle</option><option value="circle">Circle</option></select></label>
              <label class="block text-xs">Geometry duration · {{ cropperDuration }}ms<input v-model.number="cropperDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="cropperDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Move or resize the crop with pointer and keyboard, then use the built-in controls to tune image zoom and rotation.</p>
            </div>
            <div v-if="item.slug === 'animated-checkbox-group'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Orientation</span><select v-model="checkboxGroupOrientation" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
              <label class="block"><span class="mb-2 block text-xs">Columns</span><select v-model.number="checkboxGroupColumns" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="1">1</option><option :value="2">2</option><option :value="3">3</option></select></label>
              <label class="block text-xs">Selection limit · {{ checkboxGroupMaxSelected }}<input v-model.number="checkboxGroupMaxSelected" type="range" min="1" max="4" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ checkboxGroupDuration }}ms<input v-model.number="checkboxGroupDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Required <input v-model="checkboxGroupRequired" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="checkboxGroupDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Toggle native checkboxes to update the controlled selection. Limits emit the blocked option while summaries and required semantics stay synchronized.</p>
            </div>
            <div v-if="item.slug === 'animated-progress-bar'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Size</span><select v-model="progressBarSize" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="small">Small</option><option value="medium">Medium</option><option value="large">Large</option></select></label>
              <label class="block"><span class="mb-2 block text-xs">Status</span><select v-model="progressBarStatus" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="default">Default</option><option value="success">Success</option><option value="error">Error</option></select></label>
              <label class="block text-xs">Animation duration · {{ progressBarDuration }}ms<input v-model.number="progressBarDuration" type="range" min="0" max="2400" step="50" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Progress color<input v-model="progressBarColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Indeterminate <input v-model="progressBarIndeterminate" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Striped fill <input v-model="progressBarStriped" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show value <input v-model="progressBarShowValue" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Pause animation <input v-model="progressBarPaused" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Advance the controlled deployment value, reset it, or replay the fill. Indeterminate mode removes numeric ARIA state while preserving its busy status.</p>
            </div>
            <div v-if="item.slug === 'animated-bottom-navigation'" class="space-y-5">
              <label class="block text-xs">Indicator duration · {{ bottomNavigationDuration }}ms<input v-model.number="bottomNavigationDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Hide visual labels <input v-model="bottomNavigationHideLabels" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Respect safe area <input v-model="bottomNavigationSafeArea" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="bottomNavigationDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Choose a controlled destination or use Arrow keys, Home, and End. The active indicator remeasures across label, item, and viewport changes.</p>
            </div>
            <div v-if="item.slug === 'animated-bar-chart'" class="space-y-5">
              <label class="block text-xs">Chart height · {{ barChartHeight }}px<input v-model.number="barChartHeight" type="range" min="220" max="520" step="10" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Growth duration · {{ barChartDuration }}ms<input v-model.number="barChartDuration" type="range" min="0" max="2400" step="50" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show values <input v-model="barChartShowValues" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Interactive bars <input v-model="barChartInteractive" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Pause animation <input v-model="barChartPaused" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select bars with pointer, Enter, or Space and move with Arrow keys, Home, and End. A hidden semantic table preserves the complete dataset.</p>
            </div>
            <div v-if="item.slug === 'auto-resize-textarea'" class="space-y-5">
              <label class="block text-xs">Minimum rows · {{ textareaMinRows }}<input v-model.number="textareaMinRows" type="range" min="1" max="6" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Maximum rows · {{ textareaMaxRows }}<input v-model.number="textareaMaxRows" type="range" :min="textareaMinRows" max="16" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Character limit · {{ textareaMaxLength }}<input v-model.number="textareaMaxLength" type="range" min="40" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Resize duration · {{ textareaDuration }}ms<input v-model.number="textareaDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show count <input v-model="textareaShowCount" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Read only <input v-model="textareaReadonly" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="textareaDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">The native textarea follows its content until the maximum row count, then scrolls while retaining validation and character-limit semantics.</p>
            </div>
            <div v-if="item.slug === 'flip-card'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Rotation axis</span><select v-model="flipAxis" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="y">Horizontal / Y</option><option value="x">Vertical / X</option></select></label>
              <label class="block text-xs">Flip duration · {{ flipDuration }}ms<input v-model.number="flipDuration" type="range" min="0" max="1800" step="25" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Perspective · {{ flipPerspective }}px<input v-model.number="flipPerspective" type="range" min="300" max="2400" step="50" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="flipDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Activate the card with click, Enter, or Space. The hidden face is removed from interaction while reduced motion swaps faces without rotation.</p>
            </div>
            <div v-if="item.slug === 'animated-avatar-group'" class="space-y-5">
              <label class="block text-xs">Visible members · {{ avatarMaxVisible }}<input v-model.number="avatarMaxVisible" type="range" min="1" max="7" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Avatar size · {{ avatarSize }}px<input v-model.number="avatarSize" type="range" min="32" max="80" step="2" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Overlap · {{ avatarOverlap }}px<input v-model.number="avatarOverlap" type="range" min="0" max="32" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Reflow duration · {{ avatarDuration }}ms<input v-model.number="avatarDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Expandable overflow <input v-model="avatarExpandable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="avatarDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select members with native avatar buttons, expand hidden collaborators, and preserve readable fallbacks when profile images fail.</p>
            </div>
            <div v-if="item.slug === 'expandable-search'" class="space-y-5">
              <label class="block text-xs">Expanded width · {{ searchExpandedWidth }}px<input v-model.number="searchExpandedWidth" type="range" min="180" max="600" step="10" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Expansion duration · {{ searchDuration }}ms<input v-model.number="searchDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Clear action <input v-model="searchClearable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Slash shortcut <input v-model="searchShortcut" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="searchDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Open from the trigger or slash shortcut, submit with Enter, clear in place, and press Escape to collapse and restore trigger focus.</p>
            </div>
            <div v-if="item.slug === 'animated-notification-badge'" class="space-y-5">
              <label class="block text-xs">Display maximum · {{ notificationMax }}<input v-model.number="notificationMax" type="range" min="1" max="120" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Attention duration · {{ notificationDuration }}ms<input v-model.number="notificationDuration" type="range" min="0" max="1600" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Badge color<input v-model="notificationColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Show zero <input v-model="notificationShowZero" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Pulse on changes <input v-model="notificationPulse" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="notificationDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Count changes restart bounded attention motion and announce the full unread total, while the visible badge caps at the configured maximum.</p>
            </div>
            <div v-if="item.slug === 'animated-tag-input'" class="space-y-5">
              <label class="block text-xs">Maximum tags · {{ tagMax }}<input v-model.number="tagMax" type="range" min="1" max="16" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Chip duration · {{ tagDuration }}ms<input v-model.number="tagDuration" type="range" min="0" max="800" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Allow duplicates <input v-model="tagDuplicates" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Read only <input v-model="tagReadonly" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="tagDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Add with Enter or comma, paste delimited values, and navigate remove controls with Arrow keys, Backspace, Delete, and Escape.</p>
            </div>
            <div v-if="item.slug === 'ripple-button'" class="space-y-5">
              <label class="block text-xs">Ripple duration · {{ rippleDuration }}ms<input v-model.number="rippleDuration" type="range" min="0" max="1800" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Final scale · {{ rippleScale.toFixed(1) }}<input v-model.number="rippleScale" type="range" min="1" max="2.5" step="0.1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Concurrent ripples · {{ rippleMax }}<input v-model.number="rippleMax" type="range" min="1" max="12" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Ripple color<input v-model="rippleColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Loading <input v-model="rippleLoading" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="rippleDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Pointer presses originate at local coordinates while Enter and Space launch centered ripples. Concurrent nodes stay bounded and clean themselves up.</p>
            </div>
            <div v-if="item.slug === 'animated-radio-group'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Orientation</span><select v-model="radioOrientation" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
              <label class="block"><span class="mb-2 block text-xs">Columns</span><select v-model.number="radioColumns" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="1">1</option><option :value="2">2</option><option :value="3">3</option></select></label>
              <label class="block text-xs">Transition duration · {{ radioDuration }}ms<input v-model.number="radioDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Required <input v-model="radioRequired" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="radioDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select a plan with its native radio input or use Arrow keys, Home, and End. Disabled options are skipped without breaking form semantics.</p>
            </div>
            <div v-if="item.slug === 'scratch-card'" class="space-y-5">
              <label class="block text-xs">Brush size · {{ scratchBrushSize }}px<input v-model.number="scratchBrushSize" type="range" min="8" max="100" step="2" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Reveal threshold · {{ Math.round(scratchThreshold * 100) }}%<input v-model.number="scratchThreshold" type="range" min="0.1" max="0.9" step="0.02" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Fade duration · {{ scratchDuration }}ms<input v-model.number="scratchDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Cover color<input v-model="scratchCoverColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Allow reset <input v-model="scratchResettable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="scratchDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Scratch across the high-DPI canvas until the sampled alpha reaches the threshold, or use the accessible reveal action.</p>
            </div>
            <div v-if="item.slug === 'animated-text-highlight'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Trigger</span><select v-model="highlightTrigger" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="load">Load</option><option value="hover">Hover or focus</option><option value="click">Click</option><option value="view">Viewport</option></select></label>
              <label class="block text-xs">Duration · {{ highlightDuration }}ms<input v-model.number="highlightDuration" type="range" min="0" max="2000" step="50" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Delay · {{ highlightDelay }}ms<input v-model.number="highlightDelay" type="range" min="0" max="1000" step="25" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Thickness · {{ highlightThickness.toFixed(2) }}em<input v-model.number="highlightThickness" type="range" min="0.1" max="1" step="0.02" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Marker color<input v-model="highlightColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="highlightDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">The selectable text renders once while a cloned line background grows behind wrapped text. Replay remains available for every trigger.</p>
            </div>
            <div v-if="item.slug === 'meteor-shower'" class="space-y-5">
              <label class="block text-xs">Meteor count · {{ meteorCount }}<input v-model.number="meteorCount" type="range" min="0" max="80" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Base cycle · {{ meteorSpeed.toFixed(1) }}s<input v-model.number="meteorSpeed" type="range" min="0.5" max="15" step="0.1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Trajectory angle · {{ meteorAngle }}deg<input v-model.number="meteorAngle" type="range" min="-45" max="45" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Trail length · {{ meteorTrailLength }}px<input v-model.number="meteorTrailLength" type="range" min="24" max="300" step="4" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Meteor color<input v-model="meteorColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Pause field <input v-model="meteorPaused" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="meteorDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Every trajectory is generated from deterministic integer hashes, keeping SSR output stable while preserving varied timing and placement.</p>
            </div>
            <div v-if="item.slug === 'animated-pagination'" class="space-y-5">
              <label class="block text-xs">Page count · {{ paginationPageCount }}<input v-model.number="paginationPageCount" type="range" min="1" max="30" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Visible siblings · {{ paginationSiblingCount }}<input v-model.number="paginationSiblingCount" type="range" min="0" max="4" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ paginationDuration }}ms<input v-model.number="paginationDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show edge pages <input v-model="paginationShowEdges" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="paginationDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Use previous and next or move among visible page numbers with Arrow keys, Home, and End. Large ranges collapse into semantic ellipses.</p>
            </div>
            <div v-if="item.slug === 'range-slider'" class="space-y-5">
              <label class="block text-xs">Minimum gap · ${{ Math.round(rangeMinGap / 1000) }}k<input v-model.number="rangeMinGap" type="range" min="0" max="400000" step="25000" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Step · ${{ Math.round(rangeStep / 1000) }}k<input v-model.number="rangeStep" type="range" min="25000" max="100000" step="25000" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Transition duration · {{ rangeDuration }}ms<input v-model.number="rangeDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show value bubbles <input v-model="rangeShowValues" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="rangeDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag either native handle or use its standard keyboard controls. Values stay snapped, ordered, and separated by the configured minimum gap.</p>
            </div>
            <div v-if="item.slug === 'copy-button'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ copyDuration }}ms<input v-model.number="copyDuration" type="range" min="0" max="800" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Reset delay · {{ copyResetAfter }}ms<input v-model.number="copyResetAfter" type="range" min="0" max="5000" step="100" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Icon only <input v-model="copyIconOnly" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="copyDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Copy the safe demo token to see guarded pending, success, error, and reset states. Icon-only mode keeps a complete accessible name.</p>
            </div>
            <div v-if="item.slug === 'animated-donut-chart'" class="space-y-5">
              <label class="block text-xs">Reveal duration · {{ donutDuration }}ms<input v-model.number="donutDuration" type="range" min="0" max="2400" step="50" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Ring width · {{ donutStrokeWidth }}px<input v-model.number="donutStrokeWidth" type="range" min="8" max="70" step="2" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Segment gap · {{ donutGap }}deg<input v-model.number="donutGap" type="range" min="0" max="18" step="1" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show legend <input v-model="donutShowLegend" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Pause animation <input v-model="donutPaused" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select a ring segment or use the keyboard-enabled legend. The hidden table exposes exact values and shares outside the SVG.</p>
            </div>
            <div v-if="item.slug === 'animated-stepper'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Orientation</span><select v-model="stepperOrientation" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option></select></label>
              <label class="block text-xs">Transition duration · {{ stepperDuration }}ms<input v-model.number="stepperDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Linear progression <input v-model="stepperLinear" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="stepperDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select a reachable step or use Arrow keys, Home, and End. Linear mode limits forward movement to the next enabled step.</p>
            </div>
            <div v-if="item.slug === 'floating-label-input'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Validation state</span><select v-model="floatingInputState" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="default">Default</option><option value="success">Success</option><option value="error">Error</option></select></label>
              <label class="block text-xs">Transition duration · {{ floatingInputDuration }}ms<input v-model.number="floatingInputDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Clear action <input v-model="floatingInputClearable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="floatingInputDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Focus, edit, clear, and submit the native input. Its label, underline, description, and validation status remain semantically connected.</p>
            </div>
            <div v-if="item.slug === 'animated-radar-chart'" class="space-y-5">
              <label class="block text-xs">Reveal duration · {{ radarDuration }}ms<input v-model.number="radarDuration" type="range" min="0" max="2400" step="50" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Grid levels · {{ radarLevels }}<input v-model.number="radarLevels" type="range" min="1" max="10" step="1" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show axis labels <input v-model="radarShowLabels" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show legend <input v-model="radarShowLegend" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Pause animation <input v-model="radarPaused" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select either polygon or its legend control. A hidden semantic table preserves every axis value for assistive technology.</p>
            </div>
            <div v-if="item.slug === 'cursor-trail'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Particle shape</span><select v-model="cursorTrailShape" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="circle">Circle</option><option value="square">Square</option></select></label>
              <label class="block text-xs">Maximum particles · {{ cursorTrailCount }}<input v-model.number="cursorTrailCount" type="range" min="0" max="80" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Particle size · {{ cursorTrailSize }}px<input v-model.number="cursorTrailSize" type="range" min="2" max="32" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Lifetime · {{ cursorTrailDuration }}ms<input v-model.number="cursorTrailDuration" type="range" min="100" max="2400" step="50" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Particle color<input v-model="cursorTrailColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Pause trail <input v-model="cursorTrailPaused" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="cursorTrailDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Move within the canvas to emit bounded local particles. The effect never hides the native cursor and disables itself for reduced motion.</p>
            </div>
            <div v-if="item.slug === 'liquid-toggle'" class="space-y-5">
              <label class="block text-xs">Elastic duration · {{ liquidDuration }}ms<input v-model.number="liquidDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Liquid color<input v-model="liquidColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="liquidDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Click the switch or focus it and press Space. The native checkbox owns form state while the track renders the liquid response.</p>
            </div>
            <div v-if="item.slug === 'direction-aware-card'" class="space-y-5">
              <label class="block text-xs">Overlay duration · {{ directionCardDuration }}ms<input v-model.number="directionCardDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Overlay color<input v-model="directionCardColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="directionCardDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Enter and leave through different edges to preserve spatial direction. Focus provides the same reveal and Enter or Space emits activation.</p>
            </div>
            <div v-if="item.slug === 'connection-beam'" class="space-y-5">
              <label class="block text-xs">Signal duration · {{ connectionDuration }}s<input v-model.number="connectionDuration" type="range" min="1" max="12" step="0.5" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Beam width · {{ connectionBeamWidth.toFixed(1) }}<input v-model.number="connectionBeamWidth" type="range" min="0.5" max="5" step="0.1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Signal color<input v-model="connectionColor" type="color" class="mt-2 block h-9 w-full"></label>
              <label class="flex items-center justify-between text-xs">Pause signals <input v-model="connectionPaused" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="connectionDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select any node or use Arrow keys, Home, and End. Connected paths brighten around the controlled selection.</p>
            </div>
            <div v-if="item.slug === 'split-text-reveal'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Reveal direction</span><select v-model="splitDirection" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="up">Up</option><option value="down">Down</option><option value="left">Left</option><option value="right">Right</option></select></label>
              <label class="block text-xs">Character duration · {{ splitDuration }}ms<input v-model.number="splitDuration" type="range" min="0" max="1600" step="40" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Character stagger · {{ splitStagger }}ms<input v-model.number="splitStagger" type="range" min="0" max="140" step="2" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disable motion <input v-model="splitDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Use Replay in the canvas after changing direction or timing. Grapheme segmentation keeps emoji and composed characters intact.</p>
            </div>
            <div v-if="item.slug === 'animated-filter-grid'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ filterGridDuration }}ms<input v-model.number="filterGridDuration" type="range" min="0" max="1200" step="40" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Item stagger · {{ filterGridStagger }}ms<input v-model.number="filterGridStagger" type="range" min="0" max="160" step="5" class="mt-3 w-full accent-black"></label>
              <label class="block"><span class="mb-2 block text-xs">Maximum columns</span><select v-model.number="filterGridColumns" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in [1, 2, 3, 4]" :key="value" :value="value">{{ value }}</option></select></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="filterGridDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Filter, sort, remove, or rotate the demo collection. Arrow keys move through visible enabled cards while Vue FLIP transitions preserve spatial context.</p>
            </div>
            <div v-if="item.slug === 'swipe-drawer'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Placement</span><select v-model="drawerPlacement" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="bottom">Bottom</option><option value="right">Right</option></select></label>
              <label class="block text-xs">Transition duration · {{ drawerDuration }}ms<input v-model.number="drawerDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Dismiss threshold · {{ Math.round(drawerThreshold * 100) }}%<input v-model.number="drawerThreshold" type="range" min="0.1" max="0.8" step="0.05" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close on backdrop <input v-model="drawerCloseOnBackdrop" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Lock document scroll <input v-model="drawerLockScroll" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="drawerDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag the handle toward its viewport edge, press Escape, or activate the backdrop. Focus stays trapped until the drawer closes.</p>
            </div>
            <div v-if="item.slug === 'animated-rating'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Maximum rating</span><select v-model.number="ratingMax" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in [3, 4, 5, 6, 7]" :key="value" :value="value">{{ value }}</option></select></label>
              <label class="block text-xs">Pop duration · {{ ratingDuration }}ms<input v-model.number="ratingDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Show value <input v-model="ratingShowValue" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Allow clearing <input v-model="ratingClearable" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="ratingDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Hover to preview a value, click to commit, or use Arrow keys, Home, and End from the accessible radiogroup.</p>
            </div>
            <div v-if="item.slug === 'interactive-dot-field'" class="space-y-5">
              <label class="block text-xs">Rows · {{ dotRows }}<input v-model.number="dotRows" type="range" min="4" max="24" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Columns · {{ dotColumns }}<input v-model.number="dotColumns" type="range" min="6" max="36" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Intensity · {{ dotIntensity.toFixed(2) }}<input v-model.number="dotIntensity" type="range" min="0" max="1" step="0.05" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Pulse duration · {{ dotDuration }}ms<input v-model.number="dotDuration" type="range" min="0" max="3000" step="100" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Pause field <input v-model="dotPaused" type="checkbox" class="accent-black"></label>
              <label class="block text-xs">Signal color<input v-model="dotColor" type="color" class="mt-2 block h-9 w-full"></label>
              <p class="text-xs leading-5 text-black/45">Move across the field to bend local dots, then click or use Enter and Space to launch a radial SVG pulse.</p>
            </div>
            <div v-if="item.slug === 'animated-breadcrumb'" class="space-y-5">
              <label class="block"><span class="mb-2 block text-xs">Visible item limit</span><select v-model.number="breadcrumbMaxItems" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in [3, 4, 5, 6]" :key="value" :value="value">{{ value }}</option></select></label>
              <label class="block text-xs">Transition duration · {{ breadcrumbDuration }}ms<input v-model.number="breadcrumbDuration" type="range" min="0" max="1000" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="breadcrumbDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drill down or move back to animate the path. Open the ellipsis menu with click, Arrow Down, or Arrow Up and navigate it from the keyboard.</p>
            </div>
            <div v-if="item.slug === 'pull-to-refresh'" class="space-y-5">
              <label class="block text-xs">Activation distance · {{ pullThreshold }}px<input v-model.number="pullThreshold" type="range" min="32" max="100" step="4" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Maximum pull · {{ pullMax }}px<input v-model.number="pullMax" type="range" min="64" max="180" step="4" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Resistance · {{ pullResistance.toFixed(2) }}<input v-model.number="pullResistance" type="range" min="0.2" max="1" step="0.05" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Settle duration · {{ pullDuration }}ms<input v-model.number="pullDuration" type="range" min="0" max="800" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="pullDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Drag down from the top of the inbox or focus the hidden accessible refresh action. The async task owns completion.</p>
            </div>
            <div v-if="item.slug === 'animated-calendar-heatmap'" class="space-y-5">
              <label class="block text-xs">Visible weeks · {{ heatmapWeeks }}<input v-model.number="heatmapWeeks" type="range" min="4" max="36" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Reveal duration · {{ heatmapDuration }}ms<input v-model.number="heatmapDuration" type="range" min="0" max="1800" step="50" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Cell size · {{ heatmapCellSize }}px<input v-model.number="heatmapCellSize" type="range" min="8" max="24" step="1" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Cell gap · {{ heatmapGap }}px<input v-model.number="heatmapGap" type="range" min="0" max="10" step="1" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="heatmapDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Select a day or use Arrow keys, Home, and End to inspect activity. Update data animates only changed cells.</p>
            </div>
            <div v-if="item.slug === 'scroll-progress-nav'" class="space-y-5">
              <label class="block text-xs">Viewport height · {{ scrollNavHeight }}px<input v-model.number="scrollNavHeight" type="range" min="280" max="640" step="20" class="mt-3 w-full accent-black"></label>
              <label class="block text-xs">Scroll duration · {{ scrollNavDuration }}ms<input v-model.number="scrollNavDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Smooth navigation <input v-model="scrollNavSmooth" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="scrollNavDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Scroll the release notes or use the section tabs. Progress and active-section tracking stay scoped to this viewport.</p>
            </div>
            <div v-if="item.slug === 'guided-tour'" class="space-y-5">
              <label class="block text-xs">Transition duration · {{ tourDuration }}ms<input v-model.number="tourDuration" type="range" min="0" max="900" step="20" class="mt-3 w-full accent-black"></label>
              <label class="flex items-center justify-between text-xs">Close on backdrop <input v-model="tourCloseOnBackdrop" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Lock document scroll <input v-model="tourLockScroll" type="checkbox" class="accent-black"></label>
              <label class="flex items-center justify-between text-xs">Disabled <input v-model="tourDisabled" type="checkbox" class="accent-black"></label>
              <p class="text-xs leading-5 text-black/45">Start the tour, move through each spotlight, or press Escape. Focus is trapped in the active step and restored on close.</p>
            </div>
            <div v-if="item.slug === 'mask-reveal'" class="space-y-5">
             <label class="block text-xs">Direction<select v-model="maskDirection" class="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2"><option value="left">Left</option><option value="right">Right</option><option value="up">Up</option><option value="down">Down</option><option value="center">Center</option></select></label>
             <label class="block text-xs">Reveal duration · {{ maskDuration }}ms<input v-model.number="maskDuration" type="range" min="200" max="2400" step="40" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Reveal once <input v-model="maskOnce" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="maskPaused" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">IntersectionObserver starts the reveal only when the masked content enters the viewport.</p>
           </div>
           <div v-if="item.slug === 'flip-countdown'" class="space-y-5">
             <label class="block text-xs">Initial duration · {{ countdownDuration }}s<input v-model.number="countdownDuration" type="range" min="3" max="120" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Flip duration · {{ countdownFlipDuration }}ms<input v-model.number="countdownFlipDuration" type="range" min="180" max="1000" step="20" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Show hours <input v-model="countdownShowHours" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Loop timer <input v-model="countdownLoop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause countdown <input v-model="countdownPaused" type="checkbox" class="accent-black"></label>
           </div>
           <div v-if="item.slug === 'typewriter-text'" class="space-y-5">
             <label class="block text-xs">Type speed · {{ typewriterTypeDuration }}ms<input v-model.number="typewriterTypeDuration" type="range" min="25" max="250" step="5" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Delete speed · {{ typewriterDeleteDuration }}ms<input v-model.number="typewriterDeleteDuration" type="range" min="15" max="180" step="5" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Word pause · {{ typewriterPauseDuration }}ms<input v-model.number="typewriterPauseDuration" type="range" min="300" max="3000" step="100" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Cursor<input v-model="typewriterCursor" maxlength="2" class="mt-2 w-full rounded-lg border border-black/15 px-3 py-2"></label>
             <label class="flex items-center justify-between text-xs">Loop sequence <input v-model="typewriterLoop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="typewriterPaused" type="checkbox" class="accent-black"></label>
           </div>
           <div v-if="item.slug === 'animated-sparkline'" class="space-y-5">
             <label class="block text-xs">Reveal duration · {{ sparklineDuration }}ms<input v-model.number="sparklineDuration" type="range" min="240" max="2400" step="40" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Show area <input v-model="sparklineShowArea" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Show points <input v-model="sparklineShowPoints" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="sparklinePaused" type="checkbox" class="accent-black"></label>
             <label class="block text-xs">Chart color<input v-model="sparklineColor" type="color" class="mt-2 block h-9 w-full"></label>
             <p class="text-xs leading-5 text-black/45">Focus any point and use Arrow, Home, or End to inspect the series without a pointer.</p>
           </div>
           <div v-if="item.slug === 'gradient-text'" class="space-y-5">
             <label class="block text-xs">Direction<select v-model="gradientDirection" class="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2"><option value="horizontal">Horizontal</option><option value="vertical">Vertical</option><option value="diagonal">Diagonal</option></select></label>
             <label class="block text-xs">Flow duration · {{ gradientDuration }}ms<input v-model.number="gradientDuration" type="range" min="1000" max="12000" step="250" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Reverse <input v-model="gradientReverse" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="gradientPaused" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause on hover <input v-model="gradientPauseOnHover" type="checkbox" class="accent-black"></label>
             <div class="flex gap-3"><label v-for="(_, index) in gradientColors" :key="index" class="text-xs">{{ index + 1 }}<input v-model="gradientColors[index]" type="color" class="mt-2 block h-8 w-10"></label></div>
           </div>
           <div v-if="item.slug === 'waveform-player'" class="space-y-5">
             <label class="block text-xs">Playback rate<select v-model.number="waveformRate" class="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2"><option :value="0.5">0.5×</option><option :value="1">1×</option><option :value="1.5">1.5×</option><option :value="2">2×</option></select></label>
             <label class="block text-xs">Waveform bars · {{ waveformBars }}<input v-model.number="waveformBars" type="range" min="12" max="72" step="2" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Loop playback <input v-model="waveformLoop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="waveformDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Playback time remains functional under reduced motion; only the decorative waveform pulse is removed.</p>
           </div>
           <div v-if="item.slug === 'elastic-slider'" class="space-y-5">
             <label class="block text-xs">Elastic duration · {{ sliderDuration }}ms<input v-model.number="sliderDuration" type="range" min="180" max="900" step="20" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Show tracked value <input v-model="sliderShowValue" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="sliderDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">The transparent native range owns pointer and keyboard input while the visible track follows its exact numeric value.</p>
           </div>
           <div v-if="item.slug === 'floating-tooltip'" class="space-y-5">
             <label class="block text-xs">Placement<select v-model="tooltipPlacement" class="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-2"><option value="top">Top</option><option value="right">Right</option><option value="bottom">Bottom</option><option value="left">Left</option></select></label>
             <label class="block text-xs">Open delay · {{ tooltipDelay }}ms<input v-model.number="tooltipDelay" type="range" min="0" max="800" step="20" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Motion duration · {{ tooltipDuration }}ms<input v-model.number="tooltipDuration" type="range" min="100" max="600" step="20" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="tooltipDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">The preferred side is clamped into the viewport and recalculated during nested scroll and resize events.</p>
           </div>
           <div v-if="item.slug === 'spring-checkbox'" class="space-y-5">
             <label class="block text-xs">Spring duration · {{ checkboxDuration }}ms<input v-model.number="checkboxDuration" type="range" min="180" max="1000" step="20" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Indeterminate first item <input v-model="checkboxIndeterminate" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="checkboxDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">The transparent native input owns focus, Space activation and form values. The visible box only renders motion feedback.</p>
           </div>
           <div v-if="item.slug === 'morphing-dialog'" class="space-y-5">
             <label class="block text-xs">Transition duration · {{ morphDuration }}ms<input v-model.number="morphDuration" type="range" min="180" max="1200" step="20" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Close on backdrop <input v-model="morphCloseOnBackdrop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Lock page scroll <input v-model="morphLockScroll" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">The panel measures its trigger at runtime. Escape, backdrop activation and both ends of the Tab order are managed automatically.</p>
           </div>
           <div v-if="item.slug === 'burst-button'" class="space-y-5">
             <label class="block text-xs">Particle count · {{ burstParticleCount }}<input v-model.number="burstParticleCount" type="range" min="4" max="36" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Travel distance · {{ burstDistance }}px<input v-model.number="burstDistance" type="range" min="30" max="140" step="2" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Animation duration · {{ burstDuration }}ms<input v-model.number="burstDuration" type="range" min="300" max="1600" step="40" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Allow overlapping bursts <input v-model="burstAllowOverlap" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="burstDisabled" type="checkbox" class="accent-black"></label>
             <div class="flex gap-3"><label v-for="(_, index) in burstColors" :key="index" class="text-xs">{{ index + 1 }}<input v-model="burstColors[index]" type="color" class="mt-2 block h-8 w-10"></label></div>
             <p class="text-xs leading-5 text-black/45">Activate with pointer, Enter or Space. Reduced-motion users receive the native action and events without decorative particles.</p>
           </div>
           <div v-if="item.slug === 'animated-timeline'" class="space-y-5">
             <label class="block text-xs">Transition duration · {{ timelineDuration }}ms<input v-model.number="timelineDuration" type="range" min="100" max="1400" step="40" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Autoplay interval · {{ timelineInterval }}ms<input v-model.number="timelineInterval" type="range" min="800" max="6000" step="200" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Autoplay <input v-model="timelineAutoplay" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Loop stages <input v-model="timelineLoop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause on hover or focus <input v-model="timelinePauseOnHover" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause timeline <input v-model="timelinePaused" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Select a stage or use Arrow keys, Home and End. Disabled stages are skipped by both keyboard navigation and autoplay.</p>
           </div>
           <div v-if="item.slug === 'shimmer-skeleton'" class="space-y-5">
             <label class="block text-xs">Shimmer duration · {{ shimmerDuration }}ms<input v-model.number="shimmerDuration" type="range" min="600" max="4000" step="100" class="mt-3 w-full accent-black"></label>
             <label class="block"><span class="mb-2 block text-xs">Fallback lines</span><select v-model.number="shimmerLines" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in 5" :key="value" :value="value">{{ value }}</option></select></label>
             <label class="flex items-center justify-between text-xs">Loading state <input v-model="shimmerLoading" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Show avatar placeholder <input v-model="shimmerAvatar" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause on hover <input v-model="shimmerPauseOnHover" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="shimmerPaused" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Toggle Loading state or use the canvas button. ARIA busy follows the skeleton while reduced-motion users receive a static placeholder and immediate content.</p>
           </div>
           <div v-if="item.slug === 'radial-progress'" class="space-y-5">
             <label class="block text-xs">Progress value · {{ radialValue }}%<input v-model.number="radialValue" type="range" min="0" max="100" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Size · {{ radialSize }}px<input v-model.number="radialSize" type="range" min="120" max="280" step="4" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Stroke width · {{ radialStrokeWidth }}<input v-model.number="radialStrokeWidth" type="range" min="3" max="20" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Animation duration · {{ radialDuration }}ms<input v-model.number="radialDuration" type="range" min="200" max="2400" step="100" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Indeterminate mode <input v-model="radialIndeterminate" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="radialPaused" type="checkbox" class="accent-black"></label>
             <label class="text-xs">Progress color<input v-model="radialColor" type="color" class="mt-2 block h-8 w-12"></label>
             <p class="text-xs leading-5 text-black/45">Choose a preset or drag the value. The displayed number reads the stroke animation timeline, so pause and replay keep both representations synchronized.</p>
           </div>
           <div v-if="item.slug === 'text-loop'" class="space-y-5">
             <label class="block text-xs">Autoplay interval · {{ textLoopInterval }}ms<input v-model.number="textLoopInterval" type="range" min="800" max="6000" step="200" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Transition duration · {{ textLoopDuration }}ms<input v-model.number="textLoopDuration" type="range" min="100" max="1200" step="40" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Character stagger · {{ textLoopStagger }}ms<input v-model.number="textLoopStagger" type="range" min="0" max="100" step="4" class="mt-3 w-full accent-black"></label>
             <label class="block"><span class="mb-2 block text-xs">Direction</span><select v-model="textLoopDirection" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="up">Up</option><option value="down">Down</option></select></label>
             <label class="flex items-center justify-between text-xs">Loop words <input v-model="textLoopLoop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause on hover <input v-model="textLoopPauseOnHover" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause autoplay <input v-model="textLoopPaused" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Use Previous and Next to inspect character motion. The visible word width is measured and animated while a separate live region announces only the settled value.</p>
           </div>
           <div v-if="item.slug === 'border-beam'" class="space-y-5">
             <label class="block text-xs">Circuit duration · {{ beamDuration }}s<input v-model.number="beamDuration" type="range" min="2" max="24" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Beam size · {{ beamSize }}%<input v-model.number="beamSize" type="range" min="5" max="40" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block"><span class="mb-2 block text-xs">Beam count</span><select v-model.number="beamCount" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in 4" :key="value" :value="value">{{ value }}</option></select></label>
             <label class="flex items-center justify-between text-xs">Reverse direction <input v-model="beamReverse" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause on hover or focus <input v-model="beamPauseOnHover" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="beamPaused" type="checkbox" class="accent-black"></label>
             <div class="flex gap-3"><label v-for="(_, index) in beamColors" :key="index" class="text-xs">Beam {{ index + 1 }}<input v-model="beamColors[index]" type="color" class="mt-2 block h-8 w-12"></label></div>
             <p class="text-xs leading-5 text-black/45">Each SVG stroke keeps a constant visual width and begins at a different phase. Hover the surface or focus its action to pause every beam together.</p>
           </div>
           <div v-if="item.slug === 'animated-disclosure'" class="space-y-5">
             <label class="block text-xs">Animation duration · {{ disclosureDuration }}ms<input v-model.number="disclosureDuration" type="range" min="0" max="1200" step="40" class="mt-3 w-full accent-black"></label>
             <label class="block"><span class="mb-2 block text-xs">Easing</span><select v-model="disclosureEasing" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="cubic-bezier(0.22, 1, 0.36, 1)">Expressive</option><option value="ease-in-out">Balanced</option><option value="linear">Linear</option></select></label>
             <label class="flex items-center justify-between text-xs">Lazy mount content <input v-model="disclosureLazy" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Unmount after close <input v-model="disclosureUnmount" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="disclosureDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Toggle a row or use Open all and Close all. The panel measures rendered slot height, returns to auto height when open and skips interpolation for reduced-motion users.</p>
           </div>
           <div v-if="item.slug === 'scroll-reveal'" class="space-y-5">
             <label class="block"><span class="mb-2 block text-xs">Motion variant</span><select v-model="revealVariant" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="fade-up">Fade up</option><option value="fade-down">Fade down</option><option value="fade-left">Fade left</option><option value="fade-right">Fade right</option><option value="scale">Scale</option><option value="blur">Blur</option></select></label>
             <label class="block text-xs">Duration · {{ revealDuration }}ms<input v-model.number="revealDuration" type="range" min="150" max="1800" step="50" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Travel distance · {{ revealDistance }}px<input v-model.number="revealDistance" type="range" min="0" max="80" step="2" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Reveal once per entry <input v-model="revealOnce" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disable motion <input v-model="revealDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Change a motion prop or press Replay in the canvas to inspect the stagger. Reduced-motion users receive visible content immediately.</p>
           </div>
           <div v-if="item.slug === 'stacked-carousel'" class="space-y-5">
             <label class="block text-xs">Autoplay delay · {{ carouselAutoplayDelay }}ms<input v-model.number="carouselAutoplayDelay" type="range" min="1200" max="8000" step="200" class="mt-3 w-full accent-black"></label>
             <label class="flex items-center justify-between text-xs">Loop slides <input v-model="carouselLoop" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause on hover or focus <input v-model="carouselPauseOnHover" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause autoplay <input v-model="carouselPaused" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Disabled <input v-model="carouselDisabled" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Use Left and Right Arrow, Home or End from anywhere in the carousel. Hover, focus, the playback control and reduced-motion preferences all stop automatic movement.</p>
           </div>
           <div v-if="item.slug === 'orbiting-actions'" class="space-y-5">
             <label class="block text-xs">Orbit radius · {{ orbitRadius }}px<input v-model.number="orbitRadius" type="range" min="84" max="150" step="2" class="mt-3 w-full accent-black"></label>
             <label class="block text-xs">Revolution duration · {{ orbitDuration }}s<input v-model.number="orbitDuration" type="range" min="4" max="40" step="1" class="mt-3 w-full accent-black"></label>
             <label class="block"><span class="mb-2 block text-xs">Direction</span><select v-model="orbitDirection" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="clockwise">Clockwise</option><option value="counter-clockwise">Counter-clockwise</option></select></label>
             <label class="flex items-center justify-between text-xs">Pause on hover or focus <input v-model="orbitPauseOnHover" type="checkbox" class="accent-black"></label>
             <label class="flex items-center justify-between text-xs">Pause animation <input v-model="orbitPaused" type="checkbox" class="accent-black"></label>
             <p class="text-xs leading-5 text-black/45">Hover the orbit or focus an action to pause it. Reduced-motion users receive the same actions in a stable, non-animated arrangement.</p>
           </div>
           <div v-if="item.slug === 'context-menu'" class="space-y-5">
            <label class="block text-xs">Long press delay · {{ contextMenuLongPressDelay }}ms<input v-model.number="contextMenuLongPressDelay" type="range" min="300" max="1000" step="50" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Close after selection <input v-model="contextMenuCloseOnSelect" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="contextMenuDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Right-click the card, hold it on touch or pen, or focus it and press Shift+F10 or the Context Menu key. Pointer movement cancels a pending long press.</p>
          </div>
          <div v-if="item.slug === 'reaction-picker'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Grid columns</span><select v-model.number="reactionPickerColumns" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in [2, 3, 4, 5, 6]" :key="value" :value="value">{{ value }}</option></select></label>
            <label class="flex items-center justify-between text-xs">Close after selection <input v-model="reactionPickerCloseOnSelect" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="reactionPickerDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Use every Arrow key to move through the grid, Home and End for boundaries, and Escape to close. The panel stays within the viewport and flips above the trigger when needed.</p>
          </div>
          <div v-if="item.slug === 'number-stepper'" class="space-y-5">
            <label class="block text-xs">Maximum value · {{ numberStepperMax }}<input v-model.number="numberStepperMax" type="range" min="4" max="24" step="1" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Allow direct input <input v-model="numberStepperAllowInput" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="numberStepperDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Press once or hold either action. The input supports Arrow Up, Arrow Down, Home, End, Enter and Escape while preserving exact decimal steps.</p>
          </div>
          <div v-if="item.slug === 'reorder-list'" class="space-y-5">
            <label class="flex items-center justify-between text-xs">Show positions <input v-model="reorderListShowPositions" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="reorderListDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Drag a handle to another row and release, or focus it and use Arrow Up, Arrow Down, Home and End. The moved handle keeps focus and screen readers receive the new position.</p>
          </div>
          <div v-if="item.slug === 'action-menu'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Panel alignment</span><select v-model="actionMenuAlign" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="start">Start</option><option value="end">End</option></select></label>
            <label class="flex items-center justify-between text-xs">Close after selection <input v-model="actionMenuCloseOnSelect" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="actionMenuDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Use Arrow Down or Arrow Up on the trigger, then navigate with Arrow keys, Home and End. Escape restores trigger focus; Tab and outside clicks preserve the destination focus.</p>
          </div>
          <div v-if="item.slug === 'inline-edit'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Field label</span><Input v-model="inlineEditLabel" /></label>
            <label class="flex items-center justify-between text-xs">Require a value <input v-model="inlineEditRequired" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Save on blur <input v-model="inlineEditSaveOnBlur" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="inlineEditDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Click to edit, press Enter to save, or Escape to cancel. Validation may be synchronous or asynchronous, and focus returns to the trigger after every action.</p>
          </div>
          <div v-if="item.slug === 'hold-to-confirm'" class="space-y-5">
            <label class="block text-xs">Hold duration · {{ holdDuration }}ms<input v-model.number="holdDuration" type="range" min="400" max="3000" step="100" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">After completion</span><select v-model.number="holdResetAfter" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="0">Keep completed</option><option :value="800">Reset after 0.8s</option><option :value="1400">Reset after 1.4s</option><option :value="2500">Reset after 2.5s</option></select></label>
            <label class="block"><span class="mb-2 block text-xs">Tone</span><select v-model="holdTone" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="default">Default</option><option value="danger">Danger</option></select></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="holdDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Press and hold with pointer or touch. Keyboard users can hold Space or Enter; releasing early cancels.</p>
          </div>
          <div v-if="item.slug === 'swipe-actions'" class="space-y-5">
            <label class="block text-xs">Action width · {{ swipeActionWidth }}px<input v-model.number="swipeActionWidth" type="range" min="120" max="260" step="4" class="mt-3 w-full accent-black"></label>
            <label class="block text-xs">Open threshold · {{ Math.round(swipeThreshold * 100) }}%<input v-model.number="swipeThreshold" type="range" min="0.15" max="0.75" step="0.05" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Close after action <input v-model="swipeCloseOnAction" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="swipeDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Drag horizontally, or focus the row and use Left Arrow to open and Right Arrow or Escape to close.</p>
          </div>
          <div v-if="item.slug === 'password-strength'" class="space-y-5">
            <label class="block text-xs">Minimum length · {{ passwordMinLength }}<input v-model.number="passwordMinLength" type="range" min="6" max="16" step="1" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Mixed case <input v-model="passwordMixedCase" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Require number <input v-model="passwordNumber" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Require symbol <input v-model="passwordSymbol" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Show requirements <input v-model="passwordRequirements" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="passwordDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">This preview generates both the checklist and a real Zod schema from one criteria array. Yup schemas and external vee-validate errors are also supported.</p>
          </div>
          <div v-if="item.slug === 'otp-input'" class="space-y-5">
            <label class="block text-xs">Code length · {{ otpLength }}<input v-model.number="otpLength" type="range" min="4" max="8" step="1" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">Character mode</span><select v-model="otpMode" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="numeric">Numeric</option><option value="alphanumeric">Alphanumeric</option></select></label>
            <label class="flex items-center justify-between text-xs">Show error <input v-model="otpError" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="otpDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Type normally or paste a full code. Arrow keys, Home, End, Delete and Backspace work across cells.</p>
          </div>
          <div v-if="item.slug === 'file-dropzone'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Accepted files</span><select v-model="dropzoneAccept" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="*/*">All files</option><option value="image/*">Images</option><option value=".pdf">PDF documents</option></select></label>
            <label class="block text-xs">Maximum files · {{ dropzoneMaxFiles }}<input v-model.number="dropzoneMaxFiles" type="range" min="1" max="8" step="1" class="mt-3 w-full accent-black"></label>
            <label class="block text-xs">Maximum size · {{ dropzoneMaxSize }}MB<input v-model.number="dropzoneMaxSize" type="range" min="1" max="20" step="1" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="dropzoneDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Try choosing multiple files, duplicates, or files outside the selected type and size limits.</p>
          </div>
          <div v-if="item.slug === 'infinite-marquee'" class="space-y-5">
            <label class="block text-xs">Loop duration · {{ marqueeDuration }}s<input v-model.number="marqueeDuration" type="range" min="6" max="60" step="2" class="mt-3 w-full accent-black"></label>
            <label class="block text-xs">Item gap · {{ marqueeGap }}px<input v-model.number="marqueeGap" type="range" min="0" max="48" step="2" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">Direction</span><select v-model="marqueeDirection" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="left">Left</option><option value="right">Right</option></select></label>
            <label class="flex items-center justify-between text-xs">Pause on hover <input v-model="marqueePauseOnHover" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Paused <input v-model="marqueePaused" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Edge fade <input v-model="marqueeFade" type="checkbox" class="accent-black"></label>
          </div>
          <div v-if="item.slug === 'command-menu'" class="space-y-5">
            <label class="block text-xs">Search placeholder<input v-model="commandPlaceholder" class="mt-2 h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 outline-none focus:border-black/30"></label>
            <label class="flex items-center justify-between text-xs">Global Ctrl / Command K <input v-model="commandShortcut" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Open the menu, type to filter, then use Arrow Up/Down and Enter. Escape closes and returns focus to the previous control.</p>
          </div>
          <div v-if="item.slug === 'loading-morph'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Result</span><select v-model="loadingResult" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option value="success">Success</option><option value="error">Error</option></select></label>
            <label class="block text-xs">Task delay · {{ loadingDelay }}ms<input v-model.number="loadingDelay" type="range" min="400" max="2400" step="200" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">Resolved state</span><select v-model.number="loadingResetAfter" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option :value="0">Keep result</option><option :value="1000">Reset after 1s</option><option :value="2000">Reset after 2s</option></select></label>
            <p class="text-xs leading-5 text-black/45">Press the button to simulate an asynchronous task. Loading disables duplicate submissions and resolved labels are announced politely.</p>
          </div>
          <div v-if="item.slug === 'toast-stack'" class="space-y-5">
            <label class="block text-xs">Duration · {{ toastDuration }}ms<input v-model.number="toastDuration" type="range" min="500" max="8000" step="500" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">Maximum visible</span><select v-model.number="toastMaxVisible" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in 5" :key="value" :value="value">{{ value }}</option></select></label>
            <label class="flex items-center justify-between text-xs">Auto-dismiss new items <input v-model="toastAutoDismiss" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Pause on hover <input v-model="toastPauseOnHover" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Add, dismiss, or run Undo to inspect emitted events. Existing demo notifications stay open; auto-dismiss applies to newly added items.</p>
          </div>
          <div v-if="item.slug === 'comparison-slider'" class="space-y-5">
            <label class="block text-xs">Position · {{ comparisonPosition }}%<input v-model.number="comparisonPosition" type="range" min="0" max="100" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disable interaction <input v-model="comparisonDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Drag anywhere on the preview or focus it and use Arrow, Page Up/Down, Home and End. Supply both visual layers through named slots.</p>
          </div>
          <div v-if="item.slug === 'animated-list'" class="space-y-5">
            <label class="block text-xs">Interval · {{ listInterval }}ms<input v-model.number="listInterval" type="range" min="300" max="4000" step="100" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">Maximum visible</span><select v-model.number="listMaxVisible" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in 4" :key="value" :value="value">{{ value }}</option></select></label>
            <label class="flex items-center justify-between text-xs">Pause sequence <input v-model="listPaused" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Select a row to test the event. Replace each row through the item slot. Set live to off for decorative or frequently updating lists.</p>
          </div>
          <div v-if="item.slug === 'number-ticker'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Value</span><Input v-model.number="tickerValue" type="number" /></label>
            <label class="block text-xs">Duration · {{ tickerDuration }}ms<input v-model.number="tickerDuration" type="range" min="100" max="4000" step="100" class="mt-3 w-full accent-black"></label>
            <label class="block"><span class="mb-2 block text-xs">Decimals</span><select v-model.number="tickerDecimals" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs"><option v-for="value in 5" :key="value - 1" :value="value - 1">{{ value - 1 }}</option></select></label>
            <p class="text-xs leading-5 text-black/45">Click the preview to replay. The final formatted value is exposed as one accessible label while intermediate frames stay hidden from screen readers.</p>
          </div>
          <div v-if="item.slug === 'aurora-background'" class="space-y-5">
            <label class="block text-xs">Duration · {{ auroraDuration }}s<input v-model.number="auroraDuration" type="range" min="4" max="60" class="mt-3 w-full accent-black"></label>
            <label class="block text-xs">Intensity · {{ auroraIntensity }}<input v-model.number="auroraIntensity" type="range" min="0" max="1" step="0.05" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Pause animation <input v-model="auroraPaused" type="checkbox" class="accent-black"></label>
            <div class="flex gap-3"><label v-for="(_, index) in auroraColors" :key="index" class="text-xs">Color {{ index + 1 }}<input v-model="auroraColors[index]" type="color" class="mt-2 block h-8 w-12"></label></div>
            <p class="text-xs leading-5 text-black/45">Place any content in the default slot. Size the wrapper with class or style. Reduced-motion users see a static background.</p>
          </div>
          <label v-if="item.slug === 'interactive-hover-button'" class="block">
            <span class="mb-2 block text-[11px] font-medium text-black/50">Label</span>
            <Input v-model="buttonLabel" class="bg-white/70" />
          </label>
          <label v-if="item.slug === 'spotlight-card'" class="block">
            <span class="mb-2 block text-[11px] font-medium text-black/50">Title</span>
            <Input v-model="cardTitle" class="bg-white/70" />
          </label>
          <label v-if="item.slug === 'status-pulse'" class="block">
            <span class="mb-2 block text-[11px] font-medium text-black/50">Status label</span>
            <Input v-model="statusLabel" class="bg-white/70" />
          </label>
          <label v-if="item.slug === 'text-scramble'" class="block">
            <span class="mb-2 block text-[11px] font-medium text-black/50">Text</span>
            <Input v-model="scrambleText" class="bg-white/70" />
          </label>

          <div v-if="item.slug === 'magnetic-button'" class="space-y-5">
            <label class="block">
              <span class="mb-2 block text-xs">Label</span>
              <Input v-model="magneticLabel" />
            </label>
            <label class="block">
              <span class="mb-2 block text-xs">Strength · {{ magneticStrength }}px</span>
              <input v-model.number="magneticStrength" type="range" min="0" max="48" step="1" class="w-full accent-black">
            </label>
            <label class="flex items-center justify-between text-xs">
              Disabled <input v-model="magneticDisabled" type="checkbox" class="accent-black">
            </label>
            <p class="text-xs leading-5 text-black/45">Touch and reduced-motion users get a stationary button. Tab, Enter, and Space use native button behavior.</p>
          </div>

          <div v-if="item.slug === 'interactive-hover-button'" class="space-y-5">
            <label class="block text-xs">Motion duration · {{ hoverButtonDuration }}ms<input v-model.number="hoverButtonDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Loading <input v-model="hoverButtonLoading" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="hoverButtonDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Hover with a pointer, press on touch, or focus with the keyboard. Native button type and attributes remain available.</p>
          </div>

          <div v-if="item.slug === 'spotlight-card'" class="space-y-5">
            <label class="block text-xs">Glow radius · {{ spotlightRadius }}px<input v-model.number="spotlightRadius" type="range" min="80" max="600" step="20" class="mt-3 w-full accent-black"></label>
            <label class="block text-xs">Intensity · {{ spotlightIntensity.toFixed(2) }}<input v-model.number="spotlightIntensity" type="range" min="0" max="0.8" step="0.04" class="mt-3 w-full accent-black"></label>
            <label class="block text-xs">Fade duration · {{ spotlightDuration }}ms<input v-model.number="spotlightDuration" type="range" min="0" max="1200" step="20" class="mt-3 w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Interactive <input v-model="spotlightInteractive" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="spotlightDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Move a pointer, press on touch, or focus the card by keyboard. The light resets after leaving or blurring.</p>
          </div>

          <div v-if="item.slug === 'animated-tabs'" class="space-y-4">
            <label class="flex items-center justify-between text-xs">Disable Code tab <input v-model="tabDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Use Left/Right, Home and End to navigate. Panel content can be replaced through named slots matching each item value.</p>
          </div>
          <div v-if="item.slug === 'tilt-card'" class="space-y-5">
            <label class="block">
              <span class="mb-2 block text-xs">Max tilt · {{ tiltAmount }}°</span>
              <input v-model.number="tiltAmount" type="range" min="0" max="24" step="1" class="w-full accent-black">
            </label>
            <label class="flex items-center justify-between text-xs">Pointer glare <input v-model="tiltGlare" type="checkbox" class="accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disable motion <input v-model="tiltDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">The component supplies motion only. Card content, spacing, colors and radius remain yours through the default slot and class attributes.</p>
          </div>
          <div v-if="item.slug === 'floating-dock'" class="space-y-5">
            <label class="block"><span class="mb-2 block text-xs">Magnification · {{ dockMagnification }}×</span><input v-model.number="dockMagnification" type="range" min="1" max="1.6" step="0.05" class="w-full accent-black"></label>
            <label class="flex items-center justify-between text-xs">Disable Settings <input v-model="dockDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-xs leading-5 text-black/45">Tab to focus, Enter or Space to select. Touch and reduced-motion users get stationary icons. Handle the select event to connect actions or routing.</p>
          </div>
          <div v-if="['interactive-hover-button', 'spotlight-card', 'magnetic-button', 'animated-tabs', 'floating-dock'].includes(item.slug)">
            <span class="mb-2 block text-[11px] font-medium text-black/50">Accent</span>
            <div class="flex gap-2">
              <button v-for="color in ['#d9ff57', '#ff714b', '#79a7ff', '#f5a8e1']" :key="color" class="size-8 rounded-full border-2 border-white shadow-sm ring-offset-2 transition-all" :class="accent === color ? 'ring-2 ring-black' : ''" :style="{ backgroundColor: color }" @click="accent = color" />
            </div>
          </div>

          <div v-if="item.slug === 'status-pulse'">
            <span class="mb-2 block text-[11px] font-medium text-black/50">Tone</span>
            <div class="grid grid-cols-3 gap-2">
              <button v-for="tone in (['lime', 'blue', 'orange'] as const)" :key="tone" class="rounded-lg border px-2 py-2 text-[10px] font-medium capitalize" :class="statusTone === tone ? 'border-black bg-black text-white' : 'border-black/10 bg-white/60'" @click="statusTone = tone">{{ tone }}</button>
            </div>
            <label class="mt-4 flex items-center justify-between text-xs text-black/55">
              Compact mode
              <input v-model="compact" type="checkbox" class="size-4 accent-black">
            </label>
            <label class="mt-4 flex items-center justify-between text-xs text-black/55">Pause pulse<input v-model="statusPaused" type="checkbox" class="size-4 accent-black"></label>
            <label class="mt-4 block text-xs text-black/55">Duration · {{ statusDuration }}ms<input v-model.number="statusDuration" type="range" min="400" max="4000" step="100" class="mt-3 w-full accent-black"></label>
          </div>

          <div v-if="item.slug === 'text-scramble'" class="space-y-5">
            <label class="block">
              <span class="mb-2 block text-[11px] font-medium text-black/50">Trigger</span>
              <select v-model="scrambleTrigger" class="h-9 w-full rounded-lg border border-black/10 bg-white/70 px-3 text-xs outline-none focus:border-black/30">
                <option value="hover">Hover / Focus</option>
                <option value="click">Click / Enter</option>
                <option value="load">On load</option>
              </select>
            </label>
            <label class="block">
              <span class="mb-2 flex items-center justify-between text-[11px] font-medium text-black/50">
                Duration
                <code>{{ scrambleDuration }}ms</code>
              </span>
              <input v-model.number="scrambleDuration" type="range" min="200" max="2000" step="100" class="w-full accent-black">
            </label>
            <label class="flex items-center justify-between text-xs">Disabled <input v-model="scrambleDisabled" type="checkbox" class="accent-black"></label>
            <p class="text-[11px] leading-5 text-black/35">Hover or focus to replay on desktop. Touch users can tap; keyboard users can press Enter or Space.</p>
          </div>
        </div>

        <div class="mt-7 border-t border-black/10 pt-5">
          <p class="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/35">Last updated</p>
          <p class="font-mono text-xs">{{ item.updated }}</p>
        </div>
      </aside>
    </div>

    <section class="grid gap-8 border-t border-black/10 py-12 lg:grid-cols-[0.45fr_1fr]">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">Installation</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Add to your project</h2>
        <p class="mt-3 max-w-sm text-sm leading-6 text-black/45">shadcn-vue가 파일과 필요한 의존성을 현재 프로젝트에 직접 추가합니다.</p>
      </div>
      <div>
          <button class="group flex w-full items-start justify-between gap-6 rounded-2xl bg-code p-5 text-left sm:p-6" @click="copyCommand">
          <code class="break-all font-mono text-xs leading-6 text-brand sm:text-sm">{{ installCommand }}</code>
          <span class="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-white/50 group-hover:bg-white/10 group-hover:text-white">
            <Check v-if="copied" class="size-3.5 text-brand" />
            <Copy v-else class="size-3.5" />
          </span>
        </button>
        <NuxtLink to="/docs/registry" class="mt-3 inline-flex items-center gap-1.5 text-xs text-black/45 hover:text-black">Registry setup guide <ExternalLink class="size-3" /></NuxtLink>
      </div>
    </section>

    <section class="grid gap-8 border-t border-black/10 py-12 lg:grid-cols-[0.45fr_1fr]">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">API reference</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Props</h2>
      </div>
      <div class="overflow-hidden rounded-2xl border border-black/10 bg-white/40">
        <div v-for="(prop, index) in item.props" :key="prop.name" class="grid gap-2 p-5 sm:grid-cols-[130px_180px_1fr] sm:items-center" :class="index ? 'border-t border-black/10' : ''">
          <code class="text-xs font-semibold">{{ prop.name }}</code>
          <code class="text-[11px] text-brand-strong">{{ prop.type }}</code>
          <p class="text-xs leading-5 text-black/45">{{ prop.description }} <span class="text-black/25">Default: {{ prop.default }}</span></p>
        </div>
      </div>
    </section>

    <section class="grid gap-8 border-t border-black/10 py-12 lg:grid-cols-[0.45fr_1fr]">
      <div>
        <p class="text-xs font-semibold uppercase tracking-[0.16em] text-black/35">Usage</p>
        <h2 class="mt-3 text-3xl font-semibold tracking-[-0.04em]">Example</h2>
        <p class="mt-3 max-w-sm text-sm leading-6 text-black/45">Nuxt 컴포넌트 auto-import를 기준으로 작성된 최소 사용 예제입니다. auto-import를 사용하지 않으면 CLI가 생성한 경로에서 컴포넌트를 import하세요.</p>
      </div>
      <div class="min-w-0 overflow-hidden rounded-2xl border border-white/10 bg-code text-code-foreground shadow-sm">
        <div class="flex items-center justify-between border-b border-white/10 px-4 py-3 sm:px-5">
          <span class="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">Example.vue</span>
          <button type="button" class="inline-flex h-8 items-center gap-2 rounded-lg border border-white/10 px-3 text-[11px] text-white/55 transition-colors hover:bg-white/10 hover:text-white" @click="copyExample">
            <Check v-if="exampleCopied" class="size-3.5 text-brand" />
            <Copy v-else class="size-3.5" />
            {{ exampleCopied ? 'Copied' : 'Copy' }}
          </button>
        </div>
        <div v-if="highlightedExample" class="component-example-code" v-html="highlightedExample.html" />
        <pre v-else class="max-h-[620px] overflow-auto p-5 font-mono text-[12px] leading-6 text-white/70 sm:p-6"><code>{{ componentExample }}</code></pre>
      </div>
    </section>
  </div>
</template>
