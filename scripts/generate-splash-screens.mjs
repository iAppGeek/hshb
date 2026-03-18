import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

import sharp from 'sharp'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const ICON = resolve(ROOT, 'src/images/logo.png')
const OUT_DIR = resolve(ROOT, 'public/icons/splash')
const BG_COLOR = { r: 30, g: 64, b: 175 } // #1e40af (theme blue)

const SIZES = [
  // iPads
  { width: 2048, height: 2732, name: 'apple-splash-2048-2732.png' },
  { width: 2732, height: 2048, name: 'apple-splash-2732-2048.png' },
  { width: 1668, height: 2388, name: 'apple-splash-1668-2388.png' },
  { width: 2388, height: 1668, name: 'apple-splash-2388-1668.png' },
  { width: 1536, height: 2048, name: 'apple-splash-1536-2048.png' },
  { width: 2048, height: 1536, name: 'apple-splash-2048-1536.png' },
  // Older iPhones
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
  // iPhone 12 / 13 / 14
  { width: 1170, height: 2532, name: 'apple-splash-1170-2532.png' },
  { width: 2532, height: 1170, name: 'apple-splash-2532-1170.png' },
  // iPhone 12 mini / 13 mini
  { width: 1080, height: 2340, name: 'apple-splash-1080-2340.png' },
  { width: 2340, height: 1080, name: 'apple-splash-2340-1080.png' },
  // iPhone 12 Pro Max / 13 Pro Max / 14 Plus
  { width: 1284, height: 2778, name: 'apple-splash-1284-2778.png' },
  { width: 2778, height: 1284, name: 'apple-splash-2778-1284.png' },
  // iPhone 14 Pro / 15 Pro
  { width: 1179, height: 2556, name: 'apple-splash-1179-2556.png' },
  { width: 2556, height: 1179, name: 'apple-splash-2556-1179.png' },
  // iPhone 14 Pro Max / 15 Pro Max / 15 Plus
  { width: 1290, height: 2796, name: 'apple-splash-1290-2796.png' },
  { width: 2796, height: 1290, name: 'apple-splash-2796-1290.png' },
  // iPhone 16 Pro Max / 17 Pro Max
  { width: 1320, height: 2868, name: 'apple-splash-1320-2868.png' },
  { width: 2868, height: 1320, name: 'apple-splash-2868-1320.png' },
  // iPhone 16 Pro / 17 / 17 Pro / 17 Air
  { width: 1206, height: 2622, name: 'apple-splash-1206-2622.png' },
  { width: 2622, height: 1206, name: 'apple-splash-2622-1206.png' },
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
      create: { width, height, channels: 4, background: BG_COLOR },
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
