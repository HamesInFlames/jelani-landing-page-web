import { existsSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

// The cloud build containers pin Chromium at a fixed path; local machines use
// the standard Playwright-managed install. Honour the pin only where it exists.
const pinnedChromium = '/opt/pw-browsers/chromium'

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:4173',
    launchOptions: existsSync(pinnedChromium) ? { executablePath: pinnedChromium } : {},
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    // PORT is passed via `env`, not an inline prefix — inline VAR=x is a
    // bash-ism that breaks when the command runs under cmd.exe on Windows.
    command: 'npm run build && node server/index.js',
    env: { PORT: '4173' },
    url: 'http://localhost:4173/healthz',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
