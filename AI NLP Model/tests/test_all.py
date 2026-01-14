"""Test suite for policy analysis module"""

import sys
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.schema import PolicyRule, Policy, AMBIGUITY_TRIGGERS, validate_schema
from src.ambiguity_detector import AmbiguityDetector
from src.utils import find_ambiguity_triggers, extract_monetary_values, extract_time_constraints


def test_schema():
    """Test schema validation"""
    print("Testing schema validation...")
    
    # Test valid rule
    rule = PolicyRule(
        rule_id="RULE_001",
        conditions=["Student belongs to SC category"],
        action="Receive scholarship",
        responsible_role="District Officer",
        beneficiary="SC students",
        deadline="15 days"
    )
    assert rule.rule_id == "RULE_001"
    print("✅ Valid rule creation passed")
    
    # Test valid policy
    policy = Policy(
        policy_id="POL_001",
        policy_title="Test Policy",
        rules=[rule]
    )
    assert len(policy.rules) == 1
    print("✅ Valid policy creation passed")
    
    # Test validation
    policy_dict = {
        "policy_id": "POL_002",
        "policy_title": "Another Policy",
        "rules": []
    }
    validated = validate_schema(policy_dict)
    assert validated.policy_id == "POL_002"
    print("✅ Schema validation passed")
    
    print()


def test_ambiguity_detection():
    """Test ambiguity detection"""
    print("Testing ambiguity detection...")
    
    detector = AmbiguityDetector()
    
    # Test clear rule
    clear_rule = PolicyRule(
        rule_id="RULE_001",
        conditions=["Student belongs to SC category"],
        action="Receive ₹10,000 scholarship",
        responsible_role="District Officer",
        beneficiary="SC students",
        deadline="15 days"
    )
    is_ambiguous, reason = detector.detect_ambiguity(clear_rule)
    assert not is_ambiguous
    print("✅ Clear rule detection passed")
    
    # Test ambiguous rule
    ambiguous_rule = PolicyRule(
        rule_id="RULE_002",
        conditions=[],
        action="Students may receive scholarships as applicable",
        responsible_role="",
        beneficiary="",
        deadline=""
    )
    is_ambiguous, reason = detector.detect_ambiguity(ambiguous_rule)
    assert is_ambiguous
    print(f"✅ Ambiguous rule detection passed (reason: {reason})")
    
    # Test trigger detection
    triggers = find_ambiguity_triggers("subject to approval", AMBIGUITY_TRIGGERS)
    assert len(triggers) > 0
    print("✅ Trigger detection passed")
    
    print()


def test_utility_functions():
    """Test utility functions"""
    print("Testing utility functions...")
    
    # Test monetary value extraction
    text = "Students shall receive ₹10,000 scholarship"
    values = extract_monetary_values(text)
    assert len(values) > 0
    print(f"✅ Monetary value extraction passed: {values}")
    
    # Test time constraint extraction
    text = "within 15 days of verification"
    constraints = extract_time_constraints(text)
    assert len(constraints) > 0
    print(f"✅ Time constraint extraction passed: {constraints}")
    
    print()


def test_ambiguity_stats():
    """Test ambiguity statistics"""
    print("Testing ambiguity statistics...")
    
    detector = AmbiguityDetector()
    
    rules = [
        PolicyRule(
            rule_id="RULE_001",
            action="Clear action",
            conditions=["condition"],
            responsible_role="Officer",
            beneficiary="Students",
            deadline="10 days"
        ),
        PolicyRule(
            rule_id="RULE_002",
            action="May take action as applicable",
            conditions=[],
            responsible_role="",
            beneficiary="",
            deadline=""
        )
    ]
    
    rules = detector.flag_ambiguous_rules(rules)
    stats = detector.get_ambiguity_stats(rules)
    
    assert stats['total_rules'] == 2
    assert stats['ambiguous_rules'] >= 1
    print(f"✅ Ambiguity stats passed: {stats}")
    
    print()


def run_all_tests():
    """Run all tests"""
    print("=" * 60)
    print("RUNNING POLICY ANALYSIS MODULE TESTS")
    print("=" * 60)
    print()
    
    try:
        test_schema()
        test_ambiguity_detection()
        test_utility_functions()
        test_ambiguity_stats()
        
        print("=" * 60)
        print("✅ ALL TESTS PASSED!")
        print("=" * 60)
        return True
        
    except AssertionError as e:
        print(f"\n❌ Test failed: {e}")
        return False
    except Exception as e:
        print(f"\n❌ Error during testing: {e}")
        return False


if __name__ == "__main__":
    success = run_all_tests()
    sys.exit(0 if success else 1)
