# QuarryOS

**The digital operating system for quarries.** A React + TypeScript front end for granite quarries and the natural-stone trade: blocks, inventory, sales, logistics, machinery, analytics and an intelligence layer, plus a public storefront, QR block pages and a marketplace preview.

Everything runs on **clearly labelled demo data** until you connect a backend.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run typecheck    # strict TypeScript
npm run build        # production build to dist/
```

Open **Log in** and pick a role under "Explore the demo workspace". Use the account menu to switch roles and watch the navigation change.

Try: `/` · `/app` · `/app/blocks/GR-1042` · `/b/GR-1042` (the QR destination) · `/quarry/meridian-granites` · `/marketplace`

## Connecting real services

Copy `.env.example` to `.env.local`.

| Variable | Effect |
| --- | --- |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Turns on real sign-in and sign-up. Roles are read from `app_metadata.role`; unknown means `worker`. |
| `VITE_API_BASE_URL` | Base URL of your FastAPI service, used by `src/services/http.ts`. |

Only public (anon) values belong in the browser. `supabase/schema.sql` is a reference schema with row-level security.

## Architecture

```
src/
  pages/            marketing/ · auth/ · app/ · public/     (each page is its own lazy chunk)
  layouts/          MarketingLayout · AppLayout (sidebar, topbar, mobile nav, intelligence drawer)
  components/
    ui/             Button, Card, Modal, Toast, Tabs, Field, Skeleton, EmptyState…  (shadcn-style primitives)
    common/         DataTable, StatCard, Timeline, StoneSwatch, BlockQR, PageHeader…
    charts/         Recharts wrappers + design-token colours
    three/          Granite3D (lazy) · GraniteScene (R3F) · CSS/SVG fallback
    intelligence/   chat, answer cards, drawer provider
    marketing/      hero and landing sections
  services/         api.ts  ← the only data boundary pages use; swap bodies for fetch calls
                    intelligence.ts · http.ts
  data/             demo dataset (seeded, deterministic, anchored to 19 Sep 2026)
  auth/             AuthProvider (Supabase or demo), permissions matrix, route guards
  hooks/  lib/  types/
```

**Going live** means replacing the bodies in `src/services/api.ts` with `request<T>('/v1/…')`. Signatures, models (`src/types/models.ts`) and pages stay the same.

## Design system

Tokens are RGB triplets in `src/index.css` (obsidian, graphite, bone, sand, titanium, and a cyan used only for intelligence). `data-theme="light"` values are defined but chart colours are not themed yet. Type is Geist (variable, self-hosted). Motion honours `prefers-reduced-motion` via `MotionConfig` and the count-up hook.

## What is real and what is not

Working in the demo: navigation and role-based access, block search and filters, block detail with 3D viewer and timeline, QR generation, quotation builder with live totals, order and trip status changes, payments, machinery alerts, analytics, storefront and marketplace filtering, and Quarry Intelligence.

**Quarry Intelligence is not an AI model.** It answers a fixed set of questions by running deterministic analyses over the demo dataset, and says so in the UI.

Not built: persistence (edits reset on reload), PDF export (a print-ready preview exists), camera QR scanning, file/photo upload (block images are procedurally painted placeholders), email sending, marketplace payments, light theme, and the FastAPI service.

Role checks in the UI are for navigation only. Enforce the same rules in the API and with Postgres RLS.

## Accessibility and performance

Keyboard-operable controls, visible focus, skip links, labelled form fields, dialog focus trap, table captions and sortable-header semantics, `aria-live` for results and toasts. The 3D scene is lazy-loaded in its own chunk, pauses off-screen, and falls back to a static illustration on WebGL failure, low-power touch devices or Save-Data.
