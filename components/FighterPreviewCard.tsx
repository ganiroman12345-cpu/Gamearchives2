import React from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows, PerspectiveCamera } from '@react-three/drei';
import { Fighter3D } from './Fighter3D';
import { ActionType, ModelType } from '../types';
import { playFighterSelectSound } from '../utils/audio';

interface Character {
  id: string;
  name: string;
  color: string;
  subColor: string;
  modelType: string;
  description: string;
}

interface FighterPreviewCardProps {
  character: Character;
  isSelected: boolean;
  onSelect: () => void;
}

const noEvents = () => ({
  enabled: false,
  priority: 0,
  compute: () => {},
  connect: () => {},
  disconnect: () => {},
});

export const FighterPreviewCard: React.FC<FighterPreviewCardProps> = ({ character, isSelected, onSelect }) => {
  const previewState = {
    name: character.name,
    modelType: (character.modelType as ModelType) || 'HUMAN',
    color: character.color,
    subColor: character.subColor,
    action: ActionType.IDLE,
    direction: 1 as const,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100
  };

  return (
    <button
      id={`fighter-preview-btn-${character.id}`}
      onClick={() => {
        playFighterSelectSound();
        onSelect();
      }}
      className={`w-28 sm:w-32 md:w-36 h-48 md:h-56 bg-slate-950/90 border-2 rounded-xl flex flex-col items-center justify-between p-1.5 relative group overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95 ${
        isSelected 
          ? 'border-yellow-400 shadow-[0_0_25px_rgba(250,204,21,0.9)] bg-slate-900 z-10 scale-105 ring-2 ring-yellow-400' 
          : 'border-slate-800 hover:border-cyan-400 hover:shadow-[0_0_20px_rgba(6,182,212,0.6)] z-0'
      }`}
      style={{
        borderColor: isSelected ? '#facc15' : undefined
      }}
    >
      {/* Background glow corresponding to character color */}
      <div 
        className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity duration-300 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 50% 30%, ${character.color} 0%, transparent 75%)`
        }}
      />

      {/* 3D Full-Body Canvas Viewport */}
      <div 
        id={`fighter-preview-canvas-container-${character.id}`} 
        className="w-full flex-1 relative z-10 overflow-hidden bg-black/40 rounded-lg flex items-center justify-center border border-white/5"
      >
        <Canvas 
          dpr={1} 
          gl={{ powerPreference: 'high-performance', antialias: false, precision: 'mediump' }} 
          shadows 
          events={noEvents} 
          className="w-full h-full"
        >
          <PerspectiveCamera makeDefault position={[0, 0.35, 2.3]} fov={38} />
          <ambientLight intensity={1.1} />
          <directionalLight position={[3, 5, 3]} intensity={1.8} />
          <directionalLight position={[-3, 2, -2]} intensity={0.8} color={character.color} />
          
          <group position={[0, -0.65, 0]}>
            <Fighter3D who="preview" previewState={previewState} />
          </group>

          <ContactShadows position={[0, -0.7, 0]} opacity={0.7} scale={3.5} blur={2} far={2} color="#000000" />
        </Canvas>
      </div>

      {/* Character Label block */}
      <div id={`fighter-preview-info-${character.id}`} className="relative z-10 w-full text-center flex flex-col justify-center pt-1.5 pb-0.5">
        <div className="text-xs sm:text-sm font-black text-white italic uppercase tracking-wider leading-tight truncate drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
          {character.name}
        </div>
        <div 
          className="text-[9px] font-mono font-bold uppercase tracking-widest mt-0.5"
          style={{ color: character.color }}
        >
          {character.modelType === 'FOX' ? 'STRIKER' : 'BRUISER'}
        </div>
      </div>
    </button>
  );
};
