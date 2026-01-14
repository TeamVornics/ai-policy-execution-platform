import sys
import os
import json
import pdfplumber
import io
from fastapi import FastAPI, UploadFile, File, Form, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import requests
import traceback
from src.policy_parser import PolicyParser
from src.ambiguity_detector import AmbiguityDetector
from src.utils import clean_text

app = FastAPI()

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    print(f"❌ Validation Error: {exc}")
    return JSONResponse(
        status_code=422,
        content={"detail": str(exc), "body": exc.body},
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    print(f"❌ Unhandled Server Error: {exc}")
    traceback.print_exc()
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal Server Error", "error": str(exc)},
    )

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -----------------------------------------------------------------------------
# IN-MEMORY STORAGE (For Demo/Hackathon purposes)
# -----------------------------------------------------------------------------
# Structure: { "POLICY_ID": { "policy_title": "...", "rules": [rule_dict, ...] } }
POLICY_STORE = {}

# -----------------------------------------------------------------------------
# MODELS
# -----------------------------------------------------------------------------
class Rule(BaseModel):
    rule_id: str
    original_text: Optional[str] = "" 
    conditions: List[str]
    action: str
    responsible_role: str
    beneficiary: str
    deadline: str
    ambiguity_flag: bool
    ambiguity_reason: str

class PolicyResponse(BaseModel):
    policy_id: str
    policy_title: str
    rules: List[Rule]

class ClarificationRequest(BaseModel):
    policy_id: str
    rule_id: str
    clarified_responsible_role: Optional[str] = None
    clarified_deadline: Optional[str] = None
    clarified_conditions: Optional[List[str]] = None

class ClarifiedRuleResponse(BaseModel):
    rule_id: str
    conditions: List[str]
    action: str
    responsible_role: str
    beneficiary: str
    deadline: str

# -----------------------------------------------------------------------------
# HELPERS
# -----------------------------------------------------------------------------
def clean_rules_for_output(rules: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Ensure rules strictly match the output schema"""
    cleaned = []
    for r in rules:
        # Create a strict dict
        new_r = {
            "rule_id": r.get("rule_id", ""),
            "original_text": r.get("original_text", ""), # This might be missing in parser output, defaulting to empty
            "conditions": r.get("conditions", []),
            "action": r.get("action", ""),
            "responsible_role": r.get("responsible_role", ""),
            "beneficiary": r.get("beneficiary", ""),
            "deadline": r.get("deadline", ""),
            "ambiguity_flag": r.get("ambiguity_flag", False),
            "ambiguity_reason": r.get("ambiguity_reason", "")
        }
        cleaned.append(new_r)
    return cleaned

# -----------------------------------------------------------------------------
# ENDPOINTS
# -----------------------------------------------------------------------------

@app.get("/health")
async def health():
    return {"status": "ok", "message": "Server is running"}

@app.post("/api/policy/process", response_model=PolicyResponse)
async def process_policy(
    policy_id: str = Form(...),
    file: UploadFile = File(...)
):
    print(f"📥 Received processing request for Policy: {policy_id}")
    
    # 1. Save PDF temporarily / Read content
    # For speed/memory, we can read directly from bytes without saving to disk if pdfplumber supports it.
    # pdfplumber.open() accepts a path or a file-like object.
    
    try:
        pdf_bytes = await file.read()
        pdf_file = io.BytesIO(pdf_bytes)
        
        # 2. Extract Text (Deterministic)
        print("📄 Extracting text with pdfplumber...")
        extracted_text = ""
        try:
            with pdfplumber.open(pdf_file) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
        except Exception as e:
            print(f"⚠️ pdfplumber failed: {e}")

        # Fallback to pypdf if text is empty
        if not extracted_text.strip():
            print("⚠️ pdfplumber yielded no text. Trying pypdf...")
            try:
                import pypdf
                pdf_file.seek(0)
                reader = pypdf.PdfReader(pdf_file)
                for page in reader.pages:
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
            except Exception as e:
                print(f"❌ pypdf also failed: {e}")
        
        # Clean text (basic cleanup)
        cleaned_text = clean_text(extracted_text)
        print(f"📄 Text Extraction Result: {len(cleaned_text)} chars found.")
        
        if len(cleaned_text) < 50:
             print("⚠️  WARNING: Very little text extracted. Is this a scanned/image-based PDF?")
             # We can't do much if text is missing without OCR, but let's at least log it explicitly.
             # If we have ocr tools we could try, but let's stick to requirements first.
             
        # 3. Rule Extraction (AI Logic)
        print(f"🤖 Extracting rules via AI from {len(cleaned_text)} chars...")
        parser = PolicyParser() # Initializes Ollama client
        
        # Logic to extract rules
        # We pass the full clean text. Parser handles chunking if needed.
        extraction_result = parser.extract_rules_from_policy(cleaned_text)
        
        rules = extraction_result.get("rules", [])
        policy_title = extraction_result.get("policy_title", "Untitled Policy")
        
        # 4. Ambiguity Detection (Rule Based)
        print("?? Detecting ambiguities...")
        detector = AmbiguityDetector()
        
        # The parser might have already run some checks, but we run the explicit detector
        # to ensure compliance with our specific ambiguity flags.
        # We re-run detection on the raw extracted rules
        rules = detector.detect_ambiguities(rules)
        
        # 5. Format Output & Store
        final_rules = clean_rules_for_output(rules)
        
        # Store for clarification
        POLICY_STORE[policy_id] = {
            "policy_title": policy_title,
            "rules": final_rules
        }
        
        print(f"✅ Processing Complete. Extracted {len(final_rules)} rules.")
        
        return {
            "policy_id": policy_id,
            "policy_title": policy_title,
            "rules": final_rules
        }

    except Exception as e:
        print(f"❌ Error: {str(e)}")
        # In case of error, return empty or raise HTTP exception
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/policy/clarify", response_model=ClarifiedRuleResponse)
async def clarify_ambiguity(request: ClarificationRequest):
    print(f"💡 Received clarification for {request.policy_id} -> {request.rule_id}")
    
    if request.policy_id not in POLICY_STORE:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    policy_data = POLICY_STORE[request.policy_id]
    rules = policy_data["rules"]
    
    # Find the rule
    target_rule = None
    target_index = -1
    for idx, r in enumerate(rules):
        if r["rule_id"] == request.rule_id:
            target_rule = r
            target_index = idx
            break
            
    if not target_rule:
        raise HTTPException(status_code=404, detail="Rule not found")
        
    # Merge clarification
    if request.clarified_responsible_role:
        target_rule["responsible_role"] = request.clarified_responsible_role
    
    if request.clarified_deadline:
        target_rule["deadline"] = request.clarified_deadline
        
    if request.clarified_conditions is not None:
        target_rule["conditions"] = request.clarified_conditions
        
    # Remove ambiguity fields permanently
    target_rule.pop("ambiguity_flag", None)
    target_rule.pop("ambiguity_reason", None)
    target_rule.pop("original_text", None)
    
    # Update store
    POLICY_STORE[request.policy_id]["rules"][target_index] = target_rule
    
    print(f"✅ Rule clarified: {target_rule}")
    
    # Return executable rule
    return target_rule

class SubmitRequest(BaseModel):
    policy_id: str

@app.post("/api/policy/submit")
async def submit_policy(request: SubmitRequest):
    print(f"🚀 Submitting Policy {request.policy_id} to Execution Backend...")
    
    if request.policy_id not in POLICY_STORE:
        raise HTTPException(status_code=404, detail="Policy not found")
        
    policy_data = POLICY_STORE[request.policy_id]
    rules = policy_data["rules"]
    
    # Transform to External Schema
    # Structure:
    # {
    #   "policy_id": "string",
    #   "rules": [ { "rule_id":.., "action":.., "responsible_role":.., "deadline":.. } ]
    # }
    
    external_rules = []
    for r in rules:
        # Strict mapping as per guide
        ext_r = {
            "rule_id": r.get("rule_id"),
            "action": r.get("action"),
            "responsible_role": r.get("responsible_role"),
            "deadline": r.get("deadline", "") # Default to empty string if missing
        }
        
        # Validate required fields (Basic check)
        if not ext_r["rule_id"] or not ext_r["action"] or not ext_r["responsible_role"]:
            print(f"⚠️ Skipping invalid rule: {ext_r}")
            continue
            
        external_rules.append(ext_r)
        
    payload = {
        "policy_id": request.policy_id,
        "rules": external_rules
    }
    
    # Send to Execution Backend
    EXECUTION_BACKEND_URL = "https://policy-execution-backend.onrender.com/policies/ingest"
    
    try:
        # using requests (sync) for simplicity in this demo. 
        # In production, use httpx or run_in_executor
        response = requests.post(EXECUTION_BACKEND_URL, json=payload, timeout=10)
        
        if response.status_code == 200:
            print(f"✅ Submission Successful: {response.json()}")
            return {
                "status": "success",
                "message": "Policy submitted to execution engine",
                "backend_response": response.json()
            }
        else:
            print(f"❌ Backend Error: {response.status_code} - {response.text}")
            raise HTTPException(status_code=response.status_code, detail=f"Execution Backend Error: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Network Error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to connect to Execution Backend: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
