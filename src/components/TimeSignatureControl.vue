<script setup lang="ts">
import { ref, watch } from 'vue'
import { BEATS_DEFAULT, TIME_SIGNATURES, clampBeats } from '@/audio/metronome'

const props = withDefaults(
  defineProps<{
    modelValue?: number
  }>(),
  {
    modelValue: BEATS_DEFAULT,
  },
)

const emit = defineEmits<{
  'update:modelValue': [beats: number]
}>()

const beats = ref(clampBeats(props.modelValue))

watch(
  () => props.modelValue,
  (next) => {
    const clamped = clampBeats(next)
    if (clamped !== beats.value) beats.value = clamped
  },
)

function select(next: number) {
  const value = clampBeats(next)
  if (value === beats.value) return
  beats.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <div class="meter" role="group" aria-label="Размер такта">
    <span class="meter__label" id="meter-label">Размер</span>
    <div class="meter__options" role="radiogroup" aria-labelledby="meter-label">
      <button
        v-for="option in TIME_SIGNATURES"
        :key="option.label"
        type="button"
        class="meter__opt"
        :class="{ 'meter__opt--on': beats === option.beats }"
        role="radio"
        :aria-checked="beats === option.beats"
        @click="select(option.beats)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.meter {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: max-content;
}

.meter__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.meter__options {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.3rem;
  padding: 0.3rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--bg-inset) 72%, transparent);
}

.meter__opt {
  min-width: 2.65rem;
  height: 2.15rem;
  padding: 0 0.65rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  cursor: pointer;
  transition:
    background 280ms var(--ease),
    color 280ms var(--ease),
    border-color 280ms var(--ease);
}

.meter__opt:hover {
  color: var(--ink);
}

.meter__opt:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.meter__opt--on {
  background: var(--accent);
  color: var(--accent-ink);
}

.meter__opt--on:hover {
  color: var(--accent-ink);
  filter: brightness(1.04);
}
</style>
