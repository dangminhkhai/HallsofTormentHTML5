# Halls of Torment HTML5 — Project Context (for AI / contributors)

Tài liệu tổng hợp **toàn bộ ngữ cảnh dự án** từ quá trình phát triển và các quyết định của user.  
Mục tiêu: AI hoặc dev khác đọc file này là nắm được **game có gì**, **constraint gì**, **code nằm đâu**, **đừng làm gì**.

**Cập nhật:** 2026-07-09 · **Repo:** https://github.com/dangminhkhai/HallsofTormentHTML5 · **Branch:** `main`  
**Workspace local (máy hiện tại):** `C:\Users\Khai\halls-of-torment\`  
**Ghi chú:** Vàng + mảnh bank **ngay khi nhặt**; pause Esc có cài đặt; icon item riêng + Giếng; hitstop/crit/telegraph.

---

## 1. Dự án là gì

- **Fan prototype browser** của game *Halls of Torment* (roguelite survivor-like, top-down).
- **Stack:** vanilla **HTML + CSS + JS** — **không** build step, **không** framework, **không** bundler.
- Chạy bằng mở `index.html` (file:// OK) trên Chrome / Edge / Firefox.
- Nội dung / số liệu tham chiếu wiki: https://hot.fandom.com/wiki/Halls_of_Torment_Wiki (đã scale cho run ngắn 5–15 phút).
- **Không** phải game official; dùng học / cá nhân.

---

## 2. Quyết định & constraint của user (BẮT BUỘC tuân thủ)

Các rule sau đã chốt qua hội thoại — **không tự ý đảo** trừ khi user yêu cầu:

| Rule | Chi tiết |
|------|----------|
| **Full unlock** | Không khóa hero / hall / ability / mark / camp bằng quest. Mở hết để test / chơi. |
| **Torment ladder** | Chế độ **Khổ hình (Torment)** vẫn có **cấp khóa** (thắng mới mở cấp tiếp) — khác Hall. |
| **Không shadow** | `drawShadow` = no-op. Không vẽ bóng chân. |
| **Map không rối** | Props **thưa** (sparse pillars + few floor accents). Không spam trang trí. |
| **Ability 1 màn, không scroll** | Panel chọn ability: grid compact, `overflow: hidden`, fit một màn. |
| **Không filter ability** | User bỏ filter theo dmg type — hiện full list. |
| **Full VI + stats đầy đủ** | UI tiếng Việt; stat **không viết tắt** khi hiển thị cho player (mô tả đầy đủ). |
| **Đồ họa: Vector Soft** | User **từ chối** pixel/sprite bake. Combat dùng **design system soft** trong `art.js` (`HOT_ART`). |
| **Không** dùng `HOT_SPRITES` / bake pixel cho world combat. | `sprites.js` còn trong repo nhưng **không load** trong `index.html`. |
| **Git** | User nói `up git` → commit + push `origin/main`. |

### Lịch sử đồ họa (quan trọng)

1. Prototype UI/logic trước → user: HTML5 “đồ họa xấu”.
2. Thử **pixel sprites** (`sprites.js`) → user **reject**.
3. Chuyển **Vector Soft Design System** (`art.js`) — tokens, plates, soft enemy/FX/props.
4. Tiếp tục polish: slash, projectile, miniboss, status aura, cast FX, HUD glass.

---

## 3. Cách chạy & script load order

```text
index.html
  → data.js          (nội dung game)
  → vi-locale.js     (Việt hóa strings)
  → art.js           (HOT_ART — design system)
  → sfx.js           (Web Audio procedural)
  → menu-portraits.js
  → hall-art.js
  → ability-icons.js
  → game.js          (runtime chính — file lớn ~370KB+)
```

**Không load:** `sprites.js` (legacy pixel; giữ file nhưng combat không dùng).

**Syntax check:** `node --check art.js` · `node --check game.js`

---

## 4. Cấu trúc file

| File | Vai trò |
|------|---------|
| `index.html` | Shell UI: menu (tabs Chơi / Anh hùng / Trại), canvas HUD, overlays (level-up, pause, well, end) |
| `style.css` | Theme dark + gold, menu, HUD glass, ability grid compact, boss bar, wave banner |
| `data.js` | **Data-only** IIFE → `window.HOT`: heroes, enemies, bosses, halls, items, abilities, marks, artifacts, blessings, shop, balance |
| `game.js` | Loop, combat, spawn, meta save, menu binding, draw world, hero drawers, UI runtime |
| `art.js` | `window.HOT_ART`: tokens, plates, soft world draws |
| `vi-locale.js` | Bản dịch VI cho UI / data labels |
| `ability-icons.js` | Vẽ icon ability lên canvas (dùng plate từ `HOT_ART`) |
| `menu-portraits.js` | Portrait hero menu |
| `hall-art.js` | Art hall (menu / décor) |
| `sfx.js` | SFX procedural (mỏng — còn room nâng cấp) |
| `sprites.js` | **Legacy** pixel bake — không dùng combat hiện tại |
| `README.md` | Hướng dẫn chơi ngắn (EN) |
| `PROJECT-CONTEXT.md` | **File này** — context cho AI |
| `.gitignore` | Chuẩn |

### localStorage keys

| Key | Nội dung |
|-----|----------|
| `hot_proto_meta_v3` | Meta progress (gold, shards, loadout, marks, blessings, torment unlock, …). Fallback đọc `v2`. |
| `hot_proto_settings_v1` | Settings (SFX, gamepad, …) |
| `hot_proto_art_open` | UI collapse artifacts panel |
| `hot_proto_v1` | Snapshot nhẹ hero/hall |

Clear meta: **Camp → Settings**.

---

## 5. Game có gì (feature inventory)

### 5.1 Chế độ chơi

| Mode | ID / UI | Mô tả |
|------|---------|--------|
| **Sảnh (Hall)** | `hall` | Chọn hall · duration **5 / 10 / 15 phút** · optional **Agony** (cấp 1–5) |
| **Khổ hình (Torment)** | `torment` | Ladder cấp (khóa theo tiến độ) · hall **ngẫu nhiên** · optional **Artifacts** |

Duration constants: `RUN_DURATIONS`, `TORMENT_DURATIONS` trong `data.js`.

### 5.2 Heroes (14)

Order UI (`HERO_ORDER`):

- **Physical:** `swordsman`, `archer`, `shield_maiden`, `beast_huntress`, `landsknecht`
- **Magic:** `cleric`, `warlock`, `sage`
- **Elemental:** `exterminator`, `sorceress`, `norseman`, `crone`, `alchemist`
- **Other:** `bard`

Mỗi hero: stats, weapon style, skill, palette, drawer riêng trong `game.js` (`HERO_DRAWERS`).

### 5.3 Halls (7)

`HALL_ORDER`:

1. `haunted_caverns`
2. `ember_grounds`
3. `forgotten_viaduct`
4. `frozen_depths`
5. `chambers_of_dissonance`
6. `the_vault`
7. `boglands`

Mỗi hall: theme (floor colors, style string: cavern/ember/frozen/bog/vault/void…), spawn curve, miniboss schedule, boss, hall strength.

### 5.4 Combat systems (runtime `game.js`)

- Player move (WASD + gamepad), attack theo `style` (melee / bow / magic / …)
- Enemies + elite + **miniboss** + **boss**
- Projectiles, AOE FX, slash FX, particles, floating damage text
- Status: burn, electrify, slow/frost, decay, fragile, mark, …
- Abilities (tối đa `MAX_ABILITIES = 6`), orbs orbit, summons
- Items (slots helmet/amulet/ring×2/chest/boots/gloves, max 7), rarity Common/Uncommon/Rare packages
- Gold / XP gems / tomes / chests / barrels / well
- Level-up traits & ability upgrades (cap upgrade per ability)
- Screen shake, invuln blink, pause + build summary

### 5.5 Meta / Camp

- **Blessings** (meta passives, shard/gold economy)
- **Well loadout** (7 slots potions/barrels)
- **Marks** (equip — full unlock, wiki-inspired)
- **Artifacts** (full wiki set ~48, search + presets; mainly Torment)
- **Shard shop**
- **Settings** (SFX, gamepad, reset meta)
- Bank gold / shards trên menu

### 5.6 UI surfaces

- Menu tabs: **Chơi** · **Anh hùng · Chỉ số** · **Trại · Phước · Giếng**
- In-run: HUD HP/XP, skill CD, gold, ability chips, boss bar, wave banner
- Overlays: level-up, ability pick (full list 1 screen), pause, well, end screen
- Toast notifications

### 5.7 Controls

| Input | Action |
|-------|--------|
| WASD | Move |
| Esc / P | Pause |
| Gamepad | Stick/D-pad move · Start pause |
| Attack | Theo class (auto-aim / hold patterns trong code) |

---

## 6. Hệ đồ họa — Vector Soft (`art.js` → `window.HOT_ART`)

### 6.1 Tokens (`HOT_ART.TOKENS`)

- UI: `bg`, `panel`, `plate`, `border`, `text`, `muted`, `gold`, `blood`, `outline`
- Rarity: common / uncommon / rare
- Damage types: physical / magic / elemental / bard / other
- Elements: fire / lightning / ice / earth / physical / magic
- Item slots: helmet, amulet, ring, chest, boots, gloves

Helpers: `hexA`, `shade`, `roundRect`, `softDisc`, `softCapsule`, …

### 6.2 Icon plates (shape language)

| Loại | Plate |
|------|--------|
| Ability | **Circle** (`plateCircle`) |
| Item | **Rounded square** (`plateSquare`) |
| Mark / Artifact | **Diamond** (`plateDiamond`) |

### 6.3 Soft world draws (đã wire trong `game.js`)

| API | Dùng cho |
|-----|----------|
| `drawSoftEnemy` | Enemy archetypes (imp, slime, skeleton, mage, wraith, bear, wyrm, construct, tree, horseman, fiend, mimic, …) |
| `drawSoftMinibossAura` | Crown + purple aura |
| `drawSoftPickup` | gold / xp / tome / chest |
| `drawSoftAoe` | burst / ring |
| `drawSoftOrb` | ability orbits |
| `drawSoftSummon` | golem / spirit / hound / minion |
| `drawSoftChest` / `Barrel` / `Well` | world objects |
| `drawSoftPillar` | map props theo hall style |
| `drawSoftFloorAccent` | puddles thưa (ember/frozen/bog/void) |
| `drawSoftProjectile` | arrow / orb / bolt / shard |
| `softSlash` | weapon trail (a0–a1) |
| `softCastBurst` | cast flash |
| `softStatusRing` | status auras |
| `drawSoftParticle` | sparks |
| `drawSoftHpBar` | floating HP |
| `drawSoftFloatingText` | damage / labels |
| `fxColor` | map element → color |

Master switch: `USE_PIXEL_SPRITES = false`.

### 6.4 Hero / boss drawing

- Heroes: **14 drawers** trong `game.js` (soft gradient head/torso một phần; **chưa** fully unified soft body như enemy).
- Boss: soft capsule/disc path trong `game.js` (vector, không pixel).
- Shadow: **disabled**.

### 6.5 CSS combat HUD

Boss bar, wave banner, HP/XP/skill bars glass, ability-chip ready glow — soft dark + gold theme.

---

## 7. Việt hóa

- `index.html` `lang="vi"`, title/menu VI.
- `vi-locale.js` map string data → tiếng Việt.
- User yêu cầu: **full VI** + **stat không viết tắt** trên UI người chơi.
- Một số log/debug EN còn chấp nhận; UI chính là VI.

---

## 8. Data layer (`data.js` → `window.HOT`)

Export chính (không sửa tên bừa bãi):

`HEROES`, `ENEMIES`, `BOSSES`, `TRAITS`, `ABILITY_UPGRADES`, `ABILITIES`, `ITEMS`, `ITEM_RARITY_PACKAGES`, `MARKS`, `ARTIFACTS`, `BLESSINGS`, `SHARD_SHOP`, `WELL`, `POTIONS`, `BARRELS`, `HALLS`, `HALL_ORDER`, `AGONY`, `TORMENT`, `TORMENT_MODE`, `BALANCE`, `WEAPON_PROF`, `HERO_ORDER`, `MAX_ABILITIES`, `MAX_ITEMS`, `MAX_LOADOUT`, helpers `HP`/`DMG`/`SPD`/`RNG` (wiki scale).

**Balance note:** HP/DMG wiki được scale xuống cho run ngắn (`HP ≈ ×0.32`, `DMG ≈ ×0.18`, v.v.).

---

## 9. Quy ước code khi chỉnh sửa

1. **Ưu tiên sửa local, reversible** — không force-push, không xóa meta user.
2. **Đồ họa mới** → thêm helper trong `art.js`, wire trong `game.js`; giữ fallback nếu thiếu `HOT_ART`.
3. **Không bật lại pixel combat** trừ khi user yêu cầu.
4. **Map props sparse** — đừng tăng mật độ decoration mạnh.
5. **Ability panel** — giữ 1 màn, không scroll dài.
6. **Full unlock** camp/content; chỉ Torment level giữ ladder.
7. **VI** cho string user-facing mới.
8. File `game.js` rất lớn — grep theo tên hàm; tránh refactor toàn file trừ khi user hỏi.
9. User `up git` / “up git” → `git add` relevant · commit message rõ · `git push origin main`.
10. Không commit secrets; không thêm dependency nặng nếu không được hỏi.

### Lệnh git thường dùng

```bash
cd C:\Users\Khai\halls-of-torment
git status
git add <files>
git commit -m "..."
git push origin main
```

Remote: `https://github.com/dangminhkhai/HallsofTormentHTML5.git`

---

## 10. Việc đã xong (tóm tắt hội thoại)

- Full feature prototype: Hall/Torment, camp, marks, artifacts, U/R item packages
- UI/UX menu + HUD polish · Việt hóa · ability full list 1 màn
- Vector soft combat (`HOT_ART`) · icon item riêng ~80 · status trang bị panel trái
- Camp card layout fix · pause Esc + **Cài đặt**
- **Bank ngay:** vàng + mảnh → `meta` / localStorage khi nhặt (out giữa run vẫn giữ)
- Hit feel: hitstop, crit scale text, screen flash, slash/hit_heavy SFX
- Enemy attack **telegraph** (windup) · boss death burst
- Hero soft legs/torso + skill aura · SFX mở rộng (`slash`, `shard`, `boss_death`, …)
- Pause build summary gọn + details

---

## 11. Việc còn có thể nâng cấp

| Hạng mục | Ghi chú |
|----------|---------|
| Hero drawers chi tiết hơn | 14 class vẫn có thể soft thêm vũ khí |
| Mobile touch | optional |
| Tách module `game.js` | technical debt (~370KB+) |
| Archive `sprites.js` | không load trong index |
| Balance Torment gần wiki | optional |

---

## 12. Anti-patterns (đừng làm)

- ❌ Thêm filter ability / ẩn content sau unlock gate
- ❌ Pixel sprite combat / bob-lean gây rung (đã fix: walk by distance, facing hysteresis, no bob on enemy sprites path)
- ❌ Shadow dưới chân
- ❌ Map props dày đặc
- ❌ Ability list scroll dài
- ❌ Stat UI viết tắt khó hiểu (user muốn full)
- ❌ Bịa mechanic “official exact” — prototype scale wiki, không 1:1 binary
- ❌ Ghi đè uncommitted work / reset meta khi không được yêu cầu

---

## 13. Quick map: “Tôi cần sửa X → file nào?”

| Muốn sửa | File |
|----------|------|
| Chỉ số hero/item/ability/hall | `data.js` |
| Text VI | `vi-locale.js` + `index.html` |
| Màu / soft draw API | `art.js` |
| Combat loop, spawn, damage, draw world | `game.js` |
| Layout menu/HUD CSS | `style.css` |
| Markup overlays | `index.html` |
| Icon ability | `ability-icons.js` + plates `art.js` |
| Portrait menu | `menu-portraits.js` |
| Âm thanh | `sfx.js` |
| Hall menu art | `hall-art.js` |

---

## 14. Tóm tắt một đoạn (copy cho system prompt ngắn)

> Halls of Torment HTML5 là prototype vanilla JS fan game (repo dangminhkhai/HallsofTormentHTML5). Full unlock content; Torment ladder khóa cấp. UI tiếng Việt, stats đầy đủ, ability 1 màn không filter/scroll. Đồ họa **vector soft** qua `window.HOT_ART` (`art.js`); không pixel combat, không shadow, map props thưa. Data trong `data.js` (`HOT`), runtime `game.js`, locale `vi-locale.js`. 14 heroes, 7 halls, camp (blessings/well/marks/artifacts/shop), Hall+Agony & Torment modes. Mở `index.html` là chạy. Chi tiết: đọc `PROJECT-CONTEXT.md`.

---

*File này là living doc — khi đổi architecture / constraint quan trọng, cập nhật mục 2, 6, 10, 11.*
