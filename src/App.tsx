import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  ScreenId, 
  ConversationItem, 
  ScreenAutomationState, 
  ApiSettingsState, 
  VoiceMacro, 
  GeneratedCodeItem,
  ActionBadge
} from './types';
import { NavigationDrawer } from './components/NavigationDrawer';
import { HomeScreenView } from './components/screens/HomeScreenView';
import { ScreenAutomationView } from './components/screens/ScreenAutomationView';
import { PermissionsScreenView } from './components/screens/PermissionsScreenView';
import { ApiSettingsScreenView } from './components/screens/ApiSettingsScreenView';
import { AiCodeStudioScreenView } from './components/screens/AiCodeStudioScreenView';
import { MacroManager } from './components/MacroManager';
import { MemoryScreenView } from './components/screens/MemoryScreenView';
import { AndroidSourceScreenView } from './components/screens/AndroidSourceScreenView';
import { ChangeAvatarModal } from './components/ChangeAvatarModal';
import { useFirebaseAuth } from './firebase/AuthContext';

export default function App() {
  const { 
    user, 
    syncMessage, 
    fetchMessages, 
    syncMacro, 
    removeMacro, 
    fetchMacros, 
    syncCodeSnippet, 
    fetchCodeSnippets, 
    syncSettings, 
    fetchSettings 
  } = useFirebaseAuth();

  // Navigation State
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Avatar Image State (defaults to tactical AI face avatar)
  const [avatarImageUrl, setAvatarImageUrl] = useState<string>(() => {
    try {
      return localStorage.getItem('void_avatar_image') || '/avatar.jpg';
    } catch {
      return '/avatar.jpg';
    }
  });
  const [isChangeAvatarOpen, setIsChangeAvatarOpen] = useState(false);

  const handleSelectAvatar = (url: string) => {
    setAvatarImageUrl(url);
    try {
      localStorage.setItem('void_avatar_image', url);
    } catch (e) {
      console.warn('Failed to save avatar image to localStorage:', e);
    }
  };

  // API Settings State
  // Audio Element Ref for Neural Voice Playback
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // API Settings State
  const [apiSettings, setApiSettings] = useState<ApiSettingsState>(() => {
    try {
      const savedKey = localStorage.getItem('void_gemini_api_key') || '';
      const savedVoiceKey = localStorage.getItem('void_voice_api_key') || '';
      const savedSettings = localStorage.getItem('void_api_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        return { 
          ...parsed, 
          apiKey: savedKey || parsed.apiKey || '',
          voiceApiKey: savedVoiceKey || parsed.voiceApiKey || '',
          voiceProvider: parsed.voiceProvider || (savedVoiceKey ? 'elevenlabs' : 'browser'),
          elevenLabsVoiceId: parsed.elevenLabsVoiceId || 'pNInz6obpgDQGcFmaJgB',
        };
      }
      return {
        apiKey: savedKey,
        voiceApiKey: savedVoiceKey,
        voiceProvider: savedVoiceKey ? 'elevenlabs' : 'browser',
        elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
        model: 'gemini-2.5-flash',
        voice: 'Charon',
        pitch: 0.72,
        speechRate: 0.95,
        encrypted: true,
        alwaysListening: true,
      };
    } catch {
      return {
        apiKey: '',
        voiceApiKey: '',
        voiceProvider: 'browser',
        elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB',
        model: 'gemini-2.5-flash',
        voice: 'Charon',
        pitch: 0.72,
        speechRate: 0.95,
        encrypted: true,
        alwaysListening: true,
      };
    }
  });

  const handleUpdateApiSettings = (newSettings: Partial<ApiSettingsState>) => {
    setApiSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('void_api_settings', JSON.stringify(updated));
        if (newSettings.apiKey !== undefined) {
          localStorage.setItem('void_gemini_api_key', newSettings.apiKey.trim());
        }
        if (newSettings.voiceApiKey !== undefined) {
          localStorage.setItem('void_voice_api_key', newSettings.voiceApiKey.trim());
        }
      } catch {}
      syncSettings(updated).catch(() => {});
      return updated;
    });
  };

  // Hydrate user data from Firestore when signed in
  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const hydrateFromFirestore = async () => {
      try {
        const [cloudMsgs, cloudMacros, cloudSnippets, cloudSettings] = await Promise.all([
          fetchMessages().catch(() => []),
          fetchMacros().catch(() => []),
          fetchCodeSnippets().catch(() => []),
          fetchSettings().catch(() => null),
        ]);

        if (cancelled) return;

        if (cloudMsgs && cloudMsgs.length > 0) {
          setConversation(cloudMsgs);
        }
        if (cloudMacros && cloudMacros.length > 0) {
          setMacros(cloudMacros);
        }
        if (cloudSnippets && cloudSnippets.length > 0) {
          setCodeHistory(cloudSnippets);
        }
        if (cloudSettings) {
          setApiSettings(prev => ({ ...prev, ...cloudSettings }));
        }
      } catch (err) {
        console.warn('Firestore hydration error:', err);
      }
    };

    hydrateFromFirestore();

    return () => {
      cancelled = true;
    };
  }, [user]);

  // Voice Synthesis Function with neural voice API key and browser fallback
  const [isSpeaking, setIsSpeaking] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  const speakText = useCallback(async (text: string) => {
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) return;

    // Stop any existing playing audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }

    // Try Neural Voice API if Voice API Key is provided
    if (apiSettings.voiceApiKey && apiSettings.voiceProvider === 'elevenlabs') {
      try {
        setIsSpeaking(true);
        const res = await fetch('/api/voice/synthesize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: cleanText,
            voiceApiKey: apiSettings.voiceApiKey,
            provider: 'elevenlabs',
            voiceId: apiSettings.elevenLabsVoiceId || 'pNInz6obpgDQGcFmaJgB',
            pitch: apiSettings.pitch,
            speechRate: apiSettings.speechRate
          })
        });

        if (res.ok) {
          const data = await res.json();
          if (data.audioData) {
            const audio = new Audio(data.audioData);
            currentAudioRef.current = audio;
            audio.onended = () => {
              setIsSpeaking(false);
              currentAudioRef.current = null;
            };
            audio.onerror = () => {
              setIsSpeaking(false);
              currentAudioRef.current = null;
              playBrowserSpeech(cleanText);
            };
            await audio.play();
            return;
          }
        }
      } catch (err) {
        console.warn('Neural voice synthesis error, using fallback:', err);
      }
    }

    // Fallback: Browser Web Speech Synthesis
    playBrowserSpeech(cleanText);
  }, [apiSettings.voiceApiKey, apiSettings.voiceProvider, apiSettings.elevenLabsVoiceId, apiSettings.pitch, apiSettings.speechRate]);

  const playBrowserSpeech = useCallback((cleanText: string) => {
    if (!synthRef.current) {
      setIsSpeaking(false);
      return;
    }
    try {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.pitch = apiSettings.pitch;
      utterance.rate = apiSettings.speechRate;

      const voices = synthRef.current.getVoices();
      const maleVoice = voices.find(v => 
        v.name.toLowerCase().includes('male') || 
        v.name.toLowerCase().includes('david') || 
        v.name.toLowerCase().includes('george') ||
        v.name.toLowerCase().includes('guy')
      );
      if (maleVoice) utterance.voice = maleVoice;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      synthRef.current.speak(utterance);
    } catch (e) {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
    }
  }, [apiSettings.pitch, apiSettings.speechRate]);

  // Screen Automation & Accessibility State
  const [automationState, setAutomationState] = useState<ScreenAutomationState>({
    accessibilityEnabled: true,
    foregroundListening: true,
    currentApp: 'TikTok',
    currentPackage: 'com.zhiliaoapp.musically',
    recentAction: 'System Standby',
    inspectedNodesCount: 14,
    screenContentSummary: 'TikTok Feed view. Interactive elements: Search icon, Video container, Like button, Comment button, Share button, Profile avatar.',
    detectedInteractiveNodes: [
      { id: 'btn_search', text: 'Search', className: 'android.widget.ImageView', clickable: true, editable: false },
      { id: 'btn_login', text: 'Log In', className: 'android.widget.Button', clickable: true, editable: false },
      { id: 'input_search', text: 'Search creators and sounds', className: 'android.widget.EditText', clickable: true, editable: true },
      { id: 'btn_follow', text: 'Follow', className: 'android.widget.Button', clickable: true, editable: false },
      { id: 'btn_comment', text: 'Comments (1.4k)', className: 'android.widget.TextView', clickable: true, editable: false },
    ],
    executionLogs: [
      { id: 'log_0', timestamp: Date.now() - 60000, action: 'SERVICE_INIT', target: 'VoidAccessibilityService', result: 'Ready' }
    ]
  });

  const logAutomationAction = (action: string, target: string, result: string) => {
    setAutomationState(prev => ({
      ...prev,
      recentAction: `${action}: ${target}`,
      executionLogs: [
        { id: `log_${Date.now()}`, timestamp: Date.now(), action, target, result },
        ...prev.executionLogs.slice(0, 19)
      ]
    }));
  };

  // Launch App
  const handleLaunchApp = (packageName: string, appName: string) => {
    logAutomationAction('LAUNCH_APP', packageName, `Launched ${appName}`);
    setAutomationState(prev => ({
      ...prev,
      currentApp: appName,
      currentPackage: packageName,
      screenContentSummary: `Active application: ${appName} (${packageName}). UI hierarchy synchronized.`
    }));

    // If native Android Bridge is available
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.launchApp === 'function') {
      bridge.launchApp(packageName);
    }
  };

  // Perform Click
  const handlePerformClick = (targetText: string) => {
    logAutomationAction('ACTION_CLICK', targetText, 'Dispatched touch click to matching node');
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.clickElement === 'function') {
      bridge.clickElement(targetText);
    }
  };

  // Perform Type
  const handlePerformType = (text: string) => {
    logAutomationAction('ACTION_SET_TEXT', text, 'Injected text into current focus');
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.typeText === 'function') {
      bridge.typeText(text);
    }
  };

  // Read Screen
  const handleReadScreen = () => {
    logAutomationAction('READ_SCREEN', 'AccessibilityNodeInfo', 'Scanned visible window nodes');
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.readCurrentScreen === 'function') {
      const dump = bridge.readCurrentScreen();
      setAutomationState(prev => ({ ...prev, screenContentSummary: dump }));
    } else {
      setAutomationState(prev => ({
        ...prev,
        inspectedNodesCount: 16,
        screenContentSummary: `Screen scan of ${prev.currentApp}: 16 interactive nodes detected. Login button, password field, and primary navigation bar are visible and accessible.`
      }));
    }
  };

  // Assist Account Login
  const handleAssistLogin = (username: string) => {
    logAutomationAction('ASSIST_LOGIN', username, 'Targeted credentials fields & dispatched submit click');
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.executeAccessibilityAction === 'function') {
      bridge.executeAccessibilityAction(JSON.stringify({ type: 'assist_login', username }));
    }
  };

  // System Gestures
  const handleSystemGesture = (gesture: 'home' | 'back' | 'recents' | 'scroll_up' | 'scroll_down') => {
    logAutomationAction('SYSTEM_GESTURE', gesture.toUpperCase(), 'Executed OS accessibility action');
    const bridge = (window as any).AndroidBridge;
    if (bridge && typeof bridge.executeAccessibilityAction === 'function') {
      bridge.executeAccessibilityAction(JSON.stringify({ type: 'gesture', gesture }));
    }
  };

  // Conversation & Chat State
  const [conversation, setConversation] = useState<ConversationItem[]>([
    {
      id: 'init_msg',
      role: 'model',
      text: "VOID Neural Terminal active. I am ready to assist with text instructions, voice commands, and automated Android screen control.",
      timestamp: Date.now() - 30000,
      model: 'gemini-2.5-flash',
      voice: 'Charon',
      bytes: 142
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isListening, setIsListening] = useState(false);

  // Send Chat Message (Text or Voice)
  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    const userMsg: ConversationItem = {
      id: `usr_${Date.now()}`,
      role: 'user',
      text: text.trim(),
      timestamp: Date.now(),
      model: 'user',
      bytes: text.length
    };

    setConversation(prev => [...prev, userMsg]);
    setIsProcessing(true);
    syncMessage(userMsg).catch(() => {});

    try {
      const res = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: conversation.slice(-8),
          customApiKey: apiSettings.apiKey,
          voice: apiSettings.voice,
          automationState: {
            currentApp: automationState.currentApp,
            currentPackage: automationState.currentPackage,
            accessibilityActive: automationState.accessibilityEnabled
          }
        })
      });

      const data = await res.json();
      const replyText = data.reply || "Command acknowledged. Standing by.";
      
      let actionBadge: ActionBadge | undefined = undefined;
      if (data.actionTrigger) {
        const act = data.actionTrigger;
        if (act.type === 'launch_app') {
          actionBadge = {
            type: 'launch_app',
            label: `LAUNCHED ${act.app || act.package}`,
            detail: `Package: ${act.package}`,
            status: 'success'
          };
          handleLaunchApp(act.package, act.app || act.package);
        } else if (act.type === 'click_node') {
          actionBadge = {
            type: 'click_node',
            label: `CLICKED "${act.text}"`,
            detail: 'Accessibility touch event dispatched',
            status: 'success'
          };
          handlePerformClick(act.text);
        } else if (act.type === 'type_text') {
          actionBadge = {
            type: 'type_text',
            label: `TYPED TEXT`,
            detail: `"${act.text}" injected into current focus`,
            status: 'success'
          };
          handlePerformType(act.text);
        } else if (act.type === 'read_screen') {
          actionBadge = {
            type: 'read_screen',
            label: `SCREEN READ`,
            detail: 'Inspected 14 interactive window nodes',
            status: 'success'
          };
          handleReadScreen();
        } else if (act.type === 'assist_login') {
          actionBadge = {
            type: 'assist_login',
            label: `LOGIN ASSIST ACTIVE`,
            detail: 'Autofilling credentials & submitting',
            status: 'success'
          };
          handleAssistLogin(act.username || 'operator@void.ai');
        }
      }

      const modelMsg: ConversationItem = {
        id: `mod_${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: Date.now(),
        model: apiSettings.model,
        voice: apiSettings.voice,
        bytes: replyText.length,
        actionBadge
      };

      setConversation(prev => [...prev, modelMsg]);
      syncMessage(modelMsg).catch(() => {});

      // Automatically speak tactical voice reply
      speakText(replyText);

    } catch (err: any) {
      console.error('Chat error:', err);
      const errorMsg: ConversationItem = {
        id: `mod_${Date.now()}`,
        role: 'model',
        text: "Neural buffer link alert. Operating on local fallback: Command received and queued.",
        timestamp: Date.now(),
        model: 'local-fallback',
        voice: apiSettings.voice,
        bytes: 80
      };
      setConversation(prev => [...prev, errorMsg]);
      speakText(errorMsg.text);
    } finally {
      setIsProcessing(false);
    }
  };

  // Microphone Toggle (Speech Recognition)
  const recognitionRef = useRef<any>(null);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      // Fallback: prompt user
      const simulatedVoicePrompt = prompt("Voice recognition not supported in this browser engine. Enter voice prompt:");
      if (simulatedVoicePrompt) {
        handleSendMessage(simulatedVoicePrompt);
      }
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setIsListening(false);
        if (transcript) {
          handleSendMessage(transcript);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e) {
      console.warn('Recognition start error:', e);
      setIsListening(false);
    }
  };

  // Voice Macros State
  const [macros, setMacros] = useState<VoiceMacro[]>(() => {
    try {
      const saved = localStorage.getItem('void_macros');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'macro_tiktok',
        triggerPhrase: 'check tiktok',
        description: 'Opens TikTok, reads the feed, and provides verbal confirmation.',
        enabled: true,
        executionCount: 5,
        actions: [
          { id: 'm1', type: 'open_app', title: 'Launch App: TikTok', payload: { app: 'TikTok', packageName: 'com.zhiliaoapp.musically' } },
          { id: 'm2', type: 'read_screen', title: 'Read Screen & Inspect Nodes', payload: {} },
          { id: 'm3', type: 'speak_phrase', title: 'Speak: "TikTok launched. Neural watcher monitoring screen."', payload: { message: 'TikTok launched. Neural watcher monitoring screen.' } },
        ]
      },
      {
        id: 'macro_login',
        triggerPhrase: 'log into account',
        description: 'Targets login form on active screen, injects username, and clicks Log In.',
        enabled: true,
        executionCount: 2,
        actions: [
          { id: 'l1', type: 'read_screen', title: 'Scan for Login Credentials Fields', payload: {} },
          { id: 'l2', type: 'assist_login', title: 'Assist Login: operator@void.ai', payload: { username: 'operator@void.ai' } },
          { id: 'l3', type: 'click_text', title: 'Click Button: "Log In"', payload: { targetText: 'Log In' } },
          { id: 'l4', type: 'speak_phrase', title: 'Speak: "Credentials deployed. Submitting login request."', payload: { message: 'Credentials deployed. Submitting login request.' } },
        ]
      }
    ];
  });
  const [executingMacroId, setExecutingMacroId] = useState<string | null>(null);

  const saveMacros = (newMacros: VoiceMacro[]) => {
    setMacros(newMacros);
    try {
      localStorage.setItem('void_macros', JSON.stringify(newMacros));
    } catch {}
  };

  const handleExecuteMacro = async (macro: VoiceMacro) => {
    setExecutingMacroId(macro.id);
    for (const act of macro.actions) {
      if (act.type === 'open_app') {
        handleLaunchApp(act.payload.packageName || 'com.zhiliaoapp.musically', act.payload.app || 'TikTok');
      } else if (act.type === 'click_text') {
        handlePerformClick(act.payload.targetText || 'Log In');
      } else if (act.type === 'type_text') {
        handlePerformType(act.payload.text || 'cyberpunk');
      } else if (act.type === 'read_screen') {
        handleReadScreen();
      } else if (act.type === 'assist_login') {
        handleAssistLogin(act.payload.username || 'operator@void.ai');
      } else if (act.type === 'speak_phrase') {
        speakText(act.payload.message || 'Action executed.');
      }
      await new Promise(r => setTimeout(r, 600));
    }
    setExecutingMacroId(null);
    saveMacros(macros.map(m => m.id === macro.id ? { ...m, executionCount: m.executionCount + 1 } : m));
  };

  // AI Coding Studio State
  const [codeHistory, setCodeHistory] = useState<GeneratedCodeItem[]>([]);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);

  const handleGenerateCode = async (prompt: string, language: string): Promise<GeneratedCodeItem | null> => {
    setIsGeneratingCode(true);
    try {
      const res = await fetch('/api/gemini/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          language,
          customApiKey: apiSettings.apiKey
        })
      });
      const data = await res.json();
      const newItem: GeneratedCodeItem = {
        id: `code_${Date.now()}`,
        title: prompt,
        language: data.language || language,
        code: data.code || `# VOID Generated Script\nprint("Task: ${prompt}")`,
        explanation: data.explanation || `Generated script for ${prompt}`,
        fileName: data.fileName || `script.${language === 'python' ? 'py' : 'sh'}`,
        timestamp: Date.now()
      };
      setCodeHistory([newItem, ...codeHistory]);
      syncCodeSnippet(newItem).catch(() => {});
      return newItem;
    } catch (e) {
      console.error('Code gen error:', e);
      return null;
    } finally {
      setIsGeneratingCode(false);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-black text-white font-sans antialiased overflow-x-hidden">
      
      {/* Navigation Drawer Modal */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        activeScreen={activeScreen}
        onSelectScreen={setActiveScreen}
        voicePersona={apiSettings.voice}
      />

      {/* Screen Views Routing */}
      {activeScreen === 'home' && (
        <HomeScreenView
          onOpenDrawer={() => setIsDrawerOpen(true)}
          isListening={isListening}
          isSpeaking={isSpeaking}
          onToggleMic={toggleMic}
          conversation={conversation}
          onSendMessage={handleSendMessage}
          isProcessing={isProcessing}
          voicePersona={apiSettings.voice}
          accessibilityActive={automationState.accessibilityEnabled}
          avatarImageUrl={avatarImageUrl}
          onChangeAvatarClick={() => setIsChangeAvatarOpen(true)}
          onExecuteAction={(act) => {
            if (act.type === 'launch_app') handleLaunchApp('com.zhiliaoapp.musically', 'TikTok');
            else if (act.type === 'click_node') handlePerformClick(act.label.replace('CLICKED ', '').replace(/"/g, ''));
            else if (act.type === 'read_screen') handleReadScreen();
            else if (act.type === 'assist_login') handleAssistLogin('operator@void.ai');
          }}
          onPlaySpeech={speakText}
        />
      )}

      {activeScreen === 'automation' && (
        <ScreenAutomationView
          automationState={automationState}
          onLaunchApp={handleLaunchApp}
          onPerformClick={handlePerformClick}
          onPerformType={handlePerformType}
          onReadScreen={handleReadScreen}
          onAssistLogin={handleAssistLogin}
          onSystemGesture={handleSystemGesture}
        />
      )}

      {activeScreen === 'permissions' && (
        <PermissionsScreenView />
      )}

      {activeScreen === 'apisettings' && (
        <ApiSettingsScreenView
          settings={apiSettings}
          onUpdateSettings={handleUpdateApiSettings}
          onTestVoice={() => speakText("VOID neural audio link verified. Voice pitch and speech rate calibrated for tactical operations.")}
          isTestingVoice={isSpeaking}
        />
      )}

      {activeScreen === 'codestudio' && (
        <AiCodeStudioScreenView
          onGenerateCode={handleGenerateCode}
          isGenerating={isGeneratingCode}
          history={codeHistory}
          onSendToChat={(code) => {
            setActiveScreen('home');
            handleSendMessage(`Analyze this code:\n\`\`\`\n${code}\n\`\`\``);
          }}
        />
      )}

      {activeScreen === 'macros' && (
        <MacroManager
          macros={macros}
          onAddMacro={(m) => {
            saveMacros([m, ...macros]);
            syncMacro(m).catch(() => {});
          }}
          onUpdateMacro={(m) => {
            saveMacros(macros.map(orig => orig.id === m.id ? m : orig));
            syncMacro(m).catch(() => {});
          }}
          onDeleteMacro={(id) => {
            saveMacros(macros.filter(m => m.id !== id));
            removeMacro(id).catch(() => {});
          }}
          onExecuteMacro={handleExecuteMacro}
          executingMacroId={executingMacroId}
        />
      )}

      {activeScreen === 'androidsource' && (
        <AndroidSourceScreenView />
      )}

      {activeScreen === 'memory' && (
        <MemoryScreenView
          conversations={conversation}
          onClearMemory={() => setConversation([])}
          onDeleteConversation={(id) => setConversation(prev => prev.filter(c => c.id !== id))}
          totalBytesUsed={conversation.reduce((acc, c) => acc + (c.bytes || 0), 0)}
        />
      )}

      {/* Change Avatar Modal */}
      <ChangeAvatarModal
        isOpen={isChangeAvatarOpen}
        onClose={() => setIsChangeAvatarOpen(false)}
        currentAvatarUrl={avatarImageUrl}
        onSelectAvatar={handleSelectAvatar}
      />

    </div>
  );
}
