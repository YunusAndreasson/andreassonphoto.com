// Photograph the websites on /code: one 1440×900 screenshot per entry in
// src/content/code/sites.json, saved to src/assets/code/<id>.jpg. An entry's
// `capture` URL, when set, is photographed instead of its `url`.
//
//   node scripts/capture-sites.mjs              # every site
//   node scripts/capture-sites.mjs zuhd-news    # just the ones named
//
// Drives headless Chromium over the DevTools protocol (Node's built-in
// WebSocket, no dependencies) rather than `chromium --screenshot`, which can't
// wait: zuhd.news draws its globe a few seconds after load. Set CHROME to use
// another binary.
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const WIDTH = 1440;
const HEIGHT = 900;
const SETTLE_MS = 6000; // after the load event, for maps, fonts and fade-ins
const OUT_DIR = 'src/assets/code';

const sites = JSON.parse(await readFile('src/content/code/sites.json', 'utf8'));
const only = process.argv.slice(2);
const targets = only.length ? sites.filter((s) => only.includes(s.id)) : sites;
if (!targets.length) {
  console.error(`No site matches ${only.join(', ')}. Ids: ${sites.map((s) => s.id).join(', ')}`);
  process.exit(1);
}

const profile = await mkdtemp(join(tmpdir(), 'capture-sites-'));
const chrome = spawn(
  process.env.CHROME ?? 'chromium',
  [
    '--headless=new',
    '--hide-scrollbars',
    '--enable-unsafe-swiftshader', // WebGL without a GPU, for the globe
    '--remote-debugging-port=0',
    `--user-data-dir=${profile}`,
    'about:blank',
  ],
  { stdio: ['ignore', 'ignore', 'pipe'] },
);

const wsUrl = await new Promise((resolve, reject) => {
  let log = '';
  chrome.stderr.on('data', (chunk) => {
    log += chunk;
    const match = log.match(/DevTools listening on (ws:\/\/\S+)/);
    if (match) resolve(match[1]);
  });
  chrome.on('exit', (code) => reject(new Error(`Chromium exited (${code}) before DevTools was ready:\n${log}`)));
});

// A minimal CDP client: numbered requests, plus one-shot waits on events.
const ws = new WebSocket(wsUrl);
await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
let nextId = 0;
const pending = new Map();
const waiters = [];
ws.addEventListener('message', ({ data }) => {
  const msg = JSON.parse(data);
  if (msg.id !== undefined) {
    const { resolve, reject } = pending.get(msg.id);
    pending.delete(msg.id);
    msg.error ? reject(new Error(msg.error.message)) : resolve(msg.result);
    return;
  }
  for (const w of waiters.filter((w) => w.method === msg.method && w.sessionId === msg.sessionId)) {
    waiters.splice(waiters.indexOf(w), 1);
    w.resolve(msg.params);
  }
});
const send = (method, params = {}, sessionId) =>
  new Promise((resolve, reject) => {
    const id = ++nextId;
    pending.set(id, { resolve, reject });
    ws.send(JSON.stringify({ id, method, params, sessionId }));
  });
const once = (method, sessionId, timeoutMs) =>
  new Promise((resolve) => {
    const w = { method, sessionId, resolve };
    waiters.push(w);
    setTimeout(() => {
      if (waiters.includes(w)) waiters.splice(waiters.indexOf(w), 1);
      resolve(null); // a page that never fires load still gets photographed
    }, timeoutMs);
  });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

try {
  for (const site of targets) {
    const { targetId } = await send('Target.createTarget', { url: 'about:blank' });
    const { sessionId } = await send('Target.attachToTarget', { targetId, flatten: true });
    await send('Emulation.setDeviceMetricsOverride', { width: WIDTH, height: HEIGHT, deviceScaleFactor: 1, mobile: false }, sessionId);
    await send('Page.enable', {}, sessionId);
    const loaded = once('Page.loadEventFired', sessionId, 30_000);
    await send('Page.navigate', { url: site.capture ?? site.url }, sessionId);
    await loaded;
    await sleep(SETTLE_MS);
    const { data } = await send('Page.captureScreenshot', { format: 'jpeg', quality: 90 }, sessionId);
    await writeFile(join(OUT_DIR, `${site.id}.jpg`), Buffer.from(data, 'base64'));
    await send('Target.closeTarget', { targetId });
    console.log(`✓ ${site.id}  ${site.capture ?? site.url}`);
  }
} finally {
  ws.close();
  // Chromium keeps writing its profile until it exits; remove it after.
  const exited = new Promise((resolve) => chrome.once('exit', resolve));
  chrome.kill();
  await exited;
  await rm(profile, { recursive: true, force: true });
}
