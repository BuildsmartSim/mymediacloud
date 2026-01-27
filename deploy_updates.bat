@echo off
echo ==========================================
echo      CloudStream Deployment Helper
echo ==========================================
echo.
echo Adding all changes...
git add .

echo.
echo Committing changes...
git commit -m "Update: Search Refactor, Trakt Integration, UI Polish"

echo.
echo Pushing to repository...
git push

echo.
echo ==========================================
echo      Deployment Complete!
echo ==========================================
pause
