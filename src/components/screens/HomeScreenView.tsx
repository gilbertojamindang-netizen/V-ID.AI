import React, { useState, useRef, useEffect } from 'react';
import { 
  Menu, 
  Mic, 
  MicOff, 
  Send, 
  Volume2, 
  Sparkles, 
  Smartphone, 
  Layers, 
  MousePointerClick, 
  KeyRound, 
  Terminal, 
  Copy, 
  Check, 
  ChevronRight, 
  Play,
  RotateCcw
} from 'lucide-react';
import { CyberpunkAvatar } from '../CyberpunkAvatar';
import { AudioWaveform } from '../AudioWaveform';
import { TacticalSystemMonitor } from '../TacticalSystemMonitor';
import { PWAInstallButton } from '../PWAInstallButton';
import { ConversationItem, ActionBadge } from '../../types';
import { useFirebaseAuth } from '../../firebase/AuthContext';

interface HomeScreenViewProps {
  onOpenDrawer: () => void;
  isListening: boolean;
  isSpeaking: boolean;
  onToggleMic: () => void;
  conversation: ConversationItem[];
  onSendMessage: (text: string) => Promise<void>;
  isProcessing: boolean;
  voicePersona: 'Charon' | 'Fenrir';
  accessibilityActive: boolean;
  avatarImageUrl?: string;
  onChangeAvatarClick?: () => void;
  onExecuteAction?: (action: ActionBadge) => void;
  onPlaySpeech?: (text: string) => void;
}

export const HomeScreenView: React.FC<HomeScreenViewProps> = ({
  onOpenDrawer,
  isListening,
  isSpeaking,
  onToggleMic,
  conversation,
  onSendMessage,
  isProcessing,
  voicePersona,
  accessibilityActive,
  avatarImageUrl,
  onChangeAvatarClick,
  onExecuteAction,
  onPlaySpeech,
}) => {
  const { user, signInWithGoogle } = useFirebaseAuth();
  const [inputText, setInputText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, isProcessing]);

  // Form submit: sends text and clears input immediately so text disappears
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (!trimmed || isProcessing) return;

    // Immediately clear input so text disappears from box
    setInputText('');

    // Send to message handler
    await onSendMessage(trimmed);

    // Keep focus on input for fast rapid-fire messaging
    inputRef.current?.focus();
  };

  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickActionPrompts = [
    { label: 'Open TikTok', cmd: 'Open TikTok and search cyberpunk' },
    { label: 'Open Facebook', cmd: 'Open Facebook and check notifications' },
    { label: 'Read Screen', cmd: 'Read everything on my screen right now' },
    { label: 'Click "Log In"', cmd: 'Find and click the Log In button' },
    { label: 'Log into Account', cmd: 'Help me log into my account on screen' },
    { label: 'Type Message', cmd: 'Type "Hey, are you free tonight?" in the chat' },
  ];

  return (
    <div className="relative w-full h-full min-h-screen bg-[#050508] text-white flex flex-col justify-between overflow-x-hidden select-none">
      
      {/* Subtle Tactical Ambient Grid Lines */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-[0.035]" 
        style={{
          backgroundImage: 'linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)',
          backgroundSize: '40px 40px'
        }}
      />

      {/* TOP BAR & STATUS ZONE */}
      <header className="relative z-20 flex items-center justify-between px-4 sm:px-6 pt-5 pb-3 border-b border-white/10 bg-black/80 backdrop-blur-md">
        {/* Left: Navigation Drawer Trigger */}
        <button
          onClick={onOpenDrawer}
          className="p-2.5 rounded-xl bg-zinc-950 border border-white/10 text-white hover:border-cyan-400/50 hover:bg-zinc-900 transition-all shadow-[0_0_10px_rgba(0,0,0,0.5)] active:scale-95 cursor-pointer shrink-0"
          aria-label="Open Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Center: TOP TEXT specification with VØID.AI App Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-xl overflow-hidden border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] shrink-0 group">
            <img 
              src="/logo.jpg" 
              alt="VØID.AI App Logo" 
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/src/assets/images/void_app_logo_1793162755394.jpg';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-col items-start sm:items-center">
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-[0.2em] text-white font-display glow-white">
              VØID.AI
            </h1>
            <div className="flex items-center gap-2 mt-0.5 text-[9px] sm:text-[10px] font-mono tracking-widest text-zinc-400">
              <span className="hidden sm:inline">NEURAL CHAT & AUTOMATION</span>
              <span className="hidden sm:inline text-zinc-600 font-bold">•</span>
              <span className="flex items-center gap-1 text-cyan-400 font-bold glow-cyan">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Right: Google Auth Status & Voice Persona pill */}
        <div className="flex items-center gap-2 shrink-0">
          {user ? (
            <div 
              onClick={onOpenDrawer}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-[10px] font-mono text-emerald-300 cursor-pointer hover:border-emerald-400 transition-all shadow-[0_0_10px_rgba(16,185,129,0.2)]"
              title={`Logged in as ${user.displayName || user.email}`}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User" className="w-4 h-4 rounded-full object-cover border border-emerald-400" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
              <span className="hidden sm:inline font-bold truncate max-w-[90px]">{user.displayName?.split(' ')[0] || 'SYNCED'}</span>
            </div>
          ) : (
            <button
              type="button"
              onClick={signInWithGoogle}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-950 hover:bg-cyan-950/40 border border-white/20 hover:border-cyan-400 text-[10px] font-mono text-cyan-300 transition-all cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)] active:scale-95"
              title="Sign in with Google to sync Firestore"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
              </svg>
              <span>SIGN IN</span>
            </button>
          )}

          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-white/10 text-[10px] font-mono text-zinc-400">
            <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-white font-semibold">{voicePersona}</span>
          </div>
        </div>
      </header>

      {/* UPPER HERO / AVATAR DOCK */}
      <section className="relative z-10 flex flex-col items-center justify-center pt-3 pb-2 px-4 border-b border-white/5 bg-gradient-to-b from-black/60 to-transparent">
        {/* Interactive Tactical Avatar with Concentric Glowing Rings */}
        <div className="scale-85 sm:scale-95 transition-transform">
          <CyberpunkAvatar
            isListening={isListening}
            isSpeaking={isSpeaking}
            size={180}
            imageUrl={avatarImageUrl || '/avatar.jpg'}
            onChangeClick={onChangeAvatarClick}
          />
        </div>

        {/* Audio Waveform */}
        <div className="w-full max-w-sm mt-1 mb-2">
          <AudioWaveform isListening={isListening} isSpeaking={isSpeaking} />
        </div>

        {/* Tactical System Telemetry Bar */}
        <div className="w-full max-w-md">
          <TacticalSystemMonitor compact={true} />
        </div>
      </section>

      {/* CENTER ZONE: CHAT CONVERSATION STREAM */}
      <main className="relative z-10 flex-1 overflow-y-auto px-4 sm:px-6 py-4 max-w-3xl mx-auto w-full flex flex-col gap-4">
        {conversation.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8 px-4 text-zinc-500">
            <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-white/10 flex items-center justify-center text-cyan-400 mb-3 shadow-[0_0_20px_rgba(0,240,255,0.15)]">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-mono font-bold tracking-wider text-zinc-300 uppercase">
              VOID Neural Terminal Initialized
            </h3>
            <p className="text-xs font-mono text-zinc-400 mt-1 max-w-md">
              Text or speak commands to control Android apps, read your screen, click buttons, or generate automation scripts.
            </p>
          </div>
        ) : (
          conversation.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} transition-all`}
              >
                {/* Header label */}
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className={`text-[10px] font-mono font-bold tracking-wider uppercase ${isUser ? 'text-zinc-400' : 'text-cyan-400'}`}>
                    {isUser ? 'OPERATOR' : 'VOID // TACTICAL AGENT'}
                  </span>
                  <span className="text-[9px] font-mono text-zinc-600">
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>

                {/* Message Bubble */}
                <div
                  className={`relative max-w-[90%] sm:max-w-[80%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-sm font-sans leading-relaxed shadow-lg ${
                    isUser
                      ? 'bg-zinc-900 border border-white/20 text-white rounded-tr-none'
                      : 'bg-zinc-950 border border-cyan-400/30 text-zinc-100 rounded-tl-none shadow-[0_0_20px_rgba(0,240,255,0.08)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>

                  {/* Executed Action Badge */}
                  {msg.actionBadge && (
                    <div className="mt-3 p-2.5 rounded-xl bg-black/60 border border-cyan-400/40 flex items-center justify-between gap-3 font-mono">
                      <div className="flex items-center gap-2">
                        {msg.actionBadge.type === 'launch_app' && <Smartphone className="w-4 h-4 text-cyan-400" />}
                        {msg.actionBadge.type === 'click_node' && <MousePointerClick className="w-4 h-4 text-emerald-400" />}
                        {msg.actionBadge.type === 'type_text' && <Terminal className="w-4 h-4 text-amber-400" />}
                        {msg.actionBadge.type === 'read_screen' && <Layers className="w-4 h-4 text-cyan-300" />}
                        {msg.actionBadge.type === 'assist_login' && <KeyRound className="w-4 h-4 text-purple-400" />}
                        <div className="text-[11px]">
                          <span className="font-bold text-white uppercase">{msg.actionBadge.label}</span>
                          {msg.actionBadge.detail && (
                            <span className="text-zinc-400 block text-[10px]">{msg.actionBadge.detail}</span>
                          )}
                        </div>
                      </div>

                      {onExecuteAction && (
                        <button
                          onClick={() => onExecuteAction(msg.actionBadge!)}
                          className="px-2 py-1 rounded bg-cyan-950 border border-cyan-500/50 hover:bg-cyan-900 text-[10px] font-mono text-cyan-300 hover:text-white flex items-center gap-1 active:scale-95 transition-all"
                        >
                          <Play className="w-2.5 h-2.5" />
                          <span>DISPATCH</span>
                        </button>
                      )}
                    </div>
                  )}

                  {/* Actions footer for AI response */}
                  {!isUser && (
                    <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                      <div className="flex items-center gap-1.5">
                        <span className="text-cyan-400 font-semibold">{msg.model}</span>
                        {msg.voice && (
                          <>
                            <span className="text-zinc-600">•</span>
                            <span>{msg.voice}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {onPlaySpeech && (
                          <button
                            onClick={() => onPlaySpeech(msg.text)}
                            className="p-1 hover:text-cyan-300 transition-colors"
                            title="Speak Response"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                        <button
                          onClick={() => handleCopyText(msg.id, msg.text)}
                          className="p-1 hover:text-cyan-300 transition-colors"
                          title="Copy text"
                        >
                          {copiedId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}

        {isProcessing && (
          <div className="flex items-center gap-2 p-3 rounded-2xl bg-zinc-950 border border-cyan-400/30 text-xs font-mono text-cyan-300 w-fit animate-pulse">
            <Sparkles className="w-3.5 h-3.5 animate-spin" />
            <span>VOID is synthesizing response and checking screen actions...</span>
          </div>
        )}

        <div ref={chatBottomRef} />
      </main>

      {/* BOTTOM SECTION: QUICK ACTIONS + CHAT INPUT DOCK */}
      <footer className="relative z-20 px-4 sm:px-6 pb-5 pt-2 bg-black/90 backdrop-blur-md border-t border-white/10 max-w-3xl mx-auto w-full">
        
        {/* Quick Action Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-1 scrollbar-none">
          {quickActionPrompts.map((q, idx) => (
            <button
              key={idx}
              onClick={() => onSendMessage(q.cmd)}
              disabled={isProcessing}
              className="px-2.5 py-1 rounded-full bg-zinc-950 border border-white/15 hover:border-cyan-400/60 hover:bg-zinc-900 text-[11px] font-mono text-zinc-300 hover:text-cyan-300 whitespace-nowrap transition-all active:scale-95 disabled:opacity-40 shrink-0"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Text Input & Mic Form */}
        <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
          {/* Always-on / Tap Mic Button */}
          <button
            type="button"
            onClick={onToggleMic}
            className={`p-3 rounded-2xl border transition-all active:scale-95 shrink-0 flex items-center justify-center ${
              isListening
                ? 'bg-red-500 text-white border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.5)] animate-pulse'
                : 'bg-zinc-950 border-white/20 text-cyan-400 hover:border-cyan-400 hover:bg-zinc-900 shadow-[0_0_12px_rgba(0,0,0,0.5)]'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Voice Input'}
            aria-label="Microphone Voice Input"
          >
            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>

          {/* Chat Text Input - Disappears on Send */}
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Text VOID (e.g., 'Open TikTok', 'Read screen', 'Click Login')..."
              disabled={isProcessing}
              className="w-full bg-zinc-950 border border-white/20 rounded-2xl pl-4 pr-12 py-3 text-xs sm:text-sm text-white font-mono placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none focus:ring-1 focus:ring-cyan-400/50 transition-all"
            />
          </div>

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() || isProcessing}
            className="p-3 rounded-2xl bg-cyan-500 hover:bg-cyan-400 text-black border border-cyan-400 font-bold transition-all active:scale-95 disabled:opacity-30 disabled:pointer-events-none shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 flex items-center justify-center"
            title="Transmit Instruction"
            aria-label="Send Message"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>

        <div className="flex items-center justify-between mt-2 text-[9px] font-mono text-zinc-500">
          <span>* Press Enter to send. Text clears automatically.</span>
          <span className="text-cyan-400">Continuous Neural Listener Ready</span>
        </div>
      </footer>

    </div>
  );
};
