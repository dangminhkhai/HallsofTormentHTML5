# Halls of Torment — HTML5 Prototype

Browser prototype inspired by [Halls of Torment](https://hot.fandom.com/wiki/Halls_of_Torment_Wiki) (wiki mechanics, scaled for short runs).

## Play

Open `index.html` in a modern browser (Chrome / Edge / Firefox).  
All scripts are local — no build step, no server required (file:// works for this project).

## Modes

| Mode | Description |
|------|-------------|
| **Hall** | Pick hall · duration **5 / 10 / 15 min** · optional **Agony** |
| **Torment** | Level ladder (clear to unlock next) · hall random · optional **Artifacts** (48 wiki) |

## Features

- **14 Heroes** · **7 Halls** · abilities · equipment · potions / barrels  
- **Camp:** Blessings · Well loadout (7 slots) · Marks (equip any) · Shard shop · Settings  
- **Item rarity:** Common / Uncommon / Rare with separate effect packages  
- **Artifacts:** full wiki set, search + presets  
- SFX (Web Audio) · screen shake · gamepad · UI toast / camp sub-tabs  

## Controls

| Input | Action |
|-------|--------|
| `WASD` | Move |
| `Esc` / `P` | Pause · build summary |
| Gamepad | Stick / D-pad move · Start pause |

## Files

| File | Role |
|------|------|
| `index.html` | Shell UI |
| `style.css` | Layout / theme |
| `data.js` | Heroes, items, marks, artifacts, halls… |
| `game.js` | Runtime · combat · meta |
| `sfx.js` | Procedural audio |
| `ability-icons.js` · `menu-portraits.js` · `hall-art.js` | Canvas icons / art |

## Meta save

Progress is stored in `localStorage` (`hot_proto_meta_v3`). Clear via **Camp → Settings**.

## License / note

Fan prototype for learning / personal use — not affiliated with the official game.
