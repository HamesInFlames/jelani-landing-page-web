/**
 * Render pages of the Kilani "Valentines Variation" creative brief to images.
 * First run renders low-res proofs of the opening pages to the scratch dir
 * given on the CLI so a page can be chosen by eye; run with an output under
 * public/ and a single page once chosen.
 *
 * Usage: node scripts/media/build-brief.mjs <outDir> [pages] [width]
 */

import path from 'node:path'
import { mkdir, writeFile, stat } from 'node:fs/promises'

import { pdfToPng } from 'pdf-to-png-converter'
import sharp from 'sharp'

import { SOURCES, fmtBytes } from './lib.mjs'

const [outArg, pagesArg, widthArg] = process.argv.slice(2)
const pages = (pagesArg ?? '1,2,3,4').split(',').map(Number)
const width = Number(widthArg ?? 700)

const outDir = path.resolve(outArg)
await mkdir(outDir, { recursive: true })

const rendered = await pdfToPng(SOURCES.kilaniBrief, {
  pagesToProcess: pages,
  viewportScale: 2,
})

for (const page of rendered) {
  const out = path.join(outDir, `brief-p${page.pageNumber}.webp`)
  await sharp(page.content).resize(width).webp({ quality: 80 }).toFile(out)
  const { size } = await stat(out)
  console.log(`${out}  ${fmtBytes(size)}`)
}
