import {
  Filter,
  Midi,
  PolySynth,
  Synth,
  Volume,
  getContext,
  immediate,
  setContext,
  start,
} from 'tone'
import { secondsPerBeat } from '@/audio/metronome'
import type { IntervalKind, ModePattern, SchemePattern } from '@/training/patterns'

let nativeCtx: AudioContext | null = null

export function getRawAudioContext(): AudioContext {
  if (nativeCtx && nativeCtx.state !== 'closed') return nativeCtx
  throw new Error('Audio is not unlocked yet')
}

/**
 * Create/resume the shared AudioContext inside a click.
 * Tone wraps this same context so melody and metronome share one clock.
 */
export async function unlockAudio(): Promise<AudioContext> {
  if (!nativeCtx || nativeCtx.state === 'closed') {
    nativeCtx = new AudioContext()
    setContext(nativeCtx)
    getContext().lookAhead = 0
  }
  const resumeNative = nativeCtx.resume()
  await Promise.all([resumeNative, start()])
  if (nativeCtx.state === 'suspended') await nativeCtx.resume()
  return nativeCtx
}

/** Notes played evenly across one bar. */
export const MELODY_NOTES_PER_BAR = 8

/** Sweet-spot range: C4–B5, so a full octave from any chosen key still fits. */
export const MELODY_MIN_MIDI = 60
export const MELODY_MAX_MIDI = 83
/** E4: sits well on guitar and in the middle of the range. */
export const MELODY_ROOT_MIDI = 64

function intervalSemitones(kind: IntervalKind): number {
  return kind === 'semitone' ? 1 : 2
}

function tetrachordPitches(start: number, pattern: SchemePattern): number[] {
  const notes = [start]
  let pitch = start
  for (const step of pattern) {
    pitch += intervalSemitones(step)
    notes.push(pitch)
  }
  return notes
}

function fitPleasantRange(notes: number[]): number[] {
  if (notes.length === 0) return notes
  let shifted = [...notes]
  for (let i = 0; i < 8 && Math.max(...shifted) > MELODY_MAX_MIDI; i++) {
    shifted = shifted.map((n) => n - 12)
  }
  for (let i = 0; i < 8 && Math.min(...shifted) < MELODY_MIN_MIDI; i++) {
    shifted = shifted.map((n) => n + 12)
  }
  return shifted
}

/** Eight pitches: two tetrachords joined by a connecting tone. */
export function modeToMidiNotes(mode: ModePattern, root = MELODY_ROOT_MIDI): number[] {
  const first = tetrachordPitches(root, mode.first)
  const lastOfFirst = first[first.length - 1] ?? root
  const second = tetrachordPitches(lastOfFirst + intervalSemitones('tc'), mode.second)
  return fitPleasantRange([...first, ...second])
}

export type MelodyBarOptions = {
  mode: ModePattern
  bpm: number
  beatsPerMeasure: number
  /** MIDI root of the selected key. Defaults to E4. */
  root?: number
  /** Absolute AudioContext time of the downbeat click. */
  when: number
}

/**
 * Warm triangle lead for tetrachord practice. Stays in a mid register so it
 * sits next to the wooden metronome without harsh highs.
 */
export class MelodyVoice {
  private synth: PolySynth<Synth> | null = null
  private filter: Filter | null = null
  private volume: Volume | null = null
  private alive = false

  async ready(): Promise<void> {
    await unlockAudio()
    if (!this.synth) this.buildGraph()
    if (this.volume) this.volume.mute = false
    this.alive = true
  }

  playBar(options: MelodyBarOptions): void {
    if (!this.alive || !this.synth) return

    const midiNotes = modeToMidiNotes(options.mode, options.root ?? MELODY_ROOT_MIDI)
    if (midiNotes.length === 0) return

    const barSec = secondsPerBeat(options.bpm) * options.beatsPerMeasure
    const step = barSec / MELODY_NOTES_PER_BAR
    const dur = Math.max(0.05, step * 0.7)
    const t0 = Math.max(options.when, immediate() + 0.001)

    this.synth.releaseAll(t0)
    for (let i = 0; i < MELODY_NOTES_PER_BAR; i++) {
      const midi = midiNotes[i % midiNotes.length]
      if (midi === undefined) continue
      const note = Midi(midi).toNote()
      this.synth.triggerAttackRelease(note, dur, t0 + i * step, 0.55)
    }
  }

  silence(): void {
    this.alive = false
    if (this.volume) this.volume.mute = true
    this.synth?.releaseAll()
    this.tearDown()
  }

  dispose(): void {
    this.silence()
  }

  private tearDown(): void {
    this.synth?.dispose()
    this.filter?.dispose()
    this.volume?.dispose()
    this.synth = null
    this.filter = null
    this.volume = null
  }

  private buildGraph(): void {
    this.volume = new Volume(-9).toDestination()
    this.volume.mute = false
    this.filter = new Filter({
      type: 'lowpass',
      frequency: 2100,
      Q: 0.4,
    }).connect(this.volume)
    this.synth = new PolySynth(Synth, {
      oscillator: { type: 'triangle' },
      envelope: {
        attack: 0.014,
        decay: 0.18,
        sustain: 0.12,
        release: 0.26,
      },
    }).connect(this.filter)
    this.synth.maxPolyphony = MELODY_NOTES_PER_BAR
  }
}

export const melodyVoice = new MelodyVoice()
