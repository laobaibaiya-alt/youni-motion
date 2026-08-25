#!/usr/bin/env node
import {cp, mkdir, readdir, stat} from 'node:fs/promises';
import {dirname, join, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const scriptDir = dirname(fileURLToPath(import.meta.url));
const packageRoot = resolve(scriptDir, '..');
const templateRoot = join(packageRoot, 'assets', 'remotion-template');
const exampleRoot = join(packageRoot, 'examples', 'minimal-project');

const destinationArg = process.argv[2];
const includeExample = process.argv.includes('--example');

if (!destinationArg) {
  console.error('Usage: node scripts/init_project.mjs <destination> [--example]');
  process.exit(2);
}

const destination = resolve(destinationArg);

try {
  const destinationStat = await stat(destination);
  if (!destinationStat.isDirectory() || (await readdir(destination)).length > 0) {
    throw new Error(`Destination must be absent or empty: ${destination}`);
  }
} catch (error) {
  if (error?.code !== 'ENOENT') {
    console.error(error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

await mkdir(destination, {recursive: true});
await cp(templateRoot, destination, {recursive: true});
await mkdir(join(destination, 'scripts'), {recursive: true});

const scriptCopies = [
  ['render_scene.mjs', 'render-scene.mjs'],
  ['validate_srt.mjs', 'validate-srt.mjs'],
  ['validate_render_delivery.mjs', 'validate-render-delivery.mjs'],
];

for (const [source, target] of scriptCopies) {
  await cp(join(scriptDir, source), join(destination, 'scripts', target));
}

await cp(join(packageRoot, '.gitignore'), join(destination, '.gitignore'));
await mkdir(join(destination, 'renders'), {recursive: true});

if (includeExample) {
  await cp(join(exampleRoot, 'input'), join(destination, 'input'), {recursive: true});
  await cp(join(exampleRoot, 'docs'), join(destination, 'docs'), {recursive: true});
  await cp(
    join(exampleRoot, 'input', 'source.srt'),
    join(destination, 'public', 'source.srt'),
  );
}

console.log(`Youni Motion project created at ${destination}`);
