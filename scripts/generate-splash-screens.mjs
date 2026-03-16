import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const ICON = resolve(ROOT, 'src/images/logo.png')
const OUT_DIR = resolve(ROOT, 'public/icons/splash')
const BG_COLOR = { r: 255, g: 255, b: 255 } // white

const SIZES = [
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
  { width: 2732, height: 2048, name: 'apple-splash-2732-2048.png' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
  { width: 2388, height: 1668, name: 'apple-splash-2388-1668.png' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
  { width: 2048, height: 1536, name: 'apple-splash-2048-1536.png' },
  { width: 1242, height: 2688, name: 'apple-splash-1242-2688.png' },
  { width: 2688, height: 1242, name: 'apple-splash-2688-1242.png' },
  { width: 1125, height: 2436, name: 'apple-splash-1125-2436.png' },
  { width: 2436, height: 1125, name: 'apple-splash-2436-1125.png' },
  { width: 1242, height: 2208, name: 'apple-splash-1242-2208.png' },
  { width: 2208, height: 1242, name: 'apple-splash-2208-1242.png' },
  { width: 828, height: 1792, name: 'apple-splash-828-1792.png' },
  { width: 1792, height: 828, name: 'apple-splash-1792-828.png' },
  { width: 750, height: 1334, name: 'apple-splash-750-1334.png' },
  { width: 1334, height: 750, name: 'apple-splash-1334-750.png' },
  { width: 640, height: 1136, name: 'apple-splash-640-1136.png' },
  { width: 1136, height: 640, name: 'apple-splash-1136-640.png' },
]

const ICON_RATIO = 0.35 // icon takes up 35% of the shorter dimension

async function generate() {
  const { mkdirSync } = await import('fs')
  mkdirSync(OUT_DIR, { recursive: true })

  for (const { width, height, name } of SIZES) {
    const iconSize = Math.round(Math.min(width, height) * ICON_RATIO)

    const icon = await sharp(ICON)
      .resize(iconSize, iconSize, {
        fit: 'contain',
        background: { ...BG_COLOR, alpha: 0 },
      })
      .toBuffer()

    await sharp({
      create: { width, height, channels: 3, background: BG_COLOR },
    })
      .composite([
        {
          input: icon,
          gravity: 'centre',
        },
      ])
      .png()
      .toFile(resolve(OUT_DIR, name))

    console.log(`✓ ${name}`)
  }

  console.log(`\nDone — ${SIZES.length} splash screens in public/icons/splash/`)
}

generate().catch(console.error)
