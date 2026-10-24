# Project Environment

```json
{
  "project_type": "Astro static website",
  "is_react_native": false,
  "is_native_ios": false,
  "is_native_android": false,
  "package_manager": "pnpm",
  "commands": {
    "start": "pnpm dev",
    "check": "pnpm check",
    "build": "pnpm build",
    "verify": "pnpm verify",
    "preview": "pnpm preview"
  },
  "default_port": 4321,
  "qa": "Chromium through Argent; no repository UI test harness",
  "hosting": "Cloudflare Pages (static dist directory)"
}
```

Astro 7 can run the development server as a background daemon. Read its startup
output for the actual port (4321 may already be occupied). Browser viewport and
accessibility emulation require CDP because Argent does not expose those settings.

Shared UI tokens, type roles, component states and responsive rules live in
`src/styles/global.css`. Identity and navigation live in `src/utils/site.ts`;
gallery ordering and fullscreen transforms live in `src/utils/gallery.ts`.
Use the existing warm grey wall, Garamond faces and restrained spacing consistently.
