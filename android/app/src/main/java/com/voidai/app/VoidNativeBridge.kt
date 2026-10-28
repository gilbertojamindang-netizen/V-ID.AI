package com.voidai.app

import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import android.webkit.JavascriptInterface
import androidx.core.content.ContextCompat

/**
 * JavascriptInterface exposed to WebView as 'window.AndroidBridge'
 * Allows the React web interface to interact directly with native Android services,
 * request permissions, and dispatch autonomous accessibility actions.
 */
class VoidNativeBridge(private val activity: MainActivity) {

    companion object {
        private const val TAG = "VoidNativeBridge"
    }

    @JavascriptInterface
    fun requestMicrophonePermission() {
        Log.i(TAG, "Requesting RECORD_AUDIO permission via native bridge")
        activity.requestMicrophonePermission()
    }

    @JavascriptInterface
    fun requestCameraPermission() {
        Log.i(TAG, "Requesting CAMERA permission via native bridge")
        activity.requestCameraPermission()
    }

    @JavascriptInterface
    fun requestPermission(permission: String) {
        Log.i(TAG, "Requesting custom permission: $permission")
        activity.requestSinglePermission(permission)
    }

    @JavascriptInterface
    fun openAccessibilitySettings() {
        Log.i(TAG, "Opening Android Accessibility Settings")
        val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        }
        activity.startActivity(intent)
    }

    @JavascriptInterface
    fun openOverlaySettings() {
        Log.i(TAG, "Opening Display Over Other Apps Settings")
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:${activity.packageName}")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            activity.startActivity(intent)
        }
    }

    @JavascriptInterface
    fun startAlwaysListeningService() {
        Log.i(TAG, "Starting VoidVoiceForegroundService")
        val intent = Intent(activity, VoidVoiceForegroundService::class.java)
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            activity.startForegroundService(intent)
        } else {
            activity.startService(intent)
        }
    }

    @JavascriptInterface
    fun stopAlwaysListeningService() {
        Log.i(TAG, "Stopping VoidVoiceForegroundService")
        val intent = Intent(activity, VoidVoiceForegroundService::class.java)
        activity.stopService(intent)
    }

    @JavascriptInterface
    fun isAccessibilityEnabled(): Boolean {
        return VoidAccessibilityService.isServiceRunning
    }

    @JavascriptInterface
    fun checkPermissionStatus(permission: String): Boolean {
        return ContextCompat.checkSelfPermission(
            activity,
            permission
        ) == PackageManager.PERMISSION_GRANTED
    }

    @JavascriptInterface
    fun readCurrentScreen(): String {
        val service = VoidAccessibilityService.instance
        return service?.readScreenContent() ?: "Accessibility service not enabled in Android Settings."
    }

    @JavascriptInterface
    fun clickElement(targetText: String): Boolean {
        val service = VoidAccessibilityService.instance
        return service?.findAndClickByText(targetText) ?: false
    }

    @JavascriptInterface
    fun typeText(textToType: String): Boolean {
        val service = VoidAccessibilityService.instance
        return service?.typeTextIntoCurrentFocus(textToType) ?: false
    }

    @JavascriptInterface
    fun launchApp(packageName: String): Boolean {
        val service = VoidAccessibilityService.instance
        return service?.launchApp(packageName) ?: try {
            val intent = activity.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                activity.startActivity(intent)
                true
            } else false
        } catch (e: Exception) {
            false
        }
    }

    @JavascriptInterface
    fun executeAccessibilityAction(actionJson: String): String {
        val service = VoidAccessibilityService.instance
            ?: return "{\"status\":\"error\",\"message\":\"Accessibility service not active\"}"

        return try {
            if (actionJson.contains("gesture")) {
                if (actionJson.contains("home")) service.performHome()
                else if (actionJson.contains("back")) service.performBack()
                else if (actionJson.contains("recents")) service.performRecents()
                else if (actionJson.contains("scroll_up")) service.scrollUp()
                else if (actionJson.contains("scroll_down")) service.scrollDown()
            }
            "{\"status\":\"ok\"}"
        } catch (e: Exception) {
            "{\"status\":\"error\",\"message\":\"${e.message}\"}"
        }
    }
}
