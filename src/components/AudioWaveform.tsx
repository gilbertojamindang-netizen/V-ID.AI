import React, { useEffect, useState } from 'react';

interface AudioWaveformProps {
  isActive?: boolean;
  isListening?: boolean;
  isSpeaking: boolean;
  barCount?: number;
}

export const AudioWaveform: React.FC<AudioWaveformProps> = ({
  isActive,
  isListening,
  isSpeaking,
  barCount = 32,
}) => {
  const effectiveActive = isActive || isListening || false;
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 8)
  );

  useEffect(() => {
    let animationFrameId: number;
    let tick = 0;

    const updateWave = () => {
      tick += 0.18;
      setHeights(
        Array.from({ length: barCount }, (_, i) => {
          if (isSpeaking) {
            // High dynamic range voice output waveform
            const wave1 = Math.sin(tick * 2 + i * 0.45);
            const wave2 = Math.cos(tick * 3.2 - i * 0.3);
            const raw = Math.abs(wave1 * 0.6 + wave2 * 0.5);
            return Math.max(6, Math.min(48, Math.floor(raw * 44 + 6)));
          } else if (effectiveActive) {
            // Listening mode active ambient ripple
            const centerDist = Math.abs(i - barCount / 2) / (barCount / 2);
            const base = Math.sin(tick * 2.5 + i * 0.35) * (1 - centerDist * 0.5);
            return Math.max(6, Math.min(36, Math.floor(Math.abs(base) * 30 + 8)));
          } else {
            // Idle subtle resting rhythm
            const idle = Math.sin(tick * 0.8 + i * 0.2);
            return Math.max(4, Math.floor(Math.abs(idle) * 10 + 4));
          }
        })
      );

      animationFrameId = requestAnimationFrame(updateWave);
    };

    animationFrameId = requestAnimationFrame(updateWave);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isActive, isSpeaking, barCount]);

  return (
    <div className="w-full flex items-center justify-center gap-[3px] h-12 px-4 select-none">
      {heights.map((h, i) => {
        const isCenter = Math.abs(i - barCount / 2) < barCount / 4;
        return (
          <div
            key={i}
            className={`w-[3px] rounded-full transition-all duration-75 ${
              isSpeaking
                ? 'bg-gradient-to-t from-cyan-500 to-white shadow-[0_0_8px_rgba(0,240,255,0.7)]'
                : isActive
                ? isCenter
                  ? 'bg-white shadow-[0_0_6px_rgba(255,255,255,0.8)]'
                  : 'bg-cyan-400/80 shadow-[0_0_4px_rgba(0,240,255,0.4)]'
                : 'bg-zinc-800'
            }`}
            style={{
              height: `${h}px`,
              opacity: isActive || isSpeaking ? 0.95 : 0.35,
            }}
          />
        );
      })}
    </div>
  );
};
