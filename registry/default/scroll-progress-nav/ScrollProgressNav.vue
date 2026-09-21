<script setup lang="ts">
import {
  computed,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
} from "vue";

export interface ScrollProgressNavItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export type ScrollProgressNavChangeSource =
  "click" | "keyboard" | "scroll" | "api";

const props = withDefaults(
  defineProps<{
    items: ScrollProgressNavItem[];
    height?: number | string;
    smooth?: boolean;
    duration?: number;
    disabled?: boolean;
    label?: string;
  }>(),
  {
    height: 480,
    smooth: true,
    duration: 420,
    disabled: false,
    label: "On this page",
  },
);

const model = defineModel<string>({ default: "" });
const emit = defineEmits<{
  change: [
    item: ScrollProgressNavItem,
    index: number,
    source: ScrollProgressNavChangeSource,
  ];
  progress: [value: number];
}>();

const viewport = ref<HTMLElement | null>(null);
const content = ref<HTMLElement | null>(null);
const progress = ref(0);
const reducedMotion = ref(false);
const buttons = new Map<number, HTMLButtonElement>();

let resizeObserver: ResizeObserver | undefined;
let motionQuery: MediaQueryList | undefined;
let scrollFrame: number | undefined;
let animationFrame: number | undefined;
let scrollingTo: string | undefined;
let lastProgress = -1;

const enabledIndices = computed(() =>
  props.items
    .map((item, index) => (!item.disabled && !props.disabled ? index : -1))
    .filter((index) => index >= 0),
);
const activeIndex = computed(() => {
  const index = props.items.findIndex(
    (item) => item.id === model.value && !item.disabled,
  );
  return index >= 0 ? index : (enabledIndices.value[0] ?? -1);
});
const viewportStyle = computed(() => ({
  height:
    typeof props.height === "number"
      ? `${Math.max(props.height, 0)}px`
      : props.height,
}));
const indicatorStyle = computed(() => ({
  transitionDuration: reducedMotion.value
    ? "0ms"
    : `${Math.max(props.duration, 0)}ms`,
}));

function setButton(index: number, element: unknown) {
  if (element instanceof HTMLButtonElement) buttons.set(index, element);
  else buttons.delete(index);
}

function sectionFor(id: string) {
  return Array.from(
    content.value?.querySelectorAll<HTMLElement>("[data-scroll-section]") ?? [],
  ).find(
    (section) => section.id === id || section.dataset.scrollSection === id,
  );
}

function sectionTop(section: HTMLElement) {
  if (!viewport.value) return 0;
  return (
    section.getBoundingClientRect().top -
    viewport.value.getBoundingClientRect().top +
    viewport.value.scrollTop
  );
}

function setActive(index: number, source: ScrollProgressNavChangeSource) {
  const item = props.items[index];
  if (!item || item.disabled || props.disabled || model.value === item.id)
    return;
  model.value = item.id;
  emit("change", item, index, source);
}

function recalculate() {
  const element = viewport.value;
  if (!element) return 0;

  const maximum = Math.max(element.scrollHeight - element.clientHeight, 0);
  const nextProgress =
    maximum > 0 ? Math.min(Math.max(element.scrollTop / maximum, 0), 1) : 0;
  progress.value = nextProgress;
  if (nextProgress !== lastProgress) {
    lastProgress = nextProgress;
    emit("progress", nextProgress);
  }

  if (scrollingTo || props.disabled || !enabledIndices.value.length)
    return nextProgress;

  let nextIndex = enabledIndices.value[0]!;
  if (maximum > 0 && element.scrollTop >= maximum - 1) {
    nextIndex = enabledIndices.value.at(-1)!;
  } else {
    const marker =
      element.scrollTop + Math.min(element.clientHeight * 0.3, 120);
    for (const index of enabledIndices.value) {
      const section = sectionFor(props.items[index]!.id);
      if (section && sectionTop(section) <= marker) nextIndex = index;
    }
  }
  setActive(nextIndex, "scroll");
  return nextProgress;
}

function scheduleRecalculation() {
  if (scrollFrame !== undefined) return;
  scrollFrame = window.requestAnimationFrame(() => {
    scrollFrame = undefined;
    recalculate();
  });
}

function cancelScroll() {
  if (animationFrame !== undefined) window.cancelAnimationFrame(animationFrame);
  animationFrame = undefined;
  scrollingTo = undefined;
}

function scrollTo(id: string, source: ScrollProgressNavChangeSource = "api") {
  const element = viewport.value;
  const index = props.items.findIndex((item) => item.id === id);
  const item = props.items[index];
  const section = sectionFor(id);
  if (!element || !item || !section || item.disabled || props.disabled) return;

  cancelScroll();
  setActive(index, source);

  const maximum = Math.max(element.scrollHeight - element.clientHeight, 0);
  const target = Math.min(Math.max(sectionTop(section), 0), maximum);
  const start = element.scrollTop;
  const distance = target - start;

  if (
    !props.smooth ||
    reducedMotion.value ||
    props.duration <= 0 ||
    Math.abs(distance) < 1
  ) {
    element.scrollTop = target;
    recalculate();
    return;
  }

  scrollingTo = id;
  const startedAt = performance.now();
  const duration = Math.max(props.duration, 1);
  const animate = (time: number) => {
    const elapsed = Math.min((time - startedAt) / duration, 1);
    const eased = 1 - (1 - elapsed) ** 3;
    element.scrollTop = start + distance * eased;

    if (elapsed < 1) {
      animationFrame = window.requestAnimationFrame(animate);
    } else {
      animationFrame = undefined;
      scrollingTo = undefined;
      recalculate();
    }
  };
  animationFrame = window.requestAnimationFrame(animate);
}

function navigate(index: number, source: "click" | "keyboard", focus = false) {
  const item = props.items[index];
  if (!item || item.disabled || props.disabled) return;
  scrollTo(item.id, source);
  if (focus) nextTick(() => buttons.get(index)?.focus());
}

function moveFocus(index: number, step: 1 | -1) {
  const position = enabledIndices.value.indexOf(index);
  if (position < 0 || !enabledIndices.value.length) return;
  const nextPosition =
    (position + step + enabledIndices.value.length) %
    enabledIndices.value.length;
  navigate(enabledIndices.value[nextPosition]!, "keyboard", true);
}

function handleKeydown(event: KeyboardEvent, index: number) {
  if (event.key === "ArrowRight" || event.key === "ArrowDown") {
    event.preventDefault();
    moveFocus(index, 1);
  } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
    event.preventDefault();
    moveFocus(index, -1);
  } else if (event.key === "Home") {
    event.preventDefault();
    const first = enabledIndices.value[0];
    if (first !== undefined) navigate(first, "keyboard", true);
  } else if (event.key === "End") {
    event.preventDefault();
    const last = enabledIndices.value.at(-1);
    if (last !== undefined) navigate(last, "keyboard", true);
  }
}

function handleScroll() {
  scheduleRecalculation();
}

function interruptScroll() {
  if (animationFrame === undefined) return;
  cancelScroll();
  scheduleRecalculation();
}

function setupResizeObserver() {
  resizeObserver?.disconnect();
  resizeObserver = undefined;
  if (!viewport.value || typeof ResizeObserver === "undefined") return;

  resizeObserver = new ResizeObserver(scheduleRecalculation);
  resizeObserver.observe(viewport.value);
  if (content.value) resizeObserver.observe(content.value);
  for (const section of content.value?.querySelectorAll<HTMLElement>(
    "[data-scroll-section]",
  ) ?? []) {
    resizeObserver.observe(section);
  }
}

function handleMotionChange(event: MediaQueryListEvent) {
  reducedMotion.value = event.matches;
  if (event.matches && scrollingTo) {
    const target = scrollingTo;
    cancelScroll();
    scrollTo(target);
  }
}

watch(
  () => props.items,
  async () => {
    await nextTick();
    const current = props.items.find(
      (item) => item.id === model.value && !item.disabled,
    );
    if (!current)
      model.value = props.items.find((item) => !item.disabled)?.id ?? "";
    setupResizeObserver();
    recalculate();
  },
  { deep: true },
);

onMounted(async () => {
  motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  reducedMotion.value = motionQuery.matches;
  motionQuery.addEventListener("change", handleMotionChange);

  if (!props.items.some((item) => item.id === model.value && !item.disabled)) {
    model.value = props.items.find((item) => !item.disabled)?.id ?? "";
  }
  await nextTick();
  setupResizeObserver();
  recalculate();
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
  motionQuery?.removeEventListener("change", handleMotionChange);
  if (scrollFrame !== undefined) window.cancelAnimationFrame(scrollFrame);
  cancelScroll();
});

defineExpose({ scrollTo, recalculate });
</script>

<template>
  <div
    class="scroll-progress-nav flex min-w-0 flex-col gap-4 md:flex-row md:gap-7"
    :aria-disabled="disabled || undefined"
  >
    <nav class="relative min-w-0 shrink-0 md:w-40" :aria-label="label">
      <ol
        class="flex min-w-0 gap-1 overflow-x-auto border-b border-border pb-2 md:flex-col md:gap-1 md:overflow-visible md:border-b-0 md:border-l md:pb-0 md:pl-3"
      >
        <li
          v-for="(item, index) in items"
          :key="item.id"
          class="shrink-0 md:w-full"
        >
          <button
            :ref="(element) => setButton(index, element)"
            type="button"
            class="group flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-xs font-medium text-muted-foreground outline-none transition-colors hover:bg-accent hover:text-foreground focus-visible:bg-accent focus-visible:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none"
            :class="index === activeIndex ? 'bg-accent text-foreground' : ''"
            :disabled="disabled || item.disabled"
            :tabindex="!disabled && index === activeIndex ? 0 : -1"
            :aria-current="index === activeIndex ? 'location' : undefined"
            :aria-controls="item.id"
            @click="navigate(index, 'click')"
            @keydown="handleKeydown($event, index)"
          >
            <span
              class="size-1.5 shrink-0 rounded-full bg-border transition-colors group-aria-[current=location]:bg-primary motion-reduce:transition-none"
            />
            <span class="whitespace-nowrap md:whitespace-normal">{{
              item.label
            }}</span>
          </button>
        </li>
      </ol>

      <div
        aria-hidden="true"
        class="pointer-events-none absolute inset-x-0 bottom-0 h-px md:hidden"
      >
        <div
          class="h-full bg-primary transition-[width] ease-out motion-reduce:transition-none"
          :style="{ ...indicatorStyle, width: `${progress * 100}%` }"
        />
      </div>
      <div
        aria-hidden="true"
        class="pointer-events-none absolute bottom-0 left-0 top-0 hidden w-px md:block"
      >
        <div
          class="w-full bg-primary transition-[height] ease-out motion-reduce:transition-none"
          :style="{ ...indicatorStyle, height: `${progress * 100}%` }"
        />
      </div>
    </nav>

    <div
      ref="viewport"
      class="min-h-0 min-w-0 shrink-0 overflow-y-auto overscroll-contain rounded-xl border border-border bg-background outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex-1 md:shrink"
      :style="viewportStyle"
      role="region"
      :aria-label="`${label} content`"
      tabindex="0"
      @scroll.passive="handleScroll"
      @wheel.passive="interruptScroll"
      @touchstart.passive="interruptScroll"
    >
      <div ref="content" class="min-h-full">
        <slot />
      </div>
    </div>
  </div>
</template>
