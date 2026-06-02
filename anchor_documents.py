import json
import hashlib
import base64
import os
import datetime
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding

# Configuration
LEDGER_FILE = "authority_strata.json"
PRIVATE_KEY_FILE = "private_key.pem"
DOCS_DIR = "to_sign" # Place your legal documents here

# 1. Load Private Key
with open(PRIVATE_KEY_FILE, "rb") as key_file:
    private_key = serialization.load_pem_private_key(key_file.read(), password=None)

def sign_data(data_bytes):
    digest = hashlib.sha256(data_bytes).digest()
    signature = private_key.sign(
        digest,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

# 2. Process Folder
def anchor_ledger():
    ledger = []
    if os.path.exists(LEDGER_FILE):
        with open(LEDGER_FILE, "r") as f:
            ledger = json.load(f)

    for filename in os.listdir(DOCS_DIR):
        file_path = os.path.join(DOCS_DIR, filename)
        with open(file_path, "rb") as f:
            content = f.read()
            doc_hash = hashlib.sha256(content).hexdigest()
            
            # Check if already anchored
            if not any(entry['document_hash'] == doc_hash for entry in ledger):
                sig = sign_data(content)
                entry = {
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "document_name": filename,
                    "document_hash": doc_hash,
                    "signature": sig
                }
                ledger.append(entry)
                print(f"Anchored: {filename}")

    with open(LEDGER_FILE, "w") as f:
        json.dump(ledger, f, indent=2)

if __name__ == "__main__":
    anchor_ledger()