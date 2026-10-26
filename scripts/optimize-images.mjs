import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.resolve('.');
const originals = path.join(root, 'source-assets', 'original-public', 'figma');
const commons = path.join(root, 'source-assets', 'commons');
const output = path.join(root, 'public', 'assets', 'media');

const images = [
  ['7781ac002a7a08196d261a1af890e8125e5b7ee5.png', 'hero-1600.webp', 1600, 96],
  ['7781ac002a7a08196d261a1af890e8125e5b7ee5.png', 'hero-2200.webp', 2200, 96],
  ['7781ac002a7a08196d261a1af890e8125e5b7ee5.png', 'hero-3400.webp', 3400, 96],
  ['9de241788db866975d5bd64c86c05cac0c41569a.png', 'cloud-near.webp', null, 'lossless'],
  ['1acbc2249ba6d265824ad293e458ed30b7f6ab9b.png', 'cloud-far.webp', null, 'lossless'],
  ['c3e5fbd83603ab22672868ee8f450d6d354400d7.png', 'monastery-cutout.webp', 2400, 'lossless'],
  ['fc43fb6618603df46294c7d28b306f39a63cf141.png', 'brand.webp', null, 'lossless'],
  ['fdcf0c990a7636b924ad08b27b5e121e72b743cf.jpg', 'buddha-card.webp', 700, 96],
  ['96abc508c45624716c3338a99ef0b852b60622d3.png', 'punakha-card.webp', null, 'lossless'],
  ['393b168fe6515405c0834a496aad91965c41b673.png', 'culture-card.webp', null, 'lossless'],
  ['adeb0ee48780a1e5baa6b4107ff288094ad21c06.png', 'children-card.webp', null, 'lossless'],
  ['a881d9def188d6db41ee1b9b8adc3450c5351241.png', 'festival-card.webp', null, 'lossless'],
  ['30559dc5d5871cd3c89ab573fe67f6d843cfadee.png', 'pilgrimage-card.webp', null, 'lossless'],
  ['2c0368f44d253b75de66768945e6eec55abb1af7.jpg', 'corridor.webp', 1200, 96],
  ['2a38862ab867298c933aee20a2efb64626270155.jpg', 'courtyard.webp', 1200, 96],
  ['7d9ebb98e2b1999801ad595c4c078610e0dbe26b.png', 'monk-cutout.webp', 1200, 'lossless'],
  ['1ffc6871127be29945cb2ec6e01318b9b101a37b.png', 'dancer-cutout.webp', null, 'lossless'],
  ['6758e38dea4663597c5a2e2a10d2b334db88e332.jpg', 'bridge.webp', 1100, 96],
  ['4156c54376410563bf7463cda7072c3196ab8330.png', 'prayer-flags.webp', null, 'lossless'],
];

await fs.mkdir(output, { recursive: true });
const report = [];

async function save(source, name, width, quality, extract) {
  let image = sharp(source).rotate();
  if (extract) image = image.extract(extract);
  if (width) image = image.resize({ width, withoutEnlargement: true, kernel: 'lanczos3' });
  const destination = path.join(output, name);
  await image.webp(quality === 'lossless'
    ? { lossless: true, effort: 6 }
    : { quality, alphaQuality: 100, effort: 6 }).toFile(destination);
  const metadata = await sharp(destination).metadata();
  report.push({ name, width: metadata.width, height: metadata.height, bytes: (await fs.stat(destination)).size });
}

for (const [source, name, width, quality] of images) {
  await save(path.join(originals, source), name, width, quality);
}

const dzong = path.join(commons, 'punakha-dzong.jpg');
await save(dzong, 'punakha-dzong-900.webp', 900, 95);
await save(dzong, 'punakha-dzong-1800.webp', 1800, 95);

const people = path.join(commons, 'bhutanese-mother-and-daughter.jpg');
const peopleCrop = { left: 650, top: 0, width: 3264, height: 3264 };
await save(people, 'bhutanese-people-600.webp', 600, 95, peopleCrop);
await save(people, 'bhutanese-people-1200.webp', 1200, 95, peopleCrop);

await fs.copyFile(path.join(commons, 'flag-of-bhutan.svg'), path.join(output, 'flag-of-bhutan.svg'));
report.push({ name: 'flag-of-bhutan.svg', bytes: (await fs.stat(path.join(output, 'flag-of-bhutan.svg'))).size });

console.log(JSON.stringify({ images: report, totalMB: +(report.reduce((sum, item) => sum + item.bytes, 0) / 1048576).toFixed(2) }, null, 2));
