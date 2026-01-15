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
    print(f"\n{'='*60}")
    print(f"📥 NEW REQUEST: Policy ID = {policy_id}")
    print(f"📄 Filename: {file.filename}")
    print(f"📋 Content-Type: {file.content_type}")
    print(f"{'='*60}\n")
    
    try:
        # ============================================================
        # STEP 1: FILE VALIDATION
        # ============================================================
        
        # 1.1 Read file bytes
        pdf_bytes = await file.read()
        file_size = len(pdf_bytes)
        print(f"📊 File size: {file_size:,} bytes ({file_size / 1024 / 1024:.2f} MB)")
        
        # 1.2 Validate file size (max 10MB)
        MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB
        if file_size > MAX_FILE_SIZE:
            error_msg = f"File too large: {file_size / 1024 / 1024:.2f}MB (max 10MB)"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=413, detail=error_msg)
        
        if file_size == 0:
            error_msg = "Empty file received"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail=error_msg)
        
        # 1.3 Validate PDF signature (magic bytes)
        pdf_signatures = [b'%PDF-1.', b'%PDF-2.']
        is_valid_pdf = any(pdf_bytes.startswith(sig) for sig in pdf_signatures)
        
        if not is_valid_pdf:
            error_msg = f"Invalid PDF file. File starts with: {pdf_bytes[:20]}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=400, detail="Invalid PDF file format")
        
        print("✅ File validation passed")
        
        # ============================================================
        # STEP 2: TEXT EXTRACTION
        # ============================================================
        
        pdf_file = io.BytesIO(pdf_bytes)
        print("\n📄 Starting text extraction with pdfplumber...")
        extracted_text = ""
        
        try:
            with pdfplumber.open(pdf_file) as pdf:
                total_pages = len(pdf.pages)
                print(f"📖 PDF has {total_pages} pages")
                
                for i, page in enumerate(pdf.pages, 1):
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
                        print(f"  ✓ Page {i}/{total_pages}: {len(text)} chars")
                    else:
                        print(f"  ⚠ Page {i}/{total_pages}: No text extracted")
                        
        except Exception as e:
            print(f"⚠️ pdfplumber failed: {type(e).__name__}: {str(e)}")
            extracted_text = ""

        # Fallback to pypdf if text is empty
        if not extracted_text.strip():
            print("\n⚠️ pdfplumber yielded no text. Trying pypdf fallback...")
            try:
                import pypdf
                pdf_file.seek(0)
                reader = pypdf.PdfReader(pdf_file)
                total_pages = len(reader.pages)
                print(f"📖 PDF has {total_pages} pages (pypdf)")
                
                for i, page in enumerate(reader.pages, 1):
                    text = page.extract_text()
                    if text:
                        extracted_text += text + "\n"
                        print(f"  ✓ Page {i}/{total_pages}: {len(text)} chars")
                        
            except Exception as e:
                print(f"❌ pypdf also failed: {type(e).__name__}: {str(e)}")
                raise HTTPException(
                    status_code=422, 
                    detail=f"Could not extract text from PDF. Error: {str(e)}"
                )
        
        # ============================================================
        # STEP 3: TEXT CLEANING & VALIDATION
        # ============================================================
        
        print(f"\n🧹 Raw text length: {len(extracted_text)} chars")
        cleaned_text = clean_text(extracted_text)
        print(f"✨ Cleaned text length: {len(cleaned_text)} chars")
        
        if len(cleaned_text) < 50:
            error_msg = f"Insufficient text extracted ({len(cleaned_text)} chars). PDF may be scanned/image-based."
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=422, detail=error_msg)
        
        print("✅ Text extraction successful")
        
        # ============================================================
        # STEP 4: AI RULE EXTRACTION (with timeout protection)
        # ============================================================
        
        print(f"\n🤖 Starting AI rule extraction...")
        print(f"📝 Input text: {len(cleaned_text)} chars")
        
        try:
            parser = PolicyParser()
            extraction_result = parser.extract_rules_from_policy(cleaned_text)
            
            rules = extraction_result.get("rules", [])
            policy_title = extraction_result.get("policy_title", "Untitled Policy")
            
            print(f"✅ AI extraction complete: {len(rules)} rules found")
            print(f"📋 Policy title: {policy_title}")
            
        except Exception as e:
            error_msg = f"AI extraction failed: {type(e).__name__}: {str(e)}"
            print(f"❌ {error_msg}")
            raise HTTPException(status_code=500, detail=error_msg)
        
        # ============================================================
        # STEP 5: AMBIGUITY DETECTION
        # ============================================================
        
        print("\n🔍 Running ambiguity detection...")
        detector = AmbiguityDetector()
        rules = detector.detect_ambiguities(rules)
        
        ambiguous_count = sum(1 for r in rules if r.get("ambiguity_flag", False))
        print(f"✅ Ambiguity detection complete: {ambiguous_count}/{len(rules)} rules flagged")
        
        # ============================================================
        # STEP 6: FINALIZE & STORE
        # ============================================================
        
        final_rules = clean_rules_for_output(rules)
        
        POLICY_STORE[policy_id] = {
            "policy_title": policy_title,
            "rules": final_rules
        }
        
        print(f"\n{'='*60}")
        print(f"✅ SUCCESS: Policy {policy_id} processed")
        print(f"📊 Total rules: {len(final_rules)}")
        print(f"⚠️  Ambiguous rules: {ambiguous_count}")
        print(f"{'='*60}\n")
        
        return {
            "policy_id": policy_id,
            "policy_title": policy_title,
            "rules": final_rules
        }

    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
        
    except Exception as e:
        # Catch-all for unexpected errors
        error_msg = f"Unexpected error: {type(e).__name__}: {str(e)}"
        print(f"\n❌ FATAL ERROR: {error_msg}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=error_msg)


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
