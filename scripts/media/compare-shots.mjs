/**
 * Sheet where each ROW is one candidate shot sampled across its length, so
 * candidates can be compared for motion, exposure, and colour in one look.
 *
 * Usage: node scripts/media/compare-shots.mjs <sourceKey> <out> <start-end> [<start-end> ...]
 */

import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import os from 'node:os'

import sharp from 'sharp'

import { SOURCES, ffmpeg, freshDir } from './lib.mjs'

const [key, outArg, ...ranges] = process.argv.slice(2)
const source = SOURCES[key]
if (!source) throw new Error(`unknown source key: ${key}`)

const COLS = 6
const CELL_W = 320
const CELL_H = 180

const tmp = await freshDir(path.join(os.tmpdir(), `compare-${key}`))
const composites = []

for (const [row, range] of ranges.entries()) {
  const [start, end] = range.split('-').map(Number)
  for (let col = 0; col < COLS; col += 1) {
    const t = start + ((end - start) * col) / (COLS - 1)
    const file = path.join(tmp, `${row}-${col}.png`)
    await ffmpeg([
      '-ss', t.toFixed(3),
      '-i', source,
      '-frames:v', '1',
      '-vf', `scale=${CELL_W}:${CELL_H}`,
      '-y', file,
    ])
    composites.push({ input: file, left: col * CELL_W, top: row * CELL_H })
  }
  console.log(`row ${row}: ${range}`)
}

const out = path.resolve(outArg)
await mkdir(path.dirname(out), { recursive: true })
await sharp({
  create: {
    width: COLS * CELL_W,
    height: ranges.length * CELL_H,
    channels: 3,
    background: { r: 10, g: 10, b: 11 },
  },
})
  .composite(composites)
  .jpeg({ quality: 85 })
  .toFile(out)

console.log(`sheet: ${out}`)
