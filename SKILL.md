---
name: youni-motion
description: Use when producing Chinese talking-head motion videos from SRT files, including subtitle cleanup, scene segmentation, motion planning, scene generation, or Remotion rendering.
---

# Youni Motion

Turn an SRT-led talking-head project into scene-level motion video assets. The user controls the work with ordinary language; identifiers, workflow state, and quality evidence remain internal implementation details.

## Route by meaning

First infer the requested operation and scope from the conversation plus available project files. Accept references such as “当前场”“开头”“下一段”“上一场”“最后一场”, subtitle time ranges, cue ranges, filenames, and unique content descriptions.

- If one target and one operation are clear, act without a second confirmation.
- If several targets remain equally plausible, ask one short question naming the alternatives.
- If nothing matches, report what was searched and what is missing.
- Never require the user to supply an internal scene number, approval hash, workflow status, or fixed command phrase.

Read [semantic-routing.md](references/semantic-routing.md) when interpreting requests or deciding whether to ask. Treat [semantic-routing.json](references/semantic-routing.json) as the machine-checkable contract.

## Preserve the intent boundary

Analysis verbs such as “看下”“分析”“讨论”“定位原因” authorize read-only inspection and recommendations. Action verbs such as “修改”“生成”“执行”“渲染”“导出” authorize the corresponding scoped mutation. Do not turn analysis into generation, and do not block a clear action merely because it was not phrased exactly like an example.

## Select the needed capability

Use only the stage needed by the request:

1. `youniSrtCut` — read [01-srt-cut.md](references/workflow/01-srt-cut.md).
2. `youniSrtRefine` — read [02-srt-refine.md](references/workflow/02-srt-refine.md).
3. `youniSceneSplit` — read [03-scene-split.md](references/workflow/03-scene-split.md).
4. `youniMotionPlan` — read [04-motion-plan.md](references/workflow/04-motion-plan.md) and [interaction-methodology.md](references/interaction-methodology.md).
5. `youniMotionBuild` — read [05-motion-build.md](references/workflow/05-motion-build.md), plus the safe-area and delivery references.
6. `youniMotionRender` — read [06-motion-render.md](references/workflow/06-motion-render.md) and [delivery-contract.md](references/delivery-contract.md).

For Chinese control-language examples, read [commands.zh-CN.md](references/commands.zh-CN.md). For caption timing, read [subtitle-policy.md](references/subtitle-policy.md).

## Use the bundled project tools

Initialize a clean project with `node scripts/init_project.mjs <destination>` or add the synthetic public example with `--example`. Use the bundled SRT, scene-catalog, animation-plan, render, and delivery validators instead of inventing user-facing approval fields.

The Remotion starter lives in `assets/remotion-template/`. Its review and alpha compositions share one scene implementation. Review mode supplies the full background and captions; alpha mode removes both and renders with ProRes 4444 settings. Read [delivery-contract.md](references/delivery-contract.md) before rendering and [DEPENDENCIES.md](DEPENDENCIES.md) before installation.

## Internal quality responsibility

Maintain scene IDs such as `S01` automatically after scene splitting. Use them in filenames, manifests, logs, and diagnostics, never as a mandatory user input.

During SRT cleanup and refinement, preserve every existing cue timecode. Redistribute or correct text only within those fixed cue boundaries; the user performs actual video cuts before exporting a new SRT.

Before delivery, verify scope, duration, canvas, safe area, continuity, clipping, connectors, captions, output format, and file readability. A failed check blocks delivery and triggers an internal fix or a concrete blocker report; it does not create paperwork for the user.

Do not publish, upload, or mutate external repositories unless the user explicitly requests that external action.
