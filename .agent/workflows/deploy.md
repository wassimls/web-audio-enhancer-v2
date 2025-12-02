---
description: Deploy to GitHub and Vercel
---

# Deploy to GitHub and Vercel

This workflow guides you through deploying the Audio Enhancer v2 application to GitHub and Vercel.

## Prerequisites

Ensure you have:
- GitHub account created
- Vercel account created and linked to GitHub
- Git configured with your name and email

## Steps

### 1. Configure Git (First Time Only)

```powershell
git config user.name "Your Name"
git config user.email "your.email@example.com"
```

### 2. Check Current Status

// turbo
```powershell
git status
```

### 3. Add All Files to Git

// turbo
```powershell
git add .
```

### 4. Commit Changes

```powershell
git commit -m "Initial commit: Audio Enhancer v2 ready for deployment"
```

### 5. Create GitHub Repository

1. Go to https://github.com/new
2. Name: `web-audio-enhancer-v2`
3. Keep it Public or Private
4. **DO NOT** initialize with README, .gitignore, or license
5. Click "Create repository"

### 6. Connect and Push to GitHub

```powershell
# Replace USERNAME and REPO-NAME with your actual values
git remote add origin https://github.com/USERNAME/REPO-NAME.git
git branch -M main
git push -u origin main
```

### 7. Deploy to Vercel

1. Go to https://vercel.com/new
2. Click "Import" next to your repository
3. Vercel will auto-detect settings from `vercel.json`
4. Click "Deploy"
5. Wait for deployment to complete (~1-2 minutes)
6. Visit your live URL!

## Future Updates

After making changes to your code:

// turbo
```powershell
git add .
```

```powershell
git commit -m "Description of your changes"
```

```powershell
git push
```

Vercel will automatically deploy the new version!

## Troubleshooting

- **Build Failed on Vercel**: Check the build logs in Vercel dashboard
- **404 Errors**: Ensure `vercel.json` has the rewrites configuration
- **Git Push Denied**: You may need a Personal Access Token instead of password
  - Go to: GitHub → Settings → Developer settings → Personal access tokens
