// One-time generator for Expo app icon/splash assets, adapted from the
// source web app's scripts/generate-icons.mjs — same source artwork (a
// green tile with two overlapping "flashcards"), rasterized to what
// Expo's app.json expects instead of the PWA manifest's icon set.
// Re-run manually if the design changes; output is committed.

import sharp from 'sharp';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(__dirname, '..', 'assets');
mkdirSync(outDir, { recursive: true });

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
  <rect width="512" height="512" fill="#58CC02" />
  <g transform="translate(256,256) scale(0.72) translate(-256,-256)">
    <rect x="146" y="176" width="260" height="180" rx="28" transform="rotate(-8 256 256)" fill="#1CB0F6" />
    <rect x="106" y="166" width="280" height="190" rx="28" transform="rotate(5 256 256)" fill="#ffffff" />
    <text x="256" y="290" transform="rotate(5 256 256)" text-anchor="middle"
      font-family="Arial, Helvetica, sans-serif" font-weight="800" font-size="128" fill="#3C3C3C">NL</text>
  </g>
</svg>
`.trim();

// icon.png: Expo derives every iOS/home-screen/Expo Go size from this single
// 1024x1024 source. splash-icon.png reuses the same full-bleed art; the
// expo-splash-screen plugin centers it on a solid backgroundColor (see
// app.json) via resizeMode "contain".
const targets = [
  { file: 'icon.png', size: 1024 },
  { file: 'splash-icon.png', size: 1024 },
];

for (const { file, size } of targets) {
  await sharp(Buffer.from(svg), { density: 384 })
    .resize(size, size)
    .png()
    .toFile(path.join(outDir, file));
  console.log(`wrote ${file} (${size}x${size})`);
}

writeFileSync(path.join(outDir, 'source.svg'), svg + '\n');
console.log('wrote source.svg (master artwork, for reference/future edits)');
