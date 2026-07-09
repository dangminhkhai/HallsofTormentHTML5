/**
 * Procedural SFX via Web Audio API — stable master bus + throttle.
 * window.HOT_SFX.play(name) / setVolume / setEnabled / unlock
 */
(() => {
  "use strict";
  let ctx = null;
  let masterGain = null;
  let enabled = true;
  let master = 0.55;
  let activeVoices = 0;
  const MAX_VOICES = 12;
  /** Min ms between plays of the same spammy name */
  const THROTTLE_MS = {
    hit: 45,
    hit_heavy: 70,
    slash: 55,
    whoosh: 80,
    gold: 40,
    cast: 90,
    fire: 100,
    ice: 100,
    lightning: 80,
    kill: 60,
    ui: 30,
    click: 40,
  };
  const lastPlay = Object.create(null);

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      try {
        ctx = new AC();
        masterGain = ctx.createGain();
        masterGain.gain.value = master;
        masterGain.connect(ctx.destination);
      } catch (_) {
        ctx = null;
        masterGain = null;
        return null;
      }
    }
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }
    return ctx;
  }

  function out() {
    const c = ac();
    if (!c || !masterGain) return null;
    return { c, dest: masterGain };
  }

  function canPlay(name) {
    if (!enabled) return false;
    if (activeVoices >= MAX_VOICES) return false;
    const minGap = THROTTLE_MS[name];
    if (minGap != null) {
      const now = performance.now();
      if (lastPlay[name] != null && now - lastPlay[name] < minGap) return false;
      lastPlay[name] = now;
    }
    return true;
  }

  function trackVoice(dur) {
    activeVoices++;
    const ms = Math.max(30, (dur || 0.1) * 1000 + 40);
    setTimeout(() => {
      activeVoices = Math.max(0, activeVoices - 1);
    }, ms);
  }

  function tone(freq, dur, type, vol, slide) {
    const bus = out();
    if (!bus) return;
    const { c, dest } = bus;
    const t0 = c.currentTime;
    const o = c.createOscillator();
    const g = c.createGain();
    const v = Math.max(0.0001, (vol != null ? vol : 0.1) * 1);
    o.type = type || "square";
    o.frequency.setValueAtTime(Math.max(20, freq), t0);
    if (slide != null && slide > 0) {
      try {
        o.frequency.exponentialRampToValueAtTime(Math.max(40, slide), t0 + Math.max(0.02, dur));
      } catch (_) {
        o.frequency.linearRampToValueAtTime(Math.max(40, slide), t0 + Math.max(0.02, dur));
      }
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(v, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + Math.max(0.03, dur));
    o.connect(g);
    g.connect(dest);
    try {
      o.start(t0);
      o.stop(t0 + dur + 0.03);
      trackVoice(dur);
    } catch (_) { /* ignore */ }
  }

  function noise(dur, vol, bpFreq) {
    const bus = out();
    if (!bus) return;
    const { c, dest } = bus;
    const n = Math.max(1, Math.floor(c.sampleRate * Math.min(0.4, dur || 0.05)));
    let buf;
    try {
      buf = c.createBuffer(1, n, c.sampleRate);
    } catch (_) {
      return;
    }
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    const v = Math.max(0, vol != null ? vol : 0.08);
    g.gain.setValueAtTime(v, c.currentTime);
    g.gain.linearRampToValueAtTime(0.0001, c.currentTime + Math.max(0.02, dur));
    if (bpFreq) {
      const f = c.createBiquadFilter();
      f.type = "bandpass";
      f.frequency.value = bpFreq;
      f.Q.value = 0.8;
      src.connect(f);
      f.connect(g);
    } else {
      src.connect(g);
    }
    g.connect(dest);
    try {
      src.start();
      trackVoice(dur);
    } catch (_) { /* ignore */ }
  }

  function chord(freqs, dur, type, vol) {
    // staggered without setTimeout storms — schedule on audio clock
    const bus = out();
    if (!bus) return;
    freqs.forEach((f, i) => {
      const delay = i * 0.02;
      setTimeout(() => {
        if (!enabled) return;
        tone(f, dur, type || "sine", (vol || 0.08) * (1 - i * 0.1));
      }, delay * 1000);
    });
  }

  const LIB = {
    hit: () => { tone(190, 0.05, "square", 0.09, 90); noise(0.03, 0.055, 900); },
    hit_heavy: () => { tone(120, 0.07, "triangle", 0.11, 55); noise(0.05, 0.08, 400); },
    slash: () => { noise(0.04, 0.07, 1800); tone(360, 0.035, "triangle", 0.05, 140); },
    whoosh: () => { noise(0.06, 0.05, 500); },
    crit: () => { tone(480, 0.06, "triangle", 0.1, 720); tone(720, 0.07, "sine", 0.07); },
    kill: () => { tone(200, 0.08, "triangle", 0.08, 70); noise(0.05, 0.06, 350); },
    hurt: () => { tone(110, 0.1, "sawtooth", 0.11, 45); noise(0.07, 0.08, 220); },
    level: () => { chord([440, 554, 659], 0.09, "triangle", 0.08); },
    pickup: () => { tone(640, 0.05, "sine", 0.07, 900); },
    gold: () => { tone(900, 0.04, "sine", 0.06); },
    shard: () => { tone(760, 0.05, "triangle", 0.07, 1000); },
    potion: () => { tone(420, 0.07, "sine", 0.08, 620); },
    chest: () => { tone(320, 0.08, "triangle", 0.09); tone(480, 0.09, "sine", 0.06); },
    barrel: () => { noise(0.09, 0.1, 280); tone(95, 0.06, "triangle", 0.08, 50); },
    tome: () => { tone(520, 0.08, "sine", 0.08); tone(760, 0.1, "sine", 0.06); },
    cast: () => { tone(380, 0.06, "sine", 0.07, 680); },
    fire: () => { noise(0.07, 0.07, 380); tone(200, 0.06, "triangle", 0.05, 100); },
    ice: () => { tone(880, 0.05, "sine", 0.06, 420); },
    lightning: () => { noise(0.045, 0.09, 2200); tone(650, 0.035, "square", 0.06, 220); },
    boss: () => { tone(85, 0.18, "triangle", 0.12, 45); noise(0.12, 0.09, 140); },
    boss_death: () => {
      noise(0.15, 0.1, 160);
      tone(90, 0.14, "triangle", 0.1, 40);
    },
    win: () => { chord([523, 659, 784], 0.12, "triangle", 0.08); },
    lose: () => { tone(180, 0.16, "triangle", 0.1, 55); },
    click: () => { tone(580, 0.025, "square", 0.04); },
    block: () => { tone(280, 0.04, "triangle", 0.08); noise(0.03, 0.04, 1000); },
    champ: () => { tone(340, 0.09, "triangle", 0.09, 180); },
    agony: () => { tone(150, 0.1, "triangle", 0.09, 90); },
    ui: () => { tone(480, 0.03, "sine", 0.05); },
    equip: () => { tone(400, 0.04, "triangle", 0.06); tone(600, 0.05, "sine", 0.04); },
    pause: () => { tone(300, 0.04, "sine", 0.05); },
    well: () => { tone(440, 0.08, "sine", 0.07, 300); },
  };

  function unlock() {
    const c = ac();
    if (!c) return;
    if (c.state === "suspended") c.resume().catch(() => {});
  }

  // Auto-unlock on first gesture (browser policy)
  function bindUnlock() {
    const once = () => {
      unlock();
      window.removeEventListener("pointerdown", once, true);
      window.removeEventListener("keydown", once, true);
      window.removeEventListener("touchstart", once, true);
    };
    window.addEventListener("pointerdown", once, true);
    window.addEventListener("keydown", once, true);
    window.addEventListener("touchstart", once, true);
  }
  if (typeof window !== "undefined") bindUnlock();

  window.HOT_SFX = {
    play(name) {
      try {
        if (!canPlay(name)) return;
        const fn = LIB[name];
        if (fn) fn();
      } catch (_) { /* ignore */ }
    },
    setEnabled(v) { enabled = !!v; },
    setVolume(v) {
      master = Math.max(0, Math.min(1, Number(v) || 0));
      if (masterGain) {
        try {
          masterGain.gain.setTargetAtTime(master, ac() ? ac().currentTime : 0, 0.02);
        } catch (_) {
          masterGain.gain.value = master;
        }
      }
    },
    unlock,
  };
})();
