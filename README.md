# Policy Analysis NLP Module (M4 Mac Optimized)

A **100% FREE** policy analysis engine using local LLM (Ollama) and rule-based validation.

## 🚀 Quick Start (Demo Mode)

Run the end-to-end demo with sample data (Scholarship Policy):

```bash
python main.py --demo
```

## 🛠️ Usage Options

### 1. Process Your Own File
Extract rules from any text file:
```bash
python main.py --file path/to/your_policy.txt
```

### 2. Interactive Mode
Paste text directly and clarify rules interactively:
```bash
python main.py --interactive
```

## 🏗️ Architecture

1.  **Policy Parser** (`src/policy_parser.py`):
    *   Uses `ollama` with `llama3.1:8b`
    *   Extracts structured JSON (Conditions, Action, Role, Beneficiary, Deadline)
    *   Robust prompt engineering ensures valid JSON output

2.  **Ambiguity Detector** (`src/ambiguity_detector.py`):
    *   **Rule-Based Logic** (No AI hallucination)
    *   Flag 1: Vague phrases ("as applicable", "where necessary")
    *   Flag 2: Missing responsible role
    *   Flag 3: Missing eligibility conditions
    *   Flag 4: Missing deadline for time-sensitive actions

3.  **Clarification Handler** (`src/clarification_handler.py`):
    *   Human-in-the-loop workflow
    *   Merges user input with AI-extracted rules
    *   Resolves ambiguity flags deterministically

## 📋 Sample Output

The engine produces clean, validated JSON:

```json
{
  "rule_id": "R2",
  "action": "Provide scholarship",
  "conditions": ["Annual family income < ₹2,00,000"],
  "responsible_role": "District Education Officer",
  "deadline": "30 days",
  "ambiguity_flag": false
}
```

## 📦 Requirements

*   Python 3.10+
*   Ollama (installed & running)
*   `pip install -r requirements.txt`
