<script setup>
import { ref, reactive } from 'vue'
import TierRow from './components/TierRow.vue'
import ImagePool from './components/ImagePool.vue'

let nextImageId = 1
let nextTierId = 7

const title = ref('Tier List')
const editingTitle = ref(false)
const editTitle = ref('')

function startEditingTitle() {
  editTitle.value = title.value
  editingTitle.value = true
}

function finishEditingTitle() {
  const newTitle = editTitle.value.trim()
  if (newTitle) title.value = newTitle
  editingTitle.value = false
}

const tiers = reactive([
  { id: 1, name: 'S', color: '#ff7f7f', images: [] },
  { id: 2, name: 'A', color: '#ffbf7f', images: [] },
  { id: 3, name: 'B', color: '#ffdf7f', images: [] },
  { id: 4, name: 'C', color: '#ffff7f', images: [] },
  { id: 5, name: 'D', color: '#bfff7f', images: [] },
  { id: 6, name: 'F', color: '#7fbfff', images: [] },
])

const poolImages = ref([])

const defaultColors = [
  '#ff7f7f', '#ffbf7f', '#ffdf7f', '#ffff7f', '#bfff7f',
  '#7fbfff', '#bf7fff', '#ff7fbf', '#7fffbf', '#ff9f5f',
]

function findAndRemoveImage(imageId, fromTier) {
  if (fromTier === '__pool__') {
    const idx = poolImages.value.findIndex((img) => img.id === imageId)
    if (idx !== -1) return poolImages.value.splice(idx, 1)[0]
  } else {
    const tier = tiers.find((t) => t.id === fromTier)
    if (tier) {
      const idx = tier.images.findIndex((img) => img.id === imageId)
      if (idx !== -1) return tier.images.splice(idx, 1)[0]
    }
  }
  return null
}

function handleDrop({ imageId, fromTier, toTier }) {
  const image = findAndRemoveImage(imageId, fromTier)
  if (!image) return

  if (toTier === '__trash__') {
    // deleted
  } else if (toTier === '__pool__') {
    poolImages.value.push(image)
  } else {
    const tier = tiers.find((t) => t.id === toTier)
    if (tier) tier.images.push(image)
  }
}

function handleTrashDrop(e) {
  e.preventDefault()
  const data = e.dataTransfer.getData('application/json')
  if (data) {
    const { imageId, fromTier } = JSON.parse(data)
    findAndRemoveImage(imageId, fromTier)
  }
}

function addTier() {
  const color = defaultColors[tiers.length % defaultColors.length]
  tiers.push({ id: nextTierId++, name: 'New', color, images: [] })
}

function deleteTier(tierId) {
  const idx = tiers.findIndex((t) => t.id === tierId)
  if (idx === -1) return
  const tier = tiers[idx]
  // Move images back to pool
  poolImages.value.push(...tier.images)
  tiers.splice(idx, 1)
}

function renameTier({ tierId, newName }) {
  const tier = tiers.find((t) => t.id === tierId)
  if (tier) tier.name = newName
}

function addImage(src) {
  poolImages.value.push({ id: nextImageId++, src })
}

function onGlobalDrop(e) {
  if (e.dataTransfer?.files?.length > 0) {
    e.preventDefault()
    for (const file of e.dataTransfer.files) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (ev) => addImage(ev.target.result)
        reader.readAsDataURL(file)
      }
    }
  }
}

function onGlobalPaste(e) {
  const items = e.clipboardData?.items
  if (!items) return
  for (const item of items) {
    if (item.type.startsWith('image/')) {
      e.preventDefault()
      const file = item.getAsFile()
      const reader = new FileReader()
      reader.onload = (ev) => addImage(ev.target.result)
      reader.readAsDataURL(file)
    }
  }
}
</script>

<template>
  <div
    class="tier-list-app"
    @dragover.prevent
    @drop="onGlobalDrop"
    @paste="onGlobalPaste"
  >
    <h1 class="title">
      <input
        v-if="editingTitle"
        v-model="editTitle"
        class="title-input"
        @blur="finishEditingTitle"
        @keydown.enter="finishEditingTitle"
        @vue:mounted="({ el }) => el.focus()"
      />
      <span v-else @dblclick="startEditingTitle">{{ title }}</span>
    </h1>
    <div class="tiers">
      <TierRow
        v-for="tier in tiers"
        :key="tier.id"
        :tier="tier"
        @drop="handleDrop"
        @rename="renameTier"
        @delete="deleteTier"
      />
    </div>
    <button class="add-tier-btn" @click="addTier">+ Add Row</button>
    <ImagePool
      :images="poolImages"
      @drop="handleDrop"
      @add-image="addImage"
    />
    <div
      class="trash-zone"
      @dragover.prevent="$event.currentTarget.classList.add('drag-over')"
      @dragleave="$event.currentTarget.classList.remove('drag-over')"
      @drop="handleTrashDrop($event); $event.currentTarget.classList.remove('drag-over')"
    >
      <span class="trash-icon">&#128465;</span>
      <span>Drop here to delete</span>
    </div>
  </div>
</template>

<style lang="scss">
@use '@/assets/styles/app.scss';
@use '@/assets/styles/title.scss';
@use '@/assets/styles/trash-zone.scss';
</style>
