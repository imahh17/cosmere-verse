# Cosmere Verse

Spanish-language fan website about Brandon Sanderson's Cosmere. The home is a scroll-driven WebGL journey: the camera flies from planet to planet, each stop presents a world (saga, premise, magic, books with their original year) and the page closes on a four-step reading route for newcomers.

Static site built with **Astro** (+ **React** islands when needed), **SCSS on dawuti**, **GSAP** and **three.js**. No CMS, no i18n, no SSR: every page is prerendered to HTML at build time.

Unofficial: no affiliation with Brandon Sanderson, Dragonsteel Entertainment or their publishers.

## Requirements

- **Node ≥ 22.23.4** (Astro 7). `.nvmrc` pins `v24` → run `nvm use`.
- **pnpm 11** (`packageManager` in `package.json`; pnpm ≥ 9.7 or Corepack switches to it automatically).

> The husky pre-commit hook uses the `node` on your `PATH`. Run `nvm use` in the shell you commit from: with an older system Node, lint-staged fails.

## Commands

| Command             | What it does                                       |
| ------------------- | -------------------------------------------------- |
| `pnpm install`      | Install dependencies (also sets up the husky hook) |
| `pnpm dev`          | Dev server at `http://localhost:4321`              |
| `pnpm build`        | Static build into `dist/`                          |
| `pnpm preview`      | Serve `dist/` locally                              |
| `pnpm check`        | `astro check` (types in `.astro`, `.ts`, `.tsx`)   |
| `pnpm lint`         | ESLint (typescript-eslint strict + astro)          |
| `pnpm lint:fix`     | ESLint with autofix                                |
| `pnpm format`       | Prettier write                                     |
| `pnpm format:check` | Prettier check                                     |

On every commit, husky + lint-staged run ESLint and Prettier on the staged files.

## Structure

```
src/
├── animations/
│   ├── gsap.ts          Single GSAP entry (registers plugins once, browser only)
│   ├── motion.ts        Token readers + reduced-motion helpers
│   ├── reveal.ts        Scroll reveal for [data-reveal]
│   ├── hero-intro.ts    Hero title intro (SplitText)
│   └── cosmos/          WebGL journey: scene + camera (cosmos-scene.ts), GLSL (planet-shaders.ts)
├── components/
│   ├── atoms/           ActionLink
│   ├── molecules/       BookList, JourneyIndex
│   └── organisms/       SiteHeader, CosmosHero, CosmosCanvas, WorldStop, ReadingRoute, SiteFooter
├── data/worlds.ts       Worlds, books and reading route (the page's content)
├── layouts/             BaseLayout.astro: <head>, fonts, global styles, global scripts
├── pages/               One file = one static route
└── styles/
    ├── theme.scss       Global entry (imported once by BaseLayout)
    ├── _dawuti.scss     The ONLY place dawuti is configured
    ├── _mixins.scss     What component stylesheets import (breakpoints, world ids, world-accent mixin)
    ├── _variables.scss  Design tokens as CSS custom properties
    └── _fonts.scss, _common.scss, _motion.scss
```

Each component keeps its stylesheet next to it (`WorldStop/WorldStop.astro` + `WorldStop/WorldStop.scss`). The `@/*` alias points to `src/*`.

Design records at the root: `PRODUCT.md` (who the site is for and what it must do) and `DESIGN.md` (the visual system as built). Read them before changing the UI.

## Visual system

- **Ground**: deep blue-black space. One interaction colour, star gold (`--color-star`), also used for focus and selection.
- **One colour world per planet**: `--planet-<id>-deep|mid|light|atmo|cloud|accent`. The shader colours and the section accent come from the same tokens. In SCSS, `@include world-accent-modifiers;` emits a `--<id>` BEM modifier per world that sets `--world-accent`.
- **Type**: Big Shoulders Display (uppercase display, labels) and Atkinson Hyperlegible Next (reading), both self-hosted with Fontsource and imported in `BaseLayout`.
- **Adding a world**: add it to `WorldId` and `worlds` in `src/data/worlds.ts`, to `$world-ids` in `_mixins.scss`, its `--planet-<id>-*` tokens in `_variables.scss` and its look in `LOOKS` (`cosmos-scene.ts`).

## WebGL journey (three.js)

- `CosmosCanvas` mounts a fixed canvas and **lazy-loads** the scene (three.js lives in its own chunk, after first paint).
- Scroll anchors are the elements with `data-cosmos-stop` (hero, one per world, closing route). The camera follows the scroll with damping (`--camera-damping`) and smoothsteps between stops.
- Planets are procedural (3D simplex noise); no raster assets ship. Route steps declare `data-route-worlds` to place and highlight their worlds in the closing line-up.
- **Reduced motion**: the camera jumps between stops, nothing spins or twinkles, and the scene only redraws when something changes. **Without WebGL or JavaScript** the canvas stays empty and every word is still readable.

## Conventions (WKHS)

- **Astro by default, React only for interactivity.** Hydrate islands with the lightest directive that works (`client:visible`, `client:idle`…).
- **SCSS + BEM**, styles in separate files, **no inline styles**, `rem` instead of `px`.
- **Tokens only**: colours, spacing, type and motion come from `_variables.scss` (custom properties) and dawuti's spacing scale (`--s`, `--s2`…, `--gap`, `--safe-area`). Never hard-code them.
- **dawuti is configured once** in `_dawuti.scss`. Components `@use 'mixins' as *;` — never `@use 'pkg:dawuti'` directly.
- **TypeScript strict**, no `any`, explicit return types; code, comments and commits in English. User-facing copy in Spanish, passed to components through props.
- No secrets in the repo: `.env*` files are git-ignored.

## Animations (GSAP)

- Always import from `@/animations/gsap`: it registers `ScrollTrigger`, `SplitText` and `CustomEase` once, in the browser only.
- Durations, easings, distances and staggers are **read from CSS tokens** (`readDuration`, `readEase`, `readLength`, `readNumber`), so CSS transitions, GSAP and the WebGL scene share the same values. `readEase` turns a `cubic-bezier()` token into a GSAP ease.
- **Reduced motion is mandatory**: wrap animations in `gsap.matchMedia()` with `MOTION_CONDITIONS` and jump to the final state when `reduced` is true.
- **No invisible content without JS**: elements animated in (`data-reveal`, `data-hero-intro`) start hidden only under the `js-motion` class, which an inline script in `BaseLayout` adds when motion is allowed.
- **Cleanup**: Astro scripts return a revert function (`mm.revert()`); React islands use `useGSAP` (auto-revert on unmount) and `contextSafe` for event handlers.

## Design work with Impeccable

The [Impeccable](https://github.com/pbakaus/impeccable) skill (v4.8.0) is vendored in `.claude/skills/impeccable`, with its subagents in `.claude/agents`. In Claude Code:

```
/impeccable critique the reading route
/impeccable polish the header
/impeccable audit the home
```

- It reads `PRODUCT.md`, `DESIGN.md` and the surface brief in `.impeccable/surfaces/`. Keep them committed and up to date.
- The engine binary is **not** in the repo: the launcher downloads it once per machine (into `~/.impeccable/`) and checks it against `engine-checksums.txt`.
- Slop detector, no agent needed (`detect` on a URL needs Chrome installed):

  ```bash
  .claude/skills/impeccable/scripts/impeccable detect --json src/
  .claude/skills/impeccable/scripts/impeccable detect --json http://localhost:4321
  ```

- `.impeccable/mocks/`, `.impeccable/review/` and `.impeccable/questions/` are local working files and are git-ignored. ESLint and Prettier skip the vendored skill, `.impeccable/` and `DESIGN.md`.
- To update the skill, copy the new `.claude/skills/impeccable` from upstream over this one and commit it as its own change.

## Pending

- **No Figma spec yet.** When `.claude/design/` exists, port its tokens with the `dev-create-design-tokens` skill (wkhs-dev) and keep the token names, or rename them in the same change.
- **"No official art"** is an assumption recorded in `PRODUCT.md`. Confirm it before adding any covers, maps or illustrations.
- Book titles and years have not been checked against an external source yet.
- The three.js chunk is over 500 kB minified (lazy-loaded). The Impeccable design hook (automatic checks on every UI edit) is not installed.
- `DESIGN.md` lists small drifts left as they are: a few literal sizes instead of tokens, and px breakpoints.

## Measuring quality

Run Lighthouse against the production build, not the dev server:

```bash
pnpm build && pnpm preview
npx lighthouse http://localhost:4321 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --view
```

Suggested baseline: ≥ 95 in every category on desktop and ≥ 90 on mobile (`--form-factor=mobile`), CLS ≈ 0 and LCP < 2.5 s. Also check the page with `prefers-reduced-motion: reduce` enabled (DevTools → Rendering): all content must be visible and the scene static. To see whether the home does its job, track how many visits reach the reading route (`#ruta`) and click one of its steps.
