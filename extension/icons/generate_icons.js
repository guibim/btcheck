/**
 * Generates icon16.png, icon48.png, icon128.png using the Canvas API via node-canvas.
 * Run: node generate_icons.js
 * Requires: npm install canvas  (in this folder or globally)
 *
 * Fallback: if canvas is unavailable, SVG files are written instead —
 * Chrome accepts SVG icons, so the extension will still work.
 */
const fs   = require("fs");
const path = require("path");

const SIZES = [16, 48, 128];
const BG    = "#0f172a";
const FG    = "#f7931a";

function buildSVG(size) {
  const r    = Math.max(2, Math.round(size / 8));
  const fs_  = Math.round(size * 0.62);
  // vertical nudge: ₿ descender varies by renderer, empirically -4%
  const cy   = Math.round(size * 0.54);

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${r}" ry="${r}" fill="${BG}"/>
  <text
    x="50%" y="${cy}"
    font-family="Arial, sans-serif"
    font-size="${fs_}"
    font-weight="bold"
    fill="${FG}"
    text-anchor="middle"
    dominant-baseline="central"
  >&#x20BF;</text>
</svg>`;
}

let canvasAvailable = false;
let createCanvas;

try {
  ({ createCanvas } = require("canvas"));
  canvasAvailable = true;
} catch (_) {}

const dir = __dirname;

if (canvasAvailable) {
  SIZES.forEach(size => {
    const canvas = createCanvas(size, size);
    const ctx    = canvas.getContext("2d");

    // Background rounded rect
    const r = Math.max(2, size / 8);
    ctx.fillStyle = BG;
    ctx.beginPath();
    ctx.roundRect(0, 0, size, size, r);
    ctx.fill();

    // ₿ symbol
    const fontSize = Math.round(size * 0.62);
    ctx.font        = `bold ${fontSize}px Arial`;
    ctx.fillStyle   = FG;
    ctx.textAlign   = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("₿", size / 2, size / 2);

    const out = path.join(dir, `icon${size}.png`);
    fs.writeFileSync(out, canvas.toBuffer("image/png"));
    console.log(`Saved ${out}`);
  });
} else {
  // Fallback: write SVG files (Chrome supports SVG icons)
  console.log("canvas module not found — writing SVG icons instead (Chrome accepts these).");
  SIZES.forEach(size => {
    const svg = buildSVG(size);
    const out = path.join(dir, `icon${size}.svg`);
    fs.writeFileSync(out, svg);
    console.log(`Saved ${out}`);
  });

  // Patch manifest to use SVG paths
  const manifestPath = path.join(dir, "..", "manifest.json");
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  ["16", "48", "128"].forEach(s => {
    manifest.action.default_icon[s] = `icons/icon${s}.svg`;
    manifest.icons[s]               = `icons/icon${s}.svg`;
  });
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
  console.log("manifest.json updated to reference SVG icons.");
}
