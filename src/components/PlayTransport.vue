<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import { PhPlay, PhStop } from '@phosphor-icons/vue'
import { backingTrack } from '@/audio/backingTrack'
import { melodyVoice, unlockAudio } from '@/audio/melody'
import {
  BEATS_DEFAULT,
  BPM_DEFAULT,
  Metronome,
  secondsPerBeat,
  type BeatEvent,
} from '@/audio/metronome'

const props = withDefaults(
  defineProps<{
    modelValue?: boolean
    bpm?: number
    beatsPerMeasure?: number
    clicks?: boolean
  }>(),
  {
    modelValue: false,
    bpm: BPM_DEFAULT,
    beatsPerMeasure: BEATS_DEFAULT,
    clicks: true,
  },
)

const emit = defineEmits<{
  'update:modelValue': [playing: boolean]
  downbeat: [event: BeatEvent]
  'schedule-downbeat': [event: BeatEvent]
}>()

const playing = ref(props.modelValue)
const metronome = new Metronome({
  bpm: props.bpm,
  beatsPerMeasure: props.beatsPerMeasure,
  onBeat: (event) => {
    if (event.isDownbeat) emit('downbeat', event)
  },
  onSchedule: (event) => {
    if (event.isDownbeat) emit('schedule-downbeat', event)
  },
})

watch(
  () => props.modelValue,
  (next) => {
    if (next !== playing.value) playing.value = next
  },
)

const pulseDuration = computed(() => `${secondsPerBeat(props.bpm)}s`)

async function play() {
  if (playing.value) return
  try {
    const ctx = await unlockAudio()
    await melodyVoice.ready()
    playing.value = true
    emit('update:modelValue', true)
    await nextTick()
    await metronome.start(ctx)
    backingTrack.setSession(true)
  } catch {
    melodyVoice.silence()
    backingTrack.setSession(false)
    metronome.stop()
    playing.value = false
    emit('update:modelValue', false)
  }
}

function stop() {
  if (!playing.value) return
  melodyVoice.silence()
  backingTrack.setSession(false)
  metronome.stop()
  playing.value = false
  emit('update:modelValue', false)
}

watch(
  playing,
  (on) => {
    if (!on) {
      melodyVoice.silence()
      backingTrack.setSession(false)
      metronome.stop()
    }
  },
)

watch(
  () => props.bpm,
  (bpm) => {
    metronome.setBpm(bpm)
  },
)

watch(
  () => props.beatsPerMeasure,
  (beats) => {
    metronome.setBeatsPerMeasure(beats)
  },
)

watch(
  () => props.clicks,
  (on) => {
    metronome.setClicks(on)
  },
  { immediate: true },
)

onUnmounted(() => {
  metronome.dispose()
})
</script>

<template>
  <div
    class="player"
    role="group"
    aria-label="Тренировка"
    :class="{ 'player--playing': playing }"
  >
    <span class="player__pulse" aria-hidden="true" />

    <button
      type="button"
      class="player__btn player__btn--play"
      :disabled="playing"
      :aria-pressed="playing"
      aria-label="Начать тренировку"
      @click="play"
    >
      <PhPlay :size="22" weight="fill" aria-hidden="true" />
      <span class="player__caption">Начать тренировку</span>
    </button>

    <button
      type="button"
      class="player__btn player__btn--stop"
      :disabled="!playing"
      aria-label="Остановить тренировку"
      @click="stop"
    >
      <PhStop :size="22" weight="fill" aria-hidden="true" />
      <span class="player__caption">Остановить тренировку</span>
    </button>
  </div>
</template>

<style scoped>
.player {
  --pulse-duration: v-bind(pulseDuration);

  position: relative;
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.45rem;
  border: 1px solid var(--line);
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--bg-inset) 72%, transparent);
}

.player__pulse {
  position: absolute;
  inset: -2px;
  border-radius: inherit;
  border: 1.5px solid transparent;
  pointer-events: none;
}

.player--playing .player__pulse {
  border-color: color-mix(in srgb, var(--accent) 55%, transparent);
  animation: player-pulse var(--pulse-duration) ease-out infinite;
}

.player__btn {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  height: 2.75rem;
  padding: 0 1.05rem 0 0.9rem;
  border: 1px solid transparent;
  border-radius: var(--radius-pill);
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition:
    background 320ms var(--ease),
    color 320ms var(--ease),
    border-color 320ms var(--ease),
    transform 220ms var(--ease),
    opacity 220ms var(--ease);
}

.player__btn:hover:not(:disabled) {
  color: var(--ink);
}

.player__btn:active:not(:disabled) {
  transform: scale(0.97);
}

.player__btn:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 2px;
}

.player__btn:disabled {
  cursor: default;
  opacity: 0.42;
}

.player__btn--play:not(:disabled) {
  background: var(--accent);
  color: var(--accent-ink);
}

.player__btn--play:not(:disabled):hover {
  filter: brightness(1.06);
  color: var(--accent-ink);
}

.player--playing .player__btn--stop:not(:disabled) {
  background: var(--ink);
  border-color: transparent;
  color: var(--bg);
}

.player__caption {
  font-size: 0.82rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

@keyframes player-pulse {
  0% {
    transform: scale(0.98);
    opacity: 1;
  }
  100% {
    transform: scale(1.04);
    opacity: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .player--playing .player__pulse {
    animation: none;
    opacity: 0.55;
  }
}
</style>
