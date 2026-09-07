import {
  sameMode,
  type ModePattern,
  type SchemePattern,
} from '@/training/patterns'

/** The three diatonic tetrachord schemes used in this app. */
export const SCHEME_TTS = ['tone', 'tone', 'semitone'] as const satisfies SchemePattern
export const SCHEME_TST = ['tone', 'semitone', 'tone'] as const satisfies SchemePattern
export const SCHEME_STT = ['semitone', 'tone', 'tone'] as const satisfies SchemePattern

/**
 * Lydian tetrachord (тон–тон–тон): spans an augmented fourth.
 * Used only in Lydian / Locrian decompositions in classical pedagogy.
 */
export const SCHEME_TTT = ['tone', 'tone', 'tone'] as const satisfies SchemePattern

export type NamedModeId =
  | 'ionian'
  | 'dorian'
  | 'phrygian'
  | 'lydian'
  | 'mixolydian'
  | 'aeolian'
  | 'locrian'

export type NamedMode = {
  id: NamedModeId
  /** Russian display name. */
  name: string
  /** Optional clarifying subtitle (e.g. натуральный мажор). */
  aka?: string
  /** Lower tetrachord + upper tetrachord joined by a connecting tone (ТС). */
  mode: ModePattern
}

/**
 * Seven diatonic modes (лады) from seven scale degrees.
 * Built as two tetrachords with a connecting whole tone between them
 * (except Lydian / Locrian, which use the Lydian tetrachord T–T–T in pedagogy).
 *
 * @see https://solfeggio-online.ru/diatonicheskie-lady/
 */
export const DIATONIC_MODES: readonly NamedMode[] = [
  {
    id: 'ionian',
    name: 'Ионийский',
    aka: 'натуральный мажор',
    mode: { first: SCHEME_TTS, second: SCHEME_TTS },
  },
  {
    id: 'dorian',
    name: 'Дорийский',
    mode: { first: SCHEME_TST, second: SCHEME_TST },
  },
  {
    id: 'phrygian',
    name: 'Фригийский',
    mode: { first: SCHEME_STT, second: SCHEME_STT },
  },
  {
    id: 'lydian',
    name: 'Лидийский',
    mode: { first: SCHEME_TTT, second: SCHEME_TTS },
  },
  {
    id: 'mixolydian',
    name: 'Миксолидийский',
    mode: { first: SCHEME_TTS, second: SCHEME_TST },
  },
  {
    id: 'aeolian',
    name: 'Эолийский',
    aka: 'натуральный минор',
    mode: { first: SCHEME_TST, second: SCHEME_STT },
  },
  {
    id: 'locrian',
    name: 'Локрийский',
    mode: { first: SCHEME_STT, second: SCHEME_TTT },
  },
] as const

/** Modes that can appear with the app’s three practice schemes + ТС. */
export const PRACTICABLE_MODES: readonly NamedMode[] = DIATONIC_MODES.filter(
  (entry) =>
    entry.id !== 'lydian' &&
    entry.id !== 'locrian',
)

export function findNamedMode(mode: ModePattern): NamedMode | null {
  return DIATONIC_MODES.find((entry) => sameMode(entry.mode, mode)) ?? null
}

export function namedModeTitle(entry: NamedMode): string {
  return entry.aka ? `${entry.name} · ${entry.aka}` : entry.name
}
