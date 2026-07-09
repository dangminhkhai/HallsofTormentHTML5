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
      if (k === "hydra") {
        softDisc(ctx, -2 * sc, -10 * sc, 4 * sc, col, lite);
        softDisc(ctx, 4 * sc, -12 * sc, 3.5 * sc, col, lite);
      }
    } else if (k === "construct" || k === "golem") {
      softCapsule(ctx, -8 * sc, -4 * sc, 16 * sc, 16 * sc, col);
      softDisc(ctx, 0, -12 * sc, 7 * sc, dark, col);
      ctx.fillStyle = hexA(TOKENS.dmg.magic, 0.55);
      ctx.fillRect(-3 * sc, -4 * sc, 6 * sc, 8 * sc);
      ctx.fillStyle = dark;
      ctx.fillRect(-8 * sc, 10 * sc, 5 * sc, 5 * sc);
      ctx.fillRect(3 * sc, 10 * sc, 5 * sc, 5 * sc);
    } else if (k === "tree") {
      softCapsule(ctx, -4 * sc, -6 * sc, 8 * sc, 20 * sc, dark);
      softDisc(ctx, 0, -14 * sc, 12 * sc, col, lite);
      softDisc(ctx, -6 * sc, -10 * sc, 7 * sc, col, lite);
      softDisc(ctx, 6 * sc, -10 * sc, 7 * sc, col, lite);
    } else if (k === "horseman") {
      softCapsule(ctx, -12 * sc, 0, 20 * sc, 9 * sc, dark);
      softDisc(ctx, 10 * sc, -1 * sc, 5 * sc, col, lite);
      softCapsule(ctx, -4 * sc, -12 * sc, 8 * sc, 12 * sc, col);
      softDisc(ctx, 0, -16 * sc, 5 * sc, col, lite);
    } else if (k === "fiend") {
      softCapsule(ctx, -6 * sc, -1 * sc, 12 * sc, 12 * sc, col);
      softDisc(ctx, 0, -10 * sc, 7 * sc, col, lite);
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(-6 * sc, -12 * sc);
      ctx.lineTo(-10 * sc, -20 * sc);
      ctx.lineTo(-2 * sc, -14 * sc);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(6 * sc, -12 * sc);
      ctx.lineTo(10 * sc, -20 * sc);
      ctx.lineTo(2 * sc, -14 * sc);
      ctx.fill();
      ctx.fillStyle = "#ff8040";
      ctx.beginPath();
      ctx.arc(-2 * sc, -10 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.arc(3 * sc, -10 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.fill();
    } else if (k === "mimic") {
      // chest-like body with bite
      softCapsule(ctx, -12 * sc, -4 * sc, 24 * sc, 16 * sc, col);
      ctx.fillStyle = shade(col, 0.2);
      roundRect(ctx, -12 * sc, -12 * sc, 24 * sc, 10 * sc, 3 * sc);
      ctx.fill();
      ctx.fillStyle = TOKENS.gold;
      softDisc(ctx, 0, -1 * sc, 3 * sc, TOKENS.gold, "#fff0a0");
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(-8 * sc, 2 * sc, 3 * sc, 4 * sc);
      ctx.fillRect(5 * sc, 2 * sc, 3 * sc, 4 * sc);
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

  /**
   * Soft weapon slash trail.
   * aim = mid angle; optional a0/a1 override span. Or pass span via 8th arg.
   */
  function softSlash(ctx, x, y, aim, r, color, alpha, a0, a1) {
    const a = alpha != null ? alpha : 0.45;
    const c = color || TOKENS.gold;
    let start = a0 != null ? a0 : aim - 0.95;
    let end = a1 != null ? a1 : aim + 0.95;
    if (end < start) {
      const t = start;
      start = end;
      end = t;
    }
    ctx.save();
    ctx.lineCap = "round";
    // wide soft glow
    ctx.globalAlpha = a * 0.35;
    ctx.strokeStyle = c;
    ctx.lineWidth = 10;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.92, start, end);
    ctx.stroke();
    // main blade arc
    ctx.globalAlpha = a * 0.9;
    ctx.lineWidth = 3.2;
    ctx.strokeStyle = c;
    ctx.beginPath();
    ctx.arc(x, y, r, start, end);
    ctx.stroke();
    // bright core edge
    ctx.globalAlpha = a * 0.55;
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, r * 0.96, start + 0.12, end - 0.12);
    ctx.stroke();
    // tip spark
    const mid = (start + end) / 2;
    ctx.globalAlpha = a * 0.7;
    softDisc(ctx, x + Math.cos(mid) * r, y + Math.sin(mid) * r, 2.8, c, "#fff");
    ctx.restore();
  }

  /** Soft projectile: arrow | orb | bolt | shard */
  function drawSoftProjectile(ctx, x, y, ang, r, color, style) {
    const c = color || TOKENS.gold;
    const rr = r || 5;
    ctx.save();
    if (style === "orb") {
      ctx.globalAlpha = 0.28;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, rr * 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      softDisc(ctx, x, y, rr + 1.5, c, shade(c, 0.4));
      ctx.fillStyle = hexA("#fff", 0.55);
      ctx.beginPath();
      ctx.arc(x - rr * 0.25, y - rr * 0.3, rr * 0.4, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === "bolt" || style === "shard") {
      ctx.translate(x, y);
      ctx.rotate(ang || 0);
      ctx.globalAlpha = 0.25;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.ellipse(0, 0, rr * 2.4, rr * 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(-rr * 2, 0, rr * 2.2, 0);
      g.addColorStop(0, hexA(c, 0.2));
      g.addColorStop(0.4, c);
      g.addColorStop(1, "#ffffff");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(rr * 2.4, 0);
      ctx.lineTo(-rr * 1.2, -rr * 0.7);
      ctx.lineTo(-rr * 0.6, 0);
      ctx.lineTo(-rr * 1.2, rr * 0.7);
      ctx.closePath();
      ctx.fill();
    } else {
      // arrow default
      ctx.translate(x, y);
      ctx.rotate(ang || 0);
      ctx.globalAlpha = 0.22;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(0, 0, rr * 2.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      const g = ctx.createLinearGradient(-10, 0, 12, 0);
      g.addColorStop(0, shade(c, -0.2));
      g.addColorStop(0.55, c);
      g.addColorStop(1, "#f0f0f0");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, 9, Math.max(2.4, rr * 0.65), 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hexA("#fff", 0.45);
      ctx.beginPath();
      ctx.ellipse(-2, -1, 4, 1.1, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#e8e8e8";
      ctx.beginPath();
      ctx.moveTo(6, 0);
      ctx.lineTo(12, -3);
      ctx.lineTo(12, 3);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  /** Soft miniboss crown + aura */
  function drawSoftMinibossAura(ctx, x, y, r, t) {
    const rr = (r || 16) + 10;
    const pulse = 0.32 + Math.sin((t || 0) * 4) * 0.1;
    ctx.save();
    // outer aura
    const g = ctx.createRadialGradient(x, y, rr * 0.4, x, y, rr + 8);
    g.addColorStop(0, hexA("#c080e0", pulse * 0.35));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = pulse + 0.15;
    ctx.strokeStyle = "#c080e0";
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y, rr, 0, Math.PI * 2);
    ctx.stroke();
    // crown
    const cy = y - (r || 16) - 10;
    ctx.globalAlpha = 1;
    const cg = ctx.createLinearGradient(x - 8, cy - 8, x + 8, cy + 4);
    cg.addColorStop(0, "#e0b0ff");
    cg.addColorStop(1, "#a050d0");
    ctx.fillStyle = cg;
    ctx.beginPath();
    ctx.moveTo(x - 7, cy);
    ctx.lineTo(x - 4, cy - 9);
    ctx.lineTo(x - 1, cy - 2);
    ctx.lineTo(x + 1, cy - 2);
    ctx.lineTo(x + 4, cy - 9);
    ctx.lineTo(x + 7, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#fff0a0";
    ctx.beginPath();
    ctx.arc(x, cy - 1, 1.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Soft floating combat text */
  function drawSoftFloatingText(ctx, text, x, y, color, alpha, scale) {
    const a = alpha != null ? alpha : 1;
    const sc = scale != null ? scale : 1;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.translate(x, y);
    ctx.scale(sc, sc);
    const fontPx = Math.round(13 * Math.min(1.6, Math.max(0.85, sc)));
    ctx.font = `bold ${fontPx}px Segoe UI`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const t = String(text || "");
    // chỉ text + shadow mảnh — không viền / plate nền
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText(t, 1, 1);
    ctx.fillStyle = color || "#fff";
    ctx.fillText(t, 0, 0);
    ctx.restore();
  }

  /** Soft status ring with orbiting dots */
  function softStatusRing(ctx, x, y, r, color, phase, t) {
    const pulse = 0.32 + Math.sin((t || 0) * 6 + (phase || 0)) * 0.12;
    ctx.save();
    ctx.globalAlpha = pulse;
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
    // soft fill wash
    ctx.globalAlpha = pulse * 0.12;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 4; i++) {
      const a = (t || 0) * 3 + (phase || 0) + (i * Math.PI * 2) / 4;
      ctx.globalAlpha = 0.55;
      const px = x + Math.cos(a) * r;
      const py = y + Math.sin(a) * r;
      const g = ctx.createRadialGradient(px, py, 0.3, px, py, 2.8);
      g.addColorStop(0, "#fff");
      g.addColorStop(0.4, color);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(px, py, 2.8, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Soft AOE burst / ring */
  function drawSoftAoe(ctx, x, y, r, color, alpha, style) {
    const c = color || TOKENS.gold;
    const a = alpha != null ? alpha : 0.4;
    ctx.save();
    if (style === "ring") {
      ctx.globalAlpha = a * 0.25;
      ctx.strokeStyle = c;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = a * 0.12;
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // burst
      const g = ctx.createRadialGradient(x, y, 2, x, y, r);
      g.addColorStop(0, hexA(c, Math.min(0.55, a)));
      g.addColorStop(0.55, hexA(c, a * 0.25));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = a * 0.7;
      ctx.strokeStyle = c;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(x, y, r * 0.92, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Soft summon (golem / spirit / minion) */
  function drawSoftSummon(ctx, kind, color, x, y, facing, scale) {
    const col = color || "#a08060";
    const sc = scale || 1;
    const f = facing < 0 ? -1 : 1;
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(f, 1);
    if (kind === "golem" || kind === "item_skel" || kind === "item_skel_mage") {
      softCapsule(ctx, -7 * sc, -4 * sc, 14 * sc, 16 * sc, col);
      softDisc(ctx, 0, -12 * sc, 7 * sc, col, shade(col, 0.2));
      softCapsule(ctx, -10 * sc, 0, 5 * sc, 10 * sc, shade(col, -0.15));
      softCapsule(ctx, 5 * sc, 0, 5 * sc, 10 * sc, shade(col, -0.15));
      ctx.fillStyle = shade(col, -0.3);
      ctx.fillRect(-6 * sc, 10 * sc, 4 * sc, 6 * sc);
      ctx.fillRect(2 * sc, 10 * sc, 4 * sc, 6 * sc);
    } else if (kind === "spirit" || String(kind || "").includes("spirit")) {
      ctx.globalAlpha = 0.9;
      softDisc(ctx, 0, -6 * sc, 8 * sc, col, shade(col, 0.3));
      softCapsule(ctx, -5 * sc, -2 * sc, 10 * sc, 12 * sc, col);
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(-2 * sc, -7 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.arc(3 * sc, -7 * sc, 1.5 * sc, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    } else if (kind === "item_hound" || kind === "hound") {
      softCapsule(ctx, -9 * sc, -2 * sc, 14 * sc, 7 * sc, col);
      softDisc(ctx, 7 * sc, -2 * sc, 4.5 * sc, col, shade(col, 0.2));
    } else {
      // generic minion / imp / rat
      softCapsule(ctx, -5 * sc, -1 * sc, 10 * sc, 10 * sc, col);
      softDisc(ctx, 0, -8 * sc, 5.5 * sc, col, shade(col, 0.2));
    }
    // ally ring
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = TOKENS.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 12 * sc, 10 * sc, 3.5 * sc, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.restore();
    return true;
  }

  /** Soft chest (rarity tint) */
  function drawSoftChest(ctx, x, y, rarity) {
    const r = rarity || 1;
    const wood = r >= 3 ? "#a87820" : r >= 2 ? "#6a4080" : "#6a4020";
    const lid = r >= 3 ? "#f0d060" : r >= 2 ? "#b080e0" : "#c09050";
    const lock = r >= 3 ? "#fff0a0" : r >= 2 ? "#e0c0ff" : TOKENS.gold;
    ctx.save();
    ctx.translate(x, y);
    // body
    const g = ctx.createLinearGradient(-14, -8, 14, 12);
    g.addColorStop(0, shade(wood, 0.15));
    g.addColorStop(1, shade(wood, -0.15));
    ctx.fillStyle = g;
    roundRect(ctx, -14, -6, 28, 18, 3);
    ctx.fill();
    ctx.strokeStyle = TOKENS.outline;
    ctx.lineWidth = 1.2;
    roundRect(ctx, -14, -6, 28, 18, 3);
    ctx.stroke();
    // lid
    ctx.fillStyle = lid;
    roundRect(ctx, -14, -12, 28, 9, 3);
    ctx.fill();
    // lock
    softDisc(ctx, 0, -1, 3.5, lock, shade(lock, 0.3));
    if (r >= 2) {
      ctx.globalAlpha = 0.25;
      ctx.strokeStyle = lock;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    return true;
  }

  /** Soft barrel */
  function drawSoftBarrel(ctx, x, y) {
    ctx.save();
    ctx.translate(x, y);
    const g = ctx.createLinearGradient(-12, -14, 12, 14);
    g.addColorStop(0, "#9a7040");
    g.addColorStop(0.5, "#6a4020");
    g.addColorStop(1, "#4a2810");
    ctx.fillStyle = g;
    roundRect(ctx, -12, -14, 24, 28, 6);
    ctx.fill();
    ctx.strokeStyle = "#3a2010";
    ctx.lineWidth = 1.5;
    roundRect(ctx, -12, -14, 24, 28, 6);
    ctx.stroke();
    // bands
    ctx.fillStyle = "#c09050";
    ctx.fillRect(-12, -10, 24, 3);
    ctx.fillRect(-12, 6, 24, 3);
    ctx.fillStyle = shade("#c09050", 0.2);
    ctx.fillRect(-2, -4, 4, 10);
    ctx.restore();
    return true;
  }

  /** Soft well */
  function drawSoftWell(ctx, x, y, r, bob) {
    const rr = r || 20;
    ctx.save();
    // base stone
    ctx.fillStyle = "#2a3040";
    ctx.beginPath();
    ctx.ellipse(x, y + 6, rr + 5, rr * 0.4, 0, 0, Math.PI * 2);
    ctx.fill();
    softDisc(ctx, x, y, rr, "#3a4858", "#5a6878");
    // water
    const g = ctx.createRadialGradient(x - 4, y - 4, 2, x, y, rr - 5);
    g.addColorStop(0, "#90e0f8");
    g.addColorStop(0.5, "#40a0d0");
    g.addColorStop(1, "#184868");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, rr - 6, 0, Math.PI * 2);
    ctx.fill();
    // shimmer
    ctx.globalAlpha = 0.35 + Math.sin((bob || 0) * 2) * 0.1;
    ctx.strokeStyle = "#c0f0ff";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x, y, rr + 4, 0.2, Math.PI * 1.3);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.font = "bold 11px Segoe UI";
    ctx.fillStyle = "#a0e0ff";
    ctx.textAlign = "center";
    ctx.fillText("GIẾNG", x, y - rr - 8);
    ctx.restore();
    return true;
  }

  /** Soft orbit orb (ability) — glow + core + optional blade */
  function drawSoftOrb(ctx, x, y, r, color, shape) {
    const c = color || TOKENS.dmg.magic;
    const rr = r || 7;
    ctx.save();
    // outer aura
    const g0 = ctx.createRadialGradient(x, y, 1, x, y, rr * 2.4);
    g0.addColorStop(0, hexA(c, 0.45));
    g0.addColorStop(0.55, hexA(c, 0.12));
    g0.addColorStop(1, "transparent");
    ctx.fillStyle = g0;
    ctx.beginPath();
    ctx.arc(x, y, rr * 2.4, 0, Math.PI * 2);
    ctx.fill();
    if (shape === "blade") {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(0.45);
      const g = ctx.createLinearGradient(-rr * 1.8, 0, rr * 1.8, 0);
      g.addColorStop(0, hexA(c, 0.3));
      g.addColorStop(0.5, c);
      g.addColorStop(1, "#ffffff");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(0, 0, rr * 1.7, rr * 0.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = hexA("#fff", 0.5);
      ctx.beginPath();
      ctx.ellipse(-rr * 0.2, -rr * 0.1, rr * 0.7, rr * 0.18, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    } else {
      softDisc(ctx, x, y, rr + 1.5, c, shade(c, 0.4));
      ctx.fillStyle = hexA("#fff", 0.5);
      ctx.beginPath();
      ctx.arc(x - rr * 0.3, y - rr * 0.35, rr * 0.35, 0, Math.PI * 2);
      ctx.fill();
      // soft rim
      ctx.strokeStyle = hexA("#fff", 0.2);
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(x, y, rr + 1, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
    return true;
  }

  /** Soft map pillar / prop by hall style */
  function drawSoftPillar(ctx, x, y, style, prop, lite) {
    const p = prop || "#1a1524";
    const l = lite || "#3a3050";
    ctx.save();
    ctx.translate(x, y);
    if (style === "frozen") {
      const g = ctx.createLinearGradient(-10, -40, 10, 16);
      g.addColorStop(0, "rgba(200,240,255,0.55)");
      g.addColorStop(1, "rgba(80,140,180,0.35)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(-10, 14);
      ctx.lineTo(-5, -38);
      ctx.lineTo(5, -38);
      ctx.lineTo(10, 14);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "rgba(180,220,255,0.4)";
      ctx.lineWidth = 1.2;
      ctx.stroke();
      // ice shard tip
      ctx.fillStyle = "rgba(220,245,255,0.5)";
      ctx.beginPath();
      ctx.moveTo(0, -42);
      ctx.lineTo(-4, -34);
      ctx.lineTo(4, -34);
      ctx.fill();
    } else if (style === "ember") {
      softCapsule(ctx, -10, -36, 20, 48, p);
      const lg = ctx.createLinearGradient(0, 0, 0, 16);
      lg.addColorStop(0, hexA("#ff9040", 0.55));
      lg.addColorStop(1, hexA("#ff3010", 0.15));
      ctx.fillStyle = lg;
      ctx.fillRect(-3, 0, 6, 14);
      ctx.globalAlpha = 0.35;
      softDisc(ctx, 0, 10, 8, "#ff6020", "#ffc080");
      ctx.globalAlpha = 1;
    } else if (style === "vault") {
      softCapsule(ctx, -10, -40, 20, 52, p);
      ctx.fillStyle = hexA(TOKENS.gold, 0.3);
      ctx.fillRect(-4, -28, 8, 28);
      ctx.fillStyle = l;
      roundRect(ctx, -14, -46, 28, 8, 2);
      ctx.fill();
      // gold crest
      softDisc(ctx, 0, -20, 4, TOKENS.gold, "#fff0a0");
    } else if (style === "bog") {
      ctx.strokeStyle = p;
      ctx.lineWidth = 5;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 14);
      ctx.quadraticCurveTo(8, -8, -2, -40);
      ctx.stroke();
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-2, -16);
      ctx.lineTo(-12, -28);
      ctx.moveTo(0, -22);
      ctx.lineTo(12, -30);
      ctx.stroke();
      // leaf soft
      ctx.globalAlpha = 0.45;
      softDisc(ctx, -10, -30, 5, "#406040", "#70a060");
      softDisc(ctx, 10, -32, 4.5, "#406040", "#70a060");
      ctx.globalAlpha = 1;
    } else if (style === "void" || style === "ritual") {
      softCapsule(ctx, -9, -38, 18, 50, p);
      ctx.globalAlpha = 0.4;
      softDisc(ctx, 0, -20, 10, TOKENS.dmg.magic, "#e0a0ff");
      ctx.globalAlpha = 1;
      ctx.strokeStyle = hexA("#c080e0", 0.5);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -8, 12, 0.2, Math.PI * 1.6);
      ctx.stroke();
    } else {
      softCapsule(ctx, -10, -36, 20, 48, p);
      ctx.fillStyle = l;
      ctx.fillRect(-4, -22, 8, 24);
      // top cap
      roundRect(ctx, -12, -40, 24, 7, 2);
      ctx.fill();
    }
    ctx.restore();
    return true;
  }

  /** Soft floor accent puddle (sparse hall décor) */
  function drawSoftFloorAccent(ctx, x, y, style, color) {
    ctx.save();
    if (style === "ember") {
      const g = ctx.createRadialGradient(x, y, 2, x, y, 28);
      g.addColorStop(0, hexA("#ff6020", 0.35));
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(x, y, 26, 12, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === "frozen") {
      ctx.fillStyle = hexA("#80c0e0", 0.22);
      ctx.beginPath();
      ctx.ellipse(x, y, 24, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = hexA("#c0e8ff", 0.3);
      ctx.lineWidth = 1;
      ctx.stroke();
    } else if (style === "bog") {
      ctx.fillStyle = hexA("#406048", 0.35);
      ctx.beginPath();
      ctx.ellipse(x, y, 28, 14, 0, 0, Math.PI * 2);
      ctx.fill();
    } else if (style === "void" || style === "ritual") {
      ctx.strokeStyle = hexA(color || TOKENS.dmg.magic, 0.28);
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.stroke();
      softDisc(ctx, x, y, 4, color || TOKENS.dmg.magic, "#e0c0ff");
    } else {
      ctx.fillStyle = hexA(color || "#604080", 0.12);
      ctx.beginPath();
      ctx.ellipse(x, y, 20, 9, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Soft particle (spark / smoke) */
  function drawSoftParticle(ctx, x, y, size, color, alpha) {
    ctx.save();
    ctx.globalAlpha = alpha != null ? alpha : 1;
    const g = ctx.createRadialGradient(x, y, 0.5, x, y, size);
    g.addColorStop(0, hexA("#ffffff", 0.85));
    g.addColorStop(0.35, hexA(color || TOKENS.gold, 0.8));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /** Soft floating HP bar */
  function drawSoftHpBar(ctx, x, y, w, h, pct, color) {
    const p = Math.max(0, Math.min(1, pct));
    const c = color || TOKENS.blood;
    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    roundRect(ctx, x - w / 2 - 1, y - 1, w + 2, h + 2, 3);
    ctx.fill();
    ctx.fillStyle = "#1a1218";
    roundRect(ctx, x - w / 2, y, w, h, 2);
    ctx.fill();
    if (p > 0.01) {
      const g = ctx.createLinearGradient(x - w / 2, y, x + w / 2, y);
      g.addColorStop(0, shade(c, -0.2));
      g.addColorStop(0.5, c);
      g.addColorStop(1, shade(c, 0.15));
      ctx.fillStyle = g;
      roundRect(ctx, x - w / 2, y, Math.max(2, w * p), h, 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Soft cast flash for abilities */
  function softCastBurst(ctx, x, y, color, t, alpha) {
    const c = color || TOKENS.dmg.magic;
    const a = alpha != null ? alpha : 0.6;
    ctx.save();
    const g = ctx.createRadialGradient(x, y, 2, x, y, 18 + t * 40);
    g.addColorStop(0, hexA("#fff", a * 0.7));
    g.addColorStop(0.3, hexA(c, a * 0.45));
    g.addColorStop(1, "transparent");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, 18 + t * 40, 0, Math.PI * 2);
    ctx.fill();
    for (let i = 0; i < 6; i++) {
      const ang = (i / 6) * Math.PI * 2 + t * 2;
      ctx.strokeStyle = c;
      ctx.globalAlpha = a * 0.8;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + Math.cos(ang) * (16 + t * 36), y + Math.sin(ang) * (16 + t * 36));
      ctx.stroke();
    }
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
    drawSoftAoe,
    drawSoftSummon,
    drawSoftChest,
    drawSoftBarrel,
    drawSoftWell,
    drawSoftOrb,
    softCastBurst,
    drawSoftPillar,
    drawSoftParticle,
    drawSoftHpBar,
    drawSoftProjectile,
    drawSoftMinibossAura,
    drawSoftFloatingText,
    softStatusRing,
    drawSoftFloorAccent,
    paintMarkIcon,
    paintArtifactIcon,
    paintOnCanvas,
    fxColor,
    drawMarkGlyph,
    drawArtifactGlyph,
    softSlash,
  };
})();
