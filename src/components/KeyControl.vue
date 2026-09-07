<script setup lang="ts">
import { ref, watch } from 'vue'
import { TRACK_KEYS, TRACK_KEY_DEFAULT, type TrackKey } from '@/audio/backingTrack'

const props = withDefaults(
  defineProps<{
    modelValue?: TrackKey
  }>(),
  {
    modelValue: TRACK_KEY_DEFAULT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [key: TrackKey]
}>()

const key = ref<TrackKey>(props.modelValue)

watch(
  () => props.modelValue,
  (next) => {
    if (next !== key.value) key.value = next
  },
)

function select(next: TrackKey) {
  if (next === key.value) return
  key.value = next
  emit('update:modelValue', next)
}
</script>

<template>
  <div class="key" role="group" aria-label="Тональность">
    <span class="key__label" id="key-label">Тональность</span>
    <div class="key__options" role="radiogroup" aria-labelledby="key-label">
      <button
        v-for="option in TRACK_KEYS"
        :key="option"
        type="button"
        class="key__opt"
        :class="{ 'key__opt--on': key === option }"
        role="radio"
        :aria-checked="key === option"
        :aria-label="`Тональность ${option}`"
        @click="select(option)"
      >
        {{ option }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.key {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: max-content;
}

.key__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.key__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  max-width: 22rem;
  padding: 0.3rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--bg-inset) 72%, transparent);
}

.key__opt {
  min-width: 2.15rem;
  height: 2.15rem;
  padding: 0 0.45rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background 280ms var(--ease),
    color 280ms var(--ease);
}

.key__opt:hover {
  color: var(--ink);
}

.key__opt:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.key__opt--on {
  background: var(--accent);
  color: var(--accent-ink);
}

.key__opt--on:hover {
  color: var(--accent-ink);
  filter: brightness(1.04);
}
</style>
