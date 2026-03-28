import React from 'react'

const splashScreens = [
  // iPad Pro 12.9"
  { w: 1024, h: 1366, dpr: 2, portrait: '2048-2732', landscape: '2732-2048' },
  // iPad Pro 11"
  { w: 834, h: 1194, dpr: 2, portrait: '1668-2388', landscape: '2388-1668' },
  // iPad
  { w: 768, h: 1024, dpr: 2, portrait: '1536-2048', landscape: '2048-1536' },
  // iPhone 16 Pro Max / 17 Pro Max
  { w: 440, h: 956, dpr: 3, portrait: '1320-2868', landscape: '2868-1320' },
  // iPhone 16 Pro / 17 / 17 Pro
  { w: 402, h: 874, dpr: 3, portrait: '1206-2622', landscape: '2622-1206' },
  // iPhone 17 Air
  { w: 420, h: 912, dpr: 3, portrait: '1260-2736', landscape: '2736-1260' },
  // iPhone 14 Pro Max / 15 Pro Max / 16 Plus
  { w: 430, h: 932, dpr: 3, portrait: '1290-2796', landscape: '2796-1290' },
  // iPhone 14 Pro / 15 Pro
  { w: 393, h: 852, dpr: 3, portrait: '1179-2556', landscape: '2556-1179' },
  // iPhone 12/13/14 Pro Max
  { w: 428, h: 926, dpr: 3, portrait: '1284-2778', landscape: '2778-1284' },
  // iPhone 12/13/14
  { w: 390, h: 844, dpr: 3, portrait: '1170-2532', landscape: '2532-1170' },
  // iPhone 12/13 mini
  { w: 360, h: 780, dpr: 3, portrait: '1080-2340', landscape: '2340-1080' },
  // iPhone XS Max / 11 Pro Max
  { w: 414, h: 896, dpr: 3, portrait: '1242-2688', landscape: '2688-1242' },
  // iPhone X / XS / 11 Pro
  { w: 375, h: 812, dpr: 3, portrait: '1125-2436', landscape: '2436-1125' },
  // iPhone 8 Plus
  { w: 414, h: 736, dpr: 3, portrait: '1242-2208', landscape: '2208-1242' },
  // iPhone XR / 11
  { w: 414, h: 896, dpr: 2, portrait: '828-1792', landscape: '1792-828' },
  // iPhone 8 / SE 2nd gen
  { w: 375, h: 667, dpr: 2, portrait: '750-1334', landscape: '1334-750' },
  // iPhone SE 1st gen
  { w: 320, h: 568, dpr: 2, portrait: '640-1136', landscape: '1136-640' },
]

export default function IosSplashLinks() {
  return (
    <>
      {/* Fallback for unrecognised future screen sizes */}
      <link
        rel="apple-touch-startup-image"
        href="/icons/splash/apple-splash-1320-2868.png"
      />
      {splashScreens.map(({ w, h, dpr, portrait, landscape }) => (
        <React.Fragment key={portrait}>
          <link
            rel="apple-touch-startup-image"
            href={`/icons/splash/apple-splash-${portrait}.png`}
            media={`screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`}
          />
          <link
            rel="apple-touch-startup-image"
            href={`/icons/splash/apple-splash-${landscape}.png`}
            media={`screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: landscape)`}
          />
        </React.Fragment>
      ))}
    </>
  )
}
