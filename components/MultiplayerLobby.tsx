import React from 'react';
import { useGameStore } from '../store';
import { GameState } from '../types';
import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, ContactShadows } from '@react-three/drei';
import { AnimatedDropFighter3D } from './AnimatedDropFighter3D';
import { AnimatedBattleBackground } from './AnimatedBattleBackground';
import { motion } from 'motion/react';
import { Wifi, Users, Loader2, Sparkles, Zap, Music } from 'lucide-react';
import { playMenuClickSound } from '../utils/audio';

const noEvents = () => ({
  enabled: false,
  priority: 0,
  compute: () => {},
  connect: () => {},
  disconnect: () => {},
});

export const MultiplayerLobby: React.FC = () => {
  const player = useGameStore(s => s.player);
  const setGameState = useGameStore(s => s.setGameState);
  const setGameMode = useGameStore(s => s.setGameMode);

  return (
    <div id="multiplayer-lobby-container" className="absolute inset-0 z-50 flex flex-col justify-between bg-black text-white select-none overflow-hidden font-sans">
      {/* Animated Battle Background */}
      <AnimatedBattleBackground theme="multiplayer" />

      {/* Top Header */}
      <div className="w-full flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-4 bg-gradient-to-b from-black/90 via-black/60 to-transparent z-20 gap-2">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold uppercase tracking-widest animate-pulse">
          <Wifi className="w-4 h-4 text-cyan-400" /> SALA DE ESPERA MULTIJUGADOR
        </div>

        <div className="text-center">
          <h1 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 transform -skew-x-6">
            BUSCANDO OPONENTE EN LÍNEA
          </h1>
          <p className="text-[10px] md:text-xs text-gray-400 font-mono tracking-wider uppercase mt-0.5">
            SALA PÚBLICA #NET-9042 • LATENCIA: 28ms • BUSCANDO JUGADOR 2
          </p>
        </div>

        <div className="flex items-center gap-2 bg-green-500/20 border border-green-500 text-green-400 text-xs font-mono font-bold px-3 py-1 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" /> CONECTADO
        </div>
      </div>

      {/* Main Matchmaking Arena (VS Style with Large Square Cards) */}
      <div className="relative z-10 w-full max-w-6xl mx-auto flex-1 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 px-6 py-2">
        
        {/* PLAYER 1 (YOU) - LARGE SQUARE CONTAINER */}
        <motion.div 
          initial={{ x: -120, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.1 }}
          className="flex flex-col items-center"
        >
          {/* Header Tag */}
          <div className="flex items-center gap-2 mb-2 px-4 py-1 rounded-full bg-cyan-500/20 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <Zap className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[10px] md:text-xs font-mono font-black text-cyan-300 uppercase tracking-widest">TÚ (JUGADOR 1)</span>
          </div>

          {/* Large Square Viewport */}
          <div 
            className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 aspect-square rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-black border-4 border-cyan-400 shadow-[0_0_40px_rgba(6,182,212,0.5)] overflow-hidden relative group"
            style={{ borderColor: player.color || '#38bdf8' }}
          >
            {/* Background energy radial glow */}
            <div 
              className="absolute inset-0 opacity-30 pointer-events-none"
              style={{ background: `radial-gradient(circle at center, ${player.color || '#38bdf8'} 0%, transparent 75%)` }}
            />

            {/* 3D Falling, Spinning, Bouncing, Standing Fighter */}
            <Canvas 
              shadows 
              events={noEvents}
              dpr={1}
              gl={{ powerPreference: 'high-performance', antialias: false, precision: 'mediump' }}
              className="w-full h-full"
            >
              <PerspectiveCamera makeDefault position={[0, 0.35, 2.2]} fov={38} />
              <ambientLight intensity={1.0} />
              <directionalLight position={[4, 6, 4]} intensity={2.0} castShadow />
              <directionalLight position={[-4, 3, -2]} intensity={1.0} color={player.color || '#00ffff'} />
              
              <AnimatedDropFighter3D who="player" delay={0.1} flipDirection={1} />
              
              <ContactShadows position={[0, -0.7, 0]} opacity={0.8} scale={4.5} blur={2} far={2.5} color="#000000" />
            </Canvas>

            {/* Ready Badge overlay */}
            <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2 px-3 py-1 rounded-full bg-cyan-500/80 text-black font-black text-[10px] uppercase tracking-widest shadow-lg">
              ✓ LISTO PARA LUCHAR
            </div>

            {/* Corner Tech Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-cyan-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-cyan-400 pointer-events-none" />
          </div>

          {/* Name & Title */}
          <div className="mt-3 text-center">
            <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-white drop-shadow-[0_2px_10px_rgba(6,182,212,0.8)] transform skew-x-[-6deg]">
              {player.name}
            </h2>
            <div className="text-xs font-mono text-cyan-400 tracking-widest uppercase mt-0.5">
              {player.modelType === 'FOX' ? 'STRIKER • SPEED CLASS' : 'BRUISER • HEAVY CLASS'}
            </div>
          </div>
        </motion.div>

        {/* CENTER VS / MATCHMAKING RADAR EMBLEM */}
        <div className="flex flex-col items-center justify-center my-2 md:my-0 z-20">
          <motion.div 
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 220, damping: 14, delay: 0.3 }}
            className="w-20 h-20 md:w-28 md:h-28 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 flex items-center justify-center border-4 border-black shadow-[0_0_60px_rgba(168,85,247,0.9)] transform rotate-45 relative"
          >
            <span className="text-white font-black text-3xl md:text-5xl italic tracking-tighter transform -rotate-45 drop-shadow-md">
              VS
            </span>
          </motion.div>
          
          <div className="mt-4 flex items-center gap-2 text-xs font-mono text-yellow-400 font-bold uppercase tracking-widest animate-pulse">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-yellow-400" />
            <span>ESCANEANDO RED...</span>
          </div>
        </div>

        {/* PLAYER 2 (SEARCHING RIVAL) - LARGE SQUARE CONTAINER */}
        <motion.div 
          initial={{ x: 120, opacity: 0, scale: 0.9 }}
          animate={{ x: 0, opacity: 1, scale: 1 }}
          transition={{ type: 'spring', stiffness: 180, damping: 18, delay: 0.2 }}
          className="flex flex-col items-center"
        >
          {/* Header Tag */}
          <div className="flex items-center gap-2 mb-2 px-4 py-1 rounded-full bg-purple-500/20 border border-purple-400 shadow-[0_0_15px_rgba(168,85,247,0.4)]">
            <Users className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            <span className="text-[10px] md:text-xs font-mono font-black text-purple-300 uppercase tracking-widest">JUGADOR 2 (EN ESPERA)</span>
          </div>

          {/* Large Square Viewport with Holographic Radar */}
          <div className="w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 lg:w-96 lg:h-96 aspect-square rounded-2xl bg-gradient-to-b from-slate-950/90 via-purple-950/40 to-black border-4 border-dashed border-purple-500/70 shadow-[0_0_40px_rgba(168,85,247,0.4)] overflow-hidden relative flex flex-col items-center justify-center p-6 text-center">
            
            {/* Pulsing Sonar / Hologram Rings */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 rounded-full border border-purple-500/20 animate-ping" />
              <div className="w-32 h-32 rounded-full border border-purple-400/30 animate-pulse" />
              <div className="w-16 h-16 rounded-full border-2 border-purple-400/50" />
            </div>

            <div className="w-24 h-24 rounded-full bg-purple-950/80 border-2 border-purple-400 flex items-center justify-center shadow-[0_0_30px_rgba(168,85,247,0.7)] my-3 relative z-10">
              <Users className="w-12 h-12 text-purple-300 animate-pulse" />
            </div>

            <h3 className="text-xl md:text-2xl font-black uppercase tracking-wider text-purple-200 relative z-10">
              Buscando Rival...
            </h3>
            
            <div className="text-[10px] font-mono text-purple-400 mt-1 uppercase tracking-widest relative z-10">
              SLOT LIBRE EN ESPERA DE CONEXIÓN
            </div>

            <div className="mt-4 flex items-center gap-2 bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono px-3 py-1 rounded-lg relative z-10">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-purple-400" /> Matchmaking Activo
            </div>

            {/* Corner Tech Accents */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-purple-400 pointer-events-none" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-purple-400 pointer-events-none" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-purple-400 pointer-events-none" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-purple-400 pointer-events-none" />
          </div>

          {/* Name & Title placeholder */}
          <div className="mt-3 text-center">
            <h2 className="text-2xl md:text-4xl font-black italic tracking-tighter uppercase text-gray-500 transform skew-x-[-6deg]">
              ???
            </h2>
            <div className="text-xs font-mono text-gray-600 tracking-widest uppercase mt-0.5">
              OPONENTE DESCONOCIDO
            </div>
          </div>
        </motion.div>

      </div>

      {/* Footer Controls */}
      <div className="w-full py-4 bg-gradient-to-t from-black/95 to-transparent flex flex-col items-center gap-2 z-20">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono">
          <Music className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
          <span>Banda Sonora Multiplayer: <strong className="text-cyan-200">Neon Highway</strong> / Cybernetic Circuits / Unearthly Powers</span>
        </div>
        <button
          onClick={() => {
            playMenuClickSound();
            setGameMode('NORMAL');
            setGameState(GameState.MENU);
          }}
          className="px-8 py-3 bg-red-600/80 hover:bg-red-500 border border-red-400 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(239,68,68,0.6)] hover:scale-105 active:scale-95"
        >
          ← Cancelar y Volver al Menú
        </button>
        <span className="text-[10px] text-gray-400 font-mono text-center">
          * El emparejamiento de 2 jugadores en vivo se conecta automáticamente a los servidores de combate.
        </span>
      </div>
    </div>
  );
};
