import React, { useEffect, useState, useRef } from 'react';
import { useGameStore } from '../store';
import { GameState, ActionType } from '../types';
import { motion } from 'motion/react';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { Fighter3D } from './Fighter3D';
import { AnimatedBattleBackground } from './AnimatedBattleBackground';
import { playLaserSound, announceRound, announceFight } from '../utils/audio';

const noEvents = () => ({
  enabled: false,
  priority: 0,
  compute: () => {},
  connect: () => {},
  disconnect: () => {},
});

export const VSScreen: React.FC = () => {
  const player = useGameStore(s => s.player);
  const enemy = useGameStore(s => s.enemy);
  const currentRound = useGameStore(s => s.currentRound);
  const setGameState = useGameStore(s => s.setGameState);
  const updateFighter = useGameStore(s => s.updateFighter);
  const setIntroText = useGameStore(s => s.setIntroText);

  const [countdown, setCountdown] = useState(3);
  const [isExiting, setIsExiting] = useState(false);
  const hasTriggeredFightRef = useRef(false);

  const startFightNow = () => {
    if (hasTriggeredFightRef.current) return;
    hasTriggeredFightRef.current = true;
    setIsExiting(true);

    updateFighter('player', { action: ActionType.IDLE, hp: 100, maxHp: 100, y: 0, velocityY: 0, velocityX: 0 });
    updateFighter('enemy', { action: ActionType.IDLE, hp: 100, maxHp: 100, y: 0, velocityY: 0, velocityX: 0 });

    setTimeout(() => {
      setGameState(GameState.FIGHTING);
      announceRound(currentRound || 1);
      setTimeout(() => {
        announceFight();
        setIntroText('¡PELEAN!');
      }, 900);
    }, 350);
  };

  useEffect(() => {
    try {
      playLaserSound();
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      startFightNow();
      return;
    }

    const timer = setTimeout(() => {
      setCountdown((prev) => prev - 1);
    }, 850);

    return () => clearTimeout(timer);
  }, [countdown]);

  const playerPreviewState = {
    name: player.name,
    modelType: player.modelType,
    color: player.color,
    subColor: player.subColor,
    action: ActionType.IDLE,
    direction: 1 as const,
    hp: player.hp,
    maxHp: player.maxHp,
    energy: player.energy,
    maxEnergy: player.maxEnergy
  };

  const enemyPreviewState = {
    name: enemy.name,
    modelType: enemy.modelType,
    color: enemy.color,
    subColor: enemy.subColor,
    action: ActionType.IDLE,
    direction: -1 as const,
    hp: enemy.hp,
    maxHp: enemy.maxHp,
    energy: enemy.energy,
    maxEnergy: enemy.maxEnergy
  };

  return (
    <div 
      id="vs-screen-container" 
      onClick={startFightNow}
      className="absolute inset-0 z-50 flex flex-col justify-between bg-black text-white select-none overflow-hidden font-sans cursor-pointer"
    >
      {/* Dynamic Animated Battle Background */}
      <AnimatedBattleBackground theme="versus" />

      {/* Screen Entrance / Exit Flash */}
      <motion.div
        initial={{ opacity: 0.9 }}
        animate={{ opacity: isExiting ? 0.9 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-black pointer-events-none z-50"
      />

      {/* Main VS Side-by-Side Layout */}
      <div className="relative z-20 w-full max-w-6xl mx-auto flex-1 flex flex-row justify-center items-center gap-2 sm:gap-6 md:gap-8 px-2 sm:px-4 py-2">
        
        {/* PLAYER 1 (Left of VS) */}
        <motion.div 
          initial={{ x: -160, opacity: 0 }}
          animate={isExiting ? { x: -250, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm flex flex-col items-center p-2.5 sm:p-4 rounded-2xl bg-slate-950/85 border-2 border-cyan-500/70 shadow-[0_0_35px_rgba(6,182,212,0.3)] backdrop-blur-sm"
          style={{ borderColor: player.color || '#38bdf8' }}
        >
          {/* 3D Fighter Avatar */}
          <div className="w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-xl bg-slate-900/90 overflow-hidden relative border border-white/10 shadow-inner">
            <Canvas 
              shadows 
              events={noEvents}
              dpr={1}
              gl={{ powerPreference: 'high-performance', antialias: false, precision: 'mediump' }}
              className="w-full h-full"
            >
              <PerspectiveCamera makeDefault position={[0, 0.35, 2.3]} fov={38} />
              <ambientLight intensity={1.4} />
              <directionalLight position={[3, 5, 3]} intensity={1.8} />
              <directionalLight position={[-3, 2, -2]} intensity={0.8} color={player.color || '#00ffff'} />
              
              <group position={[0, -0.65, 0]}>
                <Fighter3D who="preview" previewState={playerPreviewState} />
              </group>
              
              <ContactShadows position={[0, -0.7, 0]} opacity={0.7} scale={3.8} blur={2} far={2} color="#000000" />
            </Canvas>
          </div>

          {/* Name & Archetype */}
          <div className="mt-2 sm:mt-3 text-center w-full">
            <h2 className="text-base sm:text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white truncate">
              {player.name}
            </h2>
            <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mt-0.5" style={{ color: player.color || '#38bdf8' }}>
              {player.modelType === 'FOX' ? 'STRIKER' : 'TITAN'}
            </p>
          </div>
        </motion.div>

        {/* CENTER VS & COUNTDOWN */}
        <div className="flex flex-col items-center justify-center shrink-0 z-30 px-1">
          <motion.div 
            initial={{ scale: 0.3 }}
            animate={isExiting ? { scale: 2.5, opacity: 0 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 14 }}
            className="w-12 h-12 sm:w-20 sm:h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-yellow-400 via-amber-500 to-yellow-600 flex items-center justify-center border-2 sm:border-4 border-black shadow-[0_0_40px_rgba(250,204,21,0.8)]"
          >
            <span className="text-black font-black text-xl sm:text-3xl md:text-4xl italic tracking-tighter">
              VS
            </span>
          </motion.div>

          <div className="mt-2 sm:mt-3 text-xl sm:text-3xl font-black text-yellow-300 font-mono tracking-wider drop-shadow-md">
            {countdown > 0 ? countdown : '¡LUCHA!'}
          </div>
        </div>

        {/* PLAYER 2 / ENEMY (Right of VS) */}
        <motion.div 
          initial={{ x: 160, opacity: 0 }}
          animate={isExiting ? { x: 250, opacity: 0 } : { x: 0, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 220, damping: 24 }}
          className="flex-1 max-w-[200px] sm:max-w-xs md:max-w-sm flex flex-col items-center p-2.5 sm:p-4 rounded-2xl bg-slate-950/85 border-2 border-red-500/70 shadow-[0_0_35px_rgba(239,68,68,0.3)] backdrop-blur-sm"
          style={{ borderColor: enemy.color || '#ef4444' }}
        >
          {/* 3D Fighter Avatar */}
          <div className="w-24 h-24 sm:w-40 sm:h-40 md:w-48 md:h-48 aspect-square rounded-xl bg-slate-900/90 overflow-hidden relative border border-white/10 shadow-inner">
            <Canvas 
              shadows 
              events={noEvents}
              dpr={1}
              gl={{ powerPreference: 'high-performance', antialias: false, precision: 'mediump' }}
              className="w-full h-full"
            >
              <PerspectiveCamera makeDefault position={[0, 0.35, 2.3]} fov={38} />
              <ambientLight intensity={1.4} />
              <directionalLight position={[-3, 5, 3]} intensity={1.8} />
              <directionalLight position={[3, 2, -2]} intensity={0.8} color={enemy.color || '#ff0055'} />
              
              <group position={[0, -0.65, 0]}>
                <Fighter3D who="preview" previewState={enemyPreviewState} />
              </group>
              
              <ContactShadows position={[0, -0.7, 0]} opacity={0.7} scale={3.8} blur={2} far={2} color="#000000" />
            </Canvas>
          </div>

          {/* Name & Archetype */}
          <div className="mt-2 sm:mt-3 text-center w-full">
            <h2 className="text-base sm:text-2xl md:text-3xl font-black italic tracking-tighter uppercase text-white truncate">
              {enemy.name}
            </h2>
            <p className="text-[10px] sm:text-xs font-mono font-bold tracking-widest text-red-400 uppercase mt-0.5" style={{ color: enemy.color || '#ef4444' }}>
              {enemy.modelType === 'FOX' ? 'STRIKER' : 'TITAN'}
            </p>
          </div>
        </motion.div>

      </div>

      {/* Footer */}
      <div className="w-full py-3 bg-gradient-to-t from-black/90 to-transparent flex justify-center items-center z-30">
        <span className="text-[11px] text-gray-400 font-mono tracking-widest uppercase animate-pulse">
          [ TOCA LA PANTALLA PARA COMENZAR ]
        </span>
      </div>
    </div>
  );
};

