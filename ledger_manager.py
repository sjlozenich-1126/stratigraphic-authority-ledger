import json, hashlib, base64, os, datetime, requests, sys
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa

# --- Configuration ---
LEDGER_FILE = "authority_strata.json"
PRIVATE_KEY_FILE = "private_key.pem"
DOCS_DIR = "to_sign"
DID_URL = "https://stratigraphic-authority-ledger.vercel.app/.well-known/did.json"

# --- Core Logic ---
def get_public_key():
    response = requests.get(DID_URL)
    did_doc = response.json()
    jwk = did_doc["verificationMethod"][0]["publicKeyJwk"]
    n = int.from_bytes(base64.urlsafe_b64decode(jwk["n"] + "=="), 'big')
    e = int.from_bytes(base64.urlsafe_b64decode(jwk["e"] + "=="), 'big')
    return rsa.RSAPublicNumbers(e, n).public_key()

def sign_data(data_bytes):
    with open(PRIVATE_KEY_FILE, "rb") as key_file:
        private_key = serialization.load_pem_private_key(key_file.read(), password=None)
    digest = hashlib.sha256(data_bytes).digest()
    signature = private_key.sign(
        digest,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

def anchor_ledger():
    if not os.path.exists(DOCS_DIR): os.makedirs(DOCS_DIR)
    ledger = []
    if os.path.exists(LEDGER_FILE):
        with open(LEDGER_FILE, "r") as f: ledger = json.load(f)

    for filename in os.listdir(DOCS_DIR):
        file_path = os.path.join(DOCS_DIR, filename)
        with open(file_path, "rb") as f:
            content = f.read()
            doc_hash = hashlib.sha256(content).hexdigest()
            # Only append if not already in ledger
            if not any(entry.get('document_hash') == doc_hash for entry in ledger):
                entry = {
                    "timestamp": datetime.datetime.now(datetime.timezone.utc).isoformat(),
                    "document_name": filename,
                    "document_hash": doc_hash,
                    "signature": sign_data(content)
                }
                ledger.append(entry)
                print(f"Anchored: {filename}")
    with open(LEDGER_FILE, "w") as f: json.dump(ledger, f, indent=2)

def verify_ledger():
    public_key = get_public_key()
    with open(LEDGER_FILE, "r") as f: ledger = json.load(f)
    for entry in ledger:
        doc_name = entry.get("document_name", "Legacy/Unknown Entry")
        try:
            public_key.verify(
                base64.b64decode(entry["signature"]),
                bytes.fromhex(entry["document_hash"]),
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256()
            )
            print(f"Verified: {doc_name}")
        except Exception as e: 
            print(f"CRITICAL FAILURE: {doc_name} | Error: {e}")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "verify": 
        verify_ledger()
    else: 
        anchor_ledger()