# AGENTS.md

## Cursor Cloud specific instructions

This is a static HTML site for Genki Japanese language study resources. It uses `serve` for local dev and has ESLint + Prettier for code quality.

### Running the app

```bash
cd /agent/repos/studyresources
pnpm dev
```

This runs `npx serve .` which may prompt to install `serve` on first run (answer `y`). Port defaults to 3000, but will auto-pick another port if 3000 is in use.

### Lint / Test

- `npx eslint .` — ESLint (passes cleanly)
- `pnpm test` — Runs `node scripts/inject.js --test` to verify HTML injection consistency (should report "0/937 would change")

### Scripts

- `pnpm minify` / `pnpm minified` — Minification utilities
- `pnpm inject` / `pnpm build` — HTML injection scripts

### Notes

- This is a purely static site (HTML/CSS/JS). No build step is strictly required for development.
- The `scripts/inject.js` script checks whether HTML files need header/footer injection updates.
