/**
 * Shared plumbing for the media pipeline.
 *
 * Source footage and stills live OUTSIDE the repo (the sibling asset folders
 * on James's machine) and are never committed — only the processed outputs
 * under public/ are. These scripts are the reproducible record of how each
 * shipped asset was made.
 *
 * ffmpeg/cwebp are not installed on the build machine; we use the npm-vendored
 * ffmpeg-static + sharp instead.
 */

import { execFile } from 'node:child_process'
import { mkdir, rm } from 'node:fs/promises'
import path from 'node:path'
import { promisify } from 'node:util'
import { fileURLToPath } from 'node:url'

import ffmpegPath from 'ffmpeg-static'
import ffprobeStatic from 'ffprobe-static'

const execFileAsync = promisify(execFile)

export const FFMPEG = ffmpegPath
export const FFPROBE = ffprobeStatic.path

export const REPO = path.resolve(fileURLToPath(new URL('../../', import.meta.url)))
/** The asset folders sit beside the repo, not inside it. */
export const ASSETS = path.resolve(REPO, '..')
export const PUBLIC = path.join(REPO, 'public')

export const SOURCES = {
  bioderma: path.join(ASSETS, 'Website refernece', 'socliq live bioderma color audio blend.mov'),
  soluna: path.join(ASSETS, 'Website refernece', 'soluna youtube test.mp4'),
  runClub: path.join(ASSETS, 'Website refernece', 'Run Club 2', 'main clips run club 2.mp4'),
  resetStudio: path.join(ASSETS, 'Website refernece', 'Reset Studio'),
  canergy: path.join(ASSETS, 'Canergy Exports'),
  bts: path.join(ASSETS, 'Cellphone BTS'),
  kilaniBrief: path.join(ASSETS, 'Website refernece', 'Valentines Variation.pdf'),
}

export async function ffmpeg(args) {
  // Large extractions are chatty on stderr; ffmpeg writes progress there even
  // when it succeeds, so a big buffer is required.
  return execFileAsync(FFMPEG, ['-hide_banner', '-loglevel', 'error', ...args], {
    maxBuffer: 1024 * 1024 * 64,
  })
}

export async function probe(file) {
  const { stdout } = await execFileAsync(
    FFPROBE,
    [
      '-v', 'error',
      '-select_streams', 'v:0',
      '-show_entries', 'stream=width,height,r_frame_rate,codec_name:format=duration',
      '-of', 'json',
      file,
    ],
    { maxBuffer: 1024 * 1024 * 16 },
  )
  const parsed = JSON.parse(stdout)
  const stream = parsed.streams[0]
  const [num, den] = String(stream.r_frame_rate).split('/')
  return {
    width: stream.width,
    height: stream.height,
    codec: stream.codec_name,
    fps: Number(num) / Number(den || 1),
    duration: Number(parsed.format.duration),
  }
}

export async function freshDir(dir) {
  await rm(dir, { recursive: true, force: true })
  await mkdir(dir, { recursive: true })
  return dir
}

export function fmtBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
