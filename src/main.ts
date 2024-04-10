const audioContext = new AudioContext();

function playFrequency(freq: number, duration: number) {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = freq;
  oscillator.type = "triangle";

  // make pluck noise
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

const state = {
  melody: randomMelody(5),
  curNote: 0,
  timePerNote: 500,
};

// UI
///////////////////////////////

const melodyGenerateButton = document.createElement("button");
melodyGenerateButton.textContent = "Play random melody";
document.body.appendChild(melodyGenerateButton);

const replayButton = document.createElement("button");
replayButton.textContent = "Replay melody";
document.body.appendChild(replayButton);

const curText = document.createElement("p");
document.body.appendChild(curText);

melodyGenerateButton.addEventListener("click", () => {
  state.melody = randomMelody(5);
  state.melody.forEach((note, i) => {
    setTimeout(() => {
      playFrequency(note.freq, state.timePerNote / 1000);
    }, i * state.timePerNote);
  });

  curText.textContent = `Starts on: ${state.melody[0].name}`;
  setTimeout(() => {
    curText.textContent = state.melody.map((note) => note.name).join(", ");
  }, state.timePerNote * state.melody.length);
});

replayButton.addEventListener("click", () => {
  state.melody.forEach((note, i) => {
    setTimeout(() => {
      playFrequency(note.freq, state.timePerNote / 1000);
    }, i * state.timePerNote);
  });
});
