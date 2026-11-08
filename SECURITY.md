# Security policy

andreassonphoto.com is static: HTML, CSS, a little JavaScript and images on
Cloudflare Pages. There are no accounts, no forms, no database and no server
code, so a hole here would be one that changes what the site serves or what
runs in a visitor's browser. Please report one privately.

## Reporting a vulnerability

Use GitHub's private reporting:
[report a vulnerability](https://github.com/YunusAndreasson/andreassonphoto/security/advisories/new).
Please don't open a public issue.

Include the URL, your browser and OS, what you did, what happened, and what
an attacker would gain. A fix is coordinated with you before anything is
published, and you're credited in the advisory unless you'd rather not be.

## Supported versions

Only what's live at https://andreassonphoto.com, built from `master`. Fixes
go live with the next deploy.

## Scope

In scope:

- the pages, scripts and images served from andreassonphoto.com
- the response headers and redirects in `public/_headers` and
  `public/_redirects`
- the build scripts and this repository's workflows

Out of scope: Cloudflare's platform, the other sites linked from
[/code](https://andreassonphoto.com/code/), which are separate projects, and
reports from automated scanners with no working attack, such as a missing
header that protects nothing on a static page.
