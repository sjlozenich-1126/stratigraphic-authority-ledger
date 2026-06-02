from cryptography.hazmat.primitives import serialization

# Load your private key
with open("private_key.pem", "rb") as key_file:
    private_key = serialization.load_pem_private_key(key_file.read(), password=None)

# Extract the public key
public_key = private_key.public_key()

# Save the public key in PEM format
with open("public_key.pem", "wb") as f:
    f.write(public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ))

print("public_key.pem has been generated.")

