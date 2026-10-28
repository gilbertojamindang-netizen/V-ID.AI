import React, { useState } from 'react';
import { 
  Workflow, 
  Plus, 
  Trash2, 
  Play, 
  Check, 
  X, 
  Smartphone, 
  Keyboard, 
  Volume2, 
  Camera, 
  ArrowDown, 
  Sparkles, 
  CheckCircle2, 
  Clock,
  Layers,
  MousePointerClick,
  KeyRound
} from 'lucide-react';
import { VoiceMacro, MacroAction, MacroActionType } from '../types';

interface MacroManagerProps {
  macros: VoiceMacro[];
  onAddMacro: (macro: VoiceMacro) => void;
  onUpdateMacro: (macro: VoiceMacro) => void;
  onDeleteMacro: (id: string) => void;
  onExecuteMacro: (macro: VoiceMacro) => void;
  executingMacroId?: string | null;
}

export const MacroManager: React.FC<MacroManagerProps> = ({
  macros,
  onAddMacro,
  onUpdateMacro,
  onDeleteMacro,
  onExecuteMacro,
  executingMacroId,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [triggerInput, setTriggerInput] = useState('');
  const [descInput, setDescInput] = useState('');
  const [actionList, setActionList] = useState<MacroAction[]>([]);
  
  // Action Creator Draft State
  const [selectedActionType, setSelectedActionType] = useState<MacroActionType>('open_app');
  const [actionApp, setActionApp] = useState('TikTok');
  const [actionTargetText, setActionTargetText] = useState('Log In');
  const [actionTypeText, setActionTypeText] = useState('cyberpunk aesthetics');
  const [actionUsername, setActionUsername] = useState('operator@void.ai');
  const [actionPitch, setActionPitch] = useState(0.70);
  const [actionSpeech, setActionSpeech] = useState('Sequence executed. System standing by.');

  const handleAddActionToDraft = () => {
    let title = '';
    let payload: any = {};

    switch (selectedActionType) {
      case 'open_app':
        title = `Launch App: ${actionApp}`;
        payload = { app: actionApp };
        break;
      case 'click_text':
        title = `Click Button: "${actionTargetText}"`;
        payload = { targetText: actionTargetText };
        break;
      case 'type_text':
        title = `Type Text: "${actionTypeText}"`;
        payload = { text: actionTypeText };
        break;
      case 'read_screen':
        title = 'Read Screen & Inspect Nodes';
        payload = {};
        break;
      case 'assist_login':
        title = `Assist Login: ${actionUsername}`;
        payload = { username: actionUsername };
        break;
      case 'set_voice_tone':
        title = `Set Voice Pitch to ${actionPitch}x`;
        payload = { pitch: actionPitch };
        break;
      case 'take_screenshot':
        title = 'Capture Display Screenshot';
        payload = {};
        break;
      case 'speak_phrase':
        title = `Speak: "${actionSpeech}"`;
        payload = { message: actionSpeech };
        break;
    }

    const newAction: MacroAction = {
      id: `act_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      type: selectedActionType,
      title,
      payload
    };

    setActionList([...actionList, newAction]);
  };

  const handleRemoveDraftAction = (id: string) => {
    setActionList(actionList.filter(a => a.id !== id));
  };

  const handleSaveMacro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerInput.trim() || actionList.length === 0) return;

    const newMacro: VoiceMacro = {
      id: `macro_${Date.now()}`,
      triggerPhrase: triggerInput.trim().toLowerCase(),
      description: descInput.trim() || `Autonomous macro triggered by "${triggerInput.trim()}"`,
      enabled: true,
      actions: actionList,
      executionCount: 0
    };

    onAddMacro(newMacro);
    setIsCreating(false);
    setTriggerInput('');
    setDescInput('');
    setActionList([]);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#050508] text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Workflow className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-display">VOICE MACRO MANAGER</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                {macros.length} Macros Registered
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Custom Multi-Step Voice Sequences • Screen & App Automation
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.4)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>CREATE NEW MACRO</span>
        </button>
      </div>

      {/* CREATE MACRO MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="w-full max-w-xl bg-zinc-950 border border-white/20 rounded-2xl p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h2 className="text-sm font-mono font-bold text-white flex items-center gap-2">
                <Workflow className="w-4 h-4 text-cyan-400" />
                <span>BUILD CUSTOM VOICE MACRO</span>
              </h2>
              <button
                onClick={() => setIsCreating(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveMacro} className="space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Voice Trigger Phrase (e.g., "start work", "check feed", "stealth mode")
                </label>
                <input
                  type="text"
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  placeholder="e.g., check tiktok"
                  required
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Launches TikTok, reads feed, and confirms."
                  className="w-full bg-black border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-white placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none"
                />
              </div>

              {/* ACTION CREATOR */}
              <div className="bg-black/60 p-3.5 rounded-xl border border-white/10 space-y-3">
                <div className="text-[11px] font-mono font-bold text-cyan-300">ADD ACTION STEP:</div>
                
                <div className="grid grid-cols-2 gap-2">
                  <select
                    value={selectedActionType}
                    onChange={(e) => setSelectedActionType(e.target.value as any)}
                    className="bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                  >
                    <option value="open_app">Launch Android App</option>
                    <option value="click_text">Click Button by Text</option>
                    <option value="type_text">Type Text into Screen</option>
                    <option value="read_screen">Read Active Screen</option>
                    <option value="assist_login">Assist Account Login</option>
                    <option value="set_voice_tone">Set Voice Pitch</option>
                    <option value="speak_phrase">Speak Confirmation</option>
                  </select>

                  {selectedActionType === 'open_app' && (
                    <select
                      value={actionApp}
                      onChange={(e) => setActionApp(e.target.value)}
                      className="bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    >
                      <option value="TikTok">TikTok</option>
                      <option value="Facebook">Facebook</option>
                      <option value="YouTube">YouTube</option>
                      <option value="Chrome">Chrome</option>
                      <option value="Messages">Messages</option>
                    </select>
                  )}

                  {selectedActionType === 'click_text' && (
                    <input
                      type="text"
                      value={actionTargetText}
                      onChange={(e) => setActionTargetText(e.target.value)}
                      placeholder="Button text to click..."
                      className="bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  )}

                  {selectedActionType === 'type_text' && (
                    <input
                      type="text"
                      value={actionTypeText}
                      onChange={(e) => setActionTypeText(e.target.value)}
                      placeholder="Text to type..."
                      className="bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  )}

                  {selectedActionType === 'speak_phrase' && (
                    <input
                      type="text"
                      value={actionSpeech}
                      onChange={(e) => setActionSpeech(e.target.value)}
                      placeholder="Phrase to speak..."
                      className="bg-zinc-900 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleAddActionToDraft}
                  className="w-full py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/30 transition-all cursor-pointer"
                >
                  + Add Step to Sequence
                </button>
              </div>

              {/* ACTION LIST PREVIEW */}
              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-zinc-400">CONFIGURED STEPS ({actionList.length}):</div>
                {actionList.map((act, index) => (
                  <div key={act.id} className="p-2 rounded-lg bg-zinc-900 border border-white/10 flex items-center justify-between text-xs font-mono">
                    <span className="text-zinc-300">{index + 1}. {act.title}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveDraftAction(act.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 bg-zinc-900 border border-white/20 text-xs font-mono rounded-xl text-zinc-400 hover:text-white"
                >
                  CANCEL
                </button>
                <button
                  type="submit"
                  disabled={!triggerInput.trim() || actionList.length === 0}
                  className="px-5 py-2 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs rounded-xl disabled:opacity-40"
                >
                  SAVE MACRO
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MACRO LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {macros.map((macro) => (
          <div
            key={macro.id}
            className="p-5 rounded-2xl bg-zinc-950 border border-white/10 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Workflow className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                    "{macro.triggerPhrase}"
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onExecuteMacro(macro)}
                    disabled={executingMacroId === macro.id}
                    className="px-3 py-1 bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-[11px] rounded-lg flex items-center gap-1 active:scale-95 transition-all shadow-[0_0_10px_rgba(0,240,255,0.3)] cursor-pointer"
                  >
                    <Play className="w-3 h-3 fill-black" />
                    <span>{executingMacroId === macro.id ? 'RUNNING...' : 'EXECUTE'}</span>
                  </button>

                  <button
                    onClick={() => onDeleteMacro(macro.id)}
                    className="p-1.5 rounded-lg bg-zinc-900 border border-white/10 text-zinc-400 hover:text-red-400"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-zinc-400 mb-3">{macro.description}</p>

              <div className="space-y-1 bg-black/60 p-2.5 rounded-xl border border-white/5 font-mono text-[10px]">
                {macro.actions.map((act, idx) => (
                  <div key={act.id} className="text-zinc-300">
                    <span className="text-cyan-400">{idx + 1}.</span> {act.title}
                  </div>
                ))}
              </div>
            </div>

            <div className="text-[10px] font-mono text-zinc-500 pt-2 border-t border-white/10 flex justify-between">
              <span>Executed: {macro.executionCount} times</span>
              <span className="text-emerald-400">Ready for Voice Trigger</span>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};
