<script setup lang="ts">
import { ref } from 'vue'
import AnimatedMobileBluetoothPairing from '#registry/default/animated-mobile-bluetooth-pairing/AnimatedMobileBluetoothPairing.vue'
withDefaults(defineProps<{ autoConnect?: boolean, disconnectOnUnmount?: boolean, duration?: number, disabled?: boolean }>(), { autoConnect: true, disconnectOnUnmount: true, duration: 280, disabled: false })
const status = ref('Tap Choose device to open the real Bluetooth picker.')
</script>
<template>
  <section class="grid min-h-[560px] w-full max-w-[760px] place-items-center rounded-[30px] border border-black/10 bg-[#aebfb8] p-5 sm:p-9"><div class="w-full max-w-sm"><div class="mb-5 px-2"><p class="text-[9px] font-bold uppercase tracking-[.2em] text-black/35">Nearby equipment</p><h3 class="mt-2 text-3xl font-semibold tracking-[-.05em]">Pair a field sensor.</h3></div><AnimatedMobileBluetoothPairing name-prefix="FIELD-" :optional-services="['battery_service']" :auto-connect="autoConnect" :disconnect-on-unmount="disconnectOnUnmount" :duration="duration" :disabled="disabled" @select="device => status = `${device.name} selected.`" @connected="device => status = `${device.name} connected.`" @disconnect="(device, reason) => status = `${device.name} disconnected: ${reason}.`" @cancel="status = 'Device picker cancelled.'" @unsupported="status = 'Web Bluetooth is unavailable.'" @error="message => status = message" /><p data-testid="bluetooth-preview-status" class="mt-4 text-center text-[10px] text-black/42" role="status">{{ status }}</p></div></section>
</template>
