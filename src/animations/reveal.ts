// Scroll reveal for any element with `data-reveal`.
//
// Elements entering the viewport together are staggered as one batch. With
// reduced motion they are simply shown. Returns a cleanup function that
// reverts every tween and ScrollTrigger it created.
import { gsap, ScrollTrigger } from './gsap';
import { MOTION_CONDITIONS, readDuration, readEase, readLength } from './motion';

export function initReveal(root: ParentNode = document): () => void {
  const targets = gsap.utils.toArray<HTMLElement>(root.querySelectorAll('[data-reveal]'));
  if (targets.length === 0) return () => undefined;

  const mm = gsap.matchMedia();

  mm.add(MOTION_CONDITIONS, (context) => {
    const reduced = context.conditions?.reduced === true;

    if (reduced) {
      gsap.set(targets, { autoAlpha: 1 });
      return;
    }

    const distance = readLength('--reveal-distance');
    const duration = readDuration('--duration-slow');
    const stagger = readDuration('--stagger-md');
    const ease = readEase('--ease-out');

    gsap.set(targets, { autoAlpha: 0, y: distance });

    ScrollTrigger.batch(targets, {
      start: 'top 85%',
      once: true,
      onEnter: (batch) => {
        gsap.to(batch, { autoAlpha: 1, y: 0, duration, ease, stagger, overwrite: true });
      },
    });
  });

  return () => mm.revert();
}
