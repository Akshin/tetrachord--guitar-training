# Current: tetrachord guitar training

Vue 3 + Vite play view at `/play`. Install with `--legacy-peer-deps`.

## Product

Tetrachord training: two schemes joined by ТС make a лад. Colors: tone yellow, semitone green, ТС gray.

## Play audio

- Default key **A**. Control label: **Тональный центр**. Melody and backing off.
- Melody is a fat-triangle lead with chorus + hall reverb. Graph stays alive between stop/play; mute on silence.
- Backing tracks in `src/assets/audio/backing_tracks/strings/`: naturals `A.mp3`, sharps `As.mp3` (Vite cannot import `#` in filenames). UI still shows `A#`.
- Metronome clicks can mute while beat clock still runs (schemes + melody stay in time).

## Play UI

Footer: one console (Ритм / Упражнение / Звук), then Play. Console can be stowed with the top-right X; a caret restores it.

## Mode backdrops

PNGs in `src/assets/bg/`, mapped in `src/training/modeBackgrounds.ts`. Eagerly imported; PlayView crossfades them (full width, bottom-aligned, low opacity). 0 = unnamed pair, then DIATONIC_MODES order:

0 unknown · 1 ionian · 2 dorian · 3 phrygian · 4 lydian · 5 mixolydian · 6 aeolian · 7 locrian

## Home

`HomeView` is the method page: training loop first, then what a card is (plus a **Табы** tip), three schemes (narrow cards, not full bleed), named modes (plus a quiz tip: hide names via **Отображение лада**), up/down, play controls.

## Tab helper

`TabHelper` / `PianoHelper` sit under each `ModeScheme` card. Switch via **Табы**: Нет (default, helpers hidden), Гитара, or Пианино. **Отображение лада** hides only the diatonic name; the name is overlaid so the scheme card does not shift. Right card caption is a live countdown to the next scheme change (BPM × meter × bars until change).
