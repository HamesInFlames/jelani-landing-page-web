/**
 * Post-build step: renders the page to static HTML and folds the stylesheet
 * into the document.
 *
 * Without this the browser has to download, parse, and execute the whole
 * React bundle before a single pixel appears — on a throttled phone that is
 * seconds of blank screen. Prerendering means the markup paints immediately
 * and React attaches to it afterwards.
 */
import { readFile, writeFile, rm } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssrEntry = path.join(root, 'dist-ssr', 'entry-server.js')

if (!existsSync(ssrEntry)) {
  console.error('prerender: missing SSR bundle at dist-ssr/entry-server.js')
  process.exit(1)
}

// file:// URL rather than the bare path — absolute Windows paths (C:\…) are
// rejected by the ESM loader.
const { render } = await import(pathToFileURL(ssrEntry).href)
const appHtml = render()

const indexPath = path.join(dist, 'index.html')
let html = await readFile(indexPath, 'utf8')

// 1. Inject the rendered markup.
html = html.replace('<div id="root"></div>', `<div id="root">${appHtml}</div>`)

// 2. Inline the stylesheet — one fewer render-blocking round trip on a
//    single-page site, and the CSS is small enough to be worth embedding.
const linkMatch = html.match(/<link rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/)
if (linkMatch) {
  const [tag, href] = linkMatch
  const cssPath = path.join(dist, href.replace(/^\//, ''))
  if (existsSync(cssPath)) {
    const css = await readFile(cssPath, 'utf8')
    html = html.replace(tag, `<style>${css}</style>`)
    console.log(`prerender: inlined ${(css.length / 1024).toFixed(1)} KB of CSS`)
  }
}

await writeFile(indexPath, html)
await rm(path.join(root, 'dist-ssr'), { recursive: true, force: true })

console.log(`prerender: wrote ${(html.length / 1024).toFixed(1)} KB of static HTML`)
