import unknownUrl from '@/assets/bg/0-unknown.png'
import ionianUrl from '@/assets/bg/1-ionian.png'
import dorianUrl from '@/assets/bg/2-dorian.png'
import phrygianUrl from '@/assets/bg/3-phrygian.png'
import lydianUrl from '@/assets/bg/4-lydian.png'
import mixolydianUrl from '@/assets/bg/5-mixolydian.png'
import aeolianUrl from '@/assets/bg/6-aeolian.png'
import locrianUrl from '@/assets/bg/7-locrian.png'
import { findNamedMode, type NamedModeId } from '@/training/modes'
import type { ModePattern } from '@/training/patterns'

/** 0 = unnamed tetrachord pair; 1–7 follow DIATONIC_MODES order. */
export type ModeBackdropId = 'unknown' | NamedModeId

export const MODE_BACKDROP_FILES = {
  unknown: unknownUrl,
  ionian: ionianUrl,
  dorian: dorianUrl,
  phrygian: phrygianUrl,
  lydian: lydianUrl,
  mixolydian: mixolydianUrl,
  aeolian: aeolianUrl,
  locrian: locrianUrl,
} as const satisfies Record<ModeBackdropId, string>

export const MODE_BACKDROP_ORDER = [
  'unknown',
  'ionian',
  'dorian',
  'phrygian',
  'lydian',
  'mixolydian',
  'aeolian',
  'locrian',
] as const satisfies readonly ModeBackdropId[]

export function modeBackdropId(mode: ModePattern | null): ModeBackdropId {
  if (!mode) return 'unknown'
  return findNamedMode(mode)?.id ?? 'unknown'
}
