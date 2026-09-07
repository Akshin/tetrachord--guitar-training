# Current: tetrachord guitar training

Vue 3 + Vite play view at `/play`. Install with `--legacy-peer-deps`.

## Product

Tetrachord training: two schemes joined by ТС make a лад. Colors: tone yellow, semitone green, ТС gray.

## Play audio

- Melody follows selected **тональность** (`midiRootForKey`).
- Backing tracks in `src/assets/audio/backing_tracks/strings/`: naturals `A.mp3`, sharps `As.mp3` (Vite cannot import `#` in filenames). UI still shows `A#`.
- Metronome clicks can mute while beat clock still runs (schemes + melody stay in time).

## Play UI

Footer grouping is decided in GLOBAL.md; not implemented yet. Continue other work until asked.

## Tab helper

`TabHelper` / `PianoHelper` sit under each `ModeScheme` card. Switch via **Показать табы**: Нет (default, helpers hidden), Гитара, or Пианино.
