#!/usr/bin/env node
/**
 * Build script: scans assets/ subfolders and generates assets/galleries.json.
 * Run after adding/removing images or new folders:  node scripts/build-galleries.js
 * This keeps the Work gallery and homepage slideshow in sync with your files.
 */

const fs = require('fs');
const path = require('path');

const ASSETS_DIR = path.join(__dirname, '..', 'assets');
const OUT_FILE = path.join(ASSETS_DIR, 'galleries.json');

const IMG_EXT = new Set(['.jpg', '.jpeg', '.png', '.gif', '.webp', '.JPG', '.JPEG', '.PNG', '.GIF', '.WEBP']);

// Optional: display title for a folder (folder name as on disk → nice title). New folders not listed will use folder name trimmed.
const TITLE_MAP = {
  'ACP WORKS': 'ACP & Fabrication',
  'Auto branding ': 'Auto Branding',
  'Bus branding ': 'Bus Branding',
  'Events ': 'Events',
  'Glow Sign Boards ': 'Glow Sign Boards',
  'Non Lite Boards ': 'Non Lite Boards',
  'Promotions': 'Promotions',
  'Standee ': 'Standees',
  'barriguard': 'Barriguard',
  'inshop branding ': 'In-Shop Branding',
  'roadshow ': 'Roadshow',
  'sunpack printing ': 'Sunpack Printing',
  'wall painting ': 'Wall Painting',
};

function titleFromFolderName(name) {
  const trimmed = name.trim();
  return TITLE_MAP[name] !== undefined ? TITLE_MAP[name] : trimmed.replace(/\s+/g, ' ');
}

function keyFromFolderName(name) {
  return name.trim().toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function scanAssets() {
  if (!fs.existsSync(ASSETS_DIR)) {
    console.error('assets/ folder not found.');
    process.exit(1);
  }
  const entries = fs.readdirSync(ASSETS_DIR, { withFileTypes: true });
  const galleries = [];
  for (const e of entries) {
    if (!e.isDirectory()) continue;
    const dirPath = path.join(ASSETS_DIR, e.name);
    const files = fs.readdirSync(dirPath);
    const images = files
      .filter((f) => IMG_EXT.has(path.extname(f)))
      .sort();
    if (images.length === 0) continue;
    const folderPath = 'assets/' + e.name; // preserve spaces and casing
    galleries.push({
      key: keyFromFolderName(e.name),
      folder: folderPath,
      title: titleFromFolderName(e.name),
      images,
    });
  }
  galleries.sort((a, b) => a.title.localeCompare(b.title));
  return galleries;
}

const galleries = scanAssets();
fs.writeFileSync(OUT_FILE, JSON.stringify({ galleries }, null, 2), 'utf8');
console.log('Wrote', OUT_FILE, '—', galleries.length, 'categories,', galleries.reduce((s, g) => s + g.images.length, 0), 'images.');
