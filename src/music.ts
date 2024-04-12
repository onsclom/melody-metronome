const audioContext = new AudioContext();

let lastFreqCleanup: null | (() => void);
const duration = 0.75;
export function playFreq(freq: number) {
  if (lastFreqCleanup) {
    lastFreqCleanup();
  }

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

  const cleanup = () => {
    oscillator.disconnect();
    gainNode.disconnect();
  };
  lastFreqCleanup = cleanup;
  return cleanup;
}

function noteToFreq(note: number) {
  return 440 * Math.pow(2, (note - 69) / 12);
}

function noteName(note: number) {
  // prettier-ignore
  const notes = [ "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab", "A", "A#/Bb", "B" ];
  return `${notes[note % 12]}${Math.floor(note / 12) - 1}`;
}

export function noteFromNum(note: number) {
  return {
    name: noteName(note),
    freq: noteToFreq(note),
  };
}
