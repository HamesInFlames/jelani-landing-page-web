/**
 * Curated stills for the photography wall, the campaign cards, and the
 * behind-the-scenes strip.
 *
 * Curation principle: these two shoots are brand activations, and the site
 * sells event coverage — so the selects favour frames that read as coverage
 * (product in hand, content being captured, the energy of the room) over
 * posed fitness portraiture, which would pull the page toward the personal
 * fitness content the brief keeps off this site. Sources alternate between
 * the two shoots so the wall does not read as one long set.
 */

import path from 'node:path'
import { mkdir, readdir, stat } from 'node:fs/promises'

import sharp from 'sharp'

import { PUBLIC, SOURCES, fmtBytes } from './lib.mjs'

/** Photography wall — 4:5 portrait tiles. */
const GALLERY = [
  { file: 'Socliq x Canergy-55.jpg', set: 'canergy', out: 'photo-01.webp' },
  { file: 'Socliq x Reset Studio-121.jpg', set: 'resetStudio', out: 'photo-02.webp' },
  { file: 'Socliq x Canergy-117.jpg', set: 'canergy', out: 'photo-03.webp' },
  { file: 'Socliq x Reset Studio-12.jpg', set: 'resetStudio', out: 'photo-04.webp' },
  { file: 'Socliq x Canergy-20.jpg', set: 'canergy', out: 'photo-05.webp' },
  { file: 'Socliq x Reset Studio-171.jpg', set: 'resetStudio', out: 'photo-06.webp' },
  { file: 'Socliq x Canergy-37.jpg', set: 'canergy', out: 'photo-07.webp' },
  { file: 'Socliq x Reset Studio-61.jpg', set: 'resetStudio', out: 'photo-08.webp' },
  { file: 'Socliq x Canergy-126.jpg', set: 'canergy', out: 'photo-09.webp' },
  { file: 'Socliq x Reset Studio-210.jpg', set: 'resetStudio', out: 'photo-10.webp' },
]

/** Campaign cards — kept out of the wall so nothing appears twice. */
const CAMPAIGNS = [
  { file: 'Socliq x Canergy-2.jpg', set: 'canergy', out: 'campaign-canergy.webp' },
  { file: 'Socliq x Reset Studio-151.jpg', set: 'resetStudio', out: 'campaign-reset.webp' },
]

const photosDir = path.join(PUBLIC, 'media', 'photos')
await mkdir(photosDir, { recursive: true })

async function emit(entry, width, height, quality, dir) {
  const src = path.join(SOURCES[entry.set], entry.file)
  const dest = path.join(dir, entry.out)
  await sharp(src).resize(width, height, { fit: 'cover' }).webp({ quality }).toFile(dest)
  const { size } = await stat(dest)
  console.log(`  ${entry.out.padEnd(24)} ${fmtBytes(size).padStart(8)}  ← ${entry.file}`)
  return size
}

console.log('photography wall (4:5, 900w):')
let total = 0
for (const entry of GALLERY) total += await emit(entry, 900, 1125, 78, photosDir)

console.log('\ncampaign cards (4:5, 1000w):')
for (const entry of CAMPAIGNS) total += await emit(entry, 1000, 1250, 80, photosDir)

// Behind-the-scenes strip: phone shots, treated small and honest.
console.log('\nbehind the scenes (4:3, 640w):')
const btsFiles = (await readdir(SOURCES.bts)).filter((f) => /\.jpe?g$/i.test(f)).sort()
for (const [i, file] of btsFiles.slice(0, 4).entries()) {
  const out = `bts-0${i + 1}.webp`
  await sharp(path.join(SOURCES.bts, file))
    .resize(640, 480, { fit: 'cover' })
    .webp({ quality: 72 })
    .toFile(path.join(photosDir, out))
  const { size } = await stat(path.join(photosDir, out))
  total += size
  console.log(`  ${out.padEnd(24)} ${fmtBytes(size).padStart(8)}  ← ${file}`)
}

/**
 * Beauty & editorial set — the four originals from Jelani's carrd site,
 * staged in "Beauty Set\" (01–04 prefix = display order, alternating
 * monochrome and colour so the strip reads as composed).
 *
 * Sources are chat-resolution copies (503x630), so the target is 500w with
 * withoutEnlargement — upscaling to the wall's 900w would add bytes and
 * softness and buy nothing. At four across the tiles render ~297 CSS px,
 * so 503 covers 1x and sits slightly under 2x: known, accepted cost.
 * Full-size Lightroom exports dropped into the same folder upgrade this
 * with a re-run, no code change. Two frames are B&W by the photographer's
 * choice — never "unify" the set.
 */
const BEAUTY = [
  { file: '01-editorial-chair.jpg', out: 'beauty-01.webp' },
  { file: '02-golden-hour.jpg', out: 'beauty-02.webp' },
  { file: '03-beauty-studio.jpg', out: 'beauty-03.webp' },
  { file: '04-duo-portrait.jpg', out: 'beauty-04.webp' },
]

console.log('\nbeauty & editorial (4:5, ≤500w, no enlargement):')
for (const entry of BEAUTY) {
  const dest = path.join(photosDir, entry.out)
  await sharp(path.join(SOURCES.beautySet, entry.file))
    .resize(500, 625, { fit: 'cover', withoutEnlargement: true })
    .webp({ quality: 82 })
    .toFile(dest)
  const { size } = await stat(dest)
  total += size
  console.log(`  ${entry.out.padEnd(24)} ${fmtBytes(size).padStart(8)}  ← ${entry.file}`)
}

console.log(`\ntotal stills: ${fmtBytes(total)}`)
