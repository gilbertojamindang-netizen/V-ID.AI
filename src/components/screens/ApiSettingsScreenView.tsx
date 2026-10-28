import React, { useState } from 'react';
import { 
  KeyRound, 
  ShieldCheck, 
  Volume2, 
  Sparkles, 
  CheckCircle2, 
  Lock, 
  Cpu, 
  Play, 
  RefreshCw, 
  AlertCircle, 
  Check, 
  Radio, 
  Mic2,
  Waves
} from 'lucide-react';
import { ApiSettingsState, VoiceProvider } from '../../types';

interface ApiSettingsScreenViewProps {
  settings: ApiSettingsState;
  onUpdateSettings: (newSettings: Partial<ApiSettingsState>) => void;
  onTestVoice: () => void;
  isTestingVoice: boolean;
}

export const ApiSettingsScreenView: React.FC<ApiSettingsScreenViewProps> = ({
  settings,
  onUpdateSettings,
  onTestVoice,
  isTestingVoice,
}) => {
  // Gemini Key State
  const [showKey, setShowKey] = useState(false);
  const [savedNotification, setSavedNotification] = useState(false);
  const [isTestingKey, setIsTestingKey] = useState(false);
  const [keyTestResult, setKeyTestResult] = useState<{ success: boolean; message: string; latency?: number } | null>(null);

  // Voice API Key State
  const [showVoiceKey, setShowVoiceKey] = useState(false);
  const [savedVoiceNotification, setSavedVoiceNotification] = useState(false);
  const [isTestingVoiceKey, setIsTestingVoiceKey] = useState(false);
  const [voiceKeyTestResult, setVoiceKeyTestResult] = useState<{ 
    success: boolean; 
    message: string; 
    latency?: number;
    provider?: string;
    tier?: string;
    remainingChars?: number;
  } | null>(null);

  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('void_gemini_api_key', settings.apiKey.trim());
    } catch {}
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const handleSaveVoiceKey = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      localStorage.setItem('void_voice_api_key', settings.voiceApiKey.trim());
    } catch {}
    setSavedVoiceNotification(true);
    setTimeout(() => setSavedVoiceNotification(false), 2500);
  };

  const handleTestKeyConnection = async () => {
    if (!settings.apiKey.trim()) {
      setKeyTestResult({ success: false, message: 'Please paste a Gemini API Key first.' });
      return;
    }

    setIsTestingKey(true);
    setKeyTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/gemini/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customApiKey: settings.apiKey.trim() })
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - start);

      if (res.ok && data.valid) {
        setKeyTestResult({
          success: true,
          message: `Gemini API Key Verified (${data.model || 'gemini-2.5-flash'})`,
          latency
        });
      } else {
        setKeyTestResult({
          success: false,
          message: data.error || 'Invalid API key or network error.'
        });
      }
    } catch (err: any) {
      setKeyTestResult({
        success: false,
        message: err.message || 'Failed to connect to verification server'
      });
    } finally {
      setIsTestingKey(false);
    }
  };

  const handleTestVoiceKeyConnection = async () => {
    if (settings.voiceProvider !== 'browser' && !settings.voiceApiKey.trim()) {
      setVoiceKeyTestResult({ success: false, message: 'Please paste a Voice API Key first.' });
      return;
    }

    setIsTestingVoiceKey(true);
    setVoiceKeyTestResult(null);
    const start = performance.now();

    try {
      const res = await fetch('/api/voice/test-key', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          voiceApiKey: settings.voiceApiKey.trim(),
          provider: settings.voiceProvider,
          voiceId: settings.elevenLabsVoiceId
        })
      });
      const data = await res.json();
      const latency = Math.round(performance.now() - start);

      if (res.ok && data.valid) {
        setVoiceKeyTestResult({
          success: true,
          message: `Voice API Verified: ${data.provider}${data.tier ? ` • Tier: ${data.tier}` : ''}`,
          latency,
          provider: data.provider,
          tier: data.tier,
          remainingChars: data.remainingChars
        });
      } else {
        setVoiceKeyTestResult({
          success: false,
          message: data.error || 'Voice API key validation failed.'
        });
      }
    } catch (err: any) {
      setVoiceKeyTestResult({
        success: false,
        message: err.message || 'Failed to ping voice verification server'
      });
    } finally {
      setIsTestingVoiceKey(false);
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#050508] text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <KeyRound className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-display">API KEYS & VOICE SYNTHESIZER</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700 flex items-center gap-1">
                <Lock className="w-3 h-3" /> Encrypted KeyStore
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Configure Google Gemini Reasoning Key & Neural Voice API Keys
            </p>
          </div>
        </div>

        {(savedNotification || savedVoiceNotification) && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-600 text-emerald-300 text-xs font-mono animate-fadeIn">
            <CheckCircle2 className="w-4 h-4" />
            <span>Key Credentials Persisted to Storage</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* CARD 1: GEMINI API KEY INPUT & TEST */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono tracking-wider">1. Google Gemini API Key</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300">
              Tactical Brain & Automation
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Used directly for real-time speech dialogue, tactical code generation, and Android Accessibility screen analysis.
          </p>

          <form onSubmit={handleSaveKey} className="space-y-3">
            <div>
              <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                Gemini API Key (AIzaSy...)
              </label>
              <div className="relative">
                <input
                  type={showKey ? 'text' : 'password'}
                  value={settings.apiKey}
                  onChange={(e) => {
                    const key = e.target.value;
                    onUpdateSettings({ apiKey: key });
                    try {
                      localStorage.setItem('void_gemini_api_key', key);
                    } catch {}
                  }}
                  placeholder="AIzaSy... (Paste Gemini Key)"
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2.5 pr-20 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none placeholder:text-zinc-600"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2 top-2 px-2.5 py-1 rounded text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 cursor-pointer"
                >
                  {showKey ? 'HIDE' : 'SHOW'}
                </button>
              </div>
            </div>

            {/* Test Connection Result Box */}
            {keyTestResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex items-center justify-between gap-2 ${
                keyTestResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/60 border-red-500/50 text-red-300'
              }`}>
                <div className="flex items-center gap-2">
                  {keyTestResult.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                  <span>{keyTestResult.message}</span>
                </div>
                {keyTestResult.latency && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-emerald-600/40">
                    {keyTestResult.latency} ms
                  </span>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestKeyConnection}
                disabled={isTestingKey || !settings.apiKey.trim()}
                className="px-3.5 py-1.5 bg-zinc-900 border border-white/20 hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isTestingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                <span>{isTestingKey ? 'TESTING...' : 'VERIFY KEY'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-500 text-black font-mono font-bold text-xs rounded-lg hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                SAVE GEMINI KEY
              </button>
            </div>
          </form>
        </div>

        {/* CARD 2: VOICE API KEY (ELEVENLABS / NEURAL TTS) */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.5)]">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Mic2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono tracking-wider">2. Voice API Key</h2>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 border border-purple-800 text-purple-300">
              Neural Speech Synthesis
            </span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Add your ElevenLabs, Google Cloud Text-to-Speech, or Neural Voice API key for hyper-realistic deep tactical baritone speech.
          </p>

          {/* Voice Provider Selector */}
          <div>
            <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1.5">
              Select Voice Synthesis Engine:
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'elevenlabs', label: 'ElevenLabs', sub: 'Hyper-Realistic' },
                { id: 'google_tts', label: 'Gemini / Cloud', sub: 'GenAI Audio' },
                { id: 'browser', label: 'Device Native', sub: 'Zero Key / Free' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => onUpdateSettings({ voiceProvider: p.id as VoiceProvider })}
                  className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                    settings.voiceProvider === p.id
                      ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                      : 'bg-black/50 border-white/10 text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-mono font-bold">{p.label}</div>
                  <div className="text-[9px] text-zinc-400 mt-0.5">{p.sub}</div>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveVoiceKey} className="space-y-3">
            {settings.voiceProvider !== 'browser' ? (
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  {settings.voiceProvider === 'elevenlabs' ? 'ElevenLabs Voice API Key (xi-api-key)' : 'Voice API Key / Google Token'}
                </label>
                <div className="relative">
                  <input
                    type={showVoiceKey ? 'text' : 'password'}
                    value={settings.voiceApiKey}
                    onChange={(e) => {
                      const key = e.target.value;
                      onUpdateSettings({ voiceApiKey: key });
                      try {
                        localStorage.setItem('void_voice_api_key', key);
                      } catch {}
                    }}
                    placeholder={settings.voiceProvider === 'elevenlabs' ? 'sk_... / xi-... (Paste ElevenLabs Voice Key)' : 'Paste Voice API Key'}
                    className="w-full bg-black border border-white/20 rounded-xl px-3 py-2.5 pr-20 text-xs text-white font-mono focus:border-cyan-400 focus:outline-none placeholder:text-zinc-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVoiceKey(!showVoiceKey)}
                    className="absolute right-2 top-2 px-2.5 py-1 rounded text-[10px] font-mono text-zinc-400 hover:text-white bg-zinc-900 border border-white/10 cursor-pointer"
                  >
                    {showVoiceKey ? 'HIDE' : 'SHOW'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-zinc-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Device synthesis uses Android/Browser high-definition speech. No Voice API key required.</span>
              </div>
            )}

            {/* Optional Voice ID for ElevenLabs */}
            {settings.voiceProvider === 'elevenlabs' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[10px] font-mono uppercase text-zinc-400">
                    Tactical Voice ID Preset:
                  </label>
                  <span className="text-[10px] font-mono text-cyan-400">Deep Baritone</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ elevenLabsVoiceId: 'pNInz6obpgDQGcFmaJgB', voice: 'Charon' })}
                    className={`p-2 rounded-lg border text-left text-xs font-mono cursor-pointer transition-all ${
                      (settings.elevenLabsVoiceId === 'pNInz6obpgDQGcFmaJgB' || !settings.elevenLabsVoiceId)
                        ? 'bg-white/10 border-cyan-400 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-cyan-300">Adam (Charon Persona)</div>
                    <div className="text-[10px] text-zinc-400">Deep, calm tactical baritone</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => onUpdateSettings({ elevenLabsVoiceId: 'VR6AewLTigWG4xSOukaG', voice: 'Fenrir' })}
                    className={`p-2 rounded-lg border text-left text-xs font-mono cursor-pointer transition-all ${
                      settings.elevenLabsVoiceId === 'VR6AewLTigWG4xSOukaG'
                        ? 'bg-white/10 border-cyan-400 text-white'
                        : 'bg-black/40 border-white/10 text-zinc-400'
                    }`}
                  >
                    <div className="font-bold text-cyan-300">Arnold (Fenrir Persona)</div>
                    <div className="text-[10px] text-zinc-400">Commanding, low pitch authority</div>
                  </button>
                </div>
              </div>
            )}

            {/* Voice Key Test Result Box */}
            {voiceKeyTestResult && (
              <div className={`p-3 rounded-xl border text-xs font-mono flex flex-col gap-1 ${
                voiceKeyTestResult.success
                  ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                  : 'bg-red-950/60 border-red-500/50 text-red-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {voiceKeyTestResult.success ? <Check className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
                    <span>{voiceKeyTestResult.message}</span>
                  </div>
                  {voiceKeyTestResult.latency && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/40 border border-emerald-600/40">
                      {voiceKeyTestResult.latency} ms
                    </span>
                  )}
                </div>
                {voiceKeyTestResult.remainingChars !== undefined && (
                  <div className="text-[10px] text-emerald-400/80 pl-6">
                    Remaining Quota: {voiceKeyTestResult.remainingChars.toLocaleString()} characters
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={handleTestVoiceKeyConnection}
                disabled={isTestingVoiceKey || (settings.voiceProvider !== 'browser' && !settings.voiceApiKey.trim())}
                className="px-3.5 py-1.5 bg-zinc-900 border border-white/20 hover:border-cyan-400 text-xs font-mono text-cyan-300 hover:text-white rounded-lg flex items-center gap-1.5 transition-all active:scale-95 disabled:opacity-40 cursor-pointer"
              >
                {isTestingVoiceKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Waves className="w-3.5 h-3.5" />}
                <span>{isTestingVoiceKey ? 'VERIFYING...' : 'VERIFY VOICE KEY'}</span>
              </button>

              <button
                type="submit"
                className="px-4 py-1.5 bg-cyan-500 text-black font-mono font-bold text-xs rounded-lg hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] cursor-pointer"
              >
                SAVE VOICE KEY
              </button>
            </div>
          </form>
        </div>

        {/* CARD 3: MALE VOICE CONFIGURATION & SPEECH ENGINE */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono tracking-wider">Voice Tone & Pitch Synthesizer</h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">Male Tactical Audio</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => onUpdateSettings({ voice: 'Charon', pitch: 0.72 })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.voice === 'Charon'
                  ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="text-xs font-bold font-mono text-cyan-300">VOICE: CHARON</div>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                Deep, calm baritone. Highly composed, steady, and tactical.
              </p>
              <span className="text-[9px] font-mono text-zinc-400 block mt-2">PITCH: 0.72x • RATE: 0.95x</span>
            </button>

            <button
              onClick={() => onUpdateSettings({ voice: 'Fenrir', pitch: 0.65 })}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                settings.voice === 'Fenrir'
                  ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_15px_rgba(0,240,255,0.2)]'
                  : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
              }`}
            >
              <div className="text-xs font-bold font-mono text-cyan-300">VOICE: FENRIR</div>
              <p className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                Authoritative, low pitch, military-grade tactical precision.
              </p>
              <span className="text-[9px] font-mono text-zinc-400 block mt-2">PITCH: 0.65x • RATE: 1.00x</span>
            </button>
          </div>

          {/* Pitch & Rate Sliders */}
          <div className="space-y-3 bg-black p-3.5 rounded-xl border border-white/10">
            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Voice Pitch (Baritone Level):</span>
                <span className="text-cyan-400 font-bold">{settings.pitch.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.50"
                max="1.20"
                step="0.05"
                value={settings.pitch}
                onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex items-center justify-between text-xs font-mono mb-1">
                <span className="text-zinc-400">Speech Rate:</span>
                <span className="text-cyan-400 font-bold">{settings.speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.30"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>

          {/* Voice Testing CTA */}
          <div className="pt-2 border-t border-white/10 flex items-center justify-between">
            <span className="text-xs text-zinc-400 font-mono">Audio Test:</span>
            <button
              onClick={onTestVoice}
              disabled={isTestingVoice}
              className="px-4 py-2 rounded-lg bg-zinc-900 border border-cyan-400/50 hover:bg-zinc-800 text-xs font-mono font-bold text-cyan-300 hover:text-white flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5" />
              <span>{isTestingVoice ? 'SPEAKING...' : 'HEAR VOICE SAMPLE'}</span>
            </button>
          </div>
        </div>

        {/* CARD 4: FOREGROUND SERVICE / ALWAYS-LISTENING MIC */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono tracking-wider">Always-Listening Foreground Service</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">Background Daemon</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed font-sans">
            Maintains continuous low-latency speech recognition and wake lock even when switching to other apps like TikTok, Facebook, or locking the device.
          </p>

          <div className="flex items-center justify-between p-3 rounded-xl bg-black border border-white/10">
            <div>
              <div className="text-xs font-bold font-mono text-white">Continuous Background Mic Service</div>
              <div className="text-[10px] font-mono text-zinc-400">Persistent notification + WakeLock</div>
            </div>
            <button
              onClick={() => onUpdateSettings({ alwaysListening: !settings.alwaysListening })}
              className={`w-12 h-6 rounded-full transition-colors relative p-1 cursor-pointer ${
                settings.alwaysListening ? 'bg-cyan-500' : 'bg-zinc-800'
              }`}
            >
              <div
                className={`w-4 h-4 rounded-full bg-black transition-transform ${
                  settings.alwaysListening ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* CARD 5: GEMINI MODEL SELECTION */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-bold font-mono tracking-wider">Neural Engine Model</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">Realtime Reasoning</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[
              { id: 'gemini-2.5-flash', title: 'Gemini 2.5 Flash', desc: 'Fast & Direct Response', badge: 'Recommended' },
              { id: 'gemini-3.8-flash', title: 'Gemini 3.8 Flash', desc: 'Live Multimodal Reasoning', badge: 'Ultra-low Latency' },
              { id: 'gemini-3.1-pro', title: 'Gemini 3.1 Pro', desc: 'Deep Reasoning Subsystem', badge: 'Complex Code' }
            ].map((m) => (
              <label
                key={m.id}
                onClick={() => onUpdateSettings({ model: m.id as any })}
                className={`p-3 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                  settings.model === m.id
                    ? 'bg-white/10 border-cyan-400 shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                    : 'bg-black/40 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="model"
                      checked={settings.model === m.id}
                      onChange={() => {}}
                      className="accent-cyan-400"
                    />
                    <span className="text-xs font-mono font-bold text-white">{m.title}</span>
                  </div>
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-white/10 text-cyan-300">
                    {m.badge}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 pl-5">{m.desc}</p>
              </label>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
