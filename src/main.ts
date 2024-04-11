import el from "./el.ts";
import GetterSetter from "./getter-setter.ts";

const audioContext = new AudioContext();

function playNote(freq: number, duration: number) {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = freq;
  oscillator.type = "triangle";

  const gainNode = audioContext.createGain();
  gainNode.gain.setValueAtTime(duration, audioContext.currentTime);
  gainNode.gain.linearRampToValueAtTime(
    0.01,
    audioContext.currentTime + duration,
  );

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);

  // do i actually need to disconnect things? idk
  // i'm afraid it might cause memory leaks
  setTimeout(() => {
    oscillator.disconnect();
    gainNode.disconnect();
  }, duration * 1000);
}

function noteToFreq(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function noteName(note: number) {
  // prettier-ignore
  const notes = [ "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B" ];
  return `${notes[note % 12]}${Math.floor(note / 12) - 1}`;
}

function note(note: number) {
  return {
    name: noteName(note),
    freq: noteToFreq(note),
  };
}

const start = 60 - 12;
const notes = Array.from({ length: 24 }, (_, i) => note(i + start));

function randomMelody(len: number) {
  const maxJump = 14; // M9 jump
  const melody = [] as { name: string; freq: number }[];
  melody.push(notes[Math.floor(Math.random() * notes.length)]);
  while (melody.length < len) {
    const lastNote = melody[melody.length - 1];
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    const distance = Math.abs(
      notes.indexOf(lastNote) - notes.indexOf(randomNote),
    );
    if (distance <= maxJump) {
      melody.push(randomNote);
    }
  }
  return melody;
}

// logic ^
/////////////////////////
// ui v

const state = {
  melody: randomMelody(1),
  curNote: 0,
  timePerNote: 400,
  noteAmount: 5,
  melodyTimeouts: [] as number[],
};

const melodyGenerateButton = el(
  "button",
  {
    style: {
      padding: "1rem",
    },
    onclick: () => {
      state.melodyTimeouts.forEach((timeout) => clearTimeout(timeout));
      state.melodyTimeouts = [];
      state.melody = randomMelody(state.noteAmount);

      const animateButton = (button: HTMLButtonElement) => {
        button.animate(
          [
            { transform: "scale(1)" },
            { transform: "scale(1.1)" },
            { transform: "scale(1)" },
          ],
          {
            duration: state.timePerNote,
            iterations: 1,
          },
        );
      };

      const noteButtons = state.melody.map((note, i) =>
        el(
          "button",
          {
            style: {
              width: "5rem",
              height: "5rem",
            },
            onclick: () => {
              playNote(note.freq, state.timePerNote / 1000);
              animateButton(noteButtons[i]);
            },
          },
          "?",
        ),
      );

      noteContainer.innerHTML = "";
      noteButtons.forEach((button) => {
        noteContainer.appendChild(button);
      });
      state.melody.forEach((note, i) => {
        state.melodyTimeouts.push(
          setTimeout(() => {
            playNote(note.freq, state.timePerNote / 1000);
            animateButton(noteButtons[i]);
          }, i * state.timePerNote),
        );
      });
      noteContainer.childNodes[0].textContent = state.melody[0].name;
      setTimeout(() => {
        noteButtons.forEach((button, i) => {
          button.textContent = state.melody[i].name;
        });
      }, state.timePerNote * state.melody.length);
    },
  },
  "New melody",
);

const noteContainer = el("div", {});

document.body.appendChild(
  el(
    "div",
    {},
    el(
      "label",
      { style: { display: "flex", gap: ".5rem" } },
      "Note duration: ",
      el("input", {
        type: "range",
        oninput: (e) => {
          state.timePerNote = Number((e.target as HTMLInputElement).value);
        },
        min: "250",
        max: "550",
        step: "10",
        value: String(state.timePerNote),
      }),
    ),
    el(
      "label",
      { style: { display: "flex", gap: ".5rem" } },
      "Note amount: ",
      NoteAmountCounter(
        state.noteAmount,
        (newVal) => (state.noteAmount = newVal),
      ),
    ),
    melodyGenerateButton,
    noteContainer,
  ),
);

function NoteAmountCounter(
  initVal: number,
  onChange: (val: number) => void = () => {},
) {
  const min = 1;
  const max = 10;

  const [cur, setCur] = GetterSetter(initVal, (val) => {
    decButton.disabled = val === min;
    incButton.disabled = val === max;
    countText.textContent = String(val);
    onChange(val);
  });

  const countText = el(
    "span",
    { style: { width: "2rem", textAlign: "center" } },
    String(state.noteAmount),
  );
  const decButton = el("button", { onclick: () => setCur(cur() - 1) }, "-");
  const incButton = el("button", { onclick: () => setCur(cur() + 1) }, "+");

  return el(
    "div",
    { style: { display: "flex", gap: ".5rem" } },
    decButton,
    countText,
    incButton,
  );
}
