# Git Migration Guide - MedProof Project

## ✅ Step 1: Old Remote Removed

The old Git remote has been successfully removed from your local repository.

### What Was Done
- ✅ Removed remote: `origin` (https://github.com/sukanyadhaware/medproof.git)
- ✅ Verified no references remain to old GitHub account
- ✅ Local project files preserved
- ✅ Commit history intact
- ✅ Branch: `main` (ready for new remote)

### Current Status
```
Branch: main
Status: Clean (nothing to commit)
Remotes: None (ready for new remote)
Commits: Preserved (1 commit in history)
```

---

## 📋 Step 2: Prepare Your New GitHub Repository

Before adding the new remote, you need to create a new repository on GitHub.

### Instructions to Create New Repository

1. **Go to GitHub**
   - Visit https://github.com/new
   - Or click the "+" icon in the top-right corner → "New repository"

2. **Fill in Repository Details**
   - **Repository name**: `medproof` (or your preferred name)
   - **Description**: "Decentralized Medical Record Verification on Stellar Soroban"
   - **Visibility**: Choose "Public" or "Private"
   - **Initialize repository**: Leave unchecked (we have local files)
   - **Add .gitignore**: Leave unchecked (we have one)
   - **Add license**: Leave unchecked (we have MIT license)

3. **Create Repository**
   - Click "Create repository"
   - You'll see the repository URL (copy this for the next step)

### Repository URL Format
```
https://github.com/YOUR_USERNAME/medproof.git
```

---

## 🔗 Step 3: Add New Remote Repository

Once you have your new GitHub repository created, follow these steps:

### Option A: Using HTTPS (Recommended for most users)

```bash
git remote add origin https://github.com/YOUR_USERNAME/medproof.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Example:**
```bash
git remote add origin https://github.com/john-doe/medproof.git
```

### Option B: Using SSH (If you have SSH keys configured)

```bash
git remote add origin git@github.com:YOUR_USERNAME/medproof.git
```

Replace `YOUR_USERNAME` with your actual GitHub username.

**Example:**
```bash
git remote add origin git@github.com:john-doe/medproof.git
```

### Verify Remote Was Added

```bash
git remote -v
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/medproof.git (fetch)
origin  https://github.com/YOUR_USERNAME/medproof.git (push)
```

---

## 🌿 Step 4: Ensure Branch is Set to Main

The branch is already set to `main`, but verify it:

```bash
git branch
```

**Expected output:**
```
* main
```

If you're on a different branch, switch to main:

```bash
git checkout main
```

---

## 📤 Step 5: Push Project to New Repository

Now push your project to the new GitHub repository:

### First Push (with upstream tracking)

```bash
git push -u origin main
```

This command:
- Pushes all commits from `main` branch to the new remote
- Sets up upstream tracking (so future pushes only need `git push`)
- Creates the `main` branch on the remote repository

**Expected output:**
```
Enumerating objects: X, done.
Counting objects: 100% (X/X), done.
Delta compression using up to X threads
Compressing objects: 100% (X/X), done.
Writing objects: 100% (X/X), X.XX MiB | X.XX MiB/s, done.
Total X (delta X), reused X (delta X), reused pack X
remote: Resolving deltas: 100% (X/X), done.
To https://github.com/YOUR_USERNAME/medproof.git
 * [new branch]      main -> main
Branch 'main' set up to track remote branch 'main' from 'origin'.
```

### Verify Push Was Successful

```bash
git remote -v
git branch -a
```

**Expected output:**
```
origin  https://github.com/YOUR_USERNAME/medproof.git (fetch)
origin  https://github.com/YOUR_USERNAME/medproof.git (push)

* main
  remotes/origin/main
```

---

## ✅ Complete Checklist

- ✅ Old remote removed
- ✅ Local files preserved
- ✅ Commit history intact
- ✅ Branch set to `main`
- ⏳ New GitHub repository created
- ⏳ New remote added with `git remote add origin`
- ⏳ Project pushed with `git push -u origin main`

---

## 🔍 Verification Steps

After completing all steps, verify everything is correct:

### 1. Check Remote Configuration
```bash
git remote -v
```
Should show your new GitHub repository URL.

### 2. Check Branch Status
```bash
git branch -a
```
Should show `main` as current branch with `remotes/origin/main` tracking.

### 3. Check Git Status
```bash
git status
```
Should show "On branch main" and "nothing to commit, working tree clean".

### 4. Check Commit History
```bash
git log --oneline -5
```
Should show your commit history preserved.

### 5. Visit GitHub
- Go to https://github.com/YOUR_USERNAME/medproof
- Verify all files are visible
- Verify commit history is shown

---

## 🚀 Future Git Workflow

After the initial push, your workflow is simple:

### Make Changes
```bash
# Edit files
git add .
git commit -m "Your commit message"
```

### Push Changes
```bash
# Simple push (upstream already set)
git push
```

### Pull Latest Changes
```bash
git pull
```

### Create Feature Branch
```bash
git checkout -b feature/your-feature-name
# Make changes
git push -u origin feature/your-feature-name
```

---

## ⚠️ Troubleshooting

### Problem: "fatal: remote origin already exists"
**Solution**: The remote already exists. Remove it first:
```bash
git remote remove origin
git remote add origin https://github.com/YOUR_USERNAME/medproof.git
```

### Problem: "Permission denied (publickey)" with SSH
**Solution**: Use HTTPS instead:
```bash
git remote set-url origin https://github.com/YOUR_USERNAME/medproof.git
```

### Problem: "fatal: 'origin' does not appear to be a 'git' repository"
**Solution**: Make sure you're in the project directory:
```bash
cd /path/to/medproof
git remote -v
```

### Problem: Push fails with "403 Forbidden"
**Solution**: Check your GitHub credentials:
- For HTTPS: Verify username and personal access token
- For SSH: Verify SSH keys are configured

### Problem: "Branch 'main' set up to track remote branch 'main' from 'origin'"
**This is normal** - it means upstream tracking is set up correctly.

---

## 📝 Quick Reference

### Current Status
```bash
# Check current branch
git branch

# Check remotes
git remote -v

# Check status
git status

# Check commit history
git log --oneline -5
```

### Add New Remote
```bash
git remote add origin https://github.com/YOUR_USERNAME/medproof.git
```

### Push to New Remote
```bash
git push -u origin main
```

### Verify Everything
```bash
git remote -v
git branch -a
git status
```

---

## 🎯 Summary

1. ✅ **Old remote removed** - No references to previous GitHub account
2. ✅ **Local files preserved** - All project code intact
3. ✅ **Commit history intact** - All commits preserved
4. ✅ **Branch ready** - Set to `main`
5. ⏳ **Ready for new remote** - Follow steps above to add new repository

---

## 📞 Need Help?

If you encounter any issues:

1. **Check Git status**: `git status`
2. **Check remotes**: `git remote -v`
3. **Check branches**: `git branch -a`
4. **Check logs**: `git log --oneline -5`
5. **Review this guide**: Look for your issue in the Troubleshooting section

---

**Your MedProof project is ready for the new GitHub repository!** 🚀

