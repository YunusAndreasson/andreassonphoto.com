import assert from 'node:assert/strict';
import { test } from 'node:test';
import { frameQueue, onPageLoad, revealOnScroll } from '../src/scripts/lifecycle.ts';

test('scroll events coalesce and pending work is cancelled on navigation', () => {
  const frames = new Map<number, FrameRequestCallback>();
  let id = 0;
  globalThis.requestAnimationFrame = (callback) => { frames.set(++id, callback); return id; };
  globalThis.cancelAnimationFrame = (id) => { frames.delete(id); };
  const controller = new AbortController();
  let calls = 0;
  const queue = frameQueue(() => { calls++; }, controller.signal);
  queue(); queue(); queue();
  assert.equal(frames.size, 1);
  const callback = frames.get(id)!;
  frames.delete(id);
  callback(0);
  assert.equal(calls, 1);
  queue();
  assert.equal(frames.size, 1);
  controller.abort();
  assert.equal(frames.size, 0);
  queue();
  assert.equal(frames.size, 0);
});

test('page resources are aborted before the DOM swap and renewed on load', () => {
  const document = new EventTarget();
  Object.assign(globalThis, { document });
  const signals: AbortSignal[] = [];
  onPageLoad((signal) => signals.push(signal));
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(signals[0].aborted, false);
  document.dispatchEvent(new Event('astro:before-swap'));
  assert.equal(signals[0].aborted, true);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(signals[1].aborted, false);
  document.dispatchEvent(new Event('astro:page-load'));
  assert.equal(signals[1].aborted, true);
});

test('reveals skip early prints, unobserve visible prints and disconnect on cleanup', () => {
  const observed = new Set<Element>();
  let callback: IntersectionObserverCallback;
  let disconnected = false;
  class Observer {
    constructor(cb: IntersectionObserverCallback) { callback = cb; }
    observe(element: Element) { observed.add(element); }
    unobserve(element: Element) { observed.delete(element); }
    disconnect() { disconnected = true; }
  }
  Object.assign(globalThis, { IntersectionObserver: Observer });
  const element = (early: boolean) => {
    const classes = new Set(early ? ['is-early'] : []);
    return { classList: { contains: (name: string) => classes.has(name), add: (name: string) => classes.add(name) } } as unknown as HTMLElement;
  };
  const early = element(true), late = element(false);
  const controller = new AbortController();
  revealOnScroll([early, late], controller.signal);
  assert.deepEqual([...observed], [late]);
  callback!([{ target: late, isIntersecting: false } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
  assert.equal(observed.size, 1);
  callback!([{ target: late, isIntersecting: true } as unknown as IntersectionObserverEntry], {} as IntersectionObserver);
  assert.equal(late.classList.contains('is-visible'), true);
  assert.equal(observed.size, 0);
  controller.abort();
  assert.equal(disconnected, true);
});
