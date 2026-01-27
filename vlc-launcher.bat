@echo off
set "InputUrl=%~1"
echo Launching VLC with URL...
:: Use PowerShell to decode the URL safely using env var to avoid special char issues
powershell -Command "$u=[Uri]::UnescapeDataString($env:InputUrl); $u=$u -replace '^vlc:/{0,2}', ''; $u=$u -replace '^https?/{1,2}', 'https://'; Write-Host 'Fixed Target: ' $u; Start-Process 'C:\Program Files\VideoLAN\VLC\vlc.exe' -ArgumentList '--fullscreen', $u"

