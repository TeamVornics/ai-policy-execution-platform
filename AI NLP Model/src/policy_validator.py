"""
Policy Rule Validator and Repair Engine

Post-processes extracted policy rules to ensure:
- No invalid rules (definitions, headers)
- Atomic rule structure
- Normalized roles
- Correct ambiguity flags
- No duplicates
- Backend executability
"""

import re
from typing import Dict, List, Any
from copy import deepcopy


class PolicyRuleValidator:
    """Validates and repairs extracted policy rules for production readiness"""
    
    def __init__(self):
        # Normalized role mapping
        self.role_mapping = {
            'corporation': 'LIC',
            'insurer': 'LIC',
            'company': 'LIC',
            'assurer': 'LIC',
            'lic': 'LIC',
            'proposer': 'Policyholder',
            'policyholder': 'Policyholder',
            'life assured': 'Life Assured',
            'nominee': 'Nominee',
            'claimant': 'Claimant'
        }
        
        # Valid normalized roles
        self.valid_roles = {'LIC', 'Policyholder', 'Life Assured', 'Nominee', 'Claimant'}
        
        # Keywords indicating non-rules (definitions, references)
        self.invalid_keywords = [
            'is defined as', 'means', 'refers to', 'definition',
            'section', 'annexure', 'table', 'chart', 'schedule',
            'grievance redressal', 'contact details', 'ombudsman',
            'part b', 'glossary', 'heading'
        ]
        
        # Vague terms requiring ambiguity flag
        self.ambiguity_triggers = [
            'may', 'as applicable', 'subject to', 'as per',
            'in accordance with', 'reasonable', 'appropriate',
            'shall be determined', 'at discretion'
        ]
    
    def validate_and_repair(self, policy_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Main validation and repair pipeline
        
        Steps:
        1. Filter invalid rules
        2. Split compound actions
        3. Normalize roles
        4. Normalize conditions
        5. Validate deadlines
        6. Enforce ambiguity flags
        7. Remove duplicates
        8. Final executability check
        """
        repaired = deepcopy(policy_data)
        
        rules = repaired.get('rules', [])
        
        print(f"\n🔍 VALIDATION PIPELINE")
        print(f"   Initial rules: {len(rules)}")
        
        # Step 1: Filter invalid rules
        rules = self._filter_invalid_rules(rules)
        print(f"   After filtering: {len(rules)}")
        
        # Step 2: Split compound actions
        rules = self._split_compound_actions(rules)
        print(f"   After atomicity split: {len(rules)}")
        
        # Step 3: Normalize roles
        rules = self._normalize_roles(rules)
        
        # Step 4: Normalize conditions
        rules = self._normalize_conditions(rules)
        
        # Step 5: Validate deadlines
        rules = self._validate_deadlines(rules)
        
        # Step 6: Enforce ambiguity flags
        rules = self._enforce_ambiguity_flags(rules)
        
        # Step 7: Remove duplicates
        rules = self._remove_duplicates(rules)
        print(f"   After deduplication: {len(rules)}")
        
        # Step 8: Reassign rule IDs
        for idx, rule in enumerate(rules):
            rule['rule_id'] = f"R{idx + 1}"
        
        repaired['rules'] = rules
        
        # Update metadata
        if 'metadata' in repaired:
            repaired['metadata']['total_rules'] = len(rules)
            repaired['metadata']['validated'] = True
        
        print(f"   ✅ Final validated rules: {len(rules)}\n")
        
        return repaired
    
    def _filter_invalid_rules(self, rules: List[Dict]) -> List[Dict]:
        """Remove rules that are actually definitions, headers, or references"""
        valid_rules = []
        
        for rule in rules:
            action = rule.get('action', '').lower()
            conditions = ' '.join(rule.get('conditions', [])).lower()
            
            # Check if action or conditions contain invalid keywords
            is_invalid = any(keyword in action or keyword in conditions 
                           for keyword in self.invalid_keywords)
            
            # Check if action is too vague (no verb)
            has_action_verb = any(verb in action for verb in [
                'pay', 'refund', 'deduct', 'cancel', 'revive', 'allow',
                'provide', 'grant', 'issue', 'inform', 'notify', 'submit'
            ])
            
            if not is_invalid and has_action_verb:
                valid_rules.append(rule)
        
        return valid_rules
    
    def _split_compound_actions(self, rules: List[Dict]) -> List[Dict]:
        """Split rules with compound actions into atomic rules"""
        atomic_rules = []
        
        for rule in rules:
            action = rule.get('action', '')
            
            # Check for OR clauses
            if ' or ' in action.lower() and 'and/or' not in action.lower():
                # Split on "or"
                parts = re.split(r'\s+or\s+', action, flags=re.IGNORECASE)
                if len(parts) == 2:
                    # Create two atomic rules
                    for part in parts:
                        new_rule = deepcopy(rule)
                        new_rule['action'] = part.strip()
                        atomic_rules.append(new_rule)
                    continue
            
            # If no split needed, keep original
            atomic_rules.append(rule)
        
        return atomic_rules
    
    def _normalize_roles(self, rules: List[Dict]) -> List[Dict]:
        """Normalize all responsible_role values"""
        for rule in rules:
            role = rule.get('responsible_role', '').strip()
            role_lower = role.lower()
            
            # Map to normalized role
            if role_lower in self.role_mapping:
                rule['responsible_role'] = self.role_mapping[role_lower]
            elif role and role not in self.valid_roles:
                # Try partial matching for compound roles like "LIC Claims Department"
                if 'lic' in role_lower or 'corporation' in role_lower or 'insurer' in role_lower:
                    rule['responsible_role'] = 'LIC'
                else:
                    # Keep as is but will be flagged as ambiguous later
                    pass
        
        return rules
    
    def _normalize_conditions(self, rules: List[Dict]) -> List[Dict]:
        """Normalize condition statements"""
        for rule in rules:
            conditions = rule.get('conditions', [])
            normalized = []
            
            for cond in conditions:
                # Remove heading-like conditions
                if cond.lower().strip() in ['death benefit', 'maturity benefit', 'surrender']:
                    continue
                
                # Keep event-based or eligibility conditions
                if cond.strip():
                    normalized.append(cond.strip())
            
            rule['conditions'] = normalized
        
        return rules
    
    def _validate_deadlines(self, rules: List[Dict]) -> List[Dict]:
        """Validate and clean deadline fields"""
        for rule in rules:
            deadline = rule.get('deadline', '').strip()
            
            # Remove generic/vague deadlines
            vague_deadlines = ['as soon as possible', 'asap', 'immediately', 'promptly']
            if deadline.lower() in vague_deadlines:
                rule['deadline'] = ''
            
            # Validate event-based deadlines are clear
            if deadline and 'as per' in deadline.lower():
                # Too vague, remove
                rule['deadline'] = ''
        
        return rules
    
    def _enforce_ambiguity_flags(self, rules: List[Dict]) -> List[Dict]:
        """Enforce mandatory ambiguity detection"""
        for rule in rules:
            reasons = []
            
            # Check for missing responsible_role
            if not rule.get('responsible_role', '').strip():
                reasons.append("Responsible authority not specified")
            
            # Check for invalid role
            elif rule.get('responsible_role') not in self.valid_roles:
                reasons.append(f"Role '{rule.get('responsible_role')}' not normalized")
            
            # Check for missing deadline when action requires timing
            action = rule.get('action', '').lower()
            deadline = rule.get('deadline', '').strip()
            
            action_requires_deadline = any(word in action for word in [
                'within', 'pay', 'refund', 'notify', 'inform', 'submit', 'process'
            ])
            
            if action_requires_deadline and not deadline:
                reasons.append("Deadline not explicitly stated")
            
            # Check for ambiguity trigger words
            full_text = action + ' ' + ' '.join(rule.get('conditions', []))
            for trigger in self.ambiguity_triggers:
                if trigger in full_text.lower():
                    reasons.append(f"Uses ambiguous term '{trigger}'")
                    break
            
            # Set ambiguity flag
            if reasons:
                rule['ambiguity_flag'] = True
                rule['ambiguity_reason'] = '; '.join(reasons)
            else:
                rule['ambiguity_flag'] = False
                rule['ambiguity_reason'] = ''
        
        return rules
    
    def _remove_duplicates(self, rules: List[Dict]) -> List[Dict]:
        """Remove duplicate rules"""
        unique_rules = []
        seen = set()
        
        for rule in rules:
            # Create signature for deduplication
            signature = (
                tuple(sorted(rule.get('conditions', []))),
                rule.get('action', '').strip(),
                rule.get('responsible_role', ''),
                rule.get('beneficiary', '')
            )
            
            if signature not in seen:
                seen.add(signature)
                unique_rules.append(rule)
        
        return unique_rules
    
    def get_quality_report(self, rules: List[Dict]) -> Dict[str, Any]:
        """Generate quality report for validated rules"""
        total = len(rules)
        executable = sum(1 for r in rules if not r.get('ambiguity_flag', False))
        ambiguous = total - executable
        
        role_distribution = {}
        for rule in rules:
            role = rule.get('responsible_role', 'Unknown')
            role_distribution[role] = role_distribution.get(role, 0) + 1
        
        return {
            'total_rules': total,
            'executable_rules': executable,
            'ambiguous_rules': ambiguous,
            'quality_score': round((executable / total * 100) if total > 0 else 0, 1),
            'role_distribution': role_distribution
        }
