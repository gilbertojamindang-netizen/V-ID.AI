package com.voidai.app

import android.Manifest
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.webkit.WebView
import androidx.activity.result.contract.ActivityResultContracts
import com.getcapacitor.BridgeActivity

/**
 * Main Activity for VOID.AI
 * Extends Capacitor BridgeActivity and mounts the native JavaScript bridge
 * for runtime permissions, foreground listener, and accessibility control.
 */
class MainActivity : BridgeActivity() {

    companion object {
        private const val TAG = "VOID_MainActivity"
    }

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
        Log.i(TAG, "VOID.AI Main Activity starting...")

        // Attach native bridge to WebView
        bridge?.webView?.let { webView ->
            webView.settings.javaScriptEnabled = true
            webView.addJavascriptInterface(VoidNativeBridge(this), "AndroidBridge")
            Log.i(TAG, "Mounted VoidNativeBridge into WebView as 'AndroidBridge'")
        }
    }

    fun requestMicrophonePermission() {
        permissionLauncher.launch(arrayOf(Manifest.permission.RECORD_AUDIO))
    }

    fun requestCameraPermission() {
        permissionLauncher.launch(arrayOf(Manifest.permission.CAMERA))
    }

    fun requestSinglePermission(permission: String) {
        permissionLauncher.launch(arrayOf(permission))
    }

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

    private fun notifyWebviewPermissionsUpdated() {
        bridge?.webView?.evaluateJavascript(
            "if (window.__onNativePermissionsUpdated) window.__onNativePermissionsUpdated();",
            null
        )
    }
}
