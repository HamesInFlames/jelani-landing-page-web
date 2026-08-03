/**
 * Asset budget gate — run via `npm run assets:check`.
 *
 * The KC budgets are hard limits, not aspirations: the scrub sequence must
 * stay shippable on a throttled phone, and no single still may weigh more
 * than a card is worth. Exits non-zero on any breach so the check can sit
 * in front of a commit.
 */

import { readdir, stat } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const PUBLIC = path.resolve(fileURLToPath(new URL('../../public', import.meta.url)))

const MB = 1024 * 1024
const KB = 1024

const checks = [
  { dir: 'sequence', maxTotal: 5 * MB, label: 'desktop scrub set' },
  { dir: 'sequence-sm', maxTotal: 2 * MB, label: 'mobile scrub set' },
  { dir: 'media/photos', maxTotal: 3 * MB, maxFile: 300 * KB, label: 'stills' },
  { dir: 'media', maxTotal: 4 * MB, maxFile: 300 * KB, label: 'posters & media', shallow: true },
]

let failed = false

async function filesIn(dir, shallow) {
  const entries = await readdir(dir, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (!shallow) files.push(...(await filesIn(full, false)))
    } else {
      files.push(full)
    }
  }
  return files
}

for (const check of checks) {
  const dir = path.join(PUBLIC, check.dir)
  let files
  try {
    files = await filesIn(dir, check.shallow ?? false)
  } catch {
    console.log(`  – ${check.label}: ${check.dir}/ absent, skipped`)
    continue
  }

  let total = 0
  for (const file of files) {
    const { size } = await stat(file)
    total += size
    if (check.maxFile && size > check.maxFile) {
      failed = true
      console.error(
        `  ✗ ${path.relative(PUBLIC, file)} is ${(size / KB).toFixed(0)} KB (limit ${check.maxFile / KB} KB)`,
      )
    }
  }

  const ok = total <= check.maxTotal
  if (!ok) failed = true
  console.log(
    `  ${ok ? '✓' : '✗'} ${check.label}: ${(total / MB).toFixed(2)} MB of ${check.maxTotal / MB} MB (${files.length} files)`,
  )
}

if (failed) {
  console.error('\nassets:check FAILED — trim frames or quality before committing.')
  process.exit(1)
}
console.log('\nassets:check passed.')
