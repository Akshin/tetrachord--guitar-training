<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import ModeScheme from '@/components/ModeScheme.vue'
import {
  randomMode,
  type ChangeEvery,
  type ModePattern,
} from '@/training/patterns'

const props = defineProps<{
  playing: boolean
  changeEvery: ChangeEvery
  downbeatSeq: number
}>()

const emit = defineEmits<{
  'update:mode': [mode: ModePattern]
}>()

type Slot = {
  id: number
  mode: ModePattern
}

let nextId = 1

function makeSlot(exclude?: ModePattern): Slot {
  return { id: nextId++, mode: randomMode(exclude) }
}

const current = ref<Slot>(makeSlot())
const next = ref<Slot>(makeSlot(current.value.mode))
const flyer = ref<ModePattern | null>(null)
const flyerPhase = ref<'start' | 'lift' | 'go' | 'settle'>('start')
const sliding = ref(false)
const leftSnap = ref(false)
const armed = ref(true)
const completedMeasures = ref(0)
const pendingAdvance = ref(false)
let lastDownbeatSeq = props.downbeatSeq
const timers: number[] = []

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
const LIFT_MS = 280
const FLY_MS = 780
/** Start falling this long before arrival so it lands already seated. */
const FALL_LEAD_MS = 420

const leftMode = computed(() => current.value.mode)
const rightMode = computed(() => next.value.mode)

function clearTimers() {
  while (timers.length > 0) {
    const id = timers.pop()
    if (id !== undefined) window.clearTimeout(id)
  }
}

function after(ms: number, fn: () => void) {
  timers.push(window.setTimeout(fn, ms))
}

function resetPair() {
  clearTimers()
  sliding.value = false
  leftSnap.value = false
  flyerPhase.value = 'start'
  flyer.value = null
  pendingAdvance.value = false
  completedMeasures.value = 0
  current.value = makeSlot()
  next.value = makeSlot(current.value.mode)
}

watch(
  () => props.playing,
  (on, wasOn) => {
    if (on && !wasOn) {
      lastDownbeatSeq = props.downbeatSeq
      armed.value = true
      resetPair()
    }
    if (!on) {
      completedMeasures.value = 0
      pendingAdvance.value = false
      armed.value = true
      clearTimers()
      sliding.value = false
      leftSnap.value = false
      flyerPhase.value = 'start'
      flyer.value = null
    }
  },
)

watch(
  () => props.changeEvery,
  () => {
    completedMeasures.value = 0
  },
)

function swapInstant() {
  const moving = next.value
  current.value = moving
  next.value = makeSlot(moving.mode)
}

function finishSlide(moving: Slot) {
  // Swap content while left is still hidden, drop flyer, then snap left in
  // without a fade-in (that fade was the flicker).
  current.value = moving
  flyer.value = null
  flyerPhase.value = 'start'
  leftSnap.value = true
  sliding.value = false
  void nextTick(() => {
    requestAnimationFrame(() => {
      leftSnap.value = false
      if (pendingAdvance.value) {
        pendingAdvance.value = false
        advance()
      }
    })
  })
}

function advance() {
  if (sliding.value) {
    pendingAdvance.value = true
    return
  }

  if (prefersReducedMotion.matches) {
    swapInstant()
    return
  }

  const moving = next.value
  flyer.value = moving.mode
  sliding.value = true
  flyerPhase.value = 'start'
  next.value = makeSlot(moving.mode)

  void nextTick(() => {
    requestAnimationFrame(() => {
      flyerPhase.value = 'lift'
    })
  })

  clearTimers()
  after(LIFT_MS, () => {
    flyerPhase.value = 'go'
  })
  after(LIFT_MS + Math.max(0, FLY_MS - FALL_LEAD_MS), () => {
    flyerPhase.value = 'settle'
  })
  after(LIFT_MS + FLY_MS, () => {
    finishSlide(moving)
  })
}

watch(
  () => props.downbeatSeq,
  (seq) => {
    if (!props.playing) {
      lastDownbeatSeq = seq
      return
    }
    if (seq === lastDownbeatSeq) return
    lastDownbeatSeq = seq
    if (armed.value) {
      armed.value = false
      return
    }
    completedMeasures.value += 1
    if (completedMeasures.value % props.changeEvery === 0) advance()
  },
)

const upcomingMode = computed(() => {
  const nextBarAdvances =
    !armed.value && (completedMeasures.value + 1) % props.changeEvery === 0
  return nextBarAdvances ? next.value.mode : current.value.mode
})

watch(
  upcomingMode,
  (mode) => {
    emit('update:mode', mode)
  },
  { immediate: true },
)

onUnmounted(() => {
  pendingAdvance.value = false
  clearTimers()
})
</script>

<template>
  <section class="stage" aria-label="Лады тренировки">
    <div class="stage__viewport">
      <article
        class="stage__pane stage__pane--left"
        :class="{
          'stage__pane--exit': sliding,
          'stage__pane--snap': leftSnap,
        }"
      >
        <ModeScheme :mode="leftMode" caption="Сейчас" :motion="false" />
      </article>
      <article
        class="stage__pane stage__pane--right"
        :class="{ 'stage__pane--enter': sliding }"
      >
        <ModeScheme :mode="rightMode" caption="Дальше" quiet />
      </article>

      <div
        v-if="flyer"
        class="stage__flyer"
        :class="{
          'stage__flyer--lift': flyerPhase === 'lift' || flyerPhase === 'go',
          'stage__flyer--go': flyerPhase === 'go' || flyerPhase === 'settle',
          'stage__flyer--settle': flyerPhase === 'settle',
        }"
        aria-hidden="true"
      >
        <ModeScheme
          :mode="flyer"
          caption="Сейчас"
          :quiet="flyerPhase === 'start'"
          :lifted="flyerPhase === 'lift' || flyerPhase === 'go'"
        />
      </div>

      <div class="stage__split" aria-hidden="true" />
    </div>
  </section>
</template>

<style scoped>
.stage {
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  width: 100%;
}

.stage__viewport {
  position: relative;
  display: grid;
  grid-template-columns: 1fr 1fr;
  align-items: center;
  overflow: hidden;
  flex: 1 1 auto;
  min-height: 11rem;
}

.stage__pane {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  padding: 1.5rem 1rem;
}

.stage__pane--left :deep(.mode) {
  opacity: 1;
  transform: none;
  transition:
    transform 520ms cubic-bezier(0.33, 0.08, 0.18, 1),
    opacity 480ms cubic-bezier(0.33, 0.08, 0.18, 1);
}

.stage__pane--exit :deep(.mode) {
  opacity: 0;
  transform: scale(0.9);
}

.stage__pane--snap :deep(.mode) {
  transition: none;
  opacity: 1;
  transform: none;
}

.stage__pane--enter {
  animation: next-arrive 860ms cubic-bezier(0.33, 0.08, 0.18, 1) 300ms both;
}

.stage__flyer {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 50%;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 50%;
  padding: 1.5rem 1rem;
  pointer-events: none;
  transform: translateX(0);
  transition: transform 780ms cubic-bezier(0.33, 0.08, 0.18, 1);
  will-change: transform;
}

.stage__flyer--go,
.stage__flyer--settle {
  transform: translateX(-100%);
}

.stage__split {
  position: absolute;
  top: 12%;
  bottom: 12%;
  left: 50%;
  z-index: 1;
  width: 1px;
  background: color-mix(in srgb, var(--ink) 28%, transparent);
  transform: translateX(-50%);
  pointer-events: none;
}

@keyframes next-arrive {
  from {
    opacity: 0;
    transform: scale(0.72);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@media (prefers-reduced-motion: reduce) {
  .stage__pane--left :deep(.mode),
  .stage__flyer {
    transition: none;
  }

  .stage__pane--enter {
    animation: none;
  }
}

@media (max-width: 767px) {
  .stage__viewport {
    min-height: 14rem;
  }

  .stage__pane,
  .stage__flyer {
    padding: 1rem 0.45rem;
  }
}
</style>
