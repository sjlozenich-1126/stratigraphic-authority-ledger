import json
import hashlib
import base64
import os
import datetime
import requests
from cryptography.hazmat.primitives import serialization, hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa

# Configuration
LEDGER_FILE = "authority_strata.json"
PRIVATE_KEY_FILE = "private_key.pem"
DOCS_DIR = "to_sign"
DID_URL = "https://stratigraphic-authority-ledger.vercel.app/.well-known/did.json"

# Load Private Key (for signing)
with open(PRIVATE_KEY_FILE, "rb") as key_file:
    private_key = serialization.load_pem_private_key(key_file.read(), password=None)

# 1. Fetch DID and Reconstruct Public Key (for verification)
def get_public_key():
    response = requests.get(DID_URL)
    did_doc = response.json()
    jwk = did_doc["verificationMethod"][0]["publicKeyJwk"]
    n = int.from_bytes(base64.urlsafe_b64decode(jwk["n"] + "=="), 'big')
    e = int.from_bytes(base64.urlsafe_b64decode(jwk["e"] + "=="), 'big')
    return rsa.RSAPublicNumbers(e, n).public_key()

# 2. Validator Function
def verify_ledger():
    public_key = get_public_key()
    with open(LEDGER_FILE, "r") as f:
        ledger = json.load(f)
    
    for entry in ledger:
        sig = base64.b64decode(entry["signature"])
        # Re-hash the document content is not possible here (we only have the hash)
        # Instead, we verify the signature against the document_hash
        try:
            public_key.verify(
                sig,
                bytes.fromhex(entry["document_hash"]),
                padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
                hashes.SHA256()
            )
            print(f"Verified: {entry['document_name']}")
        except Exception:
            print(f"CRITICAL FAILURE: Signature invalid for {entry['document_name']}")

# (Keep your existing sign_data and anchor_ledger functions here...)