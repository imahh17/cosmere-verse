# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Primary: a reader who has heard about the Cosmere (Brandon Sanderson's shared universe of novels) and has not started yet, or has read one book and does not know what comes next. They arrive curious and slightly intimidated by the size of the universe. Their job: understand what the Cosmere is in a minute and pick one book to start with.

Secondary (not the target of the home): readers who already know the Cosmere and come to explore worlds and connections.

## Product Purpose

Cosmere Verse is a fan website (Spanish-language) that makes the Cosmere approachable. Success for the home: a first-time visitor leaves knowing what the Cosmere is, that each saga can be read on its own, and which book they will start with.

## Positioning

An unofficial, Spanish-language entry door: instead of a wiki that assumes you already know everything, it answers "¿por dónde empiezo?" with a clear, opinionated path, and only then opens the bigger map of worlds.

## Operating Context

Visitors read on phone and desktop, often arriving from a recommendation (a friend, a forum, a bookshop table). The books are published in Spanish by Nova; the visitor will go buy or borrow a physical or ebook copy after the visit.

## Capabilities and Constraints

- Static Astro site, no CMS, no i18n; copy in Spanish, code in English (see `.claude/CLAUDE.md`).
- GSAP for motion, React only for interactive islands; reduced motion always respected.
- Fan site, not official (inferred, confirm): no official cover art, logos, maps or illustrations from Dragonsteel or the publishers; no long quotations from the books.
- Undecided: navigation and inner routes (worlds, reading guide, glossary) do not exist yet.

## Brand Commitments

- Standing visual preference (chosen 2026-11-06 over two rolled alternatives): the category standard for a space/fantasy universe — deep space, rendered planets, a scroll journey from world to world — executed without irony at the craft level of award-winning WebGL sites (Active Theory, Lusion, Igloo Inc.).

## Evidence on Hand

- Public bibliographic facts about the Cosmere books, worlds and magic systems (titles, publication order, which saga belongs to which world).
- No photographs, illustrations or brand assets exist in the repo. Any illustrative material must be authored and labelled; never invent reader counts, reviews, rankings or endorsements.

## Product Principles

1. One door before the map: answer "¿por dónde empiezo?" before showing the whole universe.
2. Each saga stands on its own; connections are a reward, never a prerequisite.
3. No spoilers on the home.
4. Facts are checkable: titles, dates and worlds must be accurate.

## Accessibility & Inclusion

Inclusive Spanish (gender-neutral forms first, generic feminine where a gendered form is needed). Respect `prefers-reduced-motion`; content must be readable without JavaScript.
