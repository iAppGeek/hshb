# Plan: Separate Portal into its Own Repo and Netlify Project

## Context

The HSHB codebase currently bundles two independent applications in one Next.js project:

1. **Main website** (hshb.org.uk) — a public Contentful-driven marketing site
2. **Staff portal** (hshb.org.uk/portal) — an authenticated internal app for staff management

These apps share no runtime dependencies. The main site doesn't use auth, database, or any portal code. The portal doesn't use Contentful or any marketing sections. Splitting them into separate repos and Netlify projects gives independent builds, smaller dependency trees, and cleaner ownership.

**Target state:**

- `hshb.org.uk` — main site (existing Netlify project, existing repo)
- `portal.hshb.org.uk` — portal (new Netlify project "ses", new repo)

---

## Phase 1: Create the New Portal Repo

### 1.1 Initialize the project

Create a new repo (e.g. `hshb-portal`). Set up with:

- Next.js 16.2.4, React 19.2.5, TypeScript 5.9.3
- Same `tsconfig.json` with `@/*` -> `./src/*` path alias
- Same `postcss.config.mjs` with `@tailwindcss/postcss`
- Copy `eslint.config.mjs`, `prettier.config.js`, `commitlint.config.cjs`, `.husky/`, `.npmrc`, `.gitignore`
- Copy `vitest.config.ts`, `vitest.setup.ts`, `playwright.config.ts`

### 1.2 Copy portal source code

**App routes** — move `src/app/portal/*` content up one level so routes become root-level:

| Current path                       | New path                    | Notes                                |
| ---------------------------------- | --------------------------- | ------------------------------------ |
| `src/app/portal/layout.tsx`        | `src/app/layout.tsx`        | Merge with root HTML shell (see 1.3) |
| `src/app/portal/page.tsx`          | `src/app/page.tsx`          | Update redirect target               |
| `src/app/portal/loading.tsx`       | `src/app/loading.tsx`       |                                      |
| `src/app/portal/actions.ts`        | `src/app/actions.ts`        |                                      |
| `src/app/portal/login/`            | `src/app/login/`            |                                      |
| `src/app/portal/dashboard/`        | `src/app/dashboard/`        |                                      |
| `src/app/portal/students/`         | `src/app/students/`         |                                      |
| `src/app/portal/staff/`            | `src/app/staff/`            |                                      |
| `src/app/portal/classes/`          | `src/app/classes/`          |                                      |
| `src/app/portal/attendance/`       | `src/app/attendance/`       |                                      |
| `src/app/portal/staff-attendance/` | `src/app/staff-attendance/` |                                      |
| `src/app/portal/incidents/`        | `src/app/incidents/`        |                                      |
| `src/app/portal/lesson-plans/`     | `src/app/lesson-plans/`     |                                      |
| `src/app/portal/reports/`          | `src/app/reports/`          |                                      |
| `src/app/portal/timetables/`       | `src/app/timetables/`       |                                      |
| `src/app/portal/guardians/`        | `src/app/guardians/`        |                                      |
| `src/app/portal/admin/`            | `src/app/admin/`            |                                      |
| `src/app/portal/_components/`      | `src/app/_components/`      |                                      |

**API routes:**
| Current path | New path |
|---|---|
| `src/app/api/auth/[...nextauth]/route.ts` | `src/app/api/auth/[...nextauth]/route.ts` |
| `src/app/api/push/subscribe/route.ts` | `src/app/api/push/subscribe/route.ts` |

**Auth, DB, Lib, Types** — copy entirely (portal-only code):

- `src/auth/` (config.ts, index.ts)
- `src/db/` (all 12 domain modules + client.ts + index.ts + specs)
- `src/lib/` — all files: permissions, datetime, schemas, push, push-client, mailto, db-error, roleLabels, student-address (+ all specs + PERMISSIONS.md)
- `src/types/` — database.ts, next-auth.d.ts, images.d.ts

**Components used by portal** — copy only what's needed:

- `src/components/Tooltip.tsx` + spec
- `src/components/DatePicker.tsx` + spec
- `src/components/StudentDetailsModal.tsx` + spec
- `src/clientComponents/BulkEmailDropdown.tsx` + spec
- `src/clientComponents/StaffEmailDropdown.tsx` + spec

**Proxy:**

- keep `src/proxy.ts` and `src/proxy.spec.ts` naming (update logic/matcher, see 1.5)

**Static assets:**

- `public/manifest.portal.json` -> `public/manifest.json` (update scope/paths)
- `public/portal-sw.js` -> `public/sw.js` (update paths)
- `public/portal-offline.html` -> `public/offline.html`
- `public/icons/` — all portal icons **including `public/icons/splash/` subdirectory** (iOS splash screens referenced by IosSplashLinks)
- `src/images/logo.png`, `src/images/icons/microsoft.svg`

**Styles:**

- `src/styles/tailwind.css`

**E2E + Supabase:**

- `e2e/` — entire directory
- `supabase/` — entire directory

### 1.3 Create the portal root layout

The new `src/app/layout.tsx` must combine:

- **HTML shell** from current `src/app/layout.tsx` (Inter font, `<html>`, `<body>`, GoogleAnalytics)
- **Portal layout** from current `src/app/portal/layout.tsx` (sidebar, auth, PWA, notification banner)

Remove the Cabinet Grotesk font link (marketing site font). Keep `IosSplashLinks` in `<head>`. Metadata becomes portal-specific (no SEO keywords, robots noindex, manifest pointing to `/manifest.json`).

### 1.4 Update all `/portal/` path references

Global find-replace `/portal/` -> `/` across the portal codebase, then manually verify these critical files:

**Auth & navigation:**

- **`src/auth/config.ts`** (lines 63-66): `signIn: '/portal/login'` -> `'/login'`, `error: '/portal/login'` -> `'/login'`
- **`src/app/layout.tsx`** (portal layout, navItems at lines 54-90): all `href` values drop `/portal` prefix
- **`src/app/layout.tsx`** (signOut action, line 101): `redirectTo: '/portal/login'` -> `'/login'`
- **`src/app/login/page.tsx`**: redirect targets and `redirectTo` values
- **`src/app/page.tsx`**: redirect from `/portal/dashboard` to `/dashboard`

**PWA (critical):**

- **`src/app/_components/PwaRegistrar.tsx`** line 9: `/portal-sw.js` -> `/sw.js` AND `scope: '/portal'` -> `scope: '/'`
- **`src/app/layout.tsx`** metadata: `manifest: '/manifest.portal.json'` -> `manifest: '/manifest.json'`
- **`public/manifest.json`** (was `manifest.portal.json`): `start_url: '/login'`, `scope: '/'`, `id: '/'`
- **`public/sw.js`** (was `portal-sw.js`):
  - line 4: precache `/manifest.json` (not `/manifest.portal.json`)
  - line 5: precache `/offline.html` (not `/portal-offline.html`)
  - line 51: offline fallback `caches.match('/offline.html')`
  - line 104: notification click default URL `'/reports'` (not `'/portal/reports'`)
  - line 110: client match check — remove `client.url.includes('/portal')`, match on origin instead

**Push notifications (critical):**

- **`src/app/attendance/actions.ts`** line 91: `revalidatePath('/portal/attendance')` -> `revalidatePath('/attendance')`
- **`src/app/attendance/actions.ts`** line 102: push payload `data: { url: '/portal/reports' }` -> `data: { url: '/reports' }` — this is the URL staff land on when tapping a push notification; if missed, tapping a notification would 404

**E2E tests:** all URL paths throughout `e2e/`

### 1.5 Rewrite proxy

Current `src/proxy.ts`:

```typescript
export const proxy = auth((req) => { ... })
export const config = { matcher: ['/portal/:path*'] }
```

Updated `src/proxy.ts`:

```typescript
export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isLoginPage = pathname === '/login'
  const isReportsPage = pathname.startsWith('/reports')

  if (!isLoginPage && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url))
  }
  if (isLoginPage && isLoggedIn) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }
  if (isReportsPage) {
    const role = req.auth?.user?.role as StaffRole | undefined
    if (!role || !canAccessReports(role)) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }
})

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|icons|manifest.json|sw.js|offline.html|favicon.ico).*)',
  ],
}
```

### 1.6 Portal `package.json`

Same scripts structure. Trim dependencies:

- **Remove** (main-site-only): `contentful`, `next-mdx-remote`, `react-markdown`, `remark-gfm`
- **Keep**: `next`, `react`, `react-dom`, `next-auth`, `@supabase/supabase-js`, `web-push`, `zod`, `@headlessui/react`, `@heroicons/react`, `@next/third-parties`, `clsx`, `server-only`, `babel-plugin-react-compiler`
- DevDeps: keep all testing/linting tools; keep `supabase`, `dotenv-cli`, `@playwright/test`

### 1.7 Portal `netlify.toml`

```toml
[build]
  command = "npm test && npm run build"

[build.environment]
  NODE_VERSION = "24.14.0"
  NPM_FLAGS = "--ignore-scripts"

[[plugins]]
  package = "@netlify/plugin-nextjs"

[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"
    Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"

[[headers]]
  for = "/sw.js"
  [headers.values]
    Cache-Control = "no-cache, no-store, must-revalidate"
```

### 1.8 Portal `next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  reactCompiler: true,
  // No Contentful image remotePatterns needed
}
```

### 1.9 CI workflows

Create `.github/workflows/ci.yml` — same structure but without Contentful env vars. Portal-specific secrets only (AUTH_SECRET, SUPABASE, AZURE_AD placeholders for build).

Create `.github/workflows/e2e.yml` — same structure, local Supabase, E2E_TEST=true.

Update `playwright.config.ts` URLs from `/portal/*` to `/*`.

---

## Phase 2: Clean Up the Main Site Repo

### 2.1 Delete portal code

Remove from the existing `hshb` repo:

- `src/app/portal/` (entire directory — ~140 files)
- `src/app/api/auth/` and `src/app/api/push/` (portal-only API routes)
- `src/auth/` (entire directory)
- `src/db/` (entire directory)
- `src/proxy.ts` + `src/proxy.spec.ts`
- `src/security.spec.ts` (portal-specific checks should move to `hshb-portal`; keep or add a separate main-site-only security spec if needed)
- `src/lib/` — permissions, datetime, schemas, push, push-client, mailto, db-error, roleLabels, student-address (all `.ts` + `.spec.ts` files + `PERMISSIONS.md`)
- `src/types/database.ts`, `src/types/next-auth.d.ts`
- `src/clientComponents/BulkEmailDropdown.tsx` + spec, `StaffEmailDropdown.tsx` + spec
- `src/components/StudentDetailsModal.tsx` + spec
- `public/manifest.portal.json`, `public/portal-sw.js`, `public/portal-offline.html`
- `public/icons/` — portal-specific icons (keep any used by main site)
- `src/images/icons/microsoft.svg`
- `e2e/` (all E2E tests are portal-focused)
- `supabase/` (not needed by marketing site)

### 2.2 Clean up root layout

In `src/app/layout.tsx`:

- Remove `import IosSplashLinks from './portal/_components/IosSplashLinks'`
- Remove `<IosSplashLinks />` from `<head>`

### 2.3 Update `src/app/robots.ts`

Remove `disallow: '/portal/'` — no portal routes remain.

### 2.4 Trim dependencies from `package.json`

**Remove:**

- `next-auth`, `@supabase/supabase-js`, `web-push`, `zod`, `server-only`
- `@types/web-push`, `dotenv-cli`, `supabase`, `@playwright/test`
- Check if `@headlessui/react` is used by main site components — remove if not

**Keep:**

- `next`, `react`, `react-dom`, `contentful`, `next-mdx-remote`, `react-markdown`, `remark-gfm`
- `@heroicons/react`, `@next/third-parties`, `clsx`, `babel-plugin-react-compiler`
- All linting/formatting devDeps, Vitest (for remaining component tests)

### 2.5 Add redirects in `netlify.toml`

```toml
[[redirects]]
  from = "/portal/*"
  to = "https://portal.hshb.org.uk/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/api/auth/*"
  to = "https://portal.hshb.org.uk/api/auth/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/api/push/*"
  to = "https://portal.hshb.org.uk/api/push/:splat"
  status = 301
  force = true

[[redirects]]
  from = "/portal-sw.js"
  to = "https://portal.hshb.org.uk/sw.js"
  status = 301
  force = true

[[redirects]]
  from = "/manifest.portal.json"
  to = "https://portal.hshb.org.uk/manifest.json"
  status = 301
  force = true
```

Remove the `/portal-sw.js` cache-control header (file no longer exists).

### 2.6 Simplify CI

Update `.github/workflows/ci.yml`: remove auth/Supabase/Azure dummy env vars, keep only Contentful secrets. Remove `e2e.yml` workflow (or create simple main-site-only E2E tests later).

### 2.7 Preserve security coverage after split

- Ensure `hshb-portal/src/security.spec.ts` exists and runs in portal CI (guards against client exposure of `AUTH_SECRET`, `AZURE_AD_CLIENT_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `VAPID_PRIVATE_KEY`).
- If `src/security.spec.ts` is removed from `hshb`, add/keep a main-site-focused equivalent that only checks marketing-site secrets and client/server boundaries relevant to `hshb`.

---

## Phase 3: Infrastructure

### 3.1 Netlify "ses" project

- Create new Netlify site linked to the portal repo
- Custom domain: `portal.hshb.org.uk`
- Environment variables: `AUTH_SECRET`, `AUTH_URL=https://portal.hshb.org.uk`, `AZURE_AD_CLIENT_ID`, `AZURE_AD_CLIENT_SECRET`, `AZURE_AD_TENANT_ID`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`, `NEXT_PUBLIC_GA_ID`

### 3.2 Microsoft Entra ID (Azure AD)

- Add redirect URI: `https://portal.hshb.org.uk/api/auth/callback/microsoft-entra-id`
- Keep old URI temporarily for rollback safety
- Remove old URI after migration confirmed

### 3.3 DNS

- Add CNAME: `portal.hshb.org.uk` -> Netlify "ses" project
- Netlify handles HTTPS certificate automatically

### 3.4 Supabase

- Verify no origin restrictions on the Supabase project (portal uses server-side service role key, so likely fine)

---

## Phase 4: Verification

### 4.1 Portal project

```bash
npm run lint
npm run format:check
npm run type-check
npm run test:coverage
npm run test:e2e        # against local Supabase
npm run build
```

- Test auth flow with Microsoft Entra ID in staging
- Verify all 13 portal sections load correctly
- Verify PWA install works from new domain

### 4.2 Main site project

```bash
npm run lint
npm run format:check
npm run type-check
npm run test:coverage
npm run build
```

- Confirm Contentful content loads
- Confirm no broken imports referencing deleted code

### 4.3 Deployment order

1. Deploy portal to `portal.hshb.org.uk` first — test independently
2. Deploy cleaned-up main site with redirects
3. Verify `/portal/*` redirects work

### 4.4 PWA migration verification

- Test fresh PWA install from `portal.hshb.org.uk` — confirm manifest loads, service worker registers with `scope: '/'`, offline page works
- Test push notification subscribe/unsubscribe toggle in sidebar
- Test push notification delivery: save attendance -> verify notification arrives on subscribed devices -> tap notification -> confirm it opens `/reports` (not `/portal/reports`)
- Verify iOS splash screens load on Add to Home Screen

### 4.5 Staff communication

- **Existing PWA installs will NOT auto-migrate.** The old service worker is registered at `hshb.org.uk` with scope `/portal` — a 301 redirect to a different origin does not transfer the service worker registration. Staff must uninstall and reinstall the PWA from `portal.hshb.org.uk`.
- **Existing push subscriptions in Supabase remain valid.** Push subscriptions are tied to the browser's push service endpoint (e.g. `fcm.googleapis.com`), not to the app's domain. Notifications sent via `web-push` will still deliver to previously-subscribed browsers. However, if a user reinstalls the PWA, they'll get a new push subscription and need to re-enable notifications — the old subscription will eventually expire or return 410 (handled by the existing cleanup logic in `attendance/actions.ts`).
- Existing bookmarks will 301-redirect correctly
