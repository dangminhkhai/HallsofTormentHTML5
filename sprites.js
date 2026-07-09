/**
 * Halls of Torment — Sprite / Pixel-art layer
 * Bakes 16×-style pixel sprites to canvas atlases at load (no external PNG needed).
 * API: window.HOT_SPRITES
 */
window.HOT_SPRITES = (() => {
  const PX = 2; // logical pixel size when baking (chunky)
  const cache = Object.create(null);

  function makeCanvas(w, h) {
    const c = document.createElement("canvas");
    c.width = w;
    c.height = h;
    return c;
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

  /** Pixel buffer painter */
  function Painter(w, h) {
    this.w = w;
    this.h = h;
    this.c = makeCanvas(w, h);
    this.ctx = this.c.getContext("2d");
    this.ctx.imageSmoothingEnabled = false;
    this.buf = this.ctx.createImageData(w, h);
  }
  Painter.prototype.pset = function (x, y, col) {
    x = x | 0; y = y | 0;
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || !col) return;
    const i = (y * this.w + x) * 4;
    let h = col.slice(1);
    if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
    const n = parseInt(h, 16);
    this.buf.data[i] = (n >> 16) & 255;
    this.buf.data[i + 1] = (n >> 8) & 255;
    this.buf.data[i + 2] = n & 255;
    this.buf.data[i + 3] = 255;
  };
  Painter.prototype.rect = function (x, y, w, h, col) {
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) this.pset(x + i, y + j, col);
  };
  Painter.prototype.outlineRect = function (x, y, w, h, col) {
    for (let i = 0; i < w; i++) { this.pset(x + i, y, col); this.pset(x + i, y + h - 1, col); }
    for (let j = 0; j < h; j++) { this.pset(x, y + j, col); this.pset(x + w - 1, y + j, col); }
  };
  Painter.prototype.disk = function (cx, cy, r, col) {
    const r2 = r * r;
    for (let y = -r; y <= r; y++)
      for (let x = -r; x <= r; x++)
        if (x * x + y * y <= r2) this.pset(cx + x, cy + y, col);
  };
  Painter.prototype.commit = function () {
    this.ctx.putImageData(this.buf, 0, 0);
    return this.c;
  };
  /** Scale up with nearest neighbor */
  Painter.prototype.bakeScaled = function (scale) {
    const s = scale || PX;
    const out = makeCanvas(this.w * s, this.h * s);
    const octx = out.getContext("2d");
    octx.imageSmoothingEnabled = false;
    this.commit();
    octx.drawImage(this.c, 0, 0, out.width, out.height);
    return out;
  };

  // ── Palettes ────────────────────────────────────────────
  const HERO_PAL = {
    swordsman: { skin: "#e8c8a0", armor: "#8a9098", accent: "#c04040", dark: "#3a3048", weapon: "#d0d8e0", hair: "#3a2830", boot: "#2a2030" },
    archer: { skin: "#e8c8a0", armor: "#4a7a40", accent: "#8fd46a", dark: "#2a5030", weapon: "#8b5a2b", hair: "#5a3820", boot: "#2a2818" },
    exterminator: { skin: "#d0a888", armor: "#6a4030", accent: "#ff8040", dark: "#3a2018", weapon: "#505860", hair: "#2a1810", boot: "#1a1010" },
    cleric: { skin: "#f0d8b8", armor: "#e8e0d0", accent: "#d4a84b", dark: "#8a8070", weapon: "#f0e0a0", hair: "#e8e0d0", boot: "#6a6050" },
    warlock: { skin: "#c0a090", armor: "#4a2060", accent: "#a060d0", dark: "#2a1038", weapon: "#8060a0", hair: "#1a0a20", boot: "#1a0a18" },
    sorceress: { skin: "#e8c8a0", armor: "#2a3a70", accent: "#7aa8ff", dark: "#1a2a55", weapon: "#6a4a28", hair: "#e0d0ff", boot: "#1a2038" },
    shield_maiden: { skin: "#e0c8a8", armor: "#a8b0c0", accent: "#d4a84b", dark: "#505868", weapon: "#707880", hair: "#c8a070", boot: "#3a3840" },
    beast_huntress: { skin: "#d8b090", armor: "#6a5030", accent: "#d0a060", dark: "#3a3018", weapon: "#8b6a40", hair: "#3a2810", boot: "#2a2010" },
    norseman: { skin: "#e0c8a0", armor: "#4a6080", accent: "#80c0e0", dark: "#2a3848", weapon: "#90a0b0", hair: "#d8d8e0", boot: "#1a2838" },
    landsknecht: { skin: "#e0c0a0", armor: "#8a6030", accent: "#d4a84b", dark: "#4a3018", weapon: "#3a3028", hair: "#4a2818", boot: "#2a1810" },
    sage: { skin: "#e8d0b8", armor: "#5a4080", accent: "#c0a0ff", dark: "#302048", weapon: "#9070c0", hair: "#a090b0", boot: "#201830" },
    bard: { skin: "#f0d0b8", armor: "#804060", accent: "#e0a0c0", dark: "#402030", weapon: "#c09050", hair: "#803040", boot: "#301820" },
    crone: { skin: "#c0b090", armor: "#3a5030", accent: "#60a050", dark: "#1a3018", weapon: "#506040", hair: "#708060", boot: "#102018" },
    alchemist: { skin: "#e0d0b0", armor: "#306058", accent: "#50c0b0", dark: "#183830", weapon: "#80c0b0", hair: "#406858", boot: "#102820" },
  };

  function paintHero(id, frame) {
    const p = HERO_PAL[id] || HERO_PAL.swordsman;
    const P = new Painter(24, 28);
    // Frame 0/1: subtle step (same height — no hop). Frame 2: attack arms only.
    const walk = frame === 1 ? 1 : 0;
    const armSwing = frame === 2 ? 2 : walk ? 1 : 0;

    // legs — same length both frames (chỉ dịch ngang nhẹ)
    P.rect(8 - walk, 18, 3, 7, p.dark);
    P.rect(13 + walk, 18, 3, 7, p.dark);
    P.rect(7 - walk, 24, 4, 2, p.boot);
    P.rect(13 + walk, 24, 4, 2, p.boot);

    // cape / robe back
    const robe = ["sorceress", "warlock", "cleric", "sage", "crone", "alchemist"].includes(id);
    if (robe) {
      P.rect(6, 10, 12, 10, p.dark);
      P.rect(5, 12, 14, 9, p.armor);
    } else {
      P.rect(5, 11, 3, 8, shade(p.armor, -0.25)); // cape left
    }

    // torso
    P.rect(7, 10, 10, 9, p.armor);
    P.rect(8, 11, 8, 3, shade(p.armor, 0.12));
    // accent stripe
    P.rect(9, 14, 6, 2, p.accent);

    // arms
    P.rect(5, 11 + armSwing, 2, 6, p.skin);
    P.rect(17, 11 - armSwing, 2, 6, p.skin);
    P.rect(4, 16 + armSwing, 3, 2, p.armor);
    P.rect(17, 16 - armSwing, 3, 2, p.armor);

    // head
    P.disk(12, 7, 4, p.skin);
    P.rect(9, 4, 6, 3, p.hair); // hair
    // eyes
    P.pset(10, 7, "#1a1010");
    P.pset(14, 7, "#1a1010");
    P.pset(11, 7, "#fff");
    P.pset(15, 7, "#fff");

    // class props
    if (id === "swordsman" || id === "shield_maiden" || id === "landsknecht" || id === "norseman") {
      // weapon right
      P.rect(19, 6 - armSwing, 2, 12, p.weapon);
      P.rect(18, 5 - armSwing, 4, 2, shade(p.weapon, 0.2));
    }
    if (id === "shield_maiden") {
      P.rect(3, 12, 3, 6, p.weapon);
      P.rect(3, 13, 3, 4, p.accent);
    }
    if (id === "archer" || id === "beast_huntress") {
      P.rect(18, 10, 1, 8, p.weapon);
      P.rect(17, 10, 3, 1, p.weapon);
      P.rect(17, 17, 3, 1, p.weapon);
    }
    if (id === "exterminator") {
      P.rect(18, 12, 5, 3, p.weapon);
      P.rect(22, 11, 2, 2, p.accent);
    }
    if (id === "cleric") {
      P.rect(18, 8, 2, 10, p.weapon);
      P.rect(17, 7, 4, 2, p.accent);
    }
    if (id === "warlock" || id === "sage" || id === "sorceress") {
      P.rect(18, 7, 2, 12, p.weapon);
      P.disk(19, 6, 2, p.accent);
    }
    if (id === "bard") {
      P.rect(17, 12, 5, 4, p.weapon);
      P.rect(18, 11, 3, 1, shade(p.weapon, 0.2));
    }
    if (id === "crone" || id === "alchemist") {
      P.rect(18, 10, 2, 8, p.weapon);
      P.disk(19, 9, 2, p.accent);
    }
    if (id === "norseman") {
      P.rect(8, 3, 8, 2, p.hair); // fur hood
    }
    if (id === "exterminator") {
      P.rect(8, 3, 8, 2, p.dark); // mask
      P.pset(10, 7, p.accent);
      P.pset(14, 7, p.accent);
    }

    // outline-ish dark edge
    for (let y = 0; y < 28; y++) {
      for (let x = 0; x < 24; x++) {
        const i = (y * 24 + x) * 4;
        if (P.buf.data[i + 3] < 128) continue;
        const edge =
          (x === 0 || P.buf.data[(y * 24 + x - 1) * 4 + 3] < 128) ||
          (x === 23 || P.buf.data[(y * 24 + x + 1) * 4 + 3] < 128) ||
          (y === 0 || P.buf.data[((y - 1) * 24 + x) * 4 + 3] < 128) ||
          (y === 27 || P.buf.data[((y + 1) * 24 + x) * 4 + 3] < 128);
        if (edge) {
          // darken edge slightly by overlay
          P.buf.data[i] = Math.max(0, P.buf.data[i] - 40);
          P.buf.data[i + 1] = Math.max(0, P.buf.data[i + 1] - 40);
          P.buf.data[i + 2] = Math.max(0, P.buf.data[i + 2] - 40);
        }
      }
    }

    return P.bakeScaled(3); // 72×84
  }

  function paintEnemy(kind, color) {
    const col = color || "#7a4a90";
    const dark = shade(col, -0.3);
    const lite = shade(col, 0.2);
    const P = new Painter(20, 20);

    if (kind === "slime") {
      P.disk(10, 13, 7, col);
      P.rect(4, 12, 12, 5, col);
      P.disk(7, 11, 2, lite);
      P.pset(7, 12, "#1a1010");
      P.pset(12, 12, "#1a1010");
    } else if (kind === "hound" || kind === "runner" || kind === "crawler") {
      P.rect(4, 10, 12, 5, col);
      P.disk(15, 10, 4, col);
      P.rect(3, 14, 3, 4, dark);
      P.rect(8, 14, 3, 4, dark);
      P.rect(12, 14, 3, 3, dark);
      P.pset(16, 9, "#ff4040");
      P.rect(17, 12, 3, 1, dark); // snout
    } else if (kind === "skeleton" || kind === "shield" || kind === "knight") {
      P.rect(7, 9, 6, 7, lite);
      P.disk(10, 6, 4, lite);
      P.rect(6, 15, 3, 4, lite);
      P.rect(11, 15, 3, 4, lite);
      P.pset(8, 6, "#1a1010");
      P.pset(12, 6, "#1a1010");
      if (kind === "shield") P.rect(4, 10, 3, 6, "#9098a0");
      if (kind === "knight") P.rect(14, 8, 2, 8, "#a0a8b0");
    } else if (kind === "mage" || kind === "lich" || kind === "void") {
      P.rect(6, 10, 8, 8, col);
      P.disk(10, 7, 4, col);
      P.rect(5, 12, 10, 7, dark);
      P.rect(15, 6, 2, 10, lite);
      P.disk(16, 5, 2, "#c0a0ff");
      P.pset(8, 7, "#ff80ff");
      P.pset(12, 7, "#ff80ff");
    } else if (kind === "wraith" || kind === "ghost" || kind === "ghoul") {
      P.disk(10, 8, 5, col);
      P.rect(6, 10, 8, 8, col);
      for (let i = 0; i < 4; i++) P.rect(6 + i * 2, 17, 2, 2 + (i % 2), dark);
      P.pset(8, 8, "#fff");
      P.pset(12, 8, "#fff");
    } else if (kind === "bear" || kind === "brute" || kind === "giant") {
      P.rect(4, 8, 12, 9, col);
      P.disk(10, 6, 5, col);
      P.rect(3, 15, 4, 4, dark);
      P.rect(13, 15, 4, 4, dark);
      P.pset(7, 6, "#1a1010");
      P.pset(12, 6, "#1a1010");
    } else if (kind === "wyrm" || kind === "hydra") {
      P.rect(5, 10, 12, 5, col);
      P.disk(16, 10, 4, col);
      P.rect(3, 12, 4, 3, dark);
      P.pset(17, 9, "#ff4040");
      P.rect(18, 11, 2, 1, dark);
    } else if (kind === "scorched" || kind === "fiend") {
      P.rect(6, 9, 8, 8, col);
      P.disk(10, 6, 4, col);
      P.rect(5, 8, 2, 5, dark);
      P.rect(13, 8, 2, 5, dark);
      P.pset(8, 6, pAccent(col));
      P.pset(12, 6, pAccent(col));
    } else {
      // imp / default humanoid
      P.rect(7, 10, 6, 7, col);
      P.disk(10, 6, 4, col);
      P.rect(6, 15, 3, 4, dark);
      P.rect(11, 15, 3, 4, dark);
      P.rect(5, 4, 2, 3, dark); // horn
      P.rect(13, 4, 2, 3, dark);
      P.pset(8, 6, "#ff4040");
      P.pset(12, 6, "#ff4040");
    }
    // outline
    for (let y = 0; y < 20; y++) {
      for (let x = 0; x < 20; x++) {
        const i = (y * 20 + x) * 4;
        if (P.buf.data[i + 3] < 128) continue;
        const edge =
          (x === 0 || P.buf.data[(y * 20 + x - 1) * 4 + 3] < 128) ||
          (x === 19 || P.buf.data[(y * 20 + x + 1) * 4 + 3] < 128) ||
          (y === 0 || P.buf.data[((y - 1) * 20 + x) * 4 + 3] < 128) ||
          (y === 19 || P.buf.data[((y + 1) * 20 + x) * 4 + 3] < 128);
        if (edge) {
          P.buf.data[i] = Math.max(0, P.buf.data[i] - 50);
          P.buf.data[i + 1] = Math.max(0, P.buf.data[i + 1] - 50);
          P.buf.data[i + 2] = Math.max(0, P.buf.data[i + 2] - 50);
        }
      }
    }
    return P.bakeScaled(3); // 60×60
  }

  function pAccent(c) {
    return shade(c, 0.35);
  }

  function paintTile(style, variant, theme) {
    const a = (theme && theme.floorA) || "#1a1428";
    const b = (theme && theme.floorB) || "#100c18";
    const c = (theme && theme.floorC) || "#0c0a12";
    const P = new Painter(16, 16);
    const base = variant % 3 === 0 ? a : variant % 3 === 1 ? b : c;
    P.rect(0, 0, 16, 16, base);
    // noise dots
    for (let i = 0; i < 12; i++) {
      const x = (variant * 7 + i * 3) % 16;
      const y = (variant * 11 + i * 5) % 16;
      P.pset(x, y, shade(base, (i % 2 ? 0.06 : -0.08)));
    }
    // style detail
    if (style === "ember") {
      if (variant % 4 === 0) {
        P.rect(4, 6, 8, 2, "#c04820");
        P.rect(6, 8, 3, 3, "#e06020");
      }
    } else if (style === "frozen") {
      if (variant % 3 === 0) {
        P.pset(4, 4, "#c0e8ff");
        P.pset(10, 8, "#a0d8f0");
        P.pset(7, 12, "#e0f4ff");
      }
    } else if (style === "bog") {
      if (variant % 3 === 0) P.disk(8, 10, 4, shade("#306040", -0.1));
    } else if (style === "viaduct") {
      P.rect(0, 7, 16, 1, shade(base, -0.15));
      P.rect(variant % 2 === 0 ? 4 : 12, 0, 1, 16, shade(base, -0.12));
    } else if (style === "vault") {
      P.outlineRect(2, 2, 12, 12, shade("#d4a84b", -0.3));
      if (variant % 5 === 0) P.disk(8, 8, 2, "#d4a84b");
    } else if (style === "dissonance") {
      P.rect(3, 3, 5, 5, shade(base, 0.15));
      P.rect(9, 8, 5, 5, shade(base, -0.12));
    } else {
      // cavern crystal flecks
      if (variant % 4 === 0) {
        P.pset(5, 5, "#8040c0");
        P.pset(11, 9, "#6030a0");
      }
    }
    // grout
    P.outlineRect(0, 0, 16, 16, shade(base, -0.25));
    return P.bakeScaled(4); // 64×64 ≈ tile
  }

  function paintPickup(kind) {
    const P = new Painter(12, 12);
    if (kind === "gold") {
      P.disk(6, 6, 4, "#d4a84b");
      P.disk(5, 5, 2, "#f0d080");
      P.outlineRect(2, 2, 8, 8, "#8a6020");
    } else if (kind === "xp") {
      P.disk(6, 6, 4, "#7ec850");
      P.pset(5, 5, "#c0ff80");
      P.pset(7, 7, "#406020");
    } else if (kind === "chest") {
      P.rect(2, 4, 8, 6, "#8a6030");
      P.rect(2, 3, 8, 2, "#6a4020");
      P.rect(5, 5, 2, 3, "#d4a84b");
    } else if (kind === "tome") {
      P.rect(3, 2, 6, 8, "#4060a0");
      P.rect(4, 3, 4, 6, "#e8e0d0");
      P.rect(5, 4, 2, 4, "#8060c0");
    } else {
      P.disk(6, 6, 4, "#e04040");
    }
    return P.bakeScaled(3);
  }

  // ── Build cache ─────────────────────────────────────────
  let ready = false;
  function build() {
    if (ready) return;
    // heroes: 3 frames each
    const heroIds = Object.keys(HERO_PAL);
    for (const id of heroIds) {
      cache["hero_" + id + "_0"] = paintHero(id, 0);
      cache["hero_" + id + "_1"] = paintHero(id, 1);
      cache["hero_" + id + "_2"] = paintHero(id, 2); // attack lean
    }
    // enemies
    const kinds = [
      "imp", "slime", "hound", "runner", "crawler", "skeleton", "shield", "knight",
      "mage", "lich", "void", "wraith", "ghost", "ghoul", "bear", "brute", "giant",
      "wyrm", "hydra", "scorched", "fiend", "gargoyle", "effigy", "horseman", "construct", "skull",
    ];
    const defaultCols = {
      imp: "#7a4a90", slime: "#50a060", hound: "#a05830", skeleton: "#c8c0b0",
      mage: "#9080b0", wraith: "#8090c0", bear: "#c0e0f0", wyrm: "#60b0d8",
      scorched: "#c04820", fiend: "#a04070", lich: "#60a080", void: "#502080",
    };
    for (const k of kinds) {
      cache["enemy_" + k] = paintEnemy(k, defaultCols[k] || "#7a4a90");
    }
    // tinted enemy cache on demand via getEnemy
    // pickups
    cache.gold = paintPickup("gold");
    cache.xp = paintPickup("xp");
    cache.chest = paintPickup("chest");
    cache.tome = paintPickup("tome");
    cache.potion = paintPickup("potion");
    // floor tiles by style × variants
    const styles = ["cavern", "ember", "frozen", "bog", "viaduct", "dissonance", "vault"];
    for (const st of styles) {
      for (let v = 0; v < 5; v++) {
        cache["tile_" + st + "_" + v] = paintTile(st, v, null);
      }
    }
    ready = true;
  }

  function get(key) {
    if (!ready) build();
    return cache[key] || null;
  }

  /** Recolor enemy sprite to match e.color (cheap canvas tint) */
  const tintCache = Object.create(null);
  function getEnemySprite(kind, color) {
    if (!ready) build();
    const k = kind || "imp";
    const key = "enemy_" + k + "_" + (color || "");
    if (tintCache[key]) return tintCache[key];
    const base = cache["enemy_" + k] || cache.enemy_imp;
    if (!base) return null;
    if (!color) return base;
    const c = makeCanvas(base.width, base.height);
    const ctx = c.getContext("2d");
    ctx.drawImage(base, 0, 0);
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    tintCache[key] = c;
    return c;
  }

  function getTile(style, variant, theme) {
    if (!ready) build();
    const st = style || "cavern";
    const v = (variant | 0) % 5;
    // theme-specific bake if hall colors differ
    if (theme && (theme.floorA || theme.floorB)) {
      const tk = "tile_" + st + "_" + v + "_" + (theme.floorA || "") + (theme.floorB || "");
      if (!cache[tk]) cache[tk] = paintTile(st, v, theme);
      return cache[tk];
    }
    return cache["tile_" + st + "_" + v] || cache.tile_cavern_0;
  }

  /**
   * Draw hero sprite at world-screen position (feet center).
   * facing: 1 right, -1 left
   * frame: 0 idle, 1 walk, 2 attack
   */
  function drawHero(ctx, classId, x, y, facing, frame, opts) {
    if (!ready) build();
    opts = opts || {};
    const f = frame != null ? frame : 0;
    const img = get("hero_" + classId + "_" + (f % 3)) || get("hero_swordsman_0");
    if (!img) return false;
    const sc = opts.scale || 1;
    const w = img.width * sc;
    const h = img.height * sc;
    ctx.save();
    // feet anchor cố định — không filter (filter gây nháy)
    ctx.translate(x | 0, y | 0);
    ctx.scale(facing < 0 ? -1 : 1, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, -w / 2, -h + 4 * sc, w, h);
    if (opts.flash) {
      ctx.globalCompositeOperation = "source-atop";
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-w / 2, -h + 4 * sc, w, h);
      ctx.globalAlpha = 1;
      ctx.globalCompositeOperation = "source-over";
    }
    ctx.restore();
    return true;
  }

  function drawEnemy(ctx, kind, color, x, y, facing, scale) {
    if (!ready) build();
    const img = getEnemySprite(kind, color);
    if (!img) return false;
    const sc = scale || 1;
    const w = img.width * sc * 0.85;
    const h = img.height * sc * 0.85;
    ctx.save();
    // pixel-align để bớt rung khi di chuyển
    ctx.translate(x | 0, y | 0);
    ctx.scale(facing < 0 ? -1 : 1, 1);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, -w / 2, -h + 6 * sc, w, h);
    ctx.restore();
    return true;
  }

  function drawFloorTile(/* unused — floor vẽ checker phẳng trong game.js */) {
    return false;
  }

  function drawPickup(ctx, kind, x, y, scale) {
    if (!ready) build();
    const img = get(kind) || get("xp");
    if (!img) return false;
    const sc = scale || 1;
    const w = img.width * sc;
    const h = img.height * sc;
    ctx.drawImage(img, x - w / 2, y - h / 2, w, h);
    return true;
  }

  // build on load
  if (typeof document !== "undefined") {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", build);
    } else {
      build();
    }
  }

  return {
    build,
    ready: () => ready,
    get,
    getEnemySprite,
    getTile,
    drawHero,
    drawEnemy,
    drawFloorTile,
    drawPickup,
    HERO_PAL,
  };
})();
