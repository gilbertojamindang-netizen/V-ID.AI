import React, { useState } from 'react';
import { 
  Smartphone, 
  Layers, 
  MousePointerClick, 
  Terminal, 
  KeyRound, 
  ArrowUp, 
  ArrowDown, 
  CheckCircle2, 
  Eye, 
  ShieldCheck
} from 'lucide-react';
import { ScreenAutomationState } from '../../types';

interface ScreenAutomationViewProps {
  automationState: ScreenAutomationState;
  onLaunchApp?: (packageName: string, appName: string) => void;
  onPerformClick: (targetText: string) => void;
  onPerformType: (text: string) => void;
  onReadScreen: () => void;
  onAssistLogin: (username: string) => void;
  onSystemGesture: (gesture: 'home' | 'back' | 'recents' | 'scroll_up' | 'scroll_down') => void;
}

export const ScreenAutomationView: React.FC<ScreenAutomationViewProps> = ({
  automationState,
  onLaunchApp,
  onPerformClick,
  onPerformType,
  onReadScreen,
  onAssistLogin,
  onSystemGesture,
}) => {
  const [clickTargetInput, setClickTargetInput] = useState('Log In');
  const [typeTextInput, setTypeTextInput] = useState('');
  const [loginUsernameInput, setLoginUsernameInput] = useState('agent_operator@void.ai');

  const handleClickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (clickTargetInput.trim()) {
      onPerformClick(clickTargetInput.trim());
    }
  };

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeTextInput.trim()) {
      onPerformType(typeTextInput.trim());
      setTypeTextInput('');
    }
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#050508] text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Smartphone className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-display">SCREEN AUTOMATION & ACCESSIBILITY</h1>
              <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                automationState.accessibilityEnabled
                  ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                  : 'bg-zinc-900 text-zinc-400 border-zinc-700'
              }`}>
                {automationState.accessibilityEnabled ? 'SERVICE ACTIVE' : 'ACCESSIBILITY ACTIVE'}
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Live Screen Reading • Autonomous UI Clicking • Cross-App Text Typing • Account Login
            </p>
          </div>
        </div>

        <button
          onClick={onReadScreen}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
        >
          <Eye className="w-4 h-4" />
          <span>READ SCREEN CONTENT</span>
        </button>
      </div>

      {/* TOP ROW: SYSTEM NAVIGATION & ACTIVE WINDOW MONITOR */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        
        {/* CARD 1: SYSTEM GESTURES DECK */}
        <div className="lg:col-span-2 bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider">System Navigation & Global Gestures</h2>
              </div>
              <span className="text-[10px] font-mono text-cyan-300">OS-Level Accessibility</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-4">
              Trigger instant native Android system gestures without leaving VOID's persistent overlay watcher.
            </p>

            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2.5">
              <button
                onClick={() => onSystemGesture('back')}
                className="p-3 rounded-xl bg-black border border-white/15 hover:border-cyan-400 text-center text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                BACK
              </button>
              <button
                onClick={() => onSystemGesture('home')}
                className="p-3 rounded-xl bg-black border border-white/15 hover:border-cyan-400 text-center text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                HOME
              </button>
              <button
                onClick={() => onSystemGesture('recents')}
                className="p-3 rounded-xl bg-black border border-white/15 hover:border-cyan-400 text-center text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                RECENTS
              </button>
              <button
                onClick={() => onSystemGesture('scroll_up')}
                className="p-3 rounded-xl bg-black border border-white/15 hover:border-cyan-400 text-center text-xs font-mono flex items-center justify-center gap-1.5 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowUp className="w-3.5 h-3.5 text-cyan-400" />
                <span>SCROLL UP</span>
              </button>
              <button
                onClick={() => onSystemGesture('scroll_down')}
                className="p-3 rounded-xl bg-black border border-white/15 hover:border-cyan-400 text-center text-xs font-mono flex items-center justify-center gap-1.5 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer shadow-sm"
              >
                <ArrowDown className="w-3.5 h-3.5 text-cyan-400" />
                <span>SCROLL DOWN</span>
              </button>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 border-t border-white/10 pt-2 flex items-center justify-between">
            <span>Dispatches: <code>performGlobalAction(GLOBAL_ACTION_*)</code></span>
            <span className="text-emerald-400">Low-latency Android Bridge</span>
          </div>
        </div>

        {/* CARD 2: ACTIVE FOREGROUND WINDOW STATUS */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Active Window</h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400">Foreground</span>
            </div>

            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-black/60 border border-white/10">
                <span className="text-[10px] font-mono text-zinc-500 uppercase block mb-0.5">Current Screen Focus</span>
                <div className="text-sm font-mono font-bold text-cyan-300 truncate">
                  {automationState.currentApp}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 block">NODES CACHED</span>
                  <span className="text-base font-mono font-bold text-white">{automationState.inspectedNodesCount}</span>
                </div>
                <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                  <span className="text-[9px] font-mono text-zinc-500 block">TOUCH DISPATCH</span>
                  <span className="text-base font-mono font-bold text-emerald-400">READY</span>
                </div>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500 border-t border-white/10 pt-2">
            Auto-refreshed upon screen transition
          </div>
        </div>

      </div>

      {/* SECOND ROW: AUTONOMOUS TOUCH / CLICK & AUTONOMOUS TYPING */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* AUTONOMOUS CLICK DISPATCHER */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <MousePointerClick className="w-4 h-4 text-emerald-400" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Autonomous Click & Tap</h2>
            </div>
            <span className="text-[10px] font-mono text-emerald-400">ACTION_CLICK</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            VOID scans the active screen node tree for text matches or View IDs and dispatches a touch tap:
          </p>

          <form onSubmit={handleClickSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={clickTargetInput}
                onChange={(e) => setClickTargetInput(e.target.value)}
                placeholder="Target text (e.g., 'Log In', 'Allow', 'Search', 'Follow')..."
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-emerald-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!clickTargetInput.trim()}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-bold text-xs rounded-xl active:scale-95 transition-all shadow-[0_0_12px_rgba(16,185,129,0.4)] disabled:opacity-40 cursor-pointer"
            >
              CLICK TARGET
            </button>
          </form>

          {/* Quick Click Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
            {['Log In', 'Sign In', 'Search', 'Allow', 'Next', 'Continue', 'Submit'].map((txt) => (
              <button
                key={txt}
                type="button"
                onClick={() => {
                  setClickTargetInput(txt);
                  onPerformClick(txt);
                }}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 hover:border-emerald-400 text-zinc-300 hover:text-emerald-300 transition-all cursor-pointer"
              >
                "{txt}"
              </button>
            ))}
          </div>
        </div>

        {/* AUTONOMOUS TEXT INJECTION */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Cross-App Text Injection</h2>
            </div>
            <span className="text-[10px] font-mono text-cyan-400">ACTION_SET_TEXT</span>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Types text into whatever input, search bar, or message box is currently focused on screen:
          </p>

          <form onSubmit={handleTypeSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={typeTextInput}
                onChange={(e) => setTypeTextInput(e.target.value)}
                placeholder="Enter text to type into active app..."
                className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={!typeTextInput.trim()}
              className="px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl active:scale-95 transition-all shadow-[0_0_12px_rgba(0,240,255,0.4)] disabled:opacity-40 cursor-pointer"
            >
              TYPE TEXT
            </button>
          </form>

          {/* Quick Type Chips */}
          <div className="flex flex-wrap gap-1.5 pt-1 text-[10px] font-mono">
            {['cyberpunk aesthetics', 'Hey! Are you free?', 'VOID AI Online', 'search query'].map((txt) => (
              <button
                key={txt}
                type="button"
                onClick={() => {
                  setTypeTextInput(txt);
                  onPerformType(txt);
                }}
                className="px-2 py-0.5 rounded bg-zinc-900 border border-white/10 hover:border-cyan-400 text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer"
              >
                Type "{txt}"
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* THIRD ROW: ACCOUNT LOGIN ASSISTANT & SCREEN NODE INSPECTOR */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        
        {/* ACCOUNT LOGIN ASSISTANT */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col justify-between gap-4">
          <div>
            <div className="flex items-center justify-between border-b border-white/10 pb-2.5 mb-3">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-purple-400" />
                <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Account Login Assistant</h2>
              </div>
              <span className="text-[10px] font-mono text-purple-300">Autofill & Submit</span>
            </div>

            <p className="text-xs text-zinc-400 leading-relaxed mb-3">
              When commanded to help you log into accounts, VOID finds the username/email input, fills it, targets the password field, and clicks the submit button.
            </p>

            <div className="space-y-3 bg-black p-3.5 rounded-xl border border-white/10">
              <div>
                <label className="text-[10px] font-mono text-zinc-400 block mb-1 uppercase">Target Username / Email</label>
                <input
                  type="text"
                  value={loginUsernameInput}
                  onChange={(e) => setLoginUsernameInput(e.target.value)}
                  className="w-full bg-zinc-900 border border-white/15 rounded-lg px-3 py-1.5 text-xs font-mono text-white focus:border-purple-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] font-mono text-zinc-400">Password autofill: Hardware KeyStore Token</span>
                <button
                  type="button"
                  onClick={() => onAssistLogin(loginUsernameInput)}
                  className="px-3.5 py-1.5 bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs rounded-lg active:scale-95 transition-all shadow-[0_0_12px_rgba(168,85,247,0.4)] cursor-pointer"
                >
                  AUTONOMOUS LOG IN
                </button>
              </div>
            </div>
          </div>

          <div className="text-[10px] font-mono text-zinc-500">
            * Coordinates with native <code>VoidAccessibilityService.assistAccountLogin()</code>
          </div>
        </div>

        {/* LIVE SCREEN NODE INSPECTOR DUMP */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-3">
          <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-cyan-400" />
              <h2 className="text-xs font-mono font-bold uppercase tracking-wider">Live Screen Elements Dump</h2>
            </div>
            <span className="text-[10px] font-mono text-zinc-400">
              {automationState.inspectedNodesCount} Interactive Elements
            </span>
          </div>

          <div className="bg-[#08080c] p-3 rounded-xl border border-white/10 max-h-52 overflow-y-auto font-mono text-[11px] space-y-2">
            {automationState.detectedInteractiveNodes.map((node) => (
              <div key={node.id} className="p-2 rounded bg-black/60 border border-white/5 flex items-center justify-between gap-2">
                <div>
                  <span className="text-white font-bold">{node.text || '<Unlabeled Node>'}</span>
                  <span className="text-zinc-500 block text-[9px]">{node.className} • ID: {node.id}</span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  {node.clickable && (
                    <button
                      onClick={() => onPerformClick(node.text || node.id)}
                      className="px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-500/50 text-[9px] text-emerald-300 hover:bg-emerald-900 active:scale-95 transition-all cursor-pointer"
                    >
                      CLICK
                    </button>
                  )}
                  {node.editable && (
                    <span className="px-1.5 py-0.5 rounded bg-amber-950 text-[9px] text-amber-300 border border-amber-700">
                      EDITABLE
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <p className="text-[10px] font-mono text-zinc-500">
            Summary: {automationState.screenContentSummary}
          </p>
        </div>

      </div>

      {/* EXECUTION LOGS FOOTER */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-xs font-mono font-bold text-zinc-300 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>ACCESSIBILITY DISPATCH LOGS</span>
          </span>
          <span className="text-[10px] font-mono text-zinc-500">Real-time Stream</span>
        </div>

        <div className="space-y-1 max-h-36 overflow-y-auto font-mono text-[10px]">
          {automationState.executionLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-1 border-b border-white/5 text-zinc-400">
              <div className="flex items-center gap-2">
                <span className="text-zinc-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                <span className="text-cyan-400 font-bold uppercase">{log.action}:</span>
                <span className="text-white">"{log.target}"</span>
              </div>
              <span className="text-emerald-400">{log.result}</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
