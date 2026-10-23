// The two scroll-linked moves, loaded lazily by motion.ts.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function start() {
  gsap.registerPlugin(ScrollTrigger);

  const card = document.querySelector<HTMLElement>('[data-hero-card]');
  const hero = card?.closest('section');
  if (card && hero) {
    // The card stays opaque while it shrinks toward the stub, and fades only at the end of the move,
    // so its text is never left half-transparent over the photograph.
    const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 35%', scrub: 0.5 } });
    tl.to(card, { scale: 0.6, yPercent: 18, transformOrigin: '100% 100%', ease: 'none', duration: 1 }, 0)
      .to(card, { opacity: 0, ease: 'none', duration: 0.3 }, 0.7);
  }

  const photo = document.querySelector<HTMLElement>('.contact-photo');
  const section = photo?.closest('section');
  if (photo && section) {
    gsap.fromTo(photo, { yPercent: -4, scale: 1.1 }, {
      yPercent: 4,
      scale: 1.1,
      ease: 'none',
      scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
    });
  }
}
