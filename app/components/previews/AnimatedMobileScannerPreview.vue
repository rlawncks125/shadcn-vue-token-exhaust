<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileScanner, { type AnimatedMobileScannerState } from '#registry/default/animated-mobile-scanner/AnimatedMobileScanner.vue'
withDefaults(defineProps<{ state?: AnimatedMobileScannerState, duration?: number, allowTorch?: boolean, allowFlip?: boolean, allowGallery?: boolean, disabled?: boolean, managed?: boolean }>(), { state: 'scanning', duration: 300, allowTorch: true, allowFlip: true, allowGallery: true, disabled: false, managed: false })
const torch = ref(false)
const status = ref('Scanner ready.')
</script>
<template>
  <div class="w-full max-w-sm"><AnimatedMobileScanner v-model:torch="torch" :state="state" result="FIELD-ROUTE-04" :duration="duration" :allow-torch="allowTorch" :allow-flip="allowFlip" :allow-gallery="allowGallery" :disabled="disabled" :managed="managed" @torch="value => status = value ? 'Torch enabled.' : 'Torch disabled.'" @flip="status = 'Camera flipped.'" @gallery="status = 'Gallery requested.'" @retry="status = 'Retry requested.'" @close="status = 'Scanner closed.'" @camera-start="status = 'Camera started.'" @camera-error="message => status = message" @detected="value => status = `Detected ${value}.`" /><p data-testid="scanner-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div>
</template>
