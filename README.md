# RandomHoliday

A fun, accessible web app that gives users a surprise holiday destination suggestion based on
their budget, departure location, max travel distance, travel style, travel dates, and group
size.

Built with Next.js 16 (App Router) + TypeScript, CSS Modules, and Framer Motion.

See [PLAN.md](./PLAN.md) for the build roadmap and [ROADMAP.md](./ROADMAP.md) for planned
features.

## Requirements

- Node.js 22+
- [Yarn](https://yarnpkg.com/) 1.x (Classic)

This project only uses Yarn — there is no `package-lock.json`, and `npm`/`npx` commands are not
supported.

## Getting started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app. The app works out of the box
with static fallback data — no API keys are required for local development.

### Environment variables

Copy `.env.example` to `.env.local` and fill in any keys for the integrations you want to test:

```bash
cp .env.example .env.local
```

| Variable                              | Used for                                                   | Required?                                            |
| ------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------- |
| `OPENWEATHER_API_KEY`                 | Live seasonal weather on the destination detail modal      | Optional — falls back to a static seasonal estimate  |
| `STRIPE_SECRET_KEY`                   | Server-side Stripe checkout session creation               | Optional — only needed to test the Pro checkout flow |
| `STRIPE_PUBLISHABLE_KEY`              | Client-side Stripe.js                                      | Optional — only needed to test the Pro checkout flow |
| `STRIPE_WEBHOOK_SECRET`               | Verifying incoming Stripe webhook events                   | Optional — only needed to test the webhook handler   |
| `STRIPE_PRO_PRICE_ID`                 | The Stripe Price ID for the RandomHoliday Pro subscription | Optional — only needed to test the Pro checkout flow |
| `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID`    | Google AdSense placeholder slots on the free tier          | Optional                                             |
| `NEXT_PUBLIC_BOOKING_AFFILIATE_ID`    | Booking.com affiliate links on hotel results               | Optional                                             |
| `SKYSCANNER_API_KEY`                  | Skyscanner affiliate API                                   | Optional                                             |
| `NEXT_PUBLIC_SKYSCANNER_AFFILIATE_ID` | Skyscanner affiliate links on flight results               | Optional                                             |
| `NEXT_PUBLIC_APP_URL`                 | Absolute base URL used for OpenGraph/sitemap links         | Defaults to `http://localhost:3000`                  |

Every integration above degrades gracefully to static fallback data when its key is missing, so
the app is fully usable without any of them configured.

## Available scripts

| Command              | Description                                                                                  |
| -------------------- | -------------------------------------------------------------------------------------------- |
| `yarn dev`           | Start the local dev server                                                                   |
| `yarn build`         | Build the production bundle                                                                  |
| `yarn start`         | Run the production build locally                                                             |
| `yarn lint`          | Run ESLint                                                                                   |
| `yarn lint:fix`      | Run ESLint with autofix                                                                      |
| `yarn format`        | Format all files with Prettier                                                               |
| `yarn format:check`  | Check formatting without writing                                                             |
| `yarn typecheck`     | Run the TypeScript compiler in check-only mode                                               |
| `yarn test`          | Run the Vitest unit test suite                                                               |
| `yarn test:watch`    | Run Vitest in watch mode                                                                     |
| `yarn test:coverage` | Run Vitest with the coverage report                                                          |
| `yarn e2e`           | Run the Playwright end-to-end suite (requires `yarn build` first, or run against `yarn dev`) |
| `yarn e2e:ui`        | Run Playwright in UI mode                                                                    |
| `yarn lighthouse`    | Run the Lighthouse CI checks against a production build                                      |

## Project structure

```
app/          Next.js App Router pages and API route handlers
components/   React components, each with its own ComponentName.module.css and tests
lib/          Pure business logic (destination data, scoring, filtering, budget calc) — no DOM deps
styles/       Design tokens (tokens.css) and global styles (globals.css)
tests/        Shared test setup and utilities
e2e/          Playwright end-to-end tests
```

Business logic in `/lib` has no DOM dependencies, so it can be reused as-is in a future React
Native app.

## Testing

- **Unit tests** (Vitest + React Testing Library): `yarn test`. Coverage thresholds are enforced
  by `vitest.config.ts`.
- **End-to-end tests** (Playwright): `yarn e2e`. Covers the happy path, mobile viewport, keyboard
  navigation, and API error states.
- **Accessibility**: axe-core checks run both in the Vitest suite and as part of the Playwright
  e2e suite, targeting WCAG 2.1 AA.

## Deployment (Vercel)

1. Push this repository to GitHub and [import it into Vercel](https://vercel.com/new).
2. Set the framework preset to **Next.js** (auto-detected).
3. Build settings (install/build commands, framework) are pre-configured in [`vercel.json`](./vercel.json),
   and the minimum Node.js version is set via the `engines` field in `package.json` — no manual setup
   is needed.
4. Add the environment variables you need from the table above in the Vercel project's
   **Settings → Environment Variables**, for each environment (Production/Preview/Development)
   you want them in.
5. Set `NEXT_PUBLIC_APP_URL` to your deployed domain (e.g. `https://randomholiday.app`) so
   OpenGraph tags and the sitemap generate absolute URLs correctly.
6. Deploy. Every push to `main` deploys to production; every pull request gets its own preview
   deployment.

Continuous integration (`.github/workflows/ci.yml`) runs lint, typecheck, unit tests, e2e tests,
and Lighthouse CI on every pull request targeting `main`.
