"""Test script for Rule-Based Ambiguity Detector"""

import sys
import os
from pathlib import Path

# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.ambiguity_detector import AmbiguityDetector

def run_tests():
    print("=" * 60)
    print("TESTING RULE-BASED AMBIGUITY DETECTOR")
    print("=" * 60)

    detector = AmbiguityDetector()

    # Input 1: CLEAR
    rule1 = {
        "rule_id": "R1",
        "conditions": ["Student belongs to SC category"],
        "action": "Disburse ₹10,000 scholarship",
        "responsible_role": "District Education Officer",
        "beneficiary": "SC students",
        "deadline": "15 days"
    }

    # Input 2: AMBIGUOUS - vague phrase
    rule2 = {
        "rule_id": "R2",
        "conditions": [],
        "action": "Provide scholarship as applicable",
        "responsible_role": "",
        "beneficiary": "Eligible students",
        "deadline": ""
    }

    # Input 3: AMBIGUOUS - missing deadline
    rule3 = {
        "rule_id": "R3",
        "conditions": ["Income < 2 lakh"],
        "action": "Process application within stipulated time",
        "responsible_role": "Block Officer",
        "beneficiary": "EWS students",
        "deadline": ""
    }

    rules = [rule1, rule2, rule3]

    print("\nRunning detection on 3 test rules...")
    updated_rules = detector.detect_ambiguities(rules)

    print("\nVERIFICATION RESULTS:")
    print("-" * 60)

    # Verify Rule 1
    r1 = updated_rules[0]
    print(f"Rule 1 (Expected CLEAR): {'✅ PASS' if not r1['ambiguity_flag'] else '❌ FAIL'}")
    if r1['ambiguity_flag']:
        print(f"  Reason: {r1['ambiguity_reason']}")

    # Verify Rule 2
    r2 = updated_rules[1]
    expected_r2_parts = [
        "Contains vague phrase: 'as applicable'",
        "Responsible authority not specified",
        "Eligibility criteria not specified"
    ]
    r2_passed = r2['ambiguity_flag'] and all(part in r2['ambiguity_reason'] for part in expected_r2_parts)
    print(f"Rule 2 (Expected AMBIGUOUS + Multple Reasons): {'✅ PASS' if r2_passed else '❌ FAIL'}")
    if not r2_passed:
        print(f"  Result: {r2['ambiguity_reason']}")
        print("  Missing expected parts.")

    # Verify Rule 3
    r3 = updated_rules[2]
    expected_r3 = "Time constraint mentioned but deadline not specified"
    r3_passed = r3['ambiguity_flag'] and expected_r3 in r3['ambiguity_reason']
    print(f"Rule 3 (Expected Missing Deadline): {'✅ PASS' if r3_passed else '❌ FAIL'}")
    if not r3_passed:
        print(f"  Result: {r3['ambiguity_reason']}")

    print("-" * 60)
    summary = detector.get_ambiguity_summary(updated_rules)
    print("Summary Stats Verification:")
    print(f"  Total: {summary['total_rules']} (Expected 3)")
    print(f"  Ambiguous: {summary['ambiguous_rules']} (Expected 2)")
    
    if summary['total_rules'] == 3 and summary['ambiguous_rules'] == 2:
        print("✅ ALL TESTS PASSED")
    else:
        print("❌ STATS MISMATCH")

if __name__ == "__main__":
    run_tests()
