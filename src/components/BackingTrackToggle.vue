<script setup lang="ts">
import { ref, watch } from 'vue'
import { PhWaveform } from '@phosphor-icons/vue'
import { unlockAudio } from '@/audio/melody'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {
    modelValue: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [on: boolean]
}>()

const on = ref(props.modelValue)

watch(
  () => props.modelValue,
  (next) => {
    if (next !== on.value) on.value = next
  },
)

function setOn(next: boolean) {
  if (next === on.value) return
  on.value = next
  emit('update:modelValue', next)
  if (next) void unlockAudio()
}
</script>

<template>
  <div class="pad" role="group" aria-label="Бэк-трек">
    <span class="pad__label" id="pad-label">Бэк-трек</span>
    <div class="pad__options" role="radiogroup" aria-labelledby="pad-label">
      <button
        type="button"
        class="pad__opt"
        :class="{ 'pad__opt--on': on }"
        role="radio"
        :aria-checked="on"
        aria-label="Включить бэк-трек"
        @click="setOn(true)"
      >
        <PhWaveform :size="15" weight="light" aria-hidden="true" />
        Вкл
      </button>
      <button
        type="button"
        class="pad__opt"
        :class="{ 'pad__opt--on': !on }"
        role="radio"
        :aria-checked="!on"
        aria-label="Выключить бэк-трек"
        @click="setOn(false)"
      >
        Выкл
      </button>
    </div>
  </div>
</template>

<style scoped>
.pad {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: max-content;
}

.pad__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.pad__options {
  display: flex;
  gap: 0.3rem;
  padding: 0.3rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--bg-inset) 72%, transparent);
}

.pad__opt {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  min-width: 3.4rem;
  height: 2.15rem;
  padding: 0 0.8rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted);
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 280ms var(--ease),
    color 280ms var(--ease);
}

.pad__opt:hover {
  color: var(--ink);
}

.pad__opt:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.pad__opt--on {
  background: var(--accent);
  color: var(--accent-ink);
}

.pad__opt--on:hover {
  color: var(--accent-ink);
  filter: brightness(1.04);
}
</style>
