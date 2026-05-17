# Plan: Future Enhancements — HSHB Main Site

## Context

A backlog of larger-shape changes worth picking up once the day-to-day improvements settle. Each is a paragraph, not a step-by-step plan — when one is picked up, it should be promoted to its own dedicated plan file with phases and a verification checklist.

This file's job is to **rank them by leverage and document what each one improves**, so the next person picking up work can pick the highest-value item without re-deriving the analysis.

## Priority order

Ordered by `(benefit × likelihood of landing cleanly) ÷ engineering cost`.

| #   | Item                                                                         | Cost    | Risk  | Primary win                          |
| --- | ---------------------------------------------------------------------------- | ------- | ----- | ------------------------------------ |
| 1   | [Content Security Policy](#1-content-security-policy)                        | Low     | Low\* | Defence-in-depth security            |
| 2   | [Contentful on-demand revalidation](#2-contentful-on-demand-revalidation)    | Low–Med | Low   | Editors see changes in seconds       |
| 3   | [Server Action for contact form](#3-server-action-for-contact-form)          | Med     | Low   | Spam protection, validated payloads  |
| 4   | [Self-host Cabinet Grotesk](#4-self-host-cabinet-grotesk)                    | Med     | Med   | FCP/LCP + remove third-party dep     |
| 5   | [Drop `sections/**` coverage exclusion](#5-drop-sections-coverage-exclusion) | Med     | Low   | Test confidence on the layout layer  |
| 6   | [Split single page into routes](#6-split-single-page-into-routes)            | High    | High  | Per-page SEO + real GA + smaller LCP |
| 7   | [Collapse `getTextSectionData` calls](#7-collapse-gettextsectiondata-calls)  | Low     | Low   | Minor perf + code clarity            |

\* CSP risk is mitigated by the Report-Only rollout step described below.

---

## 1. Content Security Policy

**What's there now:** [netlify.toml](../netlify.toml) sets X-Frame-Options, HSTS, and Permissions-Policy, but no `Content-Security-Policy` header. Any successful XSS today executes with full origin privileges on `hshb.org.uk`.

**What this improves:** Adds a browser-enforced allowlist of script/style/image/connect origins. The blast radius of any future XSS bug shrinks from "run arbitrary JavaScript on hshb.org.uk" to "browser blocks the injection." This is the cheapest meaningful security improvement available.

**Why this is #1:** Config-only change in `netlify.toml`. No code refactor, no schema migration, no third-party signup. The risk of breaking a legitimate request is fully mitigated by rolling out as `Content-Security-Policy-Report-Only` first to surface false positives before enforcing.

**Allowlist sketch:** `'self'`, `https://images.ctfassets.net` (Contentful assets), `https://cdn.fontshare.com`, `https://api.fontshare.com`, `https://www.googletagmanager.com` (GA), `https://calendar.google.com` (events iframe). If [#4](#4-self-host-cabinet-grotesk) lands first, Fontshare drops off the allowlist.

---

## 2. Contentful on-demand revalidation

**What's there now:** [contentful.ts:22-24](../src/data/contentful.ts#L22-L24) holds a module-level `textCachePromise` that lives for the lifetime of the serverless container. Editors who publish a change in Contentful see nothing on the live site until the next deploy (or container recycle).

**What this improves:** Editors get near-instant updates without a redeploy. Two upgrades:

1. Convert the ad-hoc module cache to `unstable_cache` (or `fetch` with `next: { tags: ['contentful:*'] }`) so caching is principled and discoverable rather than hidden in a module variable.
2. Add `/api/revalidate` triggered by a Contentful publish webhook, calling `revalidateTag('contentful:*')`. Add a shared-secret check on the webhook so it can't be triggered externally.

**Why this is #2:** Single biggest editorial UX win on the list. Cost is low — `unstable_cache` and `revalidateTag` are well-trodden Next.js patterns; the webhook is one route handler. Failure mode is graceful: if the webhook drops, content lags by the cache TTL — same as today.

**Watch for:** the existing `textCachePromise` is shared across all callers; the tag-based replacement needs to cover every `client.getEntries` site in `src/data/contentful.ts`, not just the text section.

---

## 3. Server Action for contact form

**What's there now:** [ContactForm.tsx](../src/clientComponents/ContactForm.tsx) `POST`s to `/__forms.html` (Netlify's form shim) with no server-side validation and no bot protection. The e2e suite has to mock the endpoint because `next dev` doesn't serve `/__forms.html`. Two `@ts-expect-error` comments at [line 18](../src/clientComponents/ContactForm.tsx#L18) and [line 24](../src/clientComponents/ContactForm.tsx#L24) remain in the file.

**What this improves:**

- **Validated input:** A Zod schema on a Server Action rejects malformed payloads server-side. Today, devtools-edited HTML can submit any shape.
- **Spam protection:** Cloudflare Turnstile or hCaptcha gates the submission. The form is a public unauthenticated endpoint — without a bot gate it will eventually be discovered.
- **Real e2e test:** Playwright stops `page.route`-stubbing `/__forms.html` and exercises the real Server Action path. The test catches schema regressions instead of just UI render regressions.
- **Tech debt cleanup:** Both `@ts-expect-error` comments are trivially fixable (`event.currentTarget as HTMLFormElement`, iterate `formData.entries()`) — but they go away naturally with the rewrite.

**Why this is #3:** Real attack surface (public unauthenticated POST endpoint with no rate limit). Scope is small and contained. The only reason it sits behind [#1](#1-content-security-policy) and [#2](#2-contentful-on-demand-revalidation) is that those have lower cost-to-deliver.

**Watch for:** Turnstile/hCaptcha adds a third-party script — coordinate with [#1](#1-content-security-policy) so the CSP allowlist includes whichever provider is chosen.

---

## 4. Self-host Cabinet Grotesk

**What's there now:** [layout.tsx:77-80](../src/app/layout.tsx#L77-L80) loads Cabinet Grotesk via a blocking `<link>` to Fontshare's CDN.

**What this improves:**

- **FCP/LCP:** A render-blocking third-party stylesheet on the critical path is the single biggest performance footgun left in the document head. Self-hosted `.woff2` via `next/font/local` ships with the page and uses `font-display: swap` correctly.
- **Reliability:** Removes the dependency on Fontshare's CDN being up. Today an outage breaks typography.
- **CSP:** Drops two entries from the CSP allowlist in [#1](#1-content-security-policy).

**Why this is #4 (and not higher):** This area is **contested**. Commit `a5c9037` tried deferring the Fontshare CSS for FCP/LCP wins and `d68beb8` reverted it the same day. Whoever picks this up should read both commits first and identify what visual regression the revert was protecting against — `next/font/local` should sidestep that class of bug entirely, but skipping the investigation is the failure mode.

**Watch for:** subset the woff2 to the glyphs actually used (Latin + Greek if any pages render Greek). Cabinet Grotesk's weights aren't free for redistribution — confirm the license permits self-hosting before bundling.

---

## 5. Drop `sections/**` coverage exclusion

**What's there now:** [vitest.config.ts:21](../vitest.config.ts#L21) excludes `src/sections/**` from coverage thresholds. Sections are the layout layer — exactly where Contentful field renames, layout shifts, and prop wiring bugs hide.

**What this improves:** Lets Vitest enforce coverage thresholds on the section components. Combined with the Phase 1 Playwright golden-path coverage, the test pyramid gets honest — unit tests catch prop wiring, Playwright catches user-visible regressions, neither has a "we'll just ignore that folder" carve-out.

**Why this is #5:** The exclusion is documented tech debt. Cost is the unknown — depends on how much section test coverage actually exists today vs. how much needs writing. Run the threshold check without the exclusion first to see the gap before committing to the work.

**Watch for:** the temptation to write shallow snapshot tests just to clear the threshold. Better to lower the threshold temporarily, write meaningful tests, and ratchet it back up.

---

## 6. Split single page into routes

**What's there now:** Everything lives at `/`, with anchor navigation (`#about-us`, `#our-community`, `#events`, `#enrolment`, `#contact`).

**What this improves:**

- **Smaller LCP:** Each route ships only the components it needs.
- **Per-page metadata:** `<title>` / OpenGraph / Twitter cards become per-section. Today every social-share preview says "Hellenic School of High Barnet" regardless of which section was shared.
- **Real sitemap entries:** Search engines index `/about`, `/admissions`, etc. as discrete URLs instead of just `/`.
- **Honest analytics:** GA tracks real page views per route instead of the current scroll-depth-event proxy ([ScrollTracker.tsx](../src/clientComponents/ScrollTracker.tsx)), which is noisy and undercounts.

**Why this is #6:** Biggest user-visible payoff on the list, also the biggest blast radius. Existing inbound links to `https://hshb.org.uk/#events` etc. need to redirect to `/events` (and similar) — a wrong redirect map breaks SEO equity and external bookmarks. Worth doing, worth doing carefully.

**Watch for:**

- Build a redirect map for every existing `#anchor` before merging.
- Audit `<Navbar>` link generation so it still scrolls smoothly within a page when relevant.
- Coordinate with GA filters — old scroll-depth events become noise once real pageviews are tracked.

---

## 7. Collapse `getTextSectionData` calls

**What's there now:** [page.tsx:113-129](../src/app/page.tsx#L113-L129) calls `getTextSectionData` ten separate times. The module cache deduplicates the network round-trip, but each call still does an `Array.find` linear scan over the full text collection.

**What this improves:** Replaces 10× `O(n)` scans with 10× `O(1)` lookups against a `Record<sectionId, string>`. The perf delta is small at today's data size — the real win is removing a footgun where someone adds new text fetches without realising the duplication.

**Why this is #7:** Genuinely a nice-to-have. Cost is low so it's easy to pick up opportunistically alongside any other change to `src/data/contentful.ts` (e.g. [#2](#2-contentful-on-demand-revalidation) is a natural carrier).

---

## Workflow notes

When picking an item up:

1. Read the linked source files at the line ranges referenced — drift may have happened since this plan was written.
2. Promote the paragraph to its own plan file under `plans/` with explicit phases, sub-step numbering, conventional-commit prefixes, and a verification checklist at the bottom.
3. Branch off `main` as `feat/<short-slug>` or `chore/<short-slug>` and commit per completed unit of work — each sub-step lands as its own commit so the diff stays reviewable.
4. Run `npm run fix:all` before each commit and `npm run pipeline:check` before opening the PR.
5. Update the table at the top of this file when an item lands — mark the row complete and link to the merge commit.
