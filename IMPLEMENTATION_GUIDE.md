# Recovery Journey - Implementation Guide

## ✅ **COMPLETED: Critical Features for App Store Deployment**

This guide documents the implementation of Capacitor integration, local notifications, and onboarding flow for native iOS/Android deployment.

---

## 📋 **What Was Implemented**

### **1. Capacitor Integration (Native App Wrapper)**

#### Files Created/Modified:
- ✅ `capacitor.config.ts` - Main Capacitor configuration
- ✅ `vite.config.ts` - Vite build configuration for Capacitor
- ✅ `package.json` - Added Capacitor scripts and dependencies

#### Packages Installed:
```bash
@capacitor/core
@capacitor/cli
@capacitor/app
@capacitor/haptics
@capacitor/local-notifications
@capacitor/push-notifications
@capacitor/splash-screen
@capacitor/preferences
```

#### Available Scripts:
```bash
npm run build:mobile       # Build web assets and sync to native
npm run cap:add:ios        # Add iOS platform
npm run cap:add:android    # Add Android platform
npm run cap:sync           # Sync web code to native platforms
npm run cap:open:ios       # Open iOS project in Xcode
npm run cap:open:android   # Open Android project in Android Studio
```

---

### **2. Local Notifications System**

#### Files Created:
- ✅ `src/lib/notifications.ts` - Complete notification service

#### Features Implemented:
- **Permission handling** - Request and check notification permissions
- **Daily check-in reminders** - Scheduled at user-configurable time
- **Streak risk alerts** - Notify if user hasn't checked in
- **Meeting reminders** - 30-minute warnings for scheduled meetings
- **Milestone celebrations** - Automatic notifications for badge unlocks
- **Platform detection** - Only runs on native iOS/Android

#### Key Functions:
```typescript
// Request permission
await requestNotificationPermission()

// Schedule daily reminder
await scheduleDailyCheckInReminder('09:00')

// Show milestone notification
await showMilestoneNotification('30 Days Sober!', 30)

// Schedule meeting reminder
await scheduleMeetingReminder(meetingId, 'AA Meeting', date, 30)
```

---

### **3. Onboarding Flow**

#### Files Created:
- ✅ `src/pages/Onboarding.tsx` - Main onboarding page (6 steps)
- ✅ `src/components/OnboardingStep.tsx` - Reusable step component

#### Onboarding Steps:
1. **Welcome Screen** - App overview with feature highlights
2. **Sobriety Date** - Set initial recovery date
3. **Add Sponsor** - Optional first support contact
4. **Daily Reminder** - Set preferred check-in time
5. **Enable Notifications** - Request notification permissions (native only)
6. **Ready to Start** - Quick start guide and completion

#### Features:
- Progress indicator (visual and step count)
- Back/Next navigation
- Skip option for optional steps
- Beautiful gradient design matching app theme
- Automatic data saving on completion

---

### **4. Notification Settings UI**

#### Files Created:
- ✅ `src/components/app/screens/SettingsScreen.tsx` - Full settings page

#### Settings Available:
- **Enable/Disable Notifications** - Master toggle
- **Daily Reminder Time** - Time picker
- **Streak Reminders** - Toggle
- **Meeting Reminders** - Toggle
- **Milestone Notifications** - Toggle
- **Data Management** - Export, import, clear data
- **Reset Onboarding** - Restart setup flow

#### Added to Navigation:
- New "Settings" tab in bottom navigation (6 tabs total)
- Platform-aware UI (shows warnings when not on native device)

---

### **5. App Context Updates**

#### Files Modified:
- ✅ `src/types/app.ts` - Added notification and onboarding types
- ✅ `src/contexts/AppContext.tsx` - State management for new features

#### New State:
```typescript
interface AppData {
  // ... existing fields
  notificationSettings: NotificationSettings;
  onboardingCompleted: boolean;
}
```

---

### **6. Routing & Protection**

#### Files Modified:
- ✅ `src/App.tsx` - Added onboarding routing and protection

#### Features:
- **Protected Routes** - App page requires onboarding completion
- **Automatic Redirect** - New users go to onboarding
- **Loading State** - Shows loading screen while checking status

---

## 🚀 **Next Steps: Building for Native Platforms**

### **iOS Deployment**

1. **Install Xcode** (Mac only):
   - Download from Mac App Store
   - Requires macOS and Apple Developer Account ($99/year)

2. **Add iOS Platform**:
   ```bash
   cd source
   npm run cap:add:ios
   ```

3. **Open in Xcode**:
   ```bash
   npm run cap:open:ios
   ```

4. **Configure in Xcode**:
   - Set bundle identifier: `com.recovery.journey`
   - Set app name: "Recovery Journey"
   - Add app icons (already configured in `public/icons/`)
   - Configure signing & capabilities
   - Enable Push Notifications capability
   - Enable Background Modes > Remote notifications

5. **Build & Test**:
   - Select simulator or connected device
   - Click Run (▶️) button
   - Test notifications, onboarding, all features

6. **Deploy to App Store**:
   - Archive build (Product > Archive)
   - Upload to App Store Connect
   - Complete store listing
   - Submit for review

### **Android Deployment**

1. **Install Android Studio**:
   - Download from developer.android.com
   - Install Android SDK and emulator

2. **Add Android Platform**:
   ```bash
   cd source
   npm run cap:add:android
   ```

3. **Open in Android Studio**:
   ```bash
   npm run cap:open:android
   ```

4. **Configure in Android Studio**:
   - Set package name: `com.recovery.journey`
   - Set app name: "Recovery Journey"
   - Update `AndroidManifest.xml` permissions (already configured)
   - Add app icons (already configured)
   - Generate signing key:
     ```bash
     keytool -genkey -v -keystore recovery-journey.keystore -alias recovery-journey -keyalg RSA -keysize 2048 -validity 10000
     ```

5. **Build & Test**:
   - Select emulator or connected device
   - Click Run (▶️) button
   - Test notifications, onboarding, all features

6. **Deploy to Google Play**:
   - Build signed APK/AAB (Build > Generate Signed Bundle/APK)
   - Create Google Play Console account ($25 one-time)
   - Upload build
   - Complete store listing
   - Submit for review

---

## 🧪 **Testing Checklist**

Before deploying, test these critical features:

### **Onboarding**
- [ ] New users see onboarding on first app launch
- [ ] All 6 steps navigate correctly
- [ ] Sobriety date saves properly
- [ ] Sponsor contact saves (if provided)
- [ ] Reminder time saves
- [ ] Notification permission request works (on device)
- [ ] Onboarding completion redirects to app

### **Notifications** (Test on Device)
- [ ] Permission request shows native dialog
- [ ] Daily reminder schedules at correct time
- [ ] Meeting reminders work (test with near-future event)
- [ ] Milestone notification shows when badge unlocked
- [ ] Notifications can be disabled in settings
- [ ] Reminder time can be changed

### **Settings Screen**
- [ ] All toggles work properly
- [ ] Time picker updates reminder time
- [ ] Export data downloads JSON file
- [ ] Import data restores from backup
- [ ] Clear data removes all info (with confirmation)
- [ ] Reset onboarding works

### **App Protection**
- [ ] New users can't access /app without completing onboarding
- [ ] Returning users skip onboarding
- [ ] Direct navigation to /app redirects to onboarding if needed

---

## 📱 **Platform-Specific Notes**

### **iOS**
- Requires physical device or simulator for full testing
- Notifications don't work in browser/PWA
- Push notifications require Apple Developer Program
- App Review typically takes 1-2 weeks
- Stricter review guidelines

### **Android**
- Emulator supports notifications
- Easier testing environment
- Can test APK on device without store
- Google Play Review typically 1-3 days
- More lenient review process

### **Web/PWA**
- Notifications limited (not available in most browsers)
- Can still use app as web app
- Onboarding still works
- All features except native notifications functional

---

## 🔧 **Troubleshooting**

### **Dependencies Error**
```bash
npm error ERESOLVE unable to resolve dependency tree
```
**Solution**: Use `npm install --legacy-peer-deps`

### **Capacitor Sync Fails**
```bash
Error: Could not find directory
```
**Solution**: Ensure platforms are added first:
```bash
npm run cap:add:ios
npm run cap:add:android
```

### **Notifications Not Working**
- **Check**: Is app running on native device?
- **Check**: Are permissions granted?
- **Check**: Is `notificationSettings.enabled` true?
- **Debug**: Check console for errors from notifications.ts

### **Onboarding Not Showing**
- **Check**: Is `onboardingCompleted` false in localStorage?
- **Solution**: Clear localStorage or click "Reset Onboarding" in Settings

---

## 📦 **File Structure**

```
source/
├── capacitor.config.ts          # Capacitor configuration
├── vite.config.ts               # Build configuration
├── package.json                 # Dependencies and scripts
│
├── src/
│   ├── App.tsx                  # Routing with onboarding protection
│   ├── lib/
│   │   └── notifications.ts     # Notification service
│   ├── types/
│   │   └── app.ts              # Type definitions (updated)
│   ├── contexts/
│   │   └── AppContext.tsx      # State management (updated)
│   ├── components/
│   │   ├── OnboardingStep.tsx  # Reusable onboarding step
│   │   └── app/
│   │       ├── BottomNav.tsx   # Navigation (added Settings)
│   │       └── screens/
│   │           └── SettingsScreen.tsx  # Settings page
│   └── pages/
│       ├── Onboarding.tsx      # Onboarding flow
│       └── AppPage.tsx         # Main app (updated)
│
└── public/
    ├── manifest.json           # PWA manifest
    └── icons/                  # App icons (all sizes)
```

---

## 🎯 **Summary**

### **What's Done ✅**
1. ✅ Capacitor installed and configured
2. ✅ Notification service fully implemented
3. ✅ 6-step onboarding flow created
4. ✅ Settings page with all notification controls
5. ✅ App protection (requires onboarding)
6. ✅ State management updated
7. ✅ Native scripts added to package.json

### **Ready to Build 🚀**
Your app is now ready to be built for iOS and Android! Follow the deployment steps above to:
1. Add native platforms
2. Test on devices
3. Submit to app stores

### **Current Status**
- ✅ **PWA Ready**: Works in browsers (with limited notifications)
- ✅ **Native Ready**: Can be built for iOS and Android
- ✅ **Feature Complete**: All critical features implemented
- ⏳ **Pending**: Native platform setup and testing

---

## 💡 **Tips for Success**

1. **Test Early**: Add platforms and test on real devices ASAP
2. **Icons Matter**: Ensure all icon sizes are present in `public/icons/`
3. **Privacy Policy**: Required for app stores - create before submitting
4. **Backup Data**: Users should export data before app updates
5. **Analytics**: Consider adding Capacitor Analytics plugin
6. **Crashlytics**: Consider Firebase Crashlytics for production

---

**Need Help?** Check Capacitor docs at [capacitorjs.com](https://capacitorjs.com)
