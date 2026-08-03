/**
 * Build a contact sheet from a source video so a human (or the builder) can
 * actually look at the footage before choosing the scrub segment.
 *
 * Usage: node scripts/media/contact-sheet.mjs <sourceKey> <startSec> <endSec> <cols> <rows> <out>
 * Frames are sampled evenly across [start, end]; cell index maps to time so a
 * picked cell converts straight back to a timestamp.
 */

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

import sharp from 'sharp'

import { SOURCES, ffmpeg, freshDir } from './lib.mjs'

const [key, startArg, endArg, colsArg, rowsArg, outArg] = process.argv.slice(2)
const start = Number(startArg)
const end = Number(endArg)
const cols = Number(colsArg ?? 6)
const rows = Number(rowsArg ?? 6)
const count = cols * rows
const source = SOURCES[key]
if (!source) throw new Error(`unknown source key: ${key}`)

const CELL_W = 320
const CELL_H = 180

const tmp = await freshDir(path.join(os.tmpdir(), `sheet-${key}`))
const times = Array.from({ length: count }, (_, i) => start + ((end - start) * i) / (count - 1))

// -ss before -i seeks by keyframe, which is fast even on a 630 MB HEVC file.
for (const [i, t] of times.entries()) {
  await ffmpeg([
    '-ss', t.toFixed(3),
    '-i', source,
    '-frames:v', '1',
    '-vf', `scale=${CELL_W}:${CELL_H}`,
    '-y', path.join(tmp, `${String(i).padStart(3, '0')}.png`),
  ])
}

const composites = times.map((_, i) => ({
  input: path.join(tmp, `${String(i).padStart(3, '0')}.png`),
  left: (i % cols) * CELL_W,
  top: Math.floor(i / cols) * CELL_H,
}))

const out = path.resolve(outArg)
await mkdir(path.dirname(out), { recursive: true })
await sharp({
  create: {
    width: cols * CELL_W,
    height: rows * CELL_H,
    channels: 3,
    background: { r: 10, g: 10, b: 11 },
  },
})
  .composite(composites)
  .jpeg({ quality: 82 })
  .toFile(out)

console.log(`sheet: ${out} (${cols}x${rows}, ${start}s → ${end}s)`)
console.log(
  times.map((t, i) => `${i}:${t.toFixed(1)}s`).join('  '),
)
