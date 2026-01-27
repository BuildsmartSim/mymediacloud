#!/bin/bash
# CloudStream MacOS Setup
# Creates a helper app to handle vlc:// links

APP_NAME="CloudStreamVLC"
APP_PATH="/Applications/$APP_NAME.app"

echo "----------------------------------------------------------------"
echo "      CloudStream Mac Setup"
echo "----------------------------------------------------------------"

# 1. Compile AppleScript Applet
echo "[*] Creating Helper App at $APP_PATH..."

osacompile -o "$APP_PATH" -e 'on open location this_url
    set clean_url to text 7 thru -1 of this_url
    if clean_url starts with "https//" then
        set clean_url to "https://" & text 8 thru -1 of clean_url
    end if
    
    tell application "VLC"
        activate
        open clean_url
        set fullscreen mode of front window to true
    end tell
end open location'

# 2. Register URL Protocol in Info.plist
echo "[*] Registering vlc:// protocol..."
PLIST="$APP_PATH/Contents/Info.plist"

# Use PlistBuddy to add URL schema
/usr/libexec/PlistBuddy -c 'Add :CFBundleURLTypes array' "$PLIST" 2>/dev/null
/usr/libexec/PlistBuddy -c 'Add :CFBundleURLTypes:0 dict' "$PLIST" 2>/dev/null
/usr/libexec/PlistBuddy -c 'Add :CFBundleURLTypes:0:CFBundleURLName string "VLC Protocol"' "$PLIST" 2>/dev/null
/usr/libexec/PlistBuddy -c 'Add :CFBundleURLTypes:0:CFBundleURLSchemes array' "$PLIST" 2>/dev/null
/usr/libexec/PlistBuddy -c 'Add :CFBundleURLTypes:0:CFBundleURLSchemes:0 string "vlc"' "$PLIST" 2>/dev/null

# 3. Force Launch Services Register
echo "[*] Refreshing Launch Services..."
/System/Library/Frameworks/CoreServices.framework/Versions/A/Frameworks/LaunchServices.framework/Versions/A/Support/lsregister -f "$APP_PATH"

echo "----------------------------------------------------------------"
echo "[SUCCESS] Setup Complete!"
echo "NOTE: The first time you click a link, macOS might ask for permission."
echo "----------------------------------------------------------------"
