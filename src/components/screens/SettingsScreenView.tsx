import React from 'react';
import { Sliders, Volume2, Monitor, Smartphone, Moon, Shield, Sparkles } from 'lucide-react';
import { ApiSettingsState, VoiceMacro } from '../../types';
import { MacroManager } from '../MacroManager';

interface SettingsScreenViewProps {
  settings: ApiSettingsState;
  onUpdateSettings: (newSettings: Partial<ApiSettingsState>) => void;
  onChangeAvatarClick?: () => void;
  macros: VoiceMacro[];
  onAddMacro: (macro: VoiceMacro) => void;
  onUpdateMacro: (macro: VoiceMacro) => void;
  onDeleteMacro: (id: string) => void;
  onExecuteMacro: (macro: VoiceMacro) => void;
  executingMacroId?: string | null;
}

export const SettingsScreenView: React.FC<SettingsScreenViewProps> = ({
  settings,
  onUpdateSettings,
  onChangeAvatarClick,
  macros,
  onAddMacro,
  onUpdateMacro,
  onDeleteMacro,
  onExecuteMacro,
  executingMacroId,
}) => {
  return (
    <div className="w-full h-full min-h-screen bg-black text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Sliders className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-display">SYSTEM PREFERENCES</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-white/15">
                v1.0.0-RELEASE
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Voice Acoustic Tuning • Remote PC Stream Latency • Cyberpunk Visual Profiles
            </p>
          </div>
        </div>
      </div>

      {/* TACTICAL MACRO MANAGER SECTION */}
      <MacroManager
        macros={macros}
        onAddMacro={onAddMacro}
        onUpdateMacro={onUpdateMacro}
        onDeleteMacro={onDeleteMacro}
        onExecuteMacro={onExecuteMacro}
        executingMacroId={executingMacroId}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        
        {/* VOICE ACOUSTICS SECTION */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold font-mono tracking-wider border-b border-white/10 pb-2">
            <Volume2 className="w-4 h-4 text-cyan-400" />
            <span>Voice Acoustics & Pitch</span>
          </div>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-zinc-400">Deep Pitch Modulation:</span>
                <span className="text-cyan-400 font-bold">{settings.pitch.toFixed(2)}x (Baritone)</span>
              </div>
              <input
                type="range"
                min="0.5"
                max="1.1"
                step="0.02"
                value={settings.pitch}
                onChange={(e) => onUpdateSettings({ pitch: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
              <span className="text-[10px] text-zinc-500">Lower values produce a deeper, tactical male voice tone.</span>
            </div>

            <div>
              <div className="flex justify-between mb-1.5">
                <span className="text-zinc-400">Speech Cadence Rate:</span>
                <span className="text-cyan-400 font-bold">{settings.speechRate.toFixed(2)}x</span>
              </div>
              <input
                type="range"
                min="0.75"
                max="1.25"
                step="0.05"
                value={settings.speechRate}
                onChange={(e) => onUpdateSettings({ speechRate: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* QUICKTRIP STREAM QUALITY SECTION */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold font-mono tracking-wider border-b border-white/10 pb-2">
            <Monitor className="w-4 h-4 text-cyan-400" />
            <span>PC Cloud Stream Quality (QuickTrip)</span>
          </div>

          <div className="space-y-3 text-xs font-mono">
            <div>
              <label className="text-zinc-400 block mb-1.5">Stream Refresh Rate:</label>
              <div className="grid grid-cols-3 gap-2">
                {['30 FPS', '60 FPS (Default)', '120 FPS Ultra'].map((fps, i) => (
                  <button
                    key={i}
                    className={`py-1.5 rounded-lg border text-center transition-all ${
                      i === 1
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300 font-bold shadow-[0_0_10px_rgba(0,240,255,0.2)]'
                        : 'bg-black/40 border-white/10 text-zinc-400 hover:border-white/20'
                    }`}
                  >
                    {fps}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <span className="text-zinc-400 block mb-1">Target Video Codec:</span>
              <div className="p-2 rounded bg-black border border-white/10 text-zinc-300">
                H.265 / HEVC Ultra Low Latency (Hardware Accelerated)
              </div>
            </div>
          </div>
        </div>

        {/* AESTHETICS & DISPLAY */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold font-mono tracking-wider border-b border-white/10 pb-2">
            <Moon className="w-4 h-4 text-cyan-400" />
            <span>Visual Theme Engine</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black border border-cyan-500/30 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Pure Black Cyberpunk OLED (#000000)</div>
                <div className="text-[10px] text-zinc-500">Zero subpixel emission on AMOLED panels</div>
              </div>
              <span className="text-cyan-400 font-bold">LOCKED</span>
            </div>

            <div className="p-3 rounded-xl bg-black border border-white/10 flex items-center justify-between">
              <div>
                <div className="font-bold text-white">Concentric Orbit Rings Animation</div>
                <div className="text-[10px] text-zinc-500">Hardware accelerated SVG compositor rotation</div>
              </div>
              <span className="text-emerald-400 font-bold">ACTIVE</span>
            </div>

            {onChangeAvatarClick && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={onChangeAvatarClick}
                  className="w-full py-2.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.15)]"
                >
                  <span>CHANGE FIGURE / UPLOAD IMAGE</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ACCESSIBILITY ENGINE LATENCY */}
        <div className="bg-zinc-950 p-5 rounded-2xl border border-white/10 flex flex-col gap-4">
          <div className="flex items-center gap-2 text-sm font-bold font-mono tracking-wider border-b border-white/10 pb-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>Accessibility Injection Latency</span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="p-3 rounded-xl bg-black border border-white/10">
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Touch Exploration Timeout:</span>
                <span className="text-white font-bold">100 ms</span>
              </div>
              <div className="text-[10px] text-zinc-500">Fastest response for automated button clicks</div>
            </div>

            <div className="p-3 rounded-xl bg-black border border-white/10">
              <div className="flex justify-between mb-1">
                <span className="text-zinc-400">Gesture Swipe Duration:</span>
                <span className="text-white font-bold">300 ms</span>
              </div>
              <div className="text-[10px] text-zinc-500">Smooth simulated human scrolling velocity</div>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};
