import json
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CONTRACT_PATH = ROOT / "references" / "semantic-routing.json"


class SemanticGateContractTests(unittest.TestCase):
    def load_contract(self):
        self.assertTrue(
            CONTRACT_PATH.is_file(),
            "公开版必须提供可验证的语义路由契约，而不是依赖口头约定",
        )
        return json.loads(CONTRACT_PATH.read_text(encoding="utf-8"))

    def test_user_can_reference_a_scene_semantically(self):
        contract = self.load_contract()
        routing = contract["routing"]

        self.assertEqual("semantic", routing["mode"])
        self.assertTrue(routing["sceneIdsAreInternal"])
        self.assertEqual([], routing["userRequiredControlFields"])
        self.assertGreaterEqual(len(routing["acceptedSceneReferences"]), 6)

    def test_unique_match_executes_without_a_confirmation_gate(self):
        contract = self.load_contract()
        resolution = contract["resolution"]

        self.assertEqual("execute", resolution["uniqueMatch"])
        self.assertEqual("ask-one-short-question", resolution["multipleMatches"])
        self.assertEqual("report-concrete-blocker", resolution["zeroMatches"])

    def test_analysis_does_not_mutate_and_generation_requires_intent_not_a_phrase(self):
        contract = self.load_contract()
        boundaries = contract["intentBoundaries"]

        self.assertFalse(boundaries["analysis"]["allowsMutation"])
        self.assertTrue(boundaries["generation"]["requiresActionIntent"])
        self.assertFalse(boundaries["generation"]["requiresExactPhrase"])

    def test_quality_checks_remain_internal(self):
        contract = self.load_contract()
        quality = contract["quality"]

        self.assertEqual("internal", quality["ownership"])
        self.assertTrue(quality["blocksDeliveryOnFailure"])
        self.assertEqual([], quality["userRequiredProofFields"])

    def test_all_six_workflow_capabilities_are_preserved(self):
        contract = self.load_contract()
        self.assertEqual(
            [
                "youniSrtCut",
                "youniSrtRefine",
                "youniSceneSplit",
                "youniMotionPlan",
                "youniMotionBuild",
                "youniMotionRender",
            ],
            contract["workflowCapabilities"],
        )


if __name__ == "__main__":
    unittest.main()
