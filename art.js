/**
 * Halls of Torment — Vector Soft Design System
 * Tokens + icon plates + soft world draws (hero helpers / enemy / pickup / FX colors).
 * Syncs ability · item · mark · artifact · trait · combat look.
 */
window.HOT_ART = (() => {
  /** Master switch: never use pixel bake for world */
  const USE_PIXEL_SPRITES = false;

  // ── Design tokens ───────────────────────────────────────
  const TOKENS = {
    bg: "#0c0a10",
    panel: "#16121c",
    plate: "#12101a",
    border: "#3a2f4a",
    text: "#e8e0d4",
    muted: "#8a7f90",
    gold: "#d4a84b",
    blood: "#c23b3b",
    outline: "rgba(8,6,12,0.85)",
    rarity: {
      common: "#a0a8b0",
      uncommon: "#50c070",
      rare: "#c080e0",
    },
    dmg: {
      physical: "#d4a84b",
      magic: "#a070e0",
      elemental: "#50c0b0",
      bard: "#e070b0",
      other: "#90a0b0",
    },
    element: {
      fire: "#e06030",
      lightning: "#60a0ff",
      ice: "#80c0e8",
      earth: "#70a050",
      physical: "#c0b090",
      magic: "#a080e0",
    },
    slot: {
      helmet: "#9098a0",
      amulet: "#d4a84b",
      ring: "#c080e0",
      chest: "#8090a0",
      boots: "#a08060",
      gloves: "#70a0c0",
    },
  };

  function hexA(hex, a) {
    if (!hex || hex[0] !== "#") return `rgba(200,180,120,${a})`;
    let h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    return `rgba(${r},${g},${b},${a})`;
  }

  function shade(hex, amt) {
    if (!hex || hex[0] !== "#") return hex || "#888";
    let h = hex.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    let r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
    r = Math.max(0, Math.min(255, r + Math.round(255 * amt)));
    g = Math.max(0, Math.min(255, g + Math.round(255 * amt)));
    b = Math.max(0, Math.min(255, b + Math.round(255 * amt)));
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }

  function roundRect(ctx, x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  // ── Icon plates (shape language) ────────────────────────
  /** Ability = circle plate */
  function plateCircle(ctx, w, h, color) {
    const c = color || TOKENS.gold;
    const cx = w / 2, cy = h / 2, r = Math.min(w, h) * 0.42;
    ctx.clearRect(0, 0, w, h);
    // outer glow
    const g0 = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r * 1.15);
    g0.addColorStop(0, hexA(c, 0.2));
    g0.addColorStop(1, "transparent");
    ctx.fillStyle = g0;
    ctx.fillRect(0, 0, w, h);
    // plate
    const g = ctx.createRadialGradient(cx - r * 0.25, cy - r * 0.3, 1, cx, cy, r);
    g.addColorStop(0, shade(TOKENS.plate, 0.12));
    g.addColorStop(1, TOKENS.plate);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = hexA(c, 0.65);
    ctx.lineWidth = Math.max(1.5, w * 0.035);
    ctx.stroke();
    // inner rim
    ctx.strokeStyle = hexA("#ffffff", 0.08);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.82, 0, Math.PI * 2);
    ctx.stroke();
    return { cx, cy, r, s: Math.min(w, h) / 48, color: c };
  }

  /** Item = rounded square */
  function plateSquare(ctx, w, h, color) {
    const c = color || TOKENS.gold;
    const pad = Math.max(2, w * 0.06);
    const rr = Math.max(6, w * 0.16);
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = TOKENS.plate;
    roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, rr);
    ctx.fill();
    const g = ctx.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, hexA(c, 0.22));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    roundRect(ctx, pad, pad, w - pad * 2, h - pad * 2, rr);
    ctx.fill();
    ctx.strokeStyle = hexA(c, 0.6);
    ctx.lineWidth = Math.max(1.5, w * 0.03);
    roundRect(ctx, pad + 0.5, pad + 0.5, w - pad * 2 - 1, h - pad * 2 - 1, rr - 1);
    ctx.stroke();
    return { cx: w / 2, cy: h / 2, s: Math.min(w, h) / 48, color: c };
  }

  /** Mark / Artifact = diamond seal */
  function plateDiamond(ctx, w, h, color) {
    const c = color || TOKENS.dmg.magic;
    const cx = w / 2, cy = h / 2;
    const r = Math.min(w, h) * 0.4;
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = TOKENS.plate;
    roundRect(ctx, -r * 0.72, -r * 0.72, r * 1.44, r * 1.44, r * 0.18);
    ctx.fill();
    ctx.strokeStyle = hexA(c, 0.7);
    ctx.lineWidth = Math.max(1.5, w * 0.035);
    roundRect(ctx, -r * 0.72, -r * 0.72, r * 1.44, r * 1.44, r * 0.18);
    ctx.stroke();
    ctx.restore();
    // soft glow
    const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, r);
    g.addColorStop(0, hexA(c, 0.25));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    return { cx, cy, s: Math.min(w, h) / 48, color: c };
  }

  function softDisc(ctx, x, y, r, color, lite) {
    const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, 1, x, y, r);
    g.addColorStop(0, lite || shade(color, 0.25));
    g.addColorStop(0.7, color);
    g.addColorStop(1, shade(color, -0.25));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = TOKENS.outline;
    ctx.lineWidth = Math.max(1, r * 0.08);
    ctx.stroke();
  }

  function softCapsule(ctx, x, y, w, h, color) {
    const r = h / 2;
    ctx.fillStyle = color;
    roundRect(ctx, x, y, w, h, r);
    ctx.fill();
    ctx.strokeStyle = TOKENS.outline;
    ctx.lineWidth = 1.2;
    roundRect(ctx, x, y, w, h, r);
    ctx.stroke();
    ctx.fillStyle = hexA("#ffffff", 0.15);
    roundRect(ctx, x + 2, y + 1, w * 0.5, h * 0.35, r * 0.5);
    ctx.fill();
  }

  // ── High-level icon painters ────────────────────────────
  function paintOnCanvas(canvas, size, drawFn) {
    if (!canvas) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = size || 48;
    canvas.width = Math.round(s * dpr);
    canvas.height = Math.round(s * dpr);
    canvas.style.width = s + "px";
    canvas.style.height = s + "px";
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    drawFn(ctx, s, s);
  }

  function drawMarkGlyph(ctx, w, h, color, markId) {
    const { cx, cy, s, color: c } = plateDiamond(ctx, w, h, color);
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.lineWidth = 2 * s;
    ctx.lineCap = "round";
    // sword / star / simple seal
    if (markId && /arrow|archer/.test(markId)) {
      ctx.beginPath();
      ctx.moveTo(cx - 8 * s, cy);
      ctx.lineTo(cx + 10 * s, cy);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 10 * s, cy);
      ctx.lineTo(cx + 4 * s, cy - 4 * s);
      ctx.lineTo(cx + 4 * s, cy + 4 * s);
      ctx.fill();
    } else if (markId && /shield/.test(markId)) {
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10 * s);
      ctx.lineTo(cx + 9 * s, cy - 4 * s);
      ctx.lineTo(cx + 7 * s, cy + 8 * s);
      ctx.lineTo(cx, cy + 12 * s);
      ctx.lineTo(cx - 7 * s, cy + 8 * s);
      ctx.lineTo(cx - 9 * s, cy - 4 * s);
      ctx.closePath();
      ctx.fill();
    } else {
      // default: seal star
      ctx.beginPath();
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const r = i % 2 === 0 ? 10 * s : 4 * s;
        const px = cx + Math.cos(a) * r;
        const py = cy + Math.sin(a) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawArtifactGlyph(ctx, w, h, color, artId) {
    const { cx, cy, s, color: c } = plateDiamond(ctx, w, h, color || "#e06080");
    ctx.fillStyle = c;
    ctx.strokeStyle = c;
    ctx.lineWidth = 2 * s;
    // orb + shards
    softDisc(ctx, cx, cy, 7 * s, c, shade(c, 0.3));
    ctx.strokeStyle = hexA("#fff", 0.5);
    ctx.lineWidth = 1.2 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, 11 * s, 0.2, Math.PI * 1.4);
    ctx.stroke();
    for (let i = 0; i < 3; i++) {
      const a = (i / 3) * Math.PI * 2 + 0.4;
      ctx.fillStyle = hexA(c, 0.85);
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * 12 * s, cy + Math.sin(a) * 12 * s);
      ctx.lineTo(cx + Math.cos(a + 0.3) * 16 * s, cy + Math.sin(a + 0.3) * 16 * s);
      ctx.lineTo(cx + Math.cos(a - 0.3) * 16 * s, cy + Math.sin(a - 0.3) * 16 * s);
      ctx.fill();
    }
  }

  // ── Soft world: enemy archetypes ────────────────────────
  function drawSoftEnemy(ctx, kind, color, x, y, facing, scale, flash) {
    const col = flash ? "#ffffff" : (color || "#7a4a90");
    const dark = shade(col, -0.28);
    const lite = shade(col, 0.22);
    const sc = scale || 1;
    const f = facing < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f, 1);

    const k = kind || "imp";
    if (k === "slime") {
      softDisc(ctx, 0, 2 * sc, 11 * sc, col, lite);
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(0, 6 * sc, 10 * sc, 4 * sc, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1010";
      ctx.beginPath();
      ctx.arc(-3 * sc, 0, 1.6 * sc, 0, Math.PI * 2);
      ctx.arc(4 * sc, 0, 1.6 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "hound" || k === "runner" || k === "crawler") {
      softCapsule(ctx, -10 * sc, -2 * sc, 16 * sc, 8 * sc, col);
      softDisc(ctx, 8 * sc, -2 * sc, 5 * sc, col, lite);
      ctx.fillStyle = dark;
      ctx.fillRect(-8 * sc, 4 * sc, 3 * sc, 5 * sc);
      ctx.fillRect(2 * sc, 4 * sc, 3 * sc, 5 * sc);
      ctx.fillStyle = "#ff5050";
      ctx.beginPath();
      ctx.arc(10 * sc, -3 * sc, 1.4 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "skeleton" || k === "shield" || k === "knight") {
      softDisc(ctx, 0, -8 * sc, 6 * sc, lite, "#f0ece0");
      softCapsule(ctx, -5 * sc, -2 * sc, 10 * sc, 12 * sc, lite);
      ctx.fillStyle = dark;
      ctx.fillRect(-6 * sc, 8 * sc, 4 * sc, 6 * sc);
      ctx.fillRect(2 * sc, 8 * sc, 4 * sc, 6 * sc);
      if (k === "shield") {
        ctx.fillStyle = "#9098a8";
        roundRect(ctx, -12 * sc, -2 * sc, 5 * sc, 10 * sc, 2 * sc);
        ctx.fill();
      }
      ctx.fillStyle = "#1a1010";
      ctx.beginPath();
      ctx.arc(-2 * sc, -8 * sc, 1.2 * sc, 0, Math.PI * 2);
      ctx.arc(2.5 * sc, -8 * sc, 1.2 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "mage" || k === "lich" || k === "void") {
      softCapsule(ctx, -6 * sc, -2 * sc, 12 * sc, 14 * sc, col);
      softDisc(ctx, 0, -10 * sc, 6 * sc, col, lite);
      softCapsule(ctx, 6 * sc, -14 * sc, 3 * sc, 16 * sc, dark);
      softDisc(ctx, 8 * sc, -16 * sc, 3 * sc, TOKENS.dmg.magic, "#e0c0ff");
      ctx.fillStyle = "#ff80ff";
      ctx.beginPath();
      ctx.arc(-2 * sc, -10 * sc, 1.3 * sc, 0, Math.PI * 2);
      ctx.arc(2.5 * sc, -10 * sc, 1.3 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "wraith" || k === "ghost" || k === "ghoul") {
      ctx.globalAlpha = 0.92;
      softDisc(ctx, 0, -6 * sc, 7 * sc, col, lite);
      softCapsule(ctx, -6 * sc, -2 * sc, 12 * sc, 14 * sc, col);
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-2.5 * sc, -7 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.arc(3 * sc, -7 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "bear" || k === "brute" || k === "giant") {
      softCapsule(ctx, -10 * sc, -4 * sc, 20 * sc, 14 * sc, col);
      softDisc(ctx, 0, -10 * sc, 8 * sc, col, lite);
      ctx.fillStyle = dark;
      ctx.fillRect(-9 * sc, 8 * sc, 6 * sc, 6 * sc);
      ctx.fillRect(3 * sc, 8 * sc, 6 * sc, 6 * sc);
      ctx.fillStyle = "#1a1010";
      ctx.beginPath();
      ctx.arc(-3 * sc, -10 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.arc(3 * sc, -10 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "wyrm" || k === "hydra") {
      softCapsule(ctx, -12 * sc, -2 * sc, 22 * sc, 9 * sc, col);
      softDisc(ctx, 10 * sc, -2 * sc, 6 * sc, col, lite);
      ctx.fillStyle = "#ff4040";
      ctx.beginPath();
      ctx.arc(13 * sc, -3 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // imp / default
      softCapsule(ctx, -5 * sc, -1 * sc, 10 * sc, 11 * sc, col);
      softDisc(ctx, 0, -9 * sc, 6.5 * sc, col, lite);
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(-5 * sc, -12 * sc);
      ctx.lineTo(-8 * sc, -18 * sc);
      ctx.lineTo(-2 * sc, -13 * sc);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(5 * sc, -12 * sc);
      ctx.lineTo(8 * sc, -18 * sc);
      ctx.lineTo(2 * sc, -13 * sc);
      ctx.fill();
      ctx.fillStyle = "#ff4040";
      ctx.beginPath();
      ctx.arc(-2.2 * sc, -9 * sc, 1.4 * sc, 0, Math.PI * 2);
      ctx.arc(2.8 * sc, -9 * sc, 1.4 * sc, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  // ── Soft pickups ────────────────────────────────────────
  function drawSoftPickup(ctx, kind, x, y, scale) {
    const sc = scale || 1;
    ctx.save();
    ctx.translate(x, y);
    if (kind === "gold") {
      softDisc(ctx, 0, 0, 7 * sc, TOKENS.gold, "#f0d080");
      ctx.fillStyle = hexA("#fff", 0.35);
      ctx.beginPath();
      ctx.arc(-2 * sc, -2 * sc, 2 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (kind === "xp") {
      // soft diamond
      ctx.fillStyle = "#7ec850";
      ctx.beginPath();
      ctx.moveTo(0, -8 * sc);
      ctx.lineTo(7 * sc, 0);
      ctx.lineTo(0, 8 * sc);
      ctx.lineTo(-7 * sc, 0);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = TOKENS.outline;
      ctx.lineWidth = 1.2;
      ctx.stroke();
      ctx.fillStyle = hexA("#c0ff90", 0.5);
      ctx.beginPath();
      ctx.moveTo(0, -4 * sc);
      ctx.lineTo(3 * sc, 0);
      ctx.lineTo(0, 2 * sc);
      ctx.lineTo(-2 * sc, 0);
      ctx.fill();
    } else if (kind === "tome") {
      ctx.fillStyle = "#1a2848";
      roundRect(ctx, -8 * sc, -10 * sc, 16 * sc, 20 * sc, 3 * sc);
      ctx.fill();
      ctx.strokeStyle = "#8ab4ff";
      ctx.lineWidth = 1.5;
      roundRect(ctx, -8 * sc, -10 * sc, 16 * sc, 20 * sc, 3 * sc);
      ctx.stroke();
      ctx.fillStyle = TOKENS.gold;
      ctx.font = `bold ${Math.round(10 * sc)}px Segoe UI`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("S", 0, 1 * sc);
    } else if (kind === "chest") {
      ctx.fillStyle = "#6a4020";
      roundRect(ctx, -12 * sc, -8 * sc, 24 * sc, 16 * sc, 3 * sc);
      ctx.fill();
      ctx.fillStyle = "#8a6030";
      roundRect(ctx, -12 * sc, -10 * sc, 24 * sc, 6 * sc, 2 * sc);
      ctx.fill();
      ctx.fillStyle = TOKENS.gold;
      ctx.fillRect(-2 * sc, -4 * sc, 4 * sc, 8 * sc);
    } else {
      softDisc(ctx, 0, 0, 6 * sc, "#e04040", "#ff8080");
    }
    ctx.restore();
    return true;
  }

  // ── Soft hero polish helpers (used by drawers) ──────────
  function softBodyEllipse(ctx, x, y, rx, ry, color) {
    const g = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.4, 1, x, y, Math.max(rx, ry));
    g.addColorStop(0, shade(color, 0.2));
    g.addColorStop(1, shade(color, -0.15));
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function fxColor(element) {
    return TOKENS.element[element] || TOKENS.dmg.physical;
  }

  /** Soft weapon slash trail */
  function softSlash(ctx, x, y, aim, r, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha != null ? alpha : 0.45;
    ctx.strokeStyle = color || TOKENS.gold;
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y, r, aim - 0.9, aim + 0.9);
    ctx.stroke();
    ctx.globalAlpha = (alpha != null ? alpha : 0.45) * 0.45;
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.88, aim - 0.55, aim + 0.55);
    ctx.stroke();
    ctx.restore();
  }

  // Public paint wrappers (canvas elements)
  function paintMarkIcon(canvas, markId, color, size) {
    paintOnCanvas(canvas, size, (ctx, w, h) => drawMarkGlyph(ctx, w, h, color, markId));
  }
  function paintArtifactIcon(canvas, artId, color, size) {
    paintOnCanvas(canvas, size, (ctx, w, h) => drawArtifactGlyph(ctx, w, h, color, artId));
  }

  return {
    USE_PIXEL_SPRITES,
    TOKENS,
    hexA,
    shade,
    roundRect,
    plateCircle,
    plateSquare,
    plateDiamond,
    softDisc,
    softCapsule,
    softBodyEllipse,
    drawSoftEnemy,
    drawSoftPickup,
    paintMarkIcon,
    paintArtifactIcon,
    paintOnCanvas,
    fxColor,
    drawMarkGlyph,
    drawArtifactGlyph,
    softSlash,
  };
})();
