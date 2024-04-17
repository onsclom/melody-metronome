import el from "./el.ts";
import Counter from "./counter.ts";
import { noteFromNum, playFreq } from "./music.ts";
import { createStore } from "./store.ts";

// STATE
///////////////

const tab = createStore("Metronome" as "Metronome" | "MIDI");
const midiDelay = createStore(500);
const notesPerMinute = createStore(45);
const maxInterval = createStore(7);
const onStopCleanup = createStore(null as null | (() => void));
const midiStats = createStore({ correct: 0, incorrect: 0 });
const midiDevicesConnected = createStore(0);

// UI
///////////////

const tabStyle = {
  borderRadius: "10px 10px 0 0",
  padding: ".5rem",
  cursor: "pointer",
};

const tabs = () =>
  el(
    "div",
    { style: { display: "flex" } },
    el(
      "button",
      {
        style: tabStyle,
        onclick: () => {
          tab.set("Metronome");
          onStopCleanup.get()?.();
          onStopCleanup.set(null);
        },
        onMount: (el) => {
          tab.subscribe((newTab) => {
            el.disabled = newTab === "Metronome";
          });
        },
      },
      "Metronome",
    ),
    el(
      "button",
      {
        style: tabStyle,
        onclick: () => {
          tab.set("MIDI");
          onStopCleanup.get()?.();
          onStopCleanup.set(null);
        },
        onMount: (el) => {
          tab.subscribe((newTab) => {
            el.disabled = newTab === "MIDI";
          });
        },
      },
      "MIDI",
    ),
  );

const midiDelaySlider = () =>
  el(
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
        midiDelay.set(Number((e.target as HTMLInputElement).value));
      },
      min: "0",
      max: "1000",
      step: "1",
      value: midiDelay.get().toString(),
    }),
    el("span", {
      onMount: (el) => {
        midiDelay.subscribe((newVal) => {
          el.textContent = `${newVal}ms`;
        });
      },
      style: {
        width: "4rem",
        textAlign: "center",
      },
    }),
  );

const notesPerMinSlider = () =>
  el(
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
      max: "100",
      step: "1",
      value: notesPerMinute.get().toString(),
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

const metronome = () =>
  el(
    "div",
    {},
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
      "Notes per minute",
      notesPerMinSlider(),
      "Max interval (in semitones)",
      Counter(maxInterval, 1, 20),
    ),
    el(
      "small",
      { style: { display: "block" } },
      "First note is always c4. Notes stay between c3 and c5.",
    ),
    el(
      "button",
      {
        style: {
          padding: "1rem",
          width: "100%",
          marginTop: ".5rem",
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
  );

const midi = () =>
  el(
    "div",
    {},
    el("div", {
      style: { textAlign: "center", marginTop: ".5rem" },
      onMount: (el) => {
        midiDevicesConnected.subscribe((num) => {
          el.textContent =
            num > 0
              ? `✅ MIDI device detected ✅`
              : "❌ No MIDI device detected ❌";
        });
      },
    }),
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
      "Delay after answer",
      midiDelaySlider(),
      "Max interval (in semitones)",
      Counter(maxInterval, 1, 20),
    ),
    el(
      "small",
      { style: { display: "block" } },
      "First note is always c4. Notes stay between c3 and c5.",
    ),
    el(
      "button",
      {
        style: {
          padding: "1rem",
          width: "100%",
          marginTop: ".5rem",
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
      "fieldset",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        },
      },
      el("legend", {}, "Stats"),
      // correctDiv,
      // incorrectDiv,
      el(
        "table",
        {},
        el(
          "thead",
          {},
          el(
            "tr",
            {},
            el("th", {}, "Correct"),
            el("th", {}, "Incorrect"),
            el("th", {}, "Percentage"),
          ),
        ),
        el(
          "tbody",
          {},
          el(
            "tr",
            {},
            el("td", {
              onMount: (el) =>
                midiStats.subscribe(
                  (newVal) => (el.innerText = newVal.correct.toString()),
                ),
            }),
            el("td", {
              onMount: (el) =>
                midiStats.subscribe(
                  (newVal) => (el.innerText = newVal.incorrect.toString()),
                ),
            }),
            el("td", {
              onMount: (el) => {
                midiStats.subscribe((newVal) => {
                  const total = newVal.correct + newVal.incorrect;
                  el.textContent =
                    total === 0
                      ? "0%"
                      : `${Math.round((newVal.correct / total) * 100)}%`;
                });
              },
            }),
          ),
        ),
      ),
      el(
        "button",
        {
          onclick: () => {
            midiStats.set({ correct: 0, incorrect: 0 });
          },
        },
        "Reset",
      ),
    ),
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
    el("h1", { style: { marginBottom: "1rem" } }, "Melody Metronome"),
    tabs(),
    el(
      "div",
      {
        onMount: (el) => {
          tab.subscribe((newTab) => {
            el.style.display = newTab === "Metronome" ? "block" : "none";
          });
        },
      },
      metronome(),
    ),
    el(
      "div",
      {
        onMount: (el) => {
          tab.subscribe((newTab) => {
            el.style.display = newTab === "MIDI" ? "block" : "none";
          });
        },
      },
      midi(),
    ),
  ),
);

// LOGIC
////////////

function onStartStop() {
  const curNoteCleanup = onStopCleanup.get();
  if (curNoteCleanup === null) {
    if (tab.get() === "MIDI") {
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

    let firstTry = true;
    onMidiNoteDown = (noteNum) => {
      if (note.num === noteNum) {
        if (firstTry)
          midiStats.set({
            ...midiStats.get(),
            correct: midiStats.get().correct + 1,
          });
        const nextNoteTimeout = setTimeout(setupNewNote, midiDelay.get());
        onMidiNoteDown = () => {};
        onStopCleanup.set(() => {
          cancelNote();
          clearTimeout(nextNoteTimeout);
        });
      } else {
        if (firstTry) {
          firstTry = false;
          midiStats.set({
            ...midiStats.get(),
            incorrect: midiStats.get().incorrect + 1,
          });
        }
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
  let lastNoteIndex = 12;

  function playNote(first: boolean) {
    if (!first) {
      let newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
      while (
        Math.abs(newNoteIndex - lastNoteIndex) > maxInterval.get() ||
        newNoteIndex === lastNoteIndex
      ) {
        newNoteIndex = Math.floor(Math.random() * possibleNotes.length);
      }
      lastNoteIndex = newNoteIndex;
    }

    const note = possibleNotes[lastNoteIndex];
    const cancelNote = playFreq(note.freq);
    onStopCleanup.set(() => {
      clearInterval(noteInterval);
      cancelNote();
    });
  }

  playNote(true);
  const noteInterval = setInterval(
    () => playNote(false),
    (1000 * 60) / notesPerMinute.get(),
  );
}

let onMidiNoteDown: (noteNum: number) => void = () => {};
const midiAccess = await navigator.requestMIDIAccess();
function setupMidiDevices() {
  midiDevicesConnected.set([...midiAccess.inputs].length);
  midiAccess.inputs.forEach((input) => {
    input.onmidimessage = (e) => {
      if (!e.data) return;
      const [command, note, velocity] = e.data;
      if (command === 144 && velocity > 0) {
        onMidiNoteDown(note);
      }
    };
  });
}
setupMidiDevices();
midiAccess.onstatechange = setupMidiDevices;
