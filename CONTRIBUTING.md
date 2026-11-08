# Contributing

This is a personal site, so the photographs, poems and copy are the owner's
and pull requests that change them won't be merged. Reports of a typo, a
broken link or a page that misbehaves are welcome as issues, and fixes to
the code as pull requests. For anything bigger than a fix, open an issue
first, so we can agree on the shape before you write the code.

## Build and check

You need Node 22.23.4 or newer (CI runs 26.13.0) and the pnpm in
`package.json`'s `packageManager`.
The photographs aren't in the repository, so a fresh clone builds against
stand-ins: each print's own link preview, copied into the ignored `photos/`.

```sh
pnpm install --frozen-lockfile
pnpm stand-ins
pnpm dev
```

Before a pull request:

- `pnpm verify` passes: `astro check`, the unit tests in `tests/` and the
  build. CI runs the same, on stand-ins.
- A change to a page is checked in a browser at phone and desktop widths.
- One change per pull request, with a commit message in the repository's
  style: one capitalised sentence in the imperative that says what changed
  ("Refine the wall, viewer and header, and move to pnpm", "Update Astro to
  7.4.7 and Wrangler to 4.158.0"), and a body that says why.

## What the site won't do

Some behaviour is deliberate and changes to it need a strong case:

- The photographs stay out of git. Only what the wall needs is versioned:
  titles, order, rows and edge colours in `src/content/gallery/images.json`.
- The hang is set by hand. Every print has its own `order`, and the build
  fails on a tie or a split row rather than pick one.
- A print's year and place come from the photographer or aren't shown. The
  files carry no EXIF, so nothing is guessed.
- Prints are AVIF at quality 70. The encoder's default of 50 smooths away
  the grain they're made of.
- The warm grey wall, the two Garamonds and the spacing stay as they are;
  the tokens live in `src/styles/global.css`.

## Security issues

Not in issues or pull requests: see [SECURITY.md](SECURITY.md).

## Conduct and license

Everyone here follows the [Code of Conduct](CODE_OF_CONDUCT.md). By
contributing code, you agree it's released under the
[MIT license](LICENSE). The content isn't, as LICENSE explains.
