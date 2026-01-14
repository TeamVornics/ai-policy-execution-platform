"""
Demo Mode Post-Processor

Transforms production policy extraction into clean, demonstrable output
optimized for hackathons and presentations.

Goals:
- Ultra-clean schema compliance (no extra keys)
- 5-8 high-quality rules maximum
- Crystal-clear readability
- Every rule is executable OR clearly ambiguous
"""

import re
from typing import Dict, List, Any
from copy import deepcopy


class DemoModeFixer:
    """Post-processes policy extraction for hackathon demonstrations"""
    
    def __init__(self):
        # Normalized role mapping (strict)
        self.valid_roles = {'LIC', 'Policyholder', 'Life Assured', 'Nominee', 'Claimant'}
        
        # Keywords indicating non-demo-worthy rules
        self.skip_keywords = [
            'is defined', 'means', 'refers to', 'section', 'annexure',
            'table', 'act', 'provision', 'amendment', 'explanation'
        ]
        
        # Ambiguity triggers
        self.ambiguity_triggers = [
            'may', 'as applicable', 'subject to', 'as per',
            'in accordance with', 'approval', 'discretion'
        ]
    
    def fix_for_demo(self, policy_data: Dict[str, Any], target_rules: int = 7) -> Dict[str, Any]:
        """
        Transform policy extraction into demo-ready output
        
        Args:
            policy_data: Raw policy extraction result
            target_rules: Target number of rules (default 7)
        
        Returns:
            Clean, demo-ready policy JSON
        """
        print(f"\n🎯 DEMO MODE FIXER")
        print(f"   Target: {target_rules} high-quality rules")
        
        # Step 1: Hard cleanup - remove all non-schema keys
        clean_data = self._hard_cleanup(policy_data)
        
        # Step 2: Extract and filter rules
        rules = clean_data.get('rules', [])
        print(f"   Initial rules: {len(rules)}")
        
        # Step 3: Prune to demo-worthy rules only
        rules = self._prune_for_demo(rules)
        print(f"   After pruning: {len(rules)}")
        
        # Step 4: Merge fragmented rules
        rules = self._merge_broken_rules(rules)
        print(f"   After merging: {len(rules)}")
        
        # Step 5: Normalize roles
        rules = self._normalize_roles_strict(rules)
        
        # Step 6: Normalize conditions
        rules = self._normalize_conditions(rules)
        
        # Step 7: Enforce ambiguity flags
        rules = self._enforce_ambiguity_demo(rules)
        
        # Step 8: Select top N rules if we have too many
        if len(rules) > target_rules:
            rules = self._select_top_rules(rules, target_rules)
            print(f"   Reduced to top {target_rules} rules")
        
        # Step 9: Reassign clean IDs
        for idx, rule in enumerate(rules):
            rule['rule_id'] = f"R{idx + 1}"
        
        clean_data['rules'] = rules
        
        print(f"   ✅ Final demo-ready rules: {len(rules)}")
        print(f"   📊 Executable: {sum(1 for r in rules if not r.get('ambiguity_flag', False))}")
        print(f"   ⚠️  Ambiguous: {sum(1 for r in rules if r.get('ambiguity_flag', False))}\n")
        
        return clean_data
    
    def _hard_cleanup(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Remove all non-schema keys"""
        return {
            'policy_id': data.get('policy_id', 'POLICY_001'),
            'policy_title': data.get('policy_title', 'Policy Document'),
            'rules': data.get('rules', [])
        }
    
    def _prune_for_demo(self, rules: List[Dict]) -> List[Dict]:
        """Keep only demo-worthy rules"""
        demo_rules = []
        
        for rule in rules:
            action = rule.get('action', '').lower()
            
            # Skip if action contains skip keywords
            if any(kw in action for kw in self.skip_keywords):
                continue
            
            # Skip if action is too vague or short
            if len(action.strip()) < 15:
                continue
            
            # Must have key benefit/action verbs
            has_demo_verb = any(verb in action for verb in [
                'pay', 'refund', 'provide', 'grant', 'allow', 'deduct',
                'cancel', 'revive', 'issue', 'receive', 'submit', 'notify'
            ])
            
            if has_demo_verb:
                demo_rules.append(rule)
        
        return demo_rules
    
    def _merge_broken_rules(self, rules: List[Dict]) -> List[Dict]:
        """Merge fragmented rules that belong together"""
        # For demo mode, we'll keep rules separate unless they're obviously fragments
        # This is a simplified version - production would use more sophisticated NLP
        
        merged = []
        skip_next = False
        
        for i, rule in enumerate(rules):
            if skip_next:
                skip_next = False
                continue
            
            action = rule.get('action', '').strip()
            
            # Check if action is a fragment (ends mid-sentence)
            if action and not action[-1] in '.!?' and i < len(rules) - 1:
                next_rule = rules[i + 1]
                next_action = next_rule.get('action', '').strip()
                
                # If next action seems like a continuation, merge
                if next_action and len(next_action) < 30:
                    rule['action'] = f"{action} {next_action}"
                    skip_next = True
            
            merged.append(rule)
        
        return merged
    
    def _normalize_roles_strict(self, rules: List[Dict]) -> List[Dict]:
        """Strict role normalization"""
        role_map = {
            'corporation': 'LIC',
            'insurer': 'LIC',
            'company': 'LIC',
            'proposer': 'Policyholder',
            'beneficiary': 'Nominee'  # As actor
        }
        
        for rule in rules:
            role = rule.get('responsible_role', '').strip()
            role_lower = role.lower()
            
            # Direct mapping
            if role_lower in role_map:
                rule['responsible_role'] = role_map[role_lower]
            # Partial match for complex roles
            elif any(key in role_lower for key in ['lic', 'corporation', 'insurer']):
                rule['responsible_role'] = 'LIC'
            # If not in valid roles and not mappable, leave as-is (will be flagged)
        
        return rules
    
    def _normalize_conditions(self, rules: List[Dict]) -> List[Dict]:
        """Rewrite conditions as clear events"""
        for rule in rules:
            conditions = rule.get('conditions', [])
            normalized = []
            
            for cond in conditions:
                cond = cond.strip()
                
                # Skip empty or heading-like conditions
                if not cond or cond.lower() in ['benefit', 'maturity', 'death']:
                    continue
                
                # Rewrite common patterns
                if 'in-force' in cond.lower():
                    cond = 'Policy is active and not lapsed'
                elif 'grace period' in cond.lower():
                    cond = 'Premium not paid within grace period'
                
                normalized.append(cond)
            
            rule['conditions'] = normalized
        
        return rules
    
    def _enforce_ambiguity_demo(self, rules: List[Dict]) -> List[Dict]:
        """Enforce clear ambiguity flags for demo clarity"""
        for rule in rules:
            reasons = []
            
            # Check role
            role = rule.get('responsible_role', '').strip()
            if not role:
                reasons.append("Responsible role not specified")
            elif role not in self.valid_roles:
                reasons.append(f"Role '{role}' unclear")
            
            # Check deadline
            action = rule.get('action', '').lower()
            deadline = rule.get('deadline', '').strip()
            
            # If action implies timing but no deadline
            timing_words = ['pay', 'submit', 'notify', 'within', 'before']
            if any(word in action for word in timing_words) and not deadline:
                reasons.append("Deadline not specified in policy text")
            
            # Check for ambiguity trigger words
            full_text = action + ' ' + ' '.join(rule.get('conditions', []))
            for trigger in self.ambiguity_triggers:
                if trigger in full_text.lower():
                    reasons.append(f"Contains discretionary term '{trigger}'")
                    break
            
            # Set flag and reason
            if reasons:
                rule['ambiguity_flag'] = True
                rule['ambiguity_reason'] = '; '.join(reasons[:2])  # Max 2 reasons for clarity
            else:
                rule['ambiguity_flag'] = False
                rule['ambiguity_reason'] = ''
        
        return rules
    
    def _select_top_rules(self, rules: List[Dict], target: int) -> List[Dict]:
        """Select top N most demonstrable rules"""
        # Scoring criteria for demo worthiness
        def demo_score(rule):
            score = 0
            
            # Prefer executable over ambiguous
            if not rule.get('ambiguity_flag', False):
                score += 10
            
            # Prefer rules with clear beneficiaries
            if rule.get('beneficiary', '').strip():
                score += 5
            
            # Prefer rules with deadlines
            if rule.get('deadline', '').strip():
                score += 3
            
            # Prefer rules with multiple conditions
            score += len(rule.get('conditions', []))
            
            # Prefer longer, more detailed actions
            action_len = len(rule.get('action', ''))
            if action_len > 40:
                score += 2
            
            return score
        
        # Sort by score and take top N
        scored_rules = sorted(rules, key=demo_score, reverse=True)
        return scored_rules[:target]
    
    def validate_demo_output(self, policy_data: Dict[str, Any]) -> bool:
        """Validate demo output meets all requirements"""
        # Must have only schema keys
        allowed_keys = {'policy_id', 'policy_title', 'rules'}
        if set(policy_data.keys()) != allowed_keys:
            return False
        
        # Each rule must have only schema keys
        rule_schema = {
            'rule_id', 'conditions', 'action', 'responsible_role',
            'beneficiary', 'deadline', 'ambiguity_flag', 'ambiguity_reason'
        }
        
        for rule in policy_data.get('rules', []):
            if set(rule.keys()) != rule_schema:
                return False
            
            # Each rule must make sense
            if not rule.get('action', '').strip():
                return False
        
        return True
