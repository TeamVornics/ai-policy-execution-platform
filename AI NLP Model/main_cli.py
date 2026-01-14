"""
POLICY ANALYSIS AI ENGINE - MAIN DEMO SCRIPT
=============================================
Orchestrates the complete workflow:
1. Policy Ingestion
2. Rule Extraction (Ollama LLM)
3. Ambiguity Detection (Rule-Based)
4. Human-in-the-loop Clarification
5. Structured JSON Output
"""

import sys
import os
import json
import time
import argparse
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Any, Optional
from tqdm import tqdm


# Add src to path
sys.path.insert(0, str(Path(__file__).parent / 'src'))

from src.policy_parser import PolicyParser
from src.ambiguity_detector import AmbiguityDetector
from src.clarification_handler import ClarificationHandler
from src.workflow_visualizer import WorkflowVisualizer
from src.policy_comparator import PolicyComparator
from src.timeline_estimator import TimelineEstimator
from src.multilingual_parser import MultilingualParser
from src.policy_parser_parallel import ParallelPolicyParser
from src.interactive_clarifier import InteractiveClarifier
from src.policy_validator import PolicyRuleValidator  # NEW: Quality assurance layer
from src.utils import save_json, load_text_file

# Constants for console formatting
HEADER_WIDTH = 60
DOUBLE_LINE = "=" * HEADER_WIDTH
SINGLE_LINE = "-" * HEADER_WIDTH

def print_header(title: str):
    """Print a formatted section header"""
    print(f"\n{DOUBLE_LINE}")
    print(f"STEP {title}")
    print(DOUBLE_LINE)

def create_demo_policy() -> str:
    """Returns the exact demo policy text requested"""
    return """POLICY: Student Scholarship Scheme 2024

1. Students belonging to SC/ST category shall receive ₹10,000 annual 
   scholarship after verification by the District Education Officer 
   within 15 days of application.

2. Eligible students from economically weaker sections may receive 
   scholarships as applicable, subject to approval.

3. All applicants must submit income certificate, caste certificate, 
   and enrollment proof to the Block Education Officer before the 
   academic year begins."""

def create_demo_clarifications() -> List[Dict[str, Any]]:
    """Returns detailed clarifications for Rule 2"""
    return [{
        "rule_id": "R2",
        "clarified_responsible_role": "District Education Officer",
        "clarified_deadline": "30 days from application receipt",
        "clarified_conditions": [
            "Annual family income < ₹2,00,000",
            "Student enrolled in recognized institution"
        ]
    }]

def run_full_pipeline(policy_text: str, clarifications_list: List[Dict[str, Any]] = None, interactive: bool = False, demo_data: bool = False, lang: str = "en", parallel: bool = False) -> Dict[str, Any]:
    """
    Orchestrates the entire policy analysis process
    """
    # Initialize components
    print("🤖 Initializing AI Engine (Ollama: llama3.1:8b)...")
    
    if parallel and lang == 'en':
        print("⚡ Using ParallelPolicyParser for high-speed extraction")
        base_parser = ParallelPolicyParser(model_name="llama3.1:8b")
    else:
        base_parser = PolicyParser(model_name="llama3.1:8b")
        
    multi_parser = MultilingualParser(base_parser)
    detector = AmbiguityDetector()
    clarifier = ClarificationHandler()
    
    # Check client readiness (ParallelParser might not have this attr, need check)
    if hasattr(base_parser, 'client_ready') and not base_parser.client_ready:
         print("❌ Error: Ollama is not running. Please start it with 'ollama serve'")
         sys.exit(1)
         
    # STEP 1: POLICY INPUT
    print_header("1: POLICY INPUT")
    print(policy_text.strip())

    # STEP 2: EXTRACTED RULES
    print_header("2: EXTRACTED RULES (Raw via Ollama)")
    
    t0 = time.time()
    # Use Multilingual Parser
    if parallel and lang == 'en':
        # Direct parallel call
        extracted_data = base_parser.extract_rules_parallel(policy_text)
    else:
        extracted_data = multi_parser.parse_multilingual_policy(policy_text, use_cache=True)
    t1 = time.time()
    time_extraction = t1 - t0
    
    print(f"✅ Extraction complete in {time_extraction:.2f}s")
    # Compact print for better UX
    print(f"    Extracted {len(extracted_data.get('rules', []))} rules.")
    
    # STEP 2.5: VALIDATION AND REPAIR (NEW)
    print_header("2.5: RULE VALIDATION & REPAIR")
    validator = PolicyRuleValidator()
    t_val_start = time.time()
    extracted_data = validator.validate_and_repair(extracted_data)
    t_val_end = time.time()
    time_validation = t_val_end - t_val_start
    
    # Print quality report
    quality_report = validator.get_quality_report(extracted_data.get('rules', []))
    print(f"📊 Quality Report:")
    print(f"   Total Rules: {quality_report['total_rules']}")
    print(f"   Executable: {quality_report['executable_rules']}")
    print(f"   Ambiguous: {quality_report['ambiguous_rules']}")
    print(f"   Quality Score: {quality_report['quality_score']}%")
    print(f"   Validation Time: {time_validation:.2f}s")
    
    # STEP 3: AMBIGUITY DETECTION
    print_header("3: AMBIGUITY DETECTION")
    rules = extracted_data.get('rules', [])
    updated_rules = []
    
    t2 = time.time()
    # Progress Bar for Ambiguity Detection
    for rule in tqdm(rules, desc="Analyzing Rules", unit="rule"):
        # Process one by one (simulated loop, actually detect_ambiguities processes batch)
        # But for progress bar effect we can iterate or just wrap the function calls inside
        # Since our detector is fast, we'll keep it simple:
        pass
        
    updated_rules = detector.detect_ambiguities(rules)
    t3 = time.time()
    time_detection = t3 - t2
    
    # Get stats
    stats = detector.get_ambiguity_summary(updated_rules)
    print(f"Total Rules: {stats['total_rules']}")
    print(f"Ambiguous Rules: {stats['ambiguous_rules']}")
    if stats['ambiguous_rules'] > 0:
        print(f"Flagged IDs: {', '.join(stats['ambiguous_rule_ids'])}")
        
        for rule in updated_rules:
            if rule['ambiguity_flag']:
                print(f"    ⚠️  {rule['rule_id']}: {rule['ambiguity_reason']}")

    # STEP 4: CLARIFICATION APPLIED
    print_header("4: CLARIFICATION APPLIED")
    
    final_rules = updated_rules
    ambiguous_rules = [r for r in updated_rules if r['ambiguity_flag']]
    
    t4 = time.time()
    if ambiguous_rules:
        # Check interactive mode
        if interactive:
            interactive_ui = InteractiveClarifier()
            clarifications_list = interactive_ui.run_session(ambiguous_rules)
            interactive_ui.save_session()
        
        if clarifications_list:
            # We must be careful to match rule_ids if they changed during translation, but assuming R1, R2, etc.
            # If IDs are generated dynamically 1-based, we might have issues if clarifying specific R2.
            # For demo, R2 matches because extracting 3 rules.
            print(f"Applying {len(clarifications_list)} clarifications...")
            final_rules = clarifier.process_batch_clarifications(updated_rules, clarifications_list)
        else:
            print("No clarifications provided.")
    else:
        print("No ambiguous rules to clarify.")
    t5 = time.time()
    time_clarification = t5 - t4

    # STEP 5: FINAL CLEAN OUTPUT
    print_header("5: PERFORMANCE REPORT & OUTPUT")
    
    # Construct final object
    final_output = {
        "metadata": {
            "processed_at": datetime.now().isoformat(),
            "total_rules": len(final_rules),
            "clarified_rules": len(clarifications_list) if clarifications_list else 0,
            "model_used": "llama3.1:8b",
            "ambiguity_resolved": True if clarifications_list else False,
            "multilingual_metadata": extracted_data.get("metadata", {})
        },
        "policy_id": extracted_data.get('policy_id'),
        "policy_title": extracted_data.get('policy_title'),
        "rules": final_rules
    }
    
    # Performance Report
    total_time = time.time() - t0
    print("⚡ PERFORMANCE METRICS:")
    print(f"  - Extraction:      {time_extraction:.4f}s")
    print(f"  - Ambiguity Check: {time_detection:.4f}s")
    print(f"  - Clarification:   {time_clarification:.4f}s")
    print(f"  - Total Pipeline:  {total_time:.4f}s")
    
    print("\n📦 Final JSON Output (Snippet):")
    print(json.dumps(final_output, indent=2)[:300] + "\n... [truncated]")
    
    # STEP 6: VISUALIZATION
    print_header("6: WORKFLOW VISUALIZATION")

    visualizer = WorkflowVisualizer()
    graph = visualizer.generate_graph(final_rules, title=final_output['policy_title'])
    
    print("🎨 Generating flowchart...")
    saved_paths = visualizer.save_visualization(graph)
    
    if 'html' in saved_paths:
        print(f"✅ Interactive Flowchart: {saved_paths['html']}")
    if 'png' in saved_paths:
        print(f"✅ PNG Image: {saved_paths['png']}")
    
    # STEP 7: TIMELINE ESTIMATION
    print_header("7: EXECUTION TIMELINE")
    estimator = TimelineEstimator()
    timeline_data = estimator.generate_execution_timeline(final_rules)
    
    # Print Gantt Chart
    print(estimator.visualize_timeline(timeline_data))
    
    # Print Warnings/Recommendations
    if timeline_data['bottlenecks'] or timeline_data['warnings']:
        print("\n⚠️  Optimization Insights:")
        for b in timeline_data['bottlenecks']:
            print(f"  - {b}")
        for w in timeline_data['warnings']:
            print(f"  - {w}")
            
    # Save Timeline Data
    final_output['timeline_analysis'] = timeline_data
    save_json(timeline_data, "demo_data/timeline_report.json")
    print("\n✅ detailed timeline saved to demo_data/timeline_report.json")
    
    return final_output



def run_demo_mode(lang: str = 'en', interactive: bool = False):
    """Run the complete end-to-end demo with pre-seeded data"""
    print("🚀 STARTING DEMO MODE")
    print("🤖 Initializing AI Engine (Ollama: llama3.1:8b)...")
    
    # 1. Load Sample Policy
    if lang == 'hi':
        policy_text = load_text_file("demo_data/sample_policy_hi.txt")
        if not policy_text:
            print("❌ Demo file not found. Creating sample...")
            # Fallback inline creation just in case file write failed
            policy_text = """छात्रवृत्ति योजना 2024:
1. अनुसूचित जाति (SC) के छात्र ₹10,000 की छात्रवृत्ति प्राप्त करेंगे।"""
    else:
        policy_text = create_demo_policy()

    # 2. Define Demo Clarifications
    # If interactive, we DON'T want pre-seeded clarifications, we want to ask the user.
    clarifications = None
    if not interactive:
        clarifications = [
            {
                "rule_id": "R2", 
                "clarification": "Priority given to income < 2L and government school enrolment.",
                "type": "ambiguity_resolution"
            }
        ]
    
    final_output = run_full_pipeline(policy_text, clarifications, interactive=interactive)
    
    # Save output
    output_path = Path("demo_data/demo_output.json")
    save_json(final_output, output_path)
    print(f"\n✅ Output saved to: {output_path}")

# ... (run_file_mode and run_interactive_mode remain same)




def run_file_mode(filepath: str, parallel: bool = False):
    """Run pipeline on custom file"""
    try:
        policy_text = load_text_file(filepath)
        final_output = run_full_pipeline(policy_text, interactive=False, parallel=parallel) # Non-interactive default for file mode unless flagged
        
        output_path = Path("demo_data/custom_output.json")
        save_json(final_output, output_path)
        print(f"\n✅ Output saved to: {output_path}")
    except FileNotFoundError:
        print(f"❌ Error: File not found at {filepath}")

def run_interactive_mode():
    """Run pipeline enabling user input"""
    print("👋 WELCOME TO INTERACTIVE MODE")
    print("Paste your policy text below (Press Ctrl+D or Ctrl+Z on new line to finish):")
    
    try:
        lines = sys.stdin.readlines()
        policy_text = "".join(lines)
        
        if not policy_text.strip():
            print("No text provided. Exiting.")
            return

        final_output = run_full_pipeline(policy_text, interactive=True)
        
        output_path = Path("demo_data/interactive_output.json")
        save_json(final_output, output_path)
        print(f"\n✅ Output saved to: {output_path}")
        
    except KeyboardInterrupt:
        print("\nExiting.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Policy Analysis AI Engine CLI")
    parser.add_argument("--demo", action="store_true", help="Run the pre-scripted demo")
    parser.add_argument('--lang', type=str, default='en', choices=['en', 'hi'], help='Language for demo (en/hi)')
    parser.add_argument("--interactive", action="store_true", help="Run in interactive mode")
    parser.add_argument("--file", type=str, help="Process a specific policy text file")
    
    parser.add_argument("--check-conflicts", action="store_true", help="Check for conflicts with existing policies")
    parser.add_argument("--parallel", action="store_true", help="Enable parallel chunk processing (Faster)")
    
    args = parser.parse_args()
    
    # Ensure demo dir exists
    os.makedirs("demo_data", exist_ok=True)
    
    if args.check_conflicts:
        # Run Conflict Check Demo
        print("⚔️  RUNNING CONFLICT CHECK DEMO")
        print("Comparing new policy against existing database...")
        
        # 1. Define Comparator
        comparator = PolicyComparator()
        
        # 2. Mock 'New' Policy (The one we use in demo)
        new_policy = {
            "policy_id": "POLICY_2024_NEW",
            "rules": [
                 {
                    "rule_id": "R_NEW_1",
                    "action": "Provide ₹10,000 scholarship",
                    "beneficiary": "SC students",
                    "conditions": ["Income < 2L"],
                    "responsible_role": "SEO"
                 }
            ]
        }
        
        # 3. Mock 'Existing' Policy (Legacy one)
        existing_policies = [
            {
                "policy_id": "POLICY_2020_OLD",
                "rules": [
                    {
                        "rule_id": "R_OLD_1",
                        "action": "Award ₹10,000 scholarship amount",
                        "beneficiary": "Students of SC category", 
                        "conditions": ["Family income less than 2 lakh"],
                        "responsible_role": "District Officer"
                    }
                ]
            }
        ]
        
        print("\nExisting Policy Rule:")
        print(f"Action: {existing_policies[0]['rules'][0]['action']}")
        print(f"Beneficiary: {existing_policies[0]['rules'][0]['beneficiary']}")
        
        print("\nNew Policy Rule:")
        print(f"Action: {new_policy['rules'][0]['action']}")
        print(f"Beneficiary: {new_policy['rules'][0]['beneficiary']}")
        
        # 4. Run Comparison
        comparison = comparator.compare_policies(new_policy, existing_policies)
        
        print("\n" + "="*40)
        print("CONFLICT DETECTION REPORT")
        print("="*40)
        
        save_json(comparison, "demo_data/conflict_report.json")
        print(json.dumps(comparison, indent=2))
        print(f"\n✅ Report saved to demo_data/conflict_report.json")
        
    elif args.file:
        run_file_mode(args.file, parallel=args.parallel)
    elif args.demo:
        # Check if interactive flag is ALSO set
        run_demo_mode(lang=args.lang, interactive=args.interactive)
    elif args.interactive:
        # Interactive mode WITHOUT demo flag implies manual text entry
        run_interactive_mode()
    else:
        # Default behavior: Run Demo (non-interactive)
        run_demo_mode(lang=args.lang)

