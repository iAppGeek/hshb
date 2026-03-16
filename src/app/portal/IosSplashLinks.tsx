const splashScreens = [
  { w: 1024, h: 1366, dpr: 2, portrait: '2048-2732', landscape: '2732-2048' },
  { w: 834, h: 1194, dpr: 2, portrait: '1668-2388', landscape: '2388-1668' },
  { w: 768, h: 1024, dpr: 2, portrait: '1536-2048', landscape: '2048-1536' },
  { w: 414, h: 896, dpr: 3, portrait: '1242-2688', landscape: '2688-1242' },
  { w: 375, h: 812, dpr: 3, portrait: '1125-2436', landscape: '2436-1125' },
  { w: 414, h: 736, dpr: 3, portrait: '1242-2208', landscape: '2208-1242' },
  { w: 414, h: 896, dpr: 2, portrait: '828-1792', landscape: '1792-828' },
  { w: 375, h: 667, dpr: 2, portrait: '750-1334', landscape: '1334-750' },
  { w: 320, h: 568, dpr: 2, portrait: '640-1136', landscape: '1136-640' },
]

export default function IosSplashLinks() {
  return (
    <>
      {splashScreens.map(({ w, h, dpr, portrait, landscape }) => (
        <>
          <link
            key={`p-${portrait}`}
            rel="apple-touch-startup-image"
            href={`/icons/splash/apple-splash-${portrait}.png`}
            media={`screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: portrait)`}
          />
          <link
            key={`l-${landscape}`}
            rel="apple-touch-startup-image"
            href={`/icons/splash/apple-splash-${landscape}.png`}
            media={`screen and (device-width: ${w}px) and (device-height: ${h}px) and (-webkit-device-pixel-ratio: ${dpr}) and (orientation: landscape)`}
          />
        </>
      ))}
    </>
  )
}
