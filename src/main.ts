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

// STATE
///////////////////////////////

const state = {
  melody: randomMelody(5),
  curNote: 0,
  timePerNote: 500,
};

function el<K extends keyof HTMLElementTagNameMap>(
  type: K,
  // pretty crazy typing huh? but it works!
  props: Partial<
    Omit<HTMLElementTagNameMap[K], "style"> & {
      style: Partial<CSSStyleDeclaration>;
    }
  > = {},
  ...children: (HTMLElement | string)[]
) {
  const el = document.createElement(type);
  Object.assign(el, props);
  if (props.style) {
    for (const [key, value] of Object.entries(props.style)) {
      el.style[key as any] = value;
    }
  }
  children.forEach((child) => {
    if (typeof child === "string") {
      el.appendChild(document.createTextNode(child));
    } else {
      el.appendChild(child);
    }
  });
  return el;
}

// UI
///////////////////////////////

{
  const melodyGenerateButton = el("button", {}, "Play random melody");
  document.body.appendChild(melodyGenerateButton);

  melodyGenerateButton.addEventListener("click", () => {
    state.melody = randomMelody(5);
    state.melody.forEach((note, i) => {
      setTimeout(() => {
        playNote(note.freq, state.timePerNote / 1000);
      }, i * state.timePerNote);
    });

    noteContainer.innerHTML = "";
    state.melody.forEach((note) => {
      const noteButton = el(
        "button",
        {
          style: {
            width: "5rem",
            height: "5rem",
          },
          onclick: () => {
            playNote(note.freq, state.timePerNote / 1000);
          },
        },
        "?",
      );
      noteContainer.appendChild(noteButton);
    });

    noteContainer.childNodes[0].textContent = state.melody[0].name;
    setTimeout(() => {
      noteContainer.childNodes.forEach((child, i) => {
        if (child instanceof HTMLButtonElement === false) return;
        child.textContent = state.melody[i].name;
      });
    }, state.timePerNote * state.melody.length);
  });
}

const noteContainer = el("div", {});
document.body.appendChild(noteContainer);
