import el from "./el.ts";
import Counter from "./counter.ts";
import { noteFromNum, playFreq } from "./music.ts";

const state = {
  curNote: 0,
  notesPerMinute: 45,
  noteAmount: 5,
  maxInterval: 7,
  melodyTimeouts: [] as number[],
  // if null, we are playing
  noteCleanup: null as null | (() => void),
};

const startStopButton = el(
  "button",
  {
    style: { padding: "1rem" },
    onclick: () => {
      const minNote = 60 - 12;
      const possibleNotes = Array.from({ length: 24 }, (_, i) =>
        noteFromNum(i + minNote),
      );
      if (state.noteCleanup === null) {
        // first note should be C4
        let lastNoteIndex = 12;
        const note = possibleNotes[lastNoteIndex];

        function scheduleNextNote() {
          return setTimeout(
            () => {
              let newNoteIndex = Math.floor(
                Math.random() * possibleNotes.length,
              );
              while (
                Math.abs(newNoteIndex - lastNoteIndex) > state.maxInterval ||
                newNoteIndex === lastNoteIndex
              ) {
                newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
              }
              lastNoteIndex = newNoteIndex;
              const note = possibleNotes[newNoteIndex];
              const cancelNote = playFreq(note.freq);
              const noteTimeout = scheduleNextNote();
              state.noteCleanup = () => {
                clearTimeout(noteTimeout);
                cancelNote();
              };
            },
            (1000 * 60) / state.notesPerMinute,
          );
        }
        const cancelNote = playFreq(note.freq);
        const noteTimeout = scheduleNextNote();
        state.noteCleanup = () => {
          cancelNote();
          clearTimeout(noteTimeout);
        };
      } else {
        state.noteCleanup();
        state.noteCleanup = null;
      }

      startStopButton.textContent =
        state.noteCleanup === null ? "start" : "stop";
    },
  },
  "start",
);
const notesPerMinSpan = el("span", {}, String(state.notesPerMinute));
document.body.appendChild(
  el(
    "div",
    {},
    el(
      "label",
      { style: { display: "flex", gap: ".5rem" } },
      "Notes per minute: ",
      el("input", {
        type: "range",
        oninput: (e) => {
          state.notesPerMinute = Number((e.target as HTMLInputElement).value);
          notesPerMinSpan.textContent = String(state.notesPerMinute);
        },
        min: "15",
        max: "180",
        step: "1",
        value: String(state.notesPerMinute),
      }),
      notesPerMinSpan,
    ),
    el(
      "label",
      { style: { display: "flex", gap: ".5rem" } },
      "Max interval (in semitones): ",
      Counter(
        state.maxInterval,
        (newVal) => (state.maxInterval = newVal),
        1,
        20,
      ),
    ),
    startStopButton,
    el("small", { style: { display: "block" } }, "first note is always c4"),
  ),
);
