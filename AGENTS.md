# Repository Guidelines

## Project Structure & Module Organization

This repository contains the IGEAD-MT church website, built with React 19, TypeScript, Vite, and Tailwind CSS 4.

- `src/components/`: page sections and reusable UI components.
- `src/services/`: Bible, prayer, YouTube, and daily-word integrations; WhatsApp providers live in `src/services/whatsapp/`.
- `src/contexts/`, `src/hooks/`, `src/constants/`, and `src/types/`: shared state, hooks, configuration, and types.
- `src/lib/supabaseClient.ts`: browser Supabase client.
- `public/`: static assets, Bible JSON datasets, PWA icons, manifest, and service worker.
- `supabase/migrations/` and `supabase/functions/`: database changes and the WhatsApp daily-word function.
- Tests are colocated with services as `*.test.ts`; production output goes to `dist/`.

## Build, Test, and Development Commands

Install dependencies before running these commands; the repository includes `bun.lock`.

- `bun install`: install dependencies using Bun.
- `npm run dev`: start Vite on port 3000, listening on all interfaces.
- `npm run build`: create the production bundle in `dist/`.
- `npm run preview`: serve the production build locally.
- `npm run lint`: run TypeScript checking with `tsc --noEmit`; this is not ESLint.
- `npx tsx --test src/services/*.test.ts src/services/whatsapp/*.test.ts`: run the existing service tests.

Production builds default to `/SITE_IGEAD/`; set `VITE_BASE_PATH` for other deployment paths.

## Coding Style & Naming Conventions

Follow existing two-space indentation, single quotes, and semicolons. Use PascalCase for React component files, camelCase for services and functions, and `use` prefixes for hooks. Keep shared types in `src/types/` and integration logic in services. Preserve Portuguese interface wording. No dedicated formatter or ESLint configuration is present.

## Testing Guidelines

Tests use `node:test` and `node:assert/strict`, executed through `tsx`. Name tests after observable behavior and cover formatting, permissions, and provider failures when changing integrations. No coverage threshold is configured. Run relevant tests, type checking, and the production build before submitting. The root TypeScript configuration excludes `supabase/`; validate function changes separately.

## Commit & Pull Request Guidelines

History uses concise prefixes such as `feat:`, `style:`, and `build:`. Follow that pattern with an imperative summary. PRs should describe behavior changes, link relevant issues, and report validation commands and results. Include screenshots for UI changes and explain migration or configuration requirements.

## Security & Configuration

Use `.env.example` as a configuration reference; keep local environment files untracked. Treat all `VITE_*` values as browser-visible. Keep privileged credentials in server-side configuration and avoid logging prayer details or authentication tokens.
