<script setup lang="ts">
import { computed } from 'vue'
import { intervalLabel, type IntervalKind } from '@/training/patterns'

const props = defineProps<{
  kind: IntervalKind
}>()

const token = computed(() => {
  if (props.kind === 'semitone') return 'semitone'
  if (props.kind === 'tc') return 'tc'
  return 'tone'
})
</script>

<template>
  <svg
    class="scheme-circle"
    viewBox="0 0 32 32"
    role="img"
    :aria-label="intervalLabel(kind)"
  >
    <circle class="scheme-circle__fill" cx="16" cy="16" r="13" :data-kind="token" />
  </svg>
</template>

<style scoped>
.scheme-circle {
  display: block;
  width: 100%;
  height: 100%;
  overflow: visible;
}

.scheme-circle__fill {
  fill: var(--tone);
}

.scheme-circle__fill[data-kind='semitone'] {
  fill: var(--semitone);
}

.scheme-circle__fill[data-kind='tc'] {
  fill: var(--tc);
}
</style>
