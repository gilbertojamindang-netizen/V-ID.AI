export type ScreenId = 
  | 'home' 
  | 'automation' 
  | 'permissions' 
  | 'apisettings' 
  | 'codestudio'
  | 'macros'
  | 'memory'
  | 'androidsource';

export interface GeneratedCodeItem {
  id: string;
  title: string;
  language: string;
  code: string;
  explanation: string;
  fileName: string;
  timestamp: number;
}

export interface ActionBadge {
  type: 'launch_app' | 'click_node' | 'type_text' | 'read_screen' | 'assist_login' | 'system_gesture';
  label: string;
  detail?: string;
  status: 'pending' | 'success' | 'failed';
}

export interface ConversationItem {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  model: string;
  voice?: string;
  bytes: number;
  actionTaken?: string;
  actionBadge?: ActionBadge;
}

export interface ScreenAutomationState {
  accessibilityEnabled: boolean;
  foregroundListening: boolean;
  currentApp: string; // 'TikTok' | 'Facebook' | 'YouTube' | 'Chrome' | 'Messages' | 'Settings' | 'Home Launcher'
  currentPackage: string;
  recentAction: string;
  inspectedNodesCount: number;
  screenContentSummary: string;
  detectedInteractiveNodes: Array<{
    id: string;
    text: string;
    className: string;
    clickable: boolean;
    editable: boolean;
  }>;
  executionLogs: Array<{
    id: string;
    timestamp: number;
    action: string;
    target: string;
    result: string;
  }>;
}

export type VoiceProvider = 'elevenlabs' | 'gemini_voice' | 'google_tts' | 'browser';

export interface ApiSettingsState {
  apiKey: string;
  voiceApiKey: string;
  voiceProvider: VoiceProvider;
  elevenLabsVoiceId?: string;
  model: 'gemini-3.8-flash' | 'gemini-3.1-pro' | 'gemini-2.5-flash';
  voice: 'Charon' | 'Fenrir';
  pitch: number;
  speechRate: number;
  encrypted: boolean;
  alwaysListening: boolean;
}

export type MacroActionType = 
  | 'open_app'
  | 'click_text'
  | 'type_text'
  | 'read_screen'
  | 'assist_login'
  | 'set_voice_tone'
  | 'take_screenshot'
  | 'speak_phrase';

export interface MacroAction {
  id: string;
  type: MacroActionType;
  title: string;
  payload: {
    app?: string;
    packageName?: string;
    targetText?: string;
    text?: string;
    username?: string;
    pitch?: number;
    speechRate?: number;
    voice?: 'Charon' | 'Fenrir';
    message?: string;
  };
}

export interface VoiceMacro {
  id: string;
  triggerPhrase: string; // e.g., "open tiktok", "log in", "read screen"
  description: string;
  enabled: boolean;
  actions: MacroAction[];
  executionCount: number;
  lastTriggered?: number;
}
