/**
 * Contact sheet across a folder of stills, so selects are made by looking at
 * the work rather than by filename. Cell index maps back to the printed file
 * list, which is what the curation step consumes.
 *
 * Usage: node scripts/media/stills-sheet.mjs <sourceKey> <out> [cols] [rows] [offset]
 */

import { readdir, mkdir } from 'node:fs/promises'
import path from 'node:path'

import sharp from 'sharp'

import { SOURCES } from './lib.mjs'

const [key, outArg, colsArg, rowsArg, offsetArg] = process.argv.slice(2)
const cols = Number(colsArg ?? 6)
const rows = Number(rowsArg ?? 4)
const offset = Number(offsetArg ?? 0)
const dir = SOURCES[key]
if (!dir) throw new Error(`unknown source key: ${key}`)

const CELL_W = 240
const CELL_H = 320 // portrait cells: these sets are shot vertical

const all = (await readdir(dir))
  .filter((f) => /\.jpe?g$/i.test(f))
  .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

const count = cols * rows
// Even spread across the whole shoot rather than the first N files.
const picks = Array.from({ length: count }, (_, i) =>
  all[Math.min(all.length - 1, offset + Math.round((i * (all.length - 1 - offset)) / (count - 1)))],
)

const composites = []
for (const [i, file] of picks.entries()) {
  const buf = await sharp(path.join(dir, file))
    .resize(CELL_W, CELL_H, { fit: 'cover' })
    .jpeg({ quality: 80 })
    .toBuffer()
  composites.push({ input: buf, left: (i % cols) * CELL_W, top: Math.floor(i / cols) * CELL_H })
}

const out = path.resolve(outArg)
await mkdir(path.dirname(out), { recursive: true })
await sharp({
  create: { width: cols * CELL_W, height: rows * CELL_H, channels: 3, background: { r: 10, g: 10, b: 11 } },
})
  .composite(composites)
  .jpeg({ quality: 82 })
  .toFile(out)

console.log(`sheet: ${out}  (${all.length} files in set)`)
picks.forEach((f, i) => console.log(`  ${String(i).padStart(2)}  ${f}`))
