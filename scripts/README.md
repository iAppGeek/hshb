# Scripts

## generate-splash-screens.mjs

Generates iOS PWA splash screen images for all supported device sizes from a source icon.

### Usage

```bash
node scripts/generate-splash-screens.mjs
```

### Output

18 PNG files (portrait + landscape for 9 device sizes) written to `public/icons/splash/`.

### Configuration

Edit the constants at the top of the file to change the source icon or background colour:

| Constant     | Default                      | Description                                             |
| ------------ | ---------------------------- | ------------------------------------------------------- |
| `ICON`       | `src/images/logo.png`        | Source image (any size, will be scaled)                 |
| `BG_COLOR`   | `{ r: 255, g: 255, b: 255 }` | Splash background colour (RGB)                          |
| `ICON_RATIO` | `0.35`                       | Icon size as a fraction of the shorter screen dimension |

### When to re-run

- The source icon (`src/images/logo.png`) changes
- The background colour is updated
- New device sizes need to be added to `SIZES`

The splash screens are referenced in `src/app/portal/IosSplashLinks.tsx` and only apply to iOS when the portal PWA is installed to the home screen.
