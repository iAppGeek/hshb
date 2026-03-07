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

## Tech stack

- [Next.js](https://nextjs.org/docs) — React framework with App Router
- [Tailwind CSS](https://tailwindcss.com/docs) — Utility-first CSS
- [Contentful](https://www.contentful.com/developers/docs/) — Headless CMS for all site content
- [Headless UI](https://headlessui.dev) — Accessible UI components
- [Vitest](https://vitest.dev) — Unit testing
