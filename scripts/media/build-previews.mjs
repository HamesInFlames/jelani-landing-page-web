/**
 * Silent preview loops for the work cards — the gallery as a wall of quiet
 * motion rather than a wall of stills.
 *
 * Every preview is muted with no audio track at all (`-an`): these autoplay,
 * and a track nobody can hear is pure weight. They are ambience, not the
 * film — clicking a card still loads the real YouTube player.
 *
 * Sources: Soluna and Bioderma from the masters on disk, the reels and
 * shorts from Jelani's own uploads (fetch-originals.mjs). The Sportsnet
 * feature and Camp Dreamwood recap are published on those organisations'
 * channels, so they are absent by design and keep their posters.
 */

import path from 'node:path'
import { mkdir, readdir, stat } from 'node:fs/promises'

import { PUBLIC, REPO, SOURCES, ffmpeg, fmtBytes, probe } from './lib.mjs'

const ORIGINALS = path.join(REPO, 'originals')

/**
 * `at` is the seconds offset to cut from. Values for the masters were
 * picked from contact sheets; for the downloads, a fraction of duration
 * skips titles and end cards without hard-coding a length we do not know.
 */
const PREVIEWS = [
  { item: 'soluna', file: SOURCES.soluna, at: 43.7, shape: 'wide' },
  { item: 'bioderma', file: SOURCES.bioderma, at: 30, shape: 'wide' },
  { item: 'cinematography-reel', fromOriginals: true, atFraction: 0.25, shape: 'wide' },
  { item: 'editors-reel-2020', fromOriginals: true, atFraction: 0.25, shape: 'wide' },
  { item: 'editors-reel-pt2', fromOriginals: true, atFraction: 0.25, shape: 'wide' },
  { item: 'luxury-short', fromOriginals: true, atFraction: 0.2, shape: 'tall' },
  { item: 'cinematic-short', fromOriginals: true, atFraction: 0.2, shape: 'tall' },
  // 'promise' is deliberately absent — see the removal note in site.ts.
  { item: 'star-v', fromOriginals: true, atFraction: 0.2, shape: 'tall' },
]

const DURATION = 4
const OUT = path.join(PUBLIC, 'media', 'previews')
await mkdir(OUT, { recursive: true })

const originals = await readdir(ORIGINALS).catch(() => [])
let total = 0
const built = []
const skipped = []

for (const preview of PREVIEWS) {
  let source = preview.file
  if (preview.fromOriginals) {
    const match = originals.find((f) => f.startsWith(`${preview.item}.`))
    if (!match) {
      skipped.push(`${preview.item} (no download — run fetch-originals.mjs)`)
      continue
    }
    source = path.join(ORIGINALS, match)
  }

  let at = preview.at ?? 0
  if (preview.atFraction !== undefined) {
    const { duration } = await probe(source)
    at = Math.max(0, duration * preview.atFraction)
  }

  const wide = preview.shape === 'wide'
  const dest = path.join(OUT, `${preview.item}.mp4`)

  await ffmpeg([
    '-ss', at.toFixed(2),
    '-i', source,
    '-t', String(DURATION),
    '-an',
    '-vf', wide ? 'scale=640:-2' : 'scale=480:-2',
    '-c:v', 'libx264',
    '-preset', 'slow',
    '-crf', '34',
    '-pix_fmt', 'yuv420p',
    '-movflags', '+faststart',
    '-y', dest,
  ])

  const { size } = await stat(dest)
  total += size
  built.push(preview.item)
  console.log(`  ${`${preview.item}.mp4`.padEnd(26)} ${fmtBytes(size).padStart(8)}  @${at.toFixed(1)}s`)
}

console.log(`\n${built.length} previews, ${fmtBytes(total)} total`)
if (skipped.length) console.log(`skipped: ${skipped.join(', ')}`)
console.log(
  'no preview: sportsnet-duane-notice, camp-dreamwood — published on the\n' +
    "clients' own channels; posters stay until Jelani supplies his exports.",
)
