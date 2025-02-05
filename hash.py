import bcrypt

# The plain-text password to hash
plain_password = "12345"

# Generate a hashed password
hashed_password = bcrypt.hashpw(plain_password.encode('utf-8'), bcrypt.gensalt())

# Print the hashed password
print("Hashed Password:", hashed_password.decode('utf-8'))
