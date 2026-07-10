/**
 * Copy game static files into www/ for Capacitor packaging.
 */
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const www = path.join(root, "www");

const FILES = [
  "index.html",
  "style.css",
  "data.js",
  "game.js",
  "art.js",
  "sfx.js",
  "vi-locale.js",
  "ability-icons.js",
  "menu-portraits.js",
  "hall-art.js",
  "sprites.js",
];

function rimraf(dir) {
  if (!fs.existsSync(dir)) return;
  fs.rmSync(dir, { recursive: true, force: true });
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

rimraf(www);
ensureDir(www);

for (const f of FILES) {
  const src = path.join(root, f);
  if (!fs.existsSync(src)) {
    console.warn("skip missing:", f);
    continue;
  }
  fs.copyFileSync(src, path.join(www, f));
  console.log("copied", f);
}

// PWA-ish icons placeholder (optional Android uses mipmap)
const manifest = {
  name: "Halls of Torment",
  short_name: "HoT",
  start_url: "./index.html",
  display: "standalone",
  background_color: "#0c0a10",
  theme_color: "#0c0a10",
  orientation: "any",
};
fs.writeFileSync(path.join(www, "manifest.webmanifest"), JSON.stringify(manifest, null, 2));

// Patch index.html: ensure viewport + manifest + mobile-web-app capable
let html = fs.readFileSync(path.join(www, "index.html"), "utf8");
if (!html.includes("manifest.webmanifest")) {
  html = html.replace(
    /<head>/i,
    `<head>\n  <link rel="manifest" href="manifest.webmanifest" />\n  <meta name="mobile-web-app-capable" content="yes" />\n  <meta name="apple-mobile-web-app-capable" content="yes" />\n  <meta name="theme-color" content="#0c0a10" />`
  );
}
// Prefer full-screen safe viewport
if (!html.includes("viewport-fit=cover")) {
  html = html.replace(
    /content="[^"]*viewport[^"]*"/i,
    'content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover"'
  );
  if (!html.includes("name=\"viewport\"")) {
    html = html.replace(
      /<head>/i,
      `<head>\n  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />`
    );
  }
}
fs.writeFileSync(path.join(www, "index.html"), html);

console.log("www/ ready for Capacitor");
