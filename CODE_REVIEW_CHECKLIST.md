# Code Review Checklist

## Overview

This checklist ensures code quality, maintainability, and prevents common issues like orphaned files and unused dependencies.

**Use this checklist for:**
- Pull request reviews
- Self-review before committing
- Pre-merge verification

---

## 🔍 General Code Quality

### Code Structure
- [ ] Code follows existing project patterns and conventions
- [ ] Functions are small and single-purpose (< 50 lines ideal)
- [ ] No code duplication (DRY principle)
- [ ] Proper error handling with try-catch blocks
- [ ] Clear variable and function names (no `temp`, `data`, `handle`, etc.)

### TypeScript
- [ ] No `any` types (use proper types or `unknown`)
- [ ] Interfaces/types defined for complex objects
- [ ] No TypeScript errors or warnings
- [ ] Return types specified on public functions
- [ ] Proper null/undefined handling

### Comments & Documentation
- [ ] Complex logic has explanatory comments
- [ ] JSDoc comments for public APIs
- [ ] No commented-out code (delete it - use git history)
- [ ] TODO comments have assignee and date
- [ ] README updated if new features added

---

## 🗂️ File Management

### New Files
- [ ] **All new components are imported somewhere** ⚠️ Critical
- [ ] File names follow project conventions (PascalCase for components)
- [ ] Files are in appropriate directories
- [ ] No duplicate files with similar names
- [ ] File location makes logical sense

### Backup Files ⚠️ Critical
- [ ] **No .backup, .bak, .old, .orig files** (use git history!)
- [ ] **No temporary files committed** (*.tmp, *.temp, *~)
- [ ] Run `pnpm run check:backups` before committing
- [ ] Check .gitignore includes backup patterns

### Orphaned Files
- [ ] **Removed files are deleted, not just unused** ⚠️
- [ ] Search codebase for imports before deleting
- [ ] Run `pnpm run check:orphans` to detect unused files
- [ ] No orphaned test files (if component deleted, delete tests too)

---

## 📦 Dependencies

### New Dependencies
- [ ] Dependency is truly needed (can't use built-in alternative)
- [ ] Dependency is actively maintained (check npm/GitHub)
- [ ] Dependency has reasonable bundle size
- [ ] License is compatible with project
- [ ] Security vulnerabilities checked (`pnpm audit`)
- [ ] Document why dependency was added (in PR description)

### Unused Dependencies
- [ ] No unused imports in code
- [ ] Run `pnpm run check:orphans` to find unused packages
- [ ] Remove dependencies if refactoring eliminates need
- [ ] Update package.json if removing dependencies

---

## 🎨 React/UI Components

### Component Structure
- [ ] Components are pure and functional
- [ ] Props are properly typed
- [ ] No prop drilling (use context if needed)
- [ ] Proper use of hooks (not in loops/conditions)
- [ ] useEffect dependencies are correct
- [ ] Memoization used for expensive computations

### Component Usage
- [ ] **New components are actually used** ⚠️
- [ ] Components are properly imported and rendered
- [ ] No duplicate components with different names
- [ ] Component names are descriptive
- [ ] Components follow existing patterns (Dialog vs Modal consistency)

### Modal/Dialog Components ⚠️
- [ ] **Use shadcn Dialog component** (not custom fixed overlay)
- [ ] Proper accessibility (ARIA labels, focus management)
- [ ] ESC key and click-outside to close
- [ ] Focus trap implemented
- [ ] File named `*Dialog.tsx` (not `*Modal.tsx`)

---

## 🧪 Testing

### Test Coverage
- [ ] Tests written for new features
- [ ] Critical paths are tested
- [ ] Edge cases considered
- [ ] Error cases tested
- [ ] All tests pass (`pnpm test`)

### Test Quality
- [ ] Tests are readable and maintainable
- [ ] No flaky tests
- [ ] Tests don't depend on execution order
- [ ] Mock external dependencies properly
- [ ] Test descriptions are clear

---

## 🚀 Performance

### Bundle Size
- [ ] Check bundle size impact (run `pnpm run build`)
- [ ] Large libraries are lazy-loaded if possible
- [ ] Images are optimized and properly sized
- [ ] No duplicate dependencies in bundle
- [ ] Tree-shaking works properly

### Runtime Performance
- [ ] No unnecessary re-renders
- [ ] Lists use proper keys
- [ ] Debounce/throttle for expensive operations
- [ ] Lazy load heavy components
- [ ] Check for memory leaks

---

## 🔒 Security

### Code Security
- [ ] No hardcoded secrets or API keys
- [ ] Environment variables used properly
- [ ] No console.log with sensitive data
- [ ] Input validation for user data
- [ ] XSS prevention (no dangerouslySetInnerHTML without sanitization)
- [ ] No SQL injection risks (use parameterized queries)

### Dependencies
- [ ] Run `pnpm audit` for vulnerabilities
- [ ] No deprecated dependencies
- [ ] Dependencies are from trusted sources
- [ ] License compatibility checked

---

## 📝 Console Logging

### Logging Standards
- [ ] **No debug console.log statements** ⚠️
- [ ] Console.error only in catch blocks
- [ ] Use error-tracking service for production errors
- [ ] Development logs use `import.meta.env.DEV` check
- [ ] No console.log with large objects (performance)

### Error Handling
- [ ] All promises have .catch() or try-catch
- [ ] Errors have meaningful messages
- [ ] Errors include context (user action, timestamp)
- [ ] Error boundaries for React components
- [ ] Unhandled rejection listeners

---

## 🎯 Specific Checks

### Utils and Helpers
- [ ] utils-app.ts hasn't grown too large (should be split into focused modules)
- [ ] Helper functions are in appropriate utility modules
- [ ] No duplicate utility functions
- [ ] Functions have clear single responsibilities

### State Management
- [ ] Zustand stores are properly organized
- [ ] No prop drilling (use store instead)
- [ ] State updates are immutable
- [ ] No unnecessary global state

### Routing
- [ ] Routes are properly defined
- [ ] Navigation works correctly
- [ ] 404 handling implemented
- [ ] Deep linking works (if applicable)

---

## 📚 Documentation

### Code Documentation
- [ ] README updated if needed
- [ ] API documentation current
- [ ] Environment variables documented
- [ ] Setup instructions accurate
- [ ] Architecture decisions documented (ADR)

### Change Documentation
- [ ] PR description explains what/why
- [ ] Breaking changes highlighted
- [ ] Migration guide if needed
- [ ] Screenshots/videos for UI changes
- [ ] Changelog updated

---

## ✅ Pre-Commit Checklist

Run these commands before committing:

```bash
# 1. Check for orphaned components and unused dependencies
pnpm run check:orphans

# 2. Check for backup files
pnpm run check:backups

# 3. Run linter
pnpm run lint

# 4. Run tests
pnpm test

# 5. Build successfully
pnpm run build

# 6. Check for console.log statements
git diff --cached | grep "console.log"
```

---

## 🔄 Monthly Audit Checklist

**Schedule:** First Monday of each month

### Dependency Audit
- [ ] Run `pnpm run check:orphans` to find unused files
- [ ] Run `pnpm outdated` to check for updates
- [ ] Run `pnpm audit` for security vulnerabilities
- [ ] Review and update dependencies

### Code Audit
- [ ] Search for TODO comments: `git grep "TODO"`
- [ ] Search for console.log: `git grep "console.log"`
- [ ] Search for backup files: `find . -name "*.backup"`
- [ ] Review and remove orphaned components

### Documentation Audit
- [ ] README is current
- [ ] API docs are current
- [ ] Architecture diagrams are current
- [ ] Deployment docs are current

See [MONTHLY_AUDIT_PROCESS.md](./MONTHLY_AUDIT_PROCESS.md) for detailed instructions.

---

## 🚫 Common Mistakes to Avoid

### Critical Issues ⚠️
1. **Committing backup files** (.backup, .bak, .old)
2. **Creating orphaned components** (not imported anywhere)
3. **Adding unused dependencies** (check before adding)
4. **Leaving debug console.log** (remove before commit)
5. **Using custom Modal instead of Dialog** (use shadcn Dialog)

### Code Quality Issues
1. Using `any` type in TypeScript
2. Prop drilling instead of context/state management
3. No error handling in async functions
4. Not cleaning up useEffect subscriptions
5. Missing keys on list items

### Performance Issues
1. Not lazy loading large dependencies
2. Creating new functions/objects in render
3. Not memoizing expensive computations
4. Re-rendering entire component tree
5. Loading all data at once instead of pagination

---

## 📞 Need Help?

- **Unclear about requirement?** → Ask in PR comments
- **Found a complex issue?** → Schedule code review session
- **Security concern?** → Contact security team immediately
- **Performance issue?** → Run performance profiling

---

## 📋 Checklist Summary

**Before committing:**
- ✅ No backup files (*.backup, *.bak, *.old)
- ✅ No orphaned components (all imports used)
- ✅ No debug console.log statements
- ✅ All new components are imported somewhere
- ✅ TypeScript compiles without errors
- ✅ Tests pass
- ✅ Build succeeds

**Before PR:**
- ✅ Run all pre-commit checks
- ✅ Update documentation
- ✅ Add tests for new features
- ✅ Check bundle size impact
- ✅ Review own code first

**During review:**
- ✅ Use this checklist
- ✅ Be thorough but kind
- ✅ Explain suggestions
- ✅ Focus on learning
- ✅ Approve when ready

---

**Last Updated:** 2025-11-20
**Version:** 1.0.0
**Owner:** Development Team
