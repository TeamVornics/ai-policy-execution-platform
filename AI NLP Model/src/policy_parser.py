"""Policy parser using Ollama for rule extraction (Local LLM Optimized)"""

import ollama
import json
import re
import time
from typing import List, Dict, Any, Optional
from .document_chunker import DocumentChunker
from .schema import PolicyRule, Policy, create_empty_rule
from .utils import clean_text, extract_sentences, generate_rule_id as utils_generate_rule_id
from datetime import datetime
from .cache_manager import CacheManager


class PolicyParser:
    """Parse policy documents and extract structured rules using Ollama"""
    
    def __init__(self, model_name: str = "llama3.1:8b"):
        """
        Initialize the policy parser
        """
        self.model_name = model_name
        self.client_ready = self.init_ollama_client()
        self.cache = CacheManager()
        self.chunker = DocumentChunker()
        
    def init_ollama_client(self) -> bool:
        """Check if Ollama is running and accessible"""
        try:
            ollama.list()
            return True
        except Exception as e:
            print(f"Warning: Ollama service check failed: {e}")
            return False

    def extract_rules_from_policy(self, policy_text: str, use_cache: bool = True) -> Dict[str, Any]:
        """
        Extract structured rules from raw policy text.
        Automatically handles large files via chunking.
        """
        # Clean text
        cleaned_text = clean_text(policy_text)
        
        # Check size for chunking strategy (>15k chars)
        if len(cleaned_text) > 15000:
            print(f"📚 Large Document Detected ({len(cleaned_text)} chars). Switching to Chunked Processing...")
            return self.extract_rules_from_large_policy(cleaned_text)
            
        if use_cache:
            cached = self.cache.get(policy_text)
            if cached:
                return cached
                
        if not self.client_ready:
            self.client_ready = self.init_ollama_client()
            if not self.client_ready:
                return self._fallback_extraction_as_dict(policy_text)
        
        return self._process_single_chunk(cleaned_text, use_cache)

    def extract_rules_from_large_policy(self, text: str) -> Dict[str, Any]:
        """Process large documents in chunks and merge results"""
        chunks = self.chunker.chunk_document(text)
        all_rules = []
        
        print(f"🔄 Processing {len(chunks)} chunks...")
        
        for chunk in chunks:
            print(f"   ▶ Processing Chunk {chunk['chunk_id']} ({len(chunk['content'])} chars)...")
            try:
                # We skip cache for individual chunks to ensure freshness during debug context
                # Pass chunk content to the existing processing logic
                # We construct a wrapper to re-use _process_single_chunk but we need to handle the return format
                
                # Direct call to ollama for the chunk to avoid full pipeline overhead/caching issues per chunk
                response_data = self._extract_via_ollama(chunk['content'])
                chunk_rules = response_data.get('rules', [])
                
                print(f"     ✅ Extracted {len(chunk_rules)} rules")
                all_rules.extend(chunk_rules)
                
            except Exception as e:
                print(f"     ❌ Error processing chunk {chunk['chunk_id']}: {e}")
        
        # Post-processing: Deduplicate and ID generation
        # Deduplication could be complex, for now we assume chunks have distinct rules
        
        # Re-assign sequential IDs
        for idx, rule in enumerate(all_rules):
            rule['rule_id'] = utils_generate_rule_id(idx + 1)
            
        return {
            "policy_id": "LG_POLICY_" + datetime.now().strftime("%Y%m%d"),
            "policy_title": "Large Policy Document", # Ideally extract title from first chunk
            "rules": all_rules,
            "metadata": {
                "chunking_used": True,
                "total_chunks": len(chunks),
                "total_rules": len(all_rules)
            }
        }

    def _process_single_chunk(self, text: str, use_cache: bool = True) -> Dict[str, Any]:
        """Original single-pass extraction logic"""
        # ... logic moved here from original extract_rules_from_policy ...
        # For refactor simplicity, I will call _extract_via_ollama helper
        
        result = self._extract_via_ollama(text)
        
        if use_cache:
            self.cache.set(text, result)
        return result

    def _extract_via_ollama(self, text: str) -> Dict[str, Any]:
        """Helper to call Ollama"""
        system_prompt = self._create_system_prompt()
        
        try:
            response = ollama.chat(
                model=self.model_name,
                messages=[
                    {'role': 'system', 'content': system_prompt},
                    {'role': 'user', 'content': text}
                ],
                format='json',
                options={'temperature': 0.1, 'num_predict': 2000}
            )
            content = response['message']['content']
            print(f"\n--- DEBUG RAW LLM RESPONSE START ---\n{content}\n--- DEBUG RAW LLM RESPONSE END ---\n")
            parsed = self._parse_json_response(content)
            return self.clean_extracted_rules(parsed)
        except Exception as e:
            print(f"Extraction Error: {e}")
            return {"rules": [], "policy_id": "ERR", "policy_title": "Error"}

    def _create_system_prompt(self) -> str:
        """Production-grade system prompt with strict quality enforcement"""
        return """You are a Policy Intelligence Engine. Extract EXECUTABLE policy rules from insurance documents.

NON-NEGOTIABLE CONSTRAINTS:

1. STRICT SCHEMA - Use EXACTLY this format:
{
  "policy_id": "POLICY_XXX",
  "policy_title": "Exact Title",
  "rules": [{
    "rule_id": "R1",
    "conditions": ["specific trigger"],
    "action": "concrete action with exact numbers",
    "responsible_role": "normalized role",
    "beneficiary": "who receives",
    "deadline": "explicit timeframe or empty",
    "ambiguity_flag": false,
    "ambiguity_reason": ""
  }]
}

2. WHAT COUNTS AS A RULE:
✅ Extract: obligations, permissions, restrictions, benefit payouts, required actions
❌ IGNORE: definitions, annexures, headers, tables, contact details, explanatory text

3. RULE ATOMICITY:
Split compound actions into separate atomic rules.
❌ BAD: "Pay death benefit in lumpsum or instalments"
✅ GOOD: Two rules - one for lumpsum, one for instalments

4. ROLE NORMALIZATION:
Use ONLY these exact roles:
- "LIC" (for Corporation, Insurer, Company)
- "Policyholder"
- "Life Assured"
- "Nominee"
- "Claimant"

5. MANDATORY AMBIGUITY DETECTION:
Set ambiguity_flag=true IF:
- responsible_role is empty
- deadline is empty when action requires timing
- text uses: "may", "as applicable", "subject to", "in accordance with"
- action cannot be system-executed

Provide clear ambiguity_reason for EVERY flagged rule.

6. EXACT DATA EXTRACTION:
Extract ALL numbers, percentages, timeframes exactly as stated:
- Interest rates (e.g., 9.5% p.a.)
- Time periods (e.g., 12 months, 30 days, 5 years)
- Percentages (e.g., 105%, 110%)
- Amounts (e.g., ₹10,000)

7. DEADLINE RULES:
- DO NOT guess or invent dates
- If event-based (death, maturity), state explicitly
- If unclear → leave empty and flag as ambiguous

Return ONLY valid JSON. No extra fields, metadata, or explanations."""


    def _parse_json_response(self, content: str) -> Dict[str, Any]:
        """Parse JSON response from LLM, handling potential formatting issues"""
        try:
            return json.loads(content)
        except json.JSONDecodeError:
            # Try to find JSON block if mixed with text
            match = re.search(r'\{.*\}', content, re.DOTALL)
            if match:
                return json.loads(match.group(0))
            raise ValueError("Could not parse JSON from response")

    def generate_rule_ids(self, num_rules: int) -> List[str]:
        """Generate a list of rule IDs"""
        return [f"R{i+1}" for i in range(num_rules)]

    def clean_extracted_rules(self, raw_json: Dict[str, Any]) -> Dict[str, Any]:
        """
        Post-process, clean, and validate the extracted rules.
        Adds confidence scoring and rule-level validation.
        """
        if not isinstance(raw_json, dict):
            # Try to recover if it's a list
            if isinstance(raw_json, list):
                return {"policy_id": "POLICY_UNKNOWN", "policy_title": "Unknown", "rules": raw_json}
            return {"policy_id": "POLICY_UNKNOWN", "policy_title": "Unknown", "rules": []}
            
        # Ensure top-level keys
        if "policy_id" not in raw_json:
            raw_json["policy_id"] = "POLICY_001"
        if "policy_title" not in raw_json:
            raw_json["policy_title"] = "Untitled Policy"
        if "rules" not in raw_json:
            raw_json["rules"] = []
            
        cleaned_rules = []
        total_confidence = 0.0
        
        for rule in raw_json.get("rules", []):
            if not isinstance(rule, dict):
                continue
                
            cleaned_rule = {
                "rule_id": rule.get("rule_id", ""),
                "conditions": rule.get("conditions", []),
                "action": str(rule.get("action", "") or ""),
                "responsible_role": str(rule.get("responsible_role", "") or ""),
                "beneficiary": str(rule.get("beneficiary", "") or ""),
                "deadline": str(rule.get("deadline", "") or ""),
                "ambiguity_flag": bool(rule.get("ambiguity_flag", False)),
                "ambiguity_reason": str(rule.get("ambiguity_reason", "") or "")
            }
            
            # --- VALIDATION LOGIC ---
            
            # 1. Check for vague roles
            role = cleaned_rule["responsible_role"].lower()
            vague_roles = ["authority", "official", "concerned officer", "department"]
            if any(vr in role for vr in vague_roles) and len(role) < 15: # heuristic
                # specific title usually longer than just "authority"
                if not cleaned_rule["ambiguity_flag"]:
                     cleaned_rule["ambiguity_flag"] = True
                     cleaned_rule["ambiguity_reason"] = f"Vague responsible role: '{cleaned_rule['responsible_role']}'. Specific title needed."
            
            # 2. Check for missing conditions when 'eligible' is mentioned
            action_text = cleaned_rule["action"].lower()
            if "eligible" in action_text and not cleaned_rule["conditions"]:
                if not cleaned_rule["ambiguity_flag"]:
                    cleaned_rule["ambiguity_flag"] = True
                    cleaned_rule["ambiguity_reason"] = "Action mentions eligibility but no conditions specified."

            # 3. Check for overly long actions (candidates for splitting)
            if len(cleaned_rule["action"]) > 150:
                # We don't split here, but we warn
                 if not cleaned_rule["ambiguity_flag"]:
                     cleaned_rule["ambiguity_flag"] = True
                     cleaned_rule["ambiguity_reason"] = "Action is too complex/long (>150 chars). Consider splitting."
                     
            # Standardize conditions
            conditions = cleaned_rule["conditions"]
            if isinstance(conditions, str):
                cleaned_rule["conditions"] = [conditions]
            elif isinstance(conditions, list):
                cleaned_rule["conditions"] = [str(c) for c in conditions if c is not None]
            else:
                cleaned_rule["conditions"] = []
                
            # --- CONFIDENCE SCORING ---
            rule_confidence = 1.0
            if cleaned_rule["ambiguity_flag"]:
                rule_confidence -= 0.3
            if not cleaned_rule["responsible_role"]:
                rule_confidence -= 0.2
            if not cleaned_rule["deadline"]:
                rule_confidence -= 0.1 # Deadlines aren't always mandatory
            
            cleaned_rule["confidence_score"] = max(0.0, round(rule_confidence, 2))
            total_confidence += rule_confidence
                
            cleaned_rules.append(cleaned_rule)
            
        raw_json["rules"] = cleaned_rules
        
        # Calculate overall confidence
        rule_count = len(cleaned_rules)
        avg_confidence = round(total_confidence / rule_count, 2) if rule_count > 0 else 0.0
        
        # Inject metadata
        if "metadata" not in raw_json:
            raw_json["metadata"] = {}
        raw_json["metadata"]["confidence_score"] = avg_confidence
        
        return raw_json

    def _fallback_extraction_as_dict(self, text: str) -> Dict[str, Any]:
        """Fallback extraction returning dict format"""
        sentences = extract_sentences(text)
        rules = []
        rule_ids = self.generate_rule_ids(len(sentences))
        
        for idx, sentence in enumerate(sentences):
            if len(sentence) > 10:
                rules.append({
                    "rule_id": rule_ids[idx],
                    "conditions": [],
                    "action": sentence,
                    "responsible_role": "",
                    "beneficiary": "",
                    "deadline": "",
                    "ambiguity_flag": False,
                    "ambiguity_reason": ""
                })
                
        return {
            "policy_id": "POLICY_FALLBACK",
            "policy_title": "Fallback Policy",
            "rules": rules
        }

    # Backward compatibility method for existing main.py and tests
    def parse_policy(self, policy_text: str, policy_id: str, policy_title: str) -> Policy:
        """
        Parse a policy document and extract structured rules (Compatible with original interface)
        """
        # Get rules as dict
        data = self.extract_rules_from_policy(policy_text)
        
        # Override ID and Title if provided
        data["policy_id"] = policy_id
        data["policy_title"] = policy_title
        
        # Convert to Policy objects
        rules = []
        for r_data in data.get("rules", []):
            # Ensure rule_id is present and clean
            rid = r_data.get("rule_id")
            if not rid:
                rid = "R_UNKNOWN"
                
            rule = PolicyRule(
                rule_id=rid,
                conditions=r_data.get("conditions", []),
                action=r_data.get("action", ""),
                responsible_role=r_data.get("responsible_role", ""),
                beneficiary=r_data.get("beneficiary", ""),
                deadline=r_data.get("deadline", ""),
                ambiguity_flag=r_data.get("ambiguity_flag", False),
                ambiguity_reason=r_data.get("ambiguity_reason", "")
            )
            rules.append(rule)
            
        return Policy(
            policy_id=policy_id,
            policy_title=policy_title,
            rules=rules
        )
