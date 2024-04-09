const audioContext = new AudioContext();

const button = document.createElement("button");
button.textContent = "Play random melody";
document.body.appendChild(button);

function playFrequency(freq: number, duration: number) {
  const oscillator = audioContext.createOscillator();
  oscillator.frequency.value = freq;
  oscillator.type = "triangle";
  oscillator.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + duration);
  setTimeout(() => oscillator.disconnect(), duration * 1000);
}

function noteToFreq(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function noteName(note: number) {
  // prettier-ignore
  const notes = [ "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B", ];
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
  const melody = Array.from({ length: len }, () => {
    return notes[Math.floor(Math.random() * notes.length)];
  });
  return melody;
}

button.addEventListener("click", () => {
  const melody = randomMelody(5);
  console.log(
    melody.map((note) => `${note.name} (${note.freq.toFixed(2)} Hz)`),
  );
  melody.forEach((note, i) => {
    setTimeout(() => {
      playFrequency(note.freq, 0.5);
    }, i * 500);
  });
});
