// ════════════════════════════════════════════════════════════════════
// SanArte — Generador de assets PWA desde el logo source.
//
// Lee assets/branding/logo-source.png y genera:
//   · favicons (ico + 16/32 png)
//   · apple-touch-icons (152/167/180)
//   · pwa icons (192/512 normal y maskable con safe area)
//   · og-image (1200x630)
//   · splash screens iOS (5 tamaños principales)
//
// Ejecutar con:  node scripts/generate-pwa-assets.mjs
// Requiere: sharp + png-to-ico (en devDependencies)
// ════════════════════════════════════════════════════════════════════

import sharp from 'sharp';
import pngToIco from 'png-to-ico';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'assets/branding/logo-source.png');
const PUBLIC = path.join(ROOT, 'public');
const SPLASH_DIR = path.join(PUBLIC, 'splash');
const NAVY = '#060D1B';

if (!fs.existsSync(SRC)) {
  console.error('Falta:', SRC);
  process.exit(1);
}
if (!fs.existsSync(SPLASH_DIR)) fs.mkdirSync(SPLASH_DIR, { recursive: true });

const log = (msg) => console.log('  ✓', msg);

// Renderiza el logo en un cuadrado N×N con fondo navy.
async function squareIcon(size, padding = 0) {
  const inner = size - padding * 2;
  const fitted = await sharp(SRC)
    .resize(inner, inner, { fit: 'contain', background: NAVY })
    .toBuffer();

  return sharp({
    create: { width: size, height: size, channels: 4, background: NAVY },
  })
    .composite([{ input: fitted, top: padding, left: padding }])
    .png()
    .toBuffer();
}

// Splash screen: pantalla WxH navy con el logo centrado al ~40% del ancho.
async function splash(width, height) {
  const logoW = Math.round(width * 0.40);
  const fitted = await sharp(SRC)
    .resize(logoW, logoW, { fit: 'contain', background: NAVY })
    .toBuffer();
  const top = Math.round((height - logoW) / 2);
  const left = Math.round((width - logoW) / 2);

  return sharp({
    create: { width, height, channels: 4, background: NAVY },
  })
    .composite([{ input: fitted, top, left }])
    .png()
    .toBuffer();
}

// OG image 1200x630 navy con logo centrado al ~75% del alto.
async function ogImage() {
  const W = 1200, H = 630;
  const logoH = Math.round(H * 0.75);
  const fitted = await sharp(SRC)
    .resize(logoH, logoH, { fit: 'contain', background: NAVY })
    .toBuffer();
  const top = Math.round((H - logoH) / 2);
  const left = Math.round((W - logoH) / 2);

  return sharp({
    create: { width: W, height: H, channels: 4, background: NAVY },
  })
    .composite([{ input: fitted, top, left }])
    .png()
    .toBuffer();
}

// ─── Generación ──────────────────────────────────────────────────────
console.log('SanArte · Generando assets PWA');
console.log('  source:', path.relative(ROOT, SRC));

const fav16 = await squareIcon(16);
const fav32 = await squareIcon(32);
const fav48 = await squareIcon(48);
await fs.promises.writeFile(path.join(PUBLIC, 'favicon-16x16.png'), fav16);  log('favicon-16x16.png');
await fs.promises.writeFile(path.join(PUBLIC, 'favicon-32x32.png'), fav32);  log('favicon-32x32.png');

const ico = await pngToIco([fav16, fav32, fav48]);
await fs.promises.writeFile(path.join(PUBLIC, 'favicon.ico'), ico);  log('favicon.ico (16/32/48)');

for (const s of [152, 167, 180]) {
  const buf = await squareIcon(s);
  await fs.promises.writeFile(path.join(PUBLIC, `apple-touch-icon-${s}x${s}.png`), buf);
  log(`apple-touch-icon-${s}x${s}.png`);
}
const apple180 = await squareIcon(180);
await fs.promises.writeFile(path.join(PUBLIC, 'apple-touch-icon.png'), apple180);
log('apple-touch-icon.png (180)');

for (const s of [192, 512]) {
  const buf = await squareIcon(s);
  await fs.promises.writeFile(path.join(PUBLIC, `pwa-${s}x${s}.png`), buf);
  log(`pwa-${s}x${s}.png`);
}

for (const s of [192, 512]) {
  const padding = Math.round(s * 0.10);
  const buf = await squareIcon(s, padding);
  await fs.promises.writeFile(path.join(PUBLIC, `pwa-maskable-${s}x${s}.png`), buf);
  log(`pwa-maskable-${s}x${s}.png (10% safe area)`);
}

const og = await ogImage();
await fs.promises.writeFile(path.join(PUBLIC, 'og-image.png'), og);  log('og-image.png (1200x630)');

const splashes = [
  { name: 'iphone-pro-max',  w: 1290, h: 2796 },
  { name: 'iphone-pro',      w: 1179, h: 2556 },
  { name: 'iphone-plus',     w: 1284, h: 2778 },
  { name: 'iphone-standard', w: 1170, h: 2532 },
  { name: 'iphone-mini',     w: 1080, h: 2340 },
];
for (const s of splashes) {
  const buf = await splash(s.w, s.h);
  await fs.promises.writeFile(path.join(SPLASH_DIR, `${s.name}.png`), buf);
  log(`splash/${s.name}.png (${s.w}x${s.h})`);
}

console.log('Listo.');
