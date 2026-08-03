/** Page count + text preview per page of the Kilani brief. */
import { getDocument } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { pathToFileURL } from 'node:url'

import { SOURCES } from './lib.mjs'

const doc = await getDocument({ url: pathToFileURL(SOURCES.kilaniBrief).href, useSystemFonts: true }).promise
console.log('pages:', doc.numPages)
for (let i = 1; i <= doc.numPages; i += 1) {
  const page = await doc.getPage(i)
  const text = await page.getTextContent()
  const ops = await page.getOperatorList()
  const images = ops.fnArray.filter((fn) => fn === 85 || fn === 86).length // paintImageXObject variants
  console.log(i, `imgs~${images}`, JSON.stringify(text.items.map((x) => x.str).join(' ').slice(0, 100)))
}
