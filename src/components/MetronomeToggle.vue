<script setup lang="ts">
import { ref, watch } from 'vue'
import { PhMetronome } from '@phosphor-icons/vue'
import { unlockAudio } from '@/audio/melody'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
  }>(),
  {
    modelValue: true,
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
  <div class="click" role="group" aria-label="Метроном">
    <span class="click__label" id="click-label">Метроном</span>
    <div class="click__options" role="radiogroup" aria-labelledby="click-label">
      <button
        type="button"
        class="click__opt"
        :class="{ 'click__opt--on': on }"
        role="radio"
        :aria-checked="on"
        aria-label="Включить метроном"
        @click="setOn(true)"
      >
        <PhMetronome :size="15" weight="light" aria-hidden="true" />
        Вкл
      </button>
      <button
        type="button"
        class="click__opt"
        :class="{ 'click__opt--on': !on }"
        role="radio"
        :aria-checked="!on"
        aria-label="Выключить метроном"
        @click="setOn(false)"
      >
        Выкл
      </button>
    </div>
  </div>
</template>

<style scoped>
.click {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.55rem;
  width: max-content;
}

.click__label {
  font-size: 0.7rem;
  font-weight: 600;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--muted);
}

.click__options {
  display: flex;
  gap: 0.3rem;
  padding: 0.3rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--bg-inset) 72%, transparent);
}

.click__opt {
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

.click__opt:hover {
  color: var(--ink);
}

.click__opt:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.click__opt--on {
  background: var(--accent);
  color: var(--accent-ink);
}

.click__opt--on:hover {
  color: var(--accent-ink);
  filter: brightness(1.04);
}
</style>
