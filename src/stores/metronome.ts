import { ref } from 'vue'
import { defineStore } from 'pinia'
import { BEATS_DEFAULT, BPM_DEFAULT } from '@/audio/metronome'

export const useMetronomeStore = defineStore('metronome', () => {
  const bpm = ref(BPM_DEFAULT)
  const beatsPerMeasure = ref(BEATS_DEFAULT)

  return { bpm, beatsPerMeasure }
})
