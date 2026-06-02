import json
import base64
from cryptography.hazmat.primitives import serialization

# 1. Load your private key
# Ensure 'private_key.pem' is in the same folder as this script
with open("private_key.pem", "rb") as f:
    private_key = serialization.load_pem_private_key(f.read(), password=None)

# 2. Extract the public key and its numbers
public_key = private_key.public_key()
numbers = public_key.public_numbers()

# 3. Convert to JWK (JSON Web Key) format
# The 'n' (modulus) and 'e' (exponent) are the core components of the public key
jwk = {
    "kty": "RSA",
    "n": base64.urlsafe_b64encode(numbers.n.to_bytes((numbers.n.bit_length() + 7) // 8, 'big')).decode('utf-8').rstrip('='),
    "e": base64.urlsafe_b64encode(numbers.e.to_bytes((numbers.e.bit_length() + 7) // 8, 'big')).decode('utf-8').rstrip('=')
}

# 4. Print the result so you can copy and paste it
print("Copy this JSON block into your did.json:")
print(json.dumps(jwk, indent=2))