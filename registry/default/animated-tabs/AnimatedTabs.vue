<script setup lang="ts">
import { TabsContent, TabsIndicator, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'

export interface AnimatedTab {
  value: string
  label: string
  content?: string
  disabled?: boolean
}

withDefaults(defineProps<{
  items: AnimatedTab[]
  defaultValue?: string
  label?: string
  accent?: string
}>(), {
  label: 'Sections',
  accent: 'var(--registry-accent, #d9ff57)',
})
const model = defineModel<string>()
</script>

<template>
  <TabsRoot v-model="model" :default-value="defaultValue ?? items.find(item => !item.disabled)?.value" class="animated-tabs w-full max-w-[480px] text-[#171814]" :style="{ '--tabs-accent': accent }">
    <TabsList class="animated-tabs-list relative flex w-max max-w-full gap-1 overflow-x-auto rounded-full border border-[#1718141a] bg-[#e2e2da] p-1.5" :aria-label="label">
      <TabsIndicator class="animated-tabs-indicator absolute top-1.5 left-0 h-[calc(100%_-_12px)] w-[var(--reka-tabs-indicator-size)] translate-x-[var(--reka-tabs-indicator-position)] rounded-full bg-[var(--tabs-accent)] transition-[transform,width] duration-300 ease-[cubic-bezier(.16,1,.3,1)] motion-reduce:transition-none" />
      <TabsTrigger
        v-for="item in items" :key="item.value" :value="item.value" :disabled="item.disabled"
        class="animated-tabs-trigger relative shrink-0 cursor-pointer rounded-full border-0 bg-transparent px-[18px] py-2.5 [font:inherit] text-[13px] font-semibold text-[#17181499] data-[state=active]:text-[#171814] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#171814] disabled:cursor-not-allowed disabled:opacity-35"
      >
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="item in items" :key="item.value" :value="item.value"
      class="animated-tabs-content mt-5 min-h-[130px] animate-in rounded-[20px] border border-[#1718141a] bg-[#ffffffb3] p-6 text-sm leading-[1.8] fade-in slide-in-from-top-1 duration-200 ease-out focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-[#171814] motion-reduce:animate-none"
    >
      <slot :name="item.value" :item="item">{{ item.content }}</slot>
    </TabsContent>
  </TabsRoot>
</template>
