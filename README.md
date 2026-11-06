# Cosmere Verse

Static front-end website built with **Astro** + **React** islands, **SCSS on dawuti** and **GSAP** animations. No CMS, no i18n, no SSR: every page is prerendered to HTML at build time.

## Requirements

- **Node ≥ 22.23.4** (Astro 7). `.nvmrc` pins `v24` → run `nvm use`.
- **pnpm 11** (`packageManager` in `package.json`; pnpm ≥ 9.7 or Corepack switches to it automatically).

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
├── animations/        GSAP: single entry (gsap.ts), motion tokens & reduced-motion
│                      helpers (motion.ts), reusable effects (reveal.ts, hero-intro.ts)
├── components/
│   ├── atoms/         Smallest pieces. React islands live here too (MagneticButton)
│   ├── molecules/
│   └── organisms/     Page sections (Hero, FeatureGrid)
├── layouts/           BaseLayout.astro: <head>, global styles, global scripts
├── pages/             One file = one static route
└── styles/
    ├── theme.scss     Global entry (imported once by BaseLayout)
    ├── _dawuti.scss   The ONLY place dawuti is configured
    ├── _mixins.scss   What component stylesheets import (`@use 'mixins' as *;`)
    ├── _variables.scss  Design tokens as CSS custom properties (provisional)
    ├── _fonts.scss, _common.scss, _motion.scss
    └── pages/         Page-specific styles
```

Each component keeps its stylesheet next to it (`Hero/Hero.astro` + `Hero/Hero.scss`). The `@/*` alias points to `src/*`.

## Conventions (WKHS)

- **Astro by default, React only for interactivity.** Hydrate islands with the lightest directive that works (`client:visible`, `client:idle`…).
- **SCSS + BEM**, styles in separate files, **no inline styles**, `rem` instead of `px`.
- **Tokens only**: colours, spacing, type and motion come from `_variables.scss` (custom properties) and dawuti's spacing scale (`--s`, `--s2`…, `--gap`, `--safe-area`). Never hard-code them.
- **dawuti is configured once** in `_dawuti.scss`. Components `@use 'mixins' as *;` — never `@use 'pkg:dawuti'` directly.
- **TypeScript strict**, no `any`, explicit return types; code, comments and commits in English.
- No secrets in the repo: `.env*` files are git-ignored.

## Animations (GSAP)

- Always import from `@/animations/gsap`: it registers `ScrollTrigger`, `SplitText` and `CustomEase` once, in the browser only.
- Durations, easings, distances and staggers are **read from CSS tokens** (`readDuration`, `readEase`, `readLength`, `readNumber`), so CSS transitions and GSAP share the same values. `readEase` turns a `cubic-bezier()` token into a GSAP ease.
- **Reduced motion is mandatory**: wrap animations in `gsap.matchMedia()` with `MOTION_CONDITIONS` and jump to the final state when `reduced` is true.
- **No invisible content without JS**: elements animated in (`data-reveal`, `data-hero-intro`) start hidden only under the `js-motion` class, which an inline script in `BaseLayout` adds when motion is allowed.
- **Cleanup**: Astro scripts return a revert function (`mm.revert()`); React islands use `useGSAP` (auto-revert on unmount) and `contextSafe` for event handlers.
- Scroll reveal: add `data-reveal` to any element; `initReveal()` runs on every page from `BaseLayout`.

## Pending

- Design tokens, fonts and breakpoints are **placeholders**. When `.claude/design/` exists, port it with the `dev-create-design-tokens` skill (wkhs-dev).
- The home page is a **demo** of the stack; replace it with the real content.

## Measuring quality

Run Lighthouse against the production build, not the dev server:

```bash
pnpm build && pnpm preview
npx lighthouse http://localhost:4321 --preset=desktop --only-categories=performance,accessibility,best-practices,seo --view
```

Suggested baseline: ≥ 95 in every category on desktop and ≥ 90 on mobile (`--form-factor=mobile`), CLS ≈ 0 and LCP < 2.5 s. Also check the page with `prefers-reduced-motion: reduce` enabled (DevTools → Rendering): all content must be visible and static.
