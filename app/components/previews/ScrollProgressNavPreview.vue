<script setup lang="ts">
import { ref } from "vue";
import ScrollProgressNav, {
  type ScrollProgressNavChangeSource,
  type ScrollProgressNavItem,
} from "../../../registry/default/scroll-progress-nav/ScrollProgressNav.vue";

const props = withDefaults(
  defineProps<{
    height?: number | string;
    smooth?: boolean;
    duration?: number;
    disabled?: boolean;
  }>(),
  {
    height: 460,
    smooth: true,
    duration: 420,
    disabled: false,
  },
);

const items: ScrollProgressNavItem[] = [
  { id: "release-overview", label: "Overview" },
  { id: "release-workflows", label: "Workflows" },
  { id: "release-details", label: "Details" },
  { id: "release-notes", label: "Notes" },
];

const active = ref("release-overview");
const readingProgress = ref(0);
const status = ref("Overview is in view.");

function handleChange(
  item: ScrollProgressNavItem,
  _index: number,
  source: ScrollProgressNavChangeSource,
) {
  status.value = `${item.label} is in view${source === "scroll" ? "." : ` via ${source}.`}`;
}
</script>

<template>
  <div
    class="w-full overflow-hidden rounded-2xl border border-border bg-[#e9e5dc] p-4 sm:p-7 lg:p-10"
  >
    <div
      class="mx-auto max-w-5xl rounded-[1.75rem] border border-black/10 bg-[#f8f6f0] p-4 shadow-[0_28px_80px_-45px_rgba(40,32,22,0.5)] sm:p-6"
    >
      <header
        class="mb-6 flex flex-col gap-4 border-b border-black/10 pb-6 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <p
            class="text-[10px] font-bold uppercase tracking-[0.24em] text-[#8b5e3c]"
          >
            Product journal / 2.8
          </p>
          <h3
            class="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#24211d] sm:text-3xl"
          >
            A quieter, faster workspace.
          </h3>
        </div>
        <div
          class="flex items-center gap-3 text-[11px] font-medium text-black/45"
        >
          <span>{{ Math.round(readingProgress * 100) }}% read</span>
          <span class="h-px w-10 bg-black/15" />
          <span>September 2026</span>
        </div>
      </header>

      <ScrollProgressNav
        v-model="active"
        :items="items"
        :height="props.height"
        :smooth="smooth"
        :duration="duration"
        :disabled="disabled"
        label="Release note sections"
        @change="handleChange"
        @progress="readingProgress = $event"
      >
        <section
          id="release-overview"
          data-scroll-section
          class="min-h-[330px] border-b border-black/10 p-6 sm:p-9"
        >
          <div
            class="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5e3c]"
          >
            <span class="size-1.5 rounded-full bg-[#d56b3f]" />
            Release 2.8
          </div>
          <h4
            class="mt-12 max-w-xl text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-[#24211d] sm:text-4xl"
          >
            Less time arranging work. More time moving it forward.
          </h4>
          <p class="mt-5 max-w-xl text-sm leading-7 text-black/55">
            This release brings structure to the moments between planning and
            shipping, with clearer ownership, faster handoffs, and a calmer
            daily view.
          </p>
          <div class="mt-8 flex flex-wrap gap-2">
            <span
              class="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-black/55"
              >12 improvements</span
            >
            <span
              class="rounded-full border border-black/10 bg-white/60 px-3 py-1.5 text-[10px] font-semibold text-black/55"
              >4 new workflows</span
            >
          </div>
        </section>

        <section
          id="release-workflows"
          data-scroll-section
          class="min-h-[360px] border-b border-black/10 p-6 sm:p-9"
        >
          <p class="font-mono text-[10px] text-black/35">01 / WORKFLOWS</p>
          <div class="mt-6 grid gap-8 sm:grid-cols-[1fr_0.8fr]">
            <div>
              <h4
                class="text-2xl font-semibold tracking-[-0.035em] text-[#24211d]"
              >
                Approvals now stay with the work.
              </h4>
              <p class="mt-4 text-sm leading-7 text-black/55">
                Review requests, decisions, and context live in one timeline.
                The next owner sees what changed without opening another tool.
              </p>
            </div>
            <div class="rounded-2xl bg-[#24211d] p-5 text-[#f8f6f0]">
              <p
                class="text-[9px] font-bold uppercase tracking-[0.18em] text-white/40"
              >
                Approval path
              </p>
              <ol class="mt-6 space-y-4 text-xs">
                <li class="flex items-center gap-3">
                  <span
                    class="grid size-6 place-items-center rounded-full bg-[#d56b3f] text-[9px]"
                    >01</span
                  >Editorial review
                </li>
                <li class="flex items-center gap-3">
                  <span
                    class="grid size-6 place-items-center rounded-full bg-white/10 text-[9px]"
                    >02</span
                  >Brand approval
                </li>
                <li class="flex items-center gap-3 text-white/45">
                  <span
                    class="grid size-6 place-items-center rounded-full border border-white/15 text-[9px]"
                    >03</span
                  >Publish
                </li>
              </ol>
            </div>
          </div>
        </section>

        <section
          id="release-details"
          data-scroll-section
          class="min-h-[350px] border-b border-black/10 p-6 sm:p-9"
        >
          <p class="font-mono text-[10px] text-black/35">02 / DETAILS</p>
          <h4
            class="mt-6 text-2xl font-semibold tracking-[-0.035em] text-[#24211d]"
          >
            Small changes, felt everywhere.
          </h4>
          <div
            class="mt-7 grid gap-px overflow-hidden rounded-2xl border border-black/10 bg-black/10 sm:grid-cols-2"
          >
            <article class="bg-[#f8f6f0] p-5">
              <p class="text-xs font-semibold text-[#24211d]">Command search</p>
              <p class="mt-2 text-xs leading-5 text-black/50">
                Find projects and actions from one keyboard-first menu.
              </p>
            </article>
            <article class="bg-[#f8f6f0] p-5">
              <p class="text-xs font-semibold text-[#24211d]">Saved views</p>
              <p class="mt-2 text-xs leading-5 text-black/50">
                Share filtered views without changing a team's defaults.
              </p>
            </article>
            <article class="bg-[#f8f6f0] p-5">
              <p class="text-xs font-semibold text-[#24211d]">Faster sync</p>
              <p class="mt-2 text-xs leading-5 text-black/50">
                Updates appear across open sessions with less delay.
              </p>
            </article>
            <article class="bg-[#f8f6f0] p-5">
              <p class="text-xs font-semibold text-[#24211d]">
                Clearer history
              </p>
              <p class="mt-2 text-xs leading-5 text-black/50">
                Activity entries now group related edits into one event.
              </p>
            </article>
          </div>
        </section>

        <section
          id="release-notes"
          data-scroll-section
          class="min-h-[330px] p-6 sm:p-9"
        >
          <p class="font-mono text-[10px] text-black/35">03 / NOTES</p>
          <blockquote
            class="mt-8 max-w-xl border-l-2 border-[#d56b3f] pl-6 text-xl font-medium leading-8 tracking-[-0.02em] text-[#24211d]"
          >
            The best release is the one that disappears into the way your team
            already works.
          </blockquote>
          <p class="mt-6 max-w-xl text-sm leading-7 text-black/55">
            Version 2.8 is rolling out to all workspaces this week.
            Administrators can review the complete change log and migration
            notes before enabling new approval paths.
          </p>
          <div
            class="mt-10 flex items-center justify-between border-t border-black/10 pt-5 text-[10px] font-semibold uppercase tracking-[0.16em] text-black/40"
          >
            <span>End of update</span>
            <span>Built with care</span>
          </div>
        </section>
      </ScrollProgressNav>

      <p
        data-testid="scroll-progress-nav-status"
        class="mt-5 min-h-5 text-xs text-black/45"
        role="status"
        aria-live="polite"
      >
        {{ status }} {{ Math.round(readingProgress * 100) }}% read.
      </p>
    </div>
  </div>
</template>
