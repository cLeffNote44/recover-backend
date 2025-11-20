# Git Hooks Setup Guide

## Overview

This guide explains how to set up git hooks to automatically check for backup files and other issues before committing.

---

## 🚀 Quick Setup (Recommended)

### Option 1: Manual Hook (Simple)

1. **Copy pre-commit script to git hooks:**

```bash
# From project root
cd source
cp scripts/pre-commit.js ../.git/hooks/pre-commit
chmod +x ../.git/hooks/pre-commit
```

2. **Edit the pre-commit hook file:**

```bash
# Edit .git/hooks/pre-commit
# Add this as the first line:
#!/usr/bin/env node
```

3. **Test it works:**

```bash
# Create a test backup file
touch test.backup
git add test.backup
git commit -m "test"

# Should block the commit with error message
```

### Option 2: Using Husky (Recommended for Teams)

Husky manages git hooks and works across all team members.

1. **Install Husky:**

```bash
cd source
pnpm add -D husky
```

2. **Initialize Husky:**

```bash
pnpm exec husky init
```

3. **Add pre-commit hook:**

```bash
# This creates .husky/pre-commit
echo "node scripts/pre-commit.js" > .husky/pre-commit
```

4. **Test it works:**

```bash
# Create a test backup file
touch test.backup
git add test.backup
git commit -m "test"

# Should block the commit
```

5. **Commit the Husky setup:**

```bash
git add .husky/
git add package.json
git commit -m "Add Husky pre-commit hooks"
```

---

## 🔧 Available Hooks

### Pre-Commit Hook

**Purpose:** Prevent backup files from being committed

**What it checks:**
- *.backup files
- *.bak files
- *.old files
- *.orig files
- *~ files (editor backups)
- *.swp, *.swo files (vim backups)
- *.tmp, *.temp files

**Script location:** `source/scripts/pre-commit.js`

**How to bypass** (not recommended):
```bash
git commit --no-verify -m "Emergency commit"
```

---

## 📋 Manual Checks (No Hooks)

If you prefer not to use git hooks, run these checks manually:

### Before Committing

```bash
cd source

# 1. Check for backup files
pnpm run check:backups

# 2. Check for orphaned files
pnpm run check:orphans

# 3. Run tests
pnpm test

# 4. Build
pnpm run build
```

### Add to Your Workflow

Create a pre-commit script in package.json:

```json
{
  "scripts": {
    "precommit": "pnpm run check:backups && pnpm run check:orphans && pnpm test"
  }
}
```

Then run before committing:
```bash
pnpm run precommit
git add .
git commit -m "Your message"
```

---

## 🐛 Troubleshooting

### Hook Not Running

**Symptom:** Backup files are committed without error

**Solutions:**

1. Check if hook file exists:
   ```bash
   ls -la .git/hooks/pre-commit
   ```

2. Check if hook is executable:
   ```bash
   chmod +x .git/hooks/pre-commit
   ```

3. Check hook has shebang:
   ```bash
   head -1 .git/hooks/pre-commit
   # Should show: #!/usr/bin/env node
   ```

4. Test hook manually:
   ```bash
   .git/hooks/pre-commit
   ```

### Hook Blocks Valid Commits

**Symptom:** Hook blocks commits with false positives

**Solutions:**

1. **Bypass for emergency** (not recommended):
   ```bash
   git commit --no-verify -m "Emergency fix"
   ```

2. **Update patterns** in `scripts/pre-commit.js`:
   ```javascript
   // Add exclusions
   const BACKUP_PATTERNS = [
     /\.backup$/,
     // Add your patterns
   ];
   ```

3. **Add to .gitignore** instead:
   ```bash
   echo "*.backup" >> .gitignore
   ```

### Node.js Not Found

**Symptom:** Error: `node: command not found`

**Solutions:**

1. Ensure Node.js is installed:
   ```bash
   node --version
   ```

2. Update shebang in hook:
   ```bash
   # If node is in different location
   which node
   # Update first line of hook to that path
   ```

3. Use bash script instead:
   ```bash
   #!/bin/bash
   cd source && node scripts/pre-commit.js
   ```

---

## 🔄 Updating Hooks

### Update Pre-Commit Hook

1. **Edit the script:**
   ```bash
   vim source/scripts/pre-commit.js
   ```

2. **If using manual hook, recopy:**
   ```bash
   cp source/scripts/pre-commit.js .git/hooks/pre-commit
   ```

3. **If using Husky, it updates automatically**

### Add New Hook Types

Husky supports all git hooks:

```bash
# Pre-push hook
echo "pnpm test" > .husky/pre-push

# Commit message hook
echo "node scripts/commit-msg.js" > .husky/commit-msg

# Post-commit hook
echo "node scripts/post-commit.js" > .husky/post-commit
```

---

## 📚 Best Practices

### Do's ✅

- **Use hooks for preventable mistakes** (backup files, formatting)
- **Keep hooks fast** (<5 seconds)
- **Make hooks informative** (explain what's wrong and how to fix)
- **Test hooks before deploying** to team
- **Document how to bypass** for emergencies
- **Version control hook scripts** (in `scripts/`)

### Don'ts ❌

- **Don't run slow operations** (full test suite - use CI instead)
- **Don't make hooks too strict** (allow --no-verify for emergencies)
- **Don't check in .git/hooks/** (use Husky or scripts/)
- **Don't rely solely on hooks** (still need code review)
- **Don't forget Windows compatibility** (use Node.js scripts, not bash)

---

## 🎯 Recommended Setup for Teams

1. **Use Husky** - Automatic setup for all team members
2. **Version control hook scripts** - Keep in `scripts/` directory
3. **Document in README** - Tell team how to set up
4. **Add to onboarding** - New developers set up hooks day 1
5. **Monitor effectiveness** - Track if hooks catching issues

---

## 📊 Hook Performance

### Expected Performance

| Hook | Duration | Acceptable? |
|------|----------|-------------|
| check:backups | <1s | ✅ Yes |
| check:orphans | 5-10s | ⚠️ Consider optional |
| lint | 2-5s | ✅ Yes |
| test | 30-120s | ❌ Use CI instead |
| build | 10-30s | ❌ Use CI instead |

### Keep Hooks Fast

```bash
# Good - Fast checks only
.husky/pre-commit:
  node scripts/pre-commit.js        # <1s
  pnpm run check:backups            # <1s

# Bad - Slow checks
.husky/pre-commit:
  pnpm test                         # 60s+
  pnpm run build                    # 30s+
  pnpm run check:orphans            # 10s
```

**Rule of thumb:** Hooks should complete in <5 seconds

---

## 🔗 Related Documentation

- [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) - Code review standards
- [MONTHLY_AUDIT_PROCESS.md](./MONTHLY_AUDIT_PROCESS.md) - Monthly audit guide
- [ORPHANED_COMPONENTS_CLEANUP.md](./ORPHANED_COMPONENTS_CLEANUP.md) - Cleanup guide

---

## ❓ FAQ

### Q: Can I skip hooks for emergency commits?

**A:** Yes, use `git commit --no-verify`, but fix issues ASAP.

### Q: Do hooks work on Windows?

**A:** Yes, using Node.js scripts ensures cross-platform compatibility.

### Q: What if I don't want to use hooks?

**A:** Run checks manually with `pnpm run check:all` before committing.

### Q: Can hooks automatically fix issues?

**A:** Not recommended. Hooks should detect and inform, not auto-fix.

### Q: How do I share hooks with team?

**A:** Use Husky - hooks are checked in and auto-installed.

### Q: Should hooks run tests?

**A:** Quick unit tests (<5s) are okay. Full test suite should run in CI.

---

**Last Updated:** 2025-11-20
**Version:** 1.0.0
