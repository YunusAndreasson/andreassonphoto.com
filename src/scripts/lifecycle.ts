// Each Astro navigation owns its listeners, observers and scheduled work.
// Dispose before the old DOM is swapped out, including pending image loads.
export function onPageLoad(setup: (signal: AbortSignal) => void) {
  let controller: AbortController | undefined;
  document.addEventListener('astro:before-swap', () => controller?.abort());
  document.addEventListener('astro:page-load', () => {
    controller?.abort();
    controller = new AbortController();
    setup(controller.signal);
  });
}

// Coalesce events into one update per frame and cancel it on navigation.
export function frameQueue(update: () => void, signal: AbortSignal) {
  let frame: number | undefined;
  signal.addEventListener('abort', () => {
    if (frame !== undefined) cancelAnimationFrame(frame);
  }, { once: true });
  return () => {
    if (signal.aborted || frame !== undefined) return;
    frame = requestAnimationFrame(() => {
      frame = undefined;
      if (!signal.aborted) update();
    });
  };
}

export function revealOnScroll(elements: Iterable<HTMLElement>, signal: AbortSignal) {
  const observer = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  for (const element of elements) {
    if (!element.classList.contains('is-early')) observer.observe(element);
  }
  signal.addEventListener('abort', () => observer.disconnect(), { once: true });
}
