// Intro timeline for the hero: the title rises word by word from behind a
// line mask, then the rest of the `data-hero-intro` elements fade up.
import { gsap, SplitText } from './gsap';
import { MOTION_CONDITIONS, readDuration, readEase, readLength } from './motion';

export async function initHeroIntro(hero: HTMLElement): Promise<() => void> {
  const title = hero.querySelector<HTMLElement>('[data-hero-title]');
  const rest = gsap.utils.toArray<HTMLElement>(
    hero.querySelectorAll('[data-hero-intro]:not([data-hero-title])'),
  );

  // Split only once the final font is in place, or line breaks would shift.
  await document.fonts.ready;

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    const reduced = context.conditions?.reduced === true;
    const all = title ? [title, ...rest] : rest;

    if (reduced) {
      gsap.set(all, { autoAlpha: 1 });
      return;
    }

    const ease = readEase('--ease-out');
    const tl = gsap.timeline({ defaults: { ease, duration: readDuration('--duration-slow') } });

    if (title) {
      // aria: 'auto' keeps the full sentence readable by screen readers.
      const split = SplitText.create(title, { type: 'lines,words', mask: 'lines', aria: 'auto' });
      tl.set(title, { autoAlpha: 1 }).from(split.words, {
        yPercent: 110,
        stagger: readDuration('--stagger-sm'),
      });
    }

    tl.fromTo(
      rest,
      { autoAlpha: 0, y: readLength('--reveal-distance') },
      { autoAlpha: 1, y: 0, stagger: readDuration('--stagger-md') },
      // Overlap with the end of the title by one base duration.
      title ? `-=${readDuration('--duration-base')}` : 0,
    );
    // SplitText created inside matchMedia is reverted with it (original markup back).
  });

  return () => mm.revert();
}
