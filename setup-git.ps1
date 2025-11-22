# Git Setup Script for thermal-hubble
# Run this script from PowerShell to complete the git initialization

Write-Host "=== Git Setup for thermal-hubble ===" -ForegroundColor Cyan
Write-Host ""

# Navigate to the project directory
Set-Location "C:\Users\mstan\Documents\Projects\thermal-hubble"
Write-Host "✓ Navigated to project directory" -ForegroundColor Green

# Initialize git repository
Write-Host "Initializing git repository..." -ForegroundColor Yellow
git init
Write-Host "✓ Git repository initialized" -ForegroundColor Green

# Add all files
Write-Host "Adding files to git..." -ForegroundColor Yellow
git add .
Write-Host "✓ Files staged for commit" -ForegroundColor Green

# Create initial commit
Write-Host "Creating initial commit..." -ForegroundColor Yellow
git commit -m "Initial commit: HazmatForm application with button animations

Features:
- AI-powered SDS parsing with Gemini
- Hazmat form validation
- Default emergency phone and signatory fields
- Button animations with visual feedback
- Comprehensive tooltips
- Packaging type description field"

Write-Host "✓ Initial commit created" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing npm dependencies..." -ForegroundColor Yellow
npm install
Write-Host "✓ Dependencies installed" -ForegroundColor Green

# Show git status
Write-Host ""
Write-Host "=== Git Status ===" -ForegroundColor Cyan
git status
git log --oneline -1

Write-Host ""
Write-Host "=== Setup Complete! ===" -ForegroundColor Green
Write-Host ""
Write-Host "Your project is now at: C:\Users\mstan\Documents\Projects\thermal-hubble" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Test the app: npm run dev"
Write-Host "  2. (Optional) Connect to GitHub:"
Write-Host "     - Create a new repo on GitHub"
Write-Host "     - git remote add origin https://github.com/YOUR_USERNAME/thermal-hubble.git"
Write-Host "     - git branch -M main"
Write-Host "     - git push -u origin main"
Write-Host ""
