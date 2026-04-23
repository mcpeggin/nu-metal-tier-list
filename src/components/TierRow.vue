<script setup>
import { ref } from 'vue'

const props = defineProps({
  tier: Object,
})

const emit = defineEmits(['drop', 'rename', 'delete', 'reorder'])

const editing = ref(false)
const editName = ref('')

function startEditing() {
  editName.value = props.tier.name
  editing.value = true
}

function finishEditing() {
  const newName = editName.value.trim()
  if (newName && newName !== props.tier.name) {
    emit('rename', { tierId: props.tier.id, newName })
  }
  editing.value = false
}

function isTierDrag(e) {
  return Array.from(e.dataTransfer.types).includes('application/x-tier-row')
}

function onDragOver(e) {
  if (isTierDrag(e)) return
  e.preventDefault()
  e.currentTarget.classList.add('drag-over')
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over')
}

function onDrop(e) {
  if (isTierDrag(e)) return
  e.preventDefault()
  e.currentTarget.classList.remove('drag-over')
  const data = e.dataTransfer.getData('application/json')
  if (data) {
    const { imageId, fromTier } = JSON.parse(data)
    emit('drop', { imageId, fromTier, toTier: props.tier.id })
  }
}

function onDragStart(e, imageId) {
  e.dataTransfer.setData(
    'application/json',
    JSON.stringify({ imageId, fromTier: props.tier.id }),
  )
}

function onRowDragStart(e) {
  if (editing.value) {
    e.preventDefault()
    return
  }
  e.dataTransfer.setData('application/x-tier-row', String(props.tier.id))
  e.dataTransfer.effectAllowed = 'move'
}

function rowInsertPosition(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  return e.clientY < rect.top + rect.height / 2 ? 'before' : 'after'
}

function onRowDragOver(e) {
  if (!isTierDrag(e)) return
  e.preventDefault()
  e.dataTransfer.dropEffect = 'move'
  const pos = rowInsertPosition(e)
  e.currentTarget.classList.toggle('insert-above', pos === 'before')
  e.currentTarget.classList.toggle('insert-below', pos === 'after')
}

function onRowDragLeave(e) {
  e.currentTarget.classList.remove('insert-above', 'insert-below')
}

function onRowDrop(e) {
  if (!isTierDrag(e)) return
  e.preventDefault()
  const pos = rowInsertPosition(e)
  e.currentTarget.classList.remove('insert-above', 'insert-below')
  const sourceId = Number(e.dataTransfer.getData('application/x-tier-row'))
  if (!sourceId || sourceId === props.tier.id) return
  emit('reorder', { sourceId, targetId: props.tier.id, position: pos })
}
</script>

<template>
  <div
    class="tier-row"
    @dragover="onRowDragOver"
    @dragleave="onRowDragLeave"
    @drop="onRowDrop"
  >
    <div
      class="tier-label"
      :style="{ backgroundColor: tier.color }"
      :draggable="!editing"
      @dragstart="onRowDragStart"
    >
      <input
        v-if="editing"
        v-model="editName"
        class="tier-name-input"
        @blur="finishEditing"
        @keydown.enter="finishEditing"
        @vue:mounted="({ el }) => el.focus()"
      />
      <span v-else class="tier-name" @dblclick="startEditing">
        {{ tier.name }}
      </span>
    </div>
    <div
      class="tier-items"
      @dragover="onDragOver"
      @dragleave="onDragLeave"
      @drop="onDrop"
    >
      <img
        v-for="img in tier.images"
        :key="img.id"
        :src="img.src"
        class="tier-image"
        draggable="true"
        @dragstart="onDragStart($event, img.id)"
      />
    </div>
    <button class="delete-btn" :style="{ backgroundColor: tier.color }" @click="emit('delete', tier.id)" title="Delete row">
      &#128465;
    </button>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/tier-row.scss';
</style>
