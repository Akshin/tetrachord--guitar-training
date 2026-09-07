<script setup lang="ts">
export type IntervalKind = 'tone' | 'semitone'

withDefaults(
  defineProps<{
    pattern: readonly IntervalKind[]
    reverse?: boolean
    showDegrees?: boolean
  }>(),
  {
    reverse: false,
    showDegrees: true,
  },
)

const degrees = ['I', 'II', 'III', 'IV'] as const

function label(kind: IntervalKind): string {
  return kind === 'tone' ? 'Тон' : 'Полутон'
}
</script>

<template>
  <div class="scheme" :class="{ 'scheme--mirror': reverse }">
    <ol v-if="showDegrees" class="scheme__degrees" aria-hidden="true">
      <li v-for="d in degrees" :key="d">{{ d }}</li>
    </ol>
    <ol class="scheme__intervals">
      <li
        v-for="(kind, i) in pattern"
        :key="`${kind}-${i}`"
        class="scheme__dot"
        :class="`scheme__dot--${kind}`"
        :title="label(kind)"
      >
        <span class="visually-hidden">{{ label(kind) }}</span>
      </li>
    </ol>
  </div>
</template>

<style scoped>
.scheme {
  display: grid;
  gap: 0.65rem;
}

.scheme__degrees,
.scheme__intervals {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  margin: 0;
  padding: 0;
  list-style: none;
}

.scheme__degrees {
  color: var(--muted);
  font-size: 0.72rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-align: center;
}

.scheme__intervals {
  grid-template-columns: 1fr 1fr 1fr;
  padding: 0 12.5%;
  align-items: center;
}

.scheme__dot {
  justify-self: center;
  width: 1.15rem;
  height: 1.15rem;
  border-radius: 50%;
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 28%);
}

.scheme__dot--tone {
  background: var(--tone);
}

.scheme__dot--semitone {
  background: var(--semitone);
}

.scheme--mirror .scheme__intervals,
.scheme--mirror .scheme__degrees {
  direction: rtl;
}

.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}
</style>
