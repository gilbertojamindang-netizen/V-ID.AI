export interface AndroidFile {
  path: string;
  language: string;
  description: string;
  content: string;
}

export const ANDROID_PROJECT_FILES: AndroidFile[] = [
  {
    path: "android/app/src/main/java/com/voidai/app/VoidAccessibilityService.kt",
    language: "kotlin",
    description: "Android AccessibilityService: Screen reader, autonomous button clicker, cross-app text injector, and account login assistant",
    content: `package com.voidai.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * VOID.AI Tactical Accessibility Service
 * Autonomous screen reading, cross-app UI clicking, text injection,
 * and system navigation across TikTok, Facebook, YouTube, Chrome, and any Android app.
 */
class VoidAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "VoidAccessibility"
        var instance: VoidAccessibilityService? = null
            private set

        val isServiceRunning: Boolean
            get() = instance != null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        Log.i(TAG, "VOID Accessibility Service connected and initialized.")

        val info = serviceInfo ?: AccessibilityServiceInfo()
        info.apply {
            eventTypes = AccessibilityEvent.TYPES_ALL_MASK
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = (AccessibilityServiceInfo.FLAG_DEFAULT or
                    AccessibilityServiceInfo.FLAG_RETRIEVE_INTERACTIVE_WINDOWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS)
            notificationTimeout = 100
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        val packageName = event.packageName?.toString() ?: ""
        val eventType = AccessibilityEvent.eventTypeToString(event.eventType)
        Log.d(TAG, "Event: $eventType from Package: $packageName")
    }

    override fun onInterrupt() {
        Log.w(TAG, "VOID Accessibility Service interrupted.")
    }

    override fun onDestroy() {
        super.onDestroy()
        if (instance == this) {
            instance = null
        }
    }

    /**
     * Reads and dumps all visible text and interactive nodes from the active screen.
     */
    fun readScreenContent(): String {
        val rootNode = rootInActiveWindow ?: return "Screen content empty or unavailable."
        val builder = StringBuilder()
        builder.append("=== ACTIVE SCREEN DUMP ===\\n")
        builder.append("Package: ").append(rootNode.packageName ?: "Unknown").append("\\n")
        
        val interactiveNodes = mutableListOf<String>()
        traverseNodes(rootNode, interactiveNodes, 0)

        builder.append("Interactive Elements (\${interactiveNodes.size}):\\n")
        interactiveNodes.take(25).forEach { builder.append(it).append("\\n") }
        rootNode.recycle()
        return builder.toString()
    }

    private fun traverseNodes(node: AccessibilityNodeInfo?, list: MutableList<String>, depth: Int) {
        if (node == null || depth > 10) return

        val text = node.text?.toString()?.trim()
        val contentDesc = node.contentDescription?.toString()?.trim()
        val viewId = node.viewIdResourceName
        val isClickable = node.isClickable
        val isEditable = node.isEditable

        if (!text.isNullOrEmpty() || !contentDesc.isNullOrEmpty() || isClickable || isEditable) {
            val label = text ?: contentDesc ?: viewId ?: "unlabeled"
            val type = if (isClickable) "[BTN]" else if (isEditable) "[INPUT]" else "[TEXT]"
            list.add("$type \\"$label\\" (id: \${viewId ?: \\"none\\"})")
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            traverseNodes(child, list, depth + 1)
            child?.recycle()
        }
    }

    /**
     * Finds a clickable node matching text or description and performs ACTION_CLICK.
     */
    fun findAndClickByText(targetText: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val cleanTarget = targetText.trim().lowercase()

        val matchingNodes = rootNode.findAccessibilityNodeInfosByText(targetText)
        if (matchingNodes.isNotEmpty()) {
            for (node in matchingNodes) {
                if (performClickOnNode(node)) {
                    rootNode.recycle()
                    return true
                }
            }
        }

        val found = deepSearchAndClick(rootNode, cleanTarget)
        rootNode.recycle()
        return found
    }

    private fun deepSearchAndClick(node: AccessibilityNodeInfo?, target: String): Boolean {
        if (node == null) return false

        val text = node.text?.toString()?.lowercase() ?: ""
        val desc = node.contentDescription?.toString()?.lowercase() ?: ""

        if ((text.contains(target) || desc.contains(target))) {
            if (performClickOnNode(node)) return true
        }

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            if (deepSearchAndClick(child, target)) {
                child?.recycle()
                return true
            }
            child?.recycle()
        }
        return false
    }

    private fun performClickOnNode(node: AccessibilityNodeInfo): Boolean {
        var current: AccessibilityNodeInfo? = node
        while (current != null) {
            if (current.isClickable) {
                val success = current.performAction(AccessibilityNodeInfo.ACTION_CLICK)
                if (success) return true
            }
            current = current.parent
        }
        return false
    }

    /**
     * Types text into the currently focused or first available editable field.
     */
    fun typeTextIntoCurrentFocus(textToType: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false

        val focused = rootNode.findFocus(AccessibilityNodeInfo.FOCUS_INPUT)
        if (focused != null && focused.isEditable) {
            val args = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, textToType)
            }
            val result = focused.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
            focused.recycle()
            rootNode.recycle()
            return result
        }

        val editable = findFirstEditableNode(rootNode)
        if (editable != null) {
            val args = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, textToType)
            }
            val result = editable.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
            editable.recycle()
            rootNode.recycle()
            return result
        }

        rootNode.recycle()
        return false
    }

    private fun findFirstEditableNode(node: AccessibilityNodeInfo?): AccessibilityNodeInfo? {
        if (node == null) return null
        if (node.isEditable) return node

        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            val found = findFirstEditableNode(child)
            if (found != null) return found
            child?.recycle()
        }
        return null
    }

    fun launchApp(packageName: String): Boolean {
        return try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(launchIntent)
                true
            } else false
        } catch (e: Exception) {
            false
        }
    }

    fun performHome(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performBack(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun performRecents(): Boolean = performGlobalAction(GLOBAL_ACTION_RECENTS)
    fun scrollUp(): Boolean = rootInActiveWindow?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD) ?: false
    fun scrollDown(): Boolean = rootInActiveWindow?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD) ?: false
}`
  },
  {
    path: "android/app/src/main/java/com/voidai/app/VoidVoiceForegroundService.kt",
    language: "kotlin",
    description: "Always-On Mic Foreground Service: Persistent notification + WakeLock listening continuously even when using other apps",
    content: `package com.voidai.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.os.Build
import android.os.Bundle
import android.os.IBinder
import android.os.PowerManager
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import androidx.core.app.NotificationCompat
import java.util.Locale

/**
 * VOID.AI Always-On Voice Foreground Service
 * Keeps microphone active with persistent notification across TikTok, Facebook, etc.
 */
class VoidVoiceForegroundService : Service() {

    companion object {
        private const val TAG = "VoidForegroundVoice"
        private const val NOTIFICATION_ID = 7782
        private const val CHANNEL_ID = "void_voice_channel"
        private const val CHANNEL_NAME = "VOID.AI Always-On Listener"
        
        var isServiceRunning = false
            private set
    }

    private var wakeLock: PowerManager.WakeLock? = null
    private var speechRecognizer: SpeechRecognizer? = null
    private var recognizerIntent: Intent? = null
    private var isListeningLoop = false

    override fun onCreate() {
        super.onCreate()
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "VOID:AlwaysOnMicWakeLock").apply {
            setReferenceCounted(false)
            acquire(24 * 60 * 60 * 1000L)
        }

        createNotificationChannel()
        val notification = buildPersistentNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        isServiceRunning = true
        initializeSpeechRecognizer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startContinuousListening()
        return START_STICKY
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                CHANNEL_NAME,
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Persistent listener for VOID.AI always-on voice recognition"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun buildPersistentNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("VØID.AI Neural Listener Active")
            .setContentText("Always-on mic active. Listening across TikTok, Facebook, etc...")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun initializeSpeechRecognizer() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) return

        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}
                override fun onError(error: Int) { restartListeningDelay() }
                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    if (!matches.isNullOrEmpty()) {
                        handleBackgroundCommand(matches[0])
                    }
                    restartListeningDelay()
                }
                override fun onPartialResults(partialResults: Bundle?) {}
                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }

        recognizerIntent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, Locale.getDefault())
        }
    }

    private fun startContinuousListening() {
        if (!isListeningLoop) {
            isListeningLoop = true
            speechRecognizer?.startListening(recognizerIntent)
        }
    }

    private fun restartListeningDelay() {
        if (isListeningLoop && speechRecognizer != null) {
            android.os.Handler(mainLooper).postDelayed({
                try {
                    speechRecognizer?.startListening(recognizerIntent)
                } catch (e: Exception) {}
            }, 500)
        }
    }

    private fun handleBackgroundCommand(command: String) {
        val lower = command.lowercase()
        val accessibility = VoidAccessibilityService.instance
        if (lower.contains("tiktok")) accessibility?.launchApp("com.zhiliaoapp.musically")
        else if (lower.contains("facebook")) accessibility?.launchApp("com.facebook.katana")
        else if (lower.contains("read screen")) accessibility?.readScreenContent()
        else if (lower.contains("click")) {
            val target = lower.replace("click", "").trim()
            accessibility?.findAndClickByText(target)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isListeningLoop = false
        isServiceRunning = false
        speechRecognizer?.destroy()
        speechRecognizer = null
        wakeLock?.let { if (it.isHeld) it.release() }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`
  },
  {
    path: "android/app/src/main/java/com/voidai/app/MainActivity.kt",
    language: "kotlin",
    description: "Main Activity: Runtime permission launchers for Microphone, Camera, and Notifications + JavascriptInterface Bridge",
    content: `package com.voidai.app

import android.Manifest
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.provider.Settings
import android.util.Log
import androidx.activity.result.contract.ActivityResultContracts
import androidx.core.content.ContextCompat
import com.getcapacitor.BridgeActivity

class MainActivity : BridgeActivity() {

    companion object {
        private const val TAG = "VOID_MainActivity"
    }

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        results.forEach { (permission, isGranted) ->
            Log.i(TAG, "Permission result -> \$permission: \$isGranted")
        }
        notifyWebviewPermissionsUpdated()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        attachNativeBridge()
        // Automatically request Microphone and Camera permissions when app opens
        checkAndRequestStartupPermissions()
    }

    override fun onResume() {
        super.onResume()
        attachNativeBridge()
        notifyWebviewPermissionsUpdated()
    }

    fun checkAndRequestStartupPermissions() {
        val permissionsToRequest = mutableListOf<String>()

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.RECORD_AUDIO)
        }
        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA) != PackageManager.PERMISSION_GRANTED) {
            permissionsToRequest.add(Manifest.permission.CAMERA)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) != PackageManager.PERMISSION_GRANTED) {
                permissionsToRequest.add(Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        if (permissionsToRequest.isNotEmpty()) {
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        } else {
            notifyWebviewPermissionsUpdated()
        }
    }

    fun requestMicrophonePermission() {
        permissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
    }

    fun requestCameraPermission() {
        permissionLauncher.launch(arrayOf(Manifest.permission.CAMERA))
    }

    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(intent)
    }

    fun openOverlaySettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:\$packageName")
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
        }
    }

    fun isAccessibilityEnabled(): Boolean {
        if (VoidAccessibilityService.isServiceRunning) return true
        val expected = "\$packageName/\${VoidAccessibilityService::class.java.canonicalName}"
        val enabled = Settings.Secure.getString(contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: return false
        return enabled.contains(expected) || enabled.contains(packageName)
    }

    fun isPermissionGranted(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }

    private fun attachNativeBridge() {
        try {
            bridge?.webView?.let { webView ->
                webView.settings.javaScriptEnabled = true
                webView.settings.mediaPlaybackRequiresUserGesture = false
                webView.addJavascriptInterface(VoidNativeBridge(this), "AndroidBridge")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Bridge mount failed: \${e.message}")
        }
    }

    private fun notifyWebviewPermissionsUpdated() {
        try {
            bridge?.webView?.post {
                bridge?.webView?.evaluateJavascript(
                    "if (window.__onNativePermissionsUpdated) window.__onNativePermissionsUpdated();",
                    null
                )
            }
        } catch (e: Exception) {}
    }
}`
  },
  {
    path: "android/app/src/main/AndroidManifest.xml",
    language: "xml",
    description: "Android Manifest: Accessibility service declaration, Foreground Service with microphone type, and permissions",
    content: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">

    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.MODIFY_AUDIO_SETTINGS" />
    <uses-permission android:name="android.permission.CAMERA" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    <uses-permission android:name="android.permission.SYSTEM_ALERT_WINDOW" />
    <uses-permission android:name="android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS" />
    <uses-permission android:name="android.permission.QUERY_ALL_PACKAGES" />

    <uses-feature android:name="android.hardware.camera" android:required="false" />
    <uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
    <uses-feature android:name="android.hardware.microphone" android:required="false" />

    <application
        android:allowBackup="true"
        android:icon="@mipmap/ic_launcher"
        android:label="@string/app_name"
        android:roundIcon="@mipmap/ic_launcher_round"
        android:supportsRtl="true"
        android:theme="@style/AppTheme">

        <activity
            android:configChanges="orientation|keyboardHidden|keyboard|screenSize|locale|smallestScreenSize|screenLayout|uiMode|navigation|density"
            android:name=".MainActivity"
            android:label="@string/title_activity_main"
            android:theme="@style/AppTheme.NoActionBarLaunch"
            android:launchMode="singleTask"
            android:exported="true">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>

        <service
            android:name=".VoidAccessibilityService"
            android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE"
            android:label="@string/accessibility_service_label"
            android:exported="true">
            <intent-filter>
                <action android:name="android.accessibilityservice.AccessibilityService" />
            </intent-filter>
            <meta-data
                android:name="android.accessibilityservice"
                android:resource="@xml/accessibility_service_config" />
        </service>

        <service
            android:name=".VoidVoiceForegroundService"
            android:foregroundServiceType="microphone"
            android:exported="false" />

    </application>
</manifest>`
  },
  {
    path: "android/app/src/main/res/xml/accessibility_service_config.xml",
    language: "xml",
    description: "Android Accessibility Configuration: XML flags to show VOID.AI in phone's Settings > Accessibility menu",
    content: `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:description="@string/accessibility_service_description"
    android:accessibilityEventTypes="typeAllMask"
    android:accessibilityFlags="flagDefault|flagRetrieveInteractiveWindows|flagReportViewIds|flagIncludeNotImportantViews|flagRequestTouchExplorationMode"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:canRetrieveWindowContent="true"
    android:canPerformGestures="true"
    android:settingsActivity="com.voidai.app.MainActivity" />`
  },
  {
    path: "capacitor.config.ts",
    language: "typescript",
    description: "Capacitor Configuration: com.voidai.app, VOID.AI, and local dist bundle",
    content: `import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.voidai.app',
  appName: 'VOID.AI',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  android: {
    allowMixedContent: true,
    backgroundColor: '#000000'
  }
};

export default config;`
  },
  {
    path: ".github/workflows/build-apk.yml",
    language: "yaml",
    description: "GitHub Actions CI/CD Pipeline: Automated APK compilation and artifact delivery",
    content: `name: Build Android APK (VOID.AI)

on:
  push:
    branches: [ "main", "master" ]
  workflow_dispatch:

jobs:
  build-apk:
    name: Build Native Android APK
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4

      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm install

      - name: Build Web Application
        run: npm run build

      - name: Set up JDK 17
        uses: actions/setup-java@v4
        with:
          java-version: '17'
          distribution: 'temurin'

      - name: Sync Capacitor Android
        run: npx cap sync android

      - name: Build Debug APK
        working-directory: ./android
        run: ./gradlew assembleDebug --stacktrace

      - name: Upload Debug APK Artifact
        uses: actions/upload-artifact@v4
        with:
          name: VOID-AI-Debug-APK
          path: android/app/build/outputs/apk/debug/app-debug.apk`
  }
];
