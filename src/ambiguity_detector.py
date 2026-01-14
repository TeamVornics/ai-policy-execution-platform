"""Ambiguity detection module using RULE-BASED logic"""

from typing import List, Tuple, Dict, Any, Union
from .schema import PolicyRule, AMBIGUITY_TRIGGERS


class AmbiguityDetector:
    """Detect ambiguous language in policy rules using rule-based logic"""
    
    def __init__(self, custom_triggers: List[str] = None):
        """
        Initialize the ambiguity detector
        
        Args:
            custom_triggers: Additional ambiguity triggers beyond the default list
        """
        self.triggers = AMBIGUITY_TRIGGERS.copy()
        if custom_triggers:
            self.triggers.extend(custom_triggers)
            
    def detect_ambiguities(self, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process a list of rules (dicts) and flag ambiguities
        
        Args:
            rules: List of rule dictionaries
            
        Returns:
            List of updated rule dictionaries
        """
        updated_rules = []
        for rule in rules:
            is_ambiguous, reason = self.is_ambiguous(rule)
            rule['ambiguity_flag'] = is_ambiguous
            rule['ambiguity_reason'] = reason
            updated_rules.append(rule)
            
            # Log results as requested
            print(f"Checking Rule {rule.get('rule_id', 'Unknown')}:")
            if is_ambiguous:
                print(f"  ❌ AMBIGUOUS: {reason}")
            else:
                print(f"  ✅ CLEAR")
                
        self.print_summary(updated_rules)
        return updated_rules

    def flag_ambiguous_rules(self, rules: List[PolicyRule]) -> List[PolicyRule]:
        """
        Flag ambiguous rules (PolicyRule objects) - Backward compatibility wrapper
        
        Args:
            rules: List of PolicyRule objects
            
        Returns:
            List of updated PolicyRule objects
        """
        # Convert to dicts for processing
        rule_dicts = [rule.model_dump() for rule in rules]
        
        # Process
        updated_dicts = self.detect_ambiguities(rule_dicts)
        
        # Update objects
        for idx, rule in enumerate(rules):
            rule.ambiguity_flag = updated_dicts[idx]['ambiguity_flag']
            rule.ambiguity_reason = updated_dicts[idx]['ambiguity_reason']
            
        return rules

    def is_ambiguous(self, rule: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Check if a single rule is ambiguous using 5 specific triggers
        
        Args:
            rule: Rule dictionary
            
        Returns:
            Tuple (is_ambiguous, reason)
        """
        reasons = []
        
        # Extract fields safely
        action = str(rule.get('action', '') or '')
        conditions = rule.get('conditions', [])
        responsible_role = str(rule.get('responsible_role', '') or '')
        deadline = str(rule.get('deadline', '') or '')
        
        # Combine text for phrase searching
        full_text = f"{action} {' '.join(conditions)}".lower()
        
        # ---------------------------------------------------------
        # TRIGGER 1: Vague phrases in action or conditions
        # ---------------------------------------------------------
        found_phrase = self.check_phrase_ambiguity(full_text, self.triggers)
        if found_phrase:
            reasons.append(f"Contains vague phrase: '{found_phrase}'")
            
        # ---------------------------------------------------------
        # TRIGGER 2: Missing responsible_role
        # ---------------------------------------------------------
        if not responsible_role or responsible_role.lower() == "not specified":
            reasons.append("Responsible authority not specified")
            
        # ---------------------------------------------------------
        # TRIGGER 3: Missing conditions for conditional actions
        # ---------------------------------------------------------
        # Check if "eligible" is mentioned in action OR beneficiary without conditions
        if ("eligible" in action.lower() or "eligible" in str(rule.get('beneficiary', '')).lower()) and not conditions:
            reasons.append("Eligibility criteria not specified")
            
        # ---------------------------------------------------------
        # TRIGGER 4: Missing deadline for time-sensitive actions
        # ---------------------------------------------------------
        time_words = ["within", "before", "by", "during", "period"]
        has_time_word = any(word in action.lower() for word in time_words)
        if has_time_word and (not deadline or deadline.lower() == "not specified"):
            reasons.append("Time constraint mentioned but deadline not specified")
            
        # ---------------------------------------------------------
        # TRIGGER 5: Vague authority references
        # ---------------------------------------------------------
        vague_roles = ["authority", "official", "concerned officer", "department"]
        if responsible_role and any(vr == responsible_role.lower() for vr in vague_roles):
            reasons.append(f"Authority role is too vague: '{responsible_role}'")
            
        if reasons:
            return True, " + ".join(reasons)
            
        return False, ""

    def check_phrase_ambiguity(self, text: str, trigger_phrases: List[str]) -> Union[str, None]:
        """
        Helper to check if text contains any trigger phrase
        
        Args:
            text: Text to search
            trigger_phrases: List of phrases to look for
            
        Returns:
            The found phrase or None
        """
        text_lower = text.lower()
        for phrase in trigger_phrases:
            if phrase.lower() in text_lower:
                return phrase
        return None

    def get_ambiguity_summary(self, rules: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Get statistics about ambiguity
        
        Args:
            rules: List of rule dicts
            
        Returns:
            Dictionary with stats
        """
        total = len(rules)
        ambiguous_rules = [r for r in rules if r.get('ambiguity_flag')]
        ambiguous_count = len(ambiguous_rules)
        clear_count = total - ambiguous_count
        ids = [r.get('rule_id') for r in ambiguous_rules]
        
        return {
            "total_rules": total,
            "ambiguous_rules": ambiguous_count,
            "clear_rules": clear_count,
            "ambiguity_rate": f"{(ambiguous_count / total * 100):.1f}%" if total > 0 else "0%",
            "ambiguous_rule_ids": ids
        }

    def print_summary(self, rules: List[Dict[str, Any]]):
        """Print summary to console"""
        stats = self.get_ambiguity_summary(rules)
        print("-" * 40)
        print("AMBIGUITY DETECTION SUMMARY")
        print("-" * 40)
        print(f"Total Rules:     {stats['total_rules']}")
        print(f"Ambiguous Rules: {stats['ambiguous_rules']}")
        print(f"Clear Rules:     {stats['clear_rules']}")
        print(f"Ambiguity Rate:  {stats['ambiguity_rate']}")
        if stats['ambiguous_rule_ids']:
            print(f"Flagged IDs:     {', '.join(stats['ambiguous_rule_ids'])}")
        print("-" * 40)

    # Backward compatibility
    def get_ambiguity_stats(self, rules: List[PolicyRule]) -> dict:
        """Wrapper for backward compatibility with main.py"""
        rule_dicts = [rule.model_dump() for rule in rules]
        stats = self.get_ambiguity_summary(rule_dicts)
        # Rename keys to match old schema if needed, but the new structure is better
        # Original main.py expects: total_rules, ambiguous_rules, clear_rules, ambiguity_percentage
        return {
            "total_rules": stats["total_rules"],
            "ambiguous_rules": stats["ambiguous_rules"],
            "clear_rules": stats["clear_rules"],
            "ambiguity_percentage": float(stats["ambiguity_rate"].strip('%'))
        }
    
    def get_ambiguous_rules(self, rules: List[PolicyRule]) -> List[PolicyRule]:
        return [rule for rule in rules if rule.ambiguity_flag]
