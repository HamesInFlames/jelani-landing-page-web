/**
 * Locate continuous shots in a source video.
 *
 * A scrub sequence must live inside ONE unbroken shot — a cut mid-scrub reads
 * as a glitch, not as film. This lists shot boundaries (ffmpeg scene score)
 * and reports the longest runs so the segment choice is evidence-based.
 *
 * Usage: node scripts/media/find-shots.mjs <sourceKey> [threshold] [minLen]
 */

import { SOURCES, FFMPEG, probe } from './lib.mjs'
import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const [key, thresholdArg, minLenArg] = process.argv.slice(2)
const threshold = Number(thresholdArg ?? 0.3)
const minLen = Number(minLenArg ?? 3.5)
const source = SOURCES[key]
if (!source) throw new Error(`unknown source key: ${key}`)

const meta = await probe(source)

// showinfo prints one line per frame that passes the scene filter; those
// timestamps are the cuts.
const { stderr } = await execFileAsync(
  FFMPEG,
  [
    '-hide_banner',
    '-i', source,
    '-filter:v', `select='gt(scene,${threshold})',showinfo`,
    '-f', 'null', '-',
  ],
  { maxBuffer: 1024 * 1024 * 256 },
)

const cuts = [...stderr.matchAll(/pts_time:([0-9.]+)/g)].map((m) => Number(m[1]))
const bounds = [0, ...cuts, meta.duration]

const shots = []
for (let i = 0; i < bounds.length - 1; i += 1) {
  const start = bounds[i]
  const end = bounds[i + 1]
  const length = end - start
  if (length >= minLen) shots.push({ start, end, length })
}

shots.sort((a, b) => b.length - a.length)

console.log(`${key}: ${meta.duration.toFixed(1)}s, ${cuts.length} cuts detected (threshold ${threshold})`)
console.log(`shots >= ${minLen}s, longest first:\n`)
for (const shot of shots.slice(0, 20)) {
  console.log(`  ${shot.start.toFixed(2).padStart(7)}s → ${shot.end.toFixed(2).padStart(7)}s  (${shot.length.toFixed(2)}s)`)
}
