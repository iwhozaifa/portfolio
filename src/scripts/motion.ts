// The motion layer: transform and opacity only, and nothing at all under prefers-reduced-motion
// (the page is complete without it). Three parts:
//  1. entrances: below the first screen, each section's parts rise in once, 70ms apart;
//  2. the hero card scales down toward the bilty stub as the first screen scrolls away;
//  3. the contact photograph drifts a little against the scroll.
// The two scroll-linked moves need GSAP, which is loaded only once the browser is idle after load,
// so it never competes with the first paint.

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function entrances() {
  const parts = 'h2, h3, p, figure, ul, ol, dl, .stop, .proof-row, .panel-sub, .row, .card, .menu li';
  const sections = document.querySelectorAll<HTMLElement>('main > section, main > header, main > figure, footer, .work .panel, .step');
  const fold = window.innerHeight;
  // Read every position first, then write: one layout, not one per element.
  const picked: { el: HTMLElement; i: number }[] = [];
  sections.forEach((section) => {
    let i = 0;
    section.querySelectorAll<HTMLElement>(parts).forEach((el) => {
      if (el.closest('.stage, .board, [data-ui] *') || el.matches('.panels')) return;
      if (el.getBoundingClientRect().top < fold) return;
      picked.push({ el, i: Math.min(i++, 6) });
    });
  });
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('is-in');
      io.unobserve(e.target);
    }),
    { rootMargin: '0px 0px -12% 0px' },
  );
  for (const { el, i } of picked) {
    if (el.parentElement?.closest('[data-reveal]')) continue;
    el.dataset.reveal = '';
    el.style.transitionDelay = `${i * 70}ms`;
    io.observe(el);
  }
}

function whenIdle(fn: () => void) {
  const go = () => ('requestIdleCallback' in window ? requestIdleCallback(fn, { timeout: 2000 }) : setTimeout(fn, 300));
  if (document.readyState === 'complete') go();
  else window.addEventListener('load', go, { once: true });
}

if (!reduce) {
  entrances();
  whenIdle(() => import('./scroll-moves').then((m) => m.start()));
}
