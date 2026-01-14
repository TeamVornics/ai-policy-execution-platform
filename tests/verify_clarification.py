import requests
import json
import sys
import os

# Configuration
BASE_URL = "http://localhost:8000"
PDF_PATH = "demo_data/sample_policy.pdf"

def print_result(name, passed, detail=""):
    status = "✅ PASS" if passed else "❌ FAIL"
    print(f"{status} - {name}")
    if detail:
        print(f"   {detail}")

def check_field_absence(data, fields):
    errors = []
    for f in fields:
        if f in data:
            errors.append(f)
    return errors

def verify_clarification():
    print("🚀 Starting Verification for /api/policy/clarify")

    # 1. Health Check
    try:
        r = requests.get(f"{BASE_URL}/health")
        if r.status_code == 200:
            print_result("Server Health", True)
        else:
            print_result("Server Health", False, f"Status: {r.status_code}")
            return
    except Exception as e:
        print_result("Server Health", False, f"Connection Failed: {e}")
        return

    # 2. Upload Policy to populate Store
    print("\n📤 Step 1: Uploading Policy...")
    if not os.path.exists(PDF_PATH):
        print(f"❌ PDF not found at {PDF_PATH}")
        return

    policy_id = "TEST_POLICY_001"
    files = {'file': open(PDF_PATH, 'rb')}
    data = {'policy_id': policy_id}
    
    try:
        r = requests.post(f"{BASE_URL}/api/policy/process", files=files, data=data)
        if r.status_code != 200:
            print_result("Policy Process", False, f"Status: {r.status_code} - {r.text}")
            return
        
        response_json = r.json()
        rules = response_json.get("rules", [])
        if not rules:
            print_result("Rule Extraction", False, "No rules returned")
            return
            
        target_rule = rules[0] # Pick the first rule
        rule_id = target_rule.get("rule_id")
        print_result("Policy Process", True, f"Got {len(rules)} rules. Target Rule: {rule_id}")
        
    except Exception as e:
        print_result("Policy Process", False, f"Exception: {e}")
        return

    # 3. Send Clarification
    print(f"\n💡 Step 2: Clarifying Rule {rule_id}...")
    
    clarification_payload = {
        "policy_id": policy_id,
        "rule_id": rule_id,
        "clarified_responsible_role": "Verified Officer",
        "clarified_deadline": "99 days",
        "clarified_conditions": ["Condition A", "Condition B"]
    }
    
    try:
        r = requests.post(f"{BASE_URL}/api/policy/clarify", json=clarification_payload)
        
        if r.status_code != 200:
            print_result("Clarification Request", False, f"Status: {r.status_code} - {r.text}")
            return
            
        clarified_rule = r.json()
        
        # 4. Verify Output Format
        print(f"\n🔍 Step 3: Verifying Output Schema...")
        print(f"Received: {json.dumps(clarified_rule, indent=2)}")
        
        # Check required fields
        required_fields = ["rule_id", "conditions", "action", "responsible_role", "beneficiary", "deadline"]
        missing = [f for f in required_fields if f not in clarified_rule]
        
        if missing:
            print_result("Schema Fields check", False, f"Missing: {missing}")
        else:
            print_result("Schema Fields check", True)
            
        # Check forbidden fields
        forbidden_fields = ["ambiguity_flag", "ambiguity_reason", "original_text"]
        found_forbidden = check_field_absence(clarified_rule, forbidden_fields)
        
        if found_forbidden:
            print_result("Clean Output check", False, f"Found forbidden fields: {found_forbidden}")
        else:
            print_result("Clean Output check", True)
            
        # Check Values matches clarification
        checks = []
        checks.append(("Role Update", clarified_rule["responsible_role"] == "Verified Officer"))
        checks.append(("Deadline Update", clarified_rule["deadline"] == "99 days"))
        checks.append(("Conditions Update", clarified_rule["conditions"] == ["Condition A", "Condition B"]))
        
        all_passed = True
        for name, passed in checks:
            print_result(name, passed)
            if not passed: 
                all_passed = False
                
        if all_passed:
            print("\n🎉 ALL CHECKS PASSED!")
        else:
            print("\n⚠️ SOME CHECKS FAILED.")

    except Exception as e:
        print_result("Clarification Request", False, f"Exception: {e}")

if __name__ == "__main__":
    verify_clarification()
