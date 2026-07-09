/**
 * Hall scene art for menu select + shared visual motifs.
 * Each id matches HALLS keys and draws a scene matching the hall name.
 */
window.drawHallArt = function drawHallArt(ctx, hallId, w, h) {
  const id = hallId || "haunted_caverns";
  ctx.clearRect(0, 0, w, h);
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, w, h);
  ctx.clip();

  const drawers = {
    haunted_caverns: drawHauntedCaverns,
    ember_grounds: drawEmberGrounds,
    forgotten_viaduct: drawForgottenViaduct,
    frozen_depths: drawFrozenDepths,
    chambers_of_dissonance: drawChambersDissonance,
    the_vault: drawTheVault,
    boglands: drawBoglands,
  };
  (drawers[id] || drawHauntedCaverns)(ctx, w, h);
  ctx.restore();
};

function fillBg(ctx, w, h, c0, c1, x0, y0, x1, y1) {
  const g = ctx.createLinearGradient(x0 ?? 0, y0 ?? 0, x1 ?? 0, y1 ?? h);
  g.addColorStop(0, c0);
  g.addColorStop(1, c1);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

/** Dark purple crystal cave — Haunted Caverns */
function drawHauntedCaverns(ctx, w, h) {
  fillBg(ctx, w, h, "#1a1028", "#08060e");
  // cave mouth / ceiling
  ctx.fillStyle = "#0a0810";
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(w, 0);
  ctx.lineTo(w, h * 0.22);
  ctx.quadraticCurveTo(w * 0.5, h * 0.42, 0, h * 0.22);
  ctx.fill();
  // floor rocks
  ctx.fillStyle = "#16101e";
  ctx.fillRect(0, h * 0.62, w, h * 0.38);
  // purple crystals
  const crystals = [
    [0.18, 0.7, 0.12], [0.35, 0.75, 0.08], [0.72, 0.68, 0.14], [0.88, 0.72, 0.09],
  ];
  for (const [nx, ny, ns] of crystals) {
    const cx = nx * w;
    const cy = ny * h;
    const s = ns * Math.min(w, h);
    ctx.fillStyle = "#6a3a90";
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.lineTo(cx + s * 0.45, cy + s * 0.15);
    ctx.lineTo(cx - s * 0.45, cy + s * 0.15);
    ctx.fill();
    ctx.fillStyle = "rgba(180,120,255,0.55)";
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.85);
    ctx.lineTo(cx + s * 0.18, cy - s * 0.1);
    ctx.lineTo(cx - s * 0.08, cy);
    ctx.fill();
  }
  // floating ghosts
  ctx.globalAlpha = 0.45;
  for (let i = 0; i < 3; i++) {
    const gx = w * (0.3 + i * 0.2);
    const gy = h * (0.35 + (i % 2) * 0.08);
    ctx.fillStyle = "#c0a0e8";
    ctx.beginPath();
    ctx.ellipse(gx, gy, 10, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#1a1020";
    ctx.beginPath();
    ctx.arc(gx - 3, gy - 2, 2, 0, Math.PI * 2);
    ctx.arc(gx + 3, gy - 2, 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // skull
  ctx.fillStyle = "#d0c0b0";
  ctx.beginPath();
  ctx.ellipse(w * 0.52, h * 0.78, 9, 8, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#201018";
  ctx.beginPath();
  ctx.arc(w * 0.52 - 3, h * 0.77, 2, 0, Math.PI * 2);
  ctx.arc(w * 0.52 + 3, h * 0.77, 2, 0, Math.PI * 2);
  ctx.fill();
}

/** Scorched volcanic plain — Ember Grounds */
function drawEmberGrounds(ctx, w, h) {
  fillBg(ctx, w, h, "#3a1810", "#100804");
  // lava river
  const lava = ctx.createLinearGradient(0, h * 0.55, 0, h);
  lava.addColorStop(0, "#ff6020");
  lava.addColorStop(0.5, "#c02010");
  lava.addColorStop(1, "#601008");
  ctx.fillStyle = lava;
  ctx.beginPath();
  ctx.moveTo(0, h * 0.72);
  ctx.quadraticCurveTo(w * 0.25, h * 0.55, w * 0.5, h * 0.7);
  ctx.quadraticCurveTo(w * 0.75, h * 0.88, w, h * 0.65);
  ctx.lineTo(w, h);
  ctx.lineTo(0, h);
  ctx.fill();
  // cracked ground
  ctx.strokeStyle = "rgba(255,100,40,0.5)";
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    const x = w * (0.1 + i * 0.15);
    ctx.beginPath();
    ctx.moveTo(x, h * 0.4);
    ctx.lineTo(x + 8, h * 0.55);
    ctx.lineTo(x - 4, h * 0.65);
    ctx.stroke();
  }
  // rocks
  ctx.fillStyle = "#2a1810";
  ctx.fillRect(w * 0.08, h * 0.42, 18, 14);
  ctx.fillRect(w * 0.7, h * 0.38, 22, 16);
  // embers
  ctx.fillStyle = "#ffc060";
  for (let i = 0; i < 12; i++) {
    const x = ((i * 47) % 97) / 100 * w;
    const y = ((i * 31) % 60) / 100 * h * 0.5 + h * 0.15;
    ctx.globalAlpha = 0.4 + (i % 3) * 0.2;
    ctx.beginPath();
    ctx.arc(x, y, 1.5 + (i % 3), 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  // distant volcano glow
  const vg = ctx.createRadialGradient(w * 0.5, h * 0.25, 2, w * 0.5, h * 0.25, w * 0.35);
  vg.addColorStop(0, "rgba(255,80,20,0.45)");
  vg.addColorStop(1, "transparent");
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, w, h * 0.5);
  ctx.fillStyle = "#1a0c08";
  ctx.beginPath();
  ctx.moveTo(w * 0.28, h * 0.45);
  ctx.lineTo(w * 0.5, h * 0.12);
  ctx.lineTo(w * 0.72, h * 0.45);
  ctx.fill();
  ctx.fillStyle = "#ff4020";
  ctx.beginPath();
  ctx.moveTo(w * 0.46, h * 0.2);
  ctx.lineTo(w * 0.5, h * 0.12);
  ctx.lineTo(w * 0.54, h * 0.2);
  ctx.fill();
}

/** Stone bridge over abyss — Forgotten Viaduct */
function drawForgottenViaduct(ctx, w, h) {
  fillBg(ctx, w, h, "#1a2438", "#0a0e18");
  // fog bands
  ctx.fillStyle = "rgba(140,160,200,0.12)";
  ctx.fillRect(0, h * 0.35, w, h * 0.12);
  ctx.fillRect(0, h * 0.55, w, h * 0.1);
  // abyss
  ctx.fillStyle = "#050810";
  ctx.fillRect(0, h * 0.7, w, h * 0.3);
  // bridge
  ctx.fillStyle = "#4a5568";
  ctx.fillRect(0, h * 0.52, w, 10);
  ctx.fillStyle = "#6a7588";
  ctx.fillRect(0, h * 0.5, w, 4);
  // arches under bridge
  ctx.fillStyle = "#2a3040";
  for (let i = 0; i < 4; i++) {
    const ax = w * (0.12 + i * 0.22);
    ctx.beginPath();
    ctx.moveTo(ax - 14, h * 0.62);
    ctx.quadraticCurveTo(ax, h * 0.48, ax + 14, h * 0.62);
    ctx.lineTo(ax + 14, h * 0.72);
    ctx.lineTo(ax - 14, h * 0.72);
    ctx.fill();
  }
  // pillars / posts
  ctx.fillStyle = "#5a6578";
  for (let i = 0; i < 5; i++) {
    const px = w * (0.08 + i * 0.2);
    ctx.fillRect(px - 3, h * 0.38, 6, h * 0.14);
    ctx.fillRect(px - 6, h * 0.36, 12, 5);
  }
  // ghostly figure on bridge
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = "#a0b8e0";
  ctx.beginPath();
  ctx.ellipse(w * 0.55, h * 0.42, 6, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  // moon
  ctx.fillStyle = "rgba(200,210,230,0.7)";
  ctx.beginPath();
  ctx.arc(w * 0.82, h * 0.18, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1a2438";
  ctx.beginPath();
  ctx.arc(w * 0.86, h * 0.16, 10, 0, Math.PI * 2);
  ctx.fill();
}

/** Icy underground — Frozen Depths */
function drawFrozenDepths(ctx, w, h) {
  fillBg(ctx, w, h, "#103040", "#061018");
  // ice floor
  const ice = ctx.createLinearGradient(0, h * 0.5, 0, h);
  ice.addColorStop(0, "#2a6080");
  ice.addColorStop(1, "#0a2030");
  ctx.fillStyle = ice;
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  // ice reflections
  ctx.strokeStyle = "rgba(180,230,255,0.25)";
  ctx.lineWidth = 1;
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(w * (0.1 + i * 0.18), h * 0.6);
    ctx.lineTo(w * (0.2 + i * 0.18), h * 0.9);
    ctx.stroke();
  }
  // icicles from ceiling
  ctx.fillStyle = "#80c0e0";
  for (let i = 0; i < 8; i++) {
    const x = w * (0.08 + i * 0.12);
    const len = 12 + (i % 3) * 8;
    ctx.beginPath();
    ctx.moveTo(x - 4, 0);
    ctx.lineTo(x + 4, 0);
    ctx.lineTo(x, len);
    ctx.fill();
  }
  // ice pillars
  ctx.fillStyle = "rgba(140,200,230,0.55)";
  ctx.fillRect(w * 0.15, h * 0.28, 12, h * 0.35);
  ctx.fillRect(w * 0.78, h * 0.32, 14, h * 0.32);
  ctx.fillStyle = "rgba(200,240,255,0.35)";
  ctx.fillRect(w * 0.16, h * 0.3, 4, h * 0.3);
  // snowflakes
  ctx.fillStyle = "rgba(220,240,255,0.7)";
  for (let i = 0; i < 10; i++) {
    const x = ((i * 53) % 100) / 100 * w;
    const y = ((i * 37) % 100) / 100 * h * 0.5;
    ctx.beginPath();
    ctx.arc(x, y, 1.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // frozen crystal center
  ctx.fillStyle = "#a0e0ff";
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.42);
  ctx.lineTo(w * 0.56, h * 0.58);
  ctx.lineTo(w * 0.5, h * 0.72);
  ctx.lineTo(w * 0.44, h * 0.58);
  ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.beginPath();
  ctx.moveTo(w * 0.5, h * 0.45);
  ctx.lineTo(w * 0.53, h * 0.56);
  ctx.lineTo(w * 0.5, h * 0.62);
  ctx.fill();
}

/** Chaotic purple chambers — Chambers of Dissonance */
function drawChambersDissonance(ctx, w, h) {
  fillBg(ctx, w, h, "#281028", "#100818");
  // warped tiles
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 6; col++) {
      const x = col * (w / 6);
      const y = h * 0.4 + row * (h * 0.15);
      const hue = (row * 40 + col * 25) % 60;
      ctx.fillStyle = `hsla(${280 + hue}, 50%, ${18 + (row + col) % 3 * 6}%, 0.9)`;
      ctx.beginPath();
      ctx.moveTo(x + 2, y + ((col + row) % 2) * 4);
      ctx.lineTo(x + w / 6 - 2, y);
      ctx.lineTo(x + w / 6 - 4, y + h * 0.14);
      ctx.lineTo(x + 4, y + h * 0.12);
      ctx.fill();
    }
  }
  // floating broken geometry
  ctx.fillStyle = "#c040a0";
  ctx.save();
  ctx.translate(w * 0.3, h * 0.25);
  ctx.rotate(0.4);
  ctx.fillRect(-10, -10, 20, 20);
  ctx.restore();
  ctx.fillStyle = "#60a0e0";
  ctx.save();
  ctx.translate(w * 0.7, h * 0.22);
  ctx.rotate(-0.5);
  ctx.beginPath();
  ctx.moveTo(0, -12);
  ctx.lineTo(12, 10);
  ctx.lineTo(-12, 10);
  ctx.fill();
  ctx.restore();
  // eye of chaos
  ctx.fillStyle = "#a02080";
  ctx.beginPath();
  ctx.ellipse(w * 0.5, h * 0.28, 22, 14, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#201028";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.28, 7, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#ff60e0";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.28, 3, 0, Math.PI * 2);
  ctx.fill();
  // dissonant rings
  ctx.strokeStyle = "rgba(220,80,200,0.4)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.55, 28, 0.2, Math.PI * 1.5);
  ctx.stroke();
  ctx.strokeStyle = "rgba(100,160,255,0.35)";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.55, 40, -0.5, Math.PI);
  ctx.stroke();
}

/** Golden treasure vault — The Vault */
function drawTheVault(ctx, w, h) {
  fillBg(ctx, w, h, "#2a2010", "#100c08");
  // marble floor
  ctx.fillStyle = "#3a3020";
  ctx.fillRect(0, h * 0.55, w, h * 0.45);
  ctx.strokeStyle = "rgba(212,168,75,0.25)";
  for (let i = 0; i < 5; i++) {
    ctx.beginPath();
    ctx.moveTo(0, h * (0.55 + i * 0.09));
    ctx.lineTo(w, h * (0.55 + i * 0.09));
    ctx.stroke();
  }
  // vault door
  ctx.fillStyle = "#2a2418";
  ctx.fillRect(w * 0.28, h * 0.12, w * 0.44, h * 0.48);
  ctx.strokeStyle = "#d4a84b";
  ctx.lineWidth = 3;
  ctx.strokeRect(w * 0.28, h * 0.12, w * 0.44, h * 0.48);
  // door circle
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.36, Math.min(w, h) * 0.12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = "#1a160c";
  ctx.beginPath();
  ctx.arc(w * 0.5, h * 0.36, Math.min(w, h) * 0.08, 0, Math.PI * 2);
  ctx.fill();
  // spokes
  ctx.strokeStyle = "#c09030";
  ctx.lineWidth = 2;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, h * 0.36);
    ctx.lineTo(w * 0.5 + Math.cos(a) * 22, h * 0.36 + Math.sin(a) * 22);
    ctx.stroke();
  }
  // gold piles
  ctx.fillStyle = "#d4a84b";
  for (const nx of [0.12, 0.88]) {
    ctx.beginPath();
    ctx.moveTo(w * nx - 14, h * 0.78);
    ctx.lineTo(w * nx, h * 0.62);
    ctx.lineTo(w * nx + 14, h * 0.78);
    ctx.fill();
    ctx.fillStyle = "#f0d060";
    ctx.beginPath();
    ctx.arc(w * nx - 6, h * 0.74, 4, 0, Math.PI * 2);
    ctx.arc(w * nx + 4, h * 0.76, 3.5, 0, Math.PI * 2);
    ctx.arc(w * nx, h * 0.7, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#d4a84b";
  }
  // torch glow
  const tg = ctx.createRadialGradient(w * 0.15, h * 0.3, 2, w * 0.15, h * 0.3, 30);
  tg.addColorStop(0, "rgba(255,200,80,0.5)");
  tg.addColorStop(1, "transparent");
  ctx.fillStyle = tg;
  ctx.fillRect(0, 0, w * 0.4, h * 0.55);
}

/** Swamp wetlands — Boglands */
function drawBoglands(ctx, w, h) {
  fillBg(ctx, w, h, "#1a2818", "#0a100c");
  // murky water
  const water = ctx.createLinearGradient(0, h * 0.5, 0, h);
  water.addColorStop(0, "#204028");
  water.addColorStop(1, "#0c1810");
  ctx.fillStyle = water;
  ctx.fillRect(0, h * 0.48, w, h * 0.52);
  // lily pads / scum
  ctx.fillStyle = "rgba(60,120,50,0.45)";
  for (let i = 0; i < 6; i++) {
    const x = w * (0.1 + i * 0.15);
    const y = h * (0.58 + (i % 3) * 0.1);
    ctx.beginPath();
    ctx.ellipse(x, y, 14, 6, 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  // dead trees
  ctx.strokeStyle = "#3a3020";
  ctx.lineWidth = 3;
  ctx.lineCap = "round";
  for (const nx of [0.18, 0.75, 0.9]) {
    const bx = w * nx;
    ctx.beginPath();
    ctx.moveTo(bx, h * 0.72);
    ctx.quadraticCurveTo(bx + 8, h * 0.4, bx - 4, h * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx - 2, h * 0.35);
    ctx.lineTo(bx - 16, h * 0.22);
    ctx.moveTo(bx, h * 0.28);
    ctx.lineTo(bx + 12, h * 0.18);
    ctx.stroke();
  }
  // mist
  ctx.fillStyle = "rgba(120,160,100,0.12)";
  ctx.fillRect(0, h * 0.3, w, h * 0.2);
  // mossy mound
  ctx.fillStyle = "#2a4030";
  ctx.beginPath();
  ctx.ellipse(w * 0.45, h * 0.72, 30, 12, 0, 0, Math.PI * 2);
  ctx.fill();
  // fireflies
  ctx.fillStyle = "#c0ff80";
  for (let i = 0; i < 8; i++) {
    const x = ((i * 41) % 100) / 100 * w;
    const y = ((i * 29) % 70) / 100 * h * 0.5 + h * 0.15;
    ctx.globalAlpha = 0.5 + (i % 2) * 0.35;
    ctx.beginPath();
    ctx.arc(x, y, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
