# Halls of Torment HTML5 — Project Context (for AI / contributors)

Tài liệu tổng hợp **toàn bộ ngữ cảnh dự án** từ quá trình phát triển và các quyết định của user.  
Mục tiêu: AI hoặc dev khác đọc file này là nắm được **game có gì**, **constraint gì**, **code nằm đâu**, **đừng làm gì**.

**Cập nhật:** 2026-07-09 · **Repo:** https://github.com/dangminhkhai/HallsofTormentHTML5 · **Branch:** `main`  
**Workspace local (máy hiện tại):** `C:\Users\Khai\halls-of-torment\`  
**Ghi chú session gần đây:** mobile portrait + floating joystick (analog chính xác); tab Hero layout fix; Torment ẩn chọn sảnh; bank vàng/mảnh live; soft heroes; crit UX gọn.

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
| **Torment = sảnh ngẫu nhiên** | **Không** hiện UI chọn màn khi Torment (PC + mobile). Hall random lúc `startGame`. |
| **Không shadow** | `drawShadow` = no-op. Không vẽ bóng chân. |
| **Map không rối** | Props **thưa** (sparse pillars + few floor accents). Không spam trang trí. |
| **Ability 1 màn, không scroll** | Panel chọn ability: grid compact, `overflow: hidden`, fit một màn. |
| **Không filter ability** | User bỏ filter theo dmg type — hiện full list. |
| **Full VI** | UI tiếng Việt. Tab Hero dùng **nhãn chỉ số gọn** (tránh đè chữ); mô tả skill đầy đủ. |
| **Đồ họa: Vector Soft** | User **từ chối** pixel/sprite bake. Combat dùng **design system soft** trong `art.js` (`HOT_ART`). |
| **Không** dùng `HOT_SPRITES` / bake pixel cho world combat. | `sprites.js` còn trong repo nhưng **không load** trong `index.html`. |
| **Crit UX** | Số crit **đỏ** · **không** freeze/hitstop/shake/flash plate “CHÍ MẠNG”. |
| **Bank live** | Vàng + mảnh **ghi meta ngay khi nhặt** (không chỉ cuối run). |
| **Mobile** | Portrait 9:16 in-run · **floating stick** (spawn tại điểm chạm) · analog speed · setting bật/tắt. |
| **Tab Chơi gọn** | Không strip “quick hero” / không dải hero stats trên play tab (PC + mobile). Chọn hero ở tab **Anh hùng**. |
| **Git** | User nói `up git` → commit + push `origin/main`. |

### Lịch sử đồ họa (quan trọng)

1. Prototype UI/logic trước → user: HTML5 “đồ họa xấu”.
2. Thử **pixel sprites** (`sprites.js`) → user **reject**.
3. Chuyển **Vector Soft Design System** (`art.js`) — tokens, plates, soft enemy/FX/props.
4. Soft **14 heroes** + ability icons/FX · polish HUD / camp / mobile.

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
  → game.js          (runtime chính — file lớn ~420KB+)
```

**Không load:** `sprites.js` (legacy pixel; giữ file nhưng combat không dùng).

**Syntax check:** `node --check art.js` · `node --check game.js`

---

## 4. Cấu trúc file

| File | Vai trò |
|------|---------|
| `index.html` | Shell UI: menu (tabs Chơi / Anh hùng / Trại), canvas HUD, mobile controls, overlays |
| `style.css` | Theme dark + gold, menu, hero tab, HUD glass, mobile portrait + floating stick |
| `data.js` | **Data-only** IIFE → `window.HOT`: heroes, enemies, bosses, halls, items, abilities, marks, artifacts, blessings, shop, balance, `settings.joystick` default |
| `game.js` | Loop, combat, spawn, meta save, menu, joystick, draw world, hero drawers, UI runtime |
| `art.js` | `window.HOT_ART`: tokens, plates, soft world draws |
| `vi-locale.js` | Bản dịch VI cho UI / data labels |
| `ability-icons.js` | Vẽ icon ability lên canvas (dùng plate từ `HOT_ART`) + cache |
| `menu-portraits.js` | Portrait hero menu |
| `hall-art.js` | Art hall (menu / décor) |
| `sfx.js` | SFX procedural (master bus + throttle) |
| `sprites.js` | **Legacy** pixel bake — không dùng combat hiện tại |
| `README.md` | Hướng dẫn chơi ngắn (EN) |
| `PROJECT-CONTEXT.md` | **File này** — context cho AI |
| `.gitignore` | Chuẩn |

### localStorage keys

| Key | Nội dung |
|-----|----------|
| `hot_proto_meta_v3` | Meta progress (gold, shards, loadout, marks, blessings, torment unlock, …). Fallback đọc `v2`. |
| `hot_proto_settings_v1` | Settings: SFX, gamepad, **joystick** (mobile), … |
| `hot_proto_art_open` | UI collapse artifacts panel |
| `hot_proto_v1` | Snapshot nhẹ hero/hall |

Clear meta: **Camp → Settings**.

---

## 5. Game có gì (feature inventory)

### 5.1 Chế độ chơi

| Mode | ID / UI | Mô tả |
|------|---------|--------|
| **Sảnh (Hall)** | `hall` | Chọn hall (`#zone-halls`) · duration **5 / 10 / 15 phút** · optional **Agony** (cấp 1–5) |
| **Khổ hình (Torment)** | `torment` | Ladder cấp (khóa theo tiến độ) · **ẩn** `#zone-halls` + hall art sidebar · hall **random** lúc start · **Artifacts** (mở hết) |

- `updateDiffUI()`: `zoneHalls.classList.toggle("hidden", isTorment)` — không còn overlay “mode-disabled”.
- `startGame`: Torment → `pickRandomHallId()`; Hall → `pendingHallId`.
- Duration: `RUN_DURATIONS`, `TORMENT_DURATIONS` trong `data.js`.

### 5.2 Heroes (14)

Order UI (`HERO_ORDER`):

- **Physical:** `swordsman`, `archer`, `shield_maiden`, `beast_huntress`, `landsknecht`
- **Magic:** `cleric`, `warlock`, `sage`
- **Elemental:** `exterminator`, `sorceress`, `norseman`, `crone`, `alchemist`
- **Other:** `bard`

Mỗi hero: stats, weapon style, skill, palette, drawer soft trong `game.js` (`HERO_DRAWERS`).

**Tab Anh hùng (`#tab-hero`):**
- Roster theo loại ST (Vật lý / Phép / Nguyên tố / Khác).
- Panel phải: portrait · tên · vũ khí · pill dmg · **blurb block** · block **Khả năng** (tên + desc + CD) · bảng chỉ số Cơ bản / Có đồ.
- Layout: luôn **cột dọc** trên tab Hero — **không** inherit compact row-wrap của run sidebar (`#tab-run .hero-detail`).
- Nhãn stat **gọn** trong grid 2 cột (tránh đè chữ VI dài).
- Nút “Chọn & về tab Chơi”.

### 5.3 Halls (7)

`HALL_ORDER`:

1. `haunted_caverns`
2. `ember_grounds`
3. `forgotten_viaduct`
4. `frozen_depths`
5. `chambers_of_dissonance`
6. `the_vault`
7. `boglands`

Mỗi hall: theme, spawn curve, miniboss, boss, hall strength.

### 5.4 Combat systems (`game.js`)

- Move: WASD + gamepad + **virtual joystick analog** (`player._joyMx/_joyMy`)
- Attack theo `style` (melee / bow / magic / …)
- Enemies + elite + **miniboss** + **boss**
- Projectiles, AOE, slash FX, particles, floating damage (crit = đỏ, không freeze)
- Status: burn, electrify, slow/frost, decay, fragile, mark, …
- Abilities (max 6), orbs, summons
- Items (7 slots), rarity packages
- Gold / XP / tomes / chests / barrels / well — **gold & shards bank ngay khi nhặt**
- Level-up traits & ability upgrades
- Pause + settings + build summary

### 5.5 Meta / Camp

- **Blessings** · **Well loadout** · **Marks** · **Artifacts** · **Shard shop** · **Settings**
- Settings: SFX, gamepad, **Cần xoay (mobile)** (`settings.joystick`), reset meta
- Bank gold / shards trên menu (live từ in-run pickups)

### 5.6 UI surfaces

- Menu tabs: **Chơi** · **Anh hùng · Chỉ số** · **Trại**
- Tab Chơi: mode Hall/Torment · (hall grid chỉ Hall) · duration · Agony hoặc Torment level + artifacts · sidebar start
- **Không** `zone-run-hero` / quick hero strip (đã gỡ)
- In-run: HUD · skill CD · ability chips · boss bar · wave banner
- Overlays: level-up (compact, categories), ability pick 1 màn, pause (+ settings), well, end
- Mobile: `#mobile-controls` — pause float + full-screen touch pad + floating stick

### 5.7 Controls

| Input | Action |
|-------|--------|
| WASD | Move (digital full speed) |
| Esc / P | Pause |
| Gamepad | Stick/D-pad move · Start pause |
| **Mobile stick** | Chạm bất kỳ đâu (trừ pause) → spawn pad tại điểm chạm · kéo analog 0→1 |
| Attack | Auto theo class |

#### Virtual joystick (mobile) — implementation notes

| Hạng mục | Chi tiết |
|----------|----------|
| Entry | `wireVirtualJoystick()`, `joyState`, `applyJoyVector` trong `game.js` |
| UI | `#touch-move-pad` + `#virtual-joystick.vj-float` · CSS `.mobile-controls` |
| Geometry | Đo half từ DOM (`measureJoystickHalf`) · `maxR ≈ 78%` half |
| Deadzone | Radial ~11% maxR · remap đúng (không double-scale) |
| Analog | Vector **giữ magnitude** — movement **không** re-normalize full speed khi chỉ joy |
| Follow | Base **trượt theo** ngón khi vượt maxR (vuốt dài vẫn đúng hướng) |
| Setting | `settings.joystick` · checkbox `set-joystick` / `pause-set-joystick` |
| Portrait | `body.run-portrait` · canvas ~9:16 in-run |

---

## 6. Hệ đồ họa — Vector Soft (`art.js` → `window.HOT_ART`)

### 6.1 Tokens (`HOT_ART.TOKENS`)

- UI: `bg`, `panel`, `plate`, `border`, `text`, `muted`, `gold`, `blood`, `outline`
- Rarity · damage types · elements · item slots

Helpers: `hexA`, `shade`, `roundRect`, `softDisc`, `softCapsule`, …

### 6.2 Icon plates

| Loại | Plate |
|------|--------|
| Ability | **Circle** (`plateCircle`) |
| Item | **Rounded square** (`plateSquare`) |
| Mark / Artifact | **Diamond** (`plateDiamond`) |

### 6.3 Soft world draws

`drawSoftEnemy`, miniboss aura, pickups, AOE, orbs, summons, chest/barrel/well, pillars, floor accents, projectiles, slash, cast burst, status ring, particles, HP bar, floating text, `fxColor`.

Master switch: `USE_PIXEL_SPRITES = false`.

### 6.4 Hero / boss

- **14 soft hero drawers** trong `game.js`
- Boss: vector soft · shadow **disabled**

---

## 7. Việt hóa

- `index.html` `lang="vi"`, title/menu VI.
- `vi-locale.js` map string data → tiếng Việt.
- UI chính VI; log/debug EN còn chấp nhận.
- Tab Hero: nhãn chỉ số **rút gọn** (Máu, Tốc đánh, ST KN %, …) để grid không đè chữ.

---

## 8. Data layer (`data.js` → `window.HOT`)

Export chính: `HEROES`, `ENEMIES`, `BOSSES`, `TRAITS`, `ABILITY_UPGRADES`, `ABILITIES`, `ITEMS`, `ITEM_RARITY_PACKAGES`, `MARKS`, `ARTIFACTS`, `BLESSINGS`, `SHARD_SHOP`, `WELL`, `POTIONS`, `BARRELS`, `HALLS`, `HALL_ORDER`, `AGONY`, `TORMENT`, `TORMENT_MODE`, `BALANCE`, `WEAPON_PROF`, `HERO_ORDER`, `MAX_ABILITIES`, `MAX_ITEMS`, `MAX_LOADOUT`, helpers `HP`/`DMG`/`SPD`/`RNG`.

Default settings include `joystick: true`.

**Balance note:** HP/DMG wiki scale xuống cho run ngắn (`HP ≈ ×0.32`, `DMG ≈ ×0.18`, …).

---

## 9. Quy ước code khi chỉnh sửa

1. **Ưu tiên sửa local, reversible** — không force-push, không xóa meta user.
2. **Đồ họa mới** → helper `art.js`, wire `game.js`; fallback nếu thiếu `HOT_ART`.
3. **Không bật lại pixel combat** trừ khi user yêu cầu.
4. **Map props sparse**.
5. **Ability panel** 1 màn, không scroll dài.
6. **Full unlock** content; chỉ Torment level giữ ladder.
7. **Torment:** luôn ẩn hall picker; random hall at start.
8. **VI** cho string user-facing mới.
9. **Joystick:** giữ analog magnitude + radial deadzone đúng; đo size từ DOM.
10. **Tab Hero:** không để media query run-sidebar (row-wrap / ẩn blurb) đụng `.hero-tab-detail`.
11. `game.js` rất lớn — grep theo tên hàm; tránh refactor toàn file.
12. User `up git` → commit rõ · `git push origin main`.
13. Không commit secrets; không thêm dependency nặng nếu không được hỏi.

### Lệnh git

```bash
cd C:\Users\Khai\halls-of-torment
git status
git add <files>
git commit -m "..."
git push origin main
```

Remote: `https://github.com/dangminhkhai/HallsofTormentHTML5.git`

---

## 10. Việc đã xong (tóm tắt)

- Full prototype: Hall/Torment, camp, marks, artifacts, U/R items
- UI/UX menu + HUD · Việt hóa · ability full list 1 màn
- Vector soft combat + **14 soft heroes** · ability icons/FX
- **Bank live** gold/shards on pickup
- Crit: red numbers · no freeze/shake/hitstop plate
- Pause Esc + **Cài đặt** (SFX, gamepad, joystick)
- **Tab Hero** layout fix (tên / khả năng / chỉ số không đè)
- **Torment:** ẩn chọn màn (PC + mobile); sảnh random
- **Mobile portrait 9:16** · floating joystick analog tối ưu (deadzone, maxR, base follow)
- Gỡ quick-hero strip trên tab Chơi
- Enemy telegraph · boss death burst · SFX bus/throttle

---

## 11. Việc còn có thể nâng cấp

| Hạng mục | Ghi chú |
|----------|---------|
| Hero drawers / weapon FX chi tiết hơn | optional |
| Tách module `game.js` | technical debt (~420KB+) |
| Archive `sprites.js` | không load trong index |
| Balance Torment gần wiki | optional |
| Haptic / stick opacity prefs | optional |

---

## 12. Anti-patterns (đừng làm)

- ❌ Filter ability / unlock gate content (trừ Torment level)
- ❌ Pixel sprite combat / bob-lean rung
- ❌ Shadow dưới chân
- ❌ Map props dày đặc
- ❌ Ability list scroll dài
- ❌ Hiện hall grid khi Torment (user chốt: random, ẩn UI)
- ❌ Re-normalize joystick → luôn full speed (mất precision)
- ❌ Crit freeze / “CHÍ MẠNG” plate / shake nặng (đã bỏ theo feedback)
- ❌ Media query run-sidebar đụng tab Hero (row-wrap → chữ đè)
- ❌ Bịa mechanic “official exact” 1:1
- ❌ Ghi đè uncommitted work / reset meta khi không được yêu cầu

---

## 13. Quick map: “Tôi cần sửa X → file nào?”

| Muốn sửa | File |
|----------|------|
| Chỉ số hero/item/ability/hall | `data.js` |
| Text VI | `vi-locale.js` + `index.html` |
| Màu / soft draw API | `art.js` |
| Combat loop, spawn, damage, draw, joystick, menu | `game.js` |
| Layout menu/HUD/mobile CSS | `style.css` |
| Markup overlays / mobile pad | `index.html` |
| Icon ability | `ability-icons.js` + plates `art.js` |
| Portrait menu | `menu-portraits.js` |
| Âm thanh | `sfx.js` |
| Hall menu art | `hall-art.js` |

### Hàm / ID hay dùng

| Chủ đề | Tìm |
|--------|-----|
| Torment UI | `updateDiffUI`, `setPlayMode`, `#zone-halls` |
| Hero tab | `refreshHeroTabDetail`, `updateHeroStatPanel`, `#tab-hero` |
| Joystick | `wireVirtualJoystick`, `applyJoyVector`, `joyState` |
| Bank live | pickup → `meta.gold` / shards save |
| Start gate | `startBlockReason`, `updateStartButton` |

---

## 14. Tóm tắt một đoạn (copy cho system prompt ngắn)

> Halls of Torment HTML5 là prototype vanilla JS fan game (repo dangminhkhai/HallsofTormentHTML5). Full unlock content; Torment ladder khóa cấp, **sảnh random (ẩn UI chọn màn)**. UI tiếng Việt; ability 1 màn không filter/scroll. Đồ họa **vector soft** (`HOT_ART` / `art.js`); không pixel combat, không shadow, map thưa. **Mobile:** portrait + floating analog stick. **Tab Hero:** panel dọc tên/khả năng/chỉ số. Data `data.js`, runtime `game.js`, locale `vi-locale.js`. 14 heroes, 7 halls, camp, Hall+Agony & Torment. Mở `index.html` là chạy. Chi tiết: `PROJECT-CONTEXT.md`.

---

*Living doc — khi đổi architecture / constraint quan trọng, cập nhật mục 2, 5, 10, 11, 12.*
