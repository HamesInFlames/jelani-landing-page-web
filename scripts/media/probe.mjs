/** Inspect the source footage: specs plus a motion profile for segment choice. */

import { readdir, stat } from 'node:fs/promises'

import { SOURCES, fmtBytes, probe } from './lib.mjs'

const videos = ['bioderma', 'soluna', 'runClub']

for (const key of videos) {
  const file = SOURCES[key]
  try {
    const [meta, info] = await Promise.all([probe(file), stat(file)])
    console.log(
      `${key.padEnd(10)} ${meta.codec} ${meta.width}x${meta.height} ` +
        `${meta.fps.toFixed(2)}fps ${meta.duration.toFixed(1)}s ${fmtBytes(info.size)}`,
    )
  } catch (error) {
    console.log(`${key.padEnd(10)} FAILED — ${error.message.split('\n')[0]}`)
  }
}

for (const key of ['resetStudio', 'canergy', 'bts']) {
  try {
    const files = (await readdir(SOURCES[key])).filter((f) => /\.jpe?g$/i.test(f))
    console.log(`${key.padEnd(10)} ${files.length} JPGs — first: ${files[0]}`)
  } catch (error) {
    console.log(`${key.padEnd(10)} FAILED — ${error.message.split('\n')[0]}`)
  }
}
