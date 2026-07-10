/**
 * Halls of Torment — full hero roster (wiki-sourced, scaled)
 * Source: https://hot.fandom.com/wiki/Hero
 * Stats from each hero page; HP/DMG scaled for browser prototype.
 */

/** @fileoverview Game data only — runtime in game.js; graphics in art.js / ability-icons.js */
window.HOT_DATA = (() => {
  const HP = (v) => Math.round(v * 0.32);
  const DMG = (v) => Math.round(v * 0.18);
  const DMG_HEAVY = (v) => Math.round(v * 0.08); // high-base weapons (Cleric/Landsknecht)
  const SPD = (mps) => Math.round(mps * 29);
  const RNG = (m) => Math.round(m * 11);

  /**
   * Main-weapon damage family (wiki Damage Types, grouped for UI):
   * physical | magic | elemental (Fire/Lightning/Ice/Earth) | other
   * https://hot.fandom.com/wiki/Damage
   */
  const HERO_DMG_TYPES = {
    physical: { id: "physical", label: "Physical", short: "PHY", color: "#d4a84b" },
    magic: { id: "magic", label: "Magic", short: "MAG", color: "#a070e0" },
    elemental: { id: "elemental", label: "Elemental", short: "ELE", color: "#50c0b0" },
    other: { id: "other", label: "Other", short: "OTH", color: "#90a0b0" },
  };
  const HERO_DMG_ORDER = ["physical", "magic", "elemental", "other"];

  const HEROES = {
    // ── Base roster ────────────────────────────────────────
    swordsman: {
      id: "swordsman",
      name: "Swordsman",
      wiki: "https://hot.fandom.com/wiki/Swordsman",
      weapon: "Zweihänder",
      color: "#e07070",
      group: "base",
      dmgType: "physical",
      dmgElement: "physical",
      maxHp: HP(500),
      defense: 20,
      regen: 0.15,
      speed: SPD(5.0),
      damage: DMG(100),
      attackSpeed: 0.9,
      multistrike: 1,
      critChance: 0.2,
      critBonus: 0.65,
      attackRange: RNG(7.0),
      coneDeg: 45,
      style: "melee",
      pickupRange: 90,
      skill: { id: "ringblades", name: "Ring Blades", cooldown: 8, desc: "Lưỡi đao xoáy quanh (wiki Ability)" },
      blurb: ["Zweihänder · nón AOE", "HP/Def cao · Crit 20%", "Skill: Ring Blades"],
    },
    archer: {
      id: "archer",
      name: "Archer",
      wiki: "https://hot.fandom.com/wiki/Archer",
      weapon: "Bow",
      color: "#8fd46a",
      group: "base",
      dmgType: "physical",
      dmgElement: "physical",
      maxHp: HP(400),
      defense: 10,
      regen: 0.15,
      speed: SPD(5.5),
      damage: DMG(60),
      attackSpeed: 0.95,
      multistrike: 3,
      critChance: 0.33,
      critBonus: 2.0,
      attackRange: 400,
      coneDeg: 18,
      projectileSpeed: 420,
      pierce: 1,
      style: "arrow",
      pickupRange: 70,
      skill: { id: "transfixion", name: "Transfixion", cooldown: 9, desc: "Mưa đạn xuyên (wiki Ability)" },
      blurb: ["Bow · 3 mũi nón", "Crit 33% · +200%", "Skill: Transfixion"],
    },
    exterminator: {
      id: "exterminator",
      name: "Exterminator",
      wiki: "https://hot.fandom.com/wiki/Exterminator",
      weapon: "Flame Caster",
      color: "#ff8040",
      group: "base",
      dmgType: "elemental",
      dmgElement: "fire",
      maxHp: HP(400),
      defense: 10,
      regen: 0.15,
      speed: SPD(5.0),
      damage: DMG(50),
      attackSpeed: 3.0,
      multistrike: 1,
      critChance: 0.05,
      critBonus: 1.0,
      attackRange: 220,
      coneDeg: 28,
      projectileSpeed: 300,
      pierce: 2,
      style: "flame",
      pickupRange: 70,
      skill: { id: "dragonbreath", name: "Dragon's Breath", cooldown: 10, desc: "Phun lửa nón rộng (wiki Ability)" },
      blurb: ["Flame Caster · nón lửa", "ASP 3.0/s · Burn", "Skill: Dragon's Breath"],
    },
    cleric: {
      id: "cleric",
      name: "Cleric",
      wiki: "https://hot.fandom.com/wiki/Cleric",
      weapon: "Holy Scepter",
      color: "#f0e0a0",
      group: "base",
      dmgType: "magic",
      dmgElement: "magic",
      maxHp: HP(400),
      defense: 0,
      regen: 0.2,
      speed: SPD(4.5),
      damage: DMG_HEAVY(1000), // wiki 1000, split among hits
      attackSpeed: 0.666,
      multistrike: 1,
      critChance: 0.2,
      critBonus: 1.0,
      attackRange: RNG(7.0),
      coneDeg: 50,
      style: "scepter",
      pickupRange: 70,
      skill: { id: "radiant", name: "Radiant Aura", cooldown: 9, desc: "Hào quang holy — dmg + hồi máu" },
      blurb: ["Holy Scepter · chia dmg", "Dmg cao khi ít mục tiêu", "Skill: Radiant Aura"],
    },
    warlock: {
      id: "warlock",
      name: "Warlock",
      wiki: "https://hot.fandom.com/wiki/Warlock",
      weapon: "Ravaging Specters",
      color: "#a060d0",
      group: "base",
      dmgType: "magic",
      dmgElement: "magic",
      maxHp: HP(350),
      defense: 0,
      regen: 0,
      speed: SPD(5.0),
      damage: DMG(50),
      attackSpeed: 0.6,
      multistrike: 2,
      critChance: 0.1,
      critBonus: 2.0,
      attackRange: 360,
      projectileSpeed: 260,
      pierce: 4,
      style: "specter",
      pickupRange: 90,
      skill: { id: "ghostarmy", name: "Ghost Army", cooldown: 11, desc: "Bầy specter vòng quanh" },
      blurb: ["Specters · nhảy mục tiêu", "Multi 2 · Summon", "Skill: Ghost Army"],
    },
    sorceress: {
      id: "sorceress",
      name: "Sorceress",
      wiki: "https://hot.fandom.com/wiki/Sorceress",
      weapon: "Chain Lightning",
      color: "#7aa8ff",
      group: "base",
      dmgType: "elemental",
      dmgElement: "lightning",
      maxHp: HP(300),
      defense: 0,
      regen: 0,
      speed: SPD(5.5),
      damage: DMG(100),
      attackSpeed: 0.75,
      multistrike: 3,
      critChance: 0.2,
      critBonus: 1.0,
      attackRange: 340,
      chainJumps: 3,
      style: "chain",
      pickupRange: 70,
      skill: { id: "meteor", name: "Meteor Strike", cooldown: 10, desc: "Thiên thạch AOE (wiki Ability)" },
      blurb: ["Chain Lightning", "HP thấp · Magic", "Skill: Meteor Strike"],
    },
    shield_maiden: {
      id: "shield_maiden",
      name: "Shield Maiden",
      wiki: "https://hot.fandom.com/wiki/Shield_Maiden",
      weapon: "War Hammer + Shield",
      color: "#c0c8d8",
      group: "base",
      dmgType: "physical",
      dmgElement: "physical",
      maxHp: HP(400),
      defense: 5,
      regen: 0.05,
      blockStrength: 20,
      speed: SPD(4.5),
      damage: DMG(200),
      attackSpeed: 0.55,
      multistrike: 1,
      critChance: 0.0,
      critBonus: 1.5,
      attackRange: RNG(3.0) + 20,
      style: "hammer",
      pickupRange: 70,
      skill: { id: "shieldbash", name: "Shield Bash", cooldown: 8, desc: "Bash nón — dmg từ Block Strength" },
      blurb: ["War Hammer · vòng tròn", "Block 20 · Tank", "Skill: Shield Bash"],
    },
    beast_huntress: {
      id: "beast_huntress",
      name: "Beast Huntress",
      wiki: "https://hot.fandom.com/wiki/Beast_Huntress",
      weapon: "Hunting Spear + Hound",
      color: "#d0a060",
      group: "base",
      dmgType: "physical",
      dmgElement: "physical",
      maxHp: HP(400),
      defense: 10,
      regen: 0.05,
      speed: SPD(5.0),
      damage: DMG(100),
      attackSpeed: 0.7,
      multistrike: 1.2,
      critChance: 0.33,
      critBonus: 2.0,
      attackRange: 380,
      projectileSpeed: 380,
      pierce: 2,
      style: "spear",
      pickupRange: 70,
      skill: { id: "hound", name: "Hound Pack", cooldown: 9, desc: "Gọi hound cắn quanh (wiki Hound)" },
      blurb: ["Spear ném + Hound", "Crit 33%", "Skill: Hound Pack"],
    },
    norseman: {
      id: "norseman",
      name: "Norseman",
      wiki: "https://hot.fandom.com/wiki/Norseman",
      weapon: "Dual Axes + Frost Nova",
      color: "#80c0e0",
      group: "base",
      dmgType: "elemental",
      dmgElement: "ice",
      maxHp: HP(400),
      defense: 20,
      regen: 0.25,
      speed: SPD(5.5),
      damage: DMG(20) + 4, // low wiki dmg, high ASP
      attackSpeed: 2.0,
      multistrike: 1,
      critChance: 0.05,
      critBonus: 1.0,
      attackRange: RNG(5.5),
      coneDeg: 45,
      style: "dualaxe",
      pickupRange: 90,
      skill: { id: "frostnova", name: "Frost Nova", cooldown: 7, desc: "Sóng băng làm chậm + dmg" },
      blurb: ["Dual Axes · ASP 2.0", "Frost Nova phụ", "Skill: Frost Nova"],
    },
    landsknecht: {
      id: "landsknecht",
      name: "Landsknecht",
      wiki: "https://hot.fandom.com/wiki/Landsknecht",
      weapon: "Arquebus + Grenades",
      color: "#d4a84b",
      group: "base",
      dmgType: "physical",
      dmgElement: "physical",
      maxHp: HP(400),
      defense: 10,
      regen: 0.08,
      speed: SPD(5.0),
      damage: DMG_HEAVY(400),
      attackSpeed: 0.5,
      multistrike: 1,
      critChance: 0.05,
      critBonus: 4.0,
      attackRange: 450,
      projectileSpeed: 550,
      pierce: 1,
      style: "gun",
      pickupRange: 90,
      skill: { id: "grenade", name: "Grenades", cooldown: 6, desc: "Ném lựu đạn nổ (wiki secondary)" },
      blurb: ["Arquebus · 1 phát mạnh", "Crit +400%", "Skill: Grenades"],
    },
    sage: {
      id: "sage",
      name: "Sage",
      wiki: "https://hot.fandom.com/wiki/Sage",
      weapon: "Wisdom (Main Ability)",
      color: "#c0a0ff",
      group: "base",
      dmgType: "magic",
      dmgElement: "magic",
      maxHp: HP(250),
      defense: 0,
      regen: 0,
      speed: SPD(4.5),
      // Glass cannon: uses ability-like chain as main weapon
      damage: DMG(90),
      attackSpeed: 0.85,
      multistrike: 2,
      critChance: 0.25,
      critBonus: 1.2,
      attackRange: 320,
      chainJumps: 4,
      style: "chain",
      skillPowerBonus: 1.5, // wiki +50% Main Ability
      pickupRange: 55,
      skill: { id: "arcane_rift", name: "Arcane Rift", cooldown: 8, desc: "Rift nổ + chain (Ability-as-weapon)" },
      blurb: ["Wisdom · glass cannon", "HP thấp · +Ability dmg", "Skill: Arcane Rift"],
    },
    bard: {
      id: "bard",
      name: "Bard",
      wiki: "https://hot.fandom.com/wiki/Bard",
      weapon: "Lute",
      color: "#e0a0c0",
      group: "base",
      dmgType: "other",
      dmgElement: "physical",
      maxHp: HP(1000),
      defense: 0,
      regen: 0,
      speed: SPD(8.0),
      damage: DMG(25) + 6,
      attackSpeed: 1.733, // ~104 BPM beat feel
      multistrike: 1,
      critChance: 0.05,
      critBonus: 1.0,
      attackRange: RNG(3.7),
      coneDeg: 50,
      style: "lute",
      pickupRange: 90,
      skill: { id: "mosh", name: "Mosh Pit", cooldown: 8, desc: "Vòng rock — dmg + knock (Bard Ability)" },
      blurb: ["Lute · chém nón gần", "HP/SPD cực cao", "Skill: Mosh Pit"],
    },

    // ── Boglands DLC ───────────────────────────────────────
    crone: {
      id: "crone",
      name: "Crone",
      wiki: "https://hot.fandom.com/wiki/Crone",
      weapon: "Bog Plants",
      color: "#60a050",
      group: "boglands",
      dmgType: "elemental",
      dmgElement: "earth",
      maxHp: HP(380),
      defense: 5,
      regen: 0.12,
      speed: SPD(4.8),
      damage: DMG(55),
      attackSpeed: 0.9,
      multistrike: 4, // 4 plants
      critChance: 0.15,
      critBonus: 1.0,
      attackRange: 200,
      style: "plants",
      pickupRange: 75,
      skill: { id: "undergrowth", name: "Undergrowth", cooldown: 10, desc: "Bụi gai nổ Decay (wiki Ability)" },
      blurb: ["Bog Plants · 4 summon", "DLC Boglands", "Skill: Undergrowth"],
    },
    alchemist: {
      id: "alchemist",
      name: "Alchemist",
      wiki: "https://hot.fandom.com/wiki/Alchemist",
      weapon: "Concoctions of Elements",
      color: "#50c0b0",
      group: "boglands",
      dmgType: "elemental",
      dmgElement: "elemental",
      maxHp: HP(360),
      defense: 5,
      regen: 0.05,
      speed: SPD(5.0),
      damage: DMG(70),
      attackSpeed: 1.1,
      multistrike: 3,
      critChance: 0.15,
      critBonus: 1.2,
      attackRange: 280,
      projectileSpeed: 240,
      style: "flask",
      pickupRange: 80,
      skill: { id: "prismatic", name: "Prismatic Cascade", cooldown: 10, desc: "Bão elemental (wiki Ability)" },
      blurb: ["Flask elemental vòng", "DLC Boglands", "Skill: Prismatic Cascade"],
    },
  };

  /**
   * Enemy roster from wiki halls (scaled for browser prototype).
   * Sources: hot.fandom.com hall pages (Haunted Caverns … Boglands).
   * sprite: visual key in game.js (imp, slime, hound, skeleton, …)
   */
  const ENEMIES = {
    // ── Shared / Haunted Caverns ───────────────────────────
    slime: { name: "Slime", hp: 48, speed: 40, dmg: 10, r: 15, color: "#50a060", xp: 5, sprite: "slime" },
    poison_slime: { name: "Poison Slime", hp: 55, speed: 38, dmg: 12, r: 16, color: "#70c040", xp: 6, sprite: "slime" },
    imp: { name: "Imp", hp: 28, speed: 72, dmg: 8, r: 12, color: "#7a4a90", xp: 3, sprite: "imp" },
    hellhound: { name: "Hellhound", hp: 18, speed: 128, dmg: 7, r: 11, color: "#a05830", xp: 4, sprite: "hound" },
    skeleton: { name: "Skeleton", hp: 85, speed: 50, dmg: 15, r: 17, color: "#c8c0b0", xp: 10, sprite: "skeleton" },
    skeleton_lance: { name: "Skeleton Lance", hp: 95, speed: 52, dmg: 17, r: 17, color: "#b8b0a0", xp: 11, sprite: "skeleton" },
    skeleton_mage: { name: "Skeleton Mage", hp: 70, speed: 46, dmg: 14, r: 16, color: "#9080b0", xp: 12, sprite: "mage" },
    skeleton_shield: { name: "Skeleton Shield", hp: 130, speed: 42, dmg: 16, r: 20, color: "#a8a090", xp: 14, sprite: "shield" },
    imp_chieftain: { name: "Imp Chieftain", hp: 480, speed: 58, dmg: 22, r: 26, color: "#8a3aa0", xp: 40, sprite: "imp", miniboss: true },
    skeleton_lord: { name: "Skeleton Lord", hp: 560, speed: 50, dmg: 24, r: 28, color: "#d0c8b8", xp: 45, sprite: "skeleton", miniboss: true },
    lich: { name: "Lich", hp: 620, speed: 48, dmg: 26, r: 28, color: "#60a080", xp: 50, sprite: "lich", miniboss: true },

    // ── Ember Grounds ──────────────────────────────────────
    scorched: { name: "Scorched", hp: 40, speed: 62, dmg: 11, r: 13, color: "#c04820", xp: 5, sprite: "scorched" },
    magma_slime: { name: "Magma Slime", hp: 60, speed: 36, dmg: 13, r: 17, color: "#e05020", xp: 7, sprite: "slime" },
    flamedancer: { name: "Flamedancer", hp: 500, speed: 70, dmg: 22, r: 26, color: "#ff6020", xp: 42, sprite: "fiend", miniboss: true },
    wraith_warlord: { name: "Wraith Warlord", hp: 580, speed: 55, dmg: 24, r: 28, color: "#c06040", xp: 48, sprite: "wraith", miniboss: true },
    wyrm_queen: { name: "Wyrm Queen", hp: 700, speed: 52, dmg: 26, r: 32, color: "#d04020", xp: 55, sprite: "wyrm", miniboss: true },

    // ── Forgotten Viaduct ───────────────────────────────────
    wraith: { name: "Wraith", hp: 34, speed: 78, dmg: 11, r: 13, color: "#8090c0", xp: 5, sprite: "wraith" },
    gargoyle: { name: "Gargoyle", hp: 78, speed: 54, dmg: 15, r: 17, color: "#607080", xp: 9, sprite: "gargoyle" },
    possessed_effigy: { name: "Possessed Effigy", hp: 90, speed: 40, dmg: 16, r: 18, color: "#706050", xp: 10, sprite: "effigy" },
    marching_ghost: { name: "Marching Ghost", hp: 42, speed: 98, dmg: 10, r: 12, color: "#a0b0d8", xp: 6, sprite: "ghost" },
    wraith_horseman: { name: "Wraith Horseman", hp: 600, speed: 72, dmg: 25, r: 30, color: "#5060a0", xp: 50, sprite: "horseman", miniboss: true },
    frost_knight: { name: "Frost Knight", hp: 640, speed: 48, dmg: 26, r: 30, color: "#70a0c0", xp: 52, sprite: "knight", miniboss: true },
    hydra: { name: "Hydra", hp: 750, speed: 46, dmg: 28, r: 34, color: "#408060", xp: 58, sprite: "hydra", miniboss: true },

    // ── Frozen Depths ──────────────────────────────────────
    frost_slime: { name: "Frost Slime", hp: 52, speed: 38, dmg: 12, r: 16, color: "#70c0e0", xp: 6, sprite: "slime" },
    frost_crawler: { name: "Frost Crawler", hp: 36, speed: 95, dmg: 11, r: 12, color: "#80b0d0", xp: 6, sprite: "crawler" },
    frost_ghoul: { name: "Frost Ghoul", hp: 58, speed: 68, dmg: 13, r: 15, color: "#90c0d8", xp: 7, sprite: "ghoul" },
    frost_guard: { name: "Frost Guard", hp: 100, speed: 44, dmg: 16, r: 18, color: "#a0d0e8", xp: 11, sprite: "shield" },
    frost_bear: { name: "Frost Bear", hp: 140, speed: 55, dmg: 20, r: 22, color: "#c0e0f0", xp: 14, sprite: "bear" },
    frost_skull: { name: "Frost Skull", hp: 32, speed: 88, dmg: 12, r: 12, color: "#b0e0f8", xp: 6, sprite: "skull" },
    frost_skeleton: { name: "Frost Skeleton", hp: 88, speed: 48, dmg: 15, r: 17, color: "#d0e8f8", xp: 10, sprite: "skeleton" },
    frost_skeleton_mage: { name: "Frost Skeleton Mage", hp: 72, speed: 45, dmg: 15, r: 16, color: "#90c0e8", xp: 12, sprite: "mage" },
    snow_effigy: { name: "Snow Effigy", hp: 85, speed: 38, dmg: 14, r: 17, color: "#e0f0ff", xp: 9, sprite: "effigy" },
    ice_wyrm: { name: "Ice Wyrm", hp: 110, speed: 60, dmg: 18, r: 20, color: "#60b0d8", xp: 13, sprite: "wyrm" },
    basilisk: { name: "Basilisk", hp: 680, speed: 50, dmg: 27, r: 32, color: "#50a090", xp: 55, sprite: "wyrm", miniboss: true },
    polar_beast: { name: "Polar Beast", hp: 720, speed: 62, dmg: 28, r: 32, color: "#e8f4ff", xp: 56, sprite: "bear", miniboss: true },
    twisted_construct: { name: "Twisted Construct", hp: 780, speed: 46, dmg: 30, r: 34, color: "#80a0c0", xp: 60, sprite: "construct", miniboss: true },
    elder_giant: { name: "Elder Giant", hp: 900, speed: 40, dmg: 32, r: 38, color: "#a0c0d8", xp: 65, sprite: "giant", miniboss: true },

    // ── Chambers of Dissonance ─────────────────────────────
    ghoul: { name: "Ghoul", hp: 55, speed: 70, dmg: 13, r: 14, color: "#806090", xp: 6, sprite: "ghoul" },
    homunculus: { name: "Homunculus", hp: 42, speed: 75, dmg: 12, r: 13, color: "#c070a0", xp: 6, sprite: "imp" },
    capra_fiend: { name: "Capra Fiend", hp: 68, speed: 72, dmg: 15, r: 16, color: "#a04070", xp: 8, sprite: "fiend" },
    shapeshifter: { name: "Shapeshifter", hp: 75, speed: 80, dmg: 14, r: 15, color: "#d060c0", xp: 9, sprite: "wraith" },
    demonic_construct: { name: "Demonic Construct", hp: 120, speed: 42, dmg: 18, r: 20, color: "#702060", xp: 13, sprite: "construct" },
    void_syphon: { name: "Void Syphon", hp: 65, speed: 58, dmg: 16, r: 16, color: "#502080", xp: 10, sprite: "void" },
    void_caller: { name: "Void Caller", hp: 700, speed: 52, dmg: 28, r: 30, color: "#a03090", xp: 58, sprite: "void", miniboss: true },
    the_village: { name: "The Village", hp: 820, speed: 48, dmg: 30, r: 34, color: "#c040a0", xp: 62, sprite: "construct", miniboss: true },
    twisted_knight: { name: "Twisted Knight", hp: 760, speed: 50, dmg: 29, r: 32, color: "#8030a0", xp: 60, sprite: "knight", miniboss: true },

    // ── The Vault (mixed + gold-tinted) ─────────────────────
    vault_imp: { name: "Vault Imp", hp: 36, speed: 74, dmg: 11, r: 12, color: "#d4a84b", xp: 6, sprite: "imp" },
    vault_slime: { name: "Vault Slime", hp: 58, speed: 40, dmg: 13, r: 16, color: "#e0c060", xp: 7, sprite: "slime" },
    vault_hound: { name: "Vault Hound", hp: 24, speed: 122, dmg: 9, r: 11, color: "#c09030", xp: 5, sprite: "hound" },
    vault_skeleton: { name: "Vault Skeleton", hp: 100, speed: 48, dmg: 17, r: 18, color: "#e8d080", xp: 12, sprite: "skeleton" },
    vault_mage: { name: "Vault Mage", hp: 80, speed: 46, dmg: 16, r: 16, color: "#d0b050", xp: 13, sprite: "mage" },
    mimic: { name: "Mimic", hp: 650, speed: 55, dmg: 26, r: 28, color: "#d4a84b", xp: 55, sprite: "mimic", miniboss: true },

    // ── Boglands DLC (swamp / blight theme) ─────────────────
    bog_imp: { name: "Bog Imp", hp: 34, speed: 68, dmg: 10, r: 12, color: "#406848", xp: 5, sprite: "imp" },
    bog_slime: { name: "Bog Slime", hp: 70, speed: 36, dmg: 14, r: 17, color: "#508050", xp: 7, sprite: "slime" },
    bog_crawler: { name: "Bog Crawler", hp: 38, speed: 100, dmg: 11, r: 12, color: "#608040", xp: 6, sprite: "crawler" },
    bog_ghoul: { name: "Bog Ghoul", hp: 62, speed: 66, dmg: 14, r: 15, color: "#507040", xp: 8, sprite: "ghoul" },
    mire_hound: { name: "Mire Hound", hp: 26, speed: 118, dmg: 10, r: 11, color: "#406030", xp: 5, sprite: "hound" },
    swamp_effigy: { name: "Swamp Effigy", hp: 95, speed: 38, dmg: 16, r: 18, color: "#3a5030", xp: 11, sprite: "effigy" },
    blight_worm: { name: "Blight Worm", hp: 720, speed: 48, dmg: 28, r: 32, color: "#306040", xp: 58, sprite: "wyrm", miniboss: true },
    evil_tree: { name: "Evil Tree", hp: 800, speed: 30, dmg: 26, r: 36, color: "#2a4020", xp: 60, sprite: "tree", miniboss: true },
  };

  const BOSSES = {
    lord_of_pain: { name: "Lord of Pain", pattern: "pain", wiki: "https://hot.fandom.com/wiki/Lord_of_Pain", hp: 2200, speed: 55, dmg: 22, r: 36, color: "#8b2040" },
    lord_of_regret: { name: "Lord of Regret", pattern: "flame", wiki: "https://hot.fandom.com/wiki/Lord_of_Regret", hp: 2600, speed: 56, dmg: 24, r: 38, color: "#c04020" },
    lord_of_despair: { name: "Lord of Despair", pattern: "despair", wiki: "https://hot.fandom.com/wiki/Lord_of_Despair", hp: 3000, speed: 52, dmg: 26, r: 40, color: "#6070a0" },
    lord_of_hate: { name: "Lord of Hate", pattern: "frost", wiki: "https://hot.fandom.com/wiki/Lord_of_Hate", hp: 3200, speed: 50, dmg: 26, r: 40, color: "#60a0c0" },
    lord_of_discord: { name: "Lord of Discord", pattern: "discord", wiki: "https://hot.fandom.com/wiki/Chambers_of_Dissonance", hp: 3400, speed: 56, dmg: 28, r: 40, color: "#a04090" },
    lord_of_greed: { name: "Lord of Greed", pattern: "greed", wiki: "https://hot.fandom.com/wiki/The_Vault", hp: 4000, speed: 54, dmg: 30, r: 42, color: "#d4a84b" },
    lord_of_blight: { name: "Lord of Blight", pattern: "blight", wiki: "https://hot.fandom.com/wiki/Boglands", hp: 3600, speed: 52, dmg: 28, r: 40, color: "#408050" },
  };

  /**
   * Traits (wiki-style ranks). minLevel = when trait enters pool.
   * cat: base | weapon | ability
   * maxRank: how many times can stack in one run
   */
  const TRAITS = [
    // Base — early
    { id: "vitality", name: "Vitality", cat: "base", minLevel: 1, maxRank: 5, desc: "+25 Max HP & heal 25", apply: (p) => { p.maxHp += 25; p.hp = Math.min(p.maxHp, p.hp + 25); } },
    { id: "agility", name: "Agility", cat: "base", minLevel: 1, maxRank: 5, desc: "+12% Move Speed", apply: (p) => { p.speed *= 1.12; } },
    { id: "defense", name: "Defense", cat: "base", minLevel: 1, maxRank: 5, desc: "+8 Defense", apply: (p) => { p.defense = (p.defense || 0) + 8; } },
    { id: "regeneration", name: "Regeneration", cat: "base", minLevel: 2, maxRank: 5, desc: "+0.4 HP/s", apply: (p) => { p.regen = (p.regen || 0) + 0.4; } },
    { id: "pickup", name: "Pickup Radius", cat: "base", minLevel: 2, maxRank: 3, desc: "+30% Pickup range", apply: (p) => { p.pickupRange = (p.pickupRange || 80) * 1.3; } },
    // Weapon
    { id: "power", name: "Power", cat: "weapon", minLevel: 1, maxRank: 5, desc: "+18% Main Weapon Damage", apply: (p) => { p.damage *= 1.18; } },
    { id: "quickdraw", name: "Quick Hands", cat: "weapon", minLevel: 1, maxRank: 5, desc: "+12% Attack Speed", apply: (p) => { p.attackCooldown *= 0.88; } },
    { id: "reach", name: "Vanguard", cat: "weapon", minLevel: 1, maxRank: 4, desc: "+15% Range", apply: (p) => { p.attackRange *= 1.15; } },
    { id: "barrage", name: "Multistrike", cat: "weapon", minLevel: 3, maxRank: 4, desc: "+1 proj / wider melee / +jump", apply: (p) => { p.extraProjectiles = (p.extraProjectiles || 0) + 1; p.meleeArc = (p.meleeArc || 1.1) + 0.3; p.chainJumps = (p.chainJumps || 2) + 1; p.multistrike = (p.multistrike || 1) + 0.4; } },
    { id: "deadliness", name: "Cunning", cat: "weapon", minLevel: 2, maxRank: 5, desc: "+7% Crit Chance", apply: (p) => { p.critChance = Math.min(0.9, (p.critChance || 0.2) + 0.07); } },
    { id: "cruel", name: "Ruthlessness", cat: "weapon", minLevel: 3, maxRank: 4, desc: "+22% Crit Bonus", apply: (p) => { p.critBonus = (p.critBonus || 0.65) + 0.22; } },
    { id: "channeling", name: "Channeling", cat: "weapon", minLevel: 4, maxRank: 3, desc: "+1 Pierce / chain jump", apply: (p) => { p.pierce = (p.pierce || 0) + 1; p.chainJumps = (p.chainJumps || 2) + 1; } },
    { id: "impact", name: "Impact", cat: "weapon", minLevel: 5, maxRank: 4, desc: "+15% Damage", apply: (p) => { p.damage *= 1.15; } },
    { id: "force", name: "Force", cat: "weapon", minLevel: 3, maxRank: 4, desc: "+0.25 Force (knockback / pierce falloff)", apply: (p) => { p.force = (p.force || 1) + 0.25; p.pierce = (p.pierce || 0) + 1; } },
    { id: "block_str", name: "Bulwark", cat: "base", minLevel: 2, maxRank: 4, desc: "+12 Block Strength", apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 12; } },
    { id: "effect_chance", name: "Affliction", cat: "base", minLevel: 4, maxRank: 3, desc: "+20% Effect Chance", apply: (p) => { p.effectChance = (p.effectChance || 0) + 0.2; } },
    { id: "xp_gain", name: "Dedication", cat: "base", minLevel: 3, maxRank: 3, desc: "+12% XP Gain", apply: (p) => { p.xpGain = (p.xpGain || 1) * 1.12; } },
    // Ability-focused (need ≥1 ability)
    { id: "ability_power", name: "Ability Power", cat: "ability", minLevel: 2, maxRank: 5, needAbility: true, desc: "+15% Ability Damage", apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.15; } },
    { id: "ability_haste", name: "Ability Haste", cat: "ability", minLevel: 2, maxRank: 5, needAbility: true, desc: "Ability CD −12%", apply: (p) => { p.abilityCdMul = (p.abilityCdMul || 1) * 0.88; } },
    { id: "ability_area", name: "Expanded Aura", cat: "ability", minLevel: 4, maxRank: 3, needAbility: true, desc: "+15% Ability AOE/Range", apply: (p) => { p.abilityRangeMul = (p.abilityRangeMul || 1) * 1.15; } },
    { id: "ability_crit", name: "Arcane Crit", cat: "ability", minLevel: 5, maxRank: 3, needAbility: true, desc: "+8% Ability Crit", apply: (p) => { p.abilityCritAdd = (p.abilityCritAdd || 0) + 0.08; } },
  ];

  /**
   * Ability upgrades (wiki names, up to 3; max 2 chosen per ability per run).
   * Flags: splitOnCrit, pulseOnExpire, applySlow, burn, electrify, decay, fragile, mark, doubleGolem, chainPulse…
   */
  const ABILITY_UPGRADES = {
    phantom_needles: [
      { id: "phantom_split", name: "Phantom Split", desc: "Crit tách kim · +15 base feel · count+1 pierce+1", apply: (i) => { i.splitOnCrit = true; i.countAdd = (i.countAdd || 0) + 1; i.pierceAdd = (i.pierceAdd || 0) + 1; i.dmgMul = (i.dmgMul || 1) * 1.15; } },
      { id: "phantom_rift", name: "Phantom Rift", desc: "Kim tan → nổ AOE magic", apply: (i) => { i.pulseOnExpire = true; i.aoeMul = (i.aoeMul || 1) * 1.2; } },
      { id: "phantom_fetters", name: "Phantom Fetters", desc: "Gây Slow · +crit vs slowed", apply: (i) => { i.applySlow = true; i.critVsSlow = true; i.dmgMul = (i.dmgMul || 1) * 1.1; } },
    ],
    arcane_splinters: [
      { id: "arcane_elements", name: "Arcane Elements", desc: "Count +3 · elemental tint", apply: (i) => { i.countAdd = (i.countAdd || 0) + 3; i.markOnHit = true; } },
      { id: "arcane_shivers", name: "Arcane Shivers", desc: "Damage +35% · slow chance", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.applySlow = true; } },
      { id: "arcane_focus", name: "Arcane Focus", desc: "ASP +30% · pierce +1", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.3; i.pierceAdd = (i.pierceAdd || 0) + 1; } },
    ],
    astronomers_orbs: [
      { id: "inner_orbit", name: "Inner Orbit", desc: "+1 orb · lane radius mix", apply: (i) => { i.countAdd = (i.countAdd || 0) + 1; i.radiusAdd = (i.radiusAdd || 0) + 12; i.innerOrbit = true; } },
      { id: "electrified_orbs", name: "Electrified Orbs", desc: "Dmg +35% · Electrify on hit", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.electrify = true; } },
      { id: "orbital_shift", name: "Orbital Shift", desc: "Eccentric orbit · dmg +25%", apply: (i) => { i.eccentric = true; i.dmgMul = (i.dmgMul || 1) * 1.25; i.radiusAdd = (i.radiusAdd || 0) + 18; } },
    ],
    lightning_strikes: [
      { id: "thunder_choir", name: "Thunder Choir", desc: "+2 bolts · Electrify", apply: (i) => { i.countAdd = (i.countAdd || 0) + 2; i.electrify = true; } },
      { id: "concentrated", name: "Concentrated Strikes", desc: "Damage +40%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.4; } },
      { id: "storm_tempo", name: "Storm Tempo", desc: "ASP +35%", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.35; } },
    ],
    flame_strike: [
      { id: "scattered_sparks", name: "Scattered Sparks", desc: "Burn on hit · count +2", apply: (i) => { i.burn = true; i.countAdd = (i.countAdd || 0) + 2; } },
      { id: "incineration", name: "Incineration", desc: "Damage +35% · Burn stacks", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.burn = true; i.burnMul = 1.5; } },
      { id: "frost_strike", name: "Frost Strike", desc: "Cũng gây Slow · dmg +20%", apply: (i) => { i.applySlow = true; i.dmgMul = (i.dmgMul || 1) * 1.2; } },
    ],
    frost_avalanche: [
      { id: "glacier", name: "Glacier", desc: "AOE +35% · Slow mạnh", apply: (i) => { i.aoeMul = (i.aoeMul || 1) * 1.35; i.applySlow = true; } },
      { id: "deep_freeze", name: "Deep Freeze", desc: "Damage +35% · Fragile", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.fragile = true; } },
      { id: "blizzard", name: "Blizzard", desc: "ASP +30%", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.3; } },
    ],
    hailstorm: [
      { id: "ice_rain", name: "Ice Rain", desc: "Count +4 · Slow", apply: (i) => { i.countAdd = (i.countAdd || 0) + 4; i.applySlow = true; } },
      { id: "hailstones", name: "Hailstones", desc: "Damage +30%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.3; } },
      { id: "whiteout", name: "Whiteout", desc: "AOE +25% · Fragile", apply: (i) => { i.aoeMul = (i.aoeMul || 1) * 1.25; i.fragile = true; } },
    ],
    ring_blades: [
      { id: "blade_ring", name: "Blade Ring", desc: "+2 blades", apply: (i) => { i.countAdd = (i.countAdd || 0) + 2; } },
      { id: "whirl", name: "Whirl", desc: "Spin +40% · dmg +20%", apply: (i) => { i.spinMul = (i.spinMul || 1) * 1.4; i.dmgMul = (i.dmgMul || 1) * 1.2; } },
      { id: "cutting_edge", name: "Cutting Edge", desc: "Mark on hit · dmg +25%", apply: (i) => { i.markOnHit = true; i.dmgMul = (i.dmgMul || 1) * 1.25; } },
    ],
    transfixion: [
      { id: "deep_shot", name: "Deep Shot", desc: "Pierce +3 · dmg +20%", apply: (i) => { i.pierceAdd = (i.pierceAdd || 0) + 3; i.dmgMul = (i.dmgMul || 1) * 1.2; } },
      { id: "arrow_fan", name: "Arrow Fan", desc: "Count +2", apply: (i) => { i.countAdd = (i.countAdd || 0) + 2; } },
      { id: "barbed", name: "Barbed Tips", desc: "Fragile on hit · dmg +15%", apply: (i) => { i.fragile = true; i.dmgMul = (i.dmgMul || 1) * 1.15; } },
    ],
    dragons_breath: [
      { id: "heat_blast", name: "Heat Blast", desc: "Count +4 · Burn", apply: (i) => { i.countAdd = (i.countAdd || 0) + 4; i.burn = true; i.dmgMul = (i.dmgMul || 1) * 1.2; } },
      { id: "dragon_fury", name: "Dragon Fury", desc: "ASP +40%", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.4; } },
      { id: "refined_flame", name: "Refined Flame", desc: "Damage +30% · Burn+", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.3; i.burn = true; i.burnMul = 1.6; } },
    ],
    radiant_aura: [
      { id: "blessing", name: "Blessing", desc: "Heal +4 · AOE +20%", apply: (i) => { i.healAdd = (i.healAdd || 0) + 4; i.aoeMul = (i.aoeMul || 1) * 1.2; } },
      { id: "holy_fire", name: "Holy Fire", desc: "Damage +35% · Mark", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.markOnHit = true; } },
      { id: "sanctuary", name: "Sanctuary", desc: "ASP +25% · heal +2", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.25; i.healAdd = (i.healAdd || 0) + 2; } },
    ],
    clay_golem: [
      { id: "double_trouble", name: "Double Trouble", desc: "+1 golem (wiki)", apply: (i) => { i.countAdd = (i.countAdd || 0) + 1; } },
      { id: "magma_fists", name: "Magma Fists", desc: "Burn · dmg +30%", apply: (i) => { i.burn = true; i.dmgMul = (i.dmgMul || 1) * 1.3; } },
      { id: "earthen_trails", name: "Earthen Trails", desc: "Decay · dmg +25%", apply: (i) => { i.decay = true; i.dmgMul = (i.dmgMul || 1) * 1.25; } },
    ],
    meteor_strike: [
      { id: "meteor_shower", name: "Meteor Shower", desc: "+2 meteors", apply: (i) => { i.countAdd = (i.countAdd || 0) + 2; } },
      { id: "impact_crater", name: "Impact Crater", desc: "AOE +30% · Burn", apply: (i) => { i.aoeMul = (i.aoeMul || 1) * 1.3; i.burn = true; i.dmgMul = (i.dmgMul || 1) * 1.15; } },
      { id: "cataclysm", name: "Cataclysm", desc: "Damage +40%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.4; } },
    ],
    kugelblitz: [
      { id: "static_attraction", name: "Static Attraction", desc: "Homing mạnh · dmg +20%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.2; i.strongHoming = true; } },
      { id: "high_voltage", name: "High Voltage", desc: "Electrify · pulse dmg +30%", apply: (i) => { i.electrify = true; i.dmgMul = (i.dmgMul || 1) * 1.3; } },
      { id: "final_discharge", name: "Final Discharge", desc: "Hết hạn nổ lớn", apply: (i) => { i.pulseOnExpire = true; i.aoeMul = (i.aoeMul || 1) * 1.4; } },
    ],
    arcane_rift: [
      { id: "wandering_rifts", name: "Wandering Rifts", desc: "+2 rifts", apply: (i) => { i.countAdd = (i.countAdd || 0) + 2; } },
      { id: "unstable_rift", name: "Unstable Rift", desc: "Damage +35% · Mark", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.markOnHit = true; } },
      { id: "arcane_elements_rift", name: "Arcane Cascade", desc: "Fragile · AOE +20%", apply: (i) => { i.fragile = true; i.aoeMul = (i.aoeMul || 1) * 1.2; } },
    ],
    spirit_warrior: [
      { id: "twin_warriors", name: "Twin Warriors", desc: "+1 spirit (max 2 feel)", apply: (i) => { i.countAdd = (i.countAdd || 0) + 1; } },
      { id: "dash_impact", name: "Dash Impact", desc: "Dash shockwave · dmg +25%", apply: (i) => { i.dashBoom = true; i.dmgMul = (i.dmgMul || 1) * 1.25; } },
      { id: "spirit_needles", name: "Spirit Needles", desc: "Extra needle feel · dmg +20%", apply: (i) => { i.spiritNeedles = true; i.dmgMul = (i.dmgMul || 1) * 1.2; } },
    ],
    morning_star: [
      { id: "spiked_chain", name: "Spiked Chain", desc: "Xích dmg + Slow", apply: (i) => { i.chainDamage = true; i.applySlow = true; i.dmgMul = (i.dmgMul || 1) * 1.15; } },
      { id: "unleashed_stars", name: "Unleashed Stars", desc: "Hit chance bounce · dmg +25%", apply: (i) => { i.unleashed = true; i.dmgMul = (i.dmgMul || 1) * 1.25; } },
      { id: "butterfly_swing", name: "Butterfly Swing", desc: "+1 star", apply: (i) => { i.countAdd = (i.countAdd || 0) + 1; } },
    ],
    spectral_fists: [
      { id: "ground_pound", name: "Ground Pound", desc: "Shockwave giữa đòn · AOE+", apply: (i) => { i.groundPound = true; i.aoeMul = (i.aoeMul || 1) * 1.25; } },
      { id: "spectral_clutch", name: "Spectral Clutch", desc: "Slow on hit · dmg +25%", apply: (i) => { i.applySlow = true; i.dmgMul = (i.dmgMul || 1) * 1.25; } },
      { id: "consecutive", name: "Consecutive Punches", desc: "ASP +40%", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.4; } },
    ],
    confetti_cannon: [
      { id: "party_harder", name: "Party Harder", desc: "Count +4", apply: (i) => { i.countAdd = (i.countAdd || 0) + 4; } },
      { id: "confetti_boom", name: "Confetti Boom", desc: "Damage +30%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.3; } },
      { id: "glitter", name: "Glitter Bomb", desc: "Mark · Fragile", apply: (i) => { i.markOnHit = true; i.fragile = true; } },
    ],
    kick_bass: [
      { id: "subwoofer", name: "Subwoofer", desc: "AOE +30%", apply: (i) => { i.aoeMul = (i.aoeMul || 1) * 1.3; } },
      { id: "drop_bass", name: "Drop the Bass", desc: "Damage +35% · knock+", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; i.knockback = true; } },
      { id: "feedback", name: "Feedback", desc: "Fragile · ASP +20%", apply: (i) => { i.fragile = true; i.aspMul = (i.aspMul || 1) * 1.2; } },
    ],
    killer_riff: [
      { id: "sustained_note", name: "Sustained Note", desc: "Pierce +4 · dmg +25%", apply: (i) => { i.pierceAdd = (i.pierceAdd || 0) + 4; i.dmgMul = (i.dmgMul || 1) * 1.25; } },
      { id: "encore", name: "Encore", desc: "ASP +35%", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.35; } },
      { id: "shred", name: "Shred", desc: "Mark on hit", apply: (i) => { i.markOnHit = true; i.dmgMul = (i.dmgMul || 1) * 1.15; } },
    ],
    mosh_pit: [
      { id: "circle_pit", name: "Circle Pit", desc: "AOE +25%", apply: (i) => { i.aoeMul = (i.aoeMul || 1) * 1.25; } },
      { id: "crowd_killer", name: "Crowd Killer", desc: "Damage +35%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; } },
      { id: "stage_dive", name: "Stage Dive", desc: "Knockback · Fragile", apply: (i) => { i.knockback = true; i.fragile = true; } },
    ],
    pyrotechnics: [
      { id: "fireworks", name: "Fireworks", desc: "+2 bursts · Burn", apply: (i) => { i.countAdd = (i.countAdd || 0) + 2; i.burn = true; } },
      { id: "grand_finale", name: "Grand Finale", desc: "Damage +30%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.3; } },
      { id: "sparklers", name: "Sparklers", desc: "ASP +25% · Burn", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.25; i.burn = true; } },
    ],
    wall_of_death: [
      { id: "double_wall", name: "Double Wall", desc: "Wider sweep", apply: (i) => { i.countAdd = (i.countAdd || 0) + 1; i.aoeMul = (i.aoeMul || 1) * 1.15; } },
      { id: "crushing_wave", name: "Crushing Wave", desc: "Damage +35%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.35; } },
      { id: "pit_wall", name: "Pit Wall", desc: "Fragile · Knock", apply: (i) => { i.fragile = true; i.knockback = true; } },
    ],
    enlightenment: [
      { id: "inner_light", name: "Inner Light", desc: "Damage +40%", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.4; } },
      { id: "clarity", name: "Clarity", desc: "ASP +30% · Mark", apply: (i) => { i.aspMul = (i.aspMul || 1) * 1.3; i.markOnHit = true; } },
      { id: "beam_focus", name: "Beam Focus", desc: "Pierce +4", apply: (i) => { i.pierceAdd = (i.pierceAdd || 0) + 4; } },
    ],
    prismatic_cascade: [
      { id: "spectrum", name: "Spectrum", desc: "Count +4", apply: (i) => { i.countAdd = (i.countAdd || 0) + 4; } },
      { id: "prism_core", name: "Prism Core", desc: "Damage +30% · Mark", apply: (i) => { i.dmgMul = (i.dmgMul || 1) * 1.3; i.markOnHit = true; } },
      { id: "element_mix", name: "Element Mix", desc: "Burn + Electrify chance", apply: (i) => { i.burn = true; i.electrify = true; } },
    ],
    undergrowth: [
      { id: "thicket", name: "Thicket", desc: "Count +3 · AOE +20%", apply: (i) => { i.countAdd = (i.countAdd || 0) + 3; i.aoeMul = (i.aoeMul || 1) * 1.2; } },
      { id: "decay_bloom", name: "Decay Bloom", desc: "Decay · dmg +35%", apply: (i) => { i.decay = true; i.dmgMul = (i.dmgMul || 1) * 1.35; } },
      { id: "roots", name: "Grasping Roots", desc: "Slow · Fragile", apply: (i) => { i.applySlow = true; i.fragile = true; } },
    ],
  };

  /**
   * Per-ability trait templates (wiki Ability Traits simplified).
   * Bound to a specific owned ability at level-up.
   */
  const ABILITY_TRAIT_TEMPLATES = [
    { key: "fire_rate", name: "Fire Rate", maxRank: 5, desc: "+12% Attack Speed ({ab})", apply: (p, inst) => { inst.aspMul = (inst.aspMul || 1) * 1.12; } },
    { key: "sharpness", name: "Sharpness", maxRank: 5, desc: "+18% Damage ({ab})", apply: (p, inst) => { inst.dmgMul = (inst.dmgMul || 1) * 1.18; } },
    { key: "spin", name: "Spin / Crit Bonus", maxRank: 4, desc: "+20% Crit Bonus ({ab})", apply: (p, inst) => { inst.critBonusAdd = (inst.critBonusAdd || 0) + 0.2; } },
    { key: "puncture", name: "Puncture", maxRank: 4, desc: "+1 Pierce · +12% Range ({ab})", apply: (p, inst) => { inst.pierceAdd = (inst.pierceAdd || 0) + 1; inst.rangeMul = (inst.rangeMul || 1) * 1.12; } },
    { key: "pinpoint", name: "Pinpoint", maxRank: 3, desc: "+5% Crit Chance ({ab})", apply: (p, inst) => { inst.critChanceAdd = (inst.critChanceAdd || 0) + 0.05; } },
    { key: "power_flat", name: "Power", maxRank: 3, desc: "+12% Damage ({ab})", apply: (p, inst) => { inst.dmgMul = (inst.dmgMul || 1) * 1.12; } },
    { key: "coverage", name: "Coverage", maxRank: 3, desc: "+15% AOE/Radius ({ab})", apply: (p, inst) => { inst.aoeMul = (inst.aoeMul || 1) * 1.15; inst.radiusAdd = (inst.radiusAdd || 0) + 8; } },
    { key: "multibody", name: "Multistrike", maxRank: 3, desc: "+1 count/orb ({ab})", apply: (p, inst) => { inst.countAdd = (inst.countAdd || 0) + 1; } },
  ];

  /** Main-weapon proficiency traits by hero combat style */
  const WEAPON_PROF = {
    melee: [
      { id: "wp_cleave", name: "Cleave", cat: "weapon_prof", minLevel: 2, maxRank: 4, styles: ["melee", "lute", "spear"], desc: "Melee arc +0.25 · dmg +8%", apply: (p) => { p.meleeArc = (p.meleeArc || 1.1) + 0.25; p.damage *= 1.08; } },
      { id: "wp_blade", name: "Blade Mastery", cat: "weapon_prof", minLevel: 3, maxRank: 3, styles: ["melee", "lute", "dualaxe", "spear"], desc: "ASP +10% · crit +4%", apply: (p) => { p.attackCooldown *= 0.9; p.critChance = Math.min(0.9, (p.critChance || 0.2) + 0.04); } },
    ],
    hammer: [
      { id: "wp_bash", name: "Shield Bash Form", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["hammer"], desc: "Range +12% · Def +6", apply: (p) => { p.attackRange *= 1.12; p.defense = (p.defense || 0) + 6; } },
    ],
    dualaxe: [
      { id: "wp_frost_edge", name: "Frost Edge", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["dualaxe"], desc: "Main hits apply Slow · dmg +10%", apply: (p) => { p.weaponSlow = true; p.damage *= 1.1; } },
    ],
    arrow: [
      { id: "wp_archery", name: "Archery Master", cat: "weapon_prof", minLevel: 2, maxRank: 4, styles: ["arrow"], desc: "+1 projectile · range +10%", apply: (p) => { p.extraProjectiles = (p.extraProjectiles || 0) + 1; p.attackRange *= 1.1; } },
      { id: "wp_eagle", name: "Eagle Eye", cat: "weapon_prof", minLevel: 3, maxRank: 3, styles: ["arrow", "gun"], desc: "Crit +6% · crit dmg +15%", apply: (p) => { p.critChance = Math.min(0.9, (p.critChance || 0.2) + 0.06); p.critBonus = (p.critBonus || 0.65) + 0.15; } },
    ],
    flame: [
      { id: "wp_inferno", name: "Inferno", cat: "weapon_prof", minLevel: 2, maxRank: 4, styles: ["flame"], desc: "Main hits Burn · dmg +10%", apply: (p) => { p.weaponBurn = true; p.damage *= 1.1; } },
    ],
    chain: [
      { id: "wp_storm", name: "Storm Caller", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["chain", "specter"], desc: "+1 chain jump · Electrify chance", apply: (p) => { p.chainJumps = (p.chainJumps || 2) + 1; p.weaponElectrify = true; } },
    ],
    scepter: [
      { id: "wp_holy", name: "Holy Focus", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["scepter"], desc: "Heal 2 on hit · dmg +8%", apply: (p) => { p.weaponHealOnHit = 2; p.damage *= 1.08; } },
    ],
    gun: [
      { id: "wp_marksman", name: "Marksman", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["gun"], desc: "Crit bonus +25% · range +12%", apply: (p) => { p.critBonus = (p.critBonus || 0.65) + 0.25; p.attackRange *= 1.12; } },
    ],
    plants: [
      { id: "wp_decay", name: "Blight Touch", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["plants"], desc: "Main hits Decay · dmg +10%", apply: (p) => { p.weaponDecay = true; p.damage *= 1.1; } },
    ],
    flask: [
      { id: "wp_prism", name: "Chromatic", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["flask"], desc: "Mark on hit · dmg +10%", apply: (p) => { p.weaponMark = true; p.damage *= 1.1; } },
    ],
    spear: [
      { id: "wp_thrust", name: "Hound Spear", cat: "weapon_prof", minLevel: 2, maxRank: 3, styles: ["spear"], desc: "Range +15% · dmg +10%", apply: (p) => { p.attackRange *= 1.15; p.damage *= 1.1; } },
    ],
  };

  /**
   * Balance — short browser runs (5/10/15m) + Agony/Torment.
   * Curve: early breathing room → mid ramp → late pressure → boss spike.
   */
  const BALANCE = {
    xpMul: 1.14,
    goldMul: 1.18,
    /** Spawn interval multiplier in first ~20% of run (higher = slower) */
    earlySpawnEase: 1.32,
    /** Soft global player weapon dmg (abilities use own scales) */
    playerDmgMul: 1.05,
    /** Compress hallStrength max a bit so late isn't absurd */
    hallStrengthEase: 0.86,
    /** XP bump after mid-run so builds come online */
    lateXpBoost: 0.16,
    /** Extra enemy pressure by run progress (0→1) */
    lateEnemyHpBoost: 0.28,
    lateEnemyDmgBoost: 0.18,
    lateSpawnBoost: 0.22,
    /** Boss fight length / punch */
    bossHpMul: 1.32,
    bossDmgMul: 1.1,
    /** Level-up reroll base gold cost (run gold) */
    rerollBaseCost: 25,
    rerollCostScale: 1.65,
    maxRerollsPerLevel: 8,
  };

  /**
   * Marks (wiki Mark of the Fallen style) — permanent per-hero, paid with bank gold.
   * All available (no quest). Auto-applies when playing matching hero.
   */
  /**
   * Marks (wiki full list — 14). Any hero can equip any owned mark (meta.activeMark).
   * Primary effects match wiki; class traits unlocked in full game (noted in desc).
   */
  const MARKS = {
    swordsman: {
      id: "swordsman", hero: "swordsman", name: "Mark of the Sword",
      desc: "Swordsman traits · +10 Base Damage · +10 Base Defense", color: "#c04040", cost: 600,
      apply: (p) => { p.damage += 10; p.defense = (p.defense || 0) + 10; p.markTraitPool = "swordsman"; },
    },
    archer: {
      id: "archer", hero: "archer", name: "Mark of the Arrow",
      desc: "Archer traits · +0.10 Base Crit Chance", color: "#60a050", cost: 600,
      apply: (p) => { p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.1); p.markTraitPool = "archer"; },
    },
    exterminator: {
      id: "exterminator", hero: "exterminator", name: "Mark of Incineration",
      desc: "Exterminator traits · 10% Burn (Main Weapon, scales w/ level)", color: "#e05020", cost: 650,
      apply: (p) => {
        p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.1;
        p.markBurnScales = true;
        p.markTraitPool = "exterminator";
      },
    },
    shield_maiden: {
      id: "shield_maiden", hero: "shield_maiden", name: "Mark of the Shield",
      desc: "Shield Maiden traits · Block Strength multiplies into Damage", color: "#8090b0", cost: 600,
      apply: (p) => { p.markBlockToDamage = true; p.blockStrength = (p.blockStrength || 0) + 6; p.markTraitPool = "shield_maiden"; },
    },
    cleric: {
      id: "cleric", hero: "cleric", name: "Mark of Sanctity",
      desc: "Cleric traits · 20% Affliction/Fragile on Main Weapon", color: "#e0d080", cost: 600,
      apply: (p) => {
        p.weaponFragileChance = (p.weaponFragileChance || 0) + 0.2;
        p.effectChance = (p.effectChance || 0) + 0.1;
        p.markTraitPool = "cleric";
      },
    },
    warlock: {
      id: "warlock", hero: "warlock", name: "Mark of Rituals",
      desc: "Warlock traits · Summons a Skeleton Mage support", color: "#8040c0", cost: 650,
      apply: (p) => { p.markSkeletonMage = true; p.summonDmgMul = (p.summonDmgMul || 1) * 1.1; p.markTraitPool = "warlock"; },
    },
    sorceress: {
      id: "sorceress", hero: "sorceress", name: "Mark of Sorcery",
      desc: "Sorceress traits · 50% Electrify (Spark) on Crit (Main)", color: "#5080e0", cost: 650,
      apply: (p) => { p.markSparkOnCrit = 0.5; p.weaponSparkChance = (p.weaponSparkChance || 0) + 0.05; p.markTraitPool = "sorceress"; },
    },
    norseman: {
      id: "norseman", hero: "norseman", name: "Mark of the North",
      desc: "Norseman traits · Every 250 Main hits → Frost Nova", color: "#80b0d0", cost: 650,
      apply: (p) => { p.markFrostNovaEvery = 250; p.markFrostHits = 0; p.markTraitPool = "norseman"; },
    },
    beast_huntress: {
      id: "beast_huntress", hero: "beast_huntress", name: "Mark of the Beast",
      desc: "Beast Huntress traits · Take the Hound for a walk", color: "#a07040", cost: 650,
      apply: (p) => { p.markHound = true; p.summonDmgMul = (p.summonDmgMul || 1) * 1.12; p.markTraitPool = "beast_huntress"; },
    },
    landsknecht: {
      id: "landsknecht", hero: "landsknecht", name: "Mark of the Grenadier",
      desc: "Landsknecht traits · Grenades when damaging with projectiles", color: "#c08040", cost: 650,
      apply: (p) => { p.markGrenades = true; p.markTraitPool = "landsknecht"; },
    },
    sage: {
      id: "sage", hero: "sage", name: "Mark of Knowledge",
      desc: "Sage traits · Ability scrolls act as tomes · 3rd upgrade (Sage)", color: "#90a0c0", cost: 700,
      apply: (p) => {
        p.markScrollsAsTomes = true;
        p.markExtraAbilityUpgrade = true;
        p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.08;
        p.markTraitPool = "sage";
      },
    },
    bard: {
      id: "bard", hero: "bard", name: "Mark of the Song",
      desc: "Bard traits · Select a Music ability at run start", color: "#d0a060", cost: 600,
      apply: (p) => { p.markMusicPick = true; p.pickupRange = (p.pickupRange || 80) * 1.08; p.markTraitPool = "bard"; },
    },
    crone: {
      id: "crone", hero: "crone", name: "Mark of Growth",
      desc: "Crone traits · Summons plants over time and while moving", color: "#608040", cost: 700,
      apply: (p) => { p.markBogPlants = true; p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.05; p.markTraitPool = "crone"; },
    },
    alchemist: {
      id: "alchemist", hero: "alchemist", name: "Mark of Alchemy",
      desc: "Alchemist traits · Throws flasks with acquired elements", color: "#80c060", cost: 700,
      apply: (p) => { p.markAlchemyFlasks = true; p.effectChance = (p.effectChance || 0) + 0.08; p.markTraitPool = "alchemist"; },
    },
  };
  const MARK_ORDER = [
    "swordsman", "archer", "exterminator", "shield_maiden", "cleric", "warlock",
    "sorceress", "norseman", "beast_huntress", "landsknecht", "sage", "bard", "crone", "alchemist",
  ];

  /** Default user settings (persisted separately) */
  const DEFAULT_SETTINGS = {
    masterVol: 0.55,
    sfx: true,
    shake: true,
    gamepad: true,
    /** Cần xoay ảo (mobile) — ẩn/hiện trong Cài đặt */
    joystick: true,
  };

  /** Run length — Hall & Torment: 5 / 10 / 15 phút */
  const RUN_DURATIONS = [
    { id: "5", sec: 5 * 60, label: "5 phút", blurb: "Nhanh" },
    { id: "10", sec: 10 * 60, label: "10 phút", blurb: "Trung bình" },
    { id: "15", sec: 15 * 60, label: "15 phút", blurb: "Dài hơn" },
  ];

  /** Same options for Torment (shared list; ids can match Hall) */
  const TORMENT_DURATIONS = [
    { id: "5", sec: 5 * 60, label: "5 phút", blurb: "Torment nhanh" },
    { id: "10", sec: 10 * 60, label: "10 phút", blurb: "Torment trung" },
    { id: "15", sec: 15 * 60, label: "15 phút", blurb: "Torment dài" },
  ];

  /**
   * Agony (wiki): hard mode per hall after beating Lord.
   * Rank 1..5 · meter fills over time (~4m48s per rank on 30m).
   * XP bonus per rank varies by hall.
   */
  const AGONY = {
    maxRank: 5,
    // seconds of pure time to gain 1 full rank (wiki ~288s)
    secPerRank: 4 * 60 + 48,
    // scaled for short runs: still progress ranks over full runDuration
    scaleMeterToRun: true,
    // Each Agony rank should feel clearly harder
    enemyHpPerRank: 0.16,
    enemyDmgPerRank: 0.07,
    enemySpdPerRank: 0.025,
    spawnPerRank: 0.12,
    championBaseInterval: 44,
    championIntervalCutPerRank: 8,
    xpPerRankByHall: {
      haunted_caverns: 0.529,
      ember_grounds: 0.31,
      forgotten_viaduct: 0.24,
      frozen_depths: 0.395,
      chambers_of_dissonance: 0.13,
      the_vault: 0.2,
      boglands: 0.25,
    },
  };

  /**
   * Torment Artifacts — wiki 1:1 (48). Toggle any on Torment; each counts as +1 art.
   * Numeric muls feed getDiffMods; flags (flag*) drive runtime hooks in game.js.
   */
  const ARTIFACTS = {
    hastening_sands: {
      id: "hastening_sands", name: "Hastening Sands", color: "#d4a84b",
      desc: "−10 min run time · +30% spawn · +20% MS (all)",
      runTimeCutSec: 600, spawnMul: 1.3, playerSpdMul: 1.2, enemySpdMul: 1.2,
    },
    mountain_idol: {
      id: "mountain_idol", name: "Mountain Idol", color: "#a09080",
      desc: "Spawns large slow tanky enemies",
      flagMountainIdol: true, enemyHpMul: 1.08, enemySpdMul: 0.94, spawnMul: 0.95, eliteMul: 1.15,
    },
    torment_banner: {
      id: "torment_banner", name: "Torment Banner", color: "#c04040",
      desc: "Spawns additional basic enemies all run",
      spawnMul: 1.35, flagExtraBasics: true,
    },
    tricksters_chime: {
      id: "tricksters_chime", name: "Trickster's Chime", color: "#c080e0",
      desc: "Adds traps to the Halls",
      flagTraps: true, enemyDmgMul: 1.05,
    },
    archeologists_thread: {
      id: "archeologists_thread", name: "Archeologist's Thread", color: "#d0b070",
      desc: "Uncommon item shrine · +1 ability on Champions",
      flagUncommonShrine: true, flagChampAbility: true, champMul: 0.95,
    },
    restless_wheel: {
      id: "restless_wheel", name: "Restless Wheel", color: "#e08040",
      desc: "Agony ranks increase much faster",
      agonyMeterMul: 2.2, flagFastAgony: true,
    },
    magma_vessel: {
      id: "magma_vessel", name: "Magma Vessel", color: "#e05020",
      desc: "Lava eruptions near you (hurt you & foes)",
      flagMagmaVessel: true,
    },
    fallen_star: {
      id: "fallen_star", name: "Fallen Star", color: "#a0c0ff",
      desc: "Crystals rain · damage you and enemies",
      flagFallenStar: true,
    },
    malignant_mirror: {
      id: "malignant_mirror", name: "Malignant Mirror", color: "#8060a0",
      desc: "Three Lords at end instead of one",
      flagTripleLord: true, minibossMul: 1.15,
    },
    living_darkness: {
      id: "living_darkness", name: "Living Darkness", color: "#302040",
      desc: "Black fog reduces vision range",
      flagFog: true, visionMul: 0.55,
    },
    curse_of_commitment: {
      id: "curse_of_commitment", name: "Curse of Commitment", color: "#a06080",
      desc: "Uncommon/Rare gear cannot be unequipped/discarded",
      flagCommitGear: true,
    },
    killing_gaze: {
      id: "killing_gaze", name: "Killing Gaze", color: "#c06060",
      desc: "Extra ranged enemies the whole run",
      spawnMul: 1.12, flagExtraRanged: true, enemyDmgMul: 1.06,
    },
    scorched_hand: {
      id: "scorched_hand", name: "Scorched Hand", color: "#e06020",
      desc: "Everything has 20% chance to Burn on hit",
      flagGlobalBurn: true, globalBurnChance: 0.2,
    },
    scales_of_pain: {
      id: "scales_of_pain", name: "Scales of Pain", color: "#c04050",
      desc: "+100% Damage (Player) · +50% Damage (Enemies)",
      playerDmgMul: 2.0, enemyDmgMul: 1.5,
    },
    confusing_lens: {
      id: "confusing_lens", name: "Confusing Lens", color: "#80a0c0",
      desc: "−10 m/s Base Movement Speed (All)",
      playerSpdMul: 0.82, enemySpdMul: 0.82,
    },
    demonic_cube: {
      id: "demonic_cube", name: "Demonic Cube", color: "#9030a0",
      desc: "Elites, Bosses & Lords gain extra abilities",
      flagEliteAbilities: true, eliteMul: 1.2, minibossMul: 1.2,
    },
    urn_of_the_damned: {
      id: "urn_of_the_damned", name: "Urn of the Damned", color: "#606848",
      desc: "Kills may spawn a ghost that chases you",
      flagGhostOnKill: true, ghostChance: 0.12,
    },
    burdening_stone: {
      id: "burdening_stone", name: "Burdening Stone", color: "#708090",
      desc: "−MS for every equipped item",
      flagBurdenPerItem: true, burdenSpdPerItem: 0.04,
    },
    golden_scarab: {
      id: "golden_scarab", name: "Golden Scarab", color: "#d4a84b",
      desc: "Gold pickups hurt for their value · breakables richer",
      flagGoldHurts: true, goldMul: 1.35,
    },
    primordial_edict: {
      id: "primordial_edict", name: "Primordial Edict", color: "#608070",
      desc: "Effect stack limit reduced by one third",
      flagStackLimitCut: true, stackLimitMul: 0.67,
    },
    face_of_regret: {
      id: "face_of_regret", name: "Face of Regret", color: "#a08090",
      desc: "Every 100 kills: −0.2% ASP · −0.2% Force",
      flagRegretStacks: true,
    },
    idol_of_hunger: {
      id: "idol_of_hunger", name: "Idol of Hunger", color: "#508040",
      desc: "All healing reduced 50% (final regen −50%)",
      playerRegenMul: 0.5, flagHealCut: true, healMul: 0.5,
    },
    obsidian_dice: {
      id: "obsidian_dice", name: "Obsidian Dice", color: "#303038",
      desc: "Scroll/tome abilities are randomly chosen",
      flagRandomAbility: true,
    },
    ivory_dice: {
      id: "ivory_dice", name: "Ivory Dice", color: "#e8e0d0",
      desc: "Chest items are randomly chosen for you",
      flagRandomItem: true,
    },
    mind_veil: {
      id: "mind_veil", name: "Mind Veil", color: "#7060a0",
      desc: "−50% XP bonus from quests (prototype: −25% XP)",
      xpMul: 0.75,
    },
    masters_vice: {
      id: "masters_vice", name: "Master's Vice", color: "#804050",
      desc: "Each level-up reduces max health by 1",
      flagLevelHpTax: true, levelHpTax: 1,
    },
    silver_cut: {
      id: "silver_cut", name: "Silver Cut", color: "#c0c8d0",
      desc: "All player modifiers reduced by 20%",
      flagPlayerModCut: true, playerModMul: 0.8,
    },
    apocryphal_curse: {
      id: "apocryphal_curse", name: "Apocryphal Curse", color: "#603080",
      desc: "Negative modifiers increased (+20% multiplicative)",
      flagNegModAmp: true, negModMul: 1.2, enemyDmgMul: 1.08, enemyHpMul: 1.05,
    },
    hiltless_dagger: {
      id: "hiltless_dagger", name: "Hiltless Dagger", color: "#c0c0d0",
      desc: "Slow stack for every Main Weapon attack",
      flagSlowOnAttack: true,
    },
    flagellants_foot_cuff: {
      id: "flagellants_foot_cuff", name: "Flagellant's Foot Cuff", color: "#a08070",
      desc: "Fragile stack every 20m moved",
      flagFragileOnMove: true,
    },
    hardening_targe: {
      id: "hardening_targe", name: "Hardening Targe", color: "#8090a0",
      desc: "Enemies +2 Block Strength each player level-up",
      flagEnemyBlockOnLevel: true,
    },
    elemental_incubator: {
      id: "elemental_incubator", name: "Elemental Incubator", color: "#e07040",
      desc: "−70% Burn/Spark/Frost chance · +100% elem dmg · foes spawn with effects",
      flagElemIncubator: true, elemChanceMul: 0.3, elemDmgMul: 2.0,
    },
    dementing_root: {
      id: "dementing_root", name: "Dementing Root", color: "#406040",
      desc: "−2 Ability Slots · −10% Multistrike",
      flagAbilitySlotCut: 2, playerMultistrikeAdd: -0.1,
    },
    demonic_accolade: {
      id: "demonic_accolade", name: "Demonic Accolade", color: "#a03040",
      desc: "1% of normals become special (stronger, extra drops)",
      flagSpecialNormals: true, specialNormalChance: 0.01, eliteMul: 1.1,
    },
    totem_of_giants: {
      id: "totem_of_giants", name: "Totem of Giants", color: "#708060",
      desc: "Fewer enemies: bigger, tougher, slower · more XP each",
      spawnMul: 0.7, enemyHpMul: 1.45, enemySpdMul: 0.75, xpMul: 1.25, flagGiantFoes: true,
    },
    pale_goblet: {
      id: "pale_goblet", name: "Pale Goblet", color: "#d0d8e0",
      desc: "Area/Range reduce Crit & elemental chances",
      flagPaleGoblet: true,
    },
    torn_stage_curtain: {
      id: "torn_stage_curtain", name: "Torn Stage Curtain", color: "#806060",
      desc: "Enemies keep spawning after Lord appears",
      flagSpawnAfterLord: true, spawnMul: 1.08,
    },
    alluring_flute: {
      id: "alluring_flute", name: "Alluring Flute", color: "#d0a060",
      desc: "Enemies pulled toward you (pull aura)",
      flagPullAura: true,
    },
    marching_drums: {
      id: "marching_drums", name: "Marching Drums", color: "#c08040",
      desc: "+50% Player MS · +30% Enemy MS",
      playerSpdMul: 1.5, enemySpdMul: 1.3,
    },
    torment_suppressor: {
      id: "torment_suppressor", name: "Torment Suppressor", color: "#606870",
      desc: "Caps total Torment Shard bonus at 666 (soft power cap)",
      flagShardCap: true, shardBonusCap: 666,
    },
    rich_mans_plate: {
      id: "rich_mans_plate", name: "Rich Man's Plate", color: "#d4a84b",
      desc: "−50% damage taken while you can pay gold",
      flagGoldArmor: true, goldArmorMul: 0.5,
    },
    strange_pendulum: {
      id: "strange_pendulum", name: "Strange Pendulum", color: "#70b090",
      desc: "Green chests over time · markers harder to see",
      flagGreenChests: true, flagHideMarkers: true,
    },
    bog_totem: {
      id: "bog_totem", name: "Bog Totem", color: "#406048",
      desc: "Every 500 kills: Boglands invasion wave",
      flagBogInvasion: true, bogEveryKills: 500,
    },
    masters_edge: {
      id: "masters_edge", name: "Master's Edge", color: "#b0a080",
      desc: "End-selection traits → pure stat increases",
      flagStatOnlyTraits: true,
    },
    glass_bones: {
      id: "glass_bones", name: "Glass Bones", color: "#e0e8f0",
      desc: "No defensive traits offered · glass cannon pressure",
      flagNoDefenseTraits: true, playerHpMul: 0.9, playerDmgMul: 1.15,
    },
    cursed_ulcer: {
      id: "cursed_ulcer", name: "Cursed Ulcer", color: "#608050",
      desc: "Containers may hold black crystals (growth + pain)",
      flagBlackCrystals: true,
    },
    leash_of_stagnation: {
      id: "leash_of_stagnation", name: "Leash of Stagnation", color: "#706050",
      desc: "Disables all per-level growth trait selections",
      flagNoLevelTraits: true,
    },
    unstable_tinderbox: {
      id: "unstable_tinderbox", name: "Unstable Tinderbox", color: "#e07030",
      desc: "Breakables that drop goods also fire fireworks",
      flagBreakableFireworks: true,
    },
  };
  const ARTIFACT_ORDER = Object.keys(ARTIFACTS);

  /**
   * Torment MODE — endless difficulty ladder (separate from Hall runs).
   * Level 1 → 2 → 3 → 4 … each step harder enemies.
   * Hall is randomized from HALL_ORDER when starting a Torment run.
   * (Artifacts remain optional flavor for Hall runs only, if enabled.)
   */
  const TORMENT_MODE = {
    /** How many locked levels to show beyond unlocked (preview) */
    showLockedAhead: 3,
    absoluteMaxLevel: 99,
    // Per-level scaling (level L). L1 soft entry; later levels spike via ^L HP
    enemyHpPerLevel: 1.13,
    enemyDmgPerLevel: 0.065,
    enemySpdPerLevel: 0.028,
    spawnPerLevel: 0.09,
    elitePerLevel: 0.14,
    xpPerLevel: 0.09,
    goldPerLevel: 0.06,
    shardPerLevel: 0.11,
    champIntervalBase: 40,
    champIntervalCutPerLevel: 2.4,
    champIntervalMin: 9,
    /** Soften first Torment level for ladder entry */
    level1HpMul: 0.9,
    level1DmgMul: 0.94,
    /** Default Torment duration id */
    defaultDurationId: "10",
  };

  /** Legacy rank scaling used if artifacts enabled on Hall (optional) */
  const TORMENT = {
    enemyHpPerRank: 1.11,
    enemyDefPerRank: 1.10,
    enemyDmgPerRank: 0.02,
    enemySpdPerRank: 0.015,
    xpPerRank: 0.05,
    champSpawnPerRank: 0.95,
    rareItemPerRank: 0.04,
    uncommonItemPerRank: 0.05,
  };

  /**
   * Item rarity (wiki Common / Uncommon / Rare).
   * Uncommon & Rare have SEPARATE packages (Boost / Growth-style), not only mul scale.
   * mul remains as soft fallback when an item has no rarityApply.
   */
  const ITEM_RARITY = {
    common: { id: "common", label: "Common", mul: 1, color: "#a0a8b0" },
    uncommon: { id: "uncommon", label: "Uncommon", mul: 1, color: "#50c070" },
    rare: { id: "rare", label: "Rare", mul: 1, color: "#c080e0" },
  };

  /**
   * Potions & barrel pickups (wiki-style consumables, in-run only).
   */
  const POTIONS = {
    health: {
      id: "health", name: "Health Potion", color: "#e04040",
      desc: "Heal 35% Max HP",
      apply: (p) => { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.35); },
    },
    greater_health: {
      id: "greater_health", name: "Greater Health", color: "#ff6060",
      desc: "Heal 60% Max HP",
      apply: (p) => { p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.6); },
    },
    haste: {
      id: "haste", name: "Haste Potion", color: "#60d0e0",
      desc: "+40% ASP & MS 12s",
      apply: (p) => { p.potionHaste = 12; },
    },
    power: {
      id: "power", name: "Power Potion", color: "#e08040",
      desc: "+50% Damage 12s",
      apply: (p) => { p.potionPower = 12; },
    },
    iron: {
      id: "iron", name: "Iron Skin", color: "#9098a8",
      desc: "+20 Def · +15 Block 14s",
      apply: (p) => { p.potionIron = 14; p.potionIronDef = 20; p.potionIronBlk = 15; },
    },
    magnet: {
      id: "magnet", name: "Magnet Brew", color: "#d4a84b",
      desc: "Huge pickup range 10s",
      apply: (p) => { p.potionMagnet = 10; },
    },
    wrath: {
      id: "wrath", name: "Wrath Tonic", color: "#c04080",
      desc: "+Crit & Multistrike 10s",
      apply: (p) => { p.potionWrath = 10; },
    },
    cleanse: {
      id: "cleanse", name: "Cleanse", color: "#e0e8f0",
      desc: "Clear chill · small heal",
      apply: (p) => { p.chillTimer = 0; p.hp = Math.min(p.maxHp, p.hp + p.maxHp * 0.12); },
    },
  };
  const POTION_ORDER = Object.keys(POTIONS);

  const BARRELS = {
    spawnInterval: 18, // seconds between barrel spawns
    maxAlive: 10,
    breakHp: 1, // contact or attack breaks
    potionChance: 0.72,
    goldChance: 0.45,
  };

  /**
   * Equipment — full wiki roster (Common-tier effects, scaled for prototype).
   * Slots (wiki): Helmet×1 · Amulet×1 · Ring×2 · Chest×1 · Boots×1 · Gloves×1 = 7 max.
   * No quest locks — all available. Source: hot.fandom.com wiki Equipment pages.
   * apply() sets stats / flags; runtime procs handled in game.js via item flags.
   */
  const ITEMS = {
    // ── HELMET ────────────────────────────────────────────
    hood: {
      id: "hood", name: "Hood", slot: "helmet", color: "#6a5040",
      desc: "+5 Def · +10% Move Speed",
      apply: (p) => { p.defense = (p.defense || 0) + 5; p.speed *= 1.1; },
    },
    helmet: {
      id: "helmet", name: "Helmet", slot: "helmet", color: "#9098a0",
      desc: "+10 Block Strength",
      apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 10; },
    },
    fighters_headband: {
      id: "fighters_headband", name: "Fighter's Headband", slot: "helmet", color: "#c04040",
      desc: "Elite/Boss spawn: regen 0.5%/s 50s",
      apply: (p) => { p.itemFighterBand = true; },
    },
    wind_crown: {
      id: "wind_crown", name: "Wind Crown", slot: "helmet", color: "#a0d0e8",
      desc: "On kill: ASP charges · decay over time",
      apply: (p) => { p.itemWindCrown = true; p.windCharges = p.windCharges || 0; },
    },
    ruby_circlet: {
      id: "ruby_circlet", name: "Ruby Circlet", slot: "helmet", color: "#e04040",
      desc: "+1% Burn dmg per burning foe (cap 40%)",
      apply: (p) => { p.itemRubyCirclet = true; },
    },
    thunder_crown: {
      id: "thunder_crown", name: "Thunder Crown", slot: "helmet", color: "#60a0ff",
      desc: "Hit sparked foe: chain lightning",
      apply: (p) => { p.itemThunderCrown = true; },
    },
    war_horns: {
      id: "war_horns", name: "War Horns", slot: "helmet", color: "#b08040",
      desc: "War cry every 3s · Fragile nearby",
      apply: (p) => { p.itemWarHorns = true; p.warHornTimer = 0; },
    },
    mask_of_madness: {
      id: "mask_of_madness", name: "Mask of Madness", slot: "helmet", color: "#8030a0",
      desc: "Every 25s: self-hit · +1% DMG/Crit",
      apply: (p) => { p.itemMaskMadness = true; p.maskTimer = 25; p.madnessStacks = p.madnessStacks || 0; },
    },
    gorgon_mask: {
      id: "gorgon_mask", name: "Gorgon Mask", slot: "helmet", color: "#60a060",
      desc: "Every 1s: Slow cone · dmg per Slow",
      apply: (p) => { p.itemGorgon = true; p.gorgonTimer = 0; },
    },
    alchemist_goggles: {
      id: "alchemist_goggles", name: "Alchemist Goggles", slot: "helmet", color: "#80c060",
      desc: "Kills boost elemental potency",
      apply: (p) => { p.itemAlchGoggles = true; p.elemPotency = p.elemPotency || 1; },
    },
    frost_dragon_helmet: {
      id: "frost_dragon_helmet", name: "Frost Dragon Helmet", slot: "helmet", color: "#80c0e0",
      desc: "+10% Frost chance · Frost breath 3s",
      apply: (p) => { p.effectChance = (p.effectChance || 0) + 0.1; p.itemFrostBreath = true; p.frostBreathTimer = 0; p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.1; },
    },
    twisted_chaplet: {
      id: "twisted_chaplet", name: "Twisted Chaplet", slot: "helmet", color: "#608040",
      desc: "Decay damage → Max HP (soft)",
      apply: (p) => { p.itemTwistedChaplet = true; },
    },
    vision_crown: {
      id: "vision_crown", name: "Vision Crown", slot: "helmet", color: "#c0a0e0",
      desc: "Still: +50% Range · Move: +30% Area",
      apply: (p) => { p.itemVisionCrown = true; },
    },
    war_chiefs_visor: {
      id: "war_chiefs_visor", name: "War Chief's Visor", slot: "helmet", color: "#c08040",
      desc: "Damage dealt → Force (soft cap)",
      apply: (p) => { p.itemWarChief = true; p.warChiefForce = 0; },
    },

    // ── AMULET ────────────────────────────────────────────
    jade_amulet: {
      id: "jade_amulet", name: "Jade Amulet", slot: "amulet", color: "#40a060",
      desc: "+40% XP Gain · gold→XP soft",
      apply: (p) => { p.xpGain = (p.xpGain || 1) * 1.4; p.itemJadeAmulet = true; },
    },
    maidens_tear: {
      id: "maidens_tear", name: "Maiden's Tear", slot: "amulet", color: "#a0c0e0",
      desc: "Block 1 hit every 30s · +Force when charged",
      apply: (p) => { p.itemMaidenTear = true; p.maidenCharge = 30; },
    },
    blood_catcher: {
      id: "blood_catcher", name: "Blood Catcher", slot: "amulet", color: "#c03030",
      desc: "Damage dealt → periodic heal/dmg",
      apply: (p) => { p.itemBloodCatcher = true; p.bloodCatcherAcc = 0; p.bloodCatcherTimer = 0; },
    },
    collar_of_confidence: {
      id: "collar_of_confidence", name: "Collar of Confidence", slot: "amulet", color: "#d4a84b",
      desc: "+DMG per foe in pickup (cap 50%)",
      apply: (p) => { p.itemCollarConf = true; },
    },
    duelists_spark: {
      id: "duelists_spark", name: "Duelist's Spark", slot: "amulet", color: "#e0c040",
      desc: "+35% DMG · −DMG when crowded",
      apply: (p) => { p.damage *= 1.35; p.itemDuelistSpark = true; },
    },
    scars_of_toil: {
      id: "scars_of_toil", name: "Scars of Toil", slot: "amulet", color: "#a05040",
      desc: "+0.1% DMG per missing HP",
      apply: (p) => { p.itemScarsToil = true; },
    },
    gatherers_charm: {
      id: "gatherers_charm", name: "Gatherer's Charm", slot: "amulet", color: "#70b050",
      desc: "+10% Move Speed · +pickup",
      apply: (p) => { p.speed *= 1.1; p.pickupRange = (p.pickupRange || 80) * 1.15; },
    },
    elemental_capacitor: {
      id: "elemental_capacitor", name: "Elemental Capacitor", slot: "amulet", color: "#8060c0",
      desc: "+25% Ability DMG · +effect chance",
      apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.25; p.effectChance = (p.effectChance || 0) + 0.15; },
    },
    elemental_resonator: {
      id: "elemental_resonator", name: "Elemental Resonator", slot: "amulet", color: "#c060e0",
      desc: "Main hit: re-apply elemental stacks",
      apply: (p) => { p.itemElemResonator = true; },
    },
    natural_selector: {
      id: "natural_selector", name: "Natural Selector", slot: "amulet", color: "#508040",
      desc: "Summon −30% count · +120% summon dmg",
      apply: (p) => { p.summonCountMul = (p.summonCountMul || 1) * 0.7; p.summonDmgMul = (p.summonDmgMul || 1) * 2.2; p.itemNaturalSelector = true; },
    },
    philosophers_stone: {
      id: "philosophers_stone", name: "Philosopher's Stone", slot: "amulet", color: "#e0b040",
      desc: "+35% all combat stats · −15% Max HP",
      apply: (p) => {
        p.damage *= 1.35; p.attackCooldown /= 1.2; p.speed *= 1.15;
        p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.08);
        p.maxHp = Math.max(40, Math.round(p.maxHp * 0.85)); p.hp = Math.min(p.hp, p.maxHp);
      },
    },
    shepherds_boon: {
      id: "shepherds_boon", name: "Shepherd's Boon", slot: "amulet", color: "#90a060",
      desc: "Regen from summons · +summon dmg",
      apply: (p) => { p.itemShepherd = true; p.summonDmgMul = (p.summonDmgMul || 1) * 1.25; p.regen = (p.regen || 0) + 0.3; },
    },
    warriors_fervor: {
      id: "warriors_fervor", name: "Warrior's Fervor", slot: "amulet", color: "#c06030",
      desc: "On heal: +100% DMG/ASP 8s",
      apply: (p) => { p.itemWarriorsFervor = true; p.fervorTimer = 0; },
    },

    // ── RING (×2) ─────────────────────────────────────────
    wooden_ring: {
      id: "wooden_ring", name: "Wooden Ring", slot: "ring", color: "#8a6030",
      desc: "+12% Crit Chance",
      apply: (p) => { p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.12); },
    },
    copper_ring: {
      id: "copper_ring", name: "Copper Ring", slot: "ring", color: "#c07040",
      desc: "+50% Crit Bonus",
      apply: (p) => { p.critBonus = (p.critBonus || 0.5) + 0.5; },
    },
    iron_ring: {
      id: "iron_ring", name: "Iron Ring", slot: "ring", color: "#a0a8b0",
      desc: "+15 Base Damage",
      apply: (p) => { p.damage += 15; },
    },
    ring_of_fire: {
      id: "ring_of_fire", name: "Ring of Fire", slot: "ring", color: "#e05020",
      desc: "Main → Fire · +15% Burn chance",
      apply: (p) => { p.weaponElement = "fire"; p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.15; p.effectChance = (p.effectChance || 0) + 0.1; },
    },
    ring_of_thunder: {
      id: "ring_of_thunder", name: "Ring of Thunder", slot: "ring", color: "#5080e0",
      desc: "Main → Lightning · +15% Spark",
      apply: (p) => { p.weaponElement = "lightning"; p.weaponSparkChance = (p.weaponSparkChance || 0) + 0.15; p.effectChance = (p.effectChance || 0) + 0.1; },
    },
    ring_of_frost: {
      id: "ring_of_frost", name: "Ring of Frost", slot: "ring", color: "#80c0e8",
      desc: "Main → Ice · +15% Frost chance",
      apply: (p) => { p.weaponElement = "ice"; p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.15; p.effectChance = (p.effectChance || 0) + 0.1; },
    },
    ring_of_earth: {
      id: "ring_of_earth", name: "Ring of Earth", slot: "ring", color: "#708040",
      desc: "Main → Earth · +15% Decay chance",
      apply: (p) => { p.weaponElement = "earth"; p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.15; p.effectChance = (p.effectChance || 0) + 0.1; },
    },
    echoing_band: {
      id: "echoing_band", name: "Echoing Band", slot: "ring", color: "#c0a060",
      desc: "20% on hit: shockwave 40% dmg",
      apply: (p) => { p.itemEchoingBand = true; },
    },
    guiding_star: {
      id: "guiding_star", name: "Guiding Star", slot: "ring", color: "#e0d080",
      desc: "Atk: +ASP −MS · Move: +MS −ASP",
      apply: (p) => { p.itemGuidingStar = true; },
    },
    seal_of_rebirth: {
      id: "seal_of_rebirth", name: "Seal of Rebirth", slot: "ring", color: "#e0e0f0",
      desc: "Revive once at 50% HP",
      apply: (p) => { p.itemSealRebirth = true; p.sealCharges = Math.max(p.sealCharges || 0, 1); },
    },
    demonic_bond: {
      id: "demonic_bond", name: "Demonic Bond", slot: "ring", color: "#c04020",
      desc: "Summon imps periodically",
      apply: (p) => { p.itemDemonicBond = true; p.impTimer = 0; },
    },
    necromancers_clutch: {
      id: "necromancers_clutch", name: "Necromancer's Clutch", slot: "ring", color: "#7090a0",
      desc: "Summon skeletons periodically",
      apply: (p) => { p.itemNecroClutch = true; p.skelTimer = 0; },
    },
    pest_ring: {
      id: "pest_ring", name: "Pest Ring", slot: "ring", color: "#808060",
      desc: "Summon rats · apply debuffs",
      apply: (p) => { p.itemPestRing = true; p.ratTimer = 0; },
    },
    holy_relic: {
      id: "holy_relic", name: "Holy Relic", slot: "ring", color: "#f0e0a0",
      desc: "Every 30s: heal 50 or power buff",
      apply: (p) => { p.itemHolyRelic = true; p.holyRelicTimer = 30; },
    },
    blighted_indolence: {
      id: "blighted_indolence", name: "Blighted Indolence", slot: "ring", color: "#608050",
      desc: "Slow also rolls Decay 40%",
      apply: (p) => { p.itemBlightedIndolence = true; },
    },
    ability_signet: {
      id: "ability_signet", name: "Ability Signet", slot: "ring", color: "#8060c0",
      desc: "+20% Ability DMG · Ability CD −8%",
      apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.2; p.abilityCdMul = (p.abilityCdMul || 1) * 0.92; },
    },

    // ── CHEST ─────────────────────────────────────────────
    chain_mail: {
      id: "chain_mail", name: "Chain Mail", slot: "chest", color: "#8090a0",
      desc: "+5 Def · +20% Max HP",
      apply: (p) => { p.defense = (p.defense || 0) + 5; p.maxHp = Math.round(p.maxHp * 1.2); p.hp = Math.round(p.hp * 1.2); },
    },
    plate_armor: {
      id: "plate_armor", name: "Plate Armor", slot: "chest", color: "#a0a8b0",
      desc: "+8 Block · +15% Max HP",
      apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 8; p.maxHp = Math.round(p.maxHp * 1.15); p.hp = Math.round(p.hp * 1.15); },
    },
    blazing_shell: {
      id: "blazing_shell", name: "Blazing Shell", slot: "chest", color: "#e06020",
      desc: "Aura Burn · when hit 50% Burn",
      apply: (p) => { p.itemBlazingShell = true; p.blockStrength = (p.blockStrength || 0) + 4; p.blazeTimer = 0; },
    },
    blood_soaked_shirt: {
      id: "blood_soaked_shirt", name: "Blood-Soaked Shirt", slot: "chest", color: "#a02020",
      desc: "On kill 8%: +1 HP · kill→DMG stacks",
      apply: (p) => { p.itemBloodShirt = true; p.bloodShirtKills = 0; },
    },
    defiant_plate: {
      id: "defiant_plate", name: "Defiant Plate", slot: "chest", color: "#7080a0",
      desc: "On hit: +Def/Regen stack (cap)",
      apply: (p) => { p.itemDefiantPlate = true; p.defiantStacks = 0; p.defiantTimer = 0; },
    },
    hunters_garb: {
      id: "hunters_garb", name: "Hunter's Garb", slot: "chest", color: "#6a5030",
      desc: "Stand still: +DMG over time (cap 50%)",
      apply: (p) => { p.itemHuntersGarb = true; p.hunterStill = 0; },
    },
    shadow_cloak: {
      id: "shadow_cloak", name: "Shadow Cloak", slot: "chest", color: "#403060",
      desc: "Shadow patches · +10 Block",
      apply: (p) => { p.itemShadowCloak = true; p.blockStrength = (p.blockStrength || 0) + 10; p.shadowTimer = 0; },
    },
    beastmasters_hide: {
      id: "beastmasters_hide", name: "Beastmaster's Hide", slot: "chest", color: "#80a0c0",
      desc: "Ice beast companion · +Def",
      apply: (p) => { p.itemBeastHide = true; p.defense = (p.defense || 0) + 6; p.beastTimer = 0; },
    },
    brokers_cape: {
      id: "brokers_cape", name: "Broker's Cape", slot: "chest", color: "#7050a0",
      desc: "Every 1s: random debuff aura",
      apply: (p) => { p.itemBrokerCape = true; p.brokerTimer = 0; },
    },
    crones_gown: {
      id: "crones_gown", name: "Crone's Gown", slot: "chest", color: "#506040",
      desc: "Swamp plants · Decay clouds",
      apply: (p) => { p.itemCronesGown = true; p.croneTimer = 0; },
    },
    thunder_cape: {
      id: "thunder_cape", name: "Thunder Cape", slot: "chest", color: "#4060c0",
      desc: "Shockwave strongest foe in range",
      apply: (p) => { p.itemThunderCape = true; p.thunderCapeTimer = 0; },
    },

    // ── BOOTS ─────────────────────────────────────────────
    plated_boots: {
      id: "plated_boots", name: "Plated Boots", slot: "boots", color: "#808890",
      desc: "+5 Def · +5 Block",
      apply: (p) => { p.defense = (p.defense || 0) + 5; p.blockStrength = (p.blockStrength || 0) + 5; },
    },
    running_shoes: {
      id: "running_shoes", name: "Running Shoes", slot: "boots", color: "#c08040",
      desc: "+20% Move Speed",
      apply: (p) => { p.speed *= 1.2; },
    },
    firewalker_boots: {
      id: "firewalker_boots", name: "Firewalker Boots", slot: "boots", color: "#e05020",
      desc: "Move: fire trail · Burn chance",
      apply: (p) => { p.itemFirewalker = true; p.firewalkerDist = 0; },
    },
    bog_boots: {
      id: "bog_boots", name: "Bog Boots", slot: "boots", color: "#608050",
      desc: "Move: goo trail · Slow",
      apply: (p) => { p.itemBogBoots = true; p.bogDist = 0; },
    },
    electrostatic_treads: {
      id: "electrostatic_treads", name: "Electrostatic Treads", slot: "boots", color: "#60a0ff",
      desc: "Move: charge shockwave",
      apply: (p) => { p.itemElectroTreads = true; p.electroCharge = 0; },
    },
    elven_slippers: {
      id: "elven_slippers", name: "Elven Slippers", slot: "boots", color: "#80c080",
      desc: "Move: +Block Strength",
      apply: (p) => { p.itemElvenSlippers = true; },
    },
    pace_setter: {
      id: "pace_setter", name: "Pace Setter", slot: "boots", color: "#d0b060",
      desc: "Still: heal · Full HP +ASP · Hurt +MS",
      apply: (p) => { p.itemPaceSetter = true; p.paceTimer = 0; },
    },
    spike_boots: {
      id: "spike_boots", name: "Spike Boots", slot: "boots", color: "#a09080",
      desc: "On hit: drop spikes · stun",
      apply: (p) => { p.itemSpikeBoots = true; p.spikeCd = 0; },
    },
    berserker_boots: {
      id: "berserker_boots", name: "Berserker Boots", slot: "boots", color: "#c04030",
      desc: "Move: convert MS → ASP",
      apply: (p) => { p.itemBerserkerBoots = true; },
    },
    frost_greaves: {
      id: "frost_greaves", name: "Frost Greaves", slot: "boots", color: "#80b0d0",
      desc: "Every 1s: Frost foes in pickup",
      apply: (p) => { p.itemFrostGreaves = true; p.frostGreaveTimer = 0; },
    },
    swamp_raisers: {
      id: "swamp_raisers", name: "Swamp Raisers", slot: "boots", color: "#406040",
      desc: "Still: swamp Decay aura",
      apply: (p) => { p.itemSwampRaisers = true; p.swampTimer = 0; },
    },
    demonic_grasp: {
      id: "demonic_grasp", name: "Demonic Grasp", slot: "boots", color: "#803040",
      desc: "Move: summon hands · pull/dmg",
      apply: (p) => { p.itemDemonicGrasp = true; p.graspDist = 0; },
    },

    // ── GLOVES ────────────────────────────────────────────
    longfinger_gloves: {
      id: "longfinger_gloves", name: "Longfinger Gloves", slot: "gloves", color: "#90a070",
      desc: "+100% Pickup Range",
      apply: (p) => { p.pickupRange = (p.pickupRange || 80) * 2; },
    },
    quickhand_gloves: {
      id: "quickhand_gloves", name: "Quickhand Gloves", slot: "gloves", color: "#70a0c0",
      desc: "+25% Attack Speed",
      apply: (p) => { p.attackCooldown /= 1.25; },
    },
    hunting_gloves: {
      id: "hunting_gloves", name: "Hunting Gloves", slot: "gloves", color: "#8a6030",
      desc: "+30% Multistrike",
      apply: (p) => { p.multistrike = (p.multistrike || 1) + 0.3; p.extraProjectiles = (p.extraProjectiles || 0) + 1; },
    },
    fencing_gauntlets: {
      id: "fencing_gauntlets", name: "Fencing Gauntlets", slot: "gloves", color: "#c0c0d0",
      desc: "On block: 50% free crit attack",
      apply: (p) => { p.itemFencingGauntlets = true; },
    },
    invocators_grasp: {
      id: "invocators_grasp", name: "Invocator's Grasp", slot: "gloves", color: "#7040a0",
      desc: "+40% summon spawn/dmg",
      apply: (p) => { p.summonCountMul = (p.summonCountMul || 1) * 1.4; p.summonDmgMul = (p.summonDmgMul || 1) * 1.4; },
    },
    sparking_tips: {
      id: "sparking_tips", name: "Sparking Tips", slot: "gloves", color: "#e06030",
      desc: "Hit burning: fire sparks",
      apply: (p) => { p.itemSparkingTips = true; },
    },
    spellcaster_gloves: {
      id: "spellcaster_gloves", name: "Spellcaster Gloves", slot: "gloves", color: "#6060c0",
      desc: "No main atk 2s: +ability dmg ramp",
      apply: (p) => { p.itemSpellcaster = true; p.spellIdle = 0; },
    },
    thornfists: {
      id: "thornfists", name: "Thornfists", slot: "gloves", color: "#608040",
      desc: "On hurt: crit retaliate source",
      apply: (p) => { p.itemThornfists = true; p.thorns = (p.thorns || 0) + 12; },
    },
    alchemists_trade: {
      id: "alchemists_trade", name: "Alchemist's Trade", slot: "gloves", color: "#80c050",
      desc: "Absorb nearby elements → stats",
      apply: (p) => { p.itemAlchTrade = true; p.alchAbsorb = 0; },
    },
    bloodstained_wrappings: {
      id: "bloodstained_wrappings", name: "Bloodstained Wrappings", slot: "gloves", color: "#a03030",
      desc: "Deal dmg → charge · heal on hurt",
      apply: (p) => { p.itemBloodWrap = true; p.bloodWrapCharge = 0; },
    },
    frost_thorns: {
      id: "frost_thorns", name: "Frost Thorns", slot: "gloves", color: "#80c0e0",
      desc: "Hit frosted: ice burst",
      apply: (p) => { p.itemFrostThorns = true; },
    },
    leeching_fingers: {
      id: "leeching_fingers", name: "Leeching Fingers", slot: "gloves", color: "#508040",
      desc: "Hit Decay: consume stacks · heal",
      apply: (p) => { p.itemLeechFingers = true; },
    },
    unholy_touch: {
      id: "unholy_touch", name: "Unholy Touch", slot: "gloves", color: "#604080",
      desc: "Melee: +20% Fragile chance",
      apply: (p) => { p.weaponFragileChance = (p.weaponFragileChance || 0) + 0.2; p.effectChance = (p.effectChance || 0) + 0.1; },
    },
    thundercharge_gauntlets: {
      id: "thundercharge_gauntlets", name: "Thundercharge Gauntlets", slot: "gloves", color: "#5080e0",
      desc: "Spark dmg → Crit charge",
      apply: (p) => { p.itemThundercharge = true; p.thunderCrit = 0; },
    },
  };
  const ITEM_ORDER = Object.keys(ITEMS);

  /**
   * Per-item Uncommon / Rare packages (wiki Boost & Growth flavor).
   * Applied ON TOP of common apply — not pure stat ×mul.
   * Growth (rare default): bonus that scales with levels while equipped.
   */
  const ITEM_RARITY_PACKAGES = {
    // Helmet
    hood: {
      uncommon: { desc: "Boost: +8 Def · +15% MS", apply: (p) => { p.defense = (p.defense || 0) + 3; p.speed *= 1.05; } },
      rare: { desc: "Growth↑: +Def/MS per 10 levels", apply: (p) => { p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, defense: 1, speedMul: 1.01 }); p.defense = (p.defense || 0) + 2; } },
    },
    helmet: {
      uncommon: { desc: "Boost: +6 Block · +4 Def", apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 6; p.defense = (p.defense || 0) + 4; } },
      rare: { desc: "Growth↑: +Block per 8 levels", apply: (p) => { p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 8, block: 2 }); p.blockStrength = (p.blockStrength || 0) + 4; } },
    },
    fighters_headband: {
      uncommon: { desc: "Boost: regen 0.8%/s · 60s", apply: (p) => { p.itemFighterBandBoost = 1.6; p.regen = (p.regen || 0) + 0.2; } },
      rare: { desc: "Growth↑: also +2% DMG while regenerating", apply: (p) => { p.itemFighterBandBoost = 2; p.itemFighterBandDmg = true; } },
    },
    wind_crown: {
      uncommon: { desc: "Boost: +2 max ASP charges", apply: (p) => { p.windChargeBonus = (p.windChargeBonus || 0) + 2; p.attackCooldown /= 1.04; } },
      rare: { desc: "Growth↑: charges decay slower · +ASP floor", apply: (p) => { p.windChargeBonus = (p.windChargeBonus || 0) + 3; p.itemWindSlowDecay = true; } },
    },
    ruby_circlet: {
      uncommon: { desc: "Boost: Burn dmg cap 55%", apply: (p) => { p.rubyBurnCap = 0.55; p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: +0.5% burn dmg per level (cap 70%)", apply: (p) => { p.rubyBurnCap = 0.7; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 1, burnDmg: 0.005 }); } },
    },
    thunder_crown: {
      uncommon: { desc: "Boost: chain jumps +1 · +Spark", apply: (p) => { p.chainJumps = (p.chainJumps || 0) + 1; p.weaponSparkChance = (p.weaponSparkChance || 0) + 0.08; } },
      rare: { desc: "Growth↑: chain dmg +4% per 5 levels", apply: (p) => { p.chainJumps = (p.chainJumps || 0) + 1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 5, abilityDmgMul: 1.04 }); } },
    },
    war_horns: {
      uncommon: { desc: "Boost: war cry every 2.4s · +Force", apply: (p) => { p.warHornInterval = 2.4; p.force = (p.force || 1) + 0.1; } },
      rare: { desc: "Growth↑: Fragile potency scales with levels", apply: (p) => { p.warHornInterval = 2.0; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, effectChance: 0.02 }); } },
    },
    mask_of_madness: {
      uncommon: { desc: "Boost: +1.5% DMG/Crit per stack", apply: (p) => { p.madnessStackPower = 0.015; } },
      rare: { desc: "Growth↑: max stacks +10 · stronger madness", apply: (p) => { p.madnessStackPower = 0.02; p.madnessMaxBonus = 10; } },
    },
    gorgon_mask: {
      uncommon: { desc: "Boost: Slow cone wider · +Decay", apply: (p) => { p.gorgonRangeMul = 1.25; p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: dmg per Slow stack grows", apply: (p) => { p.gorgonRangeMul = 1.4; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, force: 0.03 }); } },
    },
    alchemist_goggles: {
      uncommon: { desc: "Boost: +12% elemental potency", apply: (p) => { p.elemPotency = (p.elemPotency || 1) * 1.12; p.effectChance = (p.effectChance || 0) + 0.06; } },
      rare: { desc: "Growth↑: potency +2% per 8 levels", apply: (p) => { p.elemPotency = (p.elemPotency || 1) * 1.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 8, elemPotency: 0.02 }); } },
    },
    frost_dragon_helmet: {
      uncommon: { desc: "Boost: +Frost chance · breath 2.4s", apply: (p) => { p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.08; p.frostBreathInterval = 2.4; } },
      rare: { desc: "Growth↑: Frost dmg scales with levels", apply: (p) => { p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, frostDmgMul: 1.05 }); } },
    },
    twisted_chaplet: {
      uncommon: { desc: "Boost: Decay→HP convert +50%", apply: (p) => { p.twistedConvertMul = 1.5; p.regen = (p.regen || 0) + 0.15; } },
      rare: { desc: "Growth↑: Max HP soft cap rises with levels", apply: (p) => { p.twistedConvertMul = 1.8; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, maxHp: 3 }); } },
    },
    vision_crown: {
      uncommon: { desc: "Boost: Still +65% Range · Move +40% Area", apply: (p) => { p.visionStillRange = 1.65; p.visionMoveArea = 1.4; } },
      rare: { desc: "Growth↑: bonuses climb with levels", apply: (p) => { p.visionStillRange = 1.55; p.visionMoveArea = 1.35; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 20, range: 0.02 }); } },
    },
    war_chiefs_visor: {
      uncommon: { desc: "Boost: Force convert rate +40%", apply: (p) => { p.warChiefRate = 1.4; p.force = (p.force || 1) + 0.08; } },
      rare: { desc: "Growth↑: Force cap rises per 10 levels", apply: (p) => { p.warChiefRate = 1.6; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, force: 0.04 }); } },
    },
    // Amulet
    jade_amulet: {
      uncommon: { desc: "Boost: +55% XP · gold→XP stronger", apply: (p) => { p.xpGain = (p.xpGain || 1) * 1.15; p.itemJadeBoost = 1.3; } },
      rare: { desc: "Growth↑: +XP% per 10 levels", apply: (p) => { p.xpGain = (p.xpGain || 1) * 1.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, xpGainMul: 1.03 }); } },
    },
    maidens_tear: {
      uncommon: { desc: "Boost: Block CD 24s · +Force charged", apply: (p) => { p.maidenCd = 24; p.maidenForce = 0.2; } },
      rare: { desc: "Growth↑: stores 2 charges at high level", apply: (p) => { p.maidenCd = 22; p.maidenMaxCharges = 2; } },
    },
    blood_catcher: {
      uncommon: { desc: "Boost: convert rate +35%", apply: (p) => { p.bloodCatcherRate = 1.35; } },
      rare: { desc: "Growth↑: heal ticks stronger per levels", apply: (p) => { p.bloodCatcherRate = 1.25; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, regen: 0.05 }); } },
    },
    collar_of_confidence: {
      uncommon: { desc: "Boost: DMG cap 65% in pickup", apply: (p) => { p.collarCap = 0.65; } },
      rare: { desc: "Growth↑: cap +2% per 15 levels", apply: (p) => { p.collarCap = 0.55; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, collarCap: 0.02 }); } },
    },
    duelists_spark: {
      uncommon: { desc: "Boost: +45% DMG · crowd penalty softer", apply: (p) => { p.damage *= 1.08; p.duelistCrowdSoft = true; } },
      rare: { desc: "Growth↑: +DMG when alone scales", apply: (p) => { p.damage *= 1.05; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, damageMul: 1.02 }); } },
    },
    scars_of_toil: {
      uncommon: { desc: "Boost: +0.15% DMG per missing HP", apply: (p) => { p.scarsRate = 0.0015; } },
      rare: { desc: "Growth↑: rate climbs with levels", apply: (p) => { p.scarsRate = 0.0012; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 20, scarsRate: 0.0002 }); } },
    },
    gatherers_charm: {
      uncommon: { desc: "Boost: +MS · +pickup · gold+", apply: (p) => { p.speed *= 1.05; p.pickupRange = (p.pickupRange || 80) * 1.1; p.goldFind = (p.goldFind || 1) * 1.1; } },
      rare: { desc: "Growth↑: pickup range per 10 levels", apply: (p) => { p.pickupRange = (p.pickupRange || 80) * 1.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, pickupMul: 1.03 }); } },
    },
    elemental_capacitor: {
      uncommon: { desc: "Boost: +Ability DMG · effect+", apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.1; p.effectChance = (p.effectChance || 0) + 0.08; } },
      rare: { desc: "Growth↑: ability power per 8 levels", apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.06; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 8, abilityDmgMul: 1.03 }); } },
    },
    elemental_resonator: {
      uncommon: { desc: "Boost: re-apply chance higher", apply: (p) => { p.resonatorChance = 0.4; p.effectChance = (p.effectChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: elemental stacks deeper", apply: (p) => { p.resonatorChance = 0.5; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, effectChance: 0.02 }); } },
    },
    natural_selector: {
      uncommon: { desc: "Boost: summon −20% count · +150% dmg", apply: (p) => { p.summonCountMul = (p.summonCountMul || 1) * 1.1; p.summonDmgMul = (p.summonDmgMul || 1) * 1.15; } },
      rare: { desc: "Growth↑: summon dmg per 10 levels", apply: (p) => { p.summonDmgMul = (p.summonDmgMul || 1) * 1.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, summonDmgMul: 1.04 }); } },
    },
    philosophers_stone: {
      uncommon: { desc: "Boost: combat+ · HP penalty −10%", apply: (p) => { p.damage *= 1.08; p.maxHp = Math.round(p.maxHp * 1.05); p.hp = Math.min(p.maxHp, p.hp + 8); } },
      rare: { desc: "Growth↑: all stats climb · soft HP recovery", apply: (p) => { p.damage *= 1.05; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, damageMul: 1.02, maxHp: 2 }); } },
    },
    shepherds_boon: {
      uncommon: { desc: "Boost: +summon dmg · regen+", apply: (p) => { p.summonDmgMul = (p.summonDmgMul || 1) * 1.12; p.regen = (p.regen || 0) + 0.25; } },
      rare: { desc: "Growth↑: summon count soft scale", apply: (p) => { p.summonCountMul = (p.summonCountMul || 1) * 1.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, summonDmgMul: 1.03 }); } },
    },
    warriors_fervor: {
      uncommon: { desc: "Boost: Fervor 10s · +ASP", apply: (p) => { p.fervorDuration = 10; p.attackCooldown /= 1.04; } },
      rare: { desc: "Growth↑: Fervor power scales", apply: (p) => { p.fervorDuration = 10; p.fervorPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, damageMul: 1.015 }); } },
    },
    // Rings
    wooden_ring: {
      uncommon: { desc: "Boost: +Crit · small Crit Bonus", apply: (p) => { p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.05); p.critBonus = (p.critBonus || 0.5) + 0.1; } },
      rare: { desc: "Growth↑: Crit Chance per 15 levels", apply: (p) => { p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.04); p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, critChance: 0.01 }); } },
    },
    copper_ring: {
      uncommon: { desc: "Boost: +Crit Bonus · +Crit Chance", apply: (p) => { p.critBonus = (p.critBonus || 0.5) + 0.2; p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.03); } },
      rare: { desc: "Growth↑: Crit Bonus per 12 levels", apply: (p) => { p.critBonus = (p.critBonus || 0.5) + 0.15; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, critBonus: 0.03 }); } },
    },
    iron_ring: {
      uncommon: { desc: "Boost: +22 Base Damage", apply: (p) => { p.damage += 10; } },
      rare: { desc: "Growth↑: +1 Damage per 5 levels", apply: (p) => { p.damage += 6; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 5, damage: 1 }); } },
    },
    ring_of_fire: {
      uncommon: { desc: "Boost: +Burn chance · Burn dmg+", apply: (p) => { p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.1; p.burnDmgMul = (p.burnDmgMul || 1) * 1.2; } },
      rare: { desc: "Growth↑: Burn chance per levels", apply: (p) => { p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, burnChance: 0.02 }); } },
    },
    ring_of_thunder: {
      uncommon: { desc: "Boost: +Spark · chain+", apply: (p) => { p.weaponSparkChance = (p.weaponSparkChance || 0) + 0.1; p.chainJumps = (p.chainJumps || 0) + 1; } },
      rare: { desc: "Growth↑: Spark chance per levels", apply: (p) => { p.weaponSparkChance = (p.weaponSparkChance || 0) + 0.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, sparkChance: 0.02 }); } },
    },
    ring_of_frost: {
      uncommon: { desc: "Boost: +Frost · chill duration", apply: (p) => { p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.1; p.frostDurationMul = 1.25; } },
      rare: { desc: "Growth↑: Frost chance per levels", apply: (p) => { p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, frostChance: 0.02 }); } },
    },
    ring_of_earth: {
      uncommon: { desc: "Boost: +Decay · thorns", apply: (p) => { p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.1; p.thorns = (p.thorns || 0) + 4; } },
      rare: { desc: "Growth↑: Decay chance per levels", apply: (p) => { p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, decayChance: 0.02 }); } },
    },
    echoing_band: {
      uncommon: { desc: "Boost: 30% shockwave · 50% dmg", apply: (p) => { p.echoChance = 0.3; p.echoDmg = 0.5; } },
      rare: { desc: "Growth↑: shockwave dmg scales", apply: (p) => { p.echoChance = 0.28; p.echoDmg = 0.45; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, echoDmg: 0.03 }); } },
    },
    guiding_star: {
      uncommon: { desc: "Boost: stronger ASP/MS trade", apply: (p) => { p.guidingStarPower = 1.25; } },
      rare: { desc: "Growth↑: trade efficiency per levels", apply: (p) => { p.guidingStarPower = 1.15; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, speedMul: 1.01 }); } },
    },
    seal_of_rebirth: {
      uncommon: { desc: "Boost: revive at 65% HP", apply: (p) => { p.sealReviveFrac = 0.65; } },
      rare: { desc: "Growth↑: revive 75% · brief invuln", apply: (p) => { p.sealReviveFrac = 0.75; p.sealInvuln = 1.5; } },
    },
    demonic_bond: {
      uncommon: { desc: "Boost: imps faster · stronger", apply: (p) => { p.impInterval = 0.8; p.summonDmgMul = (p.summonDmgMul || 1) * 1.1; } },
      rare: { desc: "Growth↑: extra imp per 20 levels", apply: (p) => { p.impInterval = 0.75; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 20, summonCountMul: 1.05 }); } },
    },
    necromancers_clutch: {
      uncommon: { desc: "Boost: skels faster · +summon dmg", apply: (p) => { p.skelInterval = 0.8; p.summonDmgMul = (p.summonDmgMul || 1) * 1.12; } },
      rare: { desc: "Growth↑: skeleton power scales", apply: (p) => { p.skelInterval = 0.75; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, summonDmgMul: 1.04 }); } },
    },
    pest_ring: {
      uncommon: { desc: "Boost: rats + debuff potency", apply: (p) => { p.ratInterval = 0.8; p.effectChance = (p.effectChance || 0) + 0.06; } },
      rare: { desc: "Growth↑: pest aura scales", apply: (p) => { p.ratInterval = 0.75; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, effectChance: 0.015 }); } },
    },
    holy_relic: {
      uncommon: { desc: "Boost: every 24s heal 65 or power", apply: (p) => { p.holyInterval = 24; p.holyHeal = 65; } },
      rare: { desc: "Growth↑: heal amount scales", apply: (p) => { p.holyInterval = 22; p.holyHeal = 55; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, holyHeal: 4 }); } },
    },
    blighted_indolence: {
      uncommon: { desc: "Boost: Slow→Decay 55%", apply: (p) => { p.blightDecayChance = 0.55; } },
      rare: { desc: "Growth↑: Decay convert + chance", apply: (p) => { p.blightDecayChance = 0.5; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, decayChance: 0.03 }); } },
    },
    ability_signet: {
      uncommon: { desc: "Boost: +Ability DMG · CD− · Range", apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.12; p.abilityCdMul = (p.abilityCdMul || 1) * 0.94; p.abilityRangeMul = (p.abilityRangeMul || 1) * 1.08; } },
      rare: { desc: "Growth↑: ability power per levels", apply: (p) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.1; p.abilityCdMul = (p.abilityCdMul || 1) * 0.92; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 8, abilityDmgMul: 1.025 }); } },
    },
    // Chest
    chain_mail: {
      uncommon: { desc: "Boost: +Def · +28% Max HP", apply: (p) => { p.defense = (p.defense || 0) + 4; p.maxHp = Math.round(p.maxHp * 1.08); p.hp = Math.min(p.maxHp, p.hp + 12); } },
      rare: { desc: "Growth↑: Max HP per 8 levels", apply: (p) => { p.defense = (p.defense || 0) + 3; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 8, maxHp: 4 }); } },
    },
    plate_armor: {
      uncommon: { desc: "Boost: +Block · +HP", apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 6; p.maxHp = Math.round(p.maxHp * 1.06); p.hp = Math.min(p.maxHp, p.hp + 10); } },
      rare: { desc: "Growth↑: Block per 10 levels", apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 4; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, block: 2 }); } },
    },
    blazing_shell: {
      uncommon: { desc: "Boost: aura stronger · +Block", apply: (p) => { p.blazePower = 1.3; p.blockStrength = (p.blockStrength || 0) + 4; } },
      rare: { desc: "Growth↑: Burn aura scales", apply: (p) => { p.blazePower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, burnChance: 0.02 }); } },
    },
    blood_soaked_shirt: {
      uncommon: { desc: "Boost: on kill 12% +HP · DMG stacks", apply: (p) => { p.bloodShirtChance = 0.12; p.bloodShirtDmg = 0.015; } },
      rare: { desc: "Growth↑: kill stacks stronger", apply: (p) => { p.bloodShirtChance = 0.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 20, damageMul: 1.02 }); } },
    },
    defiant_plate: {
      uncommon: { desc: "Boost: higher Def/Regen cap", apply: (p) => { p.defiantCap = 20; p.defiantPower = 1.25; } },
      rare: { desc: "Growth↑: stacks last longer", apply: (p) => { p.defiantCap = 18; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, defense: 1 }); } },
    },
    hunters_garb: {
      uncommon: { desc: "Boost: still DMG cap 65%", apply: (p) => { p.hunterCap = 0.65; p.hunterRate = 1.2; } },
      rare: { desc: "Growth↑: still bonus climbs", apply: (p) => { p.hunterCap = 0.6; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, damageMul: 1.015 }); } },
    },
    shadow_cloak: {
      uncommon: { desc: "Boost: +Block · shadow patches+", apply: (p) => { p.blockStrength = (p.blockStrength || 0) + 6; p.shadowPower = 1.25; } },
      rare: { desc: "Growth↑: evade window scales", apply: (p) => { p.shadowPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, block: 1 }); } },
    },
    beastmasters_hide: {
      uncommon: { desc: "Boost: beast stronger · +Def", apply: (p) => { p.defense = (p.defense || 0) + 4; p.beastPower = 1.3; p.summonDmgMul = (p.summonDmgMul || 1) * 1.1; } },
      rare: { desc: "Growth↑: companion scales", apply: (p) => { p.beastPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, summonDmgMul: 1.04 }); } },
    },
    brokers_cape: {
      uncommon: { desc: "Boost: debuff aura stronger", apply: (p) => { p.brokerPower = 1.3; p.effectChance = (p.effectChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: aura radius/power scales", apply: (p) => { p.brokerPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, effectChance: 0.015 }); } },
    },
    crones_gown: {
      uncommon: { desc: "Boost: plants faster · Decay+", apply: (p) => { p.croneInterval = 0.75; p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.06; } },
      rare: { desc: "Growth↑: swamp potency scales", apply: (p) => { p.croneInterval = 0.7; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, decayChance: 0.02 }); } },
    },
    thunder_cape: {
      uncommon: { desc: "Boost: shockwave CD− · dmg+", apply: (p) => { p.thunderCapeInterval = 0.8; p.thunderCapeDmg = 1.25; } },
      rare: { desc: "Growth↑: lightning dmg scales", apply: (p) => { p.thunderCapeDmg = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, abilityDmgMul: 1.03 }); } },
    },
    // Boots
    plated_boots: {
      uncommon: { desc: "Boost: +Def · +Block · small MS", apply: (p) => { p.defense = (p.defense || 0) + 3; p.blockStrength = (p.blockStrength || 0) + 4; p.speed *= 1.04; } },
      rare: { desc: "Growth↑: Def/Block per levels", apply: (p) => { p.defense = (p.defense || 0) + 2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, defense: 1, block: 1 }); } },
    },
    running_shoes: {
      uncommon: { desc: "Boost: +28% Move Speed", apply: (p) => { p.speed *= 1.08; } },
      rare: { desc: "Growth↑: +MS per 10 levels", apply: (p) => { p.speed *= 1.05; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, speedMul: 1.015 }); } },
    },
    firewalker_boots: {
      uncommon: { desc: "Boost: denser fire trail · Burn+", apply: (p) => { p.firewalkerPower = 1.3; p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: trail dmg scales", apply: (p) => { p.firewalkerPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, burnChance: 0.015 }); } },
    },
    bog_boots: {
      uncommon: { desc: "Boost: goo trail stronger", apply: (p) => { p.bogPower = 1.3; p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.04; } },
      rare: { desc: "Growth↑: Slow/Decay trail scales", apply: (p) => { p.bogPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, effectChance: 0.015 }); } },
    },
    electrostatic_treads: {
      uncommon: { desc: "Boost: charge builds faster", apply: (p) => { p.electroRate = 1.3; p.weaponSparkChance = (p.weaponSparkChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: shockwave power scales", apply: (p) => { p.electroRate = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, sparkChance: 0.015 }); } },
    },
    elven_slippers: {
      uncommon: { desc: "Boost: move→Block stronger", apply: (p) => { p.elvenBlockRate = 1.35; p.blockStrength = (p.blockStrength || 0) + 3; } },
      rare: { desc: "Growth↑: Block gain scales", apply: (p) => { p.elvenBlockRate = 1.25; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, block: 1 }); } },
    },
    pace_setter: {
      uncommon: { desc: "Boost: heal/ASP/MS windows stronger", apply: (p) => { p.pacePower = 1.3; p.regen = (p.regen || 0) + 0.15; } },
      rare: { desc: "Growth↑: pace bonuses scale", apply: (p) => { p.pacePower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, speedMul: 1.01 }); } },
    },
    spike_boots: {
      uncommon: { desc: "Boost: spikes more often · stun+", apply: (p) => { p.spikeCdMul = 0.75; p.spikePower = 1.25; } },
      rare: { desc: "Growth↑: spike dmg scales", apply: (p) => { p.spikePower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, damage: 1 }); } },
    },
    berserker_boots: {
      uncommon: { desc: "Boost: MS→ASP convert +", apply: (p) => { p.berserkConvert = 1.3; p.speed *= 1.04; } },
      rare: { desc: "Growth↑: convert rate scales", apply: (p) => { p.berserkConvert = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, speedMul: 1.01 }); } },
    },
    frost_greaves: {
      uncommon: { desc: "Boost: Frost pulse stronger", apply: (p) => { p.frostGreavePower = 1.3; p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: Frost aura scales", apply: (p) => { p.frostGreavePower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, frostChance: 0.015 }); } },
    },
    swamp_raisers: {
      uncommon: { desc: "Boost: still Decay aura+", apply: (p) => { p.swampPower = 1.3; p.weaponDecayChance = (p.weaponDecayChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: swamp potency scales", apply: (p) => { p.swampPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, decayChance: 0.015 }); } },
    },
    demonic_grasp: {
      uncommon: { desc: "Boost: hands more often · pull+", apply: (p) => { p.graspRate = 1.3; p.force = (p.force || 1) + 0.08; } },
      rare: { desc: "Growth↑: grasp dmg scales", apply: (p) => { p.graspRate = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, force: 0.03 }); } },
    },
    // Gloves
    longfinger_gloves: {
      uncommon: { desc: "Boost: +pickup · gold magnet feel", apply: (p) => { p.pickupRange = (p.pickupRange || 80) * 1.15; p.goldFind = (p.goldFind || 1) * 1.08; } },
      rare: { desc: "Growth↑: pickup per 10 levels", apply: (p) => { p.pickupRange = (p.pickupRange || 80) * 1.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, pickupMul: 1.04 }); } },
    },
    quickhand_gloves: {
      uncommon: { desc: "Boost: +ASP · small Multistrike", apply: (p) => { p.attackCooldown /= 1.08; p.multistrike = (p.multistrike || 1) + 0.08; } },
      rare: { desc: "Growth↑: ASP per 12 levels", apply: (p) => { p.attackCooldown /= 1.05; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, aspMul: 1.02 }); } },
    },
    hunting_gloves: {
      uncommon: { desc: "Boost: Multistrike · extra proj", apply: (p) => { p.multistrike = (p.multistrike || 1) + 0.12; p.extraProjectiles = (p.extraProjectiles || 0) + 1; } },
      rare: { desc: "Growth↑: Multistrike per levels", apply: (p) => { p.multistrike = (p.multistrike || 1) + 0.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, multistrike: 0.04 }); } },
    },
    fencing_gauntlets: {
      uncommon: { desc: "Boost: on block 65% free crit", apply: (p) => { p.fencingChance = 0.65; p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.03); } },
      rare: { desc: "Growth↑: free attacks scale", apply: (p) => { p.fencingChance = 0.6; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 15, critChance: 0.01 }); } },
    },
    invocators_grasp: {
      uncommon: { desc: "Boost: +summon spawn/dmg", apply: (p) => { p.summonCountMul = (p.summonCountMul || 1) * 1.12; p.summonDmgMul = (p.summonDmgMul || 1) * 1.12; } },
      rare: { desc: "Growth↑: summons scale", apply: (p) => { p.summonDmgMul = (p.summonDmgMul || 1) * 1.1; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, summonDmgMul: 1.03 }); } },
    },
    sparking_tips: {
      uncommon: { desc: "Boost: fire sparks stronger", apply: (p) => { p.sparkTipPower = 1.3; p.weaponBurnChance = (p.weaponBurnChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: spark dmg scales", apply: (p) => { p.sparkTipPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, burnChance: 0.015 }); } },
    },
    spellcaster_gloves: {
      uncommon: { desc: "Boost: ability ramp faster", apply: (p) => { p.spellIdleNeed = 1.5; p.abilityDmgMul = (p.abilityDmgMul || 1) * 1.08; } },
      rare: { desc: "Growth↑: ability ramp ceiling", apply: (p) => { p.spellIdleNeed = 1.6; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, abilityDmgMul: 1.025 }); } },
    },
    thornfists: {
      uncommon: { desc: "Boost: thorns+ · crit retaliate", apply: (p) => { p.thorns = (p.thorns || 0) + 8; p.thornCrit = true; } },
      rare: { desc: "Growth↑: thorns per levels", apply: (p) => { p.thorns = (p.thorns || 0) + 6; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, thorns: 2 }); } },
    },
    alchemists_trade: {
      uncommon: { desc: "Boost: absorb faster · stats+", apply: (p) => { p.alchAbsorbRate = 1.3; p.effectChance = (p.effectChance || 0) + 0.06; } },
      rare: { desc: "Growth↑: elemental convert scales", apply: (p) => { p.alchAbsorbRate = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, effectChance: 0.015 }); } },
    },
    bloodstained_wrappings: {
      uncommon: { desc: "Boost: charge→heal stronger", apply: (p) => { p.bloodWrapRate = 1.3; p.regen = (p.regen || 0) + 0.1; } },
      rare: { desc: "Growth↑: leech charge scales", apply: (p) => { p.bloodWrapRate = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, regen: 0.04 }); } },
    },
    frost_thorns: {
      uncommon: { desc: "Boost: ice burst stronger", apply: (p) => { p.frostThornPower = 1.3; p.weaponFrostChance = (p.weaponFrostChance || 0) + 0.05; } },
      rare: { desc: "Growth↑: frost burst scales", apply: (p) => { p.frostThornPower = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 10, frostChance: 0.015 }); } },
    },
    leeching_fingers: {
      uncommon: { desc: "Boost: Decay consume heal+", apply: (p) => { p.leechRate = 1.35; p.regen = (p.regen || 0) + 0.12; } },
      rare: { desc: "Growth↑: leech efficiency scales", apply: (p) => { p.leechRate = 1.25; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, regen: 0.04 }); } },
    },
    unholy_touch: {
      uncommon: { desc: "Boost: +Fragile · effect+", apply: (p) => { p.weaponFragileChance = (p.weaponFragileChance || 0) + 0.1; p.effectChance = (p.effectChance || 0) + 0.06; } },
      rare: { desc: "Growth↑: Fragile chance scales", apply: (p) => { p.weaponFragileChance = (p.weaponFragileChance || 0) + 0.08; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, effectChance: 0.02 }); } },
    },
    thundercharge_gauntlets: {
      uncommon: { desc: "Boost: Crit charge faster", apply: (p) => { p.thunderCritRate = 1.3; p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.03); } },
      rare: { desc: "Growth↑: crit bank scales", apply: (p) => { p.thunderCritRate = 1.2; p.itemGrowth = p.itemGrowth || []; p.itemGrowth.push({ every: 12, critChance: 0.01 }); } },
    },
  };

  // Attach packages onto item defs (descExtra for UI)
  // Rare = base + uncommon boost + rare growth (shown in desc)
  for (const id of ITEM_ORDER) {
    const pkg = ITEM_RARITY_PACKAGES[id];
    if (!pkg || !ITEMS[id]) continue;
    if (pkg.uncommon) {
      ITEMS[id].uncommon = pkg.uncommon;
      ITEMS[id].descUncommon = (ITEMS[id].desc || "") + " · ▲ " + (pkg.uncommon.desc || "");
    }
    if (pkg.rare) {
      ITEMS[id].rare = pkg.rare;
      const bits = [ITEMS[id].desc || ""];
      if (pkg.uncommon && pkg.uncommon.desc) bits.push("▲ " + pkg.uncommon.desc);
      bits.push("◆ " + (pkg.rare.desc || ""));
      ITEMS[id].descRare = bits.filter(Boolean).join(" · ");
    }
  }

  /** Wiki: 1 helmet + 1 amulet + 2 rings + 1 chest + 1 boots + 1 gloves */
  const ITEM_SLOT_LIMITS = { helmet: 1, amulet: 1, ring: 2, chest: 1, boots: 1, gloves: 1 };
  const MAX_ITEMS = 7;
  const MAX_ABILITY_UPGRADES = 2; // per ability per run
  const MAX_LOADOUT = 7;

  /**
   * Blessings (wiki Shrine of Blessings) — permanent meta, paid with banked Gold.
   * Prototype: no quest unlocks — all blessings available from the start.
   * Costs scaled down for short browser runs.
   */
  const BLESSINGS = {
    movement: {
      id: "movement", name: "Movement Speed",
      desc: "+4% Move Speed / rank", maxRank: 5,
      costs: [150, 400, 800, 1400, 2200],
      apply: (p, rank) => { p.speed *= 1 + 0.04 * rank; },
    },
    health: {
      id: "health", name: "Health Capacity",
      desc: "+8% Max HP / rank", maxRank: 5,
      costs: [120, 350, 700, 1200, 1900],
      apply: (p, rank) => {
        const mul = 1 + 0.08 * rank;
        p.maxHp = Math.round(p.maxHp * mul);
        p.hp = p.maxHp;
      },
    },
    damage: {
      id: "damage", name: "Damage",
      desc: "+6% Damage / rank", maxRank: 5,
      costs: [150, 420, 850, 1450, 2300],
      apply: (p, rank) => { p.damage *= 1 + 0.06 * rank; },
    },
    attack_speed: {
      id: "attack_speed", name: "Attack Speed",
      desc: "+5% Attack Speed / rank", maxRank: 5,
      costs: [140, 400, 800, 1350, 2100],
      apply: (p, rank) => { p.attackCooldown /= 1 + 0.05 * rank; },
    },
    pickup: {
      id: "pickup", name: "Pickup Range",
      desc: "+12% Pickup Range / rank", maxRank: 5,
      costs: [80, 220, 450, 750, 1200],
      apply: (p, rank) => { p.pickupRange = (p.pickupRange || 80) * (1 + 0.12 * rank); },
    },
    crit_chance: {
      id: "crit_chance", name: "Crit Chance",
      desc: "+3% Crit Chance / rank", maxRank: 5,
      costs: [160, 450, 900, 1500, 2400],
      apply: (p, rank) => { p.critChance = Math.min(0.95, (p.critChance || 0.1) + 0.03 * rank); },
    },
    regen: {
      id: "regen", name: "Regeneration",
      desc: "+0.2 HP/s / rank", maxRank: 5,
      costs: [100, 280, 550, 950, 1500],
      apply: (p, rank) => { p.regen = (p.regen || 0) + 0.2 * rank; },
    },
    defense: {
      id: "defense", name: "Defense",
      desc: "+5 Defense / rank", maxRank: 5,
      costs: [120, 340, 680, 1100, 1800],
      apply: (p, rank) => { p.defense = (p.defense || 0) + 5 * rank; },
    },
    force: {
      id: "force", name: "Force",
      desc: "+0.08 Force / rank", maxRank: 5,
      costs: [100, 300, 600, 1000, 1600],
      apply: (p, rank) => { p.force = (p.force || 1) + 0.08 * rank; },
    },
    xp_gain: {
      id: "xp_gain", name: "Experience Gain",
      desc: "+6% XP Gain / rank", maxRank: 5,
      costs: [130, 380, 750, 1250, 2000],
      apply: (p, rank) => { p.xpGain = (p.xpGain || 1) * (1 + 0.06 * rank); },
    },
    ability_power: {
      id: "ability_power", name: "Ability Power",
      desc: "+7% Ability Damage / rank", maxRank: 5,
      costs: [140, 400, 820, 1400, 2200],
      apply: (p, rank) => { p.abilityDmgMul = (p.abilityDmgMul || 1) * (1 + 0.07 * rank); },
    },
    block: {
      id: "block", name: "Block Strength",
      desc: "+4 Block Strength / rank", maxRank: 5,
      costs: [110, 320, 640, 1050, 1700],
      apply: (p, rank) => { p.blockStrength = (p.blockStrength || 0) + 4 * rank; },
    },
  };
  const BLESSING_ORDER = Object.keys(BLESSINGS);

  /**
   * Torment Shard shop — permanent meta buys (no unlock gates).
   * Spend shards earned from Agony/Torment runs.
   */
  const SHARD_SHOP = {
    gold_find: {
      id: "gold_find", name: "Greedy Soul",
      desc: "+8% Gold find / rank (in-run)", maxRank: 5,
      costs: [3, 6, 10, 16, 24],
      apply: (p, rank) => { p.goldFind = (p.goldFind || 1) * (1 + 0.08 * rank); },
    },
    bank_bonus: {
      id: "bank_bonus", name: "Vault Tithe",
      desc: "+10% gold banked after run / rank", maxRank: 5,
      costs: [4, 8, 14, 22, 32],
      // applied at endGame, not on player
      bankMulPerRank: 0.1,
    },
    start_hp: {
      id: "start_hp", name: "Iron Will",
      desc: "+12 Max HP / rank", maxRank: 5,
      costs: [2, 5, 9, 14, 20],
      apply: (p, rank) => {
        p.maxHp += 12 * rank;
        p.hp = p.maxHp;
      },
    },
    start_dmg: {
      id: "start_dmg", name: "Blood Edge",
      desc: "+5% Damage / rank", maxRank: 5,
      costs: [3, 7, 12, 18, 26],
      apply: (p, rank) => { p.damage *= 1 + 0.05 * rank; },
    },
    shard_find: {
      id: "shard_find", name: "Shard Magnet",
      desc: "+15% Torment Shards / rank", maxRank: 5,
      costs: [5, 10, 16, 24, 35],
      shardMulPerRank: 0.15,
    },
    blessing_discount: {
      id: "blessing_discount", name: "Favored by Gods",
      desc: "−8% Blessing cost / rank", maxRank: 5,
      costs: [6, 12, 20, 30, 45],
      discountPerRank: 0.08,
    },
    well_heal: {
      id: "well_heal", name: "Living Water",
      desc: "Well heal +10% max HP / rank", maxRank: 3,
      costs: [4, 10, 18],
      wellHealPerRank: 0.1,
    },
    agony_start: {
      id: "agony_start", name: "Agony Spark",
      desc: "Start Agony meter +12% / rank (if Agony on)", maxRank: 5,
      costs: [5, 11, 18, 28, 40],
      agonyMeterPerRank: 0.12,
    },
  };
  const SHARD_SHOP_ORDER = Object.keys(SHARD_SHOP);

  /** Well of Life — permanent loadout (all items available; no wiki locks) */
  const WELL = {
    maxLoadout: MAX_LOADOUT,
    /** Gold paid when depositing an item into the well mid-run (sell-back) */
    depositGoldMul: 8,
    baseHeal: 0.3, // 30% max HP once per run
  };

  const ITEM_SLOT_LABELS = {
    helmet: "Helmet", amulet: "Amulet", ring: "Ring",
    chest: "Chest", boots: "Boots", gloves: "Gloves",
  };

  /**
   * Halls from https://hot.fandom.com/wiki/Hall
   * Run length: 5 minutes then Lord spawns (prototype).
   * hallStrength min/max scaled for browser balance.
   */
  const RUN_DURATION_SEC = 5 * 60; // 5 minutes

  const HALLS = {
    haunted_caverns: {
      id: "haunted_caverns",
      index: 1,
      name: "Haunted Caverns",
      wiki: "https://hot.fandom.com/wiki/Haunted_Caverns",
      group: "base",
      blurb: "Sảnh I · Imp · Skeleton · Slime · Hellhound",
      theme: {
        style: "cavern",
        floorA: "#1a1428", floorB: "#100c18", floorC: "#0c0a12",
        accent: "rgba(140,70,200,0.45)", ritual: "rgba(160,80,220,0.22)",
        prop: "#2a1a40", propLite: "#4a3080", glow: "rgba(160,100,255,0.2)",
      },
      // wiki: Skeleton, Slime, Imp, Hellhound, Poison Slime + variants
      enemies: ["imp", "hellhound", "slime", "skeleton", "poison_slime", "skeleton_lance", "skeleton_mage", "skeleton_shield"],
      enemyWeights: [3, 3, 2, 2, 1.5, 1, 1, 0.7],
      eliteChance: 0.08,
      minibossTypes: ["imp_chieftain", "skeleton_lord", "lich"],
      minibossAt: [0.2, 0.47, 0.73], // ~wiki 24m / 16m / 8m remaining on 30m → scaled to 5m
      boss: BOSSES.lord_of_pain,
      hallStrength: { min: 1, max: 2.4 },
      spawn: { baseInterval: 1.35, minInterval: 0.32, burstBase: 1 },
    },
    ember_grounds: {
      id: "ember_grounds",
      index: 2,
      name: "Ember Grounds",
      wiki: "https://hot.fandom.com/wiki/Ember_Grounds",
      group: "base",
      blurb: "Sảnh II · Scorched · Magma Slime · Imp",
      theme: {
        style: "ember",
        floorA: "#221410", floorB: "#180c08", floorC: "#100804",
        accent: "rgba(255,90,30,0.5)", ritual: "rgba(255,100,40,0.28)",
        prop: "#3a1810", propLite: "#c04020", glow: "rgba(255,80,20,0.25)",
      },
      enemies: ["scorched", "magma_slime", "imp", "hellhound", "poison_slime", "slime"],
      enemyWeights: [3, 2.5, 2, 2, 1.2, 1],
      eliteChance: 0.1,
      minibossTypes: ["flamedancer", "wraith_warlord", "wyrm_queen"],
      minibossAt: [0.2, 0.53, 0.8],
      boss: BOSSES.lord_of_regret,
      hallStrength: { min: 1.15, max: 2.7 },
      spawn: { baseInterval: 1.25, minInterval: 0.3, burstBase: 1 },
    },
    forgotten_viaduct: {
      id: "forgotten_viaduct",
      index: 3,
      name: "Forgotten Viaduct",
      wiki: "https://hot.fandom.com/wiki/Forgotten_Viaduct",
      group: "base",
      blurb: "Sảnh III · Wraith · Gargoyle · Ghost",
      theme: {
        style: "viaduct",
        floorA: "#181e2a", floorB: "#10141c", floorC: "#0a0e16",
        accent: "rgba(120,140,200,0.4)", ritual: "rgba(150,170,220,0.2)",
        prop: "#3a4458", propLite: "#6a7890", glow: "rgba(140,160,220,0.18)",
      },
      enemies: ["wraith", "gargoyle", "possessed_effigy", "marching_ghost"],
      enemyWeights: [3, 2.5, 1.5, 2],
      eliteChance: 0.1,
      minibossTypes: ["wraith_horseman", "frost_knight", "hydra"],
      minibossAt: [0.2, 0.47, 0.73],
      boss: BOSSES.lord_of_despair,
      hallStrength: { min: 1.25, max: 3.0 },
      spawn: { baseInterval: 1.2, minInterval: 0.28, burstBase: 1 },
    },
    frozen_depths: {
      id: "frozen_depths",
      index: 4,
      name: "Frozen Depths",
      wiki: "https://hot.fandom.com/wiki/Frozen_Depths",
      group: "base",
      blurb: "Sảnh IV · Frost Ghoul · Crawler · Bear",
      theme: {
        style: "frozen",
        floorA: "#142830", floorB: "#0c1a24", floorC: "#081018",
        accent: "rgba(120,200,240,0.45)", ritual: "rgba(160,230,255,0.22)",
        prop: "#2a5060", propLite: "#80c0e0", glow: "rgba(140,210,255,0.22)",
      },
      enemies: [
        "frost_slime", "frost_crawler", "frost_ghoul", "frost_guard", "frost_bear",
        "frost_skull", "frost_skeleton", "frost_skeleton_mage", "snow_effigy", "ice_wyrm",
      ],
      enemyWeights: [2, 2.5, 2.5, 1.5, 1.2, 1.5, 1.5, 1, 1, 1],
      eliteChance: 0.11,
      minibossTypes: ["basilisk", "polar_beast", "twisted_construct", "elder_giant"],
      minibossAt: [0.28, 0.47, 0.6, 0.8],
      boss: BOSSES.lord_of_hate,
      hallStrength: { min: 1.35, max: 3.2 },
      spawn: { baseInterval: 1.15, minInterval: 0.28, burstBase: 1 },
    },
    chambers_of_dissonance: {
      id: "chambers_of_dissonance",
      index: 5,
      name: "Chambers of Dissonance",
      wiki: "https://hot.fandom.com/wiki/Chambers_of_Dissonance",
      group: "base",
      blurb: "Sảnh V · Capra · Homunculus · Void",
      theme: {
        style: "dissonance",
        floorA: "#201028", floorB: "#140c1a", floorC: "#100818",
        accent: "rgba(220,60,180,0.5)", ritual: "rgba(255,80,200,0.25)",
        prop: "#401840", propLite: "#c040a0", glow: "rgba(255,60,200,0.2)",
      },
      enemies: ["ghoul", "homunculus", "capra_fiend", "shapeshifter", "demonic_construct", "void_syphon"],
      enemyWeights: [2, 2.5, 2.5, 1.5, 1.2, 1.5],
      eliteChance: 0.12,
      minibossTypes: ["void_caller", "the_village", "twisted_knight"],
      minibossAt: [0.33, 0.67, 0.55],
      boss: BOSSES.lord_of_discord,
      hallStrength: { min: 1.4, max: 3.3 },
      spawn: { baseInterval: 1.1, minInterval: 0.26, burstBase: 1 },
    },
    the_vault: {
      id: "the_vault",
      index: 6,
      name: "The Vault",
      wiki: "https://hot.fandom.com/wiki/The_Vault",
      group: "final",
      blurb: "FINAL · Vàng · Imp · Skeleton · Mimic",
      theme: {
        style: "vault",
        floorA: "#221c12", floorB: "#16120c", floorC: "#100c08",
        accent: "rgba(212,168,75,0.5)", ritual: "rgba(240,200,80,0.28)",
        prop: "#3a3020", propLite: "#d4a84b", glow: "rgba(255,200,80,0.2)",
      },
      enemies: ["vault_imp", "vault_slime", "vault_hound", "vault_skeleton", "vault_mage", "imp", "slime", "hellhound"],
      enemyWeights: [2.5, 2, 2, 2, 1.5, 1, 1, 1],
      eliteChance: 0.14,
      minibossTypes: ["mimic", "skeleton_lord", "imp_chieftain"],
      minibossAt: [0.33, 0.55, 0.75],
      boss: BOSSES.lord_of_greed,
      hallStrength: { min: 1.5, max: 3.5 },
      spawn: { baseInterval: 1.05, minInterval: 0.25, burstBase: 2 },
    },
    boglands: {
      id: "boglands",
      index: 7,
      name: "Boglands",
      wiki: "https://hot.fandom.com/wiki/Boglands",
      group: "dlc",
      blurb: "BONUS · Blight · Crawler · Ghoul · Worm",
      theme: {
        style: "bog",
        floorA: "#142018", floorB: "#0c1410", floorC: "#08100c",
        accent: "rgba(80,160,70,0.45)", ritual: "rgba(100,180,80,0.25)",
        prop: "#2a3820", propLite: "#508040", glow: "rgba(100,180,80,0.18)",
      },
      enemies: ["bog_imp", "bog_slime", "bog_crawler", "bog_ghoul", "mire_hound", "swamp_effigy", "poison_slime"],
      enemyWeights: [2.5, 2.5, 2.5, 2, 2, 1.2, 1.5],
      eliteChance: 0.12,
      minibossTypes: ["evil_tree", "blight_worm"],
      minibossAt: [0.35, 0.7],
      boss: BOSSES.lord_of_blight,
      hallStrength: { min: 1.45, max: 3.6 },
      spawn: { baseInterval: 1.1, minInterval: 0.26, burstBase: 1 },
    },
  };

  const HALL_ORDER = [
    "haunted_caverns",
    "ember_grounds",
    "forgotten_viaduct",
    "frozen_depths",
    "chambers_of_dissonance",
    "the_vault",
    "boglands",
  ];

  const HALL = HALLS.haunted_caverns;

  /**
   * Abilities — stats from https://hot.fandom.com/wiki/Ability (+ each ability page).
   * Damage scaled via DMG(); range wiki m via RNG().
   * type → combat | element → VFX | dmgType → UI group (physical|magic|elemental|bard)
   * https://hot.fandom.com/wiki/Damage
   */
  const ABILITY_DMG_TYPES = {
    physical: { id: "physical", label: "Physical", short: "PHY", color: "#d4a84b" },
    magic: { id: "magic", label: "Magic", short: "MAG", color: "#a070e0" },
    elemental: { id: "elemental", label: "Elemental", short: "ELE", color: "#50c0b0" },
    bard: { id: "bard", label: "Bard", short: "BRD", color: "#e070b0" },
  };
  const ABILITY_DMG_ORDER = ["physical", "magic", "elemental", "bard"];

  const ABILITIES = {
    // ── Physical ───────────────────────────────────────────
    phantom_needles: {
      id: "phantom_needles", name: "Phantom Needles", color: "#d0dce8",
      group: "free", type: "needle", element: "physical", dmgType: "physical",
      // wiki: ASP 2.50/s · Dmg 50 · Crit 33% · CritB 200% · Pierce 6 · Range 10m
      damage: DMG(50), attackSpeed: 2.5, count: 1, pierce: 6,
      critChance: 0.33, critBonus: 2.0, range: RNG(10),
      desc: "Kim phantom khóa mục tiêu · Pierce 6 · Crit cao (Physical)",
    },
    arcane_splinters: {
      id: "arcane_splinters", name: "Arcane Splinters", color: "#a898ff",
      group: "free", type: "splinter", element: "magic", dmgType: "magic",
      // wiki: ASP ~0.20 · Dmg 100 · Crit 10% · CritB 200% · cone 75°
      damage: DMG(100), attackSpeed: 0.35, count: 8, pierce: 1,
      critChance: 0.1, critBonus: 2.0, range: 300, coneDeg: 75,
      desc: "Mảnh arcane bắn nón 75° · 8 projectile (Magic)",
    },
    astronomers_orbs: {
      id: "astronomers_orbs", name: "Astronomer's Orbs", color: "#e8c860",
      group: "free", type: "orbit", element: "physical", dmgType: "physical",
      // wiki: Dmg 25 · Crit 33% · CritB 100% · 3 orbs · orbit ~6m
      damage: DMG(25), count: 3, orbitRadius: RNG(6), orbitSpeed: 2.4,
      critChance: 0.33, critBonus: 1.0,
      desc: "3 quả cầu quay quanh · chạm là sát thương (Summon)",
    },
    lightning_strikes: {
      id: "lightning_strikes", name: "Lightning Strikes", color: "#70c8ff",
      group: "free", type: "lightning", element: "lightning", dmgType: "elemental",
      damage: DMG(280), attackSpeed: 0.55, count: 3,
      critChance: 0.15, critBonus: 2.5, range: RNG(12), aoe: 42,
      desc: "Sét đánh mục tiêu ngẫu nhiên · AOE nhỏ (Lightning)",
    },
    // ── Locked (open in prototype) ─────────────────────────
    flame_strike: {
      id: "flame_strike", name: "Flame Strike", color: "#ff6a30",
      group: "locked", type: "flame_wave", element: "fire", dmgType: "elemental",
      damage: DMG(100), attackSpeed: 0.55, count: 7, pierce: 2,
      critChance: 0.12, critBonus: 1.5, range: RNG(8), coneDeg: 55,
      desc: "Sóng lửa nón phía trước · Fire",
    },
    frost_avalanche: {
      id: "frost_avalanche", name: "Frost Avalanche", color: "#90e0ff",
      group: "locked", type: "frost_nova", element: "ice", dmgType: "elemental",
      damage: DMG(110), attackSpeed: 0.4, aoe: 150,
      critChance: 0.1, critBonus: 1.5,
      desc: "Sóng băng tỏa tròn · làm chậm (Ice)",
    },
    hailstorm: {
      id: "hailstorm", name: "Hailstorm", color: "#c8ecff",
      group: "locked", type: "hail", element: "ice", dmgType: "elemental",
      damage: DMG(70), attackSpeed: 0.9, count: 8,
      critChance: 0.18, critBonus: 1.5, range: RNG(10), aoe: 36,
      desc: "Mưa đá rơi từ trời lên vùng địch (Ice)",
    },
    ring_blades: {
      id: "ring_blades", name: "Ring Blades", color: "#e07070",
      group: "locked", type: "orbit", element: "physical", dmgType: "physical",
      damage: DMG(100), count: 4, orbitRadius: 58, orbitSpeed: 4.2,
      critChance: 0.33, critBonus: 2.0,
      desc: "Lưỡi đao quay sát người · Physical",
    },
    transfixion: {
      id: "transfixion", name: "Transfixion", color: "#b0f070",
      group: "locked", type: "transfixion", element: "physical", dmgType: "physical",
      // wiki: ASP 0.50 · Projectiles 3 · cone 20°
      damage: DMG(100), attackSpeed: 0.5, count: 3, pierce: 4,
      critChance: 0.35, critBonus: 1.5, range: RNG(12), coneDeg: 20,
      desc: "3 mũi xuyên nón hẹp 20° (Physical)",
    },
    dragons_breath: {
      id: "dragons_breath", name: "Dragon's Breath", color: "#ff5020",
      group: "locked", type: "flame_wave", element: "fire", dmgType: "elemental",
      damage: DMG(100), attackSpeed: 1.8, count: 10, pierce: 3,
      critChance: 0.05, critBonus: 1.0, range: RNG(7), coneDeg: 48,
      desc: "Phun lửa liên tục nón rộng · Fire",
    },
    radiant_aura: {
      id: "radiant_aura", name: "Radiant Aura", color: "#f0e090",
      group: "locked", type: "aura", element: "magic", dmgType: "magic",
      damage: DMG(90), attackSpeed: 0.65, aoe: 110, heal: 4,
      critChance: 0.15, critBonus: 1.0,
      desc: "Hào quang holy · dmg + hồi máu (Magic)",
    },
    clay_golem: {
      id: "clay_golem", name: "Clay Golem", color: "#b09060",
      group: "locked", type: "golem", element: "physical", dmgType: "physical",
      damage: DMG(120), attackSpeed: 0.45, count: 1,
      critChance: 0.15, critBonus: 2.0,
      desc: "Golem đất theo bạn · chém + roll (Summon)",
    },
    meteor_strike: {
      id: "meteor_strike", name: "Meteor Strike", color: "#ff8830",
      group: "locked", type: "meteor", element: "fire", dmgType: "elemental",
      damage: DMG(180), attackSpeed: 0.28, count: 2, aoe: 75,
      critChance: 0.5, critBonus: 1.5, range: RNG(11),
      desc: "Thiên thạch rơi trúng địch · AOE (Fire)",
    },
    kugelblitz: {
      id: "kugelblitz", name: "Kugelblitz", color: "#50e0ff",
      group: "locked", type: "kugel", element: "lightning", dmgType: "elemental",
      // wiki: ball lightning · pulses shockwaves
      damage: DMG(100), attackSpeed: 0.33, count: 1, pierce: 99,
      critChance: 0.2, critBonus: 1.0, range: RNG(15), aoe: 48,
      desc: "Cầu sét bay · pulse AOE (Lightning / ball lightning)",
    },
    arcane_rift: {
      id: "arcane_rift", name: "Arcane Rift", color: "#c050ff",
      group: "locked", type: "rift", element: "magic", dmgType: "magic",
      damage: DMG(120), attackSpeed: 0.45, aoe: 65, count: 2,
      critChance: 0.2, critBonus: 1.5, range: RNG(9),
      desc: "Rift nổ tại vị trí quái · Magic AOE",
    },
    spirit_warrior: {
      id: "spirit_warrior", name: "Spirit Warrior", color: "#70e0b0",
      group: "locked", type: "spirit", element: "magic", dmgType: "magic",
      // wiki: summon max 2 · dash · melee
      damage: DMG(100), attackSpeed: 0.5, count: 2,
      critChance: 0.15, critBonus: 1.0, range: RNG(7), aoe: 50,
      desc: "Linh hồn chiến binh dash · đánh melee (Summon)",
    },
    morning_star: {
      id: "morning_star", name: "Morning Star", color: "#d4a84b",
      group: "locked", type: "orbit", element: "physical", dmgType: "physical",
      // wiki: flail · range 7.5m
      damage: DMG(120), count: 1, orbitRadius: RNG(7.5), orbitSpeed: 2.8,
      critChance: 0.33, critBonus: 1.0, chainDamage: true,
      desc: "Chùy xích vung quanh · đập + xích (Physical)",
    },
    spectral_fists: {
      id: "spectral_fists", name: "Spectral Fists", color: "#d8d8ff",
      group: "locked", type: "fists", element: "magic", dmgType: "magic",
      // wiki: high dmg punches · ASP ~0.33
      damage: DMG(200), attackSpeed: 0.45, count: 2, aoe: 55,
      critChance: 0.1, critBonus: 1.0, range: RNG(8),
      desc: "Nắm đấm ma bay đấm địch (Magic)",
    },
    // ── Bard ───────────────────────────────────────────────
    confetti_cannon: {
      id: "confetti_cannon", name: "Confetti Cannon", color: "#ff70c0",
      group: "bard", type: "splinter", element: "physical", dmgType: "bard",
      damage: DMG(60), attackSpeed: 0.85, count: 10, pierce: 1,
      critChance: 0.15, critBonus: 1.5, range: 270, coneDeg: 90,
      desc: "Pháo confetti nón rộng · nhiều mảnh (Bard)",
    },
    kick_bass: {
      id: "kick_bass", name: "Kick Bass", color: "#e050a0",
      group: "bard", type: "frost_nova", element: "physical", dmgType: "bard",
      damage: DMG(110), attackSpeed: 0.55, aoe: 130,
      critChance: 0.1, critBonus: 1.5, knockback: true,
      desc: "Sóng bass tỏa tròn · knockback mạnh (Bard)",
    },
    killer_riff: {
      id: "killer_riff", name: "Killer Riff", color: "#ff3080",
      group: "bard", type: "needle", element: "physical", dmgType: "bard",
      damage: DMG(140), attackSpeed: 0.85, count: 1, pierce: 10,
      critChance: 0.28, critBonus: 2.0, range: 420,
      desc: "Riff xuyên đội hình · pierce cao (Bard)",
    },
    mosh_pit: {
      id: "mosh_pit", name: "Mosh Pit", color: "#e090c0",
      group: "bard", type: "aura", element: "physical", dmgType: "bard",
      damage: DMG(95), attackSpeed: 0.75, aoe: 115,
      critChance: 0.1, critBonus: 1.2,
      desc: "Vòng mosh quanh bạn · dmg liên tục (Bard)",
    },
    pyrotechnics: {
      id: "pyrotechnics", name: "Pyrotechnics", color: "#ff7030",
      group: "bard", type: "meteor", element: "fire", dmgType: "bard",
      damage: DMG(110), attackSpeed: 0.48, count: 4, aoe: 52,
      critChance: 0.2, critBonus: 1.5, range: RNG(9),
      desc: "Pháo hoa nổ theo đám địch (Bard / Fire)",
    },
    wall_of_death: {
      id: "wall_of_death", name: "Wall of Death", color: "#c03070",
      group: "bard", type: "wall", element: "physical", dmgType: "bard",
      damage: DMG(90), attackSpeed: 0.6, count: 1,
      critChance: 0.15, critBonus: 1.5, range: 180,
      desc: "Tường sóng phía trước · quét ngang (Bard)",
    },
    // ── Boglands DLC ───────────────────────────────────────
    enlightenment: {
      id: "enlightenment", name: "Enlightenment", color: "#f8f0a0",
      group: "boglands", type: "beam", element: "magic", dmgType: "magic",
      damage: DMG(140), attackSpeed: 0.55, pierce: 8,
      critChance: 0.2, critBonus: 1.5, range: RNG(12),
      desc: "Tia giác ngộ xuyên địch (Boglands)",
    },
    prismatic_cascade: {
      id: "prismatic_cascade", name: "Prismatic Cascade", color: "#40c0b0",
      group: "boglands", type: "prismatic", element: "magic", dmgType: "elemental",
      damage: DMG(80), attackSpeed: 0.65, count: 8, pierce: 2,
      critChance: 0.2, critBonus: 1.3, range: 250,
      desc: "Bão elemental 8 hướng (Alchemist)",
    },
    undergrowth: {
      id: "undergrowth", name: "Undergrowth", color: "#50a040",
      group: "boglands", type: "plants", element: "earth", dmgType: "elemental",
      damage: DMG(85), attackSpeed: 0.55, count: 5, aoe: 48,
      critChance: 0.15, critBonus: 1.2, range: 170,
      desc: "Bụi gai nổ · Decay quanh địch (Crone)",
    },
  };

  const MAX_ABILITIES = 6;

  /** Order for character select UI — grouped by dmgType */
  const HERO_ORDER = [
    // Physical
    "swordsman", "archer", "shield_maiden", "beast_huntress", "landsknecht",
    // Magic
    "cleric", "warlock", "sage",
    // Elemental
    "exterminator", "sorceress", "norseman", "crone", "alchemist",
    // Other
    "bard",
  ];

  return {
    HEROES, HERO_DMG_TYPES, HERO_DMG_ORDER,
    ENEMIES, BOSSES, TRAITS, ABILITY_UPGRADES, ABILITY_TRAIT_TEMPLATES, WEAPON_PROF, BALANCE, ITEMS, ITEM_ORDER,
    HALL, HALLS, HALL_ORDER, RUN_DURATION_SEC, RUN_DURATIONS, TORMENT_DURATIONS,
    AGONY, ARTIFACTS, ARTIFACT_ORDER, TORMENT, TORMENT_MODE,
    BLESSINGS, BLESSING_ORDER, SHARD_SHOP, SHARD_SHOP_ORDER, WELL, MAX_LOADOUT,
    ITEM_SLOT_LIMITS, ITEM_SLOT_LABELS, ITEM_RARITY, POTIONS, POTION_ORDER, BARRELS,
    MARKS, MARK_ORDER, DEFAULT_SETTINGS,
    HERO_ORDER, ABILITIES, ABILITY_DMG_TYPES, ABILITY_DMG_ORDER, MAX_ABILITIES, MAX_ITEMS, MAX_ABILITY_UPGRADES,
    HP, DMG, SPD, RNG,
  };
})();
