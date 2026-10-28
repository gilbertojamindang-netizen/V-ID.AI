import { useState } from 'react';
import { Download, CheckCircle2, Share, PlusSquare, Smartphone, X, Sparkles } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  variant?: 'compact' | 'full' | 'banner';
}

export function PWAInstallButton({ variant = 'compact' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, promptInstall } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  const handleInstallClick = async () => {
    const outcome = await promptInstall();
    if (outcome === 'accepted') {
      setJustInstalled(true);
    } else if (outcome === 'ios' || isIOS) {
      setShowIOSModal(true);
    } else if (outcome === 'unavailable') {
      // If prompt isn't directly triggered (e.g. desktop Chrome already visited or in iframe), show guidance modal
      setShowIOSModal(true);
    }
  };

  if (isInstalled || justInstalled) {
    if (variant === 'compact') {
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono tracking-wider">
          <CheckCircle2 className="w-3 h-3 text-emerald-400 animate-pulse" />
          <span>APP INSTALLED</span>
        </div>
      );
    }
    return (
      <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/30">
        <div className="flex items-center gap-3">
          <img src="/logo.jpg" alt="VØID.AI" className="w-8 h-8 rounded-lg border border-emerald-500/40 object-cover" />
          <div>
            <div className="text-xs font-mono font-bold text-white tracking-wider">VØID.AI APP INSTALLED</div>
            <div className="text-[10px] font-mono text-emerald-400">Running in Standalone OS Shell</div>
          </div>
        </div>
        <div className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">ACTIVE</div>
      </div>
    );
  }

  return (
    <>
      {variant === 'compact' && (
        <button
          onClick={handleInstallClick}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gradient-to-r from-cyan-500/20 via-blue-500/20 to-purple-500/20 border border-cyan-500/40 text-cyan-300 hover:text-white hover:border-cyan-400 hover:shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all text-[11px] font-mono tracking-wider group cursor-pointer"
          title="Install VØID.AI as App"
        >
          <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:scale-110 group-hover:animate-bounce transition-transform" />
          <span className="font-bold">INSTALL APP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
        </button>
      )}

      {variant === 'banner' && (
        <div className="relative overflow-hidden rounded-xl border border-cyan-500/40 bg-gradient-to-r from-zinc-950 via-zinc-900 to-black p-3.5 shadow-[0_0_25px_rgba(6,182,212,0.15)]">
          <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between gap-3 relative z-10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src="/logo.jpg"
                  alt="VØID.AI Logo"
                  className="w-10 h-10 rounded-xl border border-cyan-500/50 object-cover shadow-[0_0_12px_rgba(6,182,212,0.4)]"
                />
                <div className="absolute -bottom-1 -right-1 bg-cyan-500 text-black p-0.5 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-white tracking-widest">INSTALL VØID.AI</span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-mono">PWA & APK</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">
                  Launch full screen with zero browser bars & background wake
                </p>
              </div>
            </div>
            <button
              onClick={handleInstallClick}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>INSTALL</span>
            </button>
          </div>
        </div>
      )}

      {variant === 'full' && (
        <button
          onClick={handleInstallClick}
          className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-cyan-950/30 to-blue-950/20 border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-cyan-950/40 transition-all text-left group cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-black border border-cyan-500/40 flex items-center justify-center p-1 overflow-hidden shadow-[0_0_10px_rgba(6,182,212,0.3)]">
              <img src="/logo.jpg" alt="VØID.AI" className="w-full h-full object-cover rounded" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-white tracking-wide group-hover:text-cyan-300 transition-colors">
                INSTALL VØID.AI APP
              </div>
              <div className="text-[10px] font-mono text-zinc-400">
                Install to Home Screen / Desktop App
              </div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-[10px] font-mono group-hover:bg-cyan-500 group-hover:text-black transition-all">
            <Download className="w-3 h-3" />
            <span>INSTALL</span>
          </div>
        </button>
      )}

      {/* Guide Modal for iOS Safari or manual desktop installation */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
          <div className="w-full max-w-sm rounded-2xl bg-zinc-950 border border-cyan-500/40 p-5 shadow-[0_0_40px_rgba(6,182,212,0.25)] relative">
            <button
              onClick={() => setShowIOSModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <img
                src="/logo.jpg"
                alt="VØID.AI"
                className="w-12 h-12 rounded-xl border border-cyan-500/50 object-cover shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              />
              <div>
                <h3 className="text-base font-bold text-white tracking-wider font-mono">INSTALL VØID.AI</h3>
                <p className="text-xs text-cyan-400 font-mono">STANDALONE APP SETUP</p>
              </div>
            </div>

            <div className="space-y-3 font-mono text-xs text-zinc-300">
              <p className="text-zinc-400 leading-relaxed text-[11px]">
                To install VØID.AI as a standalone mobile or desktop application with offline caching and background service capabilities:
              </p>

              <div className="space-y-2.5 bg-black/60 rounded-xl p-3 border border-zinc-800">
                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <span className="text-white font-medium">On Chrome / Edge:</span>
                    <p className="text-[10px] text-zinc-400">Click the install icon (🖥️ or ⬇️) in the address bar or browser menu.</p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <span className="text-white font-medium">On iOS (Safari):</span>
                    <p className="text-[10px] text-zinc-400">
                      Tap the <Share className="inline w-3 h-3 text-cyan-400 mx-0.5" /> <strong>Share</strong> button, then select{' '}
                      <PlusSquare className="inline w-3 h-3 text-cyan-400 mx-0.5" /> <strong>Add to Home Screen</strong>.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <span className="text-white font-medium">Native Android APK:</span>
                    <p className="text-[10px] text-zinc-400">
                      Open Drawer Menu &gt; <strong>Android Project & APK</strong> to download the full Jetpack Compose project files.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => setShowIOSModal(false)}
                className="w-full py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-[0_0_15px_rgba(6,182,212,0.4)] transition-all cursor-pointer text-center"
              >
                GOT IT
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
