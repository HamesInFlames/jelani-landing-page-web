/**
 * Download Jelani's own uploads so preview loops can be cut from them.
 *
 * SCOPE IS DELIBERATE: only videos published on youtube.com/@jelaniwoodstv.
 * The Sportsnet feature and the Camp Dreamwood recap live on those
 * organisations' channels — they are not ours to pull, so those two cards
 * keep still posters. If Jelani supplies his own exports of them, they can
 * join the preview set through build-previews.mjs without touching this.
 *
 * Downloads land in originals/ (git-ignored). Sources are never committed —
 * only the small encoded previews under public/media/previews are.
 */

import { mkdir, readdir, stat } from 'node:fs/promises'
import path from 'node:path'

import ytdlp from 'yt-dlp-exec'

import { REPO, fmtBytes } from './lib.mjs'

/** itemId → YouTube ID. Item ids match src/content/site.ts. */
const OWN_UPLOADS = [
  { item: 'cinematography-reel', id: '0BmqVLkam-g' },
  { item: 'editors-reel-2020', id: '42abljCvlbc' },
  { item: 'editors-reel-pt2', id: 'rTFInFnpJa8' },
  { item: 'luxury-short', id: 'agP4vz_HjYw' },
  { item: 'cinematic-short', id: 'IRGQXQKWEek' },
  // 'promise' removed from the site (gym content, brief §1) — see site.ts.
  { item: 'star-v', id: 'VdbsVKasgBI' },
]

const OUT = path.join(REPO, 'originals')
await mkdir(OUT, { recursive: true })

const existing = new Set(await readdir(OUT).catch(() => []))

for (const entry of OWN_UPLOADS) {
  const already = [...existing].find((f) => f.startsWith(`${entry.item}.`))
  if (already) {
    console.log(`  = ${entry.item.padEnd(22)} already present (${already})`)
    continue
  }
  try {
    await ytdlp(`https://www.youtube.com/watch?v=${entry.id}`, {
      // 720p is plenty: previews render at 640w / 480w.
      format: 'bestvideo[height<=720][ext=mp4]+bestaudio[ext=m4a]/best[height<=720][ext=mp4]/best',
      output: path.join(OUT, `${entry.item}.%(ext)s`),
      noPlaylist: true,
      quiet: true,
      noWarnings: true,
    })
    const file = (await readdir(OUT)).find((f) => f.startsWith(`${entry.item}.`))
    const size = file ? (await stat(path.join(OUT, file))).size : 0
    console.log(`  + ${entry.item.padEnd(22)} ${fmtBytes(size)}`)
  } catch (error) {
    console.error(`  ! ${entry.item.padEnd(22)} failed — ${String(error.message ?? error).split('\n')[0].slice(0, 110)}`)
  }
}

console.log('\noriginals/ is git-ignored; only encoded previews get committed.')
