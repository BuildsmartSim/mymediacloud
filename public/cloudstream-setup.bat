@echo off
title CloudStream Player Setup
echo ----------------------------------------------------------------
echo      CloudStream Desktop Player Setup
echo ----------------------------------------------------------------
echo.
echo This script will configure your PC to launch VLC from CloudStream.
echo.

:: 1. Create directory for the helper script
set "INSTALL_DIR=%USERPROFILE%\.cloudstream"
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"
echo [*] Created config directory: %INSTALL_DIR%

:: 2. Create the launcher batch file
set "LAUNCHER_PATH=%INSTALL_DIR%\vlc-protocol.bat"
echo @echo off > "%LAUNCHER_PATH%"
echo set "InputUrl=%%~1" >> "%LAUNCHER_PATH%"
echo echo Launching VLC... >> "%LAUNCHER_PATH%"
echo powershell -Command "$u=[Uri]::UnescapeDataString($env:InputUrl); $u=$u -replace '^vlc:/{0,2}', ''; $u=$u -replace '^https?/{1,2}', 'https://'; Start-Process 'C:\Program Files\VideoLAN\VLC\vlc.exe' -ArgumentList '--fullscreen', $u" >> "%LAUNCHER_PATH%"
echo [*] Created launcher script: %LAUNCHER_PATH%

:: 3. Add Registry Keys
echo [*] Registering vlc:// protocol...

:: Add HKEY_CLASSES_ROOT\vlc
reg add "HKCR\vlc" /ve /t REG_SZ /d "URL:VLC Protocol" /f >nul
reg add "HKCR\vlc" /v "URL Protocol" /t REG_SZ /d "" /f >nul

:: Add DefaultIcon
reg add "HKCR\vlc\DefaultIcon" /ve /t REG_SZ /d "\"C:\Program Files\VideoLAN\VLC\vlc.exe\",0" /f >nul

:: Add Shell Open Command
reg add "HKCR\vlc\shell\open\command" /ve /t REG_SZ /d "\"%LAUNCHER_PATH%\" \"%%1\"" /f >nul

echo.
echo ----------------------------------------------------------------
echo [SUCCESS] Setup Complete!
echo ----------------------------------------------------------------
echo You can now click "Launch VLC" on the CloudStream website.
echo.
pause
