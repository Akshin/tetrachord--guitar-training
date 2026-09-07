import {
  Chorus,
  Filter,
  Midi,
  PolySynth,
  Reverb,
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
 * Soft lead that lives in the same hall as the strings pad:
 * fat triangle, chorus, convolution reverb. Notes stay readable.
 */
export class MelodyVoice {
  private synth: PolySynth<Synth> | null = null
  private filter: Filter | null = null
  private chorus: Chorus | null = null
  private reverb: Reverb | null = null
  private volume: Volume | null = null
  private building: Promise<void> | null = null
  private alive = false

  async ready(): Promise<void> {
    await unlockAudio()
    if (!this.synth) {
      this.building ??= this.buildGraph()
      try {
        await this.building
      } finally {
        this.building = null
      }
    }
    if (this.volume) this.volume.mute = false
    this.alive = true
  }

  playBar(options: MelodyBarOptions): void {
    if (!this.alive || !this.synth) return

    const midiNotes = modeToMidiNotes(options.mode, options.root ?? MELODY_ROOT_MIDI)
    if (midiNotes.length === 0) return

    const barSec = secondsPerBeat(options.bpm) * options.beatsPerMeasure
    const step = barSec / MELODY_NOTES_PER_BAR
    const dur = Math.max(0.08, step * 0.84)
    const t0 = Math.max(options.when, immediate() + 0.001)

    this.synth.releaseAll(t0)
    for (let i = 0; i < MELODY_NOTES_PER_BAR; i++) {
      const midi = midiNotes[i % midiNotes.length]
      if (midi === undefined) continue
      const note = Midi(midi).toNote()
      this.synth.triggerAttackRelease(note, dur, t0 + i * step, 0.46)
    }
  }

  silence(): void {
    this.alive = false
    this.synth?.releaseAll()
    if (this.volume) this.volume.mute = true
  }

  dispose(): void {
    this.alive = false
    this.synth?.releaseAll()
    this.tearDown()
  }

  private tearDown(): void {
    this.synth?.dispose()
    this.filter?.dispose()
    this.chorus?.dispose()
    this.reverb?.dispose()
    this.volume?.dispose()
    this.synth = null
    this.filter = null
    this.chorus = null
    this.reverb = null
    this.volume = null
  }

  private async buildGraph(): Promise<void> {
    this.volume = new Volume(-11).toDestination()
    this.volume.mute = false

    this.reverb = new Reverb({
      decay: 2.6,
      preDelay: 0.028,
      wet: 0.36,
    })
    await this.reverb.ready
    this.reverb.connect(this.volume)

    this.chorus = new Chorus({
      frequency: 0.65,
      delayTime: 3.4,
      depth: 0.32,
      spread: 150,
      wet: 0.22,
    })
    this.chorus.connect(this.reverb)
    this.chorus.start()

    this.filter = new Filter({
      type: 'lowpass',
      frequency: 1760,
      Q: 0.42,
      rolloff: -24,
    }).connect(this.chorus)

    this.synth = new PolySynth(Synth, {
      oscillator: {
        type: 'fattriangle',
        spread: 12,
        count: 2,
      },
      envelope: {
        attack: 0.04,
        decay: 0.26,
        sustain: 0.3,
        release: 0.82,
      },
    }).connect(this.filter)
    this.synth.maxPolyphony = 16
  }
}

export const melodyVoice = new MelodyVoice()
