/**
 * The hero loop: a muted, silent, continuously-playing background clip.
 *
 * Phase 7 replaced the scroll-scrubbed canvas hero with this — the footage
 * now plays on its own while scroll drives the information panels over it
 * (see HANDOFF-PHASE7.md §1). A 105-frame WebP sequence is no longer needed;
 * one small mp4 does the job at a fraction of the bytes.
 *
 * Window: 55s–69s of the Soluna recap. That stretch is already a finished
 * edit — DJ, arch, colour sweep, crowd — so its internal cuts are the
 * editor's own and read as intended. A loop does not need one unbroken take
 * the way a scrub did.
 */

import path from 'node:path'
import { mkdir, stat } from 'node:fs/promises'
import os from 'node:os'

import sharp from 'sharp'

import { PUBLIC, SOURCES, ffmpeg, fmtBytes, freshDir } from './lib.mjs'

const START = 55
const DURATION = 14

const out = path.join(PUBLIC, 'media')
await mkdir(out, { recursive: true })
const tmp = await freshDir(path.join(os.tmpdir(), 'jw-reel'))

const mp4 = path.join(out, 'reel.mp4')

console.log(`encoding ${DURATION}s from ${START}s …`)
await ffmpeg([
  '-ss', String(START),
  '-i', SOURCES.soluna,
  '-t', String(DURATION),
  // -an: the hero is muted by policy, so shipping an audio track would be
  // bytes nobody can ever hear.
  '-an',
  '-vf', 'scale=1280:-2',
  '-c:v', 'libx264',
  '-preset', 'slow',
  '-crf', '30',
  '-pix_fmt', 'yuv420p',
  '-movflags', '+faststart',
  '-y', mp4,
])

// Poster: first frame of the loop, so the still and the video's opening
// frame are the same image and the swap is invisible.
const frame = path.join(tmp, 'poster.png')
await ffmpeg(['-ss', String(START), '-i', SOURCES.soluna, '-frames:v', '1', '-y', frame])
await sharp(frame)
  .resize(1280, 720, { fit: 'cover' })
  .webp({ quality: 74 })
  .toFile(path.join(out, 'reel-poster.webp'))

const { size } = await stat(mp4)
console.log(`\nreel.mp4          ${fmtBytes(size)}  (budget 4 MB)`)
console.log(`reel-poster.webp  ${fmtBytes((await stat(path.join(out, 'reel-poster.webp'))).size)}`)
if (size > 4 * 1024 * 1024) {
  console.error('! over the 4 MB hero budget — raise CRF or shorten the window')
  process.exit(1)
}
