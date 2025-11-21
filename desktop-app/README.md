# Recover Facility Portal - Desktop Application

Cross-platform desktop application for rehab facility staff to manage patients, communicate, and track recovery progress.

## Features

- **Dashboard** - Overview of facility stats, reminders, appointments, and messages
- **Patient Management** - Create patients, generate registration keys, view progress
- **Messages** - Real-time communication with patients
- **Settings** - Profile management, notifications, security

## Tech Stack

- **Framework**: Electron 28+
- **Frontend**: React 18 + TypeScript
- **Styling**: Tailwind CSS (blue color scheme matching mobile app)
- **State**: Zustand
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+
- npm 9+

### Development

```bash
# Install dependencies
npm install

# Start development (Vite + Electron)
npm run dev
```

This will start:
- Vite dev server on http://localhost:5173
- Electron app pointing to Vite

### Build

```bash
# Build for production
npm run build

# Package for distribution
npm run package        # All platforms
npm run package:win    # Windows
npm run package:mac    # macOS
npm run package:linux  # Linux
```

## Project Structure

```
desktop-app/
├── electron/           # Electron main process
│   ├── main.ts
│   └── preload.ts
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── Layout.tsx
│   │   ├── Sidebar.tsx
│   │   └── Header.tsx
│   ├── pages/          # Page components
│   │   ├── Dashboard.tsx
│   │   ├── Patients.tsx
│   │   ├── PatientDetail.tsx
│   │   ├── Messages.tsx
│   │   ├── Settings.tsx
│   │   └── LoginPage.tsx
│   ├── stores/         # Zustand stores
│   │   └── authStore.ts
│   ├── services/       # API services (TODO)
│   ├── types/          # TypeScript types
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── tailwind.config.js
├── vite.config.ts
└── tsconfig.json
```

## Color Scheme

Matches the mobile app's blue theme:

- **Primary-900**: `#1e3a8a` (sidebar background)
- **Primary-700**: `#1d4ed8` (primary buttons)
- **Primary-600**: `#2563eb` (active states)
- **Primary-500**: `#3b82f6` (focus rings)

Status badges:
- **Success**: Green (`#22c55e`)
- **Warning**: Yellow (`#f59e0b`)
- **Danger**: Red (`#ef4444`)

## Demo Credentials

```
Super Admin:
  Email: admin@recoversystem.com
  Password: SuperAdmin123!

Counselor:
  Email: dr.martinez@hoperecovery.com
  Password: Counselor123!
```

## TODO

- [ ] Connect to backend API
- [ ] Implement real-time WebSocket updates
- [ ] Add document upload/download
- [ ] Add appointment management
- [ ] Add treatment plan editor
- [ ] Add analytics/reports section
- [ ] Add auto-updates via electron-updater
- [ ] Add notification system
- [ ] Unit and integration tests

## Screenshots

### Login
Professional login screen with branding panel and form.

### Dashboard
Overview with stats cards, reminders, appointments, and messages.

### Patients
Data table with search, filters, and patient creation modal.

### Patient Detail
Full patient profile with stats, contact info, and recent activity.

### Messages
Conversation list and chat interface.

## License

PROPRIETARY - Recovery System
