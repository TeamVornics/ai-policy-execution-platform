# 🎤 Hackathon Demo Script: AI Policy Execution Platform

**Time**: 3 Minutes
**Goal**: Demonstrate how we transform static PDF policies into live, executable workflow tasks with zero hallucination risk.

---

## 🎬 Act 1: The Problem (30s)

*   **Speaker**: "Every organization has thousands of pages of policy PDFs. But PDFs are dead data. They don't *do* anything."
*   **Visual**: Show a messy, complex PDF (e.g., the LIC Policy).
*   **Speaker**: "When an employee needs to claim a scholarship or a benefit, a human officer has to read this, interpret vague rules, and manually assign tasks. This leads to delays, errors, and compliance failures."

---

## 🎬 Act 2: The Solution - AI Ingestion (45s)

*   **Speaker**: "Enter our **AI Policy Engine**. Let's see it in action."
*   **Action**: Drag and drop the PDF into the Frontend UI.
*   **Visual**: Loading spinner, then JSON rules appear.
*   **Speaker**: "We use a local **Llama 3** model to extract valid JSON rules. But here is the magic—we don't just trust the AI."

---

## 🎬 Act 3: The "Secret Sauce" - Ambiguity Detection (45s)

*   **Speaker**: "Look at Rule #4. The policy says *'Applications must be processed in a timely manner'*."
*   **Visual**: Point to the red **AMBIGUOUS** flag in the UI.
*   **Speaker**: "A standard AI agent would guess '24 hours' or '7 days' and hallucinate. Our system **flags it**."
*   **Speaker**: "It refuses to execute until a human clarifies. This is our **Human-In-The-Loop Guardrail**."

---

## 🎬 Act 4: Resolution & Execution (45s)

*   **Action**: Click "Clarify". Enter `48 hours` as the deadline. Click "Submit".
*   **Visual**: The Red flag turns Green.
*   **Speaker**: "Now the rule is clean. With one click, we sync this to our Execution Backend."
*   **Action**: Click "Sync to Backend".
*   **Visual**: Show the Execution Dashboard (if available) or the "Success" toast.
*   **Speaker**: "And just like that, a static text file became a tracked, assigned deadline in our database."

---

## 🏁 Conclusion (15s)

*   **Speaker**: "We are solving the 'Last Mile' problem of AI compliance. Safe, verified, and executable."
*   **Visual**: "Thank You" slide / Repo Link.
