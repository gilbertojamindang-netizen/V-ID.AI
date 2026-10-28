package com.voidai.app

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

/**
 * Main Activity for VOID.AI
 * Extends Capacitor BridgeActivity.
 * Automatically prompts the user for RECORD_AUDIO, CAMERA, and POST_NOTIFICATIONS
 * permissions at runtime on startup, and attaches the JavascriptInterface 'AndroidBridge'.
 */
class MainActivity : BridgeActivity() {

    companion object {
        private const val TAG = "VOID_MainActivity"
    }

    // Permission launcher that opens the native Android OS "Allow / Deny" dialog
    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { results ->
        results.forEach { (permission, isGranted) ->
            Log.i(TAG, "Permission result -> $permission: $isGranted")
        }
        notifyWebviewPermissionsUpdated()
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        Log.i(TAG, "VOID.AI Native MainActivity initialized.")

        // Mount the native bridge for the React UI
        attachNativeBridge()

        // AUTOMATIC RUNTIME PERMISSION PROMPT:
        // When the user opens the app, immediately trigger the OS prompt for mic & camera
        checkAndRequestStartupPermissions()
    }

    override fun onResume() {
        super.onResume()
        attachNativeBridge()
        notifyWebviewPermissionsUpdated()
    }

    /**
     * Checks if Microphone, Camera, or Notification permissions are missing.
     * If any are missing, launches the native Android OS permission dialog.
     */
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
            Log.i(TAG, "Launching Android OS runtime permission dialog for: $permissionsToRequest")
            permissionLauncher.launch(permissionsToRequest.toTypedArray())
        } else {
            Log.i(TAG, "All core runtime permissions are already granted.")
            notifyWebviewPermissionsUpdated()
        }
    }

    /**
     * Explicit trigger for Microphone permission
     */
    fun requestMicrophonePermission() {
        permissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
    }

    /**
     * Explicit trigger for Camera permission
     */
    fun requestCameraPermission() {
        permissionLauncher.launch(arrayOf(Manifest.permission.CAMERA))
    }

    /**
     * Explicit trigger for all core permissions
     */
    fun requestAllCorePermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.CAMERA
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        permissionLauncher.launch(permissions.toTypedArray())
    }

    /**
     * Opens Android System Settings > Accessibility
     */
    fun openAccessibilitySettings() {
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        startActivity(intent)
    }

    /**
     * Opens Android System Settings > Display over other apps
     */
    fun openOverlaySettings() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:$packageName")
            ).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            startActivity(intent)
        }
    }

    /**
     * Returns true if accessibility service is currently enabled
     */
    fun isAccessibilityEnabled(): Boolean {
        if (VoidAccessibilityService.isServiceRunning) return true
        val expectedServiceName = "$packageName/${VoidAccessibilityService::class.java.canonicalName}"
        val enabledServices = Settings.Secure.getString(
            contentResolver,
            Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
        ) ?: return false
        return enabledServices.contains(expectedServiceName) || enabledServices.contains(packageName)
    }

    /**
     * Checks if a specific permission is granted
     */
    fun isPermissionGranted(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(this, permission) == PackageManager.PERMISSION_GRANTED
    }

    /**
     * Mounts VoidNativeBridge into WebView
     */
    private fun attachNativeBridge() {
        try {
            bridge?.webView?.let { webView ->
                webView.settings.javaScriptEnabled = true
                webView.settings.mediaPlaybackRequiresUserGesture = false
                webView.addJavascriptInterface(VoidNativeBridge(this), "AndroidBridge")
                Log.i(TAG, "Mounted VoidNativeBridge into WebView as 'AndroidBridge'")
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error attaching native bridge: ${e.message}")
        }
    }

    /**
     * Notifies the React web app that native permissions changed
     */
    private fun notifyWebviewPermissionsUpdated() {
        try {
            bridge?.webView?.post {
                bridge?.webView?.evaluateJavascript(
                    "if (window.__onNativePermissionsUpdated) window.__onNativePermissionsUpdated();",
                    null
                )
            }
        } catch (e: Exception) {
            Log.w(TAG, "Webview update notify failed: ${e.message}")
        }
    }
}
