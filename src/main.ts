import el from "./el.ts";
import Counter from "./counter.ts";
import { noteFromNum, playFreq } from "./music.ts";
import { createStore } from "./store.ts";

// STATE
///////////////

const notesPerMinute = createStore(45);
const maxInterval = createStore(7);
const onStopCleanup = createStore(null as null | (() => void));
const midiMode = createStore(false);

// UI
///////////////

const notesPerMinSlider = el(
  "label",
  {
    style: {
      display: "flex",
      gap: ".5rem",
      alignContent: "center",
      justifyContent: "center",
    },
  },
  el("input", {
    type: "range",
    style: { flexGrow: "1" },
    oninput: (e) => {
      notesPerMinute.set(Number((e.target as HTMLInputElement).value));
    },
    min: "15",
    max: "180",
    step: "1",
    value: notesPerMinute.get().toString(),
    onMount: (el) => {
      midiMode.subscribe((newVal) => {
        el.disabled = newVal;
      });
    },
  }),
  el("span", {
    onMount: (el) => {
      notesPerMinute.subscribe((newVal) => {
        el.textContent = String(newVal);
      });
    },
    style: {
      width: "2rem",
      textAlign: "center",
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
      {
        onMount: (el) => {
          onStopCleanup.subscribe((cleanup) => {
            el.disabled = cleanup !== null;
          });
        },
      },
      el("legend", {}, "Settings"),

      el(
        "label",
        {
          style: { display: "flex", gap: ".5rem", alignItems: "center" },
          // on input, set midiMode to the checked value
          oninput: (e) => {
            midiMode.set((e.target as HTMLInputElement).checked);
          },
        },
        el("input", { type: "checkbox" }),
        "MIDI mode",
      ),
      // have devices select here! why not

      "Notes per minute",
      notesPerMinSlider,
      "Max interval (in semitones)",
      Counter(maxInterval, 1, 20),
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
          onStopCleanup.subscribe((cleanup) => {
            el.textContent = cleanup === null ? "Start" : "Stop";
            el.style.backgroundColor = cleanup === null ? "#cfc" : "#fcc";
          });
        },
      },
      "start",
    ),
    el(
      "small",
      { style: { display: "block" } },
      "First note is always c4. Notes stay between c3 and c5.",
    ),
  ),
);

function onStartStop() {
  const curNoteCleanup = onStopCleanup.get();

  if (curNoteCleanup === null) {
    if (midiMode.get()) {
      startMidiMode();
    } else {
      notesPerMinMode();
    }
  } else {
    curNoteCleanup();
    onStopCleanup.set(null);
  }
}

function startMidiMode() {
  const minNote = 60 - 12;
  const possibleNotes = Array.from({ length: 24 }, (_, i) =>
    noteFromNum(i + minNote),
  );
  let lastNoteIndex = 12;
  let correct = 0;
  setupNewNote(12);

  function setupNewNote(startNote?: number) {
    let newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
    if (startNote) {
      newNoteIndex = startNote;
    } else {
      while (
        Math.abs(newNoteIndex - lastNoteIndex) > maxInterval.get() ||
        newNoteIndex === lastNoteIndex
      ) {
        newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
      }
      lastNoteIndex = newNoteIndex;
    }

    const note = possibleNotes[newNoteIndex];
    const cancelNote = playFreq(note.freq);

    onMidiNoteDown = (noteNum) => {
      console.log(note.num, noteNum);
      if (note.num === noteNum) {
        setupNewNote();
        correct++;
      } else {
        alert(`Incorrect guess!\nYou got ${correct} correct in a row`);
        cancelNote();
        onMidiNoteDown = () => {};
      }
    };

    onStopCleanup.set(() => {
      cancelNote();
      onMidiNoteDown = () => {};
    });
  }
}

function notesPerMinMode() {
  const minNote = 60 - 12;
  const possibleNotes = Array.from({ length: 24 }, (_, i) =>
    noteFromNum(i + minNote),
  );
  // first note should be C4
  let lastNoteIndex = 12;
  const note = possibleNotes[lastNoteIndex];

  const cancelNote = playFreq(note.freq);
  const noteTimeout = scheduleNextNote();
  onStopCleanup.set(() => {
    cancelNote();
    clearTimeout(noteTimeout);
  });

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
        onStopCleanup.set(() => {
          clearTimeout(noteTimeout);
          cancelNote();
        });
      },
      (1000 * 60) / notesPerMinute.get(),
    );
  }
}

let onMidiNoteDown: (noteNum: number) => void = () => {};

const midiAccess = await navigator.requestMIDIAccess();
const midiInputs = Array.from(midiAccess.inputs.values());
// TODO: handle case of multiple MIDI inputs maybe?
if (midiInputs.length > 0) {
  const midiInput = midiInputs[0];
  midiInput.onmidimessage = (e) => {
    if (!e.data) return;
    const [command, note, velocity] = e.data;
    if (command === 144 && velocity > 0) {
      onMidiNoteDown(note);
    }
  };
}
