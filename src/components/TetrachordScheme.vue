<script setup lang="ts">
import SchemeCircle from '@/components/SchemeCircle.vue'
import { schemeLabel, type SchemePattern } from '@/training/patterns'

defineProps<{
  pattern: SchemePattern
  caption?: string
  quiet?: boolean
  lifted?: boolean
}>()
</script>

<template>
  <article
    class="tetra"
    :class="{ 'tetra--quiet': quiet, 'tetra--lifted': lifted }"
    :aria-label="schemeLabel(pattern)"
  >
    <div class="tetra__shell">
      <div class="tetra__core">
        <p v-if="caption" class="tetra__caption">{{ caption }}</p>
        <div class="tetra__row" aria-hidden="true">
          <span
            v-for="(kind, i) in pattern"
            :key="`${kind}-${i}`"
            class="tetra__cell"
          >
            <SchemeCircle :kind="kind" />
          </span>
        </div>
      </div>
    </div>
  </article>
</template>

<style scoped>
.tetra {
  width: 17rem;
  flex: none;
  transform-origin: center center;
  transition:
    transform 520ms cubic-bezier(0.33, 0.08, 0.18, 1),
    opacity 520ms cubic-bezier(0.33, 0.08, 0.18, 1);
}

.tetra--quiet {
  opacity: 0.62;
  transform: scale(0.92);
}

.tetra--lifted {
  opacity: 1;
  transform: translateY(-7px) scale(1.09);
}

.tetra--lifted .tetra__shell {
  border-color: #0b0d11;
  box-shadow:
    0 0 0 2px #0b0d11,
    0 18px 38px rgb(8 10 14 / 58%),
    inset 0 1px 0 rgb(255 255 255 / 8%);
}

.tetra__shell {
  padding: 0.35rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-shell);
  background: color-mix(in srgb, var(--bg-inset) 65%, transparent);
  transition:
    border-color 520ms cubic-bezier(0.33, 0.08, 0.18, 1),
    box-shadow 520ms cubic-bezier(0.33, 0.08, 0.18, 1);
}

.tetra__core {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  padding: 0.85rem 1rem 1.05rem;
  border-radius: var(--radius-core);
  background: var(--bg-raised);
  box-shadow: inset 0 1px 1px rgb(255 255 255 / 12%);
}

.tetra__caption {
  margin: 0;
  color: var(--muted);
  font-size: 0.68rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.tetra__row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  align-items: center;
  border-left: 1px solid color-mix(in srgb, var(--ink) 22%, transparent);
}

.tetra__cell {
  display: grid;
  place-items: center;
  height: 3.4rem;
  border-right: 1px solid color-mix(in srgb, var(--ink) 22%, transparent);
}

.tetra__cell :deep(.scheme-circle) {
  width: 1.55rem;
  height: 1.55rem;
}

@media (max-width: 767px) {
  .tetra {
    width: min(15.5rem, calc(100% - 0.5rem));
  }

  .tetra--quiet {
    transform: none;
  }

  .tetra--lifted {
    transform: translateY(-4px) scale(1.05);
  }
}
</style>
