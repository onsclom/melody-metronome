# melody-metronome

A tool for practicing an instrument and ear training. Two modes:

- **Metronome**: plays interval tones at a configurable notes-per-minute.
- **MIDI**: connect a MIDI instrument and practice identifying intervals by ear.

## Getting started

```sh
bun install
bun run dev      # dev server
bun run build    # type-check + production build
```

`npm` works too.

## Handmade UI

Zero runtime dependencies. The UI is built from two ~25-line primitives:

- [`src/el.ts`](src/el.ts): `el(tag, props, ...children)` wraps `createElement`.
- [`src/store.ts`](src/store.ts): tiny observable store with `get` / `set` / `subscribe`.

Components build the DOM with `el(...)` and use its `onMount` hook to subscribe individual nodes to stores. No virtual DOM, no diffing.
