import { unlockAudio } from '@/audio/melody'

export const TRACK_KEYS = [
  'C',
  'C#',
  'D',
  'D#',
  'E',
  'F',
  'F#',
  'G',
  'G#',
  'A',
  'A#',
  'B',
] as const

export type TrackKey = (typeof TRACK_KEYS)[number]

export const TRACK_KEY_DEFAULT: TrackKey = 'E'

/** C4 plus the pitch class of the chosen key. */
export function midiRootForKey(key: TrackKey): number {
  const index = TRACK_KEYS.indexOf(key)
  return 60 + (index === -1 ? TRACK_KEYS.indexOf(TRACK_KEY_DEFAULT) : index)
}

const trackUrls = import.meta.glob<string>('../assets/audio/backing_tracks/strings/*.mp3', {
  eager: true,
  query: '?url',
  import: 'default',
})

function fileNameForKey(key: TrackKey): string {
  return `${key.replace('#', 's')}.mp3`
}

function urlForKey(key: TrackKey): string | undefined {
  const name = fileNameForKey(key)
  for (const [path, url] of Object.entries(trackUrls)) {
    const file = decodeURIComponent((path.split('/').pop() ?? '').split('?')[0] ?? '')
    if (file === name) return url
  }
  return undefined
}

/**
 * Looped strings pad in the chosen key, on the same AudioContext as the metronome.
 */
export class BackingTrackPlayer {
  private enabled = false
  private session = false
  private key: TrackKey = TRACK_KEY_DEFAULT
  private cache = new Map<TrackKey, AudioBuffer>()
  private loading = new Map<TrackKey, Promise<AudioBuffer>>()
  private source: AudioBufferSourceNode | null = null
  private gain: GainNode | null = null
  private generation = 0

  setEnabled(on: boolean): void {
    this.enabled = on
    if (!on) this.stopSource()
    else void this.sync()
  }

  setKey(key: TrackKey): void {
    if (key === this.key) return
    this.key = key
    void this.sync(true)
  }

  setSession(on: boolean): void {
    this.session = on
    if (!on) this.stopSource()
    else void this.sync()
  }

  dispose(): void {
    this.session = false
    this.enabled = false
    this.stopSource()
    this.cache.clear()
    this.loading.clear()
  }

  private async sync(restart = false): Promise<void> {
    if (!this.enabled || !this.session) {
      this.stopSource()
      return
    }

    const gen = ++this.generation
    const key = this.key
    const ctx = await unlockAudio()
    const buffer = await this.load(key, ctx)
    if (gen !== this.generation || !this.enabled || !this.session) return
    if (restart || !this.source) this.startSource(ctx, buffer)
  }

  private async load(key: TrackKey, ctx: AudioContext): Promise<AudioBuffer> {
    const cached = this.cache.get(key)
    if (cached) return cached

    const pending = this.loading.get(key)
    if (pending) return pending

    const url = urlForKey(key)
    if (!url) throw new Error(`No backing track for ${key}`)

    const task = (async () => {
      try {
        const response = await fetch(url)
        if (!response.ok) throw new Error(`Failed to load backing track ${key}`)
        const data = await response.arrayBuffer()
        const buffer = await ctx.decodeAudioData(data.slice(0))
        this.cache.set(key, buffer)
        return buffer
      } finally {
        this.loading.delete(key)
      }
    })()

    this.loading.set(key, task)
    return task
  }

  private startSource(ctx: AudioContext, buffer: AudioBuffer): void {
    this.stopSource()
    this.gain = ctx.createGain()
    this.gain.gain.value = 0.34
    this.gain.connect(ctx.destination)
    this.source = ctx.createBufferSource()
    this.source.buffer = buffer
    this.source.loop = true
    this.source.connect(this.gain)
    this.source.start(ctx.currentTime)
  }

  private stopSource(): void {
    this.generation += 1
    if (this.source) {
      try {
        this.source.stop()
      } catch {
        /* already stopped */
      }
      this.source.disconnect()
      this.source = null
    }
    if (this.gain) {
      this.gain.disconnect()
      this.gain = null
    }
  }
}

export const backingTrack = new BackingTrackPlayer()
