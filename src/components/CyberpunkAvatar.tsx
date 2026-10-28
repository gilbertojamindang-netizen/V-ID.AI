import React from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface CyberpunkAvatarProps {
  isListening: boolean;
  isSpeaking: boolean;
  size?: number;
  imageUrl?: string;
  onChangeClick?: () => void;
}

export const CyberpunkAvatar: React.FC<CyberpunkAvatarProps> = ({
  isListening,
  isSpeaking,
  size = 280,
  imageUrl = '/avatar.jpg',
  onChangeClick,
}) => {
  return (
    <div
      className="relative flex items-center justify-center select-none group"
      style={{ width: size, height: size }}
    >
      {/* Outer ambient glow */}
      <div
        className={`absolute inset-0 rounded-full transition-opacity duration-700 pointer-events-none ${
          isSpeaking
            ? 'opacity-85 bg-cyan-500/25 blur-2xl'
            : isListening
            ? 'opacity-75 bg-white/20 blur-xl'
            : 'opacity-35 bg-cyan-950/30 blur-lg'
        }`}
      />

      {/* Outer Concentric Glowing Rings (SVG Layer) */}
      <svg
        className={`absolute inset-0 w-full h-full pointer-events-none ${
          isListening ? 'animate-ring-rotate-cw' : 'animate-ring-rotate-cw'
        }`}
        viewBox="0 0 300 300"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outermost Ring 1 */}
        <circle
          cx="150"
          cy="150"
          r="142"
          stroke="#FFFFFF"
          strokeWidth="1.2"
          strokeOpacity="0.85"
          className="transition-all duration-300"
          style={{ filter: 'drop-shadow(0 0 6px rgba(255, 255, 255, 0.7))' }}
        />

        {/* Tactical Tick Marks on Ring 1 */}
        {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => {
          const rad = (angle * Math.PI) / 180;
          const x1 = 150 + 138 * Math.cos(rad);
          const y1 = 150 + 138 * Math.sin(rad);
          const x2 = 150 + 146 * Math.cos(rad);
          const y2 = 150 + 146 * Math.sin(rad);
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#00F0FF"
              strokeWidth="2"
              strokeOpacity="0.9"
            />
          );
        })}

        {/* Ring 2 (Dashed Tactical Orbit) */}
        <circle
          cx="150"
          cy="150"
          r="126"
          stroke="#00F0FF"
          strokeWidth="1.2"
          strokeDasharray="6 14"
          strokeOpacity="0.6"
          style={{ filter: 'drop-shadow(0 0 4px rgba(0, 240, 255, 0.5))' }}
        />

        {/* Ring 3 (Inner Glowing White Orbit) */}
        <circle
          cx="150"
          cy="150"
          r="110"
          stroke="#FFFFFF"
          strokeWidth="1"
          strokeOpacity="0.75"
          style={{ filter: 'drop-shadow(0 0 5px rgba(255, 255, 255, 0.6))' }}
        />

        {/* Ring 4 (Fine Sub-Orbital Ring) */}
        <circle
          cx="150"
          cy="150"
          r="98"
          stroke="#00F0FF"
          strokeWidth="0.8"
          strokeDasharray="2 8"
          strokeOpacity="0.4"
        />
      </svg>

      {/* Reverse counter-rotating accent ring */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none animate-ring-rotate-ccw"
        viewBox="0 0 300 300"
        fill="none"
      >
        <circle
          cx="150"
          cy="150"
          r="134"
          stroke="rgba(255, 255, 255, 0.4)"
          strokeWidth="1"
          strokeDasharray="18 42"
        />
      </svg>

      {/* Central Portrait Container */}
      <div
        className={`relative z-10 w-[184px] h-[184px] rounded-full overflow-hidden border border-white/30 bg-black flex items-center justify-center transition-all duration-500 shadow-2xl ${
          isSpeaking
            ? 'scale-105 border-cyan-400 shadow-[0_0_35px_rgba(0,240,255,0.45)]'
            : isListening
            ? 'scale-102 border-white shadow-[0_0_30px_rgba(255,255,255,0.4)]'
            : 'border-white/20 shadow-[0_0_20px_rgba(0,0,0,0.8)]'
        }`}
      >
        {/* Tactical AI Portrait Image */}
        <img
          src={imageUrl}
          alt="VOID.AI Tactical AI Face"
          className="w-full h-full object-cover object-center filter contrast-110 brightness-105"
          referrerPolicy="no-referrer"
          onError={(e) => {
            // Fallback to local image asset if url fails
            (e.currentTarget as HTMLImageElement).src = '/src/assets/images/void_ai_avatar_1793160475276.jpg';
          }}
        />

        {/* Subtly animated overlay lens when active */}
        <div
          className={`absolute inset-0 transition-opacity duration-300 pointer-events-none ${
            isSpeaking
              ? 'opacity-30 bg-gradient-to-t from-cyan-500/40 via-transparent to-transparent'
              : isListening
              ? 'opacity-25 bg-gradient-to-b from-white/20 via-transparent to-cyan-500/20'
              : 'opacity-0'
          }`}
        />

        {/* High-tech ocular focal indicator when speaking */}
        {isSpeaking && (
          <div className="absolute top-[32%] left-[45%] w-3 h-1 bg-cyan-300/80 rounded-full blur-[1px] animate-pulse" />
        )}

        {/* Hover / Tap Overlay to Change or Upload Custom Image */}
        {onChangeClick && (
          <button
            onClick={onChangeClick}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-200 cursor-pointer"
            title="Customize Tactical Avatar Image"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-300 shadow-[0_0_10px_rgba(0,240,255,0.5)]">
              <Camera className="w-4 h-4" />
            </div>
            <span className="text-[10px] font-mono font-bold tracking-widest text-cyan-300 uppercase">
              CHANGE AVATAR
            </span>
          </button>
        )}
      </div>

      {/* Floating Tactical Data Badges */}
      <div className="absolute -bottom-2 z-20 px-3 py-1 rounded-full bg-black/90 border border-cyan-400/60 shadow-[0_0_12px_rgba(0,240,255,0.3)] flex items-center gap-2 text-[10px] font-mono tracking-widest">
        <span className={`w-1.5 h-1.5 rounded-full ${isSpeaking ? 'bg-cyan-400 animate-ping' : isListening ? 'bg-white animate-pulse' : 'bg-zinc-600'}`} />
        <span className="text-white font-semibold">
          {isSpeaking ? 'NEURAL BROADCAST' : isListening ? 'ACOUSTIC RECEPTOR' : 'VOID STANDBY'}
        </span>
      </div>
    </div>
  );
};
