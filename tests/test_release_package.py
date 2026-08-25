import json
import subprocess
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
TEMPLATE = ROOT / "assets" / "remotion-template"


class ReleasePackageTests(unittest.TestCase):
    def read_required(self, path):
        self.assertTrue(path.is_file(), f"缺少发布文件: {path.relative_to(ROOT)}")
        return path.read_text(encoding="utf-8")

    def test_release_files_and_runnable_template_are_packaged(self):
        required = [
            "LICENSE",
            "NOTICE.md",
            "DEPENDENCIES.md",
            ".gitignore",
            "scripts/init_project.mjs",
            "scripts/srt_apply_edits.mjs",
            "scripts/validate_srt.mjs",
            "scripts/validate_scene_catalog.mjs",
            "scripts/validate_animation_plan.mjs",
            "scripts/render_scene.mjs",
            "scripts/validate_render_delivery.mjs",
            "assets/remotion-template/package.json",
            "assets/remotion-template/tsconfig.json",
            "assets/remotion-template/remotion.config.ts",
            "assets/remotion-template/src/index.ts",
            "assets/remotion-template/src/Root.tsx",
            "assets/remotion-template/src/YouniScene.tsx",
            "assets/remotion-template/public/source.srt",
            "assets/remotion-template/youni-motion.config.json",
            "examples/minimal-project/input/source.srt",
            "examples/minimal-project/docs/scene-catalog.json",
            "examples/minimal-project/docs/scene-plans/S01-animation-plan.json",
        ]
        missing = [path for path in required if not (ROOT / path).is_file()]
        self.assertEqual([], missing, f"发布包仍缺少文件: {missing}")

    def test_template_exposes_review_and_alpha_render_commands(self):
        package = json.loads(self.read_required(TEMPLATE / "package.json"))
        scripts = package["scripts"]

        self.assertIn("studio", scripts)
        self.assertIn("typecheck", scripts)
        self.assertIn("render:review", scripts)
        self.assertIn("render:alpha", scripts)
        self.assertIn("@remotion/captions", package["dependencies"])
        self.assertEqual(package["dependencies"]["remotion"], package["devDependencies"]["@remotion/cli"])

    def test_template_defaults_match_delivery_contract(self):
        config = json.loads(self.read_required(TEMPLATE / "youni-motion.config.json"))

        self.assertEqual({"width": 1920, "height": 1080, "fps": 30}, config["video"])
        self.assertEqual(
            {"x": 690, "y": 108, "width": 540, "height": 760},
            config["presenterSafeArea"],
        )

    def test_srt_refine_contract_preserves_timecodes(self):
        workflow = (ROOT / "references/workflow/02-srt-refine.md").read_text(
            encoding="utf-8"
        )
        contract = json.loads(
            (ROOT / "references/semantic-routing.json").read_text(encoding="utf-8")
        )
        self.assertFalse(contract["srtPolicy"]["cutChangesTimecodes"])
        self.assertFalse(contract["srtPolicy"]["refineChangesTimecodes"])
        self.assertNotIn("调整 cue 边界", workflow)

    def test_srt_edit_script_changes_text_without_changing_timestamps(self):
        source = """1\n00:00:00,000 --> 00:00:01,500\n原始字幕\n\n2\n00:00:01,500 --> 00:00:03,000\n第二句\n"""
        edits = {"1": "修订字幕", "2": "第二句精调"}

        with tempfile.TemporaryDirectory() as tmp:
            tmp_path = Path(tmp)
            source_path = tmp_path / "source.srt"
            edits_path = tmp_path / "edits.json"
            output_path = tmp_path / "refined.srt"
            source_path.write_text(source, encoding="utf-8")
            edits_path.write_text(json.dumps(edits, ensure_ascii=False), encoding="utf-8")

            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "scripts/srt_apply_edits.mjs"),
                    str(source_path),
                    str(edits_path),
                    str(output_path),
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(0, result.returncode, result.stderr)
            refined = output_path.read_text(encoding="utf-8")
            self.assertIn("修订字幕", refined)
            self.assertIn("第二句精调", refined)
            self.assertEqual(
                [line for line in source.splitlines() if " --> " in line],
                [line for line in refined.splitlines() if " --> " in line],
            )

    def test_initializer_creates_an_independent_example_project(self):
        with tempfile.TemporaryDirectory() as tmp:
            destination = Path(tmp) / "demo"
            result = subprocess.run(
                [
                    "node",
                    str(ROOT / "scripts/init_project.mjs"),
                    str(destination),
                    "--example",
                ],
                capture_output=True,
                text=True,
                check=False,
            )
            self.assertEqual(0, result.returncode, result.stderr)
            self.assertTrue((destination / "package.json").is_file())
            self.assertTrue((destination / "src/Root.tsx").is_file())
            self.assertTrue((destination / "public/source.srt").is_file())
            self.assertTrue((destination / "docs/scene-catalog.json").is_file())
            machine_home = "/" + "Users" + "/"
            self.assertNotIn(machine_home, "\n".join(
                p.read_text(encoding="utf-8")
                for p in destination.rglob("*")
                if p.is_file() and p.suffix in {".json", ".md", ".ts", ".tsx", ".srt"}
            ))

    def test_license_is_apache_2(self):
        license_text = self.read_required(ROOT / "LICENSE")
        self.assertIn("Apache License", license_text)
        self.assertIn("Version 2.0, January 2004", license_text)


if __name__ == "__main__":
    unittest.main()
