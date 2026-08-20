// Converts large PNGs in public/ to WebP for faster page loads.
// Run once: node scripts/convert-images.mjs
import sharp from 'sharp';
import { readdir } from 'fs/promises';
import { join, extname, basename } from 'path';

const PUBLIC_DIR = join(process.cwd(), 'public');

const files = await readdir(PUBLIC_DIR);
const pngs = files.filter(f => extname(f).toLowerCase() === '.png');

for (const file of pngs) {
  const input = join(PUBLIC_DIR, file);
  const output = join(PUBLIC_DIR, basename(file, '.png') + '.webp');
  const { size: before } = await import('fs').then(m => m.promises.stat(input));
  await sharp(input)
    .webp({ quality: 85, effort: 4 })
    .toFile(output);
  const { size: after } = await import('fs').then(m => m.promises.stat(output));
  const saving = Math.round((1 - after / before) * 100);
  console.log(`✓ ${file} → ${basename(output)}  (${(before/1024).toFixed(0)}KB → ${(after/1024).toFixed(0)}KB, −${saving}%)`);
}
console.log('\nDone. Update your image src attributes to use .webp');
