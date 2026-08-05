import express from 'express'
import compression from 'compression'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { enquiryHandler } from './enquiry.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dist = path.join(__dirname, '..', 'dist')
const app = express()
const port = process.env.PORT || 3000

app.disable('x-powered-by')

// Railway terminates TLS ahead of the app, so the client address only
// survives in X-Forwarded-For — without this the rate limiter would see
// every visitor as the same proxy.
app.set('trust proxy', 1)

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

// The body limit is the abuse control here: the form's longest field is a
// 2000-character note, so anything near this ceiling is not a visitor.
app.post('/api/enquiry', express.json({ limit: '16kb' }), enquiryHandler)

app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')))

// Bind every interface — a container's health check reaches the process from
// outside, so listening only on loopback would fail the deploy.
app.listen(port, '0.0.0.0', () => {
  console.log(`JelaniWoodsTV site listening on :${port}`)
})
