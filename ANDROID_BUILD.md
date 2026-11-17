# DRIFTLENS-Q — Android APK Packaging Guide (Capacitor)

This project has been architected specifically for mobile-first Android execution and zero-friction packaging using **Capacitor**.

---

## 1. Prerequisites

Ensure you have the following installed on your machine:
- **Node.js**: v18+ (Current environment: v24.16.0)
- **Java Development Kit (JDK)**: OpenJDK 17 or 21
- **Android Studio**: Latest version with Android SDK Platform 34+ and Android Build-Tools

---

## 2. Step-by-Step APK Generation

### Step 1: Install Capacitor Dependencies
Run in the project root:
```bash
npm install @capacitor/core
npm install -D @capacitor/cli @capacitor/android
```

### Step 2: Initialize Capacitor Configuration
Initialize the Capacitor app with the bundle identifier:
```bash
npx cap init "DRIFTLENS-Q" "io.driftlens.q" --web-dir "dist"
```

This creates `capacitor.config.json` (or `capacitor.config.ts`):
```json
{
  "appId": "io.driftlens.q",
  "appName": "DRIFTLENS-Q",
  "webDir": "dist",
  "server": {
    "androidScheme": "https"
  },
  "android": {
    "backgroundColor": "#102438",
    "allowMixedContent": false
  }
}
```

### Step 3: Build the Web Production Bundle
Compile the optimized Vite distribution:
```bash
npm run build
```

### Step 4: Add the Android Native Platform
```bash
npx cap add android
```
This generates the native Android Studio project folder under `./android`.

### Step 5: Synchronize Web Assets & Plugins
Whenever web code changes, sync assets into the Android native wrapper:
```bash
npx cap copy
npx cap sync
```

### Step 6: Open Project in Android Studio
Launch Android Studio:
```bash
npx cap open android
```

### Step 7: Build the APK
Within Android Studio:
1. Select **Build** > **Build Bundle(s) / APK(s)** > **Build APK(s)**.
2. The generated debug APK will be created at:
   `android/app/build/outputs/apk/debug/app-debug.apk`
3. You can transfer this APK directly to any Android smartphone via USB or Google Drive and install it.

---

## 3. Always-On Preloader Sound (already applied)

The splash preloader video must play **with sound on every launch — no tap required**.
Android WebView **blocks audible autoplay by default** (`mediaPlaybackRequiresUserAction = true`),
which made the preloader play silently on phones. `MainActivity.java` disables that requirement:

```java
// android/app/src/main/java/io/driftlens/q/MainActivity.java
@Override
public void onCreate(Bundle savedInstanceState) {
  super.onCreate(savedInstanceState);
  applyAlwaysSound(); // setMediaPlaybackRequiresUserGesture(false)
}
```

> **Web (Vercel) note:** browsers still require the first interaction before sound
> (autoplay policy) — that is a platform rule. The **APK built from this project is the
> guaranteed always-sound build**: every launch, sound plays without any tap.

---

## 4. Safe Area & Back Navigation Compatibility

The frontend has already implemented:
- `viewport-fit=cover` in `index.html`
- `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)`
- Hardware back navigation compatibility with React Router DOM history stack
- Fixed touch-target sizing (44px+)
- `user-scalable=no` and `overscroll-behavior-y: contain` to prevent webview bouncing
