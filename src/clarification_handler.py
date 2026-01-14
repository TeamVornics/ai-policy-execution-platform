"""Clarification handler for ambiguous rules (Human-in-the-loop)"""

from typing import List, Dict, Any, Tuple, Optional
import copy


class ClarificationHandler:
    """Handle human clarifications for ambiguous policy rules"""
    
    def __init__(self, model_name: str = "llama3.1:8b"):
        """
        Initialize the clarification handler
        
        Args:
            model_name: Name of the Ollama model to use (kept for compatibility, though not used in this logic)
        """
        self.model_name = model_name
    
    def apply_clarification(self, rule: Dict[str, Any], clarifications: Dict[str, Any]) -> Dict[str, Any]:
        """
        Apply human clarification to an ambiguous rule
        
        Args:
            rule: Original ambiguous rule
            clarifications: Dictionary containing clarified fields
            
        Returns:
            Updated rule with ambiguity cleared
        """
        # Validate input first
        is_valid, error = self.validate_clarification(clarifications)
        if not is_valid:
            print(f"Error applying clarification: {error}")
            return rule
            
        # Ensure we're working with the correct rule
        if rule.get('rule_id') != clarifications.get('rule_id'):
            print(f"Error: Rule ID mismatch. Expected {rule.get('rule_id')}, got {clarifications.get('rule_id')}")
            return rule
            
        # Merge clarifications
        updated_rule = self.merge_clarifications(rule, clarifications)
        
        # Clear ambiguity flags
        updated_rule['ambiguity_flag'] = False
        updated_rule['ambiguity_reason'] = ""
        
        return updated_rule

    def merge_clarifications(self, original_rule: Dict[str, Any], clarifications: Dict[str, Any]) -> Dict[str, Any]:
        """
        Merge clarified fields into the original rule
        
        Args:
            original_rule: The original rule dict
            clarifications: The clarification data
            
        Returns:
            New dict with merged data
        """
        # Create a deep copy to avoid mutating the original
        merged_rule = copy.deepcopy(original_rule)
        
        # Map clarification keys to rule keys
        field_mapping = {
            'clarified_responsible_role': 'responsible_role',
            'clarified_deadline': 'deadline',
            'clarified_beneficiary': 'beneficiary',
            'clarified_action': 'action'
        }
        
        # Apply simple field updates
        for clar_key, rule_key in field_mapping.items():
            if clar_key in clarifications and clarifications[clar_key]:
                merged_rule[rule_key] = clarifications[clar_key]
                
        # Handle conditions specifically (append, don't replace)
        if 'clarified_conditions' in clarifications:
            new_conditions = clarifications['clarified_conditions']
            if isinstance(new_conditions, list):
                # Ensure we have a list to append to
                if not isinstance(merged_rule.get('conditions'), list):
                    merged_rule['conditions'] = []
                
                # Append only unique new conditions
                existing_conditions = set(merged_rule['conditions'])
                for cond in new_conditions:
                    if cond and cond not in existing_conditions:
                        merged_rule['conditions'].append(cond)
                        
        return merged_rule

    def validate_clarification(self, clarifications: Dict[str, Any]) -> Tuple[bool, str]:
        """
        Validate clarification input data
        
        Args:
            clarifications: Input dictionary
            
        Returns:
            Tuple (is_valid, error_message)
        """
        if not isinstance(clarifications, dict):
            return False, "Input must be a dictionary"
            
        # Check rule_id existence
        if 'rule_id' not in clarifications or not clarifications['rule_id']:
            return False, "Missing required field: rule_id"
            
        # Check if at least one clarified field is present and non-empty
        clarified_fields = [
            'clarified_responsible_role',
            'clarified_deadline',
            'clarified_conditions',
            'clarified_beneficiary',
            'clarified_action'
        ]
        
        has_content = False
        for field in clarified_fields:
            if field in clarifications:
                val = clarifications[field]
                if isinstance(val, list) and len(val) > 0:
                    has_content = True
                    break
                elif isinstance(val, str) and val.strip():
                    has_content = True
                    break
                    
        if not has_content:
            return False, "At least one clarified field must be provided and non-empty"
            
        return True, ""

    def get_pending_clarifications(self, rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Get list of rules needing clarification formatted for UI
        
        Args:
            rules: List of all rules
            
        Returns:
            List of formatted clarification requests
        """
        pending = []
        for rule in rules:
            if rule.get('ambiguity_flag'):
                request = {
                    "rule_id": rule.get('rule_id'),
                    "current_action": rule.get('action'),
                    "ambiguity_reason": rule.get('ambiguity_reason'),
                    "fields_needing_clarification": self.fields_needing_clarification(rule)
                }
                pending.append(request)
        return pending

    def fields_needing_clarification(self, rule: Dict[str, Any]) -> List[str]:
        """
        Identify which fields need clarification based on rule state
        
        Args:
            rule: The ambiguous rule
            
        Returns:
            List of field names
        """
        needed = []
        
        # Check empty fields
        if not rule.get('responsible_role'):
            needed.append('responsible_role')
        if not rule.get('deadline'):
            needed.append('deadline')
        if not rule.get('beneficiary'):
            needed.append('beneficiary')
        if not rule.get('conditions'):
            needed.append('conditions')
            
        # Check ambiguity checks from reason
        reason = rule.get('ambiguity_reason', '').lower()
        if 'vague phrase' in reason or 'action' in reason:
            needed.append('action')
            
        return list(set(needed))

    def process_batch_clarifications(self, rules: List[Dict[str, Any]], clarifications_list: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Process multiple clarifications at once
        
        Args:
            rules: Original list of rules
            clarifications_list: List of clarification inputs
            
        Returns:
            Updated list of rules
        """
        # Create a map for faster lookup
        clarification_map = {c['rule_id']: c for c in clarifications_list if 'rule_id' in c}
        
        updated_rules = []
        for rule in rules:
            rule_id = rule.get('rule_id')
            if rule_id in clarification_map:
                # Apply clarification
                print(f"Applying clarification to Rule {rule_id}...")
                updated_rule = self.apply_clarification(rule, clarification_map[rule_id])
                updated_rules.append(updated_rule)
            else:
                updated_rules.append(rule)
                
        return updated_rules
