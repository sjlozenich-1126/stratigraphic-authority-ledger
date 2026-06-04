import json
import hashlib
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization

# Load your private key
with open("private_key.pem", "rb") as key_file:
    private_key = serialization.load_pem_private_key(key_file.read(), password=None)

def sign_data(data_string):
    # Hash the data first
    data_bytes = data_string.encode('utf-8')
    digest = hashlib.sha256(data_bytes).digest()
    
    # Sign the digest
    signature = private_key.sign(
        digest,
        padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
        hashes.SHA256()
    )
    return base64.b64encode(signature).decode('utf-8')

# Example usage:
file_content = "This is my legal document content."
file_hash = hashlib.sha256(file_content.encode('utf-8')).hexdigest()
f_sig = sign_data(file_content)

print(f"Hash: {file_hash}")
print(f"Signature: {f_sig}")