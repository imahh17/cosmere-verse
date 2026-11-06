# Project Context & AI Instructions: Cosmere Verse

## 1. Project Overview

**Cosmere Verse** is a front-end-focused static website with a modern, interactive look and GSAP animations. There is no CMS and no i18n. There is no design spec yet: when it exists, it will live in `.claude/design/` (synced from Figma by `wkhs-design-sync`).

## 2. Architecture & Repository Structure

Single **Astro** project (not a monorepo) managed with **pnpm**. Static output only (`output: 'static'`, no adapter).

- `src/pages`: one file per static route.
- `src/layouts`: `BaseLayout.astro` (head, global styles, global scripts).
- `src/components/{atoms,molecules,organisms}`: components with their SCSS next to them. `.astro` by default; React (`.tsx`) only for interactive islands.
- `src/styles`: theme on **dawuti** — `_dawuti.scss` (single configured entry), `_mixins.scss` (for components), `_variables.scss` (tokens), `_fonts.scss`, `_common.scss`, `_motion.scss`, `theme.scss` (global entry).
- `src/animations`: GSAP entry (`gsap.ts`), motion tokens and reduced-motion helpers (`motion.ts`), reusable effects.
- Alias `@/*` → `src/*`.

## 3. Technology Stack & Tooling

- **Package Manager**: `pnpm` (Node from `.nvmrc`).
- **Framework**: Astro (static) + React islands.
- **Language**: TypeScript (Strict mode).
- **Styling**: Sass (SCSS) with BEM convention, dawuti utilities.
- **Animation**: GSAP (+ ScrollTrigger, SplitText, CustomEase) and `@gsap/react`.
- **Lint/format**: ESLint (typescript-eslint strict + eslint-plugin-astro) + Prettier, run on commit by husky + lint-staged.

## 4. Coding Standards & Guidelines

### General & TypeScript

- **Strict Typing**: Never use the `any` type. Be explicit with types, interfaces, and return types.
- **Language**: Write all code, comments, documentation, and commit messages in **English**. User-facing copy is in Spanish.
- **Asynchronous Code**: Always use `async/await`; avoid `.then()` chains.
- **Modularity**: Keep code modular, DRY and reusable.

### Frontend

- Prefer `.astro` components; use React only when the component needs client state or interactivity, hydrated with the lightest `client:*` directive.
- No i18n: copy can live in pages/components, but pass it to components through props.

### Styling & CSS Rules

- **Preprocessors**: Use **Sass (SCSS)**. Styles live in separate files; **inline styles are prohibited**.
- **BEM Methodology**: Always use BEM class naming.
- **Theme Variables**: Never hardcode colors, spacing, typography or motion values. Use the CSS custom properties from `src/styles/_variables.scss` and dawuti's spacing scale.
- **Mixins**: Component styles import `@use 'mixins' as *;`. Never `@use 'pkg:dawuti'` directly — dawuti is configured once in `src/styles/_dawuti.scss`.
- **Units**: Avoid `px` for spacing and sizing; use `rem`/`em`.

### Motion

- Import GSAP only from `@/animations/gsap`.
- Read durations/easings/distances from tokens (`readDuration`, `readEase`, `readLength`, `readNumber`).
- Always handle `prefers-reduced-motion` with `gsap.matchMedia()` + `MOTION_CONDITIONS`.
- Animate `transform`/`opacity` (`autoAlpha`). Hidden initial states only under `.js-motion`.
- Clean up: `mm.revert()` in Astro scripts; `useGSAP` + `contextSafe` in React.

## 5. How to Respond as an AI Assistant

1. **Design first**: Before building a component or screen, read its spec in `.claude/design/` if it exists.
2. **Strictness**: Enforce the coding standards. Styling must use BEM, SCSS, rem units and theme tokens.
3. **TypeScript First**: Always provide fully typed TypeScript.
4. **Verify**: `pnpm check`, `pnpm lint`, `pnpm format:check` and `pnpm build` must pass.
