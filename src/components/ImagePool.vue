<script setup>
import { ref } from 'vue'

const props = defineProps({
  images: Array,
})

const emit = defineEmits(['drop', 'addImage'])

const urlInput = ref('')
const isDraggingFile = ref(false)

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
  isDraggingFile.value = false

  // Check for internal image move
  const data = e.dataTransfer.getData('application/json')
  if (data) {
    const { imageId, fromTier } = JSON.parse(data)
    emit('drop', { imageId, fromTier, toTier: '__pool__' })
    return
  }

  // Check for file drops
  const files = e.dataTransfer.files
  if (files.length > 0) {
    for (const file of files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => {
          emit('addImage', ev.target.result)
        }
        reader.readAsDataURL(file)
      }
    }
  }
}

function onDragStart(e, imageId) {
  e.dataTransfer.setData(
    'application/json',
    JSON.stringify({ imageId, fromTier: '__pool__' }),
  )
}

function addFromUrl() {
  const url = urlInput.value.trim()
  if (url) {
    emit('addImage', url)
    urlInput.value = ''
  }
}

// Global paste and file drag listeners
function onWindowDragOver(e) {
  if (e.dataTransfer?.types?.includes('Files')) {
    isDraggingFile.value = true
  }
}

function onWindowDragLeave(e) {
  if (e.relatedTarget === null) {
    isDraggingFile.value = false
  }
}
</script>

<template>
  <div
    class="image-pool"
    @dragover="onDragOver"
    @dragleave="onDragLeave"
    @drop="onDrop"
    tabindex="0"
    @dragenter="onWindowDragOver"
  >
    <div class="pool-header">
      <h3>Images</h3>
      <div class="url-input">
        <input
          v-model="urlInput"
          type="text"
          placeholder="Paste image URL and press Enter..."
          @keydown.enter="addFromUrl"
        />
        <button @click="addFromUrl">Add</button>
      </div>
    </div>
    <div class="pool-items">
      <img
        v-for="img in images"
        :key="img.id"
        :src="img.src"
        class="pool-image"
        draggable="true"
        @dragstart="onDragStart($event, img.id)"
      />
      <div v-if="images.length === 0" class="pool-placeholder">
        Drop images here, paste from clipboard, or add via URL
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/image-pool.scss';
</style>
