/**
 * Halls of Torment — Prototype
 * Data driven by wiki: https://hot.fandom.com/wiki/Halls_of_Torment_Wiki
 * (via data.js — scaled for browser prototype)
 */

(() => {
  "use strict";

  // ─── Constants ───────────────────────────────────────────
  const W = 1280;
  const H = 720;
  const MAP_W = 2200;
  const MAP_H = 1400;
  const DATA = window.HOT_DATA;
  if (!DATA) {
    console.error("data.js missing — load data.js before game.js");
  }

  const CLASSES = DATA.HEROES;
  const HALLS = DATA.HALLS || {};
  const HALL_ORDER = DATA.HALL_ORDER || Object.keys(HALLS);
  const RUN_DURATIONS = DATA.RUN_DURATIONS || [
    { id: "5", sec: 300, label: "5 phút" },
    { id: "10", sec: 600, label: "10 phút" },
    { id: "15", sec: 900, label: "15 phút" },
  ];
  const TORMENT_DURATIONS = DATA.TORMENT_DURATIONS || RUN_DURATIONS;
  const AGONY_CFG = DATA.AGONY || { maxRank: 5, secPerRank: 288 };
  const ARTIFACTS = DATA.ARTIFACTS || {};
  const ARTIFACT_ORDER = DATA.ARTIFACT_ORDER || Object.keys(ARTIFACTS);
  const TORMENT_CFG = DATA.TORMENT || {
    enemyHpPerRank: 1.11, enemyDmgPerRank: 0.02, enemySpdPerRank: 0.015, xpPerRank: 0.05, champSpawnPerRank: 0.95,
  };
  const TORMENT_MODE = DATA.TORMENT_MODE || {
    showLockedAhead: 3, absoluteMaxLevel: 99,
    enemyHpPerLevel: 1.14, enemyDmgPerLevel: 0.06, enemySpdPerLevel: 0.025,
    spawnPerLevel: 0.08, elitePerLevel: 0.12, xpPerLevel: 0.08, goldPerLevel: 0.05, shardPerLevel: 0.1,
    champIntervalBase: 42, champIntervalCutPerLevel: 2.5, champIntervalMin: 10,
    defaultDurationId: "10",
  };
  const ENEMY_BASE = DATA.ENEMIES;
  const UPGRADES = DATA.TRAITS;
  const ABILITY_UPGRADES = DATA.ABILITY_UPGRADES || {};
  const ABILITY_TRAIT_TEMPLATES = DATA.ABILITY_TRAIT_TEMPLATES || [];
  const WEAPON_PROF = DATA.WEAPON_PROF || {};
  const BALANCE = DATA.BALANCE || { xpMul: 1, goldMul: 1, earlySpawnEase: 1, playerDmgMul: 1, hallStrengthEase: 1 };
  const ITEMS = DATA.ITEMS || {};
  const ITEM_ORDER = DATA.ITEM_ORDER || Object.keys(ITEMS);
  const ITEM_SLOT_LIMITS = DATA.ITEM_SLOT_LIMITS || { helmet: 1, amulet: 1, ring: 2, chest: 1, boots: 1, gloves: 1 };
  const ITEM_SLOT_LABELS = DATA.ITEM_SLOT_LABELS || {};
  const ITEM_RARITY = DATA.ITEM_RARITY || {
    common: { id: "common", label: "Common", mul: 1, color: "#a0a8b0" },
    uncommon: { id: "uncommon", label: "Uncommon", mul: 1.35, color: "#50c070" },
    rare: { id: "rare", label: "Rare", mul: 1.7, color: "#c080e0" },
  };
  const POTIONS = DATA.POTIONS || {};
  const POTION_ORDER = DATA.POTION_ORDER || Object.keys(POTIONS);
  const BARREL_CFG = DATA.BARRELS || { spawnInterval: 18, maxAlive: 10, potionChance: 0.72, goldChance: 0.45 };
  const ABILITIES = DATA.ABILITIES || {};
  const MAX_ABILITIES = DATA.MAX_ABILITIES || 6;
  const MAX_ITEMS = DATA.MAX_ITEMS || 7;
  const MAX_ABILITY_UPGRADES = DATA.MAX_ABILITY_UPGRADES || 2;
  const MAX_LOADOUT = DATA.MAX_LOADOUT || 7;
  const BLESSINGS = DATA.BLESSINGS || {};
  const BLESSING_ORDER = DATA.BLESSING_ORDER || Object.keys(BLESSINGS);
  const SHARD_SHOP = DATA.SHARD_SHOP || {};
  const SHARD_SHOP_ORDER = DATA.SHARD_SHOP_ORDER || Object.keys(SHARD_SHOP);
  const WELL_CFG = DATA.WELL || { maxLoadout: 6, depositGoldMul: 8, baseHeal: 0.3 };
  const MARKS = DATA.MARKS || {};
  const MARK_ORDER = DATA.MARK_ORDER || Object.keys(MARKS);
  const DEFAULT_SETTINGS = DATA.DEFAULT_SETTINGS || { masterVol: 0.55, sfx: true, shake: true, gamepad: true };

  let settings = loadSettings();
  let screenShake = 0;
  let levelRerollCount = 0;
  let levelUpMode = "trait"; // trait | item_chest

  /** Active run duration (set at startGame) */
  let RUN_DURATION_SEC = DATA.RUN_DURATION_SEC || 300;

  /** XP multipliers vs normal of same base type */
  const XP_MUL_ELITE = 5;
  const XP_MUL_BOSS = 10;
  const XP_MUL_MINIBOSS = 5;
  const NORMAL_REF_XP = (ENEMY_BASE.skeleton && ENEMY_BASE.skeleton.xp) || 12;

  // ─── DOM ─────────────────────────────────────────────────
  const canvas = document.getElementById("game");
  const ctx = canvas.getContext("2d");
  const $ = (id) => document.getElementById(id);

  const el = {
    menu: $("menu"),
    gameWrap: $("game-wrap"),
    levelup: $("levelup"),
    abilityPick: $("ability-pick"),
    pause: $("pause"),
    end: $("end"),
    upgradeOptions: $("upgrade-options"),
    abilityOptions: $("ability-options"),
    abilityHud: $("ability-hud"),
    abilityStatsList: $("ability-stats-list"),
    abCount: $("ab-count"),
    hpFill: $("hp-fill"),
    xpFill: $("xp-fill"),
    hpText: $("hp-text"),
    lvlText: $("lvl-text"),
    waveText: $("wave-text"),
    diffText: $("diff-text"),
    className: $("class-name"),
    kills: $("kills"),
    goldText: $("gold-text"),
    shardsHud: $("shards-hud"),
    itemHud: $("item-hud"),
    endTitle: $("end-title"),
    endStats: $("end-stats"),
    skillName: $("skill-name"),
    skillCdFill: $("skill-cd-fill"),
    bossBarWrap: $("boss-bar-wrap"),
    bossFill: $("boss-fill"),
    bossName: $("boss-name"),
    waveBanner: $("wave-banner"),
    waveBannerText: $("wave-banner-text"),
    waveBannerSub: $("wave-banner-sub"),
    wellOverlay: $("well-overlay"),
    wellSellList: $("well-sell-list"),
    wellOverlayHint: $("well-overlay-hint"),
    stClass: $("st-class"),
    stLevel: $("st-level"),
    stHp: $("st-hp"),
    stAtk: $("st-atk"),
    stAsp: $("st-asp"),
    stSpd: $("st-spd"),
    stRng: $("st-rng"),
    stMulti: $("st-multi"),
    stCrit: $("st-crit"),
    stCdmg: $("st-cdmg"),
    stDef: $("st-def"),
  };

  // ─── State ───────────────────────────────────────────────
  const keys = Object.create(null);
  let state = "menu";
  let selectedClass = null;
  let selectedHallId = null;
  let currentHall = null;
  let lastTs = 0;
  let animId = 0;

  let player = null;
  let enemies = [];
  let projectiles = [];
  let enemyShots = [];
  let xpGems = [];
  let particles = [];
  let floatingTexts = [];
  let aoeFx = [];
  let tomes = []; // Tome of Mastery pickups
  let summons = []; // clay golem etc.
  let abilityFx = []; // special ability VFX
  let goldCoins = []; // floor gold pickups
  let chests = []; // item chests
  let wells = []; // in-run Well of Life
  let itemPatches = []; // fire/goo/shadow ground patches from items
  let barrels = []; // breakable barrels
  let potionDrops = []; // floor potions
  let barrelSpawnTimer = 12;
  let camera = { x: 0, y: 0 };
  let kills = 0;
  let gold = 0;
  let elapsed = 0;
  let slashFx = null;
  let pendingAbilityResume = "playing";
  let abilityTraitPicks = 0; // ability-category trait picks → upgrade tomes
  let pendingForceAbilityUpgrade = false; // wiki: after Ability Trait rank III / VI
  let wellHealedThisRun = false;
  let wellInteractCd = 0;

  // ─── Modes: Hall (pick hall) vs Torment (level ladder, random hall) ──
  let pendingMode = "hall"; // "hall" | "torment"
  let pendingDurationId = "5";
  let pendingAgony = false;
  let pendingTormentLevel = 1;
  let pendingArtifacts = []; // Torment mode optional artifacts (all unlocked)
  let agonyEnabled = false;
  let agonyRank = 0;
  let agonyMeter = 0; // 0..1
  /** Active Torment ladder level during run (0 = Hall mode) */
  let tormentLevel = 0;
  /** Pressure rank for HUD/shards ≈ torment level */
  let tormentRank = 0;
  let activeArtifacts = [];
  let championTimer = 0;
  let runShards = 0;
  let playMode = "hall"; // runtime
  /** Meta progression E/F — no quest locks; all content available */
  let meta = defaultMeta();

  function defaultMeta() {
    return {
      gold: 0,
      shards: 0,
      blessings: {},
      shardUpgrades: {},
      ownedMarks: {},
      activeMark: null,
      loadout: [],
      mode: "hall",
      durationId: "5",
      agony: false,
      tormentLevel: 1,
      tormentBest: 0, // highest Torment level cleared
      artifacts: [],
      hero: null,
      hall: null,
      _starterGranted: false,
    };
  }

  function loadSettings() {
    try {
      const raw = localStorage.getItem("hot_proto_settings_v1");
      if (!raw) return Object.assign({}, DEFAULT_SETTINGS);
      return Object.assign({}, DEFAULT_SETTINGS, JSON.parse(raw));
    } catch (_) {
      return Object.assign({}, DEFAULT_SETTINGS);
    }
  }

  function saveSettings() {
    try {
      localStorage.setItem("hot_proto_settings_v1", JSON.stringify(settings));
    } catch (_) { /* ignore */ }
    applySettingsToSfx();
  }

  function applySettingsToSfx() {
    if (window.HOT_SFX) {
      window.HOT_SFX.setEnabled(!!settings.sfx);
      window.HOT_SFX.setVolume(settings.masterVol != null ? settings.masterVol : 0.55);
    }
  }

  function sfx(name) {
    if (window.HOT_SFX) window.HOT_SFX.play(name);
  }

  function addShake(amount) {
    if (!settings.shake) return;
    screenShake = Math.min(18, (screenShake || 0) + amount);
  }

  // Time-based hall run: intro → running → boss_announce → boss → done
  let phase = "intro";
  let phaseTimer = 0;
  let spawnTimer = 0;
  let minibossSpawned = []; // progress thresholds already fired
  let bannerTimer = 0;
  let boss = null;
  let maxAliveCap = 90;

  // ─── Helpers ─────────────────────────────────────────────
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const rand = (a, b) => a + Math.random() * (b - a);
  const shuffle = (arr) => {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  function xpForLevel(lvl) {
    return Math.floor(12 + (lvl - 1) * 10 + (lvl - 1) * (lvl - 1) * 1.5);
  }

  function showBanner(title, sub, duration = 2.4) {
    el.waveBannerText.textContent = title;
    el.waveBannerSub.textContent = sub || "";
    el.waveBanner.classList.remove("hidden");
    bannerTimer = duration;
  }

  function hideBanner() {
    el.waveBanner.classList.add("hidden");
  }

  // ─── Entities ────────────────────────────────────────────
  function createPlayer(classId) {
    const c = CLASSES[classId];
    return {
      classId,
      name: c.name,
      weapon: c.weapon,
      color: c.color,
      x: MAP_W / 2,
      y: MAP_H / 2,
      r: 14,
      maxHp: c.maxHp,
      hp: c.maxHp,
      defense: c.defense || 0,
      regen: c.regen || 0,
      speed: c.speed,
      attackCooldown: 1 / (c.attackSpeed || 1),
      attackTimer: 0.3,
      damage: c.damage,
      attackRange: c.attackRange,
      projectileSpeed: c.projectileSpeed || 0,
      style: c.style,
      multistrike: c.multistrike || 1,
      critChance: c.critChance || 0.1,
      critBonus: c.critBonus || 0.5,
      chainJumps: c.chainJumps || 2,
      pierce: c.pierce || 0,
      coneDeg: c.coneDeg || 45,
      pickupRange: c.pickupRange || 80,
      // Hero default skills removed — combat via main weapon + Abilities only
      skillId: null,
      skillName: "—",
      skillCooldown: 999,
      skillCd: 0,
      skillPower: 1,
      skillActive: 0,
      blockStrength: c.blockStrength || 0,
      level: 1,
      xp: 0,
      xpNext: xpForLevel(1),
      extraProjectiles: 0,
      meleeArc: 1.1,
      invuln: 0,
      damageTakenMul: 1,
      facing: 1,
      moving: false,
      bob: 0,
      traitRanks: Object.create(null),
      items: [],
      abilityDmgMul: 1,
      abilityCdMul: 1,
      abilityRangeMul: 1,
      abilityCritAdd: 0,
      goldFind: 1,
      thorns: 0,
      multiAcc: 0,
      force: 1,
      effectChance: 0,
      xpGain: 1,
      atk: {
        active: false,
        phase: 0,
        t: 0,
        phaseDur: [0.1, 0.09, 0.12],
        aim: 0,
        didHit: false,
        progress: 0,
      },
    };
  }

  function getAttackPhaseDurations() {
    if (!player) return [0.1, 0.09, 0.12];
    const fast = player.skillActive > 0 && player.skillId === "ringblades";
    const s = player.style;
    if (s === "melee" || s === "hammer" || s === "dualaxe" || s === "lute" || s === "scepter") {
      return fast ? [0.05, 0.06, 0.07] : [0.09, 0.1, 0.12];
    }
    if (s === "flame") return [0.04, 0.05, 0.06];
    if (s === "chain" || s === "plants") return [0.1, 0.08, 0.12];
    if (s === "gun") return [0.12, 0.08, 0.14];
    return [0.12, 0.06, 0.1]; // projectile draw
  }

  // ─── Wiki Game Mechanics (hot.fandom.com/wiki/Game_Mechanics) ──
  /**
   * Random stacks (Crit Chance, Effect Chance over 100%):
   * whole = floor(v); frac = v - whole; with chance frac get whole+1 else whole.
   */
  function rollRandomStacks(value) {
    const v = Math.max(0, value || 0);
    const whole = Math.floor(v);
    const frac = v - whole;
    if (Math.random() < frac) return whole + 1;
    return whole;
  }

  /**
   * Deterministic Multistrike stacks via accumulator (wiki):
   * whole + frac → add frac to acc; if acc>=1 then whole+1 and acc-=1 else whole.
   */
  function rollMultistrike(value) {
    if (!player) return 1;
    const v = Math.max(0, value || 1);
    const whole = Math.floor(v);
    const frac = v - whole;
    player.multiAcc = (player.multiAcc || 0) + frac;
    let stacks = whole;
    if (player.multiAcc >= 1) {
      player.multiAcc -= 1;
      stacks += 1;
    }
    return Math.max(1, stacks);
  }

  /** Crit stacks from Crit Chance (can exceed 100% = over-crit) */
  function rollCritStacks(critChance) {
    return rollRandomStacks(critChance != null ? critChance : (player && player.critChance) || 0);
  }

  /** Final Damage = Damage × (1 + Crit Bonus × Crit Stacks) */
  function calcDamageWithStacks(base, critStacks, critBonus) {
    const stacks = critStacks || 0;
    if (stacks <= 0) return base;
    const bonus = critBonus != null ? critBonus : (player && player.critBonus) || 0;
    return base * (1 + bonus * stacks);
  }

  /** Compatibility: rollCrit → boolean (any stacks) */
  function rollCrit() {
    return rollCritStacks(player.critChance || 0) > 0;
  }

  /** Compatibility: calcDamage(base, isCrit boolean or stacks number) */
  function calcDamage(base, isCritOrStacks) {
    if (!isCritOrStacks) return base;
    const stacks = typeof isCritOrStacks === "number" ? isCritOrStacks : 1;
    return calcDamageWithStacks(base, stacks, player.critBonus || 0);
  }

  /**
   * Block Chance = min( ½ BS/Dmg , ½ √(BS/Dmg) , 1 )
   * Blocks = full negate (no DR). Wiki Game Mechanics.
   */
  function rollBlock(blockStrength, incomingDmg) {
    const bs = blockStrength || 0;
    if (bs <= 0 || incomingDmg <= 0) return false;
    const ratio = bs / incomingDmg;
    const chance = Math.min(0.5 * ratio, 0.5 * Math.sqrt(ratio), 1);
    return Math.random() < chance;
  }

  /**
   * Defense DR (wiki): InvHyperbolic + ClippedLinear
   * InvH = sgn(D)×(0.6 − 24/(|D|+40))
   * Lin  = min(0.4, 0.004×D)
   * Result is fraction of damage reduced (can be >1 theoretically; clamp to 0.99).
   */
  function defenseReduction(defense) {
    const D = defense || 0;
    if (D === 0) return 0;
    const sign = D > 0 ? 1 : -1;
    const ad = Math.abs(D);
    const invH = sign * (0.6 - 24 / (ad + 40));
    const lin = Math.min(0.4, 0.004 * D);
    return invH + lin;
  }

  /** Apply knockback using Force (wiki: velocity scales with Force) */
  function applyKnockback(e, from, forceMul) {
    if (!e || e.isBoss) return;
    const force = (player && player.force) || 1;
    const spd = (force * 90) * (forceMul || 1); // px/s prototype scale
    const d = dist(from, e) || 1;
    e.kbVx = ((e.x - from.x) / d) * spd;
    e.kbVy = ((e.y - from.y) / d) * spd;
    e.kbT = 0.22;
  }

  function effectChanceRoll(baseChance) {
    // baseChance 0..∞; player.effectChance as additive bonus (e.g. 0.2 = +20%)
    const bonus = 1 + (player && player.effectChance || 0);
    return rollRandomStacks((baseChance || 0) * bonus);
  }

  function spawnPosNearEdge() {
    const side = (Math.random() * 4) | 0;
    const margin = 40;
    const viewPad = 80;
    const cx = player.x;
    const cy = player.y;
    let x, y;
    if (side === 0) {
      x = clamp(cx + rand(-W / 2 - viewPad, W / 2 + viewPad), margin, MAP_W - margin);
      y = clamp(cy - H / 2 - viewPad - rand(0, 80), margin, MAP_H - margin);
    } else if (side === 1) {
      x = clamp(cx + rand(-W / 2 - viewPad, W / 2 + viewPad), margin, MAP_W - margin);
      y = clamp(cy + H / 2 + viewPad + rand(0, 80), margin, MAP_H - margin);
    } else if (side === 2) {
      x = clamp(cx - W / 2 - viewPad - rand(0, 80), margin, MAP_W - margin);
      y = clamp(cy + rand(-H / 2 - viewPad, H / 2 + viewPad), margin, MAP_H - margin);
    } else {
      x = clamp(cx + W / 2 + viewPad + rand(0, 80), margin, MAP_W - margin);
      y = clamp(cy + rand(-H / 2 - viewPad, H / 2 + viewPad), margin, MAP_H - margin);
    }
    return { x, y };
  }

  function spawnEnemy(type, scale = 1, opts = {}) {
    const base = ENEMY_BASE[type] || ENEMY_BASE.imp;
    if (!base) return null;
    const isMiniboss = !!base.miniboss || !!opts.miniboss || type === "miniboss";
    const isElite = !isMiniboss && !!opts.elite;
    const pos = opts.pos || spawnPosNearEdge();

    let hpMul = scale;
    let dmgMul = 0.9 + scale * 0.08;
    let rMul = 1;
    let spdMul = 0.95 + scale * 0.05;
    let xpMul = 1;
    let color = base.color;

    const diff = getDiffMods();
    const isChampion = !!opts.champion;

    if (isChampion) {
      hpMul *= 4.2 * diff.enemyHp;
      dmgMul *= 1.55 * diff.enemyDmg;
      rMul = 1.45;
      spdMul *= 1.08 * diff.enemySpd;
      xpMul = XP_MUL_ELITE * 1.8 * diff.xpMul;
    } else if (isElite) {
      hpMul *= 2.4 * diff.enemyHp;
      dmgMul *= 1.45 * diff.enemyDmg;
      rMul = 1.25;
      spdMul *= 1.05 * diff.enemySpd;
      xpMul = XP_MUL_ELITE * diff.xpMul;
    } else if (isMiniboss) {
      hpMul *= 1.15 * diff.enemyHp * (diff.minibossMul || 1);
      dmgMul *= 1.1 * diff.enemyDmg;
      spdMul *= diff.enemySpd;
      xpMul = XP_MUL_MINIBOSS * diff.xpMul;
    } else {
      hpMul *= diff.enemyHp;
      dmgMul *= diff.enemyDmg;
      spdMul *= diff.enemySpd;
      xpMul *= diff.xpMul;
    }

    const scaleXp = 1 + scale * 0.15;
    const displayName = isChampion ? `Champion ${base.name}` : isElite ? `Elite ${base.name}` : base.name;
    const e = {
      type,
      sprite: base.sprite || "grunt",
      isBoss: false,
      isElite: isElite || isChampion,
      isMiniboss,
      isChampion,
      name: displayName,
      x: pos.x,
      y: pos.y,
      r: base.r * rMul,
      hp: base.hp * hpMul,
      maxHp: base.hp * hpMul,
      speed: base.speed * spdMul,
      dmg: base.dmg * dmgMul,
      color,
      xp: Math.round(base.xp * xpMul * scaleXp),
      hitFlash: 0,
      ai: "chase",
      aiTimer: isMiniboss ? 1.2 : 0,
      chargeVx: 0,
      chargeVy: 0,
      slamTelegraph: 0,
      phase: 1,
      atkCd: rand(0.2, 0.8),
      shotCd: rand(0.6, 1.8),
      aiKind: enemyAiKind(base.sprite, type),
      atk: { active: false, phase: 0, t: 0, progress: 0, didHit: false, phaseDur: [0.14, 0.09, 0.16] },
    };
    enemies.push(e);
    return e;
  }

  function enemyAiKind(sprite, type) {
    const s = sprite || "imp";
    if (s === "mage" || s === "lich" || /mage$/.test(type || "")) return "ranged";
    if (s === "slime") return "slime";
    if (s === "hound" || s === "crawler" || s === "ghost") return "rush";
    if (s === "shield" || s === "knight" || s === "construct" || s === "giant" || s === "bear") return "tank";
    if (s === "skull" || s === "void" || s === "wraith") return "strafe";
    if (s === "wyrm" || s === "hydra") return "serpentine";
    return "chase";
  }

  function clearAllNonBossEnemies() {
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      if (e.isBoss) continue;
      for (let k = 0; k < 4; k++) {
        const a = Math.random() * Math.PI * 2;
        particles.push({
          x: e.x, y: e.y,
          vx: Math.cos(a) * rand(40, 120),
          vy: Math.sin(a) * rand(40, 120),
          life: 0.35, maxLife: 0.35,
          color: e.color, size: rand(2, 5),
        });
      }
      enemies.splice(i, 1);
    }
  }

  function hallStrengthAt(progress) {
    if (!currentHall) return 1;
    const hs = currentHall.hallStrength || { min: 1, max: 2.4 };
    const t = clamp(progress, 0, 1);
    const eased = t * t * 0.35 + t * 0.65;
    const raw = hs.min + (hs.max - hs.min) * eased;
    return raw * (BALANCE.hallStrengthEase || 1);
  }

  function runProgress() {
    return clamp(elapsed / RUN_DURATION_SEC, 0, 1);
  }

  /**
   * Difficulty mods:
   * - Hall: optional Agony meter ranks
   * - Torment: ladder level L + optional Artifacts (all unlocked, additive mods)
   */
  function getDiffMods() {
    const ar = (playMode === "hall" && agonyEnabled) ? agonyRank : 0;
    const tl = (playMode === "torment") ? Math.max(1, tormentLevel || 1) : 0;
    const tr = tl;
    const art = (playMode === "torment")
      ? activeArtifacts.map((id) => ARTIFACTS[id]).filter(Boolean)
      : [];
    let enemyHp = 1;
    let enemyDmg = 1;
    let enemySpd = 1;
    let spawnMul = 1;
    let eliteMul = 1;
    let champMul = 1;
    let xpMul = 1;
    let goldMul = 1;
    let shardMul = 1;
    let playerHpMul = 1;
    let playerRegenMul = 1;
    let minibossMul = 1;
    let champInterval = AGONY_CFG.championBaseInterval || 48;

    if (playMode === "torment" && tl > 0) {
      const L = tl;
      const cfg = TORMENT_MODE;
      enemyHp = Math.pow(cfg.enemyHpPerLevel || 1.14, L);
      enemyDmg = 1 + L * (cfg.enemyDmgPerLevel || 0.06);
      enemySpd = 1 + L * (cfg.enemySpdPerLevel || 0.025);
      spawnMul = 1 + L * (cfg.spawnPerLevel || 0.08);
      eliteMul = 1 + L * (cfg.elitePerLevel || 0.12);
      xpMul = 1 + L * (cfg.xpPerLevel || 0.08);
      goldMul = 1 + L * (cfg.goldPerLevel || 0.05);
      shardMul = 1 + L * (cfg.shardPerLevel || 0.1);
      minibossMul = 1 + L * 0.06;
      const base = cfg.champIntervalBase || 42;
      const cut = cfg.champIntervalCutPerLevel || 2.5;
      champInterval = Math.max(cfg.champIntervalMin || 10, base - L * cut);
    } else if (ar > 0) {
      enemyHp = 1 + ar * (AGONY_CFG.enemyHpPerRank || 0.12);
      enemyDmg = 1 + ar * (AGONY_CFG.enemyDmgPerRank || 0.05);
      enemySpd = 1 + ar * (AGONY_CFG.enemySpdPerRank || 0.02);
      spawnMul = 1 + ar * (AGONY_CFG.spawnPerRank || 0.1);
      const hallId = currentHall && currentHall.id;
      const xpR = (AGONY_CFG.xpPerRankByHall && AGONY_CFG.xpPerRankByHall[hallId]) || 0.25;
      xpMul = 1 + ar * xpR;
      const champBase = AGONY_CFG.championBaseInterval || 48;
      const champCut = AGONY_CFG.championIntervalCutPerRank || 9;
      champInterval = Math.max(12, champBase - ar * champCut);
    }

    // Optional Torment Artifacts — wiki 1:1 mods stack on top of level
    let playerDmgMul = 1;
    let playerSpdMul = 1;
    let visionMul = 1;
    let runTimeCutSec = 0;
    let agonyMeterMul = 1;
    const artFlags = Object.create(null);
    for (const a of art) {
      if (a.enemyHpMul) enemyHp *= a.enemyHpMul;
      if (a.enemyDmgMul) enemyDmg *= a.enemyDmgMul;
      if (a.enemySpdMul) enemySpd *= a.enemySpdMul;
      if (a.spawnMul) spawnMul *= a.spawnMul;
      if (a.eliteMul) eliteMul *= a.eliteMul;
      if (a.champMul) champMul *= a.champMul;
      if (a.xpMul) xpMul *= a.xpMul;
      if (a.goldMul) goldMul *= a.goldMul;
      if (a.shardMul) shardMul *= a.shardMul;
      if (a.playerHpMul) playerHpMul *= a.playerHpMul;
      if (a.playerRegenMul) playerRegenMul *= a.playerRegenMul;
      if (a.minibossMul) minibossMul *= a.minibossMul;
      if (a.playerDmgMul) playerDmgMul *= a.playerDmgMul;
      if (a.playerSpdMul) playerSpdMul *= a.playerSpdMul;
      if (a.visionMul) visionMul *= a.visionMul;
      if (a.runTimeCutSec) runTimeCutSec += a.runTimeCutSec;
      if (a.agonyMeterMul) agonyMeterMul *= a.agonyMeterMul;
      // Collect boolean/numeric flags
      for (const k of Object.keys(a)) {
        if (k.startsWith("flag") || k === "globalBurnChance" || k === "ghostChance"
          || k === "healMul" || k === "levelHpTax" || k === "playerModMul"
          || k === "elemChanceMul" || k === "elemDmgMul" || k === "burdenSpdPerItem"
          || k === "playerMultistrikeAdd" || k === "specialNormalChance"
          || k === "stackLimitMul" || k === "goldArmorMul" || k === "bogEveryKills"
          || k === "shardBonusCap") {
          artFlags[k] = a[k];
        }
      }
    }
    if (art.length && champMul !== 1) {
      champInterval = Math.max(10, champInterval * champMul);
    }

    return {
      enemyHp, enemyDmg, enemySpd, spawnMul, eliteMul, xpMul, goldMul, shardMul,
      playerHpMul, playerRegenMul, playerDmgMul, playerSpdMul, visionMul,
      runTimeCutSec, agonyMeterMul, minibossMul, champInterval, ar, tr, tl,
      artCount: art.length, artFlags,
    };
  }

  function diffLabel() {
    if (playMode === "torment") {
      const n = (activeArtifacts && activeArtifacts.length) || 0;
      return n ? `Torment Lv ${tormentLevel || 1} · A${n}` : `Torment Lv ${tormentLevel || 1}`;
    }
    if (agonyEnabled) return `Agony ${agonyRank}`;
    return "Hall · Normal";
  }

  function isHardModeRun() {
    return playMode === "torment" || agonyEnabled;
  }

  function pickRandomHallId() {
    const order = HALL_ORDER.length ? HALL_ORDER : Object.keys(HALLS);
    if (!order.length) return "haunted_caverns";
    return order[(Math.random() * order.length) | 0];
  }

  /** Highest Torment level the player may select (best clear + 1, min 1) */
  function maxUnlockedTormentLevel() {
    const best = meta.tormentBest || 0;
    const abs = TORMENT_MODE.absoluteMaxLevel || 99;
    return Math.min(abs, best + 1);
  }

  function isTormentLevelUnlocked(lv) {
    return lv >= 1 && lv <= maxUnlockedTormentLevel();
  }

  function clampPendingTormentLevel() {
    const maxU = maxUnlockedTormentLevel();
    pendingTormentLevel = Math.max(1, Math.min(maxU, pendingTormentLevel || 1));
  }

  function currentDurationList() {
    return pendingMode === "torment" ? TORMENT_DURATIONS : RUN_DURATIONS;
  }

  function findDuration(id) {
    const all = RUN_DURATIONS.concat(TORMENT_DURATIONS);
    return all.find((d) => d.id === id) || currentDurationList()[0] || RUN_DURATIONS[0];
  }

  function ensureDurationForMode() {
    const list = currentDurationList();
    // Migrate old ids (30, t5/t10/t15) → 5/10/15
    const migrate = { "30": "15", t5: "5", t10: "10", t15: "15" };
    if (migrate[pendingDurationId]) pendingDurationId = migrate[pendingDurationId];
    if (!list.find((d) => d.id === pendingDurationId)) {
      pendingDurationId = pendingMode === "torment"
        ? (TORMENT_MODE.defaultDurationId || "10")
        : (meta.durationId && list.find((d) => d.id === meta.durationId) ? meta.durationId : "5");
      if (migrate[pendingDurationId]) pendingDurationId = migrate[pendingDurationId];
      if (!list.find((d) => d.id === pendingDurationId)) {
        pendingDurationId = list[0].id;
      }
    }
  }

  function bogKillTarget() {
    // Scale kill-to-boss for Boglands (wiki ~20k unlimited)
    return Math.max(800, Math.round(700 * (RUN_DURATION_SEC / 60)));
  }

  function isBoglandsRun() {
    return currentHall && currentHall.id === "boglands";
  }

  function spawnBoss() {
    const pos = { x: MAP_W / 2, y: 120 };
    const bd = (currentHall && currentHall.boss) || (DATA.BOSSES && DATA.BOSSES.lord_of_pain) || {
      name: "Lord of Pain", hp: 2200, speed: 55, dmg: 22, r: 36, color: "#8b2040",
    };
    const str = hallStrengthAt(1);
    const diff = getDiffMods();
    const bossXp = Math.round(NORMAL_REF_XP * XP_MUL_BOSS * (diff.xpMul || 1));
    boss = {
      type: "boss",
      sprite: "brute",
      isBoss: true,
      isElite: false,
      isMiniboss: false,
      name: bd.name,
      x: pos.x,
      y: pos.y,
      r: bd.r,
      hp: bd.hp * str * 0.85 * diff.enemyHp,
      maxHp: bd.hp * str * 0.85 * diff.enemyHp,
      speed: bd.speed * Math.min(1.35, diff.enemySpd),
      dmg: bd.dmg * (0.9 + str * 0.1) * diff.enemyDmg,
      color: bd.color,
      xp: bossXp,
      hitFlash: 0,
      ai: "chase",
      aiTimer: 1.5,
      phase: 1,
      chargeVx: 0,
      chargeVy: 0,
      slamTelegraph: 0,
      atkCd: 0.5,
      pattern: null,
      atk: { active: false, phase: 0, t: 0, progress: 0, didHit: false, phaseDur: [0.22, 0.12, 0.25] },
    };
    boss.pattern = (bd && bd.pattern) || (typeof bossPatternKey === "function" ? bossPatternKey() : "pain");
    enemies.push(boss);
    el.bossName.textContent = boss.name;
    el.bossBarWrap.classList.remove("hidden");
    updateBossBar();
    sfx("boss");
    addShake(10);
  }

  function nearestEnemies(from, n, maxRange) {
    const list = enemies
      .map((e) => ({ e, d: dist(from, e) }))
      .filter((x) => x.d <= maxRange)
      .sort((a, b) => a.d - b.d);
    return list.slice(0, n).map((x) => x.e);
  }

  function beginAttack() {
    const atk = player.atk;
    if (atk.active) return;

    // Aim at nearest enemy
    const near = nearestEnemies(player, 1, player.attackRange * 1.2);
    if (near.length) {
      atk.aim = Math.atan2(near[0].y - player.y, near[0].x - player.x);
      player.facing = near[0].x >= player.x ? 1 : -1;
    } else {
      atk.aim = player.facing > 0 ? 0 : Math.PI;
    }

    atk.active = true;
    atk.phase = 0;
    atk.t = 0;
    atk.didHit = false;
    atk.progress = 0;
    atk.phaseDur = getAttackPhaseDurations();
  }

  function meleeAoeStrike(rangeMul, dmgMul) {
    const range = player.attackRange * (player.meleeArc || 1.1) * rangeMul;
    const targets = enemies.filter((e) => dist(player, e) <= range);
    const strikes = rollMultistrike(player.multistrike || 1);
    for (const e of targets) {
      for (let s = 0; s < strikes; s++) {
        const stacks = rollCritStacks(player.critChance || 0);
        const base = player.damage * dmgMul * (BALANCE.playerDmgMul || 1) * (s === 0 ? 1 : 0.72);
        const dealt = calcDamageWithStacks(base, stacks, player.critBonus || 0);
        damageEnemy(e, dealt, stacks > 0, weaponHitOpts());
        if (stacks > 1) {
          floatingTexts.push({
            x: e.x, y: e.y - e.r - 18,
            text: `CRIT×${stacks}`, life: 0.5, maxLife: 0.5, color: "#ffd070", vy: -45,
          });
        }
        if (player.weaponHealOnHit && player.hp < player.maxHp) {
          player.hp = Math.min(player.maxHp, player.hp + player.weaponHealOnHit);
        }
      }
    }
    slashFx = {
      x: player.x, y: player.y, r: range,
      life: 0.22, maxLife: 0.22, color: player.color, aim: player.atk.aim,
    };
  }

  function fireProjectileFan(opts) {
    // Multistrike (wiki deterministic) + extra projectiles
    const multi = opts.count != null
      ? opts.count
      : rollMultistrike(player.multistrike || 1) + (player.extraProjectiles || 0);
    const count = Math.max(1, multi | 0);
    const aim = opts.aim != null ? opts.aim : player.atk.aim;
    const halfCone = ((opts.coneDeg != null ? opts.coneDeg : 18) * Math.PI) / 180;
    const spd = opts.speed || player.projectileSpeed || 300;
    for (let i = 0; i < count; i++) {
      const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
      const a = aim + t * halfCone + (opts.spreadExtra || 0);
      const stacks = opts.forceCrit ? Math.max(1, rollCritStacks(player.critChance || 0) || 1) : rollCritStacks(player.critChance || 0);
      const base = (opts.damage || player.damage) * (opts.dmgMul || 1) * (BALANCE.playerDmgMul || 1);
      projectiles.push({
        x: player.x + Math.cos(a) * 12,
        y: player.y + Math.sin(a) * 12,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        r: opts.r || 4,
        damage: calcDamageWithStacks(base, stacks, player.critBonus || 0),
        isCrit: stacks > 0,
        critStacks: stacks,
        life: opts.life || 1.6,
        color: stacks > 0 ? "#ffe080" : (opts.color || player.color),
        style: opts.style || "arrow",
        homing: !!opts.homing,
        target: opts.homing ? nearestEnemies(player, 1, 500)[0] || null : null,
        pierce: opts.pierce != null ? opts.pierce : (player.pierce || 0),
        hitOpts: weaponHitOpts(),
      });
    }
  }

  function chainLightningStrike() {
    const streaks = rollMultistrike(player.multistrike || 1) + (player.extraProjectiles || 0);
    const jumps = Math.max(1, player.chainJumps || 2);
    const used = new Set();
    const seeds = nearestEnemies(player, streaks, player.attackRange);
    if (!seeds.length) return;
    for (const seed of seeds) {
      let current = seed;
      for (let j = 0; j < jumps && current; j++) {
        if (used.has(current)) break;
        used.add(current);
        const stacks = rollCritStacks(player.critChance || 0);
        const base = player.damage * Math.pow(0.85, j) * (BALANCE.playerDmgMul || 1);
        damageEnemy(current, calcDamageWithStacks(base, stacks, player.critBonus || 0), stacks > 0, weaponHitOpts());
        aoeFx.push({ x: current.x, y: current.y, r: 16, life: 0.12, maxLife: 0.12, color: player.color, style: "burst" });
        let next = null;
        let best = 160;
        for (const e of enemies) {
          if (used.has(e) || e === current) continue;
          const d = dist(current, e);
          if (d < best) { best = d; next = e; }
        }
        current = next;
      }
    }
  }

  /** Called on strike frame — actual damage / projectiles */
  function fireAttackStrike() {
    const style = player.style;
    const skillMul = player.skillActive > 0 ? 1.35 : 1;

    if (style === "melee" || style === "hammer" || style === "dualaxe" || style === "lute") {
      // Dual axes hit twice; hammer full circle; lute/melee standard
      const hits = style === "dualaxe" ? 2 : 1;
      for (let h = 0; h < hits; h++) {
        meleeAoeStrike(skillMul * (style === "hammer" ? 1.15 : 1), style === "dualaxe" ? 0.75 : 1);
      }
      return;
    }

    if (style === "scepter") {
      // Cleric: damage split among all in cone/range
      const range = player.attackRange * (player.meleeArc || 1.1);
      const targets = enemies.filter((e) => dist(player, e) <= range);
      if (!targets.length) return;
      const share = player.damage / targets.length;
      for (const e of targets) {
        const crit = rollCrit();
        damageEnemy(e, calcDamage(share * (BALANCE.playerDmgMul || 1), crit), crit, weaponHitOpts());
      }
      slashFx = { x: player.x, y: player.y, r: range, life: 0.2, maxLife: 0.2, color: player.color };
      return;
    }

    if (style === "chain") {
      chainLightningStrike();
      return;
    }

    if (style === "plants") {
      // Crone: orbiting plant ticks on nearby enemies
      const n = Math.max(2, Math.floor(player.multistrike || 4));
      for (let i = 0; i < n; i++) {
        const a = elapsed * 2 + (i / n) * Math.PI * 2;
        const px = player.x + Math.cos(a) * 70;
        const py = player.y + Math.sin(a) * 70;
        aoeFx.push({ x: px, y: py, r: 28, life: 0.25, maxLife: 0.25, color: player.color, style: "burst" });
        for (const e of enemies) {
          if (dist({ x: px, y: py }, e) < 36) {
            const crit = rollCrit();
            damageEnemy(e, calcDamage(player.damage * 0.7 * (BALANCE.playerDmgMul || 1), crit), crit, weaponHitOpts());
          }
        }
      }
      return;
    }

    if (style === "flask") {
      // Alchemist: fling flasks in a circle
      const n = Math.max(3, Math.floor(player.multistrike || 3) + (player.extraProjectiles || 0));
      for (let i = 0; i < n; i++) {
        const a = player.atk.aim + (i / n) * Math.PI * 2;
        const crit = rollCrit();
        projectiles.push({
          x: player.x, y: player.y,
          vx: Math.cos(a) * 220, vy: Math.sin(a) * 220,
          r: 6, damage: calcDamage(player.damage, crit), isCrit: crit,
          life: 1.2, color: ["#ff6040", "#40a0ff", "#80e0ff", "#80c040"][i % 4],
          style: "orb", homing: false, target: null, pierce: 0,
        });
      }
      return;
    }

    if (style === "flame") {
      fireProjectileFan({
        count: 1 + (player.extraProjectiles || 0),
        coneDeg: player.coneDeg || 28,
        speed: player.projectileSpeed || 300,
        pierce: player.pierce || 2,
        style: "orb",
        color: "#ff8040",
        life: 0.55,
        r: 6,
      });
      return;
    }

    if (style === "specter") {
      const count = Math.max(1, Math.floor(player.multistrike || 2) + (player.extraProjectiles || 0));
      const targets = nearestEnemies(player, count, player.attackRange);
      if (!targets.length) {
        fireProjectileFan({ count, coneDeg: 40, speed: 260, pierce: 4, style: "orb", color: player.color, homing: true });
        return;
      }
      for (const t of targets) {
        const a = Math.atan2(t.y - player.y, t.x - player.x);
        const crit = rollCrit();
        projectiles.push({
          x: player.x, y: player.y,
          vx: Math.cos(a) * 260, vy: Math.sin(a) * 260,
          r: 7, damage: calcDamage(player.damage, crit), isCrit: crit,
          life: 2.2, color: player.color, style: "orb",
          homing: true, target: t, pierce: player.pierce || 4,
        });
      }
      return;
    }

    // arrow / spear / gun
    const baseCount = Math.max(1, Math.floor(player.multistrike || 1) + (player.extraProjectiles || 0));
    fireProjectileFan({
      count: style === "gun" ? 1 : baseCount,
      coneDeg: style === "gun" ? 2 : (player.coneDeg || 18),
      speed: player.projectileSpeed || 400,
      pierce: player.pierce || 0,
      dmgMul: style === "gun" ? 1.15 : 1,
      style: style === "gun" ? "arrow" : "arrow",
      life: style === "gun" ? 2.2 : 1.8,
      r: style === "gun" ? 3 : 4,
    });
  }

  function updateAttackAnim(dt) {
    const atk = player.atk;
    if (!atk.active) return;

    atk.t += dt;
    const dur = atk.phaseDur[atk.phase] || 0.1;
    atk.progress = clamp(atk.t / dur, 0, 1);

    // Strike frame: fire once at start of phase 1
    if (atk.phase === 1 && !atk.didHit) {
      fireAttackStrike();
      atk.didHit = true;
    }

    if (atk.t >= dur) {
      atk.t = 0;
      atk.progress = 0;
      atk.phase++;
      if (atk.phase > 2) {
        atk.active = false;
        atk.phase = 0;
        atk.didHit = false;
        let cd = player.attackCooldown;
        if (player.skillActive > 0 && player.skillId === "ringblades") cd *= 0.35;
        // Guiding Star / Wind Crown / Fervor / Pace Setter ASP
        const aspMul = (player._gsAsp || 1)
          * (1 + Math.min(0.5, (player.windCharges || 0) * 0.006))
          * (player.fervorTimer > 0 ? 2 : 1)
          * (player.potionHaste > 0 ? 1.4 : 1)
          * (player.potionWrath > 0 ? 1.2 : 1)
          * (player.itemPaceSetter && player.hp >= player.maxHp * 0.99 ? 1.2 : 1)
          * (1 + (player.alchAbsorb || 0) * 0.01)
          * (1 + (player.madnessStacks || 0) * 0.005);
        player.attackTimer = cd / Math.max(0.4, aspMul);
      }
    }
  }

  // ─── Enemy attack frames ─────────────────────────────────
  function enemyAtkDurations(e) {
    if (e.isBoss) return [0.22, 0.12, 0.28];
    if (e.isMiniboss) return [0.18, 0.1, 0.22];
    if (e.sprite === "brute" || e.type === "skeleton" || e.type === "brute") return [0.22, 0.12, 0.28];
    if (e.sprite === "runner" || e.type === "hellhound" || e.type === "runner") return [0.1, 0.07, 0.14];
    return [0.14, 0.09, 0.16]; // grunt
  }

  function enemyAtkCooldown(e) {
    if (e.isBoss) return 0.7;
    if (e.isMiniboss) return 0.65;
    if (e.sprite === "brute" || e.type === "skeleton" || e.type === "brute") return 0.95;
    if (e.sprite === "runner" || e.type === "hellhound" || e.type === "runner") return 0.4;
    return e.isElite ? 0.48 : 0.58;
  }

  function enemyMeleeRange(e) {
    const bulky = e.sprite === "brute" || e.type === "skeleton" || e.type === "brute";
    const fast = e.sprite === "runner" || e.type === "hellhound" || e.type === "runner";
    return e.r + player.r + (e.isBoss ? 18 : e.isMiniboss ? 14 : bulky ? 16 : fast ? 10 : 12);
  }

  function beginEnemyAttack(e) {
    e.atk = {
      active: true,
      phase: 0,
      t: 0,
      progress: 0,
      didHit: false,
      phaseDur: enemyAtkDurations(e),
    };
  }

  /** @returns {boolean} whether enemy may chase-move this frame */
  function updateEnemyMeleeAttack(e, dt) {
    if (!e.atk) {
      e.atk = { active: false, phase: 0, t: 0, progress: 0, didHit: false, phaseDur: enemyAtkDurations(e) };
    }

    if (!e.atk.active) {
      e.atkCd = (e.atkCd || 0) - dt;
      const d = dist(e, player);
      if (e.atkCd <= 0 && d <= enemyMeleeRange(e)) {
        beginEnemyAttack(e);
        return false; // freeze at windup start
      }
      return true;
    }

    const atk = e.atk;
    atk.t += dt;
    const dur = atk.phaseDur[atk.phase] || 0.1;
    atk.progress = clamp(atk.t / dur, 0, 1);

    // Strike frame — single hit
    if (atk.phase === 1 && !atk.didHit) {
      atk.didHit = true;
      const d = dist(e, player);
      if (d <= enemyMeleeRange(e) + 6) {
        const mul = e.isBoss ? 1.15 : e.isMiniboss ? 1.25 : (e.type === "skeleton" || e.type === "brute") ? 1.35 : 1.2;
        damagePlayer(e.dmg * mul);
        // hit spark
        for (let i = 0; i < 5; i++) {
          const a = rand(0, Math.PI * 2);
          particles.push({
            x: player.x,
            y: player.y,
            vx: Math.cos(a) * rand(40, 100),
            vy: Math.sin(a) * rand(40, 100),
            life: 0.25,
            maxLife: 0.25,
            color: e.isMiniboss ? "#c080e0" : "#ff6060",
            size: 2.5,
          });
        }
      }
      // swing fx near enemy
      aoeFx.push({
        x: e.x + (player.x - e.x) * 0.35,
        y: e.y + (player.y - e.y) * 0.35,
        r: e.r + 10,
        life: 0.15,
        maxLife: 0.15,
        color: e.isElite ? "#ffd070" : e.color,
        style: "burst",
      });
    }

    if (atk.t >= dur) {
      atk.t = 0;
      atk.progress = 0;
      atk.phase++;
      if (atk.phase > 2) {
        atk.active = false;
        atk.phase = 0;
        atk.didHit = false;
        e.atkCd = enemyAtkCooldown(e);
      }
    }

    // Move slowly on windup/recover, stop on strike
    return atk.phase !== 1;
  }

  function enemyAtkPose(e) {
    const a = e.atk;
    if (!a || !a.active) return { phase: -1, p: 0 };
    return { phase: a.phase, p: a.progress };
  }

  // ─── Class skills (disabled — no default hero skills) ────
  function tryUseSkill() {
    return; // skills removed
    if (state !== "playing") return;
    if (player.skillCd > 0) return;

    player.skillCd = player.skillCooldown;
    const power = player.skillPower;

    const shout = (text, color) => {
      floatingTexts.push({
        x: player.x, y: player.y - 28, text, life: 0.9, maxLife: 0.9, color: color || player.color, vy: -30,
      });
    };

    const aoeBurst = (x, y, range, dmgMul, color, forceCrit) => {
      aoeFx.push({ x, y, r: range, life: 0.4, maxLife: 0.4, color: color || player.color, style: "burst" });
      for (const e of enemies) {
        if (dist({ x, y }, e) <= range) {
          const crit = forceCrit || rollCrit();
          damageEnemy(e, calcDamage(player.damage * dmgMul * power, crit), crit);
        }
      }
    };

    if (player.skillId === "ringblades") {
      player.skillActive = 1.4;
      player.damageTakenMul = 0.55;
      aoeFx.push({ x: player.x, y: player.y, r: player.attackRange * 1.55, life: 1.4, maxLife: 1.4, color: player.color, style: "ring", followPlayer: true });
      aoeBurst(player.x, player.y, player.attackRange * 1.55, 2.0, "#e07070");
      shout("RING BLADES!", "#ffb0b0");
    } else if (player.skillId === "meteor" || player.skillId === "arcane_rift") {
      const spots = [{ x: player.x, y: player.y }];
      nearestEnemies(player, 2, 280).forEach((t) => spots.push({ x: t.x, y: t.y }));
      for (const s of spots) aoeBurst(s.x, s.y, 95, player.skillId === "meteor" ? 3.2 : 2.6, "#ff8040", player.skillId === "meteor");
      if (player.skillId === "arcane_rift") chainLightningStrike();
      shout(player.skillId === "meteor" ? "METEOR STRIKE!" : "ARCANE RIFT!", "#ffb070");
    } else if (player.skillId === "transfixion") {
      fireProjectileFan({ count: 12 + (player.extraProjectiles || 0) * 2, coneDeg: 50, speed: 460, pierce: 3 + (player.pierce || 0), dmgMul: 1.5 * power, color: "#b8f090" });
      shout("TRANSFIXION!", "#b8f090");
    } else if (player.skillId === "dragonbreath") {
      fireProjectileFan({ count: 10, coneDeg: 55, speed: 340, pierce: 3, style: "orb", color: "#ff6040", dmgMul: 1.4 * power, life: 0.7, r: 7 });
      shout("DRAGON'S BREATH!", "#ff8040");
    } else if (player.skillId === "radiant") {
      aoeBurst(player.x, player.y, 150, 2.4, "#f0e0a0");
      player.hp = Math.min(player.maxHp, player.hp + 20 * power);
      shout("RADIANT AURA!", "#f0e0a0");
    } else if (player.skillId === "ghostarmy") {
      fireProjectileFan({ count: 10, coneDeg: 360, speed: 220, pierce: 5, style: "orb", color: "#c080ff", dmgMul: 1.2 * power, homing: true, life: 2.5 });
      shout("GHOST ARMY!", "#c080ff");
    } else if (player.skillId === "shieldbash") {
      const bashDmg = (player.damage + (player.blockStrength || 20) * 0.5) * 2.5 * power;
      const range = 140;
      aoeFx.push({ x: player.x, y: player.y, r: range, life: 0.35, maxLife: 0.35, color: "#c0c8d8", style: "burst" });
      for (const e of enemies) {
        if (dist(player, e) <= range) {
          damageEnemy(e, bashDmg, false);
          const d = dist(player, e) || 1;
          e.x += ((e.x - player.x) / d) * 40;
          e.y += ((e.y - player.y) / d) * 40;
        }
      }
      shout("SHIELD BASH!", "#c0c8d8");
    } else if (player.skillId === "hound") {
      aoeBurst(player.x, player.y, 120, 2.2, "#d0a060");
      fireProjectileFan({ count: 6, coneDeg: 40, speed: 400, pierce: 2, dmgMul: 1.3 * power, color: "#d0a060" });
      shout("HOUND PACK!", "#d0a060");
    } else if (player.skillId === "frostnova") {
      aoeBurst(player.x, player.y, 160, 2.0, "#80c0e0");
      for (const e of enemies) {
        if (dist(player, e) < 160) e.frostSlow = 2.5;
      }
      shout("FROST NOVA!", "#80c0e0");
    } else if (player.skillId === "grenade") {
      const near = nearestEnemies(player, 3, 400);
      const spots = near.length ? near.map((t) => ({ x: t.x, y: t.y })) : [{ x: player.x + player.facing * 80, y: player.y }];
      for (const s of spots) aoeBurst(s.x, s.y, 90, 3.0, "#d4a84b");
      shout("GRENADES!", "#d4a84b");
    } else if (player.skillId === "mosh") {
      aoeBurst(player.x, player.y, 130, 2.5, "#e0a0c0");
      for (const e of enemies) {
        if (dist(player, e) < 130) {
          const d = dist(player, e) || 1;
          e.x += ((e.x - player.x) / d) * 50;
          e.y += ((e.y - player.y) / d) * 50;
        }
      }
      shout("MOSH PIT!", "#e0a0c0");
    } else if (player.skillId === "undergrowth") {
      for (let i = 0; i < 6; i++) {
        const a = (i / 6) * Math.PI * 2;
        aoeBurst(player.x + Math.cos(a) * 90, player.y + Math.sin(a) * 90, 50, 1.8, "#60a050");
      }
      shout("UNDERGROWTH!", "#60a050");
    } else if (player.skillId === "prismatic") {
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        fireProjectileFan({ count: 1, aim: a, coneDeg: 0, speed: 280, pierce: 2, style: "orb", color: ["#ff6040", "#40a0ff", "#80e0ff", "#80c040"][i % 4], dmgMul: 1.6 * power });
      }
      aoeBurst(player.x, player.y, 100, 1.5, "#50c0b0");
      shout("PRISMATIC CASCADE!", "#50c0b0");
    }
  }

  function ensureStatuses(e) {
    if (!e.st) e.st = { burn: 0, burnDps: 0, electrify: 0, decay: 0, fragile: 0, mark: 0, slow: 0 };
    return e.st;
  }

  /** Apply wiki-like status effects */
  function applyStatus(e, kind, duration, extra) {
    if (!e || e.hp <= 0) return;
    const st = ensureStatuses(e);
    const d = duration || 2.5;
    if (kind === "burn") {
      st.burn = Math.max(st.burn, d);
      st.burnDps = Math.max(st.burnDps || 0, extra || 6);
    } else if (kind === "electrify") {
      st.electrify = Math.min(10, (st.electrify || 0) + (extra || 1));
      st.electrifyT = Math.max(st.electrifyT || 0, 4);
    } else if (kind === "decay") {
      st.decay = Math.max(st.decay, d);
    } else if (kind === "fragile") {
      st.fragile = Math.max(st.fragile, d);
    } else if (kind === "mark") {
      st.mark = Math.max(st.mark, d);
    } else if (kind === "slow") {
      st.slow = Math.max(st.slow, d);
      e.frostSlow = Math.max(e.frostSlow || 0, d);
    }
  }

  function applyHitEffects(e, opts) {
    if (!e || !opts) return;
    // Effect chance uses random stacks when chance can exceed 100% (wiki)
    const tryFx = (flag, kind, dur, extra, baseChance) => {
      if (!flag) return;
      const stacks = effectChanceRoll(baseChance != null ? baseChance : 1);
      if (stacks <= 0) return;
      applyStatus(e, kind, dur, (extra || 1) * stacks);
    };
    tryFx(opts.burn || opts.weaponBurn, "burn", 3.2, (opts.burnMul || 1) * (opts.burnDps || Math.max(5, (opts.baseDmg || 10) * 0.12)), opts.burnChance != null ? opts.burnChance : 1);
    tryFx(opts.electrify || opts.weaponElectrify, "electrify", 4, 1, opts.electrifyChance != null ? opts.electrifyChance : 1);
    tryFx(opts.weaponFrost || opts.frost, "slow", 2.5, 1, opts.frostChance != null ? opts.frostChance : 1); // frost → slow stacks in proto
    tryFx(opts.decay || opts.weaponDecay, "decay", 3.5, 1, opts.decayChance != null ? opts.decayChance : 1);
    tryFx(opts.fragile, "fragile", 3, 1, opts.fragileChance != null ? opts.fragileChance : 1);
    tryFx(opts.markOnHit || opts.weaponMark || opts.mark, "mark", 4, 1, 1);
    tryFx(opts.applySlow || opts.weaponSlow, "slow", 2.2, 1, opts.slowChance || 1);
    // Blighted Indolence: Slow may also apply Decay
    if (player && player.itemBlightedIndolence && e.st && e.st.slow > 0 && Math.random() < 0.4) {
      applyStatus(e, "decay", 3.5, 1);
    }
  }

  function statusDamageMul(e) {
    const st = e.st || {};
    let m = 1;
    if (st.fragile > 0) m *= 1.2;
    if (st.decay > 0) m *= 1.12;
    if (st.mark > 0) m *= 1.1;
    return m;
  }

  function damageEnemy(e, dmg, isCritish, hitOpts) {
    if (!e || e.hp <= 0) return;
    let final = dmg * statusDamageMul(e);
    // Scars of Toil / Collar / Hunter still / Blood shirt — dynamic dmg muls
    final *= itemDamageMul(e);
    // Electrify: consume stacks for bonus burst
    if (e.st && e.st.electrify > 0) {
      final += e.st.electrify * 3.5;
      e.st.electrify = Math.max(0, e.st.electrify - 1);
    }
    if (isCritish && e.st && e.st.mark > 0) final *= 1.15;
    // Ruby Circlet: more dmg vs burning populations
    if (player && player.itemRubyCirclet) {
      let burning = 0;
      for (const o of enemies) if (o.st && o.st.burn > 0) burning++;
      final *= 1 + Math.min(0.4, burning * 0.01);
    }
    e.hp -= final;
    e.hitFlash = 0.12;
    if (hitOpts) applyHitEffects(e, Object.assign({ baseDmg: dmg }, hitOpts));
    onItemWeaponHit(e, final, isCritish, hitOpts);
    if (player) {
      player.bloodCatcherAcc = (player.bloodCatcherAcc || 0) + final;
      if (player.itemBloodWrap) player.bloodWrapCharge = Math.min(40, (player.bloodWrapCharge || 0) + final * 0.02);
      if (player.itemWarChief) player.warChiefForce = Math.min(0.5, (player.warChiefForce || 0) + final * 0.00002);
      if (player.itemTwistedChaplet && e.st && e.st.decay > 0) {
        player.maxHp += 0.02;
      }
    }
    dmg = final; // for floating text
    floatingTexts.push({
      x: e.x + rand(-6, 6),
      y: e.y - e.r,
      text: String(Math.round(dmg)),
      life: 0.6,
      maxLife: 0.6,
      color: isCritish ? "#ffe08a" : "#fff",
      vy: -40,
    });
    if (isCritish) {
      sfx("crit");
      addShake(2);
      floatingTexts.push({
        x: e.x + rand(-4, 4),
        y: e.y - e.r - 12,
        text: "CRIT",
        life: 0.45,
        maxLife: 0.45,
        color: "#ffd070",
        vy: -50,
      });
    } else if (Math.random() < 0.12) {
      sfx("hit");
    }
    if (e.isBoss) updateBossBar();
    if (e.hp <= 0) {
      killEnemy(e);
    }
  }

  function itemDamageMul(target) {
    if (!player) return 1;
    let m = potionDamageMul();
    // Mark of the Shield: Block Strength multiplies into damage
    if (player.markBlockToDamage) {
      m *= 1 + Math.min(0.8, (player.blockStrength || 0) * 0.012);
    }
    if (player.itemScarsToil && player.maxHp > 0) {
      const rate = player.scarsRate != null ? player.scarsRate : 0.001;
      m *= 1 + rate * Math.max(0, player.maxHp - player.hp);
    }
    if (player.itemCollarConf) {
      let n = 0;
      const pr = effectivePickupRange();
      for (const e of enemies) if (dist(player, e) < pr) n++;
      m *= 1 + Math.min(0.5, n * (0.5 / 30));
    }
    if (player.itemDuelistSpark) {
      let n = 0;
      const pr = effectivePickupRange();
      for (const e of enemies) if (dist(player, e) < pr) n++;
      m *= Math.max(0.5, 1 - n * 0.015);
    }
    if (player.itemHuntersGarb) {
      m *= 1 + Math.min(0.5, (player.hunterStill || 0) / 15 * 0.5);
    }
    if (player.itemBloodShirt) {
      m *= 1 + Math.min(0.35, (player.bloodShirtKills || 0) * 0.004);
    }
    if (player.madnessStacks) m *= 1 + player.madnessStacks * 0.01;
    if (player.fervorTimer > 0) m *= 2;
    if (player.itemSpellcaster && (player.spellIdle || 0) >= 2) {
      const nAb = (player.abilities || []).length || 1;
      m *= 1 + Math.min(0.66, 0.15 * nAb);
    }
    if (player.itemWarChief) m *= 1 + (player.warChiefForce || 0) * 0.5;
    if (player.itemVisionCrown) {
      if (player.moving) m *= 1.05;
      else m *= 1.08;
    }
    return m;
  }

  function onItemWeaponHit(e, dmg, isCrit, hitOpts) {
    if (!player || !e) return;
    // ── Mark combat hooks (wiki) ──
    if (player.markSparkOnCrit && isCrit && Math.random() < player.markSparkOnCrit) {
      applyHitEffects(e, { spark: true, sparkChance: 1, baseDmg: dmg });
    }
    if (player.markFrostNovaEvery) {
      player.markFrostHits = (player.markFrostHits || 0) + 1;
      if (player.markFrostHits >= player.markFrostNovaEvery) {
        player.markFrostHits = 0;
        const r = 110;
        for (const o of enemies) {
          if (o.hp <= 0) continue;
          if (dist(player, o) < r) {
            damageEnemy(o, player.damage * 0.55, false, { frost: true, frostChance: 1, baseDmg: player.damage * 0.55 });
          }
        }
        aoeFx.push({ x: player.x, y: player.y, r, life: 0.28, maxLife: 0.28, color: "#80c0e8", style: "burst" });
      }
    }
    if (player.markGrenades && Math.random() < 0.18) {
      const r = 55;
      for (const o of enemies) {
        if (o.hp <= 0 || o === e) continue;
        if (dist(e, o) < r) {
          o.hp -= dmg * 0.35;
          o.hitFlash = 0.08;
          if (o.hp <= 0) killEnemy(o);
        }
      }
      aoeFx.push({ x: e.x, y: e.y, r, life: 0.18, maxLife: 0.18, color: "#c08040", style: "burst" });
    }
    if (player.artSlowOnAttack) {
      applyHitEffects(e, { slow: true, slowChance: 1, baseDmg: dmg });
    }
    if (player.artGlobalBurn && Math.random() < player.artGlobalBurn) {
      applyHitEffects(e, { burn: true, burnChance: 1, baseDmg: dmg });
    }
    // Echoing Band shockwave
    const echoChance = player.echoChance != null ? player.echoChance : 0.2;
    const echoDmg = player.echoDmg != null ? player.echoDmg : 0.4;
    if (player.itemEchoingBand && Math.random() < echoChance) {
      const r = 70;
      const splash = dmg * echoDmg;
      for (const o of enemies) {
        if (o === e || o.hp <= 0) continue;
        if (dist(e, o) < r) {
          o.hp -= splash;
          o.hitFlash = 0.08;
          if (o.hp <= 0) killEnemy(o);
        }
      }
    }
    // Thunder Crown: chain on sparked
    if (player.itemThunderCrown && e.st && e.st.electrify > 0) {
      let hops = 0;
      let cur = e;
      const hit = new Set([e]);
      while (hops < 3) {
        let best = null;
        let bestD = 160;
        for (const o of enemies) {
          if (hit.has(o) || o.hp <= 0) continue;
          const d = dist(cur, o);
          if (d < bestD) { bestD = d; best = o; }
        }
        if (!best) break;
        hit.add(best);
        best.hp -= 40 + dmg * 0.15;
        best.hitFlash = 0.1;
        applyStatus(best, "electrify", 3, 1);
        if (best.hp <= 0) killEnemy(best);
        cur = best;
        hops++;
      }
    }
    // Sparking Tips
    if (player.itemSparkingTips && e.st && e.st.burn > 0 && Math.random() < 0.12) {
      for (const o of enemies) {
        if (o === e || o.hp <= 0) continue;
        if (dist(e, o) < 90) {
          o.hp -= Math.max(8, dmg * 0.25);
          applyStatus(o, "burn", 2, 5);
          if (o.hp <= 0) killEnemy(o);
        }
      }
    }
    // Frost Thorns
    if (player.itemFrostThorns && e.st && e.st.slow > 0 && Math.random() < 0.12) {
      e.hp -= 25 + (e.st.slow || 1) * 8;
      if (e.hp <= 0) killEnemy(e);
    }
    // Leeching Fingers
    if (player.itemLeechFingers && e.st && e.st.decay > 0) {
      e.st.decay *= 0.9;
      player.hp = Math.min(player.maxHp, player.hp + 1);
    }
    // Elemental Resonator
    if (player.itemElemResonator && Math.random() < 0.08) {
      if (e.st && e.st.burn > 0) applyStatus(e, "burn", 2, 4);
      if (e.st && e.st.electrify > 0) applyStatus(e, "electrify", 2, 1);
      if (e.st && e.st.slow > 0) applyStatus(e, "slow", 2, 1);
    }
  }

  function killEnemy(e) {
    kills++;
    if (e.isBoss) { sfx("boss"); addShake(12); }
    else if (e.isChampion) { sfx("champ"); addShake(5); }
    else if (e.isMiniboss || e.isElite) { sfx("kill"); addShake(3); }
    else if (Math.random() < 0.25) sfx("kill");
    // Item on-kill
    if (player) {
      if (player.itemWindCrown) player.windCharges = Math.min(80, (player.windCharges || 0) + 1);
      if (player.itemAlchGoggles) player.elemPotency = Math.min(2, (player.elemPotency || 1) + 0.002);
      if (player.itemBloodShirt) {
        player.bloodShirtKills = (player.bloodShirtKills || 0) + 1;
        if (Math.random() < 0.08) player.hp = Math.min(player.maxHp, player.hp + 1);
      }
    }
    // Torment Shards (hard modes only)
    if (isHardModeRun()) {
      let sh = e.isBoss ? 8 : e.isChampion ? 3 : e.isMiniboss ? 2 : e.isElite ? 0.35 : 0.04;
      if (playMode === "torment") sh *= 1 + (tormentLevel || 1) * 0.08;
      sh *= getDiffMods().shardMul || 1;
      if (sh >= 1 || Math.random() < sh) {
        const gain = Math.max(1, Math.round(sh));
        runShards += gain;
        if (e.isBoss || e.isChampion || e.isMiniboss || Math.random() < 0.15) {
          floatingTexts.push({
            x: e.x, y: e.y - e.r - 20,
            text: `+${gain} Shard`, life: 0.9, maxLife: 0.9, color: "#c080e0", vy: -28,
          });
        }
      }
    }
    // Gold drop
    const gf = player.goldFind || 1;
    let goldAmt = Math.max(1, Math.round((e.isBoss ? 80 : e.isMiniboss ? 25 : e.isChampion ? 18 : e.isElite ? 8 : 2 + Math.random() * 3) * gf));
    if (Math.random() < (e.isBoss ? 1 : e.isMiniboss ? 0.9 : e.isChampion ? 0.85 : e.isElite ? 0.55 : 0.22)) {
      spawnGold(e.x, e.y, goldAmt);
    }
    // Urn of the Damned — ghost on kill
    if (player && player.artGhostOnKill && Math.random() < player.artGhostOnKill) {
      enemies.push({
        type: "ghost_curse", name: "Damned Ghost", x: e.x, y: e.y, r: 12,
        hp: 40, maxHp: 40, dmg: 8, speed: 140, color: "#90a0c8",
        xp: 0, facing: 1, hitFlash: 0, aiKind: "chaser", life: 4, isGhost: true,
      });
    }
    // Bog Totem invasion
    if (player && player.artBogEvery) {
      player._bogKills = (player._bogKills || 0) + 1;
      if (player._bogKills >= player.artBogEvery) {
        player._bogKills = 0;
        for (let i = 0; i < 12; i++) {
          spawnEnemy("slime", 1.1, { elite: i < 2 });
        }
        floatingTexts.push({
          x: player.x, y: player.y - 50, text: "Bog Invasion!", life: 1.4, maxLife: 1.4, color: "#508040", vy: -20,
        });
      }
    }
    // Face of Regret stacks
    if (player && player.artRegret) {
      player._regretKills = (player._regretKills || 0) + 1;
      if (player._regretKills >= 100) {
        player._regretKills = 0;
        player.attackCooldown *= 1.002;
        player.force = Math.max(0.2, (player.force || 1) - 0.002);
      }
    }
    // Chest: elite / champion / miniboss / boss
    if (e.isBoss || e.isChampion || (e.isMiniboss && Math.random() < 0.55) || (e.isElite && Math.random() < 0.22)) {
      spawnChest(e.x + rand(-20, 20), e.y + rand(-20, 20), e.isBoss ? 3 : (e.isChampion || e.isMiniboss) ? 2 : 1);
    }
    // Slime split
    if (e.aiKind === "slime" && !e.isMiniboss && !e.isBoss && e.r > 10 && Math.random() < 0.55) {
      for (let i = 0; i < 2; i++) {
        const child = spawnEnemy(e.type, 0.55, {
          elite: false,
          pos: { x: e.x + rand(-20, 20), y: e.y + rand(-20, 20) },
        });
        if (child) {
          child.r = Math.max(8, e.r * 0.55);
          child.hp = Math.max(8, e.maxHp * 0.35);
          child.maxHp = child.hp;
          child.xp = Math.max(1, Math.round(e.xp * 0.25));
        }
      }
    }
    if (e.isElite || e.isMiniboss) {
      if (Math.random() < 0.45) spawnTome(e.x, e.y);
    }
    const gemValue = e.xp;
    const gemR = e.isBoss ? 14 : e.isMiniboss ? 10 : e.isElite ? 8 : 6;
    // One gem carrying full XP (multipliers already in e.xp)
    xpGems.push({
      x: e.x,
      y: e.y,
      r: gemR,
      value: gemValue,
      vx: rand(-30, 30),
      vy: rand(-30, 30),
      life: 14,
      magnet: false,
      premium: e.isElite || e.isMiniboss || e.isBoss,
    });
    // Visual extra gems (tiny XP crumbs — main payout is the primary gem)
    const extraGems = e.isBoss ? 6 : e.isMiniboss ? 3 : e.isElite ? 2 : 0;
    for (let i = 0; i < extraGems; i++) {
      xpGems.push({
        x: e.x + rand(-40, 40),
        y: e.y + rand(-40, 40),
        r: e.isBoss ? 7 : 5,
        value: 1,
        vx: rand(-50, 50),
        vy: rand(-50, 50),
        life: 14,
        magnet: false,
        premium: true,
      });
    }
    const burst = e.isBoss ? 28 : e.isMiniboss ? 18 : e.isElite ? 12 : 6;
    for (let i = 0; i < burst; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: e.x,
        y: e.y,
        vx: Math.cos(a) * rand(40, e.isBoss ? 200 : 140),
        vy: Math.sin(a) * rand(40, e.isBoss ? 200 : 140),
        life: 0.5,
        maxLife: 0.5,
        color: e.isElite ? "#ffd070" : e.color,
        size: rand(2, e.isBoss ? 8 : 5),
      });
    }
    if (e.isElite || e.isMiniboss) {
      floatingTexts.push({
        x: e.x,
        y: e.y - e.r - 12,
        text: e.isMiniboss ? `+${gemValue} XP` : `ELITE +${gemValue}`,
        life: 1.0,
        maxLife: 1.0,
        color: e.isMiniboss ? "#d0a0ff" : "#ffd070",
        vy: -35,
      });
    }
    const idx = enemies.indexOf(e);
    if (idx >= 0) enemies.splice(idx, 1);
    if (e.isBoss) {
      boss = null;
      el.bossBarWrap.classList.add("hidden");
      endGame(true);
    }
  }

  function damagePlayer(amount, sourceEnemy) {
    if (player.invuln > 0) return;
    let incoming = amount * (player.damageTakenMul || 1);

    // Maiden's Tear: negate one hit when charged
    if (player.itemMaidenTear && (player.maidenCharge || 0) >= 30) {
      player.maidenCharge = 0;
      player.invuln = 0.35;
      floatingTexts.push({
        x: player.x, y: player.y - 28,
        text: "TEAR", life: 0.7, maxLife: 0.7, color: "#a0d0ff", vy: -40,
      });
      return;
    }

    // Elven slippers / defiant — block strength bonuses applied via blockStrength already
    let blockStr = player.blockStrength || 0;
    if (player.itemElvenSlippers && player.moving) blockStr += 8;
    if (player.itemDefiantPlate) blockStr += Math.min(30, (player.defiantStacks || 0) * 1.5);

    if (player.potionIron > 0) {
      blockStr += player.potionIronBlk || 15;
    }
    // 1) Block (wiki): full negate
    if (rollBlock(blockStr, incoming)) {
      sfx("block");
      floatingTexts.push({
        x: player.x, y: player.y - 24,
        text: "BLOCK", life: 0.55, maxLife: 0.55, color: "#a0c0e0", vy: -35,
      });
      player.invuln = 0.15;
      if (player.itemFencingGauntlets && Math.random() < 0.5) {
        // free crit swing feel: damage nearest
        let best = null;
        let bestD = player.attackRange * 1.4;
        for (const e of enemies) {
          const d = dist(player, e);
          if (d < bestD) { bestD = d; best = e; }
        }
        if (best) damageEnemy(best, player.damage * 1.2, true, weaponHitOpts());
      }
      if (sourceEnemy && player.thorns > 0 && sourceEnemy.hp > 0) {
        damageEnemy(sourceEnemy, player.thorns, false);
      }
      return;
    }

    // 2) Defense DR (wiki formula); min damage 1
    let def = player.defense || 0;
    if (player.potionIron > 0) def += player.potionIronDef || 20;
    if (player.itemDefiantPlate) def += Math.min(30, (player.defiantStacks || 0) * 1.5);
    const dr = defenseReduction(def);
    const final = Math.max(1, incoming * (1 - dr));
    player.hp -= final;
    player.invuln = 0.4;
    sfx("hurt");
    addShake(6 + Math.min(8, final * 0.15));

    // Item on-hurt
    if (player.itemDefiantPlate) {
      player.defiantStacks = Math.min(20, (player.defiantStacks || 0) + 1);
      player.defiantTimer = 10;
    }
    if (player.itemBlazingShell && sourceEnemy && Math.random() < 0.5) {
      applyStatus(sourceEnemy, "burn", 3, 8);
    }
    if (player.itemBloodWrap && (player.bloodWrapCharge || 0) > 0) {
      const heal = Math.min(25, player.bloodWrapCharge);
      player.hp = Math.min(player.maxHp, player.hp + heal);
      player.bloodWrapCharge = 0;
    }
    if (player.itemThornfists && sourceEnemy && sourceEnemy.hp > 0) {
      damageEnemy(sourceEnemy, player.damage * (1 + 3 * (player.critBonus || 0.5)), true);
    }
    if (player.itemSpikeBoots && (player.spikeCd || 0) <= 0) {
      player.spikeCd = 4;
      spawnSpikeBurst(player.x, player.y);
    }

    if (sourceEnemy && player.thorns > 0 && sourceEnemy.hp > 0) {
      damageEnemy(sourceEnemy, player.thorns, false);
    }
    for (let i = 0; i < 5; i++) {
      particles.push({
        x: player.x, y: player.y,
        vx: rand(-80, 80), vy: rand(-80, 80),
        life: 0.35, maxLife: 0.35, color: "#c23b3b", size: 3,
      });
    }
    if (player.hp <= 0) {
      // Seal of Rebirth
      if (player.itemSealRebirth && (player.sealCharges || 0) > 0) {
        player.sealCharges -= 1;
        player.hp = Math.round(player.maxHp * 0.5);
        player.invuln = 1.5;
        floatingTexts.push({
          x: player.x, y: player.y - 40,
          text: "REVIVE", life: 1.4, maxLife: 1.4, color: "#f0e0a0", vy: -30,
        });
        showBanner("SEAL OF REBIRTH", "You rise again", 1.8);
        return;
      }
      player.hp = 0;
      endGame(false);
    }
  }

  function spawnSpikeBurst(x, y) {
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      itemPatches.push({
        kind: "spike", x: x + Math.cos(a) * 28, y: y + Math.sin(a) * 28,
        r: 10, life: 2.2, dmg: 40, stun: true, color: "#c0b0a0",
      });
    }
  }

  function gainXp(amount) {
    const diffXp = getDiffMods().xpMul || 1;
    // Late-run XP boost for long runs (build comes online)
    const progress = RUN_DURATION_SEC > 0 ? clamp(elapsed / RUN_DURATION_SEC, 0, 1) : 0;
    const late = 1 + (BALANCE.lateXpBoost || 0) * progress * progress;
    player.xp += amount * (BALANCE.xpMul || 1) * (player.xpGain || 1) * diffXp * late;
    while (player.xp >= player.xpNext) {
      player.xp -= player.xpNext;
      player.level++;
      player.xpNext = xpForLevel(player.level);
      onPlayerLevelUp();
      openLevelUp();
    }
  }

  /** Rare Growth packages + artifact level taxes */
  function onPlayerLevelUp() {
    if (!player) return;
    // Master's Vice: −1 max HP per level
    if (player.artLevelHpTax) {
      player.maxHp = Math.max(20, player.maxHp - (player.artLevelHpTax | 0));
      player.hp = Math.min(player.hp, player.maxHp);
    }
    // Hardening Targe: enemies gain block (stored for spawn)
    if (player._artFlags && player._artFlags.flagEnemyBlockOnLevel) {
      player._enemyBlockBonus = (player._enemyBlockBonus || 0) + 2;
    }
    // Item Growth (Rare packages)
    applyItemGrowthTick(player);
    // Mark of Incineration: burn chance scales with levels
    if (player.markBurnScales) {
      player.weaponBurnChance = (player.weaponBurnChance || 0) + 0.002;
    }
  }

  function applyItemGrowthTick(p) {
    if (!p || !p.itemGrowth || !p.itemGrowth.length) return;
    const lv = p.level || 1;
    for (const g of p.itemGrowth) {
      const every = g.every || 10;
      // every:1 each level; every:N when level is multiple of N
      if (every > 1 && lv % every !== 0) continue;
      if (g.defense) p.defense = (p.defense || 0) + g.defense;
      if (g.block) p.blockStrength = (p.blockStrength || 0) + g.block;
      if (g.damage) p.damage += g.damage;
      if (g.maxHp) { p.maxHp += g.maxHp; p.hp = Math.min(p.maxHp, p.hp + g.maxHp); }
      if (g.regen) p.regen = (p.regen || 0) + g.regen;
      if (g.force) p.force = (p.force || 1) + g.force;
      if (g.critChance) p.critChance = Math.min(0.95, (p.critChance || 0.1) + g.critChance);
      if (g.critBonus) p.critBonus = (p.critBonus || 0.5) + g.critBonus;
      if (g.multistrike) p.multistrike = (p.multistrike || 1) + g.multistrike;
      if (g.thorns) p.thorns = (p.thorns || 0) + g.thorns;
      if (g.effectChance) p.effectChance = (p.effectChance || 0) + g.effectChance;
      if (g.burnChance) p.weaponBurnChance = (p.weaponBurnChance || 0) + g.burnChance;
      if (g.sparkChance) p.weaponSparkChance = (p.weaponSparkChance || 0) + g.sparkChance;
      if (g.frostChance) p.weaponFrostChance = (p.weaponFrostChance || 0) + g.frostChance;
      if (g.decayChance) p.weaponDecayChance = (p.weaponDecayChance || 0) + g.decayChance;
      if (g.speedMul) p.speed *= g.speedMul;
      if (g.damageMul) p.damage *= g.damageMul;
      if (g.xpGainMul) p.xpGain = (p.xpGain || 1) * g.xpGainMul;
      if (g.abilityDmgMul) p.abilityDmgMul = (p.abilityDmgMul || 1) * g.abilityDmgMul;
      if (g.summonDmgMul) p.summonDmgMul = (p.summonDmgMul || 1) * g.summonDmgMul;
      if (g.summonCountMul) p.summonCountMul = (p.summonCountMul || 1) * g.summonCountMul;
      if (g.pickupMul) p.pickupRange = (p.pickupRange || 80) * g.pickupMul;
      if (g.aspMul) p.attackCooldown /= g.aspMul;
      if (g.elemPotency) p.elemPotency = (p.elemPotency || 1) + g.elemPotency;
      if (g.collarCap) p.collarCap = (p.collarCap || 0.5) + g.collarCap;
      if (g.scarsRate) p.scarsRate = (p.scarsRate || 0.001) + g.scarsRate;
      if (g.echoDmg) p.echoDmg = (p.echoDmg || 0.4) + g.echoDmg;
      if (g.holyHeal) p.holyHeal = (p.holyHeal || 50) + g.holyHeal;
      if (g.range) p.attackRange = (p.attackRange || 100) * (1 + g.range);
      if (g.burnDmg) p.burnDmgMul = (p.burnDmgMul || 1) + g.burnDmg;
      if (g.frostDmgMul) p.frostDmgMul = (p.frostDmgMul || 1) * g.frostDmgMul;
    }
  }

  function updateBossBar() {
    if (!boss) return;
    el.bossFill.style.width = `${clamp((boss.hp / boss.maxHp) * 100, 0, 100)}%`;
  }

  // ─── Time-based hall run (5 min → boss) ──────────────────
  function formatTime(sec) {
    const s = Math.max(0, Math.ceil(sec));
    const m = (s / 60) | 0;
    const r = s % 60;
    return `${m}:${r < 10 ? "0" : ""}${r}`;
  }

  function pickHallEnemyType() {
    const list = (currentHall && currentHall.enemies) || ["imp"];
    if (!list.length) return "imp";
    const weights = (currentHall && currentHall.enemyWeights) || null;
    const p = runProgress();
    // Early run: prefer first half of roster (fodder)
    let pool = list;
    let w = weights;
    if (p < 0.22 && list.length > 3) {
      pool = list.slice(0, Math.max(3, (list.length / 2) | 0));
      w = weights ? weights.slice(0, pool.length) : null;
    } else if (p < 0.5 && list.length > 4) {
      pool = list.slice(0, Math.max(4, list.length - 2));
      w = weights ? weights.slice(0, pool.length) : null;
    }
    if (!w || w.length !== pool.length) {
      return pool[(Math.random() * pool.length) | 0];
    }
    let sum = 0;
    for (const x of w) sum += x;
    let r = Math.random() * sum;
    for (let i = 0; i < pool.length; i++) {
      r -= w[i];
      if (r <= 0) return pool[i];
    }
    return pool[pool.length - 1];
  }

  function startHallRun() {
    phase = "intro";
    phaseTimer = 2.4;
    spawnTimer = 0.6;
    minibossSpawned = [];
    championTimer = getDiffMods().champInterval * (isHardModeRun() ? 0.55 : 1.2);
    const name = currentHall ? currentHall.name : "Hall";
    const blurb = currentHall ? currentHall.blurb : "Run";
    const mode = diffLabel();
    const sub = isBoglandsRun()
      ? `${blurb} · Boss @ ${bogKillTarget()} kills · ${mode}`
      : playMode === "torment"
        ? `RANDOM · ${formatTime(RUN_DURATION_SEC)} · ${mode}`
        : `${blurb} · ${formatTime(RUN_DURATION_SEC)} · ${mode}`;
    showBanner(playMode === "torment" ? `TORMENT · ${name}` : name, sub);
    updateHud();
  }

  function spawnChampion() {
    if (!isHardModeRun()) return;
    const type = pickHallEnemyType();
    const e = spawnEnemy(type, hallStrengthAt(runProgress()) * 1.15, { champion: true, elite: true });
    if (e) {
      showBanner("CHAMPION", e.name, 1.8);
      sfx("champ");
      addShake(4);
      floatingTexts.push({
        x: e.x, y: e.y - 30, text: "CHAMPION", life: 1.2, maxLife: 1.2, color: "#ffe060", vy: -25,
      });
    }
  }

  function startBossPhase() {
    // Clear all trash before the Lord arrives
    clearAllNonBossEnemies();
    phase = "boss_announce";
    phaseTimer = 2.8;
    const bName = (currentHall && currentHall.boss && currentHall.boss.name) || "Lord";
    showBanner("BOSS", `${bName} thức tỉnh`);
    sfx("boss");
    addShake(8);
    updateHud();
  }

  function spawnIntervalForProgress(p) {
    const sp = (currentHall && currentHall.spawn) || { baseInterval: 1.3, minInterval: 0.32, burstBase: 1 };
    let iv = sp.baseInterval + (sp.minInterval - sp.baseInterval) * clamp(p, 0, 1);
    if (p < 0.2) iv *= (BALANCE.earlySpawnEase || 1);
    // Agony/Torment: more monsters = shorter interval
    const sm = getDiffMods().spawnMul || 1;
    iv /= Math.max(0.55, Math.min(2.2, sm));
    return iv;
  }

  function spawnBurstCount(p) {
    const sp = (currentHall && currentHall.spawn) || { burstBase: 1 };
    const base = sp.burstBase || 1;
    // 1 early → 2–4 late
    return Math.min(4, base + Math.floor(p * 3 + Math.random() * (p > 0.6 ? 1.5 : 0.5)));
  }

  // ─── Screens ─────────────────────────────────────────────
  function showScreen(name) {
    el.menu.classList.add("hidden");
    el.gameWrap.classList.add("hidden");
    el.levelup.classList.add("hidden");
    if (el.abilityPick) el.abilityPick.classList.add("hidden");
    el.pause.classList.add("hidden");
    el.end.classList.add("hidden");
    if (el.wellOverlay) el.wellOverlay.classList.add("hidden");

    if (name === "menu") el.menu.classList.remove("hidden");
    if (name === "game") el.gameWrap.classList.remove("hidden");
    if (name === "levelup") {
      el.gameWrap.classList.remove("hidden");
      el.levelup.classList.remove("hidden");
    }
    if (name === "ability") {
      el.gameWrap.classList.remove("hidden");
      if (el.abilityPick) el.abilityPick.classList.remove("hidden");
    }
    if (name === "pause") {
      el.gameWrap.classList.remove("hidden");
      el.pause.classList.remove("hidden");
    }
    if (name === "end") {
      el.gameWrap.classList.remove("hidden");
      el.end.classList.remove("hidden");
    }
    if (name === "well") {
      el.gameWrap.classList.remove("hidden");
      if (el.wellOverlay) el.wellOverlay.classList.remove("hidden");
    }
  }

  function startGame(classId, hallId) {
    selectedClass = classId;
    playMode = pendingMode === "torment" ? "torment" : "hall";

    // Torment: random hall; Hall mode: player pick
    if (playMode === "torment") {
      selectedHallId = pickRandomHallId();
      // Force locked progression — cannot start locked levels
      clampPendingTormentLevel();
      tormentLevel = Math.max(1, Math.min(maxUnlockedTormentLevel(), pendingTormentLevel || 1));
      pendingTormentLevel = tormentLevel;
      tormentRank = tormentLevel;
      agonyEnabled = false;
      agonyRank = 0;
      agonyMeter = 0;
      // Artifacts: all unlocked, player pick before run
      activeArtifacts = (pendingArtifacts || []).filter((id) => ARTIFACTS[id]).slice();
    } else {
      selectedHallId = hallId || selectedHallId || pendingHallId || HALL_ORDER[0] || "haunted_caverns";
      tormentLevel = 0;
      tormentRank = 0;
      agonyEnabled = !!pendingAgony;
      agonyRank = 0;
      agonyMeter = 0;
      activeArtifacts = [];
    }
    currentHall = HALLS[selectedHallId] || DATA.HALL || HALLS.haunted_caverns || null;

    // Duration + difficulty from menu
    const dur = findDuration(pendingDurationId);
    RUN_DURATION_SEC = dur.sec;
    runShards = 0;
    wellHealedThisRun = false;
    wellInteractCd = 0;

    player = createPlayer(classId);
    player.abilities = [];
    player.traitRanks = Object.create(null);
    player.items = [];

    // E/F: permanent Blessings + Shard shop + Well loadout (all always available)
    applyMetaBonuses(player);
    equipLoadout(player, meta.loadout || []);

    // Artifact player mods (wiki flags + muls)
    const dm = getDiffMods();
    applyArtifactPlayerMods(player, dm);
    // Hastening Sands: cut run clock
    if (dm.runTimeCutSec > 0) {
      RUN_DURATION_SEC = Math.max(60, RUN_DURATION_SEC - dm.runTimeCutSec);
    }

    // Agony Spark: start with partial meter (Hall + Agony only)
    if (playMode === "hall" && agonyEnabled) {
      const spark = (meta.shardUpgrades && meta.shardUpgrades.agony_start) || 0;
      const per = (SHARD_SHOP.agony_start && SHARD_SHOP.agony_start.agonyMeterPerRank) || 0.12;
      agonyMeter = clamp(spark * per, 0, 0.99);
    }

    enemies = [];
    projectiles = [];
    enemyShots = [];
    xpGems = [];
    particles = [];
    floatingTexts = [];
    aoeFx = [];
    tomes = [];
    summons = [];
    abilityFx = [];
    goldCoins = [];
    chests = [];
    wells = [];
    itemPatches = [];
    barrels = [];
    potionDrops = [];
    barrelSpawnTimer = 8;
    kills = 0;
    gold = 0;
    abilityTraitPicks = 0;
    pendingForceAbilityUpgrade = false;
    elapsed = 0;
    slashFx = null;
    boss = null;
    spawnTimer = 0.6;
    minibossSpawned = [];
    el.bossBarWrap.classList.add("hidden");
    hideBanner();
    camera.x = player.x - W / 2;
    camera.y = player.y - H / 2;
    state = "playing";
    el.className.textContent = player.name;
    if (el.skillName) el.skillName.textContent = "—";
    showScreen("game");
    startHallRun();
    spawnWell(player.x - 90, player.y + 40);
    // Starter barrels around spawn
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      spawnBarrel(player.x + Math.cos(a) * 160, player.y + Math.sin(a) * 120);
    }
    updateHud();
    updateAbilityHud();
    updateItemHud();
    spawnTome(player.x + 80, player.y - 40, true);
    lastTs = performance.now();
    cancelAnimationFrame(animId);
    animId = requestAnimationFrame(loop);
  }

  /** Apply permanent Blessings + Shard upgrades + Marks to player */
  function applyMetaBonuses(p) {
    if (!p) return;
    const bl = meta.blessings || {};
    for (const id of BLESSING_ORDER) {
      const rank = bl[id] || 0;
      if (rank > 0 && BLESSINGS[id] && BLESSINGS[id].apply) {
        BLESSINGS[id].apply(p, rank);
      }
    }
    const su = meta.shardUpgrades || {};
    for (const id of SHARD_SHOP_ORDER) {
      const rank = su[id] || 0;
      if (rank > 0 && SHARD_SHOP[id] && SHARD_SHOP[id].apply) {
        SHARD_SHOP[id].apply(p, rank);
      }
    }
    // Equipped mark (any hero can equip any owned mark — wiki)
    const mid = meta.activeMark || null;
    if (mid && meta.ownedMarks && meta.ownedMarks[mid] && MARKS[mid] && MARKS[mid].apply) {
      MARKS[mid].apply(p);
      // Same-hero equip: soft synergy
      if (mid === p.classId) {
        p.damage *= 1.03;
        p.defense = (p.defense || 0) + 2;
      }
    }
  }

  /** UI toast (menu + game) */
  function toast(msg, kind, ms) {
    const host = document.getElementById("toast-host");
    if (!host || !msg) return;
    const elT = document.createElement("div");
    elT.className = "toast" + (kind ? " " + kind : "");
    elT.textContent = msg;
    host.appendChild(elT);
    const life = ms != null ? ms : 2200;
    setTimeout(() => {
      elT.style.opacity = "0";
      elT.style.transition = "opacity 0.25s";
      setTimeout(() => { if (elT.parentNode) elT.parentNode.removeChild(elT); }, 280);
    }, life);
  }

  function buyMark(id) {
    const m = MARKS[id];
    if (!m) return false;
    meta.ownedMarks = meta.ownedMarks || {};
    if (meta.ownedMarks[id]) return false;
    const cost = m.cost || 600;
    if ((meta.gold || 0) < cost) {
      toast("Không đủ Gold", "bad");
      return false;
    }
    meta.gold -= cost;
    meta.ownedMarks[id] = true;
    // Auto-equip if none equipped
    if (!meta.activeMark) meta.activeMark = id;
    saveMeta();
    rebuildCampUI();
    updateMetaBar();
    updateStartButton();
    sfx("ui");
    toast(`Mua ${m.name}`, "mark");
    return true;
  }

  function equipMark(id) {
    meta.ownedMarks = meta.ownedMarks || {};
    if (!meta.ownedMarks[id] || !MARKS[id]) return false;
    const was = meta.activeMark === id;
    meta.activeMark = was ? null : id;
    saveMeta();
    rebuildCampUI();
    if (typeof updateHeroStatPanel === "function") updateHeroStatPanel();
    updateStartButton();
    sfx("ui");
    toast(was ? `Unequip ${MARKS[id].name}` : `Equip ${MARKS[id].name}`, "mark");
    return true;
  }

  // ─── Item entry helpers (support string id or {id, rarity}) ──
  function itemIdOf(entry) {
    if (!entry) return null;
    return typeof entry === "string" ? entry : entry.id;
  }
  function itemRarityOf(entry) {
    if (!entry) return "common";
    if (typeof entry === "string") return "common";
    return entry.rarity || "common";
  }
  function makeItemEntry(id, rarity) {
    return { id, rarity: rarity || "common" };
  }
  function rarityMul(rarity) {
    const r = ITEM_RARITY[rarity] || ITEM_RARITY.common;
    return (r && r.mul) || 1;
  }
  function rarityMeta(rarity) {
    return ITEM_RARITY[rarity] || ITEM_RARITY.common || { label: "Common", color: "#a0a8b0", mul: 1 };
  }

  /** Item description for UI including Uncommon/Rare separate effects */
  function itemDescFor(def, rarity) {
    if (!def) return "";
    if (rarity === "uncommon" && def.descUncommon) return def.descUncommon;
    if (rarity === "rare" && def.descRare) return def.descRare;
    if (rarity === "uncommon" && def.uncommon && def.uncommon.desc) {
      return (def.desc || "") + " · [U] " + def.uncommon.desc;
    }
    if (rarity === "rare" && def.rare && def.rare.desc) {
      return (def.desc || "") + " · [R] " + def.rare.desc;
    }
    return def.desc || "";
  }

  /**
   * Apply item: Common base + separate Uncommon/Rare packages (wiki Boost/Growth).
   * No longer pure stat ×mul — each rarity has its own effect package.
   */
  function applyItemDef(def, p, rarity) {
    if (!def || !def.apply) return;
    def.apply(p);
    if (rarity === "uncommon" && def.uncommon && typeof def.uncommon.apply === "function") {
      def.uncommon.apply(p);
    } else if (rarity === "rare" && def.rare && typeof def.rare.apply === "function") {
      def.rare.apply(p);
    } else if (rarity && rarity !== "common") {
      // Fallback for items without packages: light slot extras only
      applyRarityExtras(def, p, rarity);
    }
    if (p.hp > p.maxHp) p.hp = p.maxHp;
  }

  function applyRarityExtras(def, p, rarity) {
    if (!def || rarity === "common") return;
    const u = rarity === "uncommon";
    const r = rarity === "rare";
    if (u) {
      if (def.slot === "ring") p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.03);
      if (def.slot === "gloves") p.attackCooldown /= 1.04;
      if (def.slot === "boots") p.speed *= 1.04;
      if (def.slot === "chest" || def.slot === "helmet") p.defense = (p.defense || 0) + 3;
      if (def.slot === "amulet") p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.06;
    }
    if (r) {
      if (def.slot === "ring") {
        p.critBonus = (p.critBonus || 0.5) + 0.1;
        p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.05);
      }
      if (def.slot === "gloves") {
        p.multistrike = (p.multistrike || 1) + 0.12;
        p.attackCooldown /= 1.07;
      }
      if (def.slot === "boots") p.speed *= 1.07;
      if (def.slot === "chest") { p.maxHp = Math.round(p.maxHp * 1.06); p.hp = Math.min(p.maxHp, p.hp + 12); }
      if (def.slot === "helmet") p.blockStrength = (p.blockStrength || 0) + 5;
      if (def.slot === "amulet") {
        p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.12;
        p.xpGain = (p.xpGain || 1) * 1.06;
      }
      // Rare Growth hook seed
      p.itemGrowth = p.itemGrowth || [];
      p.itemGrowth.push({ every: 15, damage: 1 });
    }
  }

  function rollItemRarity(chestRarity) {
    // chestRarity: 1 normal, 2 rare/elite, 3 boss
    const tr = playMode === "torment" ? (tormentLevel || 1) : (agonyEnabled ? agonyRank : 0);
    let u = 0.18 + tr * ((TORMENT_CFG.uncommonItemPerRank) || 0.05);
    let r = 0.04 + tr * ((TORMENT_CFG.rareItemPerRank) || 0.04);
    if (chestRarity >= 3) { u = 0.35 + tr * 0.03; r = 0.35 + tr * 0.05; }
    else if (chestRarity >= 2) { u = 0.35 + tr * 0.04; r = 0.15 + tr * 0.04; }
    u = Math.min(0.55, u);
    r = Math.min(0.45, r);
    const roll = Math.random();
    if (roll < r) return "rare";
    if (roll < r + u) return "uncommon";
    return "common";
  }

  function equipLoadout(p, loadout) {
    if (!p) return;
    p.items = [];
    const counts = Object.create(null);
    for (const raw of loadout || []) {
      const id = itemIdOf(raw);
      const rarity = itemRarityOf(raw) || "common";
      const def = ITEMS[id];
      if (!def) continue;
      const slot = def.slot || "ring";
      const lim = slotLimit(slot);
      counts[slot] = counts[slot] || 0;
      if (counts[slot] >= lim) continue;
      if (p.items.some((e) => itemIdOf(e) === id) && slot !== "ring") continue;
      counts[slot]++;
      p.items.push(makeItemEntry(id, rarity));
      applyItemDef(def, p, rarity);
    }
  }

  function blessingDiscountMul() {
    const rank = (meta.shardUpgrades && meta.shardUpgrades.blessing_discount) || 0;
    const per = (SHARD_SHOP.blessing_discount && SHARD_SHOP.blessing_discount.discountPerRank) || 0.08;
    return Math.max(0.4, 1 - rank * per);
  }

  function blessingNextCost(id) {
    const b = BLESSINGS[id];
    if (!b) return 0;
    const rank = (meta.blessings && meta.blessings[id]) || 0;
    if (rank >= (b.maxRank || 5)) return 0;
    const base = (b.costs && b.costs[rank]) || 200 * (rank + 1);
    return Math.max(1, Math.round(base * blessingDiscountMul()));
  }

  function buyBlessing(id) {
    const b = BLESSINGS[id];
    if (!b) return false;
    meta.blessings = meta.blessings || {};
    const rank = meta.blessings[id] || 0;
    if (rank >= (b.maxRank || 5)) return false;
    const cost = blessingNextCost(id);
    if ((meta.gold || 0) < cost) {
      toast("Không đủ Gold", "bad");
      return false;
    }
    meta.gold -= cost;
    meta.blessings[id] = rank + 1;
    saveMeta();
    rebuildCampUI();
    updateMetaBar();
    toast(`${b.name} · rank ${rank + 1}`, "good");
    return true;
  }

  function refundAllBlessings() {
    let back = 0;
    const bl = meta.blessings || {};
    for (const id of BLESSING_ORDER) {
      const b = BLESSINGS[id];
      const rank = bl[id] || 0;
      if (!b || rank <= 0) continue;
      for (let r = 0; r < rank; r++) {
        const base = (b.costs && b.costs[r]) || 200 * (r + 1);
        back += Math.round(base * blessingDiscountMul());
      }
    }
    meta.blessings = {};
    meta.gold = (meta.gold || 0) + back;
    saveMeta();
    rebuildCampUI();
    updateMetaBar();
    if (back > 0) toast(`Refund +${back}G`, "good");
    return back;
  }

  function buyShardUpgrade(id) {
    const s = SHARD_SHOP[id];
    if (!s) return false;
    meta.shardUpgrades = meta.shardUpgrades || {};
    const rank = meta.shardUpgrades[id] || 0;
    if (rank >= (s.maxRank || 5)) return false;
    const cost = (s.costs && s.costs[rank]) || 5 * (rank + 1);
    if ((meta.shards || 0) < cost) {
      toast("Không đủ Shards", "bad");
      return false;
    }
    meta.shards -= cost;
    meta.shardUpgrades[id] = rank + 1;
    saveMeta();
    rebuildCampUI();
    updateMetaBar();
    toast(`${s.name} · rank ${rank + 1}`, "good");
    return true;
  }

  function toggleLoadoutItem(id) {
    const def = ITEMS[id];
    if (!def) return;
    meta.loadout = meta.loadout || [];
    // normalize string ids
    const i = meta.loadout.findIndex((e) => itemIdOf(e) === id);
    if (i >= 0) {
      meta.loadout.splice(i, 1);
      toast(`− ${def.name}`, "warn", 1200);
    } else {
      const slot = def.slot || "ring";
      const lim = slotLimit(slot);
      const inSlot = itemsInSlot(meta.loadout, slot);
      if (inSlot.length >= lim) {
        const drop = inSlot[0];
        const di = meta.loadout.findIndex((e) => e === drop || itemIdOf(e) === itemIdOf(drop));
        if (di >= 0) meta.loadout.splice(di, 1);
      }
      if (meta.loadout.length >= MAX_LOADOUT) {
        toast("Loadout đầy (7)", "warn");
        return;
      }
      meta.loadout.push(id); // loadout always Common base
      toast(`+ ${def.name}`, "good", 1200);
    }
    saveMeta();
    rebuildCampUI();
    updateLoadoutLabel();
    updateStartButton();
  }

  function clearLoadout() {
    meta.loadout = [];
    saveMeta();
    rebuildCampUI();
    updateLoadoutLabel();
  }

  function updateLoadoutLabel() {
    const elL = document.getElementById("pick-loadout-label");
    const n = (meta.loadout || []).length;
    if (elL) elL.textContent = `Loadout: ${n}/${MAX_LOADOUT} (wiki slots)`;
    const cnt = document.getElementById("loadout-count");
    if (cnt) cnt.textContent = `${n} / ${MAX_LOADOUT}`;
    if (typeof updateHeroStatPanel === "function") updateHeroStatPanel();
  }

  function spawnWell(x, y) {
    wells.push({
      x, y, r: 22,
      bob: 0,
      open: false,
    });
  }

  function applyUpgrade(u, times) {
    const n = times || 1;
    for (let i = 0; i < n; i++) {
      if (u.kind === "ability_up") {
        applyAbilityUpgrade(u.abilityId, u.up);
      } else if (u.apply) {
        u.apply(player);
        player.traitRanks = player.traitRanks || Object.create(null);
        player.traitRanks[u.id] = (player.traitRanks[u.id] || 0) + 1;
        if (u.cat === "ability" || u.cat === "ab_trait") {
          abilityTraitPicks++;
          // Wiki: after Rank III & VI ability traits, next Tome offers upgrades
          if (abilityTraitPicks === 3 || abilityTraitPicks === 6 || abilityTraitPicks === 9) {
            pendingForceAbilityUpgrade = true;
          }
        }
      }
    }
    updateAbilityHud();
  }

  function applyAbilityUpgrade(abilityId, up) {
    const inst = (player.abilities || []).find((a) => a.id === abilityId);
    if (!inst || !up) return;
    inst.upgradeIds = inst.upgradeIds || [];
    if (inst.upgradeIds.includes(up.id)) return;
    if (inst.upgradeIds.length >= abilityUpgradeCap()) return;
    up.apply(inst);
    inst.upgradeIds.push(up.id);
    floatingTexts.push({
      x: player.x, y: player.y - 40,
      text: up.name, life: 1.1, maxLife: 1.1,
      color: (ABILITIES[abilityId] && ABILITIES[abilityId].color) || "#d4a84b",
      vy: -26,
    });
    updateAbilityHud();
  }

  function availableTraits() {
    const ranks = player.traitRanks || {};
    const hasAb = (player.abilities || []).length > 0;
    const lvl = player.level || 1;
    const list = UPGRADES.filter((t) => {
      if (lvl < (t.minLevel || 1)) return false;
      if (t.needAbility && !hasAb) return false;
      if ((ranks[t.id] || 0) >= (t.maxRank || 5)) return false;
      return true;
    }).slice();

    // Weapon proficiency for hero style
    const style = player.style || "melee";
    for (const group of Object.values(WEAPON_PROF)) {
      for (const t of group) {
        if (t.styles && !t.styles.includes(style)) continue;
        if (lvl < (t.minLevel || 1)) continue;
        if ((ranks[t.id] || 0) >= (t.maxRank || 3)) continue;
        list.push(t);
      }
    }

    // Per-ability traits (wiki Ability Traits)
    for (const inst of player.abilities || []) {
      const def = ABILITIES[inst.id];
      if (!def) continue;
      for (const tpl of ABILITY_TRAIT_TEMPLATES) {
        const tid = `abtr_${inst.id}_${tpl.key}`;
        if ((ranks[tid] || 0) >= (tpl.maxRank || 3)) continue;
        list.push({
          id: tid,
          name: `${tpl.name}`,
          cat: "ab_trait",
          minLevel: 1,
          maxRank: tpl.maxRank || 3,
          desc: tpl.desc.replace("{ab}", def.name),
          abilityId: inst.id,
          tpl,
          apply: (p) => {
            const a = (p.abilities || []).find((x) => x.id === inst.id);
            if (a && tpl.apply) tpl.apply(p, a);
          },
        });
      }
    }
    return list;
  }

  function availableAbilityUpgrades() {
    const out = [];
    for (const inst of player.abilities || []) {
      const taken = inst.upgradeIds || [];
      if (taken.length >= abilityUpgradeCap()) continue;
      const list = ABILITY_UPGRADES[inst.id] || [];
      const def = ABILITIES[inst.id];
      for (const up of list) {
        if (taken.includes(up.id)) continue;
        out.push({
          kind: "ability_up",
          abilityId: inst.id,
          up,
          id: up.id,
          name: `${def ? def.name : inst.id}: ${up.name}`,
          desc: up.desc,
          cat: "ability_up",
        });
      }
    }
    return out;
  }

  function rerollCost() {
    const base = BALANCE.rerollBaseCost || 25;
    const scale = BALANCE.rerollCostScale || 1.65;
    return Math.round(base * Math.pow(scale, levelRerollCount));
  }

  function updateRerollButton() {
    const btn = document.getElementById("btn-reroll");
    if (!btn) return;
    if (levelUpMode !== "trait") {
      btn.classList.add("hidden");
      return;
    }
    btn.classList.remove("hidden");
    const cost = rerollCost();
    const maxR = BALANCE.maxRerollsPerLevel || 8;
    const can = gold >= cost && levelRerollCount < maxR;
    btn.disabled = !can;
    btn.textContent = levelRerollCount >= maxR
      ? "Reroll MAX"
      : `Reroll (${cost}G)`;
  }

  function openLevelUp() {
    state = "levelup";
    levelUpMode = "trait";
    levelRerollCount = 0;
    sfx("level");
    addShake(4);
    fillLevelUpOptions();
    showScreen("levelup");
  }

  function fillLevelUpOptions() {
    const traits = availableTraits();
    const abUps = availableAbilityUpgrades();
    let pool = traits.slice();
    const injectN = abilityTraitPicks >= 3 ? 3 : abilityTraitPicks >= 1 ? 2 : abUps.length ? 1 : 0;
    if (abUps.length && injectN > 0) {
      pool = pool.concat(shuffle(abUps).slice(0, injectN));
    }
    if (!pool.length && abUps.length) pool = abUps.slice();
    if (!pool.length) pool = UPGRADES.slice(0, 4);

    const options = shuffle(pool).slice(0, 4);
    const doubleIdx = (Math.random() * options.length) | 0;
    el.upgradeOptions.innerHTML = "";
    const title = el.levelup && el.levelup.querySelector("h2");
    const sub = document.getElementById("levelup-sub") || (el.levelup && el.levelup.querySelector("p"));
    if (title) title.textContent = "LEVEL UP!";
    if (sub) {
      sub.innerHTML =
        `Chọn 1 trong 4 · Trait / Ability UPG · <span style="color:#d4a84b">1 ×2</span>` +
        ` · Reroll bằng gold run`;
    }

    options.forEach((u, i) => {
      const doubled = i === doubleIdx && u.kind !== "ability_up";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-btn pick-with-icon"
        + (doubled ? " doubled" : "")
        + (u.kind === "ability_up" ? " ab-up" : "");
      const rank = u.kind === "ability_up" ? "" : ` · R${(player.traitRanks[u.id] || 0) + 1}`;
      const catLabel = u.cat === "ab_trait" ? "ability" : u.cat === "weapon_prof" ? "weapon" : (u.cat || "");
      const tag = u.kind === "ability_up"
        ? `<em class="x2-badge">UPG</em>`
        : (catLabel ? `<em class="trait-cat">${catLabel}</em>` : "");

      // Icon: ability UPG / ability trait → ability icon; else trait icon
      const icon = document.createElement("canvas");
      icon.className = "pick-icon ability-icon";
      if (u.kind === "ability_up" && u.abilityId && typeof window.paintAbilityIcon === "function") {
        const ab = ABILITIES[u.abilityId];
        window.paintAbilityIcon(icon, u.abilityId, (ab && ab.color) || "#d4a84b", 48);
      } else if (u.cat === "ab_trait" && u.abilityId && typeof window.paintAbilityIcon === "function") {
        const ab = ABILITIES[u.abilityId];
        window.paintAbilityIcon(icon, u.abilityId, (ab && ab.color) || "#8ab4ff", 48);
      } else if (typeof window.paintTraitIcon === "function") {
        window.paintTraitIcon(icon, u.id, null, 48, u.cat);
      }

      const body = document.createElement("div");
      body.className = "pick-body";
      const titleEl = document.createElement("strong");
      if (doubled) {
        titleEl.innerHTML = `${u.name}${rank} <em class="x2-badge">×2</em>`;
      } else {
        titleEl.innerHTML = `${u.name}${rank} ${tag}`;
      }
      const descEl = document.createElement("span");
      descEl.textContent = u.desc || "";
      body.appendChild(titleEl);
      body.appendChild(descEl);

      btn.appendChild(icon);
      btn.appendChild(body);
      btn.addEventListener("click", () => {
        applyUpgrade(u, doubled ? 2 : 1);
        sfx("click");
        state = "playing";
        showScreen("game");
        lastTs = performance.now();
      });
      el.upgradeOptions.appendChild(btn);
    });
    updateRerollButton();
  }

  function rerollLevelUp() {
    if (state !== "levelup" || levelUpMode !== "trait") return;
    const cost = rerollCost();
    const maxR = BALANCE.maxRerollsPerLevel || 8;
    if (levelRerollCount >= maxR || gold < cost) {
      sfx("click");
      return;
    }
    gold -= cost;
    levelRerollCount++;
    sfx("ui");
    updateHud();
    fillLevelUpOptions();
  }

  // ─── Abilities (wiki Tome of Mastery) ────────────────────
  function ownedAbilityIds() {
    return (player.abilities || []).map((a) => a.id);
  }

  function spawnTome(x, y, isStarter) {
    const full = (player.abilities || []).length >= maxAbilitySlots();
    const upgAvail = availableAbilityUpgrades().length > 0;
    // Wiki: after Ability Trait rank III & VI, next Tome/Scroll offers Ability Upgrades
    const forceUpg = !isStarter && pendingForceAbilityUpgrade && upgAvail;
    if (full && !upgAvail && !isStarter) return;
    if (forceUpg) pendingForceAbilityUpgrade = false;
    tomes.push({
      x: x != null ? x : player.x + rand(-40, 40),
      y: y != null ? y : player.y + rand(-40, 40),
      r: 14,
      life: isStarter ? 9999 : 45,
      bob: Math.random() * Math.PI * 2,
      fullCatalog: !!isStarter && !forceUpg,
      upgradeMode: forceUpg || (full && !isStarter && upgAvail),
    });
  }

  /** Format ability stats for pick menu / HUD */
  function formatAbilityStatLines(def) {
    const lines = [];
    if (def.damage != null) lines.push(`DMG ${Math.round(def.damage)}`);
    if (def.attackSpeed != null && def.type !== "orbit") {
      lines.push(`ASP ${def.attackSpeed.toFixed(2)}/s`);
      lines.push(`CD ${(1 / Math.max(0.15, def.attackSpeed)).toFixed(2)}s`);
    }
    if (def.type === "orbit") {
      lines.push(`ORBS ${def.count || 1}`);
      if (def.orbitRadius) lines.push(`RAD ${def.orbitRadius}`);
      if (def.orbitSpeed) lines.push(`SPIN ${def.orbitSpeed.toFixed(1)}`);
    }
    if (def.count != null && def.type !== "orbit") lines.push(`×${def.count}`);
    if (def.pierce != null) lines.push(`PRC ${def.pierce}`);
    if (def.range != null) lines.push(`RNG ${def.range}`);
    if (def.aoe != null) lines.push(`AOE ${def.aoe}`);
    if (def.critChance != null) lines.push(`CRIT ${Math.round(def.critChance * 100)}%`);
    if (def.critBonus != null) lines.push(`C.DMG +${Math.round(def.critBonus * 100)}%`);
    if (def.heal != null) lines.push(`HEAL ${def.heal}`);
    return lines;
  }

  function openAbilityUpgradePick() {
    const pool = availableAbilityUpgrades();
    if (!pool.length) return false;
    pendingAbilityResume = "playing";
    state = "ability";
    el.abilityOptions.innerHTML = "";
    el.abilityOptions.classList.remove("ability-full-list");
    if (el.abilityPick) {
      const title = el.abilityPick.querySelector("h2");
      const sub = el.abilityPick.querySelector("p");
      if (title) title.textContent = "ABILITY UPGRADE";
      if (sub) sub.innerHTML = `Chọn 1 nâng cấp Ability · tối đa ${MAX_ABILITY_UPGRADES}/ability · <span style="color:#8ab4ff">wiki HoT</span>`;
    }
    for (const opt of shuffle(pool).slice(0, Math.min(3, pool.length))) {
      const def = ABILITIES[opt.abilityId];
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-btn ab-up pick-with-icon";
      const icon = document.createElement("canvas");
      icon.className = "pick-icon ability-icon";
      if (typeof window.paintAbilityIcon === "function") {
        window.paintAbilityIcon(icon, opt.abilityId, (def && def.color) || "#d4a84b", 48);
      }
      const body = document.createElement("div");
      body.className = "pick-body";
      const titleEl = document.createElement("strong");
      titleEl.style.color = def ? def.color : "#d4a84b";
      titleEl.innerHTML = `${opt.name} <em class="x2-badge">UPG</em>`;
      const descEl = document.createElement("span");
      descEl.textContent = `${def ? def.name + " · " : ""}${opt.desc || ""}`;
      body.appendChild(titleEl);
      body.appendChild(descEl);
      btn.appendChild(icon);
      btn.appendChild(body);
      btn.addEventListener("click", () => {
        applyAbilityUpgrade(opt.abilityId, opt.up);
        state = "playing";
        showScreen("game");
        lastTs = performance.now();
      });
      el.abilityOptions.appendChild(btn);
    }
    showScreen("ability");
    return true;
  }

  function abilityDmgType(ab) {
    if (!ab) return "physical";
    if (ab.dmgType) return ab.dmgType;
    if (ab.group === "bard") return "bard";
    const el = ab.element || "";
    if (el === "magic") return "magic";
    if (el === "fire" || el === "lightning" || el === "ice" || el === "earth" || el === "elemental") return "elemental";
    if (el === "physical") return "physical";
    return "physical";
  }

  function abilityDmgMeta(type) {
    const map = DATA.ABILITY_DMG_TYPES || {
      physical: { label: "Physical", short: "PHY", color: "#d4a84b" },
      magic: { label: "Magic", short: "MAG", color: "#a070e0" },
      elemental: { label: "Elemental", short: "ELE", color: "#50c0b0" },
      bard: { label: "Bard", short: "BRD", color: "#e070b0" },
    };
    return map[type] || map.physical;
  }

  function createAbilityPickButton(ab, fullCatalog) {
    const dtype = abilityDmgType(ab);
    const dm = abilityDmgMeta(dtype);
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "upgrade-btn ab-dmg-" + dtype;
    btn.dataset.dmg = dtype;
    const stats = fullCatalog
      ? formatAbilityStatLines(ab).slice(0, 4).join(" · ")
      : formatAbilityStatLines(ab).join(" · ");

    const icon = document.createElement("canvas");
    icon.className = "ability-icon";
    const iconSize = fullCatalog ? 36 : 52;
    if (typeof window.paintAbilityIcon === "function") {
      window.paintAbilityIcon(icon, ab.id, ab.color, iconSize);
    }

    const badge = document.createElement("span");
    badge.className = "ab-dmg-badge";
    badge.style.color = dm.color;
    badge.style.borderColor = dm.color;
    const elem = ab.element || "";
    const elemShort = (elem === "fire" || elem === "lightning" || elem === "ice" || elem === "earth")
      ? "·" + elem.slice(0, 3).toUpperCase()
      : "";
    badge.textContent = dm.short + elemShort;

    const nameEl = document.createElement("strong");
    nameEl.style.color = ab.color;
    nameEl.textContent = ab.name;

    const descEl = document.createElement("span");
    descEl.textContent = ab.desc || ab.type;

    const statsEl = document.createElement("span");
    statsEl.className = "ab-pick-stats";
    statsEl.textContent = `${dm.label}${elem && elem !== dtype ? " · " + elem : ""} · ${stats}`;

    btn.appendChild(badge);
    btn.appendChild(icon);
    btn.appendChild(nameEl);
    btn.appendChild(descEl);
    btn.appendChild(statsEl);
    btn.title = `${ab.name} [${dm.label}${elem ? " · " + elem : ""}]\n${ab.desc || ""}\n${formatAbilityStatLines(ab).join(" · ")}`;
    btn.addEventListener("click", () => {
      grantAbility(ab.id);
      sfx("click");
      state = "playing";
      showScreen("game");
      lastTs = performance.now();
    });
    return btn;
  }

  let abilityTypeFilter = "all";
  let _abilityPickPool = null;
  let _abilityPickFull = false;

  function wireAbilityTypeFilter() {
    const bar = document.getElementById("ability-type-filter");
    if (!bar) return;
    bar.classList.toggle("hidden", !_abilityPickFull);
    bar.querySelectorAll(".type-filter").forEach((btn) => {
      btn.classList.toggle("selected", (btn.dataset.abFilter || "all") === abilityTypeFilter);
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => {
        abilityTypeFilter = btn.dataset.abFilter || "all";
        bar.querySelectorAll(".type-filter").forEach((b) => {
          b.classList.toggle("selected", (b.dataset.abFilter || "all") === abilityTypeFilter);
        });
        renderAbilityPickGrid();
        sfx("ui");
      });
    });
  }

  function renderAbilityPickGrid() {
    const grid = el.abilityOptions;
    if (!grid || !_abilityPickPool) return;
    grid.innerHTML = "";
    const order = DATA.ABILITY_DMG_ORDER || ["physical", "magic", "elemental", "bard"];
    const pool = _abilityPickPool;
    if (_abilityPickFull) {
      for (const t of order) {
        if (abilityTypeFilter !== "all" && abilityTypeFilter !== t) continue;
        const list = pool
          .filter((a) => abilityDmgType(a) === t)
          .sort((a, b) => a.name.localeCompare(b.name));
        if (!list.length) continue;
        const dm = abilityDmgMeta(t);
        const head = document.createElement("div");
        head.className = "ab-section-head ab-sec-" + t;
        head.style.color = dm.color;
        head.innerHTML = `<span class="ab-sec-tag">${dm.short}</span> ${dm.label}` +
          (t === "elemental" ? ` <em>Fire · Lightning · Ice · Earth</em>` : "");
        grid.appendChild(head);
        for (const ab of list) grid.appendChild(createAbilityPickButton(ab, true));
      }
    } else {
      for (const ab of pool) grid.appendChild(createAbilityPickButton(ab, false));
    }
  }

  function openAbilityPick(fullCatalog, upgradeMode) {
    const cap = maxAbilitySlots();
    if (upgradeMode || ((player.abilities || []).length >= cap && !fullCatalog)) {
      if (openAbilityUpgradePick()) return;
      if ((player.abilities || []).length >= cap) return;
    }
    if (!player || (player.abilities || []).length >= cap) return;
    const owned = new Set(ownedAbilityIds());
    const pool = Object.values(ABILITIES).filter((a) => !owned.has(a.id));
    if (!pool.length) {
      openAbilityUpgradePick();
      return;
    }
    pendingAbilityResume = "playing";
    state = "ability";
    _abilityPickFull = !!fullCatalog;
    abilityTypeFilter = "all";
    if (fullCatalog) {
      _abilityPickPool = pool.slice();
    } else {
      _abilityPickPool = shuffle(pool).slice(0, Math.min(3, pool.length));
    }
    if (el.abilityPick) {
      const title = el.abilityPick.querySelector("h2");
      const sub = el.abilityPick.querySelector("p");
      if (title) title.textContent = fullCatalog ? "TOME OF MASTERY" : "SCROLL OF MASTERY";
      if (sub) {
        sub.innerHTML = fullCatalog
          ? `Chọn 1 Ability · filter type · max ${cap}`
          : `Chọn 1 trong 3 Ability · tối đa ${cap}`;
      }
    }
    const grid = el.abilityOptions;
    if (fullCatalog) grid.classList.add("ability-full-list", "ability-by-type");
    else grid.classList.remove("ability-full-list", "ability-by-type");
    wireAbilityTypeFilter();
    renderAbilityPickGrid();
    showScreen("ability");
  }

  function pushAbilityFx(fx) {
    abilityFx.push(fx);
    if (abilityFx.length > 80) abilityFx.splice(0, abilityFx.length - 80);
  }

  /** Unique cast VFX matching ability name */
  function playAbilityCastFx(def, extra) {
    extra = extra || {};
    const id = def.id;
    const px = player.x;
    const py = player.y;

    if (id === "phantom_needles") {
      pushAbilityFx({ kind: "needles_burst", x: px, y: py, life: 0.25, maxLife: 0.25, color: def.color, facing: player.facing });
    } else if (id === "arcane_splinters") {
      pushAbilityFx({ kind: "splinter_ring", x: px, y: py, life: 0.35, maxLife: 0.35, color: def.color, r: 40 });
    } else if (id === "lightning_strikes") {
      for (const t of (extra.targets || [])) {
        pushAbilityFx({ kind: "lightning_bolt", x0: t.x, y0: t.y - 180, x1: t.x, y1: t.y, life: 0.22, maxLife: 0.22, color: def.color });
      }
    } else if (id === "flame_strike" || id === "dragons_breath") {
      pushAbilityFx({
        kind: "flame_cone",
        x: px, y: py,
        aim: extra.aim != null ? extra.aim : (player.facing > 0 ? 0 : Math.PI),
        life: 0.35, maxLife: 0.35, color: def.color, wide: id === "dragons_breath",
      });
    } else if (id === "frost_avalanche" || id === "kick_bass") {
      pushAbilityFx({ kind: "frost_ring", x: px, y: py, life: 0.5, maxLife: 0.5, color: def.color, r: def.aoe || 120 });
    } else if (id === "hailstorm") {
      pushAbilityFx({ kind: "hail_cloud", x: px, y: py - 40, life: 0.55, maxLife: 0.55, color: def.color });
    } else if (id === "meteor_strike" || id === "pyrotechnics") {
      for (const t of (extra.spots || [])) {
        pushAbilityFx({ kind: "meteor_fall", x: t.x, y: t.y, life: 0.45, maxLife: 0.45, color: def.color });
      }
    } else if (id === "radiant_aura" || id === "mosh_pit") {
      pushAbilityFx({ kind: "holy_pulse", x: px, y: py, life: 0.4, maxLife: 0.4, color: def.color, r: def.aoe || 100 });
    } else if (id === "clay_golem") {
      pushAbilityFx({ kind: "summon_burst", x: px + 40, y: py, life: 0.5, maxLife: 0.5, color: def.color });
    } else if (id === "kugelblitz") {
      pushAbilityFx({ kind: "electric_spark", x: px, y: py, life: 0.3, maxLife: 0.3, color: def.color });
    } else if (id === "arcane_rift") {
      for (const t of (extra.spots || [])) {
        pushAbilityFx({ kind: "rift", x: t.x, y: t.y, life: 0.55, maxLife: 0.55, color: def.color });
      }
    } else if (id === "spectral_fists") {
      pushAbilityFx({ kind: "fists", x: px, y: py, life: 0.28, maxLife: 0.28, color: def.color, facing: player.facing });
    } else if (id === "transfixion") {
      pushAbilityFx({ kind: "arrow_volley", x: px, y: py, life: 0.25, maxLife: 0.25, color: def.color, aim: extra.aim || 0 });
    } else if (id === "confetti_cannon") {
      pushAbilityFx({ kind: "confetti", x: px, y: py, life: 0.55, maxLife: 0.55, color: def.color });
    } else if (id === "killer_riff") {
      pushAbilityFx({ kind: "sound_wave", x: px, y: py, life: 0.35, maxLife: 0.35, color: def.color, aim: extra.aim || 0 });
    } else if (id === "wall_of_death") {
      pushAbilityFx({ kind: "death_wall", x: px, y: py, life: 0.4, maxLife: 0.4, color: def.color, facing: player.facing });
    } else if (id === "enlightenment") {
      if (extra.target) {
        pushAbilityFx({
          kind: "holy_beam",
          x0: px, y0: py, x1: extra.target.x, y1: extra.target.y,
          life: 0.28, maxLife: 0.28, color: def.color,
        });
      }
    } else if (id === "prismatic_cascade") {
      pushAbilityFx({ kind: "prism_burst", x: px, y: py, life: 0.45, maxLife: 0.45, color: def.color });
    } else if (id === "undergrowth") {
      for (const t of (extra.spots || [])) {
        pushAbilityFx({ kind: "vines", x: t.x, y: t.y, life: 0.5, maxLife: 0.5, color: def.color });
      }
    } else {
      pushAbilityFx({ kind: "cast_flash", x: px, y: py, life: 0.2, maxLife: 0.2, color: def.color });
    }
  }

  function grantAbility(id) {
    const def = ABILITIES[id];
    if (!def || !player) return;
    if (ownedAbilityIds().includes(id)) return;
    if (player.abilities.length >= maxAbilitySlots()) return;
    player.abilities.push({
      id,
      cd: 0.4,
      angle: Math.random() * Math.PI * 2,
      golemId: null,
      upgradeIds: [],
      dmgMul: 1,
      aspMul: 1,
      countAdd: 0,
      pierceAdd: 0,
      radiusAdd: 0,
      spinMul: 1,
      rangeMul: 1,
      aoeMul: 1,
      healAdd: 0,
    });
    // Orbit abilities feel instant
    if (def.type === "orbit") {
      const last = player.abilities[player.abilities.length - 1];
      last.cd = 0;
    }
    updateAbilityHud();
    floatingTexts.push({
      x: player.x,
      y: player.y - 36,
      text: `+ ${def.name}`,
      life: 1.2,
      maxLife: 1.2,
      color: def.color,
      vy: -28,
    });
  }

  function updateAbilityHud() {
    if (!player) return;
    const list = player.abilities || [];
    const n = list.length;

    // Bottom HUD chips
    if (el.abilityHud) {
      el.abilityHud.innerHTML = "";
      for (const inst of list) {
        const def = ABILITIES[inst.id];
        if (!def) continue;
        const chip = document.createElement("span");
        chip.className = "ability-chip" + (inst.cd <= 0 || def.type === "orbit" ? " ready" : "");
        chip.style.borderColor = def.color;
        chip.style.color = def.color;
        chip.textContent = def.name;
        const ups = (inst.upgradeIds || []).join(", ");
        const stats = formatAbilityStatLines(resolveAbilityDef(inst) || def).join(" · ");
        const dt = abilityDmgMeta(abilityDmgType(def));
        chip.title = `${def.name} [${dt.label}${def.element ? " · " + def.element : ""}]\n${def.desc || ""}\n${stats}${ups ? "\nUpgrades: " + ups : ""}`;
        el.abilityHud.appendChild(chip);
      }
    }

    // Top-right ability stats panel
    if (el.abCount) el.abCount.textContent = `${n}/${maxAbilitySlots()}`;
    if (el.abilityStatsList) {
      if (!n) {
        el.abilityStatsList.innerHTML = `<p class="ab-empty">Chưa có Ability · nhặt Tome (T)</p>`;
      } else {
        el.abilityStatsList.innerHTML = "";
        for (const inst of list) {
          const def = ABILITIES[inst.id];
          if (!def) continue;
          const card = document.createElement("div");
          card.className = "ab-card";
          const isOrbit = def.type === "orbit";
          const ready = isOrbit || inst.cd <= 0;
          const cdText = isOrbit
            ? "ACTIVE"
            : ready
              ? "Ready"
              : `${(inst.cd || 0).toFixed(1)}s`;
          const resolved = resolveAbilityDef(inst) || def;
          const stats = formatAbilityStatLines(resolved);
          const ups = (inst.upgradeIds || []).length;
          if (ups) stats.push(`UPG ${ups}/${MAX_ABILITY_UPGRADES}`);
          const statHtml = stats
            .map((line) => {
              const parts = line.split(" ");
              const label = parts[0];
              const val = parts.slice(1).join(" ");
              return `<span><i>${label}</i><b>${val}</b></span>`;
            })
            .join("");
          const head = document.createElement("div");
          head.className = "ab-card-head";
          const icon = document.createElement("canvas");
          icon.className = "ability-icon";
          if (typeof window.paintAbilityIcon === "function") {
            window.paintAbilityIcon(icon, def.id, def.color, 28);
          }
          const nameSp = document.createElement("span");
          nameSp.className = "ab-card-name";
          nameSp.style.color = def.color;
          nameSp.textContent = def.name + (ups ? ` ★${ups}` : "");
          const cdSp = document.createElement("span");
          cdSp.className = "ab-card-cd " + (ready ? "ready" : "cooling");
          cdSp.textContent = cdText;
          head.appendChild(icon);
          head.appendChild(nameSp);
          head.appendChild(cdSp);

          const typeEl = document.createElement("div");
          typeEl.className = "ab-card-type";
          const dt = abilityDmgMeta(abilityDmgType(def));
          typeEl.innerHTML =
            `<span style="color:${dt.color};font-weight:700">${dt.short}</span> · ${def.element || def.type}` +
            (def.group === "bard" || def.group === "boglands" ? ` · ${def.group}` : "");

          const statsEl = document.createElement("div");
          statsEl.className = "ab-card-stats";
          statsEl.innerHTML = statHtml;

          card.appendChild(head);
          card.appendChild(typeEl);
          card.appendChild(statsEl);
          el.abilityStatsList.appendChild(card);
        }
      }
    }
  }

  function resolveAbilityDef(inst) {
    const base = ABILITIES[inst.id];
    if (!base) return null;
    const d = Object.assign({}, base);
    const pMul = player.abilityDmgMul || 1;
    const rMul = player.abilityRangeMul || 1;
    d.damage = (base.damage || 10) * (inst.dmgMul || 1) * pMul;
    d.count = Math.max(1, (base.count || 1) + (inst.countAdd || 0));
    d.pierce = (base.pierce || 0) + (inst.pierceAdd || 0);
    d.attackSpeed = (base.attackSpeed || 0.5) * (inst.aspMul || 1);
    d.range = (base.range || 200) * (inst.rangeMul || 1) * rMul;
    d.aoe = (base.aoe || 50) * (inst.aoeMul || 1) * rMul;
    d.orbitRadius = (base.orbitRadius || 70) + (inst.radiusAdd || 0);
    d.orbitSpeed = (base.orbitSpeed || 2.5) * (inst.spinMul || 1);
    d.heal = (base.heal || 0) + (inst.healAdd || 0);
    d.critChance = Math.min(0.95, (base.critChance || 0.1) + (player.abilityCritAdd || 0) + (inst.critChanceAdd || 0));
    d.critBonus = (base.critBonus || 0.5) + (inst.critBonusAdd || 0);
    // status flags from upgrades
    d.burn = !!(inst.burn || base.burn);
    d.electrify = !!(inst.electrify || base.electrify);
    d.decay = !!(inst.decay || base.decay);
    d.fragile = !!(inst.fragile || base.fragile);
    d.markOnHit = !!(inst.markOnHit || base.markOnHit);
    d.applySlow = !!(inst.applySlow || base.applySlow);
    d.knockback = !!(inst.knockback || base.knockback);
    d.burnMul = inst.burnMul || 1;
    d.splitOnCrit = !!inst.splitOnCrit;
    d.pulseOnExpire = !!inst.pulseOnExpire;
    d.critVsSlow = !!inst.critVsSlow;
    return d;
  }

  function weaponHitOpts() {
    const burnC = player.weaponBurnChance || (player.weaponBurn ? 1 : 0);
    const sparkC = player.weaponSparkChance || (player.weaponElectrify ? 1 : 0);
    const frostC = player.weaponFrostChance || 0;
    const decayC = player.weaponDecayChance || (player.weaponDecay ? 1 : 0);
    const fragC = player.weaponFragileChance || 0;
    return {
      weaponBurn: burnC > 0,
      burnChance: burnC,
      weaponElectrify: sparkC > 0,
      electrifyChance: sparkC,
      weaponFrost: frostC > 0,
      frostChance: frostC,
      weaponDecay: decayC > 0,
      decayChance: decayC,
      weaponMark: !!player.weaponMark,
      weaponSlow: !!player.weaponSlow,
      fragile: fragC > 0,
      fragileChance: fragC,
    };
  }

  function abilityHitOpts(def) {
    return {
      burn: !!def.burn,
      electrify: !!def.electrify,
      decay: !!def.decay,
      fragile: !!def.fragile,
      markOnHit: !!def.markOnHit,
      applySlow: !!def.applySlow,
      burnMul: def.burnMul || 1,
    };
  }

  function abilityDamage(def, mul, e) {
    let chance = def.critChance || 0.1;
    if (def.critVsSlow && e && (e.frostSlow > 0 || (e.st && e.st.slow > 0))) chance += 0.15;
    // wiki: only Direct Damage crits; elemental DoT does not
    const stacks = rollCritStacks(chance);
    const base = (def.damage || 10) * (mul || 1);
    const dmg = calcDamageWithStacks(base, stacks, def.critBonus || 0.5);
    return { dmg, crit: stacks > 0, stacks };
  }

  function hitWithAbility(e, def, mul) {
    const { dmg, crit, stacks } = abilityDamage(def, mul, e);
    damageEnemy(e, dmg, crit, abilityHitOpts(def));
    if (stacks > 1) {
      floatingTexts.push({
        x: e.x, y: e.y - e.r - 16,
        text: `CRIT×${stacks}`, life: 0.45, maxLife: 0.45, color: "#ffd070", vy: -42,
      });
    }
    if (def.knockback) applyKnockback(e, player, 1.1);
    return { dmg, crit, stacks };
  }

  function fireAbilityProjectiles(def, count, opts) {
    opts = opts || {};
    const targets = nearestEnemies(player, Math.max(1, count), def.range || 300);
    const aimBase = targets[0]
      ? Math.atan2(targets[0].y - player.y, targets[0].x - player.x)
      : (player.facing > 0 ? 0 : Math.PI);
    for (let i = 0; i < count; i++) {
      let a;
      if (opts.cone) {
        const t = count === 1 ? 0 : (i / (count - 1) - 0.5) * 2;
        a = aimBase + t * (opts.cone * Math.PI) / 180;
      } else if (opts.circle) {
        a = (i / count) * Math.PI * 2;
      } else if (targets[i]) {
        a = Math.atan2(targets[i].y - player.y, targets[i].x - player.x);
      } else {
        a = aimBase + (i - count / 2) * 0.12;
      }
      const { dmg, crit } = abilityDamage(def);
      const spd = opts.speed || 380;
      projectiles.push({
        x: player.x,
        y: player.y,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd,
        r: opts.r || 4,
        damage: dmg,
        isCrit: crit,
        life: opts.life || 1.5,
        color: crit ? "#fff0a0" : def.color,
        style: opts.style || "arrow",
        homing: !!opts.homing,
        target: opts.homing ? (targets[i] || targets[0] || null) : null,
        pierce: opts.pierce != null ? opts.pierce : (def.pierce || 0),
        fxKind: opts.fxKind || def.id,
        hitOpts: abilityHitOpts(def),
        splitOnCrit: !!def.splitOnCrit,
        abilityDef: def,
      });
    }
  }

  function castAbility(inst) {
    const def = resolveAbilityDef(inst) || ABILITIES[inst.id];
    if (!def) return;
    const cd = (1 / Math.max(0.15, def.attackSpeed || 0.5)) * (player.abilityCdMul || 1);
    inst.cd = cd;
    const aimDefault = player.facing > 0 ? 0 : Math.PI;

    switch (def.type) {
      case "needle": {
        // Phantom Needles / Killer Riff — lock nearest target, high pierce
        const n = Math.max(1, def.count || 1);
        fireAbilityProjectiles(def, n, {
          pierce: def.pierce || 6,
          speed: def.id === "killer_riff" ? 480 : 440,
          style: def.id === "killer_riff" ? "orb" : "arrow",
          r: def.id === "killer_riff" ? 5 : 3.2,
          fxKind: def.id,
          life: 1.8,
        });
        playAbilityCastFx(def, { aim: aimDefault });
        break;
      }
      case "splinter":
        // Arcane Splinters / Confetti — cone multistrike
        fireAbilityProjectiles(def, def.count || 8, {
          cone: def.coneDeg || (def.id === "confetti_cannon" ? 90 : 75),
          pierce: def.pierce || 1,
          speed: def.id === "confetti_cannon" ? 300 : 340,
          style: "orb",
          r: def.id === "confetti_cannon" ? 3.5 : 4.5,
          fxKind: def.id,
          life: 1.4,
        });
        playAbilityCastFx(def);
        break;
      case "transfixion": {
        // wiki: 3 projectiles · 20° cone · pierce
        const targets = nearestEnemies(player, 1, def.range || 350);
        const aim = targets[0] ? Math.atan2(targets[0].y - player.y, targets[0].x - player.x) : aimDefault;
        fireAbilityProjectiles(def, def.count || 3, {
          cone: def.coneDeg || 20,
          pierce: def.pierce || 4,
          speed: 420,
          style: "arrow",
          fxKind: def.id,
          life: 1.6,
        });
        playAbilityCastFx(def, { aim });
        break;
      }
      case "flame_wave": {
        // Flame Strike / Dragon's Breath — cone fire stream
        const targets = nearestEnemies(player, 1, def.range || 200);
        const aim = targets[0] ? Math.atan2(targets[0].y - player.y, targets[0].x - player.x) : aimDefault;
        fireAbilityProjectiles(def, def.count || 7, {
          cone: def.coneDeg || (def.id === "dragons_breath" ? 48 : 55),
          pierce: def.pierce || 2,
          speed: def.id === "dragons_breath" ? 280 : 320,
          style: "orb",
          r: def.id === "dragons_breath" ? 7 : 6,
          life: def.id === "dragons_breath" ? 0.55 : 0.75,
          fxKind: def.id,
        });
        playAbilityCastFx(def, { aim });
        break;
      }
      case "lightning": {
        const n = def.count || 3;
        const targets = nearestEnemies(player, n, def.range || 300);
        const list = targets.length ? targets.slice() : [];
        while (list.length < n && enemies.length) {
          list.push(enemies[(Math.random() * enemies.length) | 0]);
        }
        for (const e of list) {
          if (!e || e.hp <= 0) continue;
          hitWithAbility(e, def);
          aoeFx.push({ x: e.x, y: e.y, r: def.aoe || 36, life: 0.2, maxLife: 0.2, color: def.color, style: "burst" });
        }
        playAbilityCastFx(def, { targets: list });
        break;
      }
      case "frost_nova":
      case "aura": {
        const r = def.aoe || 100;
        aoeFx.push({ x: player.x, y: player.y, r, life: 0.4, maxLife: 0.4, color: def.color, style: "burst" });
        for (const e of enemies) {
          if (dist(player, e) <= r) {
            hitWithAbility(e, def);
            if (def.element === "ice" || def.id === "frost_avalanche") {
              e.frostSlow = Math.max(e.frostSlow || 0, 2.2);
            }
            if (def.knockback || def.id === "kick_bass") {
              applyKnockback(e, player, 1.4);
            } else if (def.type === "frost_nova") {
              applyKnockback(e, player, 0.55);
            }
          }
        }
        if (def.heal && player.hp < player.maxHp) {
          player.hp = Math.min(player.maxHp, player.hp + def.heal * (1 + (inst.healAdd || 0) * 0));
        }
        playAbilityCastFx(def);
        break;
      }
      case "hail":
      case "meteor": {
        const n = def.count || 3;
        const targets = nearestEnemies(player, n, def.range || 260);
        const spots = [];
        for (let i = 0; i < n; i++) {
          const t = targets[i] || {
            x: player.x + rand(-180, 180),
            y: player.y + rand(-120, 120),
          };
          spots.push(t);
          aoeFx.push({ x: t.x, y: t.y, r: def.aoe || 55, life: 0.4, maxLife: 0.4, color: def.color, style: "burst" });
          for (const e of enemies) {
            if (dist(t, e) <= (def.aoe || 55)) hitWithAbility(e, def, def.type === "meteor" ? 1.2 : 1);
          }
        }
        playAbilityCastFx(def, { spots });
        break;
      }
      case "rift":
      case "plants": {
        const n = def.count || 2;
        const targets = nearestEnemies(player, n, def.range || 200);
        const spots = [];
        for (let i = 0; i < n; i++) {
          const t = targets[i] || {
            x: player.x + Math.cos((i / n) * Math.PI * 2) * 100,
            y: player.y + Math.sin((i / n) * Math.PI * 2) * 100,
          };
          spots.push(t);
          aoeFx.push({ x: t.x, y: t.y, r: def.aoe || 50, life: 0.45, maxLife: 0.45, color: def.color, style: "burst" });
          for (const e of enemies) {
            if (dist(t, e) <= (def.aoe || 50)) {
              hitWithAbility(e, def);
              if (def.id === "undergrowth" || def.decay) applyStatus(e, "decay", 3.5);
            }
          }
        }
        playAbilityCastFx(def, { spots });
        break;
      }
      case "kugel": {
        // wiki: ball lightning — floats to enemy, pulses AOE while alive
        const targets = nearestEnemies(player, 1, def.range || 400);
        if (!targets.length) break;
        const t = targets[0];
        const a = Math.atan2(t.y - player.y, t.x - player.x);
        const { dmg, crit } = abilityDamage(def);
        projectiles.push({
          x: player.x, y: player.y,
          vx: Math.cos(a) * 160, vy: Math.sin(a) * 160,
          r: 11, damage: dmg * 0.35, isCrit: crit, life: 4.0,
          color: def.color, style: "orb",
          homing: true, target: t, pierce: 99,
          fxKind: "kugelblitz",
          kugelPulse: true,
          pulseR: def.aoe || 48,
          pulseCd: 0,
          pulseDmg: dmg * 0.55,
          hitOpts: abilityHitOpts(def),
          abilityDef: def,
        });
        playAbilityCastFx(def);
        break;
      }
      case "golem": {
        // wiki: Clay Golem — follow + melee; Double Trouble upgrade → more
        const want = Math.max(1, def.count || 1);
        summons = summons.filter((s) => s.kind !== "golem");
        for (let i = 0; i < want; i++) {
          summons.push({
            kind: "golem",
            x: player.x + 36 * (i === 0 ? 1 : -1),
            y: player.y + (i ? 20 : 0),
            r: 18,
            hp: 260,
            dmg: def.damage,
            speed: 100,
            color: def.color,
            hitCd: 0,
            rollT: 0,
          });
        }
        playAbilityCastFx(def);
        break;
      }
      case "spirit": {
        // wiki: Spirit Warrior — summon that dashes / melee (max 2)
        const want = Math.min(2, Math.max(1, def.count || 2));
        summons = summons.filter((s) => s.kind !== "spirit");
        for (let i = 0; i < want; i++) {
          summons.push({
            kind: "spirit",
            x: player.x + (i ? -45 : 45),
            y: player.y - 10,
            r: 14,
            hp: 180,
            dmg: def.damage,
            speed: 130,
            color: def.color,
            hitCd: 0,
            dashCd: 0.8 + i * 0.3,
          });
        }
        playAbilityCastFx(def);
        break;
      }
      case "fists": {
        // wiki: Spectral Fists — flying punches toward nearest enemies
        const n = def.count || 2;
        const targets = nearestEnemies(player, n, def.range || 220);
        for (let i = 0; i < n; i++) {
          const t = targets[i] || {
            x: player.x + player.facing * 80,
            y: player.y + (i - n / 2) * 30,
          };
          const a = Math.atan2(t.y - player.y, t.x - player.x);
          const { dmg, crit } = abilityDamage(def);
          projectiles.push({
            x: player.x, y: player.y,
            vx: Math.cos(a) * 320, vy: Math.sin(a) * 320,
            r: 10, damage: dmg, isCrit: crit, life: 0.55,
            color: def.color, style: "orb",
            homing: true, target: targets[i] || null, pierce: 2,
            fxKind: "spectral_fists",
            hitOpts: abilityHitOpts(def),
            abilityDef: def,
          });
        }
        if (def.groundPound) {
          aoeFx.push({ x: player.x, y: player.y, r: (def.aoe || 50) * 1.3, life: 0.22, maxLife: 0.22, color: def.color, style: "burst" });
          for (const e of enemies) {
            if (dist(player, e) < (def.aoe || 50) * 1.3) hitWithAbility(e, def, 0.5);
          }
        } else {
          aoeFx.push({ x: player.x, y: player.y, r: def.aoe || 50, life: 0.18, maxLife: 0.18, color: def.color, style: "burst" });
        }
        playAbilityCastFx(def);
        break;
      }
      case "wall": {
        // Wall of Death — line of force waves ahead
        const aim = player.facing > 0 ? 0 : Math.PI;
        const near = nearestEnemies(player, 1, 200)[0];
        const baseAim = near ? Math.atan2(near.y - player.y, near.x - player.x) : aim;
        for (let i = -3; i <= 3; i++) {
          const px = player.x + Math.cos(baseAim) * (70 + Math.abs(i) * 8) + Math.cos(baseAim + Math.PI / 2) * i * 22;
          const py = player.y + Math.sin(baseAim) * (70 + Math.abs(i) * 8) + Math.sin(baseAim + Math.PI / 2) * i * 22;
          aoeFx.push({ x: px, y: py, r: 30, life: 0.4, maxLife: 0.4, color: def.color, style: "burst" });
          for (const e of enemies) {
            if (dist({ x: px, y: py }, e) < 34) hitWithAbility(e, def, 0.75);
          }
        }
        playAbilityCastFx(def);
        break;
      }
      case "beam": {
        // Enlightenment — piercing beam line to target
        const targets = nearestEnemies(player, 1, def.range || 300);
        if (!targets.length) break;
        const t = targets[0];
        const a = Math.atan2(t.y - player.y, t.x - player.x);
        const { dmg, crit } = abilityDamage(def);
        projectiles.push({
          x: player.x, y: player.y,
          vx: Math.cos(a) * 520, vy: Math.sin(a) * 520,
          r: 6, damage: dmg, isCrit: crit, life: 0.9,
          color: def.color, style: "orb",
          pierce: def.pierce || 8, fxKind: "enlightenment",
          hitOpts: abilityHitOpts(def),
          abilityDef: def,
        });
        playAbilityCastFx(def, { target: t });
        break;
      }
      case "prismatic":
        fireAbilityProjectiles(def, def.count || 8, { circle: true, pierce: 1, speed: 260, style: "orb", r: 5, fxKind: def.id });
        playAbilityCastFx(def);
        break;
      case "orbit":
        inst.cd = 0.05;
        break;
      default:
        fireAbilityProjectiles(def, 1, {});
        playAbilityCastFx(def);
    }
  }

  function updateOrbitAbilities(dt) {
    if (!player || !player.abilities) return;
    for (const inst of player.abilities) {
      const def = resolveAbilityDef(inst);
      if (!def || def.type !== "orbit") continue;
      const n = def.count || 3;
      const radius = def.orbitRadius || 70;
      const spd = def.orbitSpeed || 2.5;
      inst.angle = (inst.angle || 0) + spd * dt;
      if (!inst.orbs) inst.orbs = [];
      for (let i = 0; i < n; i++) {
        const a = inst.angle + (i / n) * Math.PI * 2;
        const ox = player.x + Math.cos(a) * radius;
        const oy = player.y + Math.sin(a) * radius;
        // contact damage
        for (const e of enemies) {
          if (dist({ x: ox, y: oy }, e) < 14 + e.r * 0.5) {
            if ((inst._hitAcc = (inst._hitAcc || 0) + dt) > 0.11) {
              inst._hitAcc = 0;
              hitWithAbility(e, def, def.id === "morning_star" ? 0.55 : 0.38);
            }
          }
          // Morning Star chain (wiki: chain also damages)
          if (def.chainDamage || def.id === "morning_star") {
            const steps = 6;
            for (let s = 1; s < steps; s++) {
              const t = s / steps;
              const cx = player.x + (ox - player.x) * t;
              const cy = player.y + (oy - player.y) * t;
              if (dist({ x: cx, y: cy }, e) < 10 + e.r * 0.4) {
                if ((inst._chainAcc = (inst._chainAcc || 0) + dt) > 0.2) {
                  inst._chainAcc = 0;
                  hitWithAbility(e, def, 0.22);
                }
                break;
              }
            }
          }
        }
        let shape = "orb";
        let r = 7;
        if (def.id === "ring_blades") { shape = "blade"; r = 8; }
        else if (def.id === "morning_star") { shape = "star"; r = 12; }
        else if (def.id === "astronomers_orbs") { shape = "planet"; r = 8; }
        inst.orbs[i] = { x: ox, y: oy, color: def.color, r, shape, angle: a, chain: !!(def.chainDamage || def.id === "morning_star") };
      }
      inst.orbs.length = n;
    }
  }

  function updateAbilities(dt) {
    if (!player || !player.abilities) return;
    updateOrbitAbilities(dt);
    for (const inst of player.abilities) {
      const def = ABILITIES[inst.id];
      if (!def) continue;
      if (def.type === "orbit") continue; // continuous
      // golem / spirit: recast only if missing summons
      if (def.type === "golem") {
        const alive = summons.filter((s) => s.kind === "golem").length;
        if (alive >= Math.max(1, (resolveAbilityDef(inst) || def).count || 1)) continue;
      }
      if (def.type === "spirit") {
        const alive = summons.filter((s) => s.kind === "spirit").length;
        if (alive >= Math.min(2, Math.max(1, (resolveAbilityDef(inst) || def).count || 2))) continue;
      }
      inst.cd = Math.max(0, (inst.cd || 0) - dt);
      if (inst.cd <= 0) castAbility(inst);
    }
    // summons
    for (let i = summons.length - 1; i >= 0; i--) {
      const s = summons[i];
      if (s.life != null) {
        s.life -= dt;
        if (s.life <= 0) {
          summons.splice(i, 1);
          continue;
        }
      }
      let target = null;
      let best = s.kind === "spirit" ? 360 : 280;
      for (const e of enemies) {
        const d = dist(s, e);
        if (d < best) { best = d; target = e; }
      }
      if (target) {
        const dx = target.x - s.x;
        const dy = target.y - s.y;
        const d = Math.hypot(dx, dy) || 1;
        s.hitCd = (s.hitCd || 0) - dt;
        s.dashCd = (s.dashCd || 0) - dt;
        // Spirit Warrior: dash toward target periodically (wiki)
        if (s.kind === "spirit" && s.dashCd <= 0 && d > 40 && d < 280) {
          s.x += (dx / d) * Math.min(d, 90);
          s.y += (dy / d) * Math.min(d, 90);
          s.dashCd = 1.4;
          aoeFx.push({ x: s.x, y: s.y, r: 40, life: 0.25, maxLife: 0.25, color: s.color, style: "burst" });
          for (const e of enemies) {
            if (dist(s, e) < 45) damageEnemy(e, s.dmg * 0.7, false);
          }
        } else {
          const spd = s.kind === "golem" ? s.speed * 0.95 : s.speed;
          s.x += (dx / d) * spd * dt;
          s.y += (dy / d) * spd * dt;
        }
        if (d < s.r + target.r + 6 && s.hitCd <= 0) {
          damageEnemy(target, s.dmg, false);
          s.hitCd = s.kind === "golem" ? 0.55 : 0.4;
        }
      } else {
        const dx = player.x + (s.kind === "spirit" ? 40 : 50) - s.x;
        const dy = player.y - s.y;
        const d = Math.hypot(dx, dy) || 1;
        if (d > 40) {
          s.x += (dx / d) * s.speed * 0.65 * dt;
          s.y += (dy / d) * s.speed * 0.65 * dt;
        }
      }
    }
    updateAbilityHud();
  }

  function updateTomes(dt) {
    for (let i = tomes.length - 1; i >= 0; i--) {
      const t = tomes[i];
      t.life -= dt;
      t.bob += dt * 3;
      if (t.life <= 0) {
        tomes.splice(i, 1);
        continue;
      }
      if (dist(t, player) < t.r + player.r + 8) {
        const full = !!t.fullCatalog;
        const upg = !!t.upgradeMode;
        tomes.splice(i, 1);
        sfx("tome");
        openAbilityPick(full, upg);
        break;
      }
    }
  }

  function endGame(won) {
    state = won ? "win" : "lose";
    hideBanner();
    if (el.wellOverlay) el.wellOverlay.classList.add("hidden");
    if (won) sfx("win");
    else sfx("lose");
    el.endTitle.textContent = won ? "CHIẾN THẮNG!" : "THẤT BẠI";
    el.endTitle.style.color = won ? "#d4a84b" : "#c23b3b";
    const hallName = (currentHall && currentHall.name) || "Hall";
    const timeLabel = formatTime(elapsed);
    const phaseLabel = phase === "boss" || phase === "boss_announce" || won ? "Boss" : timeLabel;
    const itemN = (player.items || []).length;

    // Shards: clear bonus
    if (won) {
      if (playMode === "torment") {
        runShards += Math.round(8 + (tormentLevel || 1) * 3);
        // Unlock next level only after clear
        meta.tormentBest = Math.max(meta.tormentBest || 0, tormentLevel || 1);
        pendingTormentLevel = maxUnlockedTormentLevel();
        meta.tormentLevel = pendingTormentLevel;
      } else if (agonyEnabled) {
        runShards += Math.round(5 + agonyRank * 2);
      } else {
        runShards += 1;
      }
    }
    // Shard Magnet meta
    const shardFind = (meta.shardUpgrades && meta.shardUpgrades.shard_find) || 0;
    const shardMul = 1 + shardFind * ((SHARD_SHOP.shard_find && SHARD_SHOP.shard_find.shardMulPerRank) || 0.15);
    const shardsGained = Math.max(0, Math.round(runShards * shardMul));
    if (shardsGained > 0) {
      meta.shards = (meta.shards || 0) + shardsGained;
    }

    // Bank run gold → meta (Vault Tithe)
    const bankRank = (meta.shardUpgrades && meta.shardUpgrades.bank_bonus) || 0;
    const bankMul = 1 + bankRank * ((SHARD_SHOP.bank_bonus && SHARD_SHOP.bank_bonus.bankMulPerRank) || 0.1);
    const goldBanked = Math.max(0, Math.round(gold * bankMul));
    meta.gold = (meta.gold || 0) + goldBanked;

    saveMeta();
    updateMetaBar();

    el.endStats.textContent =
      `${player.name} · ${hallName} · ${diffLabel()} · Lv ${player.level} · ${kills} kills · ` +
      `+${goldBanked}G bank · +${shardsGained} Shards · ${itemN} items · ${phaseLabel} · ${timeLabel}`;
    showScreen("end");
  }

  function returnToMenu() {
    state = "menu";
    cancelAnimationFrame(animId);
    hideBanner();
    if (el.wellOverlay) el.wellOverlay.classList.add("hidden");
    el.bossBarWrap.classList.add("hidden");
    showScreen("menu");
    clampPendingTormentLevel();
    ensureDurationForMode();
    buildDurationPicks();
    buildTormentLevelPicks();
    buildArtifactGrid();
    updateDiffUI();
    rebuildCampUI();
    buildRunHeroStrip();
    updateStartButton();
    updateMetaBar();
    updateLoadoutLabel();
  }

  function fillBuildSummary() {
    const box = document.getElementById("build-summary");
    if (!box || !player) return;
    const ranks = player.traitRanks || {};
    const drPct = Math.round(defenseReduction(player.defense || 0) * 100);
    const traitLines = Object.keys(ranks).map((id) => {
      const r = ranks[id];
      const base = UPGRADES.find((t) => t.id === id);
      let name = base ? base.name : id;
      if (id.startsWith("abtr_")) {
        const parts = id.replace("abtr_", "").split("_");
        // abtr_<abilityId>_<key> — ability id may contain underscores
        const key = parts.pop();
        const abId = parts.join("_");
        const ab = ABILITIES[abId];
        const tpl = ABILITY_TRAIT_TEMPLATES.find((t) => t.key === key);
        name = `${tpl ? tpl.name : key} (${ab ? ab.name : abId})`;
      } else if (!base) {
        // weapon prof
        for (const g of Object.values(WEAPON_PROF)) {
          const w = g.find((t) => t.id === id);
          if (w) { name = w.name; break; }
        }
      }
      return `<li>${name} <strong>×${r}</strong></li>`;
    });
    const abLines = (player.abilities || []).map((inst) => {
      const def = ABILITIES[inst.id];
      const ups = (inst.upgradeIds || []).map((uid) => {
        const list = ABILITY_UPGRADES[inst.id] || [];
        const u = list.find((x) => x.id === uid);
        return u ? u.name : uid;
      });
      const dmg = Math.round((def ? def.damage : 0) * (inst.dmgMul || 1) * (player.abilityDmgMul || 1));
      return `<li style="color:${def ? def.color : "#ccc"}"><strong>${def ? def.name : inst.id}</strong> · ~${dmg} dmg${ups.length ? " · " + ups.join(", ") : ""}</li>`;
    });
    const itemLines = (player.items || []).map((entry) => {
      const id = itemIdOf(entry);
      const rar = itemRarityOf(entry);
      const it = ITEMS[id];
      if (!it) return "";
      const rm = rarityMeta(rar);
      return `<li style="color:${rm.color || it.color || "#d4a84b"}">${it.name} (${rm.label}) — ${itemDescFor(it, rar)}</li>`;
    });
    box.innerHTML = `
      <h3>Hero · wiki mechanics</h3>
      <ul><li>${player.name} · Lv ${player.level} · ${player.style || "—"} weapon</li>
      <li>HP ${Math.ceil(player.hp)}/${Math.round(player.maxHp)} · ATK ${Math.round(player.damage)}</li>
      <li>Crit ${Math.round((player.critChance || 0) * 100)}% · CritB +${Math.round((player.critBonus || 0) * 100)}% · Multi ${(player.multistrike || 1).toFixed(2)}</li>
      <li>Def ${Math.round(player.defense || 0)} (~${drPct}% DR) · Block ${Math.round(player.blockStrength || 0)} · Force ${(player.force || 1).toFixed(2)}</li>
      <li>XP Gain ${Math.round((player.xpGain || 1) * 100)}% · Effect +${Math.round((player.effectChance || 0) * 100)}%</li>
      <li>Gold ${gold} · Kills ${kills}</li></ul>
      <h3>Traits / Proficiency</h3>
      ${traitLines.length ? `<ul>${traitLines.join("")}</ul>` : `<p class="bs-empty">Chưa có trait</p>`}
      <h3>Abilities</h3>
      ${abLines.length ? `<ul>${abLines.join("")}</ul>` : `<p class="bs-empty">Chưa có ability</p>`}
      <h3>Items</h3>
      ${itemLines.filter(Boolean).length ? `<ul>${itemLines.join("")}</ul>` : `<p class="bs-empty">Chưa có item</p>`}
    `;
  }

  function loadMeta() {
    try {
      const raw = localStorage.getItem("hot_proto_meta_v3") || localStorage.getItem("hot_proto_meta_v2");
      if (!raw) return defaultMeta();
      const m = JSON.parse(raw);
      const loadout = Array.isArray(m.loadout)
        ? m.loadout.filter((e) => ITEMS[itemIdOf(e)]).slice(0, MAX_LOADOUT)
        : [];
      return {
        gold: m.gold || 0,
        shards: m.shards || 0,
        blessings: m.blessings && typeof m.blessings === "object" ? m.blessings : {},
        shardUpgrades: m.shardUpgrades && typeof m.shardUpgrades === "object" ? m.shardUpgrades : {},
        ownedMarks: m.ownedMarks && typeof m.ownedMarks === "object" ? m.ownedMarks : {},
        activeMark: m.activeMark && typeof m.activeMark === "string" ? m.activeMark : null,
        loadout,
        mode: m.mode === "torment" ? "torment" : "hall",
        durationId: m.durationId || "5",
        agony: !!m.agony,
        tormentLevel: Math.max(1, m.tormentLevel || 1),
        tormentBest: m.tormentBest || 0,
        artifacts: Array.isArray(m.artifacts) ? m.artifacts : [],
        hero: m.hero,
        hall: m.hall,
        _starterGranted: !!m._starterGranted,
      };
    } catch (_) {
      return defaultMeta();
    }
  }

  function saveMeta() {
    try {
      meta.hero = pendingHeroId || selectedClass || meta.hero;
      meta.hall = pendingHallId || selectedHallId || meta.hall;
      meta.mode = pendingMode === "torment" ? "torment" : "hall";
      meta.durationId = pendingDurationId;
      meta.agony = pendingAgony;
      meta.tormentLevel = pendingTormentLevel || 1;
      meta.artifacts = pendingArtifacts.slice();
      meta.loadout = (meta.loadout || []).slice(0, MAX_LOADOUT);
      localStorage.setItem("hot_proto_meta_v3", JSON.stringify(meta));
      localStorage.setItem("hot_proto_v1", JSON.stringify({ hero: meta.hero, hall: meta.hall }));
    } catch (_) { /* ignore */ }
  }

  function updateMetaBar() {
    const elG = document.getElementById("meta-gold");
    if (elG) elG.textContent = `Gold: ${meta.gold || 0}`;
    const elS = document.getElementById("meta-shards");
    if (elS) elS.textContent = `Shards: ${meta.shards || 0}`;
  }

  function saveMenuPrefs() {
    saveMeta();
  }

  function loadMenuPrefs() {
    return meta;
  }

  function updateDiffUI() {
    const isTorment = pendingMode === "torment";
    const zoneHalls = document.getElementById("zone-halls");
    const agonyBlock = document.getElementById("agony-block");
    const tlBlock = document.getElementById("torment-level-block");
    const artBlock = document.getElementById("artifacts-block");
    const diffLabelEl = document.getElementById("diff-zone-label");
    const modeHall = document.getElementById("mode-btn-hall");
    const modeTor = document.getElementById("mode-btn-torment");
    if (modeHall) modeHall.classList.toggle("selected", !isTorment);
    if (modeTor) modeTor.classList.toggle("selected", isTorment);
    if (zoneHalls) zoneHalls.classList.toggle("mode-disabled", isTorment);
    if (agonyBlock) agonyBlock.classList.toggle("hidden", isTorment);
    if (tlBlock) tlBlock.classList.toggle("hidden", !isTorment);
    if (artBlock) artBlock.classList.toggle("hidden", !isTorment);
    if (diffLabelEl) {
      diffLabelEl.textContent = isTorment
        ? "Torment · Level · Artifacts (full mở) · hall random"
        : "Hall · Thời gian · Agony";
    }
    const trLab = document.getElementById("torment-rank-label");
    if (trLab) trLab.textContent = `${pendingArtifacts.length} chọn`;
    updateArtifactCollapseSummary();
    if (typeof updateStartButton === "function") updateStartButton();

    const chk = document.getElementById("chk-agony");
    const hint = document.getElementById("agony-hint");
    const lab = document.getElementById("agony-label-text");
    if (chk) {
      chk.disabled = isTorment;
      if (isTorment) {
        chk.checked = false;
        pendingAgony = false;
      } else {
        chk.checked = !!pendingAgony;
      }
    }
    if (hint) {
      hint.textContent = isTorment
        ? "Agony chỉ dùng ở mode Hall"
        : "Hall only · meter → Rank 1–5 · Champions · +XP";
    }
    if (lab) lab.textContent = "Agony Mode (Hard)";

    document.querySelectorAll(".dur-btn").forEach((b) => {
      b.classList.toggle("selected", b.dataset.dur === pendingDurationId);
    });
    clampPendingTormentLevel();
    document.querySelectorAll(".tl-btn").forEach((b) => {
      const lv = Number(b.dataset.tl) || 0;
      const unlocked = isTormentLevelUnlocked(lv);
      b.classList.toggle("selected", lv === pendingTormentLevel);
      b.classList.toggle("best", lv === (meta.tormentBest || 0) && lv > 0);
      b.classList.toggle("locked", !unlocked);
      b.classList.toggle("next-unlock", lv === maxUnlockedTormentLevel() && lv > (meta.tormentBest || 0));
      b.disabled = !unlocked;
    });
    const tll = document.getElementById("torment-level-label");
    if (tll) tll.textContent = `Lv ${pendingTormentLevel}`;
    const tlh = document.getElementById("torment-level-hint");
    if (tlh) {
      const best = meta.tormentBest || 0;
      const next = maxUnlockedTormentLevel();
      tlh.textContent = best
        ? `Đã clear tới Lv ${best} · mở Lv ${next} · thắng màn mới mở cấp tiếp`
        : "Chỉ mở Lv 1 · thắng màn để mở Lv 2 · hall random";
    }

    const dur = findDuration(pendingDurationId);
    const pick = document.getElementById("pick-diff-label");
    if (pick) {
      if (isTorment) {
        const maxU = maxUnlockedTormentLevel();
        const an = pendingArtifacts.length;
        pick.innerHTML =
          `Run: <strong>Torment Lv ${pendingTormentLevel}/${maxU}` +
          `${an ? ` · A${an}` : ""} · ${dur ? dur.label : "10 phút"} · hall random</strong>`;
      } else {
        const parts = [dur ? dur.label : "5 phút"];
        if (pendingAgony) parts.push("Agony");
        pick.innerHTML = `Run: <strong>${parts.join(" · ")}</strong>`;
      }
    }
    const pickMode = document.getElementById("pick-mode-label");
    if (pickMode) {
      pickMode.innerHTML = isTorment
        ? `Mode: <strong>Torment Lv ${pendingTormentLevel}</strong>`
        : `Mode: <strong>Hall</strong>`;
    }
    const pickHall = document.getElementById("pick-hall-label");
    if (pickHall && isTorment) {
      pickHall.innerHTML = `Hall: <strong>Random</strong>`;
    } else if (pickHall && pendingHallId && HALLS[pendingHallId]) {
      pickHall.innerHTML = `Hall: <strong>${HALLS[pendingHallId].name}</strong>`;
    }
    updateStartButton();
    updateMetaBar();
    updateLoadoutLabel();
  }

  function setPlayMode(mode) {
    pendingMode = mode === "torment" ? "torment" : "hall";
    if (pendingMode === "torment") {
      pendingAgony = false;
      ensureDurationForMode();
      clampPendingTormentLevel();
    } else {
      ensureDurationForMode();
    }
    buildDurationPicks();
    buildTormentLevelPicks();
    updateDiffUI();
    saveMeta();
    sfx("ui");
  }

  function buildTormentLevelPicks() {
    const box = document.getElementById("torment-level-picks");
    if (!box) return;
    box.innerHTML = "";
    const absMax = TORMENT_MODE.absoluteMaxLevel || 99;
    const maxU = maxUnlockedTormentLevel();
    const ahead = TORMENT_MODE.showLockedAhead != null ? TORMENT_MODE.showLockedAhead : 3;
    // Show all unlocked + a few locked previews
    const showMax = Math.min(absMax, Math.max(maxU + ahead, 5));
    clampPendingTormentLevel();
    for (let lv = 1; lv <= showMax; lv++) {
      const unlocked = isTormentLevelUnlocked(lv);
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tl-btn"
        + (lv === pendingTormentLevel ? " selected" : "")
        + (unlocked ? "" : " locked")
        + (lv === maxU && lv > (meta.tormentBest || 0) ? " next-unlock" : "")
        + (lv === (meta.tormentBest || 0) && lv > 0 ? " best" : "");
      btn.dataset.tl = String(lv);
      btn.textContent = unlocked ? String(lv) : "🔒";
      btn.disabled = !unlocked;
      btn.title = unlocked
        ? `Torment Level ${lv}${lv === maxU && lv > (meta.tormentBest || 0) ? " · mở mới" : ""}`
        : `Khóa · clear Lv ${lv - 1} để mở`;
      btn.addEventListener("click", () => {
        if (!isTormentLevelUnlocked(lv)) {
          sfx("click");
          return;
        }
        pendingTormentLevel = lv;
        updateDiffUI();
        saveMeta();
        sfx("click");
      });
      box.appendChild(btn);
    }
  }

  function wireModeButtons() {
    document.querySelectorAll(".mode-btn").forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => setPlayMode(btn.dataset.mode || "hall"));
    });
  }

  function isArtifactsExpanded() {
    try {
      return localStorage.getItem("hot_proto_art_open") === "1";
    } catch (_) {
      return false;
    }
  }

  function setArtifactsExpanded(open) {
    try {
      localStorage.setItem("hot_proto_art_open", open ? "1" : "0");
    } catch (_) { /* ignore */ }
    const panel = document.getElementById("artifact-panel");
    const btn = document.getElementById("btn-art-collapse");
    if (panel) panel.classList.toggle("collapsed", !open);
    if (btn) btn.setAttribute("aria-expanded", open ? "true" : "false");
    updateArtifactCollapseSummary();
  }

  function updateArtifactCollapseSummary() {
    const elSum = document.getElementById("art-collapse-summary");
    if (!elSum) return;
    const n = pendingArtifacts.length;
    const open = document.getElementById("btn-art-collapse")?.getAttribute("aria-expanded") === "true";
    if (open) {
      elSum.textContent = n ? `${n} chọn · bấm thu gọn` : "bấm thu gọn";
    } else if (n === 0) {
      elSum.textContent = "thu gọn · 0 chọn";
    } else {
      const names = pendingArtifacts
        .slice(0, 3)
        .map((id) => (ARTIFACTS[id] && ARTIFACTS[id].name) || id)
        .join(", ");
      elSum.textContent = n > 3 ? `${names} +${n - 3}` : names;
      elSum.title = pendingArtifacts.map((id) => (ARTIFACTS[id] && ARTIFACTS[id].name) || id).join(", ");
    }
  }

  function wireArtifactCollapse() {
    const btn = document.getElementById("btn-art-collapse");
    if (!btn || btn.dataset.wired) return;
    btn.dataset.wired = "1";
    btn.addEventListener("click", () => {
      const open = btn.getAttribute("aria-expanded") === "true";
      setArtifactsExpanded(!open);
    });
    // default collapsed unless user expanded before
    setArtifactsExpanded(isArtifactsExpanded());
  }

  function rebuildCampUI() {
    buildBlessingGrid();
    buildWellGrid();
    buildMarkGrid();
    buildShardShopGrid();
    updateLoadoutLabel();
    updateMetaBar();
    syncSettingsUI();
    // Gear / blessings changed → refresh RUN hero stat compare
    if (typeof updateHeroStatPanel === "function") updateHeroStatPanel();
  }

  function buildMarkGrid() {
    const grid = document.getElementById("mark-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const active = meta.activeMark || null;
    for (const id of MARK_ORDER) {
      const m = MARKS[id];
      if (!m) continue;
      const owned = !!(meta.ownedMarks && meta.ownedMarks[id]);
      const equipped = owned && active === id;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "camp-card"
        + (owned ? " mark-owned" : "")
        + (equipped ? " maxed" : "")
        + (!owned && (meta.gold || 0) < (m.cost || 600) ? " cannot-afford" : "");
      const costLine = !owned
        ? `${m.cost || 600}G`
        : (equipped ? "EQUIPPED · click to unequip" : "OWNED · click to equip (any hero)");
      btn.innerHTML =
        `<strong style="color:${m.color || "#d4a84b"}">${m.name}</strong>` +
        `<span>${m.desc}</span>` +
        `<span class="camp-cost">${costLine}</span>`;
      btn.disabled = false;
      btn.addEventListener("click", () => {
        if (!owned) {
          if (!buyMark(id)) sfx("click");
        } else {
          equipMark(id);
        }
      });
      grid.appendChild(btn);
    }
  }

  /** Apply Torment artifact player-side mods at run start / rebind */
  function applyArtifactPlayerMods(p, dm) {
    if (!p || !dm) return;
    if (dm.playerHpMul && dm.playerHpMul !== 1) {
      p.maxHp = Math.max(30, Math.round(p.maxHp * dm.playerHpMul));
      p.hp = Math.min(p.hp, p.maxHp);
    }
    if (dm.playerRegenMul && dm.playerRegenMul !== 1) {
      p.regen = (p.regen || 0) * dm.playerRegenMul;
    }
    if (dm.playerDmgMul && dm.playerDmgMul !== 1) {
      p.damage *= dm.playerDmgMul;
    }
    if (dm.playerSpdMul && dm.playerSpdMul !== 1) {
      p.speed *= dm.playerSpdMul;
    }
    const f = dm.artFlags || {};
    if (f.playerMultistrikeAdd) {
      p.multistrike = Math.max(0.1, (p.multistrike || 1) + f.playerMultistrikeAdd);
    }
    if (f.flagAbilitySlotCut) {
      p.maxAbilities = Math.max(1, (typeof MAX_ABILITIES === "number" ? MAX_ABILITIES : 6) - (f.flagAbilitySlotCut | 0));
    }
    if (f.flagBurdenPerItem) {
      const n = (p.items && p.items.length) || (meta.loadout && meta.loadout.length) || 0;
      const cut = (f.burdenSpdPerItem || 0.04) * n;
      p.speed *= Math.max(0.4, 1 - cut);
    }
    if (f.flagPlayerModCut && f.playerModMul) {
      const m = f.playerModMul;
      p.damage *= m;
      p.critChance = (p.critChance || 0.1) * m;
      p.force = 1 + ((p.force || 1) - 1) * m;
      p.abilityDmgMul = 1 + ((p.abilityDmgMul || 1) - 1) * m;
    }
    if (f.flagElemIncubator) {
      const cm = f.elemChanceMul != null ? f.elemChanceMul : 0.3;
      p.weaponBurnChance = (p.weaponBurnChance || 0) * cm;
      p.weaponSparkChance = (p.weaponSparkChance || 0) * cm;
      p.weaponFrostChance = (p.weaponFrostChance || 0) * cm;
      p.elemDmgMul = (p.elemDmgMul || 1) * (f.elemDmgMul || 2);
    }
    if (f.flagFog || (dm.visionMul && dm.visionMul < 1)) {
      p._visionRangeMul = (p._visionRangeMul || 1) * (dm.visionMul || 0.55);
    }
    if (f.flagCommitGear) p.artCommitGear = true;
    if (f.flagGoldHurts) p.artGoldHurts = true;
    if (f.flagGlobalBurn) p.artGlobalBurn = f.globalBurnChance || 0.2;
    if (f.flagGhostOnKill) p.artGhostOnKill = f.ghostChance || 0.12;
    if (f.flagLevelHpTax) p.artLevelHpTax = f.levelHpTax || 1;
    if (f.flagHealCut) p.artHealMul = f.healMul != null ? f.healMul : 0.5;
    if (f.flagRandomAbility) p.artRandomAbility = true;
    if (f.flagRandomItem) p.artRandomItem = true;
    if (f.flagNoLevelTraits) p.artNoLevelTraits = true;
    if (f.flagNoDefenseTraits) p.artNoDefenseTraits = true;
    if (f.flagStatOnlyTraits) p.artStatOnlyTraits = true;
    if (f.flagSpawnAfterLord) p.artSpawnAfterLord = true;
    if (f.flagTripleLord) p.artTripleLord = true;
    if (f.flagPullAura) p.artPullAura = true;
    if (f.flagMagmaVessel) p.artMagmaVessel = true;
    if (f.flagFallenStar) p.artFallenStar = true;
    if (f.flagTraps) p.artTraps = true;
    if (f.flagRegretStacks) p.artRegret = true;
    if (f.flagSlowOnAttack) p.artSlowOnAttack = true;
    if (f.flagFragileOnMove) p.artFragileOnMove = true;
    if (f.flagGoldArmor) p.artGoldArmor = f.goldArmorMul != null ? f.goldArmorMul : 0.5;
    if (f.flagBogInvasion) p.artBogEvery = f.bogEveryKills || 500;
    if (f.flagMountainIdol) p.artMountainIdol = true;
    if (f.flagExtraBasics) p.artExtraBasics = true;
    if (f.flagExtraRanged) p.artExtraRanged = true;
    if (f.flagGiantFoes) p.artGiantFoes = true;
    p._artFlags = f;
  }

  function syncSettingsUI() {
    const vol = document.getElementById("set-vol");
    const lab = document.getElementById("vol-label");
    const sfxEl = document.getElementById("set-sfx");
    const sh = document.getElementById("set-shake");
    const gp = document.getElementById("set-gamepad");
    if (vol) vol.value = Math.round((settings.masterVol != null ? settings.masterVol : 0.55) * 100);
    if (lab) lab.textContent = `${vol ? vol.value : 55}%`;
    if (sfxEl) sfxEl.checked = !!settings.sfx;
    if (sh) sh.checked = settings.shake !== false;
    if (gp) gp.checked = settings.gamepad !== false;
  }

  function wireSettingsUI() {
    const vol = document.getElementById("set-vol");
    const lab = document.getElementById("vol-label");
    const sfxEl = document.getElementById("set-sfx");
    const sh = document.getElementById("set-shake");
    const gp = document.getElementById("set-gamepad");
    const clearBtn = document.getElementById("btn-clear-meta");
    if (vol && !vol.dataset.wired) {
      vol.dataset.wired = "1";
      vol.addEventListener("input", () => {
        settings.masterVol = (Number(vol.value) || 0) / 100;
        if (lab) lab.textContent = `${vol.value}%`;
        saveSettings();
      });
    }
    if (sfxEl && !sfxEl.dataset.wired) {
      sfxEl.dataset.wired = "1";
      sfxEl.addEventListener("change", () => {
        settings.sfx = !!sfxEl.checked;
        saveSettings();
        sfx("ui");
      });
    }
    if (sh && !sh.dataset.wired) {
      sh.dataset.wired = "1";
      sh.addEventListener("change", () => {
        settings.shake = !!sh.checked;
        saveSettings();
      });
    }
    if (gp && !gp.dataset.wired) {
      gp.dataset.wired = "1";
      gp.addEventListener("change", () => {
        settings.gamepad = !!gp.checked;
        saveSettings();
      });
    }
    if (clearBtn && !clearBtn.dataset.wired) {
      clearBtn.dataset.wired = "1";
      clearBtn.addEventListener("click", () => {
        if (!confirm("Xóa toàn bộ meta (gold, blessings, marks, shards, loadout)?")) return;
        try {
          localStorage.removeItem("hot_proto_meta_v3");
          localStorage.removeItem("hot_proto_meta_v2");
        } catch (_) { /* ignore */ }
        meta = defaultMeta();
        meta.gold = 500;
        meta._starterGranted = true;
        pendingArtifacts = [];
        pendingAgony = false;
        pendingMode = "hall";
        pendingTormentLevel = 1;
        saveMeta();
        rebuildCampUI();
        updateDiffUI();
        buildTormentLevelPicks();
        sfx("lose");
      });
    }
  }

  function buildBlessingGrid() {
    const grid = document.getElementById("blessing-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (const id of BLESSING_ORDER) {
      const b = BLESSINGS[id];
      if (!b) continue;
      const rank = (meta.blessings && meta.blessings[id]) || 0;
      const max = b.maxRank || 5;
      const maxed = rank >= max;
      const cost = blessingNextCost(id);
      const can = !maxed && (meta.gold || 0) >= cost;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "camp-card" + (maxed ? " maxed" : "") + (!can && !maxed ? " cannot-afford" : "");
      btn.innerHTML =
        `<strong>${b.name}</strong>` +
        `<span class="camp-rank">Rank ${rank}/${max}</span>` +
        `<span>${b.desc}</span>` +
        `<span class="camp-cost">${maxed ? "MAX" : `Next: ${cost}G`}</span>`;
      btn.disabled = maxed;
      btn.addEventListener("click", () => {
        if (buyBlessing(id)) {
          /* rebuilt in buy */
        } else if (!maxed) {
          showBanner("Thiếu Gold", `Cần ${cost}G bank`, 1.2);
        }
      });
      grid.appendChild(btn);
    }
  }

  function buildWellGrid() {
    const grid = document.getElementById("well-grid");
    if (!grid) return;
    grid.innerHTML = "";
    const load = new Set((meta.loadout || []).map(itemIdOf));
    const slotOrder = ["helmet", "amulet", "ring", "chest", "boots", "gloves"];
    for (const slot of slotOrder) {
      const header = document.createElement("div");
      header.className = "well-slot-header";
      const n = itemsInSlot(meta.loadout, slot).length;
      const lim = slotLimit(slot);
      header.textContent = `${ITEM_SLOT_LABELS[slot] || slot} · ${n}/${lim}`;
      header.style.gridColumn = "1 / -1";
      grid.appendChild(header);
      for (const id of ITEM_ORDER) {
        const it = ITEMS[id];
        if (!it || it.slot !== slot) continue;
        const on = load.has(id);
        const btn = document.createElement("button");
        btn.type = "button";
        btn.className = "camp-card" + (on ? " selected" : "");
        btn.innerHTML =
          `<strong style="color:${it.color || "#d4a84b"}">${it.name}</strong>` +
          `<span>${it.desc}</span>` +
          `<span class="camp-cost">${on ? "EQUIPPED (Common)" : "tap · start Common"}</span>`;
        btn.addEventListener("click", () => toggleLoadoutItem(id));
        grid.appendChild(btn);
      }
    }
  }

  function buildShardShopGrid() {
    const grid = document.getElementById("shard-shop-grid");
    if (!grid) return;
    grid.innerHTML = "";
    for (const id of SHARD_SHOP_ORDER) {
      const s = SHARD_SHOP[id];
      if (!s) continue;
      const rank = (meta.shardUpgrades && meta.shardUpgrades[id]) || 0;
      const max = s.maxRank || 5;
      const maxed = rank >= max;
      const cost = (s.costs && s.costs[rank]) || 5 * (rank + 1);
      const can = !maxed && (meta.shards || 0) >= cost;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "camp-card" + (maxed ? " maxed" : "") + (!can && !maxed ? " cannot-afford" : "");
      btn.innerHTML =
        `<strong>${s.name}</strong>` +
        `<span class="camp-rank">Rank ${rank}/${max}</span>` +
        `<span>${s.desc}</span>` +
        `<span class="camp-cost">${maxed ? "MAX" : `Next: ${cost} Shards`}</span>`;
      btn.disabled = maxed;
      btn.addEventListener("click", () => {
        if (!buyShardUpgrade(id) && !maxed) {
          showBanner("Thiếu Shards", `Cần ${cost} shards`, 1.2);
        }
      });
      grid.appendChild(btn);
    }
  }

  let campSubTab = "blessings";

  function switchCampSubTab(id) {
    const allowed = ["blessings", "well", "marks", "shards", "settings"];
    campSubTab = allowed.includes(id) ? id : "blessings";
    document.querySelectorAll(".camp-subtab").forEach((b) => {
      b.classList.toggle("selected", b.dataset.camp === campSubTab);
    });
    document.querySelectorAll("[data-camp-panel]").forEach((sec) => {
      sec.classList.toggle("hidden", sec.getAttribute("data-camp-panel") !== campSubTab);
    });
  }

  function wireCampSubTabs() {
    document.querySelectorAll(".camp-subtab").forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => {
        sfx("ui");
        switchCampSubTab(btn.dataset.camp || "blessings");
      });
    });
    switchCampSubTab(campSubTab);
  }

  function switchMenuTab(tab) {
    const run = document.getElementById("tab-run");
    const hero = document.getElementById("tab-hero");
    const camp = document.getElementById("tab-camp");
    const btnRun = document.getElementById("tab-btn-run");
    const btnHero = document.getElementById("tab-btn-hero");
    const btnCamp = document.getElementById("tab-btn-camp");
    const t = tab === "hero" || tab === "camp" ? tab : "run";
    if (run) run.classList.toggle("hidden", t !== "run");
    if (hero) hero.classList.toggle("hidden", t !== "hero");
    if (camp) camp.classList.toggle("hidden", t !== "camp");
    if (btnRun) btnRun.classList.toggle("selected", t === "run");
    if (btnHero) btnHero.classList.toggle("selected", t === "hero");
    if (btnCamp) btnCamp.classList.toggle("selected", t === "camp");
    if (t === "camp") {
      rebuildCampUI();
      switchCampSubTab(campSubTab);
    }
    if (t === "hero") {
      detailFocus = "hero";
      refreshDetailPanel();
      updateHeroStatPanel();
    }
    if (t === "run") {
      refreshDetailPanel();
      buildRunHeroStrip();
      updateStartButton();
    }
  }

  function openWellOverlay() {
    if (!player || state !== "playing") return;
    state = "well";
    const healRank = (meta.shardUpgrades && meta.shardUpgrades.well_heal) || 0;
    const healPct = (WELL_CFG.baseHeal || 0.3) + healRank * ((SHARD_SHOP.well_heal && SHARD_SHOP.well_heal.wellHealPerRank) || 0.1);
    if (el.wellOverlayHint) {
      el.wellOverlayHint.textContent = wellHealedThisRun
        ? "Heal đã dùng · bán item → gold bank (meta)"
        : `Heal ${Math.round(healPct * 100)}% Max HP (1 lần/run) · bán item → gold bank`;
    }
    const list = el.wellSellList;
    if (list) {
      list.innerHTML = "";
      const items = player.items || [];
      if (!items.length) {
        const p = document.createElement("p");
        p.className = "camp-hint";
        p.textContent = "Không có item để bán.";
        list.appendChild(p);
      } else {
        items.forEach((entry, idx) => {
          const id = itemIdOf(entry);
          const rar = itemRarityOf(entry);
          const it = ITEMS[id];
          if (!it) return;
          const rm = rarityMeta(rar);
          const price = Math.round((WELL_CFG.depositGoldMul || 8) * (12 + idx * 4) * rarityMul(rar));
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "well-sell-btn";
          btn.innerHTML = `Bán <strong style="color:${rm.color || it.color}">${it.name}</strong> (${rm.label}) → +${price}G bank`;
          btn.addEventListener("click", () => sellItemAtWell(idx, price));
          list.appendChild(btn);
        });
      }
    }
    const healBtn = document.getElementById("btn-well-heal");
    if (healBtn) {
      healBtn.disabled = wellHealedThisRun;
      healBtn.textContent = wellHealedThisRun ? "Đã heal" : `Heal ${Math.round(healPct * 100)}%`;
    }
    showScreen("well");
  }

  function closeWellOverlay() {
    if (el.wellOverlay) el.wellOverlay.classList.add("hidden");
    if (state === "well") {
      state = "playing";
      showScreen("game");
      lastTs = performance.now();
    }
    wellInteractCd = 0.8;
  }

  function healAtWell() {
    if (!player || wellHealedThisRun) return;
    const healRank = (meta.shardUpgrades && meta.shardUpgrades.well_heal) || 0;
    const healPct = (WELL_CFG.baseHeal || 0.3) + healRank * ((SHARD_SHOP.well_heal && SHARD_SHOP.well_heal.wellHealPerRank) || 0.1);
    const amt = Math.round(player.maxHp * healPct);
    player.hp = Math.min(player.maxHp, player.hp + amt);
    if (player.itemWarriorsFervor) player.fervorTimer = 8;
    wellHealedThisRun = true;
    floatingTexts.push({
      x: player.x, y: player.y - 40, text: `+${amt} HP`, life: 1.2, maxLife: 1.2, color: "#60e090", vy: -28,
    });
    openWellOverlay(); // refresh
    updateHud();
  }

  /**
   * Sell equipped item at well → bank gold immediately (meta).
   * Note: stats from sold item stay for this run (no full rebuild) —
   * we re-apply by full rebuild for correctness.
   */
  function sellItemAtWell(index, price) {
    if (!player || !player.items || index < 0 || index >= player.items.length) return;
    const entry = player.items[index];
    const id = itemIdOf(entry);
    const it = ITEMS[id];
    player.items.splice(index, 1);
    meta.gold = (meta.gold || 0) + price;
    saveMeta();
    updateMetaBar();
    // Rebuild player base + meta + remaining items (drop in-run traits? keep traits)
    rebuildPlayerFromMeta();
    floatingTexts.push({
      x: player.x, y: player.y - 48,
      text: `+${price}G bank`, life: 1.3, maxLife: 1.3, color: "#d4a84b", vy: -26,
    });
    updateItemHud();
    updateHud();
    openWellOverlay();
  }

  /** Rebuild core stats from class + meta + remaining items + trait ranks */
  function rebuildPlayerFromMeta() {
    if (!player) return;
    const keepHpRatio = player.maxHp > 0 ? player.hp / player.maxHp : 1;
    const keep = {
      x: player.x, y: player.y, level: player.level, xp: player.xp, xpNext: player.xpNext,
      abilities: player.abilities, traitRanks: player.traitRanks, items: (player.items || []).slice(),
      facing: player.facing, invuln: player.invuln, multiAcc: player.multiAcc,
      skillCd: player.skillCd, skillActive: player.skillActive, atk: player.atk,
    };
    const fresh = createPlayer(player.classId);
    Object.assign(player, fresh);
    player.x = keep.x;
    player.y = keep.y;
    player.level = keep.level;
    player.xp = keep.xp;
    player.xpNext = keep.xpNext;
    player.abilities = keep.abilities;
    player.traitRanks = keep.traitRanks;
    player.facing = keep.facing;
    player.invuln = keep.invuln;
    player.multiAcc = keep.multiAcc || 0;
    player.skillCd = keep.skillCd;
    player.skillActive = keep.skillActive;
    player.atk = keep.atk;
    applyMetaBonuses(player);
    reapplyTraitRanks(player);
    player.items = [];
    for (const entry of keep.items) {
      const iid = itemIdOf(entry);
      const rar = itemRarityOf(entry);
      const def = ITEMS[iid];
      if (!def) continue;
      player.items.push(makeItemEntry(iid, rar));
      applyItemDef(def, player, rar);
    }
    applyArtifactPlayerMods(player, getDiffMods());
    // Re-apply growth for levels already gained
    const growTimes = Math.max(0, (player.level || 1) - 1);
    for (let i = 0; i < growTimes; i++) {
      const fakeLv = i + 2;
      const real = player.level;
      player.level = fakeLv;
      applyItemGrowthTick(player);
      player.level = real;
    }
    player.hp = Math.max(1, Math.min(player.maxHp, Math.round(player.maxHp * keepHpRatio)));
  }

  function reapplyTraitRanks(p) {
    if (!p || !p.traitRanks) return;
    const list = Array.isArray(UPGRADES) ? UPGRADES : Object.values(UPGRADES || {});
    for (const tid of Object.keys(p.traitRanks)) {
      const rank = p.traitRanks[tid] || 0;
      const trait = list.find((t) => t && t.id === tid);
      if (!trait || !trait.apply) continue;
      for (let i = 0; i < rank; i++) trait.apply(p);
    }
  }

  function buildDurationPicks() {
    const box = document.getElementById("duration-picks");
    if (!box) return;
    box.innerHTML = "";
    ensureDurationForMode();
    const list = currentDurationList();
    for (const d of list) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "dur-btn" + (d.id === pendingDurationId ? " selected" : "");
      btn.dataset.dur = d.id;
      btn.textContent = d.label;
      btn.title = d.blurb || d.label;
      btn.addEventListener("click", () => {
        pendingDurationId = d.id;
        updateDiffUI();
        saveMeta();
        sfx("click");
      });
      box.appendChild(btn);
    }
  }

  const ART_PRESETS = {
    none: [],
    light: ["living_darkness", "confusing_lens", "mind_veil"],
    pain: ["scales_of_pain", "idol_of_hunger", "masters_vice", "burdening_stone", "scorched_hand"],
    chaos: [
      "scales_of_pain", "hastening_sands", "torment_banner", "malignant_mirror",
      "urn_of_the_damned", "golden_scarab", "demonic_cube", "totem_of_giants",
      "marching_drums", "fallen_star", "magma_vessel", "dementing_root",
    ],
  };
  let artSearchQuery = "";

  function filterArtifactButtons() {
    const q = (artSearchQuery || "").trim().toLowerCase();
    document.querySelectorAll(".art-btn").forEach((b) => {
      const id = b.dataset.art;
      const a = ARTIFACTS[id];
      if (!a) return;
      const hay = `${a.name} ${a.desc || ""} ${id}`.toLowerCase();
      b.classList.toggle("filtered-out", q && !hay.includes(q));
    });
  }

  function applyArtifactPreset(key) {
    const list = ART_PRESETS[key];
    if (!list) return;
    pendingArtifacts = list.filter((id) => ARTIFACTS[id]).slice();
    document.querySelectorAll(".art-btn").forEach((b) => {
      b.classList.toggle("selected", pendingArtifacts.includes(b.dataset.art));
    });
    document.querySelectorAll(".art-preset").forEach((b) => {
      b.classList.toggle("active", b.dataset.preset === key);
    });
    updateDiffUI();
    updateStartButton();
    saveMeta();
    toast(
      key === "none" ? "Artifacts: None" : `Preset ${key}: ${pendingArtifacts.length} art`,
      key === "pain" || key === "chaos" ? "warn" : "good"
    );
  }

  function wireArtifactTools() {
    const search = document.getElementById("art-search");
    if (search && !search.dataset.wired) {
      search.dataset.wired = "1";
      search.addEventListener("input", () => {
        artSearchQuery = search.value || "";
        filterArtifactButtons();
      });
    }
    document.querySelectorAll(".art-preset").forEach((btn) => {
      if (btn.dataset.wired) return;
      btn.dataset.wired = "1";
      btn.addEventListener("click", () => {
        sfx("ui");
        applyArtifactPreset(btn.dataset.preset || "none");
      });
    });
  }

  function buildArtifactGrid() {
    const grid = document.getElementById("artifact-grid");
    if (!grid) return;
    grid.innerHTML = "";
    wireArtifactTools();
    for (const id of ARTIFACT_ORDER) {
      const a = ARTIFACTS[id];
      if (!a) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "art-btn" + (pendingArtifacts.includes(id) ? " selected" : "");
      btn.dataset.art = id;
      btn.disabled = false;
      btn.innerHTML = `<strong style="color:${a.color || "#c080e0"}">${a.name}</strong>${a.desc || ""}`;
      btn.title = `${a.name}: ${a.desc} · full mở`;
      btn.addEventListener("click", () => {
        const i = pendingArtifacts.indexOf(id);
        if (i >= 0) pendingArtifacts.splice(i, 1);
        else pendingArtifacts.push(id);
        document.querySelectorAll(".art-btn").forEach((b) => {
          b.classList.toggle("selected", pendingArtifacts.includes(b.dataset.art));
        });
        document.querySelectorAll(".art-preset").forEach((b) => b.classList.remove("active"));
        updateDiffUI();
        updateStartButton();
        saveMeta();
        sfx("click");
      });
      grid.appendChild(btn);
    }
    filterArtifactButtons();
  }

  function wireAgonyCheckbox() {
    const chk = document.getElementById("chk-agony");
    if (!chk) return;
    chk.addEventListener("change", () => {
      pendingAgony = !!chk.checked && !chk.disabled;
      updateDiffUI();
      saveMeta();
    });
  }

  // ─── Gold / Chests / Items ───────────────────────────────
  function spawnGold(x, y, amount) {
    const gMul = (BALANCE.goldMul || 1) * (getDiffMods().goldMul || 1);
    goldCoins.push({
      x, y, r: 7,
      amount: Math.max(1, Math.round((amount || 1) * gMul)),
      vx: rand(-40, 40),
      vy: rand(-40, 40),
      life: 20,
      magnet: false,
    });
  }

  function spawnChest(x, y, rarity) {
    chests.push({
      x: clamp(x, 40, MAP_W - 40),
      y: clamp(y, 40, MAP_H - 40),
      r: 16,
      rarity: rarity || 1, // 1 normal, 2 rare, 3 boss
      life: 60,
      bob: Math.random() * Math.PI * 2,
      opened: false,
    });
  }

  function spawnBarrel(x, y) {
    if (barrels.length >= (BARREL_CFG.maxAlive || 10)) return;
    barrels.push({
      x: clamp(x != null ? x : rand(80, MAP_W - 80), 40, MAP_W - 40),
      y: clamp(y != null ? y : rand(80, MAP_H - 80), 40, MAP_H - 40),
      r: 14,
      hp: 1,
      bob: Math.random() * 6,
    });
  }

  function breakBarrel(b, idx) {
    if (idx == null) idx = barrels.indexOf(b);
    if (idx < 0) return;
    barrels.splice(idx, 1);
    sfx("barrel");
    for (let i = 0; i < 8; i++) {
      const a = Math.random() * Math.PI * 2;
      particles.push({
        x: b.x, y: b.y,
        vx: Math.cos(a) * rand(40, 120), vy: Math.sin(a) * rand(40, 120),
        life: 0.4, maxLife: 0.4, color: "#8a6030", size: rand(2, 5),
      });
    }
    if (Math.random() < (BARREL_CFG.potionChance || 0.72)) {
      const pid = POTION_ORDER[(Math.random() * POTION_ORDER.length) | 0] || "health";
      spawnPotionDrop(b.x + rand(-12, 12), b.y + rand(-12, 12), pid);
    }
    if (Math.random() < (BARREL_CFG.goldChance || 0.45)) {
      spawnGold(b.x, b.y, 3 + ((Math.random() * 5) | 0));
    }
  }

  function spawnPotionDrop(x, y, potionId) {
    const def = POTIONS[potionId];
    if (!def) return;
    potionDrops.push({
      x, y, r: 10,
      potionId,
      life: 28,
      bob: Math.random() * 6,
      color: def.color || "#e04040",
      name: def.name,
    });
  }

  function pickupPotion(potionId) {
    const def = POTIONS[potionId];
    if (!def || !player) return;
    if (def.apply) def.apply(player);
    if (player.itemWarriorsFervor && (potionId === "health" || potionId === "greater_health" || potionId === "cleanse")) {
      player.fervorTimer = 8;
    }
    sfx("potion");
    floatingTexts.push({
      x: player.x, y: player.y - 40,
      text: def.name, life: 1.0, maxLife: 1.0, color: def.color || "#e08080", vy: -28,
    });
  }

  function updateBarrels(dt) {
    barrelSpawnTimer -= dt;
    if (barrelSpawnTimer <= 0 && phase === "running") {
      barrelSpawnTimer = (BARREL_CFG.spawnInterval || 18) * (0.85 + Math.random() * 0.3);
      // spawn near player but not on top
      const a = Math.random() * Math.PI * 2;
      const d = 180 + Math.random() * 220;
      spawnBarrel(player.x + Math.cos(a) * d, player.y + Math.sin(a) * d);
    }
    for (let i = barrels.length - 1; i >= 0; i--) {
      const b = barrels[i];
      b.bob += dt * 2;
      // player walk-in breaks
      if (dist(b, player) < b.r + player.r + 4) {
        breakBarrel(b, i);
        continue;
      }
      // enemy projectiles / melee not needed — contact enough for proto
    }
  }

  function updatePotionDrops(dt) {
    for (let i = potionDrops.length - 1; i >= 0; i--) {
      const p = potionDrops[i];
      p.life -= dt;
      p.bob += dt * 3;
      if (p.life <= 0) {
        potionDrops.splice(i, 1);
        continue;
      }
      if (dist(p, player) < p.r + player.r + 8) {
        pickupPotion(p.potionId);
        potionDrops.splice(i, 1);
      }
    }
  }

  function updatePotionBuffs(dt) {
    if (!player) return;
    if (player.potionHaste > 0) player.potionHaste -= dt;
    if (player.potionPower > 0) player.potionPower -= dt;
    if (player.potionIron > 0) player.potionIron -= dt;
    if (player.potionMagnet > 0) player.potionMagnet -= dt;
    if (player.potionWrath > 0) player.potionWrath -= dt;
  }

  function potionDamageMul() {
    if (!player) return 1;
    let m = 1;
    if (player.potionPower > 0) m *= 1.5;
    if (player.potionWrath > 0) m *= 1.15;
    return m;
  }

  function effectivePickupRange() {
    if (!player) return 80;
    let r = player.pickupRange || 80;
    if (player.potionMagnet > 0) r *= 2.8;
    return r;
  }

  function updateGoldCoins(dt) {
    for (let i = goldCoins.length - 1; i >= 0; i--) {
      const g = goldCoins[i];
      g.life -= dt;
      g.vx *= 0.92;
      g.vy *= 0.92;
      g.x += g.vx * dt;
      g.y += g.vy * dt;
      const pullR = effectivePickupRange() * 1.2;
      if (dist(g, player) < pullR) g.magnet = true;
      if (g.magnet) {
        const dx = player.x - g.x;
        const dy = player.y - g.y;
        const d = Math.hypot(dx, dy) || 1;
        g.x += (dx / d) * 280 * dt;
        g.y += (dy / d) * 280 * dt;
      }
      if (dist(g, player) < g.r + player.r + 6) {
        gold += g.amount;
        // Golden Scarab: gold pickups hurt equal to value
        if (player.artGoldHurts) {
          player.hp = Math.max(1, player.hp - g.amount * 0.35);
          floatingTexts.push({
            x: g.x, y: g.y - 22, text: `−${Math.round(g.amount * 0.35)}`, life: 0.55, maxLife: 0.55, color: "#e06060", vy: -25,
          });
        }
        if (Math.random() < 0.35) sfx("gold");
        floatingTexts.push({
          x: g.x, y: g.y - 10, text: `+${g.amount}G`, life: 0.7, maxLife: 0.7, color: "#d4a84b", vy: -30,
        });
        goldCoins.splice(i, 1);
        continue;
      }
      if (g.life <= 0) goldCoins.splice(i, 1);
    }
  }

  function updateChests(dt) {
    for (let i = chests.length - 1; i >= 0; i--) {
      const c = chests[i];
      c.life -= dt;
      c.bob += dt * 2.5;
      if (c.life <= 0) {
        chests.splice(i, 1);
        continue;
      }
      if (!c.opened && dist(c, player) < c.r + player.r + 10) {
        c.opened = true;
        chests.splice(i, 1);
        openItemPick(c.rarity);
        break;
      }
    }
  }

  function updateWells(dt) {
    if (wellInteractCd > 0) wellInteractCd -= dt;
    for (const w of wells) {
      w.bob += dt * 2;
      if (wellInteractCd > 0) continue;
      if (dist(w, player) < w.r + player.r + 12) {
        openWellOverlay();
        break;
      }
    }
  }

  /** Wiki equipment runtime procs (Common-tier simplified) */
  function updateItemEffects(dt) {
    if (!player) return;
    // Guiding Star + Berserker boots + Vision crown range
    if (player.itemGuidingStar) {
      if (player.moving) {
        player._gsAsp = 0.8;
        player._gsMs = 1.3;
      } else {
        player._gsAsp = 1.3;
        player._gsMs = 0.8;
      }
    } else {
      player._gsAsp = 1;
      player._gsMs = 1;
    }
    if (player.itemBerserkerBoots && player.moving) {
      player._gsAsp = (player._gsAsp || 1) * 1.15;
    }
    // Wind Crown ASP from charges
    if (player.itemWindCrown) {
      player.windCharges = Math.max(0, (player.windCharges || 0) - dt * 8);
    }
    // Maiden charge
    if (player.itemMaidenTear && (player.maidenCharge || 0) < 30) {
      player.maidenCharge = Math.min(30, (player.maidenCharge || 0) + dt);
    }
    // Mask of Madness
    if (player.itemMaskMadness) {
      player.maskTimer = (player.maskTimer || 25) - dt;
      if (player.maskTimer <= 0) {
        player.maskTimer = 25;
        player.hp = Math.max(1, player.hp - 20);
        player.madnessStacks = (player.madnessStacks || 0) + 1;
        floatingTexts.push({
          x: player.x, y: player.y - 36, text: "MADNESS", life: 0.8, maxLife: 0.8, color: "#c060e0", vy: -30,
        });
      }
    }
    // War Horns fragile aura
    if (player.itemWarHorns) {
      player.warHornTimer = (player.warHornTimer || 0) - dt;
      if (player.warHornTimer <= 0) {
        player.warHornTimer = 3;
        for (const e of enemies) {
          if (dist(player, e) < 120) applyStatus(e, "fragile", 3, 1);
        }
      }
    }
    // Gorgon Mask
    if (player.itemGorgon) {
      player.gorgonTimer = (player.gorgonTimer || 0) - dt;
      if (player.gorgonTimer <= 0) {
        player.gorgonTimer = 1;
        for (const e of enemies) {
          if (dist(player, e) < 90) {
            applyStatus(e, "slow", 1.5, 1);
            e.hp -= 8 + ((e.st && e.st.slow) || 0) * 4;
            if (e.hp <= 0) killEnemy(e);
          }
        }
      }
    }
    // Frost breath
    if (player.itemFrostBreath) {
      player.frostBreathTimer = (player.frostBreathTimer || 0) - dt;
      if (player.frostBreathTimer <= 0) {
        player.frostBreathTimer = 3;
        const f = player.facing || 1;
        for (const e of enemies) {
          if (Math.sign(e.x - player.x) === f || Math.abs(e.x - player.x) < 40) {
            if (dist(player, e) < 110) {
              applyStatus(e, "slow", 2.5, 1);
              e.hp -= 18;
              if (e.hp <= 0) killEnemy(e);
            }
          }
        }
      }
    }
    // Blazing Shell aura
    if (player.itemBlazingShell) {
      player.blazeTimer = (player.blazeTimer || 0) - dt;
      if (player.blazeTimer <= 0) {
        player.blazeTimer = 0.5;
        for (const e of enemies) {
          if (dist(player, e) < 80 && Math.random() < 0.08) applyStatus(e, "burn", 2.5, 6);
        }
      }
    }
    // Shadow Cloak patches
    if (player.itemShadowCloak) {
      player.shadowTimer = (player.shadowTimer || 0) - dt;
      if (player.shadowTimer <= 0) {
        player.shadowTimer = 2;
        itemPatches.push({
          kind: "shadow", x: player.x + rand(-40, 40), y: player.y + rand(-40, 40),
          r: 36, life: 4, dmg: 12, tick: 0.5, tickAcc: 0, color: "#403060",
        });
      }
    }
    // Broker cape
    if (player.itemBrokerCape) {
      player.brokerTimer = (player.brokerTimer || 0) - dt;
      if (player.brokerTimer <= 0) {
        player.brokerTimer = 1;
        const kinds = ["fragile", "slow", "decay"];
        for (const e of enemies) {
          if (dist(player, e) < 90 && Math.random() < 0.2) {
            applyStatus(e, kinds[(Math.random() * 3) | 0], 2.5, 1);
          }
        }
      }
    }
    // Thunder Cape
    if (player.itemThunderCape) {
      player.thunderCapeTimer = (player.thunderCapeTimer || 0) - dt;
      if (player.thunderCapeTimer <= 0) {
        player.thunderCapeTimer = 2;
        let best = null;
        let bestHp = -1;
        const pr = player.pickupRange || 80;
        for (const e of enemies) {
          if (dist(player, e) < pr + 40 && e.hp > bestHp) { bestHp = e.hp; best = e; }
        }
        if (best) {
          best.hp -= 50;
          applyStatus(best, "electrify", 3, 1);
          for (const o of enemies) {
            if (o !== best && dist(best, o) < 70) {
              o.hp -= 20;
              applyStatus(o, "electrify", 2, 1);
              if (o.hp <= 0) killEnemy(o);
            }
          }
          if (best.hp <= 0) killEnemy(best);
        }
      }
    }
    // Crone gown
    if (player.itemCronesGown) {
      player.croneTimer = (player.croneTimer || 0) - dt;
      if (player.croneTimer <= 0) {
        player.croneTimer = 1.2;
        for (let i = 0; i < 3; i++) {
          const a = Math.random() * Math.PI * 2;
          itemPatches.push({
            kind: "decay", x: player.x + Math.cos(a) * 50, y: player.y + Math.sin(a) * 50,
            r: 28, life: 2.5, dmg: 0, decay: true, color: "#508040",
          });
        }
      }
    }
    // Firewalker / bog / electro / grasp trails
    if (player.moving) {
      const step = Math.hypot(player._lastMx || 0, player._lastMy || 0) || player.speed * dt;
      if (player.itemFirewalker) {
        player.firewalkerDist = (player.firewalkerDist || 0) + step;
        if (player.firewalkerDist >= 50) {
          player.firewalkerDist = 0;
          itemPatches.push({
            kind: "fire", x: player.x, y: player.y, r: 22, life: 2.5, dmg: 18, burn: 0.1, color: "#e05020",
          });
        }
      }
      if (player.itemBogBoots) {
        player.bogDist = (player.bogDist || 0) + step;
        if (player.bogDist >= 40) {
          player.bogDist = 0;
          itemPatches.push({
            kind: "goo", x: player.x, y: player.y, r: 26, life: 3.5, dmg: 0, slow: true, color: "#608050",
          });
        }
      }
      if (player.itemElectroTreads) {
        player.electroCharge = (player.electroCharge || 0) + dt;
        if (player.electroCharge >= 1.8) {
          player.electroCharge = 0;
          for (const e of enemies) {
            if (dist(player, e) < 100) {
              e.hp -= 35;
              applyStatus(e, "electrify", 2, 1);
              if (e.hp <= 0) killEnemy(e);
            }
          }
        }
      }
      if (player.itemDemonicGrasp) {
        player.graspDist = (player.graspDist || 0) + step;
        if (player.graspDist >= 90) {
          player.graspDist = 0;
          for (const e of enemies) {
            if (dist(player, e) < 110) {
              e.hp -= 12;
              // pull
              const d = dist(player, e) || 1;
              e.x += (player.x - e.x) / d * 12;
              e.y += (player.y - e.y) / d * 12;
              if (e.hp <= 0) killEnemy(e);
            }
          }
        }
      }
    } else {
      player.electroCharge = Math.max(0, (player.electroCharge || 0) - dt * 0.5);
      // Hunter garb still
      if (player.itemHuntersGarb) player.hunterStill = Math.min(15, (player.hunterStill || 0) + dt);
      // Pace setter
      if (player.itemPaceSetter) {
        player.paceTimer = (player.paceTimer || 0) + dt;
        if (player.paceTimer >= 5) {
          player.paceTimer = 0;
          player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.01);
        }
      }
      // Swamp raisers
      if (player.itemSwampRaisers) {
        player.swampTimer = (player.swampTimer || 0) - dt;
        if (player.swampTimer <= 0) {
          player.swampTimer = 0.33;
          for (const e of enemies) {
            if (dist(player, e) < 70 && Math.random() < 0.5) applyStatus(e, "decay", 2, 1);
          }
        }
      }
    }
    if (player.moving) player.hunterStill = 0;

    // Pace setter combat buffs
    // Frost greaves
    if (player.itemFrostGreaves) {
      player.frostGreaveTimer = (player.frostGreaveTimer || 0) - dt;
      if (player.frostGreaveTimer <= 0) {
        player.frostGreaveTimer = 1;
        const pr = player.pickupRange || 80;
        for (const e of enemies) {
          if (dist(player, e) < pr && Math.random() < 0.15) {
            applyStatus(e, "slow", 2, 1);
            e.hp -= 12;
            if (e.hp <= 0) killEnemy(e);
          }
        }
      }
    }
    // Holy Relic
    if (player.itemHolyRelic) {
      player.holyRelicTimer = (player.holyRelicTimer || 0) - dt;
      if (player.holyRelicTimer <= 0) {
        player.holyRelicTimer = 30;
        if (player.hp < player.maxHp) {
          player.hp = Math.min(player.maxHp, player.hp + 50);
          player.regen = (player.regen || 0) + 0.05;
          floatingTexts.push({
            x: player.x, y: player.y - 40, text: "HOLY", life: 0.9, maxLife: 0.9, color: "#f0e0a0", vy: -28,
          });
        } else {
          player.damage *= 1.03;
        }
      }
    }
    // Blood Catcher tick
    if (player.itemBloodCatcher) {
      player.bloodCatcherTimer = (player.bloodCatcherTimer || 0) - dt;
      if (player.bloodCatcherTimer <= 0) {
        player.bloodCatcherTimer = 5;
        const thr = player.maxHp * 20;
        if ((player.bloodCatcherAcc || 0) >= thr) {
          if (player.hp < player.maxHp) player.hp = Math.min(player.maxHp, player.hp + 3);
          else player.damage *= 1.01;
          player.bloodCatcherAcc = 0;
        }
      }
    }
    // Fervor decay
    if (player.fervorTimer > 0) player.fervorTimer -= dt;
    // Defiant decay
    if (player.defiantTimer > 0) {
      player.defiantTimer -= dt;
      if (player.defiantTimer <= 0) player.defiantStacks = Math.max(0, (player.defiantStacks || 0) - 1);
    }
    // Spellcaster idle
    if (player.itemSpellcaster) {
      if (player.attackTimer > player.attackCooldown * 0.5) player.spellIdle = (player.spellIdle || 0) + dt;
      else player.spellIdle = 0;
    }
    // Spike cd
    if (player.spikeCd > 0) player.spikeCd -= dt;
    // Summon rings
    tickItemSummons(dt);
    // Alchemist trade absorb
    if (player.itemAlchTrade) {
      for (const e of enemies) {
        if (dist(player, e) < 70 && e.st) {
          if (e.st.burn > 0 || e.st.electrify > 0 || e.st.decay > 0 || e.st.slow > 0) {
            player.alchAbsorb = Math.min(20, (player.alchAbsorb || 0) + dt * 0.5);
          }
        }
      }
    }
    // Fighter band on elite/miniboss/boss present
    if (player.itemFighterBand) {
      let eliteNear = enemies.some((e) => e.isElite || e.isMiniboss || e.isBoss || e.isChampion);
      if (eliteNear) {
        player.hp = Math.min(player.maxHp, player.hp + player.maxHp * 0.005 * dt);
      }
    }
    // Beast hide companion as periodic aoe
    if (player.itemBeastHide) {
      player.beastTimer = (player.beastTimer || 0) - dt;
      if (player.beastTimer <= 0) {
        player.beastTimer = 2.5;
        for (const e of enemies) {
          if (dist(player, e) < 100) {
            e.hp -= 22;
            if (e.hp <= 0) killEnemy(e);
          }
        }
      }
    }
  }

  function tickItemSummons(dt) {
    const spawnMinion = (kind, dmg, life, color) => {
      const a = Math.random() * Math.PI * 2;
      // Cap concurrent item minions
      const itemMins = summons.filter((s) => String(s.kind || "").startsWith("item_")).length;
      if (itemMins >= 8) return;
      summons.push({
        kind: "item_" + kind,
        x: player.x + Math.cos(a) * 40,
        y: player.y + Math.sin(a) * 40,
        r: 10,
        dmg: dmg * (player.summonDmgMul || 1),
        life: life,
        maxLife: life,
        color,
        speed: kind === "rat" ? 160 : kind === "imp" ? 130 : 100,
        hitCd: 0.4,
        dashCd: 0,
        vx: 0, vy: 0,
      });
    };
    if (player.itemDemonicBond) {
      player.impTimer = (player.impTimer || 0) - dt;
      if (player.impTimer <= 0) {
        player.impTimer = 5 / (player.summonCountMul || 1);
        spawnMinion("imp", 18, 10, "#e05030");
      }
    }
    if (player.itemNecroClutch) {
      player.skelTimer = (player.skelTimer || 0) - dt;
      if (player.skelTimer <= 0) {
        player.skelTimer = 12 / (player.summonCountMul || 1);
        spawnMinion("skel", 22, 18, "#a0b0c0");
      }
    }
    if (player.itemPestRing) {
      player.ratTimer = (player.ratTimer || 0) - dt;
      if (player.ratTimer <= 0) {
        player.ratTimer = 2.2 / (player.summonCountMul || 1);
        spawnMinion("rat", 10, 6, "#808060");
      }
    }
    // Mark of Rituals — Skeleton Mage support
    if (player.markSkeletonMage) {
      player.markMageTimer = (player.markMageTimer || 0) - dt;
      if (player.markMageTimer <= 0) {
        player.markMageTimer = 14 / (player.summonCountMul || 1);
        spawnMinion("skel_mage", 28, 22, "#9040c0");
      }
    }
    // Mark of the Beast — Hound companion
    if (player.markHound) {
      player.markHoundTimer = (player.markHoundTimer || 0) - dt;
      if (player.markHoundTimer <= 0) {
        player.markHoundTimer = 8 / (player.summonCountMul || 1);
        spawnMinion("hound", 24, 16, "#a07040");
      }
    }
    // Mark of Growth — bog plants over time / while moving
    if (player.markBogPlants) {
      player.markPlantTimer = (player.markPlantTimer || 0) - dt;
      const need = player.moving ? 1.2 : 2.8;
      if (player.markPlantTimer <= 0) {
        player.markPlantTimer = need;
        itemPatches.push({
          kind: "bog_plant", x: player.x + rand(-40, 40), y: player.y + rand(-40, 40),
          r: 28, life: 6, dmg: 8 * (player.summonDmgMul || 1), decay: true, tick: 0.4, color: "#508040",
        });
      }
    }
    // Mark of Alchemy — element flasks
    if (player.markAlchemyFlasks) {
      player.markFlaskTimer = (player.markFlaskTimer || 0) - dt;
      if (player.markFlaskTimer <= 0) {
        player.markFlaskTimer = 4.5;
        const elems = ["burn", "spark", "frost", "decay"];
        const eln = elems[(Math.random() * elems.length) | 0];
        const tgt = nearestEnemies(player, 1, 320)[0];
        if (tgt) {
          const opts = { baseDmg: player.damage * 0.4 };
          if (eln === "burn") opts.burn = true;
          if (eln === "spark") opts.spark = true;
          if (eln === "frost") opts.frost = true;
          if (eln === "decay") opts.decay = true;
          damageEnemy(tgt, player.damage * 0.45, false, opts);
          aoeFx.push({ x: tgt.x, y: tgt.y, r: 36, life: 0.2, maxLife: 0.2, color: "#80c060", style: "burst" });
        }
      }
    }
    // Artifact: Magma Vessel / Fallen Star hazards
    if (player.artMagmaVessel) {
      player._magmaT = (player._magmaT || 0) - dt;
      if (player._magmaT <= 0) {
        player._magmaT = 2.8;
        const px = player.x + rand(-90, 90);
        const py = player.y + rand(-90, 90);
        itemPatches.push({
          kind: "lava", x: px, y: py, r: 40, life: 2.2, dmg: 14, burn: 0.4, tick: 0.35, color: "#e05020", hurtPlayer: true,
        });
      }
    }
    if (player.artFallenStar) {
      player._starT = (player._starT || 0) - dt;
      if (player._starT <= 0) {
        player._starT = 3.5;
        const px = player.x + rand(-120, 120);
        const py = player.y + rand(-120, 120);
        aoeFx.push({ x: px, y: py, r: 50, life: 0.35, maxLife: 0.35, color: "#a0c0ff", style: "burst" });
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          if (Math.hypot(e.x - px, e.y - py) < 55) {
            e.hp -= 35;
            e.hitFlash = 0.1;
            if (e.hp <= 0) killEnemy(e);
          }
        }
        if (Math.hypot(player.x - px, player.y - py) < 50) {
          player.hp = Math.max(1, player.hp - 8);
        }
      }
    }
    // Artifact pull aura (Alluring Flute)
    if (player.artPullAura) {
      player._pullT = (player._pullT || 0) - dt;
      if (player._pullT <= 0) {
        player._pullT = 0.33;
        for (const e of enemies) {
          if (e.hp <= 0) continue;
          const d = dist(player, e);
          if (d < 200 && d > 1) {
            const pull = 18;
            e.x += ((player.x - e.x) / d) * pull;
            e.y += ((player.y - e.y) / d) * pull;
          }
        }
      }
    }
  }

  function updateItemPatches(dt) {
    for (let i = itemPatches.length - 1; i >= 0; i--) {
      const p = itemPatches[i];
      p.life -= dt;
      if (p.life <= 0) {
        itemPatches.splice(i, 1);
        continue;
      }
      p.tickAcc = (p.tickAcc || 0) + dt;
      const interval = p.tick || 0.35;
      if (p.tickAcc < interval) continue;
      p.tickAcc = 0;
      for (const e of enemies) {
        if (e.hp <= 0) continue;
        if (dist(p, e) > p.r + e.r) continue;
        if (p.dmg) {
          e.hp -= p.dmg * interval;
          e.hitFlash = 0.06;
        }
        if (p.burn && Math.random() < p.burn) applyStatus(e, "burn", 2, 5);
        if (p.slow) applyStatus(e, "slow", 1.5, 1);
        if (p.decay) applyStatus(e, "decay", 2, 1);
        if (p.stun) e.frostSlow = Math.max(e.frostSlow || 0, 0.6);
        if (e.hp <= 0) killEnemy(e);
      }
      // Magma Vessel etc.: also hurt player
      if (p.hurtPlayer && player && dist(p, player) < p.r + (player.r || 12)) {
        player.hp = Math.max(1, player.hp - (p.dmg || 10) * interval * 0.45);
      }
    }
  }

  function maxAbilitySlots() {
    if (player && player.maxAbilities != null) return Math.max(1, player.maxAbilities | 0);
    return MAX_ABILITIES;
  }

  function abilityUpgradeCap() {
    let cap = MAX_ABILITY_UPGRADES || 2;
    if (player && player.markExtraAbilityUpgrade) cap += 1;
    return cap;
  }

  function drawWells() {
    for (const w of wells) {
      const sx = w.x - camera.x;
      const sy = w.y - camera.y + Math.sin(w.bob) * 2;
      if (sx < -40 || sy < -40 || sx > W + 40 || sy > H + 40) continue;
      // stone rim
      ctx.beginPath();
      ctx.ellipse(sx, sy + 6, w.r + 4, w.r * 0.45, 0, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(sx, sy, w.r, 0, Math.PI * 2);
      ctx.fillStyle = "#2a3040";
      ctx.fill();
      ctx.strokeStyle = "#6a7890";
      ctx.lineWidth = 3;
      ctx.stroke();
      // water
      ctx.beginPath();
      ctx.arc(sx, sy, w.r - 6, 0, Math.PI * 2);
      const g = ctx.createRadialGradient(sx - 4, sy - 4, 2, sx, sy, w.r - 6);
      g.addColorStop(0, "#70d0e8");
      g.addColorStop(1, "#2860a0");
      ctx.fillStyle = g;
      ctx.fill();
      // glow
      ctx.beginPath();
      ctx.arc(sx, sy, w.r + 8 + Math.sin(w.bob * 2) * 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(100,200,255,0.35)";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.font = "bold 11px Segoe UI";
      ctx.fillStyle = "#a0e0ff";
      ctx.textAlign = "center";
      ctx.fillText("WELL", sx, sy - w.r - 8);
    }
  }

  function slotLimit(slot) {
    return ITEM_SLOT_LIMITS[slot] != null ? ITEM_SLOT_LIMITS[slot] : 1;
  }

  function itemsInSlot(list, slot) {
    return (list || []).filter((entry) => {
      const id = itemIdOf(entry);
      return ITEMS[id] && ITEMS[id].slot === slot;
    });
  }

  /** Equip with wiki slot rules (replace oldest in that slot when full) */
  function equipItem(itemId, rarity) {
    const def = ITEMS[itemId];
    if (!def || !player) return;
    const rar = rarity || "common";
    player.items = player.items || [];
    const slot = def.slot || "ring";
    const lim = slotLimit(slot);
    if (player.items.some((e) => itemIdOf(e) === itemId) && slot !== "ring") {
      floatingTexts.push({
        x: player.x, y: player.y - 42,
        text: "Already equipped", life: 0.9, maxLife: 0.9, color: "#a09080", vy: -20,
      });
      return;
    }
    let inSlot = itemsInSlot(player.items, slot);
    while (inSlot.length >= lim) {
      const drop = inSlot.shift();
      const idx = player.items.indexOf(drop);
      if (idx >= 0) player.items.splice(idx, 1);
      inSlot = itemsInSlot(player.items, slot);
    }
    player.items.push(makeItemEntry(itemId, rar));
    rebuildPlayerFromMeta();
    const rm = rarityMeta(rar);
    floatingTexts.push({
      x: player.x, y: player.y - 42,
      text: `${def.name} (${rm.label})`, life: 1.2, maxLife: 1.2,
      color: rm.color || def.color || "#d4a84b", vy: -24,
    });
    updateItemHud();
  }

  function openItemPick(chestRarity) {
    const owned = new Set((player.items || []).map(itemIdOf));
    let pool = ITEM_ORDER.filter((id) => {
      const it = ITEMS[id];
      if (!it) return false;
      if (owned.has(id)) return false;
      return true;
    });
    if (!pool.length) pool = ITEM_ORDER.slice();
    const options = shuffle(pool).slice(0, 3).map((id) => ({
      id,
      rarity: rollItemRarity(chestRarity || 1),
    }));
    state = "levelup";
    levelUpMode = "item_chest";
    sfx("chest");
    el.upgradeOptions.innerHTML = "";
    const title = el.levelup && el.levelup.querySelector("h2");
    const sub = document.getElementById("levelup-sub") || (el.levelup && el.levelup.querySelector("p"));
    if (title) title.textContent = chestRarity >= 3 ? "BOSS CHEST" : chestRarity >= 2 ? "RARE CHEST" : "CHEST";
    if (sub) {
      sub.innerHTML =
        `Chọn 1 Item · Common/Uncommon/Rare · <span style="color:#d4a84b">${ITEM_ORDER.length} base</span>`;
    }
    options.forEach((opt) => {
      const it = ITEMS[opt.id];
      if (!it) return;
      const rm = rarityMeta(opt.rarity);
      const slotLab = ITEM_SLOT_LABELS[it.slot] || it.slot;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "upgrade-btn pick-with-icon rar-" + (opt.rarity || "common");
      const icon = document.createElement("canvas");
      icon.className = "pick-icon ability-icon";
      if (typeof window.paintItemSlotIcon === "function") {
        window.paintItemSlotIcon(icon, it.slot, rm.color || it.color, 48);
      }
      const body = document.createElement("div");
      body.className = "pick-body";
      const titleEl = document.createElement("strong");
      titleEl.style.color = rm.color || it.color;
      titleEl.innerHTML = `${it.name}<span class="rar-badge" style="color:${rm.color}">${rm.label}</span>`;
      const metaEl = document.createElement("span");
      metaEl.style.color = rm.color;
      metaEl.textContent = `${slotLab} · effect riêng theo rarity`;
      const descEl = document.createElement("span");
      descEl.textContent = itemDescFor(it, opt.rarity);
      body.appendChild(titleEl);
      body.appendChild(metaEl);
      body.appendChild(descEl);
      btn.appendChild(icon);
      btn.appendChild(body);
      btn.addEventListener("click", () => {
        equipItem(opt.id, opt.rarity);
        toast(`${it.name} (${rm.label})`, "good", 1400);
        sfx("pickup");
        state = "playing";
        showScreen("game");
        lastTs = performance.now();
      });
      el.upgradeOptions.appendChild(btn);
    });
    updateRerollButton();
    showScreen("levelup");
  }

  function updateItemHud() {
    if (!el.itemHud || !player) return;
    el.itemHud.innerHTML = "";
    for (const entry of player.items || []) {
      const id = itemIdOf(entry);
      const rar = itemRarityOf(entry);
      const it = ITEMS[id];
      if (!it) continue;
      const rm = rarityMeta(rar);
      const chip = document.createElement("span");
      chip.className = "item-chip";
      chip.style.borderColor = rm.color || it.color || "#d4a84b";
      chip.style.color = rm.color || it.color || "#d4a84b";
      const icon = document.createElement("canvas");
      icon.width = 18;
      icon.height = 18;
      if (typeof window.paintItemSlotIcon === "function") {
        window.paintItemSlotIcon(icon, it.slot, rm.color || it.color, 18);
      }
      const lab = document.createElement("span");
      const words = it.name.split(" ");
      lab.textContent = words.length > 1 ? words[words.length - 1].slice(0, 6) : words[0].slice(0, 6);
      const rarEl = document.createElement("span");
      rarEl.className = "ic-rar";
      rarEl.textContent = rar === "rare" ? "R" : rar === "uncommon" ? "U" : "C";
      chip.appendChild(icon);
      chip.appendChild(lab);
      chip.appendChild(rarEl);
      chip.title = `${it.name} [${rm.label}] [${ITEM_SLOT_LABELS[it.slot] || it.slot}]: ${itemDescFor(it, rar)}`;
      el.itemHud.appendChild(chip);
    }
    updateRunPills();
  }

  function updateRunPills() {
    const host = document.getElementById("run-pills");
    if (!host) return;
    host.innerHTML = "";
    if (!player) return;
    if (meta.activeMark && MARKS[meta.activeMark] && meta.ownedMarks && meta.ownedMarks[meta.activeMark]) {
      // Only show if mark applied this run (active)
      const m = MARKS[meta.activeMark];
      const pill = document.createElement("span");
      pill.className = "run-pill mark";
      pill.textContent = (m.name || "").replace("Mark of the ", "").replace("Mark of ", "");
      pill.title = m.desc || m.name;
      host.appendChild(pill);
    }
    if (playMode === "torment" && activeArtifacts && activeArtifacts.length) {
      const n = activeArtifacts.length;
      const pill = document.createElement("span");
      pill.className = "run-pill art";
      pill.textContent = n <= 2
        ? activeArtifacts.map((id) => (ARTIFACTS[id] && ARTIFACTS[id].name) || id).join(" · ")
        : `${n} Artifacts`;
      pill.title = activeArtifacts.map((id) => (ARTIFACTS[id] && ARTIFACTS[id].name) || id).join(", ");
      host.appendChild(pill);
    }
  }

  function fireEnemyShot(e, speed, dmgMul) {
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    const spd = speed || 200;
    enemyShots.push({
      x: e.x, y: e.y,
      vx: (dx / d) * spd,
      vy: (dy / d) * spd,
      r: 6,
      dmg: e.dmg * (dmgMul || 0.7),
      life: 3.5,
      color: e.color || "#ff6080",
    });
  }

  /** Normal enemy AI by type (wiki behaviours, simplified) */
  function updateTypedEnemy(e, dt, frostMul) {
    const kind = e.aiKind || "chase";
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    e.shotCd = (e.shotCd || 0) - dt;

    if (kind === "ranged") {
      // keep distance, shoot
      if (d < 160) {
        e.x -= (dx / d) * e.speed * 0.7 * frostMul * dt;
        e.y -= (dy / d) * e.speed * 0.7 * frostMul * dt;
      } else if (d > 280) {
        e.x += (dx / d) * e.speed * 0.85 * frostMul * dt;
        e.y += (dy / d) * e.speed * 0.85 * frostMul * dt;
      } else {
        // orbit
        e.x += (-dy / d) * e.speed * 0.5 * frostMul * dt;
        e.y += (dx / d) * e.speed * 0.5 * frostMul * dt;
      }
      if (e.shotCd <= 0 && d < 420) {
        fireEnemyShot(e, 210, 0.85);
        e.shotCd = e.sprite === "lich" ? 1.1 : 1.6;
      }
      return;
    }

    if (kind === "strafe") {
      e.x += (dx / d) * e.speed * 0.55 * frostMul * dt;
      e.y += (dy / d) * e.speed * 0.55 * frostMul * dt;
      e.x += (-dy / d) * e.speed * 0.65 * frostMul * dt;
      e.y += (dx / d) * e.speed * 0.65 * frostMul * dt;
      if (e.shotCd <= 0 && d < 300) {
        fireEnemyShot(e, 180, 0.65);
        e.shotCd = 2.0;
      }
      const canMove = updateEnemyMeleeAttack(e, dt);
      if (!canMove) return;
      return;
    }

    if (kind === "rush") {
      const canMove = updateEnemyMeleeAttack(e, dt);
      if (canMove) {
        const burst = d < 200 ? 1.35 : 1.1;
        e.x += (dx / d) * e.speed * burst * frostMul * dt;
        e.y += (dy / d) * e.speed * burst * frostMul * dt;
      }
      return;
    }

    if (kind === "tank") {
      const canMove = updateEnemyMeleeAttack(e, dt);
      if (canMove) {
        e.x += (dx / d) * e.speed * 0.75 * frostMul * dt;
        e.y += (dy / d) * e.speed * 0.75 * frostMul * dt;
      }
      return;
    }

    if (kind === "serpentine") {
      e.wobble = (e.wobble || 0) + dt * 4;
      const side = Math.sin(e.wobble) * 0.8;
      e.x += (dx / d) * e.speed * 0.9 * frostMul * dt + (-dy / d) * e.speed * side * 0.4 * dt;
      e.y += (dy / d) * e.speed * 0.9 * frostMul * dt + (dx / d) * e.speed * side * 0.4 * dt;
      const canMove = updateEnemyMeleeAttack(e, dt);
      if (!canMove) return;
      return;
    }

    if (kind === "slime") {
      const canMove = updateEnemyMeleeAttack(e, dt);
      if (canMove) {
        e.x += (dx / d) * e.speed * 0.85 * frostMul * dt;
        e.y += (dy / d) * e.speed * 0.85 * frostMul * dt;
      }
      return;
    }

    // default chase
    const canMove = updateEnemyMeleeAttack(e, dt);
    if (canMove) {
      const spdMul = (e.atk && e.atk.active && e.atk.phase === 0 ? 0.35 : 1) * frostMul;
      e.x += (dx / d) * e.speed * spdMul * dt;
      e.y += (dy / d) * e.speed * spdMul * dt;
    }
  }

  // ─── Miniboss AI (simplified boss) ───────────────────────
  function updateMiniboss(e, dt) {
    e.aiTimer -= dt;

    if (e.ai === "charge") {
      e.x += e.chargeVx * dt;
      e.y += e.chargeVy * dt;
      e.x = clamp(e.x, e.r, MAP_W - e.r);
      e.y = clamp(e.y, e.r, MAP_H - e.r);
      if (Math.random() < 0.4) {
        particles.push({
          x: e.x, y: e.y,
          vx: rand(-15, 15), vy: rand(-15, 15),
          life: 0.2, maxLife: 0.2,
          color: "#c080e0", size: 5,
        });
      }
      if (e.aiTimer <= 0) {
        e.ai = "chase";
        e.aiTimer = 1.4;
      }
      return;
    }

    if (e.ai === "slam") {
      e.slamTelegraph = e.aiTimer;
      if (e.aiTimer <= 0) {
        const range = 95;
        aoeFx.push({
          x: e.x, y: e.y, r: range,
          life: 0.35, maxLife: 0.35,
          color: "#c080e0", style: "burst",
        });
        if (dist(e, player) <= range + player.r) {
          damagePlayer(26);
        }
        e.ai = "chase";
        e.aiTimer = 1.2;
      }
      return;
    }

    // Melee swipe when close; otherwise chase
    const canMove = updateEnemyMeleeAttack(e, dt);
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    if (canMove) {
      const spdMul = e.atk && e.atk.active && e.atk.phase === 0 ? 0.3 : 1;
      e.x += (dx / d) * e.speed * spdMul * dt;
      e.y += (dy / d) * e.speed * spdMul * dt;
    }

    if (e.aiTimer <= 0 && !(e.atk && e.atk.active)) {
      const roll = Math.random();
      if (roll < 0.35) {
        e.ai = "charge";
        e.aiTimer = 0.55;
        const spd = 260;
        e.chargeVx = (dx / d) * spd;
        e.chargeVy = (dy / d) * spd;
      } else if (roll < 0.6) {
        e.ai = "slam";
        e.aiTimer = 0.8;
      } else {
        e.aiTimer = 1.0;
      }
    }
  }

  // ─── Boss AI (patterns by Lord name / hall) ──────────────
  function bossPatternKey() {
    const bd = currentHall && currentHall.boss;
    if (bd && bd.pattern) return bd.pattern;
    const n = (bd && bd.name) || "";
    if (/Regret|Flame/i.test(n)) return "flame";
    if (/Despair/i.test(n)) return "despair";
    if (/Hate|Frost/i.test(n)) return "frost";
    if (/Discord|Dissonance/i.test(n)) return "discord";
    if (/Greed|Vault/i.test(n)) return "greed";
    if (/Blight|Bog/i.test(n)) return "blight";
    return "pain";
  }

  function bossTrailColor(pat) {
    return ({ pain: "#c04060", flame: "#e05020", frost: "#80d0ff", despair: "#7080b0", discord: "#c060e0", greed: "#d4a84b", blight: "#50a060" })[pat] || "#c04060";
  }

  function bossFireRing(e, n, spd, dmgMul, color, spread) {
    const base = Math.atan2(player.y - e.y, player.x - e.x);
    const half = (n - 1) / 2;
    for (let i = 0; i < n; i++) {
      const a = base + (i - half) * (spread != null ? spread : 0.28);
      enemyShots.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: 7, dmg: e.dmg * (dmgMul || 0.75), life: 3.5,
        color: color || e.color,
      });
    }
  }

  function bossRingBurst(e, n, spd, dmgMul, color) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2;
      enemyShots.push({
        x: e.x, y: e.y,
        vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: 6, dmg: e.dmg * (dmgMul || 0.55), life: 2.8,
        color: color || e.color,
      });
    }
  }

  function updateBoss(e, dt) {
    e.aiTimer -= dt;
    e.pattern = e.pattern || bossPatternKey();
    const pat = e.pattern;
    const trail = bossTrailColor(pat);

    // Phase: 1 full, 2 under 50%, 3 under 25%
    if (e.hp < e.maxHp * 0.25) e.phase = 3;
    else if (e.hp < e.maxHp * 0.5) e.phase = 2;
    else e.phase = 1;
    const p2 = e.phase >= 2;
    const p3 = e.phase >= 3;

    if (e.ai === "charge") {
      e.x += e.chargeVx * dt;
      e.y += e.chargeVy * dt;
      e.x = clamp(e.x, e.r, MAP_W - e.r);
      e.y = clamp(e.y, e.r, MAP_H - e.r);
      if (Math.random() < 0.55) {
        particles.push({
          x: e.x, y: e.y, vx: rand(-20, 20), vy: rand(-20, 20),
          life: 0.25, maxLife: 0.25, color: trail, size: 6,
        });
      }
      // Flame charge leaves fire
      if (pat === "flame" && Math.random() < 0.35) {
        itemPatches.push({
          kind: "fire", x: e.x, y: e.y, r: 20, life: 2.2, dmg: 14, burn: 0.15, color: "#e05020",
        });
      }
      if (e.aiTimer <= 0) {
        e.ai = "chase";
        e.aiTimer = 1.0;
      }
      return;
    }

    if (e.ai === "slam") {
      e.slamTelegraph = e.aiTimer;
      if (e.aiTimer <= 0) {
        const range = pat === "pain" ? 150 : pat === "blight" ? 160 : 130;
        aoeFx.push({ x: e.x, y: e.y, r: range, life: 0.4, maxLife: 0.4, color: trail, style: "burst" });
        if (dist(e, player) <= range + player.r) {
          damagePlayer(e.dmg * (pat === "pain" ? 1.4 : 1.1), e);
          if (pat === "frost") player.chillTimer = Math.max(player.chillTimer || 0, 1.8);
          if (pat === "blight") player.chillTimer = Math.max(player.chillTimer || 0, 0.8);
        }
        for (let i = 0; i < 22; i++) {
          const a = Math.random() * Math.PI * 2;
          particles.push({
            x: e.x, y: e.y,
            vx: Math.cos(a) * rand(60, 180), vy: Math.sin(a) * rand(60, 180),
            life: 0.45, maxLife: 0.45, color: trail, size: rand(3, 7),
          });
        }
        if (pat === "discord") bossRingBurst(e, 10, 180, 0.45, trail);
        e.ai = "chase";
        e.aiTimer = 0.9;
      }
      return;
    }

    if (e.ai === "summon") {
      if (e.aiTimer <= 0) {
        const n = pat === "despair" ? 5 : pat === "blight" ? 6 : 4;
        for (let i = 0; i < n; i++) {
          spawnEnemy(pickHallEnemyType(), hallStrengthAt(1) * 0.95, {
            pos: {
              x: clamp(e.x + rand(-90, 90), 40, MAP_W - 40),
              y: clamp(e.y + rand(-90, 90), 40, MAP_H - 40),
            },
            elite: pat === "despair" && Math.random() < 0.25,
          });
        }
        floatingTexts.push({
          x: e.x, y: e.y - e.r - 10,
          text: pat === "blight" ? "SPORES!" : pat === "despair" ? "HORDE!" : "SUMMON!",
          life: 0.8, maxLife: 0.8, color: trail, vy: -25,
        });
        e.ai = "chase";
        e.aiTimer = 1.4;
      }
      return;
    }

    if (e.ai === "rain") {
      // Greed / Discord projectile rain telegraph
      if (e.aiTimer <= 0) {
        const count = p3 ? 14 : 10;
        for (let i = 0; i < count; i++) {
          const px = player.x + rand(-120, 120);
          const py = player.y + rand(-80, 80);
          enemyShots.push({
            x: px, y: py - 200,
            vx: 0, vy: 280,
            r: 8, dmg: e.dmg * 0.7, life: 2.5,
            color: trail,
          });
        }
        floatingTexts.push({
          x: e.x, y: e.y - e.r - 8,
          text: pat === "greed" ? "GOLD RAIN!" : "CHAOS RAIN!",
          life: 0.7, maxLife: 0.7, color: trail, vy: -22,
        });
        if (pat === "greed") spawnGold(e.x, e.y, 8);
        e.ai = "chase";
        e.aiTimer = 1.2;
      }
      return;
    }

    if (e.ai === "nova") {
      if (e.aiTimer <= 0) {
        const r = pat === "frost" ? 160 : 140;
        aoeFx.push({ x: e.x, y: e.y, r, life: 0.45, maxLife: 0.45, color: trail, style: "burst" });
        if (dist(e, player) < r + 10) {
          damagePlayer(e.dmg * (pat === "frost" ? 1.1 : 0.95), e);
          if (pat === "frost") player.chillTimer = Math.max(player.chillTimer || 0, 2.2);
        }
        if (pat === "flame") {
          for (let i = 0; i < 6; i++) {
            const a = (i / 6) * Math.PI * 2;
            itemPatches.push({
              kind: "fire", x: e.x + Math.cos(a) * 50, y: e.y + Math.sin(a) * 50,
              r: 24, life: 3, dmg: 16, burn: 0.2, color: "#e05020",
            });
          }
        }
        if (pat === "blight") {
          for (let i = 0; i < 5; i++) {
            itemPatches.push({
              kind: "decay", x: e.x + rand(-60, 60), y: e.y + rand(-60, 60),
              r: 30, life: 3.5, dmg: 8, decay: true, color: "#408050",
            });
          }
        }
        floatingTexts.push({
          x: e.x, y: e.y - e.r - 8,
          text: pat === "frost" ? "FROST NOVA!" : pat === "flame" ? "INFERNO!" : pat === "blight" ? "MIASMA!" : "NOVA!",
          life: 0.65, maxLife: 0.65, color: trail, vy: -20,
        });
        e.ai = "chase";
        e.aiTimer = 1.1;
      }
      return;
    }

    // chase + melee
    const canMove = updateEnemyMeleeAttack(e, dt);
    const dx = player.x - e.x;
    const dy = player.y - e.y;
    const d = Math.hypot(dx, dy) || 1;
    if (canMove) {
      let spdMul = e.atk && e.atk.active && e.atk.phase === 0 ? 0.25 : 1;
      if (pat === "pain" && p2) spdMul *= 1.12;
      if (pat === "discord") spdMul *= 1.08;
      e.x += (dx / d) * e.speed * spdMul * dt;
      e.y += (dy / d) * e.speed * spdMul * dt;
    }

    if (e.aiTimer <= 0 && !(e.atk && e.atk.active)) {
      const roll = Math.random();
      const trash = enemies.filter((x) => !x.isBoss).length;

      // ── Per-Lord skill weights ──
      if (pat === "pain") {
        // Aggressive melee Lord: charge + slam + spike ring
        if (roll < 0.34) {
          e.ai = "charge";
          e.aiTimer = p2 ? 0.75 : 0.9;
          const spd = p3 ? 420 : p2 ? 360 : 300;
          e.chargeVx = (dx / d) * spd;
          e.chargeVy = (dy / d) * spd;
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "PAIN CHARGE!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
        } else if (roll < 0.6) {
          e.ai = "slam";
          e.aiTimer = p2 ? 0.55 : 0.75;
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "CRUSH!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
        } else if (roll < 0.78 || p3) {
          bossRingBurst(e, p3 ? 14 : 10, 200, 0.5, trail);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "SPIKE RING!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = 1.1;
        } else {
          e.aiTimer = 0.7;
        }
      } else if (pat === "flame") {
        // Lord of Regret: fire volleys, inferno nova, fire charge
        if (roll < 0.4) {
          bossFireRing(e, p3 ? 7 : 5, 270, 0.8, "#ff6020", 0.22);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "FIRE STORM!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = p2 ? 0.85 : 1.1;
        } else if (roll < 0.65) {
          e.ai = "nova";
          e.aiTimer = 0.45;
        } else if (roll < 0.85) {
          e.ai = "charge";
          e.aiTimer = 0.7;
          e.chargeVx = (dx / d) * 320;
          e.chargeVy = (dy / d) * 320;
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "BLAZE!", life: 0.5, maxLife: 0.5, color: trail, vy: -20 });
        } else {
          e.ai = "slam";
          e.aiTimer = 0.7;
        }
      } else if (pat === "frost") {
        // Lord of Hate: frost nova, ice volleys, chill slam
        if (roll < 0.38) {
          e.ai = "nova";
          e.aiTimer = 0.5;
        } else if (roll < 0.68) {
          bossFireRing(e, 5, 190, 0.7, "#a0e0ff", 0.25);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "ICE SHARDS!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = 1.15;
        } else if (roll < 0.88) {
          e.ai = "slam";
          e.aiTimer = 0.8;
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "GLACIER!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
        } else {
          e.aiTimer = 0.8;
        }
      } else if (pat === "despair") {
        // Lord of Despair: summons + dark volleys
        if (roll < 0.4 && trash < 22) {
          e.ai = "summon";
          e.aiTimer = 0.4;
        } else if (roll < 0.7) {
          bossFireRing(e, 4, 210, 0.7, "#8090c0", 0.3);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "VOID BOLTS!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = 1.0;
        } else if (roll < 0.9) {
          e.ai = "slam";
          e.aiTimer = 0.75;
        } else {
          e.ai = "charge";
          e.aiTimer = 0.65;
          e.chargeVx = (dx / d) * 280;
          e.chargeVy = (dy / d) * 280;
        }
      } else if (pat === "discord") {
        // Lord of Discord: chaotic multi-angle
        if (roll < 0.35) {
          bossRingBurst(e, p3 ? 16 : 12, 210, 0.5, trail);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "DISCORD!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = 1.0;
        } else if (roll < 0.55) {
          e.ai = "rain";
          e.aiTimer = 0.55;
        } else if (roll < 0.75) {
          bossFireRing(e, 6, 240, 0.65, trail, 0.4);
          e.aiTimer = 0.95;
        } else if (roll < 0.9) {
          e.ai = "slam";
          e.aiTimer = 0.6;
        } else {
          e.ai = "charge";
          e.aiTimer = 0.55;
          e.chargeVx = (dx / d) * 340;
          e.chargeVy = (dy / d) * 340;
        }
      } else if (pat === "greed") {
        // Lord of Greed: gold rain, heavy coins
        if (roll < 0.35) {
          e.ai = "rain";
          e.aiTimer = 0.5;
        } else if (roll < 0.6) {
          bossFireRing(e, 4, 200, 0.85, "#e0c060", 0.2);
          spawnGold(e.x + rand(-30, 30), e.y + rand(-30, 30), 4);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "COIN SHOT!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = 1.05;
        } else if (roll < 0.8) {
          e.ai = "slam";
          e.aiTimer = 0.7;
          spawnGold(e.x, e.y, 3);
        } else if (roll < 0.92 && trash < 16) {
          e.ai = "summon";
          e.aiTimer = 0.45;
        } else {
          e.aiTimer = 0.75;
        }
      } else if (pat === "blight") {
        // Lord of Blight: spores, decay pools, summons
        if (roll < 0.32 && trash < 24) {
          e.ai = "summon";
          e.aiTimer = 0.4;
        } else if (roll < 0.58) {
          e.ai = "nova";
          e.aiTimer = 0.5;
        } else if (roll < 0.78) {
          bossFireRing(e, 4, 180, 0.65, "#60a070", 0.28);
          floatingTexts.push({ x: e.x, y: e.y - e.r - 8, text: "TOXIC!", life: 0.55, maxLife: 0.55, color: trail, vy: -20 });
          e.aiTimer = 1.1;
        } else if (roll < 0.92) {
          e.ai = "slam";
          e.aiTimer = 0.75;
        } else {
          e.ai = "charge";
          e.aiTimer = 0.7;
          e.chargeVx = (dx / d) * 260;
          e.chargeVy = (dy / d) * 260;
        }
      } else {
        // fallback
        if (roll < 0.3) {
          e.ai = "charge";
          e.aiTimer = 0.7;
          e.chargeVx = (dx / d) * 300;
          e.chargeVy = (dy / d) * 300;
        } else if (roll < 0.55) {
          e.ai = "slam";
          e.aiTimer = 0.8;
        } else {
          bossFireRing(e, 3, 220, 0.7, trail, 0.22);
          e.aiTimer = 1.0;
        }
      }
    }
  }

  // ─── Update ──────────────────────────────────────────────
  function updateWaveSystem(dt) {
    if (bannerTimer > 0) {
      bannerTimer -= dt;
      if (bannerTimer <= 0) hideBanner();
    }

    if (phase === "intro") {
      phaseTimer -= dt;
      if (phaseTimer <= 0) phase = "running";
      return;
    }

    if (phase === "running") {
      const p = runProgress();
      const scale = hallStrengthAt(p);
      const diff = getDiffMods();
      let eliteChance = ((currentHall && currentHall.eliteChance) || 0.08) * (diff.eliteMul || 1);

      // Agony meter (Hall mode only)
      if (playMode === "hall" && agonyEnabled && agonyRank < (AGONY_CFG.maxRank || 5)) {
        // Scale meter so full run can reach rank 5 (wiki ~24m for 5 ranks on 30m)
        const secPer = AGONY_CFG.secPerRank || 288;
        const scaleM = AGONY_CFG.scaleMeterToRun
          ? (secPer * 5) / Math.max(60, RUN_DURATION_SEC)
          : 1;
        agonyMeter += (dt / secPer) * scaleM;
        while (agonyMeter >= 1 && agonyRank < (AGONY_CFG.maxRank || 5)) {
          agonyMeter -= 1;
          agonyRank++;
          showBanner(`AGONY ${agonyRank}`, "Quái mạnh hơn · +XP · Champions", 1.6);
          sfx("agony");
          addShake(5);
        }
        if (agonyRank >= (AGONY_CFG.maxRank || 5)) agonyMeter = 1;
      }

      // Champions (Hall+Agony or Torment mode)
      if (isHardModeRun()) {
        championTimer -= dt;
        if (championTimer <= 0 && enemies.length < maxAliveCap) {
          spawnChampion();
          championTimer = diff.champInterval * (0.85 + Math.random() * 0.3);
        }
      }

      // Miniboss checkpoints (progress 0..1 scales with run length)
      const mAt = (currentHall && currentHall.minibossAt) || [];
      const mTypes = (currentHall && currentHall.minibossTypes) || [];
      for (let i = 0; i < mAt.length; i++) {
        if (p >= mAt[i] && !minibossSpawned[i] && mTypes.length) {
          minibossSpawned[i] = true;
          const mbType = mTypes[i % mTypes.length];
          spawnEnemy(mbType, scale, { miniboss: true });
          const mbName = (ENEMY_BASE[mbType] && ENEMY_BASE[mbType].name) || "Miniboss";
          showBanner("MINIBOSS", mbName, 2.0);
        }
      }

      // Continuous spawns
      spawnTimer -= dt;
      if (spawnTimer <= 0 && enemies.length < maxAliveCap) {
        const burst = Math.min(6, spawnBurstCount(p) + (diff.ar > 0 ? 1 : 0) + (diff.tr > 2 ? 1 : 0));
        for (let b = 0; b < burst && enemies.length < maxAliveCap; b++) {
          const type = pickHallEnemyType();
          const elite = Math.random() < eliteChance * (0.7 + p * 0.9);
          spawnEnemy(type, scale, { elite });
        }
        spawnTimer = spawnIntervalForProgress(p) * (0.85 + Math.random() * 0.3);
      }

      // Boss condition: time OR Boglands kill threshold
      const timeBoss = !isBoglandsRun() && elapsed >= RUN_DURATION_SEC;
      const killBoss = isBoglandsRun() && kills >= bogKillTarget();
      if (timeBoss || killBoss) {
        startBossPhase();
      }
      return;
    }

    if (phase === "boss_announce") {
      phaseTimer -= dt;
      if (phaseTimer <= 0) {
        phase = "boss";
        spawnBoss();
        showBanner("TIÊU DIỆT BOSS!", "Dùng Ability & vũ khí chính", 2.0);
      }
      return;
    }

    // boss phase handled by killEnemy → endGame
  }

  function update(dt) {
    if (state !== "playing") return;

    elapsed += dt;
    updateWaveSystem(dt);
    updateAbilities(dt);
    updateTomes(dt);

    // skill cooldown / active
    if (player.skillCd > 0) player.skillCd = Math.max(0, player.skillCd - dt);
    if (player.skillActive > 0) {
      player.skillActive -= dt;
      if (player.skillActive <= 0) {
        player.skillActive = 0;
        player.damageTakenMul = 1;
      } else if (player.skillId === "ringblades") {
        player.attackTimer = Math.min(player.attackTimer, 0.12);
      }
    }

    // HP regeneration (wiki stat)
    if (player.regen > 0 && player.hp < player.maxHp) {
      player.hp = Math.min(player.maxHp, player.hp + player.regen * dt);
    }

    // movement (keyboard + gamepad stick)
    let mx = 0;
    let my = 0;
    if (keys["w"] || keys["arrowup"]) my -= 1;
    if (keys["s"] || keys["arrowdown"]) my += 1;
    if (keys["a"] || keys["arrowleft"]) mx -= 1;
    if (keys["d"] || keys["arrowright"]) mx += 1;
    if (player._gpMx) mx += player._gpMx;
    if (player._gpMy) my += player._gpMy;
    if (player.chillTimer > 0) player.chillTimer -= dt;
    const chillMul = player.chillTimer > 0 ? 0.55 : 1;
    // Pace Setter / Guiding Star / War Chief force
    let itemMs = player._gsMs || 1;
    if (player.potionHaste > 0) itemMs *= 1.4;
    if (player.itemPaceSetter && player.hp < player.maxHp * 0.99) itemMs *= 1.15;
    if (player.itemWarChief) player.force = (player.force || 1) + (player.warChiefForce || 0);
    // Vision Crown range
    if (player.itemVisionCrown && !player.moving) {
      player._visionRangeMul = 1.5;
    } else if (player.itemVisionCrown) {
      player._visionRangeMul = 1.15;
    } else player._visionRangeMul = 1;

    const moveMul = (player.skillActive > 0 && player.skillId === "ringblades" ? 1.15 : 1) * chillMul * itemMs;
    player.moving = !!(mx || my);
    if (mx || my) {
      const len = Math.hypot(mx, my);
      mx /= len;
      my /= len;
      player._lastMx = mx * player.speed * moveMul * dt;
      player._lastMy = my * player.speed * moveMul * dt;
      if (mx !== 0) player.facing = mx > 0 ? 1 : -1;
      player.x = clamp(player.x + mx * player.speed * moveMul * dt, player.r + 8, MAP_W - player.r - 8);
      player.y = clamp(player.y + my * player.speed * moveMul * dt, player.r + 8, MAP_H - player.r - 8);
      player.bob += dt * 12;
    } else {
      player._lastMx = 0;
      player._lastMy = 0;
      player.bob *= 0.9;
    }

    if (player.invuln > 0) player.invuln -= dt;

    // auto attack — frame-based
    if (player.atk.active) {
      updateAttackAnim(dt);
    } else {
      player.attackTimer -= dt;
      if (player.attackTimer <= 0) {
        const rangeMul = player.skillActive > 0 ? 1.35 : 1;
        const meleeStyles = ["melee", "hammer", "dualaxe", "lute", "scepter", "plants"];
        const hasTarget = meleeStyles.includes(player.style)
          ? enemies.some((e) => dist(player, e) <= player.attackRange * (player.meleeArc || 1.1) * rangeMul)
          : nearestEnemies(player, 1, player.attackRange).length > 0;
        if (hasTarget) {
          beginAttack();
        } else {
          player.attackTimer = 0.08;
        }
      }
    }

    // enemies
    for (const e of enemies) {
      if (e.hitFlash > 0) e.hitFlash -= dt;
      if (e.frostSlow > 0) e.frostSlow -= dt;
      // Knockback (Force) recovery
      if (e.kbT > 0) {
        e.kbT -= dt;
        e.x += (e.kbVx || 0) * dt;
        e.y += (e.kbVy || 0) * dt;
        e.kbVx *= 0.9;
        e.kbVy *= 0.9;
        e.x = clamp(e.x, e.r, MAP_W - e.r);
        e.y = clamp(e.y, e.r, MAP_H - e.r);
      }
      // Status DoT / timers
      if (e.st) {
        const st = e.st;
        if (st.burn > 0) {
          st.burn -= dt;
          e.hp -= (st.burnDps || 6) * dt;
          if (e.hp <= 0) { killEnemy(e); continue; }
        }
        if (st.electrifyT > 0) st.electrifyT -= dt;
        if (st.decay > 0) st.decay -= dt;
        if (st.fragile > 0) st.fragile -= dt;
        if (st.mark > 0) st.mark -= dt;
        if (st.slow > 0) st.slow -= dt;
      }
      const frostMul = (e.frostSlow > 0 || (e.st && e.st.slow > 0)) ? 0.5 : 1;

      if (e.isBoss) {
        updateBoss(e, dt);
      } else if (e.isMiniboss) {
        updateMiniboss(e, dt);
      } else {
        updateTypedEnemy(e, dt, frostMul);
      }

      // soft separation
      for (const o of enemies) {
        if (o === e) continue;
        const od = dist(e, o);
        const minD = e.r + o.r - 2;
        if (od < minD && od > 0.01) {
          const push = ((minD - od) / od) * (e.isBoss ? 0.15 : 0.5);
          e.x -= (o.x - e.x) * push * dt * 8;
          e.y -= (o.y - e.y) * push * dt * 8;
        }
      }

      if (e.ai === "charge") {
        const dPlayer = dist(e, player);
        if (dPlayer < e.r + player.r - 2) {
          damagePlayer(e.dmg * dt * 2.5);
        }
      }
    }

    updateGoldCoins(dt);
    updateChests(dt);
    updateWells(dt);
    updateBarrels(dt);
    updatePotionDrops(dt);
    updatePotionBuffs(dt);
    updateItemEffects(dt);
    updateItemPatches(dt);

    // player projectiles
    for (let i = projectiles.length - 1; i >= 0; i--) {
      const p = projectiles[i];
      if (p.homing && p.target && p.target.hp > 0) {
        const desired = Math.atan2(p.target.y - p.y, p.target.x - p.x);
        const cur = Math.atan2(p.vy, p.vx);
        let diff = desired - cur;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        const turn = clamp(diff, -4 * dt, 4 * dt);
        const spd = Math.hypot(p.vx, p.vy);
        const na = cur + turn;
        p.vx = Math.cos(na) * spd;
        p.vy = Math.sin(na) * spd;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;

      // Kugelblitz pulse AOE (wiki: shockwaves while moving)
      if (p.kugelPulse) {
        p.pulseCd = (p.pulseCd || 0) - dt;
        if (p.pulseCd <= 0) {
          p.pulseCd = 0.35;
          const pr = p.pulseR || 48;
          aoeFx.push({ x: p.x, y: p.y, r: pr, life: 0.2, maxLife: 0.2, color: p.color, style: "burst" });
          for (const e of enemies) {
            if (dist(p, e) <= pr + e.r) {
              damageEnemy(e, p.pulseDmg || p.damage, !!p.isCrit, p.hitOpts || null);
            }
          }
        }
      }

      let hit = false;
      for (const e of enemies) {
        if (dist(p, e) < p.r + e.r) {
          damageEnemy(e, p.damage, !!p.isCrit, p.hitOpts || null);
          if (p.splitOnCrit && p.isCrit && p.abilityDef) {
            // Phantom Split-style: spawn 2 weaker forks
            for (let k = -1; k <= 1; k += 2) {
              const ang = Math.atan2(p.vy, p.vx) + k * 0.45;
              const spd = Math.hypot(p.vx, p.vy) * 0.7;
              projectiles.push({
                x: p.x, y: p.y,
                vx: Math.cos(ang) * spd, vy: Math.sin(ang) * spd,
                r: p.r * 0.85, damage: p.damage * 0.55, isCrit: false,
                life: Math.min(p.life, 0.8), color: p.color, style: p.style,
                pierce: Math.max(0, (p.pierce || 0) - 1),
                hitOpts: p.hitOpts, fxKind: p.fxKind,
              });
            }
          }
          if (p.pierce > 0) {
            p.pierce--;
          } else {
            hit = true;
          }
          break;
        }
      }
      if (hit || p.life <= 0 || p.x < -20 || p.y < -20 || p.x > MAP_W + 20 || p.y > MAP_H + 20) {
        if (p.life <= 0 && p.abilityDef && p.abilityDef.pulseOnExpire) {
          const pr = 40 * ((p.abilityDef.aoe && p.abilityDef.aoe / 50) || 1);
          aoeFx.push({ x: p.x, y: p.y, r: pr, life: 0.3, maxLife: 0.3, color: p.color, style: "burst" });
          for (const e of enemies) {
            if (dist(p, e) <= pr + e.r) damageEnemy(e, p.damage * 0.6, false, p.hitOpts);
          }
        }
        projectiles.splice(i, 1);
      }
    }

    // boss projectiles
    for (let i = enemyShots.length - 1; i >= 0; i--) {
      const s = enemyShots[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt;
      if (dist(s, player) < s.r + player.r) {
        damagePlayer(s.dmg);
        enemyShots.splice(i, 1);
        continue;
      }
      if (s.life <= 0 || s.x < 0 || s.y < 0 || s.x > MAP_W || s.y > MAP_H) {
        enemyShots.splice(i, 1);
      }
    }

    // xp gems
    for (let i = xpGems.length - 1; i >= 0; i--) {
      const g = xpGems[i];
      g.life -= dt;
      g.vx *= 0.92;
      g.vy *= 0.92;
      g.x += g.vx * dt;
      g.y += g.vy * dt;

      const d = dist(g, player);
      if (d < effectivePickupRange()) g.magnet = true;
      if (g.magnet) {
        const pull = 320;
        const dx = player.x - g.x;
        const dy = player.y - g.y;
        const len = Math.hypot(dx, dy) || 1;
        g.x += (dx / len) * pull * dt;
        g.y += (dy / len) * pull * dt;
      }
      if (d < player.r + g.r + 4) {
        gainXp(g.value);
        xpGems.splice(i, 1);
        continue;
      }
      if (g.life <= 0) xpGems.splice(i, 1);
    }

    // fx
    if (slashFx) {
      slashFx.life -= dt;
      if (slashFx.life <= 0) slashFx = null;
    }
    for (let i = aoeFx.length - 1; i >= 0; i--) {
      const a = aoeFx[i];
      a.life -= dt;
      if (a.followPlayer) {
        a.x = player.x;
        a.y = player.y;
      }
      if (a.life <= 0) aoeFx.splice(i, 1);
    }
    for (let i = abilityFx.length - 1; i >= 0; i--) {
      abilityFx[i].life -= dt;
      if (abilityFx[i].life <= 0) abilityFx.splice(i, 1);
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const t = floatingTexts[i];
      t.y += t.vy * dt;
      t.life -= dt;
      if (t.life <= 0) floatingTexts.splice(i, 1);
    }

    // camera
    const targetCx = player.x - W / 2;
    const targetCy = player.y - H / 2;
    camera.x += (targetCx - camera.x) * Math.min(1, 8 * dt);
    camera.y += (targetCy - camera.y) * Math.min(1, 8 * dt);
    camera.x = clamp(camera.x, 0, MAP_W - W);
    camera.y = clamp(camera.y, 0, MAP_H - H);

    updateHud();
  }

  function updateHud() {
    if (!player) return;
    el.hpFill.style.width = `${clamp((player.hp / player.maxHp) * 100, 0, 100)}%`;
    el.xpFill.style.width = `${clamp((player.xp / player.xpNext) * 100, 0, 100)}%`;
    el.hpText.textContent = `${Math.ceil(player.hp)}/${Math.round(player.maxHp)}`;
    el.lvlText.textContent = `Lv ${player.level}`;
    el.kills.textContent = isBoglandsRun()
      ? `Kills: ${kills}/${bogKillTarget()}`
      : `Kills: ${kills}`;
    if (el.goldText) el.goldText.textContent = `Gold: ${gold}`;
    if (el.shardsHud) el.shardsHud.textContent = `Shards: ${runShards}`;
    if (el.diffText) {
      let t = diffLabel();
      if (playMode === "hall" && agonyEnabled && agonyRank < (AGONY_CFG.maxRank || 5)) {
        t += ` · ${Math.round(agonyMeter * 100)}%`;
      } else if (playMode === "hall" && agonyEnabled) {
        t += " · MAX";
      }
      el.diffText.textContent = t;
    }
    updateRunPills();

    if (phase === "boss" || phase === "boss_announce") {
      el.waveText.textContent = "BOSS";
    } else if (isBoglandsRun()) {
      const hallShort = currentHall ? currentHall.name : "Hall";
      el.waveText.textContent = `${hallShort} · ${kills}/${bogKillTarget()}`;
    } else {
      const left = Math.max(0, RUN_DURATION_SEC - elapsed);
      const hallShort = currentHall ? currentHall.name : "Hall";
      el.waveText.textContent = `${hallShort} · ${formatTime(left)}`;
    }

    if (el.skillCdFill) {
      el.skillCdFill.style.width = "0%";
      el.skillCdFill.style.opacity = "0.4";
    }

    // Status panel (top-left)
    if (el.stClass) {
      el.stClass.textContent = player.name;
      el.stLevel.textContent = `Lv ${player.level}`;
      el.stHp.textContent = `${Math.ceil(player.hp)}/${Math.round(player.maxHp)}`;
      el.stAtk.textContent = String(Math.round(player.damage));
      const aps = player.attackCooldown > 0 ? 1 / player.attackCooldown : 0;
      el.stAsp.textContent = `${aps.toFixed(2)}/s`;
      el.stSpd.textContent = String(Math.round(player.speed));
      const rng = player.style === "melee"
        ? Math.round(player.attackRange * (player.meleeArc || 1))
        : Math.round(player.attackRange);
      el.stRng.textContent = String(rng);
      const multi = player.style === "melee"
        ? `×${(player.meleeArc || 1.1).toFixed(1)}`
        : player.style === "chain"
          ? `${Math.floor(player.multistrike || 1)}×${player.chainJumps || 2}j`
          : String(Math.floor(player.multistrike || 1) + (player.extraProjectiles || 0));
      el.stMulti.textContent = multi;
      if (el.stCrit) el.stCrit.textContent = `${Math.round((player.critChance || 0) * 100)}%`;
      if (el.stCdmg) el.stCdmg.textContent = `+${Math.round((player.critBonus || 0) * 100)}%`;
      if (el.stDef) el.stDef.textContent = String(Math.round(player.defense || 0));
      // Extra mechanics readout if present
      const stBlk = document.getElementById("st-block");
      const stForce = document.getElementById("st-force");
      const stMulti = document.getElementById("st-multi-stat");
      if (stBlk) stBlk.textContent = String(Math.round(player.blockStrength || 0));
      if (stForce) stForce.textContent = (player.force || 1).toFixed(2);
      if (stMulti) stMulti.textContent = (player.multistrike || 1).toFixed(2);
    }
  }

  // ─── Render / Sprites ────────────────────────────────────
  function roundRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
  }

  function drawShadow(x, y, rx, ry) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawHpBar(x, y, w, h, pct, color) {
    ctx.fillStyle = "rgba(0,0,0,0.65)";
    ctx.fillRect(x - w / 2 - 1, y - 1, w + 2, h + 2);
    ctx.fillStyle = "#2a1520";
    ctx.fillRect(x - w / 2, y, w, h);
    ctx.fillStyle = color;
    ctx.fillRect(x - w / 2, y, w * clamp(pct, 0, 1), h);
  }

  function drawFloor() {
    const tile = 56;
    const startX = Math.floor(camera.x / tile) * tile;
    const startY = Math.floor(camera.y / tile) * tile;
    const theme = (currentHall && currentHall.theme) || {
      style: "cavern",
      floorA: "#12101a", floorB: "#0e0c14", floorC: "#0a0810",
      accent: "rgba(120,70,160,0.4)", ritual: "rgba(180,120,40,0.2)",
      prop: "#1a1524", propLite: "#3a3050", glow: "rgba(140,80,180,0.15)",
    };
    const style = theme.style || "cavern";

    ctx.fillStyle = theme.floorC || theme.floorB || "#0a0812";
    ctx.fillRect(0, 0, W, H);

    for (let x = startX; x < camera.x + W + tile; x += tile) {
      for (let y = startY; y < camera.y + H + tile; y += tile) {
        const gx = (x / tile) | 0;
        const gy = (y / tile) | 0;
        const h = ((gx * 13 + gy * 7) % 5);
        const a = theme.floorA || "#14101c";
        const b = theme.floorB || "#100e16";
        const c = theme.floorC || b;
        const base = h === 0 ? a : h === 1 ? b : h === 2 ? a : h === 3 ? c : b;
        const sx = x - camera.x;
        const sy = y - camera.y;
        ctx.fillStyle = base;
        ctx.fillRect(sx, sy, tile, tile);

        ctx.strokeStyle = "rgba(10, 8, 16, 0.75)";
        ctx.lineWidth = 1;
        ctx.strokeRect(sx + 0.5, sy + 0.5, tile - 1, tile - 1);

        // style-specific floor details
        if (style === "ember") {
          if (((gx * 9 + gy * 17) % 7) === 0) {
            ctx.fillStyle = theme.ritual || "rgba(255,80,20,0.25)";
            ctx.beginPath();
            ctx.moveTo(sx + 8, sy + 20);
            ctx.lineTo(sx + 28, sy + 12);
            ctx.lineTo(sx + 44, sy + 30);
            ctx.lineTo(sx + 20, sy + 42);
            ctx.fill();
          }
          if (((gx + gy) % 5) === 0) {
            ctx.strokeStyle = "rgba(255,100,40,0.35)";
            ctx.beginPath();
            ctx.moveTo(sx + 10, sy + 14);
            ctx.lineTo(sx + 30, sy + 36);
            ctx.lineTo(sx + 48, sy + 28);
            ctx.stroke();
          }
        } else if (style === "frozen") {
          if (((gx * 5 + gy * 11) % 6) === 0) {
            ctx.strokeStyle = "rgba(180,230,255,0.22)";
            ctx.beginPath();
            ctx.moveTo(sx + 6, sy + 10);
            ctx.lineTo(sx + 28, sy + 40);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(sx + 40, sy + 8);
            ctx.lineTo(sx + 16, sy + 44);
            ctx.stroke();
          }
          if (((gx * 3 + gy) % 8) === 0) {
            ctx.fillStyle = "rgba(200,240,255,0.12)";
            ctx.beginPath();
            ctx.ellipse(sx + 28, sy + 28, 16, 10, 0.3, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (style === "bog") {
          if (((gx * 7 + gy * 13) % 5) === 0) {
            ctx.fillStyle = "rgba(40,90,50,0.35)";
            ctx.beginPath();
            ctx.ellipse(sx + 28, sy + 30, 18, 10, 0.2, 0, Math.PI * 2);
            ctx.fill();
          }
          if (((gx + gy * 3) % 9) === 0) {
            ctx.fillStyle = "rgba(80,140,60,0.2)";
            ctx.beginPath();
            ctx.ellipse(sx + 18, sy + 20, 10, 5, 0, 0, Math.PI * 2);
            ctx.fill();
          }
        } else if (style === "viaduct") {
          // stone brick pattern
          ctx.strokeStyle = "rgba(80,90,110,0.25)";
          ctx.beginPath();
          ctx.moveTo(sx, sy + tile / 2);
          ctx.lineTo(sx + tile, sy + tile / 2);
          ctx.moveTo(sx + tile / 2 + (gy % 2) * 14 - 7, sy);
          ctx.lineTo(sx + tile / 2 + (gy % 2) * 14 - 7, sy + tile);
          ctx.stroke();
          if (((gx * 5 + gy * 9) % 11) === 0) {
            ctx.fillStyle = "rgba(140,160,200,0.08)";
            ctx.fillRect(sx + 8, sy + 8, tile - 16, tile - 16);
          }
        } else if (style === "dissonance") {
          if (((gx + gy) % 3) === 0) {
            ctx.fillStyle = `hsla(${280 + ((gx * 17 + gy * 23) % 60)}, 45%, 22%, 0.35)`;
            ctx.beginPath();
            ctx.moveTo(sx + 8 + (gx % 5), sy + 6);
            ctx.lineTo(sx + 48, sy + 12 + (gy % 7));
            ctx.lineTo(sx + 40, sy + 48);
            ctx.lineTo(sx + 4, sy + 40);
            ctx.fill();
          }
        } else if (style === "vault") {
          ctx.strokeStyle = "rgba(212,168,75,0.12)";
          ctx.strokeRect(sx + 4, sy + 4, tile - 8, tile - 8);
          if (((gx * 3 + gy * 7) % 10) === 0) {
            ctx.fillStyle = "rgba(212,168,75,0.15)";
            ctx.beginPath();
            ctx.arc(sx + 28, sy + 28, 6, 0, Math.PI * 2);
            ctx.fill();
          }
        } else {
          // cavern: crystals / blood-violet stains
          if (((gx * 17 + gy * 31) % 5) === 0) {
            ctx.fillStyle = "rgba(70, 45, 100, 0.25)";
            ctx.fillRect(sx + 10, sy + 14, 12, 7);
            ctx.fillRect(sx + 28, sy + 32, 9, 6);
          }
          if (((gx * 9 + gy * 19) % 11) === 0) {
            ctx.fillStyle = theme.ritual || "rgba(120, 40, 160, 0.2)";
            ctx.beginPath();
            ctx.ellipse(sx + 30, sy + 28, 14, 8, 0.4, 0, Math.PI * 2);
            ctx.fill();
          }
          if (((gx * 5 + gy * 11) % 9) === 0) {
            ctx.strokeStyle = "rgba(100, 60, 160, 0.3)";
            ctx.beginPath();
            ctx.moveTo(sx + 8, sy + 12);
            ctx.lineTo(sx + 22, sy + 28);
            ctx.lineTo(sx + 40, sy + 22);
            ctx.stroke();
          }
        }
      }
    }

    // Ambient vignette / glow
    if (theme.glow) {
      const g = ctx.createRadialGradient(W * 0.5, H * 0.45, 40, W * 0.5, H * 0.45, Math.max(W, H) * 0.7);
      g.addColorStop(0, theme.glow);
      g.addColorStop(1, "transparent");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }

    // decorative props matching hall
    drawHallProps(theme, style);
    drawMapDecor(theme);
  }

  function drawHallProps(theme, style) {
    const pillars = [
      [220, 200], [1980, 200], [220, 1200], [1980, 1200],
      [1100, 120], [1100, 1280], [120, 700], [2080, 700],
      [600, 400], [1600, 400], [600, 1000], [1600, 1000],
    ];
    const prop = theme.prop || "#1a1524";
    const lite = theme.propLite || "#3a3050";

    for (let i = 0; i < pillars.length; i++) {
      const [px, py] = pillars[i];
      const sx = px - camera.x;
      const sy = py - camera.y;
      if (sx < -50 || sy < -80 || sx > W + 50 || sy > H + 80) continue;
      drawShadow(sx, sy + 18, 18, 7);

      if (style === "ember") {
        // basalt pillars + lava cracks
        ctx.fillStyle = prop;
        ctx.fillRect(sx - 12, sy - 36, 24, 48);
        ctx.fillStyle = lite;
        ctx.fillRect(sx - 4, sy - 20, 8, 28);
        ctx.fillStyle = "rgba(255,80,20,0.35)";
        ctx.fillRect(sx - 2, sy + 8, 4, 10);
      } else if (style === "frozen") {
        // ice columns
        ctx.fillStyle = "rgba(140,200,230,0.35)";
        ctx.beginPath();
        ctx.moveTo(sx - 10, sy + 16);
        ctx.lineTo(sx - 6, sy - 40);
        ctx.lineTo(sx + 6, sy - 40);
        ctx.lineTo(sx + 10, sy + 16);
        ctx.fill();
        ctx.fillStyle = "rgba(200,240,255,0.4)";
        ctx.fillRect(sx - 3, sy - 36, 4, 40);
      } else if (style === "viaduct") {
        // stone posts / lanterns
        ctx.fillStyle = prop;
        ctx.fillRect(sx - 8, sy - 40, 16, 52);
        ctx.fillStyle = lite;
        ctx.fillRect(sx - 12, sy - 46, 24, 8);
        ctx.fillStyle = "rgba(180,200,240,0.35)";
        ctx.beginPath();
        ctx.arc(sx, sy - 28, 5, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === "bog") {
        // dead trees / stumps
        ctx.strokeStyle = prop;
        ctx.lineWidth = 4;
        ctx.lineCap = "round";
        ctx.beginPath();
        ctx.moveTo(sx, sy + 16);
        ctx.quadraticCurveTo(sx + 6, sy - 10, sx - 4, sy - 42);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(sx - 2, sy - 18);
        ctx.lineTo(sx - 14, sy - 30);
        ctx.moveTo(sx, sy - 24);
        ctx.lineTo(sx + 12, sy - 32);
        ctx.stroke();
        ctx.fillStyle = "rgba(60,120,50,0.3)";
        ctx.beginPath();
        ctx.ellipse(sx, sy + 14, 16, 6, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (style === "vault") {
        // golden pillars
        ctx.fillStyle = prop;
        ctx.fillRect(sx - 10, sy - 40, 20, 52);
        ctx.fillStyle = lite;
        ctx.fillRect(sx - 14, sy - 46, 28, 8);
        ctx.fillRect(sx - 12, sy + 8, 24, 6);
        ctx.fillStyle = "rgba(255,220,120,0.25)";
        ctx.fillRect(sx - 4, sy - 30, 8, 30);
      } else if (style === "dissonance") {
        // floating shards
        ctx.fillStyle = lite;
        ctx.save();
        ctx.translate(sx, sy - 10);
        ctx.rotate((i * 0.7 + elapsed * 0.3) % (Math.PI * 2));
        ctx.fillRect(-8, -8, 16, 16);
        ctx.restore();
        ctx.strokeStyle = theme.accent || "rgba(220,60,180,0.4)";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(sx, sy, 18 + Math.sin(elapsed * 2 + i) * 4, 0, Math.PI * 1.4);
        ctx.stroke();
      } else {
        // cavern crystal pillars
        ctx.fillStyle = prop;
        ctx.fillRect(sx - 12, sy - 36, 24, 48);
        ctx.fillStyle = lite;
        ctx.fillRect(sx - 14, sy - 42, 28, 10);
        ctx.fillStyle = theme.glow || "rgba(140, 80, 180, 0.2)";
        ctx.beginPath();
        ctx.moveTo(sx, sy - 28);
        ctx.lineTo(sx + 8, sy - 8);
        ctx.lineTo(sx - 8, sy - 8);
        ctx.fill();
      }
    }
  }

  function drawMapDecor(theme) {
    const accent = theme.accent || "rgba(140, 80, 180, 0.45)";
    const ritual = theme.ritual || "rgba(200, 140, 50, 0.28)";
    // map border
    ctx.strokeStyle = accent;
    ctx.lineWidth = 5;
    ctx.strokeRect(-camera.x + 6, -camera.y + 6, MAP_W - 12, MAP_H - 12);
    ctx.strokeStyle = theme.glow || "rgba(80, 40, 100, 0.3)";
    ctx.lineWidth = 2;
    ctx.strokeRect(-camera.x + 14, -camera.y + 14, MAP_W - 28, MAP_H - 28);

    // center ritual circle
    const cx = MAP_W / 2 - camera.x;
    const cy = MAP_H / 2 - camera.y;
    ctx.save();
    ctx.strokeStyle = ritual;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(cx, cy, 110, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, 72, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + elapsed * 0.15;
      const x1 = cx + Math.cos(a) * 72;
      const y1 = cy + Math.sin(a) * 72;
      const x2 = cx + Math.cos(a) * 95;
      const y2 = cy + Math.sin(a) * 95;
      ctx.strokeStyle = accent;
      ctx.globalAlpha = 0.35;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.strokeStyle = theme.glow || "rgba(180, 60, 80, 0.12)";
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
      const a = -Math.PI / 2 + (i * 2 * Math.PI * 2) / 5;
      const px = cx + Math.cos(a) * 48;
      const py = cy + Math.sin(a) * 48;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.restore();
  }

  /** Attack frame helpers: 0 windup, 1 strike, 2 recovery */
  function atkPose() {
    const a = player.atk;
    if (!a || !a.active) return { phase: -1, p: 0 };
    return { phase: a.phase, p: a.progress };
  }

  function heroPalettes() {
    return {
      swordsman: { skin: "#e8c8a0", armor: "#8a9098", accent: "#c04040", dark: "#4a4058", weapon: "#c8d0d8" },
      archer: { skin: "#e8c8a0", armor: "#4a7a40", accent: "#8fd46a", dark: "#2a5030", weapon: "#8b5a2b" },
      exterminator: { skin: "#d0a888", armor: "#6a4030", accent: "#ff8040", dark: "#3a2018", weapon: "#505860" },
      cleric: { skin: "#f0d8b8", armor: "#e8e0d0", accent: "#d4a84b", dark: "#8a8070", weapon: "#f0e0a0" },
      warlock: { skin: "#c0a090", armor: "#4a2060", accent: "#a060d0", dark: "#2a1038", weapon: "#8060a0" },
      sorceress: { skin: "#e8c8a0", armor: "#2a3a70", accent: "#7aa8ff", dark: "#1a2a55", weapon: "#6a4a28" },
      shield_maiden: { skin: "#e0c8a8", armor: "#a8b0c0", accent: "#d4a84b", dark: "#505868", weapon: "#707880" },
      beast_huntress: { skin: "#d8b090", armor: "#6a5030", accent: "#d0a060", dark: "#3a3018", weapon: "#8b6a40" },
      norseman: { skin: "#e0c8a0", armor: "#4a6080", accent: "#80c0e0", dark: "#2a3848", weapon: "#90a0b0" },
      landsknecht: { skin: "#e0c0a0", armor: "#8a6030", accent: "#d4a84b", dark: "#4a3018", weapon: "#3a3028" },
      sage: { skin: "#e8d0b8", armor: "#5a4080", accent: "#c0a0ff", dark: "#302048", weapon: "#9070c0" },
      bard: { skin: "#f0d0b8", armor: "#804060", accent: "#e0a0c0", dark: "#402030", weapon: "#c09050" },
      crone: { skin: "#c0b090", armor: "#3a5030", accent: "#60a050", dark: "#1a3018", weapon: "#506040" },
      alchemist: { skin: "#e0d0b0", armor: "#306058", accent: "#50c0b0", dark: "#183830", weapon: "#80c0b0" },
    };
  }

  function drawHeroLegs(x, by, f, pal, flash, stride) {
    const s = stride || 0;
    ctx.fillStyle = flash ? "#fff" : pal.dark;
    ctx.fillRect(x - 7, by + 6, 5, 10 + (s > 0 ? 1 : 0));
    ctx.fillRect(x + 2, by + 6 + s, 5, 10 - s);
    ctx.fillStyle = flash ? "#fff" : "#2a2030";
    ctx.fillRect(x - 8, by + 14, 6, 4);
    ctx.fillRect(x + 2, by + 14 + s, 6, 4);
  }

  function drawHeroHead(x, by, f, pal, flash, opts) {
    opts = opts || {};
    ctx.fillStyle = flash ? "#fff" : pal.skin;
    ctx.beginPath();
    ctx.arc(x, by - 12, opts.bigHead ? 7.5 : 6.5, 0, Math.PI * 2);
    ctx.fill();
    // eyes
    ctx.fillStyle = opts.glowEyes ? pal.accent : "#1a1010";
    ctx.beginPath();
    ctx.arc(x - 2.2 * f, by - 12, opts.glowEyes ? 1.8 : 1.4, 0, Math.PI * 2);
    ctx.arc(x + 2.5 * f, by - 12, opts.glowEyes ? 1.8 : 1.4, 0, Math.PI * 2);
    ctx.fill();
    if (opts.hood) {
      ctx.fillStyle = flash ? "#fff" : pal.dark;
      ctx.beginPath();
      ctx.arc(x, by - 14, 9, Math.PI * 1.05, Math.PI * 1.95);
      ctx.fill();
      ctx.fillRect(x - 9, by - 14, 18, 5);
    }
    if (opts.helm) {
      ctx.fillStyle = flash ? "#fff" : pal.armor;
      roundRect(x - 8, by - 20, 16, 10, 3);
      ctx.fill();
      ctx.fillStyle = "#1a1018";
      ctx.fillRect(x - 5, by - 15, 10, 3);
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.fillRect(x - 4, by - 14.5, 3, 2);
      ctx.fillRect(x + 1, by - 14.5, 3, 2);
    }
    if (opts.hat) {
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.beginPath();
      ctx.ellipse(x, by - 18, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 3, by - 26, 6, 10);
    }
    if (opts.crown) {
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.beginPath();
      ctx.moveTo(x - 7, by - 16);
      ctx.lineTo(x - 4, by - 24);
      ctx.lineTo(x, by - 17);
      ctx.lineTo(x + 4, by - 24);
      ctx.lineTo(x + 7, by - 16);
      ctx.closePath();
      ctx.fill();
    }
    if (opts.beard) {
      ctx.fillStyle = flash ? "#fff" : "#d0d0d8";
      ctx.beginPath();
      ctx.moveTo(x - 4, by - 8);
      ctx.lineTo(x, by - 2);
      ctx.lineTo(x + 4, by - 8);
      ctx.fill();
    }
  }

  function drawHeroTorso(x, by, lean, pal, flash, shape) {
    ctx.fillStyle = flash ? "#fff" : pal.armor;
    if (shape === "robe") {
      ctx.beginPath();
      ctx.moveTo(x - 10 + lean, by - 6);
      ctx.lineTo(x + 10 + lean, by - 6);
      ctx.lineTo(x + 13, by + 16);
      ctx.lineTo(x - 13, by + 16);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.globalAlpha = 0.45;
      ctx.beginPath();
      ctx.moveTo(x - 3 + lean, by - 6);
      ctx.lineTo(x + 3 + lean, by - 6);
      ctx.lineTo(x + 4, by + 16);
      ctx.lineTo(x - 4, by + 16);
      ctx.closePath();
      ctx.fill();
      ctx.globalAlpha = 1;
    } else {
      roundRect(x - 9 + lean * 0.4, by - 8, 18, 16, 3);
      ctx.fill();
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.globalAlpha = 0.55;
      roundRect(x - 6 + lean * 0.4, by - 5, 12, 5, 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function weaponAngle(pose, idle, windup, strikeStart, strikeEnd, recover) {
    if (pose.phase === 0) return windup + (strikeStart - windup) * pose.p * 0.3;
    if (pose.phase === 1) return strikeStart + (strikeEnd - strikeStart) * pose.p;
    if (pose.phase === 2) return strikeEnd + (recover - strikeEnd) * pose.p;
    return idle;
  }

  function drawTrailArc(ox, oy, r, a0, a1, color, alpha) {
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ox, oy, r, a0, a1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }

  // ── Individual heroes ───────────────────────────────────

  function drawSwordsmanHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const lean = pose.phase === 0 ? -2 * f : pose.phase === 1 ? 5 * f : 0;
    const by = y + Math.sin(bob) * 1.5;
    drawShadow(x, y + 16, 14, 5);
    // cape
    ctx.fillStyle = flash ? "#fff" : "#8b2030";
    ctx.beginPath();
    ctx.moveTo(x - 5 * f, by - 4);
    ctx.quadraticCurveTo(x - 18 * f - lean, by + 8, x - 8 * f, by + 18);
    ctx.lineTo(x + 2 * f, by + 8);
    ctx.fill();
    drawHeroLegs(x, by, f, pal, flash, pose.phase === 1 ? 2 : 0);
    drawHeroTorso(x, by, lean, pal, flash, "armor");
    // chest cross
    ctx.strokeStyle = flash ? "#fff" : pal.accent;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x + lean * 0.4, by - 4);
    ctx.lineTo(x + lean * 0.4, by + 4);
    ctx.moveTo(x - 4 + lean * 0.4, by);
    ctx.lineTo(x + 4 + lean * 0.4, by);
    ctx.stroke();
    drawHeroHead(x + lean * 0.4, by, f, pal, flash, { helm: true });
    // zweihänder
    const ang = skillOn
      ? Math.sin(elapsed * 22) * 1.4
      : weaponAngle(pose, 0.4 * f, -1.5 * f, -1.8 * f, 1.6 * f, 0.35 * f);
    ctx.save();
    ctx.translate(x + 10 * f + lean, by);
    ctx.rotate(ang);
    ctx.fillStyle = flash ? "#fff" : "#8b5a2b";
    ctx.fillRect(-2, 2, 4, 8);
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.fillRect(-2.5, -26, 5, 28);
    ctx.fillStyle = flash ? "#fff" : pal.accent;
    ctx.fillRect(-6, 0, 12, 3);
    if (pose.phase === 1) drawTrailArc(0, 0, 22, -1.5, 0.8, "#ffe0a0", 0.35 * (1 - pose.p));
    ctx.restore();
    if (skillOn) {
      ctx.strokeStyle = "rgba(224,112,112,0.5)";
      ctx.beginPath();
      ctx.arc(x, by, 20 + Math.sin(elapsed * 18) * 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawArcherHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.6;
    const drawBack = pose.phase === 0 ? pose.p * 11 : pose.phase === 1 ? 1 : 0;
    drawShadow(x, y + 16, 12, 5);
    ctx.fillStyle = flash ? "#fff" : pal.dark;
    ctx.beginPath();
    ctx.moveTo(x - 4 * f, by - 6);
    ctx.quadraticCurveTo(x - 16 * f, by + 4, x - 6 * f, by + 18);
    ctx.lineTo(x + 4 * f, by + 8);
    ctx.fill();
    drawHeroLegs(x, by, f, pal, flash, Math.sin(bob) > 0 ? 1 : 0);
    drawHeroTorso(x, by, 0, pal, flash, "armor");
    // quiver
    ctx.fillStyle = flash ? "#fff" : "#5a3a20";
    ctx.fillRect(x - 12 * f, by - 8, 5, 14);
    ctx.fillStyle = flash ? "#fff" : "#c0a060";
    ctx.fillRect(x - 11 * f, by - 13, 1.5, 6);
    ctx.fillRect(x - 9 * f, by - 12, 1.5, 5);
    drawHeroHead(x, by, f, pal, flash, { hood: true });
    ctx.save();
    ctx.translate(x + 11 * f, by);
    ctx.rotate(pose.phase === 0 ? -0.12 * f : pose.phase === 1 ? 0.12 * f : 0);
    ctx.strokeStyle = flash ? "#fff" : pal.weapon;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(0, 0, 12, -1.15, 1.15);
    ctx.stroke();
    const pull = -drawBack * f;
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(Math.cos(-1.15) * 12, Math.sin(-1.15) * 12);
    ctx.lineTo(pull, 0);
    ctx.lineTo(Math.cos(1.15) * 12, Math.sin(1.15) * 12);
    ctx.stroke();
    if (pose.phase !== 1) {
      ctx.fillStyle = flash ? "#fff" : "#c8d8a0";
      ctx.fillRect(pull, -1.2, 14, 2.4);
      ctx.beginPath();
      ctx.moveTo(14, 0); ctx.lineTo(18, -3); ctx.lineTo(18, 3);
      ctx.fill();
    } else {
      ctx.globalAlpha = 0.55 * (1 - pose.p);
      ctx.strokeStyle = pal.accent;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(24 * f, 0);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawExterminatorHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.2;
    drawShadow(x, y + 16, 13, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "armor");
    // tank straps
    ctx.strokeStyle = flash ? "#fff" : "#3a2818";
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 8, by - 6, 6, 12);
    ctx.fillStyle = flash ? "#fff" : "#ff6030";
    ctx.fillRect(x - 7, by - 2, 4, 6);
    drawHeroHead(x, by, f, pal, flash, { helm: true });
    // flamethrower
    const lift = pose.phase === 0 ? -pose.p * 6 : pose.phase === 1 ? -2 : 0;
    ctx.save();
    ctx.translate(x + 12 * f, by + lift);
    ctx.rotate(0.1 * f + (pose.phase === 1 ? 0.15 * f : 0));
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.fillRect(-2, -4, 18, 6);
    ctx.fillStyle = flash ? "#fff" : "#303840";
    ctx.fillRect(14, -5, 6, 8);
    if (pose.phase === 1 || skillOn) {
      for (let i = 0; i < 5; i++) {
        ctx.globalAlpha = 0.5 * (1 - i / 5) * (pose.phase === 1 ? 1 - pose.p * 0.3 : 0.7);
        ctx.fillStyle = i % 2 ? "#ffd040" : "#ff6020";
        ctx.beginPath();
        ctx.ellipse(22 + i * 8, Math.sin(elapsed * 20 + i) * 3, 6 + i, 4 + i * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawClericHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const lean = pose.phase === 1 ? 3 * f : 0;
    const by = y + Math.sin(bob) * 1.1;
    drawShadow(x, y + 16, 13, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, lean, pal, flash, "robe");
    drawHeroHead(x + lean * 0.3, by, f, pal, flash, { crown: true });
    // scepter
    const ang = weaponAngle(pose, 0.2 * f, -0.8 * f, -1.0 * f, 1.0 * f, 0.2 * f);
    ctx.save();
    ctx.translate(x + 12 * f + lean, by);
    ctx.rotate(ang);
    ctx.fillStyle = flash ? "#fff" : "#8b6a30";
    ctx.fillRect(-1.5, -22, 3, 28);
    ctx.fillStyle = flash ? "#fff" : pal.accent;
    ctx.beginPath();
    ctx.arc(0, -26, 5, 0, Math.PI * 2);
    ctx.fill();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.4 * (1 - pose.p);
      ctx.fillStyle = "#fff6c0";
      ctx.beginPath();
      ctx.arc(0, -26, 12 + pose.p * 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    if (skillOn) {
      ctx.strokeStyle = "rgba(240,224,160,0.45)";
      ctx.beginPath();
      ctx.arc(x, by, 22 + Math.sin(elapsed * 8) * 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawWarlockHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.3;
    drawShadow(x, y + 16, 13, 5);
    // tattered cape
    ctx.fillStyle = flash ? "#fff" : "#2a1038";
    ctx.beginPath();
    ctx.moveTo(x - 4 * f, by - 4);
    ctx.quadraticCurveTo(x - 18 * f, by + 2, x - 10 * f, by + 18);
    ctx.lineTo(x + 2 * f, by + 6);
    ctx.fill();
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "robe");
    drawHeroHead(x, by, f, pal, flash, { hood: true, glowEyes: true });
    // skull staff / cast hand
    const raise = pose.phase === 0 ? pose.p * 10 : pose.phase === 1 ? 8 : 2;
    ctx.save();
    ctx.translate(x + 12 * f, by + 2 - raise);
    ctx.fillStyle = flash ? "#fff" : "#4a3050";
    ctx.fillRect(-1.5, -16, 3, 22);
    ctx.fillStyle = flash ? "#fff" : "#e0d0c0";
    ctx.beginPath();
    ctx.arc(0, -20, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#200";
    ctx.fillRect(-2, -21, 1.5, 1.5);
    ctx.fillRect(1, -21, 1.5, 1.5);
    ctx.restore();
    // orbiting specters
    const n = pose.phase >= 0 ? 4 : 2;
    for (let i = 0; i < n; i++) {
      const a = elapsed * (2.5 + (pose.phase === 1 ? 3 : 0)) + (i / n) * Math.PI * 2;
      const ox = x + Math.cos(a) * (18 + (pose.phase === 1 ? 6 : 0));
      const oy = by - 2 + Math.sin(a) * 8;
      ctx.globalAlpha = 0.55;
      ctx.fillStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(ox, oy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawSorceressHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.2;
    const staffLift = pose.phase === 0 ? pose.p * 10 : pose.phase === 1 ? 8 : 2;
    drawShadow(x, y + 16, 13, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "robe");
    drawHeroHead(x, by, f, pal, flash, { hood: true, glowEyes: true });
    ctx.save();
    ctx.translate(x + 13 * f, by + 2 - staffLift);
    ctx.rotate(pose.phase === 0 ? -0.4 * f * pose.p : -0.25 * f);
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.fillRect(-1.5, -22, 3, 30);
    ctx.globalAlpha = pose.phase === 1 ? 1 : 0.7 + Math.sin(elapsed * 6) * 0.3;
    ctx.fillStyle = flash ? "#fff" : "#a0d0ff";
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(5, -22); ctx.lineTo(0, -16); ctx.lineTo(-5, -22);
    ctx.fill();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.35 * (1 - pose.p);
      ctx.beginPath();
      ctx.arc(0, -22, 14 + pose.p * 10, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.restore();
    const spd = pose.phase === 1 ? 7 : 2.5;
    for (let i = 0; i < 3; i++) {
      const a = elapsed * spd + (i / 3) * Math.PI * 2;
      ctx.fillStyle = "rgba(120,180,255,0.4)";
      ctx.beginPath();
      ctx.arc(x + Math.cos(a) * 16, by - 2 + Math.sin(a) * 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawShieldMaidenHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const lean = pose.phase === 0 ? -2 * f : pose.phase === 1 ? 4 * f : 0;
    const by = y + Math.sin(bob) * 1.0;
    drawShadow(x, y + 16, 14, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, lean, pal, flash, "armor");
    drawHeroHead(x + lean * 0.3, by, f, pal, flash, { helm: true });
    // shield
    const shx = pose.phase === 1 ? 14 * f : -12 * f;
    ctx.fillStyle = flash ? "#fff" : pal.armor;
    ctx.beginPath();
    ctx.ellipse(x + shx + lean, by + 2, 7, 11, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = pal.accent;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // hammer
    const ang = weaponAngle(pose, 0.5 * f, -1.4 * f, -1.7 * f, 1.5 * f, 0.4 * f);
    ctx.save();
    ctx.translate(x + 12 * f + lean, by);
    ctx.rotate(ang);
    ctx.fillStyle = flash ? "#fff" : "#5a4030";
    ctx.fillRect(-2, -4, 4, 18);
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.fillRect(-7, -14, 14, 10);
    if (pose.phase === 1) drawTrailArc(0, 0, 18, -1.4, 0.6, "#d0d8e8", 0.4 * (1 - pose.p));
    ctx.restore();
  }

  function drawBeastHuntressHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.7;
    drawShadow(x, y + 16, 12, 5);
    // cloak
    ctx.fillStyle = flash ? "#fff" : pal.dark;
    ctx.beginPath();
    ctx.moveTo(x - 4 * f, by - 6);
    ctx.quadraticCurveTo(x - 14 * f, by + 6, x - 6 * f, by + 17);
    ctx.lineTo(x + 3 * f, by + 6);
    ctx.fill();
    drawHeroLegs(x, by, f, pal, flash, pose.phase === 1 ? 2 : 0);
    drawHeroTorso(x, by, 0, pal, flash, "armor");
    drawHeroHead(x, by, f, pal, flash, { hood: true });
    // spear
    const throwOff = pose.phase === 1 ? pose.p * 16 * f : pose.phase === 0 ? -pose.p * 4 * f : 0;
    const ang = pose.phase === 0 ? -0.5 * f - pose.p * 0.3 * f : pose.phase === 1 ? 0.1 * f : 0.25 * f;
    ctx.save();
    ctx.translate(x + 10 * f + throwOff, by);
    ctx.rotate(ang);
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.fillRect(-1.5, -22, 3, 34);
    ctx.fillStyle = flash ? "#fff" : "#c0c8d0";
    ctx.beginPath();
    ctx.moveTo(0, -28); ctx.lineTo(4, -20); ctx.lineTo(-4, -20);
    ctx.fill();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.4 * (1 - pose.p);
      ctx.strokeStyle = pal.accent;
      ctx.beginPath();
      ctx.moveTo(0, 0); ctx.lineTo(20 * f, -4);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
    // tiny hound silhouette when skill
    if (skillOn) {
      ctx.fillStyle = "rgba(160,100,40,0.7)";
      ctx.beginPath();
      ctx.ellipse(x - 18 * f, by + 8, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawNorsemanHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.4;
    drawShadow(x, y + 16, 13, 5);
    ctx.fillStyle = flash ? "#fff" : "#d8d8e0";
    ctx.beginPath();
    ctx.moveTo(x - 6 * f, by - 4);
    ctx.quadraticCurveTo(x - 16 * f, by + 6, x - 8 * f, by + 16);
    ctx.lineTo(x + 4 * f, by + 6);
    ctx.fill();
    drawHeroLegs(x, by, f, pal, flash, pose.phase === 1 ? 1 : 0);
    drawHeroTorso(x, by, 0, pal, flash, "armor");
    drawHeroHead(x, by, f, pal, flash, { beard: true, helm: true });
    // dual axes — left + right, mirrored swing
    const sides = [
      { sx: -11, sign: -1 },
      { sx: 11, sign: 1 },
    ];
    for (const { sx, sign } of sides) {
      let ang;
      if (pose.phase === 0) ang = (-0.4 - pose.p * 1.0) * sign * f;
      else if (pose.phase === 1) ang = (-1.4 + pose.p * 2.8) * sign * f;
      else if (pose.phase === 2) ang = (1.4 - pose.p * 1.0) * sign * f;
      else ang = 0.35 * sign * f;
      ctx.save();
      ctx.translate(x + sx * f, by + (sign < 0 ? 2 : 0));
      ctx.rotate(ang);
      ctx.fillStyle = flash ? "#fff" : "#6a4a28";
      ctx.fillRect(-1.5, -2, 3, 14);
      ctx.fillStyle = flash ? "#fff" : pal.weapon;
      ctx.beginPath();
      ctx.moveTo(-7, -2); ctx.lineTo(7, -2); ctx.lineTo(0, -13);
      ctx.fill();
      ctx.restore();
    }
    if (pose.phase === 1) {
      drawTrailArc(x, by, 20, -0.5, 1.2, "#a0d0e8", 0.3 * (1 - pose.p));
    }
    if (skillOn) {
      ctx.strokeStyle = "rgba(128,192,224,0.45)";
      ctx.beginPath();
      ctx.arc(x, by, 24, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawLandsknechtHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.0;
    drawShadow(x, y + 16, 12, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "armor");
    // plume hat
    drawHeroHead(x, by, f, pal, flash, { hat: true });
    ctx.fillStyle = flash ? "#fff" : "#e04040";
    ctx.beginPath();
    ctx.moveTo(x + 2, by - 24);
    ctx.quadraticCurveTo(x + 10 * f, by - 32, x + 4 * f, by - 18);
    ctx.fill();
    // arquebus
    const kick = pose.phase === 1 ? -3 * f * (1 - pose.p) : 0;
    const aim = pose.phase === 0 ? -0.15 * f - pose.p * 0.05 * f : 0;
    ctx.save();
    ctx.translate(x + 8 * f + kick, by + 2);
    ctx.rotate(aim);
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.fillRect(-4, -2, 26, 4);
    ctx.fillStyle = flash ? "#fff" : "#5a4030";
    ctx.fillRect(-6, 0, 8, 6);
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.7 * (1 - pose.p);
      ctx.fillStyle = "#ffe080";
      ctx.beginPath();
      ctx.arc(24, 0, 5 + pose.p * 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawSageHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.1;
    drawShadow(x, y + 16, 12, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "robe");
    drawHeroHead(x, by, f, pal, flash, { hood: true, glowEyes: true, crown: true });
    // floating runes
    const n = 5;
    for (let i = 0; i < n; i++) {
      const a = elapsed * 1.8 + (i / n) * Math.PI * 2;
      const r = 20 + (pose.phase === 1 ? 8 : 0);
      const ox = x + Math.cos(a) * r;
      const oy = by - 4 + Math.sin(a) * 10;
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.globalAlpha = 0.7;
      ctx.fillRect(ox - 2, oy - 2, 4, 4);
      ctx.globalAlpha = 1;
    }
    // cast hands
    if (pose.phase >= 0) {
      ctx.fillStyle = flash ? "#fff" : pal.skin;
      ctx.beginPath();
      ctx.arc(x + 10 * f, by - (pose.phase === 1 ? 4 : 0), 3, 0, Math.PI * 2);
      ctx.fill();
      if (pose.phase === 1) {
        ctx.globalAlpha = 0.4 * (1 - pose.p);
        ctx.fillStyle = pal.accent;
        ctx.beginPath();
        ctx.arc(x + 14 * f, by - 2, 10 + pose.p * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }
  }

  function drawBardHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const lean = pose.phase === 1 ? 3 * f : 0;
    const by = y + Math.sin(bob) * 2.0;
    drawShadow(x, y + 16, 12, 5);
    // flamboyant cape
    ctx.fillStyle = flash ? "#fff" : pal.dark;
    ctx.beginPath();
    ctx.moveTo(x - 4 * f, by - 6);
    ctx.quadraticCurveTo(x - 18 * f, by, x - 8 * f, by + 18);
    ctx.lineTo(x + 4 * f, by + 6);
    ctx.fill();
    drawHeroLegs(x, by, f, pal, flash, Math.abs(Math.sin(bob)) > 0.5 ? 2 : 0);
    drawHeroTorso(x, by, lean, pal, flash, "armor");
    drawHeroHead(x + lean * 0.3, by, f, pal, flash, { hat: true });
    // lute
    const ang = weaponAngle(pose, 0.3 * f, -0.6 * f, -0.9 * f, 1.1 * f, 0.3 * f);
    ctx.save();
    ctx.translate(x + 10 * f + lean, by + 2);
    ctx.rotate(ang);
    ctx.fillStyle = flash ? "#fff" : pal.weapon;
    ctx.beginPath();
    ctx.ellipse(0, 4, 7, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(-1.5, -12, 3, 14);
    ctx.strokeStyle = "#eee";
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(-2, -10); ctx.lineTo(-2, 8);
    ctx.moveTo(2, -10); ctx.lineTo(2, 8);
    ctx.stroke();
    if (pose.phase === 1) {
      // music notes
      ctx.globalAlpha = 0.6 * (1 - pose.p);
      ctx.fillStyle = pal.accent;
      ctx.font = "12px serif";
      ctx.fillText("♪", 10, -8 - pose.p * 10);
      ctx.fillText("♫", 16, -2 - pose.p * 8);
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  function drawCroneHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.0;
    drawShadow(x, y + 16, 13, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "robe");
    drawHeroHead(x, by, f, pal, flash, { hood: true });
    // gnarled staff
    ctx.save();
    ctx.translate(x + 12 * f, by);
    ctx.rotate(pose.phase === 0 ? -0.3 * f * pose.p : pose.phase === 1 ? 0.2 * f : 0.1 * f);
    ctx.strokeStyle = flash ? "#fff" : "#4a3820";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 10);
    ctx.quadraticCurveTo(-4, -4, 2, -20);
    ctx.stroke();
    ctx.fillStyle = flash ? "#fff" : pal.accent;
    ctx.beginPath();
    ctx.arc(2, -22, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    // bog plants orbit
    const n = 4;
    for (let i = 0; i < n; i++) {
      const a = elapsed * 1.5 + (i / n) * Math.PI * 2 + (pose.phase === 1 ? pose.p : 0);
      const r = 22 + (pose.phase === 1 ? 6 : 0);
      const ox = x + Math.cos(a) * r;
      const oy = by + 4 + Math.sin(a) * 8;
      ctx.fillStyle = flash ? "#fff" : "#3a6828";
      ctx.fillRect(ox - 2, oy - 8, 4, 10);
      ctx.fillStyle = flash ? "#fff" : pal.accent;
      ctx.beginPath();
      ctx.ellipse(ox, oy - 10, 5, 4, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawAlchemistHero(x, y, f, bob, flash, skillOn, pose, pal) {
    const by = y + Math.sin(bob) * 1.2;
    drawShadow(x, y + 16, 12, 5);
    drawHeroLegs(x, by, f, pal, flash, 0);
    drawHeroTorso(x, by, 0, pal, flash, "robe");
    // goggles
    drawHeroHead(x, by, f, pal, flash, {});
    ctx.strokeStyle = flash ? "#fff" : "#80c0b0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(x - 3, by - 12, 3.5, 0, Math.PI * 2);
    ctx.arc(x + 3, by - 12, 3.5, 0, Math.PI * 2);
    ctx.stroke();
    // belt flasks
    const cols = ["#ff6040", "#40a0ff", "#80e0ff", "#80c040"];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = flash ? "#fff" : cols[i];
      ctx.fillRect(x - 8 + i * 6, by + 4, 4, 6);
    }
    // throw flask
    const throwX = pose.phase === 1 ? pose.p * 14 * f : pose.phase === 0 ? -pose.p * 4 * f : 0;
    const throwY = pose.phase === 0 ? -pose.p * 8 : pose.phase === 1 ? -6 + pose.p * 10 : 0;
    ctx.save();
    ctx.translate(x + 12 * f + throwX, by + throwY);
    ctx.rotate(elapsed * (pose.phase === 1 ? 8 : 1));
    ctx.fillStyle = flash ? "#fff" : cols[Math.floor(elapsed * 2) % 4];
    ctx.beginPath();
    ctx.moveTo(0, -6); ctx.lineTo(4, 4); ctx.lineTo(-4, 4);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillRect(-1.5, -8, 3, 4);
    ctx.restore();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.35 * (1 - pose.p);
      ctx.strokeStyle = pal.accent;
      ctx.beginPath();
      ctx.arc(x + 16 * f, by, 12 + pose.p * 10, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  const HERO_DRAWERS = {
    swordsman: drawSwordsmanHero,
    archer: drawArcherHero,
    exterminator: drawExterminatorHero,
    cleric: drawClericHero,
    warlock: drawWarlockHero,
    sorceress: drawSorceressHero,
    shield_maiden: drawShieldMaidenHero,
    beast_huntress: drawBeastHuntressHero,
    norseman: drawNorsemanHero,
    landsknecht: drawLandsknechtHero,
    sage: drawSageHero,
    bard: drawBardHero,
    crone: drawCroneHero,
    alchemist: drawAlchemistHero,
  };

  function drawPlayerSprite() {
    const px = player.x - camera.x;
    const py = player.y - camera.y;
    const blink = player.invuln > 0 && Math.floor(player.invuln * 20) % 2 === 0;
    if (blink) return;

    const flash = player.atk.active && player.atk.phase === 1 && player.atk.progress < 0.12;
    const skillOn = player.skillActive > 0;
    const bob = player.atk.active ? (player.bob || 0) * 0.25 : (player.bob || 0);
    const facing = player.facing || 1;
    const pose = atkPose();
    const pals = heroPalettes();
    const pal = pals[player.classId] || {
      skin: "#e8c8a0", armor: player.color, accent: player.color, dark: "#2a2030", weapon: "#aaa",
    };

    const drawer = HERO_DRAWERS[player.classId];
    if (drawer) {
      drawer(px, py, facing, bob, flash, skillOn, pose, pal);
    } else {
      drawSwordsmanHero(px, py, facing, bob, flash, skillOn, pose, pal);
    }

    // name tag
    ctx.font = "bold 10px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.5)";
    ctx.fillText(player.name, px + 1, py - 32);
    ctx.fillStyle = player.color;
    ctx.fillText(player.name, px, py - 33);

    // subtle melee range for close-range heroes
    const meleeStyles = ["melee", "hammer", "dualaxe", "lute", "scepter"];
    if (meleeStyles.includes(player.style)) {
      ctx.strokeStyle = "rgba(255,255,255,0.06)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(px, py, player.attackRange * (player.meleeArc || 1.1), 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  /** Grunt: claw swipe attack frames */
  function drawGruntSprite(x, y, e, facing) {
    const flash = e.hitFlash > 0;
    const pose = enemyAtkPose(e);
    const bob = pose.phase >= 0 ? 0 : Math.sin(elapsed * 8 + e.x) * 1.2;
    const lean = pose.phase === 0 ? -3 * facing : pose.phase === 1 ? 5 * facing : 0;
    const by = y + bob;
    drawShadow(x, y + 12, 10, 4);

    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#7a4a90" : "#5a3870");
    ctx.beginPath();
    ctx.ellipse(x + lean * 0.3, by + 2, 9, 10, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#4a2860";
    ctx.beginPath();
    ctx.ellipse(x + lean * 0.3, by + 4, 5, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    const hx = x + lean * 0.5;
    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#8a5aa0" : "#6b4a7a");
    ctx.beginPath();
    ctx.arc(hx, by - 8, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx - 7, by - 10);
    ctx.lineTo(hx - 12, by - 18);
    ctx.lineTo(hx - 3, by - 12);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + 7, by - 10);
    ctx.lineTo(hx + 12, by - 18);
    ctx.lineTo(hx + 3, by - 12);
    ctx.fill();

    ctx.fillStyle = flash ? "#fff" : (pose.phase === 0 ? "#ff8080" : "#ff4040");
    ctx.beginPath();
    ctx.arc(hx - 3 + facing, by - 9, 2.2, 0, Math.PI * 2);
    ctx.arc(hx + 3 + facing, by - 9, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.arc(hx - 3 + facing * 1.5, by - 9, 1, 0, Math.PI * 2);
    ctx.arc(hx + 3 + facing * 1.5, by - 9, 1, 0, Math.PI * 2);
    ctx.fill();

    // Claws — animated
    let clawAng;
    if (pose.phase === 0) clawAng = -0.9 - pose.p * 0.4; // raise back
    else if (pose.phase === 1) clawAng = -1.3 + pose.p * 2.4; // slash
    else if (pose.phase === 2) clawAng = 1.1 - pose.p * 0.7;
    else clawAng = 0.35;

    ctx.save();
    ctx.translate(x + 8 * facing + lean, by + 2);
    ctx.rotate(clawAng * facing);
    ctx.strokeStyle = flash ? "#fff" : "#e0c0f0";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(10, -4);
    ctx.moveTo(0, 2);
    ctx.lineTo(12, 2);
    ctx.moveTo(0, 4);
    ctx.lineTo(10, 8);
    ctx.stroke();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.4 * (1 - pose.p);
      ctx.strokeStyle = "#ff80c0";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 14, -0.8, 1.0);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // other claw idle/support
    ctx.strokeStyle = flash ? "#fff" : "#c0a0d0";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(x - 9 * facing, by + 4);
    ctx.lineTo(x - 14 * facing, by + 8);
    ctx.stroke();
  }

  /** Runner: lunge bite frames */
  function drawRunnerSprite(x, y, e, facing) {
    const flash = e.hitFlash > 0;
    const pose = enemyAtkPose(e);
    const bob = pose.phase >= 0 ? 0 : Math.sin(elapsed * 14 + e.y) * 2;
    const lunge = pose.phase === 0 ? -4 * facing : pose.phase === 1 ? (6 + pose.p * 8) * facing : 2 * facing;
    const by = y + bob;
    const bx = x + lunge * 0.4;
    drawShadow(x, y + 10, 12, 3.5);

    const stretch = pose.phase === 1 ? 1.15 : pose.phase === 0 ? 0.92 : 1;
    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#c07040" : "#a05030");
    ctx.beginPath();
    ctx.ellipse(bx, by + 2, 12 * stretch, 7 / stretch, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = flash ? "#fff" : "#803020";
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    const leg = pose.phase === 1 ? 6 : Math.sin(elapsed * 16 + e.x) * 5;
    ctx.beginPath();
    ctx.moveTo(bx - 6, by + 4);
    ctx.lineTo(bx - 10, by + 12 + leg);
    ctx.moveTo(bx + 4, by + 4);
    ctx.lineTo(bx + 8, by + 12 - leg);
    ctx.moveTo(bx - 2, by + 4);
    ctx.lineTo(bx - 4, by + 11 - leg);
    ctx.moveTo(bx + 8, by + 4);
    ctx.lineTo(bx + 12, by + 11 + leg);
    ctx.stroke();

    const headX = bx + (8 + (pose.phase === 1 ? 4 : 0)) * facing;
    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#d08050" : "#b06040");
    ctx.beginPath();
    ctx.ellipse(headX, by - 4, 7, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    // jaw open on windup/strike
    const jaw = pose.phase === 0 ? 2 + pose.p * 3 : pose.phase === 1 ? 5 : 0;
    ctx.beginPath();
    ctx.ellipse(headX + 6 * facing, by - 3 + jaw * 0.3, 5, 3 + jaw * 0.15, 0, 0, Math.PI * 2);
    ctx.fill();
    if (pose.phase >= 0 && pose.phase <= 1) {
      // teeth
      ctx.fillStyle = "#f0e0c0";
      ctx.fillRect(headX + 4 * facing, by - 2, 2, 3);
      ctx.fillRect(headX + 8 * facing, by - 1, 2, 3);
    }
    ctx.beginPath();
    ctx.moveTo(headX + 4 * facing, by - 8);
    ctx.lineTo(headX + 2 * facing, by - 16);
    ctx.lineTo(headX + 8 * facing, by - 8);
    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#d08050" : "#b06040");
    ctx.fill();

    ctx.fillStyle = flash ? "#fff" : "#ffe060";
    ctx.beginPath();
    ctx.arc(headX + 2 * facing, by - 5, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.arc(headX + 3 * facing, by - 5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = flash ? "#fff" : "#a05030";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(bx - 10, by);
    ctx.quadraticCurveTo(bx - 18, by - 8 + bob, bx - 14, by - 14);
    ctx.stroke();

    // lunge dash lines
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.35 * (1 - pose.p);
      ctx.strokeStyle = "#ffb080";
      ctx.beginPath();
      ctx.moveTo(bx - 16 * facing, by);
      ctx.lineTo(bx - 28 * facing, by - 2);
      ctx.moveTo(bx - 14 * facing, by + 4);
      ctx.lineTo(bx - 24 * facing, by + 6);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
  }

  /** Brute: club smash frames */
  function drawBruteSprite(x, y, e, facing) {
    const flash = e.hitFlash > 0;
    const pose = enemyAtkPose(e);
    const bob = pose.phase >= 0 ? 0 : Math.sin(elapsed * 4 + e.x * 0.1) * 0.8;
    const lean = pose.phase === 0 ? -2 * facing : pose.phase === 1 ? 5 * facing : 0;
    const by = y + bob;
    drawShadow(x, y + 16, 16, 5);

    ctx.fillStyle = flash ? "#fff" : "#3a2840";
    ctx.fillRect(x - 10, by + 6, 8, 12);
    ctx.fillRect(x + 2, by + 6, 8, 12);
    ctx.fillStyle = flash ? "#fff" : "#2a1830";
    ctx.fillRect(x - 11, by + 16, 9, 4);
    ctx.fillRect(x + 2, by + 16, 9, 4);

    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#5a3a60" : "#4a3050");
    roundRect(x - 14 + lean * 0.3, by - 10, 28, 22, 5);
    ctx.fill();
    ctx.strokeStyle = "rgba(0,0,0,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x + lean * 0.3, by - 6);
    ctx.lineTo(x + lean * 0.3, by + 8);
    ctx.stroke();
    ctx.fillStyle = flash ? "#fff" : "#5a4060";
    ctx.beginPath();
    ctx.arc(x - 14 + lean * 0.3, by - 4, 7, 0, Math.PI * 2);
    ctx.arc(x + 14 + lean * 0.3, by - 4, 7, 0, Math.PI * 2);
    ctx.fill();

    const hx = x + lean * 0.4;
    ctx.fillStyle = flash ? "#fff" : (e.isElite ? "#6a4a70" : "#5a3a58");
    ctx.beginPath();
    ctx.arc(hx, by - 16, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#4a3048";
    roundRect(hx - 7, by - 12, 14, 7, 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#e0d0b0";
    ctx.beginPath();
    ctx.moveTo(hx - 5, by - 8);
    ctx.lineTo(hx - 7, by - 2);
    ctx.lineTo(hx - 3, by - 8);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + 5, by - 8);
    ctx.lineTo(hx + 7, by - 2);
    ctx.lineTo(hx + 3, by - 8);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#ff8040";
    ctx.beginPath();
    ctx.arc(hx - 4, by - 18, 2.5, 0, Math.PI * 2);
    ctx.arc(hx + 4, by - 18, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Club swing
    let clubRot;
    if (pose.phase === 0) clubRot = (-1.6 - pose.p * 0.5) * facing; // raise
    else if (pose.phase === 1) clubRot = (-2.1 + pose.p * 3.4) * facing; // smash down
    else if (pose.phase === 2) clubRot = (1.3 - pose.p * 0.9) * facing;
    else clubRot = 0.4 * facing;

    ctx.save();
    ctx.translate(x + 16 * facing + lean, by - (pose.phase === 0 ? pose.p * 6 : 0));
    ctx.rotate(clubRot);
    ctx.fillStyle = flash ? "#fff" : "#5a3a20";
    ctx.fillRect(-3, -4, 6, 24);
    ctx.fillStyle = flash ? "#fff" : "#4a4038";
    ctx.beginPath();
    ctx.ellipse(0, -12, 10, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.4 * (1 - pose.p);
      ctx.strokeStyle = "#c0a080";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 0, 20, -1.5, 0.5);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();
  }

  /** Miniboss Herald — scythe swing frames */
  function drawMinibossSprite(x, y, e) {
    const flash = e.hitFlash > 0;
    const pose = enemyAtkPose(e);
    const bob = pose.phase >= 0 ? 0 : Math.sin(elapsed * 3) * 1.5;
    const lean = pose.phase === 0 ? -3 : pose.phase === 1 ? 6 : 0;
    const by = y + bob;
    const facing = player.x >= e.x ? 1 : -1;
    const lx = x + lean * facing * 0.3;

    ctx.globalAlpha = 0.25 + Math.sin(elapsed * 4) * 0.08;
    const grd = ctx.createRadialGradient(lx, by, 8, lx, by, e.r + 14);
    grd.addColorStop(0, "rgba(180,80,220,0.5)");
    grd.addColorStop(1, "rgba(180,80,220,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(lx, by, e.r + 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawShadow(x, y + 20, 20, 6);

    ctx.fillStyle = flash ? "#fff" : "#4a1860";
    ctx.beginPath();
    ctx.moveTo(lx, by - 4);
    ctx.quadraticCurveTo(lx - 30, by - 20, lx - 28, by + 16);
    ctx.quadraticCurveTo(lx - 14, by + 8, lx, by + 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx, by - 4);
    ctx.quadraticCurveTo(lx + 30, by - 20, lx + 28, by + 16);
    ctx.quadraticCurveTo(lx + 14, by + 8, lx, by + 6);
    ctx.fill();

    ctx.fillStyle = flash ? "#fff" : "#6a2a80";
    roundRect(lx - 12, by - 8, 24, 22, 4);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#9a50c0";
    roundRect(lx - 8, by - 4, 16, 8, 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#d4a84b";
    ctx.fillRect(lx - 12, by + 6, 24, 3);

    ctx.fillStyle = flash ? "#fff" : "#8a40a0";
    ctx.beginPath();
    ctx.arc(lx, by - 16, 11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#3a1048";
    ctx.beginPath();
    ctx.moveTo(lx - 8, by - 22);
    ctx.lineTo(lx - 14, by - 36);
    ctx.lineTo(lx - 2, by - 24);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx + 8, by - 22);
    ctx.lineTo(lx + 14, by - 36);
    ctx.lineTo(lx + 2, by - 24);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#ff80ff";
    ctx.beginPath();
    ctx.arc(lx, by - 28, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#ffe0ff";
    ctx.beginPath();
    ctx.arc(lx - 4, by - 17, 3, 0, Math.PI * 2);
    ctx.arc(lx + 4, by - 17, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#401060";
    ctx.beginPath();
    ctx.arc(lx - 4 + facing, by - 17, 1.4, 0, Math.PI * 2);
    ctx.arc(lx + 4 + facing, by - 17, 1.4, 0, Math.PI * 2);
    ctx.fill();

    // Scythe swing
    let scytheRot;
    if (pose.phase === 0) scytheRot = (-1.2 - pose.p * 0.6) * facing;
    else if (pose.phase === 1) scytheRot = (-1.8 + pose.p * 3.0) * facing;
    else if (pose.phase === 2) scytheRot = (1.2 - pose.p * 0.9) * facing;
    else scytheRot = -0.3 * facing;

    ctx.save();
    ctx.translate(lx + 18 * facing, by);
    ctx.rotate(scytheRot);
    ctx.fillStyle = flash ? "#fff" : "#3a2040";
    ctx.fillRect(-2, -24, 4, 36);
    ctx.fillStyle = flash ? "#fff" : "#c060e0";
    ctx.beginPath();
    ctx.moveTo(0, -28);
    ctx.lineTo(16 * facing, -18);
    ctx.lineTo(4 * facing, -12);
    ctx.closePath();
    ctx.fill();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.45 * (1 - pose.p);
      ctx.strokeStyle = "#e0a0ff";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(0, 0, 26, -1.4, 0.9);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    ctx.font = "bold 10px Segoe UI";
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillText("MINIBOSS", lx + 1, by - e.r - 18);
    ctx.fillStyle = "#e0b0ff";
    ctx.fillText("MINIBOSS", lx, by - e.r - 19);
    drawHpBar(lx, by - e.r - 12, e.r * 2.4, 4, e.hp / e.maxHp, "#a050d0");
  }

  /** Final boss Lord of Torment — claw swipe frames */
  function drawBossSprite(x, y, e) {
    const flash = e.hitFlash > 0;
    const pose = enemyAtkPose(e);
    const bob = pose.phase >= 0 ? 0 : Math.sin(elapsed * 2.2) * 2;
    const lean = pose.phase === 0 ? -4 : pose.phase === 1 ? 8 : 0;
    const by = y + bob;
    const facing = player.x >= e.x ? 1 : -1;
    const lx = x + lean * facing * 0.25;

    const bossCol = e.color || "#8b2040";
    ctx.globalAlpha = 0.3 + Math.sin(elapsed * 3) * 0.1;
    const grd = ctx.createRadialGradient(lx, by, 10, lx, by, e.r + 28);
    grd.addColorStop(0, bossCol);
    grd.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = grd;
    ctx.beginPath();
    ctx.arc(lx, by, e.r + 28, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;

    drawShadow(x, y + 28, 30, 9);

    // wings
    const wingFlap = pose.phase === 1 ? 14 : Math.sin(elapsed * 3) * 8;
    ctx.fillStyle = flash ? "#fff" : shadeColor(bossCol, -0.45);
    ctx.beginPath();
    ctx.moveTo(lx - 10, by - 8);
    ctx.quadraticCurveTo(lx - 50, by - 40 - wingFlap, lx - 55, by + 10);
    ctx.quadraticCurveTo(lx - 30, by + 4, lx - 8, by + 10);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx + 10, by - 8);
    ctx.quadraticCurveTo(lx + 50, by - 40 - wingFlap, lx + 55, by + 10);
    ctx.quadraticCurveTo(lx + 30, by + 4, lx + 8, by + 10);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "rgba(160,30,50,0.5)";
    ctx.beginPath();
    ctx.moveTo(lx - 12, by - 4);
    ctx.quadraticCurveTo(lx - 40, by - 28 - wingFlap, lx - 48, by + 4);
    ctx.lineTo(lx - 12, by + 6);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx + 12, by - 4);
    ctx.quadraticCurveTo(lx + 40, by - 28 - wingFlap, lx + 48, by + 4);
    ctx.lineTo(lx + 12, by + 6);
    ctx.fill();

    // Claw arm (attacking side)
    let clawRot;
    if (pose.phase === 0) clawRot = (-1.4 - pose.p * 0.5) * facing;
    else if (pose.phase === 1) clawRot = (-1.9 + pose.p * 3.2) * facing;
    else if (pose.phase === 2) clawRot = (1.3 - pose.p * 0.9) * facing;
    else clawRot = 0.2 * facing;

    ctx.save();
    ctx.translate(lx + 22 * facing, by);
    ctx.rotate(clawRot);
    ctx.fillStyle = flash ? "#fff" : "#6a1830";
    ctx.fillRect(-4, -6, 8, 22);
    ctx.fillStyle = flash ? "#fff" : "#c03040";
    ctx.beginPath();
    ctx.moveTo(-6, 14);
    ctx.lineTo(-10, 28);
    ctx.lineTo(-2, 16);
    ctx.moveTo(0, 16);
    ctx.lineTo(2, 30);
    ctx.lineTo(4, 16);
    ctx.moveTo(6, 14);
    ctx.lineTo(12, 28);
    ctx.lineTo(4, 16);
    ctx.fill();
    if (pose.phase === 1) {
      ctx.globalAlpha = 0.45 * (1 - pose.p);
      ctx.strokeStyle = "#ff6080";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(0, 8, 28, -1.2, 1.0);
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.restore();

    // body
    ctx.fillStyle = flash ? "#fff" : "#8b2040";
    roundRect(lx - 18, by - 12, 36, 32, 6);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#c04050";
    roundRect(lx - 12, by - 6, 24, 12, 3);
    ctx.fill();
    ctx.strokeStyle = "#d4a84b";
    ctx.lineWidth = 1.5;
    ctx.strokeRect(lx - 16, by - 8, 32, 8);

    ctx.fillStyle = flash ? "#fff" : "#a02840";
    ctx.beginPath();
    ctx.arc(lx, by - 22, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#3a0810";
    ctx.beginPath();
    ctx.moveTo(lx - 10, by - 30);
    ctx.lineTo(lx - 22, by - 52);
    ctx.lineTo(lx - 4, by - 32);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(lx + 10, by - 30);
    ctx.lineTo(lx + 22, by - 52);
    ctx.lineTo(lx + 4, by - 32);
    ctx.fill();
    ctx.fillStyle = flash ? "#fff" : "#d4a84b";
    ctx.beginPath();
    ctx.moveTo(lx - 10, by - 32);
    ctx.lineTo(lx - 6, by - 42);
    ctx.lineTo(lx - 2, by - 34);
    ctx.lineTo(lx, by - 44);
    ctx.lineTo(lx + 2, by - 34);
    ctx.lineTo(lx + 6, by - 42);
    ctx.lineTo(lx + 10, by - 32);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = flash ? "#fff" : "#ffd040";
    ctx.shadowColor = "#ff8040";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(lx - 5, by - 24, 4, 0, Math.PI * 2);
    ctx.arc(lx + 5, by - 24, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.arc(lx - 5 + facing, by - 24, 1.8, 0, Math.PI * 2);
    ctx.arc(lx + 5 + facing, by - 24, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // mouth
    ctx.fillStyle = "#200";
    ctx.beginPath();
    ctx.ellipse(lx, by - 16, 6, 3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ff6060";
    ctx.fillRect(lx - 3, by - 16, 2, 3);
    ctx.fillRect(lx + 1, by - 16, 2, 3);

    // legs
    ctx.fillStyle = flash ? "#fff" : "#5a1020";
    ctx.fillRect(lx - 12, by + 18, 9, 12);
    ctx.fillRect(lx + 3, by + 18, 9, 12);
  }

  function drawEliteAura(x, y, r) {
    ctx.globalAlpha = 0.4 + Math.sin(elapsed * 6) * 0.15;
    ctx.strokeStyle = "#ffd070";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(x, y, r + 6, 0, Math.PI * 2);
    ctx.stroke();
    // sparkles
    for (let i = 0; i < 4; i++) {
      const a = elapsed * 3 + (i * Math.PI) / 2;
      const sx = x + Math.cos(a) * (r + 8);
      const sy = y + Math.sin(a) * (r + 8);
      ctx.fillStyle = "#ffe8a0";
      ctx.beginPath();
      ctx.arc(sx, sy, 2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  function drawEnemyEntity(e) {
    const x = e.x - camera.x;
    const y = e.y - camera.y;
    if (x < -70 || y < -70 || x > W + 70 || y > H + 70) return;

    const facing = player.x >= e.x ? 1 : -1;

    if (e.isBoss) {
      drawBossSprite(x, y, e);
      return;
    }

    if (e.isChampion) {
      ctx.globalAlpha = 0.45 + Math.sin(elapsed * 7) * 0.15;
      ctx.strokeStyle = "#ffe060";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, e.r + 8, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
    } else if (e.isElite) drawEliteAura(x, y, e.r);

    const spr = e.sprite || (ENEMY_BASE[e.type] && ENEMY_BASE[e.type].sprite) || "imp";
    drawTypedEnemy(x, y, e, facing, spr);

    if (e.isChampion) {
      ctx.font = "bold 9px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText("CHAMPION", x + 1, y - e.r - 14);
      ctx.fillStyle = "#ffe060";
      ctx.fillText("CHAMPION", x, y - e.r - 15);
      drawHpBar(x, y - e.r - 8, e.r * 2.4, 4, e.hp / e.maxHp, "#e0c040");
    } else if (e.isMiniboss) {
      ctx.font = "bold 9px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillText("MINIBOSS", x + 1, y - e.r - 16);
      ctx.fillStyle = "#e0b0ff";
      ctx.fillText("MINIBOSS", x, y - e.r - 17);
      drawHpBar(x, y - e.r - 10, e.r * 2.4, 4, e.hp / e.maxHp, "#a050d0");
    } else if (e.isElite) {
      ctx.font = "bold 9px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(0,0,0,0.5)";
      ctx.fillText("ELITE", x + 1, y - e.r - 12);
      ctx.fillStyle = "#ffd070";
      ctx.fillText("ELITE", x, y - e.r - 13);
      drawHpBar(x, y - e.r - 8, e.r * 2.2, 3, e.hp / e.maxHp, "#e0a020");
    } else if (e.hp < e.maxHp) {
      drawHpBar(x, y - e.r - 8, e.r * 2.2, 3, e.hp / e.maxHp, "#c23b3b");
    }
  }

  /** Type-specific enemy art from wiki names */
  function drawTypedEnemy(x, y, e, facing, spr) {
    const flash = e.hitFlash > 0;
    const col = flash ? "#fff" : e.color;
    const dark = flash ? "#eee" : shadeColor(e.color, -0.35);
    const lite = flash ? "#fff" : shadeColor(e.color, 0.25);
    const pose = enemyAtkPose(e);
    const bob = pose.phase >= 0 ? 0 : Math.sin(elapsed * 7 + e.x * 0.05) * 1.2;
    const lean = pose.phase === 0 ? -3 * facing : pose.phase === 1 ? 5 * facing : 0;
    const by = y + bob;
    const s = Math.max(0.7, e.r / 14);

    drawShadow(x, y + 10 * s, 9 * s, 3.5 * s);

    if (spr === "slime") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by + 2, 11 * s, 8 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = lite;
      ctx.beginPath();
      ctx.ellipse(x - 3 * s, by - 1, 4 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a1018";
      ctx.beginPath();
      ctx.arc(x - 3 * s, by + 1, 1.6 * s, 0, Math.PI * 2);
      ctx.arc(x + 4 * s, by + 1, 1.6 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "hound" || spr === "runner") {
      drawRunnerSprite(x, y, e, facing);
      // snout tint
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x + 8 * facing, by - 2, 5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "imp" || spr === "grunt") {
      // horns + body
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(x - 6 * s, by - 14 * s);
      ctx.lineTo(x - 10 * s, by - 22 * s);
      ctx.lineTo(x - 2 * s, by - 16 * s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 6 * s, by - 14 * s);
      ctx.lineTo(x + 10 * s, by - 22 * s);
      ctx.lineTo(x + 2 * s, by - 16 * s);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x + lean * 0.3, by + 2, 8 * s, 9 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + lean * 0.4, by - 8 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff4060";
      ctx.beginPath();
      ctx.arc(x + 3 * facing * s, by - 8 * s, 1.8 * s, 0, Math.PI * 2);
      ctx.fill();
      // claw arm
      const armA = pose.phase === 1 ? 1.2 * facing : 0.3 * facing;
      ctx.strokeStyle = col;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x + 4 * facing, by);
      ctx.lineTo(x + Math.cos(armA) * 12 * s * facing + 6 * facing, by + Math.sin(armA) * 8 * s);
      ctx.stroke();
      return;
    }

    if (spr === "skeleton" || spr === "brute") {
      ctx.fillStyle = col;
      ctx.fillRect(x - 6 * s + lean * 0.2, by - 4 * s, 12 * s, 14 * s);
      ctx.beginPath();
      ctx.arc(x + lean * 0.3, by - 12 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.fillRect(x - 3 * s, by - 10 * s, 2.5 * s, 3 * s);
      ctx.fillRect(x + 1 * s, by - 10 * s, 2.5 * s, 3 * s);
      ctx.strokeStyle = lite;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(x - 4 * s, by + 2 * s);
      ctx.lineTo(x + 4 * s, by + 2 * s);
      ctx.stroke();
      // ribs
      ctx.beginPath();
      ctx.moveTo(x - 5 * s, by - 1 * s);
      ctx.lineTo(x + 5 * s, by - 1 * s);
      ctx.moveTo(x - 5 * s, by + 3 * s);
      ctx.lineTo(x + 5 * s, by + 3 * s);
      ctx.stroke();
      return;
    }

    if (spr === "mage" || spr === "lich") {
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(x - 8 * s, by + 10 * s);
      ctx.lineTo(x + 8 * s, by + 10 * s);
      ctx.lineTo(x + 6 * s, by - 4 * s);
      ctx.lineTo(x - 6 * s, by - 4 * s);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, by - 10 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      // hood
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x, by - 12 * s, 8 * s, Math.PI, 0);
      ctx.fill();
      // staff orb
      const ox = x + 12 * facing * s;
      const oy = by - 6 * s;
      ctx.strokeStyle = lite;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x + 4 * facing * s, by);
      ctx.lineTo(ox, oy);
      ctx.stroke();
      ctx.fillStyle = spr === "lich" ? "#60e0a0" : "#a080ff";
      ctx.beginPath();
      ctx.arc(ox, oy, 3.5 * s, 0, Math.PI * 2);
      ctx.fill();
      if (spr === "lich") {
        ctx.strokeStyle = "rgba(100,255,180,0.4)";
        ctx.beginPath();
        ctx.arc(x, by, 14 * s + Math.sin(elapsed * 4) * 2, 0, Math.PI * 2);
        ctx.stroke();
      }
      return;
    }

    if (spr === "shield" || spr === "knight") {
      ctx.fillStyle = col;
      ctx.fillRect(x - 7 * s, by - 6 * s, 14 * s, 16 * s);
      ctx.beginPath();
      ctx.arc(x, by - 12 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      // shield
      ctx.fillStyle = lite;
      ctx.beginPath();
      ctx.moveTo(x + 6 * facing * s, by - 8 * s);
      ctx.lineTo(x + 14 * facing * s, by - 2 * s);
      ctx.lineTo(x + 6 * facing * s, by + 8 * s);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = dark;
      ctx.stroke();
      return;
    }

    if (spr === "wraith" || spr === "ghost") {
      ctx.globalAlpha = spr === "ghost" ? 0.55 : 0.75;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by - 2, 8 * s, 12 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x - 8 * s, by + 6 * s);
      ctx.quadraticCurveTo(x - 4 * s, by + 14 * s, x, by + 8 * s);
      ctx.quadraticCurveTo(x + 4 * s, by + 14 * s, x + 8 * s, by + 6 * s);
      ctx.fill();
      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.ellipse(x - 2 * s + facing, by - 4 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.ellipse(x + 3 * s + facing, by - 4 * s, 2 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }

    if (spr === "gargoyle") {
      // wings
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(x, by - 4 * s);
      ctx.quadraticCurveTo(x - 18 * s, by - 16 * s, x - 16 * s, by + 4 * s);
      ctx.lineTo(x - 4 * s, by + 2 * s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x, by - 4 * s);
      ctx.quadraticCurveTo(x + 18 * s, by - 16 * s, x + 16 * s, by + 4 * s);
      ctx.lineTo(x + 4 * s, by + 2 * s);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by, 9 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, by - 10 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff8060";
      ctx.fillRect(x - 2 * s, by - 10 * s, 1.5 * s, 2 * s);
      ctx.fillRect(x + 1 * s, by - 10 * s, 1.5 * s, 2 * s);
      return;
    }

    if (spr === "scorched") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by + 1, 8 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff8040";
      ctx.beginPath();
      ctx.arc(x - 3 * s, by - 6 * s, 3 * s, 0, Math.PI * 2);
      ctx.arc(x + 4 * s, by - 4 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x, by - 10 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "crawler") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by + 4, 12 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      // legs
      ctx.strokeStyle = dark;
      ctx.lineWidth = 2;
      for (let i = -2; i <= 2; i++) {
        const lx = x + i * 4 * s;
        const flip = Math.sin(elapsed * 12 + i) * 3;
        ctx.beginPath();
        ctx.moveTo(lx, by + 4 * s);
        ctx.lineTo(lx + flip, by + 10 * s);
        ctx.stroke();
      }
      ctx.fillStyle = lite;
      ctx.beginPath();
      ctx.arc(x + 8 * facing * s, by + 2 * s, 4 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "bear") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by + 2, 12 * s, 10 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x + 6 * facing * s, by - 6 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      // ears
      ctx.beginPath();
      ctx.arc(x + 2 * facing * s, by - 12 * s, 3 * s, 0, Math.PI * 2);
      ctx.arc(x + 10 * facing * s, by - 11 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#1a2030";
      ctx.beginPath();
      ctx.arc(x + 5 * facing * s, by - 6 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "skull") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, by - 2, 9 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.arc(x - 3 * s, by - 3 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.arc(x + 3 * s, by - 3 * s, 2.5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 3 * s, by + 2 * s, 6 * s, 2 * s);
      // float trail
      ctx.globalAlpha = 0.3;
      ctx.fillStyle = lite;
      ctx.beginPath();
      ctx.ellipse(x, by + 10 * s, 5 * s, 3 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      return;
    }

    if (spr === "effigy") {
      ctx.fillStyle = col;
      ctx.fillRect(x - 5 * s, by - 8 * s, 10 * s, 18 * s);
      ctx.beginPath();
      ctx.arc(x, by - 14 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lite;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - 8 * s, by - 2 * s);
      ctx.lineTo(x + 8 * s, by - 2 * s);
      ctx.stroke();
      ctx.fillStyle = "#ff4060";
      ctx.beginPath();
      ctx.arc(x - 2 * s, by - 14 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.arc(x + 2 * s, by - 14 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "wyrm" || spr === "hydra") {
      // serpentine body
      ctx.strokeStyle = col;
      ctx.lineWidth = 7 * s;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(x - 10 * s, by + 8 * s);
      ctx.quadraticCurveTo(x - 4 * s, by - 4 * s, x + 2 * s, by + 2 * s);
      ctx.quadraticCurveTo(x + 8 * s, by + 8 * s, x + 12 * s, by - 2 * s);
      ctx.stroke();
      ctx.fillStyle = lite;
      ctx.beginPath();
      ctx.arc(x + 12 * s * facing, by - 4 * s, 6 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff4060";
      ctx.beginPath();
      ctx.arc(x + 14 * s * facing, by - 5 * s, 1.5 * s, 0, Math.PI * 2);
      ctx.fill();
      if (spr === "hydra") {
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.arc(x + 4 * s, by - 10 * s, 5 * s, 0, Math.PI * 2);
        ctx.arc(x - 2 * s, by - 8 * s, 4.5 * s, 0, Math.PI * 2);
        ctx.fill();
      }
      return;
    }

    if (spr === "ghoul") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by + 1, 8 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, by - 10 * s, 7 * s, 0, Math.PI * 2);
      ctx.fill();
      // long arms
      ctx.strokeStyle = dark;
      ctx.lineWidth = 3 * s;
      ctx.beginPath();
      ctx.moveTo(x - 6 * s, by);
      ctx.lineTo(x - 14 * s, by + 8 * s);
      ctx.moveTo(x + 6 * s, by);
      ctx.lineTo(x + 14 * s, by + 6 * s);
      ctx.stroke();
      ctx.fillStyle = "#1a1018";
      ctx.fillRect(x - 3 * s, by - 10 * s, 2 * s, 3 * s);
      ctx.fillRect(x + 1 * s, by - 10 * s, 2 * s, 3 * s);
      return;
    }

    if (spr === "fiend") {
      // goat-like horns
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.moveTo(x - 4 * s, by - 12 * s);
      ctx.quadraticCurveTo(x - 14 * s, by - 24 * s, x - 8 * s, by - 8 * s);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(x + 4 * s, by - 12 * s);
      ctx.quadraticCurveTo(x + 14 * s, by - 24 * s, x + 8 * s, by - 8 * s);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x, by + 2, 9 * s, 11 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(x, by - 10 * s, 8 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff6040";
      ctx.beginPath();
      ctx.arc(x + 3 * facing * s, by - 10 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "construct" || spr === "giant") {
      const big = spr === "giant" ? 1.25 : 1;
      ctx.fillStyle = col;
      ctx.fillRect(x - 10 * s * big, by - 8 * s * big, 20 * s * big, 18 * s * big);
      ctx.fillRect(x - 7 * s * big, by - 18 * s * big, 14 * s * big, 12 * s * big);
      ctx.fillStyle = lite;
      ctx.fillRect(x - 4 * s, by - 14 * s * big, 3 * s, 3 * s);
      ctx.fillRect(x + 2 * s, by - 14 * s * big, 3 * s, 3 * s);
      ctx.strokeStyle = dark;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - 10 * s * big, by - 8 * s * big, 20 * s * big, 18 * s * big);
      return;
    }

    if (spr === "void") {
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, by, 10 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#100818";
      ctx.beginPath();
      ctx.arc(x, by, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = lite;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      ctx.beginPath();
      ctx.arc(x, by, 14 * s + Math.sin(elapsed * 5) * 3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 1;
      return;
    }

    if (spr === "horseman") {
      // horse body + rider silhouette
      ctx.fillStyle = dark;
      ctx.beginPath();
      ctx.ellipse(x, by + 4, 14 * s, 7 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.ellipse(x + 8 * facing * s, by, 6 * s, 5 * s, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(x - 4 * s, by - 12 * s, 8 * s, 12 * s);
      ctx.beginPath();
      ctx.arc(x, by - 14 * s, 5 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "mimic") {
      // treasure chest with teeth
      ctx.fillStyle = col;
      ctx.fillRect(x - 12 * s, by - 2 * s, 24 * s, 14 * s);
      ctx.fillStyle = lite;
      ctx.fillRect(x - 12 * s, by - 10 * s, 24 * s, 10 * s);
      ctx.fillStyle = "#1a1010";
      for (let i = -3; i <= 3; i++) {
        ctx.fillRect(x + i * 3 * s, by - 2 * s, 2 * s, 4 * s);
      }
      ctx.fillStyle = "#ffd070";
      ctx.beginPath();
      ctx.arc(x, by + 2 * s, 3 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    if (spr === "tree") {
      ctx.fillStyle = dark;
      ctx.fillRect(x - 4 * s, by - 4 * s, 8 * s, 16 * s);
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.arc(x, by - 12 * s, 14 * s, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#ff4060";
      ctx.beginPath();
      ctx.arc(x - 4 * s, by - 12 * s, 2 * s, 0, Math.PI * 2);
      ctx.arc(x + 4 * s, by - 12 * s, 2 * s, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    // fallback
    drawGruntSprite(x, y, e, facing);
  }

  function shadeColor(hex, amt) {
    if (!hex || hex[0] !== "#" || hex.length < 7) return hex || "#888";
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    r = clamp(Math.round(r + (amt > 0 ? (255 - r) * amt : r * amt)), 0, 255);
    g = clamp(Math.round(g + (amt > 0 ? (255 - g) * amt : g * amt)), 0, 255);
    b = clamp(Math.round(b + (amt > 0 ? (255 - b) * amt : b * amt)), 0, 255);
    return `rgb(${r},${g},${b})`;
  }

  function drawGem(g) {
    const x = g.x - camera.x;
    const y = g.y - camera.y;
    const bob = Math.sin(elapsed * 5 + g.x) * 2;
    const gy = y + bob;
    // diamond shape
    ctx.save();
    ctx.translate(x, gy);
    ctx.rotate(elapsed * 1.5 + g.x * 0.1);
    ctx.fillStyle = g.premium ? "#e8c040" : "#7ec850";
    ctx.beginPath();
    ctx.moveTo(0, -g.r - 1);
    ctx.lineTo(g.r, 0);
    ctx.lineTo(0, g.r + 1);
    ctx.lineTo(-g.r, 0);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = g.premium ? "rgba(255,255,200,0.7)" : "rgba(220,255,180,0.6)";
    ctx.beginPath();
    ctx.moveTo(0, -g.r * 0.5);
    ctx.lineTo(g.r * 0.4, 0);
    ctx.lineTo(0, g.r * 0.2);
    ctx.lineTo(-g.r * 0.25, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
    // glow
    ctx.globalAlpha = 0.25;
    ctx.fillStyle = g.premium ? "#ffd070" : "#7ec850";
    ctx.beginPath();
    ctx.arc(x, gy, g.r + 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }

  function drawAbilityFxLayer() {
    for (const fx of abilityFx) {
      const t = 1 - fx.life / fx.maxLife;
      const alpha = fx.life / fx.maxLife;
      const x = (fx.x != null ? fx.x : 0) - camera.x;
      const y = (fx.y != null ? fx.y : 0) - camera.y;
      ctx.globalAlpha = Math.max(0, alpha);

      if (fx.kind === "lightning_bolt") {
        const x0 = fx.x0 - camera.x;
        const y0 = fx.y0 - camera.y;
        const x1 = fx.x1 - camera.x;
        const y1 = fx.y1 - camera.y;
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 3;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        const segs = 6;
        for (let i = 1; i <= segs; i++) {
          const u = i / segs;
          const jx = (Math.random() - 0.5) * 18 * (i < segs ? 1 : 0);
          ctx.lineTo(x0 + (x1 - x0) * u + jx, y0 + (y1 - y0) * u);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(x1, y1, 8 * alpha, 0, Math.PI * 2);
        ctx.fill();
      } else if (fx.kind === "meteor_fall") {
        const fall = 1 - alpha;
        const my = y - 120 + fall * 120;
        ctx.fillStyle = fx.color;
        ctx.beginPath();
        ctx.arc(x, my, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffd080";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, my - 20);
        ctx.lineTo(x - 6, my - 40);
        ctx.lineTo(x + 6, my - 40);
        ctx.stroke();
        if (fall > 0.7) {
          ctx.globalAlpha = (fall - 0.7) / 0.3 * alpha;
          ctx.fillStyle = fx.color;
          ctx.beginPath();
          ctx.arc(x, y, 20 + fall * 30, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (fx.kind === "flame_cone") {
        const aim = fx.aim || 0;
        const wide = fx.wide ? 0.7 : 0.45;
        ctx.fillStyle = fx.color;
        for (let i = 0; i < 8; i++) {
          const a = aim + (i / 7 - 0.5) * wide * 2;
          const len = 40 + t * 90 + i * 4;
          ctx.globalAlpha = alpha * (0.5 - i * 0.04);
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a - 0.08) * len, y + Math.sin(a - 0.08) * len);
          ctx.lineTo(x + Math.cos(a + 0.08) * len * 0.9, y + Math.sin(a + 0.08) * len * 0.9);
          ctx.fill();
        }
      } else if (fx.kind === "frost_ring" || fx.kind === "holy_pulse" || fx.kind === "splinter_ring") {
        const r = (fx.r || 100) * (0.3 + t * 0.9);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = fx.kind === "holy_pulse" ? 3 : 2.5;
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.stroke();
        if (fx.kind === "frost_ring") {
          for (let i = 0; i < 8; i++) {
            const a = (i / 8) * Math.PI * 2 + t;
            ctx.fillStyle = "#e0f8ff";
            ctx.globalAlpha = alpha * 0.7;
            ctx.beginPath();
            ctx.arc(x + Math.cos(a) * r, y + Math.sin(a) * r, 3, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        if (fx.kind === "holy_pulse") {
          ctx.globalAlpha = alpha * 0.2;
          ctx.fillStyle = fx.color;
          ctx.beginPath();
          ctx.arc(x, y, r, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (fx.kind === "hail_cloud") {
        ctx.fillStyle = "rgba(180,210,240,0.35)";
        ctx.beginPath();
        ctx.ellipse(x, y, 50, 18, 0, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 10; i++) {
          ctx.fillStyle = fx.color;
          ctx.globalAlpha = alpha * 0.8;
          ctx.fillRect(x - 40 + i * 9, y + 10 + (t * 40 + i * 7) % 50, 2, 8);
        }
      } else if (fx.kind === "holy_beam") {
        const x0 = fx.x0 - camera.x;
        const y0 = fx.y0 - camera.y;
        const x1 = fx.x1 - camera.x;
        const y1 = fx.y1 - camera.y;
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 4;
        ctx.shadowColor = fx.color;
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.strokeStyle = "#fffef0";
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      } else if (fx.kind === "rift") {
        const r = 20 + t * 40;
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.35, t * 2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = fx.color;
        ctx.beginPath();
        ctx.ellipse(x, y, r * 0.6, r * 0.2, t * 2, 0, Math.PI * 2);
        ctx.fill();
      } else if (fx.kind === "vines") {
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 2;
        for (let i = 0; i < 5; i++) {
          const a = (i / 5) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.quadraticCurveTo(
            x + Math.cos(a + 0.5) * 20 * t,
            y + Math.sin(a + 0.5) * 20 * t,
            x + Math.cos(a) * (25 + t * 20),
            y + Math.sin(a) * (25 + t * 20)
          );
          ctx.stroke();
        }
      } else if (fx.kind === "fists") {
        const f = fx.facing || 1;
        ctx.fillStyle = fx.color;
        ctx.globalAlpha = alpha * 0.8;
        ctx.beginPath();
        ctx.arc(x + 18 * f * t, y - 4, 10, 0, Math.PI * 2);
        ctx.arc(x - 14 * f * t, y + 6, 9, 0, Math.PI * 2);
        ctx.fill();
      } else if (fx.kind === "confetti") {
        const cols = ["#ff80c0", "#80ffc0", "#80c0ff", "#ffe080", "#ff8080"];
        for (let i = 0; i < 16; i++) {
          const a = (i / 16) * Math.PI * 2;
          const d = t * 50 + (i % 4) * 6;
          ctx.fillStyle = cols[i % cols.length];
          ctx.globalAlpha = alpha;
          ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, 3, 5);
        }
      } else if (fx.kind === "sound_wave" || fx.kind === "arrow_volley" || fx.kind === "needles_burst") {
        const aim = fx.aim != null ? fx.aim : (fx.facing > 0 ? 0 : Math.PI);
        ctx.strokeStyle = fx.color;
        ctx.lineWidth = 2;
        for (let i = 1; i <= 3; i++) {
          ctx.globalAlpha = alpha * (1 - i * 0.2);
          ctx.beginPath();
          ctx.arc(x, y, 15 * i * t + 10, aim - 0.5, aim + 0.5);
          ctx.stroke();
        }
      } else if (fx.kind === "death_wall") {
        const f = fx.facing || 1;
        ctx.fillStyle = fx.color;
        ctx.globalAlpha = alpha * 0.45;
        ctx.fillRect(x + 20 * f, y - 50, 14, 100);
        ctx.strokeStyle = "#fff";
        ctx.globalAlpha = alpha * 0.7;
        ctx.strokeRect(x + 20 * f, y - 50, 14, 100);
      } else if (fx.kind === "prism_burst") {
        const cols = ["#ff6040", "#40a0ff", "#80e0ff", "#80c040", "#e080ff"];
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          ctx.strokeStyle = cols[i % cols.length];
          ctx.globalAlpha = alpha * 0.8;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a) * (30 + t * 50), y + Math.sin(a) * (30 + t * 50));
          ctx.stroke();
        }
      } else if (fx.kind === "electric_spark" || fx.kind === "summon_burst" || fx.kind === "cast_flash") {
        ctx.fillStyle = fx.color;
        ctx.globalAlpha = alpha * 0.5;
        ctx.beginPath();
        ctx.arc(x, y, 12 + t * 28, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 6; i++) {
          const a = (i / 6) * Math.PI * 2 + t * 3;
          ctx.strokeStyle = fx.color;
          ctx.globalAlpha = alpha;
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x + Math.cos(a) * (20 + t * 30), y + Math.sin(a) * (20 + t * 30));
          ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }
  }

  function draw() {
    ctx.save();
    if (screenShake > 0.3) {
      const mag = Math.min(14, screenShake);
      ctx.translate((Math.random() - 0.5) * mag * 2, (Math.random() - 0.5) * mag * 2);
    }
    ctx.clearRect(-20, -20, W + 40, H + 40);
    drawFloor();

    // aoe telegraph / effects (under entities)
    for (const a of aoeFx) {
      const alpha = a.life / a.maxLife;
      const x = a.x - camera.x;
      const y = a.y - camera.y;
      if (a.style === "burst") {
        ctx.globalAlpha = alpha * 0.35;
        ctx.fillStyle = a.color;
        ctx.beginPath();
        ctx.arc(x, y, a.r * (1.15 - alpha * 0.3), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = alpha * 0.8;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, a.r * (1.05 - alpha * 0.2), 0, Math.PI * 2);
        ctx.stroke();
      } else {
        ctx.globalAlpha = alpha * 0.25;
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(x, y, a.r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    }

    drawAbilityFxLayer();

    // slam telegraphs
    for (const e of enemies) {
      if ((e.isBoss || e.isMiniboss) && e.ai === "slam") {
        const range = e.isBoss ? 130 : 95;
        const t = e.slamTelegraph || 0;
        const x = e.x - camera.x;
        const y = e.y - camera.y;
        ctx.globalAlpha = 0.25 + (1 - Math.min(1, t)) * 0.35;
        ctx.strokeStyle = e.isBoss ? "#ff6060" : "#c080e0";
        ctx.lineWidth = 3;
        ctx.setLineDash([8, 6]);
        ctx.beginPath();
        ctx.arc(x, y, range, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.globalAlpha = 0.12;
        ctx.fillStyle = e.isBoss ? "#ff4040" : "#a060d0";
        ctx.beginPath();
        ctx.arc(x, y, range, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // xp gems
    for (const g of xpGems) drawGem(g);

    // Gold coins
    for (const g of goldCoins) {
      const x = g.x - camera.x;
      const y = g.y - camera.y;
      ctx.fillStyle = "#d4a84b";
      ctx.beginPath();
      ctx.arc(x, y, g.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff0a0";
      ctx.beginPath();
      ctx.arc(x - 1, y - 1, g.r * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Chests
    for (const c of chests) {
      const x = c.x - camera.x;
      const y = c.y - camera.y + Math.sin(c.bob) * 2;
      ctx.fillStyle = c.rarity >= 3 ? "#d4a84b" : c.rarity >= 2 ? "#a070d0" : "#8a6030";
      ctx.fillRect(x - 12, y - 6, 24, 16);
      ctx.fillStyle = c.rarity >= 3 ? "#f0d060" : "#c09050";
      ctx.fillRect(x - 12, y - 12, 24, 8);
      ctx.fillStyle = "#1a1010";
      ctx.fillRect(x - 2, y - 4, 4, 6);
    }

    // Well of Life
    drawWells();

    // Item ground patches
    for (const p of itemPatches) {
      const x = p.x - camera.x;
      const y = p.y - camera.y;
      const a = Math.max(0.15, Math.min(0.55, p.life / 3));
      ctx.globalAlpha = a;
      ctx.fillStyle = p.color || "#e05020";
      ctx.beginPath();
      ctx.arc(x, y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // Barrels
    for (const b of barrels) {
      const x = b.x - camera.x;
      const y = b.y - camera.y + Math.sin(b.bob) * 1.5;
      ctx.fillStyle = "#6a4020";
      ctx.fillRect(x - 11, y - 12, 22, 24);
      ctx.fillStyle = "#8a6030";
      ctx.fillRect(x - 11, y - 12, 22, 6);
      ctx.strokeStyle = "#3a2010";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 11, y - 12, 22, 24);
      ctx.fillStyle = "#c09050";
      ctx.fillRect(x - 2, y - 4, 4, 10);
    }

    // Potion drops
    for (const p of potionDrops) {
      const x = p.x - camera.x;
      const y = p.y - camera.y + Math.sin(p.bob) * 3;
      ctx.fillStyle = p.color || "#e04040";
      ctx.beginPath();
      ctx.arc(x, y, p.r - 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.45)";
      ctx.beginPath();
      ctx.arc(x - 2, y - 3, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff8";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Tome of Mastery
    for (const t of tomes) {
      const x = t.x - camera.x;
      const y = t.y - camera.y + Math.sin(t.bob) * 3;
      ctx.fillStyle = t.upgradeMode ? "rgba(200,140,80,0.3)" : "rgba(100,160,255,0.25)";
      ctx.beginPath();
      ctx.arc(x, y, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = t.upgradeMode ? "#3a2810" : "#1a2848";
      ctx.fillRect(x - 8, y - 10, 16, 20);
      ctx.strokeStyle = t.upgradeMode ? "#d4a84b" : "#8ab4ff";
      ctx.lineWidth = 1.5;
      ctx.strokeRect(x - 8, y - 10, 16, 20);
      ctx.fillStyle = "#d4a84b";
      ctx.font = "bold 10px Segoe UI";
      ctx.textAlign = "center";
      ctx.fillText(t.upgradeMode ? "U" : "T", x, y + 4);
    }

    // Ability orbits (distinct shapes)
    if (player && player.abilities) {
      for (const inst of player.abilities) {
        if (!inst.orbs) continue;
        for (const o of inst.orbs) {
          if (!o) continue;
          const x = o.x - camera.x;
          const y = o.y - camera.y;
          const r = o.r || 7;
          // Morning Star chain to player
          if (o.chain && player) {
            ctx.strokeStyle = "rgba(180,140,60,0.55)";
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(player.x - camera.x, player.y - camera.y);
            ctx.lineTo(x, y);
            ctx.stroke();
          }
          ctx.globalAlpha = 0.3;
          ctx.fillStyle = o.color;
          ctx.beginPath();
          ctx.arc(x, y, r * 1.7, 0, Math.PI * 2);
          ctx.fill();
          ctx.globalAlpha = 1;
          if (o.shape === "blade") {
            ctx.save();
            ctx.translate(x, y);
            ctx.rotate(o.angle || 0);
            ctx.fillStyle = o.color;
            ctx.fillRect(-2, -r - 2, 4, r * 2 + 4);
            ctx.fillStyle = "#eee";
            ctx.fillRect(-1, -r - 4, 2, 6);
            ctx.restore();
          } else if (o.shape === "star") {
            ctx.fillStyle = o.color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#ffd080";
            ctx.lineWidth = 2;
            for (let k = 0; k < 6; k++) {
              const a = (k / 6) * Math.PI * 2 + elapsed * 3;
              ctx.beginPath();
              ctx.moveTo(x, y);
              ctx.lineTo(x + Math.cos(a) * (r + 5), y + Math.sin(a) * (r + 5));
              ctx.stroke();
            }
          } else if (o.shape === "spirit") {
            ctx.fillStyle = o.color;
            ctx.globalAlpha = 0.75;
            ctx.beginPath();
            ctx.ellipse(x, y, r * 0.7, r, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(x - 2, y - 3, 2, 0, Math.PI * 2);
            ctx.arc(x + 3, y - 3, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
          } else if (o.shape === "planet") {
            ctx.fillStyle = o.color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "rgba(255,220,120,0.6)";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            ctx.ellipse(x, y, r + 5, r * 0.4, elapsed, 0, Math.PI * 2);
            ctx.stroke();
            ctx.fillStyle = "#fff8d0";
            ctx.beginPath();
            ctx.arc(x - 2, y - 2, 2, 0, Math.PI * 2);
            ctx.fill();
          } else {
            ctx.fillStyle = o.color;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
            ctx.fillStyle = "#fff";
            ctx.beginPath();
            ctx.arc(x - 1, y - 1, r * 0.35, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }

    // Summons (golem)
    for (const s of summons) {
      const x = s.x - camera.x;
      const y = s.y - camera.y;
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.beginPath();
      ctx.ellipse(x, y + 12, 12, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = s.color;
      roundRect(x - 12, y - 10, 24, 22, 4);
      ctx.fill();
      ctx.fillStyle = "#3a2818";
      ctx.fillRect(x - 5, y - 4, 4, 4);
      ctx.fillRect(x + 2, y - 4, 4, 4);
    }

    // enemies (sort by y for depth)
    const sorted = enemies.slice().sort((a, b) => a.y - b.y);
    for (const e of sorted) drawEnemyEntity(e);

    // enemy shots
    for (const s of enemyShots) {
      const x = s.x - camera.x;
      const y = s.y - camera.y;
      ctx.fillStyle = s.color;
      ctx.globalAlpha = 0.4;
      ctx.beginPath();
      ctx.arc(x, y, s.r * 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.fillStyle = "#ffb0c0";
      ctx.beginPath();
      ctx.arc(x, y, s.r, 0, Math.PI * 2);
      ctx.fill();
      // skull-ish core
      ctx.fillStyle = "#400018";
      ctx.beginPath();
      ctx.arc(x - 2, y - 1, 1.5, 0, Math.PI * 2);
      ctx.arc(x + 2, y - 1, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // projectiles
    for (const p of projectiles) {
      const x = p.x - camera.x;
      const y = p.y - camera.y;
      if (p.style === "orb") {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.3;
        ctx.beginPath();
        ctx.arc(x, y, p.r * 2.6, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        const og = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, p.r + 2);
        og.addColorStop(0, "#ffffff");
        og.addColorStop(0.4, "#a0d0ff");
        og.addColorStop(1, p.color);
        ctx.fillStyle = og;
        ctx.beginPath();
        ctx.arc(x, y, p.r + 1, 0, Math.PI * 2);
        ctx.fill();
      } else {
        const ang = Math.atan2(p.vy, p.vx);
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(ang);
        // shaft
        ctx.fillStyle = "#8b5a2b";
        ctx.fillRect(-10, -1.5, 14, 3);
        // fletching
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.moveTo(-10, 0);
        ctx.lineTo(-14, -4);
        ctx.lineTo(-8, 0);
        ctx.lineTo(-14, 4);
        ctx.closePath();
        ctx.fill();
        // tip
        ctx.fillStyle = "#e8e8e8";
        ctx.beginPath();
        ctx.moveTo(4, 0);
        ctx.lineTo(12, -3);
        ctx.lineTo(12, 3);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    if (slashFx) {
      const alpha = slashFx.life / slashFx.maxLife;
      ctx.strokeStyle = slashFx.color;
      ctx.globalAlpha = alpha * 0.7;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(slashFx.x - camera.x, slashFx.y - camera.y, slashFx.r * (1.1 - alpha * 0.2), 0, Math.PI * 2);
      ctx.stroke();
      // slash arcs
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const a0 = elapsed * 10 + i;
        ctx.beginPath();
        ctx.arc(
          slashFx.x - camera.x,
          slashFx.y - camera.y,
          slashFx.r * (0.6 + i * 0.15),
          a0,
          a0 + 1.2
        );
        ctx.stroke();
      }
      ctx.globalAlpha = alpha * 0.12;
      ctx.fillStyle = slashFx.color;
      ctx.beginPath();
      ctx.arc(slashFx.x - camera.x, slashFx.y - camera.y, slashFx.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }

    // player (on top of most enemies if y allows - draw after sorted that are behind)
    drawPlayerSprite();

    for (const p of particles) {
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x - camera.x, p.y - camera.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.font = "bold 13px Segoe UI";
    ctx.textAlign = "center";
    for (const t of floatingTexts) {
      ctx.globalAlpha = t.life / t.maxLife;
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillText(t.text, t.x - camera.x + 1, t.y - camera.y + 1);
      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x - camera.x, t.y - camera.y);
    }
    ctx.globalAlpha = 1;

    if (phase === "running" || phase === "intro") {
      const alive = enemies.filter((e) => !e.isBoss).length;
      const left = Math.max(0, RUN_DURATION_SEC - elapsed);
      const str = hallStrengthAt(runProgress()).toFixed(2);
      ctx.font = "12px Segoe UI";
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.fillRect(8, H - 28, 320, 20);
      ctx.fillStyle = "rgba(232,224,212,0.75)";
      ctx.textAlign = "left";
      ctx.fillText(
        `Còn ${formatTime(left)} · Quái: ${alive} · Strength ×${str}`,
        14,
        H - 14
      );
    }

    // vignette + slight color grade
    const grd = ctx.createRadialGradient(W / 2, H / 2, H * 0.2, W / 2, H / 2, H * 0.78);
    grd.addColorStop(0, "rgba(0,0,0,0)");
    grd.addColorStop(1, "rgba(0,0,0,0.5)");
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(40, 20, 60, 0.06)";
    ctx.fillRect(0, 0, W, H);
    ctx.restore();
  }

  function pollGamepad(dt) {
    if (!settings.gamepad || !navigator.getGamepads || !player) return;
    const pads = navigator.getGamepads();
    const gp = pads && (pads[0] || pads[1]);
    if (!gp) {
      player._gpMx = 0;
      player._gpMy = 0;
      return;
    }
    const dead = 0.28;
    const ax = gp.axes[0] || 0;
    const ay = gp.axes[1] || 0;
    player._gpMx = Math.abs(ax) > dead ? ax : 0;
    player._gpMy = Math.abs(ay) > dead ? ay : 0;
    // D-pad
    if (gp.buttons[12] && gp.buttons[12].pressed) player._gpMy = -1;
    if (gp.buttons[13] && gp.buttons[13].pressed) player._gpMy = 1;
    if (gp.buttons[14] && gp.buttons[14].pressed) player._gpMx = -1;
    if (gp.buttons[15] && gp.buttons[15].pressed) player._gpMx = 1;
    // Start → pause
    const startBtn = gp.buttons[9] || gp.buttons[8];
    if (startBtn && startBtn.pressed && !player._gpStartLatch) {
      player._gpStartLatch = true;
      if (state === "playing") {
        state = "pause";
        fillBuildSummary();
        showScreen("pause");
      } else if (state === "pause") {
        state = "playing";
        showScreen("game");
        lastTs = performance.now();
      }
    } else if (startBtn && !startBtn.pressed) {
      player._gpStartLatch = false;
    }
  }

  function loop(ts) {
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt * 28);
    if (state === "playing") {
      pollGamepad(dt);
      update(dt);
    }
    if (state === "playing" || state === "levelup" || state === "ability" || state === "pause" || state === "well" || state === "win" || state === "lose") {
      draw();
    }
    if (state !== "menu") {
      animId = requestAnimationFrame(loop);
    }
  }

  // ─── Input ───────────────────────────────────────────────
  window.addEventListener("keydown", (e) => {
    const k = e.key.toLowerCase();
    keys[k] = true;
    if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(k)) e.preventDefault();

    if ((k === "escape" || k === "p") && state === "playing") {
      state = "pause";
      fillBuildSummary();
      showScreen("pause");
    } else if ((k === "escape" || k === "p") && state === "pause") {
      state = "playing";
      showScreen("game");
      lastTs = performance.now();
    } else if ((k === "escape" || k === "p") && state === "well") {
      closeWellOverlay();
    }
  });

  window.addEventListener("keyup", (e) => {
    keys[e.key.toLowerCase()] = false;
  });

  let pendingHeroId = null;
  let pendingHallId = null;
  let detailFocus = "hero"; // which selection last clicked — drives detail text

  function paintPortrait(canvas, heroId, size) {
    if (!canvas || typeof window.drawHeroPortrait !== "function") return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const s = size || 72;
    canvas.width = Math.round(s * dpr);
    canvas.height = Math.round(s * dpr);
    canvas.style.width = s + "px";
    canvas.style.height = s + "px";
    const c2d = canvas.getContext("2d");
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    window.drawHeroPortrait(c2d, heroId, s, s);
  }

  function paintHallArt(canvas, hallId, w, h) {
    if (!canvas || typeof window.drawHallArt !== "function") return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const ww = w || 120;
    const hh = h || 75;
    canvas.width = Math.round(ww * dpr);
    canvas.height = Math.round(hh * dpr);
    canvas.style.width = ww + "px";
    canvas.style.height = hh + "px";
    const c2d = canvas.getContext("2d");
    c2d.setTransform(dpr, 0, 0, dpr, 0, 0);
    window.drawHallArt(c2d, hallId, ww, hh);
  }

  function startBlockReason() {
    if (!pendingHeroId) return "Cần chọn Hero (strip hoặc tab Hero)";
    if (pendingMode !== "torment" && !pendingHallId) return "Cần chọn Hall";
    if (pendingMode === "torment" && !isTormentLevelUnlocked(pendingTormentLevel || 1)) {
      return "Torment level đang khóa";
    }
    return "";
  }

  function updateStartButton() {
    const start = document.getElementById("btn-start");
    const reasonEl = document.getElementById("start-reason");
    const reason = startBlockReason();
    const canStart = !reason;
    if (start) {
      start.disabled = !canStart;
      start.classList.toggle("ready", canStart);
      start.textContent = canStart ? "Bắt đầu" : "Bắt đầu";
      start.title = reason || "Bắt đầu run";
    }
    if (reasonEl) {
      reasonEl.textContent = canStart
        ? (pendingMode === "torment"
          ? `Sẵn sàng · Torment Lv ${pendingTormentLevel || 1}`
          : "Sẵn sàng · Hall run")
        : reason;
      reasonEl.classList.toggle("ok", canStart);
    }
    const ph = document.getElementById("pick-hero-label");
    const pl = document.getElementById("pick-hall-label");
    const pm = document.getElementById("pick-mode-label");
    const pmark = document.getElementById("pick-mark-label");
    if (ph) {
      const hn = pendingHeroId && CLASSES[pendingHeroId] ? CLASSES[pendingHeroId].name : "—";
      ph.innerHTML = `Hero: <strong>${hn}</strong>`;
    }
    if (pl) {
      if (pendingMode === "torment") {
        pl.innerHTML = `Hall: <strong>Random</strong>`;
      } else {
        const hl = pendingHallId && HALLS[pendingHallId] ? HALLS[pendingHallId].name : "—";
        pl.innerHTML = `Hall: <strong>${hl}</strong>`;
      }
    }
    if (pm) {
      pm.innerHTML = `Mode: <strong>${pendingMode === "torment" ? "Torment" : "Hall"}</strong>`;
    }
    if (pmark) {
      const mid = meta.activeMark;
      const mn = mid && MARKS[mid] ? MARKS[mid].name : "—";
      pmark.innerHTML = `Mark: <strong style="color:${mid && MARKS[mid] ? (MARKS[mid].color || "#c080e0") : "inherit"}">${mn}</strong>`;
    }
    // Run sidebar meta pills
    const pills = document.getElementById("run-meta-pills");
    if (pills) {
      const bits = [];
      const loadN = (meta.loadout || []).length;
      bits.push(`<span class="meta-pill loadout">Loadout ${loadN}/${MAX_LOADOUT}</span>`);
      if (meta.activeMark && MARKS[meta.activeMark]) {
        bits.push(`<span class="meta-pill mark">${MARKS[meta.activeMark].name.replace("Mark of ", "")}</span>`);
      }
      if (pendingMode === "torment" && pendingArtifacts.length) {
        bits.push(`<span class="meta-pill art">${pendingArtifacts.length} Artifacts</span>`);
      }
      pills.innerHTML = bits.join("");
    }
    // Sync strip selection
    document.querySelectorAll(".run-hero-chip").forEach((b) => {
      b.classList.toggle("selected", b.dataset.class === pendingHeroId);
    });
  }

  function buildRunHeroStrip() {
    const strip = document.getElementById("run-hero-strip");
    if (!strip) return;
    strip.innerHTML = "";
    const order = DATA.HERO_ORDER || Object.keys(CLASSES);
    for (const id of order) {
      const h = CLASSES[id];
      if (!h) continue;
      const dt = heroDmgMeta(heroDmgType(h));
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "run-hero-chip" + (pendingHeroId === id ? " selected" : "");
      btn.dataset.class = id;
      btn.title = `${h.name} · ${dt.label}`;
      const cv = document.createElement("canvas");
      cv.width = 40;
      cv.height = 40;
      if (typeof paintPortrait === "function") paintPortrait(cv, id, 40);
      else if (typeof window.paintMenuPortrait === "function") window.paintMenuPortrait(cv, id, 40);
      const nm = document.createElement("span");
      nm.className = "rh-name";
      nm.textContent = h.name.split(" ")[0];
      const tp = document.createElement("span");
      tp.className = "rh-type";
      tp.style.color = dt.color;
      tp.textContent = dt.short || dt.label.slice(0, 3).toUpperCase();
      btn.appendChild(cv);
      btn.appendChild(nm);
      btn.appendChild(tp);
      btn.addEventListener("click", () => {
        selectHero(id);
      });
      strip.appendChild(btn);
    }
  }

  /** Snapshot combat-facing stats for menu compare */
  function snapshotMenuStats(p) {
    if (!p) return null;
    const asp = p.attackCooldown > 0 ? 1 / p.attackCooldown : 0;
    return {
      maxHp: Math.round(p.maxHp),
      damage: Math.round(p.damage * 10) / 10,
      asp: Math.round(asp * 100) / 100,
      speed: Math.round(p.speed),
      range: Math.round(p.attackRange),
      defense: Math.round(p.defense || 0),
      block: Math.round(p.blockStrength || 0),
      regen: Math.round((p.regen || 0) * 100) / 100,
      crit: Math.round((p.critChance || 0) * 1000) / 10,
      critB: Math.round((p.critBonus || 0) * 100),
      multi: Math.round((p.multistrike || 1) * 100) / 100,
      force: Math.round((p.force || 1) * 100) / 100,
      pickup: Math.round(p.pickupRange || 80),
      abDmg: Math.round((p.abilityDmgMul || 1) * 100),
      abCd: Math.round((p.abilityCdMul || 1) * 100),
      xpGain: Math.round((p.xpGain || 1) * 100),
      goldFind: Math.round((p.goldFind || 1) * 100),
      effect: Math.round((p.effectChance || 0) * 100),
      thorns: Math.round(p.thorns || 0),
    };
  }

  function buildMenuHeroPreview(classId) {
    if (!classId || !CLASSES[classId]) return null;
    const base = createPlayer(classId);
    const full = createPlayer(classId);
    applyMetaBonuses(full); // Blessings + Shard shop + Mark
    equipLoadout(full, meta.loadout || []);
    return { base: snapshotMenuStats(base), full: snapshotMenuStats(full), baseP: base, fullP: full };
  }

  function formatStatDelta(baseV, fullV, kind) {
    if (baseV == null || fullV == null) return { text: "—", cls: "" };
    const eps = 0.051;
    let same = Math.abs(fullV - baseV) < eps;
    if (kind === "int") same = Math.round(fullV) === Math.round(baseV);
    if (same) return { text: String(fullV), cls: "" };
    // Lower is better for ability CD mul
    const betterUp = kind !== "lower";
    const up = fullV > baseV;
    const good = betterUp ? up : !up;
    const d = fullV - baseV;
    const sign = d > 0 ? "+" : "";
    const dText = kind === "pct" || kind === "mul"
      ? `${sign}${Math.round(d * 10) / 10}`
      : kind === "asp" || kind === "regen" || kind === "multi" || kind === "force"
        ? `${sign}${Math.round(d * 100) / 100}`
        : `${sign}${Math.round(d * 10) / 10}`;
    return {
      text: `${fullV}`,
      delta: dText,
      cls: good ? "up" : "down",
    };
  }

  function updateHeroStatPanel() {
    const panel = document.getElementById("hero-stat-panel");
    const rows = document.getElementById("hero-stat-rows");
    const metaEl = document.getElementById("hero-stat-meta");
    if (!panel || !rows) return;

    if (!pendingHeroId || !CLASSES[pendingHeroId]) {
      panel.classList.add("hidden");
      return;
    }
    // Always show hero stats on RUN (even when focusing hall text above)
    panel.classList.remove("hidden");
    const prev = buildMenuHeroPreview(pendingHeroId);
    if (!prev) {
      panel.classList.add("hidden");
      return;
    }
    const b = prev.base;
    const f = prev.full;
    const specs = [
      { key: "maxHp", name: "HP", kind: "int" },
      { key: "damage", name: "ATK", kind: "num" },
      { key: "asp", name: "ASP /s", kind: "asp" },
      { key: "speed", name: "SPD", kind: "int" },
      { key: "range", name: "RNG", kind: "int" },
      { key: "defense", name: "DEF", kind: "int" },
      { key: "block", name: "BLK", kind: "int" },
      { key: "regen", name: "REGEN", kind: "regen" },
      { key: "crit", name: "CRIT %", kind: "pct" },
      { key: "critB", name: "C.DMG %", kind: "pct" },
      { key: "multi", name: "MULTI", kind: "multi" },
      { key: "force", name: "FORCE", kind: "force" },
      { key: "pickup", name: "PICKUP", kind: "int" },
      { key: "abDmg", name: "AB DMG %", kind: "pct" },
      { key: "abCd", name: "AB CD %", kind: "lower" },
      { key: "xpGain", name: "XP %", kind: "pct" },
      { key: "goldFind", name: "GOLD %", kind: "pct" },
      { key: "effect", name: "EFFECT %", kind: "pct" },
      { key: "thorns", name: "THORNS", kind: "int" },
    ];
    rows.innerHTML = specs.map((sp) => {
      const bv = b[sp.key];
      const fv = f[sp.key];
      const fmt = formatStatDelta(bv, fv, sp.kind);
      const baseStr = String(bv);
      const finalInner = fmt.delta
        ? `${fmt.text}<span class="st-delta">(${fmt.delta})</span>`
        : fmt.text;
      return (
        `<div class="hero-stat-row">` +
        `<span class="st-name">${sp.name}</span>` +
        `<span class="st-base">${baseStr}</span>` +
        `<span class="st-final ${fmt.cls}">${finalInner}</span>` +
        `</div>`
      );
    }).join("");

    if (metaEl) {
      const loadN = (meta.loadout || []).length;
      const bl = meta.blessings || {};
      const bRanks = BLESSING_ORDER.filter((id) => (bl[id] || 0) > 0)
        .map((id) => {
          const def = BLESSINGS[id];
          return `${(def && def.name) || id} ${bl[id]}`;
        });
      const markId = meta.activeMark && meta.ownedMarks && meta.ownedMarks[meta.activeMark]
        ? meta.activeMark
        : null;
      const markName = markId && MARKS[markId] ? MARKS[markId].name : null;
      const su = meta.shardUpgrades || {};
      const shardN = SHARD_SHOP_ORDER.filter((id) => (su[id] || 0) > 0).length;
      const bits = [];
      bits.push(`Loadout <strong>${loadN}/${MAX_LOADOUT}</strong>`);
      bits.push(bRanks.length
        ? `Blessings: <strong>${bRanks.slice(0, 4).join(", ")}${bRanks.length > 4 ? "…" : ""}</strong>`
        : `Blessings: <strong>0</strong>`);
      if (markName) bits.push(`Mark: <strong>${markName}</strong>`);
      if (shardN) bits.push(`Shard ups: <strong>${shardN}</strong>`);
      metaEl.innerHTML = bits.join(" · ");
    }
  }

  function refreshDetailPanel() {
    const name = document.getElementById("detail-name");
    const weapon = document.getElementById("detail-weapon");
    const blurb = document.getElementById("detail-blurb");
    const detailCv = document.getElementById("detail-portrait");
    const hallArt = document.getElementById("detail-hall-art");

    // Run sidebar previews
    if (detailCv && pendingHeroId) paintPortrait(detailCv, pendingHeroId, 100);
    if (hallArt && pendingHallId) paintHallArt(hallArt, pendingHallId, 140, 88);

    // Run sidebar text — prefer hall when focusing hall, else hero summary
    if (detailFocus === "hall" && pendingHallId && HALLS[pendingHallId] && pendingMode !== "torment") {
      const hall = HALLS[pendingHallId];
      if (name) name.textContent = hall.name;
      if (weapon) {
        const group = hall.group === "final" ? "FINAL" : hall.group === "dlc" ? "DLC" : `Hall ${hall.index}`;
        weapon.textContent = `${group} · Boss: ${(hall.boss && hall.boss.name) || "—"}`;
      }
      if (blurb) {
        const foes = (hall.enemies || []).map((t) => (ENEMY_BASE[t] && ENEMY_BASE[t].name) || t).join(", ");
        const mbs = (hall.minibossTypes || []).map((t) => (ENEMY_BASE[t] && ENEMY_BASE[t].name) || t).join(", ");
        blurb.innerHTML = [
          hall.blurb || "",
          foes ? `Quái: ${foes}` : "",
          mbs ? `Miniboss: ${mbs}` : "",
          `Hall Strength ×${(hall.hallStrength && hall.hallStrength.min) || 1} → ×${(hall.hallStrength && hall.hallStrength.max) || 2}`,
        ].filter(Boolean).map((t) => `<li>${t}</li>`).join("");
      }
    } else if (pendingHeroId && CLASSES[pendingHeroId]) {
      const h = CLASSES[pendingHeroId];
      const dt = heroDmgMeta(heroDmgType(h));
      const elem = h.dmgElement || heroDmgType(h);
      if (name) name.textContent = h.name;
      if (weapon) {
        weapon.innerHTML =
          `${h.weapon || "—"} · <span style="color:${dt.color}">${dt.label}` +
          `${elem && elem !== heroDmgType(h) && elem !== "physical" && elem !== "magic" ? " · " + elem : ""}</span>`;
      }
      if (blurb) {
        const lines = (h.blurb || []).filter((t) => !/^Skill:/i.test(String(t).trim()));
        lines.unshift(`Damage: ${dt.label}${h.dmgElement && h.dmgElement !== heroDmgType(h) ? " · " + h.dmgElement : ""}`);
        blurb.innerHTML = lines.map((t) => `<li>${t}</li>`).join("");
      }
    } else {
      if (name) name.textContent = "Chọn Hero & Hall";
      if (weapon) weapon.textContent = "—";
      if (blurb) blurb.innerHTML = "";
    }

    // Hero tab dedicated panel (large stats)
    refreshHeroTabDetail();
    updateHeroStatPanel();
    updateStartButton();
  }

  function refreshHeroTabDetail() {
    const name = document.getElementById("hero-tab-name");
    const weapon = document.getElementById("hero-tab-weapon");
    const dmgEl = document.getElementById("hero-tab-dmg");
    const blurb = document.getElementById("hero-tab-blurb");
    const portrait = document.getElementById("hero-tab-portrait");
    if (!pendingHeroId || !CLASSES[pendingHeroId]) {
      if (name) name.textContent = "Chọn Hero";
      if (weapon) weapon.textContent = "—";
      if (dmgEl) dmgEl.textContent = "—";
      if (blurb) blurb.innerHTML = "<li>Chọn hero trong roster bên trái</li>";
      return;
    }
    const h = CLASSES[pendingHeroId];
    const dt = heroDmgMeta(heroDmgType(h));
    const elem = h.dmgElement || heroDmgType(h);
    if (portrait) paintPortrait(portrait, pendingHeroId, 120);
    if (name) name.textContent = h.name;
    if (weapon) weapon.textContent = h.weapon || "—";
    if (dmgEl) {
      dmgEl.innerHTML =
        `<span class="hero-tab-dmg-pill" style="color:${dt.color};border-color:${dt.color}">${dt.short}</span> ` +
        `<strong style="color:${dt.color}">${dt.label}</strong>` +
        (elem && elem !== heroDmgType(h) && elem !== "physical" && elem !== "magic"
          ? ` · ${elem}`
          : "");
    }
    if (blurb) {
      const lines = (h.blurb || []).filter((t) => !/^Skill:/i.test(String(t).trim()));
      if (h.group === "boglands") lines.push("DLC · Boglands");
      blurb.innerHTML = lines.map((t) => `<li>${t}</li>`).join("");
    }
  }

  function selectHero(id) {
    const h = CLASSES[id];
    if (!h) return;
    pendingHeroId = id;
    detailFocus = "hero";
    document.querySelectorAll(".class-card").forEach((b) => {
      b.classList.toggle("selected", b.dataset.class === id);
    });
    document.querySelectorAll(".run-hero-chip").forEach((b) => {
      b.classList.toggle("selected", b.dataset.class === id);
    });
    refreshDetailPanel();
    updateStartButton();
    if (typeof updateHeroStatPanel === "function") updateHeroStatPanel();
    saveMenuPrefs();
    sfx("ui");
  }

  function selectHall(id) {
    const hall = HALLS[id];
    if (!hall) return;
    pendingHallId = id;
    selectedHallId = id;
    detailFocus = "hall";
    document.querySelectorAll(".hall-card").forEach((b) => {
      b.classList.toggle("selected", b.dataset.hall === id);
    });
    refreshDetailPanel();
    updateDiffUI();
    updateStartButton();
    const chk = document.getElementById("chk-agony");
    if (chk && !chk.disabled) chk.checked = pendingAgony;
    saveMenuPrefs();
  }

  function tryStartGame() {
    const reason = startBlockReason();
    if (reason) {
      toast(reason, "warn");
      sfx("click");
      updateStartButton();
      return;
    }
    saveMenuPrefs();
    if (window.HOT_SFX) window.HOT_SFX.unlock();
    sfx("click");
    startGame(pendingHeroId, pendingHallId);
  }

  function heroDmgType(h) {
    if (!h) return "other";
    return h.dmgType || "other";
  }

  function heroDmgMeta(type) {
    const map = DATA.HERO_DMG_TYPES || {
      physical: { label: "Physical", short: "PHY", color: "#d4a84b" },
      magic: { label: "Magic", short: "MAG", color: "#a070e0" },
      elemental: { label: "Elemental", short: "ELE", color: "#50c0b0" },
      other: { label: "Other", short: "OTH", color: "#90a0b0" },
    };
    return map[type] || map.other;
  }

  function buildHeroSelect() {
    const grids = {
      physical: document.getElementById("class-grid-physical"),
      magic: document.getElementById("class-grid-magic"),
      elemental: document.getElementById("class-grid-elemental"),
      other: document.getElementById("class-grid-other"),
    };
    // Fallback: old base/dlc grids if HTML not updated
    if (!grids.physical && !grids.magic) {
      const gridBase = document.getElementById("class-grid-base");
      if (gridBase) grids.physical = gridBase;
    }
    Object.values(grids).forEach((g) => { if (g) g.innerHTML = ""; });
    if (!DATA) return;

    const order = DATA.HERO_ORDER || Object.keys(CLASSES);
    const dmgOrder = DATA.HERO_DMG_ORDER || ["physical", "magic", "elemental", "other"];

    for (const id of order) {
      const h = CLASSES[id];
      if (!h) continue;
      const dtype = heroDmgType(h);
      const metaT = heroDmgMeta(dtype);
      const grid = grids[dtype] || grids.other || grids.physical;
      if (!grid) continue;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "class-card dmg-" + dtype;
      btn.dataset.class = id;
      btn.dataset.dmg = dtype;
      const elem = h.dmgElement || dtype;
      btn.title = `${h.name} — ${h.weapon || ""} · ${metaT.label}${elem !== dtype ? " (" + elem + ")" : ""}`;

      const cv = document.createElement("canvas");
      cv.className = "portrait";
      cv.width = 72;
      cv.height = 72;
      paintPortrait(cv, id, 56);

      const badge = document.createElement("span");
      badge.className = "dmg-badge";
      badge.style.color = metaT.color;
      badge.style.borderColor = metaT.color;
      badge.textContent = metaT.short + (h.dmgElement && h.dmgElement !== dtype && h.dmgElement !== "physical" && h.dmgElement !== "magic" && h.dmgElement !== "elemental"
        ? "·" + String(h.dmgElement).slice(0, 3).toUpperCase()
        : "");

      const nameEl = document.createElement("span");
      nameEl.className = "card-name";
      nameEl.textContent = h.name;

      const skillEl = document.createElement("span");
      skillEl.className = "card-skill";
      skillEl.textContent = h.weapon || "";

      btn.appendChild(cv);
      btn.appendChild(badge);
      btn.appendChild(nameEl);
      btn.appendChild(skillEl);
      btn.addEventListener("click", () => selectHero(id));
      btn.addEventListener("dblclick", () => {
        selectHero(id);
        tryStartGame();
      });
      grid.appendChild(btn);
    }

    // Hide empty type sections
    for (const t of dmgOrder) {
      const g = grids[t];
      const lab = document.querySelector(`.hero-dmg-label[data-dmg="${t}"]`);
      if (!g) continue;
      const empty = g.children.length === 0;
      g.classList.toggle("hidden", empty);
      if (lab) lab.classList.toggle("hidden", empty);
    }
  }

  function buildHallSelect() {
    const grid = document.getElementById("hall-grid");
    if (!grid || !DATA) return;
    grid.innerHTML = "";

    for (const id of HALL_ORDER) {
      const hall = HALLS[id];
      if (!hall) continue;
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "hall-card";
      btn.dataset.hall = id;
      btn.title = hall.name;

      const cv = document.createElement("canvas");
      cv.className = "hall-art";
      cv.width = 120;
      cv.height = 75;
      paintHallArt(cv, id, 120, 75);

      const idx = document.createElement("span");
      idx.className = "hall-index";
      idx.textContent = hall.group === "final" ? "FINAL" : hall.group === "dlc" ? "DLC" : `Hall ${hall.index}`;

      const nameEl = document.createElement("span");
      nameEl.className = "card-name";
      nameEl.textContent = hall.name;

      const sub = document.createElement("span");
      sub.className = "card-skill";
      sub.textContent = (hall.boss && hall.boss.name) || "";

      btn.appendChild(cv);
      btn.appendChild(idx);
      btn.appendChild(nameEl);
      btn.appendChild(sub);
      btn.addEventListener("click", () => selectHall(id));
      btn.addEventListener("dblclick", () => {
        selectHall(id);
        tryStartGame();
      });
      grid.appendChild(btn);
    }
  }

  function buildMenu() {
    meta = loadMeta();
    pendingMode = meta.mode === "torment" ? "torment" : "hall";
    pendingDurationId = meta.durationId || "5";
    pendingAgony = !!meta.agony && pendingMode === "hall";
    pendingTormentLevel = Math.max(1, meta.tormentLevel || 1);
    clampPendingTormentLevel();
    ensureDurationForMode();
    pendingArtifacts = (meta.artifacts || []).filter((id) => ARTIFACTS[id]);
    // Validate active mark
    if (meta.activeMark && !(meta.ownedMarks && meta.ownedMarks[meta.activeMark] && MARKS[meta.activeMark])) {
      meta.activeMark = null;
    }
    // If owned marks exist but none equipped, equip first owned
    if (!meta.activeMark && meta.ownedMarks) {
      for (const id of MARK_ORDER) {
        if (meta.ownedMarks[id]) { meta.activeMark = id; break; }
      }
    }
    meta.loadout = (meta.loadout || []).filter((e) => ITEMS[itemIdOf(e)]).slice(0, MAX_LOADOUT);
    // First visit: starter bank gold so Blessings are usable without grinding forever
    if (!meta._starterGranted) {
      meta.gold = (meta.gold || 0) + 500;
      meta._starterGranted = true;
      saveMeta();
    }

    buildHallSelect();
    buildHeroSelect();
    applySettingsToSfx();
    wireModeButtons();
    buildDurationPicks();
    buildTormentLevelPicks();
    buildArtifactGrid();
    wireAgonyCheckbox();
    wireArtifactCollapse();
    wireSettingsUI();
    wireCampSubTabs();
    rebuildCampUI();

    document.querySelectorAll(".menu-tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        sfx("ui");
        switchMenuTab(btn.dataset.tab || "run");
      });
    });
    const gotoHero = document.getElementById("btn-goto-hero");
    if (gotoHero && !gotoHero.dataset.wired) {
      gotoHero.dataset.wired = "1";
      gotoHero.addEventListener("click", () => {
        sfx("ui");
        switchMenuTab("hero");
      });
    }
    const runToHero = document.getElementById("btn-run-to-hero");
    if (runToHero && !runToHero.dataset.wired) {
      runToHero.dataset.wired = "1";
      runToHero.addEventListener("click", () => {
        sfx("ui");
        switchMenuTab("hero");
      });
    }
    const heroToRun = document.getElementById("btn-hero-to-run");
    if (heroToRun && !heroToRun.dataset.wired) {
      heroToRun.dataset.wired = "1";
      heroToRun.addEventListener("click", () => {
        sfx("click");
        if (pendingHeroId) {
          switchMenuTab("run");
          updateStartButton();
        }
      });
    }
    const refundBtn = document.getElementById("btn-refund-blessings");
    if (refundBtn) {
      refundBtn.onclick = () => {
        const back = refundAllBlessings();
        sfx("ui");
        refundBtn.textContent = back > 0 ? `Refunded ${back}G` : "Nothing to refund";
        setTimeout(() => { refundBtn.textContent = "Refund all Blessings"; }, 1600);
      };
    }
    const clearLo = document.getElementById("btn-clear-loadout");
    if (clearLo) clearLo.onclick = () => { clearLoadout(); sfx("ui"); };
    const wellHeal = document.getElementById("btn-well-heal");
    if (wellHeal) wellHeal.onclick = () => healAtWell();
    const wellClose = document.getElementById("btn-well-close");
    if (wellClose) wellClose.onclick = () => closeWellOverlay();
    const rerollBtn = document.getElementById("btn-reroll");
    if (rerollBtn && !rerollBtn.dataset.wired) {
      rerollBtn.dataset.wired = "1";
      rerollBtn.addEventListener("click", () => rerollLevelUp());
    }
    // Unlock audio on first interaction
    const unlock = () => {
      if (window.HOT_SFX) window.HOT_SFX.unlock();
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("pointerdown", unlock);
    document.addEventListener("keydown", unlock);

    const order = DATA.HERO_ORDER || Object.keys(CLASSES);
    const hallId = (meta.hall && HALLS[meta.hall]) ? meta.hall : HALL_ORDER[0];
    const heroId = (meta.hero && CLASSES[meta.hero]) ? meta.hero : order[0];
    if (hallId) {
      pendingHallId = hallId;
      selectedHallId = hallId;
      document.querySelectorAll(".hall-card").forEach((b) => {
        b.classList.toggle("selected", b.dataset.hall === hallId);
      });
    }
    if (heroId) {
      pendingHeroId = heroId;
      document.querySelectorAll(".class-card").forEach((b) => {
        b.classList.toggle("selected", b.dataset.class === heroId);
      });
    }
    detailFocus = "hero";
    refreshDetailPanel();
    updateDiffUI();
    buildRunHeroStrip();
    switchMenuTab("run");
    updateStartButton();

    const startBtn = document.getElementById("btn-start");
    if (startBtn) startBtn.onclick = () => tryStartGame();
  }
  buildMenu();

  $("btn-resume").addEventListener("click", () => {
    state = "playing";
    showScreen("game");
    lastTs = performance.now();
  });
  $("btn-menu").addEventListener("click", returnToMenu);
  $("btn-end-menu").addEventListener("click", returnToMenu);
  $("btn-retry").addEventListener("click", () => {
    if (selectedClass) startGame(selectedClass, selectedHallId || pendingHallId);
  });

  showScreen("menu");
})();
