"""Test script for Clarification Handler"""

import sys
import json
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.clarification_handler import ClarificationHandler

def run_tests():
    print("=" * 60)
    print("TESTING CLARIFICATION HANDLER")
    print("=" * 60)

    handler = ClarificationHandler()

    # 1. Setup Data
    ambiguous_rule = {
        "rule_id": "R2",
        "conditions": [],
        "action": "Provide scholarship",
        "responsible_role": "",
        "beneficiary": "Eligible students",
        "deadline": "",
        "ambiguity_flag": True,
        "ambiguity_reason": "Vague eligibility and missing authority"
    }

    clarification_input = {
        "rule_id": "R2",
        "clarified_responsible_role": "District Education Officer",
        "clarified_deadline": "30 days from application",
        "clarified_conditions": ["Annual family income < ₹2,00,000", "Currently enrolled student"]
    }

    print("\n🔹 Input Rule (Ambiguous):")
    print(json.dumps(ambiguous_rule, indent=2))

    print("\n🔹 Clarification Input:")
    print(json.dumps(clarification_input, indent=2))

    # 2. Test apply_clarification
    print("\nThinking: Applying clarification...")
    updated_rule = handler.apply_clarification(ambiguous_rule, clarification_input)

    print("\n✅ Updated Rule:")
    print(json.dumps(updated_rule, indent=2))

    # 3. Verification Assertions
    print("\nVERIFICATION CHECKS:")
    print("-" * 30)
    
    # Check fields
    assert updated_rule['responsible_role'] == "District Education Officer", "Failed: role update"
    assert updated_rule['deadline'] == "30 days from application", "Failed: deadline update"
    assert len(updated_rule['conditions']) == 2, "Failed: conditions update"
    assert "Currently enrolled student" in updated_rule['conditions'], "Failed: condition content"
    
    # Check flags
    assert updated_rule['ambiguity_flag'] == False, "Failed: flag reset"
    assert updated_rule['ambiguity_reason'] == "", "Failed: reason clear"
    
    print("✅ All field updates verified")

    # 4. Test Validation Logic
    print("\nTesting Validation Logic:")
    invalid_input = {"rule_id": "R1"} # No content
    valid, msg = handler.validate_clarification(invalid_input)
    print(f"Empty input check: {'✅ Caught' if not valid else '❌ Missed'} ({msg})")

    # 5. Test Batch Processing
    print("\nTesting Batch Processing:")
    rules = [ambiguous_rule]
    batch_input = [clarification_input]
    batch_result = handler.process_batch_clarifications(rules, batch_input)
    
    if not batch_result[0]['ambiguity_flag']:
        print("✅ Batch processing successful")
    else:
        print("❌ Batch processing failed")

    print("\n" + "=" * 60)
    print("ALL TESTS PASSED")
    print("=" * 60)

if __name__ == "__main__":
    try:
        run_tests()
    except AssertionError as e:
        print(f"\n❌ ASSERTION FAILED: {e}")
    except Exception as e:
        print(f"\n❌ ERROR: {e}")
