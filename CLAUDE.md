# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Photography portfolio site (andreassonphoto.com). **Astro 5 static site** (SSG),
deployed to **Cloudflare Pages** via direct upload. Photos live in `photos/`
organized by quality tier (`tier1_masterpiece_10` … `tier9_decent_6`, plus
`gallery_bw`); site source in `src/` (content collections defined in
`src/content.config.ts`).

## Commands

```bash
pnpm dev       # Start Astro dev server
pnpm build     # astro build + scripts/prune-orphan-images.mjs
pnpm check     # astro check
pnpm preview   # Preview the built site locally
pnpm verify    # check + build (full check — run before finishing)
pnpm deploy    # Build + wrangler pages deploy (see Deploy)
```

## Deploy

`npm run deploy` (or `pnpm deploy`) builds the site and runs
`wrangler pages deploy --branch main`, uploading `dist/` to the
`andreassonphoto` Cloudflare Pages project (config in `wrangler.jsonc`,
`pages_build_output_dir: dist`). No CI — deploys are direct uploads from this
machine. Requires wrangler auth (`wrangler login`).
