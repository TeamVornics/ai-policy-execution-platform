"""
Interactive Clarifier Module
Provides a conversational CLI for resolving policy ambiguities.
"""

import sys
import json
import time
from typing import List, Dict, Any, Set
from colorama import init, Fore, Style
from src.clarification_handler import ClarificationHandler

# Initialize colorama
init(autoreset=True)

class InteractiveClarifier:
    """Handles interactive conversational clarification with the user."""
    
    def __init__(self):
        self.handler = ClarificationHandler()
        self.history = []

    def print_banner(self, text: str):
        print(f"\n{Fore.CYAN}{Style.BRIGHT}{'=' * 60}")
        print(f"{text.center(60)}")
        print(f"{'=' * 60}{Style.RESET_ALL}")

    def print_rule_context(self, rule: Dict[str, Any]):
        """Displays the rule and its ambiguity clearly."""
        print(f"\n{Fore.YELLOW}🚨 Ambiguity Detected in Rule {rule['rule_id']}{Style.RESET_ALL}")
        print(f"{Fore.WHITE}Action:{Style.RESET_ALL} {rule['action']}")
        
        # Highlight missing parts
        reason = rule['ambiguity_reason']
        print(f"{Fore.RED}Issue:{Style.RESET_ALL} {reason}")
        
    def ask_smart_questions(self, rule: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyzes the rule and asks specific questions based on missing fields.
        Returns a clarification dictionary.
        """
        needed_fields = self.handler.fields_needing_clarification(rule)
        clarification = {"rule_id": rule['rule_id']}
        
        print(f"\n{Style.DIM}Let's clarify this:{Style.RESET_ALL}")
        
        # 1. Responsible Role
        if 'responsible_role' in needed_fields or not rule.get('responsible_role'):
            print(f"\n{Fore.GREEN}Q: Who should execute this action?{Style.RESET_ALL}")
            print(f"   {Style.DIM}(e.g., 'District Officer', 'School Principal'){Style.RESET_ALL}")
            res = self._get_input("Specific Role")
            if res:
                clarification['clarified_responsible_role'] = res

        # 2. Conditions
        if 'conditions' in needed_fields or not rule.get('conditions'):
            print(f"\n{Fore.GREEN}Q: What are the eligibility conditions?{Style.RESET_ALL}")
            print(f"   {Style.DIM}(Separate multiple conditions with commas){Style.RESET_ALL}")
            res = self._get_input("Conditions")
            if res:
                clarification['clarified_conditions'] = [c.strip() for c in res.split(',') if c.strip()]

        # 3. Deadline
        if 'deadline' in needed_fields or not rule.get('deadline'):
            print(f"\n{Fore.GREEN}Q: What is the deadline for this action?{Style.RESET_ALL}")
            print(f"   {Style.DIM}(e.g., '30 days', 'Immediate', 'Before academic year'){Style.RESET_ALL}")
            res = self._get_input("Deadline")
            if res:
                clarification['clarified_deadline'] = res

        return clarification

    def _get_input(self, prompt_label: str) -> str:
        """Helper to get validated input."""
        while True:
            try:
                val = input(f"{Fore.BLUE}> {Style.RESET_ALL}").strip()
                if val:
                    return val
                print(f"{Fore.RED}   Input cannot be empty. Please provide a {prompt_label.lower()} or type 'skip'.{Style.RESET_ALL}")
                if val.lower() == 'skip':
                    return ""
            except KeyboardInterrupt:
                print("\n")
                sys.exit(0)

    def review_and_confirm(self, rule: Dict[str, Any], clarification: Dict[str, Any]) -> bool:
        """Shows a preview of the merged rule and asks for confirmation."""
        print(f"\n{Fore.MAGENTA}✨ Proposed Update:{Style.RESET_ALL}")
        
        role = clarification.get('clarified_responsible_role', rule.get('responsible_role'))
        conds = clarification.get('clarified_conditions', rule.get('conditions'))
        deadline = clarification.get('clarified_deadline', rule.get('deadline'))

        print(f"  {Fore.WHITE}• Role:{Style.RESET_ALL}     {Fore.GREEN}{role}{Style.RESET_ALL}")
        print(f"  {Fore.WHITE}• Conditions:{Style.RESET_ALL} {Fore.GREEN}{conds}{Style.RESET_ALL}")
        print(f"  {Fore.WHITE}• Deadline:{Style.RESET_ALL}   {Fore.GREEN}{deadline}{Style.RESET_ALL}")
        
        choice = input(f"\nConfirm this clarification? ({Fore.GREEN}y{Style.RESET_ALL}/{Fore.RED}n{Style.RESET_ALL}): ").lower().strip()
        return choice == 'y'

    def run_session(self, ambiguous_rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Main loop for the interactive session."""
        self.print_banner("INTERACTIVE CLARIFICATION MODE")
        print(f"{Style.DIM}You have {len(ambiguous_rules)} rules to review.{Style.RESET_ALL}\n")
        
        clarifications = []
        
        for i, rule in enumerate(ambiguous_rules, 1):
            print(f"{Fore.CYAN}--- Rule {i} of {len(ambiguous_rules)} ---{Style.RESET_ALL}")
            self.print_rule_context(rule)
            
            # Simple check if user wants to strict skip
            start = input(f"\nClarify this rule? ({Fore.GREEN}y{Style.RESET_ALL}/{Fore.RED}n{Style.RESET_ALL}): ").lower().strip()
            if start != 'y':
                print(f"{Style.DIM}Skipping...{Style.RESET_ALL}\n")
                continue

            # Loop for QA until confirmed
            confirmed = False
            while not confirmed:
                clarification = self.ask_smart_questions(rule)
                if not clarification or len(clarification) == 1: # Only rule_id
                    print(f"{Fore.YELLOW}No changes provided. Skipping...{Style.RESET_ALL}")
                    break
                    
                confirmed = self.review_and_confirm(rule, clarification)
                
                if confirmed:
                    clarifications.append(clarification)
                    self.history.append({
                        "rule": rule,
                        "clarification": clarification,
                        "timestamp": time.time()
                    })
                    print(f"\n{Fore.GREEN}✅ Clarification recorded!{Style.RESET_ALL}\n")
                else:
                    print(f"\n{Fore.YELLOW}Let's try again...{Style.RESET_ALL}")

        self.print_banner("SESSION COMPLETE")
        return clarifications

    def save_session(self, filepath: str = "demo_data/clarification_session.json"):
        """Saves the Q&A history."""
        with open(filepath, 'w') as f:
            json.dump(self.history, f, indent=2)
        print(f"{Style.DIM}Session history saved to {filepath}{Style.RESET_ALL}")
