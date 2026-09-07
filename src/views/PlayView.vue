<script setup lang="ts">
import { onUnmounted, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { backingTrack, midiRootForKey, TRACK_KEY_DEFAULT, type TrackKey } from '@/audio/backingTrack'
import { melodyVoice } from '@/audio/melody'
import type { BeatEvent } from '@/audio/metronome'
import BackingTrackToggle from '@/components/BackingTrackToggle.vue'
import BpmControl from '@/components/BpmControl.vue'
import KeyControl from '@/components/KeyControl.vue'
import MelodyToggle from '@/components/MelodyToggle.vue'
import MetronomeToggle from '@/components/MetronomeToggle.vue'
import PlayTransport from '@/components/PlayTransport.vue'
import SchemeChangeControl from '@/components/SchemeChangeControl.vue'
import TimeSignatureControl from '@/components/TimeSignatureControl.vue'
import TrainingStage from '@/components/TrainingStage.vue'
import { useMetronomeStore } from '@/stores/metronome'
import { CHANGE_EVERY_DEFAULT, type ChangeEvery, type ModePattern } from '@/training/patterns'

const store = useMetronomeStore()
const { bpm, beatsPerMeasure } = storeToRefs(store)
const playing = ref(false)
const melodyOn = ref(true)
const metronomeOn = ref(true)
const backingOn = ref(false)
const trackKey = ref<TrackKey>(TRACK_KEY_DEFAULT)
const changeEvery = ref<ChangeEvery>(CHANGE_EVERY_DEFAULT)
const downbeatSeq = ref(0)
const soundingMode = ref<ModePattern | null>(null)

watch(playing, (on) => {
  if (!on) {
    melodyVoice.silence()
    backingTrack.setSession(false)
  }
})

watch(melodyOn, async (on) => {
  if (!on) {
    melodyVoice.silence()
    return
  }
  if (playing.value) await melodyVoice.ready()
})

watch(backingOn, (on) => {
  backingTrack.setEnabled(on)
})

watch(trackKey, (key) => {
  backingTrack.setKey(key)
})

function onDownbeat() {
  downbeatSeq.value += 1
}

function onScheduleDownbeat(event: BeatEvent) {
  const mode = soundingMode.value
  if (!playing.value || !melodyOn.value || !mode) return
  melodyVoice.playBar({
    mode,
    bpm: bpm.value,
    beatsPerMeasure: beatsPerMeasure.value,
    root: midiRootForKey(trackKey.value),
    when: event.audioTime,
  })
}

onUnmounted(() => {
  melodyVoice.dispose()
  backingTrack.dispose()
})
</script>

<template>
  <main id="main" class="play">
    <h1 class="play__title">Игра</h1>
    <TrainingStage
      :playing="playing"
      :change-every="changeEvery"
      :downbeat-seq="downbeatSeq"
      @update:mode="soundingMode = $event"
    />

    <footer class="play__bar">
      <BpmControl v-model="bpm" />
      <TimeSignatureControl v-model="beatsPerMeasure" />
      <SchemeChangeControl v-model="changeEvery" />
      <MetronomeToggle v-model="metronomeOn" />
      <MelodyToggle v-model="melodyOn" />
      <BackingTrackToggle v-model="backingOn" />
      <KeyControl v-model="trackKey" />
      <PlayTransport
        v-model="playing"
        :bpm="bpm"
        :beats-per-measure="beatsPerMeasure"
        :clicks="metronomeOn"
        @downbeat="onDownbeat"
        @schedule-downbeat="onScheduleDownbeat"
      />
    </footer>
  </main>
</template>

<style scoped>
.play {
  display: flex;
  flex-direction: column;
  min-height: calc(100dvh - 4.5rem);
}

.play__title {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
}

.play__bar {
  display: flex;
  flex-wrap: wrap;
  align-items: flex-end;
  justify-content: center;
  gap: 1.5rem 2rem;
  padding: 1.25rem 1rem 2rem;
}
</style>
