/**
 * Ability icons for Tome pick UI & HUD — soft vector glyphs + paint cache.
 * Source names: https://hot.fandom.com/wiki/Ability
 */
const _ABILITY_ICON_CACHE = new Map();
const _ABILITY_ICON_CACHE_MAX = 120;

function abShade(hex, amt) {
  if (window.HOT_ART && window.HOT_ART.shade) return window.HOT_ART.shade(hex, amt);
  return hex;
}

function abGlow(ctx, x, y, r, color, a) {
  const g = ctx.createRadialGradient(x, y, r * 0.15, x, y, r);
  g.addColorStop(0, hexA(color, a != null ? a : 0.45));
  g.addColorStop(1, "transparent");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function abDisc(ctx, x, y, r, color) {
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 1, x, y, r);
  g.addColorStop(0, abShade(color, 0.35));
  g.addColorStop(0.65, color);
  g.addColorStop(1, abShade(color, -0.25));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function abNeedle(ctx, x, y, rot, len, color, s) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  const g = ctx.createLinearGradient(-len, 0, len, 0);
  g.addColorStop(0, abShade(color, -0.15));
  g.addColorStop(0.5, color);
  g.addColorStop(1, "#f0f4ff");
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(len, 0);
  ctx.lineTo(len * 0.55, -1.8 * s);
  ctx.lineTo(-len * 0.7, -1.2 * s);
  ctx.lineTo(-len * 0.85, 0);
  ctx.lineTo(-len * 0.7, 1.2 * s);
  ctx.lineTo(len * 0.55, 1.8 * s);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.fillRect(-len * 0.2, -0.7 * s, len * 0.55, 1.4 * s);
  ctx.restore();
}

window.drawAbilityIcon = function drawAbilityIcon(ctx, abilityId, w, h, color) {
  const id = abilityId || "phantom_needles";
  const c = color || "#8ab4ff";
  // Design system: circular plate for abilities
  let cx = w / 2, cy = h / 2, s = Math.min(w, h) / 48;
  if (window.HOT_ART && typeof window.HOT_ART.plateCircle === "function") {
    const p = window.HOT_ART.plateCircle(ctx, w, h, c);
    cx = p.cx; cy = p.cy; s = p.s;
  } else {
    ctx.clearRect(0, 0, w, h);
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
  }

  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // soft center wash
  abGlow(ctx, cx, cy, 16 * s, c, 0.18);

  switch (id) {
    case "phantom_needles":
      for (let i = -1; i <= 1; i++) {
        abNeedle(ctx, cx + i * 6 * s, cy + i * 2 * s, -0.55 + i * 0.18, 12 * s, c, s);
      }
      abGlow(ctx, cx + 8 * s, cy - 2 * s, 6 * s, "#e0e8ff", 0.35);
      break;

    case "arcane_splinters":
      abGlow(ctx, cx, cy, 14 * s, c, 0.3);
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2 - 0.4;
        const px = cx + Math.cos(a) * 15 * s;
        const py = cy + Math.sin(a) * 15 * s;
        const g = ctx.createLinearGradient(cx, cy, px, py);
        g.addColorStop(0, hexA(c, 0.2));
        g.addColorStop(1, c);
        ctx.strokeStyle = g;
        ctx.lineWidth = 2.2 * s;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(px, py);
        ctx.stroke();
        abDisc(ctx, px, py, 2.8 * s, c);
      }
      abDisc(ctx, cx, cy, 4 * s, abShade(c, 0.2));
      break;

    case "astronomers_orbs":
      ctx.strokeStyle = hexA(c, 0.55);
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 15 * s, 6.5 * s, 0.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.ellipse(cx, cy, 10 * s, 4.5 * s, -0.5, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 3; i++) {
        const a = (i / 3) * Math.PI * 2 + 0.2;
        const ox = cx + Math.cos(a) * 12 * s;
        const oy = cy + Math.sin(a) * 5 * s;
        abGlow(ctx, ox, oy, 7 * s, c, 0.4);
        abDisc(ctx, ox, oy, 4.2 * s, c);
        ctx.fillStyle = "rgba(255,255,255,0.55)";
        ctx.beginPath();
        ctx.arc(ox - s, oy - s, 1.4 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      break;

    case "lightning_strikes":
      abGlow(ctx, cx, cy, 14 * s, c, 0.35);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(cx - 3 * s, cy - 16 * s);
      ctx.lineTo(cx + 5 * s, cy - 1 * s);
      ctx.lineTo(cx - 1 * s, cy + 1 * s);
      ctx.lineTo(cx + 7 * s, cy + 16 * s);
      ctx.lineTo(cx - 5 * s, cy + 2 * s);
      ctx.lineTo(cx + 2 * s, cy);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#e8f4ff";
      ctx.beginPath();
      ctx.moveTo(cx - 1 * s, cy - 10 * s);
      ctx.lineTo(cx + 2 * s, cy - 1 * s);
      ctx.lineTo(cx - 0.5 * s, cy);
      ctx.closePath();
      ctx.fill();
      break;

    case "flame_strike":
      abGlow(ctx, cx, cy + 2 * s, 16 * s, c, 0.35);
      for (let i = 0; i < 5; i++) {
        const ox = cx - 12 * s + i * 6 * s;
        const g = ctx.createLinearGradient(ox, cy + 12 * s, ox, cy - 14 * s);
        g.addColorStop(0, hexA(c, 0.15));
        g.addColorStop(0.45, c);
        g.addColorStop(1, "#fff0a0");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.moveTo(ox, cy + 11 * s);
        ctx.quadraticCurveTo(ox - 5 * s, cy, ox, cy - 13 * s + i);
        ctx.quadraticCurveTo(ox + 5 * s, cy, ox, cy + 11 * s);
        ctx.fill();
      }
      abDisc(ctx, cx + 4 * s, cy, 3.5 * s, "#ffe080");
      break;

    case "dragons_breath":
      abGlow(ctx, cx + 6 * s, cy, 12 * s, c, 0.3);
      abDisc(ctx, cx - 7 * s, cy, 7 * s, "#6a4030");
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.moveTo(cx - 2 * s, cy - 5 * s);
      ctx.lineTo(cx + 17 * s, cy - 11 * s);
      ctx.lineTo(cx + 17 * s, cy + 11 * s);
      ctx.lineTo(cx - 2 * s, cy + 5 * s);
      ctx.fill();
      ctx.fillStyle = "#ffe080";
      ctx.beginPath();
      ctx.moveTo(cx + 2 * s, cy);
      ctx.lineTo(cx + 13 * s, cy - 5 * s);
      ctx.lineTo(cx + 13 * s, cy + 5 * s);
      ctx.fill();
      break;

    case "frost_avalanche":
      abGlow(ctx, cx, cy, 15 * s, c, 0.3);
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.2 * s;
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
      abDisc(ctx, cx, cy, 3.5 * s, "#e8f8ff");
      break;

    case "hailstorm":
      abGlow(ctx, cx, cy - 4 * s, 14 * s, c, 0.28);
      const cg = ctx.createRadialGradient(cx, cy - 8 * s, 2, cx, cy - 4 * s, 18 * s);
      cg.addColorStop(0, "rgba(220,235,255,0.65)");
      cg.addColorStop(1, "rgba(120,160,200,0.15)");
      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.ellipse(cx, cy - 6 * s, 16 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      for (let i = 0; i < 5; i++) {
        abDisc(ctx, cx - 12 * s + i * 6 * s, cy + 4 * s + (i % 2) * 3 * s, 2 * s, c);
      }
      break;

    case "ring_blades":
      abGlow(ctx, cx, cy, 14 * s, c, 0.25);
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.8 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 11 * s, 0, Math.PI * 2);
      ctx.stroke();
      for (let i = 0; i < 5; i++) {
        const a = (i / 5) * Math.PI * 2;
        ctx.save();
        ctx.translate(cx + Math.cos(a) * 11 * s, cy + Math.sin(a) * 11 * s);
        ctx.rotate(a);
        const bg = ctx.createLinearGradient(0, -7 * s, 0, 7 * s);
        bg.addColorStop(0, "#fff");
        bg.addColorStop(0.5, c);
        bg.addColorStop(1, abShade(c, -0.2));
        ctx.fillStyle = bg;
        ctx.beginPath();
        ctx.moveTo(0, -7 * s);
        ctx.lineTo(2.2 * s, 0);
        ctx.lineTo(0, 7 * s);
        ctx.lineTo(-2.2 * s, 0);
        ctx.fill();
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
      // ball lightning — soft glow (no shadowBlur for perf)
      abGlow(ctx, cx, cy, 16 * s, c, 0.45);
      ctx.strokeStyle = hexA(c, 0.55);
      ctx.lineWidth = 1.6 * s;
      ctx.beginPath();
      ctx.arc(cx, cy, 14 * s, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, 10 * s, 0.2, Math.PI * 1.4);
      ctx.stroke();
      abDisc(ctx, cx, cy, 7.5 * s, c);
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
      abGlow(ctx, cx, cy, 14 * s, c, 0.35);
      abDisc(ctx, cx, cy, 9 * s, c);
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.beginPath();
      ctx.arc(cx - 2 * s, cy - 2 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
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
  const col = color || "#8ab4ff";
  const key = `${abilityId || "?"}@${s}@${col}@${dpr}`;
  let cached = _ABILITY_ICON_CACHE.get(key);
  if (!cached) {
    const off = document.createElement("canvas");
    off.width = Math.round(s * dpr);
    off.height = Math.round(s * dpr);
    const octx = off.getContext("2d");
    octx.setTransform(dpr, 0, 0, dpr, 0, 0);
    window.drawAbilityIcon(octx, abilityId, s, s, col);
    cached = off;
    if (_ABILITY_ICON_CACHE.size >= _ABILITY_ICON_CACHE_MAX) {
      const first = _ABILITY_ICON_CACHE.keys().next().value;
      _ABILITY_ICON_CACHE.delete(first);
    }
    _ABILITY_ICON_CACHE.set(key, cached);
  }
  canvas.width = cached.width;
  canvas.height = cached.height;
  canvas.style.width = s + "px";
  canvas.style.height = s + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(cached, 0, 0);
};

/**
 * Trait / weapon prof / category icons for level-up pick menu.
 */
window.drawTraitIcon = function drawTraitIcon(ctx, traitId, w, h, color, cat) {
  const id = traitId || "vitality";
  const c = color || traitColor(id, cat);
  let cx = w / 2;
  let cy = h / 2;
  let s = Math.min(w, h) / 48;

  if (window.HOT_ART && typeof window.HOT_ART.plateSquare === "function") {
    const p = window.HOT_ART.plateSquare(ctx, w, h, c);
    cx = p.cx; cy = p.cy; s = p.s;
  } else {
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
  }
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

/** Small drawing helpers for unique item glyphs */
function _ig(ctx) {
  return {
    disc(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    },
    ring(x, y, r, col, lw) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw || 2;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
    },
    tri(x, y, r, col, up) {
      ctx.fillStyle = col;
      ctx.beginPath();
      if (up) {
        ctx.moveTo(x, y - r);
        ctx.lineTo(x + r * 0.9, y + r * 0.7);
        ctx.lineTo(x - r * 0.9, y + r * 0.7);
      } else {
        ctx.moveTo(x, y + r);
        ctx.lineTo(x + r * 0.9, y - r * 0.7);
        ctx.lineTo(x - r * 0.9, y - r * 0.7);
      }
      ctx.closePath();
      ctx.fill();
    },
    diamond(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.75, y);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r * 0.75, y);
      ctx.closePath();
      ctx.fill();
    },
    bolt(x, y, h, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x - 2, y - h);
      ctx.lineTo(x + 4, y - 2);
      ctx.lineTo(x, y - 2);
      ctx.lineTo(x + 3, y + h);
      ctx.lineTo(x - 5, y + 1);
      ctx.lineTo(x - 1, y + 1);
      ctx.closePath();
      ctx.fill();
    },
    flame(x, y, h, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y - h);
      ctx.quadraticCurveTo(x + h * 0.7, y - h * 0.2, x + h * 0.35, y + h * 0.5);
      ctx.quadraticCurveTo(x, y + h * 0.15, x - h * 0.35, y + h * 0.5);
      ctx.quadraticCurveTo(x - h * 0.7, y - h * 0.2, x, y - h);
      ctx.fill();
    },
    drop(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.quadraticCurveTo(x + r, y, x, y + r);
      ctx.quadraticCurveTo(x - r, y, x, y - r);
      ctx.fill();
    },
    star(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const rr = i % 2 === 0 ? r : r * 0.42;
        const px = x + Math.cos(a) * rr;
        const py = y + Math.sin(a) * rr;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    },
    cross(x, y, r, col, lw) {
      ctx.strokeStyle = col;
      ctx.lineWidth = lw || 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x, y + r);
      ctx.moveTo(x - r, y);
      ctx.lineTo(x + r, y);
      ctx.stroke();
    },
    eye(x, y, r, col) {
      ctx.strokeStyle = col;
      ctx.fillStyle = col;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(x, y, r * 0.28, 0, Math.PI * 2);
      ctx.fill();
    },
    heart(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.7);
      ctx.bezierCurveTo(x + r * 1.2, y - r * 0.1, x + r * 0.5, y - r, x, y - r * 0.35);
      ctx.bezierCurveTo(x - r * 0.5, y - r, x - r * 1.2, y - r * 0.1, x, y + r * 0.7);
      ctx.fill();
    },
    leaf(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, y, r * 0.55, r, -0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexA("#fff", 0.35);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y + r * 0.7);
      ctx.lineTo(x, y - r * 0.7);
      ctx.stroke();
    },
    skull(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y - r * 0.15, r * 0.7, 0, Math.PI * 2);
      ctx.fill();
      roundRectPath(ctx, x - r * 0.45, y + r * 0.15, r * 0.9, r * 0.45, 2);
      ctx.fill();
      ctx.fillStyle = "#12101a";
      ctx.beginPath();
      ctx.arc(x - r * 0.25, y - r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.arc(x + r * 0.25, y - r * 0.2, r * 0.18, 0, Math.PI * 2);
      ctx.fill();
    },
    shield(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y - r);
      ctx.lineTo(x + r * 0.85, y - r * 0.4);
      ctx.lineTo(x + r * 0.7, y + r * 0.5);
      ctx.lineTo(x, y + r);
      ctx.lineTo(x - r * 0.7, y + r * 0.5);
      ctx.lineTo(x - r * 0.85, y - r * 0.4);
      ctx.closePath();
      ctx.fill();
    },
    wing(x, y, r, col, dir) {
      const d = dir || 1;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.quadraticCurveTo(x + d * r * 1.2, y - r, x + d * r * 0.3, y + r * 0.8);
      ctx.quadraticCurveTo(x + d * r * 0.1, y + r * 0.2, x, y);
      ctx.fill();
    },
    horns(x, y, r, col) {
      ctx.strokeStyle = col;
      ctx.lineWidth = 2.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - r * 0.4, y);
      ctx.quadraticCurveTo(x - r, y - r * 0.2, x - r * 0.7, y - r);
      ctx.moveTo(x + r * 0.4, y);
      ctx.quadraticCurveTo(x + r, y - r * 0.2, x + r * 0.7, y - r);
      ctx.stroke();
    },
    crown(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x - r, y + r * 0.3);
      ctx.lineTo(x - r * 0.7, y - r * 0.8);
      ctx.lineTo(x - r * 0.25, y);
      ctx.lineTo(x, y - r);
      ctx.lineTo(x + r * 0.25, y);
      ctx.lineTo(x + r * 0.7, y - r * 0.8);
      ctx.lineTo(x + r, y + r * 0.3);
      ctx.closePath();
      ctx.fill();
    },
    boot(x, y, r, col) {
      ctx.fillStyle = col;
      roundRectPath(ctx, x - r * 0.35, y - r * 0.7, r * 0.7, r * 1.1, 2);
      ctx.fill();
      roundRectPath(ctx, x - r * 0.55, y + r * 0.25, r * 1.15, r * 0.4, 2);
      ctx.fill();
    },
    glove(x, y, r, col) {
      ctx.fillStyle = col;
      roundRectPath(ctx, x - r * 0.45, y - r * 0.1, r * 0.9, r * 0.85, 3);
      ctx.fill();
      for (let i = 0; i < 4; i++) {
        roundRectPath(ctx, x - r * 0.5 + i * r * 0.28, y - r * 0.85, r * 0.2, r * 0.75, 1.5);
        ctx.fill();
      }
    },
    plate(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.moveTo(x - r * 0.8, y - r * 0.7);
      ctx.lineTo(x + r * 0.8, y - r * 0.7);
      ctx.lineTo(x + r, y + r * 0.85);
      ctx.lineTo(x - r, y + r * 0.85);
      ctx.closePath();
      ctx.fill();
    },
    helm(x, y, r, col) {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.85, Math.PI * 1.05, Math.PI * 1.95);
      ctx.lineTo(x + r * 0.85, y + r * 0.45);
      ctx.lineTo(x - r * 0.85, y + r * 0.45);
      ctx.closePath();
      ctx.fill();
    },
  };
}

/**
 * Unique glyph per item id (soft plate + distinctive symbol).
 * Falls back to slot base + hash accents if id unknown.
 */
function drawItemUniqueGlyph(ctx, itemId, slot, cx, cy, s, c, lite, dark) {
  const id = String(itemId || "").toLowerCase();
  const g = _ig(ctx);
  const R = 11 * s;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  // Slot silhouette (subtle underlay)
  ctx.globalAlpha = 0.22;
  if (slot === "helmet") g.helm(cx, cy + 1 * s, R * 0.95, c);
  else if (slot === "amulet") g.diamond(cx, cy + 2 * s, R * 0.7, c);
  else if (slot === "ring") g.ring(cx, cy + 1 * s, R * 0.65, c, 2.5 * s);
  else if (slot === "chest") g.plate(cx, cy, R * 0.85, c);
  else if (slot === "boots") g.boot(cx, cy, R * 0.75, c);
  else if (slot === "gloves") g.glove(cx, cy, R * 0.75, c);
  ctx.globalAlpha = 1;

  // Per-item unique mark (main)
  const draw = {
    // Helmet
    hood: () => { g.helm(cx, cy, R * 0.9, c); ctx.fillStyle = dark; roundRectPath(ctx, cx - 6 * s, cy + 2 * s, 12 * s, 5 * s, 2); ctx.fill(); },
    helmet: () => { g.helm(cx, cy, R, c); g.cross(cx, cy + 1 * s, 4 * s, dark, 1.8 * s); },
    fighters_headband: () => { g.helm(cx, cy + 2 * s, R * 0.75, c); ctx.strokeStyle = lite; ctx.lineWidth = 3 * s; ctx.beginPath(); ctx.arc(cx, cy - 2 * s, 10 * s, 0.2, Math.PI - 0.2); ctx.stroke(); },
    wind_crown: () => { g.crown(cx, cy, R * 0.85, c); g.wing(cx - 2 * s, cy + 2 * s, 7 * s, lite, -1); g.wing(cx + 2 * s, cy + 2 * s, 7 * s, lite, 1); },
    ruby_circlet: () => { g.crown(cx, cy - 2 * s, R * 0.7, c); g.disc(cx, cy + 4 * s, 4 * s, "#ff5050"); g.flame(cx, cy + 8 * s, 5 * s, "#ff8040"); },
    thunder_crown: () => { g.crown(cx, cy - 1 * s, R * 0.8, c); g.bolt(cx, cy + 4 * s, 7 * s, "#80c0ff"); },
    war_horns: () => { g.helm(cx, cy + 2 * s, R * 0.75, c); g.horns(cx, cy - 2 * s, 10 * s, lite); },
    mask_of_madness: () => { g.helm(cx, cy, R * 0.9, c); g.eye(cx - 4 * s, cy, 3.5 * s, "#1a1010"); g.eye(cx + 4 * s, cy, 3.5 * s, "#1a1010"); g.tri(cx, cy + 6 * s, 3 * s, "#ff4060", false); },
    gorgon_mask: () => { g.helm(cx, cy, R * 0.85, c); g.eye(cx, cy - 1 * s, 5 * s, lite); for (let i = -2; i <= 2; i++) { ctx.strokeStyle = "#60a060"; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(cx + i * 3 * s, cy + 4 * s); ctx.quadraticCurveTo(cx + i * 5 * s, cy + 10 * s, cx + i * 2 * s, cy + 12 * s); ctx.stroke(); } },
    alchemist_goggles: () => { g.ring(cx - 5 * s, cy, 5 * s, c, 2 * s); g.ring(cx + 5 * s, cy, 5 * s, c, 2 * s); ctx.strokeStyle = c; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(cx - 1 * s, cy); ctx.lineTo(cx + 1 * s, cy); ctx.stroke(); g.leaf(cx, cy + 8 * s, 4 * s, lite); },
    frost_dragon_helmet: () => { g.helm(cx, cy, R, c); g.horns(cx, cy - 4 * s, 9 * s, "#a0e0ff"); g.tri(cx, cy + 2 * s, 4 * s, "#80d0ff", true); },
    twisted_chaplet: () => { g.ring(cx, cy - 2 * s, 9 * s, c, 2.2 * s); g.leaf(cx - 5 * s, cy + 4 * s, 5 * s, "#70a050"); g.leaf(cx + 5 * s, cy + 4 * s, 5 * s, "#70a050"); },
    vision_crown: () => { g.crown(cx, cy - 2 * s, R * 0.75, c); g.eye(cx, cy + 5 * s, 6 * s, lite); },
    war_chiefs_visor: () => { g.helm(cx, cy, R * 0.9, c); ctx.fillStyle = dark; ctx.fillRect(cx - 9 * s, cy - 2 * s, 18 * s, 5 * s); g.tri(cx, cy + 7 * s, 3.5 * s, lite, true); },
    // Amulet
    jade_amulet: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.diamond(cx, cy + 3 * s, 8 * s, "#40c070"); g.leaf(cx, cy + 3 * s, 4 * s, lite); },
    maidens_tear: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.drop(cx, cy + 3 * s, 8 * s, "#80c0e8"); g.heart(cx, cy + 2 * s, 3.5 * s, lite); },
    blood_catcher: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.drop(cx, cy + 3 * s, 8 * s, "#c03040"); g.drop(cx + 5 * s, cy + 6 * s, 4 * s, "#ff6080"); },
    collar_of_confidence: () => { g.ring(cx, cy, 9 * s, c, 3 * s); g.star(cx, cy, 5 * s, lite); },
    duelists_spark: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.diamond(cx, cy + 3 * s, 7 * s, c); g.bolt(cx, cy + 3 * s, 6 * s, "#ffe080"); },
    scars_of_toil: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.cross(cx, cy + 3 * s, 7 * s, "#c06060", 2.5 * s); ctx.strokeStyle = c; ctx.beginPath(); ctx.moveTo(cx - 6 * s, cy - 2 * s); ctx.lineTo(cx + 6 * s, cy + 8 * s); ctx.stroke(); },
    gatherers_charm: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.disc(cx, cy + 2 * s, 6 * s, "#d4a84b"); g.star(cx, cy + 2 * s, 4 * s, lite); },
    elemental_capacitor: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.disc(cx, cy + 3 * s, 7 * s, c); g.bolt(cx - 3 * s, cy + 3 * s, 4 * s, "#60a0ff"); g.flame(cx + 4 * s, cy + 4 * s, 4 * s, "#ff8040"); },
    elemental_resonator: () => { g.ring(cx, cy - 6 * s, 6 * s, c, 1.5 * s); g.ring(cx, cy + 4 * s, 7 * s, c, 2 * s); g.disc(cx, cy + 4 * s, 3 * s, lite); },
    natural_selector: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.leaf(cx - 3 * s, cy + 3 * s, 6 * s, "#60a050"); g.leaf(cx + 4 * s, cy + 5 * s, 5 * s, "#80c060"); },
    philosophers_stone: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.diamond(cx, cy + 3 * s, 9 * s, "#e06080"); g.star(cx, cy + 3 * s, 4 * s, lite); },
    shepherds_boon: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.disc(cx, cy + 4 * s, 6 * s, c); g.wing(cx, cy + 4 * s, 8 * s, lite, 1); },
    warriors_fervor: () => { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.flame(cx, cy + 4 * s, 9 * s, "#ff6040"); g.tri(cx, cy + 2 * s, 4 * s, lite, true); },
    // Ring
    wooden_ring: () => { g.ring(cx, cy, 9 * s, "#8a6030", 3 * s); g.leaf(cx, cy - 8 * s, 4 * s, "#60a040"); },
    copper_ring: () => { g.ring(cx, cy, 9 * s, "#c08040", 3 * s); g.disc(cx, cy - 8 * s, 3 * s, "#e0a060"); },
    iron_ring: () => { g.ring(cx, cy, 9 * s, "#9098a0", 3.2 * s); g.ring(cx, cy, 5 * s, dark, 1.5 * s); },
    ring_of_fire: () => { g.ring(cx, cy, 9 * s, c, 2.8 * s); g.flame(cx, cy, 7 * s, "#ff7040"); },
    ring_of_thunder: () => { g.ring(cx, cy, 9 * s, c, 2.8 * s); g.bolt(cx, cy, 8 * s, "#80c0ff"); },
    ring_of_frost: () => { g.ring(cx, cy, 9 * s, c, 2.8 * s); g.diamond(cx, cy, 5 * s, "#a0e8ff"); g.tri(cx, cy - 6 * s, 3 * s, lite, true); },
    ring_of_earth: () => { g.ring(cx, cy, 9 * s, c, 2.8 * s); g.leaf(cx, cy, 6 * s, "#70a050"); g.tri(cx, cy + 2 * s, 3 * s, dark, false); },
    echoing_band: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.ring(cx, cy, 5 * s, lite, 1.5 * s); g.ring(cx, cy, 2 * s, c, 1 * s); },
    guiding_star: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.star(cx, cy, 7 * s, lite); },
    seal_of_rebirth: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.cross(cx, cy, 6 * s, lite, 2 * s); g.disc(cx, cy, 2 * s, c); },
    demonic_bond: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.horns(cx, cy - 2 * s, 7 * s, "#c04060"); g.tri(cx, cy + 3 * s, 3 * s, dark, false); },
    necromancers_clutch: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.skull(cx, cy, 7 * s, lite); },
    pest_ring: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.leaf(cx, cy, 5 * s, "#80a040"); g.drop(cx + 4 * s, cy + 4 * s, 3 * s, "#a0c040"); },
    holy_relic: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.cross(cx, cy, 7 * s, "#fff0a0", 2.4 * s); },
    blighted_indolence: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.drop(cx, cy, 6 * s, "#608040"); g.skull(cx, cy, 4 * s, dark); },
    ability_signet: () => { g.ring(cx, cy, 9 * s, c, 2.5 * s); g.star(cx, cy, 5 * s, "#a070e0"); g.disc(cx, cy, 2 * s, lite); },
    // Chest
    chain_mail: () => { g.plate(cx, cy, R * 0.9, c); for (let i = 0; i < 3; i++) { for (let j = 0; j < 3; j++) g.ring(cx - 5 * s + j * 5 * s, cy - 4 * s + i * 5 * s, 2 * s, dark, 1 * s); } },
    plate_armor: () => { g.plate(cx, cy, R, c); g.shield(cx, cy, 5 * s, lite); },
    blazing_shell: () => { g.plate(cx, cy, R * 0.9, c); g.flame(cx, cy, 8 * s, "#ff7040"); },
    blood_soaked_shirt: () => { g.plate(cx, cy, R * 0.85, c); g.drop(cx - 3 * s, cy, 5 * s, "#c03040"); g.drop(cx + 4 * s, cy + 3 * s, 4 * s, "#ff4060"); },
    defiant_plate: () => { g.plate(cx, cy, R, c); g.shield(cx, cy, 7 * s, lite); g.cross(cx, cy, 3 * s, dark, 1.5 * s); },
    hunters_garb: () => { g.plate(cx, cy, R * 0.85, c); g.tri(cx, cy - 2 * s, 5 * s, lite, true); g.leaf(cx + 5 * s, cy + 4 * s, 4 * s, "#70a050"); },
    shadow_cloak: () => { g.plate(cx, cy, R * 0.85, "#403050"); g.wing(cx - 2 * s, cy, 10 * s, c, -1); g.wing(cx + 2 * s, cy, 10 * s, c, 1); },
    beastmasters_hide: () => { g.plate(cx, cy, R * 0.9, c); g.horns(cx, cy - 6 * s, 8 * s, dark); g.eye(cx, cy + 2 * s, 4 * s, lite); },
    brokers_cape: () => { g.plate(cx, cy, R * 0.85, c); g.disc(cx, cy, 5 * s, "#d4a84b"); g.star(cx, cy, 3 * s, lite); },
    crones_gown: () => { g.plate(cx, cy, R * 0.85, c); g.leaf(cx - 4 * s, cy, 6 * s, "#70a050"); g.drop(cx + 4 * s, cy + 2 * s, 4 * s, "#90c060"); },
    thunder_cape: () => { g.plate(cx, cy, R * 0.85, c); g.bolt(cx, cy, 10 * s, "#80c0ff"); g.wing(cx + 4 * s, cy, 7 * s, lite, 1); },
    // Boots
    plated_boots: () => { g.boot(cx - 5 * s, cy, R * 0.7, c); g.boot(cx + 5 * s, cy, R * 0.7, c); g.shield(cx, cy - 6 * s, 3 * s, lite); },
    running_shoes: () => { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); ctx.strokeStyle = lite; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(cx - 10 * s, cy); ctx.lineTo(cx + 10 * s, cy - 4 * s); ctx.stroke(); },
    firewalker_boots: () => { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); g.flame(cx, cy + 6 * s, 6 * s, "#ff7040"); },
    bog_boots: () => { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); g.drop(cx, cy + 6 * s, 4 * s, "#508060"); },
    electrostatic_treads: () => { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); g.bolt(cx, cy - 4 * s, 6 * s, "#80c0ff"); },
    elven_slippers: () => { g.boot(cx - 4 * s, cy, R * 0.55, c); g.boot(cx + 5 * s, cy, R * 0.55, c); g.leaf(cx, cy - 6 * s, 5 * s, "#80c060"); },
    pace_setter: () => { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); g.star(cx, cy - 6 * s, 4 * s, lite); },
    spike_boots: () => { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); g.tri(cx - 4 * s, cy + 8 * s, 3 * s, lite, false); g.tri(cx + 5 * s, cy + 8 * s, 3 * s, lite, false); },
    berserker_boots: () => { g.boot(cx - 4 * s, cy, R * 0.7, c); g.boot(cx + 5 * s, cy, R * 0.7, c); g.flame(cx, cy - 4 * s, 5 * s, "#ff5040"); g.horns(cx, cy - 8 * s, 5 * s, dark); },
    frost_greaves: () => { g.boot(cx - 4 * s, cy, R * 0.7, c); g.boot(cx + 5 * s, cy, R * 0.7, c); g.diamond(cx, cy - 5 * s, 4 * s, "#a0e8ff"); },
    swamp_raisers: () => { g.boot(cx - 4 * s, cy, R * 0.7, c); g.boot(cx + 5 * s, cy, R * 0.7, c); g.leaf(cx, cy - 5 * s, 5 * s, "#60a050"); },
    demonic_grasp: () => { g.boot(cx - 4 * s, cy, R * 0.7, c); g.boot(cx + 5 * s, cy, R * 0.7, c); g.horns(cx, cy - 6 * s, 7 * s, "#c04060"); },
    // Gloves
    longfinger_gloves: () => { g.glove(cx, cy, R * 0.85, c); ctx.strokeStyle = lite; ctx.lineWidth = 1.5 * s; ctx.beginPath(); ctx.moveTo(cx + 8 * s, cy - 10 * s); ctx.lineTo(cx + 12 * s, cy - 14 * s); ctx.stroke(); },
    quickhand_gloves: () => { g.glove(cx, cy, R * 0.8, c); g.bolt(cx + 6 * s, cy - 4 * s, 5 * s, lite); },
    hunting_gloves: () => { g.glove(cx, cy, R * 0.8, c); g.tri(cx + 6 * s, cy - 6 * s, 4 * s, lite, true); },
    fencing_gauntlets: () => { g.glove(cx, cy, R * 0.85, c); ctx.strokeStyle = lite; ctx.lineWidth = 2 * s; ctx.beginPath(); ctx.moveTo(cx - 8 * s, cy + 4 * s); ctx.lineTo(cx + 10 * s, cy - 8 * s); ctx.stroke(); },
    invocators_grasp: () => { g.glove(cx, cy, R * 0.8, c); g.star(cx + 4 * s, cy - 6 * s, 5 * s, "#a070e0"); },
    sparking_tips: () => { g.glove(cx, cy, R * 0.8, c); g.bolt(cx - 4 * s, cy - 8 * s, 4 * s, "#80c0ff"); g.bolt(cx + 6 * s, cy - 6 * s, 4 * s, "#ffe080"); },
    spellcaster_gloves: () => { g.glove(cx, cy, R * 0.8, c); g.disc(cx + 4 * s, cy - 6 * s, 4 * s, "#a070e0"); g.ring(cx + 4 * s, cy - 6 * s, 6 * s, lite, 1.2 * s); },
    thornfists: () => { g.glove(cx, cy, R * 0.85, c); g.tri(cx - 6 * s, cy - 8 * s, 3 * s, lite, true); g.tri(cx + 2 * s, cy - 10 * s, 3 * s, lite, true); g.tri(cx + 8 * s, cy - 6 * s, 3 * s, lite, true); },
    alchemists_trade: () => { g.glove(cx, cy, R * 0.8, c); g.diamond(cx + 5 * s, cy - 6 * s, 5 * s, "#80c060"); g.drop(cx - 4 * s, cy - 4 * s, 3 * s, "#c0e080"); },
    bloodstained_wrappings: () => { g.glove(cx, cy, R * 0.8, c); g.drop(cx + 4 * s, cy - 4 * s, 5 * s, "#c03040"); g.drop(cx - 3 * s, cy + 2 * s, 3 * s, "#ff6080"); },
    frost_thorns: () => { g.glove(cx, cy, R * 0.8, c); g.tri(cx + 5 * s, cy - 8 * s, 4 * s, "#a0e8ff", true); g.diamond(cx - 3 * s, cy - 4 * s, 3 * s, "#80d0ff"); },
    leeching_fingers: () => { g.glove(cx, cy, R * 0.8, c); g.drop(cx + 5 * s, cy - 4 * s, 5 * s, "#a04070"); g.heart(cx - 2 * s, cy + 2 * s, 3 * s, "#e06090"); },
    unholy_touch: () => { g.glove(cx, cy, R * 0.8, c); g.skull(cx + 4 * s, cy - 6 * s, 5 * s, lite); g.cross(cx - 4 * s, cy + 2 * s, 3 * s, dark, 1.5 * s); },
    thundercharge_gauntlets: () => { g.glove(cx, cy, R * 0.85, c); g.bolt(cx + 2 * s, cy - 8 * s, 8 * s, "#80c0ff"); g.ring(cx + 6 * s, cy + 2 * s, 3 * s, lite, 1.2 * s); },
  };

  if (draw[id]) {
    draw[id]();
    return;
  }

  // Fallback: slot base + unique hash accents
  ctx.globalAlpha = 1;
  if (slot === "helmet") g.helm(cx, cy, R * 0.9, c);
  else if (slot === "amulet") { g.ring(cx, cy - 8 * s, 5 * s, c, 1.5 * s); g.diamond(cx, cy + 3 * s, 8 * s, c); }
  else if (slot === "ring") g.ring(cx, cy, 9 * s, c, 2.8 * s);
  else if (slot === "chest") g.plate(cx, cy, R * 0.9, c);
  else if (slot === "boots") { g.boot(cx - 4 * s, cy, R * 0.65, c); g.boot(cx + 5 * s, cy, R * 0.65, c); }
  else if (slot === "gloves") g.glove(cx, cy, R * 0.8, c);
  else g.disc(cx, cy, 8 * s, c);

  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0;
  const accents = [g.star, g.bolt, g.flame, g.diamond, g.leaf, g.eye, g.cross, g.tri];
  const fn = accents[Math.abs(h) % accents.length];
  if (fn === g.tri) fn(cx + 6 * s, cy - 6 * s, 4 * s, lite, true);
  else if (fn === g.bolt || fn === g.flame) fn(cx + 5 * s, cy - 5 * s, 5 * s, lite);
  else if (fn === g.cross) fn(cx + 5 * s, cy - 5 * s, 4 * s, lite, 1.5 * s);
  else fn(cx + 5 * s, cy - 5 * s, 4 * s, lite);
}

/**
 * Item icon — soft plate + glyph riêng từng itemId.
 */
window.drawItemSlotIcon = function drawItemSlotIcon(ctx, slot, w, h, color, itemId) {
  const c = color || "#d4a84b";
  const id = String(itemId || "").toLowerCase();
  let cx = w / 2;
  let cy = h / 2;
  let s = Math.min(w, h) / 48;
  if (window.HOT_ART && typeof window.HOT_ART.plateSquare === "function") {
    const p = window.HOT_ART.plateSquare(ctx, w, h, c);
    cx = p.cx; cy = p.cy; s = p.s;
  } else {
    ctx.clearRect(0, 0, w, h);
    const pad = 2;
    ctx.fillStyle = "#12101a";
    roundRectPath(ctx, pad, pad, w - pad * 2, h - pad * 2, 8);
    ctx.fill();
    ctx.strokeStyle = hexA(c, 0.55);
    ctx.lineWidth = 1.5;
    roundRectPath(ctx, pad + 0.5, pad + 0.5, w - pad * 2 - 1, h - pad * 2 - 1, 7);
    ctx.stroke();
  }

  const lite = window.HOT_ART && window.HOT_ART.shade ? window.HOT_ART.shade(c, 0.35) : "#fff8e0";
  const dark = window.HOT_ART && window.HOT_ART.shade ? window.HOT_ART.shade(c, -0.28) : "#2a1810";
  try {
    drawItemUniqueGlyph(ctx, id, slot || "ring", cx, cy, s, c, lite, dark);
  } catch (e) {
    ctx.fillStyle = c;
    ctx.beginPath();
    ctx.arc(cx, cy, 8 * s, 0, Math.PI * 2);
    ctx.fill();
  }
};

/** Paint item icon — prefers itemId for unique glyph */
window.paintItemSlotIcon = function paintItemSlotIcon(canvas, slot, color, size, itemId) {
  if (!canvas) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const s = size || 48;
  // Resolve slot/color from HOT data if only itemId given as slot by mistake
  let sid = slot;
  let col = color;
  let iid = itemId;
  const items = (window.HOT_DATA && window.HOT_DATA.ITEMS) || (window.HOT && window.HOT.ITEMS);
  if (iid && items && items[iid]) {
    const it = items[iid];
    if (!sid || sid === iid) sid = it.slot;
    if (!col) col = it.color;
  }
  canvas.width = Math.round(s * dpr);
  canvas.height = Math.round(s * dpr);
  canvas.style.width = s + "px";
  canvas.style.height = s + "px";
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  window.drawItemSlotIcon(ctx, sid, s, s, col, iid);
};

/** Convenience: paint by item id only */
window.paintItemIcon = function paintItemIcon(canvas, itemId, color, size) {
  let slot = "ring";
  let col = color;
  const items = (window.HOT_DATA && window.HOT_DATA.ITEMS) || (window.HOT && window.HOT.ITEMS);
  if (items && items[itemId]) {
    const it = items[itemId];
    slot = it.slot || slot;
    col = color || it.color;
  }
  window.paintItemSlotIcon(canvas, slot, col, size || 40, itemId);
};
