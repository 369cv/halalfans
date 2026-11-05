#!/bin/bash
# Script to generate RSA key and pack a Verified CRX for Chrome Web Store
set -e

KEY_FILE="privatekey.pem"
PUB_FILE="publickey.pem"
CHROME_BIN="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
DIST_DIR="$(pwd)"

echo "=== Chrome Extension Package Signing Tool ==="

# 1. Generate key pair if not exists
if [ ! -f "$KEY_FILE" ]; then
  echo "Generating 2048-bit RSA key pair: $KEY_FILE..."
  openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out "$KEY_FILE"
  chmod 600 "$KEY_FILE"
  echo "Private key created and secured."
else
  echo "Using existing private key: $KEY_FILE"
fi

# 2. Extract public key
echo "Extracting public key to $PUB_FILE..."
openssl rsa -in "$KEY_FILE" -pubout -out "$PUB_FILE"
echo ""
echo "--- Public Key for Chrome Web Store Dashboard (Package -> Verified CRX Uploads) ---"
cat "$PUB_FILE"
echo "----------------------------------------------------------------------------------"
echo ""

# 3. Create temporary clean pack directory (only manifest, popup, icons)
PACK_DIR=$(mktemp -d)
echo "Staging clean extension files in $PACK_DIR..."
cp manifest.json "$PACK_DIR/"
cp popup.html "$PACK_DIR/"
cp popup.css "$PACK_DIR/"
cp popup.js "$PACK_DIR/"
cp -R icons "$PACK_DIR/"

# 4. Pack extension into .crx using Google Chrome binary
CRX_OUTPUT="img2prompt_signed.crx"
echo "Packaging and signing CRX with Google Chrome..."
"$CHROME_BIN" --pack-extension="$PACK_DIR" --pack-extension-key="$DIST_DIR/$KEY_FILE"

# Move generated crx to current folder
if [ -f "$PACK_DIR.crx" ]; then
  mv "$PACK_DIR.crx" "$DIST_DIR/$CRX_OUTPUT"
  echo "Successfully generated signed package: $CRX_OUTPUT"
else
  echo "Packing complete."
fi

# Clean up temp
rm -rf "$PACK_DIR"

echo "Done! Upload $CRX_OUTPUT to Chrome Web Store when Verified CRX Uploads is active."
