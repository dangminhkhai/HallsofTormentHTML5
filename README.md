# Halls of Torment — HTML5 Prototype

Browser (and **offline Android**) prototype inspired by [Halls of Torment](https://hot.fandom.com/wiki/Halls_of_Torment_Wiki) (wiki mechanics, scaled for short runs).

> **AI / full context:** [`PROJECT-CONTEXT.md`](./PROJECT-CONTEXT.md)  
> **Android APK:** [`ANDROID.md`](./ANDROID.md)

## Play (browser)

Open `index.html` in Chrome / Edge / Firefox.  
No build step — `file://` works. All scripts are local.

## Play (Android offline)

1. Download **`dist-apk/HallsOfTorment-debug.apk`** from this repo (or rebuild — [`ANDROID.md`](./ANDROID.md)).
2. Copy to phone → install (allow unknown sources).
3. Play offline; progress is stored in the app WebView.

```powershell
# Rebuild APK (needs JDK 17 + Android SDK)
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.19.10-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"
npm install
npm run build:apk
```

## Modes

| Mode | Description |
|------|-------------|
| **Hall** | Pick hall · **5 / 10 / 15 min** · optional **Agony** |
| **Torment** | Level ladder · **hall random** (no picker) · optional **Artifacts** |

## Features

- **14 Heroes** · **7 Halls** · abilities · equipment (Common / Uncommon / Rare)  
- **Camp:** Blessings · Well loadout (click to cycle rarity) · Marks · Shard shop · Settings  
- **Live bank:** gold & shards on pickup  
- Vector soft art · Vietnamese UI · gamepad  
- **Mobile:** portrait 9:16 · floating stick · world zoom · large HUD  
- **Pause:** Status / Settings tabs  
- Boss phases, charge/slam telegraphs, difficulty ramp  

## Controls

| Input | Action |
|-------|--------|
| `WASD` | Move |
| `Esc` / `P` | Pause |
| Gamepad | Stick / D-pad · Start pause |
| Touch | Floating stick · pause button (mobile only) |

## Menu tabs

| Tab | Content |
|-----|---------|
| **Chơi** | Mode · hall (Hall only) · duration / Agony or Torment + artifacts · start |
| **Anh hùng** | Roster · stats · skill · pick hero |
| **Trại** | Blessings · Well · Marks · Shards · Settings |

## Project layout

| Path | Role |
|------|------|
| `index.html` · `style.css` · `game.js` · `data.js` · … | Web game |
| `art.js` | Vector soft design system |
| `package.json` · `capacitor.config.json` | Capacitor Android wrapper |
| `scripts/` | `sync-www.js`, `build-apk.js`, SDK setup |
| `android/` | Native project (generated/maintained by Capacitor) |
| `ANDROID.md` | APK install & rebuild |

## Meta save

- Progress: `localStorage` `hot_proto_meta_v3`  
- Settings: `hot_proto_settings_v1`  
- Clear: **Camp → Settings**

## License / note

Fan prototype for learning / personal use — not affiliated with the official game.
