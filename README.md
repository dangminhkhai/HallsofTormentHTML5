# Halls of Torment — HTML5 Prototype

Browser prototype inspired by [Halls of Torment](https://hot.fandom.com/wiki/Halls_of_Torment_Wiki) (wiki mechanics, scaled for short runs).

> **For AI / full project context:** see [`PROJECT-CONTEXT.md`](./PROJECT-CONTEXT.md) (constraints, features, art system, mobile stick, file map).

## Play

Open `index.html` in a modern browser (Chrome / Edge / Firefox).  
All scripts are local — no build step, no server required (`file://` works).

## Modes

| Mode | Description |
|------|-------------|
| **Hall** | Pick hall · duration **5 / 10 / 15 min** · optional **Agony** |
| **Torment** | Level ladder (clear to unlock next) · **hall is random** (no hall picker UI) · optional **Artifacts** |

## Features

- **14 Heroes** · **7 Halls** · abilities · equipment · potions / barrels  
- **Camp:** Blessings · Well loadout · Marks · Shard shop · Settings  
- **Item rarity:** Common / Uncommon / Rare packages  
- **Artifacts:** full wiki set, search + presets (Torment)  
- **Live bank:** gold & shards saved on pickup  
- Vector soft art (`art.js`) · SFX (Web Audio) · gamepad · Vietnamese UI  
- **Mobile:** portrait 9:16 run · floating virtual stick (analog) · pause button  

## Controls

| Input | Action |
|-------|--------|
| `WASD` | Move |
| `Esc` / `P` | Pause · build summary · settings |
| Gamepad | Stick / D-pad move · Start pause |
| Touch (mobile) | Tap-drag anywhere for floating stick · pause button top-right |

Toggle the stick under **Camp → Settings** or pause settings (**Cần xoay**).

## Menu tabs

| Tab | Content |
|-----|---------|
| **Chơi** | Mode · hall grid (Hall only) · duration / Agony or Torment level + artifacts · start |
| **Anh hùng** | Roster by damage type · stats compare · skill blurb · pick hero |
| **Trại** | Blessings · Well · Marks · Shards · Settings |

## Files

| File | Role |
|------|------|
| `index.html` | Shell UI + mobile controls |
| `style.css` | Layout / theme / mobile portrait |
| `data.js` | Heroes, items, marks, artifacts, halls… |
| `game.js` | Runtime · combat · meta · joystick |
| `sfx.js` | Procedural audio |
| `art.js` | **Vector soft design system** |
| `ability-icons.js` · `menu-portraits.js` · `hall-art.js` | Icons / portraits / hall art |

## Meta save

Progress: `localStorage` key `hot_proto_meta_v3`.  
Settings (SFX, gamepad, joystick): `hot_proto_settings_v1`.  
Clear meta via **Camp → Settings**.

## License / note

Fan prototype for learning / personal use — not affiliated with the official game.
