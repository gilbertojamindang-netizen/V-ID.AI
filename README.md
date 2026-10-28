# VOID.AI - Native Android Application (Capacitor)

An advanced tactical cyberpunk AI voice assistant and cloud control suite, packaged as a high-performance native Android application using **Capacitor** and **Jetpack Android**.

## App Specifications
- **App Name**: `VOID.AI`
- **Application ID / Package**: `com.voidai.app`
- **Target Platform**: Android (API 26 to 35+)
- **Architecture**: Native Android wrapper + Compiled offline web distribution (`dist/` synced to `android/app/src/main/assets/public/`)
- **Offline Capable**: Yes, boots without active internet connection.

## Building the APK using GitHub Actions (Recommended)
This repository includes a pre-configured GitHub Actions workflow in `.github/workflows/build-apk.yml`:
1. Push this project to your GitHub repository.
2. Go to **Actions** -> **Build Android APK** -> **Run workflow**.
3. Under **Artifacts**, download `VOID-AI-debug-apk` and install `app-debug.apk` on your phone!

## Building Locally with Android Studio
1. `npm install`
2. `npm run build`
3. `npx cap sync android`
4. `cd android && ./gradlew assembleDebug`
Output APK: `android/app/build/outputs/apk/debug/app-debug.apk`
