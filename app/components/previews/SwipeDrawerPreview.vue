<script setup lang="ts">
import { ref } from 'vue'
import SwipeDrawer, { type SwipeDrawerPlacement } from '../../../registry/default/swipe-drawer/SwipeDrawer.vue'

withDefaults(defineProps<{
  placement?: SwipeDrawerPlacement
  duration?: number
  threshold?: number
  closeOnBackdrop?: boolean
  lockScroll?: boolean
  disabled?: boolean
}>(), {
  placement: 'bottom',
  duration: 320,
  threshold: 0.3,
  closeOnBackdrop: true,
  lockScroll: true,
  disabled: false,
})

const isOpen = ref(false)
const productNews = ref(true)
const securityAlerts = ref(true)
const status = ref('Account settings are ready.')

function save(close: () => void): void {
  status.value = 'Preferences saved successfully.'
  close()
}
</script>

<template>
  <div class="relative flex min-h-[520px] w-full items-center justify-center overflow-hidden rounded-3xl border border-border bg-[#f3f0e8] p-5 text-[#191a17] sm:min-h-[580px] sm:p-10">
    <div class="pointer-events-none absolute inset-0 opacity-70 [background-image:radial-gradient(circle_at_16%_12%,var(--registry-accent,#d9ff57)_0,transparent_28%),radial-gradient(circle_at_86%_82%,#b7c7ff_0,transparent_30%)]" />
    <div class="relative w-full max-w-md rounded-[28px] border border-black/10 bg-white/75 p-5 shadow-[0_24px_70px_rgb(38_38_30/0.12)] backdrop-blur-xl sm:p-7">
      <div class="flex items-center gap-4">
        <div class="grid size-12 shrink-0 place-items-center rounded-2xl bg-[#191a17] text-sm font-bold text-brand">AK</div>
        <div class="min-w-0 flex-1">
          <p class="truncate font-semibold tracking-tight">Alex Kim</p>
          <p class="truncate text-xs text-black/45">alex@northstar.design</p>
        </div>
        <span class="rounded-full bg-brand px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-brand-foreground">Pro</span>
      </div>

      <div class="my-6 grid grid-cols-3 gap-2 border-y border-black/10 py-4 text-center">
        <div><strong class="block text-lg">12</strong><span class="text-[10px] text-black/40">Projects</span></div>
        <div><strong class="block text-lg">4.8k</strong><span class="text-[10px] text-black/40">Views</span></div>
        <div><strong class="block text-lg">86%</strong><span class="text-[10px] text-black/40">Complete</span></div>
      </div>

      <div class="flex items-center justify-between gap-4">
        <div>
          <p class="text-sm font-medium">Account controls</p>
          <p class="mt-0.5 text-xs text-black/40">Profile, security and updates</p>
        </div>
        <SwipeDrawer
          v-model="isOpen"
          title="Account settings"
          description="Manage your profile and notification preferences."
          :placement="placement"
          :duration="duration"
          :threshold="threshold"
          :close-on-backdrop="closeOnBackdrop"
          :lock-scroll="lockScroll"
          :disabled="disabled"
          @open="status = 'Opening account settings.'"
          @opened="status = 'Account settings opened.'"
          @close="status = 'Closing account settings.'"
          @closed="status = 'Account settings closed.'"
        >
          <template #trigger>
            Settings
            <svg class="ml-2 size-4 fill-none stroke-current stroke-2" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M4 10h12m-4-4 4 4-4 4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </template>

          <template #default="{ close }">
            <div class="space-y-6 p-5 sm:p-7">
              <section aria-labelledby="profile-heading">
                <div class="mb-4 flex items-center justify-between gap-4">
                  <div>
                    <h3 id="profile-heading" class="text-sm font-semibold">Profile details</h3>
                    <p class="mt-0.5 text-xs text-muted-foreground">Shown to people in your workspace.</p>
                  </div>
                  <span class="grid size-10 place-items-center rounded-full bg-brand text-xs font-bold text-brand-foreground">AK</span>
                </div>
                <div class="grid gap-4 sm:grid-cols-2">
                  <label class="grid gap-1.5 text-xs font-medium">
                    Display name
                    <input value="Alex Kim" class="h-11 rounded-xl border border-border bg-muted/30 px-3 text-sm outline-none focus:border-foreground/40 focus:ring-4 focus:ring-primary/10">
                  </label>
                  <label class="grid gap-1.5 text-xs font-medium">
                    Role
                    <input value="Product designer" class="h-11 rounded-xl border border-border bg-muted/30 px-3 text-sm outline-none focus:border-foreground/40 focus:ring-4 focus:ring-primary/10">
                  </label>
                </div>
              </section>

              <section class="border-t border-border pt-5" aria-labelledby="notifications-heading">
                <h3 id="notifications-heading" class="text-sm font-semibold">Notifications</h3>
                <div class="mt-3 divide-y divide-border rounded-2xl border border-border">
                  <label class="flex cursor-pointer items-center gap-4 p-4">
                    <span class="min-w-0 flex-1"><strong class="block text-sm font-medium">Product news</strong><span class="text-xs text-muted-foreground">A monthly digest of new features.</span></span>
                    <input v-model="productNews" type="checkbox" class="size-4 accent-foreground">
                  </label>
                  <label class="flex cursor-pointer items-center gap-4 p-4">
                    <span class="min-w-0 flex-1"><strong class="block text-sm font-medium">Security alerts</strong><span class="text-xs text-muted-foreground">Important sign-in and account notices.</span></span>
                    <input v-model="securityAlerts" type="checkbox" class="size-4 accent-foreground">
                  </label>
                </div>
              </section>

              <div class="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
                <button type="button" class="rounded-full border border-border px-5 py-2.5 text-sm font-medium outline-none hover:bg-muted focus-visible:ring-4 focus-visible:ring-primary/15" @click="close">Cancel</button>
                <button type="button" class="rounded-full bg-foreground px-5 py-2.5 text-sm font-semibold text-background outline-none hover:bg-foreground/85 focus-visible:ring-4 focus-visible:ring-primary/20" @click="save(close)">Save preferences</button>
              </div>
            </div>
          </template>
        </SwipeDrawer>
      </div>
    </div>

    <p data-testid="swipe-drawer-status" class="absolute bottom-4 left-1/2 w-[calc(100%_-_2rem)] -translate-x-1/2 text-center text-xs text-black/45" aria-live="polite">
      {{ status }}
    </p>
  </div>
</template>
