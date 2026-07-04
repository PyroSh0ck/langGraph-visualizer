# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

`langgraph-visualizer` — a canvas-based visualizer for LangGraph graphs. Early stage: the app is currently a `create-next-app` scaffold with `frontend/src/app/page.tsx` rendering a bare `<canvas>` where the graph drawing/interaction logic will live.

The entire app lives under `frontend/` — there is no separate backend in the repo yet. Run all commands from `frontend/`.

## ⚠️ Next.js version

This uses **Next.js 16** (`next@16.2.9`, React 19), which has breaking changes vs. older versions in your training data. Before writing Next.js code, read the relevant guide in `frontend/node_modules/next/dist/docs/` and heed deprecation notices — APIs, conventions, and file structure may differ from what you expect. This warning is also enforced via `frontend/AGENTS.md` (imported by `frontend/CLAUDE.md`).

## Commands

Package manager is **pnpm** (see `pnpm-lock.yaml` / `pnpm-workspace.yaml`). Run from `frontend/`:

```bash
pnpm install        # install deps
pnpm dev            # dev server at http://localhost:3000
pnpm build          # production build
pnpm start          # serve production build
pnpm lint           # ESLint (flat config, eslint-config-next)
```

There is no test runner configured yet.

## Stack notes

- **App Router** under `src/app/` (`layout.tsx`, `page.tsx`, `globals.css`). `page.tsx` is a client component (`"use client"`) because it uses canvas refs/effects.
- **Tailwind CSS v4** via `@tailwindcss/postcss` (configured in `postcss.config.mjs`; no `tailwind.config` file — v4 is CSS-first).
- **TypeScript** with `strict` mode and the `@/*` → `./src/*` path alias.
