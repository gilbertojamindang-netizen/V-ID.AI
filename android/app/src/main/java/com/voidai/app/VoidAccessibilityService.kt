package com.voidai.app

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.os.Bundle
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * VOID.AI Tactical Accessibility Service
 * Provides autonomous screen reading, cross-app UI clicking, text injection,
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
        Log.i(TAG, "VOID Accessibility Service destroyed.")
    }

    /**
     * Reads and dumps all visible text and interactive nodes from the active screen.
     */
    fun readScreenContent(): String {
        val rootNode = rootInActiveWindow ?: return "Screen content empty or unavailable."
        val builder = StringBuilder()
        builder.append("=== ACTIVE SCREEN DUMP ===\n")
        builder.append("Package: ").append(rootNode.packageName ?: "Unknown").append("\n")
        
        val interactiveNodes = mutableListOf<String>()
        traverseNodes(rootNode, interactiveNodes, 0)

        builder.append("Interactive Elements (${interactiveNodes.size}):\n")
        interactiveNodes.take(25).forEach { builder.append(it).append("\n") }
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
            list.add("$type \"$label\" (id: ${viewId ?: "none"})")
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

        // Deep search if direct match was not clickable
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
                if (success) {
                    Log.i(TAG, "Successfully clicked node: ${current.text ?: current.viewIdResourceName}")
                    return true
                }
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

        // 1. Try currently focused input
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

        // 2. Find first editable node
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

    /**
     * Assists account login by locating username/email input, password input, and clicking submit.
     */
    fun assistAccountLogin(username: String, passToken: String = ""): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        var filledUsername = false

        // Locate editable inputs
        val inputs = mutableListOf<AccessibilityNodeInfo>()
        collectEditableInputs(rootNode, inputs)

        if (inputs.isNotEmpty()) {
            val userField = inputs[0]
            val args = Bundle().apply {
                putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, username)
            }
            userField.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, args)
            filledUsername = true

            if (inputs.size > 1 && passToken.isNotEmpty()) {
                val passField = inputs[1]
                val passArgs = Bundle().apply {
                    putCharSequence(AccessibilityNodeInfo.ACTION_ARGUMENT_SET_TEXT_CHARSEQUENCE, passToken)
                }
                passField.performAction(AccessibilityNodeInfo.ACTION_SET_TEXT, passArgs)
            }
        }

        // Attempt to click Login/Sign In button
        findAndClickByText("Log In") || findAndClickByText("Sign In") || findAndClickByText("Submit")
        rootNode.recycle()
        return filledUsername
    }

    private fun collectEditableInputs(node: AccessibilityNodeInfo?, list: MutableList<AccessibilityNodeInfo>) {
        if (node == null) return
        if (node.isEditable) list.add(node)
        for (i in 0 until node.childCount) {
            val child = node.getChild(i)
            collectEditableInputs(child, list)
        }
    }

    /**
     * Launches external Android app by package name.
     */
    fun launchApp(packageName: String): Boolean {
        return try {
            val launchIntent = packageManager.getLaunchIntentForPackage(packageName)
            if (launchIntent != null) {
                launchIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
                startActivity(launchIntent)
                true
            } else {
                Log.e(TAG, "No launch intent for package: $packageName")
                false
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error launching app: $packageName", e)
            false
        }
    }

    fun performHome(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performBack(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun performRecents(): Boolean = performGlobalAction(GLOBAL_ACTION_RECENTS)
    fun scrollUp(): Boolean = rootInActiveWindow?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_BACKWARD) ?: false
    fun scrollDown(): Boolean = rootInActiveWindow?.performAction(AccessibilityNodeInfo.ACTION_SCROLL_FORWARD) ?: false
}
