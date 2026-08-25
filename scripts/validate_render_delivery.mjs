#!/usr/bin/env node
import {spawnSync} from 'node:child_process';
import {resolve} from 'node:path';

const [fileArg, mode] = process.argv.slice(2);
if (!fileArg || !['review', 'alpha'].includes(mode)) {
  console.error('Usage: node scripts/validate_render_delivery.mjs <video> <review|alpha>');
  process.exit(2);
}

const result = spawnSync(
  'ffprobe',
  ['-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height,r_frame_rate,pix_fmt,codec_name,duration', '-of', 'json', resolve(fileArg)],
  {encoding: 'utf8'},
);
if (result.error) throw result.error;
if (result.status !== 0) throw new Error(result.stderr || 'ffprobe failed');

const stream = JSON.parse(result.stdout).streams?.[0];
if (!stream) throw new Error('No video stream found');
if (stream.width !== 1920 || stream.height !== 1080) throw new Error('Expected 1920x1080 video');
const [numerator, denominator] = stream.r_frame_rate.split('/').map(Number);
if (Math.abs(numerator / denominator - 30) > 0.01) throw new Error('Expected 30 fps');
if (!(Number(stream.duration) > 0)) throw new Error('Video duration must be positive');
if (mode === 'alpha' && (!stream.pix_fmt?.includes('yuva') || stream.codec_name !== 'prores')) {
  throw new Error('Alpha delivery must be ProRes with an alpha pixel format');
}

console.log(JSON.stringify({status: 'pass', mode, ...stream}));
