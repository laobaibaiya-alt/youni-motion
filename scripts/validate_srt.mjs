#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const timestampPattern = /^(\d{2}):(\d{2}):(\d{2}),(\d{3})$/;

const toMs = (value) => {
  const match = value.match(timestampPattern);
  if (!match) throw new Error(`Invalid SRT timestamp: ${value}`);
  const [, hours, minutes, seconds, milliseconds] = match.map(Number);
  if (minutes > 59 || seconds > 59) throw new Error(`Invalid SRT timestamp: ${value}`);
  return ((hours * 60 * 60 + minutes * 60 + seconds) * 1000) + milliseconds;
};

export const parseSrt = (source) => {
  const blocks = source.trim().split(/\r?\n\s*\r?\n/);
  return blocks.map((block, position) => {
    const lines = block.split(/\r?\n/);
    const index = Number(lines[0]);
    if (!Number.isInteger(index) || index !== position + 1) {
      throw new Error(`Cue index must be continuous at block ${position + 1}`);
    }
    const range = lines[1]?.split(' --> ');
    if (!range || range.length !== 2) throw new Error(`Cue ${index} has no valid time range`);
    const startMs = toMs(range[0]);
    const endMs = toMs(range[1]);
    const text = lines.slice(2).join('\n').trim();
    if (!text) throw new Error(`Cue ${index} has empty text`);
    if (endMs <= startMs) throw new Error(`Cue ${index} has non-positive duration`);
    return {index, startMs, endMs, text};
  });
};

export const validateSrt = (source) => {
  const cues = parseSrt(source);
  cues.forEach((cue, index) => {
    if (index > 0 && cue.startMs < cues[index - 1].endMs) {
      throw new Error(`Cue ${cue.index} overlaps cue ${cues[index - 1].index}`);
    }
  });
  return cues;
};

if (process.argv[1] && import.meta.url === new URL(`file://${resolve(process.argv[1])}`).href) {
  const inputArg = process.argv[2];
  if (!inputArg) {
    console.error('Usage: node scripts/validate_srt.mjs <input.srt>');
    process.exit(2);
  }
  const cues = validateSrt(await readFile(resolve(inputArg), 'utf8'));
  console.log(JSON.stringify({status: 'pass', cueCount: cues.length, endMs: cues.at(-1).endMs}));
}
