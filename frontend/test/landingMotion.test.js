import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const source = (path) => readFile(fileURLToPath(new URL(path, import.meta.url)), 'utf8');

test('landing application journey keeps the three visual motion states', async () => {
  const home = await source('../src/pages/Home.jsx');
  const css = await source('../src/styles/pages.css');

  assert.match(home, /data-application-journey/);
  assert.match(home, /journey-stage-\$\{journeyStage\}/);
  assert.match(home, /window\.addEventListener\('scroll', updateJourney/);
  assert.match(home, /Application selected/);
  assert.match(home, /trust-chapter/);
  assert.match(home, /home-motion-one/);
  assert.match(home, /home-motion-five/);
  assert.match(home, /viewportProgress > 0\.62/);
  assert.match(home, /hero-particle-field/);
  assert.match(home, /data-magnetic/);
  assert.match(css, /\.journey-stage-1 \.journey-plane/);
  assert.match(css, /\.journey-stage-2 \.selection-note/);
});

test('landing motion remains accessible when reduced motion is requested', async () => {
  const css = await source('../src/styles/pages.css');

  assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(css, /\.journey-resume/);
  assert.match(css, /\.journey-plane/);
  assert.match(css, /\.selection-note/);
  assert.match(css, /\.trust-chapter/);
  assert.match(css, /animation-timeline: view/);
  assert.match(css, /motion-ring/);
  assert.match(css, /motion-ring-alt/);
  assert.match(css, /Zoom and narrow-display resilience/);
  assert.match(css, /resume-float/);
  assert.match(css, /home-cursor/);
  assert.match(css, /home-route-in/);
  assert.match(css, /Home layout correction/);
  assert.match(css, /transition-duration: 1\.35s/);
  assert.match(css, /position: fixed/);
});

test('the shared UI layer gives every application surface an accessible motion treatment', async () => {
  const css = await source('../src/styles/pages.css');
  const baseCss = await source('../src/index.css');
  const builderCss = await source('../src/styles/ResumeBuilder.css');

  assert.match(css, /\.dashboard-page, \.workspace-page, \.auth-page/);
  assert.match(css, /@supports \(animation-timeline: view\(\)\)/);
  assert.match(css, /\.ats-report-page/);
  assert.match(baseCss, /@media \(prefers-reduced-motion: reduce\)/);
  assert.match(builderCss, /Premium workspace finish/);
});
