import path from 'path'
import { fileURLToPath } from 'url'

import sharp from 'sharp'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const logoPath = path.join(__dirname, '../src/images/logo.png')
const outDir = path.join(__dirname, '../public/icons/splash')

// Missing modern iPhone/iPad sizes (portrait w x h, landscape is flipped)
const missing = [
  { w: 1170, h: 2532 }, // iPhone 12 / 13 / 14
  { w: 1080, h: 2340 }, // iPhone 12 mini / 13 mini
  { w: 1284, h: 2778 }, // iPhone 12/13/14 Pro Max
  { w: 1179, h: 2556 }, // iPhone 14 Pro / 15 Pro
  { w: 1290, h: 2796 }, // iPhone 14 Pro Max / 15 Pro Max / 15 Plus
]

async function makeSplash(width, height) {
  const logoSize = Math.round(Math.min(width, height) * 0.22)

  const resizedLogo = await sharp(logoPath)
    .resize(logoSize, logoSize, {
      fit: 'contain',
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    })
    .png()
    .toBuffer()

  const left = Math.round((width - logoSize) / 2)
  const top = Math.round((height - logoSize) / 2)

  await sharp({
    create: {
      width,
      height,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 255 },
    },
  })
    .composite([{ input: resizedLogo, left, top }])
    .png()
    .toFile(path.join(outDir, `apple-splash-${width}-${height}.png`))

  console.log(`  apple-splash-${width}-${height}.png`)
}

console.log('Generating missing splash screens...')
for (const { w, h } of missing) {
  await makeSplash(w, h) // portrait
  await makeSplash(h, w) // landscape
}
console.log('Done.')
