import json
import os
import uvicorn
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware # <-- Import the middleware
from pydantic import BaseModel
from typing import List, Optional

app = FastAPI(title="Stratigraphic Legal Provenance Engine")

# --- ENABLE CORS FOR FRONTEND ARCHITECTURE ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

LEDGER_PATH = "authority_strata.json"

# --- DATA STRUCTURES (Pydantic Models) ---

class CaseAction(BaseModel):
    action_id: Optional[str] = None
    timestamp: str                               # e.g., "2026-06-01 10:00"
    action_name: str                             # e.g., "Motion for Hearing Filed"
    moved_by: str                                # Must be "Petitioner" or "Judge"
    procedural_rule_reference: str               # e.g., "CR 40" or "Sua Sponte"
    is_reactive_to_petitioner: bool              # True if the judge is responding to you

class DocketAuditPayload(BaseModel):
    case_number: str
    target_court: str
    timeline: List[CaseAction]

# --- UTILITY FUNCTIONS ---

def load_authority_ledger():
    if not os.path.exists(LEDGER_PATH):
        return {"error": "Ledger file missing. Please ensure authority_strata.json exists."}
    with open(LEDGER_PATH, "r", encoding="utf-8") as file:
        return json.load(file)

# --- ENGINE ENDPOINTS ---

@app.get("/")
def read_root():
    return {
        "engine_status": "ONLINE", 
        "mode": "Procedural Inceptive Audit"
    }

@app.get("/api/v1/authority/strata")
def get_historical_strata():
    ledger_data = load_authority_ledger()
    if "error" in ledger_data:
        raise HTTPException(status_code=404, detail=ledger_data["error"])
    return ledger_data

@app.post("/api/v1/audit/docket")
def audit_case_docket(payload: DocketAuditPayload):
    """
    Evaluates the timeline sequence to ensure the Judge is only acting 
    reactively to the Petitioner's original moving power.
    """
    audit_results = []
    compliance_failed = False
    failure_reasons = []
    
    # Loop through every court action in chronological order
    for idx, action in enumerate(payload.timeline):
        status = "VERIFIED"
        notes = "Administrative alignment confirmed."
        
        # Rule check: If a judge drives an action without responding to a petitioner motion
        if action.moved_by.lower() == "judge" and not action.is_reactive_to_petitioner:
            status = "FLAGGED / OVERREACH"
            notes = "The judicial officer initiated action without an triggering motion from the Petitioner."
            compliance_failed = True
            failure_reasons.append(f"Index {idx} ({action.action_name}): Unauthorized proactive judicial movement.")
            
        audit_results.append({
            "sequence_index": idx,
            "timestamp": action.timestamp,
            "action": action.action_name,
            "actor": action.moved_by,
            "rule_basis": action.procedural_rule_reference,
            "status": status,
            "evaluation": notes
        })
        
    return {
        "case_number": payload.case_number,
        "court_jurisdiction": payload.target_court,
        "system_compliance_status": "FAIL" if compliance_failed else "PASSED",
        "compliance_summary": failure_reasons if compliance_failed else ["All actions align with Petitioner moving power."],
        "detailed_audit_log": audit_results
    }

if __name__ == "__main__":
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)

