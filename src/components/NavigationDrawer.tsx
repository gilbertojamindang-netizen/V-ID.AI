import React from 'react';
import { 
  X, 
  Terminal, 
  Smartphone, 
  KeyRound, 
  ShieldAlert, 
  Code2, 
  Sliders, 
  Database, 
  FileCode2, 
  ExternalLink,
  Volume2,
  LogIn,
  LogOut,
  User as UserIcon,
  ShieldCheck
} from 'lucide-react';
import { ScreenId } from '../types';
import { useFirebaseAuth } from '../firebase/AuthContext';

interface NavigationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeScreen: ScreenId;
  onSelectScreen: (screen: ScreenId) => void;
  voicePersona: 'Charon' | 'Fenrir';
}

export const NavigationDrawer: React.FC<NavigationDrawerProps> = ({
  isOpen,
  onClose,
  activeScreen,
  onSelectScreen,
  voicePersona,
}) => {
  const { user, signInWithGoogle, signOutUser, loading: authLoading, authError } = useFirebaseAuth();

  if (!isOpen) return null;

  const menuItems: Array<{ id: ScreenId; label: string; icon: React.ReactNode; badge?: string; desc: string }> = [
    {
      id: 'home',
      label: 'Neural Chat Terminal',
      icon: <Terminal className="w-4 h-4 text-cyan-400" />,
      desc: 'Real-time text & voice conversation with VOID'
    },
    {
      id: 'automation',
      label: 'Screen Automation & Gestures',
      icon: <Smartphone className="w-4 h-4 text-emerald-400" />,
      badge: 'Core',
      desc: 'Read screen, click buttons, type text, system navigation'
    },
    {
      id: 'permissions',
      label: 'Android OS Permissions',
      icon: <ShieldAlert className="w-4 h-4 text-amber-400" />,
      badge: 'Required',
      desc: 'Mic, Camera, Accessibility, Always-on Foreground Service'
    },
    {
      id: 'apisettings',
      label: 'Gemini & Voice API Keys',
      icon: <KeyRound className="w-4 h-4 text-cyan-400" />,
      desc: 'Gemini & Voice Key storage, deep pitch, neural audio'
    },
    {
      id: 'codestudio',
      label: 'AI Code & Script Studio',
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
      desc: 'Autonomous script generator & sandbox runner'
    },
    {
      id: 'macros',
      label: 'Voice Macro Manager',
      icon: <Sliders className="w-4 h-4 text-pink-400" />,
      desc: 'Custom multi-step voice command sequences'
    },
    {
      id: 'androidsource',
      label: 'Android Project & APK Build',
      icon: <FileCode2 className="w-4 h-4 text-cyan-400" />,
      badge: 'ZIP Ready',
      desc: 'Capacitor Android source, Kotlin services, GitHub Actions'
    },
    {
      id: 'memory',
      label: 'Neural Context Memory',
      icon: <Database className="w-4 h-4 text-zinc-400" />,
      desc: 'Session telemetry, interaction cache, and memory dump'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity"
        onClick={onClose} 
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-xs sm:max-w-sm bg-[#08080c] border-r border-white/10 h-full flex flex-col justify-between p-5 text-white shadow-2xl">
        
        {/* Header */}
        <div>
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.4)]">
                <img 
                  src="/logo.jpg" 
                  alt="VØID.AI" 
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = '/src/assets/images/void_app_logo_1793162755394.jpg';
                  }}
                />
              </div>
              <div>
                <h2 className="text-lg font-bold font-display tracking-widest text-white">VØID.AI</h2>
                <div className="text-[10px] font-mono text-cyan-400">TACTICAL ANDROID SYSTEM</div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
              aria-label="Close Drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Items */}
          <nav className="mt-4 space-y-1.5 overflow-y-auto max-h-[calc(100vh-220px)] pr-1">
            {menuItems.map((item) => {
              const isActive = activeScreen === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectScreen(item.id);
                    onClose();
                  }}
                  className={`w-full p-3 rounded-xl text-left transition-all flex items-start gap-3 group cursor-pointer ${
                    isActive
                      ? 'bg-cyan-950/50 border border-cyan-400/80 text-white shadow-[0_0_15px_rgba(0,240,255,0.15)]'
                      : 'bg-black/30 border border-transparent hover:border-white/10 hover:bg-zinc-900/50 text-zinc-300'
                  }`}
                >
                  <div className={`mt-0.5 p-1.5 rounded-lg border ${
                    isActive ? 'bg-cyan-500/20 border-cyan-400' : 'bg-zinc-900 border-white/10 group-hover:border-cyan-400/40'
                  }`}>
                    {item.icon}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-mono font-bold truncate ${isActive ? 'text-cyan-300' : 'text-white'}`}>
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-700/60 ml-2">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] font-mono text-zinc-500 mt-0.5 line-clamp-1">
                      {item.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Firebase Authentication & User Profile Zone */}
        <div className="pt-3 border-t border-white/10 flex flex-col gap-2.5">
          {user ? (
            <div className="p-2.5 rounded-xl bg-zinc-950 border border-emerald-500/40 flex items-center justify-between gap-2 shadow-[0_0_12px_rgba(16,185,129,0.15)]">
              <div className="flex items-center gap-2.5 min-w-0">
                {user.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt={user.displayName || 'User'} 
                    className="w-8 h-8 rounded-full border border-emerald-400 object-cover shrink-0" 
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-950 border border-emerald-400 flex items-center justify-center shrink-0">
                    <UserIcon className="w-4 h-4 text-emerald-400" />
                  </div>
                )}
                <div className="min-w-0">
                  <div className="text-xs font-mono font-bold text-white truncate flex items-center gap-1">
                    <span>{user.displayName || 'Operative'}</span>
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  </div>
                  <div className="text-[10px] font-mono text-emerald-400/90 truncate flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>Firestore Synced</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={signOutUser}
                title="Sign Out"
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-red-950/60 border border-white/10 hover:border-red-500/40 text-zinc-400 hover:text-red-300 transition-all cursor-pointer shrink-0"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-1.5">
              <button
                type="button"
                onClick={signInWithGoogle}
                disabled={authLoading}
                className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-cyan-950 via-zinc-900 to-black hover:border-cyan-400/80 border border-white/20 text-xs font-mono font-bold text-cyan-300 hover:text-white flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.2)] cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>SIGN IN WITH GOOGLE</span>
              </button>
              <div className="text-[9px] font-mono text-zinc-500 text-center">
                Sync memory, macros & settings to Firebase
              </div>
            </div>
          )}

          {authError && (
            <div className="text-[10px] font-mono text-red-400 bg-red-950/40 p-1.5 rounded border border-red-500/30">
              {authError}
            </div>
          )}

          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1 border-t border-white/5">
            <span>Voice: <strong className="text-white">{voicePersona}</strong></span>
            <span className="text-cyan-400">Firebase v11 Connected</span>
          </div>
        </div>

      </aside>
    </div>
  );
};
