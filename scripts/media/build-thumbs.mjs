/**
 * Card artwork for the YouTube-backed work items.
 *
 * Thumbnails are downloaded once at build time and committed as WebP. They
 * are never hotlinked from i.ytimg.com: the page's defining property is that
 * it makes zero third-party requests until a visitor actually clicks a card
 * (there is a test enforcing it), and a hotlinked thumbnail would quietly
 * break that and add a tracking vector on every page view.
 *
 * Two source endpoints, because YouTube treats Shorts differently:
 *   - landscape videos → maxresdefault.jpg, a true 1280x720 frame.
 *   - Shorts → oar2.jpg, the real vertical frame at full resolution.
 *     maxresdefault exists for Shorts but is 16:9 pillarboxed, with the
 *     actual content squeezed into the middle ~400px between blurred
 *     filler; cropping that back out throws away most of the resolution.
 *     (oardefault.jpg looks like the same thing but 404s on some IDs —
 *     oar2 answered for every Short here.)
 */

import { mkdir, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import { PUBLIC, fmtBytes } from './lib.mjs'

/** id → shape. Titles are the verified YouTube titles, for the log only. */
const VIDEOS = [
  { id: 'CavSj2reqa4', shape: 'wide', title: "Duane Notice's Battle Back From Injury (Sportsnet)" },
  { id: 'MhNHciOVE1w', shape: 'wide', title: 'August Week 3 - 2021 (Camp Dreamwood)' },
  { id: '0BmqVLkam-g', shape: 'wide', title: 'Cinematography Reel' },
  { id: '42abljCvlbc', shape: 'wide', title: 'Editors Reel 2020' },
  { id: 'rTFInFnpJa8', shape: 'wide', title: 'Editors Reel — Part 2' },
  { id: 'IRGQXQKWEek', shape: 'short', title: 'cinematic short' },
  { id: 'LTD6Zqn1vq0', shape: 'short', title: 'promise' },
  { id: 'VdbsVKasgBI', shape: 'short', title: 'Star Villas Costa Rica' },
  { id: 'agP4vz_HjYw', shape: 'short', title: 'Luxury Villa UGC' },
]

const OUT = path.join(PUBLIC, 'media')
await mkdir(OUT, { recursive: true })

async function fetchThumb(url) {
  const res = await fetch(url)
  if (!res.ok) return null
  const buf = Buffer.from(await res.arrayBuffer())
  // YouTube answers 200 with a tiny placeholder for some missing sizes.
  return buf.byteLength > 2048 ? buf : null
}

let total = 0

for (const video of VIDEOS) {
  const wide = video.shape === 'wide'

  // Shorts prefer the true-vertical frame; fall back to centre-cropping the
  // pillarboxed 16:9 if oar2 is ever missing for a future ID.
  let buf = null
  let source = ''
  if (!wide) {
    buf = await fetchThumb(`https://i.ytimg.com/vi/${video.id}/oar2.jpg`)
    source = 'oar2'
  }
  if (!buf) {
    buf = await fetchThumb(`https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`)
    source = wide ? 'maxres' : 'maxres+crop'
    if (!buf) {
      console.error(`  ! ${video.id} — no thumbnail available, card keeps its plate`)
      continue
    }
  }

  let pipeline = sharp(buf)

  if (!wide && source === 'maxres+crop') {
    // Recover the vertical content from a pillarboxed frame.
    const meta = await pipeline.metadata()
    const cropW = Math.round((meta.height ?? 720) * (9 / 16))
    pipeline = sharp(buf).extract({
      left: Math.round(((meta.width ?? 1280) - cropW) / 2),
      top: 0,
      width: cropW,
      height: meta.height ?? 720,
    })
  }

  // Shorts cards render ~300 CSS px wide, so 600w covers 2x; the 1080-wide
  // oar2 source at 720w produced a 271 KB file for one noisy clip, which is
  // card-poster money spent on resolution no layout ever shows.
  const dest = path.join(OUT, `yt-${video.id}.webp`)
  await pipeline
    .resize(wide ? 1280 : 600, wide ? 720 : 1067, {
      fit: 'cover',
      withoutEnlargement: true,
    })
    .webp({ quality: wide ? 80 : 76 })
    .toFile(dest)

  const { size } = await stat(dest)
  total += size
  console.log(`  ${`yt-${video.id}.webp`.padEnd(24)} ${fmtBytes(size).padStart(8)}  ${source.padEnd(11)} ${video.title}`)
}

console.log(`\ntotal card artwork: ${fmtBytes(total)}`)
