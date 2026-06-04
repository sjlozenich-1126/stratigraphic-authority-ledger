import requests
import base64
import json
import hashlib
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.asymmetric import padding, rsa

# 1. Fetch the DID document from your live Vercel URL
did_url = "https://stratigraphic-authority-ledger.vercel.app/.well-known/did.json"
response = requests.get(did_url)
did_doc = response.json()

# 2. Extract the RSA public key components (n and e) from the DID
jwk = did_doc["verificationMethod"][0]["publicKeyJwk"]
n_bytes = base64.urlsafe_b64decode(jwk["n"] + "==")
e_bytes = base64.urlsafe_b64decode(jwk["e"] + "==")

# Convert to integers for the cryptography library
n = int.from_bytes(n_bytes, 'big')
e = int.from_bytes(e_bytes, 'big')

# 3. Reconstruct the Public Key object
public_key = rsa.RSAPublicNumbers(e, n).public_key()

# 4. Verify a signature
def verify_signature(data_string, signature_b64):
    signature = base64.b64decode(signature_b64)
    data_bytes = data_string.encode('utf-8')
    
    try:
        public_key.verify(
            signature,
            hashlib.sha256(data_bytes).digest(),
            padding.PSS(mgf=padding.MGF1(hashes.SHA256()), salt_length=padding.PSS.MAX_LENGTH),
            hashes.SHA256()
        )
        return True
    except Exception as e:
        print(f"Verification Error: {e}")
        return False

# Test it with your specific data and signature:
test_data = "This is my legal document content."
test_sig = "UCKhYDK97kJzLz0iEJHWf0rYA75FfVBsCzR3KFebx/vh0jR2807hfwr6jGAMPkvFl719XOa+yDwt6qyeBQfdBObHeI39LgVjLmXsqliMuMx9iYcG0//h0LiqXMaY2W/82MrE80scNakiAIp18KWH9VrCjwEPHdpAv+3G/KKr7J5rcKofhDGE0+eRwrzkliqAUqGsWkM+i9Tnfm1Bf8a5em7bCAbOwyCTasy7Q81677yU24ISnYIqbM2TBSoWCOOYWCLybd7BoNie/N5glFawS/ZT+SWCqj6uf5pjQ/U85qU6+L6i0HLig2oQFAwt7AsXkvdFfrT5VW84w8bPgxSA4w=="

result = verify_signature(test_data, test_sig)
print(f"Is signature valid? {result}")