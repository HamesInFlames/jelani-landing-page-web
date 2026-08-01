import express from 'express'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')
const app = express()
const port = process.env.PORT || 3000

app.disable('x-powered-by')

// The page ships prerendered with its CSS inlined, so index.html is large
// but highly compressible. Serving it raw would undo the prerender's whole
// point on a slow connection.
app.use(compression())

// Hashed build assets and self-hosted fonts are immutable; everything else
// revalidates so a redeploy is picked up immediately.
app.use(
  express.static(dist, {
    setHeaders(res, filePath) {
      if (filePath.includes(`${path.sep}assets${path.sep}`) || filePath.endsWith('.woff2')) {
        res.setHeader('Cache-Control', 'public, max-age=31536000, immutable')
      } else {
        res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate')
      }
    },
  }),
)

app.get('/healthz', (_req, res) => res.status(200).send('ok'))

app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

// Bind every interface — a container's health check reaches the process from
// outside, so listening only on loopback would fail the deploy.
app.listen(port, '0.0.0.0', () => {
  console.log(`JelaniWoodsTV site listening on :${port}`)
})
