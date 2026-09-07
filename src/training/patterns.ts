export type IntervalKind = 'tone' | 'semitone' | 'tc'

/** Three intervals of a tetrachord (or Lydian T–T–T). */
export type SchemePattern = readonly [IntervalKind, IntervalKind, IntervalKind]

/** A mode (лад) is two tetrachord schemes joined by a connecting tone (ТС). */
export type ModePattern = {
  first: SchemePattern
  second: SchemePattern
}

export const SCHEME_PATTERNS: readonly SchemePattern[] = [
  ['tone', 'tone', 'semitone'],
  ['tone', 'semitone', 'tone'],
  ['semitone', 'tone', 'tone'],
] as const

export const CHANGE_EVERY_MIN = 1
export const CHANGE_EVERY_MAX = 10
export const CHANGE_EVERY_DEFAULT = 1

export const CHANGE_EVERY_OPTIONS: readonly number[] = Array.from(
  { length: CHANGE_EVERY_MAX - CHANGE_EVERY_MIN + 1 },
  (_, i) => CHANGE_EVERY_MIN + i,
)

export type ChangeEvery = number

export function clampChangeEvery(value: number, fallback = CHANGE_EVERY_DEFAULT): number {
  if (!Number.isFinite(value)) return fallback
  return Math.min(CHANGE_EVERY_MAX, Math.max(CHANGE_EVERY_MIN, Math.round(value)))
}

export function changeEveryLabel(value: number): string {
  const n = clampChangeEvery(value)
  if (n === 1) return 'раз в такт'
  const mod10 = n % 10
  const mod100 = n % 100
  const noun =
    mod10 === 1 && mod100 !== 11
      ? 'такт'
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? 'такта'
        : 'тактов'
  return `раз в ${n} ${noun}`
}

export function intervalLabel(kind: IntervalKind): string {
  if (kind === 'semitone') return 'Полутон'
  if (kind === 'tc') return 'Тон связующий'
  return 'Тон'
}

export const SCHEME_IDS = ['S1', 'S2', 'S3'] as const
export type SchemeId = (typeof SCHEME_IDS)[number]

export function schemeId(pattern: SchemePattern): SchemeId | null {
  const index = SCHEME_PATTERNS.findIndex((entry) => samePattern(entry, pattern))
  if (index === -1) return null
  return SCHEME_IDS[index] ?? null
}

export function modeSchemeCombo(mode: ModePattern): string | null {
  const first = schemeId(mode.first)
  const second = schemeId(mode.second)
  if (!first || !second) return null
  return `${first} + ${second}`
}

export function schemeLabel(pattern: SchemePattern): string {
  return pattern.map((kind) => intervalLabel(kind)).join(', ')
}

export function modeLabel(mode: ModePattern): string {
  return `${schemeLabel(mode.first)} · ${schemeLabel(mode.second)}`
}

function samePattern(a: SchemePattern, b: SchemePattern): boolean {
  return a[0] === b[0] && a[1] === b[1] && a[2] === b[2]
}

export function sameMode(a: ModePattern, b: ModePattern): boolean {
  return samePattern(a.first, b.first) && samePattern(a.second, b.second)
}

export function randomScheme(exclude?: SchemePattern): SchemePattern {
  const pool = exclude
    ? SCHEME_PATTERNS.filter((pattern) => !samePattern(pattern, exclude))
    : SCHEME_PATTERNS
  const pick = pool[Math.floor(Math.random() * pool.length)]
  return pick ?? SCHEME_PATTERNS[0]!
}

export function randomMode(exclude?: ModePattern): ModePattern {
  let mode: ModePattern = {
    first: randomScheme(),
    second: randomScheme(),
  }
  let tries = 0
  while (exclude && sameMode(mode, exclude) && tries < 24) {
    mode = {
      first: randomScheme(),
      second: randomScheme(),
    }
    tries += 1
  }
  return mode
}
