# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Photography portfolio site (andreassonphoto.com). **Astro 7 static site** (SSG),
deployed to **Cloudflare Pages** via direct upload. Photos live in `photos/`,
which is outside git (`.gitignore`), organized by quality tier
(`tier1_masterpiece_10` … `tier9_decent_6`, plus `gallery_bw`, which
`src/assets/gallery_bw` links to); site source in `src/` (content collections
defined in `src/content.config.ts`). Without the photos (a fresh clone, CI),
`pnpm stand-ins` fills each missing print with its link preview so the build
runs; it never overwrites a file that exists.

Shared UI tokens, type roles, component states and responsive rules live in
`src/styles/global.css`. Identity and navigation live in `src/utils/site.ts`;
gallery ordering and fullscreen transforms live in `src/utils/gallery.ts`.
Use the existing warm grey wall, Garamond faces and restrained spacing
consistently.

## Commands

```bash
pnpm dev       # Start Astro dev server (read its output for the port; 4321 may be taken)
pnpm build     # astro build + scripts/prune-orphan-images.mjs
pnpm check     # astro check
pnpm test      # node --test tests/
pnpm preview   # Preview the built site locally
pnpm verify    # check + test + build (full check — run before finishing)
pnpm stand-ins # Stand-in prints for a tree without photos/
pnpm run deploy    # Build + wrangler pages deploy (see Deploy)
```

## Deploy

`pnpm run deploy` builds the site and runs
`wrangler pages deploy --branch main`, uploading `dist/` to the
`andreassonphoto` Cloudflare Pages project (config in `wrangler.jsonc`,
`pages_build_output_dir: dist`). The `run` matters: a bare `pnpm deploy` is
pnpm's own workspace command. CI (`.github/workflows/verify.yml`) only runs
`pnpm verify` on stand-ins; deploys are direct uploads from this machine.
Requires wrangler auth (`wrangler login`).

## Open source

The repository is public. MIT covers the code; the photographs, poems and marks
are all rights reserved ([NOTICE.md](NOTICE.md)).

- New photographs and writing fall under that notice. Anything by someone else
  needs a licence that lets it be redistributed here, and a line in NOTICE.md.
- Dependabot opens grouped pull requests weekly. `.github/dependabot.yml` holds
  TypeScript back until `astro check` supports its native compiler. A merge
  deploys nothing; `pnpm run deploy` does.
