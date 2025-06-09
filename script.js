const baseKey = 288;
let baseFreq = 440;
let edo = 12;
let intervalRatio = 2;
let noteNames = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: { attack: 0.01, release: 0.3 }
}).toDestination();

const grid = document.getElementById("keygrid");
const baseFreqInput = document.getElementById("baseFreq");
const edoSelect = document.getElementById("edo");
const customTuningInput = document.getElementById("customTuning");
const noteNamesInput = document.getElementById("noteNames");

baseFreqInput.addEventListener("input", () => {
  baseFreq = parseFloat(baseFreqInput.value);
  updateKeys();
});

edoSelect.addEventListener("change", () => {
  edo = parseInt(edoSelect.value);
  intervalRatio = 2; // assume octave unless overridden
  customTuningInput.value = '';
  updateKeys();
});

customTuningInput.addEventListener("input", () => {
  const value = customTuningInput.value.trim();
  const match = value.match(/^(\d+)\s*ed\s*(\d+(?:\.\d+)?|\d+\/\d+)$/i);
  if (match) {
    const x = parseInt(match[1]);
    const y = parseRatio(match[2]);
    if (!isNaN(x) && !isNaN(y) && y > 0) {
      edo = x;
      intervalRatio = y;
      edoSelect.value = ""; // Clear preset dropdown
      updateKeys();
    }
  }
});

noteNamesInput.addEventListener("input", () => {
  const raw = noteNamesInput.value.split(",").map(x => x.trim()).filter(Boolean);
  if (raw.length > 0) {
    noteNames = raw;
    updateKeys();
  }
});

function parseRatio(str) {
  if (str.includes("/")) {
    const [num, denom] = str.split("/").map(Number);
    return denom ? num / denom : NaN;
  }
  return parseFloat(str);
}

function keyToFrequency(keyNumber) {
  const stepsFromBase = keyNumber - baseKey;
  return baseFreq * Math.pow(intervalRatio, stepsFromBase / edo);
}

function getNoteName(index) {
  const offset = index - baseKey;
  const name = noteNames[((offset % noteNames.length) + noteNames.length) % noteNames.length];
  return name;
}

function updateKeys() {
  for (let i = 0; i < 576; i++) {
    const key = document.getElementById("key" + (i + 1));
    const freq = keyToFrequency(i + 1);
    const cents = 1200 * Math.log2(freq / baseFreq);
    const name = getNoteName(i + 1);
    key.innerHTML = `<div>${name}</div><div>${freq.toFixed(1)} Hz</div><div>${cents.toFixed(1)} ¢</div>`;
    key.dataset.freq = freq;
  }
}

function createKeys() {
  for (let i = 1; i <= 576; i++) {
    const btn = document.createElement("div");
    btn.className = "key";
    btn.id = "key" + i;

    const freq = keyToFrequency(i);
    const cents = 1200 * Math.log2(freq / baseFreq);
    const name = getNoteName(i);

    btn.innerHTML = `<div>${name}</div><div>${freq.toFixed(1)} Hz</div><div>${cents.toFixed(1)} ¢</div>`;
    btn.dataset.freq = freq;

    let isPlaying = false;

    const startNote = async () => {
      try {
        await Tone.start();
        synth.triggerAttack(freq);
        btn.classList.add("active");
        isPlaying = true;
      } catch (err) {
        console.error("Tone.js error:", err);
      }
    };

    const stopNote = () => {
      if (isPlaying) {
        synth.triggerRelease(freq);
        btn.classList.remove("active");
        isPlaying = false;
      }
    };

    btn.addEventListener("pointerdown", startNote);
    btn.addEventListener("pointerup", stopNote);
    btn.addEventListener("pointerleave", stopNote);
    btn.addEventListener("pointercancel", stopNote);

    grid.appendChild(btn);
  }
}

// Start Tone.js once on first user interaction
document.body.addEventListener("pointerdown", async () => {
  try {
    await Tone.start();
    console.log("Audio context started");
  } catch (e) {
    console.error("Failed to start audio context", e);
  }
}, { once: true });

createKeys();