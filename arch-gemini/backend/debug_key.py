import os
from dotenv import load_dotenv
import sys

# Try loading from current directory
load_dotenv()

key = os.getenv("GOOGLE_API_KEY")
base_url = os.getenv("GOOGLE_API_BASE_URL")

print(f"CWD: {os.getcwd()}")
if key:
    print(f"Key found: {key[:4]}...{key[-4:]} (Length: {len(key)})")
else:
    print("Key NOT found in environment")

if base_url:
    print(f"Base URL found: {base_url}")
else:
    print("Base URL NOT found (using default)")
