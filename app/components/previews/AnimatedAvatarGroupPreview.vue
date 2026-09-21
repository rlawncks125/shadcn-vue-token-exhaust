<script setup lang="ts">
import { computed, ref } from 'vue'
import AnimatedAvatarGroup, {
  type AnimatedAvatarGroupExpose,
  type AnimatedAvatarItem,
} from '#registry/default/animated-avatar-group/AnimatedAvatarGroup.vue'

const props = withDefaults(defineProps<{
  maxVisible?: number
  size?: number
  overlap?: number
  duration?: number
  expandable?: boolean
  disabled?: boolean
}>(), {
  maxVisible: 4,
  size: 52,
  overlap: 14,
  duration: 320,
  expandable: true,
  disabled: false,
})

const members: AnimatedAvatarItem[] = [
  { id: 'maya', name: 'Maya Chen', initials: 'MC', status: 'online' },
  { id: 'theo', name: 'Theo Martin', initials: 'TM', status: 'online' },
  { id: 'imani', name: 'Imani Brooks', initials: 'IB', status: 'busy' },
  { id: 'lucas', name: 'Lucas Silva', initials: 'LS', status: 'away' },
  { id: 'sora', name: 'Sora Kim', initials: 'SK', status: 'online' },
  { id: 'nina', name: 'Nina Patel', initials: 'NP', status: 'offline' },
  { id: 'omar', name: 'Omar Haddad', initials: 'OH', status: 'online' },
]

const roles: Record<string, string> = {
  maya: 'Launch lead',
  theo: 'Product design',
  imani: 'Brand direction',
  lucas: 'Web engineering',
  sora: 'Release operations',
  nina: 'Customer success',
  omar: 'Quality assurance',
}

const group = ref<AnimatedAvatarGroupExpose | null>(null)
const selected = ref<string | null>('maya')
const status = ref('Maya Chen is selected as launch lead.')
const expanded = ref(false)
const selectedMember = computed(() => members.find(member => member.id === selected.value) ?? null)

function handleSelect(member: AnimatedAvatarItem) {
  status.value = `${member.name} selected. ${roles[member.id]} is in the launch room.`
}

function handleExpand(value: boolean) {
  expanded.value = value
  status.value = value
    ? `All ${members.length} launch room members are visible.`
    : `${Math.min(props.maxVisible, members.length)} launch room members are visible.`
}

function resetSelection() {
  group.value?.resetSelection()
  status.value = 'Team member selection cleared.'
}

async function focusSelection() {
  if (!selected.value) {
    status.value = 'Select a team member before moving focus.'
    return
  }
  await group.value?.focusSelected()
  status.value = `Keyboard focus moved to ${selectedMember.value?.name}.`
}

function toggleMembers() {
  group.value?.toggle()
}
</script>

<template>
  <div class="flex min-h-[560px] w-full items-center justify-center overflow-hidden rounded-2xl border border-[#26322d]/10 bg-[#dfe5df] p-3 text-[#162019] sm:min-h-[640px] sm:p-8 lg:p-12">
    <section class="relative w-full max-w-4xl overflow-hidden rounded-[30px] border border-white/70 bg-[#f7f8f3] shadow-[0_34px_100px_-55px_rgba(25,47,36,0.55)]">
      <div class="pointer-events-none absolute -right-28 -top-28 size-72 rounded-full bg-[#d9ff57]/25 blur-3xl" aria-hidden="true" />
      <div class="pointer-events-none absolute -bottom-24 -left-16 size-56 rounded-full bg-[#9fc8ff]/20 blur-3xl" aria-hidden="true" />

      <header class="relative flex flex-col gap-5 border-b border-[#26322d]/10 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-8 sm:py-6">
        <div class="flex items-center gap-3">
          <span class="grid size-10 place-items-center rounded-[13px] bg-[#19231d] text-[#d9ff57] shadow-sm" aria-hidden="true">
            <svg class="size-[18px] fill-none stroke-current stroke-[1.8]" viewBox="0 0 20 20">
              <path d="M4 14.5V7.8L10 4l6 3.8v6.7L10 18l-6-3.5Z" stroke-linejoin="round" />
              <path d="m7.4 10 1.7 1.7 3.7-4" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div>
            <p class="text-sm font-semibold tracking-[-0.025em]">Atlas launch room</p>
            <p class="mt-0.5 text-[9px] font-bold uppercase tracking-[0.17em] text-[#536159]">Collaborative workspace</p>
          </div>
        </div>
        <div class="flex w-fit items-center gap-2 rounded-full border border-[#26322d]/10 bg-white/65 px-3 py-1.5 text-[10px] font-semibold text-[#496054] shadow-sm">
          <span class="size-1.5 rounded-full bg-[#35b46f] shadow-[0_0_0_3px_rgba(53,180,111,0.13)]" aria-hidden="true" />
          {{ members.filter(member => member.status === 'online').length }} online now
        </div>
      </header>

      <div class="relative grid lg:grid-cols-[minmax(0,1fr)_270px]">
        <main class="min-w-0 px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12">
          <p class="text-[10px] font-bold uppercase tracking-[0.19em] text-[#637168]">Final release review</p>
          <h3 class="mt-3 max-w-lg text-[30px] font-semibold leading-[1.05] tracking-[-0.055em] sm:text-[40px]">
            Ship together,<br />without losing the thread.
          </h3>
          <p class="mt-4 max-w-lg text-sm leading-6 text-[#627068]">
            Seven collaborators are clearing the last details before Atlas goes live. Choose a teammate to see who owns the room.
          </p>

          <div class="mt-8 rounded-[22px] border border-[#26322d]/10 bg-white/70 p-4 shadow-[0_18px_45px_-38px_rgba(25,47,36,0.65)] sm:flex sm:items-center sm:justify-between sm:gap-6 sm:p-5">
            <div>
              <p class="text-[9px] font-bold uppercase tracking-[0.16em] text-[#6c786f]">In this room</p>
              <p class="mt-1 text-xs font-medium text-[#34443a]">Select a collaborator</p>
            </div>
            <AnimatedAvatarGroup
              ref="group"
              v-model="selected"
              class="mt-4 sm:mt-0"
              :items="members"
              :max-visible="maxVisible"
              :size="size"
              :overlap="overlap"
              :duration="duration"
              :expandable="expandable"
              :disabled="disabled"
              @select="handleSelect"
              @expand="handleExpand"
            />
          </div>

          <div class="mt-5 flex min-h-[58px] items-center gap-3 border-l-2 border-[#d9ff57] pl-4">
            <template v-if="selectedMember">
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-semibold tracking-[-0.02em]">{{ selectedMember.name }}</p>
                <p class="mt-0.5 text-[11px] text-[#69756d]">{{ roles[selectedMember.id] }} - {{ selectedMember.status }}</p>
              </div>
              <span class="rounded-full bg-[#e8eddf] px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.11em] text-[#52604f]">Assigned</span>
            </template>
            <p v-else class="text-xs text-[#69756d]">No collaborator selected.</p>
          </div>
        </main>

        <aside class="relative flex flex-col justify-between overflow-hidden bg-[#1d2821] p-6 text-white sm:p-8 lg:min-h-[430px]">
          <div class="pointer-events-none absolute -right-14 -top-14 size-44 rounded-full border-[28px] border-[#d9ff57] opacity-[0.07]" aria-hidden="true" />
          <div class="relative">
            <div class="flex items-center justify-between gap-3">
              <p class="text-[9px] font-bold uppercase tracking-[0.18em] text-[#d9ff57]">Launch readiness</p>
              <span class="font-mono text-[10px] text-white/40">T-02:18</span>
            </div>
            <p class="mt-6 text-4xl font-semibold tracking-[-0.06em]">94<span class="text-lg text-white/35">%</span></p>
            <div class="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10" aria-hidden="true">
              <span class="block h-full w-[94%] rounded-full bg-[#d9ff57]" />
            </div>

            <ol class="mt-8 space-y-4 text-[11px]">
              <li class="flex items-center justify-between gap-4"><span class="text-white/50">Build verified</span><span class="font-semibold text-[#d9ff57]">Complete</span></li>
              <li class="flex items-center justify-between gap-4"><span class="text-white/50">Release notes</span><span class="font-semibold text-[#d9ff57]">Complete</span></li>
              <li class="flex items-center justify-between gap-4"><span class="text-white/50">Final approval</span><span class="font-semibold">In review</span></li>
            </ol>
          </div>

          <div class="relative mt-9 border-t border-white/10 pt-5">
            <div data-testid="animated-avatar-group-controls" class="grid grid-cols-3 gap-2">
              <button type="button" class="rounded-xl border border-white/12 bg-white/[0.06] px-2 py-2.5 text-[10px] font-semibold text-white/75 outline-none transition hover:not-disabled:bg-white/10 hover:not-disabled:text-white focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || !expandable" @click="toggleMembers">
                {{ expanded ? 'Collapse' : 'Expand' }}
              </button>
              <button type="button" class="rounded-xl border border-white/12 bg-white/[0.06] px-2 py-2.5 text-[10px] font-semibold text-white/75 outline-none transition hover:not-disabled:bg-white/10 hover:not-disabled:text-white focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || !selected" @click="focusSelection">Focus</button>
              <button type="button" class="rounded-xl border border-white/12 bg-white/[0.06] px-2 py-2.5 text-[10px] font-semibold text-white/75 outline-none transition hover:not-disabled:bg-white/10 hover:not-disabled:text-white focus-visible:ring-2 focus-visible:ring-[#d9ff57] disabled:cursor-not-allowed disabled:opacity-35 motion-reduce:transition-none" :disabled="disabled || !selected" @click="resetSelection">Reset</button>
            </div>
            <p data-testid="animated-avatar-group-status" class="mt-4 min-h-10 text-[10px] leading-5 text-white/40" role="status" aria-live="polite" aria-atomic="true">
              {{ status }}
            </p>
          </div>
        </aside>
      </div>
    </section>
  </div>
</template>
