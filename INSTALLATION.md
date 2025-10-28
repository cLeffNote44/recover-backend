# Recovery Journey v5.1 - Installation Guide

Complete step-by-step instructions for setting up and running the Recovery Journey app.

**Note:** Installation process is the same for v5.1. New features (AI insights, PDF reports, enhanced backup) are included in the build.

---

## Prerequisites

Before you begin, ensure you have the following installed on your computer:

### Required Software

**Node.js (version 18 or higher)**
- Download from [nodejs.org](https://nodejs.org)
- Choose the LTS (Long Term Support) version
- Installation includes npm (Node Package Manager)

**To verify installation:**
```bash
node --version
# Should show v18.x.x or higher

npm --version
# Should show 9.x.x or higher
```

### Optional Tools

**Code Editor (recommended for customization):**
- [Visual Studio Code](https://code.visualstudio.com) (free, highly recommended)
- [WebStorm](https://www.jetbrains.com/webstorm/) (paid)
- Any text editor will work

**Git (optional, for version control):**
- Download from [git-scm.com](https://git-scm.com)
- Useful for tracking changes

---

## Installation Steps

### Step 1: Extract the Package

1. Locate the downloaded `recovery-journey-v5-final.zip` file
2. Extract it to your desired location
3. You should see a folder structure like this:

```
recovery-journey-v5-final/
├── README.md
├── docs/
└── source/
```

### Step 2: Open Terminal/Command Prompt

**On Windows:**
- Press `Win + R`
- Type `cmd` and press Enter
- OR use PowerShell or Windows Terminal

**On macOS:**
- Press `Cmd + Space`
- Type `terminal` and press Enter

**On Linux:**
- Press `Ctrl + Alt + T`
- OR search for "Terminal" in applications

### Step 3: Navigate to Source Folder

```bash
cd path/to/recovery-journey-v5-final/source
```

Replace `path/to/` with the actual path where you extracted the files.

**Example:**
```bash
# Windows
cd C:\Users\YourName\Downloads\recovery-journey-v5-final\source

# macOS/Linux
cd ~/Downloads/recovery-journey-v5-final/source
```

### Step 4: Install Dependencies

Run the following command:

```bash
npm install
```

**What this does:**
- Downloads all required packages
- Sets up the development environment
- Installs React, TypeScript, Vite, and other dependencies

**Expected output:**
```
added 234 packages, and audited 235 packages in 45s

89 packages are looking for funding
  run `npm fund` for details

found 0 vulnerabilities
```

**This may take 2-5 minutes** depending on your internet speed.

### Step 5: Start the Development Server

```bash
npm run dev
```

**Expected output:**
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: http://192.168.1.100:5173/
➜  press h to show help
```

### Step 6: Open in Browser

1. Open your web browser (Chrome, Firefox, Safari, or Edge)
2. Navigate to: `http://localhost:5173`
3. The Recovery Journey app should load!

---

## Troubleshooting Installation

### Issue: "node: command not found"

**Solution:** Node.js is not installed or not in PATH
1. Install Node.js from [nodejs.org](https://nodejs.org)
2. Restart your terminal
3. Verify with `node --version`

### Issue: "npm install" fails with permission errors

**Solution (macOS/Linux):**
```bash
sudo npm install
```

**Solution (Windows):**
- Run Command Prompt as Administrator
- Try again

**Better Solution (all platforms):**
Use a Node version manager:
- **Windows:** [nvm-windows](https://github.com/coreybutler/nvm-windows)
- **macOS/Linux:** [nvm](https://github.com/nvm-sh/nvm)

### Issue: Port 5173 already in use

**Solution:** Another app is using that port

**Option 1:** Stop the other app

**Option 2:** Use a different port
```bash
npm run dev -- --port 3000
```

### Issue: "Cannot find module" errors

**Solution:** Dependencies not installed properly
```bash
# Delete node_modules and package-lock.json
rm -rf node_modules package-lock.json

# Reinstall
npm install
```

### Issue: Slow installation

**Solution:** Use a faster package manager

**Install pnpm:**
```bash
npm install -g pnpm
```

**Then use pnpm instead:**
```bash
pnpm install
pnpm dev
```

---

## Alternative Installation Methods

### Using pnpm (Faster)

```bash
# Install pnpm globally
npm install -g pnpm

# Navigate to source folder
cd recovery-journey-v5-final/source

# Install dependencies
pnpm install

# Run development server
pnpm dev
```

### Using Yarn

```bash
# Install yarn globally
npm install -g yarn

# Navigate to source folder
cd recovery-journey-v5-final/source

# Install dependencies
yarn install

# Run development server
yarn dev
```

---

## Building for Production

To create an optimized production build:

```bash
npm run build
```

**Output:**
- Creates a `dist/` folder
- Contains optimized HTML, CSS, and JavaScript
- Ready to deploy to any web server

**Preview the production build:**
```bash
npm run preview
```

---

## Installing as PWA

Once the app is running, you can install it as a Progressive Web App:

### Desktop (Chrome/Edge)

1. Open the app in your browser
2. Look for the install icon in the address bar (⊕ or computer icon)
3. Click it and select "Install"
4. The app will open in its own window
5. An icon will be added to your desktop/applications

### Mobile (iOS - Safari)

1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Edit the name if desired
5. Tap "Add"
6. The app icon will appear on your home screen

### Mobile (Android - Chrome)

1. Open the app in Chrome
2. Tap the menu icon (three dots)
3. Tap "Add to Home Screen"
4. Edit the name if desired
5. Tap "Add"
6. The app icon will appear on your home screen

---

## Development Environment Setup

### Visual Studio Code Setup

**Recommended Extensions:**

1. **ESLint** - Code linting
2. **Prettier** - Code formatting
3. **Tailwind CSS IntelliSense** - Tailwind autocomplete
4. **TypeScript Vue Plugin (Volar)** - TypeScript support
5. **Path Intellisense** - Path autocomplete

**To install:**
1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X / Cmd+Shift+X)
3. Search for each extension
4. Click "Install"

### Recommended VS Code Settings

Create `.vscode/settings.json` in the source folder:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib"
}
```

---

## System Requirements

### Minimum Requirements
- **OS:** Windows 10, macOS 10.15, or Linux (Ubuntu 20.04+)
- **RAM:** 4 GB
- **Disk Space:** 500 MB for dependencies
- **Browser:** Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

### Recommended Requirements
- **OS:** Latest version of Windows, macOS, or Linux
- **RAM:** 8 GB or more
- **Disk Space:** 1 GB free
- **Browser:** Latest version of Chrome, Firefox, Safari, or Edge

---

## Network Requirements

### Initial Setup
- Internet connection required to download dependencies
- Approximately 50-100 MB download

### Running the App
- **Development:** Runs locally, no internet needed
- **PWA:** Works offline after first load
- **Updates:** Internet needed to update dependencies

---

## File Structure After Installation

```
source/
├── node_modules/          # Dependencies (created after npm install)
├── public/               # Static assets
│   ├── icons/           # PWA icons
│   ├── manifest.json    # PWA manifest
│   └── sw.js           # Service worker
├── src/                 # Source code
│   ├── components/      # React components
│   ├── contexts/       # React contexts
│   ├── hooks/          # Custom hooks
│   ├── lib/            # Utilities
│   ├── pages/          # Page components
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app
│   ├── main.tsx        # Entry point
│   └── index.css       # Global styles
├── index.html          # HTML entry
├── package.json        # Dependencies list
├── tsconfig.json       # TypeScript config
├── vite.config.ts      # Vite config
└── tailwind.config.ts  # Tailwind config
```

---

## Next Steps

After successful installation:

1. **Read the User Guide** - `docs/USER_GUIDE.md`
2. **Explore Features** - `docs/FEATURES.md`
3. **Set Your Sobriety Date** - First step in the app
4. **Complete Your First Check-In** - Start building your streak
5. **Add Support Contacts** - Quick access in emergencies
6. **Build Your Prevention Plan** - Proactive safety planning

---

## Getting Help

### Common Issues
- Check the Troubleshooting section above
- Search for error messages online
- Check Node.js and npm versions

### Resources
- [Node.js Documentation](https://nodejs.org/docs)
- [Vite Documentation](https://vitejs.dev)
- [React Documentation](https://react.dev)

---

## Uninstallation

To remove the app:

1. **Stop the development server** (Ctrl+C in terminal)
2. **Delete the source folder**
3. **Uninstall PWA** (if installed):
   - Desktop: Right-click app icon → Uninstall
   - Mobile: Long-press icon → Remove

To remove Node.js (if desired):
- **Windows:** Control Panel → Programs → Uninstall
- **macOS:** Use the installer to uninstall
- **Linux:** `sudo apt remove nodejs npm`

---

**Installation complete! You're ready to start your recovery journey.** 🎉

**One day at a time. You've got this!** 💪

