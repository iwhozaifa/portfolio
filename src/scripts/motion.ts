// The motion layer: transform and opacity only, and nothing at all under prefers-reduced-motion
// (the page is complete without it). Three parts:
//  1. entrances: below the first screen, each section's parts rise in once, 70ms apart;
//  2. the hero card scales down toward the bilty stub as the first screen scrolls away;
//  3. the contact photograph drifts a little against the scroll.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function entrances() {
  const parts = 'h2, h3, p, figure, ul, ol, dl, .stop, .proof-row, .panel-sub, .row, .card, .menu li';
  const sections = document.querySelectorAll<HTMLElement>('main > section, main > header, main > figure, footer, .work .panel, .step');
  const fold = window.innerHeight;
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  sections.forEach((section) => {
    let i = 0;
    section.querySelectorAll<HTMLElement>(parts).forEach((el) => {
      // Only what starts below the first screen, and never inside the sticky stage or a pinned board.
      if (el.getBoundingClientRect().top < fold || el.closest('.stage, .board, [data-ui] *') || el.matches('.panels')) return;
      if (el.parentElement?.closest('[data-reveal]')) return;
      el.dataset.reveal = '';
      el.style.setProperty('--i', String(Math.min(i++, 6)));
      el.style.transitionDelay = `${Math.min(i, 6) * 70}ms`;
      io.observe(el);
    });
  });
}

function heroCard() {
  const card = document.querySelector<HTMLElement>('[data-hero-card]');
  const hero = card?.closest('section');
  if (!card || !hero) return;
  // The card stays opaque while it shrinks toward the stub, and fades only at the end of the move,
  // so its text is never left half-transparent over the photograph.
  const tl = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom 35%', scrub: 0.5 } });
  tl.to(card, { scale: 0.6, yPercent: 18, transformOrigin: '100% 100%', ease: 'none', duration: 1 }, 0)
    .to(card, { opacity: 0, ease: 'none', duration: 0.3 }, 0.7);
}

function contactDrift() {
  const photo = document.querySelector<HTMLElement>('.contact-photo');
  const section = photo?.closest('section');
  if (!photo || !section) return;
  gsap.fromTo(photo, { yPercent: -4, scale: 1.1 }, {
    yPercent: 4,
    scale: 1.1,
    ease: 'none',
    scrollTrigger: { trigger: section, start: 'top bottom', end: 'bottom top', scrub: true },
  });
}

if (!reduce) {
  gsap.registerPlugin(ScrollTrigger);
  entrances();
  heroCard();
  contactDrift();
}
