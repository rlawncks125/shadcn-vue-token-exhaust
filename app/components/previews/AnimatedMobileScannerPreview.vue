<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedMobileScanner, { type AnimatedMobileScannerState } from '#registry/default/animated-mobile-scanner/AnimatedMobileScanner.vue'
const props = withDefaults(defineProps<{ state?: AnimatedMobileScannerState, duration?: number, allowTorch?: boolean, allowFlip?: boolean, allowGallery?: boolean, disabled?: boolean, managed?: boolean }>(), { state: 'scanning', duration: 300, allowTorch: true, allowFlip: true, allowGallery: true, disabled: false, managed: false })
const torch = ref(false)
const cameraEnabled = ref(false)
const status = ref('Scanner ready.')
const useCamera = computed(() => props.managed || cameraEnabled.value)
</script>
<template>
  <div class="w-full max-w-sm">
    <button v-if="!useCamera" type="button" data-testid="scanner-enable-camera" class="mx-auto mb-4 block min-h-11 rounded-full bg-black px-5 text-xs font-semibold text-white" @click="cameraEnabled = true">Enable real camera</button>
    <AnimatedMobileScanner v-model:torch="torch" :state="state" result="FIELD-ROUTE-04" :duration="duration" :allow-torch="allowTorch" :allow-flip="allowFlip" :allow-gallery="allowGallery" :disabled="disabled" :managed="useCamera" @torch="value => status = value ? 'Torch enabled.' : 'Torch disabled.'" @flip="status = 'Camera flipped.'" @gallery="status = 'Gallery requested.'" @retry="status = 'Retry requested.'" @close="status = 'Scanner closed.'" @camera-start="status = 'Camera started.'" @camera-error="message => status = message" @detected="value => status = `Detected ${value}.`" />
    <p data-testid="scanner-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p>
  </div>
</template>
