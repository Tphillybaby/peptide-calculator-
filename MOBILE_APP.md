# Peptide Tracker Mobile App

This document explains how to build and run the native iOS and Android versions of Peptide Tracker.

## Prerequisites

### For iOS Development
- **macOS** (required)
- **Xcode 15+** from the Mac App Store
- **CocoaPods**: `sudo gem install cocoapods`
- **Apple Developer Account** (for device testing & App Store)

### For Android Development
- **Android Studio** with Android SDK
- **Java JDK 17+**
- Android device or emulator with API 22+

## Quick Start

### 1. Build & Sync
After making changes to the web app, sync to native platforms:

```bash
npm run cap:sync
```

### 2. Open in IDE

#### iOS (Xcode)
```bash
npm run cap:ios
```
This builds the web app, syncs changes, and opens Xcode.

#### Android (Android Studio)
```bash
npm run cap:android
```
This builds the web app, syncs changes, and opens Android Studio.

### 3. Live Reload Development (Optional)
For faster development with hot-reload:

```bash
# iOS with live reload
npm run cap:dev:ios

# Android with live reload
npm run cap:dev:android
```

## Building for Production

### iOS App Store
1. Open in Xcode: `npm run cap:ios`
2. Select your signing team in **Signing & Capabilities**
3. Choose **Product > Archive**
4. Upload to App Store Connect

### Android Play Store
1. Open in Android Studio: `npm run cap:android`
2. Go to **Build > Generate Signed Bundle / APK**
3. Create or use existing keystore
4. Build release AAB (recommended) or APK
5. Upload to Google Play Console

## Project Structure

```
├── ios/                    # iOS native project
│   └── App/
│       ├── App/           # Main app target
│       │   ├── public/    # Built web assets (copied)
│       │   └── Info.plist # iOS config
│       └── Podfile        # CocoaPods dependencies
│
├── android/                # Android native project
│   └── app/
│       ├── src/main/
│       │   ├── assets/public/  # Built web assets
│       │   └── AndroidManifest.xml
│       └── build.gradle
│
├── capacitor.config.ts     # Capacitor configuration
└── src/services/nativeService.js  # Native feature wrappers
```

## Native Features Available

The `nativeService.js` provides access to:

### Haptic Feedback
```javascript
import { haptics } from './services/nativeService';

// Trigger haptic feedback
await haptics.impact('light');  // 'light', 'medium', 'heavy'
await haptics.notification('success');  // 'success', 'warning', 'error'
await haptics.vibrate(300);  // duration in ms
```

### Local Notifications (Injection Reminders)
```javascript
import { localNotifications } from './services/nativeService';

// Schedule a reminder
await localNotifications.scheduleInjectionReminder({
  id: 1,
  title: 'Injection Reminder',
  body: 'Time for your Semaglutide injection',
  scheduledAt: new Date('2025-12-26T09:00:00')
});

// Cancel notifications
await localNotifications.cancel([1, 2, 3]);
```

### Push Notifications
```javascript
import { pushNotifications } from './services/nativeService';

// Register for push notifications
const token = await pushNotifications.register();

// Listen for notifications
pushNotifications.addListeners({
  onReceive: (notification) => console.log('Received:', notification),
  onTap: (action) => console.log('Tapped:', action)
});
```

### Status Bar
```javascript
import { statusBar } from './services/nativeService';

await statusBar.setStyle('light');  // or 'dark'
await statusBar.setBackgroundColor('#0f172a');  // Android only
```

### Share
```javascript
import { share } from './services/nativeService';

await share.share({
  title: 'My Progress',
  text: 'Check out my peptide tracking results!',
  url: 'https://peptidelog.net'
});
```

### Browser (External Links)
```javascript
import { browser } from './services/nativeService';

await browser.open('https://example.com');
```

### Platform Detection
```javascript
import { device } from './services/nativeService';

console.log(device.isNative);   // true on iOS/Android
console.log(device.platform);   // 'ios', 'android', or 'web'
console.log(device.isIOS);      // true on iOS
console.log(device.isAndroid);  // true on Android
```

## App Icons & Splash Screens

### iOS
Place your icons in `ios/App/App/Assets.xcassets/AppIcon.appiconset/`

Required sizes:
- 1024x1024 (App Store)
- 180x180, 120x120, 87x87, 80x80, 60x60, 58x58, 40x40, 29x29, 20x20

### Android
Place your icons in `android/app/src/main/res/`:
- `mipmap-mdpi/` (48x48)
- `mipmap-hdpi/` (72x72)
- `mipmap-xhdpi/` (96x96)
- `mipmap-xxhdpi/` (144x144)
- `mipmap-xxxhdpi/` (192x192)

### Splash Screen
Configure in `capacitor.config.ts`:
```typescript
SplashScreen: {
  launchShowDuration: 2000,
  backgroundColor: '#0f172a',
  // iOS: use LaunchScreen.storyboard
  // Android: use resources in android/app/src/main/res/drawable/splash.png
}
```

## Environment Variables

For different configurations (dev/staging/prod), create:
- `.env.development`
- `.env.staging`
- `.env.production`

And update the build scripts accordingly.

## Troubleshooting

### iOS Build Issues
```bash
cd ios/App
pod install --repo-update
```

### Android Gradle Issues
```bash
cd android
./gradlew clean
```

### Sync Issues
```bash
npx cap sync --force
```

### Reset Native Projects
```bash
# Remove and re-add platforms
rm -rf ios android
npx cap add ios
npx cap add android
```

## App Store Requirements

### iOS (App Store Connect)
- Privacy Policy URL
- App Description
- Screenshots (6.7", 6.5", 5.5", iPad)
- App Icon (1024x1024)
- Age Rating questionnaire

### Android (Google Play Console)
- Privacy Policy URL
- App Description
- Screenshots (phone & tablet)
- Feature Graphic (1024x500)
- High-res Icon (512x512)
- Content Rating questionnaire

## Version Updates

When releasing updates:
1. Update version in `package.json`
2. Update `ios/App/App/Info.plist`:
   - `CFBundleShortVersionString` (display version)
   - `CFBundleVersion` (build number)
3. Update `android/app/build.gradle`:
   - `versionName`
   - `versionCode`

---

## Mobile Optimizations (Added Dec 25, 2025)

The app includes comprehensive mobile optimizations for a native-like experience:

### CSS Optimizations (`src/styles/mobile.css`)
- **Safe Area Handling** - Proper padding for iOS notch and home indicator
- **Touch Targets** - Minimum 44px tap targets for accessibility
- **Momentum Scrolling** - iOS-style elastic scrolling
- **Keyboard Handling** - Auto-hide navigation when keyboard opens
- **Native Animations** - Page transitions, sheet modals, haptic visual feedback
- **OLED Dark Mode** - True black backgrounds for OLED displays
- **Landscape Mode** - Optimized layout for horizontal orientation
- **Accessibility** - Focus states, reduced motion, high contrast support

### Native Features
- **Haptic Feedback** - Tactile response on navigation taps
- **Android Back Button** - Native back button handling
- **Status Bar Integration** - Theme-aware status bar styling
- **Pull to Refresh** - Custom hook with haptic feedback (`usePullToRefresh`)

### Pull to Refresh Usage
```javascript
import { usePullToRefresh, PullToRefreshIndicator } from '../hooks/usePullToRefresh';

function MyComponent() {
  const { isRefreshing, pullDistance, progress } = usePullToRefresh(async () => {
    await fetchData();
  });

  return (
    <>
      <PullToRefreshIndicator 
        isRefreshing={isRefreshing} 
        progress={progress} 
        pullDistance={pullDistance} 
      />
      {/* Your content */}
    </>
  );
}
```

---

**Last Updated:** December 25, 2025
