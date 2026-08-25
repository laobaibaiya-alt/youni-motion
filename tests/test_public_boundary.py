import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PublicBoundaryTests(unittest.TestCase):
    def test_required_public_skill_files_exist(self):
        required = [
            "SKILL.md",
            "agents/openai.yaml",
            "README.md",
            "README.en.md",
            "references/commands.zh-CN.md",
            "references/semantic-routing.md",
            "references/semantic-routing.json",
            "references/delivery-contract.md",
            "references/presenter-safe-area.md",
        ]
        missing = [path for path in required if not (ROOT / path).is_file()]
        self.assertEqual([], missing, f"缺少公开包文件: {missing}")

    def test_public_docs_do_not_embed_machine_specific_paths_or_private_cases(self):
        public_files = [
            ROOT / "SKILL.md",
            ROOT / "README.md",
            ROOT / "README.en.md",
            *sorted((ROOT / "references").glob("*.md")),
            *sorted((ROOT / "references").glob("*.json")),
        ]
        text = "\n".join(
            path.read_text(encoding="utf-8")
            for path in public_files
            if path.is_file()
        )

        machine_home = "/" + "Users" + "/"
        private_case = "Project" + "46"
        legacy_private_skill = "presenter" + "-adaptive-" + "remotion"
        for forbidden in (machine_home, private_case, legacy_private_skill):
            self.assertNotIn(forbidden, text)

    def test_delivery_contract_matches_the_public_design(self):
        contract_path = ROOT / "references" / "semantic-routing.json"
        self.assertTrue(contract_path.is_file())
        delivery = json.loads(contract_path.read_text(encoding="utf-8"))["delivery"]

        self.assertEqual([1920, 1080], delivery["canvas"])
        self.assertEqual(30, delivery["fps"])
        self.assertEqual(["mp4"], delivery["middleSceneFormats"])
        self.assertEqual(["mp4", "alpha-mov"], delivery["edgeSceneFormats"])
        self.assertEqual(
            {"x": 690, "y": 108, "width": 540, "height": 760},
            delivery["defaultPresenterSafeArea"],
        )


if __name__ == "__main__":
    unittest.main()
