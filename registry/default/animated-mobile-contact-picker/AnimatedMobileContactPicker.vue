<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'

export type AnimatedMobileContactField = 'name' | 'email' | 'tel' | 'address' | 'icon'
export interface AnimatedMobileContact {
  name?: string[]
  email?: string[]
  tel?: string[]
  address?: unknown[]
  icon?: Blob[]
}
const props = withDefaults(defineProps<{
  modelValue?: AnimatedMobileContact[]
  fields?: AnimatedMobileContactField[]
  multiple?: boolean
  title?: string
  description?: string
  buttonLabel?: string
  emptyLabel?: string
  duration?: number
  disabled?: boolean
}>(), {
  modelValue: () => [],
  fields: () => ['name', 'email', 'tel'],
  multiple: false,
  title: 'Choose a contact',
  description: 'Select from your device without uploading your address book.',
  buttonLabel: 'Open contacts',
  emptyLabel: 'No contact selected',
  duration: 260,
  disabled: false,
})
const emit = defineEmits<{
  'update:modelValue': [contacts: AnimatedMobileContact[]]
  select: [contacts: AnimatedMobileContact[]]
  clear: []
  cancel: []
  error: [message: string]
  unsupported: []
}>()
type ContactManager = { select: (properties: AnimatedMobileContactField[], options: { multiple: boolean }) => Promise<AnimatedMobileContact[]>, getProperties?: () => Promise<AnimatedMobileContactField[]> }
const state = ref<'idle' | 'requesting' | 'selected' | 'unsupported' | 'error'>('idle')
const errorMessage = ref('')
const supportedFields = ref<AnimatedMobileContactField[]>([])
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.min(1200, Math.max(0, props.duration)) : 260)
const contacts = computed(() => props.modelValue)
const manager = () => (navigator as Navigator & { contacts?: ContactManager }).contacts
const availableFields = computed(() => supportedFields.value.length ? props.fields.filter(field => supportedFields.value.includes(field)) : props.fields)
function primary(contact: AnimatedMobileContact) { return contact.name?.[0] || contact.email?.[0] || contact.tel?.[0] || 'Unnamed contact' }
function secondary(contact: AnimatedMobileContact) { return contact.tel?.[0] || contact.email?.[0] || 'No phone or email shared' }
function initials(contact: AnimatedMobileContact) { return primary(contact).split(/\s+/).slice(0, 2).map(value => value[0]?.toUpperCase()).join('') || '?' }
async function pick() {
  if (props.disabled || state.value === 'requesting' || typeof navigator === 'undefined') return false
  const contactsApi = manager()
  if (!contactsApi?.select) { state.value = 'unsupported'; emit('unsupported'); return false }
  try {
    state.value = 'requesting'; errorMessage.value = ''
    const result = await contactsApi.select(availableFields.value, { multiple: props.multiple })
    if (!result.length) { state.value = contacts.value.length ? 'selected' : 'idle'; emit('cancel'); return false }
    state.value = 'selected'; emit('update:modelValue', result); emit('select', result); return true
  }
  catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') { state.value = contacts.value.length ? 'selected' : 'idle'; emit('cancel'); return false }
    errorMessage.value = error instanceof Error ? error.message : 'Contact selection failed.'
    state.value = 'error'; emit('error', errorMessage.value); return false
  }
}
function clear() { if (props.disabled || !contacts.value.length) return false; emit('update:modelValue', []); emit('clear'); state.value = 'idle'; return true }
onMounted(async () => {
  const contactsApi = manager()
  if (!contactsApi?.select) { state.value = 'unsupported'; emit('unsupported'); return }
  if (contactsApi.getProperties) { try { supportedFields.value = await contactsApi.getProperties() } catch { supportedFields.value = [] } }
  if (contacts.value.length) state.value = 'selected'
})
defineExpose({ pick, clear, state, supportedFields })
</script>

<template>
  <section data-testid="animated-mobile-contact-picker" class="w-full rounded-[28px] border border-black/10 bg-[#f5f0e6] p-5 text-[#1b1d19] shadow-[0_22px_60px_-42px_rgba(0,0,0,.55)]" :style="{ '--contact-duration': `${safeDuration}ms` }">
    <div class="flex items-start justify-between gap-4"><div><p class="text-[9px] font-bold uppercase tracking-[.18em] text-black/35">Device contacts</p><h3 class="mt-2 text-xl font-semibold tracking-[-.03em]">{{ title }}</h3><p class="mt-2 text-xs leading-5 text-black/45">{{ description }}</p></div><span class="grid size-11 shrink-0 place-items-center rounded-[15px] bg-[#d9ff57] text-lg" aria-hidden="true">＋</span></div>

    <div class="mt-6 min-h-20 rounded-[20px] bg-white/65 p-3">
      <TransitionGroup v-if="contacts.length" name="contact" tag="ul" class="space-y-2" aria-label="Selected contacts">
        <li v-for="(contact, index) in contacts" :key="`${primary(contact)}-${index}`" class="flex items-center gap-3 rounded-[15px] border border-black/6 bg-white p-3">
          <span class="grid size-10 shrink-0 place-items-center rounded-full bg-[#1b1d19] text-[10px] font-bold text-white">{{ initials(contact) }}</span><span class="min-w-0 flex-1"><strong class="block truncate text-xs">{{ primary(contact) }}</strong><span class="mt-1 block truncate text-[10px] text-black/42">{{ secondary(contact) }}</span></span>
        </li>
      </TransitionGroup>
      <div v-else class="grid min-h-14 place-items-center text-center"><span class="text-xs text-black/35">{{ state === 'unsupported' ? 'Contact Picker is not supported' : state === 'error' ? errorMessage : emptyLabel }}</span></div>
    </div>

    <div class="mt-4 grid gap-2" :class="contacts.length ? 'grid-cols-[1fr_auto]' : 'grid-cols-1'">
      <button type="button" data-testid="contact-picker-open" class="min-h-12 rounded-[17px] bg-[#1b1d19] px-5 text-xs font-bold text-white outline-none transition-transform active:not-disabled:scale-[.98] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || state === 'requesting' || state === 'unsupported'" @click="pick">{{ state === 'requesting' ? 'Opening contacts…' : contacts.length ? 'Choose again' : buttonLabel }}</button>
      <button v-if="contacts.length" type="button" data-testid="contact-picker-clear" class="min-h-12 rounded-[17px] border border-black/10 px-4 text-xs font-semibold outline-none focus-visible:ring-2 focus-visible:ring-black disabled:opacity-35" :disabled="disabled" @click="clear">Clear</button>
    </div>
    <p class="mt-4 text-center text-[9px] leading-4 text-black/35" aria-live="polite">Only the fields you approve are returned to this page.</p>
  </section>
</template>

<style scoped>
.contact-enter-active,.contact-leave-active { transition: opacity var(--contact-duration) ease, transform var(--contact-duration) cubic-bezier(.2,.8,.2,1); }
.contact-enter-from,.contact-leave-to { opacity: 0; transform: translateY(8px) scale(.98); }
@media (prefers-reduced-motion: reduce) { .contact-enter-active,.contact-leave-active { transition: none !important; } }
</style>
