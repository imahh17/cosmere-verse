// Single GSAP entry point. Import `gsap` and its plugins from here, never from
// 'gsap' directly, so plugins are registered exactly once.
//
// Registration only happens in the browser: React islands are also rendered
// on the server at build time, and GSAP plugins need `window`.
import { gsap } from 'gsap';
import { CustomEase } from 'gsap/CustomEase';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(CustomEase, ScrollTrigger, SplitText);
}

export { gsap, CustomEase, ScrollTrigger, SplitText };
