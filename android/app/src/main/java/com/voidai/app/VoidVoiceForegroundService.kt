package com.voidai.app

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
 * Keeps the microphone and neural listener active with a persistent notification
 * so the AI continues listening even when switching to TikTok, Facebook, or when locked.
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
        Log.i(TAG, "Creating VoidVoiceForegroundService...")

        // 1. Acquire Partial WakeLock to prevent CPU sleep
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "VOID:AlwaysOnMicWakeLock").apply {
            setReferenceCounted(false)
            acquire(24 * 60 * 60 * 1000L) // 24 hours
        }

        // 2. Start Foreground with Persistent Notification
        createNotificationChannel()
        val notification = buildPersistentNotification()
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            startForeground(NOTIFICATION_ID, notification, ServiceInfo.FOREGROUND_SERVICE_TYPE_MICROPHONE)
        } else {
            startForeground(NOTIFICATION_ID, notification)
        }

        isServiceRunning = true

        // 3. Initialize Speech Recognizer loop
        initializeSpeechRecognizer()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        Log.i(TAG, "VoidVoiceForegroundService started.")
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
                description = "Persistent listener for VOID.AI always-on voice recognition across apps"
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
            .setContentText("Always-on mic active. Listening across TikTok, Facebook, and games...")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()
    }

    private fun initializeSpeechRecognizer() {
        try {
            if (!SpeechRecognizer.isRecognitionAvailable(this)) {
                Log.w(TAG, "SpeechRecognizer is not available on this device.")
                return
            }

            speechRecognizer = SpeechRecognizer.createSpeechRecognizer(this).apply {
                setRecognitionListener(object : RecognitionListener {
                    override fun onReadyForSpeech(params: Bundle?) {
                        Log.d(TAG, "Acoustic listener ready.")
                    }

                    override fun onBeginningOfSpeech() {
                        Log.d(TAG, "User speech detected.")
                    }

                    override fun onRmsChanged(rmsdB: Float) {}
                    override fun onBufferReceived(buffer: ByteArray?) {}

                    override fun onEndOfSpeech() {
                        Log.d(TAG, "Speech segment ended.")
                    }

                    override fun onError(error: Int) {
                        Log.w(TAG, "Speech recognition error code: $error. Re-arming listener loop...")
                        restartListeningDelay()
                    }

                    override fun onResults(results: Bundle?) {
                        val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                        if (!matches.isNullOrEmpty()) {
                            val command = matches[0]
                            Log.i(TAG, "Recognized command while running in background: $command")
                            handleBackgroundCommand(command)
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
                putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, false)
                putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 1)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error initializing speech recognizer", e)
        }
    }

    private fun startContinuousListening() {
        if (!isListeningLoop) {
            isListeningLoop = true
            try {
                speechRecognizer?.startListening(recognizerIntent)
            } catch (e: Exception) {
                Log.e(TAG, "Error starting speech listener", e)
            }
        }
    }

    private fun restartListeningDelay() {
        if (isListeningLoop && speechRecognizer != null) {
            android.os.Handler(mainLooper).postDelayed({
                try {
                    speechRecognizer?.startListening(recognizerIntent)
                } catch (e: Exception) {
                    Log.e(TAG, "Error restarting listener", e)
                }
            }, 500)
        }
    }

    private fun handleBackgroundCommand(command: String) {
        val lower = command.lowercase()
        val accessibility = VoidAccessibilityService.instance

        if (lower.contains("tiktok")) {
            accessibility?.launchApp("com.zhiliaoapp.musically")
        } else if (lower.contains("facebook")) {
            accessibility?.launchApp("com.facebook.katana")
        } else if (lower.contains("read screen")) {
            accessibility?.readScreenContent()
        } else if (lower.contains("click")) {
            val target = lower.replace("click", "").replace("button", "").trim()
            accessibility?.findAndClickByText(target)
        } else if (lower.contains("type")) {
            val textToType = lower.replace("type", "").trim()
            accessibility?.typeTextIntoCurrentFocus(textToType)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        isListeningLoop = false
        isServiceRunning = false

        speechRecognizer?.destroy()
        speechRecognizer = null

        wakeLock?.let {
            if (it.isHeld) it.release()
        }

        Log.i(TAG, "VoidVoiceForegroundService terminated.")
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
