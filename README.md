# Youni Motion

Youni Motion 是一套以 SRT 为时间骨架的露脸口播动画 Skill。它通过自然语言完成字幕初剪、字幕精调、场景切分、动画方案、逐场生成和视频渲染。

## 核心原则

- 用户可以说“分析当前场”“修改开头”“继续下一段”“渲染最后一场”，不需要填写内部场次编号、审批凭据或工作流状态。
- SRT 初剪和精调只修改文字，不改变任何已有时间码。
- 唯一匹配直接执行，真实歧义才提问。
- 中间场使用完整画布；开场、尾场和单场项目同时支持 Review MP4 与透明 MOV。
- 默认中央人物安全区域为 `x=690, y=108, width=540, height=760`，允许项目配置。

## 安装 Skill

把整个仓库复制到 Codex Skills 目录：

```bash
cp -R youni-motion ~/.codex/skills/youni-motion
```

之后可以用 `$youni-motion` 明确调用，也可以直接描述 SRT 口播动画任务触发。

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

## 当前发布准备状态

发布包结构、模板、脚本、公开示例、Apache-2.0 许可证和基础契约测试已整理。独立目录中的 `npm ci`、TypeScript 类型检查、真实 Review MP4、ProRes Alpha MOV、透明通道、安全区域和隐私扫描已于 2026-08-25 通过；机器可读结果见 [Step 2 release QA](tests/reports/2026-08-25-step2-release-qa.json)。GitHub 仓库创建与发布尚未开始。

## 许可证

Youni Motion 原创文件采用 Apache-2.0。Remotion 使用自己的特殊许可证，部分组织可能需要公司许可证；使用前请阅读 [DEPENDENCIES.md](DEPENDENCIES.md) 和 [Remotion License](https://github.com/remotion-dev/remotion/blob/main/LICENSE.md)。不要把 Remotion 许可证密钥提交到仓库。

本地包不会自动创建远程仓库、上传文件或发布 GitHub Release。
