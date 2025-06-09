  const baseKey = 288;
let baseFreq = 440;
let edo = 12;
let intervalRatio = 2; // Default is octave
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
  intervalRatio = 2;
  customTuningInput.value = '';
  updateKeys();
});

customTuningInput.addEventListener("input", () => {
  const match = customTuningInput.value.match(/^(\d+)ed(\d+\/\d+|\d+(\.\d+)?)/);
  if (match) {
    edo = parseInt(match[1]);
    intervalRatio = parseRatio(match[2]);
    edoSelect.value = ""; // Clear dropdown selection
    updateKeys();
  }
});

noteNamesInput.addEventListener("input", () => {
  const raw = noteNamesInput.value.split(",").map(x => x.trim()).filter(Boolean);
  if (raw.length > 0) {
    noteNames = raw;
    updateKeys();
  }
});

function parseRatio(ratioStr) {
  if (ratioStr.includes("/")) {
    const [num, denom] = ratioStr.split("/").map(Number);
    return num / denom;
  }
  return parseFloat(ratioStr);
}

function keyToFrequency(keyNumber) {
  const stepsFromBase = keyNumber - baseKey;
  const ratio = Math.pow(intervalRatio, stepsFromBase / edo);
  return baseFreq * ratio;
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

    key.innerHTML = `
      <div>${name}</div>
      <div>${freq.toFixed(1)} Hz</div>
      <div>${cents.toFixed(1)} ¢</div>
    `;
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

    btn.innerHTML = `
      <div>${name}</div>
      <div>${freq.toFixed(1)} Hz</div>
      <div>${cents.toFixed(1)} ¢</div>
    `;

    btn.dataset.freq = freq;

    btn.addEventListener("pointerdown", async () => {
      await Tone.start();
      synth.triggerAttack(freq);
      btn.style.background = "#8ef";
    });

    btn.addEventListener("pointerup", () => {
      synth.triggerRelease(freq);
      btn.style.background = "";
    });

    btn.addEventListener("pointerleave", () => {
      synth.triggerRelease(freq);
      btn.style.background = "";
    });

    grid.appendChild(btn);
  }
}

createKeys();

document.body.addEventListener("click", async () => {
  await Tone.start();
  console.log("Audio unlocked");
}, { once: true });