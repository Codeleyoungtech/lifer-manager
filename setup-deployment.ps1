# Deployment Setup Script for Windows PowerShell
# Run this after creating a GitHub repository

Write-Host "🚀 Lifer Results - Deployment Setup" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Check if git is initialized
if (-not (Test-Path ".git")) {
    Write-Host "📦 Initializing Git repository..." -ForegroundColor Yellow
    git init
    Write-Host "✅ Git initialized" -ForegroundColor Green
} else {
    Write-Host "✅ Git already initialized" -ForegroundColor Green
}

# Ask for GitHub repository URL
Write-Host ""
Write-Host "Please create a repository on GitHub first:" -ForegroundColor Cyan
Write-Host "👉 https://github.com/new" -ForegroundColor Yellow
Write-Host ""
$repoUrl = Read-Host "Enter your GitHub repository URL (e.g., https://github.com/username/repo.git)"

if ($repoUrl) {
    # Check if remote already exists
    $remoteExists = git remote get-url origin 2>$null
    
    if ($remoteExists) {
        Write-Host "⚠️  Remote 'origin' already exists. Updating..." -ForegroundColor Yellow
        git remote set-url origin $repoUrl
    } else {
        Write-Host "📡 Adding remote origin..." -ForegroundColor Yellow
        git remote add origin $repoUrl
    }
    Write-Host "✅ Remote configured" -ForegroundColor Green
}

# Stage all files
Write-Host ""
Write-Host "📝 Staging files..." -ForegroundColor Yellow
git add .
Write-Host "✅ Files staged" -ForegroundColor Green

# Commit
Write-Host ""
$commitMessage = Read-Host "Enter commit message (press Enter for default: 'Initial deployment')"
if (-not $commitMessage) {
    $commitMessage = "Initial deployment"
}

git commit -m $commitMessage
Write-Host "✅ Changes committed" -ForegroundColor Green

# Ask about branch
Write-Host ""
$currentBranch = git branch --show-current
Write-Host "Current branch: $currentBranch" -ForegroundColor Cyan

if ($currentBranch -ne "main") {
    $renameToMain = Read-Host "Rename branch to 'main'? (y/n)"
    if ($renameToMain -eq "y") {
        git branch -M main
        Write-Host "✅ Branch renamed to main" -ForegroundColor Green
    }
}

# Push to GitHub
Write-Host ""
Write-Host "🚀 Ready to push to GitHub!" -ForegroundColor Cyan
$pushNow = Read-Host "Push now? (y/n)"

if ($pushNow -eq "y") {
    Write-Host "📤 Pushing to GitHub..." -ForegroundColor Yellow
    git push -u origin main
    Write-Host "✅ Pushed to GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎉 SUCCESS! Your code is now on GitHub!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Go to https://render.com and sign up" -ForegroundColor White
    Write-Host "2. Follow the DEPLOY-NOW.md guide" -ForegroundColor White
    Write-Host "3. Deploy your application!" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "⏸️  Skipped push. Run 'git push -u origin main' when ready." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📚 Deployment guides available:" -ForegroundColor Cyan
Write-Host "  - DEPLOY-NOW.md (detailed steps)" -ForegroundColor White
Write-Host "  - DEPLOYMENT-CHECKLIST.md (checklist)" -ForegroundColor White
Write-Host "  - QUICK-DEPLOY-REFERENCE.md (quick lookup)" -ForegroundColor White
Write-Host ""
