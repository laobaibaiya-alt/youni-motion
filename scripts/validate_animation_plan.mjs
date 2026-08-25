#!/usr/bin/env node
import {readFile} from 'node:fs/promises';
import {resolve} from 'node:path';

const inputArg = process.argv[2];
if (!inputArg) {
  console.error('Usage: node scripts/validate_animation_plan.mjs <animation-plan.json>');
  process.exit(2);
}

const plan = JSON.parse(await readFile(resolve(inputArg), 'utf8'));
if (!/^S\d{2,}$/.test(plan.sceneId ?? '')) throw new Error('sceneId must be an internal Sxx id');
if (typeof plan.semanticGoal !== 'string' || plan.semanticGoal.trim() === '') {
  throw new Error('semanticGoal is required');
}
if (!Array.isArray(plan.objects) || plan.objects.length === 0) throw new Error('objects are required');
if (!Array.isArray(plan.sequence) || plan.sequence.length === 0) throw new Error('sequence is required');

const objectIds = new Set(plan.objects.map((object) => object.id));
if (objectIds.size !== plan.objects.length) throw new Error('object ids must be unique');

for (const event of plan.sequence) {
  if (!Number.isFinite(event.startFrame) || !Number.isFinite(event.endFrame) || event.endFrame < event.startFrame) {
    throw new Error(`Invalid frame range for ${event.objectId}`);
  }
}

for (const connector of plan.connectors ?? []) {
  if (!objectIds.has(connector.sourceObjectId) || !objectIds.has(connector.targetObjectId)) {
    throw new Error('connector endpoints must reference existing objects');
  }
  if (connector.continuous !== true) throw new Error('connectors must be continuous across moving frames');
}

const safeArea = plan.presenterSafeArea;
if (!safeArea || !['x', 'y', 'width', 'height'].every((key) => Number.isFinite(safeArea[key]))) {
  throw new Error('presenterSafeArea is required');
}

console.log(JSON.stringify({status: 'pass', sceneId: plan.sceneId, objectCount: objectIds.size}));
