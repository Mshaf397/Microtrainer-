const baseKey = 288;
let baseFreq = 440;
let edo = 12;

const synth = new Tone.PolySynth(Tone.Synth, {
  oscillator: { type: "sine" },
  envelope: { attack: 0.01, release: 0.3 }
}).toDestination();

const grid = document.getElementById("keygrid");
const baseFreqInput = document.getElementById("baseFreq");
const edoSelect = document.getElementById("edo");

baseFreqInput.addEventListener("input", () => {
  baseFreq = parseFloat(baseFreqInput.value);
  updateKeys();
});

edoSelect.addEventListener("change", () => {
  edo = parseInt(edoSelect.value);
  updateKeys();
});

function keyToFrequency(keyNumber) {
  const stepsFromBase = keyNumber - baseKey;
  const ratio = Math.pow(2, stepsFromBase / edo);
  return baseFreq * ratio;
}

function getNoteName(index) {
  const names = ["C", "C♯", "D", "D♯", "E", "F", "F♯", "G", "G♯", "A", "A♯", "B"];
  return names[(index + 12) % 12];
}

function updateKeys() {
  for (let i = 0; i < 576; i++) {
    const key = document.getElementById("key" + (i + 1));
    const freq = keyToFrequency(i + 1);
    const cents = 1200 * Math.log2(freq / baseFreq);
    const name = getNoteName(i + 1 - baseKey);
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
    const name = getNoteName(i - baseKey);

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