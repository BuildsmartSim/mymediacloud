#!/bin/bash
# CloudStream Linux Setup
# Installs a protocol handler for vlc:// links

set -e

INSTALL_DIR="$HOME/.cloudstream"
mkdir -p "$INSTALL_DIR"

echo "----------------------------------------------------------------"
echo "      CloudStream Linux Setup"
echo "----------------------------------------------------------------"

# 1. Create Wrapper Script (Handles decoding)
WRAPPER="$INSTALL_DIR/vlc-wrapper.sh"
echo "[*] Creating wrapper script..."

cat << 'EOF' > "$WRAPPER"
#!/bin/bash
URL="$1"
# Strip protocol
CLEAN_URL=$(echo "$URL" | sed 's/^vlc:\/\///')

# Decode URL (Python 3 fallback)
if command -v python3 &> /dev/null; then
    DECODED_URL=$(python3 -c "import sys, urllib.parse; print(urllib.parse.unquote(sys.argv[1]))" "$CLEAN_URL")
else
    # Simple sed fallback if python missing (less robust)
    DECODED_URL=$(echo "$CLEAN_URL" | sed 's/%2F/\//g' | sed 's/%3A/:/g')
fi

# Fix https// bug
if [[ "$DECODED_URL" =~ ^https// ]]; then
  DECODED_URL="${DECODED_URL/https\/\//https:\/\/}"
fi

echo "Launching VLC with: $DECODED_URL"
vlc --fullscreen "$DECODED_URL"
EOF

chmod +x "$WRAPPER"

# 2. Create Desktop Entry
DESKTOP_DIR="$HOME/.local/share/applications"
mkdir -p "$DESKTOP_DIR"
DESKTOP_FILE="$DESKTOP_DIR/cloudstream-vlc.desktop"

echo "[*] Registering desktop entry..."

cat << EOF > "$DESKTOP_FILE"
[Desktop Entry]
Name=CloudStream VLC Handler
Exec="$WRAPPER" %u
Type=Application
Terminal=false
MimeType=x-scheme-handler/vlc;
NoDisplay=true
EOF

# 3. Register Protocol
echo "[*] Updating MIME database..."
update-desktop-database "$DESKTOP_DIR"
xdg-mime default cloudstream-vlc.desktop x-scheme-handler/vlc

echo "----------------------------------------------------------------"
echo "[SUCCESS] Setup Complete!"
echo "vlc:// links should now open in VLC."
echo "----------------------------------------------------------------"
