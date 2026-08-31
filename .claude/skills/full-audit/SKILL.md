---
name: full-audit
description: Run a full audit of the RandomHoliday app (Next.js App Router + TypeScript) covering test coverage (unit + e2e gaps), accessibility, performance, SEO, responsive/UX, security, code quality (strict typing, duplication, bad patterns, dead code), dependency health, and roadmap alignment. Appends new findings to a persistent AUDIT.md checklist in the repo (existing checked-off items are preserved). Use when the user asks to audit, review the health of, or find improvements for the whole site — not for reviewing a single PR/diff (use /code-review for that).
---

# Full site audit

Produces a holistic health report for RandomHoliday: a single Next.js 15 (App Router) +
TypeScript app — no separate backend service, business logic lives in `/lib`, and
`/app/api/*/route.ts` handlers are the only server-side surface. This is NOT a PR/diff review —
lint, type-check, and unit test coverage are already enforced as CI gates on every PR (see
`.github/workflows/ci.yml`), so **do not re-check whether the app lints/type-checks/builds — it
already does**. This audit looks at things no single PR's gates catch: coverage gaps outside
what a PR touched, real e2e/integration coverage (a Playwright config exists but there is
currently no `e2e/` directory for it to run — verify, don't assume this has been fixed),
cross-cutting site quality (a11y, perf, SEO, security, UX), and code quality that a passing
type-check doesn't guarantee (e.g. loose typing and lint-suppressions still compile cleanly —
see category 8).

## When to run this

User asks to "audit the site", "find ways to improve the website", "do a full review of the
app", or similar whole-app requests. If they ask about a single PR or the current diff, use
`/code-review` instead.

## Output

Findings live in a single persistent file at the repo root: **`AUDIT.md`**. This is not a
one-off report — it's a living checklist that accumulates across runs. Each run **appends**,
never replaces:

- `AUDIT.md` has one `## <n>. <Category>` section per category below, in the same order, each
  containing a flat markdown checklist (`- [ ] finding text (found: YYYY-MM-DD)`).
- **Before writing anything**, read the current `AUDIT.md` in full (create it from the template
  below if it doesn't exist yet).
- For each category, compare this run's findings against what's already listed in that section:
  - If a finding already exists (same issue, same file/route — wording may differ slightly),
    **do not duplicate it**. Leave the existing line untouched.
  - If an existing unchecked item no longer reproduces (verify, don't assume — re-check it),
    check it off and add `(resolved: YYYY-MM-DD, verified during audit)` rather than deleting
    the line, so there's a record.
  - **Never touch a line that's already checked off (`- [x]`)** — those are the user's own
    record of completed work. Leave them exactly as-is, in place.
  - Genuinely new findings get appended to the bottom of that section's list as new `- [ ]`
    items, dated.
- Add a line to the `## Run log` section at the top with today's date and a one-line summary
  (e.g. "2026-08-30 — 4 new findings (2 a11y, 1 security, 1 code quality), 1 item resolved").
- Do not renumber, reorder, or rewrite prose outside the checklists — this file is meant to be
  readable as a diff over time.

Do not modify application code during the audit unless the user explicitly asks you to fix
something after seeing the report — this skill is read-only/diagnostic aside from editing
`AUDIT.md` itself.

### AUDIT.md template (use this structure if the file doesn't exist yet)

```markdown
# Site Audit

Living checklist maintained by the `/full-audit` skill. Findings are appended, never rewritten;
check an item off (`- [x]`) once you've fixed it and it won't be touched again. Re-running the
audit adds new findings to the bottom of each section and leaves checked items alone.

## Run log

- YYYY-MM-DD — initial audit

## 1. Test coverage — unit gaps and e2e

## 2. Accessibility

## 3. Performance

## 4. SEO / metadata

## 5. Responsive / UX

## 6. Security

## 7. Roadmap alignment

## 8. Code quality
```

## How to run it

Fan out the categories below as parallel forks or a general-purpose subagent per category (they
are independent and read-heavy — keep the raw output out of your main context). Have each one
**report findings back as text**, not write to `AUDIT.md` directly — only you should touch that
file, in a single merge pass at the end, so the dedup/checked-item rules above are applied
consistently in one place. Categories needing the browser (a11y/perf/responsive/e2e-walkthrough)
should run together in one browser-driving pass since they all need the app running.

Before starting, check whether a dev server is already running; if not, start it yourself
(`yarn dev`, port 3000) for the duration of the audit, and stop it when done unless the user is
already running it.

### 1. Test coverage — unit gaps and e2e

- Run `yarn test:coverage`. Even though CI runs unit tests on every PR, coverage isn't enforced
  as a 100%-on-touched-files gate here, so list every file in `/lib`, `/components`, and
  `/app` sitting meaningfully below full coverage, especially the API route handlers under
  `app/api/*/route.ts`.
- **E2e coverage**: `playwright.config.ts` points `testDir` at `./e2e`, but that directory does
  not currently exist (re-verify, don't assume this has been fixed) — `yarn e2e` currently runs
  zero specs even though CI has an `e2e-tests` job for it. Treat "e2e configured but no specs
  exist" itself as a finding, then assess actual coverage of key user flows by walking them in
  the browser via `claude-in-chrome` as a manual substitute:
  - Landing page → "Discover" wizard: departure city autocomplete → budget slider → travel
    timing → travel style → trip scope, through to submission
  - `/results` rendering from wizard query params, the Shuffle button re-rolling recommendations
  - Destination detail modal: cost breakdown, seasonal weather fetch, affiliate links
    (Booking.com / Skyscanner), Save trip (Pro upsell) and Share button
  - Dark mode toggle persistence, and the `/api/flight-price` and `/api/weather` route handlers'
    fallback behaviour when the upstream API is slow/unavailable
    For each flow, report whether it currently has automated coverage (component-level RTL tests
    don't count as e2e), and recommend concrete Playwright specs under `e2e/` that would cover the
    gap, matching the flows above one-to-one.

### 2. Accessibility

- Automated pass per route (`/`, `/discover`, `/results`) via axe injected through
  `claude-in-chrome`, or a Lighthouse a11y score
- Manual: color contrast against `styles/tokens.css` custom properties (including dark mode via
  `[data-theme="dark"]`), focus order/visible focus states, labels on the wizard's slider/select/
  autocomplete inputs, focus trap and ESC handling in `Modal`/`DestinationDetailModal`, keyboard-
  only completion of the full discover → results flow, skip-to-main link still working

### 3. Performance

- Lighthouse performance score and Core Web Vitals (LCP, CLS, INP) per route
- Next.js build output (`yarn build`): bundle size per route, unused JS/CSS, image weight for
  `/public/destinations/*` (are they optimized / served via `next/image`?), any client components
  that could be server components
- `framer-motion` animation cost (destination card flip, results reveal) on lower-end/mobile
  simulation
- Response time and timeout behaviour of `/api/flight-price` and `/api/weather` under a simple
  manual check

### 4. SEO / metadata

- `app/layout.tsx` metadata export: title/description, Open Graph tags, favicon; presence of
  `robots.txt`/`sitemap.xml` (PLAN.md Phase 9 lists these as not-yet-done — confirm current
  state rather than assuming the plan is stale), semantic heading structure per route

### 5. Responsive / UX

- Screenshot `/`, `/discover`, and `/results` at ~375px and ~1280px via `claude-in-chrome`,
  including the wizard mid-flow and the destination detail modal open, and compare against any
  per-PR spot checks already done — look for anything that's drifted or was never verified
  holistically (e.g. interactions between components added in different phases)
- Console errors on load/navigation (`read_console_messages`), broken links, dead-end states
  (e.g. no destinations matching filters)

### 6. Security

- API route review: input validation on `app/api/flight-price/route.ts` and
  `app/api/weather/route.ts` (unvalidated query/body params reaching upstream calls), API keys
  from `.env` (`OPENWEATHER_API_KEY`, `SKYSCANNER_API_KEY`, `STRIPE_SECRET_KEY`) never leaking
  into client bundles — cross-check anything using `NEXT_PUBLIC_` prefixes is actually meant to
  be public
- Since Stripe checkout is planned (PLAN.md Phase 6): if any Stripe code exists yet, confirm
  webhook signature verification and that `STRIPE_SECRET_KEY` is never referenced from a client
  component
- Dependency vulnerabilities: `yarn audit` (or check Renovate's open PR backlog per
  `renovate.json`)
- Basic response headers (CSP, HSTS, X-Content-Type-Options) — check `next.config.mjs` for
  header config, since Vercel deployment config (`vercel.json`) doesn't exist yet per PLAN.md

### 7. Roadmap alignment

- Diff `PLAN.md`'s checked/unchecked items against what's actually live in `main`, flag anything
  checked-but-not-actually-shipped (e.g. a Phase marked complete where a component or route
  referenced no longer matches reality) or stale/superseded entries. Cross-check the "Current
  Phase" / "Last Completed" / "Next" header block at the top of `PLAN.md` still matches the
  actual most-recent completed task.

### 8. Code quality

A passing lint/type-check/build only proves the code compiles cleanly, not that it's precisely
typed, non-duplicated, or free of dead weight — that's what this category covers.

- **Strict typing** — explicit `any` (should already fail lint via
  `@typescript-eslint/no-explicit-any: error` in `.eslintrc.json`, so also check for
  `eslint-disable` comments suppressing it), unsafe `as Type` casts, missing return type
  annotations on exported functions in `/lib`, non-null assertions (`!`) that could be replaced
  with a proper guard, props typed as `object`, `{}`, or overly-broad unions.
- **Code duplication** — repeated logic across `/lib` (e.g. filter/scoring/recommendation
  engines), duplicated fetch/error-handling patterns between the two `app/api/*/route.ts`
  handlers that should share a helper, CSS values duplicated across `.module.css` files instead
  of referencing `styles/tokens.css`, values inlined 3+ times that should be a named constant.
- **Bad patterns** — `useEffect` with missing or overly broad dependency arrays, magic
  numbers/strings (e.g. hardcoded scoring weights, distance thresholds) that should live in
  `/lib` constants, large inline functions that obscure intent, any inline `style=` prop in a
  `.tsx` file (the project convention is CSS Modules only, per PLAN.md's Notes section), unused
  `no-console` overrides.
- **Dead code** — exported symbols from `/lib` or `/components` not imported anywhere in the
  project, commented-out code blocks left in files, leftover scaffolding from earlier phases no
  longer wired into the app.

## Notes

- This is a personal/small project — keep findings proportionate. Don't recommend enterprise-
  scale tooling (e.g. a full CI a11y pipeline) as a "blocker"; note it as a "nice to have" instead
  unless it's actually broken for a real user.
- Cite every finding with a route, file:line, or screenshot — no vague "could be improved"
  entries.
- **Every checklist item must be independently reviewable as one small PR** — same spirit as
  PLAN.md's phased, one-task-at-a-time structure. If a finding is actually a bundle of unrelated
  or large changes (e.g. "add Playwright e2e coverage", "improve accessibility across the app",
  "harden API routes"), split it into several separate `- [ ]` lines, each scoped to a single
  reviewable change (e.g. one line per flow's e2e spec, one line per route's a11y fix, one line
  per API route's validation gap). Never write a checklist item a reviewer couldn't approve or
  reject on its own without also weighing in on unrelated changes bundled into it.
