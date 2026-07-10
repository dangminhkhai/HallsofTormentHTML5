/**
 * Việt hóa toàn bộ nội dung hiển thị (HOT_DATA + nhãn UI).
 * short = label đầy đủ (không viết tắt PHY/MAG/HP…).
 */
(function () {
  const D = window.HOT_DATA;
  if (!D) return;

  function set(obj, map) {
    if (!obj || !map) return;
    for (const [k, v] of Object.entries(map)) {
      if (v == null) continue;
      if (typeof v === "object" && !Array.isArray(v)) {
        if (!obj[k]) continue;
        if (v.name != null) obj[k].name = v.name;
        if (v.desc != null) obj[k].desc = v.desc;
        if (v.weapon != null) obj[k].weapon = v.weapon;
        if (v.blurb != null) obj[k].blurb = v.blurb;
        if (v.label != null) obj[k].label = v.label;
        if (v.short != null) obj[k].short = v.short;
        if (v.skill && obj[k].skill) {
          if (v.skill.name) obj[k].skill.name = v.skill.name;
          if (v.skill.desc) obj[k].skill.desc = v.skill.desc;
        }
      } else if (typeof v === "string") {
        if (obj[k] && typeof obj[k] === "object" && "name" in obj[k]) obj[k].name = v;
        else if (obj[k] && typeof obj[k] === "object" && "label" in obj[k]) obj[k].label = v;
      }
    }
  }

  // ── Loại sát thương (hiển thị đầy đủ, không rút gọn) ──
  if (D.HERO_DMG_TYPES) {
    // short = badge gọn (không đè portrait); label = tên đầy đủ
    D.HERO_DMG_TYPES.physical = { id: "physical", label: "Vật lý", short: "VL", color: "#d4a84b" };
    D.HERO_DMG_TYPES.magic = { id: "magic", label: "Phép thuật", short: "PT", color: "#a070e0" };
    D.HERO_DMG_TYPES.elemental = { id: "elemental", label: "Nguyên tố", short: "NT", color: "#50c0b0" };
    D.HERO_DMG_TYPES.other = { id: "other", label: "Khác", short: "K", color: "#90a0b0" };
  }
  if (D.ABILITY_DMG_TYPES) {
    D.ABILITY_DMG_TYPES.physical = { id: "physical", label: "Vật lý", short: "VL", color: "#d4a84b" };
    D.ABILITY_DMG_TYPES.magic = { id: "magic", label: "Phép thuật", short: "PT", color: "#a070e0" };
    D.ABILITY_DMG_TYPES.elemental = { id: "elemental", label: "Nguyên tố", short: "NT", color: "#50c0b0" };
    D.ABILITY_DMG_TYPES.bard = { id: "bard", label: "Thi sĩ", short: "TS", color: "#e070b0" };
  }

  // ── Độ hiếm / slot trang bị ──
  if (D.ITEM_RARITY) {
    if (D.ITEM_RARITY.common) { D.ITEM_RARITY.common.label = "Thường"; }
    if (D.ITEM_RARITY.uncommon) { D.ITEM_RARITY.uncommon.label = "Hiếm vừa"; }
    if (D.ITEM_RARITY.rare) { D.ITEM_RARITY.rare.label = "Cực hiếm"; }
  }
  if (D.ITEM_SLOT_LABELS) {
    D.ITEM_SLOT_LABELS.helmet = "Mũ";
    D.ITEM_SLOT_LABELS.amulet = "Dây chuyền";
    D.ITEM_SLOT_LABELS.ring = "Nhẫn";
    D.ITEM_SLOT_LABELS.chest = "Áo giáp";
    D.ITEM_SLOT_LABELS.boots = "Giày";
    D.ITEM_SLOT_LABELS.gloves = "Găng";
  }

  // ── Hero ──
  const heroes = {
    swordsman: {
      name: "Kiếm sĩ", weapon: "Kiếm hai tay Zweihänder",
      skill: { name: "Lưỡi đao vòng", desc: "Lưỡi đao xoáy quanh thân" },
      blurb: ["Kiếm hai tay · tấn hình nón", "Máu / Phòng thủ cao · Chí mạng 20%", "Kỹ năng: Lưỡi đao vòng"],
    },
    archer: {
      name: "Cung thủ", weapon: "Cung",
      skill: { name: "Mưa tên xuyên", desc: "Mưa đạn xuyên qua địch" },
      blurb: ["Cung · 3 mũi theo nón", "Chí mạng 33% · sát thương chí mạng +200%", "Kỹ năng: Mưa tên xuyên"],
    },
    exterminator: {
      name: "Diệt trừ giả", weapon: "Phun lửa",
      skill: { name: "Hơi thở rồng", desc: "Phun lửa hình nón rộng" },
      blurb: ["Lửa nguyên tố · tốc độ đánh cao", "Đốt cháy địch", "Kỹ năng: Hơi thở rồng"],
    },
    cleric: {
      name: "Thầy tu", weapon: "Chùy thần thánh",
      skill: { name: "Hào quang rạng rỡ", desc: "Hào quang gây sát thương và hồi máu" },
      blurb: ["Vũ khí nặng · tách nhiều đòn", "Hồi máu / chắn", "Kỹ năng: Hào quang rạng rỡ"],
    },
    warlock: {
      name: "Phù thủy bóng tối", weapon: "Phép triệu hồi",
      skill: { name: "Đội quân ma", desc: "Bầy linh hồn vòng quanh" },
      blurb: ["Triệu hồi · sát thương phép", "Quỷ / bộ xương hỗ trợ", "Kỹ năng: Đội quân ma"],
    },
    sorceress: {
      name: "Nữ pháp sư", weapon: "Gậy sét",
      skill: { name: "Thiên thạch", desc: "Thiên thạch nổ diện rộng" },
      blurb: ["Sét / thiên thạch", "Sát thương phép cao", "Kỹ năng: Thiên thạch"],
    },
    shield_maiden: {
      name: "Nữ chiến binh khiên", weapon: "Khiên & kiếm",
      skill: { name: "Đập khiên", desc: "Đập nón — sát thương theo Sức chắn" },
      blurb: ["Phòng thủ / chắn mạnh", "Sát thương gắn với khiên", "Kỹ năng: Đập khiên"],
    },
    beast_huntress: {
      name: "Nữ thợ săn thú", weapon: "Nỏ & chó săn",
      skill: { name: "Bầy chó săn", desc: "Gọi chó săn cắn quanh" },
      blurb: ["Tầm xa · triệu hồi thú", "Di chuyển nhanh", "Kỹ năng: Bầy chó săn"],
    },
    norseman: {
      name: "Người phương Bắc", weapon: "Rìu băng",
      skill: { name: "Bùng nổ băng", desc: "Sóng băng làm chậm và gây sát thương" },
      blurb: ["Băng · tốc độ đánh cao", "Làm chậm địch", "Kỹ năng: Bùng nổ băng"],
    },
    landsknecht: {
      name: "Lính đánh thuê", weapon: "Súng hỏa mai / lựu đạn",
      skill: { name: "Lựu đạn", desc: "Ném lựu đạn nổ" },
      blurb: ["Đạn đạo · xuyên", "Sát thương vật lý", "Kỹ năng: Lựu đạn"],
    },
    sage: {
      name: "Hiền giả", weapon: "Sách phép / khe nứt",
      skill: { name: "Khe nứt huyền bí", desc: "Khe nứt nổ và lan chuỗi" },
      blurb: ["Khả năng là vũ khí chính", "Nâng cấp khả năng mạnh", "Kỹ năng: Khe nứt huyền bí"],
    },
    bard: {
      name: "Thi sĩ", weapon: "Nhạc cụ",
      skill: { name: "Vòng mosh", desc: "Vòng nhạc rock — sát thương và đẩy lùi" },
      blurb: ["Nhạc · đẩy lùi / hút", "Khả năng thi sĩ", "Kỹ năng: Vòng mosh"],
    },
    crone: {
      name: "Mụ phù thủy đầm lầy", weapon: "Gậy mục nát",
      skill: { name: "Bụi gai ngầm", desc: "Bụi gai nổ gây Mục nát" },
      blurb: ["Đất / Mục nát", "Cây đầm lầy", "Kỹ năng: Bụi gai ngầm"],
    },
    alchemist: {
      name: "Giả kim thuật sĩ", weapon: "Bình nguyên tố",
      skill: { name: "Thác lũ lăng kính", desc: "Bão nguyên tố nhiều hướng" },
      blurb: ["Mọi nguyên tố", "Bình thuốc / hấp thụ", "Kỹ năng: Thác lũ lăng kính"],
    },
  };
  if (D.HEROES) {
    for (const [id, v] of Object.entries(heroes)) {
      const h = D.HEROES[id];
      if (!h) continue;
      h.name = v.name;
      if (v.weapon) h.weapon = v.weapon;
      if (v.blurb) h.blurb = v.blurb;
      if (v.skill && h.skill) {
        h.skill.name = v.skill.name;
        h.skill.desc = v.skill.desc;
      }
    }
  }

  // ── Khả năng (tên đầy đủ + mô tả tiếng Việt) ──
  const abilities = {
    phantom_needles: { name: "Kim bóng ma", desc: "Kim bóng ma khóa mục tiêu · Xuyên 6 · Chí mạng cao (Vật lý)" },
    arcane_splinters: { name: "Mảnh huyền bí", desc: "Mảnh phép bắn hình nón 75° · 8 viên đạn (Phép thuật)" },
    astronomers_orbs: { name: "Quả cầu nhà thiên văn", desc: "Quả cầu quay quanh thân · sát thương quỹ đạo (Phép thuật)" },
    lightning_strikes: { name: "Sét đánh", desc: "Sét giáng xuống địch gần · gây Điện hóa (Nguyên tố)" },
    flame_strike: { name: "Đòn lửa", desc: "Vệt lửa về phía trước · gây Đốt cháy (Nguyên tố)" },
    frost_avalanche: { name: "Tuyết lở băng", desc: "Sóng băng tỏa tròn · làm chậm (Nguyên tố)" },
    hailstorm: { name: "Mưa đá", desc: "Mưa đá rơi quanh vùng · băng giá (Nguyên tố)" },
    ring_blades: { name: "Lưỡi đao vòng", desc: "Lưỡi đao xoáy quanh · sát thương vật lý liên tục" },
    transfixion: { name: "Mưa tên xuyên", desc: "Mưa mũi tên xuyên đội hình (Vật lý)" },
    dragons_breath: { name: "Hơi thở rồng", desc: "Phun lửa hình nón rộng · Đốt cháy (Nguyên tố)" },
    radiant_aura: { name: "Hào quang rạng rỡ", desc: "Hào quang quanh bạn · sát thương và hồi máu (Phép thuật)" },
    clay_golem: { name: "Golem đất sét", desc: "Triệu hồi golem cận chiến (Phép thuật)" },
    meteor_strike: { name: "Thiên thạch", desc: "Thiên thạch rơi trúng đám địch (Nguyên tố)" },
    kugelblitz: { name: "Quả cầu sét", desc: "Quả cầu sét bay tìm địch · Điện hóa (Nguyên tố)" },
    arcane_rift: { name: "Khe nứt huyền bí", desc: "Khe nứt nổ và lan chuỗi sát thương (Phép thuật)" },
    ghost_fists: { name: "Nắm đấm ma", desc: "Nắm đấm ma bay đấm địch (Phép thuật)" },
    spectral_fists: { name: "Nắm đấm quang phổ", desc: "Nắm đấm ma bay đấm địch (Phép thuật)" },
    morning_star: { name: "Chùy xích", desc: "Chùy xích vung quanh · đập và xích (Vật lý)" },
    confetti_cannon: { name: "Pháo confetti", desc: "Pháo confetti hình nón · nhiều mảnh (Thi sĩ)" },
    kick_bass: { name: "Nhịp bass", desc: "Sóng bass tỏa tròn · đẩy lùi mạnh (Thi sĩ)" },
    killer_riff: { name: "Riff chết chóc", desc: "Riff xuyên đội hình · xuyên cao (Thi sĩ)" },
    mosh_pit: { name: "Vòng mosh", desc: "Vòng mosh quanh bạn · sát thương liên tục (Thi sĩ)" },
    pyrotechnics: { name: "Pháo hoa", desc: "Pháo hoa nổ theo đám địch (Thi sĩ / Lửa)" },
    wall_of_death: { name: "Tường chết chóc", desc: "Tường sóng phía trước · quét ngang (Thi sĩ)" },
    enlightenment: { name: "Giác ngộ", desc: "Tia giác ngộ xuyên địch (Đầm lầy)" },
    prismatic_cascade: { name: "Thác lũ lăng kính", desc: "Bão nguyên tố 8 hướng (Giả kim)" },
    undergrowth: { name: "Bụi gai ngầm", desc: "Bụi gai nổ · Mục nát quanh địch (Mụ phù thủy)" },
  };
  if (D.ABILITIES) {
    for (const [id, v] of Object.entries(abilities)) {
      if (!D.ABILITIES[id]) continue;
      D.ABILITIES[id].name = v.name;
      D.ABILITIES[id].desc = v.desc;
    }
  }

  // ── Sảnh ──
  const halls = {
    haunted_caverns: { name: "Hang động ma ám", blurb: "Sảnh I · Quỷ nhỏ · Bộ xương · Chất nhầy · Chó địa ngục" },
    ember_grounds: { name: "Đất tro tàn", blurb: "Sảnh II · Lửa · Dung nham · Khiêu vũ lửa" },
    forgotten_viaduct: { name: "Cầu cạn quên lãng", blurb: "Sảnh III · Bóng ma · Gargoyle · Kỵ sĩ ma" },
    frozen_depths: { name: "Vực băng", blurb: "Sảnh IV · Băng · Gấu · Rồng băng" },
    chambers_of_dissonance: { name: "Phòng bất hòa", blurb: "Sảnh V · Hỗn loạn · Hư không · Biến hình" },
    the_vault: { name: "Kho bạc", blurb: "Sảnh cuối · Tham lam · Thủ quỹ" },
    boglands: { name: "Đầm lầy", blurb: "DLC · Mục nát · Bùn · Quái đầm" },
  };
  if (D.HALLS) {
    for (const [id, v] of Object.entries(halls)) {
      if (!D.HALLS[id]) continue;
      D.HALLS[id].name = v.name;
      if (v.blurb) D.HALLS[id].blurb = v.blurb;
    }
  }

  // ── Dấu ấn ──
  const marks = {
    swordsman: { name: "Dấu ấn Kiếm", desc: "Đặc tính Kiếm sĩ · +10 Sát thương cơ bản · +10 Phòng thủ cơ bản" },
    archer: { name: "Dấu ấn Mũi tên", desc: "Đặc tính Cung thủ · +0,10 Tỷ lệ chí mạng cơ bản" },
    exterminator: { name: "Dấu ấn Thiêu đốt", desc: "Đặc tính Diệt trừ giả · 10% Đốt cháy (Vũ khí chính, tăng theo cấp)" },
    shield_maiden: { name: "Dấu ấn Khiên", desc: "Đặc tính Nữ chiến binh khiên · Sức chắn nhân vào Sát thương" },
    cleric: { name: "Dấu ấn Thánh khiết", desc: "Đặc tính Thầy tu · 20% Dễ vỡ / Khổ hình trên Vũ khí chính" },
    warlock: { name: "Dấu ấn Nghi lễ", desc: "Đặc tính Phù thủy bóng tối · Triệu hồi Pháp sư xương hỗ trợ" },
    sorceress: { name: "Dấu ấn Pháp thuật", desc: "Đặc tính Nữ pháp sư · 50% Điện hóa khi Chí mạng (Vũ khí chính)" },
    norseman: { name: "Dấu ấn Phương Bắc", desc: "Đặc tính Người phương Bắc · Mỗi 250 đòn chính → Bùng nổ băng" },
    beast_huntress: { name: "Dấu ấn Thú", desc: "Đặc tính Nữ thợ săn thú · Dắt chó săn đi săn" },
    landsknecht: { name: "Dấu ấn Lựu đạn", desc: "Đặc tính Lính đánh thuê · Lựu đạn khi gây sát thương bằng đạn" },
    sage: { name: "Dấu ấn Tri thức", desc: "Đặc tính Hiền giả · Cuộn khả năng như sách · nâng cấp thứ 3 (Hiền giả)" },
    bard: { name: "Dấu ấn Bài ca", desc: "Đặc tính Thi sĩ · Chọn khả năng Nhạc khi bắt đầu màn" },
    crone: { name: "Dấu ấn Sinh trưởng", desc: "Đặc tính Mụ phù thủy · Triệu hồi cây theo thời gian và khi di chuyển" },
    alchemist: { name: "Dấu ấn Giả kim", desc: "Đặc tính Giả kim · Ném bình theo nguyên tố đã thu" },
  };
  if (D.MARKS) {
    for (const [id, v] of Object.entries(marks)) {
      if (!D.MARKS[id]) continue;
      D.MARKS[id].name = v.name;
      D.MARKS[id].desc = v.desc;
    }
  }

  // ── Phước lành ──
  const blessings = {
    movement: { name: "Tốc độ di chuyển", desc: "+4% Tốc độ di chuyển / cấp" },
    health: { name: "Dung lượng máu", desc: "+8% Máu tối đa / cấp" },
    damage: { name: "Sát thương", desc: "+6% Sát thương / cấp" },
    attack_speed: { name: "Tốc độ đánh", desc: "+5% Tốc độ đánh / cấp" },
    pickup: { name: "Tầm nhặt đồ", desc: "+12% Tầm nhặt đồ / cấp" },
    crit_chance: { name: "Tỷ lệ chí mạng", desc: "+3% Tỷ lệ chí mạng / cấp" },
    regen: { name: "Hồi máu", desc: "+0,2 Máu/giây / cấp" },
    defense: { name: "Phòng thủ", desc: "+5 Phòng thủ / cấp" },
    force: { name: "Lực đẩy", desc: "+0,08 Lực đẩy / cấp" },
    xp_gain: { name: "Nhận kinh nghiệm", desc: "+6% Nhận kinh nghiệm / cấp" },
    ability_power: { name: "Sức mạnh khả năng", desc: "+7% Sát thương khả năng / cấp" },
    block: { name: "Sức chắn", desc: "+4 Sức chắn / cấp" },
  };
  if (D.BLESSINGS) {
    for (const [id, v] of Object.entries(blessings)) {
      if (!D.BLESSINGS[id]) continue;
      D.BLESSINGS[id].name = v.name;
      D.BLESSINGS[id].desc = v.desc;
    }
  }

  // ── Cửa hàng mảnh ──
  if (D.SHARD_SHOP) {
    const shards = {
      gold_find: { name: "Tìm vàng", desc: "+% vàng nhặt được / cấp" },
      bank_bonus: { name: "Thưởng ngân hàng", desc: "+% vàng gửi meta / cấp" },
      start_hp: { name: "Máu khởi đầu", desc: "+% Máu tối đa khi bắt đầu / cấp" },
      start_dmg: { name: "Sát thương khởi đầu", desc: "+% Sát thương khi bắt đầu / cấp" },
      agony_start: { name: "Mồi Khổ hình", desc: "Bắt đầu Hall+Khổ hình với thanh đã đầy một phần" },
      well_heal: { name: "Giếng hồi máu", desc: "+% hồi máu tại Giếng / cấp" },
      xp_bonus: { name: "Thưởng kinh nghiệm", desc: "+% kinh nghiệm / cấp" },
      shard_find: { name: "Tìm mảnh", desc: "+% mảnh rơi / cấp" },
    };
    for (const [id, v] of Object.entries(shards)) {
      if (!D.SHARD_SHOP[id]) continue;
      D.SHARD_SHOP[id].name = v.name;
      if (v.desc) D.SHARD_SHOP[id].desc = v.desc;
    }
    // Any remaining English names → soft VI for known keys
    for (const id of Object.keys(D.SHARD_SHOP)) {
      const s = D.SHARD_SHOP[id];
      if (!s || !s.name) continue;
      // leave custom if already set above
    }
  }

  // ── Thuộc tính (traits) ──
  if (Array.isArray(D.TRAITS)) {
    const traitMap = {
      vitality: ["Sinh lực", "+25 Máu tối đa và hồi 25 máu"],
      agility: ["Nhanh nhẹn", "+12% Tốc độ di chuyển"],
      defense: ["Phòng thủ", "+8 Phòng thủ"],
      regeneration: ["Hồi phục", "+0,4 Máu/giây"],
      pickup: ["Tầm nhặt", "+30% Tầm nhặt đồ"],
      power: ["Sức mạnh", "+18% Sát thương vũ khí chính"],
      quickdraw: ["Tay nhanh", "+12% Tốc độ đánh"],
      reach: ["Tiên phong", "+15% Tầm đánh"],
      barrage: ["Đa đòn", "+1 đạn / nón cận chiến rộng hơn / +nhảy xích"],
      deadliness: ["Xảo quyệt", "+7% Tỷ lệ chí mạng"],
      cruel: ["Tàn nhẫn", "+22% Sát thương chí mạng"],
      channeling: ["Dẫn kênh", "+1 Xuyên / nhảy xích"],
      impact: ["Va chạm", "+15% Sát thương"],
      force: ["Lực đẩy", "+0,25 Lực đẩy (đẩy lùi / xuyên)"],
      block_str: ["Thành lũy", "+12 Sức chắn"],
      effect_chance: ["Ám ảnh", "+20% Tỷ lệ hiệu ứng"],
      xp_gain: ["Cống hiến", "+12% Nhận kinh nghiệm"],
      ability_power: ["Sức mạnh khả năng", "+15% Sát thương khả năng"],
      ability_haste: ["Nhanh khả năng", "Thời gian hồi khả năng −12%"],
      ability_area: ["Hào quang mở rộng", "+15% Diện tích / tầm khả năng"],
      ability_crit: ["Chí mạng huyền bí", "+8% Chí mạng khả năng"],
    };
    for (const t of D.TRAITS) {
      const m = traitMap[t.id];
      if (!m) continue;
      t.name = m[0];
      t.desc = m[1];
    }
  }

  // ── Bình thuốc ──
  if (D.POTIONS) {
    const pots = {
      health: { name: "Bình máu", desc: "Hồi 35% Máu tối đa" },
      greater_health: { name: "Bình máu lớn", desc: "Hồi 60% Máu tối đa" },
      haste: { name: "Bình nhanh", desc: "+40% Tốc độ đánh & di chuyển trong 12 giây" },
      power: { name: "Bình sức mạnh", desc: "+50% Sát thương trong 12 giây" },
      iron: { name: "Da sắt", desc: "+20 Phòng thủ · +15 Sức chắn trong 14 giây" },
      magnet: { name: "Từ dược", desc: "Tầm nhặt rất lớn trong 10 giây" },
      wrath: { name: "Thuốc cuồng nộ", desc: "+Chí mạng & Đa đòn trong 10 giây" },
      cleanse: { name: "Thanh tẩy", desc: "Xóa làm chậm · hồi máu nhẹ" },
    };
    for (const [id, v] of Object.entries(pots)) {
      if (!D.POTIONS[id]) continue;
      D.POTIONS[id].name = v.name;
      D.POTIONS[id].desc = v.desc;
    }
  }

  // ── Trang bị: tên + mô tả ──
  const items = {
    hood: { name: "Mũ trùm", desc: "+5 Phòng thủ · +10% Tốc độ di chuyển" },
    helmet: { name: "Mũ sắt", desc: "+10 Sức chắn" },
    fighters_headband: { name: "Băng đô chiến binh", desc: "Khi tinh anh/chúa tể xuất hiện: hồi 0,5%/giây trong 50 giây" },
    wind_crown: { name: "Vương miện gió", desc: "Giết địch: tích Tốc độ đánh · phân rã theo thời gian" },
    ruby_circlet: { name: "Vòng ruby", desc: "+1% sát thương Đốt cháy mỗi kẻ đang cháy (tối đa 40%)" },
    thunder_crown: { name: "Vương miện sấm", desc: "Đánh kẻ bị Điện hóa: sét lan" },
    war_horns: { name: "Sừng chiến", desc: "Tiếng thét mỗi 3 giây · Dễ vỡ quanh" },
    mask_of_madness: { name: "Mặt nạ điên loạn", desc: "Mỗi 25 giây: tự thương · +1% Sát thương/Chí mạng" },
    gorgon_mask: { name: "Mặt nạ Gorgon", desc: "Mỗi 1 giây: nón Làm chậm · sát thương theo tầng Làm chậm" },
    alchemist_goggles: { name: "Kính giả kim", desc: "Giết địch tăng uy lực nguyên tố" },
    frost_dragon_helmet: { name: "Mũ rồng băng", desc: "+10% Băng · hơi thở băng 3 giây" },
    twisted_chaplet: { name: "Vòng gai vặn", desc: "Sát thương Mục nát → Máu tối đa (mềm)" },
    vision_crown: { name: "Vương miện thị giác", desc: "Đứng yên: +50% Tầm · Di chuyển: +30% Diện tích" },
    war_chiefs_visor: { name: "Mặt nạ tù trưởng", desc: "Sát thương gây ra → Lực đẩy (có trần)" },
    jade_amulet: { name: "Dây chuyền ngọc", desc: "+40% Nhận kinh nghiệm · vàng→kinh nghiệm mềm" },
    maidens_tear: { name: "Nước mắt thiếu nữ", desc: "Chắn 1 đòn mỗi 30 giây · +Lực đẩy khi nạp" },
    blood_catcher: { name: "Bắt máu", desc: "Sát thương gây ra → hồi/sát thương định kỳ" },
    collar_of_confidence: { name: "Vòng cổ tự tin", desc: "+Sát thương theo số địch trong tầm nhặt (tối đa 50%)" },
    duelists_spark: { name: "Tia đấu sĩ", desc: "+35% Sát thương · −Sát thương khi đông địch" },
    scars_of_toil: { name: "Sẹo lao khổ", desc: "+0,1% Sát thương mỗi điểm máu thiếu" },
    gatherers_charm: { name: "Bùa nhặt đồ", desc: "+10% Tốc độ di chuyển · +tầm nhặt" },
    elemental_capacitor: { name: "Tụ điện nguyên tố", desc: "+25% Sát thương khả năng · +tỷ lệ hiệu ứng" },
    elemental_resonator: { name: "Cộng hưởng nguyên tố", desc: "Đòn chính: áp lại tầng nguyên tố" },
    natural_selector: { name: "Chọn lọc tự nhiên", desc: "Triệu hồi −30% số lượng · +120% sát thương triệu hồi" },
    philosophers_stone: { name: "Đá triết gia", desc: "+35% chỉ số chiến đấu · −15% Máu tối đa" },
    shepherds_boon: { name: "Phước chăn cừu", desc: "Hồi máu từ triệu hồi · +sát thương triệu hồi" },
    warriors_fervor: { name: "Nhiệt huyết chiến binh", desc: "Khi hồi máu: +100% Sát thương/Tốc độ đánh 8 giây" },
    wooden_ring: { name: "Nhẫn gỗ", desc: "+12% Tỷ lệ chí mạng" },
    copper_ring: { name: "Nhẫn đồng", desc: "+50% Sát thương chí mạng" },
    iron_ring: { name: "Nhẫn sắt", desc: "+15 Sát thương cơ bản" },
    ring_of_fire: { name: "Nhẫn lửa", desc: "Vũ khí chính → Lửa · +15% Đốt cháy" },
    ring_of_thunder: { name: "Nhẫn sấm", desc: "Vũ khí chính → Sét · +15% Điện hóa" },
    ring_of_frost: { name: "Nhẫn băng", desc: "Vũ khí chính → Băng · +15% Băng giá" },
    ring_of_earth: { name: "Nhẫn đất", desc: "Vũ khí chính → Đất · +15% Mục nát" },
    echoing_band: { name: "Vòng vang vọng", desc: "20% khi trúng: sóng xung kích 40% sát thương" },
    guiding_star: { name: "Sao dẫn đường", desc: "Đánh: +Tốc độ đánh −Di chuyển · Di chuyển: +Di chuyển −Tốc độ đánh" },
    seal_of_rebirth: { name: "Ấn tái sinh", desc: "Hồi sinh một lần ở 50% Máu" },
    demonic_bond: { name: "Giao ước quỷ", desc: "Triệu hồi quỷ nhỏ định kỳ" },
    necromancers_clutch: { name: "Nắm gọi hồn", desc: "Triệu hồi bộ xương định kỳ" },
    pest_ring: { name: "Nhẫn dịch bệnh", desc: "Triệu hồi chuột · gây hiệu ứng xấu" },
    holy_relic: { name: "Di vật thánh", desc: "Mỗi 30 giây: hồi 50 máu hoặc buff sức mạnh" },
    blighted_indolence: { name: "Lười biếng mục nát", desc: "Làm chậm cũng có 40% gây Mục nát" },
    ability_signet: { name: "Ấn khả năng", desc: "+20% Sát thương khả năng · Hồi khả năng −8%" },
    chain_mail: { name: "Áo xích", desc: "+5 Phòng thủ · +20% Máu tối đa" },
    plate_armor: { name: "Áo giáp tấm", desc: "+8 Sức chắn · +15% Máu tối đa" },
    blazing_shell: { name: "Vỏ rực lửa", desc: "Hào quang Đốt cháy · khi bị đánh 50% Đốt cháy" },
    blood_soaked_shirt: { name: "Áo đẫm máu", desc: "Khi giết 8%: +1 Máu · giết → tầng Sát thương" },
    defiant_plate: { name: "Giáp thách thức", desc: "Khi bị đánh: +Phòng thủ/Hồi máu (có trần)" },
    hunters_garb: { name: "Áo thợ săn", desc: "Đứng yên: +Sát thương theo thời gian (tối đa 50%)" },
    shadow_cloak: { name: "Áo choàng bóng", desc: "Vệt bóng · +10 Sức chắn" },
    beastmasters_hide: { name: "Da chủ thú", desc: "Thú băng đồng hành · +Phòng thủ" },
    brokers_cape: { name: "Áo choàng môi giới", desc: "Mỗi 1 giây: hiệu ứng xấu ngẫu nhiên quanh" },
    crones_gown: { name: "Áo mụ phù thủy", desc: "Cây đầm lầy · đám mây Mục nát" },
    thunder_cape: { name: "Áo choàng sấm", desc: "Sóng xung kích kẻ mạnh nhất trong tầm" },
    plated_boots: { name: "Giày bọc thép", desc: "+5 Phòng thủ · +5 Sức chắn" },
    running_shoes: { name: "Giày chạy", desc: "+20% Tốc độ di chuyển" },
    firewalker_boots: { name: "Giày lửa", desc: "Di chuyển: vệt lửa · Đốt cháy" },
    bog_boots: { name: "Giày đầm", desc: "Di chuyển: vệt bùn · Làm chậm" },
    electrostatic_treads: { name: "Đế tĩnh điện", desc: "Di chuyển: nạp sóng sốc" },
    elven_slippers: { name: "Hài elf", desc: "Di chuyển: +Sức chắn" },
    pace_setter: { name: "Giày nhịp độ", desc: "Yên: hồi máu · Đầy máu +Tốc độ đánh · Thương +Di chuyển" },
    spike_boots: { name: "Giày gai", desc: "Khi bị đánh: rơi gai · choáng" },
    berserker_boots: { name: "Giày cuồng chiến", desc: "Di chuyển: đổi Tốc độ di chuyển → Tốc độ đánh" },
    frost_greaves: { name: "Ống quyển băng", desc: "Mỗi 1 giây: Băng địch trong tầm nhặt" },
    swamp_raisers: { name: "Giày đầm lầy", desc: "Đứng yên: hào quang Mục nát đầm" },
    demonic_grasp: { name: "Nắm quỷ", desc: "Di chuyển: triệu hồi tay · kéo/sát thương" },
    longfinger_gloves: { name: "Găng ngón dài", desc: "+100% Tầm nhặt đồ" },
    quickhand_gloves: { name: "Găng tay nhanh", desc: "+25% Tốc độ đánh" },
    hunting_gloves: { name: "Găng săn", desc: "+30% Đa đòn" },
    fencing_gauntlets: { name: "Găng đấu kiếm", desc: "Khi chắn: 50% đòn chí mạng miễn phí" },
    invocators_grasp: { name: "Nắm triệu hồi", desc: "+40% số/sát thương triệu hồi" },
    sparking_tips: { name: "Đầu ngón tia lửa", desc: "Đánh kẻ đang cháy: tia lửa" },
    spellcaster_gloves: { name: "Găng pháp sư", desc: "Không đánh chính 2 giây: +sát thương khả năng tăng dần" },
    thornfists: { name: "Nắm gai", desc: "Khi bị thương: phản đòn chí mạng nguồn" },
    alchemists_trade: { name: "Nghề giả kim", desc: "Hấp thụ nguyên tố gần → chỉ số" },
    bloodstained_wrappings: { name: "Băng máu", desc: "Gây sát thương → nạp · hồi khi bị thương" },
    frost_thorns: { name: "Gai băng", desc: "Đánh kẻ đóng băng: nổ băng" },
    leeching_fingers: { name: "Ngón hút máu", desc: "Đánh Mục nát: tiêu tầng · hồi máu" },
    unholy_touch: { name: "Chạm bất thánh", desc: "Cận chiến: +20% Dễ vỡ" },
    thundercharge_gauntlets: { name: "Găng nạp sấm", desc: "Sát thương Điện hóa → nạp Chí mạng" },
  };
  if (D.ITEMS) {
    for (const [id, v] of Object.entries(items)) {
      if (!D.ITEMS[id]) continue;
      D.ITEMS[id].name = v.name;
      D.ITEMS[id].desc = v.desc;
    }
  }

  // Rarity package descs (Boost / Growth)
  if (D.ITEMS) {
    for (const it of Object.values(D.ITEMS)) {
      if (it.uncommon && it.uncommon.desc) {
        it.uncommon.desc = it.uncommon.desc
          .replace(/^Boost:\s*/i, "Tăng cường: ")
          .replace(/Growth↑?:\s*/i, "Sinh trưởng: ")
          .replace(/\bDMG\b/g, "Sát thương")
          .replace(/\bASP\b/g, "Tốc độ đánh")
          .replace(/\bMS\b/g, "Tốc độ di chuyển")
          .replace(/\bHP\b/g, "Máu")
          .replace(/\bXP\b/g, "Kinh nghiệm")
          .replace(/\bCD\b/g, "Hồi chiêu")
          .replace(/\bDef\b/g, "Phòng thủ")
          .replace(/\bBlock\b/g, "Sức chắn")
          .replace(/\bForce\b/g, "Lực đẩy")
          .replace(/\bCrit\b/g, "Chí mạng")
          .replace(/\blevels?\b/gi, "cấp");
      }
      if (it.rare && it.rare.desc) {
        it.rare.desc = it.rare.desc
          .replace(/^Boost:\s*/i, "Tăng cường: ")
          .replace(/Growth↑?:\s*/i, "Sinh trưởng: ")
          .replace(/\bDMG\b/g, "Sát thương")
          .replace(/\bASP\b/g, "Tốc độ đánh")
          .replace(/\bMS\b/g, "Tốc độ di chuyển")
          .replace(/\bHP\b/g, "Máu")
          .replace(/\bXP\b/g, "Kinh nghiệm")
          .replace(/\bCD\b/g, "Hồi chiêu")
          .replace(/\bDef\b/g, "Phòng thủ")
          .replace(/\bBlock\b/g, "Sức chắn")
          .replace(/\bForce\b/g, "Lực đẩy")
          .replace(/\bCrit\b/g, "Chí mạng")
          .replace(/\blevels?\b/gi, "cấp");
      }
      if (it.uncommon && it.uncommon.desc) {
        it.descUncommon = (it.desc || "") + " · ▲ " + it.uncommon.desc;
      }
      if (it.rare && it.rare.desc) {
        const bits = [it.desc || ""];
        if (it.uncommon && it.uncommon.desc) bits.push("▲ " + it.uncommon.desc);
        bits.push("◆ " + it.rare.desc);
        it.descRare = bits.filter(Boolean).join(" · ");
      }
    }
  }

  // ── Tạo tác (Artifacts) — mô tả đã có, dịch tên ──
  const arts = {
    hastening_sands: { name: "Cát gia tốc", desc: "−10 phút thời gian màn · +30% xuất quái · +20% Tốc độ di chuyển (tất cả)" },
    mountain_idol: { name: "Tượng núi", desc: "Sinh quái lớn chậm, hút nhiều sát thương" },
    torment_banner: { name: "Cờ Khổ hình", desc: "Thêm quái cơ bản suốt màn" },
    tricksters_chime: { name: "Chuông lừa", desc: "Thêm bẫy trong sảnh" },
    archeologists_thread: { name: "Chỉ nhà khảo cổ", desc: "Đền vật phẩm hiếm vừa · +1 khả năng cho Tinh anh" },
    restless_wheel: { name: "Bánh xe không nghỉ", desc: "Cấp Khổ hình tăng nhanh hơn nhiều" },
    magma_vessel: { name: "Bình magma", desc: "Phun dung nham gần bạn (hại bạn và địch)" },
    fallen_star: { name: "Sao rơi", desc: "Pha lê mưa xuống · hại bạn và địch" },
    malignant_mirror: { name: "Gương ác tính", desc: "Ba Chúa tể cuối màn thay vì một" },
    living_darkness: { name: "Bóng tối sống", desc: "Sương đen giảm tầm nhìn" },
    curse_of_commitment: { name: "Lời nguyền gắn bó", desc: "Trang bị Hiếm vừa/Cực hiếm không tháo/bỏ trong màn" },
    killing_gaze: { name: "Ánh nhìn sát", desc: "Thêm quái tầm xa suốt màn" },
    scorched_hand: { name: "Tay thiêu", desc: "Mọi thứ có 20% Đốt cháy khi trúng" },
    scales_of_pain: { name: "Cân đau đớn", desc: "+100% Sát thương (Người chơi) · +50% Sát thương (Địch)" },
    confusing_lens: { name: "Thấu kính hỗn loạn", desc: "− Tốc độ di chuyển cơ bản (Tất cả)" },
    demonic_cube: { name: "Khối quỷ", desc: "Tinh anh, Boss và Chúa tể có thêm khả năng" },
    urn_of_the_damned: { name: "Bình bị nguyền", desc: "Giết địch có thể sinh ma đuổi bạn" },
    burdening_stone: { name: "Đá gánh nặng", desc: "−Tốc độ di chuyển mỗi món trang bị" },
    golden_scarab: { name: "Bọ vàng", desc: "Nhặt vàng gây sát thương bằng giá trị · thùng giàu hơn" },
    primordial_edict: { name: "Sắc lệnh nguyên sơ", desc: "Giới hạn tầng hiệu ứng giảm một phần ba" },
    face_of_regret: { name: "Mặt hối tiếc", desc: "Mỗi 100 mạng: −0,2% Tốc độ đánh · −0,2% Lực đẩy" },
    idol_of_hunger: { name: "Tượng đói", desc: "Mọi hồi máu giảm 50% (hồi cuối −50%)" },
    obsidian_dice: { name: "Xúc xắc obsidian", desc: "Khả năng từ cuộn/sách được chọn ngẫu nhiên" },
    ivory_dice: { name: "Xúc xắc ngà", desc: "Vật phẩm rương được chọn ngẫu nhiên" },
    mind_veil: { name: "Màn che tâm trí", desc: "−50% thưởng kinh nghiệm nhiệm vụ (prototype: −25% kinh nghiệm)" },
    masters_vice: { name: "Kìm thầy", desc: "Mỗi lần lên cấp giảm 1 Máu tối đa" },
    silver_cut: { name: "Cắt bạc", desc: "Mọi hệ số người chơi giảm 20%" },
    apocryphal_curse: { name: "Lời nguyền ngụy thư", desc: "Hệ số tiêu cực tăng (+20% nhân)" },
    hiltless_dagger: { name: "Dao không chuôi", desc: "Tầng Làm chậm mỗi đòn Vũ khí chính" },
    flagellants_foot_cuff: { name: "Còng chân khổ hạnh", desc: "Tầng Dễ vỡ mỗi 20m di chuyển" },
    hardening_targe: { name: "Khiên cứng hóa", desc: "Địch +2 Sức chắn mỗi lần bạn lên cấp" },
    elemental_incubator: { name: "Ấp nguyên tố", desc: "−70% tỷ lệ Đốt/Điện/Băng · +100% sát thương nguyên tố · địch sinh kèm hiệu ứng" },
    dementing_root: { name: "Rễ điên loạn", desc: "−2 Ô khả năng · −10% Đa đòn" },
    demonic_accolade: { name: "Huân chương quỷ", desc: "1% quái thường trở thành đặc biệt (mạnh hơn, rơi thêm)" },
    totem_of_giants: { name: "Vật tổ khổng lồ", desc: "Ít quái hơn: to, dai, chậm · nhiều kinh nghiệm mỗi con" },
    pale_goblet: { name: "Cốc nhợt", desc: "Diện tích/Tầm giảm Chí mạng & tỷ lệ hiệu ứng nguyên tố" },
    torn_stage_curtain: { name: "Rèm sân khấu rách", desc: "Quái vẫn sinh sau khi Chúa tể xuất hiện" },
    alluring_flute: { name: "Sáo quyến rũ", desc: "Địch bị kéo về phía bạn" },
    marching_drums: { name: "Trống hành quân", desc: "+50% Tốc độ di chuyển người chơi · +30% địch" },
    torment_suppressor: { name: "Bộ kìm Khổ hình", desc: "Giới hạn tổng thưởng Mảnh Khổ hình ở 666" },
    rich_mans_plate: { name: "Giáp nhà giàu", desc: "−50% sát thương nhận khi còn vàng trả" },
    strange_pendulum: { name: "Con lắc lạ", desc: "Rương xanh theo thời gian · dấu khó thấy hơn" },
    bog_totem: { name: "Vật tổ đầm", desc: "Mỗi 500 mạng: sóng xâm lược Đầm lầy" },
    masters_edge: { name: "Lưỡi thầy", desc: "Chọn thuộc tính cuối → chỉ tăng chỉ số thuần" },
    glass_bones: { name: "Xương thủy tinh", desc: "Không còn thuộc tính phòng thủ · áp lực kính đại bác" },
    cursed_ulcer: { name: "Loét bị nguyền", desc: "Thùng có thể chứa pha lê đen (sinh trưởng + đau)" },
    leash_of_stagnation: { name: "Dây trì trệ", desc: "Tắt mọi chọn thuộc tính theo cấp" },
    unstable_tinderbox: { name: "Hộp diêm bất ổn", desc: "Thùng rơi đồ cũng bắn pháo hoa" },
  };
  if (D.ARTIFACTS) {
    for (const [id, v] of Object.entries(arts)) {
      if (!D.ARTIFACTS[id]) continue;
      D.ARTIFACTS[id].name = v.name;
      D.ARTIFACTS[id].desc = v.desc;
    }
  }

  // ── Kẻ địch (tên hiển thị) ──
  if (D.ENEMIES) {
    const en = {
      slime: "Chất nhầy", poison_slime: "Chất nhầy độc", imp: "Quỷ nhỏ", hellhound: "Chó địa ngục",
      skeleton: "Bộ xương", skeleton_lance: "Xương giáo", skeleton_mage: "Pháp sư xương",
      skeleton_shield: "Xương khiên", imp_chieftain: "Thủ lĩnh quỷ", skeleton_lord: "Chúa xương",
      lich: "Lich", scorched: "Thiêu cháy", magma_slime: "Nhầy magma", flamedancer: "Vũ công lửa",
      wraith_warlord: "Tướng ma", wyrm_queen: "Nữ hoàng wyrm", wraith: "Bóng ma", gargoyle: "Gargoyle",
      possessed_effigy: "Hình nộm bị ám", marching_ghost: "Ma hành quân", wraith_horseman: "Kỵ sĩ ma",
      frost_knight: "Hiệp sĩ băng", hydra: "Hydra", frost_slime: "Nhầy băng", frost_crawler: "Bò băng",
      frost_ghoul: "Ma đói băng", frost_guard: "Lính gác băng", frost_bear: "Gấu băng",
      frost_skull: "Sọ băng", frost_skeleton: "Xương băng", frost_skeleton_mage: "Pháp sư xương băng",
      snow_effigy: "Hình nộm tuyết", ice_wyrm: "Wyrm băng", basilisk: "Basilisk", polar_beast: "Thú địa cực",
      twisted_construct: "Cỗ máy vặn", elder_giant: "Khổng lồ già", ghoul: "Ma đói",
      homunculus: "Homunculus", capra_fiend: "Quỷ dê", shapeshifter: "Biến hình",
      demonic_construct: "Cỗ máy quỷ", void_syphon: "Hút hư không", void_caller: "Gọi hư không",
      the_village: "Ngôi làng", twisted_knight: "Hiệp sĩ vặn", vault_imp: "Quỷ kho",
    };
    for (const [id, name] of Object.entries(en)) {
      if (D.ENEMIES[id]) D.ENEMIES[id].name = name;
    }
  }
  if (D.BOSSES) {
    for (const b of Object.values(D.BOSSES)) {
      if (!b || !b.name) continue;
      b.name = b.name
        .replace("Lord of", "Chúa tể")
        .replace("Lord", "Chúa tể");
    }
  }

  // ── Nâng cấp khả năng: dịch nhanh name/desc còn tiếng Anh ──
  if (D.ABILITY_UPGRADES) {
    for (const list of Object.values(D.ABILITY_UPGRADES)) {
      if (!Array.isArray(list)) continue;
      for (const u of list) {
        if (!u) continue;
        if (u.desc) {
          u.desc = u.desc
            .replace(/\bDmg\b/gi, "Sát thương")
            .replace(/\bDamage\b/gi, "Sát thương")
            .replace(/\bASP\b/g, "Tốc độ đánh")
            .replace(/\bAOE\b/g, "Diện tích")
            .replace(/\bBurn\b/g, "Đốt cháy")
            .replace(/\bSlow\b/g, "Làm chậm")
            .replace(/\bPierce\b/g, "Xuyên")
            .replace(/\bCount\b/g, "Số lượng")
            .replace(/\bCrit\b/g, "Chí mạng")
            .replace(/\bMark\b/g, "Dấu")
            .replace(/\bFragile\b/g, "Dễ vỡ")
            .replace(/\bElectrify\b/g, "Điện hóa")
            .replace(/\bDecay\b/g, "Mục nát")
            .replace(/\bHeal\b/g, "Hồi máu")
            .replace(/\bon hit\b/gi, "khi trúng")
            .replace(/\bwiki\b/gi, "");
        }
      }
    }
  }

  // ── Thời lượng ──
  if (Array.isArray(D.RUN_DURATIONS)) {
    for (const d of D.RUN_DURATIONS) {
      if (d.blurb === "Nhanh") d.blurb = "Nhanh";
      if (d.blurb === "Trung bình") d.blurb = "Trung bình";
      if (d.blurb === "Dài hơn") d.blurb = "Dài hơn";
    }
  }
  if (Array.isArray(D.TORMENT_DURATIONS)) {
    for (const d of D.TORMENT_DURATIONS) {
      if (d.blurb && d.blurb.includes("Torment")) {
        d.blurb = d.blurb.replace("Torment", "Khổ hình");
      }
    }
  }

  // Nhãn toàn cục cho game.js
  window.HOT_VI = {
    stats: {
      maxHp: "Máu tối đa",
      hp: "Máu",
      damage: "Sát thương",
      asp: "Tốc độ đánh (lần/giây)",
      speed: "Tốc độ di chuyển",
      range: "Tầm đánh",
      defense: "Phòng thủ",
      block: "Sức chắn",
      regen: "Hồi máu (mỗi giây)",
      crit: "Tỷ lệ chí mạng (%)",
      critB: "Sát thương chí mạng (%)",
      multi: "Đa đòn",
      force: "Lực đẩy",
      pickup: "Tầm nhặt đồ",
      abDmg: "Sát thương khả năng (%)",
      abCd: "Hồi chiêu khả năng (%)",
      xpGain: "Nhận kinh nghiệm (%)",
      goldFind: "Tìm vàng (%)",
      effect: "Tỷ lệ hiệu ứng (%)",
      thorns: "Gai phản",
    },
    ui: {
      gold: "Vàng",
      shards: "Mảnh",
      kills: "Mạng",
      level: "Cấp",
      normal: "Thường",
      hall: "Sảnh",
      torment: "Khổ hình",
      agony: "Khổ hình (Agony)",
      loadout: "Trang bị khởi đầu",
      mark: "Dấu ấn",
      artifact: "Tạo tác",
      abilities: "Khả năng",
      common: "Thường",
      uncommon: "Hiếm vừa",
      rare: "Cực hiếm",
      base: "Cơ bản",
      withGear: "Có đồ / Phước / Dấu ấn",
      boss: "CHÚA TỂ",
      crit: "CHÍ MẠNG",
      win: "THẮNG",
      lose: "THUA",
    },
  };
})();
