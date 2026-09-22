<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileOnboardingPager, { type AnimatedMobileOnboardingStep } from '#registry/default/animated-mobile-onboarding-pager/AnimatedMobileOnboardingPager.vue'

withDefaults(defineProps<{ duration?: number, swipeThreshold?: number, swipe?: boolean, showSkip?: boolean, showBack?: boolean, showProgress?: boolean, safeArea?: boolean, disabled?: boolean }>(), { duration: 320, swipeThreshold: 72, swipe: true, showSkip: true, showBack: true, showProgress: true, safeArea: true, disabled: false })
const active = ref('collect')
const status = ref('Step 1 selected.')
const steps: AnimatedMobileOnboardingStep[] = [
  { id: 'collect', eyebrow: 'Field practice', title: 'Collect what catches your eye.', description: 'Save fragments, sounds, and places before the detail disappears.', icon: '01', accent: '#d9ff57' },
  { id: 'connect', eyebrow: 'Living archive', title: 'Find the thread between notes.', description: 'Filters and links turn scattered observations into a useful map.', icon: '02', accent: '#e4633f' },
  { id: 'carry', eyebrow: 'Ready offline', title: 'Take the archive outside.', description: 'Keep the essentials close even when the signal is far away.', icon: '03', accent: '#83b9ac' },
]
</script>

<template>
  <section data-testid="animated-mobile-onboarding-pager-preview" class="grid min-h-[650px] w-full max-w-[760px] place-items-center overflow-hidden rounded-[30px] border border-black/10 bg-[#d8d3c5] p-3 sm:p-8">
    <div class="w-full max-w-[390px]">
      <AnimatedMobileOnboardingPager v-model="active" :steps="steps" :duration="duration" :swipe-threshold="swipeThreshold" :swipe="swipe" :show-skip="showSkip" :show-back="showBack" :show-progress="showProgress" :safe-area="safeArea" :disabled="disabled" @change="(_, index) => status = `Step ${index + 1} selected.`" @skip="status = 'Onboarding skipped.'" @complete="status = 'Onboarding completed.'" />
      <p data-testid="onboarding-status" class="mt-3 text-center text-[10px] text-black/42" role="status" aria-live="polite">{{ status }}</p>
    </div>
  </section>
</template>
