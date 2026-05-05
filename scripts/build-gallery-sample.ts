import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildIntegrityGalleryDeck } from '../lib/buildIntegrityGalleryDeck';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'output');
await mkdir(outDir, { recursive: true });
const dest = join(outDir, 'integrity-gallery-dark-morph.pptx');
const buf = await buildIntegrityGalleryDeck();
await writeFile(dest, Buffer.from(buf));
console.log('Wrote', dest);
