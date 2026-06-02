import hashlib
import base64
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import serialization

def sign_file(file_path, private_key_path):
    # 1. Generate SHA-256 Hash
    sha256_hash = hashlib.sha256()
    with open(file_path, "rb") as f:
        for byte_block in iter(lambda: f.read(4096), b""):
            sha256_hash.update(byte_block)
    file_hash = sha256_hash.digest()
    
    # 2. Load Private Key
    with open(private_key_path, "rb") as key_file:
        private_key = serialization.load_pem_private_key(
            key_file.read(),
            password=None
        )
    
    # 3. Create Signature
    signature = private_key.sign(
        file_hash,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    
    return file_hash.hex(), base64.b64encode(signature).decode('utf-8')

if __name__ == "__main__":
    target_file = "test_doc.txt" # Change this to the file you want to sign
    try:
        f_hash, f_sig = sign_file(target_file, "private_key.pem")
        print(f"File Hash: {f_hash}")
        print(f"Signature: {f_sig}")
    except FileNotFoundError:
        print(f"Error: Make sure {target_file} exists in the root folder.")

