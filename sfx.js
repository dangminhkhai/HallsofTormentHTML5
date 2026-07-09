/**
 * Procedural SFX via Web Audio API (no external assets).
 * window.HOT_SFX.play(name) / setVolume / setEnabled
 */
(() => {
  "use strict";
  let ctx = null;
  let enabled = true;
  let master = 0.55;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume().catch(() => {});
    return ctx;
  }

  function tone(freq, dur, type, vol, slide) {
    const c = ac();
    if (!c || !enabled) return;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(Math.max(0.0001, vol * master), t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function noise(dur, vol, bpFreq) {
    const c = ac();
    if (!c || !enabled) return;
    const n = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = vol * master;
    if (bpFreq) {
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = bpFreq;
      src.connect(f);
      f.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(c.destination);
    src.start();
  }

  const LIB = {
    hit: () => { tone(180, 0.06, "square", 0.12, 80); noise(0.04, 0.08, 800); },
    crit: () => { tone(520, 0.08, "sawtooth", 0.14, 900); tone(780, 0.1, "square", 0.08, 400); },
    kill: () => { tone(220, 0.1, "triangle", 0.1, 60); noise(0.08, 0.1, 400); },
    hurt: () => { tone(120, 0.12, "sawtooth", 0.15, 40); noise(0.1, 0.12, 200); },
    level: () => { tone(440, 0.08, "square", 0.1); tone(660, 0.1, "square", 0.1); tone(880, 0.12, "square", 0.08); },
    pickup: () => { tone(660, 0.06, "sine", 0.08, 990); },
    gold: () => { tone(880, 0.05, "sine", 0.07); tone(1100, 0.06, "sine", 0.05); },
    potion: () => { tone(400, 0.08, "sine", 0.1, 600); tone(700, 0.1, "triangle", 0.08); },
    chest: () => { tone(300, 0.1, "square", 0.1); tone(450, 0.12, "triangle", 0.08); },
    barrel: () => { noise(0.12, 0.14, 300); tone(90, 0.08, "triangle", 0.1, 50); },
    tome: () => { tone(520, 0.1, "sine", 0.1); tone(780, 0.14, "sine", 0.08); },
    boss: () => { tone(80, 0.25, "sawtooth", 0.16, 40); noise(0.2, 0.12, 150); },
    win: () => { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => tone(f, 0.15, "square", 0.1), i * 90)); },
    lose: () => { tone(200, 0.2, "sawtooth", 0.12, 60); tone(120, 0.3, "triangle", 0.1, 40); },
    click: () => { tone(600, 0.03, "square", 0.05); },
    block: () => { tone(300, 0.05, "triangle", 0.1); noise(0.04, 0.06, 1200); },
    champ: () => { tone(350, 0.12, "sawtooth", 0.12, 200); tone(500, 0.1, "square", 0.08); },
    agony: () => { tone(150, 0.15, "sawtooth", 0.12, 100); tone(250, 0.12, "square", 0.08); },
    ui: () => { tone(500, 0.04, "sine", 0.06); },
  };

  window.HOT_SFX = {
    play(name) {
      try {
        const fn = LIB[name];
        if (fn) fn();
      } catch (_) { /* ignore */ }
    },
    setEnabled(v) { enabled = !!v; },
    setVolume(v) { master = Math.max(0, Math.min(1, Number(v) || 0)); },
    unlock() { ac(); },
  };
})();
