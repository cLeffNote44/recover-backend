# Monthly Audit Process

## Overview

Regular monthly audits help maintain code quality, identify technical debt, and keep the codebase healthy and maintainable.

**Schedule:** First Monday of each month
**Duration:** 2-4 hours
**Owner:** Tech Lead (can be delegated)
**Next Audit:** [Set date here]

---

## 🗓️ Audit Schedule

| Month | Date | Owner | Status | Issues Found |
|-------|------|-------|--------|--------------|
| Dec 2025 | 2025-12-01 | TBD | Pending | - |
| Jan 2026 | 2026-01-06 | TBD | Pending | - |
| Feb 2026 | 2026-02-03 | TBD | Pending | - |

---

## 📋 Audit Checklist

### Part 1: Orphaned Files & Components (30 min)

#### Step 1: Check for Orphaned Components

```bash
# Run unimported tool
cd source
pnpm run check:orphans

# Review output for:
# - Unused files
# - Unused dependencies
# - Unresolved imports
```

**What to look for:**
- Components not imported anywhere
- Utility functions never called
- Types/interfaces not used
- Test files for deleted components

**Action:**
- Document findings in issue tracker
- Create PR to remove orphaned files
- Update documentation if needed

#### Step 2: Check for Backup Files

```bash
# Check for backup files
pnpm run check:backups

# Manual check for common patterns
find . -name "*.backup"
find . -name "*.bak"
find . -name "*.old"
find . -name "*~"
```

**Action:**
- Delete any backup files found
- Investigate why they were created
- Educate team on using git history

---

### Part 2: Dependency Audit (45 min)

#### Step 3: Check for Unused Dependencies

```bash
# Already done by check:orphans, but verify
pnpm run check:orphans | grep "package.json"

# Check for unused peer dependencies
pnpm list --depth=0

# Check for duplicate dependencies
pnpm list --depth=0 | sort | uniq -d
```

**Action:**
- Remove unused dependencies
- Update package.json
- Run `pnpm install` to update lockfile
- Verify build still works

#### Step 4: Check for Outdated Dependencies

```bash
# Check for updates
pnpm outdated

# Check for security vulnerabilities
pnpm audit

# Check for deprecated packages
pnpm outdated | grep "DEPRECATED"
```

**Review each outdated package:**
- Is it a major version update? → Check changelog for breaking changes
- Is it a minor/patch update? → Generally safe to update
- Is it deprecated? → Find replacement package

**Action:**
- Create spreadsheet of updates needed
- Prioritize security updates
- Schedule dependency update PR
- Test thoroughly after updates

#### Step 5: Dependency Security

```bash
# Run security audit
pnpm audit

# Check for high/critical vulnerabilities
pnpm audit --audit-level=high

# Review audit report
pnpm audit --json > audit-report.json
```

**Action:**
- Fix critical/high vulnerabilities immediately
- Document moderate/low vulnerabilities
- Update packages with fixes
- If no fix available, document workaround

---

### Part 3: Code Quality Audit (60 min)

#### Step 6: Search for TODOs

```bash
# Find all TODO comments
git grep -n "TODO" src/

# Find FIXMEs
git grep -n "FIXME" src/

# Find HACK comments
git grep -n "HACK" src/
```

**Review each TODO:**
- Is it still relevant?
- Has it been fixed but comment not removed?
- Should it be a ticket in issue tracker?
- Is it assigned to someone?

**Action:**
- Create tickets for legitimate TODOs
- Remove outdated TODOs
- Assign owners to TODOs
- Set deadlines for important items

#### Step 7: Search for Console Logs

```bash
# Find console.log statements
git grep -n "console.log" src/

# Find console.error (review if appropriate)
git grep -n "console.error" src/

# Find console.warn
git grep -n "console.warn" src/
```

**Review each console statement:**
- Is it debug code? → Remove
- Is it error tracking? → Keep (or migrate to error service)
- Is it performance monitoring? → Keep (or migrate to monitoring service)

**Action:**
- Remove debug console.log statements
- Document intentional console usage
- Consider migrating to proper logging service

#### Step 8: Check File Sizes

```bash
# Find large files
find src -type f -size +50k -exec ls -lh {} \; | sort -k 5 -h

# Find long files (>500 lines)
find src -name "*.ts" -o -name "*.tsx" | xargs wc -l | sort -n | tail -20

# Find large components
find src/components -name "*.tsx" | xargs wc -l | sort -n | tail -20
```

**Review large files:**
- Files >500 lines → Should they be split?
- Components >300 lines → Can they be broken down?
- Utils >800 lines → Should be split into focused modules

**Action:**
- Document files that need refactoring
- Create refactoring tickets
- Prioritize based on impact

---

### Part 4: Build & Performance Audit (30 min)

#### Step 9: Build Analysis

```bash
# Run production build
pnpm run build

# Analyze bundle size
ls -lh dist/assets/*.js | sort -k 5 -h

# Check for large chunks (>500 KB)
find dist/assets -name "*.js" -size +500k
```

**Review build output:**
- Are any chunks >500 KB? → Consider code splitting
- Are chunks properly split? → Review rollup config
- Is CSS properly extracted? → Check CSS bundle size

**Action:**
- Document large bundles
- Create tickets for code splitting
- Consider lazy loading large dependencies

#### Step 10: Dependency Size Impact

```bash
# Analyze what's in the bundle (requires plugin)
# Install if needed: pnpm add -D rollup-plugin-visualizer

# Check size of each dependency
pnpm list --depth=0 --long

# Find largest dependencies
du -sh node_modules/* | sort -h | tail -20
```

**Action:**
- Identify unnecessarily large dependencies
- Look for lighter alternatives
- Consider if dependency is worth its size

---

### Part 5: Documentation Audit (15 min)

#### Step 11: Documentation Review

```bash
# Check if READMEs are current
cat README.md
cat source/README.md

# Check if docs folder is current
ls -la docs/

# Check for outdated documentation
find . -name "*.md" -mtime +180  # Not modified in 6 months
```

**Review documentation:**
- Is README current with latest features?
- Are setup instructions accurate?
- Is architecture documentation current?
- Are deployment docs up-to-date?

**Action:**
- Update outdated documentation
- Add missing documentation
- Remove obsolete documentation
- Create tickets for complex docs updates

---

### Part 6: Test Coverage Audit (30 min)

#### Step 12: Test Coverage Analysis

```bash
# Run tests with coverage
pnpm test --coverage

# Review coverage report
# (Opens in browser or check terminal output)

# Find untested files
# Look for files with <50% coverage
```

**Review coverage:**
- Critical paths tested?
- Error cases tested?
- Edge cases tested?
- Integration tests present?

**Action:**
- Add tests for critical uncovered code
- Document why some code isn't tested
- Set coverage goals for next audit

#### Step 13: Test Quality

```bash
# Find skipped tests
git grep -n "test.skip\|it.skip" src/

# Find focused tests (should be removed)
git grep -n "test.only\|it.only" src/

# Check for flaky tests
# (Review CI/CD logs for inconsistent failures)
```

**Action:**
- Unskip tests or document why skipped
- Remove .only from tests
- Fix flaky tests
- Update test utilities if needed

---

## 📊 Audit Report Template

After completing audit, create report:

```markdown
# Monthly Audit Report - [Month Year]

**Date:** [Date]
**Auditor:** [Name]
**Duration:** [Hours]

## Summary

- **Orphaned Files:** [Number] found, [Number] removed
- **Backup Files:** [Number] found, [Number] removed
- **Unused Dependencies:** [Number] found, [Number] removed
- **Security Vulnerabilities:** [Number] found, [Number] fixed
- **Console.log Statements:** [Number] found, [Number] removed
- **TODOs:** [Number] found, [Number] resolved
- **Large Files:** [Number] candidates for refactoring
- **Test Coverage:** [Percentage]%

## Issues Found

### High Priority
1. [Issue description]
2. [Issue description]

### Medium Priority
1. [Issue description]
2. [Issue description]

### Low Priority
1. [Issue description]
2. [Issue description]

## Actions Taken

- ✅ [Action]
- ✅ [Action]
- ⏳ [Action in progress]
- 📋 [Action ticket created: #123]

## Recommendations

1. [Recommendation]
2. [Recommendation]

## Next Audit

**Date:** [Next audit date]
**Focus Areas:** [Special focus for next audit]
```

---

## 🎯 Key Metrics to Track

Track these metrics over time to measure codebase health:

| Metric | Target | Current | Trend |
|--------|--------|---------|-------|
| Orphaned Files | 0 | TBD | - |
| Unused Dependencies | 0 | TBD | - |
| Security Vulnerabilities (High/Critical) | 0 | TBD | - |
| Console.log in production code | 0 | TBD | - |
| Files >500 lines | <10 | TBD | - |
| Test Coverage | >80% | TBD | - |
| Bundle Size (main) | <500 KB | TBD | - |
| Build Time | <10s | TBD | - |

---

## 🚨 Emergency Audit Triggers

Run an emergency audit immediately if:

1. **Critical security vulnerability** discovered
2. **Production outage** related to code quality
3. **Major dependency update** required
4. **Significant performance regression** detected
5. **Major refactoring completed**

---

## 📚 Resources

### Tools Used
- `unimported` - Find orphaned files and unused dependencies
- `pnpm audit` - Security vulnerability scanning
- `pnpm outdated` - Check for dependency updates

### Documentation
- [CODE_REVIEW_CHECKLIST.md](./CODE_REVIEW_CHECKLIST.md) - Code review standards
- [ORPHANED_COMPONENTS_CLEANUP.md](./ORPHANED_COMPONENTS_CLEANUP.md) - Cleanup guide
- [DEPENDENCY_CLEANUP.md](./DEPENDENCY_CLEANUP.md) - Dependency management
- [CONSOLE_LOGGING_CLEANUP.md](./CONSOLE_LOGGING_CLEANUP.md) - Logging standards

### Scripts
- `pnpm run check:orphans` - Find orphaned files
- `pnpm run check:backups` - Find backup files
- `pnpm run check:all` - Run all checks

---

## 💡 Tips for Efficient Audits

1. **Use automation** - Scripts save time and are more thorough
2. **Document as you go** - Take notes during audit for report
3. **Prioritize** - Not everything needs immediate fixing
4. **Create tickets** - Track issues for later fixing
5. **Set realistic goals** - Can't fix everything in one audit
6. **Focus on patterns** - If you find one issue, search for similar issues
7. **Share findings** - Team learning opportunity
8. **Track progress** - Compare to previous audits

---

## 🔄 Continuous Improvement

After each audit:

1. **Review what worked** - Which checks were most valuable?
2. **Update process** - Add new checks if needed
3. **Automate** - Can any manual checks be automated?
4. **Share lessons** - What did the team learn?
5. **Set goals** - What to improve by next audit?

---

## ✅ Audit Completion Checklist

Before considering audit complete:

- [ ] All automated checks run
- [ ] All manual reviews completed
- [ ] Audit report created
- [ ] High priority issues addressed or ticketed
- [ ] Team notified of findings
- [ ] Next audit date scheduled
- [ ] Audit report committed to repo
- [ ] Metrics updated in tracking sheet

---

**Last Updated:** 2025-11-20
**Version:** 1.0.0
**Next Review:** 2026-01-06 (First Monday of January)
