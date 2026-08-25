<p align="right">English · <a href="README.md">简体中文</a></p>

<p align="center">
  <img src="docs/assets/youni-motion-hero.png" alt="Youni Motion turns Chinese talking-head SRT into scene-by-scene Remotion animation" width="100%" />
</p>

<h1 align="center">Youni Motion</h1>

<p align="center"><strong>Turn Chinese talking-head SRT into scene-by-scene Remotion animation that can be reviewed, revised, and composited with a presenter.</strong></p>

<p align="center">
  <a href="https://github.com/laobaibaiya-alt/youni-motion/releases/tag/v0.1.0"><img src="https://img.shields.io/github/v/release/laobaibaiya-alt/youni-motion?style=flat-square" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/laobaibaiya-alt/youni-motion?style=flat-square" alt="Apache-2.0 License" /></a>
  <img src="https://img.shields.io/badge/Agent%20Skill-Codex-2f6f73?style=flat-square" alt="Codex Agent Skill" />
  <img src="https://img.shields.io/badge/Remotion-4.0.516-5965f2?style=flat-square" alt="Remotion 4.0.516" />
</p>

Youni Motion is an Agent Skill for Chinese talking-head animation production. It uses SRT as the timing backbone and routes ordinary-language requests through subtitle cleanup, subtitle refinement, scene segmentation, motion planning, scene generation, and rendering. It delivers a full-canvas review MP4 and a presenter-safe alpha MOV for compositing.

## What problem does it solve?

Talking-head motion graphics need more than animated elements: subtitle meaning, object entrances, relationship reveals, presenter placement, and delivery formats must remain consistent. Youni Motion keeps those concerns in one workflow, while scene identifiers and quality evidence remain internal instead of becoming required user input.

![The six-stage Youni Motion workflow from SRT to scene-level video](docs/assets/youni-motion-workflow.png)

## Principles

- Internal scene IDs, workflow state, and quality evidence are not required as user input.
- SRT cleanup and refinement may change text but preserve every existing timecode.
- A unique semantic match proceeds directly; a question is asked only for real ambiguity.
- Middle scenes use the full canvas. Opening, closing, and single-scene projects support both review MP4 and alpha MOV delivery.
- The default central presenter safe area is `x=690, y=108, width=540, height=760` and is configurable.

## Real output and delivery

The same scene implementation produces two synchronized deliverables. Review MP4 keeps the full background and captions for approval; alpha MOV removes both and reserves the central presenter-safe area for compositing.

![Youni Motion frame progression, review MP4, and alpha MOV delivery](docs/assets/youni-motion-delivery.png)

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
