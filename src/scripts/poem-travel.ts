// A poem's title travels with the reader, as a print travels from the wall
// into the viewer: from its place on /poems into the heading of the poem's own
// page, from a turn at the foot of a poem ("Older", "Newer") up into the next
// one's heading, and from the heading back into its place among the rest.
//
// Only the title being followed carries the view-transition name, and only
// for that one navigation: named, all 83 titles on /poems would be captured on
// every page change. A poem's own heading is named `poem` in the CSS; the
// script names the title on the other side to match, and clears it after.
import type { TransitionBeforePreparationEvent, TransitionBeforeSwapEvent } from 'astro:transitions/client';

const NAME = 'poem';
const titles = (root: ParentNode) => root.querySelectorAll<HTMLElement>('.poem-title, .poem-turn-title');

document.addEventListener('astro:before-preparation', (event) => {
  for (const title of titles(document)) title.style.viewTransitionName = '';
  const source = (event as TransitionBeforePreparationEvent).sourceElement?.closest('.poem-title, .poem-turn');
  if (!source) return;
  const title = source.matches('.poem-turn')
    ? source.querySelector<HTMLElement>('.poem-turn-title')
    : (source as HTMLElement);
  if (!title) return;
  // A page holds one `poem`: on a poem's page the heading stands aside for
  // the turn that is leaving.
  for (const heading of document.querySelectorAll<HTMLElement>('.poem-page .poem-title')) {
    if (heading !== title) heading.style.viewTransitionName = 'none';
  }
  title.style.viewTransitionName = NAME;
});

// Back to the collection (/poems/#swifts): the heading settles into the title
// it came from.
document.addEventListener('astro:before-swap', (event) => {
  const { to, newDocument } = event as TransitionBeforeSwapEvent;
  if (!document.querySelector('.poem-page') || !to.hash) return;
  const title = newDocument.getElementById(decodeURIComponent(to.hash.slice(1)))?.querySelector<HTMLElement>('.poem-title');
  if (title) title.style.viewTransitionName = NAME;
});
