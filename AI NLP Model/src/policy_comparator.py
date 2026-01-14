"""
Policy Comparator Module
Detects conflicts, duplicates, and overlaps between policies using rule-based NLP.
"""

import re
from typing import List, Dict, Set, Any, Tuple

class PolicyComparator:
    """
    Compares policy rules to identify conflicts and overlaps.
    Uses weighted text similarity (Jaccard Index) without heavy ML models.
    """
    
    # Weights for similarity calculation
    WEIGHTS = {
        'action': 0.4,
        'conditions': 0.3,
        'beneficiary': 0.2,
        'responsible_role': 0.1
    }
    
    # Thresholds
    HIGH_SIMILARITY = 0.8
    MEDIUM_SIMILARITY = 0.45
    
    def compare_policies(self, new_policy: Dict[str, Any], existing_policies: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Compare a new policy against a list of existing policies.
        
        Args:
            new_policy: The new policy dict (must contain 'rules')
            existing_policies: List of existing policy dicts
            
        Returns:
            Dict containing comparison results (conflicts, recommendations)
        """
        results = {
            "new_policy_id": new_policy.get('policy_id'),
            "conflicts": [],
            "recommendations": []
        }
        
        new_rules = new_policy.get('rules', [])
        
        for new_rule in new_rules:
            for ex_policy in existing_policies:
                ex_rules = ex_policy.get('rules', [])
                for ex_rule in ex_rules:
                    
                    similarity = self.calculate_rule_similarity(new_rule, ex_rule)
                    
                    if similarity > self.MEDIUM_SIMILARITY:
                        conflict_type, reason = self._determine_conflict_type(new_rule, ex_rule, similarity)
                        
                        conflict_entry = {
                            "existing_policy_id": ex_policy.get('policy_id'),
                            "existing_rule_id": ex_rule.get('rule_id'),
                            "new_rule_id": new_rule.get('rule_id'),
                            "conflict_type": conflict_type,
                            "similarity_score": round(similarity, 2),
                            "reason": reason
                        }
                        results["conflicts"].append(conflict_entry)
                        
                        # Generate recommendation
                        if conflict_type == "duplicate":
                            results["recommendations"].append(
                                f"Rule {new_rule.get('rule_id')} is a duplicate of {ex_policy.get('policy_id')}/{ex_rule.get('rule_id')}. Consider removing."
                            )
                        elif conflict_type == "contradiction":
                             results["recommendations"].append(
                                f"Rule {new_rule.get('rule_id')} contradicts {ex_policy.get('policy_id')}/{ex_rule.get('rule_id')}. Please resolve the contradictory actions."
                            )
                        elif conflict_type == "overlap":
                             results["recommendations"].append(
                                f"Rule {new_rule.get('rule_id')} overlaps with {ex_policy.get('policy_id')}/{ex_rule.get('rule_id')}. Ensure beneficiary scope is distinct."
                            )

        # Deduplicate recommendations
        results["recommendations"] = list(set(results["recommendations"]))
        return results

    def calculate_rule_similarity(self, rule1: Dict[str, Any], rule2: Dict[str, Any]) -> float:
        """
        Calculate weighted similarity score between two rules (0.0 to 1.0).
        """
        scores = {}
        
        # 1. Action Similarity (Weight: 40%)
        scores['action'] = self._jaccard_similarity(
            str(rule1.get('action', '')), 
            str(rule2.get('action', ''))
        )
        
        # 2. Conditions Similarity (Weight: 30%)
        # Join lists into single string for comparison
        cond1 = " ".join(rule1.get('conditions', []) or [])
        cond2 = " ".join(rule2.get('conditions', []) or [])
        scores['conditions'] = self._jaccard_similarity(cond1, cond2)
        
        # 3. Beneficiary Similarity (Weight: 20%)
        scores['beneficiary'] = self._jaccard_similarity(
            str(rule1.get('beneficiary', '')), 
            str(rule2.get('beneficiary', ''))
        )
        
        # 4. Role Similarity (Weight: 10%)
        scores['responsible_role'] = self._jaccard_similarity(
            str(rule1.get('responsible_role', '')), 
            str(rule2.get('responsible_role', ''))
        )
        
        # Weighted Check
        final_score = (
            scores['action'] * self.WEIGHTS['action'] +
            scores['conditions'] * self.WEIGHTS['conditions'] +
            scores['beneficiary'] * self.WEIGHTS['beneficiary'] +
            scores['responsible_role'] * self.WEIGHTS['responsible_role']
        )
        
        return final_score

    def _jaccard_similarity(self, text1: str, text2: str) -> float:
        """Calculate Jaccard similarity between two strings."""
        if not text1 and not text2:
            return 1.0
        if not text1 or not text2:
            return 0.0
            
        # Tokenize and clean
        tokens1 = self._tokenize(text1)
        tokens2 = self._tokenize(text2)
        
        if not tokens1 and not tokens2:
            return 1.0
            
        intersection = tokens1.intersection(tokens2)
        union = tokens1.union(tokens2)
        
        return len(intersection) / len(union)

    def _tokenize(self, text: str) -> Set[str]:
        """Convert text to set of cleaned tokens with basic normalization."""
        text = text.lower()
        
        # Split into alphanumeric chunks (handles "2L" -> "2", "L")
        # Keep only alphanumeric tokens
        raw_tokens = re.findall(r'[a-z]+|\d+', text)
        
        # logical synonyms map
        synonyms = {
            'award': 'provide',
            'give': 'provide',
            'disburse': 'provide',
            'receive': 'provide',
            'grant': 'provide',
            'less': 'lt',
            'below': 'lt',
            'under': 'lt',
            'lakh': 'l',
            'lac': 'l',
            'certificate': 'proof',
            'document': 'proof'
        }
        
        tokens = set()
        for word in raw_tokens:
            # Apply synonym mapping
            word = synonyms.get(word, word)
            tokens.add(word)
        
        # Basic stop words set
        stop_words = {
            'a', 'an', 'the', 'and', 'or', 'but', 'if', 'then', 'else', 
            'when', 'at', 'by', 'for', 'with', 'about', 'against', 'between',
            'into', 'through', 'during', 'before', 'after', 'above', 
            'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 
            'again', 'further', 'once', 'must', 'shall', 
            'will', 'can', 'may', 'should', 'of'
        }
        
        return tokens - stop_words

    def _determine_conflict_type(self, rule1: Dict[str, Any], rule2: Dict[str, Any], similarity: float) -> Tuple[str, str]:
        """Determine specific type of conflict based on similarity profile."""
        
        # Logic: 
        # - High Action Sim + High Beneficiary Sim = Duplicate
        # - High Beneficiary Sim + Low Action Sim = Contradiction (potentially) or different rules for same people
        # - High Action Sim + Low Conditions/Beneficiary = Overlap (same benefit, different people)
        
        action_sim = self._jaccard_similarity(str(rule1.get('action')), str(rule2.get('action')))
        beneficiary_sim = self._jaccard_similarity(str(rule1.get('beneficiary')), str(rule2.get('beneficiary')))
        
        reason = ""
        conflict_type = "overlap"
        
        if similarity > 0.85:
            conflict_type = "duplicate"
            reason = "Rules are nearly identical in action and scope."
        elif action_sim > 0.7 and beneficiary_sim > 0.7:
             conflict_type = "duplicate"
             reason = "Same action for same beneficiaries."
        elif beneficiary_sim > 0.8 and action_sim < 0.3:
            # Same people, very different action? Might be OK, but could be contradiction if actions are mutually exclusive
            # For this simple detector, we flag as potential contradiction if similarity is generally high? 
            # Actually, per user req, "Conflicting rules (contradictory actions)"
            # Basic NLP can't easily detect logical contradiction (e.g. "Give money" vs "Take money"), 
            # so we assume high overlap usually implies conflict/redundancy for this demo.
            conflict_type = "contradiction" 
            reason = "High overlap in scope but distinct actions."
        else:
            conflict_type = "overlap"
            reason = "Partial overlap in conditions or scope."
            
        return conflict_type, reason
