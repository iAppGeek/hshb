# HSHB Website

The Hellenic School of High Barnet website, built with [Next.js](https://nextjs.org), [Tailwind CSS](https://tailwindcss.com), and [Contentful](https://www.contentful.com) as a headless CMS.

## Getting started

Install dependencies:

```bash
npm install
```

### Environment variables

Create a `.env.local` file in the project root with your Contentful credentials:

```
CONTENTFUL_SPACE=your_space_id
CONTENTFUL_TOKEN=your_access_token
```

To find these values:

1. Log in to [Contentful](https://app.contentful.com)
2. Open the **HSHB** space
3. Go to **Settings → API keys**
4. Select the existing API key (or create one)
5. Copy the **Space ID** → `CONTENTFUL_SPACE`
6. Copy the **Content Delivery API - access token** → `CONTENTFUL_TOKEN`

#### Optional: Contentful management token

To regenerate the TypeScript types in `src/types/contentful/` after a content-model change, you also need a Contentful Management API personal access token:

```env
CONTENTFUL_MANAGEMENT_TOKEN=your_cma_token
```

Generate one at [https://app.contentful.com/account/profile/cma_tokens](https://app.contentful.com/account/profile/cma_tokens). This is **only needed locally** to run `npm run gen:types` — CI uses the committed types and never needs this token.

### Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

The site is deployed on Netlify. Due to a Sharp/OS compatibility issue, run the following before deploying to ensure the Linux build works:

```bash
npm install --cpu=x64 --os=linux sharp
```

See the [Sharp cross-platform docs](https://sharp.pixelplumbing.com/install#cross-platform) for more details.

## E2E tests (Playwright)

Smoke tests cover the public-facing critical paths (homepage, contact form, events section). They run against the local Next dev server, which hits Contentful at request time — so the same `CONTENTFUL_SPACE` / `CONTENTFUL_TOKEN` values used for development are required.

### First-time setup

```bash
npx playwright install --with-deps chromium
cp .env.e2e.example .env.e2e   # then fill in the Contentful values
```

### Running tests

```bash
npm run test:e2e         # headless
npm run test:e2e:ui      # Playwright UI mode
```

Playwright boots its own dev server (see `playwright.config.ts`) and shuts it down after the run.

### CI secrets

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs the E2E suite as part of the same job that lints, type-checks, and builds. It requires these repository secrets:

| Secret             | Notes                                               |
| ------------------ | --------------------------------------------------- |
| `CONTENTFUL_SPACE` | Same value used locally                             |
| `CONTENTFUL_TOKEN` | Content Delivery API token (read-only); not the CMA |

## Tech stack

- [Next.js](https://nextjs.org/docs) — React framework with App Router
- [Tailwind CSS](https://tailwindcss.com/docs) — Utility-first CSS
- [Contentful](https://www.contentful.com/developers/docs/) — Headless CMS for all site content
- [Headless UI](https://headlessui.dev) — Accessible UI components
- [Vitest](https://vitest.dev) — Unit testing
- [Playwright](https://playwright.dev) — End-to-end testing
