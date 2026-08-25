# Youni Motion

Youni Motion is an SRT-led skill for producing motion graphics around talking-head videos. Natural-language requests route to subtitle cleanup, subtitle refinement, scene segmentation, motion planning, scene generation, and rendering.

## Principles

- Internal scene IDs, workflow state, and quality evidence are not required as user input.
- SRT cleanup and refinement may change text but preserve every existing timecode.
- A unique semantic match proceeds directly; a question is asked only for real ambiguity.
- Middle scenes use the full canvas. Opening, closing, and single-scene projects support both review MP4 and alpha MOV delivery.
- The default central presenter safe area is `x=690, y=108, width=540, height=760` and is configurable.

## Install the Skill

```bash
cp -R youni-motion ~/.codex/skills/youni-motion
```

Invoke it explicitly with `$youni-motion`, or describe an SRT-led talking-head motion task directly.

## Initialize a project

```bash
node scripts/init_project.mjs ./youni-motion-demo --example
cd ./youni-motion-demo
npm install
```

`--example` installs a synthetic six-second SRT, scene catalog, and animation plan. Omit the flag for a clean project.

## Preview and render

```bash
npm run typecheck
npm run studio
npm run render:review
npm run render:alpha
```

The review command targets `renders/S01/review.mp4`. The alpha command targets a ProRes 4444 file at `renders/S01/alpha.mov` using the same scene structure and timing without the background or captions.

Validate rendered media with:

```bash
npm run validate:delivery -- renders/S01/review.mp4 review
npm run validate:delivery -- renders/S01/alpha.mov alpha
```

## SRT and plan utilities

```bash
node scripts/validate_srt.mjs input/source.srt
node scripts/srt_apply_edits.mjs input/source.srt edits.json docs/srt/refined.srt
node scripts/validate_scene_catalog.mjs docs/scene-catalog.json
node scripts/validate_animation_plan.mjs docs/scene-plans/S01-animation-plan.json
```

## Release status

Youni Motion `v0.1.0` is publicly available on GitHub. The package structure, starter template, utilities, synthetic example, Apache-2.0 license, and contract tests are assembled. An independent `npm ci`, TypeScript check, real review MP4, ProRes alpha MOV, alpha-channel and safe-area inspection, and privacy scan passed on 2026-08-25. See the machine-readable [Step 2 release QA](tests/reports/2026-08-25-step2-release-qa.json).

Original Youni Motion files use Apache-2.0. Remotion has its own special license and some organizations may need a company license. Read [DEPENDENCIES.md](DEPENDENCIES.md) and the [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md). Never commit a Remotion license key.

This local package does not create or modify a remote repository automatically.
