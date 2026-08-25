#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const inputArg = process.argv[2];
if (!inputArg) {
  console.error('Usage: node scripts/validate_scene_catalog.mjs <scene-catalog.json>');
  process.exit(2);
}

const catalog = JSON.parse(await readFile(resolve(inputArg), 'utf8'));
if (!Array.isArray(catalog.scenes) || catalog.scenes.length === 0) {
  throw new Error('scene catalog must contain at least one scene');
}

let expectedCue = 1;
catalog.scenes.forEach((scene, index) => {
  const expectedId = `S${String(index + 1).padStart(2, '0')}`;
  if (scene.id !== expectedId) throw new Error(`Expected scene id ${expectedId}`);
  if (scene.startCue !== expectedCue) throw new Error(`${scene.id} must start at cue ${expectedCue}`);
  if (!Number.isInteger(scene.endCue) || scene.endCue < scene.startCue) {
    throw new Error(`${scene.id} has an invalid cue range`);
  }
  if (!Number.isFinite(scene.startMs) || !Number.isFinite(scene.endMs) || scene.endMs <= scene.startMs) {
    throw new Error(`${scene.id} has an invalid time range`);
  }
  if (typeof scene.semanticGoal !== 'string' || scene.semanticGoal.trim() === '') {
    throw new Error(`${scene.id} requires a semanticGoal`);
  }
  expectedCue = scene.endCue + 1;
});

console.log(JSON.stringify({status: 'pass', sceneCount: catalog.scenes.length, lastCue: expectedCue - 1}));
