/** Shared tempo limits (Maelzel metronome range). */
export const BPM_MIN = 40
export const BPM_MAX = 208
export const BPM_DEFAULT = 80

/** Beats per measure (numerator of the time signature). */
export const BEATS_MIN = 2
export const BEATS_MAX = 6
export const BEATS_DEFAULT = 4

export type TimeSignatureOption = {
  label: string
  beats: number
}

/** Common practice meters for the transport. */
export const TIME_SIGNATURES: readonly TimeSignatureOption[] = [
  { label: '2/4', beats: 2 },
  { label: '3/4', beats: 3 },
  { label: '4/4', beats: 4 },
  { label: '5/4', beats: 5 },
  { label: '6/8', beats: 6 },
] as const

const LOOKAHEAD_MS = 25
const SCHEDULE_AHEAD_S = 0.1
const STRIKE_S = 0.032
const BODY_S = 0.11
const NOISE_S = 0.05

export function clampBpm(value: number, fallback = BPM_DEFAULT): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(BPM_MAX, Math.max(BPM_MIN, Math.round(value)))
}

export function clampBeats(value: number, fallback = BEATS_DEFAULT): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(BEATS_MAX, Math.max(BEATS_MIN, Math.round(value)))
}

export function secondsPerBeat(bpm: number): number {
  return 60 / Math.max(1, bpm)
}

export type BeatEvent = {
  audioTime: number
  beatInMeasure: number
  isDownbeat: boolean
}

export type MetronomeOptions = {
  bpm?: number
  /** Accents every Nth beat. Default 4. */
  beatsPerMeasure?: number
  onBeat?: (event: BeatEvent) => void
  /** Fires when a click is scheduled, with a future audioTime. */
  onSchedule?: (event: BeatEvent) => void
}

/**
 * Web Audio metronome: schedules click ticks ahead of time so tempo stays stable.
 */
export class Metronome {
  private audioCtx: AudioContext | null = null
  private noiseBuffer: AudioBuffer | null = null
  private timerId: number | null = null
  private nextNoteTime = 0
  private beatCount = 0
  private _bpm: number
  private _beatsPerMeasure: number
  private _running = false
  private onBeat: ((event: BeatEvent) => void) | null
  private onSchedule: ((event: BeatEvent) => void) | null
  private beatTimers: number[] = []
  private ownsContext = false

  constructor(options: MetronomeOptions = {}) {
    this._bpm = clampBpm(options.bpm ?? BPM_DEFAULT)
    this._beatsPerMeasure = clampBeats(options.beatsPerMeasure ?? BEATS_DEFAULT)
    this.onBeat = options.onBeat ?? null
    this.onSchedule = options.onSchedule ?? null
  }

  setOnBeat(handler: ((event: BeatEvent) => void) | null): void {
    this.onBeat = handler
  }

  get bpm(): number {
    return this._bpm
  }

  get beatsPerMeasure(): number {
    return this._beatsPerMeasure
  }

  get running(): boolean {
    return this._running
  }

  setBpm(bpm: number): void {
    this._bpm = clampBpm(bpm, this._bpm)
    if (this._running && this.audioCtx) {
      // Keep the next scheduled click near "now" so tempo changes feel immediate.
      this.nextNoteTime = Math.max(this.nextNoteTime, this.audioCtx.currentTime + 0.02)
    }
  }

  setBeatsPerMeasure(beats: number): void {
    this._beatsPerMeasure = clampBeats(beats, this._beatsPerMeasure)
    // Align the next tick as a downbeat after a meter change.
    this.beatCount = 0
  }

  async start(external?: AudioContext): Promise<void> {
    if (this._running) return
    if (external) {
      this.audioCtx = external
      this.ownsContext = false
    }
    const ctx = this.getCtx()
    await ctx.resume()
    this._running = true
    this.beatCount = 0
    this.nextNoteTime = ctx.currentTime + 0.05
    this.schedule()
    this.timerId = window.setInterval(() => this.schedule(), LOOKAHEAD_MS)
  }

  stop(): void {
    this.clearBeatTimers()
    if (this.timerId !== null) {
      clearInterval(this.timerId)
      this.timerId = null
    }
    this.beatCount = 0
    this._running = false
  }

  dispose(): void {
    this.stop()
    if (this.ownsContext) void this.audioCtx?.close()
    this.audioCtx = null
    this.noiseBuffer = null
    this.ownsContext = false
  }

  private clearBeatTimers(): void {
    for (const id of this.beatTimers) window.clearTimeout(id)
    this.beatTimers = []
  }

  private notifyBeat(audioTime: number, isDownbeat: boolean, beatInMeasure: number): void {
    const handler = this.onBeat
    if (!handler || !this.audioCtx) return
    const delayMs = Math.max(0, (audioTime - this.audioCtx.currentTime) * 1000)
    const timerId = window.setTimeout(() => {
      this.beatTimers = this.beatTimers.filter((id) => id !== timerId)
      if (!this._running) return
      handler({ audioTime, isDownbeat, beatInMeasure })
    }, delayMs)
    this.beatTimers.push(timerId)
  }

  private getCtx(): AudioContext {
    if (!this.audioCtx) {
      this.audioCtx = new AudioContext()
      this.ownsContext = true
    }
    return this.audioCtx
  }

  private getNoiseBuffer(ctx: AudioContext): AudioBuffer {
    if (this.noiseBuffer && this.noiseBuffer.sampleRate === ctx.sampleRate) {
      return this.noiseBuffer
    }
    const length = Math.max(1, Math.floor(ctx.sampleRate * NOISE_S))
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1
    }
    this.noiseBuffer = buffer
    return buffer
  }

  /** Wooden Maelzel-style tick: muted wood body + short strike, not a square beep. */
  private playClick(time: number, accent: boolean): void {
    const ctx = this.getCtx()
    const out = ctx.createGain()
    const air = ctx.createBiquadFilter()
    air.type = 'lowpass'
    air.frequency.setValueAtTime(accent ? 4200 : 3200, time)
    air.Q.setValueAtTime(0.7, time)
    out.gain.setValueAtTime(1, time)
    air.connect(out)
    out.connect(ctx.destination)

    // Tick is a bit brighter; tock sits lower in the wood.
    const bodyHz = accent ? 920 : 680
    const partialHz = accent ? 1840 : 1320
    const thumpHz = accent ? 390 : 310

    this.playPartial(ctx, air, time, thumpHz, accent ? 0.16 : 0.12, BODY_S * 1.15)
    this.playPartial(ctx, air, time, bodyHz, accent ? 0.22 : 0.16, BODY_S)
    this.playPartial(ctx, air, time, partialHz, accent ? 0.08 : 0.05, BODY_S * 0.45)
    this.playStrike(ctx, air, time, accent)
  }

  private playPartial(
    ctx: AudioContext,
    dest: AudioNode,
    time: number,
    freq: number,
    peak: number,
    decay: number,
  ): void {
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(freq, time)
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq * 0.91), time + decay)
    gain.gain.setValueAtTime(peak, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + decay)
    osc.connect(gain)
    gain.connect(dest)
    osc.start(time)
    osc.stop(time + decay + 0.02)
  }

  private playStrike(ctx: AudioContext, dest: AudioNode, time: number, accent: boolean): void {
    const src = ctx.createBufferSource()
    src.buffer = this.getNoiseBuffer(ctx)

    const hip = ctx.createBiquadFilter()
    hip.type = 'highpass'
    hip.frequency.setValueAtTime(700, time)

    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.frequency.setValueAtTime(accent ? 2400 : 1650, time)
    band.Q.setValueAtTime(accent ? 1.6 : 2.1, time)

    const gain = ctx.createGain()
    gain.gain.setValueAtTime(accent ? 0.18 : 0.11, time)
    gain.gain.exponentialRampToValueAtTime(0.0001, time + STRIKE_S)

    src.connect(hip)
    hip.connect(band)
    band.connect(gain)
    gain.connect(dest)
    src.start(time)
    src.stop(time + NOISE_S)
  }

  private schedule(): void {
    if (!this._running) return
    const ctx = this.getCtx()
    while (this.nextNoteTime < ctx.currentTime + SCHEDULE_AHEAD_S) {
      const beatInMeasure = this.beatCount % this._beatsPerMeasure
      const accent = beatInMeasure === 0
      this.playClick(this.nextNoteTime, accent)
      const event: BeatEvent = {
        audioTime: this.nextNoteTime,
        isDownbeat: accent,
        beatInMeasure,
      }
      this.onSchedule?.(event)
      this.notifyBeat(this.nextNoteTime, accent, beatInMeasure)
      this.nextNoteTime += secondsPerBeat(this._bpm)
      this.beatCount += 1
    }
  }
}
