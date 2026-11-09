import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const serviceWorker = await readFile(new URL('../public/sw.js', import.meta.url), 'utf8');
const manifest = JSON.parse(await readFile(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8'));

test('service worker uses a new cache version so old shell assets are removed', () => {
  assert.match(serviceWorker, /const CACHE='block-world-shell-v2'/);
  assert.match(serviceWorker, /keys\.filter\(key=>key!==CACHE\)/);
});

test('page navigations fetch the latest app before falling back to the offline shell', () => {
  const navigationHandler = serviceWorker.slice(
    serviceWorker.indexOf("if(request.mode==='navigate')"),
    serviceWorker.indexOf('\n  event.respondWith(', serviceWorker.indexOf("if(request.mode==='navigate')"))
  );
  assert.match(navigationHandler, /fetch\(request\)/);
  assert.match(navigationHandler, /cache\.match\('\.\/index\.html'\)/);
  assert.ok(navigationHandler.indexOf('fetch(request)') < navigationHandler.indexOf('.catch(async()=>'));
});

test('asset caching is limited to same-origin GET requests', () => {
  assert.match(serviceWorker, /request\.method!=='GET'/);
  assert.match(serviceWorker, /new URL\(request\.url\)\.origin!==self\.location\.origin/);
  assert.match(serviceWorker, /response\.ok&&response\.type==='basic'/);
});

test('installable game manifest keeps the mobile standalone experience', () => {
  assert.equal(manifest.name, 'Block World — Survival');
  assert.equal(manifest.display, 'standalone');
  assert.equal(manifest.orientation, 'landscape');
  assert.equal(manifest.start_url, './');
});
