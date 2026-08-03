/**
 * Poster frames for the work cards.
 *
 * Timestamps were chosen by reviewing contact sheets (contact-sheet.mjs), not
 * guessed: each is a well-exposed, in-focus frame that reads at card size and
 * identifies the job.
 *
 * The run-club footage is deliberately absent. It is raw unedited material —
 * motion-blurred and loosely framed — and it carries Glorious Athletica
 * branding, whose public naming is still unresolved. A weak frame beside the
 * Sportsnet card would cost the section more than the extra card adds.
 */

import path from 'node:path'
import { mkdir } from 'node:fs/promises'
import os from 'node:os'

import sharp from 'sharp'

import { PUBLIC, SOURCES, ffmpeg, freshDir } from './lib.mjs'

const POSTERS = [
  {
    name: 'soluna-poster.webp',
    source: SOURCES.soluna,
    time: 25.4,
    note: 'stage performer under warm light — reads instantly as a live event',
  },
  {
    name: 'bioderma-poster.webp',
    source: SOURCES.bioderma,
    time: 113.4,
    note: 'host on mic in front of the Bioderma neon — the brand is legible',
  },
]

const tmp = await freshDir(path.join(os.tmpdir(), 'jw-posters'))
const outDir = path.join(PUBLIC, 'media')
await mkdir(outDir, { recursive: true })

for (const poster of POSTERS) {
  const raw = path.join(tmp, `${poster.name}.png`)
  await ffmpeg(['-ss', String(poster.time), '-i', poster.source, '-frames:v', '1', '-y', raw])
  await sharp(raw)
    .resize(1280, 720, { fit: 'cover' })
    .webp({ quality: 80 })
    .toFile(path.join(outDir, poster.name))
  console.log(`${poster.name}  @${poster.time}s — ${poster.note}`)
}
