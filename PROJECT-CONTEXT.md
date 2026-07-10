# Halls of Torment HTML5 — Project Context (for AI / contributors)

Tài liệu tổng hợp **toàn bộ ngữ cảnh dự án** từ quá trình phát triển và các quyết định của user.  
Mục tiêu: AI hoặc dev khác đọc file này là nắm được **game có gì**, **constraint gì**, **code nằm đâu**, **đừng làm gì**.

**Cập nhật:** 2026-07-10 · **Repo:** https://github.com/dangminhkhai/HallsofTormentHTML5 · **Branch:** `main`  
**Workspace local:** `C:\Users\Khai\halls-of-torment\`  
**Ghi chú session:** balance + boss feel; mobile world zoom ×1.48; loadout độ hiếm; item U/R; pause tab; **Android APK offline (Capacitor)** · xem `ANDROID.md`.

---

## 1. Dự án là gì

- **Fan prototype browser** của game *Halls of Torment* (roguelite survivor-like, top-down).
- **Stack web:** vanilla **HTML + CSS + JS** — không framework; mở `index.html` là chạy.
- **Android:** gói offline qua **Capacitor 6** WebView → debug APK (`dist-apk/HallsOfTorment-debug.apk` sau build).
- Wiki tham chiếu (scale run 5–15 phút): https://hot.fandom.com/wiki/Halls_of_Torment_Wiki
- **Không** official; học / cá nhân.

---

## 2. Quyết định & constraint (BẮT BUỘC)

| Rule | Chi tiết |
|------|----------|
| **Full unlock** | Không khóa hero / hall / ability / mark / camp bằng quest. |
| **Torment ladder** | Cấp Khổ hình khóa theo tiến độ (thắng mới mở cấp tiếp). |
| **Torment = sảnh ngẫu nhiên** | Ẩn UI chọn màn; hall random lúc `startGame`. |
| **Không shadow** | `drawShadow` = no-op. |
| **Map thưa** | Props sparse. |
| **Ability 1 màn, không scroll** | Grid compact, full list, không filter dmg type. |
| **Full VI** | UI tiếng Việt; tab Hero nhãn chỉ số gọn. |
| **Vector Soft only** | Combat `HOT_ART` (`art.js`). Không pixel combat. `sprites.js` không load. |
| **Crit UX** | Số đỏ · **không** freeze / plate “CHÍ MẠNG” / hitstop crit. |
| **Bank live** | Vàng + mảnh → meta ngay khi nhặt. |
| **Mobile** | Portrait 9:16 · floating analog stick · **world zoom** · HUD to · **PC không** hiện stick/pause. |
| **In-run** | Không vẽ tên hero trên đầu / ẩn `#class-name` HUD. |
| **Loadout** | Giếng: bấm cycle **Thường → Hiếm vừa → Cực hiếm → gỡ** (miễn phí). |
| **Git** | `up git` → commit + push `origin/main`. |

---

## 3. Cách chạy

### Browser
```text
index.html
  → data.js → vi-locale.js → art.js → sfx.js
  → menu-portraits.js → hall-art.js → ability-icons.js → game.js
```
`file://` OK · `node --check game.js`

### Android APK (offline)
Chi tiết: **`ANDROID.md`**.

```powershell
# Build lại debug APK
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
npm install
npm run build:apk
# → dist-apk/HallsOfTorment-debug.apk
```

| | |
|--|--|
| Package id | `com.dangminhkhai.hallsoftorment` |
| webDir | `www/` (copy từ script `scripts/sync-www.js`) |
| Config | `capacitor.config.json` |
| Native | `android/` (Capacitor; không commit `build/`, `local.properties`) |

---

## 4. Cấu trúc file

| File / thư mục | Vai trò |
|----------------|---------|
| `index.html` | Shell UI, mobile controls, pause tabs |
| `style.css` | Theme, menu, mobile portrait HUD, joystick |
| `data.js` | `HOT_DATA`: heroes, items+U/R packages, halls, balance, agony, torment |
| `game.js` | Runtime combat, meta, joystick, zoom, boss AI, menu |
| `art.js` | `HOT_ART` vector soft |
| `vi-locale.js` | VI labels |
| `ability-icons.js` · `menu-portraits.js` · `hall-art.js` | Icons / portraits / hall art |
| `sfx.js` | Web Audio procedural |
| `package.json` · `capacitor.config.json` | Capacitor packaging |
| `scripts/sync-www.js` · `build-apk.js` · `setup-android-sdk.ps1` | Build APK helpers |
| `android/` | Native Android project (Capacitor) |
| `ANDROID.md` | Hướng dẫn cài / build APK |
| `PROJECT-CONTEXT.md` | File này |
| `README.md` | Hướng dẫn ngắn |

### localStorage

| Key | Nội dung |
|-----|----------|
| `hot_proto_meta_v3` | Meta (gold, shards, loadout **{id,rarity}**, marks, torment…) |
| `hot_proto_settings_v1` | SFX, shake, gamepad, **joystick** |
| `hot_proto_art_open` | Collapse artifacts |
| `hot_proto_v1` | Snapshot hero/hall |

---

## 5. Feature inventory

### 5.1 Modes
- **Hall:** chọn sảnh · 5/10/15p · Agony 1–5 (meter scale theo run).
- **Torment:** ladder · ẩn hall picker · random hall · artifacts mở hết.

### 5.2 Heroes (14) · Halls (7)
Roster theo dmg type (VL/PT/NT/K). Soft drawers trong `game.js`.

### 5.3 Items
- 7 slot · Common / **Uncommon (Boost)** / **Rare (Boost+Growth)**.
- Rare apply = common + uncommon package + rare package.
- Rương: tỉ lệ U/R cao hơn · guarantee ≥1 Uncommon; elite/boss guarantee Rare.
- **Loadout Giếng:** cycle rarity bằng re-click.

### 5.4 Combat & balance (`data.js` BALANCE + `getDiffMods`)
- Early spawn nhẹ · late ramp HP/ST/spawn theo progress.
- Agony rank rõ; Torment L1 soft entry, scale `^L`.
- Boss: `bossHpMul` / `bossDmgMul` · phase 2/3 · wind_charge telegraph · slam ring · hit sparks · player hurt numbers.

### 5.5 Mobile in-run
| | |
|--|--|
| Layout | `body.run-portrait` · canvas 9:16 · HUD dock dưới |
| Stick | Floating · analog · mờ · base follow · `settings.joystick` |
| World zoom | `getWorldZoom()` · portrait **×1.48** · touch landscape **×1.28** · PC ×1 |
| Controls | Chỉ `wantsMobileRunControls()` (coarse pointer) — **PC ẩn stick/pause** |
| Name | Không vẽ `player.name` world; ẩn `#class-name` |

### 5.6 Pause
- Subtabs: **Trạng thái** (build) · **Cài đặt** (vol + checkbox 2×2 gọn).
- `enterPause()` · `setPauseTab()`.

### 5.7 Menu tabs
**Chơi** · **Anh hùng** · **Trại** (blessings / well / marks / shards / settings).  
Play + Hero mobile: scroll stack, không đè panel.

---

## 6. Vector Soft (`art.js` → `HOT_ART`)

Plates circle/square/diamond · soft enemy/pickup/AOE/projectile/slash · no shadow · map props sparse.

---

## 7. Quy ước khi sửa code

1. Local reversible; không force-push / xóa meta user.
2. Đồ họa mới → `art.js` + wire `game.js`.
3. Không bật pixel combat; map sparse; ability 1 màn.
4. Torment luôn ẩn hall picker.
5. Joystick: giữ analog magnitude; mobile-only chrome.
6. World zoom: camera dùng `viewW()`/`viewH()`; draw scale trong `draw()`.
7. Loadout lưu `{ id, rarity }`.
8. `up git` → commit rõ · push `main`.
9. APK: sau sửa web → `npm run build:apk`; không commit `node_modules/`, `www/`, `*.apk`, `android/**/build/`.

```bash
cd C:\Users\Khai\halls-of-torment
git add <files>
git commit -m "..."
git push origin main
```

---

## 8. Việc đã xong (tóm tắt)

- Full prototype Hall/Torment/camp/marks/artifacts/items U/R  
- Soft 14 heroes · ability icons · bank live · crit đỏ  
- Mobile portrait + stick + **world zoom** + HUD to  
- Balance curve + boss telegraphs/phases/hit feel  
- Pause tabs · Hero/Play mobile layout · Torment hide halls  
- Loadout rarity cycle · item drop guarantees  
- **Capacitor Android offline APK** pipeline  

---

## 9. Có thể nâng tiếp

| Hạng mục | Ghi chú |
|----------|---------|
| Hero/weapon FX chi tiết | optional |
| Tách `game.js` | debt |
| Signed release APK / Play | cần keystore |
| Haptic | optional |
| Balance fine-tune theo feedback | ongoing |

---

## 10. Anti-patterns

- ❌ Unlock gate content (trừ Torment level)  
- ❌ Pixel combat / shadow / map dày / ability scroll  
- ❌ Hall grid khi Torment  
- ❌ Joystick full-speed normalize  
- ❌ Crit freeze / CHÍ MẠNG plate  
- ❌ Stick/pause trên PC  
- ❌ Commit `node_modules`, APK, `android/build`  

---

## 11. Quick map

| Muốn sửa | File |
|----------|------|
| Balance / agony / torment scale | `data.js` → `BALANCE`, `AGONY`, `TORMENT_MODE` |
| Boss AI / telegraph / zoom / combat | `game.js` |
| Mobile HUD / menu CSS | `style.css` |
| Item U/R packages | `data.js` `ITEM_RARITY_PACKAGES` |
| Loadout UI | `game.js` `toggleLoadoutItem`, `buildWellGrid` |
| APK packaging | `package.json`, `scripts/*`, `android/`, `ANDROID.md` |

| Chủ đề | Hàm / ID |
|--------|----------|
| Diff | `getDiffMods`, `hallStrengthAt`, `spawnIntervalForProgress` |
| Boss | `updateBoss`, `spawnBoss`, `wind_charge`, `slam` |
| Zoom | `getWorldZoom`, `viewW`, `viewH` |
| Stick | `wireVirtualJoystick`, `applyJoyVector` |
| Pause | `enterPause`, `setPauseTab` |
| APK | `npm run build:apk` |

---

## 12. System prompt ngắn

> Halls of Torment HTML5: vanilla JS fan prototype (repo dangminhkhai/HallsofTormentHTML5). Full unlock; Torment ladder + random hall. Vector soft `HOT_ART`. VI UI. Mobile: portrait, floating stick, world zoom ×1.48. Items Common/Uncommon/Rare; loadout cycle rarity. Balance ramp + boss phases/telegraphs. Offline Android via Capacitor → `ANDROID.md`. Data `data.js`, runtime `game.js`. Mở `index.html` hoặc cài debug APK. Chi tiết: `PROJECT-CONTEXT.md`.

---

*Living doc — cập nhật khi đổi constraint / packaging / combat.*
