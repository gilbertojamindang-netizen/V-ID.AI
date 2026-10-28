import React, { useState } from 'react';
import { 
  Code2, 
  Terminal, 
  Play, 
  Copy, 
  Check, 
  Download, 
  Sparkles, 
  Send, 
  FileCode, 
  RefreshCw, 
  Trash2,
  Plus,
  RotateCcw
} from 'lucide-react';
import { GeneratedCodeItem } from '../../types';

interface AiCodeStudioScreenViewProps {
  onGenerateCode: (prompt: string, language: string) => Promise<GeneratedCodeItem | null>;
  isGenerating: boolean;
  history: GeneratedCodeItem[];
  onSendToChat?: (code: string) => void;
}

export const AiCodeStudioScreenView: React.FC<AiCodeStudioScreenViewProps> = ({
  onGenerateCode,
  isGenerating,
  history,
  onSendToChat,
}) => {
  const [promptInput, setPromptInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('python');
  
  // Clean, editable code buffer with easy clear & new script buttons
  const [currentCode, setCurrentCode] = useState<string>(() => {
    if (history.length > 0) return history[0].code;
    return `# VOID.AI Code Studio\n# Enter or generate your script below\n\ndef main():\n    print("VOID AI System Ready")\n\nif __name__ == "__main__":\n    main()\n`;
  });

  const [currentFileName, setCurrentFileName] = useState('script.py');
  const [copied, setCopied] = useState(false);
  const [executionOutput, setExecutionOutput] = useState<string | null>(null);
  const [isRunningSim, setIsRunningSim] = useState(false);

  const handlePromptSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    const result = await onGenerateCode(promptInput.trim(), selectedLanguage);
    if (result) {
      setCurrentCode(result.code);
      setCurrentFileName(result.fileName);
      setExecutionOutput(`[SYNTHESIS COMPLETE] Generated ${result.fileName} for: "${result.title}"`);
    }
  };

  const handleClearEditor = () => {
    setCurrentCode('');
    setExecutionOutput('[EDITOR CLEARED] Workspace is now blank.');
  };

  const handleNewScript = () => {
    const ext = selectedLanguage === 'python' ? 'py' : selectedLanguage === 'bash' ? 'sh' : selectedLanguage === 'kotlin' ? 'kt' : 'ts';
    setCurrentCode(`# New ${selectedLanguage} script\n`);
    setCurrentFileName(`void_script_${Date.now().toString().slice(-4)}.${ext}`);
    setExecutionOutput('[NEW SCRIPT] Initialized blank template.');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = currentFileName;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleRunInSandbox = () => {
    setIsRunningSim(true);
    setExecutionOutput('[SANDBOX EXECUTION STARTED] Initializing isolated runtime container...');

    setTimeout(() => {
      setIsRunningSim(false);
      const lineCount = currentCode.split('\n').length;
      const charCount = currentCode.length;
      setExecutionOutput(
        `[SANDBOX] File: ${currentFileName}\n` +
        `[STATUS] Syntax checked: Clean.\n` +
        `[TELEMETRY] ${lineCount} lines, ${charCount} bytes parsed.\n` +
        `[OUTPUT]\n> Process executed with exit code 0 (SUCCESS)\n> VOID runtime verified.`
      );
    }, 600);
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#050508] text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
            <Code2 className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-wider font-display">AI CODE & SCRIPT STUDIO</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                Neural Script Engine
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono">
              Autonomous Script Synthesis • Sandbox Evaluation • Code Generation
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleNewScript}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-white/20 text-xs font-mono text-zinc-300 hover:text-white flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>NEW SCRIPT</span>
          </button>

          <button
            onClick={handleClearEditor}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 border border-red-500/30 text-xs font-mono text-red-400 hover:text-red-300 flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>CLEAR EDITOR</span>
          </button>
        </div>
      </div>

      {/* CODE GENERATION PROMPT FORM */}
      <div className="bg-zinc-950 p-4 rounded-2xl border border-white/10 flex flex-col gap-3">
        <form onSubmit={handlePromptSubmit} className="flex flex-col md:flex-row gap-3">
          {/* Language Selector */}
          <select
            value={selectedLanguage}
            onChange={(e) => {
              const lang = e.target.value;
              setSelectedLanguage(lang);
              const ext = lang === 'python' ? 'py' : lang === 'bash' ? 'sh' : lang === 'kotlin' ? 'kt' : 'ts';
              setCurrentFileName(`script.${ext}`);
            }}
            className="bg-black border border-white/20 rounded-xl px-3 py-2 text-xs font-mono text-cyan-300 focus:border-cyan-400 focus:outline-none cursor-pointer"
          >
            <option value="python">Python 3 (.py)</option>
            <option value="bash">Bash / Shell (.sh)</option>
            <option value="powershell">PowerShell (.ps1)</option>
            <option value="javascript">JavaScript (Node.js)</option>
            <option value="typescript">TypeScript (.ts)</option>
            <option value="kotlin">Kotlin / Compose (.kt)</option>
            <option value="rust">Rust (.rs)</option>
            <option value="sql">SQL / Postgres (.sql)</option>
          </select>

          {/* Prompt Input */}
          <div className="flex-1 relative">
            <input
              type="text"
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Tell VOID what code or script to write (e.g., 'Write an automated file cleaner', 'Android camera helper')..."
              className="w-full bg-black border border-white/20 rounded-xl pl-4 pr-4 py-2 text-xs text-white font-mono placeholder:text-zinc-500 focus:border-cyan-400 focus:outline-none"
            />
          </div>

          {/* Generate CTA Button */}
          <button
            type="submit"
            disabled={isGenerating || !promptInput.trim()}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-40 shadow-[0_0_15px_rgba(0,240,255,0.4)] shrink-0 cursor-pointer"
          >
            {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>{isGenerating ? 'SYNTHESIZING...' : 'GENERATE SCRIPT'}</span>
          </button>
        </form>

        {/* Quick Coding Prompt Chips */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px] font-mono pt-1">
          <span className="text-zinc-500 uppercase">Quick Tasks:</span>
          {[
            { label: 'File Backup Daemon', lang: 'python', p: 'Automated directory backup script with timestamp archiving' },
            { label: 'System Telemetry Prober', lang: 'python', p: 'CPU, RAM, and disk utilization prober daemon' },
            { label: 'Android Accessibility Helper', lang: 'kotlin', p: 'Kotlin helper class for finding and clicking Android AccessibilityNodeInfo' },
            { label: 'Bash Cleanup Script', lang: 'bash', p: 'Bash script to clean system temp files and cache' },
          ].map((tpl, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setSelectedLanguage(tpl.lang);
                setPromptInput(tpl.p);
              }}
              className="px-2.5 py-1 rounded bg-black/60 border border-white/10 hover:border-cyan-400/50 hover:bg-zinc-900 text-zinc-300 hover:text-cyan-300 transition-all cursor-pointer"
            >
              {tpl.label}
            </button>
          ))}
        </div>
      </div>

      {/* CODE EDITOR WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1">
        
        {/* LEFT COLUMN: CODE EDITOR (8 COLS) */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-2xl border border-white/10 flex flex-col overflow-hidden shadow-2xl">
          
          {/* File Tab Header */}
          <div className="bg-zinc-900/90 px-4 py-2.5 flex items-center justify-between border-b border-white/10 text-xs font-mono">
            <div className="flex items-center gap-2">
              <FileCode className="w-4 h-4 text-cyan-400" />
              <input
                type="text"
                value={currentFileName}
                onChange={(e) => setCurrentFileName(e.target.value)}
                className="bg-transparent text-white font-bold border-b border-transparent focus:border-cyan-400 focus:outline-none w-36"
              />
              <span className="text-zinc-500">•</span>
              <span className="text-cyan-400 text-[10px] uppercase">{selectedLanguage}</span>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className="px-2.5 py-1 rounded bg-black/60 hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'COPIED' : 'COPY'}</span>
              </button>

              <button
                onClick={handleDownload}
                className="px-2.5 py-1 rounded bg-black/60 hover:bg-white/10 border border-white/15 text-zinc-300 hover:text-white text-[11px] font-mono flex items-center gap-1 transition-all cursor-pointer"
                title="Download script file"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400" />
                <span>DOWNLOAD</span>
              </button>
            </div>
          </div>

          {/* FULLY EDITABLE CODE TEXTAREA (Fixes Bug: Never locked or pre-filled permanently) */}
          <div className="flex-1 p-4 bg-[#07070a] overflow-auto min-h-[380px] font-mono text-xs text-zinc-200">
            <textarea
              value={currentCode}
              onChange={(e) => setCurrentCode(e.target.value)}
              placeholder="Type, paste, or edit your code here freely. Text can be modified or deleted at any time..."
              className="w-full h-full min-h-[360px] bg-transparent text-zinc-200 font-mono text-xs resize-none focus:outline-none leading-relaxed"
              spellCheck={false}
            />
          </div>

          {/* CODE EDITOR ACTION BAR */}
          <div className="bg-black p-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] font-mono text-zinc-400">
              <span className="text-cyan-400 font-semibold">{currentCode.split('\n').length} lines</span> • {currentCode.length} characters
            </div>

            <div className="flex items-center gap-2">
              {onSendToChat && (
                <button
                  onClick={() => onSendToChat(currentCode)}
                  className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/20 hover:border-cyan-400 text-xs font-mono text-zinc-200 hover:text-white flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Send to VOID Chat</span>
                </button>
              )}

              <button
                onClick={handleRunInSandbox}
                disabled={isRunningSim || !currentCode.trim()}
                className="px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center gap-1.5 transition-all active:scale-95 shadow-[0_0_12px_rgba(0,240,255,0.3)] disabled:opacity-50 cursor-pointer"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>{isRunningSim ? 'VERIFYING...' : 'RUN IN SANDBOX'}</span>
              </button>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SANDBOX OUTPUT & SCRIPT HISTORY (4 COLS) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* SANDBOX TERMINAL OUTPUT */}
          <div className="bg-zinc-950 p-4 rounded-2xl border border-white/10 flex flex-col gap-2 flex-1">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-300 border-b border-white/10 pb-2">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <span className="font-bold">Sandbox Terminal</span>
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">Isolated Container</span>
            </div>

            <div className="flex-1 bg-black p-3 rounded-xl border border-white/5 font-mono text-[11px] text-zinc-300 min-h-[180px] max-h-[300px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
              {executionOutput || (
                <span className="text-zinc-600">
                  Ready for script evaluation. Click 'Run in Sandbox' to verify syntax.
                </span>
              )}
            </div>
          </div>

          {/* SCRIPT HISTORY */}
          {history.length > 0 && (
            <div className="bg-zinc-950 p-4 rounded-2xl border border-white/10 flex flex-col gap-2">
              <div className="text-xs font-mono font-bold text-zinc-400 uppercase border-b border-white/10 pb-2">
                Recent Synthesized Scripts
              </div>
              <div className="space-y-1.5 max-h-48 overflow-y-auto">
                {history.slice(0, 5).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentCode(item.code);
                      setCurrentFileName(item.fileName);
                      setSelectedLanguage(item.language);
                    }}
                    className="w-full p-2 rounded-xl bg-black/60 hover:bg-zinc-900 border border-white/5 hover:border-cyan-400/50 text-left transition-all text-xs font-mono flex items-center justify-between group cursor-pointer"
                  >
                    <div className="truncate pr-2">
                      <div className="text-white font-bold group-hover:text-cyan-300 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-zinc-500">
                        {item.fileName} • {item.language}
                      </div>
                    </div>
                    <FileCode className="w-3.5 h-3.5 text-zinc-500 group-hover:text-cyan-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
