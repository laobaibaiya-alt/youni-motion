#!/usr/bin/env node
import {mkdirSync} from 'node:fs';
import {join, resolve} from 'node:path';
import {spawnSync} from 'node:child_process';

const [mode, sceneId = 'S01'] = process.argv.slice(2);
if (!['review', 'alpha'].includes(mode)) {
  console.error('Usage: node scripts/render_scene.mjs <review|alpha> [sceneId]');
  process.exit(2);
}
if (!/^S\d{2,}$/.test(sceneId)) throw new Error('sceneId must match Sxx');

const outputDir = resolve('renders', sceneId);
mkdirSync(outputDir, {recursive: true});
const npx = process.platform === 'win32' ? 'npx.cmd' : 'npx';
const composition = mode === 'review' ? 'YouniReview' : 'YouniAlpha';
const output = join(outputDir, mode === 'review' ? 'review.mp4' : 'alpha.mov');
const args = ['--no-install', 'remotion', 'render', 'src/index.ts', composition, output];

if (mode === 'review') {
  args.push('--codec=h264');
} else {
  args.push(
    '--image-format=png',
    '--pixel-format=yuva444p10le',
    '--codec=prores',
    '--prores-profile=4444',
  );
}

const result = spawnSync(npx, args, {stdio: 'inherit'});
if (result.error) throw result.error;
process.exit(result.status ?? 1);
