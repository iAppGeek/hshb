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

Integration tests run against a local Supabase instance using Playwright. Tests cover all 4 staff roles across desktop and mobile viewports.

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running

### First-time setup

```bash
npm run supabase:start   # starts local Postgres on http://127.0.0.1:54321
```

### Running tests

```bash
npm run test:e2e         # headless
npm run test:e2e:ui      # Playwright UI mode
```

`supabase db reset` runs automatically before the suite (via `e2e/global-setup.ts`), so the database is always in a clean seed state.

### Stopping Supabase

```bash
npm run supabase:stop
```

### CI secrets

The E2E GitHub Actions workflow requires these secrets set in **Settings → Secrets and variables → Actions**:

| Secret                            | Value                                  | Notes                                                                                                              |
| --------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `E2E_TEST_SECRET`                 | `e2e-test-secret-hshb`                 | Arbitrary string — gates the test-only login form                                                                  |
| `AUTH_SECRET`                     | `e2e-auth-secret-for-jwt-signing-hshb` | Signs JWTs for the local test run only                                                                             |
| `SUPABASE_SERVICE_ROLE_KEY_LOCAL` | see `.env.e2e`                         | The [public default key](https://supabase.com/docs/guides/cli/local-development) for every local Supabase instance |

`CONTENTFUL_SPACE` and `CONTENTFUL_TOKEN` are already configured — the dev server needs them at startup.

All three values are non-sensitive dummy values safe to share with the team.

## Tech stack

- [Next.js](https://nextjs.org/docs) — React framework with App Router
- [Tailwind CSS](https://tailwindcss.com/docs) — Utility-first CSS
- [Contentful](https://www.contentful.com/developers/docs/) — Headless CMS for all site content
- [Headless UI](https://headlessui.dev) — Accessible UI components
- [Vitest](https://vitest.dev) — Unit testing
