from fastapi import FastAPI
from pydantic import BaseModel
from datetime import datetime
import hashlib, json, pathlib, subprocess

LEDGER_PATH = pathlib.Path("provenance_ledger.json")

app = FastAPI(title="Stratigraphic Legal Provenance Engine")

class MintRequest(BaseModel):
    document_name: str
    raw_content: str
    action_token: str
    stratum: str
    case_number: str | None = None
    narrative_link: str | None = None

def load_ledger():
    if not LEDGER_PATH.exists():
        return []
    return json.loads(LEDGER_PATH.read_text())

def save_ledger(entries):
    LEDGER_PATH.write_text(json.dumps(entries, indent=2))

@app.post("/mint")
def mint_entry(req: MintRequest):
    # 1. Hash the content
    document_hash = hashlib.sha256(req.raw_content.encode("utf-8")).hexdigest()

    # 2. Sign via your existing script
    result = subprocess.run(
        ["python", "scripts/sign_document.py", document_hash],
        capture_output=True,
        text=True,
        check=True,
    )
    signature = result.stdout.strip()

    # 3. Append to ledger
    entries = load_ledger()
    entry_id = f"SHANE-EVID-{datetime.utcnow().year}-{len(entries)+1:03d}"
    entry = {
        "id": entry_id,
        "document_name": req.document_name,
        "document_hash": document_hash,
        "signature": signature,
        "stratum": req.stratum,
        "action_token": req.action_token,
        "case_number": req.case_number,
        "narrative_link": req.narrative_link,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "minted",
    }
    entries.append(entry)
    save_ledger(entries)
    return entry
