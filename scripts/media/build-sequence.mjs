/**
 * Build the hero scroll-scrub frame sets.
 *
 * Source: Soluna event recap, 62.95s → 66.45s — a single unbroken shot
 * (verified with find-shots.mjs) where the lit arch holds composition while
 * the crowd moves and the lighting sweeps purple → green → pink. Chosen over
 * the Bioderma recap, which is talking-head vlog footage: bright, white-walled,
 * and lip-synced, so it neither scrubs nor sits under white type.
 *
 * Two sets ship. Desktop is 16:9 at 1600w. Mobile is a 3:4 centre crop at
 * half the frame rate — a 16:9 frame cover-fitted to a tall phone viewport
 * crops to its middle third and upscales ~4x, so shipping the landscape set
 * to phones would be both blurry and wasteful.
 */

import { readdir, mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

import sharp from 'sharp'

import { PUBLIC, SOURCES, ffmpeg, fmtBytes, freshDir } from './lib.mjs'

const START = 62.95
const DURATION = 3.5
const FPS = 30

const DESKTOP = { dir: path.join(PUBLIC, 'sequence'), width: 1600, height: 900, quality: 76 }
// 720x960 rather than something smaller: phones run at DPR 3, so a 480w frame
// upscales visibly. The half-rate set has budget headroom to spend on this.
const MOBILE = { dir: path.join(PUBLIC, 'sequence-sm'), width: 720, height: 960, quality: 70, step: 2 }

const tmp = await freshDir(path.join(os.tmpdir(), 'jw-sequence-src'))

console.log(`extracting ${DURATION}s @ ${FPS}fps from ${START}s …`)
await ffmpeg([
  '-ss', String(START),
  '-i', SOURCES.soluna,
  '-t', String(DURATION),
  '-vf', `fps=${FPS}`,
  '-y', path.join(tmp, '%04d.png'),
])

const frames = (await readdir(tmp)).filter((f) => f.endsWith('.png')).sort()
console.log(`extracted ${frames.length} frames`)

await freshDir(DESKTOP.dir)
await freshDir(MOBILE.dir)
await mkdir(path.join(PUBLIC, 'media'), { recursive: true })

// Centre 3:4 crop out of 1920x1080 for the phone set.
const CROP = { width: 810, height: 1080, left: Math.round((1920 - 810) / 2), top: 0 }

let desktopCount = 0
let mobileCount = 0

for (const [i, file] of frames.entries()) {
  const src = path.join(tmp, file)
  desktopCount += 1
  await sharp(src)
    .resize(DESKTOP.width, DESKTOP.height, { fit: 'cover' })
    .webp({ quality: DESKTOP.quality, effort: 6 })
    .toFile(path.join(DESKTOP.dir, `${String(desktopCount).padStart(4, '0')}.webp`))

  if (i % MOBILE.step === 0) {
    mobileCount += 1
    await sharp(src)
      .extract(CROP)
      .resize(MOBILE.width, MOBILE.height, { fit: 'cover' })
      .webp({ quality: MOBILE.quality, effort: 6 })
      .toFile(path.join(MOBILE.dir, `${String(mobileCount).padStart(4, '0')}.webp`))
  }
}

// Poster: frame 1, painted behind the canvas so the hero has an image before
// React hydrates and the canvas can draw.
await sharp(path.join(tmp, frames[0]))
  .resize(DESKTOP.width, DESKTOP.height, { fit: 'cover' })
  .webp({ quality: 74 })
  .toFile(path.join(PUBLIC, 'media', 'hero-poster.webp'))

await sharp(path.join(tmp, frames[0]))
  .extract(CROP)
  .resize(MOBILE.width, MOBILE.height, { fit: 'cover' })
  .webp({ quality: 70 })
  .toFile(path.join(PUBLIC, 'media', 'hero-poster-sm.webp'))

async function dirSize(dir) {
  const files = await readdir(dir)
  let total = 0
  for (const f of files) total += (await stat(path.join(dir, f))).size
  return total
}

const desktopSize = await dirSize(DESKTOP.dir)
const mobileSize = await dirSize(MOBILE.dir)

console.log(`\ndesktop: ${desktopCount} frames  ${fmtBytes(desktopSize)}  (${DESKTOP.width}x${DESKTOP.height})`)
console.log(`mobile:  ${mobileCount} frames  ${fmtBytes(mobileSize)}  (${MOBILE.width}x${MOBILE.height})`)
console.log(`\nset site.hero.sequence.frameCount = ${desktopCount}, frameCountSm = ${mobileCount}`)
