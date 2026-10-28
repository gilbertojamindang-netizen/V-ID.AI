import React, { useState, useRef } from 'react';
import { X, Upload, Check, Image as ImageIcon, Sparkles, Link, RefreshCcw } from 'lucide-react';

interface ChangeAvatarModalProps {
  isOpen: boolean;
  currentImageUrl?: string;
  currentAvatarUrl?: string;
  onSelectImage?: (url: string) => void;
  onSelectAvatar?: (url: string) => void;
  onClose: () => void;
}

export const PRESET_AVATARS = [
  {
    id: 'ai_avatar',
    name: 'VØID AI Core (Default)',
    desc: 'Tactical cybernetic high-collar armor with facial telemetry circuits and glowing cyan eyes.',
    url: '/avatar.jpg'
  },
  {
    id: 'hooded_cyborg',
    name: 'Hooded Shadow Cyborg',
    desc: 'Mysterious hooded figure with deep cowl shadows, intense glowing eyes, and carbon armor.',
    url: '/src/assets/images/void_hooded_cyborg_1793161662943.jpg'
  },
  {
    id: 'stealth_operative',
    name: 'Stealth Tactical Operative',
    desc: 'Tactical faceplate mask with glowing ocular targeting reticle and stealth collar.',
    url: '/src/assets/images/void_stealth_operative_1793161676104.jpg'
  }
];

export const ChangeAvatarModal: React.FC<ChangeAvatarModalProps> = ({
  isOpen,
  currentImageUrl,
  currentAvatarUrl,
  onSelectImage,
  onSelectAvatar,
  onClose,
}) => {
  const activeUrl = currentAvatarUrl || currentImageUrl || '/avatar.jpg';
  const handleSelect = (url: string) => {
    if (onSelectAvatar) onSelectAvatar(url);
    if (onSelectImage) onSelectImage(url);
    onClose();
  };
  const [urlInput, setUrlInput] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMsg('Please select a valid image file (PNG, JPG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (dataUrl) {
        handleSelect(dataUrl);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    handleSelect(urlInput.trim());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn select-none">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/85 backdrop-blur-md transition-opacity" 
        onClick={onClose} 
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-lg bg-[#08080a] border border-white/20 rounded-2xl shadow-2xl p-6 z-10 flex flex-col gap-5 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-white/20 flex items-center justify-center">
              <ImageIcon className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold font-display text-white tracking-wide">
                CHANGE VOID.AI AVATAR
              </h2>
              <p className="text-[11px] font-mono text-zinc-400">
                Choose a dark cyberpunk preset or upload your own custom image
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SECTION 1: UPLOAD YOUR OWN IMAGE (Direct file picker) */}
        <div className="p-4 rounded-xl bg-zinc-950 border border-white/15 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold font-mono text-white flex items-center gap-2">
              <Upload className="w-3.5 h-3.5 text-cyan-400" />
              Upload Your Own Image File
            </span>
            <span className="text-[10px] font-mono text-zinc-500">PNG, JPG, WEBP</span>
          </div>

          <p className="text-[11px] text-zinc-400 font-sans leading-relaxed">
            Have an image you want to use? Upload it directly from your phone or PC to immediately replace the figure in the center circular HUD.
          </p>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          >
            <Upload className="w-4 h-4" />
            <span>SELECT IMAGE FROM DEVICE</span>
          </button>
        </div>

        {/* SECTION 2: CURATED CYBERPUNK PRESETS */}
        <div>
          <div className="text-[10px] font-mono tracking-widest text-zinc-400 uppercase mb-2">
            Curated Dark Cyberpunk Figures:
          </div>

          <div className="grid grid-cols-1 gap-2.5 max-h-56 overflow-y-auto pr-1">
            {PRESET_AVATARS.map((preset) => {
              const isSelected = activeUrl === preset.url;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleSelect(preset.url)}
                  className={`w-full p-2.5 rounded-xl border flex items-center gap-3 text-left transition-all ${
                    isSelected
                      ? 'bg-cyan-950/40 border-cyan-400 text-white shadow-[0_0_12px_rgba(0,240,255,0.15)]'
                      : 'bg-zinc-950/80 border-white/10 hover:border-white/20 text-zinc-300'
                  }`}
                >
                  <img
                    src={preset.url}
                    alt={preset.name}
                    className="w-12 h-12 rounded-full object-cover border border-white/20 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-mono text-white truncate">
                        {preset.name}
                      </span>
                      {isSelected && (
                        <Check className="w-4 h-4 text-cyan-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-zinc-400 font-sans line-clamp-1 mt-0.5">
                      {preset.desc}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: IMAGE URL INPUT */}
        <form onSubmit={handleApplyUrl} className="flex gap-2 pt-1 border-t border-white/10">
          <input
            type="url"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste an image URL..."
            className="flex-1 bg-black border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white font-mono placeholder:text-zinc-600 focus:border-cyan-400 focus:outline-none"
          />
          <button
            type="submit"
            disabled={!urlInput.trim()}
            className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-white/15 hover:border-cyan-400 text-xs font-mono font-bold text-zinc-300 hover:text-white transition-all disabled:opacity-40"
          >
            Apply
          </button>
        </form>

      </div>
    </div>
  );
};
