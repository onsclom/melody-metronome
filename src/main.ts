import el from "./el.ts";
import Counter from "./counter.ts";
import { noteFromNum, playFreq } from "./music.ts";
import { createStore } from "./store.ts";

// STATE
///////////////

const notesPerMinute = createStore(45);
const maxInterval = createStore(7);
const noteCleanup = createStore(null as null | (() => void));

// UI
///////////////

const notesPerMinSlider = el(
  "label",
  { style: { display: "flex", gap: ".5rem" } },
  "Notes per minute:",
  el("input", {
    type: "range",
    oninput: (e) => {
      notesPerMinute.set(Number((e.target as HTMLInputElement).value));
    },
    min: "15",
    max: "180",
    step: "1",
    value: notesPerMinute.get().toString(),
  }),
  el("span", {
    onMount: (el) => {
      notesPerMinute.subscribe((newVal) => {
        el.textContent = String(newVal);
      });
    },
  }),
);

document.body.appendChild(
  el(
    "main",
    {
      style: {
        maxWidth: "30rem",
        margin: "auto",
        padding: "1rem",
      },
    },
    el("h1", {}, "Melody Metronome"),

    el(
      "fieldset",
      {},
      el("legend", {}, "Settings"),
      notesPerMinSlider,
      el(
        "span",
        { style: { display: "flex", gap: ".5rem" } },
        "Max interval (in semitones): ",
        Counter(maxInterval, 1, 20),
      ),
    ),
    el(
      "button",
      {
        style: {
          padding: "1rem",
          width: "100%",
          marginTop: "1rem",
          cursor: "pointer",
        },
        onclick: onStartStop,
        onMount: (el) => {
          noteCleanup.subscribe((cleanup) => {
            el.textContent = cleanup === null ? "Start" : "Stop";
            el.style.backgroundColor = cleanup === null ? "#cfc" : "#fcc";
          });
        },
      },
      "start",
    ),
    el("small", { style: { display: "block" } }, "first note is always c4"),
  ),
);

function onStartStop() {
  const minNote = 60 - 12;
  const possibleNotes = Array.from({ length: 24 }, (_, i) =>
    noteFromNum(i + minNote),
  );
  const curNoteCleanup = noteCleanup.get();

  if (curNoteCleanup === null) {
    // first note should be C4
    let lastNoteIndex = 12;
    const note = possibleNotes[lastNoteIndex];

    function scheduleNextNote() {
      return setTimeout(
        () => {
          let newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
          while (
            Math.abs(newNoteIndex - lastNoteIndex) > maxInterval.get() ||
            newNoteIndex === lastNoteIndex
          ) {
            newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
          }
          lastNoteIndex = newNoteIndex;
          const note = possibleNotes[newNoteIndex];
          const cancelNote = playFreq(note.freq);
          const noteTimeout = scheduleNextNote();
          noteCleanup.set(() => {
            clearTimeout(noteTimeout);
            cancelNote();
          });
        },
        (1000 * 60) / notesPerMinute.get(),
      );
    }
    const cancelNote = playFreq(note.freq);
    const noteTimeout = scheduleNextNote();
    noteCleanup.set(() => {
      cancelNote();
      clearTimeout(noteTimeout);
    });
  } else {
    curNoteCleanup();
    noteCleanup.set(null);
  }
}
