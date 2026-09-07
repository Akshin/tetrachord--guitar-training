<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue'
import {
  MODE_BACKDROP_FILES,
  MODE_BACKDROP_ORDER,
  modeBackdropId,
  type ModeBackdropId,
} from '@/training/modeBackgrounds'
import type { ModePattern } from '@/training/patterns'

const props = defineProps<{
  mode: ModePattern | null
}>()

const live = ref(false)
const activeId = computed((): ModeBackdropId | null => {
  if (!props.mode) return null
  return modeBackdropId(props.mode)
})

onMounted(() => {
  void nextTick(() => {
    live.value = true
  })
})
</script>

<template>
  <div class="mode-bg" :class="{ 'mode-bg--live': live }" aria-hidden="true">
    <img
      v-for="id in MODE_BACKDROP_ORDER"
      :key="id"
      class="mode-bg__img"
      :class="{ 'mode-bg__img--on': id === activeId }"
      :src="MODE_BACKDROP_FILES[id]"
      alt=""
      draggable="false"
    />
  </div>
</template>

<style scoped>
.mode-bg {
  position: fixed;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  pointer-events: none;
}

.mode-bg__img {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: auto;
  opacity: 0;
  mix-blend-mode: screen;
}

.mode-bg--live .mode-bg__img {
  transition: opacity 2.8s var(--ease);
}

.mode-bg__img--on {
  opacity: 0.28;
}

@media (prefers-color-scheme: light) {
  .mode-bg__img {
    mix-blend-mode: soft-light;
  }

  .mode-bg__img--on {
    opacity: 0.2;
  }
}

@media (prefers-reduced-motion: reduce) {
  .mode-bg--live .mode-bg__img {
    transition: none;
  }
}
</style>
