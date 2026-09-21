<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

export interface AnimatedEditableTableColumn {
  key: string
  label: string
  type?: 'text' | 'number' | 'select'
  options?: Array<{ value: string; label: string }>
  editable?: boolean
  width?: string
}

export type AnimatedEditableTableRow = Record<string, unknown>

const props = withDefaults(defineProps<{
  columns: AnimatedEditableTableColumn[]
  modelValue: AnimatedEditableTableRow[]
  rowKey?: string
  label?: string
  duration?: number
  disabled?: boolean
  removable?: boolean
}>(), {
  rowKey: 'id',
  label: 'Editable data table',
  duration: 220,
  disabled: false,
  removable: true,
})

const emit = defineEmits<{
  'update:modelValue': [rows: AnimatedEditableTableRow[]]
  change: [row: AnimatedEditableTableRow, column: AnimatedEditableTableColumn, value: unknown, previous: unknown]
  remove: [row: AnimatedEditableTableRow, index: number]
}>()

const active = ref({ row: 0, column: 0 })
const editing = ref<{ row: number; column: number } | null>(null)
const draft = ref<unknown>('')
const cellElements = new Map<string, HTMLElement>()
const editor = ref<HTMLInputElement | HTMLSelectElement | null>(null)
const initialRows = props.modelValue.map(row => ({ ...row }))
const safeDuration = computed(() => Number.isFinite(props.duration) ? Math.max(0, Math.min(2000, props.duration)) : 220)
const editableColumns = computed(() => props.columns.filter(column => column.key.trim()))

function cellKey(row: number, column: number) {
  return `${row}:${column}`
}

function setCellElement(element: unknown, row: number, column: number) {
  if (element instanceof HTMLElement) cellElements.set(cellKey(row, column), element)
  else cellElements.delete(cellKey(row, column))
}

function setEditor(element: unknown) {
  editor.value = element instanceof HTMLInputElement || element instanceof HTMLSelectElement ? element : null
}

async function focusCell(row = active.value.row, column = active.value.column) {
  if (!props.modelValue.length || !editableColumns.value.length) return false
  active.value = {
    row: Math.max(0, Math.min(props.modelValue.length - 1, row)),
    column: Math.max(0, Math.min(editableColumns.value.length - 1, column)),
  }
  await nextTick()
  cellElements.get(cellKey(active.value.row, active.value.column))?.focus()
  return true
}

async function startEdit(row: number, column: number) {
  const definition = editableColumns.value[column]
  if (props.disabled || definition?.editable === false) return false
  draft.value = props.modelValue[row]?.[definition!.key] ?? ''
  editing.value = { row, column }
  await nextTick()
  editor.value?.focus()
  if (editor.value instanceof HTMLInputElement) editor.value.select()
  return true
}

function normalizedDraft(column: AnimatedEditableTableColumn) {
  if (column.type !== 'number') return String(draft.value ?? '')
  const number = Number(draft.value)
  return Number.isFinite(number) ? number : 0
}

function commit() {
  if (!editing.value) return false
  const { row, column } = editing.value
  const definition = editableColumns.value[column]
  const current = props.modelValue[row]
  if (!definition || !current) return false
  const value = normalizedDraft(definition)
  const previous = current[definition.key]
  editing.value = null
  if (value !== previous) {
    const rows = props.modelValue.map((item, index) => index === row ? { ...item, [definition.key]: value } : { ...item })
    emit('update:modelValue', rows)
    emit('change', rows[row]!, definition, value, previous)
  }
  void focusCell(row, column)
  return value !== previous
}

function cancel() {
  if (!editing.value) return
  const position = editing.value
  editing.value = null
  void focusCell(position.row, position.column)
}

function removeRow(index: number) {
  const row = props.modelValue[index]
  if (props.disabled || !props.removable || !row) return false
  emit('update:modelValue', props.modelValue.filter((_, rowIndex) => rowIndex !== index).map(item => ({ ...item })))
  emit('remove', row, index)
  void focusCell(Math.min(index, props.modelValue.length - 2), active.value.column)
  return true
}

function reset() {
  if (props.disabled) return false
  editing.value = null
  emit('update:modelValue', initialRows.map(row => ({ ...row })))
  void focusCell(0, 0)
  return true
}

function onCellKeydown(event: KeyboardEvent, row: number, column: number) {
  if (props.disabled) return
  if (event.key === 'Enter' || event.key === 'F2') {
    event.preventDefault()
    void startEdit(row, column)
    return
  }
  const movement: Record<string, [number, number]> = {
    ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1],
  }
  if (movement[event.key]) {
    event.preventDefault()
    const [rowDelta, columnDelta] = movement[event.key]!
    void focusCell(row + rowDelta, column + columnDelta)
  }
  else if (event.key === 'Home') {
    event.preventDefault()
    void focusCell(event.ctrlKey || event.metaKey ? 0 : row, 0)
  }
  else if (event.key === 'End') {
    event.preventDefault()
    void focusCell(event.ctrlKey || event.metaKey ? props.modelValue.length - 1 : row, editableColumns.value.length - 1)
  }
}

function onEditorKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter') { event.preventDefault(); commit() }
  else if (event.key === 'Escape') { event.preventDefault(); cancel() }
}

defineExpose({ focusCell, startEdit, commit, cancel, removeRow, reset })
</script>

<template>
  <div data-testid="animated-editable-table" class="animated-editable-table min-w-0" :style="{ '--editable-table-duration': `${safeDuration}ms` }">
    <div class="editable-table-scroll max-w-full overflow-x-auto rounded-[22px] border border-[#20251f]/12 bg-[#fbfaf5] shadow-[0_24px_60px_-42px_rgba(32,37,31,.7)]">
      <table class="w-full min-w-[700px] border-collapse text-left" :aria-label="label">
        <thead>
          <tr class="border-b border-[#20251f]/10 bg-[#20251f] text-white">
            <th v-for="column in editableColumns" :key="column.key" scope="col" class="px-4 py-3 text-[9px] font-bold uppercase tracking-[.15em] text-white/55" :style="{ width: column.width }">{{ column.label }}</th>
            <th v-if="removable" scope="col" class="w-16 px-3"><span class="sr-only">Row actions</span></th>
          </tr>
        </thead>
        <TransitionGroup tag="tbody" name="editable-row">
          <tr v-for="(row, rowIndex) in modelValue" :key="String(row[rowKey] ?? rowIndex)" class="border-b border-[#20251f]/8 last:border-b-0">
            <td v-for="(column, columnIndex) in editableColumns" :key="column.key" class="p-1.5">
              <div v-if="editing?.row === rowIndex && editing.column === columnIndex" class="rounded-xl bg-[#d9ff57]/35 p-1">
                <select v-if="column.type === 'select'" :ref="setEditor" v-model="draft" data-testid="editable-table-editor" class="h-10 w-full rounded-lg border border-[#20251f]/20 bg-white px-2 text-xs outline-none focus:ring-2 focus:ring-[#20251f]" @keydown="onEditorKeydown" @blur="commit">
                  <option v-for="option in column.options ?? []" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
                <input v-else :ref="setEditor" v-model="draft" data-testid="editable-table-editor" :type="column.type === 'number' ? 'number' : 'text'" class="h-10 w-full rounded-lg border border-[#20251f]/20 bg-white px-2 text-xs outline-none focus:ring-2 focus:ring-[#20251f]" @keydown="onEditorKeydown" @blur="commit">
              </div>
              <button v-else :ref="element => setCellElement(element, rowIndex, columnIndex)" type="button" :data-testid="`editable-cell-${rowIndex}-${column.key}`" class="editable-cell flex min-h-11 w-full items-center rounded-xl px-3 text-left text-xs outline-none transition-[background-color,box-shadow,transform] hover:not-disabled:bg-[#20251f]/5 focus-visible:bg-[#d9ff57]/35 focus-visible:shadow-[inset_0_0_0_2px_#20251f] active:not-disabled:scale-[.99] disabled:cursor-not-allowed disabled:opacity-45" :tabindex="active.row === rowIndex && active.column === columnIndex ? 0 : -1" :disabled="disabled" :aria-label="`${column.label}: ${row[column.key] ?? ''}. Press Enter to edit`" @focus="active = { row: rowIndex, column: columnIndex }" @dblclick="startEdit(rowIndex, columnIndex)" @keydown="onCellKeydown($event, rowIndex, columnIndex)">
                <span v-if="column.type === 'select'" class="rounded-full bg-[#20251f]/7 px-2.5 py-1 font-semibold">{{ column.options?.find(option => option.value === row[column.key])?.label ?? row[column.key] }}</span>
                <span v-else :class="column.type === 'number' ? 'font-mono tabular-nums' : ''">{{ row[column.key] }}</span>
              </button>
            </td>
            <td v-if="removable" class="px-3 text-right"><button type="button" :data-testid="`editable-remove-${rowIndex}`" class="rounded-full px-2 py-1 text-[10px] font-bold text-[#a23c32] outline-none hover:bg-[#a23c32]/10 focus-visible:ring-2 focus-visible:ring-[#a23c32] disabled:opacity-35" :disabled="disabled" :aria-label="`Remove row ${rowIndex + 1}`" @click="removeRow(rowIndex)">Remove</button></td>
          </tr>
        </TransitionGroup>
      </table>
      <div v-if="!modelValue.length" class="grid min-h-32 place-items-center text-xs text-[#20251f]/45">No rows available.</div>
    </div>
    <p class="mt-3 text-[9px] leading-4 text-[#20251f]/45">Arrow keys move between cells. Press Enter or F2 to edit, Enter to save, and Escape to cancel.</p>
  </div>
</template>

<style scoped>
.editable-table-scroll{contain:inline-size paint}
.editable-row-enter-active,.editable-row-leave-active,.editable-row-move{transition:opacity var(--editable-table-duration),transform var(--editable-table-duration)}
.editable-row-enter-from,.editable-row-leave-to{opacity:0;transform:translateY(-8px)}
@media (prefers-reduced-motion:reduce){.editable-cell,.editable-row-enter-active,.editable-row-leave-active,.editable-row-move{transition:none!important}}
</style>
