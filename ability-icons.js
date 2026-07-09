/**
 * Ability icons for Tome pick UI & HUD.
 * Source names: https://hot.fandom.com/wiki/Ability
 */
window.drawAbilityIcon = function drawAbilityIcon(ctx, abilityId, w, h, color) {
  const id = abilityId || "phantom_needles";
  const c = color || "#8ab4ff";
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h) / 48;

  ctx.clearRect(0, 0, w, h);

  // rounded plate background
  const pad = 2;
  ctx.fillStyle = "#12101a";
  roundRectPath(ctx, pad, pad, w - pad * 2, h - pad * 2, 8);
  ctx.fill();
  const grad = ctx.createRadialGradient(cx, cy * 0.7, 2, cx, cy, w * 0.55);
  grad.addColorStop(0, hexA(c, 0.28));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = hexA(c, 0.55);
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pad + 0.5, pad + 0.5, w - pad * 2 - 1, h - pad * 2 - 1, 7);
  ctx.stroke();

  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  switch (id) {
    case "phantom_needles":
      // flying needles
      for (let i = -1; i <= 1; i++) {
        ctx.save();
        ctx.translate(cx + i * 7 * s, cy + i * 2 * s);
        ctx.rotate(-0.6 + i * 0.15);
        ctx.fillStyle = c;
        ctx.fillRect(-10 * s, -1.2 * s, 20 * s, 2.4 * s);
        ctx.beginPath();
        ctx.moveTo(10 * s, 0);
        ctx.lineTo(14 * s, -3 * s);
        ctx.lineTo(14 * s, 3 * s);
        ctx.fill();
        ctx.restore();
      }
      break;

    case "arcane_splinters":
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - 0.4;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 16 * s, cy + Math.sin(a) * 16 * s);
        ctx.stroke();
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 16 * s, cy + Math.sin(a) * 16 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "astronomers_orbs":
      ctx.strokeStyle = hexA(c, 0.7);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14 * s, 6 * s, 0.3, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 12 * s, cy + Math.sin(a) * 5 * s, 4 * s, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff8d0";
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 12 * s - s, cy + Math.sin(a) * 5 * s - s, 1.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "lightning_strikes":
      ctx.strokeStyle = c;
      ctx.fillStyle = c;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 2 * s, cy - 16 * s);
      ctx.lineTo(cx + 4 * s, cy - 2 * s);
      ctx.lineTo(cx - 2 * s, cy);
      ctx.lineTo(cx + 6 * s, cy + 16 * s);
      ctx.lineTo(cx - 4 * s, cy + 2 * s);
      ctx.lineTo(cx + 2 * s, cy);
      ctx.closePath();
      ctx.fill();
      break;

    case "flame_strike":
      // wave of fire
      ctx.fillStyle = c;
      for (let i = 0; i < 4; i++) {
        const ox = cx - 10 * s + i * 7 * s;
        ctx.beginPath();
        ctx.moveTo(ox, cy + 10 * s);
        ctx.quadraticCurveTo(ox - 6 * s, cy, ox, cy - 12 * s + i);
        ctx.quadraticCurveTo(ox + 6 * s, cy, ox, cy + 10 * s);
        ctx.fill();
      }
      ctx.fillStyle = "#ffe080";
      ctx.beginPath();
      ctx.arc(cx + 6 * s, cy - 2 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "dragons_breath":
      // dragon snout + flame cone
      ctx.fillStyle = "#5a3020";
      ctx.beginPath();
      ctx.ellipse(cx - 6 * s, cy, 8 * s, 6 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 4 * s);
      ctx.lineTo(cx + 16 * s, cy - 10 * s);
      ctx.lineTo(cx + 16 * s, cy + 10 * s);
      ctx.lineTo(cx, cy + 4 * s);
      ctx.fill();
      ctx.fillStyle = "#ffe080";
      ctx.beginPath();
      ctx.moveTo(cx + 2 * s, cy);
      ctx.lineTo(cx + 12 * s, cy - 4 * s);
      ctx.lineTo(cx + 12 * s, cy + 4 * s);
      ctx.fill();
      break;

    case "frost_avalanche":
      // snowflake
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 15 * s, cy + Math.sin(a) * 15 * s);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(a) * 9 * s, cy + Math.sin(a) * 9 * s);
        ctx.lineTo(cx + Math.cos(a + 0.4) * 12 * s, cy + Math.sin(a + 0.4) * 12 * s);
        ctx.stroke();
      }
      break;

    case "hailstorm":
      ctx.fillStyle = "rgba(180,210,240,0.5)";
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6 * s, 16 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = c;
      for (let i = 0; i < 5; i++) {
        ctx.fillRect(cx - 12 * s + i * 6 * s, cy + 2 * s + (i % 2) * 4 * s, 2.5 * s, 8 * s);
      }
      break;

    case "ring_blades":
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 12 * s, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 4; i++) {
        const a = (i / 4) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * 12 * s, cy + Math.sin(a) * 12 * s);
        ctx.rotate(a);
        ctx.fillStyle = c;
        ctx.fillRect(-1.5 * s, -6 * s, 3 * s, 12 * s);
        ctx.restore();
      }
      break;

    case "transfixion":
      ctx.fillStyle = c;
      for (let i = 0; i < 3; i++) {
        ctx.save();
        ctx.translate(cx - 6 * s + i * 6 * s, cy - 2 * s + i);
        ctx.rotate(-0.5);
        ctx.fillRect(-8 * s, -1 * s, 16 * s, 2 * s);
        ctx.beginPath();
        ctx.moveTo(8 * s, 0);
        ctx.lineTo(12 * s, -2.5 * s);
        ctx.lineTo(12 * s, 2.5 * s);
        ctx.fill();
        ctx.restore();
      }
      break;

    case "radiant_aura":
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 8 * s, 0, Math.PI * 2);
      ctx.stroke();
      // cross
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10 * s);
      ctx.lineTo(cx, cy + 10 * s);
      ctx.moveTo(cx - 10 * s, cy);
      ctx.lineTo(cx + 10 * s, cy);
      ctx.stroke();
      break;

    case "clay_golem":
      ctx.fillStyle = c;
      roundRectPath(ctx, cx - 9 * s, cy - 6 * s, 18 * s, 16 * s, 3 * s);
      ctx.fill();
      ctx.fillStyle = "#3a2818";
      ctx.fillRect(cx - 5 * s, cy - 2 * s, 3 * s, 3 * s);
      ctx.fillRect(cx + 2 * s, cy - 2 * s, 3 * s, 3 * s);
      ctx.fillStyle = c;
      ctx.fillRect(cx - 6 * s, cy + 10 * s, 5 * s, 6 * s);
      ctx.fillRect(cx + 1 * s, cy + 10 * s, 5 * s, 6 * s);
      break;

    case "meteor_strike":
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(cx + 2 * s, cy + 4 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd080";
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 2 * s, cy - 2 * s);
      ctx.lineTo(cx - 10 * s, cy - 14 * s);
      ctx.lineTo(cx + 2 * s, cy - 10 * s);
      ctx.stroke();
      ctx.fillStyle = "rgba(255,160,60,0.4)";
      ctx.beginPath();
      ctx.arc(cx + 2 * s, cy + 4 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "kugelblitz":
      // ball lightning + pulse rings
      ctx.strokeStyle = hexA(c, 0.5);
      ctx.lineWidth = 1.5 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * s, 0.2, Math.PI * 1.4);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.shadowColor = c;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#e8ffff";
      ctx.beginPath();
      ctx.arc(cx - 1.5 * s, cy - 1.5 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "arcane_rift":
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 14 * s, 6 * s, 0.6, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 8 * s, 3.5 * s, -0.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = hexA(c, 0.4);
      ctx.beginPath();
      ctx.ellipse(cx, cy, 6 * s, 2.5 * s, 0.6, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "spirit_warrior":
      // ethereal warrior + dash streak
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(cx - 8 * s, cy + 2 * s, 5 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 0.85;
      ctx.beginPath();
      ctx.ellipse(cx + 2 * s, cy + 2 * s, 7 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx, cy - 4 * s, 2 * s, 0, Math.PI * 2);
      ctx.arc(cx + 5 * s, cy - 4 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 14 * s, cy + 2 * s);
      ctx.lineTo(cx + 14 * s, cy + 2 * s);
      ctx.stroke();
      ctx.globalAlpha = 1;
      break;

    case "morning_star":
      ctx.strokeStyle = "#8b6a40";
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 10 * s, cy + 10 * s);
      ctx.lineTo(cx + 4 * s, cy - 4 * s);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(cx + 6 * s, cy - 6 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#ffd080";
      ctx.lineWidth = 1.5 * s;
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + 6 * s, cy - 6 * s);
        ctx.lineTo(cx + 6 * s + Math.cos(a) * 11 * s, cy - 6 * s + Math.sin(a) * 11 * s);
        ctx.stroke();
      }
      break;

    case "spectral_fists":
      ctx.fillStyle = c;
      // left fist
      roundRectPath(ctx, cx - 14 * s, cy - 4 * s, 10 * s, 12 * s, 2 * s);
      ctx.fill();
      // right fist
      roundRectPath(ctx, cx + 4 * s, cy - 8 * s, 10 * s, 12 * s, 2 * s);
      ctx.fill();
      ctx.fillStyle = hexA("#fff", 0.4);
      ctx.fillRect(cx - 12 * s, cy - 2 * s, 6 * s, 3 * s);
      ctx.fillRect(cx + 6 * s, cy - 6 * s, 6 * s, 3 * s);
      break;

    case "confetti_cannon": {
      const cols = ["#ff80c0", "#80ffc0", "#80c0ff", "#ffe080"];
      ctx.fillStyle = "#666";
      ctx.fillRect(cx - 12 * s, cy - 3 * s, 14 * s, 6 * s);
      for (let i = 0; i < 8; i++) {
        const a = -0.8 + i * 0.2;
        ctx.fillStyle = cols[i % cols.length];
        ctx.fillRect(cx + 4 * s + Math.cos(a) * 10 * s, cy + Math.sin(a) * 10 * s, 3 * s, 4 * s);
      }
      break;
    }

    case "kick_bass":
      // speaker waves
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * s;
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx - 4 * s, cy, 6 * s * i, -0.9, 0.9);
        ctx.stroke();
      }
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(cx - 6 * s, cy, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "killer_riff":
      // sound bar / riff
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 14 * s, cy + 4 * s);
      ctx.quadraticCurveTo(cx - 4 * s, cy - 14 * s, cx + 4 * s, cy + 2 * s);
      ctx.quadraticCurveTo(cx + 10 * s, cy + 12 * s, cx + 16 * s, cy - 6 * s);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.font = `bold ${14 * s}px serif`;
      ctx.textAlign = "center";
      ctx.fillText("♪", cx + 10 * s, cy - 8 * s);
      break;

    case "mosh_pit":
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.stroke();
      // crowd dots
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        ctx.fillStyle = c;
        ctx.beginPath();
        ctx.arc(cx + Math.cos(a) * 8 * s, cy + Math.sin(a) * 8 * s, 2.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "pyrotechnics":
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        ctx.strokeStyle = i % 2 ? c : "#ffe080";
        ctx.lineWidth = 2 * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * 15 * s, cy + Math.sin(a) * 15 * s);
        ctx.stroke();
      }
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(cx, cy, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "wall_of_death":
      ctx.fillStyle = c;
      ctx.globalAlpha = 0.85;
      ctx.fillRect(cx - 4 * s, cy - 16 * s, 8 * s, 32 * s);
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 1.5 * s;
      ctx.strokeRect(cx - 4 * s, cy - 16 * s, 8 * s, 32 * s);
      ctx.fillStyle = hexA(c, 0.4);
      ctx.fillRect(cx - 10 * s, cy - 14 * s, 4 * s, 28 * s);
      ctx.fillRect(cx + 6 * s, cy - 14 * s, 4 * s, 28 * s);
      break;

    case "enlightenment":
      // beam / eye
      ctx.strokeStyle = c;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(cx - 14 * s, cy + 8 * s);
      ctx.lineTo(cx + 14 * s, cy - 10 * s);
      ctx.stroke();
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 2 * s, 8 * s, 5 * s, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1020";
      ctx.beginPath();
      ctx.arc(cx + s, cy - 2 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      break;

    case "prismatic_cascade": {
      const cols = ["#ff6040", "#40a0ff", "#80e0ff", "#80c040", "#e080ff"];
      for (let i = 0; i < 5; i++) {
        const a = -0.9 + i * 0.45;
        ctx.strokeStyle = cols[i];
        ctx.lineWidth = 2.5 * s;
        ctx.beginPath();
        ctx.moveTo(cx - 8 * s, cy + 10 * s);
        ctx.lineTo(cx + Math.cos(a) * 16 * s, cy + Math.sin(a) * 16 * s - 4 * s);
        ctx.stroke();
      }
      break;
    }

    case "undergrowth":
      ctx.strokeStyle = c;
      ctx.lineWidth = 2 * s;
      for (let i = 0; i < 5; i++) {
        const a = -0.5 + i * 0.25;
        ctx.beginPath();
        ctx.moveTo(cx, cy + 12 * s);
        ctx.quadraticCurveTo(
          cx + Math.cos(a) * 8 * s,
          cy,
          cx + Math.cos(a) * 14 * s,
          cy - 12 * s
        );
        ctx.stroke();
      }
      ctx.fillStyle = c;
      for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.ellipse(cx - 8 * s + i * 8 * s, cy - 10 * s, 4 * s, 3 * s, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    default:
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${14 * s}px Segoe UI`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("?", cx, cy + s);
  }
};

function hexA(hex, a) {
  if (!hex || hex[0] !== "#" || (hex.length !== 7 && hex.length !== 4)) {
    return `rgba(140,180,255,${a})`;
  }
  let r, g, b;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else {
    r = parseInt(hex.slice(1, 3), 16);
    g = parseInt(hex.slice(3, 5), 16);
    b = parseInt(hex.slice(5, 7), 16);
  }
  return `rgba(${r},${g},${b},${a})`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

window.paintAbilityIcon = function paintAbilityIcon(canvas, abilityId, color, size) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = size || 48;
  canvas.width = Math.round(s * dpr);
  canvas.height = Math.round(s * dpr);
  canvas.style.width = s + "px";
  canvas.style.height = s + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  window.drawAbilityIcon(ctx, abilityId, s, s, color);
};

/**
 * Trait / weapon prof / category icons for level-up pick menu.
 */
window.drawTraitIcon = function drawTraitIcon(ctx, traitId, w, h, color, cat) {
  const id = traitId || "vitality";
  const c = color || traitColor(id, cat);
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h) / 48;

  ctx.clearRect(0, 0, w, h);
  const pad = 2;
  ctx.fillStyle = "#12101a";
  roundRectPath(ctx, pad, pad, w - pad * 2, h - pad * 2, 8);
  ctx.fill();
  const grad = ctx.createRadialGradient(cx, cy * 0.7, 2, cx, cy, w * 0.55);
  grad.addColorStop(0, hexA(c, 0.3));
  grad.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = hexA(c, 0.55);
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pad + 0.5, pad + 0.5, w - pad * 2 - 1, h - pad * 2 - 1, 7);
  ctx.stroke();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.fillStyle = c;
  ctx.strokeStyle = c;

  // Category fallback first if unknown id
  const draw = TRAIT_ICON_DRAW[id] || TRAIT_ICON_DRAW["cat_" + (cat || "base")] || TRAIT_ICON_DRAW.vitality;
  draw(ctx, cx, cy, s, c);
};

const TRAIT_ICON_DRAW = {
  vitality: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy + 10 * s);
    ctx.bezierCurveTo(cx - 16 * s, cy + 2 * s, cx - 14 * s, cy - 12 * s, cx, cy - 6 * s);
    ctx.bezierCurveTo(cx + 14 * s, cy - 12 * s, cx + 16 * s, cy + 2 * s, cx, cy + 10 * s);
    ctx.fill();
  },
  agility: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 12 * s, cy + 8 * s);
    ctx.lineTo(cx - 4 * s, cy - 10 * s);
    ctx.lineTo(cx + 6 * s, cy + 2 * s);
    ctx.lineTo(cx + 14 * s, cy - 8 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 6 * s, cy - 12 * s);
    ctx.lineTo(cx + 14 * s, cy - 8 * s);
    ctx.lineTo(cx + 8 * s, cy - 2 * s);
    ctx.stroke();
  },
  defense: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14 * s);
    ctx.lineTo(cx + 12 * s, cy - 8 * s);
    ctx.lineTo(cx + 12 * s, cy + 2 * s);
    ctx.quadraticCurveTo(cx + 12 * s, cy + 12 * s, cx, cy + 16 * s);
    ctx.quadraticCurveTo(cx - 12 * s, cy + 12 * s, cx - 12 * s, cy + 2 * s);
    ctx.lineTo(cx - 12 * s, cy - 8 * s);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#12101a";
    ctx.fillRect(cx - 2 * s, cy - 6 * s, 4 * s, 12 * s);
  },
  regeneration: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * s, 0.3, Math.PI * 1.6);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10 * s, cy - 8 * s);
    ctx.lineTo(cx + 16 * s, cy - 2 * s);
    ctx.lineTo(cx + 6 * s, cy);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 3 * s, cy - 2 * s);
    ctx.lineTo(cx - 3 * s, cy + 8 * s);
    ctx.moveTo(cx - 8 * s, cy + 3 * s);
    ctx.lineTo(cx + 2 * s, cy + 3 * s);
    ctx.stroke();
  },
  pickup: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.arc(cx, cy - 2 * s, 8 * s, 0.2, Math.PI - 0.2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10 * s, cy + 2 * s);
    ctx.lineTo(cx - 6 * s, cy + 12 * s);
    ctx.moveTo(cx + 10 * s, cy + 2 * s);
    ctx.lineTo(cx + 6 * s, cy + 12 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + 4 * s, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  },
  power: (ctx, cx, cy, s, c) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.5);
    ctx.fillRect(-3 * s, -14 * s, 6 * s, 22 * s);
    ctx.beginPath();
    ctx.moveTo(0, -16 * s);
    ctx.lineTo(5 * s, -8 * s);
    ctx.lineTo(-5 * s, -8 * s);
    ctx.fill();
    ctx.fillRect(-8 * s, 6 * s, 16 * s, 4 * s);
    ctx.restore();
  },
  quickdraw: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx, cy - 8 * s);
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + 7 * s, cy + 3 * s);
    ctx.stroke();
  },
  reach: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 14 * s, cy + 10 * s);
    ctx.lineTo(cx + 12 * s, cy - 12 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 12 * s, cy - 12 * s);
    ctx.lineTo(cx + 4 * s, cy - 10 * s);
    ctx.lineTo(cx + 10 * s, cy - 4 * s);
    ctx.fill();
  },
  barrage: (ctx, cx, cy, s, c) => {
    for (let i = -1; i <= 1; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - 12 * s, cy + i * 7 * s);
      ctx.lineTo(cx + 10 * s, cy + i * 7 * s - 2 * s);
      ctx.lineWidth = 2 * s;
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 10 * s, cy + i * 7 * s - 2 * s);
      ctx.lineTo(cx + 4 * s, cy + i * 7 * s - 5 * s);
      ctx.lineTo(cx + 6 * s, cy + i * 7 * s + 2 * s);
      ctx.fill();
    }
  },
  deadliness: (ctx, cx, cy, s, c) => {
    // star crit
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const a2 = a + Math.PI / 5;
      const r1 = 13 * s;
      const r2 = 5 * s;
      const fn = i === 0 ? "moveTo" : "lineTo";
      ctx[fn](cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a2) * r2, cy + Math.sin(a2) * r2);
    }
    ctx.closePath();
    ctx.fill();
  },
  cruel: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.arc(cx, cy - 2 * s, 9 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx - 3 * s, cy - 4 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.arc(cx + 3 * s, cy - 4 * s, 1.5 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx - 5 * s, cy + 2 * s);
    ctx.quadraticCurveTo(cx, cy + 8 * s, cx + 5 * s, cy + 2 * s);
    ctx.stroke();
    ctx.fillRect(cx - 1.5 * s, cy + 8 * s, 3 * s, 6 * s);
  },
  channeling: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 14 * s, cy);
    ctx.lineTo(cx + 14 * s, cy);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(cx + (2 + i * 5) * s, cy - 5 * s);
      ctx.lineTo(cx + (6 + i * 5) * s, cy);
      ctx.lineTo(cx + (2 + i * 5) * s, cy + 5 * s);
      ctx.stroke();
    }
  },
  impact: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.arc(cx, cy + 2 * s, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 4 * s, cy - 14 * s, 8 * s, 10 * s);
    ctx.lineWidth = 2 * s;
    for (let i = 0; i < 4; i++) {
      const a = -0.8 + i * 0.5;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 12 * s, cy + Math.sin(a) * 12 * s);
      ctx.lineTo(cx + Math.cos(a) * 17 * s, cy + Math.sin(a) * 17 * s);
      ctx.stroke();
    }
  },
  force: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx - 4 * s, cy, (6 + i * 5) * s, -0.9, 0.9);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.moveTo(cx + 10 * s, cy - 8 * s);
    ctx.lineTo(cx + 16 * s, cy);
    ctx.lineTo(cx + 10 * s, cy + 8 * s);
    ctx.fill();
  },
  block_str: (ctx, cx, cy, s, c) => {
    ctx.fillRect(cx - 11 * s, cy - 12 * s, 22 * s, 24 * s);
    ctx.fillStyle = "#12101a";
    ctx.fillRect(cx - 7 * s, cy - 8 * s, 14 * s, 16 * s);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx, cy, 4 * s, 0, Math.PI * 2);
    ctx.fill();
  },
  effect_chance: (ctx, cx, cy, s, c) => {
    for (let i = 0; i < 3; i++) {
      const x = cx + (i - 1) * 9 * s;
      ctx.beginPath();
      ctx.moveTo(x, cy - 12 * s);
      ctx.quadraticCurveTo(x + 6 * s, cy - 2 * s, x, cy + 12 * s);
      ctx.quadraticCurveTo(x - 6 * s, cy - 2 * s, x, cy - 12 * s);
      ctx.fill();
    }
  },
  xp_gain: (ctx, cx, cy, s, c) => {
    ctx.fillRect(cx - 10 * s, cy - 12 * s, 20 * s, 24 * s);
    ctx.fillStyle = "#12101a";
    ctx.fillRect(cx - 7 * s, cy - 8 * s, 14 * s, 3 * s);
    ctx.fillRect(cx - 7 * s, cy - 2 * s, 14 * s, 3 * s);
    ctx.fillRect(cx - 7 * s, cy + 4 * s, 10 * s, 3 * s);
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.moveTo(cx + 6 * s, cy - 14 * s);
    ctx.lineTo(cx + 10 * s, cy - 8 * s);
    ctx.lineTo(cx + 2 * s, cy - 8 * s);
    ctx.fill();
  },
  ability_power: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexA(c, 0.7);
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 15 * s, 0, Math.PI * 2);
    ctx.stroke();
  },
  ability_haste: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 8 * s, cy - 10 * s);
    ctx.lineTo(cx + 8 * s, cy - 10 * s);
    ctx.moveTo(cx, cy - 10 * s);
    ctx.lineTo(cx, cy - 4 * s);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - 10 * s, cy - 4 * s);
    ctx.lineTo(cx + 10 * s, cy - 4 * s);
    ctx.lineTo(cx + 7 * s, cy + 14 * s);
    ctx.lineTo(cx - 7 * s, cy + 14 * s);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx, cy - 2 * s);
    ctx.lineTo(cx + 4 * s, cy + 6 * s);
    ctx.stroke();
  },
  ability_area: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 6 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 3 * s, 0, Math.PI * 2);
    ctx.fill();
  },
  ability_crit: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.moveTo(cx, cy - 14 * s);
    ctx.lineTo(cx + 4 * s, cy - 2 * s);
    ctx.lineTo(cx + 14 * s, cy - 2 * s);
    ctx.lineTo(cx + 6 * s, cy + 5 * s);
    ctx.lineTo(cx + 9 * s, cy + 14 * s);
    ctx.lineTo(cx, cy + 8 * s);
    ctx.lineTo(cx - 9 * s, cy + 14 * s);
    ctx.lineTo(cx - 6 * s, cy + 5 * s);
    ctx.lineTo(cx - 14 * s, cy - 2 * s);
    ctx.lineTo(cx - 4 * s, cy - 2 * s);
    ctx.closePath();
    ctx.fill();
  },
  // category defaults
  cat_base: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 12 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#12101a";
    ctx.font = `bold ${14 * s}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("B", cx, cy + s);
  },
  cat_weapon: (ctx, cx, cy, s, c) => {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.6);
    ctx.fillRect(-2.5 * s, -14 * s, 5 * s, 24 * s);
    ctx.beginPath();
    ctx.moveTo(0, -16 * s);
    ctx.lineTo(6 * s, -6 * s);
    ctx.lineTo(-6 * s, -6 * s);
    ctx.fill();
    ctx.restore();
  },
  cat_ability: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 8 * s, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      ctx.beginPath();
      ctx.arc(cx + Math.cos(a) * 13 * s, cy + Math.sin(a) * 13 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
    }
  },
  cat_weapon_prof: (ctx, cx, cy, s, c) => {
    ctx.lineWidth = 2.5 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 12 * s, cy + 10 * s);
    ctx.lineTo(cx, cy - 12 * s);
    ctx.lineTo(cx + 12 * s, cy + 10 * s);
    ctx.closePath();
    ctx.stroke();
    ctx.fillRect(cx - 2 * s, cy - 2 * s, 4 * s, 14 * s);
  },
  cat_ab_trait: (ctx, cx, cy, s, c) => {
    ctx.beginPath();
    ctx.arc(cx, cy, 11 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(cx - 6 * s, cy);
    ctx.lineTo(cx + 6 * s, cy);
    ctx.moveTo(cx, cy - 6 * s);
    ctx.lineTo(cx, cy + 6 * s);
    ctx.stroke();
  },
};

function traitColor(id, cat) {
  const map = {
    vitality: "#e06070",
    agility: "#60d0a0",
    defense: "#8090b0",
    regeneration: "#50c070",
    pickup: "#d4a84b",
    power: "#e07040",
    quickdraw: "#70c0e0",
    reach: "#a08060",
    barrage: "#c09050",
    deadliness: "#e0c040",
    cruel: "#c04060",
    channeling: "#90a0e0",
    impact: "#d06040",
    force: "#b080e0",
    block_str: "#7080a0",
    effect_chance: "#80c060",
    xp_gain: "#d4a84b",
    ability_power: "#a070e0",
    ability_haste: "#60c0e0",
    ability_area: "#70a0e0",
    ability_crit: "#e0a040",
  };
  if (map[id]) return map[id];
  if (cat === "weapon" || cat === "weapon_prof") return "#d4a84b";
  if (cat === "ability" || cat === "ab_trait") return "#8ab4ff";
  return "#c0a878";
}

window.paintTraitIcon = function paintTraitIcon(canvas, traitId, color, size, cat) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = size || 48;
  canvas.width = Math.round(s * dpr);
  canvas.height = Math.round(s * dpr);
  canvas.style.width = s + "px";
  canvas.style.height = s + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  window.drawTraitIcon(ctx, traitId, s, s, color, cat);
};

/** Item slot icon for chest pick */
window.drawItemSlotIcon = function drawItemSlotIcon(ctx, slot, w, h, color) {
  const c = color || "#d4a84b";
  const cx = w / 2;
  const cy = h / 2;
  const s = Math.min(w, h) / 48;
  ctx.clearRect(0, 0, w, h);
  const pad = 2;
  ctx.fillStyle = "#12101a";
  roundRectPath(ctx, pad, pad, w - pad * 2, h - pad * 2, 8);
  ctx.fill();
  ctx.strokeStyle = hexA(c, 0.55);
  ctx.lineWidth = 1.5;
  roundRectPath(ctx, pad + 0.5, pad + 0.5, w - pad * 2 - 1, h - pad * 2 - 1, 7);
  ctx.stroke();
  ctx.fillStyle = c;
  ctx.strokeStyle = c;
  ctx.lineWidth = 2.2 * s;
  if (slot === "helmet") {
    ctx.beginPath();
    ctx.arc(cx, cy + 2 * s, 12 * s, Math.PI, 0);
    ctx.lineTo(cx + 12 * s, cy + 8 * s);
    ctx.lineTo(cx - 12 * s, cy + 8 * s);
    ctx.closePath();
    ctx.fill();
  } else if (slot === "amulet") {
    ctx.beginPath();
    ctx.arc(cx, cy + 4 * s, 7 * s, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(cx, cy - 6 * s, 8 * s, 0.4, Math.PI - 0.4);
    ctx.stroke();
  } else if (slot === "ring") {
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, 5 * s, 0, Math.PI * 2);
    ctx.stroke();
  } else if (slot === "chest") {
    ctx.fillRect(cx - 11 * s, cy - 10 * s, 22 * s, 22 * s);
    ctx.fillStyle = "#12101a";
    ctx.fillRect(cx - 3 * s, cy - 4 * s, 6 * s, 14 * s);
  } else if (slot === "boots") {
    ctx.fillRect(cx - 12 * s, cy - 4 * s, 10 * s, 14 * s);
    ctx.fillRect(cx + 2 * s, cy - 4 * s, 10 * s, 14 * s);
    ctx.fillRect(cx - 14 * s, cy + 8 * s, 14 * s, 5 * s);
    ctx.fillRect(cx + 2 * s, cy + 8 * s, 14 * s, 5 * s);
  } else if (slot === "gloves") {
    ctx.fillRect(cx - 8 * s, cy - 6 * s, 16 * s, 14 * s);
    for (let i = 0; i < 4; i++) {
      ctx.fillRect(cx - 9 * s + i * 5 * s, cy - 12 * s, 3.5 * s, 8 * s);
    }
  } else {
    ctx.beginPath();
    ctx.arc(cx, cy, 10 * s, 0, Math.PI * 2);
    ctx.fill();
  }
};

window.paintItemSlotIcon = function paintItemSlotIcon(canvas, slot, color, size) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = size || 48;
  canvas.width = Math.round(s * dpr);
  canvas.height = Math.round(s * dpr);
  canvas.style.width = s + "px";
  canvas.style.height = s + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  window.drawItemSlotIcon(ctx, slot, s, s, color);
};
