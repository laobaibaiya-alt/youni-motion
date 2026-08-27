<p align="right"><a href="README.en.md">English</a> · 简体中文</p>

<p align="center">
  <img src="docs/assets/youni-motion-hero.png" alt="Youni Motion：把中文露脸口播 SRT 变成逐场 Remotion 动画" width="100%" />
</p>

<h1 align="center">Youni Motion</h1>

<p align="center"><strong>把中文露脸口播 SRT，变成可逐场确认、可持续修改、可直接叠加真人的 Remotion 动画。</strong></p>

<p align="center">
  <a href="https://github.com/laobaibaiya-alt/youni-motion/releases/tag/v0.1.0"><img src="https://img.shields.io/github/v/release/laobaibaiya-alt/youni-motion?style=flat-square" alt="Release" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/github/license/laobaibaiya-alt/youni-motion?style=flat-square" alt="Apache-2.0 License" /></a>
  <img src="https://img.shields.io/badge/Agent%20Skill-Codex-2f6f73?style=flat-square" alt="Codex Agent Skill" />
  <img src="https://img.shields.io/badge/Remotion-4.0.516-5965f2?style=flat-square" alt="Remotion 4.0.516" />
</p>

Youni Motion 是一套面向中文露脸口播的 Agent Skill。它以 SRT 为时间骨架，通过普通中文指令完成字幕初剪、字幕精调、场景切分、动画方案、逐场生成和视频渲染，交付完整画面的 Review MP4，以及为真人叠加保留安全区域的 Alpha MOV。

## 它解决什么问题

露脸口播动画不仅要“让元素动起来”，还要让字幕语义、物体出场、关系建立、人物位置和最终交付保持一致。Youni Motion 把这些要求放进同一套生产流程，让创作者可以用“分析当前场”“修改开头”“继续下一段”“渲染最后一场”这样的自然语言持续推进，而不用管理内部场次编号和质量凭据。

![Youni Motion 从 SRT 到逐场视频的六阶段流程](docs/assets/youni-motion-workflow.png)

## 核心原则

- 用户可以说“分析当前场”“修改开头”“继续下一段”“渲染最后一场”，不需要填写内部场次编号、审批凭据或工作流状态。
- SRT 初剪和精调只修改文字，不改变任何已有时间码。
- 唯一匹配直接执行，真实歧义才提问。
- 中间场使用完整画布；开场、尾场和单场项目同时支持 Review MP4 与透明 MOV。
- 默认中央人物安全区域为 `x=690, y=108, width=540, height=760`，允许项目配置。

## 真实输出与交付

同一个场景实现会沿同一时间轴生成两种交付：Review MP4 保留完整背景和字幕，用于逐场确认；Alpha MOV 移除背景和字幕，并保留中央人物安全区域，用于后期叠加真人。

![Youni Motion 逐帧过程、Review MP4 与 Alpha MOV 交付对比](docs/assets/youni-motion-delivery.png)

## 安装 Skill

把整个仓库复制到 Codex Skills 目录：

```bash
cp -R youni-motion ~/.codex/skills/youni-motion
```

之后可以用 `$youni-motion` 明确调用，也可以直接描述 SRT 口播动画任务触发。

## 中文指令怎么用

Youni Motion 按语义理解用户意图，不要求逐字复述固定口令。为了让第一次使用的用户也能直接操作，这里把指令分成三层：基础控制词用于限定读写边界，六阶段专业模板用于明确输入、能力、输出和停止位置，连接词用于承接最近且唯一的上下文。下面的专业模板可以直接复制，但不是执行门禁；语义等价的自然语言同样有效。

![Youni Motion 中文指令使用顺序](docs/assets/youni-motion-command-sequence-v1.png)

### 1. 基础控制词

| 用户意图 | 可以说 | Skill 的行为边界 |
|---|---|---|
| 只读分析 | `分析一下当前内容`、`定位一下问题` | 只检查和解释，不生成、不覆盖文件 |
| 限定修改 | `只修改当前场`、`只改这段字幕` | 只修改语义唯一的目标，不扩展到其他场景 |
| 继续当前流程 | `OK，进入下一步` | 只承接最近且唯一的上下文；存在歧义时才询问 |

### 2. 六阶段专业标准指令

每条专业指令都包含：调用的能力、当前输入、实际操作、禁止事项、交付结果和暂停位置。

#### 第 1 阶段｜SRT 初剪（`youniSrtCut`）

```text
使用 $youni-motion，只执行 youniSrtCut：读取当前原始 SRT 和可用口播素材，修正确认无误的术语、错字、重复、口误和赘词，标出建议删除的真人口播片段；不修改任何已有 cue 时间码，也不代替用户删除真人视频。输出初剪 SRT 和剪辑核对清单后暂停。
```

> **人工交接：** 用户依据核对清单在剪映删除对应真人视频片段，然后重新导出 SRT。重新导出的文件是第 2 阶段唯一时间依据；文件尚未产生时，不进入 SRT 精调。

重新导出后可以说：

```text
我已经在剪映完成真人视频初剪并重新导出 SRT。使用 $youni-motion，只检查并登记我刚提供的 SRT 作为后续时间依据，不执行字幕精调；完成后暂停。
```

#### 第 2 阶段｜SRT 精调（`youniSrtRefine`）

```text
使用 $youni-motion，只执行 youniSrtRefine：读取剪映初剪后重新导出的 SRT，在相邻 cue 之间重新分配字幕文字，校正文案、断句、阅读密度和语义完整性；不改变任何重新导出的时间码，不新增时间段，不制造内容遗漏。输出精调 SRT 和文字调整摘要后暂停。
```

#### 第 3 阶段｜场景切分（`youniSceneSplit`）

```text
使用 $youni-motion，只执行 youniSceneSplit：以当前精调 SRT 为输入，按照语义转折、对象关系、演示任务和连续 cue 切分场景，不按固定秒数或单条字幕机械切分；保证全部 cue 按原顺序连续覆盖且只归属一次。输出场景目录，以及每场的时间范围、字幕范围、核心含义和上下场关系后暂停。
```

#### 第 4 阶段｜动画方案（`youniMotionPlan`）

```text
使用 $youni-motion，只执行 youniMotionPlan：分析当前所指的一个场景，把字幕语义转成可实现的对象和时间关系，明确叙事目标、对象层级、出现顺序、交互关系、动态锚点、稳定阅读区、退场方式、相邻场衔接、人物安全区域和交付格式。只输出当前场动画方案，不写 Remotion 代码、不渲染，完成后暂停。
```

#### 第 5 阶段｜生成动画内容（`youniMotionBuild`）

```text
使用 $youni-motion，只执行 youniMotionBuild：自动解析当前场景及其唯一动画方案，严格按方案生成或修改当前一个 Remotion 场景；保证画布铺满、对象层级清楚、连接锚点连续有效，并遵守人物安全区域。只处理当前场，不自动进入下一场、不渲染最终视频；输出场景代码和实现摘要后暂停。
```

#### 第 6 阶段｜视频渲染（`youniMotionRender`）

```text
使用 $youni-motion，只执行 youniMotionRender：渲染当前所指且上下文唯一的场景，按照交付契约生成 Review MP4，并在开场、尾场或单场项目需要人物叠加时生成 Alpha MOV；检查媒体元数据、首尾帧、画布铺满、字幕同步、透明通道和连续交互。验证通过后交付文件与检查结果，失败时报告具体阻塞；完成后暂停。
```

### 3. 逐场连接词

| 当前状态 | 可以说 | 下一步行为 |
|---|---|---|
| 当前动画方案已确认 | `按这个方案做` | 执行当前场 `youniMotionBuild` |
| 当前场动画内容已生成 | `渲染本场` | 执行当前场 `youniMotionRender` |
| 当前场视频已确认 | `继续下一场` | 解析下一场并回到 `youniMotionPlan` |
| 当前步骤结果已确认 | `OK，进入下一步` | 只进入语义唯一的下一阶段 |

短词必须结合最近对话理解，不能脱离上下文变成全局执行授权。完整指令源见 [中文指令与专业模板](references/commands.zh-CN.md)。

## 初始化最小项目

在仓库根目录执行：

```bash
node scripts/init_project.mjs ./youni-motion-demo --example
cd ./youni-motion-demo
npm install
```

`--example` 会加入一份完全虚构的六秒 SRT、场景目录和动画方案。去掉该参数则只创建干净模板。

项目默认结构：

```text
youni-motion-demo/
├── youni-motion.config.json
├── input/
├── docs/
├── public/source.srt
├── src/
├── scripts/
└── renders/
```

## 预览与渲染

```bash
npm run typecheck
npm run studio
npm run render:review
npm run render:alpha
```

- `render:review` 生成 `renders/S01/review.mp4`。
- `render:alpha` 生成 ProRes 4444 透明视频 `renders/S01/alpha.mov`。
- 两种输出使用同一 Composition 结构和时间轴；Alpha 模式不含背景和字幕。

检查交付文件：

```bash
npm run validate:delivery -- renders/S01/review.mp4 review
npm run validate:delivery -- renders/S01/alpha.mov alpha
```

## SRT 与方案工具

```bash
node scripts/validate_srt.mjs input/source.srt
node scripts/srt_apply_edits.mjs input/source.srt edits.json docs/srt/refined.srt
node scripts/validate_scene_catalog.mjs docs/scene-catalog.json
node scripts/validate_animation_plan.mjs docs/scene-plans/S01-animation-plan.json
```

`srt_apply_edits.mjs` 的 `edits.json` 是以 cue 编号为键、修订文字为值的 JSON 对象。脚本会拒绝不存在的 cue，并原样保留所有时间码。

## 配置

`youni-motion.config.json` 定义画布、帧率、场景、字幕文件和人物安全区域。v0.1.0 默认只承诺 1920 × 1080、30 fps、16:9 横屏。

## 当前发布状态

Youni Motion `v0.1.0` 已在 GitHub 公开发布。发布包结构、模板、脚本、公开示例、Apache-2.0 许可证和基础契约测试均已整理；独立目录中的 `npm ci`、TypeScript 类型检查、真实 Review MP4、ProRes Alpha MOV、透明通道、安全区域和隐私扫描已于 2026-08-25 通过。机器可读结果见 [Step 2 release QA](tests/reports/2026-08-25-step2-release-qa.json)。

## 许可证

Youni Motion 原创文件采用 Apache-2.0。Remotion 使用自己的特殊许可证，部分组织可能需要公司许可证；使用前请阅读 [DEPENDENCIES.md](DEPENDENCIES.md) 和 [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。不要把 Remotion 许可证密钥提交到仓库。

本地包不会自动创建远程仓库、上传文件或发布 GitHub Release。
