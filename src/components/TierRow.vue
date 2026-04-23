<script setup>
import { ref } from 'vue'

const props = defineProps({
  tier: Object,
})

const emit = defineEmits(['drop', 'rename', 'delete'])

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

function onDragOver(e) {
  e.preventDefault()
  e.currentTarget.classList.add('drag-over')
}

function onDragLeave(e) {
  e.currentTarget.classList.remove('drag-over')
}

function onDrop(e) {
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
</script>

<template>
  <div class="tier-row">
    <div class="tier-label" :style="{ backgroundColor: tier.color }">
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
