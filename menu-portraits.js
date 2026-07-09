/**
 * Mini hero portraits for character select menu.
 * Matches in-game silhouettes (canvas 2d).
 */
window.drawHeroPortrait = function drawHeroPortrait(ctx, heroId, w, h) {
  const c = heroId || "swordsman";
  const cx = w / 2;
  const cy = h * 0.58;
  const s = Math.min(w, h) / 64;

  ctx.clearRect(0, 0, w, h);

  // background vignette
  const bg = ctx.createRadialGradient(cx, cy, 4, cx, cy, w * 0.55);
  bg.addColorStop(0, "#221828");
  bg.addColorStop(1, "#0c0a10");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // floor ellipse
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.beginPath();
  ctx.ellipse(cx, cy + 14 * s, 14 * s, 4 * s, 0, 0, Math.PI * 2);
  ctx.fill();

  const palettes = {
    swordsman: { skin: "#e8c8a0", armor: "#8a9098", accent: "#c04040", dark: "#4a4058", weapon: "#c8d0d8", cape: "#8b2030" },
    archer: { skin: "#e8c8a0", armor: "#4a7a40", accent: "#8fd46a", dark: "#2a5030", weapon: "#8b5a2b", cape: "#2a5030" },
    exterminator: { skin: "#d0a888", armor: "#6a4030", accent: "#ff8040", dark: "#3a2018", weapon: "#505860", cape: "#4a2818" },
    cleric: { skin: "#f0d8b8", armor: "#e8e0d0", accent: "#d4a84b", dark: "#8a8070", weapon: "#f0e0a0", cape: "#f0e8d0" },
    warlock: { skin: "#c0a090", armor: "#4a2060", accent: "#a060d0", dark: "#2a1038", weapon: "#8060a0", cape: "#2a1038" },
    sorceress: { skin: "#e8c8a0", armor: "#2a3a70", accent: "#7aa8ff", dark: "#1a2a55", weapon: "#6a4a28", cape: "#1a2a55" },
    shield_maiden: { skin: "#e0c8a8", armor: "#a8b0c0", accent: "#d4a84b", dark: "#505868", weapon: "#707880", cape: "#606878" },
    beast_huntress: { skin: "#d8b090", armor: "#6a5030", accent: "#d0a060", dark: "#3a3018", weapon: "#8b6a40", cape: "#3a3018" },
    norseman: { skin: "#e0c8a0", armor: "#4a6080", accent: "#80c0e0", dark: "#2a3848", weapon: "#90a0b0", cape: "#d8d8e0" },
    landsknecht: { skin: "#e0c0a0", armor: "#8a6030", accent: "#d4a84b", dark: "#4a3018", weapon: "#3a3028", cape: "#a04040" },
    sage: { skin: "#e8d0b8", armor: "#5a4080", accent: "#c0a0ff", dark: "#302048", weapon: "#9070c0", cape: "#302048" },
    bard: { skin: "#f0d0b8", armor: "#804060", accent: "#e0a0c0", dark: "#402030", weapon: "#c09050", cape: "#402030" },
    crone: { skin: "#c0b090", armor: "#3a5030", accent: "#60a050", dark: "#1a3018", weapon: "#506040", cape: "#1a3018" },
    alchemist: { skin: "#e0d0b0", armor: "#306058", accent: "#50c0b0", dark: "#183830", weapon: "#80c0b0", cape: "#183830" },
  };
  const p = palettes[c] || palettes.swordsman;

  function rr(x, y, ww, hh, r) {
    const rad = Math.min(r, ww / 2, hh / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.arcTo(x + ww, y, x + ww, y + hh, rad);
    ctx.arcTo(x + ww, y + hh, x, y + hh, rad);
    ctx.arcTo(x, y + hh, x, y, rad);
    ctx.arcTo(x, y, x + ww, y, rad);
    ctx.closePath();
  }

  // legs
  ctx.fillStyle = p.dark;
  ctx.fillRect(cx - 7 * s, cy + 4 * s, 5 * s, 10 * s);
  ctx.fillRect(cx + 2 * s, cy + 4 * s, 5 * s, 10 * s);
  ctx.fillStyle = "#2a2030";
  ctx.fillRect(cx - 8 * s, cy + 12 * s, 6 * s, 3 * s);
  ctx.fillRect(cx + 2 * s, cy + 12 * s, 6 * s, 3 * s);

  // cape (behind)
  ctx.fillStyle = p.cape;
  ctx.beginPath();
  ctx.moveTo(cx - 4 * s, cy - 4 * s);
  ctx.quadraticCurveTo(cx - 16 * s, cy + 4 * s, cx - 8 * s, cy + 16 * s);
  ctx.lineTo(cx + 2 * s, cy + 6 * s);
  ctx.fill();

  // body
  const robe = ["sorceress", "warlock", "cleric", "sage", "crone", "alchemist"].includes(c);
  ctx.fillStyle = p.armor;
  if (robe) {
    ctx.beginPath();
    ctx.moveTo(cx - 9 * s, cy - 6 * s);
    ctx.lineTo(cx + 9 * s, cy - 6 * s);
    ctx.lineTo(cx + 12 * s, cy + 14 * s);
    ctx.lineTo(cx - 12 * s, cy + 14 * s);
    ctx.fill();
  } else {
    rr(cx - 8 * s, cy - 7 * s, 16 * s, 14 * s, 3 * s);
    ctx.fill();
  }
  ctx.fillStyle = p.accent;
  ctx.globalAlpha = 0.5;
  rr(cx - 5 * s, cy - 4 * s, 10 * s, 4 * s, 2 * s);
  ctx.fill();
  ctx.globalAlpha = 1;

  // head
  ctx.fillStyle = p.skin;
  ctx.beginPath();
  ctx.arc(cx, cy - 11 * s, 6.5 * s, 0, Math.PI * 2);
  ctx.fill();

  // headwear / face extras
  if (["swordsman", "shield_maiden", "norseman"].includes(c)) {
    ctx.fillStyle = p.armor;
    rr(cx - 7 * s, cy - 18 * s, 14 * s, 8 * s, 2 * s);
    ctx.fill();
    ctx.fillStyle = "#1a1018";
    ctx.fillRect(cx - 4 * s, cy - 14 * s, 8 * s, 2 * s);
  } else if (["archer", "beast_huntress", "warlock", "sorceress", "sage", "crone"].includes(c)) {
    ctx.fillStyle = p.dark;
    ctx.beginPath();
    ctx.arc(cx, cy - 12 * s, 8 * s, Math.PI * 1.1, Math.PI * 1.9);
    ctx.fill();
    ctx.fillRect(cx - 8 * s, cy - 13 * s, 16 * s, 4 * s);
  } else if (c === "landsknecht" || c === "bard") {
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.ellipse(cx, cy - 16 * s, 9 * s, 3.5 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 2.5 * s, cy - 24 * s, 5 * s, 8 * s);
    if (c === "landsknecht") {
      ctx.fillStyle = "#e04040";
      ctx.beginPath();
      ctx.moveTo(cx + 2 * s, cy - 22 * s);
      ctx.quadraticCurveTo(cx + 10 * s, cy - 28 * s, cx + 4 * s, cy - 16 * s);
      ctx.fill();
    }
  } else if (c === "cleric") {
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, cy - 15 * s);
    ctx.lineTo(cx - 3 * s, cy - 22 * s);
    ctx.lineTo(cx, cy - 16 * s);
    ctx.lineTo(cx + 3 * s, cy - 22 * s);
    ctx.lineTo(cx + 6 * s, cy - 15 * s);
    ctx.fill();
  }

  // eyes
  ctx.fillStyle = ["warlock", "sorceress", "sage"].includes(c) ? p.accent : "#1a1010";
  ctx.beginPath();
  ctx.arc(cx - 2 * s, cy - 11 * s, 1.3 * s, 0, Math.PI * 2);
  ctx.arc(cx + 2.5 * s, cy - 11 * s, 1.3 * s, 0, Math.PI * 2);
  ctx.fill();

  if (c === "norseman") {
    ctx.fillStyle = "#d0d0d8";
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, cy - 7 * s);
    ctx.lineTo(cx, cy - 1 * s);
    ctx.lineTo(cx + 3 * s, cy - 7 * s);
    ctx.fill();
  }

  if (c === "alchemist") {
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath();
    ctx.arc(cx - 2.5 * s, cy - 11 * s, 3 * s, 0, Math.PI * 2);
    ctx.arc(cx + 2.5 * s, cy - 11 * s, 3 * s, 0, Math.PI * 2);
    ctx.stroke();
  }

  // weapons (right side pose)
  ctx.save();
  ctx.translate(cx + 11 * s, cy);
  if (c === "swordsman") {
    ctx.rotate(0.35);
    ctx.fillStyle = p.weapon;
    ctx.fillRect(-2 * s, -20 * s, 4 * s, 24 * s);
    ctx.fillStyle = p.accent;
    ctx.fillRect(-5 * s, 0, 10 * s, 2.5 * s);
  } else if (c === "archer" || c === "beast_huntress") {
    if (c === "archer") {
      ctx.strokeStyle = p.weapon;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(0, 0, 10 * s, -1.1, 1.1);
      ctx.stroke();
      ctx.strokeStyle = "#ddd";
      ctx.lineWidth = 1 * s;
      ctx.beginPath();
      ctx.moveTo(Math.cos(-1.1) * 10 * s, Math.sin(-1.1) * 10 * s);
      ctx.lineTo(Math.cos(1.1) * 10 * s, Math.sin(1.1) * 10 * s);
      ctx.stroke();
      ctx.fillStyle = "#c8d8a0";
      ctx.fillRect(0, -1 * s, 12 * s, 2 * s);
    } else {
      ctx.rotate(-0.4);
      ctx.fillStyle = p.weapon;
      ctx.fillRect(-1.2 * s, -18 * s, 2.4 * s, 28 * s);
      ctx.fillStyle = "#c0c8d0";
      ctx.beginPath();
      ctx.moveTo(0, -22 * s);
      ctx.lineTo(3 * s, -16 * s);
      ctx.lineTo(-3 * s, -16 * s);
      ctx.fill();
    }
  } else if (c === "exterminator") {
    ctx.fillStyle = p.weapon;
    ctx.fillRect(-2 * s, -3 * s, 16 * s, 5 * s);
    ctx.fillStyle = p.accent;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.ellipse(18 * s, 0, 6 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  } else if (c === "cleric" || c === "sorceress" || c === "warlock" || c === "sage" || c === "crone") {
    ctx.fillStyle = c === "cleric" ? "#8b6a30" : p.weapon;
    ctx.fillRect(-1.2 * s, -18 * s, 2.4 * s, 26 * s);
    ctx.fillStyle = p.accent;
    ctx.beginPath();
    if (c === "sorceress") {
      ctx.moveTo(0, -24 * s);
      ctx.lineTo(4 * s, -18 * s);
      ctx.lineTo(0, -12 * s);
      ctx.lineTo(-4 * s, -18 * s);
    } else {
      ctx.arc(0, -20 * s, 4 * s, 0, Math.PI * 2);
    }
    ctx.fill();
  } else if (c === "shield_maiden") {
    ctx.fillStyle = p.armor;
    ctx.beginPath();
    ctx.ellipse(-14 * s, 2 * s, 6 * s, 9 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = p.accent;
    ctx.lineWidth = 1.2 * s;
    ctx.stroke();
    ctx.rotate(0.4);
    ctx.fillStyle = "#5a4030";
    ctx.fillRect(-1.5 * s, -2 * s, 3 * s, 14 * s);
    ctx.fillStyle = p.weapon;
    ctx.fillRect(-6 * s, -12 * s, 12 * s, 8 * s);
  } else if (c === "norseman") {
    // right axe (current transform is already at right side)
    ctx.rotate(0.45);
    ctx.fillStyle = "#6a4a28";
    ctx.fillRect(-1.2 * s, 0, 2.4 * s, 10 * s);
    ctx.fillStyle = p.weapon;
    ctx.beginPath();
    ctx.moveTo(-6 * s, 0); ctx.lineTo(6 * s, 0); ctx.lineTo(0, -10 * s);
    ctx.fill();
    // left axe: draw in absolute coords after this block ends
  } else if (c === "landsknecht") {
    ctx.fillStyle = p.weapon;
    ctx.fillRect(-3 * s, -1.5 * s, 20 * s, 3 * s);
    ctx.fillStyle = "#5a4030";
    ctx.fillRect(-5 * s, 0, 6 * s, 5 * s);
  } else if (c === "bard") {
    ctx.rotate(0.25);
    ctx.fillStyle = p.weapon;
    ctx.beginPath();
    ctx.ellipse(0, 3 * s, 6 * s, 8 * s, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1 * s, -10 * s, 2 * s, 12 * s);
  } else if (c === "alchemist") {
    const cols = ["#ff6040", "#40a0ff", "#80c040"];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = cols[i];
      ctx.fillRect((-10 + i * 5) * s, 3 * s, 3.5 * s, 5 * s);
    }
    ctx.fillStyle = "#40a0ff";
    ctx.beginPath();
    ctx.moveTo(8 * s, -8 * s);
    ctx.lineTo(12 * s, 2 * s);
    ctx.lineTo(4 * s, 2 * s);
    ctx.fill();
  }
  ctx.restore();

  // Norseman left axe (absolute)
  if (c === "norseman") {
    ctx.save();
    ctx.translate(cx - 10 * s, cy + 1 * s);
    ctx.rotate(-0.45);
    ctx.fillStyle = "#6a4a28";
    ctx.fillRect(-1.2 * s, 0, 2.4 * s, 10 * s);
    ctx.fillStyle = p.weapon;
    ctx.beginPath();
    ctx.moveTo(-6 * s, 0); ctx.lineTo(6 * s, 0); ctx.lineTo(0, -10 * s);
    ctx.fill();
    ctx.restore();
  }

  // class accents
  if (c === "warlock" || c === "sage") {
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2;
      ctx.fillStyle = p.accent;
      ctx.globalAlpha = 0.55;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 16 * s, cy + Math.sin(a) * 8 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
  if (c === "crone") {
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const ox = cx + Math.cos(a) * 15 * s;
      const oy = cy + 2 * s + Math.sin(a) * 7 * s;
      ctx.fillStyle = "#3a6828";
      ctx.fillRect(ox - 1.5 * s, oy - 6 * s, 3 * s, 7 * s);
      ctx.fillStyle = p.accent;
      ctx.beginPath();
      ctx.ellipse(ox, oy - 7 * s, 3.5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  if (c === "exterminator") {
    ctx.fillStyle = "#ff6030";
    ctx.fillRect(cx - 10 * s, cy - 2 * s, 5 * s, 8 * s);
  }
  if (c === "beast_huntress") {
    ctx.fillStyle = "rgba(160,100,40,0.85)";
    ctx.beginPath();
    ctx.ellipse(cx - 14 * s, cy + 8 * s, 6 * s, 4 * s, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // border
  ctx.strokeStyle = "rgba(212,168,75,0.25)";
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
};
