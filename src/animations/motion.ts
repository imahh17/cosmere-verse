// Motion tokens and reduced-motion helpers shared by Astro scripts and React
// islands. Durations, curves and distances live as CSS custom properties in
// src/styles/_variables.scss; GSAP reads them here instead of hard-coding them.
import { CustomEase } from './gsap';

/** Conditions for `gsap.matchMedia()`: animate, or jump to the final state. */
export const MOTION_CONDITIONS = {
  motion: '(prefers-reduced-motion: no-preference)',
  reduced: '(prefers-reduced-motion: reduce)',
} as const;

export function prefersReducedMotion(): boolean {
  return window.matchMedia(MOTION_CONDITIONS.reduced).matches;
}

/** Raw value of a CSS custom property, e.g. readMotionToken('--duration-base'). */
export function readMotionToken(name: string, el: Element = document.documentElement): string {
  return getComputedStyle(el).getPropertyValue(name).trim();
}

/** Time token (`450ms` / `0.45s`) in seconds, the unit GSAP expects. */
export function readDuration(name: string, el?: Element): number {
  const value = readMotionToken(name, el);
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  return value.endsWith('ms') ? amount / 1000 : amount;
}

/** Length token (`2.5rem` / `40px`) in pixels. */
export function readLength(name: string, el?: Element): number {
  const value = readMotionToken(name, el);
  const amount = Number.parseFloat(value);
  if (Number.isNaN(amount)) return 0;
  if (value.endsWith('rem')) {
    return amount * Number.parseFloat(getComputedStyle(document.documentElement).fontSize);
  }
  return amount;
}

/** Unitless numeric token, e.g. `--magnetic-strength`. */
export function readNumber(name: string, el?: Element): number {
  const amount = Number.parseFloat(readMotionToken(name, el));
  return Number.isNaN(amount) ? 0 : amount;
}

const registeredEases = new Set<string>();

/**
 * Turns a `cubic-bezier()` token into a GSAP ease, so CSS transitions and GSAP
 * timelines share the exact same curve. Falls back to GSAP's 'power2.out'.
 */
export function readEase(name: string, el?: Element): string {
  const easeName = name.replace(/^--/, '');
  if (registeredEases.has(easeName)) return easeName;

  const match = /cubic-bezier\(([^)]+)\)/.exec(readMotionToken(name, el));
  if (!match?.[1]) return 'power2.out';

  CustomEase.create(easeName, match[1].replace(/\s+/g, ''));
  registeredEases.add(easeName);
  return easeName;
}
