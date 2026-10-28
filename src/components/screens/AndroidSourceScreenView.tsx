import React, { useState } from 'react';
import { Code2, Download, Copy, Check, FileCode, Folder, Terminal, Sparkles, Smartphone, Github, CheckCircle2, ExternalLink } from 'lucide-react';
import { ANDROID_PROJECT_FILES } from '../../data/androidProjectFiles';

export const AndroidSourceScreenView: React.FC = () => {
  const [selectedFileIndex, setSelectedFileIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [copiedCommand, setCopiedCommand] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'files' | 'github_actions' | 'instructions'>('files');

  const currentFile = ANDROID_PROJECT_FILES[selectedFileIndex];

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCommand(id);
    setTimeout(() => setCopiedCommand(null), 2000);
  };

  const handleDownloadZip = () => {
    // Direct link to the fully packaged 6.2MB Capacitor native Android project ZIP
    const downloadUrl = '/api/download-capacitor-project';
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = 'VOID_AI_Capacitor_Android_Project.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full h-full min-h-screen bg-black text-white p-4 md:p-6 flex flex-col gap-5 select-none">
      
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="relative w-11 h-11 rounded-xl bg-cyan-950 border border-cyan-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(6,182,212,0.3)] shrink-0 overflow-hidden">
            <img src="/logo.jpg" alt="VOID.AI" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold tracking-wider font-display">CAPACITOR NATIVE ANDROID PROJECT</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/60 font-bold">
                Capacitor 8.5
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700">
                com.voidai.app
              </span>
            </div>
            <p className="text-xs text-zinc-400 font-mono mt-0.5">
              Native Android Platform • Local Offline Web Build (<code className="text-cyan-300">dist/</code>) • GitHub Actions CI/CD Pipeline
            </p>
          </div>
        </div>

        {/* 1-CLICK ZIP DOWNLOAD BUTTON */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadZip}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-black font-mono font-bold text-xs hover:bg-cyan-400 active:scale-95 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] flex items-center gap-2 cursor-pointer whitespace-nowrap"
          >
            <Download className="w-4 h-4" />
            <span>DOWNLOAD PROJECT (.ZIP)</span>
          </button>
        </div>
      </div>

      {/* METRIC PILLS & TABS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-zinc-950/80 p-2.5 rounded-xl border border-white/10">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('files')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'files'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <FileCode className="inline w-3.5 h-3.5 mr-1.5" />
            Project Files ({ANDROID_PROJECT_FILES.length})
          </button>

          <button
            onClick={() => setActiveTab('github_actions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'github_actions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Github className="inline w-3.5 h-3.5 mr-1.5" />
            GitHub Actions APK Build
          </button>

          <button
            onClick={() => setActiveTab('instructions')}
            className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
              activeTab === 'instructions'
                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_10px_rgba(6,182,212,0.2)]'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="inline w-3.5 h-3.5 mr-1.5" />
            Android Studio Build Guide
          </button>
        </div>

        <div className="flex items-center gap-3 text-[11px] font-mono text-zinc-400 px-2">
          <span className="flex items-center gap-1 text-emerald-400">
            <CheckCircle2 className="w-3 h-3" />
            <span>dist/ synced offline</span>
          </span>
          <span>•</span>
          <span>Target SDK 35</span>
        </div>
      </div>

      {/* TAB 1: GITHUB ACTIONS INSTRUCTIONS BANNER */}
      {activeTab === 'github_actions' && (
        <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black rounded-2xl border border-cyan-500/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-black border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Github className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold font-mono text-white tracking-wide">
                  AUTOMATED APK BUILD WITH GITHUB ACTIONS
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  Workflow file pre-configured at: <code className="text-cyan-300">.github/workflows/build-apk.yml</code>
                </p>
              </div>
            </div>
            <button
              onClick={handleDownloadZip}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500 text-black font-mono text-xs font-bold hover:bg-cyan-400"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Ready ZIP</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 01</span>
                <span className="text-[10px] text-zinc-500 font-mono">Push to GitHub</span>
              </div>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                Extract the downloaded ZIP and push to your GitHub repo:
              </p>
              <div className="flex items-center justify-between bg-zinc-950 p-2 rounded border border-zinc-800 font-mono text-[10px] text-zinc-300">
                <code>git push origin main</code>
                <button
                  onClick={() => handleCopyText('git add . && git commit -m "Initialize VOID.AI Capacitor Android" && git push origin main', 'cmd1')}
                  className="text-cyan-400 hover:text-cyan-300 cursor-pointer ml-2"
                >
                  {copiedCommand === 'cmd1' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 02</span>
                <span className="text-[10px] text-zinc-500 font-mono">Automatic Build</span>
              </div>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                GitHub Actions automatically builds the offline web dist, sets up JDK 17, and runs:
              </p>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800 font-mono text-[10px] text-cyan-400">
                <code>./gradlew assembleDebug</code>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-black/60 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono text-cyan-400 font-bold">STEP 03</span>
                <span className="text-[10px] text-zinc-500 font-mono">Install APK</span>
              </div>
              <p className="text-xs text-zinc-300 font-mono leading-relaxed">
                Go to GitHub <strong>Actions</strong> tab &gt; click the latest run &gt; under <strong>Artifacts</strong> download:
              </p>
              <div className="bg-zinc-950 p-2 rounded border border-zinc-800 font-mono text-[10px] text-emerald-400 font-bold">
                <code>VOID-AI-debug-apk / app-debug.apk</code>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ANDROID STUDIO BUILD GUIDE */}
      {activeTab === 'instructions' && (
        <div className="bg-zinc-950 rounded-2xl border border-white/10 p-5 space-y-4 font-mono text-xs">
          <h3 className="text-sm font-bold text-white tracking-wide flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-cyan-400" />
            <span>LOCAL ANDROID STUDIO BUILD STEPS</span>
          </h3>

          <div className="space-y-3">
            <div className="bg-black/70 p-3 rounded-xl border border-zinc-800 space-y-1">
              <div className="text-cyan-400 font-bold">1. Install Node dependencies & compile web assets:</div>
              <code className="text-zinc-300 block bg-zinc-900 px-2 py-1 rounded">npm install && npm run build</code>
            </div>

            <div className="bg-black/70 p-3 rounded-xl border border-zinc-800 space-y-1">
              <div className="text-cyan-400 font-bold">2. Sync web bundle to Capacitor native Android container:</div>
              <code className="text-zinc-300 block bg-zinc-900 px-2 py-1 rounded">npx cap sync android</code>
            </div>

            <div className="bg-black/70 p-3 rounded-xl border border-zinc-800 space-y-1">
              <div className="text-cyan-400 font-bold">3. Open in Android Studio or build directly with Gradle:</div>
              <code className="text-zinc-300 block bg-zinc-900 px-2 py-1 rounded">npx cap open android</code>
              <p className="text-[11px] text-zinc-400 mt-1">Or via terminal:</p>
              <code className="text-zinc-300 block bg-zinc-900 px-2 py-1 rounded">cd android && ./gradlew assembleDebug</code>
            </div>

            <div className="bg-black/70 p-3 rounded-xl border border-zinc-800 space-y-1">
              <div className="text-cyan-400 font-bold">4. Output APK location:</div>
              <code className="text-emerald-400 block bg-zinc-900 px-2 py-1 rounded">android/app/build/outputs/apk/debug/app-debug.apk</code>
            </div>
          </div>
        </div>
      )}

      {/* CODE STUDIO WORKSPACE */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[550px]">
        
        {/* FILE TREE SELECTOR (4 COLS) */}
        <div className="lg:col-span-4 bg-zinc-950 rounded-2xl border border-white/10 p-3 flex flex-col gap-2">
          <div className="px-3 py-2 flex items-center justify-between text-[11px] font-mono text-zinc-400 border-b border-white/10">
            <span className="flex items-center gap-1.5">
              <Folder className="w-3.5 h-3.5 text-cyan-400" />
              <span>Project Files ({ANDROID_PROJECT_FILES.length})</span>
            </span>
            <span className="text-[10px] text-cyan-400">Capacitor 8.5</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-1 pr-1 max-h-[550px]">
            {ANDROID_PROJECT_FILES.map((file, i) => {
              const fileName = file.path.split('/').pop();
              const isSelected = i === selectedFileIndex;
              const isCapacitorCore = file.path.includes('capacitor') || file.path.includes('workflows');
              return (
                <button
                  key={i}
                  onClick={() => setSelectedFileIndex(i)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-mono transition-all flex flex-col gap-0.5 cursor-pointer ${
                    isSelected
                      ? 'bg-cyan-950/60 text-white border border-cyan-500/50 shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'text-zinc-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-semibold truncate">
                      <FileCode className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-400' : isCapacitorCore ? 'text-emerald-400' : 'text-zinc-500'}`} />
                      <span className="truncate">{fileName}</span>
                    </div>
                    {isCapacitorCore && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 shrink-0">
                        CI / Cap
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-zinc-500 truncate pl-5">
                    {file.path}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* CODE PREVIEW & COPY VIEWER (8 COLS) */}
        <div className="lg:col-span-8 bg-zinc-950 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
          
          {/* File Tab Header */}
          <div className="bg-zinc-900/90 px-4 py-2.5 flex items-center justify-between border-b border-white/10 text-xs font-mono">
            <div className="flex items-center gap-2 truncate">
              <span className="text-cyan-400 font-bold">{currentFile.path}</span>
              <span className="text-zinc-500">•</span>
              <span className="text-zinc-400 text-[11px] truncate hidden md:inline">
                {currentFile.description}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs transition-colors cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-semibold">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Code Body */}
          <div className="flex-1 p-4 overflow-auto bg-black font-mono text-xs text-zinc-300 leading-relaxed max-h-[550px]">
            <pre>
              <code>{currentFile.content}</code>
            </pre>
          </div>

          {/* Footer Bar */}
          <div className="px-4 py-2 bg-zinc-900/60 border-t border-white/10 flex items-center justify-between text-[11px] font-mono text-zinc-500">
            <span>Language: {currentFile.language.toUpperCase()}</span>
            <span>Lines: {currentFile.content.split('\n').length}</span>
          </div>

        </div>

      </div>

    </div>
  );
};
