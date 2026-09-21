<script setup lang="ts">
import { nextTick, ref } from 'vue'
import AnimatedAlertBanner, { type AnimatedAlertBannerTone } from '../../../registry/default/animated-alert-banner/AnimatedAlertBanner.vue'

const props = withDefaults(defineProps<{
  tone?: AnimatedAlertBannerTone
  duration?: number
  dismissible?: boolean
  expandable?: boolean
  disabled?: boolean
}>(), {
  tone: 'info',
  duration: 320,
  dismissible: true,
  expandable: true,
  disabled: false,
})

const banner = ref<InstanceType<typeof AnimatedAlertBanner> | null>(null)
const visible = ref(true)
const expanded = ref(false)
const status = ref('The workspace update is visible.')

function restore() {
  if (props.disabled) {
    status.value = 'The alert is disabled and cannot be restored.'
    return
  }
  if (visible.value) {
    banner.value?.focus()
    status.value = 'The alert is already visible.'
    return
  }
  banner.value?.show()
}

function handleShow() {
  status.value = 'The workspace update was restored.'
  nextTick(() => banner.value?.focus())
}

function handleDismiss() {
  status.value = 'The workspace update was dismissed. Use Restore alert to bring it back.'
}

function handleToggle(value: boolean) {
  expanded.value = value
  status.value = value ? 'Additional release details expanded.' : 'Additional release details collapsed.'
}

function focusBanner() {
  banner.value?.focus()
  status.value = 'Focus moved to the alert.'
}
</script>

<template>
  <div data-testid="animated-alert-banner-preview" class="relative flex min-h-[500px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-[#f2f0e9] p-4 text-[#191a17] sm:min-h-[560px] sm:p-10">
    <div class="pointer-events-none absolute inset-0 opacity-80 [background-image:radial-gradient(circle_at_12%_8%,#d9ff83_0,transparent_27%),radial-gradient(circle_at_88%_92%,#b9d7ff_0,transparent_30%)]" />
    <div class="pointer-events-none absolute inset-0 opacity-[0.22] [background-image:linear-gradient(#191a1710_1px,transparent_1px),linear-gradient(90deg,#191a1710_1px,transparent_1px)] [background-size:28px_28px]" />

    <section class="relative w-full max-w-3xl overflow-hidden rounded-[28px] border border-black/10 bg-white/80 shadow-[0_30px_90px_-45px_rgb(30_38_28/0.45)] backdrop-blur-xl" aria-labelledby="alert-preview-heading">
      <header class="flex flex-col gap-4 border-b border-black/10 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
        <div>
          <p class="text-[10px] font-bold uppercase tracking-[0.2em] text-black/40">Notification center</p>
          <h3 id="alert-preview-heading" class="mt-1 text-xl font-semibold tracking-[-0.04em] sm:text-2xl">A banner with good manners.</h3>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <span data-testid="alert-banner-preview-visibility" class="mr-1 inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-black/45">
            <span class="size-1.5 rounded-full" :class="visible ? 'bg-[#52a96b]' : 'bg-black/20'" aria-hidden="true" />
            {{ visible ? (expanded ? 'Expanded' : 'Visible') : 'Hidden' }}
          </span>
          <button type="button" data-testid="alert-banner-focus" class="min-h-9 rounded-full border border-black/10 bg-white px-3 text-[11px] font-semibold shadow-sm outline-none transition hover:not-disabled:-translate-y-px hover:not-disabled:border-black/20 focus-visible:ring-4 focus-visible:ring-[#8bbdff]/40 disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="!visible || disabled" @click="focusBanner">Focus</button>
          <button type="button" data-testid="alert-banner-restore" class="min-h-9 rounded-full bg-[#191a17] px-3.5 text-[11px] font-semibold text-white shadow-sm outline-none transition hover:not-disabled:-translate-y-px hover:not-disabled:bg-black/80 focus-visible:ring-4 focus-visible:ring-[#d9ff83] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="visible || disabled" @click="restore">Restore alert</button>
        </div>
      </header>

      <div class="min-h-[265px] p-4 sm:p-7">
        <AnimatedAlertBanner
          ref="banner"
          v-model="visible"
          title="Your workspace is ready for the next release"
          description="Three updates were applied successfully. Review the highlights before inviting your team."
          label="Workspace release update"
          :tone="tone"
          :duration="duration"
          :dismissible="dismissible"
          :expandable="expandable"
          :disabled="disabled"
          @show="handleShow"
          @dismiss="handleDismiss"
          @toggle="handleToggle"
        >
          <template #details>
            <ul class="grid gap-1.5 sm:grid-cols-3" aria-label="Release highlights">
              <li class="rounded-xl bg-current/[0.045] px-3 py-2">Faster project search</li>
              <li class="rounded-xl bg-current/[0.045] px-3 py-2">Updated access controls</li>
              <li class="rounded-xl bg-current/[0.045] px-3 py-2">Cleaner activity history</li>
            </ul>
          </template>

          <template #action="{ disabled: actionDisabled }">
            <button type="button" class="min-h-9 rounded-full bg-current px-3.5 text-[11px] font-semibold text-white outline-none transition hover:not-disabled:opacity-80 focus-visible:ring-4 focus-visible:ring-current/25 disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="actionDisabled" @click="status = 'Release notes opened for review.'">Review notes</button>
          </template>
        </AnimatedAlertBanner>

        <div v-if="!visible" data-testid="alert-banner-empty-state" class="grid min-h-[220px] place-items-center rounded-[20px] border border-dashed border-black/15 bg-black/[0.025] p-6 text-center">
          <div>
            <span class="mx-auto grid size-11 place-items-center rounded-full bg-white text-black/35 shadow-sm" aria-hidden="true">
              <svg class="size-5 fill-none stroke-current stroke-[1.7]" viewBox="0 0 24 24"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9Z" stroke-linecap="round" stroke-linejoin="round" /><path d="M10 21h4" stroke-linecap="round" /></svg>
            </span>
            <p class="mt-3 text-sm font-semibold">No active announcement</p>
            <p class="mt-1 text-xs text-black/45">The banner left without disrupting your place.</p>
            <button type="button" class="mt-4 min-h-10 rounded-full border border-black/10 bg-white px-4 text-xs font-semibold shadow-sm outline-none transition hover:not-disabled:border-black/25 focus-visible:ring-4 focus-visible:ring-[#d9ff83] disabled:cursor-not-allowed disabled:opacity-40 motion-reduce:transition-none" :disabled="disabled" @click="restore">Restore announcement</button>
          </div>
        </div>
      </div>

      <footer class="flex min-h-12 items-center justify-between gap-4 border-t border-black/10 px-5 py-3 text-[10px] text-black/45 sm:px-6">
        <p data-testid="alert-banner-preview-status" class="leading-4" aria-live="polite">{{ status }}</p>
        <span class="hidden shrink-0 font-medium uppercase tracking-[0.12em] sm:inline">{{ tone }} tone</span>
      </footer>
    </section>
  </div>
</template>
