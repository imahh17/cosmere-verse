---
name: Cosmere Verse
description: A scroll-flown camera journey through deep space, one rendered planet and one colour world per stop.
colors:
  space: "#04060c"
  text: "#eef2f8"
  text-muted: "#a9b6cc"
  rule: "rgb(169 182 204 / 0.3)"
  star: "#f3c46b"
  selection: "rgb(243 196 107 / 0.35)"
  scadrial-accent: "#f0906a"
  sel-accent: "#7fdcf2"
  nalthis-accent: "#ff8fbb"
  roshar-accent: "#a8c0ff"
  taldain-accent: "#f4c66f"
  lumar-accent: "#72e8ab"
  komashi-accent: "#c4a8ff"
  canticle-accent: "#ff9f5c"
typography:
  display:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(3.5rem, 9vw, 6rem)"
    fontWeight: 800
    lineHeight: 0.9
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "clamp(1.75rem, 3.2vw, 2.5rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "0.01em"
  label:
    fontFamily: "Big Shoulders Display Variable, Arial Narrow, sans-serif"
    fontSize: "0.9375rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.14em"
  lead:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.3125rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0em"
  body:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
    fontFeature: "tnum"
  small:
    fontFamily: "Atkinson Hyperlegible Next Variable, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.02em"
rounded:
  pill: "999rem"
spacing:
  s: "0.25rem"
  s2: "0.5rem"
  s3: "0.75rem"
  s4: "1rem"
  s6: "1.5rem"
  s8: "2rem"
  s10: "2.5rem"
  section-gap: "5rem"
  safe-area-mobile: "0.75rem"
  safe-area-desktop: "3rem"
  measure: "34rem"
  wrapper-max: "90rem"
components:
  action-link-primary:
    backgroundColor: "{colors.text}"
    textColor: "{colors.space}"
    typography: "{typography.body}"
    rounded: "{rounded.pill}"
    padding: "0 1.5rem"
    height: "3rem"
  action-link-primary-hover:
    backgroundColor: "{colors.star}"
    textColor: "{colors.space}"
  action-link-quiet:
    textColor: "{colors.text}"
    typography: "{typography.body}"
    height: "3rem"
  header-link:
    textColor: "{colors.text}"
    typography: "{typography.small}"
    padding: "0.75rem 0"
  journey-index-link:
    textColor: "{colors.text-muted}"
    typography: "{typography.label}"
    padding: "0.25rem 0"
  journey-index-link-hover:
    textColor: "{colors.text}"
  world-stop-name:
    textColor: "{colors.nalthis-accent}"
    typography: "{typography.display}"
  book-list-year:
    textColor: "{colors.nalthis-accent}"
    typography: "{typography.body}"
  route-step-number:
    textColor: "{colors.scadrial-accent}"
    typography: "{typography.headline}"
---

# Design System: Cosmere Verse

## Overview

**Creative North Star: "The Damped Camera Flight"**

Cosmere Verse plays the category canon straight: blue-black space, a real-time WebGL starfield, procedurally shaded planets with atmospheric rims, and a camera that flies from world to world as the page scrolls. The planets are the navigation; the page travels to them rather than laying them out as a grid. Everything typographic is built to sit beside a lit sphere and stay legible over it.

The system is sparse and dark. One near-black ground, one cool starlight text colour, one warm star gold for interaction, and eight world accents, each applied only inside its own world. Type pairs a huge condensed uppercase display face for names with a hyperlegible sans for everything a person reads. Lines are hairlines; the only rounded shape is the primary action pill. There are no cards, no panels and no box-shadows: depth belongs to the scene.

Motion is the signature. The camera follows scroll through exponential damping (never snapping), the hero copy rises in on a single long ease, and every animated state has a reduced-motion path in which the camera jumps between stops and nothing travels.

**Key Characteristics:**
- Near-black space ground with a full-viewport WebGL backdrop behind all content.
- One colour world per planet, set by a BEM modifier and shared with the planet shader.
- Condensed uppercase display names against hyperlegible sentence-case reading text.
- Hairline rules and leaders instead of containers.
- Scroll-scrubbed, damped camera flight; reduced motion always honoured.

## Colors

A blue-black void lit by cool starlight, a single warm star, and eight saturated world hues that appear only where their world is.

### Primary
- **Star Gold** (`star`): the single interaction signal. Hover fill of the primary action, hover underline of quiet links and header links, focus outline (`--color-focus` shares this value), text caret, the selection tint (`selection`, star gold at 35%), and the fallback accent wherever no world is set (the reading route's current index link, a step without a world).

### Secondary
- **World Accents** (`scadrial-accent`, `sel-accent`, `nalthis-accent`, `roshar-accent`, `taldain-accent`, `lumar-accent`, `komashi-accent`, `canticle-accent`): Ember Coral, Glacier Cyan, Breath Pink, Highstorm Periwinkle, Dayside Amber, Spore Green, Violet Dusk and Furnace Orange. Each is the tint of its own section only: the planet name, the book years and leaders, the "Empieza por" title, the reading-route step number and rule, the world tag, and the journey-index link when that world is current. Each accent sits beside its planet's shader stops (`--planet-<id>-deep|mid|light|atmo|cloud` in `src/styles/_variables.scss`), which the WebGL scene reads directly, so the type and the rendered sphere come from one source.

### Neutral
- **Void Blue-Black** (`space`): page ground, WebGL clear colour, footer surface, and the base of every legibility scrim.
- **Starlight** (`text`): primary text, wordmark, display names outside a world, the primary action's fill, and the starfield's point colour.
- **Nebula Grey-Blue** (`text-muted`): leads, secondary paragraphs, the magic line, index links at rest, footer disclaimer.
- **Hairline Haze** (`rule`): text-muted at 30%; default underline colour, footer top border, scrollbar thumb, and leader fallback.

### Named Rules
**The One Colour World Rule.** A section takes exactly one world accent, through `--world-accent` set by the `world-accent-modifiers` mixin on its block. The accent colours names, numbers, years and rules; it never colours a reading paragraph. Body copy inside a world stays Starlight or Nebula.

**The Tinted Grey Rule.** Secondary text is tinted from the space ground (Nebula Grey-Blue), never a neutral grey.

**The One Star Rule.** Star Gold is the only colour that means "you can act here" outside a world. Within a world, a link's hover may take that world's accent instead.

## Typography

**Display Font:** Big Shoulders Display Variable (with Arial Narrow, sans-serif), self-hosted.
**Body Font:** Atkinson Hyperlegible Next Variable (with system-ui, sans-serif), self-hosted.

**Character:** A tall, condensed poster face shouts the names of worlds; a sans built for legibility carries every sentence a first-time reader must understand. The contrast is the hierarchy.

### Hierarchy
- **Display** (800, clamp 3.5rem to 6rem, 0.9): hero headline, each planet name, the reading-route title. Always uppercase. Planet names take their world accent.
- **Headline** (700 to 800, clamp 1.75rem to 2.5rem, 1): wordmark (800), saga title under a planet name (700), reading-route step numbers (800), footer brand. Always uppercase.
- **Label** (700, 0.9375rem, 0.14em tracking, uppercase): journey-index world names and the world tags on reading-route steps. Names only, never a sentence, and never placed above a heading as a kicker.
- **Lead** (400 or 700, 1.3125rem, 1.5): hero and route leads, planet premise (400); reading-route book titles (700). Leads hold to the 34rem measure.
- **Body** (400 / 700, 1.0625rem, 1.6): default reading text, books lists, primary action label (700). Tabular figures are on globally.
- **Small** (400, 0.8125rem, 1.4, 0.02em): header links on phones, footer disclaimer.

Weights are applied statically (`f(size, weight, true)`); variable-axis settings are not used.

### Named Rules
**The Condensed Shout Rule.** The display face is only ever uppercase and only ever names things: planets, sagas, sections, the brand, worlds in lists. Anything read as a sentence is set in Atkinson, sentence case.

**The Tabular Year Rule.** Years and numbers use tabular figures so book leaders align across a world's list.

**The Balanced Head Rule.** Headings use `text-wrap: balance`; paragraphs and list items use `text-wrap: pretty`.

## Layout

A single centred wrapper (max 90rem) with safe-area gutters of 0.75rem on phones and 3rem from 992px. Every journey stop is at least one small-viewport tall (`100svh`) and separated by a 5rem section gap. Spacing follows dawuti's 0.25rem step (`--s` to `--s10`); components use s2, s3, s4, s6, s8 and s10, with larger spans built as multiples of s10.

**Copy beside the planet (992px and up).** Text holds one column at the 34rem measure, vertically centred in its stop; the planet occupies the opposite side in the scene. Stops alternate: odd stops keep copy left, flipped stops push it right. From 1200px a fixed journey index sits on the right edge (inset 2rem), and flipped copy clears it with a 5rem end margin.

**Copy below the planet (under 992px).** The planet takes the top of each stop; copy starts around 52svh down (40svh on the reading route) and rides a scrim of the space colour (88% to 90%) where it crosses the sphere. The journey index is hidden; the header's two links and the scroll carry navigation.

**The reading route** closes the journey as four columns on desktop, each step joined to the next by its rule; on phones it stacks with a 2.5rem gap.

### Named Rules
**The Planet Owns Half Rule.** Copy never spans the full width of a stop. The measure (34rem) keeps a planet's half of the viewport clear.

## Elevation & Depth

Depth is entirely rendered. The UI layer is flat: no box-shadows, no blurred panels, no layered surfaces. All depth comes from the WebGL scene behind the content: a 3,200-point starfield, planets lit by one shared sun direction with a narrow day/night terminator, and an additive atmospheric rim brighter on the sunlit limb. Planets recede along the camera's axis, so the next worlds sit smaller and dimmer behind the current one. The only CSS depth device is the legibility scrim, a vertical gradient into the space colour where copy overlaps a planet on narrow screens.

### Named Rules
**The One Sun Rule.** Every planet is lit from the same direction. A new world reuses the shared sun and terminator so the system reads as one universe.

**The Flat Interface Rule.** Interface elements carry no shadow or glow; glow belongs to atmospheres in the scene.

## Shapes

The form language is lines and spheres. Rules are hairlines (`--rule-width`, 0.0625rem): the footer top border, link underlines, book-list leaders and reading-route connectors. World-tinted hairlines are drawn at 45% of the accent. The only rounded shape is the pill (`rounded.pill`) of the primary action. Everything else is unbounded type on space: no borders around content, no cards, no corner radii.

### Named Rules
**The Hairline Rule.** A line is always one hairline wide and either Hairline Haze or the world accent at 45%. Thicker strokes appear only in the 2px focus outline and the 1.75 stroke of the descend arrow.

## Components

### Buttons (Action Link)
Two weights of one link: a confident starlight pill and a quiet underlined companion.
- **Shape:** full pill (`rounded.pill`), 3rem minimum height, 1.5rem inline padding.
- **Primary:** Starlight fill, space-coloured bold label; an optional inline SVG arrow (1rem, 1.75 stroke, round caps) marks a link that descends the page.
- **Hover / Focus:** fill turns Star Gold over the fast duration (200ms) on the out-ease; the arrow drops 0.1875rem over the base duration (450ms). Focus shows the global 2px Star Gold outline at a 0.25rem offset. Transitions switch off under reduced motion.
- **Quiet:** Starlight bold label with a hairline underline in Hairline Haze (0.35em offset) that turns Star Gold on hover. Same 3rem height for touch.

### Navigation
- **Header:** absolutely positioned over the hero; wordmark in the headline style at left, two underlined-on-hover text links at right (Small on phones, Body from 992px), 0.75rem vertical hit padding. Underline is transparent at rest and turns Star Gold on hover.
- **Journey Index (1200px and up):** fixed right-edge column of world names in the Label style, right-aligned, Nebula at rest, Starlight on hover, the current world in its own accent (`aria-current`). It fades in once the journey starts and is always visible when focused.

### World Stop (signature)
One section per planet: display name in the world accent, saga title in headline uppercase, premise in Lead, a magic line with a bold Starlight label over Nebula text, the book list, and an "Empieza por" line whose title takes the accent.

### Book List
Table-of-contents rows: title, a flexible hairline leader in the world accent at 45%, and the original year in the accent with tabular figures. Rows sit 0.5rem apart.

### Reading Route
The closing stop. Steps are counted by a CSS counter rendered in the headline style and the world accent, followed (desktop) by a hairline connector to the next step at 45% of that accent. Each step has a bold Lead book link with a hairline underline that takes the world accent on hover, world tags in the Label style (each in its own accent, separated by a middle dot), and a Nebula reason line.

### Cosmos Canvas
A fixed, full-viewport WebGL layer under all content that fades in over the slow duration once its first frame is drawn. Without WebGL or JavaScript it stays empty and the space ground shows through; no content depends on it.

### Motion
- **Tokens:** fast 200ms (hover colour), base 450ms (icon travel, index fade), slow 900ms (reveals, canvas fade); out-ease `cubic-bezier(0.16, 1, 0.3, 1)` for everything; stagger 40ms (title characters) and 90ms (blocks); reveal distance 2.5rem; camera damping 3.2 per second; planet spin 0.035 rad/s. CSS and GSAP read the same custom properties.
- **Entrances:** content rises 2.5rem and fades in with `autoAlpha`, hidden only under `.js-motion`, so it is visible without JavaScript.
- **Reduced motion:** every timeline lives in `gsap.matchMedia()`; the camera jumps between stops and CSS transitions are removed.

## Do's and Don'ts

### Do:
- **Do** set a section's colour world with the `world-accent-modifiers` mixin and read it through `--world-accent`, falling back to Star Gold.
- **Do** add a new world as a full set of `--planet-<id>-deep|mid|light|atmo|accent|cloud` tokens and add its id to `$world-ids`, so the shader and the type share one source.
- **Do** keep reading copy within the 34rem measure and on the opposite side from the planet.
- **Do** put a space-colour scrim behind copy wherever it scrolls over a planet.
- **Do** read every duration, ease and distance from the motion tokens and give each animation a reduced-motion path through `gsap.matchMedia()`.
- **Do** draw icons as inline SVG strokes in `currentcolor`.

### Don't:
- **Don't** present worlds as a row or grid of planet cards; the planets are reached by travelling to them.
- **Don't** colour reading paragraphs with a world accent, or use one world's accent inside another world's section.
- **Don't** use neutral grey for secondary text; use Nebula Grey-Blue.
- **Don't** add box-shadows, glows or blurred panels to interface elements.
- **Don't** set sentences in the display face or in uppercase.
- **Don't** use official cover art, logos, maps or illustrations from Dragonsteel or the publishers (PRODUCT.md constraint, marked there as inferred and pending confirmation).
