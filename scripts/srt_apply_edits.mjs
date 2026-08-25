#!/usr/bin/env node
import {readFile, writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const [sourceArg, editsArg, outputArg] = process.argv.slice(2);

if (!sourceArg || !editsArg || !outputArg) {
  console.error('Usage: node scripts/srt_apply_edits.mjs <source.srt> <edits.json> <output.srt>');
  process.exit(2);
}

const source = await readFile(resolve(sourceArg), 'utf8');
const edits = JSON.parse(await readFile(resolve(editsArg), 'utf8'));

if (!edits || Array.isArray(edits) || typeof edits !== 'object') {
  throw new Error('edits.json must be an object keyed by cue number');
}

const blocks = source.trim().split(/\r?\n\s*\r?\n/);
const seen = new Set();
const refined = blocks.map((block) => {
  const lines = block.split(/\r?\n/);
  if (lines.length < 3 || !/^\d+$/.test(lines[0].trim()) || !lines[1].includes(' --> ')) {
    throw new Error(`Invalid SRT block: ${block.slice(0, 80)}`);
  }
  const cueId = lines[0].trim();
  if (!(cueId in edits)) {
    return block;
  }
  if (typeof edits[cueId] !== 'string' || edits[cueId].trim() === '') {
    throw new Error(`Edit for cue ${cueId} must be non-empty text`);
  }
  seen.add(cueId);
  return [lines[0], lines[1], edits[cueId].trim()].join('\n');
});

const unknown = Object.keys(edits).filter((cueId) => !seen.has(cueId));
if (unknown.length > 0) {
  throw new Error(`Edits reference missing cue numbers: ${unknown.join(', ')}`);
}

await writeFile(resolve(outputArg), `${refined.join('\n\n')}\n`, 'utf8');
console.log(`Applied ${seen.size} text edits without changing SRT timecodes.`);
