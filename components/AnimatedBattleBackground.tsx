import React from 'react';

interface AnimatedBattleBackgroundProps {
  theme?: 'versus' | 'multiplayer';
}

export const AnimatedBattleBackground: React.FC<AnimatedBattleBackgroundProps> = ({ theme = 'versus' }) => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 bg-neutral-950">
      {/* Dynamic Ambient Color Halos */}
      <div 
        className="absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 animate-pulse pointer-events-none"
        style={{ background: 'radial-gradient(circle, #06b6d4 0%, #3b82f6 50%, transparent 70%)' }}
      />
      <div 
        className="absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40 animate-pulse pointer-events-none"
        style={{ 
          background: theme === 'versus' 
            ? 'radial-gradient(circle, #ef4444 0%, #dc2626 50%, transparent 70%)' 
            : 'radial-gradient(circle, #8b5cf6 0%, #6366f1 50%, transparent 70%)',
          animationDelay: '1s'
        }}
      />
      
      {/* Perspective Scrolling Grid */}
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      {/* Cyber Diagonal Energy Streaks */}
      <div className="absolute inset-0 opacity-25 overflow-hidden">
        <div 
          className="absolute -inset-[100%] w-[300%] h-[300%] opacity-30"
          style={{
            backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(6, 182, 212, 0.2) 40px, rgba(6, 182, 212, 0.2) 42px)',
            animation: 'streakMove 20s linear infinite'
          }}
        />
        <div 
          className="absolute -inset-[100%] w-[300%] h-[300%] opacity-20"
          style={{
            backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 60px, rgba(239, 68, 68, 0.2) 60px, rgba(239, 68, 68, 0.2) 62px)',
            animation: 'streakMoveReverse 25s linear infinite'
          }}
        />
      </div>

      {/* Dynamic Center Energy Clash Pillar */}
      <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-transparent via-yellow-400/40 to-transparent shadow-[0_0_50px_rgba(250,204,21,0.5)] transform -skew-x-12" />

      {/* Floating Sparkles & Digital Motes */}
      <div className="absolute inset-0">
        {[...Array(16)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full pointer-events-none"
            style={{
              width: `${(i % 3) + 2}px`,
              height: `${(i % 3) + 2}px`,
              left: `${(i * 17) % 96}%`,
              top: `${(i * 23) % 94}%`,
              backgroundColor: i % 2 === 0 ? '#38bdf8' : '#f87171',
              boxShadow: `0 0 12px ${i % 2 === 0 ? '#38bdf8' : '#f87171'}`,
              animation: `floatSparkle ${3 + (i % 4)}s ease-in-out infinite alternate`,
              animationDelay: `${(i * 0.4)}s`,
              opacity: 0.6
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes streakMove {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(200px) translateX(200px); }
        }
        @keyframes streakMoveReverse {
          0% { transform: translateY(0) translateX(0); }
          100% { transform: translateY(-200px) translateX(-200px); }
        }
        @keyframes floatSparkle {
          0% { transform: translateY(0) scale(0.8); opacity: 0.3; }
          50% { transform: translateY(-30px) scale(1.4); opacity: 0.9; }
          100% { transform: translateY(-60px) scale(0.8); opacity: 0.2; }
        }
      `}</style>
    </div>
  );
};
