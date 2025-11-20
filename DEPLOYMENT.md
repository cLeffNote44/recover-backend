# Recover v5.1 - Deployment Guide

Complete guide to deploying your Recover app to production hosting.

**Note:** Deployment process is the same for v5.1. New features (AI insights, PDF reports, enhanced backup) are automatically included in the production build.

---

## Overview

This guide covers deploying the Recover app to various hosting platforms. The app is a static site (after building), making it compatible with most hosting services.

---

## Pre-Deployment Checklist

Before deploying, ensure:

- [ ] App runs locally without errors (`npm run dev`)
- [ ] Production build works (`npm run build && npm run preview`)
- [ ] All features tested and working
- [ ] PWA manifest configured correctly
- [ ] App icons generated (already included)
- [ ] Service worker configured (already included)
- [ ] Environment variables set (if any)

---

## Building for Production

### Step 1: Create Production Build

```bash
cd source
npm run build
```

**Output:**
- Creates `dist/` folder
- Optimized HTML, CSS, JavaScript
- Compressed assets
- Ready for deployment

**Build artifacts:**
```
dist/
├── index.html
├── assets/
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── [other assets]
├── icons/
├── manifest.json
└── sw.js
```

### Step 2: Test Production Build

```bash
npm run preview
```

Visit `http://localhost:4173` to test the production build locally.

---

## Deployment Options

### Option 1: Vercel (Recommended)

**Why Vercel:**
- Free tier available
- Automatic HTTPS
- Global CDN
- Easy deployment
- Perfect for React apps

**Deployment Steps:**

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to source folder:**
   ```bash
   cd source
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Follow prompts:**
   - Link to Vercel account (create if needed)
   - Confirm project settings
   - Deploy!

5. **Get your URL:**
   - Vercel provides a URL like: `https://recovery-journey.vercel.app`
   - Custom domain available in settings

**Automatic Deployments:**
- Connect GitHub repository
- Auto-deploy on push to main branch
- Preview deployments for pull requests

**Vercel Configuration:**

Create `vercel.json` in source folder:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite"
}
```

---

### Option 2: Netlify

**Why Netlify:**
- Free tier with generous limits
- Drag-and-drop deployment
- Automatic HTTPS
- Form handling
- Serverless functions

**Method A: Drag and Drop**

1. Build the app: `npm run build`
2. Go to [netlify.com](https://www.netlify.com)
3. Sign up/login
4. Drag the `dist/` folder to the deployment area
5. Done! Get your URL

**Method B: Netlify CLI**

1. **Install CLI:**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login:**
   ```bash
   netlify login
   ```

3. **Deploy:**
   ```bash
   cd source
   npm run build
   netlify deploy --prod
   ```

4. **Follow prompts:**
   - Create new site or link existing
   - Publish directory: `dist`
   - Deploy!

**Netlify Configuration:**

Create `netlify.toml` in source folder:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Option 3: GitHub Pages

**Why GitHub Pages:**
- Completely free
- Integrated with GitHub
- Easy to set up
- Good for open source projects

**Prerequisites:**
- GitHub account
- Git installed
- Repository created

**Deployment Steps:**

1. **Install gh-pages:**
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Update package.json:**
   ```json
   {
     "homepage": "https://yourusername.github.io/recovery-journey",
     "scripts": {
       "predeploy": "npm run build",
       "deploy": "gh-pages -d dist"
     }
   }
   ```

3. **Deploy:**
   ```bash
   npm run deploy
   ```

4. **Enable GitHub Pages:**
   - Go to repository settings
   - Pages section
   - Source: gh-pages branch
   - Save

5. **Visit your site:**
   `https://yourusername.github.io/recovery-journey`

**Vite Configuration for GitHub Pages:**

Update `vite.config.ts`:
```typescript
export default defineConfig({
  base: '/recovery-journey/', // Your repo name
  // ... rest of config
});
```

---

### Option 4: Cloudflare Pages

**Why Cloudflare Pages:**
- Free unlimited bandwidth
- Global CDN
- Automatic HTTPS
- Fast performance
- Great analytics

**Deployment Steps:**

1. **Push code to GitHub** (if not already)

2. **Go to Cloudflare Pages:**
   - Visit [pages.cloudflare.com](https://pages.cloudflare.com)
   - Sign up/login

3. **Create new project:**
   - Connect GitHub account
   - Select your repository
   - Configure build:
     - Build command: `npm run build`
     - Build output: `dist`
     - Root directory: `source`

4. **Deploy:**
   - Click "Save and Deploy"
   - Wait for build to complete

5. **Get your URL:**
   - Cloudflare provides: `https://recovery-journey.pages.dev`
   - Custom domain available

---

### Option 5: Firebase Hosting

**Why Firebase:**
- Google infrastructure
- Free tier available
- Fast global CDN
- Easy rollbacks
- Great for PWAs

**Deployment Steps:**

1. **Install Firebase CLI:**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login:**
   ```bash
   firebase login
   ```

3. **Initialize:**
   ```bash
   cd source
   firebase init hosting
   ```

4. **Configuration:**
   - Public directory: `dist`
   - Single-page app: Yes
   - Automatic builds: No (manual for now)

5. **Build and deploy:**
   ```bash
   npm run build
   firebase deploy
   ```

6. **Get your URL:**
   - Firebase provides: `https://your-project.web.app`

**Firebase Configuration:**

`firebase.json`:
```json
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
```

---

## Custom Domain Setup

### General Steps (applies to most platforms)

1. **Purchase domain** (from Namecheap, Google Domains, etc.)

2. **Add domain to hosting platform:**
   - Go to platform settings
   - Add custom domain
   - Follow instructions

3. **Update DNS records:**
   - Add A record or CNAME
   - Point to hosting platform
   - Wait for propagation (up to 48 hours)

4. **Enable HTTPS:**
   - Most platforms auto-provision SSL
   - Force HTTPS redirect

### Platform-Specific Guides

**Vercel:**
- Settings → Domains → Add
- Follow DNS instructions
- Auto HTTPS

**Netlify:**
- Domain settings → Add custom domain
- Update DNS
- Auto HTTPS

**Cloudflare Pages:**
- Custom domains → Set up
- Already on Cloudflare DNS
- Instant HTTPS

---

## Environment Variables

If your app needs environment variables:

### Vite Environment Variables

Create `.env.production`:
```
VITE_APP_NAME=Recover
VITE_API_URL=https://api.example.com
```

**Access in code:**
```typescript
const appName = import.meta.env.VITE_APP_NAME;
```

### Platform-Specific Setup

**Vercel:**
- Settings → Environment Variables
- Add variables
- Redeploy

**Netlify:**
- Site settings → Build & deploy → Environment
- Add variables
- Redeploy

**Cloudflare Pages:**
- Settings → Environment variables
- Add variables
- Redeploy

---

## PWA Considerations

### HTTPS Required

PWAs require HTTPS. All recommended platforms provide automatic HTTPS.

### Service Worker

The service worker is already configured. It will:
- Cache assets for offline use
- Enable app installation
- Improve performance

### Testing PWA

**After deployment:**

1. **Open in Chrome:**
   - Visit your deployed URL
   - Open DevTools (F12)
   - Go to Application tab
   - Check Service Workers
   - Check Manifest

2. **Test Installation:**
   - Look for install prompt
   - Install the app
   - Test offline functionality

3. **Lighthouse Audit:**
   - DevTools → Lighthouse
   - Run PWA audit
   - Fix any issues

---

## Performance Optimization

### Already Optimized

The build process includes:
- Code splitting
- Minification
- Tree shaking
- Asset optimization
- Lazy loading

### Additional Optimizations

**1. Enable Compression:**

Most platforms auto-enable gzip/brotli. Verify in response headers.

**2. Set Cache Headers:**

Configure platform to cache assets:
- HTML: No cache or short cache
- JS/CSS: Long cache (has hash in filename)
- Images: Long cache

**3. Use CDN:**

All recommended platforms use global CDNs by default.

**4. Optimize Images:**

If adding custom images:
```bash
npm install -g sharp-cli
sharp -i input.png -o output.webp
```

---

## Monitoring & Analytics

### Built-in Analytics

**Vercel Analytics:**
- Enable in dashboard
- Track page views
- Monitor performance

**Netlify Analytics:**
- Enable in dashboard
- Server-side tracking
- Privacy-friendly

**Cloudflare Analytics:**
- Automatic with Pages
- Detailed insights
- No client-side tracking

### Google Analytics (Optional)

Add to `index.html` if desired:
```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

---

## Continuous Deployment

### GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd source && npm ci
      - run: cd source && npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./source/dist
```

---

## Rollback & Versioning

### Vercel

- Deployments tab shows all versions
- Click any deployment to rollback
- Instant rollback

### Netlify

- Deploys tab lists all versions
- Click "Publish deploy" on any version
- Instant rollback

### GitHub Pages

- Revert commit and redeploy
- Or deploy previous build manually

---

## Troubleshooting Deployment

### Build Fails

**Check:**
- Node version matches local (18+)
- All dependencies in package.json
- Build works locally
- No hardcoded paths

**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install
npm run build
```

### 404 on Routes

**Issue:** Direct URLs don't work (e.g., `/app`)

**Fix:** Configure redirects (see platform sections above)

### Assets Not Loading

**Issue:** CSS/JS 404 errors

**Fix:** Check `base` in `vite.config.ts` matches deployment path

### PWA Not Installing

**Check:**
- HTTPS enabled
- Manifest.json accessible
- Service worker registered
- No console errors

### Slow Performance

**Check:**
- Assets compressed
- CDN enabled
- Caching configured
- Lighthouse score

---

## Security Best Practices

### HTTPS

- Always use HTTPS (all platforms provide this)
- Force HTTPS redirect
- HSTS headers

### Headers

Configure security headers:
```
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), microphone=(), camera=()
```

### Content Security Policy

Add to `index.html`:
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';">
```

---

## Cost Estimates

### Free Tier Limits

**Vercel:**
- 100 GB bandwidth/month
- Unlimited deployments
- Free SSL
- Free for personal projects

**Netlify:**
- 100 GB bandwidth/month
- 300 build minutes/month
- Free SSL
- Generous free tier

**GitHub Pages:**
- 100 GB bandwidth/month
- Completely free
- Public repos only

**Cloudflare Pages:**
- Unlimited bandwidth
- 500 builds/month
- Completely free

### Paid Plans (if needed)

**Vercel Pro:** $20/month
**Netlify Pro:** $19/month
**Cloudflare Pages:** Free (no paid tier needed for static sites)

---

## Recommended Setup

**For Personal Use:**
- **Platform:** Vercel or Netlify (free tier)
- **Domain:** Optional custom domain
- **Analytics:** Platform built-in
- **Monitoring:** Platform dashboards

**For Sharing/Public:**
- **Platform:** Cloudflare Pages (unlimited bandwidth)
- **Domain:** Custom domain recommended
- **Analytics:** Cloudflare Analytics
- **CDN:** Automatic global CDN

---

## Post-Deployment Checklist

After deploying:

- [ ] Visit deployed URL
- [ ] Test all features
- [ ] Test on mobile device
- [ ] Install as PWA
- [ ] Test offline functionality
- [ ] Check Lighthouse score
- [ ] Verify HTTPS
- [ ] Test custom domain (if configured)
- [ ] Share URL with others
- [ ] Set up monitoring/analytics

---

## Getting Help

### Platform Support

**Vercel:** [vercel.com/support](https://vercel.com/support)
**Netlify:** [netlify.com/support](https://www.netlify.com/support/)
**Cloudflare:** [developers.cloudflare.com/pages](https://developers.cloudflare.com/pages/)

### Community

- Stack Overflow
- Platform-specific Discord servers
- GitHub Discussions

---

**Your Recover app is ready to share with the world!** 🎉

**Deploy with confidence. Help others on their recovery journey.** 💪

